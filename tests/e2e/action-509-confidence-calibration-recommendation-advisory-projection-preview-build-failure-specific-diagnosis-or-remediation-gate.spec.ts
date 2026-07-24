import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join, resolve } from "path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const recordPath =
  "docs/action-509-confidence-calibration-recommendation-advisory-projection-preview-build-failure-specific-diagnosis-remediation-approval-record.json";
const docPath =
  "docs/action-509-confidence-calibration-recommendation-advisory-projection-preview-build-failure-specific-diagnosis-or-remediation-gate.md";
const verifierPath =
  "scripts/action-509-confidence-calibration-recommendation-advisory-projection-preview-build-failure-specific-diagnosis-or-remediation-gate-verify.mjs";
const action507VerifierPath =
  "scripts/action-507-confidence-calibration-recommendation-advisory-projection-preview-turbopack-comparison-invocation-completion-gate-verify.mjs";
const action508VerifierPath =
  "scripts/action-508-confidence-calibration-recommendation-advisory-projection-preview-turbopack-runner-environment-comparison-and-runtime-complete-candidate-rehearsal-verify.mjs";

type Action509Record = {
  change_candidate_hash: string;
  full_candidate_inventory_hash: string;
  candidate_file_count: number;
  authoritative_error_class: string;
  authoritative_os_classification: string;
  comparison_error_class: string;
  webpack_failure_classification_vocabulary: string[];
  webpack_failure_classification: string;
  first_causal_webpack_error: Record<string, unknown>;
  implicated_paths: Array<Record<string, unknown>>;
  webpack_implicated_paths: unknown[];
  implicated_path_classification_vocabulary: string[];
  implicated_paths_resolved: boolean;
  dual_failure_relationship_vocabulary: string[];
  dual_failure_relationship: string;
  relationship_support: {
    shared_causality_proven: boolean;
  };
  candidate_defect_vocabulary: string[];
  candidate_defect_status: string;
  candidate_hash_impact_vocabulary: string[];
  candidate_hash_impact: string;
  remediation_class_vocabulary: string[];
  remediation_class: string;
  remediation_mapping: Record<string, string>;
  approval_decision: string;
  runtime_preview_state: string;
  next_action: string;
  [key: string]: unknown;
};

function read(relativePath: string): string {
  return readFileSync(join(root, relativePath), "utf8");
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(read(relativePath)) as T;
}

function runVerifier(relativePath: string): Record<string, unknown> {
  return JSON.parse(execFileSync("node", [relativePath], { cwd: root, encoding: "utf8" })) as Record<string, unknown>;
}

test.describe("Action 509 build-failure diagnosis remediation gate", () => {
  test("binds Action 508 failed result and exact candidate hashes", () => {
    expect(existsSync(join(root, recordPath))).toBe(true);
    expect(existsSync(join(root, docPath))).toBe(true);
    expect(existsSync(join(root, verifierPath))).toBe(true);
    const record = readJson<Action509Record>(recordPath);
    expect(record.action_508_candidate_result).toBe("full_candidate_rehearsal_failed");
    expect(record.change_candidate_hash).toBe("c005946d3a21df32730306687d125ef1ba4439500da7ec22288ec92d802d667c");
    expect(record.full_candidate_inventory_hash).toBe("d96af34b0c488ef16f614b2be731052c2099e0b6efde57f76115eb8d5c779a0f");
    expect(record.candidate_file_count).toBe(31);
  });

  test("records authoritative Turbopack resource error and comparison type compile error", () => {
    const record = readJson<Action509Record>(recordPath);
    expect(record.authoritative_error_class).toBe("process_resource_error");
    expect(record.authoritative_os_classification).toBe("operation_not_permitted");
    expect(record.comparison_error_class).toBe("type_or_compile_error");
    expect(record.same_error_class).toBe(false);
    expect(record.both_build_engines_failed).toBe(true);
  });

  test("freezes Webpack classification vocabulary and insufficient evidence path", () => {
    const record = readJson<Action509Record>(recordPath);
    expect(record.webpack_failure_classification_vocabulary).toContain("webpack_candidate_typescript_error");
    expect(record.webpack_failure_classification_vocabulary).toContain("webpack_dependency_compile_error");
    expect(record.webpack_failure_classification_vocabulary).toContain("webpack_runner_environment_error");
    expect(record.webpack_failure_classification_vocabulary).toContain("webpack_failure_evidence_insufficient");
    expect(record.webpack_failure_classification).toBe("webpack_failure_evidence_insufficient");
  });

  test("records no first causal Webpack path", () => {
    const record = readJson<Action509Record>(recordPath);
    expect(record.first_causal_webpack_error.available).toBe(false);
    expect(record.first_causal_webpack_error.evidence_status).toBe("not_retained_by_action_508");
    expect(record.webpack_implicated_paths).toEqual([]);
    expect(record.implicated_paths_resolved).toBe(false);
  });

  test("classifies retained authoritative implicated candidate path", () => {
    const record = readJson<Action509Record>(recordPath);
    expect(record.implicated_path_classification_vocabulary).toContain("runtime_candidate_file");
    expect(record.implicated_path_classification_vocabulary).toContain("dependency_file");
    expect(record.implicated_path_classification_vocabulary).toContain("unknown");
    expect(record.implicated_paths[0].path).toBe("app/globals.css");
    expect(record.implicated_paths[0].classification).toBe("clean_base_file");
    expect(record.implicated_paths[0].candidate_member).toBe(true);
  });

  test("freezes relationship vocabulary and ambiguous relationship", () => {
    const record = readJson<Action509Record>(recordPath);
    expect(record.dual_failure_relationship_vocabulary).toContain("independent_build_engine_failures");
    expect(record.dual_failure_relationship_vocabulary).toContain("shared_candidate_trigger_with_distinct_engine_failures");
    expect(record.dual_failure_relationship_vocabulary).toContain("dual_failure_relationship_ambiguous");
    expect(record.dual_failure_relationship).toBe("dual_failure_relationship_ambiguous");
    expect(record.relationship_support.shared_causality_proven).toBe(false);
  });

  test("freezes candidate defect and hash-impact paths", () => {
    const record = readJson<Action509Record>(recordPath);
    expect(record.candidate_defect_vocabulary).toContain("candidate_defect_proven");
    expect(record.candidate_defect_vocabulary).toContain("candidate_defect_not_proven");
    expect(record.candidate_defect_vocabulary).toContain("candidate_defect_status_unresolved");
    expect(record.candidate_defect_status).toBe("candidate_defect_status_unresolved");
    expect(record.candidate_hash_impact_vocabulary).toContain("candidate_hash_change_required");
    expect(record.candidate_hash_impact_vocabulary).toContain("candidate_hash_change_not_required");
    expect(record.candidate_hash_impact).toBe("candidate_hash_impact_unresolved");
  });

  test("maps remediation classes to next actions", () => {
    const record = readJson<Action509Record>(recordPath);
    expect(record.remediation_class_vocabulary).toContain("candidate_source_remediation_required");
    expect(record.remediation_class_vocabulary).toContain("build_runner_environment_remediation_required");
    expect(record.remediation_class_vocabulary).toContain("bounded_webpack_failure_diagnostic_completion_required");
    expect(record.remediation_mapping.candidate_source_remediation_required).toBe("action_510_candidate_build_source_remediation");
    expect(record.remediation_mapping.build_runner_environment_remediation_required).toBe(
      "action_510_candidate_build_runner_environment_remediation_gate",
    );
    expect(record.remediation_mapping.bounded_webpack_failure_diagnostic_completion_required).toBe(
      "action_510_webpack_build_failure_bounded_diagnostic_capture_gate",
    );
  });

  test("blocks approval and selects bounded Webpack diagnostic capture", () => {
    const record = readJson<Action509Record>(recordPath);
    expect(record.remediation_class).toBe("bounded_webpack_failure_diagnostic_completion_required");
    expect(record.approval_decision).toBe("blocked");
    expect(record.next_action).toBe("action_510_webpack_build_failure_bounded_diagnostic_capture_gate");
  });

  test("performs no build, comparison, candidate mutation, deployment, or activation", () => {
    const record = readJson<Action509Record>(recordPath);
    for (const key of [
      "candidate_modified",
      "build_performed",
      "comparison_performed",
      "rehearsal_performed",
      "deployment_performed",
      "preview_activated",
      "environment_modified",
      "network_used",
      "install_performed",
      "provider_called",
      "supabase_accessed",
      "persistence_created",
      "replay_created",
      "feedback_created",
      "confidence_applied",
      "downstream_behavior_changed",
    ]) {
      expect(record[key]).toBe(false);
    }
  });

  test("keeps runtime preview waiting and avoids sensitive evidence", () => {
    const record = readJson<Action509Record>(recordPath);
    expect(record.runtime_preview_state).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(record.raw_build_logs_recorded).toBe(false);
    expect(record.absolute_paths_recorded).toBe(false);
    expect(record.environment_values_recorded).toBe(false);
    expect(record.credential_values_recorded).toBe(false);
  });

  test("verifier succeeds and Actions 507-508 remain healthy", () => {
    const action507 = runVerifier(action507VerifierPath);
    const action508 = runVerifier(action508VerifierPath);
    const action509 = runVerifier(verifierPath);
    expect(action507.verification_status).toBe("passed");
    expect(action508.verification_status).toBe("passed");
    expect(action509.verification_status).toBe("passed");
  });

  test("documentation summarizes diagnostic decision", () => {
    const doc = read(docPath);
    expect(doc).toContain("Webpack failure classification: `webpack_failure_evidence_insufficient`");
    expect(doc).toContain("Candidate hash impact: `candidate_hash_impact_unresolved`");
    expect(doc).toContain("Next action: `action_510_webpack_build_failure_bounded_diagnostic_capture_gate`");
  });
});
