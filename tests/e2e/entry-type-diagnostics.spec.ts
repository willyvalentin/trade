import { expect, test } from "@playwright/test";

import {
  evaluateEntryTypeAwareTrigger,
  inferRecommendationEntryTypeMetadata,
  summarizeEntryTypeTriggerDiagnostics,
} from "../../lib/recommendation-entry-type";

test("entry type infers trigger semantics conservatively", () => {
  const longPullback = inferRecommendationEntryTypeMetadata({
    side: "long",
    entry: 99,
    referencePrice: 100,
    referencePriceSource: "provider_quote_price",
    source: "deterministic_plan_builder",
  });
  expect(longPullback.entry_type).toBe("pullback_limit");
  expect(longPullback.entry_trigger_semantics).toBe("long_low_touches_entry");
  expect(
    evaluateEntryTypeAwareTrigger({
      metadata: longPullback,
      entry: 99,
      candles: [{ timestamp: "2026-06-17T14:30:00.000Z", high: 100, low: 98.9, close: 99.5 }],
      officialTriggered: true,
      officialTriggeredAt: "2026-06-17T14:30:00.000Z",
      officialStatus: "entry_triggered",
    }).trigger_disagreement,
  ).toBe(false);

  const longBreakout = inferRecommendationEntryTypeMetadata({
    side: "long",
    entry: 101,
    referencePrice: 100,
    referencePriceSource: "provider_quote_price",
    source: "deterministic_plan_builder",
  });
  expect(longBreakout.entry_type).toBe("breakout_stop");
  expect(longBreakout.entry_trigger_semantics).toBe("long_high_crosses_entry");
  expect(
    evaluateEntryTypeAwareTrigger({
      metadata: longBreakout,
      entry: 101,
      candles: [{ timestamp: "2026-06-17T14:30:00.000Z", high: 100.5, low: 99, close: 100 }],
      officialTriggered: true,
      officialTriggeredAt: "2026-06-17T14:30:00.000Z",
      officialStatus: "entry_triggered",
    }).disagreement_reason,
  ).toBe("long_high_crosses_entry_differs_from_official_range_touch");

  const marketReference = inferRecommendationEntryTypeMetadata({
    side: "long",
    entry: 100.2,
    referencePrice: 100,
    referencePriceSource: "provider_quote_price",
    source: "metadata_inference",
  });
  expect(marketReference.entry_type).toBe("market_reference");
  expect(marketReference.entry_trigger_semantics).toBe("immediate_reference");

  const shortPullback = inferRecommendationEntryTypeMetadata({
    side: "short",
    entry: 101,
    referencePrice: 100,
    source: "fallback_inference",
  });
  expect(shortPullback.entry_type).toBe("pullback_limit");
  expect(shortPullback.entry_trigger_semantics).toBe("short_high_touches_entry");

  const shortBreakout = inferRecommendationEntryTypeMetadata({
    side: "short",
    entry: 99,
    referencePrice: 100,
    source: "fallback_inference",
  });
  expect(shortBreakout.entry_type).toBe("breakout_stop");
  expect(shortBreakout.entry_trigger_semantics).toBe("short_low_crosses_entry");

  const unknown = inferRecommendationEntryTypeMetadata({
    side: "long",
    entry: 99,
    referencePrice: null,
    source: "fallback_inference",
  });
  const unknownTrigger = evaluateEntryTypeAwareTrigger({
    metadata: unknown,
    entry: 99,
    candles: [],
    officialTriggered: null,
    officialStatus: "incomplete",
  });
  expect(unknown.entry_type).toBe("unknown");
  expect(unknownTrigger.unknown_due_to_missing_reference).toBe(true);
});

test("entry type summarizes trigger disagreements", () => {
  const pullback = inferRecommendationEntryTypeMetadata({
    side: "long",
    entry: 99,
    referencePrice: 100,
    source: "deterministic_plan_builder",
  });
  const breakout = inferRecommendationEntryTypeMetadata({
    side: "long",
    entry: 101,
    referencePrice: 100,
    source: "deterministic_plan_builder",
  });
  const disagreement = evaluateEntryTypeAwareTrigger({
    metadata: breakout,
    entry: 101,
    candles: [{ timestamp: "2026-06-17T14:30:00.000Z", high: 100.5, low: 99, close: 100 }],
    officialTriggered: true,
    officialTriggeredAt: "2026-06-17T14:30:00.000Z",
    officialStatus: "entry_triggered",
  });

  const summary = summarizeEntryTypeTriggerDiagnostics([
    {
      ticker: "JPM",
      entry_type_metadata: pullback,
      entry_type_aware_trigger: evaluateEntryTypeAwareTrigger({
        metadata: pullback,
        entry: 99,
        candles: [{ timestamp: "2026-06-17T14:35:00.000Z", high: 100, low: 98.8, close: 99.1 }],
        officialTriggered: true,
        officialTriggeredAt: "2026-06-17T14:35:00.000Z",
        officialStatus: "entry_triggered",
      }),
    },
    {
      ticker: "JPM",
      entry_type_metadata: breakout,
      entry_type_aware_trigger: disagreement,
    },
  ]);

  expect(summary.total_candidates).toBe(2);
  expect(summary.known_entry_type_count).toBe(2);
  expect(summary.by_entry_type.pullback_limit).toBe(1);
  expect(summary.by_entry_type.breakout_stop).toBe(1);
  expect(summary.disagreement_count).toBe(1);
  expect(summary.disagreement_tickers).toEqual(["JPM"]);
});
