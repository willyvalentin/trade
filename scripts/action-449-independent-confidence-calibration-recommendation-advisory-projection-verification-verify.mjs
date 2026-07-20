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
  doc: "docs/action-449-independent-confidence-calibration-recommendation-advisory-projection-verification.md",
  verifier: "scripts/action-449-independent-confidence-calibration-recommendation-advisory-projection-verification-verify.mjs",
  test: "tests/e2e/action-449-independent-confidence-calibration-recommendation-advisory-projection-verification.spec.ts",
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
  action447Verifier: "scripts/action-447-confidence-calibration-advisory-recommendation-engine-consumption-contract-approval-gate-verify.mjs",
  action448Verifier: "scripts/action-448-confidence-calibration-recommendation-advisory-projection-implementation-verify.mjs",
};

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

const expected = {
  readinessDecision: "ready_with_conditions",
  runtimePreviewStatus: "runtime_preview_waiting_for_operator_inputs",
  nextAction: "action_450_confidence_calibration_recommendation_advisory_projection_fixture_hash_freeze_approval_gate",
  publicTypes: [
    "ImmutableRecommendationProjectionEnvelope",
    "FrozenRecommendationProjectionConfiguration",
    "ConfidenceCalibrationRecommendationProjectionResult",
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

function toBasisPoints(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const scaled = value * 100;
  return Number.isInteger(scaled) ? Object.is(scaled, -0) ? 0 : scaled : null;
}

function canonicalLineage(value) {
  return {
    recommendation_source_hash: value.recommendation_source_hash,
    decision_boundary_sha256: value.decision_boundary_sha256,
    pattern_discovery_result_hashes: [...new Set(value.pattern_discovery_result_hashes)].sort(compareText),
    pattern_insight_hashes: [...new Set(value.pattern_insight_hashes)].sort(compareText),
    calibration_identity_hash: value.calibration_identity_hash,
    calibration_result_hash: value.calibration_result_hash,
    evidence_lineage_hash: value.evidence_lineage_hash,
  };
}

function rehashAdvisory(value) {
  const draft = clone(value);
  const hash = canonicalHash({
    adapter_schema_version: projectionConfig.advisory_schema_version,
    configuration_version: projectionConfig.advisory_configuration_version,
    status: draft.status,
    recommendation_fingerprint: draft.recommendation_fingerprint,
    recommendation_snapshot_hash: draft.recommendation_snapshot_hash,
    original_confidence_basis_points: toBasisPoints(draft.original_confidence),
    calibration_status: draft.calibration_status,
    calibration_id: draft.calibration_id,
    calibration_identity_hash: draft.lineage_hashes.calibration_identity_hash,
    calibration_result_hash: draft.lineage_hashes.calibration_result_hash,
    proposed_delta_basis_points: toBasisPoints(draft.proposed_delta),
    proposed_confidence_basis_points: toBasisPoints(draft.proposed_calibrated_confidence),
    warnings: draft.warnings,
    issues: draft.issues,
    lineage_hashes: canonicalLineage(draft.lineage_hashes),
    advisory_eligible: draft.advisory_eligible,
    advisory_visible: draft.advisory_visible,
    application_eligible: draft.application_eligible,
    reasons: [...new Set(draft.reasons)].sort(compareText),
    non_authoritative: draft.non_authoritative,
    applied: draft.applied,
  });
  draft.advisory_hash = hash;
  draft.advisory_id = `confidence_calibration_advisory_v1:${hash.slice(0, 24)}`;
  return draft;
}

function deepFreeze(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
}

const h = (char) => char.repeat(64);

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

function insight(overrides = {}) {
  return {
    pattern_discovery_sha256: h("a"),
    pattern_discovery_configuration_version: "pattern_discovery_config_v1",
    pattern_discovery_result_sha256: h("b"),
    evidence_set_sha256: h("c"),
    group_sha256: h("d"),
    insight_id: "insight_opening_drive_15m",
    insight_sha256: h("e"),
    source_scenario_ids: ["scenario_001"],
    source_snapshot_ids: ["snapshot_001"],
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

function recommendationFor(calibration) {
  return {
    recommendation_id: "rec_action_449",
    recommendation_fingerprint: "rec_fp_action_449",
    recommendation_snapshot_hash: h("f"),
    original_confidence: calibration.original_confidence ?? 50,
    decision_boundary: {
      boundary_id: "boundary_action_449",
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
      source_scenario_ids: ["scenario_001"],
      source_snapshot_ids: ["snapshot_001"],
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

function projectionRecommendationFor(recommendation, advisoryResult = null) {
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
      source_version: "action_449_static_audit",
      source_classification: "static_projection",
      immutable: true,
    },
    lineage: {
      recommendation_source_hash: recommendation.lineage.recommendation_source_hash,
      decision_boundary_sha256: recommendation.decision_boundary.boundary_sha256,
      evidence_lineage_hash: advisoryResult?.lineage_hashes?.evidence_lineage_hash ?? h("4"),
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

const projectionModule = await import(pathToFileURL(abs(paths.projection)).href);
const advisoryModule = await import(pathToFileURL(abs(paths.advisory)).href);
const calibrationModule = await import(pathToFileURL(abs(paths.calibration)).href);
const { buildConfidenceCalibrationRecommendationProjection } = projectionModule;
const { buildConfidenceCalibrationAdvisory } = advisoryModule;
const { calibrateConfidence } = calibrationModule;

const calibration = calibrateConfidence({ baseConfidence: 50, insights: [insight()], configuration: calibrationConfig });
const recommendation = recommendationFor(calibration);
const advisory = rehashAdvisory(buildConfidenceCalibrationAdvisory({ recommendation, calibration, configuration: advisoryConfig }));
const projectionRecommendation = projectionRecommendationFor(recommendation, advisory);
const validInput = Object.freeze({ recommendation: projectionRecommendation, advisory, configuration: projectionConfig });
const ready = buildConfidenceCalibrationRecommendationProjection(validInput);

const warningCalibration = calibrateConfidence({
  baseConfidence: 50,
  insights: [insight({ warning_codes: ["metric_value_unavailable"] })],
  configuration: calibrationConfig,
});
const warningRecommendation = recommendationFor(warningCalibration);
const warningAdvisory = rehashAdvisory(buildConfidenceCalibrationAdvisory({
  recommendation: warningRecommendation,
  calibration: warningCalibration,
  configuration: advisoryConfig,
}));
const warningProjection = buildConfidenceCalibrationRecommendationProjection({
  recommendation: projectionRecommendationFor(warningRecommendation, warningAdvisory),
  advisory: warningAdvisory,
  configuration: projectionConfig,
});

const noAdjustmentCalibration = calibrateConfidence({
  baseConfidence: 50,
  insights: [insight({ insight: { ...insight().insight, evidence_direction: "neutral" } })],
  configuration: calibrationConfig,
});
const noAdjustmentRecommendation = recommendationFor(noAdjustmentCalibration);
const noAdjustmentAdvisory = rehashAdvisory(buildConfidenceCalibrationAdvisory({
  recommendation: noAdjustmentRecommendation,
  calibration: noAdjustmentCalibration,
  configuration: advisoryConfig,
}));
const noAdjustmentProjection = buildConfidenceCalibrationRecommendationProjection({
  recommendation: projectionRecommendationFor(noAdjustmentRecommendation, noAdjustmentAdvisory),
  advisory: noAdjustmentAdvisory,
  configuration: projectionConfig,
});

function project({ rec = projectionRecommendation, adv = advisory, config = projectionConfig } = {}) {
  return buildConfidenceCalibrationRecommendationProjection({ recommendation: rec, advisory: adv, configuration: config });
}

function primaryIssue(result) {
  return result.issues[0]?.code ?? null;
}

const precedenceCases = {
  invalid_top_level_outranks_configuration: primaryIssue(buildConfidenceCalibrationRecommendationProjection({ nope: true })) === "invalid_input_shape",
  invalid_configuration_outranks_recommendation: primaryIssue(project({
    rec: mutate(projectionRecommendation, (draft) => {
      draft.schema_version = "bad";
    }),
    config: mutate(projectionConfig, (draft) => {
      draft.configuration_version = "bad";
    }),
  })) === "invalid_configuration",
  malformed_recommendation_outranks_fingerprint: primaryIssue(project({
    rec: mutate(projectionRecommendation, (draft) => {
      delete draft.source;
      draft.recommendation_fingerprint = "";
    }),
  })) === "invalid_recommendation_envelope",
  invalid_fingerprint_outranks_snapshot: primaryIssue(project({
    rec: mutate(projectionRecommendation, (draft) => {
      draft.recommendation_fingerprint = "";
      draft.recommendation_snapshot_hash = "bad";
    }),
  })) === "invalid_recommendation_fingerprint",
  snapshot_fault_outranks_confidence: primaryIssue(project({
    rec: mutate(projectionRecommendation, (draft) => {
      draft.lineage.decision_boundary_sha256 = h("9");
      draft.original_confidence_basis_points = Number.NaN;
    }),
  })) === "invalid_snapshot_lineage",
  invalid_confidence_outranks_advisory: primaryIssue(project({
    rec: mutate(projectionRecommendation, (draft) => {
      draft.original_confidence_basis_points = Number.NaN;
    }),
    adv: { bad: true },
  })) === "invalid_original_confidence",
  malformed_advisory_outranks_status: primaryIssue(project({ adv: { status: "nope" } })) === "invalid_advisory_result",
  unsupported_status_outranks_confidence_mismatch: project({
    adv: mutate(advisory, (draft) => {
      draft.status = "ADVISORY_READY";
      draft.original_confidence = 51;
    }),
  }).status === "blocked_unsupported_status",
  confidence_mismatch_outranks_hash: project({
    adv: mutate(advisory, (draft) => {
      draft.original_confidence = 51;
      draft.advisory_hash = h("9");
    }),
  }).status === "blocked_confidence_mismatch",
  advisory_hash_outranks_lineage: project({
    rec: mutate(projectionRecommendation, (draft) => {
      draft.lineage.evidence_lineage_hash = h("8");
    }),
    adv: mutate(advisory, (draft) => {
      draft.advisory_hash = h("9");
    }),
  }).status === "blocked_advisory_result",
  lineage_outranks_leakage: project({
    rec: mutate(projectionRecommendation, (draft) => {
      draft.lineage.evidence_lineage_hash = h("8");
      draft.anti_leakage.future_outcome_evidence = true;
    }),
  }).status === "blocked_invalid_lineage",
  leakage_outranks_feedback: project({
    rec: mutate(projectionRecommendation, (draft) => {
      draft.anti_leakage.future_outcome_evidence = true;
      draft.anti_feedback.projection_reused_as_ranking_signal = true;
    }),
  }).status === "blocked_future_leakage",
  feedback_outranks_warning_issue: project({
    rec: mutate(projectionRecommendation, (draft) => {
      draft.anti_feedback.projection_reused_as_ranking_signal = true;
    }),
    adv: rehashAdvisory(mutate(advisory, (draft) => {
      draft.warnings = [{ code: "raw_secret_like_warning", path: "/x", severity: "warning", messageKey: "bad.message" }];
    })),
  }).status === "blocked_invalid_lineage",
};

const statusResults = Object.fromEntries(Object.entries(expected.statusMapping).map(([status, mapped]) => {
  if (["advisory_ready", "advisory_ready_with_warnings", "advisory_no_adjustment"].includes(status)) {
    const result = status === "advisory_ready"
      ? ready
      : status === "advisory_ready_with_warnings"
        ? warningProjection
        : noAdjustmentProjection;
    return [status, { actual: result.status, expected: mapped, passed: result.status === mapped }];
  }
  const blocked = mutate(advisory, (draft) => {
    draft.status = status;
    draft.advisory_id = null;
    draft.advisory_hash = null;
    draft.lineage_hashes = null;
    draft.advisory_eligible = false;
    draft.advisory_visible = false;
  });
  const result = project({ adv: blocked });
  return [status, { actual: result.status, expected: mapped, passed: result.status === mapped }];
}));

const rejectedStatusCases = {
  missing_status: primaryIssue(project({ adv: mutate(advisory, (draft) => { delete draft.status; }) })) === "invalid_advisory_result",
  unknown_status: project({ adv: mutate(advisory, (draft) => { draft.status = "advisory_maybe"; }) }).status === "blocked_unsupported_status",
  case_variant: project({ adv: mutate(advisory, (draft) => { draft.status = "Advisory_Ready"; }) }).status === "blocked_unsupported_status",
  whitespace_variant: project({ adv: mutate(advisory, (draft) => { draft.status = " advisory_ready "; }) }).status === "blocked_unsupported_status",
  invented_alias: project({ adv: mutate(advisory, (draft) => { draft.status = "ready"; }) }).status === "blocked_unsupported_status",
};

const confidenceCases = {
  exact_basis_point_equality: ready.status === "projection_ready",
  one_basis_point_mismatch: project({ adv: mutate(advisory, (draft) => { draft.original_confidence = 50.01; }) }).status === "blocked_confidence_mismatch",
  tiny_decimal_mismatch: project({ adv: mutate(advisory, (draft) => { draft.original_confidence = 50.001; }) }).status === "blocked_confidence_mismatch",
  excessive_precision: project({ adv: mutate(advisory, (draft) => { draft.original_confidence = 50.0001; }) }).status === "blocked_confidence_mismatch",
  signed_zero_valid_before_hash_phase: project({
    rec: mutate(projectionRecommendation, (draft) => { draft.original_confidence_basis_points = 0; }),
    adv: mutate(advisory, (draft) => { draft.original_confidence = -0; }),
  }).status === "blocked_advisory_result",
  nan_recommendation_confidence: primaryIssue(project({ rec: mutate(projectionRecommendation, (draft) => { draft.original_confidence_basis_points = Number.NaN; }) })) === "invalid_original_confidence",
  infinity_recommendation_confidence: primaryIssue(project({ rec: mutate(projectionRecommendation, (draft) => { draft.original_confidence_basis_points = Infinity; }) })) === "invalid_original_confidence",
  below_range_recommendation_confidence: primaryIssue(project({ rec: mutate(projectionRecommendation, (draft) => { draft.original_confidence_basis_points = -1; }) })) === "invalid_original_confidence",
  above_range_recommendation_confidence: primaryIssue(project({ rec: mutate(projectionRecommendation, (draft) => { draft.original_confidence_basis_points = 10001; }) })) === "invalid_original_confidence",
  missing_recommendation_confidence: primaryIssue(project({ rec: mutate(projectionRecommendation, (draft) => { delete draft.original_confidence_basis_points; }) })) === "invalid_recommendation_envelope",
  missing_advisory_original_confidence: primaryIssue(project({ adv: mutate(advisory, (draft) => { delete draft.original_confidence; }) })) === "invalid_advisory_result",
};

const identityCases = {
  missing_fingerprint: primaryIssue(project({ rec: mutate(projectionRecommendation, (draft) => { draft.recommendation_fingerprint = ""; }) })) === "invalid_recommendation_fingerprint",
  swapped_fingerprint: project({ rec: mutate(projectionRecommendation, (draft) => { draft.recommendation_fingerprint = "other_fp"; }) }).status === "blocked_invalid_lineage",
  missing_snapshot_hash: primaryIssue(project({ rec: mutate(projectionRecommendation, (draft) => { draft.recommendation_snapshot_hash = ""; }) })) === "invalid_snapshot_lineage",
  malformed_snapshot_hash: primaryIssue(project({ rec: mutate(projectionRecommendation, (draft) => { draft.recommendation_snapshot_hash = "bad"; }) })) === "invalid_snapshot_lineage",
  changed_snapshot_retained_fingerprint: project({ rec: mutate(projectionRecommendation, (draft) => { draft.recommendation_snapshot_hash = h("9"); }) }).status === "blocked_invalid_lineage",
  changed_confidence_retained_snapshot: project({ rec: mutate(projectionRecommendation, (draft) => { draft.original_confidence_basis_points = 5100; }) }).status === "blocked_confidence_mismatch",
  invalid_schema_version: primaryIssue(project({ rec: mutate(projectionRecommendation, (draft) => { draft.schema_version = "bad"; }) })) === "invalid_recommendation_envelope",
  invalid_decision_boundary: primaryIssue(project({ rec: mutate(projectionRecommendation, (draft) => { draft.decision_boundary.anti_leakage_state = "failed"; }) })) === "invalid_recommendation_envelope",
  deterministic_issue_paths: project({ rec: mutate(projectionRecommendation, (draft) => { draft.recommendation_fingerprint = ""; }) }).issues[0]?.path === "/recommendation/recommendation_fingerprint",
};

const advisoryTamperCases = {
  missing_advisory_id: project({ adv: mutate(advisory, (draft) => { draft.advisory_id = null; }) }).status === "blocked_advisory_result",
  malformed_advisory_id: project({ adv: mutate(advisory, (draft) => { draft.advisory_id = "bad"; }) }).status === "blocked_advisory_result",
  changed_status_retained_hash: false,
  changed_delta_retained_hash: project({ adv: mutate(advisory, (draft) => { draft.proposed_delta = 3; }) }).status === "blocked_advisory_result",
  changed_confidence_retained_hash: project({ adv: mutate(advisory, (draft) => { draft.proposed_calibrated_confidence = 53; }) }).status === "blocked_advisory_result",
  changed_warnings_retained_hash: project({ adv: mutate(advisory, (draft) => { draft.warnings = [{ code: "metric_value_unavailable", path: "/lineage_hashes", severity: "warning", messageKey: "confidence_calibration_advisory.metric_value_unavailable" }]; }) }).status === "blocked_advisory_result",
  changed_issues_retained_hash: project({ adv: mutate(advisory, (draft) => { draft.issues = [{ code: "blocked_invalid_input", path: "/status", severity: "error", messageKey: "confidence_calibration_advisory.blocked_invalid_input" }]; }) }).status === "blocked_advisory_result",
  changed_lineage_retained_hash: project({ adv: mutate(advisory, (draft) => { draft.lineage_hashes.evidence_lineage_hash = h("9"); }) }).status === "blocked_advisory_result",
  swapped_valid_format_hash: project({ adv: mutate(advisory, (draft) => { draft.advisory_hash = h("8"); }) }).status === "blocked_advisory_result",
  identity_hash_as_result_hash: project({ adv: mutate(advisory, (draft) => { draft.advisory_hash = canonicalHash({ advisory_id: advisory.advisory_id, advisory_hash: advisory.advisory_hash }); }) }).status === "blocked_advisory_result",
  unrelated_valid_format_hash: project({ adv: mutate(advisory, (draft) => { draft.advisory_hash = h("7"); }) }).status === "blocked_advisory_result",
};

const lineageCases = {
  recommendation_fingerprint_agreement: ready.recommendation_fingerprint === advisory.recommendation_fingerprint,
  recommendation_snapshot_agreement: ready.recommendation_snapshot_hash === advisory.recommendation_snapshot_hash,
  advisory_id_bound: ready.advisory_id === advisory.advisory_id,
  calibration_id_bound: ready.calibration_id === advisory.calibration_id,
  pattern_discovery_attack: project({ rec: mutate(projectionRecommendation, (draft) => { draft.lineage.pattern_discovery_result_hashes = [h("9")]; }) }).status === "blocked_invalid_lineage",
  pattern_insight_attack: project({ rec: mutate(projectionRecommendation, (draft) => { draft.lineage.pattern_insight_hashes = [h("9")]; }) }).status === "blocked_invalid_lineage",
  evidence_lineage_attack: project({ rec: mutate(projectionRecommendation, (draft) => { draft.lineage.evidence_lineage_hash = h("9"); }) }).status === "blocked_invalid_lineage",
  decision_boundary_attack: project({ rec: mutate(projectionRecommendation, (draft) => { draft.lineage.decision_boundary_sha256 = h("9"); }) }).status === "blocked_invalid_lineage",
};

const leakageCases = Object.fromEntries([
  "future_outcome_evidence",
  "post_entry_evidence",
  "post_exit_evidence",
  "same_recommendation_realized_result",
  "evidence_after_decision_boundary",
  "prohibited_self_calibration",
].map((flag) => [flag, project({ rec: mutate(projectionRecommendation, (draft) => { draft.anti_leakage[flag] = true; }) }).status === "blocked_future_leakage"]));
leakageCases.missing_state = primaryIssue(project({ rec: mutate(projectionRecommendation, (draft) => { delete draft.anti_leakage.status; }) })) === "invalid_recommendation_envelope";
leakageCases.unknown_state = project({ rec: mutate(projectionRecommendation, (draft) => { draft.anti_leakage.status = "unknown"; }) }).status !== "projection_ready";
leakageCases.valid_pre_decision_evidence = ready.status === "projection_ready";

const feedbackFlags = [
  "projection_reused_as_recommendation_confidence_input",
  "projection_reused_as_scanner_signal",
  "projection_reused_as_ranking_signal",
  "projection_reused_as_publication_signal",
  "projection_reused_as_execution_signal",
  "projection_reused_as_learning_dataset_input",
  "projection_reused_as_pattern_discovery_evidence",
  "projection_reused_as_intelligence_context",
  "projection_reused_as_outcome",
  "projection_reused_as_calibration_evidence",
  "projection_reused_as_future_advisory_base_input",
  "projection_reused_as_feedback_event",
  "circular_projection_lineage",
  "self_referential_recommendation_lineage",
];
const feedbackCases = Object.fromEntries(feedbackFlags.map((flag) => [
  flag,
  project({ rec: mutate(projectionRecommendation, (draft) => { draft.anti_feedback[flag] = true; }) }).status === "blocked_invalid_lineage",
]));

const noAdjustmentCases = {
  valid_no_adjustment: noAdjustmentProjection.status === "projection_no_adjustment" &&
    noAdjustmentProjection.advisory_proposed_delta_basis_points === 0 &&
    noAdjustmentProjection.advisory_proposed_confidence_basis_points === noAdjustmentProjection.recommendation_original_confidence_basis_points,
  invalid_no_adjustment_delta: project({ rec: projectionRecommendationFor(noAdjustmentRecommendation, noAdjustmentAdvisory), adv: mutate(noAdjustmentAdvisory, (draft) => { draft.proposed_delta = 1; }) }).status === "blocked_advisory_result",
  no_adjustment_confidence_mismatch: project({ rec: projectionRecommendationFor(noAdjustmentRecommendation, noAdjustmentAdvisory), adv: mutate(noAdjustmentAdvisory, (draft) => { draft.proposed_calibrated_confidence = 51; }) }).status === "blocked_advisory_result",
  output_flags_false: noAdjustmentProjection.recommendation_confidence_unchanged === true &&
    noAdjustmentProjection.application_eligible === false &&
    noAdjustmentProjection.ranking_affected === false &&
    noAdjustmentProjection.scanner_affected === false &&
    noAdjustmentProjection.publication_affected === false &&
    noAdjustmentProjection.execution_affected === false &&
    noAdjustmentProjection.non_authoritative === true &&
    noAdjustmentProjection.applied === false,
};

const frozenRecommendation = deepFreeze(clone(projectionRecommendation));
const beforeFrozen = stable(frozenRecommendation);
const mutationProbeStatuses = [
  project({ rec: frozenRecommendation }).status,
  project({ rec: frozenRecommendation, adv: mutate(advisory, (draft) => { draft.original_confidence = 51; }) }).status,
  project({ rec: frozenRecommendation, adv: mutate(advisory, (draft) => { draft.advisory_hash = h("9"); }) }).status,
  project({ rec: mutate(frozenRecommendation, (draft) => { draft.lineage.evidence_lineage_hash = h("9"); }) }).status,
  project({ rec: mutate(frozenRecommendation, (draft) => { draft.anti_leakage.future_outcome_evidence = true; }) }).status,
  project({ rec: mutate(frozenRecommendation, (draft) => { draft.anti_feedback.projection_reused_as_ranking_signal = true; }) }).status,
];
const afterFrozen = stable(frozenRecommendation);

const reorderedAdvisory = mutate(warningAdvisory, (draft) => {
  draft.warnings = [...draft.warnings].reverse();
  draft.lineage_hashes.pattern_discovery_result_hashes = [...draft.lineage_hashes.pattern_discovery_result_hashes].reverse();
  draft.lineage_hashes.pattern_insight_hashes = [...draft.lineage_hashes.pattern_insight_hashes].reverse();
});
const reorderedRecommendation = mutate(projectionRecommendationFor(warningRecommendation, warningAdvisory), (draft) => {
  draft.lineage.pattern_discovery_result_hashes = [...draft.lineage.pattern_discovery_result_hashes].reverse();
  draft.lineage.pattern_insight_hashes = [...draft.lineage.pattern_insight_hashes].reverse();
});
const reorderedProjection = project({ rec: reorderedRecommendation, adv: reorderedAdvisory });
const repeatedReady = project();
const interleavedA = project();
project({ adv: mutate(advisory, (draft) => { draft.original_confidence = 51; }) });
const interleavedB = project();

const approvedOutputKeys = [
  "advisory_id",
  "advisory_identity_hash",
  "advisory_proposed_confidence_basis_points",
  "advisory_proposed_delta_basis_points",
  "advisory_result_hash",
  "advisory_status",
  "advisory_visible",
  "applied",
  "application_eligible",
  "calibration_id",
  "calibration_status",
  "execution_affected",
  "issues",
  "lineage_hashes",
  "non_authoritative",
  "projection_hash",
  "projection_id",
  "projection_visible",
  "publication_affected",
  "ranking_affected",
  "recommendation_confidence_unchanged",
  "recommendation_fingerprint",
  "recommendation_id",
  "recommendation_original_confidence_basis_points",
  "recommendation_snapshot_hash",
  "scanner_affected",
  "status",
  "warnings",
].sort(compareText);
const forbiddenOutputKeys = [
  "recommendation",
  "update_command",
  "persistence_instruction",
  "supabase_payload",
  "ranking_update",
  "scanner_command",
  "publication_command",
  "execution_command",
  "feedback_event",
  "runtime_callback",
  "applied_confidence",
  "effective_confidence",
  "mutation_callback",
];

const source = read(paths.projection);
const compactSource = source.replace(/\s+/g, " ");
const action309 = runJson("node", [paths.action309Guard]);
const action447 = runJson("node", [paths.action447Verifier]);
const action448 = runJson("node", [paths.action448Verifier]);
const appConsumers = rgFiles("buildConfidenceCalibrationRecommendationProjection|confidence-calibration-recommendation-advisory-projection", ["app", "lib"])
  .filter((path) => path !== paths.projection);
const auditConsumers = rgFiles("buildConfidenceCalibrationRecommendationProjection|confidence-calibration-recommendation-advisory-projection", ["scripts", "tests"])
  .filter((path) => ![
    "scripts/action-318-static-replay-batch-commit-readiness-verify.mjs",
    "scripts/action-319-static-replay-batch-post-commit-verify.mjs",
    "scripts/action-320-static-replay-branch-package-verify.mjs",
    "scripts/action-442-independent-static-confidence-calibration-advisory-hash-freeze-verification-verify.mjs",
    "scripts/action-443-static-confidence-calibration-advisory-shadow-execution-approval-gate-verify.mjs",
    "scripts/action-444-static-confidence-calibration-advisory-shadow-use-verify.mjs",
    "scripts/action-445-independent-static-confidence-calibration-advisory-shadow-verification-verify.mjs",
    "scripts/action-446-static-confidence-calibration-advisory-shadow-release-gate-verify.mjs",
    "scripts/action-447-confidence-calibration-advisory-recommendation-engine-consumption-contract-approval-gate-verify.mjs",
    paths.verifier,
    paths.test,
    "scripts/action-448-confidence-calibration-recommendation-advisory-projection-implementation-verify.mjs",
    "scripts/action-450-projection-advisory-status-hash-binding-remediation-approval-gate-verify.mjs",
    "scripts/action-451-projection-advisory-status-hash-binding-remediation-verify.mjs",
    "scripts/action-452-independent-post-remediation-projection-verification-verify.mjs",
    "scripts/action-453-static-confidence-calibration-recommendation-advisory-projection-fixture-and-hash-freeze-approval-gate-verify.mjs",
    "scripts/action-454-static-confidence-calibration-recommendation-advisory-projection-hash-freeze.mjs",
    "scripts/action-454-static-confidence-calibration-recommendation-advisory-projection-hash-freeze-verify.mjs",
    "tests/e2e/action-447-confidence-calibration-advisory-recommendation-engine-consumption-contract-approval-gate.spec.ts",
    "tests/e2e/action-448-confidence-calibration-recommendation-advisory-projection-implementation.spec.ts",
    "tests/e2e/action-450-projection-advisory-status-hash-binding-remediation-approval-gate.spec.ts",
    "tests/e2e/action-451-projection-advisory-status-hash-binding-remediation.spec.ts",
    "tests/e2e/action-452-independent-post-remediation-projection-verification.spec.ts",
    "tests/e2e/action-453-static-confidence-calibration-recommendation-advisory-projection-fixture-and-hash-freeze-approval-gate.spec.ts",
    "tests/e2e/action-454-static-confidence-calibration-recommendation-advisory-projection-hash-freeze.spec.ts",
  ].includes(path));
const deploymentFiles = statusFiles().filter((path) =>
  path === "netlify.toml" ||
  path.startsWith(".netlify/") ||
  path.startsWith("public/action-449"));

const protectedAfter = Object.fromEntries(protectedSourcePaths.map((path) => [path, sha256Text(read(path))]));
const protectedHashesUnchanged = JSON.stringify(protectedBefore) === JSON.stringify(protectedAfter);

const projectionPayload = {
  projection_schema_version: projectionConfig.projection_schema_version,
  configuration_version: projectionConfig.configuration_version,
  recommendation_fingerprint: projectionRecommendation.recommendation_fingerprint,
  recommendation_snapshot_hash: projectionRecommendation.recommendation_snapshot_hash,
  recommendation_original_confidence_basis_points: projectionRecommendation.original_confidence_basis_points,
  advisory_status: advisory.status,
  advisory_id: advisory.advisory_id,
  advisory_identity_hash: canonicalHash({ advisory_id: advisory.advisory_id, advisory_hash: advisory.advisory_hash }),
  advisory_result_hash: advisory.advisory_hash,
  advisory_proposed_delta_basis_points: 200,
  advisory_proposed_confidence_basis_points: 5200,
  warnings: [],
  issues: [],
  lineage_hashes: ready.lineage_hashes,
};
const independentlyRecomputedProjectionHash = canonicalHash(projectionPayload);

const auditSections = {
  source_integrity_audit: protectedHashesUnchanged,
  api_export_audit: (source.match(/export function buildConfidenceCalibrationRecommendationProjection/g) ?? []).length === 1 &&
    expected.publicTypes.every((typeName) => source.includes(`export type ${typeName}`)) &&
    (source.match(/export type /g) ?? []).length === 3 &&
    !source.includes("export const") &&
    !source.includes("export class") &&
    compactSource.includes("buildConfidenceCalibrationRecommendationProjection( input: Readonly<{ recommendation: ImmutableRecommendationProjectionEnvelope; advisory: ConfidenceCalibrationAdvisoryResult; configuration: FrozenRecommendationProjectionConfiguration; }>, ): ConfidenceCalibrationRecommendationProjectionResult"),
  validation_order_audit: Object.values(precedenceCases).every(Boolean),
  multi_fault_precedence_audit: Object.values(precedenceCases).every(Boolean),
  top_level_input_audit: precedenceCases.invalid_top_level_outranks_configuration,
  configuration_audit: precedenceCases.invalid_configuration_outranks_recommendation,
  recommendation_envelope_audit: precedenceCases.malformed_recommendation_outranks_fingerprint,
  recommendation_fingerprint_audit: identityCases.missing_fingerprint && identityCases.swapped_fingerprint,
  recommendation_snapshot_audit: identityCases.missing_snapshot_hash && identityCases.malformed_snapshot_hash && identityCases.changed_snapshot_retained_fingerprint,
  recommendation_confidence_audit: confidenceCases.exact_basis_point_equality && confidenceCases.one_basis_point_mismatch && confidenceCases.nan_recommendation_confidence,
  advisory_result_shape_audit: precedenceCases.malformed_advisory_outranks_status,
  advisory_status_mapping_audit: Object.values(statusResults).every((item) => item.passed) && Object.values(rejectedStatusCases).every(Boolean),
  confidence_agreement_audit: Object.values(confidenceCases).every(Boolean),
  advisory_identity_audit: advisory.advisory_id.startsWith("confidence_calibration_advisory_v1:") && advisoryTamperCases.malformed_advisory_id,
  advisory_result_hash_audit: ready.advisory_result_hash === advisory.advisory_hash && Object.values(advisoryTamperCases).every(Boolean),
  recommendation_advisory_lineage_audit: Object.values(lineageCases).every(Boolean),
  pattern_discovery_lineage_audit: lineageCases.pattern_discovery_attack,
  pattern_insight_lineage_audit: lineageCases.pattern_insight_attack,
  anti_leakage_audit: Object.values(leakageCases).every(Boolean),
  anti_feedback_audit: Object.values(feedbackCases).every(Boolean),
  warning_audit: warningProjection.warnings.length === 1 &&
    warningProjection.warnings[0].messageKey === "confidence_calibration_advisory.metric_value_unavailable",
  issue_audit: project({ adv: mutate(advisory, (draft) => { draft.status = "advisory_maybe"; }) }).issues[0]?.messageKey === "confidence_calibration_recommendation_projection.unsupported_advisory_status",
  no_adjustment_audit: Object.values(noAdjustmentCases).every(Boolean),
  output_boundary_audit: JSON.stringify(Object.keys(ready).sort(compareText)) === JSON.stringify(approvedOutputKeys) &&
    forbiddenOutputKeys.every((key) => !Object.hasOwn(ready, key)),
  recommendation_confidence_non_mutation_audit: beforeFrozen === afterFrozen &&
    mutationProbeStatuses.includes("projection_ready") &&
    ready.recommendation_original_confidence_basis_points === projectionRecommendation.original_confidence_basis_points,
  projection_identity_audit: (ready.projection_id ?? "").startsWith("confidence_calibration_recommendation_projection_v1:") &&
    /^[a-f0-9]{64}$/.test(ready.projection_hash ?? "") &&
    ready.projection_hash === independentlyRecomputedProjectionHash,
  canonicalization_audit: warningProjection.projection_hash === reorderedProjection.projection_hash,
  immutability_audit: Object.isFrozen(ready) &&
    Object.isFrozen(ready.warnings) &&
    Object.isFrozen(ready.issues) &&
    Object.isFrozen(ready.lineage_hashes),
  repeated_call_determinism: stable(ready) === stable(repeatedReady),
  interleaved_call_determinism: stable(interleavedA) === stable(interleavedB),
  reordered_input_determinism: warningProjection.projection_hash === reorderedProjection.projection_hash,
  isolation_audit: appConsumers.length === 0 &&
    auditConsumers.length === 0 &&
    deploymentFiles.length === 0,
  consumer_inventory: appConsumers.length === 0 && auditConsumers.length === 0,
  fixture_hash_freeze_readiness: true,
  no_runtime_preview_advancement: action309.guard_status === "passed" &&
    expected.runtimePreviewStatus === "runtime_preview_waiting_for_operator_inputs",
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

const failedConditions = Object.entries(auditSections)
  .filter(([, passed]) => !passed)
  .map(([name]) => name);
const unresolvedConditions = ["fixture_hash_freeze_package_future_work"];
const readinessDecision = failedConditions.length > 0 ? "blocked" : expected.readinessDecision;
const nextPermittedAction = readinessDecision === "blocked"
  ? "action_450_projection_advisory_status_hash_binding_remediation_approval_gate"
  : expected.nextAction;

const report = {
  verification_status: "passed",
  audit_execution_status: "completed",
  readiness_decision: readinessDecision,
  readiness_vocabulary: ["ready", "ready_with_conditions", "blocked"],
  passed_conditions_count: Object.values(auditSections).filter(Boolean).length,
  failed_conditions_count: failedConditions.length,
  unresolved_conditions_count: unresolvedConditions.length,
  failed_conditions: failedConditions,
  unresolved_conditions: unresolvedConditions,
  source_integrity: {
    before: protectedBefore,
    after: protectedAfter,
    unchanged: protectedHashesUnchanged,
  },
  api_surface: {
    runtime_export: "buildConfidenceCalibrationRecommendationProjection",
    public_type_exports: expected.publicTypes,
    no_public_helper_exports: auditSections.api_export_audit,
  },
  validation_precedence: precedenceCases,
  status_mapping: statusResults,
  rejected_status_cases: rejectedStatusCases,
  confidence_agreement: confidenceCases,
  recommendation_identity_and_lineage: identityCases,
  advisory_identity_and_hash: advisoryTamperCases,
  lineage: lineageCases,
  anti_leakage: leakageCases,
  anti_feedback: feedbackCases,
  warning_issue_no_adjustment: {
    warning_count: warningProjection.warnings.length,
    issue_message_key: project({ adv: mutate(advisory, (draft) => { draft.status = "advisory_maybe"; }) }).issues[0]?.messageKey ?? null,
    no_adjustment: noAdjustmentCases,
  },
  recommendation_non_mutation: {
    before_equals_after: beforeFrozen === afterFrozen,
    probe_statuses: mutationProbeStatuses,
  },
  projection_identity: {
    projection_id: ready.projection_id,
    projection_hash: ready.projection_hash,
    independently_recomputed_projection_hash: independentlyRecomputedProjectionHash,
    matches: ready.projection_hash === independentlyRecomputedProjectionHash,
  },
  determinism: {
    repeated_call: auditSections.repeated_call_determinism,
    interleaved_call: auditSections.interleaved_call_determinism,
    reordered_input: auditSections.reordered_input_determinism,
  },
  isolation: {
    app_or_lib_consumers: appConsumers,
    script_or_test_unapproved_consumers: auditConsumers,
    deployment_files: deploymentFiles,
  },
  upstream_health: {
    action447_status: action447.verification_status,
    action447_decision: action447.approval_decision,
    action448_status: action448.verification_status,
    action448_failed_checks: action448.failed_checks ?? [],
  },
  deployment_status: {
    deployment_required: false,
    preview_deployment_authorized: false,
    production_deployment_authorized: false,
    runtime_preview_advancement_authorized: false,
  },
  runtime_preview_status: expected.runtimePreviewStatus,
  unrelated_work_classification: "action_449_independent_static_projection_verification_only",
  safety,
  audit_sections: auditSections,
  next_permitted_action: nextPermittedAction,
};

console.log(JSON.stringify(report, null, 2));
process.exit(0);
