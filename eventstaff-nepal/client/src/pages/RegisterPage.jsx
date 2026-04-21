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
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    skills: [],
    experience: 'None'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const handleSkillToggle = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (role === 'worker' && formData.skills.length === 0) {
      newErrors.skills = 'Select at least one skill';
    }
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
    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role,
      skills: role === 'worker' ? formData.skills : undefined,
      experience: role === 'worker' ? formData.experience : undefined
    });
    setLoading(false);

    if (result.success) {
      addToast('Registration successful!', 'success');
      navigate('/dashboard');
    } else {
      addToast(result.message, 'error');
    }
  };

  return (
    <div className="min-h-screen py-12 px-4">
      {/* Floating orbs */}
      <div className="absolute top-20 right-20 w-56 h-56 rounded-full glass animate-float opacity-20"></div>
      <div className="absolute bottom-40 left-16 w-40 h-40 rounded-full glass animate-float opacity-15" style={{ animationDelay: '1.5s' }}></div>

      <div className="relative z-10 max-w-lg mx-auto">
        <div className="text-center mb-10 animate-slide-up">
          <h1 className="text-4xl font-bold gradient-text glow-text mb-3">Create Account</h1>
          <p className="text-white/60">Join EventStaff Nepal today</p>
        </div>

        <div className="glass-card p-8 animate-scale-in">
          {/* Role Toggle */}
          <div className="flex mb-8 bg-white/5 rounded-xl p-1">
            <button
              type="button"
              onClick={() => setRole('organizer')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                role === 'organizer'
                  ? 'bg-white/15 text-white shadow-lg'
                  : 'text-white/50 hover:text-white/70'
              }`}
            >
              Event Organizer
            </button>
            <button
              type="button"
              onClick={() => setRole('worker')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                role === 'worker'
                  ? 'bg-white/15 text-white shadow-lg'
                  : 'text-white/50 hover:text-white/70'
              }`}
            >
              Hospitality Worker
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-4 rounded-xl glass-input text-white placeholder-white/40"
                placeholder="Your full name"
              />
              {errors.name && <p className="text-red-300 text-sm mt-2">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-4 rounded-xl glass-input text-white placeholder-white/40"
                placeholder="you@example.com"
              />
              {errors.email && <p className="text-red-300 text-sm mt-2">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-4 rounded-xl glass-input text-white placeholder-white/40"
                placeholder="Min. 6 characters"
              />
              {errors.password && <p className="text-red-300 text-sm mt-2">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-4 rounded-xl glass-input text-white placeholder-white/40"
                placeholder="Re-enter password"
              />
              {errors.confirmPassword && <p className="text-red-300 text-sm mt-2">{errors.confirmPassword}</p>}
            </div>

            {/* Worker-specific fields */}
            {role === 'worker' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-3">Skills</label>
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
                  {errors.skills && <p className="text-red-300 text-sm mt-2">{errors.skills}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Experience Level</label>
                  <select
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    className="w-full px-4 py-4 rounded-xl glass-input text-white"
                  >
                    {EXPERIENCE_LEVELS.map(level => (
                      <option key={level} value={level} className="bg-gray-800">{level}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full glass-btn text-white py-4 rounded-xl font-semibold flex items-center justify-center mt-6"
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Create Account'}
            </button>
          </form>

          <p className="text-center mt-8 text-white/60">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-300 font-medium hover:text-primary-200 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}