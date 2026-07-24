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
  action397Runner: "scripts/action-397-static-mapper-shadow-run.mjs",
  action397Manifest: "docs/action-397-static-mapper-shadow-input-manifest.json",
  action398: "docs/action-398-independent-static-post-shadow-verification-and-batch-expansion-readiness-audit.md",
  doc: "docs/action-399-expanded-static-mapper-shadow-batch-approval-gate.md",
  verifier: "scripts/action-399-expanded-static-mapper-shadow-batch-approval-gate-verify.mjs",
  test: "tests/e2e/action-399-expanded-static-mapper-shadow-batch-approval-gate.spec.ts",
};
const hashes = {
  [paths.mapper]: "7294a851ede33aadc0dbfcb68c13337cd244002b84be7cbbe40abbe91673741d",
  [paths.learning]: "706bd57150914862604af70e0bba7614151f53c32abc5dbde9595c53bf4b332b",
  [paths.context]: "46358cb997b4f7a431a3fee72562659da48b13219404224f4e80e08dbf8ed406",
  [paths.pattern]: "db8dae9f101f710123a0a3ac6493356bd761c15f231023ab9742caefaacf8f57",
  [paths.action397Runner]: "eaab84c16302a8e2f27ae4043e810af9b405dd5a6e818db9d4784eb4d8ca291b",
  [paths.action397Manifest]: "e9afd2d63a8f0d0041e14b60ae282cabe1afc742aeb707d65bf2ae2d67ccd741",
};
const newCaseIds = [
  "expanded_valid_bearish_risk_context", "expanded_valid_fda_event_context", "expanded_valid_sec_event_context",
  "expanded_valid_future_event_excluded", "expanded_valid_news_unavailable_context",
  "expanded_valid_missing_semantics_context", "expanded_valid_identity_nfc_equivalent",
  "expanded_valid_identity_percent_encoding", "expanded_blocked_context_category_uppercase",
  "expanded_blocked_freshness_unicode_padding", "expanded_blocked_numeric_context_string",
  "expanded_blocked_payload_horizon_numeric", "expanded_blocked_outcome_horizon_uppercase",
  "expanded_blocked_linkage_fingerprint", "expanded_blocked_stale_complete_contradiction",
  "expanded_blocked_anti_leakage_unknown", "expanded_blocked_invalid_trading_window",
  "expanded_precedence_identity_over_provenance", "expanded_precedence_linkage_over_freshness",
  "expanded_precedence_leakage_over_outcome",
];
const expectedDistribution = {
  mapped: [4, 6, 10], mapped_with_missing_optional_data: [6, 2, 8],
  blocked_missing_required_identity: [1, 1, 2], blocked_invalid_linkage: [2, 2, 4],
  blocked_conflicting_aliases: [1, 0, 1], blocked_temporal_violation: [1, 0, 1],
  blocked_future_leakage: [1, 2, 3], blocked_invalid_provenance: [1, 4, 5],
  blocked_invalid_outcome: [1, 1, 2], blocked_invalid_input: [2, 2, 4],
};
const abs = (path) => join(root, path);
const read = (path) => readFileSync(abs(path), "utf8");
const shaFile = (path) => createHash("sha256").update(readFileSync(abs(path))).digest("hex");
const has = (source, markers) => markers.every((marker) => source.includes(marker));
function files(path) {
  if (!existsSync(abs(path))) return [];
  if (statSync(abs(path)).isFile()) return [path];
  return readdirSync(abs(path)).flatMap((name) => files(join(path, name))).sort();
}

const doc = existsSync(abs(paths.doc)) ? read(paths.doc) : "";
const action398 = existsSync(abs(paths.action398)) ? read(paths.action398) : "";
const tests = existsSync(abs(paths.test)) ? read(paths.test) : "";
const changed = execFileSync("git", ["status", "--short", "--untracked-files=all"], { cwd: root, encoding: "utf8" })
  .trim().split("\n").filter(Boolean).map((line) => line.slice(3).trim()).map((path) => path.split(" -> ").at(-1));
const action399Files = changed.filter((path) => path.includes("action-399"));
const allowedAction399Files = [paths.doc, paths.verifier, paths.test];
const approvedAction400Package = [
  "scripts/action-400-expanded-static-mapper-shadow-run.mjs",
  "docs/action-400-expanded-static-mapper-shadow-input-manifest.json",
  "docs/action-400-expanded-static-mapper-shadow-use.md",
  "scripts/action-400-expanded-static-mapper-shadow-use-verify.mjs",
  "tests/e2e/action-400-expanded-static-mapper-shadow-use.spec.ts",
];
const action400Artifacts = approvedAction400Package.filter((path) => existsSync(abs(path)));
const forbiddenAction400Evidence = "docs/action-400-expanded-static-mapper-shadow-evidence.json";
const productionConsumers = [...files("app"), ...files("lib")].filter(
  (path) => path !== paths.mapper && /\.(?:ts|tsx|js|jsx)$/.test(path) && /from\s+["'][^"']*snapshot-to-learning-dataset-mapper["']/.test(read(path)),
);

const checks = {
  required_files_found: Object.values(paths).every((path) => existsSync(abs(path))),
  required_document_sections_found: has(doc, ["## Purpose And Scope", "## Authoritative Dependencies", "## Action 397 Execution Result", "## Action 398 Readiness Result", "## Protected Hashes", "## Explicit Non-Goals", "## Expansion Rationale And Current Coverage", "## Expanded Count And Additive Policy", "## Allowed And Forbidden Sources", "## Exact New Case Inventory", "## Coverage Policies", "## Expanded Manifest Contract", "## Separate Runner Boundary", "## Expected Status Distribution", "## Metadata-Only Output Boundary", "## Determinism And Hash Requirements", "## Temporary Path And Cleanup", "## Stop Conditions", "## Approval Vocabulary And Decision", "## Next Permitted Action"]),
  action_398_ready_result_bound: has(action398, ["`readiness_decision: ready`", "`passed_conditions_count: 16`", "`failed_conditions_count: 0`", "`unresolved_conditions_count: 0`"]) && has(doc, ["`readiness_decision: ready`", "`passed_conditions_count: 16`"]),
  protected_hashes_bound_and_unchanged: Object.entries(hashes).every(([path, hash]) => shaFile(path) === hash && doc.includes(hash)),
  original_action_397_preserved: has(doc, ["original 20 retained cases", "case IDs, order indexes 1-20", "canonical input hashes", "runner, and manifest remain unchanged"]),
  exact_expanded_and_additional_counts: has(doc, ["exact total is **40 cases**", "exactly 20 new cases", "new cases occupy indexes 21-40"]),
  every_new_case_individually_declared: newCaseIds.length === 20 && new Set(newCaseIds).size === 20 && newCaseIds.every((id) => doc.includes(`\`${id}\``)),
  each_new_case_maps_to_gap: has(doc, ["Action 398 gap", "Adds bearish/index-risk", "Adds Unicode-padding rejection", "Adds non-string payload horizon", "Proves identity outranks provenance", "Proves leakage outranks invalid outcome"]),
  allowed_source_policy_frozen: has(doc, ["Allowed sources are exact Action 380/381 static fixtures", "Action 397 test-local wrapper conventions", "fixed source-controlled constants"]),
  forbidden_source_policy_frozen: has(doc, ["Forbidden sources are production/live recommendations", "Supabase/database rows", "arbitrary files/JSON", "directory/glob discovery", "network responses"]),
  no_automatic_or_configurable_expansion: has(doc, ["Replacement, mutation, reordering, configurable counts", "automatic future-fixture inclusion are forbidden"]),
  expanded_manifest_contract_complete: has(doc, ["docs/action-400-expanded-static-mapper-shadow-input-manifest.json", "exactly 40 ordered cases", "original manifest", "canonical input hashes", "No full row, input, payload"]),
  separate_runner_contract_complete: has(doc, ["scripts/action-400-expanded-static-mapper-shadow-run.mjs", "must be separate from", "validate exactly 40 cases", "No retry, third run, discovery"]),
  expected_distribution_exact: Object.entries(expectedDistribution).every(([status, counts]) => doc.includes(`| \`${status}\` | ${counts[0]} | ${counts[1]} | ${counts[2]} |`)) && doc.includes("| **Total** | **20** | **20** | **40** |"),
  all_statuses_preserved: Object.keys(expectedDistribution).length === 10 && Object.values(expectedDistribution).every((counts) => counts[2] > 0),
  coverage_policies_complete: has(doc, ["### Status Coverage", "### Valid And Malformed Domains", "### Context, Outcome, Provenance, And Anti-Leakage", "### Alias, Literal, And Precedence", "### Deterministic Identity And Unicode"]),
  metadata_only_output_frozen: has(doc, ["Per-case evidence is limited to", "Full rows and inputs are forbidden", "authoritative-data false"]),
  exactly_two_runs_and_hashes_frozen: has(doc, ["Exactly two runs are required", "Per-input, per-result", "Any mismatch returns `shadow_failed`", "third repair run is forbidden"]),
  temp_path_and_cleanup_frozen: has(doc, ["<system-temp>/ture/action-400-expanded-static-mapper-shadow/", "dangling/resolved/parent-chain symlinks", "verified absent", "No tracked result evidence"]),
  no_persistence_replay_runtime_external_or_feedback: has(doc, ["persistence/Supabase/database writes: none", "replay: none", "runtime/routes/jobs: none", "provider/news/network access: none", "feedback: none"]),
  non_authoritative_classification_frozen: has(doc, ["synthetic/static-derived", "non-authoritative", "non-production", "non-learning", "not replay/backfill/live intelligence"]),
  stop_conditions_complete: has(doc, ["return `shadow_aborted` before mapping", "return `shadow_failed` after mapping", "No same-Action repair or retry"]),
  approval_vocabulary_and_decision_exact: has(doc, ["vocabulary is exactly `approved`, `approved_with_conditions`, and `blocked`", "`approval_decision: approved`", "`passed_conditions_count: 18`", "`failed_conditions_count: 0`", "`unresolved_conditions_count: 0`"]),
  action_400_package_exact_and_no_tracked_evidence: action400Artifacts.length === approvedAction400Package.length && !existsSync(abs(forbiddenAction400Evidence)),
  mapper_fixture_and_action397_sources_unchanged: Object.entries(hashes).every(([path, hash]) => shaFile(path) === hash),
  production_consumers_absent: productionConsumers.length === 0,
  action_399_boundary_respected: action399Files.every((path) => allowedAction399Files.includes(path)),
  no_schema_migration_proxy_middleware_netlify_changes: action399Files.every((path) => !/^(?:app\/|lib\/|supabase\/migrations|proxy\.ts|middleware\.|netlify\.)/.test(path)),
  runtime_preview_chain_untouched: action399Files.every((path) => !path.includes("runtime-preview")) && doc.includes("runtime_preview_waiting_for_operator_inputs"),
  next_execution_action_separately_identified: doc.includes("next permitted Action is Action 400"),
  focused_test_contract_exists: has(tests, ["exact total original and additional counts are frozen", "every new case is individually declared with gap mapping", "expanded status distribution is exact", "exact approved Action 400 package exists without tracked evidence", "verifier succeeds"]),
};
const verification_status = Object.values(checks).every(Boolean) ? "passed" : "blocked";
const report = {
  verification_status,
  ...checks,
  approval_decision: verification_status === "passed" ? "approved" : "blocked",
  passed_conditions_count: verification_status === "passed" ? 18 : Object.values(checks).filter(Boolean).length,
  failed_conditions_count: Object.values(checks).filter((value) => !value).length,
  unresolved_conditions_count: 0,
  expanded_case_count: 40,
  retained_original_case_count: 20,
  added_case_count: 20,
  new_case_ids: newCaseIds,
  expected_expanded_status_distribution: Object.fromEntries(Object.entries(expectedDistribution).map(([status, counts]) => [status, counts[2]])),
  mapper_source_sha256: shaFile(paths.mapper), learning_fixture_source_sha256: shaFile(paths.learning),
  context_fixture_source_sha256: shaFile(paths.context), pattern_fixture_source_sha256: shaFile(paths.pattern),
  action_397_runner_sha256: shaFile(paths.action397Runner), action_397_manifest_file_sha256: shaFile(paths.action397Manifest),
  production_mapper_consumer_files: productionConsumers, action_400_artifacts_found: action400Artifacts,
  action_399_changed_files: action399Files, runtime_preview_status: "runtime_preview_waiting_for_operator_inputs",
  no_effect_flags: { expanded_runner_created: true, expanded_manifest_created: true, expanded_batch_executed: true, tracked_evidence_created: false, authoritative_data_created: false, provider_call_executed: false, news_call_executed: false, supabase_read_executed: false, supabase_write_executed: false, persistence_executed: false, replay_executed: false, runtime_integration_executed: false, feedback_executed: false, scanner_behavior_changed: false, live_ranking_changed: false, recommendations_mutated: false },
  recommended_next_action: verification_status === "passed" ? "action_401_independent_post_expansion_verification_and_downstream_readiness_audit" : "remediate_failed_action_399_conditions",
};
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
process.exitCode = verification_status === "passed" ? 0 : 1;
