import { execFileSync } from "child_process";
import { createHash } from "crypto";
import { existsSync, readFileSync } from "fs";

import { expect, test } from "@playwright/test";

import {
  buildConfidenceCalibrationAdvisory,
  type ConfidenceCalibrationAdvisoryResult,
  type FrozenAdvisoryConsumptionConfiguration,
  type ImmutableRecommendationConfidenceEnvelope,
} from "../../lib/confidence-calibration-advisory-adapter";
import {
  buildConfidenceCalibrationRecommendationProjection,
  type FrozenRecommendationProjectionConfiguration,
  type ImmutableRecommendationProjectionEnvelope,
} from "../../lib/confidence-calibration-recommendation-advisory-projection";
import {
  calibrateConfidence,
  type ConfidenceCalibrationInsightEnvelope,
  type ConfidenceCalibrationResult,
  type FrozenConfidenceCalibrationConfiguration,
} from "../../lib/pure-confidence-calibration";

const docPath = "docs/action-448-confidence-calibration-recommendation-advisory-projection-implementation.md";
const verifierPath = "scripts/action-448-confidence-calibration-recommendation-advisory-projection-implementation-verify.mjs";
const testPath = "tests/e2e/action-448-confidence-calibration-recommendation-advisory-projection-implementation.spec.ts";

test.setTimeout(300000);

const h = (char: string) => char.repeat(64);

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function canonicalize(value: unknown): unknown {
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new TypeError("non_finite_number");
    return Object.is(value, -0) ? 0 : value;
  }
  if (Array.isArray(value)) return value.map(canonicalize);
  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, child]) => child !== undefined)
        .sort(([left], [right]) => compareText(left, right))
        .map(([key, child]) => [key, canonicalize(child)]),
    );
  }
  throw new TypeError("unsupported_value");
}

function canonicalHash(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(canonicalize(value)), "utf8").digest("hex");
}

function orderText(values: readonly string[]): readonly string[] {
  return [...new Set(values)].sort(compareText);
}

function orderRecords<T extends { code: string; path: string; severity: string; messageKey: string }>(values: readonly T[]): readonly T[] {
  const unique = new Map<string, T>();
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

function toBasisPoints(value: number | null): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const basisPoints = value * projectionConfig.confidence_scale_basis_points_per_point;
  if (Math.abs(basisPoints - Math.round(basisPoints)) > 1e-9) return null;
  return Object.is(Math.round(basisPoints), -0) ? 0 : Math.round(basisPoints);
}

const calibrationConfig: FrozenConfidenceCalibrationConfiguration = {
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

const advisoryConfig: FrozenAdvisoryConsumptionConfiguration = {
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
  runtime_preview_status: "runtime_preview_waiting_for_operator_inputs",
};

const projectionConfig: FrozenRecommendationProjectionConfiguration = {
  projection_schema_version: "confidence_calibration_recommendation_projection_v1",
  configuration_version: "confidence_calibration_recommendation_projection_config_v1",
  projection_id_prefix: "confidence_calibration_recommendation_projection_v1:",
  advisory_schema_version: "confidence_calibration_advisory_result_v1",
  advisory_configuration_version: "confidence_calibration_advisory_config_v1",
  confidence_scale_basis_points_per_point: 100,
  accepted_min_confidence_basis_points: 0,
  accepted_max_confidence_basis_points: 10000,
  status_mapping: {
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
  visibility_policy: "projection_visible_for_eligible_advisories",
  identity_policy: "action_448_projection_identity_v1",
  canonical_hash_version: "action_448_canonical_json_sha256_v1",
  warning_message_key_prefix: "confidence_calibration_advisory.",
  issue_message_key_prefix: "confidence_calibration_advisory.",
  projection_issue_message_key_prefix: "confidence_calibration_recommendation_projection.",
  runtime_preview_status: "runtime_preview_waiting_for_operator_inputs",
};

function insight(overrides: Partial<ConfidenceCalibrationInsightEnvelope> = {}): ConfidenceCalibrationInsightEnvelope {
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

function calibrationFor(envelopes: readonly ConfidenceCalibrationInsightEnvelope[], baseConfidence = 50): ConfidenceCalibrationResult {
  return calibrateConfidence({ baseConfidence, insights: envelopes, configuration: calibrationConfig });
}

function recommendationFor(calibration: ConfidenceCalibrationResult, overrides: Partial<ImmutableRecommendationConfidenceEnvelope> = {}): ImmutableRecommendationConfidenceEnvelope {
  const patternDiscoveryHashes = calibration.lineage_hashes.map((item) => item.pattern_discovery_result_sha256);
  const insightHashes = calibration.lineage_hashes.map((item) => item.insight_sha256);
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
      pattern_discovery_result_hashes: patternDiscoveryHashes,
      pattern_insight_ids: calibration.included_insight_ids,
      pattern_insight_hashes: insightHashes,
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
    ...overrides,
  };
}

function advisoryFor(calibration: ConfidenceCalibrationResult, recommendation = recommendationFor(calibration)) {
  const advisory = buildConfidenceCalibrationAdvisory({ recommendation, calibration, configuration: advisoryConfig });
  if (advisory.lineage_hashes === null) return advisory;
  const hash = canonicalHash({
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
    warnings: orderRecords(advisory.warnings),
    issues: orderRecords(advisory.issues),
    lineage_hashes: {
      recommendation_source_hash: advisory.lineage_hashes.recommendation_source_hash,
      decision_boundary_sha256: advisory.lineage_hashes.decision_boundary_sha256,
      pattern_discovery_result_hashes: orderText(advisory.lineage_hashes.pattern_discovery_result_hashes),
      pattern_insight_hashes: orderText(advisory.lineage_hashes.pattern_insight_hashes),
      calibration_identity_hash: advisory.lineage_hashes.calibration_identity_hash,
      calibration_result_hash: advisory.lineage_hashes.calibration_result_hash,
      evidence_lineage_hash: advisory.lineage_hashes.evidence_lineage_hash,
    },
    advisory_eligible: advisory.advisory_eligible,
    advisory_visible: advisory.advisory_visible,
    application_eligible: advisory.application_eligible,
    reasons: orderText(advisory.reasons),
    non_authoritative: advisory.non_authoritative,
    applied: advisory.applied,
  });
  return {
    ...advisory,
    advisory_hash: hash,
    advisory_id: `confidence_calibration_advisory_v1:${hash.slice(0, 24)}`,
  };
}

function projectionRecommendationFor(
  recommendation: ImmutableRecommendationConfidenceEnvelope,
  advisory: ConfidenceCalibrationAdvisoryResult,
  overrides: Partial<ImmutableRecommendationProjectionEnvelope> = {},
): ImmutableRecommendationProjectionEnvelope {
  const lineage = advisory.lineage_hashes;
  return {
    recommendation_id: recommendation.recommendation_id,
    recommendation_fingerprint: recommendation.recommendation_fingerprint,
    recommendation_snapshot_hash: recommendation.recommendation_snapshot_hash,
    original_confidence_basis_points: Math.round(recommendation.original_confidence * 100),
    schema_version: "recommendation_projection_envelope_v1",
    decision_boundary: recommendation.decision_boundary,
    identity: {
      ticker: "AAPL",
      side: "long",
    },
    source: {
      source_kind: "recommendation_snapshot",
      source_version: "recommendation_snapshot_v1",
      source_classification: "static_projection",
      immutable: true,
    },
    lineage: {
      recommendation_source_hash: recommendation.lineage.recommendation_source_hash,
      decision_boundary_sha256: recommendation.decision_boundary.boundary_sha256,
      evidence_lineage_hash: lineage?.evidence_lineage_hash ?? h("4"),
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
    ...overrides,
  };
}

function project(
  advisory: ConfidenceCalibrationAdvisoryResult,
  recommendation = projectionRecommendationFor(recommendationFor(calibrationFor([insight()])), advisory),
) {
  return buildConfidenceCalibrationRecommendationProjection({
    recommendation,
    advisory,
    configuration: projectionConfig,
  });
}

type Mutable<T> = { -readonly [P in keyof T]: T[P] extends false ? boolean : T[P] extends object ? Mutable<T[P]> : T[P] };

function mutate<T>(value: T, patch: (draft: Mutable<T>) => void): T {
  const draft = JSON.parse(JSON.stringify(value)) as Mutable<T>;
  patch(draft);
  return draft as T;
}

function validPair() {
  const calibration = calibrationFor([insight()]);
  const recommendation = recommendationFor(calibration);
  const advisory = advisoryFor(calibration, recommendation);
  const projectionRecommendation = projectionRecommendationFor(recommendation, advisory);
  return { calibration, recommendation, advisory, projectionRecommendation };
}

test.describe.serial("Action 448 confidence calibration Recommendation advisory projection implementation", () => {
  test("has exact files and public export inventory", () => {
    expect(existsSync(docPath)).toBe(true);
    expect(existsSync(verifierPath)).toBe(true);
    expect(existsSync(testPath)).toBe(true);
    const source = readFileSync("lib/confidence-calibration-recommendation-advisory-projection.ts", "utf8");
    expect(source.match(/export function buildConfidenceCalibrationRecommendationProjection/g)).toHaveLength(1);
    expect(source).toContain("export type ImmutableRecommendationProjectionEnvelope");
    expect(source).toContain("export type FrozenRecommendationProjectionConfiguration");
    expect(source).toContain("export type ConfidenceCalibrationRecommendationProjectionResult");
    expect(source).not.toContain("export const");
    expect(source).not.toContain("export class");
  });

  test("projects advisory_ready without applying or mutating confidence", () => {
    const { advisory, projectionRecommendation } = validPair();
    const result = project(advisory, projectionRecommendation);
    expect(result.status).toBe("projection_ready");
    expect(result.projection_id).toMatch(/^confidence_calibration_recommendation_projection_v1:[a-f0-9]{24}$/);
    expect(result.projection_hash).toMatch(/^[a-f0-9]{64}$/);
    expect(result.recommendation_original_confidence_basis_points).toBe(5000);
    expect(result.advisory_proposed_delta_basis_points).toBe(200);
    expect(result.advisory_proposed_confidence_basis_points).toBe(5200);
    expect(result.recommendation_confidence_unchanged).toBe(true);
    expect(result.non_authoritative).toBe(true);
    expect(result.applied).toBe(false);
    expect(result.application_eligible).toBe(false);
    expect(result.ranking_affected).toBe(false);
    expect(result.scanner_affected).toBe(false);
    expect(result.publication_affected).toBe(false);
    expect(result.execution_affected).toBe(false);
    expect(result).not.toHaveProperty("recommendation");
    expect(result).not.toHaveProperty("applied_confidence");
    expect(result).not.toHaveProperty("effective_confidence");
  });

  test("projects advisory_ready_with_warnings with deterministic warning metadata", () => {
    const calibration = calibrationFor([insight({ warning_codes: ["metric_value_unavailable"] })]);
    const recommendation = recommendationFor(calibration);
    const advisory = advisoryFor(calibration, recommendation);
    const result = project(advisory, projectionRecommendationFor(recommendation, advisory));
    expect(result.status).toBe("projection_ready_with_warnings");
    expect(result.warnings).toEqual([
      {
        code: "metric_value_unavailable",
        path: "/insights/0/warning_codes",
        severity: "warning",
        messageKey: "confidence_calibration_advisory.metric_value_unavailable",
      },
    ]);
  });

  test("projects advisory_no_adjustment only when equality semantics are exact", () => {
    const calibration = calibrationFor([insight({ insight: { ...insight().insight!, evidence_direction: "neutral" } })]);
    const recommendation = recommendationFor(calibration);
    const advisory = advisoryFor(calibration, recommendation);
    const result = project(advisory, projectionRecommendationFor(recommendation, advisory));
    expect(result.status).toBe("projection_no_adjustment");
    expect(result.advisory_proposed_delta_basis_points).toBe(0);
    expect(result.advisory_proposed_confidence_basis_points).toBe(result.recommendation_original_confidence_basis_points);

    const invalid = mutate(advisory, (draft) => {
      draft.proposed_delta = 0.01;
    });
    expect(project(invalid, projectionRecommendationFor(recommendation, advisory)).status).toBe("blocked_advisory_result");
  });

  test("maps every insufficient or blocked advisory status fail-closed", () => {
    const { advisory, projectionRecommendation } = validPair();
    const cases: Array<[ConfidenceCalibrationAdvisoryResult["status"], string]> = [
      ["advisory_insufficient_evidence", "projection_insufficient_evidence"],
      ["blocked_invalid_input", "blocked_invalid_input"],
      ["blocked_confidence_mismatch", "blocked_confidence_mismatch"],
      ["blocked_invalid_lineage", "blocked_invalid_lineage"],
      ["blocked_future_leakage", "blocked_future_leakage"],
      ["blocked_calibration_result", "blocked_advisory_result"],
      ["blocked_unsupported_status", "blocked_unsupported_status"],
    ];
    for (const [status, expected] of cases) {
      const blocked = mutate(advisory, (draft) => {
        draft.status = status;
        draft.advisory_id = null;
        draft.advisory_hash = null;
        draft.lineage_hashes = null;
        draft.advisory_eligible = false;
        draft.advisory_visible = false;
      });
      const result = project(blocked, projectionRecommendation);
      expect(result.status).toBe(expected);
      expect(result.projection_visible).toBe(false);
      expect(result.applied).toBe(false);
    }
  });

  test("blocks malformed input, configuration, recommendation, fingerprint, snapshot hash and confidence", () => {
    const { advisory, projectionRecommendation } = validPair();
    expect(buildConfidenceCalibrationRecommendationProjection({} as never).status).toBe("blocked_invalid_input");
    expect(buildConfidenceCalibrationRecommendationProjection({
      recommendation: projectionRecommendation,
      advisory,
      configuration: { ...projectionConfig, configuration_version: "bad" },
    } as never).status).toBe("blocked_invalid_input");
    expect(buildConfidenceCalibrationRecommendationProjection({
      recommendation: { nope: true },
      advisory,
      configuration: projectionConfig,
    } as never).status).toBe("blocked_invalid_input");
    expect(project(advisory, mutate(projectionRecommendation, (draft) => {
      draft.recommendation_fingerprint = "";
    })).status).toBe("blocked_invalid_lineage");
    expect(project(advisory, mutate(projectionRecommendation, (draft) => {
      draft.recommendation_snapshot_hash = "bad";
    })).status).toBe("blocked_invalid_lineage");
    expect(project(advisory, mutate(projectionRecommendation, (draft) => {
      draft.original_confidence_basis_points = 5000.5;
    })).status).toBe("blocked_invalid_input");
  });

  test("blocks malformed advisory, unsupported status, identity hash tampering and confidence mismatch", () => {
    const { advisory, projectionRecommendation } = validPair();
    expect(project({ nope: true } as never, projectionRecommendation).status).toBe("blocked_advisory_result");
    expect(project(mutate(advisory, (draft) => {
      draft.status = "strange" as never;
    }), projectionRecommendation).status).toBe("blocked_unsupported_status");
    expect(project(mutate(advisory, (draft) => {
      draft.advisory_id = "bad";
    }), projectionRecommendation).status).toBe("blocked_advisory_result");
    expect(project(mutate(advisory, (draft) => {
      draft.advisory_hash = h("a");
    }), projectionRecommendation).status).toBe("blocked_advisory_result");
    expect(project(advisory, mutate(projectionRecommendation, (draft) => {
      draft.original_confidence_basis_points = 5100;
    })).status).toBe("blocked_confidence_mismatch");
  });

  test("blocks retained advisory hash when semantic payload changes", () => {
    const { advisory, projectionRecommendation } = validPair();
    const tampered = mutate(advisory, (draft) => {
      draft.proposed_calibrated_confidence = 53;
    });
    expect(project(tampered, projectionRecommendation).status).toBe("blocked_advisory_result");
  });

  test("blocks missing and mismatched lineage, Pattern Discovery lineage and Pattern Insight lineage", () => {
    const { advisory, projectionRecommendation } = validPair();
    expect(project(mutate(advisory, (draft) => {
      draft.lineage_hashes = null;
    }), projectionRecommendation).status).toBe("blocked_advisory_result");
    expect(project(advisory, mutate(projectionRecommendation, (draft) => {
      draft.recommendation_fingerprint = "other";
    })).status).toBe("blocked_invalid_lineage");
    expect(project(advisory, mutate(projectionRecommendation, (draft) => {
      draft.recommendation_snapshot_hash = h("a");
    })).status).toBe("blocked_invalid_lineage");
    expect(project(advisory, mutate(projectionRecommendation, (draft) => {
      draft.lineage.pattern_discovery_result_hashes = [h("4")];
    })).status).toBe("blocked_invalid_lineage");
    expect(project(advisory, mutate(projectionRecommendation, (draft) => {
      draft.lineage.pattern_insight_hashes = [h("5")];
    })).status).toBe("blocked_invalid_lineage");
  });

  test("blocks future leakage, feedback reuse and circular projection lineage", () => {
    const { advisory, projectionRecommendation } = validPair();
    expect(project(advisory, mutate(projectionRecommendation, (draft) => {
      draft.anti_leakage.future_outcome_evidence = true;
    })).status).toBe("blocked_future_leakage");
    expect(project(advisory, mutate(projectionRecommendation, (draft) => {
      draft.anti_feedback.projection_reused_as_ranking_signal = true;
    })).status).toBe("blocked_invalid_lineage");
    expect(project(advisory, mutate(projectionRecommendation, (draft) => {
      draft.anti_feedback.circular_projection_lineage = true;
    })).status).toBe("blocked_invalid_lineage");
  });

  test("canonicalizes warning and issue ordering without mutating Recommendation collections", () => {
    const calibration = calibrationFor([insight({ warning_codes: ["metric_value_unavailable"] })]);
    const recommendation = recommendationFor(calibration);
    const advisory = advisoryFor(calibration, recommendation);
    const projectionRecommendation = projectionRecommendationFor(recommendation, advisory);
    const first = project(advisory, projectionRecommendation);
    const reordered = mutate(advisory, (draft) => {
      draft.warnings = [...draft.warnings].reverse();
    });
    const second = project(reordered, projectionRecommendation);
    expect(first.projection_hash).toBe(second.projection_hash);
    expect(first.warnings).toEqual(second.warnings);
    expect(first).not.toHaveProperty("recommendation_warnings");
  });

  test("keeps projection identity deterministic for repeated and interleaved calls", () => {
    const { advisory, projectionRecommendation } = validPair();
    const calibration = calibrationFor([insight({ warning_codes: ["metric_value_unavailable"] })]);
    const warningRecommendation = recommendationFor(calibration);
    const warningAdvisory = advisoryFor(calibration, warningRecommendation);
    const warningProjectionRecommendation = projectionRecommendationFor(warningRecommendation, warningAdvisory);
    const first = project(advisory, projectionRecommendation);
    const interleaved = project(warningAdvisory, warningProjectionRecommendation);
    const second = project(advisory, projectionRecommendation);
    expect(first).toEqual(second);
    expect(first.projection_id).toBe(second.projection_id);
    expect(interleaved.status).toBe("projection_ready_with_warnings");
  });

  test("does not mutate inputs and deeply freezes outputs", () => {
    const { advisory, projectionRecommendation } = validPair();
    const input = { recommendation: projectionRecommendation, advisory, configuration: projectionConfig };
    const before = JSON.stringify(input);
    const result = buildConfidenceCalibrationRecommendationProjection(input);
    expect(JSON.stringify(input)).toBe(before);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.warnings)).toBe(true);
    expect(Object.isFrozen(result.issues)).toBe(true);
    expect(Object.isFrozen(result.lineage_hashes)).toBe(true);
  });

  test("source has no runtime persistence replay provider Supabase feedback or deployment hooks", () => {
    const source = readFileSync("lib/confidence-calibration-recommendation-advisory-projection.ts", "utf8");
    for (const forbidden of [
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
    ]) {
      expect(source).not.toContain(forbidden);
    }
    const { advisory, projectionRecommendation } = validPair();
    const result = project(advisory, projectionRecommendation);
    expect(result).not.toHaveProperty("persistence_command");
    expect(result).not.toHaveProperty("replay_command");
    expect(result).not.toHaveProperty("feedback_event");
  });

  test("verifier succeeds and Action 447 remains healthy", () => {
    const report = JSON.parse(execFileSync("node", [verifierPath], { encoding: "utf8", timeout: 300000 })) as {
      verification_status: string;
      action447_compatibility: { verification_status: string; approval_decision: string; adapter_recognized: boolean };
      runtime_preview_status: string;
      safety: Record<string, boolean>;
      recommended_next_action: string;
    };
    expect(report.verification_status).toBe("passed");
    expect(report.action447_compatibility).toMatchObject({
      verification_status: "passed",
      approval_decision: "approved",
      adapter_recognized: true,
    });
    expect(report.runtime_preview_status).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(Object.values(report.safety)).toEqual(Object.values(report.safety).map(() => false));
    expect(report.recommended_next_action).toBe("action_449_independent_projection_adapter_verification");
  });
});
