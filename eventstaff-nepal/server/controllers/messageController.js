const Message = require('../models/Message');
const User = require('../models/User');

// Get all conversations for a user
exports.getConversations = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Find all messages involving current user
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }]
    })
      .populate('sender', 'name avatar isOnline')
      .populate('receiver', 'name avatar isOnline')
      .sort({ createdAt: -1 });

    // Group by conversation partner
    const conversationsMap = new Map();

    messages.forEach(msg => {
      const partnerId = msg.sender._id.toString() === userId
        ? msg.receiver._id.toString()
        : msg.sender._id.toString();

      if (!conversationsMap.has(partnerId)) {
        const partner = msg.sender._id.toString() === userId ? msg.receiver : msg.sender;
        conversationsMap.set(partnerId, {
          partner: partner,
          lastMessage: {
            content: msg.content,
            sentAt: msg.sentAt,
            sender: msg.sender._id
          },
          unreadCount: 0
        });
      }

      // Count unread messages
      if (msg.receiver._id.toString() === userId && !msg.read) {
        const conv = conversationsMap.get(partnerId);
        conv.unreadCount++;
      }
    });

    const conversations = Array.from(conversationsMap.values())
      .sort((a, b) => new Date(b.lastMessage.sentAt) - new Date(a.lastMessage.sentAt));

    res.json(conversations);
  } catch (error) {
    next(error);
  }
};

// Get messages with a specific user
exports.getMessages = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const otherUserId = req.params.userId;

    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId }
      ]
    })
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar')
      .sort({ createdAt: 1 });

    // Mark messages as read
    await Message.updateMany(
      { sender: otherUserId, receiver: userId, read: false },
      { read: true }
    );

    res.json(messages);
  } catch (error) {
    next(error);
  }
};

// Send a message
exports.sendMessage = async (req, res, next) => {
  try {
    const senderId = req.user.id;
    const { receiverId, content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    // Check receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    const message = new Message({
      sender: senderId,
      receiver: receiverId,
      content: content.trim()
    });

    await message.save();

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar');

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(receiverId).emit('newMessage', populatedMessage);
      io.to(senderId).emit('messageSent', populatedMessage);
    }

    res.status(201).json(populatedMessage);
  } catch (error) {
    next(error);
  }
};

// Get unread count
exports.getUnreadCount = async (req, res, next) => {
  try {
    const count = await Message.countDocuments({
      receiver: req.user.id,
      read: false
    });
    res.json({ unreadCount: count });
  } catch (error) {
    next(error);
  }
};