import Link from 'next/link';
import type { Metadata } from 'next';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { LoadedList } from '@/components/loaded';
import { Card, Container, PageHeader, Section } from '@/components/primitives';
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
    <>
      <PageHeader
        title="Competitions"
        lede="Leagues, knockouts, meets and friendly series. An event may belong to one, or to none."
      >
        <div className="mt-md">
          <Breadcrumbs
            crumbs={[
              { name: 'Home', path: routes.home() },
              { name: 'Competitions', path: routes.competitions() },
            ]}
          />
        </div>
      </PageHeader>

      <Container>
        <Section>
          <LoadedList
            result={competitions}
            what="the list of competitions"
            emptyTitle="No competitions listed yet"
            emptyBody="Competitions appear here once an organiser sets one up."
          >
            {(items) => (
              <ul className="grid list-none gap-md p-0 sm:grid-cols-2 lg:grid-cols-3">
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
              </ul>
            )}
          </LoadedList>
        </Section>
      </Container>
    </>
  );
}
