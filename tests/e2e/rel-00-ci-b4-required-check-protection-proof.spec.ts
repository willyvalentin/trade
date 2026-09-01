import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const contractPath = "docs/rel-00-ci-b4-required-check-protection-proof.md";
const evidencePath =
  "docs/evidence/rel-00-ci-b4-required-check-protection-proof.json";
const workflowPath = ".github/workflows/milestone-a-ci.yml";
const selectorPath = "scripts/action-660k-run-draft-ci.mjs";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const planPath = "tests/e2e/action-660j-parallel-provider-free-verification.spec.ts";
const proofPath = "scripts/rel-00-ci-b4-required-check-protection-proof.mjs";
const thisTest =
  "tests/e2e/rel-00-ci-b4-required-check-protection-proof.spec.ts";

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

type ProofRuntime = {
  buildRequiredCheckProtectionProof: (proposal: unknown) => Record<string, unknown>;
  requiredCheckProtectionProofPolicy: Record<string, unknown>;
};

type Evidence = {
  baseline: {
    ci_b3_merge_commit: string;
    ci_b3_merge_tree: string;
    ci_b3_ready_full_ci_run_id: number;
    workflow_sha256: string;
    workflow_blob_sha: string;
    full_shards: string[];
  };
  proof_contract_fixture: Record<string, unknown>;
};

const evidence = JSON.parse(source(evidencePath)) as Evidence;
let proof: ProofRuntime;

function proposal() {
  return JSON.parse(JSON.stringify(evidence.proof_contract_fixture)) as Record<
    string,
    unknown
  >;
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
    contract_version: "trade.rel00.ci-b4.required-check-protection-proof.v1",
    outcome: "broad_containment_required",
    policy_binding: null,
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
  });
  expectDeeplyFrozen(receipt);
}

test.beforeAll(async () => {
  proof = (await import(pathToFileURL(resolve(root, proofPath)).href)) as ProofRuntime;
});

test("REL-00 CI-B4 remains source-only and freezes the unchanged protected profile", () => {
  const contract = source(contractPath);
  const workflow = source(workflowPath);
  const selector = source(selectorPath);
  const registration = JSON.parse(source(registrationPath)) as string[];
  const proofSource = source(proofPath);

  expect(evidence).toMatchObject({
    contract_version: "trade.rel00.ci-b4.required-check-protection-proof.v1",
    workstream: "REL-00",
    substage: "CI-B4",
    status: "source_only_not_activated",
    baseline: {
      ci_b3_merge_commit: "87b44e139a600a9e26ff13b0f9a8944e29983470",
      ci_b3_merge_tree: "c8aba023a4696f4a90b5c0b2d68efaf05d704acd",
      ci_b3_ready_full_ci_run_id: 33562222775,
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
    authority: {
      draft_selector_activation: false,
      workflow_change: false,
      required_check_change: false,
      branch_protection_change: false,
      ready_main_full_ci_change: false,
      ci_deduplication_authorized: false,
      runtime_or_deployment_authority: false,
    },
    proof_policy: {
      source_only: true,
      fresh_authenticated_readback_required: true,
      external_state_verified: false,
      candidate_sha_check_runs_authoritative: false,
      effective_tier: 3,
      effective_disposition: "broad_containment",
    },
  });
  expect(proof.requiredCheckProtectionProofPolicy).toMatchObject({
    contract_version: "trade.rel00.ci-b4.required-check-protection-proof.v1",
    source_only: true,
    fresh_authenticated_readback_required: true,
    expected_repository: "willyvalentin/trade",
    expected_branch: "main",
    protected_aggregate: {
      context: "provider-free-verification",
      app_id: 15368,
      app_slug: "github-actions",
    },
  });
  expect(proof.requiredCheckProtectionProofPolicy.exact_shards).toEqual(
    evidence.baseline.full_shards,
  );
  expect(contract).toContain("does not\nperform that readback");
  expect(contract).toContain("CI-B7 remains the separately authorized policy decision");
  expect(createHash("sha256").update(workflow, "utf8").digest("hex")).toBe(
    evidence.baseline.workflow_sha256,
  );
  for (const shard of evidence.baseline.full_shards) {
    expect(workflow).toContain(`- ${shard}`);
  }
  expect(selector).not.toContain("rel-00-ci-b4-required-check-protection-proof");
  expect(proofSource).not.toMatch(
    /(?:node:|child_process|node:fs|fetch\s*\(|process\.|action-660k-run-draft-ci|action-660o-merge-candidate-provenance)/,
  );
  expect(proofSource).not.toMatch(/(?:skip_ci|full_ci_exempt|merge_authority)/);
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
  expect(source(planPath).match(new RegExp(thisTest, "g")) ?? []).toHaveLength(1);
});

test("REL-00 CI-B4 produces only a detached fresh-readback requirement", () => {
  const input = proposal();
  const receipt = proof.buildRequiredCheckProtectionProof(input);

  expect(receipt).toMatchObject({
    contract_version: "trade.rel00.ci-b4.required-check-protection-proof.v1",
    outcome: "contract_only_fresh_readback_required",
    reason: null,
    policy_binding: {
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
    },
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
  });
  expectDeeplyFrozen(receipt);

  (input.workflow as Record<string, unknown>).sha256 = "0".repeat(64);
  (input.exact_shards as string[])[0] = "mutated";
  expect(receipt.policy_binding).toMatchObject({
    workflow: { sha256: evidence.baseline.workflow_sha256 },
    exact_shards: evidence.baseline.full_shards,
  });

  const second = proof.buildRequiredCheckProtectionProof(proposal());
  expect(second).toEqual(receipt);
  expect(second).not.toBe(receipt);
  expect(second.policy_binding).not.toBe(receipt.policy_binding);
});

test("REL-00 CI-B4 fails closed for policy, protocol and authority drift", () => {
  const variants: Array<(value: Record<string, unknown>) => void> = [
    (value) => {
      value.repository = "other/repository";
    },
    (value) => {
      (value.workflow as Record<string, unknown>).sha256 = "0".repeat(64);
    },
    (value) => {
      (value.exact_shards as string[]).reverse();
    },
    (value) => {
      ((value.protection_profile as Record<string, unknown>).required_checks as Array<
        Record<string, unknown>
      >)[0].app_id = 1;
    },
    (value) => {
      (value.protection_profile as Record<string, unknown>).strict_required_status_checks =
        false;
    },
    (value) => {
      (value.protection_profile as Record<string, unknown>).rulesets = "equivalent";
    },
    (value) => {
      (value.fresh_readback_protocol as string[])[0] =
        "POST /repos/{owner}/{repo}/branches/{branch}";
    },
    (value) => {
      (value.authority as Record<string, unknown>).mergeability_decision = true;
    },
    (value) => {
      value.unexpected = true;
    },
  ];

  for (const mutate of variants) {
    const input = proposal();
    mutate(input);
    expectContainment(proof.buildRequiredCheckProtectionProof(input));
  }
});

test("REL-00 CI-B4 contains hostile access and nested extra fields", () => {
  const throwingTopLevel = proposal();
  Object.defineProperty(throwingTopLevel, "repository", {
    enumerable: true,
    get() {
      throw new Error("hostile repository getter");
    },
  });
  expectContainment(proof.buildRequiredCheckProtectionProof(throwingTopLevel));

  const throwingNested = proposal();
  Object.defineProperty(throwingNested.workflow as Record<string, unknown>, "sha256", {
    enumerable: true,
    get() {
      throw new Error("hostile workflow getter");
    },
  });
  expectContainment(proof.buildRequiredCheckProtectionProof(throwingNested));

  const nestedExtra = proposal();
  (nestedExtra.protected_aggregate as Record<string, unknown>).extra = "not allowed";
  expectContainment(proof.buildRequiredCheckProtectionProof(nestedExtra));

  const revocable = Proxy.revocable(proposal(), {});
  revocable.revoke();
  expectContainment(proof.buildRequiredCheckProtectionProof(revocable.proxy));
});
