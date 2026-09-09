import type { Metadata } from 'next';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { CardGrid, PageIntro, StadiiTeamCard } from '@/components/cards';
import { LoadedList } from '@/components/loaded';
import { StadiiShell } from '@/components/shell';
import { kindLabel } from '@/lib/format/participants';
import { listParticipants, listUpcomingEvents } from '@/lib/firestore/queries';
import { tally, upcomingLabel } from '@/lib/present/counts';
import { buildMetadata } from '@/lib/seo/metadata';
import { routes } from '@/lib/routes';

export const revalidate = 900;

export const metadata: Metadata = buildMetadata({
  title: 'Teams, clubs and athletes',
  description:
    'Everyone who appears on a STADII event: teams, clubs, individual athletes and organisations, across every sport.',
  path: routes.teams(),
});

/**
 * One catalogue, four kinds.
 *
 * Teams, clubs, athletes and organizations live in a single `participants`
 * collection discriminated by `kind` (ADR-0004 and the Participant model). This
 * page is called "Teams" because that is what most visitors are looking for; it
 * lists all four, and each card says which it is.
 */
export default async function TeamsPage() {
  const [participants, events] = await Promise.all([
    listParticipants({ limit: 200 }),
    listUpcomingEvents({ limit: 200 }),
  ]);
  const counts = tally(events.data);

  return (
    <StadiiShell active={routes.teams()}>
      <PageIntro
        title="Teams and athletes"
        lede="Teams, clubs, athletes and organisations that appear on STADII events."
        crumbs={
          <Breadcrumbs
            onDark
            crumbs={[
              { name: 'Home', path: routes.home() },
              { name: 'Teams & athletes', path: routes.teams() },
            ]}
          />
        }
      />

      <LoadedList
        result={participants}
        what="teams and athletes"
        emptyTitle="Nobody is listed yet"
        emptyBody="Teams, clubs and athletes appear here as organisers add them to the catalogue."
      >
        {(items) => (
          <>
            <p className="mb-md text-body text-ink-muted">
              {items.length === 1 ? '1 team or athlete' : `${items.length} teams and athletes`}
              {' · '}
              {upcomingLabel(counts.total, 'fixture')}
            </p>
            <CardGrid>
            {items.map((participant) => (
              <li key={String(participant.id)} className="h-full">
                <StadiiTeamCard
                  team={{
                    slug: String(participant.slug),
                    name: participant.displayName,
                    kindLabel: kindLabel(participant.kind),
                    crestUrl: participant.crestUrl,
                    countryCode: participant.countryCode,
                    eventCount: counts.byParticipant.get(String(participant.id)),
                  }}
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
