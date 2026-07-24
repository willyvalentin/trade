import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const root = process.cwd();
const implementationPath = "lib/pure-pattern-discovery.ts";
const docPath = "docs/action-404-pure-pattern-discovery-implementation.md";
const verifierPath = "scripts/action-404-pure-pattern-discovery-implementation-verify.mjs";
const testPath = "tests/e2e/action-404-pure-pattern-discovery-implementation.spec.ts";
const requiredFiles = [implementationPath, docPath, verifierPath, testPath];
const hashes = {
  "lib/snapshot-to-learning-dataset-mapper.ts": "7294a851ede33aadc0dbfcb68c13337cd244002b84be7cbbe40abbe91673741d",
  "lib/learning-dataset-static-fixtures.ts": "706bd57150914862604af70e0bba7614151f53c32abc5dbde9595c53bf4b332b",
  "lib/intelligence-context-static-fixtures.ts": "46358cb997b4f7a431a3fee72562659da48b13219404224f4e80e08dbf8ed406",
  "lib/pattern-insight-static-fixtures.ts": "db8dae9f101f710123a0a3ac6493356bd761c15f231023ab9742caefaacf8f57",
  "scripts/action-400-expanded-static-mapper-shadow-run.mjs": "a1123e1416df78a51645321cb9a273095c2a338febd8021265c4e3ee972d5b05",
  "docs/action-400-expanded-static-mapper-shadow-input-manifest.json": "e0a2646492da2038bf156c0060c48eb8144e78ff0d57cda92a60d3ca36c95319",
};
const types = ["PatternDiscoveryRowEnvelope", "FrozenPatternDiscoveryConfiguration", "PatternDiscoveryIssue", "PatternDiscoveryWarning", "PatternDiscoveryEvidenceSummary", "PatternDiscoveryGroupResult", "PatternDiscoveryResult"];
const statuses = ["discovered", "discovered_with_warnings", "insufficient_evidence", "blocked_invalid_input", "blocked_invalid_configuration", "blocked_invalid_lineage", "blocked_future_leakage", "blocked_non_consumable_row", "blocked_nondeterministic_grouping"];
const errorCodes = ["invalid_input_shape", "invalid_configuration_shape", "invalid_batch_declaration", "invalid_row_envelope", "ineligible_mapper_status", "missing_row", "non_consumable_row", "invalid_lineage", "future_leakage", "missing_grouping_field", "invalid_grouping_literal", "invalid_outcome", "non_finite_numeric", "nondeterministic_grouping", "duplicate_source_case_id"];
const warningCodes = ["minimum_total_support_not_met", "minimum_completed_outcomes_not_met", "duplicate_mapper_row_identity", "metric_value_unavailable"];
const abs = (path) => resolve(root, path);
const read = (path) => readFileSync(abs(path), "utf8");
const sha = (path) => createHash("sha256").update(readFileSync(abs(path))).digest("hex");
const has = (value, values) => values.every((item) => value.includes(item));
function files(path) { const full = abs(path); if (!existsSync(full)) return []; if (statSync(full).isFile()) return [path]; return readdirSync(full).flatMap((name) => files(join(path, name))).sort(); }
const implementation = existsSync(abs(implementationPath)) ? read(implementationPath) : "";
const doc = existsSync(abs(docPath)) ? read(docPath) : "";
const tests = existsSync(abs(testPath)) ? read(testPath) : "";
const runtimeExports = [...implementation.matchAll(/^export function (\w+)/gm)].map((match) => match[1]);
const typeExports = [...implementation.matchAll(/^export type (\w+)/gm)].map((match) => match[1]);
const imports = [...implementation.matchAll(/^import(?: type)? .*? from ["']([^"']+)["'];?$/gm)].map((match) => match[1]);
const action404Files = [...files("docs"), ...files("scripts"), ...files("tests/e2e"), ...files("lib")].filter((path) => path.includes("action-404") || path === implementationPath).sort();
const consumers = [...files("app"), ...files("lib")].filter((path) => path !== implementationPath && /\.(?:ts|tsx|js|mjs)$/.test(path) && read(path).includes("pure-pattern-discovery"));
const runnerManifest = [...files("scripts"), ...files("docs")].filter((path) => !requiredFiles.includes(path) && /action-40[45].*(?:pattern-discovery.*(?:run|manifest)|downstream.*(?:run|manifest)|shadow.*(?:run|manifest))/i.test(path));
const forbidden = [/process\.env/, /Date\.now\(/, /new Date\(/, /Math\.random\(/, /fetch\(/, /console\./, /from ["'](?:node:)?fs/, /from ["'](?:node:)?http/, /from ["'](?:node:)?https/, /@supabase|createClient\(/];
const phaseMarkers = ["Phase 1: input shape", "Phase 2: configuration shape", "Phase 3: batch declarations", "Phase 4: row-envelope shape", "Phase 5: mapper status", "Phase 6: lineage integrity", "Phase 7: anti-leakage", "Phase 8: required grouping", "Phase 9: completed outcome", "Phase 10: finite", "Phase 11: deterministic grouping", "Phases 12-14: aggregation"];
const phasePositions = phaseMarkers.map((item) => implementation.indexOf(item));
const checks = {
  required_files_found: requiredFiles.every((path) => existsSync(abs(path))),
  documentation_complete: has(doc, ["## Purpose", "## Scope", "## Action 402 Contract", "## Action 403 Approval", "## Exported API", "## Type Inventory", "## Validation Order", "## Result Vocabulary", "## Issue And Warning Vocabulary", "## Row Eligibility And Lineage", "## Anti-Leakage, Grouping, And Duplicates", "## Outcomes And Support", "## Aggregation And Rounding", "## Identity, Serialization, Immutability, And Determinism", "## No-Runner, No-Manifest, No-Shadow", "## No-Persistence, No-Runtime, No-Feedback", "## Runtime Preview", "## Action 405 Mandatory Audit"]),
  action402_action403_contracts_preserved: has(doc, ["only `mapped` rows are eligible", "`approval_decision: approved_with_conditions`", "28 passed, 0 failed, 0 unresolved, and 1 future condition", "Action 405 must independently verify"]),
  protected_hashes_unchanged: Object.entries(hashes).every(([path, expected]) => existsSync(abs(path)) && sha(path) === expected),
  exact_runtime_export: JSON.stringify(runtimeExports) === JSON.stringify(["discoverPatterns"]),
  exact_type_exports: JSON.stringify(typeExports) === JSON.stringify(types),
  exact_synchronous_signature: has(implementation, ["export function discoverPatterns(input: Readonly<{", "rows: readonly PatternDiscoveryRowEnvelope[];", "configuration: FrozenPatternDiscoveryConfiguration;", "}>): PatternDiscoveryResult {"]) && !implementation.includes("export async function discoverPatterns"),
  only_approved_imports: imports.length === 2 && imports.includes("crypto") && imports.includes("@/lib/learning-dataset-static-fixtures"),
  no_forbidden_source_access: forbidden.every((pattern) => !pattern.test(implementation)),
  validation_phases_in_frozen_order: phasePositions.every((position) => position >= 0) && phasePositions.every((position, index) => index === 0 || position > phasePositions[index - 1]),
  exact_configuration_and_result_vocabularies: has(implementation, ["pure_pattern_discovery_contract_v1", "pattern_discovery_setup_family_v1", "minimum_total_support === 20", "minimum_completed_outcomes === 20", "numeric_scale === 1000000", "rounding_mode === \"half_away_from_zero\""]) && statuses.every((status) => implementation.includes(`\"${status}\"`)),
  exact_issue_warning_grouping_lineage_contract: [...errorCodes, ...warningCodes].every((code) => implementation.includes(`\"${code}\"`)) && has(implementation, ["sha256(envelope.row) !== envelope.canonical_row_sha256", "anti_leakage_status === \"passed\"", "duplicate_mapper_row_identity", "pattern_group:v1|setup_family=", "encodeURIComponent", ".normalize(\"NFC\")"]),
  exact_duplicate_support_outcome_and_aggregation_contract: has(implementation, ["case_support_count: ordered.length", "unique_mapper_row_count: new Set(mapperRowIds).size", "completed_outcome_count: outcomes.length", "return \"mixed\"", "BigInt(Math.trunc", "roundRatio", "fixedFour", "minimum_total_support_not_met"]),
  canonical_hashing_and_immutability_contract: has(implementation, ["createHash(\"sha256\")", "pattern_evidence_set:v1", "pattern_group_hash:v1", "pattern_insight:v1:", "Object.keys(value).sort(compareText)", "canonical_result_sha256: sha256(value)"]),
  focused_tests_cover_contract: has(tests, ["valid minimal input is grouped exactly", "invalid input configuration grouping dimension", "lineage validation rejects", "failed or unknown leakage", "duplicates preserve case support", "positive negative neutral mixed and support status", "scaled integer averages medians", "input and nested values remain immutable"]),
  no_production_consumer: consumers.length === 0,
  no_runner_or_manifest: runnerManifest.length === 0,
  action404_boundary_exact: JSON.stringify(action404Files) === JSON.stringify([...requiredFiles].sort()),
  runtime_preview_untouched: doc.includes("runtime_preview_waiting_for_operator_inputs"),
  action405_mandatory: has(doc, ["Action 405 must independently verify this implementation without modifying it", "No downstream shadow is approved before Action 405"]),
};
const verification_status = Object.values(checks).every(Boolean) ? "passed" : "blocked";
const report = { verification_status, ...checks, implementation_status: verification_status === "passed" ? "implemented_static_pure_not_shadowed" : "blocked", approved_module_path: implementationPath, runtime_exports: runtimeExports, type_exports: typeExports, result_vocabulary: statuses, error_codes: errorCodes, warning_codes: warningCodes, protected_hashes: Object.fromEntries(Object.keys(hashes).map((path) => [path, existsSync(abs(path)) ? sha(path) : null])), production_consumer_files: consumers, downstream_runner_or_manifest_files: runnerManifest, action_404_changed_files: action404Files, runtime_preview_status: "runtime_preview_waiting_for_operator_inputs", no_effect_flags: { action_400_rows_reconstructed: false, pattern_discovery_shadow_executed: false, insights_persisted: false, provider_call_executed: false, news_call_executed: false, supabase_read_executed: false, supabase_write_executed: false, persistence_executed: false, replay_executed: false, runtime_integration_executed: false, feedback_executed: false, scanner_behavior_changed: false, live_ranking_changed: false, recommendations_mutated: false }, recommended_next_action: verification_status === "passed" ? "action_405_independent_pure_pattern_discovery_verification" : "remediate_action_404_implementation" };
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
process.exitCode = verification_status === "passed" ? 0 : 1;
