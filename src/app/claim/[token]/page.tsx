import type { Metadata } from 'next';

import { ButtonLink, Card, Container, Section } from '@/components/primitives';
import { appLinks } from '@/lib/app-links';
import { parseClaimToken, routes } from '@/lib/routes';
import { buildMetadata } from '@/lib/seo/metadata';
import { site } from '@/lib/site';

/**
 * The transfer landing page.
 *
 * WHAT THIS PAGE DOES NOT DO: it does not claim the ticket, and it does not
 * look the transfer up.
 *
 * Claiming is an authenticated backend command. It consumes a single-use token
 * atomically, moves `holderUserId`, revokes the old credential and issues a new
 * one (docs/domain/09-transfers.md). Doing any part of that from an anonymous
 * web page would need either a privileged credential on this host — which it
 * must never have (ADR-0018) — or a public write path, which `firestore.rules`
 * correctly forbids for every collection.
 *
 * It cannot even read the offer to show who sent it: `ticketTransfers` is
 * readable only by the two parties, and the recipient is not signed in here.
 * Rather than guess at the contents, this page explains the mechanism honestly
 * and hands off to the app.
 *
 * The token is a bearer value. It is never rendered as text, never sent to any
 * third party, and the route sets `no-referrer` and `noindex` headers
 * (next.config.mjs) so it cannot leak through a referrer or a search index.
 */

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ token: string }> };

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: 'Claim a ticket',
    description:
      'Someone has sent you a ticket on STADII. Open the link in the STADII app and sign in to claim it.',
    path: routes.claim('_'),
    noindex: true,
  });
}

export default async function ClaimPage({ params }: Params) {
  const token = parseClaimToken((await params).token);

  return (
    <Container>
      <Section className="mx-auto max-w-prose">
        <h1 className="text-headline font-bold tracking-tight text-ink">
          Someone has sent you a ticket
        </h1>
        <p className="mt-md text-body-lg text-ink-muted">
          A STADII ticket has been offered to you. To accept it you need the {site.name}{' '}
          app and an account — that is what makes the ticket yours rather than
          whoever else happens to open this link.
        </p>

        {token ? (
          <div className="mt-lg flex flex-wrap gap-sm">
            <ButtonLink
              href={appLinks.claim(token)}
              external
              rel="noopener noreferrer"
              referrerPolicy="no-referrer"
            >
              Open in the STADII app
            </ButtonLink>
            {site.app.android ? (
              <ButtonLink href={site.app.android} tone="secondary" external>
                Get it on Android
              </ButtonLink>
            ) : null}
            {site.app.ios ? (
              <ButtonLink href={site.app.ios} tone="secondary" external>
                Get it on iPhone
              </ButtonLink>
            ) : null}
          </div>
        ) : (
          <Card className="mt-lg border-outline-strong">
            <p className="text-body-lg font-semibold text-ink">This link is not readable</p>
            <p className="mt-xs text-body text-ink-muted">
              It may have been shortened, wrapped by a messaging app or copied
              incompletely. Ask the sender to send it again — they can also cancel the
              offer and start a new one from their ticket.
            </p>
          </Card>
        )}

        <Card className="mt-xl">
          <h2 className="text-title font-semibold text-ink">What happens next</h2>
          <ol className="mt-md list-decimal space-y-sm pl-lg text-body-lg text-ink-muted">
            <li>Open the link in the STADII app.</li>
            <li>
              Sign in, or create an account with your phone number. The ticket is issued to
              the account that claims it.
            </li>
            <li>
              STADII checks the offer is still open and moves the ticket. The old code stops
              working and you get a new one.
            </li>
          </ol>
        </Card>

        <Card className="mt-md">
          <h2 className="text-title font-semibold text-ink">Worth knowing</h2>
          <ul className="mt-md list-disc space-y-sm pl-lg text-body-lg text-ink-muted">
            <li>
              <strong className="font-semibold text-ink">The offer expires.</strong> Transfer
              offers have a time limit, and an offer can never outlive the event&rsquo;s own
              transfer cut-off. If it has expired the app will say so.
            </li>
            <li>
              <strong className="font-semibold text-ink">
                Until you claim it, the ticket still works for the sender.
              </strong>{' '}
              Nobody is left without admission while an offer is sitting unopened.
            </li>
            <li>
              <strong className="font-semibold text-ink">A link is not a ticket.</strong> This
              page cannot admit anyone and this link is not a code that can be scanned.
              Admission is decided at the gate, when a code is scanned, against STADII.
            </li>
            <li>
              <strong className="font-semibold text-ink">Only one person can claim it.</strong>{' '}
              The link works once. If someone else has already used it, the app will tell
              you.
            </li>
          </ul>
        </Card>

        <p className="mt-lg text-body text-ink-muted">
          Not expecting a ticket? You can ignore this link. Nothing has been charged to you
          and nothing happens until someone signs in and claims it. If you think it reached
          you by mistake, tell the sender so they can cancel the offer.
        </p>
      </Section>
    </Container>
  );
}
