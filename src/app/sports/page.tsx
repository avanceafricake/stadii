import type { Metadata } from 'next';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { LoadedList } from '@/components/loaded';
import { CardGrid, PageIntro, StadiiCategoryCard } from '@/components/cards';
import { sportIconName } from '@/components/icons';
import { StadiiShell } from '@/components/shell';
import { listSports, listUpcomingEvents } from '@/lib/firestore/queries';
import { tally, upcomingLabel } from '@/lib/present/counts';
import { buildMetadata } from '@/lib/seo/metadata';
import { routes } from '@/lib/routes';

export const revalidate = 900;

export const metadata: Metadata = buildMetadata({
  title: 'Sports on STADII',
  description:
    'Every sport with events on STADII. Football, rugby, athletics, swimming and whatever an organiser publishes next.',
  path: routes.sports(),
});

/**
 * Sports are DATA.
 *
 * There is no hard-coded list of sports anywhere in this codebase. A new sport
 * appears here the moment it appears in the `sports` collection, which is what
 * makes an athletics meet and a swimming championship first-class rather than
 * special cases bolted onto a football model.
 */
export default async function SportsPage() {
  const [sports, events] = await Promise.all([
    listSports(),
    listUpcomingEvents({ limit: 200 }),
  ]);
  const counts = tally(events.data);

  return (
    <StadiiShell active={routes.sports()}>
      <PageIntro
        title="Sports"
        lede="Everything organisers are running on STADII. Pick one to see what is coming up."
        crumbs={
          <Breadcrumbs
            onDark
            crumbs={[
              { name: 'Home', path: routes.home() },
              { name: 'Sports', path: routes.sports() },
            ]}
          />
        }
      />

          <LoadedList
            result={sports}
            what="the list of sports"
            emptyTitle="No sports are listed yet"
            emptyBody="Sports appear here as soon as an organiser publishes an event in one."
          >
            {(items) => (
              <>
                <p className="mb-md text-body text-ink-muted">
                  {items.length === 1 ? '1 sport' : `${items.length} sports`}
                  {' · '}
                  {upcomingLabel(counts.total)}
                </p>
                <CardGrid columns={4}>
                  {items.map((sport) => (
                    <li key={String(sport.id)} className="h-full">
                      <StadiiCategoryCard
                        href={routes.sport(sport.slug)}
                        name={sport.name}
                        icon={sportIconName(String(sport.slug))}
                        eventCount={counts.bySport.get(String(sport.id))}
                      />
                    </li>
                  ))}
                </CardGrid>
              </>
            )}
          </LoadedList>
    </StadiiShell>
  );
}
