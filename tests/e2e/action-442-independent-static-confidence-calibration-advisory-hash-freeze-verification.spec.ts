import { execFileSync } from "child_process";
import { readFileSync } from "fs";
import { join } from "path";
import { test, expect } from "@playwright/test";

const root = process.cwd();
const verifierPath = "scripts/action-442-independent-static-confidence-calibration-advisory-hash-freeze-verification-verify.mjs";
const docPath = join(root, "docs/action-442-independent-static-confidence-calibration-advisory-hash-freeze-verification.md");

function runVerifier() {
  return JSON.parse(execFileSync("node", [verifierPath], { cwd: root, encoding: "utf8", timeout: 300000 }));
}

test.describe("Action 442 independent static advisory hash-freeze verification", () => {
  test("documentation contract is present", () => {
    const doc = readFileSync(docPath, "utf8");
    const normalizedDoc = doc.toLowerCase();
    expect(doc).toContain("Action 442");
    expect(normalizedDoc).toContain("protected-source audit");
    expect(doc).toContain("inventory-integrity audit");
    expect(doc).toContain("Action 443");
    expect(doc).toContain("runtime_preview_waiting_for_operator_inputs");
  });

  test("verifier reaches ready with no failed conditions", () => {
    const report = runVerifier();
    expect(report.verification_status).toBe("passed");
    expect(report.readiness_decision).toBe("ready");
    expect(report.failed_conditions).toEqual([]);
    expect(report.unresolved_conditions).toEqual([]);
  });

  test("source and inventory integrity match Action 441 frozen hashes", () => {
    const report = runVerifier();
    expect(report.checks.protected_sources_unchanged_after_freezer_execution).toBe(true);
    expect(report.checks.adapter_hash_exact).toBe(true);
    expect(report.action441_reproduction.scenario_summary_sha256).toBe("78c349f52843451d99c405883c0d9571223616cf684928094aa0294424beec15");
    expect(report.action441_reproduction.package_inventory_sha256).toBe("e6fb6b6e189feab0cf4bc1f2494522f7f2d9aa7ae0a455080156ad740f5facb8");
    expect(report.action441_reproduction.inventory_text_unchanged).toBe(true);
  });

  test("verifies exact 48 scenario IDs and status distribution", () => {
    const report = runVerifier();
    expect(report.checks.scenario_count_exact).toBe(true);
    expect(report.checks.scenario_ids_exact).toBe(true);
    expect(report.checks.scenario_order_exact).toBe(true);
    expect(report.advisory_status_distribution).toEqual({
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
  });

  test("verifies complete and legacy hash behavior plus fallback bypass rejection", () => {
    const report = runVerifier();
    expect(report.complete_legacy_hash_distribution).toEqual({
      complete: 39,
      legacy: 1,
      invalid_or_retained: 8,
    });
    expect(report.checks.complete_legacy_hash_policy_exact).toBe(true);
    expect(report.checks.fallback_bypass_rejected).toBe(true);
    expect(report.checks.retained_hash_tampering_rejected).toBe(true);
  });

  test("verifies confidence, lineage, leakage, feedback, warnings, issues and no-adjustment", () => {
    const report = runVerifier();
    expect(report.checks.confidence_binding_exact).toBe(true);
    expect(report.checks.no_rounding_or_repair).toBe(true);
    expect(report.checks.recommendation_lineage_fails_closed).toBe(true);
    expect(report.checks.calibration_lineage_fails_closed).toBe(true);
    expect(report.checks.anti_leakage_fails_closed).toBe(true);
    expect(report.checks.anti_feedback_fails_closed).toBe(true);
    expect(report.checks.warning_distribution_exact).toBe(true);
    expect(report.checks.issue_distribution_complete).toBe(true);
    expect(report.checks.no_adjustment_exact).toBe(true);
  });

  test("verifies semantic hashes, advisory IDs and repeat freeze policy", () => {
    const report = runVerifier();
    expect(report.checks.advisory_ids_and_hashes_exact).toBe(true);
    expect(report.checks.identity_hashes_exact).toBe(true);
    expect(report.checks.result_hashes_exact).toBe(true);
    expect(report.checks.scenario_summary_hash_exact).toBe(true);
    expect(report.checks.package_inventory_hash_exact).toBe(true);
    expect(report.checks.independent_canonicalization_exact).toBe(true);
    expect(report.checks.repeat_freeze_exact_two_runs).toBe(true);
  });

  test("verifies bounded metadata and no side effects or consumers", () => {
    const report = runVerifier();
    expect(report.checks.bounded_metadata_only).toBe(true);
    expect(report.checks.no_full_upstream_data_terms).toBe(true);
    expect(report.checks.no_shadow_runner_or_manifest).toBe(true);
    expect(report.checks.no_unapproved_consumers).toBe(true);
    expect(report.checks.no_side_effects).toBe(true);
    expect(report.safety.provider_call_executed).toBe(false);
    expect(report.safety.supabase_write_executed).toBe(false);
    expect(report.safety.replay_executed).toBe(false);
    expect(report.safety.confidence_applied).toBe(false);
    expect(report.runtime_preview_status).toBe("runtime_preview_waiting_for_operator_inputs");
  });
});
