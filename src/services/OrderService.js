const OrderRepository = require('../repositories/OrderRepository');
const CartRepository = require('../repositories/CartRepository');
const CartService = require('./CartService');
const Product = require('../models/Product');

class OrderService {
  async createOrder(userId, shippingAddress, notes = null) {
    // Validar carrinho para checkout
    const cart = await CartService.validateCartForCheckout(userId);

    // Criar pedido
    const order = await OrderRepository.createOrder(
      userId,
      cart.id,
      parseFloat(cart.totalPrice),
      shippingAddress,
      notes
    );

    // Criar itens do pedido a partir do carrinho
    const cartItems = await Promise.all(
      cart.items.map(async item => ({
        ...item.dataValues,
        productId: item.productId,
      }))
    );

    await OrderRepository.createOrderItems(order.id, cartItems);

    // Atualizar status do carrinho
    await CartRepository.updateCartStatus(cart.id, 'COMPLETED');

    return OrderRepository.findOrderById(order.id);
  }

  async getUserOrders(userId, limit = 10, offset = 0) {
    return OrderRepository.findUserOrders(userId, limit, offset);
  }

  async getOrderDetails(orderId, userId = null) {
    const order = await OrderRepository.findOrderById(orderId);

    if (!order) {
      throw new Error('Pedido não encontrado');
    }

    // Verificar permissão (apenas o dono ou admin)
    if (userId && order.userId !== userId) {
      throw new Error('Acesso negado');
    }

    return order;
  }

  async processCheckoutPayment(orderId, paymentData) {
    const order = await OrderRepository.findOrderByIdWithPayments(orderId);

    if (!order) {
      throw new Error('Pedido não encontrado');
    }

    if (order.status !== 'PENDING_PAYMENT') {
      throw new Error('Pedido não está aguardando pagamento');
    }

    // Aqui você integraria com a API de pagamento
    // Por enquanto, retornamos dados para integração externa
    return {
      orderId: order.id,
      amount: order.totalPrice,
      currency: 'BRL',
      description: `Pedido ${order.id}`,
      metadata: {
        orderId: order.id,
        userId: order.userId,
      },
    };
  }

  async updateOrderStatus(orderId, status) {
    const validStatuses = ['PENDING_PAYMENT', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      throw new Error('Status inválido');
    }

    await OrderRepository.updateOrderStatus(orderId, status);
    return OrderRepository.findOrderById(orderId);
  }

  async cancelOrder(orderId) {
    const order = await OrderRepository.findOrderById(orderId);

    if (!order) {
      throw new Error('Pedido não encontrado');
    }

    if (['SHIPPED', 'DELIVERED', 'CANCELLED'].includes(order.status)) {
      throw new Error('Pedido não pode ser cancelado neste status');
    }

    return this.updateOrderStatus(orderId, 'CANCELLED');
  }
}

module.exports = new OrderService();
