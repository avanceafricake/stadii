import Link from 'next/link';

import { JsonLdScript } from './json-ld';
import { cx } from './primitives';
import { breadcrumbJsonLd, type Crumb } from '@/lib/seo/jsonld';

/**
 * The visible trail and its `BreadcrumbList` markup, from one list.
 *
 * Emitting the two from a single source is the point: markup that disagrees
 * with the page is a structured-data penalty, and it happens the moment they
 * are maintained separately.
 */
export function Breadcrumbs({
  crumbs,
  onDark = false,
}: {
  crumbs: readonly Crumb[];
  /**
   * The trail sits on the page hero, which is deep teal. Ink-coloured links on
   * that ground are a contrast failure rather than a subtle one, so the palette
   * flips rather than the component being copied.
   */
  onDark?: boolean;
}) {
  if (crumbs.length === 0) return null;
  const last = crumbs[crumbs.length - 1];

  return (
    <>
      <nav
        aria-label="Breadcrumb"
        className={cx('text-caption', onDark ? 'text-white/60' : 'text-ink-muted')}
      >
        <ol className="flex flex-wrap items-center gap-xs">
          {crumbs.map((crumb, index) => {
            const isLast = crumb === last;
            return (
              <li key={crumb.path} className="flex items-center gap-xs">
                {index > 0 ? (
                  <span
                    aria-hidden="true"
                    className={onDark ? 'text-white/35' : 'text-outline-strong'}
                  >
                    /
                  </span>
                ) : null}
                {isLast ? (
                  <span
                    aria-current="page"
                    className={cx('font-medium', onDark ? 'text-white' : 'text-ink')}
                  >
                    {crumb.name}
                  </span>
                ) : (
                  <Link
                    href={crumb.path}
                    className={
                      onDark
                        ? 'hover:text-action-300 hover:underline'
                        : 'hover:text-brand-700 hover:underline'
                    }
                  >
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
