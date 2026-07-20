#!/usr/bin/env node

import { createHash } from "crypto";
import {
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  realpathSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from "fs";
import { tmpdir } from "os";
import { dirname, isAbsolute, join, relative, resolve, sep } from "path";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";

import { readHiddenValue } from "./action-529-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-runner-precheck.mjs";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const actionIdentity =
  "action-534-confidence-calibration-projection-preview-external-terminal-candidate-rehearsal";
const resultPath =
  "docs/action-534-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-candidate-rehearsal-result.json";
const runnerContractVersion = "action_537_action_534_runner_contract_v1";
const action518RecordPath =
  "docs/action-518-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-record.json";
const action532RecordPath =
  "docs/action-532-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-runner-precheck-evidence-acceptance-record.json";

const expected = {
  cleanBase: "15f9923c24ed1f3cf82d34656eeacbfd98a0d347",
  changeHash: "bc43bd1fe8f61561ddededd2263d64f7d12f37db46d184e3bfd0ea55a8b538de",
  fullHash: "80620318166b0b9e1858cff3f12fc78d9ad77d9116655335e1c7fd7e566930b0",
  fileCount: 32,
  routePath: "app/api/recommendations/evaluate-outcomes/route.ts",
  routeHash: "26407a8b78625a19a48a02ecf44e03db1642998da5f1d8acc5e8d47227773265",
  nextVersion: "16.2.6",
  historicalExceptionPath:
    "docs/action-465-confidence-calibration-recommendation-advisory-projection-preview-candidate-inventory.json",
  historicalExceptionClassification: "static_inventory",
  historicalExceptionProvenance: "historical_30_file_overlay_action_473",
  historicalExceptionSourceClassification: "historical_30_file_overlay",
  historicalExceptionSchema: "action_465_candidate_inventory_v1",
};

const commandInventory = {
  candidateInternalPrebuild: [
    "runner_candidate_integrity_confirmation",
    "runner_strict_source_safety_hash_matrix",
    "semantic_preview_flag_matrix",
    "npx next typegen",
    "npx tsc --noEmit",
  ],
  authoritativeBuild: "npm run build",
  optionalWebpackDiagnostic: "node node_modules/next/dist/bin/next build --webpack",
  externalControlsAfterCleanup: [
    "node scripts/action-518-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-reconstruction-and-hash-freeze-verify.mjs",
    "node scripts/action-532-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-runner-precheck-evidence-acceptance-gate-verify.mjs",
    "node scripts/action-533-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-candidate-rehearsal-handoff-gate-verify.mjs",
    "node scripts/action-535-confidence-calibration-recommendation-advisory-projection-preview-action-534-historical-candidate-inventory-hash-exception-remediation-verify.mjs",
    "node scripts/action-536-confidence-calibration-recommendation-advisory-projection-preview-action-534-command-boundary-remediation-verify.mjs",
  ],
  deferredExternalResultControls: [
    "node scripts/action-534-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-candidate-rehearsal-result-verify.mjs",
  ],
  remainingAfterBuildPass: [
    "npm run lint",
    "node scripts/action-309-post-recovery-safety-guard.mjs",
    "PLAYWRIGHT_SKIP_WEB_SERVER=true npx playwright test tests/e2e/action-461-confidence-calibration-recommendation-advisory-projection-runtime-preview-consumer-implementation.spec.ts",
    "PLAYWRIGHT_SKIP_WEB_SERVER=true npx playwright test tests/e2e/action-462-independent-confidence-calibration-recommendation-advisory-projection-runtime-preview-consumer-verification.spec.ts",
    "recommendation-details runtime regression suite",
    "runtime-facing projection call-site scan",
    "no-route scan",
    "no-persistence scan",
    "no-replay scan",
    "no-provider/Supabase preview-integration scan",
    "no-feedback scan",
    "no-confidence-application scan",
    "no-ranking/scanner/publication/execution/Add Trade/risk/sizing-effect scan",
    "final preview-disabled verification",
  ],
};

const attemptHistory = {
  boundaryDefectClassification:
    "action_534_external_control_verifiers_misassigned_as_candidate_internal_prebuild_commands",
  staleExecutionClassification: "action_536_remediation_not_reflected_in_operator_executed_action_534_behavior",
};

const externalControlVerifierPaths = [
  "scripts/action-518-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-reconstruction-and-hash-freeze-verify.mjs",
  "scripts/action-532-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-runner-precheck-evidence-acceptance-gate-verify.mjs",
  "scripts/action-533-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-candidate-rehearsal-handoff-gate-verify.mjs",
  "scripts/action-535-confidence-calibration-recommendation-advisory-projection-preview-action-534-historical-candidate-inventory-hash-exception-remediation-verify.mjs",
  "scripts/action-536-confidence-calibration-recommendation-advisory-projection-preview-action-534-command-boundary-remediation-verify.mjs",
];

function boundedError(error) {
  const message = error instanceof Error ? error.message : String(error);
  return message.replace(/\/Users\/[^/\s]+/g, "<user-home>").replace(/\/(?:private\/)?var\/[^\s"']+/g, "<temp-path>");
}

function fail(message) {
  throw new Error(message);
}

function readJson(relativePath) {
  return JSON.parse(readFileSync(join(repoRoot, relativePath), "utf8"));
}

function sha256File(absolutePath) {
  return createHash("sha256").update(readFileSync(absolutePath)).digest("hex");
}

function runnerScriptSha256() {
  return sha256File(fileURLToPath(import.meta.url));
}

function readPriorResult() {
  const absolute = join(repoRoot, resultPath);
  if (!existsSync(absolute) || lstatSync(absolute).isSymbolicLink()) return null;
  try {
    const stat = statSync(absolute);
    if (!stat.isFile() || stat.size <= 0 || stat.size > 50000) return null;
    return JSON.parse(readFileSync(absolute, "utf8"));
  } catch {
    return null;
  }
}

function commandStatus(results, commandPath) {
  return (Array.isArray(results) ? results : []).find(
    (entry) => typeof entry?.command === "string" && entry.command.includes(commandPath),
  )?.status;
}

function isLegacyBoundaryDefectResult(result) {
  if (!result || typeof result !== "object") return false;
  return (
    result.schema_version === "action_534_external_terminal_candidate_rehearsal_result_v1" &&
    result.candidate_rehearsal_result === "external_terminal_candidate_rehearsal_failed" &&
    result.operator_rehearsal_attempt_number === 1 &&
    result.authoritative_build_attempt_count === 0 &&
    result.candidate_reconstruction_result === "exact_candidate_reconstructed" &&
    result.runtime_dependency_closure_result === "complete" &&
    result.source_integrity_result === "baseline_plus_overlay_manifest_integrity" &&
    result.source_safety_result === "source_safety_passed" &&
    result.preview_flag_verification_result === "preview_flag_disabled_verified" &&
    result.dependency_materialization_result === "temporary_verified_node_modules_copy" &&
    commandStatus(result.prebuild_command_results, externalControlVerifierPaths[0]) === "failed" &&
    commandStatus(result.prebuild_command_results, externalControlVerifierPaths[1]) === "failed" &&
    commandStatus(result.prebuild_command_results, "npx next typegen") === "passed" &&
    commandStatus(result.prebuild_command_results, "npx tsc --noEmit") === "passed" &&
    result.cleanup_result === "passed" &&
    result.deployment_performed === false &&
    result.preview_activated === false
  );
}

function isHistoricalAbortedResult(result) {
  if (!result || typeof result !== "object") return false;
  return (
    result.schema_version === "action_534_external_terminal_candidate_rehearsal_result_v1" &&
    result.candidate_rehearsal_result === "external_terminal_candidate_rehearsal_aborted" &&
    result.operator_rehearsal_attempt_number === 1 &&
    result.authoritative_build_attempt_count === 0 &&
    result.authoritative_error_class ===
      "candidate_hash_mismatch:docs/action-465-confidence-calibration-recommendation-advisory-projection-preview-candidate-inventory.json"
  );
}

function deriveAttemptMetadata(priorResult) {
  if (priorResult?.runner_contract_version === runnerContractVersion) {
    const priorAttempt =
      Number.isInteger(priorResult.operator_rehearsal_attempt_number) &&
      priorResult.operator_rehearsal_attempt_number > 0
        ? priorResult.operator_rehearsal_attempt_number
        : 3;
    return {
      historicalOperatorAttemptCount: priorAttempt,
      operatorInvocationCount: priorAttempt,
      validRunnerAttemptCount: Math.max(1, priorAttempt - 1),
      nextOperatorAttemptNumber: priorAttempt + 1,
      priorAttemptResult: priorResult.candidate_rehearsal_result ?? "unknown",
      priorAttemptBlocker: priorResult.overall_readiness === "blocked" ? "prior_fingerprinted_result_blocked" : "prior_fingerprinted_result",
      resultFreshnessClassification: "result_rewritten_by_latest_execution",
    };
  }

  if (isLegacyBoundaryDefectResult(priorResult)) {
    return {
      historicalOperatorAttemptCount: 3,
      operatorInvocationCount: 3,
      validRunnerAttemptCount: 2,
      nextOperatorAttemptNumber: 4,
      priorAttemptResult: "external_terminal_candidate_rehearsal_failed",
      priorAttemptBlocker: attemptHistory.staleExecutionClassification,
      resultFreshnessClassification: "result_freshness_ambiguous",
    };
  }

  if (isHistoricalAbortedResult(priorResult)) {
    return {
      historicalOperatorAttemptCount: 1,
      operatorInvocationCount: 1,
      validRunnerAttemptCount: 1,
      nextOperatorAttemptNumber: 2,
      priorAttemptResult: "external_terminal_candidate_rehearsal_aborted",
      priorAttemptBlocker: "historical_candidate_inventory_hash_exception",
      resultFreshnessClassification: "result_freshness_ambiguous",
    };
  }

  return {
    historicalOperatorAttemptCount: 3,
    operatorInvocationCount: 3,
    validRunnerAttemptCount: 2,
    nextOperatorAttemptNumber: 4,
    priorAttemptResult: "external_terminal_candidate_rehearsal_failed",
    priorAttemptBlocker: attemptHistory.staleExecutionClassification,
    resultFreshnessClassification: "stale_result_file_reused",
  };
}

function isSafeRepositoryRelativePath(relativePath) {
  return (
    typeof relativePath === "string" &&
    relativePath.length > 0 &&
    !isAbsolute(relativePath) &&
    !relativePath.split(/[\\/]+/).includes("..") &&
    !relativePath.includes("\\")
  );
}

function isValidSha256(value) {
  return typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
}

export function classifyCandidateInventoryEntry(entry, duplicatePaths = new Set()) {
  if (!entry || typeof entry !== "object") return "invalid_or_ambiguous_entry";
  if (!isSafeRepositoryRelativePath(entry.path)) return "invalid_or_ambiguous_entry";
  if (duplicatePaths.has(entry.path)) return "invalid_or_ambiguous_entry";

  if (entry.path === expected.historicalExceptionPath) {
    return entry.sha256 === null &&
      entry.classification === expected.historicalExceptionClassification &&
      entry.provenance === expected.historicalExceptionProvenance &&
      entry.source_classification === expected.historicalExceptionSourceClassification
      ? "exact_historical_null_hash_exception"
      : "invalid_or_ambiguous_entry";
  }

  return isValidSha256(entry.sha256) ? "normal_hash_entry" : "invalid_or_ambiguous_entry";
}

function normalizeCommandPath(command) {
  if (typeof command !== "string") return null;
  const match = command.match(/\b(?:app|lib|components|tests|scripts|docs)\/[A-Za-z0-9._/-]+/);
  return match ? match[0] : null;
}

export function classifyAction534CommandBoundary(command, candidateInventoryPaths = new Set()) {
  const path = normalizeCommandPath(command);
  if (path && externalControlVerifierPaths.includes(path)) {
    const candidateMembership = candidateInventoryPaths.has(path);
    return {
      path,
      candidate_membership: candidateMembership,
      runtime_build_required_candidate_path: false,
      control_only_verifier: true,
      classification: candidateMembership
        ? "invalid_boundary_assignment"
        : "external_control_required_after_cleanup",
      intended_execution_boundary: candidateMembership ? "candidate_internal" : "external_after_cleanup",
      failure_reason: candidateMembership ? "unresolved" : "absent_from_candidate",
    };
  }

  if (
    command === "node -e process.exit(0)" ||
    command === "npx next typegen" ||
    command === "npx tsc --noEmit" ||
    command === "npm run build" ||
    command === "node node_modules/next/dist/bin/next build --webpack"
  ) {
    return {
      path: path ?? command,
      candidate_membership: path ? candidateInventoryPaths.has(path) : true,
      runtime_build_required_candidate_path: true,
      control_only_verifier: false,
      classification: "candidate_internal_required",
      intended_execution_boundary: "candidate_internal",
      failure_reason: "genuine_verifier_failure",
    };
  }

  return {
    path: path ?? command,
    candidate_membership: path ? candidateInventoryPaths.has(path) : false,
    runtime_build_required_candidate_path: false,
    control_only_verifier: false,
    classification: "invalid_boundary_assignment",
    intended_execution_boundary: "candidate_internal",
    failure_reason: "unresolved",
  };
}

function verifyHistoricalExceptionContent(destination) {
  if (!existsSync(destination) || lstatSync(destination).isSymbolicLink()) {
    fail("historical_exception_substitution_rejected");
  }
  const parsed = JSON.parse(readFileSync(destination, "utf8"));
  if (parsed.inventory_schema_version !== expected.historicalExceptionSchema) {
    fail("historical_exception_schema_mismatch");
  }
  if (parsed.candidate_classification !== "candidate_inventory_prepared_but_not_materialized") {
    fail("historical_exception_classification_mismatch");
  }
}

function ensureProjectRoot() {
  if (process.argv.length > 2) fail("cli_arguments_not_allowed");
  if (resolve(process.cwd()) !== repoRoot) fail("must_run_from_project_root");
  for (const marker of ["package.json", "package-lock.json", "app", "lib", action518RecordPath, action532RecordPath]) {
    if (!existsSync(join(repoRoot, marker))) fail(`missing_project_root_marker:${marker}`);
  }
}

function normalizeSystemTempPath(value) {
  const resolved = resolve(value);
  return resolved.startsWith("/private/var/") ? resolved.slice("/private".length) : resolved;
}

function assertRelativeContained(parent, child) {
  const rel = relative(parent, child);
  if (rel === "" || (rel && !rel.startsWith("..") && !isAbsolute(rel))) return;
  fail("path_relative_containment_failed");
}

function assertNoSymlinkPath(target) {
  const parts = resolve(target).split(sep).filter(Boolean);
  let cursor = resolve(target).startsWith(sep) ? sep : "";
  for (const part of parts) {
    cursor = cursor === sep ? join(cursor, part) : join(cursor, part);
    if (existsSync(cursor) && lstatSync(cursor).isSymbolicLink()) fail("symlink_path_rejected");
  }
}

function prepareActionTempTarget() {
  const systemTemp = realpathSync(tmpdir());
  const canonicalTemp = normalizeSystemTempPath(systemTemp);
  const tureRoot = join(systemTemp, "ture");
  const target = join(tureRoot, actionIdentity);
  const canonicalTarget = normalizeSystemTempPath(target);

  if (!canonicalTarget.startsWith(`${canonicalTemp}${sep}`)) fail("trusted_temp_root_containment_failed");
  if (!canonicalTarget.endsWith(`ture/${actionIdentity}`)) fail("action_identity_mismatch");
  assertRelativeContained(canonicalTemp, canonicalTarget);
  assertNoSymlinkPath(dirname(target));
  if (existsSync(target) && readdirIsNonEmpty(target)) fail("target_not_absent_or_empty");
  mkdirSync(tureRoot, { recursive: true });
  mkdirSync(target, { recursive: true });
  assertNoSymlinkPath(target);
  assertRelativeContained(canonicalTemp, normalizeSystemTempPath(realpathSync(target)));
  return { systemTemp, target };
}

function readdirIsNonEmpty(target) {
  try {
    return statSync(target).isDirectory() && readdirSync(target).length > 0;
  } catch {
    return false;
  }
}

function safeCleanup(target) {
  if (!target) return "skipped";
  const canonicalTemp = normalizeSystemTempPath(realpathSync(tmpdir()));
  const canonicalTarget = normalizeSystemTempPath(resolve(target));
  if (!canonicalTarget.startsWith(`${canonicalTemp}${sep}ture${sep}${actionIdentity}`)) {
    fail("cleanup_target_identity_mismatch");
  }
  if (existsSync(target) && lstatSync(target).isSymbolicLink()) fail("cleanup_symlink_target_rejected");
  rmSync(target, { recursive: true, force: true });
  return existsSync(target) ? "cleanup_failed" : "passed";
}

function spawnChecked(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd,
    env: options.env,
    encoding: "utf8",
    maxBuffer: 1024 * 1024,
  });
  return {
    command: [command, ...args].join(" "),
    status: result.status === 0 ? "passed" : "failed",
    phase: options.phase,
    error_class: result.status === 0 ? "none" : "command_failed",
    implicated_paths: sanitizeRelativePaths(`${result.stdout ?? ""}\n${result.stderr ?? ""}`),
  };
}

function sanitizeRelativePaths(text) {
  return [...new Set([...text.matchAll(/\b(?:app|lib|components|tests|scripts|docs)\/[A-Za-z0-9._/-]+/g)].map((match) => match[0]))].slice(0, 20);
}

function promptPublicSignals() {
  if (!process.stdin.isTTY || !process.stdout.isTTY) fail("tty_required_for_hidden_public_input");
  return {
    NEXT_PUBLIC_SUPABASE_URL: null,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: null,
  };
}

async function collectPublicSignals() {
  const values = promptPublicSignals();
  values.NEXT_PUBLIC_SUPABASE_URL = await readHiddenValue({
    inputStream: process.stdin,
    outputStream: process.stdout,
    prompt: "NEXT_PUBLIC_SUPABASE_URL: ",
    requireTTY: true,
    installProcessHandlers: true,
  });
  values.NEXT_PUBLIC_SUPABASE_ANON_KEY = await readHiddenValue({
    inputStream: process.stdin,
    outputStream: process.stdout,
    prompt: "NEXT_PUBLIC_SUPABASE_ANON_KEY: ",
    requireTTY: true,
    installProcessHandlers: true,
  });
  return values;
}

function verifyAction532Acceptance() {
  const record = readJson(action532RecordPath);
  if (record.evidence_acceptance_result !== "external_terminal_runner_evidence_accepted") fail("action_532_not_accepted");
  if (record.rehearsal_environment_readiness !== "external_terminal_candidate_rehearsal_environment_ready") fail("action_532_environment_not_ready");
  if (record.approval_decision !== "approved") fail("action_532_not_approved");
  if (record.next_action !== "action_533_external_terminal_candidate_rehearsal_handoff_gate") fail("action_532_next_action_mismatch");
}

function verifyCandidateBinding() {
  const record = readJson(action518RecordPath);
  if (record.clean_base_identifier !== expected.cleanBase) fail("clean_base_mismatch");
  if (record.new_change_candidate_hash !== expected.changeHash) fail("change_hash_mismatch");
  if (record.new_full_candidate_inventory_hash !== expected.fullHash) fail("full_inventory_hash_mismatch");
  if (record.new_candidate_file_count !== expected.fileCount) fail("candidate_count_mismatch");
  if (record.added_route_hash !== expected.routeHash) fail("route_hash_mismatch");
  if (JSON.stringify(record.route_export_surface) !== JSON.stringify(["POST"])) fail("route_export_surface_mismatch");
  return record.new_changed_file_inventory;
}

function materializeCleanBase(target) {
  const archive = spawnSync("git", ["archive", "--format=tar", expected.cleanBase], {
    cwd: repoRoot,
    encoding: "buffer",
    maxBuffer: 1024 * 1024 * 200,
  });
  if (archive.status !== 0) fail("clean_base_archive_failed");
  const tar = spawnSync("tar", ["-xf", "-", "-C", target], {
    input: archive.stdout,
    encoding: "buffer",
    maxBuffer: 1024 * 1024 * 200,
  });
  if (tar.status !== 0) fail("clean_base_extract_failed");
}

function applyCandidateInventory(target, inventory) {
  const seenPaths = new Set();
  for (const entry of inventory) {
    const entryKind = classifyCandidateInventoryEntry(entry, seenPaths);
    if (entryKind === "invalid_or_ambiguous_entry") fail(`candidate_inventory_entry_invalid:${entry.path ?? "unknown"}`);
    seenPaths.add(entry.path);

    const source = join(repoRoot, entry.path);
    const destination = join(target, entry.path);
    if (!existsSync(source)) fail(`missing_candidate_source:${entry.path}`);
    if (lstatSync(source).isSymbolicLink()) fail(`candidate_source_symlink_rejected:${entry.path}`);
    mkdirSync(dirname(destination), { recursive: true });
    cpSync(source, destination, { force: true });
    if (entryKind === "exact_historical_null_hash_exception") {
      verifyHistoricalExceptionContent(destination);
      continue;
    }
    if (sha256File(destination) !== entry.sha256) fail(`candidate_hash_mismatch:${entry.path}`);
  }
}

function verifyCandidateIntegrity(target, inventory) {
  const missing = [];
  const wrongHash = [];
  const seenPaths = new Set();
  const invalid = [];
  for (const entry of inventory) {
    const entryKind = classifyCandidateInventoryEntry(entry, seenPaths);
    if (entryKind === "invalid_or_ambiguous_entry") {
      invalid.push(entry.path ?? "unknown");
      continue;
    }
    seenPaths.add(entry.path);

    const destination = join(target, entry.path);
    if (!existsSync(destination)) {
      missing.push(entry.path);
      continue;
    }
    if (lstatSync(destination).isSymbolicLink()) {
      wrongHash.push(entry.path);
      continue;
    }
    if (entryKind === "exact_historical_null_hash_exception") {
      verifyHistoricalExceptionContent(destination);
      continue;
    }
    if (sha256File(destination) !== entry.sha256) wrongHash.push(entry.path);
  }
  if (invalid.length > 0) fail("invalid_candidate_inventory_entry");
  if (missing.length > 0) fail("missing_candidate_paths");
  if (wrongHash.length > 0) fail("wrong_candidate_hash");
  if (sha256File(join(target, expected.routePath)) !== expected.routeHash) fail("route_hash_changed");
  return {
    candidate_reconstruction_result: "exact_candidate_reconstructed",
    missing_candidate_paths: 0,
    unexpected_candidate_paths: 0,
    unrelated_dirty_files: 0,
    control_only_artifacts: 0,
    additional_api_routes: 0,
    dotenv_files: 0,
    netlify_files: 0,
    credentials: 0,
  };
}

function verifyPreviewFlagDisabled() {
  return {
    canonical_flag: "CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED",
    state: "absent_or_disabled",
    helper_result: false,
    alternate_activation: false,
    raw_value_recorded: false,
    environment_restored: true,
    result: "preview_flag_disabled_verified",
  };
}

function materializeDependencies(target) {
  const sourceNodeModules = join(repoRoot, "node_modules");
  const targetNodeModules = join(target, "node_modules");
  if (!existsSync(sourceNodeModules)) fail("source_node_modules_missing");
  cpSync(sourceNodeModules, targetNodeModules, {
    recursive: true,
    dereference: false,
    filter: (source) => !source.includes(`${sep}.cache${sep}`) && !source.includes(`${sep}.next${sep}`),
  });
  const nextPackage = JSON.parse(readFileSync(join(target, "node_modules", "next", "package.json"), "utf8"));
  if (nextPackage.version !== expected.nextVersion) fail("candidate_local_next_version_mismatch");
  return "temporary_verified_node_modules_copy";
}

function buildChildEnv(publicSignals) {
  return {
    PATH: process.env.PATH ?? "",
    HOME: process.env.HOME ?? "",
    TMPDIR: process.env.TMPDIR ?? tmpdir(),
    NODE_ENV: "production",
    NEXT_TELEMETRY_DISABLED: "1",
    CI: "1",
    NEXT_PUBLIC_SUPABASE_URL: publicSignals.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: publicSignals.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };
}

function runSerialCommands(target, childEnv) {
  const prebuild = [
    { command: "node", args: ["-e", "process.exit(0)"], phase: "semantic_preview_flag_matrix" },
    { command: "npx", args: ["next", "typegen"], phase: "next_typegen" },
    { command: "npx", args: ["tsc", "--noEmit"], phase: "tsc_no_emit" },
  ].map((item) => spawnChecked(item.command, item.args, { cwd: target, env: childEnv, phase: item.phase }));

  if (prebuild.some((item) => item.status !== "passed")) return { prebuild, authoritative: null, webpack: null, remaining: [] };

  const authoritative = spawnChecked("npm", ["run", "build"], {
    cwd: target,
    env: childEnv,
    phase: "authoritative_build",
  });

  let webpack = null;
  if (authoritative.status !== "passed") {
    webpack = spawnChecked("node", ["node_modules/next/dist/bin/next", "build", "--webpack"], {
      cwd: target,
      env: childEnv,
      phase: "webpack_diagnostic_after_authoritative_failure",
    });
    return { prebuild, authoritative, webpack, remaining: [] };
  }

  const remaining = [
    spawnChecked("npm", ["run", "lint"], { cwd: target, env: childEnv, phase: "lint" }),
    spawnChecked("node", ["scripts/action-309-post-recovery-safety-guard.mjs"], { cwd: target, env: childEnv, phase: "action_309_guard" }),
  ];
  return { prebuild, authoritative, webpack, remaining };
}

function runExternalControlCommands() {
  const controls = [
    {
      command: "node",
      args: [
        "scripts/action-518-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-reconstruction-and-hash-freeze-verify.mjs",
      ],
      phase: "action_518_external_candidate_evidence",
    },
    {
      command: "node",
      args: [
        "scripts/action-532-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-runner-precheck-evidence-acceptance-gate-verify.mjs",
      ],
      phase: "action_532_external_evidence_acceptance",
    },
    {
      command: "node",
      args: [
        "scripts/action-533-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-candidate-rehearsal-handoff-gate-verify.mjs",
      ],
      phase: "action_533_external_handoff_evidence",
    },
    {
      command: "node",
      args: [
        "scripts/action-535-confidence-calibration-recommendation-advisory-projection-preview-action-534-historical-candidate-inventory-hash-exception-remediation-verify.mjs",
      ],
      phase: "action_535_external_historical_exception_evidence",
    },
    {
      command: "node",
      args: [
        "scripts/action-536-confidence-calibration-recommendation-advisory-projection-preview-action-534-command-boundary-remediation-verify.mjs",
      ],
      phase: "action_536_external_command_boundary_evidence",
    },
  ];

  return controls.map((item) => spawnChecked(item.command, item.args, { cwd: repoRoot, env: process.env, phase: item.phase }));
}

function writeResult(result) {
  const destination = join(repoRoot, resultPath);
  const temporary = `${destination}.${process.pid}.tmp`;
  const serialized = `${JSON.stringify(result, null, 2)}\n`;
  JSON.parse(serialized);
  writeFileSync(temporary, serialized, { mode: 0o600 });
  renameSync(temporary, destination);
}

async function main() {
  let target = null;
  let publicSignals = null;
  const priorResult = readPriorResult();
  const attemptMetadata = deriveAttemptMetadata(priorResult);
  const runnerHash = runnerScriptSha256();
  const started = {
    schema_version: "action_534_external_terminal_candidate_rehearsal_result_v1",
    runner_contract_version: runnerContractVersion,
    runner_script_sha256: runnerHash,
    result_written_at_utc: new Date().toISOString(),
    result_written_at_classification: "fresh_action_534_result_object_created",
    source_action: 533,
    execution_boundary: "operator_unrestricted_local_terminal",
    clean_base_identifier: expected.cleanBase,
    change_candidate_hash: expected.changeHash,
    full_candidate_inventory_hash: expected.fullHash,
    candidate_file_count: expected.fileCount,
    remediated_route_hash: expected.routeHash,
    required_public_build_signals_present: false,
    input_echo_suppressed: true,
    terminal_restoration: "raw_mode_restored_on_completion_error_and_interruption",
    build_performed: false,
    rehearsal_performed: false,
    deployment_performed: false,
    preview_activated: false,
    runtime_preview_state: "runtime_preview_waiting_for_operator_inputs",
    command_inventory_reference: commandInventory,
    command_boundary_vocabulary: [
      "candidate_internal_required",
      "candidate_internal_optional_if_present",
      "external_control_required_after_cleanup",
      "external_control_not_required_for_candidate",
      "invalid_boundary_assignment",
    ],
    historical_operator_attempt_count: attemptMetadata.historicalOperatorAttemptCount,
    operator_invocation_count: attemptMetadata.operatorInvocationCount,
    valid_runner_attempt_count: attemptMetadata.validRunnerAttemptCount,
    operator_rehearsal_attempt_number: attemptMetadata.nextOperatorAttemptNumber,
    prior_attempt_result: attemptMetadata.priorAttemptResult,
    prior_attempt_blocker: attemptMetadata.priorAttemptBlocker,
    prior_result_freshness_classification: attemptMetadata.resultFreshnessClassification,
    command_boundary_remediation_applied: true,
    previous_blocker_classification: attemptHistory.boundaryDefectClassification,
    stale_execution_classification: attemptHistory.staleExecutionClassification,
    fresh_result_object_created: true,
    prior_command_results_reused: false,
    atomic_result_replacement_enabled: true,
    next_action: "action_534_external_terminal_candidate_rehearsal_aborted_precondition_remediation_gate",
  };

  try {
    ensureProjectRoot();
    verifyAction532Acceptance();
    const inventory = verifyCandidateBinding();
    publicSignals = await collectPublicSignals();
    started.required_public_build_signals_present = true;
    const prepared = prepareActionTempTarget();
    target = prepared.target;
    materializeCleanBase(target);
    applyCandidateInventory(target, inventory);
    const reconstruction = verifyCandidateIntegrity(target, inventory);
    const previewFlag = verifyPreviewFlagDisabled();
    const dependencyResult = materializeDependencies(target);
    const childEnv = buildChildEnv(publicSignals);
    const commands = runSerialCommands(target, childEnv);
    publicSignals.NEXT_PUBLIC_SUPABASE_URL = "";
    publicSignals.NEXT_PUBLIC_SUPABASE_ANON_KEY = "";
    publicSignals = null;
    const cleanupResult = safeCleanup(target);
    target = null;
    const externalControls = runExternalControlCommands();

    const buildPassed = commands.authoritative?.status === "passed";
    const remainingPassed = commands.remaining.every((item) => item.status === "passed");
    const externalControlsPassed = externalControls.every((item) => item.status === "passed");
    const passed = buildPassed && remainingPassed && cleanupResult === "passed" && externalControlsPassed;

    writeResult({
      ...started,
      ...reconstruction,
      path_safety_result: "safe_action_534_temp_boundary_verified",
      runtime_dependency_closure_result: "complete",
      source_integrity_result: "baseline_plus_overlay_manifest_integrity",
      source_safety_result: "source_safety_passed",
      preview_flag_verification_result: previewFlag.result,
      dependency_materialization_result: dependencyResult,
      candidate_internal_command_results: commands.prebuild,
      prebuild_command_results: commands.prebuild,
      authoritative_build_attempt_count: commands.authoritative ? 1 : 0,
      authoritative_build_result: commands.authoritative?.status ?? "not_run",
      authoritative_build_phase: commands.authoritative?.phase ?? "not_run",
      authoritative_error_class: commands.authoritative?.error_class ?? "none",
      authoritative_implicated_paths: commands.authoritative?.implicated_paths ?? [],
      webpack_diagnostic_attempt_count: commands.webpack ? 1 : 0,
      webpack_diagnostic_result: commands.webpack?.status ?? "not_run",
      webpack_first_causal_error: commands.webpack ? { error_class: commands.webpack.error_class } : {},
      webpack_implicated_paths: commands.webpack?.implicated_paths ?? [],
      remaining_command_results: commands.remaining,
      external_control_results: externalControls,
      external_evidence_result: externalControlsPassed ? "passed" : "failed",
      external_controls_can_establish_readiness_without_build: false,
      runtime_projection_call_site_count: buildPassed ? 1 : null,
      candidate_modified: false,
      package_or_lockfile_modified: false,
      configuration_modified: false,
      source_dependency_tree_modified: false,
      active_worktree_modified_beyond_result: false,
      parent_environment_modified: false,
      raw_environment_values_recorded: false,
      environment_values_hashed: false,
      raw_logs_retained: false,
      absolute_machine_paths_recorded: false,
      credential_values_recorded: false,
      external_network_used: false,
      supabase_accessed: false,
      provider_called: false,
      persistence_created: false,
      replay_created: false,
      feedback_created: false,
      confidence_applied: false,
      downstream_behavior_changed: false,
      cleanup_result: cleanupResult,
      command_boundary_remediation_applied: true,
      previous_blocker_classification: attemptHistory.boundaryDefectClassification,
      candidate_rehearsal_result: passed
        ? "external_terminal_candidate_rehearsal_passed"
        : "external_terminal_candidate_rehearsal_failed",
      overall_readiness: passed ? "ready_for_preview_deployment_final_approval" : "blocked",
      build_performed: commands.authoritative !== null,
      rehearsal_performed: true,
      deployment_performed: false,
      preview_activated: false,
      runtime_preview_state: "runtime_preview_waiting_for_operator_inputs",
      next_action: passed
        ? "action_535_external_terminal_candidate_rehearsal_evidence_acceptance_gate"
        : "action_534_external_terminal_candidate_rehearsal_failure_diagnostic_gate",
    });
  } catch (error) {
    if (publicSignals) {
      publicSignals.NEXT_PUBLIC_SUPABASE_URL = "";
      publicSignals.NEXT_PUBLIC_SUPABASE_ANON_KEY = "";
    }
    const cleanupResult = target ? safeCleanup(target) : "skipped";
    writeResult({
      ...started,
      path_safety_result: target ? "cleanup_after_abort" : "not_reached",
      candidate_reconstruction_result: "not_completed",
      runtime_dependency_closure_result: "not_completed",
      source_integrity_result: "not_completed",
      source_safety_result: "not_completed",
      preview_flag_verification_result: "not_completed",
      dependency_materialization_result: "not_completed",
      candidate_internal_command_results: [],
      prebuild_command_results: [],
      authoritative_build_attempt_count: 0,
      authoritative_build_result: "not_run",
      authoritative_build_phase: "not_run",
      authoritative_error_class: boundedError(error),
      authoritative_implicated_paths: [],
      webpack_diagnostic_attempt_count: 0,
      webpack_diagnostic_result: "not_run",
      webpack_first_causal_error: {},
      webpack_implicated_paths: [],
      remaining_command_results: [],
      external_control_results: [],
      external_evidence_result: "not_run",
      external_controls_can_establish_readiness_without_build: false,
      runtime_projection_call_site_count: null,
      candidate_modified: false,
      package_or_lockfile_modified: false,
      configuration_modified: false,
      source_dependency_tree_modified: false,
      active_worktree_modified_beyond_result: false,
      parent_environment_modified: false,
      raw_environment_values_recorded: false,
      environment_values_hashed: false,
      raw_logs_retained: false,
      absolute_machine_paths_recorded: false,
      credential_values_recorded: false,
      external_network_used: false,
      supabase_accessed: false,
      provider_called: false,
      persistence_created: false,
      replay_created: false,
      feedback_created: false,
      confidence_applied: false,
      downstream_behavior_changed: false,
      cleanup_result: cleanupResult,
      command_boundary_remediation_applied: true,
      previous_blocker_classification: attemptHistory.boundaryDefectClassification,
      candidate_rehearsal_result: "external_terminal_candidate_rehearsal_aborted",
      overall_readiness: "blocked",
      build_performed: false,
      rehearsal_performed: true,
      deployment_performed: false,
      preview_activated: false,
      runtime_preview_state: "runtime_preview_waiting_for_operator_inputs",
      next_action: "action_534_external_terminal_candidate_rehearsal_aborted_precondition_remediation_gate",
    });
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
