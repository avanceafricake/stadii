import Link from 'next/link';
import type { Metadata } from 'next';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { Container, PageHeader, Prose, Section } from '@/components/primitives';
import { routes } from '@/lib/routes';
import { buildMetadata } from '@/lib/seo/metadata';
import { site } from '@/lib/site';

export const metadata: Metadata = buildMetadata({
  title: 'Privacy',
  description:
    'What STADII collects, why, how long it is kept, and what is deliberately not collected.',
  path: routes.privacy(),
});

/**
 * Written against what the system actually stores.
 *
 * The specifics here — hashed recipient contacts, credentials stored only as a
 * hash, favourites kept on the device — are design decisions recorded in
 * docs/security/threat-model.md and ADR-0009, not aspirations. Kenyan counsel
 * still needs to review this against the Data Protection Act 2019 before launch.
 */
export default function PrivacyPage() {
  return (
    <Container>
      <Breadcrumbs crumbs={[{ name: 'Privacy', path: routes.privacy() }]} />
      <PageHeader
        title="Privacy"
        lede="What we hold about you, why we hold it, and what we deliberately do not."
      />

      <Section>
        <Prose>
          <p className="rounded-lg border border-outline bg-surface-alt p-4 text-sm">
            <strong>Draft.</strong> This describes the platform&rsquo;s actual behaviour. A
            notice reviewed against the Kenya Data Protection Act 2019 will replace it
            before public launch.
          </p>

          <h2>What we collect</h2>
          <ul>
            <li>
              <strong>Your phone number</strong>, to sign you in and to send the M-Pesa
              prompt when you buy.
            </li>
            <li>
              <strong>Your name and email</strong>, if you give them, so an order can be
              traced to a person at a help desk.
            </li>
            <li>
              <strong>Your orders and tickets</strong> — what you bought, what you paid, and
              whether a ticket has been used or transferred.
            </li>
            <li>
              <strong>Scan records</strong>, when a ticket is presented at a gate: which
              gate, when, and what STADII answered.
            </li>
          </ul>

          <h2>What we deliberately do not collect</h2>
          <ul>
            <li>
              <strong>Your M-Pesa PIN or card details.</strong> These are entered with the
              payment provider, never with us. Nothing in the STADII apps handles them.
            </li>
            <li>
              <strong>The phone number of someone you send a ticket to</strong>, in the
              clear. We store a hash of it and a masked version to show you, so a person
              who never became a customer is not left with a record here.
            </li>
            <li>
              <strong>Your location.</strong> The apps do not track where you are.
            </li>
            <li>
              <strong>Events you save.</strong> Favourites are kept on your device and never
              sent to us — they affect nothing we decide, so they need no record here.
            </li>
          </ul>

          <h2>Ticket credentials</h2>
          <p>
            The QR code on a ticket is stored only as a one-way hash. Nobody, including us,
            can reconstruct a scannable code from our database — which is why your code is
            fetched fresh each time you open a ticket rather than kept on your phone.
          </p>

          <h2>Who sees what</h2>
          <p>
            Gate staff see whether a ticket admits and why not, never your payment details.
            An event organiser sees sales and attendance for their own events. Everything an
            administrator does to your order is recorded in an audit log with their name
            against it.
          </p>

          <h2>How long we keep it</h2>
          <p>
            Orders, payments and tickets are kept as long as we are required to for tax and
            accounting. Scan records are kept for the season. Expired holds and abandoned
            baskets are deleted automatically.
          </p>

          <h2>Your rights</h2>
          <p>
            You can ask for a copy of what we hold about you, ask us to correct it, or ask
            us to delete it — subject to records we must keep by law. Write to{' '}
            <a href={`mailto:${site.support.email}`}>{site.support.email}</a> or{' '}
            <Link href={routes.contact()}>contact us</Link>.
          </p>
        </Prose>
      </Section>
    </Container>
  );
}
