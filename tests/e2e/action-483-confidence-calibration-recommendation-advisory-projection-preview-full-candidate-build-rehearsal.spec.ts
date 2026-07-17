import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join, resolve } from "path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const docPath =
  "docs/action-483-confidence-calibration-recommendation-advisory-projection-preview-full-candidate-build-rehearsal.md";
const recordPath =
  "docs/action-483-confidence-calibration-recommendation-advisory-projection-preview-full-candidate-build-rehearsal-record.json";
const action482RecordPath =
  "docs/action-482-confidence-calibration-recommendation-advisory-projection-preview-dependency-materialization-record.json";
const verifierPath =
  "scripts/action-483-confidence-calibration-recommendation-advisory-projection-preview-full-candidate-build-rehearsal-verify.mjs";
const cleanBase = "15f9923c24ed1f3cf82d34656eeacbfd98a0d347";
const candidateHash =
  "7a11d9c6697a9d89ffb3e762dd15185fda225bc8e39c80a212cd3729d05857f6";
const fullCandidateHash =
  "cc6a97c5797a1fa76a6bebe9be1497fe88819f1b73992b271c142ff61d3bc2f0";
const nextAction = "action_484_full_candidate_rehearsal_integrity_command_remediation_gate";

test.setTimeout(300000);

type Action482Record = {
  dependency_materialization_decision: string;
  overall_readiness: string;
  network_required: boolean;
  dependency_install_performed: boolean;
};

type Action483Record = {
  clean_base_identifier: string;
  approved_change_candidate_hash: string;
  full_candidate_inventory_hash: string;
  candidate_file_count: number;
  candidate_reconstruction_result: string;
  base_materialization_result: string;
  overlay_result: string;
  overlaid_file_count: number;
  overlay_hash_result: string;
  unexpected_changed_files: number;
  unrelated_post_trade_files: number;
  environment_files: number;
  secret_files: number;
  merge_conflict_markers: number;
  dependency_materialization_method: string;
  dependency_copy_created: boolean;
  dependency_copy_removed: boolean;
  network_used: boolean;
  install_performed: boolean;
  dependency_update_performed: boolean;
  install_lifecycle_triggered: boolean;
  registry_access_performed: boolean;
  candidate_inventory_includes_dependencies: boolean;
  node_modules_tracked: boolean;
  extraneous_local_package_count: number;
  extraneous_package_names_recorded: string[];
  extraneous_packages_present_in_temporary_dependency_tree: boolean;
  extraneous_dependency_influence_result: string;
  candidate_integrity_result: string;
  command_results: Array<{ name: string; status: string; summary?: string }>;
  serial_execution_result: string;
  same_action_retry_performed: boolean;
  runtime_projection_call_site_count: number;
  preview_flag_state: string;
  package_manifest_modified: boolean;
  lockfile_modified: boolean;
  configuration_modified: boolean;
  source_dependency_tree_modified: boolean;
  candidate_source_modified: boolean;
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
  ranking_changed: boolean;
  scanner_changed: boolean;
  publication_changed: boolean;
  execution_changed: boolean;
  add_trade_changed: boolean;
  risk_sizing_changed: boolean;
  cleanup_result: string;
  temporary_candidate_absent_after_cleanup: boolean;
  copied_dependencies_absent_after_cleanup: boolean;
  build_output_retained: boolean;
  credentials_retained: boolean;
  environment_values_retained: boolean;
  decision_vocabulary: string[];
  rehearsal_decision: string;
  failure_classification: string;
  current_runtime_preview_state: string;
  next_action: string;
};

type VerifierReport = {
  verification_status: string;
  failed_conditions: string[];
  checks: Record<string, boolean>;
  rehearsal_decision: string;
  failure_classification: string;
  next_action: string;
};

let verifierReport: VerifierReport;

function read(relativePath: string): string {
  return readFileSync(join(root, relativePath), "utf8");
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(read(relativePath)) as T;
}

function rehearsalDecisionFor(input: {
  candidateExact: boolean;
  dependenciesAvailable: boolean;
  extraneousInfluenceResolved: boolean;
  commandStarted: boolean;
  commandFailed: boolean;
  cleanupSucceeded: boolean;
}): "full_candidate_rehearsal_passed" | "full_candidate_rehearsal_failed" | "full_candidate_rehearsal_aborted" {
  if (!input.candidateExact || !input.dependenciesAvailable || !input.extraneousInfluenceResolved) {
    return "full_candidate_rehearsal_aborted";
  }
  if ((input.commandStarted && input.commandFailed) || !input.cleanupSucceeded) {
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

test.describe("Action 483 full candidate build rehearsal", () => {
  test("documents the bounded failed rehearsal and passes verifier", () => {
    expect(existsSync(join(root, docPath))).toBe(true);
    expect(existsSync(join(root, recordPath))).toBe(true);
    expect(existsSync(join(root, verifierPath))).toBe(true);

    const doc = read(docPath);
    expect(doc).toContain("Action 483 constructed the isolated full candidate");
    expect(doc).toContain("Rehearsal decision: `full_candidate_rehearsal_failed`");
    expect(doc).toContain(nextAction);
    expect(verifierReport.verification_status).toBe("passed");
    expect(verifierReport.failed_conditions).toEqual([]);
  });

  test("binds Action 482 condition and exact candidate hashes", () => {
    const action482 = readJson<Action482Record>(action482RecordPath);
    const record = readJson<Action483Record>(recordPath);

    expect(action482.dependency_materialization_decision).toBe(
      "dependency_materialization_ready_with_conditions",
    );
    expect(action482.overall_readiness).toBe("ready_with_conditions");
    expect(action482.network_required).toBe(false);
    expect(action482.dependency_install_performed).toBe(false);
    expect(record.clean_base_identifier).toBe(cleanBase);
    expect(record.approved_change_candidate_hash).toBe(candidateHash);
    expect(record.full_candidate_inventory_hash).toBe(fullCandidateHash);
    expect(record.candidate_file_count).toBe(30);
    expect(verifierReport.checks.action482_condition).toBe(true);
    expect(verifierReport.checks.candidate_binding).toBe(true);
  });

  test("records safe temp candidate reconstruction and dirty-worktree exclusion", () => {
    const record = readJson<Action483Record>(recordPath);

    expect(record.candidate_reconstruction_result).toBe(
      "temporary_candidate_constructed_from_clean_base_plus_approved_overlay",
    );
    expect(record.base_materialization_result).toBe(
      "git_archive_clean_base_materialized_without_broad_dirty_worktree",
    );
    expect(record.overlay_result).toBe("exact_30_candidate_files_overlaid");
    expect(record.overlaid_file_count).toBe(30);
    expect(record.overlay_hash_result).toBe(
      "passed_for_29_explicit_hashes_one_prior_inventory_null_hash_preserved",
    );
    expect(record.unexpected_changed_files).toBe(0);
    expect(record.unrelated_post_trade_files).toBe(0);
    expect(record.environment_files).toBe(0);
    expect(record.secret_files).toBe(0);
    expect(record.merge_conflict_markers).toBe(0);
    expect(verifierReport.checks.temp_safety_and_reconstruction).toBe(true);
  });

  test("uses temporary dependency copy with no network or install", () => {
    const record = readJson<Action483Record>(recordPath);

    expect(record.dependency_materialization_method).toBe("temporary_verified_node_modules_copy");
    expect(record.dependency_copy_created).toBe(true);
    expect(record.dependency_copy_removed).toBe(true);
    expect(record.network_used).toBe(false);
    expect(record.install_performed).toBe(false);
    expect(record.dependency_update_performed).toBe(false);
    expect(record.install_lifecycle_triggered).toBe(false);
    expect(record.registry_access_performed).toBe(false);
    expect(record.candidate_inventory_includes_dependencies).toBe(false);
    expect(record.node_modules_tracked).toBe(false);
    expect(verifierReport.checks.dependency_materialization).toBe(true);
  });

  test("classifies extraneous dependencies as absent from temp dependency tree", () => {
    const record = readJson<Action483Record>(recordPath);

    expect(record.extraneous_local_package_count).toBe(5);
    expect(record.extraneous_package_names_recorded).toEqual([
      "@emnapi/core",
      "@emnapi/runtime",
      "@emnapi/wasi-threads",
      "@napi-rs/wasm-runtime",
      "@tybys/wasm-util",
    ]);
    expect(record.extraneous_packages_present_in_temporary_dependency_tree).toBe(false);
    expect(record.extraneous_dependency_influence_result).toBe(
      "no_influence_detected_absent_from_temporary_dependency_tree",
    );
    expect(verifierReport.checks.extraneous_dependency_result).toBe(true);
  });

  test("stops after first failed temp-sensitive command with no same-action retry", () => {
    const record = readJson<Action483Record>(recordPath);
    const [firstCommand, ...laterCommands] = record.command_results;

    expect(record.candidate_integrity_result).toBe(
      "failed_git_diff_check_equivalent_setup_pathspec_for_ignored_node_modules",
    );
    expect(firstCommand.name).toBe("candidate_integrity_equivalent_to_git_diff_check");
    expect(firstCommand.status).toBe("failed");
    expect(laterCommands.every((command) => command.status === "not_run_due_prior_failure")).toBe(true);
    expect(record.serial_execution_result).toBe("stopped_after_first_failed_temp_sensitive_command");
    expect(record.same_action_retry_performed).toBe(false);
    expect(verifierReport.checks.command_failure).toBe(true);
  });

  test("keeps package, lockfile, config, source dependencies, and candidate source immutable", () => {
    const record = readJson<Action483Record>(recordPath);

    expect(record.package_manifest_modified).toBe(false);
    expect(record.lockfile_modified).toBe(false);
    expect(record.configuration_modified).toBe(false);
    expect(record.source_dependency_tree_modified).toBe(false);
    expect(record.candidate_source_modified).toBe(false);
    expect(verifierReport.checks.package_config_hashes).toBe(true);
    expect(verifierReport.checks.no_mutation).toBe(true);
  });

  test("keeps preview disabled and all runtime side effects false", () => {
    const record = readJson<Action483Record>(recordPath);

    expect(record.runtime_projection_call_site_count).toBe(1);
    expect(record.preview_flag_state).toBe("disabled_by_policy_not_read_from_env");
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
    expect(record.ranking_changed).toBe(false);
    expect(record.scanner_changed).toBe(false);
    expect(record.publication_changed).toBe(false);
    expect(record.execution_changed).toBe(false);
    expect(record.add_trade_changed).toBe(false);
    expect(record.risk_sizing_changed).toBe(false);
    expect(verifierReport.checks.no_side_effects).toBe(true);
  });

  test("cleans temp candidate and copied dependencies", () => {
    const record = readJson<Action483Record>(recordPath);

    expect(record.cleanup_result).toBe("temporary_candidate_and_dependency_copy_removed");
    expect(record.temporary_candidate_absent_after_cleanup).toBe(true);
    expect(record.copied_dependencies_absent_after_cleanup).toBe(true);
    expect(record.build_output_retained).toBe(false);
    expect(record.credentials_retained).toBe(false);
    expect(record.environment_values_retained).toBe(false);
    expect(verifierReport.checks.cleanup).toBe(true);
  });

  test("uses exact result vocabulary and routes to remediation gate", () => {
    const record = readJson<Action483Record>(recordPath);

    expect(record.decision_vocabulary).toEqual([
      "full_candidate_rehearsal_passed",
      "full_candidate_rehearsal_failed",
      "full_candidate_rehearsal_aborted",
    ]);
    expect(
      rehearsalDecisionFor({
        candidateExact: true,
        dependenciesAvailable: true,
        extraneousInfluenceResolved: true,
        commandStarted: true,
        commandFailed: true,
        cleanupSucceeded: true,
      }),
    ).toBe("full_candidate_rehearsal_failed");
    expect(
      rehearsalDecisionFor({
        candidateExact: false,
        dependenciesAvailable: true,
        extraneousInfluenceResolved: true,
        commandStarted: false,
        commandFailed: false,
        cleanupSucceeded: true,
      }),
    ).toBe("full_candidate_rehearsal_aborted");
    expect(
      rehearsalDecisionFor({
        candidateExact: true,
        dependenciesAvailable: true,
        extraneousInfluenceResolved: true,
        commandStarted: true,
        commandFailed: false,
        cleanupSucceeded: true,
      }),
    ).toBe("full_candidate_rehearsal_passed");
    expect(record.rehearsal_decision).toBe("full_candidate_rehearsal_failed");
    expect(record.next_action).toBe(nextAction);
    expect(record.current_runtime_preview_state).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(verifierReport.checks.decision).toBe(true);
  });
});
