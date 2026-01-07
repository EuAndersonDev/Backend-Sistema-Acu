const PaymentService = require('../services/PaymentService');

const initiatePayment = async (req, res) => {
  try {
    const { orderId, method, payerData } = req.body;

    if (!orderId || !method) {
      return res.status(400).json({
        success: false,
        error: 'orderId e method são obrigatórios',
      });
    }

    // Métodos suportados
    const supportedMethods = ['CREDIT_CARD', 'DEBIT_CARD', 'PIX', 'BANK_TRANSFER'];
    if (!supportedMethods.includes(method)) {
      return res.status(400).json({
        success: false,
        error: `Método inválido. Suportados: ${supportedMethods.join(', ')}`,
      });
    }

    const payment = await PaymentService.initiatePayment(
      orderId,
      method,
      payerData,
      'MERCADO_PAGO'
    );

    return res.status(201).json({
      success: true,
      data: payment,
      message: 'Pagamento iniciado com sucesso',
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

const handleWebhook = async (req, res) => {
  try {
    const data = req.body;

    // Validações básicas do webhook
    if (!data || (!data.type && !data.id)) {
      return res.status(400).json({
        success: false,
        error: 'Webhook inválido',
      });
    }

    const result = await PaymentService.handleWebhook(data);

    return res.json({
      success: true,
      data: result,
      message: 'Webhook processado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    // Retornar 200 mesmo com erro para o Mercado Pago não enviar novamente
    return res.status(200).json({
      success: false,
      error: error.message,
      message: 'Webhook recebido mas com erro no processamento',
    });
  }
};

const getPaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await PaymentService.getPaymentStatus(paymentId);

    return res.json({
      success: true,
      data: payment,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      error: error.message,
    });
  }
};

const refundPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { reason } = req.body;

    const payment = await PaymentService.refundPayment(paymentId, reason);

    return res.json({
      success: true,
      data: payment,
      message: 'Pagamento reembolsado com sucesso',
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

const getOrderPayments = async (req, res) => {
  try {
    const { orderId } = req.params;

    const payments = await PaymentService.getOrderPayments(orderId);

    return res.json({
      success: true,
      data: payments,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  initiatePayment,
  handleWebhook,
  getPaymentStatus,
  refundPayment,
  getOrderPayments,
};
