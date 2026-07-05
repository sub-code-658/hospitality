import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

const NotFoundPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-9xl font-bold text-gray-900/10 dark:text-white/10 mb-4">404</div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{t('common.page_not_found', 'Page Not Found')}</h1>
        <p className="text-gray-900/60 dark:text-white/60 mb-8 max-w-md mx-auto">{t('common.the_page_you_re_looking_for_do', "The page you're looking for doesn't exist or has been moved.")}</p>
        <Link
          to={user?.role === 'organizer' ? '/dashboard' : user?.role === 'worker' ? '/worker-dashboard' : '/'}
          className="btn-glass px-8 py-3 rounded-xl font-semibold inline-block"
        >{t('common.go_home', 'Go Home')}</Link>
      </div>
    </div>
  );
};

export default NotFoundPage;