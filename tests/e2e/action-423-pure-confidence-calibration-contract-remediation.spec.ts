import { execFileSync } from "child_process";
import { createHash } from "crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "fs";
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

type Action423Report = Readonly<{
  verification_status: string;
  remediation_status: string;
  checks: Record<string, boolean>;
  failed_checks: readonly string[];
  failed_conditions_count: number;
  unsupported_status_checks: Record<string, boolean>;
  validation_precedence: Record<string, boolean>;
  warning_equivalence: Record<string, boolean>;
  preservation: Record<string, boolean>;
  upstream: Readonly<{
    action420_verification_status: string | null;
    action421_verification_status: string | null;
    action421_readiness_decision: string | null;
    action422_verification_status: string | null;
    action422_approval_decision: string | null;
  }>;
  forbidden_action423_artifacts: readonly string[];
  tracked_action423_evidence_files: readonly string[];
  runtime_consumer_files: readonly string[];
  no_effect_flags: Record<string, boolean>;
  runtime_preview_status: string;
  runtime_preview_route_changed: boolean;
  runtime_preview_candidate_advanced: boolean;
  fixture_or_hash_freeze_allowed_next: boolean;
  mandatory_followup_action: string;
  recommended_next_action: string;
}>;

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

const docPath = "docs/action-423-pure-confidence-calibration-contract-remediation.md";
const verifierPath = "scripts/action-423-pure-confidence-calibration-contract-remediation-verify.mjs";
const modulePath = "lib/pure-confidence-calibration.ts";
const expectedModuleHash = "bd913c95d04fc450f4499b18c01744da04a148e8d18cb4d9113d990ee8deaa70";

test.setTimeout(240000);

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const sha = (label: string) => createHash("sha256").update(label).digest("hex");
const canonicalJson = (value: unknown): string => JSON.stringify(canonical(value));

function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [
      key,
      canonical((value as Record<string, unknown>)[key]),
    ]));
  }
  return value;
}

function files(path: string): string[] {
  if (!existsSync(path)) return [];
  if (statSync(path).isFile()) return [path];
  return readdirSync(path).flatMap((name) => files(join(path, name))).sort();
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    Object.values(value as Record<string, unknown>).forEach(deepFreeze);
  }
  return value;
}

function envelope(
  id: string,
  overrides: Partial<Mutable<ConfidenceCalibrationInsightEnvelope>> = {},
): ConfidenceCalibrationInsightEnvelope {
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

function runVerifier(): Action423Report {
  return JSON.parse(execFileSync("node", [verifierPath], {
    encoding: "utf8",
    timeout: 240000,
  })) as Action423Report;
}

test.describe.serial("Action 423 pure Confidence Calibration contract remediation", () => {
  let report: Action423Report;

  test.beforeAll(() => {
    report = runVerifier();
  });

  test("documents the narrow remediation boundary and mandatory Action 424 audit", () => {
    expect(existsSync(docPath)).toBe(true);
    const doc = readFileSync(docPath, "utf8");

    expect(doc).toContain("Action 422 approved");
    expect(doc).toContain("Action 424 - Independent Post-Remediation Confidence Calibration Verification");
    expect(doc).toContain("Runtime preview remains paused at `runtime_preview_waiting_for_operator_inputs`");
    expect(doc).toContain("warning codes are sorted and semantically deduplicated before attenuation");
    expect(doc).toContain("No public helper, type, status, route, runner, fixture, manifest, or shadow surface was added");
    expect(doc).toContain("provider calls: no");
    expect(doc).toContain("Supabase reads/writes: no");
    expect(doc).toContain("scanner behavior change: no");
    expect(doc).toContain("live ranking change: no");
  });

  test("verifier passes and keeps all no-effect flags false", () => {
    expect(report.verification_status).toBe("passed");
    expect(report.remediation_status).toBe("implemented");
    expect(report.failed_checks).toEqual([]);
    expect(report.failed_conditions_count).toBe(0);
    expect(Object.values(report.checks).every(Boolean)).toBe(true);
    expect(Object.values(report.no_effect_flags).every((value) => value === false)).toBe(true);
    expect(report.runtime_preview_status).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(report.runtime_preview_route_changed).toBe(false);
    expect(report.runtime_preview_candidate_advanced).toBe(false);
    expect(report.fixture_or_hash_freeze_allowed_next).toBe(false);
    expect(report.mandatory_followup_action).toBe(
      "Action 424 - Independent Post-Remediation Confidence Calibration Verification",
    );
    expect(report.recommended_next_action).toBe(
      "action_424_independent_post_remediation_confidence_calibration_verification",
    );
  });

  test("unsupported Pattern Discovery statuses all return blocked_unsupported_insight", () => {
    for (const status of [
      "insufficient_evidence",
      "blocked_invalid_input",
      "blocked_invalid_configuration",
      "blocked_invalid_lineage",
      "blocked_future_leakage",
      "blocked_non_consumable_row",
      "blocked_nondeterministic_grouping",
      "arbitrary_unsupported_status",
    ]) {
      const result = calibrateConfidence({
        baseConfidence: 50,
        insights: [envelope(`unsupported-${status}`, { pattern_discovery_status: status as never })],
        configuration: config,
      });

      expect(result.status).toBe("blocked_unsupported_insight");
      expect(result.proposed_delta).toBeNull();
      expect(result.proposed_calibrated_confidence).toBeNull();
      expect(result.included_insight_ids).toEqual([]);
      expect(result.issues).toEqual([{
        code: "ineligible_pattern_discovery_status",
        path: "/insights/0/pattern_discovery_status",
        severity: "error",
        messageKey: "confidence_calibration.ineligible_pattern_discovery_status",
      }]);
      expect(canonicalJson(result)).not.toContain(status);
    }
    expect(Object.values(report.unsupported_status_checks).every(Boolean)).toBe(true);
  });

  test("status eligibility stays phase 6 and outranks later validation faults", () => {
    const invalidInsight = calibrateConfidence({
      baseConfidence: 50,
      insights: [envelope("unsupported-invalid-insight", {
        pattern_discovery_status: "blocked_non_consumable_row",
        insight: { setup_family: "momentum_continuation" } as never,
      })],
      configuration: config,
    });
    const invalidLineage = calibrateConfidence({
      baseConfidence: 50,
      insights: [envelope("unsupported-lineage", {
        pattern_discovery_status: "blocked_nondeterministic_grouping",
        insight_sha256: "bad",
      })],
      configuration: config,
    });
    const failedLeakage = calibrateConfidence({
      baseConfidence: 50,
      insights: [envelope("unsupported-leakage", {
        pattern_discovery_status: "blocked_future_leakage",
        anti_leakage_status: "failed",
      })],
      configuration: config,
    });
    const warningContradiction = calibrateConfidence({
      baseConfidence: 50,
      insights: [envelope("unsupported-warning", {
        pattern_discovery_status: "blocked_invalid_input",
        warning_codes: ["minimum_total_support_not_met"],
      })],
      configuration: config,
    });
    const qualityFault = calibrateConfidence({
      baseConfidence: 50,
      insights: [withInsight("unsupported-quality", { evidence_quality: "blocked" }, {
        pattern_discovery_status: "blocked_invalid_configuration",
      })],
      configuration: config,
    });
    const first = envelope("unsupported-overlap-a", { pattern_discovery_status: "blocked_invalid_lineage" });
    const overlapFault = calibrateConfidence({
      baseConfidence: 50,
      insights: [
        first,
        withInsight("unsupported-overlap-b", { evidence_direction: "adverse_strong" }, {
          pattern_discovery_status: "blocked_invalid_lineage",
          pattern_discovery_result_sha256: first.pattern_discovery_result_sha256,
          evidence_set_sha256: first.evidence_set_sha256,
        }),
      ],
      configuration: config,
    });

    for (const result of [
      invalidInsight,
      invalidLineage,
      failedLeakage,
      warningContradiction,
      qualityFault,
      overlapFault,
    ]) {
      expect(result.status).toBe("blocked_unsupported_insight");
      expect(result.issues[0].code).toBe("ineligible_pattern_discovery_status");
    }
    expect(Object.values(report.validation_precedence).every(Boolean)).toBe(true);
  });

  test("warning codes are sorted and deduped before attenuation", () => {
    const unique = calibrateConfidence({
      baseConfidence: 50,
      insights: [envelope("duplicate-warning", { warning_codes: ["duplicate_mapper_row_identity"] })],
      configuration: config,
    });
    const double = calibrateConfidence({
      baseConfidence: 50,
      insights: [envelope("duplicate-warning", {
        warning_codes: ["duplicate_mapper_row_identity", "duplicate_mapper_row_identity"],
      })],
      configuration: config,
    });
    const triple = calibrateConfidence({
      baseConfidence: 50,
      insights: [envelope("duplicate-warning", {
        warning_codes: [
          "duplicate_mapper_row_identity",
          "duplicate_mapper_row_identity",
          "duplicate_mapper_row_identity",
        ],
      })],
      configuration: config,
    });
    const twoDistinct = calibrateConfidence({
      baseConfidence: 50,
      insights: [envelope("two-distinct", {
        warning_codes: ["metric_value_unavailable", "duplicate_mapper_row_identity"],
      })],
      configuration: config,
    });
    const orderA = calibrateConfidence({
      baseConfidence: 50,
      insights: [envelope("warning-order", {
        warning_codes: ["metric_value_unavailable", "duplicate_mapper_row_identity"],
      })],
      configuration: config,
    });
    const orderB = calibrateConfidence({
      baseConfidence: 50,
      insights: [envelope("warning-order", {
        warning_codes: ["duplicate_mapper_row_identity", "metric_value_unavailable"],
      })],
      configuration: config,
    });
    const contradictory = calibrateConfidence({
      baseConfidence: 50,
      insights: [envelope("contradictory", {
        warning_codes: ["minimum_total_support_not_met", "minimum_total_support_not_met"],
      })],
      configuration: config,
    });

    expect(double).toEqual(unique);
    expect(triple).toEqual(unique);
    expect(unique.proposed_delta).toBe(1);
    expect(unique.adjustments[0].warning_codes).toEqual(["duplicate_mapper_row_identity"]);
    expect(twoDistinct.proposed_delta).toBe(0.5);
    expect(twoDistinct.adjustments[0].warning_codes).toEqual([
      "duplicate_mapper_row_identity",
      "metric_value_unavailable",
    ]);
    expect(orderB).toEqual(orderA);
    expect(contradictory.status).toBe("blocked_invalid_input");
    expect(contradictory.issues).toHaveLength(1);
    expect(contradictory.issues[0].code).toBe("warning_status_contradiction");
    expect(Object.values(report.warning_equivalence).every(Boolean)).toBe(true);
  });

  test("preserves public API, result vocabulary, deltas, caps, overlap, bounds, identity, and determinism", () => {
    const source = readFileSync(modulePath, "utf8");
    const sourceHash = createHash("sha256").update(readFileSync(modulePath)).digest("hex");

    expect(sourceHash).toBe(expectedModuleHash);
    expect([...source.matchAll(/^export function (\w+)/gm)].map((match) => match[1])).toEqual([
      "calibrateConfidence",
    ]);
    expect([...source.matchAll(/^export type (\w+)/gm)].map((match) => match[1])).toEqual([
      "ConfidenceCalibrationInsightEnvelope",
      "FrozenConfidenceCalibrationConfiguration",
      "ConfidenceCalibrationIssue",
      "ConfidenceCalibrationWarning",
      "ConfidenceCalibrationEvidenceSummary",
      "ConfidenceCalibrationAdjustment",
      "ConfidenceCalibrationResult",
    ]);

    expect(calibrateConfidence({ baseConfidence: 50, insights: [envelope("supportive")], configuration: config })).toMatchObject({
      status: "calibrated",
      proposed_delta: 2,
      proposed_calibrated_confidence: 52,
    });
    expect(calibrateConfidence({ baseConfidence: 50, insights: [withInsight("adverse", { evidence_direction: "adverse_strong" })], configuration: config }).proposed_delta).toBe(-3);
    expect(calibrateConfidence({ baseConfidence: 50, insights: [withInsight("neutral", { evidence_direction: "neutral" })], configuration: config }).status).toBe("no_adjustment");
    expect(calibrateConfidence({ baseConfidence: 50, insights: [envelope("p1"), envelope("p2"), envelope("p3")], configuration: config }).proposed_delta).toBe(4);
    expect(calibrateConfidence({ baseConfidence: 50, insights: ["n1", "n2", "n3"].map((id) => withInsight(id, { evidence_direction: "adverse_strong" })), configuration: config }).proposed_delta).toBe(-6);

    const first = envelope("overlap-a");
    expect(calibrateConfidence({
      baseConfidence: 50,
      insights: [
        first,
        withInsight("overlap-b", { evidence_direction: "adverse_strong" }, {
          pattern_discovery_result_sha256: first.pattern_discovery_result_sha256,
          evidence_set_sha256: first.evidence_set_sha256,
        }),
      ],
      configuration: config,
    }).status).toBe("blocked_overlapping_evidence");
    expect(calibrateConfidence({ baseConfidence: 99, insights: [envelope("upper")], configuration: config }).proposed_calibrated_confidence).toBe(100);
    expect(calibrateConfidence({ baseConfidence: 1, insights: [withInsight("lower", { evidence_direction: "adverse_strong" })], configuration: config }).proposed_calibrated_confidence).toBe(0);

    const frozenInput = deepFreeze({ baseConfidence: 50, insights: [envelope("immutable")], configuration: clone(config) });
    const before = canonicalJson(frozenInput);
    const firstRun = calibrateConfidence(frozenInput);
    const secondRun = calibrateConfidence(frozenInput);
    expect(canonicalJson(frozenInput)).toBe(before);
    expect(secondRun).toEqual(firstRun);
    expect(firstRun.calibration_id).toMatch(/^confidence_calibration_v1:[a-f0-9]{24}$/);
    expect(firstRun.calibration_hash).toMatch(/^[a-f0-9]{64}$/);
    expect(Object.values(report.preservation).every(Boolean)).toBe(true);
  });

  test("does not add fixture, runner, manifest, shadow, runtime, persistence, provider, Supabase, or scanner surfaces", () => {
    expect(report.forbidden_action423_artifacts).toEqual([]);
    expect(report.tracked_action423_evidence_files).toEqual([]);
    expect(report.runtime_consumer_files).toEqual([]);
    expect(report.upstream).toMatchObject({
      action420_verification_status: "passed",
      action421_verification_status: "passed",
      action421_readiness_decision: "ready_with_conditions",
      action422_verification_status: "passed",
      action422_approval_decision: "approved",
    });

    const action423Files = [...files("docs"), ...files("scripts"), ...files("tests")]
      .filter((path) => /action-423/.test(path));
    expect(action423Files.sort()).toEqual([
      docPath,
      verifierPath,
      "tests/e2e/action-423-pure-confidence-calibration-contract-remediation.spec.ts",
    ].sort());
  });
});
