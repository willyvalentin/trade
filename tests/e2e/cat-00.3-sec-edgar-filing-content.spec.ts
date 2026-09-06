import { readFileSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

import {
  WHY_MOVE_SEC_EDGAR_FILING_CONTENT_VERSION,
  validateWhyMoveSecEdgarFilingContent,
} from "../../lib/whymove-sec-edgar-filing-content";

const modulePath = join(process.cwd(), "lib/whymove-sec-edgar-filing-content.ts");
const docPath = join(process.cwd(), "docs/cat-00.3-sec-edgar-filing-content-contract.md");
const FILING_TEXT = "SEC filing fixture: Form 10-K";
const FILING_SHA256 = "fd04924ad5b8b316d4af9d19ebb2db13fdd0c1d34c41c7ca795e364fa6161193";

function validEnvelope(overrides: Record<string, unknown> = {}) {
  return {
    envelope_id: "whymove:fixture:edgar:003",
    decision_snapshot_id: "decision:snapshot:edgar:003",
    decision_at: "2026-09-06T05:00:00.000Z",
    evidence: [
      {
        evidence_id: "lead:003",
        source_role: "discovery_lead",
        source_id: "massive_news",
        captured_at: "2026-09-06T04:54:00.000Z",
        effective_at: "2026-09-06T04:53:00.000Z",
        available_at_decision: true,
        direction: "positive",
        primary_evidence_ids: ["primary:edgar:003"],
      },
      {
        evidence_id: "primary:edgar:003",
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
    evidence_id: "primary:edgar:003",
    source_id: "sec_edgar",
    accession_number: "0000320193-24-000123",
    archive_url:
      "https://www.sec.gov/Archives/edgar/data/320193/000032019324000123/form10k.htm",
    content_sha256: FILING_SHA256,
    published_at: "2026-09-06T04:50:00.000Z",
    retrieved_at: "2026-09-06T04:56:00.000Z",
    available_at_decision: true,
    ...overrides,
  };
}

function validInput(overrides: Record<string, unknown> = {}) {
  return {
    receipt_bundle: {
      envelope: validEnvelope(),
      primary_receipts: [validReceipt()],
    },
    filing_contents: [
      { evidence_id: "primary:edgar:003", content_text: FILING_TEXT },
    ],
    ...overrides,
  };
}

test("CAT-00.3 binds supplied filing text to a validated SEC EDGAR receipt without admission", async () => {
  const first = await validateWhyMoveSecEdgarFilingContent(validInput());
  const second = await validateWhyMoveSecEdgarFilingContent(validInput());

  expect(first).toEqual(second);
  expect(first).toEqual({
    version: WHY_MOVE_SEC_EDGAR_FILING_CONTENT_VERSION,
    disposition: "sec_edgar_filing_content_validated_not_admitted",
    reasons: [],
    validated_filing_contents: [
      {
        evidence_id: "primary:edgar:003",
        content_sha256: FILING_SHA256,
        utf8_byte_length: FILING_TEXT.length,
      },
    ],
  });
  expect(Object.isFrozen(first)).toBe(true);
  expect(Object.isFrozen(first.reasons)).toBe(true);
  expect(Object.isFrozen(first.validated_filing_contents)).toBe(true);
  expect(Object.isFrozen(first.validated_filing_contents[0])).toBe(true);
});

test("CAT-00.3 fails closed for unvalidated receipts, missing content, unexpected IDs, duplicates, and digest mismatches", async () => {
  const unvalidated = validInput({
    receipt_bundle: {
      envelope: validEnvelope({ evidence: [] }),
      primary_receipts: [validReceipt()],
    },
  });
  const unexpected = validInput({
    filing_contents: [{ evidence_id: "primary:unknown", content_text: FILING_TEXT }],
  });
  const duplicate = validInput({
    filing_contents: [
      { evidence_id: "primary:edgar:003", content_text: FILING_TEXT },
      { evidence_id: "primary:edgar:003", content_text: FILING_TEXT },
    ],
  });

  await expect(validateWhyMoveSecEdgarFilingContent(unvalidated)).resolves.toMatchObject({
    disposition: "not_admitted_receipt_unvalidated",
  });
  await expect(
    validateWhyMoveSecEdgarFilingContent(validInput({ filing_contents: [] })),
  ).resolves.toMatchObject({ disposition: "not_admitted_missing_filing_content" });
  await expect(validateWhyMoveSecEdgarFilingContent(unexpected)).resolves.toMatchObject({
    disposition: "not_admitted_unexpected_filing_content",
  });
  await expect(validateWhyMoveSecEdgarFilingContent(duplicate)).resolves.toMatchObject({
    disposition: "invalid_input",
    reasons: ["duplicate_filing_content_evidence_id"],
  });
  await expect(
    validateWhyMoveSecEdgarFilingContent(
      validInput({
        filing_contents: [{ evidence_id: "primary:edgar:003", content_text: "altered" }],
      }),
    ),
  ).resolves.toMatchObject({
    disposition: "invalid_input",
    reasons: ["content_sha256_mismatch"],
  });
});

test("CAT-00.3 rejects hostile or oversized inputs without invoking accessors", async () => {
  let getterReads = 0;
  const hostile = { evidence_id: "primary:edgar:003", content_text: FILING_TEXT } as Record<string, unknown>;
  Object.defineProperty(hostile, "content_text", {
    enumerable: true,
    get() {
      getterReads += 1;
      return FILING_TEXT;
    },
  });

  await expect(
    validateWhyMoveSecEdgarFilingContent(validInput({ filing_contents: [hostile] })),
  ).resolves.toMatchObject({
    disposition: "invalid_input",
    reasons: ["accessor_or_non_plain_input"],
  });
  expect(getterReads).toBe(0);
  await expect(
    validateWhyMoveSecEdgarFilingContent(
      validInput({
        filing_contents: [
          { evidence_id: "primary:edgar:003", content_text: "x".repeat(1_048_577) },
        ],
      }),
    ),
  ).resolves.toMatchObject({
    disposition: "invalid_input",
    reasons: ["content_too_large"],
  });
});

test("CAT-00.3 remains a local integrity boundary rather than an external source adapter", () => {
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
  expect(doc).toContain("needs its own product decision");
});
