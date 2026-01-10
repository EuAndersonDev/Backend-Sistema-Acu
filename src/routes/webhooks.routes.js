const express = require('express');
const { validateMercadoPagoSignature } = require('../middlewares/mercadopagoWebhook');
const PaymentController = require('../controllers/PaymentController');

const router = express.Router();

// Webhook do Mercado Pago com validação de assinatura
router.post('/mercadopago', validateMercadoPagoSignature, PaymentController.handleWebhook);

module.exports = router;
