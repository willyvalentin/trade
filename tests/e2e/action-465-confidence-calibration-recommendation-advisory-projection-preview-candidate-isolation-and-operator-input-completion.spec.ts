import { execFileSync } from "child_process";
import { createHash } from "crypto";
import { existsSync, readFileSync } from "fs";
import { join, resolve } from "path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const docPath =
  "docs/action-465-confidence-calibration-recommendation-advisory-projection-preview-candidate-isolation-and-operator-input-completion.md";
const inputRecordPath =
  "docs/action-465-confidence-calibration-recommendation-advisory-projection-preview-operator-input-record.json";
const inventoryPath =
  "docs/action-465-confidence-calibration-recommendation-advisory-projection-preview-candidate-inventory.json";
const verifierPath =
  "scripts/action-465-confidence-calibration-recommendation-advisory-projection-preview-candidate-isolation-and-operator-input-completion-verify.mjs";
const action463VerifierPath =
  "scripts/action-463-confidence-calibration-recommendation-advisory-projection-preview-deployment-readiness-gate-verify.mjs";
const action464VerifierPath =
  "scripts/action-464-confidence-calibration-recommendation-advisory-projection-operator-input-capture-and-preview-activation-approval-gate-verify.mjs";

test.setTimeout(300000);

type InventoryFile = {
  path: string;
  classification: string;
  content_sha256: string | null;
  action_provenance: string;
  inclusion_status: string;
};

type CandidateInventory = {
  inventory_schema_version: string;
  candidate_classification: string;
  candidate_isolated: boolean;
  allowed_classifications: string[];
  files: InventoryFile[];
  candidate_inventory_hash: string;
};

function read(relativePath: string): string {
  return readFileSync(join(root, relativePath), "utf8");
}

function readJson(relativePath: string) {
  return JSON.parse(read(relativePath));
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

function stable(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, nested]) => [key, stable(nested)]),
    );
  }
  return value;
}

function sha256(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

function inventoryHash(inventory: CandidateInventory): string {
  return sha256(
    JSON.stringify(
      stable({
        inventory_schema_version: inventory.inventory_schema_version,
        candidate_classification: inventory.candidate_classification,
        files: inventory.files.map((file) => ({
          path: file.path,
          classification: file.classification,
          content_sha256: file.content_sha256,
          action_provenance: file.action_provenance,
          inclusion_status: file.inclusion_status,
        })),
      }),
    ),
  );
}

test.describe("Action 465 candidate isolation and operator input completion", () => {
  test("documents and verifies the static Action 465 contract", () => {
    expect(existsSync(join(root, docPath))).toBe(true);
    expect(existsSync(join(root, inputRecordPath))).toBe(true);
    expect(existsSync(join(root, inventoryPath))).toBe(true);
    expect(existsSync(join(root, verifierPath))).toBe(true);

    const doc = read(docPath);
    expect(doc).toContain("## Action 464 Decision");
    expect(doc).toContain("## Candidate Inventory");
    expect(doc).toContain("## Operator-Input Decision");
    expect(doc).toContain("## No-Deployment/No-Activation Confirmation");

    const report = runVerifier();
    expect(report.verification_status).toBe("passed");
    expect(report.failed_conditions).toEqual([]);
  });

  test("preserves Action 463 and 464 readiness while moving to Action 466 as a non-deploying next step", () => {
    const action463 = runVerifier(action463VerifierPath);
    const action464 = runVerifier(action464VerifierPath);
    const report = runVerifier();

    expect(action463.verification_status).toBe("passed");
    expect(action464.verification_status).toBe("passed");
    expect(report.checks.action463_healthy).toBe(true);
    expect(report.checks.action464_healthy).toBe(true);
    expect(report.next_permitted_action).toBe(
      "action_466_preview_candidate_materialization_and_operator_input_finalization",
    );
  });

  test("keeps the input record bounded, null for unsupplied values, and free of invented operators or environments", () => {
    const inputRecord = readJson(inputRecordPath);
    const report = runVerifier();

    expect(inputRecord.schema_version).toBe("action_465_operator_input_record_v1");
    expect(inputRecord.preview_flag_name).toBe(
      "CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED",
    );
    expect(inputRecord.target_preview_environment).toBeNull();
    expect(inputRecord.authorized_preview_users).toBeNull();
    expect(inputRecord.maximum_preview_duration_minutes).toBeNull();
    expect(inputRecord.rollback_owner).toBeNull();
    expect(inputRecord.deployment_operator).toBeNull();
    expect(inputRecord.deployment_candidate_isolated).toBe(false);
    expect(inputRecord.deployment_candidate_inventory_hash).toBeNull();
    expect(report.supplied_operator_inputs).toEqual({});
    expect(report.operator_input_decision).toBe("operator_inputs_incomplete");
    expect(report.checks.no_invented_operator_values).toBe(true);
  });

  test("freezes zero thresholds and leaves preview unavailable threshold unresolved", () => {
    const inputRecord = readJson(inputRecordPath);
    const threshold = inputRecord.acceptable_failure_threshold;

    expect(threshold).toMatchObject({
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
    });
    expect(threshold.preview_unavailable_events_allowed).toBeNull();

    const report = runVerifier();
    expect(report.validation_results.zero_thresholds).toBe(true);
    expect(report.validation_results.preview_unavailable_threshold_unresolved).toBe(
      true,
    );
  });

  test("records candidate inventory schema, classifications, required preview files, exclusions, and deterministic hash", () => {
    const inventory = readJson(inventoryPath) as CandidateInventory;
    const report = runVerifier();
    const paths = inventory.files.map((file) => file.path);

    expect(inventory.inventory_schema_version).toBe(
      "action_465_candidate_inventory_v1",
    );
    expect(inventory.candidate_classification).toBe(
      "candidate_inventory_prepared_but_not_materialized",
    );
    expect(inventory.candidate_isolated).toBe(false);
    expect(new Set(inventory.allowed_classifications)).toEqual(
      new Set([
        "verified_projection_core",
        "preview_flag",
        "preview_adapter",
        "preview_ui",
        "recommendation_detail_integration",
        "required_existing_dependency",
        "static_release_artifact",
        "verification_artifact",
        "test_artifact",
        "documentation_artifact",
      ]),
    );
    expect(paths).toContain(
      "lib/confidence-calibration-recommendation-advisory-projection.ts",
    );
    expect(paths).toContain(
      "lib/confidence-calibration-recommendation-advisory-projection-preview-flag.ts",
    );
    expect(paths).toContain(
      "components/recommendations/ConfidenceCalibrationProjectionPreview.tsx",
    );
    expect(paths).not.toContain(
      "supabase/migrations/20260710000000_create_execution_authorization_consumptions.sql",
    );
    expect(inventory.candidate_inventory_hash).toBe(inventoryHash(inventory));
    expect(report.candidate_inventory_hash).toBe(inventory.candidate_inventory_hash);
    expect(report.checks.inventory_hash_reproduces).toBe(true);
  });

  test("keeps candidate metadata repo-relative, secret-free, and source-safe", () => {
    const inventory = readJson(inventoryPath) as CandidateInventory;
    const report = runVerifier();

    expect(
      inventory.files.every(
        (file) =>
          !file.path.startsWith("/") && !/^[A-Za-z]:[\\/]/.test(file.path),
      ),
    ).toBe(true);
    expect(inventory.files.map((file) => file.path).join("\n")).not.toMatch(
      /password|token|secret|private[_ -]?key|credential/i,
    );
    expect(report.secret_file_count).toBe(0);
    expect(report.environment_file_count).toBe(0);
    expect(report.checks.no_absolute_paths).toBe(true);
    expect(report.checks.no_secret_or_environment_files).toBe(true);
  });

  test("distinguishes broader dirty-tree failure from proposed-candidate pass", () => {
    const report = runVerifier();
    expect(report.excluded_file_count).toBe(317);
    expect(report.excluded_post_trade_file_count).toBe(40);
    expect(report.checks.dirty_tree_counts).toBe(true);
    expect(report.actions_318_320_result).toMatchObject({
      broader_worktree_guard_result: "failed_dirty_worktree_unclassified_files",
      proposed_candidate_guard_result: "passed_no_unclassified_candidate_files",
    });
    expect(report.proposed_candidate_guard_result).toBe(
      "passed_no_unclassified_candidate_files",
    );
  });

  test("keeps environment, access, duration, evidence, telemetry, owners, and authority unresolved", () => {
    const report = runVerifier();
    expect(report.validation_results).toMatchObject({
      target_environment_unresolved: true,
      access_unresolved: true,
      duration_unresolved: true,
      evidence_telemetry_unresolved: true,
      owners_unresolved: true,
      authority_confirmations_unresolved: true,
    });
  });

  test("returns candidate and readiness decisions with no deployment, activation, route, persistence, replay, provider, Supabase, feedback, or engine effects", () => {
    const report = runVerifier();
    expect(report.candidate_decision).toBe("candidate_ready_with_conditions");
    expect(report.operator_input_decision).toBe("operator_inputs_incomplete");
    expect(report.readiness_decision).toBe("ready_with_conditions");
    expect(report.activation_decision).toBe("activation_approved_with_conditions");
    expect(report.runtime_preview_status).toBe(
      "runtime_preview_waiting_for_operator_inputs",
    );
    expect(report.no_effect_results).toMatchObject({
      deployment_performed: false,
      flag_activated: false,
      environment_modified: false,
      netlify_config_changed: false,
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
    expect(report.checks.no_routes_added_for_preview).toBe(true);
  });
});
