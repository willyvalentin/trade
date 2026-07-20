import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";

import { expect, test } from "@playwright/test";

const docPath =
  "docs/action-458-independent-static-confidence-calibration-recommendation-advisory-projection-shadow-verification.md";
const verifierPath =
  "scripts/action-458-independent-static-confidence-calibration-recommendation-advisory-projection-shadow-verification-verify.mjs";
const expectedAction454PackageHash = "ef706460039171b45f15fea6c5aa6597b4986b53298f17843809a1941c3db072";
const expectedAction454RepeatPayloadHash = "2a717421488ef15f380625cfbcc1e7e82a3469980972e92b3627c8f82a7c2a74";
const expectedManifestHash = "2bb41c00c2d0eb29811b7b95d9ee1495db4758dc2f998794f6aeddb2691c459a";
const expectedRunPackageHash = "dcd769f27ab08b56b8e027118ebb476246382a6ba96d9dee23da36b59debb6cd";
const expectedEvidenceHash = "c1e394c78a4508af23e0141a9833a98ae4d1d4aa985ef1f1fd09771bd796beac";

type Action458Report = {
  verification_status: string;
  readiness_decision: string;
  readiness_vocabulary: string[];
  action457_reproduction_result: {
    final_shadow_decision: string;
    scenario_count: number;
    exactly_two_runs: boolean;
    repeat_run_identical: boolean;
    run_1_package_hash: string;
    run_2_package_hash: string;
    evidence_sha256: string;
  };
  manifest_inventory_integrity: {
    action454_package_inventory_sha256: string;
    action454_repeat_payload_sha256: string;
    action457_manifest_sha256: string;
    protected_sources_unchanged: boolean;
  };
  scenario_inventory: {
    count: number;
    exact_ids: string[];
    source_classifications: string[];
  };
  projection_status_distribution: Record<string, number>;
  advisory_hash_classification_distribution: Record<string, number>;
  warning_distribution: Record<string, number>;
  issue_distribution: Record<string, number>;
  confidence_effect_flags_result: string;
  validation_precedence_result: string;
  phase_11_defense_result: string;
  lineage_leakage_feedback_result: string;
  warning_issue_no_adjustment_result: string;
  projection_id_hash_result: string;
  metadata_cleanup_result: {
    metadata_only: boolean;
    temp_path_safe: boolean;
    cleanup_succeeded: boolean;
    temp_path_absent_or_empty: boolean;
    tracked_evidence_artifacts: string[];
  };
  protected_hash_results: Record<string, { unchanged: boolean }>;
  isolation: {
    app_or_lib_consumers: string[];
    runtime_artifacts: string[];
    deployment_result: string;
  };
  safety: Record<string, boolean | string>;
  runtime_preview_status: string;
  deployment_result: string;
  recommended_next_action: string;
  failed_conditions: string[];
  unresolved_conditions: string[];
  checks: Record<string, boolean>;
};

test.setTimeout(300000);

let cachedReport: Action458Report | undefined;

function runVerifier() {
  if (!cachedReport) {
    const output = execFileSync("node", [verifierPath], {
      cwd: process.cwd(),
      encoding: "utf8",
      maxBuffer: 160 * 1024 * 1024,
    });
    cachedReport = JSON.parse(output) as Action458Report;
  }
  return cachedReport;
}

test.describe("Action 458 independent static projection shadow verification", () => {
  test("documents the independent audit contract", () => {
    expect(existsSync(docPath)).toBe(true);
    expect(existsSync(verifierPath)).toBe(true);

    const doc = readFileSync(docPath, "utf8");
    for (const phrase of [
      "Purpose",
      "Scope",
      "Action 457 Result",
      "Protected-Source Audit",
      "Manifest-Integrity Audit",
      "Runner-Integrity Audit",
      "Projection-Status Distribution Audit",
      "Advisory-Hash-Classification Audit",
      "Metadata-Boundary Audit",
      "Cleanup Audit",
      "Readiness Decision",
      expectedAction454PackageHash,
      expectedAction454RepeatPayloadHash,
      expectedManifestHash,
      expectedRunPackageHash,
      expectedEvidenceHash,
      "runtime_preview_waiting_for_operator_inputs",
    ]) {
      expect(doc).toContain(phrase);
    }
  });

  test("returns ready with exact Action 457 reproduction hashes", () => {
    const report = runVerifier();

    expect(report.verification_status).toBe("passed");
    expect(report.readiness_decision).toBe("ready");
    expect(report.readiness_vocabulary).toEqual(["ready", "ready_with_conditions", "blocked"]);
    expect(report.failed_conditions).toEqual([]);
    expect(report.unresolved_conditions).toEqual([]);
    expect(report.action457_reproduction_result).toMatchObject({
      final_shadow_decision: "shadow_passed",
      scenario_count: 52,
      exactly_two_runs: true,
      repeat_run_identical: true,
      run_1_package_hash: expectedRunPackageHash,
      run_2_package_hash: expectedRunPackageHash,
      evidence_sha256: expectedEvidenceHash,
    });
  });

  test("verifies manifest, inventory, source integrity, exact IDs, and source class", () => {
    const report = runVerifier();

    expect(report.manifest_inventory_integrity).toMatchObject({
      action454_package_inventory_sha256: expectedAction454PackageHash,
      action454_repeat_payload_sha256: expectedAction454RepeatPayloadHash,
      action457_manifest_sha256: expectedManifestHash,
      protected_sources_unchanged: true,
    });
    expect(report.scenario_inventory.count).toBe(52);
    expect(report.scenario_inventory.exact_ids[0]).toBe("cp453_01");
    expect(report.scenario_inventory.exact_ids.at(-1)).toBe("cp453_52");
    expect(report.scenario_inventory.source_classifications).toEqual([
      "deterministic_test_local_projection_envelope_and_bounded_advisory_result",
    ]);
    expect(Object.values(report.protected_hash_results).every((result) => result.unchanged)).toBe(true);
  });

  test("verifies status and advisory hash attack classifications", () => {
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

  test("verifies confidence, effect flags, precedence, phase-11, lineage, warnings, issues, and no-adjustment", () => {
    const report = runVerifier();

    expect(report.confidence_effect_flags_result).toBe("matched");
    expect(report.validation_precedence_result).toBe("matched");
    expect(report.phase_11_defense_result).toBe("matched");
    expect(report.lineage_leakage_feedback_result).toBe("matched");
    expect(report.warning_issue_no_adjustment_result).toBe("matched");
    expect(report.warning_distribution).toEqual({
      duplicate_mapper_row_identity: 4,
      metric_value_unavailable: 4,
    });
    expect(report.issue_distribution.blocked_feedback_reuse).toBe(6);
  });

  test("verifies projection IDs, identity/result/scenario hashes, metadata-only evidence, cleanup, and isolation", () => {
    const report = runVerifier();

    expect(report.projection_id_hash_result).toBe("matched");
    expect(report.metadata_cleanup_result).toMatchObject({
      metadata_only: true,
      temp_path_safe: true,
      cleanup_succeeded: true,
      temp_path_absent_or_empty: true,
      tracked_evidence_artifacts: [],
    });
    expect(report.isolation.app_or_lib_consumers).toEqual([]);
    expect(report.isolation.runtime_artifacts).toEqual([]);
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
    expect(report.deployment_result).toBe("none");
    expect(report.recommended_next_action).toBe(
      "action_459_static_projection_shadow_release_gate_or_runtime_preview_approval_gate",
    );
  });
});
