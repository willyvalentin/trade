#!/usr/bin/env node

import { createHash } from "crypto";
import { existsSync, readFileSync } from "fs";
import { dirname, join, posix, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");

const paths = {
  record:
    "docs/action-521-confidence-calibration-recommendation-advisory-projection-preview-action-520-path-safety-checker-remediation-approval-record.json",
  doc:
    "docs/action-521-confidence-calibration-recommendation-advisory-projection-preview-action-520-path-safety-checker-remediation-gate.md",
  action518:
    "docs/action-518-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-record.json",
  action519:
    "docs/action-519-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-build-rehearsal-approval-record.json",
  action520:
    "docs/action-520-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-build-rehearsal-record.json",
  route: "app/api/recommendations/evaluate-outcomes/route.ts",
};

const expected = {
  cleanBase: "15f9923c24ed1f3cf82d34656eeacbfd98a0d347",
  changeHash: "bc43bd1fe8f61561ddededd2263d64f7d12f37db46d184e3bfd0ea55a8b538de",
  fullHash: "80620318166b0b9e1858cff3f12fc78d9ad77d9116655335e1c7fd7e566930b0",
  routeHash: "26407a8b78625a19a48a02ecf44e03db1642998da5f1d8acc5e8d47227773265",
  blocker:
    "action_520_path_safety_checker_failed_to_apply_canonical_macos_temp_alias_equivalence",
  nextAction:
    "action_522_remediated_32_file_candidate_build_rehearsal_retry_after_path_safety_remediation",
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

function expectAllFalse(record, keys, failures) {
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
  const action519 = readJson(paths.action519);
  const action520 = readJson(paths.action520);
  const routeSource = read(paths.route);

  pass(
    record.schema_version ===
      "action_521_action_520_path_safety_checker_remediation_approval_record_v1",
    "schema mismatch",
    failures,
  );
  pass(record.source_action === 520, "source action mismatch", failures);
  pass(action519.approval_decision === "approved", "Action 519 approval mismatch", failures);
  pass(
    action520.candidate_rehearsal_result === "full_candidate_rehearsal_aborted",
    "Action 520 candidate result mismatch",
    failures,
  );
  pass(action520.external_evidence_result === "rehearsal_evidence_verified", "Action 520 evidence mismatch", failures);
  pass(action520.overall_readiness === "blocked", "Action 520 readiness mismatch", failures);
  pass(action520.rehearsal_attempt_count === 1, "Action 520 rehearsal attempt mismatch", failures);
  pass(action520.total_build_process_invocations === 0, "Action 520 build invocation mismatch", failures);
  pass(action520.source_materialized_before_path_safety_passed === false, "Action 520 source materialized", failures);
  pass(action520.dependency_materialization_result === "not_started_path_safety_failed", "Action 520 dependency materialization mismatch", failures);
  pass(action520.authoritative_build_attempt_count === 0, "Action 520 build attempts mismatch", failures);
  pass(action520.webpack_diagnostic_attempt_count === 0, "Action 520 Webpack attempts mismatch", failures);
  pass(action520.cleanup_result === "cleanup_passed_after_corrected_boundary_cleanup", "Action 520 cleanup mismatch", failures);

  pass(record.action_520_candidate_result === "full_candidate_rehearsal_aborted", "record Action 520 result mismatch", failures);
  pass(record.action_520_external_evidence_result === "rehearsal_evidence_verified", "record Action 520 evidence mismatch", failures);
  pass(record.action_520_overall_readiness === "blocked", "record Action 520 readiness mismatch", failures);
  pass(record.action_520_rehearsal_attempt_count === 1, "record Action 520 attempt mismatch", failures);
  pass(record.action_520_build_process_invocations === 0, "record Action 520 invocation mismatch", failures);
  pass(record.blocker_classification === expected.blocker, "blocker classification mismatch", failures);

  pass(record.clean_base_identifier === expected.cleanBase, "clean base mismatch", failures);
  pass(record.change_candidate_hash === expected.changeHash, "change hash mismatch", failures);
  pass(record.full_candidate_inventory_hash === expected.fullHash, "full hash mismatch", failures);
  pass(record.candidate_file_count === 32, "candidate count mismatch", failures);
  pass(action518.new_change_candidate_hash === expected.changeHash, "Action 518 change hash mismatch", failures);
  pass(action518.new_full_candidate_inventory_hash === expected.fullHash, "Action 518 full hash mismatch", failures);
  pass(action518.new_candidate_file_count === 32, "Action 518 count mismatch", failures);
  pass(record.remediated_route_hash === expected.routeHash, "record route hash mismatch", failures);
  pass(sha256(routeSource) === expected.routeHash, "current route hash mismatch", failures);
  pass(JSON.stringify(record.route_export_surface) === JSON.stringify(["POST"]), "record route export mismatch", failures);
  pass(JSON.stringify(routeExports(routeSource)) === JSON.stringify(["POST"]), "current route export mismatch", failures);
  pass(!routeSource.includes("export function buildOutcomeEligibility"), "invalid route helper export present", failures);

  pass(record.shared_path_safety_implementation_required === true, "shared implementation not required", failures);
  pass(
    String(record.shared_path_safety_source_requirement).includes("actions_486_487_489_494_496_498_500_503_505_508_511_514"),
    "shared source requirement mismatch",
    failures,
  );
  pass(record.canonical_root_policy?.compare_only_canonical_roots === true, "canonical compare policy mismatch", failures);
  pass(record.canonical_root_policy?.compare_canonical_to_noncanonical_strings_allowed === false, "mixed canonical compare allowed", failures);
  pass(record.containment_policy?.algorithm === "path_relative_containment", "containment algorithm mismatch", failures);
  pass(record.containment_policy?.string_prefix_only_allowed === false, "string prefix allowed", failures);
  pass(record.containment_policy?.unresolved_prefix_matching_allowed === false, "unresolved prefix allowed", failures);
  pass(record.macos_temp_alias_policy?.var_private_var_equivalence_required === true, "macOS alias policy mismatch", failures);
  pass(record.macos_temp_alias_policy?.arbitrary_user_symlink_alias_allowed === false, "arbitrary symlink alias allowed", failures);
  pass(record.symlink_policy?.reject_target_symlink === true, "target symlink policy mismatch", failures);
  pass(record.symlink_policy?.reject_dangling_target_symlink === true, "dangling symlink policy mismatch", failures);
  pass(record.symlink_policy?.reject_symlink_escape_outside_canonical_temp_root === true, "symlink escape policy mismatch", failures);
  pass(record.forbidden_root_policy?.reject_repository_path === true, "repo forbidden policy mismatch", failures);
  pass(record.forbidden_root_policy?.reject_home_config_path === true, "home/config forbidden policy mismatch", failures);
  pass(record.forbidden_root_policy?.reject_source_node_modules === true, "node_modules forbidden policy mismatch", failures);
  pass(record.forbidden_root_policy?.reject_netlify_path === true, ".netlify forbidden policy mismatch", failures);
  pass(record.forbidden_root_policy?.reject_wrong_action_subtree === true, "wrong action subtree policy mismatch", failures);
  pass(record.forbidden_root_policy?.reject_non_empty_target === true, "non-empty target policy mismatch", failures);

  pass(
    record.future_action_522_path ===
      "ture/action-522-confidence-calibration-projection-preview-remediated-32-file-candidate-rehearsal",
    "future Action 522 path mismatch",
    failures,
  );
  pass(record.future_action_522_path_policy?.exact_action_number === 522, "Action 522 number mismatch", failures);
  pass(record.future_action_522_path_policy?.caller_override_allowed === false, "caller override allowed", failures);
  pass(record.future_action_522_path_policy?.reuse_action_520_subtree_allowed === false, "Action 520 subtree reuse allowed", failures);

  pass(record.creation_sequence?.length === 12, "creation sequence length mismatch", failures);
  pass(record.creation_sequence?.[0] === "derive_trusted_runtime_temp_root", "creation sequence first step mismatch", failures);
  pass(
    record.creation_sequence?.at(-1) === "materialize_source_only_after_all_prior_steps_pass",
    "creation sequence last step mismatch",
    failures,
  );
  pass(record.cleanup_sequence?.length === 7, "cleanup sequence length mismatch", failures);
  pass(record.cleanup_sequence?.[0] === "canonicalize_cleanup_target", "cleanup first step mismatch", failures);
  pass(record.cleanup_sequence?.at(-1) === "verify_target_absent_or_empty", "cleanup last step mismatch", failures);

  const exactSubtree =
    "ture/action-522-confidence-calibration-projection-preview-remediated-32-file-candidate-rehearsal";
  pass(
    isContainedInRoot("/var/folders/example/T", "/private/var/folders/example/T/" + exactSubtree, exactSubtree),
    "macOS temp alias containment should pass",
    failures,
  );
  pass(
    !isContainedInRoot("/private/var/folders/example/T", "/private/var/folders/example/TureSibling", exactSubtree),
    "textual sibling prefix should fail",
    failures,
  );
  pass(
    !isContainedInRoot("/private/var/folders/example/T", "/private/var/folders/example/T/../escape", exactSubtree),
    "traversal should fail",
    failures,
  );
  pass(
    !isContainedInRoot("/private/var/folders/example/T", "/private/var/folders/example/T", exactSubtree),
    "candidate equal root should fail",
    failures,
  );
  pass(
    !isContainedInRoot(
      "/private/var/folders/example/T",
      "/private/var/folders/example/T/ture/action-520-confidence-calibration-projection-preview-remediated-32-file-candidate-rehearsal",
      exactSubtree,
    ),
    "wrong action subtree should fail",
    failures,
  );

  pass(record.test_matrix?.accepted?.length === 6, "accepted test matrix length mismatch", failures);
  pass(record.test_matrix?.rejected?.length === 16, "rejected test matrix length mismatch", failures);
  pass(record.preserved_rehearsal_policy?.action_518_candidate_hashes_preserved === true, "Action 518 policy not preserved", failures);
  pass(record.preserved_rehearsal_policy?.deployment_authorized === false, "preserved deployment policy mismatch", failures);
  pass(record.preserved_rehearsal_policy?.activation_authorized === false, "preserved activation policy mismatch", failures);

  expectAllFalse(
    record,
    [
      "candidate_change_required",
      "candidate_hash_change_required",
      "rehearsal_authorized",
      "deployment_authorized",
      "activation_authorized",
      "reconstruction_performed",
      "build_performed",
      "rehearsal_performed",
      "network_used",
      "install_performed",
      "netlify_operation_performed",
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
  pass(record.path_safety_readiness === "path_safety_remediation_ready", "path readiness mismatch", failures);
  pass(record.approval_decision === "approved", "approval decision mismatch", failures);
  pass(JSON.stringify(record.unresolved_conditions) === JSON.stringify([]), "unresolved conditions mismatch", failures);
  pass(record.runtime_preview_state === "runtime_preview_waiting_for_operator_inputs", "runtime preview state mismatch", failures);
  pass(record.next_action === expected.nextAction, "next action mismatch", failures);

  for (const phrase of [
    "Action 521",
    expected.blocker,
    "/var",
    "/private/var",
    "path.relative",
    "Do not use `startsWith`",
    "Action 522",
    "action_522_remediated_32_file_candidate_build_rehearsal_retry_after_path_safety_remediation",
    "Path-safety readiness: `path_safety_remediation_ready`",
    "Approval decision: `approved`",
    "Runtime preview: `runtime_preview_waiting_for_operator_inputs`",
  ]) {
    pass(doc.includes(phrase), `doc missing phrase: ${phrase}`, failures);
  }
  pass(!/AUTOMATION_SECRET=|SUPABASE_SERVICE_ROLE_KEY=|TWELVE_DATA_API_KEY=/.test(doc), "doc contains secret assignment pattern", failures);
}

const result = {
  verifier:
    "action_521_confidence_calibration_recommendation_advisory_projection_preview_action_520_path_safety_checker_remediation_gate",
  verification_status: failures.length === 0 ? "passed" : "failed",
  path_safety_readiness: failures.length === 0 ? "path_safety_remediation_ready" : "failed",
  approval_decision: failures.length === 0 ? "approved" : "blocked",
  failures,
};

console.log(JSON.stringify(result, null, 2));

if (failures.length > 0) {
  process.exitCode = 1;
}
