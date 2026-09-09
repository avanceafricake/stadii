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
import { noteworthyAxes } from '@/lib/format/status';
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
    // Artwork only for what has no crests to lead with. A fixture that also
    // carries a photograph still shows its two sides, because that is what the
    // customer is looking for on a card (ADR-0004).
    imageUrl: sides.length === 2 ? undefined : event.heroImageUrl,
    sides: sides.length === 2 ? sides : undefined,
    notices: noteworthyAxes(event),
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
    imageUrl: venue.imageUrl,
    // The first sentence, not the whole essay. A card is a promise that there
    // is more on the other side of it; pasting the full description in makes
    // the card the destination and the page redundant.
    blurb: firstSentence(venue.description),
  };
}

/**
 * The opening sentence of a description, for a card.
 *
 * Cuts on a full stop followed by a space so "St. Andrew's" survives, and falls
 * back to a hard truncation when someone writes one long sentence.
 */
export function firstSentence(text?: string, max = 140): string | undefined {
  if (!text) return undefined;
  const trimmed = text.trim();
  if (!trimmed) return undefined;
  const stop = trimmed.search(/[.!?]\s/);
  const candidate = stop > 0 ? trimmed.slice(0, stop + 1) : trimmed;
  return candidate.length > max ? `${candidate.slice(0, max - 1).trimEnd()}…` : candidate;
}

/**
 * The badge on an event card: the sport's own name.
 *
 * Built from the sports catalogue rather than guessed from the title, and it
 * degrades to "Event" rather than throwing when the catalogue read failed —
 * losing a badge is not a reason to lose the page. Lives here because three
 * pages needed the same four lines.
 */
export function categoryResolver(
  sports: readonly { readonly id: unknown; readonly name: string }[],
): (event: { readonly sportId: unknown }) => string {
  const byId = new Map(sports.map((s) => [String(s.id), s.name]));
  return (event) => byId.get(String(event.sportId)) ?? 'Event';
}
