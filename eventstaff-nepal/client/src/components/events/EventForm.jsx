import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ROLES } from '../../utils/constants';
import MapPicker from '../common/MapPicker';
import { KATHMANDU_CENTER } from '../../utils/constants';

const EventForm = ({ initialData, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    location: initialData?.location || '',
    eventDate: initialData?.eventDate || '',
    startTime: initialData?.startTime || '',
    endTime: initialData?.endTime || '',
    rolesNeeded: initialData?.rolesNeeded || [{ roleName: '', count: 1, paymentType: 'per_hour', payAmount: '' }],
    coordinates: initialData?.coordinates || KATHMANDU_CENTER
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleRoleChange = (index, field, value) => {
    const newRoles = [...formData.rolesNeeded];
    newRoles[index][field] = value;
    setFormData(prev => ({ ...prev, rolesNeeded: newRoles }));
  };

  const addRole = () => {
    setFormData(prev => ({
      ...prev,
      rolesNeeded: [...prev.rolesNeeded, { roleName: '', count: 1, paymentType: 'per_hour', payAmount: '' }]
    }));
  };

  const removeRole = (index) => {
    if (formData.rolesNeeded.length > 1) {
      setFormData(prev => ({
        ...prev,
        rolesNeeded: prev.rolesNeeded.filter((_, i) => i !== index)
      }));
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
    formData.rolesNeeded.forEach((role, idx) => {
      if (!role.roleName) newErrors[`role_${idx}`] = 'Role name is required';
      if (!role.count || role.count < 1) newErrors[`count_${idx}`] = 'Valid count is required';
      if (!role.payAmount || role.payAmount < 0) newErrors[`pay_${idx}`] = 'Valid pay amount is required';
    });
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-white/80 mb-2">{t('common.event_title', 'Event Title')}</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-xl glass-input text-white"
          placeholder={t('common.e_g_corporate_gala_dinner', 'e.g., Corporate Gala Dinner')}
        />
        {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-white/80 mb-2">{t('common.description', 'Description')}</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className="w-full px-4 py-3 rounded-xl glass-input text-white"
          placeholder={t('common.describe_your_event', 'Describe your event...')}
        />
        {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">{t('common.location', 'Location')}</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl glass-input text-white"
            placeholder={t('common.venue_name_and_address', 'Venue name and address')}
          />
          {errors.location && <p className="text-red-400 text-sm mt-1">{errors.location}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">{t('common.event_date', 'Event Date')}</label>
          <input
            type="date"
            name="eventDate"
            value={formData.eventDate}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl glass-input text-white"
          />
          {errors.eventDate && <p className="text-red-400 text-sm mt-1">{errors.eventDate}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">{t('common.start_time', 'Start Time')}</label>
          <input
            type="time"
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl glass-input text-white"
          />
          {errors.startTime && <p className="text-red-400 text-sm mt-1">{errors.startTime}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">{t('common.end_time', 'End Time')}</label>
          <input
            type="time"
            name="endTime"
            value={formData.endTime}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl glass-input text-white"
          />
          {errors.endTime && <p className="text-red-400 text-sm mt-1">{errors.endTime}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-white/80 mb-2">{t('common.pin_location_on_map', 'Pin Location on Map')}</label>
        <MapPicker
          position={formData.coordinates}
          setPosition={(coords) => setFormData(prev => ({ ...prev, coordinates: coords }))}
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <label className="block text-sm font-medium text-white/80">{t('common.roles_needed', 'Roles Needed')}</label>
          <button
            type="button"
            onClick={addRole}
            className="text-primary-300 hover:text-primary-200 font-medium text-sm"
          >
            + Add Role
          </button>
        </div>
        <div className="space-y-4">
          {formData.rolesNeeded.map((role, index) => (
            <div key={index} className="flex gap-4 items-start p-4 glass rounded-xl">
              <div className="flex-1">
                <select
                  value={role.roleName}
                  onChange={(e) => handleRoleChange(index, 'roleName', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-white"
                >
                  <option value="">{t('common.select_role', 'Select role')}</option>
                  {ROLES.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                {errors[`role_${index}`] && <p className="text-red-400 text-xs mt-1">{errors[`role_${index}`]}</p>}
              </div>
              <div className="w-20">
                <input
                  type="number"
                  value={role.count}
                  onChange={(e) => handleRoleChange(index, 'count', e.target.value)}
                  placeholder={t('common.count', 'Count')}
                  min="1"
                  className="w-full px-3 py-2 rounded-xl glass-input text-white text-center"
                />
              </div>
              <div className="w-56 flex gap-2">
                <div className="flex-1">
                  <input
                    type="number"
                    value={role.payAmount}
                    onChange={(e) => handleRoleChange(index, 'payAmount', e.target.value)}
                    placeholder={t('common.amount', 'Amount')}
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
                  <option value="per_hour">{t('common.hour', '/ Hour')}</option>
                  <option value="per_day">{t('common.day', '/ Day')}</option>
                  <option value="per_event">{t('common.event', '/ Event')}</option>
                </select>
              </div>
              {formData.rolesNeeded.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRole(index)}
                  className="text-red-300 hover:text-red-200 p-2"
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
        disabled={isLoading}
        className="w-full glass-btn text-white py-4 rounded-xl font-semibold flex items-center justify-center"
      >
        {isLoading ? 'Saving...' : (initialData ? 'Update Event' : 'Post Event')}
      </button>
    </form>
  );
};

export default EventForm;