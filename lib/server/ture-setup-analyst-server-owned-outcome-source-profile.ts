import "server-only";

/**
 * AI-02.11 names the existing server-owned completed-outcome producer without
 * granting access to it. It deliberately validates only immutable metadata:
 * callers cannot use this module to read outcomes, run the producer, apply a
 * migration, or write active-evidence rows.
 */
export const TURE_SETUP_ANALYST_SERVER_OWNED_OUTCOME_SOURCE_PROFILE_VERSION =
  "ture_setup_analyst_server_owned_outcome_source_profile_v1" as const;

export type TureSetupAnalystServerOwnedOutcomeSourceProfileAuthority = Readonly<{
  mode: "server_only_completed_outcome_source_profile";
  may_read_repository: false;
  may_access_staging: false;
  may_access_production: false;
  may_access_secrets: false;
  may_perform_io: false;
  may_read_recommendation_outcomes: false;
  may_apply_migration: false;
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

export const TURE_SETUP_ANALYST_SERVER_OWNED_OUTCOME_SOURCE_PROFILE_AUTHORITY: TureSetupAnalystServerOwnedOutcomeSourceProfileAuthority =
  Object.freeze({
    mode: "server_only_completed_outcome_source_profile",
    may_read_repository: false,
    may_access_staging: false,
    may_access_production: false,
    may_access_secrets: false,
    may_perform_io: false,
    may_read_recommendation_outcomes: false,
    may_apply_migration: false,
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

export type SelectTureSetupAnalystServerOwnedOutcomeSourceProfileInput = Readonly<{
  proposal: Readonly<{
    environment: "staging";
    source_relation: "public.recommendation_outcomes";
    active_evidence_relation: "public.canonical_active_evaluation_evidence";
    producer: "official_scheduled_outcome_evaluation";
    producer_authentication: "automation_secret_and_application_owner_principal";
    outcome_persistence: "server_supabase_service_role_upsert";
    bundle_identity: "owner_bound_snapshot_fingerprint";
    primary_horizon: "60m";
    diagnostic_horizons: "15m_30m_60m_exact";
    outcome_completion: "intraday_candles_complete";
    source_availability: "requires_separate_authorized_staging_preflight";
    migration_application: "not_admitted";
    source_read: "not_admitted";
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

export type TureSetupAnalystServerOwnedOutcomeSourceProfile = Readonly<{
  profile_version: typeof TURE_SETUP_ANALYST_SERVER_OWNED_OUTCOME_SOURCE_PROFILE_VERSION;
  mode: "server_only_completed_outcome_source_profile";
  profile_status: "source_profile_selected_not_available_not_admitted";
  selected_source: Readonly<{
    environment: "staging";
    relation: "public.recommendation_outcomes";
    producer: "official_scheduled_outcome_evaluation";
    bundle_identity: "owner_bound_snapshot_fingerprint";
  }>;
  completed_bundle_requirements: readonly [
    "authenticated_server_owned_producer",
    "server_persisted_outcome_rows",
    "one_owner_bound_snapshot_fingerprint",
    "complete_intraday_candle_evidence",
    "primary_60m_outcome",
    "diagnostic_15m_30m_60m_horizons",
  ];
  excluded_inputs: readonly [
    "caller_supplied_snapshots",
    "local_storage",
    "fixture",
    "historical_synthetic",
    "legacy_preservation_relation",
  ];
  source_availability: "not_observed_by_this_contract";
  next_gate: "separately_authorized_staging_source_availability_preflight";
  authority: TureSetupAnalystServerOwnedOutcomeSourceProfileAuthority;
}>;

type PlainRecord = Record<string, unknown>;

const inputKeys = ["proposal"] as const;
const proposalKeys = [
  "active_evidence_relation",
  "active_evidence_write",
  "broker_binding",
  "bundle_identity",
  "deployment_binding",
  "diagnostic_horizons",
  "environment",
  "evaluator_binding",
  "migration_application",
  "outcome_completion",
  "outcome_persistence",
  "primary_horizon",
  "producer",
  "producer_authentication",
  "production_binding",
  "promotion_binding",
  "provider_model_binding",
  "runtime_binding",
  "source_availability",
  "source_read",
  "source_relation",
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

function hasRequiredProposalShape(value: unknown): boolean {
  if (!hasExactOwnDataKeys(value, proposalKeys)) return false;

  return (
    ownData(value, "environment") === "staging" &&
    ownData(value, "source_relation") === "public.recommendation_outcomes" &&
    ownData(value, "active_evidence_relation") ===
      "public.canonical_active_evaluation_evidence" &&
    ownData(value, "producer") === "official_scheduled_outcome_evaluation" &&
    ownData(value, "producer_authentication") ===
      "automation_secret_and_application_owner_principal" &&
    ownData(value, "outcome_persistence") ===
      "server_supabase_service_role_upsert" &&
    ownData(value, "bundle_identity") === "owner_bound_snapshot_fingerprint" &&
    ownData(value, "primary_horizon") === "60m" &&
    ownData(value, "diagnostic_horizons") === "15m_30m_60m_exact" &&
    ownData(value, "outcome_completion") === "intraday_candles_complete" &&
    ownData(value, "source_availability") ===
      "requires_separate_authorized_staging_preflight" &&
    ownData(value, "migration_application") === "not_admitted" &&
    ownData(value, "source_read") === "not_admitted" &&
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

export function selectTureSetupAnalystServerOwnedOutcomeSourceProfile(
  input: SelectTureSetupAnalystServerOwnedOutcomeSourceProfileInput,
): TureSetupAnalystServerOwnedOutcomeSourceProfile {
  if (!hasExactOwnDataKeys(input, inputKeys)) {
    throw new TypeError("Invalid Ture Setup Analyst server-owned outcome source profile input.");
  }
  if (!hasRequiredProposalShape(ownData(input, "proposal"))) {
    throw new TypeError("Invalid Ture Setup Analyst server-owned outcome source profile input.");
  }

  return Object.freeze({
    profile_version: TURE_SETUP_ANALYST_SERVER_OWNED_OUTCOME_SOURCE_PROFILE_VERSION,
    mode: "server_only_completed_outcome_source_profile",
    profile_status: "source_profile_selected_not_available_not_admitted",
    selected_source: Object.freeze({
      environment: "staging",
      relation: "public.recommendation_outcomes",
      producer: "official_scheduled_outcome_evaluation",
      bundle_identity: "owner_bound_snapshot_fingerprint",
    }),
    completed_bundle_requirements: Object.freeze([
      "authenticated_server_owned_producer",
      "server_persisted_outcome_rows",
      "one_owner_bound_snapshot_fingerprint",
      "complete_intraday_candle_evidence",
      "primary_60m_outcome",
      "diagnostic_15m_30m_60m_horizons",
    ]) as TureSetupAnalystServerOwnedOutcomeSourceProfile["completed_bundle_requirements"],
    excluded_inputs: Object.freeze([
      "caller_supplied_snapshots",
      "local_storage",
      "fixture",
      "historical_synthetic",
      "legacy_preservation_relation",
    ]) as TureSetupAnalystServerOwnedOutcomeSourceProfile["excluded_inputs"],
    source_availability: "not_observed_by_this_contract",
    next_gate: "separately_authorized_staging_source_availability_preflight",
    authority: TURE_SETUP_ANALYST_SERVER_OWNED_OUTCOME_SOURCE_PROFILE_AUTHORITY,
  });
}
