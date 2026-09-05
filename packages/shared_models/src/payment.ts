/**
 * Payments and refunds — docs/domain/07-orders-and-payments.md, ADR-0011.
 *
 * Provider-neutral by construction. The domain knows `NormalizedPaymentEvent`;
 * it does not know what a `CheckoutRequestID` is. That word appears in exactly
 * one file, the M-Pesa adapter.
 */

import type {
  PaymentEventSource,
  PaymentStatus,
  RefundReason,
  RefundStatus,
} from '@stadii/shared-constants';
import type {
  EventId,
  Instant,
  MinorUnits,
  OrderId,
  PaymentId,
  ProviderId,
  RefundId,
  TicketId,
  Timestamped,
  UserId,
  Versioned,
} from './common';

/** Provider identifiers. The card acquirer is deliberately unselected. */
export const PROVIDER_IDS = {
  MPESA_STK: 'MPESA_STK',
  CARD: 'CARD',
} as const;

export interface Payment extends Timestamped, Versioned {
  readonly id: PaymentId;
  readonly orderId: OrderId;
  /** Denormalised for reconciliation queries */
  readonly eventId: EventId;
  readonly attemptNumber: number;

  readonly provider: ProviderId;
  /** The provider's canonical reference */
  readonly providerRef?: string;
  /** Our correlation id, sent to the provider */
  readonly providerCorrelationId?: string;

  /** MUST equal `order.pricing.grossPayableMinor` */
  readonly amountMinor: MinorUnits;
  readonly currency: 'KES';

  readonly status: PaymentStatus;
  /** Normalised, not the provider's own code */
  readonly failureCode?: string;
  /** Provider text, kept for support */
  readonly failureMessage?: string;

  /** Masked MSISDN or card last four. NEVER a full PAN. */
  readonly payerRef?: string;

  readonly initiatedAt: Instant;
  readonly pendingSince?: Instant;
  readonly settledAt?: Instant;
  readonly lastCheckedAt?: Instant;

  readonly reconciliation: {
    readonly checkCount: number;
    readonly nextCheckAt?: Instant;
    readonly source?: PaymentEventSource;
  };
}

/**
 * `payments/{id}/providerEvents/{eventId}` — raw provider payloads. Bulky,
 * sensitive, unreadable by any client, retained for dispute resolution.
 */
export interface ProviderEventRecord {
  readonly id: string;
  readonly paymentId: PaymentId;
  readonly provider: ProviderId;
  readonly receivedAt: Instant;
  readonly direction: 'INBOUND' | 'OUTBOUND';
  readonly payload: unknown;
}

/** What every provider adapter normalises its callbacks and queries into. */
export interface NormalizedPaymentEvent {
  readonly provider: ProviderId;
  readonly providerRef: string;
  /** Used to create the dedupe document; creation failing on collision IS the dedupe */
  readonly providerEventKey: string;
  readonly status: PaymentStatus;
  readonly amountMinor?: MinorUnits;
  readonly payerRef?: string;
  readonly failureCode?: string;
  readonly failureMessage?: string;
  readonly occurredAt: Instant;
}

/**
 * Refunds are PER TICKET, not per order. A customer who bought five and attended
 * with three may be refunded two; the order then becomes PARTIALLY_REFUNDED.
 */
export interface Refund extends Timestamped, Versioned {
  readonly id: RefundId;
  readonly orderId: OrderId;
  readonly paymentId: PaymentId;
  readonly ticketIds: readonly TicketId[];
  readonly amountMinor: MinorUnits;
  readonly reason: RefundReason;
  readonly reasonNote?: string;
  readonly requestedByUserId?: UserId;
  readonly status: RefundStatus;
  readonly providerRef?: string;
  readonly requestedAt: Instant;
  readonly completedAt?: Instant;
  /** From `event.policy.refundPolicy.feesRefundable`, not a constant */
  readonly feesRefunded: boolean;
  /** True when `finance:refund:override` was used. Audited at CRITICAL. */
  readonly wasOverride?: boolean;
}

/** Money discrepancies raised for Finance. Never auto-corrected. */
export interface ReconciliationException extends Timestamped {
  readonly id: string;
  readonly kind: 'AMOUNT_MISMATCH' | 'MISSING_PAYMENT' | 'PROVIDER_FEE_DELTA' | 'ORPHANED_EVENT';
  readonly paymentId?: PaymentId;
  readonly orderId?: OrderId;
  readonly expectedMinor?: MinorUnits;
  readonly actualMinor?: MinorUnits;
  readonly detail: string;
  readonly status: 'OPEN' | 'RESOLVED';
  readonly detectedAt: Instant;
  readonly resolvedAt?: Instant;
  readonly resolvedByUserId?: UserId;
}
