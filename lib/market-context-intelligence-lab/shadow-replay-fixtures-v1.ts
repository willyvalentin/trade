import type {
  MarketContextIntelligenceV2Input,
} from "./contract-v2";
import {
  marketContextIntelligenceV1GoldenFixtures,
} from "./golden-fixtures-v1";
import {
  sealMarketContextShadowReplayV1Input,
  type MarketContextShadowReplayDecisionInputV1,
  type MarketContextShadowReplayV1Input,
} from "./shadow-replay-v1";
import type {
  MarketContextProducerVersionMetadata,
} from "./shadow-canonical-bridge-v1";

export const MARKET_CONTEXT_SHADOW_REPLAY_FIXTURE_VERSION =
  "market_context_shadow_replay_synthetic_sessions_v1" as const;

export const marketContextShadowReplayFixtureProducerVersions:
  MarketContextProducerVersionMetadata = {
    engine_version: "market_context_shadow_replay_engine_v1",
    scoring_version: "no_live_scoring_shadow_only",
    ranking_version: "no_live_ranking_shadow_only",
    setup_taxonomy_version: "not_applicable_shadow_context",
    confidence_contract_version: "ordinal_evidence_not_probability_v1",
    evaluator_version: "market_context_shadow_replay_evaluator_v1",
    provider_contract_version: "synthetic_point_in_time_series_v1",
    git_commit: "becee774a270e078fbd8bb55a01d7a59b2205599",
    build_identity: "action-667k-local-synthetic-replay",
  };

function cloneInput(id: string): MarketContextIntelligenceV2Input {
  const fixture = marketContextIntelligenceV1GoldenFixtures.find(
    (candidate) => candidate.id === id,
  );
  if (!fixture) throw new Error(`missing_market_context_fixture:${id}`);
  return structuredClone(fixture.input);
}

function rebaseInput(
  input: MarketContextIntelligenceV2Input,
  decisionTimestamp: string,
): MarketContextIntelligenceV2Input {
  const rebased = structuredClone(input);
  const decisionMs = Date.parse(decisionTimestamp);
  const pointTimestamp = new Date(decisionMs - 5 * 60_000).toISOString();
  const receivedTimestamp = new Date(decisionMs - 4 * 60_000).toISOString();
  rebased.decision_timestamp = decisionTimestamp;

  for (const benchmark of rebased.benchmarks) {
    if (benchmark.provider.source_timestamp !== null) {
      benchmark.provider.source_timestamp = pointTimestamp;
    }
    benchmark.provider.received_timestamp = receivedTimestamp;
    for (const point of [...benchmark.intraday, ...benchmark.multi_day]) {
      point.timestamp = pointTimestamp;
    }
  }
  if (rebased.breadth) {
    rebased.breadth.timestamp = pointTimestamp;
    if (rebased.breadth.provider.source_timestamp !== null) {
      rebased.breadth.provider.source_timestamp = pointTimestamp;
    }
    rebased.breadth.provider.received_timestamp = receivedTimestamp;
  }
  for (const sector of rebased.sectors ?? []) {
    if (sector.provider.source_timestamp !== null) {
      sector.provider.source_timestamp = pointTimestamp;
    }
    sector.provider.received_timestamp = receivedTimestamp;
    for (const point of [
      ...sector.short_horizon,
      ...sector.medium_horizon,
    ]) {
      point.timestamp = pointTimestamp;
    }
  }
  return rebased;
}

function decision(
  decisionId: string,
  ticker: string,
  sessionLabel: string,
  fixtureId: string,
  decisionTimestamp: string,
): MarketContextShadowReplayDecisionInputV1 {
  return {
    decision_id: decisionId,
    ticker,
    session_label: sessionLabel,
    context_input: rebaseInput(
      cloneInput(fixtureId),
      decisionTimestamp,
    ),
  };
}

function changeSectorRelativeStrength(
  input: MarketContextIntelligenceV2Input,
  sectorId: string,
  shortRelative: number,
  mediumRelative: number,
) {
  const sector = input.sectors?.find(
    (candidate) => candidate.sector_id === sectorId,
  );
  if (!sector) throw new Error(`missing_sector_fixture:${sectorId}`);
  for (const point of sector.short_horizon) {
    point.relative_return_vs_spy_pct = shortRelative;
    point.spy_return_pct = 0.5;
    point.return_pct = shortRelative + 0.5;
    point.trend_slope_pct = Math.sign(shortRelative) * 0.2;
  }
  for (const point of sector.medium_horizon) {
    point.relative_return_vs_spy_pct = mediumRelative;
    point.spy_return_pct = 1;
    point.return_pct = mediumRelative + 1;
    point.trend_slope_pct = Math.sign(mediumRelative) * 0.15;
  }
}

function fixtureInput(
  fixtureId: string,
  decisions: MarketContextShadowReplayDecisionInputV1[],
): MarketContextShadowReplayV1Input {
  return sealMarketContextShadowReplayV1Input({
    replay_id: `action-667k-${fixtureId}`,
    dataset: {
      identity: {
        dataset_id: `synthetic-${fixtureId}`,
        dataset_version: MARKET_CONTEXT_SHADOW_REPLAY_FIXTURE_VERSION,
        source_kind: "synthetic_repository_fixture",
      },
      decisions,
    },
    producer_versions: {
      ...marketContextShadowReplayFixtureProducerVersions,
    },
  });
}

const riskOn = decision(
  "risk-on-2026-01-05",
  "SPY",
  "clear_risk_on_day",
  "clear_risk_on_trend",
  "2026-01-05T20:00:00Z",
);

const riskOff = decision(
  "risk-off-2026-01-06",
  "SPY",
  "clear_risk_off_day",
  "clear_risk_off_trend",
  "2026-01-06T20:00:00Z",
);

const choppy = decision(
  "choppy-2026-01-07",
  "QQQ",
  "volatile_choppy_day",
  "choppy_high_volatility",
  "2026-01-07T20:00:00Z",
);

const disagreement = decision(
  "disagreement-2026-01-08",
  "QQQ",
  "spy_qqq_disagreement",
  "spy_qqq_disagreement",
  "2026-01-08T20:00:00Z",
);

const rotationStart = decision(
  "rotation-2026-01-09",
  "ROTATION_BASKET",
  "sector_rotation_start",
  "clear_risk_on_trend",
  "2026-01-09T20:00:00Z",
);
const rotationEnd = decision(
  "rotation-2026-01-12",
  "ROTATION_BASKET",
  "sector_rotation_end",
  "clear_risk_on_trend",
  "2026-01-12T20:00:00Z",
);
changeSectorRelativeStrength(
  rotationEnd.context_input,
  "technology",
  -1.2,
  -2.4,
);
changeSectorRelativeStrength(
  rotationEnd.context_input,
  "financials",
  1.2,
  2.4,
);

const staleProviderGap = decision(
  "provider-gap-2026-01-13",
  "SPY",
  "stale_and_provider_gap",
  "provider_gap",
  "2026-01-13T20:00:00Z",
);
const staleSpy = staleProviderGap.context_input.benchmarks.find(
  (benchmark) => benchmark.symbol === "SPY",
);
if (!staleSpy) throw new Error("missing_spy_fixture");
staleSpy.provider.source_timestamp = "2026-01-10T19:55:00Z";

const incompleteSectorUniverse = decision(
  "incomplete-sector-2026-01-14",
  "XLK",
  "incomplete_sector_universe",
  "incomplete_sector_universe",
  "2026-01-14T20:00:00Z",
);

const dstOffset = decision(
  "dst-offset-2026-10-25",
  "SPY",
  "dst_offset_session",
  "clear_risk_on_trend",
  "2026-10-25T02:30:00+01:00",
);

const futureCandle = decision(
  "future-candle-2026-01-15",
  "SPY",
  "future_candle_in_dataset",
  "clear_risk_on_trend",
  "2026-01-15T20:00:00Z",
);
for (const benchmark of futureCandle.context_input.benchmarks) {
  const eligible = benchmark.multi_day[0];
  if (!eligible) throw new Error("missing_multiday_fixture");
  benchmark.multi_day.push({
    ...structuredClone(eligible),
    timestamp: "2026-01-15T20:05:00Z",
    close: 70,
    return_pct: -4,
    moving_average_short: 80,
    moving_average_long: 90,
    momentum_pct: -2,
    trend_slope_pct: -0.4,
    realized_volatility_pct: 4,
    range_pct: 5,
  });
}
const futureSectorProvider = futureCandle.context_input.sectors?.[0]?.provider;
if (!futureSectorProvider) {
  throw new Error("missing_future_sector_provider_fixture");
}
futureSectorProvider.source_timestamp = "2026-01-15T20:02:00Z";

const outOfOrderDuplicate = decision(
  "duplicates-2026-01-16",
  "QQQ",
  "out_of_order_duplicate_observations",
  "clear_risk_on_trend",
  "2026-01-16T20:00:00Z",
);
for (const benchmark of outOfOrderDuplicate.context_input.benchmarks) {
  for (const horizon of [benchmark.intraday, benchmark.multi_day]) {
    const latest = horizon[0];
    if (!latest) throw new Error("missing_point_fixture");
    horizon.unshift({
      ...structuredClone(latest),
      timestamp: "2026-01-16T18:00:00Z",
    });
    horizon.push(structuredClone(latest));
    horizon.reverse();
  }
}

const reorderedInput = decision(
  "reordered-2026-01-19",
  "SPY",
  "input_order_determinism",
  "input_order_determinism",
  "2026-01-19T20:00:00Z",
);
if (reorderedInput.context_input.breadth) {
  reorderedInput.context_input.breadth.advancing_fraction = 0.6;
}
reorderedInput.context_input.benchmarks.reverse();
for (const benchmark of reorderedInput.context_input.benchmarks) {
  benchmark.intraday.reverse();
  benchmark.multi_day.reverse();
}
reorderedInput.context_input.sectors?.reverse();
for (const sector of reorderedInput.context_input.sectors ?? []) {
  sector.short_horizon.reverse();
  sector.medium_horizon.reverse();
}
reorderedInput.context_input.sector_universe?.expected_sector_ids.reverse();

const agreementBeforeTransition = decision(
  "version-agreement-2026-01-20",
  "TRANSITION_SET",
  "v1_v2_agreement_before_transition",
  "clear_risk_on_trend",
  "2026-01-20T20:00:00Z",
);
const agreementAfterTransition = decision(
  "version-agreement-2026-01-21",
  "TRANSITION_SET",
  "v1_v2_agreement_after_intentional_regime_transition",
  "clear_risk_off_trend",
  "2026-01-21T20:00:00Z",
);

export const marketContextHistoricalShadowReplayGoldenFixtures = [
  {
    id: "clear_risk_on_day",
    input: fixtureInput("clear-risk-on-day", [riskOn]),
    expected_classifications: ["risk_on_trending"],
  },
  {
    id: "clear_risk_off_day",
    input: fixtureInput("clear-risk-off-day", [riskOff]),
    expected_classifications: ["risk_off_orderly"],
  },
  {
    id: "volatile_choppy_day",
    input: fixtureInput("volatile-choppy-day", [choppy]),
    expected_classifications: ["choppy_high_volatility"],
  },
  {
    id: "spy_qqq_disagreement",
    input: fixtureInput("spy-qqq-disagreement", [disagreement]),
    expected_classifications: ["conflicting_context"],
  },
  {
    id: "sector_rotation",
    input: fixtureInput("sector-rotation", [rotationStart, rotationEnd]),
    expected_classifications: ["risk_on_trending", "risk_on_trending"],
  },
  {
    id: "stale_provider_gap",
    input: fixtureInput("stale-provider-gap", [staleProviderGap]),
    expected_classifications: ["insufficient_data"],
  },
  {
    id: "incomplete_sector_universe",
    input: fixtureInput("incomplete-sector-universe", [
      incompleteSectorUniverse,
    ]),
    expected_classifications: ["risk_on_trending"],
  },
  {
    id: "dst_offset_session",
    input: fixtureInput("dst-offset-session", [dstOffset]),
    expected_classifications: ["risk_on_trending"],
  },
  {
    id: "future_candle_in_dataset",
    input: fixtureInput("future-candle-in-dataset", [futureCandle]),
    expected_classifications: ["risk_on_trending"],
  },
  {
    id: "out_of_order_duplicate_observations",
    input: fixtureInput("out-of-order-duplicates", [
      outOfOrderDuplicate,
    ]),
    expected_classifications: ["risk_on_trending"],
  },
  {
    id: "input_order_determinism",
    input: fixtureInput("input-order-determinism", [reorderedInput]),
    expected_classifications: ["risk_on_trending"],
  },
  {
    id: "v1_v2_agreement_and_intentional_regime_transition",
    input: fixtureInput("version-agreement-regime-transition", [
      agreementBeforeTransition,
      agreementAfterTransition,
    ]),
    expected_classifications: [
      "risk_on_trending",
      "risk_off_orderly",
    ],
  },
] as const;

export function buildMarketContextHistoricalShadowReplayGoldenDataset() {
  return sealMarketContextShadowReplayV1Input({
    replay_id: "action-667k-complete-synthetic-historical-replay",
    dataset: {
      identity: {
        dataset_id: "action-667k-complete-synthetic-historical-sessions",
        dataset_version: MARKET_CONTEXT_SHADOW_REPLAY_FIXTURE_VERSION,
        source_kind: "synthetic_repository_fixture",
      },
      decisions: marketContextHistoricalShadowReplayGoldenFixtures.flatMap(
        (fixture) =>
          fixture.input.dataset.decisions.map((item) =>
            structuredClone(item),
          ),
      ),
    },
    producer_versions: {
      ...marketContextShadowReplayFixtureProducerVersions,
    },
  });
}
