'use client';

/**
 * The account corner of the header.
 *
 * A client island inside a server-rendered header, which is the point: the
 * header stays static and cheap, and only this corner knows about a session.
 *
 * It renders three things, and the third is why this is not two lines of JSX:
 *
 *   loading   a placeholder of the same size as the button
 *   signedOut Sign in
 *   signedIn  the name, and a menu with sign out
 *
 * The placeholder matters. Rendering "Sign in" while Firebase is still
 * restoring the session makes the header flicker on every reload for anybody
 * who is signed in, and a flicker in the top-right corner of every page is the
 * kind of thing that reads as a broken site.
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { greetingName, useAuth } from './auth-provider';
import { Icon } from './icons';
import { signOutOfStadii } from '@/lib/auth/client';
import { routes } from '@/lib/routes';

export function AccountMenu() {
  const { status, user } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (status === 'loading') {
    return (
      <div
        aria-hidden="true"
        className="h-10 w-10 animate-pulse rounded-pill bg-surface-sunken sm:w-28"
      />
    );
  }

  if (status === 'signedOut' || user === null) {
    // Come back to where they were. `then` is validated as a same-site path on
    // the way out of the form, not trusted from the URL.
    const then = pathname === routes.signIn() ? '/' : pathname;
    return (
      <Link
        href={`${routes.signIn()}?then=${encodeURIComponent(then)}`}
        className="inline-flex h-10 items-center gap-xs rounded-pill bg-brand pl-xs pr-md text-body font-semibold text-ink-inverse transition-colors hover:bg-brand-800"
      >
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
          <Icon name="user" className="h-4 w-4" />
        </span>
        <span className="hidden sm:inline">Sign in</span>
      </Link>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((was) => !was)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="inline-flex h-10 max-w-[11rem] items-center gap-xs rounded-pill border border-outline pl-xs pr-sm text-body font-medium text-ink transition-colors hover:bg-surface-sunken"
      >
        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-ink-inverse">
          <Icon name="user" className="h-4 w-4" />
        </span>
        <span className="hidden truncate sm:inline">Hi, {greetingName(user)}</span>
      </button>

      {open ? (
        <>
          {/* A full-screen catcher so a click anywhere closes the menu. Cheaper
              and more reliable than a document listener that has to be torn
              down, and it works on touch. */}
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />
          <div
            role="menu"
            className="absolute right-0 z-50 mt-xs w-56 overflow-hidden rounded-lg border border-outline-subtle bg-surface p-xs shadow-md"
          >
            <p className="truncate px-sm py-xs text-caption text-ink-subtle">
              {user.email ?? 'Signed in'}
            </p>
            <Link
              href={routes.help()}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block rounded-md px-sm py-sm text-body text-ink hover:bg-surface-sunken"
            >
              Help centre
            </Link>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                void signOutOfStadii();
              }}
              className="block w-full rounded-md px-sm py-sm text-left text-body font-medium text-status-error hover:bg-status-error/10"
            >
              Sign out
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}

/**
 * The notification bell — only for somebody with an account to have
 * notifications on.
 *
 * Kept beside the account menu rather than in the server header, because
 * whether it renders at all is a question only the client can answer.
 */
export function NotificationsButton() {
  const { status } = useAuth();
  if (status !== 'signedIn') return null;

  return (
    <Link
      href={routes.help()}
      aria-label="Notifications"
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-md text-ink hover:bg-surface-sunken"
    >
      <Icon name="bell" />
    </Link>
  );
}
