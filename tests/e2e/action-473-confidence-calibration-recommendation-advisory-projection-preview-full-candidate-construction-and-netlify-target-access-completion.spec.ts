import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join, resolve } from "path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const docPath =
  "docs/action-473-confidence-calibration-recommendation-advisory-projection-preview-full-candidate-construction-and-netlify-target-access-completion.md";
const inventoryPath =
  "docs/action-473-confidence-calibration-recommendation-advisory-projection-preview-full-deployment-candidate-inventory.json";
const netlifyRecordPath =
  "docs/action-473-confidence-calibration-recommendation-advisory-projection-preview-netlify-target-access-record.json";
const action472RecordPath =
  "docs/action-472-confidence-calibration-recommendation-advisory-projection-preview-deployment-abort-remediation-approval-record.json";
const action466RecordPath =
  "docs/action-466-confidence-calibration-recommendation-advisory-projection-preview-candidate-materialization.json";
const verifierPath =
  "scripts/action-473-confidence-calibration-recommendation-advisory-projection-preview-full-candidate-construction-and-netlify-target-access-completion-verify.mjs";
const candidateHash =
  "7a11d9c6697a9d89ffb3e762dd15185fda225bc8e39c80a212cd3729d05857f6";
const fullCandidateHash =
  "cc6a97c5797a1fa76a6bebe9be1497fe88819f1b73992b271c142ff61d3bc2f0";
const repositoryBase = "15f9923c24ed1f3cf82d34656eeacbfd98a0d347";

test.setTimeout(300000);

type Action473Inventory = {
  inventory_schema_version: string;
  source_action: number;
  source_approval_action: number;
  repository_base_identifier: string;
  repository_base_type: string;
  repository_base_available: boolean;
  repository_base_integrity_result: string;
  repository_base_contains_package_manifest: boolean;
  repository_base_contains_lockfile: boolean;
  repository_base_contains_next_config: boolean;
  repository_base_contains_application_structure: boolean;
  repository_base_file_count: number;
  approved_change_candidate_hash: string;
  approved_change_candidate_file_count: number;
  approved_change_candidate_decision: string;
  full_candidate_classification: string;
  full_candidate_file_inventory_strategy: string;
  temporary_candidate_safety: Record<string, boolean>;
  construction_result: string;
  base_materialization_result: string;
  overlay_result: string;
  overlaid_file_count: number;
  changed_file_paths: string[];
  changed_file_classifications: Record<string, string>;
  changed_file_content_hashes: Record<string, string | null>;
  required_manifest_hashes: Record<string, string>;
  required_lockfile_hash: string;
  runtime_projection_call_site_count: number;
  runtime_projection_call_site_definition: string;
  unexpected_changed_file_count: number;
  unrelated_post_trade_changed_file_count: number;
  secret_file_count: number;
  environment_file_count: number;
  merge_conflict_count: number;
  preview_flag_state: string;
  full_candidate_build_result: string;
  full_candidate_test_result: string;
  dependency_handling_result: string;
  full_candidate_inventory_hash: string;
  temporary_candidate_cleanup_result: string;
  temporary_candidate_absent_after_cleanup: boolean;
  full_candidate_decision: string;
  full_candidate_conditions: string[];
  deployment_performed: boolean;
  preview_activated: boolean;
  production_changed: boolean;
  runtime_preview_state: string;
};

type NetlifyTargetRecord = {
  schema_version: string;
  target_name: string;
  target_identifier: string;
  environment_classification: string;
  deployment_platform: string;
  site_association_known: boolean;
  production_alias_protected: null;
  preview_deploy_supported: null;
  initial_flag_can_remain_disabled: null;
  credential_available: boolean;
  authentication_method_classification: string;
  credential_verification_result: string;
  netlify_target_access_decision: string;
  remaining_user_actions: string[];
  network_step_performed: boolean;
  authentication_performed: boolean;
  deployment_performed: boolean;
  credential_value_recorded: boolean;
  secret_url_recorded: boolean;
  environment_value_recorded: boolean;
  preview_activated: boolean;
  production_changed: boolean;
};

type Action466Record = {
  action_465_candidate_inventory_hash: string;
  candidate_file_count: number;
  candidate_paths: string[];
  candidate_content_hashes: Record<string, string | null>;
  unexpected_file_count: number;
  secret_file_count: number;
  environment_file_count: number;
};

type Action472Record = {
  approval_decision: string;
  next_permitted_action: string;
};

type VerifierReport = {
  verification_status: string;
  failed_conditions: string[];
  checks: Record<string, boolean>;
  overall_readiness: string;
  full_candidate_decision: string;
  netlify_target_access_decision: string;
  next_action: string;
  no_effect_results: Record<string, boolean>;
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

test.describe("Action 473 full candidate construction and Netlify target access completion", () => {
  test("adds durable documentation, inventory, target record, verifier, and passing focused verifier", () => {
    expect(existsSync(join(root, docPath))).toBe(true);
    expect(existsSync(join(root, inventoryPath))).toBe(true);
    expect(existsSync(join(root, netlifyRecordPath))).toBe(true);
    expect(existsSync(join(root, verifierPath))).toBe(true);

    const doc = read(docPath);
    expect(doc).toContain("## Clean Repository Base");
    expect(doc).toContain("## Full-Candidate Construction");
    expect(doc).toContain("## Netlify Target Information");
    expect(doc).toContain("Full-candidate decision: `full_candidate_ready_with_conditions`");
    expect(doc).toContain("Netlify-access decision: `netlify_target_access_ready_with_conditions`");
    expect(doc).toContain("action_474_netlify_target_and_secure_access_completion");
    expect(verifierReport.verification_status).toBe("passed");
    expect(verifierReport.failed_conditions).toEqual([]);
  });

  test("binds Action 472 approval to the exact 30-file candidate", () => {
    const action472 = readJson<Action472Record>(action472RecordPath);
    const action466 = readJson<Action466Record>(action466RecordPath);
    const inventory = readJson<Action473Inventory>(inventoryPath);

    expect(action472.approval_decision).toBe("approved_with_conditions");
    expect(action472.next_permitted_action).toBe(
      "action_473_preview_full_candidate_construction_and_netlify_target_access_completion",
    );
    expect(action466.action_465_candidate_inventory_hash).toBe(candidateHash);
    expect(action466.candidate_file_count).toBe(30);
    expect(action466.unexpected_file_count).toBe(0);
    expect(action466.secret_file_count).toBe(0);
    expect(action466.environment_file_count).toBe(0);
    expect(inventory.approved_change_candidate_hash).toBe(candidateHash);
    expect(inventory.approved_change_candidate_file_count).toBe(30);
    expect(inventory.approved_change_candidate_decision).toBe("candidate_ready");
    expect(verifierReport.checks.action472_approval).toBe(true);
    expect(verifierReport.checks.candidate_binding).toBe(true);
  });

  test("uses a clean Git base rather than the dirty working tree", () => {
    const inventory = readJson<Action473Inventory>(inventoryPath);

    expect(inventory.repository_base_identifier).toBe(repositoryBase);
    expect(inventory.repository_base_type).toBe("local_git_head_commit");
    expect(inventory.repository_base_available).toBe(true);
    expect(inventory.repository_base_integrity_result).toBe(
      "locally_verified_from_git_object_database",
    );
    expect(inventory.repository_base_contains_package_manifest).toBe(true);
    expect(inventory.repository_base_contains_lockfile).toBe(true);
    expect(inventory.repository_base_contains_next_config).toBe(true);
    expect(inventory.repository_base_contains_application_structure).toBe(true);
    expect(inventory.repository_base_file_count).toBeGreaterThan(2000);
    expect(verifierReport.checks.clean_base).toBe(true);
  });

  test("constructs a bounded temporary full candidate and overlays exactly the approved paths", () => {
    const action466 = readJson<Action466Record>(action466RecordPath);
    const inventory = readJson<Action473Inventory>(inventoryPath);

    expect(inventory.full_candidate_classification).toBe(
      "temporary_full_repository_candidate_from_git_head_plus_approved_overlay",
    );
    expect(inventory.full_candidate_file_inventory_strategy).toBe(
      "bounded_git_head_file_inventory_plus_exact_30_file_overlay",
    );
    expect(inventory.construction_result).toBe("constructed_overlay_verified_and_cleaned_up");
    expect(inventory.base_materialization_result).toBe(
      "git_head_files_materialized_without_git_directory",
    );
    expect(inventory.overlay_result).toBe("exact_30_candidate_files_overlaid");
    expect(inventory.overlaid_file_count).toBe(30);
    expect(inventory.changed_file_paths).toHaveLength(30);
    expect(new Set(inventory.changed_file_paths)).toEqual(new Set(action466.candidate_paths));
    for (const [path, hash] of Object.entries(action466.candidate_content_hashes)) {
      expect(inventory.changed_file_content_hashes[path]).toBe(hash);
    }
    expect(inventory.changed_file_classifications["components/recommendations/RecommendationDetailsModal.tsx"]).toContain(
      "runtime",
    );
    expect(verifierReport.checks.exact_overlay).toBe(true);
  });

  test("rejects unapproved files, secrets, environment files, and merge conflicts", () => {
    const inventory = readJson<Action473Inventory>(inventoryPath);

    expect(inventory.unexpected_changed_file_count).toBe(0);
    expect(inventory.unrelated_post_trade_changed_file_count).toBe(0);
    expect(inventory.secret_file_count).toBe(0);
    expect(inventory.environment_file_count).toBe(0);
    expect(inventory.merge_conflict_count).toBe(0);
    expect(verifierReport.checks.changed_path_boundary).toBe(true);
  });

  test("records safe temporary path constraints and cleanup", () => {
    const inventory = readJson<Action473Inventory>(inventoryPath);

    expect(inventory.temporary_candidate_safety.outside_repository).toBe(true);
    expect(inventory.temporary_candidate_safety.outside_home_config).toBe(true);
    expect(inventory.temporary_candidate_safety.no_symlink_target).toBe(true);
    expect(inventory.temporary_candidate_safety.no_parent_chain_symlink).toBe(true);
    expect(inventory.temporary_candidate_safety.no_traversal).toBe(true);
    expect(inventory.temporary_candidate_safety.no_retained_credentials).toBe(true);
    expect(inventory.temporary_candidate_safety.no_retained_environment_files).toBe(true);
    expect(inventory.temporary_candidate_cleanup_result).toBe("temporary_candidate_removed");
    expect(inventory.temporary_candidate_absent_after_cleanup).toBe(true);
    expect(verifierReport.checks.temporary_path_safety).toBe(true);
    expect(verifierReport.checks.cleanup).toBe(true);
  });

  test("records baseline dependency and configuration hashes without changing them", () => {
    const inventory = readJson<Action473Inventory>(inventoryPath);

    expect(inventory.required_manifest_hashes["package.json"]).toBe(
      "7ff6ae8890b52d4879ce88248c22f152fffab327e8a5ef3a92eccccad217ef58",
    );
    expect(inventory.required_lockfile_hash).toBe(
      "859f498ee4d7d64259ad07d6117e25e284a29bd7d7169126100564fe90943657",
    );
    expect(inventory.required_manifest_hashes["next.config.ts"]).toBe(
      "614bce25b089c3f19b1e17a6346c74b858034040154c6621e7d35303004767cc",
    );
    expect(inventory.required_manifest_hashes["tsconfig.json"]).toBe(
      "83b460dca7c269a562dba8f46d08de45397869b7ddbf31101eabca1a975eaa82",
    );
    expect(verifierReport.checks.baseline_hashes).toBe(true);
  });

  test("captures buildability and dependency handling as conditional rather than silently deploying", () => {
    const inventory = readJson<Action473Inventory>(inventoryPath);

    expect(inventory.full_candidate_build_result).toBe(
      "local_workspace_validation_passed_temp_build_blocked_by_dependency_materialization_policy",
    );
    expect(inventory.full_candidate_test_result).toBe(
      "focused_static_validation_passed_temp_full_suite_not_run_dependency_materialization_policy",
    );
    expect(inventory.dependency_handling_result).toBe(
      "local_dependencies_available_in_active_workspace_temp_candidate_dependency_reuse_requires_future_approval",
    );
    expect(inventory.full_candidate_conditions).toEqual([
      "temp_candidate_dependency_materialization_or_reuse_policy_not_approved",
      "full_temp_candidate_build_suite_not_run",
    ]);
    expect(verifierReport.checks.buildability_results).toBe(true);
  });

  test("keeps the preview flag disabled and records the single runtime preview call site", () => {
    const inventory = readJson<Action473Inventory>(inventoryPath);

    expect(inventory.runtime_projection_call_site_count).toBe(1);
    expect(inventory.runtime_projection_call_site_definition).toBe(
      "one JSX render of ConfidenceCalibrationProjectionPreview in RecommendationDetailsModal",
    );
    expect(inventory.preview_flag_state).toBe("disabled_by_policy_not_read_from_env");
    expect(inventory.runtime_preview_state).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(verifierReport.checks.runtime_and_flag).toBe(true);
  });

  test("freezes the full candidate inventory hash", () => {
    const inventory = readJson<Action473Inventory>(inventoryPath);

    expect(inventory.full_candidate_inventory_hash).toBe(fullCandidateHash);
    expect(verifierReport.full_candidate_decision).toBe("full_candidate_ready_with_conditions");
    expect(verifierReport.overall_readiness).toBe("ready_with_conditions");
    expect(verifierReport.checks.inventory_hash).toBe(true);
  });

  test("records Netlify target access as non-production and conditional without credentials", () => {
    const netlify = readJson<NetlifyTargetRecord>(netlifyRecordPath);

    expect(netlify.schema_version).toBe("action_473_netlify_target_access_record_v1");
    expect(netlify.target_name).toBe(
      "Netlify Preview Deployment – Ture Confidence Calibration Projection Preview",
    );
    expect(netlify.target_identifier).toBe("ture-confidence-calibration-projection-preview");
    expect(netlify.environment_classification).toBe("non_production_preview");
    expect(netlify.deployment_platform).toBe("Netlify");
    expect(netlify.site_association_known).toBe(false);
    expect(netlify.production_alias_protected).toBeNull();
    expect(netlify.preview_deploy_supported).toBeNull();
    expect(netlify.initial_flag_can_remain_disabled).toBeNull();
    expect(netlify.credential_available).toBe(false);
    expect(netlify.authentication_method_classification).toBe(
      "not_verified_no_network_no_interactive_auth",
    );
    expect(netlify.credential_verification_result).toBe(
      "conditional_user_completion_required",
    );
    expect(netlify.netlify_target_access_decision).toBe(
      "netlify_target_access_ready_with_conditions",
    );
    expect(verifierReport.checks.netlify_target).toBe(true);
    expect(verifierReport.checks.credential_policy).toBe(true);
  });

  test("lists the remaining user actions without exposing or recording secret values", () => {
    const netlify = readJson<NetlifyTargetRecord>(netlifyRecordPath);

    expect(netlify.remaining_user_actions).toEqual([
      "confirm_intended_existing_netlify_site_or_project_name",
      "confirm_preview_or_deploy_preview_creation_is_supported",
      "confirm_production_alias_remains_protected",
      "authenticate_local_deployment_environment_through_supported_secure_mechanism",
      "confirm_credential_availability_without_sharing_credential_value",
    ]);
    expect(netlify.credential_value_recorded).toBe(false);
    expect(netlify.secret_url_recorded).toBe(false);
    expect(netlify.environment_value_recorded).toBe(false);
    expect(verifierReport.next_action).toBe("action_474_netlify_target_and_secure_access_completion");
  });

  test("performs no deployment, activation, network, authentication, provider, Supabase, replay, or scanner effects", () => {
    const inventory = readJson<Action473Inventory>(inventoryPath);
    const netlify = readJson<NetlifyTargetRecord>(netlifyRecordPath);

    expect(inventory.deployment_performed).toBe(false);
    expect(inventory.preview_activated).toBe(false);
    expect(inventory.production_changed).toBe(false);
    expect(netlify.network_step_performed).toBe(false);
    expect(netlify.authentication_performed).toBe(false);
    expect(netlify.deployment_performed).toBe(false);
    expect(netlify.preview_activated).toBe(false);
    expect(netlify.production_changed).toBe(false);
    expect(Object.values(verifierReport.no_effect_results)).toEqual(
      expect.arrayContaining([true]),
    );
    expect(Object.values(verifierReport.no_effect_results).every(Boolean)).toBe(true);
    expect(verifierReport.checks.no_side_effects).toBe(true);
  });
});
