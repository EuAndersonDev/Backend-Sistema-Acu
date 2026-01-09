const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware de autenticação que valida o Access Token
 * Protege rotas privadas verificando o token JWT no header Authorization
 */
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ 
        error: 'Token não fornecido',
        code: 'TOKEN_MISSING'
      });
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2) {
      return res.status(401).json({ 
        error: 'Erro no token',
        code: 'TOKEN_MALFORMED'
      });
    }

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) {
      return res.status(401).json({ 
        error: 'Token mal formatado',
        code: 'TOKEN_BAD_FORMAT'
      });
    }

    // Verifica o token JWT
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        // Diferencia entre token expirado e token inválido
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ 
            error: 'Token expirado',
            code: 'TOKEN_EXPIRED'
          });
        }
        
        return res.status(401).json({ 
          error: 'Token inválido',
          code: 'TOKEN_INVALID'
        });
      }

      // Previne uso de refresh token em rotas protegidas
      if (decoded.type === 'refresh') {
        return res.status(401).json({ 
          error: 'Não é permitido usar refresh token para acessar recursos',
          code: 'TOKEN_WRONG_TYPE'
        });
      }

      // Verifica se o usuário ainda existe
      const user = await User.findByPk(decoded.id, {
        attributes: ['id', 'name', 'email'],
      });

      if (!user) {
        return res.status(401).json({ 
          error: 'Usuário não encontrado',
          code: 'USER_NOT_FOUND'
        });
      }

      // Adiciona informações do usuário na requisição
      req.userId = decoded.id;
      req.user = user;

      return next();
    });
  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);
    return res.status(401).json({ 
      error: 'Erro na autenticação',
      code: 'AUTH_ERROR'
    });
  }
};

module.exports = authMiddleware;
