import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import { cn } from '../../utils/cn';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(({ title, description, variant = 'info', duration = 4000 }) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, title, description, variant }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="fixed bottom-0 right-0 z-50 p-4 space-y-3 max-w-md w-full pointer-events-none"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={cn(
              "pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-lg transition-all duration-300 transform translate-y-0",
              toast.variant === 'success' && "bg-emerald-50 border-emerald-200 text-emerald-950",
              toast.variant === 'error' && "bg-rose-50 border-rose-200 text-rose-950",
              toast.variant === 'warning' && "bg-amber-50 border-amber-200 text-amber-950",
              toast.variant === 'info' && "bg-slate-900 border-slate-800 text-white"
            )}
          >
            <div className="flex-shrink-0 mt-0.5">
              {toast.variant === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600" aria-hidden="true" />}
              {toast.variant === 'error' && <XCircle className="w-5 h-5 text-rose-600" aria-hidden="true" />}
              {toast.variant === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-600" aria-hidden="true" />}
              {toast.variant === 'info' && <Info className="w-5 h-5 text-teal-400" aria-hidden="true" />}
            </div>

            <div className="flex-1 text-sm">
              {toast.title && <p className="font-semibold">{toast.title}</p>}
              {toast.description && (
                <p className={cn("text-xs mt-0.5", toast.variant === 'info' ? "text-slate-300" : "opacity-90")}>
                  {toast.description}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              aria-label="Cerrar notificación"
              tabIndex={0}
              className="flex-shrink-0 rounded-lg p-1 opacity-70 hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast debe ser usado dentro de un ToastProvider');
  }
  return context;
};

/**
 * Componente Toast Autónomo Accesible (para uso sin context o inline)
 */
export const Toast = ({
  type = 'info',
  variant,
  title,
  message,
  description,
  onClose,
  className,
}) => {
  const finalVariant = variant || (type === 'error' ? 'error' : type === 'success' ? 'success' : type === 'warning' ? 'warning' : 'info');
  const finalMessage = message || description;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'fixed bottom-5 right-5 z-50 flex items-start gap-3 p-4 rounded-2xl border shadow-xl transition-all duration-300 max-w-md w-full animate-in slide-in-from-bottom-3',
        finalVariant === 'success' && 'bg-emerald-50 border-emerald-200 text-emerald-950',
        finalVariant === 'error' && 'bg-rose-50 border-rose-200 text-rose-950',
        finalVariant === 'warning' && 'bg-amber-50 border-amber-200 text-amber-950',
        finalVariant === 'info' && 'bg-slate-900 border-slate-800 text-white',
        className
      )}
    >
      <div className="flex-shrink-0 mt-0.5">
        {finalVariant === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600" aria-hidden="true" />}
        {finalVariant === 'error' && <XCircle className="w-5 h-5 text-rose-600" aria-hidden="true" />}
        {finalVariant === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-600" aria-hidden="true" />}
        {finalVariant === 'info' && <Info className="w-5 h-5 text-teal-400" aria-hidden="true" />}
      </div>

      <div className="flex-1 text-sm">
        {title && <p className="font-semibold font-heading">{title}</p>}
        {finalMessage && (
          <p className={cn('text-xs mt-0.5', finalVariant === 'info' ? 'text-slate-300' : 'opacity-90')}>
            {finalMessage}
          </p>
        )}
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar notificación"
          tabIndex={0}
          className="flex-shrink-0 rounded-lg p-1 opacity-70 hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
