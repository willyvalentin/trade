import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";

import { expect, test } from "@playwright/test";

type Action435Report = Readonly<{
  verification_status: string;
  remediation_result: string;
  checks: Record<string, boolean>;
  failed_conditions: readonly string[];
  passed_conditions_count: number;
  failed_conditions_count: number;
  unresolved_conditions_count: number;
  tampering: Record<string, boolean>;
  mismatch_status: string;
  mismatch_issue_path: string;
  semantic_order_equivalence: Record<string, boolean>;
  precedence: Record<string, boolean>;
  consumers: { adapter_consumers: readonly string[] };
  forbidden_artifacts: readonly string[];
  safety: Record<string, boolean>;
  upstream_health: Record<string, string>;
  runtime_preview_status: string;
  unrelated_work_classification: string;
  recommended_next_action: string;
}>;

const docPath = "docs/action-435-confidence-calibration-advisory-adapter-semantic-hash-remediation.md";
const verifierPath = "scripts/action-435-confidence-calibration-advisory-adapter-semantic-hash-remediation-verify.mjs";
const testPath = "tests/e2e/action-435-confidence-calibration-advisory-adapter-semantic-hash-remediation.spec.ts";

test.setTimeout(300000);

function runVerifier(): Action435Report {
  return JSON.parse(execFileSync("node", [verifierPath], { encoding: "utf8", timeout: 300000 })) as Action435Report;
}

test.describe.serial("Action 435 Confidence Calibration advisory adapter semantic hash remediation", () => {
  let report: Action435Report;
  let doc: string;
  let source: string;

  test.beforeAll(() => {
    report = runVerifier();
    doc = readFileSync(docPath, "utf8");
    source = readFileSync("lib/confidence-calibration-advisory-adapter.ts", "utf8");
  });

  test("creates remediation artifacts and keeps exact public exports", () => {
    expect(existsSync(docPath)).toBe(true);
    expect(existsSync(verifierPath)).toBe(true);
    expect(existsSync(testPath)).toBe(true);
    expect(report.verification_status).toBe("passed");
    expect(report.remediation_result).toBe("semantic_hash_remediation_passed");
    expect(report.checks.exact_exports).toBe(true);
    expect(source.match(/export function buildConfidenceCalibrationAdvisory/g)).toHaveLength(1);
    expect(source).not.toContain("export function buildCalibrationSemanticHashPayload");
  });

  test("reconstructs semantic payload and recomputes supplied calibration hash", () => {
    expect(report.checks.semantic_payload_reconstruction_exists).toBe(true);
    expect(report.checks.independent_canonicalization_exists).toBe(true);
    expect(report.checks.sha256_recomputation_exists).toBe(true);
    expect(report.checks.supplied_recomputed_comparison_exists).toBe(true);
    expect(doc).toContain("SHA-256(canonical calibration semantic hash payload)");
  });

  test("blocks malformed swapped and retained-hash semantic tampering", () => {
    for (const key of [
      "malformed_result_hash",
      "swapped_valid_hash",
      "status_changed_retained_hash",
      "proposed_delta_changed",
      "proposed_confidence_changed",
      "warning_inventory_changed",
      "issue_inventory_changed",
      "included_insight_changed",
      "excluded_insight_changed",
      "evidence_summary_changed",
      "overlap_summary_changed",
      "lineage_changed",
      "applied_flag_changed",
    ]) {
      expect(report.tampering[key], key).toBe(true);
    }
  });

  test("uses the approved mismatch blocker and phase precedence", () => {
    expect(report.mismatch_status).toBe("blocked_calibration_result");
    expect(report.mismatch_issue_path).toBe("/calibration/calibration_hash");
    expect(Object.values(report.precedence).every(Boolean)).toBe(true);
    expect(doc).toContain("Hash mismatch outranks later Pattern Discovery lineage");
  });

  test("accepts semantic order equivalence while preserving valid outputs", () => {
    expect(Object.values(report.semantic_order_equivalence).every(Boolean)).toBe(true);
    expect(report.checks.valid_outputs_unchanged).toBe(true);
    expect(report.checks.no_adjustment_unchanged).toBe(true);
  });

  test("preserves immutability determinism and output safety", () => {
    expect(report.checks.immutability).toBe(true);
    expect(report.checks.determinism).toBe(true);
    expect(report.checks.no_public_helper_exports).toBe(true);
    expect(report.failed_conditions).toEqual([]);
    expect(report.failed_conditions_count).toBe(0);
    expect(report.unresolved_conditions_count).toBe(0);
    expect(report.passed_conditions_count).toBeGreaterThan(15);
  });

  test("does not create fixture runner manifest shadow consumer runtime persistence replay provider Supabase feedback or confidence application", () => {
    expect(report.forbidden_artifacts).toEqual([]);
    expect(report.consumers.adapter_consumers).toEqual([]);
    expect(Object.values(report.safety).every((value) => value === false)).toBe(true);
    expect(report.checks.no_runtime_or_side_effect_imports).toBe(true);
  });

  test("keeps upstream gates healthy and runtime preview paused", () => {
    expect(report.upstream_health.action432).toBe("passed");
    expect(report.upstream_health.action434).toBe("passed");
    expect(report.runtime_preview_status).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(report.unrelated_work_classification).toBe(
      "action_435_confidence_calibration_advisory_adapter_semantic_hash_remediation_only",
    );
    expect(report.recommended_next_action).toBe("action_436_independent_post_remediation_advisory_adapter_verification");
  });
});
