import {
  validateWhyMoveSecEdgarExecutionScopePolicy,
  type NormalizedWhyMoveSecEdgarExecutionScopePolicy,
} from "./whymove-sec-edgar-execution-scope-policy";

export const WHY_MOVE_SEC_EDGAR_EXTERNAL_READ_OPERATOR_RECORD_VERSION =
  "whymove_sec_edgar_external_read_operator_record_v1" as const;

export type WhyMoveSecEdgarExternalReadOperatorRecordDisposition =
  | "invalid_input"
  | "not_admitted_execution_scope_policy_unvalidated"
  | "not_admitted_operator_record_mismatch"
  | "sec_edgar_external_read_operator_record_validated_not_authorized_not_executed";

export type WhyMoveSecEdgarExternalReadOperatorRecordReason =
  | "accessor_or_non_plain_input"
  | "authority_status_unsafe"
  | "containment_not_fail_closed"
  | "evidence_not_marked_required_unverified"
  | "execution_scope_binding_mismatch"
  | "invalid_operator_record_id"
  | "invalid_operator_record_shape"
  | "missing_or_invalid_scalar"
  | "network_activity_unsafe";

export type WhyMoveSecEdgarExternalReadOperatorRecordAuthority = Readonly<{
  mode: "provider_free_external_read_operator_record_template";
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

export const WHY_MOVE_SEC_EDGAR_EXTERNAL_READ_OPERATOR_RECORD_AUTHORITY: WhyMoveSecEdgarExternalReadOperatorRecordAuthority =
  Object.freeze({
    mode: "provider_free_external_read_operator_record_template",
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

export type NormalizedWhyMoveSecEdgarExternalReadOperatorRecord = Readonly<{
  operator_record_id: string;
  execution_scope_id: string;
  required_ci_evidence: Readonly<{
    ready_candidate_six_shard: "required_not_verified";
    exact_main_six_shard: "required_not_verified";
    main_protection_readback: "required_not_verified";
    independent_sweep: "required_not_verified";
  }>;
  rollback_or_containment:
    "cancel_before_network_on_missing_or_mismatched_evidence";
  operator_authority: "not_authorized_not_executed";
  network_activity: "not_performed";
}>;

export type WhyMoveSecEdgarExternalReadOperatorRecordResult = Readonly<{
  version: typeof WHY_MOVE_SEC_EDGAR_EXTERNAL_READ_OPERATOR_RECORD_VERSION;
  disposition: WhyMoveSecEdgarExternalReadOperatorRecordDisposition;
  reasons: readonly WhyMoveSecEdgarExternalReadOperatorRecordReason[];
  validated_operator_record: NormalizedWhyMoveSecEdgarExternalReadOperatorRecord | null;
  authority: WhyMoveSecEdgarExternalReadOperatorRecordAuthority;
}>;

const INPUT_KEYS = ["execution_scope_policy", "operator_record"] as const;
const OPERATOR_RECORD_KEYS = [
  "execution_scope_id",
  "network_activity",
  "operator_authority",
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
const OPERATOR_RECORD_ID = /^[a-z0-9][a-z0-9:_-]{2,127}$/;

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
  disposition: WhyMoveSecEdgarExternalReadOperatorRecordDisposition,
  reasons: readonly WhyMoveSecEdgarExternalReadOperatorRecordReason[] = [],
  operatorRecord: NormalizedWhyMoveSecEdgarExternalReadOperatorRecord | null = null,
): WhyMoveSecEdgarExternalReadOperatorRecordResult {
  return freeze({
    version: WHY_MOVE_SEC_EDGAR_EXTERNAL_READ_OPERATOR_RECORD_VERSION,
    disposition,
    reasons: freeze(
      [...new Set(reasons)].sort() as WhyMoveSecEdgarExternalReadOperatorRecordReason[],
    ),
    validated_operator_record:
      operatorRecord === null ? null : freeze({
        ...operatorRecord,
        required_ci_evidence: freeze({ ...operatorRecord.required_ci_evidence }),
      }),
    authority: WHY_MOVE_SEC_EDGAR_EXTERNAL_READ_OPERATOR_RECORD_AUTHORITY,
  });
}

function isRequiredCiEvidence(value: PlainDataRecord): boolean {
  if (!hasExactlyDataKeys(value, REQUIRED_CI_EVIDENCE_KEYS)) return false;

  return REQUIRED_CI_EVIDENCE_KEYS.every(
    (key) => value[key] === "required_not_verified",
  );
}

/**
 * Validates only the local, fail-closed shape of a future SEC-read operator
 * record. It cannot verify CI or GitHub evidence, authorize a request, or
 * perform network activity.
 */
export function validateWhyMoveSecEdgarExternalReadOperatorRecord(
  input: unknown,
): WhyMoveSecEdgarExternalReadOperatorRecordResult {
  if (!hasExactlyDataKeys(input, INPUT_KEYS)) {
    return result("invalid_input", ["invalid_operator_record_shape"]);
  }

  const executionScopePolicy = validateWhyMoveSecEdgarExecutionScopePolicy(
    input.execution_scope_policy,
  );
  if (
    executionScopePolicy.disposition !==
      "sec_edgar_execution_scope_policy_validated_not_authorized_not_executed" ||
    executionScopePolicy.validated_execution_scope_policy === null
  ) {
    return result("not_admitted_execution_scope_policy_unvalidated");
  }

  if (!hasExactlyDataKeys(input.operator_record, OPERATOR_RECORD_KEYS)) {
    return result("invalid_input", ["accessor_or_non_plain_input"]);
  }
  const operatorRecord = input.operator_record;
  const operatorRecordId = readString(operatorRecord, "operator_record_id");
  const executionScopeId = readString(operatorRecord, "execution_scope_id");
  const rollbackOrContainment = readString(
    operatorRecord,
    "rollback_or_containment",
  );
  const operatorAuthority = readString(operatorRecord, "operator_authority");
  const networkActivity = readString(operatorRecord, "network_activity");
  const requiredCiEvidence = operatorRecord.required_ci_evidence;

  if (
    !operatorRecordId ||
    !executionScopeId ||
    !rollbackOrContainment ||
    !operatorAuthority ||
    !networkActivity
  ) {
    return result("invalid_input", ["missing_or_invalid_scalar"]);
  }

  const reasons: WhyMoveSecEdgarExternalReadOperatorRecordReason[] = [];
  if (!OPERATOR_RECORD_ID.test(operatorRecordId)) {
    reasons.push("invalid_operator_record_id");
  }
  if (
    executionScopeId !==
    executionScopePolicy.validated_execution_scope_policy.execution_scope_id
  ) {
    reasons.push("execution_scope_binding_mismatch");
  }
  if (
    !isRequiredCiEvidence(
      requiredCiEvidence as PlainDataRecord,
    )
  ) {
    reasons.push("evidence_not_marked_required_unverified");
  }
  if (
    rollbackOrContainment !==
    "cancel_before_network_on_missing_or_mismatched_evidence"
  ) {
    reasons.push("containment_not_fail_closed");
  }
  if (operatorAuthority !== "not_authorized_not_executed") {
    reasons.push("authority_status_unsafe");
  }
  if (networkActivity !== "not_performed") {
    reasons.push("network_activity_unsafe");
  }
  if (reasons.length > 0) {
    return result("not_admitted_operator_record_mismatch", reasons);
  }

  const validatedScope: NormalizedWhyMoveSecEdgarExecutionScopePolicy =
    executionScopePolicy.validated_execution_scope_policy;
  return result(
    "sec_edgar_external_read_operator_record_validated_not_authorized_not_executed",
    [],
    freeze({
      operator_record_id: operatorRecordId,
      execution_scope_id: validatedScope.execution_scope_id,
      required_ci_evidence: freeze({
        ready_candidate_six_shard: "required_not_verified" as const,
        exact_main_six_shard: "required_not_verified" as const,
        main_protection_readback: "required_not_verified" as const,
        independent_sweep: "required_not_verified" as const,
      }),
      rollback_or_containment:
        "cancel_before_network_on_missing_or_mismatched_evidence" as const,
      operator_authority: "not_authorized_not_executed" as const,
      network_activity: "not_performed" as const,
    }),
  );
}
