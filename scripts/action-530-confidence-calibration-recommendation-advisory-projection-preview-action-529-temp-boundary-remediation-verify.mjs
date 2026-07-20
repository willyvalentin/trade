#!/usr/bin/env node

import { existsSync, readFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");

const paths = {
  record:
    "docs/action-530-confidence-calibration-recommendation-advisory-projection-preview-action-529-temp-boundary-remediation-record.json",
  doc:
    "docs/action-530-confidence-calibration-recommendation-advisory-projection-preview-action-529-temp-boundary-remediation.md",
  action529Script:
    "scripts/action-529-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-runner-precheck.mjs",
  action529Result:
    "docs/action-529-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-runner-precheck-result.json",
};

const expected = {
  cleanBase: "15f9923c24ed1f3cf82d34656eeacbfd98a0d347",
  changeHash: "bc43bd1fe8f61561ddededd2263d64f7d12f37db46d184e3bfd0ea55a8b538de",
  fullHash: "80620318166b0b9e1858cff3f12fc78d9ad77d9116655335e1c7fd7e566930b0",
  routeHash: "26407a8b78625a19a48a02ecf44e03db1642998da5f1d8acc5e8d47227773265",
  blocker: "action_529_temp_boundary_canonical_alias_misclassified_as_traversal",
  result: "action_529_temp_boundary_remediation_completed",
  nextAction: "action_529_external_terminal_runner_precheck_operator_retry",
  retryCommand:
    "node scripts/action-529-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-runner-precheck.mjs",
};

function isLaterSanitizedAction529ResultAllowed(relativePath) {
  const absolutePath = join(repoRoot, relativePath);
  if (!existsSync(absolutePath)) return true;
  const result = JSON.parse(readFileSync(absolutePath, "utf8"));
  return (
    result.schema_version === "action_529_external_terminal_runner_precheck_result_v1" &&
    result.execution_boundary === "operator_unrestricted_local_terminal" &&
    ["external_terminal_runner_precheck_passed", "external_terminal_runner_precheck_blocked"].includes(
      result.precheck_result,
    ) &&
    result.raw_environment_values_recorded === false &&
    result.environment_values_hashed === false &&
    result.external_network_used === false &&
    result.supabase_accessed === false &&
    result.provider_called === false &&
    result.build_performed === false &&
    result.candidate_reconstructed === false &&
    result.rehearsal_performed === false &&
    result.deployment_performed === false &&
    result.preview_activated === false
  );
}

function read(relativePath) {
  return readFileSync(join(repoRoot, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

function pass(condition, message, failures) {
  if (!condition) failures.push(message);
}

function allTrue(record, keys, failures) {
  for (const key of keys) pass(record[key] === true, `${key} must be true`, failures);
}

function allFalse(record, keys, failures) {
  for (const key of keys) pass(record[key] === false, `${key} must be false`, failures);
}

function noSecretLikeAssignment(text) {
  return !/(SUPABASE|SECRET|TOKEN|PASSWORD|KEY)\s*[:=]\s*["']?[A-Za-z0-9._~+/=-]{20,}/i.test(text);
}

const failures = [];
for (const [key, requiredPath] of Object.entries(paths)) {
  if (key === "action529Result") continue;
  pass(existsSync(join(repoRoot, requiredPath)), `missing required path: ${requiredPath}`, failures);
}

if (failures.length === 0) {
  const record = readJson(paths.record);
  const doc = read(paths.doc);
  const action529 = read(paths.action529Script);
  const serializedRecord = JSON.stringify(record);

  pass(record.schema_version === "action_530_action_529_temp_boundary_remediation_record_v1", "schema mismatch", failures);
  pass(record.source_action === 529, "source action mismatch", failures);
  pass(record.clean_base_identifier === expected.cleanBase, "clean base mismatch", failures);
  pass(record.change_candidate_hash === expected.changeHash, "change candidate hash mismatch", failures);
  pass(record.full_candidate_inventory_hash === expected.fullHash, "full inventory hash mismatch", failures);
  pass(record.candidate_file_count === 32, "candidate file count mismatch", failures);
  pass(record.remediated_route_hash === expected.routeHash, "route hash mismatch", failures);
  pass(record.action_529_script_path === paths.action529Script, "Action 529 script path mismatch", failures);
  pass(record.action_529_operator_command_executed === true, "operator command execution evidence mismatch", failures);
  pass(record.action_529_operator_attempt_result === "external_terminal_runner_precheck_blocked", "operator result mismatch", failures);
  pass(record.operator_message_classification === "temp_boundary_traversal_rejected", "operator message classification mismatch", failures);
  pass(record.blocker_classification === expected.blocker, "blocker classification mismatch", failures);
  pass(record.remediation_result === expected.result, "remediation result mismatch", failures);
  pass(record.runtime_preview_state === "runtime_preview_waiting_for_operator_inputs", "runtime preview state mismatch", failures);
  pass(record.next_action === expected.nextAction, "next action mismatch", failures);

  allFalse(
    record,
    [
      "candidate_reconstructed",
      "candidate_change_required",
      "candidate_hash_change_required",
      "action_529_script_executed_by_action_530",
      "build_performed",
      "rehearsal_performed",
      "deployment_performed",
      "preview_activated",
      "provider_called",
      "supabase_accessed",
      "persistence_created",
      "replay_created",
      "confidence_applied",
      "feedback_created",
      "downstream_behavior_changed",
    ],
    failures,
  );

  allTrue(
    record,
    [
      "symlink_protections_preserved",
      "forbidden_root_protections_preserved",
      "exact_action_subtree_preserved",
      "input_policy_preserved",
      "sanitization_policy_preserved",
      "result_schema_preserved",
      "operator_retry_authorized",
    ],
    failures,
  );

  const algorithm = record.path_algorithm_audit ?? {};
  for (const key of [
    "os_tmpdir_obtained",
    "trusted_root_canonicalized",
    "trusted_ture_parent_derived_from_canonical_root",
    "target_parent_canonicalized",
    "fixed_target_derived_from_canonical_parent",
    "created_target_canonicalized",
    "canonical_paths_compared_only",
    "path_relative_containment_used",
    "macos_temp_alias_supported",
  ]) {
    pass(algorithm[key] === true, `path algorithm ${key} must be true`, failures);
  }
  pass(algorithm.string_prefix_used === false, "string prefix must not be used", failures);
  pass(algorithm.raw_var_private_var_compared_directly === false, "raw /var alias must not be compared directly", failures);

  const traversal = record.traversal_policy ?? {};
  for (const key of [
    "relative_equal_dotdot_rejected",
    "relative_begins_dotdot_separator_rejected",
    "absolute_escape_rejected",
    "sibling_prefix_rejected",
    "wrong_action_number_rejected",
    "caller_provided_target_rejected",
    "environment_override_rejected",
    "cli_path_argument_rejected",
    "stdin_path_override_rejected",
  ]) {
    pass(traversal[key] === true, `traversal policy ${key} must be true`, failures);
  }
  pass(traversal.raw_var_to_private_var_alias_rejected === false, "canonical /var alias must be accepted", failures);

  pass(record.operator_retry_limit === 1, "operator retry limit mismatch", failures);
  pass(record.operator_retry_command === expected.retryCommand, "operator retry command mismatch", failures);

  pass(action529.includes("export function isCanonicalTraversalOrEscape"), "Action 529 missing traversal helper export", failures);
  pass(action529.includes("export function isExactAction529TempTarget"), "Action 529 missing exact target helper export", failures);
  pass(action529.includes("export function assertAction529TempPathSafety"), "Action 529 missing safety helper export", failures);
  pass(action529.includes("realpathSync(tmpdir())"), "Action 529 must canonicalize trusted temp root", failures);
  pass(action529.includes('join(canonicalTrustedRoot, "ture")'), "Action 529 must derive parent from canonical root", failures);
  pass(action529.includes("realpathSync(canonicalTureParent)"), "Action 529 must canonicalize parent", failures);
  pass(action529.includes("join(canonicalParent, tempIdentity)"), "Action 529 must derive target from canonical parent", failures);
  pass(action529.includes("realpathSync(canonicalTarget)"), "Action 529 must canonicalize created target", failures);
  pass(action529.includes("relative(canonicalRoot, canonicalChild)"), "Action 529 must use path.relative containment", failures);
  pass(action529.includes("pathToFileURL(resolve(process.argv[1])).href"), "Action 529 must guard main when imported", failures);
  pass(action529.includes("rejectSymlinkIfPresent"), "Action 529 must preserve symlink rejection", failures);
  pass(action529.includes("ensureNoArguments"), "Action 529 must preserve CLI argument rejection", failures);
  pass(action529.includes("ensureInteractiveTerminal"), "Action 529 must preserve interactive terminal requirement", failures);
  pass(action529.includes("raw_environment_values_recorded: false"), "Action 529 must preserve sanitized result schema", failures);
  pass(action529.includes("environment_values_hashed: false"), "Action 529 must preserve no-hash policy", failures);
  pass(action529.includes("env_file_written: false"), "Action 529 must preserve no-env-write policy", failures);
  pass(action529.includes("external_network_used: false"), "Action 529 must preserve no-network result", failures);
  pass(!action529.includes(".env.local"), "Action 529 must not read env files", failures);
  pass(!action529.includes("fetch("), "Action 529 must not call network", failures);
  pass(!/execFileSync\([^)]*next\s+build/.test(action529), "Action 529 must not run Next build", failures);
  pass(!/execFileSync\([^)]*npm[^)]*build/.test(action529), "Action 529 must not run npm build", failures);
  pass(!action529.includes("process.argv[2]"), "Action 529 must not read path/value CLI overrides", failures);

  pass(doc.includes(expected.blocker), "doc missing blocker classification", failures);
  pass(doc.includes("It no longer compares `/private/var/...` against raw `/var/...`."), "doc missing macOS alias remediation", failures);
  pass(doc.includes("Operator retry limit: `1`"), "doc missing retry limit", failures);
  pass(doc.includes(expected.retryCommand), "doc missing exact retry command", failures);
  pass(doc.includes("Action 530 does not execute the retry."), "doc missing non-execution statement", failures);
  pass(doc.includes("Runtime preview state:"), "doc missing runtime preview state", failures);
  pass(serializedRecord.includes(expected.nextAction), "record missing next action", failures);
  pass(
    isLaterSanitizedAction529ResultAllowed(paths.action529Result),
    "later Action 529 result must be sanitized if present",
    failures,
  );
  pass(noSecretLikeAssignment(doc), "doc appears to contain secret-like assignment", failures);
  pass(noSecretLikeAssignment(serializedRecord), "record appears to contain secret-like assignment", failures);
}

const result = {
  action: 530,
  verification_status: failures.length === 0 ? "passed" : "failed",
  remediation_result: failures.length === 0 ? expected.result : "action_529_temp_boundary_remediation_verification_failed",
  action_529_script_executed_by_action_530: false,
  build_performed: false,
  rehearsal_performed: false,
  deployment_performed: false,
  preview_activated: false,
  provider_called: false,
  supabase_accessed: false,
  persistence_created: false,
  replay_created: false,
  confidence_applied: false,
  feedback_created: false,
  next_action: expected.nextAction,
  failures,
};

console.log(JSON.stringify(result, null, 2));
if (failures.length > 0) process.exit(1);
