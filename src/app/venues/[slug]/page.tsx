import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { EventCardGrid } from '@/components/event-card';
import { JsonLdScript } from '@/components/json-ld';
import { LoadedList } from '@/components/loaded';
import { Container, PageHeader, Section, SectionHeading } from '@/components/primitives';
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
        <Container>
          <Section>
            <UnavailableState what="this venue" />
          </Section>
        </Container>
      );
    }
    notFound();
  }

  const [events, areas] = await Promise.all([
    listUpcomingEvents({ venueId: venue.id }),
    listVenueRootAreas(venue.id),
  ]);

  return (
    <>
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

      <PageHeader
        title={venue.name}
        lede={[venue.address?.city, venue.address?.county].filter(Boolean).join(', ')}
      >
        <div className="mt-md">
          <Breadcrumbs
            crumbs={[
              { name: 'Home', path: routes.home() },
              { name: 'Venues', path: routes.venues() },
              { name: venue.name, path: routes.venue(venue.slug) },
            ]}
          />
        </div>
      </PageHeader>

      <Container>
        <div className="grid gap-lg py-xl lg:grid-cols-[1fr_22rem]">
          <Section className="py-0" labelledBy="venue-events">
            <SectionHeading id="venue-events">Coming up here</SectionHeading>
            <LoadedList
              result={events}
              what="upcoming events at this venue"
              emptyTitle="Nothing scheduled"
              emptyBody={`No events are currently published at ${venue.name}.`}
            >
              {(items) => <EventCardGrid events={items} />}
            </LoadedList>
          </Section>

          <aside className="space-y-md">
            <VenuePanel venue={venue} areas={areas.data} showLink={false} />
          </aside>
        </div>
      </Container>
    </>
  );
}
