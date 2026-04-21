import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';
import Badge from '../components/ui/Badge';

export default function AdminPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalWorkers: 0,
    totalOrganizers: 0,
    totalEvents: 0,
    activeEvents: 0,
    totalApplications: 0,
    pendingApplications: 0,
    totalRevenue: 0
  });
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, eventsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/events')
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data.users || []);
      setEvents(eventsRes.data.events || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
      addToast('Failed to load admin data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyUser = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/verify`);
      addToast('User verified successfully', 'success');
      fetchDashboardData();
    } catch (error) {
      addToast('Failed to verify user', 'error');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      addToast('User deleted successfully', 'success');
      fetchDashboardData();
    } catch (error) {
      addToast('Failed to delete user', 'error');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await api.delete(`/admin/events/${eventId}`);
      addToast('Event deleted successfully', 'success');
      fetchDashboardData();
    } catch (error) {
      addToast('Failed to delete event', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8 animate-slide-up">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-white/60">Manage users, events, and platform analytics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="glass-card p-5 rounded-xl animate-scale-in">
          <div className="text-3xl font-bold text-white mb-1">{stats.totalUsers}</div>
          <div className="text-white/50 text-sm">Total Users</div>
        </div>
        <div className="glass-card p-5 rounded-xl animate-scale-in" style={{ animationDelay: '50ms' }}>
          <div className="text-3xl font-bold text-white mb-1">{stats.totalWorkers}</div>
          <div className="text-white/50 text-sm">Workers</div>
        </div>
        <div className="glass-card p-5 rounded-xl animate-scale-in" style={{ animationDelay: '100ms' }}>
          <div className="text-3xl font-bold text-white mb-1">{stats.totalOrganizers}</div>
          <div className="text-white/50 text-sm">Organizers</div>
        </div>
        <div className="glass-card p-5 rounded-xl animate-scale-in" style={{ animationDelay: '150ms' }}>
          <div className="text-3xl font-bold text-white mb-1">{stats.activeEvents}</div>
          <div className="text-white/50 text-sm">Active Events</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['overview', 'users', 'events', 'applications'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-xl font-medium transition-all duration-300 capitalize ${
              activeTab === tab
                ? 'bg-primary-500 text-white'
                : 'glass text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-white mb-4">Platform Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Total Events</span>
                  <span className="text-white font-semibold">{stats.totalEvents}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Total Applications</span>
                  <span className="text-white font-semibold">{stats.totalApplications}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Pending Applications</span>
                  <span className="text-white font-semibold">{stats.pendingApplications}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Platform Revenue (NPR)</span>
                  <span className="text-white font-semibold">
                    {stats.totalRevenue?.toLocaleString() || 0}
                  </span>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Users</h3>
              <div className="space-y-3">
                {users.slice(0, 5).map(user => (
                  <div key={user._id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-500/30 flex items-center justify-center">
                        <span className="text-primary-200 font-semibold">
                          {user.name?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-medium">{user.name}</p>
                        <p className="text-white/40 text-sm capitalize">{user.role}</p>
                      </div>
                    </div>
                    <Badge variant={user.isVerified ? 'success' : 'warning'}>
                      {user.isVerified ? 'Verified' : 'Pending'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <h3 className="text-lg font-semibold text-white">All Users</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="text-left text-white/50 text-sm font-medium px-4 py-3">Name</th>
                    <th className="text-left text-white/50 text-sm font-medium px-4 py-3">Email</th>
                    <th className="text-left text-white/50 text-sm font-medium px-4 py-3">Role</th>
                    <th className="text-left text-white/50 text-sm font-medium px-4 py-3">Status</th>
                    <th className="text-left text-white/50 text-sm font-medium px-4 py-3">Joined</th>
                    <th className="text-left text-white/50 text-sm font-medium px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user._id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-500/30 flex items-center justify-center">
                            <span className="text-primary-200 text-sm font-semibold">
                              {user.name?.charAt(0) || 'U'}
                            </span>
                          </div>
                          <span className="text-white">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-white/70">{user.email}</td>
                      <td className="px-4 py-3">
                        <Badge variant={user.role === 'worker' ? 'info' : 'default'}>{user.role}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={user.isVerified ? 'success' : 'warning'}>
                          {user.isVerified ? 'Verified' : 'Pending'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-white/50 text-sm">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {!user.isVerified && (
                            <button
                              onClick={() => handleVerifyUser(user._id)}
                              className="text-sm text-green-400 hover:text-green-300"
                            >
                              Verify
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="text-sm text-red-400 hover:text-red-300"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'events' && (
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <h3 className="text-lg font-semibold text-white">All Events</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="text-left text-white/50 text-sm font-medium px-4 py-3">Event</th>
                    <th className="text-left text-white/50 text-sm font-medium px-4 py-3">Organizer</th>
                    <th className="text-left text-white/50 text-sm font-medium px-4 py-3">Date</th>
                    <th className="text-left text-white/50 text-sm font-medium px-4 py-3">Positions</th>
                    <th className="text-left text-white/50 text-sm font-medium px-4 py-3">Status</th>
                    <th className="text-left text-white/50 text-sm font-medium px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map(event => (
                    <tr key={event._id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="px-4 py-3 text-white">{event.title}</td>
                      <td className="px-4 py-3 text-white/70">{event.organizer?.name}</td>
                      <td className="px-4 py-3 text-white/50 text-sm">
                        {new Date(event.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-white/70">
                        {event.filledPositions}/{event.totalPositions}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={event.status === 'active' ? 'success' : 'default'}>
                          {event.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDeleteEvent(event._id)}
                          className="text-sm text-red-400 hover:text-red-300"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="glass-card p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-white mb-4">Application Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass p-4 rounded-xl text-center">
                <div className="text-2xl font-bold text-white mb-1">{stats.totalApplications}</div>
                <div className="text-white/50 text-sm">Total</div>
              </div>
              <div className="glass p-4 rounded-xl text-center">
                <div className="text-2xl font-bold text-yellow-400 mb-1">{stats.pendingApplications}</div>
                <div className="text-white/50 text-sm">Pending</div>
              </div>
              <div className="glass p-4 rounded-xl text-center">
                <div className="text-2xl font-bold text-green-400 mb-1">
                  {stats.totalApplications - stats.pendingApplications}
                </div>
                <div className="text-white/50 text-sm">Approved</div>
              </div>
              <div className="glass p-4 rounded-xl text-center">
                <div className="text-2xl font-bold text-red-400 mb-1">0</div>
                <div className="text-white/50 text-sm">Rejected</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}