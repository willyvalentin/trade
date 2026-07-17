import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join, resolve } from "path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const docPath =
  "docs/action-466-confidence-calibration-recommendation-advisory-projection-preview-candidate-materialization-and-operator-input-finalization.md";
const materializationPath =
  "docs/action-466-confidence-calibration-recommendation-advisory-projection-preview-candidate-materialization.json";
const finalizedInputPath =
  "docs/action-466-confidence-calibration-recommendation-advisory-projection-preview-finalized-operator-input-record.json";
const verifierPath =
  "scripts/action-466-confidence-calibration-recommendation-advisory-projection-preview-candidate-materialization-and-operator-input-finalization-verify.mjs";
const action464VerifierPath =
  "scripts/action-464-confidence-calibration-recommendation-advisory-projection-operator-input-capture-and-preview-activation-approval-gate-verify.mjs";
const action465VerifierPath =
  "scripts/action-465-confidence-calibration-recommendation-advisory-projection-preview-candidate-isolation-and-operator-input-completion-verify.mjs";

const action465Hash =
  "7a11d9c6697a9d89ffb3e762dd15185fda225bc8e39c80a212cd3729d05857f6";

test.setTimeout(300000);

type MaterializationRecord = {
  schema_version: string;
  action_465_candidate_inventory_hash: string;
  materialization_method: string;
  candidate_state: string;
  candidate_root_policy: string;
  candidate_file_count: number;
  candidate_runtime_file_count: number;
  candidate_test_verifier_documentation_count: number;
  candidate_paths: string[];
  candidate_classifications: Record<string, string>;
  candidate_content_hashes: Record<string, string | null>;
  materialized_candidate_inventory_hash: string;
  materialized_candidate_isolated: boolean;
  temporary_candidate_cleanup_result: string;
  deployment_performed: boolean;
  preview_activated: boolean;
  runtime_preview_state: string;
};

type FinalizedInputRecord = {
  schema_version: string;
  source_action: number;
  finalization_action: number;
  operator_inputs_changed: boolean;
  supplied_field_names: string[];
  unresolved_field_names: string[];
  invalid_field_names: string[];
  target_preview_environment: string | null;
  authorized_preview_users: string[] | null;
  access_control_mechanism: string | null;
  maximum_preview_duration_minutes: number | null;
  preview_flag_name: string;
  preview_flag_value: string | null;
  acceptable_failure_threshold: Record<string, number | null>;
  rollback_owner: string | null;
  kill_switch_owner: string | null;
  deployment_operator: string | null;
  observation_owner: string | null;
};

function read(relativePath: string): string {
  return readFileSync(join(root, relativePath), "utf8");
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(read(relativePath)) as T;
}

function runVerifier(relativePath = verifierPath) {
  return JSON.parse(
    execFileSync("node", [relativePath], {
      cwd: root,
      encoding: "utf8",
      maxBuffer: 160 * 1024 * 1024,
    }),
  );
}

function runLegacyVerifier(relativePath: string) {
  try {
    return runVerifier(relativePath);
  } catch (error) {
    const stdout = (error as { stdout?: Buffer | string }).stdout;
    if (!stdout) throw error;
    return JSON.parse(String(stdout));
  }
}

test.describe("Action 466 candidate materialization and operator input finalization", () => {
  test("documents and verifies the Action 466 static materialization contract", () => {
    expect(existsSync(join(root, docPath))).toBe(true);
    expect(existsSync(join(root, materializationPath))).toBe(true);
    expect(existsSync(join(root, finalizedInputPath))).toBe(true);
    expect(existsSync(join(root, verifierPath))).toBe(true);

    const doc = read(docPath);
    expect(doc).toContain("## Exact Action 465 Inventory Hash");
    expect(doc).toContain("## Candidate Materialization Method");
    expect(doc).toContain("## Candidate Cleanup");
    expect(doc).toContain("## Runtime-Preview State");

    const report = runVerifier();
    expect(report.verification_status).toBe("passed");
    expect(report.failed_conditions).toEqual([]);
  });

  test("keeps Action 464 artifacts readable and binds the exact Action 465 hash", () => {
    const action464 = runLegacyVerifier(action464VerifierPath);
    const action465 = runLegacyVerifier(action465VerifierPath);
    const report = runVerifier();

    expect(["passed", "failed"]).toContain(action464.verification_status);
    expect(["passed", "failed"]).toContain(action465.verification_status);
    expect(action465.candidate_inventory_hash).toBe(action465Hash);
    expect(report.action_465_candidate_inventory_hash).toBe(action465Hash);
    expect(report.checks.action464_artifacts_readable).toBe(true);
    expect(report.checks.action465_artifacts_bound).toBe(true);
    expect(["passed", "failed", "not_rerun"]).toContain(
      report.candidate_guard_results.action464_legacy_verifier_status,
    );
    expect(["passed", "failed", "not_rerun"]).toContain(
      report.candidate_guard_results.action465_legacy_verifier_status,
    );
  });

  test("records approved materialization method, safe temp policy, exact files, classifications, and hashes", () => {
    const materialization =
      readJson<MaterializationRecord>(materializationPath);
    const report = runVerifier();

    expect(materialization.schema_version).toBe(
      "action_466_candidate_materialization_v1",
    );
    expect(materialization.action_465_candidate_inventory_hash).toBe(action465Hash);
    expect(materialization.materialization_method).toBe(
      "temporary_filesystem_candidate_verified_and_removed",
    );
    expect(materialization.candidate_root_policy).toBe(
      "system_temp_ephemeral_no_path_retained",
    );
    expect(materialization.candidate_file_count).toBe(30);
    expect(materialization.candidate_runtime_file_count).toBe(7);
    expect(materialization.candidate_test_verifier_documentation_count).toBe(23);
    expect(materialization.candidate_paths).toHaveLength(30);
    expect(materialization.candidate_paths).toContain(
      "lib/confidence-calibration-recommendation-advisory-projection.ts",
    );
    expect(materialization.candidate_paths).not.toContain(
      "docs/post-trade-read-only-live-staging-migration-preflight-contract-no-commands-no-deployment.md",
    );
    expect(Object.values(materialization.candidate_classifications)).toContain(
      "verified_projection_core",
    );
    expect(Object.values(materialization.candidate_classifications)).toContain(
      "preview_ui",
    );
    expect(report.checks.materialization_maps).toBe(true);
    expect(report.checks.candidate_classifications).toBe(true);
  });

  test("verifies per-file integrity, no post-trade or secret/env paths, deterministic hash, and temp cleanup", () => {
    const materialization =
      readJson<MaterializationRecord>(materializationPath);
    const report = runVerifier();

    expect(materialization.materialized_candidate_inventory_hash).toBe(action465Hash);
    expect(materialization.materialized_candidate_isolated).toBe(true);
    expect(materialization.temporary_candidate_cleanup_result).toBe(
      "temporary_candidate_removed",
    );
    expect(report.checks.per_file_integrity).toBe(true);
    expect(report.checks.exclusions).toBe(true);
    expect(report.checks.temporary_materialization).toBe(true);
    expect(report.temporary_materialization_result).toMatchObject({
      path_safe: true,
      copied_file_count: 30,
      unexpected_files: [],
      cleanup_result: "temporary_candidate_removed",
      temp_root_exists_after_cleanup: false,
    });
    expect(report.materialized_candidate_inventory_hash).toBe(action465Hash);
  });

  test("finalizes operator input record without invented values", () => {
    const finalized = readJson<FinalizedInputRecord>(finalizedInputPath);
    const report = runVerifier();

    expect(finalized.schema_version).toBe(
      "action_466_finalized_operator_input_record_v1",
    );
    expect(finalized.source_action).toBe(465);
    expect(finalized.finalization_action).toBe(466);
    expect(finalized.operator_inputs_changed).toBe(false);
    expect(finalized.supplied_field_names).toEqual([]);
    expect(finalized.invalid_field_names).toEqual([]);
    expect(finalized.unresolved_field_names).toContain(
      "target_preview_environment",
    );
    expect(finalized.target_preview_environment).toBeNull();
    expect(finalized.authorized_preview_users).toBeNull();
    expect(finalized.access_control_mechanism).toBeNull();
    expect(finalized.maximum_preview_duration_minutes).toBeNull();
    expect(finalized.rollback_owner).toBeNull();
    expect(finalized.deployment_operator).toBeNull();
    expect(report.operator_input_decision).toBe("operator_inputs_incomplete");
    expect(report.checks.finalized_input_no_invented_values).toBe(true);
  });

  test("validates environment, access, duration, evidence, telemetry, zero thresholds, owners, and authority as unresolved", () => {
    const finalized = readJson<FinalizedInputRecord>(finalizedInputPath);
    const report = runVerifier();

    expect(finalized.preview_flag_name).toBe(
      "CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED",
    );
    expect(finalized.preview_flag_value).toBeNull();
    expect(finalized.acceptable_failure_threshold).toMatchObject({
      recommendation_render_failures: 0,
      original_confidence_mutations: 0,
      confidence_application_events: 0,
      ranking_scanner_publication_execution_effects: 0,
      add_trade_risk_sizing_effects: 0,
      production_exposure_events: 0,
      unauthorized_access_events: 0,
      raw_data_exposure_events: 0,
      route_provider_supabase_persistence_replay_feedback_events: 0,
      kill_switch_failures: 0,
      preview_unavailable_events_allowed: null,
    });
    expect(report.validation_results).toMatchObject({
      environment_unresolved: true,
      access_unresolved: true,
      duration_unresolved: true,
      evidence_telemetry_unresolved: true,
      zero_thresholds: true,
      preview_unavailable_threshold_unresolved: true,
      owners_unresolved: true,
      authority_confirmations_unresolved: true,
    });
  });

  test("returns required decisions, next action, runtime waiting state, and no effects", () => {
    const report = runVerifier();
    expect(report.candidate_decision).toBe("candidate_ready");
    expect(report.operator_input_decision).toBe("operator_inputs_incomplete");
    expect(report.readiness_decision).toBe("ready_with_conditions");
    expect(report.activation_decision).toBe("activation_approved_with_conditions");
    expect(report.next_permitted_action).toBe("action_467_operator_input_finalization_gate");
    expect(report.runtime_preview_status).toBe(
      "runtime_preview_waiting_for_operator_inputs",
    );
    expect(report.no_effect_results).toMatchObject({
      deployment_performed: false,
      flag_activated: false,
      environment_modified: false,
      netlify_config_changed: false,
      site_linked: false,
      branch_deployment_created: false,
      runtime_preview_activated: false,
      route_created: false,
      persistence_created: false,
      replay_created: false,
      provider_access_created: false,
      supabase_access_created: false,
      feedback_created: false,
      confidence_application_created: false,
      recommendation_mutation_created: false,
      ranking_changed: false,
      scanner_changed: false,
      publication_changed: false,
      execution_changed: false,
      add_trade_changed: false,
      risk_changed: false,
      position_sizing_changed: false,
    });
  });
});
