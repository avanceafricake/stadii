/**
 * Every status enum in the platform.
 *
 * Rule (docs/domain/00-ubiquitous-language.md): statuses are never shared between
 * entity types even when the word is the same. `ACTIVE` on an event and `ACTIVE`
 * on a membership are unrelated types, and nothing branches on a status without
 * knowing which entity it belongs to.
 *
 * All values are SCREAMING_SNAKE_CASE strings, never integers, so stored documents
 * stay readable and stable across refactors.
 */

// ---------------------------------------------------------------------------
// Catalogue
// ---------------------------------------------------------------------------

export const PARTICIPANT_MODEL = {
  /** Two participants face each other — football, rugby */
  OPPOSING_SIDES: 'OPPOSING_SIDES',
  /** Many participants compete together — athletics, swimming */
  FIELD: 'FIELD',
  /** Zero or more, no competitive pairing */
  EXHIBITION: 'EXHIBITION',
} as const;
export type ParticipantModel = (typeof PARTICIPANT_MODEL)[keyof typeof PARTICIPANT_MODEL];

export const PARTICIPANT_KIND = {
  TEAM: 'TEAM',
  CLUB: 'CLUB',
  ATHLETE: 'ATHLETE',
  ORGANIZATION: 'ORGANIZATION',
} as const;
export type ParticipantKind = (typeof PARTICIPANT_KIND)[keyof typeof PARTICIPANT_KIND];

export const CATALOG_STATUS = {
  ACTIVE: 'ACTIVE',
  ARCHIVED: 'ARCHIVED',
} as const;
export type CatalogStatus = (typeof CATALOG_STATUS)[keyof typeof CATALOG_STATUS];

export const COMPETITION_FORMAT = {
  LEAGUE: 'LEAGUE',
  KNOCKOUT: 'KNOCKOUT',
  MEET: 'MEET',
  FRIENDLY_SERIES: 'FRIENDLY_SERIES',
  OTHER: 'OTHER',
} as const;
export type CompetitionFormat = (typeof COMPETITION_FORMAT)[keyof typeof COMPETITION_FORMAT];

// ---------------------------------------------------------------------------
// Venue
// ---------------------------------------------------------------------------

export const AREA_KIND = {
  SECTION: 'SECTION',
  BLOCK: 'BLOCK',
  ROW: 'ROW',
  GA_AREA: 'GA_AREA',
} as const;
export type AreaKind = (typeof AREA_KIND)[keyof typeof AREA_KIND];

export const AREA_STATUS = {
  ACTIVE: 'ACTIVE',
  /** Structurally unusable — under repair, closed by order */
  CLOSED: 'CLOSED',
} as const;
export type AreaStatus = (typeof AREA_STATUS)[keyof typeof AREA_STATUS];

export const SEAT_STATUS = {
  ACTIVE: 'ACTIVE',
  /** Soft delete — the seat no longer physically exists but stays resolvable */
  REMOVED: 'REMOVED',
} as const;
export type SeatStatus = (typeof SEAT_STATUS)[keyof typeof SEAT_STATUS];

export const VENUE_STATUS = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  ARCHIVED: 'ARCHIVED',
} as const;
export type VenueStatus = (typeof VENUE_STATUS)[keyof typeof VENUE_STATUS];

export const ACCESSIBILITY_FEATURE = {
  WHEELCHAIR: 'WHEELCHAIR',
  COMPANION: 'COMPANION',
  RESTRICTED_VIEW: 'RESTRICTED_VIEW',
  AISLE: 'AISLE',
} as const;
export type AccessibilityFeature =
  (typeof ACCESSIBILITY_FEATURE)[keyof typeof ACCESSIBILITY_FEATURE];

// ---------------------------------------------------------------------------
// Event
// ---------------------------------------------------------------------------

/**
 * An event carries THREE independent status axes, never one.
 *
 * Phase 2 §1: "Do not use one status field to represent unrelated concepts."
 * Whether an event is visible, whether it is happening, and whether it is
 * selling are genuinely independent questions. A single enum forces impossible
 * combinations to be invented (an event that is published, has finished, and is
 * still taking money for next season had no representation) and makes every
 * consumer branch on a value that means three things at once.
 *
 * See ADR-0016, which supersedes the single `EventStatus` field from Phase 1.
 */

/** Is the event visible to customers at all? */
export const EVENT_PUBLICATION_STATUS = {
  /** Invisible to customers. Freely editable. No inventory materialised. */
  DRAFT: 'DRAFT',
  /** Visible. Inventory materialised. */
  PUBLISHED: 'PUBLISHED',
  /** Withdrawn from listings after the fact. Existing tickets unaffected. */
  ARCHIVED: 'ARCHIVED',
} as const;
export type EventPublicationStatus =
  (typeof EVENT_PUBLICATION_STATUS)[keyof typeof EVENT_PUBLICATION_STATUS];

/** Is the event happening? */
export const EVENT_OPERATIONAL_STATUS = {
  SCHEDULED: 'SCHEDULED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  /** Existing tickets stay valid pending a reschedule. NOT destructive. */
  POSTPONED: 'POSTPONED',
  /** Terminal and destructive: voids tickets and triggers refunds. */
  CANCELLED: 'CANCELLED',
} as const;
export type EventOperationalStatus =
  (typeof EVENT_OPERATIONAL_STATUS)[keyof typeof EVENT_OPERATIONAL_STATUS];

/** Is the event selling? */
export const EVENT_SALES_STATUS = {
  NOT_YET_OPEN: 'NOT_YET_OPEN',
  ON_SALE: 'ON_SALE',
  /** Deliberately paused by an operator. The event stays VISIBLE. */
  SUSPENDED: 'SUSPENDED',
  /**
   * DERIVED AND CACHED for display by a job. The inventory transaction remains
   * the authority on whether a specific seat can be bought (Constitution §1).
   */
  SOLD_OUT: 'SOLD_OUT',
  CLOSED: 'CLOSED',
} as const;
export type EventSalesStatus = (typeof EVENT_SALES_STATUS)[keyof typeof EVENT_SALES_STATUS];

export const EVENT_VISIBILITY = {
  PUBLIC: 'PUBLIC',
  UNLISTED: 'UNLISTED',
} as const;
export type EventVisibility = (typeof EVENT_VISIBILITY)[keyof typeof EVENT_VISIBILITY];

export const PARTICIPANT_ROLE = {
  HOME: 'HOME',
  AWAY: 'AWAY',
  COMPETITOR: 'COMPETITOR',
  HOST: 'HOST',
  GUEST: 'GUEST',
  PERFORMER: 'PERFORMER',
} as const;
export type ParticipantRole = (typeof PARTICIPANT_ROLE)[keyof typeof PARTICIPANT_ROLE];

export const QR_POLICY = {
  STATIC: 'STATIC',
  /** Designed for, deferred — ADR-0009 */
  ROTATING: 'ROTATING',
} as const;
export type QrPolicy = (typeof QR_POLICY)[keyof typeof QR_POLICY];

// ---------------------------------------------------------------------------
// Inventory
// ---------------------------------------------------------------------------

/**
 * How admission mechanically works. Platform-defined, exactly two values.
 * Distinct from Ticket Type, which is an unbounded organizer-defined product
 * name. See ADR-0006 — this separation is the backbone of the inventory model.
 */
export const ADMISSION_KIND = {
  RESERVED_SEAT: 'RESERVED_SEAT',
  GENERAL_ADMISSION: 'GENERAL_ADMISSION',
} as const;
export type AdmissionKind = (typeof ADMISSION_KIND)[keyof typeof ADMISSION_KIND];

export const TICKET_TYPE_STATUS = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  /** Derived and cached for display. NEVER authoritative — the transaction is */
  SOLD_OUT: 'SOLD_OUT',
  CLOSED: 'CLOSED',
} as const;
export type TicketTypeStatus = (typeof TICKET_TYPE_STATUS)[keyof typeof TICKET_TYPE_STATUS];

export const ALLOCATION_STATUS = {
  ACTIVE: 'ACTIVE',
  CLOSED: 'CLOSED',
} as const;
export type AllocationStatus = (typeof ALLOCATION_STATUS)[keyof typeof ALLOCATION_STATUS];

export const ELIGIBILITY_KIND = {
  OPEN: 'OPEN',
  MEMBERS_ONLY: 'MEMBERS_ONLY',
  /** STADII sells it; the check happens physically at the gate */
  REQUIRES_VERIFICATION: 'REQUIRES_VERIFICATION',
} as const;
export type EligibilityKind = (typeof ELIGIBILITY_KIND)[keyof typeof ELIGIBILITY_KIND];

/**
 * Reserved seat lifecycle — docs/domain/06-seat-lifecycle.md.
 *
 * AVAILABLE -> HELD -> SOLD -> USED, with HELD -> AVAILABLE on failure
 * (Constitution §7), plus BLOCKED for operational withdrawal and an explicit,
 * audited SOLD -> AVAILABLE on void or refund.
 */
export const SEAT_INVENTORY_STATUS = {
  AVAILABLE: 'AVAILABLE',
  HELD: 'HELD',
  SOLD: 'SOLD',
  USED: 'USED',
  BLOCKED: 'BLOCKED',
} as const;
export type SeatInventoryStatus =
  (typeof SEAT_INVENTORY_STATUS)[keyof typeof SEAT_INVENTORY_STATUS];

export const GA_INVENTORY_STATUS = {
  OPEN: 'OPEN',
  CLOSED: 'CLOSED',
} as const;
export type GaInventoryStatus = (typeof GA_INVENTORY_STATUS)[keyof typeof GA_INVENTORY_STATUS];

// ---------------------------------------------------------------------------
// Sales
// ---------------------------------------------------------------------------

export const HOLD_STATUS = {
  ACTIVE: 'ACTIVE',
  CONVERTED: 'CONVERTED',
  RELEASED: 'RELEASED',
  EXPIRED: 'EXPIRED',
} as const;
export type HoldStatus = (typeof HOLD_STATUS)[keyof typeof HOLD_STATUS];

export const HOLD_RELEASE_REASON = {
  USER: 'USER',
  EXPIRY: 'EXPIRY',
  ORDER_CANCELLED: 'ORDER_CANCELLED',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  ADMIN: 'ADMIN',
} as const;
export type HoldReleaseReason = (typeof HOLD_RELEASE_REASON)[keyof typeof HOLD_RELEASE_REASON];

export const ORDER_STATUS = {
  CREATED: 'CREATED',
  AWAITING_PAYMENT: 'AWAITING_PAYMENT',
  /** Money confirmed. Transient — set in the same transaction as FULFILLED */
  PAID: 'PAID',
  FULFILLED: 'FULFILLED',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED',
  /** Paid, but the seats were gone. Triggers an automatic refund */
  FAILED_INVENTORY_LOST: 'FAILED_INVENTORY_LOST',
  PARTIALLY_REFUNDED: 'PARTIALLY_REFUNDED',
  REFUNDED: 'REFUNDED',
} as const;
export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export const SALES_CHANNEL = {
  CUSTOMER_APP: 'CUSTOMER_APP',
  WEB: 'WEB',
  KIOSK: 'KIOSK',
} as const;
export type SalesChannel = (typeof SALES_CHANNEL)[keyof typeof SALES_CHANNEL];

// ---------------------------------------------------------------------------
// Payments
// ---------------------------------------------------------------------------

export const PAYMENT_STATUS = {
  INITIATED: 'INITIATED',
  PENDING: 'PENDING',
  SUCCEEDED: 'SUCCEEDED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
  TIMED_OUT: 'TIMED_OUT',
  REVERSED: 'REVERSED',
} as const;
export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

export const PAYMENT_EVENT_SOURCE = {
  CALLBACK: 'CALLBACK',
  QUERY: 'QUERY',
  MANUAL: 'MANUAL',
} as const;
export type PaymentEventSource =
  (typeof PAYMENT_EVENT_SOURCE)[keyof typeof PAYMENT_EVENT_SOURCE];

export const REFUND_STATUS = {
  REQUESTED: 'REQUESTED',
  APPROVED: 'APPROVED',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
} as const;
export type RefundStatus = (typeof REFUND_STATUS)[keyof typeof REFUND_STATUS];

export const REFUND_REASON = {
  CUSTOMER_REQUEST: 'CUSTOMER_REQUEST',
  EVENT_CANCELLED: 'EVENT_CANCELLED',
  INVENTORY_LOST: 'INVENTORY_LOST',
  DUPLICATE_PAYMENT: 'DUPLICATE_PAYMENT',
  GOODWILL: 'GOODWILL',
  CHARGEBACK: 'CHARGEBACK',
} as const;
export type RefundReason = (typeof REFUND_REASON)[keyof typeof REFUND_REASON];

// ---------------------------------------------------------------------------
// Ticketing
// ---------------------------------------------------------------------------

/**
 * Ticket status and transfer state are ORTHOGONAL fields, deliberately.
 *
 * A ticket that is ISSUED and PENDING_TRANSFER is a real, common state. A single
 * overloaded status would force inventing ISSUED_PENDING_TRANSFER, and then a
 * further combination for the next orthogonal concern (Constitution §21).
 *
 * The Phase 1 brief §12 lists ISSUED, ACTIVE, TRANSFERRED, CANCELLED, REFUNDED,
 * USED and asks for the final model to be decided after evaluating the
 * architecture and documented. See docs/domain/08-tickets.md §"Status and transfer
 * state are orthogonal" for that decision:
 *   - ISSUED subsumes ACTIVE (an issued ticket is an active one; a separate
 *     ACTIVE state would have no transition into it that ISSUED does not);
 *   - TRANSFERRED moved to `transferState`, because a transferred ticket is still
 *     a valid, admissible ticket — it simply has a different holder;
 *   - CANCELLED became VOID, to avoid colliding with order cancellation.
 */
export const TICKET_STATUS = {
  /** Valid and unused. The active state */
  ISSUED: 'ISSUED',
  USED: 'USED',
  /** Cancelled: event cancelled, fraud, chargeback */
  VOID: 'VOID',
  REFUNDED: 'REFUNDED',
  /** Event completed without admission. Reporting only */
  EXPIRED: 'EXPIRED',
} as const;
export type TicketStatus = (typeof TICKET_STATUS)[keyof typeof TICKET_STATUS];

export const TRANSFER_STATE = {
  NONE: 'NONE',
  PENDING_TRANSFER: 'PENDING_TRANSFER',
  /** Briefly, during acceptance */
  LOCKED: 'LOCKED',
} as const;
export type TransferState = (typeof TRANSFER_STATE)[keyof typeof TRANSFER_STATE];

export const TRANSFER_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  CANCELLED: 'CANCELLED',
  DECLINED: 'DECLINED',
  EXPIRED: 'EXPIRED',
} as const;
export type TransferStatus = (typeof TRANSFER_STATUS)[keyof typeof TRANSFER_STATUS];

export const CREDENTIAL_STATUS = {
  ACTIVE: 'ACTIVE',
  REVOKED: 'REVOKED',
} as const;
export type CredentialStatus = (typeof CREDENTIAL_STATUS)[keyof typeof CREDENTIAL_STATUS];

export const CREDENTIAL_REVOKE_REASON = {
  TRANSFERRED: 'TRANSFERRED',
  ROTATED: 'ROTATED',
  TICKET_VOIDED: 'TICKET_VOIDED',
} as const;
export type CredentialRevokeReason =
  (typeof CREDENTIAL_REVOKE_REASON)[keyof typeof CREDENTIAL_REVOKE_REASON];

// ---------------------------------------------------------------------------
// Access
// ---------------------------------------------------------------------------

export const DEVICE_STATUS = {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  RETIRED: 'RETIRED',
} as const;
export type DeviceStatus = (typeof DEVICE_STATUS)[keyof typeof DEVICE_STATUS];

export const ASSIGNMENT_STATUS = {
  ACTIVE: 'ACTIVE',
  ENDED: 'ENDED',
} as const;
export type AssignmentStatus = (typeof ASSIGNMENT_STATUS)[keyof typeof ASSIGNMENT_STATUS];

export const SCAN_DECISION = {
  ADMIT: 'ADMIT',
  DENY: 'DENY',
} as const;
export type ScanDecision = (typeof SCAN_DECISION)[keyof typeof SCAN_DECISION];

export const GATE_STATUS = {
  ACTIVE: 'ACTIVE',
  CLOSED: 'CLOSED',
} as const;
export type GateStatus = (typeof GATE_STATUS)[keyof typeof GATE_STATUS];

// ---------------------------------------------------------------------------
// Finance
// ---------------------------------------------------------------------------

export const FEE_CALC_KIND = {
  FLAT_PER_TICKET: 'FLAT_PER_TICKET',
  FLAT_PER_ORDER: 'FLAT_PER_ORDER',
  PERCENT_OF_SUBTOTAL: 'PERCENT_OF_SUBTOTAL',
  TIERED_PER_TICKET: 'TIERED_PER_TICKET',
} as const;
export type FeeCalcKind = (typeof FEE_CALC_KIND)[keyof typeof FEE_CALC_KIND];

export const FEE_BEARER = {
  /** Added on top of the subtotal */
  CUSTOMER: 'CUSTOMER',
  /** Deducted from the organizer's share instead */
  ORGANIZER: 'ORGANIZER',
} as const;
export type FeeBearer = (typeof FEE_BEARER)[keyof typeof FEE_BEARER];

export const FEE_VISIBILITY = {
  ITEMISED: 'ITEMISED',
  INCLUDED: 'INCLUDED',
} as const;
export type FeeVisibility = (typeof FEE_VISIBILITY)[keyof typeof FEE_VISIBILITY];

export const ROUNDING_MODE = {
  HALF_UP: 'HALF_UP',
  UP: 'UP',
  DOWN: 'DOWN',
} as const;
export type RoundingMode = (typeof ROUNDING_MODE)[keyof typeof ROUNDING_MODE];

export const FEE_SCHEDULE_SCOPE = {
  PLATFORM: 'PLATFORM',
  ORGANIZATION: 'ORGANIZATION',
  EVENT: 'EVENT',
} as const;
export type FeeScheduleScope = (typeof FEE_SCHEDULE_SCOPE)[keyof typeof FEE_SCHEDULE_SCOPE];

export const FEE_SCHEDULE_STATUS = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  SUPERSEDED: 'SUPERSEDED',
} as const;
export type FeeScheduleStatus = (typeof FEE_SCHEDULE_STATUS)[keyof typeof FEE_SCHEDULE_STATUS];

export const SETTLEMENT_STATUS = {
  DRAFT: 'DRAFT',
  APPROVED: 'APPROVED',
  PAID: 'PAID',
  DISPUTED: 'DISPUTED',
  CANCELLED: 'CANCELLED',
} as const;
export type SettlementStatus = (typeof SETTLEMENT_STATUS)[keyof typeof SETTLEMENT_STATUS];

// ---------------------------------------------------------------------------
// Identity
// ---------------------------------------------------------------------------

export const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  DELETED: 'DELETED',
} as const;
export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS];

export const ORGANIZATION_KIND = {
  PLATFORM: 'PLATFORM',
  STADIUM_OPERATOR: 'STADIUM_OPERATOR',
  EVENT_ORGANIZER: 'EVENT_ORGANIZER',
  CLUB: 'CLUB',
} as const;
export type OrganizationKind = (typeof ORGANIZATION_KIND)[keyof typeof ORGANIZATION_KIND];

export const MEMBERSHIP_STATUS = {
  ACTIVE: 'ACTIVE',
  REVOKED: 'REVOKED',
  EXPIRED: 'EXPIRED',
} as const;
export type MembershipStatus = (typeof MEMBERSHIP_STATUS)[keyof typeof MEMBERSHIP_STATUS];

export const SCOPE_KIND = {
  PLATFORM: 'PLATFORM',
  ORGANIZATION: 'ORGANIZATION',
  VENUE: 'VENUE',
  EVENT: 'EVENT',
} as const;
export type ScopeKind = (typeof SCOPE_KIND)[keyof typeof SCOPE_KIND];

// ---------------------------------------------------------------------------
// Platform
// ---------------------------------------------------------------------------

export const CLIENT_APP = {
  CUSTOMER: 'CUSTOMER',
  GATE: 'GATE',
  KIOSK: 'KIOSK',
  WEB: 'WEB',
  ADMIN: 'ADMIN',
  SYSTEM: 'SYSTEM',
} as const;
export type ClientApp = (typeof CLIENT_APP)[keyof typeof CLIENT_APP];

export const AUDIT_SEVERITY = {
  INFO: 'INFO',
  NOTICE: 'NOTICE',
  WARNING: 'WARNING',
  CRITICAL: 'CRITICAL',
} as const;
export type AuditSeverity = (typeof AUDIT_SEVERITY)[keyof typeof AUDIT_SEVERITY];

export const ACTOR_KIND = {
  USER: 'USER',
  SYSTEM: 'SYSTEM',
  PROVIDER: 'PROVIDER',
  DEVICE: 'DEVICE',
} as const;
export type ActorKind = (typeof ACTOR_KIND)[keyof typeof ACTOR_KIND];

export const IDEMPOTENCY_STATUS = {
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
} as const;
export type IdempotencyStatus = (typeof IDEMPOTENCY_STATUS)[keyof typeof IDEMPOTENCY_STATUS];

export const JOB_STATUS = {
  RUNNING: 'RUNNING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
} as const;
export type JobStatus = (typeof JOB_STATUS)[keyof typeof JOB_STATUS];

export const CURRENCY = {
  KES: 'KES',
} as const;
export type Currency = (typeof CURRENCY)[keyof typeof CURRENCY];
