import type { ReactNode } from 'react';
import { cx } from '@/lib/cx';

/**
 * EmptyState — PLAN.md §3.4. "Used wherever data is absent — no blank
 * regions anywhere."
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx('flex flex-col items-center gap-3 rounded-[var(--r-card)] bg-[var(--surface)] px-6 py-12 text-center', className)}>
      <div className="flex size-12 items-center justify-center rounded-full bg-[var(--surface-2)] text-[var(--ink-3)]">{icon}</div>
      <h3 className="text-base font-bold text-[var(--ink)]">{title}</h3>
      {description ? <p className="max-w-sm text-sm text-[var(--ink-2)]">{description}</p> : null}
      {action}
    </div>
  );
}
