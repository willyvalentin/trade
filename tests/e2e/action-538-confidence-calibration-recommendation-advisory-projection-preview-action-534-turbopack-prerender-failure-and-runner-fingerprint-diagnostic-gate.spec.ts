import { createHash } from "crypto";
import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join, resolve } from "path";

import { expect, test } from "@playwright/test";

const repoRoot = resolve(__dirname, "../..");
const recordPath =
  "docs/action-538-confidence-calibration-recommendation-advisory-projection-preview-action-534-turbopack-prerender-failure-and-runner-fingerprint-diagnostic-record.json";
const docPath =
  "docs/action-538-confidence-calibration-recommendation-advisory-projection-preview-action-534-turbopack-prerender-failure-and-runner-fingerprint-diagnostic-gate.md";
const action534ResultPath =
  "docs/action-534-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-candidate-rehearsal-result.json";
const action534ScriptPath =
  "scripts/action-534-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-candidate-rehearsal.mjs";
const action534ResultVerifierPath =
  "scripts/action-534-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-candidate-rehearsal-result-verify.mjs";
const action518RecordPath =
  "docs/action-518-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-record.json";
const verifierPath =
  "scripts/action-538-confidence-calibration-recommendation-advisory-projection-preview-action-534-turbopack-prerender-failure-and-runner-fingerprint-diagnostic-gate-verify.mjs";

type JsonObject = Record<string, unknown>;
type ResultEntry = { command?: string; status?: string };

const expectedRunnerHash = "85233263aa79afd1a3b1cf29f8d30e9ba0f54a13a4dddfb07e074cdb68bc6554";
const expectedNextDocs = ["docs/messages/no-cache", "docs/messages/prerender-error"];

function read(relativePath: string): string {
  return readFileSync(join(repoRoot, relativePath), "utf8");
}

function readJson(relativePath: string): JsonObject {
  return JSON.parse(read(relativePath)) as JsonObject;
}

function sha256(relativePath: string): string {
  return createHash("sha256").update(read(relativePath)).digest("hex");
}

function commandStatus(results: unknown, commandPath: string): string | undefined {
  return (Array.isArray(results) ? (results as ResultEntry[]) : []).find(
    (entry) => typeof entry.command === "string" && entry.command.includes(commandPath),
  )?.status;
}

test.describe("Action 538 Turbopack prerender and runner fingerprint diagnostic gate", () => {
  test("binds the latest fingerprinted Action 534 build failure result", () => {
    const result = readJson(action534ResultPath);
    const record = readJson(recordPath);
    const binding = record.latest_action_534_result_binding as JsonObject;

    expect(result.runner_contract_version).toBe("action_537_action_534_runner_contract_v1");
    expect(result.runner_script_sha256).toBe(expectedRunnerHash);
    expect(sha256(action534ScriptPath)).toBe(expectedRunnerHash);
    expect(result.candidate_reconstruction_result).toBe("exact_candidate_reconstructed");
    expect(result.runtime_dependency_closure_result).toBe("complete");
    expect(result.source_integrity_result).toBe("baseline_plus_overlay_manifest_integrity");
    expect(result.source_safety_result).toBe("source_safety_passed");
    expect(result.preview_flag_verification_result).toBe("preview_flag_disabled_verified");
    expect(result.dependency_materialization_result).toBe("temporary_verified_node_modules_copy");
    expect(commandStatus(result.candidate_internal_command_results, "npx next typegen")).toBe("passed");
    expect(commandStatus(result.candidate_internal_command_results, "npx tsc --noEmit")).toBe("passed");
    expect(binding.runner_script_sha256).toBe(expectedRunnerHash);
  });

  test("classifies authoritative Turbopack failure and Webpack relationship", () => {
    const result = readJson(action534ResultPath);
    const record = readJson(recordPath);

    expect(result.authoritative_build_attempt_count).toBe(1);
    expect(result.authoritative_build_result).toBe("failed");
    expect(result.authoritative_build_phase).toBe("authoritative_build");
    expect(result.authoritative_error_class).toBe("command_failed");
    expect(result.authoritative_implicated_paths).toEqual(expectedNextDocs);
    expect(result.webpack_diagnostic_attempt_count).toBe(1);
    expect(result.webpack_diagnostic_result).toBe("passed");
    expect(record.turbopack_failure_classification).toBe("turbopack_prerender_no_cache_contract_error");
    expect(record.webpack_relationship).toBe("webpack_pass_indicates_turbopack_specific_framework_behavior");
    expect(record.next_documentation_identifiers_treated_as_repository_files).toBe(false);
    for (const identifier of expectedNextDocs) {
      expect(existsSync(join(repoRoot, identifier))).toBe(false);
    }
  });

  test("records evidence usability and runner fingerprint audit", () => {
    const record = readJson(recordPath);
    const resultVerifier = read(action534ResultVerifierPath);
    const audit = record.runner_fingerprint_audit as JsonObject;

    expect(record.evidence_usability).toBe("build_failure_evidence_fully_bound");
    expect(record.runner_fingerprint_status).toBe("present_and_bound_in_latest_result");
    expect(record.runner_fingerprint_omission_cause_for_prior_observed_result).toBe(
      "action_534_active_runtime_contract_predates_action_537_fingerprint",
    );
    expect(audit.current_runner_contract_version_present).toBe(true);
    expect(audit.current_runner_script_sha256_present).toBe(true);
    expect(audit.result_verifier_requires_current_script_hash_for_future_completed_results).toBe(true);
    expect(resultVerifier).toContain("runner_script_sha256 === runnerHash");
  });

  test("records attempt accounting without authorizing another execution", () => {
    const record = readJson(recordPath);
    const result = readJson(action534ResultPath);

    expect(record.attempt_accounting).toBe("attempt_accounting_correct");
    expect(record.historical_operator_invocation_count).toBe(4);
    expect(record.valid_action_534_attempt_count).toBe(3);
    expect(record.current_operator_attempt_number).toBe(4);
    expect(record.historical_operator_attempt_count_in_result).toBe(3);
    expect(record.next_correct_attempt_number).toBe(5);
    expect(result.operator_rehearsal_attempt_number).toBe(4);
    expect(result.historical_operator_attempt_count).toBe(3);
    expect(record.operator_retry_authorized).toBe(false);
  });

  test("captures static route and prerender audit findings", () => {
    const record = readJson(recordPath);
    const action518 = readJson(action518RecordPath);
    const audit = record.static_route_prerender_audit as JsonObject;
    const candidateFiles = ((action518.new_changed_file_inventory as JsonObject[]) ?? [])
      .map((entry) => entry.path)
      .filter((path) => typeof path === "string" && /^(app|components|lib)\//.test(path));

    expect(audit.audited_candidate_app_component_lib_files).toBe(candidateFiles.length);
    expect(audit.cookies_calls).toBe(0);
    expect(audit.headers_calls).toBe(0);
    expect(audit.search_params_usage).toBe(0);
    expect(audit.unstable_no_store_usage).toBe(0);
    expect(audit.no_store_usage).toBe(0);
    expect(audit.cache_no_store_usage).toBe(0);
    expect(audit.dynamic_rendering_markers).toBe(0);
    expect(audit.page_data_generation_markers).toBe(0);
    expect(audit.supabase_client_creation_patterns).toBe(1);
    expect(audit.supabase_client_creation_paths).toEqual(["app/api/recommendations/evaluate-outcomes/route.ts"]);
  });

  test("freezes environment, candidate impact, and next action", () => {
    const record = readJson(recordPath);
    const env = record.public_build_environment_audit as JsonObject;

    expect(env.public_build_environment).toBe("public_build_environment_sufficient");
    expect(env.server_only_secret_required).toBe(false);
    expect(record.candidate_defect).toBe("candidate_defect_not_proven");
    expect(record.candidate_hash_impact).toBe("candidate_hash_change_not_required");
    expect(record.candidate_change_required).toBe(false);
    expect(record.candidate_hash_change_required).toBe(false);
    expect(record.selected_next_action).toBe("action_539_turbopack_specific_prerender_diagnostic_completion_gate");
    expect(record.next_action).toBe("action_539_turbopack_specific_prerender_diagnostic_completion_gate");
  });

  test("does not perform build, Webpack, rehearsal, deployment, activation, network, or writes", () => {
    const record = readJson(recordPath);

    for (const key of [
      "build_performed",
      "webpack_executed",
      "candidate_reconstructed",
      "rehearsal_performed",
      "deployment_performed",
      "preview_activated",
      "network_used",
      "install_performed",
      "provider_called",
      "supabase_accessed",
      "persistence_created",
      "replay_created",
      "confidence_applied",
      "feedback_created",
      "downstream_behavior_changed",
    ]) {
      expect(record[key]).toBe(false);
    }
  });

  test("passes the Action 538 verifier without executing Action 534", () => {
    const output = execFileSync("node", [verifierPath], {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    const parsed = JSON.parse(output) as JsonObject;

    expect(parsed.verification_status).toBe("passed");
    expect(parsed.action_534_executed_by_action_538).toBe(false);
    expect(parsed.build_performed).toBe(false);
    expect(parsed.webpack_executed).toBe(false);
    expect(parsed.rehearsal_performed).toBe(false);
    expect(parsed.deployment_performed).toBe(false);
    expect(parsed.preview_activated).toBe(false);
  });

  test("documents the selected classifications", () => {
    const doc = read(docPath);

    expect(doc).toContain("build_failure_evidence_fully_bound");
    expect(doc).toContain("action_534_active_runtime_contract_predates_action_537_fingerprint");
    expect(doc).toContain("turbopack_prerender_no_cache_contract_error");
    expect(doc).toContain("webpack_pass_indicates_turbopack_specific_framework_behavior");
    expect(doc).toContain("candidate_defect_not_proven");
    expect(doc).toContain("candidate_hash_change_not_required");
    expect(doc).toContain("action_539_turbopack_specific_prerender_diagnostic_completion_gate");
    expect(doc).toContain("does not authorize another Action 534 execution");
  });
});
