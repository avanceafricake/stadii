/**
 * The STADII card system.
 *
 * One decision runs through all of it: an event is presented according to what
 * it IS, not according to a template. A fixture between two sides is a
 * confrontation and reads as one — crest, VS, crest, with equal weight either
 * side. A meet, a concert or a festival has no sides, so forcing it into the
 * same frame would invent an opposition that does not exist.
 *
 * That is the same distinction the domain already makes (ADR-0004: an event has
 * N participants, not a home and an away), surfaced visually.
 */

import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { Icon } from './shell';
import { cx } from './primitives';
import { routes } from '@/lib/routes';

// ---------------------------------------------------------------------------
// Shared pieces
// ---------------------------------------------------------------------------

export function SectionHeader({
  title,
  href,
  linkLabel = 'View all',
}: {
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-md flex items-baseline justify-between gap-md">
      <h2 className="text-title font-bold tracking-tight text-ink">{title}</h2>
      {href ? (
        <Link
          href={href}
          className="shrink-0 text-body font-semibold text-info-700 underline-offset-4 hover:underline"
        >
          {linkLabel} →
        </Link>
      ) : null}
    </div>
  );
}

export function CategoryBadge({ label, tone = 'action' }: { label: string; tone?: 'action' | 'info' }) {
  return (
    <span
      className={cx(
        'inline-flex items-center rounded-pill px-sm py-[3px] text-caption font-semibold',
        tone === 'action' ? 'bg-action-50 text-action-800' : 'bg-info-50 text-info-800',
      )}
    >
      {label}
    </span>
  );
}

/**
 * A crest, or the initials if a participant has none.
 *
 * Most Kenyan clubs in the catalogue will not have a licensed crest on day
 * one, and a broken image is worse than no image. The fallback is deliberately
 * plain so it does not read as a logo of its own.
 */
export function Crest({
  name,
  src,
  size = 72,
}: {
  name: string;
  src?: string;
  size?: number;
}) {
  const initials = name
    .split(/\s+/)
    .filter((w) => /[A-Za-z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  if (src) {
    return (
      <Image
        src={src}
        alt=""
        width={size}
        height={size}
        className="rounded-full bg-surface object-contain"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className="inline-flex items-center justify-center rounded-full border border-white/25 bg-white/10 font-bold text-white"
      style={{ width: size, height: size, fontSize: size / 2.8 }}
    >
      {initials || '—'}
    </span>
  );
}

// ---------------------------------------------------------------------------
// The hero fixture
// ---------------------------------------------------------------------------

export interface MatchSide {
  readonly name: string;
  readonly crestUrl?: string;
}

export interface FeaturedMatch {
  readonly slug: string;
  readonly competition?: string;
  readonly category: string;
  readonly sides: readonly MatchSide[];
  readonly startsAtLabel: string;
  readonly timeLabel: string;
  readonly venueName: string;
  readonly venueCity?: string;
  readonly priceLabel?: string;
}

/**
 * The headline fixture. Crest, VS, crest — centred, and equal on both sides.
 *
 * The two sides are rendered from one array with identical markup rather than
 * as "home" and "away", so neither can accidentally be given more weight. The
 * domain has no home side either.
 */
export function StadiiMatchHero({ match }: { match: FeaturedMatch }) {
  const [left, right] = match.sides;

  return (
    <section className="relative overflow-hidden rounded-[20px] bg-brand text-ink-inverse">
      {/* A restrained wash rather than a photograph: the crests are the subject
          and a busy stadium shot behind them would fight for the same space. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(120%_100%_at_50%_0%,rgba(51,102,153,0.55),transparent_60%)]"
      />

      <div className="relative px-md py-lg sm:px-lg sm:py-xl">
        <div className="flex items-center justify-between gap-sm">
          <CategoryBadge label={match.category} />
          {match.competition ? (
            <p className="text-body font-medium text-white/80">{match.competition}</p>
          ) : null}
        </div>

        <div className="mt-lg grid grid-cols-[1fr_auto_1fr] items-center gap-sm sm:gap-lg">
          <MatchSideBlock side={left} />
          <span className="rounded-md bg-white/10 px-sm py-xs text-body-lg font-extrabold tracking-widest">
            VS
          </span>
          <MatchSideBlock side={right} />
        </div>

        <dl className="mt-lg flex flex-wrap items-center justify-center gap-x-lg gap-y-sm text-body text-white/85">
          <div className="flex items-center gap-xs">
            <Icon name="calendar" className="h-4 w-4" />
            <dt className="sr-only">Kick-off</dt>
            <dd>
              {match.startsAtLabel} · {match.timeLabel}
            </dd>
          </div>
          <div className="flex items-center gap-xs">
            <Icon name="stadium" className="h-4 w-4" />
            <dt className="sr-only">Venue</dt>
            <dd>
              {match.venueName}
              {match.venueCity ? `, ${match.venueCity}` : ''}
            </dd>
          </div>
        </dl>

        <div className="mt-lg flex flex-col items-center gap-sm sm:flex-row sm:justify-center">
          <Link
            href={routes.event(match.slug)}
            className="inline-flex h-12 w-full items-center justify-center gap-xs rounded-xl bg-action px-lg text-body-lg font-semibold text-on-action transition-colors hover:bg-action-600 sm:w-auto"
          >
            Get tickets <span aria-hidden="true">→</span>
          </Link>
          {match.priceLabel ? (
            <p className="text-body text-white/80">From {match.priceLabel}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function MatchSideBlock({ side }: { side?: MatchSide }) {
  if (!side) return <div />;
  return (
    <div className="flex flex-col items-center gap-sm text-center">
      <Crest name={side.name} src={side.crestUrl} size={80} />
      <p className="text-body-lg font-bold uppercase tracking-wide">{side.name}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Event cards
// ---------------------------------------------------------------------------

export interface EventCardData {
  readonly slug: string;
  readonly title: string;
  readonly category: string;
  readonly venueName: string;
  readonly venueCity?: string;
  readonly startsAtLabel: string;
  readonly timeLabel: string;
  readonly priceLabel?: string;
  readonly imageUrl?: string;
  /** Two sides means a fixture, and a fixture is drawn as one. */
  readonly sides?: readonly MatchSide[];
}

export function StadiiEventCard({ event }: { event: EventCardData }) {
  const isMatch = (event.sides?.length ?? 0) === 2;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg border border-outline-subtle bg-surface shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-brand">
        {isMatch ? (
          <div className="flex h-full items-center justify-center gap-md px-md">
            <Crest name={event.sides![0]!.name} src={event.sides![0]!.crestUrl} size={56} />
            <span className="text-body font-extrabold tracking-widest text-white/80">VS</span>
            <Crest name={event.sides![1]!.name} src={event.sides![1]!.crestUrl} size={56} />
          </div>
        ) : event.imageUrl ? (
          <Image
            src={event.imageUrl}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 320px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-white/50">
            <Icon name="calendar" className="h-8 w-8" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-xs p-md">
        <CategoryBadge label={event.category} />
        <h3 className="text-body-lg font-bold leading-snug text-ink">
          <Link href={routes.event(event.slug)} className="hover:underline">
            {event.title}
          </Link>
        </h3>

        <p className="flex items-center gap-xs text-body text-ink-muted">
          <Icon name="stadium" className="h-4 w-4 shrink-0" />
          {event.venueName}
        </p>
        <p className="flex items-center gap-xs text-body text-ink-muted">
          <Icon name="calendar" className="h-4 w-4 shrink-0" />
          {event.startsAtLabel} · {event.timeLabel}
        </p>

        {event.priceLabel ? (
          <p className="mt-xs text-body font-semibold text-info-700">From {event.priceLabel}</p>
        ) : null}

        <Link
          href={routes.event(event.slug)}
          className="mt-auto inline-flex h-11 items-center justify-center gap-xs rounded-xl bg-action px-md text-body font-semibold text-on-action transition-colors hover:bg-action-600"
        >
          Book now <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------------
// Stadium cards
// ---------------------------------------------------------------------------

export interface StadiumCardData {
  readonly slug: string;
  readonly name: string;
  readonly locality?: string;
  readonly capacity?: number;
  readonly imageUrl?: string;
}

export function StadiiStadiumCard({ stadium }: { stadium: StadiumCardData }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg border border-outline-subtle bg-surface shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-brand-800">
        {stadium.imageUrl ? (
          <Image
            src={stadium.imageUrl}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 280px"
            className="object-cover"
          />
        ) : (
          // No stock photography stands in for a real ground. The research pack
          // records source pages rather than image rights, and the Review Notes
          // require licensing to be confirmed before public use.
          <div className="flex h-full items-center justify-center text-white/40">
            <Icon name="stadium" className="h-10 w-10" />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-xs p-md">
        <h3 className="text-body-lg font-bold text-ink">
          <Link href={routes.venue(stadium.slug)} className="hover:underline">
            {stadium.name}
          </Link>
        </h3>
        {stadium.locality ? (
          <p className="flex items-center gap-xs text-body text-ink-muted">
            <Icon name="stadium" className="h-4 w-4 shrink-0" />
            {stadium.locality}
          </p>
        ) : null}
        {stadium.capacity ? (
          <p className="text-caption text-ink-subtle">
            Capacity {stadium.capacity.toLocaleString('en-KE')}
          </p>
        ) : null}
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------------
// Right-panel widgets
// ---------------------------------------------------------------------------

export function StadiiQuickActions() {
  const actions = [
    {
      icon: 'ticket' as const,
      title: 'Book tickets',
      detail: 'Find your next event',
      href: routes.events(),
    },
    {
      icon: 'search' as const,
      title: 'Scan at entry',
      detail: 'Quick and secure access',
      href: routes.howItWorks(),
    },
    {
      icon: 'shield' as const,
      title: 'Safe and trusted',
      detail: 'Every ticket checked at the gate',
      href: routes.help(),
    },
  ];

  return (
    <div className="rounded-lg border border-outline-subtle bg-surface p-md shadow-sm">
      <Image
        src="/brand/logo-landscape.png"
        alt="STADII"
        width={900}
        height={226}
        className="h-8 w-auto"
      />
      <ul className="mt-md space-y-xs p-0">
        {actions.map((action) => (
          <li key={action.title}>
            <Link
              href={action.href}
              className="flex items-center gap-sm rounded-xl px-sm py-sm transition-colors hover:bg-surface-sunken"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-action-50 text-action">
                <Icon name={action.icon} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-body font-semibold text-ink">{action.title}</span>
                <span className="block text-caption text-ink-muted">{action.detail}</span>
              </span>
              <span aria-hidden="true" className="text-ink-subtle">
                ›
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function StadiiPromoCard({
  title,
  body,
  ctaLabel,
  href,
}: {
  title: ReactNode;
  body: string;
  ctaLabel: string;
  href: string;
}) {
  return (
    <div className="overflow-hidden rounded-lg bg-brand p-md text-ink-inverse shadow-sm">
      <p className="text-title font-bold leading-tight">{title}</p>
      <p className="mt-xs text-body text-white/75">{body}</p>
      <Link
        href={href}
        className="mt-md inline-flex h-11 items-center justify-center gap-xs rounded-xl bg-action px-md text-body font-semibold text-on-action transition-colors hover:bg-action-600"
      >
        {ctaLabel} <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}

export interface UpcomingItem {
  readonly slug: string;
  readonly day: string;
  readonly month: string;
  readonly title: string;
  readonly venueName: string;
}

export function StadiiUpcomingEvents({ items }: { items: readonly UpcomingItem[] }) {
  return (
    <div className="rounded-lg border border-outline-subtle bg-surface p-md shadow-sm">
      <SectionHeader title="Upcoming" href={routes.events()} />
      {items.length === 0 ? (
        <p className="text-body text-ink-muted">
          Nothing scheduled yet. Fixtures appear here as organisers publish them.
        </p>
      ) : (
        <ul className="space-y-px p-0">
          {items.map((item) => (
            <li key={item.slug}>
              <Link
                href={routes.event(item.slug)}
                className="flex items-center gap-sm rounded-xl px-xs py-sm transition-colors hover:bg-surface-sunken"
              >
                <span className="flex w-10 shrink-0 flex-col items-center rounded-lg bg-surface-sunken py-xs">
                  <span className="text-body-lg font-bold leading-none text-ink">{item.day}</span>
                  <span className="text-caption uppercase text-ink-subtle">{item.month}</span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-body font-semibold text-ink">
                    {item.title}
                  </span>
                  <span className="block truncate text-caption text-ink-muted">
                    {item.venueName}
                  </span>
                </span>
                <span aria-hidden="true" className="text-ink-subtle">
                  ›
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
