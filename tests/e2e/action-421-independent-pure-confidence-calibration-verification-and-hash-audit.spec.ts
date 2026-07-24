import { execFileSync } from "child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

import { expect, test } from "@playwright/test";

type Action421Report = Readonly<{
  verification_status: string;
  readiness_decision: string;
  readiness_vocabulary: readonly string[];
  audit_sections: Record<string, boolean>;
  passed_conditions_count: number;
  failed_conditions_count: number;
  failed_sections: readonly string[];
  unresolved_conditions: readonly string[];
  source_integrity: Record<string, Readonly<{
    expected: string;
    before: string | null;
    after: string | null;
    before_matches_expected: boolean;
    after_matches_expected: boolean;
    unchanged_during_audit: boolean;
  }>>;
  export_surface: Readonly<{
    runtime_exports_from_source: readonly string[];
    type_exports_from_source: readonly string[];
    runtime_function_available: boolean;
    class_service_adapter_repository_cache_singleton_absent: boolean;
  }>;
  validation_precedence: Record<string, boolean>;
  base_confidence: Record<string, boolean>;
  eligibility: Record<string, boolean>;
  warning_compatibility: Record<string, boolean>;
  direction_delta_audit: Record<string, boolean>;
  evidence_quality_audit: Record<string, boolean>;
  attenuation: Record<string, boolean>;
  duplicates_and_overlap: Record<string, boolean>;
  caps_and_aggregation: Record<string, boolean>;
  confidence_bounds_and_clamping: Record<string, boolean>;
  zero_adjustment: Record<string, boolean>;
  result_contracts: Record<string, boolean>;
  representative_identity_hashes: Record<string, Readonly<{
    calibration_id?: string;
    calibration_hash?: string;
    independent_hash_matches: boolean;
    id_prefix_ok?: boolean;
    id_suffix_ok?: boolean;
    order_stable?: boolean;
  }>>;
  identity_change_audit: Record<string, boolean>;
  advisory_output: Record<string, boolean>;
  immutability_and_determinism: Record<string, boolean>;
  isolation: Readonly<{
    module_has_no_forbidden_imports: boolean;
    no_runtime_consumers: boolean;
    no_runner_manifest_shadow: boolean;
    runtime_consumer_files: readonly string[];
    forbidden_artifacts_found: readonly string[];
    tracked_action421_evidence_files: readonly string[];
  }>;
  upstream: Readonly<{
    action419_verification_status: string;
    action420_verification_status: string;
    action420_implementation_status: string;
  }>;
  no_effect_flags: Record<string, boolean>;
  runtime_preview_status: string;
  fixture_hash_freeze_readiness: string;
  unrelated_work_classification: string;
  next_permitted_action: string;
}>;

const docPath = "docs/action-421-independent-pure-confidence-calibration-verification-and-hash-audit.md";
const verifierPath = "scripts/action-421-independent-pure-confidence-calibration-verification-and-hash-audit-verify.mjs";
const implementationHash = "bd913c95d04fc450f4499b18c01744da04a148e8d18cb4d9113d990ee8deaa70";

test.setTimeout(240000);

function runVerifier(): Action421Report {
  const isolatedTmp = mkdtempSync(join(tmpdir(), "action-421-confidence-audit-"));
  try {
    return JSON.parse(execFileSync("node", [verifierPath], {
      encoding: "utf8",
      env: { ...process.env, TMPDIR: isolatedTmp, TMP: isolatedTmp, TEMP: isolatedTmp },
      timeout: 240000,
    })) as Action421Report;
  } finally {
    rmSync(isolatedTmp, { recursive: true, force: true });
  }
}

function allTrue(record: Record<string, boolean>): boolean {
  return Object.values(record).every((value) => value === true);
}

test.describe.serial("Action 421 independent pure Confidence Calibration verification and hash audit", () => {
  let report: Action421Report;

  test.beforeAll(() => {
    report = runVerifier();
  });

  test("documents the verification-only scope, readiness vocabulary, findings, and safety locks", () => {
    expect(existsSync(docPath)).toBe(true);
    const doc = readFileSync(docPath, "utf8");

    expect(doc).toContain("Readiness decision: `blocked`");
    expect(doc).toContain("`ready`");
    expect(doc).toContain("`ready_with_conditions`");
    expect(doc).toContain("`blocked`");
    expect(doc).toContain("Source And Export Integrity");
    expect(doc).toContain("Validation Order Finding");
    expect(doc).toContain("Eligibility Finding");
    expect(doc).toContain("Warning Compatibility Finding");
    expect(doc).toContain("duplicate_warning_codes_are_output_deduped_but_still_apply_repeated_attenuation");
    expect(doc).toContain("runtime_preview_waiting_for_operator_inputs");
    expect(doc).toContain("no provider calls");
    expect(doc).toContain("no Supabase reads or writes");
    expect(doc).toContain("no replay");
    expect(doc).toContain("no recommendation mutation");
    expect(doc).toContain("no scanner behavior change");
    expect(doc).toContain("no live ranking change");
  });

  test("verifier passes as an audit while blocking downstream readiness on explicit findings", () => {
    expect(report.verification_status).toBe("passed");
    expect(report.readiness_vocabulary).toEqual(["ready", "ready_with_conditions", "blocked"]);
    expect(report.readiness_decision).toBe("ready_with_conditions");
    expect(report.fixture_hash_freeze_readiness).toBe("ready_for_action_424_independent_audit");
    expect(report.next_permitted_action).toBe("action_424_independent_post_remediation_confidence_calibration_verification");
    expect(report.passed_conditions_count).toBe(22);
    expect(report.failed_conditions_count).toBe(0);
    expect(report.failed_sections).toEqual([]);
    expect(report.unresolved_conditions).toEqual([
      "executable_calibration_fixture_package_not_created",
      "calibration_hash_freeze_gate_pending_action_424",
      "attenuation_to_zero_case_not_reachable_with_current_delta_quality_warning_table",
    ]);
  });

  test("source hashes and export surface remain frozen", () => {
    expect(report.source_integrity["lib/pure-confidence-calibration.ts"]).toMatchObject({
      expected: implementationHash,
      before: implementationHash,
      after: implementationHash,
      before_matches_expected: true,
      after_matches_expected: true,
      unchanged_during_audit: true,
    });
    expect(Object.values(report.source_integrity).every((entry) =>
      entry.before_matches_expected && entry.after_matches_expected && entry.unchanged_during_audit,
    )).toBe(true);
    expect(report.export_surface.runtime_exports_from_source).toEqual(["calibrateConfidence"]);
    expect(report.export_surface.type_exports_from_source).toEqual([
      "ConfidenceCalibrationInsightEnvelope",
      "FrozenConfidenceCalibrationConfiguration",
      "ConfidenceCalibrationIssue",
      "ConfidenceCalibrationWarning",
      "ConfidenceCalibrationEvidenceSummary",
      "ConfidenceCalibrationAdjustment",
      "ConfidenceCalibrationResult",
    ]);
    expect(report.export_surface.runtime_function_available).toBe(true);
    expect(report.export_surface.class_service_adapter_repository_cache_singleton_absent).toBe(true);
  });

  test("records the remediated contract areas without weakening passing audit areas", () => {
    expect(report.audit_sections).toMatchObject({
      source_integrity: true,
      export_surface: true,
      purity: true,
      validation_order: true,
      base_confidence: true,
      eligibility: true,
      warning_compatibility: true,
      duplicates_and_overlap: true,
      identity_and_hashes: true,
      advisory_output: true,
      immutability_and_determinism: true,
      isolation_and_consumers: true,
      upstream_verifiers: true,
      runtime_preview_untouched: true,
    });
    expect(report.validation_precedence.unsupported_status_over_lineage).toBe(true);
    expect(report.eligibility.blocked_non_consumable_row).toBe(true);
    expect(report.eligibility.blocked_nondeterministic_grouping).toBe(true);
    expect(report.eligibility.unsupported_status).toBe(true);
    expect(report.warning_compatibility.duplicate_warning_output_deduped).toBe(true);
    expect(report.warning_compatibility.duplicate_warning_delta_not_double_attenuated).toBe(true);

    expect(allTrue(report.base_confidence)).toBe(true);
    expect(allTrue(report.direction_delta_audit)).toBe(true);
    expect(allTrue(report.evidence_quality_audit)).toBe(true);
    expect(allTrue(report.attenuation)).toBe(true);
    expect(allTrue(report.duplicates_and_overlap)).toBe(true);
    expect(allTrue(report.caps_and_aggregation)).toBe(true);
    expect(allTrue(report.confidence_bounds_and_clamping)).toBe(true);
    expect(allTrue(report.zero_adjustment)).toBe(true);
    expect(allTrue(report.result_contracts)).toBe(true);
    expect(allTrue(report.validation_precedence)).toBe(true);
    expect(allTrue(report.eligibility)).toBe(true);
    expect(allTrue(report.warning_compatibility)).toBe(true);
  });

  test("representative identity hashes are independently reconstructable and deterministic", () => {
    for (const identity of Object.values(report.representative_identity_hashes)) {
      expect(identity.independent_hash_matches).toBe(true);
      if (identity.calibration_id) {
        expect(identity.calibration_id).toMatch(/^confidence_calibration_v1:[a-f0-9]{24}$/);
      }
      if (identity.calibration_hash) {
        expect(identity.calibration_hash).toMatch(/^[a-f0-9]{64}$/);
      }
      expect(identity.id_prefix_ok).not.toBe(false);
      expect(identity.id_suffix_ok).not.toBe(false);
    }
    expect(report.representative_identity_hashes.reordered_equivalent.order_stable).toBe(true);
    expect(allTrue(report.identity_change_audit)).toBe(true);
    expect(allTrue(report.immutability_and_determinism)).toBe(true);
  });

  test("stays isolated from runtime, persistence, replay, provider, Supabase, and ranking effects", () => {
    expect(report.isolation.module_has_no_forbidden_imports).toBe(true);
    expect(report.isolation.no_runtime_consumers).toBe(true);
    expect(report.isolation.no_runner_manifest_shadow).toBe(true);
    expect(report.isolation.runtime_consumer_files).toEqual([]);
    expect(report.isolation.forbidden_artifacts_found).toEqual([]);
    expect(report.isolation.tracked_action421_evidence_files).toEqual([]);
    expect(report.upstream).toMatchObject({
      action419_verification_status: "passed",
      action420_verification_status: "passed",
      action420_implementation_status: "implemented_static_pure_not_shadowed",
    });
    expect(Object.values(report.no_effect_flags).every((value) => value === false)).toBe(true);
    expect(report.runtime_preview_status).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(report.unrelated_work_classification).toBe("action_421_docs_verifier_tests_and_minimal_guard_updates_only");
  });
});
