const crypto = require('crypto');
const { MERCADO_PAGO_CONFIG } = require('../config/mercado-pago');

/**
 * Valida assinatura HMAC SHA256 do webhook do Mercado Pago.
 * Usa o corpo bruto (rawBody) capturado pelo express.json verify.
 * Compara com cabeçalho 'x-signature' (aceita prefixo 'sha256=').
 */
function validateMercadoPagoSignature(req, res, next) {
  try {
    const secret = MERCADO_PAGO_CONFIG.webhook_secret;
    if (!secret) {
      return res.status(400).json({
        success: false,
        error: 'MP_WEBHOOK_SECRET não configurado',
      });
    }

    const signatureHeader = req.headers['x-signature'] || req.headers['x-hub-signature'] || req.headers['x-mercadopago-signature'];
    const requestId = req.headers['x-request-id'] || null;

    if (!signatureHeader) {
      return res.status(401).json({ success: false, error: 'Assinatura ausente' });
    }

    const raw = req.rawBody || Buffer.from(JSON.stringify(req.body || {}));
    const expected = crypto.createHmac('sha256', secret).update(raw).digest('hex');

    // Suporta formato 'sha256=abcdef...'
    const provided = (signatureHeader.startsWith('sha256=') ? signatureHeader.slice(7) : signatureHeader).toLowerCase();

    if (expected !== provided) {
      return res.status(401).json({
        success: false,
        error: 'Assinatura inválida',
        requestId,
      });
    }

    // OK
    return next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Falha ao validar assinatura' });
  }
}

module.exports = {
  validateMercadoPagoSignature,
};
