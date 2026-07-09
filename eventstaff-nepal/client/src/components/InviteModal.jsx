import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import api from "../services/axios";
import { useToast } from "./Toast";
import LoadingSpinner from "./LoadingSpinner";

export default function InviteModal({ isOpen, onClose, worker }) {
  const { t } = useTranslation();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingEvents, setFetchingEvents] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [message, setMessage] = useState("");
  const { addToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setMessage(
        `Hi ${worker?.name || "there"},\n\nI came across your profile and would love to invite you to work at my upcoming event. Please let me know if you're interested!`,
      );
      fetchMyEvents();
    }
  }, [isOpen, worker]);

  const fetchMyEvents = async () => {
    setFetchingEvents(true);
    try {
      const res = await api.get("/events/organizer/my-events");
      // Filter only active events
      const activeEvents = res.data.filter((e) => e.status === "active");
      setEvents(activeEvents);
      if (activeEvents.length > 0) {
        setSelectedEvent(activeEvents[0]._id);
      }
    } catch (error) {
      addToast("Failed to fetch your events", "error");
    } finally {
      setFetchingEvents(false);
    }
  };

  const handleSend = async () => {
    if (!selectedEvent) {
      addToast("Please select an event", "error");
      return;
    }

    setLoading(true);
    try {
      await api.post("/invitations", {
        workerId: worker._id || worker.id,
        eventId: selectedEvent,
        message,
      });
      addToast("Invitation sent successfully!", "success");
      onClose();
    } catch (error) {
      addToast(
        error.response?.data?.message || "Failed to send invitation",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="glass-card w-full max-w-md p-6 m-4 animate-scale-in relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[color:var(--text-main)] text-[color:var(--text-primary)] transition-colors"
        >
          ✕
        </button>

        <h2 className="text-xl font-serif text-[color:var(--text-main)] text-[color:var(--text-primary)] mb-1">
          {t("common.invite_user", "Invite {{name}}", {
            name: worker?.name || "",
          })}
        </h2>
        <p className="text-xs text-[var(--text-muted)] mb-6">
          Select an event to send an invitation.
        </p>

        {fetchingEvents ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : events.length === 0 ? (
          <div className="py-6 text-center text-[var(--text-muted)] text-sm">
            {t(
              "common.you_don_t_have_any_active_even",
              "You don't have any active events to invite staff to.",
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-2">
                {t("common.select_event", "Select Event")}
              </label>
              <select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="glass-input w-full"
              >
                {events.map((ev) => (
                  <option
                    key={ev._id}
                    value={ev._id}
                    className="bg-[var(--surface)] text-[color:var(--text-main)] text-[color:var(--text-primary)]"
                  >
                    {ev.title} ({new Date(ev.eventDate).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-2">
                {t("common.message", "Message")}
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="glass-input w-full h-32 resize-none"
                placeholder={t(
                  "common.write_your_invitation_message",
                  "Write your invitation message...",
                )}
              />
            </div>

            <button
              onClick={handleSend}
              disabled={loading || !selectedEvent}
              className="btn-primary w-full py-3 mt-2"
            >
              {loading ? <LoadingSpinner size="sm" /> : "Send Invitation"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
