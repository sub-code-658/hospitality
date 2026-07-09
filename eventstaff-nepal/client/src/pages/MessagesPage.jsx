import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../services/axios";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { useToast } from "../components/Toast";
import LoadingSpinner from "../components/LoadingSpinner";

export default function MessagesPage() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const { addToast } = useToast();
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (location.state?.conversationId && conversations.length > 0) {
      const partnerId = location.state.conversationId;
      const conv = conversations.find((c) => c.partner._id === partnerId);
      if (conv && (!selectedUser || selectedUser._id !== partnerId)) {
        setSelectedUser(conv.partner);
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, [
    conversations,
    location.state,
    navigate,
    selectedUser,
    location.pathname,
  ]);

  useEffect(() => {
    if (socket) {
      socket.on("newMessage", (message) => {
        if (
          message.sender === selectedUser?._id ||
          message.sender === user.id
        ) {
          setMessages((prev) => {
            // Avoid duplicate messages if we already appended it in handleSend
            if (prev.some((m) => m._id === message._id)) return prev;
            return [...prev, message];
          });
        }
        fetchConversations();
      });

      socket.on("onlineStatus", ({ userId, online }) => {
        // handled by SocketContext onlineUsers
      });

      socket.on("onlineUsers", (users) => {
        // handled by SocketContext onlineUsers
      });

      return () => {
        socket.off("newMessage");
        socket.off("onlineStatus");
        socket.off("onlineUsers");
      };
    }
  }, [socket, selectedUser, user.id]);

  const fetchConversations = async () => {
    try {
      const res = await api.get("/messages/conversations");
      setConversations(res.data);
    } catch (error) {
      console.error("Failed to fetch conversations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser._id);
    }
  }, [selectedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async (userId) => {
    try {
      const res = await api.get(`/messages/${userId}`);
      setMessages(res.data);
    } catch (error) {
      addToast("Failed to load messages", "error");
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    setSending(true);
    try {
      const res = await api.post("/messages", {
        receiverId: selectedUser._id,
        content: newMessage.trim(),
      });
      // Append the message immediately to our local state so it feels instant
      setMessages((prev) => [...prev, res.data]);
      fetchConversations();

      setNewMessage("");
    } catch (error) {
      addToast("Failed to send message", "error");
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatTime = (date) => {
    const d = new Date(date);
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isOnline = (userId) => onlineUsers.includes(userId);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl md:text-4xl font-bold text-[color:var(--text-main)] text-[color:var(--text-primary)] mb-8 animate-slide-up">
        {t("common.messages", "Messages")}
      </h1>

      <div className="glass-card overflow-hidden h-[600px] flex animate-scale-in">
        {/* Conversations Sidebar */}
        <div className="w-80 border-r border-[color:var(--border)] flex flex-col">
          <div className="p-4 border-b border-[color:var(--border)] bg-white/5">
            <h2 className="font-semibold text-[color:var(--text-main)] text-[color:var(--text-primary)]">
              {t("common.conversations", "Conversations")}
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-[color:var(--text-main)]/50 text-[color:var(--text-primary)]/50">
                  {t("common.no_conversations_yet", "No conversations yet")}
                </p>
                <p className="text-sm text-[color:var(--text-main)]/30 text-[color:var(--text-primary)]/30 mt-1">
                  {t(
                    "common.start_chatting_with_organizers",
                    "Start chatting with organizers or workers",
                  )}
                </p>
              </div>
            ) : (
              conversations.map((conv) => {
                const partner = conv.partner;
                return (
                  <div
                    key={partner._id}
                    onClick={() => setSelectedUser(partner)}
                    className={`p-4 border-b border-white/5 cursor-pointer transition-all duration-300 ${
                      selectedUser?._id === partner._id
                        ? "bg-[color:var(--surface-raised)]"
                        : "hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-primary-500/30 flex items-center justify-center">
                          <span className="text-primary-200 font-semibold">
                            {partner.name?.charAt(0) || "U"}
                          </span>
                        </div>
                        {isOnline(partner._id) && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[color:var(--surface-raised)] rounded-full border-2 border-transparent"></div>
                        )}
                      </div>
                      <div className="ml-3 flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-[color:var(--text-main)] text-[color:var(--text-primary)] truncate">
                            {partner.name}
                          </span>
                          <span className="text-xs text-[color:var(--text-main)]/40 text-[color:var(--text-primary)]/40">
                            {conv.lastMessage &&
                              formatTime(conv.lastMessage.sentAt)}
                          </span>
                        </div>
                        <p className="text-sm text-[color:var(--text-main)]/50 text-[color:var(--text-primary)]/50 truncate">
                          {conv.lastMessage?.content || "No messages"}
                        </p>
                      </div>
                      {conv.unreadCount > 0 && (
                        <span className="ml-2 bg-primary-500 text-[color:var(--text-main)] text-[color:var(--text-primary)] text-xs px-2 py-0.5 rounded-full">
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
              <div className="p-4 border-b border-[color:var(--border)] bg-white/5 flex items-center">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-primary-500/30 flex items-center justify-center">
                    <span className="text-primary-200 font-semibold">
                      {selectedUser.name?.charAt(0) || "U"}
                    </span>
                  </div>
                  {isOnline(selectedUser._id) && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[color:var(--surface-raised)] rounded-full border-2 border-transparent"></div>
                  )}
                </div>
                <div className="ml-3">
                  <span className="font-medium text-[color:var(--text-main)] text-[color:var(--text-primary)]">
                    {selectedUser.name}
                  </span>
                  <p className="text-xs text-[color:var(--text-main)]/40 text-[color:var(--text-primary)]/40">
                    {isOnline(selectedUser._id) ? "Online" : "Offline"}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => {
                  const isOwn =
                    msg.sender?._id === user.id || msg.sender === user.id;
                  return (
                    <div
                      key={msg._id || idx}
                      className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                          isOwn
                            ? "bg-primary-500/80 text-[color:var(--text-main)] text-[color:var(--text-primary)] rounded-br-none"
                            : "bg-[color:var(--surface-raised)] text-[color:var(--text-main)]/90 text-[color:var(--text-primary)]/90 rounded-bl-none border border-[color:var(--border)]"
                        }`}
                      >
                        <p>{msg.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            isOwn
                              ? "text-[color:var(--text-main)]/60 text-[color:var(--text-primary)]/60"
                              : "text-[color:var(--text-main)]/40 text-[color:var(--text-primary)]/40"
                          }`}
                        >
                          {formatTime(msg.sentAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form
                onSubmit={handleSend}
                className="p-4 border-t border-[color:var(--border)]"
              >
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={t(
                      "common.type_a_message",
                      "Type a message...",
                    )}
                    className="flex-1 px-4 py-3 rounded-xl glass-input text-[color:var(--text-main)] text-[color:var(--text-primary)] placeholder-white/40"
                  />
                  <button
                    type="submit"
                    disabled={sending || !newMessage.trim()}
                    className="btn-glass px-6 py-3 rounded-xl disabled:opacity-50"
                  >
                    {sending ? <LoadingSpinner size="sm" /> : "Send"}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-xl text-[color:var(--text-main)]/50 text-[color:var(--text-primary)]/50 mb-2">
                  {t("common.select_a_conversation", "Select a conversation")}
                </p>
                <p className="text-sm text-[color:var(--text-main)]/30 text-[color:var(--text-primary)]/30">
                  Choose from your existing conversations or start a new one
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
