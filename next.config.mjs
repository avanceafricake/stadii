/**
 * Next.js configuration for the STADII public website.
 *
 * This app is a READ-ONLY discovery surface (ADR-0001, ADR-0018). It holds no
 * secrets: every runtime value it needs is a `NEXT_PUBLIC_*` variable that is
 * safe in a browser bundle. There is deliberately no server-only credential,
 * no Admin SDK and no service account here.
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // The shared workspace packages ship compiled CommonJS from `dist/`. Next
  // transpiles them so they can be imported from server and client components
  // alike without a dual-package hazard.
  transpilePackages: [
    '@stadii/shared-models',
    '@stadii/shared-constants',
    '@stadii/design-tokens',
  ],

  images: {
    // Crests and hero imagery are organiser-supplied URLs held in Firestore.
    // Storage is the only host we serve them from; anything else is rendered
    // as a plain <img> fallback rather than proxied.
    remotePatterns: [
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      { protocol: 'https', hostname: 'storage.googleapis.com' },
    ],
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
        ],
      },
      {
        // A claim token is a bearer value in a URL. It must never reach an
        // analytics referrer log or a search index.
        source: '/claim/:token',
        headers: [
          { key: 'Referrer-Policy', value: 'no-referrer' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
          { key: 'Cache-Control', value: 'no-store' },
        ],
      },
    ];
  },
};

export default nextConfig;
