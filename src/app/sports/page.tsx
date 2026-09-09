import Link from 'next/link';
import type { Metadata } from 'next';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { LoadedList } from '@/components/loaded';
import { CardGrid, PageIntro } from '@/components/cards';
import { Card } from '@/components/primitives';
import { StadiiShell } from '@/components/shell';
import { listSports } from '@/lib/firestore/queries';
import { buildMetadata } from '@/lib/seo/metadata';
import { routes } from '@/lib/routes';

export const revalidate = 900;

export const metadata: Metadata = buildMetadata({
  title: 'Sports on STADII',
  description:
    'Every sport with events on STADII. Football, rugby, athletics, swimming and whatever an organiser publishes next.',
  path: routes.sports(),
});

/**
 * Sports are DATA.
 *
 * There is no hard-coded list of sports anywhere in this codebase. A new sport
 * appears here the moment it appears in the `sports` collection, which is what
 * makes an athletics meet and a swimming championship first-class rather than
 * special cases bolted onto a football model.
 */
export default async function SportsPage() {
  const sports = await listSports();

  return (
    <StadiiShell active={routes.sports()}>
      <PageIntro
        title="Sports"
        lede="Everything organisers are running on STADII. Pick one to see what is coming up."
        crumbs={
          <Breadcrumbs
            onDark
            crumbs={[
              { name: 'Home', path: routes.home() },
              { name: 'Sports', path: routes.sports() },
            ]}
          />
        }
      />

          <LoadedList
            result={sports}
            what="the list of sports"
            emptyTitle="No sports are listed yet"
            emptyBody="Sports appear here as soon as an organiser publishes an event in one."
          >
            {(items) => (
              <CardGrid>
                {items.map((sport) => (
                  <Card as="li" key={sport.id}>
                    <h2 className="text-body-lg font-semibold">
                      <Link href={routes.sport(sport.slug)} className="hover:text-brand-700">
                        {sport.name}
                      </Link>
                    </h2>
                    <p className="mt-xs text-body text-ink-muted">
                      See upcoming {sport.name.toLowerCase()} events, teams and athletes.
                    </p>
                  </Card>
                ))}
              </CardGrid>
            )}
          </LoadedList>
    </StadiiShell>
  );
}
