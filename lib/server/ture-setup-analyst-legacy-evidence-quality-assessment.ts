import "server-only";

export const TURE_SETUP_ANALYST_LEGACY_EVIDENCE_QUALITY_ASSESSMENT_VERSION =
  "ture_setup_analyst_legacy_evidence_quality_assessment_v1" as const;

export type TureSetupAnalystLegacyEvidenceQualityAssessmentAuthority = Readonly<{
  mode: "server_only_legacy_evidence_quality_assessment";
  may_read_repository: false;
  may_access_staging: false;
  may_access_production: false;
  may_invoke_writer: false;
  may_perform_io: false;
  may_persist_assessment: false;
  may_form_offline_dataset: false;
  may_run_offline_evaluation: false;
  may_invoke_model: false;
  may_bind_runtime: false;
  may_promote_model_or_policy: false;
  may_change_canonical_recommendation: false;
  may_change_ranking: false;
  may_change_execution_eligibility: false;
  may_place_or_cancel_orders: false;
  may_submit_broker_instructions: false;
}>;

export const TURE_SETUP_ANALYST_LEGACY_EVIDENCE_QUALITY_ASSESSMENT_AUTHORITY: TureSetupAnalystLegacyEvidenceQualityAssessmentAuthority =
  Object.freeze({
    mode: "server_only_legacy_evidence_quality_assessment",
    may_read_repository: false,
    may_access_staging: false,
    may_access_production: false,
    may_invoke_writer: false,
    may_perform_io: false,
    may_persist_assessment: false,
    may_form_offline_dataset: false,
    may_run_offline_evaluation: false,
    may_invoke_model: false,
    may_bind_runtime: false,
    may_promote_model_or_policy: false,
    may_change_canonical_recommendation: false,
    may_change_ranking: false,
    may_change_execution_eligibility: false,
    may_place_or_cancel_orders: false,
    may_submit_broker_instructions: false,
  });

export type AssessTureSetupAnalystLegacyEvidenceQualityInput = Readonly<{
  profile: unknown;
}>;

export type TureSetupAnalystLegacyEvidenceQualityAssessment = Readonly<{
  assessment_version: typeof TURE_SETUP_ANALYST_LEGACY_EVIDENCE_QUALITY_ASSESSMENT_VERSION;
  mode: "server_only_legacy_evidence_quality_assessment";
  assessment_status: "noncanonical_preservation_confirmed";
  evidence: Readonly<{
    record_count: number;
    distinct_opaque_source_hash_count: number;
  }>;
  canonical_evaluation_disposition: "not_admitted";
  missing_evidence_reason_codes: readonly [
    "canonical_decision_identity_missing",
    "complete_outcome_evidence_missing",
    "immutable_lineage_missing",
    "versioned_reproducibility_missing",
  ];
  authority: TureSetupAnalystLegacyEvidenceQualityAssessmentAuthority;
}>;

type PlainRecord = Record<string, unknown>;

const inputKeys = ["profile"] as const;
const profileKeys = [
  "source_kind",
  "record_count",
  "distinct_opaque_source_hash_count",
  "evidence_completeness",
  "evaluation_disposition",
  "canonical_decision_identity_present",
  "immutable_lineage_present",
  "versioned_reproducibility_present",
  "complete_outcome_evidence_present",
] as const;
const maximumProfileRecordCount = 100_000;

const missingEvidenceReasonCodes = Object.freeze([
  "canonical_decision_identity_missing",
  "complete_outcome_evidence_missing",
  "immutable_lineage_missing",
  "versioned_reproducibility_missing",
] as const);

function hasExactFrozenOwnDataKeys(
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

function isBoundedPositiveInteger(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value >= 1 &&
    value <= maximumProfileRecordCount
  );
}

function isNoncanonicalLegacyEvidenceProfile(value: unknown): value is PlainRecord {
  if (!hasExactFrozenOwnDataKeys(value, profileKeys)) return false;

  const recordCount = ownData(value, "record_count");
  return (
    ownData(value, "source_kind") ===
      "staging_private_legacy_outcome_preservation" &&
    isBoundedPositiveInteger(recordCount) &&
    ownData(value, "distinct_opaque_source_hash_count") === recordCount &&
    ownData(value, "evidence_completeness") === "legacy_incomplete" &&
    ownData(value, "evaluation_disposition") === "not_admitted" &&
    ownData(value, "canonical_decision_identity_present") === false &&
    ownData(value, "immutable_lineage_present") === false &&
    ownData(value, "versioned_reproducibility_present") === false &&
    ownData(value, "complete_outcome_evidence_present") === false
  );
}

export function assessTureSetupAnalystLegacyEvidenceQuality(
  input: AssessTureSetupAnalystLegacyEvidenceQualityInput,
): TureSetupAnalystLegacyEvidenceQualityAssessment {
  if (!hasExactFrozenOwnDataKeys(input, inputKeys)) {
    throw new TypeError("Invalid Ture Setup Analyst legacy evidence quality input.");
  }

  const profile = ownData(input, "profile");
  if (!isNoncanonicalLegacyEvidenceProfile(profile)) {
    throw new TypeError("Invalid Ture Setup Analyst legacy evidence quality input.");
  }

  const recordCount = ownData(profile, "record_count") as number;
  const distinctHashCount = ownData(
    profile,
    "distinct_opaque_source_hash_count",
  ) as number;

  return Object.freeze({
    assessment_version: TURE_SETUP_ANALYST_LEGACY_EVIDENCE_QUALITY_ASSESSMENT_VERSION,
    mode: "server_only_legacy_evidence_quality_assessment",
    assessment_status: "noncanonical_preservation_confirmed",
    evidence: Object.freeze({
      record_count: recordCount,
      distinct_opaque_source_hash_count: distinctHashCount,
    }),
    canonical_evaluation_disposition: "not_admitted",
    missing_evidence_reason_codes: missingEvidenceReasonCodes,
    authority: TURE_SETUP_ANALYST_LEGACY_EVIDENCE_QUALITY_ASSESSMENT_AUTHORITY,
  });
}
