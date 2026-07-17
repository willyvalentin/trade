import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join, resolve } from "path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const recordPath =
  "docs/action-510-confidence-calibration-recommendation-advisory-projection-preview-webpack-build-failure-bounded-diagnostic-capture-approval-record.json";
const docPath =
  "docs/action-510-confidence-calibration-recommendation-advisory-projection-preview-webpack-build-failure-bounded-diagnostic-capture-gate.md";
const verifierPath =
  "scripts/action-510-confidence-calibration-recommendation-advisory-projection-preview-webpack-build-failure-bounded-diagnostic-capture-gate-verify.mjs";
const action508VerifierPath =
  "scripts/action-508-confidence-calibration-recommendation-advisory-projection-preview-turbopack-runner-environment-comparison-and-runtime-complete-candidate-rehearsal-verify.mjs";
const action509VerifierPath =
  "scripts/action-509-confidence-calibration-recommendation-advisory-projection-preview-build-failure-specific-diagnosis-or-remediation-gate-verify.mjs";

type GateEntry = {
  gate: string;
  required_status: string | boolean;
};

type Action510Record = {
  action_509_decision: string;
  action_509_webpack_classification: string;
  clean_base_identifier: string;
  change_candidate_hash: string;
  full_candidate_inventory_hash: string;
  candidate_file_count: number;
  diagnostic_command: string;
  diagnostic_attempt_limit: number;
  authoritative_build_performed: boolean;
  prerequisite_gate_inventory: GateEntry[];
  sanitization_policy: string[];
  retained_evidence_limits: Record<string, number>;
  first_causal_error_extraction_policy: {
    prefer_earliest_specific_diagnostic: boolean;
    source_excerpts_retained: boolean;
  };
  webpack_subsystem_vocabulary: string[];
  webpack_error_class_vocabulary: string[];
  path_classification_vocabulary: string[];
  candidate_versus_runner_vocabulary: string[];
  dual_failure_relationship_vocabulary: string[];
  candidate_hash_impact_vocabulary: string[];
  candidate_hash_impact_rules: {
    required_only_for_exact_candidate_source_or_configuration_change: boolean;
  };
  diagnostic_result_vocabulary: string[];
  next_action_mapping: Record<string, string>;
  approval_decision: string;
  unresolved_conditions: string[];
  future_diagnostic_execution_authorized: boolean;
  diagnostic_execution_performed: boolean;
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

test.describe("Action 510 Webpack bounded diagnostic capture gate", () => {
  test("adds static approval artifacts and binds Action 509 blocked result", () => {
    expect(existsSync(join(root, recordPath))).toBe(true);
    expect(existsSync(join(root, docPath))).toBe(true);
    expect(existsSync(join(root, verifierPath))).toBe(true);
    const record = readJson<Action510Record>(recordPath);
    expect(record.action_509_decision).toBe("blocked");
    expect(record.action_509_webpack_classification).toBe("webpack_failure_evidence_insufficient");
  });

  test("freezes exact candidate hashes and file count", () => {
    const record = readJson<Action510Record>(recordPath);
    expect(record.clean_base_identifier).toBe("15f9923c24ed1f3cf82d34656eeacbfd98a0d347");
    expect(record.change_candidate_hash).toBe("c005946d3a21df32730306687d125ef1ba4439500da7ec22288ec92d802d667c");
    expect(record.full_candidate_inventory_hash).toBe("d96af34b0c488ef16f614b2be731052c2099e0b6efde57f76115eb8d5c779a0f");
    expect(record.candidate_file_count).toBe(31);
  });

  test("freezes exact Webpack command, one attempt, and no authoritative build", () => {
    const record = readJson<Action510Record>(recordPath);
    expect(record.diagnostic_command).toBe("next build --webpack");
    expect(record.diagnostic_attempt_limit).toBe(1);
    expect(record.diagnostic_retry_allowed).toBe(false);
    expect(record.authoritative_build_performed).toBe(false);
    expect(record.authoritative_build_authorized_for_action_511).toBe(false);
  });

  test("requires all prerequisite gates before future execution", () => {
    const record = readJson<Action510Record>(recordPath);
    const gates = new Map(record.prerequisite_gate_inventory.map((entry) => [entry.gate, entry.required_status]));
    expect(gates.get("safe_canonical_temp_path")).toBe("passed");
    expect(gates.get("exact_candidate_reconstruction")).toBe("passed");
    expect(gates.get("runtime_dependency_closure")).toBe("passed");
    expect(gates.get("source_integrity")).toBe("passed");
    expect(gates.get("source_safety")).toBe("passed");
    expect(gates.get("strict_wrong_hash_matrix")).toBe("passed");
    expect(gates.get("semantic_preview_flag")).toBe("preview_flag_disabled_verified");
    expect(gates.get("alternate_activation")).toBe(false);
    expect(gates.get("five_extraneous_packages")).toBe("excluded");
    expect(gates.get("no_network_install_update")).toBe(true);
  });

  test("freezes redaction and bounded evidence policies", () => {
    const record = readJson<Action510Record>(recordPath);
    expect(record.sanitization_policy).toContain("redact_absolute_repository_paths");
    expect(record.sanitization_policy).toContain("redact_home_paths");
    expect(record.sanitization_policy).toContain("redact_tokens");
    expect(record.sanitization_policy).toContain("redact_authorization_headers");
    expect(record.sanitization_policy).toContain("redact_environment_values");
    expect(record.allowed_retained_path_format).toBe("repository_relative_only");
    expect(record.unsanitized_log_file_allowed).toBe(false);
    expect(record.retained_evidence_limits.sanitized_diagnostic_lines).toBe(12);
    expect(record.retained_evidence_limits.implicated_repository_relative_paths).toBe(10);
  });

  test("freezes first causal error extraction without source excerpts", () => {
    const record = readJson<Action510Record>(recordPath);
    expect(record.first_causal_error_extraction_policy.prefer_earliest_specific_diagnostic).toBe(true);
    expect(record.first_causal_error_extraction_policy.source_excerpts_retained).toBe(false);
  });

  test("freezes Webpack subsystem and error-class vocabularies", () => {
    const record = readJson<Action510Record>(recordPath);
    expect(record.webpack_subsystem_vocabulary).toContain("webpack_typescript_validation");
    expect(record.webpack_subsystem_vocabulary).toContain("webpack_css_processing");
    expect(record.webpack_subsystem_vocabulary).toContain("webpack_module_resolution");
    expect(record.webpack_subsystem_vocabulary).toContain("webpack_internal_framework");
    expect(record.webpack_subsystem_vocabulary).toContain("webpack_subsystem_unknown");
    expect(record.webpack_error_class_vocabulary).toContain("webpack_candidate_typescript_error");
    expect(record.webpack_error_class_vocabulary).toContain("webpack_candidate_css_or_loader_error");
    expect(record.webpack_error_class_vocabulary).toContain("webpack_dependency_compile_error");
    expect(record.webpack_error_class_vocabulary).toContain("webpack_runner_environment_error");
    expect(record.webpack_error_class_vocabulary).toContain("webpack_unknown_build_error");
  });

  test("freezes path classifications for candidate, dependency, framework, and runner paths", () => {
    const record = readJson<Action510Record>(recordPath);
    expect(record.path_classification_vocabulary).toContain("runtime_candidate_file");
    expect(record.path_classification_vocabulary).toContain("clean_base_file");
    expect(record.path_classification_vocabulary).toContain("added_runtime_file");
    expect(record.path_classification_vocabulary).toContain("dependency_file");
    expect(record.path_classification_vocabulary).toContain("framework_internal");
    expect(record.path_classification_vocabulary).toContain("rehearsal_runner_file");
  });

  test("freezes candidate-versus-runner and dual-failure reassessment policies", () => {
    const record = readJson<Action510Record>(recordPath);
    expect(record.candidate_versus_runner_vocabulary).toContain("candidate_source_build_defect");
    expect(record.candidate_versus_runner_vocabulary).toContain("candidate_dependency_materialization_defect");
    expect(record.candidate_versus_runner_vocabulary).toContain("webpack_comparison_invocation_defect");
    expect(record.candidate_versus_runner_vocabulary).toContain("rehearsal_build_runner_defect");
    expect(record.candidate_versus_runner_vocabulary).toContain("webpack_failure_not_reproduced");
    expect(record.dual_failure_relationship_vocabulary).toContain("independent_build_engine_failures");
    expect(record.dual_failure_relationship_vocabulary).toContain("shared_environment_contract_failure");
    expect(record.dual_failure_relationship_rule).toBe("do_not_infer_shared_causality_from_matching_build_phase_only");
  });

  test("freezes hash impact and unexpected-pass mappings", () => {
    const record = readJson<Action510Record>(recordPath);
    expect(record.candidate_hash_impact_vocabulary).toContain("candidate_hash_change_required");
    expect(record.candidate_hash_impact_vocabulary).toContain("candidate_hash_change_not_required");
    expect(record.candidate_hash_impact_rules.required_only_for_exact_candidate_source_or_configuration_change).toBe(true);
    expect(record.diagnostic_result_vocabulary).toContain("webpack_diagnostic_passed_unexpectedly");
    expect(record.next_action_mapping.webpack_failure_not_reproduced).toBe(
      "action_512_dual_build_failure_nondeterminism_assessment_gate",
    );
    expect(record.next_action_mapping.webpack_failure_evidence_still_insufficient).toBe(
      "action_512_webpack_diagnostic_strategy_remediation_gate",
    );
  });

  test("approves Action 511 boundary but performs no execution now", () => {
    const record = readJson<Action510Record>(recordPath);
    expect(record.approval_decision).toBe("approved");
    expect(record.unresolved_conditions).toEqual([]);
    expect(record.future_diagnostic_execution_authorized).toBe(true);
    expect(record.diagnostic_execution_performed).toBe(false);
    expect(record.next_action).toBe("action_511_webpack_build_failure_bounded_diagnostic_capture");
  });

  test("performs no source change, build, deployment, activation, or persistence", () => {
    const record = readJson<Action510Record>(recordPath);
    for (const key of [
      "build_performed",
      "comparison_performed",
      "rehearsal_performed",
      "authoritative_build_executed",
      "webpack_build_executed",
      "candidate_modified",
      "package_modified",
      "lockfile_modified",
      "configuration_modified",
      "environment_modified",
      "network_used",
      "install_performed",
      "netlify_operation_performed",
      "provider_called",
      "supabase_accessed",
      "persistence_created",
      "replay_created",
      "feedback_created",
      "confidence_applied",
      "downstream_behavior_changed",
      "raw_logs_retained",
      "raw_environment_values_recorded",
      "credential_values_recorded",
      "deployment_performed",
      "preview_activated",
    ]) {
      expect(record[key]).toBe(false);
    }
  });

  test("keeps runtime preview waiting and documentation clear", () => {
    const record = readJson<Action510Record>(recordPath);
    const doc = read(docPath);
    expect(record.runtime_preview_state).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(doc).toContain("Diagnostic classification: `bounded_webpack_build_failure_diagnostic_capture`");
    expect(doc).toContain("Exact future command: `next build --webpack`");
    expect(doc).toContain("Attempt limit: `1`");
    expect(doc).toContain("Next action: `action_511_webpack_build_failure_bounded_diagnostic_capture`");
  });

  test("verifier succeeds and Actions 508-509 remain healthy", () => {
    const action508 = runVerifier(action508VerifierPath);
    const action509 = runVerifier(action509VerifierPath);
    const action510 = runVerifier(verifierPath);
    expect(action508.verification_status).toBe("passed");
    expect(action509.verification_status).toBe("passed");
    expect(action510.verification_status).toBe("passed");
  });
});
