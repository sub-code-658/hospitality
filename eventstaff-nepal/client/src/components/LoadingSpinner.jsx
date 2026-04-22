export default function LoadingSpinner({ size = 'md' }) {
  const dim = { sm: 20, md: 36, lg: 56 }[size];
  const border = size === 'sm' ? 2 : 2;

  return (
    <div className="flex items-center justify-center">
      <div
        style={{
          width: dim,
          height: dim,
          border: `${border}px solid rgba(232, 104, 30, 0.15)`,
          borderTopColor: 'var(--flame)',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }}
      />
    </div>
  );
}
