/**
 * Hand-off to the STADII app.
 *
 * This website sells nothing. Selecting seats, holding inventory, pricing an
 * order and taking payment are authenticated backend commands (ADR-0001), so
 * every purchase entry point here is a LINK, not a checkout.
 *
 * The app's own route table (`apps/customer_flutter/lib/app/router.dart`) keys
 * these screens by document ID, not by slug, so a deep link carries the ID the
 * app expects while the web URL a human sees stays a slug.
 *
 * Platform wiring caveat, carried from the Phase 3 report: the Android intent
 * filter and iOS associated-domain entitlement are not yet in place, so a
 * scheme link may not open the app on a device where it is installed. That is a
 * client-platform gap, not a change this surface can make — which is why every
 * hand-off also offers the store links.
 */
import { site } from './site';

function scheme(path: string): string {
  return `${site.app.scheme}://${path.replace(/^\/+/, '')}`;
}

export const appLinks = {
  /** Ticket selection for one event — the primary purchase entry point. */
  selectTickets: (eventId: string) => scheme(`event/${encodeURIComponent(eventId)}/select`),
  event: (eventId: string) => scheme(`event/${encodeURIComponent(eventId)}`),
  /**
   * Accepting a transfer. The recipient must sign in, so this link opens the
   * app's claim screen and the app calls the backend — the web page never
   * attempts a claim (docs/domain/09-transfers.md).
   */
  claim: (token: string) => scheme(`claim/${encodeURIComponent(token)}`),
  store: {
    android: site.app.android,
    ios: site.app.ios,
  },
} as const;

export function hasStoreLinks(): boolean {
  return site.app.android.length > 0 || site.app.ios.length > 0;
}
