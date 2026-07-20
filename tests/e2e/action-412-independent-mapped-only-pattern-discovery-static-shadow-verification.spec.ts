import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";

import { expect, test } from "@playwright/test";

const docPath = "docs/action-412-independent-mapped-only-pattern-discovery-static-shadow-verification.md";
const verifierPath = "scripts/action-412-independent-mapped-only-pattern-discovery-static-shadow-verification-verify.mjs";

type Action412Report = Readonly<{
  verification_status: string;
  readiness_decision: string;
  failed_checks: readonly string[];
  checks: Readonly<Record<string, boolean>>;
  action411_reproduction: Readonly<{
    final_shadow_decision: string;
    case_count: number;
    repeat_run_identical: boolean;
  }>;
  case_audit: Readonly<{
    case_ids: readonly string[];
    mapper_input_hash_count: number;
    row_id_count: number;
    row_hash_count: number;
  }>;
  duplicate_inventory: Readonly<{
    case_observations: number;
    unique_mapper_rows: number;
    shared_duplicate_row_count: number;
    duplicate_warning: string;
  }>;
  pattern_discovery_result: Readonly<{
    status: string;
    group_status: string;
    support_counts: Readonly<{ case_support_count: number; unique_mapper_row_count: number }>;
    outcome_counts: Readonly<{
      completed_outcome_count: number;
      positive_count: number;
      negative_count: number;
      neutral_count: number;
    }>;
    warnings: readonly string[];
    insight_count: number;
  }>;
  semantic_hashes: Readonly<Record<string, string>>;
  observed_hashes: Readonly<Record<string, string>>;
  evidence_boundary: Readonly<{
    metadata_only_result: string;
    path_safety_result: string;
    cleanup_result: string;
    temporary_evidence_deleted: boolean;
    tracked_evidence_files: readonly string[];
  }>;
  coverage_strengths: readonly string[];
  remaining_coverage_gaps: readonly string[];
  expansion_readiness_result: string;
  no_effect_flags: Readonly<Record<string, boolean>>;
  runtime_preview_status: string;
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

let report: Action412Report;

function runVerifier(): Action412Report {
  return JSON.parse(execFileSync("node", [verifierPath], {
    cwd: process.cwd(),
    encoding: "utf8",
    timeout: 240_000,
    env: {
      ...process.env,
      AUTOMATION_SECRET: "automation-secret-that-must-not-appear",
      TWELVE_DATA_API_KEY: "twelve-data-secret-that-must-not-appear",
      SUPABASE_SERVICE_ROLE_KEY: "supabase-secret-that-must-not-appear",
    },
  })) as Action412Report;
}

test.describe.serial("Action 412 independent mapped-only Pattern Discovery static shadow verification", () => {
  test.setTimeout(300_000);

  test.beforeAll(() => {
    report = runVerifier();
  });

  test("documentation contract and verifier succeed", () => {
    const doc = readFileSync(docPath, "utf8");

    expect(existsSync(docPath)).toBe(true);
    expect(report.verification_status).toBe("passed");
    expect(report.readiness_decision).toBe("ready");
    expect(report.failed_checks).toEqual([]);
    expect(report.checks.documentation_contract_complete).toBe(true);
    expect(doc).toContain("## Readiness Decision");
    expect(doc).toContain("`ready`");
  });

  test("source runner and manifest integrity are exact", () => {
    expect(report.checks.protected_hashes_recorded_and_match).toBe(true);
    expect(report.checks.runner_manifest_integrity).toBe(true);
    expect(report.checks.no_source_mutation).toBe(true);
  });

  test("exact ten cases order mapper inputs row IDs and row hashes are audited", () => {
    expect(report.case_audit.case_ids).toEqual(expectedCases);
    expect(report.case_audit.mapper_input_hash_count).toBe(10);
    expect(report.case_audit.row_id_count).toBe(10);
    expect(report.case_audit.row_hash_count).toBe(10);
    expect(report.checks.exact_case_order).toBe(true);
    expect(report.checks.mapper_input_hashes_frozen).toBe(true);
    expect(report.checks.mapper_row_ids_frozen).toBe(true);
    expect(report.checks.row_hashes_frozen).toBe(true);
  });

  test("Action 411 reproduction duplicate inventory and exactly two runs are verified", () => {
    expect(report.action411_reproduction).toEqual({
      final_shadow_decision: "shadow_passed",
      case_count: 10,
      repeat_run_identical: true,
    });
    expect(report.duplicate_inventory).toEqual({
      case_observations: 10,
      unique_mapper_rows: 3,
      shared_duplicate_row_count: 8,
      duplicate_warning: "duplicate_mapper_row_identity",
    });
    expect(report.checks.exactly_two_runs_no_retry).toBe(true);
  });

  test("Pattern Discovery status warnings counts and zero insights are exact", () => {
    expect(report.pattern_discovery_result.status).toBe("insufficient_evidence");
    expect(report.pattern_discovery_result.group_status).toBe("insufficient_evidence");
    expect(report.pattern_discovery_result.support_counts).toEqual({
      case_support_count: 10,
      unique_mapper_row_count: 3,
    });
    expect(report.pattern_discovery_result.outcome_counts).toEqual({
      completed_outcome_count: 10,
      positive_count: 10,
      negative_count: 0,
      neutral_count: 0,
    });
    expect(report.pattern_discovery_result.warnings).toEqual([
      "minimum_total_support_not_met",
      "minimum_completed_outcomes_not_met",
      "duplicate_mapper_row_identity",
    ]);
    expect(report.pattern_discovery_result.insight_count).toBe(0);
  });

  test("semantic hashes and repeat batch hash are exact", () => {
    expect(report.semantic_hashes.evidence_set_sha256).toBe("f1f0053264c85d640d46b61da0ce7120e491309e3070132fe74a69a68438cbd8");
    expect(report.semantic_hashes.group_sha256).toBe("aa2ae3f39146ce1c6fc1f6ed73e19e96b02b7866b34e75b61c471a8277a1122e");
    expect(report.semantic_hashes.result_sha256).toBe("e911709a784159c684a350de490fd56446ee23c23b3bf5ea2fbb70378ebf253c");
    expect(report.observed_hashes.run_1_batch_sha256).toBe("bad2ba397af95ace6883e2ea45bbd046bd4d6ad23264103aef34184468853be3");
    expect(report.observed_hashes.run_2_batch_sha256).toBe("bad2ba397af95ace6883e2ea45bbd046bd4d6ad23264103aef34184468853be3");
  });

  test("metadata-only path safety cleanup and tracked evidence are verified", () => {
    expect(report.evidence_boundary.metadata_only_result).toBe("passed");
    expect(report.evidence_boundary.path_safety_result).toBe("passed");
    expect(report.evidence_boundary.cleanup_result).toBe("passed");
    expect(report.evidence_boundary.temporary_evidence_deleted).toBe(true);
    expect(report.evidence_boundary.tracked_evidence_files).toEqual([]);
    expect(report.checks.no_full_rows_results_insights_retained).toBe(true);
  });

  test("no external access persistence replay runtime feedback or authoritative effects occur", () => {
    expect(report.checks.no_external_access_persistence_replay_runtime_feedback).toBe(true);
    for (const value of Object.values(report.no_effect_flags)) {
      expect(value).toBe(false);
    }
  });

  test("expansion readiness remains separately gated", () => {
    expect(report.coverage_strengths).toContain("mapper_reconstruction");
    expect(report.remaining_coverage_gaps).toContain("sufficient_support_discovered_path");
    expect(report.expansion_readiness_result).toBe("expanded_static_package_ready_for_separate_approval_gate");
    expect(report.recommended_next_action).toBe("action_413_expanded_static_pattern_discovery_coverage_package_approval_gate");
  });

  test("Actions 410 and 411 remain healthy and runtime preview is untouched", () => {
    expect(report.checks.action410_action411_healthy).toBe(true);
    expect(report.runtime_preview_status).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(report.checks.runtime_preview_untouched).toBe(true);
  });
});
