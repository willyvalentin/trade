import {
  validateWhyMoveSecEdgarPreReadAuthorization,
  type NormalizedWhyMoveSecEdgarPreReadAuthorization,
} from "./whymove-sec-edgar-pre-read-authorization";

export const WHY_MOVE_SEC_EDGAR_EXECUTION_SCOPE_POLICY_VERSION =
  "whymove_sec_edgar_execution_scope_policy_v1" as const;

export type WhyMoveSecEdgarExecutionScopePolicyDisposition =
  | "invalid_input"
  | "not_admitted_pre_read_authorization_unvalidated"
  | "not_admitted_execution_scope_mismatch"
  | "sec_edgar_execution_scope_policy_validated_not_authorized_not_executed";

export type WhyMoveSecEdgarExecutionScopePolicyReason =
  | "accessor_or_non_plain_input"
  | "authorization_binding_mismatch"
  | "ci_rehardening_review_required"
  | "containment_required"
  | "independent_readback_required"
  | "invalid_execution_scope_id"
  | "invalid_execution_scope_shape"
  | "missing_or_invalid_scalar"
  | "request_budget_mismatch"
  | "unsafe_execution_status"
  | "unsafe_post_read_disposition"
  | "unsafe_request_policy"
  | "unsupported_response_constraint";

export type NormalizedWhyMoveSecEdgarExecutionScopePolicy = Readonly<{
  execution_scope_id: string;
  authorization_id: string;
  evidence_id: string;
  accession_number: string;
  archive_url: string;
  maximum_requests: 1;
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
  independent_readback: "required_after_single_request";
  containment: "stop_after_first_request_no_retry";
  execution_status: "not_authorized_not_executed";
}>;

export type WhyMoveSecEdgarExecutionScopePolicyResult = Readonly<{
  version: typeof WHY_MOVE_SEC_EDGAR_EXECUTION_SCOPE_POLICY_VERSION;
  disposition: WhyMoveSecEdgarExecutionScopePolicyDisposition;
  reasons: readonly WhyMoveSecEdgarExecutionScopePolicyReason[];
  validated_execution_scope_policy: NormalizedWhyMoveSecEdgarExecutionScopePolicy | null;
}>;

const INPUT_KEYS = ["execution_scope", "pre_read_authorization"] as const;
const EXECUTION_SCOPE_KEYS = [
  "accession_number",
  "advisory_influence",
  "archive_url",
  "authorization_id",
  "broker_action",
  "ci_rehardening_review",
  "containment",
  "credentials_mode",
  "evidence_id",
  "execution_scope_id",
  "execution_status",
  "expected_http_status",
  "expected_media_type",
  "independent_readback",
  "max_response_bytes",
  "maximum_requests",
  "redirect_mode",
  "request_method",
  "response_handling",
  "runtime_binding",
] as const;
const EXECUTION_SCOPE_ID = /^[a-z0-9][a-z0-9:_-]{2,127}$/;

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
  disposition: WhyMoveSecEdgarExecutionScopePolicyDisposition,
  reasons: readonly WhyMoveSecEdgarExecutionScopePolicyReason[] = [],
  executionScopePolicy: NormalizedWhyMoveSecEdgarExecutionScopePolicy | null = null,
): WhyMoveSecEdgarExecutionScopePolicyResult {
  return freeze({
    version: WHY_MOVE_SEC_EDGAR_EXECUTION_SCOPE_POLICY_VERSION,
    disposition,
    reasons: freeze(
      [...new Set(reasons)].sort() as WhyMoveSecEdgarExecutionScopePolicyReason[],
    ),
    validated_execution_scope_policy:
      executionScopePolicy === null ? null : freeze({ ...executionScopePolicy }),
  });
}

function isBoundToAuthorization(
  scope: PlainDataRecord,
  authorization: NormalizedWhyMoveSecEdgarPreReadAuthorization,
): boolean {
  return (
    scope.authorization_id === authorization.authorization_id &&
    scope.evidence_id === authorization.evidence_id &&
    scope.accession_number === authorization.accession_number &&
    scope.archive_url === authorization.archive_url &&
    scope.request_method === authorization.request_method &&
    scope.redirect_mode === authorization.redirect_mode &&
    scope.credentials_mode === authorization.credentials_mode &&
    scope.expected_http_status === authorization.expected_http_status &&
    scope.expected_media_type === authorization.expected_media_type &&
    scope.max_response_bytes === authorization.max_response_bytes &&
    scope.response_handling === authorization.response_handling &&
    scope.runtime_binding === authorization.runtime_binding &&
    scope.advisory_influence === authorization.advisory_influence &&
    scope.broker_action === authorization.broker_action &&
    scope.ci_rehardening_review === authorization.ci_rehardening_review
  );
}

/**
 * Validates only a local policy shape for one future public SEC read. It never
 * issues a request or turns a valid scope into external authority.
 */
export function validateWhyMoveSecEdgarExecutionScopePolicy(
  input: unknown,
): WhyMoveSecEdgarExecutionScopePolicyResult {
  if (!hasExactlyDataKeys(input, INPUT_KEYS)) {
    return result("invalid_input", ["invalid_execution_scope_shape"]);
  }

  const preReadAuthorization = validateWhyMoveSecEdgarPreReadAuthorization(
    input.pre_read_authorization,
  );
  if (
    preReadAuthorization.disposition !==
      "sec_edgar_pre_read_authorization_validated_not_executed" ||
    preReadAuthorization.validated_pre_read_authorization === null
  ) {
    return result("not_admitted_pre_read_authorization_unvalidated");
  }

  if (!hasExactlyDataKeys(input.execution_scope, EXECUTION_SCOPE_KEYS)) {
    return result("invalid_input", ["accessor_or_non_plain_input"]);
  }
  const scope = input.execution_scope;

  const executionScopeId = readString(scope, "execution_scope_id");
  const authorizationId = readString(scope, "authorization_id");
  const evidenceId = readString(scope, "evidence_id");
  const accessionNumber = readString(scope, "accession_number");
  const archiveUrl = readString(scope, "archive_url");
  const requestMethod = readString(scope, "request_method");
  const redirectMode = readString(scope, "redirect_mode");
  const credentialsMode = readString(scope, "credentials_mode");
  const expectedMediaType = readString(scope, "expected_media_type");
  const responseHandling = readString(scope, "response_handling");
  const runtimeBinding = readString(scope, "runtime_binding");
  const advisoryInfluence = readString(scope, "advisory_influence");
  const brokerAction = readString(scope, "broker_action");
  const ciRehardeningReview = readString(scope, "ci_rehardening_review");
  const independentReadback = readString(scope, "independent_readback");
  const containment = readString(scope, "containment");
  const executionStatus = readString(scope, "execution_status");
  const maximumRequests = readSafeInteger(scope, "maximum_requests");
  const expectedHttpStatus = readSafeInteger(scope, "expected_http_status");
  const maxResponseBytes = readSafeInteger(scope, "max_response_bytes");

  if (
    !executionScopeId ||
    !authorizationId ||
    !evidenceId ||
    !accessionNumber ||
    !archiveUrl ||
    !requestMethod ||
    !redirectMode ||
    !credentialsMode ||
    !expectedMediaType ||
    !responseHandling ||
    !runtimeBinding ||
    !advisoryInfluence ||
    !brokerAction ||
    !ciRehardeningReview ||
    !independentReadback ||
    !containment ||
    !executionStatus ||
    maximumRequests === null ||
    expectedHttpStatus === null ||
    maxResponseBytes === null
  ) {
    return result("invalid_input", ["missing_or_invalid_scalar"]);
  }

  const reasons: WhyMoveSecEdgarExecutionScopePolicyReason[] = [];
  if (!EXECUTION_SCOPE_ID.test(executionScopeId)) {
    reasons.push("invalid_execution_scope_id");
  }
  if (!isBoundToAuthorization(scope, preReadAuthorization.validated_pre_read_authorization)) {
    reasons.push("authorization_binding_mismatch");
  }
  if (maximumRequests !== 1) reasons.push("request_budget_mismatch");
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
  if (
    responseHandling !== "validate_only_no_persistence" ||
    runtimeBinding !== "none" ||
    advisoryInfluence !== "none" ||
    brokerAction !== "none"
  ) {
    reasons.push("unsafe_post_read_disposition");
  }
  if (ciRehardeningReview !== "required_before_external_authority") {
    reasons.push("ci_rehardening_review_required");
  }
  if (independentReadback !== "required_after_single_request") {
    reasons.push("independent_readback_required");
  }
  if (containment !== "stop_after_first_request_no_retry") {
    reasons.push("containment_required");
  }
  if (executionStatus !== "not_authorized_not_executed") {
    reasons.push("unsafe_execution_status");
  }
  if (reasons.length > 0) {
    return result("not_admitted_execution_scope_mismatch", reasons);
  }

  return result(
    "sec_edgar_execution_scope_policy_validated_not_authorized_not_executed",
    [],
    freeze({
      execution_scope_id: executionScopeId,
      authorization_id: authorizationId,
      evidence_id: evidenceId,
      accession_number: accessionNumber,
      archive_url: archiveUrl,
      maximum_requests: 1 as const,
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
      independent_readback: "required_after_single_request" as const,
      containment: "stop_after_first_request_no_retry" as const,
      execution_status: "not_authorized_not_executed" as const,
    }),
  );
}
