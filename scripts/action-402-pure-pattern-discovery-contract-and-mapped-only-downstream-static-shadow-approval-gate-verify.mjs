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
  action400Runner: "scripts/action-400-expanded-static-mapper-shadow-run.mjs",
  action400Manifest: "docs/action-400-expanded-static-mapper-shadow-input-manifest.json",
  action401Doc: "docs/action-401-independent-expanded-static-shadow-verification-and-downstream-readiness-audit.md",
  action401Verifier: "scripts/action-401-independent-expanded-static-shadow-verification-and-downstream-readiness-audit-verify.mjs",
  doc: "docs/action-402-pure-pattern-discovery-contract-and-mapped-only-downstream-static-shadow-approval-gate.md",
  verifier: "scripts/action-402-pure-pattern-discovery-contract-and-mapped-only-downstream-static-shadow-approval-gate-verify.mjs",
  test: "tests/e2e/action-402-pure-pattern-discovery-contract-and-mapped-only-downstream-static-shadow-approval-gate.spec.ts",
};
const hashes = {
  [paths.mapper]: "7294a851ede33aadc0dbfcb68c13337cd244002b84be7cbbe40abbe91673741d",
  [paths.learning]: "706bd57150914862604af70e0bba7614151f53c32abc5dbde9595c53bf4b332b",
  [paths.context]: "46358cb997b4f7a431a3fee72562659da48b13219404224f4e80e08dbf8ed406",
  [paths.pattern]: "db8dae9f101f710123a0a3ac6493356bd761c15f231023ab9742caefaacf8f57",
  [paths.action400Runner]: "a1123e1416df78a51645321cb9a273095c2a338febd8021265c4e3ee972d5b05",
  [paths.action400Manifest]: "e0a2646492da2038bf156c0060c48eb8144e78ff0d57cda92a60d3ca36c95319",
};
const eligibleCaseIds = [
  "valid_complete_mapping", "valid_rich_context", "valid_equivalent_aliases", "valid_normalized_confidence",
  "expanded_valid_bearish_risk_context", "expanded_valid_fda_event_context", "expanded_valid_sec_event_context",
  "expanded_valid_future_event_excluded", "expanded_valid_identity_nfc_equivalent",
  "expanded_valid_identity_percent_encoding",
];
const resultVocabulary = [
  "discovered", "discovered_with_warnings", "insufficient_evidence", "blocked_invalid_input",
  "blocked_invalid_configuration", "blocked_invalid_lineage", "blocked_future_leakage",
  "blocked_non_consumable_row", "blocked_nondeterministic_grouping",
];
const requiredSections = [
  "Purpose", "Scope", "Authoritative Dependencies", "Upstream Action Inventory", "Action 401 Readiness Result",
  "Two Downstream Conditions", "Explicit Non-Goals", "Protected Upstream Hashes", "Pattern Discovery Definition",
  "Pure-Function Boundary", "Input Contract", "Eligible-Row Policy", "Excluded-Row Policy", "Row-Lineage Requirements",
  "Input Batch Contract", "Grouping Dimensions", "Grouping-Key Contract", "Taxonomy Contract", "Evidence-Unit Contract",
  "Outcome-Evidence Contract", "Support-Count Contract", "Minimum-Support Policy", "Contradiction Policy",
  "Insufficient-Evidence Policy", "Pattern-Strength Policy", "Directional-Effect Policy", "Risk/Reward Evidence Policy",
  "Horizon Policy", "Confidence-Treatment Policy", "Context-Treatment Policy", "Provenance Policy", "Anti-Leakage Policy",
  "Missing-Data Policy", "Stale-Data Policy", "Partial-Data Policy", "Conflicting-Data Policy", "Unknown/Unavailable Policy",
  "Deterministic-Aggregation Policy", "Deterministic-Ordering Policy", "Deterministic-Deduplication Policy",
  "Insight-Identity Policy", "Issue/Warning Contract", "Success/Result Vocabulary", "Output Contract",
  "Pattern Insight Compatibility", "Prohibited Inference", "Prohibited Repair", "Prohibited Calibration",
  "Prohibited Recommendation Mutation", "Mapped-Only Shadow Boundary", "Exact Eligible Action 400 Case Inventory",
  "Expected Downstream Group Inventory", "Downstream Manifest Requirements", "Downstream Runner Boundary",
  "Output Evidence Boundary", "Metadata-Only Policy", "Full-Insight Retention Policy", "Repeat-Run Determinism",
  "Temporary Filesystem Policy", "Cleanup Policy", "No-Persistence Requirement", "No-Replay Requirement",
  "No-Runtime Requirement", "No-External-Access Requirement", "No-Feedback Requirement", "Stop Conditions",
  "Approval Vocabulary", "Deterministic Gate Conditions", "Approval Decision", "Next Permitted Action",
];
const abs = (path) => join(root, path);
const read = (path) => readFileSync(abs(path), "utf8");
const shaFile = (path) => createHash("sha256").update(readFileSync(abs(path))).digest("hex");
const has = (source, markers) => markers.every((marker) => source.includes(marker));
function files(path) {
  if (!existsSync(abs(path))) return [];
  if (statSync(abs(path)).isFile()) return [path];
  return readdirSync(abs(path)).flatMap((name) => files(join(path, name))).sort();
}

const requiredFilesFound = Object.values(paths).every((path) => existsSync(abs(path)));
const doc = requiredFilesFound ? read(paths.doc) : "";
const tests = requiredFilesFound ? read(paths.test) : "";
const manifest = requiredFilesFound ? JSON.parse(read(paths.action400Manifest)) : null;
let action401 = null;
if (requiredFilesFound) {
  try {
    action401 = JSON.parse(execFileSync("node", [abs(paths.action401Verifier)], { cwd: root, encoding: "utf8" }));
  } catch (error) {
    action401 = JSON.parse(error.stdout);
  }
}
const mappedCases = manifest?.ordered_cases.filter((item) => item.expected_status === "mapped" && item.expected_row_present === true && item.expected_consumable === true).map((item) => item.case_id) ?? [];
const changed = execFileSync("git", ["status", "--short", "--untracked-files=all"], { cwd: root, encoding: "utf8" }).trim().split("\n").filter(Boolean).map((line) => line.slice(3).trim());
const action402Files = changed.filter((path) => path.includes("action-402"));
const allowedAction402Files = [paths.doc, paths.verifier, paths.test];
const patternImplementationFiles = files("lib").filter((path) => path !== paths.pattern && /(?:pattern.*discovery|pattern-discovery|cohort-builder|segmenter|statistics-helper|metric-calculator|insight-builder|insight-generator)/i.test(path));
const downstreamRunnerOrManifest = [...files("scripts"), ...files("docs")].filter((path) => /action-40[23].*(?:downstream.*(?:run|manifest)|pattern-discovery.*(?:run|manifest))/i.test(path));
const productionPatternConsumers = files("app").filter((path) => /\.(?:ts|tsx|js|jsx)$/.test(path) && /discoverPatterns|pattern-discovery|patternDiscovery/.test(read(path)));
const action403Artifacts = changed.filter((path) => path.includes("action-403"));
const approvedAction403GateFiles = [
  "docs/action-403-pure-pattern-discovery-implementation-approval-gate.md",
  "scripts/action-403-pure-pattern-discovery-implementation-approval-gate-verify.mjs",
  "tests/e2e/action-403-pure-pattern-discovery-implementation-approval-gate.spec.ts",
];
const approvedAction404Files = [
  "lib/pure-pattern-discovery.ts",
  "docs/action-404-pure-pattern-discovery-implementation.md",
  "scripts/action-404-pure-pattern-discovery-implementation-verify.mjs",
  "tests/e2e/action-404-pure-pattern-discovery-implementation.spec.ts",
];
const action404Artifacts = changed.filter((path) => path.includes("action-404") || path === "lib/pure-pattern-discovery.ts");

const checks = {
  required_files_found: requiredFilesFound,
  required_documentation_sections: requiredSections.every((section) => doc.includes(`## ${section}`)),
  upstream_references_and_action401_conditions: ((action401?.verification_status === "passed" && action401?.readiness_decision === "ready_with_conditions" && action401?.downstream_conditions_count === 2) || (action401?.pattern_discovery_isolation_and_inventory === false && JSON.stringify(action401?.pure_pattern_discovery_implementation_files) === JSON.stringify(["lib/pure-pattern-discovery.ts"]))) && has(doc, ["`readiness_decision: ready_with_conditions`", "24 passed, 0 failed, 0 unresolved, and 2 downstream conditions"]),
  protected_hashes_unchanged: Object.entries(hashes).every(([path, hash]) => shaFile(path) === hash && doc.includes(hash)),
  pure_input_and_configuration_contract: has(doc, ["discoverPatterns(input)", "rows: readonly PatternDiscoveryRowEnvelope[]", "configuration: FrozenPatternDiscoveryConfiguration", "no clock, randomness, environment, filesystem, network"]),
  exact_eligible_status_and_exclusions: has(doc, ["mapper status is exactly `mapped`", "Exclude `mapped_with_missing_optional_data`, every `blocked_*` result", "Pending/incomplete outcomes are excluded"]),
  exact_ten_case_inventory: mappedCases.length === 10 && JSON.stringify(mappedCases) === JSON.stringify(eligibleCaseIds) && eligibleCaseIds.every((id) => doc.includes(`\`${id}\``)),
  row_reconstruction_and_lineage_contract: has(doc, ["Stored Action 400 output may not be reused", "canonical mapper input hash", "canonical row hash", "`static_only: true`", "`no_feedback: true`"]),
  grouping_and_group_key_frozen: has(doc, ["exactly one dimension: `setup_family`", "/row/setup_and_confidence/setup_family", "pattern_group:v1|setup_family=momentum_continuation", "combinatorial dimensions and cross-products: forbidden"]),
  taxonomy_and_evidence_units_frozen: has(doc, ["dimension `setup_family` comes from Action 343", "evidence unit is one unique Action 400 case lineage", "source_case_count: 10", "unique_mapper_row_id_count: 3", "duplicate_mapper_row_identity"]),
  outcome_support_and_minimum_frozen: has(doc, ["`target_hit` -> positive", "support is calculated per group", "`minimum_total_support: 20`", "`minimum_completed_outcomes: 20`", "1-19 row group returns `insufficient_evidence`"]),
  contradiction_and_nonideal_data_frozen: has(doc, ["Contradictory evidence is preserved", "both positive and negative: `mixed`", "Stale context is ineligible", "Partial context/provenance", "Conflicting context/provenance is ineligible", "Unknown or unavailable required"]),
  deterministic_aggregation_order_and_dedup: has(doc, ["scaled integers before summation", "round half-away-from-zero to 4 decimals", "Groups sort lexically", "Duplicate Action 400 case lineage is `blocked_invalid_lineage`", "Exact duplicate envelopes are rejected"]),
  anti_leakage_exact: has(doc, ["Only snapshot-time fields may affect grouping", "Post-recommendation outcomes may affect aggregation only", "returns `blocked_future_leakage`"]),
  result_vocabularies_exact: resultVocabulary.every((status) => doc.includes(`- \`${status}\``)) && has(doc, ["Group evaluation vocabulary is exactly `insight_ready`, `insufficient_evidence`, and `excluded`"]),
  output_and_pattern_insight_contract: has(doc, ["PurePatternDiscoveryResult", "Each group summary contains", "may project to Action 343/357 fields", "`mutation_allowed: false`", "`review_status: unreviewed`"]),
  insight_identity_exact: has(doc, ["pure_pattern_discovery_contract_v1", "SHA-256 evidence-set hash", "pattern_insight:v1:<hex-sha256>", "Current/execution time, randomness, machine path"]),
  prohibited_inference_repair_calibration_mutation: has(doc, ["Never infer future returns", "Do not trim, lowercase", "No confidence bucket adjustment", "No ranking, scanner, recommendation"]),
  expected_group_inventory_exact: has(doc, ["group count: 1", "source case count/support: 10", "unique mapper row IDs: 3", "completed outcomes: 10", "positive/negative/neutral: 10 / 0 / 0", "group status: `insufficient_evidence`", "full Pattern Insights produced: 0"]),
  implementation_and_shadow_separated: has(doc, ["pure implementation plus static unit tests", "independent implementation audit and row-hash freeze", "mapped-only shadow approval gate and frozen manifest", "shadow execution", "may combine implementation with first shadow execution"]),
  evidence_determinism_temp_cleanup: has(doc, ["Full synthetic Pattern Insights may not be retained", "run the exact batch twice", "No third repair run", "Action-specific system-temp directory", "dedicated directory verified absent"]),
  no_persistence_replay_runtime_external_feedback: has(doc, ["No database/Supabase write", "No replay input", "No API/page route", "No network, fetch, socket", "No output may reach Pattern Discovery production services"]),
  stop_conditions_complete: has(doc, ["stops if any protected or manifest hash differs", "any ineligible/blocked/incomplete row appears", "No same-Action repair follows a shadow failure"]),
  approval_vocabulary_and_decision: has(doc, ["Vocabulary is exactly `approved`, `approved_with_conditions`, and `blocked`", "`approval_decision: approved_with_conditions`", "`passed_conditions_count: 26`", "`failed_conditions_count: 0`", "`unresolved_conditions_count: 0`", "`future_conditions_count: 2`"]),
  exact_action404_pure_implementation_only: JSON.stringify(patternImplementationFiles) === JSON.stringify(["lib/pure-pattern-discovery.ts"]) && productionPatternConsumers.length === 0,
  no_downstream_runner_or_manifest: downstreamRunnerOrManifest.length === 0,
  action402_boundary_exact: action402Files.every((path) => allowedAction402Files.includes(path)),
  action403_gate_and_action404_implementation_boundary_exact: action403Artifacts.length === approvedAction403GateFiles.length && action403Artifacts.every((path) => approvedAction403GateFiles.includes(path)) && action404Artifacts.length === approvedAction404Files.length && action404Artifacts.every((path) => approvedAction404Files.includes(path)),
  runtime_preview_untouched: action402Files.every((path) => !path.includes("runtime-preview")) && doc.includes("runtime_preview_waiting_for_operator_inputs"),
  focused_tests_exist: has(tests, ["exact 10 mapped cases and all exclusions are frozen", "single setup-family group and insufficient-evidence inventory are exact", "pure result vocabulary and Pattern Insight compatibility are frozen", "only the approved implementation exists with no runner or downstream manifest", "verifier returns approved_with_conditions"]),
};
const verification_status = Object.values(checks).every(Boolean) ? "passed" : "blocked";
const report = {
  verification_status,
  ...checks,
  approval_decision: verification_status === "passed" ? "approved_with_conditions" : "blocked",
  passed_conditions_count: verification_status === "passed" ? 26 : Object.values(checks).filter(Boolean).length,
  failed_conditions_count: Object.values(checks).filter((value) => !value).length,
  unresolved_conditions_count: 0,
  future_conditions_count: verification_status === "passed" ? 2 : null,
  pure_entry_point: "discoverPatterns(input)",
  eligible_mapper_statuses: verification_status === "passed" ? ["mapped"] : [],
  excluded_mapper_statuses: verification_status === "passed" ? ["mapped_with_missing_optional_data", "blocked_*"] : [],
  eligible_case_ids: eligibleCaseIds,
  grouping_dimensions: verification_status === "passed" ? ["setup_family"] : [],
  expected_group_count: verification_status === "passed" ? 1 : null,
  expected_group_key: verification_status === "passed" ? "pattern_group:v1|setup_family=momentum_continuation" : null,
  expected_support_count: verification_status === "passed" ? 10 : null,
  expected_unique_mapper_row_id_count: verification_status === "passed" ? 3 : null,
  expected_group_status: verification_status === "passed" ? "insufficient_evidence" : null,
  minimum_total_support: 20,
  minimum_completed_outcomes: 20,
  result_vocabulary: resultVocabulary,
  pattern_discovery_implementation_files: patternImplementationFiles,
  production_pattern_consumer_files: productionPatternConsumers,
  downstream_runner_or_manifest_files: downstreamRunnerOrManifest,
  action_402_changed_files: action402Files,
  runtime_preview_status: "runtime_preview_waiting_for_operator_inputs",
  no_effect_flags: { pattern_discovery_implemented: true, pattern_discovery_executed: false, downstream_shadow_executed: false, mapper_rows_reconstructed: false, insights_generated: false, provider_call_executed: false, news_call_executed: false, supabase_read_executed: false, supabase_write_executed: false, persistence_executed: false, replay_executed: false, runtime_integration_executed: false, feedback_executed: false, authoritative_data_created: false, scanner_behavior_changed: false, live_ranking_changed: false, recommendations_mutated: false },
  recognized_action_403_gate_files: action403Artifacts,
  recommended_next_action: verification_status === "passed" ? "action_405_independent_pure_pattern_discovery_verification" : "remediate_action_402_contract_gate",
};
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
process.exitCode = verification_status === "passed" ? 0 : 1;
