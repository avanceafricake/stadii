/**
 * The participant renderer.
 *
 * An event has N participants with roles (ADR-0004). N is 0, 1, 2 or many, and
 * all four are ordinary:
 *
 *   0  Kenya National Swimming Championships — the event IS the competition
 *   1  a charity exhibition with one headline club, role HOST
 *   2  a league fixture, roles HOME and AWAY
 *   N  an athletics meet, roles COMPETITOR
 *
 * The layout is chosen by COUNT, never by role. Two participants are laid out
 * side by side because two things fit side by side, not because one is at home:
 * two swimmers in a heat get the same treatment. Order is `displayOrder` from
 * the event's participants subcollection, which is the organiser's order.
 *
 * There is no home side and no away side anywhere in this file, and the ESLint
 * config rejects the identifiers outright.
 */
import Link from 'next/link';
import type { ParticipantKind, ParticipantRole } from '@stadii/shared-constants';

import { Card, cx } from './primitives';
import { kindLabel, layoutFor, roleLabel } from '@/lib/format/participants';
import { routes } from '@/lib/routes';

export interface ParticipantView {
  readonly id: string;
  readonly name: string;
  readonly shortName?: string | undefined;
  readonly crestUrl?: string | undefined;
  readonly role?: ParticipantRole | undefined;
  readonly kind?: ParticipantKind | undefined;
  /** Present only when the full participant record was readable. */
  readonly slug?: string | undefined;
}

function Crest({ participant, size }: { participant: ParticipantView; size: 'sm' | 'lg' }) {
  const dimension = size === 'lg' ? 'h-20 w-20' : 'h-10 w-10';
  if (!participant.crestUrl) {
    return (
      <div
        className={cx(
          dimension,
          'flex shrink-0 items-center justify-center rounded-full bg-neutral-100 text-body font-semibold text-ink-subtle',
        )}
        aria-hidden="true"
      >
        {participant.name.slice(0, 2).toUpperCase()}
      </div>
    );
  }
  return (
    // Crests are organiser-supplied URLs on hosts we do not control, so they are
    // served directly rather than through the image optimiser, which would 400
    // on an unlisted host and show a broken card.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={participant.crestUrl}
      alt=""
      loading="lazy"
      decoding="async"
      className={cx(dimension, 'shrink-0 rounded-full object-contain')}
    />
  );
}

function Name({ participant }: { participant: ParticipantView }) {
  const label = (
    <>
      <span className="block text-body-lg font-semibold text-ink">{participant.name}</span>
      {participant.role || participant.kind ? (
        <span className="mt-xs block text-caption uppercase tracking-wide text-ink-subtle">
          {[roleLabel(participant.role), kindLabel(participant.kind)]
            .filter(Boolean)
            .join(' · ')}
        </span>
      ) : null}
    </>
  );

  if (!participant.slug) return <span className="min-w-0">{label}</span>;
  return (
    <Link
      href={routes.team(participant.slug)}
      className="min-w-0 rounded-sm hover:text-brand-700"
    >
      {label}
    </Link>
  );
}

export function ParticipantList({
  participants,
  className,
}: {
  participants: readonly ParticipantView[];
  className?: string;
}) {
  const layout = layoutFor(participants.length);

  if (layout === 'none') {
    return (
      <p className={cx('text-body text-ink-muted', className)} data-testid="participants-none">
        Participants have not been announced for this event yet.
      </p>
    );
  }

  if (layout === 'pair') {
    const [first, second] = participants as readonly [ParticipantView, ParticipantView];
    return (
      <div
        className={cx('grid items-center gap-md sm:grid-cols-[1fr_auto_1fr]', className)}
        data-testid="participants-pair"
      >
        <div className="flex items-center gap-md">
          <Crest participant={first} size="lg" />
          <Name participant={first} />
        </div>
        {/* A neutral separator. Not "v": two participants are not necessarily
            two opposing sides, and a heat is not a derby. */}
        <div
          aria-hidden="true"
          className="hidden h-full w-px justify-self-center bg-outline-subtle sm:block"
        />
        <div className="flex items-center gap-md">
          <Crest participant={second} size="lg" />
          <Name participant={second} />
        </div>
      </div>
    );
  }

  if (layout === 'single') {
    const [only] = participants as readonly [ParticipantView];
    return (
      <div
        className={cx('flex items-center gap-md', className)}
        data-testid="participants-single"
      >
        <Crest participant={only} size="lg" />
        <Name participant={only} />
      </div>
    );
  }

  return (
    <ul
      className={cx('grid gap-sm sm:grid-cols-2 lg:grid-cols-3', className)}
      data-testid="participants-field"
    >
      {participants.map((participant) => (
        <Card as="li" key={participant.id} className="flex items-center gap-sm">
          <Crest participant={participant} size="sm" />
          <Name participant={participant} />
        </Card>
      ))}
    </ul>
  );
}

/** The compact one-line form used on event cards. */
export function ParticipantLine({
  participants,
}: {
  participants: readonly ParticipantView[];
}) {
  if (participants.length === 0) return null;
  return (
    <p className="truncate text-body text-ink-muted">
      {participants.map((p) => p.shortName ?? p.name).join(' · ')}
    </p>
  );
}
