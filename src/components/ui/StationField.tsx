import { useId, useRef, useState } from 'react';
import { MapPin, X } from 'lucide-react';
import { cx } from '@/lib/cx';
import type { Station } from '@/domain/types';

/**
 * StationField — PLAN.md §3.4.
 * Two-line display: station name, then CODE · City. Never truncates
 * mid-word (fixes IRCTC's "HYDERABAD DECAN - HYB (S" truncation, §2.5).
 * A live region announces the resolved selection — the SNCF Connect
 * pattern cited in the competitive research, §3.6.
 */
export function StationField({
  label,
  value,
  onSelect,
  stations,
  recentCodes = [],
  placeholder,
}: {
  label: string;
  value: Station | null;
  onSelect: (station: Station) => void;
  stations: Station[];
  recentCodes?: string[];
  placeholder?: string;
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const q = query.trim().toLowerCase();
  const matches = q
    ? stations
        .filter(
          (s) =>
            s.name.toLowerCase().includes(q) ||
            s.code.toLowerCase().includes(q) ||
            s.city.toLowerCase().includes(q) ||
            s.aliases.some((a) => a.toLowerCase().includes(q)),
        )
        .slice(0, 8)
    : stations.filter((s) => recentCodes.includes(s.code)).slice(0, 5);

  function handleSelect(station: Station) {
    onSelect(station);
    setQuery('');
    setOpen(false);
    setAnnouncement(`${station.name} selected as ${label.toLowerCase()} station.`);
  }

  return (
    <div className="relative flex-1">
      <label className="mb-1 block text-xs font-medium text-[var(--ink-2)]">{label}</label>
      {value && !open ? (
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            requestAnimationFrame(() => inputRef.current?.focus());
          }}
          className="flex w-full items-center gap-2 rounded-[var(--r-field)] px-1 py-1 text-left hover:bg-[var(--surface-2)]"
        >
          <MapPin className="size-4 shrink-0 text-[var(--ink-3)]" aria-hidden />
          <span className="min-w-0">
            <span className="block truncate text-[15px] font-medium text-[var(--ink)]">{value.name}</span>
            <span className="tnum block text-xs text-[var(--ink-3)]">
              {value.code} &middot; {value.city}
            </span>
          </span>
        </button>
      ) : (
        <div className="flex items-center gap-2 rounded-[var(--r-field)] border border-[var(--hairline)] px-3 py-2 focus-within:shadow-[var(--focus)]">
          <MapPin className="size-4 shrink-0 text-[var(--ink-3)]" aria-hidden />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete="list"
            value={query}
            placeholder={placeholder ?? 'Station name or code'}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 120)}
            className="min-w-0 flex-1 bg-transparent text-[15px] text-[var(--ink)] outline-none placeholder:text-[var(--ink-3)]"
          />
          {query ? (
            <button type="button" aria-label="Clear" onClick={() => setQuery('')} className="text-[var(--ink-3)]">
              <X className="size-3.5" />
            </button>
          ) : null}
        </div>
      )}

      {open && matches.length > 0 ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-1 w-full max-w-[320px] overflow-hidden rounded-[var(--r-field)] border border-[var(--hairline)] bg-[var(--surface)] shadow-[var(--shadow-2)]"
        >
          {matches.map((s) => (
            <li key={s.code}>
              <button
                type="button"
                role="option"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(s);
                }}
                className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left hover:bg-[var(--surface-2)]"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm text-[var(--ink)]">{highlightMatch(s.name, q)}</span>
                  <span className="tnum block text-xs text-[var(--ink-3)]">
                    {s.code} &middot; {s.city}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {/* Live region: announces the resolved station selection to screen readers. */}
      <div aria-live="polite" className={cx('sr-only')}>
        {announcement}
      </div>
    </div>
  );
}

function highlightMatch(text: string, query: string) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query);
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span className="font-bold text-[var(--primary-press)]">{text.slice(idx, idx + query.length)}</span>
      {text.slice(idx + query.length)}
    </>
  );
}
