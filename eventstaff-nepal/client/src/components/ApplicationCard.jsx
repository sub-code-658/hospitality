import { useState, useEffect } from 'react';

export default function ApplicationCard({ application, eventRoles = [], isOrganizer = false, onStatusChange, onAssign = async () => {} }) {
  const [assignedRole, setAssignedRole] = useState(application.assignedRole || '');
  const [shiftNotes, setShiftNotes] = useState(application.shiftNotes || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setAssignedRole(application.assignedRole || '');
    setShiftNotes(application.shiftNotes || '');
  }, [application]);

  const statusColors = {
    pending: 'bg-yellow-500/20 text-yellow-200 border-yellow-400/30',
    accepted: 'bg-green-500/20 text-green-200 border-green-400/30',
    rejected: 'bg-red-500/20 text-red-200 border-red-400/30'
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleAssign = async () => {
    if (!assignedRole.trim()) return;
    setSaving(true);
    try {
      await onAssign(application._id, assignedRole, shiftNotes);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="glass-card p-5 mb-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-semibold text-white">
            {application.event?.title || 'Event'}
          </h4>
          {application.worker && (
            <p className="text-sm text-white/60">
              {application.worker.name || application.worker.email}
            </p>
          )}
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColors[application.status]}`}>
          {application.status}
        </span>
      </div>

      {application.worker?.skills && application.worker.skills.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {application.worker.skills.map((skill, idx) => (
            <span key={idx} className="bg-white/10 text-white/70 px-2 py-1 rounded-full text-xs border border-white/20">
              {skill}
            </span>
          ))}
        </div>
      )}

      {application.message && (
        <p className="text-sm text-white/60 italic mb-4">"{application.message}"</p>
      )}

      <p className="text-xs text-white/40">
        Applied: {formatDate(application.appliedAt)}
      </p>

      {application.assigned && (
        <div className="glass p-4 rounded-2xl mt-4 border border-green-400/20">
          <p className="text-sm text-green-200 font-medium">Assigned Role</p>
          <p className="text-white/80 mt-2">{application.assignedRole || 'Assigned'}</p>
          {application.shiftNotes && (
            <p className="text-sm text-white/60 mt-2">{application.shiftNotes}</p>
          )}
        </div>
      )}

      {isOrganizer && application.status === 'accepted' && (
        <div className="glass p-4 rounded-2xl mt-4 border border-white/10">
          <h5 className="text-sm font-semibold text-white mb-3">Assign shift</h5>
          <div className="grid gap-4">
            <select
              value={assignedRole}
              onChange={(e) => setAssignedRole(e.target.value)}
              className="w-full px-4 py-3 rounded-xl glass-input text-white"
            >
              <option value="">Select role</option>
              {eventRoles.map((role, idx) => (
                <option key={idx} value={role.roleName}>
                  {role.roleName}
                </option>
              ))}
            </select>
            <textarea
              rows={3}
              value={shiftNotes}
              onChange={(e) => setShiftNotes(e.target.value)}
              placeholder="Shift instructions or notes"
              className="w-full px-4 py-3 rounded-xl glass-input text-white"
            />
            <button
              onClick={handleAssign}
              disabled={saving || !assignedRole.trim()}
              className="glass-btn text-white px-4 py-3 rounded-xl font-semibold disabled:opacity-50"
            >
              {saving ? 'Saving...' : (application.assigned ? 'Update Assignment' : 'Save Assignment')}
            </button>
          </div>
        </div>
      )}

      {isOrganizer && application.status === 'pending' && (
        <div className="flex gap-3 mt-4 pt-4 border-t border-white/10">
          <button
            onClick={() => onStatusChange(application._id, 'accepted')}
            className="flex-1 glass text-green-300 px-4 py-2 rounded-xl hover:bg-green-500/20 transition-all duration-300 border border-green-400/30"
          >
            Accept
          </button>
          <button
            onClick={() => onStatusChange(application._id, 'rejected')}
            className="flex-1 glass text-red-300 px-4 py-2 rounded-xl hover:bg-red-500/20 transition-all duration-300 border border-red-400/30"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
}