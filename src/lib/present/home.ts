/**
 * Turn stored events and venues into what the cards need.
 *
 * The presentation layer decides HOW an event is drawn; the domain decides
 * what it is. An event with exactly two participants is a fixture and gets the
 * crest–VS–crest treatment; anything else — a meet, a championship, a concert —
 * gets an image, because forcing it into a two-sided frame would invent an
 * opposition the event does not have (ADR-0004).
 *
 * Nothing here reads a `homeTeam` or an `awayTeam`, because the model has
 * neither and the sides must carry equal weight.
 */

import type { Event, Venue } from '@stadii/shared-models';

import { formatDayAndMonth, formatEventTime } from '@/lib/format/datetime';
import { formatMinor } from '@/lib/format/money';
import { placeLine } from '@/lib/format/format';
import type {
  EventCardData,
  FeaturedMatch,
  MatchSide,
  StadiumCardData,
  UpcomingItem,
} from '@/components/cards';

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

function sidesOf(event: Event): MatchSide[] {
  return (event.participantSummaries ?? []).map((p) => ({
    name: p.displayName,
    crestUrl: p.crestUrl,
  }));
}

/** A fixture is exactly two sides. One or three is not a confrontation. */
export function isMatch(event: Event): boolean {
  return sidesOf(event).length === 2;
}

function priceLabel(event: Event): string | undefined {
  const from = (event as { lowestPriceMinor?: number }).lowestPriceMinor;
  return typeof from === 'number' ? formatMinor(from) : undefined;
}

export function toEventCard(event: Event, categoryFor: (e: Event) => string): EventCardData {
  const sides = sidesOf(event);
  return {
    slug: String(event.slug),
    title: event.title,
    category: categoryFor(event),
    venueName: event.venueSummary?.name ?? '',
    venueCity: event.venueSummary?.city,
    startsAtLabel: formatDayAndMonth(event.startsAt, event.timezone),
    timeLabel: formatEventTime(event.startsAt, event.timezone),
    priceLabel: priceLabel(event),
    sides: sides.length === 2 ? sides : undefined,
  };
}

export function toFeaturedMatch(
  event: Event,
  categoryFor: (e: Event) => string,
  competitionName?: string,
): FeaturedMatch {
  return {
    slug: String(event.slug),
    competition: competitionName,
    category: categoryFor(event),
    sides: sidesOf(event),
    startsAtLabel: formatDayAndMonth(event.startsAt, event.timezone),
    timeLabel: formatEventTime(event.startsAt, event.timezone),
    venueName: event.venueSummary?.name ?? '',
    venueCity: event.venueSummary?.city,
    priceLabel: priceLabel(event),
  };
}

export function toUpcomingItem(event: Event): UpcomingItem {
  const when = new Date(event.startsAt);
  return {
    slug: String(event.slug),
    day: String(when.getUTCDate()).padStart(2, '0'),
    month: MONTHS[when.getUTCMonth()] ?? '',
    title: event.title,
    venueName: event.venueSummary?.name ?? '',
  };
}

export function toStadiumCard(venue: Venue): StadiumCardData {
  return {
    slug: String(venue.slug),
    name: venue.name,
    locality: placeLine(venue.address?.city, venue.address?.county),
    capacity: venue.totalCapacity,
  };
}
