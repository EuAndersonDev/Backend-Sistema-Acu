const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Armazena refresh tokens em memória para evitar dependência de tabela dedicada
const refreshTokenStore = new Map();

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

// Helpers de refresh tokens em memória
const registerRefreshToken = (userId, token) => {
  const decoded = jwt.decode(token);
  const expiresAt = decoded?.exp ? new Date(decoded.exp * 1000) : null;
  refreshTokenStore.set(token, { userId, expiresAt });
};

const isRefreshTokenValid = (token, userId) => {
  const entry = refreshTokenStore.get(token);
  if (!entry || entry.userId !== userId) {
    return false;
  }

  if (entry.expiresAt && entry.expiresAt < new Date()) {
    refreshTokenStore.delete(token);
    return false;
  }

  return true;
};

const revokeRefreshToken = (token) => {
  refreshTokenStore.delete(token);
};

const revokeAllUserTokens = (userId) => {
  for (const [storedToken, data] of refreshTokenStore.entries()) {
    if (data.userId === userId) {
      refreshTokenStore.delete(storedToken);
    }
  }
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

    // Armazena o refresh token em memória
    registerRefreshToken(user.id, refreshToken);

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

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token é obrigatório' });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        revokeRefreshToken(refreshToken);
        return res.status(401).json({ error: 'Refresh token expirado' });
      }
      return res.status(401).json({ error: 'Refresh token inválido' });
    }

    if (decoded.type !== 'refresh') {
      return res.status(401).json({ error: 'Token inválido - use um refresh token' });
    }

    if (!isRefreshTokenValid(refreshToken, decoded.id)) {
      return res.status(401).json({ error: 'Refresh token não encontrado ou revogado' });
    }

    const user = await User.findByPk(decoded.id, {
      attributes: ['id', 'name', 'email'],
    });

    if (!user) {
      revokeRefreshToken(refreshToken);
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const newAccessToken = generateAccessToken(decoded.id);

    return res.json({
      accessToken: newAccessToken,
      user,
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

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token é obrigatório' });
    }

    if (!refreshTokenStore.has(refreshToken)) {
      return res.status(404).json({ error: 'Refresh token não encontrado' });
    }

    revokeRefreshToken(refreshToken);

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
    const userId = req.userId;

    revokeAllUserTokens(userId);

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

