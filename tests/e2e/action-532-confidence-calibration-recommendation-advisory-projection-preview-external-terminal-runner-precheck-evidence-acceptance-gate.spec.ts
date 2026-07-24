import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join, resolve } from "path";
import { pathToFileURL } from "url";

import { expect, test } from "@playwright/test";

const repoRoot = resolve(__dirname, "../..");
const resultPath =
  "docs/action-529-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-runner-precheck-result.json";
const recordPath =
  "docs/action-532-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-runner-precheck-evidence-acceptance-record.json";
const docPath =
  "docs/action-532-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-runner-precheck-evidence-acceptance-gate.md";
const verifierPath =
  "scripts/action-532-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-runner-precheck-evidence-acceptance-gate-verify.mjs";
const action529VerifierPath =
  "scripts/action-529-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-runner-precheck-result-verify.mjs";

type JsonObject = Record<string, unknown>;

function read(relativePath: string): string {
  return readFileSync(join(repoRoot, relativePath), "utf8");
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(read(relativePath)) as T;
}

async function importVerifier() {
  return await import(pathToFileURL(join(repoRoot, verifierPath)).href);
}

function cloneResult(overrides: JsonObject = {}) {
  return {
    ...readJson<JsonObject>(resultPath),
    ...overrides,
  };
}

test.describe("Action 532 external terminal runner precheck evidence acceptance gate", () => {
  test("binds the exact Action 529 result file and successful attempt history", () => {
    const result = readJson<JsonObject>(resultPath);

    expect(existsSync(join(repoRoot, resultPath))).toBe(true);
    expect(result.schema_version).toBe("action_529_external_terminal_runner_precheck_result_v1");
    expect(result.source_action).toBe(528);
    expect(result.execution_boundary).toBe("operator_unrestricted_local_terminal");
    expect(result.operator_attempt_number).toBe(2);
    expect(result.prior_attempt_result).toBe("external_terminal_runner_precheck_blocked");
    expect(result.precheck_result).toBe("external_terminal_runner_precheck_passed");
    expect(result.input_echo_suppressed).toBe(true);
    expect(result.terminal_restoration).toBe("raw_mode_restored_on_completion_error_and_interruption");
  });

  test("requires exactly the two public signal entries without raw values", async () => {
    const verifier = await importVerifier();
    const result = readJson<JsonObject>(resultPath);
    const signals = result.required_public_build_signals as JsonObject[];

    expect(signals.map((signal) => signal.key).sort()).toEqual([
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "NEXT_PUBLIC_SUPABASE_URL",
    ]);
    expect(signals.every((signal) => signal.presence === "present")).toBe(true);
    expect(signals.every((signal) => signal.safe_shape === "valid_shape")).toBe(true);
    expect(signals.every((signal) => signal.value_recorded === false)).toBe(true);
    expect(signals.some((signal) => "value" in signal || "hash" in signal || "host" in signal)).toBe(false);

    const withRawField = cloneResult({
      required_public_build_signals: [
        { key: "NEXT_PUBLIC_SUPABASE_URL", presence: "present", safe_shape: "valid_shape", value_recorded: false },
        {
          key: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
          presence: "present",
          safe_shape: "valid_shape",
          value_recorded: false,
          value: "SYNTHETIC_PUBLIC_VALUE_NOT_REAL",
        },
      ],
    });
    const evaluated = verifier.evaluateAction532({
      resultText: JSON.stringify(withRawField),
      action529VerifierPassed: true,
      action518VerifierPassed: true,
    });
    expect(evaluated.evidence_acceptance_result).toBe("external_terminal_runner_evidence_rejected");
    expect(evaluated.unresolved_conditions.join("\n")).toContain("forbidden value");
  });

  test("rejects JWT-like values raw URLs absolute paths and malformed result JSON", async () => {
    const verifier = await importVerifier();
    const jwtLike =
      "eyJaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.eyJbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb.cccccccccccccccccccccccccccccc";
    const unsafeResult = cloneResult({
      synthetic_leak: jwtLike,
      synthetic_url: "https://synthetic-project.supabase.co/rest/v1/table?apikey=SYNTHETIC",
      synthetic_path: "/Users/synthetic/action-529.sock",
    });

    const unsafe = verifier.evaluateAction532({
      resultText: JSON.stringify(unsafeResult),
      action529VerifierPassed: true,
      action518VerifierPassed: true,
    });
    expect(unsafe.result_content_safety).toBe("result_content_safety_failed");
    expect(unsafe.unresolved_conditions.join("\n")).toContain("result content safety failed");

    expect(verifier.hasDuplicateJsonKeys('{"schema_version":"x","schema_version":"y"}')).toBe(true);
    const malformed = verifier.evaluateAction532({
      resultText: '{"schema_version":',
      action529VerifierPassed: true,
      action518VerifierPassed: true,
    });
    expect(malformed.evidence_acceptance_result).toBe("external_terminal_runner_evidence_rejected");
    expect(malformed.result_content_safety).toBe("result_content_safety_failed");
  });

  test("requires all runner capabilities IPC diagnostics cleanup and no side effects", async () => {
    const verifier = await importVerifier();
    const result = readJson<JsonObject>(resultPath);
    const ipc = result.local_ipc_diagnostic as JsonObject;

    expect(result.child_process_spawn).toBe("passed");
    expect(result.loopback_binding).toBe("passed");
    expect(result.ephemeral_port_binding).toBe("passed");
    expect(result.local_ipc_capability).toBe("passed");
    expect(result.local_ipc_test_result).toBe("passed");
    expect(result.temp_output_capability).toBe("passed");
    expect(result.file_descriptor_capacity).toBe("sufficient");
    expect(result.process_resource_capacity).toBe("sufficient");
    expect(result.cleanup_result).toBe("passed");
    expect(ipc.ipc_mechanism).toBe("unix_domain_socket");
    expect(ipc.ipc_failure_phase).toBe("none");
    expect(ipc.ipc_error_classification).toBe("none");
    expect(ipc.ipc_cleanup_result).toBe("passed");
    expect(ipc.raw_socket_path_recorded).toBe(false);
    expect(ipc.ipc_required_by_authoritative_build).toBe(false);
    expect(ipc.ipc_requirement_classification).toBe(
      "local_ipc_not_proven_required_for_authoritative_turbopack_build",
    );

    const blocked = verifier.evaluateAction532({
      resultText: JSON.stringify(
        cloneResult({
          child_process_spawn: "missing",
          external_network_used: true,
          build_performed: true,
        }),
      ),
      action529VerifierPassed: true,
      action518VerifierPassed: true,
    });
    expect(blocked.evidence_acceptance_result).toBe("external_terminal_runner_evidence_rejected");
    expect(blocked.unresolved_conditions.join("\n")).toContain("child_process_spawn mismatch");
    expect(blocked.unresolved_conditions.join("\n")).toContain("external_network_used must be false");
    expect(blocked.unresolved_conditions.join("\n")).toContain("build_performed must be false");
  });

  test("records exact Action 518 candidate binding and approval decision", () => {
    const record = readJson<JsonObject>(recordPath);

    expect(record.clean_base_identifier).toBe("15f9923c24ed1f3cf82d34656eeacbfd98a0d347");
    expect(record.change_candidate_hash).toBe("bc43bd1fe8f61561ddededd2263d64f7d12f37db46d184e3bfd0ea55a8b538de");
    expect(record.full_candidate_inventory_hash).toBe("80620318166b0b9e1858cff3f12fc78d9ad77d9116655335e1c7fd7e566930b0");
    expect(record.candidate_file_count).toBe(32);
    expect(record.remediated_route_hash).toBe("26407a8b78625a19a48a02ecf44e03db1642998da5f1d8acc5e8d47227773265");
    expect(record.route_export_surface).toEqual(["POST"]);
    expect(record.candidate_change_required).toBe(false);
    expect(record.candidate_hash_change_required).toBe(false);
    expect(record.package_config_change_required).toBe(false);
    expect(record.evidence_acceptance_result).toBe("external_terminal_runner_evidence_accepted");
    expect(record.rehearsal_environment_readiness).toBe("external_terminal_candidate_rehearsal_environment_ready");
    expect(record.approval_decision).toBe("approved");
    expect(record.unresolved_conditions).toEqual([]);
  });

  test("documents Action 533 boundary and preserves no build rehearsal deployment activation", () => {
    const record = readJson<JsonObject>(recordPath);
    const doc = read(docPath);

    expect(record.future_rehearsal_authorization_count).toBe(1);
    expect(record.future_rehearsal_boundary).toBe("operator_unrestricted_local_terminal");
    expect(record.ad_hoc_terminal_build_authorized).toBe(false);
    expect(record.build_performed).toBe(false);
    expect(record.candidate_reconstructed).toBe(false);
    expect(record.rehearsal_performed).toBe(false);
    expect(record.deployment_performed).toBe(false);
    expect(record.preview_activated).toBe(false);
    expect(record.runtime_preview_state).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(record.next_action).toBe("action_533_external_terminal_candidate_rehearsal_handoff_gate");
    expect(doc).toContain("Action 532 does not run that rehearsal.");
    expect(doc).toContain("action_533_external_terminal_candidate_rehearsal_handoff_gate");
  });

  test("passes Action 529 result verifier and Action 532 verifier", () => {
    const action529Output = JSON.parse(
      execFileSync("node", [action529VerifierPath], { cwd: repoRoot, encoding: "utf8" }),
    ) as JsonObject;
    const action532Output = JSON.parse(
      execFileSync("node", [verifierPath], { cwd: repoRoot, encoding: "utf8" }),
    ) as JsonObject;

    expect(action529Output.verification_status).toBe("passed");
    expect(action532Output.verification_status).toBe("passed");
    expect(action532Output.evidence_acceptance_result).toBe("external_terminal_runner_evidence_accepted");
    expect(action532Output.rehearsal_environment_readiness).toBe("external_terminal_candidate_rehearsal_environment_ready");
    expect(action532Output.approval_decision).toBe("approved");
    expect(action532Output.build_performed).toBe(false);
    expect(action532Output.candidate_reconstructed).toBe(false);
    expect(action532Output.rehearsal_performed).toBe(false);
    expect(action532Output.deployment_performed).toBe(false);
    expect(action532Output.preview_activated).toBe(false);
  });
});
