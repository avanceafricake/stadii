import type { Metadata } from 'next';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { EventCardGrid } from '@/components/event-card';
import { LoadedList } from '@/components/loaded';
import { ButtonLink, Container, PageHeader, Section } from '@/components/primitives';
import { listUpcomingEvents } from '@/lib/firestore/queries';
import { buildMetadata } from '@/lib/seo/metadata';
import { routes } from '@/lib/routes';

export const revalidate = 300;

export const metadata: Metadata = buildMetadata({
  title: 'Upcoming events',
  description:
    'Every published event on STADII, soonest first — league fixtures, cup ties, athletics meets and championships across Kenya and East Africa.',
  path: routes.events(),
});

export default async function EventsPage() {
  const events = await listUpcomingEvents();

  return (
    <>
      <PageHeader
        title="Upcoming events"
        lede="Published events, soonest first. Times are shown in the stadium's local time."
      >
        <div className="mt-md">
          <Breadcrumbs
            crumbs={[
              { name: 'Home', path: routes.home() },
              { name: 'Events', path: routes.events() },
            ]}
          />
        </div>
      </PageHeader>

      <Container>
        <Section>
          <LoadedList
            result={events}
            what="upcoming events"
            emptyTitle="Nothing is on sale right now"
            emptyBody="No events have been published for the period ahead. Organisers publish fixtures as they are confirmed."
            emptyAction={
              <ButtonLink href={routes.sports()} tone="secondary">
                Browse by sport
              </ButtonLink>
            }
          >
            {(items) => (
              <>
                <p className="mb-md text-body text-ink-muted">
                  {items.length === 1 ? '1 event' : `${items.length} events`}
                </p>
                <EventCardGrid events={items} />
              </>
            )}
          </LoadedList>
        </Section>
      </Container>
    </>
  );
}
