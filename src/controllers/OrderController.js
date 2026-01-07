const OrderService = require('../services/OrderService');

const createOrder = async (req, res) => {
  try {
    const { userId } = req;
    const { shippingAddress, notes } = req.body;

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        error: 'shippingAddress é obrigatório',
      });
    }

    const order = await OrderService.createOrder(userId, shippingAddress, notes);

    return res.status(201).json({
      success: true,
      data: order,
      message: 'Pedido criado com sucesso',
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

const getOrders = async (req, res) => {
  try {
    const { userId } = req;
    const { limit = 10, offset = 0 } = req.query;

    const orders = await OrderService.getUserOrders(userId, parseInt(limit), parseInt(offset));

    return res.json({
      success: true,
      data: orders.rows,
      pagination: {
        total: orders.count,
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const { userId } = req;
    const { orderId } = req.params;

    const order = await OrderService.getOrderDetails(orderId, userId);

    return res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    return res.status(error.message === 'Acesso negado' ? 403 : 404).json({
      success: false,
      error: error.message,
    });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await OrderService.cancelOrder(orderId);

    return res.json({
      success: true,
      data: order,
      message: 'Pedido cancelado',
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderDetails,
  cancelOrder,
};
