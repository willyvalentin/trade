import {
  validateWhyMoveSecEdgarFilingContent,
  type NormalizedWhyMoveSecEdgarFilingContent,
} from "./whymove-sec-edgar-filing-content";
import {
  validateWhyMoveSecEdgarEvidenceReceipts,
  type NormalizedWhyMoveSecEdgarEvidenceReceipt,
} from "./whymove-sec-edgar-evidence-receipt";

export const WHY_MOVE_SEC_EDGAR_RETRIEVAL_EVIDENCE_VERSION =
  "whymove_sec_edgar_retrieval_evidence_v1" as const;

export type WhyMoveSecEdgarRetrievalEvidenceDisposition =
  | "invalid_input"
  | "not_admitted_receipt_unvalidated"
  | "not_admitted_missing_retrieval_evidence"
  | "not_admitted_unexpected_retrieval_evidence"
  | "sec_edgar_retrieval_evidence_validated_not_admitted";

export type WhyMoveSecEdgarRetrievalEvidenceReason =
  | "accessor_or_non_plain_input"
  | "content_sha256_mismatch"
  | "content_too_large"
  | "duplicate_retrieval_evidence_id"
  | "invalid_retrieval_shape"
  | "missing_or_invalid_scalar"
  | "request_url_mismatch"
  | "response_url_mismatch"
  | "retrieved_at_mismatch"
  | "sha256_unavailable"
  | "unsafe_request_policy"
  | "unsupported_content_type"
  | "unsupported_http_response";

export type NormalizedWhyMoveSecEdgarRetrievalEvidence = Readonly<{
  evidence_id: string;
  archive_url: string;
  retrieved_at: string;
  http_status: 200;
  media_type: "text/html";
  content_sha256: string;
  utf8_byte_length: number;
}>;

export type WhyMoveSecEdgarRetrievalEvidenceResult = Readonly<{
  version: typeof WHY_MOVE_SEC_EDGAR_RETRIEVAL_EVIDENCE_VERSION;
  disposition: WhyMoveSecEdgarRetrievalEvidenceDisposition;
  reasons: readonly WhyMoveSecEdgarRetrievalEvidenceReason[];
  validated_retrieval_evidence: readonly NormalizedWhyMoveSecEdgarRetrievalEvidence[];
}>;

const INPUT_KEYS = ["receipt_bundle", "retrieval_evidence"] as const;
const RETRIEVAL_EVIDENCE_KEYS = [
  "content_text",
  "content_type",
  "credentials_mode",
  "evidence_id",
  "http_status",
  "redirect_mode",
  "request_method",
  "request_url",
  "response_url",
  "retrieved_at",
] as const;

type PlainDataRecord = Readonly<Record<string, unknown>>;

type RetrievalEvidenceEntry = Readonly<{
  evidenceId: string;
  requestUrl: string;
  responseUrl: string;
  requestMethod: string;
  redirectMode: string;
  credentialsMode: string;
  retrievedAt: string;
  httpStatus: number;
  mediaType: "text/html" | null;
  contentText: string;
}>;

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

function readDataArray(value: unknown): readonly unknown[] | null {
  if (!Array.isArray(value) || Object.getOwnPropertySymbols(value).length > 0) {
    return null;
  }

  const lengthDescriptor = Object.getOwnPropertyDescriptor(value, "length");
  if (
    !lengthDescriptor ||
    !("value" in lengthDescriptor) ||
    !Number.isSafeInteger(lengthDescriptor.value)
  ) {
    return null;
  }

  const length = lengthDescriptor.value;
  const expectedKeys = [
    "length",
    ...Array.from({ length }, (_, index) => String(index)),
  ].sort();
  const ownKeys = Object.getOwnPropertyNames(value).sort();
  if (
    ownKeys.length !== expectedKeys.length ||
    ownKeys.some((key, index) => key !== expectedKeys[index])
  ) {
    return null;
  }

  const items: unknown[] = [];
  for (let index = 0; index < length; index += 1) {
    const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
    if (!descriptor || !("value" in descriptor)) return null;
    items.push(descriptor.value);
  }
  return items;
}

function readString(record: PlainDataRecord, key: string): string | null {
  const value = record[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

function readStatus(record: PlainDataRecord): number | null {
  const value = record.http_status;
  return typeof value === "number" && Number.isSafeInteger(value) ? value : null;
}

function normalizeMediaType(value: string): "text/html" | null {
  const parts = value.split(";");
  if (parts[0]?.trim().toLowerCase() !== "text/html") return null;
  if (parts.length === 1) return "text/html";
  if (parts.length !== 2) return null;

  const parameter = parts[1]!.trim();
  const equalsIndex = parameter.indexOf("=");
  if (equalsIndex < 1) return null;
  const name = parameter.slice(0, equalsIndex).trim().toLowerCase();
  const parameterValue = parameter.slice(equalsIndex + 1).trim().toLowerCase();
  return name === "charset" && parameterValue === "utf-8" ? "text/html" : null;
}

function result(
  disposition: WhyMoveSecEdgarRetrievalEvidenceDisposition,
  reasons: readonly WhyMoveSecEdgarRetrievalEvidenceReason[] = [],
  evidence: readonly NormalizedWhyMoveSecEdgarRetrievalEvidence[] = [],
): WhyMoveSecEdgarRetrievalEvidenceResult {
  return freeze({
    version: WHY_MOVE_SEC_EDGAR_RETRIEVAL_EVIDENCE_VERSION,
    disposition,
    reasons: freeze(
      [...new Set(reasons)].sort() as WhyMoveSecEdgarRetrievalEvidenceReason[],
    ),
    validated_retrieval_evidence: freeze(
      evidence.map((entry) => freeze({ ...entry })),
    ),
  });
}

function receiptByEvidenceId(
  receipts: readonly NormalizedWhyMoveSecEdgarEvidenceReceipt[],
): ReadonlyMap<string, NormalizedWhyMoveSecEdgarEvidenceReceipt> {
  return new Map(receipts.map((receipt) => [receipt.evidence_id, receipt]));
}

function contentByEvidenceId(
  contents: readonly NormalizedWhyMoveSecEdgarFilingContent[],
): ReadonlyMap<string, NormalizedWhyMoveSecEdgarFilingContent> {
  return new Map(contents.map((content) => [content.evidence_id, content]));
}

/**
 * Verifies a caller-supplied SEC retrieval capsule against CAT-00.2 and
 * CAT-00.3. It has no network, credential, persistence, runtime, or product
 * side effect and does not execute an HTTP request.
 */
export async function validateWhyMoveSecEdgarRetrievalEvidence(
  input: unknown,
): Promise<WhyMoveSecEdgarRetrievalEvidenceResult> {
  if (!hasExactlyDataKeys(input, INPUT_KEYS)) {
    return result("invalid_input", ["invalid_retrieval_shape"]);
  }

  const receiptResult = validateWhyMoveSecEdgarEvidenceReceipts(
    input.receipt_bundle,
  );
  if (
    receiptResult.disposition !==
    "sec_edgar_receipts_validated_not_admitted"
  ) {
    return result("not_admitted_receipt_unvalidated");
  }

  const retrievalValues = readDataArray(input.retrieval_evidence);
  if (retrievalValues === null) {
    return result("invalid_input", ["missing_or_invalid_scalar"]);
  }
  if (retrievalValues.length === 0) {
    return result("not_admitted_missing_retrieval_evidence");
  }

  const entries: RetrievalEvidenceEntry[] = [];
  const shapeReasons: WhyMoveSecEdgarRetrievalEvidenceReason[] = [];
  for (const value of retrievalValues) {
    if (!hasExactlyDataKeys(value, RETRIEVAL_EVIDENCE_KEYS)) {
      shapeReasons.push("accessor_or_non_plain_input");
      continue;
    }

    const evidenceId = readString(value, "evidence_id");
    const requestUrl = readString(value, "request_url");
    const responseUrl = readString(value, "response_url");
    const requestMethod = readString(value, "request_method");
    const redirectMode = readString(value, "redirect_mode");
    const credentialsMode = readString(value, "credentials_mode");
    const retrievedAt = readString(value, "retrieved_at");
    const contentType = readString(value, "content_type");
    const contentText = readString(value, "content_text");
    const httpStatus = readStatus(value);
    if (
      !evidenceId ||
      !requestUrl ||
      !responseUrl ||
      !requestMethod ||
      !redirectMode ||
      !credentialsMode ||
      !retrievedAt ||
      !contentType ||
      !contentText ||
      httpStatus === null
    ) {
      shapeReasons.push("missing_or_invalid_scalar");
      continue;
    }

    entries.push(
      freeze({
        evidenceId,
        requestUrl,
        responseUrl,
        requestMethod,
        redirectMode,
        credentialsMode,
        retrievedAt,
        httpStatus,
        mediaType: normalizeMediaType(contentType),
        contentText,
      }),
    );
  }
  if (shapeReasons.length > 0 || entries.length !== retrievalValues.length) {
    return result("invalid_input", shapeReasons);
  }

  const evidenceIds = entries.map((entry) => entry.evidenceId);
  if (new Set(evidenceIds).size !== evidenceIds.length) {
    return result("invalid_input", ["duplicate_retrieval_evidence_id"]);
  }

  const receipts = receiptByEvidenceId(receiptResult.validated_receipts);
  if (entries.some((entry) => !receipts.has(entry.evidenceId))) {
    return result("not_admitted_unexpected_retrieval_evidence");
  }
  if (entries.length !== receipts.size) {
    return result("not_admitted_missing_retrieval_evidence");
  }

  const boundaryReasons: WhyMoveSecEdgarRetrievalEvidenceReason[] = [];
  for (const entry of entries) {
    const receipt = receipts.get(entry.evidenceId)!;
    if (entry.requestUrl !== receipt.archive_url) {
      boundaryReasons.push("request_url_mismatch");
    }
    if (entry.responseUrl !== receipt.archive_url) {
      boundaryReasons.push("response_url_mismatch");
    }
    if (entry.retrievedAt !== receipt.retrieved_at) {
      boundaryReasons.push("retrieved_at_mismatch");
    }
    if (
      entry.requestMethod !== "GET" ||
      entry.redirectMode !== "error" ||
      entry.credentialsMode !== "omit"
    ) {
      boundaryReasons.push("unsafe_request_policy");
    }
    if (entry.httpStatus !== 200) {
      boundaryReasons.push("unsupported_http_response");
    }
    if (entry.mediaType === null) {
      boundaryReasons.push("unsupported_content_type");
    }
  }
  if (boundaryReasons.length > 0) {
    return result("invalid_input", boundaryReasons);
  }

  const filingResult = await validateWhyMoveSecEdgarFilingContent({
    receipt_bundle: input.receipt_bundle,
    filing_contents: entries.map((entry) => ({
      evidence_id: entry.evidenceId,
      content_text: entry.contentText,
    })),
  });
  if (
    filingResult.disposition !==
    "sec_edgar_filing_content_validated_not_admitted"
  ) {
    return result(
      "invalid_input",
      filingResult.reasons as WhyMoveSecEdgarRetrievalEvidenceReason[],
    );
  }

  const contents = contentByEvidenceId(filingResult.validated_filing_contents);
  return result(
    "sec_edgar_retrieval_evidence_validated_not_admitted",
    [],
    entries.map((entry) => {
      const receipt = receipts.get(entry.evidenceId)!;
      const content = contents.get(entry.evidenceId)!;
      return freeze({
        evidence_id: entry.evidenceId,
        archive_url: receipt.archive_url,
        retrieved_at: receipt.retrieved_at,
        http_status: 200 as const,
        media_type: "text/html" as const,
        content_sha256: content.content_sha256,
        utf8_byte_length: content.utf8_byte_length,
      });
    }),
  );
}
