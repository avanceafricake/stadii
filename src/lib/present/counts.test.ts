/**
 * The counts are what turn an index page into a shop.
 *
 * These tests are mostly about not lying. A count that is wrong on a stadium
 * card sends someone to a page with nothing on it, and a count that says "0"
 * where it means "we did not look" is worse than showing nothing at all.
 */

import { describe, expect, it } from 'vitest';

import type { Event } from '@stadii/shared-models';

import { eventCountLabel, tally, upcomingLabel } from './counts';

// Loose on purpose. Ids in the model are branded types; a test that has to
// construct branded ids to check arithmetic is testing the type system.
type TestEvent = Record<string, unknown>;

const anEvent = (over: TestEvent = {}): Event =>
  ({
    id: 'evt_1',
    venueId: 'ven_kasarani',
    sportId: 'spt_football',
    competitionId: 'cmp_fkf',
    participantSummaries: [
      { participantId: 'par_gor', displayName: 'Gor Mahia' },
      { participantId: 'par_afc', displayName: 'AFC Leopards' },
    ],
    ...over,
  }) as unknown as Event;

describe('one pass over the events answers every index page', () => {
  it('counts per venue, sport, competition and participant', () => {
    const counts = tally([
      anEvent(),
      anEvent({ id: 'evt_2', venueId: 'ven_nyayo', sportId: 'spt_rugby' }),
    ]);

    expect(counts.total).toBe(2);
    expect(counts.byVenue.get('ven_kasarani')).toBe(1);
    expect(counts.byVenue.get('ven_nyayo')).toBe(1);
    expect(counts.bySport.get('spt_football')).toBe(1);
    expect(counts.bySport.get('spt_rugby')).toBe(1);
    expect(counts.byCompetition.get('cmp_fkf')).toBe(2);
    // Both fixtures feature both clubs in this fixture set.
    expect(counts.byParticipant.get('par_gor')).toBe(2);
  });

  it('counts a participant once per event, however often it is listed', () => {
    // A malformed fixture naming the same club twice must not double its
    // number on the teams page.
    const counts = tally([
      anEvent({
        participantSummaries: [
          { participantId: 'par_gor', displayName: 'Gor Mahia' },
          { participantId: 'par_gor', displayName: 'Gor Mahia' },
        ],
      }),
    ]);
    expect(counts.byParticipant.get('par_gor')).toBe(1);
  });

  it('ignores an event with no competition rather than counting an empty key', () => {
    // Most events belong to no competition. A friendly is not a league fixture.
    const counts = tally([anEvent({ competitionId: undefined })]);
    expect(counts.byCompetition.size).toBe(0);
    expect(counts.total).toBe(1);
  });

  it('survives an event with no participants at all', () => {
    // An athletics meet may list none until the heats are drawn (ADR-0004).
    const counts = tally([anEvent({ participantSummaries: undefined })]);
    expect(counts.byParticipant.size).toBe(0);
    expect(counts.bySport.get('spt_football')).toBe(1);
  });

  it('an empty catalogue counts to zero rather than throwing', () => {
    expect(tally([]).total).toBe(0);
  });
});

describe('a count nobody has is words, not a nought', () => {
  it('says nothing is scheduled rather than "0 events"', () => {
    // "0 events" on a card reads as a data error. "No events yet" reads as a
    // stadium nobody has scheduled anything at, which is what it is.
    expect(eventCountLabel(0)).toBe('No events yet');
    expect(eventCountLabel(undefined)).toBe('No events yet');
  });

  it('gets the singular right', () => {
    expect(eventCountLabel(1)).toBe('1 event');
    expect(eventCountLabel(4)).toBe('4 events');
  });

  it('names the window in a page header, and the noun it is counting', () => {
    expect(upcomingLabel(0)).toBe('No upcoming events');
    expect(upcomingLabel(1)).toBe('1 upcoming event');
    expect(upcomingLabel(3, 'fixture')).toBe('3 upcoming fixtures');
  });
});
