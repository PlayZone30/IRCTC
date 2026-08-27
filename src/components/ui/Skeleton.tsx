import { cx } from '@/lib/cx';

/**
 * Skeleton — PLAN.md §3.4. "Availability cells skeleton-load rather
 * than requiring a Refresh click" — this is the visible fix for
 * IRCTC's per-class Refresh button (§2.5, §7.1).
 */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cx('skeleton rounded-[var(--r-field)]', className)} aria-hidden />;
}
