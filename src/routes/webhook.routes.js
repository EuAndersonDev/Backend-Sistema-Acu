const express = require('express');
const WebhookController = require('../controllers/WebhookController');

const router = express.Router();

router.post('/ml-notification', WebhookController.mlNotification);

module.exports = router;
