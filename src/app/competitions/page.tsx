import type { Metadata } from 'next';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { LoadedList } from '@/components/loaded';
import { CardGrid, PageIntro, StadiiCategoryCard } from '@/components/cards';
import { StadiiShell } from '@/components/shell';
import { listCompetitions, listUpcomingEvents } from '@/lib/firestore/queries';
import { tally, upcomingLabel } from '@/lib/present/counts';
import { buildMetadata } from '@/lib/seo/metadata';
import { routes } from '@/lib/routes';

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: 'Competitions',
  description:
    'Leagues, cups, meets and series running on STADII across Kenya and East Africa.',
  path: routes.competitions(),
});

export default async function CompetitionsPage() {
  const [competitions, events] = await Promise.all([
    listCompetitions(),
    listUpcomingEvents({ limit: 200 }),
  ]);
  const counts = tally(events.data);

  return (
    <StadiiShell active={routes.competitions()}>
      <PageIntro
        title="Competitions"
        lede="Leagues, knockouts, meets and friendly series. An event may belong to one, or to none."
        crumbs={
          <Breadcrumbs
            onDark
            crumbs={[
              { name: 'Home', path: routes.home() },
              { name: 'Competitions', path: routes.competitions() },
            ]}
          />
        }
      />

          <LoadedList
            result={competitions}
            what="the list of competitions"
            emptyTitle="No competitions listed yet"
            emptyBody="Competitions appear here once an organiser sets one up."
          >
            {(items) => (
              <>
                <p className="mb-md text-body text-ink-muted">
                  {items.length === 1 ? '1 competition' : `${items.length} competitions`}
                  {' · '}
                  {upcomingLabel(counts.total, 'fixture')}
                </p>
                <CardGrid columns={4}>
                  {items.map((competition) => (
                    <li key={String(competition.id)} className="h-full">
                      <StadiiCategoryCard
                        href={routes.competition(competition.slug)}
                        name={competition.name}
                        detail={competition.format?.toLowerCase().replace(/_/g, ' ')}
                        icon="trophy"
                        noun="fixture"
                        eventCount={counts.byCompetition.get(String(competition.id))}
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
