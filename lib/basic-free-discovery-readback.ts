import {
  buildBasicFreeCatalogCollectionPlan,
  type BasicFreeCatalogCollectionPlan,
} from "@/lib/basic-free-catalog-collection-plan";
import {
  buildBasicFreeMarketWideCapacity,
  type BasicFreeMarketWideCapacity,
} from "@/lib/basic-free-market-wide-capacity";

const historicalSummaryVersion = "basic_free_catalog_observation_summary_v1";
const currentSummaryVersion = "basic_free_catalog_observation_summary_v2";
const historicalPolicyVersion = "basic_free_catalog_observation_v1";
const currentPolicyVersion = "basic_free_catalog_observation_v2";
const reservationVersion = "basic_free_discovery_credit_reservation_v1";
const oneShotControlVersion = "basic_free_catalog_one_shot_control_v1";
const capabilityProbeControlVersion =
  "basic_free_catalog_capability_probe_control_v1";

type ReceiptStatus =
  | "disabled"
  | "plan_ineligible"
  | "budget_not_declared"
  | "budget_invalid"
  | "refresh_interval_active"
  | "daily_credit_limit_reached"
  | "per_minute_credit_limit_reached"
  | "budget_reservation_unavailable"
  | "request_invalid"
  | "ready";

type AttemptOutcome =
  | "available"
  | "empty"
  | "provider_error"
  | "rate_limited"
  | "not_attempted";

type ReservationStatus =
  | "not_required"
  | "provider_execution_allowed"
  | "daily_catalog_observation_already_claimed"
  | "daily_credit_limit_reached"
  | "per_minute_credit_limit_reached"
  | "attempt_in_progress"
  | "already_completed"
  | "already_failed"
  | "reservation_unavailable";

type FinalizationStatus =
  | "not_started"
  | "finalized"
  | "already_completed"
  | "already_failed"
  | "invalid_transition"
  | "reservation_unavailable";

type OneShotControlStatus =
  | "disabled"
  | "ready"
  | "target_date_missing"
  | "target_date_invalid"
  | "evaluation_date_invalid"
  | "outside_target_date";

type CapabilityProbeControlStatus = OneShotControlStatus;

type BasicFreeCatalogReferenceMode =
  | "catalog_observation"
  | "capability_probe";

const oneShotReasonCodeByStatus: Record<OneShotControlStatus, string> = {
  disabled: "basic_free_catalog_one_shot_disabled",
  ready: "basic_free_catalog_one_shot_ready",
  target_date_missing: "basic_free_catalog_one_shot_target_date_missing",
  target_date_invalid: "basic_free_catalog_one_shot_target_date_invalid",
  evaluation_date_invalid: "basic_free_catalog_one_shot_evaluation_date_invalid",
  outside_target_date: "basic_free_catalog_one_shot_outside_target_date",
};

const capabilityProbeReasonCodeByStatus: Record<
  CapabilityProbeControlStatus,
  string
> = {
  disabled: "basic_free_catalog_capability_probe_disabled",
  ready: "basic_free_catalog_capability_probe_ready",
  target_date_missing:
    "basic_free_catalog_capability_probe_target_date_missing",
  target_date_invalid:
    "basic_free_catalog_capability_probe_target_date_invalid",
  evaluation_date_invalid:
    "basic_free_catalog_capability_probe_evaluation_date_invalid",
  outside_target_date:
    "basic_free_catalog_capability_probe_outside_target_date",
};

export type BasicFreeCatalogOneShotReadback = {
  receipt_status: "not_recorded" | "available" | "invalid";
  control_version: typeof oneShotControlVersion | null;
  status: OneShotControlStatus | null;
  catalog_only_enforced: boolean | null;
  catalog_observation_may_proceed: boolean | null;
  target_trading_date: string | null;
  evaluated_trading_date: string | null;
  reason_codes: string[];
};

export type BasicFreeCatalogCapabilityProbeReadback = {
  receipt_status: "not_recorded" | "available" | "invalid";
  control_version: typeof capabilityProbeControlVersion | null;
  status: CapabilityProbeControlStatus | null;
  catalog_only_enforced: boolean | null;
  capability_probe_may_proceed: boolean | null;
  target_trading_date: string | null;
  evaluated_trading_date: string | null;
  requested_output_size: 100 | null;
  maximum_provider_credits: 1 | null;
  reason_codes: string[];
};

export type BasicFreeDiscoveryReadback = {
  status: "available" | "unavailable";
  generated_at: string | null;
  trading_date: string | null;
  scan_window: string | null;
  reference_mode: BasicFreeCatalogReferenceMode | null;
  source_scan: {
    observed_at: string | null;
    trading_date: string | null;
    window: string | null;
  };
  admission: {
    status: ReceiptStatus | null;
    runtime_enabled: boolean | null;
    plan_eligibility: "unverified" | "ineligible" | "configured_basic_free" | null;
    endpoint: "/stocks" | null;
    requested_credits: number | null;
    declared_daily_credit_budget: number | null;
    declared_per_minute_credit_budget: number | null;
    reason_codes: string[];
  };
  attempt: {
    attempted_at: string | null;
    outcome: AttemptOutcome | null;
    provider_response_observed: boolean | null;
  };
  credit_reservation: {
    status: ReservationStatus | null;
    daily_reserved_credits: number | null;
    daily_remaining_credits: number | null;
    minute_reserved_credits: number | null;
    minute_remaining_credits: number | null;
    finalization_status: FinalizationStatus | null;
    finalization_proven: boolean | null;
  };
  catalog: {
    requested_output_size: 8 | 100 | null;
    decoded_response_json_bytes: number | null;
    observed_record_count: number | null;
    provider_catalog_count: number | null;
    eligible_record_count: number | null;
    rejected_record_count: number | null;
    collection_complete: false | null;
    discovery_feed_allowed: false | null;
  };
  catalog_collection_plan: BasicFreeCatalogCollectionPlan;
  market_wide_dynamic_capacity: BasicFreeMarketWideCapacity;
  one_shot_control: BasicFreeCatalogOneShotReadback;
  capability_probe_control: BasicFreeCatalogCapabilityProbeReadback;
  warnings: string[];
  gaps: string[];
};

type BasicFreeDiscoveryScheduledAttempt = {
  utc_timestamp?: unknown;
  trading_date?: unknown;
  intraday_scan_window?: unknown;
  payload_json?: unknown;
};

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

function finiteNonNegative(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? value
    : null;
}

function nullableFiniteNonNegative(value: unknown) {
  if (value === null) return null;
  return finiteNonNegative(value) ?? undefined;
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

function oneShotControlNotRecorded(): BasicFreeCatalogOneShotReadback {
  return {
    receipt_status: "not_recorded",
    control_version: null,
    status: null,
    catalog_only_enforced: null,
    catalog_observation_may_proceed: null,
    target_trading_date: null,
    evaluated_trading_date: null,
    reason_codes: [],
  };
}

function oneShotControlInvalid(): BasicFreeCatalogOneShotReadback {
  return {
    receipt_status: "invalid",
    control_version: null,
    status: null,
    catalog_only_enforced: null,
    catalog_observation_may_proceed: null,
    target_trading_date: null,
    evaluated_trading_date: null,
    reason_codes: ["basic_free_catalog_one_shot_receipt_invalid"],
  };
}

function basicFreeCatalogOneShotReadbackFromUnknown(
  value: unknown,
): BasicFreeCatalogOneShotReadback {
  if (value === null || value === undefined) return oneShotControlNotRecorded();

  const control = objectOrNull(value);
  const status = enumValue(control?.status, [
    "disabled",
    "ready",
    "target_date_missing",
    "target_date_invalid",
    "evaluation_date_invalid",
    "outside_target_date",
  ] as const);
  const targetTradingDate = dateStringOrNull(control?.target_trading_date);
  const evaluatedTradingDate = dateStringOrNull(control?.evaluated_trading_date);
  const reasonCodes = stringArray(control?.reason_codes);
  const catalogOnlyEnforced = control?.catalog_only_enforced;
  const catalogObservationMayProceed = control?.catalog_observation_may_proceed;

  if (
    control?.control_version !== oneShotControlVersion ||
    status === null ||
    typeof catalogOnlyEnforced !== "boolean" ||
    typeof catalogObservationMayProceed !== "boolean" ||
    targetTradingDate === undefined ||
    evaluatedTradingDate === undefined ||
    reasonCodes === null ||
    reasonCodes.length !== 1 ||
    reasonCodes[0] !== oneShotReasonCodeByStatus[status]
  ) {
    return oneShotControlInvalid();
  }

  const validControl =
    (status === "disabled" &&
      !catalogOnlyEnforced &&
      !catalogObservationMayProceed) ||
    (status === "ready" &&
      catalogOnlyEnforced &&
      catalogObservationMayProceed &&
      targetTradingDate !== null &&
      targetTradingDate === evaluatedTradingDate) ||
    ((status === "target_date_missing" || status === "target_date_invalid") &&
      catalogOnlyEnforced &&
      !catalogObservationMayProceed &&
      targetTradingDate === null) ||
    (status === "evaluation_date_invalid" &&
      catalogOnlyEnforced &&
      !catalogObservationMayProceed &&
      targetTradingDate !== null &&
      evaluatedTradingDate === null) ||
    (status === "outside_target_date" &&
      catalogOnlyEnforced &&
      !catalogObservationMayProceed &&
      targetTradingDate !== null &&
      evaluatedTradingDate !== null &&
      targetTradingDate !== evaluatedTradingDate);

  if (!validControl) return oneShotControlInvalid();

  return {
    receipt_status: "available",
    control_version: oneShotControlVersion,
    status,
    catalog_only_enforced: catalogOnlyEnforced,
    catalog_observation_may_proceed: catalogObservationMayProceed,
    target_trading_date: targetTradingDate,
    evaluated_trading_date: evaluatedTradingDate,
    reason_codes: reasonCodes,
  };
}

function capabilityProbeControlNotRecorded(): BasicFreeCatalogCapabilityProbeReadback {
  return {
    receipt_status: "not_recorded",
    control_version: null,
    status: null,
    catalog_only_enforced: null,
    capability_probe_may_proceed: null,
    target_trading_date: null,
    evaluated_trading_date: null,
    requested_output_size: null,
    maximum_provider_credits: null,
    reason_codes: [],
  };
}

function capabilityProbeControlInvalid(): BasicFreeCatalogCapabilityProbeReadback {
  return {
    ...capabilityProbeControlNotRecorded(),
    receipt_status: "invalid",
    reason_codes: ["basic_free_catalog_capability_probe_receipt_invalid"],
  };
}

function basicFreeCatalogCapabilityProbeReadbackFromUnknown(
  value: unknown,
): BasicFreeCatalogCapabilityProbeReadback {
  if (value === null || value === undefined) {
    return capabilityProbeControlNotRecorded();
  }

  const control = objectOrNull(value);
  const status = enumValue(control?.status, [
    "disabled",
    "ready",
    "target_date_missing",
    "target_date_invalid",
    "evaluation_date_invalid",
    "outside_target_date",
  ] as const);
  const targetTradingDate = dateStringOrNull(control?.target_trading_date);
  const evaluatedTradingDate = dateStringOrNull(control?.evaluated_trading_date);
  const reasonCodes = stringArray(control?.reason_codes);
  const catalogOnlyEnforced = control?.catalog_only_enforced;
  const capabilityProbeMayProceed = control?.capability_probe_may_proceed;

  if (
    control?.control_version !== capabilityProbeControlVersion ||
    status === null ||
    typeof catalogOnlyEnforced !== "boolean" ||
    typeof capabilityProbeMayProceed !== "boolean" ||
    targetTradingDate === undefined ||
    evaluatedTradingDate === undefined ||
    control?.requested_output_size !== 100 ||
    control?.maximum_provider_credits !== 1 ||
    reasonCodes === null ||
    reasonCodes.length !== 1 ||
    reasonCodes[0] !== capabilityProbeReasonCodeByStatus[status]
  ) {
    return capabilityProbeControlInvalid();
  }

  const validControl =
    (status === "disabled" &&
      !catalogOnlyEnforced &&
      !capabilityProbeMayProceed) ||
    (status === "ready" &&
      catalogOnlyEnforced &&
      capabilityProbeMayProceed &&
      targetTradingDate !== null &&
      targetTradingDate === evaluatedTradingDate) ||
    ((status === "target_date_missing" || status === "target_date_invalid") &&
      catalogOnlyEnforced &&
      !capabilityProbeMayProceed &&
      targetTradingDate === null) ||
    (status === "evaluation_date_invalid" &&
      catalogOnlyEnforced &&
      !capabilityProbeMayProceed &&
      targetTradingDate !== null &&
      evaluatedTradingDate === null) ||
    (status === "outside_target_date" &&
      catalogOnlyEnforced &&
      !capabilityProbeMayProceed &&
      targetTradingDate !== null &&
      evaluatedTradingDate !== null &&
      targetTradingDate !== evaluatedTradingDate);

  if (!validControl) return capabilityProbeControlInvalid();

  return {
    receipt_status: "available",
    control_version: capabilityProbeControlVersion,
    status,
    catalog_only_enforced: catalogOnlyEnforced,
    capability_probe_may_proceed: capabilityProbeMayProceed,
    target_trading_date: targetTradingDate,
    evaluated_trading_date: evaluatedTradingDate,
    requested_output_size: 100,
    maximum_provider_credits: 1,
    reason_codes: reasonCodes,
  };
}

function unavailableReadback(
  sourceScan: BasicFreeDiscoveryReadback["source_scan"],
): BasicFreeDiscoveryReadback {
  return {
    status: "unavailable",
    generated_at: null,
    trading_date: null,
    scan_window: null,
    reference_mode: null,
    source_scan: sourceScan,
    admission: {
      status: null,
      runtime_enabled: null,
      plan_eligibility: null,
      endpoint: null,
      requested_credits: null,
      declared_daily_credit_budget: null,
      declared_per_minute_credit_budget: null,
      reason_codes: ["basic_free_catalog_receipt_missing_or_invalid"],
    },
    attempt: {
      attempted_at: null,
      outcome: null,
      provider_response_observed: null,
    },
    credit_reservation: {
      status: null,
      daily_reserved_credits: null,
      daily_remaining_credits: null,
      minute_reserved_credits: null,
      minute_remaining_credits: null,
      finalization_status: null,
      finalization_proven: null,
    },
    catalog: {
      requested_output_size: null,
      decoded_response_json_bytes: null,
      observed_record_count: null,
      provider_catalog_count: null,
      eligible_record_count: null,
      rejected_record_count: null,
      collection_complete: null,
      discovery_feed_allowed: null,
    },
    catalog_collection_plan: buildBasicFreeCatalogCollectionPlan({
      referenceMode: null,
      providerResponseObserved: null,
      observationOutcome: null,
      providerCatalogCount: null,
      observedRecordCount: null,
      requestedCredits: null,
      dailyCreditBudget: null,
      perMinuteCreditBudget: null,
      dailyRemainingCredits: null,
      minuteRemainingCredits: null,
      reservationStatus: null,
      reservationFinalizationStatus: null,
      reservationFinalizationProven: null,
    }),
    market_wide_dynamic_capacity: buildBasicFreeMarketWideCapacity({
      referenceMode: null,
      providerResponseObserved: null,
      observationOutcome: null,
      configuredProfile: null,
      providerCatalogCount: null,
      dailyCreditBudget: null,
      reservationStatus: null,
      reservationFinalizationStatus: null,
      reservationFinalizationProven: null,
    }),
    one_shot_control: oneShotControlNotRecorded(),
    capability_probe_control: capabilityProbeControlNotRecorded(),
    warnings: [],
    gaps: [],
  };
}

export function basicFreeDiscoveryReadbackFromUnknown(
  value: unknown,
  sourceScan: BasicFreeDiscoveryReadback["source_scan"] = {
    observed_at: null,
    trading_date: null,
    window: null,
  },
): BasicFreeDiscoveryReadback {
  const summary = objectOrNull(value);
  const historicalReceipt =
    summary?.summary_version === historicalSummaryVersion;
  const admission = objectOrNull(summary?.admission);
  const attempt = objectOrNull(summary?.attempt);
  const reservation = objectOrNull(summary?.credit_reservation);
  const catalog = objectOrNull(summary?.catalog);
  const coverageContract = objectOrNull(admission?.coverage_contract);
  const generatedAt = isoTimestampOrNull(summary?.generated_at);
  const tradingDate = dateStringOrNull(summary?.trading_date);
  const scanWindow = enumValue(summary?.scan_window, [
    "opening",
    "morning_momentum",
    "midday",
    "afternoon",
    "power_hour",
    "unknown",
  ] as const);
  const referenceMode: BasicFreeCatalogReferenceMode | null = historicalReceipt
    ? "catalog_observation"
    : enumValue(summary?.reference_mode, [
        "catalog_observation",
        "capability_probe",
      ] as const);
  const admissionStatus = enumValue(admission?.status, [
    "disabled",
    "plan_ineligible",
    "budget_not_declared",
    "budget_invalid",
    "refresh_interval_active",
    "daily_credit_limit_reached",
    "per_minute_credit_limit_reached",
    "budget_reservation_unavailable",
    "request_invalid",
    "ready",
  ] as const);
  const planEligibility = enumValue(admission?.plan_eligibility, [
    "unverified",
    "ineligible",
    "configured_basic_free",
  ] as const);
  const request = objectOrNull(admission?.request);
  const requestedOutputSize: 8 | 100 | null = historicalReceipt
    ? 8
    : catalog?.requested_output_size === 8 ||
        catalog?.requested_output_size === 100
      ? catalog.requested_output_size
      : null;
  const decodedResponseJsonBytes = historicalReceipt
    ? null
    : nullableFiniteNonNegative(catalog?.decoded_response_json_bytes);
  const reasonCodes = stringArray(admission?.reason_codes);
  const attemptOutcome = enumValue(attempt?.outcome, [
    "available",
    "empty",
    "provider_error",
    "rate_limited",
    "not_attempted",
  ] as const);
  const attemptedAt = nullableIsoTimestamp(attempt?.attempted_at);
  const providerResponseObserved = attempt?.provider_response_observed;
  const reservationStatus = enumValue(reservation?.status, [
    "not_required",
    "provider_execution_allowed",
    "daily_catalog_observation_already_claimed",
    "daily_credit_limit_reached",
    "per_minute_credit_limit_reached",
    "attempt_in_progress",
    "already_completed",
    "already_failed",
    "reservation_unavailable",
  ] as const);
  const finalizationStatus = enumValue(reservation?.finalization_status, [
    "not_started",
    "finalized",
    "already_completed",
    "already_failed",
    "invalid_transition",
    "reservation_unavailable",
  ] as const);
  const catalogObservedCount = finiteNonNegative(catalog?.observed_record_count);
  const providerCatalogCount = nullableFiniteNonNegative(
    catalog?.provider_catalog_count,
  );
  const eligibleCount = finiteNonNegative(catalog?.eligible_record_count);
  const rejectedCount = finiteNonNegative(catalog?.rejected_record_count);
  const warnings = stringArray(summary?.warnings);
  const gaps = stringArray(summary?.gaps);
  const declaredDailyCreditBudget = nullableFiniteNonNegative(
    admission?.declared_daily_credit_budget,
  );
  const declaredPerMinuteCreditBudget = nullableFiniteNonNegative(
    admission?.declared_per_minute_credit_budget,
  );
  const dailyReservedCredits = nullableFiniteNonNegative(
    reservation?.daily_reserved_credits,
  );
  const dailyRemainingCredits = nullableFiniteNonNegative(
    reservation?.daily_remaining_credits,
  );
  const minuteReservedCredits = nullableFiniteNonNegative(
    reservation?.minute_reserved_credits,
  );
  const minuteRemainingCredits = nullableFiniteNonNegative(
    reservation?.minute_remaining_credits,
  );

  if (
    (!historicalReceipt && summary?.summary_version !== currentSummaryVersion) ||
    summary?.summary_kind !== "basic_free_catalog_observation" ||
    generatedAt === null ||
    tradingDate === undefined ||
    scanWindow === null ||
    admission?.policy_version !==
      (historicalReceipt ? historicalPolicyVersion : currentPolicyVersion) ||
    admissionStatus === null ||
    typeof admission?.runtime_enabled !== "boolean" ||
    planEligibility === null ||
    admission?.endpoint !== "/stocks" ||
    (!historicalReceipt && admission?.reference_mode !== referenceMode) ||
    request?.country !== "United States" ||
    request?.type !== "Common Stock" ||
    request?.page !== 1 ||
    request?.outputsize !== requestedOutputSize ||
    request?.credits_per_request !== 1 ||
    coverageContract?.collection_complete !== false ||
    coverageContract?.discovery_feed_allowed !== false ||
    coverageContract?.scope !== "one_catalog_page_only" ||
    declaredDailyCreditBudget === undefined ||
    declaredPerMinuteCreditBudget === undefined ||
    (declaredDailyCreditBudget !== null &&
      (declaredDailyCreditBudget < 1 || declaredDailyCreditBudget > 800)) ||
    (declaredPerMinuteCreditBudget !== null &&
      (declaredPerMinuteCreditBudget < 1 || declaredPerMinuteCreditBudget > 8)) ||
    reasonCodes === null ||
    attemptOutcome === null ||
    attemptedAt === undefined ||
    typeof providerResponseObserved !== "boolean" ||
    reservation?.contract_version !== reservationVersion ||
    reservationStatus === null ||
    reservation?.requested_credits !== 1 ||
    dailyReservedCredits === undefined ||
    dailyRemainingCredits === undefined ||
    minuteReservedCredits === undefined ||
    minuteRemainingCredits === undefined ||
    (dailyReservedCredits !== null && dailyReservedCredits > 800) ||
    (dailyRemainingCredits !== null && dailyRemainingCredits > 800) ||
    (minuteReservedCredits !== null && minuteReservedCredits > 8) ||
    (minuteRemainingCredits !== null && minuteRemainingCredits > 8) ||
    finalizationStatus === null ||
    (reservation?.finalization_proven !== null &&
      typeof reservation?.finalization_proven !== "boolean") ||
    catalog?.provider !== "twelve_data" ||
    catalog?.endpoint !== "/stocks" ||
    requestedOutputSize === null ||
    decodedResponseJsonBytes === undefined ||
    referenceMode === null ||
    (referenceMode === "catalog_observation" && requestedOutputSize !== 8) ||
    (referenceMode === "capability_probe" && requestedOutputSize !== 100) ||
    catalogObservedCount === null ||
    catalogObservedCount > requestedOutputSize ||
    providerCatalogCount === undefined ||
    eligibleCount === null ||
    rejectedCount === null ||
    catalog?.collection_complete !== false ||
    catalog?.discovery_feed_allowed !== false ||
    warnings === null ||
    gaps === null ||
    (providerCatalogCount !== null && providerCatalogCount < catalogObservedCount) ||
    eligibleCount + rejectedCount > catalogObservedCount ||
    (sourceScan.trading_date !== null && tradingDate !== sourceScan.trading_date) ||
    (sourceScan.window !== null && scanWindow !== sourceScan.window) ||
    (providerResponseObserved === true && attemptedAt === null) ||
    (!historicalReceipt &&
      providerResponseObserved === true &&
      decodedResponseJsonBytes === null) ||
    (providerResponseObserved === false && decodedResponseJsonBytes !== null) ||
    (providerResponseObserved === false &&
      !(
        (attemptOutcome === "not_attempted" && attemptedAt === null) ||
        ((attemptOutcome === "provider_error" || attemptOutcome === "rate_limited") &&
          attemptedAt !== null)
      ))
  ) {
    return unavailableReadback(sourceScan);
  }

  return {
    status: "available",
    generated_at: generatedAt,
    trading_date: tradingDate ?? null,
    scan_window: scanWindow,
    reference_mode: referenceMode,
    source_scan: sourceScan,
    admission: {
      status: admissionStatus,
      runtime_enabled: admission.runtime_enabled,
      plan_eligibility: planEligibility,
      endpoint: "/stocks",
      requested_credits: request.credits_per_request,
      declared_daily_credit_budget: declaredDailyCreditBudget ?? null,
      declared_per_minute_credit_budget: declaredPerMinuteCreditBudget ?? null,
      reason_codes: reasonCodes,
    },
    attempt: {
      attempted_at: attemptedAt ?? null,
      outcome: attemptOutcome,
      provider_response_observed: providerResponseObserved,
    },
    credit_reservation: {
      status: reservationStatus,
      daily_reserved_credits: dailyReservedCredits ?? null,
      daily_remaining_credits: dailyRemainingCredits ?? null,
      minute_reserved_credits: minuteReservedCredits ?? null,
      minute_remaining_credits: minuteRemainingCredits ?? null,
      finalization_status: finalizationStatus,
      finalization_proven:
        typeof reservation.finalization_proven === "boolean"
          ? reservation.finalization_proven
          : null,
    },
    catalog: {
      requested_output_size: requestedOutputSize,
      decoded_response_json_bytes: decodedResponseJsonBytes ?? null,
      observed_record_count: catalogObservedCount,
      provider_catalog_count: providerCatalogCount,
      eligible_record_count: eligibleCount,
      rejected_record_count: rejectedCount,
      collection_complete: false,
      discovery_feed_allowed: false,
    },
    catalog_collection_plan: buildBasicFreeCatalogCollectionPlan({
      referenceMode,
      providerResponseObserved,
      observationOutcome: attemptOutcome,
      providerCatalogCount,
      observedRecordCount: catalogObservedCount,
      requestedCredits: request.credits_per_request,
      dailyCreditBudget: declaredDailyCreditBudget,
      perMinuteCreditBudget: declaredPerMinuteCreditBudget,
      dailyRemainingCredits,
      minuteRemainingCredits,
      reservationStatus,
      reservationFinalizationStatus: finalizationStatus,
      reservationFinalizationProven: reservation.finalization_proven,
    }),
    market_wide_dynamic_capacity: buildBasicFreeMarketWideCapacity({
      referenceMode,
      providerResponseObserved,
      observationOutcome: attemptOutcome,
      configuredProfile: planEligibility,
      providerCatalogCount,
      dailyCreditBudget: declaredDailyCreditBudget,
      reservationStatus,
      reservationFinalizationStatus: finalizationStatus,
      reservationFinalizationProven: reservation.finalization_proven,
    }),
    one_shot_control: oneShotControlNotRecorded(),
    capability_probe_control: capabilityProbeControlNotRecorded(),
    warnings,
    gaps,
  };
}

export function basicFreeDiscoveryReadbackFromScheduledAttempt(
  attempt: BasicFreeDiscoveryScheduledAttempt,
) {
  const payload = objectOrNull(attempt.payload_json);
  const window = enumValue(attempt.intraday_scan_window, [
    "pre_market",
    "opening",
    "morning_momentum",
    "midday",
    "afternoon",
    "power_hour",
    "closed",
    "unknown",
  ] as const);
  const sourceScan = {
    observed_at: isoTimestampOrNull(attempt.utc_timestamp),
    trading_date: dateStringOrNull(attempt.trading_date) ?? null,
    window: window ?? null,
  };
  const readback = basicFreeDiscoveryReadbackFromUnknown(
    payload?.basic_free_discovery,
    sourceScan,
  );
  const oneShotControl = basicFreeCatalogOneShotReadbackFromUnknown(
    payload?.basic_free_catalog_one_shot,
  );
  const capabilityProbeControl =
    basicFreeCatalogCapabilityProbeReadbackFromUnknown(
      payload?.basic_free_catalog_capability_probe,
    );

  return {
    ...readback,
    one_shot_control:
      oneShotControl.receipt_status === "available" &&
      sourceScan.trading_date !== null &&
      oneShotControl.evaluated_trading_date !== sourceScan.trading_date
        ? oneShotControlInvalid()
        : oneShotControl,
    capability_probe_control:
      capabilityProbeControl.receipt_status === "available" &&
      sourceScan.trading_date !== null &&
      capabilityProbeControl.evaluated_trading_date !== sourceScan.trading_date
        ? capabilityProbeControlInvalid()
        : capabilityProbeControl,
  };
}
