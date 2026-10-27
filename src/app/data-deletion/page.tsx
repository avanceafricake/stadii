import Link from 'next/link';
import type { Metadata } from 'next';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { PageIntro } from '@/components/cards';
import { Prose, Section } from '@/components/primitives';
import { StadiiShell } from '@/components/shell';
import { routes } from '@/lib/routes';
import { buildMetadata } from '@/lib/seo/metadata';
import { site } from '@/lib/site';

export const metadata: Metadata = buildMetadata({
  title: 'Deleting your account',
  description:
    'How to delete your STADII account, what is erased, what is kept for accounting reasons, and how long it takes.',
  path: routes.dataDeletion(),
});

/**
 * The public account-deletion page.
 *
 * Google Play requires a publicly reachable URL explaining deletion, linked
 * from the store listing, for any app that lets people create an account. This
 * is that URL.
 *
 * It describes what the mechanism in `backend/application/use-cases/
 * account-deletion.ts` actually does — including the part most deletion pages
 * leave out, which is what is NOT deleted and why. Promising to erase orders
 * and payments would be a promise the platform cannot keep: they are
 * accounting records. Saying so plainly is both more honest and easier to
 * defend than a blanket "we delete everything".
 */
export default function DataDeletionPage() {
  return (
    <StadiiShell>
      <PageIntro
        title="Deleting your account"
        lede="How to delete your STADII account, what goes, what stays, and how long it takes."
        crumbs={
          <Breadcrumbs
            onDark
            crumbs={[
              { name: 'Home', path: routes.home() },
              { name: 'Deleting your account', path: routes.dataDeletion() },
            ]}
          />
        }
      />

      <Section>
        <Prose>
          <h2>How to ask</h2>
          <p>
            In the STADII app, open <strong>Profile</strong>, then{' '}
            <strong>Delete my account</strong>. You will be asked to confirm. That is the
            whole process — you do not need to email anyone, and there is no form to fill
            in.
          </p>
          <p>
            If you can no longer sign in, write to{' '}
            <a href={`mailto:${site.support.email}`}>{site.support.email}</a> from the email
            address on the account and we will do it for you.
          </p>

          <h2>What happens next</h2>
          <p>
            Your account keeps working for <strong>30 days</strong>. Tickets you already
            hold stay valid and will still get you through the gate during that time. The
            30 days are a grace period, not a processing delay: they exist so you can
            change your mind, or recover the account if somebody else asked for it to be
            deleted using your phone.
          </p>
          <p>
            To cancel, open <strong>Profile</strong> again and choose{' '}
            <strong>Keep my account</strong> any time before the 30 days are up.
          </p>
          <p>
            After 30 days the erasure runs and <strong>cannot be undone</strong>.
          </p>

          <h2>What is erased</h2>
          <ul>
            <li>Your name, email address and phone number.</li>
            <li>Your sign-in account, so those details can no longer be used to log in.</li>
            <li>
              The contact details copied onto every order you placed and every ticket you
              held.
            </li>
          </ul>

          <h2>What is kept, and why</h2>
          <p>
            Orders, payments and tickets are <strong>kept, with your name removed</strong>.
            They are accounting records: Kenyan tax law requires them to be retained, the
            money paid out to event organisers is calculated by adding them up, and an
            organiser querying a payout months later is entitled to an answer.
          </p>
          <p>
            What remains is the amount, the date, the event and the fees — with nothing
            identifying you attached. It cannot be traced back to you, and we cannot use it
            to contact you.
          </p>
          <p>
            We would rather tell you this than claim we delete everything, because the
            second claim would not be true.
          </p>

          <h2>How long it takes</h2>
          <ul>
            <li>
              <strong>Immediately</strong> — your request is recorded and the 30-day clock
              starts.
            </li>
            <li>
              <strong>Within 30 days</strong> — you can still cancel, and your tickets still
              work.
            </li>
            <li>
              <strong>After 30 days</strong> — your personal details are erased, permanently.
            </li>
          </ul>

          <h2>Questions</h2>
          <p>
            Our <Link href={routes.privacy()}>privacy notice</Link> covers what we collect in
            the first place and why. Anything else, write to{' '}
            <a href={`mailto:${site.support.email}`}>{site.support.email}</a>.
          </p>
        </Prose>
      </Section>
    </StadiiShell>
  );
}
