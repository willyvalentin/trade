import {
  validateWhyMoveSecEdgarGitHubEvidenceReadPlan,
  type NormalizedWhyMoveSecEdgarGitHubEvidenceReadPlan,
} from "./whymove-sec-edgar-github-evidence-read-plan";

export const WHY_MOVE_SEC_EDGAR_GITHUB_EVIDENCE_RECEIPT_VERSION =
  "whymove_sec_edgar_github_evidence_receipt_v1" as const;

export type WhyMoveSecEdgarGitHubEvidenceReceiptDisposition =
  | "invalid_input"
  | "not_admitted_github_read_plan_unvalidated"
  | "not_admitted_github_evidence_receipt_mismatch"
  | "github_evidence_receipt_locally_validated_not_independently_verified";

export type WhyMoveSecEdgarGitHubEvidenceReceiptReason =
  | "accessor_or_non_plain_input"
  | "branch_protection_metadata_mismatch"
  | "evidence_bundle_binding_mismatch"
  | "execution_scope_binding_mismatch"
  | "invalid_github_evidence_receipt_shape"
  | "invalid_receipt_id"
  | "missing_or_invalid_scalar"
  | "network_activity_unsafe"
  | "operator_record_binding_mismatch"
  | "plan_binding_mismatch"
  | "readback_request_mismatch"
  | "readback_set_mismatch"
  | "readback_status_unexpected"
  | "response_body_retention_unsafe"
  | "response_handling_unsafe"
  | "rulesets_metadata_mismatch"
  | "run_metadata_mismatch";

export type WhyMoveSecEdgarGitHubEvidenceReceiptAuthority = Readonly<{
  mode: "provider_free_github_evidence_receipt_validator";
  may_request_github: false;
  may_read_external_response: false;
  may_use_credentials: false;
  may_read_environment: false;
  may_change_ci_policy: false;
  may_change_branch_protection: false;
  may_persist: false;
  may_bind_runtime: false;
  may_deploy: false;
  may_influence_advisory: false;
  may_invoke_broker: false;
  may_access_production: false;
}>;

export const WHY_MOVE_SEC_EDGAR_GITHUB_EVIDENCE_RECEIPT_AUTHORITY: WhyMoveSecEdgarGitHubEvidenceReceiptAuthority =
  Object.freeze({
    mode: "provider_free_github_evidence_receipt_validator",
    may_request_github: false,
    may_read_external_response: false,
    may_use_credentials: false,
    may_read_environment: false,
    may_change_ci_policy: false,
    may_change_branch_protection: false,
    may_persist: false,
    may_bind_runtime: false,
    may_deploy: false,
    may_influence_advisory: false,
    may_invoke_broker: false,
    may_access_production: false,
  });

type EvidenceKind =
  | "ready_candidate_run"
  | "exact_main_run"
  | "independent_sweep_run"
  | "main_branch_protection"
  | "repository_rulesets";

export type NormalizedWhyMoveSecEdgarGitHubEvidenceReceipt = Readonly<{
  receipt_id: string;
  plan_id: string;
  evidence_bundle_id: string;
  execution_scope_id: string;
  operator_record_id: string;
  observed_readbacks: readonly Readonly<{
    evidence_kind: EvidenceKind;
    method: "GET";
    path: string;
    http_status: 200;
    response_body: "not_retained";
  }>[];
  response_handling: "redacted_observed_metadata_only";
  network_activity: "claimed_five_gets_complete_not_independently_verified";
}>;

export type WhyMoveSecEdgarGitHubEvidenceReceiptResult = Readonly<{
  version: typeof WHY_MOVE_SEC_EDGAR_GITHUB_EVIDENCE_RECEIPT_VERSION;
  disposition: WhyMoveSecEdgarGitHubEvidenceReceiptDisposition;
  reasons: readonly WhyMoveSecEdgarGitHubEvidenceReceiptReason[];
  validated_receipt: NormalizedWhyMoveSecEdgarGitHubEvidenceReceipt | null;
  authority: WhyMoveSecEdgarGitHubEvidenceReceiptAuthority;
}>;

type PlainDataRecord = Readonly<Record<string, unknown>>;

type ExpectedReadback = Readonly<{
  evidence_kind: EvidenceKind;
  path: string;
  run_id?: number;
  head_sha?: string;
  event?: "pull_request" | "push" | "schedule" | "workflow_dispatch";
}>;

const INPUT_KEYS = ["github_evidence_receipt", "github_readback_plan_input"] as const;
const RECEIPT_KEYS = [
  "evidence_bundle_id",
  "execution_scope_id",
  "network_activity",
  "observed_readbacks",
  "operator_record_id",
  "plan_id",
  "receipt_id",
  "response_handling",
] as const;
const READBACK_KEYS = [
  "evidence_kind",
  "http_status",
  "method",
  "observed_metadata",
  "path",
  "response_body",
] as const;
const RUN_METADATA_KEYS = ["conclusion", "event", "head_sha", "run_id", "status"] as const;
const PROTECTION_METADATA_KEYS = [
  "protected",
  "required_check",
  "required_check_present",
  "strict",
] as const;
const RULESETS_METADATA_KEYS = ["ruleset_count", "rulesets_observed"] as const;
const RECEIPT_ID = /^[a-z0-9][a-z0-9:_-]{2,127}$/;
const SHA = /^[0-9a-f]{40}$/;

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

function hasDataArray(value: unknown): value is readonly unknown[] {
  if (!Array.isArray(value) || Object.getPrototypeOf(value) !== Array.prototype) {
    return false;
  }
  if (Object.getOwnPropertySymbols(value).length > 0) return false;
  const ownKeys = Object.getOwnPropertyNames(value);
  if (ownKeys.length !== value.length + 1 || !ownKeys.includes("length")) {
    return false;
  }
  for (let index = 0; index < value.length; index += 1) {
    const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
    if (descriptor === undefined || !("value" in descriptor)) return false;
  }
  return true;
}

function readString(record: PlainDataRecord, key: string): string | null {
  const value = record[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

function isPositiveSafeInteger(value: unknown): value is number {
  return Number.isSafeInteger(value) && (value as number) > 0;
}

function result(
  disposition: WhyMoveSecEdgarGitHubEvidenceReceiptDisposition,
  reasons: readonly WhyMoveSecEdgarGitHubEvidenceReceiptReason[] = [],
  receipt: NormalizedWhyMoveSecEdgarGitHubEvidenceReceipt | null = null,
): WhyMoveSecEdgarGitHubEvidenceReceiptResult {
  return freeze({
    version: WHY_MOVE_SEC_EDGAR_GITHUB_EVIDENCE_RECEIPT_VERSION,
    disposition,
    reasons: freeze(
      [...new Set(reasons)].sort() as WhyMoveSecEdgarGitHubEvidenceReceiptReason[],
    ),
    validated_receipt:
      receipt === null
        ? null
        : freeze({
            ...receipt,
            observed_readbacks: freeze(
              receipt.observed_readbacks.map((readback) => freeze({ ...readback })),
            ),
          }),
    authority: WHY_MOVE_SEC_EDGAR_GITHUB_EVIDENCE_RECEIPT_AUTHORITY,
  });
}

function expectedReadbacks(
  readPlan: NormalizedWhyMoveSecEdgarGitHubEvidenceReadPlan,
  originalPlan: PlainDataRecord,
): readonly ExpectedReadback[] | null {
  const readbacks = readPlan.planned_readbacks;
  const readyRunId = originalPlan.ready_candidate_run_id;
  const exactMainRunId = originalPlan.exact_main_run_id;
  const sweepRunId = originalPlan.independent_sweep_run_id;
  const readySha = readString(originalPlan, "ready_candidate_sha");
  const exactMainSha = readString(originalPlan, "exact_main_sha");
  const sweepTrigger = originalPlan.independent_sweep_trigger;

  if (
    readbacks.length !== 5 ||
    !isPositiveSafeInteger(readyRunId) ||
    !isPositiveSafeInteger(exactMainRunId) ||
    !isPositiveSafeInteger(sweepRunId) ||
    !readySha ||
    !exactMainSha ||
    (sweepTrigger !== "schedule" && sweepTrigger !== "workflow_dispatch")
  ) {
    return null;
  }

  return [
    freeze({
      evidence_kind: "ready_candidate_run" as const,
      path: readbacks[0]?.path ?? "",
      run_id: readyRunId,
      head_sha: readySha,
      event: "pull_request" as const,
    }),
    freeze({
      evidence_kind: "exact_main_run" as const,
      path: readbacks[1]?.path ?? "",
      run_id: exactMainRunId,
      head_sha: exactMainSha,
      event: "push" as const,
    }),
    freeze({
      evidence_kind: "independent_sweep_run" as const,
      path: readbacks[2]?.path ?? "",
      run_id: sweepRunId,
      event: sweepTrigger,
    }),
    freeze({
      evidence_kind: "main_branch_protection" as const,
      path: readbacks[3]?.path ?? "",
    }),
    freeze({
      evidence_kind: "repository_rulesets" as const,
      path: readbacks[4]?.path ?? "",
    }),
  ];
}

function runMetadataMatches(
  value: unknown,
  expected: ExpectedReadback,
): boolean {
  if (!hasExactlyDataKeys(value, RUN_METADATA_KEYS)) return false;
  return (
    value.run_id === expected.run_id &&
    (expected.head_sha === undefined
      ? typeof value.head_sha === "string" && SHA.test(value.head_sha)
      : value.head_sha === expected.head_sha) &&
    value.event === expected.event &&
    value.status === "completed" &&
    value.conclusion === "success"
  );
}

function protectionMetadataMatches(
  value: unknown,
  requiredCheck: string,
): boolean {
  if (!hasExactlyDataKeys(value, PROTECTION_METADATA_KEYS)) return false;
  return (
    value.protected === true &&
    value.required_check === requiredCheck &&
    value.required_check_present === true &&
    value.strict === true
  );
}

function rulesetsMetadataMatches(value: unknown): boolean {
  if (!hasExactlyDataKeys(value, RULESETS_METADATA_KEYS)) return false;
  return (
    value.rulesets_observed === true &&
    Number.isSafeInteger(value.ruleset_count) &&
    (value.ruleset_count as number) >= 0
  );
}

/**
 * Validates only caller-supplied, redacted metadata for CAT-00.10's fixed
 * five GitHub GET readbacks. It never makes a request, reads a credential or
 * raw response, changes CI policy, or authorizes the later SEC operation.
 */
function validateWhyMoveSecEdgarGitHubEvidenceReceiptInternal(
  input: unknown,
): WhyMoveSecEdgarGitHubEvidenceReceiptResult {
  if (!hasExactlyDataKeys(input, INPUT_KEYS)) {
    return result("invalid_input", ["invalid_github_evidence_receipt_shape"]);
  }

  const planResult = validateWhyMoveSecEdgarGitHubEvidenceReadPlan(
    input.github_readback_plan_input,
  );
  if (
    planResult.disposition !==
      "github_evidence_read_plan_locally_shaped_not_authorized_not_executed" ||
    planResult.planned_readback === null
  ) {
    return result("not_admitted_github_read_plan_unvalidated");
  }
  if (!hasExactlyDataKeys(input.github_readback_plan_input, ["evidence_bundle_input", "github_readback_plan"]) || !hasExactlyDataKeys(input.github_readback_plan_input.github_readback_plan, [
    "containment",
    "github_repository",
    "identity_requirement",
    "independent_sweep_run_id",
    "independent_sweep_trigger",
    "network_activity",
    "plan_id",
    "protected_branch",
    "ready_candidate_run_id",
    "ready_candidate_sha",
    "required_check",
    "exact_main_run_id",
    "exact_main_sha",
  ])) {
    return result("invalid_input", ["accessor_or_non_plain_input"]);
  }
  if (!hasExactlyDataKeys(input.github_evidence_receipt, RECEIPT_KEYS)) {
    return result("invalid_input", ["accessor_or_non_plain_input"]);
  }

  const receipt = input.github_evidence_receipt;
  const receiptId = readString(receipt, "receipt_id");
  const planId = readString(receipt, "plan_id");
  const evidenceBundleId = readString(receipt, "evidence_bundle_id");
  const executionScopeId = readString(receipt, "execution_scope_id");
  const operatorRecordId = readString(receipt, "operator_record_id");
  const responseHandling = readString(receipt, "response_handling");
  const networkActivity = readString(receipt, "network_activity");
  const observedReadbacks = receipt.observed_readbacks;
  if (
    !receiptId ||
    !planId ||
    !evidenceBundleId ||
    !executionScopeId ||
    !operatorRecordId ||
    !responseHandling ||
    !networkActivity ||
    !hasDataArray(observedReadbacks)
  ) {
    return result("invalid_input", ["missing_or_invalid_scalar"]);
  }

  const normalizedPlan = planResult.planned_readback;
  const expected = expectedReadbacks(
    normalizedPlan,
    input.github_readback_plan_input.github_readback_plan,
  );
  if (expected === null) {
    return result("not_admitted_github_evidence_receipt_mismatch", [
      "readback_set_mismatch",
    ]);
  }

  const reasons: WhyMoveSecEdgarGitHubEvidenceReceiptReason[] = [];
  if (!RECEIPT_ID.test(receiptId)) reasons.push("invalid_receipt_id");
  if (planId !== normalizedPlan.plan_id) reasons.push("plan_binding_mismatch");
  if (evidenceBundleId !== normalizedPlan.evidence_bundle_id) {
    reasons.push("evidence_bundle_binding_mismatch");
  }
  if (executionScopeId !== normalizedPlan.execution_scope_id) {
    reasons.push("execution_scope_binding_mismatch");
  }
  if (operatorRecordId !== normalizedPlan.operator_record_id) {
    reasons.push("operator_record_binding_mismatch");
  }
  if (responseHandling !== "redacted_observed_metadata_only") {
    reasons.push("response_handling_unsafe");
  }
  if (networkActivity !== "claimed_five_gets_complete_not_independently_verified") {
    reasons.push("network_activity_unsafe");
  }
  if (observedReadbacks.length !== expected.length) {
    reasons.push("readback_set_mismatch");
  }

  const normalizedReadbacks: Array<
    NormalizedWhyMoveSecEdgarGitHubEvidenceReceipt["observed_readbacks"][number]
  > = [];
  for (const [index, expectedReadback] of expected.entries()) {
    const observed = observedReadbacks[index];
    if (!hasExactlyDataKeys(observed, READBACK_KEYS)) {
      reasons.push("accessor_or_non_plain_input");
      continue;
    }
    if (
      observed.evidence_kind !== expectedReadback.evidence_kind ||
      observed.method !== "GET" ||
      observed.path !== expectedReadback.path
    ) {
      reasons.push("readback_request_mismatch");
    }
    if (observed.http_status !== 200) reasons.push("readback_status_unexpected");
    if (observed.response_body !== "not_retained") {
      reasons.push("response_body_retention_unsafe");
    }

    if (
      expectedReadback.evidence_kind === "ready_candidate_run" ||
      expectedReadback.evidence_kind === "exact_main_run" ||
      expectedReadback.evidence_kind === "independent_sweep_run"
    ) {
      if (!runMetadataMatches(observed.observed_metadata, expectedReadback)) {
        reasons.push("run_metadata_mismatch");
      }
    } else if (expectedReadback.evidence_kind === "main_branch_protection") {
      if (
        !protectionMetadataMatches(
          observed.observed_metadata,
          normalizedPlan.required_check,
        )
      ) {
        reasons.push("branch_protection_metadata_mismatch");
      }
    } else if (!rulesetsMetadataMatches(observed.observed_metadata)) {
      reasons.push("rulesets_metadata_mismatch");
    }

    normalizedReadbacks.push(
      freeze({
        evidence_kind: expectedReadback.evidence_kind,
        method: "GET" as const,
        path: expectedReadback.path,
        http_status: 200 as const,
        response_body: "not_retained" as const,
      }),
    );
  }

  if (reasons.length > 0) {
    return result("not_admitted_github_evidence_receipt_mismatch", reasons);
  }

  return result(
    "github_evidence_receipt_locally_validated_not_independently_verified",
    [],
    freeze({
      receipt_id: receiptId,
      plan_id: normalizedPlan.plan_id,
      evidence_bundle_id: normalizedPlan.evidence_bundle_id,
      execution_scope_id: normalizedPlan.execution_scope_id,
      operator_record_id: normalizedPlan.operator_record_id,
      observed_readbacks: freeze(normalizedReadbacks),
      response_handling: "redacted_observed_metadata_only" as const,
      network_activity:
        "claimed_five_gets_complete_not_independently_verified" as const,
    }),
  );
}

/**
 * Keeps malformed or proxy-backed caller input on the public fail-closed
 * result path. The internal validator intentionally performs strict own-data
 * inspection, which a hostile proxy can itself make throw.
 */
export function validateWhyMoveSecEdgarGitHubEvidenceReceipt(
  input: unknown,
): WhyMoveSecEdgarGitHubEvidenceReceiptResult {
  try {
    return validateWhyMoveSecEdgarGitHubEvidenceReceiptInternal(input);
  } catch {
    return result("invalid_input", ["accessor_or_non_plain_input"]);
  }
}
