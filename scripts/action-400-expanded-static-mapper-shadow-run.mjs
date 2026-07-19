#!/usr/bin/env node

import { createHash } from "crypto";
import { execFileSync, spawnSync } from "child_process";
import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "fs";
import { homedir } from "os";
import { dirname, isAbsolute, join, relative, resolve } from "path";
import { registerHooks } from "node:module";
import { fileURLToPath, pathToFileURL } from "url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@/")) {
      return nextResolve(pathToFileURL(resolve(repoRoot, `${specifier.slice(2)}.ts`)).href, context);
    }
    return nextResolve(specifier, context);
  },
});

const protectedPaths = {
  mapper: "lib/snapshot-to-learning-dataset-mapper.ts",
  learning: "lib/learning-dataset-static-fixtures.ts",
  context: "lib/intelligence-context-static-fixtures.ts",
  pattern: "lib/pattern-insight-static-fixtures.ts",
  action397Runner: "scripts/action-397-static-mapper-shadow-run.mjs",
  action397Manifest: "docs/action-397-static-mapper-shadow-input-manifest.json",
};
const protectedHashes = {
  mapper: "7294a851ede33aadc0dbfcb68c13337cd244002b84be7cbbe40abbe91673741d",
  learning: "706bd57150914862604af70e0bba7614151f53c32abc5dbde9595c53bf4b332b",
  context: "46358cb997b4f7a431a3fee72562659da48b13219404224f4e80e08dbf8ed406",
  pattern: "db8dae9f101f710123a0a3ac6493356bd761c15f231023ab9742caefaacf8f57",
  action397Runner: "eaab84c16302a8e2f27ae4043e810af9b405dd5a6e818db9d4784eb4d8ca291b",
  action397Manifest: "e9afd2d63a8f0d0041e14b60ae282cabe1afc742aeb707d65bf2ae2d67ccd741",
};
const action397CanonicalManifestHash = "79c9b8587dc9c56f9751589481a7270616909cbd5ba09c0bef7e3517a3e65e20";
const manifestPath = join(repoRoot, "docs/action-400-expanded-static-mapper-shadow-input-manifest.json");
const action397ManifestPath = join(repoRoot, protectedPaths.action397Manifest);
const outputPath = resolve(realpathSystemTemp(), "ture/action-400-expanded-static-mapper-shadow");
const immutablePreviewCandidate = "/private/tmp/ture-action-370-corrected-preview-candidate";

const originalCaseIds = [
  "valid_complete_mapping", "valid_rich_context", "valid_missing_optional_context", "valid_pending_outcome",
  "valid_incomplete_outcome", "valid_stale_context", "valid_partial_context", "valid_conflicting_context",
  "valid_equivalent_aliases", "valid_normalized_confidence", "blocked_missing_required_identity",
  "blocked_invalid_linkage", "blocked_conflicting_aliases", "blocked_temporal_violation", "blocked_future_leakage",
  "blocked_invalid_provenance", "blocked_invalid_outcome", "blocked_invalid_input",
  "blocked_unsupported_literal_variant", "blocked_horizon_conflict",
];
const addedCaseIds = [
  "expanded_valid_bearish_risk_context", "expanded_valid_fda_event_context", "expanded_valid_sec_event_context",
  "expanded_valid_future_event_excluded", "expanded_valid_news_unavailable_context",
  "expanded_valid_missing_semantics_context", "expanded_valid_identity_nfc_equivalent",
  "expanded_valid_identity_percent_encoding", "expanded_blocked_context_category_uppercase",
  "expanded_blocked_freshness_unicode_padding", "expanded_blocked_numeric_context_string",
  "expanded_blocked_payload_horizon_numeric", "expanded_blocked_outcome_horizon_uppercase",
  "expanded_blocked_linkage_fingerprint", "expanded_blocked_stale_complete_contradiction",
  "expanded_blocked_anti_leakage_unknown", "expanded_blocked_invalid_trading_window",
  "expanded_precedence_identity_over_provenance", "expanded_precedence_linkage_over_freshness",
  "expanded_precedence_leakage_over_outcome",
];
const fixedCaseIds = [...originalCaseIds, ...addedCaseIds];
const expectedStatusCounts = {
  mapped: 10,
  mapped_with_missing_optional_data: 8,
  blocked_missing_required_identity: 2,
  blocked_invalid_linkage: 4,
  blocked_conflicting_aliases: 1,
  blocked_temporal_violation: 1,
  blocked_future_leakage: 3,
  blocked_invalid_provenance: 5,
  blocked_invalid_outcome: 2,
  blocked_invalid_input: 4,
};
const decisionVocabulary = new Set([
  "shadow_passed", "shadow_passed_with_conditions", "shadow_failed", "shadow_aborted",
]);

function realpathSystemTemp() {
  return execFileSync("node", ["-e", "process.stdout.write(require('fs').realpathSync(require('os').tmpdir()))"], { encoding: "utf8" });
}

function canonicalValue(value) {
  if (Array.isArray(value)) return value.map(canonicalValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalValue(value[key])]));
  }
  return value;
}

export function canonicalJson(value) {
  return JSON.stringify(canonicalValue(value));
}

export function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function fileHash(relativePath) {
  return sha256(readFileSync(join(repoRoot, relativePath)));
}

function currentProtectedHashes() {
  return Object.fromEntries(Object.entries(protectedPaths).map(([key, path]) => [key, fileHash(path)]));
}

function sourceStatus() {
  return execFileSync("git", ["status", "--short", "--untracked-files=all"], { cwd: repoRoot, encoding: "utf8" });
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function deepFreeze(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const nested of Object.values(value)) deepFreeze(nested);
  }
  return value;
}

function contextFor(source, fixture) {
  const context = deepClone(fixture);
  return {
    ...context,
    recommendation_linkage: {
      recommendation_snapshot_id: source.id,
      recommendation_id: source.recommendation_id,
      recommendation_created_at: source.recommended_at,
    },
    context: {
      ...context.context,
      recommendation_snapshot_id: source.id,
      recommendation_id: source.recommendation_id,
      captured_at: "2026-07-08T13:44:30.000Z",
    },
  };
}

function addedDefinition(case_id, source_fixture_ids, wrapper_classification, coverage_family, input) {
  return { case_id, source_fixture_ids, wrapper_classification, coverage_family, input };
}

export async function buildExpandedStaticShadowCases() {
  if (canonicalJson(currentProtectedHashes()) !== canonicalJson(protectedHashes)) {
    throw new Error("protected_hash_mismatch");
  }
  const action397 = await import("./action-397-static-mapper-shadow-run.mjs");
  const { getIntelligenceContextStaticFixtures } = await import("../lib/intelligence-context-static-fixtures.ts");
  const originalCases = action397.buildStaticShadowCases();
  const fixtures = getIntelligenceContextStaticFixtures();
  const completeInput = () => deepClone(originalCases[0].input);
  const fixtureInput = (index) => {
    const input = completeInput();
    input.contextSnapshot = contextFor(input.recommendationSnapshot, fixtures[index]);
    return input;
  };

  const bearish = fixtureInput(1);
  const fda = fixtureInput(6);
  const sec = fixtureInput(7);
  const futureExcluded = fixtureInput(11);
  const newsUnavailable = fixtureInput(8);
  const missingSemantics = fixtureInput(13);
  const nfcIdentity = completeInput();
  nfcIdentity.recommendationSnapshot.snapshot_fingerprint = "cafe\u0301";
  nfcIdentity.outcome.snapshot_fingerprint = "cafe\u0301";
  const percentIdentity = completeInput();
  percentIdentity.recommendationSnapshot.snapshot_fingerprint = "shadow|percent% /397";
  percentIdentity.outcome.snapshot_fingerprint = "shadow|percent% /397";
  const uppercaseCategory = completeInput();
  uppercaseCategory.contextSnapshot.context.market.market_regime.value = "BULLISH";
  const unicodeFreshness = completeInput();
  unicodeFreshness.contextSnapshot.freshness.state = "fresh\u00a0";
  const numericContextString = completeInput();
  numericContextString.contextSnapshot.context.relative_strength.stock_vs_spy.value = "0.5";
  const numericPayloadHorizon = completeInput();
  numericPayloadHorizon.recommendationSnapshot.payload_json.outcome_horizon = 60;
  const uppercaseOutcomeHorizon = completeInput();
  delete uppercaseOutcomeHorizon.recommendationSnapshot.payload_json.outcome_horizon;
  uppercaseOutcomeHorizon.outcome.horizon = "60M";
  const linkageFingerprint = completeInput();
  linkageFingerprint.outcome.snapshot_fingerprint = "snapshot_fingerprint:other";
  const staleComplete = fixtureInput(12);
  staleComplete.contextSnapshot.data_provenance = deepClone(fixtures[0].data_provenance);
  const unknownLeakage = completeInput();
  unknownLeakage.contextSnapshot.anti_leakage_status = "unknown";
  const invalidWindow = completeInput();
  invalidWindow.recommendationSnapshot.window = "overnight";
  const identityPrecedence = completeInput();
  identityPrecedence.recommendationSnapshot.id = "";
  identityPrecedence.contextSnapshot.freshness.state = " fresh ";
  const linkagePrecedence = completeInput();
  linkagePrecedence.outcome.snapshot_id = "snapshot:other";
  linkagePrecedence.contextSnapshot.freshness.state = " fresh ";
  const leakagePrecedence = completeInput();
  leakagePrecedence.contextSnapshot.anti_leakage_status = "failed";
  leakagePrecedence.outcome.status = "magic";

  const added = [
    addedDefinition(addedCaseIds[0], [fixtures[1].fixture_id, "action400:test_local:complete"], "fixture_derived_bearish_risk_context", "valid_context", bearish),
    addedDefinition(addedCaseIds[1], [fixtures[6].fixture_id, "action400:test_local:complete"], "fixture_derived_fda_event_context", "valid_context", fda),
    addedDefinition(addedCaseIds[2], [fixtures[7].fixture_id, "action400:test_local:complete"], "fixture_derived_sec_event_context", "valid_context", sec),
    addedDefinition(addedCaseIds[3], [fixtures[11].fixture_id, "action400:test_local:complete"], "fixture_derived_future_event_excluded", "anti_leakage_valid", futureExcluded),
    addedDefinition(addedCaseIds[4], [fixtures[8].fixture_id, "action400:test_local:complete"], "fixture_derived_news_unavailable_context", "valid_missing_data", newsUnavailable),
    addedDefinition(addedCaseIds[5], [fixtures[13].fixture_id, "action400:test_local:complete"], "fixture_derived_missing_semantics_context", "valid_missing_data", missingSemantics),
    addedDefinition(addedCaseIds[6], ["action400:test_local:nfc_identity"], "test_local_identity_nfc_equivalent", "deterministic_identity", nfcIdentity),
    addedDefinition(addedCaseIds[7], ["action400:test_local:percent_identity"], "test_local_identity_percent_encoding", "deterministic_identity", percentIdentity),
    addedDefinition(addedCaseIds[8], ["action400:test_local:uppercase_category"], "test_local_context_category_uppercase", "malformed_category", uppercaseCategory),
    addedDefinition(addedCaseIds[9], ["action400:test_local:unicode_freshness"], "test_local_freshness_unicode_padding", "literal_validation", unicodeFreshness),
    addedDefinition(addedCaseIds[10], ["action400:test_local:numeric_context_string"], "test_local_numeric_context_string", "malformed_numeric", numericContextString),
    addedDefinition(addedCaseIds[11], ["action400:test_local:numeric_payload_horizon"], "test_local_payload_horizon_numeric", "horizon_validation", numericPayloadHorizon),
    addedDefinition(addedCaseIds[12], ["action400:test_local:uppercase_outcome_horizon"], "test_local_outcome_horizon_uppercase", "horizon_validation", uppercaseOutcomeHorizon),
    addedDefinition(addedCaseIds[13], ["action400:test_local:linkage_fingerprint"], "test_local_linkage_fingerprint", "linkage", linkageFingerprint),
    addedDefinition(addedCaseIds[14], [fixtures[12].fixture_id, "action400:test_local:complete_provenance_patch"], "fixture_derived_stale_complete_contradiction", "provenance_contradiction", staleComplete),
    addedDefinition(addedCaseIds[15], ["action400:test_local:unknown_anti_leakage"], "test_local_anti_leakage_unknown", "anti_leakage", unknownLeakage),
    addedDefinition(addedCaseIds[16], ["action400:test_local:invalid_trading_window"], "test_local_invalid_trading_window", "malformed_input", invalidWindow),
    addedDefinition(addedCaseIds[17], ["action400:test_local:identity_provenance_precedence"], "test_local_precedence_identity_over_provenance", "multi_fault_precedence", identityPrecedence),
    addedDefinition(addedCaseIds[18], ["action400:test_local:linkage_freshness_precedence"], "test_local_precedence_linkage_over_freshness", "multi_fault_precedence", linkagePrecedence),
    addedDefinition(addedCaseIds[19], ["action400:test_local:leakage_outcome_precedence"], "test_local_precedence_leakage_over_outcome", "multi_fault_precedence", leakagePrecedence),
  ];

  const retained = originalCases.map((definition) => ({
    ...definition,
    origin: "action_397_retained",
    coverage_family: "action_397_preserved",
  }));
  return [...retained, ...added].map((definition) => ({
    ...definition,
    origin: definition.origin ?? "action_400_added",
    input: deepFreeze(definition.input),
    canonical_input_sha256: sha256(canonicalJson(definition.input)),
  }));
}

function isWithin(parent, child) {
  const path = relative(parent, child);
  return path === "" || (!path.startsWith("..") && !isAbsolute(path));
}

function lstatIfPresent(path) {
  try {
    return lstatSync(path);
  } catch (error) {
    if (error && typeof error === "object" && error.code === "ENOENT") return null;
    throw error;
  }
}

function directoryEntries(path) {
  return execFileSync("find", [path, "-mindepth", "1", "-maxdepth", "1", "-print"], { encoding: "utf8" })
    .trim().split("\n").filter(Boolean);
}

export function validateOutputPath(candidate = outputPath) {
  const resolvedCandidate = resolve(candidate);
  const resolvedTemp = realpathSystemTemp();
  const forbiddenRoots = [
    resolve(repoRoot), resolve(immutablePreviewCandidate), resolve(homedir()),
    resolve(homedir(), ".config"), resolve(homedir(), ".codex"), resolve(homedir(), ".netlify"),
  ];
  if (isWithin(resolve(immutablePreviewCandidate), resolvedCandidate)) throw new Error("unsafe_output_forbidden_root");
  if (!isWithin(resolvedTemp, resolvedCandidate)) throw new Error("unsafe_output_not_within_system_temp");
  if (forbiddenRoots.some((root) => isWithin(root, resolvedCandidate))) throw new Error("unsafe_output_forbidden_root");
  if (relative(resolvedTemp, resolvedCandidate).split(/[\\/]/).includes("..")) throw new Error("unsafe_output_traversal");
  let cursor = resolvedTemp;
  for (const segment of relative(resolvedTemp, resolvedCandidate).split(/[\\/]/).filter(Boolean)) {
    cursor = join(cursor, segment);
    if (lstatIfPresent(cursor)?.isSymbolicLink()) throw new Error("unsafe_output_symlink");
  }
  const stat = lstatIfPresent(resolvedCandidate);
  if (stat && !stat.isDirectory()) throw new Error("unsafe_output_not_directory");
  if (stat && directoryEntries(resolvedCandidate).length > 0) throw new Error("unsafe_output_not_empty");
  return resolvedCandidate;
}

function loadJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function validateManifest(manifest, cases) {
  const declarations = [
    "static_only", "non_production", "non_authoritative", "non_learning", "no_replay",
    "no_persistence", "no_runtime", "no_external_access", "no_feedback",
  ];
  if (manifest.manifest_schema_version !== "action_400_expanded_static_mapper_shadow_manifest_v1") throw new Error("invalid_manifest_schema");
  if (!declarations.every((key) => manifest[key] === true)) throw new Error("invalid_manifest_declarations");
  if (manifest.mapper_sha256 !== protectedHashes.mapper || manifest.learning_fixture_sha256 !== protectedHashes.learning || manifest.context_fixture_sha256 !== protectedHashes.context || manifest.pattern_fixture_sha256 !== protectedHashes.pattern || manifest.action_397_runner_sha256 !== protectedHashes.action397Runner || manifest.action_397_raw_manifest_sha256 !== protectedHashes.action397Manifest) throw new Error("manifest_protected_hash_mismatch");
  if (manifest.original_case_count !== 20 || manifest.added_case_count !== 20 || manifest.total_case_count !== 40 || cases.length !== 40) throw new Error("invalid_case_count");
  if (canonicalJson(manifest.expected_status_counts) !== canonicalJson(expectedStatusCounts)) throw new Error("invalid_expected_status_counts");
  if (!Array.isArray(manifest.ordered_cases) || manifest.ordered_cases.length !== 40) throw new Error("invalid_ordered_cases");
  const ids = manifest.ordered_cases.map((item) => item.case_id);
  if (new Set(ids).size !== 40 || canonicalJson(ids) !== canonicalJson(fixedCaseIds)) throw new Error("invalid_case_order");
  const permittedKeys = ["case_id", "origin", "source_fixture_ids", "wrapper_classification", "coverage_family", "expected_status", "expected_row_present", "expected_consumable", "expected_issue_codes", "expected_issue_paths", "canonical_input_sha256", "order_index"].sort();
  for (let index = 0; index < 40; index += 1) {
    const expected = manifest.ordered_cases[index];
    const actual = cases[index];
    if (canonicalJson(Object.keys(expected).sort()) !== canonicalJson(permittedKeys)) throw new Error(`invalid_case_schema:${expected.case_id}`);
    if (expected.order_index !== index + 1 || expected.case_id !== actual.case_id || expected.origin !== actual.origin) throw new Error("invalid_case_index_or_origin");
    if (canonicalJson(expected.source_fixture_ids) !== canonicalJson(actual.source_fixture_ids) || expected.wrapper_classification !== actual.wrapper_classification || expected.coverage_family !== actual.coverage_family || expected.canonical_input_sha256 !== actual.canonical_input_sha256) throw new Error(`manifest_input_mismatch:${expected.case_id}`);
  }
  const historical = loadJson(action397ManifestPath);
  if (sha256(canonicalJson(historical)) !== action397CanonicalManifestHash) throw new Error("action397_canonical_manifest_mismatch");
  for (let index = 0; index < 20; index += 1) {
    const retained = manifest.ordered_cases[index];
    const original = historical.ordered_cases[index];
    for (const key of ["case_id", "source_fixture_ids", "wrapper_classification", "expected_status", "expected_row_present", "expected_consumable", "expected_issue_codes", "expected_issue_paths", "canonical_input_sha256", "order_index"]) {
      if (canonicalJson(retained[key]) !== canonicalJson(original[key])) throw new Error(`action397_case_changed:${retained.case_id}:${key}`);
    }
  }
}

function metadataRecord(caseDefinition, result) {
  const bounded = {
    case_id: caseDefinition.case_id,
    status: result.status,
    row_id: result.row?.identity?.dataset_row_id ?? null,
    row_present: result.row !== null,
    consumable: result.consumable,
    issue_codes: result.issues.map((item) => item.code),
    issue_paths: result.issues.map((item) => item.path),
    issue_severities: result.issues.map((item) => item.severity),
  };
  return { ...bounded, canonical_result_sha256: sha256(canonicalJson(bounded)) };
}

function assertExpected(manifestCase, record) {
  if (record.status !== manifestCase.expected_status || record.row_present !== manifestCase.expected_row_present || record.consumable !== manifestCase.expected_consumable || canonicalJson(record.issue_codes) !== canonicalJson(manifestCase.expected_issue_codes) || canonicalJson(record.issue_paths) !== canonicalJson(manifestCase.expected_issue_paths)) throw new Error(`expected_result_mismatch:${manifestCase.case_id}`);
  if (manifestCase.case_id === "expanded_valid_identity_nfc_equivalent" && record.row_id !== "learning_row:v1:learning_dataset_static_fixture_v1|caf%C3%A9|60m|outcome%3Ashadow397%3A001") throw new Error("nfc_identity_assertion_failed");
  if (manifestCase.case_id === "expanded_valid_identity_percent_encoding" && record.row_id !== "learning_row:v1:learning_dataset_static_fixture_v1|shadow%7Cpercent%25%20%2F397|60m|outcome%3Ashadow397%3A001") throw new Error("percent_identity_assertion_failed");
}

async function executeBatch(manifest, cases, mapper) {
  return cases.map((caseDefinition, index) => {
    const before = canonicalJson(caseDefinition.input);
    const record = metadataRecord(caseDefinition, mapper(caseDefinition.input));
    if (canonicalJson(caseDefinition.input) !== before) throw new Error(`input_mutation:${caseDefinition.case_id}`);
    assertExpected(manifest.ordered_cases[index], record);
    return record;
  });
}

function countStatuses(records) {
  const counts = {};
  for (const record of records) counts[record.status] = (counts[record.status] ?? 0) + 1;
  return Object.fromEntries(Object.entries(counts).sort(([a], [b]) => a.localeCompare(b)));
}

function forbiddenConsumerFiles() {
  const search = spawnSync("rg", ["-l", "snapshot-to-learning-dataset-mapper", "app"], { cwd: repoRoot, encoding: "utf8" });
  if (![0, 1].includes(search.status ?? -1)) throw new Error("mapper_consumer_inventory_failed");
  return search.stdout.trim().split("\n").filter((path) => /\.(?:ts|tsx|js|jsx)$/.test(path));
}

export async function runExpandedStaticMapperShadow() {
  const statusBefore = sourceStatus();
  const hashesBefore = currentProtectedHashes();
  let executionStarted = false;
  let safeOutput = null;
  try {
    if (canonicalJson(hashesBefore) !== canonicalJson(protectedHashes)) throw new Error("protected_hash_mismatch");
    if (forbiddenConsumerFiles().length > 0) throw new Error("unexpected_mapper_consumer");
    const manifest = loadJson(manifestPath);
    const manifestSha256 = sha256(canonicalJson(manifest));
    const cases = await buildExpandedStaticShadowCases();
    validateManifest(manifest, cases);
    safeOutput = validateOutputPath(outputPath);
    const { mapSnapshotToLearningDataset } = await import("../lib/snapshot-to-learning-dataset-mapper.ts");

    executionStarted = true;
    const run1 = await executeBatch(manifest, cases, mapSnapshotToLearningDataset);
    const run2 = await executeBatch(manifest, cases, mapSnapshotToLearningDataset);
    const statusCounts = countStatuses(run1);
    if (canonicalJson(statusCounts) !== canonicalJson(expectedStatusCounts)) throw new Error("expected_status_distribution_mismatch");
    const run1BatchSha256 = sha256(canonicalJson(run1));
    const run2BatchSha256 = sha256(canonicalJson(run2));
    if (canonicalJson(run1) !== canonicalJson(run2) || run1BatchSha256 !== run2BatchSha256) throw new Error("repeat_run_nondeterminism");
    if (canonicalJson(currentProtectedHashes()) !== canonicalJson(protectedHashes) || sourceStatus() !== statusBefore) throw new Error("source_integrity_changed");

    const evidence = {
      schema_version: "action_400_expanded_static_mapper_shadow_evidence_v1",
      mapper_sha256: protectedHashes.mapper,
      learning_fixture_sha256: protectedHashes.learning,
      context_fixture_sha256: protectedHashes.context,
      pattern_fixture_sha256: protectedHashes.pattern,
      action_397_runner_sha256: protectedHashes.action397Runner,
      action_397_raw_manifest_sha256: protectedHashes.action397Manifest,
      action_397_canonical_manifest_sha256: action397CanonicalManifestHash,
      expanded_manifest_sha256: manifestSha256,
      case_count: 40,
      original_case_count: 20,
      added_case_count: 20,
      ordered_case_ids: fixedCaseIds,
      status_counts: statusCounts,
      results: run1,
      run_1_batch_sha256: run1BatchSha256,
      run_2_batch_sha256: run2BatchSha256,
      repeat_run_identical: true,
      source_integrity: "passed",
      fixture_integrity: "passed",
      action_397_historical_integrity: "passed",
      path_safety: "passed",
      persistence_result: "none",
      replay_result: "none",
      runtime_result: "none",
      external_access_result: "none",
      feedback_result: "none",
      authoritative_data_created: false,
      final_shadow_decision: "shadow_passed",
    };
    mkdirSync(safeOutput, { recursive: true });
    const evidencePath = join(safeOutput, "evidence.json");
    writeFileSync(evidencePath, canonicalJson(evidence), { encoding: "utf8", flag: "wx" });
    if (readFileSync(evidencePath, "utf8") !== canonicalJson(evidence)) throw new Error("temporary_evidence_verification_failed");
    rmSync(safeOutput, { recursive: true, force: false });
    if (existsSync(safeOutput)) throw new Error("temporary_evidence_cleanup_failed");
    if (sourceStatus() !== statusBefore || canonicalJson(currentProtectedHashes()) !== canonicalJson(protectedHashes)) throw new Error("post_cleanup_source_integrity_changed");

    const report = {
      final_shadow_decision: "shadow_passed",
      case_count: 40,
      original_case_count: 20,
      added_case_count: 20,
      status_counts: statusCounts,
      expected_results_match: true,
      repeat_run_identical: true,
      run_1_batch_sha256: run1BatchSha256,
      run_2_batch_sha256: run2BatchSha256,
      expanded_manifest_sha256: manifestSha256,
      source_integrity: "passed",
      fixture_integrity: "passed",
      action_397_historical_integrity: "passed",
      path_safety: "passed",
      metadata_only: true,
      temporary_output_classification: "system_temp_disposable",
      temporary_evidence_deleted: true,
      persistence_result: "none",
      replay_result: "none",
      runtime_result: "none",
      external_access_result: "none",
      feedback_result: "none",
      authoritative_data_created: false,
      mapper_consumer_files_outside_approved_boundary: [],
      runtime_preview_status: "runtime_preview_waiting_for_operator_inputs",
    };
    if (!decisionVocabulary.has(report.final_shadow_decision)) throw new Error("invalid_shadow_decision");
    return report;
  } catch (error) {
    if (safeOutput && existsSync(safeOutput)) rmSync(safeOutput, { recursive: true, force: true });
    return {
      final_shadow_decision: executionStarted ? "shadow_failed" : "shadow_aborted",
      reason: error instanceof Error ? error.message : "unknown_shadow_error",
      temporary_evidence_deleted: !safeOutput || !existsSync(safeOutput),
      persistence_result: "none",
      replay_result: "none",
      runtime_result: "none",
      external_access_result: "none",
      feedback_result: "none",
      authoritative_data_created: false,
      runtime_preview_status: "runtime_preview_waiting_for_operator_inputs",
    };
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const report = await runExpandedStaticMapperShadow();
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  process.exitCode = report.final_shadow_decision === "shadow_passed" ? 0 : 1;
}
