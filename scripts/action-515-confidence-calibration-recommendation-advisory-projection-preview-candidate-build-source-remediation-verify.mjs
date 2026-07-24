#!/usr/bin/env node

import { existsSync, readFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { createHash } from "crypto";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");

const recordPath =
  "docs/action-515-confidence-calibration-recommendation-advisory-projection-preview-candidate-build-source-remediation-record.json";
const docPath =
  "docs/action-515-confidence-calibration-recommendation-advisory-projection-preview-candidate-build-source-remediation.md";
const action514Path =
  "docs/action-514-confidence-calibration-recommendation-advisory-projection-preview-webpack-build-failure-bounded-diagnostic-retry-record.json";
const routePath = "app/api/recommendations/evaluate-outcomes/route.ts";

const expected = {
  cleanBase: "15f9923c24ed1f3cf82d34656eeacbfd98a0d347",
  changeHash: "c005946d3a21df32730306687d125ef1ba4439500da7ec22288ec92d802d667c",
  fullHash: "d96af34b0c488ef16f614b2be731052c2099e0b6efde57f76115eb8d5c779a0f",
  helperHash: "8b3e4694f83003104ec764f3afa81c4f1e9b87543b3241e4785dd6bdd3d32afe",
  nextAction: "action_516_remediated_runtime_complete_candidate_reconstruction_and_hash_freeze",
};

function read(relativePath) {
  return readFileSync(join(repoRoot, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

function failUnless(condition, message, failures) {
  if (!condition) failures.push(message);
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
      if (seenBody && depth === 0) {
        return source.slice(start, index + 1);
      }
    }
  }
  return null;
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

const failures = [];
for (const relativePath of [recordPath, docPath, action514Path, routePath]) {
  failUnless(existsSync(join(repoRoot, relativePath)), `missing file: ${relativePath}`, failures);
}

let record = null;
if (failures.length === 0) {
  record = readJson(recordPath);
  const action514 = readJson(action514Path);
  const doc = read(docPath);
  const routeSource = read(routePath);
  const helperBody = extractHelperBody(routeSource);
  const routeExportMatches = Array.from(
    routeSource.matchAll(/^export\s+(?:async\s+)?function\s+([A-Za-z0-9_]+)/gm),
  ).map((match) => match[1]);

  failUnless(action514.diagnostic_result === "webpack_diagnostic_failure_captured", "Action 514 result mismatch", failures);
  failUnless(action514.candidate_vs_runner_classification === "candidate_source_build_defect", "Action 514 defect mismatch", failures);
  failUnless(action514.first_causal_error.module_reference === "buildOutcomeEligibility", "Action 514 invalid export mismatch", failures);

  failUnless(record.schema_version === "action_515_candidate_build_source_remediation_record_v1", "schema mismatch", failures);
  failUnless(record.source_action === 514, "source action mismatch", failures);
  failUnless(record.diagnostic_result === "webpack_diagnostic_failure_captured", "diagnostic result mismatch", failures);
  failUnless(record.defect_classification === "candidate_source_build_defect", "defect classification mismatch", failures);
  failUnless(record.implicated_path === routePath, "implicated path mismatch", failures);
  failUnless(record.invalid_route_export === "buildOutcomeEligibility", "invalid export mismatch", failures);
  failUnless(record.historical_clean_base_identifier === expected.cleanBase, "clean base mismatch", failures);
  failUnless(record.historical_change_candidate_hash === expected.changeHash, "change hash mismatch", failures);
  failUnless(record.historical_full_candidate_inventory_hash === expected.fullHash, "full hash mismatch", failures);
  failUnless(record.historical_candidate_file_count === 31, "candidate count mismatch", failures);
  failUnless(record.historical_candidate_status === "historical_candidate_build_defective", "historical status mismatch", failures);

  failUnless(record.external_runtime_imports_found === false, "external runtime imports found", failures);
  failUnless(record.external_test_imports_requiring_export_found === false, "external test import mismatch", failures);
  failUnless(record.remediation_strategy === "make_route_helper_module_private", "remediation strategy mismatch", failures);
  failUnless(record.helper_extracted === false, "helper extraction mismatch", failures);
  failUnless(record.new_helper_path === null, "new helper path mismatch", failures);
  failUnless(record.invalid_route_export_removed === true, "invalid export should be removed", failures);
  failUnless(record.route_export_surface_after.length === 1 && record.route_export_surface_after[0] === "POST", "route export surface mismatch", failures);

  failUnless(!routeSource.includes("export function buildOutcomeEligibility"), "route still exports helper", failures);
  failUnless(routeSource.includes("function buildOutcomeEligibility"), "route helper missing", failures);
  failUnless(routeExportMatches.length === 1 && routeExportMatches[0] === "POST", "actual route exports mismatch", failures);
  failUnless(helperBody !== null && sha256(helperBody) === expected.helperHash, "helper body hash mismatch", failures);
  failUnless(record.helper_body_sha256_before === expected.helperHash, "record before helper hash mismatch", failures);
  failUnless(record.helper_body_sha256_after === expected.helperHash, "record after helper hash mismatch", failures);
  failUnless(record.helper_body_equivalent === true, "helper equivalence mismatch", failures);

  for (const key of [
    "helper_behavior_changed",
    "route_behavior_changed",
    "api_request_response_semantics_changed",
    "provider_behavior_changed",
    "supabase_behavior_changed",
    "outcome_learning_behavior_changed",
    "downstream_behavior_changed",
    "package_or_lockfile_modified",
    "configuration_modified",
    "environment_modified",
    "deployment_performed",
    "preview_activated",
    "production_changed",
    "provider_called",
    "supabase_accessed",
    "persistence_created",
    "replay_created",
    "feedback_created",
    "confidence_applied",
  ]) {
    failUnless(record[key] === false, `${key} should be false`, failures);
  }

  failUnless(record.source_files_changed.length === 1 && record.source_files_changed[0] === routePath, "source changed file set mismatch", failures);
  failUnless(record.candidate_hash_change_required === true, "hash change requirement mismatch", failures);
  failUnless(record.new_candidate_hash_computed === false, "new candidate hash should not be computed", failures);
  failUnless(record.remediation_result === "candidate_build_source_remediation_completed", "remediation result mismatch", failures);
  failUnless(record.runtime_preview_state === "runtime_preview_waiting_for_operator_inputs", "runtime preview mismatch", failures);
  failUnless(record.next_action === expected.nextAction, "next action mismatch", failures);

  for (const phrase of [
    "Invalid route export: `buildOutcomeEligibility`",
    "Strategy: `make_route_helper_module_private`",
    "Helper behavior changed: `false`",
    "Candidate hash change required: `true`",
    expected.nextAction,
  ]) {
    failUnless(doc.includes(phrase), `doc missing phrase: ${phrase}`, failures);
  }
}

const report = {
  verifier:
    "action_515_confidence_calibration_recommendation_advisory_projection_preview_candidate_build_source_remediation",
  verification_status: failures.length === 0 ? "passed" : "failed",
  remediation_strategy: record?.remediation_strategy ?? null,
  invalid_route_export_removed: record?.invalid_route_export_removed ?? null,
  helper_behavior_changed: record?.helper_behavior_changed ?? null,
  route_behavior_changed: record?.route_behavior_changed ?? null,
  candidate_hash_change_required: record?.candidate_hash_change_required ?? null,
  remediation_result: record?.remediation_result ?? null,
  deployment_free: true,
  activation_free: true,
  credential_value_free: true,
  next_action: record?.next_action ?? null,
  failed_conditions: failures,
};

console.log(JSON.stringify(report, null, 2));
process.exit(failures.length === 0 ? 0 : 1);
