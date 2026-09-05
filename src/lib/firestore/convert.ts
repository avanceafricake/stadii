/**
 * Firestore document → domain model.
 *
 * The wire shape and the model shape differ in exactly one way that matters:
 * Firestore stores a `Timestamp`, while `@stadii/shared-models` uses `Instant`
 * — epoch milliseconds, so a comparison is a numeric operation rather than a
 * parse (see `common.ts`). Everything else is passed through unchanged.
 *
 * No field is renamed, defaulted or computed here. A document that is missing a
 * field renders as missing; inventing a value would be this surface deciding
 * something, which is the one thing it must not do.
 */

interface TimestampLike {
  seconds: number;
  nanoseconds: number;
}

function isTimestampLike(value: unknown): value is TimestampLike {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as TimestampLike).seconds === 'number' &&
    typeof (value as TimestampLike).nanoseconds === 'number'
  );
}

function hasToDate(value: unknown): value is { toDate: () => Date } {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { toDate?: unknown }).toDate === 'function'
  );
}

/** Recursively replaces Firestore Timestamps with epoch milliseconds. */
export function normaliseTimestamps(value: unknown): unknown {
  if (value === null || value === undefined) return value;

  if (hasToDate(value)) return value.toDate().getTime();
  if (isTimestampLike(value)) {
    return value.seconds * 1000 + Math.floor(value.nanoseconds / 1_000_000);
  }
  if (Array.isArray(value)) return value.map(normaliseTimestamps);

  if (typeof value === 'object') {
    // A GeoPoint or DocumentReference would fall through to here. Neither
    // appears in any document this surface reads, and both would be passed
    // through untouched rather than mangled.
    const source = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(source)) {
      out[key] = normaliseTimestamps(source[key]);
    }
    return out;
  }

  return value;
}

export interface DocumentLike {
  readonly id: string;
  data: () => Record<string, unknown> | undefined;
}

/**
 * The document ID is written onto the model as `id`.
 *
 * Backend documents already carry `id`, and where they do the stored value wins
 * — the document ID is the fallback, not an override, so a mismatch is visible
 * rather than silently papered over.
 */
export function fromDoc<T>(snapshot: DocumentLike): T | null {
  const raw = snapshot.data();
  if (!raw) return null;
  const normalised = normaliseTimestamps(raw) as Record<string, unknown>;
  return { id: snapshot.id, ...normalised } as unknown as T;
}

export function fromDocs<T>(snapshots: readonly DocumentLike[]): T[] {
  const out: T[] = [];
  for (const snapshot of snapshots) {
    const model = fromDoc<T>(snapshot);
    if (model) out.push(model);
  }
  return out;
}

/** An `Instant` from an unknown field, or `null`. Never throws. */
export function toInstant(value: unknown): number | null {
  const normalised = normaliseTimestamps(value);
  return typeof normalised === 'number' && Number.isFinite(normalised) ? normalised : null;
}
