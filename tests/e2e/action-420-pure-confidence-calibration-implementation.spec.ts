import { execFileSync } from "child_process";
import { createHash } from "crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

import {
  calibrateConfidence,
  type ConfidenceCalibrationInsightEnvelope,
  type FrozenConfidenceCalibrationConfiguration,
} from "@/lib/pure-confidence-calibration";

type Mutable<T> = T extends readonly (infer Item)[]
  ? Mutable<Item>[]
  : T extends object
    ? { -readonly [Key in keyof T]: Mutable<T[Key]> }
    : T;

const config: FrozenConfidenceCalibrationConfiguration = {
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

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const sha = (label: string) => createHash("sha256").update(label).digest("hex");

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    Object.values(value as Record<string, unknown>).forEach(deepFreeze);
  }
  return value;
}

function files(path: string): string[] {
  if (!existsSync(path)) return [];
  if (statSync(path).isFile()) return [path];
  return readdirSync(path).flatMap((name) => files(join(path, name))).sort();
}

function envelope(id: string, overrides: Partial<Mutable<ConfidenceCalibrationInsightEnvelope>> = {}): ConfidenceCalibrationInsightEnvelope {
  const base: Mutable<ConfidenceCalibrationInsightEnvelope> = {
    pattern_discovery_sha256: sha("pattern-discovery"),
    pattern_discovery_configuration_version: "pattern_discovery_setup_family_v1",
    pattern_discovery_result_sha256: sha(`result:${id}`),
    evidence_set_sha256: sha(`evidence:${id}`),
    group_sha256: sha(`group:${id}`),
    insight_id: `pattern_insight:v1:${id}`,
    insight_sha256: sha(`insight:${id}`),
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
  };
  return { ...base, ...overrides } as ConfidenceCalibrationInsightEnvelope;
}

function withInsight(
  id: string,
  insight: Partial<NonNullable<Mutable<ConfidenceCalibrationInsightEnvelope>["insight"]>>,
  overrides: Partial<Mutable<ConfidenceCalibrationInsightEnvelope>> = {},
): ConfidenceCalibrationInsightEnvelope {
  const base = envelope(id);
  return { ...base, ...overrides, insight: { ...base.insight, ...insight } } as ConfidenceCalibrationInsightEnvelope;
}

test.describe.serial("Action 420 pure Confidence Calibration implementation", () => {
  test("exports exactly seven types and one synchronous runtime function", async () => {
    const source = readFileSync("lib/pure-confidence-calibration.ts", "utf8");
    expect([...source.matchAll(/^export type (\w+)/gm)].map((match) => match[1])).toEqual([
      "ConfidenceCalibrationInsightEnvelope",
      "FrozenConfidenceCalibrationConfiguration",
      "ConfidenceCalibrationIssue",
      "ConfidenceCalibrationWarning",
      "ConfidenceCalibrationEvidenceSummary",
      "ConfidenceCalibrationAdjustment",
      "ConfidenceCalibrationResult",
    ]);
    expect([...source.matchAll(/^export function (\w+)/gm)].map((match) => match[1])).toEqual(["calibrateConfidence"]);
    expect(typeof calibrateConfidence).toBe("function");
    expect(calibrateConfidence({ baseConfidence: 50, insights: [envelope("sync")], configuration: config })).not.toBeInstanceOf(Promise);
  });

  test("valid supportive adverse neutral and mixed insights produce exact statuses and deltas", () => {
    expect(calibrateConfidence({ baseConfidence: 50, insights: [envelope("supportive")], configuration: config })).toMatchObject({
      status: "calibrated",
      proposed_delta: 2,
      proposed_calibrated_confidence: 52,
      non_authoritative: true,
      applied: false,
    });
    expect(calibrateConfidence({ baseConfidence: 50, insights: [withInsight("adverse", { evidence_direction: "adverse_strong" })], configuration: config }).proposed_delta).toBe(-3);
    expect(calibrateConfidence({ baseConfidence: 50, insights: [withInsight("neutral", { evidence_direction: "neutral" })], configuration: config }).status).toBe("no_adjustment");
    expect(calibrateConfidence({ baseConfidence: 50, insights: [withInsight("mixed", { evidence_direction: "mixed" })], configuration: config }).status).toBe("no_adjustment");
  });

  test("discovered-with-warnings attenuates duplicate metric and multiple warning deltas", () => {
    const duplicate = calibrateConfidence({ baseConfidence: 50, insights: [envelope("duplicate-warning", { pattern_discovery_status: "discovered_with_warnings", warning_codes: ["duplicate_mapper_row_identity"] })], configuration: config });
    expect(duplicate.status).toBe("calibrated_with_warnings");
    expect(duplicate.proposed_delta).toBe(1);
    expect(duplicate.warnings.map((item) => item.code)).toEqual(["duplicate_mapper_row_identity"]);
    const metric = calibrateConfidence({ baseConfidence: 50, insights: [envelope("metric-warning", { warning_codes: ["metric_value_unavailable"] })], configuration: config });
    expect(metric.proposed_delta).toBe(1);
    const multiple = calibrateConfidence({ baseConfidence: 50, insights: [envelope("multiple-warning", { warning_codes: ["metric_value_unavailable", "duplicate_mapper_row_identity"] })], configuration: config });
    expect(multiple.proposed_delta).toBe(0.5);
    expect(multiple.warnings.map((item) => item.code)).toEqual(["duplicate_mapper_row_identity", "metric_value_unavailable"]);
  });

  test("invalid statuses missing insight malformed insight lineage leakage and warning contradictions fail closed", () => {
    expect(calibrateConfidence({ baseConfidence: 50, insights: [envelope("insufficient", { pattern_discovery_status: "insufficient_evidence" })], configuration: config }).status).toBe("blocked_unsupported_insight");
    expect(calibrateConfidence({ baseConfidence: 50, insights: [envelope("blocked", { pattern_discovery_status: "blocked_future_leakage" })], configuration: config }).status).toBe("blocked_unsupported_insight");
    expect(calibrateConfidence({ baseConfidence: 50, insights: [envelope("missing", { insight: null })], configuration: config }).issues[0].code).toBe("missing_insight");
    expect(calibrateConfidence({ baseConfidence: 50, insights: [{ ...envelope("malformed"), insight: { setup_family: "momentum_continuation" } } as never], configuration: config }).issues[0].code).toBe("invalid_insight_structure");
    expect(calibrateConfidence({ baseConfidence: 50, insights: [envelope("lineage", { insight_sha256: "bad" })], configuration: config }).status).toBe("blocked_invalid_lineage");
    expect(calibrateConfidence({ baseConfidence: 50, insights: [envelope("leak", { anti_leakage_status: "unknown" })], configuration: config }).status).toBe("blocked_future_leakage");
    expect(calibrateConfidence({ baseConfidence: 50, insights: [envelope("contradict", { warning_codes: ["minimum_total_support_not_met"] })], configuration: config }).status).toBe("blocked_invalid_input");
  });

  test("configuration and base confidence validation rejects hidden defaults invalid range non-finite and precision", () => {
    expect(calibrateConfidence(null as never).status).toBe("blocked_invalid_input");
    expect(calibrateConfidence({ baseConfidence: Number.NaN, insights: [envelope("nan")], configuration: config }).status).toBe("blocked_invalid_input");
    expect(calibrateConfidence({ baseConfidence: 101, insights: [envelope("range")], configuration: config }).status).toBe("blocked_invalid_input");
    expect(calibrateConfidence({ baseConfidence: 10.123, insights: [envelope("precision")], configuration: config }).status).toBe("blocked_invalid_input");
    expect(calibrateConfidence({ baseConfidence: 50, insights: [envelope("bad-config")], configuration: { ...config, combined_positive_cap_basis_points: 401 } as never }).status).toBe("blocked_invalid_configuration");
  });

  test("per-insight combined caps evidence quality and small warning attenuation are exact", () => {
    expect(calibrateConfidence({ baseConfidence: 50, insights: [withInsight("usable", { evidence_quality: "verified_usable" })], configuration: config }).proposed_delta).toBe(1);
    expect(calibrateConfidence({ baseConfidence: 50, insights: [withInsight("limited", { evidence_quality: "verified_limited" })], configuration: config }).proposed_delta).toBe(0.5);
    expect(calibrateConfidence({ baseConfidence: 50, insights: [withInsight("blocked-quality", { evidence_quality: "blocked" })], configuration: config }).status).toBe("blocked_unsupported_insight");
    const positive = calibrateConfidence({ baseConfidence: 50, insights: [envelope("p1"), envelope("p2"), envelope("p3")], configuration: config });
    expect(positive.proposed_delta).toBe(4);
    const negative = calibrateConfidence({ baseConfidence: 50, insights: ["n1", "n2", "n3"].map((id) => withInsight(id, { evidence_direction: "adverse_strong" })), configuration: config });
    expect(negative.proposed_delta).toBe(-6);
    const attenuatedSmall = calibrateConfidence({ baseConfidence: 50, insights: [withInsight("small", { evidence_direction: "supportive_weak", evidence_quality: "verified_limited" }, { warning_codes: ["metric_value_unavailable", "duplicate_mapper_row_identity"] })], configuration: config });
    expect(attenuatedSmall.status).toBe("calibrated_with_warnings");
    expect(attenuatedSmall.proposed_delta).toBe(0.04);
  });

  test("duplicates same evidence overlap conflicting overlap and distinct non-overlap are deterministic", () => {
    const duplicate = calibrateConfidence({ baseConfidence: 50, insights: [envelope("dup"), envelope("dup")], configuration: config });
    expect(duplicate.included_insight_ids).toHaveLength(1);
    expect(duplicate.overlap_summary.deduplicated_count).toBe(1);
    const first = envelope("same-a");
    const sameEvidence = envelope("same-b", { pattern_discovery_result_sha256: first.pattern_discovery_result_sha256, evidence_set_sha256: first.evidence_set_sha256 });
    const sameResult = calibrateConfidence({ baseConfidence: 50, insights: [sameEvidence, first], configuration: config });
    expect(sameResult.included_insight_ids).toHaveLength(1);
    expect(sameResult.overlap_summary.overlapping_excluded_count).toBe(1);
    const conflict = calibrateConfidence({ baseConfidence: 50, insights: [first, withInsight("conflict", { evidence_direction: "adverse_strong" }, { pattern_discovery_result_sha256: first.pattern_discovery_result_sha256, evidence_set_sha256: first.evidence_set_sha256 })], configuration: config });
    expect(conflict.status).toBe("blocked_overlapping_evidence");
    const distinct = calibrateConfidence({ baseConfidence: 50, insights: [envelope("distinct-a"), envelope("distinct-b")], configuration: config });
    expect(distinct.included_insight_ids).toHaveLength(2);
  });

  test("balanced zero lower and upper clamp warning behavior is exact", () => {
    const balanced = calibrateConfidence({ baseConfidence: 50, insights: [withInsight("bal-pos", { evidence_direction: "supportive_moderate" }), withInsight("bal-neg", { evidence_direction: "adverse_weak" })], configuration: config });
    expect(balanced.status).toBe("no_adjustment");
    expect(balanced.proposed_delta).toBe(0);
    const upper = calibrateConfidence({ baseConfidence: 99, insights: [envelope("upper")], configuration: config });
    expect(upper.proposed_calibrated_confidence).toBe(100);
    expect(upper.warnings.some((item) => item.code === "confidence_clamped_to_bounds")).toBe(true);
    const lower = calibrateConfidence({ baseConfidence: 1, insights: [withInsight("lower", { evidence_direction: "adverse_strong" })], configuration: config });
    expect(lower.proposed_calibrated_confidence).toBe(0);
    expect(lower.warnings.some((item) => item.code === "confidence_clamped_to_bounds")).toBe(true);
  });

  test("calibration ID hash canonical ordering issue ordering and warning ordering are stable", () => {
    const first = calibrateConfidence({ baseConfidence: 50, insights: [envelope("r1"), envelope("r2"), envelope("r3")], configuration: config });
    const second = calibrateConfidence({ baseConfidence: 50, insights: [envelope("r3"), envelope("r1"), envelope("r2")], configuration: config });
    expect(second).toEqual(first);
    expect(first.calibration_id).toMatch(/^confidence_calibration_v1:[a-f0-9]{24}$/);
    expect(first.calibration_hash).toMatch(/^[a-f0-9]{64}$/);
    const issueOrder = calibrateConfidence({ baseConfidence: 50, insights: [envelope("bad-a", { insight_sha256: "bad" }), envelope("bad-b", { anti_leakage_status: "failed" })], configuration: config });
    expect(issueOrder.issues.map((item) => item.code)).toEqual([...issueOrder.issues.map((item) => item.code)].sort());
  });

  test("input nested values repeated calls and interleaved calls remain immutable and deterministic", () => {
    const input = deepFreeze({ baseConfidence: 50, insights: [envelope("immutable")], configuration: clone(config) });
    const before = JSON.stringify(input);
    const first = calibrateConfidence(input);
    calibrateConfidence({ baseConfidence: 50, insights: [withInsight("interleaved", { evidence_direction: "adverse_strong" })], configuration: config });
    const second = calibrateConfidence(input);
    expect(JSON.stringify(input)).toBe(before);
    expect(second).toEqual(first);
  });

  test("no filesystem network environment persistence runtime consumer runner manifest or recommendation mutation exists", () => {
    const source = readFileSync("lib/pure-confidence-calibration.ts", "utf8");
    expect(source).not.toMatch(/process\.env|Date\.|Math\.random|fetch\(|console\.|from ["'](?:node:)?fs|@supabase|createClient|TWELVE_DATA|next\/server/i);
    expect([...files("docs"), ...files("scripts")].filter((path) => /action-420.*(?:manifest|runner|shadow|run\.mjs)/i.test(path))).toEqual([]);
    expect(files("app").some((path) => path.includes("pure-confidence-calibration") || path.includes("action-420"))).toBe(false);
    const result = calibrateConfidence({ baseConfidence: 50, insights: [envelope("advisory")], configuration: config });
    expect("recommendation" in result).toBe(false);
    expect(result.applied).toBe(false);
  });

  test("verifier and Actions 418-419 gates pass with runtime preview paused", () => {
    const report = JSON.parse(execFileSync("node", ["scripts/action-420-pure-confidence-calibration-implementation-verify.mjs"], { encoding: "utf8" }));
    expect(report.verification_status).toBe("passed");
    expect(report.implementation_status).toBe("implemented_static_pure_not_shadowed");
    for (const path of [
      "scripts/action-418-pure-confidence-calibration-contract-and-pattern-insight-compatibility-approval-gate-verify.mjs",
      "scripts/action-419-pure-confidence-calibration-implementation-approval-gate-verify.mjs",
    ]) {
      expect(JSON.parse(execFileSync("node", [path], { encoding: "utf8" })).verification_status).toBe("passed");
    }
    expect(report.runtime_preview_status).toBe("runtime_preview_waiting_for_operator_inputs");
  });
});
