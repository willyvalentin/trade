import {
  validateWhyMoveSecEdgarExternalReadOperatorRecord,
  type NormalizedWhyMoveSecEdgarExternalReadOperatorRecord,
} from "./whymove-sec-edgar-external-read-operator-record";

export const WHY_MOVE_SEC_EDGAR_EXTERNAL_READ_EVIDENCE_BUNDLE_VERSION =
  "whymove_sec_edgar_external_read_evidence_bundle_v1" as const;

export type WhyMoveSecEdgarExternalReadEvidenceBundleDisposition =
  | "invalid_input"
  | "not_admitted_operator_record_unvalidated"
  | "not_admitted_evidence_bundle_mismatch"
  | "sec_edgar_external_read_evidence_bundle_locally_shaped_not_authorized_not_executed";

export type WhyMoveSecEdgarExternalReadEvidenceBundleReason =
  | "accessor_or_non_plain_input"
  | "containment_not_fail_closed"
  | "evidence_claim_not_unverified"
  | "execution_scope_binding_mismatch"
  | "invalid_evidence_bundle_id"
  | "invalid_evidence_bundle_shape"
  | "missing_or_invalid_scalar"
  | "network_activity_unsafe"
  | "operator_record_binding_mismatch"
  | "unsafe_evidence_claim";

export type WhyMoveSecEdgarExternalReadEvidenceBundleAuthority = Readonly<{
  mode: "provider_free_external_read_evidence_bundle_template";
  may_request_external_source: false;
  may_read_external_response: false;
  may_use_credentials: false;
  may_read_environment: false;
  may_change_ci_policy: false;
  may_read_branch_protection: false;
  may_persist: false;
  may_bind_runtime: false;
  may_deploy: false;
  may_influence_advisory: false;
  may_invoke_broker: false;
  may_access_production: false;
}>;

export const WHY_MOVE_SEC_EDGAR_EXTERNAL_READ_EVIDENCE_BUNDLE_AUTHORITY: WhyMoveSecEdgarExternalReadEvidenceBundleAuthority =
  Object.freeze({
    mode: "provider_free_external_read_evidence_bundle_template",
    may_request_external_source: false,
    may_read_external_response: false,
    may_use_credentials: false,
    may_read_environment: false,
    may_change_ci_policy: false,
    may_read_branch_protection: false,
    may_persist: false,
    may_bind_runtime: false,
    may_deploy: false,
    may_influence_advisory: false,
    may_invoke_broker: false,
    may_access_production: false,
  });

type EvidenceClaim =
  | "claimed_complete_not_independently_verified"
  | "required_not_verified";

export type NormalizedWhyMoveSecEdgarExternalReadEvidenceBundle = Readonly<{
  evidence_bundle_id: string;
  operator_record_id: string;
  execution_scope_id: string;
  required_ci_evidence: Readonly<{
    ready_candidate_six_shard: "claimed_complete_not_independently_verified";
    exact_main_six_shard: "claimed_complete_not_independently_verified";
    main_protection_readback: "claimed_complete_not_independently_verified";
    independent_sweep: "claimed_complete_not_independently_verified";
  }>;
  rollback_or_containment:
    "cancel_before_network_on_missing_or_mismatched_evidence";
  network_activity: "not_performed";
}>;

export type WhyMoveSecEdgarExternalReadEvidenceBundleResult = Readonly<{
  version: typeof WHY_MOVE_SEC_EDGAR_EXTERNAL_READ_EVIDENCE_BUNDLE_VERSION;
  disposition: WhyMoveSecEdgarExternalReadEvidenceBundleDisposition;
  reasons: readonly WhyMoveSecEdgarExternalReadEvidenceBundleReason[];
  validated_evidence_bundle: NormalizedWhyMoveSecEdgarExternalReadEvidenceBundle | null;
  authority: WhyMoveSecEdgarExternalReadEvidenceBundleAuthority;
}>;

const INPUT_KEYS = ["evidence_bundle", "operator_record_input"] as const;
const EVIDENCE_BUNDLE_KEYS = [
  "evidence_bundle_id",
  "execution_scope_id",
  "network_activity",
  "operator_record_id",
  "required_ci_evidence",
  "rollback_or_containment",
] as const;
const REQUIRED_CI_EVIDENCE_KEYS = [
  "exact_main_six_shard",
  "independent_sweep",
  "main_protection_readback",
  "ready_candidate_six_shard",
] as const;
const EVIDENCE_BUNDLE_ID = /^[a-z0-9][a-z0-9:_-]{2,127}$/;
const UNVERIFIED_EVIDENCE_CLAIM =
  "claimed_complete_not_independently_verified" as const;

type PlainDataRecord = Readonly<Record<string, unknown>>;

function freeze<T>(value: T): T {
  return Object.freeze(value);
}

function hasExactlyDataKeys(
  value: unknown,
  keys: readonly string[],
): value is PlainDataRecord {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  if (Object.getPrototypeOf(value) !== Object.prototype) return false;
  if (Object.getOwnPropertySymbols(value).length > 0) return false;

  const ownKeys = Object.getOwnPropertyNames(value).sort();
  const expectedKeys = [...keys].sort();
  if (
    ownKeys.length !== expectedKeys.length ||
    ownKeys.some((key, index) => key !== expectedKeys[index])
  ) {
    return false;
  }

  return ownKeys.every((key) => {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    return descriptor !== undefined && "value" in descriptor;
  });
}

function readString(record: PlainDataRecord, key: string): string | null {
  const value = record[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

function result(
  disposition: WhyMoveSecEdgarExternalReadEvidenceBundleDisposition,
  reasons: readonly WhyMoveSecEdgarExternalReadEvidenceBundleReason[] = [],
  evidenceBundle: NormalizedWhyMoveSecEdgarExternalReadEvidenceBundle | null = null,
): WhyMoveSecEdgarExternalReadEvidenceBundleResult {
  return freeze({
    version: WHY_MOVE_SEC_EDGAR_EXTERNAL_READ_EVIDENCE_BUNDLE_VERSION,
    disposition,
    reasons: freeze(
      [...new Set(reasons)].sort() as WhyMoveSecEdgarExternalReadEvidenceBundleReason[],
    ),
    validated_evidence_bundle:
      evidenceBundle === null
        ? null
        : freeze({
            ...evidenceBundle,
            required_ci_evidence: freeze({ ...evidenceBundle.required_ci_evidence }),
          }),
    authority: WHY_MOVE_SEC_EDGAR_EXTERNAL_READ_EVIDENCE_BUNDLE_AUTHORITY,
  });
}

function hasExpectedEvidenceClaims(value: unknown): value is PlainDataRecord {
  if (!hasExactlyDataKeys(value, REQUIRED_CI_EVIDENCE_KEYS)) return false;

  return REQUIRED_CI_EVIDENCE_KEYS.every(
    (key) => value[key] === UNVERIFIED_EVIDENCE_CLAIM,
  );
}

function reasonForEvidenceClaims(
  value: unknown,
): WhyMoveSecEdgarExternalReadEvidenceBundleReason {
  if (!hasExactlyDataKeys(value, REQUIRED_CI_EVIDENCE_KEYS)) {
    return "evidence_claim_not_unverified";
  }

  const claims = REQUIRED_CI_EVIDENCE_KEYS.map((key) => value[key]);
  if (
    claims.some(
      (claim) =>
        claim !== UNVERIFIED_EVIDENCE_CLAIM &&
        claim !== ("required_not_verified" satisfies EvidenceClaim),
    )
  ) {
    return "unsafe_evidence_claim";
  }
  return "evidence_claim_not_unverified";
}

/**
 * Validates a local-only shape for the four re-hardening evidence claims that
 * a later independently verified SEC-read gate must inspect. It deliberately
 * preserves their unverified state: this function has no GitHub, CI, network
 * or request authority.
 */
export function validateWhyMoveSecEdgarExternalReadEvidenceBundle(
  input: unknown,
): WhyMoveSecEdgarExternalReadEvidenceBundleResult {
  if (!hasExactlyDataKeys(input, INPUT_KEYS)) {
    return result("invalid_input", ["invalid_evidence_bundle_shape"]);
  }

  const operatorRecord = validateWhyMoveSecEdgarExternalReadOperatorRecord(
    input.operator_record_input,
  );
  if (
    operatorRecord.disposition !==
      "sec_edgar_external_read_operator_record_validated_not_authorized_not_executed" ||
    operatorRecord.validated_operator_record === null
  ) {
    return result("not_admitted_operator_record_unvalidated");
  }

  if (!hasExactlyDataKeys(input.evidence_bundle, EVIDENCE_BUNDLE_KEYS)) {
    return result("invalid_input", ["accessor_or_non_plain_input"]);
  }
  const evidenceBundle = input.evidence_bundle;
  const evidenceBundleId = readString(evidenceBundle, "evidence_bundle_id");
  const operatorRecordId = readString(evidenceBundle, "operator_record_id");
  const executionScopeId = readString(evidenceBundle, "execution_scope_id");
  const rollbackOrContainment = readString(
    evidenceBundle,
    "rollback_or_containment",
  );
  const networkActivity = readString(evidenceBundle, "network_activity");
  const requiredCiEvidence = evidenceBundle.required_ci_evidence;

  if (
    !evidenceBundleId ||
    !operatorRecordId ||
    !executionScopeId ||
    !rollbackOrContainment ||
    !networkActivity
  ) {
    return result("invalid_input", ["missing_or_invalid_scalar"]);
  }

  const reasons: WhyMoveSecEdgarExternalReadEvidenceBundleReason[] = [];
  if (!EVIDENCE_BUNDLE_ID.test(evidenceBundleId)) {
    reasons.push("invalid_evidence_bundle_id");
  }
  const validatedOperatorRecord: NormalizedWhyMoveSecEdgarExternalReadOperatorRecord =
    operatorRecord.validated_operator_record;
  if (operatorRecordId !== validatedOperatorRecord.operator_record_id) {
    reasons.push("operator_record_binding_mismatch");
  }
  if (executionScopeId !== validatedOperatorRecord.execution_scope_id) {
    reasons.push("execution_scope_binding_mismatch");
  }
  if (!hasExpectedEvidenceClaims(requiredCiEvidence)) {
    reasons.push(reasonForEvidenceClaims(requiredCiEvidence));
  }
  if (
    rollbackOrContainment !==
    "cancel_before_network_on_missing_or_mismatched_evidence"
  ) {
    reasons.push("containment_not_fail_closed");
  }
  if (networkActivity !== "not_performed") {
    reasons.push("network_activity_unsafe");
  }
  if (reasons.length > 0) {
    return result("not_admitted_evidence_bundle_mismatch", reasons);
  }

  return result(
    "sec_edgar_external_read_evidence_bundle_locally_shaped_not_authorized_not_executed",
    [],
    freeze({
      evidence_bundle_id: evidenceBundleId,
      operator_record_id: validatedOperatorRecord.operator_record_id,
      execution_scope_id: validatedOperatorRecord.execution_scope_id,
      required_ci_evidence: freeze({
        ready_candidate_six_shard: UNVERIFIED_EVIDENCE_CLAIM,
        exact_main_six_shard: UNVERIFIED_EVIDENCE_CLAIM,
        main_protection_readback: UNVERIFIED_EVIDENCE_CLAIM,
        independent_sweep: UNVERIFIED_EVIDENCE_CLAIM,
      }),
      rollback_or_containment:
        "cancel_before_network_on_missing_or_mismatched_evidence" as const,
      network_activity: "not_performed" as const,
    }),
  );
}
