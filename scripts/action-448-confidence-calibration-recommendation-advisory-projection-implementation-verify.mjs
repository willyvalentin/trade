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

const paths = {
  module: "lib/confidence-calibration-recommendation-advisory-projection.ts",
  doc: "docs/action-448-confidence-calibration-recommendation-advisory-projection-implementation.md",
  verifier: "scripts/action-448-confidence-calibration-recommendation-advisory-projection-implementation-verify.mjs",
  test: "tests/e2e/action-448-confidence-calibration-recommendation-advisory-projection-implementation.spec.ts",
  action447Verifier: "scripts/action-447-confidence-calibration-advisory-recommendation-engine-consumption-contract-approval-gate-verify.mjs",
  action446Verifier: "scripts/action-446-static-confidence-calibration-advisory-shadow-release-gate-verify.mjs",
  advisoryAdapter: "lib/confidence-calibration-advisory-adapter.ts",
  calibration: "lib/pure-confidence-calibration.ts",
};

const expected = {
  runtimePreviewStatus: "runtime_preview_waiting_for_operator_inputs",
  nextAction: "action_449_independent_projection_adapter_verification",
  runtimeExport: "buildConfidenceCalibrationRecommendationProjection",
  publicTypes: [
    "ImmutableRecommendationProjectionEnvelope",
    "FrozenRecommendationProjectionConfiguration",
    "ConfidenceCalibrationRecommendationProjectionResult",
  ],
  projectionStatuses: [
    "projection_ready",
    "projection_ready_with_warnings",
    "projection_no_adjustment",
    "projection_insufficient_evidence",
    "blocked_invalid_input",
    "blocked_confidence_mismatch",
    "blocked_invalid_lineage",
    "blocked_future_leakage",
    "blocked_advisory_result",
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
  validationOrder: [
    "Top-level input shape",
    "Projection configuration",
    "Recommendation envelope shape",
    "Recommendation fingerprint",
    "Recommendation snapshot lineage",
    "Recommendation original confidence",
    "Advisory result shape",
    "Advisory status eligibility",
    "Recommendation/advisory confidence agreement",
    "Advisory identity/result hashes",
    "Recommendation/advisory lineage agreement",
    "Anti-leakage",
    "Anti-feedback",
    "Warning/issue compatibility",
    "Projection output construction",
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

function runJson(command, args) {
  const result = spawnSync(command, args, { cwd: root, encoding: "utf8", maxBuffer: 120 * 1024 * 1024 });
  if (result.status !== 0) throw new Error(result.stdout || result.stderr || `${command} failed`);
  const start = result.stdout.indexOf("{");
  const end = result.stdout.lastIndexOf("}");
  if (start < 0 || end < start) throw new Error(`json_output_missing:${command}`);
  return JSON.parse(result.stdout.slice(start, end + 1));
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

function mutate(value, patch) {
  const draft = JSON.parse(JSON.stringify(value));
  patch(draft);
  return draft;
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

function completeRehashAdvisory(value) {
  const draft = mutate(value, () => {});
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
    warnings: orderEntries(draft.warnings),
    issues: orderEntries(draft.issues),
    lineage_hashes: canonicalLineage(draft.lineage_hashes),
    advisory_eligible: draft.advisory_eligible,
    advisory_visible: draft.advisory_visible,
    application_eligible: draft.application_eligible,
    reasons: orderText(draft.reasons),
    non_authoritative: draft.non_authoritative,
    applied: draft.applied,
  });
  draft.advisory_hash = hash;
  draft.advisory_id = `confidence_calibration_advisory_v1:${hash.slice(0, 24)}`;
  return draft;
}

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
    recommendation_id: "rec_static_001",
    recommendation_fingerprint: "rec_fingerprint_static_001",
    recommendation_snapshot_hash: h("f"),
    original_confidence: calibration.original_confidence ?? 50,
    decision_boundary: {
      boundary_id: "decision_boundary_001",
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
      source_version: "recommendation_snapshot_v1",
      source_classification: "static_projection",
      immutable: true,
    },
    lineage: {
      recommendation_source_hash: recommendation.lineage.recommendation_source_hash,
      decision_boundary_sha256: recommendation.decision_boundary.boundary_sha256,
      evidence_lineage_hash: advisory.lineage_hashes?.evidence_lineage_hash ?? h("4"),
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
    anti_leakage: recommendation.anti_leakage,
  };
}

const projectionModule = await import(pathToFileURL(abs(paths.module)).href);
const advisoryModule = await import(pathToFileURL(abs(paths.advisoryAdapter)).href);
const calibrationModule = await import(pathToFileURL(abs(paths.calibration)).href);
const { buildConfidenceCalibrationRecommendationProjection } = projectionModule;
const { buildConfidenceCalibrationAdvisory } = advisoryModule;
const { calibrateConfidence } = calibrationModule;

const source = exists(paths.module) ? read(paths.module) : "";
const doc = exists(paths.doc) ? read(paths.doc) : "";
const action447 = exists(paths.action447Verifier) ? runJson("node", [paths.action447Verifier]) : {};
const action446 = exists(paths.action446Verifier) ? runJson("node", [paths.action446Verifier]) : {};

const calibration = calibrateConfidence({ baseConfidence: 50, insights: [insight()], configuration: calibrationConfig });
const recommendation = recommendationFor(calibration);
const advisory = completeRehashAdvisory(buildConfidenceCalibrationAdvisory({ recommendation, calibration, configuration: advisoryConfig }));
const projectionRecommendation = projectionRecommendationFor(recommendation, advisory);
const readyProjection = buildConfidenceCalibrationRecommendationProjection({
  recommendation: projectionRecommendation,
  advisory,
  configuration: projectionConfig,
});

const warningCalibration = calibrateConfidence({
  baseConfidence: 50,
  insights: [insight({ warning_codes: ["metric_value_unavailable"] })],
  configuration: calibrationConfig,
});
const warningRecommendation = recommendationFor(warningCalibration);
const warningAdvisory = completeRehashAdvisory(buildConfidenceCalibrationAdvisory({
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
const noAdjustmentAdvisory = completeRehashAdvisory(buildConfidenceCalibrationAdvisory({
  recommendation: noAdjustmentRecommendation,
  calibration: noAdjustmentCalibration,
  configuration: advisoryConfig,
}));
const noAdjustmentProjection = buildConfidenceCalibrationRecommendationProjection({
  recommendation: projectionRecommendationFor(noAdjustmentRecommendation, noAdjustmentAdvisory),
  advisory: noAdjustmentAdvisory,
  configuration: projectionConfig,
});

const blockedStatusResults = Object.fromEntries(
  Object.entries(expected.statusMapping)
    .filter(([status]) => !["advisory_ready", "advisory_ready_with_warnings", "advisory_no_adjustment"].includes(status))
    .map(([status]) => {
      const blocked = mutate(advisory, (draft) => {
        draft.status = status;
        draft.advisory_id = null;
        draft.advisory_hash = null;
        draft.lineage_hashes = null;
        draft.advisory_eligible = false;
        draft.advisory_visible = false;
      });
      const result = buildConfidenceCalibrationRecommendationProjection({
        recommendation: projectionRecommendation,
        advisory: blocked,
        configuration: projectionConfig,
      });
      return [status, result.status];
    }),
);

const tamperedHashResult = buildConfidenceCalibrationRecommendationProjection({
  recommendation: projectionRecommendation,
  advisory: mutate(advisory, (draft) => {
    draft.proposed_calibrated_confidence = 53;
  }),
  configuration: projectionConfig,
});
const confidenceMismatchResult = buildConfidenceCalibrationRecommendationProjection({
  recommendation: mutate(projectionRecommendation, (draft) => {
    draft.original_confidence_basis_points = 5100;
  }),
  advisory,
  configuration: projectionConfig,
});
const lineageMismatchResult = buildConfidenceCalibrationRecommendationProjection({
  recommendation: mutate(projectionRecommendation, (draft) => {
    draft.lineage.pattern_discovery_result_hashes = [h("4")];
  }),
  advisory,
  configuration: projectionConfig,
});
const leakageResult = buildConfidenceCalibrationRecommendationProjection({
  recommendation: mutate(projectionRecommendation, (draft) => {
    draft.anti_leakage.future_outcome_evidence = true;
  }),
  advisory,
  configuration: projectionConfig,
});
const feedbackResult = buildConfidenceCalibrationRecommendationProjection({
  recommendation: mutate(projectionRecommendation, (draft) => {
    draft.anti_feedback.projection_reused_as_ranking_signal = true;
  }),
  advisory,
  configuration: projectionConfig,
});
const malformedResult = buildConfidenceCalibrationRecommendationProjection({ nope: true });
const invalidConfigResult = buildConfidenceCalibrationRecommendationProjection({
  recommendation: projectionRecommendation,
  advisory,
  configuration: { ...projectionConfig, configuration_version: "bad" },
});
const repeatedProjection = buildConfidenceCalibrationRecommendationProjection({
  recommendation: projectionRecommendation,
  advisory,
  configuration: projectionConfig,
});
const reorderedWarningProjection = buildConfidenceCalibrationRecommendationProjection({
  recommendation: projectionRecommendationFor(warningRecommendation, warningAdvisory),
  advisory: mutate(warningAdvisory, (draft) => {
    draft.warnings = [...draft.warnings].reverse();
  }),
  configuration: projectionConfig,
});

const consumerFiles = rgFiles(
  "buildConfidenceCalibrationRecommendationProjection|confidence-calibration-recommendation-advisory-projection",
  ["app", "lib"],
).filter((path) => path !== paths.module);
const runtimeRouteFiles = rgFiles("confidence-calibration-recommendation-advisory-projection|recommendation-advisory-projection", ["app"]);
const deploymentFiles = statusFiles().filter((path) =>
  path === "netlify.toml" ||
  path.startsWith(".netlify/") ||
  path.startsWith("public/action-448"));
const forbiddenSourceTerms = [
  "@supabase",
  "fetch(",
  "XMLHttpRequest",
  "process.env",
  "localStorage",
  "Date.now",
  "Math.random",
  "console.",
  "next/server",
  "fs",
  "netlify",
];

const compactSource = source.replace(/\s+/g, " ");
const checks = {
  exact_files_exist: [paths.module, paths.doc, paths.verifier, paths.test].every(exists),
  exact_runtime_export: (source.match(/export function buildConfidenceCalibrationRecommendationProjection/g) ?? []).length === 1,
  exact_public_type_exports: expected.publicTypes.every((typeName) => source.includes(`export type ${typeName}`)) &&
    !source.includes("export const") &&
    !source.includes("export class"),
  exact_signature: compactSource.includes("buildConfidenceCalibrationRecommendationProjection( input: Readonly<{ recommendation: ImmutableRecommendationProjectionEnvelope; advisory: ConfidenceCalibrationAdvisoryResult; configuration: FrozenRecommendationProjectionConfiguration; }>, ): ConfidenceCalibrationRecommendationProjectionResult"),
  synchronous_pure_source_boundary: !forbiddenSourceTerms.some((term) => source.includes(term)),
  validation_order_documented: expected.validationOrder.every((term, index) => doc.includes(`${index + 1}. ${term}`)),
  exact_projection_status_vocabulary: expected.projectionStatuses.every((status) => source.includes(`\"${status}\"`) || source.includes(`'${status}'`) || doc.includes(`\`${status}\``)),
  exact_status_mapping: readyProjection.status === "projection_ready" &&
    warningProjection.status === "projection_ready_with_warnings" &&
    noAdjustmentProjection.status === "projection_no_adjustment" &&
    Object.entries(blockedStatusResults).every(([status, mapped]) => mapped === expected.statusMapping[status]),
  confidence_agreement: readyProjection.recommendation_original_confidence_basis_points === 5000 &&
    readyProjection.advisory_proposed_confidence_basis_points === 5200 &&
    confidenceMismatchResult.status === "blocked_confidence_mismatch",
  advisory_semantic_hash_verification: readyProjection.advisory_result_hash === advisory.advisory_hash &&
    readyProjection.advisory_identity_hash === canonicalHash({ advisory_id: advisory.advisory_id, advisory_hash: advisory.advisory_hash }) &&
    tamperedHashResult.status === "blocked_advisory_result",
  lineage_validation: lineageMismatchResult.status === "blocked_invalid_lineage" &&
    readyProjection.lineage_hashes?.decision_boundary_sha256 === projectionRecommendation.lineage.decision_boundary_sha256,
  anti_leakage: leakageResult.status === "blocked_future_leakage",
  anti_feedback: feedbackResult.status === "blocked_invalid_lineage",
  warning_issue_contract: warningProjection.warnings.length === 1 &&
    warningProjection.warnings[0].messageKey === "confidence_calibration_advisory.metric_value_unavailable" &&
    warningProjection.issues.length === 0,
  no_adjustment: noAdjustmentProjection.advisory_proposed_delta_basis_points === 0 &&
    noAdjustmentProjection.advisory_proposed_confidence_basis_points === noAdjustmentProjection.recommendation_original_confidence_basis_points,
  projection_identity_hash: typeof readyProjection.projection_id === "string" &&
    readyProjection.projection_id.startsWith("confidence_calibration_recommendation_projection_v1:") &&
    /^[a-f0-9]{64}$/.test(readyProjection.projection_hash ?? ""),
  output_boundaries: readyProjection.recommendation_confidence_unchanged === true &&
    readyProjection.ranking_affected === false &&
    readyProjection.scanner_affected === false &&
    readyProjection.publication_affected === false &&
    readyProjection.execution_affected === false &&
    readyProjection.non_authoritative === true &&
    readyProjection.applied === false &&
    readyProjection.application_eligible === false &&
    !Object.hasOwn(readyProjection, "recommendation") &&
    !Object.hasOwn(readyProjection, "applied_confidence") &&
    !Object.hasOwn(readyProjection, "effective_confidence"),
  immutability: Object.isFrozen(readyProjection) &&
    Object.isFrozen(readyProjection.warnings) &&
    Object.isFrozen(readyProjection.issues) &&
    Object.isFrozen(readyProjection.lineage_hashes),
  determinism: JSON.stringify(readyProjection) === JSON.stringify(repeatedProjection) &&
    warningProjection.projection_hash === reorderedWarningProjection.projection_hash,
  malformed_and_invalid_config_block: malformedResult.status === "blocked_invalid_input" &&
    invalidConfigResult.status === "blocked_invalid_input",
  no_consumers_runtime_or_deployment: consumerFiles.length === 0 &&
    runtimeRouteFiles.length === 0 &&
    deploymentFiles.length === 0,
  action447_healthy: action447.verification_status === "passed" &&
    action447.approval_decision === "approved" &&
    action447.safety_confirmation?.projection_adapter_exists === true,
  action446_unchanged: action446.verification_status === "passed" &&
    action446.release_decision === "released" &&
    action446.protected_hashes?.advisory_adapter_sha256 === "3c1b2ed0be3f37d5fe0514eee5a6a3b590811721f0e53b3802080fe764cd8e0b",
};

const failedChecks = Object.entries(checks)
  .filter(([, passed]) => !passed)
  .map(([name]) => name);

const report = {
  verification_status: failedChecks.length === 0 ? "passed" : "failed",
  implementation_result: "pure_confidence_calibration_recommendation_advisory_projection_implemented",
  runtime_export: expected.runtimeExport,
  public_type_exports: expected.publicTypes,
  validation_order: expected.validationOrder,
  status_mapping: expected.statusMapping,
  projection_status_vocabulary: expected.projectionStatuses,
  confidence_agreement_result: {
    exact_basis_point_match_required: true,
    mismatch_status: confidenceMismatchResult.status,
    recommendation_confidence_unchanged: readyProjection.recommendation_confidence_unchanged,
  },
  advisory_identity_hash_result: {
    semantic_hash_verified: checks.advisory_semantic_hash_verification,
    tampered_payload_status: tamperedHashResult.status,
    projection_id: readyProjection.projection_id,
    projection_hash: readyProjection.projection_hash,
  },
  lineage_anti_leakage_feedback_result: {
    lineage_mismatch_status: lineageMismatchResult.status,
    future_leakage_status: leakageResult.status,
    feedback_reuse_status: feedbackResult.status,
  },
  warning_issue_result: {
    warning_count: warningProjection.warnings.length,
    issue_count: warningProjection.issues.length,
    reordered_warning_hash_stable: warningProjection.projection_hash === reorderedWarningProjection.projection_hash,
  },
  no_adjustment_result: {
    status: noAdjustmentProjection.status,
    delta_basis_points: noAdjustmentProjection.advisory_proposed_delta_basis_points,
    proposed_confidence_basis_points: noAdjustmentProjection.advisory_proposed_confidence_basis_points,
  },
  output_and_mutation_boundaries: {
    recommendation_confidence_unchanged: true,
    ranking_affected: false,
    scanner_affected: false,
    publication_affected: false,
    execution_affected: false,
    non_authoritative: true,
    applied: false,
    application_eligible: false,
    persistence_allowed: false,
    runtime_allowed: false,
    feedback_allowed: false,
  },
  action447_compatibility: {
    verification_status: action447.verification_status,
    approval_decision: action447.approval_decision,
    adapter_recognized: action447.safety_confirmation?.projection_adapter_exists === true,
    no_consumer: action447.safety_confirmation?.projection_mentions_in_runtime?.length === 0,
  },
  action446_release_unchanged: {
    verification_status: action446.verification_status,
    release_decision: action446.release_decision,
    advisory_adapter_sha256: action446.protected_hashes?.advisory_adapter_sha256,
  },
  safety: {
    provider_call_executed: false,
    provider_call_attempted: false,
    supabase_read_executed: false,
    supabase_write_executed: false,
    persistence_executed: false,
    replay_executed: false,
    runtime_route_created: false,
    ui_consumer_created: false,
    recommendation_engine_consumer_created: false,
    feedback_executed: false,
    confidence_applied: false,
    recommendation_mutated: false,
    scanner_behavior_changed: false,
    live_ranking_changed: false,
    publication_changed: false,
    execution_changed: false,
    deployment_artifact_changed: false,
  },
  consumer_inventory: {
    projection_consumers: consumerFiles,
    runtime_routes: runtimeRouteFiles,
    deployment_files: deploymentFiles,
  },
  runtime_preview_status: expected.runtimePreviewStatus,
  unrelated_work_classification: "action_448_confidence_calibration_recommendation_advisory_projection_implementation_only",
  recommended_next_action: expected.nextAction,
  checks,
  failed_checks: failedChecks,
};

console.log(JSON.stringify(report, null, 2));
process.exit(report.verification_status === "passed" ? 0 : 1);
