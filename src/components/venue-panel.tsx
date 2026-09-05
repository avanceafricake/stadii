import Link from 'next/link';
import { AREA_KIND } from '@stadii/shared-constants';
import type { Venue, VenueArea } from '@stadii/shared-models';

import { Card } from './primitives';
import { routes } from '@/lib/routes';

/**
 * Where the event is, and how to get there.
 *
 * The venue tree is deliberately flexible (ADR-0005): SECTION, BLOCK, ROW and
 * GA_AREA are all optional and nest in several legal shapes, so nothing here
 * assumes "stands contain blocks contain rows". What is rendered is whatever
 * the top level of that venue's tree happens to be, labelled by its own `kind`.
 */

function directionsUrl(venue: Venue): string {
  if (venue.location) {
    return `https://www.google.com/maps/search/?api=1&query=${venue.location.lat},${venue.location.lng}`;
  }
  const parts = [venue.name, venue.address?.line1, venue.address?.city].filter(Boolean);
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(parts.join(', '))}`;
}

const AREA_KIND_LABEL: Record<string, string> = {
  [AREA_KIND.SECTION]: 'Section',
  [AREA_KIND.BLOCK]: 'Block',
  [AREA_KIND.ROW]: 'Row',
  [AREA_KIND.GA_AREA]: 'Standing area',
};

export function VenueAddress({ venue }: { venue: Venue }) {
  if (!venue.address) return null;
  return (
    <address className="not-italic text-body text-ink-muted">
      {venue.address.line1}
      <br />
      {venue.address.city}
      {venue.address.county ? `, ${venue.address.county}` : ''}
      <br />
      {venue.address.countryCode}
    </address>
  );
}

export function VenuePanel({
  venue,
  areas,
  showLink = true,
}: {
  venue: Venue;
  areas?: readonly VenueArea[];
  showLink?: boolean;
}) {
  return (
    <Card>
      <h2 className="text-title font-semibold text-ink">{venue.name}</h2>
      <div className="mt-sm">
        <VenueAddress venue={venue} />
      </div>

      {typeof venue.totalCapacity === 'number' ? (
        <p className="mt-sm text-body text-ink-muted">
          Capacity {venue.totalCapacity.toLocaleString('en-KE')}
        </p>
      ) : null}

      <div className="mt-md flex flex-wrap gap-md text-body">
        <a
          href={directionsUrl(venue)}
          className="font-medium text-brand-700 underline"
          rel="noopener noreferrer"
          target="_blank"
        >
          Get directions
        </a>
        {showLink && venue.slug ? (
          <Link href={routes.venue(venue.slug)} className="font-medium text-brand-700 underline">
            About this venue
          </Link>
        ) : null}
      </div>

      {areas && areas.length > 0 ? (
        <div className="mt-md border-t border-outline-subtle pt-md">
          <h3 className="text-body font-semibold text-ink">Areas</h3>
          <ul className="mt-sm flex flex-wrap gap-xs">
            {areas.map((area) => (
              <li
                key={area.id}
                className="rounded-pill border border-outline-subtle px-sm py-xs text-caption text-ink-muted"
              >
                {area.label}
                <span className="ml-xs text-ink-subtle">
                  {AREA_KIND_LABEL[area.kind] ?? ''}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-sm text-caption text-ink-subtle">
            Which areas are on sale, and at what price, is set per event.
          </p>
        </div>
      ) : null}
    </Card>
  );
}
