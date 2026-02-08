const express = require('express');
const ProductController = require('../controllers/ProductController');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

// Todas as rotas de produtos são protegidas
router.use(authMiddleware);

router.get('/', ProductController.index);
router.get('/:ml_id', ProductController.show);

module.exports = router;
