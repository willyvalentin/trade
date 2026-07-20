import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join, resolve } from "path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const docPath =
  "docs/action-497-confidence-calibration-recommendation-advisory-projection-preview-source-safety-checker-false-positive-remediation-approval-gate.md";
const recordPath =
  "docs/action-497-confidence-calibration-recommendation-advisory-projection-preview-source-safety-checker-false-positive-remediation-approval-record.json";
const verifierPath =
  "scripts/action-497-confidence-calibration-recommendation-advisory-projection-preview-source-safety-checker-false-positive-remediation-approval-gate-verify.mjs";
const action496VerifierPath =
  "scripts/action-496-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-build-rehearsal-retry-after-preview-flag-remediation-verify.mjs";
const action495VerifierPath =
  "scripts/action-495-confidence-calibration-recommendation-advisory-projection-preview-flag-rehearsal-check-remediation-approval-gate-verify.mjs";

const expected = {
  cleanBase: "15f9923c24ed1f3cf82d34656eeacbfd98a0d347",
  changeHash: "c005946d3a21df32730306687d125ef1ba4439500da7ec22288ec92d802d667c",
  fullHash: "d96af34b0c488ef16f614b2be731052c2099e0b6efde57f76115eb8d5c779a0f",
  blocker:
    "source_safety_checker_applied_non_authoritative_filename_or_whitespace_indicators_as_hard_failure",
  nextAction:
    "action_498_runtime_complete_candidate_build_rehearsal_retry_after_source_safety_checker_remediation",
};

type Action497Record = {
  action_496_candidate_result: string;
  action_496_external_evidence_result: string;
  action_496_overall_readiness: string;
  action_496_rehearsal_attempt_count: number;
  blocker_classification: string;
  clean_base_identifier: string;
  change_candidate_hash: string;
  full_candidate_inventory_hash: string;
  candidate_file_count: number;
  false_positive_findings: Array<{
    repository_relative_path: string;
    approved_candidate_membership: string;
    expected_classification: string;
    triggering_indicator_class: string;
    filename_only_indicator: boolean;
    whitespace_or_format_only_indicator: boolean;
    exact_prohibited_path_or_type_matched: boolean;
    actual_prohibited_schema_field_matched: boolean;
    expected_remediation_disposition: string;
  }>;
  classification_precedence: Array<{ level: number; name: string; disposition: string }>;
  source_safety_vocabulary: string[];
  exact_prohibited_path_policy: string;
  approved_artifact_policy: string;
  whitespace_policy: string;
  unknown_sensitive_file_policy: string;
  secret_value_boundary: Record<string, boolean>;
  advisory_cases_required: string[];
  rejection_cases_required: string[];
  future_action_498_execution_order: string[];
  preserved_policies: Record<string, boolean | number>;
  approval_decision: string;
  unresolved_conditions: unknown[];
  runtime_preview_state: string;
  next_action: string;
  [key: string]: unknown;
};

function read(relativePath: string): string {
  return readFileSync(join(root, relativePath), "utf8");
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(read(relativePath)) as T;
}

function runVerifier(relativePath: string): Record<string, unknown> {
  return JSON.parse(
    execFileSync("node", [relativePath], {
      cwd: root,
      encoding: "utf8",
      maxBuffer: 128 * 1024 * 1024,
    }),
  ) as Record<string, unknown>;
}

test.describe("Action 497 source-safety checker false-positive remediation approval gate", () => {
  test("documents Action 496 abort and exact candidate bindings", () => {
    expect(existsSync(join(root, docPath))).toBe(true);
    expect(existsSync(join(root, recordPath))).toBe(true);
    expect(existsSync(join(root, verifierPath))).toBe(true);

    const record = readJson<Action497Record>(recordPath);
    expect(record.action_496_candidate_result).toBe("full_candidate_rehearsal_aborted");
    expect(record.action_496_external_evidence_result).toBe("rehearsal_evidence_verified");
    expect(record.action_496_overall_readiness).toBe("blocked");
    expect(record.action_496_rehearsal_attempt_count).toBe(1);
    expect(record.blocker_classification).toBe(expected.blocker);
    expect(record.clean_base_identifier).toBe(expected.cleanBase);
    expect(record.change_candidate_hash).toBe(expected.changeHash);
    expect(record.full_candidate_inventory_hash).toBe(expected.fullHash);
    expect(record.candidate_file_count).toBe(31);
  });

  test("records exact bounded false-positive inventory", () => {
    const record = readJson<Action497Record>(recordPath);

    expect(record.false_positive_findings).toHaveLength(10);
    expect(record.false_positive_findings.map((finding) => finding.repository_relative_path)).toEqual(
      expect.arrayContaining([
        "lib/avanza-login-credential-resolution-bridge-fixtures.ts",
        "lib/avanza-login-credential-resolution-bridge.ts",
        "lib/avanza-login-local-dev-credential-executor-fixtures.ts",
        "lib/avanza-login-local-dev-credential-executor.ts",
        "lib/avanza-macos-keychain-credential-provider-fixtures.ts",
        "lib/avanza-macos-keychain-credential-provider.ts",
        "lib/avanza-secure-credential-provider-fixtures.ts",
        "lib/avanza-secure-credential-provider.ts",
        "lib/trade-auth.ts",
        "source_inventory_text_format_scan",
      ]),
    );
    expect(record.false_positive_findings.filter((finding) => finding.filename_only_indicator)).toHaveLength(9);
    expect(
      record.false_positive_findings.filter((finding) => finding.whitespace_or_format_only_indicator),
    ).toHaveLength(1);
    for (const finding of record.false_positive_findings) {
      expect(finding.exact_prohibited_path_or_type_matched).toBe(false);
      expect(finding.actual_prohibited_schema_field_matched).toBe(false);
      expect(
        finding.expected_remediation_disposition.includes("continue") ||
          finding.expected_remediation_disposition.includes("source_integrity"),
      ).toBe(true);
      expect(finding).not.toHaveProperty("raw_value");
    }
  });

  test("freezes deterministic source-safety classification precedence", () => {
    const record = readJson<Action497Record>(recordPath);

    expect(record.classification_precedence.map((item) => item.name)).toEqual([
      "exact_prohibited_path_or_type",
      "exact_approved_candidate_artifact",
      "bounded_content_or_schema_contradiction",
      "advisory_indicator",
      "unknown_sensitive_file",
    ]);
    expect(record.classification_precedence[0].disposition).toBe("reject");
    expect(record.classification_precedence[3].disposition).toBe("does_not_independently_block");
    expect(record.classification_precedence[4].disposition).toBe("fail_closed");
    expect(record.source_safety_vocabulary).toEqual([
      "source_safety_passed",
      "source_safety_aborted_secret_detected",
      "source_safety_aborted_unknown_sensitive_file",
      "source_safety_aborted_artifact_mismatch",
      "source_safety_failed",
    ]);
  });

  test("preserves prohibited rejection and advisory acceptance policies", () => {
    const record = readJson<Action497Record>(recordPath);

    expect(record.exact_prohibited_path_policy).toContain("env_files");
    expect(record.exact_prohibited_path_policy).toContain("candidate_npmrc");
    expect(record.exact_prohibited_path_policy).toContain("private_keys");
    expect(record.exact_prohibited_path_policy).toContain("pem_key_stores");
    expect(record.exact_prohibited_path_policy).toContain("token_password_exports");
    expect(record.approved_artifact_policy).toContain("exact_path");
    expect(record.approved_artifact_policy).toContain("no_directory_wildcards");
    expect(record.unknown_sensitive_file_policy).toBe("fail_closed");
    expect(record.advisory_cases_required).toEqual(
      expect.arrayContaining([
        "approved_docs_file_containing_secret",
        "approved_test_containing_token",
        "approved_record_containing_credential_value_recorded_false",
        "canonical_environment_key_name_in_source",
        "parser_literal_true",
        "regular_indentation_and_blank_lines",
        "trailing_whitespace_routes_to_source_integrity",
        "test_assertion_describing_private_key_rejection",
      ]),
    );
    expect(record.rejection_cases_required).toEqual(
      expect.arrayContaining([
        ".env",
        ".env.local",
        "candidate .npmrc",
        "unknown credentials JSON",
        "private key",
        "PEM store",
        "unknown token export",
        "approved path with wrong hash",
        "approved record containing credential-value field",
        "new sensitive-looking file outside inventory",
      ]),
    );
  });

  test("separates whitespace from secret detection and records no raw values", () => {
    const record = readJson<Action497Record>(recordPath);

    expect(record.whitespace_policy).toContain("not_secret_evidence");
    expect(record.secret_value_boundary.raw_secret_value_recorded).toBe(false);
    expect(record.secret_value_boundary.raw_suspected_value_printed).toBe(false);
    expect(record.secret_value_boundary.raw_suspected_value_stored).toBe(false);
    expect(record.secret_value_boundary.credential_value_hashed_for_evidence).toBe(false);
    expect(record.secret_value_boundary.complete_environment_enumerated).toBe(false);
    expect(record.secret_value_boundary.external_credential_store_inspected).toBe(false);
    expect(record.secret_value_boundary.home_or_global_netlify_config_inspected).toBe(false);
    expect(record.raw_secret_value_recorded).toBe(false);
  });

  test("preserves candidate and Action 498 boundary without authorizing runtime effects", () => {
    const record = readJson<Action497Record>(recordPath);

    expect(record.future_action_498_execution_order).toEqual([
      "phase_0_action_486_temp_path_policy",
      "phase_1_action_492_candidate_reconstruction_runtime_closure_source_inventory_source_integrity_remediated_source_safety",
      "phase_1b_action_495_semantic_preview_flag_verification",
      "phase_2_action_482_bounded_dependency_materialization",
      "phase_3_candidate_internal_commands_serial",
      "phase_4_mutation_checks_and_cleanup",
      "phase_5_external_evidence_verification",
    ]);
    expect(record.preserved_policies.candidate_file_count).toBe(31);
    expect(record.preserved_policies.candidate_hashes_unchanged).toBe(true);
    expect(record.preserved_policies.semantic_preview_flag_strategy_unchanged).toBe(true);
    expect(record.preserved_policies.one_attempt_policy_unchanged).toBe(true);
    expect(record.preserved_policies.deployment_activation_prohibited).toBe(true);
    for (const key of [
      "source_safety_disable_required",
      "directory_wide_allowlist_required",
      "candidate_or_hash_change_required",
      "rehearsal_authorized",
      "deployment_authorized",
      "activation_authorized",
      "netlify_operation_authorized",
      "network_used",
      "install_performed",
      "candidate_modified",
      "helper_modified",
      "environment_modified",
      "persistence_created",
      "replay_created",
      "provider_called",
      "supabase_accessed",
      "feedback_created",
      "confidence_applied",
      "downstream_behavior_changed",
    ]) {
      expect(record[key]).toBe(false);
    }
  });

  test("approves the bounded remediation and points to Action 498", () => {
    const record = readJson<Action497Record>(recordPath);
    const doc = read(docPath);

    expect(record.approval_decision).toBe("approved");
    expect(record.unresolved_conditions).toEqual([]);
    expect(record.runtime_preview_state).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(record.next_action).toBe(expected.nextAction);
    expect(doc).toContain("Approval decision: `approved`");
    expect(doc).toContain(expected.nextAction);
  });

  test("verifier succeeds and Actions 495-496 remain healthy", () => {
    const action495 = runVerifier(action495VerifierPath);
    const action496 = runVerifier(action496VerifierPath);
    const action497 = runVerifier(verifierPath);

    expect(action495.verification_status).toBe("passed");
    expect(action496.verification_status).toBe("passed");
    expect(action497.verification_status).toBe("passed");
    expect(action497.approval_decision).toBe("approved");
    expect(action497.next_action).toBe(expected.nextAction);
  });
});
