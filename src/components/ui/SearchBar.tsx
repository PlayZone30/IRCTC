import { ArrowLeftRight, Calendar, Search } from 'lucide-react';
import type { Station } from '@/domain/types';
import { StationField } from './StationField';
import { IconButton } from './IconButton';
import { Button } from './Button';

/**
 * SearchBar — PLAN.md §3.4. "One white card, internal fields divided
 * by 1px hairline verticals. Swap is a 40px circular --ink button
 * centred on the divider. Trailing 56px --ink rounded-square search
 * button." Stacks vertically on mobile.
 */
export function SearchBar({
  stations,
  from,
  to,
  onFromChange,
  onToChange,
  onSwap,
  date,
  onDateChange,
  classValue,
  quotaValue,
  onSearch,
  classOptions,
  quotaOptions,
  onClassChange,
  onQuotaChange,
}: {
  stations: Station[];
  from: Station | null;
  to: Station | null;
  onFromChange: (s: Station) => void;
  onToChange: (s: Station) => void;
  onSwap: () => void;
  date: string;
  onDateChange: (iso: string) => void;
  classValue: string;
  quotaValue: string;
  classOptions: { value: string; label: string }[];
  quotaOptions: { value: string; label: string }[];
  onClassChange: (v: string) => void;
  onQuotaChange: (v: string) => void;
  onSearch: () => void;
}) {
  return (
    <div className="rounded-[var(--r-card)] bg-[var(--surface)] p-4 shadow-[var(--shadow-2)] sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:divide-x sm:divide-[var(--hairline)]">
        <div className="relative flex flex-1 items-end gap-2 sm:pr-4">
          <StationField label="From" value={from} onSelect={onFromChange} stations={stations} />
          <IconButton
            icon={<ArrowLeftRight className="size-4" />}
            aria-label="Swap origin and destination"
            onClick={onSwap}
            className="mb-1 shrink-0 bg-[var(--ink)] text-white hover:bg-[var(--ink-press)]"
          />
        </div>
        <div className="flex-1 sm:px-4">
          <StationField label="To" value={to} onSelect={onToChange} stations={stations} />
        </div>
        <div className="flex-1 sm:px-4">
          <label className="mb-1 block text-xs font-medium text-[var(--ink-2)]" htmlFor="journey-date">
            Journey date
          </label>
          <div className="flex items-center gap-2 rounded-[var(--r-field)] border border-[var(--hairline)] px-3 py-2 focus-within:shadow-[var(--focus)]">
            <Calendar className="size-4 shrink-0 text-[var(--ink-3)]" aria-hidden />
            <input
              id="journey-date"
              type="date"
              value={date}
              onChange={(e) => onDateChange(e.target.value)}
              className="tnum w-full bg-transparent text-[15px] text-[var(--ink)] outline-none"
            />
          </div>
        </div>
        <div className="flex-1 sm:px-4">
          <label className="mb-1 block text-xs font-medium text-[var(--ink-2)]" htmlFor="journey-class">
            Class
          </label>
          <select
            id="journey-class"
            value={classValue}
            onChange={(e) => onClassChange(e.target.value)}
            className="w-full rounded-[var(--r-field)] border border-[var(--hairline)] bg-[var(--surface)] px-3 py-2 text-[15px] text-[var(--ink)] outline-none focus:shadow-[var(--focus)]"
          >
            {classOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 sm:px-4">
          <label className="mb-1 block text-xs font-medium text-[var(--ink-2)]" htmlFor="journey-quota">
            Quota
          </label>
          <select
            id="journey-quota"
            value={quotaValue}
            onChange={(e) => onQuotaChange(e.target.value)}
            className="w-full rounded-[var(--r-field)] border border-[var(--hairline)] bg-[var(--surface)] px-3 py-2 text-[15px] text-[var(--ink)] outline-none focus:shadow-[var(--focus)]"
          >
            {quotaOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:pl-4">
          <Button variant="accent" fullWidth className="sm:w-14 sm:px-0" onClick={onSearch}>
            <Search className="size-5 shrink-0" aria-hidden />
            <span className="sm:sr-only">Search trains</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
