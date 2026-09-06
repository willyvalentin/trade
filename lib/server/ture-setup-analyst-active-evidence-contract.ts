import "server-only";

/**
 * This is a local, I/O-free contract for the additive active-evidence v2
 * schema. It intentionally describes a future staging operation without
 * binding a producer, database client, writer, route, evaluator, or runtime.
 */
export const TURE_SETUP_ANALYST_ACTIVE_EVIDENCE_CONTRACT_VERSION =
  "ture_setup_analyst_active_evidence_contract_v2" as const;

export type TureSetupAnalystActiveEvidenceAuthority = Readonly<{
  mode: "server_only_active_evidence_contract";
  may_access_staging: false;
  may_access_production: false;
  may_perform_io: false;
  may_apply_migration: false;
  may_bind_server_owned_source: false;
  may_persist_evidence: false;
  may_form_offline_dataset: false;
  may_run_offline_evaluation: false;
  may_bind_runtime: false;
  may_invoke_model: false;
  may_change_recommendation: false;
  may_change_ranking: false;
  may_change_risk: false;
  may_submit_broker_instructions: false;
}>;

export const TURE_SETUP_ANALYST_ACTIVE_EVIDENCE_AUTHORITY: TureSetupAnalystActiveEvidenceAuthority =
  Object.freeze({
    mode: "server_only_active_evidence_contract",
    may_access_staging: false,
    may_access_production: false,
    may_perform_io: false,
    may_apply_migration: false,
    may_bind_server_owned_source: false,
    may_persist_evidence: false,
    may_form_offline_dataset: false,
    may_run_offline_evaluation: false,
    may_bind_runtime: false,
    may_invoke_model: false,
    may_change_recommendation: false,
    may_change_ranking: false,
    may_change_risk: false,
    may_submit_broker_instructions: false,
  });

export type AdmitTureSetupAnalystActiveEvidenceInput = Readonly<{
  scope: Readonly<{
    environment: "staging";
    relation: "public.canonical_active_evaluation_evidence";
    operation: "one_append_only_insert";
    evidence_contract_version: "canonical_active_evaluation_evidence_v2";
    preserves_v1_inactive_evidence: "required";
    source_kind: "server_owned_completed_recommendation_outcome_bundle";
    source_binding: "separately_authorized_real_server_owned_bundle_required";
    canonical_identity: "required";
    active_evidence_identity: "required";
    semantic_payload_sha256: "required";
    complete_primary_outcome: "60m_required";
    diagnostic_horizons: "15m_30m_60m_complete";
    inactive_readiness_only: "must_be_false";
    idempotency_preflight: "active_evidence_identity_and_digest";
    containment: "rollback_or_remove_proof_row";
    independent_readback: "minimal_identity_digest_and_completion_only";
    migration_application: "not_authorized";
    evaluator_binding: "not_admitted";
    promotion_binding: "not_admitted";
    runtime_binding: "not_admitted";
    provider_model_binding: "not_admitted";
    deployment_binding: "not_admitted";
    broker_binding: "not_admitted";
    production_binding: "not_admitted";
  }>;
}>;

export type TureSetupAnalystActiveEvidenceAdmission = Readonly<{
  contract_version: typeof TURE_SETUP_ANALYST_ACTIVE_EVIDENCE_CONTRACT_VERSION;
  mode: "server_only_active_evidence_contract";
  admission_status: "active_evidence_contract_validated_not_authorized_not_executed";
  permitted_scope: Readonly<{
    environment: "staging";
    relation: "public.canonical_active_evaluation_evidence";
    operation: "one_append_only_insert";
    source_kind: "server_owned_completed_recommendation_outcome_bundle";
  }>;
  required_evidence: readonly [
    "v1_inactive_evidence_preserved",
    "additive_v2_schema",
    "real_server_owned_completed_bundle",
    "canonical_identity",
    "active_evidence_identity",
    "semantic_payload_sha256",
    "complete_60m_primary_outcome",
    "complete_15m_30m_60m_diagnostic_horizons",
    "inactive_readiness_only_false",
    "identity_and_digest_preflight",
    "rollback_or_remove_proof_row",
    "independent_minimal_readback",
  ];
  excluded_authority: readonly [
    "migration_application",
    "source_binding",
    "persistence",
    "evaluator",
    "promotion",
    "runtime",
    "provider_model",
    "deployment",
    "broker",
    "production",
  ];
  next_gate: "locally_verified_additive_migration_and_separately_authorized_real_source_binding";
  authority: TureSetupAnalystActiveEvidenceAuthority;
}>;

type PlainRecord = Record<string, unknown>;

const inputKeys = ["scope"] as const;
const scopeKeys = [
  "active_evidence_identity",
  "broker_binding",
  "canonical_identity",
  "complete_primary_outcome",
  "containment",
  "deployment_binding",
  "diagnostic_horizons",
  "environment",
  "evaluator_binding",
  "evidence_contract_version",
  "idempotency_preflight",
  "inactive_readiness_only",
  "independent_readback",
  "migration_application",
  "operation",
  "preserves_v1_inactive_evidence",
  "production_binding",
  "promotion_binding",
  "provider_model_binding",
  "relation",
  "runtime_binding",
  "semantic_payload_sha256",
  "source_binding",
  "source_kind",
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
    ownData(value, "relation") ===
      "public.canonical_active_evaluation_evidence" &&
    ownData(value, "operation") === "one_append_only_insert" &&
    ownData(value, "evidence_contract_version") ===
      "canonical_active_evaluation_evidence_v2" &&
    ownData(value, "preserves_v1_inactive_evidence") === "required" &&
    ownData(value, "source_kind") ===
      "server_owned_completed_recommendation_outcome_bundle" &&
    ownData(value, "source_binding") ===
      "separately_authorized_real_server_owned_bundle_required" &&
    ownData(value, "canonical_identity") === "required" &&
    ownData(value, "active_evidence_identity") === "required" &&
    ownData(value, "semantic_payload_sha256") === "required" &&
    ownData(value, "complete_primary_outcome") === "60m_required" &&
    ownData(value, "diagnostic_horizons") === "15m_30m_60m_complete" &&
    ownData(value, "inactive_readiness_only") === "must_be_false" &&
    ownData(value, "idempotency_preflight") ===
      "active_evidence_identity_and_digest" &&
    ownData(value, "containment") === "rollback_or_remove_proof_row" &&
    ownData(value, "independent_readback") ===
      "minimal_identity_digest_and_completion_only" &&
    ownData(value, "migration_application") === "not_authorized" &&
    ownData(value, "evaluator_binding") === "not_admitted" &&
    ownData(value, "promotion_binding") === "not_admitted" &&
    ownData(value, "runtime_binding") === "not_admitted" &&
    ownData(value, "provider_model_binding") === "not_admitted" &&
    ownData(value, "deployment_binding") === "not_admitted" &&
    ownData(value, "broker_binding") === "not_admitted" &&
    ownData(value, "production_binding") === "not_admitted"
  );
}

export function admitTureSetupAnalystActiveEvidence(
  input: AdmitTureSetupAnalystActiveEvidenceInput,
): TureSetupAnalystActiveEvidenceAdmission {
  if (!hasExactOwnDataKeys(input, inputKeys)) {
    throw new TypeError("Invalid Ture Setup Analyst active-evidence contract input.");
  }
  if (!hasRequiredScopeShape(ownData(input, "scope"))) {
    throw new TypeError("Invalid Ture Setup Analyst active-evidence contract input.");
  }

  return Object.freeze({
    contract_version: TURE_SETUP_ANALYST_ACTIVE_EVIDENCE_CONTRACT_VERSION,
    mode: "server_only_active_evidence_contract",
    admission_status:
      "active_evidence_contract_validated_not_authorized_not_executed",
    permitted_scope: Object.freeze({
      environment: "staging",
      relation: "public.canonical_active_evaluation_evidence",
      operation: "one_append_only_insert",
      source_kind: "server_owned_completed_recommendation_outcome_bundle",
    }),
    required_evidence: Object.freeze([
      "v1_inactive_evidence_preserved",
      "additive_v2_schema",
      "real_server_owned_completed_bundle",
      "canonical_identity",
      "active_evidence_identity",
      "semantic_payload_sha256",
      "complete_60m_primary_outcome",
      "complete_15m_30m_60m_diagnostic_horizons",
      "inactive_readiness_only_false",
      "identity_and_digest_preflight",
      "rollback_or_remove_proof_row",
      "independent_minimal_readback",
    ]) as TureSetupAnalystActiveEvidenceAdmission["required_evidence"],
    excluded_authority: Object.freeze([
      "migration_application",
      "source_binding",
      "persistence",
      "evaluator",
      "promotion",
      "runtime",
      "provider_model",
      "deployment",
      "broker",
      "production",
    ]) as TureSetupAnalystActiveEvidenceAdmission["excluded_authority"],
    next_gate:
      "locally_verified_additive_migration_and_separately_authorized_real_source_binding",
    authority: TURE_SETUP_ANALYST_ACTIVE_EVIDENCE_AUTHORITY,
  });
}
