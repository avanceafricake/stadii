/**
 * The STADII web shell — header, sidebar, right panel, footer.
 *
 * Every page sits inside this, so the product looks like one product rather
 * than a set of pages that happen to share a domain. The shell owns navigation
 * and identity; a page owns only its content.
 *
 * The three-column desktop layout collapses deliberately rather than shrinking:
 * the right panel is supporting material and goes first, the sidebar becomes a
 * bottom bar on a phone because a thumb reaches the bottom of a screen and not
 * the side of one.
 */

import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { StadiiAside } from './aside';
import { cx } from './primitives';
import { routes } from '@/lib/routes';
import { site } from '@/lib/site';

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

/**
 * `authed` items are shown but lead to the hand-off: this surface never signs
 * anyone in, because it holds no session (ADR-0018). Hiding them would make the
 * product look smaller than it is; showing them and being honest about where
 * they lead is the better trade.
 */
const NAV = [
  { href: routes.home(), label: 'Home', icon: 'home' },
  { href: routes.events(), label: 'Events', icon: 'calendar' },
  { href: routes.venues(), label: 'Stadiums', icon: 'stadium' },
  { href: routes.sports(), label: 'Sports', icon: 'ball' },
  { href: routes.teams(), label: 'Teams', icon: 'shield' },
  { href: routes.competitions(), label: 'Competitions', icon: 'trophy' },
] as const;

type IconName = (typeof NAV)[number]['icon'] | 'search' | 'bell' | 'user' | 'ticket';

/**
 * One icon family, drawn inline.
 *
 * An icon font or a sprite sheet would be a network request on the critical
 * path of a page whose whole job is to load fast on a Kenyan mobile connection.
 * These are a few hundred bytes of markup.
 */
export function Icon({ name, className }: { name: IconName; className?: string }) {
  const paths: Record<IconName, ReactNode> = {
    home: <path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" />,
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M3 10h18M8 3v4M16 3v4" />
      </>
    ),
    stadium: (
      <>
        <ellipse cx="12" cy="9" rx="9" ry="4" />
        <path d="M3 9v6c0 2.2 4 4 9 4s9-1.8 9-4V9" />
      </>
    ),
    ball: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m12 7 4 3-1.5 5h-5L8 10z" />
      </>
    ),
    shield: <path d="M12 3l7 3v6c0 4.5-3 8-7 9-4-1-7-4.5-7-9V6z" />,
    trophy: (
      <>
        <path d="M7 4h10v5a5 5 0 0 1-10 0z" />
        <path d="M7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3M10 19h4M12 14v5" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </>
    ),
    bell: <path d="M18 16V11a6 6 0 1 0-12 0v5l-2 3h16zM10 22h4" />,
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" />
      </>
    ),
    ticket: (
      <>
        <path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4z" />
        <path d="M15 6v12" />
      </>
    ),
  };

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cx('h-5 w-5 shrink-0', className)}
    >
      {paths[name]}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------

export function StadiiHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-outline-subtle bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-shell items-center gap-md px-md sm:px-lg lg:px-xl">
        <Link href={routes.home()} className="flex shrink-0 items-center" aria-label={site.name}>
          <Image
            src="/brand/logo-landscape.png"
            alt={site.name}
            width={900}
            height={226}
            priority
            className="h-9 w-auto sm:h-10"
          />
        </Link>

        <StadiiSearchBar className="hidden flex-1 md:flex" />

        <div className="ml-auto flex items-center gap-xs md:ml-0">
          <Link
            href={routes.search()}
            aria-label="Search"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-ink hover:bg-surface-sunken md:hidden"
          >
            <Icon name="search" />
          </Link>

          {/* A real link, not a decorative bell: it goes where updates live. */}
          <Link
            href={routes.help()}
            aria-label="Updates and help"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-md text-ink hover:bg-surface-sunken"
          >
            <Icon name="bell" />
          </Link>

          {/* This surface holds no session (ADR-0018), so the account control is
              honest about being a hand-off rather than pretending to sign in. */}
          <Link
            href={routes.howItWorks()}
            className="inline-flex items-center gap-xs rounded-pill border border-outline px-xs py-xs pr-sm text-body font-medium text-ink hover:bg-surface-sunken"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand text-ink-inverse">
              <Icon name="user" className="h-4 w-4" />
            </span>
            <span className="hidden sm:inline">Get the app</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

export function StadiiSearchBar({ className }: { className?: string }) {
  return (
    <form action={routes.search()} role="search" className={cx('items-center', className)}>
      <label htmlFor="site-search" className="sr-only">
        Search for events, stadiums or teams
      </label>
      <div className="relative w-full">
        <span className="pointer-events-none absolute inset-y-0 left-sm flex items-center text-ink-subtle">
          <Icon name="search" />
        </span>
        <input
          id="site-search"
          name="q"
          type="search"
          placeholder="Search for events, stadiums or teams..."
          className="h-11 w-full rounded-pill border border-outline bg-surface-sunken pl-[2.75rem] pr-md text-body text-ink outline-none placeholder:text-ink-subtle focus:border-action focus:bg-surface focus:ring-2 focus:ring-action/20"
        />
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------

export function StadiiSidebar({ active }: { active?: string }) {
  return (
    <div className="hidden lg:block">
      <div className="sticky top-[5.5rem] space-y-lg">
        <nav aria-label="Sections">
          <ul className="space-y-px p-0">
            {NAV.map((item) => {
              const isActive = active === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={cx(
                      'flex items-center gap-sm rounded-lg px-sm py-sm text-body transition-colors',
                      isActive
                        ? 'bg-action-50 font-semibold text-action-800'
                        : 'text-ink-muted hover:bg-surface-sunken hover:text-ink',
                    )}
                  >
                    <Icon name={item.icon} className={isActive ? 'text-action' : undefined} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <SidebarBanner />
      </div>
    </div>
  );
}

/**
 * The standing promotion under the navigation.
 *
 * Built rather than placed: it is a gradient, the STADII mark and type, not a
 * photograph. The venue research pack's Review Notes require image licensing to
 * be confirmed before public use and it has not been, so a stock crowd shot
 * here would be the one unlicensed asset on an otherwise careful site. The
 * layout takes a photograph the day there is one to take — `backgroundImage` on
 * the outer element and a scrim over it — and reads correctly without.
 *
 * It is part of the SHELL rather than a page, so it appears on every page in
 * the same place. A promotion that moves around is an advert; one that always
 * sits in the same corner is furniture, and furniture is what a reader learns
 * to ignore politely rather than resent.
 */
function SidebarBanner() {
  const features = [
    { icon: 'ticket' as const, label: 'Easy booking' },
    { icon: 'shield' as const, label: 'Secure payments' },
    { icon: 'search' as const, label: 'Digital tickets' },
  ];

  return (
    <aside
      aria-label="About STADII"
      className="overflow-hidden rounded-lg bg-gradient-to-b from-brand via-brand-800 to-brand-900 p-md text-ink-inverse shadow-sm"
    >
      <Image
        src="/brand/mark.png"
        alt=""
        width={512}
        height={512}
        className="h-10 w-10 rounded-md bg-surface p-[2px]"
      />

      <p className="mt-sm text-title font-bold leading-tight">
        Live sport,
        <br />
        unforgettable moments
      </p>
      <p className="mt-xs text-body text-white/70">
        Book your tickets now and be part of the action.
      </p>

      <ul className="mt-md space-y-xs border-t border-white/15 p-0 pt-md">
        {features.map((feature) => (
          <li key={feature.label} className="flex items-center gap-sm text-body text-white/85">
            <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10">
              <Icon name={feature.icon} className="h-4 w-4" />
            </span>
            {feature.label}
          </li>
        ))}
      </ul>

      <Link
        href={routes.events()}
        className="mt-md inline-flex h-11 w-full items-center justify-center gap-xs rounded-xl bg-action px-md text-body font-semibold text-on-action transition-colors hover:bg-action-600"
      >
        Explore events <span aria-hidden="true">→</span>
      </Link>
    </aside>
  );
}

/**
 * The phone equivalent. A thumb reaches the bottom of a screen, not the side,
 * so the sidebar becomes a bar rather than a drawer nobody opens.
 */
export function StadiiMobileNav({ active }: { active?: string }) {
  const items = NAV.slice(0, 5);
  return (
    <nav
      aria-label="Sections"
      className="sticky bottom-0 z-30 border-t border-outline-subtle bg-surface lg:hidden"
    >
      <ul className="mx-auto flex max-w-shell p-0">
        {items.map((item) => {
          const isActive = active === item.href;
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={cx(
                  'flex min-h-[3.5rem] flex-col items-center justify-center gap-[2px] px-xs py-xs text-caption',
                  isActive ? 'font-semibold text-action' : 'text-ink-subtle',
                )}
              >
                <Icon name={item.icon} className="h-5 w-5" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// ---------------------------------------------------------------------------
// Shell
// ---------------------------------------------------------------------------

/**
 * Three columns: navigation, the page, and supporting material.
 *
 * The right column is NOT optional. It used to be — `aside` was a prop and two
 * pages out of twenty-three passed one — so a three-column design rendered as
 * two columns almost everywhere and the layout visibly changed when you clicked
 * from the homepage to anything else. A page may still supply its own panel
 * when it has something better to put there; it cannot leave the column empty.
 *
 * The collapse is deliberate rather than a shrink. The right column goes first
 * at `xl`, because it is supporting material and never the reason someone
 * opened the page. The sidebar goes at `lg` and becomes a bottom bar, because a
 * thumb reaches the bottom of a screen and not the side of one.
 *
 * Widths: `max-w-shell` is 1344 — a 1280 content band plus 32px gutters — so
 * the page stops growing well before the edge of a 1920 monitor. Inside it,
 * 224 sidebar + 304 panel + two 24px gaps leaves a 704px main column, which is
 * about 85 characters of body text: long enough not to feel cramped, short
 * enough to still be a column. The arithmetic lives on `maxWidth.shell` in
 * tailwind.config.ts, where all four numbers are together.
 */
export function StadiiShell({
  children,
  aside,
  active,
}: {
  children: ReactNode;
  /** Overrides the standing panel. Omit it to get the standing one. */
  aside?: ReactNode;
  active?: string;
}) {
  return (
    <div className="mx-auto w-full max-w-shell gap-lg px-md py-lg sm:px-lg lg:grid lg:grid-cols-[14rem_minmax(0,1fr)] lg:px-xl xl:grid-cols-[14rem_minmax(0,1fr)_19rem]">
      <StadiiSidebar active={active} />
      <div className="min-w-0">{children}</div>
      <aside className="mt-lg space-y-md xl:mt-0">
        <div className="xl:sticky xl:top-[5.5rem] xl:space-y-md">{aside ?? <StadiiAside />}</div>
      </aside>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Footer
// ---------------------------------------------------------------------------

const FOOTER_GROUPS = [
  {
    heading: 'Explore',
    links: [
      { href: routes.events(), label: 'Events' },
      { href: routes.venues(), label: 'Stadiums' },
      { href: routes.teams(), label: 'Teams' },
      { href: routes.sports(), label: 'Sports' },
      { href: routes.competitions(), label: 'Competitions' },
    ],
  },
  {
    heading: 'Support',
    links: [
      { href: routes.help(), label: 'Help centre' },
      { href: routes.faqs(), label: 'FAQs' },
      { href: routes.contact(), label: 'Contact us' },
      { href: routes.howItWorks(), label: 'How it works' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { href: routes.privacy(), label: 'Privacy policy' },
      { href: routes.terms(), label: 'Terms of use' },
      { href: routes.refunds(), label: 'Refund policy' },
      { href: routes.about(), label: 'About STADII' },
    ],
  },
] as const;

/**
 * Social marks, drawn inline.
 *
 * Only ever rendered for an account that is configured — an icon linking to an
 * unregistered handle sends people to whoever squatted it, and on a ticketing
 * brand that is a fraud vector rather than a cosmetic problem. See
 * `site.social`.
 */
function SocialIcon({ name }: { name: string }) {
  const paths: Record<string, ReactNode> = {
    X: <path d="M3 3h4.5l4.2 5.7L16.8 3H21l-6.8 8.4L21.4 21h-4.5l-4.6-6.2L7 21H3l7.2-8.9z" />,
    Facebook: (
      <path d="M14 8.5V7c0-.8.4-1.2 1.3-1.2H17V3h-2.6C11.7 3 11 4.6 11 6.7v1.8H9V12h2v9h3v-9h2.3l.4-3.5z" />
    ),
    Instagram: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.2" cy="6.8" r="1.1" />
      </>
    ),
    YouTube: (
      <>
        <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
        <path d="m10.5 9.5 5 2.5-5 2.5z" />
      </>
    ),
    TikTok: (
      <path d="M14 3v10.2a3.2 3.2 0 1 1-2.6-3.15V13a1 1 0 1 0 1 1V3zM14 3c.4 2.1 1.9 3.5 4 3.7v2.6c-1.6-.1-3-.7-4-1.6" />
    ),
    LinkedIn: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path d="M7.5 10v7M7.5 7.2v.1M11.5 17v-4a2 2 0 0 1 4 0v4" />
      </>
    ),
  };

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-5 w-5"
    >
      {paths[name] ?? <circle cx="12" cy="12" r="9" />}
    </svg>
  );
}

export function StadiiFooter() {
  return (
    <footer className="bg-brand text-ink-inverse">
      <div className="mx-auto max-w-shell px-md py-xl sm:px-lg lg:px-xl">
        <div className="grid gap-lg md:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)_1fr]">
          <div>
            {/* The landscape lockup, as the brand requires. It is artwork on a
                white ground, so it gets a white plate rather than being placed
                straight onto the teal, where its own background would read as a
                rectangle someone forgot to cut out. The plate is the fix until
                an inverted lockup exists (brand/README.md). */}
            <Link
              href={routes.home()}
              aria-label={site.name}
              className="inline-flex rounded-md bg-surface px-sm py-xs"
            >
              <Image
                src="/brand/logo-landscape.png"
                alt={site.name}
                width={900}
                height={226}
                className="h-10 w-auto"
              />
            </Link>
            <p className="mt-md text-body font-medium leading-relaxed text-white/85">
              Every event.
              <br />
              Every stadium.
              <br />
              One platform.
            </p>
            <p className="mt-sm text-caption text-white/55">
              All times are shown in {site.timezone.replace('_', ' ')}.
            </p>
          </div>

          {FOOTER_GROUPS.map((group) => (
            <div key={group.heading}>
              <p className="text-caption font-semibold uppercase tracking-wider text-white/60">
                {group.heading}
              </p>
              <ul className="mt-sm space-y-xs p-0">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-body text-white/85 underline-offset-4 hover:text-action-300 hover:underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <p className="text-caption font-semibold uppercase tracking-wider text-white/60">
              Follow us
            </p>
            {site.social.length > 0 ? (
              <ul className="mt-sm flex flex-wrap gap-xs p-0">
                {site.social.map((account) => (
                  <li key={account.label}>
                    <a
                      href={account.url}
                      aria-label={`${site.name} on ${account.label}`}
                      rel="noopener noreferrer"
                      target="_blank"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white/85 transition-colors hover:bg-white/20 hover:text-white"
                    >
                      <SocialIcon name={account.label} />
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              // Honest rather than decorative. Dead social icons on a ticketing
              // site are worse than none: the handles are unregistered, so each
              // one is an invitation to whoever registers it first.
              <p className="mt-sm text-body text-white/60">
                Accounts are on the way. Until then,{' '}
                <a
                  href={`mailto:${site.support.email}`}
                  className="underline underline-offset-4 hover:text-action-300"
                >
                  email us
                </a>
                .
              </p>
            )}
          </div>
        </div>

        <div className="mt-xl flex flex-col gap-xs border-t border-white/15 pt-md text-caption text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <p>
            <a href={`mailto:${site.support.email}`} className="underline hover:text-action-300">
              {site.support.email}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
