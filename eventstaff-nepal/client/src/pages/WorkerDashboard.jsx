import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/axios";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import EventCard from "../components/events/EventCard";
import ApplicationCard from "../components/applications/ApplicationCard";
import LoadingSpinner from "../components/LoadingSpinner";
import FilterBar from "../components/common/FilterBar";

/**
 * WorkerDashboard:
 * Renders the main dashboard for a worker.
 * Uses custom hooks for data fetching to isolate UI from data logic, ensuring scalability.
 */
export default function WorkerDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: "", role: "", date: "" });
  const [filteredJobs, setFilteredJobs] = useState([]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [eventsRes, appsRes] = await Promise.all([
        api.get("/events?status=active"),
        api.get("/applications/my"),
      ]);
      setEvents(Array.isArray(eventsRes.data) ? eventsRes.data : []);
      setMyApplications(Array.isArray(appsRes.data) ? appsRes.data : []);
    } catch (error) {
      console.error("Failed to load data:", error);
      setEvents([]);
      setMyApplications([]);
      addToast("Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  };

  // handleApply was removed since application is done on detail page

  useEffect(() => {
    const { search, role, date } = filters;
    const filtered = (events || []).filter((event) => {
      const searchLower = (search || "").toLowerCase();
      const matchesSearch =
        !search ||
        (event.title || "").toLowerCase().includes(searchLower) ||
        (event.location || "").toLowerCase().includes(searchLower);

      const matchesRole =
        !role ||
        role === "All Roles" ||
        event.rolesNeeded?.some((r) => r.roleName === role);

      const matchesDate =
        !date ||
        new Date(event.eventDate).toLocaleDateString() ===
          new Date(date).toLocaleDateString();

      return matchesSearch && matchesRole && matchesDate;
    });

    console.log("Current Filters:", { search, role, date });
    console.log("Filtered Results:", filtered);
    setFilteredJobs(filtered);
  }, [events, filters]);

  const appliedEventIds = (myApplications || []).map(
    (a) => a.event?._id || a.event,
  );

  const acceptedApps = (myApplications || []).filter(
    (a) => a.status === "accepted",
  );
  const pendingApps = (myApplications || []).filter(
    (a) => a.status === "pending",
  );
  const rejectedApps = (myApplications || []).filter(
    (a) => a.status === "rejected",
  );
  const completedApps = (myApplications || []).filter(
    (a) => a.status === "completed",
  );
  const totalApps =
    pendingApps.length + acceptedApps.length + rejectedApps.length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-10 animate-slide-up">
        <h1 className="text-4xl font-bold text-[color:var(--text)] tracking-tight">
          {t("common.worker_dashboard", "Worker Dashboard")}
        </h1>
        <p className="text-[color:var(--text-muted)] mt-2">
          {t("common.welcome_user", "Welcome back, {{name}}!", {
            name: user?.name || "",
          })}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-5 mb-10">
        <div
          className="glass-card p-6 text-center animate-slide-up"
          style={{ animationDelay: "0.1s" }}
        >
          <div className="text-3xl font-bold text-[color:var(--text)] mb-2">
            {totalApps}
          </div>
          <div className="text-[color:var(--text-muted)] text-sm">
            {t("common.total_applications", "Total Applications")}
          </div>
        </div>
        <div
          className="glass-card p-6 text-center animate-slide-up"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="text-3xl font-bold text-[color:var(--accent)] mb-2">
            {acceptedApps.length}
          </div>
          <div className="text-[color:var(--text-muted)] text-sm">
            {t("common.upcoming_shifts", "Upcoming Shifts")}
          </div>
        </div>
        <div
          className="glass-card p-6 text-center animate-slide-up"
          style={{ animationDelay: "0.3s" }}
        >
          <div className="text-3xl font-bold text-[color:var(--text-main)] dark:text-[color:var(--text-main)] mb-2">
            {pendingApps.length}
          </div>
          <div className="text-[color:var(--text-muted)] text-sm">
            {t("common.pending_applications", "Pending Applications")}
          </div>
        </div>
        <div
          className="glass-card p-6 text-center animate-slide-up"
          style={{ animationDelay: "0.4s" }}
        >
          <div className="text-3xl font-bold text-[color:var(--text-muted)] mb-2">
            {rejectedApps.length}
          </div>
          <div className="text-[color:var(--text-muted)] text-sm">
            {t("common.rejected_applications", "Rejected Applications")}
          </div>
        </div>
        <div
          className="glass-card p-6 text-center animate-slide-up"
          style={{ animationDelay: "0.5s" }}
        >
          <div className="text-3xl font-bold text-[color:var(--accent)] mb-2">
            {completedApps.length}
          </div>
          <div className="text-[color:var(--text-muted)] text-sm">
            {t("common.completed_shifts", "Completed Shifts")}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Available Jobs */}
        <div className="lg:col-span-2">
          <div
            className={`glass-card overflow-hidden animate-slide-up ${filteredJobs.length === 0 ? "h-fit" : ""}`}
            style={{ animationDelay: "0.5s" }}
          >
            <div className="p-6 border-b border-[color:var(--border)]">
              <h2 className="text-xl font-semibold text-[color:var(--text)] mb-4">
                {t("common.available_jobs", "Available Jobs")}
              </h2>
              <FilterBar
                filters={filters}
                onFilterChange={handleFilterChange}
                isOrganizer={false}
              />
            </div>
            <div className="p-6">
              {filteredJobs.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-[color:var(--text-muted)] font-medium text-lg mb-2">
                    {t("common.no_jobs_match", "No jobs match your criteria.")}
                  </p>
                  <p className="text-[color:var(--text-dim)] text-sm">
                    {t(
                      "common.check_back_later",
                      "Check back later for new opportunities!",
                    )}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredJobs.map((event) => (
                    <div
                      key={event._id}
                      className="glass p-5 rounded-xl flex flex-col md:flex-row md:items-start justify-between gap-4"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-[color:var(--text)] text-lg mb-1">
                          {event.title}
                        </h3>
                        <p className="text-sm text-[color:var(--text-muted)] mb-3">
                          {new Date(event.eventDate).toLocaleDateString()}{" "}
                          &bull; {event.location}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {event.rolesNeeded?.map((role, idx) => (
                            <span
                              key={idx}
                              className="bg-[color:var(--surface-raised)] text-[color:var(--text-muted)] px-3 py-1 rounded-full text-xs font-medium border border-[color:var(--border-hover)]"
                            >
                              {role.roleName} &bull; NPR {role.payAmount}
                              {role.paymentType === "per_hour"
                                ? "/hr"
                                : role.paymentType === "per_day"
                                  ? "/day"
                                  : "/event"}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="shrink-0 flex items-center">
                        {appliedEventIds.includes(event._id) ? (
                          <span className="flex items-center justify-center whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium bg-[color:var(--surface-raised)] text-[color:var(--text-muted)] border border-[color:var(--border-hover)] w-full md:w-auto text-center">
                            {t("common.applied", "Applied")}
                          </span>
                        ) : (
                          <Link
                            to={`/events/${event._id}`}
                            className="btn-glass px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap w-full md:w-auto text-center"
                          >
                            {t("common.apply_now", "Apply Now")}
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* My Applications Sidebar */}
        <div className="lg:col-span-1">
          <div
            className="glass-card overflow-hidden animate-slide-up"
            style={{ animationDelay: "0.6s" }}
          >
            <div className="p-6 border-b border-[color:var(--border)]">
              <h2 className="text-xl font-semibold text-[color:var(--text)]">
                {t("common.my_applications", "My Applications")}
              </h2>
            </div>
            <div className="p-4">
              {myApplications.length === 0 ? (
                <p className="text-center text-[color:var(--text-dim)] py-4">
                  {t("common.no_applications_yet", "No applications yet")}
                </p>
              ) : (
                <div className="space-y-3">
                  {myApplications.slice(0, 10).map((app) => (
                    <div key={app._id}>
                      <ApplicationCard application={app} />
                      {app.status === "completed" && app.isPaid && (
                        <div className="px-1 pb-1 -mt-2">
                          <Link
                            to={`/reviews/leave?revieweeId=${app.event?.organizer?._id}&eventId=${app.event?._id}&revieweeName=${encodeURIComponent(app.event?.organizer?.name || "Organizer")}`}
                            style={{
                              color: "var(--accent)",
                              fontSize: "0.8rem",
                            }}
                          >
                            {t("common.leave_review", "Leave Review")}
                          </Link>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
