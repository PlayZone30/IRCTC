import { Check } from 'lucide-react';
import { cx } from '@/lib/cx';

/**
 * Stepper — PLAN.md §3.4. Three numbered nodes matching IRCTC's own
 * wizard labels verbatim (§2.4): Passenger Details, Review Journey,
 * Payment. Preserving IRCTC's own labels here is deliberate familiarity.
 */
const STEPS = ['Passenger Details', 'Review Journey', 'Payment'] as const;

export function Stepper({ current }: { current: 1 | 2 | 3 }) {
  return (
    <ol className="flex items-center justify-center gap-2 py-2" aria-label="Booking progress">
      {STEPS.map((label, index) => {
        const stepNumber = index + 1;
        const state = stepNumber < current ? 'done' : stepNumber === current ? 'current' : 'upcoming';
        return (
          <li key={label} className="flex flex-1 items-center gap-2">
            <div className="flex flex-col items-center gap-1.5">
              <div
                aria-current={state === 'current' ? 'step' : undefined}
                className={cx(
                  'flex size-8 items-center justify-center rounded-full text-sm font-bold',
                  state === 'done' && 'bg-[var(--ink)] text-white',
                  state === 'current' && 'bg-[var(--primary)] text-white',
                  state === 'upcoming' && 'bg-[var(--surface-2)] text-[var(--ink-3)]',
                )}
              >
                {state === 'done' ? <Check className="size-4" aria-hidden /> : stepNumber}
              </div>
              <span
                className={cx(
                  'whitespace-nowrap text-xs font-medium',
                  state === 'upcoming' ? 'text-[var(--ink-3)]' : 'text-[var(--ink)]',
                )}
              >
                {label}
              </span>
            </div>
            {stepNumber < STEPS.length ? (
              <div className={cx('mt-[-18px] h-px flex-1', stepNumber < current ? 'bg-[var(--ink)]' : 'bg-[var(--hairline)]')} />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
