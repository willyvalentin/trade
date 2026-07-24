#!/usr/bin/env node

import { execFileSync } from "child_process";
import { createHash } from "crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const paths = {
  doc: "docs/action-427-independent-static-confidence-calibration-hash-freeze-verification.md",
  verifier: "scripts/action-427-independent-static-confidence-calibration-hash-freeze-verification-verify.mjs",
  test: "tests/e2e/action-427-independent-static-confidence-calibration-hash-freeze-verification.spec.ts",
  action425Doc: "docs/action-425-static-confidence-calibration-fixture-and-hash-freeze-approval-gate.md",
  action425Verifier: "scripts/action-425-static-confidence-calibration-fixture-and-hash-freeze-approval-gate-verify.mjs",
  action426Doc: "docs/action-426-static-confidence-calibration-hash-freeze.md",
  action426Inventory: "docs/action-426-static-confidence-calibration-hash-inventory.json",
  action426Freezer: "scripts/action-426-static-confidence-calibration-hash-freeze.mjs",
  action426Verifier: "scripts/action-426-static-confidence-calibration-hash-freeze-verify.mjs",
  action309Guard: "scripts/action-309-post-recovery-safety-guard.mjs",
  goldenVerifier: "scripts/replay-with-signal-package-static-preview-verify-golden.mjs",
};

const expectedInventoryHash = "875f385a05f58d982baa182350a662db5518e13f8c18557e4697317deb724cc5";
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
const expectedWarningDistribution = {
  duplicate_mapper_row_identity: 4,
  metric_value_unavailable: 3,
  duplicate_insight_deduped: 1,
  overlapping_insight_excluded: 3,
  confidence_clamped_to_bounds: 2,
};
const expectedIssueDistribution = {
  warning_status_contradiction: 2,
  overlapping_evidence_conflict: 2,
  ineligible_pattern_discovery_status: 1,
  invalid_lineage: 1,
  future_leakage: 1,
  invalid_insight_structure: 1,
  invalid_configuration_shape: 1,
  invalid_base_confidence: 6,
  insufficient_eligible_evidence: 1,
};
const expectedBaseConfidenceInventory = [
  "-1",
  "0",
  "100",
  "10000",
  "10001",
  "50",
  "50.00",
  "5000",
  "5000.1",
  "9800",
  "9900",
  "Infinity",
  "NaN",
];
const expectedProtectedSources = [
  "lib/pure-confidence-calibration.ts",
  "lib/snapshot-to-learning-dataset-mapper.ts",
  "lib/pure-pattern-discovery.ts",
  "lib/learning-dataset-static-fixtures.ts",
  "lib/intelligence-context-static-fixtures.ts",
  "lib/pattern-insight-static-fixtures.ts",
  "docs/action-416-expanded-static-pattern-discovery-shadow-input-manifest.json",
  "scripts/action-416-expanded-static-pattern-discovery-shadow-run.mjs",
  paths.action426Doc,
  paths.action426Inventory,
  paths.action426Freezer,
];
const requiredDocSections = [
  "Purpose",
  "Scope",
  "Authoritative Dependencies",
  "Action 425 Approval Summary",
  "Action 426 Freeze Summary",
  "Explicit Non-Goals",
  "Protected-Source Audit",
  "Hash-Inventory Integrity Audit",
  "Freeze-Script Integrity Audit",
  "Scenario-Count Audit",
  "Scenario-ID/Order Audit",
  "Source-Classification Audit",
  "Configuration Audit",
  "Base-Confidence Audit",
  "Insight-Envelope Audit",
  "Status-Distribution Audit",
  "Warning-Distribution Audit",
  "Issue-Distribution Audit",
  "Individual-Delta Audit",
  "Attenuation Audit",
  "Aggregate-Delta Audit",
  "Positive-Cap Audit",
  "Negative-Cap Audit",
  "Upper-Clamp Audit",
  "Lower-Clamp Audit",
  "Zero-Adjustment Audit",
  "Duplicate-Warning Equivalence Audit",
  "Duplicate-Insight Audit",
  "Overlap-Resolution Audit",
  "Conflicting-Overlap Audit",
  "Included/Excluded Inventory Audit",
  "Calibration-ID Audit",
  "Identity-Hash Audit",
  "Result-Hash Audit",
  "Scenario-Summary-Hash Audit",
  "Independent-Canonicalization Audit",
  "Repeat-Freeze Audit",
  "Full-Inventory-Hash Audit",
  "Bounded-Metadata Audit",
  "Full-Data-Retention Audit",
  "Source-Mutation Audit",
  "Runtime/Persistence/Replay/External Audit",
  "Recommendation-Mutation Audit",
  "Shadow-Readiness Review",
  "Readiness Vocabulary",
  "Readiness Decision",
  "Passed Conditions",
  "Failed Conditions",
  "Unresolved Conditions",
  "Next Permitted Action",
];

const abs = (path) => join(root, path);
const exists = (path) => existsSync(abs(path));
const read = (path) => readFileSync(abs(path), "utf8");
const shaText = (value) => createHash("sha256").update(value, "utf8").digest("hex");

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

function stableHash(value) {
  return shaText(JSON.stringify(canonicalize(value)));
}

function collectFiles(path) {
  if (!exists(path)) return [];
  if (statSync(abs(path)).isFile()) return [path];
  return readdirSync(abs(path)).flatMap((entry) => collectFiles(join(path, entry))).sort();
}

function runJson(path, args = []) {
  return JSON.parse(execFileSync("node", [abs(path), ...args], { cwd: root, encoding: "utf8", timeout: 240000 }));
}

function exactObject(actual, expected) {
  return JSON.stringify(Object.fromEntries(Object.entries(actual ?? {}).sort())) ===
    JSON.stringify(Object.fromEntries(Object.entries(expected).sort()));
}

function byId(scenarios, id) {
  return scenarios.find((scenario) => scenario.scenario_id === id);
}

function hashFiles(pathsToHash) {
  return Object.fromEntries(
    pathsToHash.map((path) => [
      path,
      exists(path)
        ? {
            sha256: shaText(read(path)),
            exists: true,
          }
        : {
            sha256: null,
            exists: false,
          },
    ]),
  );
}

const doc = exists(paths.doc) ? read(paths.doc) : "";
const action426FreezerBefore = exists(paths.action426Freezer) ? read(paths.action426Freezer) : "";
const protectedBefore = hashFiles(expectedProtectedSources);
const inventoryTextBefore = exists(paths.action426Inventory) ? read(paths.action426Inventory) : "";
const inventoryFileHashBefore = inventoryTextBefore ? shaText(inventoryTextBefore) : null;

const freezeOutput = exists(paths.action426Freezer)
  ? execFileSync("node", [abs(paths.action426Freezer)], { cwd: root, encoding: "utf8", timeout: 240000 })
  : "";

const protectedAfter = hashFiles(expectedProtectedSources);
const inventoryTextAfter = exists(paths.action426Inventory) ? read(paths.action426Inventory) : "";
const inventoryFileHashAfter = inventoryTextAfter ? shaText(inventoryTextAfter) : null;
const inventory = inventoryTextAfter ? JSON.parse(inventoryTextAfter) : null;
const scenarios = inventory?.scenarios ?? [];

const action425 = exists(paths.action425Verifier) ? runJson(paths.action425Verifier) : null;
const action426 = exists(paths.action426Verifier) ? runJson(paths.action426Verifier) : null;
const action309 = exists(paths.action309Guard) ? runJson(paths.action309Guard) : null;
const golden = exists(paths.goldenVerifier) ? runJson(paths.goldenVerifier) : null;

const sourceHashesUnchanged = Object.fromEntries(
  expectedProtectedSources.map((path) => [
    path,
    {
      before: protectedBefore[path]?.sha256 ?? null,
      after: protectedAfter[path]?.sha256 ?? null,
      unchanged: protectedBefore[path]?.sha256 === protectedAfter[path]?.sha256,
      exists: protectedAfter[path]?.exists === true,
    },
  ]),
);
const recomputedInventoryHash = inventory
  ? stableHash({ ...inventory, run_id: "canonical", full_inventory_sha256: null })
  : null;
const recomputedScenarioSummaries = Object.fromEntries(
  scenarios.map((scenario) => [
    scenario.scenario_id,
    stableHash({ ...scenario, scenario_summary_sha256: null }),
  ]),
);
const scenarioSummaryHashesMatch = scenarios.every(
  (scenario) => scenario.scenario_summary_sha256 === recomputedScenarioSummaries[scenario.scenario_id],
);
const baseConfidenceInventory = [...new Set(scenarios.map((scenario) => String(scenario.base_confidence.canonical_basis_points)))].sort();
const warningMembership = Object.fromEntries(
  Object.keys(expectedWarningDistribution).map((code) => [
    code,
    scenarios
      .filter((scenario) => scenario.warning_inventory.some((warning) => warning.code === code))
      .map((scenario) => scenario.scenario_id),
  ]),
);
const issueMembership = Object.fromEntries(
  Object.keys(expectedIssueDistribution).map((code) => [
    code,
    scenarios
      .filter((scenario) => scenario.issue_inventory.some((issue) => issue.code === code))
      .map((scenario) => scenario.scenario_id),
  ]),
);
const forbiddenArtifacts = [
  "scripts/action-427-static-confidence-calibration-shadow-run.mjs",
  "scripts/action-427-confidence-calibration-runner.mjs",
  "docs/action-427-static-confidence-calibration-execution-manifest.json",
  "docs/action-427-static-confidence-calibration-shadow-input-manifest.json",
  "app/api/action-427",
  "app/action-427",
  "app/api/confidence-calibration",
  "app/confidence-calibration",
].filter(exists);
const trackedAction427Evidence = [...collectFiles("docs"), ...collectFiles("scripts"), ...collectFiles("tests")]
  .filter((path) => /action-427/.test(path))
  .filter((path) => /shadow|execution-manifest|runner|provider|supabase|persistence|replay|feedback|recommendation|runtime/i.test(path))
  .filter((path) => ![paths.doc, paths.verifier, paths.test].includes(path));
const retainedPayloadText = JSON.stringify(inventory ?? {});
const metadataBoundaryForbiddenText = [
  "/Users/",
  ".env",
  "AUTOMATION_SECRET",
  "TWELVE",
  "SUPABASE",
  "TRADE_APP_PASSWORD",
  "production_payload",
  "context_payload",
  "outcome_payload",
].filter((needle) => retainedPayloadText.includes(needle));
const allWarningsDeduped = scenarios.every((scenario) =>
  scenario.insight_inventory.every((insight) =>
    JSON.stringify(insight.warning_codes_unique_sorted) === JSON.stringify([...new Set(insight.warning_codes_input)].sort())),
);
const issueSeverityMessageKeyRetained = scenarios
  .flatMap((scenario) => scenario.issue_inventory)
  .every((issue) => typeof issue.severity === "string" && typeof issue.messageKey === "string");
const noNegativeZero = scenarios.every((scenario) =>
  [
    scenario.pre_cap_aggregate_delta_basis_points,
    scenario.post_cap_aggregate_delta_basis_points,
    scenario.unclamped_confidence_basis_points,
    scenario.final_proposed_confidence_basis_points,
  ].every((value) => !Object.is(value, -0)),
);
const advisoryScenarios = scenarios.filter((scenario) => scenario.calibration_id !== null);
const blockedScenarios = scenarios.filter((scenario) => scenario.calibration_id === null);
const calibrationHashesValid = advisoryScenarios.every((scenario) =>
  /^confidence_calibration_v1:[a-f0-9]{24}$/.test(scenario.calibration_id) &&
  /^[a-f0-9]{64}$/.test(scenario.identity_sha256) &&
  scenario.identity_sha256 === scenario.independent_identity_sha256 &&
  scenario.calibration_id.endsWith(scenario.identity_sha256.slice(0, 24)),
);
const resultHashesValid = scenarios.every((scenario) =>
  /^[a-f0-9]{64}$/.test(scenario.canonical_result_sha256) &&
  /^[a-f0-9]{64}$/.test(scenario.scenario_summary_sha256));
const materialIdentityVariation = byId(scenarios, "cc425_01")?.identity_sha256 !== byId(scenarios, "cc425_02")?.identity_sha256 &&
  byId(scenarios, "cc425_28")?.identity_sha256 !== byId(scenarios, "cc425_29")?.identity_sha256;

const checks = {
  documentation_exists: exists(paths.doc),
  documentation_sections_complete: requiredDocSections.every((section) => doc.includes(`## ${section}`)),
  action425_healthy: action425?.verification_status === "passed" && action425?.approval_decision === "approved_with_conditions",
  action426_healthy: action426?.verification_status === "passed" &&
    action426?.full_inventory_sha256 === expectedInventoryHash &&
    action426?.repeat_freeze_identical === true,
  action309_guard_healthy: action309?.guard_status === "passed",
  golden_static_safety_healthy: golden?.verification_status === "passed",
  freeze_script_integrity: action426FreezerBefore.includes("const first = freezeOnce(\"first\")") &&
    action426FreezerBefore.includes("const second = freezeOnce(\"second\")") &&
    !action426FreezerBefore.includes("freezeOnce(\"third\")"),
  freeze_reproduced: freezeOutput.includes("\"freeze_status\": \"passed\"") &&
    freezeOutput.includes(`"full_inventory_sha256": "${expectedInventoryHash}"`) &&
    inventory?.full_inventory_sha256 === expectedInventoryHash,
  protected_sources_exist: Object.values(sourceHashesUnchanged).every((entry) => entry.exists),
  protected_sources_unchanged_after_rerun: Object.values(sourceHashesUnchanged).every((entry) => entry.unchanged),
  inventory_file_hash_stable_after_rerun: inventoryFileHashBefore === inventoryFileHashAfter,
  exact_45_scenarios: inventory?.scenario_count === 45 && scenarios.length === 45,
  exact_scenario_ids_and_order: JSON.stringify(inventory?.scenario_ids ?? []) === JSON.stringify(expectedIds) &&
    JSON.stringify(scenarios.map((scenario) => scenario.scenario_id)) === JSON.stringify(expectedIds),
  unique_scenario_ids: new Set(scenarios.map((scenario) => scenario.scenario_id)).size === 45,
  approved_source_classifications: scenarios.every((scenario) =>
    scenario.source_classification === "deterministic_test_local_confidence_calibration_insight_envelope"),
  static_nonproduction_declarations: inventory?.static_only === true &&
    inventory?.non_production === true &&
    inventory?.non_authoritative === true &&
    inventory?.non_learning === true &&
    inventory?.no_persistence === true &&
    inventory?.no_replay === true &&
    inventory?.no_runtime === true &&
    inventory?.no_feedback === true,
  configuration_exact: inventory?.configuration?.configuration_version === "confidence_calibration_config_v1" &&
    inventory?.configuration?.direction_delta_table?.supportive_strong === 200 &&
    inventory?.configuration?.direction_delta_table?.supportive_moderate === 100 &&
    inventory?.configuration?.direction_delta_table?.supportive_weak === 50 &&
    inventory?.configuration?.direction_delta_table?.neutral === 0 &&
    inventory?.configuration?.direction_delta_table?.mixed === 0 &&
    inventory?.configuration?.direction_delta_table?.adverse_weak === -100 &&
    inventory?.configuration?.direction_delta_table?.adverse_moderate === -200 &&
    inventory?.configuration?.direction_delta_table?.adverse_strong === -300 &&
    inventory?.configuration?.combined_positive_cap_basis_points === 400 &&
    inventory?.configuration?.combined_negative_cap_basis_points === -600 &&
    inventory?.configuration?.rounding_mode === "round_half_away_from_zero",
  base_confidence_inventory: JSON.stringify(baseConfidenceInventory) === JSON.stringify(expectedBaseConfidenceInventory),
  insight_envelope_inventory_bounded: scenarios.every((scenario) =>
    scenario.insight_inventory.every((insight) =>
      typeof insight.insight_id === "string" &&
      (/^[a-f0-9]{64}$/.test(insight.insight_sha256) || insight.insight_sha256 === "invalid_lineage_hash") &&
      insight.static_only === true &&
      insight.non_authoritative === true &&
      insight.no_persistence === true &&
      insight.no_replay === true &&
      insight.no_runtime === true &&
      insight.no_feedback === true)),
  status_distribution_exact: exactObject(inventory?.status_distribution, expectedStatusDistribution) &&
    scenarios.length === Object.values(inventory?.status_distribution ?? {}).reduce((sum, count) => sum + count, 0),
  warning_distribution_exact: exactObject(inventory?.warning_distribution, expectedWarningDistribution),
  warning_membership_exact: JSON.stringify(warningMembership) === JSON.stringify({
    duplicate_mapper_row_identity: ["cc425_09", "cc425_11", "cc425_12", "cc425_13"],
    metric_value_unavailable: ["cc425_10", "cc425_11", "cc425_13"],
    duplicate_insight_deduped: ["cc425_23"],
    overlapping_insight_excluded: ["cc425_24", "cc425_25", "cc425_26"],
    confidence_clamped_to_bounds: ["cc425_29", "cc425_31"],
  }),
  warning_order_and_dedupe: allWarningsDeduped &&
    JSON.stringify(byId(scenarios, "cc425_13")?.warning_inventory.map((warning) => warning.code)) ===
      JSON.stringify(["duplicate_mapper_row_identity", "metric_value_unavailable"]),
  issue_distribution_exact: exactObject(inventory?.issue_distribution, expectedIssueDistribution),
  issue_membership_exact: JSON.stringify(issueMembership) === JSON.stringify({
    warning_status_contradiction: ["cc425_14", "cc425_15"],
    overlapping_evidence_conflict: ["cc425_27"],
    ineligible_pattern_discovery_status: ["cc425_34"],
    invalid_lineage: ["cc425_35"],
    future_leakage: ["cc425_36"],
    invalid_insight_structure: ["cc425_37"],
    invalid_configuration_shape: ["cc425_38"],
    invalid_base_confidence: ["cc425_39", "cc425_40", "cc425_41", "cc425_42", "cc425_43", "cc425_44"],
    insufficient_eligible_evidence: ["cc425_45"],
  }),
  issue_code_path_inventory: blockedScenarios.every((scenario) =>
    scenario.issue_inventory.every((issue) => typeof issue.code === "string" && issue.path.startsWith("/"))),
  delta_table_exact: byId(scenarios, "cc425_01")?.individual_deltas_basis_points[0]?.base_delta_basis_points === 200 &&
    byId(scenarios, "cc425_02")?.individual_deltas_basis_points[0]?.base_delta_basis_points === 100 &&
    byId(scenarios, "cc425_03")?.individual_deltas_basis_points[0]?.base_delta_basis_points === 50 &&
    byId(scenarios, "cc425_04")?.post_cap_aggregate_delta_basis_points === 0 &&
    byId(scenarios, "cc425_05")?.post_cap_aggregate_delta_basis_points === 0 &&
    byId(scenarios, "cc425_06")?.individual_deltas_basis_points[0]?.base_delta_basis_points === -100 &&
    byId(scenarios, "cc425_07")?.individual_deltas_basis_points[0]?.base_delta_basis_points === -200 &&
    byId(scenarios, "cc425_08")?.individual_deltas_basis_points[0]?.base_delta_basis_points === -300,
  attenuation_exact: byId(scenarios, "cc425_09")?.post_cap_aggregate_delta_basis_points === 100 &&
    byId(scenarios, "cc425_10")?.post_cap_aggregate_delta_basis_points === 100 &&
    byId(scenarios, "cc425_11")?.post_cap_aggregate_delta_basis_points === 50 &&
    byId(scenarios, "cc425_12")?.post_cap_aggregate_delta_basis_points === 100 &&
    byId(scenarios, "cc425_13")?.post_cap_aggregate_delta_basis_points === 50 &&
    byId(scenarios, "cc425_14")?.status === "blocked_invalid_input" &&
    byId(scenarios, "cc425_15")?.status === "blocked_invalid_input" &&
    noNegativeZero,
  aggregate_caps_exact: byId(scenarios, "cc425_16")?.post_cap_aggregate_delta_basis_points === 400 &&
    byId(scenarios, "cc425_17")?.post_cap_aggregate_delta_basis_points === -600 &&
    byId(scenarios, "cc425_18")?.pre_cap_aggregate_delta_basis_points === 600 &&
    byId(scenarios, "cc425_18")?.post_cap_aggregate_delta_basis_points === 400 &&
    byId(scenarios, "cc425_19")?.pre_cap_aggregate_delta_basis_points === -900 &&
    byId(scenarios, "cc425_19")?.post_cap_aggregate_delta_basis_points === -600,
  confidence_bounds_clamps_exact: byId(scenarios, "cc425_28")?.final_proposed_confidence_basis_points === 10000 &&
    byId(scenarios, "cc425_28")?.clamping_state?.clamped === false &&
    byId(scenarios, "cc425_29")?.unclamped_confidence_basis_points === 10100 &&
    byId(scenarios, "cc425_29")?.final_proposed_confidence_basis_points === 10000 &&
    byId(scenarios, "cc425_29")?.clamping_state?.warning_code === "confidence_clamped_to_bounds" &&
    byId(scenarios, "cc425_30")?.final_proposed_confidence_basis_points === 0 &&
    byId(scenarios, "cc425_30")?.clamping_state?.clamped === false &&
    byId(scenarios, "cc425_31")?.unclamped_confidence_basis_points === -50 &&
    byId(scenarios, "cc425_31")?.final_proposed_confidence_basis_points === 0 &&
    byId(scenarios, "cc425_31")?.clamping_state?.warning_code === "confidence_clamped_to_bounds",
  zero_adjustment_exact: ["cc425_04", "cc425_05", "cc425_20", "cc425_32", "cc425_33"].every((id) =>
    byId(scenarios, id)?.status === "no_adjustment" &&
    byId(scenarios, id)?.post_cap_aggregate_delta_basis_points === 0),
  duplicate_warning_equivalence: byId(scenarios, "cc425_12")?.insight_inventory[0]?.warning_codes_input.length === 2 &&
    byId(scenarios, "cc425_12")?.insight_inventory[0]?.warning_codes_unique_sorted.length === 1 &&
    byId(scenarios, "cc425_12")?.post_cap_aggregate_delta_basis_points === byId(scenarios, "cc425_09")?.post_cap_aggregate_delta_basis_points &&
    JSON.stringify(byId(scenarios, "cc425_12")?.warning_inventory) === JSON.stringify(byId(scenarios, "cc425_09")?.warning_inventory),
  duplicate_and_overlap_exact: byId(scenarios, "cc425_23")?.overlap_resolution?.deduplicated_count === 1 &&
    byId(scenarios, "cc425_24")?.overlap_resolution?.overlapping_excluded_count === 1 &&
    byId(scenarios, "cc425_25")?.overlap_resolution?.overlapping_excluded_count === 1 &&
    byId(scenarios, "cc425_26")?.overlap_resolution?.overlapping_excluded_count === 1 &&
    byId(scenarios, "cc425_27")?.overlap_resolution?.conflict_count === 1 &&
    byId(scenarios, "cc425_27")?.status === "blocked_overlapping_evidence",
  included_excluded_inventory_exact: scenarios.every((scenario) =>
    Array.isArray(scenario.included_insight_ids) &&
    Array.isArray(scenario.excluded_insight_ids) &&
    scenario.excluded_insight_ids.every((entry) => typeof entry.insight_id === "string" && typeof entry.reason === "string")),
  calibration_ids_and_identity_hashes: calibrationHashesValid && materialIdentityVariation,
  result_and_scenario_hashes: resultHashesValid && scenarioSummaryHashesMatch,
  independent_canonicalization: recomputedInventoryHash === expectedInventoryHash &&
    inventory?.full_inventory_sha256 === recomputedInventoryHash,
  repeat_freeze_exact: inventoryFileHashBefore === inventoryFileHashAfter &&
    action426?.repeat_freeze_identical === true,
  bounded_metadata_only: inventory?.bounded_metadata_only === true &&
    inventory?.full_insights_retained === false &&
    inventory?.full_pattern_discovery_results_retained === false &&
    inventory?.recommendation_objects_retained === false &&
    inventory?.shadow_runner_created === false &&
    inventory?.execution_manifest_created === false,
  full_data_absent: metadataBoundaryForbiddenText.length === 0,
  no_runtime_persistence_replay_external: inventory?.provider_call_executed === false &&
    inventory?.supabase_write_executed === false &&
    inventory?.calibration_shadow_executed === false &&
    inventory?.no_effect_flags?.provider_call_executed === false &&
    inventory?.no_effect_flags?.provider_call_attempted === false &&
    inventory?.no_effect_flags?.supabase_read_executed === false &&
    inventory?.no_effect_flags?.supabase_write_executed === false &&
    inventory?.no_effect_flags?.persistence_executed === false &&
    inventory?.no_effect_flags?.replay_executed === false &&
    inventory?.no_effect_flags?.runtime_integration_executed === false &&
    inventory?.no_effect_flags?.feedback_executed === false,
  no_runner_manifest_shadow_artifacts: forbiddenArtifacts.length === 0 && trackedAction427Evidence.length === 0,
  no_recommendation_or_scanner_mutation: inventory?.recommendation_mutated === false &&
    inventory?.no_effect_flags?.recommendation_mutation_executed === false &&
    inventory?.no_effect_flags?.scanner_behavior_changed === false &&
    inventory?.no_effect_flags?.live_ranking_changed === false,
  runtime_preview_paused: inventory?.runtime_preview_status === "runtime_preview_waiting_for_operator_inputs" &&
    inventory?.no_effect_flags?.runtime_preview_advanced === false,
  readiness_vocabulary_exact: doc.includes("ready") && doc.includes("ready_with_conditions") && doc.includes("blocked"),
  readiness_decision_documented: doc.includes("Readiness decision: ready_with_conditions"),
  next_action_documented: doc.includes("Action 428"),
};

const unresolvedConditions = [
  !issueSeverityMessageKeyRetained
    ? "issue_severity_and_messageKey_not_retained_in_action_426_bounded_inventory"
    : null,
].filter(Boolean);
const failedChecks = Object.entries(checks).filter(([, passed]) => !passed).map(([name]) => name);
const readinessDecision = failedChecks.length > 0
  ? "blocked"
  : unresolvedConditions.length > 0
    ? "ready_with_conditions"
    : "ready";

const report = {
  verification_status: failedChecks.length === 0 ? "passed" : "failed",
  readiness_decision: readinessDecision,
  readiness_vocabulary: ["ready", "ready_with_conditions", "blocked"],
  checks,
  failed_conditions: failedChecks,
  unresolved_conditions: unresolvedConditions,
  passed_conditions_count: Object.values(checks).filter(Boolean).length,
  failed_conditions_count: failedChecks.length,
  unresolved_conditions_count: unresolvedConditions.length,
  action426_reproduction: {
    freeze_status: freezeOutput.includes("\"freeze_status\": \"passed\"") ? "passed" : "failed",
    scenario_count: inventory?.scenario_count ?? 0,
    full_inventory_sha256: inventory?.full_inventory_sha256 ?? null,
    expected_full_inventory_sha256: expectedInventoryHash,
    inventory_file_hash_before: inventoryFileHashBefore,
    inventory_file_hash_after: inventoryFileHashAfter,
    inventory_file_hash_stable_after_rerun: inventoryFileHashBefore === inventoryFileHashAfter,
  },
  source_integrity: sourceHashesUnchanged,
  scenario_count: inventory?.scenario_count ?? 0,
  scenario_ids: inventory?.scenario_ids ?? [],
  status_distribution: inventory?.status_distribution ?? {},
  warning_distribution: inventory?.warning_distribution ?? {},
  warning_membership: warningMembership,
  issue_distribution: inventory?.issue_distribution ?? {},
  issue_membership: issueMembership,
  base_confidence_inventory: baseConfidenceInventory,
  recomputed_inventory_sha256: recomputedInventoryHash,
  scenario_summary_hashes_match: scenarioSummaryHashesMatch,
  bounded_metadata: {
    bounded_metadata_only: inventory?.bounded_metadata_only === true,
    full_insights_retained: inventory?.full_insights_retained === true,
    full_pattern_discovery_results_retained: inventory?.full_pattern_discovery_results_retained === true,
    recommendation_objects_retained: inventory?.recommendation_objects_retained === true,
    metadata_boundary_forbidden_text: metadataBoundaryForbiddenText,
  },
  isolation: {
    forbidden_artifacts_found: forbiddenArtifacts,
    tracked_action427_evidence_files: trackedAction427Evidence,
    provider_call_executed: inventory?.provider_call_executed === true,
    supabase_write_executed: inventory?.supabase_write_executed === true,
    replay_executed: inventory?.no_effect_flags?.replay_executed === true,
    calibration_shadow_executed: inventory?.calibration_shadow_executed === true,
    recommendation_mutated: inventory?.recommendation_mutated === true,
    scanner_behavior_changed: inventory?.no_effect_flags?.scanner_behavior_changed === true,
    live_ranking_changed: inventory?.no_effect_flags?.live_ranking_changed === true,
  },
  runtime_preview_status: inventory?.runtime_preview_status ?? "unknown",
  unrelated_work_classification: "action_427_docs_verifier_tests_and_minimal_guard_updates_only",
  recommended_next_action: "action_428_static_confidence_calibration_shadow_execution_approval_gate",
};

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
process.exitCode = failedChecks.length === 0 ? 0 : 1;
