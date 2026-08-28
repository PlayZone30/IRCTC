import { useState, type ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Bell, Menu, TicketCheck, User, X } from 'lucide-react';
import { cx } from '@/lib/cx';
import { useI18n, setLocale } from '@/i18n';
import { IconButton } from './IconButton';

/**
 * AppShell — PLAN.md §3.4.
 * Sticky white top nav. Left: squircle logo mark + wordmark. Centre:
 * nav links. Right: text-size control, language toggle, notifications,
 * avatar. Mobile: logo + hamburger + avatar; nav in a sheet.
 */
const NAV_LINKS = [
  { to: '/search', key: 'nav.book' as const },
  { to: '/orders', key: 'nav.myBookings' as const },
  { to: '/pnr', key: 'nav.pnrStatus' as const },
  { to: '/charts', key: 'nav.charts' as const },
];

const FONT_SCALE_MIN = 0.875;
const FONT_SCALE_MAX = 1.25;
const FONT_SCALE_STEP = 0.125;
const FONT_SCALE_STORAGE_KEY = 'railindia.fontScale';

function readFontScale(): number {
  if (typeof window === 'undefined') return 1;
  const stored = Number(window.localStorage.getItem(FONT_SCALE_STORAGE_KEY));
  return Number.isFinite(stored) && stored > 0 ? stored : 1;
}

function applyFontScale(scale: number) {
  document.documentElement.style.setProperty('--font-scale', String(scale));
  window.localStorage.setItem(FONT_SCALE_STORAGE_KEY, String(scale));
}

export function AppShell({ children }: { children: ReactNode }) {
  const { t, locale } = useI18n();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [fontScale, setFontScale] = useState(readFontScale);

  function adjustFontScale(delta: number) {
    const next = Math.min(FONT_SCALE_MAX, Math.max(FONT_SCALE_MIN, Math.round((fontScale + delta) * 1000) / 1000));
    setFontScale(next);
    applyFontScale(next);
  }

  return (
    <div className="min-h-screen">
      {/* Skip-to-content link — essential for keyboard users, visually hidden until focused. */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-[var(--r-field)] focus:bg-[var(--ink)] focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-white"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b border-[var(--hairline)] bg-[var(--surface)] px-4 sm:px-6">
        <Link to="/" className="flex min-w-0 items-center gap-2.5 text-[var(--ink)]">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-[var(--primary)] text-white">
            <TicketCheck className="size-5" aria-hidden />
          </span>
          <span className="truncate text-[17px] font-bold">{t('nav.productName')}</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cx(
                  'pb-1 text-sm font-medium text-[var(--ink-2)] hover:text-[var(--ink)]',
                  isActive && 'border-b-2 border-[var(--ink)] text-[var(--ink)]',
                )
              }
            >
              {t(link.key)}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <div className="hidden items-center gap-0.5 rounded-[var(--r-chip)] bg-[var(--surface-2)] px-1 py-1 sm:flex">
            <button
              type="button"
              aria-label={t('nav.textSizeDecrease')}
              onClick={() => adjustFontScale(-FONT_SCALE_STEP)}
              className="rounded-[var(--r-chip)] px-2 py-1 text-xs font-bold text-[var(--ink-2)] hover:bg-[var(--hairline)]"
            >
              A&minus;
            </button>
            <button
              type="button"
              aria-label={t('nav.textSizeReset')}
              onClick={() => {
                setFontScale(1);
                applyFontScale(1);
              }}
              className="rounded-[var(--r-chip)] px-2 py-1 text-sm font-bold text-[var(--ink-2)] hover:bg-[var(--hairline)]"
            >
              A
            </button>
            <button
              type="button"
              aria-label={t('nav.textSizeIncrease')}
              onClick={() => adjustFontScale(FONT_SCALE_STEP)}
              className="rounded-[var(--r-chip)] px-2 py-1 text-base font-bold text-[var(--ink-2)] hover:bg-[var(--hairline)]"
            >
              A+
            </button>
          </div>

          <button
            type="button"
            aria-label={t('nav.language')}
            onClick={() => setLocale(locale === 'en' ? 'hi' : 'en')}
            className="hidden rounded-[var(--r-chip)] px-3 py-1.5 text-xs font-bold text-[var(--ink-2)] hover:bg-[var(--surface-2)] sm:inline-flex"
          >
            {locale === 'en' ? 'हिं' : 'EN'}
          </button>

          <IconButton icon={<Bell className="size-4" />} aria-label={t('nav.notifications')} className="hidden sm:inline-flex" />
          <IconButton icon={<User className="size-4" />} aria-label={t('nav.account')} onClick={() => {}} />

          <IconButton
            icon={mobileNavOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            aria-label={mobileNavOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMobileNavOpen((o) => !o)}
            className="md:hidden"
          />
        </div>
      </header>

      {mobileNavOpen ? (
        <nav className="anim-fade-in border-b border-[var(--hairline)] bg-[var(--surface)] px-4 py-3 md:hidden" aria-label="Primary">
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  onClick={() => setMobileNavOpen(false)}
                  className={({ isActive }) =>
                    cx(
                      'block rounded-[var(--r-field)] px-3 py-2.5 text-sm font-medium text-[var(--ink-2)]',
                      isActive && 'bg-[var(--primary-weak)] text-[var(--primary-press)]',
                    )
                  }
                >
                  {t(link.key)}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      <main id="main-content">{children}</main>

      <footer className="border-t border-[var(--hairline)] bg-[var(--ink)] px-4 py-10 text-[var(--ink-3)] sm:px-6">
        <div className="mx-auto grid max-w-[1200px] gap-8 sm:grid-cols-2 md:grid-cols-4">
          <FooterColumn title="Book & manage" links={['Search trains', 'PNR status', 'Charts / vacancy', 'Your bookings']} />
          <FooterColumn title="Rules & refunds" links={['Cancellation policy', 'Waitlist & RAC explained', 'Berth allocation', 'Tatkal rules']} />
          <FooterColumn title="Help" links={['Raise a query', 'Accessibility statement', 'Contact']} />
          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-white">About this build</h3>
            <p className="text-xs leading-relaxed">{t('footer.disclaimer')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FooterColumn({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-white">{title}</h3>
      <ul className="flex flex-col gap-2 text-xs">
        {links.map((l) => (
          <li key={l} className="cursor-default">
            {l}
          </li>
        ))}
      </ul>
    </div>
  );
}
