/**
 * The three event status axes.
 *
 * ADR-0016 split one `status` enum into three because they answer unrelated
 * questions: is it visible, is it happening, is it selling. The failure this
 * file guards is a public page quietly collapsing them back into one badge —
 * at which point "postponed" and "sales suspended" become the same word and a
 * customer cannot tell whether to turn up.
 */
import { describe, expect, it } from 'vitest';

import { allAxes, operationalAxis, publicationAxis, purchaseEntryPoint, salesAxis } from './status';

const scheduledOnSale = {
  publicationStatus: 'PUBLISHED',
  operationalStatus: 'SCHEDULED',
  salesStatus: 'ON_SALE',
} as const;

describe('the three axes stay three', () => {
  it('renders one badge per axis, in a fixed order', () => {
    const axes = allAxes(scheduledOnSale);

    expect(axes).toHaveLength(3);
    expect(axes.map((a) => a.axis)).toEqual(['Event', 'Tickets', 'Publication']);
  });

  it('tells a postponed event apart from a suspended sale', () => {
    // The distinction ADR-0016 exists for. Under one enum these were the same
    // value, and a customer could not tell whether to travel.
    const postponed = allAxes({ ...scheduledOnSale, operationalStatus: 'POSTPONED' });
    const suspended = allAxes({ ...scheduledOnSale, salesStatus: 'SUSPENDED' });

    const postponedLabels = postponed.map((a) => a.label).join(' ');
    const suspendedLabels = suspended.map((a) => a.label).join(' ');
    expect(postponedLabels).not.toBe(suspendedLabels);

    // And each names its own axis, so the badge is not ambiguous on its own.
    expect(postponed.find((a) => a.axis === 'Event')?.value).toBe('POSTPONED');
    expect(suspended.find((a) => a.axis === 'Tickets')?.value).toBe('SUSPENDED');
  });

  it('shows the backend’s own reason for a suspension', () => {
    // The generic copy cannot know why. The backend can, and its wording is
    // more specific than anything this site could write (ADR-0016).
    const axis = salesAxis('SUSPENDED', 'Paused while the fixture is rescheduled.');

    expect(axis.description).toBe('Paused while the fixture is rescheduled.');
  });

  it('falls back to generic copy when no reason was given', () => {
    const axis = salesAxis('SUSPENDED');

    expect(axis.description).not.toBe('');
    expect(axis.label).not.toBe('Status unavailable');
  });

  it('degrades honestly when this build does not know a value', () => {
    // An older page meeting a newer backend must not render "undefined" or
    // guess a tone (ADR-0018).
    const unknown = operationalAxis('ABANDONED_MID_MATCH' as never);

    expect(unknown.label).toBe('Status unavailable');
    expect(unknown.value).toBe('ABANDONED_MID_MATCH');
    expect(unknown.tone).toBe('neutral');
  });

  it('degrades honestly when a value is missing entirely', () => {
    const missing = publicationAxis(undefined as never);

    expect(missing.label).toBe('Status unavailable');
    expect(missing.value).toBe('UNKNOWN');
  });
});

describe('the purchase entry point renders state, it does not decide', () => {
  it('offers the hand-off for an event on sale', () => {
    const cta = purchaseEntryPoint(scheduledOnSale);

    expect(cta.offer).toBe(true);
    // Never a promise about the final amount — this site has no fee schedule.
    expect(cta.note.toLowerCase()).toContain('booking fee');
  });

  it('STILL offers it when the cached status says sold out', () => {
    // Deliberate. SOLD_OUT is a cached display value refreshed by a job, and
    // the backend lets a request through anyway because a refund may have
    // freed a seat since. Hiding the button would be more confidently wrong
    // than the backend is (ADR-0016).
    const cta = purchaseEntryPoint({ ...scheduledOnSale, salesStatus: 'SOLD_OUT' });

    expect(cta.offer).toBe(true);
  });

  it('withdraws it for a cancelled event', () => {
    // Presentation of operationalStatus, not a sales judgement: the backend
    // refuses either way, and a "buy tickets" button on a cancelled match is a
    // support call waiting to happen.
    const cta = purchaseEntryPoint({
      ...scheduledOnSale,
      operationalStatus: 'CANCELLED',
    });

    expect(cta.offer).toBe(false);
    expect(cta.note.toLowerCase()).toContain('cancelled');
  });

  it('withdraws it for an event that has finished', () => {
    const cta = purchaseEntryPoint({
      ...scheduledOnSale,
      operationalStatus: 'COMPLETED',
    });

    expect(cta.offer).toBe(false);
  });

  it('never claims a seat is available', () => {
    // The whole surface. Every wording must be about the hand-off, not about
    // inventory this page cannot see (ADR-0018).
    for (const salesStatus of ['ON_SALE', 'SOLD_OUT', 'SUSPENDED', 'CLOSED', 'NOT_YET_OPEN'] as const) {
      const cta = purchaseEntryPoint({ ...scheduledOnSale, salesStatus });
      const copy = `${cta.label} ${cta.note}`.toLowerCase();
      expect(copy).not.toContain('seats available');
      expect(copy).not.toContain('guaranteed');
    }
  });
});
