const express = require('express');
const rateLimit = require('express-rate-limit');
const { sendContactMessage } = require('../controllers/ContactController');

const router = express.Router();

/**
 * Rate limiter para prevenir spam no formulário de contato
 * Limite: 5 requisições por IP a cada 10 minutos
 */
const contactRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutos
  max: 5, // Máximo de 5 requisições
  message: {
    error: 'Muitas requisições deste IP. Por favor, tente novamente em 10 minutos.'
  },
  standardHeaders: true, // Retorna informações de rate limit nos headers `RateLimit-*`
  legacyHeaders: false, // Desabilita headers `X-RateLimit-*`
  // Usar IP do usuário para identificação
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress;
  },
  // Handler customizado para quando o limite é excedido
  handler: (req, res) => {
    res.status(429).json({
      error: 'Muitas requisições deste IP. Por favor, tente novamente em 10 minutos.'
    });
  }
});

/**
 * @route   POST /
 * @desc    Envia mensagem de contato
 * @access  Public
 *
 * Observação: este router é montado em '/contact' pelo aggregator
 * em src/routes/index.js, portanto o endpoint final é:
 *   POST /api/contact
 */
router.post('/', contactRateLimiter, sendContactMessage);

module.exports = router;
