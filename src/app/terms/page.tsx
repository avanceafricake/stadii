import Link from 'next/link';
import type { Metadata } from 'next';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { Container, PageHeader, Prose, Section } from '@/components/primitives';
import { routes } from '@/lib/routes';
import { buildMetadata } from '@/lib/seo/metadata';
import { site } from '@/lib/site';

export const metadata: Metadata = buildMetadata({
  title: 'Terms of use',
  description: 'The terms on which STADII sells tickets and admits people to venues.',
  path: routes.terms(),
});

/**
 * A plain-language summary of how the platform actually behaves.
 *
 * NOT a substitute for terms reviewed by a Kenyan lawyer. This page states what
 * the system does — one admission per ticket, refunds decided by the organiser's
 * policy, transfers that move ownership — so that a customer is not surprised.
 * The binding wording has to be written and approved before launch.
 */
export default function TermsPage() {
  return (
    <Container>
      <Breadcrumbs crumbs={[{ name: 'Terms', path: routes.terms() }]} />
      <PageHeader
        title="Terms of use"
        lede="What you are agreeing to when you buy a ticket through STADII."
      />

      <Section>
        <Prose>
          <p className="rounded-lg border border-outline bg-surface-alt p-4 text-sm">
            <strong>Draft.</strong> This page describes how the platform behaves. The
            binding terms for {site.name} are being prepared with Kenyan counsel and will
            replace this text before public launch.
          </p>

          <h2>Buying a ticket</h2>
          <p>
            A ticket is sold by the event organiser. STADII operates the platform, takes
            the payment and issues the ticket. The amount you pay is shown in full, with
            any booking fee itemised, before you confirm — it is fixed at the moment the
            order is created and does not change afterwards.
          </p>
          <p>
            Choosing seats does not reserve them. Seats are held for a short period once
            you continue, and that hold expires. Until payment is confirmed by the payment
            provider, no ticket exists.
          </p>

          <h2>Using a ticket</h2>
          <p>
            One ticket admits one person, once. The QR code is a credential that STADII
            checks at the gate; possession of a copy of it does not create a second
            admission, and the first person to present it is the one who gets in.
          </p>
          <p>
            Admission may still be refused for reasons outside the ticket — venue rules,
            capacity, safety, or an instruction from the police or the organiser. The
            organiser&rsquo;s ground regulations apply inside the venue.
          </p>

          <h2>Sending a ticket to someone else</h2>
          <p>
            Where the organiser allows it, you can transfer a ticket to another person.
            Transfers move ownership: once the other person claims it, the ticket stops
            working for you. Transfers close a set period before the event. Reselling a
            ticket for more than its face value is not permitted.
          </p>

          <h2>Refunds and cancellations</h2>
          <p>
            Refunds are governed by the organiser&rsquo;s refund policy for that event,
            shown on the event page. If an event is cancelled, refunds are processed
            automatically to the account that paid. If an event is postponed, your ticket
            remains valid for the rescheduled date unless the organiser says otherwise.
          </p>
          <p>
            A ticket you have transferred to someone else cannot be refunded by you — it is
            no longer yours.
          </p>

          <h2>Your account</h2>
          <p>
            Tickets are tied to your account, which is what lets them survive a lost phone
            and what makes a transfer traceable. Keep your phone number current; it is how
            we reach you about an event you hold tickets for.
          </p>

          <h2>Contact</h2>
          <p>
            Questions about these terms: <Link href={routes.contact()}>contact us</Link>.
          </p>
        </Prose>
      </Section>
    </Container>
  );
}
