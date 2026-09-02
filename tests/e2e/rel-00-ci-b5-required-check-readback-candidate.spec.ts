import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const contractPath = "docs/rel-00-ci-b5-required-check-readback-candidate.md";
const evidencePath =
  "docs/evidence/rel-00-ci-b5-required-check-readback-candidate.json";
const b4EvidencePath =
  "docs/evidence/rel-00-ci-b4-required-check-protection-proof.json";
const workflowPath = ".github/workflows/milestone-a-ci.yml";
const selectorPath = "scripts/action-660k-run-draft-ci.mjs";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const planPath = "tests/e2e/action-660j-parallel-provider-free-verification.spec.ts";
const candidatePath = "scripts/rel-00-ci-b5-required-check-readback-candidate.mjs";
const thisTest =
  "tests/e2e/rel-00-ci-b5-required-check-readback-candidate.spec.ts";

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

type CandidateRuntime = {
  buildRequiredCheckReadbackCandidateReceipt: (
    serializedCandidate: unknown,
  ) => Record<string, unknown>;
  requiredCheckReadbackCandidatePolicy: Record<string, unknown>;
};

type Evidence = {
  baseline: {
    ci_b4_merge_commit: string;
    ci_b4_merge_tree: string;
    ci_b4_ready_full_ci_run_id: number;
    ci_b4_exact_main_run_id: number;
    workflow_sha256: string;
    workflow_blob_sha: string;
    full_shards: string[];
  };
  required_proof_contract_fixture_source: string;
  candidate_contract_fixture: Record<string, unknown>;
};

type B4Evidence = {
  proof_contract_fixture: Record<string, unknown>;
};

const evidence = JSON.parse(source(evidencePath)) as Evidence;
const b4Evidence = JSON.parse(source(b4EvidencePath)) as B4Evidence;
let candidate: CandidateRuntime;

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function proposal() {
  return {
    ...clone(evidence.candidate_contract_fixture),
    proof_contract: clone(b4Evidence.proof_contract_fixture),
  } as Record<string, unknown>;
}

function serializedProposal(value = proposal()) {
  return JSON.stringify(value);
}

function expectDeeplyFrozen(value: unknown, seen = new WeakSet<object>()) {
  if (!value || typeof value !== "object" || seen.has(value)) {
    return;
  }
  seen.add(value);
  expect(Object.isFrozen(value)).toBe(true);
  for (const key of Reflect.ownKeys(value)) {
    expectDeeplyFrozen((value as Record<PropertyKey, unknown>)[key], seen);
  }
}

function expectContainment(receipt: Record<string, unknown>) {
  expect(receipt).toMatchObject({
    contract_version: "trade.rel00.ci-b5.required-check-readback-candidate.v2",
    outcome: "broad_containment_required",
    proof_binding: null,
    readback_requirement: null,
    rollback_requirement: null,
    candidate_status: "unactivated_not_connected",
    effective_tier: 3,
    effective_disposition: "broad_containment",
    manual_review_required: true,
    external_state_verified: false,
    metadata_verified: false,
    reference_verified: false,
    activation_eligible: false,
    selector_connected: false,
    execution_plan_emitted: false,
    mergeability_decision: false,
    workflow_change: false,
    required_check_change: false,
    branch_protection_change: false,
    ci_deduplication_authorized: false,
    runtime_or_deployment_authority: false,
    reader_invocation: false,
    rollback_executed: false,
  });
  expectDeeplyFrozen(receipt);
}

test.beforeAll(async () => {
  candidate = (await import(
    pathToFileURL(resolve(root, candidatePath)).href,
  )) as CandidateRuntime;
});

test("REL-00 CI-B5 remains source-only and preserves the exact Full-CI profile", () => {
  const contract = source(contractPath);
  const workflow = source(workflowPath);
  const selector = source(selectorPath);
  const registration = JSON.parse(source(registrationPath)) as string[];
  const candidateSource = source(candidatePath);

  expect(evidence).toMatchObject({
    contract_version: "trade.rel00.ci-b5.required-check-readback-candidate.v2",
    workstream: "REL-00",
    substage: "CI-B5",
    status: "source_only_not_activated",
    amendment: {
      prior_contract_version:
        "trade.rel00.ci-b5.required-check-readback-candidate.v1",
      reason: "carry_b4_v2_fully_bound_check_run_collection_fallback",
      scope: "source_only_protocol_and_validator",
    },
    baseline: {
      ci_b4_merge_commit: "a0a3a67d624c9ccc76f2e7eedbc1c93750abc564",
      ci_b4_merge_tree: "15e95f251c8412c95d8e82500c5b98c64f9798e8",
      ci_b4_ready_full_ci_run_id: 33568818621,
      ci_b4_exact_main_run_id: 33571060854,
      workflow_sha256:
        "f41f286a04b0027438aa328afe118ab6a0b8287c609807fc919c9a8ab6cf7bb5",
      workflow_blob_sha: "29969e9dba4c909ae9b4695b2cd90725b0569e0e",
      full_shards: [
        "foundation",
        "replay-lineage",
        "snapshot-admission",
        "snapshot-issuance",
        "non-forgeable-authority",
        "lossless-scalar",
      ],
    },
    required_proof_contract_fixture_source: b4EvidencePath,
    authority: {
      draft_selector_activation: false,
      workflow_change: false,
      required_check_change: false,
      branch_protection_change: false,
      ready_main_full_ci_change: false,
      ci_deduplication_authorized: false,
      runtime_or_deployment_authority: false,
      reader_invocation: false,
    },
    candidate_policy: {
      source_only: true,
      actual_readback_performed: false,
      input_format: "strict_json_text",
      input_max_characters: 65536,
      object_input_accepted: false,
      untrusted_object_properties_read: false,
      required_reader_capability: "Administration:read",
      raw_api_response_allowed: false,
      mutation_methods_allowed: false,
      effective_tier: 3,
      effective_disposition: "broad_containment",
    },
  });
  expect(candidate.requiredCheckReadbackCandidatePolicy).toMatchObject({
    contract_version: "trade.rel00.ci-b5.required-check-readback-candidate.v2",
    source_only: true,
    external_readback_performed: false,
    serialized_input: {
      format: "strict_json_text",
      max_characters: 65536,
      object_input_accepted: false,
    },
    expected_b4_contract_version:
      "trade.rel00.ci-b4.required-check-protection-proof.v2",
    readback_shape: {
      schema_version: "trade.rel00.ci-b5.readback-shape.v2",
      required_reader_capability: "Administration:read",
      mode: "fresh_authenticated_read_only",
      raw_api_response_allowed: false,
      mutation_methods_allowed: false,
      terminal_check_result: "completed_success_only",
      pagination: "must_be_complete",
      rulesets: "must_be_empty",
    },
  });
  expect(
    (
      candidate.requiredCheckReadbackCandidatePolicy.readback_shape as Record<
        string,
        unknown
      >
    ).protocol,
  ).toEqual(
    (b4Evidence.proof_contract_fixture as Record<string, unknown>)
      .fresh_readback_protocol,
  );
  expect(
    (
      candidate.requiredCheckReadbackCandidatePolicy.readback_shape as Record<
        string,
        unknown
      >
    ).source_topology,
  ).toEqual(
    ((evidence.candidate_contract_fixture.readback_shape as Record<string, unknown>)
      .source_topology),
  );
  expect(
    (
      candidate.requiredCheckReadbackCandidatePolicy.readback_shape as Record<
        string,
        unknown
      >
    ).check_run_collection_fallback,
  ).toEqual(
    ((evidence.candidate_contract_fixture.readback_shape as Record<string, unknown>)
      .check_run_collection_fallback),
  );
  expect(
    (
      candidate.requiredCheckReadbackCandidatePolicy.readback_shape as Record<
        string,
        unknown
      >
    ).identity_binding_fields,
  ).toContain("check_run_check_suite_id");
  expect(contract).toContain("strict JSON text");
  expect(contract).toContain("not perform a readback");
  expect(contract).toContain("cross-bound two-source, GET-only session");
  expect(contract).toContain("CI-B7 remains the separate CI-policy decision point");
  expect(createHash("sha256").update(workflow, "utf8").digest("hex")).toBe(
    evidence.baseline.workflow_sha256,
  );
  for (const shard of evidence.baseline.full_shards) {
    expect(workflow).toContain("- " + shard);
  }
  expect(selector).not.toContain("rel-00-ci-b5-required-check-readback-candidate");
  expect(candidateSource).not.toMatch(
    /(?:node:|child_process|node:fs|fetch\s*\(|process\.|action-660k-run-draft-ci|action-660o-merge-candidate-provenance)/,
  );
  expect(candidateSource).not.toMatch(
    /(?:skip_ci|full_ci_exempt|merge_authority|eval\s*\()/,
  );
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
  expect(source(planPath).match(new RegExp(thisTest, "g")) ?? []).toHaveLength(1);
});

test("REL-00 CI-B5 produces only a detached unactivated readback candidate", () => {
  const input = proposal();
  const receipt = candidate.buildRequiredCheckReadbackCandidateReceipt(
    serializedProposal(input),
  );

  expect(receipt).toMatchObject({
    contract_version: "trade.rel00.ci-b5.required-check-readback-candidate.v2",
    outcome: "shadow_readback_shape_valid",
    reason: null,
    proof_binding: {
      repository: "willyvalentin/trade",
      branch: "main",
      workflow: {
        path: ".github/workflows/milestone-a-ci.yml",
        sha256: evidence.baseline.workflow_sha256,
        blob_sha: evidence.baseline.workflow_blob_sha,
      },
      protected_aggregate: {
        context: "provider-free-verification",
        app_id: 15368,
        app_slug: "github-actions",
      },
      exact_shards: evidence.baseline.full_shards,
      readback_source_topology: (
        b4Evidence.proof_contract_fixture as Record<string, unknown>
      ).readback_source_topology,
      check_run_collection_fallback: (
        b4Evidence.proof_contract_fixture as Record<string, unknown>
      ).check_run_collection_fallback,
      fresh_readback_protocol:
        b4Evidence.proof_contract_fixture.fresh_readback_protocol,
    },
    readback_requirement: {
      required_reader_capability: "Administration:read",
      mode: "fresh_authenticated_read_only",
      raw_api_response_allowed: false,
      mutation_methods_allowed: false,
      source_topology: (
        evidence.candidate_contract_fixture.readback_shape as Record<string, unknown>
      ).source_topology,
      check_run_collection_fallback: (
        evidence.candidate_contract_fixture.readback_shape as Record<string, unknown>
      ).check_run_collection_fallback,
      terminal_check_result: "completed_success_only",
      pagination: "must_be_complete",
      rulesets: "must_be_empty",
    },
    rollback_requirement: {
      activation_state: "unactivated_not_connected",
      on_readback_drift:
        "discard_unexecuted_candidate_and_require_fresh_readback",
      one_step: true,
      external_state_mutated: false,
      preserve_current_ready_main_full_ci: true,
      preserve_current_required_check: true,
      preserve_current_branch_protection: true,
      ci_deduplication_authorized: false,
    },
    candidate_status: "unactivated_not_connected",
    effective_tier: 3,
    effective_disposition: "broad_containment",
    manual_review_required: true,
    external_state_verified: false,
    metadata_verified: false,
    reference_verified: false,
    activation_eligible: false,
    selector_connected: false,
    execution_plan_emitted: false,
    mergeability_decision: false,
    workflow_change: false,
    required_check_change: false,
    branch_protection_change: false,
    ci_deduplication_authorized: false,
    runtime_or_deployment_authority: false,
    reader_invocation: false,
    rollback_executed: false,
  });
  expectDeeplyFrozen(receipt);

  (
    (input.readback_shape as Record<string, unknown>).protocol as string[]
  )[0] = "POST /repos/{owner}/{repo}/branches/{branch}";
  (
    (input.proof_contract as Record<string, unknown>).workflow as Record<
      string,
      unknown
    >
  ).sha256 = "0".repeat(64);
  expect(receipt).toMatchObject({
    proof_binding: { workflow: { sha256: evidence.baseline.workflow_sha256 } },
    readback_requirement: {
      raw_api_response_allowed: false,
      mutation_methods_allowed: false,
    },
  });

  const second = candidate.buildRequiredCheckReadbackCandidateReceipt(
    serializedProposal(),
  );
  expect(second).toEqual(receipt);
  expect(second).not.toBe(receipt);
  expect(second.proof_binding).not.toBe(receipt.proof_binding);
  expect(second.readback_requirement).not.toBe(receipt.readback_requirement);
  expect(second.rollback_requirement).not.toBe(receipt.rollback_requirement);
});

test("REL-00 CI-B5 fails closed for proof, shape, rollback and authority drift", () => {
  const variants: Array<(value: Record<string, unknown>) => void> = [
    (value) => {
      value.external_readback_performed = true;
    },
    (value) => {
      ((value.proof_contract as Record<string, unknown>).workflow as Record<
        string,
        unknown
      >).sha256 = "0".repeat(64);
    },
    (value) => {
      (
        (value.readback_shape as Record<string, unknown>).protocol as string[]
      ).reverse();
    },
    (value) => {
      (
        (value.readback_shape as Record<string, unknown>)
          .identity_binding_fields as string[]
      )[0] = "candidate_sha";
    },
    (value) => {
      (value.readback_shape as Record<string, unknown>).source_topology = {
        mode: "unbound",
      };
    },
    (value) => {
      (value.readback_shape as Record<string, unknown>)
        .check_run_collection_fallback = {
        collection_ref: "candidate_sha",
      };
    },
    (value) => {
      (
        (value.readback_shape as Record<string, unknown>)
          .check_run_collection_fallback as Record<string, unknown>
      ).collection_response = "partial_allowed";
    },
    (value) => {
      (
        (value.readback_shape as Record<string, unknown>)
          .check_run_collection_fallback as Record<string, unknown>
      ).target_selection = "one_success_record_per_target_name";
    },
    (value) => {
      (
        (value.readback_shape as Record<string, unknown>)
          .check_run_collection_fallback as Record<string, unknown>
      ).job_details_url_binding = "job_id_equals_check_run_id";
    },
    (value) => {
      (value.readback_shape as Record<string, unknown>)
        .mutation_methods_allowed = true;
    },
    (value) => {
      (value.rollback as Record<string, unknown>).external_state_mutated = true;
    },
    (value) => {
      (value.rollback as Record<string, unknown>).on_readback_drift =
        "PATCH /repos/{owner}/{repo}/branches/{branch}/protection";
    },
    (value) => {
      (value.authority as Record<string, unknown>).reader_invocation = true;
    },
    (value) => {
      (value.authority as Record<string, unknown>).selector_activation = true;
    },
    (value) => {
      value.unexpected = true;
    },
  ];

  for (const mutate of variants) {
    const input = proposal();
    mutate(input);
    expectContainment(
      candidate.buildRequiredCheckReadbackCandidateReceipt(serializedProposal(input)),
    );
  }
});

test("REL-00 CI-B5 contains non-inert object inputs and malformed serialized shapes", () => {
  let getterRead = false;
  const throwingTopLevel = proposal();
  Object.defineProperty(throwingTopLevel, "proof_contract", {
    enumerable: true,
    get() {
      getterRead = true;
      throw new Error("hostile proof getter must not run");
    },
  });
  expectContainment(
    candidate.buildRequiredCheckReadbackCandidateReceipt(throwingTopLevel),
  );
  expect(getterRead).toBe(false);

  let activeProxyTrapCalls = 0;
  const activeProxy = new Proxy(proposal(), {
    get(target, key, receiver) {
      activeProxyTrapCalls += 1;
      return Reflect.get(target, key, receiver);
    },
    ownKeys(target) {
      activeProxyTrapCalls += 1;
      return Reflect.ownKeys(target);
    },
  });
  expectContainment(
    candidate.buildRequiredCheckReadbackCandidateReceipt(activeProxy),
  );
  expect(activeProxyTrapCalls).toBe(0);

  let fabricatedProxyTrapCalls = 0;
  const fabricatedProxy = new Proxy(
    {},
    {
      ownKeys() {
        fabricatedProxyTrapCalls += 1;
        return [];
      },
      getOwnPropertyDescriptor() {
        fabricatedProxyTrapCalls += 1;
        return undefined;
      },
      get() {
        fabricatedProxyTrapCalls += 1;
        return undefined;
      },
    },
  );
  expectContainment(
    candidate.buildRequiredCheckReadbackCandidateReceipt(fabricatedProxy),
  );
  expect(fabricatedProxyTrapCalls).toBe(0);

  const revocable = Proxy.revocable(proposal(), {});
  revocable.revoke();
  expectContainment(candidate.buildRequiredCheckReadbackCandidateReceipt(revocable.proxy));

  const nestedProxy = proposal();
  nestedProxy.readback_shape = new Proxy(
    nestedProxy.readback_shape as Record<string, unknown>,
    {},
  );
  expectContainment(
    candidate.buildRequiredCheckReadbackCandidateReceipt(nestedProxy),
  );

  expectContainment(candidate.buildRequiredCheckReadbackCandidateReceipt(""));
  expectContainment(candidate.buildRequiredCheckReadbackCandidateReceipt("{"));
  expectContainment(candidate.buildRequiredCheckReadbackCandidateReceipt("null"));
  expectContainment(candidate.buildRequiredCheckReadbackCandidateReceipt("[]"));
  expectContainment(
    candidate.buildRequiredCheckReadbackCandidateReceipt(" ".repeat(65537)),
  );

  const rawResponseField = proposal();
  (rawResponseField.readback_shape as Record<string, unknown>).headers = {};
  expectContainment(
    candidate.buildRequiredCheckReadbackCandidateReceipt(
      serializedProposal(rawResponseField),
    ),
  );

  const proofExtra = proposal();
  (proofExtra.proof_contract as Record<string, unknown>).token = "redacted";
  expectContainment(
    candidate.buildRequiredCheckReadbackCandidateReceipt(serializedProposal(proofExtra)),
  );
});
