import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join, resolve } from "path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const docPath =
  "docs/action-485-confidence-calibration-recommendation-advisory-projection-preview-full-candidate-build-rehearsal-retry.md";
const recordPath =
  "docs/action-485-confidence-calibration-recommendation-advisory-projection-preview-full-candidate-build-rehearsal-retry-record.json";
const action484RecordPath =
  "docs/action-484-confidence-calibration-recommendation-advisory-projection-preview-temporary-candidate-git-integrity-remediation-approval-record.json";
const action483RecordPath =
  "docs/action-483-confidence-calibration-recommendation-advisory-projection-preview-full-candidate-build-rehearsal-record.json";
const verifierPath =
  "scripts/action-485-confidence-calibration-recommendation-advisory-projection-preview-full-candidate-build-rehearsal-retry-verify.mjs";
const cleanBase = "15f9923c24ed1f3cf82d34656eeacbfd98a0d347";
const candidateHash =
  "7a11d9c6697a9d89ffb3e762dd15185fda225bc8e39c80a212cd3729d05857f6";
const fullCandidateHash =
  "cc6a97c5797a1fa76a6bebe9be1497fe88819f1b73992b271c142ff61d3bc2f0";
const strategy = "baseline_plus_overlay_manifest_integrity";
const nextAction = "action_486_full_candidate_rehearsal_retry_abort_remediation_gate";

test.setTimeout(300000);

type Action484Record = {
  approval_decision: string;
  approved_integrity_strategy: string;
  node_modules_staged: boolean;
  invalid_pathspec_retained: boolean;
  dependency_method: string;
  unresolved_conditions: string[];
  deployment_performed: boolean;
  preview_activated: boolean;
};

type Action483Record = {
  rehearsal_decision: string;
  candidate_integrity_result: string;
};

type Action485Record = {
  clean_base_identifier: string;
  approved_change_candidate_hash: string;
  full_candidate_inventory_hash: string;
  candidate_file_count: number;
  integrity_strategy: string;
  temp_path_policy: string;
  safe_temp_path_result: string;
  safe_temp_path_failure_reason: string;
  safe_temp_path_failure_classification: string;
  source_candidate_constructed: boolean;
  source_only_integrity_result: string;
  source_inventory_result: string;
  overlay_result: string;
  overlay_hash_result: string;
  node_modules_staged: boolean;
  invalid_pathspec_used: boolean;
  dependency_materialization_method: string;
  dependency_copy_result: string;
  dependency_copy_created: boolean;
  dependency_copy_removed: boolean;
  network_used: boolean;
  install_performed: boolean;
  dependency_update_performed: boolean;
  lockfile_rewrite_detected: boolean;
  package_manifest_rewrite_detected: boolean;
  extraneous_local_package_count: number;
  extraneous_packages_excluded: boolean;
  extraneous_packages_exclusion_result: string;
  extraneous_dependency_influence_result: string;
  command_results: unknown[];
  serial_commands_started: boolean;
  runtime_projection_call_site_count: number | null;
  preview_flag_state: string;
  preview_flag_enabled: boolean;
  package_manifest_modified: boolean;
  lockfile_modified: boolean;
  configuration_modified: boolean;
  candidate_source_modified: boolean;
  source_dependency_tree_modified: boolean;
  source_node_modules_unchanged_bounded: boolean;
  deployment_performed: boolean;
  netlify_operation_performed: boolean;
  preview_activated: boolean;
  production_changed: boolean;
  environment_modified: boolean;
  confidence_applied: boolean;
  persistence_created: boolean;
  replay_created: boolean;
  provider_call_executed: boolean;
  supabase_write_executed: boolean;
  feedback_created: boolean;
  downstream_behavior_changed: boolean;
  cleanup_result: string;
  temporary_candidate_absent_after_cleanup: boolean;
  copied_dependencies_absent_after_cleanup: boolean;
  build_output_retained: boolean;
  credentials_retained: boolean;
  environment_values_retained: boolean;
  rehearsal_attempt_count: number;
  same_action_retry_performed: boolean;
  rehearsal_decision_vocabulary: string[];
  rehearsal_decision: string;
  abort_reason: string;
  current_runtime_preview_state: string;
  next_action: string;
};

type VerifierReport = {
  verification_status: string;
  failed_conditions: string[];
  checks: Record<string, boolean>;
};

let verifierReport: VerifierReport;

function read(relativePath: string): string {
  return readFileSync(join(root, relativePath), "utf8");
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(read(relativePath)) as T;
}

function decideRehearsalResult(input: {
  preCommandAbort: boolean;
  commandStarted: boolean;
  commandFailed: boolean;
  mutationDetected: boolean;
  cleanupFailedAfterCommand: boolean;
}): "full_candidate_rehearsal_passed" | "full_candidate_rehearsal_failed" | "full_candidate_rehearsal_aborted" {
  if (input.preCommandAbort) return "full_candidate_rehearsal_aborted";
  if (
    (input.commandStarted && input.commandFailed) ||
    input.mutationDetected ||
    input.cleanupFailedAfterCommand
  ) {
    return "full_candidate_rehearsal_failed";
  }
  return "full_candidate_rehearsal_passed";
}

test.beforeAll(() => {
  verifierReport = JSON.parse(
    execFileSync("node", [verifierPath], {
      cwd: root,
      encoding: "utf8",
      maxBuffer: 160 * 1024 * 1024,
    }),
  ) as VerifierReport;
});

test.describe("Action 485 full candidate rehearsal retry", () => {
  test("documents the single aborted retry and passes verifier", () => {
    expect(existsSync(join(root, docPath))).toBe(true);
    expect(existsSync(join(root, recordPath))).toBe(true);
    expect(existsSync(join(root, verifierPath))).toBe(true);

    const doc = read(docPath);
    expect(doc).toContain("Action 485 executed exactly one local full-candidate rehearsal attempt");
    expect(doc).toContain("Rehearsal decision: `full_candidate_rehearsal_aborted`");
    expect(doc).toContain("Abort reason: `unsafe_temp_path`");
    expect(doc).toContain(nextAction);
    expect(verifierReport.verification_status).toBe("passed");
    expect(verifierReport.failed_conditions).toEqual([]);
  });

  test("binds Action 484 approval and Action 483 failure", () => {
    const action484 = readJson<Action484Record>(action484RecordPath);
    const action483 = readJson<Action483Record>(action483RecordPath);

    expect(action484.approval_decision).toBe("approved");
    expect(action484.approved_integrity_strategy).toBe(strategy);
    expect(action484.node_modules_staged).toBe(false);
    expect(action484.invalid_pathspec_retained).toBe(false);
    expect(action484.dependency_method).toBe("temporary_verified_node_modules_copy");
    expect(action484.unresolved_conditions).toEqual([]);
    expect(action484.deployment_performed).toBe(false);
    expect(action484.preview_activated).toBe(false);
    expect(action483.rehearsal_decision).toBe("full_candidate_rehearsal_failed");
    expect(action483.candidate_integrity_result).toBe(
      "failed_git_diff_check_equivalent_setup_pathspec_for_ignored_node_modules",
    );
    expect(verifierReport.checks.action484_approval).toBe(true);
    expect(verifierReport.checks.action483_failed).toBe(true);
  });

  test("freezes exact candidate hashes and file count", () => {
    const record = readJson<Action485Record>(recordPath);

    expect(record.clean_base_identifier).toBe(cleanBase);
    expect(record.approved_change_candidate_hash).toBe(candidateHash);
    expect(record.full_candidate_inventory_hash).toBe(fullCandidateHash);
    expect(record.candidate_file_count).toBe(30);
    expect(verifierReport.checks.candidate_binding).toBe(true);
  });

  test("records safe temp path policy and pre-source abort", () => {
    const record = readJson<Action485Record>(recordPath);

    expect(record.temp_path_policy).toBe("system_temp_ture_action_485_no_machine_path_retained");
    expect(record.safe_temp_path_result).toBe("failed");
    expect(record.safe_temp_path_failure_reason).toBe("temporary_path_realpath_prefix_mismatch");
    expect(record.safe_temp_path_failure_classification).toBe("pre_source_construction_abort");
    expect(record.source_candidate_constructed).toBe(false);
    expect(verifierReport.checks.aborted_before_source).toBe(true);
  });

  test("preserves source-only integrity strategy without invalid pathspec or node_modules staging", () => {
    const record = readJson<Action485Record>(recordPath);

    expect(record.integrity_strategy).toBe(strategy);
    expect(record.source_only_integrity_result).toBe("not_run_due_unsafe_temp_path");
    expect(record.source_inventory_result).toBe("not_run_due_unsafe_temp_path");
    expect(record.overlay_result).toBe("not_run_due_unsafe_temp_path");
    expect(record.overlay_hash_result).toBe("not_run_due_unsafe_temp_path");
    expect(record.node_modules_staged).toBe(false);
    expect(record.invalid_pathspec_used).toBe(false);
    expect(verifierReport.checks.source_integrity_policy_retained).toBe(true);
  });

  test("keeps dependency copy after source integrity and records no copy occurred", () => {
    const record = readJson<Action485Record>(recordPath);

    expect(record.dependency_materialization_method).toBe("temporary_verified_node_modules_copy");
    expect(record.dependency_copy_result).toBe("not_run_due_unsafe_temp_path");
    expect(record.dependency_copy_created).toBe(false);
    expect(record.dependency_copy_removed).toBe(true);
    expect(record.network_used).toBe(false);
    expect(record.install_performed).toBe(false);
    expect(record.dependency_update_performed).toBe(false);
    expect(record.lockfile_rewrite_detected).toBe(false);
    expect(record.package_manifest_rewrite_detected).toBe(false);
    expect(verifierReport.checks.dependency_policy_retained).toBe(true);
  });

  test("records extraneous packages as not evaluated because dependency copy did not run", () => {
    const record = readJson<Action485Record>(recordPath);

    expect(record.extraneous_local_package_count).toBe(5);
    expect(record.extraneous_packages_excluded).toBe(false);
    expect(record.extraneous_packages_exclusion_result).toBe("not_run_due_unsafe_temp_path");
    expect(record.extraneous_dependency_influence_result).toBe("not_evaluated_due_unsafe_temp_path");
  });

  test("does not start serial commands or self-repair", () => {
    const record = readJson<Action485Record>(recordPath);

    expect(record.command_results).toEqual([]);
    expect(record.serial_commands_started).toBe(false);
    expect(record.runtime_projection_call_site_count).toBeNull();
    expect(record.rehearsal_attempt_count).toBe(1);
    expect(record.same_action_retry_performed).toBe(false);
  });

  test("keeps package, lockfile, config, candidate source, and source dependencies unchanged", () => {
    const record = readJson<Action485Record>(recordPath);

    expect(record.package_manifest_modified).toBe(false);
    expect(record.lockfile_modified).toBe(false);
    expect(record.configuration_modified).toBe(false);
    expect(record.candidate_source_modified).toBe(false);
    expect(record.source_dependency_tree_modified).toBe(false);
    expect(record.source_node_modules_unchanged_bounded).toBe(true);
    expect(verifierReport.checks.package_config_hashes).toBe(true);
    expect(verifierReport.checks.source_node_modules_unchanged).toBe(true);
    expect(verifierReport.checks.no_mutation).toBe(true);
  });

  test("keeps preview flag disabled and all forbidden side effects false", () => {
    const record = readJson<Action485Record>(recordPath);

    expect(record.preview_flag_state).toBe("not_checked_due_pre_source_abort");
    expect(record.preview_flag_enabled).toBe(false);
    expect(record.deployment_performed).toBe(false);
    expect(record.netlify_operation_performed).toBe(false);
    expect(record.preview_activated).toBe(false);
    expect(record.production_changed).toBe(false);
    expect(record.environment_modified).toBe(false);
    expect(record.confidence_applied).toBe(false);
    expect(record.persistence_created).toBe(false);
    expect(record.replay_created).toBe(false);
    expect(record.provider_call_executed).toBe(false);
    expect(record.supabase_write_executed).toBe(false);
    expect(record.feedback_created).toBe(false);
    expect(record.downstream_behavior_changed).toBe(false);
    expect(verifierReport.checks.no_effects).toBe(true);
    expect(verifierReport.checks.runtime_state).toBe(true);
  });

  test("cleans temporary candidate and copied dependencies", () => {
    const record = readJson<Action485Record>(recordPath);

    expect(record.cleanup_result).toBe("temporary_candidate_and_dependency_copy_removed");
    expect(record.temporary_candidate_absent_after_cleanup).toBe(true);
    expect(record.copied_dependencies_absent_after_cleanup).toBe(true);
    expect(record.build_output_retained).toBe(false);
    expect(record.credentials_retained).toBe(false);
    expect(record.environment_values_retained).toBe(false);
    expect(verifierReport.checks.cleanup).toBe(true);
  });

  test("covers passed, aborted, and failed result paths and routes to mandatory next action", () => {
    const record = readJson<Action485Record>(recordPath);

    expect(record.rehearsal_decision_vocabulary).toEqual([
      "full_candidate_rehearsal_passed",
      "full_candidate_rehearsal_failed",
      "full_candidate_rehearsal_aborted",
    ]);
    expect(decideRehearsalResult({
      preCommandAbort: false,
      commandStarted: true,
      commandFailed: false,
      mutationDetected: false,
      cleanupFailedAfterCommand: false,
    })).toBe("full_candidate_rehearsal_passed");
    expect(decideRehearsalResult({
      preCommandAbort: true,
      commandStarted: false,
      commandFailed: false,
      mutationDetected: false,
      cleanupFailedAfterCommand: false,
    })).toBe("full_candidate_rehearsal_aborted");
    expect(decideRehearsalResult({
      preCommandAbort: false,
      commandStarted: true,
      commandFailed: true,
      mutationDetected: false,
      cleanupFailedAfterCommand: false,
    })).toBe("full_candidate_rehearsal_failed");
    expect(record.rehearsal_decision).toBe("full_candidate_rehearsal_aborted");
    expect(record.abort_reason).toBe("unsafe_temp_path");
    expect(record.next_action).toBe(nextAction);
    expect(record.current_runtime_preview_state).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(verifierReport.checks.attempt_and_next_action).toBe(true);
  });
});
