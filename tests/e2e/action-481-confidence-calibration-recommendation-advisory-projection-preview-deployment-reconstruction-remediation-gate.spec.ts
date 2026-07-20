import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join, resolve } from "path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const docPath =
  "docs/action-481-confidence-calibration-recommendation-advisory-projection-preview-deployment-reconstruction-remediation-gate.md";
const recordPath =
  "docs/action-481-confidence-calibration-recommendation-advisory-projection-preview-deployment-reconstruction-remediation-approval-record.json";
const action480RecordPath =
  "docs/action-480-confidence-calibration-recommendation-advisory-projection-preview-deployment-retry-execution-record.json";
const verifierPath =
  "scripts/action-481-confidence-calibration-recommendation-advisory-projection-preview-deployment-reconstruction-remediation-gate-verify.mjs";
const cleanBase = "15f9923c24ed1f3cf82d34656eeacbfd98a0d347";
const candidateHash =
  "7a11d9c6697a9d89ffb3e762dd15185fda225bc8e39c80a212cd3729d05857f6";
const fullCandidateHash =
  "cc6a97c5797a1fa76a6bebe9be1497fe88819f1b73992b271c142ff61d3bc2f0";
const nextAction = "action_482_dependency_materialization_completion_gate";
const nextAfterCondition = "action_482_full_candidate_build_rehearsal";

test.setTimeout(300000);

type Action480Record = {
  deployment_result: string;
  deployment_attempt_count: number;
  candidate_reconstruction_result: string;
  netlify_cli_invoked: boolean;
  netlify_api_invoked: boolean;
  preview_activated: boolean;
  production_deployment_changed: boolean;
};

type Action481Record = {
  clean_base_identifier: string;
  approved_change_candidate_hash: string;
  full_candidate_inventory_hash: string;
  candidate_file_count: number;
  candidate_reconstruction_policy: Record<string, string | boolean>;
  dependency_materialization_policy: Record<string, string | boolean>;
  package_lockfile_config_hash_policy: Record<string, string | boolean>;
  temporary_path_policy: Record<string, string | boolean>;
  rehearsal_command_inventory: string[];
  serial_execution_required: boolean;
  same_action_repair_run_authorized: boolean;
  result_vocabulary: string[];
  approval_vocabulary: string[];
  bounded_evidence_policy: Record<string, boolean>;
  cleanup_policy: Record<string, boolean>;
  network_step_authorized: boolean;
  deployment_authorized: boolean;
  activation_authorized: boolean;
  environment_modification_authorized: boolean;
  preview_flag_required_state: string;
  preview_flag_enabled: boolean;
  production_changed: boolean;
  environment_modified: boolean;
  confidence_applied: boolean;
  feedback_created: boolean;
  recommendation_mutated: boolean;
  ranking_changed: boolean;
  scanner_changed: boolean;
  publication_changed: boolean;
  execution_changed: boolean;
  add_trade_changed: boolean;
  risk_sizing_changed: boolean;
  provider_call_executed: boolean;
  supabase_access_created: boolean;
  supabase_write_executed: boolean;
  persistence_created: boolean;
  replay_created: boolean;
  approval_decision: string;
  approval_conditions: string[];
  blocked_conditions: string[];
  next_action: string;
  next_action_if_dependency_condition_completed: string;
  runtime_preview_state: string;
  runtime_preview_active_observation_only_authorized: boolean;
};

type VerifierReport = {
  verification_status: string;
  failed_conditions: string[];
  checks: Record<string, boolean>;
  approval_decision: string;
  dependency_method: string;
  dependency_method_status: string;
  next_action: string;
  next_action_if_dependency_condition_completed: string;
};

let verifierReport: VerifierReport;

function read(relativePath: string): string {
  return readFileSync(join(root, relativePath), "utf8");
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(read(relativePath)) as T;
}

function approvalForDependencyState(input: {
  localReuseProven: boolean;
  boundedNetworkInstallApproved: boolean;
  lockfileDriftRequired: boolean;
  dependencyUpgradeRequired: boolean;
  broadDirtyWorktreeRequired: boolean;
  secretsRequired: boolean;
}): "approved" | "approved_with_conditions" | "blocked" {
  if (
    input.lockfileDriftRequired ||
    input.dependencyUpgradeRequired ||
    input.broadDirtyWorktreeRequired ||
    input.secretsRequired
  ) {
    return "blocked";
  }
  if (input.localReuseProven || input.boundedNetworkInstallApproved) return "approved";
  return "approved_with_conditions";
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

test.describe("Action 481 reconstruction remediation approval gate", () => {
  test("documents the static gate and passes local verifier", () => {
    expect(existsSync(join(root, docPath))).toBe(true);
    expect(existsSync(join(root, recordPath))).toBe(true);
    expect(existsSync(join(root, verifierPath))).toBe(true);

    const doc = read(docPath);
    expect(doc).toContain("Action 480 aborted before creating a temporary candidate or invoking Netlify");
    expect(doc).toContain("Decision: `approved_with_conditions`");
    expect(doc).toContain(nextAction);
    expect(doc).toContain(nextAfterCondition);
    expect(verifierReport.verification_status).toBe("passed");
    expect(verifierReport.failed_conditions).toEqual([]);
  });

  test("binds Action 480 aborted deployment result", () => {
    const action480 = readJson<Action480Record>(action480RecordPath);

    expect(action480.deployment_result).toBe("deployment_aborted");
    expect(action480.deployment_attempt_count).toBe(0);
    expect(action480.candidate_reconstruction_result).toBe(
      "deployment_aborted_before_temp_candidate_creation",
    );
    expect(action480.netlify_cli_invoked).toBe(false);
    expect(action480.netlify_api_invoked).toBe(false);
    expect(action480.preview_activated).toBe(false);
    expect(action480.production_deployment_changed).toBe(false);
    expect(verifierReport.checks.action480_abort).toBe(true);
  });

  test("freezes candidate identifiers and excludes dirty worktree source", () => {
    const record = readJson<Action481Record>(recordPath);

    expect(record.clean_base_identifier).toBe(cleanBase);
    expect(record.approved_change_candidate_hash).toBe(candidateHash);
    expect(record.full_candidate_inventory_hash).toBe(fullCandidateHash);
    expect(record.candidate_file_count).toBe(30);
    expect(record.candidate_reconstruction_policy.broad_dirty_worktree_copy_authorized).toBe(false);
    expect(record.candidate_reconstruction_policy.include_env_files).toBe(false);
    expect(record.candidate_reconstruction_policy.include_credentials).toBe(false);
    expect(record.candidate_reconstruction_policy.include_netlify_directory).toBe(false);
    expect(verifierReport.checks.candidate_binding).toBe(true);
  });

  test("approves local dependency reuse only as a future proven policy", () => {
    const record = readJson<Action481Record>(recordPath);
    const policy = record.dependency_materialization_policy;

    expect(policy.preferred_method).toBe("immutable_local_dependency_reuse");
    expect(policy.preferred_method_status).toBe(
      "approved_but_requires_future_isolated_candidate_proof",
    );
    expect(policy.dependency_tree_mutation_authorized).toBe(false);
    expect(policy.dependency_upgrade_authorized).toBe(false);
    expect(policy.lockfile_rewrite_authorized).toBe(false);
    expect(policy.arbitrary_package_install_authorized).toBe(false);
    expect(verifierReport.checks.dependency_policy).toBe(true);
  });

  test("keeps frozen-lockfile install as separately approved alternative only", () => {
    const record = readJson<Action481Record>(recordPath);

    expect(record.dependency_materialization_policy.fallback_method).toBe(
      "frozen_lockfile_install_requires_separate_bounded_network_approval",
    );
    expect(record.network_step_authorized).toBe(false);
    expect(verifierReport.checks.frozen_install_alternative).toBe(true);
  });

  test("rejects lockfile drift, dependency upgrades, broad dirty source, and secrets", () => {
    expect(
      approvalForDependencyState({
        localReuseProven: true,
        boundedNetworkInstallApproved: false,
        lockfileDriftRequired: true,
        dependencyUpgradeRequired: false,
        broadDirtyWorktreeRequired: false,
        secretsRequired: false,
      }),
    ).toBe("blocked");
    expect(
      approvalForDependencyState({
        localReuseProven: true,
        boundedNetworkInstallApproved: false,
        lockfileDriftRequired: false,
        dependencyUpgradeRequired: true,
        broadDirtyWorktreeRequired: false,
        secretsRequired: false,
      }),
    ).toBe("blocked");
    expect(
      approvalForDependencyState({
        localReuseProven: true,
        boundedNetworkInstallApproved: false,
        lockfileDriftRequired: false,
        dependencyUpgradeRequired: false,
        broadDirtyWorktreeRequired: true,
        secretsRequired: false,
      }),
    ).toBe("blocked");
    expect(
      approvalForDependencyState({
        localReuseProven: false,
        boundedNetworkInstallApproved: false,
        lockfileDriftRequired: false,
        dependencyUpgradeRequired: false,
        broadDirtyWorktreeRequired: false,
        secretsRequired: true,
      }),
    ).toBe("blocked");
  });

  test("freezes package, lockfile, build config, and Netlify hashes", () => {
    const record = readJson<Action481Record>(recordPath);
    const hashes = record.package_lockfile_config_hash_policy;

    expect(hashes.package_json).toBe("7ff6ae8890b52d4879ce88248c22f152fffab327e8a5ef3a92eccccad217ef58");
    expect(hashes.package_lock_json).toBe(
      "859f498ee4d7d64259ad07d6117e25e284a29bd7d7169126100564fe90943657",
    );
    expect(hashes.next_config_ts).toBe("614bce25b089c3f19b1e17a6346c74b858034040154c6621e7d35303004767cc");
    expect(hashes.tsconfig_json).toBe("83b460dca7c269a562dba8f46d08de45397869b7ddbf31101eabca1a975eaa82");
    expect(hashes.eslint_config_mjs).toBe(
      "53065bd014f2b6fb89dc5f1a84cd37053217cbec71be6f15c3958a3b3bc4143c",
    );
    expect(hashes.netlify_toml).toBe("7cc579b1e99306abc9f21c0340c5b7e94309567d7b86e2757ba996d2b414b1b7");
    expect(hashes.lockfile_drift_rejected).toBe(true);
    expect(hashes.package_version_drift_rejected).toBe(true);
    expect(verifierReport.checks.manifest_hash_policy).toBe(true);
  });

  test("requires a unique safe temporary path for Action 482", () => {
    const record = readJson<Action481Record>(recordPath);
    const policy = record.temporary_path_policy;

    expect(String(policy.path_template)).toContain(
      "action-482-confidence-calibration-projection-preview-full-candidate-rehearsal",
    );
    expect(policy.must_be_outside_active_repository).toBe(true);
    expect(policy.must_be_outside_home_config).toBe(true);
    expect(policy.must_be_absent_or_empty_before_use).toBe(true);
    expect(policy.symlink_target_allowed).toBe(false);
    expect(policy.parent_chain_symlink_allowed).toBe(false);
    expect(policy.path_traversal_allowed).toBe(false);
    expect(policy.serial_exclusive_ownership_required).toBe(true);
    expect(policy.reuse_action_466_or_467_paths_allowed).toBe(false);
    expect(verifierReport.checks.temporary_path_policy).toBe(true);
  });

  test("freezes serial rehearsal commands and result vocabulary", () => {
    const record = readJson<Action481Record>(recordPath);

    expect(record.rehearsal_command_inventory).toContain("npx next typegen");
    expect(record.rehearsal_command_inventory).toContain("npx tsc --noEmit");
    expect(record.rehearsal_command_inventory).toContain("npm run build");
    expect(record.rehearsal_command_inventory).toContain("npm run lint");
    expect(record.rehearsal_command_inventory).toContain(
      "runtime_facing_projection_call_site_count_equals_1",
    );
    expect(record.serial_execution_required).toBe(true);
    expect(record.same_action_repair_run_authorized).toBe(false);
    expect(record.result_vocabulary).toEqual([
      "full_candidate_rehearsal_passed",
      "full_candidate_rehearsal_failed",
      "full_candidate_rehearsal_aborted",
    ]);
    expect(record.approval_vocabulary).toEqual(["approved", "approved_with_conditions", "blocked"]);
    expect(verifierReport.checks.rehearsal_commands).toBe(true);
    expect(verifierReport.checks.vocabulary).toBe(true);
  });

  test("keeps evidence bounded and cleanup mandatory", () => {
    const record = readJson<Action481Record>(recordPath);

    expect(record.bounded_evidence_policy.base_identifier_permitted).toBe(true);
    expect(record.bounded_evidence_policy.source_contents_permitted).toBe(false);
    expect(record.bounded_evidence_policy.dependency_contents_permitted).toBe(false);
    expect(record.bounded_evidence_policy.environment_values_permitted).toBe(false);
    expect(record.bounded_evidence_policy.credential_values_permitted).toBe(false);
    expect(record.bounded_evidence_policy.recommendation_data_permitted).toBe(false);
    expect(record.cleanup_policy.remove_temporary_candidate).toBe(true);
    expect(record.cleanup_policy.remove_copied_temporary_dependency_tree).toBe(true);
    expect(record.cleanup_policy.retain_build_output_in_repository).toBe(false);
    expect(record.cleanup_policy.cleanup_failure_blocks_readiness).toBe(true);
    expect(verifierReport.checks.bounded_evidence).toBe(true);
    expect(verifierReport.checks.cleanup).toBe(true);
  });

  test("keeps deployment, activation, environment, and runtime effects disabled", () => {
    const record = readJson<Action481Record>(recordPath);

    expect(record.deployment_authorized).toBe(false);
    expect(record.activation_authorized).toBe(false);
    expect(record.environment_modification_authorized).toBe(false);
    expect(record.preview_flag_required_state).toBe("absent_or_disabled");
    expect(record.preview_flag_enabled).toBe(false);
    expect(record.production_changed).toBe(false);
    expect(record.environment_modified).toBe(false);
    expect(record.confidence_applied).toBe(false);
    expect(record.feedback_created).toBe(false);
    expect(record.recommendation_mutated).toBe(false);
    expect(record.ranking_changed).toBe(false);
    expect(record.scanner_changed).toBe(false);
    expect(record.publication_changed).toBe(false);
    expect(record.execution_changed).toBe(false);
    expect(record.add_trade_changed).toBe(false);
    expect(record.risk_sizing_changed).toBe(false);
    expect(record.provider_call_executed).toBe(false);
    expect(record.supabase_write_executed).toBe(false);
    expect(record.persistence_created).toBe(false);
    expect(record.replay_created).toBe(false);
    expect(record.runtime_preview_state).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(record.runtime_preview_active_observation_only_authorized).toBe(false);
    expect(verifierReport.checks.no_effects).toBe(true);
  });

  test("returns approved with conditions and routes to dependency completion gate", () => {
    const record = readJson<Action481Record>(recordPath);

    expect(record.approval_decision).toBe("approved_with_conditions");
    expect(record.approval_conditions).toContain(
      "prove_immutable_local_dependency_reuse_inside_the_isolated_candidate_or_obtain_separate_bounded_frozen_lockfile_install_approval",
    );
    expect(record.next_action).toBe(nextAction);
    expect(record.next_action_if_dependency_condition_completed).toBe(nextAfterCondition);
    expect(verifierReport.approval_decision).toBe("approved_with_conditions");
    expect(verifierReport.next_action).toBe(nextAction);
  });
});
