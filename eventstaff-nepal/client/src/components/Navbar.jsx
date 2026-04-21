import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { useSocket } from '../context/SocketContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      fetchNotifications();
    }
  }, [user]);

  useEffect(() => {
    if (socket) {
      socket.on('newMessage', () => {
        fetchUnreadCount();
        fetchNotifications();
      });
    }
    return () => {
      if (socket) {
        socket.off('newMessage');
      }
    };
  }, [socket]);

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('/messages/unread-count');
      setUnreadCount(res.data.unreadCount);
    } catch (error) {
      console.error('Failed to fetch unread count');
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications || []);
    } catch (error) {
      console.error('Failed to fetch notifications');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 glass-strong border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <span className="text-2xl group-hover:scale-110 transition-transform duration-300">🎉</span>
              <span className="text-white font-bold text-xl gradient-text">EventStaff Nepal</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <>
                <Link
                  to={user.role === 'organizer' ? '/dashboard' : '/worker-dashboard'}
                  className="text-white/80 hover:text-white hover:bg-white/10 px-4 py-2 rounded-xl transition-all duration-300 font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  to="/events"
                  className="text-white/80 hover:text-white hover:bg-white/10 px-4 py-2 rounded-xl transition-all duration-300 font-medium"
                >
                  Browse Events
                </Link>

                {/* Notifications Bell */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-xl transition-all duration-300"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 glass-card rounded-xl overflow-hidden animate-scale-in">
                      <div className="p-4 border-b border-white/10">
                        <h3 className="font-semibold text-white">Notifications</h3>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <p className="p-4 text-center text-white/50">No notifications</p>
                        ) : (
                          notifications.map(n => (
                            <div key={n._id} className="p-4 border-b border-white/5 hover:bg-white/5">
                              <p className="text-white text-sm">{n.content}</p>
                              <p className="text-white/40 text-xs mt-1">{n.time}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <Link
                  to="/messages"
                  className="text-white/80 hover:text-white hover:bg-white/10 px-4 py-2 rounded-xl transition-all duration-300 font-medium"
                >
                  Messages
                </Link>
                <Link
                  to="/notifications"
                  className="text-white/80 hover:text-white hover:bg-white/10 px-4 py-2 rounded-xl transition-all duration-300 font-medium"
                >
                  Notifications
                </Link>
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="text-primary-300 hover:text-primary-200 hover:bg-primary-500/10 px-4 py-2 rounded-xl transition-all duration-300 font-medium border border-primary-400/30"
                  >
                    Admin
                  </Link>
                )}
                <Link
                  to="/profile"
                  className="text-white/80 hover:text-white hover:bg-white/10 px-4 py-2 rounded-xl transition-all duration-300 font-medium"
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="glass-btn text-white px-5 py-2 font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-white/80 hover:text-white hover:bg-white/10 px-4 py-2 rounded-xl transition-all duration-300 font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="glass-btn text-white px-5 py-2 font-medium"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white hover:bg-white/10 p-2 rounded-xl transition-all duration-300"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-4 pt-2 pb-4 space-y-2 glass">
          {user ? (
            <>
              <Link
                to={user.role === 'organizer' ? '/dashboard' : '/worker-dashboard'}
                className="block text-white/80 hover:text-white hover:bg-white/10 px-4 py-3 rounded-xl transition-all duration-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                to="/events"
                className="block text-white/80 hover:text-white hover:bg-white/10 px-4 py-3 rounded-xl transition-all duration-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                Browse Events
              </Link>
              <Link
                to="/messages"
                className="block text-white/80 hover:text-white hover:bg-white/10 px-4 py-3 rounded-xl transition-all duration-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                Messages {unreadCount > 0 && `(${unreadCount})`}
              </Link>
              <Link
                to="/profile"
                className="block text-white/80 hover:text-white hover:bg-white/10 px-4 py-3 rounded-xl transition-all duration-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                Profile
              </Link>
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="block text-primary-300 hover:text-primary-200 hover:bg-primary-500/10 px-4 py-3 rounded-xl transition-all duration-300"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Admin Panel
                </Link>
              )}
              <button
                onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                className="block w-full text-left text-white/80 hover:text-white hover:bg-white/10 px-4 py-3 rounded-xl transition-all duration-300"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="block text-white/80 hover:text-white hover:bg-white/10 px-4 py-3 rounded-xl transition-all duration-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="block text-white/80 hover:text-white hover:bg-white/10 px-4 py-3 rounded-xl transition-all duration-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}