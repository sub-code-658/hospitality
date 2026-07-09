const Badge = ({
  children,
  variant = "default", // pending, accepted, rejected, active, closed, default
  size = "md", // sm, md
  className = "",
}) => {
  const variants = {
    pending:
      "bg-[color:var(--surface-raised)] text-[color:var(--text-main)] dark:text-[color:var(--text-main)] border-yellow-400/30",
    accepted:
      "bg-[color:var(--surface-raised)] text-[color:var(--text-main)] dark:text-[color:var(--text-main)] border-green-400/30",
    rejected: "bg-red-500/20 text-red-700 dark:text-red-200 border-red-400/30",
    active:
      "bg-primary-500/20 text-primary-700 dark:text-primary-200 border-primary-400/30",
    closed:
      "bg-gray-500/20 text-gray-700 dark:text-gray-200 border-gray-400/30",
    default:
      "bg-[color:var(--surface-raised)] text-[color:var(--text-main)]/70 text-[color:var(--text-primary)]/70 border-white/20",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
  };

  return (
    <span
      className={`
        inline-flex items-center rounded-full font-medium border backdrop-blur-sm
        ${variants[variant]} ${sizes[size]} ${className}
      `}
    >
      {children}
    </span>
  );
};

export default Badge;
