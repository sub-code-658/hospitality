import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
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

function LocationPicker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position ? <Marker position={position} icon={defaultIcon} /> : null;
}

export default function EditEventPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [roles, setRoles] = useState([{ roleName: '', count: 1, paymentType: 'per_hour', payAmount: '' }]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    eventDate: '',
    startTime: '',
    endTime: ''
  });
  const [mapPosition, setMapPosition] = useState([27.7172, 85.3142]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user && user.role !== 'organizer' && user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchEvent();
  }, [user, id]);

  const fetchEvent = async () => {
    try {
      const res = await api.get(`/events/${id}`);
      const event = res.data;

      const rawDate = event.eventDate
        ? new Date(event.eventDate).toISOString().split('T')[0]
        : '';

      setFormData({
        title: event.title || '',
        description: event.description || '',
        location: event.location || '',
        eventDate: rawDate,
        startTime: event.startTime || '',
        endTime: event.endTime || ''
      });

      if (event.rolesNeeded && event.rolesNeeded.length > 0) {
        setRoles(event.rolesNeeded.map(r => ({
          roleName: r.roleName || '',
          count: r.count ?? 1,
          paymentType: r.paymentType ?? 'per_hour',
          payAmount: r.payAmount ?? ''
        })));
      }

      if (event.coordinates && event.coordinates.lat && event.coordinates.lng) {
        setMapPosition([event.coordinates.lat, event.coordinates.lng]);
      }
    } catch (error) {
      addToast('Failed to load event details', 'error');
      navigate('/dashboard');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const handleRoleChange = (index, field, value) => {
    const newRoles = [...roles];
    newRoles[index][field] = value;
    setRoles(newRoles);
  };

  const addRole = () => {
    setRoles([...roles, { roleName: '', count: 1, paymentType: 'per_hour', payAmount: '' }]);
  };

  const removeRole = (index) => {
    if (roles.length > 1) {
      setRoles(roles.filter((_, i) => i !== index));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.eventDate) newErrors.eventDate = 'Date is required';
    if (!formData.startTime) newErrors.startTime = 'Start time is required';
    if (!formData.endTime) newErrors.endTime = 'End time is required';

    if (formData.eventDate && formData.startTime && formData.endTime) {
      const start = new Date(`${formData.eventDate}T${formData.startTime}`);
      const end = new Date(`${formData.eventDate}T${formData.endTime}`);
      if (end <= start) {
        newErrors.endTime = 'End time must be after start time';
      }
    }

    roles.forEach((role, idx) => {
      if (!role.roleName) newErrors[`role_${idx}`] = 'Role name is required';
      if (!role.count || role.count < 1) newErrors[`count_${idx}`] = 'Valid count is required';
      if (role.payAmount === '' || role.payAmount < 0) newErrors[`pay_${idx}`] = 'Valid pay amount is required';
    });
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await api.put(`/events/${id}`, {
        ...formData,
        rolesNeeded: roles,
        coordinates: { lat: mapPosition[0], lng: mapPosition[1] }
      });
      addToast('Event updated successfully!', 'success');
      navigate('/dashboard');
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to update event', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-10 animate-slide-up">Edit Event</h1>

      <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6 animate-scale-in">
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">Event Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`w-full px-4 py-4 rounded-xl glass-input text-white placeholder-white/40 ${errors.title ? 'border-red-400' : ''}`}
            placeholder="e.g., Corporate Gala Dinner"
          />
          {errors.title && <p className="text-red-300 text-sm mt-2">{errors.title}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className={`w-full px-4 py-4 rounded-xl glass-input text-white placeholder-white/40 ${errors.description ? 'border-red-400' : ''}`}
            placeholder="Describe your event..."
          />
          {errors.description && <p className="text-red-300 text-sm mt-2">{errors.description}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className={`w-full px-4 py-4 rounded-xl glass-input text-white placeholder-white/40 ${errors.location ? 'border-red-400' : ''}`}
              placeholder="Venue name and address"
            />
            {errors.location && <p className="text-red-300 text-sm mt-2">{errors.location}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Event Date</label>
            <input
              type="date"
              name="eventDate"
              value={formData.eventDate}
              onChange={handleChange}
              className={`w-full px-4 py-4 rounded-xl glass-input text-white ${errors.eventDate ? 'border-red-400' : ''}`}
            />
            {errors.eventDate && <p className="text-red-300 text-sm mt-2">{errors.eventDate}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Start Time</label>
            <input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              className={`w-full px-4 py-4 rounded-xl glass-input text-white ${errors.startTime ? 'border-red-400' : ''}`}
            />
            {errors.startTime && <p className="text-red-300 text-sm mt-2">{errors.startTime}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">End Time</label>
            <input
              type="time"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              className={`w-full px-4 py-4 rounded-xl glass-input text-white ${errors.endTime ? 'border-red-400' : ''}`}
            />
            {errors.endTime && <p className="text-red-300 text-sm mt-2">{errors.endTime}</p>}
          </div>
        </div>

        {/* Map Picker */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">Pin Location on Map</label>
          <div className="h-64 rounded-xl overflow-hidden">
            <MapContainer
              center={mapPosition}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationPicker position={mapPosition} setPosition={(pos) => setMapPosition([pos.lat, pos.lng])} />
            </MapContainer>
          </div>
          <p className="text-sm text-white/40 mt-2">Click on the map to update the event location</p>
        </div>

        {/* Roles Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-medium text-white/80">Roles Needed</label>
            <button
              type="button"
              onClick={addRole}
              className="text-primary-300 hover:text-primary-200 font-medium text-sm transition-colors"
            >
              + Add Role
            </button>
          </div>
          <div className="space-y-4">
            {roles.map((role, index) => (
              <div key={index} className="flex gap-4 items-start p-4 glass rounded-xl">
                <div className="flex-1">
                  <input
                    type="text"
                    value={role.roleName}
                    onChange={(e) => handleRoleChange(index, 'roleName', e.target.value)}
                    placeholder="Role (e.g., Waiter)"
                    className="w-full px-3 py-2 rounded-xl input-field text-sm"
                  />
                  {errors[`role_${index}`] && <p className="text-red-300 text-xs mt-1">{errors[`role_${index}`]}</p>}
                </div>
                <div className="w-24">
                  <input
                    type="number"
                    value={role.count}
                    onChange={(e) => handleRoleChange(index, 'count', e.target.value)}
                    placeholder="Count"
                    min="1"
                    className="w-full px-3 py-2 rounded-xl input-field text-sm text-center"
                  />
                  {errors[`count_${index}`] && <p className="text-red-300 text-xs mt-1">{errors[`count_${index}`]}</p>}
                </div>
                <div className="w-56 flex gap-2">
                  <div className="flex-1">
                    <input
                      type="number"
                      value={role.payAmount}
                      onChange={(e) => handleRoleChange(index, 'payAmount', e.target.value)}
                      placeholder="Amount"
                      min="0"
                      className="w-full px-3 py-2 rounded-xl input-field text-sm"
                    />
                    {errors[`pay_${index}`] && <p className="text-red-300 text-xs mt-1">{errors[`pay_${index}`]}</p>}
                  </div>
                  <select
                    value={role.paymentType}
                    onChange={(e) => handleRoleChange(index, 'paymentType', e.target.value)}
                    className="w-24 px-2 py-2 rounded-xl input-field text-sm"
                  >
                    <option value="per_hour">/ Hour</option>
                    <option value="per_day">/ Day</option>
                    <option value="per_event">/ Event</option>
                  </select>
                </div>
                {roles.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRole(index)}
                    className="text-red-300 hover:text-red-200 p-2 transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="flex-1 btn-secondary py-4 rounded-xl font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 btn-glass py-4 rounded-xl font-semibold flex items-center justify-center"
          >
            {loading ? <LoadingSpinner size="sm" /> : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
