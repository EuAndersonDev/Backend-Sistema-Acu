const express = require('express');
const OrderController = require('../controllers/OrderController');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

router.use(authMiddleware);

router.post('/', OrderController.createOrder);
router.get('/', OrderController.getOrders);
router.get('/:orderId', OrderController.getOrderDetails);
router.patch('/:orderId/cancel', OrderController.cancelOrder);

module.exports = router;
