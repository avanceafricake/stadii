import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { EventStatusDetail } from '@/components/event-status';
import { JsonLdScript } from '@/components/json-ld';
import { ParticipantList } from '@/components/participants';
import { EventHero } from '@/components/cards';
import { Section, SectionHeading } from '@/components/primitives';
import { StadiiShell } from '@/components/shell';
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
import { noteworthyAxes } from '@/lib/format/status';
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
        <StadiiShell active={routes.events()}>
          <UnavailableState what="this event" />
        </StadiiShell>
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

  const sides = (event.participantSummaries ?? []).map((summary) => ({
    name: summary.displayName,
    crestUrl: summary.crestUrl,
  }));

  return (
    <StadiiShell
      active={routes.events()}
      aside={
        <>
          <PurchaseCta event={event} />
          {data.venue ? <VenuePanel venue={data.venue} areas={data.venueAreas} /> : null}
        </>
      }
    >
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

      {/* One hero, the same one the card and the home page use. A fixture leads
          with its two sides; anything else leads with its artwork or its title.
          This page used to draw its own headline block, which meant the fixture
          you clicked on the home page arrived here as a paragraph. */}
      <div className="mb-md">
        <Breadcrumbs crumbs={crumbs} />
      </div>

      <EventHero
        event={{
          title: event.title,
          subtitle: event.subtitle,
          category: data.sport?.name,
          competition: data.competition?.name,
          sides: sides.length === 2 ? sides : undefined,
          imageUrl: event.heroImageUrl,
          dateLabel: formatEventDate(event.startsAt, event.timezone),
          timeLabel: formatEventTime(event.startsAt, event.timezone),
          timezoneLabel: timezoneLabel(event.timezone),
          gatesLabel: event.doorsOpenAt
            ? `Gates open ${formatEventTime(event.doorsOpenAt, event.timezone)}`
            : undefined,
          venueName: data.venue?.name ?? event.venueSummary?.name ?? 'To be confirmed',
          venueCity: data.venue?.address?.city ?? event.venueSummary?.city,
          venueHref: data.venue?.slug ? routes.venue(data.venue.slug) : undefined,
          notices: noteworthyAxes(event),
        }}
      />

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
    </StadiiShell>
  );
}
