/**
 * The right-hand column, on every page.
 *
 * This exists so that `StadiiShell` can guarantee three columns rather than
 * hope each page remembers to pass a fourth argument. Before it, `aside` was an
 * optional prop and exactly two of twenty-three pages supplied one — so the
 * site was a three-column design that rendered as two columns almost
 * everywhere, and the difference showed the moment you clicked from the
 * homepage to anything else.
 *
 * A page may still pass its own `aside` when it has something more relevant to
 * put there (the event page puts the purchase panel and the venue there). What
 * it can no longer do is leave the column empty.
 *
 * The panel is SUPPORTING material. Nothing here is the reason anyone opened
 * the page, which is why it is the first thing to go when the screen narrows,
 * and why a failed read costs a widget rather than the page.
 */

import {
  StadiiPromoCard,
  StadiiQuickActions,
  StadiiUpcomingEvents,
} from './cards';
import { listUpcomingEvents } from '@/lib/firestore/queries';
import { toUpcomingItem } from '@/lib/present/home';
import { routes } from '@/lib/routes';

/**
 * `listUpcomingEvents` is wrapped in React `cache()`, so a page that already
 * reads upcoming events — the homepage, the events index — pays for this once
 * rather than twice.
 */
export async function StadiiAside() {
  const events = await listUpcomingEvents({ limit: 5 });

  return (
    <>
      <StadiiQuickActions />

      <StadiiPromoCard
        title={
          <>
            Football
            <br />
            is back
          </>
        }
        body="Get your tickets to the biggest matches this season."
        ctaLabel="View football events"
        href={routes.sports()}
      />

      {/* Rendered even when empty: the widget's own empty copy says fixtures
          appear as organisers publish them, which is a truer thing for a new
          platform to say than a column that quietly shortens. */}
      <StadiiUpcomingEvents items={events.data.map(toUpcomingItem)} />
    </>
  );
}
