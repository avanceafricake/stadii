/** Holds, orders and order items — docs/domain/06 and 07 */

import type {
  AdmissionKind,
  ClientApp,
  FeeBearer,
  FeeVisibility,
  HoldReleaseReason,
  HoldStatus,
  OrderStatus,
  SalesChannel,
} from '@stadii/shared-constants';
import type {
  AllocationId,
  ContactDetails,
  EventId,
  FeeScheduleId,
  HoldId,
  Instant,
  KioskId,
  MinorUnits,
  OrderId,
  OrderItemId,
  OrgId,
  SeatId,
  TicketId,
  TicketTypeId,
  Timestamped,
  UserId,
  Versioned,
} from './common';

// ---------------------------------------------------------------------------
// Holds
// ---------------------------------------------------------------------------

export type HoldItem =
  | {
      readonly kind: 'SEAT';
      readonly ticketTypeId: TicketTypeId;
      readonly seatId: SeatId;
      readonly priceMinor: MinorUnits;
    }
  | {
      readonly kind: 'GA';
      readonly ticketTypeId: TicketTypeId;
      readonly allocationId: AllocationId;
      /** Release returns capacity to the SAME shard, so it cannot leak */
      readonly shardId: string;
      readonly quantity: number;
      readonly priceMinor: MinorUnits;
    };

export interface Hold extends Timestamped, Versioned {
  readonly id: HoldId;
  readonly eventId: EventId;

  /**
   * Exactly one of these. A hold is not required to belong to a user — a kiosk
   * sells to a walk-up customer with no account, and web guest checkout is a
   * real conversion requirement. It IS required to belong to something the
   * backend issued and can validate.
   */
  readonly userId?: UserId;
  readonly sessionRef?: string;

  readonly createdByApp: ClientApp;
  readonly kioskId?: KioskId;

  /** Capped at `event.policy.maxTicketsPerOrder` */
  readonly items: readonly HoldItem[];

  readonly status: HoldStatus;
  readonly orderId?: OrderId;

  readonly expiresAt: Instant;
  /** Capped, so a customer cannot squat indefinitely */
  readonly extendedCount: number;
  readonly releasedAt?: Instant;
  readonly releaseReason?: HoldReleaseReason;
  /** Set only on a terminal hold, so the TTL policy cannot delete a live one */
  readonly ttlAt?: Instant;
}

// ---------------------------------------------------------------------------
// Order pricing snapshot — ADR-0013
// ---------------------------------------------------------------------------

export interface AppliedFeeLine {
  readonly code: string;
  readonly label: string;
  readonly amountMinor: MinorUnits;
  readonly bearer: FeeBearer;
  readonly visibility: FeeVisibility;
  /** Human-readable, so support can explain a charge without re-deriving it */
  readonly basis: string;
}

/**
 * Computed ONCE at order creation and frozen. A later fee schedule change never
 * alters an existing order, which is what makes `setFeeSchedule` safe to run
 * during trading and settlements reproducible months later.
 */
export interface OrderPricing {
  readonly feeScheduleId: FeeScheduleId;
  readonly feeScheduleVersion: number;
  readonly currency: 'KES';

  readonly ticketSubtotalMinor: MinorUnits;
  readonly feeLines: readonly AppliedFeeLine[];
  readonly customerFeesMinor: MinorUnits;
  readonly organizerFeesMinor: MinorUnits;

  /** The single amount the customer pays */
  readonly grossPayableMinor: MinorUnits;

  readonly organizerGrossMinor: MinorUnits;
  readonly platformRevenueMinor: MinorUnits;
  readonly providerFeeEstimateMinor: MinorUnits;
  readonly providerFeeActualMinor?: MinorUnits;

  readonly computedAt: Instant;
}

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

export interface OrderItem {
  readonly id: OrderItemId;
  readonly ticketTypeId: TicketTypeId;
  /** Frozen copy */
  readonly ticketTypeName: string;
  readonly admissionKind: AdmissionKind;
  readonly quantity: number;
  readonly unitPriceMinor: MinorUnits;
  readonly lineSubtotalMinor: MinorUnits;
  /** RESERVED_SEAT only; length === quantity */
  readonly seatIds?: readonly SeatId[];
  /** GENERAL_ADMISSION only */
  readonly allocationId?: AllocationId;
  readonly shardId?: string;
}

export interface Order extends Timestamped, Versioned {
  readonly id: OrderId;
  /** Human-quotable. Customers phone support and read this aloud. */
  readonly orderNumber: string;
  readonly eventId: EventId;
  /** Denormalised for settlement queries */
  readonly organizationId: OrgId;

  readonly ownerUserId?: UserId;
  readonly contact: ContactDetails;
  readonly channel: SalesChannel;
  readonly kioskId?: KioskId;
  readonly soldByUserId?: UserId;

  readonly holdId: HoldId;
  readonly items: readonly OrderItem[];

  readonly pricing: OrderPricing;

  readonly status: OrderStatus;
  readonly statusReason?: string;

  /** Inherited from the hold */
  readonly expiresAt: Instant;
  readonly paidAt?: Instant;
  readonly fulfilledAt?: Instant;
  readonly cancelledAt?: Instant;

  /** Populated at issuance. An order is NOT an admission credential. */
  readonly ticketIds: readonly TicketId[];

  readonly metadata?: Readonly<Record<string, string>>;
}
