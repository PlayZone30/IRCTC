import { useState } from 'react';
import { ArrowRight, Check, Info, TrainFront } from 'lucide-react';
import { Banner } from '@/components/ui/Banner';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { describeStatus } from '@/lib/status';
import { formatRupees } from '@/lib/money';
import { stationByCode } from '@/data/stations';
import { ALTERNATES_FAIRNESS_NOTE } from '@/domain/alternates';
import type { Itinerary } from '@/domain/types';

/**
 * AlternatesPanel — PLAN.md §7.4 / §S2.F. Renders inside the train card
 * that triggered it (never a separate page). Each alternate forces the
 * user through its disclosure before the Book action is enabled — the
 * failure mode of this feature is user surprise, so consent is at the
 * itinerary level, not a bare checkbox.
 */
const KIND_LABEL: Record<Itinerary['kind'], string> = {
  direct: 'Direct',
  board_earlier: 'Board earlier',
  travel_further: 'Travel further',
  both: 'Both ends shifted',
  two_leg: 'Two legs',
  nearby: 'Nearby station',
  alt_train: 'Alternate train',
};

export function AlternatesPanel({ alternates, onBook }: { alternates: Itinerary[]; onBook: (itinerary: Itinerary) => void }) {
  if (alternates.length === 0) {
    return (
      <div className="rounded-[var(--r-field)] bg-[var(--surface-2)] p-4 text-sm text-[var(--ink-2)]">
        No confirmed alternative was found on this train for your route today. Try a nearby station or an adjacent date using the
        controls above.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {alternates.map((alt, i) => (
        <AlternateOption key={i} itinerary={alt} onBook={() => onBook(alt)} />
      ))}
      <Banner variant="info">{ALTERNATES_FAIRNESS_NOTE}</Banner>
    </div>
  );
}

function AlternateOption({ itinerary, onBook }: { itinerary: Itinerary; onBook: () => void }) {
  const [acknowledged, setAcknowledged] = useState(false);
  const legStatus = itinerary.legs[0]?.status;
  const described = legStatus ? describeStatus(legStatus) : null;

  return (
    <div className="rounded-[var(--r-field)] border border-[var(--hairline)] bg-[var(--surface)] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Chip variant="weak-primary" icon={<TrainFront className="size-3" aria-hidden />}>
            {KIND_LABEL[itinerary.kind]}
          </Chip>
          {described ? <Chip variant={described.variant}>{described.chipText}</Chip> : null}
        </div>
        <span className="tnum text-sm font-bold text-[var(--primary-press)]">{formatRupees(itinerary.fare)}</span>
      </div>

      {/* Route line: ticketed from -> to, with the board station called out */}
      <div className="mt-3 flex items-center gap-2 text-sm text-[var(--ink)]">
        <span className="font-medium">{stationByCode(itinerary.ticketedFrom)?.name ?? itinerary.ticketedFrom}</span>
        <ArrowRight className="size-3.5 text-[var(--ink-3)]" aria-hidden />
        <span className="font-medium">{stationByCode(itinerary.ticketedTo)?.name ?? itinerary.ticketedTo}</span>
        {itinerary.boardAt !== itinerary.ticketedFrom ? (
          <span className="text-xs text-[var(--ink-3)]">· board at {stationByCode(itinerary.boardAt)?.name ?? itinerary.boardAt}</span>
        ) : null}
      </div>

      {/* Mandatory disclosure — must be read before booking (§7.4) */}
      <div className="mt-3 rounded-[var(--r-field)] bg-[var(--surface-2)] p-3">
        <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-[var(--ink-2)]">
          <Info className="size-3.5" aria-hidden />
          Before you book, read this
        </p>
        <ul className="flex flex-col gap-1.5">
          {itinerary.disclosure.map((line, i) => (
            <li key={i} className="text-xs leading-relaxed text-[var(--ink-2)]">
              {line}
            </li>
          ))}
        </ul>
        <label className="mt-3 flex items-center gap-2 text-xs font-medium text-[var(--ink)]">
          <input
            type="checkbox"
            checked={acknowledged}
            onChange={(e) => setAcknowledged(e.target.checked)}
            className="size-4 rounded border-[var(--hairline)] text-[var(--primary)] focus-visible:shadow-[var(--focus)]"
          />
          I understand what I am buying and where I board.
        </label>
      </div>

      <div className="mt-3 flex justify-end">
        <Button variant="accent" disabled={!acknowledged} icon={acknowledged ? <Check className="size-4" /> : undefined} onClick={onBook}>
          Book this option
        </Button>
      </div>
    </div>
  );
}
