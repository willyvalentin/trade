import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";

import { expect, test } from "@playwright/test";

import {
  buildConfidenceCalibrationAdvisory,
  type FrozenAdvisoryConsumptionConfiguration,
  type ImmutableRecommendationConfidenceEnvelope,
} from "../../lib/confidence-calibration-advisory-adapter";
import {
  calibrateConfidence,
  type ConfidenceCalibrationInsightEnvelope,
  type ConfidenceCalibrationResult,
  type FrozenConfidenceCalibrationConfiguration,
} from "../../lib/pure-confidence-calibration";

const docPath = "docs/action-432-confidence-calibration-advisory-adapter-implementation.md";
const verifierPath = "scripts/action-432-confidence-calibration-advisory-adapter-implementation-verify.mjs";
const testPath = "tests/e2e/action-432-confidence-calibration-advisory-adapter-implementation.spec.ts";

test.setTimeout(300000);

const h = (char: string) => char.repeat(64);

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

function advisory(calibration: ConfidenceCalibrationResult, recommendation = recommendationFor(calibration)) {
  return buildConfidenceCalibrationAdvisory({ recommendation, calibration, configuration: advisoryConfig });
}

type Mutable<T> = { -readonly [P in keyof T]: T[P] extends false ? boolean : T[P] extends object ? Mutable<T[P]> : T[P] };

function mutate<T>(value: T, patch: (draft: Mutable<T>) => void): T {
  const draft = JSON.parse(JSON.stringify(value)) as Mutable<T>;
  patch(draft);
  return draft as T;
}

test.describe.serial("Action 432 Confidence Calibration advisory adapter implementation", () => {
  test("has exact files and export inventory", () => {
    expect(existsSync(docPath)).toBe(true);
    expect(existsSync(verifierPath)).toBe(true);
    expect(existsSync(testPath)).toBe(true);
    const source = readFileSync("lib/confidence-calibration-advisory-adapter.ts", "utf8");
    expect(source.match(/export function buildConfidenceCalibrationAdvisory/g)).toHaveLength(1);
    expect(source).toContain("export type ImmutableRecommendationConfidenceEnvelope");
    expect(source).toContain("export type FrozenAdvisoryConsumptionConfiguration");
    expect(source).toContain("export type ConfidenceCalibrationAdvisoryResult");
    expect(source).not.toContain("export const");
    expect(source).not.toContain("export class");
  });

  test("returns valid calibrated advisory output without applying confidence", () => {
    const calibration = calibrationFor([insight()]);
    expect(calibration.status).toBe("calibrated");
    const result = advisory(calibration);
    expect(result.status).toBe("advisory_ready");
    expect(result.advisory_id).toMatch(/^confidence_calibration_advisory_v1:[a-f0-9]{24}$/);
    expect(result.advisory_hash).toMatch(/^[a-f0-9]{64}$/);
    expect(result.original_confidence).toBe(50);
    expect(result.proposed_delta).toBe(2);
    expect(result.proposed_calibrated_confidence).toBe(52);
    expect(result.calibration_status).toBe("calibrated");
    expect(result.calibration_id).toBe(calibration.calibration_id);
    expect(result.non_authoritative).toBe(true);
    expect(result.applied).toBe(false);
    expect(result.application_eligible).toBe(false);
    expect(result.advisory_eligible).toBe(true);
    expect(result.advisory_visible).toBe(true);
    expect(result).not.toHaveProperty("recommendation");
    expect(result).not.toHaveProperty("applied_confidence");
  });

  test("returns calibrated_with_warnings advisory and preserves warning metadata deterministically", () => {
    const calibration = calibrationFor([insight({ warning_codes: ["metric_value_unavailable"] })]);
    expect(calibration.status).toBe("calibrated_with_warnings");
    const result = advisory(calibration);
    expect(result.status).toBe("advisory_ready_with_warnings");
    expect(result.warnings).toEqual([
      {
        code: "metric_value_unavailable",
        path: "/insights/0/warning_codes",
        severity: "warning",
        messageKey: "confidence_calibration_advisory.metric_value_unavailable",
      },
    ]);
    expect(result.issues).toEqual([]);
  });

  test("returns no_adjustment advisory only when equality semantics are exact", () => {
    const calibration = calibrationFor([insight({ insight: { ...insight().insight!, evidence_direction: "neutral" } })]);
    expect(calibration.status).toBe("no_adjustment");
    const result = advisory(calibration);
    expect(result.status).toBe("advisory_no_adjustment");
    expect(result.original_confidence).toBe(result.proposed_calibrated_confidence);
    expect(result.proposed_delta).toBe(0);

    const invalid = mutate(calibration, (draft) => {
      draft.proposed_delta = 0.01;
    });
    expect(advisory(invalid).status).toBe("blocked_calibration_result");
  });

  test("fails every insufficient or blocked calibration status closed", () => {
    const valid = calibrationFor([insight()]);
    const cases: Array<[ConfidenceCalibrationResult["status"], string]> = [
      ["insufficient_eligible_evidence", "advisory_insufficient_evidence"],
      ["blocked_invalid_input", "blocked_invalid_input"],
      ["blocked_invalid_configuration", "blocked_invalid_input"],
      ["blocked_invalid_lineage", "blocked_invalid_lineage"],
      ["blocked_future_leakage", "blocked_future_leakage"],
      ["blocked_overlapping_evidence", "blocked_calibration_result"],
      ["blocked_unsupported_insight", "blocked_unsupported_status"],
    ];
    for (const [status, expected] of cases) {
      const result = advisory(mutate(valid, (draft) => {
        draft.status = status;
        draft.issues = [{ code: "invalid_lineage", path: "/insights/0", severity: "error", messageKey: "confidence_calibration.invalid_lineage" }];
      }));
      expect(result.status).toBe(expected);
      expect(result.advisory_eligible).toBe(false);
      expect(result.applied).toBe(false);
      expect(result.non_authoritative).toBe(true);
    }
  });

  test("blocks malformed input, configuration, recommendation, identity, snapshot hash and confidence", () => {
    const calibration = calibrationFor([insight()]);
    const recommendation = recommendationFor(calibration);
    expect(buildConfidenceCalibrationAdvisory({} as never).status).toBe("blocked_invalid_input");
    expect(buildConfidenceCalibrationAdvisory({ recommendation, calibration, configuration: { ...advisoryConfig, configuration_version: "bad" } } as never).status).toBe("blocked_invalid_input");
    expect(buildConfidenceCalibrationAdvisory({ recommendation: { nope: true }, calibration, configuration: advisoryConfig } as never).status).toBe("blocked_invalid_input");
    expect(advisory(calibration, mutate(recommendation, (draft) => {
      draft.recommendation_fingerprint = "";
    })).status).toBe("blocked_invalid_lineage");
    expect(advisory(calibration, mutate(recommendation, (draft) => {
      draft.recommendation_snapshot_hash = "bad";
    })).status).toBe("blocked_invalid_lineage");
    expect(advisory(calibration, mutate(recommendation, (draft) => {
      draft.original_confidence = 50.001;
    })).status).toBe("blocked_invalid_input");
  });

  test("blocks confidence mismatch and malformed calibration identity/hash", () => {
    const calibration = calibrationFor([insight()]);
    expect(advisory(calibration, recommendationFor(calibration, { original_confidence: 51 })).status).toBe("blocked_confidence_mismatch");
    expect(advisory(mutate(calibration, (draft) => {
      draft.calibration_id = "bad";
    })).status).toBe("blocked_calibration_result");
    expect(advisory(mutate(calibration, (draft) => {
      draft.calibration_hash = h("g");
    })).status).toBe("blocked_calibration_result");
  });

  test("blocks missing Pattern Discovery and Pattern Insight lineage", () => {
    const calibration = calibrationFor([insight()]);
    expect(advisory(calibration, mutate(recommendationFor(calibration), (draft) => {
      draft.lineage.pattern_discovery_result_hashes = [];
    })).status).toBe("blocked_invalid_lineage");
    expect(advisory(calibration, mutate(recommendationFor(calibration), (draft) => {
      draft.lineage.pattern_insight_hashes = [h("a")];
    })).status).toBe("blocked_invalid_lineage");
  });

  test("blocks anti-leakage, circular lineage, feedback reuse and post-decision evidence", () => {
    const calibration = calibrationFor([insight()]);
    expect(advisory(calibration, mutate(recommendationFor(calibration), (draft) => {
      draft.anti_leakage.future_outcome_evidence = true;
    })).status).toBe("blocked_future_leakage");
    expect(advisory(calibration, mutate(recommendationFor(calibration), (draft) => {
      draft.anti_feedback.circular_calibration_lineage = true;
    })).status).toBe("blocked_invalid_lineage");
    expect(advisory(calibration, mutate(recommendationFor(calibration), (draft) => {
      draft.lineage.source_scenario_ids = [calibration.calibration_id ?? ""];
    })).status).toBe("blocked_invalid_lineage");
    expect(advisory(calibration, mutate(recommendationFor(calibration), (draft) => {
      draft.anti_leakage.evidence_after_decision_boundary = true;
    })).status).toBe("blocked_future_leakage");
  });

  test("keeps warning and issue shapes bounded and advisory namespaced", () => {
    const calibration = calibrationFor([insight({ warning_codes: ["metric_value_unavailable"] })]);
    const result = advisory(calibration);
    for (const warning of result.warnings) {
      expect(Object.keys(warning).sort()).toEqual(["code", "messageKey", "path", "severity"]);
      expect(warning.path).toMatch(/^\//);
      expect(warning.messageKey).toBe(`confidence_calibration_advisory.${warning.code}`);
    }
    const blocked = advisory(mutate(calibration, (draft) => {
      draft.status = "blocked_invalid_lineage";
      draft.issues = [{ code: "invalid_lineage", path: "/insights/0", severity: "error", messageKey: "confidence_calibration.invalid_lineage" }];
    }));
    expect(blocked.issues).toEqual([
      {
        code: "invalid_lineage",
        path: "/insights/0",
        severity: "error",
        messageKey: "confidence_calibration_advisory.invalid_lineage",
      },
    ]);
  });

  test("is deterministic for IDs serialization reordered warnings and interleaved calls", () => {
    const calibration = calibrationFor([insight({ warning_codes: ["metric_value_unavailable"] })]);
    const withExtraWarnings = mutate(calibration, (draft) => {
      draft.warnings = [
        { code: "confidence_clamped_to_bounds", path: "/proposed_calibrated_confidence", severity: "warning", messageKey: "confidence_calibration.confidence_clamped_to_bounds" },
        ...draft.warnings,
      ];
    });
    const reordered = mutate(withExtraWarnings, (draft) => {
      draft.warnings = [...draft.warnings].reverse();
    });
    const first = advisory(withExtraWarnings);
    const second = advisory(reordered);
    const third = advisory(calibrationFor([insight()]));
    const fourth = advisory(withExtraWarnings);
    expect(first.advisory_id).toBe(second.advisory_id);
    expect(first.advisory_hash).toBe(second.advisory_hash);
    expect(JSON.stringify(first)).toBe(JSON.stringify(second));
    expect(first).toEqual(fourth);
    expect(third.status).toBe("advisory_ready");
  });

  test("does not mutate inputs and deeply freezes outputs", () => {
    const calibration = calibrationFor([insight({ warning_codes: ["metric_value_unavailable"] })]);
    const recommendation = recommendationFor(calibration);
    const input = { recommendation, calibration, configuration: advisoryConfig };
    const before = JSON.stringify(input);
    const result = buildConfidenceCalibrationAdvisory(input);
    expect(JSON.stringify(input)).toBe(before);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.warnings)).toBe(true);
    expect(Object.isFrozen(result.issues)).toBe(true);
    expect(Object.isFrozen(result.lineage_hashes)).toBe(true);
  });

  test("has no recommendation mutation ranking scanner publication persistence runtime replay provider Supabase or feedback effect", () => {
    const source = readFileSync("lib/confidence-calibration-advisory-adapter.ts", "utf8");
    for (const forbidden of ["@supabase", "fetch(", "XMLHttpRequest", "process.env", "localStorage", "Date.now", "Math.random", "console.", "next/server"]) {
      expect(source).not.toContain(forbidden);
    }
    const calibration = calibrationFor([insight()]);
    const result = advisory(calibration);
    expect(result.application_eligible).toBe(false);
    expect(result.applied).toBe(false);
    expect(result.reasons).toContain("applied_false");
    expect(result).not.toHaveProperty("ranking_update");
    expect(result).not.toHaveProperty("scanner_command");
    expect(result).not.toHaveProperty("publish_command");
    expect(result).not.toHaveProperty("persistence_command");
    expect(result).not.toHaveProperty("feedback_event");
  });

  test("verifier succeeds and Action 431 compatibility remains healthy", () => {
    const report = JSON.parse(execFileSync("node", [verifierPath], { encoding: "utf8", timeout: 300000 })) as {
      verification_status: string;
      action431_compatibility: { verification_status: string; adapter_path_exists: boolean; no_recommendation_engine_consumer: boolean };
      runtime_preview_status: string;
      safety: Record<string, boolean>;
    };
    expect(report.verification_status).toBe("passed");
    expect(report.action431_compatibility.verification_status).toBe("passed");
    expect(report.action431_compatibility.adapter_path_exists).toBe(true);
    expect(report.action431_compatibility.no_recommendation_engine_consumer).toBe(true);
    expect(report.runtime_preview_status).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(Object.values(report.safety)).toEqual(Object.values(report.safety).map(() => false));
  });
});
