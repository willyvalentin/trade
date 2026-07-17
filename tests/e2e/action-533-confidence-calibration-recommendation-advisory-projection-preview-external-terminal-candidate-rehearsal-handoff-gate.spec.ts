import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join, resolve } from "path";

import { expect, test } from "@playwright/test";

const repoRoot = resolve(__dirname, "../..");
const recordPath =
  "docs/action-533-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-candidate-rehearsal-handoff-approval-record.json";
const docPath =
  "docs/action-533-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-candidate-rehearsal-handoff-gate.md";
const action532RecordPath =
  "docs/action-532-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-runner-precheck-evidence-acceptance-record.json";
const scriptPath =
  "scripts/action-534-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-candidate-rehearsal.mjs";
const resultVerifierPath =
  "scripts/action-534-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-candidate-rehearsal-result-verify.mjs";
const verifierPath =
  "scripts/action-533-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-candidate-rehearsal-handoff-gate-verify.mjs";
const resultPath =
  "docs/action-534-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-candidate-rehearsal-result.json";

type NestedRecord = Record<string, unknown>;
type JsonObject = Record<string, unknown> &
  Record<
    | "attempt_accounting"
    | "child_environment_policy"
    | "cleanup_policy"
    | "dependency_materialization_policy"
    | "hidden_input_policy"
    | "path_safety_policy"
    | "preview_flag_policy"
    | "reconstruction_policy"
    | "runtime_build_closure_policy"
    | "sanitization_policy"
    | "webpack_diagnostic_policy",
    NestedRecord
  >;

function read(relativePath: string): string {
  return readFileSync(join(repoRoot, relativePath), "utf8");
}

function readJson(relativePath: string): JsonObject {
  return JSON.parse(read(relativePath)) as JsonObject;
}

test.describe("Action 533 external Terminal candidate rehearsal handoff gate", () => {
  test("binds Action 532 approval and exact Action 518 candidate hashes", () => {
    const record = readJson(recordPath);
    const action532 = readJson(action532RecordPath);

    expect(action532.evidence_acceptance_result).toBe("external_terminal_runner_evidence_accepted");
    expect(action532.rehearsal_environment_readiness).toBe("external_terminal_candidate_rehearsal_environment_ready");
    expect(action532.approval_decision).toBe("approved");
    expect(record.action_532_evidence_acceptance_result).toBe(action532.evidence_acceptance_result);
    expect(record.action_532_approval_decision).toBe("approved");
    expect(record.clean_base_identifier).toBe("15f9923c24ed1f3cf82d34656eeacbfd98a0d347");
    expect(record.change_candidate_hash).toBe("bc43bd1fe8f61561ddededd2263d64f7d12f37db46d184e3bfd0ea55a8b538de");
    expect(record.full_candidate_inventory_hash).toBe("80620318166b0b9e1858cff3f12fc78d9ad77d9116655335e1c7fd7e566930b0");
    expect(record.candidate_file_count).toBe(32);
    expect(record.remediated_route_hash).toBe("26407a8b78625a19a48a02ecf44e03db1642998da5f1d8acc5e8d47227773265");
    expect(record.route_export_surface).toEqual(["POST"]);
  });

  test("requires external Terminal exact command and forbids Codex or VS Code execution", () => {
    const record = readJson(recordPath);
    const doc = read(docPath);

    expect(record.execution_boundary_required).toBe("operator_unrestricted_local_terminal");
    expect(record.operator_terminal_required).toBe("macOS Terminal.app");
    expect(record.vscode_integrated_terminal_allowed).toBe(false);
    expect(record.codex_runner_allowed).toBe(false);
    expect(record.operator_run_limit).toBe(1);
    expect(record.operator_command).toBe(
      "node scripts/action-534-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-candidate-rehearsal.mjs",
    );
    expect(record.operator_command_arguments_allowed).toBe(false);
    expect(doc).toContain(record.operator_command);
  });

  test("defines hidden input terminal restoration and ephemeral environment policy", () => {
    const record = readJson(recordPath);
    const script = read(scriptPath);

    expect(record.hidden_input_policy.required_public_build_signals).toEqual([
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    ]);
    expect(record.hidden_input_policy.tty_required).toBe(true);
    expect(record.hidden_input_policy.raw_mode_hidden_input).toBe(true);
    expect(record.hidden_input_policy.terminal_restoration).toBe(
      "raw_mode_restored_on_completion_error_and_interruption",
    );
    expect(record.hidden_input_policy.cli_values_allowed).toBe(false);
    expect(record.hidden_input_policy.env_file_allowed).toBe(false);
    expect(record.hidden_input_policy.value_hashing_allowed).toBe(false);
    expect(record.child_environment_policy.server_only_secret_allowed).toBe(false);
    expect(record.child_environment_policy.full_environment_dump_allowed).toBe(false);
    expect(script).toContain("import { readHiddenValue }");
    expect(script).toContain("requireTTY: true");
    expect(script).toContain("installProcessHandlers: true");
    expect(script).not.toContain(".env.local");
    expect(script).not.toContain("process.argv[2]");
  });

  test("defines exact Action 534 temp path candidate reconstruction integrity and preview flag gates", () => {
    const record = readJson(recordPath);
    const script = read(scriptPath);

    expect(record.safe_temp_subtree).toBe(
      "ture/action-534-confidence-calibration-projection-preview-external-terminal-candidate-rehearsal",
    );
    expect(record.path_safety_policy.var_private_var_equivalence).toBe(true);
    expect(record.path_safety_policy.target_and_parent_symlink_rejection).toBe(true);
    expect(record.reconstruction_policy.candidate_hash_verification_before_commands).toBe(true);
    expect(record.reconstruction_policy.missing_candidate_paths_required).toBe(0);
    expect(record.reconstruction_policy.additional_api_routes_required).toBe(0);
    expect(record.runtime_build_closure_policy.runtime_dependency_closure).toBe("complete");
    expect(record.preview_flag_policy.canonical_flag).toBe("CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED");
    expect(record.preview_flag_policy.result).toBe("preview_flag_disabled_verified");
    expect(script).toContain("prepareActionTempTarget");
    expect(script).toContain("materializeCleanBase");
    expect(script).toContain("applyCandidateInventory");
    expect(script).toContain("verifyCandidateIntegrity");
    expect(script).toContain("preview_flag_disabled_verified");
  });

  test("defines dependency materialization command sequence build and webpack limits", () => {
    const record = readJson(recordPath);
    const script = read(scriptPath);

    expect(record.dependency_materialization_policy.mode).toBe("temporary_verified_node_modules_copy");
    expect(record.dependency_materialization_policy.candidate_local_next_version).toBe("16.2.6");
    expect(record.dependency_materialization_policy.install_allowed).toBe(false);
    expect(record.dependency_materialization_policy.network_allowed).toBe(false);
    expect(record.prebuild_command_sequence).toEqual([
      "candidate integrity confirmation",
      "strict source-safety/hash matrix",
      "semantic preview-flag matrix",
      "npx next typegen",
      "npx tsc --noEmit",
    ]);
    expect(record.authoritative_build_command).toBe("npm run build");
    expect(record.authoritative_build_attempt_limit).toBe(1);
    expect(record.webpack_diagnostic_policy.only_after_authoritative_failure).toBe(true);
    expect(record.webpack_diagnostic_policy.attempt_limit).toBe(1);
    expect(record.webpack_diagnostic_policy.can_establish_readiness).toBe(false);
    expect(script).toContain('npx", args: ["next", "typegen"]');
    expect(script).toContain('npx", args: ["tsc", "--noEmit"]');
    expect(script).toContain('spawnChecked("npm", ["run", "build"]');
    expect(script).toContain('"build", "--webpack"');
    expect(script).toContain('spawnChecked("npm", ["run", "lint"]');
  });

  test("defines remaining checks attempt accounting sanitization cleanup and Action 535 boundary", () => {
    const record = readJson(recordPath);
    const script = read(scriptPath);
    const resultVerifier = read(resultVerifierPath);

    expect(record.remaining_command_sequence_after_build_pass).toContain("runtime-facing projection call-site scan exactly 1");
    expect(record.attempt_accounting.operator_rehearsal_attempts).toBe(1);
    expect(record.attempt_accounting.authoritative_build_attempts).toBe(1);
    expect(record.attempt_accounting.total_build_process_invocations_max).toBe(2);
    expect(record.attempt_accounting.second_authoritative_build).toBe(false);
    expect(record.sanitization_policy.public_environment_values_retained).toBe(false);
    expect(record.sanitization_policy.absolute_machine_paths_retained).toBe(false);
    expect(record.sanitization_policy.complete_logs_retained).toBe(false);
    expect(record.cleanup_policy.remove_only_action_534_subtree).toBe(true);
    expect(record.cleanup_policy.netlify_untouched).toBe(true);
    expect(script).toContain("runtime_projection_call_site_count");
    expect(script).toContain("external_terminal_candidate_rehearsal_passed");
    expect(script).toContain("action_535_external_terminal_candidate_rehearsal_evidence_acceptance_gate");
    expect(resultVerifier).toContain("action_534_external_terminal_candidate_rehearsal_result_v1");
    expect(resultVerifier).toContain("hasUnsafeRetainedContent");
  });

  test("does not execute Action 534 during Action 533 and tolerates bounded historical results", () => {
    const record = readJson(recordPath);
    const resultExists = existsSync(join(repoRoot, resultPath));

    expect(record.operator_script_executed_by_action_533).toBe(false);
    expect(record.build_performed_by_action_533).toBe(false);
    expect(record.candidate_reconstructed_by_action_533).toBe(false);
    expect(record.rehearsal_performed_by_action_533).toBe(false);
    expect(record.deployment_performed_by_action_533).toBe(false);
    expect(record.preview_activated_by_action_533).toBe(false);
    expect(record.deployment_authorization).toBe(false);
    expect(record.preview_activation_authorization).toBe(false);
    expect(record.result_file_expected_now).toBe(false);
    if (resultExists) {
      const result = readJson(resultPath);
      expect(["external_terminal_candidate_rehearsal_aborted", "external_terminal_candidate_rehearsal_failed"]).toContain(
        result.candidate_rehearsal_result,
      );
      expect([0, 1]).toContain(result.authoritative_build_attempt_count);
      expect(result.deployment_performed).toBe(false);
      expect(result.preview_activated).toBe(false);
    }
  });

  test("passes syntax checks and Action 533 verifier", () => {
    execFileSync("node", ["--check", scriptPath], { cwd: repoRoot, encoding: "utf8" });
    execFileSync("node", ["--check", resultVerifierPath], { cwd: repoRoot, encoding: "utf8" });
    const output = JSON.parse(
      execFileSync("node", [verifierPath], { cwd: repoRoot, encoding: "utf8" }),
    ) as JsonObject;

    expect(output.verification_status).toBe("passed");
    expect(output.operator_script_executed_by_action_533).toBe(false);
    expect(output.build_performed).toBe(false);
    expect(output.rehearsal_performed).toBe(false);
    expect(output.deployment_performed).toBe(false);
    expect(output.preview_activated).toBe(false);
    expect(output.runtime_preview_state).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(output.next_action).toBe("action_534_external_terminal_candidate_rehearsal_operator_execution");
  });
});
