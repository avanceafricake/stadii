/** Gates, devices, scans, kiosks — docs/domain/10-access-and-admission.md */

import type {
  AssignmentStatus,
  DeviceStatus,
  ScanDecision,
} from '@stadii/shared-constants';
import type {
  DeviceId,
  EventId,
  GateId,
  Instant,
  KioskId,
  ScanId,
  TicketId,
  Timestamped,
  UserId,
  VenueId,
  Versioned,
} from './common';

/**
 * Registration and per-event assignment are separate because a stadium's
 * hardware is permanent while its deployment changes every event.
 */
export interface GateDevice extends Timestamped, Versioned {
  readonly id: DeviceId;
  readonly venueId: VenueId;
  readonly label: string;
  readonly deviceFingerprint: string;
  readonly assignedGateId?: GateId;
  readonly status: DeviceStatus;
  readonly registeredByUserId: UserId;
  readonly registeredAt: Instant;
  readonly lastSeenAt?: Instant;
  readonly appVersion?: string;
}

export interface GateDeviceAssignment extends Timestamped, Versioned {
  readonly id: string;
  readonly deviceId: DeviceId;
  readonly eventId: EventId;
  readonly gateId: GateId;
  /** Who is holding it — every admission is attributable to a person */
  readonly operatorUserId?: UserId;
  readonly shiftStartedAt: Instant;
  readonly shiftEndedAt?: Instant;
  readonly status: AssignmentStatus;
}

/**
 * EVERY scan is recorded, admitted or not. A cluster of ALREADY_USED at one gate
 * signals ticket forwarding; a cluster of WRONG_EVENT means yesterday's crowd is
 * arriving.
 */
export interface GateScan {
  readonly id: ScanId;
  readonly eventId: EventId;
  readonly venueId: VenueId;
  readonly gateId: GateId;
  readonly deviceId: DeviceId;
  readonly operatorUserId?: UserId;

  /** Absent when the credential was not recognised */
  readonly ticketId?: TicketId;
  /** Hashed. A scan log of raw credentials would be a list of admission secrets. */
  readonly credentialHash: string;

  readonly decision: ScanDecision;
  /** ADMISSION_DENIED_* — the operator needs to know WHY, not just "invalid" */
  readonly reasonCode?: string;
  readonly scanRequestId: string;
  readonly scannedAt: Instant;
  readonly latencyMs?: number;
  readonly isReversal?: boolean;
  readonly reversalReason?: string;
}

export interface Kiosk extends Timestamped, Versioned {
  readonly id: KioskId;
  readonly venueId: VenueId;
  readonly label: string;
  readonly deviceFingerprint: string;
  readonly acceptsCash: boolean;
  readonly status: DeviceStatus;
}

/**
 * Maintained by a POST-COMMIT projection, never by the admission transaction —
 * a counter write on the critical path would create contention exactly when
 * throughput matters most. Eventually consistent; nothing decides from it.
 */
export interface EventAdmissionStats {
  readonly eventId: EventId;
  readonly admitted: number;
  readonly denied: number;
  readonly byGate: Readonly<Record<string, { admitted: number; denied: number }>>;
  readonly byDenialReason: Readonly<Record<string, number>>;
  readonly updatedAt: Instant;
}
