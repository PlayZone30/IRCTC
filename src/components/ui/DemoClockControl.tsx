import { Pause, Play, RotateCcw, Clock } from 'lucide-react';
import { resetDemoClock, startDemoClock, stopDemoClock, useDemoClock, useDemoClockRunning } from '@/domain/clock';
import { IconButton } from './IconButton';

/**
 * Demo clock control — PLAN.md §7.8. "A single setInterval clock...
 * drives a compressed demo timeline so charting can be observed rather
 * than described. One demo second = one real hour, toggleable." This
 * is a real feature of the build, not a dev-only hook — it is how a
 * judge watches a waitlisted PNR clear at charting without waiting for
 * an actual chart time to arrive.
 *
 * Floating, bottom-left (Sarathi's launcher owns bottom-right).
 */
export function DemoClockControl() {
  const now = useDemoClock();
  const running = useDemoClockRunning();

  const label = now.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="fixed bottom-4 left-4 z-40 flex items-center gap-1.5 rounded-full border border-[var(--hairline)] bg-[var(--surface)] py-1.5 pr-1.5 pl-3 text-xs shadow-[var(--shadow-2)]">
      <Clock className="size-3.5 text-[var(--ink-3)]" aria-hidden />
      <span className="tnum font-bold text-[var(--ink-2)]" aria-live="polite">
        Demo clock &middot; {label}
      </span>
      <IconButton
        icon={running ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
        aria-label={running ? 'Pause demo clock' : 'Run demo clock (1 simulated hour per second)'}
        onClick={() => (running ? stopDemoClock() : startDemoClock())}
      />
      <IconButton icon={<RotateCcw className="size-3.5" />} aria-label="Reset demo clock" onClick={resetDemoClock} />
    </div>
  );
}
