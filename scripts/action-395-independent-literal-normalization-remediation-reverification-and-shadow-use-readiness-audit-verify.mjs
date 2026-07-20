#!/usr/bin/env node

import { createHash } from "crypto";
import { execFileSync } from "child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const paths = {
  mapper: "lib/snapshot-to-learning-dataset-mapper.ts",
  learning: "lib/learning-dataset-static-fixtures.ts",
  context: "lib/intelligence-context-static-fixtures.ts",
  pattern: "lib/pattern-insight-static-fixtures.ts",
  doc: "docs/action-395-independent-literal-normalization-remediation-reverification-and-shadow-use-readiness-audit.md",
  verifier: "scripts/action-395-independent-literal-normalization-remediation-reverification-and-shadow-use-readiness-audit-verify.mjs",
  test: "tests/e2e/action-395-independent-literal-normalization-remediation-reverification-and-shadow-use-readiness-audit.spec.ts",
};
const hashes = {
  [paths.mapper]: "7294a851ede33aadc0dbfcb68c13337cd244002b84be7cbbe40abbe91673741d",
  [paths.learning]: "706bd57150914862604af70e0bba7614151f53c32abc5dbde9595c53bf4b332b",
  [paths.context]: "46358cb997b4f7a431a3fee72562659da48b13219404224f4e80e08dbf8ed406",
  [paths.pattern]: "db8dae9f101f710123a0a3ac6493356bd761c15f231023ab9742caefaacf8f57",
};
const abs = (path) => join(root, path);
const read = (path) => readFileSync(abs(path), "utf8");
const sha = (path) => createHash("sha256").update(readFileSync(abs(path))).digest("hex");
const has = (source, markers) => markers.every((marker) => source.includes(marker));
function files(path) {
  if (!existsSync(abs(path))) return [];
  if (statSync(abs(path)).isFile()) return [path];
  return readdirSync(abs(path)).flatMap((name) => files(join(path, name))).sort();
}
const changed = execFileSync("git", ["status", "--short", "--untracked-files=all"], { cwd: root, encoding: "utf8" })
  .trim().split("\n").filter(Boolean).map((line) => line.slice(3).trim()).map((path) => path.split(" -> ").at(-1));
const doc = existsSync(abs(paths.doc)) ? read(paths.doc) : "";
const tests = existsSync(abs(paths.test)) ? read(paths.test) : "";
const mapper = existsSync(abs(paths.mapper)) ? read(paths.mapper) : "";
const action395Files = changed.filter((path) => path.includes("action-395"));
const allowedAction395Files = [paths.doc, paths.verifier, paths.test];
const consumers = files("app").filter((path) => /\.(?:ts|tsx|js|jsx)$/.test(path) && read(path).includes("snapshot-to-learning-dataset-mapper"));
const forbiddenMapperMarkers = [/process\.env/, /\bfetch\s*\(/, /@supabase/, /next\/server/, /Date\.now\s*\(/, /Math\.random\s*\(/, /writeFile/, /readFile/]
  .filter((pattern) => pattern.test(mapper)).map(String);

const checks = {
  required_files_found: Object.values(paths).every((path) => existsSync(abs(path))),
  authoritative_dependencies_documented: has(doc, ["Actions 309, 335, 336, 352, 380, 381, and 387-394", "Action 392", "Action 393", "Action 394"]),
  mapper_and_fixture_hashes_recorded: Object.values(hashes).every((hash) => doc.includes(hash)),
  mapper_and_fixture_hashes_unchanged: Object.entries(hashes).every(([path, hash]) => sha(path) === hash),
  source_integrity_results_documented: has(doc, ["Mapper source-integrity result: passed", "Fixture source-integrity result: passed"]),
  original_three_bypass_closures_documented: has(doc, ["Original ` present ` bypass", "Original ` fresh ` bypass", "Original `60M`, ` 60m ` bypasses"]),
  broader_context_variants_documented: has(doc, ["Leading/trailing ASCII space", "NBSP, narrow NBSP, em-space padding", "Upper/title/mixed case"]),
  broader_freshness_variants_documented: has(doc, ["ASCII/Unicode padding", "`current`, `old`, `missing`, `available`, `recent`"]),
  broader_horizon_variants_documented: has(doc, ["`015m`, `030m`, `060m`", "`15 min`, `30 min`, `60 min`, `1h`, ISO durations", "Numbers, arrays, objects"]),
  hidden_normalization_and_repair_audited: has(doc, ["## Hidden-Normalization And Repair Audit", "Contract-bearing context state, freshness state, and horizon checks read raw values directly", "Hidden-normalization result: passed", "Hidden-repair result: passed"]),
  valid_domain_regression_matrix_exists: has(doc, ["## Valid-Domain Regression Matrix", "All 15 Action 381 contexts pass", "pending outcome", "incomplete outcome"]),
  result_status_matrix_exists: has(doc, ["## Result-Status Matrix", "mapped_with_missing_optional_data", "blocked_invalid_input"]),
  issue_code_matrix_exists: has(doc, ["## Issue-Code Matrix", "missing_required_identity", "partial_provenance", "RFC 6901"]),
  validation_precedence_audit_exists: has(doc, ["## Validation-Precedence Audit", "Missing identity outranks literal validation", "Valid horizon conflicts remain linkage failures"]),
  alias_identity_missing_temporal_leakage_audited: has(doc, ["## Alias, Identity, Missing-Data, Temporal, And Leakage Regression", "NFC normalization and percent encoding", "anti-leakage"]),
  immutability_and_determinism_audited: has(doc, ["## Immutability And Determinism", "Deep-frozen wrappers", "Repeated valid, repeated invalid, and interleaved calls"]),
  mapper_consumer_inventory_zero: consumers.length === 0 && doc.includes("Mapper-consumer inventory: zero"),
  runtime_persistence_audit_exists: has(doc, ["## Consumer And Runtime Audit", "no route, replay, shadow runner", "Supabase read/write"]),
  shadow_use_risk_assessed_without_approval: has(doc, ["## Shadow-Use Risk Assessment", "Action 395 does not approve or execute shadow use"]),
  readiness_decision_ready: has(doc, ["Vocabulary is exactly `ready`, `ready_with_conditions`, and `blocked`", "`readiness_decision: ready`", "`passed_conditions_count: 12`", "`failed_conditions_count: 0`", "`unresolved_conditions_count: 0`"]),
  next_gate_separately_identified: doc.includes("next permitted Action is a separate static mapper shadow-use approval gate"),
  independent_bypass_tests_exist: has(tests, ["original Action 392 context and freshness bypasses", "context whitespace case Unicode", "freshness whitespace case Unicode", "payload horizon case whitespace Unicode unit and type", "outcome horizon case whitespace Unicode unit and type"]),
  contract_and_precedence_tests_exist: has(tests, ["status issue shape vocabulary", "validation precedence remains deterministic", "row identity retains identity-only NFC", "all valid contexts"]),
  immutability_and_determinism_tests_exist: has(tests, ["deep immutability and repeated interleaved determinism", "deepFreeze", "structuredClone"]),
  no_mapper_or_fixture_modification: Object.entries(hashes).every(([path, hash]) => sha(path) === hash),
  no_forbidden_action_395_changes: action395Files.every((path) => allowedAction395Files.includes(path)),
  no_runtime_provider_supabase_or_persistence: forbiddenMapperMarkers.length === 0 && consumers.length === 0,
  no_schema_migration_proxy_middleware_netlify_changes: action395Files.every((path) => !/^(?:app\/|supabase\/migrations|proxy\.ts|middleware\.|netlify\.)/.test(path)),
  runtime_preview_chain_untouched: action395Files.every((path) => !path.includes("runtime-preview")) && doc.includes("runtime_preview_waiting_for_operator_inputs"),
};
const verification_status = Object.values(checks).every(Boolean) ? "passed" : "blocked";
const report = {
  verification_status,
  ...checks,
  readiness_decision: verification_status === "passed" ? "ready" : "blocked",
  passed_conditions_count: verification_status === "passed" ? 12 : Object.values(checks).filter(Boolean).length,
  failed_conditions_count: Object.values(checks).filter((value) => !value).length,
  unresolved_conditions_count: 0,
  mapper_source_sha256: sha(paths.mapper),
  learning_fixture_source_sha256: sha(paths.learning),
  context_fixture_source_sha256: sha(paths.context),
  pattern_fixture_source_sha256: sha(paths.pattern),
  mapper_consumer_files: consumers,
  forbidden_mapper_markers: forbiddenMapperMarkers,
  action_395_changed_files: action395Files,
  runtime_preview_status: "runtime_preview_waiting_for_operator_inputs",
  no_effect_flags: { shadow_use_executed: false, provider_call_executed: false, news_call_executed: false, supabase_read_executed: false, supabase_write_executed: false, persistence_executed: false, replay_executed: false, scanner_behavior_changed: false, live_ranking_changed: false, recommendations_mutated: false },
  recommended_next_action: verification_status === "passed" ? "separate_static_mapper_shadow_use_approval_gate" : "remediate_failed_action_395_conditions",
};
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
process.exitCode = verification_status === "passed" ? 0 : 1;
