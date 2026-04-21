import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import ApplicationCard from '../components/ApplicationCard';
import LoadingSpinner from '../components/LoadingSpinner';

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
    if (user?.role !== 'organizer') {
      navigate('/');
    } else {
      fetchData();
    }
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      const [eventsRes, appsRes] = await Promise.all([
        api.get('/events/organizer/my-events'),
        api.get('/applications/my')
      ]);
      setEvents(eventsRes.data);
      setApplications(appsRes.data);
    } catch (error) {
      addToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (applicationId, status) => {
    if (!window.confirm(`Are you sure you want to ${status} this application?`)) return;

    try {
      await api.put(`/applications/${applicationId}/status`, { status });
      addToast(`Application ${status} successfully`, 'success');
      fetchData();
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to update status', 'error');
    }
  };

  const handleAssign = async (applicationId, assignedRole, shiftNotes) => {
    try {
      await api.put(`/applications/${applicationId}/assign`, { assignedRole, shiftNotes });
      addToast('Worker assignment saved', 'success');
      fetchData();
      if (selectedEvent) {
        handleViewApplications(selectedEvent);
      }
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to save assignment', 'error');
    }
  };

  const getEventDateTime = (event, timeField) => {
    const date = new Date(event.eventDate);
    const [hour, minute] = (event[timeField] || '00:00').split(':').map(Number);
    const dateTime = new Date(date);
    dateTime.setHours(hour, minute, 0, 0);
    return dateTime;
  };

  const formatEventState = (event) => {
    const now = new Date();
    const start = getEventDateTime(event, 'startTime');
    const end = getEventDateTime(event, 'endTime');
    if (now >= start && now <= end) return 'Ongoing';
    if (now < start) return 'Upcoming';
    return 'Closed';
  };

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const upcomingEvents = filteredEvents.filter(event => {
    const now = new Date();
    return getEventDateTime(event, 'startTime') > now;
  });

  const lowStaffEvents = filteredEvents.filter(event =>
    event.status === 'active' &&
    event.totalPositions > 0 &&
    event.acceptedCount < event.totalPositions
  );

  const urgentStaffEvents = lowStaffEvents.filter(event => {
    const now = new Date();
    const start = getEventDateTime(event, 'startTime');
    return start > now && start - now <= 24 * 60 * 60 * 1000;
  });

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    const ad = getEventDateTime(a, 'startTime').getTime();
    const bd = getEventDateTime(b, 'startTime').getTime();
    return ad - bd;
  });

  const getDateKey = (date) => new Date(date).toDateString();

  const eventsByDate = filteredEvents.reduce((map, event) => {
    const key = getDateKey(event.eventDate);
    if (!map[key]) {
      map[key] = [];
    }
    map[key].push(event);
    return map;
  }, {});

  const selectedDayEvents = eventsByDate[getDateKey(selectedDate)] || [];

  const daysInMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate();
  const firstDayIndex = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1).getDay();

  const calendarCells = Array.from({ length: 42 }).map((_, index) => {
    const dayNumber = index - firstDayIndex + 1;
    return new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), dayNumber);
  });

  const changeMonth = (offset) => {
    const nextMonth = new Date(calendarMonth);
    nextMonth.setMonth(nextMonth.getMonth() + offset);
    setCalendarMonth(nextMonth);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setViewMode('calendar');
  };

  const handleViewApplications = async (event) => {
    setSelectedEvent(event);
    setShowApplications(true);
    try {
      const res = await api.get(`/applications/event/${event._id}`);
      setApplications(res.data);
    } catch (error) {
      addToast('Failed to load applications', 'error');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div className="animate-slide-up">
          <h1 className="text-3xl md:text-4xl font-bold text-white">Organizer Dashboard</h1>
          <p className="text-white/60 mt-2">Welcome back, {user?.name}!</p>
        </div>
        <Link
          to="/post-event"
          className="glass-btn text-white px-6 py-3 font-semibold animate-slide-up"
        >
          + Post New Event
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="text-4xl font-bold text-white mb-2">{events.length}</div>
          <div className="text-white/60">Total Events</div>
        </div>
        <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="text-4xl font-bold text-green-300 mb-2">
            {events.filter(e => e.status === 'active').length}
          </div>
          <div className="text-white/60">Active Events</div>
        </div>
        <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="text-4xl font-bold text-yellow-300 mb-2">
            {applications.filter(a => a.status === 'pending').length}
          </div>
          <div className="text-white/60">Pending Applications</div>
        </div>
      </div>

      {/* Staffing Alerts & Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <h3 className="text-lg font-semibold text-white mb-3">Staffing Alerts</h3>
          <p className="text-white/60 mb-4">Events that need your attention right now.</p>
          <div className="space-y-3">
            <div className="glass p-4 rounded-2xl border border-yellow-500/20">
              <p className="text-sm text-white/70">Open positions</p>
              <p className="text-3xl font-bold text-white mt-2">{lowStaffEvents.length}</p>
            </div>
            <div className="glass p-4 rounded-2xl border border-red-500/20">
              <p className="text-sm text-white/70">Urgent events starting in 24h</p>
              <p className="text-3xl font-bold text-white mt-2">{urgentStaffEvents.length}</p>
            </div>
            <div className="glass p-4 rounded-2xl border border-green-500/20">
              <p className="text-sm text-white/70">Fully staffed events</p>
              <p className="text-3xl font-bold text-white mt-2">{filteredEvents.filter(evt => evt.filled).length}</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 lg:col-span-2 animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Timeline & Calendar</h3>
              <p className="text-white/60">Visualize event dates, staffing progress, and upcoming deadlines.</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setViewMode('timeline')}
                className={`px-4 py-2 rounded-xl text-sm font-medium ${viewMode === 'timeline' ? 'bg-primary-500 text-white' : 'bg-white/10 text-white/70'}`}
              >
                Timeline
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-xl text-sm font-medium ${viewMode === 'list' ? 'bg-primary-500 text-white' : 'bg-white/10 text-white/70'}`}
              >
                List
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-4 py-2 rounded-xl text-sm font-medium ${viewMode === 'calendar' ? 'bg-primary-500 text-white' : 'bg-white/10 text-white/70'}`}
              >
                Calendar
              </button>
            </div>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/50">No events to display yet.</p>
            </div>
          ) : viewMode === 'calendar' ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-white">{calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h4>
                  <p className="text-white/60 text-sm">Click a day to preview events and shift assignments.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => changeMonth(-1)}
                    className="glass text-white px-4 py-2 rounded-xl text-sm"
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => changeMonth(1)}
                    className="glass text-white px-4 py-2 rounded-xl text-sm"
                  >
                    Next
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs text-white/60">
                {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(day => (
                  <div key={day} className="py-2 font-semibold">{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {calendarCells.map((day, index) => {
                  const dayKey = getDateKey(day);
                  const dayEvents = eventsByDate[dayKey] || [];
                  const isCurrentMonth = day.getMonth() === calendarMonth.getMonth();
                  const isSelected = getDateKey(day) === getDateKey(selectedDate);

                  return (
                    <button
                      key={`${dayKey}-${index}`}
                      type="button"
                      onClick={() => handleDateSelect(day)}
                      className={`min-h-[88px] p-2 rounded-2xl text-left border ${isSelected ? 'border-primary-400 bg-primary-500/10' : 'border-white/10'} ${isCurrentMonth ? 'bg-white/5' : 'bg-white/2 text-white/40'}`}
                    >
                      <div className={`text-sm font-semibold ${isCurrentMonth ? 'text-white' : 'text-white/40'}`}>
                        {day.getDate()}
                      </div>
                      <div className="mt-2 space-y-1">
                        {dayEvents.slice(0, 2).map(event => (
                          <div key={event._id} className="rounded-xl bg-white/5 px-2 py-1 text-[11px] text-white/80 overflow-hidden text-ellipsis whitespace-nowrap">
                            {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-[11px] text-white/40">+{dayEvents.length - 2} more</div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="glass p-5 rounded-3xl border border-white/10">
                <h4 className="text-lg font-semibold text-white">Daily Shift Planner</h4>
                <p className="text-white/60 text-sm mb-4">Events on {selectedDate.toLocaleDateString()}</p>
                {selectedDayEvents.length === 0 ? (
                  <p className="text-white/50">No events scheduled for this day.</p>
                ) : (
                  <div className="space-y-4">
                    {selectedDayEvents.map(event => (
                      <div key={event._id} className="glass p-4 rounded-3xl border border-white/10">
                        <div className="flex flex-col md:flex-row justify-between gap-3">
                          <div>
                            <h5 className="text-white font-semibold">{event.title}</h5>
                            <p className="text-white/60 text-sm mt-1">{event.location}</p>
                          </div>
                          <div className="text-right text-sm text-white/70">
                            <div>{event.startTime} - {event.endTime}</div>
                            <div>{event.acceptedCount ?? 0}/{event.totalPositions ?? 0} hired</div>
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2 text-sm text-white/70">
                          <span>{formatEventState(event)}</span>
                          <span>{event.filled ? 'Filled' : `${event.totalPositions - (event.acceptedCount ?? 0)} open positions`}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : viewMode === 'timeline' ? (
            <div className="space-y-6">
              {sortedEvents.map((event) => (
                <div key={event._id} className="flex gap-5 items-start">
                  <div className="flex flex-col items-center">
                    <div className="w-4 h-4 rounded-full bg-primary-400" />
                    <div className="h-full w-px bg-white/10 mt-2" />
                  </div>
                  <div className="glass p-5 rounded-3xl flex-1 border border-white/10">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      <div>
                        <h4 className="text-lg font-semibold text-white">{event.title}</h4>
                        <p className="text-white/60 text-sm mt-1">{event.location}</p>
                      </div>
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-medium border border-blue-400/30">
                        {formatEventState(event)}
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-white/70">
                      <div>{new Date(event.eventDate).toLocaleDateString()} | {event.startTime} - {event.endTime}</div>
                      <div>{event.acceptedCount ?? 0}/{event.totalPositions ?? 0} hired</div>
                      <div>{event.filled ? 'Filled' : `${event.totalPositions - (event.acceptedCount ?? 0)} open positions`}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {sortedEvents.map((event) => (
                <div key={event._id} className="glass p-5 rounded-3xl border border-white/10">
                  <div className="flex flex-col md:flex-row justify-between gap-3">
                    <div>
                      <h4 className="text-lg font-semibold text-white">{event.title}</h4>
                      <p className="text-white/60 text-sm mt-1">{event.location}</p>
                    </div>
                    <div className="text-right text-sm text-white/70">
                      <div>{new Date(event.eventDate).toLocaleDateString()}</div>
                      <div>{event.startTime} - {event.endTime}</div>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3 text-sm text-white/70">
                    <span>{event.acceptedCount ?? 0}/{event.totalPositions ?? 0} hired</span>
                    <span>{event.filled ? 'Filled' : 'Open'}</span>
                    <span>{formatEventState(event)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Events List */}
      <div className="glass-card overflow-hidden animate-slide-up" style={{ animationDelay: '0.4s' }}>
        <div className="p-6 border-b border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h2 className="text-xl font-semibold text-white">My Events</h2>
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-3 rounded-xl glass-input w-full md:w-64 text-white placeholder-white/40"
            />
          </div>
        </div>

        <div className="p-6">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/50 mb-4">No events found</p>
              <Link to="/post-event" className="text-primary-300 font-medium hover:text-primary-200 transition-colors">
                Post your first event
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredEvents.map(event => (
                <div key={event._id} className="glass p-6 rounded-xl">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-white">{event.title}</h3>
                      <p className="text-white/60 text-sm mt-1">
                        {new Date(event.eventDate).toLocaleDateString()} | {event.startTime} - {event.endTime}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      event.status === 'active' ? 'bg-green-500/20 text-green-200 border border-green-400/30' : 'bg-gray-500/20 text-gray-200 border border-gray-400/30'
                    }`}>
                      {event.status}
                    </span>
                  </div>
                  <p className="text-white/60 text-sm mb-4">{event.location}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {event.rolesNeeded.map((role, idx) => (
                      <span key={idx} className="bg-primary-500/20 text-primary-300 px-3 py-1 rounded-full text-sm border border-primary-400/30">
                        {role.roleName} ({role.count})
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4 text-sm">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 text-white/80 border border-white/10">
                      {event.acceptedCount ?? 0}/{event.totalPositions ?? event.rolesNeeded.reduce((sum, r) => sum + r.count, 0)} hired
                    </span>
                    {event.filled && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-500/20 text-green-200 border border-green-400/30">
                        Filled
                      </span>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <Link
                      to={`/events/${event._id}`}
                      className="glass text-white/80 px-4 py-2 rounded-xl hover:bg-white/10 transition-all duration-300 text-sm border border-white/10"
                    >
                      View Details
                    </Link>
                    <button
                      onClick={() => handleViewApplications(event)}
                      className="glass-btn text-white px-4 py-2 rounded-xl text-sm"
                    >
                      Manage Applicants ({event.applicationCount || 0})
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Applications Modal */}
      {showApplications && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="glass-card max-w-2xl w-full max-h-[80vh] overflow-hidden animate-scale-in">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-white">Applications for {selectedEvent.title}</h3>
              <button onClick={() => setShowApplications(false)} className="text-white/60 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {applications.length === 0 ? (
                <p className="text-center text-white/50 py-8">No applications yet</p>
              ) : (
                applications.map(app => (
                  <ApplicationCard
                    key={app._id}
                    application={app}
                    eventRoles={selectedEvent?.rolesNeeded || []}
                    isOrganizer={true}
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