import { createHash } from "crypto";
import { execFileSync, spawnSync } from "child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, symlinkSync, writeFileSync } from "fs";
import { homedir, tmpdir } from "os";
import { join, resolve } from "path";

import { expect, test } from "@playwright/test";

const docPath = "docs/action-398-independent-static-post-shadow-verification-and-batch-expansion-readiness-audit.md";
const manifestPath = "docs/action-397-static-mapper-shadow-input-manifest.json";
const runnerPath = "scripts/action-397-static-mapper-shadow-run.mjs";
const hashes = {
  "lib/snapshot-to-learning-dataset-mapper.ts": "7294a851ede33aadc0dbfcb68c13337cd244002b84be7cbbe40abbe91673741d",
  "lib/learning-dataset-static-fixtures.ts": "706bd57150914862604af70e0bba7614151f53c32abc5dbde9595c53bf4b332b",
  "lib/intelligence-context-static-fixtures.ts": "46358cb997b4f7a431a3fee72562659da48b13219404224f4e80e08dbf8ed406",
  "lib/pattern-insight-static-fixtures.ts": "db8dae9f101f710123a0a3ac6493356bd761c15f231023ab9742caefaacf8f57",
  "scripts/action-397-static-mapper-shadow-run.mjs": "eaab84c16302a8e2f27ae4043e810af9b405dd5a6e818db9d4784eb4d8ca291b",
  "docs/action-397-static-mapper-shadow-input-manifest.json": "e9afd2d63a8f0d0041e14b60ae282cabe1afc742aeb707d65bf2ae2d67ccd741",
};
const expectedCounts = {
  blocked_conflicting_aliases: 1, blocked_future_leakage: 1, blocked_invalid_input: 2,
  blocked_invalid_linkage: 2, blocked_invalid_outcome: 1, blocked_invalid_provenance: 1,
  blocked_missing_required_identity: 1, blocked_temporal_violation: 1, mapped: 4,
  mapped_with_missing_optional_data: 6,
};
const expectedBatchHash = "ac9c53a650655ac088b64d517ec9bbf1005b8b3ac7d2a89430e96b3bc21585bd";

function read(path: string) { return readFileSync(path, "utf8"); }
function shaFile(path: string) { return createHash("sha256").update(readFileSync(path)).digest("hex"); }
function canonicalValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalValue);
  if (value && typeof value === "object") return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalValue((value as Record<string, unknown>)[key])]));
  return value;
}
function canonicalJson(value: unknown) { return JSON.stringify(canonicalValue(value)); }
function manifest() { return JSON.parse(read(manifestPath)) as Record<string, unknown> & { ordered_cases: Array<Record<string, unknown>> }; }
function runnerReport() {
  const result = spawnSync("node", [runnerPath], { encoding: "utf8" });
  expect(result.status, result.stderr).toBe(0);
  return JSON.parse(result.stdout) as Record<string, unknown>;
}
function pathProbe(path: string) {
  return execFileSync("node", ["--input-type=module", "-e", `const m=await import('./${runnerPath}');try{m.validateOutputPath(${JSON.stringify(path)});console.log('accepted')}catch(e){console.log(e.message)}`], { encoding: "utf8" }).trim();
}

test.describe.serial("Action 398 independent post-shadow audit", () => {
  test("documentation contract readiness and non-goals are complete", () => {
    const doc = read(docPath);
    for (const section of [
      "Purpose And Scope", "Action 396 Approval Summary", "Action 397 Execution Summary", "Explicit Non-Goals",
      "Source-Integrity Review", "Manifest-Integrity Review", "Runner-Integrity Review",
      "Exact Case, ID, Ordering, And Input-Source Review", "Expected-Result, Status, And Issue Review",
      "Result-Metadata And Full-Row-Retention Review", "Deterministic-Hash And Repeat-Run Review",
      "Output-Path And Symlink-Defense Review", "Cleanup And Tracked-Evidence Review", "Mutation And Consumer Review",
      "External-Access, Persistence, Replay, Runtime, And Feedback Review", "Authoritative-Data Classification",
      "Batch-Coverage Strengths", "Batch-Coverage Gaps", "Expansion-Risk Review", "Readiness Decision", "Next Permitted Action",
    ]) expect(doc).toContain(`## ${section}`);
    expect(doc).toContain("`readiness_decision: ready`");
    expect(doc).toContain("`passed_conditions_count: 16`");
    expect(doc).toContain("`failed_conditions_count: 0`");
    expect(doc).toContain("No Action 397 source or manifest modification");
  });

  test("source and raw manifest hashes remain exact", () => {
    const doc = read(docPath);
    for (const [path, hash] of Object.entries(hashes)) {
      expect(shaFile(path), path).toBe(hash);
      expect(doc, path).toContain(hash);
    }
  });

  test("manifest integrity source references and expected semantics are valid", () => {
    const value = manifest();
    expect(value.manifest_schema_version).toBe("action_397_static_mapper_shadow_manifest_v1");
    for (const key of ["static_only", "non_production", "non_authoritative", "no_replay", "no_persistence", "no_runtime", "no_feedback"]) expect(value[key]).toBe(true);
    expect(value.ordered_cases).toHaveLength(20);
    expect(new Set(value.ordered_cases.map((item) => item.case_id)).size).toBe(20);
    expect(value.ordered_cases.map((item) => item.order_index)).toEqual(Array.from({ length: 20 }, (_, index) => index + 1));
    const contextSource = read("lib/intelligence-context-static-fixtures.ts");
    for (const item of value.ordered_cases) {
      expect(item.wrapper_classification).toMatch(/^(?:test_local|fixture_derived)_/);
      expect((item.source_fixture_ids as string[]).every((id) => {
        if (id.startsWith("action397:test_local:")) return true;
        const prefix = "intelligence_context:v1:";
        return id.startsWith(prefix) && contextSource.includes(`identity("${id.slice(prefix.length)}")`);
      })).toBe(true);
      const blocked = String(item.expected_status).startsWith("blocked_");
      expect(item.expected_row_present).toBe(!blocked);
      expect(item.expected_consumable).toBe(!blocked);
      expect(item.canonical_input_sha256).toMatch(/^[a-f0-9]{64}$/);
      for (const path of item.expected_issue_paths as string[]) expect(path).toMatch(/^\/(?:[^~/]|~[01])*(?:\/(?:[^~/]|~[01])*)*$/);
    }
  });

  test("canonical manifest and input hashes reproduce independently", () => {
    const canonicalManifestHash = createHash("sha256").update(canonicalJson(manifest())).digest("hex");
    expect(canonicalManifestHash).toBe("79c9b8587dc9c56f9751589481a7270616909cbd5ba09c0bef7e3517a3e65e20");
    const output = execFileSync("node", ["--input-type=module", "-e", `const m=await import('./${runnerPath}');console.log(JSON.stringify(m.buildStaticShadowCases().map(c=>({case_id:c.case_id,hash:c.canonical_input_sha256}))))`], { encoding: "utf8" });
    const calculated = JSON.parse(output) as Array<{ case_id: string; hash: string }>;
    expect(calculated).toEqual(manifest().ordered_cases.map((item) => ({ case_id: item.case_id, hash: item.canonical_input_sha256 })));
  });

  test("scenario coverage includes every approved success and blocked family", () => {
    const ids = manifest().ordered_cases.map((item) => item.case_id);
    for (const fragment of [
      "complete_mapping", "rich_context", "missing_optional_context", "pending_outcome", "incomplete_outcome",
      "stale_context", "partial_context", "conflicting_context", "equivalent_aliases", "normalized_confidence",
      "missing_required_identity", "invalid_linkage", "conflicting_aliases", "temporal_violation", "future_leakage",
      "invalid_provenance", "invalid_outcome", "invalid_input", "unsupported_literal_variant", "horizon_conflict",
    ]) expect(ids.some((id) => String(id).includes(fragment)), fragment).toBe(true);
  });

  test("independent rerun reproduces exact status counts and hashes", () => {
    const before = Object.fromEntries(Object.keys(hashes).map((path) => [path, shaFile(path)]));
    const statusBefore = execFileSync("git", ["status", "--short", "--untracked-files=all"], { encoding: "utf8" });
    const report = runnerReport();
    expect(report).toMatchObject({
      final_shadow_decision: "shadow_passed", case_count: 20, status_counts: expectedCounts,
      expected_results_match: true, repeat_run_identical: true,
      run_1_batch_sha256: expectedBatchHash, run_2_batch_sha256: expectedBatchHash,
      input_manifest_sha256: "79c9b8587dc9c56f9751589481a7270616909cbd5ba09c0bef7e3517a3e65e20",
      temporary_evidence_deleted: true, metadata_only: true,
    });
    expect(Object.fromEntries(Object.keys(hashes).map((path) => [path, shaFile(path)]))).toEqual(before);
    expect(execFileSync("git", ["status", "--short", "--untracked-files=all"], { encoding: "utf8" })).toBe(statusBefore);
  });

  test("runner has exactly two runs no retry rewrite or blocked filtering", () => {
    const source = read(runnerPath);
    expect(source).toContain("const run1 = executeBatch(manifest, cases)");
    expect(source).toContain("const run2 = executeBatch(manifest, cases)");
    expect(source).not.toContain("const run3");
    expect(source).not.toMatch(/retry/i);
    expect(source).not.toMatch(/manifest\.ordered_cases\[[^\]]+\]\s*=/);
    expect(source).not.toMatch(/filter\([^)]*blocked/i);
    expect(manifest().ordered_cases.slice(10).every((item) => String(item.expected_status).startsWith("blocked_") && (item.expected_issue_codes as unknown[]).length > 0)).toBe(true);
  });

  test("metadata-only evidence source retains no full rows or inputs", () => {
    const source = read(runnerPath);
    for (const marker of ["function metadataRecord", "row_id:", "row_present:", "issue_codes:", "issue_paths:", "issue_severities:", "canonical_result_sha256:"]) expect(source).toContain(marker);
    expect(source).not.toContain("row: result.row");
    expect(source).not.toContain("input: caseDefinition.input");
    expect(existsSync("docs/action-397-static-mapper-shadow-evidence.json")).toBe(false);
  });

  test("path containment dangling resolved symlink and unsafe-file defenses hold", () => {
    expect(pathProbe(process.cwd())).toContain("unsafe_output_not_within_system_temp");
    expect(pathProbe(resolve(homedir(), ".config/action397"))).toContain("unsafe_output_not_within_system_temp");
    const parent = mkdtempSync(join(realpathSync(tmpdir()), "action398-path-audit-"));
    try {
      const dangling = join(parent, "dangling");
      symlinkSync(join(parent, "missing-target"), dangling);
      expect(pathProbe(dangling)).toContain("unsafe_output_symlink");

      const target = join(parent, "target");
      mkdirSync(target);
      const resolvedLink = join(parent, "resolved-link");
      symlinkSync(target, resolvedLink);
      expect(pathProbe(resolvedLink)).toContain("unsafe_output_symlink");

      const parentLink = join(parent, "parent-link");
      symlinkSync(target, parentLink);
      expect(pathProbe(join(parentLink, "child"))).toContain("unsafe_output_symlink");

      const file = join(parent, "file");
      writeFileSync(file, "static audit");
      expect(pathProbe(file)).toContain("unsafe_output_not_directory");

      const nonEmpty = join(parent, "non-empty");
      mkdirSync(nonEmpty);
      writeFileSync(join(nonEmpty, "existing"), "static audit");
      expect(pathProbe(nonEmpty)).toContain("unsafe_output_not_empty");
    } finally {
      rmSync(parent, { recursive: true, force: true });
    }
  });

  test("cleanup metadata-only no-effect and non-authoritative audits are clear", () => {
    const report = runnerReport();
    const output = resolve(realpathSync(tmpdir()), "ture/action-397-static-mapper-shadow");
    expect(existsSync(output)).toBe(false);
    expect(report).toMatchObject({
      temporary_evidence_deleted: true, metadata_only: true, persistence_result: "none", replay_result: "none",
      runtime_result: "none", external_access_result: "none", feedback_result: "none", authoritative_data_created: false,
      mapper_consumer_files_outside_approved_boundary: [],
    });
    const doc = read(docPath);
    for (const label of ["synthetic/static-derived", "non-authoritative", "non-production", "non-learning", "non-persisted", "not replay", "not historical backfill", "not live intelligence", "ineligible for Pattern Discovery"]) expect(doc).toContain(label);
  });

  test("runner imports and source contain no external persistence runtime replay or feedback path", () => {
    const source = read(runnerPath);
    for (const marker of ["@supabase", "next/server", "node-fetch", "axios", "http://", "https://", "process.env", "process.stdin", "localStorage", "Pattern Discovery", "confidence calibration", "queue", "analytics"]) expect(source).not.toContain(marker);
    const consumers = spawnSync("rg", ["-n", "from [\\\"'][^\\\"']*snapshot-to-learning-dataset-mapper", "app", "lib", "--glob", "*.{ts,tsx,js,jsx}"], { encoding: "utf8" });
    expect([0, 1]).toContain(consumers.status);
    expect(consumers.stdout.trim()).toBe("");
  });

  test("coverage strengths gaps and finite expansion risk are explicit", () => {
    const doc = read(docPath);
    for (const strength of ["both success statuses", "all eight blocked statuses", "explicit missing data", "deterministic row IDs", "metadata-only cleanup"]) expect(doc).toContain(strength);
    for (const gap of ["remaining Action 381 valid contexts", "broader category vocabularies", "additional provenance/freshness", "multi-fault precedence", "NFC/percent-encoding variants"]) expect(doc).toContain(gap);
    expect(doc).toContain("separately gated, explicitly allowlisted, finite");
    expect(doc).toContain("Directory discovery and unbounded batches remain forbidden");
  });

  test("verifier succeeds with ready decision and no expansion", () => {
    const report = JSON.parse(execFileSync("node", ["scripts/action-398-independent-static-post-shadow-verification-and-batch-expansion-readiness-audit-verify.mjs"], { encoding: "utf8" })) as Record<string, unknown>;
    expect(report.verification_status).toBe("passed");
    expect(report.readiness_decision).toBe("ready");
    expect(report.passed_conditions_count).toBe(16);
    expect(report.failed_conditions_count).toBe(0);
    expect(report.no_effect_flags).toMatchObject({ expanded_batch_executed: false, new_shadow_case_added: false });
  });

  test("Actions 396 and 397 remain healthy and runtime preview remains paused", () => {
    for (const path of [
      "scripts/action-396-static-mapper-shadow-use-approval-gate-verify.mjs",
      "scripts/action-397-static-mapper-shadow-use-verify.mjs",
    ]) expect(JSON.parse(execFileSync("node", [path], { encoding: "utf8" })).verification_status).toBe("passed");
    expect(read(docPath)).toContain("runtime_preview_waiting_for_operator_inputs");
  });
});
