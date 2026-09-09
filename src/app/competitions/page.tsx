import Link from 'next/link';
import type { Metadata } from 'next';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { LoadedList } from '@/components/loaded';
import { CardGrid, PageIntro } from '@/components/cards';
import { Card } from '@/components/primitives';
import { StadiiShell } from '@/components/shell';
import { listCompetitions } from '@/lib/firestore/queries';
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
  const competitions = await listCompetitions();

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
              <CardGrid>
                {items.map((competition) => (
                  <Card as="li" key={competition.id}>
                    <h2 className="text-body-lg font-semibold">
                      <Link
                        href={routes.competition(competition.slug)}
                        className="hover:text-brand-700"
                      >
                        {competition.name}
                      </Link>
                    </h2>
                    <p className="mt-xs text-caption uppercase tracking-wide text-ink-subtle">
                      {competition.format?.toLowerCase().replace(/_/g, ' ')}
                    </p>
                  </Card>
                ))}
              </CardGrid>
            )}
          </LoadedList>
    </StadiiShell>
  );
}
