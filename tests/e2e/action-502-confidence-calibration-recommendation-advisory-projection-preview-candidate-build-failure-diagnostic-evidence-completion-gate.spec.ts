import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join, resolve } from "path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const recordPath =
  "docs/action-502-confidence-calibration-recommendation-advisory-projection-preview-candidate-build-failure-diagnostic-evidence-completion-approval-record.json";
const docPath =
  "docs/action-502-confidence-calibration-recommendation-advisory-projection-preview-candidate-build-failure-diagnostic-evidence-completion-gate.md";
const verifierPath =
  "scripts/action-502-confidence-calibration-recommendation-advisory-projection-preview-candidate-build-failure-diagnostic-evidence-completion-gate-verify.mjs";
const action501VerifierPath =
  "scripts/action-501-confidence-calibration-recommendation-advisory-projection-preview-candidate-rehearsal-build-failure-remediation-approval-gate-verify.mjs";
const action500VerifierPath =
  "scripts/action-500-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-build-rehearsal-retry-after-wrong-hash-rejection-remediation-verify.mjs";
const action492VerifierPath =
  "scripts/action-492-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-reconstruction-and-hash-freeze-verify.mjs";

type Action502Record = {
  action_501_decision: string;
  action_501_primary_classification: string;
  action_501_hash_impact: string;
  clean_base_identifier: string;
  change_candidate_hash: string;
  full_candidate_inventory_hash: string;
  candidate_file_count: number;
  diagnostic_classification: string;
  diagnostic_attempt_limit: number;
  diagnostic_command: string;
  prerequisite_gate_inventory: string[];
  sanitization_policy: string[];
  retained_evidence_limits: Record<string, unknown>;
  build_phase_vocabulary: string[];
  error_class_vocabulary: string[];
  path_classification_vocabulary: string[];
  stack_frame_ownership_vocabulary: string[];
  unrelated_dirty_worktree_detection_result: string;
  root_cause_classification_vocabulary: string[];
  hash_impact_vocabulary: string[];
  hash_impact_policy: Record<string, unknown>;
  remediation_mapping: Record<string, string>;
  diagnostic_result_vocabulary: string[];
  future_diagnostic_execution_action: string;
  approval_decision: string;
  unresolved_conditions: string[];
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
  return JSON.parse(execFileSync("node", [relativePath], { cwd: root, encoding: "utf8" })) as Record<
    string,
    unknown
  >;
}

test.describe("Action 502 candidate build-failure diagnostic evidence completion gate", () => {
  test("binds Action 501 blocked result and exact Action 492 candidate hashes", () => {
    expect(existsSync(join(root, recordPath))).toBe(true);
    expect(existsSync(join(root, docPath))).toBe(true);
    expect(existsSync(join(root, verifierPath))).toBe(true);
    const record = readJson<Action502Record>(recordPath);
    expect(record.action_501_decision).toBe("blocked");
    expect(record.action_501_primary_classification).toBe("build_failure_evidence_insufficient");
    expect(record.action_501_hash_impact).toBe("candidate_hash_impact_unresolved");
    expect(record.clean_base_identifier).toBe("15f9923c24ed1f3cf82d34656eeacbfd98a0d347");
    expect(record.change_candidate_hash).toBe("c005946d3a21df32730306687d125ef1ba4439500da7ec22288ec92d802d667c");
    expect(record.full_candidate_inventory_hash).toBe("d96af34b0c488ef16f614b2be731052c2099e0b6efde57f76115eb8d5c779a0f");
    expect(record.candidate_file_count).toBe(31);
  });

  test("freezes diagnostic-only scope, one attempt, and exact build command", () => {
    const record = readJson<Action502Record>(recordPath);
    expect(record.diagnostic_classification).toBe("bounded_candidate_build_failure_diagnostic_capture");
    expect(record.diagnostic_attempt_limit).toBe(1);
    expect(record.same_action_retry_authorized).toBe(false);
    expect(record.diagnostic_counts_as_successful_rehearsal).toBe(false);
    expect(record.diagnostic_command).toBe("npm run build");
    expect(record.diagnostic_build_success_deployment_authorized).toBe(false);
  });

  test("requires prerequisite gates before any future diagnostic build", () => {
    const record = readJson<Action502Record>(recordPath);
    for (const gate of [
      "safe_canonical_temp_path",
      "exact_candidate_reconstruction",
      "runtime_closure_complete",
      "source_integrity_passed",
      "source_safety_passed",
      "strict_hash_matrix_passed",
      "preview_flag_disabled_verified",
      "dependency_materialization_passed",
      "five_extraneous_packages_excluded",
      "no_network_install_update",
    ]) {
      expect(record.prerequisite_gate_inventory).toContain(gate);
    }
  });

  test("freezes redaction for absolute paths, HOME paths, environment values, tokens, and credentials", () => {
    const record = readJson<Action502Record>(recordPath);
    expect(record.sanitization_policy).toContain("remove_absolute_machine_paths");
    expect(record.sanitization_policy).toContain("remove_home_paths");
    expect(record.sanitization_policy).toContain("remove_environment_values");
    expect(record.sanitization_policy).toContain("remove_tokens");
    expect(record.sanitization_policy).toContain("remove_netlify_credentials");
    expect(record.sanitization_policy).toContain("remove_supabase_keys");
    expect(record.sanitization_policy).toContain("remove_provider_keys");
    expect(record.sanitization_policy).toContain("remove_high_confidence_secret_like_values");
    expect(record.sanitization_policy).toContain("retain_repository_relative_paths_only");
    expect(record.raw_environment_values_recorded).toBe(false);
    expect(record.credential_values_recorded).toBe(false);
    expect(record.absolute_machine_paths_recorded).toBe(false);
    expect(record.home_paths_recorded).toBe(false);
  });

  test("bounds retained diagnostic lines, paths, stack classifications, and raw logs", () => {
    const record = readJson<Action502Record>(recordPath);
    expect(record.retained_evidence_limits.primary_diagnostic_summary_max).toBe(1);
    expect(record.retained_evidence_limits.sanitized_diagnostic_lines_max).toBe(10);
    expect(record.retained_evidence_limits.repository_relative_path_references_max).toBe(10);
    expect(record.retained_evidence_limits.sanitized_stack_classifications_max).toBe(5);
    expect(record.retained_evidence_limits.raw_stdout_retained).toBe(false);
    expect(record.retained_evidence_limits.raw_stderr_retained).toBe(false);
    expect(record.retained_evidence_limits.full_logs_retained).toBe(false);
  });

  test("freezes build phase, error class, and path vocabularies", () => {
    const record = readJson<Action502Record>(recordPath);
    expect(record.build_phase_vocabulary).toContain("build_configuration_loading");
    expect(record.build_phase_vocabulary).toContain("build_static_generation");
    expect(record.build_phase_vocabulary).toContain("build_phase_unknown");
    expect(record.error_class_vocabulary).toContain("module_resolution_error");
    expect(record.error_class_vocabulary).toContain("server_client_boundary_error");
    expect(record.error_class_vocabulary).toContain("internal_framework_error");
    expect(record.error_class_vocabulary).toContain("unknown_build_error");
    expect(record.path_classification_vocabulary).toContain("runtime_candidate_file");
    expect(record.path_classification_vocabulary).toContain("added_runtime_file");
    expect(record.path_classification_vocabulary).toContain("rehearsal_runner_file");
    expect(record.path_classification_vocabulary).toContain("unrelated_dirty_worktree_file");
  });

  test("distinguishes candidate, dependency, framework, runner, and contamination evidence", () => {
    const record = readJson<Action502Record>(recordPath);
    expect(record.stack_frame_ownership_vocabulary).toContain("candidate_source");
    expect(record.stack_frame_ownership_vocabulary).toContain("dependency_code");
    expect(record.stack_frame_ownership_vocabulary).toContain("next_js_internals");
    expect(record.stack_frame_ownership_vocabulary).toContain("rehearsal_runner");
    expect(record.unrelated_dirty_worktree_detection_result).toBe("rehearsal_boundary_contamination_suspected");
    expect(record.root_cause_classification_vocabulary).toContain("unrelated_source_contamination_detected");
  });

  test("freezes hash-impact rules and failure-not-reproduced path", () => {
    const record = readJson<Action502Record>(recordPath);
    expect(record.hash_impact_vocabulary).toContain("candidate_hash_change_required");
    expect(record.hash_impact_vocabulary).toContain("candidate_hash_change_not_required");
    expect(record.hash_impact_vocabulary).toContain("candidate_hash_impact_unresolved");
    expect(record.hash_impact_policy.candidate_source_or_configuration_change_requires_hash_change).toBe(true);
    expect(record.hash_impact_policy.diagnostic_runner_change_requires_hash_change).toBe(false);
    expect(record.hash_impact_policy.sanitized_logging_change_requires_hash_change).toBe(false);
    expect(record.root_cause_classification_vocabulary).toContain("build_failure_not_reproduced");
    expect(record.remediation_mapping.build_failure_not_reproduced).toBe(
      "action_504_candidate_build_failure_nondeterminism_assessment_gate",
    );
  });

  test("maps future diagnostics to Action 503 and Action 504 remediations", () => {
    const record = readJson<Action502Record>(recordPath);
    expect(record.future_diagnostic_execution_action).toBe("action_503_candidate_build_failure_bounded_diagnostic_capture");
    expect(record.next_action).toBe("action_503_candidate_build_failure_bounded_diagnostic_capture");
    expect(record.remediation_mapping.candidate_source_build_defect).toBe(
      "action_504_candidate_build_failure_source_remediation",
    );
    expect(record.remediation_mapping.candidate_build_configuration_defect).toBe(
      "action_504_candidate_build_configuration_remediation",
    );
    expect(record.remediation_mapping.candidate_dependency_materialization_defect).toBe(
      "action_504_candidate_build_dependency_materialization_remediation_gate",
    );
    expect(record.remediation_mapping.rehearsal_build_runner_defect).toBe(
      "action_504_candidate_build_runner_or_environment_remediation_gate",
    );
    expect(record.remediation_mapping.build_failure_evidence_still_insufficient).toBe(
      "action_504_candidate_build_failure_diagnostic_strategy_remediation_gate",
    );
  });

  test("does not execute build, modify source, authorize rehearsal, deploy, or activate", () => {
    const record = readJson<Action502Record>(recordPath);
    expect(record.approval_decision).toBe("approved");
    expect(record.unresolved_conditions).toEqual([]);
    for (const key of [
      "raw_logs_retained",
      "candidate_modified",
      "source_modified",
      "package_manifest_modified",
      "lockfile_modified",
      "environment_modified",
      "dependency_install_performed",
      "diagnostic_execution_authorized",
      "build_performed_by_action_502",
      "rehearsal_authorized",
      "rehearsal_performed",
      "deployment_authorized",
      "deployment_performed",
      "activation_authorized",
      "preview_activated",
      "provider_called",
      "supabase_accessed",
      "persistence_created",
      "replay_created",
      "confidence_applied",
      "downstream_behavior_changed",
    ]) {
      expect(record[key]).toBe(false);
    }
  });

  test("keeps runtime preview waiting", () => {
    const record = readJson<Action502Record>(recordPath);
    expect(record.runtime_preview_state).toBe("runtime_preview_waiting_for_operator_inputs");
  });

  test("verifier succeeds and Actions 492, 500, and 501 remain healthy", () => {
    const action492 = runVerifier(action492VerifierPath);
    const action500 = runVerifier(action500VerifierPath);
    const action501 = runVerifier(action501VerifierPath);
    const action502 = runVerifier(verifierPath);
    expect(action492.status).toBe("passed");
    expect(action500.verification_status).toBe("passed");
    expect(action501.verification_status).toBe("passed");
    expect(action502.verification_status).toBe("passed");
    expect(action502.approval_decision).toBe("approved");
    expect(action502.diagnostic_execution_authorized).toBe(false);
  });

  test("documentation records diagnostic boundary and no execution", () => {
    const doc = read(docPath);
    expect(doc).toContain("Approved diagnostic classification: `bounded_candidate_build_failure_diagnostic_capture`");
    expect(doc).toContain("Attempt limit: `1`");
    expect(doc).toContain("Action 503 may run exactly");
    expect(doc).toContain("Diagnostic execution authorized by this action: `false`");
    expect(doc).toContain("Next action: `action_503_candidate_build_failure_bounded_diagnostic_capture`");
  });
});
