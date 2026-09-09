/**
 * Site-level configuration.
 *
 * Everything environment-dependent is read here and nowhere else, so a
 * hard-coded staging domain cannot hide in a component.
 */

const DEFAULT_SITE_URL = 'https://stadii.co.ke';

function env(name: string, fallback = ''): string {
  // Next inlines NEXT_PUBLIC_* at build time, so these must be literal
  // property accesses rather than a dynamic lookup.
  const table: Record<string, string | undefined> = {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_APP_SCHEME: process.env.NEXT_PUBLIC_APP_SCHEME,
    NEXT_PUBLIC_APP_ANDROID_URL: process.env.NEXT_PUBLIC_APP_ANDROID_URL,
    NEXT_PUBLIC_APP_IOS_URL: process.env.NEXT_PUBLIC_APP_IOS_URL,
    NEXT_PUBLIC_SUPPORT_EMAIL: process.env.NEXT_PUBLIC_SUPPORT_EMAIL,
    NEXT_PUBLIC_SUPPORT_PHONE: process.env.NEXT_PUBLIC_SUPPORT_PHONE,
    NEXT_PUBLIC_SOCIAL_X: process.env.NEXT_PUBLIC_SOCIAL_X,
    NEXT_PUBLIC_SOCIAL_FACEBOOK: process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK,
    NEXT_PUBLIC_SOCIAL_INSTAGRAM: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM,
    NEXT_PUBLIC_SOCIAL_YOUTUBE: process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE,
    NEXT_PUBLIC_SOCIAL_TIKTOK: process.env.NEXT_PUBLIC_SOCIAL_TIKTOK,
  };
  const value = table[name];
  return value && value.length > 0 ? value : fallback;
}

function normaliseOrigin(raw: string): string {
  const trimmed = raw.trim().replace(/\/+$/, '');
  return trimmed.length > 0 ? trimmed : DEFAULT_SITE_URL;
}

export const site = {
  name: 'STADII',
  /** Used as the OpenGraph site name and in the Organization JSON-LD. */
  legalName: 'STADII',
  tagline: 'Tickets and stadium access for East African sport',
  description:
    'Find matches, meets and championships across Kenya and East Africa, see what each ' +
    'venue and ticket category offers, and get your tickets in the STADII app.',
  url: normaliseOrigin(env('NEXT_PUBLIC_SITE_URL', DEFAULT_SITE_URL)),
  locale: 'en_KE',
  /** Every date on this site is rendered in the stadium's local time. */
  timezone: 'Africa/Nairobi',
  support: {
    email: env('NEXT_PUBLIC_SUPPORT_EMAIL', 'support@stadii.co.ke'),
    phone: env('NEXT_PUBLIC_SUPPORT_PHONE', ''),
  },
  /**
   * Official accounts, if any exist yet.
   *
   * Deliberately empty by default and rendered only when set. A footer that
   * links to a handle nobody has registered sends visitors to someone else's
   * account, and a squatted handle on a ticketing brand is a fraud vector, not
   * a cosmetic problem. Set these in the App Hosting environment once the
   * accounts are real (docs/operations/configuration.md).
   */
  social: [
    { label: 'X', url: env('NEXT_PUBLIC_SOCIAL_X', '') },
    { label: 'Facebook', url: env('NEXT_PUBLIC_SOCIAL_FACEBOOK', '') },
    { label: 'Instagram', url: env('NEXT_PUBLIC_SOCIAL_INSTAGRAM', '') },
    { label: 'YouTube', url: env('NEXT_PUBLIC_SOCIAL_YOUTUBE', '') },
    { label: 'TikTok', url: env('NEXT_PUBLIC_SOCIAL_TIKTOK', '') },
  ].filter((account) => account.url.length > 0),
  app: {
    scheme: env('NEXT_PUBLIC_APP_SCHEME', 'stadii'),
    android: env('NEXT_PUBLIC_APP_ANDROID_URL', ''),
    ios: env('NEXT_PUBLIC_APP_IOS_URL', ''),
  },
} as const;

/** Absolute URL for a site-relative path. Canonicals and OG URLs use this. */
export function absoluteUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `${site.url}${suffix === '/' ? '' : suffix}`;
}
