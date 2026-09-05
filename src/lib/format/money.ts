/**
 * Money rendering.
 *
 * ADR-0012: money is INTEGER MINOR UNITS. `priceMinor: 150000` is KES 1,500.00.
 *
 * This module FORMATS and does nothing else. There is no add, no multiply, no
 * subtotal, no fee and no total, because this surface has no fee schedule and
 * no authority to produce one (ADR-0013, ADR-0018). The customer's total is
 * computed once, by the backend, and frozen onto an order. Anything that looks
 * like a total on a website is a guess, and a guess about money is a support
 * call.
 *
 * The formatting itself is integer arithmetic on the minor units — a divide by
 * 100 into a float would reintroduce exactly the drift minor units exist to
 * prevent.
 */
import type { Money } from '@stadii/shared-models';

const MINOR_UNITS_PER_MAJOR = 100;

const CURRENCY_LABEL: Readonly<Record<string, string>> = {
  KES: 'KES',
};

function groupThousands(digits: string): string {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * `150000` → `"KES 1,500.00"`.
 *
 * Negative values are rendered with a leading minus. They occur on stored
 * finance records; nothing on this site produces one.
 */
export function formatMinor(amountMinor: number, currency = 'KES'): string {
  if (!Number.isFinite(amountMinor)) return '—';
  const rounded = Math.trunc(amountMinor);
  const negative = rounded < 0;
  const absolute = Math.abs(rounded);

  const major = Math.trunc(absolute / MINOR_UNITS_PER_MAJOR);
  const minor = absolute % MINOR_UNITS_PER_MAJOR;

  const label = CURRENCY_LABEL[currency] ?? currency;
  const body = `${groupThousands(String(major))}.${String(minor).padStart(2, '0')}`;
  return `${label} ${negative ? '-' : ''}${body}`;
}

export function formatMoney(money: Money | null | undefined): string {
  if (!money) return '—';
  return formatMinor(money.amountMinor, money.currency);
}

/**
 * The numeric string schema.org wants in an `Offer.price`: major units, a dot
 * separator, no grouping and no currency symbol.
 */
export function toSchemaPrice(amountMinor: number): string {
  const rounded = Math.trunc(amountMinor);
  const negative = rounded < 0;
  const absolute = Math.abs(rounded);
  const major = Math.trunc(absolute / MINOR_UNITS_PER_MAJOR);
  const minor = absolute % MINOR_UNITS_PER_MAJOR;
  return `${negative ? '-' : ''}${major}.${String(minor).padStart(2, '0')}`;
}

/**
 * The lowest price actually stored on a set of ticket categories.
 *
 * This SELECTS a stored value; it does not compute one. What a customer
 * ultimately pays includes fees this surface has no schedule for, which is why
 * the copy at every call site says "from" and never "total".
 */
export function lowestStoredPriceMinor(
  prices: readonly number[],
): number | null {
  const valid = prices.filter((p) => Number.isFinite(p));
  if (valid.length === 0) return null;
  return valid.reduce((lowest, p) => (p < lowest ? p : lowest), valid[0] as number);
}
