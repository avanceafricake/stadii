/**
 * The hand-off to the STADII app.
 *
 * There is no checkout on this website. Holding inventory, pricing an order and
 * taking payment are authenticated backend commands, and a hold is a
 * transaction the backend may refuse — "someone got there first" is a routine
 * outcome, not an error (ADR-0001). Building a second purchase funnel here
 * would mean a second implementation of rules that already exist once.
 *
 * So this component is a link, plus copy that is honest about what happens next.
 */
import type { Event } from '@stadii/shared-models';

import { ButtonLink, Card } from './primitives';
import { appLinks } from '@/lib/app-links';
import { purchaseEntryPoint } from '@/lib/format/status';

export function PurchaseCta({ event }: { event: Event }) {
  const entry = purchaseEntryPoint(event);

  return (
    <Card className="border-action-200 bg-action-50">
      <h2 className="text-title font-semibold text-ink">Tickets</h2>
      <p className="mt-xs text-body text-ink-muted">{entry.note}</p>

      <div className="mt-md">
        {entry.offer ? (
          <ButtonLink href={appLinks.selectTickets(event.id)} external rel="noopener">
            {entry.label}
          </ButtonLink>
        ) : (
          <p className="rounded-md border border-outline-strong bg-surface px-lg py-sm text-body-lg font-semibold text-ink-muted">
            {entry.label}
          </p>
        )}
      </div>

      {/* No store buttons here. "Get it on Android" beside "Buy now" asks
          somebody who has decided to buy to make a second, unrelated decision
          about installing an app, and the two compete for the same click.
          Getting the app is in the header, where somebody looking for it will
          look for it. */}
      <p className="mt-md text-caption text-ink-subtle">
        Seat availability, your place in a queue and the final amount are all confirmed
        by STADII when you check out. Nothing on this page reserves a ticket.
      </p>
    </Card>
  );
}

/**
 * The sticky buy bar, phones only.
 *
 * The purchase panel lives in the right-hand column, and that column moves
 * BELOW the content on anything narrower than a desktop — so on a phone the
 * only way to buy was to scroll past the whole page to find it. A ticketing
 * page where the buy button can be scrolled away from is a ticketing page that
 * does not sell. This one is always on screen, and it is hidden at `xl` where
 * the panel is visible and pinned.
 */
export function StickyBuyBar({ event }: { event: Event }) {
  const entry = purchaseEntryPoint(event);
  if (!entry.offer) return null;

  return (
    <>
      {/* Space for the bar to sit over, so the last card is not permanently
          hidden behind it. */}
      <div aria-hidden="true" className="h-[4.5rem] xl:hidden" />

      {/* FIXED, not sticky. Sticky pins an element only while its own
          containing block is on screen, and this is the last thing in the
          document — so it appeared once you had already scrolled to the very
          bottom, which is exactly where a buy button is no use. It sits above
          the mobile tab bar (3.5rem) rather than over it: covering navigation
          to sell something is how a page gets closed. */}
      <div className="fixed inset-x-0 bottom-[3.5rem] z-40 border-t border-outline-subtle bg-surface/95 px-md py-sm backdrop-blur sm:px-lg lg:bottom-0 xl:hidden">
        <a
          href={appLinks.selectTickets(event.id)}
          rel="noopener"
          className="flex h-12 w-full items-center justify-center gap-xs rounded-xl bg-action px-lg text-body-lg font-bold text-on-action transition-colors hover:bg-action-600"
        >
          {entry.label} <span aria-hidden="true">→</span>
        </a>
      </div>
    </>
  );
}
