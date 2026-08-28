import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { AvailabilityCell } from '@/components/ui/AvailabilityCell';
import { Banner } from '@/components/ui/Banner';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { DateStrip, type DateStripItem } from '@/components/ui/DateStrip';
import { EmptyState } from '@/components/ui/EmptyState';
import { JourneyTimeline } from '@/components/ui/JourneyTimeline';
import { SearchBar } from '@/components/ui/SearchBar';
import { Sheet } from '@/components/ui/Sheet';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatRupees } from '@/lib/money';
import { describeStatus } from '@/lib/status';
import {
  bestStatusAcrossClasses,
  formatDuration,
  journeyDurationMinutes,
  searchTrains,
  type SearchResult,
} from '@/domain/availability';
import { CLASS_LABELS, CLASS_OPTIONS, QUOTA_OPTIONS } from '@/domain/rules';
import { stationByCode, stations } from '@/data/stations';
import { useBookingStore } from '@/store/booking';
import type { ClassCode } from '@/domain/types';

/**
 * Results — PLAN.md §5 S2. The most important screen in the build:
 * everything the citizen needs to decide, on one surface, with no
 * per-class Refresh click (§7.1, feature 1).
 */
type SortMode = 'departure' | 'duration' | 'fare' | 'confirmation';

function addDaysIso(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function dayMonthLabel(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

function weekdayLabel(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString('en-US', { weekday: 'short' });
}

export function Results() {
  const navigate = useNavigate();
  const { search, setSearch, swapStations, setDraft } = useBookingStore();

  // Allow deep-linking a search, e.g. /search?from=HYB&to=NDLS&date=2026-08-27
  // — harmless outside that use case, and doubles as a way to reach this
  // screen directly for review without re-doing the Landing interaction.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromCode = params.get('from');
    const toCode = params.get('to');
    const date = params.get('date');
    if (fromCode || toCode || date) {
      setSearch({
        ...(fromCode ? { fromCode } : {}),
        ...(toCode ? { toCode } : {}),
        ...(date ? { date } : {}),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>('departure');
  const [selectedClassByTrain, setSelectedClassByTrain] = useState<Record<string, ClassCode>>({});
  const [classFilter, setClassFilter] = useState<Set<ClassCode>>(new Set());

  const from = search.fromCode ? (stationByCode(search.fromCode) ?? null) : null;
  const to = search.toCode ? (stationByCode(search.toCode) ?? null) : null;

  const results = useMemo(() => {
    if (!search.fromCode || !search.toCode) return [];
    return searchTrains({ fromCode: search.fromCode, toCode: search.toCode, date: search.date });
  }, [search.fromCode, search.toCode, search.date]);

  const filteredResults = useMemo(() => {
    if (classFilter.size === 0) return results;
    return results.filter((r) => r.inventories.some((i) => classFilter.has(i.classCode)));
  }, [results, classFilter]);

  const sortedResults = useMemo(() => {
    const copy = [...filteredResults];
    if (sortMode === 'departure') {
      copy.sort((a, b) => {
        const aDep = a.train.halts.find((h) => h.stationCode === search.fromCode)?.departure ?? '';
        const bDep = b.train.halts.find((h) => h.stationCode === search.fromCode)?.departure ?? '';
        return aDep.localeCompare(bDep);
      });
    } else if (sortMode === 'duration' && search.fromCode && search.toCode) {
      copy.sort((a, b) => {
        const aDur = journeyDurationMinutes(a.train, search.fromCode!, search.toCode!) ?? Infinity;
        const bDur = journeyDurationMinutes(b.train, search.fromCode!, search.toCode!) ?? Infinity;
        return aDur - bDur;
      });
    } else if (sortMode === 'fare') {
      copy.sort((a, b) => cheapestFare(a) - cheapestFare(b));
    } else if (sortMode === 'confirmation') {
      copy.sort((a, b) => confirmationRank(a) - confirmationRank(b));
    }
    return copy;
  }, [filteredResults, sortMode, search.fromCode, search.toCode]);

  const dateStripItems: DateStripItem[] = useMemo(() => {
    if (!search.fromCode || !search.toCode) return [];
    return Array.from({ length: 7 }, (_, i) => addDaysIso(search.date, i - 3)).map((iso) => {
      const dayResults = searchTrains({ fromCode: search.fromCode!, toCode: search.toCode!, date: iso });
      const allInventories = dayResults.flatMap((r) => r.inventories);
      const best = bestStatusAcrossClasses(allInventories);
      const described = best ? describeStatus(best.status) : null;
      return {
        iso,
        weekday: weekdayLabel(iso),
        dayMonth: dayMonthLabel(iso),
        chipText: described?.chipText ?? '—',
        chipVariant: described?.variant ?? 'regret',
      };
    });
  }, [search.fromCode, search.toCode, search.date]);

  function handleModifySearch() {
    // The SearchBar in the sticky summary already writes to the store live;
    // nothing extra to do here besides re-running the memoised search, which
    // happens automatically because `results` depends on the store fields.
  }

  if (!from || !to) {
    return (
      <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6">
        <EmptyState
          icon={<SlidersHorizontal className="size-5" />}
          title="Choose a From and To station"
          description="Start a search from the landing page to see trains here."
          action={<Button onClick={() => navigate('/')}>Back to search</Button>}
        />
      </div>
    );
  }

  return (
    <div>
      {/* A. Sticky search summary — PLAN.md §S2.A */}
      <div className="sticky top-16 z-30 border-b border-[var(--hairline)] bg-[var(--surface)] shadow-[var(--shadow-1)]">
        <div className="mx-auto max-w-[1200px] px-4 py-3 sm:px-6">
          <SearchBar
            stations={stations}
            from={from}
            to={to}
            onFromChange={(s) => setSearch({ fromCode: s.code })}
            onToChange={(s) => setSearch({ toCode: s.code })}
            onSwap={swapStations}
            date={search.date}
            onDateChange={(iso) => setSearch({ date: iso })}
            classValue={search.classCode}
            quotaValue={search.quota}
            classOptions={CLASS_OPTIONS}
            quotaOptions={QUOTA_OPTIONS}
            onClassChange={(v) => setSearch({ classCode: v as typeof search.classCode })}
            onQuotaChange={(v) => setSearch({ quota: v as typeof search.quota })}
            onSearch={handleModifySearch}
          />
        </div>
      </div>

      <div className="mx-auto max-w-[1200px] px-4 py-5 sm:px-6">
        {/* B. Date context row */}
        <div className="mb-5 flex items-center gap-2">
          <Button variant="ghost" icon={<ChevronLeft className="size-4" />} onClick={() => setSearch({ date: addDaysIso(search.date, -1) })}>
            <span className="hidden sm:inline">Previous day</span>
          </Button>
          <div className="flex-1 overflow-hidden">
            <DateStrip items={dateStripItems} selectedIso={search.date} onSelect={(iso) => setSearch({ date: iso })} />
          </div>
          <Button variant="ghost" icon={<ChevronRight className="size-4" />} onClick={() => setSearch({ date: addDaysIso(search.date, 1) })}>
            <span className="hidden sm:inline">Next day</span>
          </Button>
        </div>

        <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
          {/* D. Filter rail — desktop */}
          <aside className="hidden lg:block">
            <FilterRail classFilter={classFilter} onClassFilterChange={setClassFilter} />
          </aside>

          <div>
            {/* C. Result header */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold text-[var(--ink)]">
                  {sortedResults.length} {sortedResults.length === 1 ? 'train' : 'trains'} &middot; {from.name} &rarr; {to.name}
                </h1>
                <p className="tnum text-sm text-[var(--ink-2)]">
                  {weekdayLabel(search.date)}, {dayMonthLabel(search.date)} 2026 &middot; {QUOTA_OPTIONS.find((q) => q.value === search.quota)?.label} quota
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" icon={<SlidersHorizontal className="size-4" />} className="lg:hidden" onClick={() => setFilterSheetOpen(true)}>
                  Filters
                </Button>
                <label className="flex items-center gap-2 text-sm text-[var(--ink-2)]">
                  Sort by
                  <select
                    value={sortMode}
                    onChange={(e) => setSortMode(e.target.value as SortMode)}
                    className="rounded-[var(--r-field)] border border-[var(--hairline)] bg-[var(--surface)] px-2.5 py-1.5 text-sm text-[var(--ink)] outline-none focus:shadow-[var(--focus)]"
                  >
                    <option value="departure">Departure</option>
                    <option value="duration">Duration</option>
                    <option value="fare">Fare</option>
                    <option value="confirmation">Best chance of confirmation</option>
                  </select>
                </label>
              </div>
            </div>

            {/* E. Train cards, or empty/degraded states */}
            {sortedResults.length === 0 ? (
              <EmptyState
                icon={<SlidersHorizontal className="size-5" />}
                title="No trains found for this route and date"
                description="Try a nearby station or an adjacent date — use the date strip above or the filters to widen your search."
                action={<Button variant="ghost" onClick={() => setClassFilter(new Set())}>Reset filters</Button>}
              />
            ) : (
              <>
                {allWaitlistedOrWorse(sortedResults) ? (
                  <Banner variant="warn" className="mb-4">
                    Nothing is confirmed on this route today. Alternate boarding stations and nearby trains may still get you there —
                    look for the "Alternatives" note on each train below.
                  </Banner>
                ) : null}
                <div className="flex flex-col gap-4">
                  {sortedResults.map((result) => (
                    <TrainCard
                      key={result.train.number}
                      result={result}
                      fromCode={search.fromCode!}
                      toCode={search.toCode!}
                      selectedClass={selectedClassByTrain[result.train.number]}
                      onSelectClass={(c) => setSelectedClassByTrain((s) => ({ ...s, [result.train.number]: c }))}
                      onBook={(classCode) => {
                        setDraft({
                          trainNumber: result.train.number,
                          date: search.date,
                          classCode,
                          quota: search.quota,
                          fromStationCode: search.fromCode!,
                          toStationCode: search.toCode!,
                          boardingStationCode: search.fromCode!,
                          passengers: [],
                          reservationChoice: 'book_even_if_waitlisted',
                          considerAutoUpgradation: false,
                        });
                        navigate('/book/passengers');
                      }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Filter rail — mobile bottom sheet, PLAN.md §3.4 Sheet + §S2.D */}
      <Sheet open={filterSheetOpen} onClose={() => setFilterSheetOpen(false)} title="Filters">
        <FilterRail classFilter={classFilter} onClassFilterChange={setClassFilter} />
        <Button variant="primary" fullWidth className="mt-4" onClick={() => setFilterSheetOpen(false)}>
          Apply
        </Button>
      </Sheet>
    </div>
  );
}

function cheapestFare(result: SearchResult): number {
  const fares = result.inventories.filter((i) => i.baseFare > 0).map((i) => i.baseFare);
  return fares.length ? Math.min(...fares) : Infinity;
}

const CONFIRMATION_RANK: Record<string, number> = { CNF: 0, CNF_NO_BERTH: 1, RAC: 2, WL: 3, NOT_AVAILABLE: 4, REGRET: 5 };

function confirmationRank(result: SearchResult): number {
  return Math.min(...result.inventories.map((i) => CONFIRMATION_RANK[i.status.kind] ?? 9));
}

function allWaitlistedOrWorse(results: SearchResult[]): boolean {
  return results.every((r) => r.inventories.every((i) => confirmationRankForStatus(i.status.kind) >= 3));
}

function confirmationRankForStatus(kind: string): number {
  return CONFIRMATION_RANK[kind] ?? 9;
}

function TrainCard({
  result,
  fromCode,
  toCode,
  selectedClass,
  onSelectClass,
  onBook,
}: {
  result: SearchResult;
  fromCode: string;
  toCode: string;
  selectedClass: ClassCode | undefined;
  onSelectClass: (c: ClassCode) => void;
  onBook: (c: ClassCode) => void;
}) {
  const { train, inventories } = result;
  const fromHalt = train.halts.find((h) => h.stationCode === fromCode);
  const toHalt = train.halts.find((h) => h.stationCode === toCode);
  const durationMin = journeyDurationMinutes(train, fromCode, toCode);
  const fromStation = stationByCode(fromCode);
  const toStation = stationByCode(toCode);
  const dayDelta = toHalt && fromHalt ? toHalt.day - fromHalt.day : 0;

  const nothingConfirmed = inventories.every((i) => confirmationRankForStatus(i.status.kind) >= 3);
  const selected = selectedClass ? inventories.find((i) => i.classCode === selectedClass) : undefined;

  return (
    <Card className="overflow-hidden p-0">
      <CardHeader
        title={
          <span>
            {train.name} <span className="tnum text-[var(--ink-3)]">({train.number})</span>
          </span>
        }
        meta={
          <div className="flex flex-wrap gap-1">
            {(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const).map((d) => (
              <Chip key={d} variant="outline" className={train.runsOn.includes(d) ? '' : 'opacity-40'}>
                {d[0]}
              </Chip>
            ))}
          </div>
        }
      />
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="tnum text-2xl font-bold text-[var(--ink)]">{fromHalt?.departure}</p>
            <p className="text-sm text-[var(--ink-2)]">{fromStation?.name}</p>
          </div>
          <div className="flex-1">
            <JourneyTimeline
              durationLabel={durationMin ? formatDuration(durationMin) : ''}
              stops={train.halts.map((h) => ({ stationName: stationByCode(h.stationCode)?.name ?? h.stationCode }))}
            />
          </div>
          <div className="flex-1 text-right">
            <p className="tnum text-2xl font-bold text-[var(--ink)]">
              {toHalt?.arrival}
              {dayDelta > 0 ? <span className="ml-1 text-sm font-medium text-[var(--ink-3)]">+{dayDelta}d</span> : null}
            </p>
            <p className="text-sm text-[var(--ink-2)]">{toStation?.name}</p>
          </div>
        </div>

        {/* The centrepiece: every class, all loaded at once. No Refresh click. */}
        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {inventories.map((inv) => (
            <AvailabilityCellWithSkeleton
              key={inv.classCode}
              inventory={inv}
              classLabel={CLASS_LABELS[inv.classCode]}
              selected={selectedClass === inv.classCode}
              onSelect={() => onSelectClass(inv.classCode)}
            />
          ))}
        </div>

        {selected ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[var(--r-field)] bg-[var(--surface-2)] p-4">
            <div>
              <p className="tnum text-lg font-bold text-[var(--primary-press)]">{formatRupees(selected.baseFare)}</p>
              <p className="text-xs text-[var(--ink-3)]">Total for one adult, {CLASS_LABELS[selected.classCode]}</p>
            </div>
            <Button variant="accent" onClick={() => onBook(selected.classCode)}>
              Book
            </Button>
          </div>
        ) : null}

        <p className="mt-4 text-xs text-[var(--ink-3)]">
          Updated {inventories[0]?.updatedAgoSec ?? 0}s ago &middot; Actual running time may differ. Check live status before you leave.
        </p>

        {nothingConfirmed ? (
          <div className="mt-4 rounded-[var(--r-field)] bg-[var(--primary-weak)] p-3 text-sm text-[var(--primary-press)]">
            No confirmed berth on this train. Alternate boarding stations, once available (coming soon), may still get you a
            confirmed seat.
          </div>
        ) : null}
      </div>
    </Card>
  );
}

/**
 * Skeleton-loads each availability cell for 400-900ms before resolving
 * — PLAN.md §7.1: "Cells skeleton-load ... staggered, per train, then
 * resolve. No user action required to see availability." This is the
 * visible proof there is no per-class Refresh click.
 */
function AvailabilityCellWithSkeleton(props: Parameters<typeof AvailabilityCell>[0]) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const delay = 400 + Math.random() * 500;
    const timer = setTimeout(() => setLoaded(true), delay);
    return () => clearTimeout(timer);
  }, []);
  if (!loaded) return <Skeleton className="h-[104px]" />;
  return <AvailabilityCell {...props} />;
}

function FilterRail({
  classFilter,
  onClassFilterChange,
}: {
  classFilter: Set<ClassCode>;
  onClassFilterChange: (s: Set<ClassCode>) => void;
}) {
  function toggle(c: ClassCode) {
    const next = new Set(classFilter);
    if (next.has(c)) next.delete(c);
    else next.add(c);
    onClassFilterChange(next);
  }

  return (
    <div className="rounded-[var(--r-card)] bg-[var(--surface)] p-4 shadow-[var(--shadow-2)]">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-bold text-[var(--ink)]">Filters</h2>
        <Button variant="quiet" onClick={() => onClassFilterChange(new Set())}>
          Reset
        </Button>
      </div>
      <fieldset>
        <legend className="mb-2 text-xs font-bold uppercase text-[var(--ink-3)]">Journey class</legend>
        <div className="flex flex-col gap-2">
          {CLASS_OPTIONS.filter((o) => o.value !== 'ALL').map((o) => (
            <label key={o.value} className="flex items-center gap-2 text-sm text-[var(--ink-2)]">
              <input
                type="checkbox"
                checked={classFilter.has(o.value as ClassCode)}
                onChange={() => toggle(o.value as ClassCode)}
                className="size-4 rounded border-[var(--hairline)] text-[var(--primary)] focus-visible:shadow-[var(--focus)]"
              />
              {o.label}
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
