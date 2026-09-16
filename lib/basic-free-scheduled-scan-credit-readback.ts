import {
  BASIC_FREE_DISCOVERY_MAX_DAILY_CREDITS,
  BASIC_FREE_DISCOVERY_MAX_PER_MINUTE_CREDITS,
  basicFreeDiscoveryCreditReservationContractVersion,
} from "@/lib/basic-free-discovery-credit-reservation-store";

export const BASIC_FREE_SCHEDULED_SCAN_CREDIT_GUARD_READBACK_VERSION =
  "basic_free_scheduled_scan_credit_guard_v1" as const;

const scope = "normal_scheduled_scan" as const;

const reservationStatuses = [
  "not_required",
  "provider_execution_allowed",
  "daily_credit_limit_reached",
  "per_minute_credit_limit_reached",
  "attempt_in_progress",
  "already_completed",
  "already_failed",
  "reservation_unavailable",
] as const;

const finalizationStatuses = [
  "not_started",
  "finalized",
  "already_completed",
  "already_failed",
  "invalid_transition",
  "reservation_unavailable",
] as const;

const safeBlockers = [
  "scheduled_provider_credit_budget_invalid",
  "basic_free_credit_budget_unavailable",
  "daily_credit_limit_reached",
  "per_minute_credit_limit_reached",
  "attempt_in_progress",
  "already_completed",
  "already_failed",
  "reservation_unavailable",
  "basic_free_credit_reservation_unavailable",
  "invalid_transition",
] as const;

type ReservationStatus = (typeof reservationStatuses)[number];
type FinalizationStatus = (typeof finalizationStatuses)[number];
type SafeBlocker = (typeof safeBlockers)[number];

export type BasicFreeScheduledScanCreditReadback = {
  status: "available" | "unavailable";
  source_attempt: {
    observed_at: string | null;
    trading_date: string | null;
    window: string | null;
  };
  reservation: {
    status: ReservationStatus | null;
    provider_execution_allowed: boolean | null;
    trading_date: string | null;
    minute_bucket: string | null;
    requested_credits: number | null;
    declared_daily_credit_budget: number | null;
    declared_per_minute_credit_budget: number | null;
    daily_reserved_credits: number | null;
    daily_remaining_credits: number | null;
    minute_reserved_credits: number | null;
    minute_remaining_credits: number | null;
    idempotent: boolean | null;
    finalization_status: FinalizationStatus | null;
    finalization_proven: boolean | null;
    safe_blocker: SafeBlocker | null;
  };
  reason_codes: string[];
};

type ScheduledAttempt = {
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

function enumValue<T extends string>(
  value: unknown,
  values: readonly T[],
): T | null {
  return typeof value === "string" && values.includes(value as T)
    ? (value as T)
    : null;
}

function unavailableReadback(
  sourceAttempt: BasicFreeScheduledScanCreditReadback["source_attempt"],
): BasicFreeScheduledScanCreditReadback {
  return {
    status: "unavailable",
    source_attempt: sourceAttempt,
    reservation: {
      status: null,
      provider_execution_allowed: null,
      trading_date: null,
      minute_bucket: null,
      requested_credits: null,
      declared_daily_credit_budget: null,
      declared_per_minute_credit_budget: null,
      daily_reserved_credits: null,
      daily_remaining_credits: null,
      minute_reserved_credits: null,
      minute_remaining_credits: null,
      idempotent: null,
      finalization_status: null,
      finalization_proven: null,
      safe_blocker: null,
    },
    reason_codes: ["basic_free_scheduled_scan_credit_receipt_missing_or_invalid"],
  };
}

function receiptHasConsistentCapacity(input: {
  requestedCredits: number | null | undefined;
  dailyBudget: number | null | undefined;
  perMinuteBudget: number | null | undefined;
  dailyReserved: number | null | undefined;
  dailyRemaining: number | null | undefined;
  minuteReserved: number | null | undefined;
  minuteRemaining: number | null | undefined;
}) {
  const requestedCredits = input.requestedCredits;
  const dailyBudget = input.dailyBudget;
  const perMinuteBudget = input.perMinuteBudget;
  const dailyReserved = input.dailyReserved;
  const dailyRemaining = input.dailyRemaining;
  const minuteReserved = input.minuteReserved;
  const minuteRemaining = input.minuteRemaining;

  if (
    requestedCredits === undefined ||
    dailyBudget === undefined ||
    perMinuteBudget === undefined ||
    dailyReserved === undefined ||
    dailyRemaining === undefined ||
    minuteReserved === undefined ||
    minuteRemaining === undefined
  ) {
    return false;
  }

  const values = [
    requestedCredits,
    dailyBudget,
    perMinuteBudget,
    dailyReserved,
    dailyRemaining,
    minuteReserved,
    minuteRemaining,
  ];

  if (values.some((value) => value !== null && !Number.isInteger(value))) {
    return false;
  }

  if (requestedCredits !== BASIC_FREE_DISCOVERY_MAX_PER_MINUTE_CREDITS) {
    return false;
  }
  if (dailyBudget !== BASIC_FREE_DISCOVERY_MAX_DAILY_CREDITS) return false;
  if (perMinuteBudget !== BASIC_FREE_DISCOVERY_MAX_PER_MINUTE_CREDITS) {
    return false;
  }
  if (
    dailyReserved !== null &&
    (dailyReserved < 0 || dailyReserved > dailyBudget)
  ) {
    return false;
  }
  if (
    dailyRemaining !== null &&
    (dailyRemaining < 0 || dailyRemaining > dailyBudget)
  ) {
    return false;
  }
  if (
    minuteReserved !== null &&
    (minuteReserved < 0 || minuteReserved > perMinuteBudget)
  ) {
    return false;
  }
  if (
    minuteRemaining !== null &&
    (minuteRemaining < 0 || minuteRemaining > perMinuteBudget)
  ) {
    return false;
  }

  return true;
}

/**
 * Converts the persisted normal-scan Basic Free budget guard into a small,
 * browser-safe receipt. The scheduled-attempt payload is untrusted at this
 * boundary: only the exact guard and reservation contracts are displayed.
 */
export function basicFreeScheduledScanCreditReadbackFromUnknown(
  value: unknown,
  sourceAttempt: BasicFreeScheduledScanCreditReadback["source_attempt"] = {
    observed_at: null,
    trading_date: null,
    window: null,
  },
): BasicFreeScheduledScanCreditReadback {
  const summary = objectOrNull(value);
  const receiptStatus = enumValue(summary?.status, reservationStatuses);
  const finalizationStatus = enumValue(
    summary?.finalization_status,
    finalizationStatuses,
  );
  const blocker = enumValue(summary?.safe_blocker, safeBlockers);
  const tradingDate = dateStringOrNull(summary?.trading_date);
  const minuteBucket = nullableIsoTimestamp(summary?.minute_bucket);
  const requestedCredits = nullableFiniteNonNegative(summary?.requested_credits);
  const dailyBudget = nullableFiniteNonNegative(
    summary?.declared_daily_credit_budget,
  );
  const perMinuteBudget = nullableFiniteNonNegative(
    summary?.declared_per_minute_credit_budget,
  );
  const dailyReserved = nullableFiniteNonNegative(summary?.daily_reserved_credits);
  const dailyRemaining = nullableFiniteNonNegative(
    summary?.daily_remaining_credits,
  );
  const minuteReserved = nullableFiniteNonNegative(summary?.minute_reserved_credits);
  const minuteRemaining = nullableFiniteNonNegative(
    summary?.minute_remaining_credits,
  );
  const isNotRequired = receiptStatus === "not_required";
  const providerExecutionAllowed = summary?.provider_execution_allowed;
  const reservationFieldsAreNull =
    tradingDate === null &&
    minuteBucket === null &&
    requestedCredits === null &&
    dailyBudget === null &&
    perMinuteBudget === null &&
    dailyReserved === null &&
    dailyRemaining === null &&
    minuteReserved === null &&
    minuteRemaining === null;
  const validAllowedRelation =
    typeof providerExecutionAllowed === "boolean" &&
    providerExecutionAllowed ===
      (receiptStatus === "provider_execution_allowed" || isNotRequired);
  const validFinalizationRelation =
    (finalizationStatus === "not_started" &&
      summary?.finalization_proven === null) ||
    (finalizationStatus === "finalized" &&
      summary?.finalization_proven === true &&
      summary?.safe_blocker === null) ||
    ((finalizationStatus === "already_completed" ||
      finalizationStatus === "already_failed") &&
      summary?.finalization_proven === true &&
      summary?.safe_blocker === null) ||
    (finalizationStatus === "invalid_transition" &&
      summary?.finalization_proven === false &&
      summary?.safe_blocker === "invalid_transition") ||
    (finalizationStatus === "reservation_unavailable" &&
      summary?.finalization_proven === false &&
      summary?.safe_blocker === "basic_free_credit_reservation_unavailable");
  const validBlocker = summary?.safe_blocker === null || blocker !== null;

  if (
    summary?.guard_version !== BASIC_FREE_SCHEDULED_SCAN_CREDIT_GUARD_READBACK_VERSION ||
    summary?.contract_version !== basicFreeDiscoveryCreditReservationContractVersion ||
    summary?.scope !== scope ||
    receiptStatus === null ||
    finalizationStatus === null ||
    !validAllowedRelation ||
    !validFinalizationRelation ||
    !validBlocker ||
    (summary?.idempotent !== null && typeof summary?.idempotent !== "boolean") ||
    (isNotRequired
      ? !reservationFieldsAreNull ||
        finalizationStatus !== "not_started" ||
        summary?.finalization_proven !== null ||
        summary?.safe_blocker !== null
      : tradingDate === undefined ||
        minuteBucket === undefined ||
        !receiptHasConsistentCapacity({
          requestedCredits,
          dailyBudget,
          perMinuteBudget,
          dailyReserved,
          dailyRemaining,
          minuteReserved,
          minuteRemaining,
        }) ||
        (sourceAttempt.trading_date !== null &&
          tradingDate !== sourceAttempt.trading_date) ||
        (minuteBucket !== null &&
          tradingDate !== minuteBucket.slice(0, 10)))
  ) {
    return unavailableReadback(sourceAttempt);
  }

  return {
    status: "available",
    source_attempt: sourceAttempt,
    reservation: {
      status: receiptStatus,
      provider_execution_allowed:
        typeof providerExecutionAllowed === "boolean"
          ? providerExecutionAllowed
          : null,
      trading_date: tradingDate ?? null,
      minute_bucket: minuteBucket ?? null,
      requested_credits: requestedCredits ?? null,
      declared_daily_credit_budget: dailyBudget ?? null,
      declared_per_minute_credit_budget: perMinuteBudget ?? null,
      daily_reserved_credits: dailyReserved ?? null,
      daily_remaining_credits: dailyRemaining ?? null,
      minute_reserved_credits: minuteReserved ?? null,
      minute_remaining_credits: minuteRemaining ?? null,
      idempotent: typeof summary.idempotent === "boolean" ? summary.idempotent : null,
      finalization_status: finalizationStatus,
      finalization_proven:
        typeof summary.finalization_proven === "boolean"
          ? summary.finalization_proven
          : null,
      safe_blocker: blocker,
    },
    reason_codes: blocker ? [blocker] : [],
  };
}

export function basicFreeScheduledScanCreditReadbackFromScheduledAttempt(
  attempt: ScheduledAttempt,
) {
  const payload = objectOrNull(attempt.payload_json);
  return basicFreeScheduledScanCreditReadbackFromUnknown(
    payload?.basic_free_scheduled_scan_credit_reservation,
    {
      observed_at: isoTimestampOrNull(attempt.utc_timestamp),
      trading_date: dateStringOrNull(attempt.trading_date) ?? null,
      window:
        typeof attempt.intraday_scan_window === "string" &&
        attempt.intraday_scan_window.trim().length > 0
          ? attempt.intraday_scan_window
          : null,
    },
  );
}
