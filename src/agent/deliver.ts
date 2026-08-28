/**
 * Delivery simulation — PLAN.md §7.11.5. Presentation only, no
 * deception: a typing indicator whose duration scales with the length
 * of the reply, and a small gap between streamed step-trace lines. This
 * is what separates a convincing agent from an obvious script.
 */

/** Typing-indicator duration: 380ms + 14ms/char, clamped to 700–1900ms. */
export function typingDelayFor(text: string): number {
  return Math.min(1900, Math.max(700, 380 + 14 * text.length));
}

/** Delay between streamed step-trace lines (§7.11.5): 120–260ms. */
export function stepDelay(): number {
  return 190;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
