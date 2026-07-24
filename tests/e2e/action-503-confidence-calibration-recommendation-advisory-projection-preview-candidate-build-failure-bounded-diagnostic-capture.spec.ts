import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join, resolve } from "path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const recordPath =
  "docs/action-503-confidence-calibration-recommendation-advisory-projection-preview-candidate-build-failure-bounded-diagnostic-record.json";
const docPath =
  "docs/action-503-confidence-calibration-recommendation-advisory-projection-preview-candidate-build-failure-bounded-diagnostic-capture.md";
const verifierPath =
  "scripts/action-503-confidence-calibration-recommendation-advisory-projection-preview-candidate-build-failure-bounded-diagnostic-capture-verify.mjs";
const action501VerifierPath =
  "scripts/action-501-confidence-calibration-recommendation-advisory-projection-preview-candidate-rehearsal-build-failure-remediation-approval-gate-verify.mjs";
const action502VerifierPath =
  "scripts/action-502-confidence-calibration-recommendation-advisory-projection-preview-candidate-build-failure-diagnostic-evidence-completion-gate-verify.mjs";

type Action503Record = {
  action_502_approval_decision: string;
  change_candidate_hash: string;
  full_candidate_inventory_hash: string;
  candidate_file_count: number;
  diagnostic_attempt_count: number;
  diagnostic_command: string;
  prerequisite_gate_results: Record<string, string>;
  dependency_materialization_result: string;
  network_used: boolean;
  install_performed: boolean;
  dependency_update_performed: boolean;
  build_started: boolean;
  build_passed: boolean;
  build_exit_code: number;
  build_phase: string;
  primary_error_class: string;
  first_causal_error: Record<string, unknown>;
  implicated_paths: Array<Record<string, unknown>>;
  sanitized_diagnostic_lines: string[];
  sanitized_stack_classifications: Array<Record<string, unknown>>;
  retained_evidence_limits: Record<string, number | boolean>;
  build_phase_vocabulary: string[];
  error_class_vocabulary: string[];
  path_classification_vocabulary: string[];
  diagnostic_result_vocabulary: string[];
  root_cause_classification_vocabulary: string[];
  rehearsal_boundary_contamination_suspected: boolean;
  root_cause_classification: string;
  candidate_hash_impact: string;
  cleanup_result: string;
  diagnostic_result: string;
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

test.describe("Action 503 bounded diagnostic capture", () => {
  test("records Action 502 approval and exact candidate bindings", () => {
    expect(existsSync(join(root, recordPath))).toBe(true);
    expect(existsSync(join(root, docPath))).toBe(true);
    expect(existsSync(join(root, verifierPath))).toBe(true);
    const record = readJson<Action503Record>(recordPath);
    expect(record.action_502_approval_decision).toBe("approved");
    expect(record.change_candidate_hash).toBe("c005946d3a21df32730306687d125ef1ba4439500da7ec22288ec92d802d667c");
    expect(record.full_candidate_inventory_hash).toBe("d96af34b0c488ef16f614b2be731052c2099e0b6efde57f76115eb8d5c779a0f");
    expect(record.candidate_file_count).toBe(31);
  });

  test("freezes one attempt and exact build command", () => {
    const record = readJson<Action503Record>(recordPath);
    expect(record.diagnostic_attempt_count).toBe(1);
    expect(record.diagnostic_command).toBe("npm run build");
    expect(record.build_started).toBe(true);
  });

  test("records safe temp path and prerequisite gates", () => {
    const record = readJson<Action503Record>(recordPath);
    expect(record.safe_temp_subtree).toBe("ture/action-503-confidence-calibration-projection-preview-build-diagnostic");
    expect(record.temp_path_absolute_value_recorded).toBe(false);
    for (const gate of [
      "safe_canonical_temp_path",
      "exact_candidate_reconstruction",
      "runtime_closure_complete",
      "source_inventory",
      "source_integrity",
      "source_safety",
      "strict_wrong_hash_matrix",
    ]) {
      expect(record.prerequisite_gate_results[gate]).toBe("passed");
    }
    expect(record.prerequisite_gate_results.semantic_preview_flag).toBe("preview_flag_disabled_verified");
  });

  test("uses dependency copy without network, install, or update", () => {
    const record = readJson<Action503Record>(recordPath);
    expect(record.dependency_materialization_result).toBe("passed_temporary_verified_node_modules_copy");
    expect(record.network_used).toBe(false);
    expect(record.install_performed).toBe(false);
    expect(record.dependency_update_performed).toBe(false);
    expect(record.extraneous_packages_excluded).toBe(true);
    expect(record.extraneous_dependency_influence_result).toBe("no_influence_detected");
  });

  test("captures the build failure and also freezes alternate result paths", () => {
    const record = readJson<Action503Record>(recordPath);
    expect(record.diagnostic_result).toBe("diagnostic_build_failure_captured");
    expect(record.build_passed).toBe(false);
    expect(record.build_exit_code).toBe(1);
    expect(record.diagnostic_result_vocabulary).toContain("diagnostic_build_passed_unexpectedly");
    expect(record.diagnostic_result_vocabulary).toContain("diagnostic_build_aborted");
    expect(record.diagnostic_result_vocabulary).toContain("diagnostic_capture_failed");
  });

  test("sanitizes absolute paths, HOME paths, tokens, and environment values", () => {
    const record = readJson<Action503Record>(recordPath);
    expect(record.raw_logs_retained).toBe(false);
    expect(record.raw_environment_values_recorded).toBe(false);
    expect(record.credential_values_recorded).toBe(false);
    expect(record.absolute_machine_paths_recorded).toBe(false);
    expect(record.home_paths_recorded).toBe(false);
    const retained = JSON.stringify({
      first: record.first_causal_error,
      lines: record.sanitized_diagnostic_lines,
      paths: record.implicated_paths,
    });
    expect(retained).not.toContain("/Users/");
    expect(retained).not.toContain("/private/var/");
    expect(retained).not.toContain("Bearer ");
  });

  test("keeps bounded line, path, and stack counts", () => {
    const record = readJson<Action503Record>(recordPath);
    expect(record.retained_evidence_limits.sanitized_diagnostic_line_count).toBeLessThanOrEqual(10);
    expect(record.retained_evidence_limits.repository_relative_path_reference_count).toBeLessThanOrEqual(10);
    expect(record.retained_evidence_limits.sanitized_stack_classification_count).toBeLessThanOrEqual(5);
    expect(record.retained_evidence_limits.raw_stdout_retained).toBe(false);
    expect(record.retained_evidence_limits.raw_stderr_retained).toBe(false);
  });

  test("classifies build phase, error class, and first causal error", () => {
    const record = readJson<Action503Record>(recordPath);
    expect(record.build_phase_vocabulary).toContain(record.build_phase);
    expect(record.error_class_vocabulary).toContain(record.primary_error_class);
    expect(record.build_phase).toBe("build_bundling");
    expect(record.primary_error_class).toBe("process_resource_error");
    expect(record.first_causal_error.repository_relative_path).toBe("app/globals.css");
  });

  test("classifies candidate, dependency/framework, runner, and contamination vocabularies", () => {
    const record = readJson<Action503Record>(recordPath);
    expect(record.path_classification_vocabulary).toContain("clean_base_file");
    expect(record.path_classification_vocabulary).toContain("dependency_file");
    expect(record.path_classification_vocabulary).toContain("framework_internal");
    expect(record.path_classification_vocabulary).toContain("rehearsal_runner_file");
    expect(record.implicated_paths[0]).toMatchObject({
      path: "app/globals.css",
      classification: "clean_base_file",
      candidate_membership: true,
      implicated_role: "contextual",
    });
    expect(record.sanitized_stack_classifications.some((item) => item.classification === "next_js_internals")).toBe(true);
    expect(record.rehearsal_boundary_contamination_suspected).toBe(false);
  });

  test("sets root cause, candidate hash impact, and next action", () => {
    const record = readJson<Action503Record>(recordPath);
    expect(record.root_cause_classification_vocabulary).toContain("candidate_build_environment_contract_defect");
    expect(record.root_cause_classification_vocabulary).toContain("build_failure_not_reproduced");
    expect(record.root_cause_classification).toBe("candidate_build_environment_contract_defect");
    expect(record.candidate_hash_impact).toBe("candidate_hash_change_not_required");
    expect(record.next_action).toBe("action_504_candidate_build_runner_or_environment_remediation_gate");
  });

  test("cleans up and performs no rehearsal, deployment, activation, provider, Supabase, replay, or confidence effects", () => {
    const record = readJson<Action503Record>(recordPath);
    expect(record.cleanup_result).toBe("cleanup_passed");
    expect(record.temporary_candidate_absent_after_cleanup).toBe(true);
    for (const key of [
      "candidate_modified",
      "source_modified",
      "package_or_lockfile_modified",
      "configuration_modified",
      "environment_modified",
      "deployment_performed",
      "preview_activated",
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

  test("keeps runtime preview waiting", () => {
    const record = readJson<Action503Record>(recordPath);
    expect(record.runtime_preview_state).toBe("runtime_preview_waiting_for_operator_inputs");
  });

  test("verifier succeeds and Actions 501-502 remain healthy", () => {
    const action501 = runVerifier(action501VerifierPath);
    const action502 = runVerifier(action502VerifierPath);
    const action503 = runVerifier(verifierPath);
    expect(action501.verification_status).toBe("passed");
    expect(action502.verification_status).toBe("passed");
    expect(action503.verification_status).toBe("passed");
    expect(action503.diagnostic_result).toBe("diagnostic_build_failure_captured");
  });

  test("documentation summarizes diagnostic result without raw logs", () => {
    const doc = read(docPath);
    expect(doc).toContain("Build phase: `build_bundling`");
    expect(doc).toContain("Primary error class: `process_resource_error`");
    expect(doc).toContain("Root-cause classification: `candidate_build_environment_contract_defect`");
    expect(doc).toContain("Next action: `action_504_candidate_build_runner_or_environment_remediation_gate`");
  });
});
