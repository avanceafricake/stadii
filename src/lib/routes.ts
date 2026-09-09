/**
 * Every internal path in one place.
 *
 * Slugs are the public identity of a record. IDs are opaque and never appear in
 * a URL (docs/data/firestore-collections.md §Conventions), which is also why a
 * route parameter is validated as a slug before it reaches a query.
 */

export const routes = {
  home: () => '/',
  events: () => '/events',
  event: (slug: string) => `/events/${encodeURIComponent(slug)}`,
  sports: () => '/sports',
  sport: (slug: string) => `/sports/${encodeURIComponent(slug)}`,
  teams: () => '/teams',
  team: (slug: string) => `/teams/${encodeURIComponent(slug)}`,
  venues: () => '/venues',
  venue: (slug: string) => `/venues/${encodeURIComponent(slug)}`,
  competitions: () => '/competitions',
  competition: (slug: string) => `/competitions/${encodeURIComponent(slug)}`,
  search: (q?: string) => (q ? `/search?q=${encodeURIComponent(q)}` : '/search'),
  howItWorks: () => '/how-it-works',
  about: () => '/about',
  contact: () => '/contact',
  help: () => '/help',
  terms: () => '/terms',
  privacy: () => '/privacy',
  refunds: () => '/refunds',
  faqs: () => '/faqs',
  claim: (token: string) => `/claim/${encodeURIComponent(token)}`,
} as const;

/**
 * Firestore slugs are lowercase, alphanumeric and hyphen-separated. Anything
 * else in a route parameter is not a slug that could exist, so it is rejected
 * before a query is issued rather than after.
 */
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function parseSlug(raw: string | undefined): string | null {
  if (typeof raw !== 'string') return null;
  let decoded: string;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    return null;
  }
  const candidate = decoded.trim().toLowerCase();
  if (candidate.length === 0 || candidate.length > 200) return null;
  return SLUG_PATTERN.test(candidate) ? candidate : null;
}

/**
 * A claim token is an opaque bearer value produced by the backend. It is
 * checked for shape only — this surface never resolves it (claiming requires
 * authentication in the app, docs/domain/09-transfers.md).
 */
const CLAIM_TOKEN_PATTERN = /^[A-Za-z0-9_-]{16,256}$/;

export function parseClaimToken(raw: string | undefined): string | null {
  if (typeof raw !== 'string') return null;
  let decoded: string;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    return null;
  }
  return CLAIM_TOKEN_PATTERN.test(decoded) ? decoded : null;
}
