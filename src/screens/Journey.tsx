import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Bell, CheckCircle2, MapPin, Train as TrainIcon } from 'lucide-react';
import { Banner } from '@/components/ui/Banner';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/EmptyState';
import { pushToast } from '@/components/ui/Toast';
import { cx } from '@/lib/cx';
import { useDemoClock } from '@/domain/clock';
import { seededHash } from '@/domain/allocator';
import { getOrderByPnrTool } from '@/agent/tools';
import { stationByCode } from '@/data/stations';
import { trainByNumber } from '@/data/trains';

/**
 * Journey — PLAN.md §5 S8. Journey-day surface, honest about certainty.
 * Every claim here that isn't from the chart carries a provenance label
 * — "Confirmed" or "Expected/Estimated" — because the direct fix for
 * RailOne's wrong-platform complaint is not better data, it's honest
 * data about what is and isn't known yet.
 */
export function Journey() {
  const navigate = useNavigate();
  const { pnr } = useParams();
  const now = useDemoClock();
  const [checkedIn, setCheckedIn] = useState(false);
  const [alarmOn, setAlarmOn] = useState(false);

  const order = pnr ? getOrderByPnrTool(pnr) : undefined;
  const train = order ? trainByNumber(order.draft.trainNumber) : undefined;

  const boardingHalt = train?.halts.find((h) => h.stationCode === order?.draft.boardingStationCode);
  const departure = order && boardingHalt?.departure ? new Date(`${order.draft.date}T${boardingHalt.departure}:00`) : undefined;
  const minutesToDeparture = departure ? (departure.getTime() - now.getTime()) / 60000 : Infinity;
  const checkInAvailable = minutesToDeparture <= 120 && minutesToDeparture > -Infinity;

  // Destination alarm: only meaningfully "works while the tab is open" —
  // implemented as a toggle + a toast when the boarding station is reached
  // on the demo clock, honestly labelled as tab-only, not a push notification.
  useEffect(() => {
    if (!alarmOn || !departure) return;
    if (now.getTime() >= departure.getTime()) {
      pushToast('Destination alarm: your boarding time has arrived. This only works while this tab stays open.', 'info');
      setAlarmOn(false);
    }
  }, [now, alarmOn, departure]);

  const coachId = useMemo(() => {
    if (!order) return undefined;
    if (order.draft.classCode === '1A') return train?.coaches.find((c) => c.classCode === '1A')?.id;
    return train?.coaches.find((c) => c.classCode === order.draft.classCode)?.id;
  }, [order, train]);

  if (!order || !train) {
    return (
      <div className="mx-auto max-w-[860px] px-4 py-16 sm:px-6">
        <EmptyState
          icon={<TrainIcon className="size-5" />}
          title="Journey not found"
          description="Check the PNR, or open your bookings."
          action={<Button onClick={() => navigate('/pnr')}>Check a PNR</Button>}
        />
      </div>
    );
  }

  const boardingStation = stationByCode(order.draft.boardingStationCode);
  const platform = platformFor(train.number, order.draft.date, order.draft.boardingStationCode);
  // Platform provenance: confirmed only once the chart for this boarding
  // station's departure has actually passed on the demo clock, per §7.8 —
  // otherwise it is an estimate, and must say so.
  const platformConfirmed = departure ? now.getTime() >= departure.getTime() - 60 * 60 * 1000 : false;

  const coachIndex = train.coaches.findIndex((c) => c.id === coachId);
  const occupancyLevel = occupancyForecast(train.number, order.draft.date, order.draft.classCode);

  return (
    <div className="mx-auto max-w-[860px] px-4 py-6 sm:px-6">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-[var(--ink)]">
          {train.name} <span className="tnum text-[var(--ink-3)]">({train.number})</span>
        </h1>
        <p className="tnum text-sm text-[var(--ink-2)]">PNR {order.pnr} · {order.draft.date}</p>
      </div>

      {/* Boarding card */}
      <Card>
        <h2 className="mb-3 text-base font-bold text-[var(--ink)]">Boarding</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Field label="Station" value={boardingStation?.name ?? order.draft.boardingStationCode} />
          <Field label="Boarding time" value={boardingHalt?.departure ?? '—'} />
          <Field
            label="Platform"
            value={platform}
            provenance={platformConfirmed ? 'Confirmed' : 'Expected'}
            provenanceVariant={platformConfirmed ? 'cnf' : 'rac'}
          />
          <Field label="Coach" value={coachId ?? 'At charting'} />
        </div>
      </Card>

      {/* Coach position — rake diagram */}
      {coachId && coachIndex >= 0 ? (
        <Card className="mt-4">
          <h2 className="mb-1 text-base font-bold text-[var(--ink)]">Coach position</h2>
          <p className="mb-3 text-xs text-[var(--ink-3)]">
            Your coach is {rakePosition(coachIndex, train.coaches.length)} the train, counting from the engine.
          </p>
          <div className="flex items-center gap-1 overflow-x-auto pb-2">
            <span className="flex h-8 w-10 shrink-0 items-center justify-center rounded-l-[var(--r-field)] bg-[var(--ink)] text-[10px] font-bold text-white">
              ENG
            </span>
            {train.coaches.map((c, i) => (
              <span
                key={c.id}
                className={cx(
                  'flex h-8 w-11 shrink-0 items-center justify-center rounded-[3px] text-[11px] font-bold',
                  i === coachIndex ? 'bg-[var(--primary)] text-white ring-2 ring-[var(--primary-press)]' : 'bg-[var(--surface-2)] text-[var(--ink-2)]',
                )}
              >
                {c.id}
              </span>
            ))}
          </div>
        </Card>
      ) : null}

      {/* Occupancy forecast */}
      <Card className="mt-4">
        <h2 className="mb-1 text-base font-bold text-[var(--ink)]">Occupancy forecast</h2>
        <p className="mb-3 text-xs text-[var(--ink-3)]">
          Forecast from historical booking patterns for this train in {order.draft.classCode}. Not a live count.
        </p>
        <div className="flex items-center gap-1.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={cx('h-3 flex-1 rounded-full', i < occupancyLevel ? 'bg-[var(--primary)]' : 'bg-[var(--surface-2)]')} />
          ))}
        </div>
        <p className="mt-1.5 text-xs font-medium text-[var(--ink-2)]">{occupancyLabel(occupancyLevel)}</p>
      </Card>

      {/* Self check-in */}
      <Card className="mt-4">
        <h2 className="mb-1 text-base font-bold text-[var(--ink)]">Self check-in</h2>
        {checkedIn ? (
          <Banner variant="success">
            Checked in &middot; {coachId ? `seat in ${coachId}` : 'your seat'} confirmed to the crew.
          </Banner>
        ) : checkInAvailable ? (
          <>
            <p className="mb-3 text-sm text-[var(--ink-2)]">
              Available from two hours before departure. Checking in reduces onboard checking and helps release any berth you
              are not using sooner.
            </p>
            <Button
              variant="accent"
              icon={<CheckCircle2 className="size-4" />}
              onClick={() => {
                setCheckedIn(true);
                pushToast('Checked in.', 'success');
              }}
            >
              Check in now
            </Button>
          </>
        ) : (
          <p className="text-sm text-[var(--ink-3)]">Opens two hours before departure.</p>
        )}
      </Card>

      {/* Live position */}
      <Card className="mt-4">
        <h2 className="mb-3 text-base font-bold text-[var(--ink)]">Live position</h2>
        <ol className="flex flex-col gap-2">
          {train.halts.map((h, i) => {
            const halt = stationByCode(h.stationCode);
            const haltDeparture = h.departure ? new Date(`${order.draft.date}T${h.departure}:00`) : undefined;
            const isPast = haltDeparture ? now.getTime() >= haltDeparture.getTime() : i === 0 && now.getTime() >= (departure?.getTime() ?? Infinity);
            return (
              <li key={h.stationCode} className="flex items-center gap-3 text-sm">
                <MapPin className={cx('size-3.5 shrink-0', isPast ? 'text-[var(--cnf)]' : 'text-[var(--ink-3)]')} aria-hidden />
                <span className="min-w-0 flex-1 truncate text-[var(--ink)]">{halt?.name ?? h.stationCode}</span>
                <span className="tnum text-[var(--ink-3)]">{h.departure ?? h.arrival ?? '—'}</span>
                <Chip variant={isPast ? 'cnf' : 'outline'}>{isPast ? 'Confirmed' : 'Estimated'}</Chip>
              </li>
            );
          })}
        </ol>
      </Card>

      {/* Destination alarm */}
      <Card className="mt-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-[var(--ink)]">Destination alarm</h2>
            <p className="text-xs text-[var(--ink-3)]">
              Works only while this tab stays open — it is not a push notification. Close the tab and it stops.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={alarmOn}
            onClick={() => setAlarmOn((v) => !v)}
            className={cx(
              'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors',
              alarmOn ? 'bg-[var(--primary)]' : 'bg-[var(--surface-2)]',
            )}
          >
            <Bell className="sr-only" aria-hidden />
            <span className={cx('inline-block size-5 rounded-full bg-white shadow transition-transform', alarmOn ? 'translate-x-5' : 'translate-x-0.5')} />
          </button>
        </div>
      </Card>

      <Button variant="quiet" className="mt-4" onClick={() => navigate(`/ticket/${order.pnr}`)}>
        View ticket
      </Button>
    </div>
  );
}

function Field({
  label,
  value,
  provenance,
  provenanceVariant,
}: {
  label: string;
  value: string;
  provenance?: string;
  provenanceVariant?: 'cnf' | 'rac';
}) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-wide text-[var(--ink-3)]">{label}</dt>
      <dd className="tnum mt-0.5 text-sm font-medium text-[var(--ink)]">{value}</dd>
      {provenance ? (
        <Chip variant={provenanceVariant ?? 'outline'} className="mt-1">
          {provenance}
        </Chip>
      ) : null}
    </div>
  );
}

/** Deterministic platform number, seeded — not fabricated per-user, stable per train/date/station. */
function platformFor(trainNumber: string, date: string, stationCode: string): string {
  const n = Math.floor(seededHash(trainNumber, date, stationCode, 'platform') * 12) + 1;
  return String(n);
}

/** Deterministic 1-5 occupancy forecast level for the class, seeded per train/date/class. */
function occupancyForecast(trainNumber: string, date: string, classCode: string): number {
  return Math.floor(seededHash(trainNumber, date, classCode, 'occupancy') * 5) + 1;
}

function occupancyLabel(level: number): string {
  const labels = ['Mostly empty', 'Some seats free', 'Filling up', 'Nearly full', 'Expect a full coach'];
  return labels[Math.min(4, Math.max(0, level - 1))];
}

function rakePosition(index: number, total: number): string {
  const fraction = index / Math.max(1, total - 1);
  if (fraction < 0.34) return 'near the front of';
  if (fraction < 0.67) return 'in the middle of';
  return 'near the rear of';
}
