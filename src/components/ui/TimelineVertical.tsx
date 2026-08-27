import type { ReactNode } from 'react';
import { Check, Clock, X } from 'lucide-react';
import { cx } from '@/lib/cx';
import type { OrderTimelineStep } from '@/domain/types';

/**
 * TimelineVertical — PLAN.md §3.4. The money/ticket state machine.
 * Dot states: done (--cnf), active (--primary, pulsing), pending
 * (hollow --hairline), failed (--wl). This is the P0 fix for "where is
 * my money" (§7.7, S6) — every step carries a reference the user can
 * hold onto.
 */
export function TimelineVertical({ steps }: { steps: OrderTimelineStep[] }) {
  return (
    <ol className="relative">
      {steps.map((step, i) => (
        <li key={step.key} className="relative flex gap-4 pb-6 last:pb-0">
          {i < steps.length - 1 ? (
            <span
              className={cx(
                'absolute top-6 left-[11px] w-px',
                step.state === 'done' ? 'bg-[var(--cnf)]' : 'bg-[var(--hairline)]',
              )}
              style={{ height: 'calc(100% - 8px)' }}
              aria-hidden
            />
          ) : null}
          <Dot state={step.state} />
          <div className="flex-1 pt-0.5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className={cx('text-sm font-bold', step.state === 'pending' ? 'text-[var(--ink-3)]' : 'text-[var(--ink)]')}>
                {step.label}
              </p>
              {step.timestamp ? (
                <time className="tnum text-xs text-[var(--ink-3)]" dateTime={step.timestamp}>
                  {new Date(step.timestamp).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </time>
              ) : null}
            </div>
            {step.detail ? <p className="mt-1 text-sm leading-relaxed text-[var(--ink-2)]">{step.detail}</p> : null}
            {step.reference ? (
              <p className="tnum mt-1 text-xs text-[var(--ink-3)]">
                Ref <span className="font-medium text-[var(--ink-2)]">{step.reference}</span>
              </p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

function Dot({ state }: { state: OrderTimelineStep['state'] }): ReactNode {
  const base = 'relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full';
  if (state === 'done') {
    return (
      <div className={cx(base, 'bg-[var(--cnf)] text-white')}>
        <Check className="size-3.5" aria-hidden />
      </div>
    );
  }
  if (state === 'active') {
    return (
      <div className={cx(base, 'bg-[var(--primary)] text-white')}>
        <span className="absolute inset-0 animate-ping rounded-full bg-[var(--primary)] opacity-40" aria-hidden />
        <Clock className="relative size-3.5" aria-hidden />
      </div>
    );
  }
  if (state === 'failed') {
    return (
      <div className={cx(base, 'bg-[var(--wl)] text-white')}>
        <X className="size-3.5" aria-hidden />
      </div>
    );
  }
  return <div className={cx(base, 'border-2 border-[var(--hairline)] bg-[var(--surface)]')} />;
}
