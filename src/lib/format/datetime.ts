/**
 * Dates and times.
 *
 * An `Instant` is epoch milliseconds, UTC (`@stadii/shared-models`). It is
 * rendered in the STADIUM's timezone, which for this platform is Africa/Nairobi
 * (UTC+3, no DST). A kick-off shown in a visitor's browser timezone is how
 * someone in London misses a match in Nairobi, so the zone is fixed and stated
 * on screen rather than inferred from the device.
 *
 * An event document carries its own `timezone` field. It is honoured where it
 * is present; Africa/Nairobi is the fallback, not the assumption.
 */
import { NAIROBI_TZ, type Instant } from '@stadii/shared-models';

export const DEFAULT_TIMEZONE = NAIROBI_TZ;

function zone(timezone?: string): string {
  return timezone && timezone.length > 0 ? timezone : DEFAULT_TIMEZONE;
}

function formatter(
  timezone: string | undefined,
  options: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat {
  return new Intl.DateTimeFormat('en-GB', { ...options, timeZone: zone(timezone) });
}

/** "Saturday 14 March 2026" */
export function formatEventDate(at: Instant, timezone?: string): string {
  return formatter(timezone, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(at));
}

/** "16:00" — 24-hour, because a matchday poster is not the place for am/pm. */
export function formatEventTime(at: Instant, timezone?: string): string {
  return formatter(timezone, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(at));
}

/** "Sat 14 Mar 2026, 16:00" for cards and lists. */
export function formatShortDateTime(at: Instant, timezone?: string): string {
  const date = formatter(timezone, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(at));
  return `${date}, ${formatEventTime(at, timezone)}`;
}

/** "Sat 14 Mar" — used where the year is already established by context. */
export function formatDayAndMonth(at: Instant, timezone?: string): string {
  return formatter(timezone, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(new Date(at));
}

/**
 * The label that goes next to a time so nobody has to guess the zone.
 * "EAT" is what a ticket in Nairobi says; other zones get their IANA name.
 */
export function timezoneLabel(timezone?: string): string {
  return zone(timezone) === NAIROBI_TZ ? 'EAT' : zone(timezone);
}

/**
 * The value for `<time dateTime>` and for JSON-LD `startDate`: ISO 8601 with
 * the stadium's offset, not with a `Z`. Search engines read the offset to place
 * the event in local time, and "16:00+03:00" is the fact on the ticket.
 */
export function toIsoWithZoneOffset(at: Instant, timezone?: string): string {
  const tz = zone(timezone);
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(new Date(at));

  const get = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find((p) => p.type === type)?.value ?? '00';

  // 24 is a legal hour in some ICU outputs for midnight; normalise it.
  const hour = get('hour') === '24' ? '00' : get('hour');
  const local = `${get('year')}-${get('month')}-${get('day')}T${hour}:${get('minute')}:${get('second')}`;

  return `${local}${offsetFor(at, tz)}`;
}

function offsetFor(at: Instant, timezone: string): string {
  const formatted = new Intl.DateTimeFormat('en-GB', {
    timeZone: timezone,
    timeZoneName: 'longOffset',
  }).formatToParts(new Date(at));
  const name = formatted.find((p) => p.type === 'timeZoneName')?.value ?? 'GMT+00:00';
  const offset = name.replace('GMT', '');
  return offset.length === 0 ? 'Z' : offset;
}

/**
 * Whether an instant is still ahead of `now`.
 *
 * This is a DISPLAY predicate for grouping a list, and nothing more. It decides
 * nothing about sales or admission — those are `salesStatus` and
 * `operationalStatus` on the event document, set by the backend (ADR-0016).
 */
export function isUpcoming(at: Instant, now: number = Date.now()): boolean {
  return at >= now;
}
