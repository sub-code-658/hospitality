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
    const newErrors = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Invalid email format';
    if (!password) newErrors.password = 'Password is required';
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
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      addToast('Login successful!', 'success');
      navigate('/dashboard');
    } else {
      addToast(result.message, 'error');
    }
  };

  const fillTestCredentials = (type) => {
    if (type === 'organizer') {
      setEmail('rajesh@events.com');
    } else {
      setEmail('amit@gmail.com');
    }
    setPassword('password123');
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      {/* Floating orbs for visual effect */}
      <div className="absolute top-1/4 left-10 w-48 h-48 rounded-full glass animate-float opacity-20"></div>
      <div className="absolute bottom-1/4 right-10 w-64 h-64 rounded-full glass animate-float opacity-15" style={{ animationDelay: '2s' }}></div>

      <div className="relative z-10 max-w-md w-full">
        <div className="text-center mb-10 animate-slide-up">
          <h1 className="text-4xl font-bold gradient-text glow-text mb-3">Welcome Back</h1>
          <p className="text-white/60">Sign in to your EventStaff Nepal account</p>
        </div>

        <div className="glass-card p-8 animate-scale-in">
          {/* Role Tabs */}
          <div className="flex mb-8 bg-white/5 rounded-xl p-1">
            <button
              type="button"
              onClick={() => { setActiveTab('organizer'); setErrors({}); }}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                activeTab === 'organizer'
                  ? 'bg-white/15 text-white shadow-lg'
                  : 'text-white/50 hover:text-white/70'
              }`}
            >
              Event Organizer
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('worker'); setErrors({}); }}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                activeTab === 'worker'
                  ? 'bg-white/15 text-white shadow-lg'
                  : 'text-white/50 hover:text-white/70'
              }`}
            >
              Hospitality Worker
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors({ ...errors, email: '' }); }}
                className={`w-full px-4 py-4 rounded-xl glass-input text-white placeholder-white/40`}
                placeholder="you@example.com"
              />
              {errors.email && <p className="text-red-300 text-sm mt-2">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors({ ...errors, password: '' }); }}
                className={`w-full px-4 py-4 rounded-xl glass-input text-white placeholder-white/40`}
                placeholder="••••••••"
              />
              {errors.password && <p className="text-red-300 text-sm mt-2">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full glass-btn text-white py-4 rounded-xl font-semibold flex items-center justify-center"
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Sign In'}
            </button>
          </form>

          {/* Test Credentials */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-sm text-white/40 text-center mb-4">Quick fill test credentials:</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => fillTestCredentials('organizer')}
                className="flex-1 glass text-white/70 py-2 rounded-lg hover:bg-white/10 transition-all duration-300 text-sm border border-white/10"
              >
                Organizer Test
              </button>
              <button
                type="button"
                onClick={() => fillTestCredentials('worker')}
                className="flex-1 glass text-white/70 py-2 rounded-lg hover:bg-white/10 transition-all duration-300 text-sm border border-white/10"
              >
                Worker Test
              </button>
            </div>
          </div>

          <p className="text-center mt-8 text-white/60">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-300 font-medium hover:text-primary-200 transition-colors">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}