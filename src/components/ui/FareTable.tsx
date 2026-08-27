import type { ReactNode } from 'react';
import { cx } from '@/lib/cx';
import { formatRupees } from '@/lib/money';

/**
 * FareTable — PLAN.md §3.4. "Line items with tabular right-aligned
 * figures; a --surface-2 total row. Every charge always visible, never
 * revealed late." Direct fix for IRCTC showing the convenience fee only
 * at step 2 (§2.5).
 */
export interface FareLine {
  label: ReactNode;
  amountPaise: number;
  caption?: ReactNode;
}

export function FareTable({ lines, totalLabel, totalPaise }: { lines: FareLine[]; totalLabel: string; totalPaise: number }) {
  return (
    <div className="overflow-hidden rounded-[var(--r-field)] border border-[var(--hairline)]">
      <dl>
        {lines.map((line, i) => (
          <div key={i} className={cx('flex items-baseline justify-between gap-3 px-4 py-2.5', i > 0 && 'border-t border-[var(--hairline)]')}>
            <div>
              <dt className="text-sm text-[var(--ink-2)]">{line.label}</dt>
              {line.caption ? <dd className="mt-0.5 text-xs text-[var(--ink-3)]">{line.caption}</dd> : null}
            </div>
            <dd className="tnum shrink-0 text-sm font-medium text-[var(--ink)]">{formatRupees(line.amountPaise)}</dd>
          </div>
        ))}
      </dl>
      <div className="flex items-center justify-between bg-[var(--surface-2)] px-4 py-3">
        <span className="text-sm font-bold text-[var(--ink)]">{totalLabel}</span>
        <span className="tnum text-lg font-bold text-[var(--primary-press)]">{formatRupees(totalPaise)}</span>
      </div>
    </div>
  );
}
