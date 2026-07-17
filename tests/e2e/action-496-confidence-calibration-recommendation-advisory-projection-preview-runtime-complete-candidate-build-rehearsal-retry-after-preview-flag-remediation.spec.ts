import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join, resolve } from "path";

import { expect, test } from "@playwright/test";

import { isConfidenceCalibrationProjectionPreviewEnabled } from "../../lib/confidence-calibration-recommendation-advisory-projection-preview-flag";

const root = resolve(__dirname, "../..");
const recordPath =
  "docs/action-496-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-build-rehearsal-retry-record.json";
const docPath =
  "docs/action-496-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-build-rehearsal-retry-after-preview-flag-remediation.md";
const verifierPath =
  "scripts/action-496-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-build-rehearsal-retry-after-preview-flag-remediation-verify.mjs";
const action495RecordPath =
  "docs/action-495-confidence-calibration-recommendation-advisory-projection-preview-flag-rehearsal-check-remediation-approval-record.json";
const action494VerifierPath =
  "scripts/action-494-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-build-rehearsal-verify.mjs";
const action495VerifierPath =
  "scripts/action-495-confidence-calibration-recommendation-advisory-projection-preview-flag-rehearsal-check-remediation-approval-gate-verify.mjs";

const canonicalKey = "CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED";
const expected = {
  cleanBase: "15f9923c24ed1f3cf82d34656eeacbfd98a0d347",
  changeHash: "c005946d3a21df32730306687d125ef1ba4439500da7ec22288ec92d802d667c",
  fullHash: "d96af34b0c488ef16f614b2be731052c2099e0b6efde57f76115eb8d5c779a0f",
  addedPath: "lib/pure-confidence-calibration.ts",
  addedHash: "bd913c95d04fc450f4499b18c01744da04a148e8d18cb4d9113d990ee8deaa70",
  blocker:
    "source_safety_rehearsal_checker_treated_non_authoritative_filename_and_whitespace_indicators_as_hard_blockers",
  nextAction: "action_497_source_safety_checker_false_positive_remediation_approval_gate",
};

type Action496Record = {
  source_action: number;
  clean_base_identifier: string;
  change_candidate_hash: string;
  full_candidate_inventory_hash: string;
  candidate_file_count: number;
  added_runtime_path: string;
  added_runtime_path_hash: string;
  safe_temp_subtree: string;
  path_safety_result: string;
  source_reconstruction_result: string;
  runtime_dependency_closure_result: string;
  runtime_dependency_paths_missing: number;
  source_integrity_result: string;
  source_safety_result: string;
  source_safety_checker_blocker_classification: string;
  canonical_preview_flag: string;
  preview_flag_gate_reached: boolean;
  preview_flag_helper_result: boolean;
  preview_flag_verification_result: string;
  source_literal_authoritative: boolean;
  parser_literal_true_activation_evidence: boolean;
  alternate_activation_path_detected: boolean;
  raw_environment_value_recorded: boolean;
  full_environment_enumeration_performed: boolean;
  environment_restored: boolean;
  dependency_materialization_result: string;
  network_used: boolean;
  install_performed: boolean;
  dependency_update_performed: boolean;
  extraneous_local_package_count: number;
  extraneous_packages_excluded: boolean;
  candidate_internal_required_paths_missing: number;
  candidate_command_results: unknown[];
  candidate_commands_started: boolean;
  runtime_projection_call_site_count: null | number;
  cleanup_result: string;
  rehearsal_attempt_count: number;
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
  ) as Record<string, unknown>;
}

test.describe("Action 496 runtime-complete rehearsal retry after preview-flag remediation", () => {
  test("records Action 495 approval and exact candidate bindings", () => {
    expect(existsSync(join(root, recordPath))).toBe(true);
    expect(existsSync(join(root, docPath))).toBe(true);
    expect(existsSync(join(root, verifierPath))).toBe(true);

    const action495 = readJson<{ approval_decision: string; next_action: string; unresolved_conditions: unknown[] }>(
      action495RecordPath,
    );
    const record = readJson<Action496Record>(recordPath);

    expect(action495.approval_decision).toBe("approved");
    expect(action495.unresolved_conditions).toEqual([]);
    expect(action495.next_action).toBe(
      "action_496_runtime_complete_candidate_build_rehearsal_retry_after_preview_flag_check_remediation",
    );
    expect(record.source_action).toBe(495);
    expect(record.clean_base_identifier).toBe(expected.cleanBase);
    expect(record.change_candidate_hash).toBe(expected.changeHash);
    expect(record.full_candidate_inventory_hash).toBe(expected.fullHash);
    expect(record.candidate_file_count).toBe(31);
    expect(record.added_runtime_path).toBe(expected.addedPath);
    expect(record.added_runtime_path_hash).toBe(expected.addedHash);
  });

  test("passes path safety, reconstruction, and runtime closure before aborting", () => {
    const record = readJson<Action496Record>(recordPath);

    expect(record.safe_temp_subtree).toBe(
      "ture/action-496-confidence-calibration-projection-preview-runtime-complete-candidate-rehearsal",
    );
    expect(record.path_safety_result).toBe("path_safety_passed");
    expect(record.source_reconstruction_result).toBe("source_reconstruction_passed");
    expect(record.runtime_dependency_closure_result).toBe("runtime_dependency_closure_passed");
    expect(record.runtime_dependency_paths_missing).toBe(0);
    expect(record.candidate_internal_required_paths_missing).toBe(0);
  });

  test("captures the source-safety checker false positive as the blocker", () => {
    const record = readJson<Action496Record>(recordPath);

    expect(record.source_integrity_result).toBe(
      "blocked_by_rehearsal_checker_false_positive_before_semantic_flag_gate",
    );
    expect(record.source_safety_result).toBe(
      "blocked_by_rehearsal_checker_false_positive_before_semantic_flag_gate",
    );
    expect(record.source_safety_checker_blocker_classification).toBe(expected.blocker);
    expect(record.merge_conflict_markers).toBe(0);
    expect(record.env_file_count).toBe(0);
    expect(record.netlify_file_count).toBe(0);
    expect(record.node_modules_in_source_inventory).toBe(0);
  });

  test("keeps semantic preview-flag evidence bounded and disabled", () => {
    const record = readJson<Action496Record>(recordPath);
    const helperSource = read("lib/confidence-calibration-recommendation-advisory-projection-preview-flag.ts");
    const doc = read(docPath);

    expect(record.canonical_preview_flag).toBe(canonicalKey);
    expect(record.preview_flag_gate_reached).toBe(false);
    expect(record.preview_flag_helper_result).toBe(false);
    expect(record.source_literal_authoritative).toBe(false);
    expect(record.parser_literal_true_activation_evidence).toBe(false);
    expect(record.alternate_activation_path_detected).toBe(false);
    expect(record.raw_environment_value_recorded).toBe(false);
    expect(record.full_environment_enumeration_performed).toBe(false);
    expect(record.environment_restored).toBe(true);
    expect(helperSource).toContain('"true"');
    expect(doc).toContain('"true"');
    expect(isConfidenceCalibrationProjectionPreviewEnabled({}, "development")).toBe(false);
    expect(isConfidenceCalibrationProjectionPreviewEnabled({ [canonicalKey]: "false" }, "development")).toBe(false);
    expect(isConfidenceCalibrationProjectionPreviewEnabled({ [canonicalKey]: "0" }, "development")).toBe(false);
    expect(isConfidenceCalibrationProjectionPreviewEnabled({ [canonicalKey]: "1" }, "development")).toBe(false);
    expect(isConfidenceCalibrationProjectionPreviewEnabled({ [canonicalKey]: "TRUE" }, "development")).toBe(false);
    expect(isConfidenceCalibrationProjectionPreviewEnabled({ [canonicalKey]: " true " }, "development")).toBe(false);
    expect(isConfidenceCalibrationProjectionPreviewEnabled({ [canonicalKey]: "true" }, "development")).toBe(true);
    expect(isConfidenceCalibrationProjectionPreviewEnabled({ [canonicalKey]: "true" }, "production")).toBe(false);
  });

  test("does not materialize dependencies or run candidate commands after the abort", () => {
    const record = readJson<Action496Record>(recordPath);

    expect(record.dependency_materialization_result).toBe("not_started_aborted_before_dependency_copy");
    expect(record.network_used).toBe(false);
    expect(record.install_performed).toBe(false);
    expect(record.dependency_update_performed).toBe(false);
    expect(record.extraneous_local_package_count).toBe(5);
    expect(record.extraneous_packages_excluded).toBe(false);
    expect(record.candidate_command_results).toEqual([]);
    expect(record.candidate_commands_started).toBe(false);
    expect(record.runtime_projection_call_site_count).toBeNull();
  });

  test("records no mutation, no deployment, no activation, and cleanup passed", () => {
    const record = readJson<Action496Record>(recordPath);

    for (const key of [
      "package_manifest_modified",
      "lockfile_modified",
      "configuration_modified",
      "candidate_source_modified",
      "source_dependency_tree_modified",
      "active_worktree_modified",
      "environment_modified",
      "deployment_performed",
      "netlify_operation_performed",
      "preview_activated",
      "production_changed",
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
    expect(record.cleanup_result).toBe("cleanup_passed");
    expect(record.candidate_removed).toBe(true);
    expect(record.copied_node_modules_removed).toBe(true);
  });

  test("records one attempt, blocked readiness, and blocker-specific next action", () => {
    const record = readJson<Action496Record>(recordPath);

    expect(record.rehearsal_attempt_count).toBe(1);
    expect(record.candidate_rehearsal_result).toBe("full_candidate_rehearsal_aborted");
    expect(record.candidate_rehearsal_abort_reason).toBe(expected.blocker);
    expect(record.external_evidence_result).toBe("rehearsal_evidence_verified");
    expect(record.overall_readiness).toBe("blocked");
    expect(record.current_runtime_preview_state).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(record.next_action).toBe(expected.nextAction);
  });

  test("verifier succeeds and Actions 494-495 remain healthy", () => {
    const action494 = runVerifier(action494VerifierPath);
    const action495 = runVerifier(action495VerifierPath);
    const action496 = runVerifier(verifierPath);

    expect(action494.verification_status).toBe("passed");
    expect(action495.verification_status).toBe("passed");
    expect(action496.verification_status).toBe("passed");
    expect(action496.candidate_rehearsal_result).toBe("full_candidate_rehearsal_aborted");
    expect(action496.overall_readiness).toBe("blocked");
    expect(action496.next_action).toBe(expected.nextAction);
  });
});
