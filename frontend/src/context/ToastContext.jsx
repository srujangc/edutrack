import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ type = 'info', message, duration = 4000 }) => {
      const id = Date.now() + Math.random().toString(36).substring(2, 9);
      const newToast = { id, type, message };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const toast = {
    success: (msg, duration) => addToast({ type: 'success', message: msg, duration }),
    error: (msg, duration) => addToast({ type: 'error', message: msg, duration }),
    warning: (msg, duration) => addToast({ type: 'warning', message: msg, duration }),
    info: (msg, duration) => addToast({ type: 'info', message: msg, duration }),
  };

  return (
    <ToastContext.Provider value={{ toast, addToast, removeToast }}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((item) => {
          const isSuccess = item.type === 'success';
          const isError = item.type === 'error';
          const isWarning = item.type === 'warning';

          return (
            <div
              key={item.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 ${
                isSuccess
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/80 dark:border-emerald-800 dark:text-emerald-200'
                  : isError
                  ? 'bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-950/80 dark:border-rose-800 dark:text-rose-200'
                  : isWarning
                  ? 'bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/80 dark:border-amber-800 dark:text-amber-200'
                  : 'bg-indigo-50 border-indigo-200 text-indigo-900 dark:bg-indigo-950/80 dark:border-indigo-800 dark:text-indigo-200'
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
                {isError && <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />}
                {isWarning && <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
                {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
              </div>

              <div className="flex-1 text-sm font-medium leading-relaxed">
                {item.message}
              </div>

              <button
                onClick={() => removeToast(item.id)}
                className="shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context.toast;
};
