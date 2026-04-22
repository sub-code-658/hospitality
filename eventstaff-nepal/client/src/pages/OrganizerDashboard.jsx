import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import ApplicationCard from '../components/ApplicationCard';
import LoadingSpinner from '../components/LoadingSpinner';

const VIEW_MODES = ['timeline', 'list', 'calendar'];

export default function OrganizerDashboard() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showApplications, setShowApplications] = useState(false);
  const [viewMode, setViewMode] = useState('timeline');
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    if (user?.role !== 'organizer') navigate('/');
    else fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      const [eventsRes, appsRes] = await Promise.all([
        api.get('/events/organizer/my-events'),
        api.get('/applications/my'),
      ]);
      setEvents(eventsRes.data);
      setApplications(appsRes.data);
    } catch {
      addToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appId, status) => {
    if (!window.confirm(`${status} this application?`)) return;
    try {
      await api.put(`/applications/${appId}/status`, { status });
      addToast(`Application ${status}`, 'success');
      fetchData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update', 'error');
    }
  };

  const handleAssign = async (appId, assignedRole, shiftNotes) => {
    try {
      await api.put(`/applications/${appId}/assign`, { assignedRole, shiftNotes });
      addToast('Assignment saved', 'success');
      fetchData();
      if (selectedEvent) handleViewApplications(selectedEvent);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save', 'error');
    }
  };

  const getEventDateTime = (event, field) => {
    const d = new Date(event.eventDate);
    const [h, m] = (event[field] || '00:00').split(':').map(Number);
    d.setHours(h, m, 0, 0);
    return d;
  };

  const formatState = (event) => {
    const now = new Date();
    const start = getEventDateTime(event, 'startTime');
    const end = getEventDateTime(event, 'endTime');
    if (now >= start && now <= end) return 'Ongoing';
    if (now < start) return 'Upcoming';
    return 'Closed';
  };

  const STATE_COLOR = { Ongoing: 'var(--flame)', Upcoming: 'var(--gold)', Closed: 'var(--text-dim)' };

  const filteredEvents = events.filter(e =>
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStaffEvents = filteredEvents.filter(e =>
    e.status === 'active' && e.totalPositions > 0 && e.acceptedCount < e.totalPositions
  );

  const urgentStaffEvents = lowStaffEvents.filter(e => {
    const now = new Date();
    const start = getEventDateTime(e, 'startTime');
    return start > now && start - now <= 24 * 60 * 60 * 1000;
  });

  const sortedEvents = [...filteredEvents].sort(
    (a, b) => getEventDateTime(a, 'startTime') - getEventDateTime(b, 'startTime')
  );

  const getDateKey = (d) => new Date(d).toDateString();

  const eventsByDate = filteredEvents.reduce((map, e) => {
    const key = getDateKey(e.eventDate);
    if (!map[key]) map[key] = [];
    map[key].push(e);
    return map;
  }, {});

  const selectedDayEvents = eventsByDate[getDateKey(selectedDate)] || [];

  const daysInMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate();
  const firstDayIndex = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1).getDay();
  const calendarCells = Array.from({ length: 42 }).map((_, i) => {
    const dayNumber = i - firstDayIndex + 1;
    return new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), dayNumber);
  });

  const changeMonth = (offset) => {
    const next = new Date(calendarMonth);
    next.setMonth(next.getMonth() + offset);
    setCalendarMonth(next);
  };

  const handleViewApplications = async (event) => {
    setSelectedEvent(event);
    setShowApplications(true);
    try {
      const res = await api.get(`/applications/event/${event._id}`);
      setApplications(res.data);
    } catch {
      addToast('Failed to load applications', 'error');
    }
  };

  const SectionLabel = ({ children }) => (
    <span className="label" style={{ fontSize: '0.6rem', letterSpacing: '0.2em' }}>{children}</span>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 animate-fade-in">
        <div>
          <p className="label mb-3">Welcome back</p>
          <h1
            className="font-serif"
            style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', color: 'var(--text)', fontWeight: 400 }}
          >
            {user?.name}
          </h1>
        </div>
        <Link to="/post-event" className="btn-primary px-6 py-3 text-xs">
          + Post New Event
        </Link>
      </div>

      {/* Stats row */}
      <div
        className="grid grid-cols-3 mb-12 animate-slide-up"
        style={{ border: '1px solid var(--border)', borderRadius: '0.5rem', overflow: 'hidden' }}
      >
        {[
          { value: events.length, label: 'Total Events', color: 'var(--text)' },
          { value: events.filter(e => e.status === 'active').length, label: 'Active', color: 'var(--sage)' },
          { value: applications.filter(a => a.status === 'pending').length, label: 'Pending Apps', color: 'var(--flame)' },
        ].map((stat, i) => (
          <div
            key={i}
            className="px-8 py-8"
            style={{
              borderRight: i < 2 ? '1px solid var(--border)' : 'none',
              background: 'var(--surface)',
            }}
          >
            <div
              className="font-serif mb-1"
              style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', color: stat.color, fontWeight: 300, lineHeight: 1 }}
            >
              {stat.value}
            </div>
            <div className="label" style={{ fontSize: '0.6rem', opacity: 0.6 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Alerts + Timeline grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">

        {/* Staffing alerts */}
        <div className="card p-6 animate-fade-in stagger-3">
          <div className="flex items-center justify-between mb-6">
            <SectionLabel>Staffing Alerts</SectionLabel>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Open Positions', value: lowStaffEvents.length, color: 'var(--text)', border: 'var(--border)' },
              { label: 'Urgent (24 h)', value: urgentStaffEvents.length, color: 'var(--crimson)', border: 'rgba(204,59,59,0.2)' },
              { label: 'Fully Staffed', value: filteredEvents.filter(e => e.filled).length, color: 'var(--sage)', border: 'rgba(107,175,138,0.2)' },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-4 py-3.5 rounded-md"
                style={{ background: 'rgba(6,9,18,0.5)', border: `1px solid ${item.border}` }}
              >
                <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{item.label}</span>
                <span className="font-serif text-3xl" style={{ color: item.color, fontWeight: 300 }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline / Calendar */}
        <div className="card p-6 lg:col-span-2 animate-fade-in stagger-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <SectionLabel>Schedule</SectionLabel>
              <h3 className="font-serif text-2xl mt-1" style={{ color: 'var(--text)', fontWeight: 400 }}>
                Timeline &amp; Calendar
              </h3>
            </div>
            <div
              className="flex rounded-md overflow-hidden"
              style={{ border: '1px solid var(--border)' }}
            >
              {VIEW_MODES.map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className="px-3.5 py-2 text-xs font-semibold uppercase tracking-widest transition-all duration-150"
                  style={{
                    fontFamily: 'Plus Jakarta Sans, sans-serif',
                    background: viewMode === mode ? 'rgba(232,104,30,0.12)' : 'transparent',
                    color: viewMode === mode ? 'var(--flame)' : 'var(--text-muted)',
                    borderRight: mode !== 'calendar' ? '1px solid var(--border)' : 'none',
                  }}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm mb-4" style={{ color: 'var(--text-dim)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                No events yet.
              </p>
              <Link to="/post-event" className="label text-[0.65rem]" style={{ color: 'var(--flame)' }}>
                Post your first event →
              </Link>
            </div>
          ) : viewMode === 'calendar' ? (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h4 className="font-serif text-lg" style={{ color: 'var(--text)', fontWeight: 400 }}>
                  {calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h4>
                <div className="flex gap-2">
                  <button onClick={() => changeMonth(-1)} className="btn-secondary px-3.5 py-1.5 text-xs">←</button>
                  <button onClick={() => changeMonth(1)} className="btn-secondary px-3.5 py-1.5 text-xs">→</button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-px" style={{ background: 'var(--border)' }}>
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                  <div key={d} className="py-2 text-center text-xs font-semibold uppercase tracking-widest"
                    style={{ background: 'var(--surface)', color: 'var(--text-dim)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    {d}
                  </div>
                ))}
                {calendarCells.map((day, idx) => {
                  const key = getDateKey(day);
                  const dayEvts = eventsByDate[key] || [];
                  const inMonth = day.getMonth() === calendarMonth.getMonth();
                  const isSelected = key === getDateKey(selectedDate);
                  return (
                    <button
                      key={`${key}-${idx}`}
                      type="button"
                      onClick={() => { setSelectedDate(day); setViewMode('calendar'); }}
                      className="min-h-[70px] p-2 text-left transition-colors duration-150"
                      style={{
                        background: isSelected ? 'rgba(232,104,30,0.08)' : 'var(--surface)',
                        outline: isSelected ? '1px solid rgba(232,104,30,0.3)' : 'none',
                        opacity: inMonth ? 1 : 0.25,
                      }}
                      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(232,104,30,0.04)'; }}
                      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'var(--surface)'; }}
                    >
                      <span className="text-xs font-medium" style={{ color: inMonth ? 'var(--text)' : 'var(--text-dim)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                        {day.getDate()}
                      </span>
                      <div className="mt-1 space-y-0.5">
                        {dayEvts.slice(0, 2).map(e => (
                          <div key={e._id} className="truncate rounded px-1 py-0.5 text-[9px]"
                            style={{ background: 'rgba(232,104,30,0.12)', color: 'var(--flame-light)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                            {e.title}
                          </div>
                        ))}
                        {dayEvts.length > 2 && (
                          <div className="text-[9px]" style={{ color: 'var(--text-dim)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                            +{dayEvts.length - 2}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="rounded-md p-4" style={{ background: 'rgba(6,9,18,0.5)', border: '1px solid var(--border)' }}>
                <SectionLabel>
                  {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </SectionLabel>
                {selectedDayEvents.length === 0 ? (
                  <p className="text-xs mt-3" style={{ color: 'var(--text-dim)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>No events scheduled.</p>
                ) : (
                  <div className="space-y-3 mt-3">
                    {selectedDayEvents.map(e => (
                      <div key={e._id} className="flex justify-between gap-3">
                        <div>
                          <h5 className="font-serif text-base" style={{ color: 'var(--text)' }}>{e.title}</h5>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{e.location}</p>
                        </div>
                        <div className="text-right text-xs flex-shrink-0" style={{ color: 'var(--text-muted)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                          <div>{e.startTime}–{e.endTime}</div>
                          <div>{e.acceptedCount ?? 0}/{e.totalPositions ?? 0} hired</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : viewMode === 'timeline' ? (
            <div className="space-y-4">
              {sortedEvents.map((event, i) => {
                const state = formatState(event);
                return (
                  <div key={event._id} className="flex gap-4">
                    <div className="flex flex-col items-center flex-shrink-0" style={{ paddingTop: '2px' }}>
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: STATE_COLOR[state] }} />
                      {i < sortedEvents.length - 1 && (
                        <div className="w-px flex-1 mt-1.5" style={{ background: 'var(--border)', minHeight: '32px' }} />
                      )}
                    </div>
                    <div
                      className="flex-1 p-4 rounded-md mb-2 transition-colors duration-150"
                      style={{ background: 'rgba(6,9,18,0.5)', border: '1px solid var(--border)' }}
                    >
                      <div className="flex justify-between items-start gap-3 mb-2">
                        <h4 className="font-serif text-lg" style={{ color: 'var(--text)', fontWeight: 400 }}>{event.title}</h4>
                        <span
                          className="text-[0.6rem] font-bold uppercase tracking-widest flex-shrink-0 px-2 py-1 rounded"
                          style={{
                            background: `${STATE_COLOR[state]}15`,
                            color: STATE_COLOR[state],
                            fontFamily: 'Plus Jakarta Sans, sans-serif',
                          }}
                        >
                          {state}
                        </span>
                      </div>
                      <p className="text-xs mb-3" style={{ color: 'var(--text-muted)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{event.location}</p>
                      <div className="flex flex-wrap gap-4 text-xs" style={{ color: 'var(--text-dim)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                        <span>{new Date(event.eventDate).toLocaleDateString()} · {event.startTime}–{event.endTime}</span>
                        <span>{event.acceptedCount ?? 0}/{event.totalPositions ?? 0} hired</span>
                        <span>{event.filled ? '✓ Filled' : `${(event.totalPositions ?? 0) - (event.acceptedCount ?? 0)} open`}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3">
              {sortedEvents.map(event => {
                const state = formatState(event);
                return (
                  <div
                    key={event._id}
                    className="p-4 rounded-md"
                    style={{ background: 'rgba(6,9,18,0.5)', border: '1px solid var(--border)' }}
                  >
                    <div className="flex justify-between gap-3 mb-2">
                      <h4 className="font-serif text-lg" style={{ color: 'var(--text)', fontWeight: 400 }}>{event.title}</h4>
                      <div className="flex items-start gap-2 flex-shrink-0">
                        <span className="tag">{event.filled ? 'Filled' : 'Open'}</span>
                        <span className="tag" style={{ background: `${STATE_COLOR[state]}12`, borderColor: `${STATE_COLOR[state]}25`, color: STATE_COLOR[state] }}>{state}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4 text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                      <span>{new Date(event.eventDate).toLocaleDateString()}</span>
                      <span>{event.startTime}–{event.endTime}</span>
                      <span>{event.acceptedCount ?? 0}/{event.totalPositions ?? 0} hired</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Events list */}
      <div className="card overflow-hidden animate-fade-in stagger-5">
        <div
          className="px-6 py-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <SectionLabel>My Events</SectionLabel>
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="input-field w-full md:w-56 text-sm"
          />
        </div>

        <div className="p-6">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-sm mb-4" style={{ color: 'var(--text-dim)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                No events found
              </p>
              <Link to="/post-event" className="label text-[0.65rem]" style={{ color: 'var(--flame)' }}>
                Post your first event →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEvents.map(event => (
                <div
                  key={event._id}
                  className="p-5 rounded-md transition-colors duration-150"
                  style={{ background: 'rgba(6,9,18,0.4)', border: '1px solid var(--border)' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(232,104,30,0.15)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-serif text-xl mb-1" style={{ color: 'var(--text)', fontWeight: 400 }}>
                        {event.title}
                      </h3>
                      <p className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                        {new Date(event.eventDate).toLocaleDateString()} · {event.startTime}–{event.endTime}
                      </p>
                    </div>
                    <span className="tag flex-shrink-0">{event.status}</span>
                  </div>

                  <p className="text-sm mb-4" style={{ color: 'var(--text-muted)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    {event.location}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {event.rolesNeeded.map((role, idx) => (
                      <span key={idx} className="tag">{role.roleName} ×{role.count}</span>
                    ))}
                    <span
                      className="tag"
                      style={{
                        background: 'rgba(107,175,138,0.1)',
                        borderColor: 'rgba(107,175,138,0.2)',
                        color: 'var(--sage)',
                      }}
                    >
                      {event.acceptedCount ?? 0}/{event.totalPositions ?? event.rolesNeeded.reduce((s, r) => s + r.count, 0)} hired
                    </span>
                    {event.filled && (
                      <span className="tag" style={{ background: 'rgba(107,175,138,0.12)', borderColor: 'rgba(107,175,138,0.25)', color: 'var(--sage)' }}>
                        Filled ✓
                      </span>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Link to={`/events/${event._id}`} className="btn-secondary text-xs px-5 py-2">
                      View Details
                    </Link>
                    <button onClick={() => handleViewApplications(event)} className="btn-primary text-xs px-5 py-2">
                      Applicants ({event.applicationCount || 0})
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Applications modal */}
      {showApplications && selectedEvent && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4 animate-fade-in"
          style={{ background: 'rgba(4,6,12,0.85)', backdropFilter: 'blur(8px)' }}
        >
          <div
            className="max-w-2xl w-full max-h-[80vh] flex flex-col rounded-lg overflow-hidden animate-scale-in"
            style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)', boxShadow: '0 24px 80px rgba(0,0,0,0.7)' }}
          >
            <div
              className="px-6 py-5 flex justify-between items-center flex-shrink-0"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <div>
                <span className="label text-[0.6rem] block mb-1">Applications</span>
                <h3 className="font-serif text-xl" style={{ color: 'var(--text)', fontWeight: 400 }}>
                  {selectedEvent.title}
                </h3>
              </div>
              <button
                onClick={() => setShowApplications(false)}
                className="p-2 rounded-md transition-colors duration-150"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(232,104,30,0.08)'; e.currentTarget.style.color = 'var(--text)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto p-6 flex-1">
              {applications.length === 0 ? (
                <p className="text-center py-8 text-sm" style={{ color: 'var(--text-dim)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  No applications yet
                </p>
              ) : (
                applications.map(app => (
                  <ApplicationCard
                    key={app._id}
                    application={app}
                    eventRoles={selectedEvent?.rolesNeeded || []}
                    isOrganizer
                    onStatusChange={handleStatusChange}
                    onAssign={handleAssign}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
