import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";

import { expect, test } from "@playwright/test";

const docPath = "docs/action-454-static-confidence-calibration-recommendation-advisory-projection-hash-freeze.md";
const inventoryPath = "docs/action-454-static-confidence-calibration-recommendation-advisory-projection-hash-inventory.json";
const freezerPath = "scripts/action-454-static-confidence-calibration-recommendation-advisory-projection-hash-freeze.mjs";
const verifierPath = "scripts/action-454-static-confidence-calibration-recommendation-advisory-projection-hash-freeze-verify.mjs";
const testPath = "tests/e2e/action-454-static-confidence-calibration-recommendation-advisory-projection-hash-freeze.spec.ts";

test.setTimeout(300000);

function runVerifier() {
  const output = execFileSync("node", [verifierPath], {
    cwd: process.cwd(),
    encoding: "utf8",
    maxBuffer: 120 * 1024 * 1024,
  });
  return JSON.parse(output);
}

function runFreezer() {
  const output = execFileSync("node", [freezerPath], {
    cwd: process.cwd(),
    encoding: "utf8",
    maxBuffer: 120 * 1024 * 1024,
  });
  return JSON.parse(output);
}

function readInventory() {
  return JSON.parse(readFileSync(inventoryPath, "utf8"));
}

test.describe("Action 454 static projection hash freeze", () => {
  test("adds documentation, inventory, freezer, verifier, and focused test", () => {
    expect(existsSync(docPath)).toBe(true);
    expect(existsSync(inventoryPath)).toBe(true);
    expect(existsSync(freezerPath)).toBe(true);
    expect(existsSync(verifierPath)).toBe(true);
    expect(existsSync(testPath)).toBe(true);

    const doc = readFileSync(docPath, "utf8");
    for (const phrase of [
      "Action 454 constructs the exact 52 Action 453-approved",
      "Runtime preview remains paused at `runtime_preview_waiting_for_operator_inputs`",
      "No shadow runner.",
      "No Recommendation Engine consumer.",
      "`action_455_independent_projection_hash_freeze_verification`",
    ]) {
      expect(doc).toContain(phrase);
    }
  });

  test("freezes the exact 52 scenarios, IDs, status distribution, and package hash", () => {
    const inventory = readInventory();

    expect(inventory.inventory_schema_version).toBe("action_454_static_projection_hash_inventory_v1");
    expect(inventory.scenario_count).toBe(52);
    expect(inventory.exact_ids).toHaveLength(52);
    expect(inventory.exact_ids[0]).toBe("cp453_01");
    expect(inventory.exact_ids.at(-1)).toBe("cp453_52");
    expect(inventory.exact_status_distribution).toEqual({
      projection_ready: 4,
      projection_ready_with_warnings: 3,
      projection_no_adjustment: 1,
      projection_insufficient_evidence: 1,
      blocked_invalid_input: 11,
      blocked_confidence_mismatch: 3,
      blocked_advisory_result: 11,
      blocked_invalid_lineage: 12,
      blocked_future_leakage: 5,
      blocked_unsupported_status: 1,
    });
    expect(inventory.package_inventory_sha256).toBe(
      "ef706460039171b45f15fea6c5aa6597b4986b53298f17843809a1941c3db072",
    );
  });

  test("freezes advisory-hash, confidence, lineage, leakage, feedback, warnings, and issues", () => {
    const inventory = readInventory();

    expect(inventory.advisory_hash_classification_distribution).toEqual({
      valid_advisory_hash: 42,
      malformed_hash: 1,
      swapped_hash: 1,
      unrelated_valid_format_hash: 1,
      retained_hash_tampering: 6,
      hash_role_substitution: 1,
    });
    expect(inventory.warning_distribution).toEqual({
      duplicate_mapper_row_identity: 4,
      metric_value_unavailable: 4,
    });
    expect(inventory.scenarios.find((scenario: { scenario_id: string }) => scenario.scenario_id === "cp453_11").actual.status)
      .toBe("blocked_confidence_mismatch");
    expect(inventory.scenarios.find((scenario: { scenario_id: string }) => scenario.scenario_id === "cp453_29").actual.status)
      .toBe("blocked_invalid_lineage");
    expect(inventory.scenarios.find((scenario: { scenario_id: string }) => scenario.scenario_id === "cp453_34").actual.status)
      .toBe("blocked_future_leakage");
    expect(inventory.scenarios.find((scenario: { scenario_id: string }) => scenario.scenario_id === "cp453_39").actual.status)
      .toBe("blocked_invalid_lineage");
    expect(inventory.scenarios.find((scenario: { scenario_id: string }) => scenario.scenario_id === "cp453_47").actual.issues)
      .toHaveLength(2);
  });

  test("freezes no-adjustment, effect flags, semantic ordering, projection IDs, and hashes", () => {
    const inventory = readInventory();
    const noAdjustment = inventory.scenarios.find((scenario: { scenario_id: string }) => scenario.scenario_id === "cp453_03");
    const semanticOrdering = inventory.scenarios.find((scenario: { scenario_id: string }) => scenario.scenario_id === "cp453_48");
    const successful = inventory.scenarios.filter((scenario: { actual: { projection_id: string | null } }) =>
      scenario.actual.projection_id !== null);

    expect(noAdjustment.actual.status).toBe("projection_no_adjustment");
    expect(noAdjustment.actual.advisory_proposed_delta_basis_points).toBe(0);
    expect(noAdjustment.actual.advisory_proposed_confidence_basis_points).toBe(5200);
    expect(semanticOrdering.actual.status).toBe("projection_ready");
    expect(successful).toHaveLength(8);
    for (const scenario of inventory.scenarios) {
      expect(scenario.effect_flags).toMatchObject({
        recommendation_confidence_unchanged: true,
        ranking_affected: false,
        scanner_affected: false,
        publication_affected: false,
        execution_affected: false,
        application_eligible: false,
        non_authoritative: true,
        applied: false,
      });
      expect(typeof scenario.canonical_projection_result_sha256).toBe("string");
      expect(typeof scenario.scenario_summary_sha256).toBe("string");
    }
    for (const scenario of successful) {
      expect(scenario.actual.projection_id).toContain("confidence_calibration_recommendation_projection_v1:");
      expect(typeof scenario.projection_identity_sha256).toBe("string");
    }
  });

  test("freezer executes exactly two identical runs and verifier succeeds", () => {
    const freeze = runFreezer();
    const report = runVerifier();

    expect(freeze.freeze_status).toBe("passed");
    expect(freeze.repeat_freeze).toMatchObject({
      run_count: 2,
      identical: true,
      package_inventory_sha256: "ef706460039171b45f15fea6c5aa6597b4986b53298f17843809a1941c3db072",
    });
    expect(report.verification_status).toBe("passed");
    expect(report.failed_conditions).toEqual([]);
    expect(report.hash_freeze_result).toBe("frozen");
    expect(report.repeat_freeze.identical).toBe(true);
  });

  test("preserves bounded metadata, source integrity, and no-effect safety locks", () => {
    const report = runVerifier();
    const inventory = readInventory();

    expect(report.source_integrity.protected_sources_unchanged).toBe(true);
    expect(report.bounded_metadata_result).toBe("bounded_metadata_only");
    expect(inventory.full_recommendation_objects_retained).toBe(false);
    expect(inventory.full_advisory_objects_retained).toBe(false);
    expect(report.safety).toEqual({
      provider_call_executed: false,
      supabase_write_executed: false,
      replay_executed: false,
      projection_shadow_executed: false,
      confidence_applied: false,
      recommendation_mutated: false,
      ranking_changed: false,
      scanner_changed: false,
      deployment_authorized: false,
    });
  });

  test("keeps shadow, manifest, consumers, runtime, persistence, replay, provider, Supabase, feedback, and deployment absent", () => {
    const report = runVerifier();

    expect(report.isolation.forbidden_shadow_or_runtime_artifacts).toEqual([]);
    expect(report.isolation.unexpected_audit_consumers).toEqual([]);
    expect(report.isolation.app_or_lib_consumers).toEqual([]);
    expect(report.isolation.deployment_files_changed).toEqual([]);
    expect(report.isolation.no_runner_manifest_shadow).toBe(true);
    expect(report.isolation.no_consumer_or_confidence_application).toBe(true);
    expect(report.runtime_preview_status).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(report.deployment_status).toBe("not_authorized_not_required");
    expect(report.recommended_next_action).toBe("action_455_independent_projection_hash_freeze_verification");
    expect(report.unrelated_work_classification).toBe("action_454_static_hash_freeze_only");
  });
});
