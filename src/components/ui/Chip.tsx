import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '@/lib/cx';

/**
 * Chip — PLAN.md §3.4.
 * Status variants (cnf/rac/wl/regret) must always carry a text label —
 * §3.6: "Status is text + colour, never colour alone."
 */
export type ChipVariant =
  | 'solid-accent'
  | 'solid-primary'
  | 'weak-primary'
  | 'outline'
  | 'cnf'
  | 'rac'
  | 'wl'
  | 'regret';

interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: ChipVariant;
  icon?: ReactNode;
}

const variantClasses: Record<ChipVariant, string> = {
  'solid-accent': 'bg-[var(--accent)] text-white',
  'solid-primary': 'bg-[var(--primary)] text-white',
  'weak-primary': 'bg-[var(--primary-weak)] text-[var(--primary-press)]',
  outline: 'bg-transparent border border-[var(--hairline)] text-[var(--ink-2)]',
  cnf: 'bg-[var(--cnf-weak)] text-[var(--cnf)]',
  rac: 'bg-[var(--rac-weak)] text-[var(--rac)]',
  wl: 'bg-[var(--wl-weak)] text-[var(--wl)]',
  regret: 'bg-[var(--regret-weak)] text-[var(--regret)]',
};

export function Chip({ variant = 'outline', icon, className, children, ...rest }: ChipProps) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 rounded-[var(--r-chip)] px-3 py-1.5 text-xs font-bold tracking-[0.01em] whitespace-nowrap',
        variantClasses[variant],
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
    </span>
  );
}
