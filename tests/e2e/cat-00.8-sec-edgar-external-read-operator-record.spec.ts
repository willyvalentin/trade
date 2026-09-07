import { readFileSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

import {
  WHY_MOVE_SEC_EDGAR_EXTERNAL_READ_OPERATOR_RECORD_VERSION,
  validateWhyMoveSecEdgarExternalReadOperatorRecord,
} from "../../lib/whymove-sec-edgar-external-read-operator-record";

const modulePath = join(
  process.cwd(),
  "lib/whymove-sec-edgar-external-read-operator-record.ts",
);
const docPath = join(
  process.cwd(),
  "docs/cat-00.8-sec-edgar-external-read-operator-record-contract.md",
);
const registrationPath = join(
  process.cwd(),
  "scripts/action-660j-provider-free-ci-registration.json",
);
const shardRunnerPath = join(
  process.cwd(),
  "scripts/action-660j-run-provider-free-ci-shard.mjs",
);
const thisTest =
  "tests/e2e/cat-00.8-sec-edgar-external-read-operator-record.spec.ts";
const ARCHIVE_URL =
  "https://www.sec.gov/Archives/edgar/data/320193/000032019324000123/form10k.htm";

function validEnvelope(overrides: Record<string, unknown> = {}) {
  return {
    envelope_id: "whymove:fixture:edgar:008",
    decision_snapshot_id: "decision:snapshot:edgar:008",
    decision_at: "2026-09-07T08:00:00.000Z",
    evidence: [
      {
        evidence_id: "lead:008",
        source_role: "discovery_lead",
        source_id: "massive_news",
        captured_at: "2026-09-07T07:54:00.000Z",
        effective_at: "2026-09-07T07:53:00.000Z",
        available_at_decision: true,
        direction: "positive",
        primary_evidence_ids: ["primary:edgar:008"],
      },
      {
        evidence_id: "primary:edgar:008",
        source_role: "primary_evidence",
        source_id: "sec_edgar",
        captured_at: "2026-09-07T07:55:00.000Z",
        effective_at: "2026-09-07T07:52:00.000Z",
        available_at_decision: true,
        direction: "positive",
        primary_evidence_ids: [],
      },
    ],
    ...overrides,
  };
}

function validExecutionScopePolicy(overrides: Record<string, unknown> = {}) {
  return {
    pre_read_authorization: {
      envelope: validEnvelope(),
      pre_read_authorization: {
        authorization_id: "sec-edgar-pre-read:008",
        evidence_id: "primary:edgar:008",
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
    },
    execution_scope: {
      execution_scope_id: "sec-edgar-execution-scope:008",
      authorization_id: "sec-edgar-pre-read:008",
      evidence_id: "primary:edgar:008",
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
    },
    ...overrides,
  };
}

function validOperatorRecord(overrides: Record<string, unknown> = {}) {
  return {
    operator_record_id: "sec-edgar-operator-record:008",
    execution_scope_id: "sec-edgar-execution-scope:008",
    required_ci_evidence: {
      ready_candidate_six_shard: "required_not_verified",
      exact_main_six_shard: "required_not_verified",
      main_protection_readback: "required_not_verified",
      independent_sweep: "required_not_verified",
    },
    rollback_or_containment:
      "cancel_before_network_on_missing_or_mismatched_evidence",
    operator_authority: "not_authorized_not_executed",
    network_activity: "not_performed",
    ...overrides,
  };
}

function validInput(overrides: Record<string, unknown> = {}) {
  return {
    execution_scope_policy: validExecutionScopePolicy(),
    operator_record: validOperatorRecord(),
    ...overrides,
  };
}

test("CAT-00.8 validates one exact no-authority operator-record template", () => {
  const first = validateWhyMoveSecEdgarExternalReadOperatorRecord(validInput());
  const second = validateWhyMoveSecEdgarExternalReadOperatorRecord(validInput());

  expect(first).toEqual(second);
  expect(first).toMatchObject({
    version: WHY_MOVE_SEC_EDGAR_EXTERNAL_READ_OPERATOR_RECORD_VERSION,
    disposition:
      "sec_edgar_external_read_operator_record_validated_not_authorized_not_executed",
    reasons: [],
    validated_operator_record: {
      operator_record_id: "sec-edgar-operator-record:008",
      execution_scope_id: "sec-edgar-execution-scope:008",
      required_ci_evidence: {
        ready_candidate_six_shard: "required_not_verified",
        exact_main_six_shard: "required_not_verified",
        main_protection_readback: "required_not_verified",
        independent_sweep: "required_not_verified",
      },
      rollback_or_containment:
        "cancel_before_network_on_missing_or_mismatched_evidence",
      operator_authority: "not_authorized_not_executed",
      network_activity: "not_performed",
    },
  });
  expect(Object.isFrozen(first)).toBe(true);
  expect(Object.isFrozen(first.reasons)).toBe(true);
  expect(Object.isFrozen(first.validated_operator_record)).toBe(true);
  expect(Object.isFrozen(first.validated_operator_record?.required_ci_evidence)).toBe(
    true,
  );
  expect(Object.values(first.authority).filter((value) => typeof value === "boolean")).toEqual(
    Array(12).fill(false),
  );
});

test("CAT-00.8 fails closed for evidence, containment, authority and scope drift", () => {
  const unsafe = validateWhyMoveSecEdgarExternalReadOperatorRecord(
    validInput({
      execution_scope_policy: validExecutionScopePolicy({
        execution_scope: {
          ...validExecutionScopePolicy().execution_scope,
          maximum_requests: 2,
        },
      }),
      operator_record: validOperatorRecord({
        operator_record_id: "BAD ID",
        execution_scope_id: "different",
        required_ci_evidence: {
          ready_candidate_six_shard: "verified",
          exact_main_six_shard: "required_not_verified",
          main_protection_readback: "required_not_verified",
          independent_sweep: "required_not_verified",
        },
        rollback_or_containment: "retry_after_failure",
        operator_authority: "authorized",
        network_activity: "performed",
      }),
    }),
  );

  expect(unsafe).toEqual({
    version: WHY_MOVE_SEC_EDGAR_EXTERNAL_READ_OPERATOR_RECORD_VERSION,
    disposition: "not_admitted_execution_scope_policy_unvalidated",
    reasons: [],
    validated_operator_record: null,
    authority: unsafe.authority,
  });

  const recordDrift = validateWhyMoveSecEdgarExternalReadOperatorRecord(
    validInput({
      operator_record: validOperatorRecord({
        operator_record_id: "BAD ID",
        execution_scope_id: "different",
        required_ci_evidence: {
          ready_candidate_six_shard: "verified",
          exact_main_six_shard: "required_not_verified",
          main_protection_readback: "required_not_verified",
          independent_sweep: "required_not_verified",
        },
        rollback_or_containment: "retry_after_failure",
        operator_authority: "authorized",
        network_activity: "performed",
      }),
    }),
  );

  expect(recordDrift).toMatchObject({
    disposition: "not_admitted_operator_record_mismatch",
    reasons: [
      "authority_status_unsafe",
      "containment_not_fail_closed",
      "evidence_not_marked_required_unverified",
      "execution_scope_binding_mismatch",
      "invalid_operator_record_id",
      "network_activity_unsafe",
    ],
    validated_operator_record: null,
  });
});

test("CAT-00.8 rejects widened and accessor-backed records without reading getters", () => {
  let getterReads = 0;
  const accessorRecord = validOperatorRecord();
  Object.defineProperty(accessorRecord, "network_activity", {
    enumerable: true,
    get() {
      getterReads += 1;
      return "not_performed";
    },
  });

  expect(
    validateWhyMoveSecEdgarExternalReadOperatorRecord(
      validInput({ operator_record: accessorRecord }),
    ),
  ).toMatchObject({
    disposition: "invalid_input",
    reasons: ["accessor_or_non_plain_input"],
  });
  expect(getterReads).toBe(0);

  expect(
    validateWhyMoveSecEdgarExternalReadOperatorRecord(
      validInput({ operator_record: validOperatorRecord({ widened: true }) }),
    ),
  ).toMatchObject({
    disposition: "invalid_input",
    reasons: ["accessor_or_non_plain_input"],
  });
});

test("CAT-00.8 stays provider-free and is registered once in the existing CI plan", () => {
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
  expect(doc).toContain("cannot inspect a workflow");
  expect(doc).toContain("not_authorized_not_executed");
  const registration = JSON.parse(readFileSync(registrationPath, "utf8")) as string[];
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(readFileSync(shardRunnerPath, "utf8").split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
