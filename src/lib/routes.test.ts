/**
 * Route parameters are untrusted input.
 *
 * Every dynamic segment on this site reaches a Firestore query. Validating the
 * shape before the query is issued is what stops a crafted URL becoming a read
 * we did not intend — and it means a nonsense URL is a 404 rather than an
 * error page.
 */
import { describe, expect, it } from 'vitest';

import { parseClaimToken, parseSlug, routes } from './routes';

describe('slugs are the public identity, ids never appear in a URL', () => {
  it('accepts the slugs the backend actually produces', () => {
    expect(parseSlug('gor-mahia-v-afc-leopards')).toBe('gor-mahia-v-afc-leopards');
    expect(parseSlug('nyayo-national-stadium')).toBe('nyayo-national-stadium');
    expect(parseSlug('football')).toBe('football');
    expect(parseSlug('kpl-2026')).toBe('kpl-2026');
  });

  it('normalises case, because a shared link may have been through a mail client', () => {
    expect(parseSlug('Gor-Mahia')).toBe('gor-mahia');
  });

  it('decodes percent-encoding before validating', () => {
    expect(parseSlug('gor%2Dmahia')).toBe('gor-mahia');
  });

  it('rejects anything that is not a slug', () => {
    // None of these could name a document, so none should reach a query.
    expect(parseSlug('../../secrets')).toBeNull();
    expect(parseSlug('a b')).toBeNull();
    expect(parseSlug('team/../admin')).toBeNull();
    expect(parseSlug('-leading')).toBeNull();
    expect(parseSlug('trailing-')).toBeNull();
    expect(parseSlug('double--hyphen')).toBeNull();
    expect(parseSlug('')).toBeNull();
    expect(parseSlug(undefined)).toBeNull();
  });

  it('rejects a malformed percent-encoding instead of throwing', () => {
    // `decodeURIComponent('%')` throws. A crafted URL must 404, not 500.
    expect(parseSlug('%')).toBeNull();
    expect(parseSlug('%E0%A4%A')).toBeNull();
  });

  it('rejects an absurdly long segment', () => {
    expect(parseSlug('a'.repeat(500))).toBeNull();
  });
});

describe('claim tokens are checked for shape only', () => {
  it('accepts an opaque backend token', () => {
    const token = 'AbCd1234-_EfGh5678ijkl';
    expect(parseClaimToken(token)).toBe(token);
  });

  it('does NOT lowercase it — a token is case-sensitive', () => {
    // Slugs are normalised; a bearer token must not be, or a valid offer
    // becomes unclaimable.
    expect(parseClaimToken('AbCdEfGhIjKlMnOp')).toBe('AbCdEfGhIjKlMnOp');
  });

  it('rejects tokens that are too short or contain separators', () => {
    expect(parseClaimToken('short')).toBeNull();
    expect(parseClaimToken('has/a/slash/in/it/somewhere')).toBeNull();
    expect(parseClaimToken(undefined)).toBeNull();
  });
});

describe('route builders', () => {
  it('encode a slug into the path', () => {
    expect(routes.event('gor-mahia-v-afc-leopards')).toBe(
      '/events/gor-mahia-v-afc-leopards',
    );
    expect(routes.team('afc-leopards')).toBe('/teams/afc-leopards');
    expect(routes.venue('kasarani')).toBe('/venues/kasarani');
  });

  it('encode a search term rather than interpolating it raw', () => {
    expect(routes.search('gor mahia')).toBe('/search?q=gor%20mahia');
    expect(routes.search('a&b=c')).toBe('/search?q=a%26b%3Dc');
    expect(routes.search()).toBe('/search');
  });

  it('cover every static page the footer and sitemap link to', () => {
    // A route in the sitemap with no page behind it is a 404 served to a
    // crawler, which is worse than not listing it.
    expect(routes.about()).toBe('/about');
    expect(routes.contact()).toBe('/contact');
    expect(routes.help()).toBe('/help');
    expect(routes.terms()).toBe('/terms');
    expect(routes.privacy()).toBe('/privacy');
    expect(routes.howItWorks()).toBe('/how-it-works');
  });
});
