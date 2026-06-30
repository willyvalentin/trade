import { expect, test } from "@playwright/test";

import {
  buildLearningAccelerationResearchSelection,
  clientUnavailableLearningAccelerationConfig,
  getLearningAccelerationConfig,
  learningAccelerationEnvValueCategory,
  shouldIncludeLearningAccelerationOutcomeSample,
} from "../../lib/learning-acceleration-mode";
import type { RealScannerCandidate } from "../../lib/real-scanner-candidate-generation";
import type {
  ScannerCandidateRankingResult,
  ScannerCandidateRankingSummary,
} from "../../lib/scanner-candidate-ranking";
import { buildSelectedCandidateBuildDiagnostic } from "../../lib/recommendation-build-diagnostics";

function candidate(
  ticker: string,
  overrides: Partial<RealScannerCandidate> = {},
): RealScannerCandidate {
  return {
    ticker,
    company_name: `${ticker} Corp`,
    sector: "Technology",
    tier: "valid",
    score: {
      value: 76,
      tier: "valid",
      reasons: ["valid but below live publish target"],
      warnings: [],
    },
    signals: [],
    warnings: [],
    data_source: "fresh",
    provider_source: "twelve_data",
    market_data_timestamp: "2026-06-29T14:00:00.000Z",
    stale: false,
    entry_low: 100,
    entry_high: 101,
    stop_loss: 98,
    target_1: 105,
    target_2: 108,
    risk_reward: 2,
    ...overrides,
  };
}

function ranking(
  tickers: string[],
  overrides: Partial<ScannerCandidateRankingSummary> = {},
): ScannerCandidateRankingSummary {
  const results = tickers.map((ticker, index): ScannerCandidateRankingResult => ({
    ticker,
    company_name: `${ticker} Corp`,
    rank: index + 1,
    selected: false,
    selection_bucket: "not_selected",
    rank_reason: "Valid research overflow.",
    source_contribution: "base_universe",
    score: {
      total_score: 76 - index,
      normalized_score: 76 - index,
      tier: "valid",
      components: [],
      warnings: [],
      gaps: [],
    },
  }));

  return {
    summary_version: "1.0",
    summary_kind: "scanner_candidate_ranking",
    generated_at: "2026-06-29T14:00:00.000Z",
    scan_window: "morning_momentum",
    candidates_ranked: results.length,
    selected_count: 0,
    target_min: 6,
    target_max: 10,
    target_status: "below_target",
    overflow_count: results.length,
    strong_count: 0,
    valid_count: results.length,
    experimental_count: 0,
    incomplete_count: 0,
    rejected_count: 0,
    average_score: 76,
    score_range: { min: 70, max: 76 },
    source_contribution: {
      base_universe: results.length,
      dynamic_mover: 0,
      fallback: 0,
      unknown: 0,
    },
    top_ranking_reasons: ["Valid research overflow."],
    top_penalty_reasons: [],
    warnings: [],
    results,
    selection: { selected_tickers: [], overflow_count: results.length, target_status: "below_target" },
    ...overrides,
  };
}

test("learning acceleration env diagnostics classify present true", () => {
  const mode = getLearningAccelerationConfig({
    env: {
      NODE_ENV: "production",
      TURE_LEARNING_ACCELERATION_ENABLED: "true",
    },
  });

  expect(mode).toMatchObject({
    learning_acceleration_enabled: true,
    learning_acceleration_enabled_source: "server_env",
    learning_acceleration_env_raw_present: true,
    learning_acceleration_env_raw_value_category: "true",
    learning_acceleration_env_raw_value_normalized: true,
    learning_acceleration_runtime_environment: "production",
  });
});

test("learning acceleration env diagnostics classify present false", () => {
  const mode = getLearningAccelerationConfig({
    env: {
      NODE_ENV: "production",
      TURE_LEARNING_ACCELERATION_ENABLED: "false",
    },
  });

  expect(mode).toMatchObject({
    learning_acceleration_enabled: false,
    learning_acceleration_enabled_source: "none",
    learning_acceleration_env_raw_present: true,
    learning_acceleration_env_raw_value_category: "false",
    learning_acceleration_env_raw_value_normalized: false,
  });
});

test("learning acceleration env diagnostics classify missing and empty", () => {
  const missing = getLearningAccelerationConfig({ env: {} });
  const empty = getLearningAccelerationConfig({
    env: { TURE_LEARNING_ACCELERATION_ENABLED: "  " },
  });

  expect(missing).toMatchObject({
    learning_acceleration_enabled: false,
    learning_acceleration_enabled_source: "none",
    learning_acceleration_env_raw_present: false,
    learning_acceleration_env_raw_value_category: "missing",
    learning_acceleration_runtime_environment: "missing",
  });
  expect(empty).toMatchObject({
    learning_acceleration_enabled: false,
    learning_acceleration_enabled_source: "none",
    learning_acceleration_env_raw_present: true,
    learning_acceleration_env_raw_value_category: "empty",
  });
});

test("learning acceleration env diagnostics classify weird casing and other values", () => {
  const mixedCase = getLearningAccelerationConfig({
    env: { TURE_LEARNING_ACCELERATION_ENABLED: " TrUe " },
  });
  const other = getLearningAccelerationConfig({
    env: { TURE_LEARNING_ACCELERATION_ENABLED: "definitely" },
  });

  expect(mixedCase.learning_acceleration_env_raw_value_category).toBe("true");
  expect(mixedCase.learning_acceleration_enabled).toBe(true);
  expect(other.learning_acceleration_env_raw_value_category).toBe("other");
  expect(other.learning_acceleration_enabled).toBe(false);
  expect(learningAccelerationEnvValueCategory("YES")).toBe("true");
});

test("learning acceleration grow mode compatibility still reports grow source", () => {
  expect(
    getLearningAccelerationConfig({
      env: {},
      growMaxLearningModeEnabled: true,
    }).learning_acceleration_enabled_source,
  ).toBe("grow_max_compat");
});

test("client fallback does not falsely report server env missing", () => {
  const fallback = clientUnavailableLearningAccelerationConfig();

  expect(fallback).toMatchObject({
    learning_acceleration_enabled: false,
    learning_acceleration_enabled_source: "client_unavailable",
    learning_acceleration_env_raw_present: false,
    learning_acceleration_env_raw_value_category: "client_unavailable",
    learning_acceleration_runtime_environment: "client_unavailable",
  });
  expect(fallback.learning_acceleration_env_raw_value_category).not.toBe(
    "missing",
  );
});

test("enabled mode persists below-threshold valid candidates as research-only samples", () => {
  const selection = buildLearningAccelerationResearchSelection({
    enabled: true,
    candidates: [candidate("AAPL"), candidate("MSFT")],
    ranking: ranking(["AAPL", "MSFT"]),
    visibleTickers: ["AAPL"],
    scanWindow: "morning_momentum",
    maxSamples: 25,
  });

  expect(selection.samples.map((sample) => sample.ticker)).toEqual(["MSFT"]);
  expect(selection.samples[0]).toMatchObject({
    rejection_publish_reason: "research_overflow_not_visible_selected",
    sample_quality: "good",
  });
});

test("selected below-publish-threshold candidates are persisted as research-only samples", () => {
  const selection = buildLearningAccelerationResearchSelection({
    enabled: true,
    candidates: [
      candidate("AAPL"),
      candidate("PLTR", {
        tier: "rejected",
        score: {
          value: 58,
          tier: "rejected",
          reasons: ["Below publish threshold but structurally valid."],
          warnings: [],
        },
      }),
    ],
    ranking: null,
    selectedBuildDiagnostics: [
      buildSelectedCandidateBuildDiagnostic({
        ticker: "AAPL",
        built: true,
        enoughDataToBuildPlan: true,
        rejectionReason: "built",
      }),
      buildSelectedCandidateBuildDiagnostic({
        ticker: "PLTR",
        score: 58,
        tier: "rejected",
        built: false,
        enoughDataToBuildPlan: true,
        riskGeometryStatus: "valid",
        rejectionReason: "below_publish_threshold",
      }),
    ],
    visibleTickers: ["AAPL"],
    scanWindow: "midday",
    maxSamples: 25,
  });

  expect(selection.selected_below_threshold_count).toBe(1);
  expect(selection.research_only_persisted_count).toBe(1);
  expect(selection.samples).toHaveLength(1);
  expect(selection.samples[0]).toMatchObject({
    ticker: "PLTR",
    tier: "rejected",
    rejection_publish_reason: "below_publish_threshold",
  });
});

test("selected-to-built drop-off examples are passed into learning acceleration", () => {
  const selection = buildLearningAccelerationResearchSelection({
    enabled: true,
    candidates: [candidate("PLTR"), candidate("DIS")],
    ranking: null,
    selectedBuildDiagnostics: [],
    selectedToBuiltDropOff: {
      selected_count: 19,
      built_count: 9,
      rejected_count: 10,
      rejection_counts: { below_publish_threshold: 10 },
      category_counts: { quality: 10 },
      examples_by_reason: { below_publish_threshold: ["PLTR", "DIS"] },
      output_below_target_reason_category: "healthy_caution",
      output_below_target_explanation:
        "10 selected candidates were below the publish threshold.",
    },
    visibleTickers: [],
    scanWindow: "midday",
    maxSamples: 25,
  });

  expect(selection.selected_below_threshold_readback_count).toBe(10);
  expect(selection.selected_below_threshold_passed_count).toBe(2);
  expect(selection.selected_below_threshold_matched_by_ticker_count).toBe(2);
  expect(selection.selected_below_threshold_unmatched_by_ticker_count).toBe(0);
  expect(selection.learning_acceleration_input_mismatch).toBe(true);
  expect(selection.samples.map((sample) => sample.ticker)).toEqual([
    "PLTR",
    "DIS",
  ]);
});

test("learning acceleration reports input mismatch when drop-off has no passed diagnostics", () => {
  const selection = buildLearningAccelerationResearchSelection({
    enabled: true,
    candidates: [candidate("PLTR")],
    ranking: null,
    selectedBuildDiagnostics: [],
    selectedToBuiltDropOff: {
      selected_count: 19,
      built_count: 9,
      rejected_count: 10,
      rejection_counts: { below_publish_threshold: 10 },
      category_counts: { quality: 10 },
      examples_by_reason: {},
      output_below_target_reason_category: "healthy_caution",
      output_below_target_explanation:
        "10 selected candidates were below the publish threshold.",
    },
    visibleTickers: [],
    scanWindow: "midday",
    maxSamples: 25,
  });

  expect(selection.selected_below_threshold_readback_count).toBe(10);
  expect(selection.selected_below_threshold_passed_count).toBe(0);
  expect(selection.learning_acceleration_input_mismatch).toBe(true);
  expect(selection.samples).toHaveLength(0);
});

test("disabled mode collects no research-only samples and visible recommendations are unchanged", () => {
  const selection = buildLearningAccelerationResearchSelection({
    enabled: false,
    candidates: [candidate("AAPL"), candidate("MSFT")],
    ranking: ranking(["AAPL", "MSFT"]),
    visibleTickers: ["AAPL"],
    scanWindow: "morning_momentum",
    maxSamples: 25,
  });

  expect(selection.samples_collected_count).toBe(0);
  expect(selection.visible_tickers).toEqual(["AAPL"]);
});

test("research samples respect budget cap", () => {
  const capped = buildLearningAccelerationResearchSelection({
    enabled: true,
    candidates: [
      candidate("AAPL"),
      candidate("MSFT"),
      candidate("MSFT"),
      candidate("NVDA"),
      candidate("BAC"),
    ],
    ranking: ranking(["AAPL", "MSFT", "MSFT", "NVDA", "BAC"]),
    visibleTickers: [],
    scanWindow: "midday",
    maxSamples: 2,
  });

  expect(capped.samples.map((sample) => sample.ticker)).toEqual([
    "AAPL",
    "MSFT",
  ]);
  expect(capped.skipped_due_to_budget_count).toBeGreaterThanOrEqual(1);

  const deduped = buildLearningAccelerationResearchSelection({
    enabled: true,
    candidates: [
      candidate("AAPL"),
      candidate("MSFT"),
      candidate("MSFT"),
      candidate("NVDA"),
    ],
    ranking: ranking(["AAPL", "MSFT", "MSFT", "NVDA"]),
    visibleTickers: [],
    scanWindow: "midday",
    maxSamples: 25,
  });

  expect(deduped.samples.map((sample) => sample.ticker)).toEqual([
    "AAPL",
    "MSFT",
    "NVDA",
  ]);
  expect(deduped.skipped_due_to_duplicate_count).toBe(1);
});

test("invalid, stale, and incomplete candidates are excluded from research samples", () => {
  const selection = buildLearningAccelerationResearchSelection({
    enabled: true,
    candidates: [
      candidate("BAD", { stop_loss: 101 }),
      candidate("OLD", { stale: true }),
      candidate("GAP", { target_1: null }),
      candidate("MSFT"),
    ],
    ranking: ranking(["BAD", "OLD", "GAP", "MSFT"]),
    visibleTickers: [],
    scanWindow: "power_hour",
    maxSamples: 25,
  });

  expect(selection.samples.map((sample) => sample.ticker)).toEqual(["MSFT"]);
  expect(selection.skipped_due_to_invalid_risk_count).toBe(1);
  expect(selection.skipped_due_to_stale_reference_count).toBe(1);
  expect(selection.skipped_due_to_missing_critical_fields_count).toBe(1);
});

test("outcome evaluation includes research-only samples only when enabled", () => {
  expect(
    shouldIncludeLearningAccelerationOutcomeSample({
      learningAccelerationEnabled: false,
      researchOnly: true,
    }),
  ).toBe(false);
  expect(
    shouldIncludeLearningAccelerationOutcomeSample({
      learningAccelerationEnabled: true,
      researchOnly: true,
    }),
  ).toBe(true);
  expect(
    shouldIncludeLearningAccelerationOutcomeSample({
      learningAccelerationEnabled: false,
      researchOnly: false,
      learningOnly: false,
    }),
  ).toBe(true);
});
