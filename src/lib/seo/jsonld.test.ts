/**
 * Structured data.
 *
 * Two failure modes are being guarded. The first is a crawler penalty: markup
 * that disagrees with the visible page, or an `Offer` price in a format Google
 * rejects. The second is worse — structured data that asserts something the
 * backend never said, such as a seat being in stock, published to the whole
 * internet under our name.
 */
import { describe, expect, it } from 'vitest';

import type { Event, TicketType, Venue } from '@stadii/shared-models';

import { breadcrumbJsonLd, sportsEventJsonLd } from './jsonld';

const anEvent = (over: Partial<Event> = {}): Event =>
  ({
    id: 'evt_1',
    slug: 'gor-mahia-v-afc-leopards',
    title: 'Gor Mahia v AFC Leopards',
    sportId: 'sp_football',
    organizationId: 'org_1',
    venueId: 'ven_1',
    venueSummary: { venueId: 'ven_1', name: 'Kasarani', city: 'Nairobi' },
    startsAt: Date.UTC(2026, 9, 12, 13, 0),
    timezone: 'Africa/Nairobi',
    publicationStatus: 'PUBLISHED',
    operationalStatus: 'SCHEDULED',
    salesStatus: 'ON_SALE',
    visibility: 'PUBLIC',
    participantSummaries: [],
    participantCount: 0,
    ...over,
  }) as unknown as Event;

const aTicketType = (over: Partial<TicketType> = {}): TicketType =>
  ({
    id: 'tt_1',
    eventId: 'evt_1',
    name: 'Regular',
    admissionKind: 'GENERAL_ADMISSION',
    priceMinor: 150_000,
    currency: 'KES',
    status: 'ACTIVE',
    ...over,
  }) as unknown as TicketType;

const aVenue = (): Venue =>
  ({
    id: 'ven_1',
    name: 'Kasarani',
    slug: 'kasarani',
    address: { line1: 'Thika Road', city: 'Nairobi', countryCode: 'KE' },
    timezone: 'Africa/Nairobi',
  }) as unknown as Venue;

describe('SportsEvent markup', () => {
  it('describes the event as a SportsEvent with a place and offers', () => {
    const ld = sportsEventJsonLd({
      event: anEvent(),
      participants: [
        { name: 'Gor Mahia', role: 'HOME', kind: 'CLUB' },
        { name: 'AFC Leopards', role: 'AWAY', kind: 'CLUB' },
      ],
      ticketTypes: [aTicketType()],
      venue: aVenue(),
      path: '/events/gor-mahia-v-afc-leopards',
    });

    expect(ld['@type']).toBe('SportsEvent');
    expect(ld.name).toBe('Gor Mahia v AFC Leopards');
    expect((ld.location as Record<string, unknown>)['@type']).toBe('Place');
    expect(Array.isArray(ld.offers)).toBe(true);
  });

  it('prices offers in the format schema.org accepts', () => {
    const ld = sportsEventJsonLd({
      event: anEvent(),
      participants: [],
      ticketTypes: [aTicketType({ priceMinor: 150_000 })],
      venue: aVenue(),
      path: '/events/x',
    });

    const [offer] = ld.offers as Record<string, unknown>[];
    // Major units, dot separator, no grouping, no symbol. "KES 1,500.00" is
    // rejected outright.
    expect(offer?.price).toBe('1500.00');
    expect(offer?.priceCurrency).toBe('KES');
  });

  it('emits valid markup for an event with NO participants', () => {
    // A championship with nothing drawn yet. The page still needs to be
    // shareable, and empty `competitor` arrays must not break the markup.
    const ld = sportsEventJsonLd({
      event: anEvent({ title: 'Kenyan Athletics Championships' }),
      participants: [],
      ticketTypes: [aTicketType()],
      venue: aVenue(),
      path: '/events/kenyan-athletics-championships',
    });

    expect(ld['@type']).toBe('SportsEvent');
    expect(ld.name).toBe('Kenyan Athletics Championships');
  });

  it('emits forty competitors as readily as two', () => {
    const ld = sportsEventJsonLd({
      event: anEvent(),
      participants: Array.from({ length: 40 }, (_, i) => ({
        name: `Athlete ${i}`,
        role: 'COMPETITOR' as const,
        kind: 'ATHLETE' as const,
      })),
      ticketTypes: [aTicketType()],
      venue: aVenue(),
      path: '/events/meet',
    });

    expect((ld.competitor as unknown[]).length).toBe(40);
    // An athlete is a Person, not a SportsTeam.
    expect((ld.competitor as Record<string, unknown>[])[0]?.['@type']).toBe('Person');
  });

  it('does not pair or reorder participants by role', () => {
    // HOME and AWAY are two of six roles, not two slots. Nothing may assume
    // the first entry is "the home side" (ADR-0004).
    const ld = sportsEventJsonLd({
      event: anEvent(),
      participants: [
        { name: 'AFC Leopards', role: 'AWAY', kind: 'CLUB' },
        { name: 'Gor Mahia', role: 'HOME', kind: 'CLUB' },
      ],
      ticketTypes: [],
      venue: aVenue(),
      path: '/events/x',
    });

    const names = (ld.competitor as Record<string, unknown>[]).map((c) => c.name);
    expect(names).toEqual(['AFC Leopards', 'Gor Mahia']);
  });

  it('falls back to the event’s venue summary when the venue did not load', () => {
    const ld = sportsEventJsonLd({
      event: anEvent(),
      participants: [],
      ticketTypes: [],
      venue: null,
      path: '/events/x',
    });

    expect((ld.location as Record<string, unknown>).name).toBe('Kasarani');
  });

  it('renders the start time with the stadium’s offset, not the server’s', () => {
    // A crawler in another region must read 16:00 EAT, not 13:00 UTC.
    const ld = sportsEventJsonLd({
      event: anEvent(),
      participants: [],
      ticketTypes: [],
      venue: aVenue(),
      path: '/events/x',
    });

    expect(String(ld.startDate)).toContain('+03:00');
  });
});

describe('BreadcrumbList markup', () => {
  it('numbers the trail from one and resolves absolute URLs', () => {
    const ld = breadcrumbJsonLd([
      { name: 'Events', path: '/events' },
      { name: 'Gor Mahia v AFC Leopards', path: '/events/gor-mahia-v-afc-leopards' },
    ]);

    const items = ld.itemListElement as Record<string, unknown>[];
    expect(items).toHaveLength(2);
    expect(items[0]?.position).toBe(1);
    expect(String(items[1]?.item)).toMatch(/^https?:\/\//);
  });
});
