import type { Metadata } from 'next';
import Link from 'next/link';

import {
  SectionHeader,
  StadiiEventCard,
  StadiiMatchHero,
  StadiiPromoCard,
  StadiiQuickActions,
  StadiiStadiumCard,
  StadiiUpcomingEvents,
} from '@/components/cards';
import { StadiiShell } from '@/components/shell';
import { listSports, listUpcomingEvents, listVenues } from '@/lib/firestore/queries';
import {
  isMatch,
  toEventCard,
  toFeaturedMatch,
  toStadiumCard,
  toUpcomingItem,
} from '@/lib/present/home';
import { buildMetadata } from '@/lib/seo/metadata';
import { routes } from '@/lib/routes';
import { site } from '@/lib/site';

export const revalidate = 300;

export const metadata: Metadata = buildMetadata({
  title: `${site.name} — ${site.tagline}`,
  description: site.description,
  path: '/',
});

export default async function HomePage() {
  const [events, sports, venues] = await Promise.all([
    listUpcomingEvents({ limit: 12 }),
    listSports(),
    listVenues(),
  ]);

  const sportNameById = new Map(sports.data.map((s) => [String(s.id), s.name]));
  const categoryFor = (event: { sportId: unknown }) =>
    sportNameById.get(String(event.sportId)) ?? 'Event';

  // The headline is the soonest FIXTURE, because a confrontation is what a
  // discovery page leads with. If nothing upcoming has two sides, the hero is
  // simply omitted rather than filled with an event pretending to be one.
  const featured = events.data.find(isMatch);
  const rest = events.data.filter((e) => e !== featured).slice(0, 4);

  const aside = (
    <>
      <StadiiQuickActions />
      <StadiiPromoCard
        title={
          <>
            Football
            <br />
            is back
          </>
        }
        body="Follow a club and hear about its fixtures the moment they go on sale."
        ctaLabel="Browse football"
        href={routes.sports()}
      />
      <StadiiUpcomingEvents items={events.data.slice(0, 5).map(toUpcomingItem)} />
    </>
  );

  return (
    <StadiiShell aside={aside} active={routes.home()}>
      {featured ? (
        <StadiiMatchHero match={toFeaturedMatch(featured, categoryFor)} />
      ) : (
        <WelcomePanel />
      )}

      <section className="mt-xl">
        <SectionHeader title="Featured events" href={routes.events()} />
        {rest.length === 0 ? (
          <EmptyPanel
            title="No events are listed yet"
            body="Nothing has been published for sale at the moment. Organisers publish fixtures as they are confirmed."
            ctaLabel="Browse stadiums"
            href={routes.venues()}
          />
        ) : (
          <div className="grid gap-md sm:grid-cols-2 xl:grid-cols-3">
            {rest.map((event) => (
              <StadiiEventCard key={String(event.id)} event={toEventCard(event, categoryFor)} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-xl">
        <SectionHeader title="Top stadiums" href={routes.venues()} />
        {venues.data.length === 0 ? (
          <EmptyPanel
            title="No stadiums listed yet"
            body="Venues appear here once an operator has set one up on STADII."
          />
        ) : (
          <div className="grid gap-md sm:grid-cols-2 xl:grid-cols-4">
            {venues.data.slice(0, 4).map((venue) => (
              <StadiiStadiumCard key={String(venue.id)} stadium={toStadiumCard(venue)} />
            ))}
          </div>
        )}
      </section>

      {sports.data.length > 0 ? (
        <section className="mt-xl">
          <SectionHeader title="By sport" href={routes.sports()} />
          <ul className="flex flex-wrap gap-xs p-0">
            {sports.data.map((sport) => (
              <li key={String(sport.id)}>
                <Link
                  href={routes.sport(String(sport.slug))}
                  className="inline-flex rounded-pill border border-outline bg-surface px-md py-sm text-body font-medium text-ink transition-colors hover:border-action-400 hover:text-action-700"
                >
                  {sport.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </StadiiShell>
  );
}

/** Shown when nothing upcoming is a fixture — the page still has to say what STADII is. */
function WelcomePanel() {
  return (
    <section className="overflow-hidden rounded-[20px] bg-brand px-md py-xl text-ink-inverse sm:px-xl">
      <p className="text-caption font-semibold uppercase tracking-widest text-white/70">
        {site.tagline}
      </p>
      <h1 className="mt-sm max-w-[18ch] text-headline font-bold leading-tight tracking-tight">
        Every fixture, meet and championship worth turning up for.
      </h1>
      <p className="mt-md max-w-prose text-body-lg text-white/80">
        Browse what is on across Kenya and East Africa, see the venue and the ticket categories the
        organiser published, then get your tickets in the STADII app.
      </p>
      <div className="mt-lg flex flex-wrap gap-sm">
        <Link
          href={routes.events()}
          className="inline-flex h-12 items-center justify-center rounded-xl bg-action px-lg text-body-lg font-semibold text-on-action transition-colors hover:bg-action-600"
        >
          Browse events
        </Link>
        <Link
          href={routes.howItWorks()}
          className="inline-flex h-12 items-center justify-center rounded-xl border border-white/30 px-lg text-body-lg font-semibold text-ink-inverse transition-colors hover:bg-white/10"
        >
          How STADII works
        </Link>
      </div>
    </section>
  );
}

function EmptyPanel({
  title,
  body,
  ctaLabel,
  href,
}: {
  title: string;
  body: string;
  ctaLabel?: string;
  href?: string;
}) {
  return (
    <div className="rounded-lg border border-outline-subtle bg-surface p-xl text-center shadow-sm">
      <p className="text-body-lg font-semibold text-ink">{title}</p>
      <p className="mx-auto mt-xs max-w-prose text-body text-ink-muted">{body}</p>
      {ctaLabel && href ? (
        <Link
          href={href}
          className="mt-md inline-flex h-11 items-center justify-center rounded-xl border border-outline-strong bg-surface px-lg text-body font-semibold text-ink transition-colors hover:bg-surface-sunken"
        >
          {ctaLabel}
        </Link>
      ) : null}
    </div>
  );
}
