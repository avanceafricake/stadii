import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { EventCardGrid } from '@/components/event-card';
import { LoadedList } from '@/components/loaded';
import { PageIntro } from '@/components/cards';
import { Section, SectionHeading } from '@/components/primitives';
import { StadiiShell } from '@/components/shell';
import { UnavailableState } from '@/components/states';
import {
  getCompetitionBySlug,
  getSportById,
  listUpcomingEvents,
} from '@/lib/firestore/queries';
import { buildMetadata } from '@/lib/seo/metadata';
import { parseSlug, routes } from '@/lib/routes';

export const revalidate = 300;

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const slug = parseSlug((await params).slug);
  const competition = slug ? (await getCompetitionBySlug(slug)).data : null;
  if (!competition) {
    return buildMetadata({
      title: 'Competition not found',
      description: 'This competition is not listed on STADII.',
      path: routes.competitions(),
      noindex: true,
    });
  }
  return buildMetadata({
    title: competition.name,
    description: `Fixtures and tickets for ${competition.name} on STADII, with venues, ticket categories and published prices.`,
    path: routes.competition(competition.slug),
  });
}

export default async function CompetitionPage({ params }: Params) {
  const slug = parseSlug((await params).slug);
  if (!slug) notFound();

  const result = await getCompetitionBySlug(slug);
  const competition = result.data;

  if (!competition) {
    if (result.unavailable) {
      return (
          <Section>
            <UnavailableState what="this competition" />
          </Section>
      );
    }
    notFound();
  }

  const [events, sport] = await Promise.all([
    listUpcomingEvents({ competitionId: competition.id }),
    getSportById(competition.sportId),
  ]);

  return (
    <StadiiShell active={routes.competitions()}>
      <PageIntro
        title={competition.name}
        lede={competition.format?.toLowerCase().replace(/_/g, ' ')}
        crumbs={
          <Breadcrumbs
            crumbs={[
              { name: 'Home', path: routes.home() },
              { name: 'Competitions', path: routes.competitions() },
              { name: competition.name, path: routes.competition(competition.slug) },
            ]}
          />
        }
      />

      {sport.data ? (
        <p className="mb-lg text-body text-ink-muted">
          Part of{' '}
          <Link
            href={routes.sport(sport.data.slug)}
            className="font-medium text-info-700 underline"
          >
            {sport.data.name}
          </Link>
        </p>
      ) : null}
        <Section labelledBy="competition-events">
          <SectionHeading id="competition-events">Fixtures</SectionHeading>
          <LoadedList
            result={events}
            what="fixtures in this competition"
            emptyTitle="No fixtures published"
            emptyBody={`Nothing is currently published for ${competition.name}.`}
          >
            {(items) => <EventCardGrid events={items} />}
          </LoadedList>
        </Section>
    </StadiiShell>
  );
}
