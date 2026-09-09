import Link from 'next/link';
import { Suspense } from 'react';
import type { Metadata } from 'next';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { PageIntro } from '@/components/cards';
import { Icon } from '@/components/icons';
import { Card } from '@/components/primitives';
import { StadiiShell } from '@/components/shell';
import { SignInForm } from '@/components/sign-in-form';
import { routes } from '@/lib/routes';
import { buildMetadata } from '@/lib/seo/metadata';
import { site } from '@/lib/site';

export const metadata: Metadata = buildMetadata({
  title: 'Sign in',
  description:
    'Sign in to STADII with your email or Google account, or create one. The same account works on the website and in the app.',
  path: routes.signIn(),
  // Not a page anyone should arrive at from a search result.
  noindex: true,
});

/**
 * Sign in and registration, for real.
 *
 * The session this creates is an IDENTITY, not a capability. Every command
 * behind it — holding seats, pricing an order, taking payment, issuing a
 * ticket — is re-authorized server-side in the scope its payload names
 * (ADR-0018). A signed-in browser has the right to ask, not the right to do,
 * which is what makes it safe for this surface to hold a session at all.
 *
 * There is no second identity system here: it is the same Firebase Auth
 * project the app signs into, so an account created on the website is the same
 * account in the app, holding the same tickets.
 */
export default function SignInPage() {
  const reasons = [
    {
      icon: 'ticket' as const,
      title: 'Your tickets follow you',
      body: 'Tickets belong to your account, not to a handset. A lost or replaced phone does not lose them.',
    },
    {
      icon: 'qr' as const,
      title: 'The code at the gate',
      body: 'A QR is fetched fresh each time you open a ticket and is never stored on the phone. That is what stops a screenshot getting a second person in.',
    },
    {
      icon: 'users' as const,
      title: 'Sending a ticket on',
      body: 'A transfer moves a ticket to somebody else’s account and gives them their own valid code. Both sides need an account.',
    },
  ];

  return (
    <StadiiShell>
      <PageIntro
        title="Sign in"
        lede="One account for the website and the app. Your tickets are the same in both."
        crumbs={
          <Breadcrumbs
            onDark
            crumbs={[
              { name: 'Home', path: routes.home() },
              { name: 'Sign in', path: routes.signIn() },
            ]}
          />
        }
      />

      {/* The form reads `?then=` and `?mode=`, so it needs a boundary to be
          statically prerendered — otherwise the whole page becomes dynamic and
          every visitor waits on a server render for a form that is the same
          markup every time. */}
      <Suspense
        fallback={
          // Same width and centring as the form, so hydration does not shift
          // the page sideways under the reader.
          <div className="mx-auto h-[28rem] max-w-md animate-pulse rounded-xl bg-surface-sunken" />
        }
      >
        <SignInForm />
      </Suspense>

      <section className="mt-section">
        <h2 className="text-title font-bold tracking-tight text-ink">
          What an account is for
        </h2>
        <ul className="mt-md grid list-none gap-md p-0 sm:grid-cols-3">
          {reasons.map((reason) => (
            <li key={reason.title}>
              <Card className="h-full">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-action-50 text-action-800">
                  <Icon name={reason.icon} />
                </span>
                <h3 className="mt-sm text-body-lg font-bold text-ink">{reason.title}</h3>
                <p className="mt-xs text-body text-ink-muted">{reason.body}</p>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-section">
        <h2 className="text-title font-bold tracking-tight text-ink">
          Somebody sent you a ticket?
        </h2>
        <p className="mt-sm max-w-prose text-body-lg text-ink-muted">
          Open the link they sent you. It takes you to the claim screen, and the ticket moves
          to your account once you sign in. Until you claim it, the ticket still admits
          whoever holds it now — so claim it before matchday rather than at the turnstile.
        </p>
        <p className="mt-md text-body text-ink-muted">
          Stuck? The <Link href={routes.help()}>help centre</Link> covers it, or write to{' '}
          <a href={`mailto:${site.support.email}`}>{site.support.email}</a>.
        </p>
      </section>
    </StadiiShell>
  );
}
