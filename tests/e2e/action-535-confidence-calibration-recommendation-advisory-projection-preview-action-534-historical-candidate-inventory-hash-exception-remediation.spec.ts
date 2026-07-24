import { execFileSync } from "child_process";
import { readFileSync } from "fs";
import { join, resolve } from "path";
import { pathToFileURL } from "url";

import { expect, test } from "@playwright/test";

const repoRoot = resolve(__dirname, "../..");
const recordPath =
  "docs/action-535-confidence-calibration-recommendation-advisory-projection-preview-action-534-historical-candidate-inventory-hash-exception-remediation-record.json";
const docPath =
  "docs/action-535-confidence-calibration-recommendation-advisory-projection-preview-action-534-historical-candidate-inventory-hash-exception-remediation.md";
const action534ResultPath =
  "docs/action-534-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-candidate-rehearsal-result.json";
const action534ScriptPath =
  "scripts/action-534-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-candidate-rehearsal.mjs";
const action534ResultVerifierPath =
  "scripts/action-534-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-candidate-rehearsal-result-verify.mjs";
const action533VerifierPath =
  "scripts/action-533-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-candidate-rehearsal-handoff-gate-verify.mjs";
const verifierPath =
  "scripts/action-535-confidence-calibration-recommendation-advisory-projection-preview-action-534-historical-candidate-inventory-hash-exception-remediation-verify.mjs";
const exceptionPath =
  "docs/action-465-confidence-calibration-recommendation-advisory-projection-preview-candidate-inventory.json";

type JsonObject = Record<string, unknown>;

function read(relativePath: string): string {
  return readFileSync(join(repoRoot, relativePath), "utf8");
}

function readJson(relativePath: string): JsonObject {
  return JSON.parse(read(relativePath)) as JsonObject;
}

async function importAction534() {
  return await import(pathToFileURL(join(repoRoot, action534ScriptPath)).href);
}

function exactException() {
  return {
    path: exceptionPath,
    sha256: null,
    classification: "static_inventory",
    provenance: "historical_30_file_overlay_action_473",
    source_classification: "historical_30_file_overlay",
  };
}

function normalEntry() {
  return {
    path: "lib/confidence-calibration-recommendation-advisory-projection.ts",
    sha256: "eb7e802e45021c05062bbeed8c69369a08bb6f928d3d8ef84a646e0d6ccf042b",
    classification: "verified_projection_core",
    provenance: "historical_30_file_overlay_action_473",
    source_classification: "historical_30_file_overlay",
  };
}

test.describe("Action 535 historical candidate inventory hash exception remediation", () => {
  test("binds the historical Action 534 aborted record and tolerates the later bounded failed retry", () => {
    const result = readJson(action534ResultPath);
    const record = readJson(recordPath);

    expect(result.schema_version).toBe("action_534_external_terminal_candidate_rehearsal_result_v1");
    expect([0, 1]).toContain(result.authoritative_build_attempt_count);
    expect(["external_terminal_candidate_rehearsal_aborted", "external_terminal_candidate_rehearsal_failed"]).toContain(
      result.candidate_rehearsal_result,
    );
    expect(result.cleanup_result).toBe("passed");
    if (result.candidate_rehearsal_result === "external_terminal_candidate_rehearsal_aborted") {
      expect(result.authoritative_error_class).toBe(`candidate_hash_mismatch:${exceptionPath}`);
    } else {
      expect(result.candidate_reconstruction_result).toBe("exact_candidate_reconstructed");
      expect(result.runtime_dependency_closure_result).toBe("complete");
      expect(result.source_integrity_result).toBe("baseline_plus_overlay_manifest_integrity");
      expect(result.source_safety_result).toBe("source_safety_passed");
      expect(result.preview_flag_verification_result).toBe("preview_flag_disabled_verified");
      expect(result.dependency_materialization_result).toBe("temporary_verified_node_modules_copy");
    }
    expect(result.deployment_performed).toBe(false);
    expect(result.preview_activated).toBe(false);
    expect(record.blocker_path).toBe(exceptionPath);
    expect(record.blocker_classification).toBe("action_534_historical_null_hash_exception_not_applied");
  });

  test("accepts only the exact historical null-hash exception and normal exact hashes", async () => {
    const action534 = await importAction534();

    expect(action534.classifyCandidateInventoryEntry(normalEntry(), new Set())).toBe("normal_hash_entry");
    expect(action534.classifyCandidateInventoryEntry(exactException(), new Set())).toBe(
      "exact_historical_null_hash_exception",
    );
  });

  test("rejects malformed Action 465 exception variants", async () => {
    const action534 = await importAction534();
    const cases = [
      { ...exactException(), sha256: "abc" },
      { ...exactException(), path: "docs/other.json" },
      { ...exactException(), path: `./${exceptionPath}` },
      { ...exactException(), provenance: "historical_30_file_overlay_action_999" },
      { ...exactException(), classification: "static_documentation" },
      { ...exactException(), source_classification: "wrong_source" },
      { ...exactException(), path: "/tmp/action-465.json" },
      { ...exactException(), path: "../docs/action-465.json" },
    ];

    for (const item of cases) {
      expect(action534.classifyCandidateInventoryEntry(item, new Set())).toBe("invalid_or_ambiguous_entry");
    }
    expect(action534.classifyCandidateInventoryEntry(exactException(), new Set([exceptionPath]))).toBe(
      "invalid_or_ambiguous_entry",
    );
  });

  test("rejects normal-file null missing or wrong hash shape despite provenance", async () => {
    const action534 = await importAction534();
    const cases = [
      { ...normalEntry(), sha256: null },
      { ...normalEntry(), sha256: undefined },
      { ...normalEntry(), sha256: "abc" },
      { ...normalEntry(), sha256: null, provenance: "historical_30_file_overlay_action_473" },
      { ...normalEntry(), path: "/tmp/file.ts" },
      { ...normalEntry(), path: "../lib/file.ts" },
    ];

    for (const item of cases) {
      expect(action534.classifyCandidateInventoryEntry(item, new Set())).toBe("invalid_or_ambiguous_entry");
    }
  });

  test("records candidate preservation and retry policy without a second retry", () => {
    const record = readJson(recordPath);
    const doc = read(docPath);

    expect(record.clean_base_identifier).toBe("15f9923c24ed1f3cf82d34656eeacbfd98a0d347");
    expect(record.change_candidate_hash).toBe("bc43bd1fe8f61561ddededd2263d64f7d12f37db46d184e3bfd0ea55a8b538de");
    expect(record.full_candidate_inventory_hash).toBe("80620318166b0b9e1858cff3f12fc78d9ad77d9116655335e1c7fd7e566930b0");
    expect(record.candidate_file_count).toBe(32);
    expect(record.remediated_route_hash).toBe("26407a8b78625a19a48a02ecf44e03db1642998da5f1d8acc5e8d47227773265");
    expect(record.candidate_change_required).toBe(false);
    expect(record.candidate_hash_change_required).toBe(false);
    expect(record.operator_retry_authorized).toBe(true);
    expect(record.operator_retry_limit).toBe(1);
    expect(record.future_operator_rehearsal_attempt_number).toBe(2);
    expect(record.future_prior_attempt_result).toBe("external_terminal_candidate_rehearsal_aborted");
    expect(record.operator_retry_command).toBe(
      "node scripts/action-534-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-candidate-rehearsal.mjs",
    );
    expect(doc).toContain("at most one retry");
  });

  test("preserves no build rehearsal deployment activation or downstream effects in Action 535", () => {
    const record = readJson(recordPath);

    expect(record.build_performed).toBe(false);
    expect(record.candidate_reconstructed).toBe(false);
    expect(record.rehearsal_performed).toBe(false);
    expect(record.deployment_performed).toBe(false);
    expect(record.preview_activated).toBe(false);
    expect(record.provider_called).toBe(false);
    expect(record.supabase_accessed).toBe(false);
    expect(record.persistence_created).toBe(false);
    expect(record.replay_created).toBe(false);
    expect(record.confidence_applied).toBe(false);
    expect(record.feedback_created).toBe(false);
    expect(record.downstream_behavior_changed).toBe(false);
    expect(record.runtime_preview_state).toBe("runtime_preview_waiting_for_operator_inputs");
  });

  test("keeps Action 533 and Action 534 verifiers healthy without executing Action 534", () => {
    const action533 = JSON.parse(
      execFileSync("node", [action533VerifierPath], { cwd: repoRoot, encoding: "utf8" }),
    ) as JsonObject;
    const action534 = JSON.parse(
      execFileSync("node", [action534ResultVerifierPath], { cwd: repoRoot, encoding: "utf8" }),
    ) as JsonObject;

    expect(action533.verification_status).toBe("passed");
    expect(action533.operator_script_executed_by_action_533).toBe(false);
    expect(action534.verification_status).toBe("passed");
    expect(action534.rehearsal_executed_by_verifier).toBe(false);
    expect(action534.build_executed_by_verifier).toBe(false);
  });

  test("passes Action 535 verifier and exposes retry next action", () => {
    const output = JSON.parse(
      execFileSync("node", [verifierPath], { cwd: repoRoot, encoding: "utf8" }),
    ) as JsonObject;

    expect(output.verification_status).toBe("passed");
    expect(output.remediation_result).toBe("action_534_historical_hash_exception_remediation_completed");
    expect(output.operator_retry_authorized).toBe(true);
    expect(output.operator_retry_limit).toBe(1);
    expect(output.action_534_script_executed_by_action_535).toBe(false);
    expect(output.build_performed).toBe(false);
    expect(output.rehearsal_performed).toBe(false);
    expect(output.deployment_performed).toBe(false);
    expect(output.preview_activated).toBe(false);
    expect(output.next_action).toBe(
      "action_534_external_terminal_candidate_rehearsal_operator_retry_after_historical_hash_exception_remediation",
    );
  });
});
