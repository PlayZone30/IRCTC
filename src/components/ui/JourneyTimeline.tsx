import { cx } from '@/lib/cx';

/**
 * JourneyTimeline — PLAN.md §3.4. Horizontal rail with departure/arrival
 * endpoint dots and intermediate stops. Rotates to vertical under 720px
 * via the `flex-col` variant applied by the parent's responsive classes.
 */
export interface TimelineStop {
  stationName: string;
  time?: string;
  transferNote?: string;
}

export function JourneyTimeline({ stops, durationLabel, vertical = false }: { stops: TimelineStop[]; durationLabel: string; vertical?: boolean }) {
  if (vertical) {
    return (
      <ol className="flex flex-col gap-3">
        <li className="text-center text-xs font-medium text-[var(--ink-3)]">{durationLabel}</li>
        {stops.map((stop, i) => (
          <li key={i} className="flex items-center gap-2 text-xs">
            <span className={cx('size-2 shrink-0 rounded-full', i === 0 || i === stops.length - 1 ? 'size-2.5 bg-[var(--primary)]' : 'bg-[var(--ink)]')} aria-hidden />
            <span className="text-[var(--ink-2)]">{stop.stationName}</span>
            {stop.time ? <time className="tnum ml-auto text-[var(--ink)]">{stop.time}</time> : null}
          </li>
        ))}
      </ol>
    );
  }

  return (
    <div className="flex flex-col items-center px-2">
      <span className="tnum mb-1 text-xs font-medium text-[var(--primary-press)]">{durationLabel}</span>
      <div className="relative flex w-full items-center">
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-[var(--hairline)]" aria-hidden />
        <ol className="flex w-full items-center justify-between">
          {stops.map((stop, i) => {
            const isEndpoint = i === 0 || i === stops.length - 1;
            return (
              <li key={i} className="relative flex flex-col items-center gap-1">
                <span
                  className={cx('rounded-full', isEndpoint ? 'size-2.5 bg-[var(--primary)]' : 'size-1.5 bg-[var(--ink)]')}
                  aria-hidden
                />
                {stop.time ? <time className="tnum absolute -top-5 text-[13px] font-medium text-[var(--ink)] whitespace-nowrap">{stop.time}</time> : null}
                {stop.transferNote ? (
                  <span className="absolute top-4 w-max max-w-[110px] rounded-[var(--r-field)] bg-[var(--surface-2)] px-2 py-1 text-center text-[10px] text-[var(--ink-3)]">
                    {stop.transferNote}
                  </span>
                ) : null}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
