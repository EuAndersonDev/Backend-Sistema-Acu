const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const User = require('./User');

const RefreshToken = sequelize.define('RefreshToken', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  token: {
    type: DataTypes.TEXT,
    allowNull: false,
    unique: true,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'expires_at',
  },
}, {
  tableName: 'refresh_tokens',
  timestamps: true,
  updatedAt: false, // Não precisamos de updatedAt para tokens
});

// Relacionamento com User
RefreshToken.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

User.hasMany(RefreshToken, {
  foreignKey: 'userId',
  as: 'refreshTokens',
});

// Método para verificar se o token expirou
RefreshToken.prototype.isExpired = function() {
  return new Date() > this.expiresAt;
};

module.exports = RefreshToken;
