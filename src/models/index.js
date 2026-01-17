const sequelize = require('../config/sequelize');
const User = require('./User');
const Product = require('./Product');
const Contact = require('./Contact');

const db = {
  sequelize,
  User,
  Product,
  Contact,
};

module.exports = db;


