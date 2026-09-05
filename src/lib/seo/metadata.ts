/**
 * Page metadata.
 *
 * One builder, used by every `generateMetadata`, so that a page cannot ship
 * with an OpenGraph card and no canonical, or a canonical pointing at the
 * wrong origin. `metadataBase` is set once in the root layout and every
 * relative URL below resolves against it.
 */
import type { Metadata } from 'next';

import { absoluteUrl, site } from '@/lib/site';

export interface PageMetadataInput {
  readonly title: string;
  readonly description: string;
  /** Site-relative, e.g. `/events/gor-mahia-v-afc-leopards`. */
  readonly path: string;
  /** Absolute image URL. Falls back to the site card. */
  readonly image?: string | undefined;
  readonly imageAlt?: string | undefined;
  /** `article` for an event page, `website` elsewhere. */
  readonly type?: 'website' | 'article';
  /** Set for pages that must never be indexed — `/claim/[token]`. */
  readonly noindex?: boolean;
  readonly publishedTime?: string | undefined;
}

/** The title as it appears in a tab and in a search result. */
export function pageTitle(title: string): string {
  return title === site.name ? site.name : `${title} | ${site.name}`;
}

export function truncateDescription(text: string, max = 160): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

export function buildMetadata(input: PageMetadataInput): Metadata {
  const url = absoluteUrl(input.path);
  const description = truncateDescription(input.description);
  const images = input.image
    ? [{ url: input.image, alt: input.imageAlt ?? input.title }]
    : undefined;

  return {
    title: pageTitle(input.title),
    description,
    alternates: { canonical: url },
    robots: input.noindex
      ? { index: false, follow: false, nocache: true }
      : { index: true, follow: true },
    openGraph: {
      type: input.type ?? 'website',
      siteName: site.name,
      title: input.title,
      description,
      url,
      locale: site.locale,
      ...(images ? { images } : {}),
      ...(input.publishedTime ? { publishedTime: input.publishedTime } : {}),
    },
    twitter: {
      card: images ? 'summary_large_image' : 'summary',
      title: input.title,
      description,
      ...(images ? { images: images.map((i) => i.url) } : {}),
    },
  };
}
