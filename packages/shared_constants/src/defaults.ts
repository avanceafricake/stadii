/**
 * Seed values for platform configuration.
 *
 * IMPORTANT (Constitution §10, §21): nothing here is a business constant. These
 * are the values used to SEED `config/platform` and the initial fee schedule on a
 * fresh environment. Business logic reads configuration at runtime and never
 * imports from this file.
 *
 * The lint rule that enforces this: `backend/domain` and `backend/application`
 * must not import `defaults`. Only `scripts/seed` and tests may.
 */

/**
 * The platform fee the business currently expects: KES 5.00.
 *
 * Expressed as minor units (ADR-0012) and shipped as ONE ROW OF CONFIGURATION,
 * not as a constant in a pricing function. Changing it is an audited admin
 * action, not a deploy.
 */
export const SEED_PLATFORM_FEE_MINOR = 500;

export const SEED_PLATFORM_CONFIG = {
  defaultHoldDurationSeconds: 300,
  defaultMaxTicketsPerOrder: 10,
  defaultCurrency: 'KES',
  paymentTimeoutSeconds: {
    MPESA_STK: 120,
    CARD: 600,
  },
  /** 30s, 1m, 2m, 5m, 15m, then hourly — docs/domain/07-orders-and-payments.md */
  reconciliationBackoffSeconds: [30, 60, 120, 300, 900, 3600],
  gaShardTargetPerShard: 500,
  gaShardMax: 20,
  transferOfferTtlHours: 72,
  maxHoldExtensions: 1,
  featureFlags: {} as Record<string, boolean>,
} as const;

/**
 * Indicative hold durations per channel. All configurable per event; none of
 * these appear in code paths that make decisions.
 *
 *   Web / app card   600s — card flows are fast
 *   Web / app M-Pesa 300s — STK push times out around 60s; allows one retry
 *   Kiosk            180s — there is a queue behind the customer
 */
export const SEED_HOLD_DURATIONS_SECONDS = {
  CUSTOMER_APP: 300,
  WEB: 300,
  KIOSK: 180,
} as const;

/** Rate limits — docs/security/authorization-model.md §Rate limiting */
export const SEED_RATE_LIMITS = {
  createHold: { perMinute: 10, per: 'USER' },
  initiatePayment: { perMinute: 5, per: 'USER' },
  acceptTransfer: { perMinute: 10, per: 'IP' },
  getTicketCredential: { perMinute: 30, per: 'USER' },
  scanTicket: { perMinute: 300, per: 'DEVICE' },
  adminCommand: { perMinute: 60, per: 'USER' },
} as const;

/** Idempotency retention windows — ADR-0014 */
export const IDEMPOTENCY_TTL_SECONDS = {
  createOrder: 24 * 3600,
  initiatePayment: 7 * 24 * 3600,
  paymentCallback: 30 * 24 * 3600,
  scanTicket: 7 * 24 * 3600,
  requestRefund: 7 * 24 * 3600,
  default: 24 * 3600,
} as const;

/** The QR credential format version. Bump only with a migration plan. */
export const CREDENTIAL_FORMAT_VERSION = 'STD1';
