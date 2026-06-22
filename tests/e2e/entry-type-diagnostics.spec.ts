import { expect, test } from "@playwright/test";

import {
  evaluateEntryTypeAwareTrigger,
  inferRecommendationEntryTypeMetadata,
  summarizeEntryTypeTriggerDiagnostics,
} from "../../lib/recommendation-entry-type";
import {
  markPlanReferenceRetained,
  resolvePlanReferencePriceMetadata,
} from "../../lib/recommendation-plan-reference";
import { recommendationConfidenceMetadataPrefix } from "../../lib/recommendation-inline-metadata";
import { computePlanPriceFreshnessDiagnostics } from "../../lib/plan-price-freshness";
import { buildPlanReferenceMetadataTrace } from "../../lib/plan-reference-metadata-trace";
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
      side: "long",
      entry: 99,
      candles: [{ timestamp: "2026-06-17T14:30:00.000Z", high: 100, low: 98.9 }],
      officialEntryTriggered: true,
      officialStatus: "entry_triggered",
    }).entry_type_trigger_disagreement,
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
      side: "long",
      entry: 101,
      candles: [
        { timestamp: "2026-06-17T14:30:00.000Z", high: 101.2, low: 99 },
      ],
      officialEntryTriggered: false,
      officialStatus: "entry_not_triggered",
    }).entry_type_trigger_disagreement_reason,
  ).toBe("long_breakout_high_crossed_but_current_route_not_triggered");

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
    side: "long",
    entry: 99,
    candles: [],
    officialEntryTriggered: null,
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
    side: "long",
    entry: 101,
    candles: [{ timestamp: "2026-06-17T14:30:00.000Z", high: 101.2, low: 99 }],
    officialEntryTriggered: false,
    officialStatus: "entry_not_triggered",
  });

  const summary = summarizeEntryTypeTriggerDiagnostics([
    {
      ticker: "JPM",
      entryType: pullback,
      trigger: evaluateEntryTypeAwareTrigger({
        metadata: pullback,
        side: "long",
        entry: 99,
        candles: [{ timestamp: "2026-06-17T14:35:00.000Z", high: 100, low: 98.8 }],
        officialEntryTriggered: true,
        officialStatus: "entry_triggered",
      }),
      currentRouteTriggered: false,
    },
    {
      ticker: "JPM",
      entryType: breakout,
      trigger: disagreement,
      currentRouteTriggered: true,
    },
  ]);

  expect(summary.total_outcomes).toBe(2);
  expect(summary.known_entry_type_count).toBe(2);
  expect(summary.by_entry_type.pullback_limit).toBe(1);
  expect(summary.by_entry_type.breakout_stop).toBe(1);
  expect(summary.disagreement_count).toBe(1);
  expect(summary.tickers_with_disagreements).toEqual(["JPM"]);
});

test("deterministic fallback retains complete plan reference metadata before persistence", () => {
  const candidate = {
    ticker: "JPM",
    latest_close: 290.11,
    reference_price_timestamp: "2026-06-17T20:00:00.000Z",
    reference_price_provider: "twelve_data",
    quote: {
      price: 290.07,
      timestamp: "2026-06-17T19:59:30.000Z",
      provider: "twelve_data",
    },
    candle: {
      close: 290.03,
      timestamp: "2026-06-17T19:55:00.000Z",
      provider: "twelve_data",
    },
  };
  const planReference = markPlanReferenceRetained(
    resolvePlanReferencePriceMetadata(candidate),
  );
  const entryTypeMetadata = inferRecommendationEntryTypeMetadata({
    side: "long",
    entry: 288.5,
    referencePrice: planReference.reference_price_used_for_plan,
    referencePriceSource: planReference.reference_price_source,
    referencePriceReadPath: planReference.reference_price_read_path,
    source: "deterministic_plan_builder",
  });
  const generatedRecommendation = {
    ticker: "JPM",
    recommendation_build_path: "deterministic_fallback",
    plan_reference_price: planReference,
    entry_type_metadata: entryTypeMetadata,
    ...planReference,
    ...entryTypeMetadata,
  };

  expect(generatedRecommendation.reference_price_used_for_plan).toBe(290.11);
  expect(generatedRecommendation.reference_price_source).toBe(
    "scanner_candidate_latest_close",
  );
  expect(generatedRecommendation.reference_price_timestamp).toBe(
    "2026-06-17T20:00:00.000Z",
  );
  expect(generatedRecommendation.reference_price_symbol).toBe("JPM");
  expect(generatedRecommendation.reference_price_provider).toBe("twelve_data");
  expect(generatedRecommendation.reference_price_read_path).toBe(
    "scanner_candidate.latest_close",
  );
  expect(generatedRecommendation.plan_reference_metadata_status).toBe("complete");
  expect(generatedRecommendation.entry_type).toBe("pullback_limit");
  expect(generatedRecommendation.reference_price_missing_for_entry_type).toBe(
    false,
  );
});

test("deterministic fallback reference metadata survives snapshot readback", () => {
  const planReference = markPlanReferenceRetained(
    resolvePlanReferencePriceMetadata({
      ticker: "BAC",
      quote: {
        price: 44.32,
        timestamp: "2026-06-17T20:00:00.000Z",
        provider: "twelve_data",
      },
    }),
  );
  const entryTypeMetadata = inferRecommendationEntryTypeMetadata({
    side: "long",
    entry: 44.8,
    referencePrice: planReference.reference_price_used_for_plan,
    referencePriceSource: planReference.reference_price_source,
    referencePriceReadPath: planReference.reference_price_read_path,
    source: "deterministic_plan_builder",
  });
  const inlineMetadata = {
    plan_reference_price: planReference,
    recommendation_build_path: "deterministic_fallback",
    entry_type_metadata: entryTypeMetadata,
    ...planReference,
    ...entryTypeMetadata,
  };
  const snapshot = buildRecommendationSnapshot({
    recommendation_id: "rec_bac_deterministic",
    ticker: "BAC",
    recommended_at: "2026-06-17T20:01:00.000Z",
    app_timestamp: "2026-06-17T20:01:00.000Z",
    entry: 44.8,
    stop: 43.4,
    target: 47,
    side: "long",
    payload: {
      recommendation: {
        reason_to_avoid: `Avoid if momentum fades.${recommendationConfidenceMetadataPrefix}${JSON.stringify(inlineMetadata)}]`,
      },
    },
  });
  const trace = buildPlanReferenceMetadataTrace({ snapshots: [snapshot] });

  expect(snapshot.payload_json.reference_price_used_for_plan).toBe(44.32);
  expect(snapshot.payload_json.plan_reference_price).toMatchObject({
    reference_price_used_for_plan: 44.32,
    reference_price_source: "scanner_candidate_quote_price",
    reference_price_read_path: "scanner_candidate.quote.price",
  });
  expect(snapshot.payload_json.recommendation).toMatchObject({
    reference_price_used_for_plan: 44.32,
    reference_price_source: "scanner_candidate_quote_price",
    reference_price_read_path: "scanner_candidate.quote.price",
  });
  expect(snapshot.payload_json.entry_type).toBe("breakout_stop");
  expect(trace.complete_reference_metadata_count).toBe(1);
  expect(trace.missing_reference_price_count).toBe(0);
  expect(trace.first_missing_stage_counts).not.toHaveProperty(
    "generated_recommendation_object_before_persistence",
  );
});

test("deterministic fallback missing price does not fake unknown reference metadata", () => {
  const planReference = resolvePlanReferencePriceMetadata({
    ticker: "CAT",
    quote: {
      timestamp: "2026-06-17T20:00:00.000Z",
      provider: "twelve_data",
    },
  });
  const entryTypeMetadata = inferRecommendationEntryTypeMetadata({
    side: "long",
    entry: 300,
    referencePrice: planReference.reference_price_used_for_plan,
    referencePriceSource: planReference.reference_price_source,
    referencePriceReadPath: planReference.reference_price_read_path,
    source: "deterministic_plan_builder",
  });

  expect(planReference.reference_price_used_for_plan).toBeNull();
  expect(planReference.reference_price_source).toBe("unknown");
  expect(planReference.reference_price_read_path).toBeNull();
  expect(planReference.plan_reference_metadata_status).toBe("missing_price");
  expect(entryTypeMetadata.entry_type).toBe("unknown");
  expect(entryTypeMetadata.reference_price_missing_for_entry_type).toBe(true);
  expect(entryTypeMetadata.entry_type_warnings).toContain(
    "reference_price_missing_for_entry_type",
  );
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
  expect(run.entry_type_trigger_summary?.disagreement_count).toBe(0);
  expect(run.entry_type_trigger_summary?.tickers_with_disagreements).toEqual([]);
  expect(run.plan_reference_metadata_trace?.total_traced_items).toBe(1);
  expect(run.plan_reference_metadata_trace?.missing_reference_price_count).toBe(
    0,
  );
  expect(run.candidates[0]?.status).toBe("skipped");
  expect(run.candidates[0]?.entry_type_metadata?.entry_type).toBe(
    "pullback_limit",
  );
  expect(run.candidates[0]?.entry_type_aware_trigger).toBeNull();
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
    "reference_price_missing_for_entry_type",
  );

  const trace = buildPlanReferenceMetadataTrace({ snapshots: [snapshot] });
  expect(trace.missing_reference_price_count).toBe(1);
  expect(trace.top_missing_reference_tickers).toEqual(["CAT"]);
  expect(trace.sample_traces[0]?.first_missing_stage).toBe(
    "generated_recommendation_object_before_persistence",
  );
});
