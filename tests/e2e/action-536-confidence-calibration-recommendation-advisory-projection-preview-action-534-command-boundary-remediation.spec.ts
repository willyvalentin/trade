import { execFileSync } from "child_process";
import { readFileSync } from "fs";
import { join, resolve } from "path";
import { pathToFileURL } from "url";

import { expect, test } from "@playwright/test";

const repoRoot = resolve(__dirname, "../..");
const recordPath =
  "docs/action-536-confidence-calibration-recommendation-advisory-projection-preview-action-534-command-boundary-remediation-record.json";
const docPath =
  "docs/action-536-confidence-calibration-recommendation-advisory-projection-preview-action-534-command-boundary-remediation.md";
const action534ResultPath =
  "docs/action-534-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-candidate-rehearsal-result.json";
const action518RecordPath =
  "docs/action-518-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-record.json";
const action534ScriptPath =
  "scripts/action-534-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-candidate-rehearsal.mjs";
const verifierPath =
  "scripts/action-536-confidence-calibration-recommendation-advisory-projection-preview-action-534-command-boundary-remediation-verify.mjs";
const action518Verifier =
  "scripts/action-518-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-reconstruction-and-hash-freeze-verify.mjs";
const action532Verifier =
  "scripts/action-532-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-runner-precheck-evidence-acceptance-gate-verify.mjs";

type NestedRecord = Record<string, unknown>;
type JsonObject = Record<string, unknown>;

function read(relativePath: string): string {
  return readFileSync(join(repoRoot, relativePath), "utf8");
}

function readJson(relativePath: string): JsonObject {
  return JSON.parse(read(relativePath)) as JsonObject;
}

function commandStatus(results: unknown, commandPath: string): unknown {
  return (Array.isArray(results) ? results : []).find(
    (entry: NestedRecord) => typeof entry.command === "string" && entry.command.includes(commandPath),
  )?.status;
}

async function importAction534(): Promise<NestedRecord> {
  return (await import(pathToFileURL(join(repoRoot, action534ScriptPath)).href)) as NestedRecord;
}

test.describe("Action 536 Action 534 command boundary remediation", () => {
  test("binds latest failed Action 534 result and candidate preconditions", () => {
    const result = readJson(action534ResultPath);
    const record = readJson(recordPath);

    expect(result.candidate_rehearsal_result).toBe("external_terminal_candidate_rehearsal_failed");
    expect([0, 1]).toContain(result.authoritative_build_attempt_count);
    expect(result.candidate_reconstruction_result).toBe("exact_candidate_reconstructed");
    expect(result.runtime_dependency_closure_result).toBe("complete");
    expect(result.source_integrity_result).toBe("baseline_plus_overlay_manifest_integrity");
    expect(result.source_safety_result).toBe("source_safety_passed");
    expect(result.preview_flag_verification_result).toBe("preview_flag_disabled_verified");
    expect(result.dependency_materialization_result).toBe("temporary_verified_node_modules_copy");
    const commandResults =
      commandStatus(result.prebuild_command_results, "npx next typegen") === "passed"
        ? result.prebuild_command_results
        : result.candidate_internal_command_results;
    expect(commandStatus(commandResults, "npx next typegen")).toBe("passed");
    expect(commandStatus(commandResults, "npx tsc --noEmit")).toBe("passed");
    expect(record.candidate_internal_preconditions_passed_in_latest_attempt).toBe(true);
  });

  test("classifies the two failed verifier commands as external controls absent from the candidate", async () => {
    const action518 = readJson(action518RecordPath);
    const candidatePaths = new Set(((action518.new_changed_file_inventory as NestedRecord[]) ?? []).map((entry) => entry.path));
    const action534 = await importAction534();
    const classify = action534.classifyAction534CommandBoundary as (
      command: string,
      candidatePaths: Set<unknown>,
    ) => NestedRecord;

    for (const verifier of [action518Verifier, action532Verifier]) {
      expect(candidatePaths.has(verifier)).toBe(false);
      const boundary = classify(`node ${verifier}`, candidatePaths);
      expect(boundary.candidate_membership).toBe(false);
      expect(boundary.runtime_build_required_candidate_path).toBe(false);
      expect(boundary.control_only_verifier).toBe(true);
      expect(boundary.classification).toBe("external_control_required_after_cleanup");
      expect(boundary.intended_execution_boundary).toBe("external_after_cleanup");
      expect(boundary.failure_reason).toBe("absent_from_candidate");
    }
  });

  test("keeps genuine candidate commands candidate-internal and rejects unknown commands", async () => {
    const action534 = await importAction534();
    const classify = action534.classifyAction534CommandBoundary as (
      command: string,
      candidatePaths: Set<unknown>,
    ) => NestedRecord;

    for (const command of ["node -e process.exit(0)", "npx next typegen", "npx tsc --noEmit", "npm run build"]) {
      const boundary = classify(command, new Set());
      expect(boundary.classification).toBe("candidate_internal_required");
      expect(boundary.control_only_verifier).toBe(false);
      expect(boundary.intended_execution_boundary).toBe("candidate_internal");
    }

    expect(classify("node scripts/unlisted-control.mjs", new Set()).classification).toBe(
      "invalid_boundary_assignment",
    );
  });

  test("updates Action 534 runner source to defer external controls until after cleanup", () => {
    const script = read(action534ScriptPath);

    expect(script).toContain("candidateInternalPrebuild");
    expect(script).toContain("externalControlsAfterCleanup");
    expect(script).toContain("runExternalControlCommands");
    expect(script).toContain("external_controls_can_establish_readiness_without_build: false");
    expect(script).not.toContain(`${action518Verifier}\"], phase: \"candidate_integrity_confirmation\"`);
    expect(script).not.toContain(`${action532Verifier}\"], phase: \"strict_source_safety_hash_matrix\"`);
  });

  test("records attempt progression and one bounded retry", () => {
    const record = readJson(recordPath);

    expect(record.historical_operator_attempt_count).toBe(2);
    expect(record.latest_operator_attempt_metadata_recorded_as).toBe(1);
    expect(record.next_operator_attempt_number).toBe(3);
    expect(record.prior_attempt_result).toBe("external_terminal_candidate_rehearsal_failed");
    expect(record.prior_attempt_blocker).toBe("candidate_internal_external_control_boundary_defect");
    expect(record.operator_retry_authorized).toBe(true);
    expect(record.operator_retry_limit).toBe(1);
    expect(record.operator_retry_command).toBe(
      "node scripts/action-534-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-candidate-rehearsal.mjs",
    );
  });

  test("preserves candidate hashes and build policy", () => {
    const record = readJson(recordPath);

    expect(record.clean_base_identifier).toBe("15f9923c24ed1f3cf82d34656eeacbfd98a0d347");
    expect(record.change_candidate_hash).toBe("bc43bd1fe8f61561ddededd2263d64f7d12f37db46d184e3bfd0ea55a8b538de");
    expect(record.full_candidate_inventory_hash).toBe("80620318166b0b9e1858cff3f12fc78d9ad77d9116655335e1c7fd7e566930b0");
    expect(record.candidate_file_count).toBe(32);
    expect(record.remediated_route_hash).toBe("26407a8b78625a19a48a02ecf44e03db1642998da5f1d8acc5e8d47227773265");
    expect(record.candidate_change_required).toBe(false);
    expect(record.candidate_hash_change_required).toBe(false);
    expect(record.authoritative_build_command).toBe("npm run build");
    expect(record.authoritative_build_attempt_limit).toBe(1);
    expect(record.same_action_build_retry_allowed).toBe(false);
  });

  test("does not execute Action 534 or any build deployment activation side effect during Action 536", () => {
    const record = readJson(recordPath);

    for (const key of [
      "build_performed",
      "candidate_reconstructed",
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
    ]) {
      expect(record[key]).toBe(false);
    }

    expect(record.remediation_result).toBe("action_534_command_boundary_remediation_completed");
    expect(record.runtime_preview_state).toBe("runtime_preview_waiting_for_operator_inputs");
  });

  test("passes the Action 536 verifier and keeps the result verifier on the current failed result", () => {
    const output = execFileSync("node", [verifierPath], {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    const parsed = JSON.parse(output) as JsonObject;

    expect(parsed.verification_status).toBe("passed");
    expect(parsed.action_534_script_executed_by_action_536).toBe(false);
    expect(parsed.build_performed).toBe(false);
    expect(parsed.rehearsal_performed).toBe(false);
    expect(parsed.deployment_performed).toBe(false);
    expect(parsed.preview_activated).toBe(false);
    expect(parsed.next_action).toBe("action_534_external_terminal_candidate_rehearsal_operator_retry_after_command_boundary_remediation");
  });

  test("documents root cause external checks and retry command", () => {
    const doc = read(docPath);

    expect(doc).toContain("does not execute Action 534");
    expect(doc).toContain("external_control_required_after_cleanup");
    expect(doc).toContain("candidate_internal_required");
    expect(doc).toContain("action_534_external_control_verifiers_misassigned_as_candidate_internal_prebuild_commands");
    expect(doc).toContain("node scripts/action-534-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-candidate-rehearsal.mjs");
  });
});
