/**
 * Inventory and pricing — docs/domain/05-inventory-and-pricing.md,
 * ADR-0006 (ticket type vs admission kind), ADR-0007 (materialised seat
 * inventory), ADR-0008 (sharded GA counters).
 */

import type {
  AccessibilityFeature,
  AdmissionKind,
  AllocationStatus,
  EligibilityKind,
  GaInventoryStatus,
  SeatInventoryStatus,
  TicketTypeStatus,
} from '@stadii/shared-constants';
import type {
  AllocationId,
  AreaId,
  EventId,
  HoldId,
  Instant,
  MinorUnits,
  OrderId,
  SeatId,
  TicketId,
  TicketTypeId,
  TimeWindow,
  Timestamped,
  Versioned,
} from './common';

/**
 * What the customer buys. Organizer-defined, per event, UNBOUNDED — the
 * Constitution's example list (VVIP, VIP, Regular, Student, Family, Member,
 * East Stand) never appears in code.
 *
 * Independent of `admissionKind`, which is how admission mechanically works.
 * "VIP" can be reserved seating at one venue and general admission at another.
 */
export interface TicketType extends Timestamped, Versioned {
  readonly id: TicketTypeId;
  readonly eventId: EventId;

  readonly name: string;
  readonly description?: string;
  readonly admissionKind: AdmissionKind;

  readonly priceMinor: MinorUnits;
  readonly currency: 'KES';

  /** May be narrower than the event's window, never wider */
  readonly salesWindow?: TimeWindow;

  readonly limits: {
    readonly minPerOrder: number;
    readonly maxPerOrder: number;
    readonly maxPerCustomer?: number;
  };

  readonly eligibility?: {
    readonly kind: EligibilityKind;
    /** e.g. "Student ID checked at the gate". STADII does not verify it. */
    readonly verificationNote?: string;
  };

  readonly displayOrder: number;
  /** Seat map legend */
  readonly colour?: string;

  /** SOLD_OUT here is DERIVED AND CACHED for display. The transaction decides. */
  readonly status: TicketTypeStatus;
}

/**
 * Links a ticket type to the venue areas it draws from.
 *
 * Invariant enforced at publish: at a given event, every seat belongs to AT MOST
 * ONE allocation. Overlapping allocations would let one seat be sold twice under
 * two ticket types at two prices.
 */
export interface Allocation extends Timestamped, Versioned {
  readonly id: AllocationId;
  readonly eventId: EventId;
  readonly ticketTypeId: TicketTypeId;
  /** SECTION, BLOCK, ROW, or GA_AREA */
  readonly venueAreaId: AreaId;
  /** Resolved at creation, used for overlap detection by prefix comparison */
  readonly areaPathString: string;

  /** GENERAL_ADMISSION only. May be lower than the area's physical capacity. */
  readonly offeredCapacity?: number;
  /** GENERAL_ADMISSION only. Fixed at publish; never changes for a live allocation. */
  readonly shardCount?: number;

  readonly status: AllocationStatus;
}

/**
 * The authoritative per-event, per-seat sale state. One document per sellable
 * seat, materialised at publish (ADR-0007).
 *
 * Document ID reuses the venue seat ID, so given an event and a seat this is a
 * direct path with no lookup.
 */
export interface SeatInventory extends Versioned {
  readonly id: SeatId;
  readonly eventId: EventId;
  readonly seatId: SeatId;
  readonly ticketTypeId: TicketTypeId;
  readonly allocationId: AllocationId;

  // Frozen copy from the venue at publish time. This is what decouples sold
  // inventory from later venue edits, and what lets the seat map render without
  // joining back to the venue.
  readonly areaId: AreaId;
  readonly areaPathString: string;
  readonly seatLabel: string;
  readonly displayLabel: string;
  readonly accessibility?: readonly AccessibilityFeature[];
  readonly geometry?: { readonly x: number; readonly y: number };

  readonly priceMinor: MinorUnits;

  readonly status: SeatInventoryStatus;
  readonly holdId?: HoldId;
  readonly holdExpiresAt?: Instant;
  readonly orderId?: OrderId;
  readonly ticketId?: TicketId;
  readonly blockedReason?: string;

  readonly updatedAt: Instant;
}

/**
 * GA capacity. `available` is NEVER stored — it is computed as
 * `capacity - held - sold` per shard and summed. A stored total would be a
 * second source of truth that can drift from the counters actually gating sales.
 */
export interface GaInventory extends Versioned {
  readonly id: AllocationId;
  readonly eventId: EventId;
  readonly allocationId: AllocationId;
  readonly ticketTypeId: TicketTypeId;
  readonly venueAreaId: AreaId;
  readonly gaAreaLabel: string;

  readonly offeredCapacity: number;
  readonly shardCount: number;
  readonly priceMinor: MinorUnits;
  readonly status: GaInventoryStatus;
  readonly updatedAt: Instant;
}

/** `events/{id}/gaInventory/{allocationId}/shards/{shardId}` — ADR-0008 */
export interface GaShard extends Versioned {
  readonly id: string;
  readonly capacity: number;
  readonly held: number;
  readonly sold: number;
  readonly used: number;
  readonly updatedAt: Instant;
}

/** Published aggregate for browsing. A hint; the transaction is the answer. */
export interface AvailabilitySummary {
  readonly eventId: EventId;
  readonly ticketTypeId: TicketTypeId;
  readonly admissionKind: AdmissionKind;
  readonly availableCount: number;
  readonly totalCount: number;
  readonly computedAt: Instant;
}
