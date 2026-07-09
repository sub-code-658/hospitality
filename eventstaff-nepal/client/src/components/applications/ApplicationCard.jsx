import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import api from "../services/axios";
import { initiateConversation } from "../utils/messageUtils";

export default function ApplicationCard({
  application,
  eventRoles = [],
  isOrganizer = false,
  onStatusChange,
  onAssign = async () => {},
}) {
  const { t } = useTranslation();
  const [assignedRole, setAssignedRole] = useState(
    application.assignedRole || "",
  );
  const [shiftNotes, setShiftNotes] = useState(application.shiftNotes || "");
  const [saving, setSaving] = useState(false);
  const [paying, setPaying] = useState(false);
  const [sendDirectMessage, setSendDirectMessage] = useState(false);
  const navigate = useNavigate();

  const handlePayment = async () => {
    setPaying(true);
    try {
      const res = await api.post("/payments/initialize", {
        applicationId: application._id,
        paymentMethod: "esewa",
      });
      if (res.data.success) {
        const form = document.createElement("form");
        form.setAttribute("method", "POST");
        form.setAttribute("action", res.data.actionUrl);

        const params = {
          amount: res.data.amount,
          tax_amount: 0,
          total_amount: res.data.amount,
          transaction_uuid: res.data.transactionUuid,
          product_code: res.data.productCode,
          product_service_charge: 0,
          product_delivery_charge: 0,
          success_url: `${window.location.origin}/payments/callback`,
          failure_url: `${window.location.origin}/payments/callback`,
          signed_field_names: "total_amount,transaction_uuid,product_code",
          signature: res.data.signature,
        };

        for (const key in params) {
          const hiddenField = document.createElement("input");
          hiddenField.setAttribute("type", "hidden");
          hiddenField.setAttribute("name", key);
          hiddenField.setAttribute("value", params[key]);
          form.appendChild(hiddenField);
        }

        document.body.appendChild(form);
        form.submit();
      }
    } catch (err) {
      console.error("Payment initialization failed:", err);
    } finally {
      setPaying(false);
    }
  };

  useEffect(() => {
    setAssignedRole(application.assignedRole || "");
    setShiftNotes(application.shiftNotes || "");
  }, [application]);

  const statusColors = {
    pending:
      "bg-[color:var(--surface-raised)] text-[color:var(--text-main)] dark:text-[color:var(--text-main)] border-yellow-500/40 dark:border-yellow-400/30",
    accepted:
      "bg-[color:var(--surface-raised)] text-[color:var(--text-main)] dark:text-[color:var(--text-main)] border-green-500/40 dark:border-green-400/30",
    rejected:
      "bg-red-500/20 text-red-700 dark:text-red-200 border-red-500/40 dark:border-red-400/30",
    completed:
      "bg-blue-500/20 text-blue-700 dark:text-blue-200 border-blue-500/40 dark:border-blue-400/30",
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!assignedRole.trim()) return;
    setSaving(true);
    try {
      await onAssign(application._id, assignedRole, shiftNotes);
      if (sendDirectMessage && application.worker?._id) {
        // Create the message content
        const msg = `Assignment Update for ${application.event?.title}:\nRole: ${assignedRole}\nNotes: ${shiftNotes}`;
        await api.post("/messages", {
          receiverId: application.worker._id,
          content: msg,
        });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="glass-card p-5 mb-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-semibold text-[color:var(--text)]">
            {application.event?.title || "Event"}
          </h4>
          {application.worker && (
            <div className="flex items-center gap-3 mt-1">
              <p className="text-sm text-[color:var(--text-muted)]">
                {application.worker.name || application.worker.email}
              </p>
              <button
                onClick={() =>
                  initiateConversation(
                    application.worker._id || application.worker,
                    navigate,
                  )
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
            </div>
          )}
        </div>
        <span
          className={`flex items-center justify-center whitespace-nowrap px-3 py-1 rounded-full text-xs font-medium border ${statusColors[application.status]}`}
        >
          {application.status}
        </span>
      </div>

      {application.worker?.skills && application.worker.skills.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {application.worker.skills.map((skill, idx) => (
            <span
              key={idx}
              className="bg-[color:var(--surface-raised)] text-[color:var(--text-muted)] px-2 py-1 rounded-full text-xs border border-[color:var(--border-hover)]"
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      {application.message && (
        <p className="text-sm text-[color:var(--text-muted)] italic mb-4">
          "{application.message}"
        </p>
      )}

      <p className="text-xs text-[color:var(--text-dim)]">
        Applied: {formatDate(application.appliedAt)}
      </p>

      <div className="glass p-4 rounded-2xl mt-4 border border-[color:var(--border)]">
        <p className="text-sm text-[color:var(--text-muted)] font-medium">
          {t("common.applied_as", "Applied As:")}
        </p>
        <p className="text-[color:var(--text)] mt-1 mb-3">
          {application.roleAppliedFor}
        </p>

        {["accepted", "completed"].includes(application.status) && (
          <>
            <p className="text-sm text-[color:var(--accent)] font-medium">
              {t("common.accepted_for", "Accepted For Role:")}
            </p>
            <p className="text-[color:var(--text)] mt-1 font-semibold">
              {application.assignedRole || application.roleAppliedFor}
            </p>
            {application.shiftNotes && (
              <p className="text-sm text-[color:var(--text-muted)] mt-2 italic">
                Notes: {application.shiftNotes}
              </p>
            )}
          </>
        )}
      </div>

      {application.status === "accepted" && (
        <div className="mt-4 pt-4 border-t border-[color:var(--border)] flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-[color:var(--text-muted)]">
              {t("common.shift_payment", "Shift Payment:")}
            </span>
            {application.isPaid ? (
              <span className="flex items-center justify-center whitespace-nowrap px-3 py-1 bg-[color:var(--surface-raised)] text-[color:var(--accent)] border border-green-500/30 text-xs font-semibold uppercase tracking-wider rounded-full gap-1.5">
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {t("common.paid", "Paid")}
              </span>
            ) : (
              <span className="flex items-center justify-center whitespace-nowrap px-3 py-1 bg-[color:var(--surface-raised)] text-[color:var(--text-main)] dark:text-[color:var(--text-main)] border border-yellow-500/30 text-xs font-semibold uppercase tracking-wider rounded-full">
                {t("common.payment_pending", "Payment Pending")}
              </span>
            )}
          </div>

          {isOrganizer && !application.isPaid && (
            <button
              onClick={handlePayment}
              disabled={paying}
              className="btn-primary w-full py-2.5 rounded-xl font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
            >
              {paying ? "Redirecting to eSewa..." : "Pay Shift via eSewa"}
            </button>
          )}
        </div>
      )}

      {isOrganizer && application.status === "accepted" && (
        <div className="glass p-4 rounded-2xl mt-4 border border-[color:var(--border)]">
          <h5 className="text-sm font-semibold text-[color:var(--text)] mb-3">
            {t("common.assign_shift", "Assign shift")}
          </h5>
          <form onSubmit={handleAssignSubmit} className="grid gap-4">
            <select
              value={assignedRole}
              onChange={(e) => setAssignedRole(e.target.value)}
              className="w-full px-4 py-3 rounded-xl glass-input text-[color:var(--text)]"
            >
              <option value="">{t("common.select_role", "Select role")}</option>
              {eventRoles.map((role, idx) => (
                <option
                  key={idx}
                  value={role.roleName}
                  className="bg-[var(--surface)] text-[color:var(--text)]"
                >
                  {role.roleName}
                </option>
              ))}
            </select>
            <textarea
              rows={3}
              value={shiftNotes}
              onChange={(e) => setShiftNotes(e.target.value)}
              placeholder={t(
                "common.shift_instructions_or_notes",
                "Shift instructions or notes",
              )}
              className="w-full px-4 py-3 rounded-xl glass-input text-[color:var(--text)]"
            />
            <label className="flex items-center gap-2 text-sm text-[color:var(--text-muted)] cursor-pointer">
              <input
                type="checkbox"
                checked={sendDirectMessage}
                onChange={(e) => setSendDirectMessage(e.target.checked)}
                className="rounded border-[color:var(--border-hover)] bg-[color:var(--surface-raised)] text-primary-500 focus:ring-primary-500"
              />
              Send this update as a direct message
            </label>
            <button
              type="submit"
              disabled={saving || !assignedRole.trim()}
              className="btn-glass w-full py-3 rounded-xl font-semibold disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : application.assigned
                  ? "Update Assignment"
                  : "Save Assignment"}
            </button>
          </form>
        </div>
      )}

      {isOrganizer && application.status === "pending" && (
        <div className="flex gap-3 mt-4 pt-4 border-t border-[color:var(--border)]">
          <button
            onClick={() => onStatusChange(application._id, "accepted")}
            className="flex-1 glass text-[color:var(--accent)] px-4 py-2 rounded-xl hover:bg-[color:var(--surface-raised)] transition-all duration-300 border border-green-400/30"
          >
            {t("common.accept", "Accept")}
          </button>
          <button
            onClick={() => onStatusChange(application._id, "rejected")}
            className="flex-1 glass text-[color:var(--crimson)] px-4 py-2 rounded-xl hover:bg-red-500/10 transition-all duration-300 border border-red-500/20 dark:border-red-400/30 dark:hover:bg-red-500/20"
          >
            {t("common.reject", "Reject")}
          </button>
        </div>
      )}
    </div>
  );
}
