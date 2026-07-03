const express = require('express');
const router = express.Router();
const invitationController = require('../controllers/invitationController');
const { auth } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const inviteValidator = [
  body('eventId').isMongoId().withMessage('Valid event ID is required'),
  body('workerId').isMongoId().withMessage('Valid worker ID is required'),
  body('message').optional().isLength({ max: 1000 }).withMessage('Message cannot exceed 1000 characters')
];

router.post('/', auth, inviteValidator, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation error', errors: errors.array() });
  }
  next();
}, invitationController.createInvitation);

module.exports = router;
