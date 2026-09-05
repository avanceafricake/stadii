import type { Metadata } from 'next';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { Container, PageHeader, Prose, Section } from '@/components/primitives';
import { routes } from '@/lib/routes';
import { buildMetadata } from '@/lib/seo/metadata';
import { site } from '@/lib/site';

export const metadata: Metadata = buildMetadata({
  title: 'Contact STADII',
  description: 'How to reach STADII about a ticket, an order, or an event you organise.',
  path: routes.contact(),
});

export default function ContactPage() {
  return (
    <Container>
      <Breadcrumbs crumbs={[{ name: 'Contact', path: routes.contact() }]} />
      <PageHeader
        title="Contact us"
        lede="Have your order number or ticket number ready — it is the fastest way for us to find what you are asking about."
      />

      <Section>
        <Prose>
          <h2>About a ticket you bought</h2>
          <p>
            Email <a href={`mailto:${site.support.email}`}>{site.support.email}</a>. Include
            your order number (it looks like <code>STD-ORD-0001</code>) or the ticket number
            printed on the ticket. Both are in the STADII app under Tickets and Orders.
          </p>
          {site.support.phone ? (
            <p>
              On matchday you can also call{' '}
              <a href={`tel:${site.support.phone.replace(/\s+/g, '')}`}>
                {site.support.phone}
              </a>
              .
            </p>
          ) : null}

          <h2>If you are at the stadium right now</h2>
          <p>
            Go to the help desk at the gate rather than emailing. A supervisor can look your
            ticket up on the spot and tell you exactly what STADII says about it — which is
            something no email can do quickly enough to get you in before kick-off.
          </p>

          <h2>Organising an event</h2>
          <p>
            If you run a club, a competition or a venue and want to sell through STADII,
            write to <a href={`mailto:${site.support.email}`}>{site.support.email}</a> with
            the sport, the venue and roughly how many people you expect.
          </p>
        </Prose>
      </Section>
    </Container>
  );
}
