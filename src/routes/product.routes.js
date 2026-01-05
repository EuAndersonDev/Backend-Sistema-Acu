const express = require('express');
const ProductController = require('../controllers/ProductController');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

// Todas as rotas de produtos são protegidas
router.use(authMiddleware);

router.get('/', ProductController.index);
router.get('/:id', ProductController.show);
router.post('/', ProductController.store);
router.put('/:id', ProductController.update);
router.delete('/:id', ProductController.destroy);

module.exports = router;
