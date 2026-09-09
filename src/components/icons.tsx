/**
 * One icon set, from one library.
 *
 * This used to be a dozen hand-drawn paths in `shell.tsx`. That was defensible
 * while there were a dozen; it stopped being defensible the moment the product
 * needed a different mark for football, rugby, swimming, athletics, boxing and
 * table tennis, because the alternative was drawing them, badly, by hand.
 *
 * Tabler is the library rather than a more common one for a specific reason: it
 * is the only widely-used set with a real SPORTS section — `IconBallFootball`,
 * `IconRugby`, `IconPool`, `IconKarate`, `IconPingPong`, `IconRun` — and a
 * `IconBuildingStadium` that is an actual stadium. On a sports-ticketing
 * platform that is not a nice-to-have; the alternative is a page of
 * indistinguishable circles. It ships as tree-shaken React components, so a
 * page pays for the icons it renders and not for the other five thousand.
 *
 * The `<Icon name="…" />` API is unchanged from the hand-drawn version, so
 * every existing call site kept working when this replaced it.
 */

import {
  IconArrowRight,
  IconBallAmericanFootball,
  IconBallBasketball,
  IconBallFootball,
  IconBallTennis,
  IconBallVolleyball,
  IconBarbell,
  IconBell,
  IconBike,
  IconBuildingStadium,
  IconCalendarEvent,
  IconChevronRight,
  IconKarate,
  IconMapPin,
  IconMedal,
  IconMusic,
  IconPingPong,
  IconPlayHandball,
  IconPool,
  IconQrcode,
  IconRugby,
  IconRun,
  IconScubaDiving,
  IconSearch,
  IconShield,
  IconShieldCheck,
  IconTicket,
  IconTrophy,
  IconUser,
  IconUsers,
  type IconProps,
} from '@tabler/icons-react';
import type { ComponentType } from 'react';

import { cx } from './primitives';

/**
 * The names this codebase uses, mapped to the library.
 *
 * Naming them by ROLE rather than by drawing — `stadium`, not
 * `building-stadium` — is what let the underlying library change without a
 * single page being edited, and is what will let it change again.
 */
const ICONS = {
  // Navigation and chrome
  home: IconBuildingStadium,
  calendar: IconCalendarEvent,
  stadium: IconBuildingStadium,
  ball: IconBallFootball,
  shield: IconShield,
  trophy: IconTrophy,
  search: IconSearch,
  bell: IconBell,
  user: IconUser,
  users: IconUsers,
  ticket: IconTicket,
  place: IconMapPin,
  qr: IconQrcode,
  verified: IconShieldCheck,
  chevron: IconChevronRight,
  arrow: IconArrowRight,

  // Sports
  football: IconBallFootball,
  rugby: IconRugby,
  basketball: IconBallBasketball,
  volleyball: IconBallVolleyball,
  tennis: IconBallTennis,
  tableTennis: IconPingPong,
  athletics: IconRun,
  swimming: IconPool,
  diving: IconScubaDiving,
  boxing: IconKarate,
  handball: IconPlayHandball,
  cycling: IconBike,
  weightlifting: IconBarbell,
  americanFootball: IconBallAmericanFootball,
  medal: IconMedal,
  music: IconMusic,
} as const satisfies Record<string, ComponentType<IconProps>>;

export type IconName = keyof typeof ICONS;

export function Icon({ name, className }: { name: IconName; className?: string }) {
  const Glyph = ICONS[name];
  return (
    <Glyph
      aria-hidden="true"
      stroke={1.6}
      className={cx('h-5 w-5 shrink-0', className)}
    />
  );
}

/**
 * The icon for a sport, by slug.
 *
 * Presentation only, and deliberately incomplete. Sports come from the backend
 * and this app does not decide which ones exist (Phase 3 §7) — a sport nobody
 * has drawn an icon for still renders, still links and still works, it simply
 * gets the trophy. Guessing a mark for an unknown sport would be worse than
 * the generic one: an athletics icon on a chess tournament is a wrong answer,
 * and a trophy is an honest "some sport".
 */
export function sportIconName(slug: string): IconName {
  switch (slug) {
    case 'football':
    case 'soccer':
      return 'football';
    case 'rugby':
    case 'rugby-sevens':
      return 'rugby';
    case 'basketball':
      return 'basketball';
    case 'volleyball':
      return 'volleyball';
    case 'tennis':
      return 'tennis';
    case 'table-tennis':
      return 'tableTennis';
    case 'athletics':
    case 'running':
    case 'marathon':
      return 'athletics';
    case 'swimming':
      return 'swimming';
    case 'diving':
      return 'diving';
    case 'boxing':
    case 'wrestling':
    case 'martial-arts':
    case 'taekwondo':
    case 'judo':
      return 'boxing';
    case 'handball':
      return 'handball';
    case 'cycling':
      return 'cycling';
    case 'weightlifting':
    case 'powerlifting':
      return 'weightlifting';
    case 'american-football':
      return 'americanFootball';
    case 'badminton':
      return 'tennis';
    case 'concert':
    case 'music':
      return 'music';
    default:
      return 'trophy';
  }
}
