import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join, resolve } from "path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const docPath =
  "docs/action-482-confidence-calibration-recommendation-advisory-projection-preview-dependency-materialization-completion-gate.md";
const recordPath =
  "docs/action-482-confidence-calibration-recommendation-advisory-projection-preview-dependency-materialization-record.json";
const action481RecordPath =
  "docs/action-481-confidence-calibration-recommendation-advisory-projection-preview-deployment-reconstruction-remediation-approval-record.json";
const verifierPath =
  "scripts/action-482-confidence-calibration-recommendation-advisory-projection-preview-dependency-materialization-completion-gate-verify.mjs";
const cleanBase = "15f9923c24ed1f3cf82d34656eeacbfd98a0d347";
const candidateHash =
  "7a11d9c6697a9d89ffb3e762dd15185fda225bc8e39c80a212cd3729d05857f6";
const fullCandidateHash =
  "cc6a97c5797a1fa76a6bebe9be1497fe88819f1b73992b271c142ff61d3bc2f0";
const nextAction = "action_483_full_candidate_build_rehearsal_with_bounded_dependency_materialization";

test.setTimeout(300000);

type Action481Record = {
  approval_decision: string;
  next_action: string;
  deployment_authorized: boolean;
  activation_authorized: boolean;
  network_step_authorized: boolean;
};

type Action482Record = {
  clean_base_identifier: string;
  approved_change_candidate_hash: string;
  full_candidate_inventory_hash: string;
  candidate_file_count: number;
  package_json_hash: string;
  package_lock_hash: string;
  next_config_hash: string;
  typescript_config_hash: string;
  eslint_config_hash: string;
  netlify_config_hash: string;
  package_manifest_unchanged: boolean;
  package_lock_unchanged: boolean;
  configuration_hashes_unchanged: boolean;
  local_dependency_tree_present: boolean;
  required_local_binaries_present: boolean;
  required_local_binaries: Record<string, boolean>;
  top_level_dependency_count: number;
  top_level_dependencies_missing_from_lockfile_count: number;
  top_level_dependency_check_result: string;
  npm_ls_depth_0_exit_code: number;
  npm_ls_depth_0_problem_count: number;
  npm_ls_depth_0_extraneous_problem_count: number;
  network_required: boolean;
  dependency_install_performed: boolean;
  dependency_update_performed: boolean;
  lockfile_modified: boolean;
  package_manifest_modified: boolean;
  install_lifecycle_triggered: boolean;
  registry_access_performed: boolean;
  dependency_contents_recorded: boolean;
  dependency_paths_recorded: boolean;
  absolute_machine_paths_recorded: boolean;
  credential_value_recorded: boolean;
  environment_value_recorded: boolean;
  registry_token_recorded: boolean;
  dependency_materialization_method: string;
  preferred_dependency_materialization_method: string;
  dependency_source_classification: string;
  dependency_boundary_read_only: boolean;
  dependency_boundary_read_only_status: string;
  temporary_dependency_copy_required: boolean;
  temporary_dependency_copy_allowed_if_read_only_link_not_practical: boolean;
  candidate_inventory_includes_dependencies: boolean;
  node_modules_tracked: boolean;
  temporary_path_policy: Record<string, string | boolean>;
  source_mutation_protection: Record<string, boolean>;
  cleanup_policy: Record<string, boolean>;
  decision_vocabulary: string[];
  overall_readiness_vocabulary: string[];
  dependency_materialization_decision: string;
  overall_readiness: string;
  unresolved_conditions: string[];
  invalid_conditions: string[];
  network_step_authorized: boolean;
  deployment_performed: boolean;
  netlify_operation_performed: boolean;
  preview_activated: boolean;
  environment_modified: boolean;
  preview_flag_required_state: string;
  preview_flag_enabled: boolean;
  production_changed: boolean;
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
  runtime_preview_state: string;
  next_action: string;
};

type VerifierReport = {
  verification_status: string;
  failed_conditions: string[];
  checks: Record<string, boolean>;
  dependency_materialization_decision: string;
  overall_readiness: string;
  next_action: string;
};

let verifierReport: VerifierReport;

function read(relativePath: string): string {
  return readFileSync(join(root, relativePath), "utf8");
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(read(relativePath)) as T;
}

function dependencyDecisionFor(input: {
  dependenciesPresent: boolean;
  hashesMatch: boolean;
  networkRequired: boolean;
  upgradeRequired: boolean;
  lockfileMutationRequired: boolean;
  cleanupGuaranteed: boolean;
  readOnlyOrCopyChosen: boolean;
}): "dependency_materialization_ready" | "dependency_materialization_ready_with_conditions" | "dependency_materialization_blocked" {
  if (
    !input.dependenciesPresent ||
    !input.hashesMatch ||
    input.networkRequired ||
    input.upgradeRequired ||
    input.lockfileMutationRequired ||
    !input.cleanupGuaranteed
  ) {
    return "dependency_materialization_blocked";
  }
  return input.readOnlyOrCopyChosen
    ? "dependency_materialization_ready"
    : "dependency_materialization_ready_with_conditions";
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

test.describe("Action 482 dependency materialization completion gate", () => {
  test("documents the dependency-only gate and passes verifier", () => {
    expect(existsSync(join(root, docPath))).toBe(true);
    expect(existsSync(join(root, recordPath))).toBe(true);
    expect(existsSync(join(root, verifierPath))).toBe(true);

    const doc = read(docPath);
    expect(doc).toContain("Action 482 verifies whether the current local dependency installation");
    expect(doc).toContain("Dependency decision: `dependency_materialization_ready_with_conditions`");
    expect(doc).toContain(nextAction);
    expect(verifierReport.verification_status).toBe("passed");
    expect(verifierReport.failed_conditions).toEqual([]);
  });

  test("binds Action 481 approval and candidate hashes", () => {
    const action481 = readJson<Action481Record>(action481RecordPath);
    const record = readJson<Action482Record>(recordPath);

    expect(action481.approval_decision).toBe("approved_with_conditions");
    expect(action481.next_action).toBe("action_482_dependency_materialization_completion_gate");
    expect(action481.deployment_authorized).toBe(false);
    expect(action481.activation_authorized).toBe(false);
    expect(action481.network_step_authorized).toBe(false);
    expect(record.clean_base_identifier).toBe(cleanBase);
    expect(record.approved_change_candidate_hash).toBe(candidateHash);
    expect(record.full_candidate_inventory_hash).toBe(fullCandidateHash);
    expect(record.candidate_file_count).toBe(30);
    expect(verifierReport.checks.action481_approval).toBe(true);
    expect(verifierReport.checks.candidate_binding).toBe(true);
  });

  test("freezes package, lockfile, config hashes and source non-mutation", () => {
    const record = readJson<Action482Record>(recordPath);

    expect(record.package_json_hash).toBe("7ff6ae8890b52d4879ce88248c22f152fffab327e8a5ef3a92eccccad217ef58");
    expect(record.package_lock_hash).toBe("859f498ee4d7d64259ad07d6117e25e284a29bd7d7169126100564fe90943657");
    expect(record.next_config_hash).toBe("614bce25b089c3f19b1e17a6346c74b858034040154c6621e7d35303004767cc");
    expect(record.typescript_config_hash).toBe(
      "83b460dca7c269a562dba8f46d08de45397869b7ddbf31101eabca1a975eaa82",
    );
    expect(record.eslint_config_hash).toBe(
      "53065bd014f2b6fb89dc5f1a84cd37053217cbec71be6f15c3958a3b3bc4143c",
    );
    expect(record.netlify_config_hash).toBe("7cc579b1e99306abc9f21c0340c5b7e94309567d7b86e2757ba996d2b414b1b7");
    expect(record.package_manifest_unchanged).toBe(true);
    expect(record.package_lock_unchanged).toBe(true);
    expect(record.configuration_hashes_unchanged).toBe(true);
    expect(record.source_mutation_protection.before_after_hashes_match).toBe(true);
    expect(verifierReport.checks.package_config_hashes).toBe(true);
  });

  test("verifies local node_modules and required binaries", () => {
    const record = readJson<Action482Record>(recordPath);

    expect(record.local_dependency_tree_present).toBe(true);
    expect(record.required_local_binaries_present).toBe(true);
    expect(record.required_local_binaries.next).toBe(true);
    expect(record.required_local_binaries.typescript).toBe(true);
    expect(record.required_local_binaries.eslint).toBe(true);
    expect(record.required_local_binaries.playwright).toBe(true);
    expect(verifierReport.checks.local_dependency_presence).toBe(true);
  });

  test("records top-level compatibility without dependency contents", () => {
    const record = readJson<Action482Record>(recordPath);

    expect(record.top_level_dependency_count).toBe(15);
    expect(record.top_level_dependencies_missing_from_lockfile_count).toBe(0);
    expect(record.npm_ls_depth_0_exit_code).toBe(0);
    expect(record.npm_ls_depth_0_problem_count).toBe(5);
    expect(record.npm_ls_depth_0_extraneous_problem_count).toBe(5);
    expect(record.top_level_dependency_check_result).toBe(
      "required_top_level_dependencies_present_npm_ls_reported_extraneous_local_packages",
    );
    expect(record.dependency_contents_recorded).toBe(false);
    expect(record.dependency_paths_recorded).toBe(false);
    expect(record.absolute_machine_paths_recorded).toBe(false);
    expect(verifierReport.checks.top_level_compatibility).toBe(true);
  });

  test("blocks missing dependencies, mismatches, network, upgrades, and mutation", () => {
    expect(
      dependencyDecisionFor({
        dependenciesPresent: false,
        hashesMatch: true,
        networkRequired: false,
        upgradeRequired: false,
        lockfileMutationRequired: false,
        cleanupGuaranteed: true,
        readOnlyOrCopyChosen: true,
      }),
    ).toBe("dependency_materialization_blocked");
    expect(
      dependencyDecisionFor({
        dependenciesPresent: true,
        hashesMatch: false,
        networkRequired: false,
        upgradeRequired: false,
        lockfileMutationRequired: false,
        cleanupGuaranteed: true,
        readOnlyOrCopyChosen: true,
      }),
    ).toBe("dependency_materialization_blocked");
    expect(
      dependencyDecisionFor({
        dependenciesPresent: true,
        hashesMatch: true,
        networkRequired: true,
        upgradeRequired: false,
        lockfileMutationRequired: false,
        cleanupGuaranteed: true,
        readOnlyOrCopyChosen: true,
      }),
    ).toBe("dependency_materialization_blocked");
    expect(
      dependencyDecisionFor({
        dependenciesPresent: true,
        hashesMatch: true,
        networkRequired: false,
        upgradeRequired: true,
        lockfileMutationRequired: false,
        cleanupGuaranteed: true,
        readOnlyOrCopyChosen: true,
      }),
    ).toBe("dependency_materialization_blocked");
  });

  test("prohibits installs, updates, registry access, and lockfile writes", () => {
    const record = readJson<Action482Record>(recordPath);

    expect(record.network_required).toBe(false);
    expect(record.dependency_install_performed).toBe(false);
    expect(record.dependency_update_performed).toBe(false);
    expect(record.lockfile_modified).toBe(false);
    expect(record.package_manifest_modified).toBe(false);
    expect(record.install_lifecycle_triggered).toBe(false);
    expect(record.registry_access_performed).toBe(false);
    expect(record.credential_value_recorded).toBe(false);
    expect(record.environment_value_recorded).toBe(false);
    expect(record.registry_token_recorded).toBe(false);
    expect(verifierReport.checks.no_network_install_or_mutation).toBe(true);
  });

  test("freezes read-only reuse policy and bounded-copy alternative", () => {
    const record = readJson<Action482Record>(recordPath);

    expect(record.preferred_dependency_materialization_method).toBe("read_only_local_node_modules_reuse");
    expect(record.dependency_materialization_method).toBe(
      "read_only_local_node_modules_reuse_or_temporary_verified_copy",
    );
    expect(record.dependency_source_classification).toBe("verified_existing_local_installation");
    expect(record.dependency_boundary_read_only).toBe(false);
    expect(record.dependency_boundary_read_only_status).toBe(
      "requires_action_483_implementation_proof",
    );
    expect(record.temporary_dependency_copy_required).toBe(false);
    expect(record.temporary_dependency_copy_allowed_if_read_only_link_not_practical).toBe(true);
    expect(record.candidate_inventory_includes_dependencies).toBe(false);
    expect(record.node_modules_tracked).toBe(false);
    expect(verifierReport.checks.materialization_method).toBe(true);
  });

  test("freezes Action 483 temp path and cleanup boundary", () => {
    const record = readJson<Action482Record>(recordPath);

    expect(String(record.temporary_path_policy.path_template)).toContain(
      "action-483-confidence-calibration-projection-preview-full-candidate-rehearsal",
    );
    expect(record.temporary_path_policy.dependency_link_or_copy_inside_temp_candidate_boundary_only).toBe(true);
    expect(record.temporary_path_policy.symlink_traversal_allowed).toBe(false);
    expect(record.temporary_path_policy.parent_chain_symlink_allowed).toBe(false);
    expect(record.temporary_path_policy.link_to_home_config_allowed).toBe(false);
    expect(record.temporary_path_policy.link_to_credential_stores_allowed).toBe(false);
    expect(record.temporary_path_policy.cleanup_after_rehearsal_required).toBe(true);
    expect(record.cleanup_policy.action_482_created_temporary_candidate).toBe(false);
    expect(record.cleanup_policy.action_482_created_dependency_copy).toBe(false);
    expect(record.cleanup_policy.future_cleanup_must_not_remove_source_dependency_tree).toBe(true);
    expect(verifierReport.checks.temporary_path_policy).toBe(true);
    expect(verifierReport.checks.source_mutation_and_cleanup).toBe(true);
  });

  test("uses exact decision vocabulary and routes to Action 483", () => {
    const record = readJson<Action482Record>(recordPath);

    expect(record.decision_vocabulary).toEqual([
      "dependency_materialization_ready",
      "dependency_materialization_ready_with_conditions",
      "dependency_materialization_blocked",
    ]);
    expect(record.overall_readiness_vocabulary).toEqual(["ready", "ready_with_conditions", "blocked"]);
    expect(record.dependency_materialization_decision).toBe(
      "dependency_materialization_ready_with_conditions",
    );
    expect(record.overall_readiness).toBe("ready_with_conditions");
    expect(record.unresolved_conditions).toContain(
      "action_483_must_choose_and_prove_read_only_link_or_bounded_temporary_copy_strategy",
    );
    expect(record.invalid_conditions).toEqual([]);
    expect(record.next_action).toBe(nextAction);
    expect(verifierReport.checks.vocabulary_and_decision).toBe(true);
  });

  test("keeps deployment, activation, environment, and runtime effects disabled", () => {
    const record = readJson<Action482Record>(recordPath);

    expect(record.network_step_authorized).toBe(false);
    expect(record.deployment_performed).toBe(false);
    expect(record.netlify_operation_performed).toBe(false);
    expect(record.preview_activated).toBe(false);
    expect(record.environment_modified).toBe(false);
    expect(record.preview_flag_required_state).toBe("absent_or_disabled");
    expect(record.preview_flag_enabled).toBe(false);
    expect(record.production_changed).toBe(false);
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
    expect(verifierReport.checks.no_effects).toBe(true);
  });
});
