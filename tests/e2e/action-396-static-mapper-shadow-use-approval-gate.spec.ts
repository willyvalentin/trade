import { createHash } from "crypto";
import { execFileSync } from "child_process";
import { existsSync, readFileSync, readdirSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

const docPath = "docs/action-396-static-mapper-shadow-use-approval-gate.md";
const hashes = {
  "lib/snapshot-to-learning-dataset-mapper.ts": "7294a851ede33aadc0dbfcb68c13337cd244002b84be7cbbe40abbe91673741d",
  "lib/learning-dataset-static-fixtures.ts": "706bd57150914862604af70e0bba7614151f53c32abc5dbde9595c53bf4b332b",
  "lib/intelligence-context-static-fixtures.ts": "46358cb997b4f7a431a3fee72562659da48b13219404224f4e80e08dbf8ed406",
  "lib/pattern-insight-static-fixtures.ts": "db8dae9f101f710123a0a3ac6493356bd761c15f231023ab9742caefaacf8f57",
};
const action397Artifacts = [
  "scripts/action-397-static-mapper-shadow-run.mjs",
  "docs/action-397-static-mapper-shadow-use.md",
  "docs/action-397-static-mapper-shadow-input-manifest.json",
  "docs/action-397-static-mapper-shadow-evidence.json",
  "scripts/action-397-static-mapper-shadow-use-verify.mjs",
  "tests/e2e/action-397-static-mapper-shadow-use.spec.ts",
];

function read(path = docPath) { return readFileSync(path, "utf8"); }
function sha(path: string) { return createHash("sha256").update(readFileSync(path)).digest("hex"); }
function files(path: string): string[] {
  return readdirSync(path, { withFileTypes: true }).flatMap((entry) => {
    const child = join(path, entry.name);
    return entry.isDirectory() ? files(child) : [child];
  });
}

test.describe.serial("Action 396 static mapper shadow-use approval gate", () => {
  test("documentation contract and upstream Action 395 readiness are complete", () => {
    const doc = read();
    for (const section of [
      "Purpose And Scope", "Authoritative Dependencies And Upstream Inventory", "Explicit Non-Goals",
      "Approval Vocabulary And Decision", "Deterministic Gate Conditions", "Proposed Action 397 Package Boundary",
      "Allowed And Forbidden Input Sources", "Static Input Allowlist And Finite Batch", "Input Manifest Contract",
      "Mapper Invocation And Runner Boundary", "Output Artifact Policy", "Filesystem And Cleanup Policy",
      "Failure And Stop Conditions", "Acceptance And Rejection Criteria", "Blocked Downstream Work", "Next Permitted Action",
    ]) expect(doc).toContain(`## ${section}`);
    expect(doc).toContain("`readiness_decision: ready`");
    expect(doc).toContain("`passed_conditions_count: 12`");
    expect(doc).toContain("`failed_conditions_count: 0`");
    expect(doc).toContain("`unresolved_conditions_count: 0`");
  });

  test("documentation freezes approval vocabulary and decision", () => {
    const doc = read();
    expect(doc).toContain("Vocabulary is exactly `approved`, `approved_with_conditions`, and `blocked`");
    expect(doc).toContain("`approval_decision: approved`");
    expect(doc).toContain("`passed_conditions_count: 15`");
    expect(doc).toContain("`failed_conditions_count: 0`");
    expect(doc).toContain("`unresolved_conditions_count: 0`");
    expect(doc).toContain("does not produce `shadow_passed`");
  });

  test("mapper and fixture hashes are exactly bound without source modification", () => {
    const doc = read();
    for (const [path, hash] of Object.entries(hashes)) {
      expect(doc, path).toContain(hash);
      expect(sha(path), path).toBe(hash);
    }
  });

  test("static input allowlist and finite batch are frozen", () => {
    const doc = read();
    const caseIds = [
      "valid_complete_mapping", "valid_rich_context", "valid_missing_optional_context", "valid_pending_outcome",
      "valid_incomplete_outcome", "valid_stale_context", "valid_partial_context", "valid_conflicting_context",
      "blocked_missing_identity", "blocked_invalid_linkage", "blocked_alias_conflict", "blocked_temporal_violation",
      "blocked_future_leakage", "blocked_invalid_provenance", "blocked_invalid_outcome", "blocked_invalid_input",
      "blocked_context_literal_padding", "blocked_freshness_literal_padding", "blocked_payload_horizon_literal_case",
      "blocked_outcome_horizon_literal_padding",
    ];
    for (const id of caseIds) expect(doc).toContain(`\`${id}\``);
    expect(doc).toContain("Batch size is exactly 20");
    expect(doc).toContain("Directory discovery, glob discovery, automatic fixture enumeration");
    expect(doc).toContain("unbounded iteration are forbidden");
  });

  test("allowed and forbidden input sources are unambiguous", () => {
    const doc = read();
    for (const allowed of ["Action 380 fixture-related static examples", "Action 381 context fixtures", "test-local Recommendation Snapshot", "manually allowlisted malformed static cases"]) expect(doc).toContain(allowed);
    for (const forbidden of ["live recommendations", "production snapshots", "database/Supabase rows", "API/provider/news responses", "downloaded historical data", "arbitrary JSON", "environment-derived input", "scanner output"]) expect(doc).toContain(forbidden);
  });

  test("input manifest contract is deterministic and non-sensitive", () => {
    const doc = read();
    for (const field of [
      "schema version", "mapper SHA-256", "all fixture hashes", "input case ID", "source fixture IDs",
      "wrapper classification", "expected status", "expected row-presence boolean", "expected consumable boolean",
      "expected issue codes", "input ordering", "input canonical hash", "`static_only: true`", "`non_production: true`",
      "`no_replay: true`", "`no_persistence: true`",
    ]) expect(doc).toContain(field);
    expect(doc).toContain("no sensitive values, environment values, machine paths, or dynamic timestamps");
  });

  test("runner allowlist denylist and blocked-result preservation are frozen", () => {
    const doc = read();
    for (const allowed of ["load the approved manifest", "construct the 20 explicit test-local wrappers", "call `mapSnapshotToLearningDataset`", "serialize bounded results canonically", "repeat the same batch", "and exit"]) expect(doc).toContain(allowed);
    for (const denied of ["filter, retry, repair, infer, suppress issues", "downgrade blocked results", "persist rows", "communicate externally", "invoke runtime modules", "feed another system"]) expect(doc).toContain(denied);
    expect(doc).toContain("Blocked results are first-class evidence");
    expect(doc).toContain("Issue arrays retain mapper ordering");
  });

  test("output evidence contract is bounded and non-authoritative", () => {
    const doc = read();
    for (const field of ["case ID", "mapper status", "row ID when present", "row-present boolean", "consumable boolean", "ordered issue codes", "issue paths", "issue severities", "canonical result hash"]) expect(doc).toContain(field);
    for (const classification of ["local", "disposable", "synthetic/static-input-derived", "non-authoritative", "non-persisted", "non-production", "non-learning", "not eligible for Pattern Discovery", "not eligible for confidence calibration", "not eligible for ranking or recommendation feedback"]) expect(doc).toContain(classification);
    expect(doc).toContain("Full rows are not approved for Action 397");
    expect(doc).toContain("No tracked shadow result/evidence file is approved");
  });

  test("repeat determinism hashes and shadow decision vocabulary are exact", () => {
    const doc = read();
    expect(doc).toContain("same static batch must run at least twice");
    for (const item of ["Statuses", "row IDs", "issue arrays", "canonical result serialization", "result hashes", "batch hash", "mapper hash", "fixture hashes", "manifest hash"]) expect(doc).toContain(item);
    expect(doc).toContain("Any mismatch returns `shadow_failed`");
    expect(doc).toContain("`shadow_passed`, `shadow_passed_with_conditions`, `shadow_failed`, and `shadow_aborted`");
    expect(doc).toContain("Action 396 emits none of these execution results");
  });

  test("disposable filesystem and cleanup policy is safe", () => {
    const doc = read();
    expect(doc).toContain("<system-temp>/ture/action-397-static-mapper-shadow/");
    expect(doc).toContain("delete the temporary directory after verification");
    for (const forbidden of ["tracked source", "application data", "runtime state", "`.env`", "`.netlify`", "browser storage", "Supabase"]) expect(doc).toContain(forbidden);
    expect(doc).toContain("No output may become an implicit production input");
  });

  test("stop conditions prevent drift external access and same-Action repair", () => {
    const doc = read();
    for (const condition of ["mapper/fixture/manifest hashes differ", "input is not allowlisted", "mapper consumer unexpectedly exists", "runtime or external-access import appears", "output path is unsafe", "batch is not exactly finite", "fixture/input mutation occurs", "blocked results are omitted", "result contracts drift", "repeated results differ"]) expect(doc).toContain(condition);
    expect(doc).toContain("No retry and no same-Action remediation are allowed");
  });

  test("no persistence replay runtime provider Supabase Pattern Discovery or feedback is approved", () => {
    const doc = read();
    for (const lock of ["Persistence: none", "Supabase reads/writes: none", "Replay: none", "Runtime/API/job integration: none", "Provider/news access: none", "Ranking/confidence mutation: none", "Pattern Discovery invocation: none"]) expect(doc).toContain(lock);
    expect(doc).toContain("Feedback to Pattern Discovery, confidence calibration, ranking, recommendations, scanner, or Learning Engine: none");
  });

  test("no Action 397 runner consumer or output evidence exists", () => {
    for (const path of action397Artifacts) expect(existsSync(path), path).toBe(false);
    const consumers = files("app").filter((path) => /\.(?:ts|tsx|js|jsx)$/.test(path) && read(path).includes("snapshot-to-learning-dataset-mapper"));
    expect(consumers).toEqual([]);
  });

  test("Action 396 files contain no executable shadow or external access", () => {
    const verifier = read("scripts/action-396-static-mapper-shadow-use-approval-gate-verify.mjs");
    const tests = read("tests/e2e/action-396-static-mapper-shadow-use-approval-gate.spec.ts");
    const importLines = tests.split("\n").filter((line) => line.startsWith("import "));
    expect(importLines.some((line) => line.includes("snapshot-to-learning-dataset-mapper"))).toBe(false);
    const functionLines = tests.split("\n").filter((line) => line.startsWith("function "));
    expect(functionLines).toHaveLength(3);
    const verifierImports = verifier.split("\n").filter((line) => line.startsWith("import "));
    expect(verifierImports).toEqual([
      'import { createHash } from "crypto";',
      'import { execFileSync } from "child_process";',
      'import { existsSync, readFileSync, readdirSync, statSync } from "fs";',
      'import { dirname, join, resolve } from "path";',
      'import { fileURLToPath } from "url";',
    ]);
  });

  test("verifier succeeds with approved decision", () => {
    const report = JSON.parse(execFileSync("node", ["scripts/action-396-static-mapper-shadow-use-approval-gate-verify.mjs"], { encoding: "utf8" }));
    expect(report.verification_status).toBe("passed");
    expect(report.approval_decision).toBe("approved");
    expect(report.passed_conditions_count).toBe(15);
    expect(report.failed_conditions_count).toBe(0);
    expect(report.unresolved_conditions_count).toBe(0);
    expect(report.mapper_consumer_files).toEqual([]);
    expect(report.proposed_runner_artifacts_found).toEqual([]);
  });

  test("Actions 394 and 395 remain healthy and runtime preview stays paused", () => {
    for (const path of [
      "scripts/action-394-pure-mapper-literal-normalization-remediation-verify.mjs",
      "scripts/action-395-independent-literal-normalization-remediation-reverification-and-shadow-use-readiness-audit-verify.mjs",
    ]) expect(JSON.parse(execFileSync("node", [path], { encoding: "utf8" })).verification_status).toBe("passed");
    expect(read()).toContain("runtime_preview_waiting_for_operator_inputs");
  });
});
