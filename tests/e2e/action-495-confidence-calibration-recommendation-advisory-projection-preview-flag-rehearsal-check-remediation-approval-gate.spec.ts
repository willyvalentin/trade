import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join, resolve } from "path";

import { expect, test } from "@playwright/test";

import { isConfidenceCalibrationProjectionPreviewEnabled } from "../../lib/confidence-calibration-recommendation-advisory-projection-preview-flag";

const root = resolve(__dirname, "../..");
const docPath =
  "docs/action-495-confidence-calibration-recommendation-advisory-projection-preview-flag-rehearsal-check-remediation-approval-gate.md";
const recordPath =
  "docs/action-495-confidence-calibration-recommendation-advisory-projection-preview-flag-rehearsal-check-remediation-approval-record.json";
const verifierPath =
  "scripts/action-495-confidence-calibration-recommendation-advisory-projection-preview-flag-rehearsal-check-remediation-approval-gate-verify.mjs";
const action494VerifierPath =
  "scripts/action-494-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-build-rehearsal-verify.mjs";

const canonicalKey = "CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED";
const expected = {
  cleanBase: "15f9923c24ed1f3cf82d34656eeacbfd98a0d347",
  changeHash: "c005946d3a21df32730306687d125ef1ba4439500da7ec22288ec92d802d667c",
  fullHash: "d96af34b0c488ef16f614b2be731052c2099e0b6efde57f76115eb8d5c779a0f",
  blocker:
    "preview_flag_rehearsal_check_confused_parser_literal_with_resolved_flag_state",
  nextAction:
    "action_496_runtime_complete_candidate_build_rehearsal_retry_after_preview_flag_check_remediation",
};

type Action495Record = {
  source_action: number;
  action_494_candidate_result: string;
  action_494_external_evidence_result: string;
  action_494_overall_readiness: string;
  blocker_classification: string;
  clean_base_identifier: string;
  change_candidate_hash: string;
  full_candidate_inventory_hash: string;
  candidate_file_count: number;
  canonical_preview_flag: string;
  verification_strategy: string;
  source_literal_authoritative: boolean;
  parser_literal_true_activation_evidence: boolean;
  canonical_key_only: boolean;
  raw_environment_value_recorded: boolean;
  environment_modified: boolean;
  helper_test_matrix_required: Array<{
    case: string;
    classification: string;
    expected_helper_result: boolean;
  }>;
  alternate_activation_policy: Record<string, boolean>;
  flag_result_vocabulary: string[];
  approval_decision: string;
  unresolved_conditions: string[];
  rehearsal_authorized: boolean;
  deployment_authorized: boolean;
  activation_authorized: boolean;
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

function helperResult(value: string | undefined, runtime = "development"): boolean {
  return isConfidenceCalibrationProjectionPreviewEnabled(
    { [canonicalKey]: value },
    runtime,
  );
}

test.describe("Action 495 preview flag rehearsal check remediation approval gate", () => {
  test("documents the static approval gate and passes verifier", () => {
    expect(existsSync(join(root, docPath))).toBe(true);
    expect(existsSync(join(root, recordPath))).toBe(true);
    expect(existsSync(join(root, verifierPath))).toBe(true);

    const doc = read(docPath);
    expect(doc).toContain("Action 495 approves");
    expect(doc).toContain(expected.blocker);
    expect(doc).toContain(canonicalKey);
    expect(doc).toContain("resolved_preview_flag_helper_evaluation");
    expect(doc).toContain(expected.nextAction);

    const report = runVerifier(verifierPath);
    expect(report.verification_status).toBe("passed");
    expect(report.approval_decision).toBe("approved");
    expect(report.next_action).toBe(expected.nextAction);
    expect(report.failed_conditions).toEqual([]);
  });

  test("binds Action 494 abort evidence and exact candidate hashes", () => {
    const record = readJson<Action495Record>(recordPath);
    const action494 = runVerifier(action494VerifierPath);

    expect(action494.verification_status).toBe("passed");
    expect(action494.candidate_rehearsal_result).toBe("full_candidate_rehearsal_aborted");
    expect(record.source_action).toBe(494);
    expect(record.action_494_candidate_result).toBe("full_candidate_rehearsal_aborted");
    expect(record.action_494_external_evidence_result).toBe("rehearsal_evidence_verified");
    expect(record.action_494_overall_readiness).toBe("blocked");
    expect(record.blocker_classification).toBe(expected.blocker);
    expect(record.clean_base_identifier).toBe(expected.cleanBase);
    expect(record.change_candidate_hash).toBe(expected.changeHash);
    expect(record.full_candidate_inventory_hash).toBe(expected.fullHash);
    expect(record.candidate_file_count).toBe(31);
  });

  test("freezes the semantic helper contract without reading real environment values", () => {
    expect(isConfidenceCalibrationProjectionPreviewEnabled({}, "development")).toBe(false);
    expect(helperResult(undefined)).toBe(false);
    expect(helperResult("")).toBe(false);
    expect(helperResult("false")).toBe(false);
    expect(helperResult("0")).toBe(false);
    expect(helperResult("1")).toBe(false);
    expect(helperResult("enabled")).toBe(false);
    expect(helperResult("TRUE")).toBe(false);
    expect(helperResult(" true ")).toBe(false);
    expect(helperResult("true")).toBe(true);
    expect(helperResult("true", "production")).toBe(false);
  });

  test("treats parser, documentation, and test fixture literals as non-authoritative", () => {
    const record = readJson<Action495Record>(recordPath);
    const helperSource = read("lib/confidence-calibration-recommendation-advisory-projection-preview-flag.ts");
    const doc = read(docPath);
    const fixtureLiteral = "true";

    expect(helperSource).toContain('"true"');
    expect(doc).toContain('"true"');
    expect(fixtureLiteral).toBe("true");
    expect(isConfidenceCalibrationProjectionPreviewEnabled({}, "development")).toBe(false);
    expect(record.source_literal_authoritative).toBe(false);
    expect(record.parser_literal_true_activation_evidence).toBe(false);
  });

  test("records canonical-key-only access, no raw value storage, and environment restoration policy", () => {
    const record = readJson<Action495Record>(recordPath);

    expect(record.canonical_preview_flag).toBe(canonicalKey);
    expect(record.canonical_key_only).toBe(true);
    expect(record.raw_environment_value_recorded).toBe(false);
    expect(record.environment_modified).toBe(false);
    expect(record.helper_test_matrix_required.map((entry) => entry.case)).toEqual(
      expect.arrayContaining([
        "key_absent",
        "undefined",
        "null_or_unavailable",
        "empty_string",
        "false_string",
        "zero_string",
        "one_string",
        "non_exact_string",
        "exact_true",
        "parser_literal_present_with_key_absent",
        "documentation_literal_present",
        "test_fixture_literal_present",
        "alternate_alias_absent",
        "query_parameter_absent",
        "url_fragment_absent",
        "local_storage_absent",
        "session_storage_absent",
        "cookie_absent",
      ]),
    );
  });

  test("rejects alternate activation paths and freezes result vocabulary", () => {
    const record = readJson<Action495Record>(recordPath);

    expect(record.alternate_activation_policy.alternate_activation_paths_checked).toBe(true);
    expect(record.alternate_activation_policy.alternate_activation_path_detected).toBe(false);
    expect(record.alternate_activation_policy.alternate_environment_alias_allowed).toBe(false);
    expect(record.alternate_activation_policy.query_parameter_bypass_allowed).toBe(false);
    expect(record.alternate_activation_policy.local_storage_bypass_allowed).toBe(false);
    expect(record.alternate_activation_policy.session_storage_bypass_allowed).toBe(false);
    expect(record.alternate_activation_policy.cookie_bypass_allowed).toBe(false);
    expect(record.alternate_activation_policy.remote_configuration_bypass_allowed).toBe(false);
    expect(record.flag_result_vocabulary).toEqual([
      "preview_flag_disabled_verified",
      "preview_flag_enabled_detected",
      "preview_flag_state_ambiguous",
      "preview_flag_verification_failed",
    ]);
  });

  test("approves one future local retry while keeping Action 495 static and inactive", () => {
    const record = readJson<Action495Record>(recordPath);

    expect(record.approval_decision).toBe("approved");
    expect(record.unresolved_conditions).toEqual([]);
    expect(record.rehearsal_authorized).toBe(false);
    expect(record.deployment_authorized).toBe(false);
    expect(record.activation_authorized).toBe(false);
    expect(record.runtime_preview_state).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(record.next_action).toBe(expected.nextAction);

    for (const key of [
      "network_used",
      "install_performed",
      "candidate_modified",
      "preview_helper_modified",
      "package_or_lockfile_modified",
      "environment_modified",
      "provider_call_executed",
      "supabase_accessed",
      "persistence_created",
      "replay_created",
      "confidence_applied",
      "feedback_created",
      "downstream_behavior_changed",
    ]) {
      expect(record[key]).toBe(false);
    }
  });
});
