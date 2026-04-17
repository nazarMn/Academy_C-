import { createContext, useContext, useCallback, useState } from 'react';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

const icons = {
  success: CheckCircle,
  error:   AlertCircle,
  info:    Info,
  warning: AlertTriangle,
};

const colors = {
  success: 'border-l-success text-success',
  error:   'border-l-danger text-danger',
  info:    'border-l-accent text-accent',
  warning: 'border-l-warning text-warning',
};

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type, exiting: false }]);
    setTimeout(() => dismissToast(id), duration);
    return id;
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts(prev =>
      prev.map(t => (t.id === id ? { ...t, exiting: true } : t))
    );
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 300);
  }, []);

  const toast = useCallback((message, type) => addToast(message, type), [addToast]);
  toast.success = (msg) => addToast(msg, 'success');
  toast.error   = (msg) => addToast(msg, 'error');
  toast.info    = (msg) => addToast(msg, 'info');
  toast.warning = (msg) => addToast(msg, 'warning');

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast container */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => {
          const Icon = icons[t.type] || icons.info;
          return (
            <div
              key={t.id}
              className={`
                pointer-events-auto
                flex items-center gap-3
                px-4 py-3 min-w-[280px] max-w-[380px]
                bg-surface-900 border border-surface-700
                border-l-[3px] rounded-lg
                shadow-elevated backdrop-blur-xl
                ${colors[t.type] || colors.info}
                ${t.exiting ? 'animate-toast-out' : 'animate-toast-in'}
              `}
            >
              <Icon size={18} className="flex-shrink-0" />
              <span className="text-sm text-surface-50 flex-1 font-medium">
                {t.message}
              </span>
              <button
                onClick={() => dismissToast(t.id)}
                className="text-surface-500 hover:text-surface-300 transition-colors flex-shrink-0"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
