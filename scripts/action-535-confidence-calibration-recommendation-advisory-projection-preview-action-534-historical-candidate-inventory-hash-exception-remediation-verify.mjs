#!/usr/bin/env node

import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath, pathToFileURL } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");

const paths = {
  record:
    "docs/action-535-confidence-calibration-recommendation-advisory-projection-preview-action-534-historical-candidate-inventory-hash-exception-remediation-record.json",
  doc:
    "docs/action-535-confidence-calibration-recommendation-advisory-projection-preview-action-534-historical-candidate-inventory-hash-exception-remediation.md",
  action534Result:
    "docs/action-534-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-candidate-rehearsal-result.json",
  action534Script:
    "scripts/action-534-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-candidate-rehearsal.mjs",
  action534ResultVerifier:
    "scripts/action-534-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-candidate-rehearsal-result-verify.mjs",
  action533Verifier:
    "scripts/action-533-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-candidate-rehearsal-handoff-gate-verify.mjs",
  action518Verifier:
    "scripts/action-518-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-reconstruction-and-hash-freeze-verify.mjs",
};

const expected = {
  exceptionPath:
    "docs/action-465-confidence-calibration-recommendation-advisory-projection-preview-candidate-inventory.json",
  exceptionClassification: "static_inventory",
  exceptionProvenance: "historical_30_file_overlay_action_473",
  exceptionSourceClassification: "historical_30_file_overlay",
  exceptionSchema: "action_465_candidate_inventory_v1",
  blockerClassification: "action_534_historical_null_hash_exception_not_applied",
  remediationResult: "action_534_historical_hash_exception_remediation_completed",
  nextAction:
    "action_534_external_terminal_candidate_rehearsal_operator_retry_after_historical_hash_exception_remediation",
  retryCommand:
    "node scripts/action-534-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-candidate-rehearsal.mjs",
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
  return (Array.isArray(results) ? results : []).find((entry) =>
    typeof entry?.command === "string" && entry.command.includes(commandPath),
  )?.status;
}

function isHistoricalAbortedAction534Result(result) {
  return (
    result.operator_rehearsal_attempt_number === 1 &&
    result.authoritative_build_attempt_count === 0 &&
    result.webpack_diagnostic_attempt_count === 0 &&
    result.candidate_rehearsal_result === "external_terminal_candidate_rehearsal_aborted" &&
    result.cleanup_result === "passed" &&
    result.authoritative_error_class === `candidate_hash_mismatch:${expected.exceptionPath}`
  );
}

function isBoundaryDefectAction534Result(result) {
  return (
    result.candidate_rehearsal_result === "external_terminal_candidate_rehearsal_failed" &&
    result.authoritative_build_attempt_count === 0 &&
    result.candidate_reconstruction_result === "exact_candidate_reconstructed" &&
    result.runtime_dependency_closure_result === "complete" &&
    result.source_integrity_result === "baseline_plus_overlay_manifest_integrity" &&
    result.source_safety_result === "source_safety_passed" &&
    result.preview_flag_verification_result === "preview_flag_disabled_verified" &&
    result.dependency_materialization_result === "temporary_verified_node_modules_copy" &&
    commandStatus(
      result.prebuild_command_results,
      "scripts/action-518-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-reconstruction-and-hash-freeze-verify.mjs",
    ) === "failed" &&
    commandStatus(
      result.prebuild_command_results,
      "scripts/action-532-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-runner-precheck-evidence-acceptance-gate-verify.mjs",
    ) === "failed" &&
    commandStatus(result.prebuild_command_results, "npx next typegen") === "passed" &&
    commandStatus(result.prebuild_command_results, "npx tsc --noEmit") === "passed" &&
    result.cleanup_result === "passed"
  );
}

function isUnfingerprintedAction536Action534Result(result) {
  return (
    result.runner_contract_version === undefined &&
    result.runner_script_sha256 === undefined &&
    result.candidate_rehearsal_result === "external_terminal_candidate_rehearsal_failed" &&
    result.authoritative_build_attempt_count === 1 &&
    result.authoritative_build_result === "failed" &&
    result.webpack_diagnostic_attempt_count === 1 &&
    result.webpack_diagnostic_result === "passed" &&
    result.operator_rehearsal_attempt_number === 3 &&
    result.historical_operator_attempt_count === 2 &&
    result.prior_attempt_result === "external_terminal_candidate_rehearsal_failed" &&
    result.prior_attempt_blocker === "candidate_internal_external_control_boundary_defect" &&
    commandStatus(result.candidate_internal_command_results, "npx next typegen") === "passed" &&
    commandStatus(result.candidate_internal_command_results, "npx tsc --noEmit") === "passed" &&
    commandStatus(
      result.external_control_results,
      "scripts/action-518-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-reconstruction-and-hash-freeze-verify.mjs",
    ) === "passed" &&
    commandStatus(
      result.external_control_results,
      "scripts/action-532-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-runner-precheck-evidence-acceptance-gate-verify.mjs",
    ) === "passed" &&
    result.cleanup_result === "passed" &&
    result.deployment_performed === false &&
    result.preview_activated === false
  );
}

function isFingerprintedAction537Action534Result(result) {
  return (
    result.runner_contract_version === "action_537_action_534_runner_contract_v1" &&
    typeof result.runner_script_sha256 === "string" &&
    /^[a-f0-9]{64}$/.test(result.runner_script_sha256) &&
    result.candidate_rehearsal_result === "external_terminal_candidate_rehearsal_failed" &&
    result.authoritative_build_attempt_count === 1 &&
    result.authoritative_build_result === "failed" &&
    result.webpack_diagnostic_attempt_count === 1 &&
    result.webpack_diagnostic_result === "passed" &&
    result.operator_rehearsal_attempt_number === 4 &&
    result.historical_operator_attempt_count === 3 &&
    commandStatus(result.candidate_internal_command_results, "npx next typegen") === "passed" &&
    commandStatus(result.candidate_internal_command_results, "npx tsc --noEmit") === "passed" &&
    result.cleanup_result === "passed" &&
    result.deployment_performed === false &&
    result.preview_activated === false
  );
}

async function verifyMatrix(failures) {
  const action534Module = await import(pathToFileURL(join(repoRoot, paths.action534Script)).href);
  const classify = action534Module.classifyCandidateInventoryEntry;
  pass(typeof classify === "function", "classification helper missing", failures);
  if (typeof classify !== "function") return;

  const exactException = {
    path: expected.exceptionPath,
    sha256: null,
    classification: expected.exceptionClassification,
    provenance: expected.exceptionProvenance,
    source_classification: expected.exceptionSourceClassification,
  };
  const normal = {
    path: "lib/confidence-calibration-recommendation-advisory-projection.ts",
    sha256: "eb7e802e45021c05062bbeed8c69369a08bb6f928d3d8ef84a646e0d6ccf042b",
    classification: "verified_projection_core",
    provenance: "historical_30_file_overlay_action_473",
    source_classification: "historical_30_file_overlay",
  };

  pass(classify(normal, new Set()) === "normal_hash_entry", "normal hash entry not accepted", failures);
  pass(
    classify(exactException, new Set()) === "exact_historical_null_hash_exception",
    "exact historical exception not accepted",
    failures,
  );

  const rejectedCases = [
    ["malformed exception", { ...exactException, sha256: "not-a-hash" }],
    ["exception other path", { ...exactException, path: "docs/other.json" }],
    ["wrong provenance", { ...exactException, provenance: "historical_30_file_overlay_action_999" }],
    ["wrong classification", { ...exactException, classification: "static_documentation" }],
    ["wrong schema surrogate", { ...exactException, source_classification: "other_source" }],
    ["normal null hash", { ...normal, sha256: null }],
    ["normal wrong hash shape", { ...normal, sha256: "abc" }],
    ["absolute path", { ...normal, path: "/tmp/file.ts" }],
    ["traversal path", { ...normal, path: "../lib/file.ts" }],
    ["alternate path spelling", { ...exactException, path: `./${expected.exceptionPath}` }],
    ["schema override normal wrong hash", { ...normal, sha256: null, provenance: expected.exceptionProvenance }],
  ];
  for (const [label, entry] of rejectedCases) {
    pass(classify(entry, new Set()) === "invalid_or_ambiguous_entry", `${label} was not rejected`, failures);
  }
  pass(
    classify(exactException, new Set([expected.exceptionPath])) === "invalid_or_ambiguous_entry",
    "duplicate Action 465 entry was not rejected",
    failures,
  );
}

async function verifyAction535() {
  const failures = [];
  let latestAction534Result = "unknown";
  for (const requiredPath of Object.values(paths)) {
    pass(existsSync(join(repoRoot, requiredPath)), `missing required path: ${requiredPath}`, failures);
  }

  runStaticVerifier(paths.action534ResultVerifier, failures);
  runStaticVerifier(paths.action533Verifier, failures);
  runStaticVerifier(paths.action518Verifier, failures);

  if (failures.length === 0) {
    const record = readJson(paths.record);
    const result = readJson(paths.action534Result);
    latestAction534Result = result.candidate_rehearsal_result ?? "unknown";
    const script = read(paths.action534Script);
    const doc = read(paths.doc);

    pass(record.schema_version === "action_535_action_534_historical_candidate_inventory_hash_exception_remediation_record_v1", "record schema mismatch", failures);
    pass(record.source_action === 534, "record source action mismatch", failures);
    pass(result.schema_version === "action_534_external_terminal_candidate_rehearsal_result_v1", "Action 534 result schema mismatch", failures);
    pass(
      isHistoricalAbortedAction534Result(result) ||
        isBoundaryDefectAction534Result(result) ||
        isUnfingerprintedAction536Action534Result(result) ||
        isFingerprintedAction537Action534Result(result),
      "Action 534 historical/boundary result mismatch",
      failures,
    );
    pass([0, 1].includes(result.authoritative_build_attempt_count), "Action 534 build attempt mismatch", failures);
    pass([0, 1].includes(result.webpack_diagnostic_attempt_count), "Action 534 webpack attempt mismatch", failures);
    pass(result.cleanup_result === "passed", "Action 534 cleanup mismatch", failures);
    pass(result.deployment_performed === false, "Action 534 deployment mismatch", failures);
    pass(result.preview_activated === false, "Action 534 activation mismatch", failures);
    if (isHistoricalAbortedAction534Result(result)) {
      pass(
        result.authoritative_error_class === `candidate_hash_mismatch:${expected.exceptionPath}`,
        "Action 534 blocker mismatch",
        failures,
      );
    }

    pass(record.blocker === "candidate_hash_mismatch", "record blocker mismatch", failures);
    pass(record.blocker_path === expected.exceptionPath, "record blocker path mismatch", failures);
    pass(record.blocker_classification === expected.blockerClassification, "record blocker classification mismatch", failures);
    pass(record.historical_exception_path === expected.exceptionPath, "exception path mismatch", failures);
    pass(record.historical_exception_scope_exact === true, "exception scope mismatch", failures);
    pass(record.historical_exception_schema === expected.exceptionSchema, "exception schema mismatch", failures);
    pass(record.historical_exception_classification === expected.exceptionClassification, "exception classification mismatch", failures);
    pass(record.historical_exception_provenance === expected.exceptionProvenance, "exception provenance mismatch", failures);
    pass(record.exception_means_skip_validation === false, "exception skip mismatch", failures);
    pass(record.normal_hash_verification_remains_strict === true, "normal strictness mismatch", failures);
    pass(record.wrong_hash_still_blocks === true, "wrong hash mismatch", failures);
    pass(record.missing_hash_still_blocks === true, "missing hash mismatch", failures);
    pass(record.null_hash_for_normal_file_blocks === true, "normal null hash mismatch", failures);
    pass(record.schema_or_provenance_override_forbidden === true, "override policy mismatch", failures);
    pass(record.wildcard_exception_allowed === false, "wildcard policy mismatch", failures);
    pass(record.alternate_path_exception_allowed === false, "alternate path policy mismatch", failures);

    pass(record.clean_base_identifier === expected.cleanBase, "clean base mismatch", failures);
    pass(record.change_candidate_hash === expected.changeHash, "change hash mismatch", failures);
    pass(record.full_candidate_inventory_hash === expected.fullHash, "full hash mismatch", failures);
    pass(record.candidate_file_count === 32, "candidate count mismatch", failures);
    pass(record.remediated_route_hash === expected.routeHash, "route hash mismatch", failures);
    pass(record.candidate_change_required === false, "candidate change mismatch", failures);
    pass(record.candidate_hash_change_required === false, "candidate hash change mismatch", failures);

    pass(record.operator_retry_authorized === true, "retry authorization mismatch", failures);
    pass(record.operator_retry_limit === 1, "retry limit mismatch", failures);
    pass(record.operator_retry_command === expected.retryCommand, "retry command mismatch", failures);
    pass(record.future_operator_rehearsal_attempt_number === 2, "future attempt mismatch", failures);
    pass(record.future_prior_attempt_result === "external_terminal_candidate_rehearsal_aborted", "future prior mismatch", failures);
    pass(record.future_prior_attempt_blocker === "historical_candidate_inventory_hash_exception", "future blocker mismatch", failures);
    pass(record.remediation_result === expected.remediationResult, "remediation result mismatch", failures);
    pass(record.runtime_preview_state === "runtime_preview_waiting_for_operator_inputs", "runtime preview mismatch", failures);
    pass(record.next_action === expected.nextAction, "next action mismatch", failures);

    for (const key of [
      "build_performed",
      "candidate_reconstructed",
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
      "export function classifyCandidateInventoryEntry",
      "exact_historical_null_hash_exception",
      "invalid_or_ambiguous_entry",
      "historicalExceptionPath",
      "verifyHistoricalExceptionContent",
      "inventory_schema_version",
      "candidate_hash_mismatch",
    ]) {
      pass(script.includes(snippet), `Action 534 script missing ${snippet}`, failures);
    }

    for (const snippet of [
      expected.blockerClassification,
      expected.exceptionPath,
      "wrong hash blocks",
      "operator retry",
      expected.nextAction,
      "does not execute Action 534",
    ]) {
      pass(doc.includes(snippet), `doc missing ${snippet}`, failures);
    }
  }

  await verifyMatrix(failures);

  return {
    action: 535,
    verification_status: failures.length === 0 ? "passed" : "failed",
    action_534_result: latestAction534Result,
    blocker_path: expected.exceptionPath,
    blocker_classification: expected.blockerClassification,
    remediation_result: failures.length === 0 ? expected.remediationResult : "action_534_historical_hash_exception_remediation_failed",
    operator_retry_authorized: failures.length === 0,
    operator_retry_limit: failures.length === 0 ? 1 : 0,
    action_534_script_executed_by_action_535: false,
    build_performed: false,
    candidate_reconstructed: false,
    rehearsal_performed: false,
    deployment_performed: false,
    preview_activated: false,
    runtime_preview_state: "runtime_preview_waiting_for_operator_inputs",
    next_action: expected.nextAction,
    failures,
  };
}

const output = await verifyAction535();
console.log(JSON.stringify(output, null, 2));
if (output.verification_status !== "passed") process.exit(1);
