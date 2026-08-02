import { expect, test } from "@playwright/test";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

import {
  buildMarketContextIntelligenceV1,
  MARKET_CONTEXT_INTELLIGENCE_VERSION,
  MARKET_CONTEXT_THRESHOLD_VERSION,
  type MarketContextIntelligenceV1Input,
} from "../../lib/market-context-intelligence-lab/contract-v1";
import {
  MARKET_CONTEXT_GOLDEN_DECISION_TIMESTAMP,
  evaluateMarketContextIntelligenceV1GoldenFixtures,
  marketContextIntelligenceV1GoldenFixtures,
} from "../../lib/market-context-intelligence-lab/golden-fixtures-v1";
import {
  MARKET_CONTEXT_SHADOW_EVALUATION_ADAPTER_VERSION,
  toInactiveMarketContextShadowEvaluationEnvelope,
} from "../../lib/market-context-intelligence-lab/shadow-evaluation-adapter-v1";

function goldenFixture(id: string) {
  const fixture = marketContextIntelligenceV1GoldenFixtures.find(
    (candidate) => candidate.id === id,
  );
  if (!fixture) throw new Error(`Missing golden fixture: ${id}`);
  return fixture;
}

function cloneInput(input: MarketContextIntelligenceV1Input) {
  return JSON.parse(JSON.stringify(input)) as MarketContextIntelligenceV1Input;
}

function sourceFiles(root: string): string[] {
  return readdirSync(root).flatMap((entry) => {
    const path = join(root, entry);
    const stats = statSync(path);
    if (stats.isDirectory()) return sourceFiles(path);
    return path.endsWith(".ts") || path.endsWith(".tsx") ? [path] : [];
  });
}

test("all fourteen versioned golden fixtures pass deterministically", () => {
  const results = evaluateMarketContextIntelligenceV1GoldenFixtures();

  expect(results).toHaveLength(14);
  expect(
    results.map((result) => ({
      id: result.id,
      passed: result.passed,
      regime: result.output.regime_classification,
    })),
  ).toEqual([
    {
      id: "clear_risk_on_trend",
      passed: true,
      regime: "risk_on_trending",
    },
    {
      id: "clear_risk_off_trend",
      passed: true,
      regime: "risk_off_orderly",
    },
    {
      id: "spy_qqq_disagreement",
      passed: true,
      regime: "conflicting_context",
    },
    {
      id: "choppy_high_volatility",
      passed: true,
      regime: "choppy_high_volatility",
    },
    {
      id: "low_volatility_neutral_market",
      passed: true,
      regime: "neutral_balanced",
    },
    {
      id: "stale_index_data",
      passed: true,
      regime: "insufficient_data",
    },
    {
      id: "missing_candles",
      passed: true,
      regime: "insufficient_data",
    },
    {
      id: "insufficient_breadth",
      passed: true,
      regime: "risk_on_fragile",
    },
    {
      id: "strong_sector_relative_to_weak_market",
      passed: true,
      regime: "risk_off_orderly",
    },
    {
      id: "weak_sector_in_strong_market",
      passed: true,
      regime: "risk_on_trending",
    },
    {
      id: "incomplete_sector_universe",
      passed: true,
      regime: "risk_on_trending",
    },
    {
      id: "input_order_determinism",
      passed: true,
      regime: "risk_on_trending",
    },
    {
      id: "future_point_after_decision_timestamp",
      passed: true,
      regime: "risk_on_trending",
    },
    {
      id: "provider_gap",
      passed: true,
      regime: "insufficient_data",
    },
  ]);
});

test("risk-on output exposes separate dimensions and non-probabilistic evidence", () => {
  const output = buildMarketContextIntelligenceV1(
    goldenFixture("clear_risk_on_trend").input,
  );

  expect(output.context_version).toBe(MARKET_CONTEXT_INTELLIGENCE_VERSION);
  expect(output.threshold_version).toBe(MARKET_CONTEXT_THRESHOLD_VERSION);
  expect(output.decision_timestamp).toBe(
    MARKET_CONTEXT_GOLDEN_DECISION_TIMESTAMP,
  );
  expect(output.dimensions).toEqual({
    trend_state: "strong_up",
    risk_state: "risk_on",
    volatility_state: "normal",
    breadth_state: "broad",
    spy_qqq_agreement: "agreement_bullish",
    intraday_context: "bullish",
    multi_day_context: "bullish",
    data_quality_state: "good",
  });
  expect(output.confidence).toEqual({
    label: "strongly_supported",
    calibrated_probability: false,
    basis: "deterministic_rule_evidence_not_probability",
  });
  expect(output.evidence_strength).toBe("strong");
  expect(output.shadow_only).toBe(true);
  expect(output.live_ranking_effect).toBe(false);
});

test("SPY and QQQ disagreement is explicit rather than neutral fallback", () => {
  const output = buildMarketContextIntelligenceV1(
    goldenFixture("spy_qqq_disagreement").input,
  );

  expect(output.regime_classification).toBe("conflicting_context");
  expect(output.dimensions.spy_qqq_agreement).toBe("disagreement");
  expect(output.dimensions.risk_state).toBe("conflicting");
  expect(output.reason_codes).toContain("regime_conflicting_context");
});

test("stale index data and missing candles remain terminally insufficient", () => {
  const stale = buildMarketContextIntelligenceV1(
    goldenFixture("stale_index_data").input,
  );
  const missing = buildMarketContextIntelligenceV1(
    goldenFixture("missing_candles").input,
  );

  expect(stale.dimensions.data_quality_state).toBe("stale");
  expect(stale.freshness.state).toBe("stale");
  expect(stale.freshness.stale_source_ids).toEqual([
    "index:QQQ",
    "index:SPY",
  ]);
  expect(stale.regime_classification).toBe("insufficient_data");

  expect(missing.dimensions.data_quality_state).toBe("insufficient_data");
  expect(missing.coverage.essential_index_coverage).toBe(0.875);
  expect(missing.regime_classification).toBe("insufficient_data");
  expect(missing.reason_codes).not.toContain("regime_neutral_balanced");
});

test("insufficient optional breadth is visible and makes risk-on fragile", () => {
  const output = buildMarketContextIntelligenceV1(
    goldenFixture("insufficient_breadth").input,
  );

  expect(output.dimensions.breadth_state).toBe("insufficient_data");
  expect(output.coverage.breadth_coverage).toBe(0.5);
  expect(output.regime_classification).toBe("risk_on_fragile");
  expect(output.evidence_strength).toBe("weak");
  expect(output.reason_codes).toContain("breadth_coverage_insufficient");
});

test("sector strength is measured relative to SPY independently of market direction", () => {
  const strong = buildMarketContextIntelligenceV1(
    goldenFixture("strong_sector_relative_to_weak_market").input,
  );
  const weak = buildMarketContextIntelligenceV1(
    goldenFixture("weak_sector_in_strong_market").input,
  );

  expect(strong.regime_classification).toBe("risk_off_orderly");
  expect(strong.sectors[0]).toMatchObject({
    sector_id: "technology",
    classification: "strong",
    short_relative_strength: "strong",
    medium_relative_strength: "strong",
    trend_agreement: "bullish_agreement",
    rank_status: "ranked",
    rank: 1,
  });

  expect(weak.regime_classification).toBe("risk_on_trending");
  expect(weak.sectors[0]).toMatchObject({
    sector_id: "energy",
    classification: "weak",
    short_relative_strength: "weak",
    medium_relative_strength: "weak",
    trend_agreement: "bearish_agreement",
    rank_status: "ranked",
    rank: 1,
  });
});

test("sector ranks are withheld unless the declared comparable universe is complete", () => {
  const output = buildMarketContextIntelligenceV1(
    goldenFixture("incomplete_sector_universe").input,
  );

  expect(output.sectors).toHaveLength(1);
  expect(output.sectors[0]).toMatchObject({
    classification: "strong",
    rank_status: "not_rankable",
    rank: null,
    comparable_sector_count: 0,
  });
  expect(output.sectors[0]?.reason_codes).toContain(
    "sector_universe_not_rankable",
  );
});

test("industry benchmark series are accepted but never enter sector ranking", () => {
  const input = cloneInput(goldenFixture("clear_risk_on_trend").input);
  const technology = input.sectors?.find(
    (context) => context.sector_id === "technology",
  );
  if (!technology) throw new Error("Technology fixture missing");
  const industryContext = structuredClone(technology);
  input.sectors?.push({
    ...industryContext,
    context_level: "industry",
    industry_id: "semiconductors",
    benchmark_symbol: "SOXX",
  });

  const output = buildMarketContextIntelligenceV1(input);
  const industry = output.sectors.find(
    (context) => context.context_level === "industry",
  );

  expect(industry).toMatchObject({
    context_level: "industry",
    sector_id: "technology",
    industry_id: "semiconductors",
    benchmark_symbol: "SOXX",
    classification: "strong",
    rank_status: "not_rankable",
    rank: null,
  });
  expect(industry?.reason_codes).toContain(
    "industry_context_not_sector_rankable",
  );
  expect(
    output.sectors
      .filter((context) => context.context_level === "sector")
      .map((context) => context.rank_status),
  ).toEqual(["ranked", "ranked"]);
});

test("benchmark, sector, universe, and point ordering do not change output", () => {
  const canonicalInput = cloneInput(
    goldenFixture("clear_risk_on_trend").input,
  );
  const shuffledInput = cloneInput(canonicalInput);

  shuffledInput.benchmarks.reverse();
  for (const benchmark of shuffledInput.benchmarks) {
    benchmark.intraday.reverse();
    benchmark.multi_day.reverse();
  }
  shuffledInput.sectors?.reverse();
  for (const sector of shuffledInput.sectors ?? []) {
    sector.short_horizon.reverse();
    sector.medium_horizon.reverse();
  }
  shuffledInput.sector_universe?.expected_sector_ids.reverse();

  expect(buildMarketContextIntelligenceV1(shuffledInput)).toEqual(
    buildMarketContextIntelligenceV1(canonicalInput),
  );
});

test("future points are excluded and cannot overwrite eligible history", () => {
  const output = buildMarketContextIntelligenceV1(
    goldenFixture("future_point_after_decision_timestamp").input,
  );

  expect(output.regime_classification).toBe("risk_on_trending");
  expect(output.leakage_control.future_points_excluded).toBe(2);
  expect(output.reason_codes).toContain("future_points_excluded");
  expect(output.dimensions.data_quality_state).toBe("degraded");
  expect(output.confidence.calibrated_probability).toBe(false);
});

test("future provider timestamps are excluded and create an explicit provider gap", () => {
  const input = cloneInput(goldenFixture("clear_risk_on_trend").input);
  const qqq = input.benchmarks.find((benchmark) => benchmark.symbol === "QQQ");
  if (!qqq) throw new Error("QQQ fixture missing");
  qqq.provider.source_timestamp = "2026-07-24T20:01:00.000Z";

  const output = buildMarketContextIntelligenceV1(input);
  const qqqTimestamp = output.provider_timestamps.find(
    (providerTimestamp) => providerTimestamp.source_id === "index:QQQ",
  );

  expect(output.regime_classification).toBe("insufficient_data");
  expect(output.dimensions.data_quality_state).toBe("provider_gap");
  expect(output.leakage_control.future_provider_timestamps_excluded).toBe(1);
  expect(qqqTimestamp).toMatchObject({
    source_timestamp: null,
    freshness_state: "future_excluded",
  });
  expect(output.reason_codes).toContain(
    "future_provider_timestamps_excluded",
  );
});

test("provider gaps expose freshness, coverage, and missingness", () => {
  const output = buildMarketContextIntelligenceV1(
    goldenFixture("provider_gap").input,
  );
  const qqqTimestamp = output.provider_timestamps.find(
    (providerTimestamp) => providerTimestamp.source_id === "index:QQQ",
  );

  expect(output.dimensions.data_quality_state).toBe("provider_gap");
  expect(output.freshness.state).toBe("insufficient_data");
  expect(output.coverage.essential_index_coverage).toBe(0.5);
  expect(output.coverage.missingness).toBeGreaterThan(0);
  expect(qqqTimestamp).toEqual({
    source_id: "index:QQQ",
    provider: "fixture_provider",
    source_timestamp: null,
    received_timestamp: "2026-07-24T19:56:00.000Z",
    freshness_minutes: null,
    freshness_state: "missing",
    coverage: 0,
    missing_points: 60,
  });
});

test("inactive adapter has no capture, persistence, or canonical binding", () => {
  const output = buildMarketContextIntelligenceV1(
    goldenFixture("clear_risk_on_trend").input,
  );
  const envelope = toInactiveMarketContextShadowEvaluationEnvelope(output);

  expect(envelope).toMatchObject({
    adapter_version: MARKET_CONTEXT_SHADOW_EVALUATION_ADAPTER_VERSION,
    binding_status: "inactive_unbound",
    intended_future_boundary: "canonical_evaluation_envelope",
    canonical_evaluation_envelope_binding: null,
    capture_enabled: false,
    persistence_enabled: false,
    database_relation: null,
    shadow_only: true,
    live_ranking_effect: false,
  });
});

test("lab module has no provider, persistence, scanner, or recommendation dependency", () => {
  const labRoot = join(
    process.cwd(),
    "lib",
    "market-context-intelligence-lab",
  );
  const sources = sourceFiles(labRoot)
    .map((path) => readFileSync(path, "utf8"))
    .join("\n");

  expect(sources).not.toMatch(/from ["']@\/lib\/market-data["']/);
  expect(sources).not.toMatch(/from ["']@\/lib\/scanner["']/);
  expect(sources).not.toMatch(/from ["']@\/lib\/recommendation-generator["']/);
  expect(sources).not.toMatch(/from ["']@\/lib\/supabase/);
  expect(sources).not.toContain("getServerSupabaseClient");
  expect(sources).not.toMatch(/\.from\(\s*["']/);
  expect(sources).not.toContain("fetch(");
});

test("no live application or library file imports the shadow lab", () => {
  const repositoryRoot = process.cwd();
  const labRoot = join(
    repositoryRoot,
    "lib",
    "market-context-intelligence-lab",
  );
  const liveFiles = [
    ...sourceFiles(join(repositoryRoot, "app")),
    ...sourceFiles(join(repositoryRoot, "lib")),
  ].filter((path) => !path.startsWith(labRoot));
  const importingFiles = liveFiles.filter((path) =>
    readFileSync(path, "utf8").includes("market-context-intelligence-lab"),
  );

  expect(
    importingFiles.map((path) => relative(repositoryRoot, path)),
  ).toEqual([]);
});
