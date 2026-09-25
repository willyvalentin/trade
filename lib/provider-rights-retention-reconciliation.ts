import { createHash } from "node:crypto";

export const PROVIDER_RIGHTS_RETENTION_RECONCILIATION_VERSION =
  "provider_rights_retention_reconciliation_v1" as const;
export const PROVIDER_RIGHTS_PUBLIC_EVIDENCE_VERSION =
  "twelve_data_basic_free_public_retention_evidence_v2" as const;
export const PROVIDER_RIGHTS_CONFIRMATION_VERSION =
  "twelve_data_account_retention_confirmation_v1" as const;

export const TWELVE_DATA_BASIC_FREE_SOURCE_URLS = Object.freeze([
  "https://twelvedata.com/pricing",
  "https://support.twelvedata.com/en/articles/5332349-commercial-and-personal-usage",
  "https://twelvedata.com/terms",
  "https://twelvedata.com/docs",
  "https://support.twelvedata.com/en/articles/5615854-credits",
  "https://support.twelvedata.com/en/articles/5656039-how-to-get-historical-prices",
  "https://support.twelvedata.com/en/articles/9935903-us-equities-market-data",
] as const);

export type TwelveDataBasicFreePublicRetentionEvidence = Readonly<{
  evidence_version: typeof PROVIDER_RIGHTS_PUBLIC_EVIDENCE_VERSION;
  provider_plan: "twelve_data_basic_free";
  reviewed_at: string;
  terms_effective_date: "2026-01-01";
  official_source_urls: readonly string[];
  internal_non_display_allowed: true;
  noncommercial_use_required: true;
  raw_provider_payload_retention_bytes: 0;
  non_reversible_derived_data_allowed: true;
  documentation_cache_examples_found: true;
  documentation_numeric_in_subscription_retention_found: false;
  numeric_in_subscription_exact_price_retention_days: null;
  termination_deletion_days: 30;
  termination_window_is_in_subscription_retention_authority: false;
  account_specific_third_party_terms_resolved: false;
}>;

export type TwelveDataAccountRetentionConfirmation = Readonly<{
  confirmation_version: typeof PROVIDER_RIGHTS_CONFIRMATION_VERSION;
  confirmation_id: string;
  provider_plan: "twelve_data_basic_free";
  account_scope_sha256: string;
  confirmation_reference_sha256: string;
  confirmation_document_sha256: string;
  issued_at: string;
  valid_until: string;
  use_case: "pre_release_owner_only_internal_paper_day_trading_research";
  internal_non_display_allowed: true;
  noncommercial_use_required: true;
  raw_provider_payload_retention_bytes: 0;
  non_reversible_derived_data_allowed: true;
  exact_price_and_candle_retention_days: number;
  third_party_us_equity_terms_resolved: true;
}>;

export type ProviderRightsRetentionReconciliationInput = Readonly<{
  reconciliation_version: typeof PROVIDER_RIGHTS_RETENTION_RECONCILIATION_VERSION;
  evaluated_at: string;
  requested_exact_price_evidence_retention_days: number;
  public_evidence: TwelveDataBasicFreePublicRetentionEvidence;
  account_confirmation: TwelveDataAccountRetentionConfirmation | null;
}>;

export type ProviderRightsRetentionReconciliationResult = Readonly<{
  reconciliation_version: typeof PROVIDER_RIGHTS_RETENTION_RECONCILIATION_VERSION;
  status: "completed" | "blocked";
  disposition:
    | "eligible_for_separate_database_admission_review"
    | "blocked_pending_provider_confirmation"
    | "blocked";
  reason_codes: readonly string[];
  required_next_evidence: readonly string[];
  provider_plan: "twelve_data_basic_free" | null;
  requested_exact_price_evidence_retention_days: number | null;
  confirmed_max_exact_price_evidence_retention_days: number | null;
  public_evidence_reviewed_at: string | null;
  confirmation_id: string | null;
  confirmation_valid_until: string | null;
  public_evidence_digest: string;
  account_confirmation_digest: string | null;
  input_digest: string;
  result_digest: string;
  safety: Readonly<{
    supplied_evidence_only: true;
    evidence_authenticity_verified_by_this_function: false;
    public_termination_window_used_as_retention_authority: false;
    database_admission_authorized: false;
    pilot_provisioning_authorized: false;
    provider_request_authorized: false;
    provider_credit_authorized: false;
    database_write_authorized: false;
    paper_worker_activation_authorized: false;
    broker_action_authorized: false;
  }>;
}>;

const SHA256_PATTERN = /^[0-9a-f]{64}$/;
const CONFIRMATION_ID_PATTERN =
  /^td-retention-confirmation-[a-z0-9][a-z0-9_-]{2,79}$/;
const MAX_PUBLIC_REVIEW_AGE_MS = 30 * 24 * 60 * 60 * 1_000;
const MAX_CONFIRMATION_VALIDITY_MS = 366 * 24 * 60 * 60 * 1_000;
const MAX_RETENTION_DAYS = 3650;

const INPUT_KEYS = [
  "account_confirmation",
  "evaluated_at",
  "public_evidence",
  "reconciliation_version",
  "requested_exact_price_evidence_retention_days",
];
const PUBLIC_EVIDENCE_KEYS = [
  "account_specific_third_party_terms_resolved",
  "documentation_cache_examples_found",
  "documentation_numeric_in_subscription_retention_found",
  "evidence_version",
  "internal_non_display_allowed",
  "non_reversible_derived_data_allowed",
  "noncommercial_use_required",
  "numeric_in_subscription_exact_price_retention_days",
  "official_source_urls",
  "provider_plan",
  "raw_provider_payload_retention_bytes",
  "reviewed_at",
  "termination_deletion_days",
  "termination_window_is_in_subscription_retention_authority",
  "terms_effective_date",
];
const CONFIRMATION_KEYS = [
  "account_scope_sha256",
  "confirmation_document_sha256",
  "confirmation_id",
  "confirmation_reference_sha256",
  "confirmation_version",
  "exact_price_and_candle_retention_days",
  "internal_non_display_allowed",
  "issued_at",
  "non_reversible_derived_data_allowed",
  "noncommercial_use_required",
  "provider_plan",
  "raw_provider_payload_retention_bytes",
  "third_party_us_equity_terms_resolved",
  "use_case",
  "valid_until",
];

const SAFETY = Object.freeze({
  supplied_evidence_only: true as const,
  evidence_authenticity_verified_by_this_function: false as const,
  public_termination_window_used_as_retention_authority: false as const,
  database_admission_authorized: false as const,
  pilot_provisioning_authorized: false as const,
  provider_request_authorized: false as const,
  provider_credit_authorized: false as const,
  database_write_authorized: false as const,
  paper_worker_activation_authorized: false as const,
  broker_action_authorized: false as const,
});

function canonical(value: unknown): unknown {
  if (typeof value === "number" && !Number.isFinite(value)) {
    return { __invalid_non_finite_number__: String(value) };
  }
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, item]) => [key, canonical(item)]),
    );
  }
  return value;
}

function digest(value: unknown) {
  return createHash("sha256")
    .update(JSON.stringify(canonical(value)))
    .digest("hex");
}

function safeDigest(value: unknown) {
  try {
    return digest(value);
  } catch {
    return digest({ uninspectable_input: true });
  }
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    for (const item of Object.values(value as Record<string, unknown>)) {
      deepFreeze(item);
    }
    Object.freeze(value);
  }
  return value;
}

function exactDataRecord(value: unknown, expectedKeys: readonly string[]) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) return false;
  if (Object.getOwnPropertySymbols(value).length > 0) return false;
  const descriptors = Object.getOwnPropertyDescriptors(value);
  const keys = Object.keys(descriptors).sort();
  const sortedExpected = [...expectedKeys].sort();
  if (keys.length !== sortedExpected.length) return false;
  if (!keys.every((key, index) => key === sortedExpected[index])) return false;
  return Object.values(descriptors).every(
    (descriptor) =>
      "value" in descriptor &&
      descriptor.enumerable === true &&
      descriptor.get === undefined &&
      descriptor.set === undefined,
  );
}

function explicitInstant(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.endsWith("Z") &&
    Number.isFinite(Date.parse(value))
  );
}

function positiveInteger(value: unknown, maximum: number): value is number {
  return Number.isInteger(value) && Number(value) >= 1 && Number(value) <= maximum;
}

function exactSourceUrls(value: unknown) {
  return (
    Array.isArray(value) &&
    value.length === TWELVE_DATA_BASIC_FREE_SOURCE_URLS.length &&
    value.every(
      (url, index) => url === TWELVE_DATA_BASIC_FREE_SOURCE_URLS[index],
    )
  );
}

function validPublicEvidence(
  value: unknown,
  evaluatedAt: number,
): value is TwelveDataBasicFreePublicRetentionEvidence {
  if (!exactDataRecord(value, PUBLIC_EVIDENCE_KEYS)) return false;
  const evidence = value as Record<string, unknown>;
  if (!explicitInstant(evidence.reviewed_at)) return false;
  const reviewedAt = Date.parse(evidence.reviewed_at);
  return (
    evidence.evidence_version === PROVIDER_RIGHTS_PUBLIC_EVIDENCE_VERSION &&
    evidence.provider_plan === "twelve_data_basic_free" &&
    evidence.terms_effective_date === "2026-01-01" &&
    exactSourceUrls(evidence.official_source_urls) &&
    evidence.internal_non_display_allowed === true &&
    evidence.noncommercial_use_required === true &&
    evidence.raw_provider_payload_retention_bytes === 0 &&
    evidence.non_reversible_derived_data_allowed === true &&
    evidence.documentation_cache_examples_found === true &&
    evidence.documentation_numeric_in_subscription_retention_found === false &&
    evidence.numeric_in_subscription_exact_price_retention_days === null &&
    evidence.termination_deletion_days === 30 &&
    evidence.termination_window_is_in_subscription_retention_authority === false &&
    evidence.account_specific_third_party_terms_resolved === false &&
    reviewedAt <= evaluatedAt &&
    evaluatedAt - reviewedAt <= MAX_PUBLIC_REVIEW_AGE_MS
  );
}

function validConfirmation(
  value: unknown,
  evaluatedAt: number,
): value is TwelveDataAccountRetentionConfirmation {
  if (!exactDataRecord(value, CONFIRMATION_KEYS)) return false;
  const confirmation = value as Record<string, unknown>;
  if (
    !explicitInstant(confirmation.issued_at) ||
    !explicitInstant(confirmation.valid_until)
  ) {
    return false;
  }
  const issuedAt = Date.parse(confirmation.issued_at);
  const validUntil = Date.parse(confirmation.valid_until);
  return (
    confirmation.confirmation_version === PROVIDER_RIGHTS_CONFIRMATION_VERSION &&
    typeof confirmation.confirmation_id === "string" &&
    CONFIRMATION_ID_PATTERN.test(confirmation.confirmation_id) &&
    confirmation.provider_plan === "twelve_data_basic_free" &&
    typeof confirmation.account_scope_sha256 === "string" &&
    SHA256_PATTERN.test(confirmation.account_scope_sha256) &&
    typeof confirmation.confirmation_reference_sha256 === "string" &&
    SHA256_PATTERN.test(confirmation.confirmation_reference_sha256) &&
    typeof confirmation.confirmation_document_sha256 === "string" &&
    SHA256_PATTERN.test(confirmation.confirmation_document_sha256) &&
    confirmation.use_case ===
      "pre_release_owner_only_internal_paper_day_trading_research" &&
    confirmation.internal_non_display_allowed === true &&
    confirmation.noncommercial_use_required === true &&
    confirmation.raw_provider_payload_retention_bytes === 0 &&
    confirmation.non_reversible_derived_data_allowed === true &&
    positiveInteger(
      confirmation.exact_price_and_candle_retention_days,
      MAX_RETENTION_DAYS,
    ) &&
    confirmation.third_party_us_equity_terms_resolved === true &&
    issuedAt <= evaluatedAt &&
    evaluatedAt <= validUntil &&
    validUntil > issuedAt &&
    validUntil - issuedAt <= MAX_CONFIRMATION_VALIDITY_MS
  );
}

function buildResult(
  input: unknown,
  values: Omit<
    ProviderRightsRetentionReconciliationResult,
    "reconciliation_version" | "input_digest" | "result_digest" | "safety"
  >,
) {
  const inputDigest = safeDigest(input);
  const withoutDigest = {
    reconciliation_version: PROVIDER_RIGHTS_RETENTION_RECONCILIATION_VERSION,
    ...values,
    input_digest: inputDigest,
    safety: SAFETY,
  };
  return deepFreeze({
    ...withoutDigest,
    result_digest: digest(withoutDigest),
  });
}

function invalid(input: unknown, reasonCode: string) {
  return buildResult(input, {
    status: "blocked",
    disposition: "blocked",
    reason_codes: [reasonCode],
    required_next_evidence: [],
    provider_plan: null,
    requested_exact_price_evidence_retention_days: null,
    confirmed_max_exact_price_evidence_retention_days: null,
    public_evidence_reviewed_at: null,
    confirmation_id: null,
    confirmation_valid_until: null,
    public_evidence_digest: safeDigest(null),
    account_confirmation_digest: null,
  });
}

export function reconcileProviderRightsRetention(
  input: unknown,
): ProviderRightsRetentionReconciliationResult {
  if (!exactDataRecord(input, INPUT_KEYS)) {
    return invalid(input, "invalid_reconciliation_input");
  }
  const request = input as Record<string, unknown>;
  if (
    request.reconciliation_version !==
      PROVIDER_RIGHTS_RETENTION_RECONCILIATION_VERSION ||
    !explicitInstant(request.evaluated_at) ||
    !positiveInteger(
      request.requested_exact_price_evidence_retention_days,
      MAX_RETENTION_DAYS,
    )
  ) {
    return invalid(input, "invalid_reconciliation_input");
  }

  const evaluatedAt = Date.parse(request.evaluated_at);
  if (!validPublicEvidence(request.public_evidence, evaluatedAt)) {
    return invalid(input, "invalid_or_stale_public_evidence");
  }

  const publicEvidence = request.public_evidence;
  const requestedRetention =
    request.requested_exact_price_evidence_retention_days as number;
  const publicEvidenceDigest = digest(publicEvidence);

  if (request.account_confirmation === null) {
    return buildResult(input, {
      status: "blocked",
      disposition: "blocked_pending_provider_confirmation",
      reason_codes: [
        "account_specific_provider_confirmation_missing",
        "exact_price_evidence_retention_duration_unverified",
        "public_termination_deletion_window_not_retention_authority",
        "third_party_us_equity_terms_unresolved",
      ],
      required_next_evidence: [
        "account_scoped_provider_confirmation_for_exact_price_and_candle_retention",
        "account_scoped_confirmation_of_applicable_us_equity_third_party_terms",
      ],
      provider_plan: "twelve_data_basic_free",
      requested_exact_price_evidence_retention_days: requestedRetention,
      confirmed_max_exact_price_evidence_retention_days: null,
      public_evidence_reviewed_at: publicEvidence.reviewed_at,
      confirmation_id: null,
      confirmation_valid_until: null,
      public_evidence_digest: publicEvidenceDigest,
      account_confirmation_digest: null,
    });
  }

  if (!validConfirmation(request.account_confirmation, evaluatedAt)) {
    return buildResult(input, {
      status: "blocked",
      disposition: "blocked",
      reason_codes: ["invalid_or_expired_account_confirmation"],
      required_next_evidence: [
        "current_account_scoped_provider_confirmation_with_exact_retention_and_third_party_terms",
      ],
      provider_plan: "twelve_data_basic_free",
      requested_exact_price_evidence_retention_days: requestedRetention,
      confirmed_max_exact_price_evidence_retention_days: null,
      public_evidence_reviewed_at: publicEvidence.reviewed_at,
      confirmation_id: null,
      confirmation_valid_until: null,
      public_evidence_digest: publicEvidenceDigest,
      account_confirmation_digest: safeDigest(request.account_confirmation),
    });
  }

  const confirmation = request.account_confirmation;
  if (requestedRetention > confirmation.exact_price_and_candle_retention_days) {
    return buildResult(input, {
      status: "blocked",
      disposition: "blocked",
      reason_codes: ["requested_retention_exceeds_confirmed_rights"],
      required_next_evidence: [],
      provider_plan: "twelve_data_basic_free",
      requested_exact_price_evidence_retention_days: requestedRetention,
      confirmed_max_exact_price_evidence_retention_days:
        confirmation.exact_price_and_candle_retention_days,
      public_evidence_reviewed_at: publicEvidence.reviewed_at,
      confirmation_id: confirmation.confirmation_id,
      confirmation_valid_until: confirmation.valid_until,
      public_evidence_digest: publicEvidenceDigest,
      account_confirmation_digest: digest(confirmation),
    });
  }

  return buildResult(input, {
    status: "completed",
    disposition: "eligible_for_separate_database_admission_review",
    reason_codes: ["supplied_account_confirmation_satisfies_requested_retention"],
    required_next_evidence: [
      "independent_confirmation_authenticity_review",
      "separately_reviewed_database_admission_migration",
    ],
    provider_plan: "twelve_data_basic_free",
    requested_exact_price_evidence_retention_days: requestedRetention,
    confirmed_max_exact_price_evidence_retention_days:
      confirmation.exact_price_and_candle_retention_days,
    public_evidence_reviewed_at: publicEvidence.reviewed_at,
    confirmation_id: confirmation.confirmation_id,
    confirmation_valid_until: confirmation.valid_until,
    public_evidence_digest: publicEvidenceDigest,
    account_confirmation_digest: digest(confirmation),
  });
}
