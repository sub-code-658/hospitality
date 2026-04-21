import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import StarRating from '../components/StarRating';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    skills: user?.skills || [],
    experience: user?.experience || 'None'
  });

  useEffect(() => {
    fetchReviews();
  }, [user?.id]);

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/reviews/user/${user.id}`);
      setReviews(res.data.reviews);
    } catch (error) {
      console.error('Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSkillToggle = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      addToast('Name is required', 'error');
      return;
    }

    if (user.role === 'worker' && formData.skills.length === 0) {
      addToast('Select at least one skill', 'error');
      return;
    }

    setSaving(true);
    try {
      await api.put('/auth/profile', formData);
      updateUser(formData);
      addToast('Profile updated successfully!', 'success');
      setEditing(false);
    } catch (error) {
      addToast('Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const SKILLS = ['Waiter', 'Bartender', 'Chef', 'Host', 'Security'];
  const EXPERIENCE_LEVELS = ['None', '0-1 years', '1-3 years', '3-5 years', '5+ years'];

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-10 animate-slide-up">My Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-2">
          <div className="glass-card p-6 animate-scale-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">Profile Information</h2>
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="text-primary-300 hover:text-primary-200 font-medium transition-colors"
                >
                  Edit
                </button>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={() => setEditing(false)}
                    className="text-white/60 hover:text-white/80 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="glass-btn text-white px-4 py-2 rounded-xl"
                  >
                    {saving ? <LoadingSpinner size="sm" /> : 'Save'}
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">Full Name</label>
                {editing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl glass-input text-white"
                  />
                ) : (
                  <p className="text-white text-lg">{user?.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">Email</label>
                <p className="text-white/80 text-lg">{user?.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">Role</label>
                <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                  user?.role === 'organizer'
                    ? 'bg-purple-500/20 text-purple-200 border border-purple-400/30'
                    : 'bg-blue-500/20 text-blue-200 border border-blue-400/30'
                }`}>
                  {user?.role === 'organizer' ? 'Event Organizer' : 'Hospitality Worker'}
                </span>
              </div>

              {user?.role === 'worker' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-3">Skills</label>
                    {editing ? (
                      <div className="flex flex-wrap gap-2">
                        {SKILLS.map(skill => (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => handleSkillToggle(skill)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                              formData.skills.includes(skill)
                                ? 'bg-primary-500/30 text-primary-200 border border-primary-400/40'
                                : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
                            }`}
                          >
                            {skill}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {user?.skills?.map((skill, idx) => (
                          <span key={idx} className="bg-primary-500/20 text-primary-300 px-3 py-1 rounded-full text-sm border border-primary-400/30">
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">Experience</label>
                    {editing ? (
                      <select
                        name="experience"
                        value={formData.experience}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl glass-input text-white"
                      >
                        {EXPERIENCE_LEVELS.map(level => (
                          <option key={level} value={level} className="bg-gray-800">{level}</option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-white/80">{user?.experience}</p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Card */}
        <div className="lg:col-span-1">
          <div className="glass-card p-6 animate-scale-in" style={{ animationDelay: '0.1s' }}>
            <h2 className="text-xl font-semibold text-white mb-4">Ratings & Reviews</h2>

            {reviews.length > 0 ? (
              <>
                <div className="flex items-center mb-4">
                  <div className="text-4xl font-bold text-white mr-3">
                    {reviews.length > 0
                      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                      : '0.0'}
                  </div>
                  <div>
                    <StarRating rating={Math.round(reviews.length > 0
                      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
                      : 0)} />
                    <p className="text-sm text-white/40">{reviews.length} reviews</p>
                  </div>
                </div>

                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {reviews.map((review) => (
                    <div key={review._id} className="border-t border-white/10 pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-white">{review.reviewer?.name}</span>
                        <StarRating rating={review.rating} size="sm" />
                      </div>
                      <p className="text-white/60 text-sm">{review.comment || 'No comment'}</p>
                      <p className="text-xs text-white/30 mt-1">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-white/40 text-center py-4">No reviews yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}