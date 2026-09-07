import { readFileSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

import {
  WHY_MOVE_SEC_EDGAR_EXECUTION_SCOPE_POLICY_VERSION,
  validateWhyMoveSecEdgarExecutionScopePolicy,
} from "../../lib/whymove-sec-edgar-execution-scope-policy";

const modulePath = join(
  process.cwd(),
  "lib/whymove-sec-edgar-execution-scope-policy.ts",
);
const docPath = join(
  process.cwd(),
  "docs/cat-00.7-sec-edgar-execution-scope-policy-contract.md",
);
const ARCHIVE_URL =
  "https://www.sec.gov/Archives/edgar/data/320193/000032019324000123/form10k.htm";

function validEnvelope(overrides: Record<string, unknown> = {}) {
  return {
    envelope_id: "whymove:fixture:edgar:007",
    decision_snapshot_id: "decision:snapshot:edgar:007",
    decision_at: "2026-09-07T07:00:00.000Z",
    evidence: [
      {
        evidence_id: "lead:007",
        source_role: "discovery_lead",
        source_id: "massive_news",
        captured_at: "2026-09-07T06:54:00.000Z",
        effective_at: "2026-09-07T06:53:00.000Z",
        available_at_decision: true,
        direction: "positive",
        primary_evidence_ids: ["primary:edgar:007"],
      },
      {
        evidence_id: "primary:edgar:007",
        source_role: "primary_evidence",
        source_id: "sec_edgar",
        captured_at: "2026-09-07T06:55:00.000Z",
        effective_at: "2026-09-07T06:52:00.000Z",
        available_at_decision: true,
        direction: "positive",
        primary_evidence_ids: [],
      },
    ],
    ...overrides,
  };
}

function validPreReadAuthorization(overrides: Record<string, unknown> = {}) {
  return {
    envelope: validEnvelope(),
    pre_read_authorization: {
      authorization_id: "sec-edgar-pre-read:007",
      evidence_id: "primary:edgar:007",
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
    },
    ...overrides,
  };
}

function validScope(overrides: Record<string, unknown> = {}) {
  return {
    execution_scope_id: "sec-edgar-execution-scope:007",
    authorization_id: "sec-edgar-pre-read:007",
    evidence_id: "primary:edgar:007",
    accession_number: "0000320193-24-000123",
    archive_url: ARCHIVE_URL,
    maximum_requests: 1,
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
    independent_readback: "required_after_single_request",
    containment: "stop_after_first_request_no_retry",
    execution_status: "not_authorized_not_executed",
    ...overrides,
  };
}

function validInput(overrides: Record<string, unknown> = {}) {
  return {
    pre_read_authorization: validPreReadAuthorization(),
    execution_scope: validScope(),
    ...overrides,
  };
}

test("CAT-00.7 accepts one exact but not-authorized SEC execution scope policy", () => {
  const first = validateWhyMoveSecEdgarExecutionScopePolicy(validInput());
  const second = validateWhyMoveSecEdgarExecutionScopePolicy(validInput());

  expect(first).toEqual(second);
  expect(first).toMatchObject({
    version: WHY_MOVE_SEC_EDGAR_EXECUTION_SCOPE_POLICY_VERSION,
    disposition:
      "sec_edgar_execution_scope_policy_validated_not_authorized_not_executed",
    reasons: [],
  });
  expect(first.validated_execution_scope_policy).toEqual(validScope());
  expect(Object.isFrozen(first)).toBe(true);
  expect(Object.isFrozen(first.reasons)).toBe(true);
  expect(Object.isFrozen(first.validated_execution_scope_policy)).toBe(true);
});

test("CAT-00.7 rejects an unvalidated pre-read authorization", () => {
  expect(
    validateWhyMoveSecEdgarExecutionScopePolicy(
      validInput({
        pre_read_authorization: validPreReadAuthorization({
          pre_read_authorization: { invalid: true },
        }),
      }),
    ),
  ).toEqual({
    version: WHY_MOVE_SEC_EDGAR_EXECUTION_SCOPE_POLICY_VERSION,
    disposition: "not_admitted_pre_read_authorization_unvalidated",
    reasons: [],
    validated_execution_scope_policy: null,
  });
});

test("CAT-00.7 fails closed for scope, binding and post-read drift", () => {
  const unsafe = validateWhyMoveSecEdgarExecutionScopePolicy(
    validInput({
      execution_scope: validScope({
        execution_scope_id: "BAD ID",
        authorization_id: "wrong",
        archive_url: "https://example.com/other",
        maximum_requests: 2,
        request_method: "POST",
        redirect_mode: "follow",
        credentials_mode: "include",
        expected_http_status: 201,
        expected_media_type: "application/json",
        response_handling: "persist",
        runtime_binding: "enabled",
        advisory_influence: "ranking",
        broker_action: "prepare",
        ci_rehardening_review: "not_required",
        independent_readback: "none",
        containment: "retry_forever",
        execution_status: "executed",
      }),
    }),
  );

  expect(unsafe).toEqual({
    version: WHY_MOVE_SEC_EDGAR_EXECUTION_SCOPE_POLICY_VERSION,
    disposition: "not_admitted_execution_scope_mismatch",
    reasons: [
      "authorization_binding_mismatch",
      "ci_rehardening_review_required",
      "containment_required",
      "independent_readback_required",
      "invalid_execution_scope_id",
      "request_budget_mismatch",
      "unsafe_execution_status",
      "unsafe_post_read_disposition",
      "unsafe_request_policy",
      "unsupported_response_constraint",
    ],
    validated_execution_scope_policy: null,
  });
});

test("CAT-00.7 rejects hostile scope data without reading its getters", () => {
  let getterReads = 0;
  const hostile = validScope() as Record<string, unknown>;
  Object.defineProperty(hostile, "archive_url", {
    enumerable: true,
    get() {
      getterReads += 1;
      return ARCHIVE_URL;
    },
  });

  expect(
    validateWhyMoveSecEdgarExecutionScopePolicy(
      validInput({ execution_scope: hostile }),
    ),
  ).toEqual({
    version: WHY_MOVE_SEC_EDGAR_EXECUTION_SCOPE_POLICY_VERSION,
    disposition: "invalid_input",
    reasons: ["accessor_or_non_plain_input"],
    validated_execution_scope_policy: null,
  });
  expect(getterReads).toBe(0);
});

test("CAT-00.7 remains a local policy validator rather than an SEC executor", () => {
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
  expect(doc).toContain("does not authorize an external request");
  expect(doc).toContain("one request");
});
