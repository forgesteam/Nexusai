import { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, CircleAlert, Info, X } from 'lucide-react';
import type { ToastItem } from '../types';

const ToastContext = createContext<{ pushToast: (toast: Omit<ToastItem, 'id'>) => void }>({ pushToast: () => undefined });

export function useToast() {
  return useContext(ToastContext);
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const pushToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { ...toast, id }]);
    window.setTimeout(() => setToasts((current) => current.filter((item) => item.id !== id)), 5000);
  }, []);
  const icons = { success: CheckCircle2, error: CircleAlert, info: Info };

  return (
    <ToastContext.Provider value={{ pushToast }}>
      {children}
      <div className="fixed right-4 top-4 z-[60] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => {
          const Icon = icons[toast.variant];
          return <div key={toast.id} className="flex gap-3 rounded-lg border border-border bg-popover p-4 text-popover-foreground shadow-md">
            <Icon className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
            <div className="min-w-0 flex-1"><p className="text-sm font-medium">{toast.title}</p>{toast.description && <p className="mt-1 text-xs text-muted-foreground">{toast.description}</p>}</div>
            <button type="button" aria-label="Dismiss notification" onClick={() => setToasts((current) => current.filter((item) => item.id !== toast.id))} className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><X className="size-4" /></button>
          </div>;
        })}
      </div>
    </ToastContext.Provider>
  );
}
