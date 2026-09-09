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

import { AccountMenu, NotificationsButton } from './account-menu';
import { StadiiAside } from './aside';
import { Icon, type IconName } from './icons';
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
  { href: routes.home(), label: 'Home', icon: 'home' as IconName },
  { href: routes.events(), label: 'Events', icon: 'calendar' as IconName },
  { href: routes.venues(), label: 'Stadiums', icon: 'stadium' as IconName },
  { href: routes.sports(), label: 'Sports', icon: 'ball' as IconName },
  { href: routes.teams(), label: 'Teams', icon: 'users' as IconName },
  { href: routes.competitions(), label: 'Competitions', icon: 'trophy' as IconName },
] as const;

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------

export function StadiiHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-outline-subtle bg-surface/95 backdrop-blur">
      <div className="flex h-[4.5rem] items-center gap-md px-md sm:px-lg">
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

          {/* Whether a bell renders is a question only the client can answer,
              so it is asked there. A bell with nothing behind it is furniture
              pretending to be a feature. */}
          <NotificationsButton />

          <GetTheAppButton />

          <AccountMenu />
        </div>
      </div>
    </header>
  );
}

/**
 * "Get the app", pointing at the actual stores.
 *
 * It used to link to the how-it-works page, which is not what the words say.
 * With both platforms configured it is a native disclosure listing them; with
 * one, it is a direct link to that one; with neither, it does not render at
 * all — a store button that goes nowhere is worse than no store button, and
 * this is the header, where a dead control is on every page at once.
 *
 * `<details>` rather than a scripted menu: it works before JavaScript arrives
 * and is keyboard-operable without any of it.
 */
function GetTheAppButton() {
  const stores = [
    { label: 'Android', href: site.app.android },
    { label: 'iPhone', href: site.app.ios },
  ].filter((store) => store.href.length > 0);

  if (stores.length === 0) return null;

  const classes =
    'inline-flex h-10 cursor-pointer items-center gap-xs rounded-pill border border-outline px-md text-body font-medium text-ink transition-colors hover:bg-surface-sunken';

  if (stores.length === 1) {
    return (
      <a href={stores[0]!.href} rel="noopener" target="_blank" className={classes}>
        <Icon name="qr" className="h-4 w-4" />
        <span className="hidden sm:inline">Get the app</span>
      </a>
    );
  }

  return (
    <details className="relative">
      <summary className={cx(classes, 'list-none marker:hidden')}>
        <Icon name="qr" className="h-4 w-4" />
        <span className="hidden sm:inline">Get the app</span>
      </summary>
      <div className="absolute right-0 z-50 mt-xs w-44 overflow-hidden rounded-lg border border-outline-subtle bg-surface p-xs shadow-md">
        {stores.map((store) => (
          <a
            key={store.label}
            href={store.href}
            rel="noopener"
            target="_blank"
            className="block rounded-md px-sm py-sm text-body text-ink hover:bg-surface-sunken"
          >
            {store.label}
          </a>
        ))}
      </div>
    </details>
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
    <div className="hidden lg:block lg:pl-lg">
      <div className="sticky top-[6rem] space-y-lg">
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
      <ul className="flex p-0">
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
 * WIDTHS. This is an application frame, not a centred document, so it is not
 * capped — a 1280 band with a sidebar and a right panel inside it leaves a main
 * column too narrow to lay out an event grid in, which is the mistake this
 * replaced. The measurements come off the 1440 design canvas outward:
 *
 *     224 sidebar
 *   +  24 gap
 *   + 896 main            <- what is left over at 1440
 *   +  24 gap
 *   + 248 panel
 *   +  24 right margin
 *   = 1440
 *
 * The panel is 248 rather than the 320 first specified, because 320 was taking
 * its width out of the only column that flexes. Four event cards across the
 * main column came out at 190px each at 1440 — the width where a venue name
 * starts wrapping to three lines — against roughly 218 in the approved design.
 * The design's own panel measures about 244. At 248 the cards are 212 and the
 * panel still holds a date chip, two lines of event and a chevron without
 * crowding, which is everything it is asked to hold.
 *
 * The sidebar is flush to the left edge and pads its own labels in by 24, so
 * the nav aligns with the logo above it while the column keeps its full 224.
 * Only `main` flexes: the sidebar and the panel are fixed, so a wider monitor
 * gives its extra pixels to the content and not to the furniture. Paragraphs
 * inside still stop at `max-w-prose`, because a 1300px line is unreadable
 * however wide the window is.
 */
export function StadiiShell({
  children,
  aside,
  active,
  panel = true,
}: {
  children: ReactNode;
  /** Overrides the standing panel's CONTENT. Omit it to get the standing one. */
  aside?: ReactNode;
  active?: string;
  /**
   * Whether this page has a right panel at all.
   *
   * True for every discovery page, and the default, because supporting
   * material is what those pages want in that space. False for a page whose
   * job is one task and where a panel would be something to look at instead of
   * finishing — a checkout, a sign-in. No such page exists on this surface yet
   * (it holds no session and has no checkout, ADR-0018); the switch is here so
   * that when one arrives it is a parameter rather than a second shell.
   */
  panel?: boolean;
}) {
  const showPanel = panel;

  return (
    <div
      className={cx(
        'w-full gap-lg px-md py-lg sm:px-lg',
        // From `lg` the sidebar is a rail against the window edge, so the left
        // gutter belongs to the sidebar rather than to the page.
        'lg:grid lg:grid-cols-[14rem_minmax(0,1fr)] lg:pl-0 lg:pr-lg',
        showPanel && 'xl:grid-cols-[14rem_minmax(0,1fr)_15.5rem]',
      )}
    >
      <StadiiSidebar active={active} />
      <div className="min-w-0">{children}</div>
      {showPanel ? (
        <aside className="mt-lg space-y-md xl:mt-0">
          <div className="xl:sticky xl:top-[6rem] xl:space-y-md">{aside ?? <StadiiAside />}</div>
        </aside>
      ) : null}
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
      <div className="px-md py-xl sm:px-lg">
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
