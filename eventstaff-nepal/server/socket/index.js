const socketIO = (io) => {
  const onlineUsers = new Map();

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join user's room
    socket.on('join', (userId) => {
      socket.join(userId);
      onlineUsers.set(userId, socket.id);
      io.emit('onlineStatus', { userId, online: true });
      console.log(`User ${userId} joined room`);
    });

    // Send message
    socket.on('sendMessage', async (data) => {
      const { senderId, receiverId, content } = data;

      // Emit to receiver's room
      io.to(receiverId).emit('newMessage', {
        sender: senderId,
        receiver: receiverId,
        content,
        sentAt: new Date()
      });

      // Emit back to sender for confirmation
      io.to(senderId).emit('messageSent', {
        sender: senderId,
        receiver: receiverId,
        content,
        sentAt: new Date()
      });
    });

    // Typing indicator
    socket.on('typing', ({ senderId, receiverId }) => {
      io.to(receiverId).emit('userTyping', { senderId });
    });

    // Stop typing
    socket.on('stopTyping', ({ senderId, receiverId }) => {
      io.to(receiverId).emit('userStoppedTyping', { senderId });
    });

    // Get online users
    socket.on('getOnlineUsers', () => {
      io.emit('onlineUsers', Array.from(onlineUsers.keys()));
    });

    // Disconnect
    socket.on('disconnect', () => {
      let disconnectedUserId = null;
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          disconnectedUserId = userId;
          break;
        }
      }
      if (disconnectedUserId) {
        onlineUsers.delete(disconnectedUserId);
        io.emit('onlineStatus', { userId: disconnectedUserId, online: false });
      }
      console.log('User disconnected:', socket.id);
    });
  });
};

module.exports = socketIO;
