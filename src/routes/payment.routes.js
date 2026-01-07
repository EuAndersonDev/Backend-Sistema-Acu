const express = require('express');
const PaymentController = require('../controllers/PaymentController');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

// Webhook do Mercado Pago - NÃO requer autenticação
// Mercado Pago envia POST para notificar mudanças de status
router.post('/webhook', PaymentController.handleWebhook);

// Rotas protegidas - requerem JWT
router.use(authMiddleware);

// Iniciar pagamento
router.post('/', PaymentController.initiatePayment);

// Obter status do pagamento
router.get('/:paymentId', PaymentController.getPaymentStatus);

// Reembolsar pagamento
router.post('/:paymentId/refund', PaymentController.refundPayment);

// Obter histórico de pagamentos de um pedido
router.get('/order/:orderId', PaymentController.getOrderPayments);

module.exports = router;
