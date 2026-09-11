import { Check, AlertTriangle, X } from 'lucide-react';
import { useEffect } from 'react';

export interface ToastProps {
  id?: string;
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose?: () => void;
  duration?: number;
}

export function Toast({
  id = 'global-toast',
  message,
  type = 'success',
  onClose,
  duration = 3000
}: ToastProps) {
  useEffect(() => {
    if (onClose && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [onClose, duration]);

  const styles = {
    success: 'bg-success-800 text-white border-success-700/20 shadow-success-600/10',
    error: 'bg-error-800 text-white border-error-700/20 shadow-error-600/10',
    info: 'bg-secondary-900 text-white border-secondary-800 shadow-secondary-900/10'
  };

  const icons = {
    success: <Check className="w-3.5 h-3.5 text-success-200" />,
    error: <AlertTriangle className="w-3.5 h-3.5 text-error-200" />,
    info: <Check className="w-3.5 h-3.5 text-primary-300" />
  };

  return (
    <div
      id={id}
      className={`fixed top-4 left-1/2 -translate-x-1/2 flex items-center gap-2.5 py-2.5 px-4 rounded-full border shadow-xl z-50 text-xs font-semibold animate-bounce ${styles[type]}`}
    >
      {icons[type]}
      <span id={`${id}-message`}>{message}</span>
      {onClose && (
        <button
          id={`${id}-close`}
          onClick={onClose}
          className="hover:opacity-75 transition"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}
