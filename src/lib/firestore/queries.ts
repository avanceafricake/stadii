/**
 * Every Firestore read this website performs.
 *
 * THE CONTRACT WITH `firestore.rules`
 * -----------------------------------
 * Firestore rules are not filters. A query whose result set could contain one
 * document the caller may not read is refused ENTIRELY — it does not silently
 * return the readable subset. The rule for events is:
 *
 *     publicationStatus == 'PUBLISHED' && visibility == 'PUBLIC'
 *
 * so every events query below carries BOTH equality filters. Dropping either
 * one does not "show a few extra events"; it returns permission-denied for the
 * whole page, including the events that were readable. This is the single
 * easiest way to break this app, which is why it is asserted in a test.
 *
 * INDEXES
 * -------
 * A pure-equality query is served by Firestore's automatic single-field indexes
 * through an index merge, so slug lookups need no composite index. Anything
 * that combines equality filters with `orderBy startsAt` does need one, and
 * only `events: visibility, publicationStatus, startsAt` exists today. Filters
 * for sport, venue, competition and participant are therefore applied in memory
 * over that indexed page of results — see `narrow()`. The composite indexes
 * that would push them server-side are listed in the app README; adding them is
 * a repository-root change this app does not make on its own.
 *
 * FAILURE
 * -------
 * Nothing here throws. A read that fails returns `unavailable: true` with empty
 * data, and the page renders a real error state. A discovery site that 500s
 * because one collection was slow is worse than one that says so.
 */
import { cache } from 'react';
import {
  CATALOG_STATUS,
  COLLECTIONS,
  EVENT_PUBLICATION_STATUS,
  EVENT_VISIBILITY,
  SUBCOLLECTIONS,
  VENUE_STATUS,
} from '@stadii/shared-constants';
import type {
  Competition,
  Event,
  EventParticipant,
  Participant,
  Sport,
  TicketType,
  Venue,
  VenueArea,
} from '@stadii/shared-models';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit as limitTo,
  orderBy,
  query,
  where,
  type QueryConstraint,
} from 'firebase/firestore/lite';

import { db } from './client';
import { fromDoc, fromDocs } from './convert';

// ---------------------------------------------------------------------------
// Result shape
// ---------------------------------------------------------------------------

export interface Loaded<T> {
  readonly data: T;
  /** True when the read could not be performed. NOT the same as "no results". */
  readonly unavailable: boolean;
}

function ok<T>(data: T): Loaded<T> {
  return { data, unavailable: false };
}

function unavailable<T>(empty: T, cause?: unknown): Loaded<T> {
  if (cause !== undefined && process.env.NODE_ENV !== 'test') {
    console.error('[stadii/web] Firestore read failed:', cause);
  }
  return { data: empty, unavailable: true };
}

async function read<T>(empty: T, run: () => Promise<T>): Promise<Loaded<T>> {
  if (!db()) return unavailable(empty);
  try {
    return ok(await run());
  } catch (cause) {
    return unavailable(empty, cause);
  }
}

function requireDb() {
  const database = db();
  if (!database) throw new Error('Firestore is not configured');
  return database;
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

/** The two equality filters `firestore.rules` requires on every events query. */
const PUBLIC_EVENT_CONSTRAINTS: readonly QueryConstraint[] = [
  where('publicationStatus', '==', EVENT_PUBLICATION_STATUS.PUBLISHED),
  where('visibility', '==', EVENT_VISIBILITY.PUBLIC),
];

export interface EventListOptions {
  /**
   * In-memory narrowing applied after the indexed query. None of these are
   * server-side filters today — see the INDEXES note at the top of this file.
   */
  readonly sportId?: string;
  readonly venueId?: string;
  readonly competitionId?: string;
  readonly participantId?: string;
  /** Defaults to six hours ago, so an event that has just kicked off is still listed. */
  readonly fromInstant?: number;
  readonly limit?: number;
}

/** How many indexed documents one listing query pulls before narrowing. */
const LISTING_PAGE_SIZE = 120;
const GRACE_MS = 6 * 60 * 60 * 1000;

function narrow(events: readonly Event[], options: EventListOptions): Event[] {
  return events.filter((event) => {
    if (options.sportId && event.sportId !== options.sportId) return false;
    if (options.venueId && event.venueId !== options.venueId) return false;
    if (options.competitionId && event.competitionId !== options.competitionId) return false;
    if (options.participantId) {
      const summaries = event.participantSummaries ?? [];
      if (!summaries.some((p) => p.participantId === options.participantId)) return false;
    }
    return true;
  });
}

export const listUpcomingEvents = cache(
  async (options: EventListOptions = {}): Promise<Loaded<Event[]>> =>
    read<Event[]>([], async () => {
      const from = options.fromInstant ?? Date.now() - GRACE_MS;
      const snapshot = await getDocs(
        query(
          collection(requireDb(), COLLECTIONS.EVENTS),
          ...PUBLIC_EVENT_CONSTRAINTS,
          // A NUMBER, not a Date. `Instant` is epoch milliseconds
          // (shared-models/common.ts) and the backend writes `startsAt` as one,
          // so comparing against a Firestore Timestamp here matched nothing —
          // Firestore does not order a number against a timestamp, it simply
          // returns neither. The public events list was permanently empty for
          // every event the backend had ever created.
          where('startsAt', '>=', from),
          orderBy('startsAt', 'asc'),
          limitTo(LISTING_PAGE_SIZE),
        ),
      );
      const events = fromDocs<Event>(snapshot.docs);
      const narrowed = narrow(events, options);
      return options.limit ? narrowed.slice(0, options.limit) : narrowed;
    }),
);

export const getEventBySlug = cache(
  async (slug: string): Promise<Loaded<Event | null>> =>
    read<Event | null>(null, async () => {
      const snapshot = await getDocs(
        query(
          collection(requireDb(), COLLECTIONS.EVENTS),
          where('slug', '==', slug),
          ...PUBLIC_EVENT_CONSTRAINTS,
          limitTo(1),
        ),
      );
      const first = snapshot.docs[0];
      return first ? fromDoc<Event>(first) : null;
    }),
);

export const listEventParticipants = cache(
  async (eventId: string): Promise<Loaded<EventParticipant[]>> =>
    read<EventParticipant[]>([], async () => {
      const snapshot = await getDocs(
        query(
          collection(
            requireDb(),
            COLLECTIONS.EVENTS,
            eventId,
            SUBCOLLECTIONS.EVENT_PARTICIPANTS,
          ),
          orderBy('displayOrder', 'asc'),
        ),
      );
      return fromDocs<EventParticipant>(snapshot.docs);
    }),
);

/**
 * Ticket categories, in the organiser's display order.
 *
 * The price on each is the price the backend stored. It is rendered and never
 * adjusted (ADR-0013).
 */
export const listTicketTypes = cache(
  async (eventId: string): Promise<Loaded<TicketType[]>> =>
    read<TicketType[]>([], async () => {
      const snapshot = await getDocs(
        query(
          collection(requireDb(), COLLECTIONS.EVENTS, eventId, SUBCOLLECTIONS.TICKET_TYPES),
          orderBy('displayOrder', 'asc'),
        ),
      );
      return fromDocs<TicketType>(snapshot.docs);
    }),
);

// ---------------------------------------------------------------------------
// Sports — DATA, never a hard-coded list (Phase 3 §7)
// ---------------------------------------------------------------------------

export const listSports = cache(
  async (): Promise<Loaded<Sport[]>> =>
    read<Sport[]>([], async () => {
      // Equality only, sorted in memory: there is no `sports: status, name`
      // composite index, and a catalogue of sports is small enough that adding
      // one would cost more than it saves.
      const snapshot = await getDocs(
        query(
          collection(requireDb(), COLLECTIONS.SPORTS),
          where('status', '==', CATALOG_STATUS.ACTIVE),
        ),
      );
      return byName(fromDocs<Sport>(snapshot.docs), (s) => s.name);
    }),
);

export const getSportBySlug = cache(
  async (slug: string): Promise<Loaded<Sport | null>> =>
    readFirstBySlug<Sport>(COLLECTIONS.SPORTS, slug, CATALOG_STATUS.ACTIVE),
);

export const getSportById = cache(
  async (id: string): Promise<Loaded<Sport | null>> =>
    readById<Sport>(COLLECTIONS.SPORTS, id),
);

// ---------------------------------------------------------------------------
// Participants — teams, clubs, athletes and organizations, one collection
// ---------------------------------------------------------------------------

export const listParticipants = cache(
  async (options: { sportId?: string; limit?: number } = {}): Promise<Loaded<Participant[]>> =>
    read<Participant[]>([], async () => {
      const constraints: QueryConstraint[] = [
        where('status', '==', CATALOG_STATUS.ACTIVE),
      ];
      if (options.sportId) {
        // Index: participants sportIds CONTAINS, status, displayName.
        constraints.push(where('sportIds', 'array-contains', options.sportId));
      }
      constraints.push(orderBy('displayName', 'asc'));
      constraints.push(limitTo(options.limit ?? 200));

      const snapshot = await getDocs(
        query(collection(requireDb(), COLLECTIONS.PARTICIPANTS), ...constraints),
      );
      return fromDocs<Participant>(snapshot.docs);
    }),
);

export const getParticipantBySlug = cache(
  async (slug: string): Promise<Loaded<Participant | null>> =>
    readFirstBySlug<Participant>(COLLECTIONS.PARTICIPANTS, slug, CATALOG_STATUS.ACTIVE),
);

/**
 * Participants by ID, as individual point reads.
 *
 * An `in` query would be one round trip, but it fails as a whole if any one of
 * the documents is ARCHIVED and therefore unreadable. Point reads degrade one
 * participant at a time, which is what a page with a missing crest should do.
 */
export const getParticipantsByIds = cache(
  async (ids: readonly string[]): Promise<Loaded<Participant[]>> =>
    read<Participant[]>([], async () => {
      const unique = [...new Set(ids)].slice(0, 24);
      const results = await Promise.all(
        unique.map(async (id) => {
          try {
            const snapshot = await getDoc(doc(requireDb(), COLLECTIONS.PARTICIPANTS, id));
            return snapshot.exists() ? fromDoc<Participant>(snapshot) : null;
          } catch {
            return null;
          }
        }),
      );
      return results.filter((p): p is Participant => p !== null);
    }),
);

// ---------------------------------------------------------------------------
// Competitions
// ---------------------------------------------------------------------------

export const listCompetitions = cache(
  async (options: { sportId?: string } = {}): Promise<Loaded<Competition[]>> =>
    read<Competition[]>([], async () => {
      const constraints: QueryConstraint[] = [
        where('status', '==', CATALOG_STATUS.ACTIVE),
      ];
      if (options.sportId) constraints.push(where('sportId', '==', options.sportId));
      const snapshot = await getDocs(
        query(collection(requireDb(), COLLECTIONS.COMPETITIONS), ...constraints),
      );
      return byName(fromDocs<Competition>(snapshot.docs), (c) => c.name);
    }),
);

export const getCompetitionBySlug = cache(
  async (slug: string): Promise<Loaded<Competition | null>> =>
    readFirstBySlug<Competition>(COLLECTIONS.COMPETITIONS, slug, CATALOG_STATUS.ACTIVE),
);

export const getCompetitionById = cache(
  async (id: string): Promise<Loaded<Competition | null>> =>
    readById<Competition>(COLLECTIONS.COMPETITIONS, id),
);

// ---------------------------------------------------------------------------
// Venues
// ---------------------------------------------------------------------------

export const listVenues = cache(
  async (): Promise<Loaded<Venue[]>> =>
    read<Venue[]>([], async () => {
      const snapshot = await getDocs(
        query(
          collection(requireDb(), COLLECTIONS.VENUES),
          where('status', '==', VENUE_STATUS.ACTIVE),
        ),
      );
      return byName(fromDocs<Venue>(snapshot.docs), (v) => v.name);
    }),
);

export const getVenueBySlug = cache(
  async (slug: string): Promise<Loaded<Venue | null>> =>
    readFirstBySlug<Venue>(COLLECTIONS.VENUES, slug, VENUE_STATUS.ACTIVE),
);

export const getVenueById = cache(
  async (id: string): Promise<Loaded<Venue | null>> => readById<Venue>(COLLECTIONS.VENUES, id),
);

/**
 * The top level of a venue's area tree, for an orientation list.
 *
 * ADR-0005: the tree is flexible — SECTION, BLOCK, ROW and GA_AREA are all
 * optional and nest in several legal shapes. Nothing here assumes a depth or a
 * shape; the roots are whatever documents say `parentAreaId == null`.
 */
export const listVenueRootAreas = cache(
  async (venueId: string): Promise<Loaded<VenueArea[]>> =>
    read<VenueArea[]>([], async () => {
      const snapshot = await getDocs(
        query(
          collection(requireDb(), COLLECTIONS.VENUES, venueId, SUBCOLLECTIONS.AREAS),
          where('parentAreaId', '==', null),
          limitTo(60),
        ),
      );
      return byName(fromDocs<VenueArea>(snapshot.docs), (a) => a.label);
    }),
);

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function byName<T>(items: T[], key: (item: T) => string | undefined): T[] {
  return [...items].sort((a, b) => (key(a) ?? '').localeCompare(key(b) ?? ''));
}

async function readFirstBySlug<T>(
  collectionName: string,
  slug: string,
  status: string,
): Promise<Loaded<T | null>> {
  return read<T | null>(null, async () => {
    // Equality-only: served by automatic single-field indexes, no composite.
    const snapshot = await getDocs(
      query(
        collection(requireDb(), collectionName),
        where('slug', '==', slug),
        where('status', '==', status),
        limitTo(1),
      ),
    );
    const first = snapshot.docs[0];
    return first ? fromDoc<T>(first) : null;
  });
}

async function readById<T>(collectionName: string, id: string): Promise<Loaded<T | null>> {
  return read<T | null>(null, async () => {
    const snapshot = await getDoc(doc(requireDb(), collectionName, id));
    return snapshot.exists() ? fromDoc<T>(snapshot) : null;
  });
}
