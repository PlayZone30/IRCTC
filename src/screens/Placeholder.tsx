import type { ReactNode } from 'react';

/**
 * Temporary stand-in for a screen that hasn't been built yet in this task.
 * Per PLAN.md §0 rule 4: "Never leave a dead end. Every route renders
 * something honest." This is that honesty — never a blank screen, never
 * a crash, and it says plainly that it is a placeholder.
 */
export function Placeholder({ title, note }: { title: string; note?: ReactNode }) {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-16 md:px-6">
      <div className="rounded-[var(--r-card)] border border-[var(--hairline)] bg-white p-10 text-center shadow-[var(--shadow-2)]">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--ink-3)]">
          Under construction
        </p>
        <h1 className="mb-3 text-2xl font-bold text-[var(--ink)]">{title}</h1>
        {note ? <p className="mx-auto max-w-[520px] text-sm text-[var(--ink-2)]">{note}</p> : null}
      </div>
    </div>
  );
}
