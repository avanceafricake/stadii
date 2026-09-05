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
import { appLinks, hasStoreLinks } from '@/lib/app-links';
import { purchaseEntryPoint } from '@/lib/format/status';
import { site } from '@/lib/site';

export function PurchaseCta({ event }: { event: Event }) {
  const entry = purchaseEntryPoint(event);

  return (
    <Card className="bg-brand-50">
      <h2 className="text-title font-semibold text-ink">Tickets</h2>
      <p className="mt-xs text-body text-ink-muted">{entry.note}</p>

      <div className="mt-md flex flex-wrap gap-sm">
        {entry.offer ? (
          <ButtonLink href={appLinks.selectTickets(event.id)} external rel="noopener">
            {entry.label}
          </ButtonLink>
        ) : (
          <p className="rounded-md border border-outline-strong bg-surface px-lg py-sm text-body-lg font-semibold text-ink-muted">
            {entry.label}
          </p>
        )}

        {hasStoreLinks() ? (
          <>
            {site.app.android ? (
              <ButtonLink href={site.app.android} tone="secondary" external>
                Get it on Android
              </ButtonLink>
            ) : null}
            {site.app.ios ? (
              <ButtonLink href={site.app.ios} tone="secondary" external>
                Get it on iPhone
              </ButtonLink>
            ) : null}
          </>
        ) : null}
      </div>

      <p className="mt-md text-caption text-ink-subtle">
        Seat availability, your place in a queue and the final amount are all confirmed
        by STADII when you check out. Nothing on this page reserves a ticket.
      </p>
    </Card>
  );
}
