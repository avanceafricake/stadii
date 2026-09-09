import type { Metadata } from 'next';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { CardGrid, PageIntro, StadiiStadiumCard } from '@/components/cards';
import { LoadedList } from '@/components/loaded';
import { StadiiShell } from '@/components/shell';
import { listVenues } from '@/lib/firestore/queries';
import { toStadiumCard } from '@/lib/present/home';
import { buildMetadata } from '@/lib/seo/metadata';
import { routes } from '@/lib/routes';

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  // "Stadiums" everywhere a visitor can see, because that is the word on the
  // navigation and the word people use. The route stays /venues: the model is
  // a venue — a pool and a track are not stadiums — and changing a live URL to
  // match a label would break every link already shared.
  title: 'Stadiums',
  description:
    'Stadiums, tracks and pools hosting events on STADII, with addresses, capacity and directions.',
  path: routes.venues(),
});

export default async function VenuesPage() {
  const venues = await listVenues();

  return (
    <StadiiShell active={routes.venues()}>
      <PageIntro
        title="Stadiums"
        lede="Where sport happens in Kenya and East Africa. Each ground has its address, how it is laid out, and what is coming up there."
        crumbs={
          <Breadcrumbs
            crumbs={[
              { name: 'Home', path: routes.home() },
              { name: 'Stadiums', path: routes.venues() },
            ]}
          />
        }
      />

      <LoadedList
        result={venues}
        what="the list of stadiums"
        emptyTitle="No stadiums listed yet"
        emptyBody="Grounds appear here once an operator has set one up on STADII."
      >
        {(items) => (
          <>
            <p className="mb-md text-body text-ink-muted">
              {items.length === 1 ? '1 stadium' : `${items.length} stadiums`}
            </p>
            <CardGrid columns={4}>
              {items.map((venue) => (
                <li key={String(venue.id)} className="h-full">
                  <StadiiStadiumCard stadium={toStadiumCard(venue)} />
                </li>
              ))}
            </CardGrid>
          </>
        )}
      </LoadedList>
    </StadiiShell>
  );
}
