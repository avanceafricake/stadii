import Link from 'next/link';
import type { Metadata } from 'next';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { LoadedList } from '@/components/loaded';
import { Card, Container, PageHeader, Section } from '@/components/primitives';
import { listVenues } from '@/lib/firestore/queries';
import { buildMetadata } from '@/lib/seo/metadata';
import { routes } from '@/lib/routes';
import { placeLine } from '@/lib/format/format';

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: 'Venues',
  description:
    'Stadiums, tracks and pools hosting events on STADII, with addresses and directions.',
  path: routes.venues(),
});

export default async function VenuesPage() {
  const venues = await listVenues();

  return (
    <>
      <PageHeader
        title="Venues"
        lede="Where events happen. Each venue page has the address, directions and how the ground is laid out."
      >
        <div className="mt-md">
          <Breadcrumbs
            crumbs={[
              { name: 'Home', path: routes.home() },
              { name: 'Venues', path: routes.venues() },
            ]}
          />
        </div>
      </PageHeader>

      <Container>
        <Section>
          <LoadedList
            result={venues}
            what="the list of venues"
            emptyTitle="No venues listed yet"
            emptyBody="Venues appear here once an operator has set one up on STADII."
          >
            {(items) => (
              <ul className="grid list-none gap-md p-0 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((venue) => (
                  <Card as="li" key={venue.id}>
                    <h2 className="text-body-lg font-semibold">
                      <Link href={routes.venue(venue.slug)} className="hover:text-brand-700">
                        {venue.name}
                      </Link>
                    </h2>
                    <p className="mt-xs text-body text-ink-muted">
                      {placeLine(venue.address?.city, venue.address?.county)}

                    </p>
                    {typeof venue.totalCapacity === 'number' ? (
                      <p className="mt-xs text-caption text-ink-subtle">
                        Capacity {venue.totalCapacity.toLocaleString('en-KE')}
                      </p>
                    ) : null}
                  </Card>
                ))}
              </ul>
            )}
          </LoadedList>
        </Section>
      </Container>
    </>
  );
}
