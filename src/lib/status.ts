import type { BookingStatus, ClassCode } from '@/domain/types';
import type { ChipVariant } from '@/components/ui/Chip';
import { translate } from '@/i18n';

/**
 * Maps a BookingStatus to display info: chip text, chip variant, and
 * the plain-language consequence from the copy deck (§13.2).
 * Single source for this mapping — no component should re-derive it.
 */
export function describeStatus(status: BookingStatus, classCode?: ClassCode): { chipText: string; variant: ChipVariant; label: string; consequence: string } {
  switch (status.kind) {
    case 'CNF': {
      const isFirstAc = classCode === '1A';
      const key = isFirstAc ? 'status.CNF_1A' : 'status.CNF';
      return {
        chipText: `CNF · ${status.coach}/${status.berth}`,
        variant: 'cnf',
        label: translate(`${key}.label`),
        consequence: translate(`${key}.consequence`),
      };
    }
    case 'CNF_NO_BERTH':
      return {
        chipText: 'CNF',
        variant: 'cnf',
        label: translate('status.CNF_NO_BERTH.label'),
        consequence: translate('status.CNF_NO_BERTH.consequence'),
      };
    case 'RAC':
      return {
        chipText: `RAC ${status.number}`,
        variant: 'rac',
        label: translate('status.RAC.label'),
        consequence: translate('status.RAC.consequence'),
      };
    case 'WL':
      return {
        chipText: `${status.type} ${status.number}`,
        variant: 'wl',
        label: translate(`status.${status.type}.label`),
        consequence: translate(`status.${status.type}.consequence`),
      };
    case 'REGRET':
      return {
        chipText: 'REGRET',
        variant: 'regret',
        label: translate('status.REGRET.label'),
        consequence: translate('status.REGRET.consequence'),
      };
    case 'NOT_AVAILABLE':
      return {
        chipText: 'N/A',
        variant: 'regret',
        label: translate('status.NOT_AVAILABLE.label'),
        consequence: translate('status.NOT_AVAILABLE.consequence'),
      };
  }
}

/** True for any waitlist status — used to decide whether to show the waitlist warning. */
export function isWaitlisted(status: BookingStatus): boolean {
  return status.kind === 'WL';
}
