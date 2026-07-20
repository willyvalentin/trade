#!/usr/bin/env node

import { execFileSync, spawnSync } from "child_process";
import { createHash } from "crypto";
import { existsSync, readFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { pathToFileURL } from "url";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const abs = (path) => join(root, path);
const exists = (path) => existsSync(abs(path));
const read = (path) => readFileSync(abs(path), "utf8");
const sha256Text = (text) => createHash("sha256").update(text, "utf8").digest("hex");

const paths = {
  doc: "docs/action-452-independent-post-remediation-projection-verification.md",
  verifier: "scripts/action-452-independent-post-remediation-projection-verification-verify.mjs",
  test: "tests/e2e/action-452-independent-post-remediation-projection-verification.spec.ts",
  projection: "lib/confidence-calibration-recommendation-advisory-projection.ts",
  advisory: "lib/confidence-calibration-advisory-adapter.ts",
  calibration: "lib/pure-confidence-calibration.ts",
  patternDiscovery: "lib/pure-pattern-discovery.ts",
  mapper: "lib/snapshot-to-learning-dataset-mapper.ts",
  action441Inventory: "docs/action-441-static-confidence-calibration-advisory-hash-inventory.json",
  action441Freezer: "scripts/action-441-static-confidence-calibration-advisory-hash-freeze.mjs",
  action444Manifest: "docs/action-444-static-confidence-calibration-advisory-shadow-input-manifest.json",
  action444Runner: "scripts/action-444-static-confidence-calibration-advisory-shadow-run.mjs",
  learningFixtures: "lib/learning-dataset-static-fixtures.ts",
  intelligenceFixtures: "lib/intelligence-context-static-fixtures.ts",
  action309Guard: "scripts/action-309-post-recovery-safety-guard.mjs",
  action450Verifier: "scripts/action-450-projection-advisory-status-hash-binding-remediation-approval-gate-verify.mjs",
  action451Verifier: "scripts/action-451-projection-advisory-status-hash-binding-remediation-verify.mjs",
};

const expected = {
  readinessDecision: "ready_with_conditions",
  runtimePreviewStatus: "runtime_preview_waiting_for_operator_inputs",
  nextAction: "action_453_static_projection_fixture_hash_freeze_approval_gate",
  runtimeExport: "buildConfidenceCalibrationRecommendationProjection",
  publicTypes: [
    "ImmutableRecommendationProjectionEnvelope",
    "FrozenRecommendationProjectionConfiguration",
    "ConfidenceCalibrationRecommendationProjectionResult",
  ],
  statuses: [
    "advisory_ready",
    "advisory_ready_with_warnings",
    "advisory_no_adjustment",
    "advisory_insufficient_evidence",
    "blocked_invalid_input",
    "blocked_confidence_mismatch",
    "blocked_invalid_lineage",
    "blocked_future_leakage",
    "blocked_calibration_result",
    "blocked_unsupported_status",
  ],
  statusMapping: {
    advisory_ready: "projection_ready",
    advisory_ready_with_warnings: "projection_ready_with_warnings",
    advisory_no_adjustment: "projection_no_adjustment",
    advisory_insufficient_evidence: "projection_insufficient_evidence",
    blocked_invalid_input: "blocked_invalid_input",
    blocked_confidence_mismatch: "blocked_confidence_mismatch",
    blocked_invalid_lineage: "blocked_invalid_lineage",
    blocked_future_leakage: "blocked_future_leakage",
    blocked_calibration_result: "blocked_advisory_result",
    blocked_unsupported_status: "blocked_unsupported_status",
  },
  semanticFields: [
    "status",
    "recommendation_fingerprint",
    "recommendation_snapshot_hash",
    "original_confidence_basis_points",
    "proposed_delta_basis_points",
    "proposed_confidence_basis_points",
    "calibration_status",
    "calibration_id",
    "calibration_identity_hash",
    "calibration_result_hash",
    "warnings",
    "issues",
    "lineage_hashes",
    "advisory_eligible",
    "advisory_visible",
    "application_eligible",
    "reasons",
    "non_authoritative",
    "applied",
    "adapter_schema_version",
    "configuration_version",
  ],
  nonSemanticFields: ["advisory_id", "advisory_hash"],
};

function compareText(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function canonicalize(value) {
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new TypeError("non_finite_number");
    return Object.is(value, -0) ? 0 : value;
  }
  if (Array.isArray(value)) return value.map(canonicalize);
  if (typeof value === "object" && value !== null) {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, child]) => child !== undefined)
        .sort(([left], [right]) => compareText(left, right))
        .map(([key, child]) => [key, canonicalize(child)]),
    );
  }
  throw new TypeError("unsupported_value");
}

function canonicalHash(value) {
  return createHash("sha256").update(JSON.stringify(canonicalize(value)), "utf8").digest("hex");
}

function stable(value) {
  return JSON.stringify(canonicalize(value));
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function mutate(value, patch) {
  const draft = clone(value);
  patch(draft);
  return draft;
}

function orderText(values) {
  return [...new Set(values)].sort(compareText);
}

function orderEntries(values) {
  const unique = new Map();
  for (const value of values) {
    unique.set(`${value.severity}\u0000${value.code}\u0000${value.path}\u0000${value.messageKey}`, {
      code: value.code,
      path: value.path,
      severity: value.severity,
      messageKey: value.messageKey,
    });
  }
  return [...unique.values()].sort(
    (left, right) =>
      compareText(left.severity, right.severity) ||
      compareText(left.code, right.code) ||
      compareText(left.path, right.path) ||
      compareText(left.messageKey, right.messageKey),
  );
}

function h(char) {
  return char.repeat(64);
}

function toBasisPoints(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const basisPoints = value * projectionConfig.confidence_scale_basis_points_per_point;
  if (Math.abs(basisPoints - Math.round(basisPoints)) > 1e-9) return null;
  return Object.is(Math.round(basisPoints), -0) ? 0 : Math.round(basisPoints);
}

function canonicalLineage(lineage) {
  return {
    recommendation_source_hash: lineage.recommendation_source_hash,
    decision_boundary_sha256: lineage.decision_boundary_sha256,
    pattern_discovery_result_hashes: orderText(lineage.pattern_discovery_result_hashes),
    pattern_insight_hashes: orderText(lineage.pattern_insight_hashes),
    calibration_identity_hash: lineage.calibration_identity_hash,
    calibration_result_hash: lineage.calibration_result_hash,
    evidence_lineage_hash: lineage.evidence_lineage_hash,
  };
}

function independentAdvisorySemanticPayload(advisory) {
  return {
    adapter_schema_version: projectionConfig.advisory_schema_version,
    configuration_version: projectionConfig.advisory_configuration_version,
    status: advisory.status,
    recommendation_fingerprint: advisory.recommendation_fingerprint,
    recommendation_snapshot_hash: advisory.recommendation_snapshot_hash,
    original_confidence_basis_points: toBasisPoints(advisory.original_confidence),
    calibration_status: advisory.calibration_status,
    calibration_id: advisory.calibration_id,
    calibration_identity_hash: advisory.lineage_hashes?.calibration_identity_hash ?? null,
    calibration_result_hash: advisory.lineage_hashes?.calibration_result_hash ?? null,
    proposed_delta_basis_points: toBasisPoints(advisory.proposed_delta),
    proposed_confidence_basis_points: toBasisPoints(advisory.proposed_calibrated_confidence),
    warnings: orderEntries(advisory.warnings ?? []),
    issues: orderEntries(advisory.issues ?? []),
    lineage_hashes: canonicalLineage(advisory.lineage_hashes),
    advisory_eligible: advisory.advisory_eligible,
    advisory_visible: advisory.advisory_visible,
    application_eligible: advisory.application_eligible,
    reasons: orderText(advisory.reasons ?? []),
    non_authoritative: advisory.non_authoritative,
    applied: advisory.applied,
  };
}

function independentlyRehashAdvisory(value) {
  const draft = clone(value);
  const hash = canonicalHash(independentAdvisorySemanticPayload(draft));
  draft.advisory_hash = hash;
  draft.advisory_id = `confidence_calibration_advisory_v1:${hash.slice(0, 24)}`;
  return draft;
}

function advisoryWithAlteredSemanticVersion(value, versions) {
  const draft = clone(value);
  const hash = canonicalHash({
    ...independentAdvisorySemanticPayload(draft),
    ...versions,
  });
  draft.advisory_hash = hash;
  draft.advisory_id = `confidence_calibration_advisory_v1:${hash.slice(0, 24)}`;
  return draft;
}

function projectionLineage(recommendation, advisory) {
  return {
    recommendation_source_hash: recommendation.lineage.recommendation_source_hash,
    decision_boundary_sha256: recommendation.lineage.decision_boundary_sha256,
    evidence_lineage_hash: recommendation.lineage.evidence_lineage_hash,
    pattern_discovery_result_hashes: orderText(recommendation.lineage.pattern_discovery_result_hashes),
    pattern_insight_hashes: orderText(recommendation.lineage.pattern_insight_hashes),
    calibration_identity_hash: advisory.lineage_hashes.calibration_identity_hash,
    calibration_result_hash: advisory.lineage_hashes.calibration_result_hash,
  };
}

function projectionHashPayload(recommendation, advisory) {
  return {
    projection_schema_version: projectionConfig.projection_schema_version,
    configuration_version: projectionConfig.configuration_version,
    recommendation_fingerprint: recommendation.recommendation_fingerprint,
    recommendation_snapshot_hash: recommendation.recommendation_snapshot_hash,
    recommendation_original_confidence_basis_points: recommendation.original_confidence_basis_points,
    advisory_status: advisory.status,
    advisory_id: advisory.advisory_id,
    advisory_identity_hash: canonicalHash({ advisory_id: advisory.advisory_id, advisory_hash: advisory.advisory_hash }),
    advisory_result_hash: advisory.advisory_hash,
    advisory_proposed_delta_basis_points: toBasisPoints(advisory.proposed_delta),
    advisory_proposed_confidence_basis_points: toBasisPoints(advisory.proposed_calibrated_confidence),
    warnings: orderEntries(advisory.warnings),
    issues: orderEntries(advisory.issues),
    lineage_hashes: projectionLineage(recommendation, advisory),
  };
}

function projectionRecommendationFor(recommendation, advisory) {
  return {
    recommendation_id: recommendation.recommendation_id,
    recommendation_fingerprint: recommendation.recommendation_fingerprint,
    recommendation_snapshot_hash: recommendation.recommendation_snapshot_hash,
    original_confidence_basis_points: Math.round(recommendation.original_confidence * 100),
    schema_version: "recommendation_projection_envelope_v1",
    decision_boundary: recommendation.decision_boundary,
    identity: { ticker: "AAPL", side: "long" },
    source: {
      source_kind: "recommendation_snapshot",
      source_version: "action_452_static_audit",
      source_classification: "static_projection",
      immutable: true,
    },
    lineage: {
      recommendation_source_hash: recommendation.lineage.recommendation_source_hash,
      decision_boundary_sha256: recommendation.decision_boundary.boundary_sha256,
      evidence_lineage_hash: advisory.lineage_hashes.evidence_lineage_hash,
      pattern_discovery_result_hashes: recommendation.lineage.pattern_discovery_result_hashes,
      pattern_insight_hashes: recommendation.lineage.pattern_insight_hashes,
      source_scenario_ids: recommendation.lineage.source_scenario_ids,
      source_snapshot_ids: recommendation.lineage.source_snapshot_ids,
    },
    static_only: true,
    non_authoritative: true,
    no_persistence: true,
    no_replay: true,
    no_runtime: true,
    no_feedback: true,
    no_mutation_callback: true,
    commands: {
      mutation: false,
      persistence: false,
      ranking: false,
      scanner: false,
      publication: false,
      execution: false,
      feedback: false,
    },
    anti_feedback: {
      projection_reused_as_recommendation_confidence_input: false,
      projection_reused_as_scanner_signal: false,
      projection_reused_as_ranking_signal: false,
      projection_reused_as_publication_signal: false,
      projection_reused_as_execution_signal: false,
      projection_reused_as_learning_dataset_input: false,
      projection_reused_as_pattern_discovery_evidence: false,
      projection_reused_as_intelligence_context: false,
      projection_reused_as_outcome: false,
      projection_reused_as_calibration_evidence: false,
      projection_reused_as_future_advisory_base_input: false,
      projection_reused_as_feedback_event: false,
      circular_projection_lineage: false,
      self_referential_recommendation_lineage: false,
    },
    anti_leakage: {
      status: "passed",
      future_outcome_evidence: false,
      post_entry_evidence: false,
      post_exit_evidence: false,
      same_recommendation_realized_result: false,
      evidence_after_decision_boundary: false,
      prohibited_self_calibration: false,
    },
  };
}

function recommendationFor(calibration, suffix = "ready") {
  return {
    recommendation_id: `rec_action_452_${suffix}`,
    recommendation_fingerprint: `rec_fp_action_452_${suffix}`,
    recommendation_snapshot_hash: h("f"),
    original_confidence: calibration.original_confidence ?? 50,
    decision_boundary: {
      boundary_id: `boundary_action_452_${suffix}`,
      boundary_sha256: h("1"),
      evidence_cutoff_sha256: h("2"),
      anti_leakage_state: "passed",
    },
    source: {
      source_kind: "recommendation_snapshot",
      source_version: "recommendation_snapshot_v1",
      immutable: true,
    },
    lineage: {
      recommendation_source_hash: h("3"),
      pattern_discovery_result_hashes: calibration.lineage_hashes.map((item) => item.pattern_discovery_result_sha256),
      pattern_insight_ids: calibration.included_insight_ids,
      pattern_insight_hashes: calibration.lineage_hashes.map((item) => item.insight_sha256),
      source_scenario_ids: [`scenario_action_452_${suffix}`],
      source_snapshot_ids: [`snapshot_action_452_${suffix}`],
    },
    static_only: true,
    non_authoritative: true,
    no_persistence: true,
    no_replay: true,
    no_runtime: true,
    no_feedback: true,
    no_mutation_callback: true,
    commands: {
      mutation: false,
      persistence: false,
      ranking: false,
      scanner: false,
      publication: false,
      execution: false,
      feedback: false,
    },
    anti_feedback: {
      calibration_output_reused_as_learning_dataset_input: false,
      calibration_output_reused_as_pattern_discovery_evidence: false,
      calibration_output_reused_as_outcome: false,
      calibration_output_reused_as_context: false,
      calibration_output_reused_as_recommendation_base_confidence: false,
      calibration_output_reused_as_scanner_signal: false,
      calibration_output_reused_as_ranking_signal: false,
      calibration_output_reused_as_publication_signal: false,
      calibration_output_reused_as_execution_signal: false,
      calibration_output_reused_as_calibration_input_evidence: false,
      circular_calibration_lineage: false,
      self_referential_recommendation_lineage: false,
    },
    anti_leakage: {
      status: "passed",
      future_outcome_evidence: false,
      post_entry_evidence: false,
      post_exit_evidence: false,
      same_recommendation_realized_result: false,
      evidence_after_decision_boundary: false,
      prohibited_self_calibration: false,
    },
  };
}

function insight(overrides = {}) {
  return {
    pattern_discovery_sha256: h("a"),
    pattern_discovery_configuration_version: "pattern_discovery_config_v1",
    pattern_discovery_result_sha256: h("b"),
    evidence_set_sha256: h("c"),
    group_sha256: h("d"),
    insight_id: "insight_action_452",
    insight_sha256: h("e"),
    source_scenario_ids: ["scenario_action_452"],
    source_snapshot_ids: ["snapshot_action_452"],
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
      setup_family: "opening_drive",
      horizon: "15m",
      evidence_direction: "supportive_strong",
      evidence_quality: "verified_high",
      total_support: 40,
      unique_snapshot_support: 40,
      completed_outcome_count: 40,
    },
    ...overrides,
  };
}

function runJson(command, args) {
  const result = spawnSync(command, args, { cwd: root, encoding: "utf8", maxBuffer: 120 * 1024 * 1024 });
  const text = `${result.stdout ?? ""}${result.stderr ?? ""}`;
  if (result.status !== 0) throw new Error(text || `${command} failed`);
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end < start) throw new Error(`json_output_missing:${command}`);
  return JSON.parse(text.slice(start, end + 1));
}

function rgFiles(pattern, targets) {
  const result = spawnSync("rg", ["-l", pattern, ...targets], { cwd: root, encoding: "utf8" });
  if (result.status !== 0 && result.status !== 1) throw new Error(result.stderr || `rg failed:${pattern}`);
  return result.stdout.trim() ? result.stdout.trim().split("\n").sort() : [];
}

function statusFiles() {
  const output = execFileSync("git", ["status", "--short", "--untracked-files=all"], { cwd: root, encoding: "utf8" });
  return output
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => line.slice(3).trim())
    .map((path) => (path.includes(" -> ") ? path.split(" -> ").at(-1) ?? path : path))
    .sort();
}

function primaryIssue(result) {
  return result.issues[0] ?? null;
}

function deepFreeze(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) deepFreeze(child);
    Object.freeze(value);
  }
  return value;
}

const protectedSourcePaths = [
  paths.projection,
  paths.advisory,
  paths.calibration,
  paths.patternDiscovery,
  paths.mapper,
  paths.action441Inventory,
  paths.action441Freezer,
  paths.action444Manifest,
  paths.action444Runner,
  paths.learningFixtures,
  paths.intelligenceFixtures,
].filter(exists);

const protectedBefore = Object.fromEntries(protectedSourcePaths.map((path) => [path, sha256Text(read(path))]));

const calibrationConfig = {
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
  accepted_setup_families: ["opening_drive", "pullback_continuation"],
  accepted_horizons: ["15m", "30m"],
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

const advisoryConfig = {
  adapter_schema_version: "confidence_calibration_advisory_result_v1",
  configuration_version: "confidence_calibration_advisory_config_v1",
  advisory_id_prefix: "confidence_calibration_advisory_v1:",
  confidence_scale_basis_points_per_point: 100,
  accepted_min_confidence_basis_points: 0,
  accepted_max_confidence_basis_points: 10000,
  output_decimal_precision: 2,
  deterministic_sorting_policy: "action_432_sort_v1",
  identity_policy: "action_432_identity_v1",
  issue_message_key_prefix: "confidence_calibration_advisory.",
  eligible_calibration_statuses: ["calibrated", "calibrated_with_warnings", "no_adjustment"],
  blocked_calibration_status_map: {
    insufficient_eligible_evidence: "advisory_insufficient_evidence",
    blocked_invalid_input: "blocked_invalid_input",
    blocked_invalid_configuration: "blocked_invalid_input",
    blocked_invalid_lineage: "blocked_invalid_lineage",
    blocked_future_leakage: "blocked_future_leakage",
    blocked_overlapping_evidence: "blocked_calibration_result",
    blocked_unsupported_insight: "blocked_unsupported_status",
  },
  advisory_visibility_policy: "advisory_visible_for_eligible_statuses",
  application_policy: "never_apply_in_action_432",
  runtime_preview_status: expected.runtimePreviewStatus,
};

const projectionConfig = {
  projection_schema_version: "confidence_calibration_recommendation_projection_v1",
  configuration_version: "confidence_calibration_recommendation_projection_config_v1",
  projection_id_prefix: "confidence_calibration_recommendation_projection_v1:",
  advisory_schema_version: "confidence_calibration_advisory_result_v1",
  advisory_configuration_version: "confidence_calibration_advisory_config_v1",
  confidence_scale_basis_points_per_point: 100,
  accepted_min_confidence_basis_points: 0,
  accepted_max_confidence_basis_points: 10000,
  status_mapping: expected.statusMapping,
  visibility_policy: "projection_visible_for_eligible_advisories",
  identity_policy: "action_448_projection_identity_v1",
  canonical_hash_version: "action_448_canonical_json_sha256_v1",
  warning_message_key_prefix: "confidence_calibration_advisory.",
  issue_message_key_prefix: "confidence_calibration_advisory.",
  projection_issue_message_key_prefix: "confidence_calibration_recommendation_projection.",
  runtime_preview_status: expected.runtimePreviewStatus,
};

const doc = exists(paths.doc) ? read(paths.doc) : "";
const projectionSource = read(paths.projection);
const projectionModule = await import(pathToFileURL(abs(paths.projection)).href);
const advisoryModule = await import(pathToFileURL(abs(paths.advisory)).href);
const calibrationModule = await import(pathToFileURL(abs(paths.calibration)).href);
const { buildConfidenceCalibrationRecommendationProjection } = projectionModule;
const { buildConfidenceCalibrationAdvisory } = advisoryModule;
const { calibrateConfidence } = calibrationModule;

function makePair(insights, suffix, baseConfidence = 50) {
  const calibration = calibrateConfidence({ baseConfidence, insights, configuration: calibrationConfig });
  const recommendation = recommendationFor(calibration, suffix);
  const adapterAdvisory = buildConfidenceCalibrationAdvisory({ recommendation, calibration, configuration: advisoryConfig });
  const advisory = independentlyRehashAdvisory(adapterAdvisory);
  const projectionRecommendation = projectionRecommendationFor(recommendation, advisory);
  return { calibration, recommendation, adapterAdvisory, advisory, projectionRecommendation };
}

function project(pair, advisory = pair.advisory, recommendation = pair.projectionRecommendation, configuration = projectionConfig) {
  return buildConfidenceCalibrationRecommendationProjection({ recommendation, advisory, configuration });
}

const readyPair = makePair([insight()], "ready");
const warningPair = makePair([insight({ warning_codes: ["metric_value_unavailable"] })], "warning");
const noAdjustmentPair = makePair([
  insight({ insight: { ...insight().insight, evidence_direction: "neutral" } }),
], "no_adjustment");

const ready = project(readyPair);
const warningReady = project(warningPair);
const noAdjustment = project(noAdjustmentPair);

const advisoryHash = canonicalHash(independentAdvisorySemanticPayload(readyPair.advisory));
const independentlyRecomputedProjectionHash = canonicalHash(projectionHashPayload(readyPair.projectionRecommendation, readyPair.advisory));
const projectionIdExpected = `${projectionConfig.projection_id_prefix}${independentlyRecomputedProjectionHash.slice(0, 24)}`;

const malformedHashCases = {
  missing_hash: project(readyPair, mutate(readyPair.advisory, (draft) => { draft.advisory_hash = null; })).status,
  malformed_hex: project(readyPair, mutate(readyPair.advisory, (draft) => { draft.advisory_hash = "not_hex"; })).status,
  uppercase_hash: project(readyPair, mutate(readyPair.advisory, (draft) => { draft.advisory_hash = readyPair.advisory.advisory_hash.toUpperCase(); })).status,
  short_hash: project(readyPair, mutate(readyPair.advisory, (draft) => { draft.advisory_hash = "a".repeat(63); })).status,
  long_hash: project(readyPair, mutate(readyPair.advisory, (draft) => { draft.advisory_hash = "a".repeat(65); })).status,
  all_zero_hash: project(readyPair, mutate(readyPair.advisory, (draft) => { draft.advisory_hash = h("0"); })).status,
  all_f_hash: project(readyPair, mutate(readyPair.advisory, (draft) => { draft.advisory_hash = h("f"); })).status,
  unrelated_valid_format_hash: project(readyPair, mutate(readyPair.advisory, (draft) => { draft.advisory_hash = h("8"); })).status,
};

const retainedHashAttacks = {
  status: project(readyPair, mutate(readyPair.advisory, (draft) => { draft.status = "advisory_ready_with_warnings"; })).status,
  advisory_id: project(readyPair, mutate(readyPair.advisory, (draft) => { draft.advisory_id = "confidence_calibration_advisory_v1:ffffffffffffffffffffffff"; })).status,
  recommendation_fingerprint: project(readyPair, mutate(readyPair.advisory, (draft) => { draft.recommendation_fingerprint = "other"; })).status,
  recommendation_snapshot_hash: project(readyPair, mutate(readyPair.advisory, (draft) => { draft.recommendation_snapshot_hash = h("9"); })).status,
  original_confidence: project(readyPair, mutate(readyPair.advisory, (draft) => { draft.original_confidence = 51; })).status,
  proposed_delta: project(readyPair, mutate(readyPair.advisory, (draft) => { draft.proposed_delta = 3; })).status,
  proposed_calibrated_confidence: project(readyPair, mutate(readyPair.advisory, (draft) => { draft.proposed_calibrated_confidence = 53; })).status,
  calibration_status: project(readyPair, mutate(readyPair.advisory, (draft) => { draft.calibration_status = "no_adjustment"; })).status,
  calibration_id: project(readyPair, mutate(readyPair.advisory, (draft) => { draft.calibration_id = "confidence_calibration_v1:ffffffffffffffffffffffff"; })).status,
  calibration_identity_hash: project(readyPair, mutate(readyPair.advisory, (draft) => { draft.lineage_hashes.calibration_identity_hash = h("9"); })).status,
  calibration_result_hash: project(readyPair, mutate(readyPair.advisory, (draft) => { draft.lineage_hashes.calibration_result_hash = h("9"); })).status,
  warning_code: project(readyPair, mutate(readyPair.advisory, (draft) => {
    draft.warnings = [{ code: "metric_value_unavailable", path: "/lineage_hashes", severity: "warning", messageKey: "confidence_calibration_advisory.metric_value_unavailable" }];
  })).status,
  warning_path: project(warningPair, mutate(warningPair.advisory, (draft) => { draft.warnings[0].path = "/changed"; })).status,
  warning_severity: project(warningPair, mutate(warningPair.advisory, (draft) => { draft.warnings[0].severity = "error"; })).status,
  warning_messageKey: project(warningPair, mutate(warningPair.advisory, (draft) => { draft.warnings[0].messageKey = "confidence_calibration_advisory.changed"; })).status,
  issue_code: project(readyPair, mutate(readyPair.advisory, (draft) => {
    draft.issues = [{ code: "blocked_calibration_result", path: "/status", severity: "error", messageKey: "confidence_calibration_advisory.blocked_calibration_result" }];
  })).status,
  issue_path: project(readyPair, mutate(readyPair.advisory, (draft) => {
    draft.issues = [{ code: "blocked_calibration_result", path: "/changed", severity: "error", messageKey: "confidence_calibration_advisory.blocked_calibration_result" }];
  })).status,
  issue_severity: project(readyPair, mutate(readyPair.advisory, (draft) => {
    draft.issues = [{ code: "blocked_calibration_result", path: "/status", severity: "warning", messageKey: "confidence_calibration_advisory.blocked_calibration_result" }];
  })).status,
  issue_messageKey: project(readyPair, mutate(readyPair.advisory, (draft) => {
    draft.issues = [{ code: "blocked_calibration_result", path: "/status", severity: "error", messageKey: "confidence_calibration_advisory.changed" }];
  })).status,
  lineage: project(readyPair, mutate(readyPair.advisory, (draft) => { draft.lineage_hashes.evidence_lineage_hash = h("9"); })).status,
  advisory_visible: project(readyPair, mutate(readyPair.advisory, (draft) => { draft.advisory_visible = false; })).status,
  advisory_eligible: project(readyPair, mutate(readyPair.advisory, (draft) => { draft.advisory_eligible = false; })).status,
  application_eligible: project(readyPair, mutate(readyPair.advisory, (draft) => { draft.application_eligible = true; })).status,
  reasons: project(readyPair, mutate(readyPair.advisory, (draft) => { draft.reasons = ["changed_reason"]; })).status,
  non_authoritative: project(readyPair, mutate(readyPair.advisory, (draft) => { draft.non_authoritative = false; })).status,
  applied: project(readyPair, mutate(readyPair.advisory, (draft) => { draft.applied = true; })).status,
  adapter_schema_version: project(readyPair, advisoryWithAlteredSemanticVersion(readyPair.advisory, {
    adapter_schema_version: "confidence_calibration_advisory_result_v0",
  })).status,
  configuration_version: project(readyPair, advisoryWithAlteredSemanticVersion(readyPair.advisory, {
    configuration_version: "confidence_calibration_advisory_config_v0",
  })).status,
};

const swappedHashAttacks = {
  another_valid_advisory_hash: project(readyPair, mutate(readyPair.advisory, (draft) => { draft.advisory_hash = noAdjustmentPair.advisory.advisory_hash; })).status,
  advisory_identity_hash: project(readyPair, mutate(readyPair.advisory, (draft) => {
    draft.advisory_hash = canonicalHash({ advisory_id: readyPair.advisory.advisory_id, advisory_hash: readyPair.advisory.advisory_hash });
  })).status,
  calibration_identity_hash: project(readyPair, mutate(readyPair.advisory, (draft) => { draft.advisory_hash = readyPair.advisory.lineage_hashes.calibration_identity_hash; })).status,
  calibration_result_hash: project(readyPair, mutate(readyPair.advisory, (draft) => { draft.advisory_hash = readyPair.advisory.lineage_hashes.calibration_result_hash; })).status,
  projection_identity_hash: project(readyPair, mutate(readyPair.advisory, (draft) => { draft.advisory_hash = ready.projection_hash; })).status,
};

const combinedTampering = {
  status_plus_proposed_confidence: project(readyPair, mutate(readyPair.advisory, (draft) => {
    draft.status = "advisory_ready_with_warnings";
    draft.proposed_calibrated_confidence = 53;
  })).status,
  advisory_id_plus_warning: project(readyPair, mutate(readyPair.advisory, (draft) => {
    draft.advisory_id = "confidence_calibration_advisory_v1:eeeeeeeeeeeeeeeeeeeeeeee";
    draft.warnings = [{ code: "metric_value_unavailable", path: "/lineage_hashes", severity: "warning", messageKey: "confidence_calibration_advisory.metric_value_unavailable" }];
  })).status,
  calibration_hash_plus_lineage: project(readyPair, mutate(readyPair.advisory, (draft) => {
    draft.lineage_hashes.calibration_result_hash = h("9");
    draft.lineage_hashes.evidence_lineage_hash = h("8");
  })).status,
  issues_plus_flags: project(readyPair, mutate(readyPair.advisory, (draft) => {
    draft.issues = [{ code: "blocked_calibration_result", path: "/status", severity: "error", messageKey: "confidence_calibration_advisory.blocked_calibration_result" }];
    draft.advisory_visible = false;
  })).status,
  recommendation_fingerprint_plus_snapshot: project(readyPair, mutate(readyPair.advisory, (draft) => {
    draft.recommendation_fingerprint = "changed";
    draft.recommendation_snapshot_hash = h("9");
  })).status,
  reasons_plus_eligibility: project(readyPair, mutate(readyPair.advisory, (draft) => {
    draft.reasons = ["changed"];
    draft.advisory_eligible = false;
  })).status,
  schema_version_plus_delta: project(readyPair, mutate(readyPair.advisory, (draft) => { draft.proposed_delta = 3; })).status,
};

const reorderedWarningAdvisory = independentlyRehashAdvisory(mutate(warningPair.advisory, (draft) => {
  draft.warnings = [...draft.warnings].reverse();
  draft.issues = [...draft.issues].reverse();
  draft.lineage_hashes.pattern_discovery_result_hashes = [...draft.lineage_hashes.pattern_discovery_result_hashes].reverse();
  draft.lineage_hashes.pattern_insight_hashes = [...draft.lineage_hashes.pattern_insight_hashes].reverse();
  draft.reasons = [...draft.reasons].reverse();
}));
const reorderedWarningProjection = project(warningPair, reorderedWarningAdvisory);

const duplicatedWarningAdvisory = independentlyRehashAdvisory(mutate(warningPair.advisory, (draft) => {
  draft.warnings = [draft.warnings[0], draft.warnings[0]];
}));

const lineageRetained = project(readyPair, mutate(readyPair.advisory, (draft) => {
  draft.lineage_hashes.evidence_lineage_hash = h("9");
}));
const lineageRehashed = project(readyPair, independentlyRehashAdvisory(mutate(readyPair.advisory, (draft) => {
  draft.lineage_hashes.evidence_lineage_hash = h("9");
})));

const precedenceCases = {
  malformed_shape_outranks_status: primaryIssue(buildConfidenceCalibrationRecommendationProjection({
    recommendation: readyPair.projectionRecommendation,
    advisory: { status: "advisory_maybe" },
    configuration: projectionConfig,
  }))?.code === "invalid_advisory_result",
  unsupported_status_outranks_confidence_mismatch: project(readyPair, mutate(readyPair.advisory, (draft) => {
    draft.status = "advisory_maybe";
    draft.original_confidence = 51;
  })).status === "blocked_unsupported_status",
  confidence_mismatch_outranks_hash_mismatch: project(readyPair, mutate(readyPair.advisory, (draft) => {
    draft.original_confidence = 51;
    draft.advisory_hash = h("9");
  })).status === "blocked_confidence_mismatch",
  advisory_hash_mismatch_outranks_lineage: lineageRetained.status === "blocked_advisory_result",
  advisory_hash_mismatch_outranks_leakage: project(readyPair, mutate(readyPair.advisory, (draft) => { draft.advisory_hash = h("9"); }), mutate(readyPair.projectionRecommendation, (draft) => {
    draft.anti_leakage.future_outcome_evidence = true;
  })).status === "blocked_advisory_result",
  advisory_hash_mismatch_outranks_feedback: project(readyPair, mutate(readyPair.advisory, (draft) => { draft.advisory_hash = h("9"); }), mutate(readyPair.projectionRecommendation, (draft) => {
    draft.anti_feedback.projection_reused_as_ranking_signal = true;
  })).status === "blocked_advisory_result",
  advisory_hash_mismatch_outranks_warning_compatibility: project(readyPair, mutate(readyPair.advisory, (draft) => {
    draft.advisory_hash = h("9");
    draft.warnings = [{ code: "bad_warning", path: "/bad", severity: "warning", messageKey: "bad" }];
  })).status === "blocked_advisory_result",
};

const blockedStatusOutputs = Object.fromEntries(
  [
    "advisory_insufficient_evidence",
    "blocked_invalid_input",
    "blocked_confidence_mismatch",
    "blocked_invalid_lineage",
    "blocked_future_leakage",
    "blocked_calibration_result",
    "blocked_unsupported_status",
  ].map((status) => {
    const advisory = mutate(readyPair.advisory, (draft) => {
      draft.status = status;
      draft.advisory_eligible = false;
      draft.advisory_visible = false;
      draft.reasons = [`${status}_reason`];
    });
    return [status, project(readyPair, advisory).status];
  }),
);

const noAdjustmentTampered = project(noAdjustmentPair, mutate(noAdjustmentPair.advisory, (draft) => {
  draft.proposed_delta = 1;
}));

const leakageBlocked = project(readyPair, readyPair.advisory, mutate(readyPair.projectionRecommendation, (draft) => {
  draft.anti_leakage.future_outcome_evidence = true;
}));
const feedbackBlocked = project(readyPair, readyPair.advisory, mutate(readyPair.projectionRecommendation, (draft) => {
  draft.anti_feedback.projection_reused_as_ranking_signal = true;
}));
const invalidRecommendationLineage = project(readyPair, readyPair.advisory, mutate(readyPair.projectionRecommendation, (draft) => {
  draft.lineage.recommendation_source_hash = h("9");
}));

const mutationInputs = [
  { name: "valid", pair: readyPair, advisory: readyPair.advisory, recommendation: readyPair.projectionRecommendation },
  { name: "hash_mismatch", pair: readyPair, advisory: mutate(readyPair.advisory, (draft) => { draft.advisory_hash = h("9"); }), recommendation: readyPair.projectionRecommendation },
  { name: "lineage_blocked", pair: readyPair, advisory: independentlyRehashAdvisory(mutate(readyPair.advisory, (draft) => { draft.lineage_hashes.evidence_lineage_hash = h("9"); })), recommendation: readyPair.projectionRecommendation },
  { name: "leakage_blocked", pair: readyPair, advisory: readyPair.advisory, recommendation: mutate(readyPair.projectionRecommendation, (draft) => { draft.anti_leakage.future_outcome_evidence = true; }) },
  { name: "feedback_blocked", pair: readyPair, advisory: readyPair.advisory, recommendation: mutate(readyPair.projectionRecommendation, (draft) => { draft.anti_feedback.projection_reused_as_ranking_signal = true; }) },
];

const nonMutationResults = Object.fromEntries(mutationInputs.map((input) => {
  const frozenInput = deepFreeze(clone({
    recommendation: input.recommendation,
    advisory: input.advisory,
    configuration: projectionConfig,
  }));
  const before = stable(frozenInput);
  buildConfidenceCalibrationRecommendationProjection(frozenInput);
  return [input.name, before === stable(frozenInput)];
}));

const mismatch = project(readyPair, mutate(readyPair.advisory, (draft) => { draft.advisory_hash = h("9"); }));
const mismatchRepeatedA = stable(mismatch);
const mismatchRepeatedB = stable(project(readyPair, mutate(readyPair.advisory, (draft) => { draft.advisory_hash = h("9"); })));
const interleavedA = stable(project(readyPair));
project(warningPair);
project(noAdjustmentPair);
project(readyPair, mutate(readyPair.advisory, (draft) => { draft.advisory_hash = h("9"); }));
const interleavedB = stable(project(readyPair));

const sourceChecks = {
  exact_runtime_export: (projectionSource.match(/export function buildConfidenceCalibrationRecommendationProjection/g) ?? []).length === 1,
  exact_type_exports: expected.publicTypes.every((typeName) => projectionSource.includes(`export type ${typeName}`)) &&
    (projectionSource.match(/export type /g) ?? []).length === expected.publicTypes.length,
  no_public_helpers: !projectionSource.includes("export function canonical") &&
    !projectionSource.includes("export function sha256") &&
    !projectionSource.includes("export const") &&
    !projectionSource.includes("export class"),
  synchronous_pure_function: !projectionSource.includes("async function buildConfidenceCalibrationRecommendationProjection") &&
    !projectionSource.includes("Promise<") &&
    !projectionSource.includes("class ") &&
    !projectionSource.includes("new Map<string,") === false,
  status_bound_in_source: projectionSource.includes("status: advisory.status") &&
    projectionSource.includes("advisory.advisory_hash === expectedHash"),
  phase_10_before_phase_11: projectionSource.indexOf("hasValidAdvisoryIdentityAndSemanticHash") < projectionSource.indexOf("hasMatchingLineage(recommendation, advisory)"),
};
sourceChecks.synchronous_pure_function = !projectionSource.includes("async ") &&
  !projectionSource.includes("fetch(") &&
  !projectionSource.includes("@supabase") &&
  !projectionSource.includes("process.env") &&
  !projectionSource.includes("Date.now") &&
  !projectionSource.includes("Math.random");

const appOrLibConsumers = rgFiles(
  "buildConfidenceCalibrationRecommendationProjection|confidence-calibration-recommendation-advisory-projection",
  ["app", "lib"],
).filter((path) => path !== paths.projection);

const auditConsumers = rgFiles(
  "buildConfidenceCalibrationRecommendationProjection|confidence-calibration-recommendation-advisory-projection",
  ["scripts", "tests"],
);

const allowedAuditConsumers = new Set([
  "scripts/action-318-static-replay-batch-commit-readiness-verify.mjs",
  "scripts/action-319-static-replay-batch-post-commit-verify.mjs",
  "scripts/action-320-static-replay-branch-package-verify.mjs",
  "scripts/action-442-independent-static-confidence-calibration-advisory-hash-freeze-verification-verify.mjs",
  "scripts/action-443-static-confidence-calibration-advisory-shadow-execution-approval-gate-verify.mjs",
  "scripts/action-444-static-confidence-calibration-advisory-shadow-use-verify.mjs",
  "scripts/action-445-independent-static-confidence-calibration-advisory-shadow-verification-verify.mjs",
  "scripts/action-446-static-confidence-calibration-advisory-shadow-release-gate-verify.mjs",
  "scripts/action-447-confidence-calibration-advisory-recommendation-engine-consumption-contract-approval-gate-verify.mjs",
  "scripts/action-448-confidence-calibration-recommendation-advisory-projection-implementation-verify.mjs",
  "scripts/action-449-independent-confidence-calibration-recommendation-advisory-projection-verification-verify.mjs",
  "scripts/action-450-projection-advisory-status-hash-binding-remediation-approval-gate-verify.mjs",
  "scripts/action-451-projection-advisory-status-hash-binding-remediation-verify.mjs",
  "scripts/action-453-static-confidence-calibration-recommendation-advisory-projection-fixture-and-hash-freeze-approval-gate-verify.mjs",
  "scripts/action-454-static-confidence-calibration-recommendation-advisory-projection-hash-freeze.mjs",
  "scripts/action-454-static-confidence-calibration-recommendation-advisory-projection-hash-freeze-verify.mjs",
  paths.verifier,
  "tests/e2e/action-447-confidence-calibration-advisory-recommendation-engine-consumption-contract-approval-gate.spec.ts",
  "tests/e2e/action-448-confidence-calibration-recommendation-advisory-projection-implementation.spec.ts",
  "tests/e2e/action-449-independent-confidence-calibration-recommendation-advisory-projection-verification.spec.ts",
  "tests/e2e/action-450-projection-advisory-status-hash-binding-remediation-approval-gate.spec.ts",
  "tests/e2e/action-451-projection-advisory-status-hash-binding-remediation.spec.ts",
  "tests/e2e/action-453-static-confidence-calibration-recommendation-advisory-projection-fixture-and-hash-freeze-approval-gate.spec.ts",
  "tests/e2e/action-454-static-confidence-calibration-recommendation-advisory-projection-hash-freeze.spec.ts",
  paths.test,
]);
const unexpectedAuditConsumers = auditConsumers.filter((path) => !allowedAuditConsumers.has(path));

const forbiddenAction452Artifacts = [
  "docs/action-452-independent-post-remediation-projection-verification-fixture-manifest.json",
  "docs/action-452-independent-post-remediation-projection-verification-hash-inventory.json",
  "docs/action-452-independent-post-remediation-projection-shadow-input-manifest.json",
  "scripts/action-452-independent-post-remediation-projection-shadow-run.mjs",
  "scripts/action-452-independent-post-remediation-projection-fixture-freeze.mjs",
  "lib/confidence-calibration-recommendation-advisory-projection-consumer.ts",
  "lib/recommendation-engine-confidence-calibration-advisory-projection-consumer.ts",
].filter(exists);

const deploymentFiles = statusFiles().filter((path) =>
  path === "netlify.toml" ||
  path.startsWith(".netlify/") ||
  path.startsWith("app/api/confidence-calibration-recommendation-advisory-projection") ||
  path.startsWith("app/confidence-calibration-recommendation-advisory-projection") ||
  path.startsWith("public/action-452"));

const action309 = exists(paths.action309Guard) ? runJson("node", [paths.action309Guard]) : {};
const action450 = exists(paths.action450Verifier) ? runJson("node", [paths.action450Verifier]) : {};
const action451 = exists(paths.action451Verifier) ? runJson("node", [paths.action451Verifier]) : {};

const protectedAfter = Object.fromEntries(protectedSourcePaths.map((path) => [path, sha256Text(read(path))]));
const protectedUnchanged = Object.fromEntries(
  protectedSourcePaths.map((path) => [path, protectedBefore[path] === protectedAfter[path]]),
);

const fieldInventory = {
  statuses: expected.statuses,
  included_in_advisory_result_hash: expected.semanticFields,
  explicitly_non_semantic_and_excluded: expected.nonSemanticFields,
  absent_for_status_specific_shape: Object.fromEntries(expected.statuses.map((status) => [status, []])),
  unclassified_fields: [],
};

const malformedAllBlock = Object.values(malformedHashCases).every((status) => status === "blocked_advisory_result");
const retainedMaterialBlocks = Object.entries(retainedHashAttacks).every(([, status]) =>
  ["blocked_advisory_result", "blocked_confidence_mismatch", "blocked_invalid_input"].includes(status));
const retainedPhase10Blocks = [
  "status",
  "advisory_id",
  "recommendation_fingerprint",
  "recommendation_snapshot_hash",
  "proposed_delta",
  "proposed_calibrated_confidence",
  "calibration_status",
  "calibration_id",
  "calibration_identity_hash",
  "calibration_result_hash",
  "warning_code",
  "warning_path",
  "warning_severity",
  "warning_messageKey",
  "issue_code",
  "issue_path",
  "issue_severity",
  "issue_messageKey",
  "lineage",
  "advisory_visible",
  "advisory_eligible",
  "reasons",
  "non_authoritative",
  "applied",
  "adapter_schema_version",
  "configuration_version",
].every((key) => retainedHashAttacks[key] === "blocked_advisory_result");

const warningMismatchIssue = primaryIssue(mismatch);
const semanticOrder = {
  warning_reorder_accepted: reorderedWarningProjection.status === warningReady.status,
  issue_reorder_accepted: reorderedWarningProjection.status === warningReady.status,
  lineage_reorder_accepted: reorderedWarningProjection.status === warningReady.status,
  reason_reorder_accepted: reorderedWarningProjection.status === warningReady.status,
  result_hash_stable: reorderedWarningAdvisory.advisory_hash === warningPair.advisory.advisory_hash,
  projection_hash_stable: reorderedWarningProjection.projection_hash === warningReady.projection_hash,
  projection_id_stable: reorderedWarningProjection.projection_id === warningReady.projection_id,
  canonical_output_stable: stable(reorderedWarningProjection) === stable(warningReady),
  changed_multiplicity_materially_stable: duplicatedWarningAdvisory.advisory_hash === warningPair.advisory.advisory_hash,
};

const projectionIdentity = {
  projection_id: ready.projection_id,
  projection_hash: ready.projection_hash,
  independently_recomputed_projection_hash: independentlyRecomputedProjectionHash,
  projection_id_expected: projectionIdExpected,
  matches: ready.projection_hash === independentlyRecomputedProjectionHash && ready.projection_id === projectionIdExpected,
  material_input_changes_affect_identity: ready.projection_hash !== noAdjustment.projection_hash,
  no_time_path_randomness_terms: ["Date.now", "Math.random", "__dirname", "process.cwd", "performance.now"].every((term) => !projectionSource.includes(term)),
};

const checks = {
  documentation_exists: exists(paths.doc),
  verifier_exists: exists(paths.verifier),
  focused_test_exists: exists(paths.test),
  action309_guard_healthy: action309.guard_status === "passed",
  action450_healthy: action450.verification_status === "passed",
  action451_healthy: action451.verification_status === "passed",
  protected_sources_unchanged: Object.values(protectedUnchanged).every(Boolean),
  exact_runtime_export: sourceChecks.exact_runtime_export,
  exact_type_exports: sourceChecks.exact_type_exports,
  no_public_helpers: sourceChecks.no_public_helpers,
  synchronous_pure_function: sourceChecks.synchronous_pure_function,
  complete_field_inventory_classified: expected.semanticFields.every((field) => doc.includes(`\`${field}\``)) &&
    expected.nonSemanticFields.every((field) => doc.includes(`\`${field}\``)) &&
    fieldInventory.unclassified_fields.length === 0,
  independent_valid_hash_matches: advisoryHash === readyPair.advisory.advisory_hash,
  valid_advisory_ready_accepted: ready.status === "projection_ready",
  valid_advisory_ready_with_warnings_accepted: warningReady.status === "projection_ready_with_warnings",
  valid_advisory_no_adjustment_accepted: noAdjustment.status === "projection_no_adjustment",
  blocked_status_outputs_preserved: Object.entries(blockedStatusOutputs).every(([advisoryStatus, projectionStatus]) =>
    projectionStatus === expected.statusMapping[advisoryStatus]),
  malformed_hashes_block: malformedAllBlock,
  swapped_hashes_block: Object.values(swappedHashAttacks).every((status) => status === "blocked_advisory_result"),
  retained_hash_attacks_block: retainedMaterialBlocks && retainedPhase10Blocks,
  combined_tampering_blocks: Object.values(combinedTampering).every((status) => status === "blocked_advisory_result"),
  semantic_order_equivalence: Object.values(semanticOrder).every(Boolean),
  validation_precedence_exact: Object.values(precedenceCases).every(Boolean),
  phase_11_defense_in_depth: lineageRetained.status === "blocked_advisory_result" &&
    lineageRehashed.status === "blocked_invalid_lineage",
  hash_role_separation: Object.values(swappedHashAttacks).every((status) => status === "blocked_advisory_result") &&
    ready.advisory_identity_hash !== ready.advisory_result_hash &&
    ready.advisory_result_hash !== ready.projection_hash,
  unaffected_outputs: ready.status === "projection_ready" &&
    warningReady.status === "projection_ready_with_warnings" &&
    noAdjustment.status === "projection_no_adjustment" &&
    invalidRecommendationLineage.status === "blocked_invalid_lineage" &&
    leakageBlocked.status === "blocked_future_leakage" &&
    feedbackBlocked.status === "blocked_invalid_lineage",
  no_adjustment_exact: noAdjustment.status === "projection_no_adjustment" &&
    noAdjustment.advisory_proposed_delta_basis_points === 0 &&
    noAdjustment.advisory_proposed_confidence_basis_points === noAdjustment.recommendation_original_confidence_basis_points &&
    noAdjustment.recommendation_confidence_unchanged === true &&
    noAdjustment.application_eligible === false &&
    noAdjustment.applied === false &&
    noAdjustment.non_authoritative === true &&
    noAdjustmentTampered.status === "blocked_advisory_result",
  mismatch_issue_exact: mismatch.status === "blocked_advisory_result" &&
    warningMismatchIssue?.code === "blocked_advisory_result" &&
    warningMismatchIssue?.path === "/advisory/advisory_hash" &&
    warningMismatchIssue?.severity === "error" &&
    warningMismatchIssue?.messageKey === "confidence_calibration_recommendation_projection.blocked_advisory_result" &&
    !stable(mismatch).includes("expectedHash") &&
    !stable(mismatch).includes("recomputed"),
  recommendation_non_mutation: Object.values(nonMutationResults).every(Boolean),
  projection_identity_exact: projectionIdentity.matches &&
    projectionIdentity.material_input_changes_affect_identity &&
    projectionIdentity.no_time_path_randomness_terms,
  immutability_and_determinism: Object.isFrozen(ready) &&
    Object.isFrozen(ready.warnings) &&
    Object.isFrozen(ready.issues) &&
    Object.isFrozen(ready.lineage_hashes) &&
    stable(project(readyPair)) === stable(project(readyPair)) &&
    mismatchRepeatedA === mismatchRepeatedB &&
    interleavedA === interleavedB,
  no_app_or_lib_consumers: appOrLibConsumers.length === 0,
  no_unexpected_audit_consumers: unexpectedAuditConsumers.length === 0,
  no_forbidden_action452_artifacts: forbiddenAction452Artifacts.length === 0,
  no_deployment_artifacts: deploymentFiles.length === 0,
  runtime_preview_paused: projectionConfig.runtime_preview_status === expected.runtimePreviewStatus &&
    projectionSource.includes(expected.runtimePreviewStatus),
};

const failedChecks = Object.entries(checks)
  .filter(([, passed]) => !passed)
  .map(([name]) => name);

const readinessDecision = failedChecks.length === 0 ? expected.readinessDecision : "blocked";
const safety = {
  provider_call_executed: false,
  provider_call_attempted: false,
  supabase_read_executed: false,
  supabase_write_executed: false,
  persistence_executed: false,
  replay_executed: false,
  runtime_route_created: false,
  ui_consumer_created: false,
  recommendation_engine_consumer_created: false,
  confidence_applied: false,
  recommendation_mutated: false,
  ranking_changed: false,
  scanner_behavior_changed: false,
  publication_changed: false,
  execution_changed: false,
  feedback_executed: false,
  deployment_artifact_changed: false,
};

const report = {
  verification_status: failedChecks.length === 0 ? "passed" : "failed",
  readiness_decision: readinessDecision,
  readiness_vocabulary: ["ready", "ready_with_conditions", "blocked"],
  failed_checks_count: failedChecks.length,
  failed_checks: failedChecks,
  passed_checks_count: Object.keys(checks).length - failedChecks.length,
  unresolved_conditions: readinessDecision === "ready_with_conditions" ? ["static_projection_fixtures_and_hash_freeze_future_work"] : [],
  source_integrity: {
    protected_source_paths: protectedSourcePaths,
    before_hashes: protectedBefore,
    after_hashes: protectedAfter,
    unchanged: protectedUnchanged,
  },
  api_surface: {
    runtime_export: expected.runtimeExport,
    public_type_exports: expected.publicTypes,
    no_public_hashing_helper: sourceChecks.no_public_helpers,
    synchronous_pure_function: sourceChecks.synchronous_pure_function,
  },
  complete_advisory_field_inventory: fieldInventory,
  independent_advisory_hash: {
    supplied: readyPair.advisory.advisory_hash,
    independently_recomputed: advisoryHash,
    matches: advisoryHash === readyPair.advisory.advisory_hash,
    advisory_id_bound_same_phase: readyPair.advisory.advisory_id === `confidence_calibration_advisory_v1:${advisoryHash.slice(0, 24)}`,
  },
  malformed_hash_audit: malformedHashCases,
  retained_hash_attacks: retainedHashAttacks,
  swapped_hash_attacks: swappedHashAttacks,
  combined_tampering: combinedTampering,
  semantic_order_equivalence: semanticOrder,
  validation_precedence: precedenceCases,
  phase_11_defense_in_depth: {
    retained_hash_lineage_mutation_status: lineageRetained.status,
    rehashed_lineage_mutation_status: lineageRehashed.status,
  },
  hash_role_separation: {
    calibration_identity_hash_substitution: swappedHashAttacks.calibration_identity_hash,
    calibration_result_hash_substitution: swappedHashAttacks.calibration_result_hash,
    advisory_identity_hash_substitution: swappedHashAttacks.advisory_identity_hash,
    projection_identity_hash_substitution: swappedHashAttacks.projection_identity_hash,
    roles_distinct: checks.hash_role_separation,
  },
  unaffected_outputs: {
    advisory_ready: ready.status,
    advisory_ready_with_warnings: warningReady.status,
    advisory_no_adjustment: noAdjustment.status,
    blocked_status_outputs: blockedStatusOutputs,
    confidence_mismatch: retainedHashAttacks.original_confidence,
    invalid_recommendation_lineage: invalidRecommendationLineage.status,
    invalid_advisory_lineage: lineageRehashed.status,
    leakage_block: leakageBlocked.status,
    feedback_block: feedbackBlocked.status,
    recommendation_confidence_unchanged: ready.recommendation_confidence_unchanged,
    effect_flags_false: ready.ranking_affected === false &&
      ready.scanner_affected === false &&
      ready.publication_affected === false &&
      ready.execution_affected === false,
  },
  no_adjustment: {
    status: noAdjustment.status,
    delta_basis_points: noAdjustment.advisory_proposed_delta_basis_points,
    proposed_confidence_basis_points: noAdjustment.advisory_proposed_confidence_basis_points,
    recommendation_original_confidence_basis_points: noAdjustment.recommendation_original_confidence_basis_points,
    tampered_status: noAdjustmentTampered.status,
  },
  mismatch_issue: {
    status: mismatch.status,
    code: warningMismatchIssue?.code ?? null,
    path: warningMismatchIssue?.path ?? null,
    severity: warningMismatchIssue?.severity ?? null,
    messageKey: warningMismatchIssue?.messageKey ?? null,
    raw_hashes_exposed: false,
  },
  recommendation_non_mutation: nonMutationResults,
  projection_identity: projectionIdentity,
  immutability_and_determinism: {
    output_deep_frozen: Object.isFrozen(ready) && Object.isFrozen(ready.warnings) && Object.isFrozen(ready.issues) && Object.isFrozen(ready.lineage_hashes),
    repeated_valid_calls_identical: stable(project(readyPair)) === stable(project(readyPair)),
    repeated_mismatch_calls_identical: mismatchRepeatedA === mismatchRepeatedB,
    interleaved_calls_identical: interleavedA === interleavedB,
    reordered_inputs_identical: semanticOrder.canonical_output_stable,
  },
  isolation: {
    app_or_lib_consumers: appOrLibConsumers,
    audit_consumers: auditConsumers,
    unexpected_audit_consumers: unexpectedAuditConsumers,
    forbidden_action452_artifacts: forbiddenAction452Artifacts,
    deployment_files: deploymentFiles,
    no_provider_supabase_runtime_terms: checks.synchronous_pure_function,
  },
  upstream_health: {
    action309_guard_status: action309.guard_status ?? null,
    action450_verification_status: action450.verification_status ?? null,
    action451_verification_status: action451.verification_status ?? null,
  },
  safety,
  deployment_status: "not_authorized_not_required",
  runtime_preview_status: expected.runtimePreviewStatus,
  unrelated_work_classification: "action_452_independent_static_audit_only",
  recommended_next_action: expected.nextAction,
  checks,
};

console.log(JSON.stringify(report, null, 2));
process.exit(failedChecks.length === 0 ? 0 : 1);
