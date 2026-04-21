import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NotFoundPage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-9xl font-bold text-white/10 mb-4">404</div>
        <h1 className="text-3xl font-bold text-white mb-4">Page Not Found</h1>
        <p className="text-white/60 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to={user?.role === 'organizer' ? '/dashboard' : user?.role === 'worker' ? '/worker-dashboard' : '/'}
          className="glass-btn text-white px-8 py-3 rounded-xl font-semibold inline-block"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;