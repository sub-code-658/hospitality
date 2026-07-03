import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { initiateConversation } from '../utils/messageUtils';

export default function ApplicationCard({ application, eventRoles = [], isOrganizer = false, onStatusChange, onAssign = async () => {} }) {
  const [assignedRole, setAssignedRole] = useState(application.assignedRole || '');
  const [shiftNotes, setShiftNotes] = useState(application.shiftNotes || '');
  const [saving, setSaving] = useState(false);
  const [paying, setPaying] = useState(false);
  const [sendDirectMessage, setSendDirectMessage] = useState(false);
  const navigate = useNavigate();

  const handlePayment = async () => {
    setPaying(true);
    try {
      const res = await api.post('/payments/initialize', {
        applicationId: application._id,
        paymentMethod: 'esewa'
      });
      if (res.data.success) {
        const form = document.createElement('form');
        form.setAttribute('method', 'POST');
        form.setAttribute('action', res.data.actionUrl);

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
          signed_field_names: 'total_amount,transaction_uuid,product_code',
          signature: res.data.signature
        };

        for (const key in params) {
          const hiddenField = document.createElement('input');
          hiddenField.setAttribute('type', 'hidden');
          hiddenField.setAttribute('name', key);
          hiddenField.setAttribute('value', params[key]);
          form.appendChild(hiddenField);
        }

        document.body.appendChild(form);
        form.submit();
      }
    } catch (err) {
      console.error('Payment initialization failed:', err);
    } finally {
      setPaying(false);
    }
  };

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

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!assignedRole.trim()) return;
    setSaving(true);
    try {
      await onAssign(application._id, assignedRole, shiftNotes);
      if (sendDirectMessage && application.worker?._id) {
        // Create the message content
        const msg = `Assignment Update for ${application.event?.title}:\nRole: ${assignedRole}\nNotes: ${shiftNotes}`;
        await api.post('/messages', {
          receiverId: application.worker._id,
          content: msg
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
          <h4 className="font-semibold text-white">
            {application.event?.title || 'Event'}
          </h4>
          {application.worker && (
            <div className="flex items-center gap-3 mt-1">
              <p className="text-sm text-white/60">
                {application.worker.name || application.worker.email}
              </p>
              <button 
                onClick={() => initiateConversation(application.worker._id || application.worker, navigate)}
                className="btn-glass px-2 py-1 text-[10px] flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                Message
              </button>
            </div>
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

      {application.status === 'accepted' && (
        <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-white/60">Shift Payment:</span>
            {application.isPaid ? (
              <span className="px-3 py-1 bg-green-500/20 text-green-300 border border-green-500/30 text-xs font-semibold uppercase tracking-wider rounded-full flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                Paid
              </span>
            ) : (
              <span className="text-xs text-yellow-300 font-semibold uppercase tracking-wider">Unpaid</span>
            )}
          </div>
          
          {isOrganizer && !application.isPaid && (
            <button
              onClick={handlePayment}
              disabled={paying}
              className="btn-primary w-full py-2.5 rounded-xl font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
            >
              {paying ? 'Redirecting to eSewa...' : 'Pay Shift via eSewa'}
            </button>
          )}
        </div>
      )}

      {isOrganizer && application.status === 'accepted' && (
        <div className="glass p-4 rounded-2xl mt-4 border border-white/10">
          <h5 className="text-sm font-semibold text-white mb-3">Assign shift</h5>
          <form onSubmit={handleAssignSubmit} className="grid gap-4">
            <select
              value={assignedRole}
              onChange={(e) => setAssignedRole(e.target.value)}
              className="w-full px-4 py-3 rounded-xl glass-input text-white"
            >
              <option value="">Select role</option>
              {eventRoles.map((role, idx) => (
                <option key={idx} value={role.roleName} className="bg-[var(--surface)] text-white">
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
            <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
              <input 
                type="checkbox" 
                checked={sendDirectMessage} 
                onChange={(e) => setSendDirectMessage(e.target.checked)} 
                className="rounded border-white/20 bg-white/5 text-primary-500 focus:ring-primary-500" 
              />
              Send this update as a direct message
            </label>
            <button
              type="submit"
              disabled={saving || !assignedRole.trim()}
              className="btn-glass w-full py-3 rounded-xl font-semibold disabled:opacity-50"
            >
              {saving ? 'Saving...' : (application.assigned ? 'Update Assignment' : 'Save Assignment')}
            </button>
          </form>
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