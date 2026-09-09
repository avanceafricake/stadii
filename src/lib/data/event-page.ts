import { cache } from 'react';
import type {
  Competition,
  Event,
  Participant,
  Sport,
  TicketType,
  Venue,
  VenueArea,
} from '@stadii/shared-models';

import type { ParticipantView } from '@/components/participants';
import {
  getCompetitionById,
  getEventBySlug,
  getSportById,
  getParticipantsByIds,
  getVenueById,
  listEventParticipants,
  listTicketTypes,
  listVenueRootAreas,
} from '@/lib/firestore/queries';

export interface EventPageData {
  readonly event: Event | null;
  readonly unavailable: boolean;
  readonly participants: readonly ParticipantView[];
  readonly ticketTypes: readonly TicketType[];
  readonly venue: Venue | null;
  readonly venueAreas: readonly VenueArea[];
  readonly sport: Sport | null;
  readonly competition: Competition | null;
}

const EMPTY: EventPageData = {
  event: null,
  unavailable: false,
  participants: [],
  ticketTypes: [],
  venue: null,
  venueAreas: [],
  sport: null,
  competition: null,
};

/**
 * Everything an event page needs, in one memoised call.
 *
 * `generateMetadata` and the page component both need the event, and React's
 * `cache` makes that one Firestore read rather than two. Every dependent read
 * is issued in parallel and every one of them may fail independently — a venue
 * document that will not load costs the page its directions panel and nothing
 * else.
 *
 * The event's participants subcollection is AUTHORITATIVE; the
 * `participantSummaries` array on the event document is capped display copy.
 * The subcollection is therefore what is read here, and the full participant
 * records are fetched on top of it so that each one can be linked by slug and
 * typed correctly in JSON-LD (a summary carries neither).
 */
export const loadEventPage = cache(async (slug: string): Promise<EventPageData> => {
  const eventResult = await getEventBySlug(slug);
  const event = eventResult.data;
  if (!event) {
    return { ...EMPTY, unavailable: eventResult.unavailable };
  }

  const [eventParticipants, ticketTypes, venue, sport, competition] = await Promise.all([
    listEventParticipants(event.id),
    listTicketTypes(event.id),
    getVenueById(event.venueId),
    getSportById(event.sportId),
    event.competitionId ? getCompetitionById(event.competitionId) : Promise.resolve(null),
  ]);

  const ordered = [...eventParticipants.data].sort(
    (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0),
  );

  const records = await getParticipantsByIds(ordered.map((p) => p.participantId));
  const byId = new Map<string, Participant>(records.data.map((p) => [p.id as string, p]));

  const fromSubcollection: ParticipantView[] = ordered.map((entry) => {
    const record = byId.get(entry.participantId as string);
    return {
      id: entry.id as string,
      name: record?.displayName ?? entry.summary?.displayName ?? 'Participant',
      shortName: record?.shortName ?? entry.summary?.shortName,
      crestUrl: record?.crestUrl ?? entry.summary?.crestUrl,
      role: entry.role,
      kind: record?.kind,
      slug: record?.slug,
    };
  });

  /**
   * The denormalised copy, when the subcollection has nothing.
   *
   * The subcollection stays authoritative — it is what carries roles and
   * display order, and it is what the JSON-LD is built from. But an event whose
   * subcollection was never written still has `participantSummaries`, and the
   * page was then drawing "Gor Mahia vs AFC Leopards" in its hero and
   * "participants have not been announced" underneath it. A page that
   * contradicts itself in two adjacent blocks is worse than either answer.
   *
   * Nothing is invented here: the summaries were written by the backend from
   * the same participants. They simply carry no slug, so these entries do not
   * link anywhere — which is honest, because without the record there is no
   * page to link to.
   */
  const fromSummaries: ParticipantView[] = (event.participantSummaries ?? []).map((summary) => {
    const record = byId.get(summary.participantId as string);
    return {
      id: summary.participantId as string,
      name: record?.displayName ?? summary.displayName,
      shortName: record?.shortName ?? summary.shortName,
      crestUrl: record?.crestUrl ?? summary.crestUrl,
      role: summary.role,
      kind: record?.kind,
      slug: record?.slug,
    };
  });

  const participants =
    fromSubcollection.length > 0 ? fromSubcollection : fromSummaries;

  const venueAreas = venue.data ? await listVenueRootAreas(venue.data.id) : null;

  return {
    event,
    unavailable: false,
    participants,
    ticketTypes: ticketTypes.data,
    venue: venue.data,
    venueAreas: venueAreas?.data ?? [],
    sport: sport.data,
    competition: competition?.data ?? null,
  };
});
