import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from './context/AuthContext';
import { Suspense, lazy } from 'react';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import WorkerDashboard from './pages/WorkerDashboard';
import PostEventPage from './pages/PostEventPage';
import EditEventPage from './pages/EditEventPage';
import EventDetailPage from './pages/EventDetailPage';
import EventsPage from './pages/EventsPage';
import MessagesPage from './pages/MessagesPage';
import ProfilePage from './pages/ProfilePage';
import WorkerProfilePage from './pages/WorkerProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import AdminPage from './pages/AdminPage';
import NotFoundPage from './pages/NotFoundPage';
import LeaveReviewPage from './pages/LeaveReviewPage';
import LoadingSpinner from './components/LoadingSpinner';
import PaymentCallbackPage from './pages/PaymentCallbackPage';

const OrganizerDashboard = lazy(() => import('./pages/OrganizerDashboard'));

function App() {
  const { user, loading } = useAuth();
  const { t, i18n } = useTranslation();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: '#060912' }}>
        <div className="spinner" />
        <span className="label text-[0.65rem]" style={{ color: 'var(--flame)' }}>{t('common.loading', 'Loading')}</span>
      </div>
    );
  }

  return (
    <Router>
      <div key={i18n.language} className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={user ? <Navigate to={user.role === 'organizer' ? '/dashboard' : '/worker-dashboard'} /> : <LoginPage />} />
            <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <RegisterPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:id" element={<EventDetailPage />} />
            <Route path="/workers/:id" element={<WorkerProfilePage />} />
            <Route path="/dashboard" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>}><ProtectedRoute allowedRoles={['organizer', 'admin']}><OrganizerDashboard /></ProtectedRoute></Suspense>} />
            <Route path="/worker-dashboard" element={<ProtectedRoute allowedRoles={['worker']}><WorkerDashboard /></ProtectedRoute>} />
            <Route path="/post-event" element={<ProtectedRoute allowedRoles={['organizer', 'admin']}><PostEventPage /></ProtectedRoute>} />
            <Route path="/events/:id/edit" element={<ProtectedRoute allowedRoles={['organizer', 'admin']}><EditEventPage /></ProtectedRoute>} />
            <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
            <Route path="/reviews/leave" element={<ProtectedRoute><LeaveReviewPage /></ProtectedRoute>} />
            <Route path="/payments/callback" element={<ProtectedRoute><PaymentCallbackPage /></ProtectedRoute>} />
            <Route path="/admin" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>}><ProtectedRoute allowedRoles={['admin']}><AdminPage /></ProtectedRoute></Suspense>} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
