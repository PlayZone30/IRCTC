/**
 * Hindi copy deck — PLAN.md §7.10, §13.
 *
 * NOT YET TRANSLATED. This is deliberate: Task 15 in the build order
 * (§12) is the dedicated Hindi pass, done once the English copy is
 * final so we are not translating strings that still change.
 *
 * Per §7.10: "A partially translated payment-failure message is worse
 * than English — if a string cannot be translated well, leave the key
 * in English and log it, do not machine-translate money copy." Until
 * Task 15 runs, this file intentionally re-exports the English
 * dictionary so the `hi` locale is selectable and functional, never
 * broken or half-translated.
 */
import { en, type Dictionary } from './en';

export const hi: Dictionary = en;
