const express = require('express');
const router = express.Router();
const recommendationsController = require('../controllers/recommendationsController');
const { auth } = require('../middleware/auth');

router.get('/workers/:eventId', auth, recommendationsController.getWorkerRecommendations);
router.get('/events', auth, recommendationsController.getEventRecommendations);

module.exports = router;
