import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join, resolve } from "path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const docPath =
  "docs/action-493-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-build-rehearsal-approval-gate.md";
const recordPath =
  "docs/action-493-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-build-rehearsal-approval-record.json";
const verifierPath =
  "scripts/action-493-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-build-rehearsal-approval-gate-verify.mjs";
const action491VerifierPath =
  "scripts/action-491-confidence-calibration-recommendation-advisory-projection-preview-candidate-runtime-dependency-completeness-remediation-gate-verify.mjs";
const action492VerifierPath =
  "scripts/action-492-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-reconstruction-and-hash-freeze-verify.mjs";

const expected = {
  cleanBase: "15f9923c24ed1f3cf82d34656eeacbfd98a0d347",
  oldChangeHash: "7a11d9c6697a9d89ffb3e762dd15185fda225bc8e39c80a212cd3729d05857f6",
  oldFullHash: "cc6a97c5797a1fa76a6bebe9be1497fe88819f1b73992b271c142ff61d3bc2f0",
  newChangeHash: "c005946d3a21df32730306687d125ef1ba4439500da7ec22288ec92d802d667c",
  newFullHash: "d96af34b0c488ef16f614b2be731052c2099e0b6efde57f76115eb8d5c779a0f",
  addedPath: "lib/pure-confidence-calibration.ts",
  addedHash: "bd913c95d04fc450f4499b18c01744da04a148e8d18cb4d9113d990ee8deaa70",
  nextAction: "action_494_runtime_complete_candidate_build_rehearsal",
};

test.setTimeout(300000);

type CommandInventoryEntry = {
  order: number;
  name: string;
  command: string;
  required_candidate_path: string | null;
  runtime_or_build_relevance: string;
  candidate_member_required: boolean;
};

type Action493Record = {
  source_action: number;
  source_action_result: string;
  clean_base_identifier: string;
  historical_change_candidate_hash: string;
  historical_full_candidate_inventory_hash: string;
  historical_candidate_file_count: number;
  historical_candidate_status: string;
  historical_deployment_approval_executable: boolean;
  change_candidate_hash: string;
  full_candidate_inventory_hash: string;
  candidate_file_count: number;
  added_runtime_path: string;
  added_runtime_path_hash: string;
  runtime_dependency_closure_complete: boolean;
  runtime_dependency_paths_missing: number;
  unresolved_source_versions: number;
  temporary_path_policy: Record<string, unknown>;
  source_reconstruction_policy: Record<string, unknown>;
  integrity_strategy: string;
  source_integrity_policy: Record<string, unknown>;
  source_safety_policy: Record<string, unknown>;
  dependency_materialization_method: string;
  dependency_materialization_policy: Record<string, unknown>;
  candidate_internal_command_inventory: CommandInventoryEntry[];
  conditional_candidate_internal_checks: Array<{ status: string; present_in_action_492_candidate: boolean }>;
  candidate_internal_required_paths_missing: number;
  candidate_internal_required_missing_paths: string[];
  external_control_inventory: Array<{ name: string; path: string; candidate_internal: boolean }>;
  execution_order: string[];
  post_command_integrity_policy: {
    protected_path_hashes: Record<string, string>;
    install_marker_allowed: boolean;
    environment_file_allowed: boolean;
    credential_file_allowed: boolean;
    raw_secret_recorded_allowed: boolean;
    preview_flag_must_remain_disabled: boolean;
  };
  candidate_rehearsal_result_vocabulary: string[];
  external_evidence_result_vocabulary: string[];
  overall_readiness_vocabulary: string[];
  approval_vocabulary: string[];
  failure_semantics: {
    candidate_rehearsal_aborted_when: string[];
    candidate_rehearsal_failed_when: string[];
    external_verifier_failure_after_candidate_internal_pass: string;
    same_action_repair_or_rerun_allowed: boolean;
  };
  rehearsal_attempt_limit: number;
  deployment_authorized: boolean;
  activation_authorized: boolean;
  candidate_reconstruction_performed: boolean;
  build_performed: boolean;
  rehearsal_performed: boolean;
  deployment_performed: boolean;
  preview_activated: boolean;
  network_used: boolean;
  install_performed: boolean;
  environment_modified: boolean;
  package_or_lockfile_modified: boolean;
  provider_call_executed: boolean;
  supabase_read_executed: boolean;
  supabase_write_executed: boolean;
  persistence_created: boolean;
  replay_created: boolean;
  confidence_applied: boolean;
  feedback_created: boolean;
  scanner_changed: boolean;
  ranking_changed: boolean;
  publication_changed: boolean;
  execution_changed: boolean;
  add_trade_changed: boolean;
  risk_sizing_changed: boolean;
  approval_decision: string;
  unresolved_conditions: string[];
  runtime_preview_state: string;
  preview_flag_name: string;
  preview_flag_state: string;
  preview_flag_enabled: boolean;
  next_action: string;
};

function read(relativePath: string): string {
  return readFileSync(join(root, relativePath), "utf8");
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(read(relativePath)) as T;
}

function runVerifier(relativePath: string): Record<string, unknown> {
  return JSON.parse(
    execFileSync("node", [relativePath], {
      cwd: root,
      encoding: "utf8",
      maxBuffer: 160 * 1024 * 1024,
    }),
  );
}

test.describe("Action 493 runtime-complete candidate build rehearsal approval gate", () => {
  test("documents the approval gate contract and passes verifier", () => {
    expect(existsSync(join(root, docPath))).toBe(true);
    expect(existsSync(join(root, recordPath))).toBe(true);
    expect(existsSync(join(root, verifierPath))).toBe(true);

    const doc = read(docPath);
    expect(doc).toContain("Action 493 approves");
    expect(doc).toContain(expected.newChangeHash);
    expect(doc).toContain(expected.newFullHash);
    expect(doc).toContain(expected.addedPath);
    expect(doc).toContain("temporary_verified_node_modules_copy");
    expect(doc).toContain("full_candidate_rehearsal_passed");
    expect(doc).toContain(expected.nextAction);

    const report = runVerifier(verifierPath);
    expect(report.verification_status).toBe("passed");
    expect(report.approval_decision).toBe("approved");
    expect(report.failed_conditions).toEqual([]);
  });

  test("binds the Action 492 runtime-complete candidate and supersedes the historical candidate", () => {
    const record = readJson<Action493Record>(recordPath);

    expect(record.source_action).toBe(492);
    expect(record.source_action_result).toBe("runtime_complete_candidate_reconstructed_and_frozen");
    expect(record.clean_base_identifier).toBe(expected.cleanBase);
    expect(record.change_candidate_hash).toBe(expected.newChangeHash);
    expect(record.full_candidate_inventory_hash).toBe(expected.newFullHash);
    expect(record.candidate_file_count).toBe(31);
    expect(record.added_runtime_path).toBe(expected.addedPath);
    expect(record.added_runtime_path_hash).toBe(expected.addedHash);
    expect(record.historical_change_candidate_hash).toBe(expected.oldChangeHash);
    expect(record.historical_full_candidate_inventory_hash).toBe(expected.oldFullHash);
    expect(record.historical_candidate_file_count).toBe(30);
    expect(record.historical_candidate_status).toBe("historical_candidate_runtime_incomplete");
    expect(record.historical_deployment_approval_executable).toBe(false);
    expect(record.runtime_dependency_closure_complete).toBe(true);
    expect(record.runtime_dependency_paths_missing).toBe(0);
    expect(record.unresolved_source_versions).toBe(0);
  });

  test("freezes Action 494 path, source reconstruction, integrity, and source-safety policies", () => {
    const record = readJson<Action493Record>(recordPath);

    expect(record.temporary_path_policy.future_action).toBe(494);
    expect(record.temporary_path_policy.target_subtree).toBe(
      "ture/action-494-confidence-calibration-projection-preview-runtime-complete-candidate-rehearsal",
    );
    expect(record.temporary_path_policy.textual_prefix_only_containment_allowed).toBe(false);
    expect(record.temporary_path_policy.traversal_allowed).toBe(false);
    expect(record.temporary_path_policy.target_or_parent_symlink_allowed).toBe(false);
    expect(record.temporary_path_policy.bounded_cleanup_required).toBe(true);

    expect(record.source_reconstruction_policy.method).toBe(
      "exact_clean_base_plus_action_492_31_file_overlay",
    );
    expect(record.source_reconstruction_policy.broad_dirty_worktree_copy_allowed).toBe(false);
    expect(record.source_reconstruction_policy.changed_paths_required).toBe(31);
    expect(record.source_reconstruction_policy.environment_or_credential_files_allowed).toBe(0);
    expect(record.integrity_strategy).toBe("baseline_plus_overlay_manifest_integrity");
    expect(record.source_integrity_policy.env_files_allowed).toBe(false);
    expect(record.source_integrity_policy.credential_files_allowed).toBe(false);
    expect(record.source_integrity_policy.node_modules_in_source_inventory_allowed).toBe(false);
    expect(record.source_integrity_policy.invalid_historical_node_modules_pathspec_allowed).toBe(false);
    expect(record.source_safety_policy.policy_name).toBe(
      "action_488_ordered_source_safety_classification",
    );
    expect(record.source_safety_policy.raw_secret_value_storage_allowed).toBe(false);
    expect(record.source_safety_policy.raw_secret_value_printing_allowed).toBe(false);
  });

  test("freezes dependency copy and serial internal command inventory", () => {
    const record = readJson<Action493Record>(recordPath);

    expect(record.dependency_materialization_method).toBe("temporary_verified_node_modules_copy");
    expect(record.dependency_materialization_policy.npm_install_allowed).toBe(false);
    expect(record.dependency_materialization_policy.npm_ci_allowed).toBe(false);
    expect(record.dependency_materialization_policy.registry_access_allowed).toBe(false);
    expect(record.dependency_materialization_policy.lockfile_rewrite_allowed).toBe(false);
    expect(record.dependency_materialization_policy.known_extraneous_packages_excluded_count).toBe(5);
    expect(record.dependency_materialization_policy.extraneous_influence).toBe(
      "no_influence_detected",
    );

    expect(record.candidate_internal_command_inventory.map((entry) => entry.order)).toEqual(
      Array.from({ length: record.candidate_internal_command_inventory.length }, (_, index) => index + 1),
    );
    expect(record.candidate_internal_command_inventory.map((entry) => entry.command)).toContain(
      "npx next typegen",
    );
    expect(record.candidate_internal_command_inventory.map((entry) => entry.command)).toContain(
      "npx tsc --noEmit",
    );
    expect(record.candidate_internal_command_inventory.map((entry) => entry.command)).toContain(
      "npm run build",
    );
    expect(record.candidate_internal_command_inventory.map((entry) => entry.command)).toContain(
      "npm run lint",
    );
    expect(
      record.candidate_internal_command_inventory
        .filter((entry) => entry.candidate_member_required)
        .map((entry) => entry.required_candidate_path),
    ).toEqual([
      "tests/e2e/action-461-confidence-calibration-recommendation-advisory-projection-runtime-preview-consumer-implementation.spec.ts",
      "tests/e2e/action-462-independent-confidence-calibration-recommendation-advisory-projection-runtime-preview-consumer-verification.spec.ts",
      "lib/confidence-calibration-recommendation-advisory-projection-preview-flag.ts",
    ]);
    expect(record.candidate_internal_required_paths_missing).toBe(0);
    expect(record.candidate_internal_required_missing_paths).toEqual([]);
    expect(record.conditional_candidate_internal_checks.every((entry) => !entry.present_in_action_492_candidate)).toBe(
      true,
    );
  });

  test("keeps later control checks external and freezes execution/failure semantics", () => {
    const record = readJson<Action493Record>(recordPath);

    expect(record.external_control_inventory.length).toBeGreaterThanOrEqual(4);
    expect(record.external_control_inventory.every((entry) => !entry.candidate_internal)).toBe(true);
    for (const entry of record.external_control_inventory) {
      expect(existsSync(join(root, entry.path))).toBe(true);
    }
    expect(record.execution_order).toEqual([
      "phase_0_safe_temp_path_validation",
      "phase_1_source_only_candidate_reconstruction_and_integrity",
      "phase_2_temporary_verified_node_modules_copy",
      "phase_3_candidate_internal_commands_serial",
      "phase_4_post_command_protected_hash_checks_record_and_cleanup",
      "phase_5_external_rehearsal_control_verifiers_and_contract_tests",
    ]);
    expect(record.candidate_rehearsal_result_vocabulary).toEqual([
      "full_candidate_rehearsal_passed",
      "full_candidate_rehearsal_failed",
      "full_candidate_rehearsal_aborted",
    ]);
    expect(record.external_evidence_result_vocabulary).toContain(
      "rehearsal_evidence_verification_failed",
    );
    expect(record.overall_readiness_vocabulary).toContain(
      "ready_for_preview_deployment_final_approval",
    );
    expect(record.approval_vocabulary).toEqual(["approved", "approved_with_conditions", "blocked"]);
    expect(record.failure_semantics.external_verifier_failure_after_candidate_internal_pass).toBe(
      "rehearsal_evidence_verification_failed",
    );
    expect(record.failure_semantics.same_action_repair_or_rerun_allowed).toBe(false);
    expect(record.rehearsal_attempt_limit).toBe(1);
  });

  test("preserves no-effect status and runtime preview waiting state", () => {
    const record = readJson<Action493Record>(recordPath);

    expect(record.deployment_authorized).toBe(false);
    expect(record.activation_authorized).toBe(false);
    expect(record.candidate_reconstruction_performed).toBe(false);
    expect(record.build_performed).toBe(false);
    expect(record.rehearsal_performed).toBe(false);
    expect(record.deployment_performed).toBe(false);
    expect(record.preview_activated).toBe(false);
    expect(record.network_used).toBe(false);
    expect(record.install_performed).toBe(false);
    expect(record.environment_modified).toBe(false);
    expect(record.package_or_lockfile_modified).toBe(false);
    expect(record.provider_call_executed).toBe(false);
    expect(record.supabase_read_executed).toBe(false);
    expect(record.supabase_write_executed).toBe(false);
    expect(record.persistence_created).toBe(false);
    expect(record.replay_created).toBe(false);
    expect(record.confidence_applied).toBe(false);
    expect(record.feedback_created).toBe(false);
    expect(record.scanner_changed).toBe(false);
    expect(record.ranking_changed).toBe(false);
    expect(record.publication_changed).toBe(false);
    expect(record.execution_changed).toBe(false);
    expect(record.add_trade_changed).toBe(false);
    expect(record.risk_sizing_changed).toBe(false);
    expect(record.approval_decision).toBe("approved");
    expect(record.unresolved_conditions).toEqual([]);
    expect(record.runtime_preview_state).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(record.preview_flag_name).toBe("CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED");
    expect(record.preview_flag_state).toBe("absent_or_disabled");
    expect(record.preview_flag_enabled).toBe(false);
    expect(record.next_action).toBe(expected.nextAction);
  });

  test("verifies protected config hash bindings and prior Action health", () => {
    const record = readJson<Action493Record>(recordPath);
    const action491Report = runVerifier(action491VerifierPath);
    const action492Report = runVerifier(action492VerifierPath);

    expect(Object.keys(record.post_command_integrity_policy.protected_path_hashes)).toEqual([
      "package.json",
      "package-lock.json",
      "next.config.ts",
      "tsconfig.json",
      "eslint.config.mjs",
      "netlify.toml",
    ]);
    expect(record.post_command_integrity_policy.install_marker_allowed).toBe(false);
    expect(record.post_command_integrity_policy.environment_file_allowed).toBe(false);
    expect(record.post_command_integrity_policy.credential_file_allowed).toBe(false);
    expect(record.post_command_integrity_policy.raw_secret_recorded_allowed).toBe(false);
    expect(record.post_command_integrity_policy.preview_flag_must_remain_disabled).toBe(true);
    expect(action491Report.verification_status).toBe("passed");
    expect(action491Report.failed_conditions).toEqual([]);
    expect(action492Report.status).toBe("passed");
    expect(action492Report.failures).toEqual([]);
  });
});
