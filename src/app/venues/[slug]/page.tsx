import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { EventCardGrid } from '@/components/event-card';
import { JsonLdScript } from '@/components/json-ld';
import { LoadedList } from '@/components/loaded';
import { EditorialHero, PageIntro, SectionHeader } from '@/components/cards';
import { StadiiShell } from '@/components/shell';
import { UnavailableState } from '@/components/states';
import { VenuePanel } from '@/components/venue-panel';
import {
  getVenueBySlug,
  listUpcomingEvents,
  listVenueRootAreas,
} from '@/lib/firestore/queries';
import { buildMetadata } from '@/lib/seo/metadata';
import { absoluteUrl } from '@/lib/site';
import { parseSlug, routes } from '@/lib/routes';
import { placeLine } from '@/lib/format/format';

export const revalidate = 900;

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const slug = parseSlug((await params).slug);
  const venue = slug ? (await getVenueBySlug(slug)).data : null;
  if (!venue) {
    return buildMetadata({
      title: 'Venue not found',
      description: 'This venue is not listed on STADII.',
      path: routes.venues(),
      noindex: true,
    });
  }
  const where = [venue.address?.city, venue.address?.county].filter(Boolean).join(', ');
  return buildMetadata({
    title: venue.name,
    description: `${venue.name}${where ? ` in ${where}` : ''}: upcoming events, address, directions and how the ground is laid out.`,
    path: routes.venue(venue.slug),
  });
}

export default async function VenuePage({ params }: Params) {
  const slug = parseSlug((await params).slug);
  if (!slug) notFound();

  const result = await getVenueBySlug(slug);
  const venue = result.data;

  if (!venue) {
    if (result.unavailable) {
      return (
        <StadiiShell active={routes.venues()}>
          <UnavailableState what="this stadium" />
        </StadiiShell>
      );
    }
    notFound();
  }

  const [events, areas] = await Promise.all([
    listUpcomingEvents({ venueId: venue.id }),
    listVenueRootAreas(venue.id),
  ]);

  return (
    <StadiiShell
      active={routes.venues()}
      aside={<VenuePanel venue={venue} areas={areas.data} showLink={false} />}
    >
      <JsonLdScript
        id="ld-venue"
        data={{
          '@context': 'https://schema.org',
          '@type': 'StadiumOrArena',
          name: venue.name,
          url: absoluteUrl(routes.venue(venue.slug)),
          ...(venue.address
            ? {
                address: {
                  '@type': 'PostalAddress',
                  streetAddress: venue.address.line1,
                  addressLocality: venue.address.city,
                  ...(venue.address.county ? { addressRegion: venue.address.county } : {}),
                  addressCountry: venue.address.countryCode,
                },
              }
            : {}),
          ...(venue.location
            ? {
                geo: {
                  '@type': 'GeoCoordinates',
                  latitude: venue.location.lat,
                  longitude: venue.location.lng,
                },
              }
            : {}),
          ...(typeof venue.totalCapacity === 'number'
            ? { maximumAttendeeCapacity: venue.totalCapacity }
            : {}),
        }}
      />

      <PageIntro
        title={venue.name}
        lede={placeLine(venue.address?.city, venue.address?.county)}
        crumbs={
          <Breadcrumbs
            crumbs={[
              { name: 'Home', path: routes.home() },
              { name: 'Stadiums', path: routes.venues() },
              { name: venue.name, path: routes.venue(venue.slug) },
            ]}
          />
        }
      />

      {/* Photograph and prose, either, both or neither. A ground with nothing
          written about it yet gets no empty picture frame and no placeholder
          paragraph — the page simply starts at what is on. */}
      <EditorialHero
        imageUrl={venue.imageUrl}
        imageAlt={`${venue.name}`}
        description={venue.description}
        facts={[
          ...(typeof venue.totalCapacity === 'number'
            ? [{ label: 'Capacity', value: venue.totalCapacity.toLocaleString('en-KE') }]
            : []),
          ...(venue.address?.county ? [{ label: 'County', value: venue.address.county }] : []),
          ...(venue.alsoKnownAs && venue.alsoKnownAs.length > 0
            ? [{ label: 'Also known as', value: venue.alsoKnownAs.join(', ') }]
            : []),
        ]}
      />

      <section aria-labelledby="venue-events">
        <SectionHeader title="Coming up here" />
        <LoadedList
          result={events}
          what="upcoming events at this venue"
          emptyTitle="Nothing scheduled"
          emptyBody={`No events are currently published at ${venue.name}.`}
        >
          {(items) => <EventCardGrid events={items} />}
        </LoadedList>
      </section>
    </StadiiShell>
  );
}
