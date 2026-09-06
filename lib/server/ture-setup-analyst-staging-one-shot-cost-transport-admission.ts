import "server-only";

/**
 * AI-02.13 makes the cost and transport boundary for a possible future
 * completed-outcome source creation reviewable without contacting Netlify,
 * Supabase, an identity provider, or Twelve Data. It validates only the exact
 * one-shot design that follows AI-02.12; no valid result authorizes it.
 */
export const TURE_SETUP_ANALYST_STAGING_ONE_SHOT_COST_TRANSPORT_ADMISSION_VERSION =
  "ture_setup_analyst_staging_one_shot_cost_transport_admission_v1" as const;

export type TureSetupAnalystStagingOneShotCostTransportAdmissionAuthority =
  Readonly<{
    mode: "server_only_staging_one_shot_cost_transport_admission";
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

export const TURE_SETUP_ANALYST_STAGING_ONE_SHOT_COST_TRANSPORT_ADMISSION_AUTHORITY: TureSetupAnalystStagingOneShotCostTransportAdmissionAuthority =
  Object.freeze({
    mode: "server_only_staging_one_shot_cost_transport_admission",
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

export type AdmitTureSetupAnalystStagingOneShotCostTransportInput = Readonly<{
  scope: Readonly<{
    environment: "staging";
    source_relation: "public.recommendation_outcomes";
    existing_source_availability: "no_completed_bundle_available";
    producer: "official_scheduled_outcome_evaluation";
    scheduled_default_bounds: "five_batches_ten_snapshots_not_admitted";
    transport: "temporary_branch_deploy_adapter";
    deploy_context: "deploy_preview_only";
    source_input: "one_server_owned_official_snapshot_only";
    maximum_batches: "one";
    maximum_snapshots: "one";
    horizons: "15m_30m_60m_exact";
    reused_candle_requests_per_snapshot: "one";
    maximum_provider_candle_requests: "one";
    provider_cost: "separately_authorized_one_request_max";
    credential_identity: "nonsecret_presence_only_and_owner_preflight_required";
    credential_values: "not_read";
    source_rows: "not_read";
    outcome_persistence: "not_admitted";
    active_evidence_migration: "not_admitted";
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

export type TureSetupAnalystStagingOneShotCostTransportAdmission = Readonly<{
  admission_version: typeof TURE_SETUP_ANALYST_STAGING_ONE_SHOT_COST_TRANSPORT_ADMISSION_VERSION;
  mode: "server_only_staging_one_shot_cost_transport_admission";
  admission_status: "one_shot_cost_transport_scope_validated_not_authorized_not_executed";
  permitted_scope: Readonly<{
    environment: "staging";
    transport: "temporary_branch_deploy_adapter";
    deploy_context: "deploy_preview_only";
    maximum_batches: "one";
    maximum_snapshots: "one";
    maximum_provider_candle_requests: "one";
  }>;
  required_preconditions: readonly [
    "no_completed_bundle_available_preflight",
    "scheduled_default_five_batch_ten_snapshot_shape_not_admitted",
    "one_server_owned_official_snapshot",
    "one_batch_one_snapshot_request_limits",
    "one_reused_candle_request_for_15m_30m_60m_bundle",
    "separately_authorized_one_provider_request_max",
    "nonsecret_credential_presence_and_application_owner_preflight",
    "temporary_deploy_preview_only_transport",
  ];
  excluded_authority: readonly [
    "source_row_read",
    "credential_value_read",
    "provider_invocation",
    "evaluator_invocation",
    "branch_adapter_deploy",
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
  next_gate: "separately_authorized_staging_nonsecret_credential_presence_and_branch_transport_preflight";
  authority: TureSetupAnalystStagingOneShotCostTransportAdmissionAuthority;
}>;

type PlainRecord = Record<string, unknown>;

const inputKeys = ["scope"] as const;
const scopeKeys = [
  "active_evidence_migration",
  "active_evidence_write",
  "broker_binding",
  "credential_identity",
  "credential_values",
  "deploy_context",
  "deployment_binding",
  "environment",
  "evaluator_binding",
  "existing_source_availability",
  "horizons",
  "maximum_batches",
  "maximum_provider_candle_requests",
  "maximum_snapshots",
  "outcome_persistence",
  "producer",
  "production_binding",
  "promotion_binding",
  "provider_cost",
  "provider_model_binding",
  "reused_candle_requests_per_snapshot",
  "runtime_binding",
  "scheduled_default_bounds",
  "source_input",
  "source_relation",
  "source_rows",
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
    ownData(value, "producer") === "official_scheduled_outcome_evaluation" &&
    ownData(value, "scheduled_default_bounds") ===
      "five_batches_ten_snapshots_not_admitted" &&
    ownData(value, "transport") === "temporary_branch_deploy_adapter" &&
    ownData(value, "deploy_context") === "deploy_preview_only" &&
    ownData(value, "source_input") ===
      "one_server_owned_official_snapshot_only" &&
    ownData(value, "maximum_batches") === "one" &&
    ownData(value, "maximum_snapshots") === "one" &&
    ownData(value, "horizons") === "15m_30m_60m_exact" &&
    ownData(value, "reused_candle_requests_per_snapshot") === "one" &&
    ownData(value, "maximum_provider_candle_requests") === "one" &&
    ownData(value, "provider_cost") ===
      "separately_authorized_one_request_max" &&
    ownData(value, "credential_identity") ===
      "nonsecret_presence_only_and_owner_preflight_required" &&
    ownData(value, "credential_values") === "not_read" &&
    ownData(value, "source_rows") === "not_read" &&
    ownData(value, "outcome_persistence") === "not_admitted" &&
    ownData(value, "active_evidence_migration") === "not_admitted" &&
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

export function admitTureSetupAnalystStagingOneShotCostTransport(
  input: AdmitTureSetupAnalystStagingOneShotCostTransportInput,
): TureSetupAnalystStagingOneShotCostTransportAdmission {
  if (!hasExactOwnDataKeys(input, inputKeys)) {
    throw new TypeError(
      "Invalid Ture Setup Analyst staging one-shot cost transport admission input.",
    );
  }
  if (!hasRequiredScopeShape(ownData(input, "scope"))) {
    throw new TypeError(
      "Invalid Ture Setup Analyst staging one-shot cost transport admission input.",
    );
  }

  return Object.freeze({
    admission_version:
      TURE_SETUP_ANALYST_STAGING_ONE_SHOT_COST_TRANSPORT_ADMISSION_VERSION,
    mode: "server_only_staging_one_shot_cost_transport_admission",
    admission_status:
      "one_shot_cost_transport_scope_validated_not_authorized_not_executed",
    permitted_scope: Object.freeze({
      environment: "staging",
      transport: "temporary_branch_deploy_adapter",
      deploy_context: "deploy_preview_only",
      maximum_batches: "one",
      maximum_snapshots: "one",
      maximum_provider_candle_requests: "one",
    }),
    required_preconditions: Object.freeze([
      "no_completed_bundle_available_preflight",
      "scheduled_default_five_batch_ten_snapshot_shape_not_admitted",
      "one_server_owned_official_snapshot",
      "one_batch_one_snapshot_request_limits",
      "one_reused_candle_request_for_15m_30m_60m_bundle",
      "separately_authorized_one_provider_request_max",
      "nonsecret_credential_presence_and_application_owner_preflight",
      "temporary_deploy_preview_only_transport",
    ]) as TureSetupAnalystStagingOneShotCostTransportAdmission["required_preconditions"],
    excluded_authority: Object.freeze([
      "source_row_read",
      "credential_value_read",
      "provider_invocation",
      "evaluator_invocation",
      "branch_adapter_deploy",
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
    ]) as TureSetupAnalystStagingOneShotCostTransportAdmission["excluded_authority"],
    next_gate:
      "separately_authorized_staging_nonsecret_credential_presence_and_branch_transport_preflight",
    authority: TURE_SETUP_ANALYST_STAGING_ONE_SHOT_COST_TRANSPORT_ADMISSION_AUTHORITY,
  });
}
