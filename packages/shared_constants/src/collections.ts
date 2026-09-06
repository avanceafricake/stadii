/**
 * Firestore collection names — docs/data/firestore-collections.md.
 *
 * Constitution §21 forbids ad-hoc collections without domain justification. A
 * collection that is not in this file does not exist, and adding one means adding
 * it here, to the data document, and to `firestore.rules`.
 */

export const COLLECTIONS = {
  // Identity
  USERS: 'users',
  ORGANIZATIONS: 'organizations',
  MEMBERSHIPS: 'memberships',
  ROLES: 'roles',

  // Catalogue
  SPORTS: 'sports',
  PARTICIPANTS: 'participants',
  COMPETITIONS: 'competitions',

  // Venue
  VENUES: 'venues',
  /**
   * Administrative areas venues sit in — Kenya's counties today.
   *
   * A collection rather than a string on the address because it is REFERENCED:
   * a county page lists its venues, and "venues in Nakuru" is a query rather
   * than a string comparison. Only counties that actually hold a venue exist;
   * a gazetteer of all 47 with nothing in them would be data that relates to
   * nothing.
   */
  COUNTIES: 'counties',

  // Event
  EVENTS: 'events',

  // Sales
  HOLDS: 'holds',
  ORDERS: 'orders',

  // Payments
  PAYMENTS: 'payments',
  PAYMENT_EVENT_DEDUPE: 'paymentEventDedupe',
  ORPHANED_PAYMENT_EVENTS: 'orphanedPaymentEvents',
  REFUNDS: 'refunds',

  // Ticketing
  TICKETS: 'tickets',
  /** Keyed by sha256(credential) — a point read, no query, no index */
  TICKET_CREDENTIALS: 'ticketCredentials',
  TICKET_TRANSFERS: 'ticketTransfers',

  // Access
  GATE_DEVICES: 'gateDevices',
  GATE_DEVICE_ASSIGNMENTS: 'gateDeviceAssignments',
  GATE_SCANS: 'gateScans',
  KIOSKS: 'kiosks',

  // Finance
  FEE_SCHEDULES: 'feeSchedules',
  SETTLEMENTS: 'settlements',
  RECONCILIATION_EXCEPTIONS: 'reconciliationExceptions',

  // Platform
  AUDIT_LOGS: 'auditLogs',
  /** Keyed `<command>:<actorId>:<key>` — create-on-collision IS the dedupe */
  IDEMPOTENCY_KEYS: 'idempotencyKeys',
  NOTIFICATIONS: 'notifications',
  CONFIG: 'config',
  PUBLISH_JOBS: 'publishJobs',
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];

/** Subcollection names, always used beneath a known parent. */
export const SUBCOLLECTIONS = {
  // venues/{venueId}/...
  AREAS: 'areas',
  SEATS: 'seats',
  GATES: 'gates',

  // events/{eventId}/...
  EVENT_PARTICIPANTS: 'participants',
  TICKET_TYPES: 'ticketTypes',
  ALLOCATIONS: 'allocations',
  SEAT_INVENTORY: 'seatInventory',
  GA_INVENTORY: 'gaInventory',
  /** events/{id}/gaInventory/{allocationId}/shards/{shardId} — ADR-0008 */
  SHARDS: 'shards',

  // orders/{orderId}/...
  ORDER_ITEMS: 'items',

  // payments/{paymentId}/...
  PROVIDER_EVENTS: 'providerEvents',

  // settlements/{settlementId}/...
  SETTLEMENT_LINES: 'lines',

  // competitions/{competitionId}/...
  SEASONS: 'seasons',
} as const;

export type SubcollectionName = (typeof SUBCOLLECTIONS)[keyof typeof SUBCOLLECTIONS];

/** Config document IDs. `config/platform` is backend-only; `config/public` is readable. */
export const CONFIG_DOCS = {
  PLATFORM: 'platform',
  PUBLIC: 'public',
} as const;

// ---------------------------------------------------------------------------
// Path builders. Nothing constructs a Firestore path by string concatenation
// outside this file.
// ---------------------------------------------------------------------------

export const paths = {
  venue: (venueId: string) => `${COLLECTIONS.VENUES}/${venueId}`,
  venueAreas: (venueId: string) => `${COLLECTIONS.VENUES}/${venueId}/${SUBCOLLECTIONS.AREAS}`,
  venueArea: (venueId: string, areaId: string) =>
    `${COLLECTIONS.VENUES}/${venueId}/${SUBCOLLECTIONS.AREAS}/${areaId}`,
  venueSeats: (venueId: string) => `${COLLECTIONS.VENUES}/${venueId}/${SUBCOLLECTIONS.SEATS}`,
  venueSeat: (venueId: string, seatId: string) =>
    `${COLLECTIONS.VENUES}/${venueId}/${SUBCOLLECTIONS.SEATS}/${seatId}`,
  venueGates: (venueId: string) => `${COLLECTIONS.VENUES}/${venueId}/${SUBCOLLECTIONS.GATES}`,

  event: (eventId: string) => `${COLLECTIONS.EVENTS}/${eventId}`,
  eventTicketTypes: (eventId: string) =>
    `${COLLECTIONS.EVENTS}/${eventId}/${SUBCOLLECTIONS.TICKET_TYPES}`,
  eventAllocations: (eventId: string) =>
    `${COLLECTIONS.EVENTS}/${eventId}/${SUBCOLLECTIONS.ALLOCATIONS}`,
  seatInventoryCollection: (eventId: string) =>
    `${COLLECTIONS.EVENTS}/${eventId}/${SUBCOLLECTIONS.SEAT_INVENTORY}`,
  /** Reuses the venue seat ID, so this is a direct path with no lookup */
  seatInventory: (eventId: string, seatId: string) =>
    `${COLLECTIONS.EVENTS}/${eventId}/${SUBCOLLECTIONS.SEAT_INVENTORY}/${seatId}`,
  gaInventory: (eventId: string, allocationId: string) =>
    `${COLLECTIONS.EVENTS}/${eventId}/${SUBCOLLECTIONS.GA_INVENTORY}/${allocationId}`,
  gaShard: (eventId: string, allocationId: string, shardId: string) =>
    `${COLLECTIONS.EVENTS}/${eventId}/${SUBCOLLECTIONS.GA_INVENTORY}/${allocationId}/` +
    `${SUBCOLLECTIONS.SHARDS}/${shardId}`,

  hold: (holdId: string) => `${COLLECTIONS.HOLDS}/${holdId}`,
  order: (orderId: string) => `${COLLECTIONS.ORDERS}/${orderId}`,
  payment: (paymentId: string) => `${COLLECTIONS.PAYMENTS}/${paymentId}`,
  ticket: (ticketId: string) => `${COLLECTIONS.TICKETS}/${ticketId}`,
  ticketCredential: (credentialHash: string) =>
    `${COLLECTIONS.TICKET_CREDENTIALS}/${credentialHash}`,
  transfer: (transferId: string) => `${COLLECTIONS.TICKET_TRANSFERS}/${transferId}`,

  idempotencyKey: (command: string, actorId: string, key: string) =>
    `${COLLECTIONS.IDEMPOTENCY_KEYS}/${command}:${actorId}:${key}`,
  paymentEventDedupe: (providerEventKey: string) =>
    `${COLLECTIONS.PAYMENT_EVENT_DEDUPE}/${providerEventKey}`,

  platformConfig: () => `${COLLECTIONS.CONFIG}/${CONFIG_DOCS.PLATFORM}`,
  publicConfig: () => `${COLLECTIONS.CONFIG}/${CONFIG_DOCS.PUBLIC}`,
} as const;
