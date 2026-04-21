import ApplicationCard from './ApplicationCard';

const ApplicationList = ({ applications, loading, isOrganizer = false, onStatusChange, onAssign }) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="glass-card p-5 animate-pulse">
            <div className="h-5 bg-white/10 rounded w-1/3 mb-3"></div>
            <div className="h-4 bg-white/10 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-white/10 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!applications || applications.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-white/50">No applications yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {applications.map(app => (
        <ApplicationCard
          key={app._id}
          application={app}
          isOrganizer={isOrganizer}
          onStatusChange={onStatusChange}
          onAssign={onAssign}
        />
      ))}
    </div>
  );
};

export default ApplicationList;