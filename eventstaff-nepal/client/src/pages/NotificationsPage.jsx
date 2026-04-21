import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';

export default function NotificationsPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchNotifications();
  }, [user, navigate]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications || []);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
      addToast('Failed to load notifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      setNotifications(prev =>
        prev.map(n =>
          n._id === notificationId ? { ...n, isRead: true } : n
        )
      );
    } catch (error) {
      addToast('Failed to mark as read', 'error');
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      addToast('All notifications marked as read', 'success');
    } catch (error) {
      addToast('Failed to mark all as read', 'error');
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      addToast('Notification deleted', 'success');
    } catch (error) {
      addToast('Failed to delete notification', 'error');
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.isRead;
    if (filter === 'read') return n.isRead;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8 animate-slide-up">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Notifications</h1>
          <p className="text-white/60">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="glass px-4 py-2 rounded-xl text-white hover:bg-white/10 transition-all"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {['all', 'unread', 'read'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all duration-300 ${
              filter === f
                ? 'bg-primary-500 text-white'
                : 'glass text-white/60 hover:text-white'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3 animate-fade-in">
        {filteredNotifications.length === 0 ? (
          <div className="glass-card p-12 rounded-xl text-center">
            <p className="text-white/50 text-lg">No notifications</p>
          </div>
        ) : (
          filteredNotifications.map(notification => (
            <div
              key={notification._id}
              className={`glass-card p-5 rounded-xl transition-all duration-300 hover:bg-white/5 ${
                !notification.isRead ? 'border-l-4 border-l-primary-400' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    !notification.isRead ? 'bg-primary-500/30' : 'bg-white/10'
                  }`}>
                    <span className="text-lg">
                      {notification.type === 'application' ? '📋' :
                       notification.type === 'message' ? '💬' :
                       notification.type === 'review' ? '⭐' :
                       notification.type === 'event' ? '🎪' : '🔔'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className={`text-white ${!notification.isRead ? 'font-medium' : ''}`}>
                      {notification.content}
                    </p>
                    <p className="text-white/40 text-sm mt-1">
                      {notification.time || new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!notification.isRead && (
                    <button
                      onClick={() => markAsRead(notification._id)}
                      className="text-white/50 hover:text-white text-sm"
                      title="Mark as read"
                    >
                      ✓
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification._id)}
                    className="text-white/50 hover:text-red-400 text-sm"
                    title="Delete"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}