'use client';

/**
 * Sign in, or create an account, with email or Google.
 *
 * One component for both because they are the same three fields and the same
 * two buttons, and a separate /register page would be a second form to keep in
 * step. The mode is a toggle, and it is reflected in the URL so a link can
 * point straight at either.
 *
 * PASSWORDS ARE NEVER HANDLED BY STADII CODE. `firebase/auth` posts them
 * directly to Google's identity endpoint over TLS; nothing here stores one,
 * logs one, or sends one to a STADII server. That is the whole reason to use
 * the provider rather than build this.
 */

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, type FormEvent } from 'react';

import { Icon } from './icons';
import { cx } from './primitives';
import {
  authErrorMessage,
  registerWithEmail,
  sendReset,
  signInWithEmail,
  signInWithGoogle,
} from '@/lib/auth/client';
import { useAuth } from './auth-provider';

type Mode = 'signIn' | 'register';

/** Only same-site paths, so `?then=` cannot be turned into an open redirect. */
function safeReturnPath(raw: string | null): string {
  if (raw === null || !raw.startsWith('/') || raw.startsWith('//')) return '/';
  return raw;
}

export function SignInForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { available } = useAuth();

  const [mode, setMode] = useState<Mode>(
    params.get('mode') === 'register' ? 'register' : 'signIn',
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState<'email' | 'google' | 'reset' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const then = safeReturnPath(params.get('then'));

  if (!available) {
    return (
      <div className="rounded-lg border border-status-warning/40 bg-status-warning/10 p-md">
        <p className="text-body text-ink">
          Signing in is not available on this deployment — it has no Firebase
          configuration. The catalogue still works.
        </p>
      </div>
    );
  }

  async function run(kind: 'email' | 'google', action: () => Promise<void>) {
    setBusy(kind);
    setError(null);
    setNotice(null);
    try {
      await action();
      router.replace(then);
    } catch (caught) {
      setError(authErrorMessage(caught));
    } finally {
      setBusy(null);
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void run('email', () =>
      mode === 'signIn'
        ? signInWithEmail({ email, password })
        : registerWithEmail({ email, password }, name),
    );
  }

  async function onReset() {
    if (email.trim().length === 0) {
      setError('Enter your email address first, then ask for a reset link.');
      return;
    }
    setBusy('reset');
    setError(null);
    try {
      await sendReset(email);
      // Deliberately does not say whether an account exists. Confirming that
      // would make this a way to test which addresses are registered.
      setNotice('If that email has an account, a reset link is on its way.');
    } catch (caught) {
      setError(authErrorMessage(caught));
    } finally {
      setBusy(null);
    }
  }

  const isRegister = mode === 'register';

  return (
    <div className="max-w-md">
      {/* A real segmented control, not two links. Switching mode must not lose
          what has already been typed into the email field. */}
      <div
        role="tablist"
        aria-label="Sign in or create an account"
        className="mb-lg grid grid-cols-2 gap-xs rounded-xl bg-surface-sunken p-xs"
      >
        {(
          [
            ['signIn', 'Sign in'],
            ['register', 'Create account'],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={mode === value}
            onClick={() => {
              setMode(value);
              setError(null);
              setNotice(null);
            }}
            className={cx(
              'h-10 rounded-lg text-body font-semibold transition-colors',
              mode === value
                ? 'bg-surface text-ink shadow-sm'
                : 'text-ink-muted hover:text-ink',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => void run('google', signInWithGoogle)}
        disabled={busy !== null}
        className="flex h-12 w-full items-center justify-center gap-sm rounded-xl border border-outline bg-surface text-body-lg font-semibold text-ink transition-colors hover:bg-surface-sunken disabled:opacity-60"
      >
        <GoogleMark />
        {busy === 'google' ? 'Opening Google…' : 'Continue with Google'}
      </button>

      <div className="my-lg flex items-center gap-sm text-caption uppercase tracking-wider text-ink-subtle">
        <span className="h-px flex-1 bg-outline" />
        or
        <span className="h-px flex-1 bg-outline" />
      </div>

      <form onSubmit={onSubmit} className="space-y-md">
        {isRegister ? (
          <Field
            id="name"
            label="Your name"
            hint="Optional. It is what a ticket sent to you will be addressed to."
          >
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={INPUT}
            />
          </Field>
        ) : null}

        <Field id="email" label="Email">
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={INPUT}
          />
        </Field>

        <Field
          id="password"
          label="Password"
          hint={isRegister ? 'At least six characters.' : undefined}
        >
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={isRegister ? 6 : undefined}
            // `new-password` on registration tells a password manager to offer
            // to generate one; `current-password` on sign-in tells it to fill.
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={INPUT}
          />
        </Field>

        {error !== null ? (
          <p role="alert" className="text-body font-medium text-status-error">
            {error}
          </p>
        ) : null}
        {notice !== null ? (
          <p role="status" className="text-body text-ink-muted">
            {notice}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={busy !== null}
          className="flex h-12 w-full items-center justify-center gap-xs rounded-xl bg-action text-body-lg font-bold text-on-action transition-colors hover:bg-action-600 disabled:opacity-60"
        >
          {busy === 'email'
            ? 'Working…'
            : isRegister
              ? 'Create account'
              : 'Sign in'}
          <Icon name="arrow" className="h-4 w-4" />
        </button>
      </form>

      {!isRegister ? (
        <button
          type="button"
          onClick={() => void onReset()}
          disabled={busy !== null}
          className="mt-md text-body font-medium text-info-700 underline-offset-4 hover:underline disabled:opacity-60"
        >
          {busy === 'reset' ? 'Sending…' : 'Forgotten your password?'}
        </button>
      ) : (
        <p className="mt-md text-caption text-ink-subtle">
          Creating an account means you accept the terms of use and the privacy policy.
        </p>
      )}
    </div>
  );
}

const INPUT =
  'h-12 w-full rounded-xl border border-outline bg-surface px-md text-body-lg text-ink outline-none placeholder:text-ink-subtle focus:border-action focus:ring-2 focus:ring-action/20';

function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-body font-semibold text-ink">
        {label}
      </label>
      {hint !== undefined ? (
        <p className="mt-[2px] text-caption text-ink-subtle">{hint}</p>
      ) : null}
      <div className="mt-xs">{children}</div>
    </div>
  );
}

/**
 * Google's mark, drawn rather than fetched — it must not be a network request
 * on the critical path of a sign-in form.
 *
 * These four hex values are the ONLY colour literals in this codebase, and the
 * no-colour-literals rule is disabled for exactly these lines. They are
 * Google's brand colours, mandated by their sign-in branding guidelines; they
 * cannot come from STADII's design tokens, and substituting our own palette
 * would both break the guidelines and make the button less recognisable as the
 * thing it is.
 */
/* eslint-disable no-restricted-syntax -- Google brand colours, see above. */
function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.4a5.5 5.5 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.6-5.2 3.6-8.8z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2a7 7 0 0 1-6.6-4.8H1.4v3.1A11.9 11.9 0 0 0 12 24z"
      />
      <path fill="#FBBC05" d="M5.4 14.5a7.1 7.1 0 0 1 0-4.5V6.9H1.4a11.9 11.9 0 0 0 0 10.7z" />
      <path
        fill="#EA4335"
        d="M12 4.8c1.8 0 3.4.6 4.6 1.8l3.4-3.4A11.5 11.5 0 0 0 12 0 11.9 11.9 0 0 0 1.4 6.9l4 3.1A7 7 0 0 1 12 4.8z"
      />
    </svg>
  );
}
/* eslint-enable no-restricted-syntax */
