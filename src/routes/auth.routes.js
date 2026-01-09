const express = require('express');
const AuthController = require('../controllers/AuthController');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

// ========================================
// Rotas Públicas (Não requerem autenticação)
// ========================================

/**
 * POST /api/auth/register
 * Registra um novo usuário
 * Body: { name, email, password }
 */
router.post('/register', AuthController.register);

/**
 * POST /api/auth/login
 * Autentica usuário e retorna access token + refresh token
 * Body: { email, password }
 * Response: { accessToken, refreshToken, user }
 */
router.post('/login', AuthController.login);

/**
 * POST /api/auth/refresh
 * Renova o access token usando um refresh token válido
 * Body: { refreshToken }
 * Response: { accessToken, user }
 */
router.post('/refresh', AuthController.refresh);

/**
 * POST /api/auth/logout
 * Revoga um refresh token (logout de um dispositivo)
 * Body: { refreshToken }
 * Response: { message }
 */
router.post('/logout', AuthController.logout);

// ========================================
// Rotas Protegidas (Requerem access token)
// ========================================

/**
 * GET /api/auth/me
 * Retorna informações do usuário autenticado
 * Header: Authorization: Bearer {accessToken}
 * Response: { id, name, email, createdAt }
 */
router.get('/me', authMiddleware, AuthController.me);

/**
 * POST /api/auth/logout-all
 * Revoga todos os refresh tokens do usuário (logout de todos os dispositivos)
 * Header: Authorization: Bearer {accessToken}
 * Response: { message }
 */
router.post('/logout-all', authMiddleware, AuthController.logoutAll);

module.exports = router;
