import { createHash } from "crypto";
import { execFileSync, spawnSync } from "child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "fs";
import { join, resolve } from "path";

import { expect, test } from "@playwright/test";

const docPath = "docs/action-401-independent-expanded-static-shadow-verification-and-downstream-readiness-audit.md";
const verifierPath = "scripts/action-401-independent-expanded-static-shadow-verification-and-downstream-readiness-audit-verify.mjs";
const action400Runner = "scripts/action-400-expanded-static-mapper-shadow-run.mjs";
const action400Manifest = "docs/action-400-expanded-static-mapper-shadow-input-manifest.json";
const action397Manifest = "docs/action-397-static-mapper-shadow-input-manifest.json";
const hashes = {
  "lib/snapshot-to-learning-dataset-mapper.ts": "7294a851ede33aadc0dbfcb68c13337cd244002b84be7cbbe40abbe91673741d",
  "lib/learning-dataset-static-fixtures.ts": "706bd57150914862604af70e0bba7614151f53c32abc5dbde9595c53bf4b332b",
  "lib/intelligence-context-static-fixtures.ts": "46358cb997b4f7a431a3fee72562659da48b13219404224f4e80e08dbf8ed406",
  "lib/pattern-insight-static-fixtures.ts": "db8dae9f101f710123a0a3ac6493356bd761c15f231023ab9742caefaacf8f57",
  "scripts/action-397-static-mapper-shadow-run.mjs": "eaab84c16302a8e2f27ae4043e810af9b405dd5a6e818db9d4784eb4d8ca291b",
  "docs/action-397-static-mapper-shadow-input-manifest.json": "e9afd2d63a8f0d0041e14b60ae282cabe1afc742aeb707d65bf2ae2d67ccd741",
  [action400Runner]: "a1123e1416df78a51645321cb9a273095c2a338febd8021265c4e3ee972d5b05",
  [action400Manifest]: "e0a2646492da2038bf156c0060c48eb8144e78ff0d57cda92a60d3ca36c95319",
};
const expectedCounts = {
  blocked_conflicting_aliases: 1, blocked_future_leakage: 3, blocked_invalid_input: 4,
  blocked_invalid_linkage: 4, blocked_invalid_outcome: 2, blocked_invalid_provenance: 5,
  blocked_missing_required_identity: 2, blocked_temporal_violation: 1, mapped: 10,
  mapped_with_missing_optional_data: 8,
};
const read = (path: string) => readFileSync(path, "utf8");
const sha = (path: string) => createHash("sha256").update(readFileSync(path)).digest("hex");
function canonicalValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalValue);
  if (value && typeof value === "object") return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalValue((value as Record<string, unknown>)[key])]));
  return value;
}
const canonicalJson = (value: unknown) => JSON.stringify(canonicalValue(value));
const expanded = () => JSON.parse(read(action400Manifest)) as Record<string, unknown> & { ordered_cases: Array<Record<string, unknown>> };
function files(path: string): string[] {
  if (!existsSync(path)) return [];
  if (statSync(path).isFile()) return [path];
  return readdirSync(path).flatMap((name) => files(join(path, name))).sort();
}
function rerunAction400() {
  const result = spawnSync("node", [action400Runner], { encoding: "utf8" });
  expect(result.status, result.stderr).toBe(0);
  return JSON.parse(result.stdout) as Record<string, unknown>;
}

test.describe.serial("Action 401 independent expanded shadow audit", () => {
  test("documentation contract is complete and audit-only", () => {
    const doc = read(docPath);
    for (const section of [
      "Purpose", "Scope", "Authoritative Dependencies", "Action 399 Approval Summary", "Action 400 Execution Summary",
      "Explicit Non-Goals", "Protected Hashes Before And After", "Mapper Integrity", "Fixture Integrity",
      "Action 397 Historical Integrity", "Action 400 Runner Integrity", "Action 400 Manifest Integrity",
      "Exact Case-Count Audit", "Retained-Case Audit", "Added-Case Audit", "Ordering Audit",
      "Expected-Result Audit", "Status-Distribution Audit", "Batch-Hash Audit", "Repeat-Run Audit",
      "Metadata-Only Audit", "Temporary-Output Audit", "Cleanup Audit", "Source-Mutation Audit",
      "Mapper-Consumer Audit", "External-Access Audit", "Persistence Audit", "Replay Audit", "Runtime Audit",
      "Feedback Audit", "Authoritative-Data Audit", "Expanded-Coverage Strengths", "Remaining Mapper Coverage Gaps",
      "Downstream Static-Shadow Boundary", "Eligible Downstream Input Policy", "Ineligible Downstream Input Policy",
      "Row-Reconstruction Policy", "Blocked-Result Exclusion Policy", "Non-Authoritative Lineage Policy",
      "Pattern Discovery Isolation Policy", "Downstream Risk Review", "Readiness Vocabulary",
      "Deterministic Readiness Conditions", "Readiness Decision", "Next Permitted Action",
    ]) expect(doc).toContain(`## ${section}`);
    expect(doc).toContain("creates no downstream runner");
  });

  test("protected mapper fixture historical and Action 400 hashes remain exact", () => {
    for (const [path, expected] of Object.entries(hashes)) {
      expect(sha(path), path).toBe(expected);
      expect(read(docPath)).toContain(expected);
    }
  });

  test("Action 400 manifest has exact 40/20/20 integrity", () => {
    const value = expanded();
    expect(value.ordered_cases).toHaveLength(40);
    expect(value.ordered_cases.filter((item) => item.origin === "action_397_retained")).toHaveLength(20);
    expect(value.ordered_cases.filter((item) => item.origin === "action_400_added")).toHaveLength(20);
    expect(new Set(value.ordered_cases.map((item) => item.case_id)).size).toBe(40);
    expect(value.ordered_cases.map((item) => item.order_index)).toEqual(Array.from({ length: 40 }, (_, index) => index + 1));
    expect(createHash("sha256").update(canonicalJson(value)).digest("hex")).toBe("6e6447311f096b99380914990ea14b353d3674ab6e72eede1b6b9937dae4a0fc");
  });

  test("retained Action 397 and added Action 399 cases conform exactly", () => {
    const value = expanded();
    const historical = JSON.parse(read(action397Manifest)) as { ordered_cases: Array<Record<string, unknown>> };
    for (let index = 0; index < 20; index += 1) {
      for (const key of ["case_id", "source_fixture_ids", "wrapper_classification", "expected_status", "expected_row_present", "expected_consumable", "expected_issue_codes", "expected_issue_paths", "canonical_input_sha256", "order_index"]) expect(value.ordered_cases[index][key], `${index}:${key}`).toEqual(historical.ordered_cases[index][key]);
    }
    const action399 = read("docs/action-399-expanded-static-mapper-shadow-batch-approval-gate.md");
    for (const item of value.ordered_cases.slice(20)) {
      expect(action399).toContain(`\`${item.case_id}\``);
      expect(item.origin).toBe("action_400_added");
      expect(item.wrapper_classification).toMatch(/^(?:test_local|fixture_derived)_/);
      expect(item.canonical_input_sha256).toMatch(/^[a-f0-9]{64}$/);
    }
  });

  test("status distribution row and consumable semantics are exact", () => {
    const value = expanded();
    expect(value.expected_status_counts).toEqual({
      mapped: 10, mapped_with_missing_optional_data: 8, blocked_missing_required_identity: 2,
      blocked_invalid_linkage: 4, blocked_conflicting_aliases: 1, blocked_temporal_violation: 1,
      blocked_future_leakage: 3, blocked_invalid_provenance: 5, blocked_invalid_outcome: 2,
      blocked_invalid_input: 4,
    });
    expect(value.ordered_cases.filter((item) => String(item.expected_status).startsWith("blocked_")).every((item) => item.expected_row_present === false && item.expected_consumable === false && (item.expected_issue_codes as unknown[]).length > 0)).toBe(true);
  });

  test("independent Action 400 rerun reproduces exact hashes", () => {
    const before = Object.fromEntries(Object.keys(hashes).map((path) => [path, sha(path)]));
    const statusBefore = execFileSync("git", ["status", "--short", "--untracked-files=all"], { encoding: "utf8" });
    const report = rerunAction400();
    expect(report).toMatchObject({
      final_shadow_decision: "shadow_passed", case_count: 40, original_case_count: 20, added_case_count: 20,
      status_counts: expectedCounts, expected_results_match: true, repeat_run_identical: true,
      run_1_batch_sha256: "95418ba1a63b6c1ec13bcd9ea4849e7b59523d9013c7c9890647d3a64f622cc4",
      run_2_batch_sha256: "95418ba1a63b6c1ec13bcd9ea4849e7b59523d9013c7c9890647d3a64f622cc4",
      expanded_manifest_sha256: "6e6447311f096b99380914990ea14b353d3674ab6e72eede1b6b9937dae4a0fc",
      temporary_evidence_deleted: true, metadata_only: true,
    });
    expect(Object.fromEntries(Object.keys(hashes).map((path) => [path, sha(path)]))).toEqual(before);
    expect(execFileSync("git", ["status", "--short", "--untracked-files=all"], { encoding: "utf8" })).toBe(statusBefore);
  });

  test("runner is exactly two runs with blocked retention metadata and no retry", () => {
    const runner = read(action400Runner);
    expect(runner).toContain("const run1 = await executeBatch");
    expect(runner).toContain("const run2 = await executeBatch");
    expect(runner).not.toContain("const run3");
    expect(runner).not.toContain("retry");
    expect(runner).toContain("canonical_result_sha256");
    expect(runner).toContain("results: run1");
    expect(runner).not.toContain("row: result.row");
  });

  test("metadata cleanup and path safety remain fail-closed", () => {
    const doc = read(docPath);
    expect(doc).toContain("No full row, input, snapshot, payload, context, outcome");
    expect(doc).toContain("target symlink, dangling symlink, resolved symlink, and parent-chain symlink");
    expect(doc).toContain("dedicated directory is absent");
    const output = resolve(realpathSyncForTest(), "ture/action-400-expanded-static-mapper-shadow");
    expect(existsSync(output)).toBe(false);
    expect(execFileSync("git", ["ls-files"], { encoding: "utf8" }).split("\n").filter((path) => /action-400.*(?:evidence|result)/i.test(path))).toEqual([]);
  });

  test("no source mutation consumer external persistence replay runtime or feedback exists", () => {
    const runner = read(action400Runner);
    for (const marker of ["fetch(", "@supabase", "next/server", "process.stdin", "process.env", "localStorage", "http://", "https://"]) expect(runner).not.toContain(marker);
    const consumers = spawnSync("rg", ["-l", "snapshot-to-learning-dataset-mapper", "app"], { encoding: "utf8" });
    expect([0, 1]).toContain(consumers.status);
    expect(consumers.stdout.trim()).toBe("");
    for (const result of ["External access result reproduced as `none`", "Persistence result reproduced as `none`", "Replay result reproduced as `none`", "Runtime result reproduced as `none`", "Feedback result reproduced as `none`"]) expect(read(docPath)).toContain(result);
  });

  test("mapped-only downstream eligibility and blocked exclusion are frozen", () => {
    const doc = read(docPath);
    expect(doc).toContain("Initial eligibility is limited");
    expect(doc).toContain("`status: mapped`");
    expect(doc).toContain("yields 10 eligible static cases");
    expect(doc).toContain("`mapped_with_missing_optional_data` cases are technically consumable but are initially excluded");
    expect(doc).toContain("Every `blocked_*` status");
    expect(doc).toContain("empty blocked-row handoff");
  });

  test("row lineage and deterministic reconstruction policy are complete", () => {
    const doc = read(docPath);
    for (const marker of ["No stored Action 400 output may be reused", "upstream mapper hash", "upstream fixture hashes", "upstream static case ID", "upstream canonical input hash", "mapper status", "row ID", "consumable flag", "row canonical hash", "`static_only`, `non_authoritative`, `no_persistence`, `no_runtime`, and `no_feedback`"]) expect(doc).toContain(marker);
  });

  test("Pattern Discovery isolation is conditional and no pure implementation exists", () => {
    const implementations = files("lib").filter((path) => path !== "lib/pattern-insight-static-fixtures.ts" && /(?:pattern.*discovery|pattern-discovery|cohort-builder|insight-builder|insight-generator)/i.test(path));
    expect(implementations).toEqual([]);
    const doc = read(docPath);
    expect(doc).toContain("no reviewed pure Pattern Discovery implementation");
    expect(doc).toContain("pure deterministic Pattern Discovery input/output contract");
    expect(doc).toContain("calibration-free, ranking-free, and feedback-free");
  });

  test("verifier returns ready_with_conditions", () => {
    const report = JSON.parse(execFileSync("node", [verifierPath], { encoding: "utf8" })) as Record<string, unknown>;
    expect(report.verification_status).toBe("passed");
    expect(report.readiness_decision).toBe("ready_with_conditions");
    expect(report.passed_conditions_count).toBe(24);
    expect(report.failed_conditions_count).toBe(0);
    expect(report.unresolved_conditions_count).toBe(0);
    expect(report.downstream_conditions_count).toBe(2);
    expect(report.downstream_eligible_statuses).toEqual(["mapped"]);
    expect(report.pure_pattern_discovery_implementation_files).toEqual([]);
  });

  test("Actions 399 and 400 remain healthy and runtime preview stays paused", () => {
    for (const path of [
      "scripts/action-399-expanded-static-mapper-shadow-batch-approval-gate-verify.mjs",
      "scripts/action-400-expanded-static-mapper-shadow-use-verify.mjs",
    ]) expect(JSON.parse(execFileSync("node", [path], { encoding: "utf8" })).verification_status).toBe("passed");
    expect(read(docPath)).toContain("runtime_preview_waiting_for_operator_inputs");
    expect(files("app").some((path) => path.includes("action-401"))).toBe(false);
  });
});

function realpathSyncForTest() {
  return execFileSync("node", ["-e", "process.stdout.write(require('fs').realpathSync(require('os').tmpdir()))"], { encoding: "utf8" });
}
