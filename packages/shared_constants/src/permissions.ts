/**
 * Permissions and roles — docs/domain/12-identity-and-roles.md, ADR-0015.
 *
 * Permissions are the atoms; roles are named bundles. Constitution §15 forbids a
 * single generic "admin" role and forbids treating hidden UI as authorization.
 *
 * Two conventions:
 *   - `:all`      — "beyond your own". `order:read` is a customer reading their
 *                   own orders; `order:read:all` is an administrative capability.
 *   - `:override` — bypasses a normal business rule. EVERY use is audited at
 *                   elevated severity, without exception.
 */

export const PERMISSIONS = {
  // Catalogue
  SPORT_WRITE: 'sport:write',
  PARTICIPANT_WRITE: 'participant:write',
  COMPETITION_WRITE: 'competition:write',

  // Venue
  VENUE_READ: 'venue:read',
  VENUE_WRITE: 'venue:write',
  VENUE_ARCHIVE: 'venue:archive',
  VENUE_AREA_WRITE: 'venue:area:write',
  VENUE_SEATMAP_IMPORT: 'venue:seatmap:import',
  VENUE_GATE_WRITE: 'venue:gate:write',

  // Event
  EVENT_READ: 'event:read',
  EVENT_WRITE: 'event:write',
  EVENT_PUBLISH: 'event:publish',
  EVENT_CANCEL: 'event:cancel',
  EVENT_POSTPONE: 'event:postpone',
  EVENT_POLICY_WRITE: 'event:policy:write',

  // Inventory
  INVENTORY_READ: 'inventory:read',
  INVENTORY_TICKETTYPE_WRITE: 'inventory:tickettype:write',
  INVENTORY_ALLOCATION_WRITE: 'inventory:allocation:write',
  INVENTORY_BLOCK: 'inventory:block',
  INVENTORY_CAPACITY_WRITE: 'inventory:capacity:write',

  // Sales
  ORDER_READ: 'order:read',
  ORDER_READ_ALL: 'order:read:all',
  ORDER_CANCEL: 'order:cancel',
  ORDER_SELL_KIOSK: 'order:sell:kiosk',

  // Payments and finance
  PAYMENT_READ: 'payment:read',
  PAYMENT_RECONCILE: 'payment:reconcile',
  FINANCE_REFUND: 'finance:refund',
  FINANCE_REFUND_OVERRIDE: 'finance:refund:override',
  FINANCE_FEE_CONFIGURE: 'finance:fee:configure',
  FINANCE_SETTLEMENT_READ: 'finance:settlement:read',
  FINANCE_SETTLEMENT_GENERATE: 'finance:settlement:generate',
  FINANCE_SETTLEMENT_APPROVE: 'finance:settlement:approve',

  // Ticketing
  TICKET_READ: 'ticket:read',
  TICKET_READ_ALL: 'ticket:read:all',
  TICKET_VOID: 'ticket:void',
  TICKET_TRANSFER_ADMIN: 'ticket:transfer:admin',

  // Gate
  GATE_SCAN: 'gate:scan',
  GATE_TICKET_LOOKUP: 'gate:ticket:lookup',
  GATE_ADMISSION_REVERSE: 'gate:admission:reverse',
  GATE_DEVICE_REGISTER: 'gate:device:register',
  GATE_DEVICE_ASSIGN: 'gate:device:assign',
  GATE_STATS_READ: 'gate:stats:read',

  // Kiosk
  KIOSK_OPERATE: 'kiosk:operate',
  KIOSK_REGISTER: 'kiosk:register',
  KIOSK_RECONCILE: 'kiosk:reconcile',

  // Identity
  USER_READ: 'user:read',
  USER_SUSPEND: 'user:suspend',
  MEMBERSHIP_GRANT: 'membership:grant',
  MEMBERSHIP_REVOKE: 'membership:revoke',
  MEMBERSHIP_READ: 'membership:read',

  // Platform
  AUDIT_READ: 'audit:read',
  CONFIG_WRITE: 'config:write',
  ORG_WRITE: 'org:write',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ALL_PERMISSIONS: readonly Permission[] = Object.values(PERMISSIONS);

/** A permission that bypasses a business rule. Always audited at CRITICAL. */
export function isOverridePermission(p: Permission): boolean {
  return p.endsWith(':override');
}

// ---------------------------------------------------------------------------
// Roles
// ---------------------------------------------------------------------------

export const ROLE_IDS = {
  STADII_SUPER_ADMIN: 'STADII_SUPER_ADMIN',
  STADII_SUPPORT: 'STADII_SUPPORT',
  FINANCE: 'FINANCE',
  STADIUM_ADMIN: 'STADIUM_ADMIN',
  EVENT_ORGANIZER: 'EVENT_ORGANIZER',
  GATE_SUPERVISOR: 'GATE_SUPERVISOR',
  GATE_ATTENDANT: 'GATE_ATTENDANT',
  KIOSK_OPERATOR: 'KIOSK_OPERATOR',
} as const;

export type RoleId = (typeof ROLE_IDS)[keyof typeof ROLE_IDS];

export interface RoleDefinition {
  readonly id: RoleId;
  readonly name: string;
  readonly description: string;
  readonly permissions: readonly Permission[];
  readonly assignableAtScopes: readonly ('PLATFORM' | 'ORGANIZATION' | 'VENUE' | 'EVENT')[];
  /**
   * Roles a holder of THIS role may grant, within their own scope.
   *
   * Declared explicitly rather than inferred from permissions. Inferring it —
   * "you may grant a role only if you hold every permission in it" — sounds
   * safe and is wrong: a Stadium Admin must be able to appoint gate attendants
   * without personally holding `gate:scan`, and delegating an operational role
   * is not the same as escalating your own authority. Constitution §15 asks for
   * explicit permissions; this is the same principle applied to delegation.
   */
  readonly grantableRoles: readonly RoleId[];
  readonly isSystem: true;
}

const P = PERMISSIONS;

/**
 * The nine system roles. Customers are NOT in this table — authentication alone
 * grants the implicit customer capability set over their own resources, which
 * keeps `memberships` to actual staff (hundreds, not hundreds of thousands).
 */
export const SYSTEM_ROLES: Readonly<Record<RoleId, RoleDefinition>> = {
  STADII_SUPER_ADMIN: {
    id: 'STADII_SUPER_ADMIN',
    name: 'STADII Super Admin',
    description: 'Full platform control including fee configuration and organizations.',
    permissions: ALL_PERMISSIONS,
    assignableAtScopes: ['PLATFORM'],
    grantableRoles: [
      'STADII_SUPER_ADMIN', 'STADII_SUPPORT', 'FINANCE', 'STADIUM_ADMIN',
      'EVENT_ORGANIZER', 'GATE_SUPERVISOR', 'GATE_ATTENDANT', 'KIOSK_OPERATOR',
    ],
    isSystem: true,
  },

  STADII_SUPPORT: {
    id: 'STADII_SUPPORT',
    name: 'STADII Support',
    description:
      'Read-heavy support. Reads all orders and tickets and initiates standard refunds. ' +
      'Separated from Super Admin because most day-to-day platform work is support ' +
      'work, and support staff should not be able to change fees.',
    permissions: [
      P.EVENT_READ, P.VENUE_READ, P.INVENTORY_READ,
      P.ORDER_READ_ALL, P.TICKET_READ_ALL, P.PAYMENT_READ,
      P.FINANCE_REFUND, P.GATE_TICKET_LOOKUP, P.USER_READ,
      P.MEMBERSHIP_READ, P.AUDIT_READ,
    ],
    assignableAtScopes: ['PLATFORM'],
    grantableRoles: [],
    isSystem: true,
  },

  FINANCE: {
    id: 'FINANCE',
    name: 'Finance',
    description: 'Refunds, settlements, reconciliation and fee configuration.',
    permissions: [
      P.ORDER_READ_ALL, P.TICKET_READ_ALL, P.PAYMENT_READ, P.PAYMENT_RECONCILE,
      P.FINANCE_REFUND, P.FINANCE_REFUND_OVERRIDE, P.FINANCE_FEE_CONFIGURE,
      P.FINANCE_SETTLEMENT_READ, P.FINANCE_SETTLEMENT_GENERATE,
      P.FINANCE_SETTLEMENT_APPROVE, P.AUDIT_READ, P.EVENT_READ,
    ],
    assignableAtScopes: ['PLATFORM', 'ORGANIZATION'],
    grantableRoles: [],
    isSystem: true,
  },

  STADIUM_ADMIN: {
    id: 'STADIUM_ADMIN',
    name: 'Stadium Admin',
    description: 'Venue structure, seat maps, gates and gate device registration.',
    permissions: [
      P.VENUE_READ, P.VENUE_WRITE, P.VENUE_ARCHIVE, P.VENUE_AREA_WRITE,
      P.VENUE_SEATMAP_IMPORT, P.VENUE_GATE_WRITE,
      P.EVENT_READ, P.INVENTORY_READ, P.INVENTORY_BLOCK,
      P.GATE_DEVICE_REGISTER, P.GATE_DEVICE_ASSIGN, P.GATE_STATS_READ,
      P.KIOSK_REGISTER, P.MEMBERSHIP_GRANT, P.MEMBERSHIP_REVOKE,
      P.MEMBERSHIP_READ, P.AUDIT_READ,
    ],
    assignableAtScopes: ['ORGANIZATION', 'VENUE'],
    // Appoints matchday staff at their own venue. Does not hold gate:scan and
    // does not need to.
    grantableRoles: ['GATE_SUPERVISOR', 'GATE_ATTENDANT', 'KIOSK_OPERATOR'],
    isSystem: true,
  },

  EVENT_ORGANIZER: {
    id: 'EVENT_ORGANIZER',
    name: 'Event Organizer',
    description: 'Events, ticket types, allocations, publication and own sales reporting.',
    permissions: [
      P.EVENT_READ, P.EVENT_WRITE, P.EVENT_PUBLISH, P.EVENT_CANCEL,
      P.EVENT_POSTPONE, P.EVENT_POLICY_WRITE,
      P.INVENTORY_READ, P.INVENTORY_TICKETTYPE_WRITE,
      P.INVENTORY_ALLOCATION_WRITE, P.INVENTORY_BLOCK, P.INVENTORY_CAPACITY_WRITE,
      P.ORDER_READ_ALL, P.TICKET_READ_ALL, P.TICKET_VOID,
      P.VENUE_READ, P.GATE_STATS_READ,
      P.FINANCE_SETTLEMENT_READ,
      P.MEMBERSHIP_GRANT, P.MEMBERSHIP_REVOKE, P.MEMBERSHIP_READ, P.AUDIT_READ,
    ],
    assignableAtScopes: ['ORGANIZATION', 'EVENT'],
    grantableRoles: ['GATE_SUPERVISOR', 'GATE_ATTENDANT', 'KIOSK_OPERATOR'],
    isSystem: true,
  },

  GATE_SUPERVISOR: {
    id: 'GATE_SUPERVISOR',
    name: 'Gate Supervisor',
    description: 'Device assignment, ticket lookup, admission reversal and gate stats.',
    permissions: [
      P.GATE_SCAN, P.GATE_TICKET_LOOKUP, P.GATE_ADMISSION_REVERSE,
      P.GATE_DEVICE_ASSIGN, P.GATE_STATS_READ, P.EVENT_READ,
    ],
    assignableAtScopes: ['EVENT', 'VENUE'],
    // Assigns devices, not people. Staffing is an admin decision.
    grantableRoles: [],
    isSystem: true,
  },

  GATE_ATTENDANT: {
    id: 'GATE_ATTENDANT',
    name: 'Gate Attendant',
    description:
      'Scans tickets. Exactly one permission — this is the most widely distributed ' +
      'role in the platform, handed to casual staff on matchday, and it can do ' +
      'precisely one thing.',
    permissions: [P.GATE_SCAN],
    assignableAtScopes: ['EVENT'],
    grantableRoles: [],
    isSystem: true,
  },

  KIOSK_OPERATOR: {
    id: 'KIOSK_OPERATOR',
    name: 'Kiosk Operator',
    description: 'On-site sales and cash reconciliation.',
    permissions: [
      P.KIOSK_OPERATE, P.KIOSK_RECONCILE, P.ORDER_SELL_KIOSK,
      P.ORDER_READ, P.EVENT_READ, P.INVENTORY_READ,
    ],
    assignableAtScopes: ['EVENT', 'VENUE'],
    grantableRoles: [],
    isSystem: true,
  },
};

/**
 * Capabilities an authenticated customer has over their OWN resources. Not a
 * stored membership — see ADR-0015.
 */
export const CUSTOMER_PERMISSIONS: readonly Permission[] = [
  PERMISSIONS.EVENT_READ,
  PERMISSIONS.VENUE_READ,
  PERMISSIONS.INVENTORY_READ,
  PERMISSIONS.ORDER_READ,
  PERMISSIONS.TICKET_READ,
];
