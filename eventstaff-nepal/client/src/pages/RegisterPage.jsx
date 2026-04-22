import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';

const SKILLS = ['Waiter', 'Bartender', 'Chef', 'Host', 'Security'];
const EXPERIENCE_LEVELS = ['None', '0-1 years', '1-3 years', '3-5 years', '5+ years'];

export default function RegisterPage() {
  const [role, setRole] = useState('worker');
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '', skills: [], experience: 'None',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
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
      navigate('/dashboard');
    } else {
      addToast(result.message, 'error');
    }
  };

  const FieldLabel = ({ children }) => (
    <label
      className="block text-xs font-semibold uppercase tracking-widest mb-2.5"
      style={{ color: 'var(--text-muted)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
    >
      {children}
    </label>
  );

  const FieldError = ({ msg }) =>
    msg ? (
      <p className="text-xs mt-1.5" style={{ color: 'var(--crimson)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
        {msg}
      </p>
    ) : null;

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-16 relative"
      style={{ background: 'var(--bg)' }}
    >
      <div
        className="absolute bottom-0 left-0 w-96 h-96 pointer-events-none"
        style={{ background: 'radial-gradient(circle at bottom left, rgba(232,104,30,0.05) 0%, transparent 65%)' }}
      />

      <div className="relative z-10 w-full max-w-lg">

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
            Create <span className="flame-text" style={{ fontStyle: 'italic', fontWeight: 600 }}>Account</span>
          </h1>
          <p className="mt-3 text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Join EventStaff Nepal today
          </p>
        </div>

        {/* Card */}
        <div className="panel p-8 animate-slide-up">

          {/* Role toggle */}
          <div
            className="flex rounded-md p-1 mb-8"
            style={{ background: 'rgba(6,9,18,0.6)', border: '1px solid var(--border)' }}
          >
            {['organizer', 'worker'].map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className="flex-1 py-2.5 rounded text-xs font-semibold uppercase tracking-widest transition-all duration-200"
                style={{
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                  background: role === r ? 'var(--surface-raised)' : 'transparent',
                  color: role === r ? 'var(--text)' : 'var(--text-muted)',
                  border: role === r ? '1px solid var(--border)' : '1px solid transparent',
                  borderRadius: '0.25rem',
                }}
              >
                {r === 'organizer' ? 'Event Organiser' : 'Hospitality Worker'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <FieldLabel>Full Name</FieldLabel>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="input-field" placeholder="Your full name" />
              <FieldError msg={errors.name} />
            </div>

            <div>
              <FieldLabel>Email Address</FieldLabel>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="input-field" placeholder="you@example.com" />
              <FieldError msg={errors.email} />
            </div>

            <div>
              <FieldLabel>Password</FieldLabel>
              <input type="password" name="password" value={formData.password} onChange={handleChange} className="input-field" placeholder="Min. 6 characters" />
              <FieldError msg={errors.password} />
            </div>

            <div>
              <FieldLabel>Confirm Password</FieldLabel>
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="input-field" placeholder="Re-enter password" />
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
                          className="px-4 py-2 rounded text-xs font-semibold uppercase tracking-widest transition-all duration-200"
                          style={{
                            fontFamily: 'Plus Jakarta Sans, sans-serif',
                            background: active ? 'rgba(232, 104, 30, 0.15)' : 'transparent',
                            border: `1px solid ${active ? 'rgba(232, 104, 30, 0.4)' : 'var(--border)'}`,
                            color: active ? 'var(--flame-light)' : 'var(--text-muted)',
                          }}
                          onMouseEnter={e => {
                            if (!active) {
                              e.currentTarget.style.borderColor = 'rgba(232,104,30,0.3)';
                              e.currentTarget.style.color = 'var(--text)';
                            }
                          }}
                          onMouseLeave={e => {
                            if (!active) {
                              e.currentTarget.style.borderColor = 'var(--border)';
                              e.currentTarget.style.color = 'var(--text-muted)';
                            }
                          }}
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

            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 mt-2">
              {loading ? <LoadingSpinner size="sm" /> : 'Create Account'}
            </button>
          </form>

          <p
            className="text-center text-sm mt-7"
            style={{ color: 'var(--text-muted)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold transition-colors duration-150"
              style={{ color: 'var(--flame)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--flame-light)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--flame)'}
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
