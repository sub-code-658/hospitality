import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import EventCard from '../components/EventCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import { ROLES } from '../utils/constants';

export default function EventsPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [searchParams] = useSearchParams();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    role: searchParams.get('role') || '',
    date: searchParams.get('date') || '',
    status: 'active',
  });
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalCount: 0 });

  useEffect(() => { fetchEvents(); }, [filters, pagination.currentPage]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.role) params.append('role', filters.role);
      if (filters.date) params.append('date', filters.date);
      if (filters.status) params.append('status', filters.status);
      params.append('page', pagination.currentPage);
      params.append('limit', 12);
      const res = await api.get(`/events?${params.toString()}`);
      setEvents(res.data.events || []);
      if (res.data.pagination) setPagination(res.data.pagination);
    } catch {
      addToast('Failed to load events', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const clearFilters = () => {
    setFilters({ search: '', role: '', date: '', status: 'active' });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const FilterLabel = ({ children }) => (
    <label
      className="block text-xs font-semibold uppercase tracking-widest mb-2"
      style={{ color: 'var(--text-muted)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
    >
      {children}
    </label>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">

      {/* Header */}
      <div className="mb-12 animate-fade-in">
        <p className="label mb-3">Explore</p>
        <h1
          className="font-serif mb-2"
          style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: 'var(--text)', fontWeight: 400, lineHeight: 1.1 }}
        >
          Browse Events
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          Find and apply to upcoming hospitality opportunities across Nepal
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* Filters sidebar */}
        <aside className="lg:col-span-1">
          <div className="panel p-6 sticky top-24 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <span className="label text-[0.65rem]">Filters</span>
              <button
                onClick={clearFilters}
                className="text-xs transition-colors duration-150"
                style={{ color: 'var(--text-dim)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--flame)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}
              >
                Clear all
              </button>
            </div>

            {/* Search */}
            <form
              onSubmit={e => { e.preventDefault(); fetchEvents(); }}
              className="mb-6"
            >
              <FilterLabel>Search</FilterLabel>
              <div className="relative">
                <input
                  type="text"
                  value={filters.search}
                  onChange={e => handleFilterChange('search', e.target.value)}
                  placeholder="Event name, location..."
                  className="input-field pr-10 text-sm"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-150"
                  style={{ color: 'var(--text-dim)' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--flame)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </form>

            <div className="space-y-5">
              <div>
                <FilterLabel>Role Type</FilterLabel>
                <select
                  value={filters.role}
                  onChange={e => handleFilterChange('role', e.target.value)}
                  className="input-field text-sm"
                  style={{ colorScheme: 'dark' }}
                >
                  <option value="">All Roles</option>
                  {ROLES.map(r => (
                    <option key={r} value={r} style={{ background: 'var(--surface)' }}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <FilterLabel>Date</FilterLabel>
                <input
                  type="date"
                  value={filters.date}
                  onChange={e => handleFilterChange('date', e.target.value)}
                  className="input-field text-sm"
                  style={{ colorScheme: 'dark' }}
                />
              </div>
            </div>

            {/* Post event CTA for organisers */}
            {user?.role === 'organizer' && (
              <Link
                to="/post-event"
                className="btn-primary w-full mt-8 py-3 text-xs"
              >
                + Post Event
              </Link>
            )}
          </div>
        </aside>

        {/* Events grid */}
        <div className="lg:col-span-3">
          {/* Result count */}
          {!loading && events.length > 0 && (
            <p
              className="text-xs mb-5"
              style={{ color: 'var(--text-dim)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              {pagination.totalCount} event{pagination.totalCount !== 1 ? 's' : ''} found
            </p>
          )}

          {loading ? (
            <div className="flex justify-center py-20">
              <LoadingSpinner />
            </div>
          ) : events.length === 0 ? (
            <EmptyState
              icon="◆"
              title="No events found"
              description="Try adjusting your filters or check back later for new opportunities."
              action={clearFilters}
              actionLabel="Clear Filters"
            />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {events.map((event, i) => (
                  <div
                    key={event._id}
                    className="animate-slide-up"
                    style={{ animationDelay: `${Math.min(i * 0.05, 0.3)}s` }}
                  >
                    <EventCard event={event} />
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-12">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                    disabled={pagination.currentPage === 1}
                    className="btn-secondary px-5 py-2.5 text-xs disabled:opacity-30"
                  >
                    ← Previous
                  </button>
                  <span
                    className="text-xs px-4"
                    style={{ color: 'var(--text-muted)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                  >
                    {pagination.currentPage} / {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="btn-secondary px-5 py-2.5 text-xs disabled:opacity-30"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
