import {
  validateWhyMoveEvidenceEnvelope,
  type NormalizedWhyMoveEvidence,
} from "./whymove-evidence-envelope";

export const WHY_MOVE_SEC_EDGAR_PRE_READ_AUTHORIZATION_VERSION =
  "whymove_sec_edgar_pre_read_authorization_v1" as const;

export type WhyMoveSecEdgarPreReadAuthorizationDisposition =
  | "invalid_input"
  | "not_admitted_envelope_unvalidated"
  | "not_admitted_primary_evidence_unbound"
  | "not_admitted_pre_read_authorization_mismatch"
  | "sec_edgar_pre_read_authorization_validated_not_executed";

export type WhyMoveSecEdgarPreReadAuthorizationReason =
  | "accessor_or_non_plain_input"
  | "ci_rehardening_review_required"
  | "invalid_archive_locator"
  | "invalid_authorization_id"
  | "invalid_authorization_shape"
  | "missing_or_invalid_scalar"
  | "response_size_out_of_bounds"
  | "unsafe_post_read_disposition"
  | "unsafe_request_policy"
  | "unsupported_response_constraint";

export type NormalizedWhyMoveSecEdgarPreReadAuthorization = Readonly<{
  authorization_id: string;
  evidence_id: string;
  accession_number: string;
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

export type WhyMoveSecEdgarPreReadAuthorizationResult = Readonly<{
  version: typeof WHY_MOVE_SEC_EDGAR_PRE_READ_AUTHORIZATION_VERSION;
  disposition: WhyMoveSecEdgarPreReadAuthorizationDisposition;
  reasons: readonly WhyMoveSecEdgarPreReadAuthorizationReason[];
  validated_pre_read_authorization: NormalizedWhyMoveSecEdgarPreReadAuthorization | null;
}>;

const INPUT_KEYS = ["envelope", "pre_read_authorization"] as const;
const AUTHORIZATION_KEYS = [
  "accession_number",
  "advisory_influence",
  "archive_url",
  "authorization_id",
  "broker_action",
  "ci_rehardening_review",
  "credentials_mode",
  "evidence_id",
  "execution_status",
  "expected_http_status",
  "expected_media_type",
  "max_response_bytes",
  "redirect_mode",
  "request_method",
  "response_handling",
  "runtime_binding",
] as const;
const AUTHORIZATION_ID = /^[a-z0-9][a-z0-9:_-]{2,127}$/;
const ACCESSION_NUMBER = /^\d{10}-\d{2}-\d{6}$/;
const SEC_ARCHIVE_PATH = /^\/Archives\/edgar\/data\/(\d+)\/(\d+)\/[^/]+$/;
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
  disposition: WhyMoveSecEdgarPreReadAuthorizationDisposition,
  reasons: readonly WhyMoveSecEdgarPreReadAuthorizationReason[] = [],
  authorization: NormalizedWhyMoveSecEdgarPreReadAuthorization | null = null,
): WhyMoveSecEdgarPreReadAuthorizationResult {
  return freeze({
    version: WHY_MOVE_SEC_EDGAR_PRE_READ_AUTHORIZATION_VERSION,
    disposition,
    reasons: freeze(
      [...new Set(reasons)].sort() as WhyMoveSecEdgarPreReadAuthorizationReason[],
    ),
    validated_pre_read_authorization:
      authorization === null ? null : freeze({ ...authorization }),
  });
}

function isExactSecArchiveLocator(
  archiveUrl: string,
  accessionNumber: string,
): boolean {
  let locator: URL;
  try {
    locator = new URL(archiveUrl);
  } catch {
    return false;
  }

  const pathMatch = SEC_ARCHIVE_PATH.exec(locator.pathname);
  return (
    locator.protocol === "https:" &&
    locator.hostname === "www.sec.gov" &&
    locator.username === "" &&
    locator.password === "" &&
    locator.port === "" &&
    locator.search === "" &&
    locator.hash === "" &&
    pathMatch !== null &&
    pathMatch[2] === accessionNumber.replaceAll("-", "")
  );
}

function hasBoundSecPrimaryEvidence(
  evidence: readonly NormalizedWhyMoveEvidence[],
  evidenceId: string,
): boolean {
  return evidence.some(
    (item) =>
      item.evidence_id === evidenceId &&
      item.source_role === "primary_evidence" &&
      item.source_id === "sec_edgar",
  );
}

/**
 * Validates a local, caller-supplied pre-read SEC authorization shape. This
 * function never issues a request or makes the validated values authority to
 * issue one.
 */
export function validateWhyMoveSecEdgarPreReadAuthorization(
  input: unknown,
): WhyMoveSecEdgarPreReadAuthorizationResult {
  if (!hasExactlyDataKeys(input, INPUT_KEYS)) {
    return result("invalid_input", ["invalid_authorization_shape"]);
  }

  const envelope = validateWhyMoveEvidenceEnvelope(input.envelope);
  if (envelope.disposition !== "evidence_validated_not_admitted") {
    return result("not_admitted_envelope_unvalidated");
  }

  if (!hasExactlyDataKeys(input.pre_read_authorization, AUTHORIZATION_KEYS)) {
    return result("invalid_input", ["accessor_or_non_plain_input"]);
  }
  const authorization = input.pre_read_authorization;

  const authorizationId = readString(authorization, "authorization_id");
  const evidenceId = readString(authorization, "evidence_id");
  const accessionNumber = readString(authorization, "accession_number");
  const archiveUrl = readString(authorization, "archive_url");
  const requestMethod = readString(authorization, "request_method");
  const redirectMode = readString(authorization, "redirect_mode");
  const credentialsMode = readString(authorization, "credentials_mode");
  const expectedMediaType = readString(authorization, "expected_media_type");
  const responseHandling = readString(authorization, "response_handling");
  const runtimeBinding = readString(authorization, "runtime_binding");
  const advisoryInfluence = readString(authorization, "advisory_influence");
  const brokerAction = readString(authorization, "broker_action");
  const ciRehardeningReview = readString(authorization, "ci_rehardening_review");
  const executionStatus = readString(authorization, "execution_status");
  const expectedHttpStatus = readSafeInteger(authorization, "expected_http_status");
  const maxResponseBytes = readSafeInteger(authorization, "max_response_bytes");

  if (
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
    !executionStatus ||
    expectedHttpStatus === null ||
    maxResponseBytes === null
  ) {
    return result("invalid_input", ["missing_or_invalid_scalar"]);
  }

  if (!hasBoundSecPrimaryEvidence(envelope.normalized_evidence, evidenceId)) {
    return result("not_admitted_primary_evidence_unbound");
  }

  const reasons: WhyMoveSecEdgarPreReadAuthorizationReason[] = [];
  if (!AUTHORIZATION_ID.test(authorizationId)) reasons.push("invalid_authorization_id");
  if (!ACCESSION_NUMBER.test(accessionNumber)) reasons.push("invalid_archive_locator");
  if (!isExactSecArchiveLocator(archiveUrl, accessionNumber)) {
    reasons.push("invalid_archive_locator");
  }
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
    return result("not_admitted_pre_read_authorization_mismatch", reasons);
  }

  return result(
    "sec_edgar_pre_read_authorization_validated_not_executed",
    [],
    freeze({
      authorization_id: authorizationId,
      evidence_id: evidenceId,
      accession_number: accessionNumber,
      archive_url: archiveUrl,
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
