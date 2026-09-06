import "server-only";

/**
 * AI-02.14 freezes the permitted shape of a future metadata-only staging
 * preflight. It deliberately validates a plan without opening a connection,
 * reading an environment variable, or preparing a branch deployment.
 */
export const TURE_SETUP_ANALYST_STAGING_NONSECRET_PREFLIGHT_ADMISSION_VERSION =
  "ture_setup_analyst_staging_nonsecret_preflight_admission_v1" as const;

export type TureSetupAnalystStagingNonsecretPreflightAdmissionAuthority =
  Readonly<{
    mode: "server_only_staging_nonsecret_preflight_admission";
    may_access_staging: false;
    may_access_production: false;
    may_access_secrets: false;
    may_perform_io: false;
    may_read_source_rows: false;
    may_read_credential_values: false;
    may_invoke_provider: false;
    may_invoke_evaluator: false;
    may_deploy_branch_adapter: false;
    may_persist_recommendation_outcome: false;
    may_apply_active_evidence_migration: false;
    may_write_active_evidence: false;
    may_form_offline_dataset: false;
    may_run_offline_evaluation: false;
    may_bind_runtime: false;
    may_place_or_cancel_orders: false;
    may_submit_broker_instructions: false;
  }>;

export const TURE_SETUP_ANALYST_STAGING_NONSECRET_PREFLIGHT_ADMISSION_AUTHORITY: TureSetupAnalystStagingNonsecretPreflightAdmissionAuthority =
  Object.freeze({
    mode: "server_only_staging_nonsecret_preflight_admission",
    may_access_staging: false,
    may_access_production: false,
    may_access_secrets: false,
    may_perform_io: false,
    may_read_source_rows: false,
    may_read_credential_values: false,
    may_invoke_provider: false,
    may_invoke_evaluator: false,
    may_deploy_branch_adapter: false,
    may_persist_recommendation_outcome: false,
    may_apply_active_evidence_migration: false,
    may_write_active_evidence: false,
    may_form_offline_dataset: false,
    may_run_offline_evaluation: false,
    may_bind_runtime: false,
    may_place_or_cancel_orders: false,
    may_submit_broker_instructions: false,
  });

export type AdmitTureSetupAnalystStagingNonsecretPreflightInput = Readonly<{
  scope: Readonly<{
    environment: "staging";
    source_relation: "public.recommendation_outcomes";
    existing_source_availability: "no_completed_bundle_available";
    source_rows: "not_read";
    credential_presence: "nonsecret_presence_only";
    credential_identity: "application_owner_preflight_required";
    credential_values: "not_read";
    transport: "temporary_branch_deploy_adapter";
    deploy_context: "deploy_preview_only";
    staging_connection: "not_opened";
    branch_adapter: "not_deployed";
    provider_evaluator: "not_invoked";
    outcome_persistence: "not_admitted";
    active_evidence_migration: "not_admitted";
    active_evidence_write: "not_admitted";
    offline_dataset: "not_admitted";
    offline_evaluation: "not_admitted";
    runtime_binding: "not_admitted";
    broker_binding: "not_admitted";
    production_binding: "not_admitted";
  }>;
}>;

export type TureSetupAnalystStagingNonsecretPreflightAdmission = Readonly<{
  admission_version: typeof TURE_SETUP_ANALYST_STAGING_NONSECRET_PREFLIGHT_ADMISSION_VERSION;
  mode: "server_only_staging_nonsecret_preflight_admission";
  admission_status: "staging_nonsecret_preflight_scope_validated_not_authorized_not_executed";
  permitted_metadata: Readonly<{
    environment: "staging";
    credential_presence: "nonsecret_presence_only";
    deploy_context: "deploy_preview_only";
  }>;
  required_preconditions: readonly [
    "no_completed_bundle_available_preflight",
    "no_source_row_or_credential_value_read",
    "application_owner_identity_preflight_required",
    "temporary_deploy_preview_only_transport",
  ];
  excluded_authority: readonly [
    "staging_connection",
    "credential_value_read",
    "source_row_read",
    "provider_invocation",
    "evaluator_invocation",
    "branch_adapter_deploy",
    "recommendation_outcome_persistence",
    "active_evidence_migration",
    "active_evidence_write",
    "offline_dataset",
    "offline_evaluation",
    "runtime",
    "broker",
    "production",
  ];
  next_gate: "separately_authorized_staging_nonsecret_credential_presence_and_branch_transport_preflight_execution";
  authority: TureSetupAnalystStagingNonsecretPreflightAdmissionAuthority;
}>;

type PlainRecord = Record<string, unknown>;

const inputKeys = ["scope"] as const;
const scopeKeys = [
  "active_evidence_migration",
  "active_evidence_write",
  "branch_adapter",
  "broker_binding",
  "credential_identity",
  "credential_presence",
  "credential_values",
  "deploy_context",
  "environment",
  "existing_source_availability",
  "offline_dataset",
  "offline_evaluation",
  "outcome_persistence",
  "production_binding",
  "provider_evaluator",
  "runtime_binding",
  "source_relation",
  "source_rows",
  "staging_connection",
  "transport",
] as const;

function hasExactOwnDataKeys(
  value: unknown,
  keys: readonly string[],
): value is PlainRecord {
  try {
    if (!value || typeof value !== "object" || !Object.isFrozen(value)) {
      return false;
    }
    if (Object.getPrototypeOf(value) !== Object.prototype) return false;
    const ownKeys = Reflect.ownKeys(value);
    if (ownKeys.some((key) => typeof key !== "string")) return false;
    if (ownKeys.length !== keys.length) return false;
    if (![...ownKeys].every((key) => keys.includes(key as never))) return false;
    return ownKeys.every((key) => {
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      return Boolean(
        descriptor &&
          descriptor.enumerable &&
          Object.prototype.hasOwnProperty.call(descriptor, "value"),
      );
    });
  } catch {
    return false;
  }
}

function ownData(value: PlainRecord, key: string): unknown {
  return Object.getOwnPropertyDescriptor(value, key)?.value;
}

function hasRequiredScopeShape(value: unknown): boolean {
  if (!hasExactOwnDataKeys(value, scopeKeys)) return false;

  return (
    ownData(value, "environment") === "staging" &&
    ownData(value, "source_relation") === "public.recommendation_outcomes" &&
    ownData(value, "existing_source_availability") ===
      "no_completed_bundle_available" &&
    ownData(value, "source_rows") === "not_read" &&
    ownData(value, "credential_presence") === "nonsecret_presence_only" &&
    ownData(value, "credential_identity") ===
      "application_owner_preflight_required" &&
    ownData(value, "credential_values") === "not_read" &&
    ownData(value, "transport") === "temporary_branch_deploy_adapter" &&
    ownData(value, "deploy_context") === "deploy_preview_only" &&
    ownData(value, "staging_connection") === "not_opened" &&
    ownData(value, "branch_adapter") === "not_deployed" &&
    ownData(value, "provider_evaluator") === "not_invoked" &&
    ownData(value, "outcome_persistence") === "not_admitted" &&
    ownData(value, "active_evidence_migration") === "not_admitted" &&
    ownData(value, "active_evidence_write") === "not_admitted" &&
    ownData(value, "offline_dataset") === "not_admitted" &&
    ownData(value, "offline_evaluation") === "not_admitted" &&
    ownData(value, "runtime_binding") === "not_admitted" &&
    ownData(value, "broker_binding") === "not_admitted" &&
    ownData(value, "production_binding") === "not_admitted"
  );
}

export function admitTureSetupAnalystStagingNonsecretPreflight(
  input: AdmitTureSetupAnalystStagingNonsecretPreflightInput,
): TureSetupAnalystStagingNonsecretPreflightAdmission {
  if (!hasExactOwnDataKeys(input, inputKeys)) {
    throw new TypeError(
      "Invalid Ture Setup Analyst staging nonsecret preflight admission input.",
    );
  }
  if (!hasRequiredScopeShape(ownData(input, "scope"))) {
    throw new TypeError(
      "Invalid Ture Setup Analyst staging nonsecret preflight admission input.",
    );
  }

  return Object.freeze({
    admission_version:
      TURE_SETUP_ANALYST_STAGING_NONSECRET_PREFLIGHT_ADMISSION_VERSION,
    mode: "server_only_staging_nonsecret_preflight_admission",
    admission_status:
      "staging_nonsecret_preflight_scope_validated_not_authorized_not_executed",
    permitted_metadata: Object.freeze({
      environment: "staging",
      credential_presence: "nonsecret_presence_only",
      deploy_context: "deploy_preview_only",
    }),
    required_preconditions: Object.freeze([
      "no_completed_bundle_available_preflight",
      "no_source_row_or_credential_value_read",
      "application_owner_identity_preflight_required",
      "temporary_deploy_preview_only_transport",
    ] as const),
    excluded_authority: Object.freeze([
      "staging_connection",
      "credential_value_read",
      "source_row_read",
      "provider_invocation",
      "evaluator_invocation",
      "branch_adapter_deploy",
      "recommendation_outcome_persistence",
      "active_evidence_migration",
      "active_evidence_write",
      "offline_dataset",
      "offline_evaluation",
      "runtime",
      "broker",
      "production",
    ] as const),
    next_gate:
      "separately_authorized_staging_nonsecret_credential_presence_and_branch_transport_preflight_execution",
    authority: TURE_SETUP_ANALYST_STAGING_NONSECRET_PREFLIGHT_ADMISSION_AUTHORITY,
  });
}
