import { execFileSync } from "child_process";
import { createHash } from "crypto";
import { existsSync, readFileSync } from "fs";
import { join, resolve } from "path";

import { expect, test } from "@playwright/test";

const repoRoot = resolve(__dirname, "../..");
const recordPath =
  "docs/action-528-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-precheck-handoff-approval-record.json";
const docPath =
  "docs/action-528-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-precheck-handoff-gate.md";
const action527Path =
  "docs/action-527-confidence-calibration-recommendation-advisory-projection-preview-public-build-signal-operator-input-and-alternate-runner-precheck-record.json";
const scriptPath =
  "scripts/action-529-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-runner-precheck.mjs";
const resultVerifierPath =
  "scripts/action-529-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-runner-precheck-result-verify.mjs";
const resultPath =
  "docs/action-529-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-runner-precheck-result.json";
const verifierPath =
  "scripts/action-528-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-precheck-handoff-gate-verify.mjs";
const routePath = "app/api/recommendations/evaluate-outcomes/route.ts";

const expected = {
  cleanBase: "15f9923c24ed1f3cf82d34656eeacbfd98a0d347",
  changeHash: "bc43bd1fe8f61561ddededd2263d64f7d12f37db46d184e3bfd0ea55a8b538de",
  fullHash: "80620318166b0b9e1858cff3f12fc78d9ad77d9116655335e1c7fd7e566930b0",
  routeHash: "26407a8b78625a19a48a02ecf44e03db1642998da5f1d8acc5e8d47227773265",
  blocker: "codex_hosted_runner_not_equivalent_to_approved_unrestricted_local_terminal_boundary",
  command:
    "node scripts/action-529-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-runner-precheck.mjs",
};

type JsonObject = Record<string, unknown>;

function read(relativePath: string): string {
  return readFileSync(join(repoRoot, relativePath), "utf8");
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(read(relativePath)) as T;
}

function sha256(value: string | Buffer): string {
  return createHash("sha256").update(value).digest("hex");
}

test.describe("Action 528 external terminal precheck handoff gate", () => {
  test("binds Action 527 blocked result and exact candidate bindings", () => {
    const record = readJson<JsonObject>(recordPath);
    const action527 = readJson<JsonObject>(action527Path);
    const routeSource = read(routePath);

    expect(action527.overall_environment_readiness).toBe("candidate_rehearsal_environment_blocked");
    expect(action527.approval_decision).toBe("blocked");
    expect(record.action_527_overall_environment_readiness).toBe(action527.overall_environment_readiness);
    expect(record.action_527_approval_decision).toBe(action527.approval_decision);
    expect(record.clean_base_identifier).toBe(expected.cleanBase);
    expect(record.change_candidate_hash).toBe(expected.changeHash);
    expect(record.full_candidate_inventory_hash).toBe(expected.fullHash);
    expect(record.candidate_file_count).toBe(32);
    expect(record.remediated_route_hash).toBe(expected.routeHash);
    expect(sha256(routeSource)).toBe(expected.routeHash);
    expect(record.route_export_surface).toEqual(["POST"]);
  });

  test("freezes Codex runner rejection and external Terminal requirement", () => {
    const record = readJson<JsonObject>(recordPath);

    expect(record.blocker_classification).toBe(expected.blocker);
    expect(record.operator_environment_input_attempted).toBe(true);
    expect(record.codex_process_detected_input).toBe(false);
    expect(record.codex_loopback_capability).toBe("restricted");
    expect(record.codex_ephemeral_port_capability).toBe("restricted");
    expect(record.codex_ipc_capability).toBe("restricted");
    expect(record.operator_terminal_boundary).toBe("operator_unrestricted_local_terminal");
    expect(record.operator_must_use_macos_terminal).toBe(true);
    expect(record.operator_must_not_use_codex).toBe(true);
    expect(record.operator_must_not_use_vscode_integrated_terminal).toBe(true);
  });

  test("defines interactive input and rejects CLI value arguments", () => {
    const record = readJson<JsonObject>(recordPath);
    const script = read(scriptPath);

    expect(record.interactive_input_required).toBe(true);
    expect(record.operator_must_not_pass_arguments).toBe(true);
    expect(record.input_policy).toEqual(
      expect.arrayContaining([
        "prompt_for_next_public_supabase_url",
        "prompt_for_next_public_supabase_anon_key",
        "reject_non_interactive_stdin",
        "reject_cli_value_arguments",
        "keep_values_process_memory_only",
      ]),
    );
    expect(script).toContain("ensureInteractiveTerminal");
    expect(script).toContain("ensureNoArguments");
    expect(script).toContain("promptHidden");
    expect(script).not.toContain("process.argv[2]");
  });

  test("forbids value echo env files shell profiles and value retention", () => {
    const record = readJson<JsonObject>(recordPath);
    const script = read(scriptPath);

    expect(record.sanitization_policy).toEqual(
      expect.arrayContaining([
        "raw_values_recorded_false",
        "value_hashes_recorded_false",
        "env_file_written_false",
        "shell_profile_modified_false",
      ]),
    );
    expect(script).not.toContain(".env.local");
    expect(script).not.toContain("environment_values_hashed: true");
    expect(script).toContain("raw_environment_values_recorded: false");
    expect(script).toContain("env_file_written: false");
    expect(script).toContain("shell_profile_modified: false");
  });

  test("defines exact temp path and loopback port IPC checks", () => {
    const record = readJson<JsonObject>(recordPath);
    const script = read(scriptPath);

    expect(record.temp_boundary_identity).toBe(
      "system_temp_ture_action_529_confidence_calibration_projection_preview_external_terminal_runner_precheck_subtree",
    );
    expect(record.temp_boundary_policy).toEqual(
      expect.arrayContaining([
        "canonical_trusted_temp_root",
        "path_relative_containment",
        "string_prefix_rejection",
        "symlink_rejection",
        "exact_action_529_identity",
      ]),
    );
    expect(script).toContain("action-529-confidence-calibration-projection-preview-external-terminal-runner-precheck");
    expect(record.capability_check_inventory).toEqual(
      expect.arrayContaining(["loopback_bind", "os_assigned_ephemeral_port", "local_ipc_or_socket"]),
    );
  });

  test("defines sanitized Action 529 output schema and result verifier", () => {
    const record = readJson<JsonObject>(recordPath);
    const script = read(scriptPath);
    const resultVerifier = read(resultVerifierPath);

    expect(record.result_path).toBe(resultPath);
    expect(record.result_verifier_path).toBe(resultVerifierPath);
    expect(script).toContain(resultPath);
    expect(script).toContain("external_terminal_runner_precheck_passed");
    expect(script).toContain("action_530_external_terminal_runner_precheck_evidence_acceptance_gate");
    expect(resultVerifier).toContain(resultPath);
    expect(resultVerifier).toContain("value_recorded === false");
    expect(resultVerifier).toContain("environment_values_hashed === false");
  });

  test("does not execute Action 529 or create the result during Action 528", () => {
    const record = readJson<JsonObject>(recordPath);

    expect(record.action_529_script_created).toBe(true);
    expect(record.action_529_script_executed_by_action_528).toBe(false);
    expect(record.action_529_result_allowed_now).toBe(false);
    expect(record.action_529_result_exists_now).toBe(false);
    expect(existsSync(join(repoRoot, resultPath))).toBe(false);
  });

  test("freezes exact operator command and Action 529 530 boundaries", () => {
    const record = readJson<JsonObject>(recordPath);
    const doc = read(docPath);

    expect(record.operator_command).toBe(expected.command);
    expect(record.next_action).toBe("action_529_external_terminal_runner_precheck_operator_execution");
    expect(doc).toContain(expected.command);
    expect(doc).toContain("Action 530 must verify the generated result");
  });

  test("keeps build rehearsal deployment activation and downstream effects disabled", () => {
    const record = readJson<JsonObject>(recordPath);
    const falseKeys = [
      "precheck_execution_authorized_by_action_528",
      "build_authorized",
      "rehearsal_authorized",
      "deployment_authorized",
      "activation_authorized",
      "provider_call_authorized",
      "supabase_access_authorized",
      "persistence_authorized",
      "replay_authorized",
      "confidence_application_authorized",
      "feedback_authorized",
      "downstream_behavior_change_authorized",
    ];

    for (const key of falseKeys) expect(record[key], key).toBe(false);
    expect(record.runtime_preview_state).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(record.approval_decision).toBe("approved");
  });

  test("documentation and records contain no assignment-like secrets", () => {
    const doc = read(docPath);
    const record = read(recordPath);

    expect(doc).toContain(expected.blocker);
    expect(doc).toContain("Action 529 script executed by Action 528: `false`");
    expect(doc).not.toMatch(/=[A-Za-z0-9+/_.:-]{16,}/);
    expect(record).not.toMatch(/=[A-Za-z0-9+/_.:-]{16,}/);
  });

  test("runs Action 528 verifier and keeps Actions 526 527 healthy", () => {
    const result = JSON.parse(
      execFileSync("node", [verifierPath], { cwd: repoRoot, encoding: "utf8" }),
    ) as JsonObject;
    const action527 = JSON.parse(
      execFileSync(
        "node",
        [
          "scripts/action-527-confidence-calibration-recommendation-advisory-projection-preview-public-build-signal-operator-input-and-alternate-runner-precheck-gate-verify.mjs",
        ],
        { cwd: repoRoot, encoding: "utf8" },
      ),
    ) as JsonObject;
    const action526 = JSON.parse(
      execFileSync(
        "node",
        [
          "scripts/action-526-confidence-calibration-recommendation-advisory-projection-preview-public-build-environment-and-loopback-capability-remediation-gate-verify.mjs",
        ],
        { cwd: repoRoot, encoding: "utf8" },
      ),
    ) as JsonObject;

    expect(result.verification_status).toBe("passed");
    expect(result.action_529_script_executed).toBe(false);
    expect(action527.verification_status).toBe("passed");
    expect(action526.verification_status).toBe("passed");
  });
});
