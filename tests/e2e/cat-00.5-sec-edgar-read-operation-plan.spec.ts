import { readFileSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

import {
  WHY_MOVE_SEC_EDGAR_READ_OPERATION_PLAN_VERSION,
  validateWhyMoveSecEdgarReadOperationPlan,
} from "../../lib/whymove-sec-edgar-read-operation-plan";

const modulePath = join(process.cwd(), "lib/whymove-sec-edgar-read-operation-plan.ts");
const docPath = join(process.cwd(), "docs/cat-00.5-sec-edgar-read-operation-plan-contract.md");
const ARCHIVE_URL = "https://www.sec.gov/Archives/edgar/data/320193/000032019324000123/form10k.htm";
const RETRIEVED_AT = "2026-09-06T04:56:00.000Z";
const FILING_SHA256 = "fd04924ad5b8b316d4af9d19ebb2db13fdd0c1d34c41c7ca795e364fa6161193";

function validEnvelope(overrides: Record<string, unknown> = {}) {
  return {
    envelope_id: "whymove:fixture:edgar:005",
    decision_snapshot_id: "decision:snapshot:edgar:005",
    decision_at: "2026-09-06T05:00:00.000Z",
    evidence: [
      {
        evidence_id: "lead:005",
        source_role: "discovery_lead",
        source_id: "massive_news",
        captured_at: "2026-09-06T04:54:00.000Z",
        effective_at: "2026-09-06T04:53:00.000Z",
        available_at_decision: true,
        direction: "positive",
        primary_evidence_ids: ["primary:edgar:005"],
      },
      {
        evidence_id: "primary:edgar:005",
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
    evidence_id: "primary:edgar:005",
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

function validOperationPlan(overrides: Record<string, unknown> = {}) {
  return {
    operation_id: "sec-edgar-read:005",
    evidence_id: "primary:edgar:005",
    request_url: ARCHIVE_URL,
    request_method: "GET",
    redirect_mode: "error",
    credentials_mode: "omit",
    expected_http_status: 200,
    expected_media_type: "text/html",
    max_response_bytes: 1_048_576,
    response_handling: "validate_only_no_persistence",
    runtime_binding: "none",
    advisory_influence: "none",
    broker_action: "none",
    ci_rehardening_review: "required_before_external_authority",
    execution_status: "not_executed",
    ...overrides,
  };
}

function validInput(overrides: Record<string, unknown> = {}) {
  return {
    receipt_bundle: {
      envelope: validEnvelope(),
      primary_receipts: [validReceipt()],
    },
    operation_plan: validOperationPlan(),
    ...overrides,
  };
}

test("CAT-00.5 accepts exactly one receipt-bound, non-executing SEC read plan", () => {
  const first = validateWhyMoveSecEdgarReadOperationPlan(validInput());
  const second = validateWhyMoveSecEdgarReadOperationPlan(validInput());

  expect(first).toEqual(second);
  expect(first).toMatchObject({
    version: WHY_MOVE_SEC_EDGAR_READ_OPERATION_PLAN_VERSION,
    disposition: "sec_edgar_read_operation_plan_validated_not_executed",
    reasons: [],
  });
  expect(first.validated_operation_plan).toEqual({
    operation_id: "sec-edgar-read:005",
    evidence_id: "primary:edgar:005",
    archive_url: ARCHIVE_URL,
    request_method: "GET",
    redirect_mode: "error",
    credentials_mode: "omit",
    expected_http_status: 200,
    expected_media_type: "text/html",
    max_response_bytes: 1_048_576,
    response_handling: "validate_only_no_persistence",
    runtime_binding: "none",
    advisory_influence: "none",
    broker_action: "none",
    ci_rehardening_review: "required_before_external_authority",
    execution_status: "not_executed",
  });
  expect(Object.isFrozen(first)).toBe(true);
  expect(Object.isFrozen(first.reasons)).toBe(true);
  expect(Object.isFrozen(first.validated_operation_plan)).toBe(true);
});

test("CAT-00.5 rejects unvalidated or non-single receipt input", () => {
  const unvalidated = validInput({
    receipt_bundle: { envelope: validEnvelope({ evidence: [] }), primary_receipts: [validReceipt()] },
  });
  const multipleReceipts = validInput({
    receipt_bundle: {
      envelope: validEnvelope({
        evidence: [
          {
            evidence_id: "lead:005",
            source_role: "discovery_lead",
            source_id: "massive_news",
            captured_at: "2026-09-06T04:54:00.000Z",
            effective_at: "2026-09-06T04:53:00.000Z",
            available_at_decision: true,
            direction: "positive",
            primary_evidence_ids: ["primary:edgar:005", "primary:edgar:006"],
          },
          {
            evidence_id: "primary:edgar:005",
            source_role: "primary_evidence",
            source_id: "sec_edgar",
            captured_at: "2026-09-06T04:55:00.000Z",
            effective_at: "2026-09-06T04:52:00.000Z",
            available_at_decision: true,
            direction: "positive",
            primary_evidence_ids: [],
          },
          {
            evidence_id: "primary:edgar:006",
            source_role: "primary_evidence",
            source_id: "sec_edgar",
            captured_at: "2026-09-06T04:55:00.000Z",
            effective_at: "2026-09-06T04:52:00.000Z",
            available_at_decision: true,
            direction: "positive",
            primary_evidence_ids: [],
          },
        ],
      }),
      primary_receipts: [
        validReceipt(),
        validReceipt({
          evidence_id: "primary:edgar:006",
          accession_number: "0000320193-24-000124",
          archive_url: "https://www.sec.gov/Archives/edgar/data/320193/000032019324000124/form10k.htm",
        }),
      ],
    },
  });

  expect(validateWhyMoveSecEdgarReadOperationPlan(unvalidated)).toMatchObject({
    disposition: "not_admitted_receipt_unvalidated",
  });
  expect(validateWhyMoveSecEdgarReadOperationPlan(multipleReceipts)).toMatchObject({
    disposition: "not_admitted_receipt_count",
  });
});

test("CAT-00.5 fails closed for scope drift and missing CI re-hardening acknowledgement", () => {
  const unsafe = validateWhyMoveSecEdgarReadOperationPlan(
    validInput({
      operation_plan: validOperationPlan({
        operation_id: "BAD ID",
        evidence_id: "primary:other",
        request_url: "https://www.sec.gov/Archives/edgar/data/320193/000032019324000123/other.htm",
        request_method: "POST",
        redirect_mode: "follow",
        credentials_mode: "include",
        expected_http_status: 201,
        expected_media_type: "application/json",
        max_response_bytes: 1_048_577,
        response_handling: "persist",
        runtime_binding: "enabled",
        advisory_influence: "ranking",
        broker_action: "prepare",
        ci_rehardening_review: "not_required",
        execution_status: "executed",
      }),
    }),
  );

  expect(unsafe).toEqual({
    version: WHY_MOVE_SEC_EDGAR_READ_OPERATION_PLAN_VERSION,
    disposition: "not_admitted_operation_plan_mismatch",
    reasons: [
      "ci_rehardening_review_required",
      "evidence_id_mismatch",
      "invalid_operation_id",
      "request_url_mismatch",
      "response_size_out_of_bounds",
      "unsafe_post_read_disposition",
      "unsafe_request_policy",
      "unsupported_response_constraint",
    ],
    validated_operation_plan: null,
  });
});

test("CAT-00.5 rejects hostile plan data without reading its getters", () => {
  let getterReads = 0;
  const hostile = validOperationPlan() as Record<string, unknown>;
  Object.defineProperty(hostile, "request_url", {
    enumerable: true,
    get() {
      getterReads += 1;
      return ARCHIVE_URL;
    },
  });

  expect(
    validateWhyMoveSecEdgarReadOperationPlan(validInput({ operation_plan: hostile })),
  ).toEqual({
    version: WHY_MOVE_SEC_EDGAR_READ_OPERATION_PLAN_VERSION,
    disposition: "invalid_input",
    reasons: ["accessor_or_non_plain_input"],
    validated_operation_plan: null,
  });
  expect(getterReads).toBe(0);
});

test("CAT-00.5 remains a local plan verifier rather than an SEC executor", () => {
  const source = readFileSync(modulePath, "utf8");
  const doc = readFileSync(docPath, "utf8");

  for (const forbidden of [
    "fetch(",
    "process.env",
    "createClient",
    "supabase",
    "openai",
    "netlify",
    "axios",
  ]) {
    expect(source.toLowerCase()).not.toContain(forbidden.toLowerCase());
  }
  expect(doc).toContain("does not execute a request");
  expect(doc).toContain("CI re-hardening review");
});
