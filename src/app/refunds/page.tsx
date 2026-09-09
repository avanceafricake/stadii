import Link from 'next/link';
import type { Metadata } from 'next';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { PageIntro } from '@/components/cards';
import { Prose } from '@/components/primitives';
import { StadiiShell } from '@/components/shell';
import { routes } from '@/lib/routes';
import { buildMetadata } from '@/lib/seo/metadata';
import { site } from '@/lib/site';

export const metadata: Metadata = buildMetadata({
  title: 'Refund policy',
  description:
    'When a STADII ticket is refunded, who decides, how long it takes and where the money goes.',
  path: routes.refunds(),
});

/**
 * What the platform actually does about money going back.
 *
 * NOT binding wording. The important honesty here is about authorship: STADII
 * does not own the refund decision for a normal change of mind — the organiser
 * sets the policy for their event — and pretending otherwise on this page would
 * promise something the platform cannot deliver. What STADII does own is the
 * cancelled-event case, because that is a platform-initiated refund.
 */
export default function RefundsPage() {
  return (
    <StadiiShell>
      <PageIntro
        title="Refund policy"
        lede="When money goes back, who decides, and how long it takes."
        crumbs={
          <Breadcrumbs
            crumbs={[
              { name: 'Home', path: routes.home() },
              { name: 'Refund policy', path: routes.refunds() },
            ]}
          />
        }
      />

      <Prose>
        <p className="rounded-lg border border-outline bg-surface-alt p-4 text-sm">
          <strong>Draft.</strong> This page describes how the platform behaves today. The
          binding policy for {site.name} is being prepared with Kenyan counsel and will
          replace this text before public launch.
        </p>

        <h2>If the event is cancelled</h2>
        <p>
          You are refunded in full, to the M-Pesa number that paid, without having to ask.
          STADII starts the refund when the organiser marks the event cancelled; you do not
          need to contact anyone, and you do not need to do anything with the ticket in
          your phone — it stops being admissible at the same moment.
        </p>
        <p>
          A refund is a separate transaction from the payment. It is processed by the same
          provider and lands on the same number, usually within a few working days. Until
          it lands, the ticket shows as refunded in the app so there is a record of it.
        </p>

        <h2>If the event is postponed</h2>
        <p>
          Your ticket stays valid for the new date. Nothing is refunded automatically,
          because nothing has been cancelled. If the new date does not work for you, ask
          the organiser — the answer is theirs, and the route is{' '}
          <Link href={routes.contact()}>contact us</Link>.
        </p>

        <h2>If you change your mind</h2>
        <p>
          The organiser decides. STADII sells on their behalf and does not overrule their
          policy, so whether a ticket you no longer want can be refunded depends on the
          event. Where an organiser allows it, we process it; where they do not, we say so
          rather than leaving a request open.
        </p>
        <p>
          If your reason for wanting a refund is that you cannot attend, a{' '}
          <Link href={routes.howItWorks()}>transfer</Link> is often the better answer: it
          moves the ticket to someone else&apos;s account, and the person who receives it
          gets a fresh, valid credential.
        </p>

        <h2>What is never refunded automatically</h2>
        <p>
          A ticket that has already been used to enter. Admission is the thing you bought,
          and once the gate has admitted it, it has been delivered.
        </p>

        <h2>Fees</h2>
        <p>
          Where a booking fee was charged, it is itemised on your order and on your
          receipt. A full refund for a cancelled event returns the fee as well.
        </p>

        <h2>Asking about a refund</h2>
        <p>
          Have your order number or ticket number ready — both are printed on the ticket
          and on the order in the app, and both are the fastest way for support to find the
          exact transaction. Write to{' '}
          <a href={`mailto:${site.support.email}`}>{site.support.email}</a> or use{' '}
          <Link href={routes.contact()}>contact us</Link>.
        </p>
      </Prose>
    </StadiiShell>
  );
}
