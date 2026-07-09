import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../services/axios";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import ApplicationCard from "../components/applications/ApplicationCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { initiateConversation } from "../utils/messageUtils";

const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function EventDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showApplications, setShowApplications] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [recommendedWorkers, setRecommendedWorkers] = useState([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const res = await api.get(`/events/${id}`);
      setEvent(res.data);
    } catch (error) {
      addToast("Failed to load event", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!showRoleDropdown) {
      setShowRoleDropdown(true);
      if (event.rolesNeeded?.length > 0) {
        setSelectedRole(event.rolesNeeded[0].roleName);
      }
      return;
    }

    if (!selectedRole) {
      addToast("Please select a role", "error");
      return;
    }

    setApplying(true);
    try {
      await api.post("/applications", {
        eventId: id,
        roleAppliedFor: selectedRole,
      });
      addToast("Application submitted successfully!", "success");
      setShowRoleDropdown(false);
      fetchEvent();
    } catch (error) {
      addToast(error.response?.data?.message || "Failed to apply", "error");
    } finally {
      setApplying(false);
    }
  };

  const handleStatusChange = async (applicationId, status) => {
    if (!window.confirm(`Are you sure you want to ${status} this application?`))
      return;

    try {
      await api.put(`/applications/${applicationId}/status`, { status });
      addToast(`Application ${status} successfully`, "success");
      fetchEvent();
    } catch (error) {
      addToast(
        error.response?.data?.message || "Failed to update status",
        "error",
      );
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await api.get(`/applications/event/${id}`);
      setApplications(res.data);
      setShowApplications(true);
    } catch (error) {
      addToast("Failed to load applications", "error");
    }
  };

  const fetchRecommendations = async () => {
    try {
      setLoadingRecommendations(true);
      const res = await api.get(`/recommendations/workers/${id}`);
      setRecommendedWorkers(res.data);
      setShowRecommendations(true);
    } catch (error) {
      addToast("Failed to load recommendations", "error");
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const handleAssign = async (applicationId, assignedRole, shiftNotes) => {
    try {
      await api.put(`/applications/${applicationId}/assign`, {
        assignedRole,
        shiftNotes,
      });
      addToast("Worker assignment saved", "success");
      fetchApplications();
      fetchEvent();
    } catch (error) {
      addToast(
        error.response?.data?.message || "Failed to save assignment",
        "error",
      );
    }
  };

  const isOrganizer =
    user?.id === event?.organizer?._id ||
    user?.id === event?.organizer ||
    user?._id === event?.organizer?._id ||
    user?._id === event?.organizer;
  const isWorker = user?.role === "worker";
  const hasApplied = applications.some(
    (a) => a.worker?._id === user?.id || a.worker === user?.id,
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[color:var(--text-primary)]">
          {t("common.event_not_found", "Event not found")}
        </p>
      </div>
    );
  }

  const totalPay =
    event.rolesNeeded?.reduce(
      (sum, role) => sum + role.payAmount * role.count,
      0,
    ) || 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="glass-card overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-700/80 to-primary-600/80 text-[color:var(--text-primary)] p-8 backdrop-blur-sm">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-3">{event.title}</h1>
              <div className="flex items-center gap-3">
                <p className="text-[color:var(--text-muted)]">
                  By {event.organizer?.name || "Unknown Organizer"}
                </p>
                {user &&
                  user.id !== event.organizer?._id &&
                  event.organizer?._id && (
                    <button
                      onClick={() =>
                        initiateConversation(event.organizer._id, navigate)
                      }
                      className="btn-glass px-2 py-1 text-[10px] flex items-center gap-1"
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                        />
                      </svg>
                      {t("common.message", "Message")}
                    </button>
                  )}
              </div>
            </div>
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm ${
                event.status === "active"
                  ? "bg-[color:var(--surface-raised)] text-[color:var(--text-main)] border border-green-400/30"
                  : "bg-gray-500/30 text-gray-200 border border-gray-400/30"
              }`}
            >
              {event.status}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div>
              <h3 className="text-lg font-semibold text-[color:var(--text-primary)] mb-4">
                {t("common.event_details", "Event Details")}
              </h3>
              <div className="space-y-4">
                <div className="flex items-center text-[color:var(--text-muted)]">
                  <svg
                    className="w-5 h-5 mr-3 text-primary-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  {new Date(event.eventDate).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
                <div className="flex items-center text-[color:var(--text-muted)]">
                  <svg
                    className="w-5 h-5 mr-3 text-primary-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {event.startTime} - {event.endTime}
                </div>
                <div className="flex items-center text-[color:var(--text-muted)]">
                  <svg
                    className="w-5 h-5 mr-3 text-primary-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                  </svg>
                  {event.location}
                </div>
              </div>
            </div>

            <div className="glass p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-[color:var(--text-primary)] mb-3">
                {t("common.estimated_total_payout", "Estimated Total Payout")}
              </h3>
              <div className="text-3xl font-bold text-[color:var(--text-primary)] mb-2">
                NPR {totalPay}
              </div>
              <p className="text-[color:var(--text-dim)] text-sm">
                {t(
                  "common.based_on_all_roles_and_hours",
                  "Based on all roles and hours",
                )}
              </p>
            </div>
          </div>

          <div className="mb-6 flex flex-wrap gap-3">
            <span className="inline-flex items-center px-3 py-2 rounded-full bg-[color:var(--surface-raised)] text-[color:var(--text-primary)] border border-[color:var(--border)]">
              {event.acceptedCount ?? 0}/
              {event.totalPositions ??
                event.rolesNeeded?.reduce((sum, r) => sum + r.count, 0) ??
                0}{" "}
              hired
            </span>
            {event.filled && (
              <span className="inline-flex items-center px-3 py-2 rounded-full bg-[color:var(--surface-raised)] text-[color:var(--text-main)] border border-green-400/30">
                {t("common.position_filled", "Position Filled")}
              </span>
            )}
          </div>

          {/* Description */}
          <div className="mb-10">
            <h3 className="text-lg font-semibold text-[color:var(--text-primary)] mb-3">
              {t("common.description", "Description")}
            </h3>
            <p className="text-[color:var(--text-muted)] whitespace-pre-line">
              {event.description}
            </p>
          </div>

          {/* Roles Table */}
          <div className="mb-10">
            <h3 className="text-lg font-semibold text-[color:var(--text-primary)] mb-3">
              {t("common.roles_needed", "Roles Needed")}
            </h3>
            <div className="glass rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-5 py-4 text-left text-sm font-semibold text-[color:var(--text-primary)]">
                      {t("common.role", "Role")}
                    </th>
                    <th className="px-5 py-4 text-left text-sm font-semibold text-[color:var(--text-primary)]">
                      {t("common.count", "Count")}
                    </th>
                    <th className="px-5 py-4 text-left text-sm font-semibold text-[color:var(--text-primary)]">
                      {t("common.pay_hour", "Pay/Hour")}
                    </th>
                    <th className="px-5 py-4 text-left text-sm font-semibold text-[color:var(--text-primary)]">
                      {t("common.total", "Total")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {event.rolesNeeded?.map((role, idx) => (
                    <tr key={idx}>
                      <td className="px-5 py-4 text-[color:var(--text-primary)]">
                        {role.roleName}
                      </td>
                      <td className="px-5 py-4 text-[color:var(--text-muted)]">
                        {role.count}
                      </td>
                      <td className="px-5 py-4 text-[color:var(--text-muted)]">
                        NPR {role.payAmount}{" "}
                        {role.paymentType === "per_hour"
                          ? "/hr"
                          : role.paymentType === "per_day"
                            ? "/day"
                            : "/event"}
                      </td>
                      <td className="px-5 py-4 text-[color:var(--text-primary)] font-medium">
                        NPR {role.payAmount * role.count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Map */}
          {event.coordinates?.lat && event.coordinates?.lng && (
            <div className="mb-10">
              <h3 className="text-lg font-semibold text-[color:var(--text-primary)] mb-3">
                {t("common.location", "Location")}
              </h3>
              <div className="h-64 rounded-xl overflow-hidden">
                <MapContainer
                  center={[event.coordinates.lat, event.coordinates.lng]}
                  zoom={15}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker
                    position={[event.coordinates.lat, event.coordinates.lng]}
                    icon={defaultIcon}
                  />
                </MapContainer>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            {isWorker && event.status === "active" && !event.filled && (
              <div className="flex-1 w-full flex flex-col gap-2">
                {showRoleDropdown && (
                  <div className="animate-fade-in">
                    <label className="block text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-1">
                      {t("common.select_role", "Select Role")}
                    </label>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="glass-input w-full p-3 rounded-xl bg-[var(--surface-raised)] text-[color:var(--text-primary)] mb-2"
                    >
                      {event.rolesNeeded?.map((role, idx) => (
                        <option
                          key={idx}
                          value={role.roleName}
                          className="bg-[var(--surface)] text-[color:var(--text-primary)]"
                        >
                          {role.roleName} (NPR {role.payAmount}{" "}
                          {role.paymentType === "per_hour"
                            ? "/hr"
                            : role.paymentType === "per_day"
                              ? "/day"
                              : "/event"}
                          )
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <button
                  onClick={handleApply}
                  disabled={applying || hasApplied}
                  className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
                    hasApplied
                      ? "glass text-[color:var(--text-dim)] cursor-not-allowed border border-[color:var(--border)]"
                      : "btn-glass"
                  }`}
                >
                  {applying ? (
                    <LoadingSpinner size="sm" />
                  ) : hasApplied ? (
                    "Already Applied"
                  ) : showRoleDropdown ? (
                    "Confirm Application"
                  ) : (
                    "Apply Now"
                  )}
                </button>
                {showRoleDropdown && !hasApplied && (
                  <button
                    onClick={() => setShowRoleDropdown(false)}
                    className="text-xs text-[var(--text-muted)] hover:text-[color:var(--text-primary)] mt-1 w-full text-center"
                  >
                    {t("common.cancel", "Cancel")}
                  </button>
                )}
              </div>
            )}

            {isWorker && event.status === "active" && event.filled && (
              <div className="flex-1 px-4 py-3 rounded-xl bg-[color:var(--surface-raised)] text-[color:var(--text-muted)] border border-[color:var(--border)]">
                {t(
                  "common.this_event_is_fully_staffed_an",
                  "This event is fully staffed and no longer accepting applications.",
                )}
              </div>
            )}

            {isOrganizer && (
              <>
                <button
                  onClick={fetchApplications}
                  className="flex-1 btn-glass py-3 rounded-xl font-semibold"
                >
                  {t("common.view_applications", "View Applications")}
                </button>
                <button
                  onClick={fetchRecommendations}
                  disabled={loadingRecommendations}
                  className="flex-1 px-4 py-3 rounded-xl font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
                  style={{ background: "var(--accent)", color: "#000" }}
                >
                  {loadingRecommendations ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    "Find Perfect Match"
                  )}
                </button>
              </>
            )}

            <Link
              to={
                user?.role === "organizer" ? "/dashboard" : "/worker-dashboard"
              }
              className="flex-1 glass text-[color:var(--text-primary)] py-3 rounded-xl font-semibold hover:bg-[color:var(--surface-raised)] transition-all duration-300 text-center border border-[color:var(--border)]"
            >
              {t("common.back_to_dashboard", "Back to Dashboard")}
            </Link>
          </div>
        </div>
      </div>

      {/* Applications Modal */}
      {showApplications && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="glass-card max-w-2xl w-full max-h-[80vh] overflow-hidden animate-scale-in">
            <div className="p-6 border-b border-[color:var(--border)] flex justify-between items-center">
              <h3 className="text-xl font-semibold text-[color:var(--text-primary)]">
                Applications for {event.title}
              </h3>
              <button
                onClick={() => setShowApplications(false)}
                className="text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)] transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {applications.length === 0 ? (
                <p className="text-center text-[color:var(--text-dim)] py-8">
                  {t("common.no_applications_yet", "No applications yet")}
                </p>
              ) : (
                applications.map((app) => (
                  <ApplicationCard
                    key={app._id}
                    application={app}
                    eventRoles={event?.rolesNeeded || []}
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

      {/* Recommendations Modal */}
      {showRecommendations && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="glass-card max-w-2xl w-full max-h-[80vh] overflow-hidden animate-scale-in">
            <div className="p-6 border-b border-[color:var(--border)] flex justify-between items-center">
              <h3 className="text-xl font-semibold text-[color:var(--text-primary)]">
                Recommended Workers for {event.title}
              </h3>
              <button
                onClick={() => setShowRecommendations(false)}
                className="text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)] transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {recommendedWorkers.length === 0 ? (
                <p className="text-center text-[color:var(--text-dim)] py-8">
                  No matching workers found
                </p>
              ) : (
                <div className="space-y-4">
                  {recommendedWorkers.map((worker) => (
                    <div
                      key={worker._id}
                      className="p-4 glass rounded-lg flex justify-between items-center"
                    >
                      <div>
                        <div className="font-semibold text-[color:var(--text-primary)]">
                          {worker.name}
                        </div>
                        <div className="text-sm text-[color:var(--text-muted)]">
                          Skills: {worker.skills?.join(", ")}
                        </div>
                        <div className="text-sm text-[color:var(--text-muted)]">
                          Rating: {worker.rating} / 5 ({worker.totalReviews}{" "}
                          reviews)
                        </div>
                      </div>
                      <Link
                        to={`/workers/${worker._id}`}
                        className="btn-glass px-4 py-2 text-sm"
                      >
                        View Profile
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
