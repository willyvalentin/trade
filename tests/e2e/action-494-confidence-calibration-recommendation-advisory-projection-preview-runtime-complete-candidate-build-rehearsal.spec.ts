import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join, resolve } from "path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const docPath =
  "docs/action-494-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-build-rehearsal.md";
const recordPath =
  "docs/action-494-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-build-rehearsal-record.json";
const verifierPath =
  "scripts/action-494-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-build-rehearsal-verify.mjs";
const action492VerifierPath =
  "scripts/action-492-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-reconstruction-and-hash-freeze-verify.mjs";
const action493VerifierPath =
  "scripts/action-493-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-build-rehearsal-approval-gate-verify.mjs";

const expected = {
  cleanBase: "15f9923c24ed1f3cf82d34656eeacbfd98a0d347",
  changeHash: "c005946d3a21df32730306687d125ef1ba4439500da7ec22288ec92d802d667c",
  fullHash: "d96af34b0c488ef16f614b2be731052c2099e0b6efde57f76115eb8d5c779a0f",
  addedPath: "lib/pure-confidence-calibration.ts",
  addedHash: "bd913c95d04fc450f4499b18c01744da04a148e8d18cb4d9113d990ee8deaa70",
  nextAction: "action_495_preview_flag_rehearsal_check_remediation_approval_gate",
};

type Action494Record = {
  source_action: number;
  clean_base_identifier: string;
  change_candidate_hash: string;
  full_candidate_inventory_hash: string;
  candidate_file_count: number;
  added_runtime_path: string;
  added_runtime_path_hash: string;
  safe_temp_subtree: string;
  temp_path_absolute_value_recorded: boolean;
  path_safety_result: string;
  source_reconstruction_result: string;
  runtime_dependency_closure_result: string;
  runtime_dependency_closure_complete: boolean;
  runtime_dependency_paths_missing: number;
  source_integrity_result: string;
  source_safety_result: string;
  dependency_materialization_method: string;
  dependency_materialization_result: string;
  network_used: boolean;
  install_performed: boolean;
  dependency_update_performed: boolean;
  package_manifest_modified: boolean;
  lockfile_modified: boolean;
  configuration_modified: boolean;
  candidate_source_modified: boolean;
  source_dependency_tree_modified: boolean;
  extraneous_local_package_count: number;
  extraneous_packages_excluded: boolean;
  candidate_internal_required_paths_missing: number;
  candidate_internal_required_missing_paths: string[];
  candidate_command_results: unknown[];
  candidate_commands_started: boolean;
  runtime_projection_call_site_count: number | null;
  preview_flag_state: string;
  preview_flag_enabled: boolean;
  preview_activated: boolean;
  cleanup_result: string;
  candidate_removed: boolean;
  copied_node_modules_removed: boolean;
  rehearsal_attempt_count: number;
  same_action_rerun_allowed: boolean;
  candidate_rehearsal_result: string;
  candidate_rehearsal_abort_reason: string;
  external_evidence_result: string;
  overall_readiness: string;
  current_runtime_preview_state: string;
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
  return JSON.parse(
    execFileSync("node", [relativePath], {
      cwd: root,
      encoding: "utf8",
      maxBuffer: 128 * 1024 * 1024,
    }),
  );
}

test.describe("Action 494 runtime-complete candidate build rehearsal", () => {
  test("documents the bounded aborted rehearsal result and passes verifier", () => {
    expect(existsSync(join(root, docPath))).toBe(true);
    expect(existsSync(join(root, recordPath))).toBe(true);
    expect(existsSync(join(root, verifierPath))).toBe(true);

    const doc = read(docPath);
    expect(doc).toContain("Action 494 executed");
    expect(doc).toContain(expected.changeHash);
    expect(doc).toContain(expected.fullHash);
    expect(doc).toContain(expected.addedPath);
    expect(doc).toContain("full_candidate_rehearsal_aborted");
    expect(doc).toContain("preview_flag_check_ambiguous_static_literal_check");
    expect(doc).toContain("cleanup_passed");
    expect(doc).toContain(expected.nextAction);

    const report = runVerifier(verifierPath);
    expect(report.verification_status).toBe("passed");
    expect(report.candidate_rehearsal_result).toBe("full_candidate_rehearsal_aborted");
    expect(report.external_evidence_result).toBe("rehearsal_evidence_verified");
    expect(report.overall_readiness).toBe("blocked");
    expect(report.failed_conditions).toEqual([]);
  });

  test("binds Action 493 approval and exact Action 492 candidate hashes", () => {
    const record = readJson<Action494Record>(recordPath);

    expect(record.source_action).toBe(493);
    expect(record.clean_base_identifier).toBe(expected.cleanBase);
    expect(record.change_candidate_hash).toBe(expected.changeHash);
    expect(record.full_candidate_inventory_hash).toBe(expected.fullHash);
    expect(record.candidate_file_count).toBe(31);
    expect(record.added_runtime_path).toBe(expected.addedPath);
    expect(record.added_runtime_path_hash).toBe(expected.addedHash);

    const action492 = runVerifier(action492VerifierPath);
    const action493 = runVerifier(action493VerifierPath);
    expect(action492.status).toBe("passed");
    expect(action493.verification_status).toBe("passed");
    expect(action493.approval_decision).toBe("approved");
  });

  test("records safe temp path, source reconstruction, runtime closure, integrity, and safety", () => {
    const record = readJson<Action494Record>(recordPath);

    expect(record.safe_temp_subtree).toBe(
      "ture/action-494-confidence-calibration-projection-preview-runtime-complete-candidate-rehearsal",
    );
    expect(record.temp_path_absolute_value_recorded).toBe(false);
    expect(record.path_safety_result).toBe("path_safety_passed");
    expect(record.source_reconstruction_result).toBe("source_reconstruction_passed");
    expect(record.runtime_dependency_closure_result).toBe("runtime_dependency_closure_passed");
    expect(record.runtime_dependency_closure_complete).toBe(true);
    expect(record.runtime_dependency_paths_missing).toBe(0);
    expect(record.source_integrity_result).toBe("source_integrity_passed");
    expect(record.source_safety_result).toBe("source_safety_passed");
  });

  test("records dependency copy and command execution as not reached after pre-command abort", () => {
    const record = readJson<Action494Record>(recordPath);

    expect(record.dependency_materialization_method).toBe("temporary_verified_node_modules_copy");
    expect(record.dependency_materialization_result).toBe("not_started_aborted_before_dependency_copy");
    expect(record.extraneous_local_package_count).toBe(5);
    expect(record.extraneous_packages_excluded).toBe(false);
    expect(record.candidate_internal_required_paths_missing).toBe(0);
    expect(record.candidate_internal_required_missing_paths).toEqual([]);
    expect(record.candidate_command_results).toEqual([]);
    expect(record.candidate_commands_started).toBe(false);
    expect(record.runtime_projection_call_site_count).toBeNull();
  });

  test("preserves preview, mutation, cleanup, and no-side-effect safety", () => {
    const record = readJson<Action494Record>(recordPath);

    expect(record.preview_flag_state).toBe("ambiguous_static_literal_check_runtime_helper_review_disabled");
    expect(record.preview_flag_enabled).toBe(false);
    expect(record.preview_activated).toBe(false);
    expect(record.package_manifest_modified).toBe(false);
    expect(record.lockfile_modified).toBe(false);
    expect(record.configuration_modified).toBe(false);
    expect(record.candidate_source_modified).toBe(false);
    expect(record.source_dependency_tree_modified).toBe(false);
    expect(record.cleanup_result).toBe("cleanup_passed");
    expect(record.candidate_removed).toBe(true);
    expect(record.copied_node_modules_removed).toBe(true);

    for (const key of [
      "network_used",
      "install_performed",
      "dependency_update_performed",
      "deployment_performed",
      "production_changed",
      "environment_modified",
      "persistence_created",
      "replay_created",
      "provider_called",
      "supabase_accessed",
      "feedback_created",
      "confidence_applied",
      "downstream_behavior_changed",
      "scanner_changed",
      "ranking_changed",
      "publication_changed",
      "execution_changed",
      "add_trade_changed",
      "risk_sizing_changed",
    ]) {
      expect(record[key]).toBe(false);
    }
  });

  test("keeps result semantics separate and blocks automatic rerun/deployment", () => {
    const record = readJson<Action494Record>(recordPath);

    expect(record.rehearsal_attempt_count).toBe(1);
    expect(record.same_action_rerun_allowed).toBe(false);
    expect(record.candidate_rehearsal_result).toBe("full_candidate_rehearsal_aborted");
    expect(record.candidate_rehearsal_abort_reason).toBe(
      "preview_flag_check_ambiguous_static_literal_check",
    );
    expect(record.external_evidence_result).toBe("rehearsal_evidence_verified");
    expect(record.overall_readiness).toBe("blocked");
    expect(record.current_runtime_preview_state).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(record.next_action).toBe(expected.nextAction);
  });
});
