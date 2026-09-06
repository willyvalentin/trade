import { readFileSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

import {
  WHY_MOVE_SEC_EDGAR_PRE_READ_AUTHORIZATION_VERSION,
  validateWhyMoveSecEdgarPreReadAuthorization,
} from "../../lib/whymove-sec-edgar-pre-read-authorization";

const modulePath = join(process.cwd(), "lib/whymove-sec-edgar-pre-read-authorization.ts");
const docPath = join(
  process.cwd(),
  "docs/cat-00.6-sec-edgar-pre-read-authorization-contract.md",
);
const ARCHIVE_URL = "https://www.sec.gov/Archives/edgar/data/320193/000032019324000123/form10k.htm";

function validEnvelope(overrides: Record<string, unknown> = {}) {
  return {
    envelope_id: "whymove:fixture:edgar:006",
    decision_snapshot_id: "decision:snapshot:edgar:006",
    decision_at: "2026-09-06T06:00:00.000Z",
    evidence: [
      {
        evidence_id: "lead:006",
        source_role: "discovery_lead",
        source_id: "massive_news",
        captured_at: "2026-09-06T05:54:00.000Z",
        effective_at: "2026-09-06T05:53:00.000Z",
        available_at_decision: true,
        direction: "positive",
        primary_evidence_ids: ["primary:edgar:006"],
      },
      {
        evidence_id: "primary:edgar:006",
        source_role: "primary_evidence",
        source_id: "sec_edgar",
        captured_at: "2026-09-06T05:55:00.000Z",
        effective_at: "2026-09-06T05:52:00.000Z",
        available_at_decision: true,
        direction: "positive",
        primary_evidence_ids: [],
      },
    ],
    ...overrides,
  };
}

function validAuthorization(overrides: Record<string, unknown> = {}) {
  return {
    authorization_id: "sec-edgar-pre-read:006",
    evidence_id: "primary:edgar:006",
    accession_number: "0000320193-24-000123",
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
    ...overrides,
  };
}

function validInput(overrides: Record<string, unknown> = {}) {
  return {
    envelope: validEnvelope(),
    pre_read_authorization: validAuthorization(),
    ...overrides,
  };
}

test("CAT-00.6 accepts one exact, non-executing SEC pre-read authorization", () => {
  const first = validateWhyMoveSecEdgarPreReadAuthorization(validInput());
  const second = validateWhyMoveSecEdgarPreReadAuthorization(validInput());

  expect(first).toEqual(second);
  expect(first).toMatchObject({
    version: WHY_MOVE_SEC_EDGAR_PRE_READ_AUTHORIZATION_VERSION,
    disposition: "sec_edgar_pre_read_authorization_validated_not_executed",
    reasons: [],
  });
  expect(first.validated_pre_read_authorization).toEqual({
    authorization_id: "sec-edgar-pre-read:006",
    evidence_id: "primary:edgar:006",
    accession_number: "0000320193-24-000123",
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
  expect(Object.isFrozen(first.validated_pre_read_authorization)).toBe(true);
});

test("CAT-00.6 rejects unvalidated envelopes and unbound primary evidence", () => {
  expect(
    validateWhyMoveSecEdgarPreReadAuthorization(
      validInput({ envelope: validEnvelope({ evidence: [] }) }),
    ),
  ).toMatchObject({ disposition: "not_admitted_envelope_unvalidated" });

  expect(
    validateWhyMoveSecEdgarPreReadAuthorization(
      validInput({ pre_read_authorization: validAuthorization({ evidence_id: "primary:other" }) }),
    ),
  ).toMatchObject({ disposition: "not_admitted_primary_evidence_unbound" });
});

test("CAT-00.6 fails closed for locator and scope drift", () => {
  const unsafe = validateWhyMoveSecEdgarPreReadAuthorization(
    validInput({
      pre_read_authorization: validAuthorization({
        authorization_id: "BAD ID",
        accession_number: "invalid",
        archive_url: "https://example.com/Archives/edgar/data/320193/000032019324000123/form10k.htm?x=1",
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
    version: WHY_MOVE_SEC_EDGAR_PRE_READ_AUTHORIZATION_VERSION,
    disposition: "not_admitted_pre_read_authorization_mismatch",
    reasons: [
      "ci_rehardening_review_required",
      "invalid_archive_locator",
      "invalid_authorization_id",
      "response_size_out_of_bounds",
      "unsafe_post_read_disposition",
      "unsafe_request_policy",
      "unsupported_response_constraint",
    ],
    validated_pre_read_authorization: null,
  });
});

test("CAT-00.6 rejects hostile authorization data without reading its getters", () => {
  let getterReads = 0;
  const hostile = validAuthorization() as Record<string, unknown>;
  Object.defineProperty(hostile, "archive_url", {
    enumerable: true,
    get() {
      getterReads += 1;
      return ARCHIVE_URL;
    },
  });

  expect(
    validateWhyMoveSecEdgarPreReadAuthorization(
      validInput({ pre_read_authorization: hostile }),
    ),
  ).toEqual({
    version: WHY_MOVE_SEC_EDGAR_PRE_READ_AUTHORIZATION_VERSION,
    disposition: "invalid_input",
    reasons: ["accessor_or_non_plain_input"],
    validated_pre_read_authorization: null,
  });
  expect(getterReads).toBe(0);
});

test("CAT-00.6 remains a local authorization validator rather than an SEC executor", () => {
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
  expect(doc).toContain("not an external authorization");
  expect(doc).toContain("CI re-hardening review");
});
