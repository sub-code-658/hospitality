import EventCard from "./EventCard";

const EventList = ({ events, loading, emptyMessage = "No events found" }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="glass-card p-6 animate-pulse">
            <div className="h-6 bg-[color:var(--surface-raised)] rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-[color:var(--surface-raised)] rounded w-full mb-2"></div>
            <div className="h-4 bg-[color:var(--surface-raised)] rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[color:var(--text-main)]/50 text-[color:var(--text-primary)]/50 text-lg">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <EventCard key={event._id} event={event} />
      ))}
    </div>
  );
};

export default EventList;
