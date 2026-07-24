#!/usr/bin/env node

import { createHash } from "crypto";
import { execFileSync, spawnSync } from "child_process";
import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "fs";
import { homedir, tmpdir } from "os";
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

const manifestPath = join(repoRoot, "docs/action-411-mapped-only-pattern-discovery-static-shadow-input-manifest.json");
const outputPath = resolve(realpathSync(tmpdir()), "ture/action-411-mapped-only-pattern-discovery-shadow");
const immutablePreviewCandidate = "/private/tmp/ture-action-370-corrected-preview-candidate";
const protectedPaths = {
  mapper_sha256: "lib/snapshot-to-learning-dataset-mapper.ts",
  pattern_discovery_sha256: "lib/pure-pattern-discovery.ts",
  learning_fixture_sha256: "lib/learning-dataset-static-fixtures.ts",
  context_fixture_sha256: "lib/intelligence-context-static-fixtures.ts",
  pattern_fixture_sha256: "lib/pattern-insight-static-fixtures.ts",
  action_400_runner_sha256: "scripts/action-400-expanded-static-mapper-shadow-run.mjs",
  action_400_manifest_sha256: "docs/action-400-expanded-static-mapper-shadow-input-manifest.json",
};
const orderedCaseIds = [
  "expanded_valid_bearish_risk_context",
  "expanded_valid_fda_event_context",
  "expanded_valid_future_event_excluded",
  "expanded_valid_identity_nfc_equivalent",
  "expanded_valid_identity_percent_encoding",
  "expanded_valid_sec_event_context",
  "valid_complete_mapping",
  "valid_equivalent_aliases",
  "valid_normalized_confidence",
  "valid_rich_context",
];
const permittedCaseKeys = [
  "canonical_mapper_input_sha256",
  "case_id",
  "duplicate_cluster_id",
  "expected_canonical_row_sha256",
  "expected_consumable",
  "expected_horizon",
  "expected_mapper_row_id",
  "expected_mapper_status",
  "expected_outcome_classification",
  "expected_row_present",
  "expected_setup_family",
  "order_index",
  "source_fixture_ids",
].sort(compareText);
const expectedConfig = {
  contract_version: "pure_pattern_discovery_contract_v1",
  configuration_version: "pattern_discovery_setup_family_v1",
  grouping_dimension: "setup_family",
  allowed_setup_families: ["momentum_continuation"],
  horizon: "60m",
  minimum_total_support: 20,
  minimum_completed_outcomes: 20,
  numeric_scale: 1000000,
  output_decimal_places: 4,
  rounding_mode: "half_away_from_zero",
  evidence_unit: "action_400_case_lineage",
  group_key_schema: "pattern_group:v1",
  static_only: true,
  non_authoritative: true,
  no_persistence: true,
  no_replay: true,
  no_runtime: true,
  no_feedback: true,
};
const decisionVocabulary = new Set(["shadow_passed", "shadow_passed_with_conditions", "shadow_failed", "shadow_aborted"]);

function compareText(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function canonicalValue(value) {
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new TypeError("non_finite_number");
    return Object.is(value, -0) ? 0 : value;
  }
  if (Array.isArray(value)) return value.map(canonicalValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort(compareText).map((key) => {
      if (value[key] === undefined) throw new TypeError("undefined_value");
      return [key, canonicalValue(value[key])];
    }));
  }
  throw new TypeError("unsupported_canonical_value");
}

export function canonicalJson(value) {
  return JSON.stringify(canonicalValue(value));
}

export function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function shaValue(value) {
  return sha256(canonicalJson(value));
}

function fileHash(relativePath) {
  return sha256(readFileSync(join(repoRoot, relativePath)));
}

function currentProtectedHashes() {
  return Object.fromEntries(Object.entries(protectedPaths).map(([key, path]) => [key, fileHash(path)]));
}

function loadJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function sourceStatus() {
  return execFileSync("git", ["status", "--short", "--untracked-files=all"], { cwd: repoRoot, encoding: "utf8" });
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
    .trim()
    .split("\n")
    .filter(Boolean);
}

export function validateOutputPath(candidate = outputPath) {
  const resolvedCandidate = resolve(candidate);
  const resolvedTemp = realpathSync(tmpdir());
  const forbiddenRoots = [
    resolve(repoRoot),
    resolve(immutablePreviewCandidate),
    resolve(homedir()),
    resolve(homedir(), ".config"),
    resolve(homedir(), ".codex"),
    resolve(homedir(), ".netlify"),
  ];
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

function forbiddenConsumerFiles() {
  const search = spawnSync("rg", ["-l", "pure-pattern-discovery|discoverPatterns", "app", "public"], { cwd: repoRoot, encoding: "utf8" });
  if (![0, 1].includes(search.status ?? -1)) throw new Error("pattern_discovery_consumer_inventory_failed");
  return search.stdout.trim().split("\n").filter((path) => /\.(?:ts|tsx|js|jsx)$/.test(path));
}

function validateManifest(manifest) {
  const declarations = [
    "static_only",
    "non_production",
    "non_authoritative",
    "non_learning",
    "no_persistence",
    "no_replay",
    "no_runtime",
    "no_external_access",
    "no_feedback",
  ];
  if (manifest.manifest_schema_version !== "action_411_mapped_only_pattern_discovery_static_shadow_manifest_v1") throw new Error("invalid_manifest_schema");
  if (!declarations.every((key) => manifest[key] === true)) throw new Error("invalid_manifest_declarations");
  for (const [key, actualHash] of Object.entries(currentProtectedHashes())) {
    if (manifest[key] !== actualHash) throw new Error(`protected_hash_mismatch:${key}`);
  }
  if (manifest.case_count !== 10 || !Array.isArray(manifest.ordered_cases) || manifest.ordered_cases.length !== 10) throw new Error("invalid_case_count");
  const ids = manifest.ordered_cases.map((item) => item.case_id);
  if (canonicalJson(ids) !== canonicalJson(orderedCaseIds) || new Set(ids).size !== 10) throw new Error("invalid_case_order");
  for (let index = 0; index < manifest.ordered_cases.length; index += 1) {
    const item = manifest.ordered_cases[index];
    if (canonicalJson(Object.keys(item).sort(compareText)) !== canonicalJson(permittedCaseKeys)) throw new Error(`invalid_case_schema:${item.case_id}`);
    if (item.order_index !== index + 1 || item.expected_mapper_status !== "mapped" || item.expected_row_present !== true || item.expected_consumable !== true) throw new Error(`invalid_case_expectation:${item.case_id}`);
    if (item.expected_setup_family !== "momentum_continuation" || item.expected_horizon !== "60m" || item.expected_outcome_classification !== "target_hit") throw new Error(`invalid_case_semantics:${item.case_id}`);
  }
  const runtimeConfig = { ...manifest.pattern_discovery_configuration };
  delete runtimeConfig.grouping_key_version;
  delete runtimeConfig.taxonomy_version;
  delete runtimeConfig.stable_sorting_policy;
  if (canonicalJson(runtimeConfig) !== canonicalJson(expectedConfig)) throw new Error("invalid_pattern_discovery_configuration");
}

function assertExpectedCase(manifestCase, caseDefinition, result) {
  const row = result.row;
  const rowHash = row ? shaValue(row) : null;
  if (caseDefinition.case_id !== manifestCase.case_id) throw new Error(`case_order_mismatch:${manifestCase.case_id}`);
  if (canonicalJson(caseDefinition.source_fixture_ids) !== canonicalJson(manifestCase.source_fixture_ids)) throw new Error(`source_fixture_mismatch:${manifestCase.case_id}`);
  if (caseDefinition.canonical_input_sha256 !== manifestCase.canonical_mapper_input_sha256) throw new Error(`input_hash_mismatch:${manifestCase.case_id}`);
  if (result.status !== "mapped" || result.status !== manifestCase.expected_mapper_status) throw new Error(`mapper_status_mismatch:${manifestCase.case_id}`);
  if (!row || manifestCase.expected_row_present !== true) throw new Error(`row_missing:${manifestCase.case_id}`);
  if (result.consumable !== true || result.consumable !== manifestCase.expected_consumable) throw new Error(`consumable_mismatch:${manifestCase.case_id}`);
  if (row.identity.dataset_row_id !== manifestCase.expected_mapper_row_id) throw new Error(`row_id_mismatch:${manifestCase.case_id}`);
  if (rowHash !== manifestCase.expected_canonical_row_sha256) throw new Error(`row_hash_mismatch:${manifestCase.case_id}`);
  if (row.setup_and_confidence.setup_family !== manifestCase.expected_setup_family) throw new Error(`setup_family_mismatch:${manifestCase.case_id}`);
  if (row.outcome_fields.outcome_window !== manifestCase.expected_horizon) throw new Error(`horizon_mismatch:${manifestCase.case_id}`);
  if (row.outcome_fields.outcome_status !== manifestCase.expected_outcome_classification) throw new Error(`outcome_mismatch:${manifestCase.case_id}`);
  if (row.anti_leakage_status !== "passed") throw new Error(`leakage_mismatch:${manifestCase.case_id}`);
  return {
    source_case_id: manifestCase.case_id,
    mapper_sha256: protectedPathsToManifestHash("mapper_sha256"),
    learning_fixture_sha256: protectedPathsToManifestHash("learning_fixture_sha256"),
    context_fixture_sha256: protectedPathsToManifestHash("context_fixture_sha256"),
    pattern_fixture_sha256: protectedPathsToManifestHash("pattern_fixture_sha256"),
    canonical_mapper_input_sha256: manifestCase.canonical_mapper_input_sha256,
    mapper_status: "mapped",
    mapper_row_id: manifestCase.expected_mapper_row_id,
    canonical_row_sha256: manifestCase.expected_canonical_row_sha256,
    consumable: true,
    static_only: true,
    non_authoritative: true,
    no_persistence: true,
    no_replay: true,
    no_runtime: true,
    no_feedback: true,
    row,
  };
}

function protectedPathsToManifestHash(key) {
  return currentProtectedHashes()[key];
}

function caseMetadata(envelope) {
  return {
    case_id: envelope.source_case_id,
    mapper_status: envelope.mapper_status,
    mapper_row_id: envelope.mapper_row_id,
    canonical_row_sha256: envelope.canonical_row_sha256,
    consumable: envelope.consumable,
  };
}

function patternMetadata(result) {
  const group = result.groups[0] ?? null;
  if (!group) throw new Error("missing_pattern_group");
  return {
    group_key: group.group_key,
    evidence_set_sha256: group.evidence_set_sha256,
    group_sha256: group.group_sha256,
    top_level_status: result.status,
    group_status: group.status,
    support_counts: {
      case_support_count: group.evidence.case_support_count,
      unique_mapper_row_count: group.evidence.unique_mapper_row_count,
    },
    outcome_counts: {
      completed_outcome_count: group.evidence.completed_outcome_count,
      positive_count: group.evidence.positive_count,
      negative_count: group.evidence.negative_count,
      neutral_count: group.evidence.neutral_count,
    },
    warning_codes: result.warnings.map((item) => item.code),
    insight_count: result.insights.length,
    canonical_result_sha256: result.canonical_result_sha256,
  };
}

function assertExpectedPatternResult(manifest, result) {
  const metadata = patternMetadata(result);
  if (metadata.top_level_status !== manifest.expected_statuses.top_level) throw new Error("top_level_status_mismatch");
  if (result.groups.length !== 1 || metadata.group_status !== manifest.expected_statuses.group) throw new Error("group_status_mismatch");
  if (metadata.group_key !== manifest.expected_group_key) throw new Error("group_key_mismatch");
  if (metadata.evidence_set_sha256 !== manifest.expected_evidence_set_sha256) throw new Error("evidence_set_hash_mismatch");
  if (metadata.group_sha256 !== manifest.expected_group_sha256) throw new Error("group_hash_mismatch");
  if (metadata.canonical_result_sha256 !== manifest.expected_result_sha256) throw new Error("result_hash_mismatch");
  if (canonicalJson(metadata.support_counts) !== canonicalJson({
    case_support_count: manifest.expected_support_counts.case_support_count,
    unique_mapper_row_count: manifest.expected_support_counts.unique_mapper_row_count,
  })) throw new Error("support_counts_mismatch");
  if (canonicalJson(metadata.outcome_counts) !== canonicalJson({
    completed_outcome_count: manifest.expected_outcome_counts.completed_outcome_count,
    positive_count: manifest.expected_outcome_counts.positive_count,
    negative_count: manifest.expected_outcome_counts.negative_count,
    neutral_count: manifest.expected_outcome_counts.neutral_count,
  })) throw new Error("outcome_counts_mismatch");
  if (canonicalJson(metadata.warning_codes) !== canonicalJson(manifest.expected_warning_codes)) throw new Error("warning_codes_mismatch");
  if (metadata.insight_count !== manifest.expected_insight_count) throw new Error("insight_count_mismatch");
  if (result.static_only !== true || result.non_authoritative !== true || result.no_persistence !== true || result.no_replay !== true || result.no_runtime !== true || result.no_feedback !== true) throw new Error("result_declaration_mismatch");
  return metadata;
}

async function runOnce(manifest, caseDefinitions, mapper, discoverPatterns) {
  const envelopes = caseDefinitions.map((caseDefinition, index) => {
    const before = canonicalJson(caseDefinition.input);
    const result = mapper(caseDefinition.input);
    if (canonicalJson(caseDefinition.input) !== before) throw new Error(`input_mutation:${caseDefinition.case_id}`);
    return assertExpectedCase(manifest.ordered_cases[index], caseDefinition, result);
  });
  const result = discoverPatterns({ configuration: expectedConfig, rows: envelopes });
  const metadata = {
    case_metadata: envelopes.map(caseMetadata),
    pattern_discovery: assertExpectedPatternResult(manifest, result),
    duplicate_clusters: manifest.duplicate_clusters,
    manifest_sha256: shaValue(manifest),
    source_integrity_results: currentProtectedHashes(),
    fixture_integrity_results: {
      learning_fixture_sha256: currentProtectedHashes().learning_fixture_sha256,
      context_fixture_sha256: currentProtectedHashes().context_fixture_sha256,
      pattern_fixture_sha256: currentProtectedHashes().pattern_fixture_sha256,
    },
    historical_integrity_results: {
      action_400_runner_sha256: currentProtectedHashes().action_400_runner_sha256,
      action_400_manifest_sha256: currentProtectedHashes().action_400_manifest_sha256,
    },
  };
  return { ...metadata, batch_sha256: shaValue(metadata) };
}

function assertMetadataOnly(evidence) {
  const serialized = canonicalJson(evidence);
  const forbidden = [
    "recommendationSnapshot",
    "contextSnapshot",
    "outcome_fields",
    "setup_and_confidence",
    "Pattern Discovery result",
    "insights\":[{",
    "TRADE_APP_PASSWORD",
    "AUTOMATION_SECRET",
  ];
  if (forbidden.some((marker) => serialized.includes(marker))) throw new Error("full_data_retained_in_evidence");
}

export async function runMappedOnlyPatternDiscoveryStaticShadow() {
  const statusBefore = sourceStatus();
  let executionStarted = false;
  let safeOutput = null;
  try {
    const manifest = loadJson(manifestPath);
    validateManifest(manifest);
    if (forbiddenConsumerFiles().length > 0) throw new Error("unexpected_pattern_discovery_consumer");
    safeOutput = validateOutputPath(outputPath);
    const [{ buildExpandedStaticShadowCases }, { mapSnapshotToLearningDataset }, { discoverPatterns }] = await Promise.all([
      import("./action-400-expanded-static-mapper-shadow-run.mjs"),
      import("../lib/snapshot-to-learning-dataset-mapper.ts"),
      import("../lib/pure-pattern-discovery.ts"),
    ]);
    const allCases = await buildExpandedStaticShadowCases();
    const caseDefinitions = orderedCaseIds.map((caseId) => {
      const match = allCases.find((item) => item.case_id === caseId);
      if (!match) throw new Error(`missing_case:${caseId}`);
      return match;
    });
    executionStarted = true;
    const run1 = await runOnce(manifest, caseDefinitions, mapSnapshotToLearningDataset, discoverPatterns);
    const run2 = await runOnce(manifest, caseDefinitions, mapSnapshotToLearningDataset, discoverPatterns);
    if (canonicalJson(run1) !== canonicalJson(run2)) throw new Error("repeat_run_nondeterminism");
    const evidence = {
      schema_version: "action_411_mapped_only_pattern_discovery_static_shadow_metadata_v1",
      case_metadata: run1.case_metadata,
      pattern_discovery: run1.pattern_discovery,
      batch: {
        manifest_sha256: run1.manifest_sha256,
        source_integrity_results: run1.source_integrity_results,
        fixture_integrity_results: run1.fixture_integrity_results,
        historical_integrity_results: run1.historical_integrity_results,
        run_1_batch_sha256: run1.batch_sha256,
        run_2_batch_sha256: run2.batch_sha256,
        repeat_run_identical: true,
        cleanup_result: "pending",
        persistence_result: "none",
        replay_result: "none",
        runtime_result: "none",
        external_access_result: "none",
        feedback_result: "none",
        authoritative_data_created: false,
        final_shadow_decision: "shadow_passed",
      },
    };
    assertMetadataOnly(evidence);
    mkdirSync(safeOutput, { recursive: true });
    const evidencePath = join(safeOutput, "metadata-evidence.json");
    writeFileSync(evidencePath, canonicalJson(evidence), { encoding: "utf8", flag: "wx" });
    const readback = loadJson(evidencePath);
    if (canonicalJson(readback) !== canonicalJson(evidence)) throw new Error("temporary_evidence_verification_failed");
    rmSync(safeOutput, { recursive: true, force: false });
    if (existsSync(safeOutput)) throw new Error("temporary_evidence_cleanup_failed");
    if (sourceStatus() !== statusBefore) throw new Error("source_status_changed");
    if (canonicalJson(currentProtectedHashes()) !== canonicalJson(Object.fromEntries(Object.entries(protectedPaths).map(([key]) => [key, manifest[key]])))) throw new Error("source_hash_changed");
    const report = {
      final_shadow_decision: "shadow_passed",
      case_count: 10,
      mapper_reconstruction_result: "passed",
      row_id_hash_result: "passed",
      duplicate_inventory_result: "passed",
      pattern_discovery_status: run1.pattern_discovery.top_level_status,
      group_status: run1.pattern_discovery.group_status,
      support_counts: run1.pattern_discovery.support_counts,
      outcome_counts: run1.pattern_discovery.outcome_counts,
      warning_codes: run1.pattern_discovery.warning_codes,
      insight_count: run1.pattern_discovery.insight_count,
      evidence_set_sha256: run1.pattern_discovery.evidence_set_sha256,
      group_sha256: run1.pattern_discovery.group_sha256,
      result_sha256: run1.pattern_discovery.canonical_result_sha256,
      repeat_run_identical: true,
      run_1_batch_sha256: run1.batch_sha256,
      run_2_batch_sha256: run2.batch_sha256,
      metadata_only_result: "passed",
      path_safety_result: "passed",
      cleanup_result: "passed",
      temporary_evidence_deleted: true,
      source_integrity_result: "passed",
      fixture_integrity_result: "passed",
      historical_integrity_result: "passed",
      persistence_result: "none",
      replay_result: "none",
      runtime_result: "none",
      external_access_result: "none",
      feedback_result: "none",
      authoritative_data_created: false,
      runtime_preview_status: "runtime_preview_waiting_for_operator_inputs",
    };
    if (!decisionVocabulary.has(report.final_shadow_decision)) throw new Error("invalid_shadow_decision");
    return report;
  } catch (error) {
    if (safeOutput && existsSync(safeOutput)) rmSync(safeOutput, { recursive: true, force: true });
    return {
      final_shadow_decision: executionStarted ? "shadow_failed" : "shadow_aborted",
      error_code: error instanceof Error ? error.message : "unknown_error",
      case_count: 0,
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

const result = await runMappedOnlyPatternDiscoveryStaticShadow();
process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
process.exitCode = result.final_shadow_decision === "shadow_passed" ? 0 : 1;
