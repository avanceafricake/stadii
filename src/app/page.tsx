import type { Metadata } from 'next';
import Link from 'next/link';

import {
  CardGrid,
  SectionHeader,
  StadiiEventCard,
  StadiiMatchHero,
  StadiiStadiumCard,
} from '@/components/cards';
import { StadiiShell } from '@/components/shell';
import { listSports, listUpcomingEvents, listVenues } from '@/lib/firestore/queries';
import {
  categoryResolver,
  isMatch,
  toEventCard,
  toFeaturedMatch,
  toStadiumCard,
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

  const categoryFor = categoryResolver(sports.data);

  // The headline is the soonest FIXTURE, because a confrontation is what a
  // discovery page leads with. If nothing upcoming has two sides, the hero is
  // simply omitted rather than filled with an event pretending to be one.
  const featured = events.data.find(isMatch);
  // The featured fixture appears in the row below as well, as it does in the
  // approved design. It is not a duplicate by accident: the hero is a promotion
  // and the row is the list, and a reader scanning the row for what is on
  // should not find the biggest match of the week missing from it.
  const rest = events.data.slice(0, 4);

  // No `aside` here. The homepage used to compose its own copy of the standing
  // panel, which is how the two drifted: it said "Browse football" while every
  // other page said "View football events". The shell supplies one panel now.
  return (
    <StadiiShell active={routes.home()}>
      {featured ? (
        <StadiiMatchHero match={toFeaturedMatch(featured, categoryFor)} />
      ) : (
        <WelcomePanel />
      )}

      <section className="mt-section">
        <SectionHeader title="Featured events" href={routes.events()} />
        {rest.length === 0 ? (
          <EmptyPanel
            title="No events are listed yet"
            body="Nothing has been published for sale at the moment. Organisers publish fixtures as they are confirmed."
            ctaLabel="Browse stadiums"
            href={routes.venues()}
          />
        ) : (
          <CardGrid columns={4}>
            {rest.map((event) => (
              <li key={String(event.id)} className="h-full">
                <StadiiEventCard event={toEventCard(event, categoryFor)} />
              </li>
            ))}
          </CardGrid>
        )}
      </section>

      <section className="mt-section">
        <SectionHeader title="Top stadiums" href={routes.venues()} />
        {venues.data.length === 0 ? (
          <EmptyPanel
            title="No stadiums listed yet"
            body="Venues appear here once an operator has set one up on STADII."
          />
        ) : (
          <CardGrid columns={4}>
            {venues.data.slice(0, 4).map((venue) => (
              <li key={String(venue.id)} className="h-full">
                <StadiiStadiumCard stadium={toStadiumCard(venue)} />
              </li>
            ))}
          </CardGrid>
        )}
      </section>

      {sports.data.length > 0 ? (
        <section className="mt-section">
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
