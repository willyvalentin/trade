#!/usr/bin/env node

import { createHash } from "crypto";
import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");

const paths = {
  record:
    "docs/action-537-confidence-calibration-recommendation-advisory-projection-preview-action-534-runner-remediation-application-audit-record.json",
  doc:
    "docs/action-537-confidence-calibration-recommendation-advisory-projection-preview-action-534-runner-remediation-application-audit.md",
  action534Result:
    "docs/action-534-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-candidate-rehearsal-result.json",
  action534Script:
    "scripts/action-534-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-candidate-rehearsal.mjs",
  action534ResultVerifier:
    "scripts/action-534-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-candidate-rehearsal-result-verify.mjs",
  action533Verifier:
    "scripts/action-533-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-candidate-rehearsal-handoff-gate-verify.mjs",
  action535Verifier:
    "scripts/action-535-confidence-calibration-recommendation-advisory-projection-preview-action-534-historical-candidate-inventory-hash-exception-remediation-verify.mjs",
  action536Verifier:
    "scripts/action-536-confidence-calibration-recommendation-advisory-projection-preview-action-534-command-boundary-remediation-verify.mjs",
  action518Record:
    "docs/action-518-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-record.json",
};

const expected = {
  runnerContractVersion: "action_537_action_534_runner_contract_v1",
  runnerHash: "85233263aa79afd1a3b1cf29f8d30e9ba0f54a13a4dddfb07e074cdb68bc6554",
  observedClassification: "action_536_remediation_not_reflected_in_operator_executed_action_534_behavior",
  rootCause:
    "operator_executed_unfingerprinted_or_stale_action_534_runner_before_action_537_contract_binding",
  remediationResult: "action_534_runner_remediation_application_completed",
  nextAction: "action_534_external_terminal_candidate_rehearsal_operator_retry_after_runner_remediation_application_audit",
  action518:
    "scripts/action-518-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-reconstruction-and-hash-freeze-verify.mjs",
  action532:
    "scripts/action-532-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-runner-precheck-evidence-acceptance-gate-verify.mjs",
  action533:
    "scripts/action-533-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-candidate-rehearsal-handoff-gate-verify.mjs",
  action535:
    "scripts/action-535-confidence-calibration-recommendation-advisory-projection-preview-action-534-historical-candidate-inventory-hash-exception-remediation-verify.mjs",
  action536:
    "scripts/action-536-confidence-calibration-recommendation-advisory-projection-preview-action-534-command-boundary-remediation-verify.mjs",
  cleanBase: "15f9923c24ed1f3cf82d34656eeacbfd98a0d347",
  changeHash: "bc43bd1fe8f61561ddededd2263d64f7d12f37db46d184e3bfd0ea55a8b538de",
  fullHash: "80620318166b0b9e1858cff3f12fc78d9ad77d9116655335e1c7fd7e566930b0",
  routeHash: "26407a8b78625a19a48a02ecf44e03db1642998da5f1d8acc5e8d47227773265",
};

function pass(condition, message, failures) {
  if (!condition) failures.push(message);
}

function read(relativePath) {
  return readFileSync(join(repoRoot, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

function sha256File(relativePath) {
  return createHash("sha256").update(read(relativePath)).digest("hex");
}

function runStaticVerifier(relativePath, failures) {
  try {
    execFileSync("node", [relativePath], {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch {
    failures.push(`static verifier failed: ${relativePath}`);
  }
}

function commandStatus(results, commandPath) {
  return (Array.isArray(results) ? results : []).find(
    (entry) => typeof entry?.command === "string" && entry.command.includes(commandPath),
  )?.status;
}

function isUnfingerprintedAttempt3(result) {
  return (
    result.runner_contract_version === undefined &&
    result.runner_script_sha256 === undefined &&
    result.operator_rehearsal_attempt_number === 3 &&
    result.historical_operator_attempt_count === 2
  );
}

function isFingerprintedAttempt4(result) {
  return (
    result.runner_contract_version === expected.runnerContractVersion &&
    result.runner_script_sha256 === expected.runnerHash &&
    result.operator_rehearsal_attempt_number === 4 &&
    result.historical_operator_attempt_count === 3
  );
}

function extractFunctionBody(source, functionName) {
  const start = source.indexOf(`function ${functionName}`);
  if (start < 0) return "";
  const open = source.indexOf("{", start);
  let depth = 0;
  for (let index = open; index < source.length; index += 1) {
    const char = source[index];
    if (char === "{") depth += 1;
    if (char === "}") depth -= 1;
    if (depth === 0) return source.slice(open + 1, index);
  }
  return "";
}

function verifyAction537() {
  const failures = [];
  for (const requiredPath of Object.values(paths)) {
    pass(existsSync(join(repoRoot, requiredPath)), `missing required path: ${requiredPath}`, failures);
  }

  runStaticVerifier(paths.action534ResultVerifier, failures);
  runStaticVerifier(paths.action533Verifier, failures);
  runStaticVerifier(paths.action535Verifier, failures);
  runStaticVerifier(paths.action536Verifier, failures);

  if (failures.length === 0) {
    const record = readJson(paths.record);
    const result = readJson(paths.action534Result);
    const action518Record = readJson(paths.action518Record);
    const doc = read(paths.doc);
    const script = read(paths.action534Script);
    const resultVerifier = read(paths.action534ResultVerifier);
    const scriptHash = sha256File(paths.action534Script);
    const runSerialBody = extractFunctionBody(script, "runSerialCommands");
    const externalBody = extractFunctionBody(script, "runExternalControlCommands");
    const writeResultBody = extractFunctionBody(script, "writeResult");
    const candidatePaths = new Set((action518Record.new_changed_file_inventory ?? []).map((entry) => entry.path));

    pass(record.schema_version === "action_537_action_534_runner_remediation_application_audit_record_v1", "record schema mismatch", failures);
    pass(record.source_action === 536, "source action mismatch", failures);
    pass(record.observed_result_classification === expected.observedClassification, "observed classification mismatch", failures);
    pass(record.root_cause_classification === expected.rootCause, "root cause mismatch", failures);
    pass(record.current_runner_script_sha256 === scriptHash, "runner hash mismatch", failures);
    pass(record.runner_contract_version === expected.runnerContractVersion, "runner contract mismatch", failures);
    pass(record.current_local_result_classification === "unfingerprinted_action_536_style_attempt_3_result_observed_locally", "local result classification mismatch", failures);
    pass(record.legacy_candidate_internal_control_invocations_found === true, "legacy invocation audit mismatch", failures);
    pass(record.legacy_candidate_internal_control_invocations_found_in_current_runner === false, "current runner legacy invocation mismatch", failures);
    pass(record.duplicate_command_inventory_found === false, "duplicate command inventory mismatch", failures);
    pass(record.hardcoded_attempt_number_found === false, "hardcoded attempt audit mismatch", failures);
    pass(record.stale_result_merge_found === false, "stale merge audit mismatch", failures);
    pass(record.result_freshness_classification === "result_freshness_ambiguous", "freshness classification mismatch", failures);
    pass(record.active_runtime_command_source_count === 1, "active command source count mismatch", failures);
    pass(record.active_attempt_accounting_source_count === 1, "active attempt source count mismatch", failures);
    pass(record.atomic_result_replacement_enabled === true, "atomic replacement record mismatch", failures);
    pass(record.fresh_result_object_required === true, "fresh object record mismatch", failures);
    pass(record.prior_command_results_reused === false, "prior command reuse record mismatch", failures);
    pass(record.action_518_control_boundary === "external_after_cleanup", "Action 518 boundary mismatch", failures);
    pass(record.action_532_control_boundary === "external_after_cleanup", "Action 532 boundary mismatch", failures);
    pass(record.candidate_change_required === false, "candidate change mismatch", failures);
    pass(record.candidate_hash_change_required === false, "candidate hash mismatch", failures);
    pass(record.historical_operator_attempt_count === 3, "historical attempt count mismatch", failures);
    pass(record.operator_invocation_count === 3, "operator invocation mismatch", failures);
    pass(record.valid_runner_attempt_count === 2, "valid runner count mismatch", failures);
    pass(record.next_operator_attempt_number === 4, "next attempt mismatch", failures);
    pass(record.operator_retry_authorized === true, "retry authorization mismatch", failures);
    pass(record.operator_retry_limit === 1, "retry limit mismatch", failures);
    pass(record.remediation_result === expected.remediationResult, "remediation result mismatch", failures);
    pass(record.runtime_preview_state === "runtime_preview_waiting_for_operator_inputs", "runtime preview mismatch", failures);
    pass(record.next_action === expected.nextAction, "next action mismatch", failures);

    pass(result.schema_version === "action_534_external_terminal_candidate_rehearsal_result_v1", "Action 534 result schema mismatch", failures);
    pass(result.candidate_rehearsal_result === "external_terminal_candidate_rehearsal_failed", "Action 534 result status mismatch", failures);
    pass(isUnfingerprintedAttempt3(result) || isFingerprintedAttempt4(result), "current local result attempt/fingerprint mismatch", failures);
    pass(result.authoritative_build_attempt_count === 1, "current local build count mismatch", failures);
    pass(commandStatus(result.candidate_internal_command_results, expected.action518) === undefined, "Action 518 candidate-internal in current local result", failures);
    pass(commandStatus(result.candidate_internal_command_results, expected.action532) === undefined, "Action 532 candidate-internal in current local result", failures);
    pass(commandStatus(result.candidate_internal_command_results, "npx next typegen") === "passed", "typegen current local result mismatch", failures);
    pass(commandStatus(result.candidate_internal_command_results, "npx tsc --noEmit") === "passed", "tsc current local result mismatch", failures);
    pass(commandStatus(result.external_control_results, expected.action518) === "passed", "Action 518 external result mismatch", failures);
    pass(commandStatus(result.external_control_results, expected.action532) === "passed", "Action 532 external result mismatch", failures);
    pass(result.cleanup_result === "passed", "cleanup mismatch", failures);
    pass(result.overall_readiness === "blocked", "overall readiness mismatch", failures);

    pass(action518Record.clean_base_identifier === expected.cleanBase, "clean base mismatch", failures);
    pass(action518Record.new_change_candidate_hash === expected.changeHash, "change hash mismatch", failures);
    pass(action518Record.new_full_candidate_inventory_hash === expected.fullHash, "full hash mismatch", failures);
    pass(action518Record.new_candidate_file_count === 32, "candidate count mismatch", failures);
    pass(action518Record.added_route_hash === expected.routeHash, "route hash mismatch", failures);
    pass(!candidatePaths.has(expected.action518), "Action 518 verifier unexpectedly in candidate", failures);
    pass(!candidatePaths.has(expected.action532), "Action 532 verifier unexpectedly in candidate", failures);

    pass(runSerialBody.length > 0, "runSerialCommands missing", failures);
    pass(!runSerialBody.includes(expected.action518), "Action 518 still in candidate runtime source", failures);
    pass(!runSerialBody.includes(expected.action532), "Action 532 still in candidate runtime source", failures);
    pass(!runSerialBody.includes(expected.action533), "Action 533 still in candidate runtime source", failures);
    pass(!runSerialBody.includes(expected.action535), "Action 535 still in candidate runtime source", failures);
    pass(!runSerialBody.includes(expected.action536), "Action 536 still in candidate runtime source", failures);
    pass(runSerialBody.includes('command: "npx", args: ["next", "typegen"]'), "typegen prebuild source missing", failures);
    pass(runSerialBody.includes('command: "npx", args: ["tsc", "--noEmit"]'), "tsc prebuild source missing", failures);
    pass(runSerialBody.includes('spawnChecked("npm", ["run", "build"]'), "authoritative build transition missing", failures);

    pass(externalBody.includes(expected.action518), "Action 518 missing from external controls", failures);
    pass(externalBody.includes(expected.action532), "Action 532 missing from external controls", failures);
    pass(externalBody.includes(expected.action533), "Action 533 missing from external controls", failures);
    pass(externalBody.includes(expected.action535), "Action 535 missing from external controls", failures);
    pass(externalBody.includes(expected.action536), "Action 536 missing from external controls", failures);
    pass(script.indexOf("const cleanupResult = safeCleanup(target)") < script.indexOf("const externalControls = runExternalControlCommands()"), "external controls are not after cleanup", failures);

    pass(script.includes(`const runnerContractVersion = "${expected.runnerContractVersion}"`), "runner contract source missing", failures);
    pass(script.includes("function runnerScriptSha256()"), "runner hash source missing", failures);
    pass(script.includes("function deriveAttemptMetadata"), "attempt metadata source missing", failures);
    pass(script.includes("function readPriorResult"), "prior result reader source missing", failures);
    pass(script.includes("fresh_result_object_created: true"), "fresh object field missing", failures);
    pass(script.includes("prior_command_results_reused: false"), "prior command reuse guard missing", failures);
    pass(script.includes("atomic_result_replacement_enabled: true"), "atomic result field missing", failures);
    pass(writeResultBody.includes("writeFileSync(temporary"), "temporary result write missing", failures);
    pass(writeResultBody.includes("renameSync(temporary, destination)"), "atomic result rename missing", failures);
    pass(!script.includes("operator_rehearsal_attempt_number: 1"), "hardcoded attempt 1 found", failures);
    pass(!script.includes("historicalOperatorAttemptCount: 2"), "legacy hardcoded historical attempt found", failures);
    pass(!script.includes("nextOperatorAttemptNumber: 3"), "legacy hardcoded next attempt found", failures);

    pass(resultVerifier.includes("runner_script_sha256 === runnerHash"), "result verifier does not require runner hash", failures);
    pass(resultVerifier.includes(expected.runnerContractVersion), "result verifier does not require contract version", failures);
    pass(resultVerifier.includes("isUnfingerprintedAction536CompletedAttempt"), "result verifier missing un-fingerprinted evidence lane", failures);

    for (const key of [
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
    ]) {
      pass(record[key] === false, `${key} must be false`, failures);
    }

    for (const snippet of [
      expected.observedClassification,
      "result_freshness_ambiguous",
      expected.runnerContractVersion,
      "temporary sibling file and atomic rename",
      "operator attempt `3`",
      "next operator attempt as `4`",
      "does not execute Action 534",
    ]) {
      pass(doc.includes(snippet), `doc missing ${snippet}`, failures);
    }
  }

  return {
    action: 537,
    verification_status: failures.length === 0 ? "passed" : "failed",
    observed_result_classification: expected.observedClassification,
    result_freshness_classification: "result_freshness_ambiguous",
    current_runner_script_sha256: existsSync(join(repoRoot, paths.action534Script)) ? sha256File(paths.action534Script) : null,
    runner_contract_version: expected.runnerContractVersion,
    remediation_result: failures.length === 0 ? expected.remediationResult : "action_534_runner_remediation_application_failed",
    historical_operator_attempt_count: 3,
    next_operator_attempt_number: 4,
    operator_retry_authorized: failures.length === 0,
    operator_retry_limit: failures.length === 0 ? 1 : 0,
    action_534_script_executed_by_action_537: false,
    build_performed: false,
    rehearsal_performed: false,
    deployment_performed: false,
    preview_activated: false,
    runtime_preview_state: "runtime_preview_waiting_for_operator_inputs",
    next_action: expected.nextAction,
    failures,
  };
}

const output = verifyAction537();
console.log(JSON.stringify(output, null, 2));
if (output.verification_status !== "passed") process.exit(1);
