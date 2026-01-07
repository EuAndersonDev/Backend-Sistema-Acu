const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');

class OrderRepository {
  async findOrderById(orderId) {
    return Order.findByPk(orderId, {
      include: [
        {
          association: 'items',
          include: ['product'],
        },
        {
          association: 'payments',
        },
      ],
    });
  }

  async findUserOrders(userId, limit = 10, offset = 0) {
    return Order.findAndCountAll({
      where: { userId },
      include: [
        {
          association: 'items',
          include: ['product'],
        },
        {
          association: 'payments',
        },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });
  }

  async createOrder(userId, cartId, totalPrice, shippingAddress, notes = null) {
    return Order.create({
      userId,
      cartId,
      totalPrice,
      shippingAddress,
      notes,
      status: 'PENDING_PAYMENT',
    });
  }

  async createOrderItems(orderId, cartItems) {
    const orderItems = cartItems.map(item => ({
      orderId,
      productId: item.productId,
      quantity: item.quantity,
      frozenPrice: item.frozenPrice,
      subtotal: item.subtotal,
    }));

    return OrderItem.bulkCreate(orderItems);
  }

  async updateOrderStatus(orderId, status) {
    return Order.update({ status }, { where: { id: orderId } });
  }

  async findOrderByIdWithPayments(orderId) {
    return Order.findByPk(orderId, {
      include: [
        {
          association: 'payments',
        },
      ],
    });
  }
}

module.exports = new OrderRepository();
