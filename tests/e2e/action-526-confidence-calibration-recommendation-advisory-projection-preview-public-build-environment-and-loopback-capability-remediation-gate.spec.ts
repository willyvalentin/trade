import { execFileSync } from "child_process";
import { createHash } from "crypto";
import { readFileSync } from "fs";
import { join, resolve } from "path";

import { expect, test } from "@playwright/test";

const repoRoot = resolve(__dirname, "../..");
const recordPath =
  "docs/action-526-confidence-calibration-recommendation-advisory-projection-preview-public-build-environment-and-loopback-capability-remediation-approval-record.json";
const docPath =
  "docs/action-526-confidence-calibration-recommendation-advisory-projection-preview-public-build-environment-and-loopback-capability-remediation-gate.md";
const action525Path =
  "docs/action-525-confidence-calibration-recommendation-advisory-projection-preview-candidate-build-runner-environment-precheck-record.json";
const verifierPath =
  "scripts/action-526-confidence-calibration-recommendation-advisory-projection-preview-public-build-environment-and-loopback-capability-remediation-gate-verify.mjs";
const routePath = "app/api/recommendations/evaluate-outcomes/route.ts";

const expected = {
  cleanBase: "15f9923c24ed1f3cf82d34656eeacbfd98a0d347",
  changeHash: "bc43bd1fe8f61561ddededd2263d64f7d12f37db46d184e3bfd0ea55a8b538de",
  fullHash: "80620318166b0b9e1858cff3f12fc78d9ad77d9116655335e1c7fd7e566930b0",
  routeHash: "26407a8b78625a19a48a02ecf44e03db1642998da5f1d8acc5e8d47227773265",
  blocker: "public_build_environment_absent_and_current_runner_loopback_capability_restricted",
  nextAction: "action_527_public_build_signal_operator_input_and_alternate_runner_precheck_gate",
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

function classifySource(source: string): JsonObject {
  if (source === "approved_existing_local_project_environment") {
    return {
      remediation_readiness: "execution_boundary_remediation_ready",
      approval_decision: "approved",
      operator_input_required: false,
      next_action: "action_527_alternate_execution_boundary_runner_precheck_completion_gate",
    };
  }
  if (source === "approved_operator_supplied_ephemeral_environment") {
    return {
      remediation_readiness: "execution_boundary_remediation_ready_with_operator_input",
      approval_decision: "approved_with_conditions",
      operator_input_required: true,
      next_action: expected.nextAction,
    };
  }
  return {
    remediation_readiness: "execution_boundary_remediation_blocked",
    approval_decision: "blocked",
    operator_input_required: true,
    next_action: "environment_source_remediation_gate",
  };
}

function classifyBoundary(boundary: string): JsonObject {
  if (
    boundary === "approved_unrestricted_local_terminal_boundary" ||
    boundary === "approved_ci_build_runner_boundary"
  ) {
    return {
      approved: true,
      precheck_required: true,
    };
  }
  if (boundary === "execution_boundary_unresolved") {
    return {
      approved: false,
      precheck_required: false,
    };
  }
  return {
    approved: false,
    precheck_required: true,
  };
}

test.describe("Action 526 public build environment and loopback capability remediation gate", () => {
  test("binds Action 525 blocked result and exact candidate bindings", () => {
    const record = readJson<JsonObject>(recordPath);
    const action525 = readJson<JsonObject>(action525Path);
    const routeSource = read(routePath);

    expect(record.source_action).toBe(525);
    expect(action525.overall_precheck_readiness).toBe("candidate_build_runner_precheck_blocked");
    expect(action525.approval_decision).toBe("blocked");
    expect(record.action_525_overall_precheck_readiness).toBe(action525.overall_precheck_readiness);
    expect(record.action_525_approval_decision).toBe(action525.approval_decision);
    expect(record.clean_base_identifier).toBe(expected.cleanBase);
    expect(record.change_candidate_hash).toBe(expected.changeHash);
    expect(record.full_candidate_inventory_hash).toBe(expected.fullHash);
    expect(record.candidate_file_count).toBe(32);
    expect(record.remediated_route_hash).toBe(expected.routeHash);
    expect(sha256(routeSource)).toBe(expected.routeHash);
    expect(record.route_export_surface).toEqual(["POST"]);
  });

  test("freezes both public signals absent and rejects secret requirements", () => {
    const record = readJson<JsonObject>(recordPath);
    const action525 = readJson<JsonObject>(action525Path);
    const signals = action525.required_public_build_signals as JsonObject[];

    expect(record.public_build_signals_absent).toBe(true);
    expect(record.required_public_build_signals).toEqual([
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    ]);
    expect(signals.every((signal) => signal.presence === "absent_in_parent_environment")).toBe(true);
    expect(record.server_only_secrets_required).toBe(false);
    expect(record.disallowed_operator_inputs).toEqual(
      expect.arrayContaining(["Supabase service-role key", "database password", "provider secrets", "Netlify token"]),
    );
  });

  test("covers approved existing operator supplied and unavailable source decisions", () => {
    expect(classifySource("approved_existing_local_project_environment")).toEqual({
      remediation_readiness: "execution_boundary_remediation_ready",
      approval_decision: "approved",
      operator_input_required: false,
      next_action: "action_527_alternate_execution_boundary_runner_precheck_completion_gate",
    });
    expect(classifySource("approved_operator_supplied_ephemeral_environment")).toEqual({
      remediation_readiness: "execution_boundary_remediation_ready_with_operator_input",
      approval_decision: "approved_with_conditions",
      operator_input_required: true,
      next_action: expected.nextAction,
    });
    expect(classifySource("source_unavailable")).toEqual({
      remediation_readiness: "execution_boundary_remediation_blocked",
      approval_decision: "blocked",
      operator_input_required: true,
      next_action: "environment_source_remediation_gate",
    });
  });

  test("selects operator supplied ephemeral source for this approval record", () => {
    const record = readJson<JsonObject>(recordPath);

    expect(record.public_build_signal_source).toBe("approved_operator_supplied_ephemeral_environment");
    expect(record.operator_input_required).toBe(true);
    expect(record.approved_public_build_signal_sources).toEqual(
      expect.arrayContaining([
        "approved_existing_local_project_environment",
        "approved_operator_supplied_ephemeral_environment",
        "approved_deployment_environment_metadata",
      ]),
    );
  });

  test("classifies current runner unsuitable and covers alternate boundary choices", () => {
    const record = readJson<JsonObject>(recordPath);

    expect(record.current_runner_suitability).toBe(
      "current_runner_unsuitable_for_authoritative_turbopack_build",
    );
    expect(record.current_runner_loopback_restricted).toBe(true);
    expect(record.current_runner_ephemeral_port_restricted).toBe(true);
    expect(record.current_runner_local_socket_restricted).toBe(true);
    expect(record.approved_future_execution_boundary).toBe("approved_unrestricted_local_terminal_boundary");
    expect(classifyBoundary("approved_unrestricted_local_terminal_boundary")).toEqual({
      approved: true,
      precheck_required: true,
    });
    expect(classifyBoundary("approved_ci_build_runner_boundary")).toEqual({
      approved: true,
      precheck_required: true,
    });
    expect(classifyBoundary("execution_boundary_unresolved")).toEqual({
      approved: false,
      precheck_required: false,
    });
  });

  test("requires ephemeral allowlist and rejects raw value retention", () => {
    const record = readJson<JsonObject>(recordPath);

    expect(record.environment_propagation_policy).toBe(
      "ephemeral_allowlisted_build_environment_propagation",
    );
    expect(record.environment_allowlist).toEqual([
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    ]);
    expect(record.raw_values_recorded).toBe(false);
    expect(record.values_written_to_files).toBe(false);
    expect(record.full_environment_enumerated).toBe(false);
    expect(record.parent_environment_modified).toBe(false);
    expect(record.child_environment_disposed).toBe(true);
  });

  test("does not accept dirty worktree as readiness evidence and requires future prechecks", () => {
    const record = readJson<JsonObject>(recordPath);

    expect(record.preserved_isolation_requirements).toEqual(
      expect.arrayContaining([
        "reconstruct_clean_base",
        "apply_exact_32_file_candidate",
        "verify_change_candidate_hash",
        "verify_full_candidate_inventory_hash",
        "exclude_unrelated_dirty_files",
        "verify_preview_flag_disabled",
      ]),
    );
    expect(record.required_future_capability_prechecks).toEqual(
      expect.arrayContaining([
        "child_process_spawn",
        "loopback_bind",
        "ephemeral_port_bind",
        "local_socket_or_equivalent_ipc",
        "temp_read_write",
        "output_read_write_rename_delete",
        "cleanup",
        "required_public_signal_presence",
      ]),
    );
    expect(record.no_build_if_future_precheck_fails).toBe(true);
  });

  test("approves with operator input and maps to Action 527", () => {
    const record = readJson<JsonObject>(recordPath);

    expect(record.blocker_classification).toBe(expected.blocker);
    expect(record.remediation_readiness).toBe("execution_boundary_remediation_ready_with_operator_input");
    expect(record.approval_decision).toBe("approved_with_conditions");
    expect(record.unresolved_conditions).toEqual(
      expect.arrayContaining([
        "operator_must_expose_next_public_supabase_url_ephemerally",
        "operator_must_expose_next_public_supabase_anon_key_ephemerally",
        "future_execution_boundary_precheck_required",
      ]),
    );
    expect(record.next_action).toBe(expected.nextAction);
  });

  test("keeps build rehearsal deployment activation and downstream effects disabled", () => {
    const record = readJson<JsonObject>(recordPath);
    const falseKeys = [
      "candidate_change_required",
      "candidate_hash_change_required",
      "package_or_config_change_required",
      "source_change_required",
      "build_authorized",
      "rehearsal_authorized",
      "deployment_authorized",
      "activation_authorized",
      "webpack_replacement_authorized",
      "turbopack_disabled",
      "next_config_change_authorized",
      "package_script_change_authorized",
      "network_used",
      "install_performed",
      "provider_called",
      "supabase_accessed",
      "persistence_created",
      "replay_created",
      "confidence_applied",
      "feedback_created",
      "downstream_behavior_changed",
    ];

    for (const key of falseKeys) expect(record[key], key).toBe(false);
    expect(record.runtime_preview_state).toBe("runtime_preview_waiting_for_operator_inputs");
  });

  test("documentation preserves candidate safety and contains no assignment-like secrets", () => {
    const doc = read(docPath);
    const serialized = read(recordPath);

    expect(doc).toContain("Action 525");
    expect(doc).toContain(expected.blocker);
    expect(doc).toContain("approved_operator_supplied_ephemeral_environment");
    expect(doc).toContain("approved_unrestricted_local_terminal_boundary");
    expect(doc).toContain("Build authorized: `false`");
    expect(doc).toContain(expected.nextAction);
    expect(doc).not.toMatch(/=[A-Za-z0-9+/_.:-]{16,}/);
    expect(serialized).not.toMatch(/=[A-Za-z0-9+/_.:-]{16,}/);
  });

  test("runs Action 526 verifier and keeps Actions 524 and 525 healthy", () => {
    const result = JSON.parse(
      execFileSync("node", [verifierPath], { cwd: repoRoot, encoding: "utf8" }),
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
    const action524 = JSON.parse(
      execFileSync(
        "node",
        [
          "scripts/action-524-confidence-calibration-recommendation-advisory-projection-preview-turbopack-runner-environment-remediation-gate-verify.mjs",
        ],
        { cwd: repoRoot, encoding: "utf8" },
      ),
    ) as JsonObject;

    expect(result.verification_status).toBe("passed");
    expect(result.approval_decision).toBe("approved_with_conditions");
    expect(result.next_action).toBe(expected.nextAction);
    expect(action525.verification_status).toBe("passed");
    expect(action524.verification_status).toBe("passed");
  });
});
