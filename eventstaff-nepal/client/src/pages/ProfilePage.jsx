import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import StarRating from '../components/StarRating';
import LoadingSpinner from '../components/LoadingSpinner';

const DefaultAvatar = ({ role, gender, name }) => {
  const bg = role === 'organizer' ? 'B89F64' : '6baf8a';
  return (
    <img 
      src={`https://ui-avatars.com/api/?name=${name || 'U'}&background=${bg}&color=fff&size=200`} 
      alt="Default Avatar" 
      className="w-32 h-32 rounded-full object-cover border-4 border-[color:var(--surface-raised)]"
    />
  );
};

export default function ProfilePage() {
  const { t } = useTranslation();
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    skills: user?.skills || [],
    experience: user?.experience || 'None',
    contactNumber: user?.contactNumber || '',
    bio: user?.bio || '',
    avatar: user?.avatar || ''
  });

  useEffect(() => {
    fetchReviews();
  }, [user?.id]);

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/reviews/user/${user.id}`);
      setReviews(res.data.reviews || []);
    } catch (error) {
      console.error('Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    if (!formData.name.trim()) {
      addToast('Name is required', 'error');
      return;
    }
    setSaving(true);
    try {
      let finalFormData = { ...formData };
      
      // Upload avatar if selected
      if (avatarFile) {
        const fileData = new FormData();
        fileData.append('avatar', avatarFile);
        const uploadRes = await api.post('/users/upload-avatar', fileData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (uploadRes.data?.avatarUrl) {
          finalFormData.avatar = uploadRes.data.avatarUrl;
        }
      }

      await api.put('/auth/profile', finalFormData);
      updateUser(finalFormData);
      addToast('Profile updated successfully!', 'success');
      setEditing(false);
    } catch (error) {
      addToast('Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const formatNepalNumber = (num) => {
    if (!num) return '';
    const cleaned = ('' + num).replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `+977 ${cleaned.slice(0,10)}`;
    }
    return num;
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>;
  }

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl md:text-4xl font-bold text-[color:var(--text)] mb-8 animate-slide-up">{t('common.my_profile', 'My Profile')}</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full lg:w-1/3 space-y-6">
          <div className="glass-card p-8 text-center flex flex-col items-center animate-scale-in">
            <div className="relative group mb-4">
              {user?.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user?.name} 
                  className="w-32 h-32 rounded-full object-cover border-4 border-[color:var(--surface-raised)]"
                />
              ) : (
                <DefaultAvatar role={user?.role} gender={user?.gender} name={user?.name} />
              )}
              <button 
                onClick={() => setEditing(true)}
                className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg className="w-6 h-6 text-gray-900 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              </button>
            </div>
            <h2 className="text-2xl font-bold text-[color:var(--text)]">{user?.name}</h2>
            <p className="text-[color:var(--text-muted)] mb-3">
              {user?.role === 'organizer' ? t('common.event_organizer', 'Event Organizer') : t('common.hospitality_worker', 'Hospitality Worker')}
            </p>
            <div className="flex flex-col items-center gap-1 mb-6">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-[color:var(--text)]">{avgRating}</span>
                <StarRating rating={Math.round(Number(avgRating))} />
              </div>
              <span className="text-sm text-[color:var(--text-dim)]">{reviews.length} {t('common.reviews', 'reviews')}</span>
            </div>
            
            <button
              onClick={() => setEditing(true)}
              className="btn-primary w-full py-2.5 rounded-xl font-semibold mb-3"
            >
              {t('common.edit_profile', 'Edit Profile')}
            </button>
          </div>

          {user?.contactNumber && (
            <div className="glass-card p-6 animate-scale-in" style={{ animationDelay: '0.1s' }}>
              <h3 className="text-lg font-semibold text-[color:var(--text)] mb-4">{t('common.contact_info', 'Contact Info')}</h3>
              <div className="flex items-center gap-3 text-[color:var(--text-muted)]">
                <svg className="w-5 h-5 text-[color:var(--flame)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                <span>{formatNepalNumber(user.contactNumber)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="w-full lg:w-2/3 space-y-6">
          <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-xl font-semibold text-[color:var(--text)] mb-4">{t('common.about_me', 'About Me')}</h2>
            <p className="text-[color:var(--text-muted)] leading-relaxed">
              {user?.bio || t('common.no_bio_provided', 'No bio provided yet. Edit your profile to add one!')}
            </p>
          </div>

          {user?.role === 'worker' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <h3 className="text-lg font-semibold text-[color:var(--text)] mb-4">{t('common.skills', 'Skills')}</h3>
                {user?.skills && user.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {user.skills.map((skill, idx) => (
                      <span key={idx} className="bg-[color:var(--surface-raised)] text-[color:var(--text-muted)] px-3 py-1 rounded-full text-sm border border-[color:var(--border-hover)]">
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[color:var(--text-dim)] text-sm">{t('common.no_skills_listed', 'No skills listed')}</p>
                )}
              </div>
              
              <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
                <h3 className="text-lg font-semibold text-[color:var(--text)] mb-4">{t('common.experience', 'Experience')}</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[color:var(--surface-raised)] flex items-center justify-center">
                    <svg className="w-5 h-5 text-[color:var(--flame)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </div>
                  <div>
                    <p className="font-medium text-[color:var(--text)]">{user?.experience || 'None'}</p>
                    <p className="text-sm text-[color:var(--text-dim)]">{t('common.in_hospitality', 'in Hospitality')}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '0.5s' }}>
            <h2 className="text-xl font-semibold text-[color:var(--text)] mb-6">{t('common.recent_reviews', 'Recent Reviews')}</h2>
            {reviews.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {reviews.map((review) => (
                  <div key={review._id} className="p-4 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-raised)]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-[color:var(--text)]">{review.reviewer?.name}</span>
                      <StarRating rating={review.rating} size="sm" />
                    </div>
                    <p className="text-[color:var(--text-muted)] text-sm mb-2">{review.comment || t('common.no_comment', 'No comment')}</p>
                    <p className="text-xs text-[color:var(--text-dim)]">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[color:var(--text-dim)] text-center py-6">{t('common.no_reviews_yet', 'No reviews yet')}</p>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[color:var(--bg)] w-full max-w-lg rounded-2xl shadow-xl flex flex-col max-h-[90vh] animate-scale-in">
            <div className="p-6 border-b border-[color:var(--border)] flex justify-between items-center shrink-0">
              <h3 className="text-xl font-bold text-[color:var(--text)]">{t('common.edit_profile', 'Edit Profile')}</h3>
              <button onClick={() => setEditing(false)} className="text-[color:var(--text-muted)] hover:text-[color:var(--text)]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleSave} className="flex flex-col overflow-hidden">
              <div className="p-6 space-y-4 overflow-y-auto">
                <div>
                  <label className="block text-sm font-medium text-[color:var(--text-muted)] mb-1">{t('common.avatar_image', 'Avatar Image')}</label>
                  <input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files[0])} className="w-full px-4 py-2.5 rounded-xl glass-input text-[color:var(--text)]" />
                </div>
              
              <div>
                <label className="block text-sm font-medium text-[color:var(--text-muted)] mb-1">{t('common.full_name', 'Full Name')}</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl glass-input text-[color:var(--text)]" required />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[color:var(--text-muted)] mb-1">{t('common.contact_number', 'Contact Number')}</label>
                <input type="tel" name="contactNumber" value={formData.contactNumber} onChange={handleChange} placeholder="98XXXXXXXX" className="w-full px-4 py-2.5 rounded-xl glass-input text-[color:var(--text)]" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[color:var(--text-muted)] mb-1">{t('common.bio_about', 'Bio / About')}</label>
                <textarea name="bio" value={formData.bio} onChange={handleChange} rows="3" className="w-full px-4 py-2.5 rounded-xl glass-input text-[color:var(--text)]"></textarea>
              </div>

              {user?.role === 'worker' && (
                <div>
                  <label className="block text-sm font-medium text-[color:var(--text-muted)] mb-2">{t('common.skills', 'Skills')}</label>
                  <div className="flex flex-wrap gap-2">
                    {['Waiter', 'Bartender', 'Chef', 'Host', 'Security', 'Cleaner'].map(skill => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            skills: prev.skills.includes(skill)
                              ? prev.skills.filter(s => s !== skill)
                              : [...prev.skills, skill]
                          }))
                        }}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          formData.skills.includes(skill)
                            ? 'bg-[color:var(--sage)] text-gray-900 dark:text-white'
                            : 'bg-[color:var(--surface-raised)] text-[color:var(--text-muted)] hover:bg-[color:var(--border-hover)]'
                        }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              </div>

              <div className="p-4 bg-[color:var(--bg)] border-t border-[color:var(--border)] flex gap-3 sticky bottom-0 shrink-0">
                <button type="button" onClick={() => setEditing(false)} className="flex-1 py-2.5 rounded-xl font-medium text-[color:var(--text-muted)] hover:bg-[color:var(--surface-raised)] transition-colors">
                  {t('common.cancel', 'Cancel')}
                </button>
                <button type="submit" disabled={saving} className="flex-1 btn-primary py-2.5 rounded-xl font-medium">
                  {saving ? t('common.saving', 'Saving...') : t('common.save_changes', 'Save Changes')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
