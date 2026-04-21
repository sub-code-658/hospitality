const Card = ({
  children,
  hover = true,
  padding = 'md', // sm, md, lg
  header,
  footer,
  className = ''
}) => {
  const paddings = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  return (
    <div className={`glass-card ${hover ? 'hover:scale-[1.01]' : ''} transition-transform duration-300 ${className}`}>
      {header && (
        <div className="p-6 border-b border-white/10">
          {header}
        </div>
      )}

      <div className={paddings[padding]}>
        {children}
      </div>

      {footer && (
        <div className="p-6 border-t border-white/10">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;