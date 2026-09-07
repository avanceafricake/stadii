/**
 * How an event is drawn follows from what it IS.
 *
 * The design asks for crest–VS–crest on a fixture and an image on everything
 * else. That is not a styling preference: the domain has N participants and no
 * home side (ADR-0004), so an athletics meet genuinely has no opposition, and
 * a card that invents one is telling the reader something untrue.
 */

import { describe, expect, it } from 'vitest';

import { isMatch, toEventCard, toUpcomingItem } from './home';

type TestEvent = Parameters<typeof toEventCard>[0];

const KICK_OFF = Date.UTC(2026, 8, 19, 13, 0, 0); // 16:00 in Africa/Nairobi

function anEvent(over: Partial<TestEvent> = {}): TestEvent {
  return {
    id: 'evt_1',
    slug: 'gor-mahia-vs-afc-leopards',
    title: 'Gor Mahia vs AFC Leopards',
    sportId: 'spt_football',
    startsAt: KICK_OFF,
    timezone: 'Africa/Nairobi',
    venueSummary: { venueId: 'ven_1', name: 'Kasarani', city: 'Nairobi' },
    participantSummaries: [
      { participantId: 'par_gor', displayName: 'Gor Mahia' },
      { participantId: 'par_afc', displayName: 'AFC Leopards' },
    ],
    ...over,
  } as unknown as TestEvent;
}

const category = () => 'Football';

describe('a fixture is two sides, and only two', () => {
  it('treats an event with two participants as a match', () => {
    expect(isMatch(anEvent())).toBe(true);
  });

  it('does NOT treat a meet as a match', () => {
    // An athletics meet has no opposition. Drawing it as "A vs B" would
    // fabricate one.
    expect(isMatch(anEvent({ participantSummaries: [] } as never))).toBe(false);
  });

  it('does not treat a three-way as a match either', () => {
    // Three sides is not a confrontation, and the card has room for two.
    const three = anEvent({
      participantSummaries: [
        { participantId: 'a', displayName: 'A' },
        { participantId: 'b', displayName: 'B' },
        { participantId: 'c', displayName: 'C' },
      ],
    } as never);

    expect(isMatch(three)).toBe(false);
  });

  it('copes with an event that has no participants field at all', () => {
    expect(isMatch(anEvent({ participantSummaries: undefined } as never))).toBe(false);
  });
});

describe('the card carries the sides only when there are two', () => {
  it('passes both sides through for a fixture', () => {
    const card = toEventCard(anEvent(), category);

    expect(card.sides).toHaveLength(2);
    expect(card.sides?.map((s) => s.name)).toEqual(['Gor Mahia', 'AFC Leopards']);
  });

  it('leaves sides undefined for a meet, so the card falls back to an image', () => {
    const card = toEventCard(anEvent({ participantSummaries: [] } as never), category);

    expect(card.sides).toBeUndefined();
  });

  it('renders the venue and the sport it was given', () => {
    const card = toEventCard(anEvent(), category);

    expect(card.venueName).toBe('Kasarani');
    expect(card.category).toBe('Football');
  });
});

describe('the upcoming list', () => {
  it('splits the date into a day and a month for the chip', () => {
    const item = toUpcomingItem(anEvent());

    expect(item.day).toBe('19');
    expect(item.month).toBe('SEP');
  });

  it('pads a single-digit day, so the chips line up', () => {
    const item = toUpcomingItem(anEvent({ startsAt: Date.UTC(2026, 9, 3, 12) } as never));

    expect(item.day).toBe('03');
    expect(item.month).toBe('OCT');
  });
});
