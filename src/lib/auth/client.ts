/**
 * Firebase Auth in the browser. Separate from `lib/firestore/client.ts` on
 * purpose.
 *
 * That module uses `firebase/firestore/lite` because it renders on the server:
 * one-shot REST reads, no listener machinery, no cache. Auth is the opposite
 * shape — it lives only in the browser, it holds a session, and it needs the
 * full SDK. Mixing them would drag the heavy build into every server render.
 *
 * WHAT THIS DOES NOT DO: it does not authorize anything. A signed-in browser
 * gets an ID token; every capability behind that token is decided server-side
 * by the command pipeline, in the scope the payload names (ADR-0018,
 * docs/security/authorization-model.md). Holding a session here buys the right
 * to ASK, not the right to do.
 *
 * The Firebase Web API key in `NEXT_PUBLIC_FIREBASE_API_KEY` is not a secret —
 * it identifies the project to Google's endpoints and is designed to ship in a
 * browser bundle. What protects data is Firestore rules and the callables'
 * permission checks, both of which assume the key is public.
 */

import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import {
  GoogleAuthProvider,
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  getAuth,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type Auth,
  type User,
} from 'firebase/auth';

import { readConfig } from '@/lib/firestore/client';

/**
 * A DIFFERENT app instance from the server one.
 *
 * `lib/firestore/client.ts` registers `stadii-web` for lite Firestore. Calling
 * `getAuth` on that instance works but ties the browser session to a handle
 * created for server rendering, and the two have different lifetimes. One name
 * each keeps them independent.
 */
const APP_NAME = 'stadii-web-auth';

let cachedAuth: Auth | null = null;

function app(): FirebaseApp | null {
  const config = readConfig();
  if (config === null) return null;

  const existing = getApps().find((a) => a.name === APP_NAME);
  if (existing) return existing;

  return initializeApp(
    {
      apiKey: config.apiKey,
      authDomain: config.authDomain,
      projectId: config.projectId,
      storageBucket: config.storageBucket,
      messagingSenderId: config.messagingSenderId,
      appId: config.appId,
    },
    APP_NAME,
  );
}

/**
 * The auth handle, or null.
 *
 * Null in two legitimate cases: rendering on the server, and a deployment with
 * no Firebase configuration. Both must leave the site working — every caller
 * treats null as "signing in is unavailable here" rather than throwing, the
 * same way a missing Firestore config renders an unavailable state instead of a
 * stack trace.
 */
export function auth(): Auth | null {
  if (typeof window === 'undefined') return null;
  if (cachedAuth !== null) return cachedAuth;

  const instance = app();
  if (instance === null) return null;

  cachedAuth = getAuth(instance);

  // Survive a reload and a new tab. The alternative — a session that ends when
  // the tab does — would lose somebody's sign-in between choosing a ticket and
  // paying for it, which is the worst possible moment.
  void setPersistence(cachedAuth, browserLocalPersistence);

  return cachedAuth;
}

export type AuthUser = User;

/**
 * Every failure a sign-in form can produce, in words a customer can act on.
 *
 * Firebase's own messages are written for developers ("Firebase: Error
 * (auth/invalid-credential)."), and showing one to somebody trying to buy a
 * ticket tells them nothing about what to do next.
 *
 * `invalid-credential` deliberately does NOT say which half was wrong. Saying
 * "no account with that email" turns the form into a way to discover which
 * addresses are registered.
 */
export function authErrorMessage(error: unknown): string {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code: unknown }).code)
      : '';

  switch (code) {
    case 'auth/invalid-email':
      return 'That does not look like an email address.';
    case 'auth/missing-password':
      return 'Enter your password.';
    case 'auth/weak-password':
      return 'Passwords need at least six characters.';
    case 'auth/email-already-in-use':
      return 'There is already an account with that email. Try signing in instead.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'That email and password do not match an account.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Wait a few minutes and try again.';
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'The Google window closed before sign-in finished.';
    case 'auth/popup-blocked':
      return 'Your browser blocked the Google window. Allow pop-ups for this site, or use email instead.';
    case 'auth/account-exists-with-different-credential':
      return 'That email already has an account with a different sign-in method. Use the one you signed up with.';
    case 'auth/network-request-failed':
      return 'We could not reach STADII. Check your connection and try again.';
    case 'auth/operation-not-allowed':
      // A configuration problem, not the customer's. Say so rather than
      // implying they did something wrong.
      return 'That sign-in method is not enabled on STADII yet.';
    case 'auth/unauthorized-domain':
      // Also ours: the domain is missing from Firebase Auth's authorised list.
      // It is called out separately because it is invisible in development —
      // localhost is authorised by default — and only appears once the site is
      // deployed somewhere new.
      return 'Sign-in is not authorised on this domain yet. Please tell support which address you are using.';
    default:
      return 'We could not sign you in. Try again, or contact support if it keeps happening.';
  }
}

export interface Credentials {
  readonly email: string;
  readonly password: string;
}

export async function signInWithEmail({ email, password }: Credentials): Promise<void> {
  const instance = auth();
  if (instance === null) throw new Error('auth-unavailable');
  await signInWithEmailAndPassword(instance, email.trim(), password);
}

export async function registerWithEmail(
  { email, password }: Credentials,
  displayName?: string,
): Promise<void> {
  const instance = auth();
  if (instance === null) throw new Error('auth-unavailable');

  const created = await createUserWithEmailAndPassword(instance, email.trim(), password);

  // Best effort. A name that fails to save is not a reason to fail a
  // registration that already succeeded — the account exists either way, and
  // the name can be set later.
  if (displayName !== undefined && displayName.trim().length > 0) {
    try {
      await updateProfile(created.user, { displayName: displayName.trim() });
    } catch {
      /* ignored on purpose */
    }
  }
}

export async function signInWithGoogle(): Promise<void> {
  const instance = auth();
  if (instance === null) throw new Error('auth-unavailable');

  const provider = new GoogleAuthProvider();
  // Always ask which account. Silently reusing whichever Google session the
  // browser happens to hold is how somebody buys a ticket on a shared computer
  // under someone else's name.
  provider.setCustomParameters({ prompt: 'select_account' });
  await signInWithPopup(instance, provider);
}

export async function sendReset(email: string): Promise<void> {
  const instance = auth();
  if (instance === null) throw new Error('auth-unavailable');
  await sendPasswordResetEmail(instance, email.trim());
}

export async function signOutOfStadii(): Promise<void> {
  const instance = auth();
  if (instance === null) return;
  await signOut(instance);
}
