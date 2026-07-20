import { execFileSync } from "child_process";
import { createHash } from "crypto";
import { existsSync, readFileSync } from "fs";
import { join, resolve } from "path";
import { test, expect } from "@playwright/test";

const repoRoot = resolve(__dirname, "../..");
const recordPath =
  "docs/action-519-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-build-rehearsal-approval-record.json";
const docPath =
  "docs/action-519-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-build-rehearsal-approval-gate.md";
const verifierPath =
  "scripts/action-519-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-build-rehearsal-approval-gate-verify.mjs";
const action518Path =
  "docs/action-518-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-record.json";
const routePath = "app/api/recommendations/evaluate-outcomes/route.ts";

const expected = {
  cleanBase: "15f9923c24ed1f3cf82d34656eeacbfd98a0d347",
  changeHash: "bc43bd1fe8f61561ddededd2263d64f7d12f37db46d184e3bfd0ea55a8b538de",
  fullHash: "80620318166b0b9e1858cff3f12fc78d9ad77d9116655335e1c7fd7e566930b0",
  routeHash: "26407a8b78625a19a48a02ecf44e03db1642998da5f1d8acc5e8d47227773265",
  nextVersion: "16.2.6",
  nextAction: "action_520_remediated_32_file_candidate_build_rehearsal",
};

type JsonObject = Record<string, unknown>;

type CommandInventoryEntry = {
  step: number;
  name: string;
  command?: string;
  expected_call_site_count?: number;
};

function read(relativePath: string): string {
  return readFileSync(join(repoRoot, relativePath), "utf8");
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(read(relativePath)) as T;
}

function sha256(value: string | Buffer): string {
  return createHash("sha256").update(value).digest("hex");
}

function routeExports(source: string): string[] {
  return [...source.matchAll(/^export\s+(?:async\s+)?function\s+([A-Za-z0-9_]+)/gm)].map(
    (match) => match[1],
  );
}

test.describe("Action 519 remediated 32-file candidate build rehearsal approval gate", () => {
  test("binds the approval record to the exact Action 518 candidate", () => {
    const record = readJson<JsonObject>(recordPath);
    const action518 = readJson<JsonObject>(action518Path);

    expect(record.schema_version).toBe(
      "action_519_remediated_32_file_candidate_build_rehearsal_approval_record_v1",
    );
    expect(record.action_nature).toBe(
      "static_approval_gate_only_no_reconstruction_no_build_no_rehearsal_no_deploy_no_activation",
    );
    expect(record.source_action).toBe(518);
    expect(record.clean_base_identifier).toBe(expected.cleanBase);
    expect(record.change_candidate_hash).toBe(expected.changeHash);
    expect(record.full_candidate_inventory_hash).toBe(expected.fullHash);
    expect(record.candidate_file_count).toBe(32);

    expect(action518.candidate_reconstruction_result).toBe(
      "remediated_32_file_candidate_reconstructed_and_frozen",
    );
    expect(action518.clean_base_identifier).toBe(expected.cleanBase);
    expect(action518.new_change_candidate_hash).toBe(expected.changeHash);
    expect(action518.new_full_candidate_inventory_hash).toBe(expected.fullHash);
    expect(action518.new_candidate_file_count).toBe(32);
  });

  test("binds the remediated evaluate-outcomes route and private helper export", () => {
    const record = readJson<JsonObject>(recordPath);
    const routeSource = read(routePath);

    expect(record.remediated_route_path).toBe(routePath);
    expect(record.remediated_route_hash).toBe(expected.routeHash);
    expect(sha256(routeSource)).toBe(expected.routeHash);
    expect(record.route_export_surface).toEqual(["POST"]);
    expect(routeExports(routeSource)).toEqual(["POST"]);
    expect(routeSource).toContain("function buildOutcomeEligibility");
    expect(routeSource).not.toContain("export function buildOutcomeEligibility");
    expect(record.invalid_route_helper_exported).toBe(false);
    expect(record.runtime_dependency_closure_complete).toBe(true);
    expect(record.runtime_dependency_paths_missing).toBe(0);
  });

  test("marks Action 492 as superseded and non-executable", () => {
    const record = readJson<JsonObject>(recordPath);

    expect(record.historical_action_492_candidate_file_count).toBe(31);
    expect(record.historical_action_492_candidate_status).toBe(
      "historical_candidate_build_defective_and_incomplete",
    );
    expect(record.historical_action_492_candidate_executable).toBe(false);
  });

  test("retains safe Action 520 reconstruction and temp path policy", () => {
    const record = readJson<JsonObject>(recordPath);
    const boundary = record.safe_temporary_boundary as JsonObject;
    const reconstruction = record.reconstruction_policy as JsonObject;

    expect(record.temporary_path_policy).toBe(
      "action_486_trusted_runtime_temp_root_relative_containment_action_520_exact_subtree",
    );
    expect(record.future_action_520_temporary_subtree).toBe(
      "ture/action-520-confidence-calibration-projection-preview-remediated-32-file-candidate-rehearsal",
    );
    expect(boundary.trusted_runtime_temp_root).toBe(true);
    expect(boundary.path_relative_containment).toBe(true);
    expect(boundary.string_prefix_only_containment_allowed).toBe(false);
    expect(boundary.target_or_parent_symlink_allowed).toBe(false);
    expect(boundary.exact_action_520_subtree_required).toBe(true);
    expect(reconstruction.clean_base_required).toBe(expected.cleanBase);
    expect(reconstruction.overlay_source_action).toBe(518);
    expect(reconstruction.broad_dirty_worktree_copy_allowed).toBe(false);
    expect(reconstruction.expected_overlay_file_count).toBe(32);
  });

  test("freezes source-safety and preview flag policies", () => {
    const record = readJson<JsonObject>(recordPath);
    const safety = record.source_safety_requirements as JsonObject;
    const flag = record.preview_flag as JsonObject;

    expect(record.integrity_strategy).toBe("baseline_plus_overlay_manifest_integrity");
    expect(record.source_safety_policy).toBe(
      "action_497_action_499_exact_path_membership_hash_provenance_classification_schema_fail_closed_policy",
    );
    expect(safety.all_32_paths_and_hashes_verified).toBe(true);
    expect(safety.wrong_hash_blocks).toBe(true);
    expect(safety.credentials_allowed).toBe(false);
    expect(safety.environment_files_allowed).toBe(false);
    expect(safety.node_modules_in_source_inventory_allowed).toBe(false);
    expect(safety.raw_secret_values_retained).toBe(false);
    expect(record.preview_flag_policy).toBe("semantic_preview_flag_disabled_verification");
    expect(flag.canonical_key).toBe("CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED");
    expect(flag.result).toBe("preview_flag_disabled_verified");
    expect(flag.resolved_state_required).toBe("absent_or_disabled");
    expect(flag.raw_value_recorded).toBe(false);
  });

  test("approves only temporary verified dependency copy with candidate-local Next 16.2.6", () => {
    const record = readJson<JsonObject>(recordPath);
    const dependency = record.dependency_materialization_policy as JsonObject;
    const nextPackage = readJson<JsonObject>("node_modules/next/package.json");

    expect(record.dependency_materialization_method).toBe("temporary_verified_node_modules_copy");
    expect(nextPackage.version).toBe(expected.nextVersion);
    expect(dependency.candidate_local_next_version).toBe(expected.nextVersion);
    expect(dependency.install_allowed).toBe(false);
    expect(dependency.network_allowed).toBe(false);
    expect(dependency.lockfile_rewrite_allowed).toBe(false);
    expect(dependency.source_node_modules_unchanged_required).toBe(true);
    expect(dependency.dependencies_excluded_from_candidate_inventory).toBe(true);
    expect(dependency.known_extraneous_packages_excluded_count).toBe(5);
  });

  test("locks the future candidate-internal command inventory and build boundaries", () => {
    const record = readJson<JsonObject>(recordPath);
    const inventory = record.candidate_internal_command_inventory as CommandInventoryEntry[];
    const commandNames = inventory.map((entry) => entry.name);

    expect(inventory).toHaveLength(20);
    expect(commandNames).toEqual([
      "candidate_integrity_confirmation",
      "strict_source_safety_hash_test_matrix",
      "semantic_preview_flag_helper_matrix",
      "next_typegen",
      "typescript_no_emit",
      "authoritative_build",
      "lint",
      "action_309_safety_guard_if_present",
      "action_461_preview_consumer_runtime_suite_if_present",
      "action_462_independent_runtime_suite_if_present",
      "recommendation_details_runtime_regression_suite_if_present",
      "runtime_facing_projection_call_site_scan",
      "no_route_scan",
      "no_persistence_scan",
      "no_replay_scan",
      "no_provider_supabase_preview_integration_scan",
      "no_feedback_scan",
      "no_confidence_application_scan",
      "no_ranking_scanner_publication_execution_add_trade_risk_sizing_effect_scan",
      "preview_flag_disabled_confirmation",
    ]);
    expect(inventory[3].command).toBe("npx next typegen");
    expect(inventory[4].command).toBe("npx tsc --noEmit");
    expect(inventory[5].command).toBe("npm run build");
    expect(inventory[6].command).toBe("npm run lint");
    expect(inventory[11].expected_call_site_count).toBe(1);

    expect(record.authoritative_build_command).toBe("npm run build");
    expect(record.authoritative_build_attempt_limit).toBe(1);
    expect(record.webpack_diagnostic_invocation_model).toBe("direct_local_node_cli_invocation");
    expect(record.webpack_diagnostic_semantic_arguments).toEqual(["build", "--webpack"]);
    expect(record.webpack_diagnostic_attempt_limit).toBe(1);
    expect(record.webpack_diagnostic_establishes_readiness).toBe(false);
    expect(record.maximum_build_process_invocations).toBe(2);
    expect(record.same_action_retry_allowed).toBe(false);
    expect(record.package_script_changes_allowed).toBe(false);
  });

  test("confirms required paths, approval vocabulary, and no-effect side effects", () => {
    const record = readJson<JsonObject>(recordPath);

    expect(record.candidate_internal_required_paths_missing).toBe(0);
    expect(record.candidate_internal_missing_paths).toEqual([]);
    for (const requiredPath of record.candidate_internal_required_paths as string[]) {
      expect(existsSync(join(repoRoot, requiredPath)), requiredPath).toBe(true);
    }

    expect(record.candidate_rehearsal_result_vocabulary).toEqual([
      "full_candidate_rehearsal_passed",
      "full_candidate_rehearsal_failed",
      "full_candidate_rehearsal_aborted",
    ]);
    expect(record.external_evidence_result_vocabulary).toEqual([
      "rehearsal_evidence_verified",
      "rehearsal_evidence_failed",
      "rehearsal_evidence_aborted",
    ]);
    expect(record.overall_readiness_vocabulary).toEqual([
      "ready_for_preview_deployment_final_approval",
      "ready_with_conditions",
      "blocked",
    ]);
    expect(record.approval_vocabulary).toEqual(["approved", "approved_with_conditions", "blocked"]);

    for (const key of [
      "deployment_authorized",
      "activation_authorized",
      "reconstruction_performed",
      "typegen_performed",
      "typescript_performed",
      "build_performed",
      "lint_performed",
      "test_performed",
      "rehearsal_performed",
      "deployment_performed",
      "preview_activated",
      "network_used",
      "install_performed",
      "netlify_operation_performed",
      "provider_call_executed",
      "supabase_read_executed",
      "supabase_write_executed",
      "persistence_created",
      "replay_created",
      "confidence_applied",
      "feedback_created",
      "scanner_changed",
      "ranking_changed",
      "publication_changed",
      "execution_changed",
      "add_trade_changed",
      "risk_sizing_changed",
      "downstream_behavior_changed",
    ]) {
      expect(record[key], key).toBe(false);
    }
  });

  test("records approval, next action, and static-only documentation", () => {
    const record = readJson<JsonObject>(recordPath);
    const doc = read(docPath);

    expect(record.approval_decision).toBe("approved");
    expect(record.unresolved_conditions).toEqual([]);
    expect(record.runtime_preview_state).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(record.next_action).toBe(expected.nextAction);
    expect(doc).toContain("Action 519");
    expect(doc).toContain("Action 518 is the new authoritative candidate");
    expect(doc).toContain(expected.nextAction);
    expect(doc).toContain("Do not deploy");
    expect(doc).toContain("does not reconstruct");
    expect(doc).not.toMatch(/AUTOMATION_SECRET=|SUPABASE_SERVICE_ROLE_KEY=|TWELVE_DATA_API_KEY=/);
  });

  test("runs the focused Action 519 verifier", () => {
    const output = execFileSync("node", [verifierPath], { cwd: repoRoot, encoding: "utf8" });
    const result = JSON.parse(output) as JsonObject;

    expect(result.verification_status).toBe("passed");
    expect(result.approval_decision).toBe("approved");
    expect(result.checked_without_reconstruction_build_rehearsal_deploy_or_activation).toBe(true);
    expect(result.failures).toEqual([]);
  });
});
