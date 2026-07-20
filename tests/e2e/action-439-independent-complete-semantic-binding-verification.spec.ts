import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";

import { expect, test } from "@playwright/test";

type Action439Report = Readonly<{
  verification_status: string;
  readiness_decision: string;
  readiness_vocabulary: readonly string[];
  failed_conditions: readonly string[];
  unresolved_conditions: readonly string[];
  checks: Record<string, boolean>;
  source_integrity: Record<string, Readonly<{ matches_expected: boolean; expected_sha256: string; actual_sha256: string | null }>>;
  api_export_audit: Record<string, unknown>;
  field_inventory: Record<string, string>;
  independent_complete_hash_result: Record<string, boolean>;
  legacy_compatibility_result: Record<string, boolean>;
  fallback_bypass_result: Record<string, boolean>;
  retained_hash_attack_result: Record<string, boolean>;
  combined_tampering_result: Record<string, boolean>;
  semantic_order_equivalence_result: Record<string, boolean>;
  phase_10_precedence_result: Record<string, boolean>;
  phase_11_defense_result: Record<string, boolean>;
  hash_role_separation_result: Record<string, boolean>;
  unaffected_output_result: Record<string, boolean>;
  no_adjustment_result: Record<string, boolean>;
  issue_result: Record<string, boolean>;
  immutability_result: Record<string, boolean>;
  determinism_result: Record<string, boolean>;
  isolation_result: Readonly<{ isolated: boolean; forbidden_artifacts: readonly string[] }>;
  safety: Record<string, boolean>;
  upstream_health: Record<string, string>;
  remaining_gap_inventory: Record<string, boolean>;
  fixture_hash_freeze_readiness: Readonly<{ status: string }>;
  runtime_preview_status: string;
  unrelated_work_classification: string;
  recommended_next_action: string;
}>;

const docPath = "docs/action-439-independent-complete-semantic-binding-verification.md";
const verifierPath = "scripts/action-439-independent-complete-semantic-binding-verification-verify.mjs";
const testPath = "tests/e2e/action-439-independent-complete-semantic-binding-verification.spec.ts";

test.setTimeout(300000);

function runVerifier(): Action439Report {
  return JSON.parse(execFileSync("node", [verifierPath], { encoding: "utf8", timeout: 300000 })) as Action439Report;
}

test.describe.serial("Action 439 independent complete semantic binding verification", () => {
  let report: Action439Report;
  let doc: string;

  test.beforeAll(() => {
    report = runVerifier();
    doc = readFileSync(docPath, "utf8");
  });

  test("creates independent verification artifacts and reports ready with conditions", () => {
    expect(existsSync(docPath)).toBe(true);
    expect(existsSync(verifierPath)).toBe(true);
    expect(existsSync(testPath)).toBe(true);
    expect(report.verification_status).toBe("passed");
    expect(report.readiness_vocabulary).toEqual(["ready", "ready_with_conditions", "blocked"]);
    expect(report.readiness_decision).toBe("ready_with_conditions");
    expect(report.failed_conditions).toEqual([]);
    expect(report.unresolved_conditions).toContain("static_advisory_fixture_hash_freeze_future_work");
  });

  test("documents the static-only safety boundary and future fixture condition", () => {
    expect(doc).toContain("Action 439 - Independent Complete Semantic Binding Verification");
    expect(doc).toContain("This action does not:");
    expect(doc).toContain("call Twelve Data");
    expect(doc).toContain("read Supabase");
    expect(doc).toContain("write Supabase");
    expect(doc).toContain("execute replay");
    expect(doc).toContain("ready_with_conditions");
    expect(doc).toContain("static advisory fixture/hash-freeze work remains intentionally future");
  });

  test("locks source integrity and public API shape", () => {
    expect(report.source_integrity["lib/confidence-calibration-advisory-adapter.ts"].expected_sha256).toBe(
      "3c1b2ed0be3f37d5fe0514eee5a6a3b590811721f0e53b3802080fe764cd8e0b",
    );
    expect(Object.values(report.source_integrity).every((item) => item.matches_expected)).toBe(true);
    expect(report.checks.api_export_surface_unchanged).toBe(true);
    expect(report.api_export_audit.runtime_exports_unchanged).toBe(true);
    expect(report.api_export_audit.type_exports_unchanged).toBe(true);
  });

  test("verifies complete semantic field binding independently", () => {
    expect(report.field_inventory.calibration_hash).toBe("explicitly_non_semantic_and_excluded");
    expect(report.field_inventory.warnings).toBe("included_in_calibration_result_hash");
    expect(report.field_inventory.issues).toBe("included_in_calibration_result_hash");
    expect(report.field_inventory.lineage_hashes).toBe("included_in_calibration_result_hash");
    expect(report.field_inventory.source_scenario_ids).toContain("absent_for_calibration_result_shape");
    expect(Object.values(report.independent_complete_hash_result).every(Boolean)).toBe(true);
    expect(Object.values(report.retained_hash_attack_result).every(Boolean)).toBe(true);
    expect(Object.values(report.combined_tampering_result).every(Boolean)).toBe(true);
  });

  test("covers compatibility, fallback bypass, phase ordering, and hash-role separation", () => {
    expect(Object.values(report.legacy_compatibility_result).every(Boolean)).toBe(true);
    expect(Object.values(report.fallback_bypass_result).every(Boolean)).toBe(true);
    expect(Object.values(report.semantic_order_equivalence_result).every(Boolean)).toBe(true);
    expect(Object.values(report.phase_10_precedence_result).every(Boolean)).toBe(true);
    expect(Object.values(report.phase_11_defense_result).every(Boolean)).toBe(true);
    expect(Object.values(report.hash_role_separation_result).every(Boolean)).toBe(true);
  });

  test("keeps output behavior, mismatch shape, determinism, and immutability stable", () => {
    expect(Object.values(report.unaffected_output_result).every(Boolean)).toBe(true);
    expect(Object.values(report.no_adjustment_result).every(Boolean)).toBe(true);
    expect(Object.values(report.issue_result).every(Boolean)).toBe(true);
    expect(Object.values(report.immutability_result).every(Boolean)).toBe(true);
    expect(Object.values(report.determinism_result).every(Boolean)).toBe(true);
  });

  test("keeps runtime and side-effect surfaces closed", () => {
    expect(report.isolation_result.isolated).toBe(true);
    expect(report.isolation_result.forbidden_artifacts).toEqual([]);
    expect(Object.values(report.safety).every((value) => value === false)).toBe(true);
    expect(report.upstream_health.action309).toBe("passed");
    expect(report.upstream_health.golden_static_safety).toBe("passed");
    expect(report.upstream_health.action438).toBe("passed");
    expect(report.upstream_health.action437_reference).toBe("not_rerun_from_action_439_future_artifact_boundary");
    expect(Object.values(report.remaining_gap_inventory).every((value) => value === false)).toBe(true);
    expect(report.fixture_hash_freeze_readiness.status).toBe("future_bounded_action");
    expect(report.runtime_preview_status).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(report.unrelated_work_classification).toBe("action_439_independent_complete_semantic_binding_verification_only");
    expect(report.recommended_next_action).toBe("bounded_static_advisory_fixture_hash_freeze_if_operator_approves");
  });
});
