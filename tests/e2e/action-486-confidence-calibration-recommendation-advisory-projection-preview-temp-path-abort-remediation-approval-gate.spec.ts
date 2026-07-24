import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import path, { join, resolve } from "path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const docPath =
  "docs/action-486-confidence-calibration-recommendation-advisory-projection-preview-temp-path-abort-remediation-approval-gate.md";
const recordPath =
  "docs/action-486-confidence-calibration-recommendation-advisory-projection-preview-temp-path-abort-remediation-approval-record.json";
const action485RecordPath =
  "docs/action-485-confidence-calibration-recommendation-advisory-projection-preview-full-candidate-build-rehearsal-retry-record.json";
const action484RecordPath =
  "docs/action-484-confidence-calibration-recommendation-advisory-projection-preview-temporary-candidate-git-integrity-remediation-approval-record.json";
const verifierPath =
  "scripts/action-486-confidence-calibration-recommendation-advisory-projection-preview-temp-path-abort-remediation-approval-gate-verify.mjs";
const rootCause = "temporary_candidate_realpath_comparison_used_noncanonical_prefix_boundary";
const nextAction = "action_487_full_candidate_build_rehearsal_retry_after_temp_path_remediation";

test.setTimeout(300000);

type Action486Record = {
  action_485_result: string;
  action_485_abort_reason: string;
  action_485_failure_reason: string;
  root_cause_classification: string;
  candidate_defective: boolean;
  command_count: number;
  source_candidate_created: boolean;
  dependency_copy_created: boolean;
  canonicalization_policy: Record<string, boolean | string>;
  containment_policy: Record<string, boolean | string>;
  action_specific_location: Record<string, boolean | number | string>;
  symlink_policy: Record<string, boolean>;
  forbidden_root_policy: {
    canonicalize_all_forbidden_roots: boolean;
    forbidden_roots: string[];
    candidate_must_not_equal_or_be_inside_forbidden_root: boolean;
  };
  creation_sequence: string[];
  cleanup_sequence: string[];
  test_matrix: { accepted: string[]; rejected: string[] };
  rehearsal_policy_unchanged: boolean;
  rehearsal_performed: boolean;
  deployment_authorized: boolean;
  deployment_performed: boolean;
  activation_authorized: boolean;
  preview_activated: boolean;
  preview_flag_enabled: boolean;
  network_used: boolean;
  install_performed: boolean;
  provider_call_executed: boolean;
  supabase_write_executed: boolean;
  persistence_created: boolean;
  replay_created: boolean;
  confidence_applied: boolean;
  feedback_created: boolean;
  downstream_behavior_changed: boolean;
  scanner_changed: boolean;
  ranking_changed: boolean;
  approval_decision: string;
  unresolved_conditions: string[];
  next_action: string;
  current_runtime_preview_state: string;
};

type Action485Record = {
  rehearsal_decision: string;
  abort_reason: string;
  safe_temp_path_failure_reason: string;
  command_results: unknown[];
  source_candidate_constructed: boolean;
  dependency_copy_created: boolean;
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

function isContained(canonicalRoot: string, candidate: string): boolean {
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

test.describe("Action 486 temp path abort remediation approval gate", () => {
  test("documents approval gate and passes verifier", () => {
    expect(existsSync(join(root, docPath))).toBe(true);
    expect(existsSync(join(root, recordPath))).toBe(true);
    expect(existsSync(join(root, verifierPath))).toBe(true);

    const doc = read(docPath);
    expect(doc).toContain("Action 486 is a static approval gate");
    expect(doc).toContain(rootCause);
    expect(doc).toContain("The approval decision is `approved`");
    expect(doc).toContain(nextAction);
    expect(verifierReport.verification_status).toBe("passed");
    expect(verifierReport.failed_conditions).toEqual([]);
  });

  test("binds Action 485 aborted result and exact failure reason", () => {
    const action485 = readJson<Action485Record>(action485RecordPath);
    const record = readJson<Action486Record>(recordPath);

    expect(action485.rehearsal_decision).toBe("full_candidate_rehearsal_aborted");
    expect(action485.abort_reason).toBe("unsafe_temp_path");
    expect(action485.safe_temp_path_failure_reason).toBe("temporary_path_realpath_prefix_mismatch");
    expect(action485.command_results).toEqual([]);
    expect(action485.source_candidate_constructed).toBe(false);
    expect(action485.dependency_copy_created).toBe(false);
    expect(record.action_485_result).toBe("full_candidate_rehearsal_aborted");
    expect(record.action_485_failure_reason).toBe("temporary_path_realpath_prefix_mismatch");
    expect(record.command_count).toBe(0);
    expect(verifierReport.checks.action485_aborted_result).toBe(true);
  });

  test("freezes root-cause classification without blaming the candidate", () => {
    const record = readJson<Action486Record>(recordPath);

    expect(record.root_cause_classification).toBe(rootCause);
    expect(record.candidate_defective).toBe(false);
    expect(record.source_candidate_created).toBe(false);
    expect(record.dependency_copy_created).toBe(false);
    expect(verifierReport.checks.record_root_cause).toBe(true);
  });

  test("requires canonical temp-root policy and macOS alias handling", () => {
    const record = readJson<Action486Record>(recordPath);
    const policy = record.canonicalization_policy;

    expect(policy.trusted_temp_root_source).toBe("runtime_platform_api");
    expect(policy.canonical_temp_root_required).toBe(true);
    expect(policy.canonical_candidate_parent_required).toBe(true);
    expect(policy.canonical_candidate_after_creation_required).toBe(true);
    expect(policy.compare_only_canonical_absolute_paths).toBe(true);
    expect(policy.macos_var_private_var_alias_supported).toBe(true);
    expect(policy.string_prefix_only_allowed).toBe(false);
    expect(verifierReport.checks.canonicalization_policy).toBe(true);
  });

  test("uses path.relative containment and rejects prefix confusion", () => {
    const canonicalRoot = "/private/var/folders/safe/T";
    const accepted = "/private/var/folders/safe/T/ture/action-487-confidence-calibration-projection-preview-full-candidate-rehearsal";
    const siblingPrefix = "/private/var/folders/safe/T-evil/ture/action-487-confidence-calibration-projection-preview-full-candidate-rehearsal";
    const tmpSiblingPrefix = "/tmp/ture-action-487-evil";

    expect(isContained(canonicalRoot, accepted)).toBe(true);
    expect(isContained(canonicalRoot, canonicalRoot)).toBe(false);
    expect(isContained(canonicalRoot, siblingPrefix)).toBe(false);
    expect(isContained("/tmp/ture-action-487", tmpSiblingPrefix)).toBe(false);
  });

  test("rejects traversal, absolute escape, repository, HOME/config, app-data, and source-node_modules paths", () => {
    const record = readJson<Action486Record>(recordPath);
    const rejected = record.test_matrix.rejected;

    expect(rejected).toContain("dotdot_traversal");
    expect(rejected).toContain("absolute_escape");
    expect(rejected).toContain("repository_path");
    expect(rejected).toContain("home_path");
    expect(rejected).toContain("config_path");
    expect(rejected).toContain("application_data_path");
    expect(rejected).toContain("source_node_modules_path");
    expect(record.forbidden_root_policy.canonicalize_all_forbidden_roots).toBe(true);
    expect(record.forbidden_root_policy.forbidden_roots).toContain("source_node_modules");
    expect(verifierReport.checks.forbidden_roots).toBe(true);
  });

  test("requires symlink rejection for target, dangling, and parent-chain symlinks", () => {
    const record = readJson<Action486Record>(recordPath);

    expect(record.symlink_policy.reject_target_symlink).toBe(true);
    expect(record.symlink_policy.reject_dangling_target_symlink).toBe(true);
    expect(record.symlink_policy.reject_parent_chain_symlink_inside_action_subtree).toBe(true);
    expect(record.symlink_policy.reject_symlink_resolving_outside_temp_root).toBe(true);
    expect(record.symlink_policy.platform_defined_temp_root_alias_not_user_symlink_when_canonicalized).toBe(true);
    expect(record.test_matrix.rejected).toContain("target_symlink");
    expect(record.test_matrix.rejected).toContain("nested_parent_symlink");
    expect(verifierReport.checks.symlink_policy).toBe(true);
  });

  test("requires exact Action-specific path and no caller path override", () => {
    const record = readJson<Action486Record>(recordPath);

    expect(record.action_specific_location.action).toBe(487);
    expect(record.action_specific_location.template).toContain(
      "ture/action-487-confidence-calibration-projection-preview-full-candidate-rehearsal",
    );
    expect(record.action_specific_location.caller_supplied_path_allowed).toBe(false);
    expect(record.action_specific_location.cli_path_argument_allowed).toBe(false);
    expect(record.action_specific_location.environment_override_allowed).toBe(false);
    expect(record.action_specific_location.stdin_path_allowed).toBe(false);
    expect(record.action_specific_location.reuse_prior_action_path_allowed).toBe(false);
    expect(record.test_matrix.rejected).toContain("wrong_action_number_or_path");
    expect(record.test_matrix.rejected).toContain("caller_controlled_path_override");
    expect(verifierReport.checks.action_specific_path_policy).toBe(true);
  });

  test("accepts only absent and empty safe target states before construction", () => {
    const record = readJson<Action486Record>(recordPath);

    expect(record.test_matrix.accepted).toContain("absent_target");
    expect(record.test_matrix.accepted).toContain("empty_safe_target");
    expect(record.test_matrix.rejected).toContain("non_empty_target");
    expect(record.creation_sequence).toContain("require_target_absent_or_empty");
    expect(record.creation_sequence).toContain("begin_source_construction_only_after_all_checks_pass");
  });

  test("bounds cleanup to the exact canonical subtree", () => {
    const record = readJson<Action486Record>(recordPath);

    expect(record.cleanup_sequence).toContain("remove_only_exact_canonical_action_specific_subtree");
    expect(record.cleanup_sequence).toContain("repeat_canonical_containment_check_before_deletion");
    expect(record.cleanup_sequence).toContain("repeat_action_specific_suffix_identity_check_before_deletion");
    expect(record.cleanup_sequence).toContain("cleanup_idempotent_and_bounded");
    expect(record.test_matrix.rejected).toContain("cleanup_target_outside_approved_subtree");
    expect(verifierReport.checks.creation_and_cleanup).toBe(true);
  });

  test("preserves rehearsal policy and delegates execution to Action 487", () => {
    const record = readJson<Action486Record>(recordPath);

    expect(record.rehearsal_policy_unchanged).toBe(true);
    expect(record.rehearsal_performed).toBe(false);
    expect(record.network_used).toBe(false);
    expect(record.install_performed).toBe(false);
    expect(record.approval_decision).toBe("approved");
    expect(record.unresolved_conditions).toEqual([]);
    expect(record.next_action).toBe(nextAction);
    expect(verifierReport.checks.rehearsal_policy).toBe(true);
    expect(verifierReport.checks.approval_and_next_action).toBe(true);
  });

  test("authorizes no deployment, activation, preview enablement, or runtime effects", () => {
    const record = readJson<Action486Record>(recordPath);

    expect(record.deployment_authorized).toBe(false);
    expect(record.deployment_performed).toBe(false);
    expect(record.activation_authorized).toBe(false);
    expect(record.preview_activated).toBe(false);
    expect(record.preview_flag_enabled).toBe(false);
    expect(record.provider_call_executed).toBe(false);
    expect(record.supabase_write_executed).toBe(false);
    expect(record.persistence_created).toBe(false);
    expect(record.replay_created).toBe(false);
    expect(record.confidence_applied).toBe(false);
    expect(record.feedback_created).toBe(false);
    expect(record.downstream_behavior_changed).toBe(false);
    expect(record.scanner_changed).toBe(false);
    expect(record.ranking_changed).toBe(false);
    expect(record.current_runtime_preview_state).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(verifierReport.checks.no_effects).toBe(true);
    expect(verifierReport.checks.runtime_state).toBe(true);
  });

  test("keeps Actions 484 and 485 healthy", () => {
    const action484 = readJson<{ approval_decision: string; deployment_performed: boolean; preview_activated: boolean }>(
      action484RecordPath,
    );
    const action485 = readJson<Action485Record>(action485RecordPath);

    expect(action484.approval_decision).toBe("approved");
    expect(action484.deployment_performed).toBe(false);
    expect(action484.preview_activated).toBe(false);
    expect(action485.rehearsal_decision).toBe("full_candidate_rehearsal_aborted");
    expect(verifierReport.checks.action484_remains_approved).toBe(true);
    expect(verifierReport.checks.action485_aborted_result).toBe(true);
  });
});
