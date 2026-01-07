const express = require('express');
const CartController = require('../controllers/CartController');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

router.use(authMiddleware);

router.get('/', CartController.getCart);
router.post('/items', CartController.addItem);
router.delete('/items/:itemId', CartController.removeItem);
router.delete('/', CartController.clearCart);

module.exports = router;
