import { execFileSync } from "child_process";
import { createHash } from "crypto";
import { readFileSync } from "fs";
import { join, resolve } from "path";

import { expect, test } from "@playwright/test";

const repoRoot = resolve(__dirname, "../..");
const recordPath =
  "docs/action-524-confidence-calibration-recommendation-advisory-projection-preview-turbopack-runner-environment-remediation-approval-record.json";
const docPath =
  "docs/action-524-confidence-calibration-recommendation-advisory-projection-preview-turbopack-runner-environment-remediation-gate.md";
const action523Path =
  "docs/action-523-confidence-calibration-recommendation-advisory-projection-preview-candidate-build-failure-relationship-and-remediation-approval-record.json";
const action522Path =
  "docs/action-522-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-build-rehearsal-retry-record.json";
const verifierPath =
  "scripts/action-524-confidence-calibration-recommendation-advisory-projection-preview-turbopack-runner-environment-remediation-gate-verify.mjs";
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

function decideApproval(input: JsonObject): string {
  if (
    input.server_only_secrets_required_for_build ||
    input.candidate_change_required ||
    input.package_or_config_change_required ||
    input.environment_persisted ||
    input.persistent_environment_modification_required ||
    input.unsupported_os_modification_required
  ) {
    return "blocked";
  }
  if (Array.isArray(input.unresolved_conditions) && input.unresolved_conditions.length > 0) {
    return "approved_with_conditions";
  }
  return "approved";
}

test.describe("Action 524 Turbopack runner environment remediation gate", () => {
  test("binds Action 523 approved decision and Action 522 failed rehearsal", () => {
    const record = readJson<JsonObject>(recordPath);
    const action523 = readJson<JsonObject>(action523Path);
    const action522 = readJson<JsonObject>(action522Path);

    expect(action523.approval_decision).toBe("approved");
    expect(action523.remediation_readiness).toBe("build_failure_remediation_ready");
    expect(record.action_523_decision).toBe("approved");
    expect(action522.candidate_rehearsal_result).toBe("full_candidate_rehearsal_failed");
    expect(record.action_522_candidate_rehearsal_result).toBe("full_candidate_rehearsal_failed");
    expect(record.action_522_overall_readiness).toBe("blocked");
  });

  test("preserves exact authoritative candidate bindings and route hash", () => {
    const record = readJson<JsonObject>(recordPath);
    const routeSource = read(routePath);

    expect(record.clean_base_identifier).toBe(expected.cleanBase);
    expect(record.change_candidate_hash).toBe(expected.changeHash);
    expect(record.full_candidate_inventory_hash).toBe(expected.fullHash);
    expect(record.candidate_file_count).toBe(32);
    expect(record.remediated_route_hash).toBe(expected.routeHash);
    expect(sha256(routeSource)).toBe(expected.routeHash);
    expect(record.route_export_surface).toEqual(["POST"]);
    expect(record.candidate_change_required).toBe(false);
    expect(record.candidate_hash_change_required).toBe(false);
  });

  test("freezes candidate defect and closure interpretation without deployment readiness", () => {
    const record = readJson<JsonObject>(recordPath);

    expect(record.candidate_source_defect_proven).toBe(false);
    expect(record.candidate_source_defect_status).toBe("candidate_defect_not_proven");
    expect(record.runtime_build_closure_reassessment).toBe(
      "candidate_runtime_build_closure_still_complete",
    );
    expect(record.active_worktree_build_evidence_role).toBe("diagnostic_context_only");
    expect(record.active_worktree_build_establishes_candidate_readiness).toBe(false);
    expect(record.deployment_readiness).toBe(false);
  });

  test("classifies Turbopack and Webpack runner blockers", () => {
    const record = readJson<JsonObject>(recordPath);

    expect(record.turbopack_blocker).toBe("turbopack_process_resource_error");
    expect(record.webpack_blocker).toBe("webpack_runner_environment_error");
    expect(record.combined_runner_blocker).toBe(
      "candidate_build_runner_environment_contract_incomplete",
    );
    expect(record.turbopack_resource_cause).toBe("turbopack_process_resource_combination");
    expect(record.turbopack_resource_evidence_basis).toEqual(
      expect.arrayContaining([
        "action_523_authoritative_first_causal_error_mentions_creating_new_process",
        "action_523_authoritative_first_causal_error_mentions_binding_to_a_port",
      ]),
    );
  });

  test("classifies required and optional public build signals by key name only", () => {
    const record = readJson<JsonObject>(recordPath);
    const required = record.required_public_build_signals as JsonObject[];
    const optional = record.optional_public_build_signals as JsonObject[];

    expect(required.map((entry) => entry.key_name).sort()).toEqual([
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "NEXT_PUBLIC_SUPABASE_URL",
    ]);
    for (const entry of required) {
      expect(entry.classification).toBe("required_public_build_signal");
      expect(entry.presence_classification).toBe(
        "requires_action_525_parent_environment_presence_check",
      );
      expect(entry.value_shape_classification).toContain("not_inspected_action_524_static_only");
      expect(entry.needed_during_candidate_build).toBe(true);
      expect((entry.source_reference_locations as unknown[]).length).toBeGreaterThan(0);
    }
    expect(optional).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key_name: "NEXT_PUBLIC_PROVIDER_BACKGROUND_SCANS_PER_DAY",
          classification: "optional_public_build_signal",
          needed_during_candidate_build: false,
        }),
      ]),
    );
  });

  test("rejects server-only secrets from public build propagation", () => {
    const record = readJson<JsonObject>(recordPath);
    const allowlist = record.public_build_environment_allowlist as string[];

    expect(record.server_only_secrets_required_for_build).toBe(false);
    expect(allowlist).toEqual(["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"]);
    for (const entry of record.server_only_secret_classifications as JsonObject[]) {
      expect(entry.classification).toBe("server_only_secret_not_required_for_build");
      expect(entry.propagation_allowed).toBe(false);
      expect(entry.needed_during_candidate_build).toBe(false);
      expect(allowlist).not.toContain(entry.key_name);
    }
    expect(record.rejected_secret_key_classes).toEqual(
      expect.arrayContaining(["service_role_keys", "private_api_keys", "connection_strings"]),
    );
  });

  test("blocks raw value retention and requires ephemeral allowlisted propagation", () => {
    const record = readJson<JsonObject>(recordPath);

    expect(record.public_build_environment_policy).toBe("public_build_environment_allowlist");
    expect(record.environment_propagation_policy).toBe(
      "ephemeral_allowlisted_build_environment_propagation",
    );
    expect(record.raw_environment_values_recorded).toBe(false);
    expect(record.full_environment_enumerated).toBe(false);
    expect(record.environment_persisted).toBe(false);
    expect(record.environment_restored).toBe(true);
    expect((record.sanitization_policy as JsonObject).unsanitized_intermediate_log_allowed).toBe(false);
    expect((record.sanitization_policy as JsonObject).redact_complete_environment_dumps).toBe(true);
  });

  test("freezes missing and invalid required signal paths for Action 525", () => {
    const record = readJson<JsonObject>(recordPath);
    const policy = record.presence_check_policy as JsonObject;

    expect(policy.required_presence_classifications).toEqual(
      expect.arrayContaining([
        "present_in_parent_environment",
        "absent_in_parent_environment",
        "unavailable",
        "invalid_shape",
        "ambiguous",
      ]),
    );
    expect(policy.abort_if_required_signal_absent).toBe(true);
    expect(policy.placeholder_values_allowed).toBe(false);
    expect(policy.fake_production_values_allowed).toBe(false);
    expect(policy.webpack_or_turbopack_allowed_before_required_presence_check).toBe(false);
  });

  test("requires runner capability prechecks before any future build", () => {
    const record = readJson<JsonObject>(recordPath);

    expect(record.required_runner_capability_prechecks).toEqual(
      expect.arrayContaining([
        "child_process_spawn_precheck",
        "local_loopback_availability_precheck",
        "ephemeral_local_port_binding_precheck",
        "local_socket_creation_precheck",
        "temp_directory_read_write_precheck",
        "build_output_directory_writability_precheck",
        "file_descriptor_resource_availability_precheck",
      ]),
    );
    expect(record.runner_capability_expected_status).toBe(
      "runner_capability_ready_with_conditions",
    );
  });

  test("preserves authoritative build and keeps Webpack diagnostic-only", () => {
    const record = readJson<JsonObject>(recordPath);
    const packageJson = readJson<JsonObject>("package.json");

    expect(record.authoritative_build_command).toBe("npm run build");
    expect(record.authoritative_build_script_must_remain).toBe("next build");
    expect((packageJson.scripts as JsonObject).build).toBe("next build");
    expect(record.webpack_comparison_policy).toBe(
      "diagnostic_only_after_authoritative_failure_same_approved_public_build_environment",
    );
    expect(record.webpack_can_establish_readiness).toBe(false);
  });

  test("rejects candidate config and package changes", () => {
    const record = readJson<JsonObject>(recordPath);

    expect(record.candidate_change_required).toBe(false);
    expect(record.candidate_hash_change_required).toBe(false);
    expect(record.package_or_config_change_required).toBe(false);
    expect(record.package_script_change_required).toBe(false);
    expect(record.next_config_change_required).toBe(false);
  });

  test("maps approved approved-with-conditions and blocked paths", () => {
    const record = readJson<JsonObject>(recordPath);

    expect(decideApproval({ ...record, unresolved_conditions: [] })).toBe("approved");
    expect(decideApproval(record)).toBe("approved_with_conditions");
    expect(decideApproval({ ...record, server_only_secrets_required_for_build: true })).toBe(
      "blocked",
    );
    expect(decideApproval({ ...record, candidate_change_required: true })).toBe("blocked");
    expect(decideApproval({ ...record, environment_persisted: true })).toBe("blocked");
  });

  test("binds Action 525 boundary and keeps runtime preview waiting", () => {
    const record = readJson<JsonObject>(recordPath);

    expect(record.remediation_readiness).toBe(
      "runner_environment_remediation_ready_with_conditions",
    );
    expect(record.approval_decision).toBe("approved_with_conditions");
    expect((record.unresolved_conditions as unknown[]).length).toBeGreaterThan(0);
    expect(record.next_action).toBe(
      "action_525_candidate_build_runner_environment_precheck_completion_gate",
    );
    expect(record.runtime_preview_state).toBe("runtime_preview_waiting_for_operator_inputs");
  });

  test("authorizes no build rehearsal deployment activation or side effects", () => {
    const record = readJson<JsonObject>(recordPath);
    const falseKeys = [
      "build_authorized",
      "rehearsal_authorized",
      "deployment_authorized",
      "activation_authorized",
      "webpack_execution_authorized",
      "candidate_reconstruction_authorized",
      "network_authorized",
      "install_authorized",
      "provider_call_authorized",
      "supabase_access_authorized",
      "persistence_authorized",
      "replay_authorized",
      "confidence_application_authorized",
      "feedback_authorized",
      "downstream_behavior_change_authorized",
    ];

    for (const key of falseKeys) {
      expect(record[key], key).toBe(false);
    }
  });

  test("documentation captures the gate and contains no raw env assignments", () => {
    const doc = read(docPath);

    expect(doc).toContain("Action 524");
    expect(doc).toContain("approved_with_conditions");
    expect(doc).toContain("action_525_candidate_build_runner_environment_precheck_completion_gate");
    expect(doc).toContain("Build authorized: `false`");
    expect(doc).toContain("Deployment authorized: `false`");
    expect(doc).not.toMatch(/=[A-Za-z0-9+/_.:-]{16,}/);
  });

  test("runs Action 524 verifier and keeps Actions 522 and 523 healthy", () => {
    const result = JSON.parse(
      execFileSync("node", [verifierPath], { cwd: repoRoot, encoding: "utf8" }),
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
    const action522 = JSON.parse(
      execFileSync(
        "node",
        [
          "scripts/action-522-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-build-rehearsal-retry-after-path-safety-remediation-verify.mjs",
        ],
        { cwd: repoRoot, encoding: "utf8" },
      ),
    ) as JsonObject;

    expect(result.verification_status).toBe("passed");
    expect(result.approval_decision).toBe("approved_with_conditions");
    expect(result.next_action).toBe(
      "action_525_candidate_build_runner_environment_precheck_completion_gate",
    );
    expect(action523.verification_status).toBe("passed");
    expect(action522.verification_status).toBe("passed");
  });
});
