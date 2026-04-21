import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import EventCard from '../components/EventCard';
import ApplicationCard from '../components/ApplicationCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function WorkerDashboard() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    if (user?.role !== 'worker') {
      navigate('/');
    } else {
      fetchData();
    }
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      const [eventsRes, appsRes] = await Promise.all([
        api.get('/events?status=active'),
        api.get('/applications/my')
      ]);
      setEvents(eventsRes.data);
      setMyApplications(appsRes.data);
    } catch (error) {
      addToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (eventId) => {
    try {
      await api.post('/applications', { eventId });
      addToast('Application submitted successfully!', 'success');
      fetchData();
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to apply', 'error');
    }
  };

  const allRoles = [...new Set(events.flatMap(e => e.rolesNeeded?.map(r => r.roleName) || []))];

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !roleFilter || event.rolesNeeded?.some(r => r.roleName === roleFilter);
    return matchesSearch && matchesRole;
  });

  const appliedEventIds = myApplications.map(a => a.event?._id || a.event);

  const acceptedApps = myApplications.filter(a => a.status === 'accepted');
  const pendingApps = myApplications.filter(a => a.status === 'pending');

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-10 animate-slide-up">
        <h1 className="text-3xl md:text-4xl font-bold text-white">Worker Dashboard</h1>
        <p className="text-white/60 mt-2">Welcome back, {user?.name}!</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10">
        <div className="glass-card p-6 text-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="text-3xl font-bold text-white mb-2">{myApplications.length}</div>
          <div className="text-white/60 text-sm">Total Applications</div>
        </div>
        <div className="glass-card p-6 text-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="text-3xl font-bold text-green-300 mb-2">{acceptedApps.length}</div>
          <div className="text-white/60 text-sm">Upcoming Events</div>
        </div>
        <div className="glass-card p-6 text-center animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="text-3xl font-bold text-yellow-300 mb-2">{pendingApps.length}</div>
          <div className="text-white/60 text-sm">Pending</div>
        </div>
        <div className="glass-card p-6 text-center animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <div className="text-3xl font-bold text-white/60 mb-2">{myApplications.filter(a => a.status === 'rejected').length}</div>
          <div className="text-white/60 text-sm">Rejected</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Available Jobs */}
        <div className="lg:col-span-2">
          <div className="glass-card overflow-hidden animate-slide-up" style={{ animationDelay: '0.5s' }}>
            <div className="p-6 border-b border-white/10">
              <h2 className="text-xl font-semibold text-white mb-4">Available Jobs</h2>
              <div className="flex flex-col md:flex-row gap-4">
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-xl glass-input text-white placeholder-white/40"
                />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-4 py-3 rounded-xl glass-input text-white"
                >
                  <option value="" className="bg-gray-800">All Roles</option>
                  {allRoles.map(role => (
                    <option key={role} value={role} className="bg-gray-800">{role}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="p-6">
              {filteredEvents.length === 0 ? (
                <p className="text-center text-white/50 py-8">No events available</p>
              ) : (
                <div className="space-y-4">
                  {filteredEvents.map(event => (
                    <div key={event._id} className="glass p-5 rounded-xl">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-white">{event.title}</h3>
                          <p className="text-sm text-white/60">
                            {new Date(event.eventDate).toLocaleDateString()} | {event.startTime} - {event.endTime}
                          </p>
                          <p className="text-sm text-white/60">{event.location}</p>
                        </div>
                        {appliedEventIds.includes(event._id) ? (
                          <span className="bg-white/10 text-white/60 px-3 py-1 rounded-full text-sm border border-white/20">
                            Applied
                          </span>
                        ) : (
                          <button
                            onClick={() => handleApply(event._id)}
                            className="glass-btn text-white px-4 py-2 rounded-xl text-sm"
                          >
                            Apply Now
                          </button>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {event.rolesNeeded?.map((role, idx) => (
                          <span key={idx} className="bg-primary-500/20 text-primary-300 px-2 py-1 rounded-full text-xs border border-primary-400/30">
                            {role.roleName} - NPR {role.payPerHour}/hr
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* My Applications Sidebar */}
        <div className="lg:col-span-1">
          <div className="glass-card overflow-hidden animate-slide-up" style={{ animationDelay: '0.6s' }}>
            <div className="p-6 border-b border-white/10">
              <h2 className="text-xl font-semibold text-white">My Applications</h2>
            </div>
            <div className="p-4">
              {myApplications.length === 0 ? (
                <p className="text-center text-white/50 py-4">No applications yet</p>
              ) : (
                <div className="space-y-3">
                  {myApplications.slice(0, 10).map(app => (
                    <ApplicationCard key={app._id} application={app} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}