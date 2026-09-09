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
import { StatusBadge } from './event-status';
import { RemoteImage } from './remote-image';
import { cx } from './primitives';
import type { AxisPresentation } from '@/lib/format/status';
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
      <RemoteImage
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
  /**
   * Anything about this event that is NOT the ordinary case — postponed,
   * cancelled, sales suspended. Empty for a normal on-sale fixture, and the
   * emptiness is the signal that all is well (`noteworthyAxes`).
   *
   * The card was showing none of this. A cancelled match looked exactly like a
   * match you could still buy a ticket for.
   */
  readonly notices?: readonly AxisPresentation[];
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
          <RemoteImage
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
        <div className="flex flex-wrap items-center gap-xs">
          <CategoryBadge label={event.category} />
          {event.notices?.map((axis) => (
            <StatusBadge key={axis.axis} axis={axis} />
          ))}
        </div>
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
  /** One sentence. The rest lives on the stadium's own page. */
  readonly blurb?: string;
}

export function StadiiStadiumCard({ stadium }: { stadium: StadiumCardData }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg border border-outline-subtle bg-surface shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-brand-800">
        {stadium.imageUrl ? (
          <RemoteImage
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
        {stadium.blurb ? (
          // Clamped rather than truncated in the presenter alone, so a long
          // first sentence cannot make one card in a grid taller than its
          // neighbours.
          <p className="line-clamp-2 text-body text-ink-muted">{stadium.blurb}</p>
        ) : null}
        {stadium.capacity ? (
          <p className="mt-auto pt-xs text-caption text-ink-subtle">
            Capacity {stadium.capacity.toLocaleString('en-KE')}
          </p>
        ) : null}
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------------
// Team cards
// ---------------------------------------------------------------------------

export interface TeamCardData {
  readonly slug: string;
  readonly name: string;
  /** "Club", "Athlete", "National team" — what this actually is. */
  readonly kindLabel: string;
  readonly crestUrl?: string;
  readonly countryCode?: string;
}

/**
 * A club, an athlete, a national side or an organisation.
 *
 * One catalogue, four kinds (ADR-0004), so the card says which it is rather
 * than letting a reader assume everything on this page is a football club. The
 * crest sits on the brand ground because that is where the initials fallback
 * is legible, and the fallback is what most of the catalogue will show on day
 * one.
 */
export function StadiiTeamCard({ team }: { team: TeamCardData }) {
  return (
    <article className="flex h-full items-center gap-md overflow-hidden rounded-lg border border-outline-subtle bg-surface p-md shadow-sm transition-shadow hover:shadow-md">
      <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand">
        <Crest name={team.name} src={team.crestUrl} size={56} />
      </span>
      <div className="min-w-0">
        <h3 className="text-body-lg font-bold leading-snug text-ink">
          <Link href={routes.team(team.slug)} className="hover:underline">
            {team.name}
          </Link>
        </h3>
        <p className="mt-[2px] text-caption uppercase tracking-wide text-ink-subtle">
          {[team.kindLabel, team.countryCode].filter(Boolean).join(' · ')}
        </p>
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

// ---------------------------------------------------------------------------
// Page intro
// ---------------------------------------------------------------------------

/**
 * The top of an inner page: trail, title, one line of explanation.
 *
 * Inner pages used a full-bleed `PageHeader` above the content while the
 * homepage put everything inside the shell. That is two page templates on one
 * site, and it showed the moment you clicked from Home to Events — the sidebar
 * appeared and disappeared. This lives inside the shell's content column, so
 * every page has the same frame around it.
 */
export function PageIntro({
  title,
  lede,
  crumbs,
  actions,
}: {
  title: string;
  lede?: string;
  crumbs?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-lg">
      {crumbs ? <div className="mb-sm">{crumbs}</div> : null}
      <div className="flex flex-wrap items-end justify-between gap-md">
        <div className="min-w-0">
          <h1 className="text-headline font-bold tracking-tight text-ink">{title}</h1>
          {lede ? <p className="mt-xs max-w-prose text-body-lg text-ink-muted">{lede}</p> : null}
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
    </header>
  );
}

/**
 * A responsive grid for cards. Column counts are fixed here rather than per
 * page, because five pages each choosing their own is how a design system
 * stops being one.
 */
export function CardGrid({
  children,
  columns = 3,
}: {
  children: ReactNode;
  columns?: 2 | 3 | 4;
}) {
  return (
    <ul
      className={cx(
        'grid list-none gap-md p-0 sm:grid-cols-2',
        // Only `main` flexes, so on a wide monitor it is the card grid that
        // inherits the extra room. A fourth column at 2xl keeps a card about
        // the size it is in the approved design instead of letting three cards
        // stretch to 420px each.
        columns === 3 && 'xl:grid-cols-3 2xl:grid-cols-4',
        columns === 4 && 'lg:grid-cols-3 xl:grid-cols-4',
      )}
    >
      {children}
    </ul>
  );
}

// ---------------------------------------------------------------------------
// Editorial hero
// ---------------------------------------------------------------------------

/**
 * A photograph and a piece of writing about the same thing, side by side.
 *
 * Both halves are optional and neither is padded out when the other is
 * missing, because most of the catalogue will have one, the other, or neither
 * for a long time:
 *
 *   both      — image left, prose right on a wide screen; stacked on a phone
 *   text only — prose across the full width, no empty picture frame
 *   image only— the photograph across the full width
 *   neither   — nothing at all, and the page reads as if it never expected one
 *
 * The "neither" case is the one that matters. A grey rectangle labelled "no
 * image available" is a page telling a visitor about its own database, and a
 * stadium with no photograph is not a worse stadium.
 */
export function EditorialHero({
  imageUrl,
  imageAlt = '',
  description,
  facts,
}: {
  imageUrl?: string;
  imageAlt?: string;
  description?: string;
  /** Short label/value pairs shown under the prose — capacity, county, sports. */
  facts?: readonly { readonly label: string; readonly value: string }[];
}) {
  const hasText = Boolean(description) || (facts?.length ?? 0) > 0;
  if (!imageUrl && !hasText) return null;

  const prose = hasText ? (
    <div className="min-w-0">
      {description ? (
        // Paragraph breaks are honoured so an operator can write more than one.
        <div className="space-y-sm">
          {description
            .split(/\n{2,}/)
            .map((para) => para.trim())
            .filter(Boolean)
            .map((para, index) => (
              <p key={index} className="max-w-prose text-body-lg leading-relaxed text-ink-muted">
                {para}
              </p>
            ))}
        </div>
      ) : null}

      {facts && facts.length > 0 ? (
        <dl className="mt-md grid grid-cols-2 gap-md sm:grid-cols-3">
          {facts.map((fact) => (
            <div key={fact.label}>
              <dt className="text-caption font-semibold uppercase tracking-wide text-ink-subtle">
                {fact.label}
              </dt>
              <dd className="mt-[2px] text-body-lg font-semibold text-ink">{fact.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </div>
  ) : null;

  const picture = imageUrl ? (
    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg border border-outline-subtle bg-brand-800">
      <RemoteImage
        src={imageUrl}
        alt={imageAlt}
        fill
        sizes="(max-width: 1024px) 100vw, 480px"
        className="object-cover"
      />
    </div>
  ) : null;

  if (picture && prose) {
    return (
      <section className="mb-lg grid gap-lg lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:items-start">
        {picture}
        {prose}
      </section>
    );
  }

  return <section className="mb-lg">{picture ?? prose}</section>;
}

// ---------------------------------------------------------------------------
// The event page hero
// ---------------------------------------------------------------------------

export interface EventHeroData {
  readonly title: string;
  readonly subtitle?: string;
  readonly category?: string;
  readonly competition?: string;
  readonly sides?: readonly MatchSide[];
  readonly imageUrl?: string;
  readonly dateLabel: string;
  readonly timeLabel: string;
  readonly timezoneLabel?: string;
  readonly gatesLabel?: string;
  readonly venueName: string;
  readonly venueCity?: string;
  readonly venueHref?: string;
  readonly notices?: readonly AxisPresentation[];
}

/**
 * The top of an event page, drawn the way the event actually is.
 *
 * A fixture leads with its two sides, exactly as it does on its card and on the
 * home hero — the same event must not look like a different event on the page
 * you clicked through to. Anything else leads with its own artwork, and with
 * neither it leads with its title on the brand ground rather than with a grey
 * placeholder.
 *
 * The stored `title` is always the headline text. An event title is never
 * composed from participants (see the Event model), which is what lets "Kenya
 * National Swimming Championships" be a first-class name instead of a special
 * case in a formatter.
 */
export function EventHero({ event, action }: { event: EventHeroData; action?: ReactNode }) {
  const isMatch = (event.sides?.length ?? 0) === 2;

  return (
    <section className="mb-lg overflow-hidden rounded-lg bg-brand text-ink-inverse">
      <div className="relative">
        {!isMatch && event.imageUrl ? (
          <div className="relative aspect-[21/9] w-full">
            <RemoteImage
              src={event.imageUrl}
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 900px"
              className="object-cover"
            />
            {/* A scrim, so the title over any photograph stays readable. */}
            <div className="absolute inset-0 bg-gradient-to-t from-brand via-brand/40 to-transparent" />
          </div>
        ) : null}

        <div className={cx('px-lg py-xl', !isMatch && event.imageUrl && 'relative -mt-xxl')}>
          {(event.competition || event.category) && (
            <p className="text-caption font-semibold uppercase tracking-widest text-white/70">
              {[event.competition, event.category].filter(Boolean).join(' · ')}
            </p>
          )}

          {isMatch ? (
            <div className="mt-lg flex items-start justify-center gap-lg sm:gap-xl">
              <MatchSideBlock side={event.sides![0]} />
              <span className="mt-[1.75rem] rounded-md bg-white/10 px-sm py-xs text-body font-extrabold tracking-widest text-white/85">
                VS
              </span>
              <MatchSideBlock side={event.sides![1]} />
            </div>
          ) : (
            <h1 className="mt-sm max-w-3xl text-headline font-bold tracking-tight">
              {event.title}
            </h1>
          )}

          {event.subtitle ? (
            <p className={cx('max-w-prose text-body-lg text-white/75', isMatch ? 'mt-lg text-center' : 'mt-xs')}>
              {event.subtitle}
            </p>
          ) : null}

          {event.notices && event.notices.length > 0 ? (
            <ul
              className={cx('mt-md flex flex-wrap gap-xs p-0', isMatch && 'justify-center')}
              aria-label="Event status"
            >
              {event.notices.map((axis) => (
                <li key={axis.axis}>
                  <span className="inline-flex items-baseline gap-xs rounded-pill bg-white/12 px-sm py-xs text-caption font-medium text-white">
                    <span className="font-normal opacity-75">{axis.axis}:</span>
                    {axis.label}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}

          <dl className="mt-lg grid gap-md border-t border-white/15 pt-lg sm:grid-cols-3">
            <div>
              <dt className="text-caption font-semibold uppercase tracking-wide text-white/55">
                Date
              </dt>
              <dd className="mt-xs text-body-lg font-medium">{event.dateLabel}</dd>
            </div>
            <div>
              <dt className="text-caption font-semibold uppercase tracking-wide text-white/55">
                Start
              </dt>
              <dd className="mt-xs text-body-lg font-medium">
                {event.timeLabel}{' '}
                {event.timezoneLabel ? (
                  <span className="text-white/65">{event.timezoneLabel}</span>
                ) : null}
                {event.gatesLabel ? (
                  <span className="mt-xs block text-body text-white/65">{event.gatesLabel}</span>
                ) : null}
              </dd>
            </div>
            <div>
              <dt className="text-caption font-semibold uppercase tracking-wide text-white/55">
                Venue
              </dt>
              <dd className="mt-xs text-body-lg font-medium">
                {event.venueHref ? (
                  <Link href={event.venueHref} className="underline-offset-4 hover:underline">
                    {event.venueName}
                  </Link>
                ) : (
                  event.venueName
                )}
                {event.venueCity ? (
                  <span className="mt-xs block text-body text-white/65">{event.venueCity}</span>
                ) : null}
              </dd>
            </div>
          </dl>

          {action ? <div className="mt-lg">{action}</div> : null}
        </div>
      </div>
    </section>
  );
}
