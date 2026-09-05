/** Fees and settlement — docs/domain/11-money-and-settlement.md, ADR-0013 */

import type {
  AdmissionKind,
  FeeBearer,
  FeeScheduleStatus,
  FeeVisibility,
  RoundingMode,
  SettlementStatus,
} from '@stadii/shared-constants';
import type {
  BasisPoints,
  EventId,
  FeeScheduleId,
  Instant,
  MinorUnits,
  OrderId,
  OrgId,
  Period,
  SettlementId,
  TicketTypeId,
  Timestamped,
  UserId,
  Versioned,
} from './common';

export type FeeCalc =
  | { readonly kind: 'FLAT_PER_TICKET'; readonly amountMinor: MinorUnits }
  | { readonly kind: 'FLAT_PER_ORDER'; readonly amountMinor: MinorUnits }
  | {
      readonly kind: 'PERCENT_OF_SUBTOTAL';
      readonly basisPoints: BasisPoints;
      readonly minMinor?: MinorUnits;
      readonly maxMinor?: MinorUnits;
    }
  | {
      readonly kind: 'TIERED_PER_TICKET';
      readonly tiers: readonly { readonly uptoMinor: MinorUnits; readonly amountMinor: MinorUnits }[];
    };

export interface FeeLineDefinition {
  /** "PLATFORM_FEE", "PAYMENT_PROCESSING" */
  readonly code: string;
  readonly label: string;
  readonly calc: FeeCalc;
  /**
   * CUSTOMER fees are added on top of the subtotal; ORGANIZER fees are deducted
   * from the organizer's share instead. This is what makes organizer-absorbed
   * fees possible without a second model.
   */
  readonly bearer: FeeBearer;
  readonly visibility: FeeVisibility;
  readonly appliesTo?: {
    readonly ticketTypeIds?: readonly TicketTypeId[];
    readonly admissionKinds?: readonly AdmissionKind[];
  };
  readonly roundingMode: RoundingMode;
}

export type FeeScheduleTarget =
  | { readonly kind: 'PLATFORM' }
  | { readonly kind: 'ORGANIZATION'; readonly organizationId: OrgId }
  | { readonly kind: 'EVENT'; readonly eventId: EventId };

/**
 * The current requirement — KES 5 per ticket — is ONE ROW of configuration:
 *
 *   { code: "PLATFORM_FEE", calc: { kind: "FLAT_PER_TICKET", amountMinor: 500 },
 *     bearer: "CUSTOMER", visibility: "ITEMISED", roundingMode: "HALF_UP" }
 *
 * Changing it is an audited admin action, not a deploy (Constitution §10).
 *
 * Resolution order: event-scoped, else organization-scoped, else platform.
 * Exactly one applies — scopes do NOT stack, because stacked fee schedules are
 * impossible to explain to an organizer questioning a settlement.
 */
export interface FeeSchedule extends Timestamped, Versioned {
  readonly id: FeeScheduleId;
  readonly scheduleVersion: number;
  readonly name: string;
  readonly target: FeeScheduleTarget;
  readonly currency: 'KES';
  readonly lines: readonly FeeLineDefinition[];
  readonly effectiveFrom: Instant;
  readonly effectiveTo?: Instant;
  readonly status: FeeScheduleStatus;
  readonly createdByUserId: UserId;
}

export interface SettlementLine {
  readonly id: string;
  readonly orderId: OrderId;
  readonly eventId: EventId;
  readonly ticketCount: number;
  readonly grossMinor: MinorUnits;
  readonly organizerGrossMinor: MinorUnits;
  readonly platformFeesMinor: MinorUnits;
  readonly refundedMinor: MinorUnits;
  readonly netMinor: MinorUnits;
}

/**
 * Settlement SUMS THE SNAPSHOTS on orders. It never recomputes fees — if it did,
 * a fee schedule change would silently alter historical settlements, which is
 * the precise failure snapshotting exists to prevent.
 */
export interface Settlement extends Timestamped, Versioned {
  readonly id: SettlementId;
  readonly organizationId: OrgId;
  /** Per-event, or period-based across events */
  readonly eventId?: EventId;
  readonly period: Period;
  readonly currency: 'KES';

  readonly grossCollectedMinor: MinorUnits;
  readonly refundsMinor: MinorUnits;
  readonly platformFeesMinor: MinorUnits;
  readonly providerFeesMinor: MinorUnits;
  readonly adjustmentsMinor: MinorUnits;
  readonly netPayableMinor: MinorUnits;

  readonly orderCount: number;
  readonly ticketCount: number;
  readonly refundCount: number;

  readonly status: SettlementStatus;
  readonly approvedByUserId?: UserId;
  readonly paidAt?: Instant;
  /** Bank or M-Pesa B2B reference */
  readonly paymentReference?: string;
  readonly generatedAt: Instant;
}
