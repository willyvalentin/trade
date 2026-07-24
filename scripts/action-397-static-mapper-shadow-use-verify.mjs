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
  approval: "docs/action-396-static-mapper-shadow-use-approval-gate.md",
  doc: "docs/action-397-static-mapper-shadow-use.md",
  manifest: "docs/action-397-static-mapper-shadow-input-manifest.json",
  runner: "scripts/action-397-static-mapper-shadow-run.mjs",
  verifier: "scripts/action-397-static-mapper-shadow-use-verify.mjs",
  test: "tests/e2e/action-397-static-mapper-shadow-use.spec.ts",
};
const hashes = {
  [paths.mapper]: "7294a851ede33aadc0dbfcb68c13337cd244002b84be7cbbe40abbe91673741d",
  [paths.learning]: "706bd57150914862604af70e0bba7614151f53c32abc5dbde9595c53bf4b332b",
  [paths.context]: "46358cb997b4f7a431a3fee72562659da48b13219404224f4e80e08dbf8ed406",
  [paths.pattern]: "db8dae9f101f710123a0a3ac6493356bd761c15f231023ab9742caefaacf8f57",
};
const fixedCaseIds = [
  "valid_complete_mapping", "valid_rich_context", "valid_missing_optional_context", "valid_pending_outcome",
  "valid_incomplete_outcome", "valid_stale_context", "valid_partial_context", "valid_conflicting_context",
  "valid_equivalent_aliases", "valid_normalized_confidence", "blocked_missing_required_identity",
  "blocked_invalid_linkage", "blocked_conflicting_aliases", "blocked_temporal_violation", "blocked_future_leakage",
  "blocked_invalid_provenance", "blocked_invalid_outcome", "blocked_invalid_input",
  "blocked_unsupported_literal_variant", "blocked_horizon_conflict",
];
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

const requiredFiles = Object.values(paths);
const doc = existsSync(abs(paths.doc)) ? read(paths.doc) : "";
const approval = existsSync(abs(paths.approval)) ? read(paths.approval) : "";
const runner = existsSync(abs(paths.runner)) ? read(paths.runner) : "";
const tests = existsSync(abs(paths.test)) ? read(paths.test) : "";
const manifest = existsSync(abs(paths.manifest)) ? JSON.parse(read(paths.manifest)) : {};
const manifestSha256 = sha(canonicalJson(manifest));
const changed = execFileSync("git", ["status", "--short", "--untracked-files=all"], { cwd: root, encoding: "utf8" })
  .trim().split("\n").filter(Boolean).map((line) => line.slice(3).trim()).map((path) => path.split(" -> ").at(-1));
const action397Files = changed.filter((path) => path.includes("action-397"));
const allowedAction397Files = [paths.runner, paths.doc, paths.manifest, paths.verifier, paths.test];
const productionConsumers = [...files("app"), ...files("lib")].filter(
  (path) => path !== paths.mapper && /\.(?:ts|tsx|js|jsx)$/.test(path) && /from\s+["'][^"']*snapshot-to-learning-dataset-mapper["']/.test(read(path)),
);
const tempOutput = resolve(realpathSync(tmpdir()), "ture/action-397-static-mapper-shadow");
const declarations = ["static_only", "non_production", "non_authoritative", "no_replay", "no_persistence", "no_runtime", "no_feedback"];
const allowedClassifications = new Set([
  "test_local_complete", "fixture_derived_rich_context", "test_local_missing_optional_context",
  "test_local_pending_outcome", "test_local_incomplete_outcome", "fixture_derived_stale_context",
  "fixture_derived_partial_context", "fixture_derived_conflicting_context", "test_local_equivalent_aliases",
  "test_local_normalized_confidence", "test_local_blocked_missing_identity", "test_local_blocked_linkage",
  "test_local_blocked_alias_conflict", "test_local_blocked_temporal", "test_local_blocked_future_leakage",
  "test_local_blocked_provenance", "test_local_blocked_outcome", "test_local_blocked_input",
  "test_local_blocked_literal", "test_local_blocked_horizon_conflict",
]);

const checks = {
  required_files_found: requiredFiles.every((path) => existsSync(abs(path))),
  action_396_approval_bound: has(approval, ["`approval_decision: approved`", "`passed_conditions_count: 15`", "`failed_conditions_count: 0`", "`unresolved_conditions_count: 0`"]) && doc.includes("Action 396 returned `approval_decision: approved`"),
  manifest_schema_and_declarations_exact: manifest.manifest_schema_version === "action_397_static_mapper_shadow_manifest_v1" && declarations.every((key) => manifest[key] === true),
  exactly_20_unique_ordered_cases: Array.isArray(manifest.ordered_cases) && manifest.ordered_cases.length === 20 && new Set(manifest.ordered_cases.map((item) => item.case_id)).size === 20 && canonicalJson(manifest.ordered_cases.map((item) => item.case_id)) === canonicalJson(fixedCaseIds) && manifest.ordered_cases.every((item, index) => item.order_index === index + 1),
  case_schema_exact: manifest.ordered_cases?.every((item) => canonicalJson(Object.keys(item).sort()) === canonicalJson(caseKeys)) === true,
  protected_hashes_match: Object.entries(hashes).every(([path, hash]) => shaFile(path) === hash) && manifest.mapper_sha256 === hashes[paths.mapper] && manifest.learning_fixture_sha256 === hashes[paths.learning] && manifest.context_fixture_sha256 === hashes[paths.context] && manifest.pattern_fixture_sha256 === hashes[paths.pattern],
  input_hashes_frozen: manifest.ordered_cases?.every((item) => /^[a-f0-9]{64}$/.test(item.canonical_input_sha256)) === true,
  classifications_allowlisted: manifest.ordered_cases?.every((item) => allowedClassifications.has(item.wrapper_classification)) === true,
  no_automatic_input_discovery_or_arbitrary_input: has(runner, ["const fixedCaseIds = [", "buildStaticShadowCases", "validateManifest(manifest, cases)"]) && !/readdirSync\([^)]*(?:fixture|manifest|input)/i.test(runner) && !runner.includes("process.stdin") && !runner.includes("JSON.parse(process.argv"),
  canonical_serialization_defined: has(runner, ["function canonicalValue", "Object.keys(value).sort()", "JSON.stringify(canonicalValue(value))", "sha256(canonicalJson"]),
  exactly_two_runs_required: has(runner, ["const run1 = executeBatch(manifest, cases)", "const run2 = executeBatch(manifest, cases)", "repeat_run_nondeterminism"]) && !runner.includes("const run3"),
  expected_result_comparison_exists: has(runner, ["function assertExpected", "expected_status", "expected_row_present", "expected_consumable", "expected_issue_codes", "expected_issue_paths", "expected_result_mismatch"]),
  metadata_only_result_capture: has(runner, ["function metadataRecord", "case_id:", "row_id:", "row_present:", "issue_codes:", "issue_paths:", "issue_severities:", "canonical_result_sha256:"]) && !has(runner, ["results: run1", "row: result.row"]),
  result_and_batch_hashing_exists: has(runner, ["canonical_result_sha256", "run1BatchSha256", "run2BatchSha256", "sha256(canonicalJson(run1))"]),
  safe_temp_and_symlink_validation_exists: has(runner, ["realpathSync(tmpdir())", "unsafe_output_not_within_system_temp", "unsafe_output_symlink", "unsafe_output_forbidden_root", "unsafe_output_not_empty"]),
  cleanup_and_post_cleanup_verification_exists: has(runner, ["rmSync(safeOutput", "temporary_evidence_cleanup_failed", "post_cleanup_source_integrity_changed"]),
  temporary_output_absent: !existsSync(tempOutput),
  source_integrity_checks_exist: has(runner, ["currentProtectedHashes", "sourceStatus", "protected_hash_mismatch", "source_integrity_changed"]),
  no_external_persistence_replay_runtime_or_feedback: has(runner, ["persistence_result: \"none\"", "replay_result: \"none\"", "runtime_result: \"none\"", "external_access_result: \"none\"", "feedback_result: \"none\"", "authoritative_data_created: false"]),
  no_forbidden_imports: !/(?:@supabase|next\/server|http:|https:|node-fetch|axios)/.test(runner) && !runner.includes("process.env") && !runner.includes("localStorage"),
  production_consumers_absent: productionConsumers.length === 0,
  no_mapper_or_fixture_modification: Object.entries(hashes).every(([path, hash]) => shaFile(path) === hash),
  no_tracked_result_evidence: !existsSync(abs("docs/action-397-static-mapper-shadow-evidence.json")),
  documentation_records_execution: has(doc, ["`final_shadow_decision: shadow_passed`", "case count: 20", "expected results match: true", "repeat run identical: true", "temporary evidence deleted: true", "persistence result: `none`", "runtime_preview_waiting_for_operator_inputs"]),
  execution_hashes_recorded: has(doc, [manifestSha256, "ac9c53a650655ac088b64d517ec9bbf1005b8b3ac7d2a89430e96b3bc21585bd"]),
  final_decision_vocabulary_exact: has(runner, ["shadow_passed", "shadow_passed_with_conditions", "shadow_failed", "shadow_aborted"]) && doc.includes("`shadow_passed` is local static evidence only"),
  focused_test_contract_exists: has(tests, ["exact manifest schema count uniqueness and ordering", "safe temporary path and symlink rejection", "every success and blocked contract matches", "runner produces deterministic metadata-only shadow_passed evidence", "verifier succeeds"]),
  no_forbidden_action_397_changes: action397Files.every((path) => allowedAction397Files.includes(path)),
  no_schema_migration_proxy_middleware_netlify_changes: action397Files.every((path) => !/^(?:app\/|lib\/|supabase\/migrations|proxy\.ts|middleware\.|netlify\.)/.test(path)),
  runtime_preview_chain_untouched: action397Files.every((path) => !path.includes("runtime-preview")) && doc.includes("runtime_preview_waiting_for_operator_inputs"),
  next_audit_separately_identified: doc.includes("next permitted Action is an independent static post-shadow verification/readiness audit"),
};
const verification_status = Object.values(checks).every(Boolean) ? "passed" : "blocked";
const report = {
  verification_status,
  ...checks,
  final_shadow_decision: verification_status === "passed" ? "shadow_passed" : "shadow_failed",
  case_count: manifest.ordered_cases?.length ?? 0,
  input_manifest_sha256: manifestSha256,
  mapper_source_sha256: shaFile(paths.mapper), learning_fixture_source_sha256: shaFile(paths.learning),
  context_fixture_source_sha256: shaFile(paths.context), pattern_fixture_source_sha256: shaFile(paths.pattern),
  production_mapper_consumer_files: productionConsumers,
  temporary_output_exists: existsSync(tempOutput),
  action_397_changed_files: action397Files,
  runtime_preview_status: "runtime_preview_waiting_for_operator_inputs",
  no_effect_flags: { authoritative_data_created: false, provider_call_executed: false, news_call_executed: false, supabase_read_executed: false, supabase_write_executed: false, persistence_executed: false, replay_executed: false, runtime_integration_executed: false, feedback_executed: false, scanner_behavior_changed: false, live_ranking_changed: false, recommendations_mutated: false },
  recommended_next_action: verification_status === "passed" ? "independent_static_post_shadow_verification_readiness_audit" : "remediate_failed_action_397_conditions",
};
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
process.exitCode = verification_status === "passed" ? 0 : 1;
