import type { MetadataRoute } from 'next';

import {
  listCompetitions,
  listParticipants,
  listSports,
  listUpcomingEvents,
  listVenues,
} from '@/lib/firestore/queries';
import { routes } from '@/lib/routes';
import { absoluteUrl } from '@/lib/site';

/**
 * The sitemap.
 *
 * Only URLs a crawler should actually spend budget on. Two categories are
 * deliberately absent:
 *
 *   - `/claim/[token]` — a per-recipient bearer link. Listing one would publish
 *     a transfer offer to the whole internet.
 *   - `/search` — an unbounded query surface with nothing canonical behind it.
 *
 * Every entry comes from the same public queries the pages use, so the sitemap
 * cannot advertise an event the rules would refuse to serve.
 */

/** Sitemaps are cheap to regenerate and expensive to have stale on matchday. */
export const revalidate = 3600;

function lastModified(value: unknown): Date {
  if (value instanceof Date) return value;
  if (typeof value === 'number' && Number.isFinite(value)) return new Date(value);
  return new Date();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [events, sports, participants, competitions, venues] = await Promise.all([
    listUpcomingEvents({ limit: 500 }),
    listSports(),
    listParticipants({ limit: 500 }),
    listCompetitions(),
    listVenues(),
  ]);

  const staticPages: MetadataRoute.Sitemap = ([
    { url: absoluteUrl(routes.home()), changeFrequency: 'daily', priority: 1 },
    { url: absoluteUrl(routes.events()), changeFrequency: 'hourly', priority: 0.9 },
    { url: absoluteUrl(routes.sports()), changeFrequency: 'weekly', priority: 0.7 },
    { url: absoluteUrl(routes.teams()), changeFrequency: 'weekly', priority: 0.7 },
    { url: absoluteUrl(routes.competitions()), changeFrequency: 'weekly', priority: 0.7 },
    { url: absoluteUrl(routes.venues()), changeFrequency: 'monthly', priority: 0.6 },
    { url: absoluteUrl(routes.howItWorks()), changeFrequency: 'monthly', priority: 0.5 },
    { url: absoluteUrl(routes.about()), changeFrequency: 'monthly', priority: 0.4 },
    { url: absoluteUrl(routes.help()), changeFrequency: 'monthly', priority: 0.5 },
    { url: absoluteUrl(routes.contact()), changeFrequency: 'yearly', priority: 0.3 },
    { url: absoluteUrl(routes.terms()), changeFrequency: 'yearly', priority: 0.2 },
    { url: absoluteUrl(routes.privacy()), changeFrequency: 'yearly', priority: 0.2 },
  ] as const).map((entry) => ({ ...entry, lastModified: new Date() }));

  // An event page is the one that earns links and shares, so it ranks highest
  // of the dynamic entries and is crawled most often — its sale status can
  // change hour to hour.
  const eventPages: MetadataRoute.Sitemap = events.data.map((event) => ({
    url: absoluteUrl(routes.event(event.slug)),
    lastModified: lastModified(event.updatedAt),
    changeFrequency: 'hourly',
    priority: 0.9,
  }));

  const sportPages: MetadataRoute.Sitemap = sports.data.map((sport) => ({
    url: absoluteUrl(routes.sport(sport.slug)),
    lastModified: lastModified(sport.updatedAt),
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  const teamPages: MetadataRoute.Sitemap = participants.data.map((participant) => ({
    url: absoluteUrl(routes.team(participant.slug)),
    lastModified: lastModified(participant.updatedAt),
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  const competitionPages: MetadataRoute.Sitemap = competitions.data.map((competition) => ({
    url: absoluteUrl(routes.competition(competition.slug)),
    lastModified: lastModified(competition.updatedAt),
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  const venuePages: MetadataRoute.Sitemap = venues.data.map((venue) => ({
    url: absoluteUrl(routes.venue(venue.slug)),
    lastModified: lastModified(venue.updatedAt),
    changeFrequency: 'monthly',
    priority: 0.5,
  }));

  return [
    ...staticPages,
    ...eventPages,
    ...sportPages,
    ...teamPages,
    ...competitionPages,
    ...venuePages,
  ];
}
