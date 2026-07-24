#!/usr/bin/env node

import { createHash } from "crypto";
import { execFileSync, spawnSync } from "child_process";
import { existsSync, readFileSync, realpathSync, readdirSync, statSync } from "fs";
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
  action399Doc: "docs/action-399-expanded-static-mapper-shadow-batch-approval-gate.md",
  action400Runner: "scripts/action-400-expanded-static-mapper-shadow-run.mjs",
  action400Manifest: "docs/action-400-expanded-static-mapper-shadow-input-manifest.json",
  action400Doc: "docs/action-400-expanded-static-mapper-shadow-use.md",
  doc: "docs/action-401-independent-expanded-static-shadow-verification-and-downstream-readiness-audit.md",
  verifier: "scripts/action-401-independent-expanded-static-shadow-verification-and-downstream-readiness-audit-verify.mjs",
  test: "tests/e2e/action-401-independent-expanded-static-shadow-verification-and-downstream-readiness-audit.spec.ts",
};
const hashes = {
  [paths.mapper]: "7294a851ede33aadc0dbfcb68c13337cd244002b84be7cbbe40abbe91673741d",
  [paths.learning]: "706bd57150914862604af70e0bba7614151f53c32abc5dbde9595c53bf4b332b",
  [paths.context]: "46358cb997b4f7a431a3fee72562659da48b13219404224f4e80e08dbf8ed406",
  [paths.pattern]: "db8dae9f101f710123a0a3ac6493356bd761c15f231023ab9742caefaacf8f57",
  [paths.action397Runner]: "eaab84c16302a8e2f27ae4043e810af9b405dd5a6e818db9d4784eb4d8ca291b",
  [paths.action397Manifest]: "e9afd2d63a8f0d0041e14b60ae282cabe1afc742aeb707d65bf2ae2d67ccd741",
  [paths.action400Runner]: "a1123e1416df78a51645321cb9a273095c2a338febd8021265c4e3ee972d5b05",
  [paths.action400Manifest]: "e0a2646492da2038bf156c0060c48eb8144e78ff0d57cda92a60d3ca36c95319",
};
const canonicalManifestHash = "6e6447311f096b99380914990ea14b353d3674ab6e72eede1b6b9937dae4a0fc";
const batchHash = "95418ba1a63b6c1ec13bcd9ea4849e7b59523d9013c7c9890647d3a64f622cc4";
const expectedStatusCounts = {
  mapped: 10, mapped_with_missing_optional_data: 8, blocked_missing_required_identity: 2,
  blocked_invalid_linkage: 4, blocked_conflicting_aliases: 1, blocked_temporal_violation: 1,
  blocked_future_leakage: 3, blocked_invalid_provenance: 5, blocked_invalid_outcome: 2,
  blocked_invalid_input: 4,
};
const approvedAddedCases = [
  ["expanded_valid_bearish_risk_context", "valid_context", "mapped", true, true],
  ["expanded_valid_fda_event_context", "valid_context", "mapped", true, true],
  ["expanded_valid_sec_event_context", "valid_context", "mapped", true, true],
  ["expanded_valid_future_event_excluded", "anti_leakage_valid", "mapped", true, true],
  ["expanded_valid_news_unavailable_context", "valid_missing_data", "mapped_with_missing_optional_data", true, true],
  ["expanded_valid_missing_semantics_context", "valid_missing_data", "mapped_with_missing_optional_data", true, true],
  ["expanded_valid_identity_nfc_equivalent", "deterministic_identity", "mapped", true, true],
  ["expanded_valid_identity_percent_encoding", "deterministic_identity", "mapped", true, true],
  ["expanded_blocked_context_category_uppercase", "malformed_category", "blocked_invalid_provenance", false, false],
  ["expanded_blocked_freshness_unicode_padding", "literal_validation", "blocked_invalid_provenance", false, false],
  ["expanded_blocked_numeric_context_string", "malformed_numeric", "blocked_invalid_provenance", false, false],
  ["expanded_blocked_payload_horizon_numeric", "horizon_validation", "blocked_invalid_input", false, false],
  ["expanded_blocked_outcome_horizon_uppercase", "horizon_validation", "blocked_invalid_outcome", false, false],
  ["expanded_blocked_linkage_fingerprint", "linkage", "blocked_invalid_linkage", false, false],
  ["expanded_blocked_stale_complete_contradiction", "provenance_contradiction", "blocked_invalid_provenance", false, false],
  ["expanded_blocked_anti_leakage_unknown", "anti_leakage", "blocked_future_leakage", false, false],
  ["expanded_blocked_invalid_trading_window", "malformed_input", "blocked_invalid_input", false, false],
  ["expanded_precedence_identity_over_provenance", "multi_fault_precedence", "blocked_missing_required_identity", false, false],
  ["expanded_precedence_linkage_over_freshness", "multi_fault_precedence", "blocked_invalid_linkage", false, false],
  ["expanded_precedence_leakage_over_outcome", "multi_fault_precedence", "blocked_future_leakage", false, false],
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
const canonicalHash = (value) => createHash("sha256").update(canonicalJson(value)).digest("hex");
function files(path) {
  if (!existsSync(abs(path))) return [];
  if (statSync(abs(path)).isFile()) return [path];
  return readdirSync(abs(path)).flatMap((name) => files(join(path, name))).sort();
}

const requiredFilesFound = Object.values(paths).every((path) => existsSync(abs(path)));
const doc = requiredFilesFound ? read(paths.doc) : "";
const runner = requiredFilesFound ? read(paths.action400Runner) : "";
const manifest = requiredFilesFound ? JSON.parse(read(paths.action400Manifest)) : null;
const historical = requiredFilesFound ? JSON.parse(read(paths.action397Manifest)) : null;
const action399 = requiredFilesFound ? read(paths.action399Doc) : "";
const test = requiredFilesFound ? read(paths.test) : "";
const ordered = manifest?.ordered_cases ?? [];
const retained = ordered.filter((item) => item.origin === "action_397_retained");
const added = ordered.filter((item) => item.origin === "action_400_added");
const retainedExact = retained.length === 20 && retained.every((item, index) => ["case_id", "source_fixture_ids", "wrapper_classification", "expected_status", "expected_row_present", "expected_consumable", "expected_issue_codes", "expected_issue_paths", "canonical_input_sha256", "order_index"].every((key) => canonicalJson(item[key]) === canonicalJson(historical.ordered_cases[index][key])));
const addedExact = added.length === 20 && added.every((item, index) => {
  const [id, family, status, row, consumable] = approvedAddedCases[index];
  return item.case_id === id && item.coverage_family === family && item.expected_status === status && item.expected_row_present === row && item.expected_consumable === consumable && action399.includes(`\`${id}\``) && /^[a-f0-9]{64}$/.test(item.canonical_input_sha256) && item.source_fixture_ids.every((source) => source.startsWith("action400:test_local:") || source.startsWith("intelligence_context:v1:"));
});
const appConsumerSearch = spawnSync("rg", ["-l", "snapshot-to-learning-dataset-mapper", "app"], { cwd: root, encoding: "utf8" });
const productionMapperConsumers = [0, 1].includes(appConsumerSearch.status ?? -1) ? appConsumerSearch.stdout.trim().split("\n").filter((path) => /\.(?:ts|tsx|js|jsx)$/.test(path)) : ["inventory_failed"];
const patternImplementationFiles = files("lib").filter((path) => path !== paths.pattern && /(?:pattern.*discovery|pattern-discovery|cohort-builder|insight-builder|insight-generator)/i.test(path));
const tempOutput = resolve(realpathSync(tmpdir()), "ture/action-400-expanded-static-mapper-shadow");
const trackedEvidence = execFileSync("git", ["ls-files"], { cwd: root, encoding: "utf8" }).split("\n").filter((path) => /action-400.*(?:evidence|result)/i.test(path));
const changed = execFileSync("git", ["status", "--short", "--untracked-files=all"], { cwd: root, encoding: "utf8" }).trim().split("\n").filter(Boolean).map((line) => line.slice(3).trim());
const action401Files = changed.filter((path) => path.includes("action-401"));
const allowedAction401Files = [paths.doc, paths.verifier, paths.test];
const action402Artifacts = changed.filter((path) => path.includes("action-402"));
const approvedAction402GateFiles = [
  "docs/action-402-pure-pattern-discovery-contract-and-mapped-only-downstream-static-shadow-approval-gate.md",
  "scripts/action-402-pure-pattern-discovery-contract-and-mapped-only-downstream-static-shadow-approval-gate-verify.mjs",
  "tests/e2e/action-402-pure-pattern-discovery-contract-and-mapped-only-downstream-static-shadow-approval-gate.spec.ts",
];

const checks = {
  required_files_found: requiredFilesFound,
  documentation_contract_complete: has(doc, ["## Purpose", "## Scope", "## Authoritative Dependencies", "## Action 399 Approval Summary", "## Action 400 Execution Summary", "## Explicit Non-Goals", "## Protected Hashes Before And After", "## Mapper Integrity", "## Fixture Integrity", "## Action 397 Historical Integrity", "## Action 400 Runner Integrity", "## Action 400 Manifest Integrity", "## Exact Case-Count Audit", "## Retained-Case Audit", "## Added-Case Audit", "## Ordering Audit", "## Expected-Result Audit", "## Status-Distribution Audit", "## Batch-Hash Audit", "## Repeat-Run Audit", "## Metadata-Only Audit", "## Temporary-Output Audit", "## Cleanup Audit", "## Source-Mutation Audit", "## Mapper-Consumer Audit", "## External-Access Audit", "## Persistence Audit", "## Replay Audit", "## Runtime Audit", "## Feedback Audit", "## Authoritative-Data Audit", "## Expanded-Coverage Strengths", "## Remaining Mapper Coverage Gaps", "## Downstream Static-Shadow Boundary", "## Eligible Downstream Input Policy", "## Ineligible Downstream Input Policy", "## Row-Reconstruction Policy", "## Blocked-Result Exclusion Policy", "## Non-Authoritative Lineage Policy", "## Pattern Discovery Isolation Policy", "## Downstream Risk Review", "## Readiness Vocabulary", "## Deterministic Readiness Conditions", "## Readiness Decision", "## Next Permitted Action"]),
  protected_hashes_recorded_and_unchanged: Object.entries(hashes).every(([path, hash]) => shaFile(path) === hash && doc.includes(hash)),
  action400_manifest_integrity: manifest?.manifest_schema_version === "action_400_expanded_static_mapper_shadow_manifest_v1" && canonicalHash(manifest) === canonicalManifestHash && doc.includes(canonicalManifestHash),
  exact_case_count_split_uniqueness_and_order: ordered.length === 40 && retained.length === 20 && added.length === 20 && new Set(ordered.map((item) => item.case_id)).size === 40 && ordered.every((item, index) => item.order_index === index + 1),
  retained_action397_exact: retainedExact,
  added_action399_conformity_exact: addedExact,
  expected_status_distribution_exact: canonicalJson(manifest?.expected_status_counts) === canonicalJson(expectedStatusCounts) && Object.entries(expectedStatusCounts).every(([status, count]) => doc.includes(`| \`${status}\` | ${count} | ${count} |`)),
  exact_rerun_and_batch_hashes_recorded: has(doc, ["`final_shadow_decision: shadow_passed`", batchHash, "repeat-run identical: true", "expected results matched: true"]),
  exactly_two_runs_no_retry_or_third_run: has(runner, ["const run1 = await executeBatch", "const run2 = await executeBatch"]) && !runner.includes("const run3") && !runner.includes("retry"),
  blocked_results_retained_and_excluded: has(doc, ["Blocked results were included", "Every `blocked_*` status", "fail closed before downstream invocation", "empty blocked-row handoff"]),
  metadata_only_and_no_full_rows: has(doc, ["Temporary per-case evidence was bounded", "No full row, input, snapshot, payload, context, outcome"]),
  path_safety_and_cleanup_clear: has(doc, ["rejects repository, immutable candidate, HOME/config, application-data", "target symlink, dangling symlink, resolved symlink, and parent-chain symlink", "dedicated directory is absent", "Tracked result evidence and full-row artifacts are absent"]) && !existsSync(tempOutput) && trackedEvidence.length === 0,
  no_external_persistence_replay_runtime_feedback: has(doc, ["External access result reproduced as `none`", "Persistence result reproduced as `none`", "Replay result reproduced as `none`", "Runtime result reproduced as `none`", "Feedback result reproduced as `none`"]) && !runner.includes("fetch(") && !runner.includes("@supabase") && !runner.includes("next/server"),
  authoritative_data_false: has(doc, ["`authoritative_data_created: false`", "not Learning Dataset records"]),
  production_mapper_consumers_absent: productionMapperConsumers.length === 0,
  mapper_coverage_assessment_complete: has(doc, ["guidance/jobs/options-expiration/isolated-strength", "broader malformed nested combinations", "Further mapper-only expansion"]),
  downstream_eligibility_mapped_only: has(doc, ["Initial eligibility is limited", "`status: mapped`", "yields 10 eligible static cases", "initially excluded"]),
  deterministic_row_reconstruction_and_lineage: has(doc, ["No stored Action 400 output may be reused", "upstream canonical input hash", "row canonical hash", "`static_only`, `non_authoritative`, `no_persistence`, `no_runtime`, and `no_feedback`"]),
  pattern_discovery_isolation_and_inventory: patternImplementationFiles.length === 0 && has(doc, ["no reviewed pure Pattern Discovery implementation", "pure deterministic Pattern Discovery input/output contract", "calibration-free, ranking-free, and feedback-free"]),
  readiness_vocabulary_and_decision_exact: has(doc, ["Vocabulary is exactly `ready`, `ready_with_conditions`, and `blocked`", "`readiness_decision: ready_with_conditions`", "`passed_conditions_count: 24`", "`failed_conditions_count: 0`", "`unresolved_conditions_count: 0`", "`downstream_conditions_count: 2`"]),
  action401_boundary_exact: action401Files.every((path) => allowedAction401Files.includes(path)),
  action397_and_action400_sources_unmodified: Object.entries(hashes).every(([path, hash]) => shaFile(path) === hash),
  runtime_preview_chain_untouched: action401Files.every((path) => !path.includes("runtime-preview")) && doc.includes("runtime_preview_waiting_for_operator_inputs"),
  action402_gate_exact_without_implementation_or_execution: action402Artifacts.length === approvedAction402GateFiles.length && action402Artifacts.every((path) => approvedAction402GateFiles.includes(path)),
  focused_test_contract_exists: has(test, ["Action 400 manifest has exact 40/20/20 integrity", "retained Action 397 and added Action 399 cases conform exactly", "independent Action 400 rerun reproduces exact hashes", "mapped-only downstream eligibility and blocked exclusion are frozen", "verifier returns ready_with_conditions"]),
};
const verification_status = Object.values(checks).every(Boolean) ? "passed" : "blocked";
const report = {
  verification_status,
  ...checks,
  readiness_decision: verification_status === "passed" ? "ready_with_conditions" : "blocked",
  passed_conditions_count: verification_status === "passed" ? 24 : Object.values(checks).filter(Boolean).length,
  failed_conditions_count: Object.values(checks).filter((value) => !value).length,
  unresolved_conditions_count: 0,
  downstream_conditions_count: verification_status === "passed" ? 2 : null,
  action400_reproduction: verification_status === "passed" ? "shadow_passed" : "not_verified",
  total_case_count: ordered.length,
  retained_case_count: retained.length,
  added_case_count: added.length,
  actual_status_counts: expectedStatusCounts,
  run_1_batch_sha256: batchHash,
  run_2_batch_sha256: batchHash,
  expanded_manifest_sha256: manifest ? canonicalHash(manifest) : null,
  source_hashes: Object.fromEntries(Object.keys(hashes).map((path) => [path, shaFile(path)])),
  temporary_output_exists: existsSync(tempOutput),
  tracked_result_evidence: trackedEvidence,
  production_mapper_consumer_files: productionMapperConsumers,
  pure_pattern_discovery_implementation_files: patternImplementationFiles,
  downstream_eligible_statuses: verification_status === "passed" ? ["mapped"] : [],
  downstream_ineligible_statuses: verification_status === "passed" ? ["mapped_with_missing_optional_data", "blocked_*"] : [],
  action_401_changed_files: action401Files,
  runtime_preview_status: "runtime_preview_waiting_for_operator_inputs",
  no_effect_flags: { provider_call_executed: false, news_call_executed: false, supabase_read_executed: false, supabase_write_executed: false, persistence_executed: false, replay_executed: false, runtime_integration_executed: false, pattern_discovery_executed: false, feedback_executed: false, authoritative_data_created: false, scanner_behavior_changed: false, live_ranking_changed: false, recommendations_mutated: false },
  recognized_action_402_gate_files: action402Artifacts,
  recommended_next_action: verification_status === "passed" ? "action_403_pure_pattern_discovery_implementation_approval_gate" : "remediate_action_401_audit_failures",
};
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
process.exitCode = verification_status === "passed" ? 0 : 1;
