import { useSyncExternalStore } from 'react';
import { CheckCircle2, Info, XCircle } from 'lucide-react';
import { cx } from '@/lib/cx';

/**
 * Toast — PLAN.md §3.4. Bottom-centre, auto-dismiss 5s, aria-live polite,
 * max two stacked.
 */
type ToastVariant = 'info' | 'success' | 'danger';
interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
}

let toasts: ToastItem[] = [];
let nextId = 1;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function pushToast(message: string, variant: ToastVariant = 'info') {
  const id = nextId++;
  toasts = [...toasts, { id, message, variant }].slice(-2); // max two stacked
  emit();
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    emit();
  }, 5000);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return toasts;
}

const variantIcon: Record<ToastVariant, typeof Info> = {
  info: Info,
  success: CheckCircle2,
  danger: XCircle,
};

/** Mount once near the root. Renders the currently active toast stack. */
export function ToastHost() {
  const active = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  if (active.length === 0) return null;
  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex flex-col items-center gap-2"
      aria-live="polite"
      role="status"
    >
      {active.map((toast) => {
        const Icon = variantIcon[toast.variant];
        return (
          <div
            key={toast.id}
            className={cx(
              'anim-fade-in pointer-events-auto flex items-center gap-2 rounded-[var(--r-btn)] bg-[var(--ink)] px-4 py-3 text-sm font-medium text-white shadow-[var(--shadow-3)]',
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            {toast.message}
          </div>
        );
      })}
    </div>
  );
}
