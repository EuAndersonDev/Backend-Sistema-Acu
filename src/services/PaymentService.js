const PaymentRepository = require('../repositories/PaymentRepository');
const OrderRepository = require('../repositories/OrderRepository');
const { client, Preference, Payment: PaymentClass, MERCADO_PAGO_CONFIG, STATUS_MAPPING } = require('../config/mercado-pago');

class PaymentService {
  /**
   * Inicia pagamento no Mercado Pago
   * @param {string} orderId - ID do pedido
   * @param {string} method - Método de pagamento (CREDIT_CARD, DEBIT_CARD, PIX, BANK_TRANSFER)
   * @param {object} payerData - Dados do pagador { email, name }
   * @param {string} paymentGateway - Gateway (MERCADO_PAGO por padrão)
   */
  async initiatePayment(orderId, method, payerData = {}, paymentGateway = 'MERCADO_PAGO') {
    const order = await OrderRepository.findOrderById(orderId);

    if (!order) {
      throw new Error('Pedido não encontrado');
    }

    if (order.status !== 'PENDING_PAYMENT') {
      throw new Error('Pedido não está aguardando pagamento');
    }

    // Criar registro de pagamento
    const payment = await PaymentRepository.createPayment(
      orderId,
      order.totalPrice,
      method,
      paymentGateway,
      {
        initiatedAt: new Date(),
        payerData,
      }
    );

    try {
      // Chamar Mercado Pago
      if (paymentGateway === 'MERCADO_PAGO') {
        return await this.createMercadoPagoPayment(payment, order, payerData, method);
      }

      // Fallback para outros gateways
      return {
        id: payment.id,
        orderId: payment.orderId,
        amount: payment.amount,
        method: payment.method,
        gateway: payment.paymentGateway,
        status: payment.status,
        message: 'Pagamento criado. Configure o gateway de pagamento.',
      };
    } catch (error) {
      // Atualizar pagamento com erro
      await PaymentRepository.updatePaymentStatus(
        payment.id,
        'FAILED',
        null
      );
      throw new Error(`Erro ao processar pagamento: ${error.message}`);
    }
  }

  /**
   * Cria preferência de pagamento no Mercado Pago
   */
  async createMercadoPagoPayment(payment, order, payerData, method) {
    const preferenceData = {
      items: order.items.map(item => ({
        id: item.id,
        title: item.product.name,
        description: item.product.description || 'Produto',
        picture_url: item.product.image_url || null,
        category_id: item.product.category || 'default',
        quantity: item.quantity,
        unit_price: parseFloat(item.frozenPrice),
        currency_id: MERCADO_PAGO_CONFIG.currency,
      })),
      payer: {
        email: payerData.email || 'cliente@example.com',
        name: payerData.name || 'Cliente',
      },
      back_urls: {
        success: `${MERCADO_PAGO_CONFIG.success_url}/pedidos/${order.id}?payment=success`,
        failure: `${MERCADO_PAGO_CONFIG.failure_url}/pedidos/${order.id}?payment=failure`,
        pending: `${MERCADO_PAGO_CONFIG.failure_url}/pedidos/${order.id}?payment=pending`,
      },
      external_reference: payment.id, // ID interno para rastrear
      notification_url: MERCADO_PAGO_CONFIG.notification_url,
      statement_descriptor: `ACU STORE`,
      installments: 1,
    };

    // Adicionar dados específicos por método
    if (method === 'PIX') {
      // PIX não tem juros
      preferenceData.installments = 1;
    } else if (method === 'CREDIT_CARD') {
      // Permitir parcelamento em cartão de crédito
      preferenceData.installments = 12;
    }

    try {
      // Usar nova API v2.11.0
      const preference = new Preference(client);
      const response = await preference.create({ body: preferenceData });

      // Atualizar pagamento com ID externo do Mercado Pago
      await PaymentRepository.updatePaymentStatus(
        payment.id,
        'PROCESSING',
        response.id // preference_id é o externalId
      );

      return {
        id: payment.id,
        orderId: payment.orderId,
        amount: payment.amount,
        method: payment.method,
        gateway: payment.paymentGateway,
        status: 'PROCESSING',
        externalId: response.id,
        // Link para redirecionar o cliente
        paymentUrl: response.init_point, // URL pública
        sandboxUrl: response.sandbox_init_point, // URL sandbox
        message: 'Redirecione o cliente para o link de pagamento',
        details: {
          preferenceId: response.id,
          externalReference: payment.id,
        },
      };
    } catch (error) {
      throw new Error(`Erro ao criar preferência Mercado Pago: ${error.message}`);
    }
  }

  /**
   * Processa webhook do Mercado Pago
   * Webhook enviado quando há mudança de status de pagamento
   */
  async handleMercadoPagoWebhook(data) {
    try {
      // data.type pode ser: payment, plan, subscription
      // data.data.id é o ID do pagamento no Mercado Pago
      const { type, data: webhookData } = data;

      if (type !== 'payment') {
        return { processed: false, reason: 'Tipo de webhook não é pagamento' };
      }

      // Buscar detalhes do pagamento no Mercado Pago (API v2.11.0)
      const payment_api = new PaymentClass(client);
      const paymentDetails = await payment_api.get({ id: webhookData.id });
      const mpPaymentData = paymentDetails;

      // external_reference é o ID do nosso pagamento
      const externalReference = mpPaymentData.external_reference;

      // Encontrar pagamento no banco
      const payment = await PaymentRepository.findPaymentByExternalId(externalReference);
      if (!payment) {
        return { processed: false, reason: 'Pagamento não encontrado' };
      }

      // Mapear status do Mercado Pago para nosso status
      const status = this.mapMercadoPagoStatus(mpPaymentData.status);

      // Atualizar pagamento
      await PaymentRepository.updatePaymentByExternalId(
        externalReference,
        status,
        {
          mercadoPagoStatus: mpPaymentData.status,
          mercadoPagoId: mpPaymentData.id,
          paymentMethod: mpPaymentData.payment_method_id,
          installments: mpPaymentData.installments,
          transactionAmount: mpPaymentData.transaction_amount,
          timestamp: new Date(),
        }
      );

      // Se pagamento foi aprovado, atualizar status do pedido
      if (status === 'APPROVED') {
        await OrderRepository.updateOrderStatus(payment.orderId, 'PAID');
      } else if (status === 'DECLINED') {
        // Mantém o pedido em PENDING_PAYMENT para novo pagamento
        await OrderRepository.updateOrderStatus(payment.orderId, 'PENDING_PAYMENT');
      } else if (status === 'CANCELLED') {
        await OrderRepository.updateOrderStatus(payment.orderId, 'CANCELLED');
      }

      return {
        processed: true,
        paymentId: payment.id,
        orderId: payment.orderId,
        newStatus: status,
      };
    } catch (error) {
      throw new Error(`Erro ao processar webhook Mercado Pago: ${error.message}`);
    }
  }

  /**
   * Mapear status do Mercado Pago para nossa estrutura
   */
  mapMercadoPagoStatus(mpStatus) {
    const statusMap = {
      pending: 'PROCESSING',
      approved: 'APPROVED',
      authorized: 'PROCESSING',
      in_process: 'PROCESSING',
      in_mediation: 'PROCESSING',
      rejected: 'DECLINED',
      cancelled: 'CANCELLED',
      refunded: 'REFUNDED',
      charged_back: 'CANCELLED',
    };

    return statusMap[mpStatus] || 'PROCESSING';
  }

  /**
   * Processa webhook genérico (chamado antes para roteamento)
   */
  async handleWebhook(data) {
    // Por enquanto, assumir que é Mercado Pago
    // Pode expandir para suportar múltiplos gateways
    return await this.handleMercadoPagoWebhook(data);
  }

  /**
   * Obter status do pagamento
   */
  async getPaymentStatus(paymentId) {
    const payment = await PaymentRepository.findPaymentById(paymentId);

    if (!payment) {
      throw new Error('Pagamento não encontrado');
    }

    // Se tem externalId, buscar status atual no Mercado Pago
    if (payment.externalId && payment.paymentGateway === 'MERCADO_PAGO') {
      try {
        const payment_api = new PaymentClass(client);
        const mpPayment = await payment_api.get({ id: payment.externalId });
        const mpStatus = this.mapMercadoPagoStatus(mpPayment.status);

        return {
          ...payment.toJSON(),
          mercadoPagoStatus: mpPayment.status,
          currentStatus: mpStatus,
          paymentDetails: {
            transactionAmount: mpPayment.transaction_amount,
            installments: mpPayment.installments,
            paymentMethod: mpPayment.payment_method_id,
            paymentTypeId: mpPayment.payment_type_id,
            approvalCode: mpPayment.authorization_code,
          },
        };
      } catch (error) {
        console.error('Erro ao buscar status no Mercado Pago:', error);
        return payment;
      }
    }

    return payment;
  }

  /**
   * Reembolsar pagamento no Mercado Pago
   */
  async refundPayment(paymentId, reason = null) {
    const payment = await PaymentRepository.findPaymentById(paymentId);

    if (!payment) {
      throw new Error('Pagamento não encontrado');
    }

    if (payment.status !== 'APPROVED') {
      throw new Error('Apenas pagamentos aprovados podem ser reembolsados');
    }

    try {
      if (payment.paymentGateway === 'MERCADO_PAGO' && payment.externalId) {
        // Processar reembolso no Mercado Pago (API v2.11.0)
        const payment_api = new PaymentClass(client);
        const refund = await payment_api.refund({ 
          id: payment.externalId 
        });

        if (refund) {
          // Reembolso bem-sucedido
          await PaymentRepository.updatePaymentStatus(paymentId, 'REFUNDED');
          await OrderRepository.updateOrderStatus(payment.orderId, 'REFUNDED');

          return PaymentRepository.findPaymentById(paymentId);
        } else {
          throw new Error('Erro ao processar reembolso no Mercado Pago');
        }
      }

      // Fallback para outros gateways
      await PaymentRepository.updatePaymentStatus(paymentId, 'REFUNDED');
      return PaymentRepository.findPaymentById(paymentId);
    } catch (error) {
      throw new Error(`Erro ao reembolsar: ${error.message}`);
    }
  }

  /**
   * Obter histórico de pagamentos de um pedido
   */
  async getOrderPayments(orderId) {
    const order = await OrderRepository.findOrderByIdWithPayments(orderId);

    if (!order) {
      throw new Error('Pedido não encontrado');
    }

    return order.payments || [];
  }
}

module.exports = new PaymentService();
