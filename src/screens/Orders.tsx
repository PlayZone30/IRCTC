/**
 * Orders list — PLAN.md §5 S10a, §6 feature 2.
 * Groups bookings for the current account: Upcoming / Awaiting chart /
 * Past / Cancelled. Money state is always visible in the list card —
 * the citizen should never have to drill into a detail to know what
 * happened to their money.
 */
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Receipt, Train } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatRupees } from '@/lib/money';
import { CLASS_LABELS } from '@/domain/rules';
import { outcomeSummary } from '@/domain/payment';
import { stationByCode } from '@/data/stations';
import { trainByNumber } from '@/data/trains';
import { useOrdersStore } from '@/store/orders';
import { useSessionStore } from '@/store/session';
import type { Order } from '@/domain/types';

/** Payment-state to Chip variant + label — visible in the list card. */
function moneyState(order: Order): { label: string; variant: 'cnf' | 'rac' | 'wl' | 'outline' } {
  switch (order.paymentState) {
    case 'captured':
      return { label: 'Paid', variant: 'cnf' };
    case 'held':
    case 'authorised':
      return { label: 'Hold placed', variant: 'outline' };
    case 'release_pending':
    case 'released':
      return { label: 'Hold releasing', variant: 'wl' };
    case 'refund_initiated':
      return { label: 'Refund in progress', variant: 'rac' };
    case 'refund_credited':
      return { label: 'Refunded', variant: 'cnf' };
    case 'failed':
      return { label: 'Payment failed', variant: 'wl' };
    default:
      return { label: order.paymentState, variant: 'outline' };
  }
}

/** True if any passenger is WL or RAC — used to classify into "awaiting chart" group. */
function hasUnresolvedStatus(order: Order): boolean {
  return order.outcome === 'partially_confirmed';
}

/** Group orders into the four display sections. */
function groupOrders(orders: Order[], today: Date) {
  const upcoming: Order[] = [];
  const awaitingChart: Order[] = [];
  const past: Order[] = [];
  const cancelled: Order[] = [];

  for (const o of orders) {
    if (o.outcome === 'cancelled_refund' || o.outcome === 'debit_failed') {
      cancelled.push(o);
      continue;
    }
    const jd = new Date(o.draft.date + 'T00:00:00');
    if (jd > today) {
      if (hasUnresolvedStatus(o)) {
        awaitingChart.push(o);
      } else {
        upcoming.push(o);
      }
    } else {
      if (hasUnresolvedStatus(o)) {
        awaitingChart.push(o);
      } else {
        past.push(o);
      }
    }
  }
  return { upcoming, awaitingChart, past, cancelled };
}

export function Orders() {
  const navigate = useNavigate();
  const accountId = useSessionStore((s) => s.accountId);
  const ordersForAccount = useOrdersStore((s) => s.ordersForAccount);
  const orders = ordersForAccount(accountId);
  const today = new Date();
  const { upcoming, awaitingChart, past, cancelled } = groupOrders(orders, today);

  if (orders.length === 0) {
    return (
      <div className="mx-auto max-w-[860px] px-4 py-16 sm:px-6">
        <EmptyState
          icon={<Receipt className="size-5" />}
          title="No bookings yet"
          description="Start by searching for a train. Your orders will appear here."
          action={<Button onClick={() => navigate('/')}>Search trains</Button>}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[860px] px-4 py-6 sm:px-6">
      <h1 className="mb-5 text-2xl font-bold text-[var(--ink)]">Your bookings</h1>

      {awaitingChart.length > 0 && (
        <Section title="Awaiting chart" accent="rac">
          {awaitingChart.map((o) => (
            <OrderCard key={o.id} order={o} onNavigate={navigate} />
          ))}
        </Section>
      )}

      {upcoming.length > 0 && (
        <Section title="Upcoming">
          {upcoming.map((o) => (
            <OrderCard key={o.id} order={o} onNavigate={navigate} />
          ))}
        </Section>
      )}

      {past.length > 0 && (
        <Section title="Past journeys">
          {past.map((o) => (
            <OrderCard key={o.id} order={o} onNavigate={navigate} />
          ))}
        </Section>
      )}

      {cancelled.length > 0 && (
        <Section title="Cancelled">
          {cancelled.map((o) => (
            <OrderCard key={o.id} order={o} onNavigate={navigate} />
          ))}
        </Section>
      )}
    </div>
  );
}

function Section({
  title,
  accent,
  children,
}: {
  title: string;
  accent?: 'rac';
  children: React.ReactNode;
}) {
  return (
    <section className="mb-6">
      <h2
        className={`mb-3 text-xs font-bold uppercase tracking-widest ${accent === 'rac' ? 'text-[var(--rac)]' : 'text-[var(--ink-3)]'}`}
      >
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function OrderCard({ order, onNavigate }: { order: Order; onNavigate: ReturnType<typeof useNavigate> }) {
  const train = trainByNumber(order.draft.trainNumber);
  const from = stationByCode(order.draft.fromStationCode);
  const to = stationByCode(order.draft.toStationCode);
  const summary = outcomeSummary(order.outcome);
  const money = moneyState(order);
  const passengerCount = order.draft.passengers.length;
  const passengerNames = order.draft.passengers.map((p) => p.name.split(' ')[0]).join(', ');

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        {/* Left: train + route info */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Train className="size-4 shrink-0 text-[var(--ink-3)]" aria-hidden="true" />
            <span className="text-sm font-bold text-[var(--ink)]">{train?.name ?? order.draft.trainNumber}</span>
            <span className="tnum text-xs text-[var(--ink-3)]">({order.draft.trainNumber})</span>
          </div>
          <p className="tnum mt-1 text-sm text-[var(--ink-2)]">
            {from?.name ?? order.draft.fromStationCode} → {to?.name ?? order.draft.toStationCode}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[var(--ink-3)]">
            <CalendarDays className="size-3.5" aria-hidden="true" />
            <span className="tnum">{order.draft.date}</span>
            <span>·</span>
            <span>{CLASS_LABELS[order.draft.classCode]}</span>
            <span>·</span>
            <span>
              {passengerCount} passenger{passengerCount !== 1 ? 's' : ''} — {passengerNames}
            </span>
          </div>
          {order.pnr && (
            <p className="tnum mt-1 text-xs text-[var(--ink-3)]">PNR {order.pnr}</p>
          )}
        </div>

        {/* Right: status + amount — money state always visible (§5 S10a) */}
        <div className="flex flex-col items-end gap-1.5">
          <Chip variant={summary.variant}>{summary.label}</Chip>
          <Chip variant={money.variant}>{money.label}</Chip>
          <span className="tnum mt-1 text-sm font-bold text-[var(--ink)]">{formatRupees(order.amountPaise)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-3 flex flex-wrap gap-2 border-t border-[var(--hairline)] pt-3">
        <Button variant="ghost" onClick={() => onNavigate(`/orders/${order.id}`)}>
          View details
        </Button>
        {order.pnr && (
          <Button variant="ghost" onClick={() => onNavigate(`/ticket/${order.pnr}`)}>
            View ticket
          </Button>
        )}
        {(order.outcome === 'debit_failed' || order.outcome === 'cancelled_refund') && (
          <Button variant="ghost" onClick={() => onNavigate(`/orders/${order.id}`)}>
            Raise a query
          </Button>
        )}
      </div>
    </Card>
  );
}
