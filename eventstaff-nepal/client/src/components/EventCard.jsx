import { Link } from 'react-router-dom';

export default function EventCard({ event, showOrganizer = false }) {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const totalPay = event.rolesNeeded?.reduce((sum, role) => {
    return sum + (role.payPerHour * role.count);
  }, 0) || 0;

  return (
    <div className="glass-card p-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-white">{event.title}</h3>
        <span className={`px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm ${
          event.status === 'active'
            ? 'bg-green-500/30 text-green-200 border border-green-400/30'
            : 'bg-gray-500/30 text-gray-200 border border-gray-400/30'
        }`}>
          {event.status}
        </span>
      </div>

      <p className="text-white/70 text-sm mb-5 line-clamp-2">{event.description}</p>

      <div className="space-y-3 text-sm text-white/70">
        <div className="flex items-center">
          <svg className="w-4 h-4 mr-2 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {formatDate(event.eventDate)} | {event.startTime} - {event.endTime}
        </div>
        <div className="flex items-center">
          <svg className="w-4 h-4 mr-2 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {event.location}
        </div>
      </div>

      <div className="mt-5 pt-5 border-t border-white/10">
        <div className="flex flex-wrap gap-2 mb-5">
          {event.rolesNeeded?.map((role, idx) => (
            <span key={idx} className="bg-primary-500/20 text-primary-300 px-3 py-1 rounded-full text-xs font-medium border border-primary-400/30">
              {role.roleName} ({role.count}) - NPR {role.payPerHour}/hr
            </span>
          ))}
        </div>

        {showOrganizer && event.organizer && (
          <p className="text-sm text-white/50 mb-3">
            By: {event.organizer.name || event.organizer.email}
          </p>
        )}

        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-white/80">
            Est. Total: NPR {totalPay}
          </span>
          <Link
            to={`/events/${event._id}`}
            className="text-primary-300 hover:text-primary-200 font-medium text-sm flex items-center group"
          >
            View Details
            <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}