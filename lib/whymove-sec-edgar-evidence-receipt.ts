import {
  validateWhyMoveEvidenceEnvelope,
  type NormalizedWhyMoveEvidence,
} from "./whymove-evidence-envelope";

export const WHY_MOVE_SEC_EDGAR_EVIDENCE_RECEIPT_VERSION =
  "whymove_sec_edgar_evidence_receipt_v1" as const;

export type WhyMoveSecEdgarEvidenceReceiptDisposition =
  | "invalid_input"
  | "not_admitted_envelope_unvalidated"
  | "not_admitted_unsupported_primary_source"
  | "not_admitted_missing_sec_edgar_receipt"
  | "not_admitted_unexpected_receipt"
  | "not_admitted_not_point_in_time_safe"
  | "sec_edgar_receipts_validated_not_admitted";

export type WhyMoveSecEdgarEvidenceReceiptReason =
  | "accessor_or_non_plain_input"
  | "duplicate_receipt_evidence_id"
  | "invalid_archive_locator"
  | "invalid_receipt_shape"
  | "invalid_sha256"
  | "invalid_timestamp"
  | "missing_or_invalid_scalar"
  | "receipt_accession_locator_mismatch"
  | "receipt_before_publication"
  | "receipt_not_available_at_decision"
  | "unsupported_primary_evidence_source";

export type NormalizedWhyMoveSecEdgarEvidenceReceipt = Readonly<{
  evidence_id: string;
  source_id: "sec_edgar";
  accession_number: string;
  archive_url: string;
  content_sha256: string;
  published_at: string;
  retrieved_at: string;
  available_at_decision: boolean;
}>;

export type WhyMoveSecEdgarEvidenceReceiptResult = Readonly<{
  version: typeof WHY_MOVE_SEC_EDGAR_EVIDENCE_RECEIPT_VERSION;
  disposition: WhyMoveSecEdgarEvidenceReceiptDisposition;
  reasons: readonly WhyMoveSecEdgarEvidenceReceiptReason[];
  validated_receipts: readonly NormalizedWhyMoveSecEdgarEvidenceReceipt[];
}>;

const INPUT_KEYS = ["envelope", "primary_receipts"] as const;
const RECEIPT_KEYS = [
  "evidence_id",
  "source_id",
  "accession_number",
  "archive_url",
  "content_sha256",
  "published_at",
  "retrieved_at",
  "available_at_decision",
] as const;
const ACCESSION_NUMBER = /^\d{10}-\d{2}-\d{6}$/;
const LOWERCASE_SHA256 = /^[a-f0-9]{64}$/;
const SEC_ARCHIVE_PATH = /^\/Archives\/edgar\/data\/(\d+)\/(\d+)\/[^/]+$/;

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

function readBoolean(record: PlainDataRecord, key: string): boolean | null {
  const value = record[key];
  return typeof value === "boolean" ? value : null;
}

function isExactUtcInstant(value: string): boolean {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString() === value;
}

function result(
  disposition: WhyMoveSecEdgarEvidenceReceiptDisposition,
  reasons: readonly WhyMoveSecEdgarEvidenceReceiptReason[] = [],
  receipts: readonly NormalizedWhyMoveSecEdgarEvidenceReceipt[] = [],
): WhyMoveSecEdgarEvidenceReceiptResult {
  return freeze({
    version: WHY_MOVE_SEC_EDGAR_EVIDENCE_RECEIPT_VERSION,
    disposition,
    reasons: freeze(
      [...new Set(reasons)].sort() as WhyMoveSecEdgarEvidenceReceiptReason[],
    ),
    validated_receipts: freeze(receipts.map((receipt) => freeze({ ...receipt }))),
  });
}

function normalizeReceipt(value: unknown):
  | Readonly<{ receipt: NormalizedWhyMoveSecEdgarEvidenceReceipt }>
  | Readonly<{ reason: WhyMoveSecEdgarEvidenceReceiptReason }> {
  if (!hasExactlyDataKeys(value, RECEIPT_KEYS)) {
    return { reason: "accessor_or_non_plain_input" };
  }

  const evidenceId = readString(value, "evidence_id");
  const sourceId = readString(value, "source_id");
  const accessionNumber = readString(value, "accession_number");
  const archiveUrl = readString(value, "archive_url");
  const contentSha256 = readString(value, "content_sha256");
  const publishedAt = readString(value, "published_at");
  const retrievedAt = readString(value, "retrieved_at");
  const availableAtDecision = readBoolean(value, "available_at_decision");

  if (
    !evidenceId ||
    !sourceId ||
    !accessionNumber ||
    !archiveUrl ||
    !contentSha256 ||
    !publishedAt ||
    !retrievedAt ||
    availableAtDecision === null
  ) {
    return { reason: "missing_or_invalid_scalar" };
  }
  if (sourceId !== "sec_edgar") return { reason: "unsupported_primary_evidence_source" };
  if (!ACCESSION_NUMBER.test(accessionNumber)) {
    return { reason: "invalid_archive_locator" };
  }
  if (!LOWERCASE_SHA256.test(contentSha256)) return { reason: "invalid_sha256" };
  if (!isExactUtcInstant(publishedAt) || !isExactUtcInstant(retrievedAt)) {
    return { reason: "invalid_timestamp" };
  }

  let locator: URL;
  try {
    locator = new URL(archiveUrl);
  } catch {
    return { reason: "invalid_archive_locator" };
  }
  const pathMatch = SEC_ARCHIVE_PATH.exec(locator.pathname);
  if (
    locator.protocol !== "https:" ||
    locator.hostname !== "www.sec.gov" ||
    locator.username !== "" ||
    locator.password !== "" ||
    locator.port !== "" ||
    locator.search !== "" ||
    locator.hash !== "" ||
    pathMatch === null
  ) {
    return { reason: "invalid_archive_locator" };
  }
  if (pathMatch[2] !== accessionNumber.replaceAll("-", "")) {
    return { reason: "receipt_accession_locator_mismatch" };
  }
  if (Date.parse(retrievedAt) < Date.parse(publishedAt)) {
    return { reason: "receipt_before_publication" };
  }

  return {
    receipt: freeze({
      evidence_id: evidenceId,
      source_id: "sec_edgar",
      accession_number: accessionNumber,
      archive_url: archiveUrl,
      content_sha256: contentSha256,
      published_at: publishedAt,
      retrieved_at: retrievedAt,
      available_at_decision: availableAtDecision,
    }),
  };
}

function primaryEvidenceIds(
  evidence: readonly NormalizedWhyMoveEvidence[],
): ReadonlySet<string> {
  return new Set(
    evidence
      .filter((item) => item.source_role === "primary_evidence")
      .map((item) => item.evidence_id),
  );
}

/**
 * Validates caller-supplied SEC archive receipt metadata only. It has no
 * network, credential, persistence, runtime, or recommendation side effect.
 */
export function validateWhyMoveSecEdgarEvidenceReceipts(
  input: unknown,
): WhyMoveSecEdgarEvidenceReceiptResult {
  if (!hasExactlyDataKeys(input, INPUT_KEYS)) {
    return result("invalid_input", ["invalid_receipt_shape"]);
  }

  const envelope = validateWhyMoveEvidenceEnvelope(input.envelope);
  if (envelope.disposition !== "evidence_validated_not_admitted") {
    return result("not_admitted_envelope_unvalidated");
  }

  const primary = envelope.normalized_evidence.filter(
    (item) => item.source_role === "primary_evidence",
  );
  if (primary.some((item) => item.source_id !== "sec_edgar")) {
    return result("not_admitted_unsupported_primary_source", [
      "unsupported_primary_evidence_source",
    ]);
  }

  const receiptValues = readDataArray(input.primary_receipts);
  if (receiptValues === null) {
    return result("invalid_input", ["missing_or_invalid_scalar"]);
  }
  if (receiptValues.length === 0) {
    return result("not_admitted_missing_sec_edgar_receipt");
  }

  const receipts: NormalizedWhyMoveSecEdgarEvidenceReceipt[] = [];
  const reasons: WhyMoveSecEdgarEvidenceReceiptReason[] = [];
  for (const value of receiptValues) {
    const normalized = normalizeReceipt(value);
    if ("reason" in normalized) reasons.push(normalized.reason);
    else receipts.push(normalized.receipt);
  }
  if (reasons.length > 0 || receipts.length !== receiptValues.length) {
    return result("invalid_input", reasons);
  }

  const receiptIds = receipts.map((receipt) => receipt.evidence_id);
  if (new Set(receiptIds).size !== receiptIds.length) {
    return result("invalid_input", ["duplicate_receipt_evidence_id"], receipts);
  }

  const expectedIds = primaryEvidenceIds(envelope.normalized_evidence);
  if (receipts.some((receipt) => !expectedIds.has(receipt.evidence_id))) {
    return result("not_admitted_unexpected_receipt", [], receipts);
  }
  if (expectedIds.size !== receipts.length) {
    return result("not_admitted_missing_sec_edgar_receipt", [], receipts);
  }

  const envelopeInput = input.envelope;
  const envelopeDecisionAt = hasExactlyDataKeys(envelopeInput, [
    "envelope_id",
    "decision_snapshot_id",
    "decision_at",
    "evidence",
  ])
    ? readString(envelopeInput, "decision_at")
    : null;
  if (envelopeDecisionAt === null) {
    return result("invalid_input", ["missing_or_invalid_scalar"]);
  }
  const decisionTimestamp = Date.parse(envelopeDecisionAt);
  if (
    !Number.isFinite(decisionTimestamp) ||
    receipts.some(
      (receipt) =>
        !receipt.available_at_decision ||
        Date.parse(receipt.published_at) > decisionTimestamp ||
        Date.parse(receipt.retrieved_at) > decisionTimestamp,
    )
  ) {
    return result("not_admitted_not_point_in_time_safe", [
      "receipt_not_available_at_decision",
    ], receipts);
  }

  return result("sec_edgar_receipts_validated_not_admitted", [], receipts);
}
