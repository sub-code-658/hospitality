const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { auth } = require('../middleware/auth');
const { reviewValidator } = require('../utils/validators');

// Public routes
router.get('/user/:userId', reviewController.getUserReviews);
router.get('/event/:eventId', reviewController.getEventReviews);

// Protected routes
router.post('/', auth, reviewValidator, reviewController.createReview);

module.exports = router;