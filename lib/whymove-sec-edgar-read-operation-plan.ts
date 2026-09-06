import {
  validateWhyMoveSecEdgarEvidenceReceipts,
  type NormalizedWhyMoveSecEdgarEvidenceReceipt,
} from "./whymove-sec-edgar-evidence-receipt";

export const WHY_MOVE_SEC_EDGAR_READ_OPERATION_PLAN_VERSION =
  "whymove_sec_edgar_read_operation_plan_v1" as const;

export type WhyMoveSecEdgarReadOperationPlanDisposition =
  | "invalid_input"
  | "not_admitted_receipt_unvalidated"
  | "not_admitted_receipt_count"
  | "not_admitted_operation_plan_mismatch"
  | "sec_edgar_read_operation_plan_validated_not_executed";

export type WhyMoveSecEdgarReadOperationPlanReason =
  | "accessor_or_non_plain_input"
  | "ci_rehardening_review_required"
  | "evidence_id_mismatch"
  | "invalid_operation_id"
  | "invalid_operation_plan_shape"
  | "missing_or_invalid_scalar"
  | "request_url_mismatch"
  | "response_size_out_of_bounds"
  | "unsafe_post_read_disposition"
  | "unsafe_request_policy"
  | "unsupported_response_constraint";

export type NormalizedWhyMoveSecEdgarReadOperationPlan = Readonly<{
  operation_id: string;
  evidence_id: string;
  archive_url: string;
  request_method: "GET";
  redirect_mode: "error";
  credentials_mode: "omit";
  expected_http_status: 200;
  expected_media_type: "text/html";
  max_response_bytes: number;
  response_handling: "validate_only_no_persistence";
  runtime_binding: "none";
  advisory_influence: "none";
  broker_action: "none";
  ci_rehardening_review: "required_before_external_authority";
  execution_status: "not_executed";
}>;

export type WhyMoveSecEdgarReadOperationPlanResult = Readonly<{
  version: typeof WHY_MOVE_SEC_EDGAR_READ_OPERATION_PLAN_VERSION;
  disposition: WhyMoveSecEdgarReadOperationPlanDisposition;
  reasons: readonly WhyMoveSecEdgarReadOperationPlanReason[];
  validated_operation_plan: NormalizedWhyMoveSecEdgarReadOperationPlan | null;
}>;

const INPUT_KEYS = ["operation_plan", "receipt_bundle"] as const;
const OPERATION_PLAN_KEYS = [
  "advisory_influence",
  "broker_action",
  "ci_rehardening_review",
  "credentials_mode",
  "evidence_id",
  "execution_status",
  "expected_http_status",
  "expected_media_type",
  "max_response_bytes",
  "operation_id",
  "redirect_mode",
  "request_method",
  "request_url",
  "response_handling",
  "runtime_binding",
] as const;
const OPERATION_ID = /^[a-z0-9][a-z0-9:_-]{2,127}$/;
const MAX_RESPONSE_BYTES = 1_048_576;

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

function readSafeInteger(record: PlainDataRecord, key: string): number | null {
  const value = record[key];
  return typeof value === "number" && Number.isSafeInteger(value) ? value : null;
}

function result(
  disposition: WhyMoveSecEdgarReadOperationPlanDisposition,
  reasons: readonly WhyMoveSecEdgarReadOperationPlanReason[] = [],
  operationPlan: NormalizedWhyMoveSecEdgarReadOperationPlan | null = null,
): WhyMoveSecEdgarReadOperationPlanResult {
  return freeze({
    version: WHY_MOVE_SEC_EDGAR_READ_OPERATION_PLAN_VERSION,
    disposition,
    reasons: freeze(
      [...new Set(reasons)].sort() as WhyMoveSecEdgarReadOperationPlanReason[],
    ),
    validated_operation_plan: operationPlan === null ? null : freeze({ ...operationPlan }),
  });
}

function receiptForSingleRead(
  receiptBundle: unknown,
):
  | Readonly<{ receipt: NormalizedWhyMoveSecEdgarEvidenceReceipt }>
  | Readonly<{ disposition: "not_admitted_receipt_unvalidated" | "not_admitted_receipt_count" }> {
  const receiptResult = validateWhyMoveSecEdgarEvidenceReceipts(receiptBundle);
  if (
    receiptResult.disposition !==
    "sec_edgar_receipts_validated_not_admitted"
  ) {
    return { disposition: "not_admitted_receipt_unvalidated" };
  }
  if (receiptResult.validated_receipts.length !== 1) {
    return { disposition: "not_admitted_receipt_count" };
  }
  return { receipt: receiptResult.validated_receipts[0]! };
}

/**
 * Validates one caller-supplied, receipt-bound SEC read plan. This is a local
 * policy-shape verifier only: it does not perform a network operation or make
 * the returned plan execution authority.
 */
export function validateWhyMoveSecEdgarReadOperationPlan(
  input: unknown,
): WhyMoveSecEdgarReadOperationPlanResult {
  if (!hasExactlyDataKeys(input, INPUT_KEYS)) {
    return result("invalid_input", ["invalid_operation_plan_shape"]);
  }

  const receiptOutcome = receiptForSingleRead(input.receipt_bundle);
  if ("disposition" in receiptOutcome) {
    return result(receiptOutcome.disposition);
  }
  const receipt = receiptOutcome.receipt;

  if (!hasExactlyDataKeys(input.operation_plan, OPERATION_PLAN_KEYS)) {
    return result("invalid_input", ["accessor_or_non_plain_input"]);
  }
  const plan = input.operation_plan;

  const operationId = readString(plan, "operation_id");
  const evidenceId = readString(plan, "evidence_id");
  const requestUrl = readString(plan, "request_url");
  const requestMethod = readString(plan, "request_method");
  const redirectMode = readString(plan, "redirect_mode");
  const credentialsMode = readString(plan, "credentials_mode");
  const expectedMediaType = readString(plan, "expected_media_type");
  const responseHandling = readString(plan, "response_handling");
  const runtimeBinding = readString(plan, "runtime_binding");
  const advisoryInfluence = readString(plan, "advisory_influence");
  const brokerAction = readString(plan, "broker_action");
  const ciRehardeningReview = readString(plan, "ci_rehardening_review");
  const executionStatus = readString(plan, "execution_status");
  const expectedHttpStatus = readSafeInteger(plan, "expected_http_status");
  const maxResponseBytes = readSafeInteger(plan, "max_response_bytes");

  if (
    !operationId ||
    !evidenceId ||
    !requestUrl ||
    !requestMethod ||
    !redirectMode ||
    !credentialsMode ||
    !expectedMediaType ||
    !responseHandling ||
    !runtimeBinding ||
    !advisoryInfluence ||
    !brokerAction ||
    !ciRehardeningReview ||
    !executionStatus ||
    expectedHttpStatus === null ||
    maxResponseBytes === null
  ) {
    return result("invalid_input", ["missing_or_invalid_scalar"]);
  }

  const reasons: WhyMoveSecEdgarReadOperationPlanReason[] = [];
  if (!OPERATION_ID.test(operationId)) reasons.push("invalid_operation_id");
  if (evidenceId !== receipt.evidence_id) reasons.push("evidence_id_mismatch");
  if (requestUrl !== receipt.archive_url) reasons.push("request_url_mismatch");
  if (
    requestMethod !== "GET" ||
    redirectMode !== "error" ||
    credentialsMode !== "omit"
  ) {
    reasons.push("unsafe_request_policy");
  }
  if (expectedHttpStatus !== 200 || expectedMediaType !== "text/html") {
    reasons.push("unsupported_response_constraint");
  }
  if (maxResponseBytes < 1 || maxResponseBytes > MAX_RESPONSE_BYTES) {
    reasons.push("response_size_out_of_bounds");
  }
  if (
    responseHandling !== "validate_only_no_persistence" ||
    runtimeBinding !== "none" ||
    advisoryInfluence !== "none" ||
    brokerAction !== "none" ||
    executionStatus !== "not_executed"
  ) {
    reasons.push("unsafe_post_read_disposition");
  }
  if (ciRehardeningReview !== "required_before_external_authority") {
    reasons.push("ci_rehardening_review_required");
  }
  if (reasons.length > 0) {
    return result("not_admitted_operation_plan_mismatch", reasons);
  }

  return result(
    "sec_edgar_read_operation_plan_validated_not_executed",
    [],
    freeze({
      operation_id: operationId,
      evidence_id: receipt.evidence_id,
      archive_url: receipt.archive_url,
      request_method: "GET" as const,
      redirect_mode: "error" as const,
      credentials_mode: "omit" as const,
      expected_http_status: 200 as const,
      expected_media_type: "text/html" as const,
      max_response_bytes: maxResponseBytes,
      response_handling: "validate_only_no_persistence" as const,
      runtime_binding: "none" as const,
      advisory_influence: "none" as const,
      broker_action: "none" as const,
      ci_rehardening_review:
        "required_before_external_authority" as const,
      execution_status: "not_executed" as const,
    }),
  );
}
