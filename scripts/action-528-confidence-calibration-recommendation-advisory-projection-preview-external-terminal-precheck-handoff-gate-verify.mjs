#!/usr/bin/env node

import { createHash } from "crypto";
import { existsSync, readFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");

const paths = {
  record:
    "docs/action-528-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-precheck-handoff-approval-record.json",
  doc:
    "docs/action-528-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-precheck-handoff-gate.md",
  action527:
    "docs/action-527-confidence-calibration-recommendation-advisory-projection-preview-public-build-signal-operator-input-and-alternate-runner-precheck-record.json",
  action529Script:
    "scripts/action-529-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-runner-precheck.mjs",
  action529ResultVerifier:
    "scripts/action-529-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-runner-precheck-result-verify.mjs",
  action529Result:
    "docs/action-529-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-runner-precheck-result.json",
  route: "app/api/recommendations/evaluate-outcomes/route.ts",
  packageJson: "package.json",
};

const expected = {
  cleanBase: "15f9923c24ed1f3cf82d34656eeacbfd98a0d347",
  changeHash: "bc43bd1fe8f61561ddededd2263d64f7d12f37db46d184e3bfd0ea55a8b538de",
  fullHash: "80620318166b0b9e1858cff3f12fc78d9ad77d9116655335e1c7fd7e566930b0",
  routeHash: "26407a8b78625a19a48a02ecf44e03db1642998da5f1d8acc5e8d47227773265",
  blocker: "codex_hosted_runner_not_equivalent_to_approved_unrestricted_local_terminal_boundary",
  command:
    "node scripts/action-529-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-runner-precheck.mjs",
  nextAction: "action_529_external_terminal_runner_precheck_operator_execution",
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

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function pass(condition, message, failures) {
  if (!condition) failures.push(message);
}

function allFalse(record, keys, failures) {
  for (const key of keys) pass(record[key] === false, `${key} must be false`, failures);
}

const failures = [];
for (const [key, requiredPath] of Object.entries(paths)) {
  if (key === "action529Result") continue;
  pass(existsSync(join(repoRoot, requiredPath)), `missing required path: ${requiredPath}`, failures);
}

if (failures.length === 0) {
  const record = readJson(paths.record);
  const action527 = readJson(paths.action527);
  const doc = read(paths.doc);
  const script = read(paths.action529Script);
  const resultVerifier = read(paths.action529ResultVerifier);
  const routeSource = read(paths.route);
  const packageJson = readJson(paths.packageJson);
  const serialized = JSON.stringify(record);

  pass(record.schema_version === "action_528_external_terminal_precheck_handoff_approval_record_v1", "schema mismatch", failures);
  pass(record.source_action === 527, "source action mismatch", failures);
  pass(action527.overall_environment_readiness === "candidate_rehearsal_environment_blocked", "Action 527 readiness mismatch", failures);
  pass(action527.approval_decision === "blocked", "Action 527 approval mismatch", failures);
  pass(record.action_527_overall_environment_readiness === action527.overall_environment_readiness, "Action 527 readiness binding mismatch", failures);
  pass(record.action_527_approval_decision === action527.approval_decision, "Action 527 approval binding mismatch", failures);

  pass(record.clean_base_identifier === expected.cleanBase, "clean base mismatch", failures);
  pass(record.change_candidate_hash === expected.changeHash, "change hash mismatch", failures);
  pass(record.full_candidate_inventory_hash === expected.fullHash, "full inventory hash mismatch", failures);
  pass(record.candidate_file_count === 32, "candidate count mismatch", failures);
  pass(record.remediated_route_hash === expected.routeHash, "route hash mismatch", failures);
  pass(sha256(routeSource) === expected.routeHash, "current route hash mismatch", failures);
  pass(JSON.stringify(record.route_export_surface) === JSON.stringify(["POST"]), "route export mismatch", failures);
  pass(packageJson.scripts?.build === "next build", "package build script changed", failures);

  pass(record.blocker_classification === expected.blocker, "blocker mismatch", failures);
  pass(record.operator_environment_input_attempted === true, "operator input attempted mismatch", failures);
  pass(record.codex_process_detected_input === false, "Codex input detection mismatch", failures);
  pass(record.codex_loopback_capability === "restricted", "Codex loopback mismatch", failures);
  pass(record.codex_ephemeral_port_capability === "restricted", "Codex port mismatch", failures);
  pass(record.codex_ipc_capability === "restricted", "Codex IPC mismatch", failures);
  pass(record.candidate_defect_proven === false, "candidate defect proven mismatch", failures);
  pass(record.candidate_hash_change_required === false, "candidate hash change mismatch", failures);

  pass(record.operator_terminal_boundary === "operator_unrestricted_local_terminal", "operator boundary mismatch", failures);
  pass(record.operator_terminal_required === true, "operator terminal required mismatch", failures);
  pass(record.operator_must_use_macos_terminal === true, "macOS Terminal requirement mismatch", failures);
  pass(record.operator_must_not_use_codex === true, "Codex prohibition mismatch", failures);
  pass(record.operator_must_not_use_vscode_integrated_terminal === true, "VS Code terminal prohibition mismatch", failures);
  pass(record.operator_must_not_pass_arguments === true, "argument prohibition mismatch", failures);
  pass(record.operator_command === expected.command, "operator command mismatch", failures);
  pass(record.script_path === paths.action529Script, "script path mismatch", failures);
  pass(record.result_path === paths.action529Result, "result path mismatch", failures);
  pass(record.result_verifier_path === paths.action529ResultVerifier, "result verifier path mismatch", failures);
  pass(record.action_529_result_exists_now === false, "Action 528 result existence flag mismatch", failures);
  pass(
    isLaterSanitizedAction529ResultAllowed(paths.action529Result),
    "later Action 529 result must be sanitized if present",
    failures,
  );

  for (const policy of [
    "prompt_for_next_public_supabase_url",
    "prompt_for_next_public_supabase_anon_key",
    "reject_non_interactive_stdin",
    "reject_cli_value_arguments",
    "keep_values_process_memory_only",
  ]) {
    pass(record.input_policy.includes(policy), `missing input policy: ${policy}`, failures);
  }
  for (const policy of [
    "raw_values_recorded_false",
    "value_hashes_recorded_false",
    "env_file_written_false",
    "shell_profile_modified_false",
  ]) {
    pass(record.sanitization_policy.includes(policy), `missing sanitization policy: ${policy}`, failures);
  }
  for (const check of [
    "child_process_spawn",
    "loopback_bind",
    "os_assigned_ephemeral_port",
    "local_ipc_or_socket",
    "trusted_temp_directory_creation",
    "cleanup",
  ]) {
    pass(record.capability_check_inventory.includes(check), `missing capability check: ${check}`, failures);
  }

  pass(script.includes("ensureInteractiveTerminal"), "script missing interactive terminal guard", failures);
  pass(script.includes("ensureNoArguments"), "script missing no-arguments guard", failures);
  pass(script.includes("promptHidden"), "script missing hidden prompt", failures);
  pass(script.includes("NEXT_PUBLIC_SUPABASE_URL"), "script missing URL key", failures);
  pass(script.includes("NEXT_PUBLIC_SUPABASE_ANON_KEY"), "script missing anon key", failures);
  pass(script.includes("action-529-confidence-calibration-projection-preview-external-terminal-runner-precheck"), "script missing exact temp identity", failures);
  pass(script.includes("createServer"), "script missing loopback or IPC check", failures);
  pass(script.includes("external_network_used: false"), "script missing no-network result", failures);
  pass(script.includes("supabase_accessed: false"), "script missing no-Supabase result", failures);
  pass(script.includes("build_performed: false"), "script missing no-build result", failures);
  pass(!/execFileSync\([^)]*next\s+build/.test(script), "script must not run Next build", failures);
  pass(!/execFileSync\([^)]*npm[^)]*build/.test(script), "script must not run npm build", failures);
  pass(!script.includes("fetch("), "script must not fetch", failures);
  pass(!script.includes(".env.local"), "script must not read .env.local", failures);
  pass(!script.includes("process.argv[2]"), "script must not read value arguments", failures);

  pass(resultVerifier.includes(paths.action529Result), "result verifier missing exact result path", failures);
  pass(resultVerifier.includes("external_terminal_runner_precheck_passed"), "result verifier missing pass vocabulary", failures);
  pass(resultVerifier.includes("action_530_external_terminal_runner_precheck_evidence_acceptance_gate"), "result verifier missing Action 530 mapping", failures);

  allFalse(
    record,
    [
      "action_529_script_executed_by_action_528",
      "action_529_result_allowed_now",
      "precheck_execution_authorized_by_action_528",
      "build_authorized",
      "rehearsal_authorized",
      "deployment_authorized",
      "activation_authorized",
      "provider_call_authorized",
      "supabase_access_authorized",
      "persistence_authorized",
      "replay_authorized",
      "confidence_application_authorized",
      "feedback_authorized",
      "downstream_behavior_change_authorized",
    ],
    failures,
  );

  pass(record.approval_decision === "approved", "approval decision mismatch", failures);
  pass(record.runtime_preview_state === "runtime_preview_waiting_for_operator_inputs", "runtime preview mismatch", failures);
  pass(record.next_action === expected.nextAction, "next action mismatch", failures);

  for (const phrase of [
    "Action 527",
    expected.blocker,
    expected.changeHash,
    expected.fullHash,
    expected.routeHash,
    paths.action529Script,
    paths.action529Result,
    expected.command,
    "Action 529 script executed by Action 528: `false`",
    expected.nextAction,
    "runtime_preview_waiting_for_operator_inputs",
  ]) {
    pass(doc.includes(phrase), `doc missing phrase: ${phrase}`, failures);
  }

  pass(!/=[A-Za-z0-9+/_.:-]{16,}/.test(doc), "doc may contain assignment-like secret value", failures);
  pass(!/=[A-Za-z0-9+/_.:-]{16,}/.test(serialized), "record may contain assignment-like secret value", failures);
}

const output = {
  verifier:
    "action_528_confidence_calibration_recommendation_advisory_projection_preview_external_terminal_precheck_handoff_gate",
  verification_status: failures.length === 0 ? "passed" : "failed",
  blocker_classification: failures.length === 0 ? expected.blocker : "verification_failed",
  operator_command: expected.command,
  action_529_script_executed: false,
  action_529_result_exists: existsSync(join(repoRoot, paths.action529Result)),
  build_authorized: false,
  rehearsal_authorized: false,
  deployment_authorized: false,
  activation_authorized: false,
  runtime_preview_state: "runtime_preview_waiting_for_operator_inputs",
  next_action: failures.length === 0 ? expected.nextAction : "verification_failed",
  failures,
};

console.log(JSON.stringify(output, null, 2));
if (failures.length > 0) process.exit(1);
