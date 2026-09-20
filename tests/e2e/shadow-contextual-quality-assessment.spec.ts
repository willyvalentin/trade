import { expect, test } from "@playwright/test";

import { buildIntradayCatalystPresence } from "@/lib/intraday-catalyst-presence";
import { buildIntradayMarketContext } from "@/lib/intraday-market-context";
import { buildIntradaySectorRelativeStrength } from "@/lib/intraday-sector-relative-strength";
import {
  assessShadowContextualQuality,
  shadowContextualQualityPolicyVersion,
} from "@/lib/shadow-contextual-quality-assessment";

const now = new Date("2026-09-21T15:05:00.000Z");

function admittedInputs() {
  const market = buildIntradayMarketContext(
    {
      market_date: "2026-09-21",
      regular_session_verified: true,
      observations: [
        {
          symbol: "SPY",
          provider: "market_provider",
          observed_at: "2026-09-21T15:04:30.000Z",
          price: 100,
          session_return_percent: 0.3,
        },
        {
          symbol: "QQQ",
          provider: "market_provider",
          observed_at: "2026-09-21T15:04:45.000Z",
          price: 200,
          session_return_percent: 0.7,
        },
        {
          symbol: "IWM",
          provider: "market_provider",
          observed_at: "2026-09-21T15:05:00.000Z",
          price: 50,
          session_return_percent: 0.1,
        },
      ],
    },
    now,
  ).summary;
  const sector = buildIntradaySectorRelativeStrength(
    {
      market_date: "2026-09-21",
      regular_session_verified: true,
      sector_id: "technology",
      candidate: {
        symbol: "NVDA",
        provider: "market_provider",
        observed_at: "2026-09-21T15:04:30.000Z",
        session_return_percent: 1.4,
      },
      sector_benchmark: {
        symbol: "XLK",
        provider: "market_provider",
        observed_at: "2026-09-21T15:04:45.000Z",
        session_return_percent: 0.6,
      },
      market_benchmark: {
        symbol: "SPY",
        provider: "market_provider",
        observed_at: "2026-09-21T15:05:00.000Z",
        session_return_percent: 0.3,
      },
    },
    now,
  ).summary;
  const catalyst = buildIntradayCatalystPresence(
    {
      market_date: "2026-09-21",
      regular_session_verified: true,
      candidate_symbol: "NVDA",
      coverage: {
        symbol: "NVDA",
        provider: "news_provider",
        observed_at: "2026-09-21T15:04:30.000Z",
        lookback_started_at: "2026-09-20T15:04:30.000Z",
        search_complete: true,
        reported_catalyst_count: 1,
      },
      catalysts: [
        {
          symbol: "NVDA",
          provider: "news_provider",
          source_event_id: "news-123",
          catalyst_type: "earnings",
          published_at: "2026-09-21T13:30:00.000Z",
        },
      ],
    },
    now,
  ).summary;

  return { market, sector, catalyst };
}

function assess(
  overrides: {
    market?: unknown;
    sector?: unknown;
    catalyst?: unknown;
    candidate_symbol?: unknown;
    market_date?: unknown;
  } = {},
  evaluatedAt = now,
) {
  const inputs = admittedInputs();
  const {
    candidate_symbol: candidateSymbol = "NVDA",
    market_date: marketDate = "2026-09-21",
    market = inputs.market,
    sector = inputs.sector,
    catalyst = inputs.catalyst,
  } = overrides;

  return assessShadowContextualQuality(
    {
      candidate_symbol: candidateSymbol,
      market_date: marketDate,
      market_context: market,
      sector_relative_strength: sector,
      catalyst_presence: catalyst,
    },
    evaluatedAt,
  );
}

test.describe("shadow contextual quality assessment", () => {
  test("joins complete current context as explainable research-only evidence", () => {
    const result = assess();

    expect(result).toMatchObject({
      policy_version: shadowContextualQualityPolicyVersion,
      candidate_symbol: "NVDA",
      market_date: "2026-09-21",
      status: "research_ready",
      admissible_for_shadow_evaluation: true,
      can_change_ranking_or_publication: false,
      gaps: [],
    });
    expect(result.components).toEqual([
      expect.objectContaining({
        component: "market_regime",
        status: "usable",
        signal: "risk_on",
      }),
      expect.objectContaining({
        component: "sector_relative_strength",
        status: "usable",
        signal: "outperforming_sector",
        details: {
          stock_vs_sector_return_percent: 0.8,
          sector_vs_market_return_percent: 0.3,
        },
      }),
      expect.objectContaining({
        component: "catalyst_presence",
        status: "usable",
        signal: "present",
      }),
    ]);
  });

  test("never substitutes a missing context component with a neutral signal", () => {
    const inputs = admittedInputs();
    const result = assess({
      catalyst: {
        ...inputs.catalyst,
        status: "incomplete",
        admissible_for_context: false,
        catalyst_presence: "unavailable",
      },
    });

    expect(result).toMatchObject({
      status: "unavailable",
      admissible_for_shadow_evaluation: false,
      can_change_ranking_or_publication: false,
      gaps: ["catalyst_presence_unavailable"],
    });
    expect(result.components[2]).toMatchObject({
      status: "unavailable",
      signal: null,
      gaps: ["catalyst_presence_unavailable"],
    });
  });

  test("rechecks freshness at evaluation time rather than trusting a prior usable status", () => {
    const result = assess({}, new Date("2026-09-21T15:10:01.000Z"));

    expect(result).toMatchObject({
      status: "unavailable",
      admissible_for_shadow_evaluation: false,
      gaps: expect.arrayContaining(["context_observation_stale"]),
    });
  });

  test("rejects cross-date context and candidate identity mismatches", () => {
    const inputs = admittedInputs();
    const result = assess({
      market: { ...inputs.market, market_date: "2026-09-20" },
      sector: {
        ...inputs.sector,
        candidate: { ...inputs.sector.candidate!, symbol: "AMD" },
      },
      catalyst: { ...inputs.catalyst, candidate_symbol: "AMD" },
    });

    expect(result).toMatchObject({
      status: "unavailable",
      admissible_for_shadow_evaluation: false,
      gaps: expect.arrayContaining([
        "context_market_date_mismatch",
        "sector_candidate_symbol_mismatch",
        "catalyst_candidate_symbol_mismatch",
      ]),
    });
  });

  test("rejects an input that attempts to claim ranking authority", () => {
    const inputs = admittedInputs();
    const result = assess({
      market: {
        ...inputs.market,
        can_change_ranking_or_publication: true,
      },
    });

    expect(result).toMatchObject({
      status: "unavailable",
      can_change_ranking_or_publication: false,
      gaps: ["market_context_unavailable"],
    });
  });

  test("fails closed for an impossible market date without throwing", () => {
    const result = assess({ market_date: "2026-02-30" });

    expect(result).toMatchObject({
      market_date: null,
      status: "unavailable",
      admissible_for_shadow_evaluation: false,
      gaps: expect.arrayContaining([
        "market_date_invalid",
        "context_market_date_mismatch",
      ]),
    });
  });

  test("does not trust a usable label when component identity or source coherence is forged", () => {
    const inputs = admittedInputs();
    const result = assess({
      market: {
        ...inputs.market,
        benchmarks: inputs.market.benchmarks.map((benchmark, index) =>
          index === 1 ? { ...benchmark, provider: "other_provider" } : benchmark,
        ),
      },
      sector: {
        ...inputs.sector,
        sector_benchmark: {
          ...inputs.sector.sector_benchmark!,
          symbol: "NVDA",
        },
      },
    });

    expect(result).toMatchObject({
      status: "unavailable",
      gaps: expect.arrayContaining([
        "market_context_unavailable",
        "sector_relative_strength_unavailable",
      ]),
    });
  });
});
