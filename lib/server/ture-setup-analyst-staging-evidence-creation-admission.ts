import "server-only";

/**
 * This contract describes the one bounded staging operation that can be
 * reviewed after AI-02.7. It is intentionally incapable of reaching a
 * database or turning a valid plan into authority to execute it.
 */
export const TURE_SETUP_ANALYST_STAGING_EVIDENCE_CREATION_ADMISSION_VERSION =
  "ture_setup_analyst_staging_evidence_creation_admission_v1" as const;

export type TureSetupAnalystStagingEvidenceCreationAdmissionAuthority = Readonly<{
  mode: "server_only_staging_evidence_creation_admission";
  may_access_staging: false;
  may_access_production: false;
  may_perform_io: false;
  may_persist_source_evidence: false;
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

export const TURE_SETUP_ANALYST_STAGING_EVIDENCE_CREATION_ADMISSION_AUTHORITY: TureSetupAnalystStagingEvidenceCreationAdmissionAuthority =
  Object.freeze({
    mode: "server_only_staging_evidence_creation_admission",
    may_access_staging: false,
    may_access_production: false,
    may_perform_io: false,
    may_persist_source_evidence: false,
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

export type AdmitTureSetupAnalystStagingEvidenceCreationInput = Readonly<{
  scope: Readonly<{
    environment: "staging";
    relation: "public.canonical_evaluation_decisions";
    operation: "one_append_only_insert";
    source_kind: "server_owned_completed_recommendation_outcome_bundle";
    canonical_identity: "required";
    semantic_payload_sha256: "required";
    complete_primary_outcome: "required";
    diagnostic_horizons: "required";
    inactive_readiness_only: "must_be_false";
    idempotency_preflight: "identity_and_digest";
    containment: "rollback_or_remove_proof_row";
    independent_readback: "minimal_identity_digest_and_completion_only";
    evaluator_binding: "not_admitted";
    promotion_binding: "not_admitted";
    runtime_binding: "not_admitted";
    provider_model_binding: "not_admitted";
    deployment_binding: "not_admitted";
    broker_binding: "not_admitted";
    production_binding: "not_admitted";
  }>;
}>;

export type TureSetupAnalystStagingEvidenceCreationAdmission = Readonly<{
  admission_version: typeof TURE_SETUP_ANALYST_STAGING_EVIDENCE_CREATION_ADMISSION_VERSION;
  mode: "server_only_staging_evidence_creation_admission";
  admission_status: "staging_scope_validated_not_authorized_not_executed";
  permitted_scope: Readonly<{
    environment: "staging";
    relation: "public.canonical_evaluation_decisions";
    operation: "one_append_only_insert";
    source_kind: "server_owned_completed_recommendation_outcome_bundle";
  }>;
  required_evidence: readonly [
    "canonical_identity",
    "semantic_payload_sha256",
    "complete_primary_outcome",
    "diagnostic_horizons",
    "inactive_readiness_only_false",
    "idempotency_preflight",
    "rollback_or_remove_proof_row",
    "independent_minimal_readback",
  ];
  excluded_authority: readonly [
    "evaluator",
    "promotion",
    "runtime",
    "provider_model",
    "deployment",
    "broker",
    "production",
  ];
  next_gate: "separately_authorized_staging_execution_with_independent_readback";
  authority: TureSetupAnalystStagingEvidenceCreationAdmissionAuthority;
}>;

type PlainRecord = Record<string, unknown>;

const inputKeys = ["scope"] as const;
const scopeKeys = [
  "broker_binding",
  "canonical_identity",
  "complete_primary_outcome",
  "containment",
  "deployment_binding",
  "diagnostic_horizons",
  "environment",
  "evaluator_binding",
  "idempotency_preflight",
  "inactive_readiness_only",
  "independent_readback",
  "operation",
  "production_binding",
  "promotion_binding",
  "provider_model_binding",
  "relation",
  "runtime_binding",
  "semantic_payload_sha256",
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
    ownData(value, "relation") === "public.canonical_evaluation_decisions" &&
    ownData(value, "operation") === "one_append_only_insert" &&
    ownData(value, "source_kind") ===
      "server_owned_completed_recommendation_outcome_bundle" &&
    ownData(value, "canonical_identity") === "required" &&
    ownData(value, "semantic_payload_sha256") === "required" &&
    ownData(value, "complete_primary_outcome") === "required" &&
    ownData(value, "diagnostic_horizons") === "required" &&
    ownData(value, "inactive_readiness_only") === "must_be_false" &&
    ownData(value, "idempotency_preflight") === "identity_and_digest" &&
    ownData(value, "containment") === "rollback_or_remove_proof_row" &&
    ownData(value, "independent_readback") ===
      "minimal_identity_digest_and_completion_only" &&
    ownData(value, "evaluator_binding") === "not_admitted" &&
    ownData(value, "promotion_binding") === "not_admitted" &&
    ownData(value, "runtime_binding") === "not_admitted" &&
    ownData(value, "provider_model_binding") === "not_admitted" &&
    ownData(value, "deployment_binding") === "not_admitted" &&
    ownData(value, "broker_binding") === "not_admitted" &&
    ownData(value, "production_binding") === "not_admitted"
  );
}

export function admitTureSetupAnalystStagingEvidenceCreation(
  input: AdmitTureSetupAnalystStagingEvidenceCreationInput,
): TureSetupAnalystStagingEvidenceCreationAdmission {
  if (!hasExactOwnDataKeys(input, inputKeys)) {
    throw new TypeError("Invalid Ture Setup Analyst staging evidence-creation admission input.");
  }
  if (!hasRequiredScopeShape(ownData(input, "scope"))) {
    throw new TypeError("Invalid Ture Setup Analyst staging evidence-creation admission input.");
  }

  return Object.freeze({
    admission_version:
      TURE_SETUP_ANALYST_STAGING_EVIDENCE_CREATION_ADMISSION_VERSION,
    mode: "server_only_staging_evidence_creation_admission",
    admission_status: "staging_scope_validated_not_authorized_not_executed",
    permitted_scope: Object.freeze({
      environment: "staging",
      relation: "public.canonical_evaluation_decisions",
      operation: "one_append_only_insert",
      source_kind: "server_owned_completed_recommendation_outcome_bundle",
    }),
    required_evidence: Object.freeze([
      "canonical_identity",
      "semantic_payload_sha256",
      "complete_primary_outcome",
      "diagnostic_horizons",
      "inactive_readiness_only_false",
      "idempotency_preflight",
      "rollback_or_remove_proof_row",
      "independent_minimal_readback",
    ]) as TureSetupAnalystStagingEvidenceCreationAdmission["required_evidence"],
    excluded_authority: Object.freeze([
      "evaluator",
      "promotion",
      "runtime",
      "provider_model",
      "deployment",
      "broker",
      "production",
    ]) as TureSetupAnalystStagingEvidenceCreationAdmission["excluded_authority"],
    next_gate:
      "separately_authorized_staging_execution_with_independent_readback",
    authority: TURE_SETUP_ANALYST_STAGING_EVIDENCE_CREATION_ADMISSION_AUTHORITY,
  });
}
