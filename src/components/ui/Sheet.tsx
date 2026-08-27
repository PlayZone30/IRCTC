import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cx } from '@/lib/cx';
import { IconButton } from './IconButton';

/**
 * Sheet — PLAN.md §3.4. Bottom sheet on mobile, right drawer >=900px.
 * Focus trapped, Escape closes, focus returns to trigger — §3.6.
 */
export type SheetSide = 'bottom' | 'right';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  side?: SheetSide; // 'right' variant used for the agent drawer (>=900px), else bottom sheet
  widthClassName?: string;
}

function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
    ),
  );
}

export function Sheet({ open, onClose, title, children, side = 'bottom', widthClassName }: SheetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const container = containerRef.current;
    // Focus the sheet itself first so screen readers announce entry,
    // then move to the first focusable control.
    container?.focus();
    const focusable = container ? getFocusable(container) : [];
    focusable[0]?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !container) return;
      const items = getFocusable(container);
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocused.current?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  const isRight = side === 'right';

  return (
    <div className="fixed inset-0 z-50 flex" role="presentation">
      <div
        className="anim-fade-in absolute inset-0 bg-[rgba(24,29,42,0.4)]"
        onClick={onClose}
        aria-hidden
      />
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : 'Panel'}
        tabIndex={-1}
        className={cx(
          'relative flex flex-col bg-[var(--surface)] shadow-[var(--shadow-3)] outline-none',
          isRight
            ? cx(
                // Mobile: full-height bottom sheet. >=900px (custom bp below): right drawer.
                'mt-auto h-[90vh] w-full rounded-t-[var(--r-sheet)]',
                'min-[900px]:mt-0 min-[900px]:ml-auto min-[900px]:h-full min-[900px]:rounded-t-none min-[900px]:rounded-l-[var(--r-sheet)]',
                widthClassName ?? 'min-[900px]:max-w-[420px]',
              )
            : 'mt-auto max-h-[90vh] w-full rounded-t-[var(--r-sheet)]',
        )}
      >
        <div className="flex items-center justify-between border-b border-[var(--hairline)] px-5 py-4">
          <div className="text-base font-bold text-[var(--ink)]">{title}</div>
          <IconButton icon={<X className="size-4" />} aria-label="Close" onClick={onClose} />
        </div>
        <div className="overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}
