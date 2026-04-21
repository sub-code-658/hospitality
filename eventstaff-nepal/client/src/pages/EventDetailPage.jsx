import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import ApplicationCard from '../components/ApplicationCard';
import LoadingSpinner from '../components/LoadingSpinner';

const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function EventDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showApplications, setShowApplications] = useState(false);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const res = await api.get(`/events/${id}`);
      setEvent(res.data);
    } catch (error) {
      addToast('Failed to load event', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setApplying(true);
    try {
      await api.post('/applications', { eventId: id });
      addToast('Application submitted successfully!', 'success');
      fetchEvent();
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to apply', 'error');
    } finally {
      setApplying(false);
    }
  };

  const handleStatusChange = async (applicationId, status) => {
    if (!window.confirm(`Are you sure you want to ${status} this application?`)) return;

    try {
      await api.put(`/applications/${applicationId}/status`, { status });
      addToast(`Application ${status} successfully`, 'success');
      fetchEvent();
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to update status', 'error');
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await api.get(`/applications/event/${id}`);
      setApplications(res.data);
      setShowApplications(true);
    } catch (error) {
      addToast('Failed to load applications', 'error');
    }
  };

  const handleAssign = async (applicationId, assignedRole, shiftNotes) => {
    try {
      await api.put(`/applications/${applicationId}/assign`, { assignedRole, shiftNotes });
      addToast('Worker assignment saved', 'success');
      fetchApplications();
      fetchEvent();
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to save assignment', 'error');
    }
  };

  const isOrganizer = user?.id === event?.organizer?._id;
  const isWorker = user?.role === 'worker';
  const hasApplied = applications.some(a => a.worker?._id === user?.id || a.worker === user?.id);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>;
  }

  if (!event) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-white">Event not found</p></div>;
  }

  const totalPay = event.rolesNeeded?.reduce((sum, role) => sum + (role.payPerHour * role.count), 0) || 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="glass-card overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-700/80 to-primary-600/80 text-white p-8 backdrop-blur-sm">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-3">{event.title}</h1>
              <p className="text-white/70">
                By {event.organizer?.name || 'Unknown Organizer'}
              </p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm ${
              event.status === 'active' ? 'bg-green-500/30 text-green-200 border border-green-400/30' : 'bg-gray-500/30 text-gray-200 border border-gray-400/30'
            }`}>
              {event.status}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Event Details</h3>
              <div className="space-y-4">
                <div className="flex items-center text-white/70">
                  <svg className="w-5 h-5 mr-3 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {new Date(event.eventDate).toLocaleDateString('en-US', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </div>
                <div className="flex items-center text-white/70">
                  <svg className="w-5 h-5 mr-3 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {event.startTime} - {event.endTime}
                </div>
                <div className="flex items-center text-white/70">
                  <svg className="w-5 h-5 mr-3 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  {event.location}
                </div>
              </div>
            </div>

            <div className="glass p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-white mb-3">Estimated Total Payout</h3>
              <div className="text-3xl font-bold text-white mb-2">NPR {totalPay}</div>
              <p className="text-white/50 text-sm">Based on all roles and hours</p>
            </div>
          </div>

          <div className="mb-6 flex flex-wrap gap-3">
            <span className="inline-flex items-center px-3 py-2 rounded-full bg-white/10 text-white/80 border border-white/10">
              {event.acceptedCount ?? 0}/{event.totalPositions ?? event.rolesNeeded?.reduce((sum, r) => sum + r.count, 0) ?? 0} hired
            </span>
            {event.filled && (
              <span className="inline-flex items-center px-3 py-2 rounded-full bg-green-500/20 text-green-200 border border-green-400/30">
                Position Filled
              </span>
            )}
          </div>

          {/* Description */}
          <div className="mb-10">
            <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
            <p className="text-white/70 whitespace-pre-line">{event.description}</p>
          </div>

          {/* Roles Table */}
          <div className="mb-10">
            <h3 className="text-lg font-semibold text-white mb-3">Roles Needed</h3>
            <div className="glass rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-5 py-4 text-left text-sm font-semibold text-white">Role</th>
                    <th className="px-5 py-4 text-left text-sm font-semibold text-white">Count</th>
                    <th className="px-5 py-4 text-left text-sm font-semibold text-white">Pay/Hour</th>
                    <th className="px-5 py-4 text-left text-sm font-semibold text-white">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {event.rolesNeeded?.map((role, idx) => (
                    <tr key={idx}>
                      <td className="px-5 py-4 text-white/80">{role.roleName}</td>
                      <td className="px-5 py-4 text-white/60">{role.count}</td>
                      <td className="px-5 py-4 text-white/60">NPR {role.payPerHour}</td>
                      <td className="px-5 py-4 text-white font-medium">NPR {role.payPerHour * role.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Map */}
          {event.coordinates?.lat && event.coordinates?.lng && (
            <div className="mb-10">
              <h3 className="text-lg font-semibold text-white mb-3">Location</h3>
              <div className="h-64 rounded-xl overflow-hidden">
                <MapContainer
                  center={[event.coordinates.lat, event.coordinates.lng]}
                  zoom={15}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[event.coordinates.lat, event.coordinates.lng]} icon={defaultIcon} />
                </MapContainer>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            {isWorker && event.status === 'active' && !event.filled && (
              <button
                onClick={handleApply}
                disabled={applying || hasApplied}
                className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  hasApplied
                    ? 'glass text-white/50 cursor-not-allowed border border-white/10'
                    : 'glass-btn text-white'
                }`}
              >
                {applying ? <LoadingSpinner size="sm" /> : hasApplied ? 'Already Applied' : 'Apply Now'}
              </button>
            )}

            {isWorker && event.status === 'active' && event.filled && (
              <div className="flex-1 px-4 py-3 rounded-xl bg-white/10 text-white/70 border border-white/10">
                This event is fully staffed and no longer accepting applications.
              </div>
            )}

            {isOrganizer && (
              <button
                onClick={fetchApplications}
                className="flex-1 glass-btn text-white py-3 rounded-xl font-semibold"
              >
                View Applications
              </button>
            )}

            <Link
              to={user?.role === 'organizer' ? '/dashboard' : '/worker-dashboard'}
              className="flex-1 glass text-white/80 py-3 rounded-xl font-semibold hover:bg-white/10 transition-all duration-300 text-center border border-white/10"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Applications Modal */}
      {showApplications && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="glass-card max-w-2xl w-full max-h-[80vh] overflow-hidden animate-scale-in">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-white">Applications for {event.title}</h3>
              <button onClick={() => setShowApplications(false)} className="text-white/60 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {applications.length === 0 ? (
                <p className="text-center text-white/50 py-8">No applications yet</p>
              ) : (
                applications.map(app => (
                  <ApplicationCard
                    key={app._id}
                    application={app}
                    eventRoles={event?.rolesNeeded || []}
                    isOrganizer={true}
                    onStatusChange={handleStatusChange}
                    onAssign={handleAssign}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}