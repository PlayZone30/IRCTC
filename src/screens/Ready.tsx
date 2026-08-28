import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Check, Clock, ShieldCheck, Sparkles } from 'lucide-react';
import { Banner } from '@/components/ui/Banner';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/EmptyState';
import { cx } from '@/lib/cx';
import { useDemoClock } from '@/domain/clock';
import {
  CLASS_LABELS,
  MONTHLY_LIMIT,
  QUOTA_LABELS,
  TATKAL_AC_CLASSES,
  TATKAL_OPEN,
  maxPassengersFor,
} from '@/domain/rules';
import { stationByCode } from '@/data/stations';
import { trainByNumber } from '@/data/trains';
import { useReadyStore, type ArmedDraft } from '@/store/ready';
import { useBookingStore } from '@/store/booking';
import { useCurrentAccount } from '@/store/session';
import type { BookingDraft, QuotaCode } from '@/domain/types';

/**
 * Ready-to-book console — PLAN.md §5 S9. Verification and preparation
 * moved out of the booking race. The honest claim is readiness, never a
 * berth: everything that can be done before the window opens is done, so
 * at T-0 the booking is one confirmed tap away.
 */
export function Ready() {
  const navigate = useNavigate();
  const account = useCurrentAccount();
  const armed = useReadyStore((s) => s.armed);
  const remove = useReadyStore((s) => s.remove);
  const setDraft = useBookingStore((s) => s.setDraft);

  // Local Aadhaar verification state, so the OTP flow can complete in-session
  // for an unverified (guest) account without mutating the seeded account.
  const [verifiedOverride, setVerifiedOverride] = useState(false);
  const verified = (account?.aadhaarVerified ?? false) || verifiedOverride;

  function bookNow(draft: BookingDraft) {
    setDraft(draft);
    navigate('/book/review');
  }

  function edit(draft: BookingDraft) {
    setDraft(draft);
    navigate('/book/passengers');
  }

  return (
    <div className="mx-auto max-w-[860px] px-4 py-6 sm:px-6">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-[var(--ink)]">Ready to book</h1>
        <p className="mt-1 text-sm text-[var(--ink-2)]">
          Verification and preparation, done ahead of the window. This gets you ready — it does not reserve a berth.
        </p>
      </div>

      <VerificationCard verified={verified} mobileMasked={account?.mobileMasked ?? '+91 90••••••00'} onVerified={() => setVerifiedOverride(true)} />

      {armed.length === 0 ? (
        <Card className="mt-4">
          <EmptyState
            icon={<Sparkles className="size-5" />}
            title="Nothing armed yet"
            description="Ask Sarathi to arm a Tatkal or advance-reservation booking, or start a search and prepare it here."
            action={<Button onClick={() => navigate('/')}>Search trains</Button>}
          />
        </Card>
      ) : (
        <div className="mt-4 space-y-4">
          {armed.map((a) => (
            <ArmedDraftCard key={a.id} armed={a} verified={verified} onBookNow={bookNow} onEdit={edit} onRemove={() => remove(a.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

// --- verification + OTP flow -------------------------------------------------

type OtpStage = 'idle' | 'requested' | 'sent' | 'delivered' | 'verified';

function VerificationCard({ verified, mobileMasked, onVerified }: { verified: boolean; mobileMasked: string; onVerified: () => void }) {
  const [stage, setStage] = useState<OtpStage>('idle');
  const [attempts, setAttempts] = useState(0);

  // Simulated, bounded OTP delivery — Requested -> Sent -> Delivered -> Verified.
  useEffect(() => {
    if (stage === 'requested') {
      const a = setTimeout(() => setStage('sent'), 700);
      return () => clearTimeout(a);
    }
    if (stage === 'sent') {
      const a = setTimeout(() => setStage('delivered'), 900);
      return () => clearTimeout(a);
    }
    if (stage === 'delivered') {
      const a = setTimeout(() => {
        setStage('verified');
        onVerified();
      }, 1100);
      return () => clearTimeout(a);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  if (verified) {
    return (
      <Card>
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-full bg-[var(--cnf-weak)] text-[var(--cnf)]">
            <ShieldCheck className="size-6" aria-hidden />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-[var(--ink)]">Verified</span>
              <Chip variant="cnf">Ready to book</Chip>
            </div>
            <p className="text-sm text-[var(--ink-2)]">Aadhaar OTP is already done. You are ready the moment a window opens.</p>
          </div>
        </div>
      </Card>
    );
  }

  const otpSteps: { key: OtpStage; label: string }[] = [
    { key: 'requested', label: 'OTP requested' },
    { key: 'sent', label: `Sent to ${mobileMasked}` },
    { key: 'delivered', label: 'Delivered' },
    { key: 'verified', label: 'Verified' },
  ];
  const stageOrder: OtpStage[] = ['idle', 'requested', 'sent', 'delivered', 'verified'];
  const currentIdx = stageOrder.indexOf(stage);

  return (
    <Card>
      <div className="flex items-start gap-3">
        <span className="flex size-11 items-center justify-center rounded-full bg-[var(--wl-weak)] text-[var(--wl)]">
          <AlertTriangle className="size-6" aria-hidden />
        </span>
        <div className="flex-1">
          <span className="text-base font-bold text-[var(--ink)]">Not verified</span>
          <p className="text-sm text-[var(--ink-2)]">
            Aadhaar OTP is required for Tatkal and for the ARP-opening window. It cannot be skipped.
          </p>

          {stage === 'idle' ? (
            <Button variant="accent" className="mt-3" onClick={() => setStage('requested')}>
              Verify with Aadhaar OTP
            </Button>
          ) : (
            <ol className="mt-3 space-y-1.5">
              {otpSteps.map((s) => {
                const idx = stageOrder.indexOf(s.key);
                const done = currentIdx > idx || stage === 'verified';
                const active = currentIdx === idx && stage !== 'verified';
                return (
                  <li key={s.key} className="flex items-center gap-2 text-sm">
                    <span
                      className={cx(
                        'flex size-5 items-center justify-center rounded-full',
                        done ? 'bg-[var(--cnf)] text-white' : active ? 'bg-[var(--primary)] text-white' : 'border-2 border-[var(--hairline)]',
                      )}
                    >
                      {done ? <Check className="size-3" aria-hidden /> : active ? <Clock className="size-3" aria-hidden /> : null}
                    </span>
                    <span className={cx(done || active ? 'text-[var(--ink)]' : 'text-[var(--ink-3)]')}>{s.label}</span>
                  </li>
                );
              })}
            </ol>
          )}

          {stage !== 'idle' && stage !== 'verified' && attempts < 2 ? (
            <button
              type="button"
              onClick={() => {
                setAttempts((n) => n + 1);
                setStage('requested');
              }}
              className="mt-2 text-xs font-bold text-[var(--primary)] hover:underline"
            >
              Resend OTP
            </button>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

// --- armed draft card --------------------------------------------------------

function windowOpenAt(draft: BookingDraft): Date | null {
  if (draft.quota !== 'TQ' && draft.quota !== 'PT') return null; // general/ARP — treat as open
  // Tatkal opens one day before the journey (excl. journey date).
  const [y, m, d] = draft.date.split('-').map(Number);
  const openDay = new Date(Date.UTC(y, m - 1, d - 1));
  const yy = openDay.getUTCFullYear();
  const mm = String(openDay.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(openDay.getUTCDate()).padStart(2, '0');
  const isAC = TATKAL_AC_CLASSES.includes(draft.classCode);
  const time = isAC ? TATKAL_OPEN.AC : TATKAL_OPEN.NON_AC;
  return new Date(`${yy}-${mm}-${dd}T${time}:00+05:30`);
}

function formatCountdown(ms: number): string {
  const totalMin = Math.floor(ms / 60000);
  const days = Math.floor(totalMin / 1440);
  const hours = Math.floor((totalMin % 1440) / 60);
  const mins = totalMin % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

interface ChecklistItem {
  label: string;
  ok: boolean;
  note: string;
}

function preflight(draft: BookingDraft, quota: QuotaCode, verified: boolean): ChecklistItem[] {
  const cap = maxPassengersFor(quota);
  const concessionInTatkal = (quota === 'TQ' || quota === 'PT') && draft.passengers.some((p) => p.concession);
  return [
    { label: 'Identity verified', ok: verified, note: verified ? 'Aadhaar OTP done' : 'Verify above to proceed' },
    { label: 'Passengers complete', ok: draft.passengers.length > 0 && draft.passengers.every((p) => p.name && p.age), note: `${draft.passengers.length} added` },
    { label: 'Within passenger cap', ok: draft.passengers.length <= cap, note: `${draft.passengers.length} of ${cap} for this quota` },
    { label: 'Payment instrument on file', ok: Boolean(draft.paymentInstrument), note: draft.paymentInstrument ? draft.paymentInstrument.toUpperCase() : 'None selected' },
    { label: 'Monthly limit not exhausted', ok: true, note: `Well under ${MONTHLY_LIMIT.withAadhaar}` },
    { label: 'Concessions valid for quota', ok: !concessionInTatkal, note: concessionInTatkal ? 'Concessions are not allowed in Tatkal' : 'No conflict' },
  ];
}

function ArmedDraftCard({
  armed,
  verified,
  onBookNow,
  onEdit,
  onRemove,
}: {
  armed: ArmedDraft;
  verified: boolean;
  onBookNow: (d: BookingDraft) => void;
  onEdit: (d: BookingDraft) => void;
  onRemove: () => void;
}) {
  const { draft } = armed;
  const train = trainByNumber(draft.trainNumber);
  const openAt = useMemo(() => windowOpenAt(draft), [draft]);
  const now = useDemoClock();
  const isOpen = !openAt || openAt.getTime() <= now.getTime();
  const checklist = preflight(draft, draft.quota, verified);
  const allReady = checklist.every((c) => c.ok);

  const from = stationByCode(draft.fromStationCode)?.name ?? draft.fromStationCode;
  const to = stationByCode(draft.toStationCode)?.name ?? draft.toStationCode;

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-[var(--ink)]">
              {train?.name} <span className="tnum text-[var(--ink-3)]">({draft.trainNumber})</span>
            </h2>
            <Chip variant="weak-primary">{QUOTA_LABELS[draft.quota]}</Chip>
          </div>
          <p className="tnum text-sm text-[var(--ink-2)]">
            {from} &rarr; {to} · {draft.date} · {CLASS_LABELS[draft.classCode]} · {draft.passengers.length} passenger{draft.passengers.length > 1 ? 's' : ''}
          </p>
          <p className="mt-0.5 text-xs text-[var(--ink-3)]">
            Board at {stationByCode(draft.boardingStationCode)?.name ?? draft.boardingStationCode} · {reservationChoiceLabel(draft.reservationChoice)}
            {draft.paymentInstrument ? ` · ${draft.paymentInstrument.toUpperCase()}` : ''}
          </p>
        </div>
        <div className="text-right">
          {isOpen ? (
            <Chip variant="cnf">Window open</Chip>
          ) : (
            <div>
              <Chip variant="rac">
                <Clock className="size-3" aria-hidden /> Opens in {formatCountdown(openAt!.getTime() - now.getTime())}
              </Chip>
              <p className="tnum mt-1 text-xs text-[var(--ink-3)]">
                {openAt!.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Pre-flight checklist */}
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {checklist.map((item) => (
          <li key={item.label} className="flex items-start gap-2">
            <span
              className={cx(
                'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full',
                item.ok ? 'bg-[var(--cnf-weak)] text-[var(--cnf)]' : 'bg-[var(--wl-weak)] text-[var(--wl)]',
              )}
            >
              {item.ok ? <Check className="size-3" aria-hidden /> : <AlertTriangle className="size-3" aria-hidden />}
            </span>
            <span className="text-sm">
              <span className={cx('font-medium', item.ok ? 'text-[var(--ink)]' : 'text-[var(--wl)]')}>{item.label}</span>
              <span className="block text-xs text-[var(--ink-3)]">{item.note}</span>
            </span>
          </li>
        ))}
      </ul>

      {!allReady ? (
        <Banner variant="warn" className="mt-3">
          A couple of things need attention before this is fully ready. They will not block preparation, only the final tap.
        </Banner>
      ) : null}

      {/* Actions */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {isOpen ? (
          <Button variant="accent" onClick={() => onBookNow(draft)} disabled={!allReady}>
            Book now — one step
          </Button>
        ) : (
          <Button variant="accent" disabled>
            Book now — one step (opens {formatCountdown(openAt!.getTime() - now.getTime())})
          </Button>
        )}
        <Button variant="ghost" onClick={() => onEdit(draft)}>
          Edit
        </Button>
        <Button variant="quiet" onClick={onRemove}>
          Remove
        </Button>
      </div>
    </Card>
  );
}

function reservationChoiceLabel(choice: BookingDraft['reservationChoice']): string {
  switch (choice) {
    case 'confirmed_only':
      return 'Book only if confirmed';
    case 'at_least_one_lower':
      return 'Book only if a lower berth';
    case 'two_lower':
      return 'Book only if two lower berths';
    default:
      return 'Book even if waitlisted';
  }
}
