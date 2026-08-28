import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CalendarPlus, Printer, Share2, Ticket as TicketIcon, WifiOff } from 'lucide-react';
import { Banner } from '@/components/ui/Banner';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/EmptyState';
import { pushToast } from '@/components/ui/Toast';
import { describeStatus } from '@/lib/status';
import { formatRupees } from '@/lib/money';
import { CLASS_LABELS, firstChartTime, QUOTA_LABELS } from '@/domain/rules';
import { getOrderByPnrTool } from '@/agent/tools';
import { stationByCode } from '@/data/stations';
import { trainByNumber } from '@/data/trains';
import type { BookingStatus } from '@/domain/types';

/**
 * Ticket — PLAN.md §5 S7. The ERS, offline-first. Print-and-screenshot
 * friendly, and honest about the data's age when the network is gone —
 * §7.8's "not better data, honest data" applies here as much as S8.
 */
export function Ticket() {
  const navigate = useNavigate();
  const { pnr } = useParams();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const onOffline = () => setIsOffline(true);
    const onOnline = () => setIsOffline(false);
    window.addEventListener('offline', onOffline);
    window.addEventListener('online', onOnline);
    return () => {
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('online', onOnline);
    };
  }, []);

  const order = pnr ? getOrderByPnrTool(pnr) : undefined;

  if (!order) {
    return (
      <div className="mx-auto max-w-[860px] px-4 py-16 sm:px-6">
        <EmptyState
          icon={<TicketIcon className="size-5" />}
          title="Ticket not found"
          description="This PNR does not exist on this account, or the page has not been viewed online yet to cache it for offline use."
          action={<Button onClick={() => navigate('/pnr')}>Check a PNR</Button>}
        />
      </div>
    );
  }

  const { draft } = order;
  const train = trainByNumber(draft.trainNumber);
  const fromStation = stationByCode(draft.fromStationCode);
  const toStation = stationByCode(draft.toStationCode);
  const boardingStation = stationByCode(draft.boardingStationCode);
  const boardingHalt = train?.halts.find((h) => h.stationCode === draft.boardingStationCode);

  // Representative per-passenger status for the status band — the real
  // per-passenger allotment is on Review/OrderDetail; here we show the
  // class-level outcome, which is what a printed ERS states at the top.
  const classLevelStatus: BookingStatus | undefined =
    order.outcome === 'debit_failed'
      ? undefined
      : draft.classCode === '1A'
        ? { kind: 'CNF_NO_BERTH' }
        : order.outcome === 'partially_confirmed'
          ? { kind: 'WL', type: 'GNWL', number: 1 }
          : { kind: 'CNF', coach: 'A1', berth: 1, berthType: 'LB' };

  const described = classLevelStatus ? describeStatus(classLevelStatus, draft.classCode) : undefined;
  const chartAt = train && boardingHalt?.departure ? firstChartTime(new Date(`${draft.date}T${boardingHalt.departure}:00`)) : undefined;

  // Data age for the offline-cache chip — deterministic from createdAt for the demo.
  const updatedAgoMin = Math.max(1, Math.round((Date.now() - new Date(order.createdAt).getTime()) / 60000) % 90);

  if (!train || !classLevelStatus || !described) {
    return (
      <div className="mx-auto max-w-[860px] px-4 py-16 sm:px-6">
        <EmptyState
          icon={<TicketIcon className="size-5" />}
          title="No ticket to show"
          description="This order did not result in an issued ticket. Open the order for its full status."
          action={<Button onClick={() => navigate(`/orders/${order.id}`)}>Open order</Button>}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[860px] px-4 py-6 sm:px-6 print:py-0">
      {isOffline ? (
        <Banner variant="info" className="mb-4 print:hidden">
          You are offline. This ticket was saved earlier and may not reflect the latest chart or cancellation status.
        </Banner>
      ) : null}

      <Card className="print:border-0 print:shadow-none">
        {/* Status band */}
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--hairline)] pb-4">
          <div>
            <p className="tnum text-xs font-bold uppercase tracking-wide text-[var(--ink-3)]">Electronic Reservation Slip</p>
            <h1 className="mt-1 text-xl font-bold text-[var(--ink)]">
              {train.name} <span className="tnum text-[var(--ink-3)]">({train.number})</span>
            </h1>
            <p className="tnum text-sm text-[var(--ink-2)]">PNR {order.pnr}</p>
          </div>
          <div className="text-right">
            <Chip variant={described.variant}>{described.chipText}</Chip>
            {classLevelStatus.kind === 'WL' ? (
              <p className="mt-1 max-w-[220px] text-xs text-[var(--ink-2)]">
                {described.consequence} {chartAt ? `Chart: ${formatDateTime(chartAt)}.` : ''}
              </p>
            ) : null}
          </div>
        </div>

        {/* Offline cache chip — always present, states data age */}
        <div className="mt-3 flex flex-wrap items-center gap-2 print:hidden">
          <Chip variant="outline" icon={<WifiOff className="size-3" aria-hidden />}>
            Saved for offline &middot; updated {updatedAgoMin} min ago
          </Chip>
        </div>

        {/* Journey + boarding details */}
        <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Field label="From" value={fromStation?.name ?? draft.fromStationCode} />
          <Field label="To" value={toStation?.name ?? draft.toStationCode} />
          <Field label="Boarding point" value={boardingStation?.name ?? draft.boardingStationCode} />
          <Field label="Boarding date & time" value={`${draft.date}${boardingHalt?.departure ? `, ${boardingHalt.departure}` : ''}`} />
          <Field label="Class" value={CLASS_LABELS[draft.classCode]} />
          <Field label="Quota" value={QUOTA_LABELS[draft.quota]} />
        </dl>

        {/* Passengers */}
        <div className="mt-5">
          <h2 className="mb-2 text-sm font-bold text-[var(--ink)]">Passengers</h2>
          <div className="overflow-hidden rounded-[var(--r-field)] border border-[var(--hairline)]">
            {draft.passengers.map((p, i) => (
              <div
                key={p.id}
                className={cxBorder(i)}
              >
                <span className="text-sm font-medium text-[var(--ink)]">
                  {i + 1}. {p.name} <span className="tnum text-[var(--ink-3)]">({p.age}{p.gender})</span>
                </span>
                <span className="text-sm text-[var(--ink-2)]">
                  {classLevelStatus.kind === 'CNF' ? `${classLevelStatus.coach} / ${classLevelStatus.berth}` : described.chipText}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Fare + QR placeholder */}
        <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--ink-3)]">Total fare</p>
            <p className="tnum text-lg font-bold text-[var(--primary-press)]">{formatRupees(order.amountPaise)}</p>
          </div>
          <div
            aria-label="QR code placeholder — not a scannable code in this prototype"
            className="grid size-20 shrink-0 grid-cols-4 grid-rows-4 gap-0.5 rounded-[var(--r-field)] border border-[var(--hairline)] p-2"
          >
            {Array.from({ length: 16 }).map((_, i) => (
              <span key={i} className={i % 3 === 0 ? 'bg-[var(--ink)]' : 'bg-transparent'} />
            ))}
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="mt-4 flex flex-wrap gap-2 print:hidden">
        <Button variant="ghost" icon={<CalendarPlus className="size-4" />} onClick={() => pushToast('Added to your calendar.', 'success')}>
          Add to calendar
        </Button>
        <Button
          variant="ghost"
          icon={<Share2 className="size-4" />}
          onClick={() => pushToast('Share link copied.', 'info')}
        >
          Share
        </Button>
        <Button variant="ghost" icon={<Printer className="size-4" />} onClick={() => window.print()}>
          Print
        </Button>
        <Button variant="ghost" onClick={() => navigate(`/journey/${order.pnr}`)}>
          Open journey view
        </Button>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-wide text-[var(--ink-3)]">{label}</dt>
      <dd className="tnum mt-0.5 text-sm font-medium text-[var(--ink)]">{value}</dd>
    </div>
  );
}

function cxBorder(i: number): string {
  return i > 0 ? 'flex items-center justify-between gap-3 border-t border-[var(--hairline)] px-3 py-2.5' : 'flex items-center justify-between gap-3 px-3 py-2.5';
}

function formatDateTime(d: Date): string {
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}
