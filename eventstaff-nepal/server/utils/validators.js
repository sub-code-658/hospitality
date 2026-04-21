const { body, param, query } = require('express-validator');

// Auth validators
const registerValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('email')
    .isEmail().withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role')
    .isIn(['worker', 'organizer']).withMessage('Role must be worker or organizer'),
  body('skills')
    .optional()
    .isArray().withMessage('Skills must be an array'),
  body('experience')
    .optional()
    .isIn(['None', '0-1 years', '1-3 years', '3-5 years', '5+ years'])
    .withMessage('Invalid experience level')
];

const loginValidator = [
  body('email')
    .isEmail().withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
];

// Event validators
const eventValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  body('location')
    .trim()
    .notEmpty().withMessage('Location is required'),
  body('eventDate')
    .notEmpty().withMessage('Event date is required')
    .isISO8601().withMessage('Invalid date format'),
  body('startTime')
    .notEmpty().withMessage('Start time is required'),
  body('endTime')
    .notEmpty().withMessage('End time is required'),
  body('rolesNeeded')
    .isArray({ min: 1 }).withMessage('At least one role is required')
];

// Application validators
const applicationValidator = [
  body('eventId')
    .notEmpty().withMessage('Event ID is required')
    .isMongoId().withMessage('Invalid event ID'),
  body('message')
    .optional()
    .isLength({ max: 500 }).withMessage('Message cannot exceed 500 characters'),
  body('roleAppliedFor')
    .notEmpty().withMessage('Role is required')
];

// Review validators
const reviewValidator = [
  body('revieweeId')
    .notEmpty().withMessage('Reviewee ID is required')
    .isMongoId().withMessage('Invalid reviewee ID'),
  body('eventId')
    .notEmpty().withMessage('Event ID is required')
    .isMongoId().withMessage('Invalid event ID'),
  body('rating')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .isLength({ max: 500 }).withMessage('Comment cannot exceed 500 characters')
];

// Message validators
const messageValidator = [
  body('receiverId')
    .notEmpty().withMessage('Receiver ID is required')
    .isMongoId().withMessage('Invalid receiver ID'),
  body('content')
    .trim()
    .notEmpty().withMessage('Message content is required')
    .isLength({ max: 1000 }).withMessage('Message cannot exceed 1000 characters')
];

// MongoDB ID validator
const mongoIdValidator = [
  param('id')
    .isMongoId().withMessage('Invalid ID format')
];

const userIdValidator = [
  param('userId')
    .isMongoId().withMessage('Invalid user ID')
];

module.exports = {
  registerValidator,
  loginValidator,
  eventValidator,
  applicationValidator,
  reviewValidator,
  messageValidator,
  mongoIdValidator,
  userIdValidator
};