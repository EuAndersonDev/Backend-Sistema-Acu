const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const { Op } = require('sequelize');

class CartRepository {
  async findActiveCartByUser(userId) {
    return Cart.findOne({
      where: { userId, status: 'ACTIVE' },
      include: [
        {
          association: 'items',
          include: ['product'],
        },
      ],
    });
  }

  async findCartById(cartId) {
    return Cart.findByPk(cartId, {
      include: [
        {
          association: 'items',
          include: ['product'],
        },
      ],
    });
  }

  async createCart(userId) {
    return Cart.create({
      userId,
      status: 'ACTIVE',
    });
  }

  async updateCartTotal(cartId) {
    const cartItems = await CartItem.findAll({
      where: { cartId },
    });

    const totalPrice = cartItems.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);

    return Cart.update({ totalPrice }, { where: { id: cartId } });
  }

  async addOrUpdateItem(cartId, productId, quantity, frozenPrice) {
    const subtotal = (quantity * frozenPrice).toFixed(2);

    const [item] = await CartItem.findOrCreate({
      where: { cartId, productId },
      defaults: {
        quantity,
        frozenPrice,
        subtotal,
      },
    });

    if (!item.isNewRecord) {
      const newQuantity = item.quantity + quantity;
      const newSubtotal = (newQuantity * frozenPrice).toFixed(2);
      await item.update({
        quantity: newQuantity,
        frozenPrice,
        subtotal: newSubtotal,
      });
    }

    return item;
  }

  async removeItem(cartId, itemId) {
    return CartItem.destroy({
      where: { id: itemId, cartId },
    });
  }

  async clearCart(cartId) {
    return CartItem.destroy({
      where: { cartId },
    });
  }

  async updateCartStatus(cartId, status) {
    return Cart.update({ status }, { where: { id: cartId } });
  }
}

module.exports = new CartRepository();
