import {
  BASIC_FREE_DISCOVERY_MAX_DAILY_CREDITS,
  BASIC_FREE_DISCOVERY_MAX_PER_MINUTE_CREDITS,
} from "@/lib/basic-free-discovery-credit-reservation-store";
import type { ObservationSeriesControl } from "@/lib/observation-series-control";
import { buildProviderPlanProfile } from "@/lib/provider-plan-profile";

export const OBSERVATION_SERIES_ACTIVATION_PREFLIGHT_VERSION =
  "observation_series_activation_preflight_v1" as const;
export const OBSERVATION_SERIES_ACTIVATION_MANIFEST_VERSION =
  "observation_series_activation_manifest_v1" as const;
export const OBSERVATION_SERIES_ACTIVATION_MANIFEST_TTL_MS = 5 * 60_000;
export const observationSeriesActivationPreflightRpcName =
  "read_basic_free_observation_series_preflight_v1" as const;

type ObservationSeriesActivationPreflightSnapshot = Readonly<{
  preflight_version: typeof OBSERVATION_SERIES_ACTIVATION_PREFLIGHT_VERSION;
  trading_date: string;
  starts_at_utc: string;
  expires_at_utc: string;
  available_slot_count: number;
  requested_max_attempts: number;
  requested_max_provider_credits: number;
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
  window_reservation_count: number;
  window_reserved_credits: number;
  minimum_declared_daily_credit_budget: number | null;
  maximum_declared_daily_credit_budget: number | null;
  minimum_declared_per_minute_credit_budget: number | null;
  maximum_declared_per_minute_credit_budget: number | null;
  daily_scheduled_attempt_count: number;
  window_scheduled_attempt_count: number;
  window_distinct_attempt_slot_count: number;
  window_duplicate_attempt_slot_count: number;
  unresolved_scheduled_attempt_count: number;
  unattributed_scheduled_attempt_count: number;
}>;

export type ObservationSeriesActivationPreflightReadback =
  | Readonly<{
      status: "available";
      snapshot: ObservationSeriesActivationPreflightSnapshot;
    }>
  | Readonly<{
      status: "unavailable";
      reason_codes: readonly ["observation_series_activation_preflight_invalid"];
    }>;

export type ObservationSeriesActivationDatabaseDecision = Readonly<{
  status: "ready" | "blocked" | "unavailable";
  readback: ObservationSeriesActivationPreflightReadback;
  reason_codes: readonly string[];
}>;

export type ObservationSeriesActivationEnvironment = Readonly<{
  global_scheduler_disabled: boolean;
  observation_series_disabled: boolean;
  normal_scan_one_shot_disabled: boolean;
  catalog_observation_one_shot_disabled: boolean;
  catalog_capability_probe_disabled: boolean;
  outcome_evaluation_one_shot_disabled: boolean;
  internal_paper_worker_disabled: boolean;
  basic_free_provider_plan: boolean;
  provider_plan_mode_consistent: boolean;
  basic_free_daily_credit_budget_exact: boolean;
  basic_free_per_minute_credit_budget_exact: boolean;
}>;

export type ObservationSeriesActivationBuildIdentity = Readonly<{
  deploy_id: string;
  deploy_context: "production";
  commit_ref: string;
  site_id: string;
}>;

export type ObservationSeriesActivationManifest = Readonly<{
  manifest_version: typeof OBSERVATION_SERIES_ACTIVATION_MANIFEST_VERSION;
  status: "ready" | "blocked" | "unavailable";
  evaluated_at: string;
  valid_until: string;
  control: ObservationSeriesControl;
  build_identity: ObservationSeriesActivationBuildIdentity | null;
  environment: ObservationSeriesActivationEnvironment;
  database_preflight: ObservationSeriesActivationDatabaseDecision;
  reason_codes: readonly string[];
  authority: Readonly<{
    mutates_configuration: false;
    arms_scheduler: false;
    calls_provider: false;
    reserves_provider_credits: false;
    changes_ranking: false;
    publishes_candidate: false;
    executes_paper_trade: false;
    executes_broker_order: false;
  }>;
}>;

function objectOrNull(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function exactDate(value: unknown) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
    ? value
    : null;
}

function exactQuarterHour(value: unknown) {
  if (typeof value !== "string") return null;
  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime()) &&
    parsed.getTime() % (15 * 60_000) === 0 &&
    parsed.toISOString() === value
    ? value
    : null;
}

function nonNegativeInteger(value: unknown) {
  return typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value >= 0
    ? value
    : null;
}

function positiveInteger(value: unknown) {
  return typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value > 0
    ? value
    : null;
}

function nullablePositiveInteger(value: unknown) {
  if (value === null) return null;
  return positiveInteger(value) ?? undefined;
}

function unavailable(): ObservationSeriesActivationPreflightReadback {
  return Object.freeze({
    status: "unavailable" as const,
    reason_codes: [
      "observation_series_activation_preflight_invalid",
    ] as const,
  });
}

export function observationSeriesActivationPreflightReadbackFromUnknown(
  value: unknown,
  control: ObservationSeriesControl,
): ObservationSeriesActivationPreflightReadback {
  const row = objectOrNull(value);
  const tradingDate = exactDate(row?.trading_date);
  const startsAtUtc = exactQuarterHour(row?.starts_at_utc);
  const expiresAtUtc = exactQuarterHour(row?.expires_at_utc);
  const availableSlotCount = positiveInteger(row?.available_slot_count);
  const requestedMaxAttempts = positiveInteger(row?.requested_max_attempts);
  const requestedMaxProviderCredits = positiveInteger(
    row?.requested_max_provider_credits,
  );
  const integerFields = {
    total_reservation_count: nonNegativeInteger(row?.total_reservation_count),
    total_reserved_credits: nonNegativeInteger(row?.total_reserved_credits),
    normal_scan_reservation_count: nonNegativeInteger(
      row?.normal_scan_reservation_count,
    ),
    normal_scan_reserved_credits: nonNegativeInteger(
      row?.normal_scan_reserved_credits,
    ),
    catalog_observation_reservation_count: nonNegativeInteger(
      row?.catalog_observation_reservation_count,
    ),
    catalog_observation_reserved_credits: nonNegativeInteger(
      row?.catalog_observation_reserved_credits,
    ),
    active_reservation_count: nonNegativeInteger(row?.active_reservation_count),
    active_reserved_credits: nonNegativeInteger(row?.active_reserved_credits),
    terminal_reservation_count: nonNegativeInteger(
      row?.terminal_reservation_count,
    ),
    terminal_reserved_credits: nonNegativeInteger(
      row?.terminal_reserved_credits,
    ),
    window_reservation_count: nonNegativeInteger(row?.window_reservation_count),
    window_reserved_credits: nonNegativeInteger(row?.window_reserved_credits),
    daily_scheduled_attempt_count: nonNegativeInteger(
      row?.daily_scheduled_attempt_count,
    ),
    window_scheduled_attempt_count: nonNegativeInteger(
      row?.window_scheduled_attempt_count,
    ),
    window_distinct_attempt_slot_count: nonNegativeInteger(
      row?.window_distinct_attempt_slot_count,
    ),
    window_duplicate_attempt_slot_count: nonNegativeInteger(
      row?.window_duplicate_attempt_slot_count,
    ),
    unresolved_scheduled_attempt_count: nonNegativeInteger(
      row?.unresolved_scheduled_attempt_count,
    ),
    unattributed_scheduled_attempt_count: nonNegativeInteger(
      row?.unattributed_scheduled_attempt_count,
    ),
  };
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
  const values = Object.values(integerFields);
  const totalReservations = integerFields.total_reservation_count;
  const totalCredits = integerFields.total_reserved_credits;
  const noReservations = totalReservations === 0;
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
  const expectedSlots =
    startsAtUtc && expiresAtUtc
      ? (Date.parse(expiresAtUtc) - Date.parse(startsAtUtc)) / (15 * 60_000)
      : null;

  if (
    row?.preflight_version !== OBSERVATION_SERIES_ACTIVATION_PREFLIGHT_VERSION ||
    control.status !== "ready" ||
    !control.trading_date ||
    !control.starts_at_utc ||
    !control.expires_at_utc ||
    !control.max_attempts ||
    !control.max_provider_credits ||
    tradingDate !== control.trading_date ||
    startsAtUtc !== control.starts_at_utc ||
    expiresAtUtc !== control.expires_at_utc ||
    requestedMaxAttempts !== control.max_attempts ||
    requestedMaxProviderCredits !== control.max_provider_credits ||
    availableSlotCount === null ||
    availableSlotCount !== expectedSlots ||
    values.some((candidate) => candidate === null) ||
    minimumDailyBudget === undefined ||
    maximumDailyBudget === undefined ||
    minimumMinuteBudget === undefined ||
    maximumMinuteBudget === undefined ||
    totalCredits === null ||
    totalCredits > BASIC_FREE_DISCOVERY_MAX_DAILY_CREDITS ||
    integerFields.normal_scan_reservation_count! +
      integerFields.catalog_observation_reservation_count! !==
      totalReservations ||
    integerFields.normal_scan_reserved_credits! +
      integerFields.catalog_observation_reserved_credits! !==
      totalCredits ||
    integerFields.active_reservation_count! +
      integerFields.terminal_reservation_count! !==
      totalReservations ||
    integerFields.active_reserved_credits! +
      integerFields.terminal_reserved_credits! !==
      totalCredits ||
    integerFields.normal_scan_reserved_credits !==
      integerFields.normal_scan_reservation_count! *
        BASIC_FREE_DISCOVERY_MAX_PER_MINUTE_CREDITS ||
    integerFields.catalog_observation_reserved_credits !==
      integerFields.catalog_observation_reservation_count ||
    integerFields.window_reservation_count! > totalReservations! ||
    integerFields.window_reserved_credits! > totalCredits ||
    integerFields.window_distinct_attempt_slot_count! >
      integerFields.window_scheduled_attempt_count! ||
    integerFields.window_distinct_attempt_slot_count! > availableSlotCount ||
    integerFields.window_duplicate_attempt_slot_count !==
      integerFields.window_scheduled_attempt_count! -
        integerFields.window_distinct_attempt_slot_count! ||
    integerFields.window_scheduled_attempt_count! >
      integerFields.daily_scheduled_attempt_count! ||
    integerFields.unresolved_scheduled_attempt_count! >
      integerFields.daily_scheduled_attempt_count! ||
    integerFields.unattributed_scheduled_attempt_count! >
      integerFields.daily_scheduled_attempt_count! ||
    (!noReservations && !budgetsAreExpected) ||
    (noReservations && !budgetsAreAbsent)
  ) {
    return unavailable();
  }

  const validatedIntegerFields = {
    total_reservation_count: integerFields.total_reservation_count!,
    total_reserved_credits: integerFields.total_reserved_credits!,
    normal_scan_reservation_count:
      integerFields.normal_scan_reservation_count!,
    normal_scan_reserved_credits: integerFields.normal_scan_reserved_credits!,
    catalog_observation_reservation_count:
      integerFields.catalog_observation_reservation_count!,
    catalog_observation_reserved_credits:
      integerFields.catalog_observation_reserved_credits!,
    active_reservation_count: integerFields.active_reservation_count!,
    active_reserved_credits: integerFields.active_reserved_credits!,
    terminal_reservation_count: integerFields.terminal_reservation_count!,
    terminal_reserved_credits: integerFields.terminal_reserved_credits!,
    window_reservation_count: integerFields.window_reservation_count!,
    window_reserved_credits: integerFields.window_reserved_credits!,
    daily_scheduled_attempt_count:
      integerFields.daily_scheduled_attempt_count!,
    window_scheduled_attempt_count:
      integerFields.window_scheduled_attempt_count!,
    window_distinct_attempt_slot_count:
      integerFields.window_distinct_attempt_slot_count!,
    window_duplicate_attempt_slot_count:
      integerFields.window_duplicate_attempt_slot_count!,
    unresolved_scheduled_attempt_count:
      integerFields.unresolved_scheduled_attempt_count!,
    unattributed_scheduled_attempt_count:
      integerFields.unattributed_scheduled_attempt_count!,
  };

  return Object.freeze({
    status: "available" as const,
    snapshot: Object.freeze({
      preflight_version: OBSERVATION_SERIES_ACTIVATION_PREFLIGHT_VERSION,
      trading_date: tradingDate,
      starts_at_utc: startsAtUtc,
      expires_at_utc: expiresAtUtc,
      available_slot_count: availableSlotCount,
      requested_max_attempts: requestedMaxAttempts,
      requested_max_provider_credits: requestedMaxProviderCredits,
      ...validatedIntegerFields,
      minimum_declared_daily_credit_budget: minimumDailyBudget,
      maximum_declared_daily_credit_budget: maximumDailyBudget,
      minimum_declared_per_minute_credit_budget: minimumMinuteBudget,
      maximum_declared_per_minute_credit_budget: maximumMinuteBudget,
    }),
  });
}

export function evaluateObservationSeriesActivationDatabasePreflight(
  readback: ObservationSeriesActivationPreflightReadback,
): ObservationSeriesActivationDatabaseDecision {
  if (readback.status === "unavailable") {
    return Object.freeze({
      status: "unavailable" as const,
      readback,
      reason_codes: readback.reason_codes,
    });
  }
  const snapshot = readback.snapshot;
  const reasons = [
    ...(snapshot.window_scheduled_attempt_count === 0
      ? []
      : ["series_window_attempt_already_exists"]),
    ...(snapshot.window_duplicate_attempt_slot_count === 0
      ? []
      : ["series_window_duplicate_attempt_exists"]),
    ...(snapshot.unresolved_scheduled_attempt_count === 0
      ? []
      : ["unresolved_scheduled_attempt_exists"]),
    ...(snapshot.unattributed_scheduled_attempt_count === 0
      ? []
      : ["unattributed_scheduled_attempt_exists"]),
    ...(snapshot.active_reservation_count === 0
      ? []
      : ["active_basic_free_reservation_exists"]),
    ...(snapshot.window_reservation_count === 0 &&
    snapshot.window_reserved_credits === 0
      ? []
      : ["series_window_reservation_already_exists"]),
    ...(snapshot.total_reserved_credits +
      snapshot.requested_max_provider_credits <=
    BASIC_FREE_DISCOVERY_MAX_DAILY_CREDITS
      ? []
      : ["series_daily_credit_capacity_unavailable"]),
  ];
  return Object.freeze({
    status: reasons.length === 0 ? ("ready" as const) : ("blocked" as const),
    readback,
    reason_codes: Object.freeze(reasons),
  });
}

function unique(values: readonly string[]) {
  return [...new Set(values)];
}

export function buildObservationSeriesActivationManifest(input: {
  control: ObservationSeriesControl;
  database_preflight: ObservationSeriesActivationDatabaseDecision;
  environment: ObservationSeriesActivationEnvironment;
  build_identity: ObservationSeriesActivationBuildIdentity | null;
  now: Date;
}): ObservationSeriesActivationManifest {
  const nowValid = Number.isFinite(input.now.getTime());
  const evaluatedAt = nowValid ? input.now.toISOString() : new Date(0).toISOString();
  const validUntil = new Date(
    (nowValid ? input.now.getTime() : 0) +
      OBSERVATION_SERIES_ACTIVATION_MANIFEST_TTL_MS,
  ).toISOString();
  const environmentReasons = [
    ...(input.environment.global_scheduler_disabled
      ? []
      : ["global_scheduler_not_disabled"]),
    ...(input.environment.observation_series_disabled
      ? []
      : ["observation_series_already_enabled"]),
    ...(input.environment.normal_scan_one_shot_disabled
      ? []
      : ["normal_scan_one_shot_enabled"]),
    ...(input.environment.catalog_observation_one_shot_disabled
      ? []
      : ["catalog_observation_one_shot_enabled"]),
    ...(input.environment.catalog_capability_probe_disabled
      ? []
      : ["catalog_capability_probe_enabled"]),
    ...(input.environment.outcome_evaluation_one_shot_disabled
      ? []
      : ["outcome_evaluation_one_shot_enabled"]),
    ...(input.environment.internal_paper_worker_disabled
      ? []
      : ["internal_paper_worker_enabled"]),
    ...(input.environment.basic_free_provider_plan
      ? []
      : ["basic_free_provider_plan_unavailable"]),
    ...(input.environment.provider_plan_mode_consistent
      ? []
      : ["provider_plan_mode_mismatch"]),
    ...(input.environment.basic_free_daily_credit_budget_exact
      ? []
      : ["basic_free_daily_credit_budget_invalid"]),
    ...(input.environment.basic_free_per_minute_credit_budget_exact
      ? []
      : ["basic_free_per_minute_credit_budget_invalid"]),
  ];
  const unavailableReasons = [
    ...(input.control.status === "ready"
      ? []
      : ["observation_series_control_invalid"]),
    ...(input.database_preflight.status === "unavailable"
      ? input.database_preflight.reason_codes
      : []),
    ...(input.build_identity ? [] : ["production_build_identity_unavailable"]),
    ...(nowValid ? [] : ["activation_manifest_time_invalid"]),
  ];
  const blockedReasons = [
    ...environmentReasons,
    ...(input.database_preflight.status === "blocked"
      ? input.database_preflight.reason_codes
      : []),
    ...(input.control.starts_at_utc &&
    Date.parse(validUntil) < Date.parse(input.control.starts_at_utc)
      ? []
      : ["activation_manifest_not_valid_before_series_start"]),
  ];
  const status =
    unavailableReasons.length > 0
      ? ("unavailable" as const)
      : blockedReasons.length > 0
        ? ("blocked" as const)
        : ("ready" as const);

  return Object.freeze({
    manifest_version: OBSERVATION_SERIES_ACTIVATION_MANIFEST_VERSION,
    status,
    evaluated_at: evaluatedAt,
    valid_until: validUntil,
    control: input.control,
    build_identity: input.build_identity,
    environment: Object.freeze({ ...input.environment }),
    database_preflight: input.database_preflight,
    reason_codes: Object.freeze(unique([...unavailableReasons, ...blockedReasons])),
    authority: Object.freeze({
      mutates_configuration: false as const,
      arms_scheduler: false as const,
      calls_provider: false as const,
      reserves_provider_credits: false as const,
      changes_ranking: false as const,
      publishes_candidate: false as const,
      executes_paper_trade: false as const,
      executes_broker_order: false as const,
    }),
  });
}

export function observationSeriesActivationEnvironmentFrom(
  environment: Readonly<{ get(name: string): string | undefined }>,
): ObservationSeriesActivationEnvironment {
  const disabled = (name: string) => environment.get(name) !== "true";
  const providerPlan = buildProviderPlanProfile({
    TWELVE_DATA_PLAN_MODE: environment.get("TWELVE_DATA_PLAN_MODE"),
    PROVIDER_PLAN_MODE: environment.get("PROVIDER_PLAN_MODE"),
    NEXT_PUBLIC_TWELVE_DATA_PLAN_MODE: environment.get(
      "NEXT_PUBLIC_TWELVE_DATA_PLAN_MODE",
    ),
    NEXT_PUBLIC_PROVIDER_PLAN_MODE: environment.get(
      "NEXT_PUBLIC_PROVIDER_PLAN_MODE",
    ),
  });
  const exactBudget = (name: string, expected: number) => {
    const value = environment.get(name);
    return value?.trim() === String(expected);
  };
  return Object.freeze({
    global_scheduler_disabled:
      environment.get("TURE_DISABLE_SCHEDULED_FUNCTIONS") === "true",
    observation_series_disabled: disabled("TURE_OBSERVATION_SERIES_ENABLED"),
    normal_scan_one_shot_disabled: disabled("TURE_NORMAL_SCAN_ONE_SHOT_ENABLED"),
    catalog_observation_one_shot_disabled: disabled(
      "TURE_BASIC_FREE_CATALOG_OBSERVATION_ONE_SHOT_ENABLED",
    ),
    catalog_capability_probe_disabled: disabled(
      "TURE_BASIC_FREE_CATALOG_CAPABILITY_PROBE_ENABLED",
    ),
    outcome_evaluation_one_shot_disabled: disabled(
      "TURE_OUTCOME_EVALUATION_ONE_SHOT_ENABLED",
    ),
    internal_paper_worker_disabled: disabled("TURE_INTERNAL_PAPER_WORKER_ENABLED"),
    basic_free_provider_plan: providerPlan.effective_mode === "free",
    provider_plan_mode_consistent: !providerPlan.plan_mode_mismatch,
    basic_free_daily_credit_budget_exact: exactBudget(
      "TURE_BASIC_FREE_CATALOG_DAILY_CREDIT_BUDGET",
      BASIC_FREE_DISCOVERY_MAX_DAILY_CREDITS,
    ),
    basic_free_per_minute_credit_budget_exact: exactBudget(
      "TURE_BASIC_FREE_CATALOG_PER_MINUTE_CREDIT_BUDGET",
      BASIC_FREE_DISCOVERY_MAX_PER_MINUTE_CREDITS,
    ),
  });
}

export function observationSeriesActivationBuildIdentityFromUnknown(
  value: unknown,
): ObservationSeriesActivationBuildIdentity | null {
  const candidate = objectOrNull(value);
  if (candidate?.schema_version !== "scheduled_scan_deployment_identity_v1") {
    return null;
  }
  return observationSeriesActivationBuildIdentityFrom({
    get(name) {
      const key =
        name === "DEPLOY_ID"
          ? "deploy_id"
          : name === "CONTEXT"
            ? "deploy_context"
            : name === "COMMIT_REF" || name === "NETLIFY_COMMIT_REF"
              ? "commit_ref"
              : name === "SITE_ID"
                ? "site_id"
                : null;
      const field = key ? candidate[key] : null;
      return typeof field === "string" ? field : undefined;
    },
  });
}

export function observationSeriesActivationBuildIdentityFrom(
  environment: Readonly<{ get(name: string): string | undefined }>,
): ObservationSeriesActivationBuildIdentity | null {
  const deployId = environment.get("DEPLOY_ID")?.trim().toLowerCase() ?? "";
  const commitRef =
    environment.get("COMMIT_REF")?.trim().toLowerCase() ??
    environment.get("NETLIFY_COMMIT_REF")?.trim().toLowerCase() ??
    "";
  const siteId = environment.get("SITE_ID")?.trim().toLowerCase() ?? "";
  if (
    environment.get("CONTEXT") !== "production" ||
    !/^[0-9a-f]{24}$/.test(deployId) ||
    !/^[0-9a-f]{40}$/.test(commitRef) ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(
      siteId,
    )
  ) {
    return null;
  }
  return Object.freeze({
    deploy_id: deployId,
    deploy_context: "production" as const,
    commit_ref: commitRef,
    site_id: siteId,
  });
}
