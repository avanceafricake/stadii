/**
 * How many upcoming events there are, per stadium, sport, team and competition.
 *
 * STADII sells events. A sports page that lists thirteen sports and says
 * nothing about what is on is a taxonomy, not a shop — a visitor cannot tell
 * football (four fixtures) from diving (none) until they have clicked into
 * both. These counts are what make an index page answer "is there anything
 * here for me" before the click.
 *
 * ONE READ, counted in memory. The obvious implementation — a count query per
 * row — is sixteen reads on the stadiums page and grows with the catalogue.
 * Every event document already carries its venue, its sport, its competition
 * and its participants, so the same list the page and the right-hand panel
 * already fetch answers all four questions. `listUpcomingEvents` is wrapped in
 * React `cache()`, so a page that also renders the events themselves pays once.
 *
 * The number is UPCOMING events, not events ever. That is the honest thing to
 * count on a page whose purpose is buying a ticket: a stadium that hosted forty
 * matches last season and has none scheduled has nothing to sell today, and
 * saying "40" would be a promise the catalogue cannot keep. The label at every
 * call site says "upcoming" for the same reason.
 */

import type { Event } from '@stadii/shared-models';

export interface EventCounts {
  /** Total events in the window — the figure a page header quotes. */
  readonly total: number;
  readonly byVenue: ReadonlyMap<string, number>;
  readonly bySport: ReadonlyMap<string, number>;
  readonly byCompetition: ReadonlyMap<string, number>;
  readonly byParticipant: ReadonlyMap<string, number>;
}

export const NO_COUNTS: EventCounts = {
  total: 0,
  byVenue: new Map(),
  bySport: new Map(),
  byCompetition: new Map(),
  byParticipant: new Map(),
};

function bump(into: Map<string, number>, key: unknown): void {
  if (typeof key !== 'string' || key === '') return;
  into.set(key, (into.get(key) ?? 0) + 1);
}

export function tally(events: readonly Event[]): EventCounts {
  const byVenue = new Map<string, number>();
  const bySport = new Map<string, number>();
  const byCompetition = new Map<string, number>();
  const byParticipant = new Map<string, number>();

  for (const event of events) {
    bump(byVenue, event.venueId);
    bump(bySport, event.sportId);
    bump(byCompetition, event.competitionId);

    // A participant is counted once per event however many times it appears,
    // so a hypothetical malformed fixture listing a club twice cannot inflate
    // that club's number.
    const seen = new Set<string>();
    for (const participant of event.participantSummaries ?? []) {
      const id = participant.participantId;
      if (typeof id !== 'string' || seen.has(id)) continue;
      seen.add(id);
      bump(byParticipant, id);
    }
  }

  return { total: events.length, byVenue, bySport, byCompetition, byParticipant };
}

/**
 * "3 events", "1 event", "No events yet".
 *
 * Zero gets words rather than a nought. "0 events" on a stadium card reads as a
 * data error; "No events yet" reads as a stadium nobody has scheduled anything
 * at, which is what it is.
 */
export function eventCountLabel(count: number | undefined): string {
  if (!count) return 'No events yet';
  return count === 1 ? '1 event' : `${count} events`;
}

/** The same figure for a page header, where the window matters more. */
export function upcomingLabel(count: number, noun = 'event'): string {
  if (count === 0) return `No upcoming ${noun}s`;
  return count === 1 ? `1 upcoming ${noun}` : `${count} upcoming ${noun}s`;
}
