import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const contractPath = "docs/rel-00-ci-b6-adversarial-verification.md";
const fixturePath =
  "docs/evidence/rel-00-ci-b6-adversarial-verification-fixtures.json";
const b4EvidencePath =
  "docs/evidence/rel-00-ci-b4-required-check-protection-proof.json";
const b5EvidencePath =
  "docs/evidence/rel-00-ci-b5-required-check-readback-candidate.json";
const workflowPath = ".github/workflows/milestone-a-ci.yml";
const selectorPath = "scripts/action-660k-run-draft-ci.mjs";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const planPath = "tests/e2e/action-660j-parallel-provider-free-verification.spec.ts";
const candidatePath = "scripts/rel-00-ci-b5-required-check-readback-candidate.mjs";
const thisTest = "tests/e2e/rel-00-ci-b6-adversarial-verification.spec.ts";

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

function historicalWorkflowSha(commit: string) {
  return createHash("sha256")
    .update(execFileSync("git", ["show", `${commit}:${workflowPath}`], { cwd: root }))
    .digest("hex");
}

type CandidateRuntime = {
  buildRequiredCheckReadbackCandidateReceipt: (
    serializedCandidate: unknown,
  ) => Record<string, unknown>;
  requiredCheckReadbackCandidatePolicy: Record<string, unknown>;
};

type Fixture = {
  baseline: {
    ci_b5_merge_commit: string;
    workflow_sha256: string;
    workflow_blob_sha: string;
    full_shards: string[];
  };
  adversarial_case_ids: string[];
  containment: Record<string, unknown>;
};

type B4Evidence = {
  proof_contract_fixture: Record<string, unknown>;
};

type B5Evidence = {
  candidate_contract_fixture: Record<string, unknown>;
};

const fixture = JSON.parse(source(fixturePath)) as Fixture;
const b4Evidence = JSON.parse(source(b4EvidencePath)) as B4Evidence;
const b5Evidence = JSON.parse(source(b5EvidencePath)) as B5Evidence;
let candidate: CandidateRuntime;

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function proposal() {
  return {
    ...clone(b5Evidence.candidate_contract_fixture),
    proof_contract: clone(b4Evidence.proof_contract_fixture),
  } as Record<string, unknown>;
}

function serializedProposal(value = proposal()) {
  return JSON.stringify(value);
}

function record(value: unknown) {
  return value as Record<string, unknown>;
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
  expect(receipt).toMatchObject(fixture.containment);
  expectDeeplyFrozen(receipt);
}

test.beforeAll(async () => {
  candidate = (await import(
    pathToFileURL(resolve(root, candidatePath)).href,
  )) as CandidateRuntime;
});

test("REL-00 CI-B6 stays source-only in the unchanged six-shard Full-CI profile", () => {
  const contract = source(contractPath);
  const workflow = source(workflowPath);
  const selector = source(selectorPath);
  const registration = JSON.parse(source(registrationPath)) as string[];
  const candidateSource = source(candidatePath);

  expect(fixture).toMatchObject({
    contract_version: "trade.rel00.ci-b6.adversarial-verification-fixtures.v1",
    workstream: "REL-00",
    substage: "CI-B6",
    status: "source_only_not_activated",
    positive_control: {
      outcome: "shadow_readback_shape_valid",
      effective_tier: 3,
      effective_disposition: "broad_containment",
      manual_review_required: true,
      candidate_status: "unactivated_not_connected",
      external_state_verified: false,
      activation_eligible: false,
    },
    authority: {
      actual_readback_performed: false,
      github_api_or_gh_invocation: false,
      credential_or_token_use: false,
      workflow_change: false,
      draft_selector_activation: false,
      required_check_change: false,
      branch_protection_change: false,
      ready_main_full_ci_change: false,
      netlify_or_runtime_change: false,
      ci_deduplication_authorized: false,
    },
    next_boundary: {
      ci_b7: "separately_authorized_ci_policy_decision",
      ci_b8: "declared_real_observation_window_required",
    },
  });
  expect(fixture.adversarial_case_ids).toEqual([
    "b4_repository_branch_workflow_aggregate_shard_and_protection_drift",
    "b5_readback_shape_protocol_identity_pagination_and_ruleset_drift",
    "authority_rollback_and_mutation_escalation",
    "raw_response_credential_pagination_and_ruleset_surface",
    "extra_missing_and_malformed_serialized_structure",
    "duplicate_top_level_and_nested_semantic_json_keys",
    "getter_proxy_symbol_and_revoked_object_boundary",
    "strict_json_length_boundary",
  ]);
  expect(historicalWorkflowSha(fixture.baseline.ci_b5_merge_commit)).toBe(
    fixture.baseline.workflow_sha256,
  );
  for (const shard of fixture.baseline.full_shards) {
    expect(workflow).toContain("- " + shard);
  }
  expect(selector).not.toContain("rel-00-ci-b6-adversarial-verification");
  expect(candidateSource).not.toMatch(
    /(?:node:|child_process|node:fs|fetch\s*\(|process\.|action-660k-run-draft-ci|action-660o-merge-candidate-provenance)/,
  );
  expect(candidateSource).not.toMatch(
    /(?:skip_ci|full_ci_exempt|merge_authority|eval\s*\()/,
  );
  expect(candidate.requiredCheckReadbackCandidatePolicy).toMatchObject({
    source_only: true,
    external_readback_performed: false,
    serialized_input: {
      format: "strict_json_text",
      max_characters: 65536,
      object_input_accepted: false,
    },
    rollback: {
      activation_state: "unactivated_not_connected",
      external_state_mutated: false,
      ci_deduplication_authorized: false,
    },
    authority: {
      workflow_change: false,
      required_check_change: false,
      branch_protection_change: false,
      selector_activation: false,
      execution_plan_emitted: false,
      mergeability_decision: false,
      ci_deduplication_authorized: false,
      runtime_or_deployment_authority: false,
      reader_invocation: false,
    },
  });
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
  expect(source(planPath).match(new RegExp(thisTest, "g")) ?? []).toHaveLength(1);
  expect(contract).toContain("duplicate semantic object-key rejection");
  expect(contract).toContain("CI-B7 remains a separately authorized CI-policy decision");
});

test("REL-00 CI-B6 keeps the sole valid candidate inert and detached", () => {
  const receipt = candidate.buildRequiredCheckReadbackCandidateReceipt(
    serializedProposal(),
  );

  expect(receipt).toMatchObject({
    outcome: "shadow_readback_shape_valid",
    reason: null,
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
});

test("REL-00 CI-B6 contains B4 and B5 static-policy drift with no partial binding", () => {
  const variants: Array<(value: Record<string, unknown>) => void> = [
    (value) => {
      record(value.proof_contract).repository = "attacker/trade";
    },
    (value) => {
      record(value.proof_contract).branch = "release";
    },
    (value) => {
      record(record(value.proof_contract).workflow).blob_sha = "0".repeat(40);
    },
    (value) => {
      record(record(value.proof_contract).protected_aggregate).app_id = 1;
    },
    (value) => {
      (record(value.proof_contract).exact_shards as string[]).reverse();
    },
    (value) => {
      record(record(value.proof_contract).protection_profile).admin_enforcement =
        false;
    },
    (value) => {
      record(record(value.proof_contract).protection_profile).rulesets =
        "permitted";
    },
    (value) => {
      (record(value.readback_shape).protocol as string[])[0] =
        "POST /repos/{owner}/{repo}/branches/{branch}";
    },
    (value) => {
      (record(value.readback_shape).identity_binding_fields as string[])[0] =
        "token";
    },
    (value) => {
      record(value.readback_shape).pagination = "partial_allowed";
    },
    (value) => {
      record(value.readback_shape).rulesets = "unknown";
    },
    (value) => {
      record(value.readback_shape).required_reader_capability =
        "Administration:write";
    },
  ];

  for (const mutate of variants) {
    const input = proposal();
    mutate(input);
    expectContainment(
      candidate.buildRequiredCheckReadbackCandidateReceipt(
        serializedProposal(input),
      ),
    );
  }
});

test("REL-00 CI-B6 contains authority, rollback, raw-data and structural escalation", () => {
  const variants: Array<(value: Record<string, unknown>) => void> = [
    (value) => {
      value.external_readback_performed = true;
    },
    (value) => {
      record(value.readback_shape).raw_api_response_allowed = true;
    },
    (value) => {
      record(value.readback_shape).mutation_methods_allowed = true;
    },
    (value) => {
      record(value.readback_shape).headers = { authorization: "not-used" };
    },
    (value) => {
      record(value.readback_shape).token = "not-used";
    },
    (value) => {
      record(value.rollback).external_state_mutated = true;
    },
    (value) => {
      record(value.rollback).ci_deduplication_authorized = true;
    },
    (value) => {
      record(value.authority).reader_invocation = true;
    },
    (value) => {
      record(value.authority).selector_activation = true;
    },
    (value) => {
      record(value.authority).ci_deduplication_authorized = true;
    },
    (value) => {
      record(value.authority).runtime_or_deployment_authority = true;
    },
    (value) => {
      value.unexpected = true;
    },
    (value) => {
      delete value.rollback;
    },
  ];

  for (const mutate of variants) {
    const input = proposal();
    mutate(input);
    expectContainment(
      candidate.buildRequiredCheckReadbackCandidateReceipt(
        serializedProposal(input),
      ),
    );
  }
});

test("REL-00 CI-B6 rejects duplicate semantic JSON keys and preserves length boundaries", () => {
  const valid = serializedProposal();
  const duplicateTopLevel = valid.replace(
    '"source_only":true',
    '"source_only":false,"source_only":true',
  );
  const duplicateNestedUnicode = valid.replace(
    '"reader_invocation":false',
    '"reader_invocati\\u006fn":true,"reader_invocation":false',
  );
  const duplicateNestedSolidus =
    valid.slice(0, -1) + ',"unrelated":{"/":0,"\\/":1}}';
  const duplicateSurrogate = valid.replace(
    '"reader_invocation":false',
    '"\\ud83d\\ude00":true,"😀":false,"reader_invocation":false',
  );
  const duplicateInsideArray =
    valid.slice(0, -1) + ',"unrelated":[{"x":0,"x":1}]}';

  for (const duplicate of [
    duplicateTopLevel,
    duplicateNestedUnicode,
    duplicateNestedSolidus,
    duplicateSurrogate,
    duplicateInsideArray,
  ]) {
    const receipt =
      candidate.buildRequiredCheckReadbackCandidateReceipt(duplicate);
    expectContainment(receipt);
    expect(receipt.reason).toBe("serialized_candidate_duplicate_object_key");
  }

  const exactBoundary = valid + " ".repeat(65536 - valid.length);
  expect(exactBoundary).toHaveLength(65536);
  expect(
    candidate.buildRequiredCheckReadbackCandidateReceipt(exactBoundary),
  ).toMatchObject({
    outcome: "shadow_readback_shape_valid",
    activation_eligible: false,
  });
  expectContainment(
    candidate.buildRequiredCheckReadbackCandidateReceipt(exactBoundary + " "),
  );
  for (const invalid of ["", "{", "null", "[]", "1", "true"]) {
    expectContainment(
      candidate.buildRequiredCheckReadbackCandidateReceipt(invalid),
    );
  }
});

test("REL-00 CI-B6 refuses hostile direct objects before any trap or coercion", () => {
  let getterReads = 0;
  const accessorInput = proposal();
  Object.defineProperty(accessorInput, "proof_contract", {
    enumerable: true,
    get() {
      getterReads += 1;
      throw new Error("hostile getter must remain inert");
    },
  });
  expectContainment(
    candidate.buildRequiredCheckReadbackCandidateReceipt(accessorInput),
  );
  expect(getterReads).toBe(0);

  let proxyTraps = 0;
  const activeProxy = new Proxy(proposal(), {
    get(target, key, receiver) {
      proxyTraps += 1;
      return Reflect.get(target, key, receiver);
    },
    ownKeys(target) {
      proxyTraps += 1;
      return Reflect.ownKeys(target);
    },
  });
  expectContainment(
    candidate.buildRequiredCheckReadbackCandidateReceipt(activeProxy),
  );
  expect(proxyTraps).toBe(0);

  let symbolCoercions = 0;
  const coercingInput = {
    [Symbol.toPrimitive]() {
      symbolCoercions += 1;
      throw new Error("coercion must remain inert");
    },
  };
  expectContainment(
    candidate.buildRequiredCheckReadbackCandidateReceipt(coercingInput),
  );
  expect(symbolCoercions).toBe(0);

  const revoked = Proxy.revocable(proposal(), {});
  revoked.revoke();
  expectContainment(
    candidate.buildRequiredCheckReadbackCandidateReceipt(revoked.proxy),
  );

  const nestedProxy = proposal();
  nestedProxy.readback_shape = new Proxy(
    nestedProxy.readback_shape as Record<string, unknown>,
    {},
  );
  expectContainment(
    candidate.buildRequiredCheckReadbackCandidateReceipt(nestedProxy),
  );
});
