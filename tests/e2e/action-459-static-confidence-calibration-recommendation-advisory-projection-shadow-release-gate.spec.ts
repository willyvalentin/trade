import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";

import { expect, test } from "@playwright/test";

const docPath = "docs/action-459-static-confidence-calibration-recommendation-advisory-projection-shadow-release-gate.md";
const verifierPath =
  "scripts/action-459-static-confidence-calibration-recommendation-advisory-projection-shadow-release-gate-verify.mjs";
const expectedReleaseClassification =
  "confidence_calibration_recommendation_advisory_projection_pure_static_verified";
const expectedNextAction =
  "action_460_confidence_calibration_recommendation_advisory_projection_runtime_preview_integration_contract_approval_gate";

type Action459Report = {
  verification_status: string;
  release_decision: string;
  release_decision_vocabulary: string[];
  release_classification: string;
  release_classification_meaning: Record<string, boolean>;
  chain_health: Record<string, boolean | string>;
  frozen_hash_result: Record<string, boolean | string | null>;
  scenario_inventory: {
    count: number;
    exact_ids: string[];
    source_classifications: string[];
  };
  projection_status_distribution: Record<string, number>;
  advisory_hash_classification_distribution: Record<string, number>;
  warning_distribution: Record<string, number>;
  issue_distribution: Record<string, number>;
  confidence_advisory_hash_result: string;
  precedence_phase11_result: string;
  warning_issue_no_adjustment_effect_flag_result: string;
  identity_determinism_result: string;
  metadata_cleanup_result: {
    bounded_metadata_only: boolean;
    temporary_evidence_deleted: boolean;
    no_tracked_evidence: boolean;
    tracked_evidence_artifacts: string[];
  };
  source_package_integrity: {
    protected_sources_unchanged: boolean;
    protected_hash_results: Record<string, { unchanged: boolean }>;
  };
  isolation: {
    app_or_lib_consumers: string[];
    runtime_artifacts: string[];
    no_consumers: boolean;
    no_confidence_application: boolean;
    no_runtime_persistence_replay_external_feedback: boolean;
  };
  safety: Record<string, boolean | string>;
  authoritative_data_result: string;
  deployment_result: string;
  runtime_preview_status: string;
  post_release_permitted_scope: string[];
  recommended_next_action: string;
  unrelated_work_classification: string;
  failed_conditions: string[];
  unresolved_conditions: string[];
  checks: Record<string, boolean>;
};

test.setTimeout(300000);

let cachedReport: Action459Report | undefined;

function runVerifier() {
  if (!cachedReport) {
    const output = execFileSync("node", [verifierPath], {
      cwd: process.cwd(),
      encoding: "utf8",
      maxBuffer: 160 * 1024 * 1024,
    });
    cachedReport = JSON.parse(output) as Action459Report;
  }
  return cachedReport;
}

test.describe("Action 459 static projection shadow release gate", () => {
  test("documents the release-gate contract", () => {
    expect(existsSync(docPath)).toBe(true);
    expect(existsSync(verifierPath)).toBe(true);

    const doc = readFileSync(docPath, "utf8");
    for (const phrase of [
      "Purpose",
      "Scope",
      "Complete Action 447-458 Chain",
      "Protected-Source Inventory",
      "Protected-Package Inventory",
      "Release Classification Vocabulary",
      "Release Decision Vocabulary",
      "Mandatory Runtime-Preview Approval Gate",
      "Deployment Prohibition",
      expectedReleaseClassification,
      expectedNextAction,
      "runtime_preview_waiting_for_operator_inputs",
    ]) {
      expect(doc).toContain(phrase);
    }
  });

  test("releases the pure static package with exact vocabulary", () => {
    const report = runVerifier();

    expect(report.verification_status).toBe("passed");
    expect(report.release_decision).toBe("released");
    expect(report.release_decision_vocabulary).toEqual(["released", "released_with_conditions", "blocked"]);
    expect(report.release_classification).toBe(expectedReleaseClassification);
    expect(report.failed_conditions).toEqual([]);
    expect(report.unresolved_conditions).toEqual([]);
  });

  test("verifies complete chain health and frozen hashes", () => {
    const report = runVerifier();

    expect(report.chain_health).toMatchObject({
      complete_action_447_458_chain: true,
      action458_static_health: true,
      action457_final_shadow_decision: "shadow_passed",
      action458_readiness_decision: "ready",
    });
    expect(report.frozen_hash_result).toMatchObject({
      action454_package_inventory_sha256: "ef706460039171b45f15fea6c5aa6597b4986b53298f17843809a1941c3db072",
      action454_repeat_payload_sha256: "2a717421488ef15f380625cfbcc1e7e82a3469980972e92b3627c8f82a7c2a74",
      action457_manifest_sha256: "2bb41c00c2d0eb29811b7b95d9ee1495db4758dc2f998794f6aeddb2691c459a",
      action457_run_package_sha256: "dcd769f27ab08b56b8e027118ebb476246382a6ba96d9dee23da36b59debb6cd",
      action457_evidence_sha256: "c1e394c78a4508af23e0141a9833a98ae4d1d4aa985ef1f1fd09771bd796beac",
      all_match: true,
    });
  });

  test("verifies exact 52 scenarios and status distribution", () => {
    const report = runVerifier();

    expect(report.scenario_inventory.count).toBe(52);
    expect(report.scenario_inventory.exact_ids[0]).toBe("cp453_01");
    expect(report.scenario_inventory.exact_ids.at(-1)).toBe("cp453_52");
    expect(report.scenario_inventory.source_classifications).toEqual([
      "deterministic_test_local_projection_envelope_and_bounded_advisory_result",
    ]);
    expect(report.projection_status_distribution).toEqual({
      projection_ready: 4,
      projection_ready_with_warnings: 3,
      projection_no_adjustment: 1,
      projection_insufficient_evidence: 1,
      blocked_invalid_input: 11,
      blocked_confidence_mismatch: 3,
      blocked_advisory_result: 11,
      blocked_invalid_lineage: 12,
      blocked_future_leakage: 5,
      blocked_unsupported_status: 1,
    });
  });

  test("verifies confidence, advisory hash, attack handling, precedence, and phase-11 defense", () => {
    const report = runVerifier();

    expect(report.advisory_hash_classification_distribution).toEqual({
      valid_advisory_hash: 42,
      malformed_hash: 1,
      swapped_hash: 1,
      unrelated_valid_format_hash: 1,
      retained_hash_tampering: 6,
      hash_role_substitution: 1,
    });
    expect(report.confidence_advisory_hash_result).toBe("matched");
    expect(report.precedence_phase11_result).toBe("matched");
    expect(report.checks.validation_precedence).toBe(true);
    expect(report.checks.phase_11_defense).toBe(true);
  });

  test("verifies warnings, issues, no-adjustment, effect flags, identity, and determinism", () => {
    const report = runVerifier();

    expect(report.warning_distribution).toEqual({
      duplicate_mapper_row_identity: 4,
      metric_value_unavailable: 4,
    });
    expect(report.issue_distribution.blocked_feedback_reuse).toBe(6);
    expect(report.warning_issue_no_adjustment_effect_flag_result).toBe("matched");
    expect(report.identity_determinism_result).toBe("matched");
    expect(report.checks.no_adjustment).toBe(true);
    expect(report.checks.effect_flags).toBe(true);
    expect(report.checks.repeat_run_determinism).toBe(true);
  });

  test("verifies metadata cleanup, source/package integrity, and approved preview-only consumer boundary", () => {
    const report = runVerifier();

    expect(report.metadata_cleanup_result).toEqual({
      bounded_metadata_only: true,
      temporary_evidence_deleted: true,
      no_tracked_evidence: true,
      tracked_evidence_artifacts: [],
    });
    expect(report.source_package_integrity.protected_sources_unchanged).toBe(true);
    expect(Object.values(report.source_package_integrity.protected_hash_results).every((result) => result.unchanged)).toBe(true);
    expect(report.isolation).toMatchObject({
      app_or_lib_consumers: [],
      runtime_artifacts: [],
      approved_action461_preview_consumer_only: true,
      no_confidence_application: true,
      no_runtime_persistence_replay_external_feedback: true,
    });
  });

  test("verifies no side effects, no authoritative data, no deployment, and paused runtime preview", () => {
    const report = runVerifier();

    expect(report.safety).toMatchObject({
      provider_call_executed: false,
      provider_call_attempted: false,
      supabase_read_executed: false,
      supabase_write_executed: false,
      persistence_executed: false,
      replay_executed: false,
      runtime_created: false,
      external_access_executed: false,
      feedback_created: false,
      recommendation_mutated: false,
      ranking_changed: false,
      scanner_changed: false,
      publication_changed: false,
      execution_changed: false,
      confidence_applied: false,
      authoritative_data_created: false,
      deployment_result: "none",
    });
    expect(report.authoritative_data_result).toBe("none");
    expect(report.deployment_result).toBe("none");
    expect(report.runtime_preview_status).toBe("runtime_preview_waiting_for_operator_inputs");
  });

  test("keeps Action 460 as the only permitted next step", () => {
    const report = runVerifier();

    expect(report.release_classification_meaning).toMatchObject({
      runtime_integration_approved: false,
      recommendation_engine_consumption_approved: false,
      ui_consumption_approved: false,
      confidence_application_approved: false,
      persistence_approved: false,
      replay_approved: false,
      production_approved: false,
      deployment_approved: false,
    });
    expect(report.post_release_permitted_scope).toEqual([
      "separate_runtime_preview_integration_contract_approval_gate_only",
    ]);
    expect(report.recommended_next_action).toBe(expectedNextAction);
    expect(report.unrelated_work_classification).toBe("action_459_static_projection_shadow_release_gate_only");
  });
});
