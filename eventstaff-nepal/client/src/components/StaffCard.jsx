import { Link } from 'react-router-dom';

export default function StaffCard({ worker, onInvite }) {
  return (
    <div className="glass-card p-5 h-full flex flex-col group relative overflow-hidden transition-all duration-300 hover:scale-[1.02]">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          {worker.avatar ? (
            <img src={worker.avatar} alt={worker.name} className="w-12 h-12 rounded-full object-cover border border-[var(--border)]" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-[var(--surface-raised)] border border-[var(--border)] flex items-center justify-center">
              <span className="text-[var(--text-muted)] font-serif text-lg">{worker.name.charAt(0)}</span>
            </div>
          )}
          <div>
            <h3 className="text-white font-medium text-lg leading-tight group-hover:text-[var(--flame-light)] transition-colors">
              {worker.name}
            </h3>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-[var(--gold)] text-xs">★</span>
              <span className="text-[var(--text-muted)] text-xs">{worker.rating ? worker.rating.toFixed(1) : 'New'}</span>
              {worker.totalReviews > 0 && <span className="text-[var(--text-dim)] text-xs ml-1">({worker.totalReviews})</span>}
            </div>
          </div>
        </div>
        {worker.isAvailable && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-green-500/10 text-green-400 border border-green-500/20">
            Available
          </span>
        )}
      </div>

      <div className="mb-4">
        <p className="text-[var(--text-dim)] text-xs mb-2">Skills</p>
        <div className="flex flex-wrap gap-2">
          {worker.skills?.map((skill, idx) => (
            <span key={idx} className="bg-[var(--surface-raised)] text-[var(--text-muted)] px-2 py-1 rounded text-[10px] uppercase tracking-wider border border-[var(--border)]">
              {skill}
            </span>
          ))}
          {(!worker.skills || worker.skills.length === 0) && (
            <span className="text-[var(--text-dim)] text-xs italic">No skills listed</span>
          )}
        </div>
      </div>

      <div className="mt-auto flex gap-3">
        <Link
          to={`/workers/${worker.id || worker._id}`}
          className="flex-1 btn-secondary py-2 text-xs text-center"
        >
          View Profile
        </Link>
        <button
          onClick={onInvite}
          className="flex-1 btn-glass py-2 text-xs text-center font-medium"
        >
          Invite
        </button>
      </div>
    </div>
  );
}
