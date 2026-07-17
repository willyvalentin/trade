import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join, resolve } from "path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const recordPath =
  "docs/action-505-confidence-calibration-recommendation-advisory-projection-preview-runner-environment-precheck-record.json";
const docPath =
  "docs/action-505-confidence-calibration-recommendation-advisory-projection-preview-runner-environment-precheck-completion-gate.md";
const verifierPath =
  "scripts/action-505-confidence-calibration-recommendation-advisory-projection-preview-runner-environment-precheck-completion-gate-verify.mjs";
const action503VerifierPath =
  "scripts/action-503-confidence-calibration-recommendation-advisory-projection-preview-candidate-build-failure-bounded-diagnostic-capture-verify.mjs";
const action504VerifierPath =
  "scripts/action-504-confidence-calibration-recommendation-advisory-projection-preview-candidate-build-runner-or-environment-remediation-gate-verify.mjs";

type Action505Record = {
  action_504_approval_decision: string;
  change_candidate_hash: string;
  full_candidate_inventory_hash: string;
  candidate_file_count: number;
  source_readability: string;
  directory_traversal: string;
  output_parent_writability: string;
  nested_output_writability: string;
  temporary_file_round_trip: string;
  dependency_copy_available: string;
  required_binary_modes_preserved: string;
  dependency_readability: string;
  source_dependency_tree_modified: boolean;
  child_process_capability: string;
  local_binary_execution: string;
  bounded_file_resource_operation: string;
  temp_boundary_classification: string;
  approved_execution_root_classification: string;
  remediation_strategy: string;
  turbopack_comparison_policy: string;
  readiness_vocabulary: string[];
  approval_vocabulary: string[];
  precheck_readiness: string;
  approval_decision: string;
  future_action_506_boundary: Record<string, unknown>;
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

test.describe("Action 505 runner environment precheck completion gate", () => {
  test("binds Action 504 approved-with-conditions result and candidate hashes", () => {
    expect(existsSync(join(root, recordPath))).toBe(true);
    expect(existsSync(join(root, docPath))).toBe(true);
    expect(existsSync(join(root, verifierPath))).toBe(true);
    const record = readJson<Action505Record>(recordPath);
    expect(record.action_504_approval_decision).toBe("approved_with_conditions");
    expect(record.change_candidate_hash).toBe("c005946d3a21df32730306687d125ef1ba4439500da7ec22288ec92d802d667c");
    expect(record.full_candidate_inventory_hash).toBe("d96af34b0c488ef16f614b2be731052c2099e0b6efde57f76115eb8d5c779a0f");
    expect(record.candidate_file_count).toBe(31);
  });

  test("records source readability and directory traversal", () => {
    const record = readJson<Action505Record>(recordPath);
    expect(record.source_exists).toBe(true);
    expect(record.source_hash_matches).toBe(true);
    expect(record.source_readability).toBe("passed");
    expect(record.directory_traversal).toBe("passed");
    expect(record.source_contents_recorded).toBe(false);
  });

  test("records output write/read/delete and nested directory round trip", () => {
    const record = readJson<Action505Record>(recordPath);
    expect(record.output_parent_writability).toBe("passed");
    expect(record.nested_output_writability).toBe("passed");
    expect(record.temporary_file_round_trip).toBe("passed");
    expect(record.output_cleanup).toBe("passed");
  });

  test("records dependency executable-mode preservation and source node_modules unchanged", () => {
    const record = readJson<Action505Record>(recordPath);
    expect(record.dependency_copy_available).toBe("passed");
    expect(record.required_binary_modes_preserved).toBe("passed");
    expect(record.dependency_readability).toBe("passed");
    expect(record.source_dependency_tree_modified).toBe(false);
    expect(record.install_performed).toBe(false);
    expect(record.network_used).toBe(false);
  });

  test("records child process, local binary, and resource-operation capabilities", () => {
    const record = readJson<Action505Record>(recordPath);
    expect(record.child_process_capability).toBe("passed");
    expect(record.local_binary_execution).toBe("passed");
    expect(record.bounded_file_resource_operation).toBe("passed");
  });

  test("classifies system-temp and safe-root outcomes", () => {
    const record = readJson<Action505Record>(recordPath);
    expect(record.temp_boundary_classification_vocabulary).toContain("temp_boundary_normal_local_filesystem");
    expect(record.temp_boundary_classification_vocabulary).toContain("temp_boundary_restricted_mount_detected");
    expect(record.temp_boundary_classification).toBe("temp_boundary_restriction_not_detected");
    expect(record.approved_execution_root_vocabulary).toContain("approved_alternate_local_ephemeral_root");
    expect(record.approved_execution_root_vocabulary).toContain("no_safe_ephemeral_root_available");
    expect(record.approved_execution_root_classification).toBe("canonical_system_temp");
  });

  test("sets remediation strategy and Turbopack policy", () => {
    const record = readJson<Action505Record>(recordPath);
    expect(record.remediation_strategy).toBe("bounded_turbopack_runner_environment_adjustment");
    expect(record.turbopack_comparison_policy).toBe("turbopack_comparison_recommended_for_diagnosis_only");
  });

  test("freezes readiness and approval vocabularies", () => {
    const record = readJson<Action505Record>(recordPath);
    expect(record.readiness_vocabulary).toEqual([
      "runner_environment_precheck_ready",
      "runner_environment_precheck_ready_with_conditions",
      "runner_environment_precheck_blocked",
    ]);
    expect(record.approval_vocabulary).toEqual(["approved", "approved_with_conditions", "blocked"]);
    expect(record.precheck_readiness).toBe("runner_environment_precheck_ready_with_conditions");
    expect(record.approval_decision).toBe("approved_with_conditions");
  });

  test("freezes Action 506 boundary without deployment or activation", () => {
    const record = readJson<Action505Record>(recordPath);
    expect(record.future_action_506_boundary.max_rehearsal_attempts).toBe(1);
    expect(record.future_action_506_boundary.same_action_retry_allowed).toBe(false);
    expect(record.future_action_506_boundary.build_command).toBe("npm run build");
    expect(record.future_action_506_boundary.turbopack_comparison_only_for_diagnosis).toBe(true);
    expect(record.future_action_506_boundary.deployment_authorized).toBe(false);
    expect(record.future_action_506_boundary.activation_authorized).toBe(false);
    expect(record.next_action).toBe("action_506_turbopack_runner_environment_comparison_and_rehearsal_gate");
  });

  test("performs no sudo, global permission, candidate, package, build, rehearsal, deployment, activation, or persistence effects", () => {
    const record = readJson<Action505Record>(recordPath);
    for (const key of [
      "elevated_privilege_required",
      "sudo_used",
      "global_permission_change_required",
      "global_permission_change_performed",
      "candidate_source_change_required",
      "candidate_hash_change_required",
      "package_or_lockfile_change_required",
      "source_permission_change_performed",
      "build_performed",
      "rehearsal_performed",
      "deployment_performed",
      "preview_activated",
      "environment_modified",
      "provider_called",
      "supabase_accessed",
      "persistence_created",
      "replay_created",
      "confidence_applied",
    ]) {
      expect(record[key]).toBe(false);
    }
  });

  test("cleans up and retains no paths, command output, environment values, or credentials", () => {
    const record = readJson<Action505Record>(recordPath);
    expect(record.cleanup_result).toBe("cleanup_passed");
    expect(record.temporary_precheck_subtree_absent_after_cleanup).toBe(true);
    expect(record.absolute_machine_paths_recorded).toBe(false);
    expect(record.raw_command_output_recorded).toBe(false);
    expect(record.environment_values_recorded).toBe(false);
    expect(record.credential_values_recorded).toBe(false);
  });

  test("keeps runtime preview waiting", () => {
    const record = readJson<Action505Record>(recordPath);
    expect(record.runtime_preview_state).toBe("runtime_preview_waiting_for_operator_inputs");
  });

  test("verifier succeeds and Actions 503-504 remain healthy", () => {
    const action503 = runVerifier(action503VerifierPath);
    const action504 = runVerifier(action504VerifierPath);
    const action505 = runVerifier(verifierPath);
    expect(action503.verification_status).toBe("passed");
    expect(action504.verification_status).toBe("passed");
    expect(action505.verification_status).toBe("passed");
    expect(action505.approval_decision).toBe("approved_with_conditions");
  });

  test("documentation summarizes precheck result", () => {
    const doc = read(docPath);
    expect(doc).toContain("Source readability: `passed`");
    expect(doc).toContain("Required binary modes preserved: `passed`");
    expect(doc).toContain("Temp-boundary classification: `temp_boundary_restriction_not_detected`");
    expect(doc).toContain("Next action: `action_506_turbopack_runner_environment_comparison_and_rehearsal_gate`");
  });
});
