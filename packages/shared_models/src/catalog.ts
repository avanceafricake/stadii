/** Catalogue: sports, participants, competitions — docs/domain/02-catalog.md */

import type {
  CatalogStatus,
  CompetitionFormat,
  ParticipantKind,
  ParticipantModel,
} from '@stadii/shared-constants';
import type {
  CompetitionId,
  IsoDate,
  OrgId,
  ParticipantId,
  SeasonId,
  SportId,
  Timestamped,
  VenueId,
  Versioned,
} from './common';

export interface Sport extends Timestamped, Versioned {
  readonly id: SportId;
  readonly name: string;
  readonly slug: string;
  /**
   * A HINT for admin UI defaults and validation warnings — never a domain
   * constraint. An event may have zero, one or many participants regardless of
   * its sport (ADR-0004).
   */
  readonly participantModel: ParticipantModel;
  readonly status: CatalogStatus;
}

export interface AthleteDetails {
  readonly givenName: string;
  readonly familyName: string;
  /** Optional; minors' data is minimised */
  readonly dateOfBirth?: IsoDate;
  readonly clubParticipantId?: ParticipantId;
}

export interface ClubDetails {
  readonly foundedYear?: number;
  /** A default for the admin UI only. An event's venue is set on the event. */
  readonly homeVenueId?: VenueId;
}

/**
 * Teams, clubs, athletes and organizations in one collection, discriminated by
 * `kind`. They are all named things that appear on an event; four collections
 * would produce four near-identical query paths.
 */
export interface Participant extends Timestamped, Versioned {
  readonly id: ParticipantId;
  readonly kind: ParticipantKind;
  /** Plural: a club may field several sports, an athlete may run and jump */
  readonly sportIds: readonly SportId[];
  readonly displayName: string;
  /** For compact scoreboards and seat maps */
  readonly shortName?: string;
  readonly slug: string;
  readonly crestUrl?: string;
  /** ISO 3166-1 alpha-2 */
  readonly countryCode: string;
  readonly organizationId?: OrgId;
  readonly status: CatalogStatus;

  readonly athlete?: AthleteDetails;
  readonly club?: ClubDetails;
}

export interface Competition extends Timestamped, Versioned {
  readonly id: CompetitionId;
  readonly sportId: SportId;
  readonly organizationId: OrgId;
  readonly name: string;
  readonly slug: string;
  readonly format: CompetitionFormat;
  readonly status: CatalogStatus;
}

export interface Season extends Timestamped, Versioned {
  readonly id: SeasonId;
  readonly competitionId: CompetitionId;
  readonly name: string;
  readonly startsOn: IsoDate;
  readonly endsOn: IsoDate;
  readonly status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED';
}

/** Denormalised display copy carried on an event. Never authoritative. */
export interface ParticipantSummary {
  readonly participantId: ParticipantId;
  readonly displayName: string;
  readonly shortName?: string;
  readonly crestUrl?: string;
}
