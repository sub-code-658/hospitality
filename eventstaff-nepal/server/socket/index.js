const socketIO = (io) => {
  const onlineUsers = new Map();

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join', (userId) => {
      socket.join(userId);
      onlineUsers.set(userId, socket.id);
      io.emit('onlineStatus', { userId, online: true });
    });

    // ADD THIS HANDLER
    // This allows the server to broadcast the message to the specific receiver
    socket.on('sendMessage', (message) => {
      const { receiverId } = message;
      // Emit to the specific user's room
      io.to(receiverId).emit('newMessage', message);
    });

    socket.on('typing', ({ senderId, receiverId }) => {
      io.to(receiverId).emit('userTyping', { senderId });
    });

    socket.on('stopTyping', ({ senderId, receiverId }) => {
      io.to(receiverId).emit('userStoppedTyping', { senderId });
    });

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
    });
  });
};

module.exports = socketIO;