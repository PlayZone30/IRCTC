/**
 * Pricing — PLAN.md §8.6, §11.4. All money in paise as integers.
 * Never do float arithmetic on currency; every intermediate value here
 * is an integer number of paise. See `computeFare` for the reference
 * figure this module must reproduce exactly (₹4,598.60).
 */
import type { ClassCode, PaymentInstrument } from './types';
import { CONVENIENCE_FEE_PAISE, GST_RATE, NON_AC_CLASSES, PG_CHARGE_RATE } from './rules';

export interface FareBreakdown {
  baseFarePaise: number;
  tatkalChargePaise: number;
  convenienceFeeBasePaise: number;
  convenienceFeeGstPaise: number;
  gatewayChargePaise: number;
  totalPaise: number;
}

/**
 * Instrument used only to decide UPI-vs-other convenience-fee tier and
 * the gateway charge rate. `netBanking`'s gateway charge is a flat fee,
 * not a percentage — handled below.
 */
export function convenienceFeeFor(classCode: ClassCode, instrument: PaymentInstrument): number {
  const isNonAc = NON_AC_CLASSES.includes(classCode);
  const isUpi = instrument === 'upi';
  if (isUpi) {
    return isNonAc ? CONVENIENCE_FEE_PAISE.upiNonAC : CONVENIENCE_FEE_PAISE.upiAC;
  }
  return isNonAc ? CONVENIENCE_FEE_PAISE.nonAC : CONVENIENCE_FEE_PAISE.AC;
}

/** GST is charged on the convenience fee. Rounded to the nearest paisa. */
export function gstOn(amountPaise: number): number {
  return Math.round(amountPaise * GST_RATE);
}

export function gatewayChargeFor(instrument: PaymentInstrument, amountPaise: number): number {
  switch (instrument) {
    case 'upi':
      return 0;
    case 'rupay_debit':
      return 0;
    case 'other_debit':
      return Math.round(amountPaise * (amountPaise <= 200000 ? PG_CHARGE_RATE.debitUpto2000 : PG_CHARGE_RATE.debitAbove2000));
    case 'credit_card':
      return Math.round(amountPaise * PG_CHARGE_RATE.creditCard);
    case 'net_banking':
      return PG_CHARGE_RATE.netBankingFlatPaise;
  }
}

/**
 * Full fare breakdown for one passenger's ticket.
 *
 * Reference figure (PLAN.md §8.6): a ₹4,575.00 (457500 paise) AC-class
 * fare paid via UPI/AutoPay carries a ₹20 + 18% GST convenience fee —
 * 2000 + 360 = 2360 paise — for a total of ₹4,598.60 (459860 paise).
 * This is the exact combination IRCTC's own reference payment screen
 * (paymentScreen3.png, "IRCTC iPay") displayed, and is pinned by the
 * acceptance test in pricing.test.ts. The card tier (₹30 + GST) and
 * net-banking flat fee are separate tiers selected via `instrument`.
 */
export function computeFare(baseFarePaise: number, classCode: ClassCode, instrument: PaymentInstrument): FareBreakdown {
  const convenienceFeeBasePaise = convenienceFeeFor(classCode, instrument);
  const convenienceFeeGstPaise = gstOn(convenienceFeeBasePaise);
  const gatewayChargePaise = gatewayChargeFor(instrument, baseFarePaise);
  const totalPaise = baseFarePaise + convenienceFeeBasePaise + convenienceFeeGstPaise + gatewayChargePaise;

  return {
    baseFarePaise,
    tatkalChargePaise: 0,
    convenienceFeeBasePaise,
    convenienceFeeGstPaise,
    gatewayChargePaise,
    totalPaise,
  };
}

/** Sum of paise across passengers, each priced independently, plus one shared convenience fee. */
export function computeBookingTotal(perPassengerFaresPaise: number[], classCode: ClassCode, instrument: PaymentInstrument): FareBreakdown {
  const baseFarePaise = perPassengerFaresPaise.reduce((sum, f) => sum + f, 0);
  return computeFare(baseFarePaise, classCode, instrument);
}
