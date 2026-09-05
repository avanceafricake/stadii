import type { ReactNode } from 'react';

import { EmptyState, UnavailableState } from './states';
import type { Loaded } from '@/lib/firestore/queries';

/**
 * The three-state renderer for a collection read.
 *
 * Making "we could not ask" a required, distinct branch is deliberate: a page
 * that falls through to "nothing found" when Firestore was unreachable tells a
 * visitor the fixture list is empty, and they leave. The customer app takes the
 * same line — `AsyncValueUi.render` forces all four states at the call site
 * (docs/architecture/05-customer-app.md §State).
 */
export function LoadedList<T>({
  result,
  what,
  emptyTitle,
  emptyBody,
  emptyAction,
  children,
}: {
  result: Loaded<readonly T[]>;
  /** Named in the failure copy: "we could not load upcoming events". */
  what: string;
  emptyTitle: string;
  emptyBody: string;
  emptyAction?: ReactNode;
  children: (items: readonly T[]) => ReactNode;
}) {
  if (result.unavailable) return <UnavailableState what={what} />;
  if (result.data.length === 0) {
    return <EmptyState title={emptyTitle} body={emptyBody} action={emptyAction} />;
  }
  return <>{children(result.data)}</>;
}
