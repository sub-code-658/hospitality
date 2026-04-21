import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const location = useLocation();

  const organizerLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/post-event', label: 'Post Event', icon: '📅' },
    { path: '/events', label: 'Browse Events', icon: '🔍' },
    { path: '/messages', label: 'Messages', icon: '💬' },
    { path: '/profile', label: 'Profile', icon: '👤' }
  ];

  const workerLinks = [
    { path: '/worker-dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/events', label: 'Browse Events', icon: '🔍' },
    { path: '/messages', label: 'Messages', icon: '💬' },
    { path: '/profile', label: 'Profile', icon: '👤' }
  ];

  const links = user?.role === 'organizer' ? organizerLinks : workerLinks;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 glass-strong z-50 transform transition-transform duration-300 ease-in-out
          md:translate-x-0 md:static md:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-8">
            <span className="text-2xl">🎉</span>
            <span className="text-white font-bold text-xl gradient-text">EventStaff</span>
          </div>

          <nav className="space-y-2">
            {links.map(link => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={onClose}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300
                  ${isActive || location.pathname === link.path
                    ? 'bg-white/15 text-white shadow-lg'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                  }
                `}
              >
                <span className="text-xl">{link.icon}</span>
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;