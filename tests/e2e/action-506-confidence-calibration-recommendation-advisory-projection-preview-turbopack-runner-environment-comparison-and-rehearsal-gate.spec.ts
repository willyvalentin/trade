import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join, resolve } from "path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const recordPath =
  "docs/action-506-confidence-calibration-recommendation-advisory-projection-preview-turbopack-runner-environment-comparison-and-rehearsal-approval-record.json";
const docPath =
  "docs/action-506-confidence-calibration-recommendation-advisory-projection-preview-turbopack-runner-environment-comparison-and-rehearsal-gate.md";
const verifierPath =
  "scripts/action-506-confidence-calibration-recommendation-advisory-projection-preview-turbopack-runner-environment-comparison-and-rehearsal-gate-verify.mjs";
const action504VerifierPath =
  "scripts/action-504-confidence-calibration-recommendation-advisory-projection-preview-candidate-build-runner-or-environment-remediation-gate-verify.mjs";
const action505VerifierPath =
  "scripts/action-505-confidence-calibration-recommendation-advisory-projection-preview-runner-environment-precheck-completion-gate-verify.mjs";

type Action506Record = {
  action_505_precheck_readiness: string;
  clean_base_identifier: string;
  change_candidate_hash: string;
  full_candidate_inventory_hash: string;
  candidate_file_count: number;
  comparison_classification: string;
  authoritative_build_command: string;
  authoritative_build_classification: string;
  comparison_command_classification_vocabulary: string[];
  comparison_command_classification: string;
  comparison_invocation_exactness: string;
  comparison_can_establish_deployment_readiness: boolean;
  authoritative_build_required_for_readiness: boolean;
  comparison_outcome_vocabulary: string[];
  comparison_outcome_interpretation: Record<string, string>;
  comparison_attempt_limit: number;
  authoritative_rehearsal_attempt_limit: number;
  maximum_build_process_invocations: number;
  same_action_retry_allowed: boolean;
  two_authoritative_builds_allowed: boolean;
  future_action_507_sequence: string[];
  future_action_507_boundary: Record<string, unknown>;
  diagnostic_evidence_boundary: Record<string, boolean>;
  candidate_preservation: Record<string, unknown>;
  comparison_readiness_vocabulary: string[];
  comparison_readiness: string;
  rehearsal_readiness_vocabulary: string[];
  rehearsal_readiness: string;
  approval_vocabulary: string[];
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

test.describe("Action 506 Turbopack comparison and rehearsal gate", () => {
  test("binds Action 505 ready-with-conditions result and exact candidate hashes", () => {
    expect(existsSync(join(root, recordPath))).toBe(true);
    expect(existsSync(join(root, docPath))).toBe(true);
    expect(existsSync(join(root, verifierPath))).toBe(true);
    const record = readJson<Action506Record>(recordPath);
    expect(record.action_505_precheck_readiness).toBe("runner_environment_precheck_ready_with_conditions");
    expect(record.clean_base_identifier).toBe("15f9923c24ed1f3cf82d34656eeacbfd98a0d347");
    expect(record.change_candidate_hash).toBe("c005946d3a21df32730306687d125ef1ba4439500da7ec22288ec92d802d667c");
    expect(record.full_candidate_inventory_hash).toBe("d96af34b0c488ef16f614b2be731052c2099e0b6efde57f76115eb8d5c779a0f");
    expect(record.candidate_file_count).toBe(31);
  });

  test("preserves authoritative npm run build semantics", () => {
    const record = readJson<Action506Record>(recordPath);
    expect(record.authoritative_build_command).toBe("npm run build");
    expect(record.authoritative_build_classification).toBe("authoritative_turbopack_build");
    expect(record.authoritative_build_required_for_readiness).toBe(true);
    expect(record.comparison_can_establish_deployment_readiness).toBe(false);
  });

  test("freezes comparison-only classification vocabulary", () => {
    const record = readJson<Action506Record>(recordPath);
    expect(record.comparison_classification).toBe("turbopack_runner_environment_comparison");
    expect(record.comparison_command_classification_vocabulary).toEqual([
      "authoritative_turbopack_build",
      "comparison_non_turbopack_build",
      "comparison_not_available",
      "comparison_not_safe",
    ]);
    expect(record.comparison_command_classification).toBe("comparison_non_turbopack_build");
    expect(record.comparison_invocation_exactness).toBe("unresolved_local_tooling_precheck_required");
  });

  test("freezes Turbopack fail and comparison pass path", () => {
    const record = readJson<Action506Record>(recordPath);
    expect(record.comparison_outcome_vocabulary).toContain("turbopack_failed_comparison_passed");
    expect(record.comparison_outcome_interpretation.turbopack_failed_comparison_passed).toContain(
      "not_deployment_ready",
    );
  });

  test("freezes both-fail path", () => {
    const record = readJson<Action506Record>(recordPath);
    expect(record.comparison_outcome_vocabulary).toContain("turbopack_failed_comparison_failed");
    expect(record.comparison_outcome_interpretation.turbopack_failed_comparison_failed).toContain(
      "broader_build_environment_or_candidate_defect",
    );
  });

  test("freezes authoritative pass and no-comparison path", () => {
    const record = readJson<Action506Record>(recordPath);
    expect(record.comparison_outcome_vocabulary).toContain("turbopack_passed_comparison_not_required");
    expect(record.comparison_outcome_interpretation.turbopack_passed_comparison_not_required).toContain(
      "authoritative_rehearsal_may_continue",
    );
    expect(record.future_action_507_boundary.comparison_skipped_if_authoritative_build_succeeds).toBe(true);
  });

  test("freezes failure-not-reproduced and comparison-unavailable paths", () => {
    const record = readJson<Action506Record>(recordPath);
    expect(record.comparison_outcome_vocabulary).toContain("turbopack_failure_not_reproduced");
    expect(record.comparison_outcome_vocabulary).toContain("comparison_unavailable");
    expect(record.comparison_outcome_interpretation.turbopack_failure_not_reproduced).toContain(
      "nondeterminism_assessment",
    );
    expect(record.comparison_outcome_interpretation.comparison_unavailable).toContain("remediation_gate");
  });

  test("enforces attempt accounting and max two build invocations", () => {
    const record = readJson<Action506Record>(recordPath);
    expect(record.comparison_attempt_limit).toBe(1);
    expect(record.authoritative_rehearsal_attempt_limit).toBe(1);
    expect(record.maximum_build_process_invocations).toBe(2);
    expect(record.same_action_retry_allowed).toBe(false);
    expect(record.two_authoritative_builds_allowed).toBe(false);
    expect(record.future_action_507_boundary.maximum_total_build_process_invocations).toBe(2);
  });

  test("blocks package-script, candidate, config, and environment changes", () => {
    const record = readJson<Action506Record>(recordPath);
    expect(record.candidate_change_required).toBe(false);
    expect(record.package_script_change_required).toBe(false);
    expect(record.configuration_change_required).toBe(false);
    expect(record.package_or_lockfile_change_required).toBe(false);
    expect(record.environment_change_required).toBe(false);
  });

  test("keeps diagnostic evidence bounded and sanitized", () => {
    const record = readJson<Action506Record>(recordPath);
    expect(record.diagnostic_evidence_boundary.retain_command_classification).toBe(true);
    expect(record.diagnostic_evidence_boundary.retain_bounded_sanitized_summary).toBe(true);
    expect(record.diagnostic_evidence_boundary.retain_repository_relative_implicated_paths).toBe(true);
    expect(record.diagnostic_evidence_boundary.retain_full_logs).toBe(false);
    expect(record.diagnostic_evidence_boundary.retain_absolute_paths).toBe(false);
    expect(record.diagnostic_evidence_boundary.retain_environment_values).toBe(false);
    expect(record.diagnostic_evidence_boundary.retain_credentials).toBe(false);
    expect(record.diagnostic_evidence_boundary.retain_source_contents).toBe(false);
  });

  test("freezes Action 507 sequence and boundary", () => {
    const record = readJson<Action506Record>(recordPath);
    expect(record.future_action_507_sequence).toHaveLength(8);
    expect(record.future_action_507_sequence[0]).toBe("phase_0_safe_canonical_action_specific_temp_boundary");
    expect(record.future_action_507_boundary.comparison_must_use_same_reconstructed_action_492_candidate).toBe(true);
    expect(record.future_action_507_boundary.comparison_must_remain_local_offline).toBe(true);
    expect(record.future_action_507_boundary.authoritative_rehearsal_can_pass_only_when_npm_run_build_passes).toBe(true);
    expect(record.future_action_507_boundary.deployment_authorized).toBe(false);
    expect(record.future_action_507_boundary.activation_authorized).toBe(false);
  });

  test("freezes candidate preservation requirements", () => {
    const record = readJson<Action506Record>(recordPath);
    expect(record.candidate_preservation.candidate_count_required).toBe(31);
    expect(record.candidate_preservation.change_hash_required).toBe(record.change_candidate_hash);
    expect(record.candidate_preservation.full_inventory_hash_required).toBe(record.full_candidate_inventory_hash);
    expect(record.candidate_preservation.app_globals_css_unchanged_required).toBe(true);
    expect(record.candidate_preservation.package_json_unchanged_required).toBe(true);
    expect(record.candidate_preservation.package_lock_json_unchanged_required).toBe(true);
    expect(record.candidate_preservation.next_config_unchanged_required).toBe(true);
  });

  test("freezes readiness and approval vocabularies", () => {
    const record = readJson<Action506Record>(recordPath);
    expect(record.comparison_readiness_vocabulary).toEqual([
      "turbopack_comparison_ready",
      "turbopack_comparison_ready_with_conditions",
      "turbopack_comparison_blocked",
    ]);
    expect(record.rehearsal_readiness_vocabulary).toEqual([
      "runner_remediated_rehearsal_ready",
      "runner_remediated_rehearsal_ready_with_conditions",
      "runner_remediated_rehearsal_blocked",
    ]);
    expect(record.approval_vocabulary).toEqual(["approved", "approved_with_conditions", "blocked"]);
    expect(record.comparison_readiness).toBe("turbopack_comparison_ready_with_conditions");
    expect(record.rehearsal_readiness).toBe("runner_remediated_rehearsal_ready_with_conditions");
    expect(record.approval_decision).toBe("approved_with_conditions");
  });

  test("performs no build, comparison, rehearsal, deployment, activation, persistence, or downstream effects", () => {
    const record = readJson<Action506Record>(recordPath);
    for (const key of [
      "build_or_comparison_performed",
      "build_performed",
      "comparison_performed",
      "rehearsal_performed",
      "deployment_performed",
      "activation_performed",
      "deployment_authorized",
      "activation_authorized",
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
    ]) {
      expect(record[key]).toBe(false);
    }
  });

  test("keeps runtime preview waiting and selects the conditional Action 507 gate", () => {
    const record = readJson<Action506Record>(recordPath);
    expect(record.runtime_preview_state).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(record.unresolved_conditions).toEqual([
      "exact_supported_non_turbopack_comparison_invocation_must_be_resolved_from_local_installed_tooling_during_action_507_prechecks",
    ]);
    expect(record.next_action).toBe("action_507_turbopack_comparison_invocation_completion_gate");
  });

  test("verifier succeeds and Actions 504-505 remain healthy", () => {
    const action504 = runVerifier(action504VerifierPath);
    const action505 = runVerifier(action505VerifierPath);
    const action506 = runVerifier(verifierPath);
    expect(action504.verification_status).toBe("passed");
    expect(action505.verification_status).toBe("passed");
    expect(action506.verification_status).toBe("passed");
    expect(action506.approval_decision).toBe("approved_with_conditions");
  });

  test("documentation summarizes policy and next action", () => {
    const doc = read(docPath);
    expect(doc).toContain("Authoritative command: `npm run build`");
    expect(doc).toContain("Comparison can establish deployment readiness: `false`");
    expect(doc).toContain("Comparison readiness: `turbopack_comparison_ready_with_conditions`");
    expect(doc).toContain("Next action: `action_507_turbopack_comparison_invocation_completion_gate`");
  });
});
