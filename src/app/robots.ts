import type { MetadataRoute } from 'next';

import { absoluteUrl } from '@/lib/site';

/**
 * robots.txt.
 *
 * `/claim/` is disallowed and the pages themselves also send `noindex`. A claim
 * link is a per-recipient bearer token: indexing one would put a transfer offer
 * meant for one person into a search result. Belt and braces is the right level
 * of caution for a URL that hands over a ticket.
 *
 * `/search` is disallowed because it is an unbounded query surface — every
 * crawled permutation costs budget that should go to event pages, and none of
 * it is canonical.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/claim/', '/search'],
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: absoluteUrl('/'),
  };
}
