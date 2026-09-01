import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const contractPath = "docs/rel-00-ci-b1-change-classification-contract.md";
const evidencePath =
  "docs/evidence/rel-00-ci-b1-change-classification-fixtures.json";
const b0EvidencePath = "docs/evidence/rel-00-ci-b0-baseline-and-admission.json";
const workflowPath = ".github/workflows/milestone-a-ci.yml";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const planPath = "tests/e2e/action-660j-parallel-provider-free-verification.spec.ts";
const classifierPath = "scripts/rel-00-ci-b1-change-classifier.mjs";
const thisTest = "tests/e2e/rel-00-ci-b1-change-classification.spec.ts";

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

type ClassifierRuntime = {
  parseNameStatusZ: (input: Uint8Array) => Array<Record<string, unknown>>;
  classifyChangeSet: (records: unknown[]) => Record<string, unknown>;
  classifyChangeRecord: (record: unknown) => Record<string, unknown>;
};

let classifier: ClassifierRuntime;

const evidence = JSON.parse(source(evidencePath));

function encodeNulTokens(tokens: string[]) {
  return new TextEncoder().encode(`${tokens.join("\u0000")}\u0000`);
}

test.beforeAll(async () => {
  classifier = (await import(
    pathToFileURL(resolve(root, classifierPath)).href,
  )) as ClassifierRuntime;
});

test("REL-00 CI-B1 is source-only and preserves the protected Full-CI contract", () => {
  const contract = source(contractPath);
  const workflow = source(workflowPath);
  const b0Evidence = JSON.parse(source(b0EvidencePath));
  const registration = JSON.parse(source(registrationPath)) as string[];
  const classifierSource = source(classifierPath);

  expect(evidence).toMatchObject({
    contract_version: "trade.rel00.ci-b1.change-classification.v1",
    workstream: "REL-00",
    substage: "CI-B1",
    status: "source_only_not_activated",
    baseline: {
      protected_main_commit: "8127c4d294a36d0e442fa1b10df451f15cdf0c28",
      protected_main_tree: "399b03831c5a2de9c5121e29603e6aeb79747505",
      ci_b0_exact_main_run_id: 33535472128,
      ci_b0_post_merge_provenance: "matched",
      workflow_path: workflowPath,
      workflow_sha256:
        "f41f286a04b0027438aa328afe118ab6a0b8287c609807fc919c9a8ab6cf7bb5",
      protected_check: "provider-free-verification",
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
    taxonomy: {
      effective_tier_in_ci_b1: 3,
      fast_path_eligible: false,
    },
  });
  expect(evidence.baseline.full_shards).toEqual([
    "foundation",
    "replay-lineage",
    "snapshot-admission",
    "snapshot-issuance",
    "non-forgeable-authority",
    "lossless-scalar",
  ]);
  expect(b0Evidence.transition_status).toMatchObject({
    ci_b0_baseline_and_charter: "verified_on_exact_main",
    ci_b1_through_ci_b6: "in_progress",
  });
  expect(contract).toContain("does not read Git state, the filesystem");
  expect(contract).toContain("The implementation is deliberately unactivated");
  expect(contract).toContain("CI-B7 decision");

  expect(workflow).toContain("name: draft-provider-free-verification");
  expect(workflow).toContain("name: provider-free-verification");
  expect(workflow).toContain("github.event.pull_request.draft == false");
  expect(workflow).toContain("github.event_name == 'push'");
  for (const shard of evidence.baseline.full_shards) {
    expect(workflow).toContain(`- ${shard}`);
  }

  expect(classifierSource).not.toMatch(
    /(?:from\s+["']node:|require\s*\(|\bfs\b|\bchild_process\b|process\.env|\bfetch\s*\(|\bspawn\w*\b)/,
  );
  expect(classifierSource).not.toMatch(
    /(?:skip_ci|full_ci_exempt|merge_authority)/,
  );
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
  expect(source(planPath).match(new RegExp(thisTest, "g")) ?? []).toHaveLength(1);
});

test("REL-00 CI-B1 parses NUL-safe status records and rejects malformed input", () => {
  expect(classifier.parseNameStatusZ(new Uint8Array())).toEqual([]);

  for (const fixture of evidence.parser_fixtures) {
    const parsed = classifier.parseNameStatusZ(encodeNulTokens(fixture.tokens));
    expect(parsed).toHaveLength(1);
    expect(parsed[0]).toMatchObject(fixture.expected);
    expect(parsed[0]).toMatchObject({
      old_mode: null,
      new_mode: null,
      content_kind: "unknown",
      metadata_verified: false,
      reference_verified: false,
      import_graph_verified: false,
      owned_test_mapping_verified: false,
    });
  }

  const rawModifiedDocumentation = classifier.parseNameStatusZ(
    encodeNulTokens(["M", "docs/guide.md"]),
  );
  expect(classifier.classifyChangeSet(rawModifiedDocumentation)).toMatchObject({
    classes: ["unsafe_metadata", "documentation_evidence"],
    candidate_tier: "tier_3_required",
    effective_disposition: "broad_containment",
    candidate_action_ids: ["baseline", "browser_server_containment"],
    effective_tier: 3,
    fast_path_eligible: false,
  });

  for (const tokens of [
    ["R100", "docs/guide.md", "docs/guide-renamed.md"],
    ["C100", "docs/guide.md", "docs/guide-copy.md"],
  ]) {
    expect(
      classifier.classifyChangeSet(classifier.parseNameStatusZ(encodeNulTokens(tokens))),
    ).toMatchObject({
      classes: ["unsafe_metadata", "documentation_evidence"],
      candidate_tier: "tier_3_required",
      effective_disposition: "broad_containment",
      candidate_action_ids: ["baseline", "browser_server_containment"],
      effective_tier: 3,
      fast_path_eligible: false,
    });
  }

  expect(() =>
    classifier.parseNameStatusZ(new TextEncoder().encode("M\u0000docs/guide.md")),
  ).toThrow(/fail-closed classification error/);
  expect(() => classifier.parseNameStatusZ(encodeNulTokens(["Q", "docs/a.md"]))).toThrow(
    /fail-closed classification error/,
  );
  expect(() => classifier.parseNameStatusZ(encodeNulTokens(["R100", "docs/a.md"]))).toThrow(
    /fail-closed classification error/,
  );
  expect(() => classifier.parseNameStatusZ(encodeNulTokens(["M", "../escape.md"]))).toThrow(
    /fail-closed classification error/,
  );
});

test("REL-00 CI-B1 keeps every fixture at effective Tier 3 and never activates a fast path", () => {
  for (const fixture of evidence.fixtures) {
    const actual = classifier.classifyChangeSet(fixture.records);
    const reversed = classifier.classifyChangeSet([...fixture.records].reverse());

    expect(actual).toMatchObject({
      ...fixture.expected,
      effective_tier: 3,
      manual_review_required: true,
      fast_path_eligible: false,
      activation_eligible: false,
    });
    expect(reversed).toEqual(actual);
  }
});

test("REL-00 CI-B1 refuses invalid direct record metadata", () => {
  expect(() =>
    classifier.classifyChangeRecord({
      status: "M",
      old_path: "docs/a.md",
      new_path: "docs/a.md",
      old_mode: null,
      new_mode: null,
      content_kind: "unknown",
      metadata_verified: "not-a-boolean",
    }),
  ).toThrow(/fail-closed classification error/);
  expect(() =>
    classifier.classifyChangeRecord({
      status: "A",
      old_path: null,
      new_path: "docs/guide.md",
      old_mode: "100644",
      new_mode: "100644",
      content_kind: "text",
      metadata_verified: true,
      reference_verified: true,
    }),
  ).toThrow(/fail-closed classification error/);
  expect(() =>
    classifier.classifyChangeRecord({
      status: "D",
      old_path: "docs/guide.md",
      new_path: null,
      old_mode: "100644",
      new_mode: "100644",
      content_kind: "text",
      metadata_verified: true,
    }),
  ).toThrow(/fail-closed classification error/);
  expect(() =>
    classifier.classifyChangeRecord({
      status: "M",
      old_path: "docs/a.md",
      new_path: "docs/a.md",
      old_mode: null,
      new_mode: null,
      content_kind: "unknown",
      metadata_verified: true,
      unexpected: "ignored-is-not-authority",
    }),
  ).not.toThrow();
});
