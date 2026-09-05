/**
 * Ticket categories and the prices the backend stored.
 *
 * A ticket type is an organiser-defined product ("VVIP", "Student", "East
 * Stand") and is unbounded — no list of names exists in this codebase
 * (ADR-0006). `admissionKind` is the separate, platform-defined question of how
 * admission mechanically works, and both are shown because "VIP" is reserved
 * seating at one venue and standing at another.
 *
 * WHAT THIS DOES NOT DO: no total, no fee, no quantity maths, no "X left". The
 * price rendered is `priceMinor` exactly as stored (ADR-0013). Availability is
 * decided by an inventory transaction at hold time, not by anything a website
 * can see (ADR-0001), so nothing here counts seats.
 */
import {
  ADMISSION_KIND,
  ELIGIBILITY_KIND,
  TICKET_TYPE_STATUS,
  type AdmissionKind,
  type TicketTypeStatus,
} from '@stadii/shared-constants';
import type { TicketType } from '@stadii/shared-models';

import { Card } from './primitives';
import { formatMinor } from '@/lib/format/money';

const ADMISSION_LABEL: Record<AdmissionKind, string> = {
  [ADMISSION_KIND.RESERVED_SEAT]: 'Reserved seat',
  [ADMISSION_KIND.GENERAL_ADMISSION]: 'General admission',
};

const ADMISSION_HELP: Record<AdmissionKind, string> = {
  [ADMISSION_KIND.RESERVED_SEAT]: 'You choose a specific seat when you buy.',
  [ADMISSION_KIND.GENERAL_ADMISSION]: 'Unreserved. Find a place in the area when you arrive.',
};

/** Only the categories whose own status says something the price does not. */
const CATEGORY_NOTE: Partial<Record<TicketTypeStatus, string>> = {
  [TICKET_TYPE_STATUS.PAUSED]: 'Paused by the organiser',
  [TICKET_TYPE_STATUS.SOLD_OUT]: 'Listed as sold out',
  [TICKET_TYPE_STATUS.CLOSED]: 'Closed',
  [TICKET_TYPE_STATUS.DRAFT]: 'Not yet available',
};

export function TicketCategoryList({ ticketTypes }: { ticketTypes: readonly TicketType[] }) {
  if (ticketTypes.length === 0) {
    return (
      <p className="text-body text-ink-muted">
        Ticket categories for this event have not been published yet.
      </p>
    );
  }

  return (
    <ul className="grid list-none gap-sm p-0">
      {ticketTypes.map((ticketType) => {
        const note = CATEGORY_NOTE[ticketType.status];
        return (
          <Card as="li" key={ticketType.id}>
            <div className="flex flex-wrap items-start justify-between gap-sm">
              <div className="min-w-0">
                <h3 className="text-body-lg font-semibold text-ink">{ticketType.name}</h3>
                <p className="mt-xs text-caption uppercase tracking-wide text-ink-subtle">
                  {ADMISSION_LABEL[ticketType.admissionKind] ?? 'Admission'}
                  {note ? ` · ${note}` : ''}
                </p>
                {ticketType.description ? (
                  <p className="mt-sm text-body text-ink-muted">{ticketType.description}</p>
                ) : (
                  <p className="mt-sm text-body text-ink-muted">
                    {ADMISSION_HELP[ticketType.admissionKind] ?? ''}
                  </p>
                )}
                {ticketType.eligibility &&
                ticketType.eligibility.kind !== ELIGIBILITY_KIND.OPEN ? (
                  <p className="mt-sm text-body text-ink-muted">
                    {ticketType.eligibility.kind === ELIGIBILITY_KIND.MEMBERS_ONLY
                      ? 'Members only.'
                      : 'Proof is checked at the gate.'}{' '}
                    {ticketType.eligibility.verificationNote ?? ''}
                  </p>
                ) : null}
              </div>

              <p className="shrink-0 text-title font-bold tabular-nums text-ink">
                {formatMinor(ticketType.priceMinor, ticketType.currency)}
                <span className="ml-xs block text-caption font-normal text-ink-subtle">
                  per ticket
                </span>
              </p>
            </div>
          </Card>
        );
      })}
    </ul>
  );
}

/**
 * The honest footnote that goes under any list of prices.
 *
 * A booking fee exists and this surface has no fee schedule to quote it from
 * (ADR-0018). Saying so is better than showing a "total" that is wrong.
 */
export function PriceFootnote() {
  return (
    <p className="mt-md text-caption text-ink-subtle">
      Prices are per ticket, in Kenyan shillings, as set by the organiser. Any booking
      fee is added and confirmed in the STADII app before you pay — this page never
      quotes a total.
    </p>
  );
}
