import { execFileSync } from "child_process";
import { createHash } from "crypto";
import { existsSync, readFileSync } from "fs";
import { tmpdir } from "os";
import { join, resolve } from "path";

import { expect, test } from "@playwright/test";

const repoRoot = resolve(__dirname, "../..");
const recordPath =
  "docs/action-525-confidence-calibration-recommendation-advisory-projection-preview-candidate-build-runner-environment-precheck-record.json";
const action524Path =
  "docs/action-524-confidence-calibration-recommendation-advisory-projection-preview-turbopack-runner-environment-remediation-approval-record.json";
const verifierPath =
  "scripts/action-525-confidence-calibration-recommendation-advisory-projection-preview-candidate-build-runner-environment-precheck-completion-gate-verify.mjs";
const routePath = "app/api/recommendations/evaluate-outcomes/route.ts";

const expected = {
  cleanBase: "15f9923c24ed1f3cf82d34656eeacbfd98a0d347",
  changeHash: "bc43bd1fe8f61561ddededd2263d64f7d12f37db46d184e3bfd0ea55a8b538de",
  fullHash: "80620318166b0b9e1858cff3f12fc78d9ad77d9116655335e1c7fd7e566930b0",
  routeHash: "26407a8b78625a19a48a02ecf44e03db1642998da5f1d8acc5e8d47227773265",
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

function runnerReadiness(input: JsonObject): string {
  const requiredPassed =
    input.child_process_spawn === "passed" &&
    input.loopback_binding === "passed" &&
    input.ephemeral_port_binding === "passed" &&
    input.temp_directory_readability === "passed" &&
    input.temp_directory_writability === "passed" &&
    input.build_output_writability === "passed" &&
    input.resource_cleanup_result === "passed";
  if (!requiredPassed) return "runner_capability_blocked";
  if (input.local_socket_creation === "not_applicable" || input.file_descriptor_capacity === "unavailable") {
    return "runner_capability_ready_with_conditions";
  }
  return "runner_capability_ready";
}

function overallDecision(publicStatus: string, runnerStatus: string): JsonObject {
  if (publicStatus === "public_build_environment_ready" && runnerStatus === "runner_capability_ready") {
    return {
      overall: "candidate_build_runner_precheck_ready",
      approval: "approved",
      next: "action_526_remediated_32_file_candidate_build_rehearsal_retry_after_runner_environment_precheck",
    };
  }
  if (
    publicStatus === "public_build_environment_ready" &&
    runnerStatus === "runner_capability_ready_with_conditions"
  ) {
    return {
      overall: "candidate_build_runner_precheck_ready_with_conditions",
      approval: "approved_with_conditions",
      next: "action_526_runner_environment_condition_completion_gate",
    };
  }
  return {
    overall: "candidate_build_runner_precheck_blocked",
    approval: "blocked",
    next: "action_526_public_build_environment_and_loopback_capability_remediation_gate",
  };
}

test.describe("Action 525 candidate build runner environment precheck completion gate", () => {
  test("binds Action 524 approved-with-conditions and exact candidate bindings", () => {
    const record = readJson<JsonObject>(recordPath);
    const action524 = readJson<JsonObject>(action524Path);
    const routeSource = read(routePath);

    expect(action524.approval_decision).toBe("approved_with_conditions");
    expect(record.action_524_approval_decision).toBe("approved_with_conditions");
    expect(record.clean_base_identifier).toBe(expected.cleanBase);
    expect(record.change_candidate_hash).toBe(expected.changeHash);
    expect(record.full_candidate_inventory_hash).toBe(expected.fullHash);
    expect(record.candidate_file_count).toBe(32);
    expect(record.remediated_route_hash).toBe(expected.routeHash);
    expect(sha256(routeSource)).toBe(expected.routeHash);
    expect(record.route_export_surface).toEqual(["POST"]);
  });

  test("records both required public signals as absent without retaining values", () => {
    const record = readJson<JsonObject>(recordPath);
    const signals = record.required_public_build_signals as JsonObject[];

    expect(signals.map((signal) => signal.key).sort()).toEqual([
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "NEXT_PUBLIC_SUPABASE_URL",
    ]);
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
    expect(record.raw_environment_values_recorded).toBe(false);
    expect(record.environment_value_lengths_recorded).toBe(false);
    expect(record.environment_value_prefixes_recorded).toBe(false);
    expect(record.environment_value_suffixes_recorded).toBe(false);
    expect(record.environment_value_hashes_recorded).toBe(false);
  });

  test("covers missing URL missing anon and invalid-shape public readiness handling", () => {
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
    expect(publicReadiness([presentUrl, { ...presentAnon, presence: "absent_in_parent_environment" }])).toBe(
      "public_build_environment_blocked",
    );
    expect(publicReadiness([{ ...presentUrl, safe_shape: "invalid_shape" }, presentAnon])).toBe(
      "public_build_environment_blocked",
    );
  });

  test("rejects secret propagation and builds only an ephemeral allowlist", () => {
    const record = readJson<JsonObject>(recordPath);

    expect(record.server_only_secrets_required_for_build).toBe(false);
    expect(record.prohibited_secret_values_inspected).toBe(false);
    expect(record.environment_construction_result).toBe("ephemeral_build_environment_blocked");
    expect(record.allowlisted_key_count).toBe(0);
    expect(record.full_environment_enumerated).toBe(false);
    expect(record.environment_persisted).toBe(false);
    expect(record.env_file_written).toBe(false);
    expect(record.parent_environment_modified).toBe(false);
    expect(record.child_environment_disposable).toBe(true);
  });

  test("records child-process pass and loopback port socket failures safely", () => {
    const record = readJson<JsonObject>(recordPath);

    expect(record.child_process_spawn).toBe("passed");
    expect(record.child_process_exit_classification).toBe("zero");
    expect(record.child_process_cleanup_result).toBe("passed");
    expect(record.loopback_binding).toBe("failed");
    expect(record.loopback_failure_classification).toBe("permission_restricted");
    expect(record.loopback_bind_address).toBe("loopback_only");
    expect(record.loopback_external_interface_used).toBe(false);
    expect(record.ephemeral_port_binding).toBe("failed");
    expect(record.fixed_port_used).toBe(false);
    expect(record.port_value_recorded).toBe(false);
    expect(record.local_socket_creation).toBe("failed");
    expect(record.local_socket_path_recorded).toBe(false);
  });

  test("covers child-process loopback port socket pass fail and not-applicable decision paths", () => {
    const base = {
      child_process_spawn: "passed",
      loopback_binding: "passed",
      ephemeral_port_binding: "passed",
      temp_directory_readability: "passed",
      temp_directory_writability: "passed",
      build_output_writability: "passed",
      resource_cleanup_result: "passed",
      local_socket_creation: "passed",
      file_descriptor_capacity: "sufficient",
    };

    expect(runnerReadiness(base)).toBe("runner_capability_ready");
    expect(runnerReadiness({ ...base, local_socket_creation: "not_applicable" })).toBe(
      "runner_capability_ready_with_conditions",
    );
    expect(runnerReadiness({ ...base, child_process_spawn: "failed" })).toBe(
      "runner_capability_blocked",
    );
    expect(runnerReadiness({ ...base, loopback_binding: "failed" })).toBe(
      "runner_capability_blocked",
    );
    expect(runnerReadiness({ ...base, ephemeral_port_binding: "failed" })).toBe(
      "runner_capability_blocked",
    );
    expect(runnerReadiness({ ...base, local_socket_creation: "failed" })).toBe(
      "runner_capability_ready",
    );
  });

  test("records safe temp path semantics temp read write output write rename delete and cleanup", () => {
    const record = readJson<JsonObject>(recordPath);
    const tempSubtree = join(
      tmpdir(),
      "ture",
      "action-525-confidence-calibration-projection-preview-runner-environment-precheck",
    );

    expect(record.temp_directory_identity).toBe("system_temp_ture_action_525_precheck_subtree");
    expect(record.temp_path_recorded).toBe(false);
    expect(record.temp_directory_readability).toBe("passed");
    expect(record.temp_directory_writability).toBe("passed");
    expect(record.build_output_writability).toBe("passed");
    expect(record.build_output_repo_next_used).toBe(false);
    expect(record.temp_cleanup).toBe("passed");
    expect(record.resource_cleanup_result).toBe("passed");
    expect(existsSync(tempSubtree)).toBe(false);
  });

  test("documents macOS var private-var equivalence policy without retaining paths", () => {
    const doc = read(
      "docs/action-525-confidence-calibration-recommendation-advisory-projection-preview-candidate-build-runner-environment-precheck-completion-gate.md",
    );

    expect(doc).toContain("system_temp_ture_action_525_precheck_subtree");
    expect(doc).toContain("The Action 525 temp subtree was removed after the check.");
    expect(doc).not.toContain("/Users/");
  });

  test("records resource classifications and blocked readiness", () => {
    const record = readJson<JsonObject>(recordPath);

    expect(record.file_descriptor_capacity).toBe("sufficient");
    expect(record.process_resource_capacity).toBe("sufficient");
    expect(record.public_environment_readiness).toBe("public_build_environment_blocked");
    expect(record.runner_capability_readiness).toBe("runner_capability_blocked");
    expect(record.overall_precheck_readiness).toBe("candidate_build_runner_precheck_blocked");
    expect(record.approval_decision).toBe("blocked");
    expect(record.unresolved_conditions).toEqual(
      expect.arrayContaining([
        "NEXT_PUBLIC_SUPABASE_URL:required_public_build_signal_not_ready",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY:required_public_build_signal_not_ready",
        "loopback_binding_failed_permission_restricted",
      ]),
    );
  });

  test("covers ready ready-with-conditions and blocked overall decision paths", () => {
    expect(overallDecision("public_build_environment_ready", "runner_capability_ready")).toEqual({
      overall: "candidate_build_runner_precheck_ready",
      approval: "approved",
      next: "action_526_remediated_32_file_candidate_build_rehearsal_retry_after_runner_environment_precheck",
    });
    expect(
      overallDecision("public_build_environment_ready", "runner_capability_ready_with_conditions"),
    ).toEqual({
      overall: "candidate_build_runner_precheck_ready_with_conditions",
      approval: "approved_with_conditions",
      next: "action_526_runner_environment_condition_completion_gate",
    });
    expect(overallDecision("public_build_environment_blocked", "runner_capability_ready")).toEqual({
      overall: "candidate_build_runner_precheck_blocked",
      approval: "blocked",
      next: "action_526_public_build_environment_and_loopback_capability_remediation_gate",
    });
  });

  test("binds Action 526 boundary and no-effect flags", () => {
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
      "external_network_used",
      "install_performed",
      "provider_called",
      "supabase_accessed",
      "persistence_created",
      "replay_created",
      "confidence_applied",
      "feedback_created",
      "downstream_behavior_changed",
    ];

    expect(record.next_action).toBe(
      "action_526_public_build_environment_and_loopback_capability_remediation_gate",
    );
    expect(record.runtime_preview_state).toBe("runtime_preview_waiting_for_operator_inputs");
    for (const key of falseKeys) expect(record[key], key).toBe(false);
  });

  test("runs Action 525 verifier and keeps Actions 523 524 and 518 healthy", () => {
    const result = JSON.parse(
      execFileSync("node", [verifierPath], { cwd: repoRoot, encoding: "utf8" }),
    ) as JsonObject;
    const action524 = JSON.parse(
      execFileSync(
        "node",
        [
          "scripts/action-524-confidence-calibration-recommendation-advisory-projection-preview-turbopack-runner-environment-remediation-gate-verify.mjs",
        ],
        { cwd: repoRoot, encoding: "utf8" },
      ),
    ) as JsonObject;
    const action523 = JSON.parse(
      execFileSync(
        "node",
        [
          "scripts/action-523-confidence-calibration-recommendation-advisory-projection-preview-candidate-build-failure-relationship-and-remediation-approval-gate-verify.mjs",
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
    expect(action524.verification_status).toBe("passed");
    expect(action523.verification_status).toBe("passed");
    expect(action518.verification_status).toBe("passed");
  });
});
