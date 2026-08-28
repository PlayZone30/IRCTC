/**
 * Demo clock — PLAN.md §7.8. A single interval-driven clock so charting
 * can be observed rather than described. One demo second advances the
 * simulated timeline by one simulated hour by default (COMPRESSION),
 * toggleable, and always pausable. The whole seeded dataset is anchored
 * to a fixed starting instant so every judge sees an identical state on
 * load (§11.4) — nothing here reads the real wall clock unless a caller
 * explicitly asks to reset to "now".
 */
import { useSyncExternalStore } from 'react';

/**
 * The seeded starting instant: 2026-08-27 18:00 IST. Chosen so the
 * seeded partially-confirmed order (RI-9137-882045, 12723 SL, first
 * chart at 20:00 that day) is exactly the "waitlisted PNR two hours
 * from charting" state required by §10.3 — advancing the clock by two
 * hours (or pressing "jump to chart") makes the transition observable.
 * Still well after the Tatkal AC window opens (10:00) for the Ready
 * console's seeded armed drafts (Task 10).
 */
export const DEMO_NOW_ISO = '2026-08-27T18:00:00+05:30';

/** Simulated hours advanced per real second while running. */
export const DEFAULT_COMPRESSION_HOURS_PER_SEC = 1;

const TICK_MS = 1000;

let current = new Date(DEMO_NOW_ISO);
let running = false;
let compressionHoursPerSec = DEFAULT_COMPRESSION_HOURS_PER_SEC;
let intervalId: ReturnType<typeof setInterval> | undefined;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getDemoNow(): Date {
  return new Date(current);
}

// useSyncExternalStore requires getSnapshot to return a referentially
// stable value between calls when nothing has changed — getDemoNow()
// intentionally returns a fresh Date each time (so callers can mutate
// their own copy safely), so the hook below caches one snapshot object
// and only replaces it when `current` actually changes.
let cachedSnapshot = new Date(current);
function getSnapshot(): Date {
  if (cachedSnapshot.getTime() !== current.getTime()) {
    cachedSnapshot = new Date(current);
  }
  return cachedSnapshot;
}

/** Jump the clock to an exact instant (e.g. "skip to chart time"). */
export function setDemoNow(date: Date): void {
  current = new Date(date);
  notify();
}

/** Reset to the seeded starting instant. */
export function resetDemoClock(): void {
  setDemoNow(new Date(DEMO_NOW_ISO));
}

export function isDemoClockRunning(): boolean {
  return running;
}

export function getCompressionHoursPerSec(): number {
  return compressionHoursPerSec;
}

export function setCompressionHoursPerSec(hoursPerSec: number): void {
  compressionHoursPerSec = Math.max(0, hoursPerSec);
  notify();
}

/** Start the interval that advances the clock — one real tick, `compressionHoursPerSec` simulated hours. */
export function startDemoClock(): void {
  if (running) return;
  running = true;
  intervalId = setInterval(() => {
    current = new Date(current.getTime() + compressionHoursPerSec * 60 * 60 * 1000);
    notify();
  }, TICK_MS);
  notify();
}

export function stopDemoClock(): void {
  if (!running) return;
  running = false;
  if (intervalId) clearInterval(intervalId);
  intervalId = undefined;
  notify();
}

/** React hook: re-renders on every tick, returns the current demo instant. */
export function useDemoClock(): Date {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/** React hook: re-renders when running/paused state changes. */
export function useDemoClockRunning(): boolean {
  return useSyncExternalStore(subscribe, isDemoClockRunning, isDemoClockRunning);
}
