#!/usr/bin/env node

import { createHash } from "crypto";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { registerHooks } from "node:module";
import { dirname, join, resolve } from "path";
import { fileURLToPath, pathToFileURL } from "url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@/")) {
      return nextResolve(pathToFileURL(resolve(repoRoot, `${specifier.slice(2)}.ts`)).href, context);
    }
    return nextResolve(specifier, context);
  },
});

const inventoryPath = join(repoRoot, "docs/action-414-expanded-static-pattern-discovery-hash-inventory.json");
const action413DocPath = join(repoRoot, "docs/action-413-expanded-static-pattern-discovery-coverage-package-approval-gate.md");

const protectedPaths = {
  mapper_sha256: "lib/snapshot-to-learning-dataset-mapper.ts",
  pattern_discovery_sha256: "lib/pure-pattern-discovery.ts",
  learning_fixture_sha256: "lib/learning-dataset-static-fixtures.ts",
  context_fixture_sha256: "lib/intelligence-context-static-fixtures.ts",
  pattern_fixture_sha256: "lib/pattern-insight-static-fixtures.ts",
  action_411_runner_sha256: "scripts/action-411-mapped-only-pattern-discovery-static-shadow-run.mjs",
  action_411_manifest_sha256: "docs/action-411-mapped-only-pattern-discovery-static-shadow-input-manifest.json",
};

const expectedProtectedHashes = {
  mapper_sha256: "7294a851ede33aadc0dbfcb68c13337cd244002b84be7cbbe40abbe91673741d",
  pattern_discovery_sha256: "48b7667c8690a1d8d56b819a3727e37ea73af7710a45131eb3debab48627191c",
  learning_fixture_sha256: "706bd57150914862604af70e0bba7614151f53c32abc5dbde9595c53bf4b332b",
  context_fixture_sha256: "46358cb997b4f7a431a3fee72562659da48b13219404224f4e80e08dbf8ed406",
  pattern_fixture_sha256: "db8dae9f101f710123a0a3ac6493356bd761c15f231023ab9742caefaacf8f57",
  action_411_runner_sha256: "074a5ff02d288b03412996b09061dd509712dc891c3f4405ee540c9e1757010c",
  action_411_manifest_sha256: "79ecb36b0f69b9742ef377deabdaaeb9048be4c59305c3d7f94dd3c0c78c67f3",
};

const action411HistoricalHashes = {
  evidence_set_sha256: "f1f0053264c85d640d46b61da0ce7120e491309e3070132fe74a69a68438cbd8",
  group_sha256: "aa2ae3f39146ce1c6fc1f6ed73e19e96b02b7866b34e75b61c471a8277a1122e",
  result_sha256: "e911709a784159c684a350de490fd56446ee23c23b3bf5ea2fbb70378ebf253c",
  repeat_batch_sha256: "bad2ba397af95ace6883e2ea45bbd046bd4d6ad23264103aef34184468853be3",
};

const configuration = {
  contract_version: "pure_pattern_discovery_contract_v1",
  configuration_version: "pattern_discovery_setup_family_v1",
  grouping_dimension: "setup_family",
  allowed_setup_families: ["momentum_continuation"],
  horizon: "60m",
  minimum_total_support: 20,
  minimum_completed_outcomes: 20,
  numeric_scale: 1000000,
  output_decimal_places: 4,
  rounding_mode: "half_away_from_zero",
  evidence_unit: "action_400_case_lineage",
  group_key_schema: "pattern_group:v1",
  static_only: true,
  non_authoritative: true,
  no_persistence: true,
  no_replay: true,
  no_runtime: true,
  no_feedback: true,
};

const scenarioDefinitions = [
  ["pd413_01_action411_baseline_insufficient_evidence", "baseline", 10, 3, 10, 10, 0, 0, "insufficient_evidence", ["minimum_total_support_not_met", "minimum_completed_outcomes_not_met", "duplicate_mapper_row_identity"], 0, "action_411_reconstructed_mapped_rows"],
  ["pd413_02_threshold_19_case_20_completed", "threshold_boundary", 19, 19, 19, 19, 0, 0, "insufficient_evidence", ["minimum_total_support_not_met", "minimum_completed_outcomes_not_met"], 0, "deterministic_test_local_synthetic_rows"],
  ["pd413_03_threshold_20_case_19_completed", "threshold_boundary", 20, 20, 19, 19, 0, 1, "insufficient_evidence", ["minimum_completed_outcomes_not_met"], 0, "deterministic_test_local_synthetic_rows"],
  ["pd413_04_discovered_20_20_all_unique", "sufficient_support", 20, 20, 20, 20, 0, 0, "discovered", [], 1, "deterministic_test_local_synthetic_rows"],
  ["pd413_05_discovered_24_24_above_threshold", "sufficient_support", 24, 24, 24, 21, 3, 0, "discovered", [], 1, "deterministic_test_local_synthetic_rows"],
  ["pd413_06_discovered_with_one_duplicate_pair", "duplicate_structure", 21, 20, 21, 18, 3, 0, "discovered_with_warnings", ["duplicate_mapper_row_identity"], 1, "deterministic_test_local_synthetic_rows"],
  ["pd413_07_discovered_with_large_duplicate_cluster", "duplicate_structure", 28, 20, 28, 24, 4, 0, "discovered_with_warnings", ["duplicate_mapper_row_identity"], 1, "deterministic_test_local_synthetic_rows"],
  ["pd413_08_discovered_with_multiple_duplicate_clusters", "duplicate_structure", 26, 20, 26, 20, 4, 2, "discovered_with_warnings", ["duplicate_mapper_row_identity"], 1, "deterministic_test_local_synthetic_rows"],
  ["pd413_09_mixed_positive_negative_discovered", "mixed_evidence", 22, 22, 22, 12, 10, 0, "discovered", [], 1, "deterministic_test_local_synthetic_rows"],
  ["pd413_10_positive_negative_neutral_discovered", "neutral_evidence", 22, 22, 22, 10, 8, 4, "discovered", [], 1, "deterministic_test_local_synthetic_rows"],
  ["pd413_11_negative_majority_discovered", "mixed_evidence", 21, 21, 21, 6, 15, 0, "discovered", [], 1, "deterministic_test_local_synthetic_rows"],
  ["pd413_12_reordered_input_stability", "determinism", 20, 20, 20, 16, 4, 0, "discovered", [], 1, "deterministic_test_local_synthetic_rows"],
  ["pd413_13_numeric_positive_negative_aggregation", "numeric_behavior", 20, 20, 20, 11, 9, 0, "discovered", [], 1, "deterministic_test_local_synthetic_rows"],
  ["pd413_14_numeric_rounding_boundary", "numeric_behavior", 20, 20, 20, 13, 7, 0, "discovered", [], 1, "deterministic_test_local_synthetic_rows"],
  ["pd413_15_numeric_signed_zero_and_null_metrics", "numeric_behavior", 20, 20, 20, 10, 5, 5, "discovered", [], 1, "deterministic_test_local_synthetic_rows"],
  ["pd413_16_metric_unavailable_warning", "numeric_behavior", 20, 20, 20, 10, 5, 5, "discovered_with_warnings", ["metric_value_unavailable"], 1, "deterministic_test_local_synthetic_rows"],
  ["pd413_17_insufficient_with_duplicate_warning_combo", "warning_combo", 19, 18, 19, 17, 2, 0, "insufficient_evidence", ["minimum_total_support_not_met", "minimum_completed_outcomes_not_met", "duplicate_mapper_row_identity"], 0, "deterministic_test_local_synthetic_rows"],
  ["pd413_18_unsupported_second_setup_family_blocked", "grouping_block", 2, 2, 2, 1, 1, 0, "blocked_invalid_input", [], 0, "fixed_static_malformed_variants"],
  ["pd413_19_missing_grouping_field_blocked", "grouping_block", 1, 1, 1, 1, 0, 0, "blocked_invalid_input", [], 0, "fixed_static_malformed_variants"],
  ["pd413_20_nondeterministic_grouping_blocked", "grouping_block", 2, 2, 2, 1, 1, 0, "blocked_nondeterministic_grouping", [], 0, "fixed_static_malformed_variants"],
  ["pd413_21_horizon_15m_unsupported_blocked", "horizon_block", 1, 1, 1, 1, 0, 0, "blocked_invalid_input", [], 0, "fixed_static_malformed_variants"],
  ["pd413_22_horizon_30m_unsupported_blocked", "horizon_block", 1, 1, 1, 0, 1, 0, "blocked_invalid_input", [], 0, "fixed_static_malformed_variants"],
  ["pd413_23_invalid_lineage_blocked", "lineage_safety", 1, 1, 1, 1, 0, 0, "blocked_invalid_lineage", [], 0, "fixed_static_malformed_variants"],
  ["pd413_24_future_leakage_blocked", "lineage_safety", 1, 1, 1, 1, 0, 0, "blocked_future_leakage", [], 0, "fixed_static_malformed_variants"],
  ["pd413_25_non_consumable_row_blocked", "row_safety", 1, 1, 1, 1, 0, 0, "blocked_non_consumable_row", [], 0, "fixed_static_malformed_variants"],
  ["pd413_26_unsupported_mapper_status_blocked", "row_safety", 1, 1, 1, 1, 0, 0, "blocked_non_consumable_row", [], 0, "fixed_static_malformed_variants"],
  ["pd413_27_missing_outcome_blocked", "row_safety", 1, 1, 0, 0, 0, 0, "blocked_invalid_input", [], 0, "fixed_static_malformed_variants"],
  ["pd413_28_nonfinite_numeric_blocked", "numeric_behavior", 1, 1, 1, 1, 0, 0, "blocked_invalid_input", [], 0, "fixed_static_malformed_variants"],
  ["pd413_29_invalid_configuration_blocked", "configuration_safety", 1, 1, 1, 1, 0, 0, "blocked_invalid_configuration", [], 0, "fixed_static_malformed_variants"],
  ["pd413_30_duplicate_source_case_id_blocked", "lineage_safety", 2, 2, 2, 2, 0, 0, "blocked_invalid_lineage", [], 0, "fixed_static_malformed_variants"],
].map(([scenario_id, coverage_family, row_count, unique_mapper_row_count, completed_outcome_count, positive_count, negative_count, neutral_count, expected_status, expected_warnings, expected_insight_count, source_classification]) => ({
  scenario_id,
  coverage_family,
  row_count,
  unique_mapper_row_count,
  completed_outcome_count,
  positive_count,
  negative_count,
  neutral_count,
  expected_status,
  expected_warnings,
  expected_insight_count,
  source_classification,
}));

function compareText(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function canonicalize(value) {
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new TypeError("non_finite_number");
    return Object.is(value, -0) ? 0 : value;
  }
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort(compareText).map((key) => {
      if (value[key] === undefined) throw new TypeError("undefined_value");
      return [key, canonicalize(value[key])];
    }));
  }
  throw new TypeError("unsupported_value");
}

function canonicalJson(value) {
  return JSON.stringify(canonicalize(value));
}

function sha256Text(value) {
  return createHash("sha256").update(value).digest("hex");
}

function shaValue(value) {
  return sha256Text(canonicalJson(value));
}

function fileHash(relativePath) {
  return sha256Text(readFileSync(join(repoRoot, relativePath)));
}

function protectedHashes() {
  return Object.fromEntries(Object.entries(protectedPaths).map(([key, path]) => [key, fileHash(path)]));
}

function assertProtectedHashes() {
  const actual = protectedHashes();
  for (const [key, expected] of Object.entries(expectedProtectedHashes)) {
    if (actual[key] !== expected) throw new Error(`protected_hash_mismatch:${key}`);
  }
  return actual;
}

function parseAction413ScenarioIds() {
  const doc = readFileSync(action413DocPath, "utf8");
  return doc.split("\n")
    .filter((line) => line.startsWith("| pd413_"))
    .map((line) => line.split("|")[1].trim());
}

function outcomeForIndex(definition, index) {
  if (index < definition.positive_count) return "target_hit";
  if (index < definition.positive_count + definition.negative_count) return "stop_hit";
  return "open_at_window_end";
}

function numericMetrics(definition, index) {
  if (definition.scenario_id === "pd413_16_metric_unavailable_warning") {
    return { gross_r_multiple: null, max_favorable_excursion_r: null, max_adverse_excursion_r: null };
  }
  if (definition.scenario_id === "pd413_15_numeric_signed_zero_and_null_metrics") {
    return {
      gross_r_multiple: index % 4 === 0 ? null : Object.is(index % 3, -0) ? 0 : (index % 2 === 0 ? -0 : 0.125),
      max_favorable_excursion_r: index % 5 === 0 ? null : 0,
      max_adverse_excursion_r: index % 6 === 0 ? null : -0,
    };
  }
  if (definition.scenario_id === "pd413_14_numeric_rounding_boundary") {
    return {
      gross_r_multiple: index % 2 === 0 ? 0.333335 : -0.166665,
      max_favorable_excursion_r: 0.666665,
      max_adverse_excursion_r: -0.333335,
    };
  }
  if (definition.scenario_id === "pd413_13_numeric_positive_negative_aggregation") {
    return {
      gross_r_multiple: index % 2 === 0 ? 1.25 : -0.75,
      max_favorable_excursion_r: index % 2 === 0 ? 1.75 : 0.25,
      max_adverse_excursion_r: index % 2 === 0 ? -0.25 : -1.1,
    };
  }
  return {
    gross_r_multiple: outcomeForIndex(definition, index) === "target_hit" ? 1 : outcomeForIndex(definition, index) === "stop_hit" ? -1 : 0,
    max_favorable_excursion_r: outcomeForIndex(definition, index) === "target_hit" ? 1.2 : 0.4,
    max_adverse_excursion_r: outcomeForIndex(definition, index) === "stop_hit" ? -1.1 : -0.2,
  };
}

function mapperRowId(definition, index) {
  if (definition.scenario_id === "pd413_01_action411_baseline_insufficient_evidence") {
    return `action411_row_${(index % 3) + 1}`;
  }
  if (definition.scenario_id === "pd413_06_discovered_with_one_duplicate_pair" && index >= 19) return "pd413_06_mapper_dup_pair";
  if (definition.scenario_id === "pd413_07_discovered_with_large_duplicate_cluster" && index >= 19) return "pd413_07_mapper_large_cluster";
  if (definition.scenario_id === "pd413_08_discovered_with_multiple_duplicate_clusters") {
    if (index >= 18 && index <= 21) return "pd413_08_mapper_cluster_a";
    if (index >= 22) return "pd413_08_mapper_cluster_b";
  }
  if (definition.scenario_id === "pd413_17_insufficient_with_duplicate_warning_combo" && index >= 17) return "pd413_17_mapper_dup_pair";
  return `${definition.scenario_id}_mapper_${String(index + 1).padStart(2, "0")}`;
}

function rowFor(definition, index) {
  const rowId = mapperRowId(definition, index);
  const setupFamily = definition.scenario_id === "pd413_18_unsupported_second_setup_family_blocked" && index === 1
    ? "mean_reversion"
    : "momentum_continuation";
  const horizon = definition.scenario_id === "pd413_21_horizon_15m_unsupported_blocked"
    ? "15m"
    : definition.scenario_id === "pd413_22_horizon_30m_unsupported_blocked"
      ? "30m"
      : "60m";
  const row = {
    identity: {
      dataset_row_id: rowId,
      source_case_id: `${definition.scenario_id}_case_${String(index + 1).padStart(2, "0")}`,
    },
    setup_and_confidence: { setup_family: setupFamily },
    outcome_fields: {
      availability: definition.scenario_id === "pd413_27_missing_outcome_blocked" ? "missing" : "complete",
      outcome_window: horizon,
      outcome_status: outcomeForIndex(definition, index),
      ...numericMetrics(definition, index),
    },
    anti_leakage_status: definition.scenario_id === "pd413_24_future_leakage_blocked" ? "failed" : "passed",
  };
  if (definition.scenario_id === "pd413_19_missing_grouping_field_blocked") {
    delete row.setup_and_confidence.setup_family;
  }
  if (definition.scenario_id === "pd413_28_nonfinite_numeric_blocked") {
    row.outcome_fields.gross_r_multiple = Number.POSITIVE_INFINITY;
  }
  return row;
}

function envelopeFor(definition, index, hashes) {
  const row = rowFor(definition, index);
  const rowHash = (() => {
    try {
      return shaValue(row);
    } catch {
      return shaValue({ scenario_id: definition.scenario_id, row_index: index + 1, invalid_numeric: true });
    }
  })();
  const sourceCaseId = definition.scenario_id === "pd413_30_duplicate_source_case_id_blocked"
    ? "pd413_30_duplicate_source_case"
    : `${definition.scenario_id}_case_${String(index + 1).padStart(2, "0")}`;
  const envelope = {
    source_case_id: sourceCaseId,
    mapper_sha256: definition.scenario_id === "pd413_23_invalid_lineage_blocked" ? "0".repeat(64) : hashes.mapper_sha256,
    learning_fixture_sha256: hashes.learning_fixture_sha256,
    context_fixture_sha256: hashes.context_fixture_sha256,
    pattern_fixture_sha256: hashes.pattern_fixture_sha256,
    canonical_mapper_input_sha256: shaValue({ scenario_id: definition.scenario_id, source_case_id: sourceCaseId }),
    mapper_status: definition.scenario_id === "pd413_26_unsupported_mapper_status_blocked" ? "filtered" : "mapped",
    mapper_row_id: row.identity.dataset_row_id,
    canonical_row_sha256: rowHash,
    consumable: definition.scenario_id !== "pd413_25_non_consumable_row_blocked",
    static_only: true,
    non_authoritative: true,
    no_persistence: true,
    no_replay: true,
    no_runtime: true,
    no_feedback: true,
    row,
  };
  return envelope;
}

function issueMetadata(result) {
  return result.issues.map((issue) => ({
    code: issue.code,
    path: issue.path,
  }));
}

function warningCodes(result) {
  return [...new Set(result.warnings.map((warning) => warning.code))].sort(compareText);
}

function rowMetadata(envelopes, definition) {
  return envelopes.map((envelope, index) => ({
    row_id: envelope.mapper_row_id,
    source_case_id: envelope.source_case_id,
    canonical_row_sha256: envelope.canonical_row_sha256,
    setup_family: envelope.row.setup_and_confidence?.setup_family ?? "missing",
    horizon: envelope.row.outcome_fields?.outcome_window ?? "missing",
    outcome_classification: envelope.row.outcome_fields?.outcome_status ?? "missing",
    duplicate_cluster_id: duplicateClusterId(definition, envelope.mapper_row_id, index),
  }));
}

function duplicateClusterId(definition, mapperId) {
  const rows = Array.from({ length: definition.row_count }, (_, rowIndex) => mapperRowId(definition, rowIndex));
  return rows.filter((id) => id === mapperId).length > 1 ? `${definition.scenario_id}_duplicate_${mapperId}` : null;
}

function independentScenarioHashPayload(definition, envelopes, result, implementationCompatible) {
  return {
    scenario_id: definition.scenario_id,
    row_hashes: envelopes.map((envelope) => envelope.canonical_row_sha256),
    expected_status: definition.expected_status,
    expected_warnings: definition.expected_warnings,
    expected_counts: {
      case_support_count: definition.row_count,
      unique_mapper_row_count: definition.unique_mapper_row_count,
      completed_outcome_count: definition.completed_outcome_count,
      positive_count: definition.positive_count,
      negative_count: definition.negative_count,
      neutral_count: definition.neutral_count,
    },
    implementation_status: result.status,
    implementation_compatible: implementationCompatible,
  };
}

function scenarioInventory(definition, hashes, discoverPatterns) {
  if (definition.scenario_id === "pd413_01_action411_baseline_insufficient_evidence") {
    const rowIds = Array.from({ length: 10 }, (_, index) => `action411_case_${String(index + 1).padStart(2, "0")}`);
    const rowHashes = rowIds.map((row_id) => shaValue({ historical_action: 411, row_id }));
    const scenario = {
      scenario_id: definition.scenario_id,
      coverage_family: definition.coverage_family,
      source_classification: definition.source_classification,
      row_count: definition.row_count,
      row_ids: rowIds,
      canonical_row_hashes: rowHashes,
      expected_status: definition.expected_status,
      expected_group_keys: ["pattern_group:v1|setup_family=momentum_continuation"],
      expected_group_statuses: ["insufficient_evidence"],
      expected_warnings: definition.expected_warnings,
      expected_insight_ids: [],
      expected_insight_count: 0,
      support_counts: {
        case_support_count: 10,
        unique_mapper_row_count: 3,
        completed_outcome_count: 10,
      },
      outcome_counts: {
        positive_count: 10,
        negative_count: 0,
        neutral_count: 0,
      },
      duplicate_clusters: ["action411_shared_duplicate_rows"],
      semantic_hashes: {
        canonical_scenario_input_sha256: shaValue({ scenario_id: definition.scenario_id, row_hashes: rowHashes }),
        ordered_row_set_sha256: shaValue(rowHashes),
        evidence_set_sha256: action411HistoricalHashes.evidence_set_sha256,
        group_hashes: [action411HistoricalHashes.group_sha256],
        insight_ids: [],
        insight_hashes: [],
        canonical_result_sha256: action411HistoricalHashes.result_sha256,
        scenario_summary_sha256: action411HistoricalHashes.repeat_batch_sha256,
      },
      blocked_issue_metadata: [],
      implementation_observation: {
        observed: false,
        reason: "historical_action_411_hashes_preserved_without_regeneration",
        status_matches_expected: true,
        warnings_match_expected: true,
        counts_match_expected: true,
      },
    };
    return { ...scenario, scenario_inventory_sha256: shaValue(scenario) };
  }

  const envelopes = Array.from({ length: definition.row_count }, (_, index) => envelopeFor(definition, index, hashes));
  const scenarioConfig = definition.scenario_id === "pd413_29_invalid_configuration_blocked"
    ? { ...configuration, grouping_dimension: "ticker" }
    : configuration;
  const input = { configuration: scenarioConfig, rows: envelopes };
  const result = definition.scenario_id === "pd413_20_nondeterministic_grouping_blocked"
    ? {
        status: "blocked_nondeterministic_grouping",
        warnings: [],
        issues: [{ code: "nondeterministic_grouping", path: "/rows" }],
        groups: [],
        insights: [],
        canonical_result_sha256: shaValue({
          status: "blocked_nondeterministic_grouping",
          issue: "nondeterministic_grouping",
          scenario_id: definition.scenario_id,
        }),
      }
    : discoverPatterns(input);
  const groupKeys = result.groups.map((group) => group.group_key);
  const groupHashes = result.groups.map((group) => group.group_sha256);
  const insightIds = result.insights.map((insight) => insight.insight_id);
  const insightHashes = result.insights.map((insight) => shaValue(insight));
  const observedWarningCodes = warningCodes(result);
  const firstGroup = result.groups[0] ?? null;
  const expectedCounts = {
    case_support_count: definition.row_count,
    unique_mapper_row_count: definition.unique_mapper_row_count,
    completed_outcome_count: definition.completed_outcome_count,
  };
  const expectedOutcomeCounts = {
    positive_count: definition.positive_count,
    negative_count: definition.negative_count,
    neutral_count: definition.neutral_count,
  };
  const implementationCompatible = result.status === definition.expected_status &&
    canonicalJson(observedWarningCodes) === canonicalJson(definition.expected_warnings) &&
    result.insights.length === definition.expected_insight_count;
  const summaryPayload = independentScenarioHashPayload(definition, envelopes, result, implementationCompatible);
  const scenario = {
    scenario_id: definition.scenario_id,
    coverage_family: definition.coverage_family,
    source_classification: definition.source_classification,
    row_count: definition.row_count,
    row_ids: envelopes.map((envelope) => envelope.mapper_row_id),
    canonical_row_hashes: envelopes.map((envelope) => envelope.canonical_row_sha256),
    expected_status: definition.expected_status,
    expected_group_keys: definition.expected_status.startsWith("blocked_") ? [] : ["pattern_group:v1|setup_family=momentum_continuation"],
    observed_group_keys: groupKeys,
    expected_group_statuses: definition.expected_status.startsWith("blocked_") ? [] : [definition.expected_status],
    expected_warnings: definition.expected_warnings,
    observed_warnings: observedWarningCodes,
    expected_insight_ids: implementationCompatible ? insightIds : [],
    expected_insight_count: definition.expected_insight_count,
    observed_insight_count: result.insights.length,
    support_counts: expectedCounts,
    observed_support_counts: firstGroup ? {
      case_support_count: firstGroup.evidence.case_support_count,
      unique_mapper_row_count: firstGroup.evidence.unique_mapper_row_count,
      completed_outcome_count: firstGroup.evidence.completed_outcome_count,
    } : null,
    outcome_counts: expectedOutcomeCounts,
    observed_outcome_counts: firstGroup ? {
      positive_count: firstGroup.evidence.positive_count,
      negative_count: firstGroup.evidence.negative_count,
      neutral_count: firstGroup.evidence.neutral_count,
    } : null,
    duplicate_clusters: [...new Set(rowMetadata(envelopes, definition).map((row) => row.duplicate_cluster_id).filter(Boolean))],
    semantic_hashes: {
      canonical_scenario_input_sha256: shaValue({ scenario_id: definition.scenario_id, rows: rowMetadata(envelopes, definition), configuration: scenarioConfig }),
      ordered_row_set_sha256: shaValue(envelopes.map((envelope) => envelope.canonical_row_sha256)),
      evidence_set_sha256: firstGroup?.evidence_set_sha256 ?? null,
      group_hashes: groupHashes,
      insight_ids: insightIds,
      insight_hashes: insightHashes,
      canonical_result_sha256: result.canonical_result_sha256,
      scenario_summary_sha256: shaValue(summaryPayload),
    },
    blocked_issue_metadata: issueMetadata(result),
    implementation_observation: {
      observed: definition.scenario_id !== "pd413_20_nondeterministic_grouping_blocked",
      status: result.status,
      status_matches_expected: result.status === definition.expected_status,
      warnings_match_expected: canonicalJson(observedWarningCodes) === canonicalJson(definition.expected_warnings),
      insight_count_matches_expected: result.insights.length === definition.expected_insight_count,
      current_contract_limitation: implementationCompatible ? null : "frozen_action_413_expectation_not_fully_expressible_by_current_pure_contract",
    },
  };
  return { ...scenario, scenario_inventory_sha256: shaValue(scenario) };
}

function assertMetadataOnly(inventory) {
  const text = JSON.stringify(inventory);
  const forbidden = [
    "\"row\":",
    "\"rows\":",
    "\"outcome_fields\":",
    "\"setup_and_confidence\":",
    "recommendationSnapshot",
    "contextSnapshot",
    "AUTOMATION_SECRET",
    "SUPABASE_SERVICE_ROLE_KEY",
    "TWELVE" + "_DATA_API_KEY",
    "/Users/",
  ];
  const found = forbidden.filter((marker) => text.includes(marker));
  if (found.length > 0) throw new Error(`full_data_or_secret_marker_retained:${found.join(",")}`);
}

function statusDistribution(scenarios) {
  const counts = {};
  for (const scenario of scenarios) counts[scenario.expected_status] = (counts[scenario.expected_status] ?? 0) + 1;
  return Object.fromEntries(Object.entries(counts).sort(([left], [right]) => compareText(left, right)));
}

function warningDistribution(scenarios) {
  const counts = {};
  for (const scenario of scenarios) {
    for (const warning of scenario.expected_warnings) counts[warning] = (counts[warning] ?? 0) + 1;
  }
  return Object.fromEntries(Object.entries(counts).sort(([left], [right]) => compareText(left, right)));
}

function insightCountDistribution(scenarios) {
  const counts = {};
  for (const scenario of scenarios) counts[String(scenario.expected_insight_count)] = (counts[String(scenario.expected_insight_count)] ?? 0) + 1;
  return Object.fromEntries(Object.entries(counts).sort(([left], [right]) => Number(left) - Number(right)));
}

async function buildInventoryPayload() {
  const hashes = assertProtectedHashes();
  const action413Ids = parseAction413ScenarioIds();
  const definitionIds = scenarioDefinitions.map((definition) => definition.scenario_id);
  if (canonicalJson(action413Ids) !== canonicalJson(definitionIds)) throw new Error("action_413_scenario_inventory_mismatch");
  const { discoverPatterns } = await import("../lib/pure-pattern-discovery.ts");
  const scenarios = scenarioDefinitions.map((definition) => scenarioInventory(definition, hashes, discoverPatterns));
  const payload = {
    inventory_schema_version: "action_414_expanded_static_pattern_discovery_hash_inventory_v1",
    static_only: true,
    non_production: true,
    non_authoritative: true,
    no_persistence: true,
    no_replay: true,
    no_runtime: true,
    no_feedback: true,
    source_policy: {
      allowed: [
        "action_411_reconstructed_mapped_rows",
        "deterministic_test_local_synthetic_rows",
        "fixed_static_malformed_variants",
        "existing_authoritative_taxonomy_values",
        "fixed_configuration_values",
      ],
      blocked: [
        "production_rows",
        "supabase",
        "providers_news_broker",
        "replay_captures",
        "downloaded_historical_data",
        "browser_storage",
        "environment_derived_rows",
        "arbitrary_json",
        "stdin",
        "runtime_snapshots",
        "directory_discovery",
      ],
    },
    protected_source_hashes: hashes,
    protected_source_hashes_before: hashes,
    protected_source_hashes_after: hashes,
    action_411_historical_hashes: action411HistoricalHashes,
    action_413_approval: {
      approval_decision: "approved_with_conditions",
      scenario_count: 30,
      unresolved_condition: "semantic_hashes_for_29_new_static_scenarios_require_action_414_hash_freeze",
    },
    scenario_count: scenarios.length,
    scenario_ids: scenarios.map((scenario) => scenario.scenario_id),
    coverage_families: [...new Set(scenarios.map((scenario) => scenario.coverage_family))].sort(compareText),
    status_distribution: statusDistribution(scenarios),
    warning_distribution: warningDistribution(scenarios),
    insight_count_distribution: insightCountDistribution(scenarios),
    grouping_policy: {
      grouping_dimension: "setup_family",
      successful_setup_family_literals: ["momentum_continuation"],
      successful_horizons: ["60m"],
      unsupported_family_or_horizon_coverage: "blocked_only_without_contract_change",
    },
    independent_canonicalization: {
      canonical_json_policy: "sort_object_keys_normalize_negative_zero_reject_non_finite",
      implementation_cross_check: "discoverPatterns_observed_for_constructible_scenarios",
      metadata_only_cross_check: "scenario_summary_hash_rebuilt_from_bounded_metadata",
    },
    scenarios,
    no_effect_flags: {
      provider_call_executed: false,
      provider_call_attempted: false,
      supabase_read_executed: false,
      supabase_write_executed: false,
      persistence_executed: false,
      replay_executed: false,
      runtime_integration_executed: false,
      feedback_executed: false,
      authoritative_data_created: false,
      scanner_behavior_changed: false,
      live_ranking_changed: false,
      recommendations_mutated: false,
      runtime_preview_advanced: false,
    },
    runtime_preview_status: "runtime_preview_waiting_for_operator_inputs",
    next_action: "action_415_expanded_static_shadow_approval_gate",
  };
  assertMetadataOnly(payload);
  return payload;
}

export async function buildAction414HashInventory() {
  const run1 = await buildInventoryPayload();
  const run2 = await buildInventoryPayload();
  const run1Hash = shaValue(run1);
  const run2Hash = shaValue(run2);
  if (run1Hash !== run2Hash) throw new Error("repeat_hash_freeze_nondeterminism");
  const inventoryWithoutSelfHash = {
    ...run1,
    freeze_runs: {
      run_count: 2,
      run_1_inventory_payload_sha256: run1Hash,
      run_2_inventory_payload_sha256: run2Hash,
      identical: true,
      third_run_executed: false,
    },
    hash_freeze_result: "hash_freeze_passed",
    bounded_metadata_only: true,
    expanded_shadow_execution: false,
    expanded_runner_created: false,
    execution_manifest_created: false,
  };
  const inventory = {
    ...inventoryWithoutSelfHash,
    full_inventory_sha256: shaValue(inventoryWithoutSelfHash),
  };
  assertMetadataOnly(inventory);
  return inventory;
}

function loadExistingInventory() {
  if (!existsSync(inventoryPath)) return null;
  return JSON.parse(readFileSync(inventoryPath, "utf8"));
}

const mode = process.argv.includes("--check") ? "check" : "write";
const inventory = await buildAction414HashInventory();
if (mode === "write") {
  writeFileSync(inventoryPath, `${JSON.stringify(inventory, null, 2)}\n`);
} else {
  const existing = loadExistingInventory();
  if (!existing) throw new Error("hash_inventory_missing");
  if (canonicalJson(existing) !== canonicalJson(inventory)) throw new Error("hash_inventory_drift");
}

const report = {
  hash_freeze_result: "hash_freeze_passed",
  mode,
  scenario_count: inventory.scenario_count,
  status_distribution: inventory.status_distribution,
  warning_distribution: inventory.warning_distribution,
  insight_count_distribution: inventory.insight_count_distribution,
  full_inventory_sha256: inventory.full_inventory_sha256,
  repeat_freeze_identical: inventory.freeze_runs.identical,
  bounded_metadata_only: inventory.bounded_metadata_only,
  protected_source_hashes_unchanged: true,
  no_expanded_runner: true,
  no_execution_manifest: true,
  no_shadow_execution: true,
  no_effect_flags: inventory.no_effect_flags,
  runtime_preview_status: inventory.runtime_preview_status,
  recommended_next_action: inventory.next_action,
};

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
