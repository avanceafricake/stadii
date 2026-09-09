import type { Metadata } from 'next';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { PageIntro } from '@/components/cards';
import { Prose, Section } from '@/components/primitives';
import { StadiiShell } from '@/components/shell';
import { routes } from '@/lib/routes';
import { buildMetadata } from '@/lib/seo/metadata';
import { site } from '@/lib/site';

export const metadata: Metadata = buildMetadata({
  title: 'About STADII',
  description:
    'STADII is a sports-only ticketing and stadium-access platform built for Kenya and East Africa.',
  path: routes.about(),
});

export default function AboutPage() {
  return (
    <StadiiShell>
      <PageIntro
        title="About STADII"
        lede="A ticketing and stadium-access platform built for East African sport, not adapted from somewhere else."
        crumbs={
          <Breadcrumbs
            onDark
            crumbs={[
              { name: 'Home', path: routes.home() },
              { name: 'About', path: routes.about() },
            ]}
          />
        }
      />

      <Section>
        <Prose>
          <p>
            STADII sells tickets for sport and gets people through turnstiles. It is
            deliberately not a general events platform: a football fixture, an athletics
            meet and a swimming championship have almost nothing in common except a venue
            and a start time, and a system that pretends otherwise ends up describing none
            of them properly.
          </p>

          <h2>What that means in practice</h2>
          <p>
            An event on STADII has however many participants it actually has. A league
            fixture has two sides. A meet has forty competitors. A championship may list
            none at all until the heats are drawn. None of those is a special case here.
          </p>
          <p>
            Venues are described as they are built. Some stadiums have sections, blocks,
            rows and numbered seats. Others have a terrace and a gate. STADII does not
            invent seat numbers for a standing area, and it does not require a stadium to
            pretend it has a structure it has not got.
          </p>

          <h2>One ticket, one admission</h2>
          <p>
            Every ticket is its own credential. An order for five produces five separate
            tickets, each of which can be held by a different person, sent to a different
            phone, and scanned exactly once. The QR code on a ticket carries no
            information — it is a lookup, and {site.name} answers it at the gate, every
            time, which is what stops the same ticket admitting two people.
          </p>

          <h2>Where we are</h2>
          <p>
            Kenya first, then East Africa. Payment is by M-Pesa, because that is how the
            market pays. Prices are in Kenyan shillings and every time on this site is the
            stadium&rsquo;s local time.
          </p>
        </Prose>
      </Section>
    </StadiiShell>
  );
}
