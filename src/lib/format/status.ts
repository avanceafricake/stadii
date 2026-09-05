/**
 * The three event status axes, rendered as three things.
 *
 * ADR-0016 split one `status` enum into three genuinely independent questions:
 *
 *   publicationStatus — is it visible?
 *   operationalStatus — is it happening?
 *   salesStatus       — is it selling?
 *
 * They are never collapsed here. A suspended on-sale is PUBLISHED + SCHEDULED +
 * SUSPENDED: visible, happening, not selling. Squashing that into one badge
 * reading "unavailable" is exactly the loss of information the ADR exists to
 * prevent — the customer would not learn that the match is still on.
 *
 * Nothing in this file decides anything. Every function maps a value the
 * backend already stored to the words and the tone used to show it.
 */
import {
  EVENT_OPERATIONAL_STATUS,
  EVENT_PUBLICATION_STATUS,
  EVENT_SALES_STATUS,
  type EventOperationalStatus,
  type EventPublicationStatus,
  type EventSalesStatus,
} from '@stadii/shared-constants';

export type Tone = 'neutral' | 'positive' | 'caution' | 'critical' | 'info';

export interface AxisPresentation {
  /** Which of the three axes this came from. Always shown, so they cannot be confused. */
  readonly axis: 'Publication' | 'Event' | 'Tickets';
  readonly value: string;
  readonly label: string;
  readonly description: string;
  readonly tone: Tone;
}

const PUBLICATION: Record<EventPublicationStatus, Omit<AxisPresentation, 'axis' | 'value'>> = {
  [EVENT_PUBLICATION_STATUS.DRAFT]: {
    label: 'Draft',
    description: 'Not published. Only staff can see this.',
    tone: 'neutral',
  },
  [EVENT_PUBLICATION_STATUS.PUBLISHED]: {
    label: 'Published',
    description: 'Listed publicly on STADII.',
    tone: 'positive',
  },
  [EVENT_PUBLICATION_STATUS.ARCHIVED]: {
    label: 'Archived',
    description: 'Withdrawn from listings. Tickets already issued are unaffected.',
    tone: 'neutral',
  },
};

const OPERATIONAL: Record<EventOperationalStatus, Omit<AxisPresentation, 'axis' | 'value'>> = {
  [EVENT_OPERATIONAL_STATUS.SCHEDULED]: {
    label: 'Scheduled',
    description: 'Going ahead at the time shown.',
    tone: 'positive',
  },
  [EVENT_OPERATIONAL_STATUS.IN_PROGRESS]: {
    label: 'In progress',
    description: 'Under way now.',
    tone: 'info',
  },
  [EVENT_OPERATIONAL_STATUS.COMPLETED]: {
    label: 'Completed',
    description: 'This event has finished.',
    tone: 'neutral',
  },
  [EVENT_OPERATIONAL_STATUS.POSTPONED]: {
    label: 'Postponed',
    description:
      'A new date has not been confirmed. Tickets already issued stay valid for the rearranged event.',
    tone: 'caution',
  },
  [EVENT_OPERATIONAL_STATUS.CANCELLED]: {
    label: 'Cancelled',
    description:
      'This event will not take place. Refunds are handled by STADII — check the app or your email.',
    tone: 'critical',
  },
};

const SALES: Record<EventSalesStatus, Omit<AxisPresentation, 'axis' | 'value'>> = {
  [EVENT_SALES_STATUS.NOT_YET_OPEN]: {
    label: 'Not yet on sale',
    description: 'Tickets have not gone on sale.',
    tone: 'info',
  },
  [EVENT_SALES_STATUS.ON_SALE]: {
    label: 'On sale',
    description: 'Tickets are being sold in the STADII app.',
    tone: 'positive',
  },
  [EVENT_SALES_STATUS.SUSPENDED]: {
    label: 'Sales paused',
    description: 'The organiser has paused sales. The event itself is unaffected.',
    tone: 'caution',
  },
  [EVENT_SALES_STATUS.SOLD_OUT]: {
    label: 'Sold out',
    description:
      'No tickets were left when this was last checked. Returns and released holds can put tickets back.',
    tone: 'caution',
  },
  [EVENT_SALES_STATUS.CLOSED]: {
    label: 'Sales closed',
    description: 'The sales window for this event has ended.',
    tone: 'neutral',
  },
};

function present<T extends string>(
  axis: AxisPresentation['axis'],
  table: Record<T, Omit<AxisPresentation, 'axis' | 'value'>>,
  value: T | undefined,
): AxisPresentation {
  const known = value !== undefined ? table[value] : undefined;
  if (!known) {
    // An unknown value means this page is older than the backend that wrote the
    // document. Degrade to something honest rather than guessing (ADR-0018).
    return {
      axis,
      value: value ?? 'UNKNOWN',
      label: 'Status unavailable',
      description: 'Open the STADII app for the current status.',
      tone: 'neutral',
    };
  }
  // `known` is only non-null when `value` was defined, but the narrowing does
  // not survive the generic index — hence the explicit non-null.
  return { axis, value: value as string, ...known };
}

export function publicationAxis(value: EventPublicationStatus): AxisPresentation {
  return present('Publication', PUBLICATION, value);
}

export function operationalAxis(value: EventOperationalStatus): AxisPresentation {
  return present('Event', OPERATIONAL, value);
}

export function salesAxis(
  value: EventSalesStatus,
  salesStatusReason?: string,
): AxisPresentation {
  const base = present('Tickets', SALES, value);
  // `salesStatusReason` exists precisely so a suspension can say why
  // (ADR-0016). When the backend supplied one, it wins over the generic copy.
  if (value === EVENT_SALES_STATUS.SUSPENDED && salesStatusReason) {
    return { ...base, description: salesStatusReason };
  }
  return base;
}

/**
 * All three axes, in a fixed order, for the badge row.
 *
 * The publication axis is included even though every event this site can read
 * is PUBLISHED — the row is the shape of the model, and a page that renders two
 * axes today grows a third badly tomorrow.
 */
export function allAxes(event: {
  publicationStatus: EventPublicationStatus;
  operationalStatus: EventOperationalStatus;
  salesStatus: EventSalesStatus;
  salesStatusReason?: string;
}): readonly AxisPresentation[] {
  return [
    operationalAxis(event.operationalStatus),
    salesAxis(event.salesStatus, event.salesStatusReason),
    publicationAxis(event.publicationStatus),
  ];
}

// ---------------------------------------------------------------------------
// The purchase entry point
// ---------------------------------------------------------------------------

export interface PurchaseEntryPoint {
  /** Whether to render the hand-off to the app as the page's primary action. */
  readonly offer: boolean;
  readonly label: string;
  /** Honest supporting copy. Never a promise about availability. */
  readonly note: string;
}

/**
 * What the purchase button should say.
 *
 * READ THIS BEFORE CHANGING IT. This function does NOT decide whether a sale is
 * possible. It renders two values the backend already stored, and the backend
 * accepts or refuses the hold regardless of what this returned (ADR-0001).
 *
 * Two consequences worth stating, because both look like bugs:
 *
 *  - SOLD_OUT still offers the entry point. ADR-0016 is explicit that SOLD_OUT
 *    is a cached display value refreshed by a job, and that `canSell` lets a
 *    request through anyway because a refund may have freed a seat since. A
 *    page that hid the button would be more confidently wrong than the backend.
 *  - CANCELLED withdraws it. That is presentation of `operationalStatus`, not a
 *    sales judgement: the backend refuses either way, and a "buy tickets"
 *    button on a cancelled match is a support call waiting to happen.
 */
export function purchaseEntryPoint(event: {
  operationalStatus: EventOperationalStatus;
  salesStatus: EventSalesStatus;
}): PurchaseEntryPoint {
  if (event.operationalStatus === EVENT_OPERATIONAL_STATUS.CANCELLED) {
    return {
      offer: false,
      label: 'Tickets are not on sale',
      note: 'This event has been cancelled.',
    };
  }
  if (event.operationalStatus === EVENT_OPERATIONAL_STATUS.COMPLETED) {
    return {
      offer: false,
      label: 'Tickets are not on sale',
      note: 'This event has finished.',
    };
  }

  switch (event.salesStatus) {
    case EVENT_SALES_STATUS.ON_SALE:
      return {
        offer: true,
        label: 'Get tickets in the app',
        note: 'Prices shown are per ticket. Any booking fee is added and confirmed at checkout.',
      };
    case EVENT_SALES_STATUS.SOLD_OUT:
      return {
        offer: true,
        label: 'Check for returns in the app',
        note: 'Listed as sold out. Released holds and refunds can put tickets back, so the app checks live.',
      };
    case EVENT_SALES_STATUS.NOT_YET_OPEN:
      return {
        offer: false,
        label: 'Not yet on sale',
        note: 'Open this event in the STADII app to be ready when sales start.',
      };
    case EVENT_SALES_STATUS.SUSPENDED:
      return {
        offer: false,
        label: 'Sales are paused',
        note: 'The organiser has paused sales. The event itself is unaffected.',
      };
    case EVENT_SALES_STATUS.CLOSED:
      return {
        offer: false,
        label: 'Sales have closed',
        note: 'The sales window for this event has ended.',
      };
    default:
      return {
        offer: false,
        label: 'Check the app',
        note: 'Open the STADII app for the current ticket status.',
      };
  }
}
