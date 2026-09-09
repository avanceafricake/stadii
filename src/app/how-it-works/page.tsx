import Link from 'next/link';
import type { Metadata } from 'next';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { JsonLdScript } from '@/components/json-ld';
import { PageIntro } from '@/components/cards';
import { Prose, Section } from '@/components/primitives';
import { StadiiShell } from '@/components/shell';
import { buildMetadata } from '@/lib/seo/metadata';
import { routes } from '@/lib/routes';

export const metadata: Metadata = buildMetadata({
  title: 'How STADII works',
  description:
    'Buying, holding, paying, transferring and getting in: how a STADII ticket works from selection to turnstile.',
  path: routes.howItWorks(),
});

export default function HowItWorksPage() {
  return (
    <StadiiShell>
      <JsonLdScript
        id="ld-howto"
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: 'Can I buy tickets on this website?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Not yet. This site is where you find events and check details. Buying happens in the STADII app, which signs you in and confirms availability and price at the moment you pay.',
              },
            },
            {
              '@type': 'Question',
              name: 'Is the price on this page what I pay?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'The price shown is the ticket price the organiser published. A booking fee may be added. The full amount is itemised and confirmed in the app before you pay anything.',
              },
            },
            {
              '@type': 'Question',
              name: 'Can I send a ticket to someone else?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Yes, one ticket at a time. You send a claim link; the person receiving it signs in to claim it. Until they do, the ticket still admits you.',
              },
            },
            {
              '@type': 'Question',
              name: 'Do I need a connection at the gate?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Your ticket code is fetched when you open it, and admission is checked online at the turnstile. Open your ticket before you join the queue.',
              },
            },
          ],
        }}
      />

      <PageIntro
        title="How STADII works"
        lede="From finding an event to walking through a turnstile."
        crumbs={
          <Breadcrumbs
            onDark
            crumbs={[
              { name: 'Home', path: routes.home() },
              { name: 'How it works', path: routes.howItWorks() },
            ]}
          />
        }
      />

      <Section>
          <Prose>
            <h2>1. Find the event</h2>
            <p>
              This website lists every event an organiser has published: fixtures, meets,
              championships and one-off exhibitions. Each event page shows the date and
              start time in the stadium&rsquo;s local time, who is taking part, where it is,
              and the ticket categories with the prices the organiser set.
            </p>
            <p>
              An event carries three separate statuses, and the event page shows all three
              because they answer different questions: whether it is published, whether it
              is going ahead, and whether tickets are selling. Sales can be paused on a
              match that is definitely still on, and a postponed match does not cancel the
              tickets people already hold.
            </p>

            <h2>2. Get tickets in the app</h2>
            <p>
              Buying happens in the STADII app. You pick a category, and for reserved
              seating you pick your actual seats from a live map. Choosing seats places a
              short hold so nobody else can take them while you pay — the hold has a
              countdown, and if it runs out the seats simply go back.
            </p>
            <p>
              <strong>Availability is confirmed when you press continue, not before.</strong>{' '}
              A seat shown as free is the last thing STADII knew. Occasionally someone gets
              there first; the app says so plainly and you pick again. That is normal, not
              an error.
            </p>

            <h2>3. Pay</h2>
            <p>
              Payment is by M-Pesa. You get an STK push on your phone, enter your PIN, and
              STADII waits for confirmation from Safaricom before issuing anything. If a
              confirmation is slow, the app tells you to wait rather than inviting a retry —
              retrying is how people pay twice.
            </p>
            <p>
              The amount you pay is itemised before you confirm: the ticket prices, plus any
              booking fee. That total is worked out once and frozen onto your order, so it
              cannot change afterwards.
            </p>

            <h2>4. Your tickets</h2>
            <p>
              An order for five tickets produces five tickets, each with its own code. A
              ticket is an independent admission credential — the order is not a ticket and
              cannot get anyone in.
            </p>
            <p>
              The code is fetched when you open the ticket and is not stored on your phone.
              That is deliberate: a code sitting in a file is a code that can be copied.{' '}
              <strong>Open your ticket before you join the queue</strong> — it needs a
              connection to load.
            </p>

            <h2>5. Sending a ticket to someone</h2>
            <p>
              Tickets transfer one at a time. You send a claim link, and the person receiving
              it signs in to claim it — which is why a link reaching the wrong person still
              leaves a named account behind. Until it is claimed, the ticket still admits
              you.
            </p>
            <p>
              Organisers can turn transfers off for an event, and can set a cut-off time
              before kick-off.
            </p>

            <h2>6. Getting in</h2>
            <p>
              At the gate, your code is scanned and checked against STADII there and then.
              A scan is what decides admission — not the picture on your screen, not a
              printout, and not a screenshot. That is what stops the same ticket getting two
              people in.
            </p>
            <p>
              If an event is cancelled, tickets are voided and refunds are handled by STADII.
              You do not have to chase anyone.
            </p>

            <h2>Questions we get asked</h2>
            <p>
              <strong>Why can I not buy here?</strong> Because deciding what is available
              and what you owe belongs in one place, and that place is STADII&rsquo;s own
              system rather than a web page. Web purchase is planned; see{' '}
              <Link href={routes.help()}>Help</Link> for what exists today.
            </p>
            <p>
              <strong>Is a screenshot enough?</strong> No. Codes are checked live, and a used
              code is refused the second time.
            </p>
          </Prose>
        </Section>
    </StadiiShell>
  );
}
