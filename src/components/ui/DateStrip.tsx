import { cx } from '@/lib/cx';
import { Chip, type ChipVariant } from './Chip';

/**
 * DateStrip — PLAN.md §3.4. Horizontally scrollable seven-day
 * availability row. On S2 (Results) this shows the best status across
 * all classes per date — promoted from inside an IRCTC train card to
 * the top of the page (§S2.B), where it belongs.
 */
export interface DateStripItem {
  iso: string; // "2026-08-27"
  weekday: string; // "Thu"
  dayMonth: string; // "27 Aug"
  chipText: string;
  chipVariant: ChipVariant;
}

export function DateStrip({
  items,
  selectedIso,
  onSelect,
}: {
  items: DateStripItem[];
  selectedIso: string;
  onSelect: (iso: string) => void;
}) {
  return (
    <div
      role="listbox"
      aria-label="Select journey date"
      className="flex gap-2 overflow-x-auto pb-1"
      onKeyDown={(e) => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        const idx = items.findIndex((i) => i.iso === selectedIso);
        const next = e.key === 'ArrowRight' ? Math.min(idx + 1, items.length - 1) : Math.max(idx - 1, 0);
        onSelect(items[next].iso);
      }}
    >
      {items.map((item) => {
        const selected = item.iso === selectedIso;
        return (
          <button
            key={item.iso}
            type="button"
            role="option"
            aria-selected={selected}
            onClick={() => onSelect(item.iso)}
            className={cx(
              'flex min-w-[92px] flex-col items-center gap-1.5 rounded-[var(--r-field)] border-2 px-3 py-2.5 transition-colors duration-150',
              selected ? 'border-[var(--primary)] bg-[var(--primary-weak)]' : 'border-transparent bg-[var(--surface-2)] hover:bg-[var(--hairline)]',
            )}
          >
            <span className="text-xs font-medium text-[var(--ink-2)]">
              {item.weekday} <span className="tnum">{item.dayMonth}</span>
            </span>
            <Chip variant={item.chipVariant} className="text-[10px]">
              {item.chipText}
            </Chip>
          </button>
        );
      })}
    </div>
  );
}
