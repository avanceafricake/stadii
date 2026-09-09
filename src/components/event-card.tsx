/**
 * The event grid used by every page that lists events for one thing — a
 * competition, a sport, a team, a stadium, a search.
 *
 * There used to be a second event card here with its own markup, its own
 * layout and its own idea of what an event looks like. Two card designs on one
 * site is how a design system stops being one: the homepage showed a fixture as
 * crest–VS–crest and the stadium page showed the same fixture as a paragraph.
 * This is now an adapter onto `StadiiEventCard` — one card, everywhere.
 *
 * It resolves the sport name itself rather than making five call sites do it.
 * `listSports` is wrapped in React `cache()`, so several grids on one page cost
 * one read.
 */

import type { Event } from '@stadii/shared-models';

import { CardGrid, StadiiEventCard } from './cards';
import { listSports } from '@/lib/firestore/queries';
import { categoryResolver, toEventCard } from '@/lib/present/home';

export async function EventCardGrid({ events }: { events: readonly Event[] }) {
  const sports = await listSports();
  const categoryFor = categoryResolver(sports.data);

  return (
    <CardGrid>
      {events.map((event) => (
        <li key={String(event.id)} className="h-full">
          <StadiiEventCard event={toEventCard(event, categoryFor)} />
        </li>
      ))}
    </CardGrid>
  );
}
