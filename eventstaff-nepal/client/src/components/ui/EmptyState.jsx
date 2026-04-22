const EmptyState = ({ icon = '◆', title, description, action, actionLabel, className = '' }) => {
  return (
    <div className={`flex flex-col items-center justify-center py-20 text-center ${className}`}>
      {/* Big faint background icon */}
      <div className="relative mb-6">
        <span
          style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '5rem',
            color: 'transparent',
            WebkitTextStroke: '1px rgba(232, 104, 30, 0.15)',
            lineHeight: 1,
            display: 'block',
            userSelect: 'none',
          }}
        >
          {icon}
        </span>
      </div>

      <h3 className="font-serif text-2xl mb-3" style={{ color: 'var(--text)', fontWeight: 400 }}>
        {title}
      </h3>

      {description && (
        <p className="text-sm max-w-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          {description}
        </p>
      )}

      {action && actionLabel && (
        <button onClick={action} className="btn-secondary mt-8 px-6 py-2.5 text-xs">
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
