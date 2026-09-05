/**
 * Empty, error and loading states.
 *
 * Three distinct states, three distinct components, because they mean three
 * different things and collapsing them tells the visitor nothing:
 *
 *   empty       we asked, and there is nothing to show
 *   unavailable we could not ask
 *   loading     we are asking
 *
 * "No events found" on a page that actually failed to reach Firestore is a lie
 * that sends someone away for good.
 */
import type { ReactNode } from 'react';

import { Card } from './primitives';

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <Card className="border-dashed text-center">
      <p className="text-body-lg font-semibold text-ink">{title}</p>
      <p className="mx-auto mt-xs max-w-prose text-body text-ink-muted">{body}</p>
      {action ? <div className="mt-md">{action}</div> : null}
    </Card>
  );
}

export function UnavailableState({
  what = 'this information',
  action,
}: {
  what?: string;
  action?: ReactNode;
}) {
  return (
    <Card className="border-outline-strong">
      <div role="status" className="text-center">
        <p className="text-body-lg font-semibold text-ink">
          We could not load {what} just now
        </p>
        <p className="mx-auto mt-xs max-w-prose text-body text-ink-muted">
          This is a problem on our side, not with your connection. Try again in a
          moment — everything you have bought is safe in the STADII app.
        </p>
        {action ? <div className="mt-md">{action}</div> : null}
      </div>
    </Card>
  );
}

/** Skeletons match the shape of what is loading, not a generic spinner. */
export function CardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div
      className="grid gap-md sm:grid-cols-2 lg:grid-cols-3"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading</span>
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="h-40 animate-pulse rounded-lg border border-outline-subtle bg-neutral-100"
        />
      ))}
    </div>
  );
}

export function LineSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-sm bg-neutral-100 ${className ?? 'h-4 w-48'}`}
      aria-hidden="true"
    />
  );
}
