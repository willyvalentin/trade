#!/usr/bin/env node

import { createHash } from "crypto";
import { execFileSync } from "child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const paths = {
  mapper: "lib/snapshot-to-learning-dataset-mapper.ts",
  doc: "docs/action-394-pure-mapper-literal-normalization-remediation.md",
  verifier: "scripts/action-394-pure-mapper-literal-normalization-remediation-verify.mjs",
  test: "tests/e2e/action-394-pure-mapper-literal-normalization-remediation.spec.ts",
  learning: "lib/learning-dataset-static-fixtures.ts",
  context: "lib/intelligence-context-static-fixtures.ts",
  pattern: "lib/pattern-insight-static-fixtures.ts",
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
const all = (source, markers) => markers.every((marker) => source.includes(marker));
function files(path) {
  if (!existsSync(abs(path))) return [];
  if (statSync(abs(path)).isFile()) return [path];
  return readdirSync(abs(path)).flatMap((name) => files(join(path, name))).sort();
}
const changed = execFileSync("git", ["status", "--short", "--untracked-files=all"], { cwd: root, encoding: "utf8" })
  .trim().split("\n").filter(Boolean).map((line) => line.slice(3).trim()).map((path) => path.split(" -> ").at(-1));
const mapper = existsSync(abs(paths.mapper)) ? read(paths.mapper) : "";
const doc = existsSync(abs(paths.doc)) ? read(paths.doc) : "";
const tests = existsSync(abs(paths.test)) ? read(paths.test) : "";
const consumers = files("app").filter((path) => /\.(?:ts|tsx|js|jsx)$/.test(path) && read(path).includes("snapshot-to-learning-dataset-mapper"));
const action394 = changed.filter((path) => path.includes("action-394") || path === paths.mapper);
const allowed = [paths.mapper, paths.doc, paths.verifier, paths.test];
const forbiddenMarkers = [/process\.env/, /\bfetch\s*\(/, /@supabase/, /next\/server/, /Date\.now\s*\(/, /Math\.random\s*\(/, /writeFile/, /readFile/]
  .filter((pattern) => pattern.test(mapper)).map(String);

const checks = {
  required_files_found: [paths.mapper, paths.doc, paths.verifier, paths.test, paths.learning, paths.context, paths.pattern].every((path) => existsSync(abs(path))),
  action_393_approval_referenced: all(doc, ["Action 393", "`approval_decision: approved`", "17 passed, 0 failed, and 0 unresolved"]),
  mapper_and_fixture_hashes_exact: Object.entries(hashes).every(([path, hash]) => sha(path) === hash),
  exact_context_states_enforced: all(mapper, ["const state = value.state", "supportedContextStates.has(state)", '"present",\n  "explicit_null",\n  "unavailable",\n  "unknown",']) && !mapper.includes("text(value.state)"),
  exact_freshness_states_enforced: all(mapper, ["const state = freshness.state", "supportedFreshnessStates.has(state)", '"fresh",\n  "stale",\n  "unknown",\n  "unavailable",']) && !mapper.includes("text(freshness.state)"),
  exact_horizon_literals_enforced: all(mapper, ["function horizonLiteralIssues", "supportedHorizons.has(payloadHorizon)", "supportedHorizons.has(outcome.horizon)", 'new Set(["15m", "30m", "60m"])']),
  horizon_status_distinction_preserved: all(mapper, ['blocked("blocked_invalid_input", horizonLiterals.payloadIssues)', 'blocked("blocked_invalid_outcome", horizonLiterals.outcomeIssues)', 'blocked("blocked_invalid_linkage", linkages)']),
  no_horizon_semantic_normalization: !/outcome_horizon[^\n]*(?:trim|toLowerCase|toUpperCase)/.test(mapper),
  side_confidence_identity_behavior_preserved: all(mapper, ['normalized === "long" || normalized === "buy"', 'normalized === "short" || normalized === "sell"', "parsed / 100", '.normalize("NFC")', "encodeURIComponent"]),
  status_and_issue_contract_preserved: all(mapper, ["blocked_invalid_input", "blocked_invalid_outcome", "blocked_invalid_linkage", "blocked_invalid_provenance", 'severity: "error" | "warning"', "messageKey", "orderedIssues"]),
  validation_order_preserved: mapper.indexOf("requiredIdentityIssues(snapshot, context, outcome)") < mapper.indexOf("horizonLiteralIssues(snapshot, outcome)") && mapper.indexOf("horizonLiteralIssues(snapshot, outcome)") < mapper.indexOf("linkageIssues(snapshot, context, outcome)") && mapper.indexOf("linkageIssues(snapshot, context, outcome)") < mapper.indexOf("resolveAliases(snapshot)"),
  focused_regressions_present: all(tests, ["all exact valid context states remain accepted", "context whitespace Unicode case empty and synonym variants block exactly", "all exact freshness literals retain authoritative behavior", "freshness whitespace case synonym empty and Unicode variants block exactly", "15m 30m and 60m exact equivalent horizons pass", "invalid payload horizon variants", "invalid outcome horizon variants", "two valid conflicting horizons", "deep-frozen inputs", "outputs deterministic"]),
  all_contexts_and_missing_data_covered: all(tests, ["all 15 Action 381 contexts", "pending outcome", "mapped_with_missing_optional_data"]),
  fixture_modules_unchanged: sha(paths.learning) === hashes[paths.learning] && sha(paths.context) === hashes[paths.context] && sha(paths.pattern) === hashes[paths.pattern],
  mapper_consumers_absent: consumers.length === 0,
  no_runtime_provider_supabase_or_persistence: forbiddenMarkers.length === 0,
  action_393_boundary_respected: action394.every((path) => allowed.includes(path)),
  no_schema_migration_proxy_middleware_netlify_changes: action394.every((path) => !/^(?:app\/|supabase\/migrations|proxy\.ts|middleware\.|netlify\.)/.test(path)),
  runtime_preview_chain_untouched: action394.every((path) => !path.includes("runtime-preview")) && doc.includes("runtime_preview_waiting_for_operator_inputs"),
  next_independent_audit_identified: doc.includes("Action 395"),
};
const verification_status = Object.values(checks).every(Boolean) ? "passed" : "blocked";
const report = {
  verification_status,
  ...checks,
  mapper_source_sha256: sha(paths.mapper),
  learning_fixture_source_sha256: sha(paths.learning),
  context_fixture_source_sha256: sha(paths.context),
  pattern_fixture_source_sha256: sha(paths.pattern),
  mapper_consumer_files: consumers,
  forbidden_mapper_markers: forbiddenMarkers,
  action_394_changed_files: action394,
  runtime_preview_status: "runtime_preview_waiting_for_operator_inputs",
  no_effect_flags: { provider_call_executed: false, supabase_read_executed: false, supabase_write_executed: false, persistence_executed: false, replay_executed: false, scanner_behavior_changed: false, live_ranking_changed: false, recommendations_mutated: false },
  recommended_next_action: "action_395_independent_literal_normalization_remediation_audit",
};
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
process.exitCode = verification_status === "passed" ? 0 : 1;
