import {
  BASIC_FREE_DISCOVERY_MAX_DAILY_CREDITS,
  BASIC_FREE_DISCOVERY_MAX_PER_MINUTE_CREDITS,
} from "@/lib/basic-free-discovery-credit-reservation-store";

export const BASIC_FREE_SCHEDULED_SCAN_PREFLIGHT_VERSION =
  "basic_free_scheduled_scan_preflight_v2" as const;

export const basicFreeScheduledScanPreflightRpcName =
  "read_basic_free_scheduled_scan_preflight_v2" as const;

type PreflightSnapshot = {
  preflight_version: typeof BASIC_FREE_SCHEDULED_SCAN_PREFLIGHT_VERSION;
  trading_date: string;
  target_slot_utc: string;
  total_reservation_count: number;
  total_reserved_credits: number;
  normal_scan_reservation_count: number;
  normal_scan_reserved_credits: number;
  catalog_observation_reservation_count: number;
  catalog_observation_reserved_credits: number;
  active_reservation_count: number;
  active_reserved_credits: number;
  terminal_reservation_count: number;
  terminal_reserved_credits: number;
  target_slot_reservation_count: number;
  target_slot_reserved_credits: number;
  minimum_declared_daily_credit_budget: number | null;
  maximum_declared_daily_credit_budget: number | null;
  minimum_declared_per_minute_credit_budget: number | null;
  maximum_declared_per_minute_credit_budget: number | null;
  target_slot_attempt_count: number;
  unresolved_scheduled_attempt_count: number;
};

export type BasicFreeScheduledScanPreflightReadback =
  | { status: "available"; snapshot: PreflightSnapshot }
  | {
      status: "unavailable";
      reason_codes: ["basic_free_scheduled_scan_preflight_missing_or_invalid"];
    };

export type BasicFreeScheduledScanPreflightDecision =
  | {
      status: "ready";
      readback: Extract<BasicFreeScheduledScanPreflightReadback, { status: "available" }>;
      reason_codes: [];
    }
  | {
      status: "blocked";
      readback: Extract<BasicFreeScheduledScanPreflightReadback, { status: "available" }>;
      reason_codes: string[];
    }
  | {
      status: "unavailable";
      readback: Extract<BasicFreeScheduledScanPreflightReadback, { status: "unavailable" }>;
      reason_codes: ["basic_free_scheduled_scan_preflight_missing_or_invalid"];
    };

function record(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function exactDate(value: unknown) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value
    ? value
    : null;
}

function exactQuarterHour(value: unknown) {
  if (typeof value !== "string") return null;
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime()) || parsed.getTime() % (15 * 60_000) !== 0) {
    return null;
  }
  return parsed.toISOString() === value ? value : null;
}

function nonNegativeInteger(value: unknown) {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0
    ? value
    : null;
}

function nullablePositiveInteger(value: unknown) {
  if (value === null) return null;
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0
    ? value
    : undefined;
}

function unavailable(): BasicFreeScheduledScanPreflightReadback {
  return {
    status: "unavailable",
    reason_codes: ["basic_free_scheduled_scan_preflight_missing_or_invalid"],
  };
}

/**
 * Validates the aggregate-only RPC output before it can be used to arm a
 * normal scheduled scan. Invalid, duplicate, non-canonical or inconsistent
 * values deliberately become unavailable rather than optimistic zeroes.
 */
export function basicFreeScheduledScanPreflightReadbackFromUnknown(
  value: unknown,
  expected: { trading_date: string; target_slot_utc: string },
): BasicFreeScheduledScanPreflightReadback {
  const row = record(value);
  const tradingDate = exactDate(row?.trading_date);
  const targetSlot = exactQuarterHour(row?.target_slot_utc);
  const expectedDate = exactDate(expected.trading_date);
  const expectedSlot = exactQuarterHour(expected.target_slot_utc);
  const totalReservationCount = nonNegativeInteger(row?.total_reservation_count);
  const totalReservedCredits = nonNegativeInteger(row?.total_reserved_credits);
  const normalReservationCount = nonNegativeInteger(row?.normal_scan_reservation_count);
  const normalReservedCredits = nonNegativeInteger(row?.normal_scan_reserved_credits);
  const catalogReservationCount = nonNegativeInteger(
    row?.catalog_observation_reservation_count,
  );
  const catalogReservedCredits = nonNegativeInteger(
    row?.catalog_observation_reserved_credits,
  );
  const activeReservationCount = nonNegativeInteger(row?.active_reservation_count);
  const activeReservedCredits = nonNegativeInteger(row?.active_reserved_credits);
  const terminalReservationCount = nonNegativeInteger(
    row?.terminal_reservation_count,
  );
  const terminalReservedCredits = nonNegativeInteger(
    row?.terminal_reserved_credits,
  );
  const targetSlotReservationCount = nonNegativeInteger(
    row?.target_slot_reservation_count,
  );
  const targetSlotReservedCredits = nonNegativeInteger(
    row?.target_slot_reserved_credits,
  );
  const minimumDailyBudget = nullablePositiveInteger(
    row?.minimum_declared_daily_credit_budget,
  );
  const maximumDailyBudget = nullablePositiveInteger(
    row?.maximum_declared_daily_credit_budget,
  );
  const minimumMinuteBudget = nullablePositiveInteger(
    row?.minimum_declared_per_minute_credit_budget,
  );
  const maximumMinuteBudget = nullablePositiveInteger(
    row?.maximum_declared_per_minute_credit_budget,
  );
  const targetSlotAttempts = nonNegativeInteger(row?.target_slot_attempt_count);
  const unresolvedAttempts = nonNegativeInteger(
    row?.unresolved_scheduled_attempt_count,
  );

  const noReservations = totalReservationCount === 0;
  const budgetsAreAbsent =
    minimumDailyBudget === null &&
    maximumDailyBudget === null &&
    minimumMinuteBudget === null &&
    maximumMinuteBudget === null;
  const budgetsAreExpected =
    minimumDailyBudget === BASIC_FREE_DISCOVERY_MAX_DAILY_CREDITS &&
    maximumDailyBudget === BASIC_FREE_DISCOVERY_MAX_DAILY_CREDITS &&
    minimumMinuteBudget === BASIC_FREE_DISCOVERY_MAX_PER_MINUTE_CREDITS &&
    maximumMinuteBudget === BASIC_FREE_DISCOVERY_MAX_PER_MINUTE_CREDITS;

  if (
    row?.preflight_version !== BASIC_FREE_SCHEDULED_SCAN_PREFLIGHT_VERSION ||
    tradingDate === null ||
    targetSlot === null ||
    expectedDate === null ||
    expectedSlot === null ||
    tradingDate !== expectedDate ||
    targetSlot !== expectedSlot ||
    totalReservationCount === null ||
    totalReservedCredits === null ||
    normalReservationCount === null ||
    normalReservedCredits === null ||
    catalogReservationCount === null ||
    catalogReservedCredits === null ||
    activeReservationCount === null ||
    activeReservedCredits === null ||
    terminalReservationCount === null ||
    terminalReservedCredits === null ||
    targetSlotReservationCount === null ||
    targetSlotReservedCredits === null ||
    minimumDailyBudget === undefined ||
    maximumDailyBudget === undefined ||
    minimumMinuteBudget === undefined ||
    maximumMinuteBudget === undefined ||
    targetSlotAttempts === null ||
    unresolvedAttempts === null ||
    totalReservedCredits > BASIC_FREE_DISCOVERY_MAX_DAILY_CREDITS ||
    normalReservationCount > totalReservationCount ||
    normalReservedCredits > totalReservedCredits ||
    catalogReservationCount > totalReservationCount ||
    catalogReservedCredits > totalReservedCredits ||
    activeReservationCount > totalReservationCount ||
    activeReservedCredits > totalReservedCredits ||
    terminalReservationCount > totalReservationCount ||
    terminalReservedCredits > totalReservedCredits ||
    targetSlotReservationCount > totalReservationCount ||
    targetSlotReservedCredits > totalReservedCredits ||
    normalReservationCount + catalogReservationCount !== totalReservationCount ||
    normalReservedCredits + catalogReservedCredits !== totalReservedCredits ||
    activeReservationCount + terminalReservationCount !== totalReservationCount ||
    activeReservedCredits + terminalReservedCredits !== totalReservedCredits ||
    normalReservedCredits !==
      normalReservationCount * BASIC_FREE_DISCOVERY_MAX_PER_MINUTE_CREDITS ||
    catalogReservedCredits !== catalogReservationCount ||
    (targetSlotReservationCount === 0) !== (targetSlotReservedCredits === 0) ||
    (!noReservations && !budgetsAreExpected) ||
    (noReservations && !budgetsAreAbsent)
  ) {
    return unavailable();
  }

  return {
    status: "available",
    snapshot: {
      preflight_version: BASIC_FREE_SCHEDULED_SCAN_PREFLIGHT_VERSION,
      trading_date: tradingDate,
      target_slot_utc: targetSlot,
      total_reservation_count: totalReservationCount,
      total_reserved_credits: totalReservedCredits,
      normal_scan_reservation_count: normalReservationCount,
      normal_scan_reserved_credits: normalReservedCredits,
      catalog_observation_reservation_count: catalogReservationCount,
      catalog_observation_reserved_credits: catalogReservedCredits,
      active_reservation_count: activeReservationCount,
      active_reserved_credits: activeReservedCredits,
      terminal_reservation_count: terminalReservationCount,
      terminal_reserved_credits: terminalReservedCredits,
      target_slot_reservation_count: targetSlotReservationCount,
      target_slot_reserved_credits: targetSlotReservedCredits,
      minimum_declared_daily_credit_budget: minimumDailyBudget,
      maximum_declared_daily_credit_budget: maximumDailyBudget,
      minimum_declared_per_minute_credit_budget: minimumMinuteBudget,
      maximum_declared_per_minute_credit_budget: maximumMinuteBudget,
      target_slot_attempt_count: targetSlotAttempts,
      unresolved_scheduled_attempt_count: unresolvedAttempts,
    },
  };
}

/**
 * This is an admission preflight, not the credit guard. The actual scheduled
 * path still acquires its atomic reservation immediately before provider
 * entry, so a `ready` result can never reserve a credit or authorize a stale
 * readback.
 */
export function evaluateBasicFreeScheduledScanPreflight(
  readback: BasicFreeScheduledScanPreflightReadback,
): BasicFreeScheduledScanPreflightDecision {
  if (readback.status === "unavailable") {
    return {
      status: "unavailable",
      readback,
      reason_codes: readback.reason_codes,
    };
  }

  const snapshot = readback.snapshot;
  const reasons: string[] = [];
  if (snapshot.target_slot_attempt_count !== 0) {
    reasons.push("target_slot_attempt_already_exists");
  }
  if (snapshot.unresolved_scheduled_attempt_count !== 0) {
    reasons.push("unresolved_scheduled_attempt_exists");
  }
  if (snapshot.active_reservation_count !== 0) {
    reasons.push("active_basic_free_reservation_exists");
  }
  if (
    snapshot.target_slot_reservation_count !== 0 ||
    snapshot.target_slot_reserved_credits !== 0
  ) {
    reasons.push("target_slot_reservation_already_exists");
  }
  if (
    snapshot.total_reserved_credits + BASIC_FREE_DISCOVERY_MAX_PER_MINUTE_CREDITS >
    BASIC_FREE_DISCOVERY_MAX_DAILY_CREDITS
  ) {
    reasons.push("daily_basic_free_credit_capacity_unavailable");
  }

  return reasons.length === 0
    ? { status: "ready", readback, reason_codes: [] }
    : { status: "blocked", readback, reason_codes: reasons };
}
