import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";

import { expect, test } from "@playwright/test";

const docPath = "docs/action-410-mapped-only-pattern-discovery-static-shadow-execution-approval-gate.md";
const verifierPath = "scripts/action-410-mapped-only-pattern-discovery-static-shadow-execution-approval-gate-verify.mjs";

type Action410Report = Readonly<{
  verification_status: string;
  approval_decision: string;
  approval_vocabulary: readonly string[];
  shadow_decision_vocabulary: readonly string[];
  checks: Readonly<Record<string, boolean>>;
  failed_checks: readonly string[];
  passed_conditions_count: number;
  failed_conditions_count: number;
  unresolved_conditions: readonly string[];
  action409_result: Readonly<{
    readiness_decision: string | null;
    failed_conditions_count: number | null;
    unresolved_conditions: readonly string[] | null;
    lint_result: Readonly<{ passed: boolean; error_count: number | null; warning_count: number | null }> | null;
  }>;
  eligible_case_ids: readonly string[];
  excluded_policy: Readonly<Record<string, boolean>>;
  row_inventory: readonly Readonly<{
    case_id: string;
    canonical_mapper_input_sha256: string;
    mapper_row_id: string;
    canonical_row_sha256: string;
  }>[];
  duplicate_inventory: Readonly<{
    case_support_count: number;
    unique_mapper_row_count: number;
    shared_mapper_row_id_count: number;
    expected_warning_code: string;
  }>;
  protected_hashes: Readonly<Record<string, Readonly<{ expected: string; actual: string | null; unchanged: boolean }>>>;
  semantic_hashes: Readonly<{
    evidence_set_sha256: string;
    group_sha256: string;
    expected_result_sha256: string;
  }>;
  configuration_contract: Readonly<{
    grouping_dimension: string;
    grouping_key_version: string;
    minimum_case_support: number;
    minimum_completed_outcomes: number;
    integer_scale: number;
    output_precision: number;
    static_only: boolean;
    non_authoritative: boolean;
    no_persistence: boolean;
    no_replay: boolean;
    no_runtime: boolean;
    no_feedback: boolean;
  }>;
  expected_result_contract: Readonly<{
    group_key: string;
    group_count: number;
    status: string;
    group_status: string;
    insight_count: number;
    case_support_count: number;
    unique_mapper_row_count: number;
    completed_outcome_count: number;
    positive_count: number;
    negative_count: number;
    neutral_count: number;
    warning_code: string;
    non_authoritative: boolean;
  }>;
  manifest_boundary: Readonly<{ approved_path: string; exists_now: boolean; full_rows_allowed: boolean }>;
  runner_boundary: Readonly<{ approved_path: string; exists_now: boolean; exactly_two_runs_required: boolean; third_run_allowed: boolean }>;
  evidence_boundary: Readonly<{ metadata_only: boolean; full_rows_allowed: boolean; full_insights_allowed: boolean; authoritative_data_created: boolean }>;
  temp_path_policy: Readonly<{
    required_path_suffix: string;
    outside_repository: boolean;
    target_symlink_now: boolean;
    parent_chain_symlink_allowed: boolean;
    parent_chain_symlink_observed_now: boolean;
    traversal_allowed: boolean;
    non_empty_existing_directory_allowed: boolean;
    cleanup_required: boolean;
  }>;
  isolation: Readonly<{
    future_package_files_present: readonly string[];
    downstream_runner_or_manifest_files: readonly string[];
    shadow_evidence_present: readonly string[];
    runtime_markers: readonly string[];
    production_consumer_files: readonly string[];
    action410_runtime_call_markers: readonly string[];
  }>;
  no_effect_flags: Readonly<Record<string, boolean>>;
  runtime_preview_status: string;
  source_integrity_result: string;
  unrelated_work_classification: string;
  recommended_next_action: string;
}>;

const expectedCases = [
  "expanded_valid_bearish_risk_context",
  "expanded_valid_fda_event_context",
  "expanded_valid_future_event_excluded",
  "expanded_valid_identity_nfc_equivalent",
  "expanded_valid_identity_percent_encoding",
  "expanded_valid_sec_event_context",
  "valid_complete_mapping",
  "valid_equivalent_aliases",
  "valid_normalized_confidence",
  "valid_rich_context",
];
const expectedAction411PackagePaths = [
  "docs/action-411-mapped-only-pattern-discovery-static-shadow-input-manifest.json",
  "docs/action-411-mapped-only-pattern-discovery-static-shadow-use.md",
  "scripts/action-411-mapped-only-pattern-discovery-static-shadow-run.mjs",
  "scripts/action-411-mapped-only-pattern-discovery-static-shadow-use-verify.mjs",
  "tests/e2e/action-411-mapped-only-pattern-discovery-static-shadow-use.spec.ts",
];

let report: Action410Report;

function read(path: string): string {
  return readFileSync(path, "utf8");
}

function runVerifier(): Action410Report {
  return JSON.parse(execFileSync("node", [verifierPath], { encoding: "utf8", timeout: 240_000 })) as Action410Report;
}

test.describe.serial("Action 410 mapped-only Pattern Discovery static shadow execution approval gate", () => {
  test.setTimeout(300_000);

  test.beforeAll(() => {
    report = runVerifier();
  });

  test("documentation contract covers the approval gate", () => {
    const doc = read(docPath);
    for (const section of [
      "Purpose",
      "Scope",
      "Authoritative Dependencies",
      "Action 409 Ready Result",
      "Protected-Source Inventory",
      "Eligible-Case Inventory",
      "Excluded-Case Policy",
      "Row-Reconstruction Policy",
      "Row-Lineage Contract",
      "Frozen Mapper-Row Inventory",
      "Duplicate-Cluster Inventory",
      "Pattern Discovery Configuration",
      "Future Manifest Contract",
      "Future Runner Contract",
      "Metadata-Only Evidence Contract",
      "Temporary Filesystem Policy",
      "Stop Conditions",
      "Approval Decision",
      "Next Permitted Action",
    ]) {
      expect(doc).toContain(`## ${section}`);
    }
    expect(report.checks.documentation_contract_complete).toBe(true);
  });

  test("approval decision and Action 409 readiness are exact", () => {
    expect(report.verification_status).toBe("passed");
    expect(report.approval_vocabulary).toEqual(["approved", "approved_with_conditions", "blocked"]);
    expect(report.approval_decision).toBe("approved");
    expect(report.action409_result.readiness_decision).toBe("ready");
    expect(report.action409_result.failed_conditions_count).toBe(0);
    expect(report.action409_result.unresolved_conditions).toEqual([]);
    expect(report.action409_result.lint_result?.passed).toBe(true);
    expect(report.action409_result.lint_result?.error_count).toBe(0);
  });

  test("exact eligible cases and excluded statuses are frozen", () => {
    expect(report.checks.eligible_cases_exact).toBe(true);
    expect(report.eligible_case_ids).toEqual(expectedCases);
    expect(report.checks.excluded_case_policy_exact).toBe(true);
    expect(report.excluded_policy).toMatchObject({
      blocked_statuses_excluded: true,
      mapped_with_missing_optional_data_excluded: true,
      automatic_discovery_allowed: false,
      case_substitution_allowed: false,
    });
  });

  test("protected hashes row IDs and row hashes are frozen", () => {
    expect(report.checks.protected_hashes_unchanged).toBe(true);
    expect(report.source_integrity_result).toBe("unchanged");
    expect(Object.values(report.protected_hashes).every((entry) => entry.unchanged)).toBe(true);
    expect(report.protected_hashes["lib/pure-pattern-discovery.ts"].actual).toBe("48b7667c8690a1d8d56b819a3727e37ea73af7710a45131eb3debab48627191c");
    expect(report.protected_hashes["lib/snapshot-to-learning-dataset-mapper.ts"].actual).toBe("7294a851ede33aadc0dbfcb68c13337cd244002b84be7cbbe40abbe91673741d");
    expect(report.row_inventory).toHaveLength(10);
    expect(report.row_inventory.map((row) => row.case_id)).toEqual(expectedCases);
    expect(report.row_inventory[0].canonical_row_sha256).toBe("c541b7c12b4c93d30238d328907320f415a6593646c04b7ad9a9f117b879bf10");
    expect(report.row_inventory[6].canonical_mapper_input_sha256).toBe("3b88963b293bb6212cc37c474d4fd21560cb99cb7edb9ee581ab24659aa79eda");
  });

  test("duplicate cluster and frozen configuration are exact", () => {
    expect(report.duplicate_inventory).toEqual({
      case_support_count: 10,
      unique_mapper_row_count: 3,
      shared_mapper_row_id_count: 8,
      expected_warning_code: "duplicate_mapper_row_identity",
    });
    expect(report.configuration_contract).toMatchObject({
      grouping_dimension: "setup_family",
      grouping_key_version: "v1",
      minimum_case_support: 20,
      minimum_completed_outcomes: 20,
      integer_scale: 1000000,
      output_precision: 4,
      static_only: true,
      non_authoritative: true,
      no_persistence: true,
      no_replay: true,
      no_runtime: true,
      no_feedback: true,
    });
  });

  test("exact group key counts warning hashes and insufficient-evidence result are frozen", () => {
    expect(report.expected_result_contract).toEqual({
      group_key: "pattern_group:v1|setup_family=momentum_continuation",
      group_count: 1,
      status: "insufficient_evidence",
      group_status: "insufficient_evidence",
      insight_count: 0,
      case_support_count: 10,
      unique_mapper_row_count: 3,
      completed_outcome_count: 10,
      positive_count: 10,
      negative_count: 0,
      neutral_count: 0,
      warning_code: "duplicate_mapper_row_identity",
      non_authoritative: true,
    });
    expect(report.semantic_hashes.evidence_set_sha256).toBe("f1f0053264c85d640d46b61da0ce7120e491309e3070132fe74a69a68438cbd8");
    expect(report.semantic_hashes.group_sha256).toBe("aa2ae3f39146ce1c6fc1f6ed73e19e96b02b7866b34e75b61c471a8277a1122e");
    expect(report.semantic_hashes.expected_result_sha256).toBe("e911709a784159c684a350de490fd56446ee23c23b3bf5ea2fbb70378ebf253c");
  });

  test("manifest and runner boundaries approve only Action 411 paths", () => {
    expect(report.checks.manifest_boundary_exact).toBe(true);
    expect(report.checks.runner_boundary_exact).toBe(true);
    expect(report.manifest_boundary.approved_path).toBe("docs/action-411-mapped-only-pattern-discovery-static-shadow-input-manifest.json");
    expect(report.runner_boundary.approved_path).toBe("scripts/action-411-mapped-only-pattern-discovery-static-shadow-run.mjs");
    expect(report.manifest_boundary.exists_now).toBe(true);
    expect(report.runner_boundary.exists_now).toBe(true);
    expect(report.manifest_boundary.full_rows_allowed).toBe(false);
    expect(report.runner_boundary.exactly_two_runs_required).toBe(true);
    expect(report.runner_boundary.third_run_allowed).toBe(false);
  });

  test("metadata-only evidence temp path policy and symlink/path rejection are frozen", () => {
    expect(report.checks.metadata_evidence_limit_exact).toBe(true);
    expect(report.evidence_boundary).toMatchObject({
      metadata_only: true,
      full_rows_allowed: false,
      full_insights_allowed: false,
      authoritative_data_created: false,
    });
    expect(report.temp_path_policy.required_path_suffix).toBe("ture/action-411-mapped-only-pattern-discovery-shadow");
    expect(report.temp_path_policy.outside_repository).toBe(true);
    expect(report.temp_path_policy.target_symlink_now).toBe(false);
    expect(report.temp_path_policy.parent_chain_symlink_allowed).toBe(false);
    expect(typeof report.temp_path_policy.parent_chain_symlink_observed_now).toBe("boolean");
    expect(report.temp_path_policy.traversal_allowed).toBe(false);
    expect(report.temp_path_policy.non_empty_existing_directory_allowed).toBe(false);
    expect(report.temp_path_policy.cleanup_required).toBe(true);
  });

  test("exactly two runs stop conditions and decision vocabulary are frozen", () => {
    expect(report.checks.exactly_two_runs_required).toBe(true);
    expect(report.shadow_decision_vocabulary).toEqual([
      "shadow_passed",
      "shadow_passed_with_conditions",
      "shadow_failed",
      "shadow_aborted",
    ]);
    expect(report.checks.stop_conditions_exact).toBe(true);
    expect(read(docPath)).toContain("No third repair run");
    expect(read(docPath)).toContain("No same-Action remediation after execution failure");
  });

  test("only exact Action 411 package shadow evidence runtime provider Supabase or feedback exists", () => {
    expect(report.checks.action411_package_boundary_exact).toBe(true);
    expect(report.checks.no_shadow_evidence_exists).toBe(true);
    expect(report.checks.no_action410_shadow_or_mapper_execution).toBe(true);
    expect(report.checks.no_runtime_or_production_consumer).toBe(true);
    expect([...report.isolation.future_package_files_present].sort()).toEqual(expectedAction411PackagePaths);
    expect([...report.isolation.downstream_runner_or_manifest_files].sort()).toEqual(expectedAction411PackagePaths);
    expect(report.isolation.shadow_evidence_present).toEqual([]);
    expect(report.isolation.runtime_markers).toEqual([]);
    expect(report.isolation.production_consumer_files).toEqual([]);
    expect(report.isolation.action410_runtime_call_markers).toEqual([]);
    for (const value of Object.values(report.no_effect_flags)) {
      expect(value).toBe(false);
    }
  });

  test("Actions 408 and 409 remain healthy and verifier succeeds", () => {
    expect(report.checks.action408_and_action409_healthy).toBe(true);
    expect(report.failed_checks).toEqual([]);
    expect(report.failed_conditions_count).toBe(0);
    expect(report.unresolved_conditions).toEqual([]);
    expect(report.passed_conditions_count).toBeGreaterThanOrEqual(25);
    expect(execFileSync("node", ["scripts/action-408-pure-pattern-discovery-test-lint-remediation-verify.mjs"], { encoding: "utf8" })).toContain('"verification_status": "passed"');
    expect(execFileSync("node", ["scripts/action-409-independent-post-lint-pattern-discovery-behavioral-and-hash-verification-verify.mjs"], { encoding: "utf8", timeout: 240_000 })).toContain('"verification_status": "passed"');
  });

  test("runtime preview route and candidate remain untouched", () => {
    expect(report.runtime_preview_status).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(report.checks.runtime_preview_paused).toBe(true);
    expect(report.no_effect_flags.runtime_preview_advanced).toBe(false);
    expect(report.unrelated_work_classification).toBe("action_410_docs_scripts_tests_and_minimal_guard_updates_only");
    expect(report.recommended_next_action).toBe("action_411_mapped_only_pattern_discovery_static_shadow_execution");
    expect(existsSync("docs/action-411-mapped-only-pattern-discovery-static-shadow-input-manifest.json")).toBe(true);
    expect(existsSync("scripts/action-411-mapped-only-pattern-discovery-static-shadow-run.mjs")).toBe(true);
  });
});
