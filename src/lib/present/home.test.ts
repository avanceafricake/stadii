/**
 * How an event is drawn follows from what it IS.
 *
 * The design asks for crest–VS–crest on a fixture and an image on everything
 * else. That is not a styling preference: the domain has N participants and no
 * home side (ADR-0004), so an athletics meet genuinely has no opposition, and
 * a card that invents one is telling the reader something untrue.
 */

import { describe, expect, it } from 'vitest';

import { isMatch, toEventCard, toStadiumCard, toUpcomingItem } from './home';

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
    // The three axes are always stored (ADR-0016). Leaving them off a fixture
    // makes the ordinary case look extraordinary, which is the opposite of
    // what the card is meant to say.
    publicationStatus: 'PUBLISHED',
    operationalStatus: 'SCHEDULED',
    salesStatus: 'ON_SALE',
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

describe('artwork goes where crests cannot', () => {
  it('a general event carries its hero image', () => {
    const card = toEventCard(
      anEvent({
        participantSummaries: [],
        heroImageUrl: 'https://example.test/meet.jpg',
      } as Partial<TestEvent>),
      category,
    );
    expect(card.imageUrl).toBe('https://example.test/meet.jpg');
    expect(card.sides).toBeUndefined();
  });

  it('a fixture shows its sides even when it also has artwork', () => {
    // A photograph of a crowd is not what someone is looking for when they are
    // looking for Gor Mahia. The crests win.
    const card = toEventCard(
      anEvent({ heroImageUrl: 'https://example.test/crowd.jpg' } as Partial<TestEvent>),
      category,
    );
    expect(card.imageUrl).toBeUndefined();
    expect(card.sides).toHaveLength(2);
  });
});

describe('a card says when something is wrong, and stays quiet when it is not', () => {
  it('an ordinary on-sale fixture carries no notices', () => {
    expect(toEventCard(anEvent(), category).notices).toEqual([]);
  });

  it('a postponed event that is still selling says both things', () => {
    const card = toEventCard(
      anEvent({ operationalStatus: 'POSTPONED', salesStatus: 'SUSPENDED' } as Partial<TestEvent>),
      category,
    );
    // Two facts, never merged into one word (ADR-0016).
    expect(card.notices).toHaveLength(2);
    expect(card.notices?.map((a) => a.axis)).toEqual(['Event', 'Tickets']);
  });
});

describe('a stadium card', () => {
  type TestVenue = Parameters<typeof toStadiumCard>[0];

  const aVenue = (over: Partial<TestVenue> = {}): TestVenue =>
    ({
      id: 'ven_1',
      slug: 'kasarani',
      name: 'Kasarani',
      address: { line1: 'Thika Road', city: 'Nairobi', county: 'Nairobi', countryCode: 'KE' },
      ...over,
    }) as unknown as TestVenue;

  it('carries the photograph when there is one', () => {
    expect(toStadiumCard(aVenue({ imageUrl: 'https://example.test/k.jpg' })).imageUrl).toBe(
      'https://example.test/k.jpg',
    );
  });

  it('takes one sentence from the description, not the essay', () => {
    const card = toStadiumCard(
      aVenue({
        description: 'Kasarani is a sports complex in Nairobi. It seats 60,000. More text.',
      }),
    );
    expect(card.blurb).toBe('Kasarani is a sports complex in Nairobi.');
  });

  it('has no blurb when nobody has written one', () => {
    expect(toStadiumCard(aVenue()).blurb).toBeUndefined();
    expect(toStadiumCard(aVenue({ description: '   ' })).blurb).toBeUndefined();
  });

  it('truncates a single very long sentence rather than running off the card', () => {
    const card = toStadiumCard(aVenue({ description: `${'a'.repeat(300)}` }));
    expect(card.blurb!.length).toBeLessThanOrEqual(140);
    expect(card.blurb!.endsWith('…')).toBe(true);
  });
});
