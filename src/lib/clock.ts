/**
 * Demo clock. The whole seeded dataset is anchored to a fixed "now" so
 * every judge sees an identical, deterministic state (§11.4). Task 11
 * turns this into an advanceable clock for the live charting transition;
 * for now it is a fixed instant just after the Tatkal AC window opens on
 * the demo day, so the Ready console (S9) shows one open window and one
 * counting down.
 */

/** The seeded "now": 2026-08-27 10:15 IST. */
export const DEMO_NOW_ISO = '2026-08-27T10:15:00+05:30';

let current = new Date(DEMO_NOW_ISO);

export function getDemoNow(): Date {
  return new Date(current);
}

/** Task 11 hook: advance or reset the demo clock. */
export function setDemoNow(date: Date): void {
  current = new Date(date);
}
