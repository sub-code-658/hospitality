const EmptyState = ({
  icon = '📭',
  title,
  description,
  action,
  actionLabel,
  className = ''
}) => {
  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      {description && (
        <p className="text-white/50 mb-6 max-w-md mx-auto">{description}</p>
      )}
      {action && actionLabel && (
        <button
          onClick={action}
          className="glass-btn text-white px-6 py-3 rounded-xl font-medium"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;