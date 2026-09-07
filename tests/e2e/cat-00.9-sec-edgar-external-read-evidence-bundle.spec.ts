import { readFileSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

import {
  WHY_MOVE_SEC_EDGAR_EXTERNAL_READ_EVIDENCE_BUNDLE_VERSION,
  validateWhyMoveSecEdgarExternalReadEvidenceBundle,
} from "../../lib/whymove-sec-edgar-external-read-evidence-bundle";

const modulePath = join(
  process.cwd(),
  "lib/whymove-sec-edgar-external-read-evidence-bundle.ts",
);
const docPath = join(
  process.cwd(),
  "docs/cat-00.9-sec-edgar-external-read-evidence-bundle-contract.md",
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
  "tests/e2e/cat-00.9-sec-edgar-external-read-evidence-bundle.spec.ts";
const ARCHIVE_URL =
  "https://www.sec.gov/Archives/edgar/data/320193/000032019324000123/form10k.htm";

function validEnvelope(overrides: Record<string, unknown> = {}) {
  return {
    envelope_id: "whymove:fixture:edgar:009",
    decision_snapshot_id: "decision:snapshot:edgar:009",
    decision_at: "2026-09-07T08:00:00.000Z",
    evidence: [
      {
        evidence_id: "lead:009",
        source_role: "discovery_lead",
        source_id: "massive_news",
        captured_at: "2026-09-07T07:54:00.000Z",
        effective_at: "2026-09-07T07:53:00.000Z",
        available_at_decision: true,
        direction: "positive",
        primary_evidence_ids: ["primary:edgar:009"],
      },
      {
        evidence_id: "primary:edgar:009",
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

function validOperatorRecordInput(overrides: Record<string, unknown> = {}) {
  return {
    execution_scope_policy: {
      pre_read_authorization: {
        envelope: validEnvelope(),
        pre_read_authorization: {
          authorization_id: "sec-edgar-pre-read:009",
          evidence_id: "primary:edgar:009",
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
        execution_scope_id: "sec-edgar-execution-scope:009",
        authorization_id: "sec-edgar-pre-read:009",
        evidence_id: "primary:edgar:009",
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
    },
    operator_record: {
      operator_record_id: "sec-edgar-operator-record:009",
      execution_scope_id: "sec-edgar-execution-scope:009",
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
    ...overrides,
  };
}

function validEvidenceBundle(overrides: Record<string, unknown> = {}) {
  return {
    evidence_bundle_id: "sec-edgar-evidence-bundle:009",
    operator_record_id: "sec-edgar-operator-record:009",
    execution_scope_id: "sec-edgar-execution-scope:009",
    required_ci_evidence: {
      ready_candidate_six_shard: "claimed_complete_not_independently_verified",
      exact_main_six_shard: "claimed_complete_not_independently_verified",
      main_protection_readback: "claimed_complete_not_independently_verified",
      independent_sweep: "claimed_complete_not_independently_verified",
    },
    rollback_or_containment:
      "cancel_before_network_on_missing_or_mismatched_evidence",
    network_activity: "not_performed",
    ...overrides,
  };
}

function validInput(overrides: Record<string, unknown> = {}) {
  return {
    operator_record_input: validOperatorRecordInput(),
    evidence_bundle: validEvidenceBundle(),
    ...overrides,
  };
}

test("CAT-00.9 shapes four unverified re-hardening claims without authority", () => {
  const first = validateWhyMoveSecEdgarExternalReadEvidenceBundle(validInput());
  const second = validateWhyMoveSecEdgarExternalReadEvidenceBundle(validInput());

  expect(first).toEqual(second);
  expect(first).toMatchObject({
    version: WHY_MOVE_SEC_EDGAR_EXTERNAL_READ_EVIDENCE_BUNDLE_VERSION,
    disposition:
      "sec_edgar_external_read_evidence_bundle_locally_shaped_not_authorized_not_executed",
    reasons: [],
    validated_evidence_bundle: {
      evidence_bundle_id: "sec-edgar-evidence-bundle:009",
      operator_record_id: "sec-edgar-operator-record:009",
      execution_scope_id: "sec-edgar-execution-scope:009",
      required_ci_evidence: {
        ready_candidate_six_shard: "claimed_complete_not_independently_verified",
        exact_main_six_shard: "claimed_complete_not_independently_verified",
        main_protection_readback: "claimed_complete_not_independently_verified",
        independent_sweep: "claimed_complete_not_independently_verified",
      },
      rollback_or_containment:
        "cancel_before_network_on_missing_or_mismatched_evidence",
      network_activity: "not_performed",
    },
  });
  expect(Object.isFrozen(first)).toBe(true);
  expect(Object.isFrozen(first.reasons)).toBe(true);
  expect(Object.isFrozen(first.validated_evidence_bundle)).toBe(true);
  expect(
    Object.isFrozen(first.validated_evidence_bundle?.required_ci_evidence),
  ).toBe(true);
  expect(
    Object.values(first.authority).filter((value) => typeof value === "boolean"),
  ).toEqual(Array(12).fill(false));
});

test("CAT-00.9 fails closed for record binding, evidence, containment and activity drift", () => {
  const result = validateWhyMoveSecEdgarExternalReadEvidenceBundle(
    validInput({
      evidence_bundle: validEvidenceBundle({
        evidence_bundle_id: "BAD ID",
        operator_record_id: "different-record",
        execution_scope_id: "different-scope",
        required_ci_evidence: {
          ready_candidate_six_shard: "verified",
          exact_main_six_shard: "required_not_verified",
          main_protection_readback: "claimed_complete_not_independently_verified",
          independent_sweep: "claimed_complete_not_independently_verified",
        },
        rollback_or_containment: "retry_after_failure",
        network_activity: "performed",
      }),
    }),
  );

  expect(result).toMatchObject({
    disposition: "not_admitted_evidence_bundle_mismatch",
    reasons: [
      "containment_not_fail_closed",
      "execution_scope_binding_mismatch",
      "invalid_evidence_bundle_id",
      "network_activity_unsafe",
      "operator_record_binding_mismatch",
      "unsafe_evidence_claim",
    ],
    validated_evidence_bundle: null,
  });
});

test("CAT-00.9 rejects widened and accessor-backed bundle data without reading getters", () => {
  let getterReads = 0;
  const accessorBundle = validEvidenceBundle();
  Object.defineProperty(accessorBundle, "network_activity", {
    enumerable: true,
    get() {
      getterReads += 1;
      return "not_performed";
    },
  });

  expect(
    validateWhyMoveSecEdgarExternalReadEvidenceBundle(
      validInput({ evidence_bundle: accessorBundle }),
    ),
  ).toMatchObject({
    disposition: "invalid_input",
    reasons: ["accessor_or_non_plain_input"],
  });
  expect(getterReads).toBe(0);

  expect(
    validateWhyMoveSecEdgarExternalReadEvidenceBundle(
      validInput({ evidence_bundle: validEvidenceBundle({ widened: true }) }),
    ),
  ).toMatchObject({
    disposition: "invalid_input",
    reasons: ["accessor_or_non_plain_input"],
  });
});

test("CAT-00.9 stops before bundle processing when the operator record is not validated", () => {
  const result = validateWhyMoveSecEdgarExternalReadEvidenceBundle(
    validInput({
      operator_record_input: validOperatorRecordInput({
        operator_record: {
          ...validOperatorRecordInput().operator_record,
          network_activity: "performed",
        },
      }),
    }),
  );

  expect(result).toEqual({
    version: WHY_MOVE_SEC_EDGAR_EXTERNAL_READ_EVIDENCE_BUNDLE_VERSION,
    disposition: "not_admitted_operator_record_unvalidated",
    reasons: [],
    validated_evidence_bundle: null,
    authority: result.authority,
  });
});

test("CAT-00.9 stays provider-free and is registered once in the existing CI plan", () => {
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
  expect(doc).toMatch(/never\s+independently verifies/);
  expect(doc).toContain("not_authorized_not_executed");
  const registration = JSON.parse(readFileSync(registrationPath, "utf8")) as string[];
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(
    readFileSync(shardRunnerPath, "utf8").split(JSON.stringify(thisTest)).length - 1,
  ).toBe(1);
});
