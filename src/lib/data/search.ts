import type { Competition, Event, Participant, Sport, Venue } from '@stadii/shared-models';

import {
  listCompetitions,
  listParticipants,
  listSports,
  listUpcomingEvents,
  listVenues,
} from '@/lib/firestore/queries';

/**
 * Categorised search.
 *
 * HOW IT WORKS, AND WHAT IT IS NOT: Firestore has no full-text search. What
 * this does is fetch the catalogue pages this site already reads and match
 * substrings over them, in memory, on the server. That is honest for a
 * catalogue of the size STADII has today — a few hundred participants, a
 * handful of venues — and it is not a search engine.
 *
 * The two limits worth knowing:
 *
 *  - only events inside the indexed page of upcoming public events are
 *    searched, so a fixture six months out may not match;
 *  - matching is substring, not fuzzy, so a typo finds nothing.
 *
 * Fixing this properly means an external index (Algolia, Typesense) or a
 * backend-maintained `searchTerms` array on each document. Both are backend
 * changes, and both are written up in this app's README rather than
 * approximated here.
 */

export interface SearchResults {
  readonly query: string;
  readonly events: readonly Event[];
  readonly sports: readonly Sport[];
  readonly participants: readonly Participant[];
  readonly competitions: readonly Competition[];
  readonly venues: readonly Venue[];
  readonly total: number;
  readonly unavailable: boolean;
}

export function normaliseQuery(raw: string | undefined): string {
  return (raw ?? '').replace(/\s+/g, ' ').trim().slice(0, 100);
}

function matches(query: string, ...fields: (string | undefined)[]): boolean {
  const needle = query.toLowerCase();
  return fields.some((field) => (field ?? '').toLowerCase().includes(needle));
}

export async function searchCatalogue(rawQuery: string | undefined): Promise<SearchResults> {
  const query = normaliseQuery(rawQuery);
  const empty: SearchResults = {
    query,
    events: [],
    sports: [],
    participants: [],
    competitions: [],
    venues: [],
    total: 0,
    unavailable: false,
  };

  if (query.length < 2) return empty;

  const [events, sports, participants, competitions, venues] = await Promise.all([
    listUpcomingEvents(),
    listSports(),
    listParticipants({ limit: 200 }),
    listCompetitions(),
    listVenues(),
  ]);

  const unavailable =
    events.unavailable &&
    sports.unavailable &&
    participants.unavailable &&
    competitions.unavailable &&
    venues.unavailable;

  const matchedEvents = events.data.filter((event) =>
    matches(
      query,
      event.title,
      event.subtitle,
      event.venueSummary?.name,
      event.venueSummary?.city,
      ...(event.participantSummaries ?? []).map((p) => p.displayName),
    ),
  );
  const matchedSports = sports.data.filter((sport) => matches(query, sport.name));
  const matchedParticipants = participants.data.filter((participant) =>
    matches(query, participant.displayName, participant.shortName),
  );
  const matchedCompetitions = competitions.data.filter((competition) =>
    matches(query, competition.name),
  );
  const matchedVenues = venues.data.filter((venue) =>
    matches(query, venue.name, venue.address?.city, venue.address?.county),
  );

  return {
    query,
    events: matchedEvents.slice(0, 24),
    sports: matchedSports.slice(0, 12),
    participants: matchedParticipants.slice(0, 24),
    competitions: matchedCompetitions.slice(0, 12),
    venues: matchedVenues.slice(0, 12),
    total:
      matchedEvents.length +
      matchedSports.length +
      matchedParticipants.length +
      matchedCompetitions.length +
      matchedVenues.length,
    unavailable,
  };
}
