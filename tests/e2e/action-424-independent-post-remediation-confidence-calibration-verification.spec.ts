import { execFileSync } from "child_process";
import { createHash } from "crypto";
import { existsSync, readFileSync } from "fs";

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

type Action424Report = Readonly<{
  verification_status: string;
  readiness_decision: "ready" | "ready_with_conditions" | "blocked";
  passed_conditions_count: number;
  failed_conditions_count: number;
  unresolved_conditions_count: number;
  failed_sections: readonly string[];
  unresolved_conditions: readonly string[];
  audit_sections: Record<string, boolean>;
  unsupported_status_matrix: Record<string, Readonly<{ status: string; passed: boolean; issue_codes: readonly string[]; issue_paths: readonly string[] }>>;
  non_string_status_observation: Readonly<{ structurally_possible: boolean; observed_status: string; observed_issue_code: string | null }>;
  phase_precedence_matrix: Record<string, boolean>;
  warning_multiplicity_matrix: Record<string, boolean>;
  contradictory_warning_matrix: Record<string, boolean>;
  unsupported_issue_contract: Record<string, boolean>;
  unaffected_regression: Record<string, boolean>;
  result_and_api_contract: Record<string, boolean>;
  identity_equivalence: Record<string, boolean>;
  immutability_and_determinism: Record<string, boolean>;
  isolation_audit: Record<string, boolean>;
  upstream_audit: Record<string, boolean>;
  runtime_consumer_files: readonly string[];
  forbidden_action424_artifacts: readonly string[];
  tracked_action424_evidence_files: readonly string[];
  no_effect_flags: Record<string, boolean>;
  runtime_preview_status: string;
  runtime_preview_route_changed: boolean;
  runtime_preview_candidate_advanced: boolean;
  calibration_fixture_package_created: boolean;
  calibration_runner_created: boolean;
  calibration_manifest_created: boolean;
  calibration_shadow_executed: boolean;
  recommendation_mutation_executed: boolean;
  recommended_next_action: string;
}>;

const docPath = "docs/action-424-independent-post-remediation-confidence-calibration-verification.md";
const verifierPath = "scripts/action-424-independent-post-remediation-confidence-calibration-verification-verify.mjs";
const modulePath = "lib/pure-confidence-calibration.ts";
const expectedModuleHash = "bd913c95d04fc450f4499b18c01744da04a148e8d18cb4d9113d990ee8deaa70";

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

test.setTimeout(240000);

const sha = (label: string): string => createHash("sha256").update(label).digest("hex");
const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

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

function canonicalJson(value: unknown): string {
  return JSON.stringify(canonical(value));
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

function unsupported(status: unknown) {
  return calibrateConfidence({
    baseConfidence: 50,
    insights: [envelope("unsupported-test", { pattern_discovery_status: status as never })],
    configuration: config,
  });
}

function warningMultiplicity(code: string, count: number) {
  return calibrateConfidence({
    baseConfidence: 50,
    insights: [envelope(`warning-${code}`, {
      warning_codes: Array.from({ length: count }, () => code),
    })],
    configuration: config,
  });
}

function runVerifier(): Action424Report {
  return JSON.parse(execFileSync("node", [verifierPath], {
    encoding: "utf8",
    timeout: 240000,
  })) as Action424Report;
}

test.describe.serial("Action 424 independent post-remediation confidence calibration verification", () => {
  let report: Action424Report;

  test.beforeAll(() => {
    report = runVerifier();
  });

  test("documents independent audit boundary, readiness, and paused runtime preview", () => {
    expect(existsSync(docPath)).toBe(true);
    const doc = readFileSync(docPath, "utf8");

    expect(doc).toContain("Action 424 independently audits");
    expect(doc).toContain("Action 421 Findings");
    expect(doc).toContain("Action 423 Remediation Summary");
    expect(doc).toContain("Readiness Decision");
    expect(doc).toContain("`ready_with_conditions`");
    expect(doc).toContain("runtime_preview_waiting_for_operator_inputs");
    expect(doc).toContain("action_425_static_confidence_calibration_fixture_hash_freeze_approval_gate");
  });

  test("verifier succeeds with ready_with_conditions and no runtime effects", () => {
    expect(report.verification_status).toBe("passed");
    expect(report.readiness_decision).toBe("ready_with_conditions");
    expect(report.failed_conditions_count).toBe(0);
    expect(report.failed_sections).toEqual([]);
    expect(report.unresolved_conditions).toEqual([
      "executable_calibration_fixture_package_not_created",
      "calibration_hash_freeze_gate_pending",
      "non_string_status_structurally_impossible",
    ]);
    expect(Object.values(report.audit_sections).every(Boolean)).toBe(true);
    expect(Object.values(report.no_effect_flags).every((value) => value === false)).toBe(true);
    expect(report.runtime_preview_status).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(report.runtime_preview_route_changed).toBe(false);
    expect(report.runtime_preview_candidate_advanced).toBe(false);
    expect(report.calibration_fixture_package_created).toBe(false);
    expect(report.calibration_runner_created).toBe(false);
    expect(report.calibration_manifest_created).toBe(false);
    expect(report.calibration_shadow_executed).toBe(false);
    expect(report.recommendation_mutation_executed).toBe(false);
  });

  test("preserves source, export, API, status, and upstream integrity", () => {
    const moduleHash = createHash("sha256").update(readFileSync(modulePath)).digest("hex");
    expect(moduleHash).toBe(expectedModuleHash);
    expect(Object.values(report.result_and_api_contract).every(Boolean)).toBe(true);
    expect(Object.values(report.upstream_audit).every(Boolean)).toBe(true);
  });

  test("verifies unsupported status matrix and exact issue contract", () => {
    for (const [label, item] of Object.entries(report.unsupported_status_matrix)) {
      expect(item.passed, label).toBe(true);
      expect(item.status).toBe("blocked_unsupported_insight");
      expect(item.issue_codes).toEqual(["ineligible_pattern_discovery_status"]);
      expect(item.issue_paths).toEqual(["/insights/0/pattern_discovery_status"]);
    }
    expect(Object.values(report.unsupported_issue_contract).every(Boolean)).toBe(true);

    const uppercase = unsupported("ARBITRARY_UNSUPPORTED_STATUS");
    expect(uppercase.status).toBe("blocked_unsupported_insight");
    expect(uppercase.proposed_delta).toBeNull();
    expect(uppercase.proposed_calibrated_confidence).toBeNull();
    expect(uppercase.included_insight_ids).toEqual([]);
    expect(JSON.stringify(uppercase.issues)).not.toContain("ARBITRARY_UNSUPPORTED_STATUS");

    expect(report.non_string_status_observation.structurally_possible).toBe(false);
    expect(report.non_string_status_observation.observed_status).toBe("blocked_invalid_input");
    expect(report.non_string_status_observation.observed_issue_code).toBe("invalid_insight_envelope");
  });

  test("verifies phase precedence and warning deduplication before attenuation", () => {
    expect(Object.values(report.phase_precedence_matrix).every(Boolean)).toBe(true);
    expect(Object.values(report.warning_multiplicity_matrix).every(Boolean)).toBe(true);

    const one = warningMultiplicity("duplicate_mapper_row_identity", 1);
    const two = warningMultiplicity("duplicate_mapper_row_identity", 2);
    const three = warningMultiplicity("duplicate_mapper_row_identity", 3);
    const many = warningMultiplicity("duplicate_mapper_row_identity", 8);
    expect(canonicalJson(one)).toBe(canonicalJson(two));
    expect(canonicalJson(one)).toBe(canonicalJson(three));
    expect(canonicalJson(one)).toBe(canonicalJson(many));
    expect(one.proposed_delta).toBe(1);

    const metricOne = warningMultiplicity("metric_value_unavailable", 1);
    const metricMany = warningMultiplicity("metric_value_unavailable", 8);
    expect(canonicalJson(metricOne)).toBe(canonicalJson(metricMany));
    expect(metricOne.proposed_delta).toBe(1);
  });

  test("verifies distinct and contradictory warning behavior", () => {
    const distinctA = calibrateConfidence({
      baseConfidence: 50,
      insights: [envelope("distinct", {
        warning_codes: ["duplicate_mapper_row_identity", "metric_value_unavailable"],
      })],
      configuration: config,
    });
    const distinctB = calibrateConfidence({
      baseConfidence: 50,
      insights: [envelope("distinct", {
        warning_codes: ["metric_value_unavailable", "duplicate_mapper_row_identity"],
      })],
      configuration: config,
    });
    expect(canonicalJson(distinctA)).toBe(canonicalJson(distinctB));
    expect(distinctA.proposed_delta).toBe(0.5);
    expect(distinctA.warnings.map((warning) => warning.code)).toEqual([
      "duplicate_mapper_row_identity",
      "metric_value_unavailable",
    ]);

    expect(Object.values(report.contradictory_warning_matrix).every(Boolean)).toBe(true);
    const contradictory = calibrateConfidence({
      baseConfidence: 50,
      insights: [envelope("contradictory", {
        warning_codes: ["minimum_total_support_not_met", "minimum_total_support_not_met"],
      })],
      configuration: config,
    });
    expect(contradictory.status).toBe("blocked_invalid_input");
    expect(contradictory.issues).toHaveLength(1);
    expect(contradictory.issues[0].code).toBe("warning_status_contradiction");
    expect(contradictory.proposed_delta).toBeNull();
    expect(contradictory.adjustments).toEqual([]);
  });

  test("verifies unaffected behavior, identity equivalence, immutability, and determinism", () => {
    expect(Object.values(report.unaffected_regression).every(Boolean)).toBe(true);
    expect(Object.values(report.identity_equivalence).every(Boolean)).toBe(true);
    expect(Object.values(report.immutability_and_determinism).every(Boolean)).toBe(true);

    const frozen = deepFreeze(clone({
      baseConfidence: 50,
      insights: [withInsight("immutable", { evidence_direction: "adverse_strong" })],
      configuration: config,
    }));
    const before = canonicalJson(frozen);
    const first = calibrateConfidence(frozen);
    const second = calibrateConfidence(frozen);
    expect(canonicalJson(frozen)).toBe(before);
    expect(canonicalJson(first)).toBe(canonicalJson(second));
    expect(first.calibration_id).toMatch(/^confidence_calibration_v1:[a-f0-9]{24}$/);
  });

  test("verifies isolation, no consumers, no fixtures, and no forbidden artifacts", () => {
    expect(Object.values(report.isolation_audit).every(Boolean)).toBe(true);
    expect(report.runtime_consumer_files).toEqual([]);
    expect(report.forbidden_action424_artifacts).toEqual([]);
    expect(report.tracked_action424_evidence_files).toEqual([]);
    expect(report.recommended_next_action).toBe(
      "action_425_static_confidence_calibration_fixture_hash_freeze_approval_gate",
    );
  });
});

