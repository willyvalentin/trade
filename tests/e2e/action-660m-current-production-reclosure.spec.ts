import { expect, test } from "@playwright/test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";

const repositoryRoot = path.resolve(__dirname, "../..");
const actionPath = "docs/action-660m-current-production-reclosure.md";
const evidencePath =
  "docs/evidence/action-660m-current-production-reclosure.json";
const ledgerPath = "docs/ture-current-state-ledger.md";
const roadmapPath = "docs/ture-master-roadmap.md";
const registrationPath =
  "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const workflowPath = ".github/workflows/milestone-a-ci.yml";
const thisTest =
  "tests/e2e/action-660m-current-production-reclosure.spec.ts";
const historicalSourceCommit =
  "dbeed25f2074bff4dba8cee7f6d511cb17992efc";
const actionSha256 =
  "160f9b11f00a7170dc961a9932326ee2925ae84ae080a76cd165e3b25a3c243e";
const evidenceSha256 =
  "7aaecde7a9d88e82a9dbaad8fdf6838be5192469f6597db1c32d3908f6eb8613";

async function source(relativePath: string) {
  return readFile(path.join(repositoryRoot, relativePath), "utf8");
}

function historicalSource(relativePath: string) {
  return execFileSync(
    "git",
    ["show", `${historicalSourceCommit}:${relativePath}`],
    { cwd: repositoryRoot, encoding: "utf8" },
  );
}

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function expectedEvidence() {
  return {
    contract_version: "action_660m_current_production_reclosure_v1",
    observed_at: "2026-08-20T16:19:28Z",
    authority: {
      repository: "willyvalentin/trade",
      protected_main_commit:
        "dbeed25f2074bff4dba8cee7f6d511cb17992efc",
      protected_main_tree:
        "c444a51272dce1842554ff888642d8ef000aab24",
      protected_main_parents: [
        "6ef40e52eb7139e1e8c238f8a1d44385c0d1cf8a",
        "08321f53371228737e7abd60a22b54c1c2c9ad98",
      ],
      main_pull_request: 125,
      exact_main_ci_run: 32386472091,
      required_check: "provider-free-verification",
      required_check_app_id: 15368,
      operator_explicitly_authorized_production_publication: true,
    },
    previous_published_release: {
      deploy_id: "6a7c862f34b2da0008e2f4c2",
      commit: "0318046d6e0350694b07ab4f35c491841d3e723b",
      published_at: "2026-08-12T14:43:38.127Z",
      historical_last_verified_deploy_id: "6a7b9e45ceb7e100087c55fa",
      historical_last_verified_commit:
        "f463644ddeb7f49fa8b80924d9103ea8970ccae4",
      historical_ma15_currentness_superseded_by_later_publish: true,
    },
    production_release: {
      site: "trade-vl",
      deploy_id: "6a871d6b27fb2100082f16f9",
      commit: "dbeed25f2074bff4dba8cee7f6d511cb17992efc",
      published_at: "2026-08-20T16:10:09.766Z",
      state: "ready",
      context: "production",
      branch: "main",
      locked: true,
      plugin_state: "success",
      error_message: null,
      secrets_scan_findings: 0,
      enhanced_secrets_scan_findings: 0,
      existing_atomic_deploy_published_without_rebuild: true,
      netlify_github_commit_identity_exact: true,
      production_equals_protected_main_at_publication: true,
    },
    release_delta: {
      from_commit: "0318046d6e0350694b07ab4f35c491841d3e723b",
      to_commit: "dbeed25f2074bff4dba8cee7f6d511cb17992efc",
      commit_count: 98,
      changed_path_count: 148,
      path_categories: {
        github_workflow: 1,
        governance_and_evidence_docs: 69,
        server_only_foundation: 29,
        dependency_manifests: 2,
        ci_scripts: 3,
        tests: 43,
        repository_instruction: 1,
      },
      live_sensitive_paths: [],
      direct_dependency_changes: {
        next: "16.2.6_to_16.3.1",
        eslint_config_next: "16.2.6_to_16.3.1",
      },
    },
    anonymous_smoke: {
      root_status: 307,
      root_location: "/login?next=%2F",
      login_status: 200,
      login_body_sha256:
        "21e25109bc3a8e2c9697236b21507f71cf1e52c6e130fb86466461d10c78dc3f",
      login_matches_candidate_preflight: true,
      login_runtime_error_marker_observed: false,
      runtime_health_status: 200,
      runtime_health_ok: true,
      runtime_health_all_no_effect_flags_false: true,
      environment_boundary_status: 200,
      environment_boundary_ok: true,
      route_publication_status: 200,
      route_publication_ok: true,
      route_publication_all_no_effect_flags_false: true,
      anonymous_dashboard_status: 401,
      anonymous_dashboard_no_store: true,
    },
    authenticated_smoke: {
      operator_attested_authenticated_smoke: true,
      operator_attested_pages: [
        "dashboard",
        "execution_records",
        "settings",
      ],
      agent_independent_browser_verification: false,
      agent_browser_limitation:
        "admin_enforced_browser_policy_unavailable",
      agent_form_submission_performed: false,
      agent_application_mutation_route_called: false,
    },
    milestone_a: {
      ma11_release_identity: "verified_current",
      ma15_production_smoke: "verified_current",
      ma15_reopened_by_later_publish_before_this_action: true,
      ma15_reclosed_by_this_verified_release: true,
      verified_gates: 15,
      required_gates: 15,
      completion_percent: 100,
      milestone_a_complete: true,
    },
    candidate_canonicalization_conditions: {
      draft_quick_ci_observed_green: false,
      ready_exact_head_full_ci_observed_green: false,
      independent_read_only_review_no_blocking_findings: false,
      explicit_operator_approval_of_pr_and_exact_head: false,
      ordinary_protected_pr_merge_verified: false,
      exact_reviewed_scope_merged: false,
      exact_main_ci_observed_green: false,
      all_satisfied: false,
    },
    scope_limits: {
      records_already_completed_production_publication: true,
      production_publication_triggered_by_this_candidate: false,
      documentation_evidence_tests_ci_registration_and_workflow_history_only:
        true,
      provider_free_ci_history_checkout_changed: true,
      automatic_non_production_deploy_preview_observed: true,
      netlify_production_build_or_deploy_triggered_by_this_candidate: false,
      application_source_mutation: false,
      runtime_mutation: false,
      database_or_supabase_mutation: false,
      migration_file_added: false,
      provider_configuration_or_data_mutation: false,
      broker_training_or_promotion_authority: false,
      next_bounded_objective:
        "position_version_schema_migration_design_and_read_only_backfill_preflight",
    },
    source_document_sha256: {
      [actionPath]: actionSha256,
    },
  };
}

type Segment = string | number;

function valueAt(root: unknown, segments: Segment[]) {
  let value = root;
  for (const segment of segments) {
    value = (value as Record<Segment, unknown>)[segment];
  }
  return value;
}

function recursivePaths(value: unknown, parent: Segment[] = []) {
  const paths: Segment[][] = [];
  if (value === null || typeof value !== "object") return paths;
  for (const key of Object.keys(value)) {
    const segment = Array.isArray(value) ? Number(key) : key;
    const pathSegments = [...parent, segment];
    paths.push(pathSegments);
    paths.push(...recursivePaths(valueAt(value, [segment]), pathSegments));
  }
  return paths;
}

test("pins the exact current production release and bounded smoke", async () => {
  const [rawAction, rawEvidence] = await Promise.all([
    source(actionPath),
    source(evidencePath),
  ]);
  expect(sha256(rawAction)).toBe(actionSha256);
  expect(sha256(rawEvidence)).toBe(evidenceSha256);
  expect(() =>
    assert.deepStrictEqual(JSON.parse(rawEvidence), expectedEvidence()),
  ).not.toThrow();
});

test("keeps roadmap and ledger current without rewriting historical evidence", async () => {
  const [ledger, roadmap] = await Promise.all([
    source(ledgerPath),
    source(roadmapPath),
  ]);
  const historicalLedger = historicalSource(ledgerPath);
  const historicalRoadmap = historicalSource(roadmapPath);

  for (const current of [ledger, roadmap]) {
    expect(current).toContain("Action 660M");
    expect(current).toContain(
      "dbeed25f2074bff4dba8cee7f6d511cb17992efc",
    );
    expect(current).toContain("6a871d6b27fb2100082f16f9");
    expect(current).toContain("32386472091");
    expect(current).toContain(
      "position_version_schema_migration_design_and_read_only_backfill_preflight",
    );
    expect(current).toContain("15/15");
    expect(current).not.toMatch(
      /(?:github_pat_|ghp_|postgres(?:ql)?:\/\/|BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY)/i,
    );
  }

  expect(sha256(historicalLedger)).toBe(
    "04491ae74a9360e02dd9301cec418805796d8002ec5affaeceb90c5c28a5130f",
  );
  expect(sha256(historicalRoadmap)).toBe(
    "faf1ef5dcd69bddd4d60cec5a49de6d51c9f4774d71975e584bf3d47b7826b7c",
  );
});

test("registers the reconciliation once in the executable foundation plan", async () => {
  const [registrationRaw, runner, workflow] = await Promise.all([
    source(registrationPath),
    source(runnerPath),
    source(workflowPath),
  ]);
  const registration = JSON.parse(registrationRaw) as string[];
  expect(registration.filter((entry) => entry === thisTest)).toEqual([
    thisTest,
  ]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(runner.split(JSON.stringify(thisTest)).length - 1).toBe(1);
  expect(workflow.split("fetch-depth: 0").length - 1).toBe(2);
  expect(workflow).not.toContain("fetch-depth: 1");
});

test("rejects recursive deletion, value, shape and extra-key drift", async () => {
  const expected = expectedEvidence();
  const validate = (value: unknown) => assert.deepStrictEqual(value, expected);
  const evidence = JSON.parse(await source(evidencePath));
  expect(() => validate(evidence)).not.toThrow();

  const paths = recursivePaths(expected);
  expect(paths.length).toBeGreaterThan(100);
  for (const pathSegments of paths) {
    const candidate = structuredClone(expected) as unknown;
    const parent = valueAt(candidate, pathSegments.slice(0, -1)) as Record<
      Segment,
      unknown
    >;
    delete parent[pathSegments.at(-1) as Segment];
    expect(() => validate(candidate)).toThrow();
  }

  for (const pathSegments of paths.filter((segments) => {
    const value = valueAt(expected, segments);
    return value === null || typeof value !== "object";
  })) {
    const candidate = structuredClone(expected) as unknown;
    const parent = valueAt(candidate, pathSegments.slice(0, -1)) as Record<
      Segment,
      unknown
    >;
    const key = pathSegments.at(-1) as Segment;
    const current = parent[key];
    parent[key] = typeof current === "boolean" ? !current : "unexpected";
    expect(() => validate(candidate)).toThrow();
  }

  const objectPaths = [
    [] as Segment[],
    ...paths.filter((segments) => {
      const value = valueAt(expected, segments);
      return value !== null && typeof value === "object" && !Array.isArray(value);
    }),
  ];
  for (const pathSegments of objectPaths) {
    const candidate = structuredClone(expected) as unknown;
    const target = valueAt(candidate, pathSegments) as Record<string, unknown>;
    target.unexpected = true;
    expect(() => validate(candidate)).toThrow();
  }
});

test("preserves the no-new-deploy and no-runtime scope boundary", async () => {
  const [action, evidence] = await Promise.all([
    source(actionPath),
    source(evidencePath),
  ]);
  for (const text of [action, evidence]) {
    expect(text).not.toMatch(
      /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/i,
    );
    expect(text).not.toMatch(
      /(?:github_pat_|ghp_|postgres(?:ql)?:\/\/|BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY)/i,
    );
  }
  const parsed = JSON.parse(evidence) as ReturnType<typeof expectedEvidence>;
  expect(parsed.scope_limits.production_publication_triggered_by_this_candidate)
    .toBe(false);
  expect(
    parsed.scope_limits.provider_free_ci_history_checkout_changed,
  ).toBe(true);
  expect(
    parsed.scope_limits.netlify_production_build_or_deploy_triggered_by_this_candidate,
  ).toBe(false);
  expect(parsed.scope_limits.runtime_mutation).toBe(false);
  expect(parsed.scope_limits.database_or_supabase_mutation).toBe(false);
  expect(parsed.candidate_canonicalization_conditions.all_satisfied).toBe(false);
});
