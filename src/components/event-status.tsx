/**
 * The three event status axes, on screen.
 *
 * ADR-0016 is a modelling decision that only pays off if the UI honours it.
 * `EventStatusAxes` renders THREE labelled badges — "Event: Postponed",
 * "Tickets: Sales paused", "Publication: Published" — and never merges them
 * into a single word. A visitor can then learn the thing that a merged badge
 * destroys: the match is off, but the tickets they hold are still theirs.
 *
 * Each badge names its axis. Two axes can carry the same word ("Closed",
 * "Suspended"), and an unlabelled badge would be ambiguous the day they do.
 */
import type { Event } from '@stadii/shared-models';

import { cx } from './primitives';
import { allAxes, type AxisPresentation, type Tone } from '@/lib/format/status';

/**
 * The status palette, used identically everywhere a state is shown.
 *
 * Positive is the brand green and information the brand blue, because a
 * confirmed thing and a primary action mean the same to a reader. Caution and
 * critical get their own hues precisely so they cannot be mistaken for either.
 */
const TONE_CLASSES: Record<Tone, string> = {
  neutral: 'border-outline bg-neutral-50 text-ink-muted',
  positive: 'border-action-200 bg-action-50 text-action-800',
  info: 'border-info-200 bg-info-50 text-info-800',
  caution: 'border-status-warning/40 bg-status-warning/10 text-status-warning',
  critical: 'border-status-error/40 bg-status-error/10 text-status-error',
};

export function StatusBadge({ axis }: { axis: AxisPresentation }) {
  return (
    <span
      className={cx(
        'inline-flex items-baseline gap-xs rounded-pill border px-sm py-xs text-caption font-medium',
        TONE_CLASSES[axis.tone],
      )}
      title={axis.description}
    >
      <span className="font-normal opacity-80">{axis.axis}:</span>
      <span>{axis.label}</span>
    </span>
  );
}

export function EventStatusAxes({
  event,
  className,
}: {
  event: Pick<
    Event,
    'publicationStatus' | 'operationalStatus' | 'salesStatus' | 'salesStatusReason'
  >;
  className?: string;
}) {
  const axes = allAxes(event);
  return (
    <ul
      className={cx('flex flex-wrap items-center gap-xs', className)}
      aria-label="Event status"
    >
      {axes.map((axis) => (
        <li key={axis.axis}>
          <StatusBadge axis={axis} />
        </li>
      ))}
    </ul>
  );
}

/**
 * The long form, for an event page.
 *
 * Each axis gets its own row with its own explanation. The explanation matters
 * most for the two that surprise people: a postponed event whose tickets remain
 * valid, and a suspension that says why (`salesStatusReason`).
 */
export function EventStatusDetail({
  event,
}: {
  event: Pick<
    Event,
    'publicationStatus' | 'operationalStatus' | 'salesStatus' | 'salesStatusReason'
  >;
}) {
  const axes = allAxes(event);
  return (
    <dl className="divide-y divide-outline-subtle rounded-lg border border-outline-subtle bg-surface">
      {axes.map((axis) => (
        <div key={axis.axis} className="grid gap-xs p-md sm:grid-cols-[10rem_1fr] sm:gap-md">
          <dt className="text-caption font-semibold uppercase tracking-wide text-ink-subtle">
            {axis.axis}
          </dt>
          <dd>
            <p className="text-body-lg font-medium text-ink">{axis.label}</p>
            <p className="mt-xs text-body text-ink-muted">{axis.description}</p>
          </dd>
        </div>
      ))}
    </dl>
  );
}
