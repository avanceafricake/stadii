/**
 * Tickets, credentials and transfers — docs/domain/08 and 09, ADR-0009.
 *
 * A ticket is ONE INDEPENDENT ADMISSION CREDENTIAL. An order for five tickets
 * produces five tickets, each separately identifiable, transferable, scannable
 * and refundable. An order is never itself a credential (Constitution §11).
 */

import type {
  AdmissionKind,
  CredentialRevokeReason,
  CredentialStatus,
  TicketStatus,
  TransferState,
  TransferStatus,
} from '@stadii/shared-constants';
import type {
  AllocationId,
  AreaId,
  ContactDetails,
  DeviceId,
  EventId,
  GateId,
  Instant,
  MinorUnits,
  OrderId,
  OrderItemId,
  OrgId,
  SeatId,
  TicketId,
  TicketTypeId,
  Timestamped,
  TransferId,
  UserId,
  Versioned,
} from './common';

export interface TicketTransferHistoryEntry {
  readonly transferId: TransferId;
  readonly fromUserId: UserId;
  readonly toUserId: UserId;
  readonly at: Instant;
  readonly credentialVersionAfter: number;
}

export interface Ticket extends Timestamped, Versioned {
  /** Deterministic: derived from (orderId, itemIndex, seq) — ADR-0014 */
  readonly id: TicketId;
  readonly ticketNumber: string;

  readonly orderId: OrderId;
  readonly orderItemId: OrderItemId;
  readonly eventId: EventId;
  readonly organizationId: OrgId;

  readonly ticketTypeId: TicketTypeId;
  /** Frozen */
  readonly ticketTypeName: string;
  readonly admissionKind: AdmissionKind;

  // Inventory reference — exactly one branch applies
  readonly seatId?: SeatId;
  readonly seatDisplayLabel?: string;
  readonly areaId?: AreaId;
  readonly areaPathString?: string;
  readonly allocationId?: AllocationId;
  readonly gaAreaLabel?: string;

  /**
   * Two distinct concepts. `purchaserUserId` is immutable and records who paid;
   * a refund goes to them. `holderUserId` records who controls it now and
   * changes on transfer; admission belongs to them.
   */
  readonly purchaserUserId?: UserId;
  readonly holderUserId?: UserId;
  readonly holderContact?: ContactDetails;

  /** Orthogonal facets — see the TICKET_STATUS comment in shared-constants */
  readonly status: TicketStatus;
  readonly transferState: TransferState;
  readonly transferHistory?: readonly TicketTransferHistoryEntry[];

  /** The credential VALUE is not stored here. Only its version. */
  readonly credentialVersion: number;
  readonly credentialIssuedAt: Instant;

  readonly usedAt?: Instant;
  readonly admittedAtGateId?: GateId;
  readonly admittedByDeviceId?: DeviceId;
  /** Including denied attempts */
  readonly scanCount: number;

  /** Display copy, refreshed by trigger. The scan re-reads the event. */
  readonly eventSummary: {
    readonly title: string;
    readonly startsAt: Instant;
    readonly venueName: string;
  };

  /** This ticket's share of the order, for per-ticket refunds */
  readonly amountMinor: MinorUnits;
  readonly issuedAt: Instant;
  readonly voidedAt?: Instant;
  readonly voidReason?: string;
}

/**
 * `ticketCredentials/{sha256(credential)}`.
 *
 * The raw credential is generated once, returned to the holder, and NEVER
 * stored. A read-only database leak yields hashes, and hashes do not open
 * turnstiles. Lookup is a single point read — no query, no index, which is what
 * keeps gate latency inside its budget.
 */
export interface TicketCredential {
  /** sha256 hex of the raw credential */
  readonly id: string;
  readonly ticketId: TicketId;
  /** Duplicated so an obviously-wrong-event scan is rejected on the first read */
  readonly eventId: EventId;
  readonly version: number;
  readonly status: CredentialStatus;
  readonly issuedAt: Instant;
  readonly revokedAt?: Instant;
  readonly revokedReason?: CredentialRevokeReason;
}

export interface TicketTransfer extends Timestamped, Versioned {
  readonly id: TransferId;
  readonly ticketId: TicketId;
  readonly eventId: EventId;

  readonly fromUserId: UserId;
  readonly toUserId?: UserId;
  /**
   * sha256 of the normalised phone or email. The platform does not hold a
   * plaintext number for someone who is not yet a user and may never become one.
   */
  readonly toContactHash: string;
  readonly toContactMasked: string;

  /** Single-use, consumed atomically at acceptance. Stored hashed. */
  readonly claimTokenHash: string;
  readonly claimTokenVersion: number;

  readonly status: TransferStatus;
  readonly message?: string;

  /** Capped at the event's transfer cutoff, so an offer can never outlive it */
  readonly expiresAt: Instant;
  readonly acceptedAt?: Instant;
  readonly cancelledAt?: Instant;
  readonly declinedAt?: Instant;
  readonly terminalReason?: string;

  /** Failed claim attempts, for rate limiting and as a visible signal */
  readonly attemptCount: number;
}
