/** Venue: physical infrastructure — docs/domain/03-venues.md, ADR-0005 */

import type {
  AccessibilityFeature,
  AreaKind,
  AreaStatus,
  GateStatus,
  SeatStatus,
  VenueStatus,
} from '@stadii/shared-constants';
import type {
  Address,
  AreaId,
  Attributed,
  GateId,
  GeoPoint,
  OrgId,
  SeatId,
  Timestamped,
  VenueId,
  Versioned,
} from './common';

export interface AreaGeometry {
  readonly shape: 'POLYGON' | 'RECT';
  readonly points: readonly number[];
  readonly rotation?: number;
}

/**
 * A node in the venue tree. The grammar (ADR-0005):
 *
 *   SECTION   parent: none              may contain BLOCK, ROW, GA_AREA, Seat
 *   BLOCK     parent: SECTION           may contain ROW, Seat
 *   ROW       parent: SECTION or BLOCK  may contain Seat
 *   GA_AREA   parent: none or SECTION   contains nothing — capacity only
 *
 * Enforced in `backend/domain/venue/area-grammar.ts`, so an invalid tree cannot
 * be written by any path.
 */
export interface VenueArea extends Timestamped, Versioned {
  readonly id: AreaId;
  readonly venueId: VenueId;
  readonly kind: AreaKind;
  readonly parentAreaId: AreaId | null;

  readonly label: string;
  /** Short, unique within the venue: "N", "N-A", "N-A-12" */
  readonly code: string;

  // Materialised ancestry. Firestore cannot traverse a tree in one query, so
  // these are load-bearing rather than an optimisation. Backend-computed; a
  // client never supplies them.
  readonly path: readonly AreaId[];
  readonly pathCodes: readonly string[];
  /** "N/N-A" — supports prefix range queries */
  readonly pathString: string;
  readonly depth: number;

  /** GA_AREA only. PHYSICAL safe capacity, not the per-event sale limit. */
  readonly capacity?: number;

  readonly geometry?: AreaGeometry;
  readonly status: AreaStatus;
}

export interface Seat extends Timestamped, Versioned {
  readonly id: SeatId;
  readonly venueId: VenueId;
  /** A SECTION, BLOCK or ROW — never a GA_AREA */
  readonly parentAreaId: AreaId;
  readonly areaPath: readonly AreaId[];
  readonly areaPathString: string;

  /** The number printed on the seat */
  readonly label: string;
  /** Resolved at import, not composed per read — it appears on every ticket */
  readonly displayLabel: string;
  readonly code: string;

  readonly accessibility?: readonly AccessibilityFeature[];
  readonly geometry?: { readonly x: number; readonly y: number };

  /** REMOVED is a soft delete: a seat sold in 2026 stays resolvable in 2027 */
  readonly status: SeatStatus;
}

export interface Gate extends Timestamped, Versioned {
  readonly id: GateId;
  readonly venueId: VenueId;
  readonly label: string;
  readonly code: string;
  /**
   * Which areas this gate admits to. Empty means all. Enforcement is per-event
   * via `EventPolicy.enforceGateAreaMatching`, default off, because many venues
   * in the region admit everyone through any gate.
   */
  readonly servesAreaIds: readonly AreaId[];
  readonly status: GateStatus;
}

export interface Venue extends Timestamped, Versioned, Attributed {
  readonly id: VenueId;
  readonly organizationId: OrgId;
  readonly name: string;
  readonly slug: string;
  readonly address: Address;
  readonly location?: GeoPoint;
  readonly timezone: string;
  readonly totalCapacity?: number;
  /**
   * Incremented on any structural change. A published event pins the version it
   * was built from, so a later venue edit never retroactively alters seat labels
   * on tickets already in customers' phones.
   */
  readonly layoutVersion: number;
  readonly status: VenueStatus;
}

/** Denormalised display copy carried on an event. Never authoritative. */
export interface VenueSummary {
  readonly venueId: VenueId;
  readonly name: string;
  readonly city: string;
}
