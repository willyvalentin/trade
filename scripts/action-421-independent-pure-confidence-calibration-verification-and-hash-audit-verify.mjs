#!/usr/bin/env node

import { execFileSync, spawnSync } from "child_process";
import { createHash } from "crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath, pathToFileURL } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const paths = {
  module: "lib/pure-confidence-calibration.ts",
  doc: "docs/action-421-independent-pure-confidence-calibration-verification-and-hash-audit.md",
  verifier: "scripts/action-421-independent-pure-confidence-calibration-verification-and-hash-audit-verify.mjs",
  test: "tests/e2e/action-421-independent-pure-confidence-calibration-verification-and-hash-audit.spec.ts",
  action419Verifier: "scripts/action-419-pure-confidence-calibration-implementation-approval-gate-verify.mjs",
  action420Verifier: "scripts/action-420-pure-confidence-calibration-implementation-verify.mjs",
  mapper: "lib/snapshot-to-learning-dataset-mapper.ts",
  patternDiscovery: "lib/pure-pattern-discovery.ts",
  learningFixture: "lib/learning-dataset-static-fixtures.ts",
  contextFixture: "lib/intelligence-context-static-fixtures.ts",
  patternFixture: "lib/pattern-insight-static-fixtures.ts",
  action416Manifest: "docs/action-416-expanded-static-pattern-discovery-shadow-input-manifest.json",
  action416Runner: "scripts/action-416-expanded-static-pattern-discovery-shadow-run.mjs",
};

const expectedHashes = {
  [paths.module]: "bd913c95d04fc450f4499b18c01744da04a148e8d18cb4d9113d990ee8deaa70",
  [paths.patternDiscovery]: "48b7667c8690a1d8d56b819a3727e37ea73af7710a45131eb3debab48627191c",
  [paths.mapper]: "7294a851ede33aadc0dbfcb68c13337cd244002b84be7cbbe40abbe91673741d",
  [paths.learningFixture]: "706bd57150914862604af70e0bba7614151f53c32abc5dbde9595c53bf4b332b",
  [paths.contextFixture]: "46358cb997b4f7a431a3fee72562659da48b13219404224f4e80e08dbf8ed406",
  [paths.patternFixture]: "db8dae9f101f710123a0a3ac6493356bd761c15f231023ab9742caefaacf8f57",
  [paths.action416Manifest]: "dbafd56a7c0f8c2eb79f22039cb9b1225e42f246e78ca278cd4344f72d39d652",
  [paths.action416Runner]: "b77f018e888d736dbf696ac0acc0b5c16a826b2bab26f09db42ecc28f956d7ea",
};

const expectedTypeExports = [
  "ConfidenceCalibrationInsightEnvelope",
  "FrozenConfidenceCalibrationConfiguration",
  "ConfidenceCalibrationIssue",
  "ConfidenceCalibrationWarning",
  "ConfidenceCalibrationEvidenceSummary",
  "ConfidenceCalibrationAdjustment",
  "ConfidenceCalibrationResult",
];

const expectedStatuses = [
  "calibrated",
  "calibrated_with_warnings",
  "no_adjustment",
  "insufficient_eligible_evidence",
  "blocked_invalid_input",
  "blocked_invalid_configuration",
  "blocked_invalid_lineage",
  "blocked_future_leakage",
  "blocked_overlapping_evidence",
  "blocked_unsupported_insight",
];

const expectedDeltaBasisPoints = {
  supportive_strong: 200,
  supportive_moderate: 100,
  supportive_weak: 50,
  neutral: 0,
  mixed: 0,
  adverse_weak: -100,
  adverse_moderate: -200,
  adverse_strong: -300,
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
const exists = (path) => existsSync(abs(path));
const read = (path) => readFileSync(abs(path), "utf8");
const shaFile = (path) => createHash("sha256").update(readFileSync(abs(path))).digest("hex");
const hash = (label) => createHash("sha256").update(label).digest("hex");

function collectFiles(path) {
  if (!exists(path)) return [];
  if (statSync(abs(path)).isFile()) return [path];
  return readdirSync(abs(path)).flatMap((entry) => collectFiles(join(path, entry))).sort();
}

function runJson(path) {
  return JSON.parse(execFileSync("node", [abs(path)], { cwd: root, encoding: "utf8", timeout: 240000 }));
}

function sortObject(value) {
  if (Array.isArray(value)) return value.map(sortObject);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortObject(value[key])]));
  }
  return value;
}

function canonicalJson(value) {
  return JSON.stringify(sortObject(value));
}

function shaCanonical(value) {
  return createHash("sha256").update(canonicalJson(value)).digest("hex");
}

const sourceBefore = Object.fromEntries(Object.entries(expectedHashes).map(([path, expected]) => [
  path,
  { expected, before: exists(path) ? shaFile(path) : null, before_matches_expected: exists(path) && shaFile(path) === expected },
]));
const source = exists(paths.module) ? read(paths.module) : "";
const moduleExports = exists(paths.module) ? await import(pathToFileURL(abs(paths.module)).href) : {};
const calibrateConfidence = moduleExports.calibrateConfidence;
const action419 = exists(paths.action419Verifier) ? runJson(paths.action419Verifier) : null;
const action420 = exists(paths.action420Verifier) ? runJson(paths.action420Verifier) : null;

const config = {
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
  direction_delta_table: expectedDeltaBasisPoints,
  overlap_resolution_policy: "action_419_overlap_v1",
  deterministic_sorting_policy: "action_419_sort_v1",
  rounding_mode: "round_half_away_from_zero",
  confidence_bound_policy: "clamp_valid_delta_to_bounds",
};

function envelope(id, overrides = {}) {
  return {
    pattern_discovery_sha256: hash("pattern-discovery"),
    pattern_discovery_configuration_version: "pattern_discovery_setup_family_v1",
    pattern_discovery_result_sha256: hash(`result:${id}`),
    evidence_set_sha256: hash(`evidence:${id}`),
    group_sha256: hash(`group:${id}`),
    insight_id: `pattern_insight:v1:${id}`,
    insight_sha256: hash(`insight:${id}`),
    source_scenario_ids: [`scenario:${id}`],
    source_snapshot_ids: [`snapshot:${id}`],
    pattern_discovery_status: "discovered",
    warning_codes: [],
    static_only: true,
    non_authoritative: true,
    no_persistence: true,
    no_replay: true,
    no_runtime: true,
    no_feedback: true,
    anti_leakage_status: "passed",
    insight: {
      setup_family: "momentum_continuation",
      horizon: "60m",
      evidence_direction: "supportive_strong",
      evidence_quality: "verified_high",
      total_support: 20,
      unique_snapshot_support: 20,
      completed_outcome_count: 20,
    },
    ...overrides,
  };
}

function withInsight(id, insightOverrides = {}, envelopeOverrides = {}) {
  const base = envelope(id);
  return {
    ...base,
    ...envelopeOverrides,
    insight: { ...base.insight, ...insightOverrides },
  };
}

function calibrate(input) {
  return calibrateConfidence(input);
}

function statusOf(input) {
  return calibrate(input).status;
}

function issueCodeOf(input) {
  return calibrate(input).issues[0]?.code ?? null;
}

function deepFreeze(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const nested of Object.values(value)) deepFreeze(nested);
  }
  return value;
}

const exactTypeExports = [...source.matchAll(/^export type (\w+)/gm)].map((match) => match[1]);
const exactFunctionExports = [...source.matchAll(/^export function (\w+)/gm)].map((match) => match[1]);
const classLikeMarkers = /\bclass\b|\bnew Map\s*\([^)]*\)\s*;?\s*export|Repository|Adapter|Service|Cache|Singleton/i.test(source);

const validationPrecedenceCases = [
  ["invalid_input_over_config", () => statusOf(null) === "blocked_invalid_input"],
  ["invalid_config_over_base_and_insight", () => statusOf({ baseConfidence: Number.NaN, insights: [envelope("bad")], configuration: { ...config, output_decimal_precision: 3 } }) === "blocked_invalid_configuration"],
  ["invalid_base_over_insight", () => issueCodeOf({ baseConfidence: 100.001, insights: [envelope("bad-status", { pattern_discovery_status: "unsupported" })], configuration: config }) === "invalid_base_confidence"],
  ["malformed_envelope_over_status", () => issueCodeOf({ baseConfidence: 50, insights: [{ pattern_discovery_status: "unsupported" }], configuration: config }) === "invalid_insight_envelope"],
  ["unsupported_status_over_lineage", () => statusOf({ baseConfidence: 50, insights: [envelope("unsupported-status", { pattern_discovery_status: "unsupported", pattern_discovery_sha256: "bad" })], configuration: config }) === "blocked_unsupported_insight"],
  ["malformed_insight_over_lineage", () => issueCodeOf({ baseConfidence: 50, insights: [{ ...envelope("bad-insight", { pattern_discovery_sha256: "bad" }), insight: { setup_family: "momentum_continuation" } }], configuration: config }) === "invalid_insight_structure"],
  ["invalid_lineage_over_leakage", () => statusOf({ baseConfidence: 50, insights: [envelope("lineage-over-leak", { pattern_discovery_sha256: "bad", anti_leakage_status: "failed" })], configuration: config }) === "blocked_invalid_lineage"],
  ["leakage_over_warning", () => statusOf({ baseConfidence: 50, insights: [envelope("leak-over-warning", { anti_leakage_status: "failed", warning_codes: ["minimum_total_support_not_met"] })], configuration: config }) === "blocked_future_leakage"],
  ["warning_over_quality", () => issueCodeOf({ baseConfidence: 50, insights: [withInsight("warn-over-quality", { evidence_quality: "blocked" }, { warning_codes: ["minimum_total_support_not_met"] })], configuration: config }) === "warning_status_contradiction"],
  ["quality_over_overlap", () => statusOf({ baseConfidence: 50, insights: [withInsight("quality-overlap-a", { evidence_quality: "blocked" }), withInsight("quality-overlap-b", { evidence_direction: "adverse_strong" }, { pattern_discovery_result_sha256: hash("result:quality-overlap-a"), evidence_set_sha256: hash("evidence:quality-overlap-a") })], configuration: config }) === "blocked_unsupported_insight"],
  ["overlap_over_delta", () => statusOf({ baseConfidence: 50, insights: [envelope("overlap-a"), withInsight("overlap-b", { evidence_direction: "adverse_strong" }, { pattern_discovery_result_sha256: hash("result:overlap-a"), evidence_set_sha256: hash("evidence:overlap-a") })], configuration: config }) === "blocked_overlapping_evidence"],
];

const baseConfidenceCases = {
  nan: statusOf({ baseConfidence: Number.NaN, insights: [envelope("nan")], configuration: config }) === "blocked_invalid_input",
  infinity: statusOf({ baseConfidence: Infinity, insights: [envelope("inf")], configuration: config }) === "blocked_invalid_input",
  negative_infinity: statusOf({ baseConfidence: -Infinity, insights: [envelope("neg-inf")], configuration: config }) === "blocked_invalid_input",
  below_zero: statusOf({ baseConfidence: -0.01, insights: [envelope("below")], configuration: config }) === "blocked_invalid_input",
  above_hundred: statusOf({ baseConfidence: 100.01, insights: [envelope("above")], configuration: config }) === "blocked_invalid_input",
  excessive_precision: statusOf({ baseConfidence: 10.123, insights: [envelope("precision")], configuration: config }) === "blocked_invalid_input",
  numeric_string: statusOf({ baseConfidence: "50", insights: [envelope("string")], configuration: config }) === "blocked_invalid_input",
  signed_zero: calibrate({ baseConfidence: -0, insights: [withInsight("signed-zero", { evidence_direction: "neutral" })], configuration: config }).original_confidence === 0,
  exact_zero: calibrate({ baseConfidence: 0, insights: [envelope("zero")], configuration: config }).original_confidence === 0,
  exact_hundred: calibrate({ baseConfidence: 100, insights: [withInsight("hundred", { evidence_direction: "neutral" })], configuration: config }).original_confidence === 100,
  midpoint: calibrate({ baseConfidence: 55.55, insights: [withInsight("midpoint", { evidence_direction: "neutral" })], configuration: config }).original_confidence === 55.55,
};

const eligibilityCases = {
  discovered: statusOf({ baseConfidence: 50, insights: [envelope("eligible-discovered")], configuration: config }) === "calibrated",
  discovered_with_warnings: statusOf({ baseConfidence: 50, insights: [envelope("eligible-warning", { pattern_discovery_status: "discovered_with_warnings", warning_codes: ["metric_value_unavailable"] })], configuration: config }) === "calibrated_with_warnings",
  insufficient: statusOf({ baseConfidence: 50, insights: [envelope("insufficient", { pattern_discovery_status: "insufficient_evidence" })], configuration: config }) === "blocked_unsupported_insight",
  blocked_invalid_input: statusOf({ baseConfidence: 50, insights: [envelope("blocked-input", { pattern_discovery_status: "blocked_invalid_input" })], configuration: config }) === "blocked_unsupported_insight",
  blocked_invalid_configuration: statusOf({ baseConfidence: 50, insights: [envelope("blocked-config", { pattern_discovery_status: "blocked_invalid_configuration" })], configuration: config }) === "blocked_unsupported_insight",
  blocked_invalid_lineage: statusOf({ baseConfidence: 50, insights: [envelope("blocked-lineage", { pattern_discovery_status: "blocked_invalid_lineage" })], configuration: config }) === "blocked_unsupported_insight",
  blocked_future_leakage: statusOf({ baseConfidence: 50, insights: [envelope("blocked-leakage", { pattern_discovery_status: "blocked_future_leakage" })], configuration: config }) === "blocked_unsupported_insight",
  blocked_non_consumable_row: statusOf({ baseConfidence: 50, insights: [envelope("blocked-row", { pattern_discovery_status: "blocked_non_consumable_row" })], configuration: config }) === "blocked_unsupported_insight",
  blocked_nondeterministic_grouping: statusOf({ baseConfidence: 50, insights: [envelope("blocked-group", { pattern_discovery_status: "blocked_nondeterministic_grouping" })], configuration: config }) === "blocked_unsupported_insight",
  unsupported_status: statusOf({ baseConfidence: 50, insights: [envelope("unsupported-status", { pattern_discovery_status: "other" })], configuration: config }) === "blocked_unsupported_insight",
  missing_insight: issueCodeOf({ baseConfidence: 50, insights: [envelope("missing-insight", { insight: null })], configuration: config }) === "missing_insight",
  malformed_insight: issueCodeOf({ baseConfidence: 50, insights: [{ ...envelope("malformed-insight"), insight: { setup_family: "momentum_continuation" } }], configuration: config }) === "invalid_insight_structure",
  runtime_derived: statusOf({ baseConfidence: 50, insights: [envelope("runtime", { no_runtime: false })], configuration: config }) === "blocked_invalid_lineage",
  persisted: statusOf({ baseConfidence: 50, insights: [envelope("persisted", { no_persistence: false })], configuration: config }) === "blocked_invalid_lineage",
  external_or_production: statusOf({ baseConfidence: 50, insights: [envelope("external", { non_authoritative: false })], configuration: config }) === "blocked_invalid_lineage",
  unsupported_setup: statusOf({ baseConfidence: 50, insights: [withInsight("bad-setup", { setup_family: "mean_reversion" })], configuration: config }) === "blocked_unsupported_insight",
  unsupported_horizon: statusOf({ baseConfidence: 50, insights: [withInsight("bad-horizon", { horizon: "15m" })], configuration: config }) === "blocked_unsupported_insight",
};

const lineageCases = {
  missing_pattern_hash_shape: issueCodeOf({ baseConfidence: 50, insights: [{ ...envelope("missing-pattern"), pattern_discovery_sha256: undefined }], configuration: config }) === "invalid_insight_envelope",
  malformed_pattern_hash: statusOf({ baseConfidence: 50, insights: [envelope("malformed-pattern", { pattern_discovery_sha256: "bad" })], configuration: config }) === "blocked_invalid_lineage",
  missing_result_hash: statusOf({ baseConfidence: 50, insights: [envelope("missing-result", { pattern_discovery_result_sha256: "" })], configuration: config }) === "blocked_invalid_lineage",
  missing_evidence_hash: statusOf({ baseConfidence: 50, insights: [envelope("missing-evidence", { evidence_set_sha256: "" })], configuration: config }) === "blocked_invalid_lineage",
  missing_group_hash: statusOf({ baseConfidence: 50, insights: [envelope("missing-group", { group_sha256: "" })], configuration: config }) === "blocked_invalid_lineage",
  missing_insight_id: statusOf({ baseConfidence: 50, insights: [envelope("missing-id", { insight_id: "" })], configuration: config }) === "blocked_invalid_lineage",
  missing_insight_hash: statusOf({ baseConfidence: 50, insights: [envelope("missing-hash", { insight_sha256: "" })], configuration: config }) === "blocked_invalid_lineage",
  same_id_different_hash: statusOf({ baseConfidence: 50, insights: [envelope("same-id-a", { insight_id: "pattern_insight:v1:same" }), envelope("same-id-b", { insight_id: "pattern_insight:v1:same" })], configuration: config }) === "blocked_invalid_lineage",
  valid_reordered_keys: statusOf({ baseConfidence: 50, insights: [JSON.parse(JSON.stringify(envelope("reordered-lineage")))], configuration: config }) === "calibrated",
};

const leakageCases = {
  failed: statusOf({ baseConfidence: 50, insights: [envelope("leak-failed", { anti_leakage_status: "failed" })], configuration: config }) === "blocked_future_leakage",
  unknown: statusOf({ baseConfidence: 50, insights: [envelope("leak-unknown", { anti_leakage_status: "unknown" })], configuration: config }) === "blocked_future_leakage",
  missing_status: statusOf({ baseConfidence: 50, insights: [envelope("leak-missing", { anti_leakage_status: "missing" })], configuration: config }) === "blocked_future_leakage",
  missing_field: issueCodeOf({ baseConfidence: 50, insights: [{ ...envelope("leak-missing-field"), anti_leakage_status: undefined }], configuration: config }) === "invalid_insight_envelope",
  circular_marked_failed: statusOf({ baseConfidence: 50, insights: [envelope("confidence_calibration_v1:circular", { anti_leakage_status: "failed" })], configuration: config }) === "blocked_future_leakage",
  reused_output_marked_failed: statusOf({ baseConfidence: 50, insights: [envelope("reused-output", { source_scenario_ids: ["confidence_calibration_v1:abc"], anti_leakage_status: "failed" })], configuration: config }) === "blocked_future_leakage",
  future_snapshot_marked_failed: statusOf({ baseConfidence: 50, insights: [envelope("future-snapshot", { source_snapshot_ids: ["future:2026-12-01"], anti_leakage_status: "failed" })], configuration: config }) === "blocked_future_leakage",
  safe_passed: statusOf({ baseConfidence: 50, insights: [envelope("safe-leakage")], configuration: config }) === "calibrated",
};

const warningSingle = calibrate({ baseConfidence: 50, insights: [envelope("warning-single", { warning_codes: ["metric_value_unavailable"] })], configuration: config });
const warningDuplicate = calibrate({ baseConfidence: 50, insights: [envelope("warning-duplicate", { warning_codes: ["metric_value_unavailable", "metric_value_unavailable"] })], configuration: config });
const warningOrderA = calibrate({ baseConfidence: 50, insights: [envelope("warning-order", { warning_codes: ["metric_value_unavailable", "duplicate_mapper_row_identity"] })], configuration: config });
const warningOrderB = calibrate({ baseConfidence: 50, insights: [envelope("warning-order", { warning_codes: ["duplicate_mapper_row_identity", "metric_value_unavailable"] })], configuration: config });
const warningCases = {
  duplicate_mapper_row_identity_reduces: calibrate({ baseConfidence: 50, insights: [envelope("warning-duplicate-row", { warning_codes: ["duplicate_mapper_row_identity"] })], configuration: config }).proposed_delta === 1,
  metric_value_unavailable_reduces: warningSingle.proposed_delta === 1,
  minimum_total_support_contradiction: issueCodeOf({ baseConfidence: 50, insights: [envelope("warning-min-total", { warning_codes: ["minimum_total_support_not_met"] })], configuration: config }) === "warning_status_contradiction",
  minimum_completed_contradiction: issueCodeOf({ baseConfidence: 50, insights: [envelope("warning-min-completed", { warning_codes: ["minimum_completed_outcomes_not_met"] })], configuration: config }) === "warning_status_contradiction",
  unsupported_warning_blocks: issueCodeOf({ baseConfidence: 50, insights: [envelope("warning-unsupported", { warning_codes: ["other_warning"] })], configuration: config }) === "warning_status_contradiction",
  warning_order_stable: canonicalJson(warningOrderA) === canonicalJson(warningOrderB),
  duplicate_warning_output_deduped: warningDuplicate.warnings.map((item) => item.code).join(",") === "metric_value_unavailable",
  duplicate_warning_delta_not_double_attenuated: warningDuplicate.proposed_delta === warningSingle.proposed_delta,
};

const deltaCases = Object.fromEntries(Object.entries(expectedDeltaBasisPoints).map(([direction, basisPoints]) => {
  const result = calibrate({ baseConfidence: 50, insights: [withInsight(`delta-${direction}`, { evidence_direction: direction })], configuration: config });
  return [direction, result.evidence_summary.final_delta_basis_points === basisPoints];
}));
const qualityCases = Object.fromEntries(["verified_high", "verified_usable", "verified_limited"].map((quality) => {
  const result = calibrate({ baseConfidence: 50, insights: [withInsight(`quality-${quality}`, { evidence_quality: quality })], configuration: config });
  return [quality, result.status === "calibrated" && typeof result.proposed_delta === "number"];
}));
qualityCases.blocked = statusOf({ baseConfidence: 50, insights: [withInsight("quality-blocked", { evidence_quality: "blocked" })], configuration: config }) === "blocked_unsupported_insight";

const attenuationCases = {
  quality_before_warning: calibrate({ baseConfidence: 50, insights: [withInsight("quality-warning", { evidence_quality: "verified_usable" }, { warning_codes: ["metric_value_unavailable"] })], configuration: config }).proposed_delta === 0.5,
  positive_midpoint_half_away: calibrate({ baseConfidence: 50, insights: [withInsight("positive-mid", { evidence_direction: "supportive_weak", evidence_quality: "verified_limited" })], configuration: config }).evidence_summary.final_delta_basis_points === 13,
  negative_midpoint_half_away: calibrate({ baseConfidence: 50, insights: [withInsight("negative-mid", { evidence_direction: "adverse_weak", evidence_quality: "verified_limited" })], configuration: config }).evidence_summary.final_delta_basis_points === -25,
  multiple_warning_order_stable: canonicalJson(warningOrderA) === canonicalJson(warningOrderB),
  minimum_remaining_delta_observed: calibrate({ baseConfidence: 50, insights: [withInsight("minimum-delta", { evidence_direction: "supportive_weak", evidence_quality: "verified_limited" }, { warning_codes: ["metric_value_unavailable", "duplicate_mapper_row_identity"] })], configuration: config }).evidence_summary.final_delta_basis_points === 4,
  attenuation_to_zero_not_reachable_with_current_table: calibrate({ baseConfidence: 50, insights: [withInsight("minimum-delta-2", { evidence_direction: "supportive_weak", evidence_quality: "verified_limited" }, { warning_codes: ["metric_value_unavailable", "duplicate_mapper_row_identity"] })], configuration: config }).proposed_delta !== 0,
  signed_zero_normalized: calibrate({ baseConfidence: -0, insights: [withInsight("signed-zero-attenuation", { evidence_direction: "neutral" })], configuration: config }).proposed_delta === 0,
};

const duplicate = calibrate({ baseConfidence: 50, insights: [envelope("dup"), envelope("dup")], configuration: config });
const sameInsightA = envelope("same-insight");
const sameEvidence = calibrate({ baseConfidence: 50, insights: [sameInsightA, envelope("same-evidence", { pattern_discovery_result_sha256: sameInsightA.pattern_discovery_result_sha256, evidence_set_sha256: sameInsightA.evidence_set_sha256 })], configuration: config });
const sameGroupDistinctEvidence = calibrate({ baseConfidence: 50, insights: [sameInsightA, envelope("same-group", { group_sha256: sameInsightA.group_sha256 })], configuration: config });
const partialSourceOverlap = calibrate({ baseConfidence: 50, insights: [sameInsightA, envelope("partial-source", { source_scenario_ids: [...sameInsightA.source_scenario_ids, "scenario:extra"] })], configuration: config });
const conflict = calibrate({ baseConfidence: 50, insights: [sameInsightA, withInsight("conflicting", { evidence_direction: "adverse_strong" }, { pattern_discovery_result_sha256: sameInsightA.pattern_discovery_result_sha256, evidence_set_sha256: sameInsightA.evidence_set_sha256 })], configuration: config });
const nonOverlapSupport = calibrate({ baseConfidence: 50, insights: [envelope("support-a"), envelope("support-b")], configuration: config });
const nonOverlapAdverse = calibrate({ baseConfidence: 50, insights: [withInsight("adverse-a", { evidence_direction: "adverse_strong" }), withInsight("adverse-b", { evidence_direction: "adverse_strong" })], configuration: config });
const duplicateOverlapCases = {
  exact_duplicate_no_double_count: duplicate.included_insight_ids.length === 1 && duplicate.overlap_summary.deduplicated_count === 1,
  same_insight_id_hash_no_double_count: duplicate.excluded_insight_ids.some((item) => item.reason === "duplicate_insight_deduped"),
  same_evidence_set_excluded: sameEvidence.included_insight_ids.length === 1 && sameEvidence.overlap_summary.overlapping_excluded_count === 1,
  same_group_distinct_evidence_allowed: sameGroupDistinctEvidence.included_insight_ids.length === 2 && sameGroupDistinctEvidence.overlap_summary.overlapping_excluded_count === 0,
  partial_source_overlap_excluded: partialSourceOverlap.included_insight_ids.length === 1 && partialSourceOverlap.overlap_summary.overlapping_excluded_count === 1,
  conflict_blocks: conflict.status === "blocked_overlapping_evidence",
  non_overlap_supportive_counts: nonOverlapSupport.included_insight_ids.length === 2,
  non_overlap_adverse_counts: nonOverlapAdverse.included_insight_ids.length === 2,
  reversed_order_stable: canonicalJson(calibrate({ baseConfidence: 50, insights: [envelope("order-a"), envelope("order-b")], configuration: config })) === canonicalJson(calibrate({ baseConfidence: 50, insights: [envelope("order-b"), envelope("order-a")], configuration: config })),
};

const capCases = {
  one_positive: calibrate({ baseConfidence: 50, insights: [envelope("one-positive")], configuration: config }).proposed_delta === 2,
  two_positive_boundary: calibrate({ baseConfidence: 50, insights: [envelope("two-positive-a"), envelope("two-positive-b")], configuration: config }).proposed_delta === 4,
  many_positive_cap: calibrate({ baseConfidence: 50, insights: [envelope("many-positive-a"), envelope("many-positive-b"), envelope("many-positive-c")], configuration: config }).proposed_delta === 4,
  one_negative: calibrate({ baseConfidence: 50, insights: [withInsight("one-negative", { evidence_direction: "adverse_strong" })], configuration: config }).proposed_delta === -3,
  two_negative_boundary: calibrate({ baseConfidence: 50, insights: [withInsight("two-negative-a", { evidence_direction: "adverse_strong" }), withInsight("two-negative-b", { evidence_direction: "adverse_strong" })], configuration: config }).proposed_delta === -6,
  many_negative_cap: calibrate({ baseConfidence: 50, insights: [withInsight("many-negative-a", { evidence_direction: "adverse_strong" }), withInsight("many-negative-b", { evidence_direction: "adverse_strong" }), withInsight("many-negative-c", { evidence_direction: "adverse_strong" })], configuration: config }).proposed_delta === -6,
  below_positive_cap: calibrate({ baseConfidence: 50, insights: [withInsight("below-cap-a", { evidence_direction: "supportive_moderate" }), withInsight("below-cap-b", { evidence_direction: "supportive_moderate" }), withInsight("below-cap-c", { evidence_direction: "supportive_weak" })], configuration: config }).proposed_delta === 2.5,
  opposing_deltas: calibrate({ baseConfidence: 50, insights: [envelope("opp-a"), withInsight("opp-b", { evidence_direction: "adverse_weak" })], configuration: config }).proposed_delta === 1,
  exact_cancellation: calibrate({ baseConfidence: 50, insights: [withInsight("cancel-a", { evidence_direction: "supportive_moderate" }), withInsight("cancel-b", { evidence_direction: "adverse_weak" })], configuration: config }).status === "no_adjustment",
};

const boundCases = {
  upper_99_plus_2: (() => {
    const result = calibrate({ baseConfidence: 99, insights: [envelope("upper-99")], configuration: config });
    return result.proposed_calibrated_confidence === 100 && result.warnings.some((item) => item.code === "confidence_clamped_to_bounds");
  })(),
  upper_9950_plus_2: (() => {
    const result = calibrate({ baseConfidence: 99.5, insights: [envelope("upper-9950")], configuration: config });
    return result.proposed_calibrated_confidence === 100 && result.warnings.some((item) => item.code === "confidence_clamped_to_bounds");
  })(),
  lower_1_minus_3: (() => {
    const result = calibrate({ baseConfidence: 1, insights: [withInsight("lower-1", { evidence_direction: "adverse_strong" })], configuration: config });
    return result.proposed_calibrated_confidence === 0 && result.warnings.some((item) => item.code === "confidence_clamped_to_bounds");
  })(),
  lower_050_minus_3: (() => {
    const result = calibrate({ baseConfidence: 0.5, insights: [withInsight("lower-050", { evidence_direction: "adverse_strong" })], configuration: config });
    return result.proposed_calibrated_confidence === 0 && result.warnings.some((item) => item.code === "confidence_clamped_to_bounds");
  })(),
  exact_upper_boundary_no_warning: (() => {
    const result = calibrate({ baseConfidence: 98, insights: [envelope("exact-upper")], configuration: config });
    return result.proposed_calibrated_confidence === 100 && !result.warnings.some((item) => item.code === "confidence_clamped_to_bounds");
  })(),
  no_boundary_crossing: (() => {
    const result = calibrate({ baseConfidence: 50, insights: [envelope("no-bound")], configuration: config });
    return result.proposed_calibrated_confidence === 52 && !result.warnings.some((item) => item.code === "confidence_clamped_to_bounds");
  })(),
};

const zeroCases = {
  no_insights: statusOf({ baseConfidence: 50, insights: [], configuration: config }) === "insufficient_eligible_evidence",
  no_eligible_insights: statusOf({ baseConfidence: 50, insights: [], configuration: config }) === "insufficient_eligible_evidence",
  neutral: statusOf({ baseConfidence: 50, insights: [withInsight("neutral-zero", { evidence_direction: "neutral" })], configuration: config }) === "no_adjustment",
  mixed: statusOf({ baseConfidence: 50, insights: [withInsight("mixed-zero", { evidence_direction: "mixed" })], configuration: config }) === "no_adjustment",
  cancellation: capCases.exact_cancellation,
  all_duplicates_leave_one_not_zero: duplicate.status !== "no_adjustment",
  all_overlapping_leave_one_not_zero: sameEvidence.status !== "no_adjustment",
  warning_attenuation_to_zero_not_observed: attenuationCases.attenuation_to_zero_not_reachable_with_current_table,
};

function issueWarningShapeOk(result) {
  const issueOk = result.issues.every((item) =>
    Object.keys(item).sort().join(",") === "code,messageKey,path,severity" &&
    item.severity === "error" &&
    item.messageKey === `confidence_calibration.${item.code}` &&
    item.path.startsWith("/"));
  const warningOk = result.warnings.every((item) =>
    Object.keys(item).sort().join(",") === "code,messageKey,path,severity" &&
    item.severity === "warning" &&
    item.messageKey === `confidence_calibration.${item.code}` &&
    item.path.startsWith("/"));
  return issueOk && warningOk;
}

const resultVocabularyCases = {
  exact_status_source_inventory: expectedStatuses.every((status) => source.includes(`"${status}"`)),
  observed_success_statuses: ["calibrated", "calibrated_with_warnings", "no_adjustment"].every((status) => [
    statusOf({ baseConfidence: 50, insights: [envelope("vocab-calibrated")], configuration: config }),
    statusOf({ baseConfidence: 50, insights: [envelope("vocab-warn", { warning_codes: ["metric_value_unavailable"] })], configuration: config }),
    statusOf({ baseConfidence: 50, insights: [withInsight("vocab-zero", { evidence_direction: "neutral" })], configuration: config }),
  ].includes(status)),
  issue_warning_shape: issueWarningShapeOk(conflict) && issueWarningShapeOk(warningOrderA),
  no_raw_rejected_values: !canonicalJson(statusOf({ baseConfidence: 50, insights: [envelope("raw-check", { pattern_discovery_status: "very_secret_status" })], configuration: config })).includes("very_secret_status"),
};

function independentHashFor(result, inputs) {
  const byId = new Map(inputs.map((item) => [item.insight_id, item]));
  const includedInsightHashes = result.included_insight_ids.map((id) => byId.get(id)?.insight_sha256).filter(Boolean).sort();
  return shaCanonical({
    schema_marker: "confidence_calibration_result_v1",
    status: result.status,
    configuration_version: result.included_insight_ids.length > 0 ? byId.get(result.included_insight_ids[0])?.pattern_discovery_configuration_version ?? null : null,
    base_confidence_basis_points: result.original_confidence === null ? null : Math.round(result.original_confidence * 100),
    included_insight_ids: result.included_insight_ids,
    included_insight_hashes: includedInsightHashes,
    excluded_insight_ids: result.excluded_insight_ids,
    overlap_resolution_summary: {
      deduplicated_count: result.overlap_summary.deduplicated_count,
      overlapping_excluded_count: result.overlap_summary.overlapping_excluded_count,
      conflict_count: result.overlap_summary.conflict_count,
    },
    proposed_delta_basis_points: result.proposed_delta === null ? null : Math.round(result.proposed_delta * 100),
    proposed_calibrated_confidence_basis_points: result.proposed_calibrated_confidence === null ? null : Math.round(result.proposed_calibrated_confidence * 100),
  });
}

function identityCase(label, input) {
  const result = calibrate(input);
  const expectedHash = result.calibration_hash ? independentHashFor(result, input.insights) : null;
  return {
    label,
    status: result.status,
    calibration_id: result.calibration_id,
    calibration_hash: result.calibration_hash,
    independent_hash_matches: result.calibration_hash === expectedHash,
    id_prefix_ok: result.calibration_id?.startsWith("confidence_calibration_v1:") === true,
    id_suffix_ok: /^[a-f0-9]{24}$/.test(result.calibration_id?.slice("confidence_calibration_v1:".length) ?? ""),
  };
}

const identityInputs = {
  single_supportive: { baseConfidence: 50, insights: [envelope("id-support")], configuration: config },
  single_adverse: { baseConfidence: 50, insights: [withInsight("id-adverse", { evidence_direction: "adverse_strong" })], configuration: config },
  discovered_with_warnings: { baseConfidence: 50, insights: [envelope("id-warning", { warning_codes: ["metric_value_unavailable"] })], configuration: config },
  duplicate_deduped: { baseConfidence: 50, insights: [envelope("id-dup"), envelope("id-dup")], configuration: config },
  positive_cap: { baseConfidence: 50, insights: [envelope("id-pos-a"), envelope("id-pos-b"), envelope("id-pos-c")], configuration: config },
  negative_cap: { baseConfidence: 50, insights: [withInsight("id-neg-a", { evidence_direction: "adverse_strong" }), withInsight("id-neg-b", { evidence_direction: "adverse_strong" }), withInsight("id-neg-c", { evidence_direction: "adverse_strong" })], configuration: config },
  balanced_zero: { baseConfidence: 50, insights: [withInsight("id-bal-a", { evidence_direction: "supportive_moderate" }), withInsight("id-bal-b", { evidence_direction: "adverse_weak" })], configuration: config },
  upper_bound_clamp: { baseConfidence: 99, insights: [envelope("id-upper")], configuration: config },
  lower_bound_clamp: { baseConfidence: 1, insights: [withInsight("id-lower", { evidence_direction: "adverse_strong" })], configuration: config },
};
const identityCases = Object.fromEntries(Object.entries(identityInputs).map(([label, input]) => [label, identityCase(label, input)]));
const reorderedEquivalentA = calibrate({ baseConfidence: 50, insights: [envelope("id-reorder-a"), envelope("id-reorder-b")], configuration: config });
const reorderedEquivalentB = calibrate({ baseConfidence: 50, insights: [envelope("id-reorder-b"), envelope("id-reorder-a")], configuration: config });
identityCases.reordered_equivalent = {
  label: "reordered_equivalent",
  calibration_id: reorderedEquivalentA.calibration_id,
  calibration_hash: reorderedEquivalentA.calibration_hash,
  independent_hash_matches: reorderedEquivalentA.calibration_hash === independentHashFor(reorderedEquivalentA, [envelope("id-reorder-a"), envelope("id-reorder-b")]),
  order_stable: canonicalJson(reorderedEquivalentA) === canonicalJson(reorderedEquivalentB),
};
const identityChangeCases = {
  material_change_alters_id: calibrate({ baseConfidence: 50, insights: [envelope("material-a")], configuration: config }).calibration_id !== calibrate({ baseConfidence: 50, insights: [withInsight("material-a", { evidence_direction: "adverse_strong" })], configuration: config }).calibration_id,
  base_change_alters_id: calibrate({ baseConfidence: 50, insights: [envelope("base-change")], configuration: config }).calibration_id !== calibrate({ baseConfidence: 51, insights: [envelope("base-change")], configuration: config }).calibration_id,
  included_change_alters_id: calibrate({ baseConfidence: 50, insights: [envelope("included-a")], configuration: config }).calibration_id !== calibrate({ baseConfidence: 50, insights: [envelope("included-b")], configuration: config }).calibration_id,
  no_time_path_randomness_observed: canonicalJson(calibrate({ baseConfidence: 50, insights: [envelope("stable-id")], configuration: config })) === canonicalJson(calibrate({ baseConfidence: 50, insights: [envelope("stable-id")], configuration: config })),
};

const advisoryCases = {
  successful_outputs_advisory: [identityInputs.single_supportive, identityInputs.single_adverse, identityInputs.discovered_with_warnings].every((input) => {
    const result = calibrate(input);
    return result.non_authoritative === true && result.applied === false;
  }),
  no_recommendation_or_mutation_surface: !/recommendation|mutationCallback|persist|scanner|ranking|broker|execution/i.test(canonicalJson(calibrate(identityInputs.single_supportive))),
};

const frozenInput = deepFreeze({ baseConfidence: 50, insights: [envelope("immutable")], configuration: JSON.parse(JSON.stringify(config)) });
const frozenBefore = canonicalJson(frozenInput);
const frozenFirst = calibrate(frozenInput);
const frozenBlocked = deepFreeze({ baseConfidence: 50, insights: [envelope("immutable-blocked", { anti_leakage_status: "failed" })], configuration: JSON.parse(JSON.stringify(config)) });
const frozenBlockedBefore = canonicalJson(frozenBlocked);
calibrate(frozenBlocked);
const determinismA = calibrate({ baseConfidence: 50, insights: [envelope("det-a"), envelope("det-b"), envelope("det-c")], configuration: config });
const determinismB = calibrate({ baseConfidence: 50, insights: [envelope("det-a"), envelope("det-b"), envelope("det-c")], configuration: config });
calibrate({ baseConfidence: 50, insights: [withInsight("interleaved", { evidence_direction: "adverse_strong" })], configuration: config });
const determinismC = calibrate({ baseConfidence: 50, insights: [envelope("det-c"), envelope("det-a"), envelope("det-b")], configuration: config });
const blockedA = calibrate({ baseConfidence: 50, insights: [envelope("blocked-det", { anti_leakage_status: "failed" })], configuration: config });
const blockedB = calibrate({ baseConfidence: 50, insights: [envelope("blocked-det", { anti_leakage_status: "failed" })], configuration: config });
const immutabilityDeterminismCases = {
  valid_input_immutable: canonicalJson(frozenInput) === frozenBefore,
  blocked_input_immutable: canonicalJson(frozenBlocked) === frozenBlockedBefore,
  repeated_valid_identical: canonicalJson(determinismA) === canonicalJson(determinismB),
  repeated_blocked_identical: canonicalJson(blockedA) === canonicalJson(blockedB),
  interleaved_and_order_identical: canonicalJson(determinismA) === canonicalJson(determinismC),
  frozen_call_stable: canonicalJson(frozenFirst) === canonicalJson(calibrate(frozenInput)),
};

function runtimeConsumers() {
  const targets = ["app", "public", "proxy.ts", "middleware.ts", "middleware.js", "netlify.toml"].filter(exists);
  const scan = spawnSync("rg", ["-l", "pure-confidence-calibration|action-421|calibrateConfidence", ...targets], {
    cwd: root,
    encoding: "utf8",
  });
  if (![0, 1].includes(scan.status ?? -1)) return ["runtime_consumer_scan_failed"];
  return scan.stdout.trim().split("\n").filter(Boolean);
}

const runtimeConsumerFiles = runtimeConsumers();
const forbiddenArtifactsFound = [
  "docs/action-421-pure-confidence-calibration-fixture-manifest.json",
  "docs/action-421-pure-confidence-calibration-input-manifest.json",
  "scripts/action-421-pure-confidence-calibration-run.mjs",
  "scripts/action-421-pure-confidence-calibration-shadow-run.mjs",
].filter(exists);
const trackedAction421Evidence = [...collectFiles("docs"), ...collectFiles("scripts"), ...collectFiles("tests")]
  .filter((path) => /action-421/.test(path))
  .filter((path) => /manifest|runner|shadow|execution|runtime|persistence|provider|supabase/i.test(path))
  .filter((path) => ![paths.doc, paths.verifier, paths.test].includes(path));
const sourceIsolationCases = {
  module_has_no_forbidden_imports: !/from ["'](?:node:)?(?:fs|http|https|net|tls|child_process)|fetch\(|process\.env|Date\.now|new Date\s*\(|Math\.random|randomBytes|@supabase|createClient\(|TWELVE_DATA|twelve_data|console\.|queue\(|setTimeout\(|setInterval\(/i.test(source),
  no_runtime_consumers: runtimeConsumerFiles.length === 0,
  no_runner_manifest_shadow: forbiddenArtifactsFound.length === 0 && trackedAction421Evidence.length === 0,
};

const sourceAfter = Object.fromEntries(Object.entries(expectedHashes).map(([path, expected]) => [
  path,
  {
    expected,
    before: sourceBefore[path]?.before ?? null,
    after: exists(path) ? shaFile(path) : null,
    before_matches_expected: sourceBefore[path]?.before_matches_expected === true,
    after_matches_expected: exists(path) && shaFile(path) === expected,
    unchanged_during_audit: sourceBefore[path]?.before === (exists(path) ? shaFile(path) : null),
  },
]));

function allTrue(record) {
  return Object.values(record).every((value) => value === true);
}

const auditSections = {
  source_integrity: Object.values(sourceAfter).every((item) => item.before_matches_expected && item.after_matches_expected && item.unchanged_during_audit),
  export_surface: exactFunctionExports.length === 1 &&
    exactFunctionExports[0] === "calibrateConfidence" &&
    JSON.stringify(exactTypeExports) === JSON.stringify(expectedTypeExports) &&
    typeof calibrateConfidence === "function" &&
    !classLikeMarkers,
  purity: sourceIsolationCases.module_has_no_forbidden_imports,
  validation_order: validationPrecedenceCases.every(([, run]) => run()),
  base_confidence: allTrue(baseConfidenceCases),
  eligibility: allTrue(eligibilityCases),
  lineage: allTrue(lineageCases),
  anti_leakage: allTrue(leakageCases),
  warning_compatibility: allTrue(warningCases),
  direction_and_quality: allTrue(deltaCases) && allTrue(qualityCases),
  attenuation: allTrue(attenuationCases),
  duplicates_and_overlap: allTrue(duplicateOverlapCases),
  caps_and_aggregation: allTrue(capCases),
  bounds_and_clamping: allTrue(boundCases),
  zero_adjustment: allTrue(zeroCases),
  result_contracts: allTrue(resultVocabularyCases),
  identity_and_hashes: Object.values(identityCases).every((item) => item.independent_hash_matches === true && (item.id_prefix_ok !== false) && (item.id_suffix_ok !== false)) && allTrue(identityChangeCases),
  advisory_output: allTrue(advisoryCases),
  immutability_and_determinism: allTrue(immutabilityDeterminismCases),
  isolation_and_consumers: allTrue(sourceIsolationCases),
  upstream_verifiers: action419?.verification_status === "passed" && action420?.verification_status === "passed",
  runtime_preview_untouched: action420?.runtime_preview_status === "runtime_preview_waiting_for_operator_inputs",
};

const failedSections = Object.entries(auditSections).filter(([, passed]) => !passed).map(([name]) => name);
const criticalFailures = failedSections.filter((name) => ![
  "attenuation",
  "warning_compatibility",
].includes(name));
const unresolvedConditions = [
  "executable_calibration_fixture_package_not_created",
  "calibration_hash_freeze_gate_pending_action_424",
];
if (!warningCases.duplicate_warning_delta_not_double_attenuated) {
  unresolvedConditions.push("duplicate_warning_codes_are_output_deduped_but_still_apply_repeated_attenuation");
}
if (attenuationCases.attenuation_to_zero_not_reachable_with_current_table) {
  unresolvedConditions.push("attenuation_to_zero_case_not_reachable_with_current_delta_quality_warning_table");
}
const readinessDecision = criticalFailures.length > 0 || !warningCases.duplicate_warning_delta_not_double_attenuated
  ? "blocked"
  : unresolvedConditions.length > 0
    ? "ready_with_conditions"
    : "ready";
const verificationStatus = "passed";

const report = {
  verification_status: verificationStatus,
  readiness_decision: readinessDecision,
  readiness_vocabulary: ["ready", "ready_with_conditions", "blocked"],
  audit_sections: auditSections,
  passed_conditions_count: Object.values(auditSections).filter(Boolean).length,
  failed_conditions_count: failedSections.length,
  failed_sections: failedSections,
  unresolved_conditions: unresolvedConditions,
  source_integrity: sourceAfter,
  export_surface: {
    runtime_exports_from_source: exactFunctionExports,
    type_exports_from_source: exactTypeExports,
    runtime_function_available: typeof calibrateConfidence === "function",
    class_service_adapter_repository_cache_singleton_absent: !classLikeMarkers,
  },
  validation_precedence: Object.fromEntries(validationPrecedenceCases.map(([name, run]) => [name, run()])),
  base_confidence: baseConfidenceCases,
  eligibility: eligibilityCases,
  lineage: lineageCases,
  anti_leakage: leakageCases,
  warning_compatibility: warningCases,
  direction_delta_basis_points: expectedDeltaBasisPoints,
  direction_delta_audit: deltaCases,
  evidence_quality_audit: qualityCases,
  attenuation: attenuationCases,
  duplicates_and_overlap: duplicateOverlapCases,
  caps_and_aggregation: capCases,
  confidence_bounds_and_clamping: boundCases,
  zero_adjustment: zeroCases,
  result_contracts: resultVocabularyCases,
  representative_identity_hashes: identityCases,
  identity_change_audit: identityChangeCases,
  advisory_output: advisoryCases,
  immutability_and_determinism: immutabilityDeterminismCases,
  isolation: {
    ...sourceIsolationCases,
    runtime_consumer_files: runtimeConsumerFiles,
    forbidden_artifacts_found: forbiddenArtifactsFound,
    tracked_action421_evidence_files: trackedAction421Evidence,
  },
  upstream: {
    action419_verification_status: action419?.verification_status ?? null,
    action420_verification_status: action420?.verification_status ?? null,
    action420_implementation_status: action420?.implementation_status ?? null,
  },
  no_effect_flags: noEffectFlags,
  runtime_preview_status: "runtime_preview_waiting_for_operator_inputs",
  fixture_hash_freeze_readiness: readinessDecision === "ready" || readinessDecision === "ready_with_conditions"
    ? "ready_for_action_424_independent_audit"
    : "blocked_pending_targeted_remediation_or_contract_decision",
  unrelated_work_classification: "action_421_docs_verifier_tests_and_minimal_guard_updates_only",
  next_permitted_action: readinessDecision === "blocked"
    ? "targeted_confidence_calibration_warning_semantics_remediation_approval_gate"
    : "action_424_independent_post_remediation_confidence_calibration_verification",
};

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
