import ApplicationCard from "./ApplicationCard";
import { useTranslation } from "react-i18next";

const ApplicationList = ({
  applications,
  loading,
  isOrganizer = false,
  onStatusChange,
  onAssign,
}) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-card p-5 animate-pulse">
            <div className="h-5 bg-[color:var(--surface-raised)] rounded w-1/3 mb-3"></div>
            <div className="h-4 bg-[color:var(--surface-raised)] rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-[color:var(--surface-raised)] rounded w-1/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!applications || applications.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-[color:var(--text-main)]/50 text-[color:var(--text-primary)]/50">
          {t("common.no_applications_yet", "No applications yet")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {applications.map((app) => (
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
