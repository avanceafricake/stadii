import Link from 'next/link';
import type { Event } from '@stadii/shared-models';

import { EventStatusAxes } from './event-status';
import { ParticipantLine } from './participants';
import { Card } from './primitives';
import { formatDayAndMonth, formatEventTime, timezoneLabel } from '@/lib/format/datetime';
import { routes } from '@/lib/routes';

/**
 * One event in a list.
 *
 * The card shows the event's own stored `title` as the headline. An event title
 * is always stored and never derived from participants (see the Event model) —
 * that is what lets "Kenya National Swimming Championships" be a first-class
 * title instead of a special case in a formatter.
 */
export function EventCard({ event }: { event: Event }) {
  const summaries = event.participantSummaries ?? [];

  return (
    <Card as="article" className="flex h-full flex-col gap-sm transition-shadow hover:shadow-md">
      <div className="flex items-baseline justify-between gap-sm">
        <p className="text-caption font-semibold uppercase tracking-wide text-brand-700">
          <time dateTime={new Date(event.startsAt).toISOString()}>
            {formatDayAndMonth(event.startsAt, event.timezone)}
          </time>
          <span className="mx-xs text-outline-strong" aria-hidden="true">
            •
          </span>
          {formatEventTime(event.startsAt, event.timezone)} {timezoneLabel(event.timezone)}
        </p>
      </div>

      <h3 className="text-body-lg font-semibold leading-snug text-ink">
        <Link href={routes.event(event.slug)} className="hover:text-brand-700">
          {/* The whole card is reachable through this link; a nested clickable
              area would create two tab stops for one destination. */}
          <span className="absolute inset-0" aria-hidden="true" />
          {event.title}
        </Link>
      </h3>

      {event.subtitle ? (
        <p className="text-body text-ink-muted">{event.subtitle}</p>
      ) : null}

      <ParticipantLine
        participants={summaries.map((summary) => ({
          id: summary.participantId,
          name: summary.displayName,
          shortName: summary.shortName,
        }))}
      />

      <p className="mt-auto text-body text-ink-muted">
        {event.venueSummary?.name}
        {event.venueSummary?.city ? `, ${event.venueSummary.city}` : ''}
      </p>

      <EventStatusAxes event={event} />
    </Card>
  );
}

export function EventCardGrid({ events }: { events: readonly Event[] }) {
  return (
    <ul className="grid list-none gap-md p-0 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <li key={event.id} className="relative">
          <EventCard event={event} />
        </li>
      ))}
    </ul>
  );
}
