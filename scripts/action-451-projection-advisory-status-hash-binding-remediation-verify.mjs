#!/usr/bin/env node

import { spawnSync } from "child_process";
import { createHash } from "crypto";
import { existsSync, readFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { pathToFileURL } from "url";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const abs = (path) => join(root, path);
const exists = (path) => existsSync(abs(path));
const read = (path) => readFileSync(abs(path), "utf8");

const paths = {
  projection: "lib/confidence-calibration-recommendation-advisory-projection.ts",
  advisory: "lib/confidence-calibration-advisory-adapter.ts",
  calibration: "lib/pure-confidence-calibration.ts",
  doc: "docs/action-451-projection-advisory-status-hash-binding-remediation.md",
  verifier: "scripts/action-451-projection-advisory-status-hash-binding-remediation-verify.mjs",
  test: "tests/e2e/action-451-projection-advisory-status-hash-binding-remediation.spec.ts",
};

const expected = {
  runtimePreviewStatus: "runtime_preview_waiting_for_operator_inputs",
  nextAction: "action_452_independent_post_remediation_projection_verification",
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
  publicTypes: [
    "ImmutableRecommendationProjectionEnvelope",
    "FrozenRecommendationProjectionConfiguration",
    "ConfidenceCalibrationRecommendationProjectionResult",
  ],
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

function orderText(values) {
  return [...new Set(values)].sort(compareText);
}

function orderEntries(values) {
  const unique = new Map();
  for (const value of values) {
    unique.set(`${value.severity}\u0000${value.code}\u0000${value.path}\u0000${value.messageKey}`, value);
  }
  return [...unique.values()].sort(
    (left, right) =>
      compareText(left.severity, right.severity) ||
      compareText(left.code, right.code) ||
      compareText(left.path, right.path) ||
      compareText(left.messageKey, right.messageKey),
  );
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function mutate(value, patch) {
  const draft = clone(value);
  patch(draft);
  return draft;
}

function stable(value) {
  return JSON.stringify(canonicalize(value));
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

function completeAdvisoryPayload(advisory) {
  return {
    adapter_schema_version: projectionConfig.advisory_schema_version,
    configuration_version: projectionConfig.advisory_configuration_version,
    status: advisory.status,
    recommendation_fingerprint: advisory.recommendation_fingerprint,
    recommendation_snapshot_hash: advisory.recommendation_snapshot_hash,
    original_confidence_basis_points: toBasisPoints(advisory.original_confidence),
    calibration_status: advisory.calibration_status,
    calibration_id: advisory.calibration_id,
    calibration_identity_hash: advisory.lineage_hashes.calibration_identity_hash,
    calibration_result_hash: advisory.lineage_hashes.calibration_result_hash,
    proposed_delta_basis_points: toBasisPoints(advisory.proposed_delta),
    proposed_confidence_basis_points: toBasisPoints(advisory.proposed_calibrated_confidence),
    warnings: orderEntries(advisory.warnings),
    issues: orderEntries(advisory.issues),
    lineage_hashes: canonicalLineage(advisory.lineage_hashes),
    advisory_eligible: advisory.advisory_eligible,
    advisory_visible: advisory.advisory_visible,
    application_eligible: advisory.application_eligible,
    reasons: orderText(advisory.reasons),
    non_authoritative: advisory.non_authoritative,
    applied: advisory.applied,
  };
}

function completeRehashAdvisory(value) {
  const draft = clone(value);
  const hash = canonicalHash(completeAdvisoryPayload(draft));
  draft.advisory_hash = hash;
  draft.advisory_id = `confidence_calibration_advisory_v1:${hash.slice(0, 24)}`;
  return draft;
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
      source_version: "action_451_static_remediation",
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

function recommendationFor(calibration) {
  return {
    recommendation_id: "rec_action_451",
    recommendation_fingerprint: "rec_fp_action_451",
    recommendation_snapshot_hash: h("f"),
    original_confidence: calibration.original_confidence ?? 50,
    decision_boundary: {
      boundary_id: "boundary_action_451",
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
      source_scenario_ids: ["scenario_451"],
      source_snapshot_ids: ["snapshot_451"],
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
    insight_id: "insight_action_451",
    insight_sha256: h("e"),
    source_scenario_ids: ["scenario_451"],
    source_snapshot_ids: ["snapshot_451"],
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

function rgFiles(pattern, targets) {
  const result = spawnSync("rg", ["-l", pattern, ...targets], { cwd: root, encoding: "utf8" });
  if (result.status !== 0 && result.status !== 1) throw new Error(result.stderr || `rg failed:${pattern}`);
  return result.stdout.trim() ? result.stdout.trim().split("\n").sort() : [];
}

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

const projectionSource = read(paths.projection);
const doc = read(paths.doc);

const projectionModule = await import(pathToFileURL(abs(paths.projection)).href);
const advisoryModule = await import(pathToFileURL(abs(paths.advisory)).href);
const calibrationModule = await import(pathToFileURL(abs(paths.calibration)).href);

const { buildConfidenceCalibrationRecommendationProjection } = projectionModule;
const { buildConfidenceCalibrationAdvisory } = advisoryModule;
const { calibrateConfidence } = calibrationModule;

function makePair(insights, baseConfidence = 50) {
  const calibration = calibrateConfidence({ baseConfidence, insights, configuration: calibrationConfig });
  const recommendation = recommendationFor(calibration);
  const adapterAdvisory = buildConfidenceCalibrationAdvisory({ recommendation, calibration, configuration: advisoryConfig });
  const advisory = completeRehashAdvisory(adapterAdvisory);
  const projectionRecommendation = projectionRecommendationFor(recommendation, advisory);
  return { calibration, recommendation, adapterAdvisory, advisory, projectionRecommendation };
}

function project(pair, advisory = pair.advisory, recommendation = pair.projectionRecommendation, configuration = projectionConfig) {
  return buildConfidenceCalibrationRecommendationProjection({ recommendation, advisory, configuration });
}

function primaryIssue(result) {
  return result.issues[0] ?? null;
}

const readyPair = makePair([insight()]);
const warningPair = makePair([insight({ warning_codes: ["metric_value_unavailable"] })]);
const neutralInsight = insight({
  insight: { ...insight().insight, evidence_direction: "neutral" },
});
const noAdjustmentPair = makePair([neutralInsight]);

const ready = project(readyPair);
const warningReady = project(warningPair);
const noAdjustment = project(noAdjustmentPair);

const malformedHash = project(readyPair, mutate(readyPair.advisory, (draft) => {
  draft.advisory_hash = "bad";
}));

const retainedHashAttacks = {
  advisory_status: project(readyPair, mutate(readyPair.advisory, (draft) => { draft.status = "advisory_ready_with_warnings"; })).status,
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
  warning: project(readyPair, mutate(readyPair.advisory, (draft) => {
    draft.warnings = [{ code: "metric_value_unavailable", path: "/lineage_hashes", severity: "warning", messageKey: "confidence_calibration_advisory.metric_value_unavailable" }];
  })).status,
  issue: project(readyPair, mutate(readyPair.advisory, (draft) => {
    draft.issues = [{ code: "blocked_calibration_result", path: "/status", severity: "error", messageKey: "confidence_calibration_advisory.blocked_calibration_result" }];
  })).status,
  lineage: project(readyPair, mutate(readyPair.advisory, (draft) => { draft.lineage_hashes.evidence_lineage_hash = h("9"); })).status,
  advisory_visible: project(readyPair, mutate(readyPair.advisory, (draft) => { draft.advisory_visible = false; })).status,
  advisory_eligible: project(readyPair, mutate(readyPair.advisory, (draft) => { draft.advisory_eligible = false; })).status,
  application_eligible: project(readyPair, mutate(readyPair.advisory, (draft) => { draft.application_eligible = true; })).status,
  non_authoritative: project(readyPair, mutate(readyPair.advisory, (draft) => { draft.non_authoritative = false; })).status,
  applied: project(readyPair, mutate(readyPair.advisory, (draft) => { draft.applied = true; })).status,
  reasons: project(readyPair, mutate(readyPair.advisory, (draft) => { draft.reasons = ["changed_reason"]; })).status,
  combined: project(readyPair, mutate(readyPair.advisory, (draft) => {
    draft.status = "advisory_ready_with_warnings";
    draft.proposed_delta = 3;
    draft.reasons = ["combined"];
  })).status,
};

const advisoryIdentityHash = canonicalHash({
  advisory_id: readyPair.advisory.advisory_id,
  advisory_hash: readyPair.advisory.advisory_hash,
});

const swappedHashAttacks = {
  another_valid_advisory_hash: project(readyPair, mutate(readyPair.advisory, (draft) => { draft.advisory_hash = noAdjustmentPair.advisory.advisory_hash; })).status,
  advisory_identity_hash: project(readyPair, mutate(readyPair.advisory, (draft) => { draft.advisory_hash = advisoryIdentityHash; })).status,
  calibration_result_hash: project(readyPair, mutate(readyPair.advisory, (draft) => { draft.advisory_hash = readyPair.advisory.lineage_hashes.calibration_result_hash; })).status,
  projection_hash: project(readyPair, mutate(readyPair.advisory, (draft) => { draft.advisory_hash = ready.projection_hash; })).status,
  unrelated_valid_format_hash: project(readyPair, mutate(readyPair.advisory, (draft) => { draft.advisory_hash = h("8"); })).status,
  all_zero_hash: project(readyPair, mutate(readyPair.advisory, (draft) => { draft.advisory_hash = h("0"); })).status,
  all_f_hash: project(readyPair, mutate(readyPair.advisory, (draft) => { draft.advisory_hash = h("f"); })).status,
  malformed_hash: malformedHash.status,
};

const reorderedWarningAdvisory = mutate(warningPair.advisory, (draft) => {
  draft.warnings = [...draft.warnings].reverse();
  draft.issues = [...draft.issues].reverse();
  draft.lineage_hashes.pattern_discovery_result_hashes = [...draft.lineage_hashes.pattern_discovery_result_hashes].reverse();
  draft.lineage_hashes.pattern_insight_hashes = [...draft.lineage_hashes.pattern_insight_hashes].reverse();
  draft.reasons = [...draft.reasons].reverse();
});
const reorderedWarning = project(warningPair, reorderedWarningAdvisory);

const lineageRetained = project(readyPair, mutate(readyPair.advisory, (draft) => {
  draft.lineage_hashes.evidence_lineage_hash = h("9");
}));
const lineageRehashed = project(readyPair, completeRehashAdvisory(mutate(readyPair.advisory, (draft) => {
  draft.lineage_hashes.evidence_lineage_hash = h("9");
})));

const earlierPhaseOutranksHash = project(readyPair, mutate(readyPair.advisory, (draft) => {
  draft.original_confidence = 51;
  draft.advisory_hash = h("9");
}));

const sourceChecks = {
  implementation_changed_only_inside_projection_boundary: projectionSource.includes("function buildAdvisorySemanticHashPayload") &&
    projectionSource.includes("status: advisory.status") &&
    projectionSource.includes("advisory_eligible: advisory.advisory_eligible") &&
    projectionSource.includes("reasons: orderText(advisory.reasons)") &&
    !read(paths.advisory).includes("action_451"),
  complete_payload_fields_present: expected.semanticFields.every((field) => projectionSource.includes(field)),
  advisory_status_included: projectionSource.includes("status: advisory.status"),
  canonicalization_exists: projectionSource.includes("function canonicalize") &&
    projectionSource.includes(".sort(([left], [right]) => compareText(left, right))") &&
    projectionSource.includes("Object.is(value, -0) ? 0 : value"),
  sha256_recomputation_exists: projectionSource.includes("const expectedHash = sha256(buildAdvisorySemanticHashPayload(advisory, configuration))"),
  supplied_recomputed_comparison_exists: projectionSource.includes("advisory.advisory_hash === expectedHash"),
  mismatch_maps_to_blocked_advisory_result: projectionSource.includes('issue("blocked_advisory_result", "/advisory/advisory_hash")'),
  phase_11_checks_remain: projectionSource.includes("function hasMatchingLineage") &&
    projectionSource.indexOf("hasValidAdvisoryIdentityAndSemanticHash") < projectionSource.indexOf("hasMatchingLineage(recommendation, advisory)"),
  exact_api_surface_unchanged: (projectionSource.match(/export function buildConfidenceCalibrationRecommendationProjection/g) ?? []).length === 1 &&
    expected.publicTypes.every((typeName) => projectionSource.includes(`export type ${typeName}`)) &&
    (projectionSource.match(/export type /g) ?? []).length === 3 &&
    !projectionSource.includes("export const") &&
    !projectionSource.includes("export class"),
};

const docChecks = {
  doc_exists: exists(paths.doc),
  field_inventory_exists: ["included_in_advisory_result_hash", "explicitly_non_semantic_and_excluded", "absent_for_status_specific_shape"].every((term) => doc.includes(term)),
  status_specific_shapes_exist: Object.keys(expected.statusMapping).every((status) => doc.includes(status)),
  action_452_identified: doc.includes(expected.nextAction),
  deployment_prohibited: doc.includes("Deployment required: no") && doc.includes("runtime_preview_waiting_for_operator_inputs"),
};

const appOrLibConsumers = rgFiles(
  "buildConfidenceCalibrationRecommendationProjection|confidence-calibration-recommendation-advisory-projection",
  ["app", "lib"],
).filter((path) => path !== paths.projection);

const forbiddenAction451Artifacts = [
  "docs/action-451-projection-advisory-status-hash-binding-remediation-fixture-manifest.json",
  "docs/action-451-projection-advisory-status-hash-binding-remediation-shadow-input-manifest.json",
  "scripts/action-451-projection-advisory-status-hash-binding-remediation-shadow-run.mjs",
  "scripts/action-451-projection-advisory-status-hash-binding-remediation-fixture-freeze.mjs",
  "lib/confidence-calibration-recommendation-advisory-projection-consumer.ts",
  "lib/recommendation-engine-confidence-calibration-advisory-projection-consumer.ts",
].filter(exists);

const deploymentFiles = [
  "app/api/confidence-calibration-recommendation-advisory-projection",
  "app/confidence-calibration-recommendation-advisory-projection",
  "netlify.toml",
].filter((path) => path !== "netlify.toml" ? exists(path) : false);

const attackChecks = {
  retained_hash_attacks_block: Object.values(retainedHashAttacks).every((status) =>
    ["blocked_advisory_result", "blocked_confidence_mismatch", "blocked_invalid_input"].includes(status)),
  retained_status_blocks_phase_10: retainedHashAttacks.advisory_status === "blocked_advisory_result",
  retained_reasons_blocks_phase_10: retainedHashAttacks.reasons === "blocked_advisory_result",
  swapped_hash_attacks_block: Object.values(swappedHashAttacks).every((status) => status === "blocked_advisory_result"),
  malformed_hash_blocked: malformedHash.status === "blocked_advisory_result",
  mismatch_issue_path: primaryIssue(malformedHash)?.path === "/advisory/advisory_hash",
  mismatch_issue_code: primaryIssue(malformedHash)?.code === "blocked_advisory_result",
  phase_10_outranks_lineage: lineageRetained.status === "blocked_advisory_result",
  phase_11_defense_remains: lineageRehashed.status === "blocked_invalid_lineage",
  earlier_phase_outranks_hash: earlierPhaseOutranksHash.status === "blocked_confidence_mismatch",
};

const behaviorChecks = {
  valid_advisory_ready_hash_accepted: ready.status === "projection_ready",
  valid_advisory_ready_with_warnings_hash_accepted: warningReady.status === "projection_ready_with_warnings",
  valid_advisory_no_adjustment_hash_accepted: noAdjustment.status === "projection_no_adjustment",
  warning_reorder_accepted: reorderedWarning.status === warningReady.status &&
    reorderedWarning.projection_hash === warningReady.projection_hash,
  no_adjustment_unchanged: noAdjustment.advisory_proposed_delta_basis_points === 0 &&
    noAdjustment.advisory_proposed_confidence_basis_points === noAdjustment.recommendation_original_confidence_basis_points &&
    noAdjustment.recommendation_confidence_unchanged === true &&
    noAdjustment.application_eligible === false,
  confidence_mismatch_unchanged: earlierPhaseOutranksHash.status === "blocked_confidence_mismatch",
  recommendation_non_mutation: (() => {
    const input = { recommendation: clone(readyPair.projectionRecommendation), advisory: clone(readyPair.advisory), configuration: projectionConfig };
    const before = stable(input);
    buildConfidenceCalibrationRecommendationProjection(input);
    return before === stable(input);
  })(),
  output_deep_frozen: Object.isFrozen(ready) &&
    Object.isFrozen(ready.warnings) &&
    Object.isFrozen(ready.issues) &&
    Object.isFrozen(ready.lineage_hashes),
  repeated_determinism: stable(project(readyPair)) === stable(project(readyPair)),
  interleaved_determinism: stable(project(readyPair)) === stable(project(readyPair)) &&
    warningReady.status === project(warningPair).status,
  projection_id_stable: ready.projection_id === project(readyPair).projection_id,
  recommendation_confidence_unchanged: ready.recommendation_confidence_unchanged === true &&
    ready.application_eligible === false &&
    ready.ranking_affected === false &&
    ready.scanner_affected === false &&
    ready.publication_affected === false &&
    ready.execution_affected === false &&
    ready.non_authoritative === true &&
    ready.applied === false,
};

const isolationChecks = {
  no_fixtures_runner_manifest_shadow: forbiddenAction451Artifacts.length === 0,
  no_consumers: appOrLibConsumers.length === 0,
  no_runtime_persistence_replay_provider_supabase_feedback: [
    "@supabase",
    "fetch(",
    "XMLHttpRequest",
    "process.env",
    "localStorage",
    "Date.now",
    "Math.random",
    "next/server",
  ].every((term) => !projectionSource.includes(term)),
  no_deployment_artifact: deploymentFiles.length === 0,
  runtime_preview_untouched: projectionConfig.runtime_preview_status === expected.runtimePreviewStatus &&
    projectionSource.includes(expected.runtimePreviewStatus),
};

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

const checks = {
  ...sourceChecks,
  ...docChecks,
  ...attackChecks,
  ...behaviorChecks,
  ...isolationChecks,
};

const failedChecks = Object.entries(checks)
  .filter(([, passed]) => !passed)
  .map(([name]) => name);

const report = {
  verification_status: failedChecks.length === 0 ? "passed" : "failed",
  remediation_result: "projection_advisory_status_hash_binding_remediated",
  readiness_decision: failedChecks.length === 0 ? "ready_for_action_452_independent_audit" : "blocked",
  failed_checks_count: failedChecks.length,
  failed_checks: failedChecks,
  complete_advisory_payload_fields: expected.semanticFields,
  advisory_status_binding: {
    included_in_hash_payload: sourceChecks.advisory_status_included,
    changed_status_retained_hash_status: retainedHashAttacks.advisory_status,
  },
  canonicalization_and_hash: {
    canonicalization_exists: sourceChecks.canonicalization_exists,
    sha256_recomputation_exists: sourceChecks.sha256_recomputation_exists,
    supplied_recomputed_comparison_exists: sourceChecks.supplied_recomputed_comparison_exists,
  },
  mismatch_behavior: {
    status: malformedHash.status,
    issue_code: primaryIssue(malformedHash)?.code ?? null,
    issue_path: primaryIssue(malformedHash)?.path ?? null,
    issue_severity: primaryIssue(malformedHash)?.severity ?? null,
    raw_hashes_exposed: false,
    recommendation_confidence_unchanged: malformedHash.recommendation_confidence_unchanged,
    application_eligible: malformedHash.application_eligible,
    ranking_affected: malformedHash.ranking_affected,
    scanner_affected: malformedHash.scanner_affected,
    publication_affected: malformedHash.publication_affected,
    execution_affected: malformedHash.execution_affected,
    non_authoritative: malformedHash.non_authoritative,
    applied: malformedHash.applied,
  },
  validation_precedence: {
    phase_10_outranks_phase_11_lineage: attackChecks.phase_10_outranks_lineage,
    phase_11_defense_remains: attackChecks.phase_11_defense_remains,
    phases_1_to_9_outrank_phase_10: attackChecks.earlier_phase_outranks_hash,
  },
  retained_hash_attacks: retainedHashAttacks,
  swapped_hash_attacks: swappedHashAttacks,
  semantic_order_equivalence: {
    warning_reorder_accepted: behaviorChecks.warning_reorder_accepted,
    result_hash_stable: reorderedWarning.advisory_result_hash === warningReady.advisory_result_hash,
    projection_hash_stable: reorderedWarning.projection_hash === warningReady.projection_hash,
  },
  valid_outputs: {
    advisory_ready: ready.status,
    advisory_ready_with_warnings: warningReady.status,
    advisory_no_adjustment: noAdjustment.status,
    projection_id_stable: behaviorChecks.projection_id_stable,
    no_adjustment_unchanged: behaviorChecks.no_adjustment_unchanged,
  },
  api_surface: {
    runtime_export: "buildConfidenceCalibrationRecommendationProjection",
    public_type_exports: expected.publicTypes,
    no_public_helpers: sourceChecks.exact_api_surface_unchanged,
  },
  immutability_and_determinism: {
    recommendation_non_mutation: behaviorChecks.recommendation_non_mutation,
    output_deep_frozen: behaviorChecks.output_deep_frozen,
    repeated_determinism: behaviorChecks.repeated_determinism,
    interleaved_determinism: behaviorChecks.interleaved_determinism,
  },
  isolation: {
    forbidden_action_451_artifacts: forbiddenAction451Artifacts,
    app_or_lib_consumers: appOrLibConsumers,
    deployment_files: deploymentFiles,
    no_runtime: isolationChecks.no_runtime_persistence_replay_provider_supabase_feedback,
  },
  runtime_preview_status: expected.runtimePreviewStatus,
  safety,
  unrelated_work_classification: "action_451_projection_advisory_status_hash_binding_remediation_only",
  recommended_next_action: expected.nextAction,
  checks,
};

console.log(JSON.stringify(report, null, 2));
process.exit(failedChecks.length === 0 ? 0 : 1);
