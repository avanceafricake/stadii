import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { EventCardGrid } from '@/components/event-card';
import { LoadedList } from '@/components/loaded';
import { PageIntro } from '@/components/cards';
import { Section, SectionHeading } from '@/components/primitives';
import { StadiiShell } from '@/components/shell';
import { UnavailableState } from '@/components/states';
import { kindLabel } from '@/lib/format/participants';
import { getParticipantBySlug, listUpcomingEvents } from '@/lib/firestore/queries';
import { buildMetadata } from '@/lib/seo/metadata';
import { parseSlug, routes } from '@/lib/routes';

export const revalidate = 300;

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const slug = parseSlug((await params).slug);
  const participant = slug ? (await getParticipantBySlug(slug)).data : null;
  if (!participant) {
    return buildMetadata({
      title: 'Not found',
      description: 'This team or athlete is not listed on STADII.',
      path: routes.teams(),
      noindex: true,
    });
  }
  return buildMetadata({
    title: participant.displayName,
    description: `Upcoming events featuring ${participant.displayName} on STADII, with venues, ticket categories and published prices.`,
    path: routes.team(participant.slug),
    image: participant.crestUrl,
    imageAlt: participant.displayName,
  });
}

/**
 * A participant's upcoming events.
 *
 * KNOWN LIMIT, stated rather than hidden: an event document carries
 * `participantSummaries` (an array of objects) but no flat array of participant
 * IDs, and Firestore cannot filter on a field inside an array of objects. The
 * event's participants subcollection cannot be searched either — a collection
 * group query on `participants` would collide with the top-level `participants`
 * collection of the same name, and `firestore.rules` has no collection-group
 * rule for it.
 *
 * So the filter is applied in memory over the indexed page of upcoming public
 * events. That is correct but bounded: a participant whose next fixture falls
 * outside that page will not appear here. The backend change that fixes it — a
 * denormalised `participantIds` array plus one composite index — is written up
 * in this app's README.
 */
export default async function TeamPage({ params }: Params) {
  const slug = parseSlug((await params).slug);
  if (!slug) notFound();

  const result = await getParticipantBySlug(slug);
  const participant = result.data;

  if (!participant) {
    if (result.unavailable) {
      return (
          <Section>
            <UnavailableState what="this team or athlete" />
          </Section>
      );
    }
    notFound();
  }

  const events = await listUpcomingEvents({ participantId: participant.id });

  const detail = [
    kindLabel(participant.kind),
    participant.countryCode,
    participant.club?.foundedYear ? `Founded ${participant.club.foundedYear}` : '',
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <StadiiShell active={routes.teams()}>
      <PageIntro title={participant.displayName} lede={detail}
        crumbs={
          <Breadcrumbs
            crumbs={[
              { name: 'Home', path: routes.home() },
              { name: 'Teams & athletes', path: routes.teams() },
              { name: participant.displayName, path: routes.team(participant.slug) },
            ]}
          />
        }
      />
        <Section labelledBy="team-events">
          <SectionHeading id="team-events">Coming up</SectionHeading>
          <LoadedList
            result={events}
            what="upcoming events"
            emptyTitle="No upcoming events"
            emptyBody={`Nothing featuring ${participant.displayName} is published at the moment.`}
          >
            {(items) => <EventCardGrid events={items} />}
          </LoadedList>
        </Section>
    </StadiiShell>
  );
}
