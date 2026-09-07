import { readFileSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

import {
  WHY_MOVE_SEC_EDGAR_GITHUB_EVIDENCE_RECEIPT_VERSION,
  validateWhyMoveSecEdgarGitHubEvidenceReceipt,
} from "../../lib/whymove-sec-edgar-github-evidence-receipt";

const modulePath = join(
  process.cwd(),
  "lib/whymove-sec-edgar-github-evidence-receipt.ts",
);
const docPath = join(
  process.cwd(),
  "docs/cat-00.11-github-evidence-receipt-contract.md",
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
  "tests/e2e/cat-00.11-sec-edgar-github-evidence-receipt.spec.ts";

function validEvidenceBundleInput(overrides: Record<string, unknown> = {}) {
  const envelope = {
    envelope_id: "whymove:fixture:edgar:011",
    decision_snapshot_id: "decision:snapshot:edgar:011",
    decision_at: "2026-09-07T08:00:00.000Z",
    evidence: [
      {
        evidence_id: "lead:011",
        source_role: "discovery_lead",
        source_id: "massive_news",
        captured_at: "2026-09-07T07:54:00.000Z",
        effective_at: "2026-09-07T07:53:00.000Z",
        available_at_decision: true,
        direction: "positive",
        primary_evidence_ids: ["primary:edgar:011"],
      },
      {
        evidence_id: "primary:edgar:011",
        source_role: "primary_evidence",
        source_id: "sec_edgar",
        captured_at: "2026-09-07T07:55:00.000Z",
        effective_at: "2026-09-07T07:52:00.000Z",
        available_at_decision: true,
        direction: "positive",
        primary_evidence_ids: [],
      },
    ],
  };
  const authorization = {
    authorization_id: "sec-edgar-pre-read:011",
    evidence_id: "primary:edgar:011",
    accession_number: "0000320193-24-000123",
    archive_url:
      "https://www.sec.gov/Archives/edgar/data/320193/000032019324000123/form10k.htm",
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
  };
  const scope = {
    execution_scope_id: "sec-edgar-execution-scope:011",
    authorization_id: authorization.authorization_id,
    evidence_id: authorization.evidence_id,
    accession_number: authorization.accession_number,
    archive_url: authorization.archive_url,
    maximum_requests: 1,
    request_method: authorization.request_method,
    redirect_mode: authorization.redirect_mode,
    credentials_mode: authorization.credentials_mode,
    expected_http_status: authorization.expected_http_status,
    expected_media_type: authorization.expected_media_type,
    max_response_bytes: authorization.max_response_bytes,
    response_handling: authorization.response_handling,
    runtime_binding: authorization.runtime_binding,
    advisory_influence: authorization.advisory_influence,
    broker_action: authorization.broker_action,
    ci_rehardening_review: authorization.ci_rehardening_review,
    independent_readback: "required_after_single_request",
    containment: "stop_after_first_request_no_retry",
    execution_status: "not_authorized_not_executed",
  };
  return {
    operator_record_input: {
      execution_scope_policy: {
        pre_read_authorization: { envelope, pre_read_authorization: authorization },
        execution_scope: scope,
      },
      operator_record: {
        operator_record_id: "sec-edgar-operator-record:011",
        execution_scope_id: scope.execution_scope_id,
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
    },
    evidence_bundle: {
      evidence_bundle_id: "sec-edgar-evidence-bundle:011",
      operator_record_id: "sec-edgar-operator-record:011",
      execution_scope_id: scope.execution_scope_id,
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
    ...overrides,
  };
}

function validReadPlanInput(overrides: Record<string, unknown> = {}) {
  return {
    evidence_bundle_input: validEvidenceBundleInput(),
    github_readback_plan: {
      plan_id: "github-evidence-read-plan:011",
      github_repository: "willyvalentin/trade",
      protected_branch: "main",
      required_check: "provider-free-verification",
      ready_candidate_run_id: 34_123_577_717,
      ready_candidate_sha: "ca1b27e2e40eae9c0b4707df7412239cc5f4762b",
      exact_main_run_id: 34_127_254_656,
      exact_main_sha: "314b65d063d897f92b32c57f9ed69092ac6096c4",
      independent_sweep_run_id: 34_130_170_282,
      independent_sweep_trigger: "schedule",
      containment: "cancel_before_network_on_missing_or_mismatched_evidence",
      network_activity: "not_performed",
      identity_requirement: {
        identity_class: "dedicated_fine_grained_read_only",
        permissions: { actions: "read", administration: "read", metadata: "read" },
        token_handling: "injected_one_shot_not_returned",
      },
      ...overrides,
    },
  };
}

function validReceipt(overrides: Record<string, unknown> = {}) {
  return {
    receipt_id: "github-evidence-receipt:011",
    plan_id: "github-evidence-read-plan:011",
    evidence_bundle_id: "sec-edgar-evidence-bundle:011",
    execution_scope_id: "sec-edgar-execution-scope:011",
    operator_record_id: "sec-edgar-operator-record:011",
    response_handling: "redacted_observed_metadata_only",
    network_activity: "claimed_five_gets_complete_not_independently_verified",
    observed_readbacks: [
      {
        evidence_kind: "ready_candidate_run",
        method: "GET",
        path: "/repos/willyvalentin/trade/actions/runs/34123577717",
        http_status: 200,
        response_body: "not_retained",
        observed_metadata: {
          run_id: 34_123_577_717,
          head_sha: "ca1b27e2e40eae9c0b4707df7412239cc5f4762b",
          event: "pull_request",
          status: "completed",
          conclusion: "success",
        },
      },
      {
        evidence_kind: "exact_main_run",
        method: "GET",
        path: "/repos/willyvalentin/trade/actions/runs/34127254656",
        http_status: 200,
        response_body: "not_retained",
        observed_metadata: {
          run_id: 34_127_254_656,
          head_sha: "314b65d063d897f92b32c57f9ed69092ac6096c4",
          event: "push",
          status: "completed",
          conclusion: "success",
        },
      },
      {
        evidence_kind: "independent_sweep_run",
        method: "GET",
        path: "/repos/willyvalentin/trade/actions/runs/34130170282",
        http_status: 200,
        response_body: "not_retained",
        observed_metadata: {
          run_id: 34_130_170_282,
          head_sha: "c0ffeec0ffeec0ffeec0ffeec0ffeec0ffeec0ff",
          event: "schedule",
          status: "completed",
          conclusion: "success",
        },
      },
      {
        evidence_kind: "main_branch_protection",
        method: "GET",
        path: "/repos/willyvalentin/trade/branches/main/protection",
        http_status: 200,
        response_body: "not_retained",
        observed_metadata: {
          protected: true,
          required_check: "provider-free-verification",
          required_check_present: true,
          strict: true,
        },
      },
      {
        evidence_kind: "repository_rulesets",
        method: "GET",
        path: "/repos/willyvalentin/trade/rulesets",
        http_status: 200,
        response_body: "not_retained",
        observed_metadata: { rulesets_observed: true, ruleset_count: 3 },
      },
    ],
    ...overrides,
  };
}

function validInput(overrides: Record<string, unknown> = {}) {
  return {
    github_readback_plan_input: validReadPlanInput(),
    github_evidence_receipt: validReceipt(),
    ...overrides,
  };
}

test("CAT-00.11 binds exactly five redacted successful GET observations without authority", () => {
  const result = validateWhyMoveSecEdgarGitHubEvidenceReceipt(validInput());

  expect(result).toMatchObject({
    version: WHY_MOVE_SEC_EDGAR_GITHUB_EVIDENCE_RECEIPT_VERSION,
    disposition:
      "github_evidence_receipt_locally_validated_not_independently_verified",
    reasons: [],
    validated_receipt: {
      receipt_id: "github-evidence-receipt:011",
      plan_id: "github-evidence-read-plan:011",
      response_handling: "redacted_observed_metadata_only",
      network_activity: "claimed_five_gets_complete_not_independently_verified",
      observed_readbacks: [
        { evidence_kind: "ready_candidate_run", method: "GET", http_status: 200 },
        { evidence_kind: "exact_main_run", method: "GET", http_status: 200 },
        { evidence_kind: "independent_sweep_run", method: "GET", http_status: 200 },
        { evidence_kind: "main_branch_protection", method: "GET", http_status: 200 },
        { evidence_kind: "repository_rulesets", method: "GET", http_status: 200 },
      ],
    },
  });
  expect(Object.isFrozen(result)).toBe(true);
  expect(Object.isFrozen(result.validated_receipt)).toBe(true);
  expect(Object.isFrozen(result.validated_receipt?.observed_readbacks)).toBe(true);
  expect(
    Object.values(result.authority).filter((value) => typeof value === "boolean"),
  ).toEqual(Array(12).fill(false));
});

test("CAT-00.11 fails closed for receipt binding, request, status and metadata drift", () => {
  const receipt = validReceipt();
  const observed = [...(receipt.observed_readbacks as Record<string, unknown>[])];
  observed[0] = {
    ...observed[0],
    method: "POST",
    http_status: 201,
    response_body: "retained",
    observed_metadata: {
      ...(observed[0]?.observed_metadata as Record<string, unknown>),
      head_sha: "bad",
    },
  };
  observed[3] = {
    ...observed[3],
    observed_metadata: {
      ...(observed[3]?.observed_metadata as Record<string, unknown>),
      strict: false,
    },
  };

  const result = validateWhyMoveSecEdgarGitHubEvidenceReceipt(
    validInput({
      github_evidence_receipt: {
        ...receipt,
        plan_id: "other-plan",
        network_activity: "performed",
        observed_readbacks: observed,
      },
    }),
  );

  expect(result).toMatchObject({
    disposition: "not_admitted_github_evidence_receipt_mismatch",
    reasons: [
      "branch_protection_metadata_mismatch",
      "network_activity_unsafe",
      "plan_binding_mismatch",
      "readback_request_mismatch",
      "readback_status_unexpected",
      "response_body_retention_unsafe",
      "run_metadata_mismatch",
    ],
    validated_receipt: null,
  });
});

test("CAT-00.11 rejects accessor-backed receipt arrays before a value is read", () => {
  let getterReads = 0;
  const receipt = validReceipt();
  const readbacks = receipt.observed_readbacks as Record<string, unknown>[];
  Object.defineProperty(readbacks, "0", {
    configurable: true,
    enumerable: true,
    get() {
      getterReads += 1;
      return {};
    },
  });

  expect(
    validateWhyMoveSecEdgarGitHubEvidenceReceipt(
      validInput({ github_evidence_receipt: receipt }),
    ),
  ).toMatchObject({
    disposition: "invalid_input",
    reasons: ["missing_or_invalid_scalar"],
  });
  expect(getterReads).toBe(0);
});

test("CAT-00.11 converts faulting proxy input into a fail-closed result", () => {
  const faultingProxy = new Proxy(
    {},
    {
      getPrototypeOf() {
        throw new Error("must not escape caller-controlled proxy faults");
      },
    },
  );

  expect(
    validateWhyMoveSecEdgarGitHubEvidenceReceipt(faultingProxy),
  ).toMatchObject({
    disposition: "invalid_input",
    reasons: ["accessor_or_non_plain_input"],
    validated_receipt: null,
  });
});

test("CAT-00.11 rejects an unretained raw-response field before it is read", () => {
  let rawResponseReads = 0;
  const receipt = validReceipt();
  const firstReadback = receipt.observed_readbacks[0] as Record<string, unknown>;
  Object.defineProperty(firstReadback, "raw_response", {
    configurable: true,
    enumerable: true,
    get() {
      rawResponseReads += 1;
      return "must-not-be-read";
    },
  });

  expect(
    validateWhyMoveSecEdgarGitHubEvidenceReceipt(
      validInput({ github_evidence_receipt: receipt }),
    ),
  ).toMatchObject({
    disposition: "not_admitted_github_evidence_receipt_mismatch",
    reasons: ["accessor_or_non_plain_input"],
    validated_receipt: null,
  });
  expect(rawResponseReads).toBe(0);
});

test("CAT-00.11 stops before the supplied receipt when CAT-00.10 is invalid", () => {
  expect(
    validateWhyMoveSecEdgarGitHubEvidenceReceipt(
      validInput({
        github_readback_plan_input: validReadPlanInput({
          github_repository: "other/repository",
        }),
      }),
    ),
  ).toMatchObject({
    disposition: "not_admitted_github_read_plan_unvalidated",
    reasons: [],
    validated_receipt: null,
  });
});

test("CAT-00.11 stays provider-free, documents its boundary, and is exactly registered", () => {
  const source = readFileSync(modulePath, "utf8");
  const documentation = readFileSync(docPath, "utf8");
  const registration = JSON.parse(readFileSync(registrationPath, "utf8")) as string[];
  const shardRunner = readFileSync(shardRunnerPath, "utf8");

  expect(documentation).toContain("no GitHub request");
  expect(documentation).toContain("not proof that GitHub was contacted");
  for (const forbidden of ["fetch(", "process.env", "@supabase", "netlify", "openai"]) {
    expect(source).not.toContain(forbidden);
  }
  expect(registration.filter((path) => path === thisTest)).toHaveLength(1);
  expect(shardRunner.split(thisTest)).toHaveLength(2);
});
