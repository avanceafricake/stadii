/** Venue: physical infrastructure — docs/domain/03-venues.md, ADR-0005 */

import type {
  AccessibilityFeature,
  AreaKind,
  AreaStatus,
  CatalogStatus,
  GateStatus,
  SeatStatus,
  VenueStatus,
} from '@stadii/shared-constants';
import type {
  Address,
  AreaId,
  Attributed,
  CountyId,
  GateId,
  GeoPoint,
  OrgId,
  SeatId,
  SportId,
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
  /**
   * Names this venue is still called by, for SEARCH only.
   *
   * Kenyan grounds get renamed and the old name outlives the change by years:
   * the 60,000-seat national stadium is officially Raila Odinga International
   * Stadium and everyone still says Talanta. Kasarani has been Safaricom
   * Stadium on a sponsor's signage.
   *
   * Never displayed as the venue's name and never authoritative — `name` is
   * the current official one. This exists so a person typing what they call
   * the place finds it, which is the only reason a former name matters.
   */
  readonly alsoKnownAs?: readonly string[];
  readonly slug: string;
  readonly address: Address;
  /**
   * The administrative area, as a REFERENCE rather than the free string on
   * `address.county`.
   *
   * The address stays for display and postal use; this is what makes "venues
   * in Nakuru" a query and lets a county carry its own page. Optional because
   * a venue outside Kenya has no county.
   */
  readonly countyId?: CountyId;
  /**
   * The sports this venue is equipped for.
   *
   * A property of the GROUND, not of any event: the Kasarani Aquatic Stadium
   * has a diving platform whether or not anything is scheduled. It is what
   * makes "where can I watch rugby" answerable before a single fixture is
   * published.
   */
  readonly sportIds?: readonly SportId[];
  readonly location?: GeoPoint;
  readonly timezone: string;
  readonly totalCapacity?: number;
  /**
   * Editorial prose about the ground: what it is, what it hosts, what a visitor
   * should know. Written by an operator, not derived.
   *
   * The web and mobile clients have always decoded this field — the Dart
   * `Venue` contract reads `description` and `imageUrl` — but the model never
   * declared them, so nothing on the backend could write them and every venue
   * page showed a name, a city and nothing else. Optional because a ground can
   * be listed before anyone has written about it, and the UI must read well
   * either way.
   */
  readonly description?: string;
  /**
   * A photograph of the ground.
   *
   * A URL, never an uploaded blob: image hosting is not this model's problem.
   * Optional and expected to be absent for most of the catalogue — the venue
   * research pack records source pages rather than image rights, so a
   * photograph appears only once someone has confirmed the licence for it.
   */
  readonly imageUrl?: string;
  /**
   * Incremented on any structural change. A published event pins the version it
   * was built from, so a later venue edit never retroactively alters seat labels
   * on tickets already in customers' phones.
   */
  readonly layoutVersion: number;
  readonly status: VenueStatus;
}

/**
 * An administrative area a venue sits in.
 *
 * Deliberately thin. It exists to be REFERENCED — by venues now, and by
 * anything later that needs to group by place — not to be a gazetteer. A
 * county with no venue in it is not created, because data that relates to
 * nothing is a maintenance cost with no reader.
 */
export interface County extends Timestamped, Versioned {
  readonly id: CountyId;
  readonly name: string;
  readonly slug: string;
  /** ISO 3166-2 subdivision code where one is known, e.g. "KE-30". */
  readonly code?: string;
  /** ISO 3166-1 alpha-2 of the country it belongs to. */
  readonly countryCode: string;
  readonly status: CatalogStatus;
}

/** Denormalised display copy carried on an event. Never authoritative. */
export interface VenueSummary {
  readonly venueId: VenueId;
  readonly name: string;
  readonly city: string;
}
