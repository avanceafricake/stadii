import Link from 'next/link';

import { JsonLdScript } from './json-ld';
import { breadcrumbJsonLd, type Crumb } from '@/lib/seo/jsonld';

/**
 * The visible trail and its `BreadcrumbList` markup, from one list.
 *
 * Emitting the two from a single source is the point: markup that disagrees
 * with the page is a structured-data penalty, and it happens the moment they
 * are maintained separately.
 */
export function Breadcrumbs({ crumbs }: { crumbs: readonly Crumb[] }) {
  if (crumbs.length === 0) return null;
  const last = crumbs[crumbs.length - 1];

  return (
    <>
      <nav aria-label="Breadcrumb" className="text-caption text-ink-muted">
        <ol className="flex flex-wrap items-center gap-xs">
          {crumbs.map((crumb, index) => {
            const isLast = crumb === last;
            return (
              <li key={crumb.path} className="flex items-center gap-xs">
                {index > 0 ? (
                  <span aria-hidden="true" className="text-outline-strong">
                    /
                  </span>
                ) : null}
                {isLast ? (
                  <span aria-current="page" className="font-medium text-ink">
                    {crumb.name}
                  </span>
                ) : (
                  <Link href={crumb.path} className="hover:text-brand-700 hover:underline">
                    {crumb.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <JsonLdScript data={breadcrumbJsonLd(crumbs)} />
    </>
  );
}
