import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join, resolve } from "path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const recordPath =
  "docs/action-507-confidence-calibration-recommendation-advisory-projection-preview-turbopack-comparison-invocation-completion-record.json";
const docPath =
  "docs/action-507-confidence-calibration-recommendation-advisory-projection-preview-turbopack-comparison-invocation-completion-gate.md";
const verifierPath =
  "scripts/action-507-confidence-calibration-recommendation-advisory-projection-preview-turbopack-comparison-invocation-completion-gate-verify.mjs";
const action505VerifierPath =
  "scripts/action-505-confidence-calibration-recommendation-advisory-projection-preview-runner-environment-precheck-completion-gate-verify.mjs";
const action506VerifierPath =
  "scripts/action-506-confidence-calibration-recommendation-advisory-projection-preview-turbopack-runner-environment-comparison-and-rehearsal-gate-verify.mjs";

type Action507Record = {
  action_506_approval_decision: string;
  clean_base_identifier: string;
  change_candidate_hash: string;
  full_candidate_inventory_hash: string;
  candidate_file_count: number;
  authoritative_build_command: string;
  installed_next_tooling_classification: string;
  comparison_invocation_classification_vocabulary: string[];
  comparison_invocation_classification: string;
  comparison_invocation_supported: boolean;
  supported_by_installed_tooling: boolean;
  comparison_engine_classification: string;
  comparison_invocation: Record<string, unknown>;
  authoritative_attempt_limit: number;
  comparison_attempt_limit: number;
  maximum_build_process_invocations: number;
  future_action_508_sequence: string[];
  future_action_508_boundary: Record<string, unknown>;
  outcome_mapping: Record<string, Record<string, unknown>>;
  candidate_preservation: Record<string, unknown>;
  invocation_readiness_vocabulary: string[];
  invocation_readiness: string;
  execution_readiness_vocabulary: string[];
  execution_readiness: string;
  approval_vocabulary: string[];
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

test.describe("Action 507 Turbopack comparison invocation completion gate", () => {
  test("binds Action 506 approved-with-conditions result and exact candidate hashes", () => {
    expect(existsSync(join(root, recordPath))).toBe(true);
    expect(existsSync(join(root, docPath))).toBe(true);
    expect(existsSync(join(root, verifierPath))).toBe(true);
    const record = readJson<Action507Record>(recordPath);
    expect(record.action_506_approval_decision).toBe("approved_with_conditions");
    expect(record.clean_base_identifier).toBe("15f9923c24ed1f3cf82d34656eeacbfd98a0d347");
    expect(record.change_candidate_hash).toBe("c005946d3a21df32730306687d125ef1ba4439500da7ec22288ec92d802d667c");
    expect(record.full_candidate_inventory_hash).toBe("d96af34b0c488ef16f614b2be731052c2099e0b6efde57f76115eb8d5c779a0f");
    expect(record.candidate_file_count).toBe(31);
  });

  test("preserves authoritative npm run build", () => {
    const record = readJson<Action507Record>(recordPath);
    expect(record.authoritative_build_command).toBe("npm run build");
    expect(record.authoritative_build_required_for_readiness).toBe(true);
    expect(record.comparison_establishes_deployment_readiness).toBe(false);
  });

  test("records supported comparison path", () => {
    const record = readJson<Action507Record>(recordPath);
    expect(record.installed_next_tooling_classification).toBe("next_16_2_6_build_cli_supports_explicit_webpack_flag");
    expect(record.comparison_invocation_classification).toBe("supported_non_turbopack_comparison_invocation");
    expect(record.comparison_invocation_supported).toBe(true);
    expect(record.supported_by_installed_tooling).toBe(true);
    expect(record.comparison_engine_classification).toBe("webpack_comparison_engine");
    expect(record.comparison_invocation.sanitized_command_form).toBe("next build --webpack");
    expect(record.comparison_invocation.executed).toBe(false);
  });

  test("freezes unsupported, ambiguous, and inspection-failed paths", () => {
    const record = readJson<Action507Record>(recordPath);
    expect(record.comparison_invocation_classification_vocabulary).toContain("supported_explicit_turbopack_invocation_only");
    expect(record.comparison_invocation_classification_vocabulary).toContain("no_supported_engine_selection_invocation");
    expect(record.comparison_invocation_classification_vocabulary).toContain("invocation_capability_ambiguous");
    expect(record.comparison_invocation_classification_vocabulary).toContain("invocation_inspection_failed");
  });

  test("freezes package, configuration, dependency, network, and install rejection paths", () => {
    const record = readJson<Action507Record>(recordPath);
    expect(record.comparison_invocation_classification_vocabulary).toContain("invocation_requires_package_script_change");
    expect(record.comparison_invocation_classification_vocabulary).toContain("invocation_requires_configuration_change");
    expect(record.comparison_invocation_classification_vocabulary).toContain("invocation_requires_dependency_change");
    expect(record.package_script_change_required).toBe(false);
    expect(record.configuration_change_required).toBe(false);
    expect(record.dependency_change_required).toBe(false);
    expect(record.network_required).toBe(false);
    expect(record.install_required).toBe(false);
  });

  test("freezes authoritative-first Action 508 sequence", () => {
    const record = readJson<Action507Record>(recordPath);
    expect(record.future_action_508_sequence).toHaveLength(7);
    expect(record.future_action_508_boundary.authoritative_first_sequence_required).toBe(true);
    expect(record.future_action_508_boundary.comparison_first_allowed).toBe(false);
    expect(record.future_action_508_boundary.authoritative_pass_skips_comparison).toBe(true);
  });

  test("permits one comparison only after same Turbopack resource failure", () => {
    const record = readJson<Action507Record>(recordPath);
    expect(record.future_action_508_boundary.same_turbopack_resource_failure_permits_one_comparison).toBe(true);
    expect(record.future_action_508_boundary.changed_authoritative_failure_classification_blocks_comparison).toBe(true);
    expect(record.comparison_attempt_limit).toBe(1);
  });

  test("enforces max two invocations and no duplicate authoritative builds", () => {
    const record = readJson<Action507Record>(recordPath);
    expect(record.authoritative_attempt_limit).toBe(1);
    expect(record.comparison_attempt_limit).toBe(1);
    expect(record.maximum_build_process_invocations).toBe(2);
    expect(record.same_action_retry_allowed).toBe(false);
    expect(record.two_authoritative_builds_allowed).toBe(false);
  });

  test("maps authoritative pass to comparison skip", () => {
    const record = readJson<Action507Record>(recordPath);
    expect(record.outcome_mapping.authoritative_build_passes.outcome).toBe("turbopack_passed_comparison_not_required");
    expect(record.outcome_mapping.authoritative_build_passes.comparison_attempt_count).toBe(0);
  });

  test("maps same failure comparison pass and changed failure behavior", () => {
    const record = readJson<Action507Record>(recordPath);
    expect(record.outcome_mapping.authoritative_same_resource_failure_and_comparison_passes.outcome).toBe(
      "turbopack_failed_comparison_passed",
    );
    expect(record.outcome_mapping.authoritative_failure_not_reproduced.outcome).toBe("turbopack_failure_not_reproduced");
    expect(record.outcome_mapping.authoritative_failure_not_reproduced.interpretation).toBe(
      "requires_nondeterminism_assessment",
    );
  });

  test("freezes comparison cannot establish readiness", () => {
    const record = readJson<Action507Record>(recordPath);
    expect(record.comparison_establishes_deployment_readiness).toBe(false);
    expect(record.future_action_508_boundary.comparison_cannot_establish_deployment_readiness).toBe(true);
    expect(record.future_action_508_boundary.authoritative_build_required_for_readiness).toBe(true);
  });

  test("requires candidate preservation without candidate changes", () => {
    const record = readJson<Action507Record>(recordPath);
    expect(record.candidate_change_required).toBe(false);
    expect(record.candidate_preservation.candidate_count_required).toBe(31);
    expect(record.candidate_preservation.change_hash_required).toBe(record.change_candidate_hash);
    expect(record.candidate_preservation.full_inventory_hash_required).toBe(record.full_candidate_inventory_hash);
    expect(record.candidate_preservation.package_json_unchanged_required).toBe(true);
    expect(record.candidate_preservation.next_config_unchanged_required).toBe(true);
  });

  test("freezes readiness and approval vocabularies", () => {
    const record = readJson<Action507Record>(recordPath);
    expect(record.invocation_readiness_vocabulary).toEqual([
      "comparison_invocation_ready",
      "comparison_invocation_ready_with_conditions",
      "comparison_invocation_blocked",
    ]);
    expect(record.execution_readiness_vocabulary).toEqual([
      "comparison_execution_ready",
      "comparison_execution_ready_with_conditions",
      "comparison_execution_blocked",
    ]);
    expect(record.approval_vocabulary).toEqual(["approved", "approved_with_conditions", "blocked"]);
    expect(record.invocation_readiness).toBe("comparison_invocation_ready");
    expect(record.execution_readiness).toBe("comparison_execution_ready");
    expect(record.approval_decision).toBe("approved");
  });

  test("performs no build, comparison, rehearsal, deployment, activation, or downstream effects", () => {
    const record = readJson<Action507Record>(recordPath);
    for (const key of [
      "build_performed",
      "comparison_performed",
      "rehearsal_performed",
      "deployment_performed",
      "preview_activated",
      "environment_modified",
      "network_used",
      "install_performed",
      "provider_called",
      "supabase_accessed",
      "persistence_created",
      "replay_created",
      "feedback_created",
      "confidence_applied",
      "downstream_behavior_changed",
    ]) {
      expect(record[key]).toBe(false);
    }
  });

  test("keeps runtime preview waiting and selects Action 508 rehearsal", () => {
    const record = readJson<Action507Record>(recordPath);
    expect(record.runtime_preview_state).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(record.unresolved_conditions).toEqual([]);
    expect(record.next_action).toBe(
      "action_508_turbopack_runner_environment_comparison_and_runtime_complete_candidate_rehearsal",
    );
  });

  test("verifier succeeds and Actions 505-506 remain healthy", () => {
    const action505 = runVerifier(action505VerifierPath);
    const action506 = runVerifier(action506VerifierPath);
    const action507 = runVerifier(verifierPath);
    expect(action505.verification_status).toBe("passed");
    expect(action506.verification_status).toBe("passed");
    expect(action507.verification_status).toBe("passed");
    expect(action507.approval_decision).toBe("approved");
  });

  test("documentation summarizes invocation completion", () => {
    const doc = read(docPath);
    expect(doc).toContain("Comparison invocation classification: `supported_non_turbopack_comparison_invocation`");
    expect(doc).toContain("Sanitized command form: `next build --webpack`");
    expect(doc).toContain("Invocation readiness: `comparison_invocation_ready`");
    expect(doc).toContain(
      "Next action: `action_508_turbopack_runner_environment_comparison_and_runtime_complete_candidate_rehearsal`",
    );
  });
});
