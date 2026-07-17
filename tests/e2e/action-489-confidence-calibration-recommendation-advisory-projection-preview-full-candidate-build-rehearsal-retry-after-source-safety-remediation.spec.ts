import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import path, { join, resolve } from "path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const docPath =
  "docs/action-489-confidence-calibration-recommendation-advisory-projection-preview-full-candidate-build-rehearsal-retry-after-source-safety-remediation.md";
const recordPath =
  "docs/action-489-confidence-calibration-recommendation-advisory-projection-preview-full-candidate-build-rehearsal-retry-record.json";
const action488RecordPath =
  "docs/action-488-confidence-calibration-recommendation-advisory-projection-preview-source-safety-marker-remediation-approval-record.json";
const action487RecordPath =
  "docs/action-487-confidence-calibration-recommendation-advisory-projection-preview-full-candidate-build-rehearsal-retry-record.json";
const verifierPath =
  "scripts/action-489-confidence-calibration-recommendation-advisory-projection-preview-full-candidate-build-rehearsal-retry-after-source-safety-remediation-verify.mjs";
const nextAction = "action_490_full_candidate_command_inventory_binding_remediation_gate";

test.setTimeout(300000);

type Action489Record = {
  action_488_approval_decision: string;
  clean_base_identifier: string;
  approved_change_candidate_hash: string;
  full_candidate_inventory_hash: string;
  candidate_file_count: number;
  path_safety_result: string;
  source_reconstruction_result: string;
  overlay_result: string;
  overlaid_file_count: number;
  overlay_verification_result: string;
  source_inventory_result: string;
  missing_source_file_count: number;
  unexpected_source_file_count: number;
  source_safety_result: string;
  source_safety_filename_indicators_advisory: boolean;
  source_safety_unknown_sensitive_file_count: number;
  source_safety_prohibited_file_count: number;
  raw_credential_values_recorded: boolean;
  source_only_git_integrity_result: string;
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
  alternate_preview_flag_alias_detected: boolean;
  command_inventory_result: string;
  command_inventory_missing_count: number;
  command_inventory_missing_items: Array<{ name: string; missing_candidate_artifact: string }>;
  command_results: Array<{ name: string; status: string }>;
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
  return relative.length > 0 && relative !== ".." && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
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

test.describe("Action 489 full candidate rehearsal retry after source-safety remediation", () => {
  test("documents the one-attempt rehearsal and passes verifier", () => {
    expect(existsSync(join(root, docPath))).toBe(true);
    expect(existsSync(join(root, recordPath))).toBe(true);
    expect(existsSync(join(root, verifierPath))).toBe(true);

    const doc = read(docPath);
    expect(doc).toContain("Action 489 executed exactly one local full-candidate rehearsal attempt");
    expect(doc).toContain("Source-safety result: `source_safety_passed`");
    expect(doc).toContain("failed_required_command_artifacts_missing_from_bound_candidate");
    expect(doc).toContain(nextAction);
    expect(verifierReport.verification_status).toBe("passed");
    expect(verifierReport.failed_conditions).toEqual([]);
  });

  test("binds Actions 487 and 488", () => {
    const action487 = readJson<{ rehearsal_decision: string; abort_reason: string }>(action487RecordPath);
    const action488 = readJson<{ approval_decision: string; next_action: string }>(action488RecordPath);
    const record = readJson<Action489Record>(recordPath);

    expect(action487.rehearsal_decision).toBe("full_candidate_rehearsal_aborted");
    expect(action487.abort_reason).toBe("source_safety_marker_detected");
    expect(action488.approval_decision).toBe("approved");
    expect(action488.next_action).toBe("action_489_full_candidate_build_rehearsal_retry_after_source_safety_remediation");
    expect(record.action_488_approval_decision).toBe("approved");
    expect(verifierReport.checks.action487_aborted).toBe(true);
    expect(verifierReport.checks.action488_approval).toBe(true);
  });

  test("keeps exact candidate hashes and file count", () => {
    const record = readJson<Action489Record>(recordPath);

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

  test("records safe temp path containment behavior", () => {
    const record = readJson<Action489Record>(recordPath);

    expect(record.path_safety_result).toBe("passed");
    expect(contained("/private/var/folders/root", "/private/var/folders/root/ture/action-489")).toBe(true);
    expect(contained("/private/var/folders/root", "/private/var/folders/root-evil/ture/action-489")).toBe(false);
    expect(verifierReport.checks.path_safety).toBe(true);
  });

  test("reconstructs clean base and exact overlay", () => {
    const record = readJson<Action489Record>(recordPath);

    expect(record.source_reconstruction_result).toBe("temporary_candidate_constructed_from_clean_base_plus_approved_overlay");
    expect(record.overlay_result).toBe("exact_30_candidate_files_overlaid");
    expect(record.overlaid_file_count).toBe(30);
    expect(record.overlay_verification_result).toBe(
      "passed_for_29_explicit_hashes_one_prior_inventory_null_hash_preserved",
    );
    expect(verifierReport.checks.source_reconstruction).toBe(true);
  });

  test("passes source inventory and remediated source-safety classification", () => {
    const record = readJson<Action489Record>(recordPath);

    expect(record.source_inventory_result).toBe("passed_bounded_git_head_plus_exact_overlay_inventory");
    expect(record.missing_source_file_count).toBe(0);
    expect(record.unexpected_source_file_count).toBe(0);
    expect(record.source_safety_result).toBe("source_safety_passed");
    expect(record.source_safety_filename_indicators_advisory).toBe(true);
    expect(record.source_safety_unknown_sensitive_file_count).toBe(0);
    expect(record.source_safety_prohibited_file_count).toBe(0);
    expect(record.raw_credential_values_recorded).toBe(false);
    expect(verifierReport.checks.overlay_inventory_safety).toBe(true);
    expect(verifierReport.checks.source_safety).toBe(true);
  });

  test("passes source-only Git integrity without staging node_modules or invalid pathspec", () => {
    const record = readJson<Action489Record>(recordPath);

    expect(record.source_only_git_integrity_result).toBe(
      "passed_git_diff_check_on_approved_source_overlay_without_node_modules_pathspec",
    );
    expect(record.node_modules_staged).toBe(false);
    expect(record.invalid_pathspec_used).toBe(false);
    expect(verifierReport.checks.git_integrity).toBe(true);
  });

  test("copies dependencies after source safety and excludes five extraneous packages", () => {
    const record = readJson<Action489Record>(recordPath);

    expect(record.dependency_materialization_method).toBe("temporary_verified_node_modules_copy");
    expect(record.dependency_copy_result).toBe("passed_temporary_verified_node_modules_copy");
    expect(record.dependency_copy_created).toBe(true);
    expect(record.dependency_copy_removed).toBe(true);
    expect(record.network_used).toBe(false);
    expect(record.install_performed).toBe(false);
    expect(record.dependency_update_performed).toBe(false);
    expect(record.extraneous_local_package_count).toBe(5);
    expect(record.extraneous_packages_excluded).toBe(true);
    expect(record.extraneous_dependency_influence_result).toBe(
      "no_influence_detected_absent_from_temporary_dependency_tree",
    );
    expect(verifierReport.checks.dependency_materialization).toBe(true);
    expect(verifierReport.checks.extraneous).toBe(true);
  });

  test("aborts before command execution because later focused suites are absent from bound candidate", () => {
    const record = readJson<Action489Record>(recordPath);

    expect(record.command_inventory_result).toBe("failed_required_command_artifacts_missing_from_bound_candidate");
    expect(record.command_inventory_missing_count).toBe(9);
    expect(record.command_inventory_missing_items.map((item) => item.name)).toContain("focused Action 481 suite");
    expect(record.command_inventory_missing_items.map((item) => item.name)).toContain("focused Action 489 suite");
    expect(record.command_results).toHaveLength(27);
    expect(record.serial_commands_started).toBe(false);
    expect(record.no_parallel_temp_execution).toBe(true);
    expect(record.runtime_projection_call_site_count).toBeNull();
    expect(verifierReport.checks.command_inventory_abort).toBe(true);
  });

  test("keeps preview flag disabled and package/config/source dependencies unchanged", () => {
    const record = readJson<Action489Record>(recordPath);

    expect(record.preview_flag_state).toBe("absent_or_disabled");
    expect(record.preview_flag_enabled).toBe(false);
    expect(record.alternate_preview_flag_alias_detected).toBe(false);
    expect(record.package_manifest_modified).toBe(false);
    expect(record.lockfile_modified).toBe(false);
    expect(record.configuration_modified).toBe(false);
    expect(record.candidate_source_modified).toBe(false);
    expect(record.source_dependency_tree_modified).toBe(false);
    expect(record.source_node_modules_unchanged_bounded).toBe(true);
    expect(verifierReport.checks.runtime_and_flag).toBe(true);
    expect(verifierReport.checks.no_mutation).toBe(true);
    expect(verifierReport.checks.source_node_modules_unchanged).toBe(true);
  });

  test("has no deployment, activation, provider, Supabase, confidence, feedback, or downstream effects", () => {
    const record = readJson<Action489Record>(recordPath);

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

  test("cleans temporary source and dependency copy with exactly one attempt", () => {
    const record = readJson<Action489Record>(recordPath);

    expect(record.cleanup_result).toBe("temporary_candidate_and_dependency_copy_removed");
    expect(record.temporary_candidate_absent_after_cleanup).toBe(true);
    expect(record.copied_dependencies_absent_after_cleanup).toBe(true);
    expect(record.rehearsal_attempt_count).toBe(1);
    expect(record.same_action_retry_performed).toBe(false);
    expect(record.rehearsal_decision).toBe("full_candidate_rehearsal_aborted");
    expect(record.abort_reason).toBe("command_inventory_unresolvable_in_bound_30_file_candidate");
    expect(record.next_action).toBe(nextAction);
    expect(record.current_runtime_preview_state).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(verifierReport.checks.cleanup).toBe(true);
    expect(verifierReport.checks.attempt_and_next_action).toBe(true);
  });
});
