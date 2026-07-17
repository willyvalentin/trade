import { execFileSync } from "child_process";
import { readFileSync } from "fs";
import { join } from "path";
import { test, expect } from "@playwright/test";

const root = process.cwd();
const verifierPath = "scripts/action-443-static-confidence-calibration-advisory-shadow-execution-approval-gate-verify.mjs";
const docPath = join(root, "docs/action-443-static-confidence-calibration-advisory-shadow-execution-approval-gate.md");

function runVerifier() {
  return JSON.parse(execFileSync("node", [verifierPath], { cwd: root, encoding: "utf8", timeout: 300000 }));
}

test.describe("Action 443 static advisory shadow execution approval gate", () => {
  test("documentation contract is present", () => {
    const doc = readFileSync(docPath, "utf8");
    const normalizedDoc = doc.toLowerCase();
    expect(doc).toContain("Action 443");
    expect(normalizedDoc).toContain("future execution-manifest contract");
    expect(normalizedDoc).toContain("future runner contract");
    expect(normalizedDoc).toContain("metadata-only evidence contract");
    expect(normalizedDoc).toContain("approval decision: `approved`");
    expect(doc).toContain("Action 444");
    expect(doc).toContain("runtime_preview_waiting_for_operator_inputs");
  });

  test("verifier approves the gate with no failed or unresolved conditions", () => {
    const report = runVerifier();
    expect(report.verification_status).toBe("passed");
    expect(report.approval_decision).toBe("approved");
    expect(report.failed_conditions).toEqual([]);
    expect(report.unresolved_conditions).toEqual([]);
    expect(report.approval_vocabulary).toEqual(["approved", "approved_with_conditions", "blocked"]);
    expect(report.shadow_decision_vocabulary).toEqual(["shadow_passed", "shadow_passed_with_conditions", "shadow_failed", "shadow_aborted"]);
  });

  test("binds Action 442 readiness and protected Action 441 hashes", () => {
    const report = runVerifier();
    expect(report.checks.action442_readiness_bound).toBe(true);
    expect(report.checks.protected_hashes_exact).toBe(true);
    expect(report.protected_hashes.advisory_adapter_sha256).toBe("3c1b2ed0be3f37d5fe0514eee5a6a3b590811721f0e53b3802080fe764cd8e0b");
    expect(report.action441_hashes.scenario_summary_sha256).toBe("78c349f52843451d99c405883c0d9571223616cf684928094aa0294424beec15");
    expect(report.action441_hashes.package_inventory_sha256).toBe("e6fb6b6e189feab0cf4bc1f2494522f7f2d9aa7ae0a455080156ad740f5facb8");
    expect(report.checks.action441_inventory_file_hash_exact).toBe(true);
    expect(report.checks.action441_freezer_file_hash_exact).toBe(true);
  });

  test("freezes exact 48 IDs, order, status distribution and hash classification", () => {
    const report = runVerifier();
    expect(report.checks.scenario_count_exact).toBe(true);
    expect(report.checks.scenario_ids_exact).toBe(true);
    expect(report.checks.scenario_order_exact).toBe(true);
    expect(report.status_distribution).toEqual({
      advisory_ready: 6,
      advisory_ready_with_warnings: 2,
      advisory_no_adjustment: 1,
      advisory_insufficient_evidence: 1,
      blocked_invalid_input: 6,
      blocked_invalid_lineage: 12,
      blocked_future_leakage: 6,
      blocked_calibration_result: 10,
      blocked_unsupported_status: 1,
      blocked_confidence_mismatch: 3,
    });
    expect(report.hash_classification_distribution).toEqual({
      complete: 39,
      legacy: 1,
      invalid_or_retained: 8,
    });
  });

  test("freezes expected values, warnings, issues, lineage and advisory hashes", () => {
    const report = runVerifier();
    expect(report.checks.expected_values_bound).toBe(true);
    expect(report.checks.visibility_eligibility_flags_bound).toBe(true);
    expect(report.checks.warning_issue_lineage_bound).toBe(true);
    expect(report.checks.no_adjustment_bound).toBe(true);
    expect(report.checks.advisory_ids_and_hashes_bound).toBe(true);
    expect(report.checks.blocked_scenarios_fail_closed).toBe(true);
    expect(report.expected_value_verification.confidence_values_bound).toBe(true);
  });

  test("freezes complete legacy fallback policy", () => {
    const report = runVerifier();
    expect(report.checks.complete_legacy_fallback_policy_bound).toBe(true);
    expect(report.complete_legacy_fallback_policy.valid_complete_hash_accepted).toBe(true);
    expect(report.complete_legacy_fallback_policy.valid_legacy_hash_accepted).toBe(true);
    expect(report.complete_legacy_fallback_policy.complete_hash_mismatch_blocked).toBe(true);
    expect(report.complete_legacy_fallback_policy.malformed_hash_blocked).toBe(true);
    expect(report.complete_legacy_fallback_policy.swapped_hash_blocked).toBe(true);
    expect(report.complete_legacy_fallback_policy.legacy_bypass_blocked).toBe(true);
    expect(report.complete_legacy_fallback_policy.retained_hash_tamper_blocked).toBe(true);
  });

  test("freezes manifest runner evidence path cleanup repeat-run and stop conditions", () => {
    const report = runVerifier();
    expect(report.checks.manifest_contract_frozen).toBe(true);
    expect(report.checks.runner_contract_frozen).toBe(true);
    expect(report.checks.metadata_evidence_bounded).toBe(true);
    expect(report.checks.temporary_path_policy_frozen).toBe(true);
    expect(report.checks.repeat_run_policy_frozen).toBe(true);
    expect(report.checks.cleanup_policy_frozen).toBe(true);
    expect(report.checks.stop_conditions_frozen).toBe(true);
    expect(report.runner_contract.exact_runs_required).toBe(2);
    expect(report.runner_contract.third_run_allowed).toBe(false);
    expect(report.temporary_path_policy.action444_dedicated_path).toBe(true);
  });

  test("keeps Action 444 boundary exact and safety flags locked", () => {
    const report = runVerifier();
    expect(report.checks.action444_boundary_exact).toBe(true);
    expect(report.checks.action444_package_present_and_bounded).toBe(true);
    expect(report.action444_boundary.runner_exists_now).toBe(true);
    expect(report.action444_boundary.manifest_exists_now).toBe(true);
    expect(report.action444_boundary.action444_package_complete).toBe(true);
    expect(report.checks.no_tracked_shadow_evidence).toBe(true);
    expect(report.checks.no_unapproved_consumers).toBe(true);
    expect(report.checks.no_runtime_persistence_replay_provider_supabase_feedback).toBe(true);
    expect(report.checks.no_recommendation_ranking_scanner_publication_mutation).toBe(true);
    expect(report.safety.supabase_write_executed).toBe(false);
    expect(report.safety.replay_executed).toBe(false);
    expect(report.safety.confidence_applied).toBe(false);
  });

  test("keeps runtime preview paused and recommends Action 444 separately", () => {
    const report = runVerifier();
    expect(report.runtime_preview_status).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(report.checks.runtime_preview_untouched).toBe(true);
    expect(report.recommended_next_action).toBe("action_444_static_confidence_calibration_advisory_shadow_execution");
    expect(report.unrelated_work_classification).toBe("action_443_static_confidence_calibration_advisory_shadow_execution_approval_gate_only");
  });
});
