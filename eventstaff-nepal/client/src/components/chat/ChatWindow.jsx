import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import MessageBubble from './MessageBubble';
import LoadingSpinner from '../ui/LoadingSpinner';

const ChatWindow = ({ selectedUser, messages, loading, onSendMessage }) => {
  const { user } = useAuth();
  const { socket, emitTyping, emitStopTyping } = useSocket();
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (socket) {
      socket.on('userTyping', ({ senderId }) => {
        if (senderId === selectedUser?._id) {
          setPartnerTyping(true);
        }
      });

      socket.on('userStoppedTyping', ({ senderId }) => {
        if (senderId === selectedUser?._id) {
          setPartnerTyping(false);
        }
      });
    }

    return () => {
      if (socket) {
        socket.off('userTyping');
        socket.off('userStoppedTyping');
      }
    };
  }, [socket, selectedUser]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleTyping = () => {
    if (!typing) {
      setTyping(true);
      emitTyping({ senderId: user.id, receiverId: selectedUser._id });
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(false);
      emitStopTyping({ senderId: user.id, receiverId: selectedUser._id });
    }, 3000);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    clearTimeout(typingTimeoutRef.current);
    if (typing) {
      emitStopTyping({ senderId: user.id, receiverId: selectedUser._id });
      setTyping(false);
    }

    setSending(true);
    try {
      await onSendMessage(newMessage.trim());
      setNewMessage('');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      {selectedUser && (
        <div className="p-4 border-b border-white/10 bg-white/5 flex items-center">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-primary-500/30 flex items-center justify-center">
              <span className="text-primary-200 font-semibold">
                {selectedUser.name?.charAt(0) || 'U'}
              </span>
            </div>
          </div>
          <div className="ml-3">
            <span className="font-medium text-white">{selectedUser.name}</span>
            <p className="text-xs text-white/40">
              {partnerTyping ? 'Typing...' : 'Online'}
            </p>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => (
              <MessageBubble key={msg._id || idx} message={msg} />
            ))}
            {partnerTyping && (
              <div className="flex justify-start mb-4">
                <div className="bg-white/10 px-4 py-2 rounded-2xl border border-white/10">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-white/10">
        <div className="flex gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 rounded-xl glass-input text-white placeholder-white/40"
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="glass-btn text-white px-6 py-3 rounded-xl disabled:opacity-50"
          >
            {sending ? <LoadingSpinner size="sm" /> : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;