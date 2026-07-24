#!/usr/bin/env node

import { createHash } from "crypto";
import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "fs";
import { homedir, tmpdir } from "os";
import { dirname, isAbsolute, join, relative, resolve, sep } from "path";
import { fileURLToPath, pathToFileURL } from "url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export const paths = {
  manifest: "docs/action-429-static-confidence-calibration-shadow-input-manifest.json",
  action426Inventory: "docs/action-426-static-confidence-calibration-hash-inventory.json",
  calibrationModule: "lib/pure-confidence-calibration.ts",
};

const expectedInventoryHash = "875f385a05f58d982baa182350a662db5518e13f8c18557e4697317deb724cc5";
const expectedScenarioIds = Array.from({ length: 45 }, (_, index) => `cc425_${String(index + 1).padStart(2, "0")}`);
const expectedProtectedHashes = {
  "lib/pure-confidence-calibration.ts": "bd913c95d04fc450f4499b18c01744da04a148e8d18cb4d9113d990ee8deaa70",
  "lib/pure-pattern-discovery.ts": "48b7667c8690a1d8d56b819a3727e37ea73af7710a45131eb3debab48627191c",
  "lib/snapshot-to-learning-dataset-mapper.ts": "7294a851ede33aadc0dbfcb68c13337cd244002b84be7cbbe40abbe91673741d",
  "lib/learning-dataset-static-fixtures.ts": "706bd57150914862604af70e0bba7614151f53c32abc5dbde9595c53bf4b332b",
  "lib/intelligence-context-static-fixtures.ts": "46358cb997b4f7a431a3fee72562659da48b13219404224f4e80e08dbf8ed406",
  "lib/pattern-insight-static-fixtures.ts": "db8dae9f101f710123a0a3ac6493356bd761c15f231023ab9742caefaacf8f57",
  "docs/action-416-expanded-static-pattern-discovery-shadow-input-manifest.json": "dbafd56a7c0f8c2eb79f22039cb9b1225e42f246e78ca278cd4344f72d39d652",
  "scripts/action-416-expanded-static-pattern-discovery-shadow-run.mjs": "b77f018e888d736dbf696ac0acc0b5c16a826b2bab26f09db42ecc28f956d7ea",
  "scripts/action-426-static-confidence-calibration-hash-freeze.mjs": "f8cf5af48f640a2158f17f92b6321340d17f334577534fc8b675969e9ff223fa",
  "docs/action-426-static-confidence-calibration-hash-inventory.json": "e19e320a662ab0d18500fb1b630563fdf1f3361a592afe00ff4af0ec6e9d69fe",
};
const decisionVocabulary = new Set([
  "shadow_passed",
  "shadow_passed_with_conditions",
  "shadow_failed",
  "shadow_aborted",
]);
const tempDirectory = resolve(realpathSync(tmpdir()), "ture/action-429-static-confidence-calibration-shadow");

const abs = (path) => join(repoRoot, path);
const shaBytes = (value) => createHash("sha256").update(value).digest("hex");
const shaText = (value) => shaBytes(Buffer.from(value, "utf8"));
const shaFile = (path) => shaBytes(readFileSync(abs(path)));

export function canonicalize(value) {
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new TypeError("non_finite_canonical_number");
    return Object.is(value, -0) ? 0 : value;
  }
  if (Array.isArray(value)) return value.map(canonicalize);
  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, child]) => child !== undefined)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, canonicalize(child)]),
    );
  }
  throw new TypeError("unsupported_canonical_value");
}

export function canonicalJson(value) {
  return JSON.stringify(canonicalize(value));
}

function stableHash(value) {
  return shaText(canonicalJson(value));
}

function readJson(path) {
  return JSON.parse(readFileSync(abs(path), "utf8"));
}

function same(left, right) {
  return canonicalJson(left) === canonicalJson(right);
}

function assertEqual(label, actual, expected) {
  if (!same(actual, expected)) {
    throw new Error(`expected_result_mismatch:${label}`);
  }
}

function assertTextEqual(label, actual, expected) {
  if (actual !== expected) throw new Error(`expected_result_mismatch:${label}:${actual}:${expected}`);
}

function isInside(parent, child) {
  const rel = relative(parent, child);
  return rel === "" || (!rel.startsWith("..") && !isAbsolute(rel));
}

function lstatOrNull(path) {
  try {
    return lstatSync(path);
  } catch (error) {
    if (error && typeof error === "object" && error.code === "ENOENT") return null;
    throw error;
  }
}

function assertNoSymlinkInExistingChain(rootPath, targetPath) {
  let current = rootPath;
  const relativeParts = relative(rootPath, targetPath).split(sep).filter(Boolean);
  for (const part of relativeParts) {
    current = join(current, part);
    const stat = lstatOrNull(current);
    if (stat?.isSymbolicLink()) throw new Error("unsafe_output_parent_chain_symlink");
    if (!stat) return;
  }
}

export function assertSafeTempDirectory(candidate = tempDirectory) {
  const systemTemp = realpathSync(tmpdir());
  const resolved = resolve(candidate);
  if (!isInside(systemTemp, resolved)) throw new Error("unsafe_output_not_within_system_temp");
  if (isInside(repoRoot, resolved) || isInside(resolved, repoRoot)) throw new Error("unsafe_output_repository_path");
  if (isInside(resolve(homedir()), resolved)) throw new Error("unsafe_output_home_or_config_path");
  if (resolved.includes("..")) throw new Error("unsafe_output_path_traversal");
  assertNoSymlinkInExistingChain(systemTemp, resolved);
  const stat = lstatOrNull(resolved);
  if (stat?.isSymbolicLink()) throw new Error("unsafe_output_symlink");
  if (stat && !stat.isDirectory()) throw new Error("unsafe_output_existing_file");
  if (stat?.isDirectory() && readdirSync(resolved).length > 0) throw new Error("unsafe_output_not_empty");
  return resolved;
}

function verifyProtectedHashes() {
  return Object.fromEntries(
    Object.entries(expectedProtectedHashes).map(([path, expected]) => {
      if (!existsSync(abs(path))) throw new Error(`protected_source_missing:${path}`);
      const actual = shaFile(path);
      if (actual !== expected) throw new Error(`protected_source_hash_mismatch:${path}:${actual}`);
      return [path, { expected, actual, matches: true }];
    }),
  );
}

function baseInput(baseConfidence) {
  const value = baseConfidence.canonical_basis_points;
  if (typeof value === "number") return value / 100;
  if (value === "NaN") return Number.NaN;
  if (value === "Infinity") return Number.POSITIVE_INFINITY;
  return value;
}

function inputInsight(envelope) {
  const insight = envelope.evidence_direction === "malformed_or_missing"
    ? { setup_family: "momentum_continuation" }
    : {
        setup_family: "momentum_continuation",
        horizon: "60m",
        evidence_direction: envelope.evidence_direction,
        evidence_quality: envelope.evidence_quality,
        total_support: 20,
        unique_snapshot_support: 20,
        completed_outcome_count: 20,
      };
  return {
    pattern_discovery_sha256: envelope.pattern_discovery_sha256,
    pattern_discovery_configuration_version: "pattern_discovery_setup_family_v1",
    pattern_discovery_result_sha256: envelope.pattern_discovery_result_sha256,
    evidence_set_sha256: envelope.evidence_set_sha256,
    group_sha256: envelope.group_sha256,
    insight_id: envelope.insight_id,
    insight_sha256: envelope.insight_sha256,
    source_scenario_ids: envelope.source_scenario_ids,
    source_snapshot_ids: envelope.source_snapshot_ids,
    pattern_discovery_status: envelope.pattern_discovery_status,
    warning_codes: envelope.warning_codes_input,
    static_only: envelope.static_only,
    non_authoritative: envelope.non_authoritative,
    no_persistence: envelope.no_persistence,
    no_replay: envelope.no_replay,
    no_runtime: envelope.no_runtime,
    no_feedback: envelope.no_feedback,
    anti_leakage_status: envelope.anti_leakage_status,
    insight,
  };
}

function scenarioInput(manifest, scenario) {
  return {
    baseConfidence: baseInput(scenario.base_confidence),
    insights: scenario.insight_inventory.map(inputInsight),
    configuration: scenario.expected_invalid_configuration === true
      ? { ...manifest.configuration, output_decimal_precision: 3 }
      : manifest.configuration,
  };
}

function independentIdentityHash(definition, result) {
  if (!result.calibration_hash) return null;
  const selectedEnvelopes = [
    ...new Map(definition.insight_inventory
      .map(inputInsight)
      .filter((envelope) => result.included_insight_ids.includes(envelope.insight_id))
      .map((envelope) => [
        [
          envelope.pattern_discovery_configuration_version,
          envelope.pattern_discovery_result_sha256,
          envelope.evidence_set_sha256,
          envelope.group_sha256,
          envelope.insight_id,
          envelope.insight_sha256,
        ].join("\u0000"),
        envelope,
      ])).values(),
  ];
  const includedHashes = selectedEnvelopes.map((envelope) => envelope.insight_sha256).sort();
  const firstIncluded = selectedEnvelopes
    .sort((left, right) =>
      [
        left.pattern_discovery_configuration_version,
        left.pattern_discovery_result_sha256,
        left.evidence_set_sha256,
        left.group_sha256,
        left.insight_id,
        left.insight_sha256,
      ].join("\u0000").localeCompare([
        right.pattern_discovery_configuration_version,
        right.pattern_discovery_result_sha256,
        right.evidence_set_sha256,
        right.group_sha256,
        right.insight_id,
        right.insight_sha256,
      ].join("\u0000")))
    [0];
  return stableHash({
    schema_marker: "confidence_calibration_result_v1",
    status: result.status,
    configuration_version: firstIncluded?.pattern_discovery_configuration_version ?? null,
    base_confidence_basis_points: definition.base_confidence.canonical_basis_points,
    included_insight_ids: result.included_insight_ids,
    included_insight_hashes: includedHashes,
    excluded_insight_ids: result.excluded_insight_ids,
    overlap_resolution_summary: result.overlap_summary,
    proposed_delta_basis_points: Math.round((result.proposed_delta ?? 0) * 100),
    proposed_calibrated_confidence_basis_points: Math.round((result.proposed_calibrated_confidence ?? 0) * 100),
  });
}

function strippedRecords(records) {
  return records.map((item) => ({ code: item.code, path: item.path }));
}

function completeIssueRecords(records) {
  return records.map((item) => ({
    code: item.code,
    path: item.path,
    severity: item.severity,
    messageKey: item.messageKey,
  }));
}

function completeWarningRecords(records) {
  return records.map((item) => ({
    code: item.code,
    path: item.path,
    severity: item.severity,
    messageKey: item.messageKey,
  }));
}

function summarizeActualScenario(scenario, result) {
  const individualDeltas = result.adjustments.map((adjustment) => ({
    insight_id: adjustment.insight_id,
    base_delta_basis_points: adjustment.base_delta_basis_points,
    adjusted_delta_basis_points: adjustment.adjusted_delta_basis_points,
    evidence_quality: adjustment.evidence_quality,
    warning_codes: adjustment.warning_codes,
  }));
  const preCapAggregateDelta = individualDeltas.reduce((sum, adjustment) => sum + adjustment.adjusted_delta_basis_points, 0);
  const postCapAggregateDelta = Math.round((result.proposed_delta ?? 0) * 100);
  const unclampedConfidence = typeof scenario.base_confidence.canonical_basis_points === "number"
    ? scenario.base_confidence.canonical_basis_points + postCapAggregateDelta
    : null;
  const finalConfidence = result.proposed_calibrated_confidence === null
    ? null
    : Math.round(result.proposed_calibrated_confidence * 100);
  const summary = {
    scenario_id: scenario.scenario_id,
    coverage_family: scenario.coverage_family,
    base_confidence: scenario.base_confidence,
    source_classification: scenario.source_classification,
    configuration_version: scenario.configuration_version,
    insight_inventory: scenario.insight_inventory,
    status: result.status,
    individual_deltas_basis_points: individualDeltas,
    pre_cap_aggregate_delta_basis_points: result.proposed_delta === null ? null : preCapAggregateDelta,
    post_cap_aggregate_delta_basis_points: result.proposed_delta === null ? null : postCapAggregateDelta,
    unclamped_confidence_basis_points: unclampedConfidence,
    final_proposed_confidence_basis_points: finalConfidence,
    clamping_state: {
      clamped: result.warnings.some((warning) => warning.code === "confidence_clamped_to_bounds"),
      warning_code: result.warnings.some((warning) => warning.code === "confidence_clamped_to_bounds")
        ? "confidence_clamped_to_bounds"
        : null,
    },
    included_insight_ids: result.included_insight_ids,
    excluded_insight_ids: result.excluded_insight_ids,
    warning_inventory: strippedRecords(result.warnings),
    issue_inventory: strippedRecords(result.issues),
    overlap_resolution: result.overlap_summary,
    calibration_id: result.calibration_id,
    identity_sha256: result.calibration_hash,
    independent_identity_sha256: independentIdentityHash(scenario, result),
    canonical_result_sha256: stableHash({
      status: result.status,
      calibration_id: result.calibration_id,
      calibration_hash: result.calibration_hash,
      original_confidence: result.original_confidence,
      proposed_delta: result.proposed_delta,
      proposed_calibrated_confidence: result.proposed_calibrated_confidence,
      included_insight_ids: result.included_insight_ids,
      excluded_insight_ids: result.excluded_insight_ids,
      evidence_summary: result.evidence_summary,
      overlap_summary: result.overlap_summary,
      adjustments: result.adjustments,
      warnings: result.warnings,
      issues: result.issues,
      lineage_hashes: result.lineage_hashes,
      non_authoritative: result.non_authoritative,
      applied: result.applied,
    }),
    scenario_summary_sha256: null,
  };
  summary.scenario_summary_sha256 = stableHash({ ...summary, scenario_summary_sha256: null });
  return {
    ...summary,
    complete_warning_inventory: completeWarningRecords(result.warnings),
    complete_issue_inventory: completeIssueRecords(result.issues),
    non_authoritative: result.non_authoritative,
    applied: result.applied,
  };
}

function metadataForEvidence(scenario) {
  return {
    scenario_id: scenario.scenario_id,
    status: scenario.status,
    individual_deltas_basis_points: scenario.individual_deltas_basis_points,
    pre_cap_aggregate_delta_basis_points: scenario.pre_cap_aggregate_delta_basis_points,
    post_cap_aggregate_delta_basis_points: scenario.post_cap_aggregate_delta_basis_points,
    final_proposed_confidence_basis_points: scenario.final_proposed_confidence_basis_points,
    clamping_state: scenario.clamping_state,
    warning_codes: scenario.complete_warning_inventory.map((warning) => warning.code),
    complete_issue_inventory: scenario.complete_issue_inventory,
    included_insight_ids: scenario.included_insight_ids,
    excluded_insight_ids: scenario.excluded_insight_ids,
    overlap_resolution: scenario.overlap_resolution,
    calibration_id: scenario.calibration_id,
    identity_sha256: scenario.identity_sha256,
    canonical_result_sha256: scenario.canonical_result_sha256,
    scenario_summary_sha256: scenario.scenario_summary_sha256,
    non_authoritative: scenario.non_authoritative,
    applied: scenario.applied,
  };
}

function countBy(items, selector) {
  return items.reduce((counts, item) => {
    const key = selector(item);
    counts[key] = (counts[key] ?? 0) + 1;
    return counts;
  }, {});
}

async function executePackage(manifest, runLabel) {
  const { calibrateConfidence } = await import(pathToFileURL(abs(paths.calibrationModule)).href);
  const actualScenarios = [];
  for (const expected of manifest.scenarios) {
    const result = calibrateConfidence(scenarioInput(manifest, expected));
    const actual = summarizeActualScenario(expected, result);
    for (const field of [
      "scenario_id",
      "status",
      "individual_deltas_basis_points",
      "pre_cap_aggregate_delta_basis_points",
      "post_cap_aggregate_delta_basis_points",
      "unclamped_confidence_basis_points",
      "final_proposed_confidence_basis_points",
      "clamping_state",
      "included_insight_ids",
      "excluded_insight_ids",
      "warning_inventory",
      "issue_inventory",
      "complete_warning_inventory",
      "complete_issue_inventory",
      "overlap_resolution",
      "calibration_id",
      "identity_sha256",
      "independent_identity_sha256",
      "canonical_result_sha256",
      "scenario_summary_sha256",
      "non_authoritative",
      "applied",
    ]) {
      assertEqual(`${runLabel}:${expected.scenario_id}:${field}`, actual[field], expected[field]);
    }
    if (!actual.complete_issue_inventory.every((issue) => issue.severity === "error" && typeof issue.messageKey === "string")) {
      throw new Error(`missing_complete_issue_metadata:${expected.scenario_id}`);
    }
    if (!actual.complete_warning_inventory.every((warning) => warning.severity === "warning" && typeof warning.messageKey === "string")) {
      throw new Error(`missing_complete_warning_metadata:${expected.scenario_id}`);
    }
    actualScenarios.push(actual);
  }
  const statusDistribution = countBy(actualScenarios, (scenario) => scenario.status);
  const warningDistribution = countBy(
    actualScenarios.flatMap((scenario) => scenario.complete_warning_inventory.map((warning) => warning.code)),
    (code) => code,
  );
  const issueDistribution = countBy(
    actualScenarios.flatMap((scenario) => scenario.complete_issue_inventory.map((issue) => issue.code)),
    (code) => code,
  );
  assertEqual(`${runLabel}:status_distribution`, statusDistribution, manifest.expected_status_distribution);
  assertEqual(`${runLabel}:warning_distribution`, warningDistribution, manifest.expected_warning_distribution);
  assertEqual(`${runLabel}:issue_distribution`, issueDistribution, manifest.expected_issue_distribution);
  const evidenceScenarios = actualScenarios.map(metadataForEvidence);
  return {
    run_label: runLabel,
    scenario_count: actualScenarios.length,
    scenario_ids: actualScenarios.map((scenario) => scenario.scenario_id),
    status_distribution: statusDistribution,
    warning_distribution: warningDistribution,
    issue_distribution: issueDistribution,
    scenarios: evidenceScenarios,
    package_sha256: stableHash({
      scenario_count: actualScenarios.length,
      scenario_ids: actualScenarios.map((scenario) => scenario.scenario_id),
      status_distribution: statusDistribution,
      warning_distribution: warningDistribution,
      issue_distribution: issueDistribution,
      scenarios: evidenceScenarios,
    }),
  };
}

function verifyManifest(manifest, manifestSha256) {
  assertTextEqual("manifest_schema_version", manifest.manifest_schema_version, "action_429_static_confidence_calibration_shadow_input_manifest_v1");
  assertTextEqual("action_426_inventory_sha256", manifest.action_426_inventory_sha256, expectedInventoryHash);
  if (manifest.scenario_count !== 45 || manifest.scenarios.length !== 45) throw new Error("scenario_count_mismatch");
  assertEqual("scenario_ids", manifest.scenario_ids, expectedScenarioIds);
  assertEqual("protected_source_hashes", manifest.protected_source_hashes, expectedProtectedHashes);
  assertEqual("status_distribution", manifest.expected_status_distribution, {
    calibrated: 14,
    calibrated_with_warnings: 11,
    no_adjustment: 5,
    blocked_invalid_input: 9,
    blocked_overlapping_evidence: 1,
    blocked_unsupported_insight: 1,
    blocked_invalid_lineage: 1,
    blocked_future_leakage: 1,
    blocked_invalid_configuration: 1,
    insufficient_eligible_evidence: 1,
  });
  assertEqual("scenario_order", manifest.scenarios.map((scenario) => scenario.scenario_id), expectedScenarioIds);
  for (const key of [
    "static_only",
    "non_production",
    "non_authoritative",
    "non_learning",
    "no_persistence",
    "no_replay",
    "no_runtime",
    "no_external_access",
    "no_feedback",
  ]) {
    if (manifest[key] !== true) throw new Error(`manifest_declaration_mismatch:${key}`);
  }
  if (manifest.recommendation_mutated !== false) throw new Error("manifest_recommendation_mutated");
  if (!/^[a-f0-9]{64}$/.test(manifestSha256)) throw new Error("manifest_hash_invalid");
}

function verifyEvidence(evidence) {
  if (evidence.evidence_schema_version !== "action_429_static_confidence_calibration_shadow_metadata_v1") {
    throw new Error("evidence_schema_mismatch");
  }
  if (evidence.scenario_count !== 45) throw new Error("evidence_scenario_count_mismatch");
  if (evidence.repeat_run_identical !== true) throw new Error("evidence_repeat_run_not_identical");
  if (evidence.persistence_result !== "none" || evidence.replay_result !== "none" || evidence.runtime_result !== "none") {
    throw new Error("evidence_side_effect_result_mismatch");
  }
  const forbidden = canonicalJson(evidence).match(/AUTOMATION_SECRET|SUPABASE|TWELVE|TRADE_APP_PASSWORD|recommendation_payload|full_insights|process\.env/g);
  if (forbidden) throw new Error("evidence_forbidden_text");
}

export async function runStaticConfidenceCalibrationShadow() {
  const protectedBefore = verifyProtectedHashes();
  const outputPath = assertSafeTempDirectory();
  const inventory = readJson(paths.action426Inventory);
  if (inventory.full_inventory_sha256 !== expectedInventoryHash) throw new Error("action_426_inventory_hash_mismatch");
  const manifest = readJson(paths.manifest);
  const manifestSha256 = stableHash(manifest);
  verifyManifest(manifest, manifestSha256);
  const run1 = await executePackage(manifest, "run_1");
  const run2 = await executePackage(manifest, "run_2");
  if (!same(run1, { ...run2, run_label: "run_1" })) throw new Error("repeat_run_mismatch");
  mkdirSync(outputPath, { recursive: true });
  const evidencePath = join(outputPath, "action-429-static-confidence-calibration-shadow-evidence.json");
  const evidence = {
    evidence_schema_version: "action_429_static_confidence_calibration_shadow_metadata_v1",
    manifest_sha256: manifestSha256,
    action_426_inventory_sha256: expectedInventoryHash,
    protected_source_integrity: protectedBefore,
    scenario_count: 45,
    status_distribution: run1.status_distribution,
    warning_distribution: run1.warning_distribution,
    issue_distribution: run1.issue_distribution,
    run_1_package_sha256: run1.package_sha256,
    run_2_package_sha256: run2.package_sha256,
    repeat_run_identical: run1.package_sha256 === run2.package_sha256,
    scenarios: run1.scenarios,
    cleanup_result: "pending",
    persistence_result: "none",
    replay_result: "none",
    runtime_result: "none",
    external_access_result: "none",
    feedback_result: "none",
    recommendation_mutated: false,
    authoritative_data_created: false,
    final_shadow_decision: "shadow_passed",
  };
  verifyEvidence(evidence);
  writeFileSync(evidencePath, `${JSON.stringify(canonicalize(evidence), null, 2)}\n`);
  const persistedEvidence = JSON.parse(readFileSync(evidencePath, "utf8"));
  verifyEvidence(persistedEvidence);
  rmSync(outputPath, { recursive: true, force: true });
  if (existsSync(outputPath)) throw new Error("temporary_evidence_cleanup_failed");
  const protectedAfter = verifyProtectedHashes();
  assertEqual("protected_sources_after_execution", protectedAfter, protectedBefore);
  const result = {
    final_shadow_decision: "shadow_passed",
    decision_vocabulary: [...decisionVocabulary],
    scenario_count: 45,
    scenario_ids: run1.scenario_ids,
    status_distribution: run1.status_distribution,
    warning_distribution: run1.warning_distribution,
    issue_distribution: run1.issue_distribution,
    complete_issue_metadata_matched: true,
    complete_warning_metadata_matched: true,
    expected_results_match: true,
    delta_cap_clamp_overlap_result: "matched",
    calibration_id_and_semantic_hash_result: "matched",
    repeat_run_identical: true,
    run_1_package_sha256: run1.package_sha256,
    run_2_package_sha256: run2.package_sha256,
    manifest_sha256: manifestSha256,
    metadata_only_evidence_verified: true,
    temporary_evidence_written: true,
    temporary_evidence_deleted: true,
    temporary_output_exists_after_cleanup: existsSync(outputPath),
    temp_path: "<system-temp>/ture/action-429-static-confidence-calibration-shadow/",
    source_integrity: protectedAfter,
    persistence_result: "none",
    replay_result: "none",
    runtime_result: "none",
    external_access_result: "none",
    feedback_result: "none",
    recommendation_mutated: false,
    authoritative_data_created: false,
    provider_call_executed: false,
    supabase_read_executed: false,
    supabase_write_executed: false,
    runtime_preview_status: "runtime_preview_waiting_for_operator_inputs",
    tracked_evidence_created: false,
    recommended_next_action: "action_430_independent_static_confidence_calibration_shadow_verification",
  };
  if (!decisionVocabulary.has(result.final_shadow_decision)) throw new Error("invalid_shadow_decision");
  return result;
}

async function main() {
  try {
    const result = await runStaticConfidenceCalibrationShadow();
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const final_shadow_decision = /protected|inventory|manifest|scenario_count|scenario_ids|metadata|unsafe_output|forbidden/i.test(message)
      ? "shadow_aborted"
      : "shadow_failed";
    process.stdout.write(`${JSON.stringify({
      final_shadow_decision,
      decision_vocabulary: [...decisionVocabulary],
      error: message,
      persistence_result: "none",
      replay_result: "none",
      runtime_result: "none",
      external_access_result: "none",
      feedback_result: "none",
      recommendation_mutated: false,
      authoritative_data_created: false,
      runtime_preview_status: "runtime_preview_waiting_for_operator_inputs",
    }, null, 2)}\n`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  await main();
}
