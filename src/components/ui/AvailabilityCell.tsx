import { cx } from '@/lib/cx';
import { formatRupees } from '@/lib/money';
import { describeStatus } from '@/lib/status';
import type { ClassInventory } from '@/domain/types';
import { Chip } from './Chip';

/**
 * AvailabilityCell — PLAN.md §3.4. "The core comparison unit." This is
 * the component that makes feature 1 (all-class availability in one
 * view) real — one cell per class, all rendered at once, no Refresh
 * click (§2.5, §7.1).
 *
 * classLabel is passed in rather than looked up here so this component
 * has no dependency on domain/rules.ts (built in Task 2) — it can be
 * reviewed against static props before the rulebook exists.
 */
export function AvailabilityCell({
  inventory,
  classLabel,
  selected,
  onSelect,
}: {
  inventory: ClassInventory;
  classLabel: string;
  selected?: boolean;
  onSelect?: () => void;
}) {
  const { chipText, variant, consequence } = describeStatus(inventory.status, inventory.classCode);
  const isInteractive = Boolean(onSelect) && inventory.status.kind !== 'REGRET' && inventory.status.kind !== 'NOT_AVAILABLE';

  const content = (
    <>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-bold text-[var(--ink)]">{inventory.classCode}</span>
        <Chip variant={variant}>{chipText}</Chip>
      </div>
      <p className="mt-1 truncate text-xs text-[var(--ink-3)]">{classLabel}</p>
      <p className="tnum mt-2 text-lg font-bold text-[var(--primary-press)]">{formatRupees(inventory.baseFare)}</p>
      <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-[var(--ink-3)]">{consequence}</p>
    </>
  );

  if (!isInteractive) {
    return <div className={cx('rounded-[var(--r-field)] border-2 border-transparent bg-[var(--surface-2)] p-3 opacity-70')}>{content}</div>;
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cx(
        'rounded-[var(--r-field)] border-2 p-3 text-left transition-colors duration-150',
        selected ? 'border-[var(--primary)] bg-[var(--primary-weak)]' : 'border-transparent bg-[var(--surface-2)] hover:bg-[var(--hairline)]',
      )}
    >
      {content}
    </button>
  );
}
