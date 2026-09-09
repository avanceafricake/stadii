import Link from 'next/link';
import type { Metadata } from 'next';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { PageIntro } from '@/components/cards';
import { JsonLdScript } from '@/components/json-ld';
import { StadiiShell } from '@/components/shell';
import { routes } from '@/lib/routes';
import { buildMetadata } from '@/lib/seo/metadata';
import { site } from '@/lib/site';

export const metadata: Metadata = buildMetadata({
  title: 'FAQs',
  description:
    'Common questions about buying STADII tickets, showing a QR code at the gate, transfers, refunds and payments.',
  path: routes.faqs(),
});

/**
 * The questions people actually ask, answered in the order they ask them.
 *
 * Distinct from the help centre, which is task-oriented ("how do I…"), and from
 * how-it-works, which explains the model once. This page exists because a
 * visitor with one worry — usually "what if my phone dies" — wants that one
 * answer without reading a guide, and because a FAQPage is the shape a search
 * engine can surface directly.
 *
 * Every answer states what the SYSTEM does. None of them promises an outcome
 * the gate decides (ADR-0010): the honest answer to "will my ticket work" is
 * what makes it work, not "yes".
 */
const FAQS = [
  {
    q: 'How do I buy a ticket?',
    a: 'Tickets are bought in the STADII app. Pick the event, choose a ticket type, and pay with M-Pesa — you get an STK prompt on your phone and confirm it there. The ticket appears in the app the moment the payment settles.',
  },
  {
    q: 'Do I need to print anything?',
    a: 'No. Your ticket is a QR code in the app. Stewards scan it at the gate and STADII confirms it against our records every time.',
  },
  {
    q: 'What if my phone battery dies?',
    a: 'Go to the gate and ask for help with your ticket number — it is on the ticket and on your order. Tickets belong to your account, not to a device, so a steward can look yours up. Charging before you leave is still the better plan.',
  },
  {
    q: 'Does the QR code work without internet?',
    a: 'The code is fetched when you open it and is not stored on the phone, so you need a connection to display it. Open your ticket while you still have signal, before you reach the queue. The scanner at the gate also checks with STADII on every scan — that is what stops the same ticket being used twice.',
  },
  {
    q: 'Can someone else use my ticket?',
    a: 'Only if you transfer it to them. A screenshot is not a second ticket: one ticket admits one person, once, and the first presentation is the one that gets in. Transferring moves the ticket to their account and gives them their own valid credential.',
  },
  {
    q: 'I bought several tickets. How do I give them out?',
    a: 'Each ticket is separate, so you can transfer them one at a time to the people coming with you. Everyone then walks up to the gate with their own code, and nobody has to wait for you.',
  },
  {
    q: 'Which payment methods can I use?',
    a: 'M-Pesa. Card payment is not available yet — the option is shown on the payment screen and marked unavailable so you are not left wondering.',
  },
  {
    q: 'When am I charged?',
    a: 'When you approve the M-Pesa prompt. Choosing seats does not charge you and does not reserve them permanently — seats are held briefly while you pay, and the hold expires.',
  },
  {
    q: 'What is the booking fee?',
    a: 'Where one applies it is itemised on your order before you confirm, and it appears on your receipt. The total you see is the total you pay.',
  },
  {
    q: 'Can I get a refund because I cannot attend?',
    a: 'That is the organiser\u2019s decision, not ours — STADII sells on their behalf. If the reason is that you cannot go, transferring the ticket to someone who can is usually faster and always works.',
  },
  {
    q: 'Are prices shown in Kenyan shillings?',
    a: 'Yes, and every date and kick-off time on this site is shown in the stadium\u2019s local time.',
  },
] as const;

export default function FaqsPage() {
  return (
    <StadiiShell>
      <JsonLdScript
        id="ld-faq"
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: FAQS.map((item) => ({
            '@type': 'Question',
            name: item.q,
            acceptedAnswer: { '@type': 'Answer', text: item.a },
          })),
        }}
      />

      <PageIntro
        title="Frequently asked questions"
        lede="What people ask before their first STADII ticket. If something has already gone wrong — a code that will not load, a payment with no tickets — the help centre is the page you want."
        crumbs={
          <Breadcrumbs
            crumbs={[
              { name: 'Home', path: routes.home() },
              { name: 'FAQs', path: routes.faqs() },
            ]}
          />
        }
      />

      <ul className="grid list-none gap-sm p-0">
        {FAQS.map((item) => (
          <li key={item.q}>
            {/* Native disclosure rather than a scripted accordion: it works
                before JavaScript arrives, it is keyboard-operable for free, and
                browser find-in-page can open it. */}
            <details className="group rounded-lg border border-outline-subtle bg-surface px-md py-sm shadow-sm open:shadow-md">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-md py-sm text-body-lg font-semibold text-ink marker:hidden">
                {item.q}
                <span
                  aria-hidden="true"
                  className="shrink-0 text-info-700 transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="max-w-prose pb-sm text-body text-ink-muted">{item.a}</p>
            </details>
          </li>
        ))}
      </ul>

      <p className="mt-lg text-body text-ink-muted">
        Something gone wrong? The <Link href={routes.help()} className="text-info-700 underline">help centre</Link>{' '}
        covers what to do about it. Money questions are on the{' '}
        <Link href={routes.refunds()} className="text-info-700 underline">refund policy</Link>. Or write to{' '}
        <a href={`mailto:${site.support.email}`} className="text-info-700 underline">
          {site.support.email}
        </a>
        .
      </p>
    </StadiiShell>
  );
}
