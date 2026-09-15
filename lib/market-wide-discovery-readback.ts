import type { RecommendationScanRun } from "@/lib/recommendation-scan-run";

const summaryVersions = [
  "market_wide_discovery_summary_v1",
  "market_wide_discovery_summary_v2",
  "market_wide_discovery_summary_v3",
] as const;
const policyVersionV1 = "us_equity_market_wide_discovery_v1";
const policyVersionV2 = "us_equity_market_wide_discovery_v2";

type ReceiptStatus =
  | "disabled"
  | "plan_ineligible"
  | "budget_not_declared"
  | "budget_insufficient"
  | "budget_invalid"
  | "daily_credit_limit_reached"
  | "budget_reservation_unavailable"
  | "refresh_interval_active"
  | "error_backoff_active"
  | "ready";

type AttemptOutcome =
  | "available"
  | "empty"
  | "provider_error"
  | "rate_limited"
  | "not_attempted";

type DynamicIntakeStatus =
  | "available"
  | "partial"
  | "provider_unavailable"
  | "stale"
  | "empty"
  | "disabled"
  | "unknown";

export type MarketWideDiscoveryReadback = {
  status: "available" | "unavailable";
  generated_at: string | null;
  scan_window: string | null;
  source_scan: {
    observed_at: string | null;
    trading_date: string | null;
    window: string | null;
  };
  admission: {
    status: ReceiptStatus | null;
    runtime_enabled: boolean | null;
    plan_eligibility: "unverified" | "ineligible" | "configured_pro" | null;
    requests_planned: number | null;
    requested_credits: number | null;
    declared_daily_credit_budget: number | null;
    next_retry_at: string | null;
    reason_codes: string[];
    symbol_master_status: "not_collected" | null;
    relative_volume_status:
      | "not_available_from_market_movers_v1"
      | null;
  };
  attempt: {
    attempted_at: string | null;
    outcome: AttemptOutcome | null;
    provider_response_observed: boolean | null;
  };
  credit_reservation: {
    status:
      | "not_required"
      | "provider_execution_allowed"
      | "daily_credit_limit_reached"
      | "attempt_in_progress"
      | "already_completed"
      | "already_failed"
      | "reservation_unavailable"
      | null;
    trading_date: string | null;
    requested_credits: number | null;
    declared_daily_credit_budget: number | null;
    reserved_credits: number | null;
    remaining_credits: number | null;
    idempotent: boolean | null;
    finalization_status:
      | "not_started"
      | "finalized"
      | "already_completed"
      | "already_failed"
      | "invalid_transition"
      | "reservation_unavailable"
      | null;
    finalization_proven: boolean | null;
  };
  intake: {
    status: DynamicIntakeStatus | null;
    fetched_count: number | null;
    selected_count: number | null;
    budget_limit: number | null;
    selected_tickers: string[];
  };
  warnings: string[];
  gaps: string[];
};

type MarketWideDiscoveryScanRun = Pick<
  RecommendationScanRun,
  "observed_at" | "trading_date" | "window" | "payload_json"
>;

function objectOrNull(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function isoTimestampOrNull(value: unknown) {
  if (typeof value !== "string" || value.trim().length === 0) return null;

  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime()) ? parsed.toISOString() : null;
}

function nullableIsoTimestamp(value: unknown) {
  if (value === null) return null;
  return isoTimestampOrNull(value) ?? undefined;
}

function finiteNonNegative(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? value
    : null;
}

function stringArray(value: unknown) {
  return Array.isArray(value) && value.every((item) => typeof item === "string")
    ? value
    : null;
}

function enumValue<T extends string>(
  value: unknown,
  values: readonly T[],
): T | null {
  return typeof value === "string" && values.includes(value as T)
    ? (value as T)
    : null;
}

function unavailableReadback(
  sourceScan: MarketWideDiscoveryReadback["source_scan"],
): MarketWideDiscoveryReadback {
  return {
    status: "unavailable",
    generated_at: null,
    scan_window: null,
    source_scan: sourceScan,
    admission: {
      status: null,
      runtime_enabled: null,
      plan_eligibility: null,
      requests_planned: null,
      requested_credits: null,
      declared_daily_credit_budget: null,
      next_retry_at: null,
      reason_codes: ["market_wide_discovery_receipt_missing_or_invalid"],
      symbol_master_status: null,
      relative_volume_status: null,
    },
    attempt: {
      attempted_at: null,
      outcome: null,
      provider_response_observed: null,
    },
    credit_reservation: {
      status: null,
      trading_date: null,
      requested_credits: null,
      declared_daily_credit_budget: null,
      reserved_credits: null,
      remaining_credits: null,
      idempotent: null,
      finalization_status: null,
      finalization_proven: null,
    },
    intake: {
      status: null,
      fetched_count: null,
      selected_count: null,
      budget_limit: null,
      selected_tickers: [],
    },
    warnings: [],
    gaps: [],
  };
}

/**
 * Read only the known, bounded fields of a persisted discovery receipt. The
 * database payload is untrusted at the browser boundary: an unfamiliar or
 * partial shape is deliberately shown as unavailable rather than inferred.
 */
export function marketWideDiscoveryReadbackFromUnknown(
  value: unknown,
  sourceScan: MarketWideDiscoveryReadback["source_scan"] = {
    observed_at: null,
    trading_date: null,
    window: null,
  },
): MarketWideDiscoveryReadback {
  const summary = objectOrNull(value);
  const receiptVersion = enumValue(summary?.summary_version, summaryVersions);
  const admission = objectOrNull(summary?.admission);
  const attempt = objectOrNull(summary?.attempt);
  const intake = objectOrNull(summary?.dynamic_intake);
  const creditReservation = objectOrNull(summary?.credit_reservation);
  const reasonCodes = stringArray(admission?.reason_codes);
  const warnings = stringArray(summary?.warnings);
  const gaps = stringArray(summary?.gaps);
  const generatedAt = isoTimestampOrNull(summary?.generated_at);
  const scanWindow = enumValue(summary?.scan_window, [
    "pre_market",
    "opening",
    "morning_momentum",
    "midday",
    "afternoon",
    "power_hour",
    "closed",
    "unknown",
  ] as const);
  const attemptedAt = nullableIsoTimestamp(attempt?.attempted_at);
  const nextRetryAt = nullableIsoTimestamp(admission?.next_retry_at);
  const admissionStatus = enumValue(admission?.status, [
    "disabled",
    "plan_ineligible",
    "budget_not_declared",
    "budget_insufficient",
    "budget_invalid",
    "daily_credit_limit_reached",
    "budget_reservation_unavailable",
    "refresh_interval_active",
    "error_backoff_active",
    "ready",
  ] as const);
  const planEligibility = enumValue(admission?.plan_eligibility, [
    "unverified",
    "ineligible",
    "configured_pro",
  ] as const);
  const attemptOutcome = enumValue(attempt?.outcome, [
    "available",
    "empty",
    "provider_error",
    "rate_limited",
    "not_attempted",
  ] as const);
  const intakeStatus = enumValue(intake?.status, [
    "available",
    "partial",
    "provider_unavailable",
    "stale",
    "empty",
    "disabled",
    "unknown",
  ] as const);
  const symbolMasterStatus = enumValue(admission?.symbol_master && objectOrNull(admission.symbol_master)?.status, [
    "not_collected",
  ] as const);
  const relativeVolumeStatus = enumValue(
    admission?.dynamic_movers && objectOrNull(admission.dynamic_movers)?.relative_volume_status,
    ["not_available_from_market_movers_v1"] as const,
  );
  const selectedTickers = stringArray(intake?.selected_tickers);
  const requestsPlanned = finiteNonNegative(admission?.requests_planned);
  const requestedCredits = finiteNonNegative(admission?.requested_credits);
  const intakeFetchedCount = finiteNonNegative(intake?.fetched_count);
  const intakeSelectedCount = finiteNonNegative(intake?.selected_count);
  const intakeBudgetLimit = finiteNonNegative(intake?.budget_limit);
  const directions = stringArray(admission?.directions);
  const providerResponseObserved = attempt?.provider_response_observed;
  const reservationStatus = enumValue(creditReservation?.status, [
    "not_required",
    "provider_execution_allowed",
    "daily_credit_limit_reached",
    "attempt_in_progress",
    "already_completed",
    "already_failed",
    "reservation_unavailable",
  ] as const);
  const reservationFinalizationStatus = enumValue(
    creditReservation?.finalization_status,
    [
      "not_started",
      "finalized",
      "already_completed",
      "already_failed",
      "invalid_transition",
      "reservation_unavailable",
    ] as const,
  );
  const reservationTradingDate = dateStringOrNull(creditReservation?.trading_date);
  const reservationRequestedCredits = finiteNonNegative(
    creditReservation?.requested_credits,
  );
  const reservationDeclaredDailyBudget = finiteNonNegative(
    creditReservation?.declared_daily_credit_budget,
  );
  const reservationReservedCredits = nullableFiniteNonNegative(
    creditReservation?.reserved_credits,
  );
  const reservationRemainingCredits = nullableFiniteNonNegative(
    creditReservation?.remaining_credits,
  );
  const reservationIdempotent = creditReservation?.idempotent;
  const reservationFinalizationProven =
    creditReservation?.finalization_proven;
  const expectedPolicyVersion =
    receiptVersion === "market_wide_discovery_summary_v3"
      ? policyVersionV2
      : policyVersionV1;
  const reservationReceiptValid =
    receiptVersion !== "market_wide_discovery_summary_v3" ||
    (creditReservation?.contract_version ===
      "market_wide_discovery_credit_reservation_v1" &&
      reservationStatus !== null &&
      reservationFinalizationStatus !== null &&
      (reservationStatus === "not_required"
        ? reservationTradingDate === null &&
          reservationRequestedCredits === null &&
          reservationDeclaredDailyBudget === null &&
          reservationReservedCredits === null &&
          reservationRemainingCredits === null &&
          reservationIdempotent === null &&
          reservationFinalizationStatus === "not_started" &&
          reservationFinalizationProven === null
        : reservationTradingDate !== null &&
          reservationRequestedCredits === 100 &&
          reservationDeclaredDailyBudget !== null &&
          reservationDeclaredDailyBudget >= reservationRequestedCredits &&
          reservationReservedCredits !== undefined &&
          reservationRemainingCredits !== undefined &&
          (typeof reservationIdempotent === "boolean" ||
            reservationIdempotent === null) &&
          (reservationFinalizationStatus === "not_started"
            ? reservationFinalizationProven === null
            : typeof reservationFinalizationProven === "boolean")));

  if (
    receiptVersion === null ||
    summary?.summary_kind !== "market_wide_discovery" ||
    generatedAt === null ||
    scanWindow === null ||
    admission?.policy_version !== expectedPolicyVersion ||
    admissionStatus === null ||
    typeof admission?.runtime_enabled !== "boolean" ||
    planEligibility === null ||
    directions === null ||
    directions.length !== 1 ||
    directions[0] !== "gainers" ||
    requestsPlanned !== 1 ||
    admission?.credits_per_request !== 100 ||
    requestedCredits !== 100 ||
    (admission?.declared_daily_credit_budget !== null &&
      finiteNonNegative(admission?.declared_daily_credit_budget) === null) ||
    nextRetryAt === undefined ||
    reasonCodes === null ||
    objectOrNull(admission?.symbol_master)?.credits_per_refresh !== 1 ||
    symbolMasterStatus === null ||
    relativeVolumeStatus === null ||
    attemptOutcome === null ||
    attemptedAt === undefined ||
    typeof providerResponseObserved !== "boolean" ||
    (providerResponseObserved === false &&
      !(
        (attemptOutcome === "not_attempted" && attemptedAt === null) ||
        ((receiptVersion === "market_wide_discovery_summary_v2" ||
          receiptVersion === "market_wide_discovery_summary_v3") &&
          attemptOutcome === "provider_error" &&
          attemptedAt !== null)
      )) ||
    (providerResponseObserved === true &&
      (attemptOutcome === "not_attempted" || attemptedAt === null)) ||
    intake?.summary_version !== "1.0" ||
    intake.summary_kind !== "dynamic_market_movers" ||
    intakeStatus === null ||
    intakeFetchedCount === null ||
    intakeSelectedCount === null ||
    intakeBudgetLimit === null ||
    selectedTickers === null ||
    selectedTickers.length !== intakeSelectedCount ||
    intakeSelectedCount > intakeBudgetLimit ||
    warnings === null ||
    gaps === null ||
    !reservationReceiptValid
  ) {
    return unavailableReadback(sourceScan);
  }

  return {
    status: "available",
    generated_at: generatedAt,
    scan_window: scanWindow,
    source_scan: sourceScan,
    admission: {
      status: admissionStatus,
      runtime_enabled: admission.runtime_enabled,
      plan_eligibility: planEligibility,
      requests_planned: requestsPlanned,
      requested_credits: requestedCredits,
      declared_daily_credit_budget: finiteNonNegative(
        admission.declared_daily_credit_budget,
      ),
      next_retry_at: nextRetryAt,
      reason_codes: reasonCodes,
      symbol_master_status: symbolMasterStatus,
      relative_volume_status: relativeVolumeStatus,
    },
    attempt: {
      attempted_at: attemptedAt,
      outcome: attemptOutcome,
      provider_response_observed: providerResponseObserved,
    },
    credit_reservation:
      receiptVersion === "market_wide_discovery_summary_v3"
        ? {
            status: reservationStatus,
            trading_date: reservationTradingDate ?? null,
            requested_credits: reservationRequestedCredits,
            declared_daily_credit_budget: reservationDeclaredDailyBudget,
            reserved_credits: reservationReservedCredits ?? null,
            remaining_credits: reservationRemainingCredits ?? null,
            idempotent:
              typeof reservationIdempotent === "boolean"
                ? reservationIdempotent
                : null,
            finalization_status: reservationFinalizationStatus,
            finalization_proven:
              typeof reservationFinalizationProven === "boolean"
                ? reservationFinalizationProven
                : null,
          }
        : {
            status: null,
            trading_date: null,
            requested_credits: null,
            declared_daily_credit_budget: null,
            reserved_credits: null,
            remaining_credits: null,
            idempotent: null,
            finalization_status: null,
            finalization_proven: null,
          },
    intake: {
      status: intakeStatus,
      fetched_count: intakeFetchedCount,
      selected_count: intakeSelectedCount,
      budget_limit: intakeBudgetLimit,
      selected_tickers: selectedTickers,
    },
    warnings,
    gaps,
  };
}

function nullableFiniteNonNegative(value: unknown) {
  if (value === null) return null;
  return finiteNonNegative(value) ?? undefined;
}

function dateStringOrNull(value: unknown) {
  if (value === null) return null;
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return undefined;
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
    ? value
    : undefined;
}

export function marketWideDiscoveryReadbackFromScanRun(
  scanRun: MarketWideDiscoveryScanRun,
) {
  return marketWideDiscoveryReadbackFromUnknown(
    scanRun.payload_json.market_wide_discovery,
    {
      observed_at: isoTimestampOrNull(scanRun.observed_at),
      trading_date: scanRun.trading_date,
      window: scanRun.window,
    },
  );
}
