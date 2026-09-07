import type { Metadata, Viewport } from 'next';

import './globals.css';
import { JsonLdScript } from '@/components/json-ld';
import { StadiiFooter, StadiiHeader, StadiiMobileNav } from '@/components/shell';
import { organizationJsonLd, webSiteJsonLd } from '@/lib/seo/jsonld';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  // Every relative URL in every `generateMetadata` resolves against this, so
  // the canonical origin is configured once and cannot drift per page.
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s`,
  },
  description: site.description,
  applicationName: site.name,
  referrer: 'strict-origin-when-cross-origin',
  formatDetection: { telephone: false },
  openGraph: {
    type: 'website',
    siteName: site.name,
    locale: site.locale,
    url: site.url,
  },
  twitter: { card: 'summary_large_image' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-KE">
      <body className="flex min-h-screen flex-col bg-surface-sunken">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <StadiiHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <StadiiMobileNav />
        <StadiiFooter />
        {/* Site-level structured data, emitted once. Page-level SportsEvent and
            BreadcrumbList markup is emitted by the pages themselves. */}
        <JsonLdScript id="ld-site" data={[organizationJsonLd(), webSiteJsonLd()]} />
      </body>
    </html>
  );
}
