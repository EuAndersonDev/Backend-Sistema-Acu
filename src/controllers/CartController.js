const CartService = require('../services/CartService');

const getCart = async (req, res) => {
  try {
    const { userId } = req;
    const cart = await CartService.getCartDetails(userId);

    return res.json({
      success: true,
      data: cart,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Erro ao buscar carrinho',
    });
  }
};

const addItem = async (req, res) => {
  try {
    const { userId } = req;
    const { productId, quantity } = req.body;

    if (!productId || !quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        error: 'productId e quantity (>= 1) são obrigatórios',
      });
    }

    const cart = await CartService.addItemToCart(userId, productId, quantity);

    return res.json({
      success: true,
      data: cart,
      message: 'Produto adicionado ao carrinho',
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

const removeItem = async (req, res) => {
  try {
    const { userId } = req;
    const { itemId } = req.params;

    const cart = await CartService.removeItemFromCart(userId, itemId);

    return res.json({
      success: true,
      data: cart,
      message: 'Produto removido do carrinho',
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

const clearCart = async (req, res) => {
  try {
    const { userId } = req;
    const cart = await CartService.clearCart(userId);

    return res.json({
      success: true,
      data: cart,
      message: 'Carrinho limpo',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  getCart,
  addItem,
  removeItem,
  clearCart,
};
