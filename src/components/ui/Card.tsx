import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '@/lib/cx';

/** Card — PLAN.md §3.4. White, --r-card, --shadow-2, 20px padding. */
export function Card({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx('rounded-[var(--r-card)] bg-[var(--surface)] p-5 shadow-[var(--shadow-2)]', className)}
      {...rest}
    >
      {children}
    </div>
  );
}

/** CardHeader — sits on --surface-2 with a bottom hairline for a titled band. */
export function CardHeader({
  title,
  meta,
  className,
  children,
}: {
  title: ReactNode;
  meta?: ReactNode;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cx(
        'flex flex-wrap items-center justify-between gap-3 rounded-t-[var(--r-card)] border-b border-[var(--hairline)] bg-[var(--surface-2)] px-5 py-3.5',
        className,
      )}
    >
      <div className="text-[17px] font-bold text-[var(--ink)]">{title}</div>
      {meta}
      {children}
    </div>
  );
}
