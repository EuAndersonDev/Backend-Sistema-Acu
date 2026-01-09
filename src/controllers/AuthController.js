const jwt = require('jsonwebtoken');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const { Op } = require('sequelize');

/**
 * Gera um Access Token JWT
 * @param {string} userId - ID do usuário
 * @returns {string} Access Token
 */
const generateAccessToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' }
  );
};

/**
 * Gera um Refresh Token JWT
 * @param {string} userId - ID do usuário
 * @returns {string} Refresh Token
 */
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId, type: 'refresh' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
};

/**
 * Salva o Refresh Token no banco de dados
 * @param {string} userId - ID do usuário
 * @param {string} token - Refresh Token
 * @returns {Promise<RefreshToken>}
 */
const saveRefreshToken = async (userId, token) => {
  // Decodifica o token para obter a data de expiração
  const decoded = jwt.decode(token);
  const expiresAt = new Date(decoded.exp * 1000);

  // Deleta tokens antigos do usuário (opcional - limita a 5 tokens por usuário)
  const userTokens = await RefreshToken.findAll({
    where: { userId },
    order: [['createdAt', 'DESC']],
  });

  if (userTokens.length >= 5) {
    // Remove os tokens mais antigos
    const tokensToDelete = userTokens.slice(4);
    await RefreshToken.destroy({
      where: {
        id: { [Op.in]: tokensToDelete.map(t => t.id) },
      },
    });
  }

  // Salva o novo refresh token
  return await RefreshToken.create({
    userId,
    token,
    expiresAt,
  });
};

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    const userExists = await User.findOne({ where: { email } });

    if (userExists) {
      return res.status(400).json({ error: 'Usuário já existe' });
    }

    const user = await User.create({ name, email, password });

    return res.status(201).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      message: 'Usuário criado com sucesso. Faça login para obter o token.',
    });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    return res.status(500).json({ error: 'Erro ao criar usuário' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validação dos campos
    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    // Busca o usuário
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Valida a senha
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Gera os tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Salva o refresh token no banco de dados
    await saveRefreshToken(user.id, refreshToken);

    return res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    return res.status(500).json({ error: 'Erro ao fazer login' });
  }
};

/**
 * Renova o Access Token usando um Refresh Token válido
 */
const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    // Valida se o refresh token foi enviado
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token é obrigatório' });
    }

    // Verifica a assinatura do JWT
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Refresh token expirado' });
      }
      return res.status(401).json({ error: 'Refresh token inválido' });
    }

    // Verifica se é realmente um refresh token
    if (decoded.type !== 'refresh') {
      return res.status(401).json({ error: 'Token inválido - use um refresh token' });
    }

    // Verifica se o token existe no banco de dados
    const tokenRecord = await RefreshToken.findOne({
      where: { token: refreshToken },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email'],
      }],
    });

    if (!tokenRecord) {
      return res.status(401).json({ error: 'Refresh token não encontrado ou revogado' });
    }

    // Verifica se o token está expirado
    if (tokenRecord.isExpired()) {
      await tokenRecord.destroy();
      return res.status(401).json({ error: 'Refresh token expirado' });
    }

    // Gera um novo access token
    const newAccessToken = generateAccessToken(decoded.id);

    return res.json({
      accessToken: newAccessToken,
      user: tokenRecord.user,
    });
  } catch (error) {
    console.error('Erro ao renovar token:', error);
    return res.status(500).json({ error: 'Erro ao renovar token' });
  }
};

/**
 * Faz logout do usuário revogando o Refresh Token
 */
const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    // Valida se o refresh token foi enviado
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token é obrigatório' });
    }

    // Busca e deleta o token do banco de dados
    const deleted = await RefreshToken.destroy({
      where: { token: refreshToken },
    });

    if (deleted === 0) {
      return res.status(404).json({ error: 'Refresh token não encontrado' });
    }

    return res.json({ message: 'Logout realizado com sucesso' });
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    return res.status(500).json({ error: 'Erro ao fazer logout' });
  }
};

/**
 * Logout de todos os dispositivos (revoga todos os refresh tokens do usuário)
 */
const logoutAll = async (req, res) => {
  try {
    const userId = req.userId; // Obtido do middleware de autenticação

    // Deleta todos os refresh tokens do usuário
    await RefreshToken.destroy({
      where: { userId },
    });

    return res.json({ message: 'Logout de todos os dispositivos realizado com sucesso' });
  } catch (error) {
    console.error('Erro ao fazer logout de todos os dispositivos:', error);
    return res.status(500).json({ error: 'Erro ao fazer logout de todos os dispositivos' });
  }
};

const me = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: ['id', 'name', 'email', 'createdAt'],
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    return res.json(user);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  logoutAll,
  me,
};

