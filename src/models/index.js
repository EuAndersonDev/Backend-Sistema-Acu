const sequelize = require('../config/sequelize');
const User = require('./User');
const Product = require('./Product');

// Aqui você pode adicionar relacionamentos entre modelos, se necessário
// Exemplo: User.hasMany(Product);
// Product.belongsTo(User);

const db = {
  sequelize,
  User,
  Product,
};

module.exports = db;
