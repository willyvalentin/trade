#!/usr/bin/env node

import { createHash } from "crypto";
import { existsSync, readFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");

const recordPath =
  "docs/action-516-confidence-calibration-recommendation-advisory-projection-preview-remediated-runtime-complete-candidate-record.json";
const docPath =
  "docs/action-516-confidence-calibration-recommendation-advisory-projection-preview-remediated-runtime-complete-candidate-reconstruction-and-hash-freeze.md";
const action492Path =
  "docs/action-492-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-record.json";
const action514Path =
  "docs/action-514-confidence-calibration-recommendation-advisory-projection-preview-webpack-build-failure-bounded-diagnostic-retry-record.json";
const action515Path =
  "docs/action-515-confidence-calibration-recommendation-advisory-projection-preview-candidate-build-source-remediation-record.json";
const routePath = "app/api/recommendations/evaluate-outcomes/route.ts";

const expected = {
  cleanBase: "15f9923c24ed1f3cf82d34656eeacbfd98a0d347",
  historicalChangeHash: "c005946d3a21df32730306687d125ef1ba4439500da7ec22288ec92d802d667c",
  historicalFullHash: "d96af34b0c488ef16f614b2be731052c2099e0b6efde57f76115eb8d5c779a0f",
  historicalCount: 31,
  historicalPathSetHash: "8f1d84af0e5bc4f377bd4d0215a53d68f0302a8bee09d2be8f869ae7e4d364f6",
  routeHash: "26407a8b78625a19a48a02ecf44e03db1642998da5f1d8acc5e8d47227773265",
  helperHash: "8b3e4694f83003104ec764f3afa81c4f1e9b87543b3241e4785dd6bdd3d32afe",
  nextAction: "action_517_candidate_reconstruction_path_set_mismatch_remediation_gate",
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

function extractHelperBody(source) {
  const start = source.indexOf("function buildOutcomeEligibility");
  if (start < 0) return null;
  let depth = 0;
  let seenBody = false;
  for (let index = start; index < source.length; index += 1) {
    const char = source[index];
    if (char === "{") {
      depth += 1;
      seenBody = true;
    } else if (char === "}") {
      depth -= 1;
      if (seenBody && depth === 0) return source.slice(start, index + 1);
    }
  }
  return null;
}

function routeExports(source) {
  return [...source.matchAll(/^export\s+(?:async\s+)?function\s+([A-Za-z0-9_]+)/gm)].map(
    (match) => match[1],
  );
}

function pass(condition, message, failures) {
  if (!condition) failures.push(message);
}

const failures = [];
for (const requiredPath of [recordPath, docPath, action492Path, action514Path, action515Path, routePath]) {
  pass(existsSync(join(repoRoot, requiredPath)), `missing required file: ${requiredPath}`, failures);
}

if (failures.length === 0) {
  const record = readJson(recordPath);
  const action492 = readJson(action492Path);
  const action514 = readJson(action514Path);
  const action515 = readJson(action515Path);
  const routeSource = read(routePath);
  const doc = read(docPath);
  const helperBody = extractHelperBody(routeSource);
  const action492Paths = action492.new_changed_file_inventory.map((entry) => entry.path).sort();
  const action492PathSetHash = sha256(JSON.stringify(action492Paths));
  const exports = routeExports(routeSource);

  pass(action514.candidate_defect_status === "candidate_defect_proven", "Action 514 defect status mismatch", failures);
  pass(action514.first_causal_error?.repository_relative_path === routePath, "Action 514 causal path mismatch", failures);
  pass(action514.first_causal_error?.module_reference === "buildOutcomeEligibility", "Action 514 module mismatch", failures);

  pass(action515.remediation_result === "candidate_build_source_remediation_completed", "Action 515 not completed", failures);
  pass(action515.invalid_route_export_removed === true, "Action 515 did not remove invalid export", failures);
  pass(action515.new_candidate_hash_computed === false, "Action 515 computed a candidate hash", failures);
  pass(action515.source_files_changed?.length === 1, "Action 515 source file count changed", failures);
  pass(action515.source_files_changed?.[0] === routePath, "Action 515 source file mismatch", failures);

  pass(record.schema_version === "action_516_remediated_runtime_complete_candidate_record_v1", "schema mismatch", failures);
  pass(record.source_action === 515, "source action mismatch", failures);
  pass(record.clean_base_identifier === expected.cleanBase, "clean base mismatch", failures);
  pass(record.historical_change_candidate_hash === expected.historicalChangeHash, "historical change hash mismatch", failures);
  pass(record.historical_full_candidate_inventory_hash === expected.historicalFullHash, "historical full hash mismatch", failures);
  pass(record.historical_candidate_file_count === expected.historicalCount, "historical count mismatch", failures);
  pass(record.historical_candidate_status === "historical_candidate_build_defective", "historical status mismatch", failures);
  pass(action492.new_candidate_file_count === expected.historicalCount, "Action 492 count mismatch", failures);
  pass(action492.new_change_candidate_hash === expected.historicalChangeHash, "Action 492 change hash mismatch", failures);
  pass(action492.new_full_candidate_inventory_hash === expected.historicalFullHash, "Action 492 full hash mismatch", failures);
  pass(action492PathSetHash === expected.historicalPathSetHash, "Action 492 path-set hash mismatch", failures);
  pass(record.historical_candidate_path_set_hash === expected.historicalPathSetHash, "record path-set hash mismatch", failures);
  pass(!action492Paths.includes(routePath), "Action 492 unexpectedly contains route path", failures);
  pass(record.historical_candidate_route_path_present === false, "record route presence mismatch", failures);
  pass(record.historical_candidate_path_set_mismatch === true, "record path-set mismatch flag missing", failures);

  pass(record.remediated_path === routePath, "remediated route path mismatch", failures);
  pass(sha256(read(routePath)) === expected.routeHash, "current remediated route hash mismatch", failures);
  pass(record.remediated_path_hash === expected.routeHash, "record route hash mismatch", failures);
  pass(!routeSource.includes("export function buildOutcomeEligibility"), "route still exports helper", failures);
  pass(routeSource.includes("function buildOutcomeEligibility"), "route helper missing", failures);
  pass(record.buildOutcomeEligibility_exported === false, "record helper export flag mismatch", failures);
  pass(record.helper_remains_module_local === true, "record helper locality mismatch", failures);
  pass((routeSource.match(/buildOutcomeEligibility/g) ?? []).length === 2, "helper occurrence count mismatch", failures);
  pass(record.helper_internal_occurrences === 2, "record helper occurrence count mismatch", failures);
  pass(helperBody !== null, "helper body missing", failures);
  pass(helperBody === null || sha256(helperBody) === expected.helperHash, "helper body hash mismatch", failures);
  pass(record.helper_body_sha256_before === expected.helperHash, "record before helper hash mismatch", failures);
  pass(record.helper_body_sha256_after === expected.helperHash, "record after helper hash mismatch", failures);
  pass(record.helper_behavior_changed === false, "helper behavior changed", failures);
  pass(record.route_behavior_changed === false, "route behavior changed", failures);
  pass(JSON.stringify(exports) === JSON.stringify(["POST"]), "route export surface mismatch", failures);
  pass(JSON.stringify(record.route_export_surface) === JSON.stringify(["POST"]), "record route export mismatch", failures);
  pass(record.unsupported_route_helper_exports === 0, "unsupported route helper exports present", failures);

  pass(record.new_candidate_file_count === null, "new file count should not be frozen", failures);
  pass(record.new_change_candidate_hash === null, "new change hash should not be frozen", failures);
  pass(record.new_full_candidate_inventory_hash === null, "new full hash should not be frozen", failures);
  pass(record.new_hashes_authoritative === false, "new hashes incorrectly authoritative", failures);
  pass(record.candidate_hash_freeze_performed === false, "hash freeze performed despite abort", failures);
  pass(record.would_be_changed_file_count_if_route_added === 32, "would-be count mismatch", failures);
  pass(record.exact_path_additions_required_count === 1, "path addition count mismatch", failures);
  pass(record.exact_path_additions_required?.[0] === routePath, "path addition mismatch", failures);
  pass(record.content_replacement_policy_satisfied === false, "replacement policy unexpectedly satisfied", failures);
  pass(
    record.runtime_dependency_closure_status === "not_evaluated_due_preflight_path_set_mismatch",
    "runtime closure status mismatch",
    failures,
  );
  pass(record.route_import_closure_complete === true, "route import closure not complete", failures);
  pass(record.unrelated_dirty_files_included === false, "unrelated dirty files included", failures);
  pass(record.control_only_artifacts_added === false, "control artifacts added", failures);
  pass(record.environment_or_credentials_included === false, "environment or credentials included", failures);
  pass(record.node_modules_included === false, "node_modules included", failures);

  pass(record.candidate_reconstruction_result === "candidate_reconstruction_aborted", "result mismatch", failures);
  pass(
    record.candidate_reconstruction_blocker === "historical_candidate_path_set_missing_remediated_route",
    "blocker mismatch",
    failures,
  );
  pass(record.same_action_repair_reconstruction_performed === false, "same-action repair was performed", failures);
  pass(record.historical_candidate_executable === false, "historical candidate executable", failures);
  pass(record.new_candidate_authoritative_for_future_actions === false, "aborted candidate marked authoritative", failures);
  pass(record.build_performed === false, "build performed", failures);
  pass(record.rehearsal_performed === false, "rehearsal performed", failures);
  pass(record.deployment_performed === false, "deployment performed", failures);
  pass(record.preview_activated === false, "preview activated", failures);
  pass(record.network_used === false, "network used", failures);
  pass(record.install_performed === false, "install performed", failures);
  pass(record.provider_call_executed === false, "provider called", failures);
  pass(record.supabase_read_executed === false, "Supabase read executed", failures);
  pass(record.supabase_write_executed === false, "Supabase write executed", failures);
  pass(record.cleanup_result === "temporary_candidate_not_created_preflight_abort", "cleanup result mismatch", failures);
  pass(record.temporary_candidate_absent_after_cleanup === true, "temporary candidate remains", failures);
  pass(
    record.runtime_preview_state === "runtime_preview_waiting_for_operator_inputs",
    "runtime preview state mismatch",
    failures,
  );
  pass(record.next_action === expected.nextAction, "next action mismatch", failures);

  for (const phrase of [
    "Action 516",
    "candidate_reconstruction_aborted",
    routePath,
    expected.routeHash,
    expected.historicalChangeHash,
    expected.historicalFullHash,
    expected.nextAction,
    "No build",
    "No temporary candidate was created",
  ]) {
    pass(doc.includes(phrase), `doc missing phrase: ${phrase}`, failures);
  }
  pass(!doc.includes("AUTOMATION_SECRET="), "doc contains automation secret assignment", failures);
  pass(!doc.includes("SUPABASE_SERVICE_ROLE_KEY="), "doc contains Supabase secret assignment", failures);
  pass(!doc.includes("TWELVE_DATA_API_KEY="), "doc contains provider secret assignment", failures);
}

const result = {
  verifier:
    "action_516_confidence_calibration_recommendation_advisory_projection_preview_remediated_runtime_complete_candidate_reconstruction_and_hash_freeze",
  verification_status: failures.length === 0 ? "passed" : "failed",
  candidate_reconstruction_result: "candidate_reconstruction_aborted",
  blocker: "historical_candidate_path_set_missing_remediated_route",
  reconstruction_free: true,
  build_free: true,
  rehearsal_free: true,
  deployment_free: true,
  activation_free: true,
  network_free: true,
  install_free: true,
  environment_immutable: true,
  credential_value_free: true,
  failed_conditions: failures,
};

console.log(JSON.stringify(result, null, 2));
if (failures.length > 0) process.exit(1);
