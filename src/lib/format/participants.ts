/**
 * Participants.
 *
 * ADR-0004: an event has N participants with roles. N is genuinely
 * unconstrained — 0 for a championship that is itself the competition, 1 for a
 * charity exhibition with one headline club, 2 for a league match, many for an
 * athletics meet. A participant may be a team, a club, an athlete or an
 * organization.
 *
 * There is no home side and no away side in this model. HOME and AWAY are two
 * of six roles, they are not two slots, and nothing here reorders or pairs
 * participants by role. `displayOrder` — set by the organiser — is the only
 * ordering.
 */
import {
  PARTICIPANT_KIND,
  PARTICIPANT_ROLE,
  type ParticipantKind,
  type ParticipantRole,
} from '@stadii/shared-constants';

const ROLE_LABEL: Record<ParticipantRole, string> = {
  [PARTICIPANT_ROLE.HOME]: 'Home',
  [PARTICIPANT_ROLE.AWAY]: 'Away',
  [PARTICIPANT_ROLE.COMPETITOR]: 'Competitor',
  [PARTICIPANT_ROLE.HOST]: 'Host',
  [PARTICIPANT_ROLE.GUEST]: 'Guest',
  [PARTICIPANT_ROLE.PERFORMER]: 'Performer',
};

export function roleLabel(role: ParticipantRole | string | undefined): string {
  if (!role) return '';
  return ROLE_LABEL[role as ParticipantRole] ?? '';
}

const KIND_LABEL: Record<ParticipantKind, string> = {
  [PARTICIPANT_KIND.TEAM]: 'Team',
  [PARTICIPANT_KIND.CLUB]: 'Club',
  [PARTICIPANT_KIND.ATHLETE]: 'Athlete',
  [PARTICIPANT_KIND.ORGANIZATION]: 'Organization',
};

export function kindLabel(kind: ParticipantKind | string | undefined): string {
  if (!kind) return '';
  return KIND_LABEL[kind as ParticipantKind] ?? '';
}

/**
 * The schema.org type for a participant.
 *
 * `Person` for an athlete, `SportsTeam` for a team or club, `Organization`
 * otherwise. Where the kind is unknown — the denormalised
 * `ParticipantSummary` carried on an event does not include it — the type is
 * the generic `Thing`, which is true rather than convenient.
 */
export function schemaTypeForKind(kind: ParticipantKind | string | undefined): string {
  switch (kind) {
    case PARTICIPANT_KIND.ATHLETE:
      return 'Person';
    case PARTICIPANT_KIND.TEAM:
    case PARTICIPANT_KIND.CLUB:
      return 'SportsTeam';
    case PARTICIPANT_KIND.ORGANIZATION:
      return 'Organization';
    default:
      return 'Thing';
  }
}

/**
 * How to lay a participant list out.
 *
 * The count is the whole input. Nothing here inspects roles, because "two
 * participants" does not imply "two sides" — a heat with two swimmers is not a
 * derby.
 */
export type ParticipantLayout = 'none' | 'single' | 'pair' | 'field';

export function layoutFor(count: number): ParticipantLayout {
  if (count <= 0) return 'none';
  if (count === 1) return 'single';
  if (count === 2) return 'pair';
  return 'field';
}

/**
 * A one-line summary for a card, a meta description or a page title suffix.
 *
 * The event's own `title` is always the headline (an event title is stored,
 * never derived — see the Event model). This is supporting text.
 */
export function participantSummaryLine(names: readonly string[]): string {
  if (names.length === 0) return '';
  if (names.length === 1) return names[0] as string;
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  const shown = names.slice(0, 3).join(', ');
  return `${shown} and ${names.length - 3} more`;
}

/** "3 competitors" / "1 participant" — plain counting, for a heading. */
export function participantCountLabel(count: number): string {
  if (count <= 0) return 'Participants to be confirmed';
  return count === 1 ? '1 participant' : `${count} participants`;
}
