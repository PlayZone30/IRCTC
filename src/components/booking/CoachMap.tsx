import { cx } from '@/lib/cx';
import { BERTH_GEOMETRY, LOWER_BERTH_QUOTA_PER_COACH, berthTypeFor } from '@/domain/allocator';
import type { BerthType, ClassCode } from '@/domain/types';

/**
 * CoachMap — PLAN.md §7.6. The annotated coach grid used for the free
 * berth override on Review. Each berth is labelled with number + type,
 * occupied/quota-held berths are visibly unavailable, and berths carry
 * plain-language annotations (near toilet, side berth, quota-held) —
 * the layer nobody else provides. Keyboard-navigable as a grid.
 */
const TYPE_LABEL: Record<BerthType, string> = {
  LB: 'Lower',
  MB: 'Middle',
  UB: 'Upper',
  SL: 'Side lower',
  SM: 'Side middle',
  SU: 'Side upper',
  WS: 'Window',
  M: 'Middle',
  A: 'Aisle',
};

/** A short annotation for why a berth is more or less desirable (§7.6). */
function annotate(classCode: ClassCode, berthNumber: number, type: BerthType, quotaHeld: boolean): string | null {
  if (quotaHeld) return 'Held — senior citizen quota';
  const geo = BERTH_GEOMETRY[classCode];
  if (!geo) return null;
  const posInBay = (berthNumber - 1) % geo.cycle.length;
  // The first bay (berths 1-8) sits next to the coach door/toilet.
  if (berthNumber <= 2) return 'Near door and toilet';
  if (type === 'SL' || type === 'SU' || type === 'SM') return 'Side berth — shorter';
  if (posInBay === 0) return 'Near the aisle';
  return null;
}

export function CoachMap({
  classCode,
  coachId,
  occupied,
  selectedBerth,
  onSelect,
}: {
  classCode: ClassCode;
  coachId: string;
  occupied: Set<number>;
  selectedBerth?: number;
  onSelect: (berth: number) => void;
}) {
  const geo = BERTH_GEOMETRY[classCode];
  if (!geo) {
    return (
      <p className="text-sm text-[var(--ink-2)]">
        First AC berths are assigned when the chart is prepared, so families stay together and coupés are allocated appropriately.
        There is no berth to choose now.
      </p>
    );
  }

  const quotaLowerCount = LOWER_BERTH_QUOTA_PER_COACH[classCode] ?? 0;
  const lowerBerths = Array.from({ length: geo.capacity }, (_, i) => i + 1).filter((n) => berthTypeFor(classCode, n) === 'LB');
  const quotaLowers = new Set(lowerBerths.slice(0, quotaLowerCount));

  return (
    <div>
      <p className="mb-3 text-sm text-[var(--ink-2)]">
        Coach {coachId}. Green berths are free — tap one to move there, at no charge. Grey berths are taken or held for a quota.
      </p>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6" role="grid" aria-label={`Berths in coach ${coachId}`}>
        {Array.from({ length: geo.capacity }, (_, i) => i + 1).map((n) => {
          const type = berthTypeFor(classCode, n)!;
          const quotaHeld = quotaLowers.has(n);
          const isOccupied = occupied.has(n) || quotaHeld;
          const isSelected = selectedBerth === n;
          const note = annotate(classCode, n, type, quotaHeld);
          return (
            <button
              key={n}
              type="button"
              role="gridcell"
              aria-label={`Berth ${n}, ${TYPE_LABEL[type]}${note ? `, ${note}` : ''}${isOccupied ? ', unavailable' : ', free'}`}
              aria-pressed={isSelected}
              disabled={isOccupied}
              onClick={() => onSelect(n)}
              className={cx(
                'flex flex-col items-start gap-0.5 rounded-[var(--r-field)] border-2 p-2 text-left transition-colors duration-150',
                isSelected && 'border-[var(--primary)] bg-[var(--primary-weak)]',
                !isSelected && !isOccupied && 'border-[var(--cnf)] bg-[var(--cnf-weak)] hover:border-[var(--primary)]',
                isOccupied && 'cursor-not-allowed border-transparent bg-[var(--surface-2)] opacity-60',
              )}
            >
              <span className="tnum text-sm font-bold text-[var(--ink)]">{n}</span>
              <span className="text-[10px] text-[var(--ink-2)]">{TYPE_LABEL[type]}</span>
              {note ? <span className="text-[9px] leading-tight text-[var(--ink-3)]">{note}</span> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
