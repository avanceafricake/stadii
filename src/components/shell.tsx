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
      <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-md px-md lg:px-lg">
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
    <nav aria-label="Sections" className="hidden lg:block">
      <ul className="sticky top-[5.5rem] space-y-px p-0">
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
      <ul className="mx-auto flex max-w-[1440px] p-0">
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
 * `aside` is supporting material and is the first thing to go when the screen
 * narrows — it is never the reason someone opened the page.
 */
export function StadiiShell({
  children,
  aside,
  active,
}: {
  children: ReactNode;
  aside?: ReactNode;
  active?: string;
}) {
  return (
    <div className="mx-auto w-full max-w-[1440px] gap-lg px-md py-lg lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:px-lg xl:grid-cols-[13rem_minmax(0,1fr)_20rem]">
      <StadiiSidebar active={active} />
      <div className="min-w-0">{children}</div>
      {aside ? <aside className="mt-lg space-y-md xl:mt-0">{aside}</aside> : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Footer
// ---------------------------------------------------------------------------

const FOOTER_GROUPS = [
  {
    heading: 'Discover',
    links: [
      { href: routes.events(), label: 'Events' },
      { href: routes.venues(), label: 'Stadiums' },
      { href: routes.teams(), label: 'Teams & athletes' },
      { href: routes.sports(), label: 'Sports' },
      { href: routes.competitions(), label: 'Competitions' },
    ],
  },
  {
    heading: 'Support',
    links: [
      { href: routes.help(), label: 'Help centre' },
      { href: routes.contact(), label: 'Contact us' },
      { href: routes.howItWorks(), label: 'How it works' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { href: routes.terms(), label: 'Terms & conditions' },
      { href: routes.privacy(), label: 'Privacy policy' },
      { href: routes.about(), label: 'About STADII' },
    ],
  },
] as const;

export function StadiiFooter() {
  return (
    <footer className="mt-xxl bg-brand text-ink-inverse">
      <div className="mx-auto max-w-[1440px] px-md py-xl lg:px-lg">
        <div className="grid gap-lg sm:grid-cols-2 lg:grid-cols-4">
          <div>
            {/* The mark, not the lockup: the lockup has a white ground and would
                sit in a box on this surface (brand/README.md). */}
            <Image
              src="/brand/mark.png"
              alt=""
              width={512}
              height={512}
              className="h-12 w-12 rounded-md bg-surface p-[3px]"
            />
            <p className="mt-sm text-title font-bold tracking-tight">{site.name}</p>
            <p className="mt-xs text-body text-white/70">Scan. Book. Enjoy.</p>
            <p className="mt-md max-w-prose text-body text-white/70">
              Tickets and stadium access for East African sport. All times are shown in{' '}
              {site.timezone.replace('_', ' ')}.
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
        </div>

        <div className="mt-xl flex flex-col gap-xs border-t border-white/15 pt-md text-caption text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name}. Every ticket is confirmed by STADII at the
            point of sale and at the gate.
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
