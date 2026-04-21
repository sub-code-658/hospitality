const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { auth } = require('../middleware/auth');
const { messageValidator } = require('../utils/validators');

// Protected routes
router.get('/conversations', auth, messageController.getConversations);
router.get('/unread-count', auth, messageController.getUnreadCount);
router.get('/:userId', auth, messageController.getMessages);
router.post('/', auth, messageValidator, messageController.sendMessage);

module.exports = router;