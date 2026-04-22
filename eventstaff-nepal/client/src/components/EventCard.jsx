import { Link } from 'react-router-dom';

const STATUS_COLOR = {
  active: '#6baf8a',
  filled: '#89b4cc',
  cancelled: '#cc3b3b',
  completed: '#c9a84c',
};

export default function EventCard({ event, showOrganizer = false }) {
  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  const totalPay = event.rolesNeeded?.reduce((sum, r) => sum + r.payPerHour * r.count, 0) || 0;
  const barColor = STATUS_COLOR[event.status] || '#6baf8a';

  return (
    <Link to={`/events/${event._id}`} className="card group block" style={{ textDecoration: 'none' }}>
      {/* Top status bar */}
      <div style={{ height: 2, background: barColor, opacity: 0.7 }} />

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3
            className="font-serif text-xl leading-tight flex-1"
            style={{ color: 'var(--text)', fontWeight: 500 }}
          >
            {event.title}
          </h3>
          <span
            className="flex-shrink-0 text-[0.65rem] font-bold uppercase tracking-widest px-2 py-1 rounded"
            style={{
              background: `${barColor}18`,
              border: `1px solid ${barColor}30`,
              color: barColor,
              fontFamily: 'Plus Jakarta Sans, sans-serif',
            }}
          >
            {event.status}
          </span>
        </div>

        {/* Description */}
        <p
          className="text-sm leading-relaxed line-clamp-2 mb-5"
          style={{ color: 'var(--text-muted)' }}
        >
          {event.description}
        </p>

        {/* Meta */}
        <div className="space-y-2 mb-5">
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--flame)', flexShrink: 0 }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{formatDate(event.eventDate)}</span>
            <span style={{ color: 'var(--text-dim)' }}>·</span>
            <span>{event.startTime}–{event.endTime}</span>
          </div>
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--flame)', flexShrink: 0 }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate">{event.location}</span>
          </div>
        </div>

        {/* Roles */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {event.rolesNeeded?.slice(0, 3).map((role, idx) => (
            <span key={idx} className="tag">
              {role.roleName} ×{role.count}
            </span>
          ))}
          {event.rolesNeeded?.length > 3 && (
            <span className="tag" style={{ background: 'rgba(237,232,224,0.05)', borderColor: 'rgba(237,232,224,0.1)', color: 'var(--text-dim)' }}>
              +{event.rolesNeeded.length - 3}
            </span>
          )}
        </div>

        {showOrganizer && event.organizer && (
          <p className="text-xs mb-3" style={{ color: 'var(--text-dim)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            By {event.organizer.name || event.organizer.email}
          </p>
        )}

        {/* Footer */}
        <div
          className="flex items-center justify-between pt-4"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <div>
            <span
              className="font-serif text-2xl"
              style={{ color: 'var(--flame-light)', fontWeight: 400 }}
            >
              NPR {totalPay.toLocaleString()}
            </span>
            <span className="text-xs ml-1" style={{ color: 'var(--text-dim)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              est. total
            </span>
          </div>
          <span
            className="label text-[0.6rem] flex items-center gap-1.5 transition-colors duration-200"
            style={{ color: 'var(--text-dim)' }}
          >
            Details
            <svg
              width="12"
              height="12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
