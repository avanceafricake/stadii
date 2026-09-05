/**
 * Shared primitives for every model in the platform.
 *
 * This package is consumed by web clients, so it imports NOTHING from
 * firebase-admin or firebase. Firestore `Timestamp` conversion happens in
 * `backend/infrastructure` and nowhere else.
 */

// ---------------------------------------------------------------------------
// Identifiers
//
// Branded strings. Nothing parses meaning out of an ID
// (docs/data/firestore-collections.md §Conventions). The brand is compile-time
// only and erases to `string` at runtime, so it costs nothing.
// ---------------------------------------------------------------------------

declare const brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [brand]: B };

export type UserId = Brand<string, 'UserId'>;
export type OrgId = Brand<string, 'OrgId'>;
export type MembershipId = Brand<string, 'MembershipId'>;
export type SportId = Brand<string, 'SportId'>;
export type ParticipantId = Brand<string, 'ParticipantId'>;
export type CompetitionId = Brand<string, 'CompetitionId'>;
export type SeasonId = Brand<string, 'SeasonId'>;
export type VenueId = Brand<string, 'VenueId'>;
export type AreaId = Brand<string, 'AreaId'>;
export type SeatId = Brand<string, 'SeatId'>;
export type GateId = Brand<string, 'GateId'>;
export type EventId = Brand<string, 'EventId'>;
export type EventParticipantId = Brand<string, 'EventParticipantId'>;
export type TicketTypeId = Brand<string, 'TicketTypeId'>;
export type AllocationId = Brand<string, 'AllocationId'>;
export type HoldId = Brand<string, 'HoldId'>;
export type OrderId = Brand<string, 'OrderId'>;
export type OrderItemId = Brand<string, 'OrderItemId'>;
export type PaymentId = Brand<string, 'PaymentId'>;
export type RefundId = Brand<string, 'RefundId'>;
export type TicketId = Brand<string, 'TicketId'>;
export type TransferId = Brand<string, 'TransferId'>;
export type DeviceId = Brand<string, 'DeviceId'>;
export type ScanId = Brand<string, 'ScanId'>;
export type KioskId = Brand<string, 'KioskId'>;
export type FeeScheduleId = Brand<string, 'FeeScheduleId'>;
export type SettlementId = Brand<string, 'SettlementId'>;
export type AuditLogId = Brand<string, 'AuditLogId'>;
export type ProviderId = Brand<string, 'ProviderId'>;

/** Cast a raw string to a branded ID. The one sanctioned entry point. */
export function asId<T extends string>(value: string): T {
  return value as T;
}

// ---------------------------------------------------------------------------
// Time
//
// Epoch milliseconds, UTC. Chosen over Firestore Timestamp so this package stays
// dependency-free, and over ISO strings so comparison is a numeric operation
// rather than a parse. Rendered in Africa/Nairobi (UTC+3, no DST) by clients.
// ---------------------------------------------------------------------------

export type Instant = number;

/** Calendar date with no time component, ISO `YYYY-MM-DD`. */
export type IsoDate = string;

export const NAIROBI_TZ = 'Africa/Nairobi';

// ---------------------------------------------------------------------------
// Money
//
// Integer minor units, always. ADR-0012. A field named `amountMinor` holding 500
// means KES 5.00. No floats anywhere in this codebase.
// ---------------------------------------------------------------------------

export type MinorUnits = number;

export interface Money {
  readonly amountMinor: MinorUnits;
  readonly currency: 'KES';
}

/** Basis points as an integer: 250 = 2.5%. Never a float percentage. */
export type BasisPoints = number;

// ---------------------------------------------------------------------------
// Common document facets
// ---------------------------------------------------------------------------

/** Lifecycle fields present on every persisted document. */
export interface Timestamped {
  readonly createdAt: Instant;
  readonly updatedAt: Instant;
}

/** Audit facet — who last touched a document. */
export interface Attributed {
  readonly createdByUserId?: UserId;
  readonly updatedByUserId?: UserId;
}

/**
 * Optimistic concurrency counter, incremented on every write. Used for
 * compare-and-set on documents with concurrent writers.
 */
export interface Versioned {
  readonly version: number;
}

export interface ContactDetails {
  readonly name?: string;
  readonly phone?: string;
  readonly email?: string;
}

export interface Address {
  readonly line1: string;
  readonly city: string;
  readonly county?: string;
  readonly countryCode: string;
}

export interface GeoPoint {
  readonly lat: number;
  readonly lng: number;
}

export interface TimeWindow {
  readonly opensAt?: Instant;
  readonly closesAt?: Instant;
}

export interface Period {
  readonly fromAt: Instant;
  readonly toAt: Instant;
}

/** A page of results with an opaque continuation cursor. */
export interface Page<T> {
  readonly items: readonly T[];
  readonly nextCursor?: string;
}
