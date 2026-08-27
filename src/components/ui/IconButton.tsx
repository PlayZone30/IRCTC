import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from '@/lib/cx';

/**
 * IconButton — PLAN.md §3.4. 36px circle, --surface-2 bg, --ink glyph.
 * aria-label is required (not optional) — §3.6: "all icon-only controls
 * carry aria-label."
 */
interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  'aria-label': string;
  active?: boolean;
}

export function IconButton({ icon, active, className, ...rest }: IconButtonProps) {
  return (
    <button
      type="button"
      className={cx(
        'anim-press inline-flex size-9 items-center justify-center rounded-full transition-colors duration-150',
        active ? 'bg-[var(--primary-weak)] text-[var(--primary)]' : 'bg-[var(--surface-2)] text-[var(--ink)] hover:bg-[var(--hairline)]',
        className,
      )}
      {...rest}
    >
      {icon}
    </button>
  );
}
