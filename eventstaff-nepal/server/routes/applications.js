const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { auth } = require('../middleware/auth');
const { applicationValidator } = require('../utils/validators');

// Protected routes
router.post('/', auth, applicationValidator, applicationController.applyToEvent);
router.get('/my', auth, applicationController.getMyApplications);
router.get('/event/:eventId', auth, applicationController.getEventApplications);
router.get('/:id', auth, applicationController.getApplicationById);
router.put('/:id/status', auth, applicationController.updateApplicationStatus);
router.put('/:id/assign', auth, applicationController.assignWorker);

module.exports = router;