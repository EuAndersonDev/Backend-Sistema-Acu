const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

// Armazena mensagens enviadas pelo formulário de contato
const Contact = sequelize.define('Contact', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true,
    },
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
}, {
  tableName: 'contacts',
  timestamps: true,
});

module.exports = Contact;
