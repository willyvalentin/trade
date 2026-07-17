import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join, resolve } from "path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const docPath =
  "docs/action-488-confidence-calibration-recommendation-advisory-projection-preview-source-safety-marker-classification-remediation-approval-gate.md";
const recordPath =
  "docs/action-488-confidence-calibration-recommendation-advisory-projection-preview-source-safety-marker-remediation-approval-record.json";
const action487RecordPath =
  "docs/action-487-confidence-calibration-recommendation-advisory-projection-preview-full-candidate-build-rehearsal-retry-record.json";
const action486RecordPath =
  "docs/action-486-confidence-calibration-recommendation-advisory-projection-preview-temp-path-abort-remediation-approval-record.json";
const verifierPath =
  "scripts/action-488-confidence-calibration-recommendation-advisory-projection-preview-source-safety-marker-classification-remediation-approval-gate-verify.mjs";
const rootCause = "source_safety_marker_filename_false_positive_for_bounded_inventory_artifact";
const nextAction = "action_489_full_candidate_build_rehearsal_retry_after_source_safety_remediation";

test.setTimeout(300000);

type Action488Record = {
  action_487_rehearsal_result: string;
  root_cause_classification: string;
  clean_base_identifier: string;
  approved_change_candidate_hash: string;
  full_candidate_inventory_hash: string;
  candidate_file_count: number;
  path_safety_result: string;
  source_inventory_result: string;
  missing_source_file_count: number;
  unexpected_source_file_count: number;
  dependency_materialization_started: boolean;
  commands_started_count: number;
  safety_classification_model: Record<string, boolean | string[]>;
  prohibited_path_policy: Record<string, boolean>;
  approved_bounded_artifact_policy: Record<string, boolean | string[]>;
  schema_content_boundary_policy: Record<string, boolean>;
  unknown_file_policy: Record<string, boolean>;
  test_matrix: {
    approved_exact_bounded_artifacts: string[];
    rejected: string[];
    additional_assertions: string[];
  };
  candidate_policy_unchanged: boolean;
  dependency_materialization_method: string;
  rehearsal_policy_unchanged: boolean;
  rehearsal_performed: boolean;
  deployment_authorized: boolean;
  deployment_performed: boolean;
  activation_authorized: boolean;
  preview_activated: boolean;
  preview_flag_enabled: boolean;
  network_used: boolean;
  install_performed: boolean;
  provider_call_executed: boolean;
  supabase_write_executed: boolean;
  confidence_applied: boolean;
  feedback_created: boolean;
  downstream_behavior_changed: boolean;
  approval_decision: string;
  unresolved_conditions: string[];
  next_action: string;
  current_runtime_preview_state: string;
};

type VerifierReport = {
  verification_status: string;
  failed_conditions: string[];
  checks: Record<string, boolean>;
};

let verifierReport: VerifierReport;

function read(relativePath: string): string {
  return readFileSync(join(root, relativePath), "utf8");
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(read(relativePath)) as T;
}

function classifyFixture(input: {
  path: string;
  approved: boolean;
  hashMatches: boolean;
  schemaOk: boolean;
  prohibited: boolean;
  unknownSensitive: boolean;
}): string {
  if (input.prohibited) return "reject_prohibited";
  if (input.approved && input.hashMatches && input.schemaOk) return "accept_approved_bounded_artifact";
  if (input.approved && (!input.hashMatches || !input.schemaOk)) return "reject_artifact_mismatch";
  if (input.unknownSensitive) return "reject_unknown_sensitive";
  return "accept_neutral";
}

test.beforeAll(() => {
  verifierReport = JSON.parse(
    execFileSync("node", [verifierPath], {
      cwd: root,
      encoding: "utf8",
      maxBuffer: 160 * 1024 * 1024,
    }),
  ) as VerifierReport;
});

test.describe("Action 488 source safety marker remediation approval gate", () => {
  test("documents static approval and passes verifier", () => {
    expect(existsSync(join(root, docPath))).toBe(true);
    expect(existsSync(join(root, recordPath))).toBe(true);
    expect(existsSync(join(root, verifierPath))).toBe(true);

    const doc = read(docPath);
    expect(doc).toContain(rootCause);
    expect(doc).toContain("Filename indicators");
    expect(doc).toContain("Unknown sensitive-looking files remain fail-closed");
    expect(doc).toContain(nextAction);
    expect(verifierReport.verification_status).toBe("passed");
    expect(verifierReport.failed_conditions).toEqual([]);
  });

  test("binds Actions 486 and 487", () => {
    const action486 = readJson<{ approval_decision: string }>(action486RecordPath);
    const action487 = readJson<{ rehearsal_decision: string; abort_reason: string; path_safety_result: string }>(
      action487RecordPath,
    );
    const record = readJson<Action488Record>(recordPath);

    expect(action486.approval_decision).toBe("approved");
    expect(action487.rehearsal_decision).toBe("full_candidate_rehearsal_aborted");
    expect(action487.abort_reason).toBe("source_safety_marker_detected");
    expect(action487.path_safety_result).toBe("passed");
    expect(record.action_487_rehearsal_result).toBe("full_candidate_rehearsal_aborted");
    expect(verifierReport.checks.action486_approval).toBe(true);
    expect(verifierReport.checks.action487_aborted_result).toBe(true);
  });

  test("freezes root cause and candidate hashes", () => {
    const record = readJson<Action488Record>(recordPath);

    expect(record.root_cause_classification).toBe(rootCause);
    expect(record.clean_base_identifier).toBe("15f9923c24ed1f3cf82d34656eeacbfd98a0d347");
    expect(record.approved_change_candidate_hash).toBe(
      "7a11d9c6697a9d89ffb3e762dd15185fda225bc8e39c80a212cd3729d05857f6",
    );
    expect(record.full_candidate_inventory_hash).toBe(
      "cc6a97c5797a1fa76a6bebe9be1497fe88819f1b73992b271c142ff61d3bc2f0",
    );
    expect(record.candidate_file_count).toBe(30);
    expect(verifierReport.checks.root_cause).toBe(true);
    expect(verifierReport.checks.candidate_binding).toBe(true);
  });

  test("records path safety and source inventory success from Action 487", () => {
    const record = readJson<Action488Record>(recordPath);

    expect(record.path_safety_result).toBe("passed");
    expect(record.source_inventory_result).toBe("passed_bounded_git_head_plus_exact_overlay_inventory");
    expect(record.missing_source_file_count).toBe(0);
    expect(record.unexpected_source_file_count).toBe(0);
    expect(record.dependency_materialization_started).toBe(false);
    expect(record.commands_started_count).toBe(0);
    expect(verifierReport.checks.source_inventory_binding).toBe(true);
  });

  test("requires ordered safety classification phases", () => {
    const record = readJson<Action488Record>(recordPath);

    expect(record.safety_classification_model.ordered_phases).toEqual([
      "phase_a_exact_prohibited_files",
      "phase_b_approved_bounded_artifacts",
      "phase_c_unknown_sensitive_looking_files",
    ]);
    expect(record.safety_classification_model.filename_indicators_are_advisory_only).toBe(true);
    expect(record.safety_classification_model.exact_prohibited_path_type_indicators_authoritative).toBe(true);
    expect(record.safety_classification_model.unknown_sensitive_files_fail_closed).toBe(true);
    expect(verifierReport.checks.classification_model).toBe(true);
  });

  test("rejects prohibited files and unknown sensitive files", () => {
    const record = readJson<Action488Record>(recordPath);

    expect(record.prohibited_path_policy.reject_env_files).toBe(true);
    expect(record.prohibited_path_policy.reject_env_wildcards).toBe(true);
    expect(record.prohibited_path_policy.reject_npmrc_in_candidate).toBe(true);
    expect(record.prohibited_path_policy.reject_credential_files).toBe(true);
    expect(record.prohibited_path_policy.reject_private_key_files).toBe(true);
    expect(record.prohibited_path_policy.reject_pem_or_key_stores).toBe(true);
    expect(record.unknown_file_policy.unknown_sensitive_filename_rejected).toBe(true);
    expect(verifierReport.checks.prohibited_policy).toBe(true);
    expect(verifierReport.checks.unknown_file_policy).toBe(true);
  });

  test("accepts filename-only false positives only for exact bounded artifacts", () => {
    const record = readJson<Action488Record>(recordPath);

    expect(record.approved_bounded_artifact_policy.exact_path_required).toBe(true);
    expect(record.approved_bounded_artifact_policy.exact_action_provenance_required).toBe(true);
    expect(record.approved_bounded_artifact_policy.exact_classification_required).toBe(true);
    expect(record.approved_bounded_artifact_policy.expected_content_hash_required_when_frozen).toBe(true);
    expect(record.approved_bounded_artifact_policy.wildcard_sensitive_filename_allowlist_allowed).toBe(false);
    expect(record.approved_bounded_artifact_policy.directory_wide_docs_allowlist_allowed).toBe(false);
    expect(record.approved_bounded_artifact_policy.arbitrary_json_allowlist_allowed).toBe(false);

    expect(
      classifyFixture({
        path: "docs/action-secret-policy.md",
        approved: true,
        hashMatches: true,
        schemaOk: true,
        prohibited: false,
        unknownSensitive: true,
      }),
    ).toBe("accept_approved_bounded_artifact");
    expect(verifierReport.checks.approved_artifact_policy).toBe(true);
  });

  test("rejects approved-looking artifacts with wrong hash or secret field", () => {
    expect(
      classifyFixture({
        path: "docs/action-secret-policy.md",
        approved: true,
        hashMatches: false,
        schemaOk: true,
        prohibited: false,
        unknownSensitive: true,
      }),
    ).toBe("reject_artifact_mismatch");
    expect(
      classifyFixture({
        path: "docs/action-secret-policy.json",
        approved: true,
        hashMatches: true,
        schemaOk: false,
        prohibited: false,
        unknownSensitive: true,
      }),
    ).toBe("reject_artifact_mismatch");
  });

  test("proves .env, .npmrc, credential JSON, private-key/PEM, token files remain rejected", () => {
    const cases = [".env", ".env.local", ".npmrc", "credentials.json", "private-key.pem", "netlify-token.txt"];

    for (const file of cases) {
      expect(
        classifyFixture({
          path: file,
          approved: false,
          hashMatches: false,
          schemaOk: false,
          prohibited: true,
          unknownSensitive: true,
        }),
      ).toBe("reject_prohibited");
    }
  });

  test("requires bounded schema/content checks without raw secret recording", () => {
    const record = readJson<Action488Record>(recordPath);

    expect(record.schema_content_boundary_policy.valid_json_required_where_expected).toBe(true);
    expect(record.schema_content_boundary_policy.expected_top_level_schema_fields_required).toBe(true);
    expect(record.schema_content_boundary_policy.credential_value_recorded_false_required_when_present).toBe(true);
    expect(record.schema_content_boundary_policy.environment_value_payload_allowed).toBe(false);
    expect(record.schema_content_boundary_policy.token_password_private_key_field_allowed).toBe(false);
    expect(record.schema_content_boundary_policy.raw_secret_values_recorded).toBe(false);
    expect(record.schema_content_boundary_policy.external_credential_store_scanned).toBe(false);
    expect(verifierReport.checks.schema_content_boundary).toBe(true);
    expect(verifierReport.checks.no_raw_secret_values).toBe(true);
  });

  test("covers required test matrix", () => {
    const record = readJson<Action488Record>(recordPath);

    expect(record.test_matrix.approved_exact_bounded_artifacts).toContain("documentation_describing_secrets");
    expect(record.test_matrix.approved_exact_bounded_artifacts).toContain("credential_policy_approval_record");
    expect(record.test_matrix.approved_exact_bounded_artifacts).toContain("environment_prohibition_documentation");
    expect(record.test_matrix.approved_exact_bounded_artifacts).toContain("test_file_named_around_token_rejection");
    expect(record.test_matrix.approved_exact_bounded_artifacts).toContain(
      "bounded_json_with_credential_value_recorded_false",
    );
    expect(record.test_matrix.rejected).toContain("approved_path_wrong_hash");
    expect(record.test_matrix.rejected).toContain("approved_schema_secret_value_field");
    expect(record.test_matrix.additional_assertions).toContain("filename_only_false_positive_no_longer_aborts");
    expect(record.test_matrix.additional_assertions).toContain("actual_content_based_secret_detection_still_aborts");
    expect(verifierReport.checks.test_matrix).toBe(true);
  });

  test("preserves candidate and dependency policy for Action 489", () => {
    const record = readJson<Action488Record>(recordPath);

    expect(record.candidate_policy_unchanged).toBe(true);
    expect(record.rehearsal_policy_unchanged).toBe(true);
    expect(record.dependency_materialization_method).toBe("temporary_verified_node_modules_copy");
    expect(record.rehearsal_performed).toBe(false);
    expect(record.network_used).toBe(false);
    expect(record.install_performed).toBe(false);
    expect(verifierReport.checks.policy_preservation).toBe(true);
  });

  test("authorizes no deployment, activation, runtime, provider, Supabase, confidence, or feedback effects", () => {
    const record = readJson<Action488Record>(recordPath);

    expect(record.deployment_authorized).toBe(false);
    expect(record.deployment_performed).toBe(false);
    expect(record.activation_authorized).toBe(false);
    expect(record.preview_activated).toBe(false);
    expect(record.preview_flag_enabled).toBe(false);
    expect(record.provider_call_executed).toBe(false);
    expect(record.supabase_write_executed).toBe(false);
    expect(record.confidence_applied).toBe(false);
    expect(record.feedback_created).toBe(false);
    expect(record.downstream_behavior_changed).toBe(false);
    expect(record.approval_decision).toBe("approved");
    expect(record.unresolved_conditions).toEqual([]);
    expect(record.next_action).toBe(nextAction);
    expect(record.current_runtime_preview_state).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(verifierReport.checks.no_effects).toBe(true);
    expect(verifierReport.checks.approval_and_next_action).toBe(true);
    expect(verifierReport.checks.runtime_state).toBe(true);
  });
});
