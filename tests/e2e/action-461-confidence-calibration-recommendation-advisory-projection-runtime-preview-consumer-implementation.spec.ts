import { execFileSync } from "child_process";
import { createHash } from "crypto";
import { existsSync, readFileSync } from "fs";

import { expect, test } from "@playwright/test";

import { ConfidenceCalibrationProjectionPreview } from "../../components/recommendations/ConfidenceCalibrationProjectionPreview";
import {
  buildConfidenceCalibrationAdvisory,
  type ConfidenceCalibrationAdvisoryResult,
  type FrozenAdvisoryConsumptionConfiguration,
  type ImmutableRecommendationConfidenceEnvelope,
} from "../../lib/confidence-calibration-advisory-adapter";
import {
  buildConfidenceCalibrationProjectionPreview,
  mapConfidenceCalibrationProjectionPreviewResult,
} from "../../lib/confidence-calibration-recommendation-advisory-projection-preview";
import { isConfidenceCalibrationProjectionPreviewEnabled } from "../../lib/confidence-calibration-recommendation-advisory-projection-preview-flag";
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

const docPath =
  "docs/action-461-confidence-calibration-recommendation-advisory-projection-runtime-preview-consumer-implementation.md";
const verifierPath =
  "scripts/action-461-confidence-calibration-recommendation-advisory-projection-runtime-preview-consumer-implementation-verify.mjs";

test.setTimeout(300000);

const h = (char: string) => char.repeat(64);

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function canonicalize(value: unknown): unknown {
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") return Object.is(value, -0) ? 0 : value;
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

function recommendationFor(calibration: ConfidenceCalibrationResult): ImmutableRecommendationConfidenceEnvelope {
  return {
    recommendation_id: "rec_static_461",
    recommendation_fingerprint: "rec_fingerprint_static_461",
    recommendation_snapshot_hash: h("f"),
    original_confidence: calibration.original_confidence ?? 50,
    decision_boundary: {
      boundary_id: "decision_boundary_461",
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

function toBasisPoints(value: number | null): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return Math.round(value * projectionConfig.confidence_scale_basis_points_per_point);
}

function advisoryFor(calibration: ConfidenceCalibrationResult, recommendation: ImmutableRecommendationConfidenceEnvelope) {
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

function validPair() {
  const calibration = calibrationFor([insight()]);
  const recommendation = recommendationFor(calibration);
  const advisory = advisoryFor(calibration, recommendation);
  const projectionRecommendation = projectionRecommendationFor(recommendation, advisory);
  return { advisory, projectionRecommendation };
}

type Mutable<T> = { -readonly [P in keyof T]: T[P] extends object ? Mutable<T[P]> : T[P] };

function mutate<T>(value: T, patch: (draft: Mutable<T>) => void): T {
  const draft = JSON.parse(JSON.stringify(value)) as Mutable<T>;
  patch(draft);
  return draft as T;
}

test.describe("Action 461 projection runtime preview consumer implementation", () => {
  test("documents and verifies the implementation contract", () => {
    expect(existsSync(docPath)).toBe(true);
    expect(existsSync(verifierPath)).toBe(true);
    const doc = readFileSync(docPath, "utf8");
    expect(doc).toContain("Action 460 Contract");
    expect(doc).toContain("CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED");
    expect(doc).toContain("runtime_preview_waiting_for_operator_inputs");
    const report = JSON.parse(execFileSync("node", [verifierPath], { encoding: "utf8", maxBuffer: 80 * 1024 * 1024 }));
    expect(report.verification_status).toBe("passed");
    expect(report.runtime_preview_status).toBe("runtime_preview_waiting_for_operator_inputs");
  });

  test("flag defaults disabled and rejects user-controlled or malformed activation", () => {
    expect(isConfidenceCalibrationProjectionPreviewEnabled({}, "test")).toBe(false);
    expect(isConfidenceCalibrationProjectionPreviewEnabled({ CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED: "" }, "test")).toBe(false);
    expect(isConfidenceCalibrationProjectionPreviewEnabled({ CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED: "false" }, "test")).toBe(false);
    expect(isConfidenceCalibrationProjectionPreviewEnabled({ CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED: "0" }, "test")).toBe(false);
    expect(isConfidenceCalibrationProjectionPreviewEnabled({ CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED: "1" }, "test")).toBe(false);
    expect(isConfidenceCalibrationProjectionPreviewEnabled({ CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED: "TRUE" }, "test")).toBe(false);
    expect(isConfidenceCalibrationProjectionPreviewEnabled({ CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED: " true " }, "test")).toBe(false);
    expect(isConfidenceCalibrationProjectionPreviewEnabled({ CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED: "true" }, "test")).toBe(true);
    expect(isConfidenceCalibrationProjectionPreviewEnabled({ CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED: "true" }, "production")).toBe(false);

    const source = readFileSync("lib/confidence-calibration-recommendation-advisory-projection-preview-flag.ts", "utf8");
    expect(source).not.toContain("localStorage");
    expect(source).not.toContain("sessionStorage");
    expect(source).not.toContain("location.search");
    expect(source).not.toContain("document.cookie");
  });

  test("adapter maps successful, warning, and no-adjustment states", () => {
    const { advisory, projectionRecommendation } = validPair();
    expect(buildConfidenceCalibrationProjectionPreview({
      preview_enabled: true,
      recommendation: projectionRecommendation,
      advisory,
      configuration: projectionConfig,
    })).toMatchObject({
      status: "preview_ready",
      original_recommendation_confidence_basis_points: 5000,
      proposed_preview_delta_basis_points: 200,
      proposed_preview_confidence_basis_points: 5200,
      application_eligible: false,
      applied: false,
      non_authoritative: true,
      recommendation_confidence_unchanged: true,
    });

    const warningCalibration = calibrationFor([insight({ warning_codes: ["metric_value_unavailable"] })]);
    const warningRecommendation = recommendationFor(warningCalibration);
    const warningAdvisory = advisoryFor(warningCalibration, warningRecommendation);
    const warningPreview = buildConfidenceCalibrationProjectionPreview({
      preview_enabled: true,
      recommendation: projectionRecommendationFor(warningRecommendation, warningAdvisory),
      advisory: warningAdvisory,
      configuration: projectionConfig,
    });
    expect(warningPreview.status).toBe("preview_ready_with_warnings");
    expect(warningPreview.warnings).toEqual([{ code: "metric_value_unavailable", label: "Some metrics were unavailable" }]);

    const neutralCalibration = calibrationFor([insight({ insight: { ...insight().insight!, evidence_direction: "neutral" } })]);
    const neutralRecommendation = recommendationFor(neutralCalibration);
    const neutralAdvisory = advisoryFor(neutralCalibration, neutralRecommendation);
    expect(buildConfidenceCalibrationProjectionPreview({
      preview_enabled: true,
      recommendation: projectionRecommendationFor(neutralRecommendation, neutralAdvisory),
      advisory: neutralAdvisory,
      configuration: projectionConfig,
    }).status).toBe("preview_no_adjustment");
  });

  test("adapter fails closed for disabled, missing, blocked, mismatched, unsafe, and thrown inputs", () => {
    const { advisory, projectionRecommendation } = validPair();
    const explosive = Object.defineProperty({}, "recommendation_fingerprint", {
      get() {
        throw new Error("should_not_be_touched_when_disabled");
      },
    });
    expect(buildConfidenceCalibrationProjectionPreview({
      preview_enabled: false,
      recommendation: explosive as ImmutableRecommendationProjectionEnvelope,
      advisory: explosive as ConfidenceCalibrationAdvisoryResult,
      configuration: projectionConfig,
    }).status).toBe("preview_disabled");
    expect(buildConfidenceCalibrationProjectionPreview({
      preview_enabled: true,
      recommendation: null,
      advisory,
      configuration: projectionConfig,
    }).status).toBe("preview_unavailable");

    const blockedStatuses: ConfidenceCalibrationAdvisoryResult["status"][] = [
      "advisory_insufficient_evidence",
      "blocked_invalid_input",
      "blocked_confidence_mismatch",
      "blocked_invalid_lineage",
      "blocked_future_leakage",
      "blocked_calibration_result",
      "blocked_unsupported_status",
    ];
    for (const status of blockedStatuses) {
      const blocked = mutate(advisory, (draft) => {
        draft.status = status;
      });
      expect(buildConfidenceCalibrationProjectionPreview({
        preview_enabled: true,
        recommendation: projectionRecommendation,
        advisory: blocked,
        configuration: projectionConfig,
      }).status).toBe("preview_unavailable");
    }

    for (const recommendation of [
      mutate(projectionRecommendation, (draft) => {
        draft.recommendation_fingerprint = "changed_fingerprint";
      }),
      mutate(projectionRecommendation, (draft) => {
        draft.recommendation_snapshot_hash = h("9");
      }),
      mutate(projectionRecommendation, (draft) => {
        draft.original_confidence_basis_points = 4900;
      }),
    ]) {
      expect(buildConfidenceCalibrationProjectionPreview({
        preview_enabled: true,
        recommendation,
        advisory,
        configuration: projectionConfig,
      }).status).toBe("preview_unavailable");
    }

    expect(buildConfidenceCalibrationProjectionPreview({
      preview_enabled: true,
      recommendation: projectionRecommendation,
      advisory: mutate(advisory, (draft) => {
        draft.advisory_hash = h("9");
      }),
      configuration: projectionConfig,
    }).status).toBe("preview_unavailable");

    const projection = buildConfidenceCalibrationRecommendationProjection({
      recommendation: projectionRecommendation,
      advisory,
      configuration: projectionConfig,
    });
    expect(mapConfidenceCalibrationProjectionPreviewResult(
      mutate(projection, (draft) => {
        (draft as Record<string, unknown>).ranking_affected = true;
      }) as typeof projection,
    ).status).toBe("preview_unavailable");
    expect(mapConfidenceCalibrationProjectionPreviewResult(
      mutate(projection, (draft) => {
        (draft as Record<string, unknown>).application_eligible = true;
      }) as typeof projection,
    ).status).toBe("preview_unavailable");
    expect(mapConfidenceCalibrationProjectionPreviewResult(
      mutate(projection, (draft) => {
        (draft as Record<string, unknown>).applied = true;
      }) as typeof projection,
    ).status).toBe("preview_unavailable");

    expect(buildConfidenceCalibrationProjectionPreview({
      preview_enabled: true,
      recommendation: explosive as ImmutableRecommendationProjectionEnvelope,
      advisory,
      configuration: projectionConfig,
    }).status).toBe("preview_unavailable");
  });

  test("adapter is deterministic and does not mutate Recommendation input", () => {
    const { advisory, projectionRecommendation } = validPair();
    const before = JSON.stringify(projectionRecommendation);
    const first = buildConfidenceCalibrationProjectionPreview({
      preview_enabled: true,
      recommendation: projectionRecommendation,
      advisory,
      configuration: projectionConfig,
    });
    const second = buildConfidenceCalibrationProjectionPreview({
      preview_enabled: true,
      recommendation: projectionRecommendation,
      advisory,
      configuration: projectionConfig,
    });
    expect(second).toEqual(first);
    expect(JSON.stringify(projectionRecommendation)).toBe(before);
  });

  test("UI hides disabled state and renders bounded successful, no-adjustment, unavailable, and warning copy", () => {
    const { advisory, projectionRecommendation } = validPair();
    const ready = buildConfidenceCalibrationProjectionPreview({
      preview_enabled: true,
      recommendation: projectionRecommendation,
      advisory,
      configuration: projectionConfig,
    });
    const componentSource = readFileSync(
      "components/recommendations/ConfidenceCalibrationProjectionPreview.tsx",
      "utf8",
    );
    const adapterSource = readFileSync(
      "lib/confidence-calibration-recommendation-advisory-projection-preview.ts",
      "utf8",
    );

    expect(ConfidenceCalibrationProjectionPreview).toBeTruthy();
    expect(componentSource).toContain("preview.status === \"preview_disabled\"");
    expect(componentSource).toContain("return null");
    expect(componentSource).toContain("CALIBRATION PREVIEW");
    expect(componentSource).toContain("Preview only");
    expect(componentSource).toContain("not applied");
    expect(componentSource).toContain("Original Recommendation confidence remains active");
    expect(componentSource).toContain("ORIGINAL CONFIDENCE");
    expect(componentSource).toContain("SUGGESTED PREVIEW ADJUSTMENT");
    expect(componentSource).toContain("SUGGESTED PREVIEW CONFIDENCE");
    expect(componentSource).toContain("Calibration preview unavailable");
    expect(componentSource).toContain("No adjustment suggested");
    expect(componentSource).not.toContain("Apply");
    expect(componentSource).not.toContain("Accept");
    expect(componentSource).not.toContain("Use");
    expect(componentSource).not.toContain("projection_hash");
    expect(componentSource).not.toContain("lineage_hashes");
    expect(ready).not.toHaveProperty("projection_hash");
    expect(ready).not.toHaveProperty("issues");
    expect(adapterSource).toContain("Calibration warning");
    expect(adapterSource).toContain("Some metrics were unavailable");
    expect(adapterSource).toContain("Duplicate evidence was deduped");
  });

  test("source isolation keeps one projection call site and no routes, persistence, replay, provider, or deployment artifacts", () => {
    const report = JSON.parse(execFileSync("node", [verifierPath], { encoding: "utf8", maxBuffer: 80 * 1024 * 1024 }));
    expect(report.projection_call_site_count).toBe(1);
    expect(report.route_result.new_route_created).toBe(false);
    expect(report.persistence_result.persisted).toBe(false);
    expect(report.replay_result.replay_executed).toBe(false);
    expect(report.provider_supabase_result.provider_call_executed).toBe(false);
    expect(report.provider_supabase_result.supabase_write_executed).toBe(false);
    expect(report.feedback_result.feedback_created).toBe(false);
    expect(report.confidence_application_result.confidence_applied).toBe(false);
    expect(report.behavior_isolation).toMatchObject({
      ranking_changed: false,
      scanner_changed: false,
      publication_changed: false,
      execution_changed: false,
    });
    expect(report.deployment_result).toBe("none");
  });
});
