const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Cart = sequelize.define('Cart', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  status: {
    type: DataTypes.ENUM('ACTIVE', 'COMPLETED', 'ABANDONED'),
    defaultValue: 'ACTIVE',
    allowNull: false,
  },
  totalPrice: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
    validate: {
      min: 0,
    },
  },
}, {
  tableName: 'carts',
  timestamps: true,
  indexes: [
    {
      fields: ['userId', 'status'],
      unique: true,
      where: { status: 'ACTIVE' },
      name: 'idx_user_active_cart',
    },
  ],
});

module.exports = Cart;
