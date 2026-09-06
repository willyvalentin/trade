import { readFileSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

import {
  WHY_MOVE_SEC_EDGAR_EVIDENCE_RECEIPT_VERSION,
  validateWhyMoveSecEdgarEvidenceReceipts,
} from "../../lib/whymove-sec-edgar-evidence-receipt";

const modulePath = join(process.cwd(), "lib/whymove-sec-edgar-evidence-receipt.ts");
const docPath = join(process.cwd(), "docs/cat-00.2-sec-edgar-evidence-receipt-contract.md");

function validEnvelope(overrides: Record<string, unknown> = {}) {
  return {
    envelope_id: "whymove:fixture:edgar:001",
    decision_snapshot_id: "decision:snapshot:edgar:001",
    decision_at: "2026-09-06T05:00:00.000Z",
    evidence: [
      {
        evidence_id: "lead:001",
        source_role: "discovery_lead",
        source_id: "massive_news",
        captured_at: "2026-09-06T04:54:00.000Z",
        effective_at: "2026-09-06T04:53:00.000Z",
        available_at_decision: true,
        direction: "positive",
        primary_evidence_ids: ["primary:edgar:001"],
      },
      {
        evidence_id: "primary:edgar:001",
        source_role: "primary_evidence",
        source_id: "sec_edgar",
        captured_at: "2026-09-06T04:55:00.000Z",
        effective_at: "2026-09-06T04:52:00.000Z",
        available_at_decision: true,
        direction: "positive",
        primary_evidence_ids: [],
      },
    ],
    ...overrides,
  };
}

function validReceipt(overrides: Record<string, unknown> = {}) {
  return {
    evidence_id: "primary:edgar:001",
    source_id: "sec_edgar",
    accession_number: "0000320193-24-000123",
    archive_url:
      "https://www.sec.gov/Archives/edgar/data/320193/000032019324000123/form10k.htm",
    content_sha256: "a".repeat(64),
    published_at: "2026-09-06T04:50:00.000Z",
    retrieved_at: "2026-09-06T04:56:00.000Z",
    available_at_decision: true,
    ...overrides,
  };
}

function validBundle(overrides: Record<string, unknown> = {}) {
  return {
    envelope: validEnvelope(),
    primary_receipts: [validReceipt()],
    ...overrides,
  };
}

test("CAT-00.2 binds one SEC receipt to a valid WhyMove envelope without admission", () => {
  const first = validateWhyMoveSecEdgarEvidenceReceipts(validBundle());
  const second = validateWhyMoveSecEdgarEvidenceReceipts(validBundle());

  expect(first).toEqual(second);
  expect(first).toEqual({
    version: WHY_MOVE_SEC_EDGAR_EVIDENCE_RECEIPT_VERSION,
    disposition: "sec_edgar_receipts_validated_not_admitted",
    reasons: [],
    validated_receipts: [
      expect.objectContaining({
        evidence_id: "primary:edgar:001",
        source_id: "sec_edgar",
        accession_number: "0000320193-24-000123",
      }),
    ],
  });
  expect(Object.isFrozen(first)).toBe(true);
  expect(Object.isFrozen(first.reasons)).toBe(true);
  expect(Object.isFrozen(first.validated_receipts)).toBe(true);
  expect(Object.isFrozen(first.validated_receipts[0])).toBe(true);
});

test("CAT-00.2 fails closed for a non-admitted envelope or another primary source", () => {
  const unpaired = validEnvelope({
    evidence: [
      { ...validEnvelope().evidence[0], primary_evidence_ids: ["missing"] },
      validEnvelope().evidence[1],
    ],
  });
  const issuerPrimary = validEnvelope({
    evidence: [
      validEnvelope().evidence[0],
      {
        ...validEnvelope().evidence[1],
        source_id: "issuer_press_release",
      },
    ],
  });

  expect(
    validateWhyMoveSecEdgarEvidenceReceipts(validBundle({ envelope: unpaired })),
  ).toMatchObject({ disposition: "not_admitted_envelope_unvalidated" });
  expect(
    validateWhyMoveSecEdgarEvidenceReceipts(validBundle({ envelope: issuerPrimary })),
  ).toMatchObject({
    disposition: "not_admitted_unsupported_primary_source",
    reasons: ["unsupported_primary_evidence_source"],
  });
});

test("CAT-00.2 rejects malformed, duplicate, unexpected, and incomplete receipt bindings", () => {
  const malformed = validReceipt({ content_sha256: "A".repeat(64) });
  const duplicate = validBundle({ primary_receipts: [validReceipt(), validReceipt()] });
  const unexpected = validReceipt({ evidence_id: "primary:unknown" });
  const missing = validBundle({ primary_receipts: [] });

  expect(
    validateWhyMoveSecEdgarEvidenceReceipts(validBundle({ primary_receipts: [malformed] })),
  ).toMatchObject({ disposition: "invalid_input", reasons: ["invalid_sha256"] });
  expect(validateWhyMoveSecEdgarEvidenceReceipts(duplicate)).toMatchObject({
    disposition: "invalid_input",
    reasons: ["duplicate_receipt_evidence_id"],
  });
  expect(
    validateWhyMoveSecEdgarEvidenceReceipts(validBundle({ primary_receipts: [unexpected] })),
  ).toMatchObject({ disposition: "not_admitted_unexpected_receipt" });
  expect(validateWhyMoveSecEdgarEvidenceReceipts(missing)).toMatchObject({
    disposition: "not_admitted_missing_sec_edgar_receipt",
    reasons: [],
  });
});

test("CAT-00.2 rejects mismatched locators, future receipts, and hostile accessors without invoking them", () => {
  const mismatched = validReceipt({
    archive_url:
      "https://www.sec.gov/Archives/edgar/data/320193/000032019324000124/form10k.htm",
  });
  const future = validReceipt({ retrieved_at: "2026-09-06T05:00:01.000Z" });
  let getterReads = 0;
  const hostile = validReceipt() as Record<string, unknown>;
  Object.defineProperty(hostile, "content_sha256", {
    enumerable: true,
    get() {
      getterReads += 1;
      return "a".repeat(64);
    },
  });

  expect(
    validateWhyMoveSecEdgarEvidenceReceipts(validBundle({ primary_receipts: [mismatched] })),
  ).toMatchObject({
    disposition: "invalid_input",
    reasons: ["receipt_accession_locator_mismatch"],
  });
  expect(
    validateWhyMoveSecEdgarEvidenceReceipts(validBundle({ primary_receipts: [future] })),
  ).toMatchObject({
    disposition: "not_admitted_not_point_in_time_safe",
    reasons: ["receipt_not_available_at_decision"],
  });
  expect(
    validateWhyMoveSecEdgarEvidenceReceipts(validBundle({ primary_receipts: [hostile] })),
  ).toMatchObject({
    disposition: "invalid_input",
    reasons: ["accessor_or_non_plain_input"],
  });
  expect(getterReads).toBe(0);
});

test("CAT-00.2 remains a local receipt validator rather than an external adapter", () => {
  const source = readFileSync(modulePath, "utf8");
  const doc = readFileSync(docPath, "utf8");

  for (const forbidden of [
    "fetch(",
    "process.env",
    "createClient",
    "supabase",
    "openai",
    "netlify",
    "broker",
    "axios",
  ]) {
    expect(source.toLowerCase()).not.toContain(forbidden.toLowerCase());
  }
  expect(doc).toContain("There is no network or provider call");
  expect(doc).toContain("does not reopen a\nMilestone B gate");
});
