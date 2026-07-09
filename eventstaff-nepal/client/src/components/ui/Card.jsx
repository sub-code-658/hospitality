const Card = ({
  children,
  hover = true,
  padding = "md", // sm, md, lg
  header,
  footer,
  className = "",
}) => {
  const paddings = {
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <div
      className={`glass-card ${hover ? "hover:scale-[1.01]" : ""} transition-transform duration-300 ${className}`}
    >
      {header && (
        <div className="p-6 border-b border-[color:var(--border)]">
          {header}
        </div>
      )}

      <div className={paddings[padding]}>{children}</div>

      {footer && (
        <div className="p-6 border-t border-[color:var(--border)]">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
