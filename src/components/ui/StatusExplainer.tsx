import { useId, useState } from 'react';
import { ChevronDown, Info } from 'lucide-react';
import { cx } from '@/lib/cx';
import { Chip, type ChipVariant } from './Chip';

/**
 * StatusExplainer — PLAN.md §3.4.
 * "Inline expandable. Trigger is the status code as a chip with a small
 * info glyph; content is the plain-language consequence from §13.2.
 * Never a tooltip only — must work on touch and keyboard."
 */
export function StatusExplainer({
  label,
  variant,
  consequence,
  defaultOpen = false,
}: {
  label: string;
  variant: ChipVariant;
  consequence: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1 rounded-[var(--r-chip)]"
      >
        <Chip variant={variant} icon={<Info className="size-3" aria-hidden />}>
          {label}
        </Chip>
        <ChevronDown className={cx('size-3.5 text-[var(--ink-3)] transition-transform duration-150', open && 'rotate-180')} aria-hidden />
      </button>
      {open ? (
        <p id={panelId} className="anim-fade-in mt-2 max-w-sm text-xs leading-relaxed text-[var(--ink-2)]">
          {consequence}
        </p>
      ) : null}
    </div>
  );
}
