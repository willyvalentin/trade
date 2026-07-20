import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";

import { expect, test } from "@playwright/test";

type ProtectedHashEntry = Readonly<{
  expected: string;
  actual: string | null;
  exists: boolean;
  matches: boolean;
}>;

type Action428Report = Readonly<{
  verification_status: string;
  approval_decision: string;
  approval_vocabulary: readonly string[];
  shadow_decision_vocabulary: readonly string[];
  checks: Record<string, boolean>;
  failed_conditions: readonly string[];
  unresolved_conditions: readonly string[];
  passed_conditions_count: number;
  failed_conditions_count: number;
  unresolved_conditions_count: number;
  action427_readiness: Readonly<{
    readiness_decision: string;
    passed_conditions_count: number;
    failed_conditions_count: number;
    unresolved_conditions_count: number;
    unresolved_condition: string;
    closed_by_action428_forward_policy: boolean;
  }>;
  inventory_hash: string;
  expected_inventory_hash: string;
  protected_hashes: Record<string, ProtectedHashEntry>;
  scenario_count: number;
  scenario_ids: readonly string[];
  status_distribution: Record<string, number>;
  warning_distribution: Record<string, number>;
  issue_distribution: Record<string, number>;
  complete_issue_metadata_policy: Readonly<{
    required_fields: readonly string[];
    severity_policy: string;
    messageKey_policy: string;
    path_policy: string;
    deterministic_ordering: boolean;
    deterministic_deduplication: boolean;
    raw_values_allowed: boolean;
    dynamic_text_allowed: boolean;
    secrets_allowed: boolean;
    issue_records: readonly Readonly<{
      scenario_id: string;
      index: number;
      code: string;
      path: string;
      severity: string;
      messageKey: string;
    }>[];
  }>;
  warning_metadata_policy: Readonly<{
    severity: string;
    messageKey_policy: string;
    raw_values_allowed: boolean;
    dynamic_text_allowed: boolean;
    secrets_allowed: boolean;
  }>;
  future_manifest_path: string;
  future_runner_path: string;
  action429_package_state: string;
  approved_action429_files: readonly string[];
  approved_action429_files_present: readonly string[];
  unapproved_action429_files_present: readonly string[];
  future_artifacts_absent: boolean;
  future_artifacts_present: readonly string[];
  semantic_verification_policy: Readonly<{
    expected_values: boolean;
    semantic_hashes: boolean;
    delta_cap_clamp_overlap_zero: boolean;
  }>;
  metadata_evidence_limits: Readonly<{
    metadata_only: boolean;
    full_output_prohibited: boolean;
    temp_path: string;
  }>;
  repeat_run_and_cleanup: Readonly<{
    exactly_two_runs_required: boolean;
    retry_allowed: boolean;
    third_execution_allowed: boolean;
    cleanup_required: boolean;
    temp_evidence_retained: boolean;
  }>;
  stop_conditions_policy: Readonly<{
    abort_before_execution_on_manifest_hash_source_or_temp_path_failure: boolean;
    fail_after_execution_on_output_hash_distribution_cleanup_or_mutation_failure: boolean;
    same_action_remediation_allowed: boolean;
  }>;
  safety: Record<string, boolean>;
  runtime_preview_status: string;
  unrelated_work_classification: string;
  recommended_next_action: string;
}>;

const docPath = "docs/action-428-static-confidence-calibration-shadow-execution-approval-gate.md";
const verifierPath = "scripts/action-428-static-confidence-calibration-shadow-execution-approval-gate-verify.mjs";
const testPath = "tests/e2e/action-428-static-confidence-calibration-shadow-execution-approval-gate.spec.ts";
const expectedInventoryHash = "875f385a05f58d982baa182350a662db5518e13f8c18557e4697317deb724cc5";
const expectedScenarioIds = Array.from({ length: 45 }, (_, index) => `cc425_${String(index + 1).padStart(2, "0")}`);

test.setTimeout(240000);

function runVerifier(): Action428Report {
  return JSON.parse(execFileSync("node", [verifierPath], { encoding: "utf8", timeout: 240000 })) as Action428Report;
}

test.describe.serial("Action 428 static Confidence Calibration shadow execution approval gate", () => {
  let report: Action428Report;
  let doc: string;

  test.beforeAll(() => {
    report = runVerifier();
    doc = readFileSync(docPath, "utf8");
  });

  test("documents the approval gate and returns approved with no unresolved conditions", () => {
    expect(existsSync(docPath)).toBe(true);
    expect(existsSync(verifierPath)).toBe(true);
    expect(existsSync(testPath)).toBe(true);
    expect(doc).toContain("Action 428 - Static Confidence Calibration Shadow Execution Approval Gate");
    expect(doc).toContain("Approval decision: `approved`");
    expect(report.verification_status).toBe("passed");
    expect(report.approval_decision).toBe("approved");
    expect(report.approval_vocabulary).toEqual(["approved", "approved_with_conditions", "blocked"]);
    expect(report.shadow_decision_vocabulary).toEqual([
      "shadow_passed",
      "shadow_passed_with_conditions",
      "shadow_failed",
      "shadow_aborted",
    ]);
    expect(report.failed_conditions).toEqual([]);
    expect(report.unresolved_conditions).toEqual([]);
    expect(report.failed_conditions_count).toBe(0);
    expect(report.unresolved_conditions_count).toBe(0);
    expect(report.passed_conditions_count).toBeGreaterThanOrEqual(33);
  });

  test("binds Action 427 readiness and closes its metadata condition forward only", () => {
    expect(report.action427_readiness).toEqual({
      readiness_decision: "ready_with_conditions",
      passed_conditions_count: 47,
      failed_conditions_count: 0,
      unresolved_conditions_count: 1,
      unresolved_condition: "issue_severity_and_messageKey_not_retained_in_action_426_bounded_inventory",
      closed_by_action428_forward_policy: true,
    });
    expect(report.checks.action427_decision_bound).toBe(true);
    expect(report.checks.action427_remaining_condition_closed_by_forward_policy).toBe(true);
    expect(doc).toContain("Action 428 resolves that condition for future execution");
    expect(doc).toContain("does not modify Action 426 retroactively");
  });

  test("binds exact Action 426 inventory hash protected hashes and scenario order", () => {
    expect(report.inventory_hash).toBe(expectedInventoryHash);
    expect(report.expected_inventory_hash).toBe(expectedInventoryHash);
    expect(report.scenario_count).toBe(45);
    expect(report.scenario_ids).toEqual(expectedScenarioIds);
    expect(report.checks.exact_inventory_hash_bound).toBe(true);
    expect(report.checks.protected_hashes_bound).toBe(true);
    expect(report.checks.exact_45_scenarios).toBe(true);
    expect(report.checks.exact_scenario_ids_and_order).toBe(true);
    for (const [path, entry] of Object.entries(report.protected_hashes)) {
      expect(path).toMatch(/^(lib|docs|scripts)\//);
      expect(entry.exists).toBe(true);
      expect(entry.matches).toBe(true);
      expect(entry.actual).toBe(entry.expected);
      expect(doc).toContain(path);
      expect(doc).toContain(entry.expected);
    }
  });

  test("binds exact status warning and issue distributions", () => {
    expect(report.status_distribution).toEqual({
      calibrated: 14,
      no_adjustment: 5,
      calibrated_with_warnings: 11,
      blocked_invalid_input: 9,
      blocked_overlapping_evidence: 1,
      blocked_unsupported_insight: 1,
      blocked_invalid_lineage: 1,
      blocked_future_leakage: 1,
      blocked_invalid_configuration: 1,
      insufficient_eligible_evidence: 1,
    });
    expect(report.warning_distribution).toEqual({
      duplicate_mapper_row_identity: 4,
      metric_value_unavailable: 3,
      duplicate_insight_deduped: 1,
      overlapping_insight_excluded: 3,
      confidence_clamped_to_bounds: 2,
    });
    expect(report.issue_distribution).toEqual({
      warning_status_contradiction: 2,
      overlapping_evidence_conflict: 2,
      ineligible_pattern_discovery_status: 1,
      invalid_lineage: 1,
      future_leakage: 1,
      invalid_insight_structure: 1,
      invalid_configuration_shape: 1,
      invalid_base_confidence: 6,
      insufficient_eligible_evidence: 1,
    });
    expect(report.checks.status_distribution_exact).toBe(true);
    expect(report.checks.warning_distribution_exact).toBe(true);
    expect(report.checks.issue_distribution_exact).toBe(true);
  });

  test("requires complete issue metadata and bounded warning metadata", () => {
    expect(report.complete_issue_metadata_policy.required_fields).toEqual(["code", "path", "severity", "messageKey"]);
    expect(report.complete_issue_metadata_policy.severity_policy).toBe("issue_records_use_error");
    expect(report.complete_issue_metadata_policy.messageKey_policy).toBe("confidence_calibration.<code>");
    expect(report.complete_issue_metadata_policy.path_policy).toBe("RFC_6901_path_beginning_with_slash");
    expect(report.complete_issue_metadata_policy.issue_records).toHaveLength(16);
    for (const issue of report.complete_issue_metadata_policy.issue_records) {
      expect(issue.scenario_id).toMatch(/^cc425_\d{2}$/);
      expect(issue.index).toBeGreaterThanOrEqual(0);
      expect(issue.code).toMatch(/^[a-z0-9_]+$/);
      expect(issue.path).toMatch(/^\//);
      expect(issue.severity).toBe("error");
      expect(issue.messageKey).toBe(`confidence_calibration.${issue.code}`);
    }
    expect(report.complete_issue_metadata_policy.deterministic_ordering).toBe(true);
    expect(report.complete_issue_metadata_policy.deterministic_deduplication).toBe(true);
    expect(report.complete_issue_metadata_policy.raw_values_allowed).toBe(false);
    expect(report.complete_issue_metadata_policy.dynamic_text_allowed).toBe(false);
    expect(report.complete_issue_metadata_policy.secrets_allowed).toBe(false);
    expect(report.warning_metadata_policy).toEqual({
      severity: "warning",
      messageKey_policy: "confidence_calibration.<code>",
      raw_values_allowed: false,
      dynamic_text_allowed: false,
      secrets_allowed: false,
    });
    expect(report.checks.complete_issue_metadata_policy).toBe(true);
  });

  test("freezes future manifest runner semantic verification metadata evidence temp path and cleanup contracts", () => {
    expect(report.future_manifest_path).toBe("docs/action-429-static-confidence-calibration-shadow-input-manifest.json");
    expect(report.future_runner_path).toBe("scripts/action-429-static-confidence-calibration-shadow-run.mjs");
    expect(report.approved_action429_files).toEqual([
      "docs/action-429-static-confidence-calibration-shadow-input-manifest.json",
      "scripts/action-429-static-confidence-calibration-shadow-run.mjs",
      "docs/action-429-static-confidence-calibration-shadow-use.md",
      "scripts/action-429-static-confidence-calibration-shadow-use-verify.mjs",
      "tests/e2e/action-429-static-confidence-calibration-shadow-use.spec.ts",
    ]);
    expect(["absent", "complete_approved_package_present"]).toContain(report.action429_package_state);
    expect(report.unapproved_action429_files_present).toEqual([]);
    expect(report.checks.approved_action429_package_boundary).toBe(true);
    expect(report.checks.no_unapproved_action429_artifacts).toBe(true);
    expect(report.checks.manifest_contract).toBe(true);
    expect(report.checks.runner_contract).toBe(true);
    expect(report.semantic_verification_policy).toEqual({
      expected_values: true,
      semantic_hashes: true,
      delta_cap_clamp_overlap_zero: true,
    });
    expect(report.metadata_evidence_limits).toEqual({
      metadata_only: true,
      full_output_prohibited: true,
      temp_path: "<system-temp>/ture/action-429-static-confidence-calibration-shadow/",
    });
    expect(report.repeat_run_and_cleanup).toEqual({
      exactly_two_runs_required: true,
      retry_allowed: false,
      third_execution_allowed: false,
      cleanup_required: true,
      temp_evidence_retained: false,
    });
  });

  test("requires stop conditions and blocks runtime persistence replay providers Supabase feedback and mutation", () => {
    expect(report.stop_conditions_policy).toEqual({
      abort_before_execution_on_manifest_hash_source_or_temp_path_failure: true,
      fail_after_execution_on_output_hash_distribution_cleanup_or_mutation_failure: true,
      same_action_remediation_allowed: false,
    });
    expect(report.checks.stop_conditions).toBe(true);
    expect(report.checks.no_shadow_execution).toBe(true);
    expect(report.checks.no_runtime_persistence_replay_external_feedback).toBe(true);
    expect(report.checks.no_recommendation_or_scanner_mutation).toBe(true);
    expect(report.checks.no_forbidden_doc_effect_claims).toBe(true);
    expect(report.safety).toEqual({
      provider_call_executed: false,
      supabase_read_executed: false,
      supabase_write_executed: false,
      replay_executed: false,
      calibration_shadow_executed: false,
      recommendation_mutated: false,
      scanner_behavior_changed: false,
      live_ranking_changed: false,
      feedback_executed: false,
      runtime_route_created: false,
    });
  });

  test("keeps runtime preview paused and identifies only the next static action", () => {
    expect(report.runtime_preview_status).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(report.checks.runtime_preview_paused).toBe(true);
    expect(report.unrelated_work_classification).toBe("action_428_docs_verifier_tests_and_minimal_guard_updates_only");
    expect(report.recommended_next_action).toBe("action_429_static_confidence_calibration_shadow_execution");
    expect(report.checks.next_action_identified).toBe(true);
  });
});
