/**
 * Tailwind theme, derived from `@stadii/design-tokens`.
 *
 * THE RULE: this file is the ONLY place in the app where a colour literal may
 * appear, and even here every literal comes from the tokens package. Components
 * use semantic class names (`bg-brand`, `text-ink-muted`, `bg-sales-onSale`)
 * and never a hex value.
 *
 * The tokens package ships a small brand palette on purpose — five roles, not
 * fifty shades. A usable web surface needs tints and shades of those roles, so
 * they are DERIVED here by mixing the token toward white or black. Derivation
 * in one place keeps a single source of truth: change `BRAND.primary` in the
 * tokens package and every tint moves with it.
 */
import {
  ADMISSION_COLOURS,
  BRAND,
  RADIUS,
  SEAT_STATE_COLOURS,
  STATUS_COLOURS,
  SPACING,
  TYPE_SCALE,
} from '@stadii/design-tokens';
import type { Config } from 'tailwindcss';

// ---------------------------------------------------------------------------
// Colour derivation. Pure sRGB channel mixing — no perceptual model, because
// the goal is a consistent family around a token, not a new palette.
// ---------------------------------------------------------------------------

type Rgb = readonly [number, number, number];

function parseHex(hex: string): Rgb {
  const value = hex.replace('#', '');
  return [
    Number.parseInt(value.slice(0, 2), 16),
    Number.parseInt(value.slice(2, 4), 16),
    Number.parseInt(value.slice(4, 6), 16),
  ] as const;
}

function toHex(rgb: Rgb): string {
  return `#${rgb.map((c) => Math.round(c).toString(16).padStart(2, '0')).join('')}`;
}

/** `amount` 0 keeps `from`, 1 becomes `to`. */
function mix(from: string, to: string, amount: number): string {
  const a = parseHex(from);
  const b = parseHex(to);
  return toHex([
    a[0] + (b[0] - a[0]) * amount,
    a[1] + (b[1] - a[1]) * amount,
    a[2] + (b[2] - a[2]) * amount,
  ]);
}

const WHITE = BRAND.surface;
const BLACK = BRAND.onSurface;

/** A 50-900 family around one token colour. */
function family(base: string) {
  return {
    50: mix(base, WHITE, 0.95),
    100: mix(base, WHITE, 0.88),
    200: mix(base, WHITE, 0.74),
    300: mix(base, WHITE, 0.56),
    400: mix(base, WHITE, 0.32),
    500: base,
    600: mix(base, BLACK, 0.14),
    700: mix(base, BLACK, 0.3),
    800: mix(base, BLACK, 0.48),
    900: mix(base, BLACK, 0.66),
    DEFAULT: base,
  };
}

/** Neutrals are derived from the token outline and ink, never invented greys. */
const neutral = {
  0: BRAND.surface,
  50: mix(BRAND.outline, WHITE, 0.9),
  100: mix(BRAND.outline, WHITE, 0.72),
  200: mix(BRAND.outline, WHITE, 0.45),
  300: BRAND.outline,
  400: mix(BRAND.outline, BLACK, 0.25),
  500: mix(BRAND.outline, BLACK, 0.45),
  600: mix(BRAND.outline, BLACK, 0.62),
  700: mix(BRAND.outline, BLACK, 0.78),
  800: mix(BRAND.outline, BLACK, 0.9),
  900: BRAND.onSurface,
};

const px = (n: number) => `${n / 16}rem`;

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Three roles, and they are not interchangeable. `brand` is identity
        // and carries headings and dark surfaces; `action` is the green that
        // means "press this" and stays rare enough to keep meaning it; `info`
        // is blue and carries links and supporting data.
        brand: family(BRAND.primary),
        'on-brand': BRAND.onPrimary,
        action: family(BRAND.action),
        'on-action': BRAND.onAction,
        info: family(BRAND.info),
        'on-info': BRAND.onInfo,
        surface: {
          DEFAULT: BRAND.surface,
          sunken: BRAND.background,
          raised: BRAND.surface,
        },
        ink: {
          DEFAULT: BRAND.onSurface,
          muted: BRAND.onSurfaceMuted,
          subtle: neutral[500],
          inverse: BRAND.onPrimary,
        },
        outline: {
          DEFAULT: BRAND.outline,
          strong: neutral[400],
          subtle: neutral[200],
        },
        neutral,
        status: {
          success: STATUS_COLOURS.SUCCESS,
          info: STATUS_COLOURS.INFO,
          warning: STATUS_COLOURS.WARNING,
          error: STATUS_COLOURS.ERROR,
          neutral: STATUS_COLOURS.NEUTRAL,
        },
        // Seat-map and admission tokens are shared with the Flutter clients so
        // that HELD is the same yellow on every device (design_tokens header).
        seat: SEAT_STATE_COLOURS,
        admission: ADMISSION_COLOURS,
      },
      spacing: {
        xs: px(SPACING.xs),
        sm: px(SPACING.sm),
        md: px(SPACING.md),
        lg: px(SPACING.lg),
        xl: px(SPACING.xl),
        xxl: px(SPACING.xxl),
      },
      // Shadows are the deep teal at low opacity, never black. Pure black over
      // a warm neutral reads as dirt rather than depth, and a ticketing app
      // that leans on elevation reads as cheap. One shadow per surface, never
      // stacked.
      boxShadow: {
        none: 'none',
        sm: '0 1px 2px 0 rgb(0 51 51 / 0.05)',
        DEFAULT: '0 1px 10px 0 rgb(0 51 51 / 0.05)',
        md: '0 4px 18px 0 rgb(0 51 51 / 0.08)',
        lg: '0 8px 28px 0 rgb(0 51 51 / 0.10)',
      },
      borderRadius: {
        sm: px(RADIUS.sm),
        md: px(RADIUS.md),
        lg: px(RADIUS.lg),
        pill: `${RADIUS.pill}px`,
      },
      fontSize: {
        caption: [px(TYPE_SCALE.caption), { lineHeight: '1.4' }],
        body: [px(TYPE_SCALE.body), { lineHeight: '1.6' }],
        'body-lg': [px(TYPE_SCALE.bodyLarge), { lineHeight: '1.6' }],
        title: [px(TYPE_SCALE.title), { lineHeight: '1.3' }],
        headline: [px(TYPE_SCALE.headline), { lineHeight: '1.2' }],
        display: [px(TYPE_SCALE.display), { lineHeight: '1.05' }],
      },
      fontFamily: {
        sans: [
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      maxWidth: {
        /**
         * The page band, and the arithmetic behind it.
         *
         * The design reference is a 1440 canvas, but the SITE is not 1440 wide
         * — on a 1920 monitor that reads as a stretched page rather than a
         * designed one. The content band is 1280 and the gutters sit outside
         * it, so this is 1280 + 2 x 32.
         *
         *   1280  band
         *   - 224  sidebar        (14rem, spec 220-240)
         *   - 304  right panel    (19rem, spec 280-320)
         *   -  48  two 24px gaps
         *   = 704  main column    (spec 700-850)
         *
         * Changing any one of these four numbers moves the main column, which
         * is the one a reader actually reads, so they are written down together
         * rather than spread across four class attributes.
         */
        shell: '84rem',
        content: '84rem',
        prose: '46rem',
      },
    },
  },
  plugins: [],
};

export default config;
