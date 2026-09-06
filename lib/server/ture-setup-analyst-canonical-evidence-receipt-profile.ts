import "server-only";

export const TURE_SETUP_ANALYST_CANONICAL_EVIDENCE_RECEIPT_PROFILE_VERSION =
  "ture_setup_analyst_canonical_evidence_receipt_profile_v1" as const;

const RECEIPT_CANONICAL_IDENTITY =
  "rec_decision:v1:historical_replay:historical-candidate-001:1780320900000" as const;
const RECEIPT_SEMANTIC_PAYLOAD_SHA256 =
  "e67b746f2be28d7fdeeefb33284fe607e5361d2b61e02184057d48160db68975" as const;

export type TureSetupAnalystCanonicalEvidenceReceiptProfileAuthority = Readonly<{
  mode: "server_only_canonical_evidence_receipt_profile";
  may_read_repository: false;
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

export const TURE_SETUP_ANALYST_CANONICAL_EVIDENCE_RECEIPT_PROFILE_AUTHORITY: TureSetupAnalystCanonicalEvidenceReceiptProfileAuthority =
  Object.freeze({
    mode: "server_only_canonical_evidence_receipt_profile",
    may_read_repository: false,
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

export type ProfileTureSetupAnalystCanonicalEvidenceReceiptInput = Readonly<{
  receipt: Readonly<{
    environment: "staging";
    relation: "public.canonical_evaluation_decisions";
    canonical_identity: typeof RECEIPT_CANONICAL_IDENTITY;
    semantic_payload_sha256: typeof RECEIPT_SEMANTIC_PAYLOAD_SHA256;
    sample_type: "historical_synthetic";
    decision_kind: "historical_synthetic";
    reproducible: true;
    quality_metrics_eligible: true;
    inactive_readiness_only: true;
    primary_outcome_status: "absent";
    diagnostic_horizon_count: 0;
  }>;
}>;

export type TureSetupAnalystCanonicalEvidenceReceiptProfile = Readonly<{
  profile_version: typeof TURE_SETUP_ANALYST_CANONICAL_EVIDENCE_RECEIPT_PROFILE_VERSION;
  mode: "server_only_canonical_evidence_receipt_profile";
  profile_status: "receipt_profiled_not_admitted";
  source_evidence: Readonly<{
    environment: "staging";
    relation: "public.canonical_evaluation_decisions";
    sample_type: "historical_synthetic";
    canonical_identity: typeof RECEIPT_CANONICAL_IDENTITY;
    semantic_payload_sha256: typeof RECEIPT_SEMANTIC_PAYLOAD_SHA256;
    primary_outcome_status: "absent";
    diagnostic_horizon_count: 0;
    inactive_readiness_only: true;
  }>;
  canonical_evidence_disposition: "not_admitted";
  blocking_reasons: readonly [
    "primary_outcome_absent",
    "diagnostic_horizons_absent",
    "inactive_readiness_only",
    "separate_evaluator_admission_required",
  ];
  next_gate: "separately_authorized_completed_outcome_evidence_admission";
  authority: TureSetupAnalystCanonicalEvidenceReceiptProfileAuthority;
}>;

type PlainRecord = Record<string, unknown>;

const inputKeys = ["receipt"] as const;
const receiptKeys = [
  "canonical_identity",
  "decision_kind",
  "diagnostic_horizon_count",
  "environment",
  "inactive_readiness_only",
  "primary_outcome_status",
  "quality_metrics_eligible",
  "relation",
  "reproducible",
  "sample_type",
  "semantic_payload_sha256",
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

function hasRequiredReceiptShape(value: unknown): boolean {
  if (!hasExactOwnDataKeys(value, receiptKeys)) return false;

  return (
    ownData(value, "environment") === "staging" &&
    ownData(value, "relation") === "public.canonical_evaluation_decisions" &&
    ownData(value, "canonical_identity") === RECEIPT_CANONICAL_IDENTITY &&
    ownData(value, "semantic_payload_sha256") === RECEIPT_SEMANTIC_PAYLOAD_SHA256 &&
    ownData(value, "sample_type") === "historical_synthetic" &&
    ownData(value, "decision_kind") === "historical_synthetic" &&
    ownData(value, "reproducible") === true &&
    ownData(value, "quality_metrics_eligible") === true &&
    ownData(value, "inactive_readiness_only") === true &&
    ownData(value, "primary_outcome_status") === "absent" &&
    ownData(value, "diagnostic_horizon_count") === 0
  );
}

export function profileTureSetupAnalystCanonicalEvidenceReceipt(
  input: ProfileTureSetupAnalystCanonicalEvidenceReceiptInput,
): TureSetupAnalystCanonicalEvidenceReceiptProfile {
  if (!hasExactOwnDataKeys(input, inputKeys)) {
    throw new TypeError("Invalid Ture Setup Analyst canonical evidence receipt profile input.");
  }
  if (!hasRequiredReceiptShape(ownData(input, "receipt"))) {
    throw new TypeError("Invalid Ture Setup Analyst canonical evidence receipt profile input.");
  }

  return Object.freeze({
    profile_version: TURE_SETUP_ANALYST_CANONICAL_EVIDENCE_RECEIPT_PROFILE_VERSION,
    mode: "server_only_canonical_evidence_receipt_profile",
    profile_status: "receipt_profiled_not_admitted",
    source_evidence: Object.freeze({
      environment: "staging",
      relation: "public.canonical_evaluation_decisions",
      sample_type: "historical_synthetic",
      canonical_identity: RECEIPT_CANONICAL_IDENTITY,
      semantic_payload_sha256: RECEIPT_SEMANTIC_PAYLOAD_SHA256,
      primary_outcome_status: "absent",
      diagnostic_horizon_count: 0,
      inactive_readiness_only: true,
    }),
    canonical_evidence_disposition: "not_admitted",
    blocking_reasons: Object.freeze([
      "primary_outcome_absent",
      "diagnostic_horizons_absent",
      "inactive_readiness_only",
      "separate_evaluator_admission_required",
    ]) as TureSetupAnalystCanonicalEvidenceReceiptProfile["blocking_reasons"],
    next_gate: "separately_authorized_completed_outcome_evidence_admission",
    authority: TURE_SETUP_ANALYST_CANONICAL_EVIDENCE_RECEIPT_PROFILE_AUTHORITY,
  });
}
