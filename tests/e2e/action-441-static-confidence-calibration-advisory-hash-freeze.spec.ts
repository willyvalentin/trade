import { execFileSync } from "child_process";
import { readFileSync } from "fs";
import { join } from "path";
import { test, expect } from "@playwright/test";

const root = process.cwd();
const inventoryPath = join(root, "docs/action-441-static-confidence-calibration-advisory-hash-inventory.json");

function readInventory() {
  return JSON.parse(readFileSync(inventoryPath, "utf8"));
}

test.describe("Action 441 static confidence calibration advisory hash freeze", () => {
  test("verifier passes for the frozen advisory inventory", () => {
    const output = execFileSync("node", [
      "scripts/action-441-static-confidence-calibration-advisory-hash-freeze-verify.mjs",
    ], { cwd: root, encoding: "utf8" });
    const report = JSON.parse(output);
    expect(report.verification_status).toBe("passed");
  });

  test("freezes exactly 48 Action 440 scenarios in order", () => {
    const inventory = readInventory();
    expect(inventory.scenario_count).toBe(48);
    expect(inventory.exact_scenario_ids).toEqual(Array.from({ length: 48 }, (_, index) => `ca440_${String(index + 1).padStart(2, "0")}`));
    expect(inventory.exact_scenario_order).toEqual(inventory.exact_scenario_ids);
  });

  test("freezes the advisory status distribution", () => {
    const inventory = readInventory();
    expect(inventory.advisory_status_distribution).toEqual({
      advisory_ready: 6,
      advisory_ready_with_warnings: 2,
      advisory_no_adjustment: 1,
      advisory_insufficient_evidence: 1,
      blocked_invalid_input: 6,
      blocked_confidence_mismatch: 3,
      blocked_invalid_lineage: 12,
      blocked_future_leakage: 6,
      blocked_calibration_result: 10,
      blocked_unsupported_status: 1,
    });
    expect(inventory.scenarios.every((scenario: { status_matches_expected: boolean }) => scenario.status_matches_expected)).toBe(true);
  });

  test("freezes complete and legacy semantic hash behavior", () => {
    const inventory = readInventory();
    expect(inventory.complete_legacy_hash_policy.valid_complete_hash_accepted).toBe(true);
    expect(inventory.complete_legacy_hash_policy.valid_legacy_hash_accepted).toBe(true);
    expect(inventory.complete_legacy_hash_policy.malformed_hash_blocked).toBe(true);
    expect(inventory.complete_legacy_hash_policy.swapped_hash_blocked).toBe(true);
    expect(inventory.complete_legacy_hash_policy.complete_hash_mismatch_blocked).toBe(true);
    expect(inventory.complete_legacy_hash_policy.legacy_bypass_blocked).toBe(true);
    expect(inventory.complete_legacy_hash_distribution.complete).toBeGreaterThan(0);
    expect(inventory.complete_legacy_hash_distribution.legacy).toBe(1);
  });

  test("freezes confidence, lineage, leakage, and feedback boundaries", () => {
    const inventory = readInventory();
    expect(inventory.confidence_binding_policy.exact_match_ready).toBe(true);
    expect(inventory.confidence_binding_policy.mismatch_blocks).toBe(true);
    expect(inventory.confidence_binding_policy.invalid_confidence_blocks).toBe(true);
    expect(inventory.lineage_leakage_feedback_policy.recommendation_lineage_blocks).toBe(true);
    expect(inventory.lineage_leakage_feedback_policy.pattern_insight_lineage_blocks).toBe(true);
    expect(inventory.lineage_leakage_feedback_policy.anti_leakage_blocks).toBe(true);
    expect(inventory.lineage_leakage_feedback_policy.anti_feedback_blocks).toBe(true);
  });

  test("persists metadata only, with no full payload retention", () => {
    const inventory = readInventory();
    expect(inventory.output_boundary.metadata_only).toBe(true);
    expect(inventory.output_boundary.recommendation_objects_retained).toBe(false);
    expect(inventory.output_boundary.full_calibration_results_retained).toBe(false);
    expect(inventory.output_boundary.full_pattern_insights_retained).toBe(false);
    expect(inventory.output_boundary.provider_payloads_retained).toBe(false);
    expect(inventory.output_boundary.supabase_payloads_retained).toBe(false);
    expect(inventory.output_boundary.timestamps_retained).toBe(false);
    expect(inventory.output_boundary.machine_paths_retained).toBe(false);
  });

  test("keeps all no-effect safety flags locked", () => {
    const inventory = readInventory();
    expect(inventory.static_only).toBe(true);
    expect(inventory.non_production).toBe(true);
    expect(inventory.non_authoritative).toBe(true);
    expect(inventory.non_learning).toBe(true);
    expect(inventory.no_persistence).toBe(true);
    expect(inventory.no_replay).toBe(true);
    expect(inventory.no_runtime).toBe(true);
    expect(inventory.no_external_access).toBe(true);
    expect(inventory.no_feedback).toBe(true);
    expect(inventory.provider_call_executed).toBe(false);
    expect(inventory.supabase_write_executed).toBe(false);
    expect(inventory.replay_executed).toBe(false);
    expect(inventory.recommendation_mutated).toBe(false);
    expect(inventory.confidence_applied).toBe(false);
  });
});
