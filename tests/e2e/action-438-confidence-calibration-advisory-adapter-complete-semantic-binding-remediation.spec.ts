import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";

import { expect, test } from "@playwright/test";

type Action438Report = Readonly<{
  verification_status: string;
  remediation_result: string;
  failed_conditions: readonly string[];
  checks: Record<string, boolean>;
  field_inventory: Record<string, string>;
  accepted: Record<string, boolean>;
  attack_matrix: Record<string, boolean>;
  phase_behavior: Record<string, boolean>;
  semantic_order_equivalence: Record<string, boolean>;
  api: Record<string, boolean>;
  unaffected_outputs: Record<string, boolean>;
  immutability: Record<string, boolean>;
  determinism: Record<string, boolean>;
  consumers: Readonly<{ adapter_consumers: readonly string[] }>;
  forbidden_artifacts: readonly string[];
  safety: Record<string, boolean>;
  upstream_health: Record<string, string>;
  runtime_preview_status: string;
  unrelated_work_classification: string;
  recommended_next_action: string;
}>;

const docPath = "docs/action-438-confidence-calibration-advisory-adapter-complete-semantic-binding-remediation.md";
const verifierPath = "scripts/action-438-confidence-calibration-advisory-adapter-complete-semantic-binding-remediation-verify.mjs";
const testPath = "tests/e2e/action-438-confidence-calibration-advisory-adapter-complete-semantic-binding-remediation.spec.ts";

test.setTimeout(300000);

function runVerifier(): Action438Report {
  return JSON.parse(execFileSync("node", [verifierPath], { encoding: "utf8", timeout: 300000 })) as Action438Report;
}

test.describe.serial("Action 438 confidence calibration advisory adapter complete semantic binding remediation", () => {
  let report: Action438Report;
  let doc: string;

  test.beforeAll(() => {
    report = runVerifier();
    doc = readFileSync(docPath, "utf8");
  });

  test("creates remediation artifacts and passes verifier", () => {
    expect(existsSync(docPath)).toBe(true);
    expect(existsSync(verifierPath)).toBe(true);
    expect(existsSync(testPath)).toBe(true);
    expect(report.verification_status).toBe("passed");
    expect(report.remediation_result).toBe("complete_semantic_binding_remediation_passed");
    expect(report.failed_conditions).toEqual([]);
  });

  test("documents complete semantic field binding and Action 439 handoff", () => {
    expect(doc).toContain("Action 438 - Confidence Calibration Advisory Adapter Complete Semantic Binding Remediation");
    expect(doc).toContain("Action 439 - Independent Complete Semantic Binding Verification");
    expect(report.field_inventory.calibration_id).toBe("included_in_calibration_result_hash");
    expect(report.field_inventory.warnings).toBe("included_in_calibration_result_hash");
    expect(report.field_inventory.issues).toBe("included_in_calibration_result_hash");
    expect(report.field_inventory.lineage_hashes).toBe("included_in_calibration_result_hash");
    expect(report.field_inventory.calibration_hash).toBe("explicitly_non_semantic_and_excluded");
    expect(Object.values(report.field_inventory).every(Boolean)).toBe(true);
  });

  test("accepts legacy and complete hashes while blocking semantic tampering", () => {
    expect(Object.values(report.accepted).every(Boolean)).toBe(true);
    expect(Object.values(report.attack_matrix).every(Boolean)).toBe(true);
    expect(report.attack_matrix.calibration_id).toBe(true);
    expect(report.attack_matrix.warning_code).toBe(true);
    expect(report.attack_matrix.warning_path).toBe(true);
    expect(report.attack_matrix.pattern_discovery_sha256).toBe(true);
    expect(report.attack_matrix.pattern_discovery_result_sha256).toBe(true);
    expect(report.attack_matrix.insight_sha256).toBe(true);
  });

  test("preserves phase ordering, canonical reorder equivalence, API, and unchanged outputs", () => {
    expect(Object.values(report.phase_behavior).every(Boolean)).toBe(true);
    expect(Object.values(report.semantic_order_equivalence).every(Boolean)).toBe(true);
    expect(Object.values(report.api).every(Boolean)).toBe(true);
    expect(Object.values(report.unaffected_outputs).every(Boolean)).toBe(true);
    expect(Object.values(report.immutability).every(Boolean)).toBe(true);
    expect(Object.values(report.determinism).every(Boolean)).toBe(true);
  });

  test("keeps runtime and side-effect surfaces closed", () => {
    expect(report.consumers.adapter_consumers).toEqual([]);
    expect(report.forbidden_artifacts).toEqual([]);
    expect(Object.values(report.safety).every((value) => value === false)).toBe(true);
    expect(report.upstream_health.action309).toBe("passed");
    expect(report.upstream_health.golden_static_safety).toBe("passed");
    expect(report.runtime_preview_status).toBe("runtime_preview_waiting_for_operator_inputs");
  });

  test("keeps the remediation scoped and requires independent verification next", () => {
    expect(report.unrelated_work_classification).toBe(
      "action_438_confidence_calibration_advisory_adapter_complete_semantic_binding_remediation_only",
    );
    expect(report.recommended_next_action).toBe("action_439_independent_complete_semantic_binding_verification");
  });
});
