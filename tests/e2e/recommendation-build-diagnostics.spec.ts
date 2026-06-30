import { expect, test } from "@playwright/test";

import { buildBatchCandidateAuditSummary } from "../../lib/batch-candidate-audit";
import {
  buildMarketDiagnosticsConsoleSummary,
  type MarketDiagnosticsConsoleInput,
} from "../../lib/market-diagnostics-console";
import { hasBetterOutcomeCoverage } from "../../lib/recommendation-outcome-coverage";
import {
  buildOutcomePostEligibilityDiagnostics,
} from "../../lib/recommendation-outcome-post-eligibility-diagnostics";
import { canonicalizeOutcomeSnapshotsForBatch } from "../../lib/recommendation-outcome-snapshot-canonicalization";
import type { RecommendationOutcomeEvaluationCandidate } from "../../lib/recommendation-outcome-evaluation-runner";
import type { RecommendationOutcome } from "../../lib/recommendation-outcome-tracker";
import type { RecommendationSnapshot } from "../../lib/recommendation-snapshot";
import type { ScheduledScanTimelineEntry } from "../../lib/scheduled-scan-attempts";
import {
  buildSelectedCandidateBuildDiagnostic,
  normalizeCandidateBuildRejectionReason,
  summarizeSelectedCandidateBuildDiagnostics,
} from "../../lib/recommendation-build-diagnostics";

function sectionMetrics(
  input: ReturnType<typeof buildMarketDiagnosticsConsoleSummary>,
  sectionId: string,
) {
  const found = input.sections.find((section) => section.section_id === sectionId);
  expect(found, `missing diagnostics section ${sectionId}`).toBeTruthy();
  return found?.metrics ?? {};
}

function outcomeSnapshot(
  overrides: Partial<RecommendationSnapshot> = {},
): RecommendationSnapshot {
  const fingerprint = overrides.snapshot_fingerprint ?? "snap-AAPL-1";
  const timestamp = "2026-06-30T16:00:00.000Z";

  return {
    id: overrides.id ?? fingerprint,
    snapshot_fingerprint: fingerprint,
    recommendation_id: overrides.recommendation_id ?? `rec-${fingerprint}`,
    scan_run_id: overrides.scan_run_id ?? "rec_scan_run_test",
    ticker: overrides.ticker ?? "AAPL",
    company_name: overrides.company_name ?? null,
    recommended_at: overrides.recommended_at ?? timestamp,
    app_timestamp: overrides.app_timestamp ?? timestamp,
    window: overrides.window ?? "midday",
    status: overrides.status ?? "visible",
    source_mode: overrides.source_mode ?? "official",
    data_mode: overrides.data_mode ?? "supabase",
    market_session_phase: overrides.market_session_phase ?? "regular",
    market_session_risk: overrides.market_session_risk ?? null,
    market_session_source: overrides.market_session_source ?? null,
    is_visible: overrides.is_visible ?? true,
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
    confidence: overrides.confidence ?? 80,
    score: overrides.score ?? 80,
    rating: overrides.rating ?? null,
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
      batch_fingerprint: "rec_batch_current",
      visibility_status: "visible",
    },
    was_taken: overrides.was_taken ?? false,
    linked_position_id: overrides.linked_position_id ?? null,
    created_at: overrides.created_at ?? timestamp,
    updated_at: overrides.updated_at ?? timestamp,
  };
}

function outcome(
  overrides: Partial<RecommendationOutcome> = {},
): RecommendationOutcome {
  const timestamp = "2026-06-30T17:00:00.000Z";

  return {
    id: overrides.id ?? "outcome-1",
    snapshot_id: overrides.snapshot_id ?? null,
    snapshot_fingerprint: overrides.snapshot_fingerprint ?? "snap-AAPL-1",
    recommendation_id: overrides.recommendation_id ?? "rec-snap-AAPL-1",
    ticker: overrides.ticker ?? "AAPL",
    side: overrides.side ?? "long",
    recommended_at: overrides.recommended_at ?? "2026-06-30T16:00:00.000Z",
    evaluated_at: overrides.evaluated_at ?? timestamp,
    horizon: overrides.horizon ?? "15m",
    status: overrides.status ?? "neither_hit",
    entry: overrides.entry ?? 100,
    stop: overrides.stop ?? 98,
    target: overrides.target ?? 104,
    entry_triggered: overrides.entry_triggered ?? true,
    entry_triggered_at: overrides.entry_triggered_at ?? timestamp,
    target_hit: overrides.target_hit ?? false,
    target_hit_at: overrides.target_hit_at ?? null,
    stop_hit: overrides.stop_hit ?? false,
    stop_hit_at: overrides.stop_hit_at ?? null,
    first_terminal_event: overrides.first_terminal_event ?? "neither",
    best_price_after_recommendation:
      overrides.best_price_after_recommendation ?? 101,
    worst_price_after_recommendation:
      overrides.worst_price_after_recommendation ?? 99,
    best_r: overrides.best_r ?? 0.5,
    worst_r: overrides.worst_r ?? -0.5,
    eod_price: overrides.eod_price ?? null,
    eod_r: overrides.eod_r ?? null,
    current_price: overrides.current_price ?? 100,
    current_r: overrides.current_r ?? 0,
    max_favorable_excursion: overrides.max_favorable_excursion ?? 1,
    max_adverse_excursion: overrides.max_adverse_excursion ?? -1,
    time_to_entry_minutes: overrides.time_to_entry_minutes ?? 1,
    time_to_target_minutes: overrides.time_to_target_minutes ?? null,
    time_to_stop_minutes: overrides.time_to_stop_minutes ?? null,
    source: overrides.source ?? "api",
    provider: overrides.provider ?? "twelve_data",
    data_completeness: overrides.data_completeness ?? "complete",
    warnings: overrides.warnings ?? [],
    blockers: overrides.blockers ?? [],
    payload_json: overrides.payload_json ?? { candle_count: 10 },
    created_at: overrides.created_at ?? timestamp,
    updated_at: overrides.updated_at ?? timestamp,
  };
}

function outcomeCandidate(
  overrides: Partial<RecommendationOutcomeEvaluationCandidate> = {},
): RecommendationOutcomeEvaluationCandidate {
  return {
    candidate_id: overrides.candidate_id ?? "snap-AAPL-1:15m",
    snapshot_id: overrides.snapshot_id ?? "snap-AAPL-1",
    snapshot_fingerprint: overrides.snapshot_fingerprint ?? "snap-AAPL-1",
    recommendation_id: overrides.recommendation_id ?? "rec-snap-AAPL-1",
    ticker: overrides.ticker ?? "AAPL",
    horizon: overrides.horizon ?? "15m",
    status: overrides.status ?? "evaluated",
    candle_request:
      "candle_request" in overrides
        ? (overrides.candle_request ?? null)
        : {
            request_id: "candle-snap-AAPL-1",
            snapshot_id: "snap-AAPL-1",
            snapshot_fingerprint: "snap-AAPL-1",
            recommendation_id: "rec-snap-AAPL-1",
            ticker: "AAPL",
            horizon: "15m",
            start_at: "2026-06-30T16:00:00.000Z",
            end_at: "2026-06-30T16:15:00.000Z",
            interval: "5min",
          },
    candle_count: overrides.candle_count ?? 3,
    outcome_id: overrides.outcome_id ?? "outcome-1",
    outcome_status: overrides.outcome_status ?? "neither_hit",
    persistence_mode: overrides.persistence_mode ?? "supabase",
    plan_price_freshness: overrides.plan_price_freshness,
    entry_type_metadata: overrides.entry_type_metadata,
    entry_type_aware_trigger: overrides.entry_type_aware_trigger,
    warnings: overrides.warnings ?? [],
    error: overrides.error ?? null,
  };
}

function baseMarketDiagnosticsInput(
  overrides: Partial<MarketDiagnosticsConsoleInput> = {},
): MarketDiagnosticsConsoleInput {
  return {
    now: "2026-06-27T12:00:00.000Z",
    market_session: {
      evaluated_at: "2026-06-27T12:00:00.000Z",
      market_is_open: false,
      phase: "closed",
    },
    market_status: { dayType: "weekend" },
    data_mode_clarity: {
      overall_mode: "paper",
      execution_reality: "human_confirmed_required",
    },
    engine_control_center: { overall_status: "ready" },
    live_market_trial_readiness: {
      overall_status: "ready",
      blockers: [],
      warnings: [],
      checks: [],
      provider_env_readiness: {
        server_secret_status: "inferred_available",
        supabase_public_env_available: true,
      },
      persistence_readiness: {
        scan_runs_available: true,
        batches_available: true,
        snapshots_available: true,
      },
      scanner_readiness: { selected_ticker_count: 6 },
      outcome_readiness: {
        route_available: true,
        evaluated_recommendations: 24,
      },
      can_do_now: {
        observe_only: true,
        log_recommendations: false,
        evaluate_outcomes: true,
        paper_or_manual_tracking_ready: true,
      },
      not_enabled: {
        broker_automation: true,
        order_submission: true,
        automatic_avanza_execution: true,
        automatic_trading_execution: true,
      },
      latest_automation_scan: { decision: "market_closed" },
    },
    live_market_trial_runbook: {
      status: "waiting_for_next_window",
      phase: "market_closed",
      next_action: { label: "Wait for next window" },
      blockers: [],
      warnings: [],
    },
    scan_orchestration: {
      current_utc_time: "2026-06-27T12:00:00.000Z",
      current_ny_time: "2026-06-27 08:00 America/New_York",
      calendar_confidence: "high",
      provider_calendar_available: true,
      fallback_calendar_scan_allowed: false,
      active_window: "closed",
      decision: "market_closed",
      should_scan_now: false,
      next_window: "morning",
      next_window_label: "Morning",
      next_window_starts_at: "2026-06-29T13:45:00.000Z",
      warnings: [],
      official_scan_windows: [
        { label: "Morning", start_time: "09:45", end_time: "11:00" },
      ],
      official_window_statuses: [],
    },
    serving_cadence: {
      warnings: [],
      serving_decision: "market_closed",
      no_trade_valid: false,
      visible_recommendation_count: 6,
      batch_status: "served",
      batch_target: { min: 2, max: 6 },
    },
    provider_budget_guard: {
      status: "ok",
      next_action: { label: "No action" },
      warnings: [],
      plan_mode: "free",
      totals: {
        estimated_calls_per_window: 0,
        estimated_calls_per_day: 0,
      },
      latest_limit_signal: { status: "ok" },
    },
    scanner_universe: {
      warnings: [],
      selected_tickers: ["BAC", "JPM", "MSFT", "NVDA", "AAPL", "AMD"],
    },
    scanner_output_qa: {
      overall_status: "healthy",
      summary: "healthy",
      warnings: [],
      recommended_next_action: { label: "No action" },
      candidate_count: 22,
      metadata_coverage: {
        recommendation_rows_with_data_timestamp: 6,
        recommendation_rows_with_provider_source: 6,
        explicit_gap_count: 0,
        missing_metadata_fields: [],
        qa_checked_source_path: "retained_official_batch",
        metadata_missing_at_stage: null,
      },
    },
    real_output_readiness: {
      overall_status: "ready",
      blockers: [],
      warnings: [],
      coverage: {
        strong_count: 4,
        valid_count: 2,
        experimental_count: 0,
      },
    },
    batch_memory: {
      warnings: [],
      latest_batch: {
        batch_fingerprint: "rec_batch_1vxtb7z",
        scan_run_fingerprint: "rec_scan_run_vlz162",
      },
      persistence_status: "ok",
      persistence_mode: "persisted",
      total_batches: 1,
    },
    scan_run_history: {
      top_warnings: [],
      latest_run_status: "completed",
      total_scan_runs: 2,
    },
    daily_targets: {
      warnings: [],
      total_recommendations_today: 6,
      full_day_recommendation_target_min: 4,
      full_day_recommendation_target_max: 12,
    },
    day_window_target: {
      status: "served",
      strong_candidate_gate: {
        candidates_considered_for_strong: 14,
        candidates_blocked_from_strong: 0,
        top_blocking_reasons: [],
        blocked_by_stale_plan_count: 0,
        blocked_by_entry_distance_too_large_count: 0,
        blocked_by_invalid_risk_geometry_count: 0,
        blocked_by_missing_provider_reference_count: 0,
        blocked_by_setup_quality_below_minimum_count: 0,
      },
    },
    performance: {
      summary: {
        total_recommendations: 6,
        pending_outcomes: 0,
        evaluated_recommendations: 24,
      },
    },
    scan_readback: null,
    outcome_evaluation: null,
    outcome_learning: null,
    entry_tuning_proposal: null,
    recommendation_output_enrichment: null,
    metadata_coverage: null,
    ...overrides,
  } as MarketDiagnosticsConsoleInput;
}

test("broad no-trade candidate reasons split into exact build reasons", () => {
  expect(
    normalizeCandidateBuildRejectionReason(
      "AMD: scanner_cache_reference_too_old (scanner_candidate.latest_close)",
    ),
  ).toBe("scanner_cache_reference_too_old");
  expect(
    normalizeCandidateBuildRejectionReason(
      "NVDA: missing_fresh_reference_price (unknown_source)",
    ),
  ).toBe("missing_fresh_reference_price");
  expect(normalizeCandidateBuildRejectionReason("sanitizer rejected plan")).toBe(
    "sanitizer_rejected",
  );
});

test("selected candidates produce build diagnostics with examples", () => {
  const diagnostics = [
    buildSelectedCandidateBuildDiagnostic({
      ticker: "AMD",
      score: 86,
      tier: "strong",
      setupType: "VWAP_HOLD_CONTINUATION",
      source: "base_universe",
      referencePriceStatus: "complete",
      vwapStatus: "above_vwap",
      momentumStatus: "bullish",
      volumeStatus: "rising",
      riskGeometryStatus: "valid",
      enoughDataToBuildPlan: true,
      built: true,
    }),
    buildSelectedCandidateBuildDiagnostic({
      ticker: "MSFT",
      score: 78,
      tier: "valid",
      setupType: "PULLBACK_RECLAIM",
      source: "base_universe",
      referencePriceStatus: "missing_price",
      vwapStatus: "unknown",
      momentumStatus: "mixed",
      volumeStatus: "flat",
      riskGeometryStatus: "not_checked",
      enoughDataToBuildPlan: false,
      built: false,
      rejectionReason: "missing_fresh_reference_price",
    }),
  ];

  const summary = summarizeSelectedCandidateBuildDiagnostics(diagnostics, 6);

  expect(summary.selected_count).toBe(2);
  expect(summary.built_count).toBe(1);
  expect(summary.rejection_counts.missing_fresh_reference_price).toBe(1);
  expect(summary.examples_by_reason.missing_fresh_reference_price).toEqual([
    "MSFT",
  ]);
  expect(summary.output_below_target_reason_category).toBe("data_quality");
});

test("batch audit uses exact selected-to-built diagnostics instead of generic no-trade", () => {
  const diagnostics = [
    buildSelectedCandidateBuildDiagnostic({
      ticker: "AMD",
      built: true,
      enoughDataToBuildPlan: true,
      riskGeometryStatus: "valid",
    }),
    buildSelectedCandidateBuildDiagnostic({
      ticker: "AAPL",
      built: false,
      enoughDataToBuildPlan: false,
      rejectionReason: "scanner_cache_reference_too_old",
    }),
    buildSelectedCandidateBuildDiagnostic({
      ticker: "MSFT",
      built: false,
      enoughDataToBuildPlan: false,
      rejectionReason: "missing_fresh_reference_price",
    }),
  ];

  const audit = buildBatchCandidateAuditSummary({
    rawCandidatesCount: 3,
    rankedCandidatesCount: 3,
    selectedCandidatesCount: 3,
    builtRecommendationsCount: 1,
    publishedRecommendationsCount: 1,
    persistedRecommendationRowsCount: 1,
    selectedCandidateBuildDiagnostics: diagnostics,
  });

  expect(audit.drop_off_reasons.no_trade_candidate).toBe(0);
  expect(audit.drop_off_reasons.scanner_cache_reference_too_old).toBe(1);
  expect(audit.drop_off_reasons.missing_fresh_reference_price).toBe(1);
  expect(audit.selected_to_built_drop_off?.rejected_count).toBe(2);
});

test("batch audit reconciles sparse scan-run counters from persisted rows", () => {
  const audit = buildBatchCandidateAuditSummary({
    scanRunFingerprint: "rec_scan_run_vlz162",
    batchFingerprint: "rec_batch_1vxtb7z",
    rawCandidatesCount: 22,
    rankedCandidatesCount: 22,
    selectedCandidatesCount: 14,
    builtRecommendationsCount: 0,
    publishedRecommendationsCount: 0,
    persistedRecommendationRowsCount: 6,
    persistedSnapshotRowsCount: 12,
    uniqueSnapshotFingerprintsCount: 6,
    visibleGridCardsCount: 6,
    outcomeEligibleSnapshotCount: 6,
    selectedToBuiltDropOff: {
      selected_count: 14,
      built_count: 6,
      rejected_count: 8,
      rejection_counts: {
        below_publish_threshold: 8,
      },
      category_counts: {
        data_quality: 8,
      },
      examples_by_reason: {
        below_publish_threshold: ["BAC", "JPM", "MSFT"],
      },
      output_below_target_reason_category: "healthy_caution",
      output_below_target_explanation:
        "8 selected candidates were below the publish threshold.",
    },
  });

  expect(audit.raw_scan_run_built_count).toBe(0);
  expect(audit.raw_scan_run_published_count).toBe(0);
  expect(audit.built_recommendations_count).toBe(6);
  expect(audit.published_recommendations_count).toBe(6);
  expect(audit.effective_built_recommendations_count).toBe(6);
  expect(audit.effective_published_recommendations_count).toBe(6);
  expect(audit.reconciled_from_persisted_rows).toBe(true);
  expect(audit.counter_reconciliation).toBe(
    "scan_run_sparse_reconciled_from_persisted_rows",
  );
  expect(audit.counter_reconciliation_note).toContain(
    "reconciled from persisted recommendation rows",
  );
  expect(audit.batch_completeness).toBe("complete");
  expect(audit.largest_drop_off_stage).toBe("selected_to_published_or_threshold");
  expect(audit.largest_drop_off_count).toBe(8);
  expect(audit.drop_off_reasons.below_publish_threshold).toBe(8);
  expect(audit.drop_off_reasons.no_trade_candidate).toBe(0);
  expect(audit.drop_off_reasons.duplicate_snapshot_fingerprint).toBe(6);
  expect(audit.missing_snapshot_count).toBe(0);
});

test("closed-market diagnostics keep latest official review batch scope", () => {
  const officialAudit = buildBatchCandidateAuditSummary({
    scanRunFingerprint: "rec_scan_run_vlz162",
    batchFingerprint: "rec_batch_1vxtb7z",
    rawCandidatesCount: 0,
    rankedCandidatesCount: 0,
    selectedCandidatesCount: 0,
    builtRecommendationsCount: 0,
    publishedRecommendationsCount: 0,
    persistedRecommendationRowsCount: 0,
    persistedSnapshotRowsCount: 12,
    uniqueSnapshotFingerprintsCount: 12,
    visibleGridCardsCount: 6,
    hiddenArchivedCount: 6,
    outcomeEligibleSnapshotCount: 0,
  });
  const laterSkippedAttempt: ScheduledScanTimelineEntry = {
    utc_timestamp: "2026-06-26T19:02:00.000Z",
    ny_timestamp: "2026-06-26 15:02 America/New_York",
    source: "scheduler",
    source_type: "scan_run",
    readback_kind: "actual_scan",
    mode: "scheduled",
    official_window: "power_hour",
    intraday_scan_window: "power_hour",
    outcome: "skipped",
    allowed: null,
    reason: "empty",
    empty_scan_reason: "empty_initial_tick_retry_allowed",
    raw_count: 0,
    ranked_count: 0,
    selected_count: 7,
    built_count: 12,
    published_count: 12,
    batch_fingerprint: null,
    scan_run_fingerprint: "rec_scan_run_1b2agwl",
    rejection_summary: null,
    selected_to_built_drop_off: {
      selected_count: 0,
      built_count: 0,
      rejected_count: 0,
      rejection_counts: {},
      category_counts: {},
      examples_by_reason: {},
      output_below_target_reason_category: "unknown",
      output_below_target_explanation:
        "No candidate ranking was observed for this attempt.",
    },
    selected_candidate_build_diagnostics: [],
    reference_refresh: null,
  };
  const officialReviewAttempt: ScheduledScanTimelineEntry = {
    utc_timestamp: "2026-06-26T16:00:00.000Z",
    ny_timestamp: "2026-06-26 12:00 America/New_York",
    source: "scheduler",
    source_type: "retained_readback",
    readback_kind: "retained_review_batch",
    mode: "scheduled",
    official_window: "midday",
    intraday_scan_window: "midday",
    outcome: "published",
    allowed: true,
    reason: "published",
    empty_scan_reason: null,
    raw_count: 22,
    ranked_count: 22,
    selected_count: 14,
    built_count: 6,
    published_count: 6,
    batch_fingerprint: "rec_batch_1vxtb7z",
    scan_run_fingerprint: "rec_scan_run_vlz162",
    rejection_summary: null,
    selected_to_built_drop_off: {
      selected_count: 14,
      built_count: 12,
      rejected_count: 8,
      rejection_counts: { below_publish_threshold: 8 },
      category_counts: { quality: 8 },
      examples_by_reason: { below_publish_threshold: ["BAC", "JPM", "MSFT"] },
      output_below_target_reason_category: "healthy_caution",
      output_below_target_explanation:
        "8 selected candidates were below the publish threshold.",
    },
    selected_candidate_build_diagnostics: [],
    reference_refresh: null,
  };

  const summary = buildMarketDiagnosticsConsoleSummary(
    baseMarketDiagnosticsInput({
      scan_readback: {
        market_closed_readback_mode: true,
        latest_review_batch_fingerprint: "rec_batch_1vxtb7z",
        latest_official_batch_fingerprint: "rec_batch_1vxtb7z",
        latest_official_scan_run_fingerprint: "rec_scan_run_vlz162",
        current_batch_fingerprint: "rec_batch_1vxtb7z",
        current_batch_recommendation_count: 12,
        current_batch_snapshot_count: 12,
        current_batch_raw_snapshot_rows: 12,
        current_batch_unique_snapshot_fingerprints: 12,
        current_batch_duplicate_snapshot_rows: 0,
        current_batch_visible_grid_count: 6,
        current_batch_visible_recommendation_count: 6,
        current_batch_learning_snapshot_count: 6,
        current_batch_grid_card_count: 6,
        grow_max_learning_mode: true,
        primary_grid_strict_batch_filter_applied: true,
        latest_successful_scan: {
          result: "published",
          created_at: "2026-06-26T16:00:00.000Z",
          created_at_ny: "2026-06-26 12:00 America/New_York",
          visible_recommendation_count: 6,
        },
        latest_attempted_scan: {
          result: "skipped",
          created_at: "2026-06-26T19:02:00.000Z",
          created_at_ny: "2026-06-26 15:02 America/New_York",
          visible_recommendation_count: 0,
        },
        scheduled_scan_timeline_today: [
          laterSkippedAttempt,
          officialReviewAttempt,
        ],
      },
      outcome_evaluation: {
        market_closed_readback_mode: true,
        latest_review_batch_fingerprint: "rec_batch_1vxtb7z",
        current_batch_fingerprint: "rec_batch_1vxtb7z",
        current_official_batch_fingerprint: "rec_batch_1vxtb7z",
        current_batch_expected_outcomes: 18,
        current_batch_persisted_outcomes: 24,
        batch_candidate_audit: officialAudit,
        visible_grid_count: 6,
        grid_cards: 6,
        raw_snapshot_rows: 12,
        total_snapshots_loaded_for_batch: 12,
        unique_snapshot_fingerprints_count: 12,
        unique_learning_ideas: 12,
        duplicate_snapshot_rows: 0,
        duplicate_snapshot_fingerprints_count: 0,
        duplicate_snapshot_rows_ignored_count: 0,
        duplicate_snapshot_conflict_count: 0,
        outcome_eligible_snapshot_count: 6,
        eligible_visible_snapshot_count: 6,
        evaluated_outcome_count: 24,
        latest_evaluated_batch_rows: 24,
        shadow_entry_trial_count: 12,
      },
      live_market_trial_readiness: {
        ...baseMarketDiagnosticsInput().live_market_trial_readiness,
        warnings: [
          {
            warning_id: "zero_scan_runs",
            source: "persistence",
            message: "0 scan runs available for diagnostics",
          },
        ],
      },
      live_market_trial_runbook: {
        ...baseMarketDiagnosticsInput().live_market_trial_runbook,
        warnings: [
          {
            warning_id: "zero_snapshots",
            severity: "warning",
            message: "0 recommendation snapshots in scope; 0 evaluated",
          },
        ],
      },
    }),
  );

  const auditMetrics = sectionMetrics(summary, "batch_candidate_audit");
  expect(auditMetrics.batch_fingerprint).toBe("rec_batch_1vxtb7z");
  expect(auditMetrics.scan_run_fingerprint).toBe("rec_scan_run_vlz162");
  expect(auditMetrics.raw_candidates_count).toBe(22);
  expect(auditMetrics.selected_candidates_count).toBe(14);
  expect(auditMetrics.effective_built_recommendations_count).toBe(6);
  expect(auditMetrics.effective_published_recommendations_count).toBe(6);
  expect(auditMetrics.raw_scan_run_built_count).toBe(0);
  expect(auditMetrics.raw_scan_run_published_count).toBe(0);
  expect(auditMetrics.reconciled_from_persisted_rows).toBe(true);
  expect(auditMetrics.persisted_recommendation_rows_count).toBe(6);
  expect(auditMetrics.persisted_snapshot_rows_count).toBe(12);
  expect(auditMetrics.unique_snapshot_fingerprints_count).toBe(6);
  expect(auditMetrics.outcome_eligible_snapshot_count).toBe(6);
  expect(auditMetrics.batch_completeness).toBe("complete");
  expect(auditMetrics.raw_duplicate_snapshot_rows).toBe(6);
  expect(auditMetrics.hidden_archived_count).toBe(0);
  expect(auditMetrics.effective_unique_snapshot_rows).toBe(6);
  expect(auditMetrics.healthy_grow_max_dedupe).toBe(true);
  expect(JSON.parse(String(auditMetrics.drop_off_reasons))).toMatchObject({
    below_publish_threshold: 8,
    persistence_failed: 0,
    archived: 0,
    duplicate_snapshot_fingerprint: 0,
  });

  const selectedToBuiltMetrics = sectionMetrics(
    summary,
    "selected_to_built_drop_off",
  );
  expect(selectedToBuiltMetrics.selected_to_built_source).toBe(
    "latest_official_batch_timeline",
  );
  expect(selectedToBuiltMetrics.scan_run_fingerprint).toBe(
    "rec_scan_run_vlz162",
  );
  expect(selectedToBuiltMetrics.latest_attempt_utc).toBe(
    "2026-06-26T16:00:00.000Z",
  );
  expect(selectedToBuiltMetrics.built_count).toBe(6);
  expect(selectedToBuiltMetrics.published_count).toBe(6);
  expect(selectedToBuiltMetrics.rejected_count).toBe(8);

  const timelineMetrics = sectionMetrics(
    summary,
    "scheduled_scan_timeline_today",
  );
  expect(timelineMetrics.scheduled_scan_timeline_latest_utc).toBe(
    "2026-06-26T19:02:00.000Z",
  );
  expect(timelineMetrics.scheduled_scan_timeline_latest_reason).toBe("empty");
  expect(summary.copy_payloads.summary_text.content).not.toContain(
    "0 scan runs available for diagnostics",
  );
  expect(summary.copy_payloads.summary_text.content).not.toContain(
    "0 recommendation snapshots in scope; 0 evaluated",
  );
});

test("closed-market outcome panels retain latest evaluated review diagnostics", () => {
  const summary = buildMarketDiagnosticsConsoleSummary(
    baseMarketDiagnosticsInput({
      outcome_evaluation: {
        market_closed_readback_mode: true,
        latest_review_batch_fingerprint: "rec_batch_1vxtb7z",
        current_batch_fingerprint: "rec_batch_1vxtb7z",
        evaluated_outcome_count: 24,
        latest_evaluated_batch_rows: 24,
        shadow_entry_trial_count: 12,
        shadow_entry_triggered_count: 5,
        plan_price_freshness_summary: {
          total_snapshots: 6,
          evaluated_snapshots: 6,
          fresh_plan_count: 5,
          slightly_stale_plan_count: 1,
          stale_plan_count: 0,
          severely_stale_plan_count: 0,
          missing_reference_price_count: 0,
          missing_reference_timestamp_count: 0,
          provider_price_unavailable_count: 0,
          average_entry_distance_from_first_candle_close_pct: 0.2,
          worst_entry_distance_from_first_candle_close_pct: 0.8,
          stale_or_severely_stale_ratio: 0,
          largest_distance_tickers: [],
          reference_price_source_counts: { provider_quote_price: 6 },
          reference_metadata_present_count: 6,
          reference_metadata_missing_but_plan_prices_present_count: 0,
          reference_metadata_missing_no_plan_prices_count: 0,
          top_tickers_missing_reference_metadata: [],
          warning: null,
        },
        entry_type_trigger_summary: {
          total_outcomes: 24,
          known_entry_type_count: 24,
          unknown_entry_type_count: 0,
          by_entry_type: {
            pullback_limit: 12,
            breakout_stop: 6,
            market_reference: 6,
          },
          by_trigger_semantics: {
            pullback_limit: 12,
            breakout_stop: 6,
            market_reference: 6,
          },
          entry_type_triggered_count: 9,
          official_triggered_count: 9,
          legacy_range_touch_triggered_count: 7,
          current_route_triggered_count: 9,
          disagreement_count: 2,
          disagreement_rate: 2 / 24,
          top_disagreement_reasons: {
            market_reference_uses_close_reference: 2,
          },
          tickers_with_disagreements: ["MSFT", "NVDA"],
          unknown_due_to_missing_reference_count: 0,
        },
      },
      entry_tuning_proposal: null,
    }),
  );

  const planMetrics = sectionMetrics(summary, "plan_price_freshness");
  expect(planMetrics.evaluated_snapshots).toBe(6);
  expect(planMetrics.fresh_plan_count).toBe(5);
  expect(planMetrics.reference_metadata_present_count).toBe(6);

  const entryMetrics = sectionMetrics(
    summary,
    "entry_type_trigger_diagnostics",
  );
  expect(entryMetrics.total_outcomes).toBe(24);
  expect(entryMetrics.entry_type_triggered_count).toBe(9);
  expect(entryMetrics.disagreement_count).toBe(2);

  const shadowMetrics = sectionMetrics(summary, "shadow_entry_trial");
  expect(shadowMetrics.shadow_trial_status).toBe(
    "samples collected; latest variant rejected",
  );
  const learningMetrics = sectionMetrics(summary, "outcome_learning_insights");
  expect(learningMetrics.outcome_route_shadow_entry_trial_count).toBe(12);
  expect(learningMetrics.outcome_route_shadow_entry_triggered_count).toBe(5);
  expect(summary.copy_payloads.summary_text.content).toContain(
    "Shadow tracking collected samples; latest variant was rejected, waiting for next proposal.",
  );
  expect(summary.copy_payloads.summary_text.content).not.toContain(
    "No active entry tuning proposal is ready for shadow tracking.",
  );
});

test("empty closed-market diagnostics still report true zero-scope warnings", () => {
  const summary = buildMarketDiagnosticsConsoleSummary(
    baseMarketDiagnosticsInput({
      scan_readback: {
        market_closed_readback_mode: true,
        latest_review_batch_fingerprint: null,
        latest_successful_scan: null,
        latest_attempted_scan: null,
        current_batch_visible_grid_count: 0,
        current_batch_visible_recommendation_count: 0,
      },
      outcome_evaluation: {
        market_closed_readback_mode: true,
        latest_review_batch_fingerprint: null,
        evaluated_outcome_count: 0,
        latest_evaluated_batch_rows: 0,
      },
      live_market_trial_readiness: {
        ...baseMarketDiagnosticsInput().live_market_trial_readiness,
        warnings: [
          {
            warning_id: "zero_scan_runs",
            source: "persistence",
            message: "0 scan runs available for diagnostics",
          },
        ],
      },
      live_market_trial_runbook: {
        ...baseMarketDiagnosticsInput().live_market_trial_runbook,
        warnings: [
          {
            warning_id: "zero_snapshots",
            severity: "warning",
            message: "0 recommendation snapshots in scope; 0 evaluated",
          },
        ],
      },
      outcome_learning: null,
    }),
  );

  expect(summary.copy_payloads.summary_text.content).toContain(
    "0 scan runs available for diagnostics",
  );
  expect(summary.copy_payloads.summary_text.content).toContain(
    "0 recommendation snapshots in scope; 0 evaluated",
  );
});

test("batch audit keeps truly empty batches at zero", () => {
  const audit = buildBatchCandidateAuditSummary({
    scanRunFingerprint: "rec_scan_run_empty",
    batchFingerprint: null,
    rawCandidatesCount: 0,
    rankedCandidatesCount: 0,
    selectedCandidatesCount: 0,
    builtRecommendationsCount: 0,
    publishedRecommendationsCount: 0,
    persistedRecommendationRowsCount: 0,
    persistedSnapshotRowsCount: 0,
    uniqueSnapshotFingerprintsCount: 0,
    visibleGridCardsCount: 0,
    outcomeEligibleSnapshotCount: 0,
  });

  expect(audit.raw_scan_run_built_count).toBe(0);
  expect(audit.raw_scan_run_published_count).toBe(0);
  expect(audit.effective_built_recommendations_count).toBe(0);
  expect(audit.effective_published_recommendations_count).toBe(0);
  expect(audit.reconciled_from_persisted_rows).toBe(false);
  expect(audit.counter_reconciliation).toBe("none");
  expect(audit.batch_completeness).toBe("empty");
});

test("missing provider or reference data is not mislabeled as generic no-trade", () => {
  const diagnostic = buildSelectedCandidateBuildDiagnostic({
    ticker: "META",
    built: false,
    enoughDataToBuildPlan: false,
    referencePriceStatus: "missing_price",
    rejectionReason: "provider_data_unavailable",
  });
  const summary = summarizeSelectedCandidateBuildDiagnostics([diagnostic], 6);

  expect(diagnostic.rejection_reason).toBe("provider_data_unavailable");
  expect(diagnostic.rejection_category).toBe("provider");
  expect(summary.rejection_counts.provider_data_unavailable).toBe(1);
});

test("valid deterministic fallback candidate can be marked built", () => {
  const diagnostic = buildSelectedCandidateBuildDiagnostic({
    ticker: "AMD",
    side: "long",
    score: 84,
    tier: "strong",
    setupType: "BREAKOUT_CONTINUATION",
    source: "dynamic_mover",
    referencePriceStatus: "complete",
    referencePriceSource: "provider_quote_price",
    vwapStatus: "above_vwap",
    momentumStatus: "bullish",
    volumeStatus: "rising",
    riskGeometryStatus: "valid",
    enoughDataToBuildPlan: true,
    built: true,
  });

  expect(diagnostic.built).toBe(true);
  expect(diagnostic.rejection_reason).toBe("built");
  expect(diagnostic.enough_data_to_build_plan).toBe(true);
});

test("invalid risk geometry blocks safely with safety category", () => {
  const diagnostic = buildSelectedCandidateBuildDiagnostic({
    ticker: "TSLA",
    built: false,
    enoughDataToBuildPlan: false,
    riskGeometryStatus: "invalid_long_geometry",
    rejectionReason: "invalid_risk_geometry",
  });
  const summary = summarizeSelectedCandidateBuildDiagnostics([diagnostic], 6);

  expect(diagnostic.rejection_category).toBe("safety");
  expect(summary.output_below_target_reason_category).toBe("safety");
});

test("outcome canonicalization keeps visible snapshot when archived duplicate shares fingerprint", () => {
  const visible = outcomeSnapshot({
    id: "visible-current",
    snapshot_fingerprint: "snap-current-visible",
  });
  const archivedDuplicate = outcomeSnapshot({
    id: "archived-duplicate",
    snapshot_fingerprint: "snap-current-visible",
    is_visible: false,
    status: "hidden",
    payload_json: {
      batch_fingerprint: "rec_batch_current",
      visibility_status: "archived",
    },
    updated_at: "2026-06-30T15:59:00.000Z",
  });

  const result = canonicalizeOutcomeSnapshotsForBatch({
    batchFingerprint: "rec_batch_current",
    batchSnapshotFingerprints: new Set(["snap-current-visible"]),
    growMaxLearningModeEnabled: true,
    scanRunFingerprint: "rec_scan_run_test",
    snapshots: [archivedDuplicate, visible],
  });

  expect(result.canonicalSnapshots).toHaveLength(1);
  expect(result.canonicalSnapshots[0].id).toBe("visible-current");
  expect(result.diagnostics.duplicate_snapshot_rows_ignored_count).toBe(1);
  expect(result.diagnostics.hidden_archived_duplicate_rows_ignored_count).toBe(1);
  expect(
    result.diagnostics
      .canonical_visible_duplicate_fingerprints_retained_count,
  ).toBe(1);
});

test("outcome canonicalization ignores hidden duplicate without blocking visible row", () => {
  const visible = outcomeSnapshot({
    id: "visible-msft",
    snapshot_fingerprint: "snap-msft",
    ticker: "MSFT",
  });
  const hiddenDuplicate = outcomeSnapshot({
    id: "hidden-msft",
    snapshot_fingerprint: "snap-msft",
    ticker: "MSFT",
    is_visible: false,
    status: "hidden",
    payload_json: {
      batch_fingerprint: "rec_batch_current",
      visibility_status: "hidden",
    },
  });

  const result = canonicalizeOutcomeSnapshotsForBatch({
    batchFingerprint: "rec_batch_current",
    batchSnapshotFingerprints: new Set(["snap-msft"]),
    growMaxLearningModeEnabled: true,
    scanRunFingerprint: "rec_scan_run_test",
    snapshots: [visible, hiddenDuplicate],
  });

  expect(result.canonicalSnapshots.map((snapshot) => snapshot.id)).toEqual([
    "visible-msft",
  ]);
  expect(result.diagnostics.hidden_archived_duplicate_rows_ignored_count).toBe(1);
  expect(result.diagnostics.archived_duplicate_rows_blocked_count).toBe(1);
});

test("outcome canonicalization dedupes true visible duplicates to one canonical snapshot", () => {
  const olderVisible = outcomeSnapshot({
    id: "older-visible",
    snapshot_fingerprint: "snap-dup-visible",
    created_at: "2026-06-30T15:00:00.000Z",
    updated_at: "2026-06-30T15:00:00.000Z",
  });
  const newerVisible = outcomeSnapshot({
    id: "newer-visible",
    snapshot_fingerprint: "snap-dup-visible",
    created_at: "2026-06-30T15:01:00.000Z",
    updated_at: "2026-06-30T15:01:00.000Z",
  });

  const result = canonicalizeOutcomeSnapshotsForBatch({
    batchFingerprint: "rec_batch_current",
    batchSnapshotFingerprints: new Set(["snap-dup-visible"]),
    growMaxLearningModeEnabled: false,
    scanRunFingerprint: "rec_scan_run_test",
    snapshots: [olderVisible, newerVisible],
  });

  expect(result.canonicalSnapshots).toHaveLength(1);
  expect(result.canonicalSnapshots[0].id).toBe("newer-visible");
  expect(result.diagnostics.visible_duplicate_rows_ignored_count).toBe(1);
  expect(result.diagnostics.duplicate_snapshot_rows_ignored_count).toBe(1);
});

test("equal or better persisted outcome still skips duplicate write", () => {
  const existing = outcome({
    id: "existing-complete",
    data_completeness: "complete",
    payload_json: { candle_count: 12 },
  });
  const next = outcome({
    id: "next-same-coverage",
    data_completeness: "complete",
    payload_json: { candle_count: 12 },
  });

  expect(hasBetterOutcomeCoverage(next, existing)).toBe(false);
});

test("post-eligibility diagnostics allow eligible snapshots to proceed to candle planning", () => {
  const diagnostics = buildOutcomePostEligibilityDiagnostics({
    preFilterEligibleSnapshotCount: 1,
    candleRequestsPlanned: 1,
    candidates: [
      outcomeCandidate({
        status: "evaluated",
      }),
    ],
  });

  expect(diagnostics.pre_filter_eligible_snapshot_count).toBe(1);
  expect(diagnostics.final_evaluation_eligible_snapshot_count).toBe(1);
  expect(diagnostics.post_eligibility_block_reasons).toEqual({});
  expect(diagnostics.candle_request_planning_block_reasons).toEqual({});
});

test("post-eligibility diagnostics surface already evaluated blockers", () => {
  const diagnostics = buildOutcomePostEligibilityDiagnostics({
    preFilterEligibleSnapshotCount: 1,
    candleRequestsPlanned: 0,
    candidates: [
      outcomeCandidate({
        status: "skipped",
        candle_request: null,
        candle_count: 0,
        outcome_status: "neither_hit",
        persistence_mode: "unknown",
        warnings: ["Outcome already has a terminal or completed status."],
      }),
    ],
  });

  expect(diagnostics.final_evaluation_eligible_snapshot_count).toBe(0);
  expect(diagnostics.post_eligibility_block_reasons).toMatchObject({
    already_has_equal_or_better_outcome: 1,
  });
  expect(diagnostics.candle_request_planning_block_reasons).toMatchObject({
    already_has_equal_or_better_outcome: 1,
  });
});

test("post-eligibility diagnostics never leave eligible blocked runs reasonless", () => {
  const diagnostics = buildOutcomePostEligibilityDiagnostics({
    preFilterEligibleSnapshotCount: 2,
    candleRequestsPlanned: 0,
    candidates: [],
  });

  expect(diagnostics.final_evaluation_eligible_snapshot_count).toBe(0);
  expect(diagnostics.post_eligibility_block_reasons).toMatchObject({
    unknown_post_eligibility_blocker: 2,
  });
  expect(diagnostics.candle_request_planning_block_reasons).toMatchObject({
    candle_request_planning_failed: 2,
  });
});
