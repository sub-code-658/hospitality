import { useState, useEffect, createContext, useContext } from 'react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4200);
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <ToastContainer toasts={toasts} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};

const ACCENT = {
  success: { bar: '#6baf8a', bg: 'rgba(13, 17, 24, 0.97)', border: 'rgba(107, 175, 138, 0.2)' },
  error: { bar: '#cc3b3b', bg: 'rgba(16, 11, 11, 0.97)', border: 'rgba(204, 59, 59, 0.2)' },
  info: { bar: '#89b4cc', bg: 'rgba(10, 14, 22, 0.97)', border: 'rgba(137, 180, 204, 0.2)' },
};

function ToastItem({ toast }) {
  const [visible, setVisible] = useState(false);
  const colors = ACCENT[toast.type] || ACCENT.info;

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 20);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      style={{
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        borderLeft: 'none',
        borderRadius: '0 0.375rem 0.375rem 0',
        backdropFilter: 'blur(16px)',
        transform: visible ? 'translateX(0)' : 'translateX(110%)',
        transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'flex',
        alignItems: 'stretch',
        overflow: 'hidden',
        minWidth: 280,
        maxWidth: 360,
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}
    >
      <div style={{ width: 3, background: colors.bar, flexShrink: 0 }} />
      <div style={{ padding: '0.875rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{ color: 'var(--text)', fontSize: '0.875rem', fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 500, lineHeight: 1.4 }}>
          {toast.message}
        </span>
      </div>
    </div>
  );
}

function ToastContainer({ toasts }) {
  return (
    <div className="fixed top-20 right-4 z-[1001] flex flex-col gap-2.5 items-end">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
