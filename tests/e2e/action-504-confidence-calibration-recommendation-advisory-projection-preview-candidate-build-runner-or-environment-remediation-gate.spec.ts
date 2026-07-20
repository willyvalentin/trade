import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join, resolve } from "path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const recordPath =
  "docs/action-504-confidence-calibration-recommendation-advisory-projection-preview-candidate-build-runner-environment-remediation-approval-record.json";
const docPath =
  "docs/action-504-confidence-calibration-recommendation-advisory-projection-preview-candidate-build-runner-or-environment-remediation-gate.md";
const verifierPath =
  "scripts/action-504-confidence-calibration-recommendation-advisory-projection-preview-candidate-build-runner-or-environment-remediation-gate-verify.mjs";
const action502VerifierPath =
  "scripts/action-502-confidence-calibration-recommendation-advisory-projection-preview-candidate-build-failure-diagnostic-evidence-completion-gate-verify.mjs";
const action503VerifierPath =
  "scripts/action-503-confidence-calibration-recommendation-advisory-projection-preview-candidate-build-failure-bounded-diagnostic-capture-verify.mjs";

type Action504Record = {
  action_503_diagnostic_result: string;
  build_phase: string;
  primary_error_class: string;
  root_cause_classification: string;
  candidate_hash_impact: string;
  implicated_path: string;
  candidate_source_defect_proven: boolean;
  candidate_configuration_defect_proven: boolean;
  change_candidate_hash: string;
  full_candidate_inventory_hash: string;
  candidate_file_count: number;
  remediation_scope: string;
  source_readability_policy: string;
  output_writability_policy: string;
  dependency_executable_mode_policy: string;
  sandbox_or_mount_policy: string;
  turbopack_policy: Record<string, unknown>;
  path_permission_contract: Record<string, unknown>;
  bounded_runner_metadata_inspection: {
    sandbox_or_mount_restriction: string;
  };
  candidate_preservation_requirements: Record<string, unknown>;
  future_action_505_boundary: Record<string, unknown>;
  approval_vocabulary: string[];
  runner_remediation_readiness_vocabulary: string[];
  runner_remediation_readiness: string;
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

test.describe("Action 504 runner or environment remediation gate", () => {
  test("binds Action 503 captured result and exact failure classification", () => {
    expect(existsSync(join(root, recordPath))).toBe(true);
    expect(existsSync(join(root, docPath))).toBe(true);
    expect(existsSync(join(root, verifierPath))).toBe(true);
    const record = readJson<Action504Record>(recordPath);
    expect(record.action_503_diagnostic_result).toBe("diagnostic_build_failure_captured");
    expect(record.build_phase).toBe("build_bundling");
    expect(record.primary_error_class).toBe("process_resource_error");
    expect(record.root_cause_classification).toBe("candidate_build_environment_contract_defect");
    expect(record.candidate_hash_impact).toBe("candidate_hash_change_not_required");
  });

  test("marks app/globals.css as implicated but not defective", () => {
    const record = readJson<Action504Record>(recordPath);
    expect(record.implicated_path).toBe("app/globals.css");
    expect(record.implicated_path_classification).toBe("clean_base_file");
    expect(record.candidate_source_defect_proven).toBe(false);
    expect(record.candidate_configuration_defect_proven).toBe(false);
    expect(record.candidate_hash_change_required).toBe(false);
  });

  test("preserves candidate hashes and source boundaries", () => {
    const record = readJson<Action504Record>(recordPath);
    expect(record.change_candidate_hash).toBe("c005946d3a21df32730306687d125ef1ba4439500da7ec22288ec92d802d667c");
    expect(record.full_candidate_inventory_hash).toBe("d96af34b0c488ef16f614b2be731052c2099e0b6efde57f76115eb8d5c779a0f");
    expect(record.candidate_file_count).toBe(31);
    expect(record.candidate_preservation_requirements.app_globals_css_unchanged_required).toBe(true);
    expect(record.candidate_preservation_requirements.package_json_unchanged_required).toBe(true);
    expect(record.candidate_preservation_requirements.preview_helper_unchanged_required).toBe(true);
  });

  test("sets temporary candidate readability, output writability, and dependency mode policies", () => {
    const record = readJson<Action504Record>(recordPath);
    expect(record.remediation_scope).toBe("runner_environment_contract_remediation");
    expect(record.source_readability_policy).toBe("candidate_source_files_readable_by_current_process");
    expect(record.output_writability_policy).toBe("generated_output_directories_writable_inside_action_temp_candidate");
    expect(record.dependency_executable_mode_policy).toBe("preserve_required_executable_modes_from_verified_local_copy");
    expect(record.sandbox_or_mount_policy).toBe("unresolved_precheck_required_before_rehearsal_retry");
  });

  test("prohibits elevated privileges, global permission changes, and active repository permission changes", () => {
    const record = readJson<Action504Record>(recordPath);
    expect(record.elevated_privilege_authorized).toBe(false);
    expect(record.global_permission_change_authorized).toBe(false);
    expect(record.broad_permission_weakening_authorized).toBe(false);
    expect(record.path_permission_contract.world_writable_required).toBe(false);
    expect(record.path_permission_contract.sudo_required).toBe(false);
    expect(record.path_permission_contract.active_repository_permissions_modified).toBe(false);
  });

  test("keeps sandbox or mount restriction unresolved for Action 505 prechecks", () => {
    const record = readJson<Action504Record>(recordPath);
    expect(record.bounded_runner_metadata_inspection.sandbox_or_mount_restriction).toBe("unresolved");
    expect(record.unresolved_conditions).toContain(
      "exact_sandbox_or_mount_restriction_must_be_classified_during_action_505_prechecks",
    );
  });

  test("enforces Turbopack comparison-only policy", () => {
    const record = readJson<Action504Record>(recordPath);
    expect(record.turbopack_policy.turbopack_process_resource_failure_recorded).toBe(true);
    expect(record.turbopack_policy.silently_replace_production_build_path).toBe(false);
    expect(record.turbopack_policy.non_turbopack_comparison_allowed).toBe(true);
    expect(record.turbopack_policy.non_turbopack_comparison_only).toBe(true);
    expect(record.turbopack_policy.non_turbopack_comparison_establishes_deployment_readiness).toBe(false);
  });

  test("freezes approval and readiness vocabularies", () => {
    const record = readJson<Action504Record>(recordPath);
    expect(record.approval_vocabulary).toEqual(["approved", "approved_with_conditions", "blocked"]);
    expect(record.runner_remediation_readiness_vocabulary).toEqual([
      "runner_environment_remediation_ready",
      "runner_environment_remediation_ready_with_conditions",
      "runner_environment_remediation_blocked",
    ]);
    expect(record.runner_remediation_readiness).toBe("runner_environment_remediation_ready_with_conditions");
    expect(record.approval_decision).toBe("approved_with_conditions");
  });

  test("freezes Action 505 boundary without deployment or activation", () => {
    const record = readJson<Action504Record>(recordPath);
    expect(record.future_action_505_boundary.max_rehearsal_attempts).toBe(1);
    expect(record.future_action_505_boundary.same_action_retry_allowed).toBe(false);
    expect(record.future_action_505_boundary.deployment_authorized).toBe(false);
    expect(record.future_action_505_boundary.activation_authorized).toBe(false);
    expect(record.future_action_505_boundary.network_or_install_authorized).toBe(false);
    expect(record.next_action).toBe("action_505_runner_environment_precheck_completion_gate");
  });

  test("performs no build, rehearsal, deployment, activation, install, provider, Supabase, replay, or confidence effects", () => {
    const record = readJson<Action504Record>(recordPath);
    for (const key of [
      "build_performed",
      "rehearsal_authorized",
      "rehearsal_performed",
      "deployment_authorized",
      "deployment_performed",
      "activation_authorized",
      "preview_activated",
      "dependency_install_authorized",
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
    const record = readJson<Action504Record>(recordPath);
    expect(record.runtime_preview_state).toBe("runtime_preview_waiting_for_operator_inputs");
  });

  test("verifier succeeds and Actions 502-503 remain healthy", () => {
    const action502 = runVerifier(action502VerifierPath);
    const action503 = runVerifier(action503VerifierPath);
    const action504 = runVerifier(verifierPath);
    expect(action502.verification_status).toBe("passed");
    expect(action503.verification_status).toBe("passed");
    expect(action504.verification_status).toBe("passed");
    expect(action504.approval_decision).toBe("approved_with_conditions");
  });

  test("documentation summarizes gate decision", () => {
    const doc = read(docPath);
    expect(doc).toContain("Build phase: `build_bundling`");
    expect(doc).toContain("Primary error class: `process_resource_error`");
    expect(doc).toContain("Primary remediation scope: `runner_environment_contract_remediation`");
    expect(doc).toContain("Next action: `action_505_runner_environment_precheck_completion_gate`");
  });
});
