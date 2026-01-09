const sequelize = require('../config/sequelize');
const User = require('./User');
const Product = require('./Product');
const Cart = require('./Cart');
const CartItem = require('./CartItem');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Payment = require('./Payment');
const RefreshToken = require('./RefreshToken');

// Relacionamentos Cart
Cart.hasMany(CartItem, {
  foreignKey: 'cartId',
  as: 'items',
  onDelete: 'CASCADE',
});
CartItem.belongsTo(Cart, {
  foreignKey: 'cartId',
  as: 'cart',
});

CartItem.belongsTo(Product, {
  foreignKey: 'productId',
  as: 'product',
});
Product.hasMany(CartItem, {
  foreignKey: 'productId',
});

User.hasMany(Cart, {
  foreignKey: 'userId',
  as: 'carts',
});
Cart.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

// Relacionamentos Order
User.hasMany(Order, {
  foreignKey: 'userId',
  as: 'orders',
});
Order.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

Order.hasMany(OrderItem, {
  foreignKey: 'orderId',
  as: 'items',
  onDelete: 'CASCADE',
});
OrderItem.belongsTo(Order, {
  foreignKey: 'orderId',
  as: 'order',
});

OrderItem.belongsTo(Product, {
  foreignKey: 'productId',
  as: 'product',
});
Product.hasMany(OrderItem, {
  foreignKey: 'productId',
});

Cart.hasMany(Order, {
  foreignKey: 'cartId',
});
Order.belongsTo(Cart, {
  foreignKey: 'cartId',
  as: 'cart',
});

// Relacionamentos Payment
Order.hasMany(Payment, {
  foreignKey: 'orderId',
  as: 'payments',
  onDelete: 'CASCADE',
});
Payment.belongsTo(Order, {
  foreignKey: 'orderId',
  as: 'order',
});

// Relacionamentos RefreshToken (já definidos no modelo RefreshToken.js)
// Apenas importamos aqui para garantir que as associações sejam carregadas

const db = {
  sequelize,
  User,
  Product,
  Cart,
  CartItem,
  Order,
  OrderItem,
  Payment,
  RefreshToken,
};

module.exports = db;


