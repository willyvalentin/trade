import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";

import { expect, test } from "@playwright/test";

const docPath =
  "docs/action-457-static-confidence-calibration-recommendation-advisory-projection-shadow-use.md";
const manifestPath =
  "docs/action-457-static-confidence-calibration-recommendation-advisory-projection-shadow-input-manifest.json";
const runnerPath =
  "scripts/action-457-static-confidence-calibration-recommendation-advisory-projection-shadow-run.mjs";
const verifierPath =
  "scripts/action-457-static-confidence-calibration-recommendation-advisory-projection-shadow-use-verify.mjs";
const expectedPackageHash = "ef706460039171b45f15fea6c5aa6597b4986b53298f17843809a1941c3db072";
const expectedRepeatPayloadHash = "2a717421488ef15f380625cfbcc1e7e82a3469980972e92b3627c8f82a7c2a74";
const expectedManifestHash = "2bb41c00c2d0eb29811b7b95d9ee1495db4758dc2f998794f6aeddb2691c459a";
const expectedRunHash = "dcd769f27ab08b56b8e027118ebb476246382a6ba96d9dee23da36b59debb6cd";

test.setTimeout(300000);

type Action457Report = {
  verification_status: string;
  failed_conditions: string[];
  final_shadow_decision: string;
  scenario_count: number;
  repeat_run_identical: boolean;
  run_1_package_hash: string;
  run_2_package_hash: string;
  projection_status_distribution: Record<string, number>;
  advisory_hash_classification_distribution: Record<string, number>;
  warning_distribution: Record<string, number>;
  issue_distribution: Record<string, number>;
  confidence_effect_flag_result: string;
  validation_precedence_result: string;
  phase_11_defense_result: string;
  lineage_leakage_feedback_result: string;
  warning_issue_no_adjustment_result: string;
  projection_id_hash_result: string;
  manifest_sha256: string;
  metadata_only_evidence: boolean;
  temp_path_cleanup: {
    path_safety: {
      safe: boolean;
      checks: {
        no_target_symlink: boolean;
        no_parent_chain_symlink: boolean;
      };
    };
    cleanup_succeeded: boolean;
  };
  temp_path_absent_or_empty: boolean;
  tracked_evidence_artifacts: string[];
  app_or_lib_consumers: string[];
  runtime_artifacts: string[];
  safety: Record<string, boolean | string>;
  runtime_preview_status: string;
  recommended_next_action: string;
};

let cachedReport: Action457Report | undefined;

function runVerifier() {
  if (!cachedReport) {
    const output = execFileSync("node", [verifierPath], {
      cwd: process.cwd(),
      encoding: "utf8",
      maxBuffer: 160 * 1024 * 1024,
    });
    cachedReport = JSON.parse(output) as Action457Report;
  }
  return cachedReport;
}

test.describe("Action 457 static projection shadow use", () => {
  test("documents the exact static-only shadow package", () => {
    expect(existsSync(docPath)).toBe(true);
    expect(existsSync(manifestPath)).toBe(true);
    expect(existsSync(runnerPath)).toBe(true);
    expect(existsSync(verifierPath)).toBe(true);

    const doc = readFileSync(docPath, "utf8");
    for (const phrase of [
      "Action 456 Approval",
      "Exact Package Boundary",
      "No Consumer",
      "No Confidence Application",
      "No Persistence",
      "No Replay",
      "No Runtime",
      "No External Access",
      "Action 458 remains mandatory",
      expectedPackageHash,
      expectedRepeatPayloadHash,
      expectedManifestHash,
      expectedRunHash,
      "shadow_passed",
      "runtime_preview_waiting_for_operator_inputs",
    ]) {
      expect(doc).toContain(phrase);
    }
  });

  test("executes exactly 52 scenarios twice and passes deterministically", () => {
    const report = runVerifier();

    expect(report.verification_status).toBe("passed");
    expect(report.failed_conditions).toEqual([]);
    expect(report.final_shadow_decision).toBe("shadow_passed");
    expect(report.scenario_count).toBe(52);
    expect(report.repeat_run_identical).toBe(true);
    expect(report.run_1_package_hash).toBe(expectedRunHash);
    expect(report.run_2_package_hash).toBe(expectedRunHash);
  });

  test("preserves exact projection and advisory hash distributions", () => {
    const report = runVerifier();

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
    expect(report.advisory_hash_classification_distribution).toEqual({
      valid_advisory_hash: 42,
      malformed_hash: 1,
      swapped_hash: 1,
      unrelated_valid_format_hash: 1,
      retained_hash_tampering: 6,
      hash_role_substitution: 1,
    });
  });

  test("preserves warning, issue, precedence, lineage, and hash semantics", () => {
    const report = runVerifier();

    expect(report.warning_distribution).toEqual({
      duplicate_mapper_row_identity: 4,
      metric_value_unavailable: 4,
    });
    expect(report.issue_distribution.blocked_feedback_reuse).toBe(6);
    expect(report.confidence_effect_flag_result).toBe("matched");
    expect(report.validation_precedence_result).toBe("matched");
    expect(report.phase_11_defense_result).toBe("matched");
    expect(report.lineage_leakage_feedback_result).toBe("matched");
    expect(report.warning_issue_no_adjustment_result).toBe("matched");
    expect(report.projection_id_hash_result).toBe("matched");
    expect(report.manifest_sha256).toBe(expectedManifestHash);
  });

  test("uses metadata-only temp evidence and cleans it up", () => {
    const report = runVerifier();

    expect(report.metadata_only_evidence).toBe(true);
    expect(report.temp_path_cleanup.path_safety.safe).toBe(true);
    expect(report.temp_path_cleanup.path_safety.checks.no_target_symlink).toBe(true);
    expect(report.temp_path_cleanup.path_safety.checks.no_parent_chain_symlink).toBe(true);
    expect(report.temp_path_cleanup.cleanup_succeeded).toBe(true);
    expect(report.temp_path_absent_or_empty).toBe(true);
    expect(report.tracked_evidence_artifacts).toEqual([]);
  });

  test("does not add consumers, runtime artifacts, providers, persistence, replay, feedback, or deployment", () => {
    const report = runVerifier();

    expect(report.app_or_lib_consumers).toEqual([]);
    expect(report.runtime_artifacts).toEqual([]);
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
      confidence_applied: false,
      authoritative_data_created: false,
      deployment_result: "none",
    });
    expect(report.runtime_preview_status).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(report.recommended_next_action).toBe("action_458_independent_static_projection_shadow_verification");
  });
});
