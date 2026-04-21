const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { auth } = require('../middleware/auth');
const { eventValidator } = require('../utils/validators');

// Public routes
router.get('/', eventController.getAllEvents);
router.get('/:id', eventController.getEventById);

// Protected routes
router.get('/organizer/my-events', auth, eventController.getOrganizerEvents);
router.post('/', auth, eventValidator, eventController.createEvent);
router.put('/:id', auth, eventController.updateEvent);
router.delete('/:id', auth, eventController.deleteEvent);

module.exports = router;