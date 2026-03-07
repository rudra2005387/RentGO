const express = require('express');
const paymentController = require('../controllers/payment.controller');
const { verifyToken } = require('../middleware/auth.middleware');

const router = express.Router();

// All routes require authentication
router.post('/checkout', verifyToken, paymentController.createCheckoutSession);
router.get('/', verifyToken, paymentController.getPayments);
router.get('/:id', verifyToken, paymentController.getPaymentDetails);
router.post('/:id/refund', verifyToken, paymentController.requestRefund);

// Note: Webhook route is registered directly in app.js (needs raw body)

module.exports = router;
