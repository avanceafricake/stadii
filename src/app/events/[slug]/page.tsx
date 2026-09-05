import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { EventStatusAxes, EventStatusDetail } from '@/components/event-status';
import { JsonLdScript } from '@/components/json-ld';
import { ParticipantList } from '@/components/participants';
import { Card, Container, Section, SectionHeading } from '@/components/primitives';
import { PurchaseCta } from '@/components/purchase-cta';
import { UnavailableState } from '@/components/states';
import { PriceFootnote, TicketCategoryList } from '@/components/ticket-categories';
import { VenuePanel } from '@/components/venue-panel';
import { loadEventPage } from '@/lib/data/event-page';
import {
  formatEventDate,
  formatEventTime,
  timezoneLabel,
  toIsoWithZoneOffset,
} from '@/lib/format/datetime';
import { participantSummaryLine } from '@/lib/format/participants';
import { routes, parseSlug } from '@/lib/routes';
import { sportsEventJsonLd } from '@/lib/seo/jsonld';
import { buildMetadata } from '@/lib/seo/metadata';

export const revalidate = 120;

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const slug = parseSlug((await params).slug);
  if (!slug) return buildMetadata({ title: 'Event', description: '', path: routes.events() });

  const { event, participants, venue } = await loadEventPage(slug);
  if (!event) {
    return buildMetadata({
      title: 'Event not found',
      description: 'This event is not published on STADII.',
      path: routes.events(),
      noindex: true,
    });
  }

  const when = `${formatEventDate(event.startsAt, event.timezone)}, ${formatEventTime(
    event.startsAt,
    event.timezone,
  )} ${timezoneLabel(event.timezone)}`;
  const where = venue?.name ?? event.venueSummary?.name ?? '';
  const who = participantSummaryLine(participants.map((p) => p.name));

  // Parenthesised deliberately: the fallback chain is "the organiser's own
  // description, else a composed line, else the bare title" — mixing ?? and ||
  // unparenthesised reads as a different chain than it runs as.
  const description =
    event.description ??
    ([who, when, where].filter(Boolean).join(' · ') || `${event.title} on STADII.`);

  return buildMetadata({
    title: event.title,
    description,
    path: routes.event(event.slug),
    type: 'article',
    image: participants.find((p) => p.crestUrl)?.crestUrl,
    imageAlt: event.title,
    publishedTime: event.publishedAt
      ? toIsoWithZoneOffset(event.publishedAt, event.timezone)
      : undefined,
  });
}

export default async function EventPage({ params }: Params) {
  const slug = parseSlug((await params).slug);
  if (!slug) notFound();

  const data = await loadEventPage(slug);
  const { event } = data;

  if (!event) {
    if (data.unavailable) {
      return (
        <Container>
          <Section>
            <UnavailableState what="this event" />
          </Section>
        </Container>
      );
    }
    notFound();
  }

  const path = routes.event(event.slug);
  const crumbs = [
    { name: 'Home', path: routes.home() },
    { name: 'Events', path: routes.events() },
    { name: event.title, path },
  ];

  return (
    <>
      <JsonLdScript
        id="ld-event"
        data={sportsEventJsonLd({
          event,
          participants: data.participants,
          ticketTypes: data.ticketTypes,
          venue: data.venue,
          path,
          sportName: data.sport?.name,
        })}
      />

      {/* Hero. The event's own stored title is the headline — an event title is
          never composed from its participants (see the Event model). */}
      <header className="border-b border-outline-subtle bg-surface">
        <Container className="py-xl">
          <Breadcrumbs crumbs={crumbs} />

          <p className="mt-md text-caption font-semibold uppercase tracking-widest text-brand-700">
            {data.sport ? (
              <Link href={routes.sport(data.sport.slug)} className="hover:underline">
                {data.sport.name}
              </Link>
            ) : null}
            {data.competition ? (
              <>
                <span className="mx-xs" aria-hidden="true">
                  ·
                </span>
                <Link
                  href={routes.competition(data.competition.slug)}
                  className="hover:underline"
                >
                  {data.competition.name}
                </Link>
              </>
            ) : null}
          </p>

          <h1 className="mt-sm text-headline font-bold tracking-tight text-ink">
            {event.title}
          </h1>
          {event.subtitle ? (
            <p className="mt-xs text-body-lg text-ink-muted">{event.subtitle}</p>
          ) : null}

          <div className="mt-md">
            <EventStatusAxes event={event} />
          </div>

          <dl className="mt-lg grid gap-md sm:grid-cols-3">
            <div>
              <dt className="text-caption font-semibold uppercase tracking-wide text-ink-subtle">
                Date
              </dt>
              <dd className="mt-xs text-body-lg text-ink">
                <time dateTime={toIsoWithZoneOffset(event.startsAt, event.timezone)}>
                  {formatEventDate(event.startsAt, event.timezone)}
                </time>
              </dd>
            </div>
            <div>
              <dt className="text-caption font-semibold uppercase tracking-wide text-ink-subtle">
                Start
              </dt>
              <dd className="mt-xs text-body-lg text-ink">
                {formatEventTime(event.startsAt, event.timezone)}{' '}
                <span className="text-ink-muted">{timezoneLabel(event.timezone)}</span>
                {event.doorsOpenAt ? (
                  <span className="mt-xs block text-body text-ink-muted">
                    Gates open {formatEventTime(event.doorsOpenAt, event.timezone)}
                  </span>
                ) : null}
              </dd>
            </div>
            <div>
              <dt className="text-caption font-semibold uppercase tracking-wide text-ink-subtle">
                Venue
              </dt>
              <dd className="mt-xs text-body-lg text-ink">
                {data.venue?.slug ? (
                  <Link href={routes.venue(data.venue.slug)} className="hover:underline">
                    {data.venue.name}
                  </Link>
                ) : (
                  (event.venueSummary?.name ?? 'To be confirmed')
                )}
                <span className="mt-xs block text-body text-ink-muted">
                  {data.venue?.address?.city ?? event.venueSummary?.city ?? ''}
                </span>
              </dd>
            </div>
          </dl>
        </Container>
      </header>

      <Container>
        <div className="grid gap-lg py-xl lg:grid-cols-[1fr_22rem]">
          <div className="space-y-xl">
            <Section className="py-0" labelledBy="event-participants">
              <SectionHeading id="event-participants">Who is taking part</SectionHeading>
              <ParticipantList participants={data.participants} />
            </Section>

            {event.description ? (
              <Section className="py-0" labelledBy="event-about">
                <SectionHeading id="event-about">About this event</SectionHeading>
                <p className="max-w-prose whitespace-pre-line text-body-lg text-ink-muted">
                  {event.description}
                </p>
              </Section>
            ) : null}

            <Section className="py-0" labelledBy="event-tickets">
              <SectionHeading id="event-tickets">Ticket categories</SectionHeading>
              <TicketCategoryList ticketTypes={data.ticketTypes} />
              <PriceFootnote />
            </Section>

            <Section className="py-0" labelledBy="event-status">
              <SectionHeading id="event-status">Status</SectionHeading>
              <EventStatusDetail event={event} />
              <p className="mt-sm max-w-prose text-caption text-ink-subtle">
                STADII tracks three things about an event separately: whether it is
                published, whether it is going ahead, and whether tickets are selling.
                They change independently — sales can be paused on a match that is very
                much still on.
              </p>
            </Section>
          </div>

          <aside className="space-y-md lg:sticky lg:top-24 lg:self-start">
            <PurchaseCta event={event} />
            {data.venue ? (
              <VenuePanel venue={data.venue} areas={data.venueAreas} />
            ) : (
              <Card>
                <h2 className="text-title font-semibold text-ink">
                  {event.venueSummary?.name ?? 'Venue'}
                </h2>
                <p className="mt-sm text-body text-ink-muted">
                  {event.venueSummary?.city ?? 'Venue details are not available yet.'}
                </p>
              </Card>
            )}
            <Card>
              <h2 className="text-body-lg font-semibold text-ink">Sending a ticket on</h2>
              <p className="mt-sm text-body text-ink-muted">
                Tickets transfer one at a time, by a claim link. The person receiving it
                signs in to claim it, and until they do, the ticket still admits whoever
                holds it now.
              </p>
              <Link
                href={routes.help()}
                className="mt-sm inline-block text-body font-medium text-brand-700 underline"
              >
                How transfers work
              </Link>
            </Card>
          </aside>
        </div>
      </Container>
    </>
  );
}
