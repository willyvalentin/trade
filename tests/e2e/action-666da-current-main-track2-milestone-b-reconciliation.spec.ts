import { expect, test } from "@playwright/test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";

const repositoryRoot = path.resolve(__dirname, "../..");
const evidencePath =
  "docs/evidence/action-666da-current-main-track2-milestone-b-reconciliation.json";
const evidenceSha256 =
  "6611d6d560dfca8a2d2118c526cf353ffd52fac1bb5892914665deb9d6dd46fe";
const actionPath =
  "docs/action-666da-current-main-track2-milestone-b-reconciliation.md";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath =
  "scripts/action-660j-provider-free-ci-registration.json";
const thisTest =
  "tests/e2e/action-666da-current-main-track2-milestone-b-reconciliation.spec.ts";

const expectedEvidence = {
  contract_version:
    "trade.action666da.current-main-track2-milestone-b-reconciliation.v1",
  observed_at: "2026-08-19T19:31:54Z",
  authority: {
    repository: "willyvalentin/trade",
    main_commit: "e9c3355125a54f4f9ba55ada2ac55fc91b184647",
    main_tree: "3037abfe27899bcd2c9abea215c80c459a7213b5",
    main_parents: [
      "7280f5a6a7317f495dd8ffccdd8df609203026f5",
      "7892bced03d4defa7a30485387a0a86953b416f5",
    ],
    main_pull_request: 119,
    exact_main_ci_run: 32290740230,
    exact_main_ci_conclusion: "success",
    github_deployments: [],
  },
  post_ma13_delivery_chain: [
    {
      pull_request: 114,
      action: "660I",
      head: "246a2022d7b36f71c836920a85278eecb49c06f7",
      merge: "981bb474ebe5466f92d671ef489a1f3a82d3bcba",
      exact_main_ci_run: 32080009340,
    },
    {
      pull_request: 115,
      action: "666CW",
      head: "e86f2d7bd6a4ff8674fdad8e4d9d01e04e4a71b4",
      merge: "960b88f85f3ad7be10c4b848c40127d63a21390b",
      exact_main_ci_run: 32196042641,
    },
    {
      pull_request: 116,
      action: "660J",
      head: "499bc21ade91d2d0dcf03927183415b383d716ef",
      merge: "b9f894e92cc41d9d00ef625fe3bd987e495d6445",
      exact_main_ci_run: 32252186236,
    },
    {
      pull_request: 117,
      action: "666CX",
      head: "69ad10078a2f5a987c7a8df410d233e25bbe5e18",
      merge: "377b87d344ddb48d73c725b348d1dcb4c0943fd1",
      exact_main_ci_run: 32261552249,
    },
    {
      pull_request: 118,
      action: "666CY",
      head: "2d378bd96123470c5f0bf4ca2d991a032be06ff3",
      merge: "7280f5a6a7317f495dd8ffccdd8df609203026f5",
      exact_main_ci_run: 32277517623,
    },
    {
      pull_request: 119,
      action: "666CZ",
      head: "7892bced03d4defa7a30485387a0a86953b416f5",
      merge: "e9c3355125a54f4f9ba55ada2ac55fc91b184647",
      exact_main_ci_run: 32290740230,
    },
  ],
  milestone_a: {
    verified_gates: 15,
    total_gates: 15,
    percentage: 100,
    classification: "complete_secure_advisory_product",
    reopened_by_candidate: false,
  },
  track_2: {
    delivered_current_main_actions: [
      "666CJ",
      "666CK",
      "666CL",
      "666CM",
      "666CN",
      "666CO",
      "666CP",
      "666CQ",
      "666CS",
      "666CT",
      "666CU",
      "666CV",
      "666CW",
      "666CX",
      "666CY",
      "666CZ",
    ],
    previous_open_objective:
      "current_main_integrity_provenance_separated_observation_authority_successor",
    previous_open_objective_satisfied_by: "666CW",
    hardening_successors: ["666CX", "666CY", "666CZ"],
    classification_after_delivery: "source_foundation_complete_holding",
    default_off: true,
    runtime_unwired: true,
    production_authority: false,
  },
  milestone_b: {
    classification: "planning_activated_runtime_closed",
    delivered_foundation_pull_request: 84,
    delivered_foundation_action: "655G",
    delivered_foundation_merge:
      "3b7ecfa55e90414f90a3d34952719f69be20f911",
    next_bounded_objective:
      "current_main_position_version_schema_reconciliation",
    blocking_dependencies: [
      "position_version_schema",
      "market_observation_provenance",
      "durable_exit_queue_schema",
      "transactional_recommendation_position_handoff",
    ],
    runtime_activation_authorized: false,
    database_migration_authorized: false,
    broker_or_execution_authority: false,
  },
  production_boundary: {
    latest_verified_commit: "f463644ddeb7f49fa8b80924d9103ea8970ccae4",
    production_is_first_parent_ancestor_of_main: true,
    production_equals_main: false,
    production_deployment_authorized: false,
    operator_initiated_provider_mutation_performed: false,
  },
  candidate_canonicalization_conditions: {
    exact_head_ci_success: false,
    independent_read_only_review_no_blocking_findings: false,
    explicit_operator_approval_of_pr_and_exact_head: false,
    ordinary_protected_pr_merge_verified: false,
    exact_reviewed_scope_merged: false,
    exact_main_ci_success: false,
    all_satisfied: false,
  },
  source_document_sha256: {
    [actionPath]:
      "0530ac283c90359b66d873d88e4d263d56f0ccccf48f7d178f666fa98a615d19",
    [ledgerPath]:
      "b565e8d0b5d3dd4840abbb7a7f1f3f4f658cc11e1f66d07541e2645dd5b343c8",
    [roadmapPath]:
      "ba10a148d90b3b77b0fedc62055725585e9b627777d9daa8ab746b3f7ff9346f",
  },
  scope_limits: {
    governance_and_planning_only: true,
    application_source_mutation: false,
    runtime_mutation: false,
    database_or_supabase_mutation: false,
    provider_configuration_or_data_mutation: false,
    production_deployment: false,
    broker_or_execution_authority: false,
    training_or_promotion_authority: false,
  },
};

async function source(relativePath: string) {
  return readFile(path.join(repositoryRoot, relativePath), "utf8");
}

function validateEvidence(value: unknown) {
  assert.deepStrictEqual(value, expectedEvidence);
}

type PathSegment = string | number;

function targetAt(root: unknown, pathSegments: PathSegment[]) {
  let target = root;
  for (const segment of pathSegments) {
    target = (target as Record<PathSegment, unknown>)[segment];
  }
  return target;
}

function collectPaths(value: unknown, parent: PathSegment[] = []) {
  const paths: PathSegment[][] = [];
  if (!value || typeof value !== "object") {
    return paths;
  }
  for (const key of Object.keys(value)) {
    const segment = Array.isArray(value) ? Number(key) : key;
    const childPath = [...parent, segment];
    paths.push(childPath);
    paths.push(...collectPaths(targetAt(value, [segment]), childPath));
  }
  return paths;
}

test("binds exact current main, Track 2 closure and Milestone B planning", async () => {
  const rawEvidence = await source(evidencePath);
  expect(createHash("sha256").update(rawEvidence).digest("hex")).toBe(
    evidenceSha256,
  );
  expect(() => validateEvidence(JSON.parse(rawEvidence))).not.toThrow();

  expect(expectedEvidence.milestone_a).toMatchObject({
    verified_gates: 15,
    total_gates: 15,
    reopened_by_candidate: false,
  });
  expect(expectedEvidence.track_2.classification_after_delivery).toBe(
    "source_foundation_complete_holding",
  );
  expect(expectedEvidence.milestone_b.next_bounded_objective).toBe(
    "current_main_position_version_schema_reconciliation",
  );
  expect(expectedEvidence.milestone_b.runtime_activation_authorized).toBe(
    false,
  );
});

test("pins the live roadmap, ledger, action and provider-free registration", async () => {
  const documents = await Promise.all(
    Object.keys(expectedEvidence.source_document_sha256).map(async (file) => [
      file,
      await source(file),
    ] as const),
  );
  for (const [file, text] of documents) {
    expect(createHash("sha256").update(text).digest("hex")).toBe(
      expectedEvidence.source_document_sha256[
        file as keyof typeof expectedEvidence.source_document_sha256
      ],
    );
  }

  const [action, roadmap, ledger, registration] = await Promise.all([
    source(actionPath),
    source(roadmapPath),
    source(ledgerPath),
    source(registrationPath),
  ]);
  for (const text of [action, roadmap, ledger]) {
    expect(text).toContain("e9c3355125a54f4f9ba55ada2ac55fc91b184647");
    expect(text).toContain("position_version_schema");
    expect(text).toContain("runtime-unwired");
    expect(text).not.toMatch(
      /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/i,
    );
  }
  expect(roadmap).toContain("15 of 15 required gates verified (100%)");
  expect(ledger).toContain("15/15 = 100%");
  expect(action).toContain("Production deployment is not authorized.");

  const registeredTests = JSON.parse(registration) as string[];
  expect(registeredTests.filter((file) => file === thisTest)).toEqual([
    thisTest,
  ]);
});

test("rejects deletion, value, shape and extra-key drift recursively", async () => {
  const paths = collectPaths(expectedEvidence);
  expect(paths.length).toBeGreaterThan(100);

  for (const pathSegments of paths) {
    const deleted = structuredClone(expectedEvidence) as unknown;
    const parent = targetAt(deleted, pathSegments.slice(0, -1)) as Record<
      PathSegment,
      unknown
    >;
    delete parent[pathSegments.at(-1) as PathSegment];
    expect(() => validateEvidence(deleted)).toThrow();
  }

  const primitivePaths = paths.filter((pathSegments) => {
    const value = targetAt(expectedEvidence, pathSegments);
    return value === null || typeof value !== "object";
  });
  for (const pathSegments of primitivePaths) {
    const changed = structuredClone(expectedEvidence) as unknown;
    const parent = targetAt(changed, pathSegments.slice(0, -1)) as Record<
      PathSegment,
      unknown
    >;
    const key = pathSegments.at(-1) as PathSegment;
    const current = parent[key];
    parent[key] = typeof current === "boolean" ? !current : "unexpected-drift";
    expect(() => validateEvidence(changed)).toThrow();
  }

  const extra = structuredClone(expectedEvidence) as Record<string, unknown>;
  extra.unexpected = true;
  expect(() => validateEvidence(extra)).toThrow();
});
