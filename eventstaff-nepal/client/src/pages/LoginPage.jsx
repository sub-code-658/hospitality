import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { useTranslation } from 'react-i18next';

export default function LoginPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('organizer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const { user, login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Invalid email format';
    if (!password) e.password = 'Password is required';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      addToast('Welcome back!', 'success');
      navigate(result.user.role === 'organizer' || result.user.role === 'admin' ? '/dashboard' : '/worker-dashboard');
    } else {
      addToast(result.message, 'error');
    }
  };

  const fill = (type) => {
    setEmail(type === 'organizer' ? 'rajesh@events.com' : 'amit@gmail.com');
    setPassword('password123');
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-16 relative"
      style={{ background: 'var(--bg)' }}
    >
      {/* Ambient top-right glow */}
      <div
        className="absolute top-0 right-0 w-96 h-96 pointer-events-none"
        style={{ background: 'transparent' }}
      />

      <div className="relative z-10 w-full max-w-md">

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
          >Welcome<span className="flame-text" style={{ fontStyle: 'italic', fontWeight: 600 }}>Back</span>
          </h1>
          <p className="mt-3 text-sm" style={{ color: '#6B7A66', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="panel p-8 animate-slide-up">

          {/* Role tabs */}
          <div
            className="flex rounded-md p-1 mb-8"
            style={{ background: 'rgba(232, 234, 230, 0.5)', backdropFilter: 'blur(8px)', border: '1px solid rgba(184, 159, 100, 0.3)' }}
          >
            {['organizer', 'worker'].map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => { setActiveTab(tab); setErrors({}); }}
                className="flex-1 py-2.5 rounded text-xs font-semibold uppercase tracking-widest transition-all duration-200 relative"
                style={{
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                  background: activeTab === tab ? '#FFFFFF' : 'transparent',
                  color: '#003300',
                  border: activeTab === tab ? '1px solid rgba(184, 159, 100, 0.3)' : '1px solid transparent',
                  borderRadius: '0.25rem',
                }}
              >
                {tab === 'organizer' ? 'Event Organiser' : 'Hospitality Worker'}
                {activeTab === tab && (
                  <span
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                    style={{ background: 'var(--flame)' }}
                  />
                )}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-widest mb-2.5"
                style={{ color: '#6B7A66', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              >Email Address</label>
              <input
                id="email"
                type="email"
                name="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: '' })); }}
                className="input-field"
                placeholder="you@example.com"
                autoComplete="username"
                required
                enterKeyHint="next"
              />
              {errors.email && (
                <p className="text-xs mt-1.5" style={{ color: 'var(--crimson)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-widest mb-2.5"
                style={{ color: '#6B7A66', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              >Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: '' })); }}
                  className="input-field pr-12"
                  placeholder="••••••••"
                  autoComplete="current-password"
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
              {errors.password && (
                <p className="text-xs mt-1.5" style={{ color: 'var(--crimson)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  {errors.password}
                </p>
              )}
            </div>

            <button type="submit" disabled={loading} className="btn-glass w-full py-3.5 mt-2">
              {loading ? <LoadingSpinner size="sm" /> : 'Sign In'}
            </button>
          </form>

          {/* Test credentials */}
          <div className="mt-8 pt-7" style={{ borderTop: '1px solid var(--border)' }}>
            <p
              className="text-center text-xs uppercase tracking-widest mb-4"
              style={{ color: '#6B7A66', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >Quick fill — test credentials</p>
            <div className="flex gap-3">
              {['organizer', 'worker'].map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => fill(type)}
                  className="flex-1 py-2.5 rounded text-xs font-semibold uppercase tracking-widest transition-all duration-200"
                  style={{
                    fontFamily: 'Plus Jakarta Sans, sans-serif',
                    background: 'transparent',
                    border: '1px solid var(--border)',
                    color: '#6B7A66',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(232,104,30,0.35)'; e.currentTarget.style.color = '#111827'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = '#6b7280'; }}
                >
                  {type === 'organizer' ? 'Organiser' : 'Worker'}
                </button>
              ))}
            </div>
          </div>

          <p
            className="text-center text-sm mt-7"
            style={{ color: '#6B7A66', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            No account?{' '}
            <Link
              to="/register"
              className="font-semibold transition-colors duration-150"
              style={{ color: 'var(--flame)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--flame-light)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--flame)'}
            >Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
