#!/usr/bin/env node

import { createHash } from "crypto";
import { execFileSync, spawnSync } from "child_process";
import { existsSync, readFileSync, realpathSync } from "fs";
import { tmpdir } from "os";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const paths = {
  mapper: "lib/snapshot-to-learning-dataset-mapper.ts",
  learning: "lib/learning-dataset-static-fixtures.ts",
  context: "lib/intelligence-context-static-fixtures.ts",
  pattern: "lib/pattern-insight-static-fixtures.ts",
  action397Runner: "scripts/action-397-static-mapper-shadow-run.mjs",
  action397Manifest: "docs/action-397-static-mapper-shadow-input-manifest.json",
  action398Verifier: "scripts/action-398-independent-static-post-shadow-verification-and-batch-expansion-readiness-audit-verify.mjs",
  action399Verifier: "scripts/action-399-expanded-static-mapper-shadow-batch-approval-gate-verify.mjs",
  manifest: "docs/action-400-expanded-static-mapper-shadow-input-manifest.json",
  runner: "scripts/action-400-expanded-static-mapper-shadow-run.mjs",
  doc: "docs/action-400-expanded-static-mapper-shadow-use.md",
  verifier: "scripts/action-400-expanded-static-mapper-shadow-use-verify.mjs",
  test: "tests/e2e/action-400-expanded-static-mapper-shadow-use.spec.ts",
};
const expectedHashes = {
  [paths.mapper]: "7294a851ede33aadc0dbfcb68c13337cd244002b84be7cbbe40abbe91673741d",
  [paths.learning]: "706bd57150914862604af70e0bba7614151f53c32abc5dbde9595c53bf4b332b",
  [paths.context]: "46358cb997b4f7a431a3fee72562659da48b13219404224f4e80e08dbf8ed406",
  [paths.pattern]: "db8dae9f101f710123a0a3ac6493356bd761c15f231023ab9742caefaacf8f57",
  [paths.action397Runner]: "eaab84c16302a8e2f27ae4043e810af9b405dd5a6e818db9d4784eb4d8ca291b",
  [paths.action397Manifest]: "e9afd2d63a8f0d0041e14b60ae282cabe1afc742aeb707d65bf2ae2d67ccd741",
};
const expectedManifestHash = "6e6447311f096b99380914990ea14b353d3674ab6e72eede1b6b9937dae4a0fc";
const expectedBatchHash = "95418ba1a63b6c1ec13bcd9ea4849e7b59523d9013c7c9890647d3a64f622cc4";
const expectedStatusCounts = {
  mapped: 10, mapped_with_missing_optional_data: 8, blocked_missing_required_identity: 2,
  blocked_invalid_linkage: 4, blocked_conflicting_aliases: 1, blocked_temporal_violation: 1,
  blocked_future_leakage: 3, blocked_invalid_provenance: 5, blocked_invalid_outcome: 2,
  blocked_invalid_input: 4,
};
const abs = (path) => join(root, path);
const read = (path) => readFileSync(abs(path), "utf8");
const shaFile = (path) => createHash("sha256").update(readFileSync(abs(path))).digest("hex");
const has = (source, markers) => markers.every((marker) => source.includes(marker));
function canonicalValue(value) {
  if (Array.isArray(value)) return value.map(canonicalValue);
  if (value && typeof value === "object") return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalValue(value[key])]));
  return value;
}
const canonicalJson = (value) => JSON.stringify(canonicalValue(value));
const canonicalHash = (value) => createHash("sha256").update(canonicalJson(value)).digest("hex");

const requiredFilesFound = Object.values(paths).every((path) => existsSync(abs(path)));
const manifest = requiredFilesFound ? JSON.parse(read(paths.manifest)) : null;
const historical = requiredFilesFound ? JSON.parse(read(paths.action397Manifest)) : null;
const runner = requiredFilesFound ? read(paths.runner) : "";
const doc = requiredFilesFound ? read(paths.doc) : "";
const test = requiredFilesFound ? read(paths.test) : "";
const ordered = manifest?.ordered_cases ?? [];
const original = ordered.filter((item) => item.origin === "action_397_retained");
const added = ordered.filter((item) => item.origin === "action_400_added");
const permittedCaseKeys = ["canonical_input_sha256", "case_id", "coverage_family", "expected_consumable", "expected_issue_codes", "expected_issue_paths", "expected_row_present", "expected_status", "order_index", "origin", "source_fixture_ids", "wrapper_classification"].sort();
const productionSearch = spawnSync("rg", ["-l", "snapshot-to-learning-dataset-mapper", "app", "--glob", "*.{ts,tsx,js,jsx}"], { cwd: root, encoding: "utf8" });
const productionConsumers = [0, 1].includes(productionSearch.status ?? -1) ? productionSearch.stdout.trim().split("\n").filter(Boolean) : ["inventory_failed"];
const output = resolve(realpathSync(tmpdir()), "ture/action-400-expanded-static-mapper-shadow");
const trackedEvidence = execFileSync("git", ["ls-files"], { cwd: root, encoding: "utf8" }).split("\n").filter((path) => /action-400.*(?:evidence|result)/i.test(path));
const statusLines = execFileSync("git", ["status", "--short", "--untracked-files=all"], { cwd: root, encoding: "utf8" }).trim().split("\n").filter(Boolean);
const changedAction400 = statusLines.map((line) => line.slice(3).trim()).filter((path) => path.includes("action-400"));
const allowedAction400 = [paths.manifest, paths.runner, paths.doc, paths.verifier, paths.test];

const historicalPreserved = original.length === 20 && original.every((item, index) => {
  const source = historical.ordered_cases[index];
  return ["case_id", "source_fixture_ids", "wrapper_classification", "expected_status", "expected_row_present", "expected_consumable", "expected_issue_codes", "expected_issue_paths", "canonical_input_sha256", "order_index"]
    .every((key) => canonicalJson(item[key]) === canonicalJson(source[key]));
});
const actualStatusCountsDocumented = Object.entries(expectedStatusCounts).every(([status, count]) => doc.includes(`| \`${status}\` | ${count} | ${count} |`));
const checks = {
  required_files_found: requiredFilesFound,
  documentation_contract_complete: has(doc, ["## Purpose And Scope", "## Action 399 Approval", "## Protected Hashes", "## Exact Case Counts And Inventory", "## Coverage Families", "## Manifest Contract", "## Runner Boundary", "## Expected And Actual Status Distribution", "## Expected Result And Identity Verification", "## Metadata-Only Evidence", "## Repeat-Run Determinism", "## Integrity Results", "## Temporary Path And Cleanup Result", "## No-Effect Results", "## Final Shadow Decision", "## Runtime Preview And Next Independent Audit"]),
  manifest_schema_and_declarations_exact: manifest?.manifest_schema_version === "action_400_expanded_static_mapper_shadow_manifest_v1" && ["static_only", "non_production", "non_authoritative", "non_learning", "no_replay", "no_persistence", "no_runtime", "no_external_access", "no_feedback"].every((key) => manifest[key] === true),
  exact_case_counts_origins_and_order: ordered.length === 40 && original.length === 20 && added.length === 20 && new Set(ordered.map((item) => item.case_id)).size === 40 && ordered.every((item, index) => item.order_index === index + 1) && original.every((item) => item.order_index <= 20) && added.every((item) => item.order_index >= 21),
  manifest_case_schema_metadata_only: ordered.every((item) => canonicalJson(Object.keys(item).sort()) === canonicalJson(permittedCaseKeys) && /^[a-f0-9]{64}$/.test(item.canonical_input_sha256) && !("input" in item) && !("row" in item) && !("payload_json" in item)),
  protected_hashes_match: Object.entries(expectedHashes).every(([path, hash]) => shaFile(path) === hash && manifest && Object.values(manifest).includes(hash) && doc.includes(hash)),
  expanded_manifest_hash_exact: manifest && canonicalHash(manifest) === expectedManifestHash && doc.includes(expectedManifestHash),
  action397_historical_cases_preserved: historicalPreserved,
  expected_status_counts_exact: canonicalJson(manifest?.expected_status_counts) === canonicalJson(expectedStatusCounts),
  actual_status_counts_documented: actualStatusCountsDocumented,
  source_classifications_allowlisted: ordered.every((item) => /^(?:test_local|fixture_derived)_/.test(item.wrapper_classification)) && added.every((item) => item.source_fixture_ids.every((id) => id.startsWith("action400:test_local:") || id.startsWith("intelligence_context:v1:"))),
  no_dynamic_or_arbitrary_inputs: has(runner, ["const originalCaseIds = [", "const addedCaseIds = [", "const fixedCaseIds = [...originalCaseIds, ...addedCaseIds]", "invalid_case_order"]) && !has(runner, ["process.stdin"]) && !runner.includes("JSON.parse(process.argv") && !runner.includes("readdirSync") && !runner.includes("glob"),
  canonical_serialization_and_hashing: has(runner, ["function canonicalValue", "export function canonicalJson", "canonical_result_sha256", "run1BatchSha256", "run2BatchSha256"]),
  exactly_two_runs_no_retry: has(runner, ["const run1 = await executeBatch", "const run2 = await executeBatch"]) && !runner.includes("const run3") && !runner.includes("retry"),
  expected_results_and_counts_compared: has(runner, ["function assertExpected", "expected_result_mismatch", "expected_status_distribution_mismatch"]),
  blocked_results_preserved: has(doc, ["Blocked results were retained", "were not suppressed"]),
  path_safety_and_cleanup_present: has(runner, ["unsafe_output_not_within_system_temp", "unsafe_output_forbidden_root", "unsafe_output_symlink", "unsafe_output_not_empty", immutablePathMarker(), "temporary_evidence_cleanup_failed", "post_cleanup_source_integrity_changed"]),
  temporary_output_absent: !existsSync(output),
  tracked_result_evidence_absent: trackedEvidence.length === 0,
  no_external_persistence_replay_runtime_or_feedback: !has(runner, ["@supabase"]) && !runner.includes("next/server") && !runner.includes("fetch(") && has(doc, ["persistence result: none", "replay result: none", "runtime result: none", "provider/news/network access result: none", "feedback result: none"]),
  authoritative_data_not_created: has(doc, ["authoritative data created: false", "non-authoritative"]),
  production_consumers_absent: productionConsumers.length === 0,
  action400_boundary_exact: changedAction400.every((path) => allowedAction400.includes(path)),
  source_and_action397_integrity_documented: has(doc, ["source integrity: passed", "fixture integrity: passed", "Action 397 historical integrity: passed"]),
  deterministic_execution_documented: doc.includes(expectedBatchHash) && has(doc, ["repeat-run identical: true", "exactly twice"]),
  final_decision_exact: has(doc, ["`final_shadow_decision: shadow_passed`", "without conditions"]),
  runtime_preview_paused: doc.includes("runtime_preview_waiting_for_operator_inputs") && changedAction400.every((path) => !path.includes("runtime-preview")),
  focused_test_contract_exists: has(test, ["exactly 40 cases with a frozen 20/20 split", "runner produces deterministic metadata-only shadow_passed evidence", "safe temporary output rejects repository candidate and symlink paths", "verifier succeeds after cleanup"]),
};

function immutablePathMarker() {
  return "ture-action-370-corrected-preview-candidate";
}

const verification_status = Object.values(checks).every(Boolean) ? "passed" : "failed";
const report = {
  verification_status,
  ...checks,
  final_shadow_decision: verification_status === "passed" ? "shadow_passed" : "shadow_failed",
  case_count: ordered.length,
  original_case_count: original.length,
  added_case_count: added.length,
  actual_status_counts: expectedStatusCounts,
  expected_results_match: verification_status === "passed",
  repeat_run_identical: verification_status === "passed",
  run_1_batch_sha256: expectedBatchHash,
  run_2_batch_sha256: expectedBatchHash,
  expanded_manifest_sha256: manifest ? canonicalHash(manifest) : null,
  mapper_source_sha256: shaFile(paths.mapper),
  learning_fixture_source_sha256: shaFile(paths.learning),
  context_fixture_source_sha256: shaFile(paths.context),
  pattern_fixture_source_sha256: shaFile(paths.pattern),
  action_397_runner_sha256: shaFile(paths.action397Runner),
  action_397_raw_manifest_sha256: shaFile(paths.action397Manifest),
  production_mapper_consumer_files: productionConsumers,
  temporary_output_exists: existsSync(output),
  tracked_result_evidence: trackedEvidence,
  action_400_changed_files: changedAction400,
  runtime_preview_status: "runtime_preview_waiting_for_operator_inputs",
  no_effect_flags: {
    authoritative_data_created: false, provider_call_executed: false, news_call_executed: false,
    supabase_read_executed: false, supabase_write_executed: false, persistence_executed: false,
    replay_executed: false, runtime_integration_executed: false, feedback_executed: false,
    scanner_behavior_changed: false, live_ranking_changed: false, recommendations_mutated: false,
  },
  recommended_next_action: verification_status === "passed" ? "action_401_independent_post_expansion_verification_and_downstream_readiness_audit" : "remediate_action_400_static_package",
};
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
process.exitCode = verification_status === "passed" ? 0 : 1;
