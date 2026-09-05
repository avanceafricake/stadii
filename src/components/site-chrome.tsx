import Image from 'next/image';
import Link from 'next/link';

import { Container } from './primitives';
import { routes } from '@/lib/routes';
import { site } from '@/lib/site';

const PRIMARY_NAV = [
  { href: routes.events(), label: 'Events' },
  { href: routes.sports(), label: 'Sports' },
  { href: routes.teams(), label: 'Teams & athletes' },
  { href: routes.venues(), label: 'Venues' },
  { href: routes.competitions(), label: 'Competitions' },
] as const;

const FOOTER_NAV = [
  {
    heading: 'Discover',
    links: PRIMARY_NAV,
  },
  {
    heading: 'STADII',
    links: [
      { href: routes.howItWorks(), label: 'How it works' },
      { href: routes.about(), label: 'About' },
      { href: routes.contact(), label: 'Contact' },
    ],
  },
  {
    heading: 'Support',
    links: [
      { href: routes.help(), label: 'Help' },
      { href: routes.terms(), label: 'Terms' },
      { href: routes.privacy(), label: 'Privacy' },
    ],
  },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-outline-subtle bg-surface/95 backdrop-blur">
      <Container>
        <div className="flex flex-wrap items-center justify-between gap-sm py-sm">
          <Link href={routes.home()} className="flex items-center" aria-label={site.name}>
            {/*
              `priority` because this is above the fold on every page and is the
              one image a visitor sees before anything else has loaded. The
              intrinsic size is the file's; `h-9 w-auto` is what actually
              renders, so the browser can reserve the row before it arrives.
            */}
            <Image
              src="/brand/logo-landscape.png"
              alt={site.name}
              width={900}
              height={226}
              priority
              // h-9 renders the lockup's "SCAN • BOOK • ENJOY" line at about
              // four pixels, which is noise rather than type. h-12 is the
              // smallest size at which the whole lockup still reads.
              className="h-10 w-auto sm:h-12"
            />
          </Link>

          <nav aria-label="Primary" className="order-3 w-full sm:order-2 sm:w-auto">
            <ul className="-mx-xs flex list-none flex-wrap items-center gap-xs overflow-x-auto p-0 pb-xs sm:mx-0 sm:pb-0">
              {PRIMARY_NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block rounded-md px-sm py-xs text-body font-medium text-ink-muted hover:bg-surface-sunken hover:text-ink"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="order-2 sm:order-3">
            <Link
              href={routes.search()}
              className="inline-flex items-center rounded-md border border-outline px-md py-xs text-body font-medium text-ink hover:bg-surface-sunken"
            >
              Search
            </Link>
          </div>
        </div>
      </Container>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-xxl border-t border-outline-subtle bg-surface">
      <Container>
        <div className="grid gap-lg py-xl sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Image
              src="/brand/logo-landscape.png"
              alt={site.name}
              width={900}
              height={226}
              className="h-8 w-auto"
            />
            <p className="mt-sm max-w-prose text-body text-ink-muted">{site.tagline}</p>
            <p className="mt-sm text-caption text-ink-subtle">
              All times are shown in {site.timezone.replace('_', ' ')} (EAT).
            </p>
          </div>

          {FOOTER_NAV.map((group) => (
            <nav key={group.heading} aria-labelledby={`footer-${group.heading}`}>
              <h2
                id={`footer-${group.heading}`}
                className="text-caption font-semibold uppercase tracking-wide text-ink-subtle"
              >
                {group.heading}
              </h2>
              <ul className="mt-sm list-none space-y-xs p-0">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-body text-ink-muted hover:text-brand-700 hover:underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="border-t border-outline-subtle py-md">
          <p className="text-caption text-ink-subtle">
            © {new Date().getFullYear()} {site.legalName}. Ticket availability, prices and
            admission are confirmed by STADII at the point of sale and at the gate.
          </p>
        </div>
      </Container>
    </footer>
  );
}
