import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

export default function PostEventPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([{ roleName: '', count: 1, payPerHour: '' }]);
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
    if (user?.role !== 'organizer') {
      navigate('/');
    }
  }, [user, navigate]);

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
    setRoles([...roles, { roleName: '', count: 1, payPerHour: '' }]);
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
      if (role.payPerHour === '' || role.payPerHour < 0) newErrors[`pay_${idx}`] = 'Valid pay rate is required';
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
      await api.post('/events', {
        ...formData,
        rolesNeeded: roles,
        coordinates: { lat: mapPosition[0], lng: mapPosition[1] }
      });
      addToast('Event posted successfully!', 'success');
      navigate('/dashboard');
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to post event', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-10 animate-slide-up">Post New Event</h1>

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
              min={new Date().toISOString().split('T')[0]}
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
              center={[27.7172, 85.3142]}
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
          <p className="text-sm text-white/40 mt-2">Click on the map to set the event location</p>
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
                    className="w-full px-3 py-2 rounded-xl glass-input text-white placeholder-white/40 text-sm"
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
                    className="w-full px-3 py-2 rounded-xl glass-input text-white placeholder-white/40 text-sm text-center"
                  />
                  {errors[`count_${index}`] && <p className="text-red-300 text-xs mt-1">{errors[`count_${index}`]}</p>}
                </div>
                <div className="w-32">
                  <input
                    type="number"
                    value={role.payPerHour}
                    onChange={(e) => handleRoleChange(index, 'payPerHour', e.target.value)}
                    placeholder="NPR/hr"
                    min="0"
                    className="w-full px-3 py-2 rounded-xl glass-input text-white placeholder-white/40 text-sm"
                  />
                  {errors[`pay_${index}`] && <p className="text-red-300 text-xs mt-1">{errors[`pay_${index}`]}</p>}
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

        <button
          type="submit"
          disabled={loading}
          className="w-full glass-btn text-white py-4 rounded-xl font-semibold flex items-center justify-center"
        >
          {loading ? <LoadingSpinner size="sm" /> : 'Post Event'}
        </button>
      </form>
    </div>
  );
}