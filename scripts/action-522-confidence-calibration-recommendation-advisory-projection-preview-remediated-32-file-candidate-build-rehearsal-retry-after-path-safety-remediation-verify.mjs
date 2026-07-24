#!/usr/bin/env node

import { createHash } from "crypto";
import { existsSync, readFileSync } from "fs";
import { dirname, join, posix, resolve } from "path";
import { tmpdir } from "os";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");

const paths = {
  record:
    "docs/action-522-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-build-rehearsal-retry-record.json",
  doc:
    "docs/action-522-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-build-rehearsal-retry-after-path-safety-remediation.md",
  action518:
    "docs/action-518-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-record.json",
  action520:
    "docs/action-520-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-build-rehearsal-record.json",
  action521:
    "docs/action-521-confidence-calibration-recommendation-advisory-projection-preview-action-520-path-safety-checker-remediation-approval-record.json",
  route: "app/api/recommendations/evaluate-outcomes/route.ts",
};

const expected = {
  cleanBase: "15f9923c24ed1f3cf82d34656eeacbfd98a0d347",
  changeHash: "bc43bd1fe8f61561ddededd2263d64f7d12f37db46d184e3bfd0ea55a8b538de",
  fullHash: "80620318166b0b9e1858cff3f12fc78d9ad77d9116655335e1c7fd7e566930b0",
  routeHash: "26407a8b78625a19a48a02ecf44e03db1642998da5f1d8acc5e8d47227773265",
  action522Subtree:
    "ture/action-522-confidence-calibration-projection-preview-remediated-32-file-candidate-rehearsal",
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

function canonicalTempPath(path) {
  return posix.normalize(path).replace(/^\/var\//, "/private/var/");
}

function isContainedInRoot(root, candidate, exactSubtree) {
  const canonicalRoot = canonicalTempPath(root);
  const canonicalCandidate = canonicalTempPath(candidate);
  const relative = posix.relative(canonicalRoot, canonicalCandidate);
  return (
    canonicalCandidate !== canonicalRoot &&
    relative !== "" &&
    relative !== ".." &&
    !relative.startsWith("../") &&
    !posix.isAbsolute(relative) &&
    relative === exactSubtree
  );
}

function pass(condition, message, failures) {
  if (!condition) failures.push(message);
}

function allFalse(record, keys, failures) {
  for (const key of keys) {
    pass(record[key] === false, `${key} must be false`, failures);
  }
}

const failures = [];
for (const requiredPath of Object.values(paths)) {
  pass(existsSync(join(repoRoot, requiredPath)), `missing required path: ${requiredPath}`, failures);
}

if (failures.length === 0) {
  const record = readJson(paths.record);
  const doc = read(paths.doc);
  const action518 = readJson(paths.action518);
  const action520 = readJson(paths.action520);
  const action521 = readJson(paths.action521);
  const routeSource = read(paths.route);

  pass(
    record.schema_version ===
      "action_522_remediated_32_file_candidate_build_rehearsal_retry_record_v1",
    "schema mismatch",
    failures,
  );
  pass(record.source_action === 521, "source action mismatch", failures);
  pass(action521.approval_decision === "approved", "Action 521 approval mismatch", failures);
  pass(
    action521.next_action ===
      "action_522_remediated_32_file_candidate_build_rehearsal_retry_after_path_safety_remediation",
    "Action 521 next action mismatch",
    failures,
  );
  pass(action520.candidate_rehearsal_result === "full_candidate_rehearsal_aborted", "Action 520 result mismatch", failures);
  pass(action520.total_build_process_invocations === 0, "Action 520 build invocation mismatch", failures);
  pass(record.action_520_historical_result === "full_candidate_rehearsal_aborted", "record Action 520 result mismatch", failures);
  pass(record.action_520_candidate_source_materialized === false, "record Action 520 source flag mismatch", failures);
  pass(record.action_520_build_process_invocations === 0, "record Action 520 invocation mismatch", failures);

  pass(record.clean_base_identifier === expected.cleanBase, "clean base mismatch", failures);
  pass(record.change_candidate_hash === expected.changeHash, "change hash mismatch", failures);
  pass(record.full_candidate_inventory_hash === expected.fullHash, "full hash mismatch", failures);
  pass(record.candidate_file_count === 32, "candidate count mismatch", failures);
  pass(action518.new_change_candidate_hash === expected.changeHash, "Action 518 change hash mismatch", failures);
  pass(action518.new_full_candidate_inventory_hash === expected.fullHash, "Action 518 full hash mismatch", failures);
  pass(action518.new_candidate_file_count === 32, "Action 518 count mismatch", failures);
  pass(record.remediated_route_path === paths.route, "route path mismatch", failures);
  pass(record.remediated_route_hash === expected.routeHash, "record route hash mismatch", failures);
  pass(sha256(routeSource) === expected.routeHash, "current route hash mismatch", failures);
  pass(JSON.stringify(record.route_export_surface) === JSON.stringify(["POST"]), "record route export mismatch", failures);
  pass(JSON.stringify(routeExports(routeSource)) === JSON.stringify(["POST"]), "current route export mismatch", failures);
  pass(!routeSource.includes("export function buildOutcomeEligibility"), "invalid route helper export present", failures);

  pass(record.safe_temp_subtree === expected.action522Subtree, "temp subtree mismatch", failures);
  pass(record.path_safety_implementation === "shared_canonical_path_safety_semantics", "path implementation mismatch", failures);
  pass(record.macos_temp_alias_equivalence_applied === true, "macOS alias flag mismatch", failures);
  pass(record.path_safety_result === "path_safety_passed", "path safety result mismatch", failures);
  pass(
    isContainedInRoot("/var/folders/example/T", "/private/var/folders/example/T/" + expected.action522Subtree, expected.action522Subtree),
    "macOS temp alias containment should pass",
    failures,
  );
  pass(
    !isContainedInRoot("/private/var/folders/example/T", "/private/var/folders/example/TureSibling", expected.action522Subtree),
    "textual sibling prefix should fail",
    failures,
  );
  pass(
    !isContainedInRoot("/private/var/folders/example/T", "/private/var/folders/example/T/../escape", expected.action522Subtree),
    "traversal should fail",
    failures,
  );
  pass(
    !isContainedInRoot(
      "/private/var/folders/example/T",
      "/private/var/folders/example/T/ture/action-520-confidence-calibration-projection-preview-remediated-32-file-candidate-rehearsal",
      expected.action522Subtree,
    ),
    "wrong action subtree should fail",
    failures,
  );

  pass(record.source_reconstruction_result === "exact_32_file_candidate_reconstructed", "source reconstruction mismatch", failures);
  pass(record.runtime_dependency_closure_result === "runtime_dependency_closure_passed", "runtime closure mismatch", failures);
  pass(record.source_integrity_result === "source_integrity_passed", "source integrity mismatch", failures);
  pass(record.source_safety_result === "source_safety_passed", "source safety mismatch", failures);
  pass(record.preview_flag_verification_result === "preview_flag_disabled_verified", "preview flag mismatch", failures);
  pass(record.dependency_materialization_result === "dependency_materialization_passed", "dependency materialization mismatch", failures);

  const prebuild = new Map(record.prebuild_command_results.map((item) => [item.name, item]));
  for (const name of [
    "candidate_integrity_confirmation",
    "strict_source_safety_hash_matrix",
    "semantic_preview_flag_matrix",
    "next_typegen",
    "typescript_no_emit",
  ]) {
    pass(prebuild.get(name)?.result === "passed", `prebuild command did not pass: ${name}`, failures);
  }
  pass(prebuild.get("next_typegen")?.exit_code === 0, "next typegen exit mismatch", failures);
  pass(prebuild.get("typescript_no_emit")?.exit_code === 0, "tsc exit mismatch", failures);

  pass(record.authoritative_build_command === "npm run build", "authoritative command mismatch", failures);
  pass(record.authoritative_build_attempt_count === 1, "authoritative attempt mismatch", failures);
  pass(record.authoritative_build_result === "failed", "authoritative build result mismatch", failures);
  pass(record.authoritative_build_phase === "next_build_failed", "authoritative phase mismatch", failures);
  pass(record.authoritative_error_class === "turbopack_or_next_build_failure", "authoritative error class mismatch", failures);
  pass(String(record.authoritative_build_summary).includes("Turbopack"), "authoritative summary missing Turbopack", failures);
  pass(record.webpack_diagnostic_attempt_count === 1, "Webpack attempt mismatch", failures);
  pass(record.webpack_diagnostic_result === "webpack_diagnostic_failure_captured", "Webpack result mismatch", failures);
  pass(record.webpack_diagnostic_cannot_establish_readiness === true, "Webpack readiness warning mismatch", failures);
  pass(record.webpack_first_causal_error?.error_class === "webpack_build_failure", "Webpack causal class mismatch", failures);
  pass(String(record.webpack_first_causal_error?.sanitized_summary).includes("Supabase"), "Webpack summary mismatch", failures);
  pass(record.total_build_process_invocations === 2, "total build process mismatch", failures);
  pass(record.second_authoritative_build === false, "second build flag mismatch", failures);
  pass(record.same_action_command_retry === false, "command retry flag mismatch", failures);
  pass(record.same_action_source_repair === false, "source repair flag mismatch", failures);
  pass(Array.isArray(record.candidate_command_results) && record.candidate_command_results.length === 0, "candidate command results should be empty", failures);
  pass(record.remaining_candidate_commands_result === "skipped_after_authoritative_build_failure", "remaining command state mismatch", failures);
  pass(record.runtime_projection_call_site_count === null, "call-site count should be null", failures);

  pass(record.rehearsal_retry_count === 1, "rehearsal retry count mismatch", failures);
  pass(record.candidate_rehearsal_result === "full_candidate_rehearsal_failed", "candidate result mismatch", failures);
  pass(record.external_evidence_result === "rehearsal_evidence_verified", "external evidence mismatch", failures);
  pass(record.overall_readiness === "blocked", "overall readiness mismatch", failures);
  pass(record.cleanup_result === "cleanup_passed", "cleanup mismatch", failures);
  pass(record.target_absent_after_cleanup === true, "cleanup target absence mismatch", failures);
  pass(
    !existsSync(join(canonicalTempPath(tmpdir()), expected.action522Subtree)),
    "Action 522 temp subtree should be absent after cleanup",
    failures,
  );

  allFalse(
    record,
    [
      "raw_logs_retained",
      "raw_environment_values_recorded",
      "credential_values_recorded",
      "absolute_machine_paths_recorded",
      "candidate_modified",
      "package_or_lockfile_modified",
      "configuration_modified",
      "source_dependency_tree_modified",
      "active_worktree_modified",
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
      "downstream_behavior_changed",
    ],
    failures,
  );
  pass(record.runtime_preview_state === "runtime_preview_waiting_for_operator_inputs", "runtime preview state mismatch", failures);
  pass(record.next_action === "action_523_candidate_build_failure_diagnosis_or_remediation_gate", "next action mismatch", failures);

  for (const phrase of [
    "Action 522",
    expected.changeHash,
    expected.fullHash,
    expected.routeHash,
    "path_safety_passed",
    "npx next typegen",
    "npx tsc --noEmit",
    "npm run build",
    "authoritative build failed",
    "webpack_diagnostic_failure_captured",
    "cannot establish readiness",
    "full_candidate_rehearsal_failed",
    "overall readiness: `blocked`",
    "action_523_candidate_build_failure_diagnosis_or_remediation_gate",
  ]) {
    pass(doc.includes(phrase), `doc missing phrase: ${phrase}`, failures);
  }
  pass(!/AUTOMATION_SECRET=|SUPABASE_SERVICE_ROLE_KEY=|TWELVE_DATA_API_KEY=/.test(doc), "doc contains secret assignment pattern", failures);
  pass(!/AUTOMATION_SECRET=|SUPABASE_SERVICE_ROLE_KEY=|TWELVE_DATA_API_KEY=/.test(JSON.stringify(record)), "record contains secret assignment pattern", failures);
}

const result = {
  verifier:
    "action_522_confidence_calibration_recommendation_advisory_projection_preview_remediated_32_file_candidate_build_rehearsal_retry_after_path_safety_remediation",
  verification_status: failures.length === 0 ? "passed" : "failed",
  candidate_rehearsal_result:
    failures.length === 0 ? "full_candidate_rehearsal_failed" : "verification_failed",
  authoritative_build_result: failures.length === 0 ? "failed" : "verification_failed",
  overall_readiness: failures.length === 0 ? "blocked" : "verification_failed",
  next_action:
    failures.length === 0
      ? "action_523_candidate_build_failure_diagnosis_or_remediation_gate"
      : "verification_failed",
  failures,
};

console.log(JSON.stringify(result, null, 2));

if (failures.length > 0) {
  process.exitCode = 1;
}
