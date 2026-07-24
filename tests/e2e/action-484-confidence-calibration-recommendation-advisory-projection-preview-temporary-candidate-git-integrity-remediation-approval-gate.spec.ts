import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join, resolve } from "path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const docPath =
  "docs/action-484-confidence-calibration-recommendation-advisory-projection-preview-temporary-candidate-git-integrity-remediation-approval-gate.md";
const recordPath =
  "docs/action-484-confidence-calibration-recommendation-advisory-projection-preview-temporary-candidate-git-integrity-remediation-approval-record.json";
const action483RecordPath =
  "docs/action-483-confidence-calibration-recommendation-advisory-projection-preview-full-candidate-build-rehearsal-record.json";
const action482RecordPath =
  "docs/action-482-confidence-calibration-recommendation-advisory-projection-preview-dependency-materialization-record.json";
const verifierPath =
  "scripts/action-484-confidence-calibration-recommendation-advisory-projection-preview-temporary-candidate-git-integrity-remediation-approval-gate-verify.mjs";
const cleanBase = "15f9923c24ed1f3cf82d34656eeacbfd98a0d347";
const candidateHash =
  "7a11d9c6697a9d89ffb3e762dd15185fda225bc8e39c80a212cd3729d05857f6";
const fullCandidateHash =
  "cc6a97c5797a1fa76a6bebe9be1497fe88819f1b73992b271c142ff61d3bc2f0";
const rootCause = "temporary_candidate_git_integrity_pathspec_invalid";
const strategy = "baseline_plus_overlay_manifest_integrity";
const nextAction = "action_485_full_candidate_build_rehearsal_retry";

test.setTimeout(300000);

type Action482Record = {
  dependency_materialization_decision: string;
  network_required: boolean;
  dependency_install_performed: boolean;
  lockfile_modified: boolean;
  package_manifest_modified: boolean;
};

type Action483Record = {
  rehearsal_decision: string;
  candidate_integrity_result: string;
  deployment_performed: boolean;
  preview_activated: boolean;
  environment_modified: boolean;
  network_used: boolean;
  install_performed: boolean;
  dependency_update_performed: boolean;
  cleanup_result: string;
};

type Action484Record = {
  action_483_rehearsal_result: string;
  root_cause_classification: string;
  candidate_defective: boolean;
  dependency_copy_defective: boolean;
  git_integrity_command_defective: boolean;
  git_rejected_integrity_command_syntax: boolean;
  build_or_test_command_started: boolean;
  source_mutation_occurred: boolean;
  cleanup_succeeded: boolean;
  clean_base_identifier: string;
  approved_change_candidate_hash: string;
  full_candidate_inventory_hash: string;
  changed_file_count: number;
  dependency_method: string;
  approved_integrity_strategy: string;
  source_only_integrity_phase_required: boolean;
  dependency_copy_after_source_integrity: boolean;
  node_modules_staged: boolean;
  node_modules_in_tracked_candidate_inventory: boolean;
  invalid_pathspec_retained: boolean;
  node_modules_excluded_without_pathspec_ambiguity: boolean;
  source_inventory_policy: {
    excluded_relative_paths_or_prefixes: string[];
    included_source_areas: string[];
    detects_unexpected_source_files: boolean;
    detects_missing_source_files: boolean;
    detects_deleted_baseline_files: boolean;
    detects_changed_unapproved_files: boolean;
    detects_environment_files: boolean;
    detects_secret_like_files: boolean;
    detects_merge_conflict_markers: boolean;
  };
  direct_overlay_hash_policy: {
    all_approved_overlay_files_require_exact_path: boolean;
    all_approved_overlay_files_require_exact_content_sha256: boolean;
    all_approved_overlay_files_require_exact_action_classification: boolean;
    approved_overlay_file_count: number;
  };
  unexpected_file_handling: Record<string, string | boolean>;
  dependency_policy_unchanged: boolean;
  dependency_policy: {
    method: string;
    no_install: boolean;
    no_network: boolean;
    no_update: boolean;
    no_lockfile_modification: boolean;
    known_extraneous_packages_excluded: boolean;
    known_extraneous_packages: string[];
    dependency_copy_created_only_after_source_integrity_passes: boolean;
    dependency_copy_removed_during_cleanup: boolean;
  };
  execution_order: string[];
  rehearsal_command_inventory: string[];
  runtime_projection_call_site_count_required: number;
  result_vocabulary: string[];
  approval_decision: string;
  unresolved_conditions: string[];
  deployment_authorized: boolean;
  deployment_performed: boolean;
  activation_authorized: boolean;
  preview_activated: boolean;
  environment_modified: boolean;
  production_changed: boolean;
  preview_flag_enabled: boolean;
  confidence_applied: boolean;
  feedback_created: boolean;
  recommendation_mutated: boolean;
  provider_call_executed: boolean;
  supabase_write_executed: boolean;
  persistence_created: boolean;
  replay_created: boolean;
  runtime_preview_state: string;
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

test.beforeAll(() => {
  verifierReport = JSON.parse(
    execFileSync("node", [verifierPath], {
      cwd: root,
      encoding: "utf8",
      maxBuffer: 160 * 1024 * 1024,
    }),
  ) as VerifierReport;
});

test.describe("Action 484 temporary candidate Git integrity remediation approval gate", () => {
  test("documents the static approval gate and passes verifier", () => {
    expect(existsSync(join(root, docPath))).toBe(true);
    expect(existsSync(join(root, recordPath))).toBe(true);
    expect(existsSync(join(root, verifierPath))).toBe(true);

    const doc = read(docPath);
    expect(doc).toContain(`Root-cause classification: \`${rootCause}\``);
    expect(doc).toContain(`Approved integrity strategy: \`${strategy}\``);
    expect(doc).toContain("Approval decision: `approved`");
    expect(doc).toContain(nextAction);
    expect(verifierReport.verification_status).toBe("passed");
    expect(verifierReport.failed_conditions).toEqual([]);
  });

  test("binds Action 483 failed result and exact root cause", () => {
    const action483 = readJson<Action483Record>(action483RecordPath);
    const record = readJson<Action484Record>(recordPath);

    expect(action483.rehearsal_decision).toBe("full_candidate_rehearsal_failed");
    expect(action483.candidate_integrity_result).toBe(
      "failed_git_diff_check_equivalent_setup_pathspec_for_ignored_node_modules",
    );
    expect(record.action_483_rehearsal_result).toBe("full_candidate_rehearsal_failed");
    expect(record.root_cause_classification).toBe(rootCause);
    expect(record.git_rejected_integrity_command_syntax).toBe(true);
    expect(verifierReport.checks.action483_failed_result).toBe(true);
    expect(verifierReport.checks.root_cause_and_non_failure).toBe(true);
  });

  test("keeps candidate and dependency copy classified as non-defective", () => {
    const record = readJson<Action484Record>(recordPath);

    expect(record.candidate_defective).toBe(false);
    expect(record.dependency_copy_defective).toBe(false);
    expect(record.git_integrity_command_defective).toBe(true);
    expect(record.build_or_test_command_started).toBe(false);
    expect(record.source_mutation_occurred).toBe(false);
    expect(record.cleanup_succeeded).toBe(true);
  });

  test("freezes candidate hashes and changed-file count", () => {
    const record = readJson<Action484Record>(recordPath);

    expect(record.clean_base_identifier).toBe(cleanBase);
    expect(record.approved_change_candidate_hash).toBe(candidateHash);
    expect(record.full_candidate_inventory_hash).toBe(fullCandidateHash);
    expect(record.changed_file_count).toBe(30);
    expect(verifierReport.checks.candidate_binding).toBe(true);
  });

  test("preserves Action 482 dependency policy and temporary copy method", () => {
    const action482 = readJson<Action482Record>(action482RecordPath);
    const record = readJson<Action484Record>(recordPath);

    expect(action482.dependency_materialization_decision).toBe(
      "dependency_materialization_ready_with_conditions",
    );
    expect(action482.network_required).toBe(false);
    expect(action482.dependency_install_performed).toBe(false);
    expect(action482.lockfile_modified).toBe(false);
    expect(action482.package_manifest_modified).toBe(false);
    expect(record.dependency_method).toBe("temporary_verified_node_modules_copy");
    expect(record.dependency_policy_unchanged).toBe(true);
    expect(verifierReport.checks.action482_dependency_policy).toBe(true);
  });

  test("approves source-only integrity before dependency copy with no node_modules staging", () => {
    const record = readJson<Action484Record>(recordPath);

    expect(record.approved_integrity_strategy).toBe(strategy);
    expect(record.source_only_integrity_phase_required).toBe(true);
    expect(record.dependency_copy_after_source_integrity).toBe(true);
    expect(record.node_modules_staged).toBe(false);
    expect(record.node_modules_in_tracked_candidate_inventory).toBe(false);
    expect(record.invalid_pathspec_retained).toBe(false);
    expect(record.node_modules_excluded_without_pathspec_ambiguity).toBe(true);
    expect(verifierReport.checks.approved_strategy).toBe(true);
  });

  test("freezes exact source inventory exclusions and source inclusions", () => {
    const record = readJson<Action484Record>(recordPath);

    expect(record.source_inventory_policy.excluded_relative_paths_or_prefixes).toEqual([
      ".git/",
      "node_modules/",
      ".next/",
      "coverage/",
      "test-results/",
      "playwright-report/",
      ".netlify/",
      ".env",
      ".env.",
      "*.log",
      ".DS_Store",
      ".idea/",
      ".vscode/",
    ]);
    expect(record.source_inventory_policy.included_source_areas).toContain("app");
    expect(record.source_inventory_policy.included_source_areas).toContain("components");
    expect(record.source_inventory_policy.included_source_areas).toContain("lib");
    expect(record.source_inventory_policy.included_source_areas).toContain("tests");
    expect(record.source_inventory_policy.included_source_areas).toContain("scripts");
    expect(record.source_inventory_policy.included_source_areas).toContain("package.json");
    expect(verifierReport.checks.source_inventory).toBe(true);
  });

  test("requires direct overlay hashes and protected config hashes", () => {
    const record = readJson<Action484Record>(recordPath);

    expect(record.direct_overlay_hash_policy.all_approved_overlay_files_require_exact_path).toBe(true);
    expect(record.direct_overlay_hash_policy.all_approved_overlay_files_require_exact_content_sha256).toBe(
      true,
    );
    expect(record.direct_overlay_hash_policy.all_approved_overlay_files_require_exact_action_classification).toBe(
      true,
    );
    expect(record.direct_overlay_hash_policy.approved_overlay_file_count).toBe(30);
    expect(verifierReport.checks.direct_overlay_hash_policy).toBe(true);
    expect(verifierReport.checks.package_config_hashes).toBe(true);
  });

  test("rejects unexpected drift, deletions, env files, secrets, and merge conflicts before commands", () => {
    const record = readJson<Action484Record>(recordPath);

    expect(record.source_inventory_policy.detects_unexpected_source_files).toBe(true);
    expect(record.source_inventory_policy.detects_missing_source_files).toBe(true);
    expect(record.source_inventory_policy.detects_deleted_baseline_files).toBe(true);
    expect(record.source_inventory_policy.detects_changed_unapproved_files).toBe(true);
    expect(record.source_inventory_policy.detects_environment_files).toBe(true);
    expect(record.source_inventory_policy.detects_secret_like_files).toBe(true);
    expect(record.source_inventory_policy.detects_merge_conflict_markers).toBe(true);
    expect(record.unexpected_file_handling.unexpected_source_file).toBe("abort_before_commands");
    expect(record.unexpected_file_handling.baseline_file_deleted_unexpectedly).toBe(
      "abort_before_commands",
    );
    expect(record.unexpected_file_handling.environment_file_appears).toBe("abort_before_commands");
    expect(record.unexpected_file_handling.secret_like_file_appears).toBe("abort_before_commands");
    expect(record.unexpected_file_handling.merge_conflict_marker_appears).toBe("abort_before_commands");
    expect(record.unexpected_file_handling.same_action_repair_allowed).toBe(false);
    expect(verifierReport.checks.unexpected_file_handling).toBe(true);
  });

  test("keeps dependency copy bounded and extraneous packages excluded", () => {
    const record = readJson<Action484Record>(recordPath);

    expect(record.dependency_policy.method).toBe("temporary_verified_node_modules_copy");
    expect(record.dependency_policy.no_install).toBe(true);
    expect(record.dependency_policy.no_network).toBe(true);
    expect(record.dependency_policy.no_update).toBe(true);
    expect(record.dependency_policy.no_lockfile_modification).toBe(true);
    expect(record.dependency_policy.known_extraneous_packages_excluded).toBe(true);
    expect(record.dependency_policy.known_extraneous_packages).toEqual([
      "@emnapi/core",
      "@emnapi/runtime",
      "@emnapi/wasi-threads",
      "@napi-rs/wasm-runtime",
      "@tybys/wasm-util",
    ]);
    expect(record.dependency_policy.dependency_copy_created_only_after_source_integrity_passes).toBe(true);
    expect(record.dependency_policy.dependency_copy_removed_during_cleanup).toBe(true);
    expect(verifierReport.checks.dependency_policy).toBe(true);
  });

  test("freezes serial Action 485 execution boundary and command inventory", () => {
    const record = readJson<Action484Record>(recordPath);

    expect(record.execution_order[0]).toBe("phase_1_create_temporary_source_only_candidate");
    expect(record.execution_order).toContain("phase_2_materialize_temporary_node_modules_copy");
    expect(record.execution_order).toContain("phase_3_run_build_and_tests_serially");
    expect(record.execution_order.at(-1)).toBe("phase_4_clean_temporary_candidate_and_dependencies");
    expect(record.rehearsal_command_inventory).toContain("npx next typegen");
    expect(record.rehearsal_command_inventory).toContain("npx tsc --noEmit");
    expect(record.rehearsal_command_inventory).toContain("npm run build");
    expect(record.rehearsal_command_inventory).toContain("npm run lint");
    expect(record.rehearsal_command_inventory).toContain("Action 461 preview-consumer suite");
    expect(record.rehearsal_command_inventory).toContain("Action 462 independent preview-consumer suite");
    expect(record.runtime_projection_call_site_count_required).toBe(1);
    expect(verifierReport.checks.execution_order).toBe(true);
    expect(verifierReport.checks.rehearsal_commands).toBe(true);
  });

  test("keeps deployment, activation, environment, confidence, provider, and persistence effects disabled", () => {
    const record = readJson<Action484Record>(recordPath);

    expect(record.deployment_authorized).toBe(false);
    expect(record.deployment_performed).toBe(false);
    expect(record.activation_authorized).toBe(false);
    expect(record.preview_activated).toBe(false);
    expect(record.environment_modified).toBe(false);
    expect(record.production_changed).toBe(false);
    expect(record.preview_flag_enabled).toBe(false);
    expect(record.confidence_applied).toBe(false);
    expect(record.feedback_created).toBe(false);
    expect(record.recommendation_mutated).toBe(false);
    expect(record.provider_call_executed).toBe(false);
    expect(record.supabase_write_executed).toBe(false);
    expect(record.persistence_created).toBe(false);
    expect(record.replay_created).toBe(false);
    expect(record.runtime_preview_state).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(verifierReport.checks.no_effects).toBe(true);
    expect(verifierReport.checks.runtime_state).toBe(true);
  });

  test("approves Action 485 retry with no unresolved conditions", () => {
    const record = readJson<Action484Record>(recordPath);

    expect(record.result_vocabulary).toEqual(["approved", "approved_with_conditions", "blocked"]);
    expect(record.approval_decision).toBe("approved");
    expect(record.unresolved_conditions).toEqual([]);
    expect(record.next_action).toBe(nextAction);
    expect(verifierReport.checks.approval_decision).toBe(true);
  });
});
