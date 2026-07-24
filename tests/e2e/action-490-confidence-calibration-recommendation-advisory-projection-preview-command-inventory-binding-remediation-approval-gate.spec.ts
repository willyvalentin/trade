import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join, resolve } from "path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const docPath =
  "docs/action-490-confidence-calibration-recommendation-advisory-projection-preview-command-inventory-binding-remediation-approval-gate.md";
const recordPath =
  "docs/action-490-confidence-calibration-recommendation-advisory-projection-preview-command-inventory-binding-remediation-approval-record.json";
const verifierPath =
  "scripts/action-490-confidence-calibration-recommendation-advisory-projection-preview-command-inventory-binding-remediation-approval-gate-verify.mjs";
const action489VerifierPath =
  "scripts/action-489-confidence-calibration-recommendation-advisory-projection-preview-full-candidate-build-rehearsal-retry-after-source-safety-remediation-verify.mjs";
const action488VerifierPath =
  "scripts/action-488-confidence-calibration-recommendation-advisory-projection-preview-source-safety-marker-classification-remediation-approval-gate-verify.mjs";

test.setTimeout(300000);

type Action490Record = {
  source_action_result: {
    rehearsal_decision: string;
    abort_reason: string;
    source_safety_result: string;
    source_only_git_integrity_result: string;
    dependency_materialization_result: string;
  };
  root_cause_classification: string;
  clean_base_identifier: string;
  approved_change_candidate_hash: string;
  full_candidate_inventory_hash: string;
  candidate_changed_file_count: number;
  candidate_expansion_required: boolean;
  candidate_hashes_changed: boolean;
  later_action_artifacts_copied_into_candidate: boolean;
  class_a_internal_command_inventory: Array<{
    command_id: string;
    command_identity: string;
    execution_class: string;
    required_paths: string[];
    runtime_relevance: string;
  }>;
  class_a_required_path_count: number;
  class_a_missing_path_count: number;
  class_a_missing_paths: string[];
  class_b_external_control_inventory: string[];
  later_action_tests_classified_control_only: boolean;
  external_control_checks_after_cleanup_only: boolean;
  external_control_checks_can_mutate_candidate: boolean;
  candidate_runtime_relevance_policy: Record<string, boolean>;
  execution_sequence: string[];
  rehearsal_attempt_count_for_action_491: number;
  external_post_rehearsal_checks_count_as_attempt: boolean;
  failure_semantics: Record<string, string | boolean>;
  candidate_rehearsal_result_vocabulary: string[];
  external_evidence_result_vocabulary: string[];
  overall_readiness_vocabulary: string[];
  approval_vocabulary: string[];
  approval_decision: string;
  approval_blockers: string[];
  unresolved_conditions: string[];
  rehearsal_attempt_authorized: boolean;
  deployment_authorized: boolean;
  activation_authorized: boolean;
  preview_flag_state: string;
  preview_flag_enabled: boolean;
  provider_call_executed: boolean;
  supabase_write_executed: boolean;
  replay_created: boolean;
  confidence_applied: boolean;
  current_runtime_preview_state: string;
  next_action: string;
};

type VerifierReport = {
  verification_status: string;
  approval_decision: string;
  class_a_missing_paths: string[];
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

function runVerifier(relativePath: string): { verification_status: string; failed_conditions: string[] } {
  return JSON.parse(
    execFileSync("node", [relativePath], {
      cwd: root,
      encoding: "utf8",
      maxBuffer: 160 * 1024 * 1024,
    }),
  ) as { verification_status: string; failed_conditions: string[] };
}

test.beforeAll(() => {
  verifierReport = runVerifier(verifierPath) as VerifierReport;
});

test.describe("Action 490 command inventory binding remediation approval gate", () => {
  test("documents the static approval gate and passes verifier", () => {
    expect(existsSync(join(root, docPath))).toBe(true);
    expect(existsSync(join(root, recordPath))).toBe(true);
    expect(existsSync(join(root, verifierPath))).toBe(true);

    const doc = read(docPath);
    expect(doc).toContain("Action 490 is a static approval gate");
    expect(doc).toContain("Class A: Candidate-Internal Commands");
    expect(doc).toContain("Class B: External Rehearsal-Control Checks");
    expect(doc).toContain("Approval decision: `blocked`");
    expect(verifierReport.verification_status).toBe("passed");
    expect(verifierReport.failed_conditions).toEqual([]);
  });

  test("preserves Action 489 abort result and root-cause classification", () => {
    const record = readJson<Action490Record>(recordPath);

    expect(record.source_action_result.rehearsal_decision).toBe("full_candidate_rehearsal_aborted");
    expect(record.source_action_result.abort_reason).toBe(
      "command_inventory_unresolvable_in_bound_30_file_candidate",
    );
    expect(record.source_action_result.source_safety_result).toBe("source_safety_passed");
    expect(record.source_action_result.source_only_git_integrity_result).toBe(
      "passed_git_diff_check_on_approved_source_overlay_without_node_modules_pathspec",
    );
    expect(record.source_action_result.dependency_materialization_result).toBe(
      "passed_temporary_verified_node_modules_copy",
    );
    expect(record.root_cause_classification).toBe(
      "rehearsal_control_tests_incorrectly_required_inside_frozen_deployment_candidate",
    );
    expect(verifierReport.checks.action489_abort).toBe(true);
    expect(verifierReport.checks.root_cause).toBe(true);
  });

  test("keeps exact candidate hashes and does not expand the candidate", () => {
    const record = readJson<Action490Record>(recordPath);

    expect(record.clean_base_identifier).toBe("15f9923c24ed1f3cf82d34656eeacbfd98a0d347");
    expect(record.approved_change_candidate_hash).toBe(
      "7a11d9c6697a9d89ffb3e762dd15185fda225bc8e39c80a212cd3729d05857f6",
    );
    expect(record.full_candidate_inventory_hash).toBe(
      "cc6a97c5797a1fa76a6bebe9be1497fe88819f1b73992b271c142ff61d3bc2f0",
    );
    expect(record.candidate_changed_file_count).toBe(30);
    expect(record.candidate_expansion_required).toBe(false);
    expect(record.candidate_hashes_changed).toBe(false);
    expect(record.later_action_artifacts_copied_into_candidate).toBe(false);
    expect(verifierReport.checks.candidate_bindings).toBe(true);
    expect(verifierReport.checks.no_candidate_expansion).toBe(true);
  });

  test("separates Class A internal commands from Class B external control checks", () => {
    const record = readJson<Action490Record>(recordPath);

    expect(record.class_a_internal_command_inventory.map((command) => command.command_identity)).toContain(
      "npx next typegen",
    );
    expect(record.class_a_internal_command_inventory.map((command) => command.command_identity)).toContain(
      "npx tsc --noEmit",
    );
    expect(record.class_a_internal_command_inventory.map((command) => command.command_identity)).toContain(
      "npm run build",
    );
    expect(record.class_a_internal_command_inventory.map((command) => command.command_identity)).toContain(
      "npm run lint",
    );
    expect(record.class_a_internal_command_inventory.map((command) => command.command_id)).toContain(
      "action_461_preview_consumer_suite",
    );
    expect(record.class_a_internal_command_inventory.map((command) => command.command_id)).toContain(
      "action_462_independent_preview_consumer_suite",
    );
    expect(record.class_a_internal_command_inventory.map((command) => command.command_id)).toContain(
      "recommendation_details_regression_suite",
    );
    expect(record.class_b_external_control_inventory).toContain(
      "tests/e2e/action-489-confidence-calibration-recommendation-advisory-projection-preview-full-candidate-build-rehearsal-retry-after-source-safety-remediation.spec.ts",
    );
    expect(record.class_b_external_control_inventory).toContain(
      "tests/e2e/action-490-confidence-calibration-recommendation-advisory-projection-preview-command-inventory-binding-remediation-approval-gate.spec.ts",
    );
    expect(record.later_action_tests_classified_control_only).toBe(true);
    expect(verifierReport.checks.class_a_inventory_shape).toBe(true);
    expect(verifierReport.checks.class_b_inventory).toBe(true);
  });

  test("does not externalize runtime-required coverage", () => {
    const record = readJson<Action490Record>(recordPath);
    const policy = record.candidate_runtime_relevance_policy;

    expect(policy.must_remain_internal_preview_consumer_itself).toBe(true);
    expect(policy.must_remain_internal_recommendation_details_rendering).toBe(true);
    expect(policy.must_remain_internal_projection_call_site_behavior).toBe(true);
    expect(policy.must_remain_internal_runtime_route_absence).toBe(true);
    expect(policy.must_remain_internal_runtime_side_effect_absence).toBe(true);
    expect(Object.values(policy).every(Boolean)).toBe(true);
    expect(verifierReport.checks.runtime_relevance_policy).toBe(true);
  });

  test("blocks approval when a true Class A runtime path is missing", () => {
    const record = readJson<Action490Record>(recordPath);

    expect(record.class_a_required_path_count).toBe(31);
    expect(record.class_a_missing_path_count).toBe(1);
    expect(record.class_a_missing_paths).toEqual(["lib/pure-confidence-calibration.ts"]);
    expect(record.approval_decision).toBe("blocked");
    expect(record.approval_blockers).toContain(
      "runtime_required_internal_path_missing_from_frozen_candidate:lib/pure-confidence-calibration.ts",
    );
    expect(record.unresolved_conditions).toEqual([]);
    expect(verifierReport.class_a_missing_paths).toEqual(["lib/pure-confidence-calibration.ts"]);
    expect(verifierReport.checks.missing_internal_path_blocks_approval).toBe(true);
  });

  test("freezes execution ordering and one future rehearsal attempt", () => {
    const record = readJson<Action490Record>(recordPath);

    expect(record.execution_sequence).toEqual([
      "phase_0_safe_temp_path_validation",
      "phase_1_source_candidate_reconstruction_overlay_hash_verification_source_inventory_source_safety_git_integrity",
      "phase_2_dependency_materialization_and_extraneous_package_exclusion",
      "phase_3a_candidate_internal_commands_serially",
      "phase_4_post_command_integrity_bounded_evidence_record_temp_cleanup",
      "phase_5_external_rehearsal_control_verifiers_and_tests_after_cleanup",
    ]);
    expect(record.rehearsal_attempt_count_for_action_491).toBe(1);
    expect(record.external_post_rehearsal_checks_count_as_attempt).toBe(false);
    expect(record.external_control_checks_after_cleanup_only).toBe(true);
    expect(record.external_control_checks_can_mutate_candidate).toBe(false);
    expect(verifierReport.checks.execution_sequence).toBe(true);
  });

  test("freezes failure semantics and result vocabularies", () => {
    const record = readJson<Action490Record>(recordPath);

    expect(record.failure_semantics.internal_command_failure_after_commands_begin).toBe(
      "full_candidate_rehearsal_failed",
    );
    expect(record.failure_semantics.missing_required_internal_path_before_commands).toBe(
      "full_candidate_rehearsal_aborted",
    );
    expect(record.failure_semantics.external_control_failure_after_candidate_internal_pass).toBe(
      "rehearsal_evidence_verification_failed",
    );
    expect(record.failure_semantics.external_failure_must_not_claim_candidate_runtime_build_failed).toBe(true);
    expect(record.candidate_rehearsal_result_vocabulary).toEqual([
      "full_candidate_rehearsal_passed",
      "full_candidate_rehearsal_failed",
      "full_candidate_rehearsal_aborted",
    ]);
    expect(record.external_evidence_result_vocabulary).toEqual([
      "rehearsal_evidence_verified",
      "rehearsal_evidence_verification_failed",
      "rehearsal_evidence_verification_aborted",
    ]);
    expect(record.overall_readiness_vocabulary).toEqual([
      "ready_for_preview_deployment_final_approval",
      "ready_with_conditions",
      "blocked",
    ]);
    expect(record.approval_vocabulary).toEqual(["approved", "approved_with_conditions", "blocked"]);
    expect(verifierReport.checks.failure_semantics).toBe(true);
    expect(verifierReport.checks.vocabularies).toBe(true);
  });

  test("does not authorize rehearsal, deployment, activation, provider, Supabase, replay, confidence, or feedback", () => {
    const record = readJson<Action490Record>(recordPath);

    expect(record.rehearsal_attempt_authorized).toBe(false);
    expect(record.deployment_authorized).toBe(false);
    expect(record.activation_authorized).toBe(false);
    expect(record.provider_call_executed).toBe(false);
    expect(record.supabase_write_executed).toBe(false);
    expect(record.replay_created).toBe(false);
    expect(record.confidence_applied).toBe(false);
    expect(record.preview_flag_state).toBe("absent_or_disabled");
    expect(record.preview_flag_enabled).toBe(false);
    expect(record.current_runtime_preview_state).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(verifierReport.checks.no_effects).toBe(true);
    expect(verifierReport.checks.preview_state).toBe(true);
  });

  test("points to the blocker-specific Action 491 remediation gate", () => {
    const record = readJson<Action490Record>(recordPath);

    expect(record.next_action).toBe("action_491_candidate_runtime_dependency_completeness_remediation_gate");
    expect(verifierReport.checks.next_action).toBe(true);
  });

  test("keeps Actions 488 and 489 verifiers healthy", () => {
    const action488 = runVerifier(action488VerifierPath);
    const action489 = runVerifier(action489VerifierPath);

    expect(action488.verification_status).toBe("passed");
    expect(action488.failed_conditions).toEqual([]);
    expect(action489.verification_status).toBe("passed");
    expect(action489.failed_conditions).toEqual([]);
    expect(verifierReport.checks.action488_healthy).toBe(true);
  });
});
