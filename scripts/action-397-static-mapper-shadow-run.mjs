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

const { mapSnapshotToLearningDataset } = await import("../lib/snapshot-to-learning-dataset-mapper.ts");
const { getIntelligenceContextStaticFixtures } = await import("../lib/intelligence-context-static-fixtures.ts");

const protectedPaths = {
  mapper: "lib/snapshot-to-learning-dataset-mapper.ts",
  learning: "lib/learning-dataset-static-fixtures.ts",
  context: "lib/intelligence-context-static-fixtures.ts",
  pattern: "lib/pattern-insight-static-fixtures.ts",
};
const protectedHashes = {
  mapper: "7294a851ede33aadc0dbfcb68c13337cd244002b84be7cbbe40abbe91673741d",
  learning: "706bd57150914862604af70e0bba7614151f53c32abc5dbde9595c53bf4b332b",
  context: "46358cb997b4f7a431a3fee72562659da48b13219404224f4e80e08dbf8ed406",
  pattern: "db8dae9f101f710123a0a3ac6493356bd761c15f231023ab9742caefaacf8f57",
};
const manifestPath = join(repoRoot, "docs/action-397-static-mapper-shadow-input-manifest.json");
const outputPath = resolve(realpathSync(tmpdir()), "ture/action-397-static-mapper-shadow");
const at = "2026-07-08T13:45:00.000Z";
const fixedCaseIds = [
  "valid_complete_mapping",
  "valid_rich_context",
  "valid_missing_optional_context",
  "valid_pending_outcome",
  "valid_incomplete_outcome",
  "valid_stale_context",
  "valid_partial_context",
  "valid_conflicting_context",
  "valid_equivalent_aliases",
  "valid_normalized_confidence",
  "blocked_missing_required_identity",
  "blocked_invalid_linkage",
  "blocked_conflicting_aliases",
  "blocked_temporal_violation",
  "blocked_future_leakage",
  "blocked_invalid_provenance",
  "blocked_invalid_outcome",
  "blocked_invalid_input",
  "blocked_unsupported_literal_variant",
  "blocked_horizon_conflict",
];
const shadowDecisionVocabulary = new Set([
  "shadow_passed",
  "shadow_passed_with_conditions",
  "shadow_failed",
  "shadow_aborted",
]);

function canonicalValue(value) {
  if (Array.isArray(value)) return value.map(canonicalValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value).sort().map((key) => [key, canonicalValue(value[key])]),
    );
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
  return Object.fromEntries(
    Object.entries(protectedPaths).map(([key, path]) => [key, fileHash(path)]),
  );
}

function sourceStatus() {
  return execFileSync("git", ["status", "--short", "--untracked-files=all"], {
    cwd: repoRoot,
    encoding: "utf8",
  });
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

function snapshot(overrides = {}) {
  return {
    id: "snapshot:shadow397:001",
    snapshot_fingerprint: "snapshot_fingerprint:shadow397:001",
    recommendation_id: "recommendation:shadow397:001",
    scan_run_id: "scan_run:shadow397:001",
    ticker: "AAPL",
    company_name: "Apple",
    recommended_at: at,
    app_timestamp: at,
    window: "morning",
    status: "visible",
    source_mode: "action_397_static_shadow",
    data_mode: "action_397_static_shadow",
    market_session_phase: "morning",
    market_session_risk: null,
    market_session_source: null,
    is_visible: true,
    is_demo: false,
    is_mock: false,
    is_real: true,
    entry: 200,
    entry_low: 200,
    entry_high: 200,
    stop: 198,
    target: 204,
    side: "long",
    risk_per_share: 2,
    reward_per_share: 4,
    planned_risk_reward: 2,
    confidence: 0.78,
    score: 78,
    rating: "high",
    label: null,
    type: "momentum_continuation",
    rationale: "Action 397 static mapper shadow input",
    reason: null,
    catalyst: null,
    primary_risk: null,
    market_data_snapshot: null,
    quote_price: 200,
    volume: 1000,
    liquidity: "high",
    spread: 0.02,
    freshness: "fresh",
    data_age_minutes: 1,
    intake_quality_json: null,
    scan_observability_json: null,
    empty_state_json: null,
    quality_json: null,
    payload_json: {
      candidate_id: "candidate:shadow397:001",
      batch_fingerprint: "batch:shadow397:001",
      trading_day: "2026-07-08",
      setup_family: "momentum_continuation",
      confidence_label: "high",
      tier: "valid",
      invalidation_logic: "close_below_198",
      sanitizer_passed: true,
      risk_geometry_valid: true,
      snapshot_completeness: "complete",
      enrichment_version: "action_397_static_shadow_v1",
      outcome_horizon: "60m",
      side: "buy",
      confidence: 78,
    },
    was_taken: false,
    linked_position_id: null,
    created_at: at,
    updated_at: at,
    ...overrides,
  };
}

function contextFor(source, fixture) {
  const context = deepClone(fixture);
  return {
    ...context,
    recommendation_linkage: {
      recommendation_snapshot_id: source.id,
      recommendation_id: source.recommendation_id,
      recommendation_created_at: at,
    },
    context: {
      ...context.context,
      recommendation_snapshot_id: source.id,
      recommendation_id: source.recommendation_id,
      captured_at: "2026-07-08T13:44:30.000Z",
    },
  };
}

function outcomeFor(source, overrides = {}) {
  return {
    id: "outcome:shadow397:001",
    snapshot_id: source.id,
    snapshot_fingerprint: source.snapshot_fingerprint,
    recommendation_id: source.recommendation_id,
    ticker: source.ticker,
    side: "long",
    recommended_at: at,
    evaluated_at: "2026-07-08T14:45:00.000Z",
    horizon: "60m",
    status: "target_hit",
    entry: 200,
    stop: 198,
    target: 204,
    entry_triggered: true,
    entry_triggered_at: "2026-07-08T13:50:00.000Z",
    target_hit: true,
    target_hit_at: "2026-07-08T14:20:00.000Z",
    stop_hit: false,
    stop_hit_at: null,
    first_terminal_event: "target_hit",
    best_price_after_recommendation: 204.2,
    worst_price_after_recommendation: 199.5,
    best_r: 2.1,
    worst_r: -0.25,
    eod_price: 204,
    eod_r: 2,
    current_price: 204,
    current_r: 2,
    max_favorable_excursion: 4.2,
    max_adverse_excursion: -0.5,
    time_to_entry_minutes: 5,
    time_to_target_minutes: 35,
    time_to_stop_minutes: null,
    source: "action_397_static_shadow",
    provider: "action_397_static_shadow",
    data_completeness: "complete",
    warnings: [],
    blockers: [],
    payload_json: { gross_r_multiple: 2 },
    created_at: "2026-07-08T14:45:00.000Z",
    updated_at: "2026-07-08T14:45:00.000Z",
    ...overrides,
  };
}

function inputFor({ snapshotOverrides = {}, fixtureIndex = 0, context = "fixture", outcomeOverrides = {}, outcome = "fixture" } = {}) {
  const recommendationSnapshot = snapshot(snapshotOverrides);
  const fixtures = getIntelligenceContextStaticFixtures();
  return {
    recommendationSnapshot,
    contextSnapshot: context === "none" ? null : contextFor(recommendationSnapshot, fixtures[fixtureIndex]),
    outcome: outcome === "none" ? null : outcomeFor(recommendationSnapshot, outcomeOverrides),
  };
}

export function buildStaticShadowCases() {
  const complete = inputFor();
  const linkage = inputFor();
  const alias = inputFor({
    snapshotOverrides: {
      payload_json: { ...snapshot().payload_json, side: "sell" },
    },
  });
  const temporal = inputFor();
  temporal.contextSnapshot.effective_at = "2026-07-08T13:46:00.000Z";
  const leakage = inputFor();
  leakage.contextSnapshot.anti_leakage_status = "failed";
  const provenance = inputFor();
  provenance.contextSnapshot.freshness = { state: " fresh ", age_minutes_at_recommendation: 1 };

  const definitions = [
    { case_id: fixedCaseIds[0], source_fixture_ids: ["action397:test_local:complete", getIntelligenceContextStaticFixtures()[0].fixture_id], wrapper_classification: "test_local_complete", input: complete },
    { case_id: fixedCaseIds[1], source_fixture_ids: ["action397:test_local:rich", getIntelligenceContextStaticFixtures()[4].fixture_id], wrapper_classification: "fixture_derived_rich_context", input: inputFor({ fixtureIndex: 4 }) },
    { case_id: fixedCaseIds[2], source_fixture_ids: ["action397:test_local:missing_context"], wrapper_classification: "test_local_missing_optional_context", input: inputFor({ context: "none" }) },
    { case_id: fixedCaseIds[3], source_fixture_ids: ["action397:test_local:pending"], wrapper_classification: "test_local_pending_outcome", input: inputFor({ outcome: "none" }) },
    { case_id: fixedCaseIds[4], source_fixture_ids: ["action397:test_local:incomplete", getIntelligenceContextStaticFixtures()[0].fixture_id], wrapper_classification: "test_local_incomplete_outcome", input: inputFor({ outcomeOverrides: { status: "incomplete", data_completeness: "partial", target_hit: false, target_hit_at: null } }) },
    { case_id: fixedCaseIds[5], source_fixture_ids: ["action397:test_local:stale", getIntelligenceContextStaticFixtures()[12].fixture_id], wrapper_classification: "fixture_derived_stale_context", input: inputFor({ fixtureIndex: 12 }) },
    { case_id: fixedCaseIds[6], source_fixture_ids: ["action397:test_local:partial", getIntelligenceContextStaticFixtures()[3].fixture_id], wrapper_classification: "fixture_derived_partial_context", input: inputFor({ fixtureIndex: 3 }) },
    { case_id: fixedCaseIds[7], source_fixture_ids: ["action397:test_local:conflicting", getIntelligenceContextStaticFixtures()[2].fixture_id], wrapper_classification: "fixture_derived_conflicting_context", input: inputFor({ fixtureIndex: 2 }) },
    { case_id: fixedCaseIds[8], source_fixture_ids: ["action397:test_local:aliases", getIntelligenceContextStaticFixtures()[0].fixture_id], wrapper_classification: "test_local_equivalent_aliases", input: inputFor({ snapshotOverrides: { side: "BUY", payload_json: { ...snapshot().payload_json, direction: "long" } } }) },
    { case_id: fixedCaseIds[9], source_fixture_ids: ["action397:test_local:confidence", getIntelligenceContextStaticFixtures()[0].fixture_id], wrapper_classification: "test_local_normalized_confidence", input: inputFor({ snapshotOverrides: { confidence: "78", score: 0.78, payload_json: { ...snapshot().payload_json, confidence: 78, score: 0.78 } } }) },
    { case_id: fixedCaseIds[10], source_fixture_ids: ["action397:test_local:missing_identity"], wrapper_classification: "test_local_blocked_missing_identity", input: inputFor({ snapshotOverrides: { id: "" } }) },
    { case_id: fixedCaseIds[11], source_fixture_ids: ["action397:test_local:invalid_linkage"], wrapper_classification: "test_local_blocked_linkage", input: { ...linkage, outcome: { ...linkage.outcome, snapshot_id: "snapshot:other" } } },
    { case_id: fixedCaseIds[12], source_fixture_ids: ["action397:test_local:alias_conflict"], wrapper_classification: "test_local_blocked_alias_conflict", input: alias },
    { case_id: fixedCaseIds[13], source_fixture_ids: ["action397:test_local:temporal"], wrapper_classification: "test_local_blocked_temporal", input: temporal },
    { case_id: fixedCaseIds[14], source_fixture_ids: ["action397:test_local:future_leakage"], wrapper_classification: "test_local_blocked_future_leakage", input: leakage },
    { case_id: fixedCaseIds[15], source_fixture_ids: ["action397:test_local:provenance"], wrapper_classification: "test_local_blocked_provenance", input: provenance },
    { case_id: fixedCaseIds[16], source_fixture_ids: ["action397:test_local:outcome"], wrapper_classification: "test_local_blocked_outcome", input: inputFor({ outcomeOverrides: { status: "magic" } }) },
    { case_id: fixedCaseIds[17], source_fixture_ids: ["action397:test_local:input"], wrapper_classification: "test_local_blocked_input", input: inputFor({ snapshotOverrides: { entry: null } }) },
    { case_id: fixedCaseIds[18], source_fixture_ids: ["action397:test_local:literal"], wrapper_classification: "test_local_blocked_literal", input: inputFor({ snapshotOverrides: { payload_json: { ...snapshot().payload_json, outcome_horizon: "60M" } } }) },
    { case_id: fixedCaseIds[19], source_fixture_ids: ["action397:test_local:horizon_conflict"], wrapper_classification: "test_local_blocked_horizon_conflict", input: inputFor({ outcomeOverrides: { horizon: "30m" } }) },
  ];
  return definitions.map((definition) => ({
    ...definition,
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

export function validateOutputPath(candidate = outputPath) {
  const resolvedCandidate = resolve(candidate);
  const resolvedTemp = realpathSync(tmpdir());
  const forbiddenRoots = [
    realpathSync(repoRoot),
    resolve(homedir(), ".config"),
    resolve(homedir(), ".codex"),
    resolve(homedir(), ".netlify"),
    resolve(homedir(), ".ssh"),
  ];
  if (!isWithin(resolvedTemp, resolvedCandidate)) throw new Error("unsafe_output_not_within_system_temp");
  if (forbiddenRoots.some((root) => isWithin(root, resolvedCandidate))) throw new Error("unsafe_output_forbidden_root");
  const relativeSegments = relative(resolvedTemp, resolvedCandidate).split(/[\\/]/).filter(Boolean);
  let cursor = resolvedTemp;
  for (const segment of relativeSegments) {
    cursor = join(cursor, segment);
    const cursorStat = lstatIfPresent(cursor);
    if (cursorStat?.isSymbolicLink()) throw new Error("unsafe_output_symlink");
  }
  const candidateStat = lstatIfPresent(resolvedCandidate);
  if (candidateStat) {
    const stat = candidateStat;
    if (!stat.isDirectory()) throw new Error("unsafe_output_not_directory");
    if (readFileSafeDirectoryEntries(resolvedCandidate).length > 0) throw new Error("unsafe_output_not_empty");
  }
  return resolvedCandidate;
}

function readFileSafeDirectoryEntries(path) {
  return execFileSync("find", [path, "-mindepth", "1", "-maxdepth", "1", "-print"], { encoding: "utf8" })
    .trim().split("\n").filter(Boolean);
}

function loadManifest() {
  return JSON.parse(readFileSync(manifestPath, "utf8"));
}

function validateManifest(manifest, cases) {
  const declarations = ["static_only", "non_production", "non_authoritative", "no_replay", "no_persistence", "no_runtime", "no_feedback"];
  if (manifest.manifest_schema_version !== "action_397_static_mapper_shadow_manifest_v1") throw new Error("invalid_manifest_schema");
  if (!declarations.every((key) => manifest[key] === true)) throw new Error("invalid_manifest_declarations");
  if (manifest.mapper_sha256 !== protectedHashes.mapper || manifest.learning_fixture_sha256 !== protectedHashes.learning || manifest.context_fixture_sha256 !== protectedHashes.context || manifest.pattern_fixture_sha256 !== protectedHashes.pattern) throw new Error("manifest_protected_hash_mismatch");
  if (!Array.isArray(manifest.ordered_cases) || manifest.ordered_cases.length !== 20 || cases.length !== 20) throw new Error("invalid_case_count");
  const ids = manifest.ordered_cases.map((item) => item.case_id);
  if (new Set(ids).size !== 20 || canonicalJson(ids) !== canonicalJson(fixedCaseIds)) throw new Error("invalid_case_order");
  for (let index = 0; index < 20; index += 1) {
    const expected = manifest.ordered_cases[index];
    const actual = cases[index];
    if (expected.order_index !== index + 1 || expected.case_id !== actual.case_id) throw new Error("invalid_case_index");
    if (canonicalJson(expected.source_fixture_ids) !== canonicalJson(actual.source_fixture_ids) || expected.wrapper_classification !== actual.wrapper_classification || expected.canonical_input_sha256 !== actual.canonical_input_sha256) throw new Error("manifest_input_mismatch");
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
  if (record.status !== manifestCase.expected_status || record.row_present !== manifestCase.expected_row_present || record.consumable !== manifestCase.expected_consumable || canonicalJson(record.issue_codes) !== canonicalJson(manifestCase.expected_issue_codes) || canonicalJson(record.issue_paths) !== canonicalJson(manifestCase.expected_issue_paths)) {
    throw new Error(`expected_result_mismatch:${manifestCase.case_id}`);
  }
}

function executeBatch(manifest, cases) {
  return cases.map((caseDefinition, index) => {
    const before = canonicalJson(caseDefinition.input);
    const record = metadataRecord(caseDefinition, mapSnapshotToLearningDataset(caseDefinition.input));
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

export function runStaticMapperShadow() {
  const statusBefore = sourceStatus();
  const hashesBefore = currentProtectedHashes();
  let executionStarted = false;
  let safeOutput = null;
  try {
    if (canonicalJson(hashesBefore) !== canonicalJson(protectedHashes)) throw new Error("protected_hash_mismatch");
    const manifest = loadManifest();
    const manifestSha256 = sha256(canonicalJson(manifest));
    const cases = buildStaticShadowCases();
    validateManifest(manifest, cases);
    safeOutput = validateOutputPath(outputPath);
    const consumerSearch = spawnSync("rg", ["-l", "snapshot-to-learning-dataset-mapper", "app", "--glob", "*.{ts,tsx,js,jsx}"], { cwd: repoRoot, encoding: "utf8" });
    if (![0, 1].includes(consumerSearch.status ?? -1)) throw new Error("mapper_consumer_inventory_failed");
    const appConsumers = consumerSearch.stdout.trim();
    if (appConsumers) throw new Error("unexpected_mapper_consumer");

    executionStarted = true;
    const run1 = executeBatch(manifest, cases);
    const run2 = executeBatch(manifest, cases);
    const run1BatchSha256 = sha256(canonicalJson(run1));
    const run2BatchSha256 = sha256(canonicalJson(run2));
    if (canonicalJson(run1) !== canonicalJson(run2) || run1BatchSha256 !== run2BatchSha256) throw new Error("repeat_run_nondeterminism");

    const hashesAfterRuns = currentProtectedHashes();
    if (canonicalJson(hashesAfterRuns) !== canonicalJson(protectedHashes) || sourceStatus() !== statusBefore) throw new Error("source_integrity_changed");
    const evidence = {
      schema_version: "action_397_static_mapper_shadow_evidence_v1",
      mapper_sha256: protectedHashes.mapper,
      input_manifest_sha256: manifestSha256,
      learning_fixture_sha256: protectedHashes.learning,
      context_fixture_sha256: protectedHashes.context,
      pattern_fixture_sha256: protectedHashes.pattern,
      case_count: 20,
      ordered_case_ids: fixedCaseIds,
      status_counts: countStatuses(run1),
      results: run1,
      run_1_batch_sha256: run1BatchSha256,
      run_2_batch_sha256: run2BatchSha256,
      repeat_run_identical: true,
      mapper_integrity: "passed",
      fixture_integrity: "passed",
      persistence_result: "none",
      replay_result: "none",
      runtime_result: "none",
      external_access_result: "none",
      feedback_result: "none",
      authoritative_data_created: false,
      output_classification: ["local", "disposable", "synthetic/static-input-derived", "non-authoritative", "non-persisted", "non-production", "non-learning"],
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
      case_count: 20,
      status_counts: evidence.status_counts,
      expected_results_match: true,
      repeat_run_identical: true,
      run_1_batch_sha256: run1BatchSha256,
      run_2_batch_sha256: run2BatchSha256,
      input_manifest_sha256: manifestSha256,
      mapper_integrity: "passed",
      fixture_integrity: "passed",
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
    if (!shadowDecisionVocabulary.has(report.final_shadow_decision)) throw new Error("invalid_shadow_decision");
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
  const report = runStaticMapperShadow();
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  process.exitCode = report.final_shadow_decision === "shadow_passed" ? 0 : 1;
}
