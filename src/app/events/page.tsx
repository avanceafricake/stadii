import type { Metadata } from 'next';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { CardGrid, PageIntro, StadiiEventCard } from '@/components/cards';
import { LoadedList } from '@/components/loaded';
import { ButtonLink } from '@/components/primitives';
import { StadiiShell } from '@/components/shell';
import { listSports, listUpcomingEvents } from '@/lib/firestore/queries';
import { categoryResolver, toEventCard } from '@/lib/present/home';
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
  const [events, sports] = await Promise.all([listUpcomingEvents(), listSports()]);

  const categoryFor = categoryResolver(sports.data);

  return (
    <StadiiShell active={routes.events()}>
      <PageIntro
        title="Upcoming events"
        lede="Published events, soonest first. Times are shown in the stadium's local time."
        crumbs={
          <Breadcrumbs
            onDark
            crumbs={[
              { name: 'Home', path: routes.home() },
              { name: 'Events', path: routes.events() },
            ]}
          />
        }
      />

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
            <CardGrid columns={4}>
              {items.map((event) => (
                <li key={String(event.id)} className="h-full">
                  <StadiiEventCard event={toEventCard(event, categoryFor)} />
                </li>
              ))}
            </CardGrid>
          </>
        )}
      </LoadedList>
    </StadiiShell>
  );
}
