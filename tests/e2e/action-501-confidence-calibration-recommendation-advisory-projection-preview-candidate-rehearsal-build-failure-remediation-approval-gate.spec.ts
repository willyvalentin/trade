import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join, resolve } from "path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const recordPath =
  "docs/action-501-confidence-calibration-recommendation-advisory-projection-preview-candidate-rehearsal-build-failure-remediation-approval-record.json";
const docPath =
  "docs/action-501-confidence-calibration-recommendation-advisory-projection-preview-candidate-rehearsal-build-failure-remediation-approval-gate.md";
const verifierPath =
  "scripts/action-501-confidence-calibration-recommendation-advisory-projection-preview-candidate-rehearsal-build-failure-remediation-approval-gate-verify.mjs";
const action500VerifierPath =
  "scripts/action-500-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-build-rehearsal-retry-after-wrong-hash-rejection-remediation-verify.mjs";
const action499VerifierPath =
  "scripts/action-499-confidence-calibration-recommendation-advisory-projection-preview-source-safety-wrong-hash-rejection-remediation-approval-gate-verify.mjs";

type Action501Record = {
  action_500_candidate_result: string;
  action_500_external_evidence_result: string;
  action_500_overall_readiness: string;
  rehearsal_attempt_count: number;
  failing_command: string;
  prior_next_typegen_result: string;
  prior_typescript_result: string;
  typescript_pass_does_not_prove_next_build: boolean;
  change_candidate_hash: string;
  full_candidate_inventory_hash: string;
  candidate_file_count: number;
  permitted_evidence_inspected: string[];
  evidence_not_available_in_action_500_record: string[];
  build_failure_phase: string;
  build_failure_primary_classification: string;
  build_failure_error_class: string;
  implicated_paths: string[];
  implicated_path_classifications: string[];
  candidate_relevance: string;
  dependency_path_relevance: string;
  runner_defect_relevance: string;
  unrelated_dirty_path_handling: string;
  evidence_sufficiency: string;
  candidate_hash_impact: string;
  remediation_class: string;
  next_action_mapping: Record<string, string>;
  approval_decision: string;
  unresolved_conditions: string[];
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
  return JSON.parse(execFileSync("node", [relativePath], { cwd: root, encoding: "utf8" })) as Record<
    string,
    unknown
  >;
}

test.describe("Action 501 candidate rehearsal build-failure remediation approval gate", () => {
  test("binds Action 500 failed build result and exact candidate hashes", () => {
    expect(existsSync(join(root, recordPath))).toBe(true);
    expect(existsSync(join(root, docPath))).toBe(true);
    expect(existsSync(join(root, verifierPath))).toBe(true);
    const record = readJson<Action501Record>(recordPath);
    expect(record.action_500_candidate_result).toBe("full_candidate_rehearsal_failed");
    expect(record.action_500_external_evidence_result).toBe("rehearsal_evidence_verified");
    expect(record.action_500_overall_readiness).toBe("blocked");
    expect(record.rehearsal_attempt_count).toBe(1);
    expect(record.failing_command).toBe("npm run build");
    expect(record.change_candidate_hash).toBe("c005946d3a21df32730306687d125ef1ba4439500da7ec22288ec92d802d667c");
    expect(record.full_candidate_inventory_hash).toBe("d96af34b0c488ef16f614b2be731052c2099e0b6efde57f76115eb8d5c779a0f");
    expect(record.candidate_file_count).toBe(31);
  });

  test("records typegen and TypeScript passed without assuming build correctness", () => {
    const record = readJson<Action501Record>(recordPath);
    expect(record.prior_next_typegen_result).toBe("passed");
    expect(record.prior_typescript_result).toBe("passed");
    expect(record.typescript_pass_does_not_prove_next_build).toBe(true);
  });

  test("keeps bounded evidence policy and does not record raw logs or values", () => {
    const record = readJson<Action501Record>(recordPath);
    expect(record.permitted_evidence_inspected).toContain("action_500_candidate_command_result_object");
    expect(record.permitted_evidence_inspected).toContain("action_500_stdout_stderr_byte_counts");
    expect(record.evidence_not_available_in_action_500_record).toContain("next_build_phase_name");
    expect(record.evidence_not_available_in_action_500_record).toContain("build_error_class");
    expect(record.raw_logs_inspected).toBe(false);
    expect(record.raw_logs_recorded).toBe(false);
    expect(record.raw_environment_values_recorded).toBe(false);
    expect(record.raw_secret_values_recorded).toBe(false);
    expect(record.machine_absolute_paths_recorded).toBe(false);
  });

  test("classifies build phase and primary cause as evidence insufficient", () => {
    const record = readJson<Action501Record>(recordPath);
    expect(record.build_failure_phase).toBe("unknown_from_bounded_action_500_evidence");
    expect(record.build_failure_primary_classification).toBe("build_failure_evidence_insufficient");
    expect(record.build_failure_error_class).toBe("unknown_from_bounded_action_500_evidence");
    expect(record.evidence_sufficiency).toBe("insufficient_to_distinguish_candidate_versus_runner_defect");
  });

  test("keeps path relevance unresolved without inventing candidate or dependency paths", () => {
    const record = readJson<Action501Record>(recordPath);
    expect(record.implicated_paths).toEqual([]);
    expect(record.implicated_path_classifications).toEqual([]);
    expect(record.candidate_relevance).toBe("unknown_from_bounded_action_500_evidence");
    expect(record.dependency_path_relevance).toBe("unknown_from_bounded_action_500_evidence");
    expect(record.runner_defect_relevance).toBe("unknown_from_bounded_action_500_evidence");
    expect(record.unrelated_dirty_path_handling).toBe("no_unrelated_dirty_path_referenced_by_bounded_evidence");
  });

  test("freezes hash impact, remediation class, and next-action mappings", () => {
    const record = readJson<Action501Record>(recordPath);
    expect(record.candidate_hash_impact).toBe("candidate_hash_impact_unresolved");
    expect(record.remediation_class).toBe("diagnostic_evidence_completion_required");
    expect(record.next_action_mapping.candidate_source_or_configuration_must_change).toBe(
      "action_502_candidate_build_failure_source_remediation",
    );
    expect(record.next_action_mapping.rehearsal_runner_or_build_environment_must_change_without_candidate_mutation).toBe(
      "action_502_candidate_build_rehearsal_runner_remediation_gate",
    );
    expect(record.next_action_mapping.evidence_insufficient).toBe(
      "action_502_candidate_build_failure_diagnostic_evidence_completion_gate",
    );
  });

  test("blocks approval and performs no build, rehearsal, source change, deployment, or activation", () => {
    const record = readJson<Action501Record>(recordPath);
    expect(record.approval_decision).toBe("blocked");
    expect(record.unresolved_conditions.length).toBeGreaterThan(0);
    for (const key of [
      "candidate_modified",
      "source_modified",
      "package_manifest_modified",
      "lockfile_modified",
      "environment_modified",
      "rehearsal_performed",
      "build_performed",
      "deployment_performed",
      "preview_activated",
      "provider_called",
      "supabase_accessed",
      "persistence_created",
      "replay_created",
      "confidence_applied",
      "downstream_behavior_changed",
    ]) {
      expect(record[key]).toBe(false);
    }
  });

  test("keeps runtime preview waiting and points to diagnostic evidence completion", () => {
    const record = readJson<Action501Record>(recordPath);
    expect(record.runtime_preview_state).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(record.next_action).toBe("action_502_candidate_build_failure_diagnostic_evidence_completion_gate");
  });

  test("verifier succeeds and Actions 499-500 remain healthy", () => {
    const action499 = runVerifier(action499VerifierPath);
    const action500 = runVerifier(action500VerifierPath);
    const action501 = runVerifier(verifierPath);
    expect(action499.verification_status).toBe("passed");
    expect(action500.verification_status).toBe("passed");
    expect(action501.verification_status).toBe("passed");
    expect(action501.approval_decision).toBe("blocked");
  });

  test("documentation records the evidence-insufficient decision", () => {
    const doc = read(docPath);
    expect(doc).toContain("Primary build-failure classification: `build_failure_evidence_insufficient`");
    expect(doc).toContain("Build phase: `unknown_from_bounded_action_500_evidence`");
    expect(doc).toContain("Candidate hash impact: `candidate_hash_impact_unresolved`");
    expect(doc).toContain("Approval decision: `blocked`");
    expect(doc).toContain("action_502_candidate_build_failure_diagnostic_evidence_completion_gate");
  });
});
