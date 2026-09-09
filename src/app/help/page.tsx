import Link from 'next/link';
import type { Metadata } from 'next';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { JsonLdScript } from '@/components/json-ld';
import { PageIntro } from '@/components/cards';
import { Prose, Section } from '@/components/primitives';
import { StadiiShell } from '@/components/shell';
import { routes } from '@/lib/routes';
import { buildMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildMetadata({
  title: 'Help',
  description:
    'Answers to the questions people actually ask: a QR that will not load, a payment that has not confirmed, a ticket sent to the wrong person, a refusal at the gate.',
  path: routes.help(),
});

/**
 * The questions people ask when something has gone wrong.
 *
 * Every answer here says what STADII actually does. Reassuring copy that
 * over-promises — "your ticket is always available offline" — is worse than
 * nothing, because someone reads it and stops carrying a charger.
 */
const FAQ = [
  {
    q: 'My QR code will not load.',
    a: 'The code is fetched fresh each time you open it and is never stored on your phone, so it needs a connection. Open your ticket before you reach the queue, while you still have signal. If you cannot get online at all, print the ticket beforehand from the app — a printed ticket scans the same way.',
  },
  {
    q: 'I paid but my tickets have not appeared.',
    a: 'Do not pay again. M-Pesa sometimes confirms a minute or two after you enter your PIN, and STADII keeps checking. Once the payment is confirmed the tickets are issued automatically and appear under Tickets. If nothing has arrived after ten minutes, contact support with your order number.',
  },
  {
    q: 'The app says my payment timed out. Was I charged?',
    a: 'A timeout is not a refusal — it means STADII has not had a confirmation yet, not that the money did not move. STADII goes on reconciling with M-Pesa. If the payment did land, your tickets appear on their own. If it did not, nothing was taken.',
  },
  {
    q: 'I sent a ticket to the wrong person.',
    a: 'If they have not claimed it yet, open the ticket in the app and withdraw the offer — the ticket stays yours. Once someone has claimed it, it belongs to them and only they can send it back.',
  },
  {
    q: 'Can I send one ticket and keep the rest?',
    a: 'Yes. Tickets are independent, even when they came from the same order. Send one, keep four, and only the one you sent stops working for you.',
  },
  {
    q: 'I was refused at the gate.',
    a: 'The scanner shows the reason — most often the ticket has already been used to enter, or it was refunded or cancelled. Go to the help desk with your ticket number. A supervisor can check the ticket without using it up, and can reverse an admission if a steward scanned the wrong phone.',
  },
  {
    q: 'Someone screenshotted my QR code. Can they get in?',
    a: 'Only one person gets in on one ticket, whoever arrives first — a copy does not create a second admission. If you think a code has been shared, open the ticket in the app to get a fresh one, or contact support.',
  },
  {
    q: 'My seats disappeared while I was paying.',
    a: 'Seats are held for a few minutes so they do not sit idle while someone thinks about it. If the hold runs out before payment completes, they go back on sale. The countdown in the app shows exactly how long you have.',
  },
  {
    q: 'The event was cancelled. What happens to my money?',
    a: 'Refunds for a cancelled event are processed automatically to the account that paid. You do not need to request one. The ticket will show as refunded in the app.',
  },
] as const;

export default function HelpPage() {
  return (
    <StadiiShell>
      <JsonLdScript
        id="ld-help-faq"
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: FAQ.map((item) => ({
            '@type': 'Question',
            name: item.q,
            acceptedAnswer: { '@type': 'Answer', text: item.a },
          })),
        }}
      />

      <PageIntro
        title="Help"
        lede="When something has gone wrong. If you are at the stadium and stuck, the help desk at the gate can see your ticket immediately."
        crumbs={
          <Breadcrumbs
            onDark
            crumbs={[
              { name: 'Home', path: routes.home() },
              { name: 'Help', path: routes.help() },
            ]}
          />
        }
      />

      <Section>
        <dl className="divide-y divide-outline">
          {FAQ.map((item) => (
            <div key={item.q} className="py-6">
              <dt className="text-lg font-semibold text-on-surface">{item.q}</dt>
              <dd className="mt-2 text-on-surface-muted">{item.a}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section>
        <Prose>
          <p>
            Not what you were looking for? The <Link href={routes.faqs()}>FAQs</Link>{' '}
            answer the questions people ask before buying, and{' '}
            <Link href={routes.howItWorks()}>how STADII works</Link> explains the whole
            thing once. Still stuck — <Link href={routes.contact()}>contact us</Link>.
          </p>
        </Prose>
      </Section>
    </StadiiShell>
  );
}
