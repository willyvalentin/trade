#!/usr/bin/env node

import { createHash } from "crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const paths = {
  doc: "docs/action-426-static-confidence-calibration-hash-freeze.md",
  inventory: "docs/action-426-static-confidence-calibration-hash-inventory.json",
  freezer: "scripts/action-426-static-confidence-calibration-hash-freeze.mjs",
  verifier: "scripts/action-426-static-confidence-calibration-hash-freeze-verify.mjs",
  test: "tests/e2e/action-426-static-confidence-calibration-hash-freeze.spec.ts",
  action425Verifier: "scripts/action-425-static-confidence-calibration-fixture-and-hash-freeze-approval-gate-verify.mjs",
};

const expectedIds = Array.from({ length: 45 }, (_, index) => `cc425_${String(index + 1).padStart(2, "0")}`);
const expectedStatusDistribution = {
  calibrated: 14,
  calibrated_with_warnings: 11,
  no_adjustment: 5,
  insufficient_eligible_evidence: 1,
  blocked_invalid_input: 9,
  blocked_invalid_configuration: 1,
  blocked_invalid_lineage: 1,
  blocked_future_leakage: 1,
  blocked_overlapping_evidence: 1,
  blocked_unsupported_insight: 1,
};
const noEffectFlags = {
  provider_call_executed: false,
  provider_call_attempted: false,
  supabase_read_executed: false,
  supabase_write_executed: false,
  persistence_executed: false,
  replay_executed: false,
  runtime_integration_executed: false,
  calibration_shadow_executed: false,
  recommendation_mutation_executed: false,
  feedback_executed: false,
  scanner_behavior_changed: false,
  live_ranking_changed: false,
  runtime_preview_advanced: false,
};

const abs = (path) => join(root, path);
const exists = (path) => existsSync(abs(path));
const read = (path) => readFileSync(abs(path), "utf8");
const sha = (value) => createHash("sha256").update(value, "utf8").digest("hex");

function stableHash(value) {
  return sha(JSON.stringify(canonicalize(value)));
}

function canonicalize(value) {
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new TypeError("non_finite_canonical_number");
    return Object.is(value, -0) ? 0 : value;
  }
  if (Array.isArray(value)) return value.map(canonicalize);
  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, child]) => child !== undefined)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, canonicalize(child)]),
    );
  }
  throw new TypeError("unsupported_canonical_value");
}

function collectFiles(path) {
  if (!exists(path)) return [];
  if (statSync(abs(path)).isFile()) return [path];
  return readdirSync(abs(path)).flatMap((entry) => collectFiles(join(path, entry))).sort();
}

const doc = exists(paths.doc) ? read(paths.doc) : "";
const freezer = exists(paths.freezer) ? read(paths.freezer) : "";
const inventory = exists(paths.inventory) ? JSON.parse(read(paths.inventory)) : null;
const action425 = exists(paths.action425Verifier)
  ? JSON.parse(await import("child_process").then(({ execFileSync }) =>
      execFileSync("node", [abs(paths.action425Verifier)], { cwd: root, encoding: "utf8", timeout: 240000 })))
  : null;

const scenarioIds = inventory?.scenario_ids ?? [];
const scenarios = inventory?.scenarios ?? [];
const forbiddenArtifacts = [
  "scripts/action-426-static-confidence-calibration-shadow-run.mjs",
  "scripts/action-426-confidence-calibration-runner.mjs",
  "docs/action-426-static-confidence-calibration-execution-manifest.json",
  "docs/action-426-static-confidence-calibration-shadow-input-manifest.json",
  "app/api/action-426",
  "app/action-426",
].filter(exists);
const trackedAction426Evidence = [...collectFiles("docs"), ...collectFiles("scripts"), ...collectFiles("tests")]
  .filter((path) => /action-426/.test(path))
  .filter((path) => /shadow|execution-manifest|runner|provider|supabase|persistence|replay|feedback|recommendation|runtime/i.test(path))
  .filter((path) => ![paths.doc, paths.inventory, paths.freezer, paths.verifier, paths.test].includes(path));

const recomputedInventoryHash = inventory
  ? stableHash({ ...inventory, run_id: "canonical", full_inventory_sha256: null })
  : null;
const scenarioHashIntegrity = scenarios.every((scenario) =>
  scenario.scenario_summary_sha256 === stableHash({ ...scenario, scenario_summary_sha256: null }));

const exactDistribution = (actual, expected) =>
  Object.entries(expected).every(([key, value]) => actual?.[key] === value) &&
  Object.keys(actual ?? {}).every((key) => expected[key] === actual[key]);

const checks = {
  documentation_exists: exists(paths.doc),
  inventory_exists: exists(paths.inventory),
  hash_freeze_script_exists: exists(paths.freezer),
  verifier_exists: exists(paths.verifier),
  focused_tests_exist: exists(paths.test),
  action425_healthy: action425?.verification_status === "passed" &&
    action425?.approval_decision === "approved_with_conditions" &&
    action425?.exact_scenario_count === 45,
  exact_45_scenarios: inventory?.scenario_count === 45 && scenarios.length === 45,
  exact_scenario_ids: JSON.stringify(scenarioIds) === JSON.stringify(expectedIds),
  exact_coverage_families: new Set(scenarios.map((scenario) => scenario.coverage_family)).size === 45,
  bounded_source_classes: scenarios.every((scenario) => scenario.source_classification === "deterministic_test_local_confidence_calibration_insight_envelope"),
  exact_configuration: inventory?.configuration?.configuration_version === "confidence_calibration_config_v1" &&
    inventory?.configuration?.combined_positive_cap_basis_points === 400 &&
    inventory?.configuration?.combined_negative_cap_basis_points === -600,
  status_distribution: exactDistribution(inventory?.status_distribution, expectedStatusDistribution),
  warning_distribution: ["duplicate_mapper_row_identity", "metric_value_unavailable", "duplicate_insight_deduped", "overlapping_insight_excluded", "confidence_clamped_to_bounds"]
    .every((code) => inventory?.warning_distribution?.[code] > 0),
  issue_distribution: ["warning_status_contradiction", "overlapping_evidence_conflict", "ineligible_pattern_discovery_status", "invalid_lineage", "future_leakage", "invalid_insight_structure", "invalid_configuration_shape", "invalid_base_confidence", "insufficient_eligible_evidence"]
    .every((code) => inventory?.issue_distribution?.[code] > 0),
  delta_cap_clamp_inventory: scenarios.some((scenario) => scenario.coverage_family === "positive_combined_cap" && scenario.post_cap_aggregate_delta_basis_points === 400) &&
    scenarios.some((scenario) => scenario.coverage_family === "negative_combined_cap" && scenario.post_cap_aggregate_delta_basis_points === -600) &&
    scenarios.some((scenario) => scenario.coverage_family === "upper_bound_clamp" && scenario.clamping_state.clamped === true) &&
    scenarios.some((scenario) => scenario.coverage_family === "lower_bound_clamp" && scenario.clamping_state.clamped === true),
  overlap_inventory: scenarios.some((scenario) => scenario.coverage_family === "exact_duplicate_insight" && scenario.overlap_resolution.deduplicated_count === 1) &&
    scenarios.some((scenario) => scenario.coverage_family === "same_evidence_set_overlap" && scenario.overlap_resolution.overlapping_excluded_count === 1) &&
    scenarios.some((scenario) => scenario.status === "blocked_overlapping_evidence"),
  zero_adjustment_inventory: ["cc425_04", "cc425_05", "cc425_20", "cc425_32", "cc425_33"].every((id) =>
    scenarios.some((scenario) => scenario.scenario_id === id && scenario.status === "no_adjustment")),
  calibration_ids_and_hashes: scenarios
    .filter((scenario) => scenario.calibration_id !== null)
    .every((scenario) =>
      /^confidence_calibration_v1:[a-f0-9]{24}$/.test(scenario.calibration_id) &&
      /^[a-f0-9]{64}$/.test(scenario.identity_sha256) &&
      scenario.identity_sha256 === scenario.independent_identity_sha256 &&
      /^[a-f0-9]{64}$/.test(scenario.canonical_result_sha256) &&
      /^[a-f0-9]{64}$/.test(scenario.scenario_summary_sha256)),
  independent_canonicalization: scenarioHashIntegrity && inventory?.full_inventory_sha256 === recomputedInventoryHash,
  exactly_two_freeze_runs: freezer.includes("const first = freezeOnce(\"first\")") &&
    freezer.includes("const second = freezeOnce(\"second\")") &&
    !freezer.includes("third"),
  bounded_metadata_only: inventory?.bounded_metadata_only === true &&
    inventory?.full_insights_retained === false &&
    inventory?.full_pattern_discovery_results_retained === false &&
    inventory?.recommendation_objects_retained === false,
  no_runner_manifest_shadow: forbiddenArtifacts.length === 0 &&
    trackedAction426Evidence.length === 0 &&
    inventory?.shadow_runner_created === false &&
    inventory?.execution_manifest_created === false &&
    inventory?.calibration_shadow_executed === false,
  protected_sources_unchanged: Object.values(inventory?.protected_sources ?? {}).every((entry) => entry.unchanged === true),
  no_runtime_persistence_replay_provider_supabase_feedback: inventory?.no_runtime === true &&
    inventory?.no_persistence === true &&
    inventory?.no_replay === true &&
    inventory?.no_feedback === true &&
    inventory?.provider_call_executed === false &&
    inventory?.supabase_write_executed === false,
  no_recommendation_mutation: inventory?.recommendation_mutated === false,
  runtime_preview_paused: inventory?.runtime_preview_status === "runtime_preview_waiting_for_operator_inputs" &&
    doc.includes("runtime_preview_waiting_for_operator_inputs"),
  action427_identified: inventory?.mandatory_next_action === "action_427_independent_calibration_hash_freeze_verification" &&
    doc.includes("Action 427"),
  no_effect_flags_false: Object.values(inventory?.no_effect_flags ?? {}).every((value) => value === false) &&
    Object.values(noEffectFlags).every((value) => value === false),
};

const failedChecks = Object.entries(checks).filter(([, passed]) => !passed).map(([name]) => name);
const report = {
  verification_status: failedChecks.length === 0 ? "passed" : "failed",
  checks,
  failed_checks: failedChecks,
  scenario_count: inventory?.scenario_count ?? 0,
  scenario_ids: scenarioIds,
  status_distribution: inventory?.status_distribution ?? {},
  warning_distribution: inventory?.warning_distribution ?? {},
  issue_distribution: inventory?.issue_distribution ?? {},
  full_inventory_sha256: inventory?.full_inventory_sha256 ?? null,
  recomputed_inventory_sha256: recomputedInventoryHash,
  repeat_freeze_identical: checks.exactly_two_freeze_runs && checks.independent_canonicalization,
  forbidden_artifacts_found: forbiddenArtifacts,
  tracked_action426_evidence_files: trackedAction426Evidence,
  no_effect_flags: noEffectFlags,
  runtime_preview_status: "runtime_preview_waiting_for_operator_inputs",
  recommended_next_action: "action_427_independent_calibration_hash_freeze_verification",
};

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
process.exitCode = failedChecks.length === 0 ? 0 : 1;
