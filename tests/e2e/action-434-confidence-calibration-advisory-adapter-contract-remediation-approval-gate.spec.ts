import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";

import { expect, test } from "@playwright/test";

type Action434Report = Readonly<{
  verification_status: string;
  approval_decision: "approved" | "approved_with_conditions" | "blocked";
  approval_vocabulary: readonly string[];
  root_cause_classification: string;
  checks: Record<string, boolean>;
  passed_conditions_count: number;
  failed_conditions_count: number;
  unresolved_conditions_count: number;
  failed_conditions: readonly string[];
  unresolved_conditions: readonly string[];
  exact_remaining_gaps: readonly string[];
  semantic_payload_definition: Record<string, boolean>;
  canonicalization_policy: Record<string, boolean>;
  result_hash_recomputation_policy: Record<string, boolean>;
  mismatch_policy: Record<string, boolean>;
  validation_order: Record<string, boolean>;
  attack_matrix: Record<string, boolean>;
  identity_result_hash_distinction: Record<string, boolean>;
  public_api_preservation: Record<string, boolean>;
  unaffected_behavior_preservation: Record<string, boolean>;
  action435_boundary: Readonly<{
    approved_files: readonly string[];
    forbidden_runtime_or_consumer_work: boolean;
  }>;
  action435_regression_inventory: Record<string, boolean>;
  mandatory_action436_audit: boolean;
  source_integrity: Record<string, Readonly<{ matches: boolean }>>;
  forbidden_artifacts_found: readonly string[];
  unexpected_action434_consumers: readonly string[];
  runtime_adapter_consumers: readonly string[];
  safety: Record<string, boolean>;
  upstream_health: Record<string, string>;
  runtime_preview_status: string;
  unrelated_work_classification: string;
  recommended_next_action: string;
  next_required_independent_audit: string;
}>;

const docPath = "docs/action-434-confidence-calibration-advisory-adapter-contract-remediation-approval-gate.md";
const verifierPath = "scripts/action-434-confidence-calibration-advisory-adapter-contract-remediation-approval-gate-verify.mjs";
const testPath = "tests/e2e/action-434-confidence-calibration-advisory-adapter-contract-remediation-approval-gate.spec.ts";

test.setTimeout(300000);

function runVerifier(): Action434Report {
  return JSON.parse(execFileSync("node", [verifierPath], { encoding: "utf8", timeout: 300000 })) as Action434Report;
}

test.describe.serial("Action 434 Confidence Calibration advisory adapter remediation approval gate", () => {
  let report: Action434Report;
  let doc: string;

  test.beforeAll(() => {
    report = runVerifier();
    doc = readFileSync(docPath, "utf8");
  });

  test("creates static approval-gate artifacts and approves a narrow Action 435 remediation", () => {
    expect(existsSync(docPath)).toBe(true);
    expect(existsSync(verifierPath)).toBe(true);
    expect(existsSync(testPath)).toBe(true);
    expect(doc).toContain("Action 434 - Confidence Calibration Advisory Adapter Contract Remediation Approval Gate");
    expect(report.verification_status).toBe("passed");
    expect(report.approval_vocabulary).toEqual(["approved", "approved_with_conditions", "blocked"]);
    expect(report.approval_decision).toBe("approved");
    expect(report.recommended_next_action).toBe("action_435_confidence_calibration_advisory_adapter_semantic_hash_remediation");
  });

  test("captures the Action 433 blocked finding and exact root cause", () => {
    expect(report.checks.action433_blocked_decision).toBe(true);
    expect(report.checks.exact_failed_condition).toBe(true);
    expect(report.root_cause_classification).toBe("calibration_semantic_result_hash_not_recomputed");
    expect(report.exact_remaining_gaps).toEqual([
      "swapped_result_hash_blocks",
      "changed_status_retained_hash_blocks",
      "changed_proposed_confidence_retained_hash_blocks",
      "changed_warning_inventory_retained_hash_blocks",
    ]);
    expect(doc).toContain("current adapter treats the supplied calibration result hash as lineage metadata");
  });

  test("freezes the semantic calibration payload and canonical result policy", () => {
    for (const key of [
      "status",
      "calibration_id",
      "calibration_hash",
      "original_confidence",
      "proposed_delta",
      "proposed_calibrated_confidence",
      "included_insight_ids",
      "excluded_insight_ids",
      "evidence_summary",
      "overlap_summary",
      "warnings",
      "issues",
      "lineage_hashes",
      "configuration_version",
      "non_authoritative",
      "applied",
    ]) {
      expect(report.semantic_payload_definition[key], key).toBe(true);
    }
    expect(Object.values(report.canonicalization_policy).every(Boolean)).toBe(true);
  });

  test("freezes SHA-256 recomputation and supplied versus recomputed comparison", () => {
    expect(Object.values(report.result_hash_recomputation_policy).every(Boolean)).toBe(true);
    expect(report.result_hash_recomputation_policy.sha256_canonical_payload).toBe(true);
    expect(report.result_hash_recomputation_policy.lowercase_hex).toBe(true);
    expect(report.result_hash_recomputation_policy.exact_compare).toBe(true);
    expect(report.result_hash_recomputation_policy.no_repair).toBe(true);
    expect(report.result_hash_recomputation_policy.no_warning_only).toBe(true);
    expect(report.result_hash_recomputation_policy.no_id_substitute).toBe(true);
  });

  test("freezes mismatch blocker behavior and phase-10 precedence", () => {
    expect(report.mismatch_policy.status).toBe(true);
    expect(report.mismatch_policy.issue_code).toBe(true);
    expect(report.mismatch_policy.path).toBe(true);
    expect(report.mismatch_policy.severity).toBe(true);
    expect(report.mismatch_policy.message_key).toBe(true);
    expect(report.mismatch_policy.no_raw_hash_values).toBe(true);
    expect(report.mismatch_policy.proposed_confidence_null).toBe(true);
    expect(Object.values(report.validation_order).every(Boolean)).toBe(true);
  });

  test("freezes the tampering attack matrix", () => {
    for (const key of [
      "supplied result hash replaced with another valid hash",
      "swapped result hash from another calibration",
      "status changed while retaining old result hash",
      "proposed delta changed while retaining old result hash",
      "proposed calibrated confidence changed while retaining old result hash",
      "warning inventory changed while retaining old result hash",
      "issue inventory changed while retaining old result hash",
      "included insight inventory changed while retaining old result hash",
      "excluded insight inventory changed while retaining old result hash",
      "overlap summary changed while retaining old result hash",
      "lineage hash changed while retaining old result hash",
      "advisory flags changed while retaining old result hash",
    ]) {
      expect(report.attack_matrix[key], key).toBe(true);
    }
  });

  test("preserves identity/result-hash distinction, public API, and unaffected behavior", () => {
    expect(Object.values(report.identity_result_hash_distinction).every(Boolean)).toBe(true);
    expect(Object.values(report.public_api_preservation).every(Boolean)).toBe(true);
    expect(Object.values(report.unaffected_behavior_preservation).every(Boolean)).toBe(true);
    expect(report.action435_boundary.approved_files).toContain("lib/confidence-calibration-advisory-adapter.ts");
    expect(report.action435_boundary.forbidden_runtime_or_consumer_work).toBe(true);
  });

  test("requires Action 435 regression matrix and mandatory Action 436 audit", () => {
    expect(Object.values(report.action435_regression_inventory).every(Boolean)).toBe(true);
    expect(report.mandatory_action436_audit).toBe(true);
    expect(report.next_required_independent_audit).toBe("action_436_independent_post_remediation_advisory_adapter_verification");
    expect(doc).toContain("The project must not proceed directly to fixtures after Action 435.");
  });

  test("keeps implementation, protected sources and runtime preview untouched", () => {
    expect(Object.values(report.source_integrity).every((entry) => entry.matches)).toBe(true);
    expect(report.forbidden_artifacts_found).toEqual([]);
    expect(report.unexpected_action434_consumers).toEqual([]);
    expect(report.runtime_adapter_consumers).toEqual([]);
    expect(Object.values(report.safety).every((value) => value === false)).toBe(true);
    expect(report.upstream_health.action432).toBe("passed");
    expect(report.upstream_health.action433).toBe("passed");
    expect(report.runtime_preview_status).toBe("runtime_preview_waiting_for_operator_inputs");
  });

  test("records passed failed unresolved counts consistently", () => {
    expect(report.failed_conditions).toEqual([]);
    expect(report.unresolved_conditions).toEqual([]);
    expect(report.failed_conditions_count).toBe(0);
    expect(report.unresolved_conditions_count).toBe(0);
    expect(report.passed_conditions_count).toBe(Object.keys(report.checks).length);
    expect(report.unrelated_work_classification).toBe(
      "action_434_confidence_calibration_advisory_adapter_contract_remediation_approval_gate_only",
    );
  });
});
