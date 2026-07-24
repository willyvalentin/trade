import { createHash } from "crypto";
import { execFileSync, spawnSync } from "child_process";
import { existsSync, mkdtempSync, readFileSync, realpathSync, rmSync, symlinkSync } from "fs";
import { tmpdir } from "os";
import { join, resolve } from "path";

import { expect, test } from "@playwright/test";

const docPath = "docs/action-397-static-mapper-shadow-use.md";
const manifestPath = "docs/action-397-static-mapper-shadow-input-manifest.json";
const runnerPath = "scripts/action-397-static-mapper-shadow-run.mjs";
const protectedHashes = {
  "lib/snapshot-to-learning-dataset-mapper.ts": "7294a851ede33aadc0dbfcb68c13337cd244002b84be7cbbe40abbe91673741d",
  "lib/learning-dataset-static-fixtures.ts": "706bd57150914862604af70e0bba7614151f53c32abc5dbde9595c53bf4b332b",
  "lib/intelligence-context-static-fixtures.ts": "46358cb997b4f7a431a3fee72562659da48b13219404224f4e80e08dbf8ed406",
  "lib/pattern-insight-static-fixtures.ts": "db8dae9f101f710123a0a3ac6493356bd761c15f231023ab9742caefaacf8f57",
};
const fixedCaseIds = [
  "valid_complete_mapping", "valid_rich_context", "valid_missing_optional_context", "valid_pending_outcome",
  "valid_incomplete_outcome", "valid_stale_context", "valid_partial_context", "valid_conflicting_context",
  "valid_equivalent_aliases", "valid_normalized_confidence", "blocked_missing_required_identity",
  "blocked_invalid_linkage", "blocked_conflicting_aliases", "blocked_temporal_violation", "blocked_future_leakage",
  "blocked_invalid_provenance", "blocked_invalid_outcome", "blocked_invalid_input",
  "blocked_unsupported_literal_variant", "blocked_horizon_conflict",
];

function read(path: string) { return readFileSync(path, "utf8"); }
function shaFile(path: string) { return createHash("sha256").update(readFileSync(path)).digest("hex"); }
function canonicalValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalValue);
  if (value && typeof value === "object") return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalValue((value as Record<string, unknown>)[key])]));
  return value;
}
function canonicalJson(value: unknown) { return JSON.stringify(canonicalValue(value)); }
function manifest() { return JSON.parse(read(manifestPath)) as Record<string, unknown> & { ordered_cases: Array<Record<string, unknown>> }; }
function runShadow() {
  const result = spawnSync("node", [runnerPath], { encoding: "utf8" });
  expect(result.status, result.stderr).toBe(0);
  return JSON.parse(result.stdout) as Record<string, unknown>;
}

test.describe.serial("Action 397 static mapper shadow execution", () => {
  test("documentation contract and Action 396 approval are complete", () => {
    const doc = read(docPath);
    for (const section of [
      "Purpose And Scope", "Action 396 Approval And Package Boundary", "Exact Manifest And Input Sources",
      "Mapper Invocation And Expected-Value Verification", "Protected Source Hashes", "Canonical Serialization And Determinism",
      "Status Counts", "Metadata-Only Evidence Contract", "Temporary Filesystem And Cleanup Result", "No-Effect Results",
      "Shadow Decision", "Blocked Downstream Work", "Runtime Preview And Next Permitted Action",
    ]) expect(doc).toContain(`## ${section}`);
    expect(doc).toContain("Action 396 returned `approval_decision: approved`");
    expect(doc).toContain("15 passed, 0 failed, and 0 unresolved conditions");
  });

  test("exact manifest schema count uniqueness and ordering are frozen", () => {
    const value = manifest();
    expect(value.manifest_schema_version).toBe("action_397_static_mapper_shadow_manifest_v1");
    for (const key of ["static_only", "non_production", "non_authoritative", "no_replay", "no_persistence", "no_runtime", "no_feedback"]) expect(value[key]).toBe(true);
    expect(value.ordered_cases).toHaveLength(20);
    expect(new Set(value.ordered_cases.map((item) => item.case_id)).size).toBe(20);
    expect(value.ordered_cases.map((item) => item.case_id)).toEqual(fixedCaseIds);
    expect(value.ordered_cases.map((item) => item.order_index)).toEqual(Array.from({ length: 20 }, (_, index) => index + 1));
  });

  test("manifest case schema is metadata-only and exact", () => {
    const keys = ["canonical_input_sha256", "case_id", "expected_consumable", "expected_issue_codes", "expected_issue_paths", "expected_row_present", "expected_status", "order_index", "source_fixture_ids", "wrapper_classification"].sort();
    for (const item of manifest().ordered_cases) {
      expect(Object.keys(item).sort()).toEqual(keys);
      expect(item).not.toHaveProperty("input");
      expect(item).not.toHaveProperty("row");
      expect(item.canonical_input_sha256).toMatch(/^[a-f0-9]{64}$/);
    }
  });

  test("mapper and fixture hash bindings remain exact", () => {
    const value = manifest();
    for (const [path, hash] of Object.entries(protectedHashes)) expect(shaFile(path), path).toBe(hash);
    expect(value.mapper_sha256).toBe(protectedHashes["lib/snapshot-to-learning-dataset-mapper.ts"]);
    expect(value.learning_fixture_sha256).toBe(protectedHashes["lib/learning-dataset-static-fixtures.ts"]);
    expect(value.context_fixture_sha256).toBe(protectedHashes["lib/intelligence-context-static-fixtures.ts"]);
    expect(value.pattern_fixture_sha256).toBe(protectedHashes["lib/pattern-insight-static-fixtures.ts"]);
  });

  test("allowed classifications are explicit and forbidden input sources are absent", () => {
    for (const item of manifest().ordered_cases) expect(item.wrapper_classification).toMatch(/^(?:test_local|fixture_derived)_/);
    const runner = read(runnerPath);
    for (const marker of ["process.stdin", "process.env", "localStorage", "@supabase", "next/server", "http://", "https://"]) expect(runner).not.toContain(marker);
    expect(runner).not.toContain("JSON.parse(process.argv");
    expect(runner).toContain("const fixedCaseIds = [");
  });

  test("manifest canonical hash is stable and documented", () => {
    const hash = createHash("sha256").update(canonicalJson(manifest())).digest("hex");
    expect(hash).toBe("79c9b8587dc9c56f9751589481a7270616909cbd5ba09c0bef7e3517a3e65e20");
    expect(read(docPath)).toContain(hash);
  });

  test("safe temporary path and symlink rejection are enforced", () => {
    const repoProbe = execFileSync("node", ["--input-type=module", "-e", `const m=await import('./${runnerPath}');try{m.validateOutputPath(process.cwd());console.log('accepted')}catch(e){console.log(e.message)}`], { encoding: "utf8" }).trim();
    expect(repoProbe).toContain("unsafe_output_not_within_system_temp");

    const parent = mkdtempSync(join(realpathSync(tmpdir()), "action397-symlink-test-"));
    const target = join(parent, "target");
    const link = join(parent, "link");
    try {
      symlinkSync(target, link);
      const symlinkProbe = execFileSync("node", ["--input-type=module", "-e", `const m=await import('./${runnerPath}');try{m.validateOutputPath(${JSON.stringify(link)});console.log('accepted')}catch(e){console.log(e.message)}`], { encoding: "utf8" }).trim();
      expect(symlinkProbe).toContain("unsafe_output_symlink");
    } finally {
      rmSync(parent, { recursive: true, force: true });
    }
  });

  test("every success and blocked contract matches the frozen manifest", () => {
    const cases = manifest().ordered_cases;
    expect(cases.slice(0, 10).every((item) => ["mapped", "mapped_with_missing_optional_data"].includes(item.expected_status as string))).toBe(true);
    expect(cases.slice(10).every((item) => String(item.expected_status).startsWith("blocked_"))).toBe(true);
    expect(new Set(cases.slice(10).map((item) => item.expected_status))).toEqual(new Set([
      "blocked_missing_required_identity", "blocked_invalid_linkage", "blocked_conflicting_aliases",
      "blocked_temporal_violation", "blocked_future_leakage", "blocked_invalid_provenance",
      "blocked_invalid_outcome", "blocked_invalid_input",
    ]));
    expect(cases.slice(10).every((item) => item.expected_row_present === false && item.expected_consumable === false && (item.expected_issue_codes as unknown[]).length > 0)).toBe(true);
  });

  test("runner produces deterministic metadata-only shadow_passed evidence", () => {
    const beforeStatus = execFileSync("git", ["status", "--short", "--untracked-files=all"], { encoding: "utf8" });
    const beforeHashes = Object.fromEntries(Object.keys(protectedHashes).map((path) => [path, shaFile(path)]));
    const report = runShadow();
    expect(report.final_shadow_decision).toBe("shadow_passed");
    expect(report.case_count).toBe(20);
    expect(report.expected_results_match).toBe(true);
    expect(report.repeat_run_identical).toBe(true);
    expect(report.metadata_only).toBe(true);
    expect(report.run_1_batch_sha256).toBe("ac9c53a650655ac088b64d517ec9bbf1005b8b3ac7d2a89430e96b3bc21585bd");
    expect(report.run_2_batch_sha256).toBe(report.run_1_batch_sha256);
    expect(report.status_counts).toEqual({
      blocked_conflicting_aliases: 1, blocked_future_leakage: 1, blocked_invalid_input: 2,
      blocked_invalid_linkage: 2, blocked_invalid_outcome: 1, blocked_invalid_provenance: 1,
      blocked_missing_required_identity: 1, blocked_temporal_violation: 1, mapped: 4,
      mapped_with_missing_optional_data: 6,
    });
    expect(execFileSync("git", ["status", "--short", "--untracked-files=all"], { encoding: "utf8" })).toBe(beforeStatus);
    expect(Object.fromEntries(Object.keys(protectedHashes).map((path) => [path, shaFile(path)]))).toEqual(beforeHashes);
  });

  test("runner source freezes exactly two runs expected comparison and deterministic hashes", () => {
    const runner = read(runnerPath);
    expect(runner).toContain("const run1 = executeBatch(manifest, cases)");
    expect(runner).toContain("const run2 = executeBatch(manifest, cases)");
    expect(runner).not.toContain("const run3");
    expect(runner).toContain("function assertExpected");
    expect(runner).toContain("canonical_result_sha256");
    expect(runner).toContain("run1BatchSha256");
    expect(runner).toContain("run2BatchSha256");
  });

  test("temporary evidence is cleaned and no tracked output exists", () => {
    const output = resolve(realpathSync(tmpdir()), "ture/action-397-static-mapper-shadow");
    expect(existsSync(output)).toBe(false);
    expect(existsSync("docs/action-397-static-mapper-shadow-evidence.json")).toBe(false);
    expect(read(docPath)).toContain("temporary evidence deleted: true");
  });

  test("no persistence replay runtime external access feedback or authoritative data occurs", () => {
    const report = runShadow();
    expect(report).toMatchObject({
      persistence_result: "none", replay_result: "none", runtime_result: "none",
      external_access_result: "none", feedback_result: "none", authoritative_data_created: false,
      mapper_consumer_files_outside_approved_boundary: [], temporary_evidence_deleted: true,
    });
  });

  test("no production mapper consumer source or fixture mutation exists", () => {
    const consumers = spawnSync("rg", ["-l", "snapshot-to-learning-dataset-mapper", "app", "--glob", "*.{ts,tsx,js,jsx}"], { encoding: "utf8" });
    expect([0, 1]).toContain(consumers.status);
    expect(consumers.stdout.trim()).toBe("");
    for (const [path, hash] of Object.entries(protectedHashes)) expect(shaFile(path), path).toBe(hash);
  });

  test("verifier succeeds after execution and cleanup", () => {
    const report = JSON.parse(execFileSync("node", ["scripts/action-397-static-mapper-shadow-use-verify.mjs"], { encoding: "utf8" })) as Record<string, unknown>;
    expect(report.verification_status).toBe("passed");
    expect(report.final_shadow_decision).toBe("shadow_passed");
    expect(report.case_count).toBe(20);
    expect(report.temporary_output_exists).toBe(false);
    expect(report.production_mapper_consumer_files).toEqual([]);
  });

  test("Actions 395 and 396 remain healthy and runtime preview remains paused", () => {
    for (const path of [
      "scripts/action-395-independent-literal-normalization-remediation-reverification-and-shadow-use-readiness-audit-verify.mjs",
      "scripts/action-396-static-mapper-shadow-use-approval-gate-verify.mjs",
    ]) expect(JSON.parse(execFileSync("node", [path], { encoding: "utf8" })).verification_status).toBe("passed");
    expect(read(docPath)).toContain("runtime_preview_waiting_for_operator_inputs");
  });
});
