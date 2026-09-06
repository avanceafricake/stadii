/**
 * Design tokens — one source of truth for colour, type and spacing across the
 * three Flutter apps and two Next.js apps.
 *
 * A hex value anywhere else is a bug. It is how a design system quietly stops
 * being one: the first exception is always reasonable, and by the tenth nobody
 * can say what the brand colour is.
 *
 * The Dart mirror of this file is GENERATED (ADR-0002,
 * scripts/generate-dart-contracts.mjs), so the seat-state and admission colours
 * cannot drift between a customer tapping a green seat and a steward seeing a
 * green ADMIT. They are the same decision expressed twice.
 */

/**
 * The STADII palette.
 *
 * Three colours carry the identity, and they are not interchangeable:
 *
 *   deepTeal  IDENTITY     headings, dark surfaces, navigation, the brand mark
 *   blue      INFORMATION  links, secondary actions, supporting data, charts
 *   green     ACTION       primary CTAs, success, active and selected states
 *
 * The ratio matters as much as the values. Roughly 70% white and light
 * neutral, 20% deep teal, 7-8% blue, 2-3% green. Green earns its weight by
 * being rare: an interface that is mostly green cannot use green to mean
 * "press this".
 */
export const BRAND = {
  /** #003333 — the primary brand colour. Trust and structure. */
  primary: '#003333',
  onPrimary: '#FFFFFF',

  /** #336699 — information and secondary emphasis. Digital, supporting. */
  info: '#336699',
  onInfo: '#FFFFFF',

  /** #669933 — action and positive state. Used sparingly, deliberately. */
  action: '#669933',
  onAction: '#FFFFFF',

  /** Cards and sheets sit on white; the page behind them is a light neutral. */
  surface: '#FFFFFF',
  background: '#F5F7F8',

  /** Body copy is the brand colour, which is what makes the page feel owned. */
  onSurface: '#003333',
  onSurfaceMuted: '#667788',

  outline: '#D9E1E5',
} as const;

/**
 * Status colours.
 *
 * SUCCESS and INFORMATION are the brand's own green and blue rather than
 * separate values — a confirmed booking and a primary action mean the same
 * thing to a reader, and two nearly-identical greens would be a bug nobody
 * ever quite sees. Warning and error are their own hues because they must not
 * be mistaken for either.
 */
export const STATUS_COLOURS = {
  SUCCESS: BRAND.action,
  INFO: BRAND.info,
  WARNING: '#D99A24',
  ERROR: '#D64545',
  NEUTRAL: BRAND.onSurfaceMuted,
} as const;

/** Seat map state colours. Shared by customer app, web and kiosk. */
export const SEAT_STATE_COLOURS = {
  /** Free to pick — the same green as every other "yes" in the product. */
  AVAILABLE: BRAND.action,
  /** Someone else is mid-purchase. Amber, because it is neither yes nor no. */
  HELD: STATUS_COLOURS.WARNING,
  SOLD: '#9AA7B2',
  USED: BRAND.onSurfaceMuted,
  /** Structurally unavailable. Reads as "not part of the sale". */
  BLOCKED: '#33595A',
  /** Your own selection — blue, so it cannot be confused with "available". */
  SELECTED: BRAND.info,
} as const;

/**
 * Admission result colours. Deliberately high-contrast: a gate operator reads
 * these at arm's length, in daylight, without looking carefully.
 *
 * NEUTRAL is the third state and the one that matters most — "could not reach
 * STADII" is not a denial, and an operator must never be able to read it as
 * one (ADR-0010). Amber, because it is the one hue that means neither yes nor
 * no; blue would read as information and grey as a washed-out verdict.
 */
export const ADMISSION_COLOURS = {
  ADMIT: BRAND.action,
  DENY: STATUS_COLOURS.ERROR,
  NEUTRAL: STATUS_COLOURS.WARNING,
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
  md: 10,
  /** Cards. Soft enough to feel considered, not so soft it reads as a toy. */
  lg: 14,
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
