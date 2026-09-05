import Link from 'next/link';
import type { Metadata } from 'next';

import { EventCardGrid } from '@/components/event-card';
import { LoadedList } from '@/components/loaded';
import { ButtonLink, Card, Container, Section, SectionHeading } from '@/components/primitives';
import { listSports, listUpcomingEvents } from '@/lib/firestore/queries';
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
  const [events, sports] = await Promise.all([
    listUpcomingEvents({ limit: 9 }),
    listSports(),
  ]);

  return (
    <>
      <section className="border-b border-outline-subtle bg-brand text-ink-inverse">
        <Container className="py-xxl">
          <p className="text-caption font-semibold uppercase tracking-widest opacity-80">
            {site.tagline}
          </p>
          <h1 className="mt-sm max-w-prose text-headline font-bold tracking-tight sm:text-display">
            Every fixture, meet and championship worth turning up for.
          </h1>
          <p className="mt-md max-w-prose text-body-lg opacity-90">
            Browse what is on across Kenya and East Africa, see the venue and the ticket
            categories the organiser published, then get your tickets in the STADII app.
          </p>
          <div className="mt-lg flex flex-wrap gap-sm">
            <ButtonLink href={routes.events()} tone="secondary">
              Browse events
            </ButtonLink>
            <ButtonLink href={routes.howItWorks()} tone="secondary">
              How STADII works
            </ButtonLink>
          </div>
        </Container>
      </section>

      <Container>
        <Section labelledBy="home-upcoming">
          <SectionHeading
            id="home-upcoming"
            action={
              <Link
                href={routes.events()}
                className="text-body font-medium text-brand-700 underline"
              >
                All events
              </Link>
            }
          >
            Coming up
          </SectionHeading>

          <LoadedList
            result={events}
            what="upcoming events"
            emptyTitle="No events are listed yet"
            emptyBody="Nothing has been published for sale at the moment. Check back soon, or follow a team to hear first."
            emptyAction={
              <ButtonLink href={routes.teams()} tone="secondary">
                Browse teams and athletes
              </ButtonLink>
            }
          >
            {(items) => <EventCardGrid events={items} />}
          </LoadedList>
        </Section>

        <Section labelledBy="home-sports">
          <SectionHeading
            id="home-sports"
            action={
              <Link
                href={routes.sports()}
                className="text-body font-medium text-brand-700 underline"
              >
                All sports
              </Link>
            }
          >
            By sport
          </SectionHeading>

          <LoadedList
            result={sports}
            what="the list of sports"
            emptyTitle="No sports are listed yet"
            emptyBody="Sports appear here as organisers publish events on STADII."
          >
            {(items) => (
              <ul className="flex list-none flex-wrap gap-sm p-0">
                {items.slice(0, 12).map((sport) => (
                  <li key={sport.id}>
                    <Link
                      href={routes.sport(sport.slug)}
                      className="inline-flex rounded-pill border border-outline bg-surface px-md py-sm text-body font-medium text-ink hover:border-brand-400 hover:text-brand-700"
                    >
                      {sport.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </LoadedList>
        </Section>

        <Section labelledBy="home-promise">
          <SectionHeading id="home-promise">What you can count on</SectionHeading>
          <div className="grid gap-md sm:grid-cols-3">
            <Card>
              <h3 className="text-body-lg font-semibold text-ink">One ticket, one person</h3>
              <p className="mt-sm text-body text-ink-muted">
                Every ticket is its own admission credential with its own code. Buy five and
                you get five, each of which can be sent to a different person.
              </p>
            </Card>
            <Card>
              <h3 className="text-body-lg font-semibold text-ink">Prices as published</h3>
              <p className="mt-sm text-body text-ink-muted">
                The price you see is the price the organiser set for that ticket category.
                Any booking fee is shown and confirmed before you pay.
              </p>
            </Card>
            <Card>
              <h3 className="text-body-lg font-semibold text-ink">Checked at the gate</h3>
              <p className="mt-sm text-body text-ink-muted">
                Admission is decided when your code is scanned, online, at the turnstile —
                which is what stops a screenshot getting somebody in twice.
              </p>
            </Card>
          </div>
        </Section>
      </Container>
    </>
  );
}
