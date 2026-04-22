import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState('organizer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { login } = useAuth();
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
      navigate('/dashboard');
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
        style={{ background: 'radial-gradient(circle at top right, rgba(232,104,30,0.06) 0%, transparent 65%)' }}
      />

      <div className="relative z-10 w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-12 animate-fade-in">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-8">
            <span style={{ color: 'var(--flame)', fontSize: '1.2rem' }}>◆</span>
            <span className="font-serif text-2xl" style={{ color: 'var(--text)', fontWeight: 400 }}>
              EventStaff <span style={{ fontStyle: 'italic', color: 'var(--flame)' }}>Nepal</span>
            </span>
          </Link>
          <h1
            className="font-serif block"
            style={{ fontSize: 'clamp(2.5rem, 7vw, 4rem)', color: 'var(--text)', fontWeight: 300, lineHeight: 1.1 }}
          >
            Welcome <span className="flame-text" style={{ fontStyle: 'italic', fontWeight: 600 }}>Back</span>
          </h1>
          <p className="mt-3 text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Sign in to your account
          </p>
        </div>

        {/* Card */}
        <div className="panel p-8 animate-slide-up">

          {/* Role tabs */}
          <div
            className="flex rounded-md p-1 mb-8"
            style={{ background: 'rgba(6,9,18,0.6)', border: '1px solid var(--border)' }}
          >
            {['organizer', 'worker'].map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => { setActiveTab(tab); setErrors({}); }}
                className="flex-1 py-2.5 rounded text-xs font-semibold uppercase tracking-widest transition-all duration-200"
                style={{
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                  background: activeTab === tab ? 'var(--surface-raised)' : 'transparent',
                  color: activeTab === tab ? 'var(--text)' : 'var(--text-muted)',
                  border: activeTab === tab ? '1px solid var(--border)' : '1px solid transparent',
                  borderRadius: '0.25rem',
                }}
              >
                {tab === 'organizer' ? 'Event Organiser' : 'Hospitality Worker'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-widest mb-2.5"
                style={{ color: 'var(--text-muted)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              >
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: '' })); }}
                className="input-field"
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="text-xs mt-1.5" style={{ color: 'var(--crimson)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-widest mb-2.5"
                style={{ color: 'var(--text-muted)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              >
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: '' })); }}
                className="input-field"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-xs mt-1.5" style={{ color: 'var(--crimson)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  {errors.password}
                </p>
              )}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 mt-2">
              {loading ? <LoadingSpinner size="sm" /> : 'Sign In'}
            </button>
          </form>

          {/* Test credentials */}
          <div className="mt-8 pt-7" style={{ borderTop: '1px solid var(--border)' }}>
            <p
              className="text-center text-xs uppercase tracking-widest mb-4"
              style={{ color: 'var(--text-dim)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              Quick fill — test credentials
            </p>
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
                    color: 'var(--text-muted)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(232,104,30,0.35)'; e.currentTarget.style.color = 'var(--text)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                >
                  {type === 'organizer' ? 'Organiser' : 'Worker'}
                </button>
              ))}
            </div>
          </div>

          <p
            className="text-center text-sm mt-7"
            style={{ color: 'var(--text-muted)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            No account?{' '}
            <Link
              to="/register"
              className="font-semibold transition-colors duration-150"
              style={{ color: 'var(--flame)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--flame-light)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--flame)'}
            >
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
