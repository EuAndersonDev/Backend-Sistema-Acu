const CartRepository = require('../repositories/CartRepository');
const Product = require('../models/Product');

class CartService {
  async getActiveCart(userId) {
    let cart = await CartRepository.findActiveCartByUser(userId);

    if (!cart) {
      cart = await CartRepository.createCart(userId);
    }

    return cart;
  }

  async getCartDetails(userId) {
    const cart = await this.getActiveCart(userId);
    return CartRepository.findCartById(cart.id);
  }

  async addItemToCart(userId, productId, quantity) {
    // Validar produto existe e tem estoque
    const product = await Product.findByPk(productId);
    if (!product) {
      throw new Error('Produto não encontrado');
    }

    if (product.stock < quantity) {
      throw new Error(`Estoque insuficiente. Disponível: ${product.stock}`);
    }

    // Obter carrinho ativo
    const cart = await this.getActiveCart(userId);

    // Adicionar item com preço congelado
    const frozenPrice = parseFloat(product.price);
    await CartRepository.addOrUpdateItem(cart.id, productId, quantity, frozenPrice);

    // Atualizar total do carrinho
    await CartRepository.updateCartTotal(cart.id);

    // Retornar carrinho atualizado
    return CartRepository.findCartById(cart.id);
  }

  async removeItemFromCart(userId, itemId) {
    const cart = await this.getActiveCart(userId);
    await CartRepository.removeItem(cart.id, itemId);
    await CartRepository.updateCartTotal(cart.id);

    return CartRepository.findCartById(cart.id);
  }

  async clearCart(userId) {
    const cart = await this.getActiveCart(userId);
    await CartRepository.clearCart(cart.id);
    await CartRepository.updateCartTotal(cart.id);

    return CartRepository.findCartById(cart.id);
  }

  async validateCartForCheckout(userId) {
    const cart = await this.getActiveCart(userId);

    if (!cart.items || cart.items.length === 0) {
      throw new Error('Carrinho vazio');
    }

    // Validar estoque de todos os itens
    for (const item of cart.items) {
      const product = await Product.findByPk(item.productId);
      if (product.stock < item.quantity) {
        throw new Error(`Produto "${product.name}" sem estoque suficiente`);
      }
    }

    return cart;
  }
}

module.exports = new CartService();
