import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join, resolve } from "path";
import { pathToFileURL } from "url";

import { expect, test } from "@playwright/test";

const repoRoot = resolve(__dirname, "../..");
const recordPath =
  "docs/action-530-confidence-calibration-recommendation-advisory-projection-preview-action-529-temp-boundary-remediation-record.json";
const docPath =
  "docs/action-530-confidence-calibration-recommendation-advisory-projection-preview-action-529-temp-boundary-remediation.md";
const verifierPath =
  "scripts/action-530-confidence-calibration-recommendation-advisory-projection-preview-action-529-temp-boundary-remediation-verify.mjs";
const action529Path =
  "scripts/action-529-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-runner-precheck.mjs";
const action529ResultPath =
  "docs/action-529-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-runner-precheck-result.json";

const expected = {
  cleanBase: "15f9923c24ed1f3cf82d34656eeacbfd98a0d347",
  changeHash: "bc43bd1fe8f61561ddededd2263d64f7d12f37db46d184e3bfd0ea55a8b538de",
  fullHash: "80620318166b0b9e1858cff3f12fc78d9ad77d9116655335e1c7fd7e566930b0",
  routeHash: "26407a8b78625a19a48a02ecf44e03db1642998da5f1d8acc5e8d47227773265",
  blocker: "action_529_temp_boundary_canonical_alias_misclassified_as_traversal",
  result: "action_529_temp_boundary_remediation_completed",
  retryCommand:
    "node scripts/action-529-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-runner-precheck.mjs",
};

type JsonObject = Record<string, unknown>;

function read(relativePath: string): string {
  return readFileSync(join(repoRoot, relativePath), "utf8");
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(read(relativePath)) as T;
}

async function importAction529() {
  return await import(pathToFileURL(join(repoRoot, action529Path)).href);
}

test.describe("Action 530 Action 529 temp-boundary remediation", () => {
  test("records the external Terminal blocker and preserves candidate bindings", () => {
    const record = readJson<JsonObject>(recordPath);

    expect(record.schema_version).toBe("action_530_action_529_temp_boundary_remediation_record_v1");
    expect(record.source_action).toBe(529);
    expect(record.clean_base_identifier).toBe(expected.cleanBase);
    expect(record.change_candidate_hash).toBe(expected.changeHash);
    expect(record.full_candidate_inventory_hash).toBe(expected.fullHash);
    expect(record.candidate_file_count).toBe(32);
    expect(record.remediated_route_hash).toBe(expected.routeHash);
    expect(record.action_529_operator_command_executed).toBe(true);
    expect(record.action_529_operator_attempt_result).toBe("external_terminal_runner_precheck_blocked");
    expect(record.operator_message_classification).toBe("temp_boundary_traversal_rejected");
    expect(record.blocker_classification).toBe(expected.blocker);
    expect(record.candidate_reconstructed).toBe(false);
    expect(record.candidate_change_required).toBe(false);
    expect(record.candidate_hash_change_required).toBe(false);
  });

  test("documents the canonical alias diagnosis and one bounded operator retry", () => {
    const record = readJson<JsonObject>(recordPath);
    const doc = read(docPath);

    expect(doc).toContain(expected.blocker);
    expect(doc).toContain("It no longer compares `/private/var/...` against raw `/var/...`.");
    expect(doc).toContain("The external Terminal execution boundary is not disproven by this result.");
    expect(doc).toContain("Operator retry limit: `1`");
    expect(doc).toContain(expected.retryCommand);
    expect(doc).toContain("Action 530 does not execute the retry.");
    expect(record.operator_retry_authorized).toBe(true);
    expect(record.operator_retry_limit).toBe(1);
    expect(record.operator_retry_command).toBe(expected.retryCommand);
    expect(record.next_action).toBe("action_529_external_terminal_runner_precheck_operator_retry");
  });

  test("uses canonical path comparison so macOS /var alias is not a false traversal", async () => {
    const record = readJson<JsonObject>(recordPath);
    const action529 = await importAction529();
    const canonicalRoot = "/private/var/folders/example/T";
    const canonicalParent = `${canonicalRoot}/ture`;
    const canonicalTarget =
      `${canonicalParent}/action-529-confidence-calibration-projection-preview-external-terminal-runner-precheck`;

    expect(action529.isCanonicalTraversalOrEscape(canonicalRoot, canonicalTarget)).toBe(false);
    expect(action529.assertAction529TempPathSafety(canonicalRoot, canonicalParent, canonicalTarget)).toBe("passed");
    expect(action529.isExactAction529TempTarget(canonicalRoot, canonicalTarget)).toBe(true);
    expect((record.path_algorithm_audit as JsonObject).raw_var_private_var_compared_directly).toBe(false);
    expect((record.traversal_policy as JsonObject).raw_var_to_private_var_alias_rejected).toBe(false);
  });

  test("still rejects true traversal absolute escapes sibling prefixes and wrong action identities", async () => {
    const action529 = await importAction529();
    const canonicalRoot = "/private/var/folders/example/T";
    const canonicalParent = `${canonicalRoot}/ture`;
    const validTarget =
      `${canonicalParent}/action-529-confidence-calibration-projection-preview-external-terminal-runner-precheck`;

    expect(action529.isCanonicalTraversalOrEscape(canonicalRoot, canonicalRoot)).toBe(true);
    expect(action529.isCanonicalTraversalOrEscape(canonicalRoot, canonicalRoot, { allowEqual: true })).toBe(false);
    expect(action529.isCanonicalTraversalOrEscape(canonicalRoot, "/private/var/folders/example/escape")).toBe(true);
    expect(action529.isCanonicalTraversalOrEscape(canonicalRoot, "/etc")).toBe(true);
    expect(action529.isCanonicalTraversalOrEscape("/tmp/t", "/tmp/ture/action-529")).toBe(true);
    expect(action529.assertAction529TempPathSafety(canonicalRoot, canonicalParent, validTarget)).toBe("passed");
    expect(
      action529.assertAction529TempPathSafety(
        canonicalRoot,
        canonicalParent,
        `${canonicalParent}/action-530-confidence-calibration-projection-preview-external-terminal-runner-precheck`,
      ),
    ).toBe("unexpected_action_529_temp_identity");
    expect(action529.assertAction529TempPathSafety(canonicalRoot, "/private/var/folders/example/escape", validTarget)).toBe(
      "temp_boundary_parent_escape_rejected",
    );
    expect(action529.assertAction529TempPathSafety(canonicalRoot, canonicalParent, "/private/var/folders/example/escape")).toBe(
      "temp_boundary_traversal_rejected",
    );
  });

  test("preserves symlink forbidden-root input sanitization and result-schema protections", () => {
    const record = readJson<JsonObject>(recordPath);
    const script = read(action529Path);

    expect(record.symlink_protections_preserved).toBe(true);
    expect(record.forbidden_root_protections_preserved).toBe(true);
    expect(record.exact_action_subtree_preserved).toBe(true);
    expect(record.input_policy_preserved).toBe(true);
    expect(record.sanitization_policy_preserved).toBe(true);
    expect(record.result_schema_preserved).toBe(true);
    expect(script).toContain("rejectSymlinkIfPresent");
    expect(script).toContain("temp parent symlink rejected");
    expect(script).toContain("temp target symlink rejected");
    expect(script).toContain("unexpected Action 529 temp identity");
    expect(script).toContain("join(canonicalTrustedRoot, \"ture\", tempIdentity)");
    expect(script).toContain("join(canonicalParent, tempIdentity)");
    expect(script).toContain("ensureInteractiveTerminal");
    expect(script).toContain("ensureNoArguments");
    expect(script).toContain("promptHidden");
    expect(script).toContain("raw_environment_values_recorded: false");
    expect(script).toContain("environment_values_hashed: false");
    expect(script).toContain("env_file_written: false");
    expect(script).not.toContain(".env.local");
    expect(script).not.toContain("process.argv[2]");
    expect(script).not.toContain("fetch(");
    expect(read(docPath)).toContain("repository, HOME, `node_modules`, and `.netlify` path rejection");
  });

  test("does not execute Action 529 build rehearsal deploy preview or downstream effects", () => {
    const record = readJson<JsonObject>(recordPath);

    for (const key of [
      "action_529_script_executed_by_action_530",
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
      expect(record[key as keyof typeof record], `${key} must remain false`).toBe(false);
    }
    expect(record.remediation_result).toBe(expected.result);
    expect(record.runtime_preview_state).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(existsSync(join(repoRoot, action529ResultPath))).toBe(false);
  });

  test("independent verifier passes and does not create the Action 529 result", () => {
    const output = execFileSync(process.execPath, [join(repoRoot, verifierPath)], {
      cwd: repoRoot,
      encoding: "utf8",
    });
    const verification = JSON.parse(output) as JsonObject;

    expect(verification.verification_status).toBe("passed");
    expect(verification.remediation_result).toBe(expected.result);
    expect(verification.action_529_script_executed_by_action_530).toBe(false);
    expect(verification.build_performed).toBe(false);
    expect(verification.rehearsal_performed).toBe(false);
    expect(verification.deployment_performed).toBe(false);
    expect(verification.preview_activated).toBe(false);
    expect(verification.provider_called).toBe(false);
    expect(verification.supabase_accessed).toBe(false);
    expect(verification.persistence_created).toBe(false);
    expect(verification.replay_created).toBe(false);
    expect(verification.confidence_applied).toBe(false);
    expect(verification.feedback_created).toBe(false);
    expect(existsSync(join(repoRoot, action529ResultPath))).toBe(false);
  });
});
