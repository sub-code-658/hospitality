import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { useTranslation } from 'react-i18next';

const SKILLS = ['Waiter', 'Bartender', 'Chef', 'Host', 'Security'];
const EXPERIENCE_LEVELS = ['None', '0-1 years', '1-3 years', '3-5 years', '5+ years'];

export default function RegisterPage() {
  const { t } = useTranslation();
  const [role, setRole] = useState('worker');
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '', skills: [], experience: 'None',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { user, register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSkillToggle = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const validate = () => {
    const e = {};
    if (!formData.name.trim()) e.name = 'Name is required';
    if (!formData.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = 'Invalid email format';
    if (!formData.password) e.password = 'Password is required';
    else if (formData.password.length < 6) e.password = 'Min. 6 characters';
    if (formData.password !== formData.confirmPassword) e.confirmPassword = 'Passwords do not match';
    if (role === 'worker' && formData.skills.length === 0) e.skills = 'Select at least one skill';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setLoading(true);
    const result = await register({
      name: formData.name, email: formData.email, password: formData.password, role,
      skills: role === 'worker' ? formData.skills : undefined,
      experience: role === 'worker' ? formData.experience : undefined,
    });
    setLoading(false);
    if (result.success) {
      addToast('Registration successful!', 'success');
      navigate(user.role === 'organizer' || user.role === 'admin' ? '/dashboard' : '/worker-dashboard');
    } else {
      addToast(result.message, 'error');
    }
  };

  const FieldLabel = ({ htmlFor, children }) => (
    <label
      htmlFor={htmlFor}
      className="block text-xs font-semibold uppercase tracking-widest mb-2.5"
      style={{ color: '#6B7A66', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
    >
      {children}
    </label>
  );

  const FieldError = ({ msg }) =>msg ? (<p className="text-xs mt-1.5" style={{ color: 'var(--crimson)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
        {msg}
      </p>) : null;

  return (<div
      className="min-h-screen flex items-center justify-center px-4 py-16 relative"
      style={{ background: 'var(--bg)' }}
    >
      <div
        className="absolute bottom-0 left-0 w-96 h-96 pointer-events-none"
        style={{ background: 'transparent' }}
      />

      <div className="relative z-10 w-full max-w-lg">

        {/* Logo */}
        <div className="text-center mb-12 animate-fade-in">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-8">
            <span style={{ color: 'var(--flame)', fontSize: '1.2rem' }}>◆</span>
            <span className="font-serif text-2xl" style={{ color: '#003300', fontWeight: 400 }}>EventStaff<span style={{ fontStyle: 'italic', color: 'var(--flame)' }}>NEPAL</span>
            </span>
          </Link>
          <h1
            className="font-serif block"
            style={{ fontSize: 'clamp(2.5rem, 7vw, 4rem)', color: '#003300', fontWeight: 300, lineHeight: 1.1 }}
          >Create<span className="flame-text" style={{ fontStyle: 'italic', fontWeight: 600 }}>Account</span>
          </h1>
          <p className="mt-3 text-sm" style={{ color: '#6B7A66', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Join EventStaff Nepal today</p>
        </div>

        {/* Card */}
        <div className="panel p-8 animate-slide-up">

          {/* Role toggle */}
          <div
            className="flex rounded-md p-1 mb-8"
            style={{ background: 'rgba(232, 234, 230, 0.5)', backdropFilter: 'blur(8px)', border: '1px solid rgba(184, 159, 100, 0.3)' }}
          >
            {['organizer', 'worker'].map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className="flex-1 py-2.5 rounded text-xs font-semibold uppercase tracking-widest transition-all duration-200"
                style={{
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                  background: role === r ? '#FFFFFF' : 'transparent',
                  color: '#003300',
                  border: role === r ? '1px solid rgba(184, 159, 100, 0.3)' : '1px solid transparent',
                  borderRadius: '0.25rem',
                }}
              >
                {r === 'organizer' ? 'Event Organiser' : 'Hospitality Worker'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <FieldLabel htmlFor="name">Full Name</FieldLabel>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input-field"
                placeholder="Your full name"
                autoComplete="name"
                required
                enterKeyHint="next"
              />
              <FieldError msg={errors.name} />
            </div>

            <div>
              <FieldLabel htmlFor="email">Email Address</FieldLabel>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                placeholder="you@example.com"
                autoComplete="username"
                required
                enterKeyHint="next"
              />
              <FieldError msg={errors.email} />
            </div>

            <div>
              <FieldLabel htmlFor="new-password">Password</FieldLabel>
              <div className="relative">
                <input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pr-12"
                  placeholder="Min. 6 characters"
                  autoComplete="new-password"
                  required
                  enterKeyHint="next"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold uppercase tracking-widest transition-colors duration-150"
                  style={{
                    color: '#6B7A66',
                    fontFamily: 'Plus Jakarta Sans, sans-serif',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#111827'}
                  onMouseLeave={e => e.currentTarget.style.color = '#6b7280'}
                >
                  {showPassword ? (
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              <FieldError msg={errors.password} />
            </div>

            <div>
              <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
              <div className="relative">
                <input
                  id="confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input-field pr-12"
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                  required
                  enterKeyHint="done"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold uppercase tracking-widest transition-colors duration-150"
                  style={{
                    color: '#6B7A66',
                    fontFamily: 'Plus Jakarta Sans, sans-serif',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#111827'}
                  onMouseLeave={e => e.currentTarget.style.color = '#6b7280'}
                >
                  {showPassword ? (
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              <FieldError msg={errors.confirmPassword} />
            </div>

            {role === 'worker' && (
              <>
                <div>
                  <FieldLabel>Skills</FieldLabel>
                  <div className="flex flex-wrap gap-2">
                    {SKILLS.map(skill => {
                      const active = formData.skills.includes(skill);
                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => handleSkillToggle(skill)}
                          className={`btn-skill px-4 py-2 rounded text-xs font-semibold uppercase tracking-widest transition-all duration-200 ${active ? 'btn-active' : ''}`}
                        >
                          {skill}
                        </button>
                      );
                    })}
                  </div>
                  <FieldError msg={errors.skills} />
                </div>

                <div>
                  <FieldLabel>Experience Level</FieldLabel>
                  <select
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    className="input-field"
                    style={{ colorScheme: 'dark' }}
                  >
                    {EXPERIENCE_LEVELS.map(lv => (
                      <option key={lv} value={lv} style={{ background: 'var(--surface)' }}>{lv}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <button type="submit" disabled={loading} className="btn-glass w-full py-3.5 mt-2">
              {loading ? <LoadingSpinner size="sm" /> : 'Create Account'}
            </button>
          </form>

          <p
            className="text-center text-sm mt-7"
            style={{ color: '#6B7A66', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold transition-colors duration-150"
              style={{ color: 'var(--flame)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--flame-light)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--flame)'}
            >Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
