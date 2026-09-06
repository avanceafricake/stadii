/**
 * Search has to find a ground by the name people actually use.
 *
 * Kenyan venues get renamed and the old name outlives the change by years. The
 * research pack says so in as many words — "Use current name; keep Talanta as
 * alias" — and a catalogue that only matches the current official name hides
 * the country's biggest stadium from anyone who calls it what it was called
 * last season.
 */

import { describe, expect, it } from 'vitest';

import { matches, normaliseQuery } from './search';

const RAILA = {
  name: 'Raila Odinga International Stadium',
  alsoKnownAs: ['Talanta Stadium', 'Talanta Sports City Stadium'],
  city: 'Nairobi',
  county: 'Nairobi',
};

const KASARANI = {
  name: 'Moi International Sports Centre Kasarani',
  alsoKnownAs: ['Kasarani Stadium', 'Safaricom Stadium', 'Kasarani'],
  city: 'Nairobi',
  county: 'Nairobi',
};

/** The same call the venue filter makes. */
function findsVenue(query: string, venue: typeof RAILA): boolean {
  return matches(query, venue.name, ...venue.alsoKnownAs, venue.city, venue.county);
}

describe('a venue is findable by the name people use', () => {
  it('finds the national stadium by "Talanta"', () => {
    // The 60,000-seat ground is officially Raila Odinga International Stadium.
    // Everyone still says Talanta.
    expect(findsVenue('Talanta', RAILA)).toBe(true);
  });

  it('finds Kasarani by a sponsor name it carried', () => {
    expect(findsVenue('Safaricom', KASARANI)).toBe(true);
  });

  it('still finds it by its current official name', () => {
    // An alias must not replace the real name in the index.
    expect(findsVenue('Raila Odinga', RAILA)).toBe(true);
    expect(findsVenue('Moi International', KASARANI)).toBe(true);
  });

  it('is case-insensitive, because nobody types a stadium name in title case', () => {
    expect(findsVenue('talanta', RAILA)).toBe(true);
    expect(findsVenue('TALANTA', RAILA)).toBe(true);
  });

  it('does not match a venue that has nothing to do with the query', () => {
    expect(findsVenue('Talanta', KASARANI)).toBe(false);
    expect(findsVenue('Mombasa', RAILA)).toBe(false);
  });

  it('copes with a venue that has no aliases at all', () => {
    expect(matches('Afraha', 'Afraha Stadium', 'Nakuru', 'Nakuru')).toBe(true);
    expect(matches('Talanta', 'Afraha Stadium', 'Nakuru', 'Nakuru')).toBe(false);
  });
});

describe('normaliseQuery', () => {
  it('collapses whitespace and trims', () => {
    expect(normaliseQuery('  talanta   stadium ')).toBe('talanta stadium');
  });

  it('caps the length, so a pasted essay is not a query', () => {
    expect(normaliseQuery('x'.repeat(500))).toHaveLength(100);
  });

  it('treats a missing query as empty', () => {
    expect(normaliseQuery(undefined)).toBe('');
  });
});
