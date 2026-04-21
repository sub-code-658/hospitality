import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';

export default function MessagesPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    fetchConversations();
    setupSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser._id);
    }
  }, [selectedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const setupSocket = () => {
    const token = localStorage.getItem('token');
    socketRef.current = io('http://localhost:5001', {
      auth: { token }
    });

    socketRef.current.on('connect', () => {
      socketRef.current.emit('join', user.id);
    });

    socketRef.current.on('newMessage', (message) => {
      if (message.sender === selectedUser?.id || message.sender === user.id) {
        setMessages(prev => [...prev, message]);
      }
      fetchConversations();
    });

    socketRef.current.on('onlineStatus', ({ userId, online }) => {
      setOnlineUsers(prev => {
        if (online && !prev.includes(userId)) {
          return [...prev, userId];
        } else if (!online) {
          return prev.filter(id => id !== userId);
        }
        return prev;
      });
    });

    socketRef.current.on('onlineUsers', (users) => {
      setOnlineUsers(users);
    });
  };

  const fetchConversations = async () => {
    try {
      const res = await api.get('/messages/conversations');
      setConversations(res.data);
    } catch (error) {
      console.error('Failed to fetch conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const res = await api.get(`/messages/${userId}`);
      setMessages(res.data);
    } catch (error) {
      addToast('Failed to load messages', 'error');
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    setSending(true);
    try {
      socketRef.current.emit('sendMessage', {
        senderId: user.id,
        receiverId: selectedUser._id,
        content: newMessage.trim()
      });

      setNewMessage('');
    } catch (error) {
      addToast('Failed to send message', 'error');
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (date) => {
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const isOnline = (userId) => onlineUsers.includes(userId);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-8 animate-slide-up">Messages</h1>

      <div className="glass-card overflow-hidden h-[600px] flex animate-scale-in">
        {/* Conversations Sidebar */}
        <div className="w-80 border-r border-white/10 flex flex-col">
          <div className="p-4 border-b border-white/10 bg-white/5">
            <h2 className="font-semibold text-white">Conversations</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-white/50">No conversations yet</p>
                <p className="text-sm text-white/30 mt-1">Start chatting with organizers or workers</p>
              </div>
            ) : (
              conversations.map((conv) => {
                const partner = conv.partner;
                return (
                  <div
                    key={partner._id}
                    onClick={() => setSelectedUser(partner)}
                    className={`p-4 border-b border-white/5 cursor-pointer transition-all duration-300 ${
                      selectedUser?._id === partner._id ? 'bg-white/10' : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-primary-500/30 flex items-center justify-center">
                          <span className="text-primary-200 font-semibold">
                            {partner.name?.charAt(0) || 'U'}
                          </span>
                        </div>
                        {isOnline(partner._id) && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-transparent"></div>
                        )}
                      </div>
                      <div className="ml-3 flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-white truncate">{partner.name}</span>
                          <span className="text-xs text-white/40">
                            {conv.lastMessage && formatTime(conv.lastMessage.sentAt)}
                          </span>
                        </div>
                        <p className="text-sm text-white/50 truncate">
                          {conv.lastMessage?.content || 'No messages'}
                        </p>
                      </div>
                      {conv.unreadCount > 0 && (
                        <span className="ml-2 bg-primary-500 text-white text-xs px-2 py-0.5 rounded-full">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-white/10 bg-white/5 flex items-center">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-primary-500/30 flex items-center justify-center">
                    <span className="text-primary-200 font-semibold">
                      {selectedUser.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  {isOnline(selectedUser._id) && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-transparent"></div>
                  )}
                </div>
                <div className="ml-3">
                  <span className="font-medium text-white">{selectedUser.name}</span>
                  <p className="text-xs text-white/40">
                    {isOnline(selectedUser._id) ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => {
                  const isOwn = msg.sender?._id === user.id || msg.sender === user.id;
                  return (
                    <div
                      key={msg._id || idx}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                          isOwn
                            ? 'bg-primary-500/80 text-white rounded-br-none'
                            : 'bg-white/10 text-white/90 rounded-bl-none border border-white/10'
                        }`}
                      >
                        <p>{msg.content}</p>
                        <p className={`text-xs mt-1 ${
                          isOwn ? 'text-white/60' : 'text-white/40'
                        }`}>
                          {formatTime(msg.sentAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSend} className="p-4 border-t border-white/10">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
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
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-xl text-white/50 mb-2">Select a conversation</p>
                <p className="text-sm text-white/30">Choose from your existing conversations or start a new one</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}