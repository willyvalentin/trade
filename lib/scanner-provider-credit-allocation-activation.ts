import {
  buildObservationSeriesActivationManifest,
  observationSeriesActivationEnvironmentFrom,
  type ObservationSeriesActivationBuildIdentity,
  type ObservationSeriesActivationDatabaseDecision,
  type ObservationSeriesActivationEnvironment,
} from "@/lib/observation-series-activation-preflight";
import {
  observationSeriesControlFromEnvironment,
  type ObservationSeriesControl,
} from "@/lib/observation-series-control";
import {
  SCANNER_PROVIDER_CREDIT_ALLOCATION_LIVE_EXPERIMENT_CONTRACT,
  SCANNER_PROVIDER_CREDIT_ALLOCATION_LIVE_EXPERIMENT_VERSION,
  resolveScannerProviderCreditAllocationLiveExperiment,
} from "@/lib/scanner-provider-credit-allocation-live-experiment";
import {
  SCANNER_PROVIDER_CREDIT_ALLOCATION_EXPERIMENT_ENABLED_ENV,
  SCANNER_PROVIDER_CREDIT_ALLOCATION_EXPERIMENT_EXPECTED_REVISION_ENV,
  SCANNER_PROVIDER_CREDIT_ALLOCATION_EXPERIMENT_ID_ENV,
} from "@/lib/scanner-provider-credit-allocation-runtime-admission";

export const SCANNER_PROVIDER_CREDIT_ALLOCATION_ACTIVATION_VERSION =
  "scanner_provider_credit_allocation_activation_v1" as const;
export const SCANNER_PROVIDER_CREDIT_ALLOCATION_ACTIVATION_MANIFEST_VERSION =
  "scanner_provider_credit_allocation_activation_manifest_v1" as const;
export const SCANNER_PROVIDER_CREDIT_ALLOCATION_ACTIVATION_MANIFEST_TTL_MS =
  5 * 60_000;

type EnvironmentReader = Readonly<{
  get(name: string): string | undefined;
}>;

export type ScannerProviderCreditAllocationActivationControl = Readonly<{
  activation_version: typeof SCANNER_PROVIDER_CREDIT_ALLOCATION_ACTIVATION_VERSION;
  requested: boolean;
  status: "disabled" | "ready" | "invalid";
  experiment_id: string | null;
  expected_revision: string | null;
  observation_series_control: ObservationSeriesControl;
  reason_codes: readonly string[];
  authority: Readonly<{
    arms_scheduler: false;
    calls_provider: false;
    reserves_provider_credits: false;
    changes_ranking: false;
    publishes_candidate: false;
    executes_broker_order: false;
  }>;
}>;

export type ScannerProviderCreditAllocationScheduledSlotAdmission = Readonly<{
  activation_version: typeof SCANNER_PROVIDER_CREDIT_ALLOCATION_ACTIVATION_VERSION;
  decision: "bypass" | "eligible" | "no_request" | "reject";
  status:
    | "experiment_disabled"
    | "eligible"
    | "slot_not_declared"
    | "configuration_invalid"
    | "runtime_admission_rejected";
  experiment_id: string | null;
  scheduled_slot_utc: string | null;
  expected_revision: string | null;
  deployed_revision: string | null;
  reason_codes: readonly string[];
}>;

export type ScannerProviderCreditAllocationActivationEnvironment =
  ObservationSeriesActivationEnvironment &
    Readonly<{
      allocation_experiment_disabled: boolean;
      allocation_experiment_id_unset: boolean;
      allocation_experiment_expected_revision_unset: boolean;
    }>;

export type ScannerProviderCreditAllocationActivationManifest = Readonly<{
  manifest_version: typeof SCANNER_PROVIDER_CREDIT_ALLOCATION_ACTIVATION_MANIFEST_VERSION;
  status: "ready" | "blocked" | "unavailable";
  evaluated_at: string;
  valid_until: string;
  experiment_version: typeof SCANNER_PROVIDER_CREDIT_ALLOCATION_LIVE_EXPERIMENT_VERSION;
  experiment: typeof SCANNER_PROVIDER_CREDIT_ALLOCATION_LIVE_EXPERIMENT_CONTRACT;
  observation_series_control: ObservationSeriesControl;
  activation_configuration: Readonly<{
    experiment_enabled: true;
    experiment_id: string;
    experiment_expected_revision: string | null;
    observation_series_enabled: true;
    observation_series_date: string;
    observation_series_start_slot_utc: string;
    observation_series_expires_at_utc: string;
    observation_series_max_attempts: number;
    observation_series_max_provider_credits: number;
  }>;
  build_identity: ObservationSeriesActivationBuildIdentity | null;
  environment: ScannerProviderCreditAllocationActivationEnvironment;
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

function authority() {
  return Object.freeze({
    arms_scheduler: false as const,
    calls_provider: false as const,
    reserves_provider_credits: false as const,
    changes_ranking: false as const,
    publishes_candidate: false as const,
    executes_broker_order: false as const,
  });
}

function unique(values: readonly string[]) {
  return Object.freeze([...new Set(values)]);
}

function normalizedRevision(value: unknown) {
  const candidate = typeof value === "string" ? value.trim().toLowerCase() : "";
  return /^[0-9a-f]{40}$/.test(candidate) ? candidate : null;
}

function expectedObservationSeriesValues() {
  const contract = SCANNER_PROVIDER_CREDIT_ALLOCATION_LIVE_EXPERIMENT_CONTRACT;
  return new Map<string, string>([
    ["TURE_OBSERVATION_SERIES_ENABLED", "true"],
    ["TURE_OBSERVATION_SERIES_DATE", contract.trading_date],
    ["TURE_OBSERVATION_SERIES_START_SLOT_UTC", contract.slots[0].slot_utc],
    ["TURE_OBSERVATION_SERIES_EXPIRES_AT_UTC", contract.expires_at_utc],
    ["TURE_OBSERVATION_SERIES_MAX_ATTEMPTS", String(contract.max_attempts)],
    [
      "TURE_OBSERVATION_SERIES_MAX_PROVIDER_CREDITS",
      String(contract.max_total_provider_credits),
    ],
  ]);
}

export function scannerProviderCreditAllocationExpectedObservationSeriesControl() {
  const values = expectedObservationSeriesValues();
  return observationSeriesControlFromEnvironment({
    get: (name) => values.get(name),
  });
}

function sameObservationSeriesControl(
  actual: ObservationSeriesControl,
  expected: ObservationSeriesControl,
) {
  return (
    actual.status === "ready" &&
    expected.status === "ready" &&
    actual.series_id === expected.series_id &&
    actual.trading_date === expected.trading_date &&
    actual.starts_at_utc === expected.starts_at_utc &&
    actual.expires_at_utc === expected.expires_at_utc &&
    actual.max_attempts === expected.max_attempts &&
    actual.max_provider_credits === expected.max_provider_credits
  );
}

export function scannerProviderCreditAllocationActivationControlFromEnvironment(
  environment: EnvironmentReader,
): ScannerProviderCreditAllocationActivationControl {
  const observationSeriesControl = observationSeriesControlFromEnvironment(
    environment,
  );
  const expectedControl =
    scannerProviderCreditAllocationExpectedObservationSeriesControl();
  const experimentId =
    environment
      .get(SCANNER_PROVIDER_CREDIT_ALLOCATION_EXPERIMENT_ID_ENV)
      ?.trim() || null;
  const enabledValue =
    environment
      .get(SCANNER_PROVIDER_CREDIT_ALLOCATION_EXPERIMENT_ENABLED_ENV)
      ?.trim() || null;
  const expectedRevisionValue =
    environment
      .get(
        SCANNER_PROVIDER_CREDIT_ALLOCATION_EXPERIMENT_EXPECTED_REVISION_ENV,
      )
      ?.trim() || null;
  const requested =
    enabledValue === "true" ||
    experimentId !== null ||
    expectedRevisionValue !== null;
  const expectedRevision = normalizedRevision(
    expectedRevisionValue,
  );

  if (!requested) {
    return Object.freeze({
      activation_version:
        SCANNER_PROVIDER_CREDIT_ALLOCATION_ACTIVATION_VERSION,
      requested: false,
      status: "disabled" as const,
      experiment_id: experimentId,
      expected_revision: expectedRevision,
      observation_series_control: observationSeriesControl,
      reason_codes: Object.freeze(["allocation_experiment_disabled"]),
      authority: authority(),
    });
  }

  const reasons = [
    ...(enabledValue === "true"
      ? []
      : ["allocation_experiment_enabled_flag_invalid"]),
    ...(experimentId ===
    SCANNER_PROVIDER_CREDIT_ALLOCATION_LIVE_EXPERIMENT_CONTRACT.experiment_id
      ? []
      : ["allocation_experiment_id_mismatch"]),
    ...(expectedRevision ? [] : ["allocation_experiment_revision_invalid"]),
    ...(sameObservationSeriesControl(observationSeriesControl, expectedControl)
      ? []
      : ["allocation_experiment_observation_series_mismatch"]),
  ];

  return Object.freeze({
    activation_version: SCANNER_PROVIDER_CREDIT_ALLOCATION_ACTIVATION_VERSION,
    requested: true,
    status: reasons.length === 0 ? ("ready" as const) : ("invalid" as const),
    experiment_id: experimentId,
    expected_revision: expectedRevision,
    observation_series_control: observationSeriesControl,
    reason_codes: unique(
      reasons.length === 0 ? ["allocation_experiment_ready"] : reasons,
    ),
    authority: authority(),
  });
}

export function buildScannerProviderCreditAllocationScheduledSlotAdmission({
  control,
  scheduledSlotUtc,
  now,
  deployedRevision,
}: {
  control: ScannerProviderCreditAllocationActivationControl;
  scheduledSlotUtc: string | null | undefined;
  now: Date;
  deployedRevision: string | null | undefined;
}): ScannerProviderCreditAllocationScheduledSlotAdmission {
  const deployed = normalizedRevision(deployedRevision);
  const slot =
    typeof scheduledSlotUtc === "string"
      ? SCANNER_PROVIDER_CREDIT_ALLOCATION_LIVE_EXPERIMENT_CONTRACT.slots.find(
          (candidate) => candidate.slot_utc === scheduledSlotUtc,
        ) ?? null
      : null;
  const base = {
    activation_version: SCANNER_PROVIDER_CREDIT_ALLOCATION_ACTIVATION_VERSION,
    experiment_id: control.experiment_id,
    scheduled_slot_utc:
      typeof scheduledSlotUtc === "string" ? scheduledSlotUtc : null,
    expected_revision: control.expected_revision,
    deployed_revision: deployed,
  };

  if (!control.requested) {
    return Object.freeze({
      ...base,
      decision: "bypass" as const,
      status: "experiment_disabled" as const,
      reason_codes: Object.freeze(["allocation_experiment_disabled"]),
    });
  }
  if (control.status !== "ready") {
    return Object.freeze({
      ...base,
      decision: "reject" as const,
      status: "configuration_invalid" as const,
      reason_codes: control.reason_codes,
    });
  }
  if (!slot) {
    return Object.freeze({
      ...base,
      decision: "no_request" as const,
      status: "slot_not_declared" as const,
      reason_codes: Object.freeze(["allocation_experiment_slot_not_declared"]),
    });
  }

  const runtimeAdmission = resolveScannerProviderCreditAllocationLiveExperiment({
    enabled: true,
    experimentId: control.experiment_id,
    scheduledSlotUtc,
    now,
    expectedRevision: control.expected_revision,
    deployedRevision: deployed,
  });
  if (runtimeAdmission.status !== "admitted") {
    return Object.freeze({
      ...base,
      decision: "reject" as const,
      status: "runtime_admission_rejected" as const,
      reason_codes: runtimeAdmission.reason_codes,
    });
  }

  return Object.freeze({
    ...base,
    decision: "eligible" as const,
    status: "eligible" as const,
    reason_codes: Object.freeze(["allocation_experiment_exact_slot_eligible"]),
  });
}

export function scannerProviderCreditAllocationActivationEnvironmentFrom(
  environment: EnvironmentReader,
): ScannerProviderCreditAllocationActivationEnvironment {
  const base = observationSeriesActivationEnvironmentFrom(environment);
  const experimentId = environment.get(
    SCANNER_PROVIDER_CREDIT_ALLOCATION_EXPERIMENT_ID_ENV,
  );
  const expectedRevision = environment.get(
    SCANNER_PROVIDER_CREDIT_ALLOCATION_EXPERIMENT_EXPECTED_REVISION_ENV,
  );
  return Object.freeze({
    ...base,
    allocation_experiment_disabled:
      environment.get(
        SCANNER_PROVIDER_CREDIT_ALLOCATION_EXPERIMENT_ENABLED_ENV,
      ) !== "true",
    allocation_experiment_id_unset: !experimentId?.trim(),
    allocation_experiment_expected_revision_unset: !expectedRevision?.trim(),
  });
}

export function buildScannerProviderCreditAllocationActivationManifest(input: {
  database_preflight: ObservationSeriesActivationDatabaseDecision;
  environment: ScannerProviderCreditAllocationActivationEnvironment;
  build_identity: ObservationSeriesActivationBuildIdentity | null;
  now: Date;
}): ScannerProviderCreditAllocationActivationManifest {
  const control = scannerProviderCreditAllocationExpectedObservationSeriesControl();
  const baseManifest = buildObservationSeriesActivationManifest({
    control,
    database_preflight: input.database_preflight,
    environment: input.environment,
    build_identity: input.build_identity,
    now: input.now,
  });
  const extraReasons = [
    ...(input.environment.allocation_experiment_disabled
      ? []
      : ["allocation_experiment_already_enabled"]),
    ...(input.environment.allocation_experiment_id_unset
      ? []
      : ["allocation_experiment_id_already_configured"]),
    ...(input.environment.allocation_experiment_expected_revision_unset
      ? []
      : ["allocation_experiment_revision_already_configured"]),
  ];
  const status =
    baseManifest.status === "unavailable"
      ? ("unavailable" as const)
      : baseManifest.status === "blocked" || extraReasons.length > 0
        ? ("blocked" as const)
        : ("ready" as const);
  const contract = SCANNER_PROVIDER_CREDIT_ALLOCATION_LIVE_EXPERIMENT_CONTRACT;

  return Object.freeze({
    manifest_version:
      SCANNER_PROVIDER_CREDIT_ALLOCATION_ACTIVATION_MANIFEST_VERSION,
    status,
    evaluated_at: baseManifest.evaluated_at,
    valid_until: baseManifest.valid_until,
    experiment_version:
      SCANNER_PROVIDER_CREDIT_ALLOCATION_LIVE_EXPERIMENT_VERSION,
    experiment: contract,
    observation_series_control: control,
    activation_configuration: Object.freeze({
      experiment_enabled: true as const,
      experiment_id: contract.experiment_id,
      experiment_expected_revision: input.build_identity?.commit_ref ?? null,
      observation_series_enabled: true as const,
      observation_series_date: contract.trading_date,
      observation_series_start_slot_utc: contract.slots[0].slot_utc,
      observation_series_expires_at_utc: contract.expires_at_utc,
      observation_series_max_attempts: contract.max_attempts,
      observation_series_max_provider_credits:
        contract.max_total_provider_credits,
    }),
    build_identity: input.build_identity,
    environment: input.environment,
    database_preflight: input.database_preflight,
    reason_codes: unique([...baseManifest.reason_codes, ...extraReasons]),
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
