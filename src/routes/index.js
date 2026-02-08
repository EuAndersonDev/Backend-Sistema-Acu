const express = require('express');
const authRoutes = require('./auth.routes');
const productRoutes = require('./product.routes');
const userRoutes = require('./user.routes');
const contactRoutes = require('./contact.routes');
const webhookRoutes = require('./webhook.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/contact', contactRoutes);
router.use('/webhook', webhookRoutes);

module.exports = router;
