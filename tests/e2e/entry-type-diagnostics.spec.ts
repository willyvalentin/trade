import { expect, test } from "@playwright/test";

import {
  evaluateEntryTypeAwareTrigger,
  inferRecommendationEntryTypeMetadata,
  summarizeEntryTypeTriggerDiagnostics,
} from "../../lib/recommendation-entry-type";
import {
  parseRecommendationConfidenceMetadata,
  recommendationConfidenceMetadataPrefix,
} from "../../lib/recommendation-inline-metadata";
import { computePlanPriceFreshnessDiagnostics } from "../../lib/plan-price-freshness";
import { buildPlanReferenceMetadataTrace } from "../../lib/plan-reference-metadata-trace";
import { resolveDeterministicFallbackPlanReference } from "../../lib/deterministic-fallback-plan-reference";
import { runRecommendationOutcomeEvaluation } from "../../lib/recommendation-outcome-evaluation-runner";
import { computeRecommendationOutcome } from "../../lib/recommendation-outcome-tracker";
import { buildRecommendationSnapshot } from "../../lib/recommendation-snapshot";

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

test("entry type reads completed retained candles without provider refetch", async () => {
  const snapshot = buildRecommendationSnapshot({
    recommendation_id: "rec_jpm",
    ticker: "JPM",
    company_name: "JPMorgan Chase",
    recommended_at: "2026-06-17T14:25:00.000Z",
    app_timestamp: "2026-06-17T14:25:00.000Z",
    entry: 99,
    stop: 97,
    target: 103,
    side: "long",
    quote_price: 100,
    payload: {
      reference_price_used_for_plan: 100,
      reference_price_source: "provider_quote_price",
      reference_price_read_path: "payload.reference_price_used_for_plan",
    },
  });
  const retainedCandles = [
    {
      timestamp: "2026-06-17T14:30:00.000Z",
      open: 99.5,
      high: 98.8,
      low: 98,
      close: 98.4,
      volume: 1000,
    },
  ];
  const existingOutcome = computeRecommendationOutcome({
    snapshot,
    horizon: "15m",
    evaluated_at: "2026-06-17T14:40:00.000Z",
    source: "intraday_candles",
    data_completeness: "complete",
    candles: retainedCandles,
  }).outcome;
  const completedOutcomeWithRetainedCandles = {
    ...existingOutcome,
    payload_json: {
      ...existingOutcome.payload_json,
      counterfactual_candles: retainedCandles,
      retained_candles_available: true,
      counterfactual_ready: true,
    },
  };
  let fetchCalls = 0;

  const run = await runRecommendationOutcomeEvaluation({
    snapshots: [snapshot],
    existingOutcomes: [completedOutcomeWithRetainedCandles],
    horizons: ["15m"],
    enrichCompletedOutcomes: true,
    fetchCandles: async () => {
      fetchCalls += 1;
      throw new Error("Provider should not be called for retained-candle readback.");
    },
  });

  expect(fetchCalls).toBe(0);
  expect(run.completed_outcomes_seen_count).toBe(1);
  expect(run.completed_outcomes_skipped_already_enriched_count).toBe(1);
  expect(run.candle_requests_executed).toBe(0);
  expect(run.entry_type_trigger_summary?.total_outcomes).toBe(1);
  expect(run.entry_type_trigger_summary?.disagreement_count).toBe(1);
  expect(run.entry_type_trigger_summary?.tickers_with_disagreements).toEqual([
    "JPM",
  ]);
  expect(run.plan_reference_metadata_trace.total_traced_items).toBe(1);
  expect(run.plan_reference_metadata_trace.missing_reference_price_count).toBe(0);
  expect(run.candidates[0]?.plan_reference_metadata_trace?.ticker).toBe("JPM");
  expect(run.candidates[0]?.status).toBe("skipped");
  expect(run.candidates[0]?.entry_type).toBe("pullback_limit");
  expect(run.candidates[0]?.entry_type_aware_entry_triggered).toBe(true);
  expect(run.candidates[0]?.entry_type_trigger_disagreement).toBe(true);
  expect(run.candidates[0]?.entry_type_trigger_disagreement_reason).toBe(
    "long_low_touches_entry_differs_from_official_range_touch",
  );
  expect(run.candidates[0]?.outcome_status).toBe(existingOutcome.status);
});

test("entry type reads reference metadata promoted from recommendation inline metadata", () => {
  const inlineMetadata = {
    plan_reference_price: {
      reference_price_used_for_plan: 100,
      reference_price_source: "candidate_close_price",
      reference_price_timestamp: "2026-06-17T14:25:00.000Z",
      reference_price_symbol: "JPM",
      reference_price_provider: "twelve_data",
      reference_price_read_path: "candidate.latest_close",
    },
    reference_price_used_for_plan: 100,
    reference_price_source: "candidate_close_price",
    reference_price_timestamp: "2026-06-17T14:25:00.000Z",
    reference_price_symbol: "JPM",
    reference_price_provider: "twelve_data",
    reference_price_read_path: "candidate.latest_close",
    plan_reference_metadata_status: "present",
    plan_reference_metadata_missing_reason: null,
  };
  const snapshot = buildRecommendationSnapshot({
    recommendation_id: "rec_jpm_inline",
    ticker: "JPM",
    recommended_at: "2026-06-17T14:25:00.000Z",
    app_timestamp: "2026-06-17T14:25:00.000Z",
    entry: 99,
    stop: 97,
    target: 103,
    side: "long",
    payload: {
      recommendation: {
        reason_to_avoid: `Avoid only if momentum fails.${recommendationConfidenceMetadataPrefix}${JSON.stringify(inlineMetadata)}]`,
      },
    },
  });

  expect(snapshot.payload_json.reference_price_used_for_plan).toBe(100);
  expect(snapshot.payload_json.reference_price_source).toBe(
    "candidate_close_price",
  );
  expect(snapshot.payload_json.plan_reference_metadata_status).toBe("present");
  expect(snapshot.payload_json.entry_type).toBe("pullback_limit");

  const freshness = computePlanPriceFreshnessDiagnostics({
    snapshot,
    candles: [
      {
        timestamp: "2026-06-17T14:30:00.000Z",
        close: 100,
      },
    ],
  });

  expect(freshness.reference_price_used_for_plan).toBe(100);
  expect(freshness.reference_price_source).toBe("candidate_close_price");
  expect(freshness.plan_reference_metadata_status).toBe("present");

  const trace = buildPlanReferenceMetadataTrace({ snapshots: [snapshot] });
  expect(trace.complete_reference_metadata_count).toBe(1);
  expect(trace.missing_reference_price_count).toBe(0);
  expect(
    trace.sample_traces[0]?.reference_price_candidate_values_found.some(
      (value) =>
        value.read_path.includes("confidence_meta") &&
        value.parse_status === "present_numeric",
    ),
  ).toBe(true);
});

test("deterministic fallback plan reference captures latest close base price", () => {
  const planReference = resolveDeterministicFallbackPlanReference({
    candidate: {
      ticker: "SMCI",
      latest_close: 29.11,
      intraday_indicator_cached_at: "2026-06-17T14:25:00.000Z",
      intraday_indicator_source: "cache",
      intraday_indicator_stale: true,
    },
    entry: 47.25,
    stop: 45,
    target: 51,
  });

  expect(planReference.reference_price_used_for_plan).toBe(29.11);
  expect(planReference.reference_price_source).toBe("fallback_last_price");
  expect(planReference.reference_price_read_path).toBe("candidate.latest_close");
  expect(planReference.reference_price_timestamp).toBe(
    "2026-06-17T14:25:00.000Z",
  );
  expect(planReference.reference_price_provider).toBe("twelve_data");
  expect(planReference.reference_price_staleness_hint).toBe("stale");
  expect(planReference.plan_reference_metadata_status).toBe("present");
  expect(planReference.recommendation_build_path).toBe(
    "deterministic_fallback",
  );
});

test("plan reference deterministic fallback inline metadata remains parseable and reaches snapshot diagnostics", () => {
  const planReference = resolveDeterministicFallbackPlanReference({
    candidate: {
      ticker: "AMD",
      latest_close: "120.5",
      intraday_indicator_cached_at: "2026-06-17T14:25:00.000Z",
      intraday_indicator_source: "fresh",
    },
    entry: 119,
    stop: 116,
    target: 125,
  });
  const inlineJson = {
    plan_reference_price: planReference,
    ...planReference,
    entry_type: "pullback_limit",
    entry_trigger_semantics: "long_low_touches_entry",
    entry_type_source: "deterministic_plan_builder",
    entry_type_confidence: "medium",
    entry_type_warnings: [],
  };
  const reasonToAvoid = `Avoid if momentum fails.${recommendationConfidenceMetadataPrefix}${JSON.stringify(inlineJson)}]`;

  const parsed = parseRecommendationConfidenceMetadata(reasonToAvoid);
  expect(parsed?.plan_reference_price).toEqual(planReference);
  expect(parsed?.reference_price_used_for_plan).toBe(120.5);

  const snapshot = buildRecommendationSnapshot({
    recommendation_id: "rec_amd_deterministic",
    ticker: "AMD",
    recommended_at: "2026-06-17T14:25:00.000Z",
    app_timestamp: "2026-06-17T14:25:00.000Z",
    entry: 119,
    stop: 116,
    target: 125,
    side: "long",
    payload: {
      recommendation: {
        reason_to_avoid: reasonToAvoid,
      },
    },
  });

  expect(snapshot.payload_json.reference_price_used_for_plan).toBe(120.5);
  expect(snapshot.payload_json.reference_price_source).toBe("fallback_last_price");
  expect(snapshot.payload_json.reference_price_staleness_hint).toBe("fresh");
  expect(snapshot.payload_json.recommendation_build_path).toBe(
    "deterministic_fallback",
  );
  expect(snapshot.payload_json.plan_price_freshness).toMatchObject({
    reference_price_used_for_plan: 120.5,
    reference_price_source: "fallback_last_price",
    reference_price_timestamp: "2026-06-17T14:25:00.000Z",
    reference_price_read_path: "snapshot.payload_json.reference_price_used_for_plan",
    plan_reference_metadata_status: "present",
  });
  expect(snapshot.payload_json.entry_type).toBe("pullback_limit");

  const freshness = computePlanPriceFreshnessDiagnostics({ snapshot });
  expect(freshness.reference_price_used_for_plan).toBe(120.5);
  expect(freshness.plan_reference_metadata_status).toBe("present");

  const trace = buildPlanReferenceMetadataTrace({ snapshots: [snapshot] });
  expect(trace.complete_reference_metadata_count).toBe(1);
  expect(trace.reference_price_read_path_counts).toMatchObject({
    "recommendation.reason_to_avoid.confidence_meta.plan_reference_price.reference_price_used_for_plan":
      1,
  });
});

test("plan reference deterministic fallback missing base price records metadata gap", () => {
  const planReference = resolveDeterministicFallbackPlanReference({
    candidate: { ticker: "COIN" },
    entry: 170,
    stop: 164,
    target: 182,
  });

  expect(planReference.reference_price_used_for_plan).toBeNull();
  expect(planReference.reference_price_source).toBe("unknown");
  expect(planReference.reference_price_read_path).toBeNull();
  expect(planReference.plan_reference_metadata_status).toBe(
    "missing_but_plan_prices_present",
  );
  expect(planReference.plan_reference_metadata_missing_reason).toBe(
    "entry_stop_or_target_present_without_reference_price",
  );
});

test("plan reference trace accepts numeric string inline reference price", () => {
  const inlineMetadata = {
    plan_reference_price: {
      reference_price_used_for_plan: "100.25",
      reference_price_source: "candidate_close_price",
      reference_price_timestamp: "2026-06-17T14:25:00.000Z",
      reference_price_symbol: "AAPL",
      reference_price_provider: "twelve_data",
      reference_price_read_path: "candidate.latest_close",
    },
  };
  const snapshot = buildRecommendationSnapshot({
    recommendation_id: "rec_aapl_inline_string",
    ticker: "AAPL",
    recommended_at: "2026-06-17T14:25:00.000Z",
    app_timestamp: "2026-06-17T14:25:00.000Z",
    entry: 99,
    stop: 97,
    target: 103,
    side: "long",
    payload: {
      recommendation: {
        reason_to_avoid: `Avoid only if momentum fails.${recommendationConfidenceMetadataPrefix}${JSON.stringify(inlineMetadata)}]`,
      },
    },
  });

  const trace = buildPlanReferenceMetadataTrace({ snapshots: [snapshot] });

  expect(trace.complete_reference_metadata_count).toBe(1);
  expect(
    trace.sample_traces[0]?.reference_price_candidate_values_found.some(
      (value) => value.parse_status === "present_numeric_string",
    ),
  ).toBe(true);
});

test("plan reference trace reports malformed inline metadata", () => {
  const snapshot = buildRecommendationSnapshot({
    recommendation_id: "rec_crm_malformed_inline",
    ticker: "CRM",
    recommended_at: "2026-06-17T14:25:00.000Z",
    app_timestamp: "2026-06-17T14:25:00.000Z",
    entry: 250,
    stop: 245,
    target: 260,
    side: "long",
    payload: {
      recommendation: {
        reason_to_avoid: `Avoid only if momentum fails.${recommendationConfidenceMetadataPrefix}{bad-json]`,
      },
    },
  });

  const trace = buildPlanReferenceMetadataTrace({ snapshots: [snapshot] });

  expect(trace.malformed_inline_metadata_count).toBe(1);
  expect(trace.top_malformed_inline_metadata_tickers).toEqual(["CRM"]);
  expect(trace.sample_traces[0]?.parse_status).toBe("malformed_inline_metadata");
  expect(trace.sample_traces[0]?.classification).toBe("malformed_inline_metadata");
});

test("entry type marks missing reference metadata when plan prices exist", () => {
  const snapshot = buildRecommendationSnapshot({
    recommendation_id: "rec_missing_ref",
    ticker: "CAT",
    recommended_at: "2026-06-17T14:25:00.000Z",
    app_timestamp: "2026-06-17T14:25:00.000Z",
    entry: 300,
    stop: 294,
    target: 312,
    side: "long",
    payload: {
      recommendation: {
        reason_to_avoid: "Avoid if momentum fails.",
      },
    },
  });

  expect(snapshot.payload_json.reference_price_used_for_plan).toBeUndefined();
  expect(snapshot.payload_json.plan_reference_metadata_status).toBe(
    "missing_but_plan_prices_present",
  );
  expect(snapshot.payload_json.plan_reference_metadata_missing_reason).toBe(
    "entry_stop_or_target_present_without_reference_price",
  );
  expect(snapshot.payload_json.entry_type).toBe("unknown");
  expect(snapshot.payload_json.entry_type_warnings).toContain(
    "reference_price_unavailable",
  );

  const trace = buildPlanReferenceMetadataTrace({ snapshots: [snapshot] });
  expect(trace.missing_reference_price_count).toBe(1);
  expect(trace.top_missing_reference_tickers).toEqual(["CAT"]);
  expect(trace.sample_traces[0]?.first_missing_stage).toBe(
    "generated_recommendation_object_before_persistence",
  );
});
