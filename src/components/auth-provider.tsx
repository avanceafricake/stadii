'use client';

/**
 * Who is signed in, for the parts of the site that need to know.
 *
 * Three states, and the third is the one that matters: `loading` is not
 * `signedOut`. On a reload Firebase takes a moment to restore the session, and
 * a header that renders "Sign in" during that moment flickers to "Hi, Alex" a
 * heartbeat later — or worse, a guarded page bounces somebody who is in fact
 * signed in. Callers must handle all three.
 *
 * This holds no capabilities. It knows an identity; what that identity may DO
 * is decided by the backend on every call (ADR-0018).
 */

import { onAuthStateChanged } from 'firebase/auth';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { auth, type AuthUser } from '@/lib/auth/client';

export interface AuthState {
  readonly status: 'loading' | 'signedIn' | 'signedOut';
  readonly user: AuthUser | null;
  /** False when this deployment has no Firebase configuration at all. */
  readonly available: boolean;
}

const AuthContext = createContext<AuthState>({
  status: 'loading',
  user: null,
  available: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    status: 'loading',
    user: null,
    available: true,
  });

  useEffect(() => {
    const instance = auth();
    if (instance === null) {
      // No configuration, or we are not in a browser. Either way there will
      // never be a user, so stop waiting rather than showing a spinner for
      // ever.
      setState({ status: 'signedOut', user: null, available: false });
      return;
    }

    return onAuthStateChanged(
      instance,
      (user) => {
        setState({
          status: user === null ? 'signedOut' : 'signedIn',
          user,
          available: true,
        });
      },
      () => {
        // A listener error is not a signed-in state. Treating it as one would
        // show account UI to somebody with no session behind it.
        setState({ status: 'signedOut', user: null, available: true });
      },
    );
  }, []);

  const value = useMemo(() => state, [state]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  return useContext(AuthContext);
}

/**
 * What to call somebody.
 *
 * A display name if they gave one, otherwise the part of the email before the
 * @ — never the whole address. "Hi, alex@example.com" in a header is both ugly
 * and a small privacy leak on a shared screen.
 */
export function greetingName(user: AuthUser | null): string {
  if (user === null) return '';
  const name = user.displayName?.trim();
  if (name !== undefined && name.length > 0) return name.split(/\s+/)[0]!;
  const email = user.email ?? '';
  const local = email.split('@')[0] ?? '';
  return local.length > 0 ? local : 'there';
}
