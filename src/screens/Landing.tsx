import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bus,
  Camera,
  Clock,
  Hotel,
  Mountain,
  Plane,
  Sailboat,
  Ticket,
  TrainFront,
  Utensils,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { SearchBar } from '@/components/ui/SearchBar';
import { Sheet } from '@/components/ui/Sheet';
import { pushToast } from '@/components/ui/Toast';
import { stations, stationByCode } from '@/data/stations';
import { CLASS_OPTIONS, QUOTA_OPTIONS } from '@/domain/rules';
import { useBookingStore } from '@/store/booking';
import { useSessionStore, useCurrentAccount } from '@/store/session';

/**
 * Landing — PLAN.md §5 S1. Gets a citizen into a search in under five
 * seconds, and lets a judge sign in in one click (the brief's hard
 * requirement — §1 Guardrails).
 */
type BookingTab = 'book' | 'pnr' | 'charts';

const SERVICES = [
  { key: 'flights', label: 'Flights', icon: Plane },
  { key: 'hotels', label: 'Hotels', icon: Hotel },
  { key: 'buses', label: 'Buses', icon: Bus },
  { key: 'ecatering', label: 'E-catering', icon: Utensils },
  { key: 'tours', label: 'Tour packages', icon: Sailboat },
  { key: 'tourist-trains', label: 'Tourist trains', icon: TrainFront },
  { key: 'hill-railways', label: 'Hill railways', icon: Mountain },
  { key: 'charter', label: 'Charter', icon: Ticket },
  { key: 'rail-drishti', label: 'Rail Drishti', icon: Camera },
  { key: 'gallery', label: 'Gallery', icon: Camera },
] as const;

export function Landing() {
  const navigate = useNavigate();
  const account = useCurrentAccount();
  const signIn = useSessionStore((s) => s.signIn);
  const { search, setSearch, swapStations } = useBookingStore();
  const [tab, setTab] = useState<BookingTab>('book');
  const [outOfScopeService, setOutOfScopeService] = useState<string | null>(null);

  const from = search.fromCode ? (stationByCode(search.fromCode) ?? null) : null;
  const to = search.toCode ? (stationByCode(search.toCode) ?? null) : null;

  function handleSearch() {
    if (!from || !to) {
      pushToast('Choose a From and To station to search trains.', 'danger');
      return;
    }
    if (from.code === to.code) {
      pushToast('From and To cannot be the same station.', 'danger');
      return;
    }
    navigate('/search');
  }

  return (
    <div>
      {/* Demo access bar — PLAN.md §S1.2. Must never be hidden behind a link. */}
      <div className="mx-auto max-w-[1200px] px-4 pt-5 sm:px-6">
        <div className="flex flex-col gap-3 rounded-[var(--r-card)] bg-[var(--primary-weak)] p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-[var(--primary-press)]">
            Demo build — pick an account to explore.
            {account ? <span className="ml-2 font-bold text-[var(--ink)]">Signed in as {account.name}.</span> : null}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" onClick={() => signIn('priya')}>
              Priya (Aadhaar verified)
            </Button>
            <Button variant="ghost" onClick={() => signIn('ramesh')}>
              Ramesh (senior citizen)
            </Button>
            <Button variant="ghost" onClick={() => signIn('guest')}>
              Guest (not verified)
            </Button>
          </div>
        </div>
      </div>

      {/* Hero + booking card — PLAN.md §S1.3-4 */}
      <div className="mx-auto grid max-w-[1200px] gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(460px,1.1fr)] lg:items-center">
        <div className="order-2 lg:order-1">
          <Card className="p-5 sm:p-6">
            {/* Segmented control — Book ticket / PNR status / Charts, IRCTC parity but a proper segmented control */}
            <div className="mb-5 inline-flex rounded-[var(--r-chip)] bg-[var(--surface-2)] p-1">
              <SegmentButton active={tab === 'book'} onClick={() => setTab('book')}>
                Book ticket
              </SegmentButton>
              <SegmentButton active={tab === 'pnr'} onClick={() => setTab('pnr')}>
                PNR status
              </SegmentButton>
              <SegmentButton active={tab === 'charts'} onClick={() => setTab('charts')}>
                Charts / vacancy
              </SegmentButton>
            </div>

            {tab === 'book' ? (
              <div className="flex flex-col gap-4">
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
                  onSearch={handleSearch}
                />

                <div className="flex flex-wrap gap-4 text-sm text-[var(--ink-2)]">
                  <Checkbox
                    checked={search.flexibleWithDate}
                    onChange={(v) => setSearch({ flexibleWithDate: v })}
                    label="Flexible with date"
                  />
                  <Checkbox
                    checked={search.personWithDisabilityConcession}
                    onChange={(v) => setSearch({ personWithDisabilityConcession: v })}
                    label="Person with disability concession"
                  />
                  <Checkbox
                    checked={search.railwayPassConcession}
                    onChange={(v) => setSearch({ railwayPassConcession: v })}
                    label="Railway pass concession"
                  />
                </div>

                <p className="text-sm text-[var(--ink-2)]">
                  Or ask Sarathi —{' '}
                  <Button variant="quiet" onClick={() => pushToast('Sarathi will open here once the agent drawer is built (Task 9).', 'info')}>
                    <em className="not-italic">"book Kollam to Chennai on 12 September"</em>
                  </Button>
                </p>
              </div>
            ) : null}

            {tab === 'pnr' ? (
              <div className="flex flex-col gap-3">
                <label className="text-xs font-medium text-[var(--ink-2)]" htmlFor="pnr-input">
                  10-digit PNR number
                </label>
                <input
                  id="pnr-input"
                  type="text"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="e.g. 4728166390"
                  className="tnum w-full rounded-[var(--r-field)] border border-[var(--hairline)] px-3 py-2.5 text-[15px] outline-none focus:shadow-[var(--focus)]"
                />
                <Button variant="accent" onClick={() => navigate('/pnr')}>
                  Check status
                </Button>
              </div>
            ) : null}

            {tab === 'charts' ? (
              <div className="flex flex-col gap-3">
                <p className="text-sm text-[var(--ink-2)]">
                  Enter a train number, journey date and boarding station to see coach-wise vacancy after charting.
                </p>
                <Button variant="accent" onClick={() => navigate('/charts')}>
                  Open charts / vacancy
                </Button>
              </div>
            ) : null}
          </Card>

          {/* Ready-to-book strip — PLAN.md §S1.5, shown only for accounts with an armed draft */}
          {account?.id === 'priya' ? (
            <div className="mt-4 flex items-center justify-between gap-3 rounded-[var(--r-field)] border border-[var(--hairline)] bg-[var(--surface)] px-4 py-3">
              <p className="flex items-center gap-2 text-sm text-[var(--ink)]">
                <Clock className="size-4 shrink-0 text-[var(--primary)]" aria-hidden />
                Tatkal for 12624 opens tomorrow 11:00 — you are verified and ready.
              </p>
              <Button variant="ghost" onClick={() => navigate('/ready')}>
                Open
              </Button>
            </div>
          ) : null}
        </div>

        <div className="order-1 hidden overflow-hidden rounded-[var(--r-card)] bg-[var(--surface-2)] sm:block lg:order-2">
          <div className="flex aspect-[4/3] items-center justify-center lg:aspect-auto lg:h-[520px]">
            <Chip variant="outline" className="bg-[var(--surface)]">
              Indian Railways
            </Chip>
          </div>
        </div>
      </div>

      {/* Services row — PLAN.md §S1.6. Understated, below the booking task; the fix for feature sprawl. */}
      <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {SERVICES.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setOutOfScopeService(label)}
              className="flex shrink-0 items-center gap-2 rounded-[var(--r-chip)] border border-[var(--hairline)] px-3.5 py-2 text-sm text-[var(--ink-2)] hover:bg-[var(--surface-2)]"
            >
              <Icon className="size-3.5" aria-hidden />
              {label}
            </button>
          ))}
        </div>
      </div>

      <Sheet open={outOfScopeService !== null} onClose={() => setOutOfScopeService(null)} title={outOfScopeService ?? ''}>
        <p className="text-sm leading-relaxed text-[var(--ink-2)]">
          {outOfScopeService} is part of the wider IRCTC ecosystem, but it is out of scope for this proof of concept — the build
          focuses on rail booking, payment visibility, and the Sarathi agent. On the real IRCTC site this service lives alongside
          train booking; here it is shown for context only, not implemented.
        </p>
      </Sheet>
    </div>
  );
}

function SegmentButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-[var(--r-chip)] px-3.5 py-2 text-sm font-medium transition-colors duration-150 ${
        active ? 'bg-[var(--surface)] text-[var(--ink)] shadow-[var(--shadow-1)]' : 'text-[var(--ink-3)] hover:text-[var(--ink-2)]'
      }`}
    >
      {children}
    </button>
  );
}

function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-2 text-sm text-[var(--ink-2)]">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 rounded border-[var(--hairline)] text-[var(--primary)] focus-visible:shadow-[var(--focus)]"
      />
      {label}
    </label>
  );
}

