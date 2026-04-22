import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { useSocket } from '../context/SocketContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notifsRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      fetchNotifications();
    }
  }, [user]);

  useEffect(() => {
    if (socket) {
      socket.on('newMessage', () => { fetchUnreadCount(); fetchNotifications(); });
    }
    return () => { if (socket) socket.off('newMessage'); };
  }, [socket]);

  useEffect(() => {
    const handleClick = (e) => {
      if (notifsRef.current && !notifsRef.current.contains(e.target)) setShowNotifs(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('/messages/unread-count');
      setUnreadCount(res.data.unreadCount);
    } catch {}
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications || []);
    } catch {}
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const NavLink = ({ to, children, className = '' }) => (
    <Link
      to={to}
      className={`text-xs font-semibold tracking-widest uppercase transition-colors duration-200 ${className}`}
      style={{ color: 'var(--text-muted)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
      onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
    >
      {children}
    </Link>
  );

  return (
    <nav
      className="sticky top-0 z-50"
      style={{
        background: 'rgba(6, 9, 18, 0.92)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <span
              style={{
                color: 'var(--flame)',
                fontSize: '1.1rem',
                lineHeight: 1,
                transition: 'transform 0.3s ease',
              }}
              className="group-hover:rotate-45 inline-block transition-transform duration-300"
            >
              ◆
            </span>
            <span
              className="font-serif text-xl tracking-tight"
              style={{ color: 'var(--text)', fontWeight: 500 }}
            >
              EventStaff{' '}
              <span style={{ color: 'var(--flame)', fontStyle: 'italic' }}>Nepal</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {user ? (
              <>
                <NavLink to={user.role === 'organizer' ? '/dashboard' : '/worker-dashboard'}>
                  Dashboard
                </NavLink>
                <NavLink to="/events">Browse</NavLink>

                {/* Notifications */}
                <div className="relative" ref={notifsRef}>
                  <button
                    onClick={() => setShowNotifs(v => !v)}
                    className="relative p-2 rounded-md transition-colors duration-200"
                    style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                  >
                    <svg className="w-4.5 h-4.5" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {unreadCount > 0 && (
                      <span
                        className="absolute -top-0.5 -right-0.5 flex items-center justify-center rounded-full text-white font-bold"
                        style={{ width: 16, height: 16, fontSize: '0.6rem', background: 'var(--flame)' }}
                      >
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifs && (
                    <div
                      className="absolute right-0 mt-2.5 w-80 rounded-lg overflow-hidden animate-scale-in"
                      style={{
                        background: 'var(--surface-raised)',
                        border: '1px solid var(--border)',
                        boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
                      }}
                    >
                      <div className="px-5 py-3.5 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
                        <span className="label text-[0.65rem]">Notifications</span>
                        <Link to="/notifications" className="text-xs" style={{ color: 'var(--flame)' }} onClick={() => setShowNotifs(false)}>
                          View all
                        </Link>
                      </div>
                      <div className="max-h-72 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <p className="p-5 text-center text-xs" style={{ color: 'var(--text-dim)' }}>No new notifications</p>
                        ) : (
                          notifications.slice(0, 6).map(n => (
                            <div
                              key={n._id}
                              className="px-5 py-3.5 cursor-default transition-colors duration-150"
                              style={{ borderBottom: '1px solid var(--border)' }}
                              onMouseEnter={e => e.currentTarget.style.background = 'rgba(232, 104, 30, 0.04)'}
                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                              <p className="text-sm leading-snug" style={{ color: 'var(--text)' }}>{n.content}</p>
                              <p className="text-xs mt-1" style={{ color: 'var(--text-dim)' }}>{n.time}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Messages */}
                <Link
                  to="/messages"
                  className="relative p-2 rounded-md transition-colors duration-200"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  {unreadCount > 0 && (
                    <span
                      className="absolute -top-0.5 -right-0.5 rounded-full"
                      style={{ width: 7, height: 7, background: 'var(--flame)' }}
                    />
                  )}
                </Link>

                {user?.role === 'admin' && (
                  <NavLink
                    to="/admin"
                    className=""
                    style={{ color: 'var(--gold)' }}
                  >
                    Admin
                  </NavLink>
                )}

                {/* User avatar menu */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(v => !v)}
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors duration-200"
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(232, 104, 30, 0.07)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold"
                      style={{
                        background: 'rgba(232, 104, 30, 0.15)',
                        border: '1px solid rgba(232, 104, 30, 0.25)',
                        color: 'var(--flame-light)',
                        fontFamily: 'Plus Jakarta Sans, sans-serif',
                      }}
                    >
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <span className="text-xs font-medium hidden lg:block" style={{ color: 'var(--text)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                      {user?.name?.split(' ')[0]}
                    </span>
                    <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-dim)' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showUserMenu && (
                    <div
                      className="absolute right-0 mt-2 w-44 rounded-lg overflow-hidden animate-scale-in"
                      style={{
                        background: 'var(--surface-raised)',
                        border: '1px solid var(--border)',
                        boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
                      }}
                    >
                      <Link
                        to="/profile"
                        className="flex items-center gap-2.5 px-4 py-3 text-xs font-medium uppercase tracking-widest transition-colors duration-150"
                        style={{ color: 'var(--text-muted)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(232, 104, 30, 0.06)'; e.currentTarget.style.color = 'var(--text)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                        onClick={() => setShowUserMenu(false)}
                      >
                        Profile
                      </Link>
                      <div style={{ height: 1, background: 'var(--border)' }} />
                      <button
                        onClick={() => { handleLogout(); setShowUserMenu(false); }}
                        className="flex items-center gap-2.5 w-full text-left px-4 py-3 text-xs font-medium uppercase tracking-widest transition-colors duration-150"
                        style={{ color: 'var(--crimson)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(204, 59, 59, 0.07)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <NavLink to="/login">Sign In</NavLink>
                <Link to="/register" className="btn-primary px-5 py-2.5 text-xs">
                  Join Now
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-md transition-colors duration-200"
            style={{ color: 'var(--text-muted)' }}
            onClick={() => setMobileOpen(v => !v)}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className="md:hidden overflow-hidden transition-all duration-300"
        style={{
          maxHeight: mobileOpen ? '400px' : '0',
          opacity: mobileOpen ? 1 : 0,
          background: 'rgba(6, 9, 18, 0.97)',
          borderTop: mobileOpen ? '1px solid var(--border)' : 'none',
        }}
      >
        <div className="px-4 py-4 flex flex-col gap-1">
          {user ? (
            <>
              {[
                { to: user.role === 'organizer' ? '/dashboard' : '/worker-dashboard', label: 'Dashboard' },
                { to: '/events', label: 'Browse Events' },
                { to: '/messages', label: `Messages${unreadCount > 0 ? ` (${unreadCount})` : ''}` },
                { to: '/profile', label: 'Profile' },
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-3 rounded-md text-xs font-semibold uppercase tracking-widest transition-colors duration-150"
                  style={{ color: 'var(--text-muted)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(232, 104, 30, 0.06)'; e.currentTarget.style.color = 'var(--text)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                >
                  {label}
                </Link>
              ))}
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-3 rounded-md text-xs font-semibold uppercase tracking-widest"
                  style={{ color: 'var(--gold)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                >
                  Admin Panel
                </Link>
              )}
              <button
                onClick={() => { handleLogout(); setMobileOpen(false); }}
                className="text-left px-3 py-3 rounded-md text-xs font-semibold uppercase tracking-widest transition-colors duration-150 mt-2"
                style={{ color: 'var(--crimson)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(204, 59, 59, 0.07)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMobileOpen(false)} className="px-3 py-3 text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                Sign In
              </Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary text-center mt-2">
                Join Now
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
