import { expect, test } from "@playwright/test";

import { buildDailyLearningReviewSummary } from "../../lib/daily-learning-review";
import {
  buildSetupLabel,
  buildSetupLabelingSummary,
  type TureSetupLabel,
} from "../../lib/setup-labeling";
import type { RecommendationOutcome } from "../../lib/recommendation-outcome-tracker";
import type { RecommendationSnapshot } from "../../lib/recommendation-snapshot";

const evaluatedAt = "2026-07-06T15:00:00.000Z";
const tradingDay = "2026-07-06";

function expectAdvisory(label: TureSetupLabel) {
  expect(label.advisory_only).toBe(true);
}

function snapshot(
  ticker: string,
  overrides: Partial<RecommendationSnapshot> = {},
): RecommendationSnapshot {
  const fingerprint = overrides.snapshot_fingerprint ?? `snap-${ticker}`;
  const researchOnly =
    overrides.source_mode === "research_only" ||
    overrides.payload_json?.visibility_status === "research_only";

  return {
    id: overrides.id ?? fingerprint,
    snapshot_fingerprint: fingerprint,
    recommendation_id:
      "recommendation_id" in overrides
        ? (overrides.recommendation_id ?? null)
        : `rec-${ticker}`,
    scan_run_id: overrides.scan_run_id ?? "rec_scan_run_setup_labeling",
    ticker: overrides.ticker ?? ticker,
    company_name: overrides.company_name ?? null,
    recommended_at: overrides.recommended_at ?? "2026-07-06T14:30:00.000Z",
    app_timestamp: overrides.app_timestamp ?? "2026-07-06T14:30:00.000Z",
    window: overrides.window ?? "midday",
    status: overrides.status ?? (researchOnly ? "hidden" : "visible"),
    source_mode: overrides.source_mode ?? (researchOnly ? "research_only" : "official"),
    data_mode: overrides.data_mode ?? (researchOnly ? "research_only" : "supabase"),
    market_session_phase: overrides.market_session_phase ?? "regular",
    market_session_risk: overrides.market_session_risk ?? null,
    market_session_source: overrides.market_session_source ?? null,
    is_visible: overrides.is_visible ?? !researchOnly,
    is_demo: overrides.is_demo ?? false,
    is_mock: overrides.is_mock ?? false,
    is_real: overrides.is_real ?? true,
    entry: overrides.entry ?? 100,
    entry_low: overrides.entry_low ?? 100,
    entry_high: overrides.entry_high ?? 100,
    stop: overrides.stop ?? 98,
    target: overrides.target ?? 104,
    side: overrides.side ?? "long",
    risk_per_share: overrides.risk_per_share ?? 2,
    reward_per_share: overrides.reward_per_share ?? 4,
    planned_risk_reward: overrides.planned_risk_reward ?? 2,
    confidence: overrides.confidence ?? 70,
    score: overrides.score ?? 70,
    rating: overrides.rating ?? "valid",
    label: overrides.label ?? null,
    type: overrides.type ?? null,
    rationale: overrides.rationale ?? null,
    reason: overrides.reason ?? null,
    catalyst: overrides.catalyst ?? null,
    primary_risk: overrides.primary_risk ?? null,
    market_data_snapshot: overrides.market_data_snapshot ?? null,
    quote_price: overrides.quote_price ?? 100,
    volume: overrides.volume ?? null,
    liquidity: overrides.liquidity ?? null,
    spread: overrides.spread ?? null,
    freshness: overrides.freshness ?? null,
    data_age_minutes: overrides.data_age_minutes ?? null,
    intake_quality_json: overrides.intake_quality_json ?? null,
    scan_observability_json: overrides.scan_observability_json ?? null,
    empty_state_json: overrides.empty_state_json ?? null,
    quality_json: overrides.quality_json ?? null,
    payload_json: overrides.payload_json ?? {
      batch_fingerprint: "rec_batch_setup_labeling",
      visibility_status: researchOnly ? "research_only" : "visible",
    },
    was_taken: overrides.was_taken ?? false,
    linked_position_id: overrides.linked_position_id ?? null,
    created_at: overrides.created_at ?? "2026-07-06T14:30:00.000Z",
    updated_at: overrides.updated_at ?? "2026-07-06T14:30:00.000Z",
  };
}

function outcome(
  ticker: string,
  overrides: Partial<RecommendationOutcome> = {},
): RecommendationOutcome {
  const fingerprint = overrides.snapshot_fingerprint ?? `snap-${ticker}`;

  return {
    id: overrides.id ?? `outcome-${ticker}-${overrides.horizon ?? "15m"}`,
    snapshot_id: overrides.snapshot_id ?? fingerprint,
    snapshot_fingerprint:
      "snapshot_fingerprint" in overrides
        ? (overrides.snapshot_fingerprint ?? null)
        : fingerprint,
    recommendation_id:
      "recommendation_id" in overrides
        ? (overrides.recommendation_id ?? null)
        : `rec-${ticker}`,
    ticker: "ticker" in overrides ? (overrides.ticker ?? null) : ticker,
    side: overrides.side ?? "long",
    recommended_at: overrides.recommended_at ?? "2026-07-06T14:30:00.000Z",
    evaluated_at: overrides.evaluated_at ?? evaluatedAt,
    horizon: overrides.horizon ?? "15m",
    status: overrides.status ?? "neither_hit",
    entry: overrides.entry ?? 100,
    stop: overrides.stop ?? 98,
    target: overrides.target ?? 104,
    entry_triggered: overrides.entry_triggered ?? true,
    entry_triggered_at: overrides.entry_triggered_at ?? evaluatedAt,
    target_hit: overrides.target_hit ?? false,
    target_hit_at: overrides.target_hit_at ?? null,
    stop_hit: overrides.stop_hit ?? false,
    stop_hit_at: overrides.stop_hit_at ?? null,
    first_terminal_event: overrides.first_terminal_event ?? "neither",
    best_price_after_recommendation:
      overrides.best_price_after_recommendation ?? 101,
    worst_price_after_recommendation:
      overrides.worst_price_after_recommendation ?? 99,
    best_r: "best_r" in overrides ? (overrides.best_r ?? null) : 0.2,
    worst_r: "worst_r" in overrides ? (overrides.worst_r ?? null) : -0.1,
    eod_price: overrides.eod_price ?? null,
    eod_r: overrides.eod_r ?? null,
    current_price: overrides.current_price ?? 100,
    current_r: overrides.current_r ?? 0,
    max_favorable_excursion: overrides.max_favorable_excursion ?? 1,
    max_adverse_excursion: overrides.max_adverse_excursion ?? -1,
    time_to_entry_minutes: overrides.time_to_entry_minutes ?? 2,
    time_to_target_minutes: overrides.time_to_target_minutes ?? null,
    time_to_stop_minutes: overrides.time_to_stop_minutes ?? null,
    source: overrides.source ?? "intraday_candles",
    provider: overrides.provider ?? "twelve_data",
    data_completeness: overrides.data_completeness ?? "complete",
    warnings: overrides.warnings ?? [],
    blockers: overrides.blockers ?? [],
    payload_json: overrides.payload_json ?? {},
    created_at: overrides.created_at ?? evaluatedAt,
    updated_at: overrides.updated_at ?? evaluatedAt,
  };
}

test("setup labeling classifies VWAP pullback", () => {
  const label = buildSetupLabel({
    setup_type: "VWAP reclaim pullback",
    reason_text: "Pullback held near VWAP and reclaimed momentum.",
  });

  expect(label.setup_family).toBe("vwap_pullback");
  expect(label.setup_confidence).toBe("high");
  expect(label.reason_codes).toContain("vwap_pullback_context");
  expect(label.evidence.has_vwap_context).toBe(true);
  expectAdvisory(label);
});

test("setup labeling classifies momentum breakout", () => {
  const label = buildSetupLabel({
    setup_type: "momentum breakout",
    reason_text: "Momentum break above range high.",
  });

  expect(label.setup_family).toBe("momentum_breakout");
  expect(label.reason_codes).toContain("momentum_breakout_context");
  expectAdvisory(label);
});

test("setup labeling classifies high relative volume continuation", () => {
  const label = buildSetupLabel({
    reason_text: "High relative volume continuation with momentum.",
    payloads: [{ relative_volume: 3.2, volume_status: "unusual volume" }],
  });

  expect(label.setup_family).toBe("high_relative_volume_continuation");
  expect(label.evidence.has_volume_context).toBe(true);
  expectAdvisory(label);
});

test("setup labeling classifies gap continuation", () => {
  const label = buildSetupLabel({
    reason_text: "Gap up continuation with trend follow through.",
    payloads: [{ gap_pct: 4.1, gap_direction: "up" }],
  });

  expect(label.setup_family).toBe("gap_continuation");
  expect(label.evidence.has_gap_context).toBe(true);
  expectAdvisory(label);
});

test("setup labeling falls back to unknown on missing metadata", () => {
  const label = buildSetupLabel({});

  expect(label.setup_family).toBe("unknown");
  expect(label.setup_confidence).toBe("low");
  expect(label.reason_codes).toContain("insufficient_setup_metadata");
  expectAdvisory(label);
});

test("setup labeling stays low confidence when metadata is sparse", () => {
  const label = buildSetupLabel({ ticker: "AAPL" });

  expect(label.setup_family).toBe("unknown");
  expect(label.setup_confidence).toBe("low");
  expect(label.caution_flags).toContain("missing_vwap_context");
  expectAdvisory(label);
});

test("setup labeling summary counts mix and visible research split", () => {
  const visible = buildSetupLabel({
    setup_type: "momentum breakout",
    reason_text: "Momentum breakout above range high.",
  });
  const research = buildSetupLabel({
    reason_text: "VWAP pullback reclaim.",
  });
  const unknown = buildSetupLabel({});
  const summary = buildSetupLabelingSummary({
    labels: [
      { visibility: "visible", label: visible },
      { visibility: "research_only", label: research },
      { visibility: "research_only", label: unknown },
    ],
    currentBatchLabels: [
      { visibility: "visible", label: visible },
      { visibility: "research_only", label: research },
    ],
  });

  expect(summary.advisory_mode).toBe(true);
  expect(summary.current_batch_labeled_count).toBe(2);
  expect(summary.current_batch_total_count).toBe(2);
  expect(summary.setup_mix.momentum_breakout).toBe(1);
  expect(summary.visible_setup_mix.momentum_breakout).toBe(1);
  expect(summary.research_only_setup_mix.vwap_pullback).toBe(1);
  expect(summary.unknown_setup_label_count).toBe(1);
  expect(summary.low_confidence_label_count).toBe(1);
  expect(summary.top_setup_label_gaps.insufficient_setup_metadata).toBe(1);
});

test("daily learning review groups outcomes by setup family", () => {
  const visibleSnapshot = snapshot("AAPL", {
    payload_json: {
      batch_fingerprint: "rec_batch_setup_labeling",
      visibility_status: "visible",
      setup_type: "momentum breakout",
      recommendation: {
        rationale: "Momentum breakout above range high.",
      },
    },
  });
  const researchSnapshot = snapshot("PLTR", {
    source_mode: "research_only",
    data_mode: "research_only",
    payload_json: {
      batch_fingerprint: "rec_batch_setup_labeling",
      visibility_status: "research_only",
      learning_acceleration_sample: true,
      setup_type: "VWAP reclaim pullback",
    },
  });
  const summary = buildDailyLearningReviewSummary({
    trading_day: tradingDay,
    latest_batch_fingerprint: "rec_batch_setup_labeling",
    snapshots: [visibleSnapshot, researchSnapshot],
    outcomes: [
      outcome("AAPL", {
        snapshot_fingerprint: visibleSnapshot.snapshot_fingerprint,
        recommendation_id: visibleSnapshot.recommendation_id,
      }),
      outcome("PLTR", {
        snapshot_fingerprint: researchSnapshot.snapshot_fingerprint,
        recommendation_id: researchSnapshot.recommendation_id,
      }),
    ],
    now: evaluatedAt,
  });

  expect(
    summary.setup_family_breakdowns.map((item) => item.setup_family),
  ).toEqual(expect.arrayContaining(["momentum_breakout", "vwap_pullback"]));
  expect(summary.setup_labeling.setup_mix.momentum_breakout).toBe(1);
  expect(summary.setup_labeling.research_only_setup_mix.vwap_pullback).toBe(1);
  expect(summary.setup_labeling.advisory_mode).toBe(true);
});

