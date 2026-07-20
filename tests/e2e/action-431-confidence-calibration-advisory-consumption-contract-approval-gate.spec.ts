import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";

import { expect, test } from "@playwright/test";

type Action431Report = Readonly<{
  verification_status: string;
  approval_decision: string;
  approval_vocabulary: readonly string[];
  checks: Record<string, boolean>;
  failed_conditions: readonly string[];
  unresolved_conditions: readonly string[];
  passed_conditions_count: number;
  failed_conditions_count: number;
  unresolved_conditions_count: number;
  eligible_calibration_statuses: readonly string[];
  blocked_calibration_statuses: readonly string[];
  advisory_status_vocabulary: readonly string[];
  status_mapping: Record<string, string>;
  advisory_definition: Readonly<{
    adapter_created: boolean;
    consumption_created: boolean;
    non_authoritative: boolean;
    applied: boolean;
    recommendation_mutation_allowed: boolean;
    ranking_effect_allowed: boolean;
    scanner_effect_allowed: boolean;
    publication_effect_allowed: boolean;
  }>;
  future_api: Readonly<{
    function_name: string;
    input_type: string;
    result_type: string;
    synchronous: boolean;
    pure: boolean;
    immutable: boolean;
    deterministic: boolean;
  }>;
  future_boundary_files: readonly string[];
  future_sequence: readonly string[];
  action430_readiness: Readonly<{
    verification_status: string;
    readiness_decision: string;
    final_shadow_decision: string;
    runtime_preview_status: string;
  }>;
  action429_health: Readonly<{
    verification_status: string;
    final_shadow_decision: string;
  }>;
  consumers: Readonly<{
    adapter_path_exists: boolean;
    adapter_consumers: readonly string[];
    runtime_consumer_files: readonly string[];
    action431_files: readonly string[];
    unapproved_action431_files: readonly string[];
  }>;
  safety: Record<string, boolean>;
  runtime_preview_status: string;
  unrelated_work_classification: string;
  recommended_next_action: string;
}>;

const docPath = "docs/action-431-confidence-calibration-advisory-consumption-contract-approval-gate.md";
const verifierPath = "scripts/action-431-confidence-calibration-advisory-consumption-contract-approval-gate-verify.mjs";
const testPath = "tests/e2e/action-431-confidence-calibration-advisory-consumption-contract-approval-gate.spec.ts";

test.setTimeout(300000);

function runVerifier(): Action431Report {
  return JSON.parse(execFileSync("node", [verifierPath], { encoding: "utf8", timeout: 300000 })) as Action431Report;
}

test.describe.serial("Action 431 Confidence Calibration advisory consumption contract approval gate", () => {
  let report: Action431Report;
  let doc: string;

  test.beforeAll(() => {
    report = runVerifier();
    doc = readFileSync(docPath, "utf8");
  });

  test("documents the static approval gate and approves no implementation", () => {
    expect(existsSync(docPath)).toBe(true);
    expect(existsSync(verifierPath)).toBe(true);
    expect(existsSync(testPath)).toBe(true);
    expect(doc).toContain("Action 431 - Confidence Calibration Advisory Consumption Contract Approval Gate");
    expect(report.verification_status).toBe("passed");
    expect(report.approval_decision).toBe("approved");
    expect(report.approval_vocabulary).toEqual(["approved", "approved_with_conditions", "blocked"]);
    expect(report.failed_conditions).toEqual([]);
    expect(report.unresolved_conditions).toEqual([]);
    expect(report.failed_conditions_count).toBe(0);
    expect(report.unresolved_conditions_count).toBe(0);
    expect(report.passed_conditions_count).toBeGreaterThanOrEqual(30);
  });

  test("keeps Actions 429 and 430 healthy with runtime preview paused", () => {
    expect(report.action429_health.verification_status).toBe("passed");
    expect(report.action429_health.final_shadow_decision).toBe("shadow_passed");
    expect(report.action430_readiness.verification_status).toBe("passed");
    expect(report.action430_readiness.readiness_decision).toBe("ready");
    expect(report.action430_readiness.final_shadow_decision).toBe("shadow_passed");
    expect(report.action430_readiness.runtime_preview_status).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(report.runtime_preview_status).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(report.checks.action430_ready).toBe(true);
    expect(report.checks.action429_healthy).toBe(true);
  });

  test("freezes exact eligible blocked and advisory status vocabularies", () => {
    expect(report.eligible_calibration_statuses).toEqual([
      "calibrated",
      "calibrated_with_warnings",
      "no_adjustment",
    ]);
    expect(report.blocked_calibration_statuses).toEqual([
      "insufficient_eligible_evidence",
      "blocked_invalid_input",
      "blocked_invalid_configuration",
      "blocked_invalid_lineage",
      "blocked_future_leakage",
      "blocked_overlapping_evidence",
      "blocked_unsupported_insight",
    ]);
    expect(report.advisory_status_vocabulary).toEqual([
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
    ]);
    expect(report.status_mapping.blocked_invalid_configuration).toBe("blocked_invalid_input");
    expect(report.status_mapping.confidence_mismatch).toBe("blocked_confidence_mismatch");
    expect(report.checks.eligible_statuses_exact).toBe(true);
    expect(report.checks.advisory_status_vocabulary_exact).toBe(true);
    expect(report.checks.blocked_status_policy_exact).toBe(true);
  });

  test("freezes advisory-only original proposed and applied confidence semantics", () => {
    expect(report.advisory_definition).toEqual({
      adapter_created: false,
      consumption_created: false,
      non_authoritative: true,
      applied: false,
      recommendation_mutation_allowed: false,
      ranking_effect_allowed: false,
      scanner_effect_allowed: false,
      publication_effect_allowed: false,
    });
    expect(report.checks.advisory_only_definition).toBe(true);
    expect(report.checks.original_confidence_semantics).toBe(true);
    expect(report.checks.proposed_confidence_semantics).toBe(true);
    expect(report.checks.applied_false_semantics).toBe(true);
    expect(doc).toContain("exact equality to the calibration input base confidence");
    expect(doc).toContain("No future Action immediately following Action 431 may set `applied: true`");
  });

  test("freezes lineage anti-feedback anti-leakage and warning issue policies", () => {
    for (const check of [
      "warning_and_no_adjustment_policy",
      "issue_shape_policy",
      "lineage_fail_closed",
      "anti_feedback_policy",
      "anti_leakage_policy",
      "audit_trail_policy",
    ]) {
      expect(report.checks[check], check).toBe(true);
    }
    expect(doc).toContain("Missing or inconsistent lineage must block advisory consumption");
    expect(doc).toContain("No circular calibration lineage is allowed");
    expect(doc).toContain("same-recommendation realized result");
  });

  test("prohibits ranking scanner publication persistence runtime and feedback effects", () => {
    for (const check of [
      "ranking_scanner_publication_non_effect",
      "persistence_runtime_prohibited",
      "no_runtime_persistence_replay_provider_supabase_feedback",
      "no_recommendation_mutation",
    ]) {
      expect(report.checks[check], check).toBe(true);
    }
    expect(report.safety.provider_call_executed).toBe(false);
    expect(report.safety.supabase_write_executed).toBe(false);
    expect(report.safety.persistence_executed).toBe(false);
    expect(report.safety.replay_executed).toBe(false);
    expect(report.safety.runtime_route_created).toBe(false);
    expect(report.safety.feedback_executed).toBe(false);
    expect(report.safety.recommendation_mutated).toBe(false);
    expect(report.safety.scanner_behavior_changed).toBe(false);
    expect(report.safety.live_ranking_changed).toBe(false);
    expect(report.safety.publication_changed).toBe(false);
  });

  test("freezes Action 432 boundary and mandatory Actions 433 through 439 sequence", () => {
    expect(report.future_api.function_name).toBe("buildConfidenceCalibrationAdvisory");
    expect(report.future_api.input_type).toContain("ImmutableRecommendationConfidenceEnvelope");
    expect(report.future_api.result_type).toBe("ConfidenceCalibrationAdvisoryResult");
    expect(report.future_api.synchronous).toBe(true);
    expect(report.future_api.pure).toBe(true);
    expect(report.future_api.immutable).toBe(true);
    expect(report.future_api.deterministic).toBe(true);
    expect(report.future_boundary_files).toEqual([
      "lib/confidence-calibration-advisory-adapter.ts",
      "docs/action-432-confidence-calibration-advisory-adapter-implementation.md",
      "scripts/action-432-confidence-calibration-advisory-adapter-implementation-verify.mjs",
      "tests/e2e/action-432-confidence-calibration-advisory-adapter-implementation.spec.ts",
    ]);
    expect(report.future_sequence).toHaveLength(8);
    expect(report.future_sequence[0]).toContain("Action 432");
    expect(report.future_sequence.at(-1)).toContain("Action 439");
    expect(report.checks.future_action432_boundary_exact).toBe(true);
    expect(report.checks.future_sequence_through_439).toBe(true);
  });

  test("recognizes the exact Action 432 adapter while still blocking consumers", () => {
    expect(report.consumers.adapter_path_exists).toBe(true);
    expect(report.consumers.adapter_consumers).toEqual([]);
    expect(report.consumers.runtime_consumer_files).toEqual([]);
    expect(report.consumers.unapproved_action431_files).toEqual([]);
    expect(report.checks.exact_action432_adapter_recognized).toBe(true);
    expect(report.checks.action432_boundary_files_exact).toBe(true);
    expect(report.checks.no_recommendation_engine_consumer).toBe(true);
    expect(report.checks.no_unapproved_action431_artifacts).toBe(true);
    expect(report.unrelated_work_classification).toBe("action_431_static_advisory_consumption_contract_approval_gate_only");
    expect(report.recommended_next_action).toBe("action_433_independent_advisory_adapter_verification");
  });
});
