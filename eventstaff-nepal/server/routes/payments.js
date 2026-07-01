const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { auth } = require('../middleware/auth');

// Initialize payment
router.post('/initialize', auth, paymentController.initializePayment);

// Verify payment (eSewa callback)
router.post('/verify', paymentController.verifyPayment);

// Payment history
router.get('/history', auth, paymentController.getPayments);

module.exports = router;
