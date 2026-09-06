/**
 * Layout and text primitives.
 *
 * Small, unopinionated and shared, so a page is composed rather than
 * hand-rolled. Every colour is a semantic Tailwind class backed by
 * `@stadii/design-tokens`; there is no hex value in this file, and the ESLint
 * config rejects one.
 */
import Link from 'next/link';
import type { ReactNode } from 'react';

export function cx(...values: (string | false | null | undefined)[]): string {
  return values.filter(Boolean).join(' ');
}

export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx('mx-auto w-full max-w-content px-md sm:px-lg', className)}>
      {children}
    </div>
  );
}

export function Section({
  children,
  className,
  as: Tag = 'section',
  labelledBy,
}: {
  children: ReactNode;
  className?: string;
  as?: 'section' | 'div';
  labelledBy?: string;
}) {
  return (
    <Tag className={cx('py-xl', className)} aria-labelledby={labelledBy}>
      {children}
    </Tag>
  );
}

export function SectionHeading({
  id,
  children,
  action,
}: {
  id?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-lg flex flex-wrap items-baseline justify-between gap-sm">
      <h2 id={id} className="text-title font-semibold text-ink">
        {children}
      </h2>
      {action}
    </div>
  );
}

export function PageHeader({
  title,
  lede,
  children,
}: {
  title: string;
  lede?: string;
  children?: ReactNode;
}) {
  return (
    <header className="border-b border-outline-subtle bg-surface">
      <Container className="py-xl">
        <h1 className="text-headline font-bold tracking-tight text-ink">{title}</h1>
        {lede ? <p className="mt-sm max-w-prose text-body-lg text-ink-muted">{lede}</p> : null}
        {children}
      </Container>
    </header>
  );
}

export function Card({
  children,
  className,
  as: Tag = 'div',
}: {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'li' | 'article';
}) {
  return (
    <Tag
      className={cx(
        'rounded-lg border border-outline-subtle bg-surface p-md shadow-sm',
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export function Grid({
  children,
  className,
  as: Tag = 'div',
}: {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'ul';
}) {
  return (
    <Tag
      className={cx(
        'grid gap-md sm:grid-cols-2 lg:grid-cols-3',
        Tag === 'ul' && 'list-none p-0',
        className,
      )}
    >
      {children}
    </Tag>
  );
}

type ButtonTone = 'primary' | 'secondary' | 'dark';

/**
 * Three tones, and the choice between them is a meaning rather than a taste.
 *
 * `primary` is the green: the one thing on the page a visitor is meant to do.
 * `secondary` is blue where it is a real alternative action, and quiet where
 * it is merely another way out. `dark` is the deep teal, for an action sitting
 * on a light surface that needs to read as the brand rather than as a CTA.
 *
 * If a screen has two green buttons, one of them is wrong.
 */
const BUTTON_CLASSES: Record<ButtonTone, string> = {
  primary: 'bg-action text-on-action hover:bg-action-600 focus-visible:outline-action-700',
  secondary: 'border border-outline-strong bg-surface text-ink hover:bg-surface-sunken',
  dark: 'bg-brand text-on-brand hover:bg-brand-700',
};

export function ButtonLink({
  href,
  children,
  tone = 'primary',
  external,
  className,
  rel,
  referrerPolicy,
}: {
  href: string;
  children: ReactNode;
  tone?: ButtonTone;
  external?: boolean;
  className?: string;
  rel?: string;
  referrerPolicy?: 'no-referrer' | 'strict-origin-when-cross-origin';
}) {
  const classes = cx(
    'inline-flex items-center justify-center gap-sm rounded-md px-lg py-sm text-body-lg font-semibold transition-colors',
    BUTTON_CLASSES[tone],
    className,
  );

  if (external) {
    return (
      <a
        href={href}
        className={classes}
        rel={rel ?? 'noopener'}
        referrerPolicy={referrerPolicy}
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}

export function Prose({ children }: { children: ReactNode }) {
  return (
    <div
      className={cx(
        'max-w-prose space-y-md text-body-lg leading-relaxed text-ink-muted',
        '[&_h2]:mt-xl [&_h2]:text-title [&_h2]:font-semibold [&_h2]:text-ink',
        '[&_h3]:mt-lg [&_h3]:text-body-lg [&_h3]:font-semibold [&_h3]:text-ink',
        '[&_ul]:list-disc [&_ul]:space-y-xs [&_ul]:pl-lg',
        '[&_ol]:list-decimal [&_ol]:space-y-xs [&_ol]:pl-lg',
        '[&_a]:font-medium [&_a]:text-brand-700 [&_a]:underline',
        '[&_strong]:font-semibold [&_strong]:text-ink',
      )}
    >
      {children}
    </div>
  );
}
