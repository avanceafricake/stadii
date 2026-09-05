import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { EventCardGrid } from '@/components/event-card';
import { LoadedList } from '@/components/loaded';
import { Card, Container, PageHeader, Section, SectionHeading } from '@/components/primitives';
import { UnavailableState } from '@/components/states';
import {
  getSportBySlug,
  listCompetitions,
  listParticipants,
  listUpcomingEvents,
} from '@/lib/firestore/queries';
import { buildMetadata } from '@/lib/seo/metadata';
import { parseSlug, routes } from '@/lib/routes';

export const revalidate = 300;

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const slug = parseSlug((await params).slug);
  const sport = slug ? (await getSportBySlug(slug)).data : null;
  if (!sport) {
    return buildMetadata({
      title: 'Sport not found',
      description: 'This sport is not listed on STADII.',
      path: routes.sports(),
      noindex: true,
    });
  }
  return buildMetadata({
    title: `${sport.name} events`,
    description: `Upcoming ${sport.name} fixtures and meets on STADII, with venues, ticket categories and published prices.`,
    path: routes.sport(sport.slug),
  });
}

export default async function SportPage({ params }: Params) {
  const slug = parseSlug((await params).slug);
  if (!slug) notFound();

  const sportResult = await getSportBySlug(slug);
  const sport = sportResult.data;

  if (!sport) {
    if (sportResult.unavailable) {
      return (
        <Container>
          <Section>
            <UnavailableState what="this sport" />
          </Section>
        </Container>
      );
    }
    notFound();
  }

  const [events, participants, competitions] = await Promise.all([
    listUpcomingEvents({ sportId: sport.id }),
    listParticipants({ sportId: sport.id, limit: 60 }),
    listCompetitions({ sportId: sport.id }),
  ]);

  return (
    <>
      <PageHeader title={sport.name} lede={`Upcoming ${sport.name.toLowerCase()} on STADII.`}>
        <div className="mt-md">
          <Breadcrumbs
            crumbs={[
              { name: 'Home', path: routes.home() },
              { name: 'Sports', path: routes.sports() },
              { name: sport.name, path: routes.sport(sport.slug) },
            ]}
          />
        </div>
      </PageHeader>

      <Container>
        <Section labelledBy="sport-events">
          <SectionHeading id="sport-events">Coming up</SectionHeading>
          <LoadedList
            result={events}
            what={`upcoming ${sport.name.toLowerCase()} events`}
            emptyTitle="Nothing scheduled yet"
            emptyBody={`No ${sport.name.toLowerCase()} events are published at the moment.`}
          >
            {(items) => <EventCardGrid events={items} />}
          </LoadedList>
        </Section>

        <Section labelledBy="sport-competitions">
          <SectionHeading id="sport-competitions">Competitions</SectionHeading>
          <LoadedList
            result={competitions}
            what="competitions in this sport"
            emptyTitle="No competitions listed"
            emptyBody="Leagues, cups and meets appear here once they are set up."
          >
            {(items) => (
              <ul className="grid list-none gap-md p-0 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((competition) => (
                  <Card as="li" key={competition.id}>
                    <h3 className="text-body-lg font-semibold">
                      <Link
                        href={routes.competition(competition.slug)}
                        className="hover:text-brand-700"
                      >
                        {competition.name}
                      </Link>
                    </h3>
                  </Card>
                ))}
              </ul>
            )}
          </LoadedList>
        </Section>

        <Section labelledBy="sport-participants">
          <SectionHeading id="sport-participants">Teams and athletes</SectionHeading>
          <LoadedList
            result={participants}
            what="teams and athletes in this sport"
            emptyTitle="Nobody listed yet"
            emptyBody="Teams, clubs and athletes appear here once they are added to the catalogue."
          >
            {(items) => (
              <ul className="flex list-none flex-wrap gap-sm p-0">
                {items.map((participant) => (
                  <li key={participant.id}>
                    <Link
                      href={routes.team(participant.slug)}
                      className="inline-flex rounded-pill border border-outline bg-surface px-md py-sm text-body font-medium text-ink hover:border-brand-400 hover:text-brand-700"
                    >
                      {participant.displayName}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </LoadedList>
        </Section>
      </Container>
    </>
  );
}
