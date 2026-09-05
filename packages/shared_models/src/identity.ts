/** Users, organizations, memberships, roles — docs/domain/12, ADR-0015 */

import type {
  MembershipStatus,
  OrganizationKind,
  Permission,
  RoleId,
  ScopeKind,
  UserStatus,
} from '@stadii/shared-constants';
import type {
  ContactDetails,
  EventId,
  Instant,
  MembershipId,
  OrgId,
  Timestamped,
  UserId,
  VenueId,
  Versioned,
} from './common';

export interface User extends Timestamped, Versioned {
  /** Firebase Auth UID */
  readonly id: UserId;
  /** E.164. The primary identifier in Kenya. */
  readonly phone?: string;
  readonly phoneVerified: boolean;
  readonly email?: string;
  readonly emailVerified: boolean;
  readonly displayName?: string;
  readonly status: UserStatus;
  readonly lastSeenAt?: Instant;
}

export interface Organization extends Timestamped, Versioned {
  readonly id: OrgId;
  readonly name: string;
  readonly kind: OrganizationKind;
  readonly slug: string;
  readonly contact: ContactDetails;
  /**
   * `accountRef` is encrypted at rest with a KMS key and NEVER returned to any
   * client in any role. Payout destinations are a high-value tampering target.
   */
  readonly settlement?: {
    readonly method: 'BANK' | 'MPESA_B2B';
    readonly accountRef: string;
    readonly accountName: string;
  };
  readonly status: 'ACTIVE' | 'SUSPENDED';
}

/**
 * Where a role applies. A role without a scope is either uselessly narrow or
 * dangerously broad — "Gate Attendant" is meaningless without asking at which
 * event.
 */
export type Scope =
  | { readonly kind: 'PLATFORM' }
  | { readonly kind: 'ORGANIZATION'; readonly organizationId: OrgId }
  | { readonly kind: 'VENUE'; readonly venueId: VenueId }
  | { readonly kind: 'EVENT'; readonly eventId: EventId };

export interface Membership extends Timestamped, Versioned {
  readonly id: MembershipId;
  readonly userId: UserId;
  readonly roleId: RoleId;

  /** Authoritative */
  readonly scope: Scope;
  /**
   * Flat projection of `scope`, backend-written, never client-supplied.
   *
   * A discriminated union cannot be indexed usefully because the ID field name
   * differs per variant, and `memberships` must be queryable by scope ("who has
   * access here?"). This is a concession to the datastore, recorded so it is not
   * mistaken for a second source of truth — `scope` remains authoritative.
   * See docs/data/firestore-indexes.md §Modelling note.
   */
  readonly scopeKind: ScopeKind;
  /** Empty string for PLATFORM */
  readonly scopeId: string;

  readonly status: MembershipStatus;
  readonly grantedByUserId: UserId;
  readonly grantedAt: Instant;
  /**
   * Matters more than it looks. Casual matchday staff get gate access for one
   * event; without expiry a stadium accumulates dozens of people who can still
   * scan tickets a year later.
   */
  readonly expiresAt?: Instant;
  readonly revokedAt?: Instant;
}

export interface Role {
  readonly id: RoleId;
  readonly name: string;
  readonly description: string;
  readonly permissions: readonly Permission[];
  readonly assignableAtScopes: readonly ScopeKind[];
  readonly isSystem: boolean;
}

/**
 * The resolved authority for one request. Carries `roleUsed` and `scopeUsed`
 * because the audit record must state the authority the action was taken under,
 * not merely who took it.
 */
export interface Actor {
  readonly userId?: UserId;
  readonly isAuthenticated: boolean;
  readonly permissions: readonly Permission[];
  readonly memberships: readonly Membership[];
  readonly roleUsed?: RoleId;
  readonly scopeUsed?: Scope;
  readonly membershipId?: MembershipId;
}
