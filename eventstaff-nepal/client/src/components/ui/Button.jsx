import LoadingSpinner from './LoadingSpinner';

const Button = ({
  children,
  variant = 'primary', // primary, secondary, danger, ghost
  size = 'md', // sm, md, lg
  loading = false,
  disabled = false,
  fullWidth = false,
  type = 'button',
  onClick,
  className = '',
  ...props
}) => {
  const variants = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white border-primary-600',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-300',
    danger: 'bg-red-600 hover:bg-red-700 text-white border-red-600',
    ghost: 'bg-transparent hover:bg-white/10 text-white border-white/20'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center font-medium rounded-xl border transition-all duration-300
        ${variants[variant]} ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <>
          <LoadingSpinner size="sm" />
          <span className="ml-2">Loading...</span>
        </>
      ) : children}
    </button>
  );
};

export default Button;