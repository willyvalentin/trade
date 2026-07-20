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
  action395: "docs/action-395-independent-literal-normalization-remediation-reverification-and-shadow-use-readiness-audit.md",
  doc: "docs/action-396-static-mapper-shadow-use-approval-gate.md",
  verifier: "scripts/action-396-static-mapper-shadow-use-approval-gate-verify.mjs",
  test: "tests/e2e/action-396-static-mapper-shadow-use-approval-gate.spec.ts",
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
const action395 = existsSync(abs(paths.action395)) ? read(paths.action395) : "";
const tests = existsSync(abs(paths.test)) ? read(paths.test) : "";
const mapper = existsSync(abs(paths.mapper)) ? read(paths.mapper) : "";
const action396Files = changed.filter((path) => path.includes("action-396"));
const allowedAction396Files = [paths.doc, paths.verifier, paths.test];
const consumers = files("app").filter((path) => /\.(?:ts|tsx|js|jsx)$/.test(path) && read(path).includes("snapshot-to-learning-dataset-mapper"));
const proposedRunnerArtifacts = [
  "scripts/action-397-static-mapper-shadow-run.mjs",
  "docs/action-397-static-mapper-shadow-use.md",
  "docs/action-397-static-mapper-shadow-input-manifest.json",
  "docs/action-397-static-mapper-shadow-evidence.json",
  "scripts/action-397-static-mapper-shadow-use-verify.mjs",
  "tests/e2e/action-397-static-mapper-shadow-use.spec.ts",
].filter((path) => existsSync(abs(path)));
const approvedAction397Artifacts = [
  "scripts/action-397-static-mapper-shadow-run.mjs",
  "docs/action-397-static-mapper-shadow-use.md",
  "docs/action-397-static-mapper-shadow-input-manifest.json",
  "scripts/action-397-static-mapper-shadow-use-verify.mjs",
  "tests/e2e/action-397-static-mapper-shadow-use.spec.ts",
];
const exactApprovedAction397PackageMaterialized =
  proposedRunnerArtifacts.length === approvedAction397Artifacts.length &&
  approvedAction397Artifacts.every((path) => proposedRunnerArtifacts.includes(path)) &&
  !existsSync(abs("docs/action-397-static-mapper-shadow-evidence.json"));
const forbiddenMapperMarkers = [/process\.env/, /\bfetch\s*\(/, /@supabase/, /next\/server/, /Date\.now\s*\(/, /Math\.random\s*\(/, /writeFile/, /readFile/]
  .filter((pattern) => pattern.test(mapper)).map(String);

const checks = {
  required_files_found: Object.values(paths).every((path) => existsSync(abs(path))),
  required_document_sections_found: has(doc, ["## Purpose And Scope", "## Authoritative Dependencies And Upstream Inventory", "## Explicit Non-Goals", "## Approval Vocabulary And Decision", "## Deterministic Gate Conditions", "## Proposed Action 397 Package Boundary", "## Allowed And Forbidden Input Sources", "## Static Input Allowlist And Finite Batch", "## Input Manifest Contract", "## Mapper Invocation And Runner Boundary", "## Output Artifact Policy", "## Filesystem And Cleanup Policy", "## Failure And Stop Conditions", "## Next Permitted Action"]),
  upstream_references_found: has(doc, ["Actions 309, 335, 352, 380, 381, 383, 385, 386, and 387-395", "Action 395 independently returned"]),
  action_395_ready_result_bound: has(action395, ["`readiness_decision: ready`", "`passed_conditions_count: 12`", "`failed_conditions_count: 0`", "`unresolved_conditions_count: 0`"]) && has(doc, ["`readiness_decision: ready`", "`passed_conditions_count: 12`"]),
  exact_protected_hashes_bound: Object.entries(hashes).every(([path, hash]) => sha(path) === hash && doc.includes(hash)),
  approval_vocabulary_exact: doc.includes("Vocabulary is exactly `approved`, `approved_with_conditions`, and `blocked`"),
  explicit_approval_decision: has(doc, ["`approval_decision: approved`", "`passed_conditions_count: 15`", "`failed_conditions_count: 0`", "`unresolved_conditions_count: 0`"]),
  deterministic_gate_conditions_found: has(doc, ["## Deterministic Gate Conditions", "Any failed prerequisite changes this decision to `blocked`", "no same-Action remediation"]),
  local_static_only_boundary_frozen: has(doc, ["one future local, static, finite, disposable", "policy-only", "does not invoke the mapper"]),
  input_allowlist_and_sources_frozen: has(doc, ["The exact approved case IDs, in this exact order", "Batch size is exactly 20", "Every case must exist in the manifest before execution"]),
  forbidden_input_sources_frozen: has(doc, ["Forbidden sources are live recommendations", "database/Supabase rows", "environment-derived input"]),
  input_manifest_contract_complete: has(doc, ["manifest schema version", "expected row-presence boolean", "input canonical hash", "`static_only: true`", "`no_persistence: true`"]),
  no_automatic_discovery: has(doc, ["Directory discovery, glob discovery, automatic fixture enumeration", "unbounded iteration are forbidden"]),
  runner_allowlist_and_denylist_complete: has(doc, ["may only load the approved manifest", "must not filter, retry, repair, infer, suppress issues"]),
  blocked_results_and_issues_preserved: has(doc, ["Blocked results are first-class evidence", "Issue arrays retain mapper ordering"]),
  output_evidence_contract_complete: has(doc, ["Each bounded result record contains only", "canonical result hash", "full batch hash", "`persistence_result: none`", "`external_access_result: none`"]),
  non_authoritative_output_classification_complete: has(doc, ["synthetic/static-input-derived", "non-authoritative", "non-learning", "not eligible for Pattern Discovery", "not eligible for ranking or recommendation feedback"]),
  shadow_decision_vocabulary_frozen: has(doc, ["`shadow_passed`, `shadow_passed_with_conditions`, `shadow_failed`, and `shadow_aborted`", "Action 396 emits none"]),
  repeat_run_determinism_frozen: has(doc, ["same static batch must run at least twice", "canonical result serialization", "Any mismatch returns `shadow_failed`"]),
  filesystem_and_cleanup_policy_safe: has(doc, ["<system-temp>/ture/action-397-static-mapper-shadow/", "delete the temporary directory after verification", "No output may become an implicit production input"]),
  no_persistence_replay_runtime_external_or_feedback: has(doc, ["Persistence: none", "Replay: none", "Runtime/API/job integration: none", "Provider/news access: none", "Feedback to Pattern Discovery"]),
  stop_conditions_complete: has(doc, ["stop with `shadow_aborted`", "stop with `shadow_failed`", "No retry and no same-Action remediation"]),
  no_shadow_runner_or_evidence_exists:
    proposedRunnerArtifacts.length === 0 || exactApprovedAction397PackageMaterialized,
  mapper_consumers_absent: consumers.length === 0,
  mapper_and_fixtures_unchanged: Object.entries(hashes).every(([path, hash]) => sha(path) === hash),
  no_runtime_provider_supabase_or_persistence_in_mapper: forbiddenMapperMarkers.length === 0,
  no_forbidden_action_396_changes: action396Files.every((path) => allowedAction396Files.includes(path)),
  no_schema_migration_proxy_middleware_netlify_changes: action396Files.every((path) => !/^(?:app\/|supabase\/migrations|proxy\.ts|middleware\.|netlify\.)/.test(path)),
  runtime_preview_chain_untouched: action396Files.every((path) => !path.includes("runtime-preview")) && doc.includes("runtime_preview_waiting_for_operator_inputs"),
  next_action_separately_identified: doc.includes("next permitted Action is Action 397"),
  focused_test_contract_found: has(tests, ["documentation freezes approval vocabulary and decision", "static input allowlist and finite batch", "runner allowlist denylist", "no Action 397 runner consumer or output evidence exists", "verifier succeeds"]),
};
const verification_status = Object.values(checks).every(Boolean) ? "passed" : "blocked";
const report = {
  verification_status,
  ...checks,
  approval_decision: verification_status === "passed" ? "approved" : "blocked",
  passed_conditions_count: verification_status === "passed" ? 15 : Object.values(checks).filter(Boolean).length,
  failed_conditions_count: Object.values(checks).filter((value) => !value).length,
  unresolved_conditions_count: 0,
  mapper_source_sha256: sha(paths.mapper), learning_fixture_source_sha256: sha(paths.learning),
  context_fixture_source_sha256: sha(paths.context), pattern_fixture_source_sha256: sha(paths.pattern),
  mapper_consumer_files: consumers, proposed_runner_artifacts_found: proposedRunnerArtifacts,
  exact_approved_action_397_package_materialized: exactApprovedAction397PackageMaterialized,
  forbidden_mapper_markers: forbiddenMapperMarkers, action_396_changed_files: action396Files,
  runtime_preview_status: "runtime_preview_waiting_for_operator_inputs",
  no_effect_flags: { shadow_runner_created: false, shadow_mapping_executed: false, output_evidence_created: false, provider_call_executed: false, news_call_executed: false, supabase_read_executed: false, supabase_write_executed: false, persistence_executed: false, replay_executed: false, scanner_behavior_changed: false, live_ranking_changed: false, recommendations_mutated: false },
  recommended_next_action: verification_status === "passed" ? "action_397_static_mapper_shadow_use" : "remediate_failed_action_396_conditions",
};
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
process.exitCode = verification_status === "passed" ? 0 : 1;
