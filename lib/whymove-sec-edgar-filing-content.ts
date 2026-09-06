import {
  validateWhyMoveSecEdgarEvidenceReceipts,
  type NormalizedWhyMoveSecEdgarEvidenceReceipt,
} from "./whymove-sec-edgar-evidence-receipt";

export const WHY_MOVE_SEC_EDGAR_FILING_CONTENT_VERSION =
  "whymove_sec_edgar_filing_content_v1" as const;

export type WhyMoveSecEdgarFilingContentDisposition =
  | "invalid_input"
  | "not_admitted_receipt_unvalidated"
  | "not_admitted_missing_filing_content"
  | "not_admitted_unexpected_filing_content"
  | "sec_edgar_filing_content_validated_not_admitted";

export type WhyMoveSecEdgarFilingContentReason =
  | "accessor_or_non_plain_input"
  | "content_sha256_mismatch"
  | "content_too_large"
  | "duplicate_filing_content_evidence_id"
  | "invalid_content_shape"
  | "missing_or_invalid_scalar"
  | "sha256_unavailable";

export type NormalizedWhyMoveSecEdgarFilingContent = Readonly<{
  evidence_id: string;
  content_sha256: string;
  utf8_byte_length: number;
}>;

export type WhyMoveSecEdgarFilingContentResult = Readonly<{
  version: typeof WHY_MOVE_SEC_EDGAR_FILING_CONTENT_VERSION;
  disposition: WhyMoveSecEdgarFilingContentDisposition;
  reasons: readonly WhyMoveSecEdgarFilingContentReason[];
  validated_filing_contents: readonly NormalizedWhyMoveSecEdgarFilingContent[];
}>;

const INPUT_KEYS = ["receipt_bundle", "filing_contents"] as const;
const FILING_CONTENT_KEYS = ["evidence_id", "content_text"] as const;
const MAX_UTF8_BYTES = 1_048_576;

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

function result(
  disposition: WhyMoveSecEdgarFilingContentDisposition,
  reasons: readonly WhyMoveSecEdgarFilingContentReason[] = [],
  contents: readonly NormalizedWhyMoveSecEdgarFilingContent[] = [],
): WhyMoveSecEdgarFilingContentResult {
  return freeze({
    version: WHY_MOVE_SEC_EDGAR_FILING_CONTENT_VERSION,
    disposition,
    reasons: freeze(
      [...new Set(reasons)].sort() as WhyMoveSecEdgarFilingContentReason[],
    ),
    validated_filing_contents: freeze(contents.map((content) => freeze({ ...content }))),
  });
}

function hexDigest(value: ArrayBuffer): string {
  return [...new Uint8Array(value)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function sha256Utf8(
  content: string,
): Promise<Readonly<{ digest: string; byteLength: number }> | null> {
  const encoded = new TextEncoder().encode(content);
  if (encoded.byteLength > MAX_UTF8_BYTES) return null;

  const subtle = globalThis.crypto?.subtle;
  if (!subtle) return null;
  const digest = await subtle.digest("SHA-256", encoded);
  return freeze({ digest: hexDigest(digest), byteLength: encoded.byteLength });
}

function receiptByEvidenceId(
  receipts: readonly NormalizedWhyMoveSecEdgarEvidenceReceipt[],
): ReadonlyMap<string, NormalizedWhyMoveSecEdgarEvidenceReceipt> {
  return new Map(receipts.map((receipt) => [receipt.evidence_id, receipt]));
}

/**
 * Validates caller-supplied filing text against an already validated CAT-00.2
 * receipt. It performs no network, persistence, runtime, or product action.
 */
export async function validateWhyMoveSecEdgarFilingContent(
  input: unknown,
): Promise<WhyMoveSecEdgarFilingContentResult> {
  if (!hasExactlyDataKeys(input, INPUT_KEYS)) {
    return result("invalid_input", ["invalid_content_shape"]);
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

  const contentValues = readDataArray(input.filing_contents);
  if (contentValues === null) {
    return result("invalid_input", ["missing_or_invalid_scalar"]);
  }
  if (contentValues.length === 0) {
    return result("not_admitted_missing_filing_content");
  }

  const entries: Array<Readonly<{ evidenceId: string; contentText: string }>> = [];
  const reasons: WhyMoveSecEdgarFilingContentReason[] = [];
  for (const value of contentValues) {
    if (!hasExactlyDataKeys(value, FILING_CONTENT_KEYS)) {
      reasons.push("accessor_or_non_plain_input");
      continue;
    }
    const evidenceId = readString(value, "evidence_id");
    const contentText = readString(value, "content_text");
    if (!evidenceId || !contentText) {
      reasons.push("missing_or_invalid_scalar");
      continue;
    }
    entries.push(freeze({ evidenceId, contentText }));
  }
  if (reasons.length > 0 || entries.length !== contentValues.length) {
    return result("invalid_input", reasons);
  }

  const evidenceIds = entries.map((entry) => entry.evidenceId);
  if (new Set(evidenceIds).size !== evidenceIds.length) {
    return result("invalid_input", ["duplicate_filing_content_evidence_id"]);
  }

  const receipts = receiptByEvidenceId(receiptResult.validated_receipts);
  if (entries.some((entry) => !receipts.has(entry.evidenceId))) {
    return result("not_admitted_unexpected_filing_content");
  }
  if (entries.length !== receipts.size) {
    return result("not_admitted_missing_filing_content");
  }

  const normalized: NormalizedWhyMoveSecEdgarFilingContent[] = [];
  for (const entry of entries) {
    const hashed = await sha256Utf8(entry.contentText);
    if (hashed === null) {
      const tooLarge = new TextEncoder().encode(entry.contentText).byteLength > MAX_UTF8_BYTES;
      return result("invalid_input", [tooLarge ? "content_too_large" : "sha256_unavailable"]);
    }
    const receipt = receipts.get(entry.evidenceId);
    if (!receipt || hashed.digest !== receipt.content_sha256) {
      return result("invalid_input", ["content_sha256_mismatch"]);
    }
    normalized.push(
      freeze({
        evidence_id: entry.evidenceId,
        content_sha256: hashed.digest,
        utf8_byte_length: hashed.byteLength,
      }),
    );
  }

  return result("sec_edgar_filing_content_validated_not_admitted", [], normalized);
}
