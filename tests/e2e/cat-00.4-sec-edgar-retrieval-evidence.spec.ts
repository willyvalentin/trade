import { readFileSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

import {
  WHY_MOVE_SEC_EDGAR_RETRIEVAL_EVIDENCE_VERSION,
  validateWhyMoveSecEdgarRetrievalEvidence,
} from "../../lib/whymove-sec-edgar-retrieval-evidence";

const modulePath = join(process.cwd(), "lib/whymove-sec-edgar-retrieval-evidence.ts");
const docPath = join(process.cwd(), "docs/cat-00.4-sec-edgar-retrieval-evidence-contract.md");
const FILING_TEXT = "SEC filing fixture: Form 10-K";
const FILING_SHA256 = "fd04924ad5b8b316d4af9d19ebb2db13fdd0c1d34c41c7ca795e364fa6161193";
const ARCHIVE_URL = "https://www.sec.gov/Archives/edgar/data/320193/000032019324000123/form10k.htm";
const RETRIEVED_AT = "2026-09-06T04:56:00.000Z";

function validEnvelope(overrides: Record<string, unknown> = {}) {
  return {
    envelope_id: "whymove:fixture:edgar:004",
    decision_snapshot_id: "decision:snapshot:edgar:004",
    decision_at: "2026-09-06T05:00:00.000Z",
    evidence: [
      {
        evidence_id: "lead:004",
        source_role: "discovery_lead",
        source_id: "massive_news",
        captured_at: "2026-09-06T04:54:00.000Z",
        effective_at: "2026-09-06T04:53:00.000Z",
        available_at_decision: true,
        direction: "positive",
        primary_evidence_ids: ["primary:edgar:004"],
      },
      {
        evidence_id: "primary:edgar:004",
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
    evidence_id: "primary:edgar:004",
    source_id: "sec_edgar",
    accession_number: "0000320193-24-000123",
    archive_url: ARCHIVE_URL,
    content_sha256: FILING_SHA256,
    published_at: "2026-09-06T04:50:00.000Z",
    retrieved_at: RETRIEVED_AT,
    available_at_decision: true,
    ...overrides,
  };
}

function validRetrieval(overrides: Record<string, unknown> = {}) {
  return {
    evidence_id: "primary:edgar:004",
    request_url: ARCHIVE_URL,
    response_url: ARCHIVE_URL,
    request_method: "GET",
    redirect_mode: "error",
    credentials_mode: "omit",
    retrieved_at: RETRIEVED_AT,
    http_status: 200,
    content_type: "text/html; charset=UTF-8",
    content_text: FILING_TEXT,
    ...overrides,
  };
}

function validInput(overrides: Record<string, unknown> = {}) {
  return {
    receipt_bundle: {
      envelope: validEnvelope(),
      primary_receipts: [validReceipt()],
    },
    retrieval_evidence: [validRetrieval()],
    ...overrides,
  };
}

test("CAT-00.4 binds a supplied safe HTTP capsule to the verified receipt and filing content", async () => {
  const first = await validateWhyMoveSecEdgarRetrievalEvidence(validInput());
  const second = await validateWhyMoveSecEdgarRetrievalEvidence(validInput());

  expect(first).toEqual(second);
  expect(first).toEqual({
    version: WHY_MOVE_SEC_EDGAR_RETRIEVAL_EVIDENCE_VERSION,
    disposition: "sec_edgar_retrieval_evidence_validated_not_admitted",
    reasons: [],
    validated_retrieval_evidence: [
      {
        evidence_id: "primary:edgar:004",
        archive_url: ARCHIVE_URL,
        retrieved_at: RETRIEVED_AT,
        http_status: 200,
        media_type: "text/html",
        content_sha256: FILING_SHA256,
        utf8_byte_length: FILING_TEXT.length,
      },
    ],
  });
  expect(Object.isFrozen(first)).toBe(true);
  expect(Object.isFrozen(first.reasons)).toBe(true);
  expect(Object.isFrozen(first.validated_retrieval_evidence)).toBe(true);
  expect(Object.isFrozen(first.validated_retrieval_evidence[0])).toBe(true);
});

test("CAT-00.4 fails closed for unvalidated, missing, unexpected, duplicate, and content-mismatched evidence", async () => {
  const unvalidated = validInput({
    receipt_bundle: {
      envelope: validEnvelope({ evidence: [] }),
      primary_receipts: [validReceipt()],
    },
  });
  const unexpected = validInput({
    retrieval_evidence: [validRetrieval({ evidence_id: "primary:unknown" })],
  });
  const duplicate = validInput({
    retrieval_evidence: [validRetrieval(), validRetrieval()],
  });

  await expect(validateWhyMoveSecEdgarRetrievalEvidence(unvalidated)).resolves.toMatchObject({
    disposition: "not_admitted_receipt_unvalidated",
  });
  await expect(
    validateWhyMoveSecEdgarRetrievalEvidence(validInput({ retrieval_evidence: [] })),
  ).resolves.toMatchObject({ disposition: "not_admitted_missing_retrieval_evidence" });
  await expect(validateWhyMoveSecEdgarRetrievalEvidence(unexpected)).resolves.toMatchObject({
    disposition: "not_admitted_unexpected_retrieval_evidence",
  });
  await expect(validateWhyMoveSecEdgarRetrievalEvidence(duplicate)).resolves.toMatchObject({
    disposition: "invalid_input",
    reasons: ["duplicate_retrieval_evidence_id"],
  });
  await expect(
    validateWhyMoveSecEdgarRetrievalEvidence(
      validInput({ retrieval_evidence: [validRetrieval({ content_text: "altered" })] }),
    ),
  ).resolves.toMatchObject({
    disposition: "invalid_input",
    reasons: ["content_sha256_mismatch"],
  });
});

test("CAT-00.4 rejects unsafe request policy, response mismatches, and non-HTML responses", async () => {
  const unsafe = validInput({
    retrieval_evidence: [
      validRetrieval({
        request_method: "POST",
        redirect_mode: "follow",
        credentials_mode: "include",
        response_url: "https://www.sec.gov/Archives/edgar/data/320193/000032019324000123/redirect.htm",
        retrieved_at: "2026-09-06T04:57:00.000Z",
        http_status: 302,
        content_type: "application/json",
      }),
    ],
  });
  const requestMismatch = validInput({
    retrieval_evidence: [
      validRetrieval({
        request_url: "https://www.sec.gov/Archives/edgar/data/320193/000032019324000123/other.htm",
      }),
    ],
  });

  await expect(validateWhyMoveSecEdgarRetrievalEvidence(unsafe)).resolves.toMatchObject({
    disposition: "invalid_input",
    reasons: [
      "response_url_mismatch",
      "retrieved_at_mismatch",
      "unsafe_request_policy",
      "unsupported_content_type",
      "unsupported_http_response",
    ],
  });
  await expect(validateWhyMoveSecEdgarRetrievalEvidence(requestMismatch)).resolves.toMatchObject({
    disposition: "invalid_input",
    reasons: ["request_url_mismatch"],
  });
});

test("CAT-00.4 rejects accessor-backed and oversized content without reading hostile getters", async () => {
  let getterReads = 0;
  const hostile = validRetrieval() as Record<string, unknown>;
  Object.defineProperty(hostile, "content_text", {
    enumerable: true,
    get() {
      getterReads += 1;
      return FILING_TEXT;
    },
  });

  await expect(
    validateWhyMoveSecEdgarRetrievalEvidence(validInput({ retrieval_evidence: [hostile] })),
  ).resolves.toMatchObject({
    disposition: "invalid_input",
    reasons: ["accessor_or_non_plain_input"],
  });
  expect(getterReads).toBe(0);
  await expect(
    validateWhyMoveSecEdgarRetrievalEvidence(
      validInput({
        retrieval_evidence: [validRetrieval({ content_text: "x".repeat(1_048_577) })],
      }),
    ),
  ).resolves.toMatchObject({
    disposition: "invalid_input",
    reasons: ["content_too_large"],
  });
});

test("CAT-00.4 remains a local response-evidence verifier rather than an SEC client", () => {
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
  expect(doc).toContain("pre-authorized, machine-verifiable operational policy");
});
