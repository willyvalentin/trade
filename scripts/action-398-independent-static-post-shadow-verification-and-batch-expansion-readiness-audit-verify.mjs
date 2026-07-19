#!/usr/bin/env node

import { createHash } from "crypto";
import { execFileSync } from "child_process";
import { existsSync, readFileSync, readdirSync, realpathSync, statSync } from "fs";
import { tmpdir } from "os";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const paths = {
  mapper: "lib/snapshot-to-learning-dataset-mapper.ts",
  learning: "lib/learning-dataset-static-fixtures.ts",
  context: "lib/intelligence-context-static-fixtures.ts",
  pattern: "lib/pattern-insight-static-fixtures.ts",
  runner: "scripts/action-397-static-mapper-shadow-run.mjs",
  manifest: "docs/action-397-static-mapper-shadow-input-manifest.json",
  action396: "docs/action-396-static-mapper-shadow-use-approval-gate.md",
  action397: "docs/action-397-static-mapper-shadow-use.md",
  doc: "docs/action-398-independent-static-post-shadow-verification-and-batch-expansion-readiness-audit.md",
  verifier: "scripts/action-398-independent-static-post-shadow-verification-and-batch-expansion-readiness-audit-verify.mjs",
  test: "tests/e2e/action-398-independent-static-post-shadow-verification-and-batch-expansion-readiness-audit.spec.ts",
};
const hashes = {
  [paths.mapper]: "7294a851ede33aadc0dbfcb68c13337cd244002b84be7cbbe40abbe91673741d",
  [paths.learning]: "706bd57150914862604af70e0bba7614151f53c32abc5dbde9595c53bf4b332b",
  [paths.context]: "46358cb997b4f7a431a3fee72562659da48b13219404224f4e80e08dbf8ed406",
  [paths.pattern]: "db8dae9f101f710123a0a3ac6493356bd761c15f231023ab9742caefaacf8f57",
  [paths.runner]: "eaab84c16302a8e2f27ae4043e810af9b405dd5a6e818db9d4784eb4d8ca291b",
  [paths.manifest]: "e9afd2d63a8f0d0041e14b60ae282cabe1afc742aeb707d65bf2ae2d67ccd741",
};
const statuses = new Set([
  "mapped", "mapped_with_missing_optional_data", "blocked_missing_required_identity", "blocked_invalid_linkage",
  "blocked_conflicting_aliases", "blocked_temporal_violation", "blocked_future_leakage",
  "blocked_invalid_provenance", "blocked_invalid_outcome", "blocked_invalid_input",
]);
const issueCodes = new Set([
  "missing_required_identity", "invalid_linkage", "conflicting_aliases", "invalid_timestamp", "temporal_violation",
  "future_leakage", "invalid_provenance", "invalid_outcome", "invalid_input", "missing_optional_context",
  "missing_optional_outcome", "unknown_setup", "unavailable_source", "partial_provenance",
]);
const caseKeys = [
  "canonical_input_sha256", "case_id", "expected_consumable", "expected_issue_codes", "expected_issue_paths",
  "expected_row_present", "expected_status", "order_index", "source_fixture_ids", "wrapper_classification",
];
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
const sha = (value) => createHash("sha256").update(value).digest("hex");
function files(path) {
  if (!existsSync(abs(path))) return [];
  if (statSync(abs(path)).isFile()) return [path];
  return readdirSync(abs(path)).flatMap((name) => files(join(path, name))).sort();
}

const doc = existsSync(abs(paths.doc)) ? read(paths.doc) : "";
const tests = existsSync(abs(paths.test)) ? read(paths.test) : "";
const runner = existsSync(abs(paths.runner)) ? read(paths.runner) : "";
const manifest = existsSync(abs(paths.manifest)) ? JSON.parse(read(paths.manifest)) : {};
const contextSource = existsSync(abs(paths.context)) ? read(paths.context) : "";
const changed = execFileSync("git", ["status", "--short", "--untracked-files=all"], { cwd: root, encoding: "utf8" })
  .trim().split("\n").filter(Boolean).map((line) => line.slice(3).trim()).map((path) => path.split(" -> ").at(-1));
const action398Files = changed.filter((path) => path.includes("action-398"));
const allowedAction398Files = [paths.doc, paths.verifier, paths.test];
const productionConsumers = [...files("app"), ...files("lib")].filter(
  (path) => path !== paths.mapper && /\.(?:ts|tsx|js|jsx)$/.test(path) && /from\s+["'][^"']*snapshot-to-learning-dataset-mapper["']/.test(read(path)),
);
const outputPath = resolve(realpathSync(tmpdir()), "ture/action-397-static-mapper-shadow");
const cases = Array.isArray(manifest.ordered_cases) ? manifest.ordered_cases : [];
const canonicalManifestHash = sha(canonicalJson(manifest));
const expectedStatusCounts = {
  blocked_conflicting_aliases: 1, blocked_future_leakage: 1, blocked_invalid_input: 2,
  blocked_invalid_linkage: 2, blocked_invalid_outcome: 1, blocked_invalid_provenance: 1,
  blocked_missing_required_identity: 1, blocked_temporal_violation: 1, mapped: 4,
  mapped_with_missing_optional_data: 6,
};
const manifestStatusCounts = {};
for (const item of cases) manifestStatusCounts[item.expected_status] = (manifestStatusCounts[item.expected_status] ?? 0) + 1;

const checks = {
  required_files_found: Object.values(paths).every((path) => existsSync(abs(path))),
  required_document_sections_found: has(doc, ["## Purpose And Scope", "## Action 396 Approval Summary", "## Action 397 Execution Summary", "## Source-Integrity Review", "## Manifest-Integrity Review", "## Runner-Integrity Review", "## Expected-Result, Status, And Issue Review", "## Result-Metadata And Full-Row-Retention Review", "## Deterministic-Hash And Repeat-Run Review", "## Output-Path And Symlink-Defense Review", "## Cleanup And Tracked-Evidence Review", "## Batch-Coverage Strengths", "## Batch-Coverage Gaps", "## Expansion-Risk Review", "## Readiness Decision", "## Next Permitted Action"]),
  protected_hashes_recorded_and_unchanged: Object.entries(hashes).every(([path, hash]) => shaFile(path) === hash && doc.includes(hash)),
  action_397_runner_and_manifest_immutable: shaFile(paths.runner) === hashes[paths.runner] && shaFile(paths.manifest) === hashes[paths.manifest],
  manifest_schema_and_declarations_exact: manifest.manifest_schema_version === "action_397_static_mapper_shadow_manifest_v1" && ["static_only", "non_production", "non_authoritative", "no_replay", "no_persistence", "no_runtime", "no_feedback"].every((key) => manifest[key] === true),
  exact_case_count_ids_and_ordering: cases.length === 20 && new Set(cases.map((item) => item.case_id)).size === 20 && cases.every((item, index) => item.order_index === index + 1),
  manifest_case_schema_and_no_dynamic_fields: cases.every((item) => canonicalJson(Object.keys(item).sort()) === canonicalJson(caseKeys)),
  source_fixture_references_exist: cases.every((item) => item.source_fixture_ids.every((id) => {
    if (id.startsWith("action397:test_local:")) return true;
    const prefix = "intelligence_context:v1:";
    return id.startsWith(prefix) && contextSource.includes(`identity("${id.slice(prefix.length)}")`);
  })),
  wrapper_classifications_allowlisted: cases.every((item) => /^(?:test_local|fixture_derived)_/.test(item.wrapper_classification)),
  expected_status_row_and_consumable_semantics_valid: cases.every((item) => statuses.has(item.expected_status) && (item.expected_status.startsWith("blocked_") ? item.expected_row_present === false && item.expected_consumable === false : item.expected_row_present === true && item.expected_consumable === true)),
  issue_codes_and_paths_valid: cases.every((item) => item.expected_issue_codes.every((code) => issueCodes.has(code)) && item.expected_issue_paths.every((path) => /^\/(?:[^~/]|~[01])*(?:\/(?:[^~/]|~[01])*)*$/.test(path))),
  canonical_input_hashes_frozen: cases.every((item) => /^[a-f0-9]{64}$/.test(item.canonical_input_sha256)),
  no_full_rows_inputs_or_sensitive_manifest_values: !/(?:"row"|"input"|"payload_json"|"contextSnapshot"|"outcome"\s*:|secret|password|api[_-]?key|process\.env)/i.test(read(paths.manifest)),
  scenario_coverage_audit_complete: has(doc, ["complete mapping", "rich context", "absent optional context", "pending outcome", "incomplete outcome", "stale context", "partial context", "conflicting context", "equivalent aliases", "normalized confidence", "missing identity", "valid horizon conflict"]),
  coverage_strengths_and_gaps_documented: has(doc, ["## Batch-Coverage Strengths", "## Batch-Coverage Gaps", "remaining Action 381 valid contexts", "multi-fault precedence", "identity-stability cases"]),
  independent_rerun_results_recorded: has(doc, ["final decision: `shadow_passed`", "case count: 20", "expected results match: true", "repeat-run identical: true"]),
  exact_status_distribution_recorded: canonicalJson(manifestStatusCounts) === canonicalJson(expectedStatusCounts) && Object.entries(expectedStatusCounts).every(([status, count]) => doc.includes(`| \`${status}\` | ${count} |`)),
  exact_manifest_and_batch_hashes_recorded: canonicalManifestHash === "79c9b8587dc9c56f9751589481a7270616909cbd5ba09c0bef7e3517a3e65e20" && has(doc, [canonicalManifestHash, "ac9c53a650655ac088b64d517ec9bbf1005b8b3ac7d2a89430e96b3bc21585bd"]),
  exactly_two_runs_no_retry_or_rewrite: has(runner, ["const run1 = executeBatch(manifest, cases)", "const run2 = executeBatch(manifest, cases)", "expected_result_mismatch"]) && !runner.includes("const run3") && !/retry/i.test(runner) && !/manifest\.ordered_cases\[[^\]]+\]\s*=/.test(runner),
  blocked_results_retained: cases.slice(10).every((item) => item.expected_status.startsWith("blocked_") && item.expected_issue_codes.length > 0) && !/filter\([^)]*blocked/i.test(runner),
  metadata_only_no_full_row_retention: has(runner, ["function metadataRecord", "row_id:", "row_present:", "issue_codes:", "canonical_result_sha256:"]) && !runner.includes("row: result.row") && doc.includes("No full-row or tracked evidence artifact exists"),
  path_safety_and_symlink_audit_documented: has(doc, ["dangling symlinks", "resolved symlinks", "parent-chain symlinks", "pre-existing files", "home/config paths", "fail closed"]),
  cleanup_and_tracked_evidence_clear: !existsSync(outputPath) && !existsSync(abs("docs/action-397-static-mapper-shadow-evidence.json")) && has(doc, ["temp evidence files: absent", "tracked result artifact: absent", "stale audited-run temp file: absent"]),
  external_access_import_audit_clear: !/(?:@supabase|next\/server|node-fetch|axios|http:|https:|net\.|dgram\.|WebSocket|process\.env|process\.stdin|localStorage)/.test(runner),
  persistence_replay_runtime_feedback_audits_clear: has(doc, ["external access: none", "persistence/database/Supabase writes: none", "replay: none", "runtime callbacks/routes/jobs: none", "Pattern Discovery/calibration/ranking/recommendation/scanner feedback: none"]),
  authoritative_classification_complete: has(doc, ["synthetic/static-derived", "non-authoritative", "non-production", "non-learning", "non-persisted", "not replay", "not historical backfill", "not live intelligence", "ineligible for Pattern Discovery"]),
  production_consumers_absent: productionConsumers.length === 0,
  no_action_397_or_protected_source_modification: Object.entries(hashes).every(([path, hash]) => shaFile(path) === hash),
  action_398_boundary_respected: action398Files.every((path) => allowedAction398Files.includes(path)),
  no_schema_migration_proxy_middleware_netlify_changes: action398Files.every((path) => !/^(?:app\/|lib\/|supabase\/migrations|proxy\.ts|middleware\.|netlify\.)/.test(path)),
  runtime_preview_chain_untouched: action398Files.every((path) => !path.includes("runtime-preview")) && doc.includes("runtime_preview_waiting_for_operator_inputs"),
  readiness_decision_ready: has(doc, ["Vocabulary is exactly `ready`, `ready_with_conditions`, and `blocked`", "`readiness_decision: ready`", "`passed_conditions_count: 16`", "`failed_conditions_count: 0`", "`unresolved_conditions_count: 0`"]),
  separate_expansion_gate_identified: doc.includes("next permitted Action is a separate static batch-expansion approval gate"),
  focused_test_contract_exists: has(tests, ["manifest integrity source references and expected semantics", "independent rerun reproduces exact status counts and hashes", "path containment dangling resolved symlink and unsafe-file defenses", "cleanup metadata-only no-effect and non-authoritative audits", "verifier succeeds"]),
};
const verification_status = Object.values(checks).every(Boolean) ? "passed" : "blocked";
const report = {
  verification_status,
  ...checks,
  readiness_decision: verification_status === "passed" ? "ready" : "blocked",
  passed_conditions_count: verification_status === "passed" ? 16 : Object.values(checks).filter(Boolean).length,
  failed_conditions_count: Object.values(checks).filter((value) => !value).length,
  unresolved_conditions_count: 0,
  mapper_source_sha256: shaFile(paths.mapper), learning_fixture_source_sha256: shaFile(paths.learning),
  context_fixture_source_sha256: shaFile(paths.context), pattern_fixture_source_sha256: shaFile(paths.pattern),
  action_397_runner_sha256: shaFile(paths.runner), action_397_manifest_file_sha256: shaFile(paths.manifest),
  canonical_manifest_sha256: canonicalManifestHash, production_mapper_consumer_files: productionConsumers,
  temporary_output_exists: existsSync(outputPath), action_398_changed_files: action398Files,
  runtime_preview_status: "runtime_preview_waiting_for_operator_inputs",
  no_effect_flags: { expanded_batch_executed: false, new_shadow_case_added: false, authoritative_data_created: false, provider_call_executed: false, news_call_executed: false, supabase_read_executed: false, supabase_write_executed: false, persistence_executed: false, replay_executed: false, runtime_integration_executed: false, feedback_executed: false, scanner_behavior_changed: false, live_ranking_changed: false, recommendations_mutated: false },
  recommended_next_action: verification_status === "passed" ? "separate_static_batch_expansion_approval_gate" : "remediate_failed_action_398_conditions",
};
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
process.exitCode = verification_status === "passed" ? 0 : 1;
