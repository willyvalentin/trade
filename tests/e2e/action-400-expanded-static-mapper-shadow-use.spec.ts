import { createHash } from "crypto";
import { execFileSync, spawnSync } from "child_process";
import { existsSync, mkdtempSync, readFileSync, realpathSync, rmSync, symlinkSync } from "fs";
import { homedir, tmpdir } from "os";
import { join, resolve } from "path";

import { expect, test } from "@playwright/test";

const docPath = "docs/action-400-expanded-static-mapper-shadow-use.md";
const manifestPath = "docs/action-400-expanded-static-mapper-shadow-input-manifest.json";
const runnerPath = "scripts/action-400-expanded-static-mapper-shadow-run.mjs";
const verifierPath = "scripts/action-400-expanded-static-mapper-shadow-use-verify.mjs";
const action397ManifestPath = "docs/action-397-static-mapper-shadow-input-manifest.json";
const protectedHashes = {
  "lib/snapshot-to-learning-dataset-mapper.ts": "7294a851ede33aadc0dbfcb68c13337cd244002b84be7cbbe40abbe91673741d",
  "lib/learning-dataset-static-fixtures.ts": "706bd57150914862604af70e0bba7614151f53c32abc5dbde9595c53bf4b332b",
  "lib/intelligence-context-static-fixtures.ts": "46358cb997b4f7a431a3fee72562659da48b13219404224f4e80e08dbf8ed406",
  "lib/pattern-insight-static-fixtures.ts": "db8dae9f101f710123a0a3ac6493356bd761c15f231023ab9742caefaacf8f57",
  "scripts/action-397-static-mapper-shadow-run.mjs": "eaab84c16302a8e2f27ae4043e810af9b405dd5a6e818db9d4784eb4d8ca291b",
  "docs/action-397-static-mapper-shadow-input-manifest.json": "e9afd2d63a8f0d0041e14b60ae282cabe1afc742aeb707d65bf2ae2d67ccd741",
};
const expectedCounts = {
  blocked_conflicting_aliases: 1, blocked_future_leakage: 3, blocked_invalid_input: 4,
  blocked_invalid_linkage: 4, blocked_invalid_outcome: 2, blocked_invalid_provenance: 5,
  blocked_missing_required_identity: 2, blocked_temporal_violation: 1, mapped: 10,
  mapped_with_missing_optional_data: 8,
};
const read = (path: string) => readFileSync(path, "utf8");
const shaFile = (path: string) => createHash("sha256").update(readFileSync(path)).digest("hex");
function canonicalValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalValue);
  if (value && typeof value === "object") return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalValue((value as Record<string, unknown>)[key])]));
  return value;
}
const canonicalJson = (value: unknown) => JSON.stringify(canonicalValue(value));
const manifest = () => JSON.parse(read(manifestPath)) as Record<string, unknown> & { ordered_cases: Array<Record<string, unknown>> };
function runShadow() {
  const result = spawnSync("node", [runnerPath], { encoding: "utf8" });
  expect(result.status, result.stderr).toBe(0);
  return JSON.parse(result.stdout) as Record<string, unknown>;
}
function probeOutputPath(path: string) {
  return execFileSync("node", ["--input-type=module", "-e", `const m=await import('./${runnerPath}');try{m.validateOutputPath(${JSON.stringify(path)});console.log('accepted')}catch(e){console.log(e.message)}`], { encoding: "utf8" }).trim();
}

test.describe.serial("Action 400 expanded static mapper shadow execution", () => {
  test("documentation contract records approval execution integrity and no effects", () => {
    const doc = read(docPath);
    for (const section of [
      "Purpose And Scope", "Action 399 Approval", "Protected Hashes", "Exact Case Counts And Inventory",
      "Coverage Families", "Manifest Contract", "Runner Boundary", "Expected And Actual Status Distribution",
      "Expected Result And Identity Verification", "Metadata-Only Evidence", "Repeat-Run Determinism",
      "Integrity Results", "Temporary Path And Cleanup Result", "No-Effect Results", "Final Shadow Decision",
      "Runtime Preview And Next Independent Audit",
    ]) expect(doc).toContain(`## ${section}`);
    expect(doc).toContain("Action 399 returned `approval_decision: approved`");
    expect(doc).toContain("authoritative data created: false");
  });

  test("manifest has exactly 40 cases with a frozen 20/20 split", () => {
    const value = manifest();
    expect(value.manifest_schema_version).toBe("action_400_expanded_static_mapper_shadow_manifest_v1");
    for (const key of ["static_only", "non_production", "non_authoritative", "non_learning", "no_replay", "no_persistence", "no_runtime", "no_external_access", "no_feedback"]) expect(value[key]).toBe(true);
    expect(value.original_case_count).toBe(20);
    expect(value.added_case_count).toBe(20);
    expect(value.total_case_count).toBe(40);
    expect(value.ordered_cases).toHaveLength(40);
    expect(value.ordered_cases.filter((item) => item.origin === "action_397_retained")).toHaveLength(20);
    expect(value.ordered_cases.filter((item) => item.origin === "action_400_added")).toHaveLength(20);
    expect(new Set(value.ordered_cases.map((item) => item.case_id)).size).toBe(40);
    expect(value.ordered_cases.map((item) => item.order_index)).toEqual(Array.from({ length: 40 }, (_, index) => index + 1));
  });

  test("original Action 397 cases remain exact and protected hashes are bound", () => {
    const expanded = manifest();
    const historical = JSON.parse(read(action397ManifestPath)) as { ordered_cases: Array<Record<string, unknown>> };
    for (let index = 0; index < 20; index += 1) {
      for (const key of ["case_id", "source_fixture_ids", "wrapper_classification", "expected_status", "expected_row_present", "expected_consumable", "expected_issue_codes", "expected_issue_paths", "canonical_input_sha256", "order_index"]) {
        expect(expanded.ordered_cases[index][key], `${index + 1}:${key}`).toEqual(historical.ordered_cases[index][key]);
      }
    }
    for (const [path, hash] of Object.entries(protectedHashes)) expect(shaFile(path), path).toBe(hash);
  });

  test("manifest remains metadata-only with allowed classifications and fixed hashes", () => {
    const keys = ["canonical_input_sha256", "case_id", "coverage_family", "expected_consumable", "expected_issue_codes", "expected_issue_paths", "expected_row_present", "expected_status", "order_index", "origin", "source_fixture_ids", "wrapper_classification"].sort();
    for (const item of manifest().ordered_cases) {
      expect(Object.keys(item).sort()).toEqual(keys);
      expect(item.wrapper_classification).toMatch(/^(?:test_local|fixture_derived)_/);
      expect(item.canonical_input_sha256).toMatch(/^[a-f0-9]{64}$/);
      expect(item).not.toHaveProperty("input");
      expect(item).not.toHaveProperty("row");
      expect(item).not.toHaveProperty("payload_json");
    }
    expect(createHash("sha256").update(canonicalJson(manifest())).digest("hex")).toBe("6e6447311f096b99380914990ea14b353d3674ab6e72eede1b6b9937dae4a0fc");
  });

  test("forbidden input discovery arbitrary JSON stdin and CLI cases are absent", () => {
    const runner = read(runnerPath);
    for (const marker of ["process.stdin", "process.env", "localStorage", "@supabase", "next/server", "http://", "https://", "readdirSync", "glob"]) expect(runner).not.toContain(marker);
    expect(runner).not.toContain("JSON.parse(process.argv");
    expect(runner).toContain("const addedCaseIds = [");
    expect(runner).toContain("invalid_case_order");
  });

  test("all success and blocked statuses preserve exact expected distribution", () => {
    const value = manifest();
    expect(value.expected_status_counts).toEqual({
      mapped: 10, mapped_with_missing_optional_data: 8, blocked_missing_required_identity: 2,
      blocked_invalid_linkage: 4, blocked_conflicting_aliases: 1, blocked_temporal_violation: 1,
      blocked_future_leakage: 3, blocked_invalid_provenance: 5, blocked_invalid_outcome: 2,
      blocked_invalid_input: 4,
    });
    expect(new Set(value.ordered_cases.map((item) => item.expected_status))).toEqual(new Set(Object.keys(expectedCounts)));
    expect(value.ordered_cases.filter((item) => String(item.expected_status).startsWith("blocked_")).every((item) => item.expected_row_present === false && item.expected_consumable === false)).toBe(true);
  });

  test("added inventory covers identity literals provenance anti-leakage and precedence", () => {
    const added = manifest().ordered_cases.slice(20);
    expect(added.map((item) => item.case_id)).toEqual([
      "expanded_valid_bearish_risk_context", "expanded_valid_fda_event_context", "expanded_valid_sec_event_context",
      "expanded_valid_future_event_excluded", "expanded_valid_news_unavailable_context", "expanded_valid_missing_semantics_context",
      "expanded_valid_identity_nfc_equivalent", "expanded_valid_identity_percent_encoding",
      "expanded_blocked_context_category_uppercase", "expanded_blocked_freshness_unicode_padding",
      "expanded_blocked_numeric_context_string", "expanded_blocked_payload_horizon_numeric",
      "expanded_blocked_outcome_horizon_uppercase", "expanded_blocked_linkage_fingerprint",
      "expanded_blocked_stale_complete_contradiction", "expanded_blocked_anti_leakage_unknown",
      "expanded_blocked_invalid_trading_window", "expanded_precedence_identity_over_provenance",
      "expanded_precedence_linkage_over_freshness", "expanded_precedence_leakage_over_outcome",
    ]);
    expect(new Set(added.map((item) => item.coverage_family))).toEqual(new Set([
      "valid_context", "anti_leakage_valid", "valid_missing_data", "deterministic_identity", "malformed_category",
      "literal_validation", "malformed_numeric", "horizon_validation", "linkage", "provenance_contradiction",
      "anti_leakage", "malformed_input", "multi_fault_precedence",
    ]));
  });

  test("runner freezes canonical hashes expected comparison exactly two runs and no retry", () => {
    const runner = read(runnerPath);
    expect(runner).toContain("function canonicalValue");
    expect(runner).toContain("canonical_result_sha256");
    expect(runner).toContain("function assertExpected");
    expect(runner).toContain("const run1 = await executeBatch");
    expect(runner).toContain("const run2 = await executeBatch");
    expect(runner).not.toContain("const run3");
    expect(runner).not.toContain("retry");
    expect(runner).toContain("expected_status_distribution_mismatch");
  });

  test("runner produces deterministic metadata-only shadow_passed evidence", () => {
    const beforeStatus = execFileSync("git", ["status", "--short", "--untracked-files=all"], { encoding: "utf8" });
    const report = runShadow();
    expect(report).toMatchObject({
      final_shadow_decision: "shadow_passed", case_count: 40, original_case_count: 20, added_case_count: 20,
      status_counts: expectedCounts, expected_results_match: true, repeat_run_identical: true,
      run_1_batch_sha256: "95418ba1a63b6c1ec13bcd9ea4849e7b59523d9013c7c9890647d3a64f622cc4",
      run_2_batch_sha256: "95418ba1a63b6c1ec13bcd9ea4849e7b59523d9013c7c9890647d3a64f622cc4",
      expanded_manifest_sha256: "6e6447311f096b99380914990ea14b353d3674ab6e72eede1b6b9937dae4a0fc",
      source_integrity: "passed", fixture_integrity: "passed", action_397_historical_integrity: "passed",
      path_safety: "passed", metadata_only: true, temporary_evidence_deleted: true,
    });
    expect(execFileSync("git", ["status", "--short", "--untracked-files=all"], { encoding: "utf8" })).toBe(beforeStatus);
  });

  test("safe temporary output rejects repository candidate and symlink paths", () => {
    expect(probeOutputPath(process.cwd())).toContain("unsafe_output_not_within_system_temp");
    expect(probeOutputPath(homedir())).toContain("unsafe_output_not_within_system_temp");
    expect(probeOutputPath("/private/tmp/ture-action-370-corrected-preview-candidate")).toContain("unsafe_output_forbidden_root");
    const parent = mkdtempSync(join(realpathSync(tmpdir()), "action400-symlink-test-"));
    const target = join(parent, "target");
    const link = join(parent, "link");
    try {
      symlinkSync(target, link);
      expect(probeOutputPath(link)).toContain("unsafe_output_symlink");
    } finally {
      rmSync(parent, { recursive: true, force: true });
    }
  });

  test("temporary evidence is deleted and no tracked result evidence exists", () => {
    expect(existsSync(resolve(realpathSync(tmpdir()), "ture/action-400-expanded-static-mapper-shadow"))).toBe(false);
    expect(existsSync("docs/action-400-expanded-static-mapper-shadow-evidence.json")).toBe(false);
    const tracked = execFileSync("git", ["ls-files"], { encoding: "utf8" }).split("\n").filter((path) => /action-400.*(?:evidence|result)/i.test(path));
    expect(tracked).toEqual([]);
  });

  test("no source fixture or Action 397 mutation and no production consumer exists", () => {
    for (const [path, hash] of Object.entries(protectedHashes)) expect(shaFile(path), path).toBe(hash);
    const consumers = spawnSync("rg", ["-l", "snapshot-to-learning-dataset-mapper", "app", "--glob", "*.{ts,tsx,js,jsx}"], { encoding: "utf8" });
    expect([0, 1]).toContain(consumers.status);
    expect(consumers.stdout.trim()).toBe("");
  });

  test("no external access persistence replay runtime feedback or authoritative data occurs", () => {
    const report = runShadow();
    expect(report).toMatchObject({
      persistence_result: "none", replay_result: "none", runtime_result: "none",
      external_access_result: "none", feedback_result: "none", authoritative_data_created: false,
      mapper_consumer_files_outside_approved_boundary: [], temporary_evidence_deleted: true,
    });
  });

  test("verifier succeeds after cleanup", () => {
    const report = JSON.parse(execFileSync("node", [verifierPath], { encoding: "utf8" })) as Record<string, unknown>;
    expect(report.verification_status).toBe("passed");
    expect(report.final_shadow_decision).toBe("shadow_passed");
    expect(report.case_count).toBe(40);
    expect(report.temporary_output_exists).toBe(false);
    expect(report.production_mapper_consumer_files).toEqual([]);
  });

  test("Actions 398 and 399 remain healthy and runtime preview stays paused", () => {
    for (const path of [
      "scripts/action-398-independent-static-post-shadow-verification-and-batch-expansion-readiness-audit-verify.mjs",
      "scripts/action-399-expanded-static-mapper-shadow-batch-approval-gate-verify.mjs",
    ]) expect(JSON.parse(execFileSync("node", [path], { encoding: "utf8" })).verification_status).toBe("passed");
    expect(read(docPath)).toContain("runtime_preview_waiting_for_operator_inputs");
  });
});
