import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import React, {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
} from "react";

type ToastVariant = "success" | "error" | "info";

type ToastInput = {
  title: string;
  description?: string;
  variant?: ToastVariant;
  durationMs?: number;
};

type ToastItem = ToastInput & {
  id: string;
  variant: ToastVariant;
};

type ToastContextValue = {
  notify: (input: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function getVariantStyles(variant: ToastVariant): string {
  switch (variant) {
    case "success":
      return "border-emerald-200 bg-emerald-50 text-emerald-900";
    case "error":
      return "border-rose-200 bg-rose-50 text-rose-900";
    default:
      return "border-slate-200 bg-slate-50 text-slate-900";
  }
}

function VariantIcon({ variant }: { variant: ToastVariant }) {
  if (variant === "success") {
    return <CheckCircle2 size={16} className="mt-0.5 shrink-0" />;
  }

  if (variant === "error") {
    return <AlertCircle size={16} className="mt-0.5 shrink-0" />;
  }

  return <Info size={16} className="mt-0.5 shrink-0" />;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback(
    ({
      title,
      description,
      variant = "info",
      durationMs = 4000,
    }: ToastInput) => {
      const id = crypto.randomUUID();

      setToasts((current) => [
        ...current,
        {
          id,
          title,
          description,
          variant,
          durationMs,
        },
      ]);

      window.setTimeout(() => {
        removeToast(id);
      }, durationMs);
    },
    [removeToast],
  );

  const value = useMemo<ToastContextValue>(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="pointer-events-none fixed right-4 top-4 z-80 flex w-[min(28rem,calc(100vw-2rem))] flex-col gap-2">
        {toasts.map((toast) => (
          <article
            key={toast.id}
            className={`pointer-events-auto rounded-xl border px-3 py-2 shadow-sm backdrop-blur ${getVariantStyles(toast.variant)}`}
          >
            <div className="flex items-start gap-2">
              <VariantIcon variant={toast.variant} />

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-5">{toast.title}</p>
                {toast.description ? (
                  <p className="text-xs leading-5 opacity-90">
                    {toast.description}
                  </p>
                ) : null}
              </div>

              <button
                type="button"
                aria-label="Dismiss notification"
                className="rounded p-0.5 opacity-70 transition hover:opacity-100"
                onClick={() => {
                  removeToast(toast.id);
                }}
              >
                <X size={14} />
              </button>
            </div>
          </article>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return context;
}
