#!/usr/bin/env node

import { createHash } from "crypto";
import { existsSync, readFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");

const paths = {
  record:
    "docs/action-519-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-build-rehearsal-approval-record.json",
  doc:
    "docs/action-519-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-build-rehearsal-approval-gate.md",
  action518:
    "docs/action-518-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-record.json",
  action517:
    "docs/action-517-confidence-calibration-recommendation-advisory-projection-preview-candidate-path-set-mismatch-remediation-approval-record.json",
  route: "app/api/recommendations/evaluate-outcomes/route.ts",
  nextPackage: "node_modules/next/package.json",
  packageJson: "package.json",
};

const expected = {
  cleanBase: "15f9923c24ed1f3cf82d34656eeacbfd98a0d347",
  action518ChangeHash: "bc43bd1fe8f61561ddededd2263d64f7d12f37db46d184e3bfd0ea55a8b538de",
  action518FullHash: "80620318166b0b9e1858cff3f12fc78d9ad77d9116655335e1c7fd7e566930b0",
  action518FileCount: 32,
  routeHash: "26407a8b78625a19a48a02ecf44e03db1642998da5f1d8acc5e8d47227773265",
  historicalAction492ChangeHash:
    "c005946d3a21df32730306687d125ef1ba4439500da7ec22288ec92d802d667c",
  historicalAction492FullHash:
    "d96af34b0c488ef16f614b2be731052c2099e0b6efde57f76115eb8d5c779a0f",
  nextVersion: "16.2.6",
  previewFlag: "CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED",
  nextAction: "action_520_remediated_32_file_candidate_build_rehearsal",
};

function read(relativePath) {
  return readFileSync(join(repoRoot, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function routeExports(source) {
  return [...source.matchAll(/^export\s+(?:async\s+)?function\s+([A-Za-z0-9_]+)/gm)].map(
    (match) => match[1],
  );
}

function pass(condition, message, failures) {
  if (!condition) failures.push(message);
}

function expectAllFalse(record, keys, failures) {
  for (const key of keys) {
    pass(record[key] === false, `${key} must be false`, failures);
  }
}

function expectArrayEqual(actual, expectedArray, message, failures) {
  pass(JSON.stringify(actual) === JSON.stringify(expectedArray), message, failures);
}

const failures = [];
for (const requiredPath of Object.values(paths)) {
  pass(existsSync(join(repoRoot, requiredPath)), `missing required file: ${requiredPath}`, failures);
}

if (failures.length === 0) {
  const record = readJson(paths.record);
  const doc = read(paths.doc);
  const action518 = readJson(paths.action518);
  const action517 = readJson(paths.action517);
  const routeSource = read(paths.route);
  const nextPackage = readJson(paths.nextPackage);
  const packageJson = readJson(paths.packageJson);
  const commandInventory = record.candidate_internal_command_inventory ?? [];
  const commandNames = commandInventory.map((entry) => entry.name);

  pass(
    record.schema_version ===
      "action_519_remediated_32_file_candidate_build_rehearsal_approval_record_v1",
    "schema version mismatch",
    failures,
  );
  pass(record.source_action === 518, "source action mismatch", failures);
  pass(
    record.action_nature ===
      "static_approval_gate_only_no_reconstruction_no_build_no_rehearsal_no_deploy_no_activation",
    "action nature mismatch",
    failures,
  );

  pass(action517.approval_decision === "approved", "Action 517 approval mismatch", failures);
  pass(action518.source_action === 517, "Action 518 source action mismatch", failures);
  pass(
    action518.candidate_reconstruction_result ===
      "remediated_32_file_candidate_reconstructed_and_frozen",
    "Action 518 candidate result mismatch",
    failures,
  );
  pass(action518.clean_base_identifier === expected.cleanBase, "Action 518 clean base mismatch", failures);
  pass(
    action518.new_change_candidate_hash === expected.action518ChangeHash,
    "Action 518 change hash mismatch",
    failures,
  );
  pass(
    action518.new_full_candidate_inventory_hash === expected.action518FullHash,
    "Action 518 full hash mismatch",
    failures,
  );
  pass(action518.new_candidate_file_count === 32, "Action 518 file count mismatch", failures);

  pass(record.clean_base_identifier === expected.cleanBase, "record clean base mismatch", failures);
  pass(
    record.change_candidate_hash === expected.action518ChangeHash,
    "record change hash mismatch",
    failures,
  );
  pass(
    record.full_candidate_inventory_hash === expected.action518FullHash,
    "record full hash mismatch",
    failures,
  );
  pass(record.candidate_file_count === expected.action518FileCount, "record count mismatch", failures);
  pass(record.remediated_route_path === paths.route, "record route path mismatch", failures);
  pass(record.remediated_route_hash === expected.routeHash, "record route hash mismatch", failures);
  pass(action518.added_route_path === paths.route, "Action 518 route path mismatch", failures);
  pass(action518.added_route_hash === expected.routeHash, "Action 518 route hash mismatch", failures);
  pass(sha256(routeSource) === expected.routeHash, "current route hash mismatch", failures);
  expectArrayEqual(record.route_export_surface, ["POST"], "record route export mismatch", failures);
  expectArrayEqual(routeExports(routeSource), ["POST"], "current route export mismatch", failures);
  pass(routeSource.includes("function buildOutcomeEligibility"), "route helper implementation missing", failures);
  pass(!routeSource.includes("export function buildOutcomeEligibility"), "route helper is still exported", failures);
  pass(record.invalid_route_helper_exported === false, "invalid helper export flag mismatch", failures);
  pass(record.runtime_dependency_closure_complete === true, "runtime closure flag mismatch", failures);
  pass(record.runtime_dependency_paths_missing === 0, "runtime missing path count mismatch", failures);

  pass(record.historical_action_492_candidate_file_count === 31, "historical count mismatch", failures);
  pass(
    record.historical_action_492_change_candidate_hash === expected.historicalAction492ChangeHash,
    "historical change hash mismatch",
    failures,
  );
  pass(
    record.historical_action_492_full_candidate_inventory_hash === expected.historicalAction492FullHash,
    "historical full hash mismatch",
    failures,
  );
  pass(
    record.historical_action_492_candidate_status ===
      "historical_candidate_build_defective_and_incomplete",
    "historical status mismatch",
    failures,
  );
  pass(record.historical_action_492_candidate_executable === false, "historical executable mismatch", failures);

  pass(
    record.temporary_path_policy ===
      "action_486_trusted_runtime_temp_root_relative_containment_action_520_exact_subtree",
    "temp policy mismatch",
    failures,
  );
  pass(
    record.future_action_520_temporary_subtree ===
      "ture/action-520-confidence-calibration-projection-preview-remediated-32-file-candidate-rehearsal",
    "Action 520 subtree mismatch",
    failures,
  );
  for (const [key, expectedValue] of Object.entries({
    trusted_runtime_temp_root: true,
    canonicalized_root_and_target: true,
    path_relative_containment: true,
    macos_var_private_var_equivalence_supported: true,
    string_prefix_only_containment_allowed: false,
    traversal_allowed: false,
    target_or_parent_symlink_allowed: false,
    repository_home_config_app_data_source_node_modules_or_netlify_location_allowed: false,
    target_absent_or_empty_required: true,
    exact_action_520_subtree_required: true,
    bounded_cleanup_required: true,
  })) {
    pass(record.safe_temporary_boundary?.[key] === expectedValue, `temp boundary ${key} mismatch`, failures);
  }

  pass(record.integrity_strategy === "baseline_plus_overlay_manifest_integrity", "integrity strategy mismatch", failures);
  pass(
    record.source_safety_policy ===
      "action_497_action_499_exact_path_membership_hash_provenance_classification_schema_fail_closed_policy",
    "source safety policy mismatch",
    failures,
  );
  for (const [key, expectedValue] of Object.entries({
    all_32_paths_and_hashes_verified: true,
    exact_historical_null_hash_exception_only: true,
    missing_source_files_allowed: 0,
    unexpected_source_files_allowed: 0,
    unapproved_deletions_allowed: 0,
    modified_unapproved_files_allowed: 0,
    conflict_markers_allowed: 0,
    environment_files_allowed: false,
    netlify_files_allowed: false,
    credentials_allowed: false,
    node_modules_in_source_inventory_allowed: false,
    wrong_hash_blocks: true,
    schema_or_provenance_cannot_override_hash_mismatch: true,
    advisory_sensitive_words_independently_block: false,
    unknown_sensitive_files_fail_closed: true,
    raw_secret_values_retained: false,
  })) {
    pass(record.source_safety_requirements?.[key] === expectedValue, `source safety ${key} mismatch`, failures);
  }

  pass(record.preview_flag_policy === "semantic_preview_flag_disabled_verification", "preview flag policy mismatch", failures);
  pass(record.preview_flag?.canonical_key === expected.previewFlag, "preview flag key mismatch", failures);
  pass(record.preview_flag?.resolved_state_required === "absent_or_disabled", "preview flag state mismatch", failures);
  pass(record.preview_flag?.result === "preview_flag_disabled_verified", "preview flag result mismatch", failures);
  pass(record.preview_flag?.alternate_activation_allowed === false, "preview flag alternate activation mismatch", failures);
  pass(record.preview_flag?.raw_value_recorded === false, "preview flag raw value mismatch", failures);
  pass(record.preview_flag?.environment_restored_required === true, "preview flag restore mismatch", failures);

  pass(
    record.dependency_materialization_method === "temporary_verified_node_modules_copy",
    "dependency method mismatch",
    failures,
  );
  pass(nextPackage.version === expected.nextVersion, "local Next version mismatch", failures);
  pass(
    record.dependency_materialization_policy?.candidate_local_next_version === expected.nextVersion,
    "candidate-local Next version mismatch",
    failures,
  );
  for (const [key, expectedValue] of Object.entries({
    verified_existing_local_dependency_tree_required: true,
    install_allowed: false,
    network_allowed: false,
    dependency_update_allowed: false,
    lockfile_rewrite_allowed: false,
    npmrc_allowed: false,
    package_cache_allowed: false,
    source_node_modules_unchanged_required: true,
    dependencies_excluded_from_candidate_inventory: true,
    known_extraneous_packages_excluded_count: 5,
    required_executable_modes_preserved: true,
  })) {
    pass(
      record.dependency_materialization_policy?.[key] === expectedValue,
      `dependency policy ${key} mismatch`,
      failures,
    );
  }

  pass(commandInventory.length === 20, "command inventory length mismatch", failures);
  expectArrayEqual(
    commandNames,
    [
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
    ],
    "command inventory names mismatch",
    failures,
  );
  pass(commandInventory[3]?.command === "npx next typegen", "typegen command mismatch", failures);
  pass(commandInventory[4]?.command === "npx tsc --noEmit", "tsc command mismatch", failures);
  pass(commandInventory[5]?.command === "npm run build", "build command mismatch", failures);
  pass(commandInventory[6]?.command === "npm run lint", "lint command mismatch", failures);
  pass(commandInventory[11]?.expected_call_site_count === 1, "call-site scan count mismatch", failures);
  pass(record.candidate_internal_required_paths_missing === 0, "required path missing count mismatch", failures);
  expectArrayEqual(record.candidate_internal_missing_paths, [], "required missing paths list mismatch", failures);
  for (const requiredPath of record.candidate_internal_required_paths ?? []) {
    pass(existsSync(join(repoRoot, requiredPath)), `candidate internal required path missing locally: ${requiredPath}`, failures);
  }
  pass(packageJson.scripts?.build === "next build", "package build script changed", failures);
  pass(typeof packageJson.scripts?.lint === "string", "package lint script missing", failures);

  pass(record.authoritative_build_command === "npm run build", "authoritative build command mismatch", failures);
  pass(record.authoritative_build_attempt_limit === 1, "authoritative build attempt limit mismatch", failures);
  pass(record.authoritative_build_readiness_capable === true, "authoritative build readiness mismatch", failures);
  pass(
    record.webpack_diagnostic_invocation_model === "direct_local_node_cli_invocation",
    "Webpack invocation model mismatch",
    failures,
  );
  expectArrayEqual(
    record.webpack_diagnostic_semantic_arguments,
    ["build", "--webpack"],
    "Webpack semantic args mismatch",
    failures,
  );
  pass(record.webpack_diagnostic_attempt_limit === 1, "Webpack attempt limit mismatch", failures);
  pass(record.webpack_diagnostic_runs_if_authoritative_build_passes === false, "Webpack pass boundary mismatch", failures);
  pass(record.webpack_diagnostic_may_run_if_authoritative_build_fails === true, "Webpack fail boundary mismatch", failures);
  pass(record.webpack_diagnostic_establishes_readiness === false, "Webpack readiness mismatch", failures);
  pass(record.maximum_build_process_invocations === 2, "maximum build process invocations mismatch", failures);
  pass(record.same_action_retry_allowed === false, "same-action retry mismatch", failures);
  pass(record.direct_candidate_local_next_cli_required_for_diagnostics === true, "local Next CLI diagnostic mismatch", failures);
  pass(record.global_next_cli_allowed === false, "global Next CLI mismatch", failures);
  pass(record.npx_package_resolution_for_diagnostics_allowed === false, "npx package resolution mismatch", failures);
  pass(record.persistent_path_changes_allowed === false, "persistent path changes mismatch", failures);
  pass(record.package_script_changes_allowed === false, "package script change mismatch", failures);
  pass(record.rehearsal_attempt_limit === 1, "rehearsal attempt limit mismatch", failures);

  expectArrayEqual(
    record.candidate_rehearsal_result_vocabulary,
    [
      "full_candidate_rehearsal_passed",
      "full_candidate_rehearsal_failed",
      "full_candidate_rehearsal_aborted",
    ],
    "rehearsal vocabulary mismatch",
    failures,
  );
  expectArrayEqual(
    record.external_evidence_result_vocabulary,
    ["rehearsal_evidence_verified", "rehearsal_evidence_failed", "rehearsal_evidence_aborted"],
    "external evidence vocabulary mismatch",
    failures,
  );
  expectArrayEqual(
    record.overall_readiness_vocabulary,
    ["ready_for_preview_deployment_final_approval", "ready_with_conditions", "blocked"],
    "readiness vocabulary mismatch",
    failures,
  );
  expectArrayEqual(record.approval_vocabulary, ["approved", "approved_with_conditions", "blocked"], "approval vocabulary mismatch", failures);

  expectAllFalse(
    record,
    [
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
    ],
    failures,
  );
  pass(record.approval_decision === "approved", "approval decision mismatch", failures);
  expectArrayEqual(record.unresolved_conditions, [], "unresolved conditions mismatch", failures);
  pass(
    record.runtime_preview_state === "runtime_preview_waiting_for_operator_inputs",
    "runtime preview state mismatch",
    failures,
  );
  pass(record.next_action === expected.nextAction, "next action mismatch", failures);

  for (const phrase of [
    "Action 519",
    "Action 518 is the new authoritative candidate",
    expected.cleanBase,
    expected.action518ChangeHash,
    expected.action518FullHash,
    expected.routeHash,
    "baseline_plus_overlay_manifest_integrity",
    expected.previewFlag,
    "preview_flag_disabled_verified",
    "temporary_verified_node_modules_copy",
    "direct_local_node_cli_invocation",
    "npm run build",
    "build --webpack",
    "approved",
    expected.nextAction,
    "does not reconstruct",
    "Do not deploy",
  ]) {
    pass(doc.includes(phrase), `doc missing phrase: ${phrase}`, failures);
  }
  pass(!/AUTOMATION_SECRET=|SUPABASE_SERVICE_ROLE_KEY=|TWELVE_DATA_API_KEY=/.test(doc), "doc contains secret assignment pattern", failures);
}

const result = {
  verifier:
    "action_519_confidence_calibration_recommendation_advisory_projection_preview_remediated_32_file_candidate_build_rehearsal_approval_gate",
  verification_status: failures.length === 0 ? "passed" : "failed",
  approval_decision: failures.length === 0 ? "approved" : "blocked",
  checked_without_reconstruction_build_rehearsal_deploy_or_activation: true,
  failures,
};

console.log(JSON.stringify(result, null, 2));

if (failures.length > 0) {
  process.exitCode = 1;
}
