import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('token');
      const newSocket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001', {
        auth: { token },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
        newSocket.emit('join', user.id);
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      newSocket.on('onlineUsers', (users) => {
        setOnlineUsers(users);
      });

      newSocket.on('onlineStatus', ({ userId, online }) => {
        setOnlineUsers(prev => {
          if (online && !prev.includes(userId)) {
            return [...prev, userId];
          } else if (!online) {
            return prev.filter(id => id !== userId);
          }
          return prev;
        });
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user]);

  const emitMessage = (data) => {
    if (socket) {
      socket.emit('sendMessage', data);
    }
  };

  const emitTyping = (data) => {
    if (socket) {
      socket.emit('typing', data);
    }
  };

  const emitStopTyping = (data) => {
    if (socket) {
      socket.emit('stopTyping', data);
    }
  };

  return (
    <SocketContext.Provider value={{ socket, onlineUsers, emitMessage, emitTyping, emitStopTyping }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};