/**
 * An image whose URL came from an organiser, not from this repository.
 *
 * `next/image` proxies through the optimiser, and the optimiser refuses any
 * host not listed in `next.config.mjs` — with a 400, which renders as a broken
 * image rather than as a missing one. Crest and venue URLs are stored in
 * Firestore by whoever set the record up, so they can point anywhere.
 *
 * The config already said this was the intent ("anything else is rendered as a
 * plain <img> fallback rather than proxied"); nothing implemented it, so every
 * card that showed an organiser-supplied image outside Firebase Storage showed
 * a broken one. This is that fallback.
 */

import Image from 'next/image';

import { cx } from './primitives';

/** Kept in step with `images.remotePatterns` in next.config.mjs. */
const OPTIMISED_HOSTS = new Set(['firebasestorage.googleapis.com', 'storage.googleapis.com']);

export function isOptimisable(url: string): boolean {
  // A relative path is our own asset and is always optimisable.
  if (url.startsWith('/')) return true;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && OPTIMISED_HOSTS.has(parsed.hostname);
  } catch {
    return false;
  }
}

/**
 * `fill` covers a sized parent; otherwise pass width and height.
 *
 * `alt` is deliberately required and usually empty: these images sit beside a
 * heading that already names the thing, so announcing the filename or the club
 * name twice is worse than announcing nothing.
 */
export function RemoteImage({
  src,
  alt,
  className,
  fill,
  width,
  height,
  sizes,
  style,
}: {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  style?: React.CSSProperties;
}) {
  if (isOptimisable(src)) {
    return fill ? (
      <Image src={src} alt={alt} fill sizes={sizes} className={className} style={style} />
    ) : (
      <Image
        src={src}
        alt={alt}
        width={width ?? 64}
        height={height ?? 64}
        className={className}
        style={style}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      className={cx(fill && 'absolute inset-0 h-full w-full', className)}
      style={style}
    />
  );
}
