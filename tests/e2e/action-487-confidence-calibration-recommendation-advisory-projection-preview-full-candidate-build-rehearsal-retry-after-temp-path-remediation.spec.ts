import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import path, { join, resolve } from "path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const docPath =
  "docs/action-487-confidence-calibration-recommendation-advisory-projection-preview-full-candidate-build-rehearsal-retry-after-temp-path-remediation.md";
const recordPath =
  "docs/action-487-confidence-calibration-recommendation-advisory-projection-preview-full-candidate-build-rehearsal-retry-record.json";
const action486RecordPath =
  "docs/action-486-confidence-calibration-recommendation-advisory-projection-preview-temp-path-abort-remediation-approval-record.json";
const action485RecordPath =
  "docs/action-485-confidence-calibration-recommendation-advisory-projection-preview-full-candidate-build-rehearsal-retry-record.json";
const verifierPath =
  "scripts/action-487-confidence-calibration-recommendation-advisory-projection-preview-full-candidate-build-rehearsal-retry-after-temp-path-remediation-verify.mjs";
const nextAction = "action_488_source_safety_marker_classification_remediation_gate";

test.setTimeout(300000);

type Action487Record = {
  action_486_approval_decision: string;
  clean_base_identifier: string;
  approved_change_candidate_hash: string;
  full_candidate_inventory_hash: string;
  candidate_file_count: number;
  canonical_temp_root_result: string;
  canonical_candidate_path_result: string;
  containment_result: string;
  macos_alias_handling_result: string;
  symlink_result: string;
  forbidden_root_result: string;
  path_safety_result: string;
  caller_controlled_path_used: boolean;
  source_candidate_created: boolean;
  source_candidate_constructed: boolean;
  candidate_reconstruction_result: string;
  base_materialization_result: string;
  overlay_result: string;
  overlaid_file_count: number;
  direct_overlay_hash_result: string;
  direct_overlay_hashes_verified_count: number;
  prior_inventory_null_hash_preserved_count: number;
  source_inventory_result: string;
  unexpected_source_file_count: number;
  missing_source_file_count: number;
  merge_conflict_markers_detected: boolean;
  environment_files_detected: boolean;
  secret_like_files_detected: boolean;
  source_safety_marker_result: string;
  source_safety_marker_detection_scope: string;
  candidate_defective: boolean;
  source_only_integrity_result: string;
  node_modules_staged: boolean;
  invalid_pathspec_used: boolean;
  dependency_materialization_method: string;
  dependency_copy_result: string;
  dependency_copy_created: boolean;
  dependency_copy_removed: boolean;
  network_used: boolean;
  install_performed: boolean;
  dependency_update_performed: boolean;
  extraneous_local_package_count: number;
  extraneous_packages_excluded: boolean;
  extraneous_dependency_influence_result: string;
  preview_flag_state: string;
  preview_flag_enabled: boolean;
  command_inventory_result: string;
  command_results: unknown[];
  serial_commands_started: boolean;
  no_parallel_temp_execution: boolean;
  runtime_projection_call_site_count: number | null;
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
  confidence_applied: boolean;
  persistence_created: boolean;
  replay_created: boolean;
  provider_call_executed: boolean;
  supabase_write_executed: boolean;
  feedback_created: boolean;
  downstream_behavior_changed: boolean;
  ranking_changed: boolean;
  scanner_changed: boolean;
  cleanup_result: string;
  temporary_candidate_absent_after_cleanup: boolean;
  copied_dependencies_absent_after_cleanup: boolean;
  rehearsal_attempt_count: number;
  same_action_retry_performed: boolean;
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

function contained(canonicalRoot: string, candidate: string): boolean {
  const relative = path.relative(canonicalRoot, candidate);
  return (
    relative.length > 0 &&
    relative !== ".." &&
    !relative.startsWith(`..${path.sep}`) &&
    !path.isAbsolute(relative)
  );
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

test.describe("Action 487 full candidate rehearsal retry after temp-path remediation", () => {
  test("documents the actual one-attempt rehearsal result and passes verifier", () => {
    expect(existsSync(join(root, docPath))).toBe(true);
    expect(existsSync(join(root, recordPath))).toBe(true);
    expect(existsSync(join(root, verifierPath))).toBe(true);

    const doc = read(docPath);
    expect(doc).toContain("Action 487 executed exactly one local full-candidate rehearsal attempt");
    expect(doc).toContain("The Action 487 path-safety phase passed");
    expect(doc).toContain("Rehearsal decision: `full_candidate_rehearsal_aborted`");
    expect(doc).toContain(nextAction);
    expect(verifierReport.verification_status).toBe("passed");
    expect(verifierReport.failed_conditions).toEqual([]);
  });

  test("binds Actions 485 and 486", () => {
    const action485 = readJson<{ rehearsal_decision: string; abort_reason: string }>(action485RecordPath);
    const action486 = readJson<{ approval_decision: string; next_action: string }>(action486RecordPath);
    const record = readJson<Action487Record>(recordPath);

    expect(action485.rehearsal_decision).toBe("full_candidate_rehearsal_aborted");
    expect(action485.abort_reason).toBe("unsafe_temp_path");
    expect(action486.approval_decision).toBe("approved");
    expect(action486.next_action).toBe("action_487_full_candidate_build_rehearsal_retry_after_temp_path_remediation");
    expect(record.action_486_approval_decision).toBe("approved");
    expect(verifierReport.checks.action485_aborted).toBe(true);
    expect(verifierReport.checks.action486_approval).toBe(true);
  });

  test("keeps exact candidate hashes and file count", () => {
    const record = readJson<Action487Record>(recordPath);

    expect(record.clean_base_identifier).toBe("15f9923c24ed1f3cf82d34656eeacbfd98a0d347");
    expect(record.approved_change_candidate_hash).toBe(
      "7a11d9c6697a9d89ffb3e762dd15185fda225bc8e39c80a212cd3729d05857f6",
    );
    expect(record.full_candidate_inventory_hash).toBe(
      "cc6a97c5797a1fa76a6bebe9be1497fe88819f1b73992b271c142ff61d3bc2f0",
    );
    expect(record.candidate_file_count).toBe(30);
    expect(verifierReport.checks.candidate_binding).toBe(true);
  });

  test("records canonical temp-root handling and path-aware containment behavior", () => {
    const record = readJson<Action487Record>(recordPath);

    expect(record.canonical_temp_root_result).toBe("passed");
    expect(record.canonical_candidate_path_result).toBe("passed");
    expect(record.containment_result).toBe("passed_path_relative_containment");
    expect(record.macos_alias_handling_result).toBe("canonicalized_runtime_temp_root_used");
    expect(record.path_safety_result).toBe("passed");
    expect(record.caller_controlled_path_used).toBe(false);

    expect(contained("/private/var/folders/root", "/private/var/folders/root/ture/action-487")).toBe(true);
    expect(contained("/private/var/folders/root", "/private/var/folders/root-evil/ture/action-487")).toBe(false);
    expect(contained("/private/var/folders/root", "/private/var/folders/root/../escape")).toBe(false);
    expect(verifierReport.checks.path_safety).toBe(true);
  });

  test("preserves symlink and forbidden-root protections", () => {
    const record = readJson<Action487Record>(recordPath);

    expect(record.symlink_result).toBe("passed");
    expect(record.forbidden_root_result).toBe("passed");
    expect(record.node_modules_staged).toBe(false);
    expect(record.invalid_pathspec_used).toBe(false);
  });

  test("constructs source from clean base and exact overlay", () => {
    const record = readJson<Action487Record>(recordPath);

    expect(record.source_candidate_created).toBe(true);
    expect(record.source_candidate_constructed).toBe(true);
    expect(record.candidate_reconstruction_result).toBe(
      "temporary_candidate_constructed_from_clean_base_plus_approved_overlay",
    );
    expect(record.base_materialization_result).toBe("git_archive_clean_base_materialized_without_broad_dirty_worktree");
    expect(record.overlay_result).toBe("exact_30_candidate_files_overlaid");
    expect(record.overlaid_file_count).toBe(30);
    expect(verifierReport.checks.source_construction).toBe(true);
  });

  test("verifies overlay hashes and bounded source inventory before abort", () => {
    const record = readJson<Action487Record>(recordPath);

    expect(record.direct_overlay_hash_result).toBe(
      "passed_for_29_explicit_hashes_one_prior_inventory_null_hash_preserved",
    );
    expect(record.direct_overlay_hashes_verified_count).toBe(29);
    expect(record.prior_inventory_null_hash_preserved_count).toBe(1);
    expect(record.source_inventory_result).toBe("passed_bounded_git_head_plus_exact_overlay_inventory");
    expect(record.unexpected_source_file_count).toBe(0);
    expect(record.missing_source_file_count).toBe(0);
    expect(record.merge_conflict_markers_detected).toBe(false);
    expect(record.environment_files_detected).toBe(false);
    expect(verifierReport.checks.overlay_and_inventory).toBe(true);
  });

  test("aborts on source-safety marker before source-only integrity completes", () => {
    const record = readJson<Action487Record>(recordPath);

    expect(record.secret_like_files_detected).toBe(true);
    expect(record.source_safety_marker_result).toBe(
      "blocked_by_secret_like_file_name_detection_before_source_only_integrity",
    );
    expect(record.source_safety_marker_detection_scope).toBe(
      "bounded_source_inventory_path_name_scan_no_file_contents_or_paths_recorded",
    );
    expect(record.candidate_defective).toBe(false);
    expect(record.source_only_integrity_result).toBe("not_started");
    expect(record.rehearsal_decision).toBe("full_candidate_rehearsal_aborted");
    expect(record.abort_reason).toBe("source_safety_marker_detected");
    expect(verifierReport.checks.source_safety_abort).toBe(true);
  });

  test("does not materialize dependencies after source-safety abort", () => {
    const record = readJson<Action487Record>(recordPath);

    expect(record.dependency_materialization_method).toBe("temporary_verified_node_modules_copy");
    expect(record.dependency_copy_result).toBe("not_started");
    expect(record.dependency_copy_created).toBe(false);
    expect(record.dependency_copy_removed).toBe(true);
    expect(record.network_used).toBe(false);
    expect(record.install_performed).toBe(false);
    expect(record.dependency_update_performed).toBe(false);
    expect(record.extraneous_local_package_count).toBe(5);
    expect(record.extraneous_packages_excluded).toBe(false);
    expect(record.extraneous_dependency_influence_result).toBe("not_evaluated");
    expect(verifierReport.checks.dependency_not_run).toBe(true);
  });

  test("does not start serial commands or parallel temp execution", () => {
    const record = readJson<Action487Record>(recordPath);

    expect(record.command_inventory_result).toBe("not_started");
    expect(record.command_results).toEqual([]);
    expect(record.serial_commands_started).toBe(false);
    expect(record.no_parallel_temp_execution).toBe(true);
    expect(record.runtime_projection_call_site_count).toBeNull();
    expect(verifierReport.checks.commands_not_started).toBe(true);
  });

  test("keeps package, lockfile, config, source, and dependency tree unchanged", () => {
    const record = readJson<Action487Record>(recordPath);

    expect(record.package_manifest_modified).toBe(false);
    expect(record.lockfile_modified).toBe(false);
    expect(record.configuration_modified).toBe(false);
    expect(record.candidate_source_modified).toBe(false);
    expect(record.source_dependency_tree_modified).toBe(false);
    expect(record.source_node_modules_unchanged_bounded).toBe(true);
    expect(verifierReport.checks.package_config_hashes).toBe(true);
    expect(verifierReport.checks.no_mutation).toBe(true);
    expect(verifierReport.checks.source_node_modules_unchanged).toBe(true);
  });

  test("has no deployment, activation, provider, Supabase, confidence, feedback, or downstream effects", () => {
    const record = readJson<Action487Record>(recordPath);

    expect(record.deployment_performed).toBe(false);
    expect(record.netlify_operation_performed).toBe(false);
    expect(record.preview_activated).toBe(false);
    expect(record.production_changed).toBe(false);
    expect(record.confidence_applied).toBe(false);
    expect(record.persistence_created).toBe(false);
    expect(record.replay_created).toBe(false);
    expect(record.provider_call_executed).toBe(false);
    expect(record.supabase_write_executed).toBe(false);
    expect(record.feedback_created).toBe(false);
    expect(record.downstream_behavior_changed).toBe(false);
    expect(record.ranking_changed).toBe(false);
    expect(record.scanner_changed).toBe(false);
    expect(verifierReport.checks.no_effects).toBe(true);
  });

  test("cleans the bounded temp subtree and records exactly one attempt", () => {
    const record = readJson<Action487Record>(recordPath);

    expect(record.cleanup_result).toBe("temporary_candidate_and_dependency_copy_removed");
    expect(record.temporary_candidate_absent_after_cleanup).toBe(true);
    expect(record.copied_dependencies_absent_after_cleanup).toBe(true);
    expect(record.rehearsal_attempt_count).toBe(1);
    expect(record.same_action_retry_performed).toBe(false);
    expect(record.next_action).toBe(nextAction);
    expect(record.current_runtime_preview_state).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(verifierReport.checks.cleanup).toBe(true);
    expect(verifierReport.checks.attempt_and_next_action).toBe(true);
  });
});
