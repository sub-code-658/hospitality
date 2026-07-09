import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/axios";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import ApplicationCard from "../components/applications/ApplicationCard";
import LoadingSpinner from "../components/LoadingSpinner";

export default function OrganizerDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showApplications, setShowApplications] = useState(false);
  const [viewMode, setViewMode] = useState("timeline");
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [recommendedWorkers, setRecommendedWorkers] = useState([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [loadingRecommendations, setLoadingRecommendations] = useState(null);

  useEffect(() => {
    if (user?.role !== "organizer") {
      navigate("/");
    } else {
      fetchData();
    }
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      const [eventsRes, appsRes] = await Promise.all([
        api.get("/events/organizer/my-events"),
        api.get("/applications/my"),
      ]);
      setEvents(eventsRes.data);
      setApplications(appsRes.data);
    } catch (error) {
      addToast("Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async (eventId) => {
    try {
      setLoadingRecommendations(eventId);
      const res = await api.get(`/recommendations/workers/${eventId}`);
      setRecommendedWorkers(res.data);
      setShowRecommendations(true);
    } catch (error) {
      addToast("Failed to load recommendations", "error");
    } finally {
      setLoadingRecommendations(null);
    }
  };

  const handleStatusChange = async (applicationId, status) => {
    if (!window.confirm(`Are you sure you want to ${status} this application?`))
      return;

    try {
      await api.put(`/applications/${applicationId}/status`, { status });
      addToast(`Application ${status} successfully`, "success");
      fetchData();
    } catch (error) {
      addToast(
        error.response?.data?.message || "Failed to update status",
        "error",
      );
    }
  };

  const handleAssign = async (applicationId, assignedRole, shiftNotes) => {
    try {
      await api.put(`/applications/${applicationId}/assign`, {
        assignedRole,
        shiftNotes,
      });
      addToast("Worker assignment saved", "success");
      fetchData();
      if (selectedEvent) {
        handleViewApplications(selectedEvent);
      }
    } catch (error) {
      addToast(
        error.response?.data?.message || "Failed to save assignment",
        "error",
      );
    }
  };

  const getEventDateTime = (event, timeField) => {
    const date = new Date(event.eventDate);
    const [hour, minute] = (event[timeField] || "00:00").split(":").map(Number);
    const dateTime = new Date(date);
    dateTime.setHours(hour, minute, 0, 0);
    return dateTime;
  };

  const formatEventState = (event) => {
    const now = new Date();
    const start = getEventDateTime(event, "startTime");
    const end = getEventDateTime(event, "endTime");
    if (now >= start && now <= end) return "Ongoing";
    if (now < start) return "Upcoming";
    return "Closed";
  };

  const filteredEvents = events.filter(
    (event) =>
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const upcomingEvents = filteredEvents.filter((event) => {
    const now = new Date();
    return getEventDateTime(event, "startTime") > now;
  });

  const lowStaffEvents = filteredEvents.filter(
    (event) =>
      event.status === "active" &&
      event.totalPositions > 0 &&
      event.acceptedCount < event.totalPositions,
  );

  const urgentStaffEvents = lowStaffEvents.filter((event) => {
    const now = new Date();
    const start = getEventDateTime(event, "startTime");
    return start > now && start - now <= 24 * 60 * 60 * 1000;
  });

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    const ad = getEventDateTime(a, "startTime").getTime();
    const bd = getEventDateTime(b, "startTime").getTime();
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

  const daysInMonth = new Date(
    calendarMonth.getFullYear(),
    calendarMonth.getMonth() + 1,
    0,
  ).getDate();
  const firstDayIndex = new Date(
    calendarMonth.getFullYear(),
    calendarMonth.getMonth(),
    1,
  ).getDay();

  const calendarCells = Array.from({ length: 42 }).map((_, index) => {
    const dayNumber = index - firstDayIndex + 1;
    return new Date(
      calendarMonth.getFullYear(),
      calendarMonth.getMonth(),
      dayNumber,
    );
  });

  const changeMonth = (offset) => {
    const nextMonth = new Date(calendarMonth);
    nextMonth.setMonth(nextMonth.getMonth() + offset);
    setCalendarMonth(nextMonth);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setViewMode("calendar");
  };

  const handleViewApplications = async (event) => {
    setSelectedEvent(event);
    setShowApplications(true);
    try {
      const res = await api.get(`/applications/event/${event._id}`);
      setApplications(res.data);
    } catch (error) {
      addToast("Failed to load applications", "error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div className="animate-fade-in">
          <p
            className="text-sm tracking-[0.15em] uppercase mb-3"
            style={{ color: "rgba(109, 129, 150, 0.6)" }}
          >
            {t("common.welcome_back", "Welcome back")}
          </p>
          <h1 className="font-serif text-3xl md:text-5xl text-[color:var(--text-primary)]">
            {t("common.organizer_dashboard", "Organizer Dashboard")}
          </h1>
        </div>
        <Link to="/post-event" className="btn-primary animate-slide-up">
          + Post New Event
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="card p-6 animate-fade-in stagger-1">
          <div className="font-serif text-5xl text-[color:var(--accent)] mb-2">
            {events.length}
          </div>
          <div
            className="text-sm"
            style={{ color: "rgba(109, 129, 150, 0.6)" }}
          >
            {t("common.total_events", "Total Events")}
          </div>
        </div>
        <div className="card p-6 animate-fade-in stagger-2">
          <div
            className="font-serif text-5xl mb-2"
            style={{ color: "var(--accent)" }}
          >
            {events.filter((e) => e.status === "active").length}
          </div>
          <div
            className="text-sm"
            style={{ color: "rgba(109, 129, 150, 0.6)" }}
          >
            {t("common.active_events", "Active Events")}
          </div>
        </div>
        <div className="card p-6 animate-fade-in stagger-3">
          <div
            className="font-serif text-5xl mb-2"
            style={{ color: "var(--accent)" }}
          >
            {applications.filter((a) => a.status === "pending").length}
          </div>
          <div
            className="text-sm"
            style={{ color: "rgba(109, 129, 150, 0.6)" }}
          >
            Pending Applications
          </div>
        </div>
      </div>

      {/* Staffing Alerts & Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        {/* Staffing Alerts */}
        <div className="card p-6 animate-fade-in stagger-4">
          <h3 className="font-serif text-xl text-[color:var(--text-primary)] mb-4">
            {t("common.staffing_alerts", "Staffing Alerts")}
          </h3>
          <div className="space-y-4">
            <div
              className="p-5 rounded-xl border"
              style={{
                background: "rgba(109, 129, 150, 0.05)",
                borderColor: "rgba(109, 129, 150, 0.2)",
              }}
            >
              <p
                className="text-sm mb-2"
                style={{ color: "rgba(109, 129, 150, 0.7)" }}
              >
                {t("common.open_positions", "Open Positions")}
              </p>
              <p className="font-serif text-4xl text-[color:var(--text-primary)]">
                {lowStaffEvents.length}
              </p>
            </div>
            <div
              className="p-5 rounded-xl border"
              style={{
                background: "rgba(109, 129, 150, 0.05)",
                borderColor: "rgba(109, 129, 150, 0.2)",
              }}
            >
              <p
                className="text-sm mb-2"
                style={{ color: "rgba(109, 129, 150, 0.7)" }}
              >
                Urgent (24h)
              </p>
              <p className="font-serif text-4xl text-[color:var(--text-primary)]">
                {urgentStaffEvents.length}
              </p>
            </div>
            <div
              className="p-5 rounded-xl border"
              style={{
                background: "rgba(109, 129, 150, 0.05)",
                borderColor: "rgba(109, 129, 150, 0.2)",
              }}
            >
              <p
                className="text-sm mb-2"
                style={{ color: "rgba(109, 129, 150, 0.7)" }}
              >
                {t("common.fully_staffed", "Fully Staffed")}
              </p>
              <p className="font-serif text-4xl text-[color:var(--text-primary)]">
                {filteredEvents.filter((evt) => evt.filled).length}
              </p>
            </div>
          </div>
        </div>

        {/* Timeline & Calendar */}
        <div className="card p-6 lg:col-span-2 animate-fade-in stagger-5">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h3 className="font-serif text-xl text-[color:var(--text-primary)]">
                Timeline & Calendar
              </h3>
              <p
                className="text-sm mt-1"
                style={{ color: "rgba(109, 129, 150, 0.6)" }}
              >
                {t(
                  "common.manage_your_event_schedule",
                  "Manage your event schedule",
                )}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("timeline")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  viewMode === "timeline"
                    ? "text-[color:var(--text-primary)]"
                    : "text-[color:var(--text-dim)]"
                }`}
                style={
                  viewMode === "timeline"
                    ? { background: "rgba(109, 129, 150, 0.15)" }
                    : {}
                }
              >
                {t("common.timeline", "Timeline")}
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  viewMode === "list"
                    ? "text-[color:var(--text-primary)]"
                    : "text-[color:var(--text-dim)]"
                }`}
                style={
                  viewMode === "list"
                    ? { background: "rgba(109, 129, 150, 0.15)" }
                    : {}
                }
              >
                {t("common.list", "List")}
              </button>
              <button
                onClick={() => setViewMode("calendar")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  viewMode === "calendar"
                    ? "text-[color:var(--text-primary)]"
                    : "text-[color:var(--text-dim)]"
                }`}
                style={
                  viewMode === "calendar"
                    ? { background: "rgba(109, 129, 150, 0.15)" }
                    : {}
                }
              >
                Calendar
              </button>
            </div>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <p className="mb-4" style={{ color: "rgba(109, 129, 150, 0.4)" }}>
                {t(
                  "common.no_events_to_display_yet",
                  "No events to display yet.",
                )}
              </p>
              <Link
                to="/post-event"
                className="text-[color:var(--accent)] text-sm hover:underline"
              >
                {t("common.post_your_first_event", "Post your first event")}
              </Link>
            </div>
          ) : viewMode === "calendar" ? (
            <div className="space-y-6">
              {/* Calendar Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-serif text-lg text-[color:var(--text-primary)]">
                    {calendarMonth.toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </h4>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => changeMonth(-1)}
                    className="btn-secondary text-xs px-4 py-2"
                  >
                    {t("common.prev", "Prev")}
                  </button>
                  <button
                    onClick={() => changeMonth(1)}
                    className="btn-secondary text-xs px-4 py-2"
                  >
                    {t("common.next", "Next")}
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div
                className="grid grid-cols-7 gap-1 text-center text-xs"
                style={{ color: "rgba(109, 129, 150, 0.5)" }}
              >
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <div key={day} className="py-2 font-medium">
                      {day}
                    </div>
                  ),
                )}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {calendarCells.map((day, index) => {
                  const dayKey = getDateKey(day);
                  const dayEvents = eventsByDate[dayKey] || [];
                  const isCurrentMonth =
                    day.getMonth() === calendarMonth.getMonth();
                  const isSelected =
                    getDateKey(day) === getDateKey(selectedDate);

                  return (
                    <button
                      key={`${dayKey}-${index}`}
                      type="button"
                      onClick={() => handleDateSelect(day)}
                      className={`min-h-[80px] p-2 rounded-xl text-left border transition-all duration-200 ${
                        isSelected
                          ? "border-[var(--accent)] bg-[rgba(109, 129, 150, 0.1)]"
                          : "border-[rgba(109, 129, 150, 0.1)]"
                      } ${!isCurrentMonth ? "opacity-40" : ""}`}
                      style={
                        !isCurrentMonth
                          ? { background: "var(--card-bg)" }
                          : { background: "var(--card-bg)" }
                      }
                    >
                      <div
                        className={`text-sm font-medium ${isCurrentMonth ? "text-[color:var(--text-primary)]" : "text-[color:var(--text-dim)]"}`}
                      >
                        {day.getDate()}
                      </div>
                      <div className="mt-1.5 space-y-1">
                        {dayEvents.slice(0, 2).map((event) => (
                          <div
                            key={event._id}
                            className="rounded px-1.5 py-0.5 text-[10px] truncate"
                            style={{
                              background: "rgba(109, 129, 150, 0.15)",
                              color: "rgba(109, 129, 150, 0.8)",
                            }}
                          >
                            {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div
                            className="text-[10px]"
                            style={{ color: "rgba(109, 129, 150, 0.4)" }}
                          >
                            +{dayEvents.length - 2}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Daily Planner */}
              <div
                className="p-5 rounded-xl border"
                style={{
                  background: "var(--card-bg)",
                  borderColor: "rgba(109, 129, 150, 0.15)",
                }}
              >
                <h4 className="font-serif text-lg text-[color:var(--text-primary)] mb-2">
                  Shifts on{" "}
                  {selectedDate.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </h4>
                {selectedDayEvents.length === 0 ? (
                  <p
                    className="py-4"
                    style={{ color: "rgba(109, 129, 150, 0.4)" }}
                  >
                    {t("common.no_events_scheduled", "No events scheduled.")}
                  </p>
                ) : (
                  <div className="space-y-4">
                    {selectedDayEvents.map((event) => (
                      <div
                        key={event._id}
                        className="flex flex-col md:flex-row justify-between gap-3 p-4 rounded-lg border"
                        style={{ borderColor: "rgba(109, 129, 150, 0.1)" }}
                      >
                        <div>
                          <h5 className="font-serif text-[color:var(--text-primary)]">
                            {event.title}
                          </h5>
                          <p
                            className="text-sm mt-1"
                            style={{ color: "rgba(109, 129, 150, 0.6)" }}
                          >
                            {event.location}
                          </p>
                        </div>
                        <div
                          className="text-right text-sm"
                          style={{ color: "rgba(109, 129, 150, 0.7)" }}
                        >
                          <div>
                            {event.startTime} - {event.endTime}
                          </div>
                          <div>
                            {event.acceptedCount ?? 0}/
                            {event.totalPositions ?? 0} hired
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : viewMode === "timeline" ? (
            <div className="space-y-5">
              {sortedEvents.map((event) => (
                <div key={event._id} className="flex gap-5 items-start">
                  <div className="flex flex-col items-center">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ background: "var(--accent)" }}
                    />
                    <div
                      className="w-px h-full mt-2"
                      style={{ background: "rgba(109, 129, 150, 0.15)" }}
                    />
                  </div>
                  <div
                    className="flex-1 p-5 rounded-xl border"
                    style={{
                      background: "var(--card-bg)",
                      borderColor: "rgba(109, 129, 150, 0.15)",
                    }}
                  >
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      <div>
                        <h4 className="font-serif text-lg text-[color:var(--text-primary)]">
                          {event.title}
                        </h4>
                        <p
                          className="text-sm mt-1"
                          style={{ color: "rgba(109, 129, 150, 0.6)" }}
                        >
                          {event.location}
                        </p>
                      </div>
                      <span className="tag text-xs flex items-center justify-center whitespace-nowrap rounded-full px-3 py-1 self-start">
                        {formatEventState(event)}
                      </span>
                    </div>
                    <div
                      className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm"
                      style={{ color: "rgba(109, 129, 150, 0.7)" }}
                    >
                      <div>
                        {new Date(event.eventDate).toLocaleDateString()} |{" "}
                        {event.startTime} - {event.endTime}
                      </div>
                      <div>
                        {event.acceptedCount ?? 0}/{event.totalPositions ?? 0}{" "}
                        hired
                      </div>
                      <div>
                        {event.filled
                          ? "Filled"
                          : `${event.totalPositions - (event.acceptedCount ?? 0)} open`}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {sortedEvents.map((event) => (
                <div
                  key={event._id}
                  className="p-5 rounded-xl border"
                  style={{
                    background: "var(--card-bg)",
                    borderColor: "rgba(109, 129, 150, 0.15)",
                  }}
                >
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div>
                      <h4 className="font-serif text-lg text-[color:var(--text-primary)]">
                        {event.title}
                      </h4>
                      <p
                        className="text-sm mt-1"
                        style={{ color: "rgba(109, 129, 150, 0.6)" }}
                      >
                        {event.location}
                      </p>
                    </div>
                    <div
                      className="text-right text-sm"
                      style={{ color: "rgba(109, 129, 150, 0.7)" }}
                    >
                      <div>
                        {new Date(event.eventDate).toLocaleDateString()}
                      </div>
                      <div>
                        {event.startTime} - {event.endTime}
                      </div>
                    </div>
                  </div>
                  <div
                    className="mt-4 flex flex-wrap gap-3 text-sm"
                    style={{ color: "rgba(109, 129, 150, 0.6)" }}
                  >
                    <span>
                      {event.acceptedCount ?? 0}/{event.totalPositions ?? 0}{" "}
                      hired
                    </span>
                    <span className="tag text-xs flex items-center justify-center whitespace-nowrap rounded-full px-3 py-1">
                      {event.filled ? "Filled" : "Open"}
                    </span>
                    <span className="tag text-xs flex items-center justify-center whitespace-nowrap rounded-full px-3 py-1">
                      {formatEventState(event)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Events List */}
      <div className="card overflow-hidden animate-fade-in">
        <div
          className="p-6 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
          style={{ borderColor: "rgba(109, 129, 150, 0.1)" }}
        >
          <h2 className="font-serif text-xl text-[color:var(--text-primary)]">
            {t("common.my_events", "My Events")}
          </h2>
          <input
            type="text"
            placeholder={t("common.search_events", "Search events...")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field w-full md:w-64 text-sm"
          />
        </div>

        <div className="p-6">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <p className="mb-4" style={{ color: "rgba(109, 129, 150, 0.4)" }}>
                {t("common.no_events_found", "No events found")}
              </p>
              <Link
                to="/post-event"
                className="text-[color:var(--accent)] text-sm hover:underline"
              >
                {t("common.post_your_first_event", "Post your first event")}
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredEvents.map((event) => (
                <div
                  key={event._id}
                  className="p-6 rounded-xl border"
                  style={{
                    background: "var(--card-bg)",
                    borderColor: "rgba(109, 129, 150, 0.15)",
                  }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-serif text-xl text-[color:var(--text-primary)]">
                        {event.title}
                      </h3>
                      <p
                        className="text-sm mt-1"
                        style={{ color: "rgba(109, 129, 150, 0.6)" }}
                      >
                        {new Date(event.eventDate).toLocaleDateString()} |{" "}
                        {event.startTime} - {event.endTime}
                      </p>
                    </div>
                    <span
                      className={`tag text-xs flex items-center justify-center whitespace-nowrap rounded-full px-3 py-1 ${event.status === "active" ? "" : ""}`}
                    >
                      {event.status}
                    </span>
                  </div>
                  <p
                    className="text-sm mb-5"
                    style={{ color: "rgba(109, 129, 150, 0.6)" }}
                  >
                    {event.location}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-5">
                    {event.rolesNeeded.map((role, idx) => (
                      <span
                        key={idx}
                        className="tag text-xs flex items-center justify-center whitespace-nowrap rounded-full px-3 py-1"
                      >
                        {role.roleName} ({role.count})
                      </span>
                    ))}
                  </div>
                  <div
                    className="flex flex-wrap gap-3 mb-5 text-sm"
                    style={{ color: "rgba(109, 129, 150, 0.6)" }}
                  >
                    <span className="tag text-xs flex items-center justify-center whitespace-nowrap rounded-full px-3 py-1">
                      {event.acceptedCount ?? 0}/
                      {event.totalPositions ??
                        event.rolesNeeded.reduce(
                          (sum, r) => sum + r.count,
                          0,
                        )}{" "}
                      hired
                    </span>
                    {event.filled && (
                      <span
                        className="tag text-xs flex items-center justify-center whitespace-nowrap rounded-full px-3 py-1"
                        style={{
                          background: "rgba(109, 129, 150, 0.15)",
                          borderColor: "rgba(109, 129, 150, 0.3)",
                        }}
                      >
                        {t("common.filled", "Filled")}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      to={`/events/${event._id}`}
                      className="btn-secondary text-sm px-5 py-2.5"
                    >
                      {t("common.view_details", "View Details")}
                    </Link>
                    <button
                      onClick={() => handleViewApplications(event)}
                      className="btn-primary text-sm px-5 py-2.5"
                    >
                      Manage Applicants ({event.applicationCount || 0})
                    </button>
                    <button
                      onClick={() => fetchRecommendations(event._id)}
                      disabled={loadingRecommendations === event._id}
                      className="btn-primary text-sm px-5 py-2.5"
                      style={{
                        background: "var(--accent)",
                        color: "#000",
                        border: "none",
                      }}
                    >
                      {loadingRecommendations === event._id ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        "Find Match"
                      )}
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
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4 animate-fade-in"
          style={{ background: "var(--bg-main)", backdropFilter: "blur(8px)" }}
        >
          <div className="card max-w-2xl w-full max-h-[80vh] overflow-hidden animate-scale-in">
            <div
              className="p-6 border-b flex justify-between items-center"
              style={{ borderColor: "rgba(109, 129, 150, 0.15)" }}
            >
              <h3 className="font-serif text-xl text-[color:var(--text-primary)]">
                Applications for {selectedEvent.title}
              </h3>
              <button
                onClick={() => setShowApplications(false)}
                className="p-2 rounded-lg transition-all duration-300"
                style={{ color: "rgba(109, 129, 150, 0.6)" }}
                onMouseEnter={(e) => {
                  e.target.style.background = "rgba(109, 129, 150, 0.1)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "transparent";
                }}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {applications.length === 0 ? (
                <p
                  className="text-center py-8"
                  style={{ color: "rgba(109, 129, 150, 0.4)" }}
                >
                  {t("common.no_applications_yet", "No applications yet")}
                </p>
              ) : (
                applications.map((app) => (
                  <div key={app._id}>
                    <ApplicationCard
                      application={app}
                      eventRoles={selectedEvent?.rolesNeeded || []}
                      isOrganizer={true}
                      onStatusChange={handleStatusChange}
                      onAssign={handleAssign}
                    />
                    {app.status === "accepted" && (
                      <div className="px-1 pb-1 -mt-2">
                        <Link
                          to={`/reviews/leave?revieweeId=${app.worker?._id}&eventId=${selectedEvent?._id}&revieweeName=${encodeURIComponent(app.worker?.name || "Worker")}`}
                          style={{ color: "var(--accent)", fontSize: "0.8rem" }}
                        >
                          {t("common.leave_review", "Leave Review")}
                        </Link>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recommendations Modal */}
      {showRecommendations && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4 animate-fade-in"
          style={{ background: "var(--bg-main)", backdropFilter: "blur(8px)" }}
        >
          <div className="card max-w-2xl w-full max-h-[80vh] overflow-hidden animate-scale-in">
            <div
              className="p-6 border-b flex justify-between items-center"
              style={{ borderColor: "rgba(109, 129, 150, 0.15)" }}
            >
              <h3 className="font-serif text-xl text-[color:var(--text-primary)]">
                Recommended Workers
              </h3>
              <button
                onClick={() => setShowRecommendations(false)}
                className="p-2 rounded-lg transition-all duration-300"
                style={{ color: "rgba(109, 129, 150, 0.6)" }}
                onMouseEnter={(e) => {
                  e.target.style.background = "rgba(109, 129, 150, 0.1)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "transparent";
                }}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {recommendedWorkers.length === 0 ? (
                <p
                  className="text-center py-8"
                  style={{ color: "rgba(109, 129, 150, 0.4)" }}
                >
                  No matching workers found
                </p>
              ) : (
                <div className="space-y-4">
                  {recommendedWorkers.map((worker) => (
                    <div
                      key={worker._id}
                      className="p-4 border rounded-lg flex justify-between items-center"
                      style={{
                        borderColor: "rgba(109, 129, 150, 0.15)",
                        background: "var(--card-bg)",
                      }}
                    >
                      <div>
                        <div className="font-semibold text-[color:var(--text-primary)]">
                          {worker.name}
                        </div>
                        <div
                          className="text-sm"
                          style={{ color: "rgba(109, 129, 150, 0.7)" }}
                        >
                          Skills: {worker.skills?.join(", ")}
                        </div>
                        <div
                          className="text-sm"
                          style={{ color: "rgba(109, 129, 150, 0.7)" }}
                        >
                          Rating: {worker.rating} / 5 ({worker.totalReviews}{" "}
                          reviews)
                        </div>
                      </div>
                      <Link
                        to={`/workers/${worker._id}`}
                        className="btn-secondary text-sm px-4 py-2"
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
