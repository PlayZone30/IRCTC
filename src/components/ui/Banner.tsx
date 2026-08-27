import type { ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';
import { cx } from '@/lib/cx';

/**
 * Banner — PLAN.md §3.4. Inline notice, left accent stripe.
 * "Never used as a blocking modal" — this is the direct fix for
 * IRCTC's blocking date-mismatch confirmation dialog (§2.5).
 */
export type BannerVariant = 'info' | 'warn' | 'danger' | 'success';

const variantConfig: Record<BannerVariant, { icon: typeof Info; classes: string; iconClass: string }> = {
  info: { icon: Info, classes: 'bg-[var(--primary-weak)] border-[var(--primary)]', iconClass: 'text-[var(--primary-press)]' },
  warn: { icon: AlertTriangle, classes: 'bg-[var(--rac-weak)] border-[var(--rac)]', iconClass: 'text-[var(--rac)]' },
  danger: { icon: XCircle, classes: 'bg-[var(--wl-weak)] border-[var(--wl)]', iconClass: 'text-[var(--wl)]' },
  success: { icon: CheckCircle2, classes: 'bg-[var(--cnf-weak)] border-[var(--cnf)]', iconClass: 'text-[var(--cnf)]' },
};

export function Banner({
  variant = 'info',
  children,
  className,
}: {
  variant?: BannerVariant;
  children: ReactNode;
  className?: string;
}) {
  const { icon: Icon, classes, iconClass } = variantConfig[variant];
  return (
    <div
      role={variant === 'danger' || variant === 'warn' ? 'alert' : 'status'}
      className={cx('flex items-start gap-3 rounded-[var(--r-field)] border-l-[3px] px-4 py-3 text-sm text-[var(--ink)]', classes, className)}
    >
      <Icon className={cx('mt-0.5 size-4 shrink-0', iconClass)} aria-hidden />
      <div className="leading-relaxed">{children}</div>
    </div>
  );
}
