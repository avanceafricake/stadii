import Link from 'next/link';
import type { Metadata } from 'next';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { LoadedList } from '@/components/loaded';
import { Card, Container, PageHeader, Section } from '@/components/primitives';
import { kindLabel } from '@/lib/format/participants';
import { listParticipants } from '@/lib/firestore/queries';
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
  const participants = await listParticipants({ limit: 200 });

  return (
    <>
      <PageHeader
        title="Teams and athletes"
        lede="Teams, clubs, athletes and organisations that appear on STADII events."
      >
        <div className="mt-md">
          <Breadcrumbs
            crumbs={[
              { name: 'Home', path: routes.home() },
              { name: 'Teams & athletes', path: routes.teams() },
            ]}
          />
        </div>
      </PageHeader>

      <Container>
        <Section>
          <LoadedList
            result={participants}
            what="teams and athletes"
            emptyTitle="Nobody is listed yet"
            emptyBody="Teams, clubs and athletes appear here as organisers add them to the catalogue."
          >
            {(items) => (
              <ul className="grid list-none gap-md p-0 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((participant) => (
                  <Card as="li" key={participant.id}>
                    <h2 className="text-body-lg font-semibold">
                      <Link
                        href={routes.team(participant.slug)}
                        className="hover:text-brand-700"
                      >
                        {participant.displayName}
                      </Link>
                    </h2>
                    <p className="mt-xs text-caption uppercase tracking-wide text-ink-subtle">
                      {[kindLabel(participant.kind), participant.countryCode]
                        .filter(Boolean)
                        .join(' · ')}
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
