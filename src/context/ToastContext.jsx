import React, { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ type = 'info', title, message, duration = 4500 }) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev, { id, type, title, message }]);
      if (duration > 0) {
        setTimeout(() => removeToast(id), duration);
      }
      return id;
    },
    [removeToast]
  );

  const toast = {
    success: (message, title = 'Success') =>
      addToast({ type: 'success', title, message }),
    error: (message, title = 'Error') =>
      addToast({ type: 'error', title, message, duration: 6000 }),
    info: (message, title = 'Notice') =>
      addToast({ type: 'info', title, message }),
  };

  return (
    <ToastContext.Provider value={{ toast, addToast, removeToast }}>
      {children}
      {/* Toast Container */}
      <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2.5 px-4 sm:px-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-start gap-3 rounded-xl border border-slate-200/90 bg-white p-4 shadow-lg transition-all duration-200 dark:border-slate-800 dark:bg-slate-900"
          >
            {t.type === 'success' && (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
            )}
            {t.type === 'error' && (
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
            )}
            {t.type === 'info' && (
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-indigo-500" />
            )}
            <div className="min-w-0 flex-1">
              {t.title && (
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {t.title}
                </p>
              )}
              <p className="mt-0.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                {t.message}
              </p>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
