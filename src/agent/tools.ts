/**
 * Sarathi's tool surface — PLAN.md §7.11. Each tool is a pure function
 * over the SAME domain code the UI uses, so the agent physically cannot
 * hallucinate a fare, a berth or a rule.
 *
 * There is deliberately NO payForBooking tool. It is absent from the
 * registry, not disabled — payment is unreachable from the agent by
 * construction (§7.11.6). Cancellation and payment happen only on the
 * real screens, confirmed by a human.
 */
import type { BookingDraft, BookingStatus, ClassCode, ClassInventory, Order, Passenger, QuotaCode, Station } from '@/domain/types';
import { availabilityForTrain, classesOnTrain, searchTrains, type SearchResult } from '@/domain/availability';
import { alternatesForTrain } from '@/domain/alternates';
import { confirmationEvidenceFor, CONFIRMATION_BAND_LABEL } from '@/domain/confirmation';
import { allocate, type AllocationResult } from '@/domain/allocator';
import { computeFare } from '@/domain/pricing';
import { CLASS_LABELS, NO_CONCESSION_IN, QUOTA_LABELS, TATKAL_EXCLUDED_CLASSES } from '@/domain/rules';
import { resolveStation } from './extract';
import { trainByNumber } from '@/data/trains';
import { findInventory } from '@/data/inventory';
import { stationByCode } from '@/data/stations';
import { accounts } from '@/data/accounts';
import { useOrdersStore } from '@/store/orders';
import { formatRupees } from '@/lib/money';

/** Disambiguate a station name; returns candidates when ambiguous. */
export function resolveStationTool(query: string): Station[] {
  return resolveStation(query);
}

/** Same search the results page uses. */
export function searchTrainsTool(fromCode: string, toCode: string, date: string, classCode?: ClassCode, quota?: QuotaCode): SearchResult[] {
  return searchTrains({ fromCode, toCode, date, classCode: classCode ?? 'ALL', quota });
}

/** All-class availability for one train on a date, scoped to the boarding station. */
export function getAvailabilityTool(trainNumber: string, date: string, boardingStationCode: string): ClassInventory[] {
  const train = trainByNumber(trainNumber);
  if (!train) return [];
  return availabilityForTrain(train, date, boardingStationCode);
}

/** §7.4 alternate generators across all classes a train runs. */
export function findAlternatesTool(trainNumber: string, fromCode: string, toCode: string, date: string) {
  const train = trainByNumber(trainNumber);
  if (!train) return [];
  return classesOnTrain(train).flatMap((c) => alternatesForTrain(train, fromCode, toCode, date, c));
}

/** §7.5 historical confirmation evidence for a waitlist position. */
export function getConfirmationEvidenceTool(trainNumber: string, classCode: ClassCode, wl: number) {
  return confirmationEvidenceFor(trainNumber, classCode, wl);
}

/** Saved passengers from the signed-in account. */
export function listSavedPassengersTool(accountId: string | null): Passenger[] {
  if (!accountId || !(accountId in accounts)) return [];
  return accounts[accountId as keyof typeof accounts].savedPassengers;
}

export interface EligibilityViolation {
  rule: string;
  reason: string;
}

/** Returns rule violations with reasons (§8.4). Empty array = eligible. */
export function checkEligibilityTool(quota: QuotaCode, classCode: ClassCode, passengers: Passenger[]): EligibilityViolation[] {
  const violations: EligibilityViolation[] = [];
  if (NO_CONCESSION_IN.includes(quota) && passengers.some((p) => p.concession)) {
    violations.push({
      rule: 'no_concession_in_tatkal',
      reason: 'Concessions are not allowed in the Tatkal quota, so no concession has been applied. The fare shown is the full fare.',
    });
  }
  if ((quota === 'TQ' || quota === 'PT') && TATKAL_EXCLUDED_CLASSES.includes(classCode)) {
    violations.push({
      rule: 'tatkal_excluded_class',
      reason: `${CLASS_LABELS[classCode]} is not offered under the Tatkal quota.`,
    });
  }
  if (quota === 'LD' && passengers.some((p) => p.gender !== 'F')) {
    violations.push({
      rule: 'ladies_all_female',
      reason: 'The Ladies quota is only for female passengers.',
    });
  }
  return violations;
}

/** Full fare breakdown for a class + base fare, using the same pricing the UI uses. */
export function priceBookingTool(baseFarePaise: number, classCode: ClassCode, passengerCount: number) {
  return computeFare(baseFarePaise * passengerCount, classCode, 'upi');
}

/** §9 allocator — returns berths + decision trace. */
export function allocateBerthsTool(draft: BookingDraft, classStatus: BookingStatus): AllocationResult {
  return allocate({
    trainNumber: draft.trainNumber,
    date: draft.date,
    classCode: draft.classCode,
    boardingStationCode: draft.boardingStationCode,
    classStatus,
    passengers: draft.passengers,
    reservationChoice: draft.reservationChoice,
  });
}

/** Order state for refund and status questions. */
export function getOrderStateTool(orderId: string): Order | undefined {
  return useOrdersStore.getState().getOrder(orderId);
}

/** The first order matching a PNR (for check_pnr / cancel by PNR). */
export function getOrderByPnrTool(pnr: string): Order | undefined {
  return useOrdersStore.getState().orders.find((o) => o.pnr === pnr);
}

// --- small formatting helpers shared by the planner --------------------------

export function stationName(code: string): string {
  return stationByCode(code)?.name ?? code;
}

/** Compact one-line status label, e.g. "CNF B2/41 Lower", "WL 34", "RAC 12". */
export function shortStatus(status: BookingStatus): string {
  switch (status.kind) {
    case 'CNF':
      return `Confirmed ${status.coach}/${status.berth}`;
    case 'CNF_NO_BERTH':
      return 'Confirmed (berth at charting)';
    case 'RAC':
      return `RAC ${status.number}`;
    case 'WL':
      return `Waitlist ${status.number}`;
    case 'REGRET':
      return 'No booking';
    case 'NOT_AVAILABLE':
      return 'Not offered';
  }
}

/** Base fare for one passenger in a class on a train/date/boarding, in paise. */
export function baseFareFor(trainNumber: string, date: string, classCode: ClassCode, boardingStationCode: string): number {
  return findInventory(trainNumber, date, classCode, boardingStationCode)?.baseFarePaise ?? 0;
}

export { CONFIRMATION_BAND_LABEL, formatRupees, CLASS_LABELS, QUOTA_LABELS };
