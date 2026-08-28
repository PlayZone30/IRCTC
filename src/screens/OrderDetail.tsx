import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Receipt } from 'lucide-react';
import { Banner } from '@/components/ui/Banner';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/EmptyState';
import { Sheet } from '@/components/ui/Sheet';
import { TimelineVertical } from '@/components/ui/TimelineVertical';
import { pushToast } from '@/components/ui/Toast';
import { formatRupees } from '@/lib/money';
import { buildOrderTimeline, outcomeSummary, refundAmountFor } from '@/domain/payment';
import { CLASS_LABELS, FLAT_CANCELLATION_CHARGE_PAISE, QUOTA_LABELS, WL_AUTOCANCEL } from '@/domain/rules';
import { stationByCode } from '@/data/stations';
import { trainByNumber } from '@/data/trains';
import { useOrdersStore } from '@/store/orders';

/**
 * Order timeline — PLAN.md §5 S6 / §7.7. The headline addition: one
 * order, one truth, no handoff between portal, gateway and bank. Every
 * step carries a reference the user can hold onto, and the failure
 * branch states the money position without ambiguity.
 */
export function OrderDetail() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const getOrder = useOrdersStore((s) => s.getOrder);
  const cancelOrder = useOrdersStore((s) => s.cancelOrder);
  const [grievanceOpen, setGrievanceOpen] = useState(false);

  const order = orderId ? getOrder(orderId) : undefined;

  if (!order) {
    return (
      <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6">
        <EmptyState
          icon={<Receipt className="size-5" />}
          title="Order not found"
          description="This order does not exist or has expired. Your bookings are listed under My bookings."
          action={<Button onClick={() => navigate('/orders')}>Your bookings</Button>}
        />
      </div>
    );
  }

  const train = trainByNumber(order.draft.trainNumber);
  const summary = outcomeSummary(order.outcome);
  // Release / refund expected date, display only — a working day or two out.
  const releaseByIso = new Date(new Date(order.createdAt).getTime() + 2 * 24 * 3600 * 1000).toISOString();
  const steps = buildOrderTimeline({ order, outcome: order.outcome, releaseByIso });

  const fromStation = stationByCode(order.draft.fromStationCode);
  const toStation = stationByCode(order.draft.toStationCode);
  const canCancel = order.outcome === 'issued' || order.outcome === 'partially_confirmed';

  return (
    <div className="mx-auto max-w-[860px] px-4 py-6 sm:px-6">
      {/* Header */}
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="tnum text-xs font-bold uppercase tracking-wide text-[var(--ink-3)]">Order {order.id}</p>
            <h1 className="mt-1 text-xl font-bold text-[var(--ink)]">
              {train?.name} <span className="tnum text-[var(--ink-3)]">({order.draft.trainNumber})</span>
            </h1>
            <p className="tnum text-sm text-[var(--ink-2)]">
              {fromStation?.name} &rarr; {toStation?.name} · {order.draft.date} · {CLASS_LABELS[order.draft.classCode]} ·{' '}
              {QUOTA_LABELS[order.draft.quota]}
            </p>
          </div>
          <div className="text-right">
            <Chip variant={summary.variant}>{summary.label}</Chip>
            {order.pnr ? <p className="tnum mt-2 text-sm font-bold text-[var(--ink)]">PNR {order.pnr}</p> : null}
            <p className="tnum mt-1 text-sm text-[var(--ink-2)]">{formatRupees(order.amountPaise)}</p>
          </div>
        </div>
      </Card>

      {/* The state machine */}
      <Card className="mt-4">
        <h2 className="mb-4 text-base font-bold text-[var(--ink)]">Money and ticket status</h2>
        <TimelineVertical steps={steps} />
      </Card>

      {/* Failure branch call-to-action */}
      {order.outcome === 'debit_failed' ? (
        <Card className="mt-4">
          <Banner variant="danger">
            Your money was held, not taken. Do not book this again until the hold is released — retrying now may place a second
            hold. The reference above ({order.utr}) is your proof.
          </Banner>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="accent" disabled>
              Try booking again (enabled once released)
            </Button>
            <Button variant="ghost" onClick={() => setGrievanceOpen(true)}>
              Raise a query
            </Button>
          </div>
        </Card>
      ) : null}

      {/* Refund breakdown */}
      {order.outcome === 'cancelled_refund' ? (
        <Card className="mt-4">
          <h2 className="mb-3 text-base font-bold text-[var(--ink)]">Refund breakdown</h2>
          <dl className="overflow-hidden rounded-[var(--r-field)] border border-[var(--hairline)]">
            <RefundRow label="Amount paid" value={formatRupees(order.amountPaise)} />
            <RefundRow label={`Clerkage (${formatRupees(WL_AUTOCANCEL.clerkagePaise)})`} value={`- ${formatRupees(WL_AUTOCANCEL.clerkagePaise)}`} border />
            <div className="flex items-center justify-between bg-[var(--surface-2)] px-4 py-3">
              <span className="text-sm font-bold text-[var(--ink)]">Refund to your account</span>
              <span className="tnum text-lg font-bold text-[var(--cnf)]">{formatRupees(refundAmountFor(order))}</span>
            </div>
          </dl>
        </Card>
      ) : null}

      {/* Actions */}
      <Card className="mt-4">
        <h2 className="mb-3 text-base font-bold text-[var(--ink)]">Actions</h2>
        <div className="flex flex-wrap gap-2">
          {order.pnr ? (
            <Button variant="ghost" onClick={() => navigate(`/ticket/${order.pnr}`)}>
              View ticket
            </Button>
          ) : null}
          {order.pnr ? (
            <Button variant="ghost" onClick={() => navigate(`/journey/${order.pnr}`)}>
              Journey view
            </Button>
          ) : null}
          {canCancel ? (
            <Button
              variant="ghost"
              onClick={() => {
                cancelOrder(order.id);
                pushToast('Booking cancelled. Refund initiated.', 'info');
              }}
            >
              Cancel booking
            </Button>
          ) : null}
          <Button variant="ghost" onClick={() => setGrievanceOpen(true)}>
            Raise a query
          </Button>
        </div>
        {canCancel ? (
          <p className="mt-3 text-xs text-[var(--ink-3)]">
            Cancelling now deducts a {formatRupees(FLAT_CANCELLATION_CHARGE_PAISE[order.draft.classCode] ?? 0)} flat charge (more
            than 72 hours before departure). Inside 8 hours, no refund is due.
          </p>
        ) : null}
      </Card>

      <Button variant="quiet" className="mt-4" onClick={() => navigate('/orders')}>
        Back to your bookings
      </Button>

      {/* Transaction-aware grievance (§7.9) — pre-filled from the failed order */}
      <Sheet open={grievanceOpen} onClose={() => setGrievanceOpen(false)} title="Raise a query">
        <p className="mb-3 text-sm text-[var(--ink-2)]">
          This query is pre-filled with your transaction details, so support can act on it without asking you to repeat them.
        </p>
        <dl className="mb-4 overflow-hidden rounded-[var(--r-field)] border border-[var(--hairline)] text-sm">
          <RefundRow label="Order" value={order.id} />
          <RefundRow label="Transaction" value={order.authRef ?? '—'} border />
          <RefundRow label="Bank reference" value={order.utr ?? '—'} border />
          <RefundRow label="Amount" value={formatRupees(order.amountPaise)} border />
          <RefundRow label="Stage" value={summary.label} border />
        </dl>
        <label className="mb-1 block text-xs font-medium text-[var(--ink-2)]" htmlFor="grievance-text">
          What would you like to say?
        </label>
        <textarea
          id="grievance-text"
          rows={3}
          placeholder="Describe the issue in your words."
          className="w-full rounded-[var(--r-field)] border border-[var(--hairline)] p-3 text-sm outline-none focus:shadow-[var(--focus)]"
        />
        <Button
          variant="accent"
          fullWidth
          className="mt-3"
          onClick={() => {
            setGrievanceOpen(false);
            pushToast(`Query raised. Reference GR-${order.id.slice(3)}. Owner: Refunds desk. Expected reply in 24 hours.`, 'success');
          }}
        >
          Submit query
        </Button>
      </Sheet>
    </div>
  );
}

function RefundRow({ label, value, border }: { label: string; value: string; border?: boolean }) {
  return (
    <div className={border ? 'flex items-center justify-between border-t border-[var(--hairline)] px-4 py-2.5' : 'flex items-center justify-between px-4 py-2.5'}>
      <span className="text-[var(--ink-2)]">{label}</span>
      <span className="tnum font-medium text-[var(--ink)]">{value}</span>
    </div>
  );
}
