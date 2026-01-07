const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  orderId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'orders',
      key: 'id',
    },
  },
  externalId: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'PROCESSING', 'APPROVED', 'DECLINED', 'CANCELLED', 'REFUNDED'),
    defaultValue: 'PENDING',
    allowNull: false,
  },
  method: {
    type: DataTypes.ENUM('CREDIT_CARD', 'DEBIT_CARD', 'PAYPAL', 'BANK_TRANSFER'),
    allowNull: false,
  },
  paymentGateway: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'STRIPE',
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
  },
}, {
  tableName: 'payments',
  timestamps: true,
  indexes: [
    {
      fields: ['orderId'],
    },
    {
      fields: ['externalId'],
    },
    {
      fields: ['status'],
    },
  ],
});

module.exports = Payment;
