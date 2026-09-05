/**
 * Design tokens — one source of truth for colour, type and spacing across the
 * three Flutter apps and two Next.js apps.
 *
 * PHASE 1 SCOPE: the seat-map and admission tokens are defined because the
 * domain depends on them being consistent — a gate operator must see the same
 * green for ADMIT on every device, and a seat map must use the same colour for
 * HELD everywhere. General brand tokens are placeholders and are set with the
 * client work in Phase 3.
 */

/** Seat map state colours. Shared by customer app, web and kiosk. */
export const SEAT_STATE_COLOURS = {
  AVAILABLE: '#2E7D32',
  HELD: '#F9A825',
  SOLD: '#9E9E9E',
  USED: '#616161',
  BLOCKED: '#37474F',
  SELECTED: '#1565C0',
} as const;

/**
 * Admission result colours. Deliberately high-contrast: a gate operator reads
 * these at arm's length, in daylight, without looking carefully.
 */
export const ADMISSION_COLOURS = {
  ADMIT: '#1B7F3B',
  DENY: '#C62828',
  NEUTRAL: '#455A64',
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const RADIUS = {
  sm: 4,
  md: 8,
  lg: 16,
  pill: 999,
} as const;

export const TYPE_SCALE = {
  caption: 12,
  body: 14,
  bodyLarge: 16,
  title: 20,
  headline: 28,
  /** Gate ADMIT/DENY text — must be legible across a turnstile */
  display: 48,
} as const;

/** Placeholder brand palette. Replaced during client work. */
export const BRAND = {
  primary: '#0B3D2E',
  onPrimary: '#FFFFFF',
  surface: '#FFFFFF',
  onSurface: '#1A1C1E',
  outline: '#C4C7C5',
} as const;
