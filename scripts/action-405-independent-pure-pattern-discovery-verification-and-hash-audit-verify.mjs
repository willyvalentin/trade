#!/usr/bin/env node

import { createHash } from "crypto";
import { execFileSync } from "child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "fs";
import { join, resolve } from "path";

const root = process.cwd();
const paths = {
  implementation: "lib/pure-pattern-discovery.ts",
  mapper: "lib/snapshot-to-learning-dataset-mapper.ts",
  learning: "lib/learning-dataset-static-fixtures.ts",
  context: "lib/intelligence-context-static-fixtures.ts",
  pattern: "lib/pattern-insight-static-fixtures.ts",
  action400Runner: "scripts/action-400-expanded-static-mapper-shadow-run.mjs",
  action400Manifest: "docs/action-400-expanded-static-mapper-shadow-input-manifest.json",
  action403Verifier: "scripts/action-403-pure-pattern-discovery-implementation-approval-gate-verify.mjs",
  action404Verifier: "scripts/action-404-pure-pattern-discovery-implementation-verify.mjs",
  doc: "docs/action-405-independent-pure-pattern-discovery-verification-and-hash-audit.md",
  verifier: "scripts/action-405-independent-pure-pattern-discovery-verification-and-hash-audit-verify.mjs",
  test: "tests/e2e/action-405-independent-pure-pattern-discovery-verification-and-hash-audit.spec.ts",
};
const expectedHashes = {
  [paths.implementation]: "48b7667c8690a1d8d56b819a3727e37ea73af7710a45131eb3debab48627191c",
  [paths.mapper]: "7294a851ede33aadc0dbfcb68c13337cd244002b84be7cbbe40abbe91673741d",
  [paths.learning]: "706bd57150914862604af70e0bba7614151f53c32abc5dbde9595c53bf4b332b",
  [paths.context]: "46358cb997b4f7a431a3fee72562659da48b13219404224f4e80e08dbf8ed406",
  [paths.pattern]: "db8dae9f101f710123a0a3ac6493356bd761c15f231023ab9742caefaacf8f57",
  [paths.action400Runner]: "a1123e1416df78a51645321cb9a273095c2a338febd8021265c4e3ee972d5b05",
  [paths.action400Manifest]: "e0a2646492da2038bf156c0060c48eb8144e78ff0d57cda92a60d3ca36c95319",
};
const typeExports = [
  "PatternDiscoveryRowEnvelope",
  "FrozenPatternDiscoveryConfiguration",
  "PatternDiscoveryIssue",
  "PatternDiscoveryWarning",
  "PatternDiscoveryEvidenceSummary",
  "PatternDiscoveryGroupResult",
  "PatternDiscoveryResult",
];
const statuses = [
  "discovered",
  "discovered_with_warnings",
  "insufficient_evidence",
  "blocked_invalid_input",
  "blocked_invalid_configuration",
  "blocked_invalid_lineage",
  "blocked_future_leakage",
  "blocked_non_consumable_row",
  "blocked_nondeterministic_grouping",
];
const issueCodes = [
  "invalid_input_shape",
  "invalid_configuration_shape",
  "invalid_batch_declaration",
  "invalid_row_envelope",
  "ineligible_mapper_status",
  "missing_row",
  "non_consumable_row",
  "invalid_lineage",
  "future_leakage",
  "missing_grouping_field",
  "invalid_grouping_literal",
  "invalid_outcome",
  "non_finite_numeric",
  "nondeterministic_grouping",
  "duplicate_source_case_id",
];
const warningCodes = [
  "minimum_total_support_not_met",
  "minimum_completed_outcomes_not_met",
  "duplicate_mapper_row_identity",
  "metric_value_unavailable",
];
const requiredSections = [
  "Purpose",
  "Scope",
  "Authoritative Dependencies",
  "Action 402 Contract Summary",
  "Action 403 Approval Summary",
  "Action 404 Implementation Summary",
  "Explicit Non-Goals",
  "Source-Integrity Audit",
  "Export-Surface Audit",
  "Function-Purity Audit",
  "Validation-Order Audit",
  "Multi-Fault Precedence Audit",
  "Row-Eligibility Audit",
  "Lineage Audit",
  "Anti-Leakage Audit",
  "Grouping Audit",
  "Literal-Validation Audit",
  "Duplicate-Identity Audit",
  "Support-Count Audit",
  "Outcome-Classification Audit",
  "Aggregation Audit",
  "Rounding Audit",
  "Signed-Zero Audit",
  "Finite-Number Audit",
  "Overflow Audit",
  "Contradiction Audit",
  "Minimum-Support Audit",
  "Insufficient-Evidence Audit",
  "Discovered-Result Audit",
  "Issue-Contract Audit",
  "Warning-Contract Audit",
  "Ordering And Deduplication Audit",
  "Immutability Audit",
  "Repeated-Call Determinism",
  "Interleaved-Call Determinism",
  "Input-Order Determinism",
  "Canonical Serialization Audit",
  "Canonical-Row-Hash Audit",
  "Evidence-Set-Hash Audit",
  "Group-Hash Audit",
  "Insight-ID Audit",
  "Result-Hash Audit",
  "Hash-Collision-Domain Review",
  "External-Import Audit",
  "Consumer Inventory",
  "Hidden-Side-Effect Audit",
  "Remaining Gap Inventory",
  "Downstream-Shadow Readiness",
  "Readiness Vocabulary",
  "Readiness Decision",
  "Passed Conditions",
  "Failed Conditions",
  "Unresolved Conditions",
  "Next Permitted Action",
];
const abs = (path) => resolve(root, path);
const exists = (path) => existsSync(abs(path));
const read = (path) => readFileSync(abs(path), "utf8");
const shaFile = (path) => createHash("sha256").update(readFileSync(abs(path))).digest("hex");
const hasAll = (source, markers) => markers.every((marker) => source.includes(marker));
function files(path) {
  const full = abs(path);
  if (!existsSync(full)) return [];
  if (statSync(full).isFile()) return [path];
  return readdirSync(full).flatMap((entry) => files(join(path, entry))).sort();
}
function runJson(script) {
  return JSON.parse(execFileSync("node", [abs(script)], { cwd: root, encoding: "utf8" }));
}
const requiredFiles = [paths.doc, paths.verifier, paths.test, paths.implementation];
const implementation = exists(paths.implementation) ? read(paths.implementation) : "";
const doc = exists(paths.doc) ? read(paths.doc) : "";
const test = exists(paths.test) ? read(paths.test) : "";
const runtimeExports = [...implementation.matchAll(/^export function (\w+)/gm)].map((match) => match[1]);
const actualTypeExports = [...implementation.matchAll(/^export type (\w+)/gm)].map((match) => match[1]);
const imports = [...implementation.matchAll(/^import(?: type)? .*? from ["']([^"']+)["'];?$/gm)].map((match) => match[1]);
const forbiddenSource = [
  /from ["'](?:node:)?fs/,
  /from ["'](?:node:)?http/,
  /from ["'](?:node:)?https/,
  /fetch\(/,
  /process\.env/,
  /Date\.now\(/,
  /new Date\(/,
  /Math\.random\(/,
  /randomUUID|randomBytes/,
  /console\./,
  /@supabase|createClient\(/,
];
const consumerFiles = [...files("app"), ...files("lib")]
  .filter((path) => path !== paths.implementation && /\.(?:ts|tsx|js|mjs)$/.test(path))
  .filter((path) => read(path).includes("pure-pattern-discovery") || read(path).includes("discoverPatterns"));
const acceptedNonConsumerFiles = [paths.doc, paths.verifier, paths.test, paths.implementation];
const runnerOrManifestFiles = [...files("scripts"), ...files("docs")]
  .filter((path) => !acceptedNonConsumerFiles.includes(path))
  .filter((path) => /action-40[45].*(?:pattern-discovery.*(?:run|runner|manifest)|downstream.*(?:run|runner|manifest)|shadow.*(?:run|runner|manifest))/i.test(path));
const action403 = exists(paths.action403Verifier) ? runJson(paths.action403Verifier) : null;
const action404 = exists(paths.action404Verifier) ? runJson(paths.action404Verifier) : null;
const statusLines = execFileSync("git", ["status", "--short", "--untracked-files=all"], { cwd: root, encoding: "utf8" })
  .trim()
  .split("\n")
  .filter(Boolean)
  .map((line) => line.slice(3).trim());
const action405Allowed = [paths.doc, paths.verifier, paths.test];
const action405Files = statusLines.filter((path) => path.includes("action-405"));
const unrelatedWorkFiles = statusLines.filter((path) => !action405Allowed.includes(path) && ![
  "scripts/action-318-static-replay-batch-commit-readiness-verify.mjs",
  "scripts/action-319-static-replay-batch-post-commit-verify.mjs",
  "scripts/action-320-static-replay-branch-package-verify.mjs",
].includes(path));
const checks = {
  required_files_found: requiredFiles.every(exists),
  documentation_sections_complete: requiredSections.every((section) => doc.includes(`## ${section}`)),
  source_hashes_unchanged: Object.entries(expectedHashes).every(([path, expected]) => exists(path) && shaFile(path) === expected && doc.includes(expected)),
  export_surface_exact: JSON.stringify(runtimeExports) === JSON.stringify(["discoverPatterns"]) && JSON.stringify(actualTypeExports) === JSON.stringify(typeExports),
  function_synchronous: implementation.includes("export function discoverPatterns(input: Readonly<{") && !implementation.includes("export async function discoverPatterns"),
  no_stateful_public_surface: !/export (?:class|const|let|var|default)\b/.test(implementation) && !/class\s+\w+/.test(implementation),
  imports_are_local_and_safe: imports.length === 2 && imports.includes("crypto") && imports.includes("@/lib/learning-dataset-static-fixtures"),
  forbidden_source_absent: forbiddenSource.every((pattern) => !pattern.test(implementation)),
  validation_phase_markers_in_order: [
    "Phase 1: input shape",
    "Phase 2: configuration shape",
    "Phase 3: batch declarations",
    "Phase 4: row-envelope shape",
    "Phase 5: mapper status",
    "Phase 6: lineage integrity",
    "Phase 7: anti-leakage",
    "Phase 8: required grouping",
    "Phase 9: completed outcome",
    "Phase 10: finite",
    "Phase 11: deterministic grouping",
    "Phases 12-14: aggregation",
  ].map((marker) => implementation.indexOf(marker)).every((position, index, all) => position >= 0 && (index === 0 || position > all[index - 1])),
  vocabularies_exact: statuses.every((status) => implementation.includes(`"${status}"`) && doc.includes(status)) && issueCodes.every((code) => implementation.includes(`"${code}"`) && doc.includes(code)) && warningCodes.every((code) => implementation.includes(`"${code}"`) && doc.includes(code)),
  contract_markers_present: hasAll(implementation, [
    "mapper_status !== \"mapped\"",
    "sha256(envelope.row) !== envelope.canonical_row_sha256",
    "anti_leakage_status === \"passed\"",
    "value !== \"momentum_continuation\"",
    "outcome.availability !== \"complete\"",
    "Number.isSafeInteger(value * scale)",
    "case_support_count: ordered.length",
    "unique_mapper_row_count: new Set(mapperRowIds).size",
    "completed_outcome_count: outcomes.length",
    "duplicate_mapper_row_identity",
    "pattern_evidence_set:v1",
    "pattern_group_hash:v1",
    "pattern_insight:v1:",
  ]),
  focused_tests_cover_required_audits: hasAll(test, [
    "validation precedence",
    "eligibility bypasses",
    "lineage attacks",
    "leakage attacks",
    "grouping literal bypasses",
    "duplicate support",
    "outcome classification",
    "aggregation rounding",
    "support thresholds",
    "issue and warning contracts",
    "independent canonical hashes",
    "immutability",
    "determinism",
    "no forbidden imports",
    "consumers runner manifest",
    "runtime_preview_waiting_for_operator_inputs",
  ]),
  action403_action404_healthy: action403?.verification_status === "passed" && action404?.verification_status === "passed",
  production_consumers_zero: consumerFiles.length === 0,
  runner_manifest_shadow_zero: runnerOrManifestFiles.length === 0,
  runtime_preview_paused: doc.includes("runtime_preview_waiting_for_operator_inputs"),
  action405_boundary_exact: action405Files.every((path) => action405Allowed.includes(path)),
};
const failedChecks = Object.entries(checks).filter(([, passed]) => !passed).map(([name]) => name);
const readiness_decision = failedChecks.length === 0 ? "ready_with_conditions" : "blocked";
const report = {
  verification_status: failedChecks.length === 0 ? "passed" : "blocked",
  readiness_decision,
  readiness_vocabulary: ["ready", "ready_with_conditions", "blocked"],
  source_integrity: Object.fromEntries(Object.entries(expectedHashes).map(([path, expected]) => [path, { expected, actual: exists(path) ? shaFile(path) : null, unchanged: exists(path) && shaFile(path) === expected }])),
  runtime_exports: runtimeExports,
  type_exports: actualTypeExports,
  result_vocabulary: statuses,
  issue_codes: issueCodes,
  warning_codes: warningCodes,
  checks,
  failed_checks: failedChecks,
  passed_conditions_count: Object.values(checks).filter(Boolean).length,
  failed_conditions_count: failedChecks.length,
  unresolved_conditions_count: readiness_decision === "ready_with_conditions" ? 1 : 0,
  remaining_conditions: readiness_decision === "ready_with_conditions" ? ["freeze exact Action 400 reconstructed-row hashes in a separate mapped-only shadow approval gate"] : [],
  production_consumer_files: consumerFiles,
  downstream_runner_or_manifest_files: runnerOrManifestFiles,
  action405_files: action405Files,
  unrelated_work_classification: {
    present: unrelatedWorkFiles.length > 0,
    count: unrelatedWorkFiles.length,
    note: "pre-existing or parallel work is not modified by Action 405",
  },
  no_effect_flags: {
    provider_call_executed: false,
    news_call_executed: false,
    supabase_read_executed: false,
    supabase_write_executed: false,
    persistence_executed: false,
    replay_executed: false,
    downstream_shadow_executed: false,
    runtime_integration_executed: false,
    feedback_executed: false,
    scanner_behavior_changed: false,
    live_ranking_changed: false,
    recommendations_mutated: false,
  },
  runtime_preview_status: "runtime_preview_waiting_for_operator_inputs",
  recommended_next_action: readiness_decision === "ready_with_conditions"
    ? "action_406_mapped_only_pattern_discovery_hash_freeze_and_shadow_approval_gate"
    : "remediate_action_404_before_shadow",
};
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
process.exitCode = failedChecks.length === 0 ? 0 : 1;
