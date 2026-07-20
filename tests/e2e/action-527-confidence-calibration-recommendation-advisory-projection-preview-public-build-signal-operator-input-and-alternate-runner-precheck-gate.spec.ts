import { execFileSync } from "child_process";
import { createHash } from "crypto";
import { readFileSync } from "fs";
import { join, resolve } from "path";

import { expect, test } from "@playwright/test";

const repoRoot = resolve(__dirname, "../..");
const recordPath =
  "docs/action-527-confidence-calibration-recommendation-advisory-projection-preview-public-build-signal-operator-input-and-alternate-runner-precheck-record.json";
const docPath =
  "docs/action-527-confidence-calibration-recommendation-advisory-projection-preview-public-build-signal-operator-input-and-alternate-runner-precheck-gate.md";
const action526Path =
  "docs/action-526-confidence-calibration-recommendation-advisory-projection-preview-public-build-environment-and-loopback-capability-remediation-approval-record.json";
const verifierPath =
  "scripts/action-527-confidence-calibration-recommendation-advisory-projection-preview-public-build-signal-operator-input-and-alternate-runner-precheck-gate-verify.mjs";
const routePath = "app/api/recommendations/evaluate-outcomes/route.ts";

const expected = {
  cleanBase: "15f9923c24ed1f3cf82d34656eeacbfd98a0d347",
  changeHash: "bc43bd1fe8f61561ddededd2263d64f7d12f37db46d184e3bfd0ea55a8b538de",
  fullHash: "80620318166b0b9e1858cff3f12fc78d9ad77d9116655335e1c7fd7e566930b0",
  routeHash: "26407a8b78625a19a48a02ecf44e03db1642998da5f1d8acc5e8d47227773265",
  nextBlocked: "action_528_public_build_signal_operator_input_and_alternate_runner_capability_remediation_gate",
  nextReady:
    "action_528_remediated_32_file_candidate_build_rehearsal_retry_in_approved_local_terminal_boundary",
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

function publicReadiness(signals: JsonObject[]): string {
  return signals.every(
    (signal) =>
      signal.presence === "present_in_parent_environment" &&
      signal.safe_shape === "valid_shape" &&
      signal.propagation_eligible === true,
  )
    ? "public_build_environment_ready"
    : "public_build_environment_blocked";
}

function overallDecision(publicStatus: string, runnerStatus: string): JsonObject {
  if (
    publicStatus === "public_build_environment_ready" &&
    runnerStatus === "alternate_runner_capability_ready"
  ) {
    return {
      overall: "candidate_rehearsal_environment_ready",
      approval: "approved",
      next: expected.nextReady,
    };
  }
  return {
    overall: "candidate_rehearsal_environment_blocked",
    approval: "blocked",
    next: expected.nextBlocked,
  };
}

test.describe("Action 527 public build signal operator input and alternate runner precheck gate", () => {
  test("binds Action 526 and exact candidate bindings", () => {
    const record = readJson<JsonObject>(recordPath);
    const action526 = readJson<JsonObject>(action526Path);
    const routeSource = read(routePath);

    expect(action526.remediation_readiness).toBe("execution_boundary_remediation_ready_with_operator_input");
    expect(action526.approval_decision).toBe("approved_with_conditions");
    expect(record.source_action).toBe(526);
    expect(record.action_526_remediation_readiness).toBe(action526.remediation_readiness);
    expect(record.clean_base_identifier).toBe(expected.cleanBase);
    expect(record.change_candidate_hash).toBe(expected.changeHash);
    expect(record.full_candidate_inventory_hash).toBe(expected.fullHash);
    expect(record.candidate_file_count).toBe(32);
    expect(record.remediated_route_hash).toBe(expected.routeHash);
    expect(sha256(routeSource)).toBe(expected.routeHash);
    expect(record.route_export_surface).toEqual(["POST"]);
  });

  test("records both public signals as absent without retaining values", () => {
    const record = readJson<JsonObject>(recordPath);
    const signals = record.required_public_build_signals as JsonObject[];

    expect(signals).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "NEXT_PUBLIC_SUPABASE_URL",
          presence: "absent_in_parent_environment",
          safe_shape: "shape_not_checked",
          propagation_eligible: false,
        }),
        expect.objectContaining({
          key: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
          presence: "absent_in_parent_environment",
          safe_shape: "shape_not_checked",
          propagation_eligible: false,
        }),
      ]),
    );
    expect(record.manual_operator_input_detected_without_values).toBe(false);
    expect(record.raw_environment_values_recorded).toBe(false);
    expect(record.environment_value_hashes_recorded).toBe(false);
  });

  test("covers both present either missing and blocked public readiness paths", () => {
    const presentUrl = {
      key: "NEXT_PUBLIC_SUPABASE_URL",
      presence: "present_in_parent_environment",
      safe_shape: "valid_shape",
      propagation_eligible: true,
    };
    const presentAnon = {
      key: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      presence: "present_in_parent_environment",
      safe_shape: "valid_shape",
      propagation_eligible: true,
    };

    expect(publicReadiness([presentUrl, presentAnon])).toBe("public_build_environment_ready");
    expect(publicReadiness([{ ...presentUrl, presence: "absent_in_parent_environment" }, presentAnon])).toBe(
      "public_build_environment_blocked",
    );
    expect(publicReadiness([presentUrl, { ...presentAnon, safe_shape: "shape_not_checked" }])).toBe(
      "public_build_environment_blocked",
    );
  });

  test("rejects secret propagation and keeps ephemeral environment blocked", () => {
    const record = readJson<JsonObject>(recordPath);

    expect(record.server_only_secrets_required).toBe(false);
    expect(record.service_role_key_propagated).toBe(false);
    expect(record.database_password_propagated).toBe(false);
    expect(record.provider_key_propagated).toBe(false);
    expect(record.netlify_token_propagated).toBe(false);
    expect(record.broker_credential_propagated).toBe(false);
    expect(record.prohibited_secret_values_inspected).toBe(false);
    expect(record.environment_construction_result).toBe("ephemeral_build_environment_blocked");
    expect(record.environment_persisted).toBe(false);
    expect(record.env_file_written).toBe(false);
    expect(record.shell_profile_modified).toBe(false);
  });

  test("records exact temp boundary and macOS alias safety semantics", () => {
    const record = readJson<JsonObject>(recordPath);

    expect(record.temp_boundary_identity).toBe(
      "system_temp_ture_action_527_confidence_calibration_projection_preview_alternate_runner_precheck_subtree",
    );
    expect(record.canonical_trusted_temp_root).toBe(true);
    expect(record.macos_var_private_var_equivalence_allowed).toBe(true);
    expect(record.path_relative_containment_used).toBe(true);
    expect(record.string_prefix_containment_used).toBe(false);
    expect(record.traversal_rejected).toBe(true);
    expect(record.symlink_rejected).toBe(true);
    expect(record.forbidden_root_separation_verified).toBe(true);
    expect(record.candidate_source_written).toBe(false);
  });

  test("records child process loopback port local IPC and temp output capabilities", () => {
    const record = readJson<JsonObject>(recordPath);

    expect(record.child_process_spawn).toBe("passed");
    expect(record.child_process_exit).toBe("success");
    expect(record.child_process_fixed_output_only).toBe(true);
    expect(record.external_network_used).toBe(false);
    expect(record.nextjs_invoked).toBe(false);
    expect(record.loopback_binding).toBe("failed");
    expect(record.ephemeral_port_binding).toBe("failed");
    expect(record.local_ipc_capability).toBe("failed");
    expect(record.temp_output_capability).toBe("passed");
    expect(record.repository_next_directory_used).toBe(false);
  });

  test("records resource classifications and cleanup", () => {
    const record = readJson<JsonObject>(recordPath);

    expect(record.child_process_capacity).toBe("sufficient");
    expect(record.loopback_capacity).toBe("unavailable");
    expect(record.local_ipc_capacity).toBe("unavailable");
    expect(record.file_descriptor_capacity).toBe("sufficient");
    expect(record.process_resource_capacity).toBe("sufficient");
    expect(record.temp_output_capacity).toBe("sufficient");
    expect(record.cleanup_result).toBe("passed");
    expect(record.test_files_removed).toBe(true);
    expect(record.socket_or_ipc_removed).toBe(true);
    expect(record.loopback_server_closed).toBe(true);
    expect(record.target_absent_after_cleanup).toBe(true);
    expect(record.project_files_changed_by_precheck).toBe(false);
  });

  test("covers ready and blocked overall decision paths and Action 528 boundary", () => {
    expect(overallDecision("public_build_environment_ready", "alternate_runner_capability_ready")).toEqual({
      overall: "candidate_rehearsal_environment_ready",
      approval: "approved",
      next: expected.nextReady,
    });
    expect(overallDecision("public_build_environment_blocked", "alternate_runner_capability_ready")).toEqual({
      overall: "candidate_rehearsal_environment_blocked",
      approval: "blocked",
      next: expected.nextBlocked,
    });
    expect(overallDecision("public_build_environment_ready", "alternate_runner_capability_blocked")).toEqual({
      overall: "candidate_rehearsal_environment_blocked",
      approval: "blocked",
      next: expected.nextBlocked,
    });
  });

  test("blocks this run and keeps build rehearsal deployment activation disabled", () => {
    const record = readJson<JsonObject>(recordPath);
    const falseKeys = [
      "candidate_change_required",
      "candidate_hash_change_required",
      "package_or_config_change_required",
      "build_performed",
      "webpack_executed",
      "rehearsal_performed",
      "deployment_performed",
      "preview_activated",
      "provider_called",
      "supabase_accessed",
      "persistence_created",
      "replay_created",
      "confidence_applied",
      "feedback_created",
      "downstream_behavior_changed",
    ];

    expect(record.public_environment_readiness).toBe("public_build_environment_blocked");
    expect(record.alternate_runner_readiness).toBe("alternate_runner_capability_blocked");
    expect(record.overall_environment_readiness).toBe("candidate_rehearsal_environment_blocked");
    expect(record.approval_decision).toBe("blocked");
    expect(record.next_action).toBe(expected.nextBlocked);
    for (const key of falseKeys) expect(record[key], key).toBe(false);
    expect(record.runtime_preview_state).toBe("runtime_preview_waiting_for_operator_inputs");
  });

  test("documentation contains no assignment-like secrets", () => {
    const doc = read(docPath);
    const serialized = read(recordPath);

    expect(doc).toContain("Action 526");
    expect(doc).toContain("current_sandboxed_codex_runner");
    expect(doc).toContain("approved_unrestricted_local_terminal_boundary");
    expect(doc).toContain("candidate_rehearsal_environment_blocked");
    expect(doc).toContain(expected.nextBlocked);
    expect(doc).not.toMatch(/=[A-Za-z0-9+/_.:-]{16,}/);
    expect(serialized).not.toMatch(/=[A-Za-z0-9+/_.:-]{16,}/);
  });

  test("runs Action 527 verifier and keeps Actions 525 526 and 518 healthy", () => {
    const result = JSON.parse(
      execFileSync("node", [verifierPath], { cwd: repoRoot, encoding: "utf8" }),
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
    const action525 = JSON.parse(
      execFileSync(
        "node",
        [
          "scripts/action-525-confidence-calibration-recommendation-advisory-projection-preview-candidate-build-runner-environment-precheck-completion-gate-verify.mjs",
        ],
        { cwd: repoRoot, encoding: "utf8" },
      ),
    ) as JsonObject;
    const action518 = JSON.parse(
      execFileSync(
        "node",
        [
          "scripts/action-518-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-reconstruction-and-hash-freeze-verify.mjs",
        ],
        { cwd: repoRoot, encoding: "utf8" },
      ),
    ) as JsonObject;

    expect(result.verification_status).toBe("passed");
    expect(result.approval_decision).toBe("blocked");
    expect(action526.verification_status).toBe("passed");
    expect(action525.verification_status).toBe("passed");
    expect(action518.verification_status).toBe("passed");
  });
});
