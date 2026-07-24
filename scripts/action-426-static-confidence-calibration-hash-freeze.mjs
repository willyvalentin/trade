#!/usr/bin/env node

import { createHash } from "crypto";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath, pathToFileURL } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const paths = {
  module: "lib/pure-confidence-calibration.ts",
  output: "docs/action-426-static-confidence-calibration-hash-inventory.json",
  mapper: "lib/snapshot-to-learning-dataset-mapper.ts",
  patternDiscovery: "lib/pure-pattern-discovery.ts",
  learningFixture: "lib/learning-dataset-static-fixtures.ts",
  contextFixture: "lib/intelligence-context-static-fixtures.ts",
  patternFixture: "lib/pattern-insight-static-fixtures.ts",
  action416Manifest: "docs/action-416-expanded-static-pattern-discovery-shadow-input-manifest.json",
  action416Runner: "scripts/action-416-expanded-static-pattern-discovery-shadow-run.mjs",
};

const protectedSourceHashes = {
  [paths.module]: "bd913c95d04fc450f4499b18c01744da04a148e8d18cb4d9113d990ee8deaa70",
  [paths.mapper]: "7294a851ede33aadc0dbfcb68c13337cd244002b84be7cbbe40abbe91673741d",
  [paths.patternDiscovery]: "48b7667c8690a1d8d56b819a3727e37ea73af7710a45131eb3debab48627191c",
  [paths.learningFixture]: "706bd57150914862604af70e0bba7614151f53c32abc5dbde9595c53bf4b332b",
  [paths.contextFixture]: "46358cb997b4f7a431a3fee72562659da48b13219404224f4e80e08dbf8ed406",
  [paths.patternFixture]: "db8dae9f101f710123a0a3ac6493356bd761c15f231023ab9742caefaacf8f57",
  [paths.action416Manifest]: "dbafd56a7c0f8c2eb79f22039cb9b1225e42f246e78ca278cd4344f72d39d652",
  [paths.action416Runner]: "b77f018e888d736dbf696ac0acc0b5c16a826b2bab26f09db42ecc28f956d7ea",
};

const configuration = {
  configuration_version: "confidence_calibration_config_v1",
  confidence_scale_basis_points_per_point: 100,
  accepted_min_confidence_basis_points: 0,
  accepted_max_confidence_basis_points: 10000,
  output_decimal_precision: 2,
  positive_per_insight_cap_basis_points: 200,
  negative_per_insight_cap_basis_points: -300,
  combined_positive_cap_basis_points: 400,
  combined_negative_cap_basis_points: -600,
  minimum_total_support: 20,
  minimum_unique_snapshot_support: 20,
  minimum_completed_outcomes: 20,
  accepted_setup_families: ["momentum_continuation"],
  accepted_horizons: ["60m"],
  warning_classification_table: {
    duplicate_mapper_row_identity: "calibration_reducing",
    metric_value_unavailable: "calibration_reducing",
    minimum_total_support_not_met: "calibration_blocking",
    minimum_completed_outcomes_not_met: "calibration_blocking",
  },
  warning_attenuation_table: {
    duplicate_mapper_row_identity: { numerator: 1, denominator: 2 },
    metric_value_unavailable: { numerator: 1, denominator: 2 },
  },
  evidence_quality_table: {
    verified_high: { numerator: 1, denominator: 1 },
    verified_usable: { numerator: 1, denominator: 2 },
    verified_limited: { numerator: 1, denominator: 4 },
    blocked: "blocked",
  },
  direction_delta_table: {
    supportive_strong: 200,
    supportive_moderate: 100,
    supportive_weak: 50,
    neutral: 0,
    mixed: 0,
    adverse_weak: -100,
    adverse_moderate: -200,
    adverse_strong: -300,
  },
  overlap_resolution_policy: "action_419_overlap_v1",
  deterministic_sorting_policy: "action_419_sort_v1",
  rounding_mode: "round_half_away_from_zero",
  confidence_bound_policy: "clamp_valid_delta_to_bounds",
};

const expectedStatusDistribution = {
  calibrated: 14,
  calibrated_with_warnings: 11,
  no_adjustment: 5,
  insufficient_eligible_evidence: 1,
  blocked_invalid_input: 9,
  blocked_invalid_configuration: 1,
  blocked_invalid_lineage: 1,
  blocked_future_leakage: 1,
  blocked_overlapping_evidence: 1,
  blocked_unsupported_insight: 1,
};

const noEffectFlags = {
  provider_call_executed: false,
  provider_call_attempted: false,
  supabase_read_executed: false,
  supabase_write_executed: false,
  persistence_executed: false,
  replay_executed: false,
  runtime_integration_executed: false,
  calibration_shadow_executed: false,
  recommendation_mutation_executed: false,
  feedback_executed: false,
  scanner_behavior_changed: false,
  live_ranking_changed: false,
  runtime_preview_advanced: false,
};

const abs = (path) => join(root, path);
const shaString = (value) => createHash("sha256").update(value, "utf8").digest("hex");
const shaFile = (path) => createHash("sha256").update(readFileSync(abs(path))).digest("hex");
const stableHash = (value) => shaString(JSON.stringify(canonicalize(value)));
const labelHash = (scenarioId, field, slot = "a") => shaString(`action425:${scenarioId}:${field}:${slot}`);

const { calibrateConfidence } = await import(pathToFileURL(abs(paths.module)).href);

function verifyProtectedSources() {
  return Object.fromEntries(Object.entries(protectedSourceHashes).map(([path, expected]) => {
    if (!existsSync(abs(path))) throw new Error(`protected_source_missing:${path}`);
    const actual = shaFile(path);
    if (actual !== expected) throw new Error(`protected_source_hash_mismatch:${path}:${actual}`);
    return [path, { before: expected, after: actual, unchanged: true }];
  }));
}

function baseMeta(bps) {
  if (typeof bps === "number") {
    return {
      canonical_basis_points: bps,
      confidence_percent: bps / 100,
      json_representation: bps / 100,
      malformed: false,
    };
  }
  const malformed = {
    NaN: { classification: "non_finite_nan", json_representation: "NaN" },
    Infinity: { classification: "non_finite_infinity", json_representation: "Infinity" },
    "50.00": { classification: "numeric_string", json_representation: "50.00" },
  }[bps] ?? { classification: "unknown_malformed", json_representation: String(bps) };
  return {
    canonical_basis_points: bps,
    confidence_percent: malformed.json_representation,
    json_representation: malformed.json_representation,
    malformed: true,
    malformed_classification: malformed.classification,
  };
}

function baseInput(bps) {
  if (typeof bps === "number") return bps / 100;
  if (bps === "NaN") return Number.NaN;
  if (bps === "Infinity") return Number.POSITIVE_INFINITY;
  return bps;
}

function insight(id, direction = "supportive_strong", overrides = {}) {
  const sourceScenarioIds = overrides.source_scenario_ids ?? [`source_scenario:${id}`];
  const sourceSnapshotIds = overrides.source_snapshot_ids ?? [`source_snapshot:${id}`];
  const insightId = overrides.insight_id ?? `pattern_insight:v1:${id}`;
  const payload = {
    pattern_discovery_sha256: overrides.pattern_discovery_sha256 ?? labelHash(id, "pattern_discovery", "root"),
    pattern_discovery_configuration_version: overrides.pattern_discovery_configuration_version ?? "pattern_discovery_setup_family_v1",
    pattern_discovery_result_sha256: overrides.pattern_discovery_result_sha256 ?? labelHash(id, "result", "a"),
    evidence_set_sha256: overrides.evidence_set_sha256 ?? labelHash(id, "evidence", "a"),
    group_sha256: overrides.group_sha256 ?? labelHash(id, "group", "a"),
    insight_id: insightId,
    insight_sha256: overrides.insight_sha256 ?? labelHash(id, "insight", "a"),
    source_scenario_ids: sourceScenarioIds,
    source_snapshot_ids: sourceSnapshotIds,
    pattern_discovery_status: overrides.pattern_discovery_status ?? "discovered",
    warning_codes: overrides.warning_codes ?? [],
    static_only: overrides.static_only ?? true,
    non_authoritative: overrides.non_authoritative ?? true,
    no_persistence: overrides.no_persistence ?? true,
    no_replay: overrides.no_replay ?? true,
    no_runtime: overrides.no_runtime ?? true,
    no_feedback: overrides.no_feedback ?? true,
    anti_leakage_status: overrides.anti_leakage_status ?? "passed",
    insight: overrides.insight === null
      ? null
      : {
          setup_family: overrides.setup_family ?? "momentum_continuation",
          horizon: overrides.horizon ?? "60m",
          evidence_direction: direction,
          evidence_quality: overrides.evidence_quality ?? "verified_high",
          total_support: overrides.total_support ?? 20,
          unique_snapshot_support: overrides.unique_snapshot_support ?? 20,
          completed_outcome_count: overrides.completed_outcome_count ?? 20,
          ...(overrides.insight ?? {}),
        },
  };
  return payload;
}

function malformedInsight(id) {
  const envelope = insight(id);
  return { ...envelope, insight: { setup_family: "momentum_continuation" } };
}

function scenario(id, family, baseBasisPoints, insights, expected) {
  return {
    scenario_id: id,
    coverage_family: family,
    base_confidence: baseMeta(baseBasisPoints),
    source_classification: "deterministic_test_local_confidence_calibration_insight_envelope",
    configuration_version: configuration.configuration_version,
    insights,
    expected,
  };
}

function scenarios() {
  const same24 = insight("cc425_24_a");
  const same25 = insight("cc425_25_a");
  const same26 = insight("cc425_26_a");
  const same27 = insight("cc425_27_a");
  return [
    scenario("cc425_01", "strong_supportive", 5000, [insight("cc425_01_a", "supportive_strong")], { status: "calibrated", delta_bps: 200, final_bps: 5200 }),
    scenario("cc425_02", "moderate_supportive", 5000, [insight("cc425_02_a", "supportive_moderate")], { status: "calibrated", delta_bps: 100, final_bps: 5100 }),
    scenario("cc425_03", "weak_supportive", 5000, [insight("cc425_03_a", "supportive_weak")], { status: "calibrated", delta_bps: 50, final_bps: 5050 }),
    scenario("cc425_04", "neutral", 5000, [insight("cc425_04_a", "neutral")], { status: "no_adjustment", delta_bps: 0, final_bps: 5000 }),
    scenario("cc425_05", "mixed", 5000, [insight("cc425_05_a", "mixed")], { status: "no_adjustment", delta_bps: 0, final_bps: 5000 }),
    scenario("cc425_06", "weak_adverse", 5000, [insight("cc425_06_a", "adverse_weak")], { status: "calibrated", delta_bps: -100, final_bps: 4900 }),
    scenario("cc425_07", "moderate_adverse", 5000, [insight("cc425_07_a", "adverse_moderate")], { status: "calibrated", delta_bps: -200, final_bps: 4800 }),
    scenario("cc425_08", "strong_adverse", 5000, [insight("cc425_08_a", "adverse_strong")], { status: "calibrated", delta_bps: -300, final_bps: 4700 }),
    scenario("cc425_09", "duplicate_mapper_warning", 5000, [insight("cc425_09_a", "supportive_strong", { pattern_discovery_status: "discovered_with_warnings", warning_codes: ["duplicate_mapper_row_identity"] })], { status: "calibrated_with_warnings", delta_bps: 100, final_bps: 5100 }),
    scenario("cc425_10", "metric_unavailable_warning", 5000, [insight("cc425_10_a", "supportive_strong", { warning_codes: ["metric_value_unavailable"] })], { status: "calibrated_with_warnings", delta_bps: 100, final_bps: 5100 }),
    scenario("cc425_11", "both_reducing_warnings", 5000, [insight("cc425_11_a", "supportive_strong", { warning_codes: ["duplicate_mapper_row_identity", "metric_value_unavailable"] })], { status: "calibrated_with_warnings", delta_bps: 50, final_bps: 5050 }),
    scenario("cc425_12", "duplicate_warning_equivalence_two", 5000, [insight("cc425_12_a", "supportive_strong", { warning_codes: ["duplicate_mapper_row_identity", "duplicate_mapper_row_identity"] })], { status: "calibrated_with_warnings", delta_bps: 100, final_bps: 5100 }),
    scenario("cc425_13", "duplicate_warning_equivalence_many_and_order", 5000, [insight("cc425_13_a", "supportive_strong", { warning_codes: ["metric_value_unavailable", "duplicate_mapper_row_identity", "duplicate_mapper_row_identity"] })], { status: "calibrated_with_warnings", delta_bps: 50, final_bps: 5050 }),
    scenario("cc425_14", "minimum_total_support_contradiction", 5000, [insight("cc425_14_a", "supportive_strong", { pattern_discovery_status: "discovered_with_warnings", warning_codes: ["minimum_total_support_not_met"] })], { status: "blocked_invalid_input", issue_codes: ["warning_status_contradiction"] }),
    scenario("cc425_15", "minimum_completed_outcomes_contradiction", 5000, [insight("cc425_15_a", "supportive_strong", { pattern_discovery_status: "discovered_with_warnings", warning_codes: ["minimum_completed_outcomes_not_met"] })], { status: "blocked_invalid_input", issue_codes: ["warning_status_contradiction"] }),
    scenario("cc425_16", "distinct_supportive_multi", 5000, [insight("cc425_16_a", "supportive_strong"), insight("cc425_16_b", "supportive_strong")], { status: "calibrated", delta_bps: 400, final_bps: 5400 }),
    scenario("cc425_17", "distinct_adverse_multi", 5000, [insight("cc425_17_a", "adverse_strong"), insight("cc425_17_b", "adverse_strong")], { status: "calibrated", delta_bps: -600, final_bps: 4400 }),
    scenario("cc425_18", "positive_combined_cap", 5000, [insight("cc425_18_a", "supportive_strong"), insight("cc425_18_b", "supportive_strong"), insight("cc425_18_c", "supportive_strong")], { status: "calibrated", delta_bps: 400, final_bps: 5400 }),
    scenario("cc425_19", "negative_combined_cap", 5000, [insight("cc425_19_a", "adverse_strong"), insight("cc425_19_b", "adverse_strong"), insight("cc425_19_c", "adverse_strong")], { status: "calibrated", delta_bps: -600, final_bps: 4400 }),
    scenario("cc425_20", "exact_cancellation", 5000, [insight("cc425_20_a", "supportive_moderate"), insight("cc425_20_b", "adverse_weak")], { status: "no_adjustment", delta_bps: 0, final_bps: 5000 }),
    scenario("cc425_21", "mixed_supportive_combo", 5000, [insight("cc425_21_a", "mixed"), insight("cc425_21_b", "supportive_strong")], { status: "calibrated", delta_bps: 200, final_bps: 5200 }),
    scenario("cc425_22", "neutral_adverse_combo", 5000, [insight("cc425_22_a", "neutral"), insight("cc425_22_b", "adverse_weak")], { status: "calibrated", delta_bps: -100, final_bps: 4900 }),
    scenario("cc425_23", "exact_duplicate_insight", 5000, [insight("cc425_23_a", "supportive_strong"), insight("cc425_23_a", "supportive_strong")], { status: "calibrated_with_warnings", delta_bps: 200, final_bps: 5200 }),
    scenario("cc425_24", "same_evidence_set_overlap", 5000, [same24, insight("cc425_24_b", "supportive_strong", { pattern_discovery_result_sha256: same24.pattern_discovery_result_sha256, evidence_set_sha256: same24.evidence_set_sha256 })], { status: "calibrated_with_warnings", delta_bps: 200, final_bps: 5200 }),
    scenario("cc425_25", "partial_source_overlap", 5000, [same25, insight("cc425_25_b", "supportive_strong", { source_scenario_ids: same25.source_scenario_ids })], { status: "calibrated_with_warnings", delta_bps: 200, final_bps: 5200 }),
    scenario("cc425_26", "full_overlap_same_key", 5000, [same26, insight("cc425_26_b", "supportive_strong", { insight_sha256: same26.insight_sha256, pattern_discovery_result_sha256: same26.pattern_discovery_result_sha256, evidence_set_sha256: same26.evidence_set_sha256, group_sha256: same26.group_sha256, source_scenario_ids: same26.source_scenario_ids, source_snapshot_ids: same26.source_snapshot_ids })], { status: "calibrated_with_warnings", delta_bps: 200, final_bps: 5200 }),
    scenario("cc425_27", "conflicting_overlap", 5000, [same27, insight("cc425_27_b", "adverse_strong", { pattern_discovery_result_sha256: same27.pattern_discovery_result_sha256, evidence_set_sha256: same27.evidence_set_sha256 })], { status: "blocked_overlapping_evidence", issue_codes: ["overlapping_evidence_conflict"] }),
    scenario("cc425_28", "upper_bound_no_clamp_exact_100", 9800, [insight("cc425_28_a", "supportive_strong")], { status: "calibrated", delta_bps: 200, final_bps: 10000 }),
    scenario("cc425_29", "upper_bound_clamp", 9900, [insight("cc425_29_a", "supportive_strong")], { status: "calibrated_with_warnings", delta_bps: 200, final_bps: 10000 }),
    scenario("cc425_30", "lower_bound_no_clamp_exact_0", 100, [insight("cc425_30_a", "adverse_weak")], { status: "calibrated", delta_bps: -100, final_bps: 0 }),
    scenario("cc425_31", "lower_bound_clamp", 50, [insight("cc425_31_a", "adverse_weak")], { status: "calibrated_with_warnings", delta_bps: -100, final_bps: 0 }),
    scenario("cc425_32", "exact_zero_neutral", 0, [insight("cc425_32_a", "neutral")], { status: "no_adjustment", delta_bps: 0, final_bps: 0 }),
    scenario("cc425_33", "exact_hundred_neutral", 10000, [insight("cc425_33_a", "neutral")], { status: "no_adjustment", delta_bps: 0, final_bps: 10000 }),
    scenario("cc425_34", "unsupported_status", 5000, [insight("cc425_34_a", "supportive_strong", { pattern_discovery_status: "blocked_non_consumable_row" })], { status: "blocked_unsupported_insight", issue_codes: ["ineligible_pattern_discovery_status"] }),
    scenario("cc425_35", "invalid_lineage", 5000, [insight("cc425_35_a", "supportive_strong", { insight_sha256: "invalid_lineage_hash" })], { status: "blocked_invalid_lineage", issue_codes: ["invalid_lineage"] }),
    scenario("cc425_36", "failed_leakage", 5000, [insight("cc425_36_a", "supportive_strong", { anti_leakage_status: "failed" })], { status: "blocked_future_leakage", issue_codes: ["future_leakage"] }),
    scenario("cc425_37", "unsupported_insight_structure", 5000, [malformedInsight("cc425_37_a")], { status: "blocked_invalid_input", issue_codes: ["invalid_insight_structure"] }),
    scenario("cc425_38", "invalid_configuration", 5000, [insight("cc425_38_a", "supportive_strong")], { status: "blocked_invalid_configuration", issue_codes: ["invalid_configuration_shape"], invalid_configuration: true }),
    scenario("cc425_39", "invalid_base_below_zero", -1, [insight("cc425_39_a", "supportive_strong")], { status: "blocked_invalid_input", issue_codes: ["invalid_base_confidence"] }),
    scenario("cc425_40", "invalid_base_above_100", 10001, [insight("cc425_40_a", "supportive_strong")], { status: "blocked_invalid_input", issue_codes: ["invalid_base_confidence"] }),
    scenario("cc425_41", "invalid_base_nan", "NaN", [insight("cc425_41_a", "supportive_strong")], { status: "blocked_invalid_input", issue_codes: ["invalid_base_confidence"] }),
    scenario("cc425_42", "invalid_base_infinity", "Infinity", [insight("cc425_42_a", "supportive_strong")], { status: "blocked_invalid_input", issue_codes: ["invalid_base_confidence"] }),
    scenario("cc425_43", "invalid_base_precision", 5000.1, [insight("cc425_43_a", "supportive_strong")], { status: "blocked_invalid_input", issue_codes: ["invalid_base_confidence"] }),
    scenario("cc425_44", "invalid_base_numeric_string", "50.00", [insight("cc425_44_a", "supportive_strong")], { status: "blocked_invalid_input", issue_codes: ["invalid_base_confidence"] }),
    scenario("cc425_45", "no_eligible_evidence", 5000, [], { status: "insufficient_eligible_evidence", delta_bps: 0, final_bps: 5000 }),
  ];
}

function scenarioInput(definition) {
  const scenarioConfiguration = definition.expected.invalid_configuration
    ? { ...configuration, output_decimal_precision: 3 }
    : configuration;
  return {
    baseConfidence: baseInput(definition.base_confidence.canonical_basis_points),
    insights: definition.insights,
    configuration: scenarioConfiguration,
  };
}

function boundedInsightMetadata(envelope) {
  return {
    insight_id: envelope.insight_id,
    insight_sha256: envelope.insight_sha256,
    pattern_discovery_sha256: envelope.pattern_discovery_sha256,
    pattern_discovery_result_sha256: envelope.pattern_discovery_result_sha256,
    evidence_set_sha256: envelope.evidence_set_sha256,
    group_sha256: envelope.group_sha256,
    pattern_discovery_status: envelope.pattern_discovery_status,
    evidence_direction: envelope.insight?.evidence_direction ?? "malformed_or_missing",
    evidence_quality: envelope.insight?.evidence_quality ?? "malformed_or_missing",
    warning_codes_input: [...envelope.warning_codes],
    warning_codes_unique_sorted: [...new Set(envelope.warning_codes)].sort(),
    source_scenario_ids: [...envelope.source_scenario_ids],
    source_snapshot_ids: [...envelope.source_snapshot_ids],
    anti_leakage_status: envelope.anti_leakage_status,
    static_only: envelope.static_only,
    non_authoritative: envelope.non_authoritative,
    no_persistence: envelope.no_persistence,
    no_replay: envelope.no_replay,
    no_runtime: envelope.no_runtime,
    no_feedback: envelope.no_feedback,
    duplicate_or_overlap_classification: "frozen_by_scenario_family",
  };
}

function independentIdentityHash(definition, result) {
  if (!result.calibration_hash) return null;
  const selectedEnvelopes = [
    ...new Map(definition.insights
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
  const includedHashes = selectedEnvelopes
    .map((envelope) => envelope.insight_sha256)
    .sort();
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
  const identityPayload = {
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
  };
  return stableHash(identityPayload);
}

function summarizeScenario(definition) {
  const result = calibrateConfidence(scenarioInput(definition));
  const expected = definition.expected;
  if (result.status !== expected.status) {
    throw new Error(`status_mismatch:${definition.scenario_id}:${result.status}:${expected.status}`);
  }
  if (typeof expected.delta_bps === "number" && Math.round((result.proposed_delta ?? Number.NaN) * 100) !== expected.delta_bps) {
    throw new Error(`delta_mismatch:${definition.scenario_id}`);
  }
  if (typeof expected.final_bps === "number" && Math.round((result.proposed_calibrated_confidence ?? Number.NaN) * 100) !== expected.final_bps) {
    throw new Error(`confidence_mismatch:${definition.scenario_id}`);
  }
  if (expected.issue_codes && expected.issue_codes.some((code) => !result.issues.some((issue) => issue.code === code))) {
    throw new Error(`issue_mismatch:${definition.scenario_id}`);
  }
  const independentHash = independentIdentityHash(definition, result);
  if (independentHash !== result.calibration_hash) {
    throw new Error(`independent_identity_hash_mismatch:${definition.scenario_id}`);
  }
  const individualDeltas = result.adjustments.map((adjustment) => ({
    insight_id: adjustment.insight_id,
    base_delta_basis_points: adjustment.base_delta_basis_points,
    adjusted_delta_basis_points: adjustment.adjusted_delta_basis_points,
    evidence_quality: adjustment.evidence_quality,
    warning_codes: adjustment.warning_codes,
  }));
  const preCapAggregateDelta = individualDeltas.reduce((sum, adjustment) => sum + adjustment.adjusted_delta_basis_points, 0);
  const postCapAggregateDelta = Math.round((result.proposed_delta ?? 0) * 100);
  const unclampedConfidence = typeof definition.base_confidence.canonical_basis_points === "number"
    ? definition.base_confidence.canonical_basis_points + postCapAggregateDelta
    : null;
  const finalConfidence = result.proposed_calibrated_confidence === null
    ? null
    : Math.round(result.proposed_calibrated_confidence * 100);
  const scenarioSummary = {
    scenario_id: definition.scenario_id,
    coverage_family: definition.coverage_family,
    base_confidence: definition.base_confidence,
    source_classification: definition.source_classification,
    configuration_version: definition.configuration_version,
    insight_inventory: definition.insights.map(boundedInsightMetadata),
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
    warning_inventory: result.warnings.map((warning) => ({ code: warning.code, path: warning.path })),
    issue_inventory: result.issues.map((issue) => ({ code: issue.code, path: issue.path })),
    overlap_resolution: result.overlap_summary,
    calibration_id: result.calibration_id,
    identity_sha256: result.calibration_hash,
    independent_identity_sha256: independentHash,
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
  scenarioSummary.scenario_summary_sha256 = stableHash({
    ...scenarioSummary,
    scenario_summary_sha256: null,
  });
  return scenarioSummary;
}

function countBy(items, selector) {
  return items.reduce((counts, item) => {
    const key = selector(item);
    counts[key] = (counts[key] ?? 0) + 1;
    return counts;
  }, {});
}

function freezeOnce(runId) {
  const protected_sources = verifyProtectedSources();
  const definitions = scenarios();
  const expectedIds = Array.from({ length: 45 }, (_, index) => `cc425_${String(index + 1).padStart(2, "0")}`);
  const actualIds = definitions.map((definition) => definition.scenario_id);
  if (JSON.stringify(actualIds) !== JSON.stringify(expectedIds)) throw new Error("scenario_id_sequence_mismatch");
  const scenarioSummaries = definitions.map(summarizeScenario);
  const statusDistribution = countBy(scenarioSummaries, (scenario) => scenario.status);
  if (JSON.stringify(Object.fromEntries(Object.entries(expectedStatusDistribution).sort())) !==
    JSON.stringify(Object.fromEntries(Object.entries(statusDistribution).sort()))) {
    throw new Error("status_distribution_mismatch");
  }
  const warningDistribution = countBy(
    scenarioSummaries.flatMap((scenario) => scenario.warning_inventory.map((warning) => warning.code)),
    (code) => code,
  );
  const issueDistribution = countBy(
    scenarioSummaries.flatMap((scenario) => scenario.issue_inventory.map((issue) => issue.code)),
    (code) => code,
  );
  const payloadWithoutHash = {
    inventory_schema_version: "action_426_static_confidence_calibration_hash_inventory_v1",
    action: "426",
    run_id: runId,
    static_only: true,
    non_production: true,
    non_authoritative: true,
    non_learning: true,
    no_persistence: true,
    no_replay: true,
    no_runtime: true,
    no_feedback: true,
    recommendation_mutated: false,
    provider_call_executed: false,
    supabase_write_executed: false,
    calibration_shadow_executed: false,
    runtime_preview_status: "runtime_preview_waiting_for_operator_inputs",
    protected_sources,
    configuration,
    scenario_count: scenarioSummaries.length,
    scenario_ids: actualIds,
    status_distribution: statusDistribution,
    expected_status_distribution: expectedStatusDistribution,
    warning_distribution: warningDistribution,
    issue_distribution: issueDistribution,
    bounded_metadata_only: true,
    full_insights_retained: false,
    full_pattern_discovery_results_retained: false,
    recommendation_objects_retained: false,
    execution_manifest_created: false,
    shadow_runner_created: false,
    scenarios: scenarioSummaries,
    no_effect_flags: noEffectFlags,
    mandatory_next_action: "action_427_independent_calibration_hash_freeze_verification",
  };
  const inventoryHash = stableHash({ ...payloadWithoutHash, run_id: "canonical", full_inventory_sha256: null });
  return {
    ...payloadWithoutHash,
    run_id: "canonical",
    full_inventory_sha256: inventoryHash,
  };
}

function canonicalize(value) {
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

const first = freezeOnce("first");
const second = freezeOnce("second");
if (JSON.stringify(canonicalize(first)) !== JSON.stringify(canonicalize(second))) {
  throw new Error("repeat_freeze_mismatch");
}

writeFileSync(abs(paths.output), `${JSON.stringify(first, null, 2)}\n`);

process.stdout.write(`${JSON.stringify({
  freeze_status: "passed",
  scenario_count: first.scenario_count,
  full_inventory_sha256: first.full_inventory_sha256,
  repeat_freeze_identical: true,
  output_path: paths.output,
  status_distribution: first.status_distribution,
  warning_distribution: first.warning_distribution,
  issue_distribution: first.issue_distribution,
  no_effect_flags: noEffectFlags,
}, null, 2)}\n`);
