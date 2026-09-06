/**
 * The formatters, and what they must refuse to do.
 *
 * These are the modules where a public website is most tempted to become
 * authoritative: it has a price, it has a quantity, and adding them looks
 * harmless. It is not — this surface has no fee schedule, so any total it
 * produced would be a guess about money (ADR-0013, ADR-0018).
 */
import { describe, expect, it } from 'vitest';

import {
  formatMinor,
  formatMoney,
  lowestStoredPriceMinor,
  toSchemaPrice,
} from './money';
import {
  kindLabel,
  layoutFor,
  participantCountLabel,
  participantSummaryLine,
  roleLabel,
  schemaTypeForKind,
} from './participants';
import * as moneyModule from './money';
import { addressParts, placeLine } from './format';

describe('money is formatted, never computed', () => {
  it('renders integer minor units as major units', () => {
    expect(formatMinor(150_000)).toBe('KES 1,500.00');
    expect(formatMinor(500)).toBe('KES 5.00');
    expect(formatMinor(0)).toBe('KES 0.00');
  });

  it('groups thousands without touching the cents', () => {
    expect(formatMinor(123_456_789)).toBe('KES 1,234,567.89');
  });

  it('keeps a trailing zero cent, because 1,500.0 reads as a bug', () => {
    expect(formatMinor(150_010)).toBe('KES 1,500.10');
    expect(formatMinor(150_001)).toBe('KES 1,500.01');
  });

  it('never divides into a float', () => {
    // 0.1 + 0.2 arithmetic is exactly what minor units exist to prevent. If the
    // formatter ever went via a float this value would drift.
    expect(formatMinor(1_000_000_007)).toBe('KES 10,000,000.07');
  });

  it('renders an absent amount as a dash, not as zero', () => {
    // "KES 0.00" says the ticket is free. A missing price says nothing yet.
    expect(formatMoney(null)).toBe('—');
    expect(formatMoney(undefined)).toBe('—');
    expect(formatMinor(Number.NaN)).toBe('—');
  });

  it('respects the currency it was given rather than assuming KES', () => {
    expect(formatMinor(150_000, 'UGX')).toBe('UGX 1,500.00');
  });

  it('produces the plain numeric string schema.org wants', () => {
    // No grouping, no symbol — Google rejects "KES 1,500.00" in an Offer.
    expect(toSchemaPrice(150_000)).toBe('1500.00');
    expect(toSchemaPrice(500)).toBe('5.00');
  });

  it('SELECTS the lowest stored price and does not derive one', () => {
    expect(lowestStoredPriceMinor([150_000, 50_000, 500_000])).toBe(50_000);
    expect(lowestStoredPriceMinor([])).toBeNull();
  });

  it('exports no arithmetic at all', () => {
    // The guard that matters. If someone adds `sum`, `total`, `withFee` or
    // `subtotal` here, this fails — and the review conversation happens before
    // a fee engine grows on a public website.
    const forbidden = ['sum', 'add', 'total', 'subtotal', 'withFee', 'plus', 'multiply'];
    const exported = Object.keys(moneyModule);
    for (const name of forbidden) {
      expect(exported).not.toContain(name);
    }
  });
});

describe('an event has N participants, not two sides', () => {
  it('lays out zero, one, two and many differently', () => {
    // A championship with nothing drawn yet, a charity exhibition, a league
    // fixture, an athletics meet.
    expect(layoutFor(0)).toBe('none');
    expect(layoutFor(1)).toBe('single');
    expect(layoutFor(2)).toBe('pair');
    expect(layoutFor(3)).toBe('field');
    expect(layoutFor(40)).toBe('field');
  });

  it('treats a negative count as none rather than throwing', () => {
    expect(layoutFor(-1)).toBe('none');
  });

  it('summarises any number of names without assuming a versus', () => {
    expect(participantSummaryLine([])).toBe('');
    expect(participantSummaryLine(['Gor Mahia'])).toBe('Gor Mahia');
    expect(participantSummaryLine(['Gor Mahia', 'AFC Leopards'])).toBe(
      'Gor Mahia and AFC Leopards',
    );
    expect(participantSummaryLine(['A', 'B', 'C', 'D', 'E'])).toBe('A, B, C and 2 more');
  });

  it('says participants are to be confirmed rather than showing nothing', () => {
    expect(participantCountLabel(0)).toBe('Participants to be confirmed');
    expect(participantCountLabel(1)).toBe('1 participant');
    expect(participantCountLabel(40)).toBe('40 participants');
  });

  it('labels every role the model has, including the four that are not HOME or AWAY', () => {
    expect(roleLabel('HOME')).toBe('Home');
    expect(roleLabel('AWAY')).toBe('Away');
    expect(roleLabel('COMPETITOR')).toBe('Competitor');
    expect(roleLabel('HOST')).toBe('Host');
    expect(roleLabel('GUEST')).toBe('Guest');
    expect(roleLabel('PERFORMER')).toBe('Performer');
  });

  it('returns an empty label for a role a newer backend introduced', () => {
    // Degrade quietly rather than rendering "undefined" on a public page.
    expect(roleLabel('REFEREE')).toBe('');
    expect(roleLabel(undefined)).toBe('');
  });

  it('maps a participant kind to the right schema.org type', () => {
    expect(schemaTypeForKind('ATHLETE')).toBe('Person');
    expect(schemaTypeForKind('TEAM')).toBe('SportsTeam');
    expect(schemaTypeForKind('CLUB')).toBe('SportsTeam');
    expect(schemaTypeForKind('ORGANIZATION')).toBe('Organization');
  });

  it('falls back to Thing when the kind is unknown', () => {
    // The summary carried on an event has no kind. `Thing` is true; guessing
    // `SportsTeam` for an athlete is not.
    expect(schemaTypeForKind(undefined)).toBe('Thing');
    expect(schemaTypeForKind('SOMETHING_NEW')).toBe('Thing');
  });

  it('labels each participant kind', () => {
    expect(kindLabel('TEAM')).toBe('Team');
    expect(kindLabel('ATHLETE')).toBe('Athlete');
    expect(kindLabel('SOMETHING_NEW')).toBe('');
  });
});

describe('placeLine', () => {
  it('does not print the same name twice', () => {
    // The bug this exists for: half of Kenya's counties share a name with
    // their principal town, and "Nakuru, Nakuru" reads as a rendering fault.
    expect(placeLine('Nakuru', 'Nakuru')).toBe('Nakuru');
    expect(placeLine('Nairobi', 'Nairobi')).toBe('Nairobi');
  });

  it('keeps the county when it adds something', () => {
    expect(placeLine('Awendo', 'Migori')).toBe('Awendo, Migori');
    expect(placeLine('Thika', 'Kiambu')).toBe('Thika, Kiambu');
  });

  it('ignores case and stray whitespace when comparing', () => {
    expect(placeLine('Kisii', ' kisii ')).toBe('Kisii');
  });

  it('copes with either half missing', () => {
    expect(placeLine('Eldoret', undefined)).toBe('Eldoret');
    expect(placeLine(undefined, 'Uasin Gishu')).toBe('Uasin Gishu');
    expect(placeLine(undefined, undefined)).toBe('');
  });
});

describe('addressParts', () => {
  it('drops a repeat, so a maps query is not "Nakuru, Nakuru"', () => {
    // A venue with no recorded locality stores the town as line1, because
    // line1 is required. Joining naively repeats it.
    expect(addressParts('Afraha Stadium', 'Nakuru', 'Nakuru')).toEqual([
      'Afraha Stadium',
      'Nakuru',
    ]);
  });

  it('keeps genuinely different parts, in order', () => {
    expect(addressParts('Kasarani Indoor Arena', 'Kasarani', 'Nairobi')).toEqual([
      'Kasarani Indoor Arena',
      'Kasarani',
      'Nairobi',
    ]);
  });

  it('skips blanks and undefined', () => {
    expect(addressParts('Gusii Stadium', undefined, '  ', 'Kisii')).toEqual([
      'Gusii Stadium',
      'Kisii',
    ]);
  });
});
