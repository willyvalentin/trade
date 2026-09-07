import { readFileSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

import {
  WHY_MOVE_SEC_EDGAR_GITHUB_EVIDENCE_READ_PLAN_VERSION,
  validateWhyMoveSecEdgarGitHubEvidenceReadPlan,
} from "../../lib/whymove-sec-edgar-github-evidence-read-plan";

const modulePath = join(
  process.cwd(),
  "lib/whymove-sec-edgar-github-evidence-read-plan.ts",
);
const docPath = join(
  process.cwd(),
  "docs/cat-00.10-github-evidence-read-plan-contract.md",
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
  "tests/e2e/cat-00.10-sec-edgar-github-evidence-read-plan.spec.ts";

function validEvidenceBundleInput(overrides: Record<string, unknown> = {}) {
  const envelope = {
    envelope_id: "whymove:fixture:edgar:010",
    decision_snapshot_id: "decision:snapshot:edgar:010",
    decision_at: "2026-09-07T08:00:00.000Z",
    evidence: [
      {
        evidence_id: "lead:010",
        source_role: "discovery_lead",
        source_id: "massive_news",
        captured_at: "2026-09-07T07:54:00.000Z",
        effective_at: "2026-09-07T07:53:00.000Z",
        available_at_decision: true,
        direction: "positive",
        primary_evidence_ids: ["primary:edgar:010"],
      },
      {
        evidence_id: "primary:edgar:010",
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
    authorization_id: "sec-edgar-pre-read:010",
    evidence_id: "primary:edgar:010",
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
    execution_scope_id: "sec-edgar-execution-scope:010",
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
        operator_record_id: "sec-edgar-operator-record:010",
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
      evidence_bundle_id: "sec-edgar-evidence-bundle:010",
      operator_record_id: "sec-edgar-operator-record:010",
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

function validPlan(overrides: Record<string, unknown> = {}) {
  return {
    plan_id: "github-evidence-read-plan:010",
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
  };
}

function validInput(overrides: Record<string, unknown> = {}) {
  return {
    evidence_bundle_input: validEvidenceBundleInput(),
    github_readback_plan: validPlan(),
    ...overrides,
  };
}

test("CAT-00.10 shapes only the five fixed GET evidence paths without authority", () => {
  const result = validateWhyMoveSecEdgarGitHubEvidenceReadPlan(validInput());

  expect(result).toMatchObject({
    version: WHY_MOVE_SEC_EDGAR_GITHUB_EVIDENCE_READ_PLAN_VERSION,
    disposition:
      "github_evidence_read_plan_locally_shaped_not_authorized_not_executed",
    reasons: [],
    planned_readback: {
      plan_id: "github-evidence-read-plan:010",
      github_repository: "willyvalentin/trade",
      protected_branch: "main",
      required_check: "provider-free-verification",
      evidence_bundle_id: "sec-edgar-evidence-bundle:010",
      execution_scope_id: "sec-edgar-execution-scope:010",
      operator_record_id: "sec-edgar-operator-record:010",
      network_activity: "not_performed",
      planned_readbacks: [
        { method: "GET", path: "/repos/willyvalentin/trade/actions/runs/34123577717" },
        { method: "GET", path: "/repos/willyvalentin/trade/actions/runs/34127254656" },
        { method: "GET", path: "/repos/willyvalentin/trade/actions/runs/34130170282" },
        { method: "GET", path: "/repos/willyvalentin/trade/branches/main/protection" },
        { method: "GET", path: "/repos/willyvalentin/trade/rulesets" },
      ],
    },
  });
  expect(Object.isFrozen(result)).toBe(true);
  expect(Object.isFrozen(result.planned_readback)).toBe(true);
  expect(Object.isFrozen(result.planned_readback?.planned_readbacks)).toBe(true);
  expect(Object.isFrozen(result.planned_readback?.identity_requirement.permissions)).toBe(true);
  expect(
    Object.values(result.authority).filter((value) => typeof value === "boolean"),
  ).toEqual(Array(12).fill(false));
});

test("CAT-00.10 fails closed for widened GitHub scope, identity, containment and run drift", () => {
  const result = validateWhyMoveSecEdgarGitHubEvidenceReadPlan(
    validInput({
      github_readback_plan: validPlan({
        github_repository: "other/repository",
        protected_branch: "release",
        required_check: "other-check",
        ready_candidate_run_id: 0,
        exact_main_run_id: 0,
        independent_sweep_run_id: 0,
        ready_candidate_sha: "BAD",
        independent_sweep_trigger: "push",
        containment: "retry_after_failure",
        network_activity: "performed",
        identity_requirement: {
          identity_class: "broad",
          permissions: { actions: "write", administration: "read", metadata: "read" },
          token_handling: "persisted",
        },
      }),
    }),
  );

  expect(result).toMatchObject({
    disposition: "not_admitted_github_read_plan_mismatch",
    reasons: [
      "containment_not_fail_closed",
      "github_repository_mismatch",
      "identity_permissions_not_read_only",
      "identity_requirement_invalid",
      "independent_sweep_trigger_unsafe",
      "invalid_commit_sha",
      "invalid_exact_main_run_id",
      "invalid_independent_sweep_run_id",
      "invalid_ready_candidate_run_id",
      "network_activity_unsafe",
      "protected_branch_mismatch",
      "required_check_mismatch",
    ],
    planned_readback: null,
  });
});

test("CAT-00.10 rejects accessor-backed plan data before it can be read", () => {
  let getterReads = 0;
  const plan = validPlan();
  Object.defineProperty(plan, "network_activity", {
    enumerable: true,
    get() {
      getterReads += 1;
      return "not_performed";
    },
  });

  expect(
    validateWhyMoveSecEdgarGitHubEvidenceReadPlan(
      validInput({ github_readback_plan: plan }),
    ),
  ).toMatchObject({
    disposition: "invalid_input",
    reasons: ["accessor_or_non_plain_input"],
  });
  expect(getterReads).toBe(0);
});

test("CAT-00.10 stops before GitHub plan validation when CAT-00.9 is invalid", () => {
  const evidence = validEvidenceBundleInput();
  const invalidEvidence = {
    ...evidence,
    evidence_bundle: { ...evidence.evidence_bundle, network_activity: "performed" },
  };
  expect(
    validateWhyMoveSecEdgarGitHubEvidenceReadPlan(
      validInput({ evidence_bundle_input: invalidEvidence }),
    ),
  ).toMatchObject({
    disposition: "not_admitted_evidence_bundle_unvalidated",
    reasons: [],
    planned_readback: null,
  });
});

test("CAT-00.10 stays provider-free, documents the authority boundary, and is exactly registered", () => {
  const source = readFileSync(modulePath, "utf8");
  const documentation = readFileSync(docPath, "utf8");
  const registration = JSON.parse(readFileSync(registrationPath, "utf8")) as string[];
  const shardRunner = readFileSync(shardRunnerPath, "utf8");

  expect(documentation).toContain("GET-only");
  expect(documentation).toContain("separately authorized");
  for (const forbidden of ["fetch(", "process.env", "@supabase", "netlify", "openai"]) {
    expect(source).not.toContain(forbidden);
  }
  expect(registration.filter((path) => path === thisTest)).toHaveLength(1);
  expect(shardRunner.split(thisTest)).toHaveLength(2);
});
