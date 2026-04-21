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
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    role: searchParams.get('role') || '',
    date: searchParams.get('date') || '',
    status: 'active'
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0
  });

  useEffect(() => {
    fetchEvents();
  }, [filters, pagination.currentPage]);

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
      if (res.data.pagination) {
        setPagination(res.data.pagination);
      }
    } catch (error) {
      addToast('Failed to load events', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchEvents();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-10 animate-slide-up">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Browse Events</h1>
        <p className="text-white/60">Find and apply to upcoming events</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <div className="glass-card p-6 sticky top-24 animate-slide-up">
            <h3 className="text-lg font-semibold text-white mb-4">Filters</h3>

            <form onSubmit={handleSearch} className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Search events..."
                  className="w-full px-4 py-3 rounded-xl glass-input text-white placeholder-white/40"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </form>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">Role Type</label>
                <select
                  value={filters.role}
                  onChange={(e) => handleFilterChange('role', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl glass-input text-white"
                >
                  <option value="">All Roles</option>
                  {ROLES.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">Date</label>
                <input
                  type="date"
                  value={filters.date}
                  onChange={(e) => handleFilterChange('date', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl glass-input text-white"
                />
              </div>

              <button
                onClick={() => setFilters({ search: '', role: '', date: '', status: 'active' })}
                className="w-full glass text-white/70 py-2 rounded-xl hover:bg-white/10 transition-all duration-300 text-sm border border-white/10"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <LoadingSpinner />
            </div>
          ) : events.length === 0 ? (
            <EmptyState
              icon="🎪"
              title="No events found"
              description="Try adjusting your filters or check back later for new opportunities."
              action={() => setFilters({ search: '', role: '', date: '', status: 'active' })}
              actionLabel="Clear Filters"
            />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {events.map(event => (
                  <EventCard key={event._id} event={event} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                    disabled={pagination.currentPage === 1}
                    className="glass px-4 py-2 rounded-xl text-white disabled:opacity-50 hover:bg-white/10 transition-all"
                  >
                    Previous
                  </button>
                  <span className="flex items-center text-white/60 px-4">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="glass px-4 py-2 rounded-xl text-white disabled:opacity-50 hover:bg-white/10 transition-all"
                  >
                    Next
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