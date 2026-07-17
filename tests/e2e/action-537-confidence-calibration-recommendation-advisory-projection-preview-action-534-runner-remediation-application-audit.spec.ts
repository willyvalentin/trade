import { createHash } from "crypto";
import { execFileSync } from "child_process";
import { readFileSync } from "fs";
import { join, resolve } from "path";

import { expect, test } from "@playwright/test";

const repoRoot = resolve(__dirname, "../..");
const recordPath =
  "docs/action-537-confidence-calibration-recommendation-advisory-projection-preview-action-534-runner-remediation-application-audit-record.json";
const docPath =
  "docs/action-537-confidence-calibration-recommendation-advisory-projection-preview-action-534-runner-remediation-application-audit.md";
const action534ResultPath =
  "docs/action-534-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-candidate-rehearsal-result.json";
const action534ScriptPath =
  "scripts/action-534-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-candidate-rehearsal.mjs";
const action534ResultVerifierPath =
  "scripts/action-534-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-candidate-rehearsal-result-verify.mjs";
const action537VerifierPath =
  "scripts/action-537-confidence-calibration-recommendation-advisory-projection-preview-action-534-runner-remediation-application-audit-verify.mjs";
const action518RecordPath =
  "docs/action-518-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-record.json";
const action518Verifier =
  "scripts/action-518-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-reconstruction-and-hash-freeze-verify.mjs";
const action532Verifier =
  "scripts/action-532-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-runner-precheck-evidence-acceptance-gate-verify.mjs";

type JsonObject = Record<string, unknown>;
type ResultEntry = { command?: string; status?: string };

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

function extractFunctionBody(source: string, functionName: string): string {
  const start = source.indexOf(`function ${functionName}`);
  if (start < 0) return "";
  const open = source.indexOf("{", start);
  let depth = 0;
  for (let index = open; index < source.length; index += 1) {
    const char = source[index];
    if (char === "{") depth += 1;
    if (char === "}") depth -= 1;
    if (depth === 0) return source.slice(open + 1, index);
  }
  return "";
}

test.describe("Action 537 Action 534 runner remediation application audit", () => {
  test("binds the observed mismatch and current ambiguous local result", () => {
    const record = readJson(recordPath);
    const result = readJson(action534ResultPath);

    expect(record.observed_result_classification).toBe(
      "action_536_remediation_not_reflected_in_operator_executed_action_534_behavior",
    );
    expect(record.current_local_result_classification).toBe(
      "unfingerprinted_action_536_style_attempt_3_result_observed_locally",
    );
    expect(record.result_freshness_classification).toBe("result_freshness_ambiguous");

    expect(result.candidate_rehearsal_result).toBe("external_terminal_candidate_rehearsal_failed");
    expect(result.operator_rehearsal_attempt_number).toBe(3);
    expect(result.authoritative_build_attempt_count).toBe(1);
    expect(result.runner_contract_version).toBeUndefined();
    expect(result.runner_script_sha256).toBeUndefined();
  });

  test("rejects candidate-internal Action 518 and Action 532 in the active runtime path", () => {
    const script = read(action534ScriptPath);
    const runSerialBody = extractFunctionBody(script, "runSerialCommands");

    expect(runSerialBody).not.toContain(action518Verifier);
    expect(runSerialBody).not.toContain(action532Verifier);
    expect(runSerialBody).toContain('command: "npx", args: ["next", "typegen"]');
    expect(runSerialBody).toContain('command: "npx", args: ["tsc", "--noEmit"]');
  });

  test("accepts Action 518 and Action 532 only after cleanup as external controls", () => {
    const script = read(action534ScriptPath);
    const externalBody = extractFunctionBody(script, "runExternalControlCommands");

    expect(externalBody).toContain(action518Verifier);
    expect(externalBody).toContain(action532Verifier);
    expect(script.indexOf("const cleanupResult = safeCleanup(target)")).toBeLessThan(
      script.indexOf("const externalControls = runExternalControlCommands()"),
    );
  });

  test("keeps build transition immediately after TypeScript prebuild success", () => {
    const script = read(action534ScriptPath);
    const runSerialBody = extractFunctionBody(script, "runSerialCommands");

    expect(runSerialBody).toContain('spawnChecked("npm", ["run", "build"]');
    expect(runSerialBody.indexOf('command: "npx", args: ["tsc", "--noEmit"]')).toBeLessThan(
      runSerialBody.indexOf('spawnChecked("npm", ["run", "build"]'),
    );
    expect(runSerialBody).not.toContain("runExternalControlCommands");
  });

  test("removes hardcoded attempt 1 and freezes attempt progression at next attempt 4", () => {
    const script = read(action534ScriptPath);
    const record = readJson(recordPath);

    expect(script).not.toContain("operator_rehearsal_attempt_number: 1");
    expect(script).not.toContain("historicalOperatorAttemptCount: 2");
    expect(script).not.toContain("nextOperatorAttemptNumber: 3");
    expect(script).toContain("deriveAttemptMetadata");
    expect(record.historical_operator_attempt_count).toBe(3);
    expect(record.valid_runner_attempt_count).toBe(2);
    expect(record.next_operator_attempt_number).toBe(4);
  });

  test("requires fresh object creation and atomic result replacement", () => {
    const script = read(action534ScriptPath);
    const writeResultBody = extractFunctionBody(script, "writeResult");
    const record = readJson(recordPath);

    expect(script).toContain("fresh_result_object_created: true");
    expect(script).toContain("prior_command_results_reused: false");
    expect(script).toContain("atomic_result_replacement_enabled: true");
    expect(writeResultBody).toContain("writeFileSync(temporary");
    expect(writeResultBody).toContain("renameSync(temporary, destination)");
    expect(record.atomic_result_replacement_enabled).toBe(true);
    expect(record.stale_result_merge_found).toBe(false);
  });

  test("binds exact runner script fingerprint and result verifier hash requirement", () => {
    const record = readJson(recordPath);
    const resultVerifier = read(action534ResultVerifierPath);

    expect(record.current_runner_script_sha256).toBe(sha256(action534ScriptPath));
    expect(record.runner_contract_version).toBe("action_537_action_534_runner_contract_v1");
    expect(resultVerifier).toContain("runner_script_sha256 === runnerHash");
    expect(resultVerifier).toContain("action_537_action_534_runner_contract_v1");
  });

  test("keeps one active command source and one active attempt source", () => {
    const record = readJson(recordPath);
    const inventory = record.source_of_truth_inventory as JsonObject[];

    expect(record.active_runtime_command_source_count).toBe(1);
    expect(record.active_attempt_accounting_source_count).toBe(1);
    expect(record.duplicate_command_inventory_found).toBe(false);
    expect(inventory.some((entry) => entry.source === "runSerialCommands" && entry.classification === "active_runtime_source")).toBe(true);
    expect(inventory.some((entry) => entry.source === "commandInventory.candidateInternalPrebuild" && entry.classification === "result_schema_fixture")).toBe(true);
  });

  test("preserves candidate hashes and keeps controls outside the candidate inventory", () => {
    const action518Record = readJson(action518RecordPath);
    const candidatePaths = new Set(
      ((action518Record.new_changed_file_inventory as JsonObject[]) ?? []).map((entry) => entry.path),
    );

    expect(action518Record.clean_base_identifier).toBe("15f9923c24ed1f3cf82d34656eeacbfd98a0d347");
    expect(action518Record.new_change_candidate_hash).toBe(
      "bc43bd1fe8f61561ddededd2263d64f7d12f37db46d184e3bfd0ea55a8b538de",
    );
    expect(action518Record.new_full_candidate_inventory_hash).toBe(
      "80620318166b0b9e1858cff3f12fc78d9ad77d9116655335e1c7fd7e566930b0",
    );
    expect(action518Record.added_route_hash).toBe(
      "26407a8b78625a19a48a02ecf44e03db1642998da5f1d8acc5e8d47227773265",
    );
    expect(candidatePaths.has(action518Verifier)).toBe(false);
    expect(candidatePaths.has(action532Verifier)).toBe(false);
  });

  test("does not execute Action 534 or any build/rehearsal/deployment/activation during Action 537", () => {
    const record = readJson(recordPath);

    for (const key of [
      "build_performed",
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
    expect(record.remediation_result).toBe("action_534_runner_remediation_application_completed");
    expect(record.operator_retry_authorized).toBe(true);
    expect(record.operator_retry_limit).toBe(1);
  });

  test("passes the Action 537 verifier without executing Action 534", () => {
    const output = execFileSync("node", [action537VerifierPath], {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    const parsed = JSON.parse(output) as JsonObject;

    expect(parsed.verification_status).toBe("passed");
    expect(parsed.action_534_script_executed_by_action_537).toBe(false);
    expect(parsed.build_performed).toBe(false);
    expect(parsed.rehearsal_performed).toBe(false);
    expect(parsed.deployment_performed).toBe(false);
    expect(parsed.preview_activated).toBe(false);
    expect(parsed.next_operator_attempt_number).toBe(4);
  });

  test("documents retry policy and no-effect boundary", () => {
    const doc = read(docPath);

    expect(doc).toContain("does not execute Action 534");
    expect(doc).toContain("result_freshness_ambiguous");
    expect(doc).toContain("action_537_action_534_runner_contract_v1");
    expect(doc).toContain("next operator attempt as `4`");
    expect(doc).toContain("temporary sibling file and atomic rename");
  });
});
