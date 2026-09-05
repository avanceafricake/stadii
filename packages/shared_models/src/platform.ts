/** Audit, notifications, config, idempotency — docs/domain/13-audit.md */

import type {
  ActorKind,
  AuditSeverity,
  ClientApp,
  IdempotencyStatus,
} from '@stadii/shared-constants';
import type { Scope } from './identity';
import type {
  DeviceId,
  FeeScheduleId,
  Instant,
  ProviderId,
  UserId,
} from './common';

export interface AuditActor {
  readonly kind: ActorKind;
  readonly userId?: UserId;
  readonly deviceId?: DeviceId;
  /** The ROLE used to authorize this action, not just the person */
  readonly roleId?: string;
  readonly scope?: Scope;
  readonly provider?: ProviderId;
  readonly ip?: string;
  readonly userAgent?: string;
  readonly app?: ClientApp;
}

export interface AuditEntityRef {
  readonly type: string;
  readonly id: string;
}

/**
 * Written in the SAME TRANSACTION as the state change it describes — never by a
 * Firestore trigger. A trigger can be delayed, can fail silently, and can be
 * lost during a redeploy. A log that is usually complete is not a log anyone can
 * rely on during a dispute about who refunded what.
 *
 * Append-only: no update or delete path exists in any use case.
 */
export interface AuditLog {
  readonly id: string;
  readonly actor: AuditActor;
  /** "event.publish", "ticket.transfer.accept" */
  readonly action: string;
  readonly severity: AuditSeverity;

  readonly entity: AuditEntityRef;
  readonly relatedEntities?: readonly AuditEntityRef[];

  /** SELECTED fields only, never whole documents */
  readonly before?: Readonly<Record<string, unknown>>;
  readonly after?: Readonly<Record<string, unknown>>;

  readonly metadata?: Readonly<Record<string, unknown>>;
  /** MANDATORY for overrides and destructive acts — the domain rejects without it */
  readonly reason?: string;

  /** Correlates every record produced by one request */
  readonly requestId: string;
  readonly idempotencyKey?: string;
  readonly at: Instant;
}

export interface Notification {
  readonly id: string;
  readonly userId: UserId;
  readonly kind: string;
  readonly title: string;
  readonly body: string;
  readonly data?: Readonly<Record<string, string>>;
  readonly channels: readonly ('PUSH' | 'SMS' | 'EMAIL' | 'IN_APP')[];
  readonly sentAt?: Instant;
  readonly readAt?: Instant;
  readonly createdAt: Instant;
  readonly expiresAt: Instant;
}

/**
 * `idempotencyKeys/{command}:{actorId}:{key}` — ADR-0014.
 *
 * IN_PROGRESS is written BEFORE execution, so two concurrent identical requests
 * serialise rather than both executing.
 */
export interface IdempotencyRecord {
  readonly id: string;
  readonly command: string;
  readonly actorId: string;
  /** sha256 of the canonicalised payload. Same key + different payload is a bug. */
  readonly requestHash: string;
  readonly status: IdempotencyStatus;
  readonly result?: unknown;
  readonly errorCode?: string;
  readonly createdAt: Instant;
  /** Deleted by a Firestore TTL policy, not a job */
  readonly expiresAt: Instant;
}

/**
 * `config/platform`. Every value the Constitution says must not be hard-coded
 * lives here or in a fee schedule. Writes require `config:write` and are audited
 * at CRITICAL.
 */
export interface PlatformConfig {
  readonly defaultHoldDurationSeconds: number;
  readonly defaultMaxTicketsPerOrder: number;
  readonly defaultCurrency: 'KES';
  readonly activeFeeScheduleId: FeeScheduleId;
  readonly paymentTimeoutSeconds: Readonly<Record<string, number>>;
  readonly reconciliationBackoffSeconds: readonly number[];
  readonly gaShardTargetPerShard: number;
  readonly gaShardMax: number;
  readonly transferOfferTtlHours: number;
  readonly maxHoldExtensions: number;
  readonly featureFlags: Readonly<Record<string, boolean>>;
  readonly updatedAt: Instant;
  readonly updatedByUserId: UserId;
}
