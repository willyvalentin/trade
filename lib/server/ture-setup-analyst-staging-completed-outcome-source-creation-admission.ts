import "server-only";

/**
 * AI-02.12 makes the sole eligible design response to an empty selected
 * outcome source reviewable without invoking it. The existing scheduled
 * function is deliberately excluded because its five-batch, ten-snapshot
 * defaults cannot satisfy this one-shot plan. The contract cannot reach
 * staging, read credentials, call a provider, or create a source/evidence row.
 */
export const TURE_SETUP_ANALYST_STAGING_COMPLETED_OUTCOME_SOURCE_CREATION_ADMISSION_VERSION =
  "ture_setup_analyst_staging_completed_outcome_source_creation_admission_v1" as const;

export type TureSetupAnalystStagingCompletedOutcomeSourceCreationAdmissionAuthority =
  Readonly<{
    mode: "server_only_staging_completed_outcome_source_creation_admission";
    may_access_staging: false;
    may_access_production: false;
    may_access_secrets: false;
    may_perform_io: false;
    may_invoke_scheduled_outcome_evaluation: false;
    may_invoke_one_shot_outcome_evaluation_adapter: false;
    may_invoke_provider: false;
    may_persist_recommendation_outcome: false;
    may_apply_active_evidence_migration: false;
    may_write_active_evidence: false;
    may_form_offline_dataset: false;
    may_run_offline_evaluation: false;
    may_invoke_model: false;
    may_bind_runtime: false;
    may_change_canonical_recommendation: false;
    may_change_ranking: false;
    may_change_execution_eligibility: false;
    may_change_position_state: false;
    may_change_risk_settings: false;
    may_place_or_cancel_orders: false;
    may_submit_broker_instructions: false;
  }>;

export const TURE_SETUP_ANALYST_STAGING_COMPLETED_OUTCOME_SOURCE_CREATION_ADMISSION_AUTHORITY: TureSetupAnalystStagingCompletedOutcomeSourceCreationAdmissionAuthority =
  Object.freeze({
    mode: "server_only_staging_completed_outcome_source_creation_admission",
    may_access_staging: false,
    may_access_production: false,
    may_access_secrets: false,
    may_perform_io: false,
    may_invoke_scheduled_outcome_evaluation: false,
    may_invoke_one_shot_outcome_evaluation_adapter: false,
    may_invoke_provider: false,
    may_persist_recommendation_outcome: false,
    may_apply_active_evidence_migration: false,
    may_write_active_evidence: false,
    may_form_offline_dataset: false,
    may_run_offline_evaluation: false,
    may_invoke_model: false,
    may_bind_runtime: false,
    may_change_canonical_recommendation: false,
    may_change_ranking: false,
    may_change_execution_eligibility: false,
    may_change_position_state: false,
    may_change_risk_settings: false,
    may_place_or_cancel_orders: false,
    may_submit_broker_instructions: false,
  });

export type AdmitTureSetupAnalystStagingCompletedOutcomeSourceCreationInput =
  Readonly<{
    scope: Readonly<{
      environment: "staging";
      source_relation: "public.recommendation_outcomes";
      existing_source_availability: "no_completed_bundle_available";
      operation: "one_staging_only_one_shot_outcome_evaluation_adapter";
      source_input: "one_server_owned_official_snapshot_only";
      producer: "official_scheduled_outcome_evaluation";
      scheduled_default_bounds: "five_batches_ten_snapshots_not_admitted";
      one_shot_transport: "separately_authorized_staging_branch_deploy_only";
      producer_authentication: "automation_secret_and_application_owner_principal";
      outcome_persistence: "server_supabase_service_role_upsert";
      owner_binding: "one_application_owner_bound_snapshot_fingerprint";
      primary_horizon: "60m";
      diagnostic_horizons: "15m_30m_60m_exact";
      outcome_completion: "intraday_candles_complete";
      maximum_completed_bundles: "one";
      provider_credentials: "existing_server_managed_only";
      provider_cost_control: "separately_authorized_bounded";
      active_evidence_relation: "public.canonical_active_evaluation_evidence";
      active_evidence_migration: "separately_authorized_after_source_exists";
      active_evidence_write: "not_admitted";
      evaluator_binding: "not_admitted";
      promotion_binding: "not_admitted";
      runtime_binding: "not_admitted";
      provider_model_binding: "not_admitted";
      deployment_binding: "not_admitted";
      broker_binding: "not_admitted";
      production_binding: "not_admitted";
    }>;
  }>;

export type TureSetupAnalystStagingCompletedOutcomeSourceCreationAdmission =
  Readonly<{
    admission_version: typeof TURE_SETUP_ANALYST_STAGING_COMPLETED_OUTCOME_SOURCE_CREATION_ADMISSION_VERSION;
    mode: "server_only_staging_completed_outcome_source_creation_admission";
    admission_status: "source_creation_scope_validated_not_authorized_not_executed";
    permitted_scope: Readonly<{
      environment: "staging";
      source_relation: "public.recommendation_outcomes";
      operation: "one_staging_only_one_shot_outcome_evaluation_adapter";
      source_input: "one_server_owned_official_snapshot_only";
      maximum_completed_bundles: "one";
    }>;
    required_preconditions: readonly [
      "no_completed_bundle_available_preflight",
      "scheduled_default_five_batch_ten_snapshot_shape_not_admitted",
      "isolated_staging_one_shot_adapter",
      "one_server_owned_official_snapshot",
      "strict_one_batch_one_snapshot_request_limits",
      "application_owner_bound_snapshot_fingerprint",
      "complete_intraday_candle_evidence",
      "primary_60m_outcome",
      "diagnostic_15m_30m_60m_horizons",
      "separately_authorized_bounded_provider_cost",
      "server_managed_credential_identity_preflight",
    ];
    excluded_authority: readonly [
      "source_row_read",
      "secret_read",
      "provider_invocation",
      "recommendation_outcome_persistence",
      "active_evidence_migration",
      "active_evidence_write",
      "offline_dataset",
      "offline_evaluation",
      "promotion",
      "runtime",
      "deployment",
      "broker",
      "production",
    ];
    next_gate: "separately_authorized_staging_cost_identity_and_one_shot_transport_preflight";
    authority: TureSetupAnalystStagingCompletedOutcomeSourceCreationAdmissionAuthority;
  }>;

type PlainRecord = Record<string, unknown>;

const inputKeys = ["scope"] as const;
const scopeKeys = [
  "active_evidence_migration",
  "active_evidence_relation",
  "active_evidence_write",
  "broker_binding",
  "deployment_binding",
  "diagnostic_horizons",
  "environment",
  "evaluator_binding",
  "existing_source_availability",
  "maximum_completed_bundles",
  "operation",
  "outcome_completion",
  "outcome_persistence",
  "owner_binding",
  "primary_horizon",
  "producer",
  "producer_authentication",
  "production_binding",
  "promotion_binding",
  "provider_cost_control",
  "provider_credentials",
  "provider_model_binding",
  "runtime_binding",
  "scheduled_default_bounds",
  "source_input",
  "source_relation",
  "one_shot_transport",
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
    ownData(value, "operation") ===
      "one_staging_only_one_shot_outcome_evaluation_adapter" &&
    ownData(value, "source_input") ===
      "one_server_owned_official_snapshot_only" &&
    ownData(value, "producer") === "official_scheduled_outcome_evaluation" &&
    ownData(value, "scheduled_default_bounds") ===
      "five_batches_ten_snapshots_not_admitted" &&
    ownData(value, "one_shot_transport") ===
      "separately_authorized_staging_branch_deploy_only" &&
    ownData(value, "producer_authentication") ===
      "automation_secret_and_application_owner_principal" &&
    ownData(value, "outcome_persistence") ===
      "server_supabase_service_role_upsert" &&
    ownData(value, "owner_binding") ===
      "one_application_owner_bound_snapshot_fingerprint" &&
    ownData(value, "primary_horizon") === "60m" &&
    ownData(value, "diagnostic_horizons") === "15m_30m_60m_exact" &&
    ownData(value, "outcome_completion") === "intraday_candles_complete" &&
    ownData(value, "maximum_completed_bundles") === "one" &&
    ownData(value, "provider_credentials") === "existing_server_managed_only" &&
    ownData(value, "provider_cost_control") === "separately_authorized_bounded" &&
    ownData(value, "active_evidence_relation") ===
      "public.canonical_active_evaluation_evidence" &&
    ownData(value, "active_evidence_migration") ===
      "separately_authorized_after_source_exists" &&
    ownData(value, "active_evidence_write") === "not_admitted" &&
    ownData(value, "evaluator_binding") === "not_admitted" &&
    ownData(value, "promotion_binding") === "not_admitted" &&
    ownData(value, "runtime_binding") === "not_admitted" &&
    ownData(value, "provider_model_binding") === "not_admitted" &&
    ownData(value, "deployment_binding") === "not_admitted" &&
    ownData(value, "broker_binding") === "not_admitted" &&
    ownData(value, "production_binding") === "not_admitted"
  );
}

export function admitTureSetupAnalystStagingCompletedOutcomeSourceCreation(
  input: AdmitTureSetupAnalystStagingCompletedOutcomeSourceCreationInput,
): TureSetupAnalystStagingCompletedOutcomeSourceCreationAdmission {
  if (!hasExactOwnDataKeys(input, inputKeys)) {
    throw new TypeError(
      "Invalid Ture Setup Analyst staging completed-outcome source creation admission input.",
    );
  }
  if (!hasRequiredScopeShape(ownData(input, "scope"))) {
    throw new TypeError(
      "Invalid Ture Setup Analyst staging completed-outcome source creation admission input.",
    );
  }

  return Object.freeze({
    admission_version:
      TURE_SETUP_ANALYST_STAGING_COMPLETED_OUTCOME_SOURCE_CREATION_ADMISSION_VERSION,
    mode: "server_only_staging_completed_outcome_source_creation_admission",
    admission_status: "source_creation_scope_validated_not_authorized_not_executed",
    permitted_scope: Object.freeze({
      environment: "staging",
      source_relation: "public.recommendation_outcomes",
      operation: "one_staging_only_one_shot_outcome_evaluation_adapter",
      source_input: "one_server_owned_official_snapshot_only",
      maximum_completed_bundles: "one",
    }),
    required_preconditions: Object.freeze([
      "no_completed_bundle_available_preflight",
      "scheduled_default_five_batch_ten_snapshot_shape_not_admitted",
      "isolated_staging_one_shot_adapter",
      "one_server_owned_official_snapshot",
      "strict_one_batch_one_snapshot_request_limits",
      "application_owner_bound_snapshot_fingerprint",
      "complete_intraday_candle_evidence",
      "primary_60m_outcome",
      "diagnostic_15m_30m_60m_horizons",
      "separately_authorized_bounded_provider_cost",
      "server_managed_credential_identity_preflight",
    ]) as TureSetupAnalystStagingCompletedOutcomeSourceCreationAdmission["required_preconditions"],
    excluded_authority: Object.freeze([
      "source_row_read",
      "secret_read",
      "provider_invocation",
      "recommendation_outcome_persistence",
      "active_evidence_migration",
      "active_evidence_write",
      "offline_dataset",
      "offline_evaluation",
      "promotion",
      "runtime",
      "deployment",
      "broker",
      "production",
    ]) as TureSetupAnalystStagingCompletedOutcomeSourceCreationAdmission["excluded_authority"],
    next_gate:
      "separately_authorized_staging_cost_identity_and_one_shot_transport_preflight",
    authority:
      TURE_SETUP_ANALYST_STAGING_COMPLETED_OUTCOME_SOURCE_CREATION_ADMISSION_AUTHORITY,
  });
}
