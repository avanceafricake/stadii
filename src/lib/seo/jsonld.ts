/**
 * Structured data.
 *
 * Two rules govern everything here.
 *
 * 1. **Only assert what a document says.** A `SportsEvent` gets the title, the
 *    times, the venue and the ticket prices the backend stored. It does not get
 *    a computed total, an inferred home side, or an availability the platform
 *    has not published — Google surfaces this markup to people, and a wrong
 *    "In stock" is a customer at a turnstile with no ticket.
 *
 * 2. **No home-vs-away.** schema.org offers `homeTeam` and `awayTeam`, and this
 *    file deliberately uses neither. An event has N participants with roles
 *    (ADR-0004); `competitor` and `performer` express that without inventing a
 *    fixture shape for a swimming championship.
 */
import {
  EVENT_OPERATIONAL_STATUS,
  EVENT_SALES_STATUS,
  PARTICIPANT_ROLE,
  TICKET_TYPE_STATUS,
  type EventOperationalStatus,
  type EventSalesStatus,
  type ParticipantKind,
  type ParticipantRole,
  type TicketTypeStatus,
} from '@stadii/shared-constants';
import type { Event, TicketType, Venue } from '@stadii/shared-models';

import { toIsoWithZoneOffset } from '@/lib/format/datetime';
import { toSchemaPrice } from '@/lib/format/money';
import { schemaTypeForKind } from '@/lib/format/participants';
import { absoluteUrl, site } from '@/lib/site';

export type JsonLd = Record<string, unknown>;

const SCHEMA = 'https://schema.org';

// ---------------------------------------------------------------------------
// Site-level
// ---------------------------------------------------------------------------

export function organizationJsonLd(): JsonLd {
  const contact: JsonLd[] = [];
  if (site.support.email || site.support.phone) {
    contact.push({
      '@type': 'ContactPoint',
      contactType: 'customer support',
      ...(site.support.email ? { email: site.support.email } : {}),
      ...(site.support.phone ? { telephone: site.support.phone } : {}),
      areaServed: 'KE',
      availableLanguage: ['en', 'sw'],
    });
  }
  return {
    '@context': SCHEMA,
    '@type': 'Organization',
    '@id': `${site.url}/#organization`,
    name: site.legalName,
    url: site.url,
    description: site.description,
    ...(contact.length > 0 ? { contactPoint: contact } : {}),
  };
}

export function webSiteJsonLd(): JsonLd {
  return {
    '@context': SCHEMA,
    '@type': 'WebSite',
    '@id': `${site.url}/#website`,
    name: site.name,
    url: site.url,
    publisher: { '@id': `${site.url}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${site.url}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export interface Crumb {
  readonly name: string;
  /** Site-relative path. */
  readonly path: string;
}

export function breadcrumbJsonLd(crumbs: readonly Crumb[]): JsonLd {
  return {
    '@context': SCHEMA,
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

const EVENT_STATUS_BY_OPERATIONAL: Record<EventOperationalStatus, string> = {
  [EVENT_OPERATIONAL_STATUS.SCHEDULED]: `${SCHEMA}/EventScheduled`,
  [EVENT_OPERATIONAL_STATUS.IN_PROGRESS]: `${SCHEMA}/EventScheduled`,
  // schema.org has no "finished" value. A completed event is still one that
  // went ahead as scheduled, which is the closest true statement.
  [EVENT_OPERATIONAL_STATUS.COMPLETED]: `${SCHEMA}/EventScheduled`,
  [EVENT_OPERATIONAL_STATUS.POSTPONED]: `${SCHEMA}/EventPostponed`,
  [EVENT_OPERATIONAL_STATUS.CANCELLED]: `${SCHEMA}/EventCancelled`,
};

const AVAILABILITY_BY_SALES: Record<EventSalesStatus, string> = {
  [EVENT_SALES_STATUS.ON_SALE]: `${SCHEMA}/InStock`,
  [EVENT_SALES_STATUS.NOT_YET_OPEN]: `${SCHEMA}/PreOrder`,
  [EVENT_SALES_STATUS.SOLD_OUT]: `${SCHEMA}/SoldOut`,
  [EVENT_SALES_STATUS.SUSPENDED]: `${SCHEMA}/OutOfStock`,
  [EVENT_SALES_STATUS.CLOSED]: `${SCHEMA}/OutOfStock`,
};

const AVAILABILITY_BY_TICKET_TYPE: Partial<Record<TicketTypeStatus, string>> = {
  [TICKET_TYPE_STATUS.SOLD_OUT]: `${SCHEMA}/SoldOut`,
  [TICKET_TYPE_STATUS.PAUSED]: `${SCHEMA}/OutOfStock`,
  [TICKET_TYPE_STATUS.CLOSED]: `${SCHEMA}/OutOfStock`,
  [TICKET_TYPE_STATUS.DRAFT]: `${SCHEMA}/OutOfStock`,
};

/**
 * A ticket category's availability.
 *
 * The category's OWN status wins where it says something specific — a paused
 * VIP tier on an on-sale event is a real state (ADR-0016's reasoning applied
 * one level down). An ACTIVE category inherits the event's sales axis. Neither
 * value is computed; both are read.
 */
function availabilityFor(
  ticketType: TicketType,
  eventSalesStatus: EventSalesStatus,
): string {
  return (
    AVAILABILITY_BY_TICKET_TYPE[ticketType.status] ??
    AVAILABILITY_BY_SALES[eventSalesStatus] ??
    `${SCHEMA}/OutOfStock`
  );
}

/** COMPETITOR-ish roles become `competitor`; PERFORMER becomes `performer`. */
const PERFORMER_ROLES: readonly ParticipantRole[] = [PARTICIPANT_ROLE.PERFORMER];

/** The minimum a participant must supply to appear in the markup. */
export interface JsonLdParticipant {
  readonly name: string;
  readonly role?: ParticipantRole | undefined;
  /** Absent where only the event's capped summary was available. */
  readonly kind?: ParticipantKind | undefined;
  readonly crestUrl?: string | undefined;
}

export interface SportsEventJsonLdInput {
  readonly event: Event;
  /** In `displayOrder`. Roles are carried, positions are not. */
  readonly participants: readonly JsonLdParticipant[];
  readonly ticketTypes: readonly TicketType[];
  readonly venue: Venue | null;
  /** Site-relative canonical path for this event. */
  readonly path: string;
  readonly sportName?: string | undefined;
}

export function sportsEventJsonLd(input: SportsEventJsonLdInput): JsonLd {
  const { event, participants, ticketTypes, venue, path } = input;
  const url = absoluteUrl(path);
  const timezone = event.timezone;

  const competitors: JsonLd[] = [];
  const performers: JsonLd[] = [];
  for (const entry of participants) {
    const node: JsonLd = {
      '@type': schemaTypeForKind(entry.kind),
      name: entry.name,
      ...(entry.crestUrl ? { image: entry.crestUrl } : {}),
    };
    if (entry.role && PERFORMER_ROLES.includes(entry.role)) performers.push(node);
    else competitors.push(node);
  }

  const offers = ticketTypes.map((ticketType) => ({
    '@type': 'Offer',
    name: ticketType.name,
    // The price the backend stored, in major units, exactly as sold. Fees are
    // added by the backend at order creation and are not represented here.
    price: toSchemaPrice(ticketType.priceMinor),
    priceCurrency: ticketType.currency,
    availability: availabilityFor(ticketType, event.salesStatus),
    url,
    ...(ticketType.salesWindow?.opensAt
      ? { validFrom: toIsoWithZoneOffset(ticketType.salesWindow.opensAt, timezone) }
      : event.salesWindow?.opensAt
        ? { validFrom: toIsoWithZoneOffset(event.salesWindow.opensAt, timezone) }
        : {}),
    ...(ticketType.salesWindow?.closesAt
      ? { validThrough: toIsoWithZoneOffset(ticketType.salesWindow.closesAt, timezone) }
      : {}),
  }));

  const location: JsonLd = {
    '@type': 'Place',
    name: venue?.name ?? event.venueSummary?.name ?? 'Venue to be confirmed',
    ...(venue?.address
      ? {
          address: {
            '@type': 'PostalAddress',
            streetAddress: venue.address.line1,
            addressLocality: venue.address.city,
            ...(venue.address.county ? { addressRegion: venue.address.county } : {}),
            addressCountry: venue.address.countryCode,
          },
        }
      : event.venueSummary?.city
        ? {
            address: {
              '@type': 'PostalAddress',
              addressLocality: event.venueSummary.city,
            },
          }
        : {}),
    ...(venue?.location
      ? {
          geo: {
            '@type': 'GeoCoordinates',
            latitude: venue.location.lat,
            longitude: venue.location.lng,
          },
        }
      : {}),
  };

  return {
    '@context': SCHEMA,
    '@type': 'SportsEvent',
    name: event.title,
    ...(event.subtitle ? { alternateName: event.subtitle } : {}),
    ...(event.description ? { description: event.description } : {}),
    url,
    startDate: toIsoWithZoneOffset(event.startsAt, timezone),
    ...(event.endsAt ? { endDate: toIsoWithZoneOffset(event.endsAt, timezone) } : {}),
    ...(event.doorsOpenAt
      ? { doorTime: toIsoWithZoneOffset(event.doorsOpenAt, timezone) }
      : {}),
    eventStatus:
      EVENT_STATUS_BY_OPERATIONAL[event.operationalStatus] ?? `${SCHEMA}/EventScheduled`,
    eventAttendanceMode: `${SCHEMA}/OfflineEventAttendanceMode`,
    location,
    ...(competitors.length > 0 ? { competitor: competitors } : {}),
    ...(performers.length > 0 ? { performer: performers } : {}),
    ...(offers.length > 0 ? { offers } : {}),
    ...(input.sportName ? { sport: input.sportName } : {}),
    organizer: { '@id': `${site.url}/#organization` },
    isAccessibleForFree: false,
  };
}
