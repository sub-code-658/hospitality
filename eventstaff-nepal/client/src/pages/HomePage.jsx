import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function HomePage() {
  const { user } = useAuth();
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedEvents();
  }, []);

  const getEventDateTime = (event, timeField) => {
    const date = new Date(event.eventDate);
    const [hour, minute] = (event[timeField] || '00:00').split(':').map(Number);
    const dateTime = new Date(date);
    dateTime.setHours(hour, minute, 0, 0);
    return dateTime;
  };

  const getEventState = (event) => {
    const now = new Date();
    const start = getEventDateTime(event, 'startTime');
    const end = getEventDateTime(event, 'endTime');

    if (now >= start && now <= end) return 'Ongoing';
    if (now < start) return 'Upcoming';
    return 'Closed';
  };

  const fetchFeaturedEvents = async () => {
    setEventsLoading(true);
    try {
      const res = await api.get('/events?status=active');
      setFeaturedEvents(res.data.slice(0, 6));
    } catch (error) {
      console.error('Failed to fetch featured events');
    } finally {
      setEventsLoading(false);
    }
  };

  const ongoingEvents = featuredEvents.filter((event) => getEventState(event) === 'Ongoing');
  const upcomingEvents = featuredEvents.filter((event) => getEventState(event) === 'Upcoming');

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Floating glass orbs */}
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full glass animate-float opacity-40"></div>
        <div className="absolute top-40 right-20 w-48 h-48 rounded-full glass animate-float opacity-30" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-32 h-32 rounded-full glass animate-float opacity-35" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-40 right-1/3 w-56 h-56 rounded-full glass animate-float opacity-25" style={{ animationDelay: '3s' }}></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 gradient-text glow-text">
              Smart Event Staffing Made Easy
            </h1>
            <p className="text-xl md:text-2xl text-white/80 mb-10 max-w-3xl mx-auto">
              Connect event organizers with professional hospitality workers across Nepal
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Link
                to={user?.role === 'organizer' ? '/dashboard' : '/post-event'}
                className="glass-btn text-white px-10 py-4 text-lg font-semibold"
              >
                Post an Event
              </Link>
              <Link
                to={user?.role === 'worker' ? '/worker-dashboard' : '/register'}
                className="glass text-white px-10 py-4 text-lg font-semibold hover:bg-white/20 transition-all duration-300 border-2 border-white/30"
              >
                Find Work
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Active Events Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white">Live & Upcoming Events</h2>
              <p className="text-white/60 max-w-2xl mt-2">
                Discover events that are currently running or starting soon, and book the right staff fast.
              </p>
            </div>
            <Link
              to={user?.role === 'worker' ? '/worker-dashboard' : user?.role === 'organizer' ? '/dashboard' : '/register'}
              className="glass-btn text-white px-6 py-3 font-semibold"
            >
              Browse Events
            </Link>
          </div>

          {eventsLoading ? (
            <div className="flex items-center justify-center py-20">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-card p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Ongoing Now</h3>
                {ongoingEvents.length === 0 ? (
                  <p className="text-white/50">No live events right now. Check upcoming events.</p>
                ) : (
                  ongoingEvents.map((event) => (
                    <div key={event._id} className="glass p-4 rounded-xl mb-4 border border-white/10">
                      <h4 className="text-lg font-semibold text-white">{event.title}</h4>
                      <p className="text-white/60 text-sm mt-1">{event.location}</p>
                      <p className="text-white/60 text-sm mt-2">
                        {new Date(event.eventDate).toLocaleDateString()} | {event.startTime} - {event.endTime}
                      </p>
                      <span className="inline-flex items-center mt-3 px-3 py-1 rounded-full bg-green-500/20 text-green-200 text-xs font-medium border border-green-400/30">
                        Ongoing
                      </span>
                    </div>
                  ))
                )}
              </div>

              <div className="glass-card p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Starting Soon</h3>
                {upcomingEvents.length === 0 ? (
                  <p className="text-white/50">No upcoming events yet. Refresh later for new opportunities.</p>
                ) : (
                  upcomingEvents.map((event) => (
                    <div key={event._id} className="glass p-4 rounded-xl mb-4 border border-white/10">
                      <h4 className="text-lg font-semibold text-white">{event.title}</h4>
                      <p className="text-white/60 text-sm mt-1">{event.location}</p>
                      <p className="text-white/60 text-sm mt-2">
                        {new Date(event.eventDate).toLocaleDateString()} | {event.startTime} - {event.endTime}
                      </p>
                      <span className="inline-flex items-center mt-3 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-medium border border-blue-400/30">
                        Upcoming
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-12 animate-slide-up">
            Why Choose EventStaff Nepal?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-card p-8 text-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="text-6xl mb-6">📅</div>
              <h3 className="text-xl font-semibold text-white mb-4">Smart Scheduling</h3>
              <p className="text-white/70">
                Our intelligent system prevents double-booking and helps you manage your schedule efficiently
              </p>
            </div>
            <div className="glass-card p-8 text-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="text-6xl mb-6">💬</div>
              <h3 className="text-xl font-semibold text-white mb-4">Real-time Chat</h3>
              <p className="text-white/70">
                Communicate instantly with organizers and workers through our built-in messaging system
              </p>
            </div>
            <div className="glass-card p-8 text-center animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <div className="text-6xl mb-6">✅</div>
              <h3 className="text-xl font-semibold text-white mb-4">Verified Workers</h3>
              <p className="text-white/70">
                All workers are vetted with skill ratings and reviews from previous events
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="glass-card p-8 text-center animate-scale-in" style={{ animationDelay: '0.1s' }}>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">500+</div>
              <div className="text-white/60">Active Workers</div>
            </div>
            <div className="glass-card p-8 text-center animate-scale-in" style={{ animationDelay: '0.2s' }}>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">200+</div>
              <div className="text-white/60">Events Completed</div>
            </div>
            <div className="glass-card p-8 text-center animate-scale-in" style={{ animationDelay: '0.3s' }}>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">50+</div>
              <div className="text-white/60">Partner Venues</div>
            </div>
            <div className="glass-card p-8 text-center animate-scale-in" style={{ animationDelay: '0.4s' }}>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">4.8</div>
              <div className="text-white/60">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="glass-strong rounded-3xl p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Get Started?</h2>
            <p className="text-xl text-white/70 mb-8">
              Join Nepal's fastest growing event staffing platform today
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="glass-btn text-white px-8 py-3 font-semibold"
              >
                Create Account
              </Link>
              <Link
                to="/login"
                className="glass text-white px-8 py-3 font-semibold hover:bg-white/20 transition-all duration-300 border-2 border-white/30"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="glass border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-white/50">© 2026 EventStaff Nepal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}