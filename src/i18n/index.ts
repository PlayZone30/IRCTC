import { useSyncExternalStore } from 'react';
import { en } from './en';
import { hi } from './hi';

export type Locale = 'en' | 'hi';

const dictionaries = { en, hi };

const STORAGE_KEY = 'railindia.locale';

function readStoredLocale(): Locale {
  if (typeof window === 'undefined') return 'en';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === 'hi' ? 'hi' : 'en';
}

let currentLocale: Locale = readStoredLocale();
const listeners = new Set<() => void>();

export function getLocale(): Locale {
  return currentLocale;
}

export function setLocale(locale: Locale) {
  currentLocale = locale;
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, locale);
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Resolve a dotted key path against the active dictionary, e.g.
 * "status.CNF.label" -> dictionaries[locale].status.CNF.label.
 * Falls back to English, then to the key itself (never throws, never
 * renders blank — a missing translation should be visible and fixable,
 * not a silent gap).
 */
function resolve(dict: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, segment) => {
    if (acc && typeof acc === 'object' && segment in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[segment];
    }
    return undefined;
  }, dict);
}

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    const value = vars[key];
    return value === undefined ? match : String(value);
  });
}

/**
 * Translate a dotted key, e.g. t('status.CNF.label').
 * Interpolates {placeholders} from the vars object.
 */
export function translate(key: string, vars?: Record<string, string | number>): string {
  const active = dictionaries[currentLocale] as unknown as Record<string, unknown>;
  const fallback = dictionaries.en as unknown as Record<string, unknown>;
  const value = resolve(active, key) ?? resolve(fallback, key);
  if (typeof value !== 'string') {
    // Missing key: surface it plainly rather than rendering nothing,
    // so gaps get caught in review rather than shipped silently.
    return `[[${key}]]`;
  }
  return interpolate(value, vars);
}

/** React hook: re-renders on locale change, returns the `t` function and current locale. */
export function useI18n() {
  const locale = useSyncExternalStore(subscribe, getLocale, getLocale);
  return { t: translate, locale, setLocale };
}
