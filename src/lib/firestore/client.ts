/**
 * The Firebase Web SDK, configured for anonymous public reads.
 *
 * Two deliberate choices:
 *
 * 1. **`firebase/firestore/lite`, not the full SDK.** This surface issues
 *    one-shot reads during server rendering. The lite build speaks REST, has no
 *    long-lived channel, no local cache and no listener machinery — all of
 *    which are the wrong shape for a request that renders once and ends. The
 *    real-time seat map lives in the app, where a listener is worth its cost.
 *
 * 2. **No Admin SDK, ever.** Everything readable from here is readable by any
 *    visitor under `firestore.rules`: ACTIVE catalogue records, and events that
 *    are `publicationStatus == 'PUBLISHED'` AND `visibility == 'PUBLIC'`. There
 *    is no privileged path, so there is no privileged credential to leak
 *    (ADR-0018).
 *
 * Missing configuration is a first-class state, not a crash. A build machine
 * without `NEXT_PUBLIC_FIREBASE_*` must still produce a site; every page then
 * renders its "we could not load this" state instead of a stack trace.
 */
import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore/lite';

const APP_NAME = 'stadii-web';

export interface FirebaseWebConfig {
  readonly apiKey: string;
  readonly authDomain: string;
  readonly projectId: string;
  readonly storageBucket: string;
  readonly messagingSenderId: string;
  readonly appId: string;
  readonly databaseId: string;
}

export function readConfig(): FirebaseWebConfig | null {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? '',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? '',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? '',
    databaseId: process.env.NEXT_PUBLIC_FIRESTORE_DATABASE_ID ?? '',
  };
  // `projectId` and `apiKey` are the two the REST transport cannot work
  // without. The rest are declared for completeness and for parity with the
  // console's SDK snippet.
  if (config.projectId.length === 0 || config.apiKey.length === 0) return null;
  return config;
}

export function isConfigured(): boolean {
  return readConfig() !== null;
}

let cachedDb: Firestore | null = null;

function app(config: FirebaseWebConfig): FirebaseApp {
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

/** The Firestore handle, or `null` when this deployment has no configuration. */
export function db(): Firestore | null {
  if (cachedDb) return cachedDb;
  const config = readConfig();
  if (!config) return null;
  cachedDb =
    config.databaseId.length > 0
      ? getFirestore(app(config), config.databaseId)
      : getFirestore(app(config));
  return cachedDb;
}
