import Link from 'next/link';
import type { Metadata } from 'next';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { EventCardGrid } from '@/components/event-card';
import { PageIntro } from '@/components/cards';
import { Card, Section, SectionHeading } from '@/components/primitives';
import { StadiiShell } from '@/components/shell';
import { EmptyState, UnavailableState } from '@/components/states';
import { searchCatalogue } from '@/lib/data/search';
import { kindLabel } from '@/lib/format/participants';
import { buildMetadata } from '@/lib/seo/metadata';
import { routes } from '@/lib/routes';

// Rendered per request: the result depends entirely on the query string.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = buildMetadata({
  title: 'Search',
  description: 'Search events, sports, teams, athletes, competitions and venues on STADII.',
  path: routes.search(),
  // A search results page is thin, duplicative content. It is useful to a
  // person and worthless in an index.
  noindex: true,
});

function ResultLinks({
  heading,
  items,
}: {
  heading: string;
  items: readonly { key: string; href: string; label: string; detail?: string }[];
}) {
  if (items.length === 0) return null;
  return (
    <Section labelledBy={`search-${heading}`}>
      <SectionHeading id={`search-${heading}`}>{heading}</SectionHeading>
      <ul className="grid list-none gap-md p-0 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Card as="li" key={item.key}>
            <h3 className="text-body-lg font-semibold">
              <Link href={item.href} className="hover:text-brand-700">
                {item.label}
              </Link>
            </h3>
            {item.detail ? (
              <p className="mt-xs text-caption uppercase tracking-wide text-ink-subtle">
                {item.detail}
              </p>
            ) : null}
          </Card>
        ))}
      </ul>
    </Section>
  );
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const raw = (await searchParams).q;
  const q = Array.isArray(raw) ? raw[0] : raw;
  const results = await searchCatalogue(q);

  return (
    <StadiiShell active={routes.search()}>
      <PageIntro
        title="Search"
        lede="Events, sports, teams and athletes, competitions and venues."
        crumbs={
          <Breadcrumbs
            onDark
            crumbs={[
              { name: 'Home', path: routes.home() },
              { name: 'Search', path: routes.search() },
            ]}
          />
        }
      />

      {/* A plain GET form. No JavaScript is required to search this site. */}
      <form action={routes.search()} method="get" role="search" className="mb-lg flex max-w-prose gap-sm">
          <label htmlFor="q" className="sr-only">
            Search STADII
          </label>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={results.query}
            placeholder="A team, a stadium, a competition…"
            autoComplete="off"
            className="w-full rounded-md border border-outline bg-surface px-md py-sm text-body-lg text-ink placeholder:text-ink-subtle"
          />
        <button
          type="submit"
          className="rounded-md bg-action px-lg py-sm text-body-lg font-semibold text-on-action hover:bg-action-600"
        >
          Search
        </button>
      </form>

      {results.query.length < 2 ? (
          <Section>
            <EmptyState
              title="Type at least two characters"
              body="Search matches names of events, teams and athletes, competitions, venues and sports."
            />
          </Section>
        ) : results.unavailable ? (
          <Section>
            <UnavailableState what="search results" />
          </Section>
        ) : results.total === 0 ? (
          <Section>
            <EmptyState
              title={`Nothing matched “${results.query}”`}
              body="Search looks for the words as you typed them. Try a shorter phrase, or browse events by sport."
            />
          </Section>
        ) : (
          <>
            <p className="pt-lg text-body text-ink-muted" role="status">
              {results.total} {results.total === 1 ? 'result' : 'results'} for “{results.query}”
            </p>

            {results.events.length > 0 ? (
              <Section labelledBy="search-events">
                <SectionHeading id="search-events">Events</SectionHeading>
                <EventCardGrid events={results.events} />
              </Section>
            ) : null}

            <ResultLinks
              heading="Teams and athletes"
              items={results.participants.map((p) => ({
                key: p.id,
                href: routes.team(p.slug),
                label: p.displayName,
                detail: kindLabel(p.kind),
              }))}
            />
            <ResultLinks
              heading="Competitions"
              items={results.competitions.map((c) => ({
                key: c.id,
                href: routes.competition(c.slug),
                label: c.name,
              }))}
            />
            <ResultLinks
              heading="Venues"
              items={results.venues.map((v) => ({
                key: v.id,
                href: routes.venue(v.slug),
                label: v.name,
                detail: v.address?.city,
              }))}
            />
            <ResultLinks
              heading="Sports"
              items={results.sports.map((s) => ({
                key: s.id,
                href: routes.sport(s.slug),
                label: s.name,
              }))}
            />
          </>
        )}
    </StadiiShell>
  );
}
