/** Event: event-first, N participants — docs/domain/04-events.md, ADR-0004 */

import type {
  EventOperationalStatus,
  EventPublicationStatus,
  EventSalesStatus,
  EventVisibility,
  ParticipantRole,
  QrPolicy,
} from '@stadii/shared-constants';
import type { ParticipantSummary } from './catalog';
import type {
  Attributed,
  CompetitionId,
  EventId,
  EventParticipantId,
  Instant,
  OrgId,
  ParticipantId,
  SeasonId,
  SportId,
  TimeWindow,
  Timestamped,
  VenueId,
  Versioned,
} from './common';
import type { VenueSummary } from './venue';

/**
 * Everything an organizer can vary per event. Every one of these is
 * configuration; none is a constant in code (Constitution §10, §21).
 */
export interface EventPolicy {
  readonly allowLateSales: boolean;
  readonly allowTransfers: boolean;
  readonly transferCutoffMinutes?: number;
  readonly maxTicketsPerOrder: number;
  readonly maxTicketsPerCustomer?: number;
  /**
   * The field people reach for during a high-demand on-sale. It must be
   * changeable without a deploy.
   */
  readonly holdDurationSeconds: number;
  readonly enforceGateAreaMatching: boolean;
  readonly requireHolderIdentity: boolean;
  /** ROTATING is designed for but not built — ADR-0009 */
  readonly qrPolicy: QrPolicy;
  readonly refundPolicy: {
    readonly customerCancellable: boolean;
    readonly cutoffHoursBeforeStart?: number;
    readonly feesRefundable: boolean;
  };
}

export interface Event extends Timestamped, Versioned, Attributed {
  readonly id: EventId;
  /** The organizer who owns this event and is settled for it */
  readonly organizationId: OrgId;
  readonly sportId: SportId;
  readonly competitionId?: CompetitionId;
  readonly seasonId?: SeasonId;

  /**
   * ALWAYS stored, never derived. The admin UI may propose
   * "Gor Mahia vs AFC Leopards" from participants at creation, but once saved it
   * is an ordinary string. That is what lets "Kenya National Swimming
   * Championships" be a first-class title rather than a special case.
   */
  readonly title: string;
  readonly subtitle?: string;
  readonly slug: string;
  readonly description?: string;
  /** Free-form organizer metadata. Never read by domain logic. */
  readonly metadata?: Readonly<Record<string, string>>;

  readonly venueId: VenueId;
  /** Pinned at publish — docs/domain/03-venues.md §Layout versioning */
  readonly venueLayoutVersion: number;
  readonly venueSummary: VenueSummary;

  readonly startsAt: Instant;
  readonly doorsOpenAt?: Instant;
  readonly endsAt?: Instant;
  readonly timezone: string;

  /**
   * THREE independent axes, never one field (ADR-0016).
   *
   *   publicationStatus — is it visible?
   *   operationalStatus — is it happening?
   *   salesStatus       — is it selling?
   *
   * A suspended on-sale is PUBLISHED + SCHEDULED + SUSPENDED: still visible,
   * not selling. That combination had no representation under a single enum.
   */
  readonly publicationStatus: EventPublicationStatus;
  readonly operationalStatus: EventOperationalStatus;
  readonly salesStatus: EventSalesStatus;
  readonly salesStatusReason?: string;
  readonly visibility: EventVisibility;

  readonly salesWindow: TimeWindow;
  readonly admissionWindow: TimeWindow;

  readonly policy: EventPolicy;

  /** Capped display copy for event cards. The subcollection is authoritative. */
  readonly participantSummaries: readonly ParticipantSummary[];
  readonly participantCount: number;

  /** Reporting only, refreshed by a job. Never decides anything. */
  readonly stats?: {
    readonly ticketsSold: number;
    readonly ticketsUsed: number;
    readonly updatedAt: Instant;
  };

  readonly publishedAt?: Instant;
  readonly cancelledAt?: Instant;
  readonly cancellationReason?: string;
}

/**
 * Cardinality is genuinely unconstrained. The domain enforces NO minimum
 * participant count:
 *
 *   Gor Mahia vs AFC Leopards            2, roles HOME and AWAY
 *   Nairobi Athletics Meet               0 at creation, later N COMPETITOR
 *   Kenya National Swimming Championships 0 — the event is the competition
 *   Charity exhibition, one headline club 1, role HOST
 */
export interface EventParticipant extends Timestamped {
  readonly id: EventParticipantId;
  readonly eventId: EventId;
  readonly participantId: ParticipantId;
  readonly role: ParticipantRole;
  readonly displayOrder: number;
  readonly summary: ParticipantSummary;
}

/** Progress document for the long-running publish job — docs/domain/04-events.md */
export interface PublishJob extends Timestamped {
  readonly id: string;
  readonly eventId: EventId;
  readonly status: 'RUNNING' | 'COMPLETED' | 'FAILED';
  readonly totalSeats: number;
  readonly processedSeats: number;
  readonly gaAllocations: number;
  readonly startedAt: Instant;
  readonly completedAt?: Instant;
  readonly error?: string;
  readonly startedByUserId: string;
}
