import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cx } from '@/lib/cx';

/**
 * Button — PLAN.md §3.4.
 * Variants: primary (--ink bg), accent (--primary bg), ghost (outline),
 * quiet (text-only). Min height 44px per the accessibility target size.
 */
export type ButtonVariant = 'primary' | 'accent' | 'ghost' | 'quiet';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-[var(--ink)] text-white hover:bg-[var(--ink-press)]',
  accent: 'bg-[var(--primary)] text-white hover:bg-[var(--primary-press)]',
  ghost: 'bg-transparent text-[var(--ink)] border border-[var(--hairline)] hover:bg-[var(--surface-2)]',
  quiet: 'bg-transparent text-[var(--primary)] hover:underline px-1',
};

export function Button({
  variant = 'primary',
  loading = false,
  fullWidth = false,
  icon,
  disabled,
  className,
  children,
  ...rest
}: ButtonProps) {
  const isQuiet = variant === 'quiet';
  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={cx(
        'anim-press inline-flex items-center justify-center gap-2 rounded-[var(--r-btn)] text-[15px] font-bold transition-colors duration-150',
        isQuiet ? 'min-h-0 py-1' : 'min-h-11 px-5',
        fullWidth && 'w-full',
        variantClasses[variant],
        (disabled || loading) && !isQuiet && 'cursor-not-allowed bg-[var(--surface-2)] text-[var(--ink-3)] hover:bg-[var(--surface-2)]',
        className,
      )}
      {...rest}
    >
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : icon}
      <span className={loading ? 'opacity-80' : undefined}>{children}</span>
    </button>
  );
}
