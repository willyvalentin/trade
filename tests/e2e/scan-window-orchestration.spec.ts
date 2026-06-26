import { expect, test } from "@playwright/test";

import {
  buildDayTradeScanOrchestrationSummary,
  shouldRunOfficialDayTradeScan,
  type DayTradeScanWindow,
} from "../../lib/day-trade-scan-orchestration";
import type { MarketSessionStatus } from "../../lib/market-session";
import {
  buildRecommendationServingCadenceSummary,
} from "../../lib/recommendation-serving-cadence";
import type { RecommendationScanRun } from "../../lib/recommendation-scan-run";
import {
  buildScheduledScanAttemptRecord,
  buildScheduledScanTimelineToday,
  scheduledScanAttemptFromRow,
  type ScheduledScanAttempt,
} from "../../lib/scheduled-scan-attempts";
import type { SelectedToBuiltDropOffSummary } from "../../lib/recommendation-build-diagnostics";
import type { ReferenceRefreshDiagnostics } from "../../lib/reference-refresh-diagnostics";
import type { ScanLogEntry } from "../../lib/scan-logs";

const tradingDayMarketStatus: MarketSessionStatus = {
  isOpenDay: true,
  reason: "Trading day",
  date: "2026-06-24",
  dayType: "trading_day",
  marketOpenTime: "09:30",
  marketCloseTime: "16:00",
  provider: "polygon",
};

function scanRun(input: {
  window: DayTradeScanWindow;
  observedAt: string;
  tradingDate?: string;
  visibleCount?: number;
}) {
  return {
    id: `scan-${input.window}-${input.observedAt}`,
    run_fingerprint: `fingerprint-${input.window}-${input.observedAt}`,
    trading_date: input.tradingDate ?? "2026-06-24",
    window: input.window,
    status: "completed",
    source: "scheduled",
    observed_at: input.observedAt,
    counts: {
      visible_recommendation_count: input.visibleCount ?? 6,
    },
    payload_json: {},
  } as RecommendationScanRun;
}

const emptyScheduledAttemptDiagnostics = {
  selected_to_built_drop_off: null,
  selected_candidate_build_diagnostics: [],
  empty_scan_reason: null,
  rejection_summary: null,
  reference_refresh: null,
};

const emptyOfficialDropOff: SelectedToBuiltDropOffSummary = {
  selected_count: 18,
  built_count: 0,
  rejected_count: 18,
  rejection_counts: {
    missing_fresh_reference_price: 18,
  },
  category_counts: {
    data_quality: 18,
  },
  examples_by_reason: {
    missing_fresh_reference_price: ["AMD", "NVDA", "MSFT"],
  },
  output_below_target_reason_category: "data_quality",
  output_below_target_explanation:
    "18 selected candidates had no fresh reference price for plan construction.",
};

const emptyOfficialReferenceRefresh: ReferenceRefreshDiagnostics = {
  reference_refresh_attempted_count: 8,
  reference_refresh_success_count: 3,
  reference_refresh_failed_count: 5,
  reference_refresh_skipped_budget_count: 1,
  reference_refresh_source_counts: {
    twelve_data_intraday: 3,
    intraday_indicator_cache: 5,
    unknown: 1,
  },
  reference_refresh_accepted_source_counts: {
    twelve_data_intraday: 3,
  },
  reference_refresh_rejected_source_counts: {
    intraday_indicator_cache: 5,
    unknown: 1,
  },
  reference_refresh_failure_reasons: {
    cache_hit_but_wrong_day: 5,
    budget_skipped: 1,
  },
  reference_refresh_failure_examples: {
    cache_hit_but_wrong_day: ["CAT@2026-06-24T17:02:00.000Z"],
    budget_skipped: ["NVDA"],
  },
  reference_refresh_attempts: [
    {
      ticker: "CAT",
      provider_symbol: "CAT",
      source_attempted: "intraday_indicator_cache",
      timestamp: "2026-06-24T17:02:00.000Z",
      reference_price_timestamp_kind: "cache_time",
      reference_price_timestamp_skew_ms: -86340000,
      reference_price_scan_time: "2026-06-25T17:02:00.000Z",
      reference_price_timestamp_validation_status:
        "provider_timestamp_wrong_trading_day",
      price: 200,
      provider: "twelve_data",
      read_path: "reference_refresh.intraday_indicators.current_intraday_price",
      ny_trading_date: "2026-06-24",
      accepted: false,
      rejection_reason: "cache_hit_but_wrong_day",
      provider_message: null,
    },
    {
      ticker: "AMD",
      provider_symbol: "AMD",
      source_attempted: "twelve_data_intraday",
      timestamp: "2026-06-25T17:02:00.000Z",
      reference_price_timestamp_kind: "fetch_time",
      reference_price_timestamp_skew_ms: 0,
      reference_price_scan_time: "2026-06-25T17:02:00.000Z",
      reference_price_timestamp_validation_status: "provider_timestamp_current",
      price: 112.35,
      provider: "twelve_data",
      read_path: "reference_refresh.intraday_indicators.current_intraday_price",
      ny_trading_date: "2026-06-25",
      accepted: true,
      rejection_reason: null,
      provider_message: null,
    },
    {
      ticker: "NVDA",
      provider_symbol: null,
      source_attempted: "unknown",
      timestamp: null,
      reference_price_timestamp_kind: "unknown",
      reference_price_timestamp_skew_ms: null,
      reference_price_scan_time: null,
      reference_price_timestamp_validation_status: null,
      price: null,
      provider: null,
      read_path: null,
      ny_trading_date: null,
      accepted: false,
      rejection_reason: "budget_skipped",
      provider_message: null,
    },
  ],
  reference_refresh_examples_by_ticker: {
    attempted: ["CAT", "AMD", "JPM", "MSFT"],
    rescued: ["AMD", "JPM", "MSFT"],
    failed: ["CAT"],
    skipped_budget: ["NVDA"],
  },
  reference_refresh_final_references: {
    AMD: {
      source: "provider_intraday_reference_refresh",
      timestamp: "2026-06-25T17:02:00.000Z",
      provider: "twelve_data",
      read_path: "reference_refresh.intraday_indicators.current_intraday_price",
      price: 112.35,
    },
  },
  reference_refresh_rescued_from_scanner_cache_reference_too_old_count: 3,
  reference_refresh_remaining_stale_reference_blocks: 5,
};

test("classifies official scan windows from UTC into New York time", () => {
  const morning = buildDayTradeScanOrchestrationSummary({
    now: "2026-06-24T13:50:00.000Z",
    marketStatus: tradingDayMarketStatus,
  });
  expect(morning.current_ny_time).toBe("2026-06-24 09:50 America/New_York");
  expect(morning.active_window).toBe("morning");
  expect(morning.decision).toBe("should_scan_now");
  expect(shouldRunOfficialDayTradeScan(morning)).toBe(true);

  const outside = buildDayTradeScanOrchestrationSummary({
    now: "2026-06-24T15:34:00.000Z",
    marketStatus: tradingDayMarketStatus,
  });
  expect(outside.current_ny_time).toBe("2026-06-24 11:34 America/New_York");
  expect(outside.active_window).toBe("outside_window");
  expect(outside.next_window).toBe("midday");
  expect(outside.next_window_starts_at).toBe("12:00");
  expect(outside.decision).toBe("outside_scan_window");
  expect(shouldRunOfficialDayTradeScan(outside)).toBe(false);

  const midday = buildDayTradeScanOrchestrationSummary({
    now: "2026-06-24T16:05:00.000Z",
    marketStatus: tradingDayMarketStatus,
  });
  expect(midday.current_ny_time).toBe("2026-06-24 12:05 America/New_York");
  expect(midday.active_window).toBe("midday");
  expect(midday.decision).toBe("should_scan_now");
  expect(shouldRunOfficialDayTradeScan(midday)).toBe(true);
});

test("classifies Action 204 incident timestamps against official windows", () => {
  const beforeMorning = buildDayTradeScanOrchestrationSummary({
    now: "2026-06-25T13:33:00.000Z",
    marketStatus: { ...tradingDayMarketStatus, date: "2026-06-25" },
  });
  expect(beforeMorning.current_ny_time).toBe(
    "2026-06-25 09:33 America/New_York",
  );
  expect(beforeMorning.active_window).toBe("outside_window");
  expect(beforeMorning.decision).toBe("outside_scan_window");
  expect(shouldRunOfficialDayTradeScan(beforeMorning)).toBe(false);

  const firstMorningTick = buildDayTradeScanOrchestrationSummary({
    now: "2026-06-25T13:48:00.000Z",
    marketStatus: { ...tradingDayMarketStatus, date: "2026-06-25" },
  });
  expect(firstMorningTick.current_ny_time).toBe(
    "2026-06-25 09:48 America/New_York",
  );
  expect(firstMorningTick.active_window).toBe("morning");
  expect(firstMorningTick.decision).toBe("should_scan_now");
  expect(shouldRunOfficialDayTradeScan(firstMorningTick)).toBe(true);

  const liveDiagnosticTime = buildDayTradeScanOrchestrationSummary({
    now: "2026-06-25T14:52:22.000Z",
    marketStatus: { ...tradingDayMarketStatus, date: "2026-06-25" },
  });
  expect(liveDiagnosticTime.current_ny_time).toBe(
    "2026-06-25 10:52 America/New_York",
  );
  expect(liveDiagnosticTime.active_window).toBe("morning");
  expect(liveDiagnosticTime.decision).toBe("should_scan_now");
  expect(shouldRunOfficialDayTradeScan(liveDiagnosticTime)).toBe(true);
});

test("explains missing Morning before the Midday window starts", () => {
  const summary = buildDayTradeScanOrchestrationSummary({
    now: "2026-06-24T15:34:00.000Z",
    marketStatus: tradingDayMarketStatus,
    scanRuns: [],
  });

  expect(summary.missed_windows).toEqual(["morning"]);
  expect(summary.official_scan_windows.map((item) => item.start_time)).toEqual([
    "09:45",
    "12:00",
    "15:00",
  ]);
  expect(summary.official_window_statuses).toMatchObject([
    {
      window: "morning",
      status: "missed",
      attempted_today: false,
    },
    {
      window: "midday",
      status: "waiting",
      attempted_today: false,
    },
    {
      window: "power_hour",
      status: "waiting",
      attempted_today: false,
    },
  ]);
  expect(summary.official_window_statuses[0]?.explanation).toContain(
    "Morning has no completed scan run recorded today.",
  );
});

test("marks Morning complete when a same-day official run exists", () => {
  const summary = buildDayTradeScanOrchestrationSummary({
    now: "2026-06-24T15:34:00.000Z",
    marketStatus: tradingDayMarketStatus,
    scanRuns: [
      scanRun({
        window: "morning",
        observedAt: "2026-06-24T14:02:00.000Z",
      }),
    ],
  });

  const morningStatus = summary.official_window_statuses.find(
    (item) => item.window === "morning",
  );
  expect(summary.missed_windows).toEqual([]);
  expect(morningStatus).toMatchObject({
    status: "completed",
    latest_scan_at: "2026-06-24T14:02:00.000Z",
    attempted_today: true,
  });
});

test("same-window cooldown blocks a duplicate official scheduled scan", () => {
  const summary = buildDayTradeScanOrchestrationSummary({
    now: "2026-06-24T13:55:00.000Z",
    marketStatus: tradingDayMarketStatus,
    lastScanCooldownMinutes: 45,
    scanRuns: [
      scanRun({
        window: "morning",
        observedAt: "2026-06-24T13:50:00.000Z",
      }),
    ],
  });

  expect(summary.active_window).toBe("morning");
  expect(summary.decision).toBe("scan_recently_completed");
  expect(summary.should_scan_now).toBe(false);
  expect(shouldRunOfficialDayTradeScan(summary)).toBe(false);
});

test("previous trading-day runs do not satisfy today's Morning state", () => {
  const summary = buildDayTradeScanOrchestrationSummary({
    now: "2026-06-24T15:34:00.000Z",
    marketStatus: tradingDayMarketStatus,
    scanRuns: [
      scanRun({
        window: "morning",
        observedAt: "2026-06-23T14:02:00.000Z",
        tradingDate: "2026-06-23",
      }),
    ],
  });

  const morningStatus = summary.official_window_statuses.find(
    (item) => item.window === "morning",
  );
  expect(summary.missed_windows).toEqual(["morning"]);
  expect(morningStatus).toMatchObject({
    status: "missed",
    attempted_today: false,
  });
});

test("does not mark Morning completed from synthetic empty readback without an observed attempt", () => {
  const summary = buildDayTradeScanOrchestrationSummary({
    now: "2026-06-25T14:52:22.000Z",
    marketStatus: { ...tradingDayMarketStatus, date: "2026-06-25" },
    scanRuns: [
      {
        ...scanRun({
          window: "morning",
          observedAt: "2026-06-25T14:52:22.000Z",
          tradingDate: "2026-06-25",
          visibleCount: 0,
        }),
        source: "mixed",
        payload_json: {},
        scanned_ticker_count: null,
        raw_candidate_count: null,
      } as unknown as RecommendationScanRun,
    ],
  });

  const morningStatus = summary.official_window_statuses.find(
    (item) => item.window === "morning",
  );
  expect(summary.decision).toBe("should_scan_now");
  expect(morningStatus).toMatchObject({
    status: "active",
    latest_scan_at: null,
    attempted_today: false,
  });
});

test("09:45 empty unknown zero-candidate attempt keeps Morning open", () => {
  const emptyUnknownRun = {
    ...scanRun({
      window: "morning",
      observedAt: "2026-06-26T13:45:24.367Z",
      tradingDate: "2026-06-26",
      visibleCount: 0,
    }),
    status: "empty",
    source: "supabase",
    raw_candidate_count: 0,
    scanned_ticker_count: 0,
    counts: {
      visible_recommendation_count: 0,
    },
    payload_json: {
      scan_observability: {},
    },
  } as unknown as RecommendationScanRun;

  const summary = buildDayTradeScanOrchestrationSummary({
    now: "2026-06-26T14:01:34.608Z",
    marketStatus: { ...tradingDayMarketStatus, date: "2026-06-26" },
    scanRuns: [emptyUnknownRun],
  });

  const morningStatus = summary.official_window_statuses.find(
    (item) => item.window === "morning",
  );
  expect(summary.active_window).toBe("morning");
  expect(summary.decision).toBe("should_scan_now");
  expect(shouldRunOfficialDayTradeScan(summary)).toBe(true);
  expect(summary.latest_scan_window).toBe("unknown");
  expect(summary.next_action).toMatchObject({
    action_id: "wait_for_next_official_tick",
    label: "Wait for next scheduled tick",
  });
  expect(morningStatus).toMatchObject({
    status: "active",
    latest_scan_at: null,
    latest_attempt_at: "2026-06-26T13:45:24.367Z",
    latest_attempt_classification: "empty_initial_tick_retry_allowed",
    attempted_today: true,
  });
  expect(morningStatus?.explanation).toBe(
    "Morning in progress - latest attempt empty; waiting for next scheduled tick.",
  );

  const timeline = buildScheduledScanTimelineToday({
    attempts: [],
    scanLogs: [],
    scanRuns: [emptyUnknownRun],
    tradingDate: "2026-06-26",
  });
  expect(timeline[0]).toMatchObject({
    official_window: "morning",
    outcome: "skipped",
    allowed: null,
    reason: "empty_initial_tick_retry_allowed",
    raw_count: 0,
    ranked_count: 0,
    selected_count: null,
    built_count: null,
    published_count: 0,
    batch_fingerprint: null,
  });
});

test("later same-window tick is allowed after empty unknown first tick", () => {
  const summary = buildDayTradeScanOrchestrationSummary({
    now: "2026-06-26T14:20:00.000Z",
    marketStatus: { ...tradingDayMarketStatus, date: "2026-06-26" },
    lastScanCooldownMinutes: 45,
    scanRuns: [
      {
        ...scanRun({
          window: "morning",
          observedAt: "2026-06-26T13:45:24.367Z",
          tradingDate: "2026-06-26",
          visibleCount: 0,
        }),
        status: "empty",
        source: "supabase",
        raw_candidate_count: 0,
        scanned_ticker_count: 0,
        counts: {
          visible_recommendation_count: 0,
        },
        payload_json: {
          scan_observability: {},
        },
      } as unknown as RecommendationScanRun,
    ],
  });

  expect(summary.active_window).toBe("morning");
  expect(summary.decision).toBe("should_scan_now");
  expect(shouldRunOfficialDayTradeScan(summary)).toBe(true);
});

test("meaningful no-trade-valid scan with ranked diagnostics can serve Morning", () => {
  const summary = buildDayTradeScanOrchestrationSummary({
    now: "2026-06-26T14:15:00.000Z",
    marketStatus: { ...tradingDayMarketStatus, date: "2026-06-26" },
    lastScanCooldownMinutes: 45,
    scanRuns: [
      {
        ...scanRun({
          window: "morning",
          observedAt: "2026-06-26T13:45:24.367Z",
          tradingDate: "2026-06-26",
          visibleCount: 0,
        }),
        status: "empty",
        source: "supabase",
        raw_candidate_count: 22,
        counts: {
          visible_recommendation_count: 0,
        },
        payload_json: {
          selected_to_built_drop_off: emptyOfficialDropOff,
          active_scan_trace: {
            should_scan_now: true,
            raw_candidates: {
              raw_candidate_count: 22,
            },
            ranking: {
              ranked_count: 22,
              selected_count: 18,
            },
            final: {
              no_publish_reason: "empty_due_to_missing_fresh_reference",
              recommendations_published_count: 0,
              recommendations_created: 0,
              recommendations_built_count: 0,
              selected_to_built_drop_off: emptyOfficialDropOff,
              selected_candidate_build_diagnostics: [],
              batch_fingerprint: null,
              scan_run_fingerprint: "run-no-trade-valid",
            },
          },
        },
      } as unknown as RecommendationScanRun,
    ],
  });

  const morningStatus = summary.official_window_statuses.find(
    (item) => item.window === "morning",
  );
  expect(summary.decision).toBe("scan_recently_completed");
  expect(morningStatus).toMatchObject({
    status: "completed",
    latest_scan_at: "2026-06-26T13:45:24.367Z",
    latest_attempt_classification: "meaningful_no_trade_valid",
  });
});

test("published official batch completes the window", () => {
  const summary = buildDayTradeScanOrchestrationSummary({
    now: "2026-06-26T14:15:00.000Z",
    marketStatus: { ...tradingDayMarketStatus, date: "2026-06-26" },
    scanRuns: [
      {
        ...scanRun({
          window: "morning",
          observedAt: "2026-06-26T13:45:24.367Z",
          tradingDate: "2026-06-26",
          visibleCount: 3,
        }),
        payload_json: {
          active_scan_trace: {
            should_scan_now: true,
            ranking: {
              ranked_count: 8,
              selected_count: 3,
            },
            final: {
              batch_fingerprint: "batch-morning",
              recommendations_published_count: 3,
              recommendations_created: 3,
            },
          },
        },
      } as unknown as RecommendationScanRun,
    ],
  });

  const morningStatus = summary.official_window_statuses.find(
    (item) => item.window === "morning",
  );
  expect(morningStatus).toMatchObject({
    status: "completed",
    latest_scan_at: "2026-06-26T13:45:24.367Z",
    latest_attempt_classification: "published_official_batch",
  });
});

test("after window end empty unknown attempt is reported as ended without batch", () => {
  const summary = buildDayTradeScanOrchestrationSummary({
    now: "2026-06-26T15:34:00.000Z",
    marketStatus: { ...tradingDayMarketStatus, date: "2026-06-26" },
    scanRuns: [
      {
        ...scanRun({
          window: "morning",
          observedAt: "2026-06-26T13:45:24.367Z",
          tradingDate: "2026-06-26",
          visibleCount: 0,
        }),
        status: "empty",
        source: "supabase",
        raw_candidate_count: 0,
        counts: {
          visible_recommendation_count: 0,
        },
        payload_json: {
          scan_observability: {},
        },
      } as unknown as RecommendationScanRun,
    ],
  });

  const morningStatus = summary.official_window_statuses.find(
    (item) => item.window === "morning",
  );
  expect(summary.missed_windows).toEqual(["morning"]);
  expect(morningStatus).toMatchObject({
    status: "missed",
    latest_scan_at: null,
    latest_attempt_classification: "empty_initial_tick_retry_allowed",
  });
  expect(morningStatus?.explanation).toBe(
    "Morning ended without an official batch after the latest attempt was empty.",
  );
});

test("retained review batch is not treated as a real scan attempt", () => {
  const summary = buildDayTradeScanOrchestrationSummary({
    now: "2026-06-26T14:01:34.608Z",
    marketStatus: { ...tradingDayMarketStatus, date: "2026-06-26" },
    scanRuns: [
      {
        ...scanRun({
          window: "closed",
          observedAt: "2026-06-26T20:13:00.000Z",
          tradingDate: "2026-06-26",
          visibleCount: 3,
        }),
        source: "mixed",
        payload_json: {},
      } as unknown as RecommendationScanRun,
    ],
  });

  const morningStatus = summary.official_window_statuses.find(
    (item) => item.window === "morning",
  );
  expect(summary.latest_scan_window).toBe("unknown");
  expect(morningStatus).toMatchObject({
    status: "active",
    latest_scan_at: null,
    latest_attempt_at: null,
    attempted_today: false,
  });
});

test("same-window cooldown has a distinct reason from outside-window gating", () => {
  const scanLog: ScanLogEntry = {
    created_at: "2026-06-25T14:03:00.000Z",
    source: "scheduled",
    scan_window: "morning_momentum",
    market_status: "open",
    result: "skipped",
    message: "Recent Morning scan already completed 15 minutes ago.",
    recommendations_created: 0,
    no_publish_reason: "same_window_cooldown",
  };
  const timeline = buildScheduledScanTimelineToday({
    attempts: [],
    scanLogs: [scanLog],
    scanRuns: [],
    tradingDate: "2026-06-25",
  });

  expect(timeline[0]).toMatchObject({
    official_window: "morning",
    outcome: "skipped",
    reason: "same_window_cooldown",
  });
  expect(timeline[0]?.reason).not.toBe("not_official_scan_window");
});

test("scheduled scan timeline includes skipped and successful same-day attempts newest first", () => {
  const attempts: ScheduledScanAttempt[] = [
    {
      attempt_fingerprint: "attempt-outside",
      created_at: "2026-06-25T13:33:00.000Z",
      trading_date: "2026-06-25",
      source: "netlify_scheduled_function",
      mode: "scheduled",
      outcome: "skipped",
      allowed: false,
      route_received_at: "2026-06-25T13:33:00.000Z",
      scheduled_function_fired_at: "2026-06-25T13:33:00.000Z",
      utc_timestamp: "2026-06-25T13:33:00.000Z",
      ny_timestamp: "2026-06-25 09:33 America/New_York",
      official_window: "outside_window",
      intraday_scan_window: "pre_market",
      orchestration_decision: "outside_scan_window",
      skip_reason: "not_official_scan_window",
      message: "Outside official window.",
      http_status: 200,
      raw_count: 0,
      ranked_count: 0,
      selected_count: 0,
      built_count: 0,
      published_count: 0,
      recommendations_created: 0,
      batch_fingerprint: null,
      scan_run_fingerprint: null,
      scheduled_scan_run_id: null,
      ...emptyScheduledAttemptDiagnostics,
      payload_json: {},
    },
    {
      attempt_fingerprint: "attempt-morning",
      created_at: "2026-06-25T13:48:00.000Z",
      trading_date: "2026-06-25",
      source: "netlify_scheduled_function",
      mode: "scheduled",
      outcome: "scanned",
      allowed: true,
      route_received_at: "2026-06-25T13:48:00.000Z",
      scheduled_function_fired_at: "2026-06-25T13:48:00.000Z",
      utc_timestamp: "2026-06-25T13:48:00.000Z",
      ny_timestamp: "2026-06-25 09:48 America/New_York",
      official_window: "morning",
      intraday_scan_window: "morning_momentum",
      orchestration_decision: "should_scan_now",
      skip_reason: null,
      message: "Created 1 day trade recommendation.",
      http_status: 200,
      raw_count: 8,
      ranked_count: 4,
      selected_count: 2,
      built_count: 1,
      published_count: 1,
      recommendations_created: 1,
      batch_fingerprint: "batch-1",
      scan_run_fingerprint: "run-1",
      scheduled_scan_run_id: "scheduled-1",
      ...emptyScheduledAttemptDiagnostics,
      payload_json: {},
    },
  ];
  const timeline = buildScheduledScanTimelineToday({
    attempts,
    scanLogs: [],
    scanRuns: [],
    tradingDate: "2026-06-25",
  });

  expect(timeline.map((item) => item.utc_timestamp)).toEqual([
    "2026-06-25T13:48:00.000Z",
    "2026-06-25T13:33:00.000Z",
  ]);
  expect(timeline[0]).toMatchObject({
    official_window: "morning",
    outcome: "scanned",
    raw_count: 8,
    ranked_count: 4,
    selected_count: 2,
    built_count: 1,
    published_count: 1,
    batch_fingerprint: "batch-1",
    scan_run_fingerprint: "run-1",
  });
  expect(timeline[1]).toMatchObject({
    official_window: "outside_window",
    outcome: "skipped",
    reason: "not_official_scan_window",
  });
});

test("scheduled scan attempt readback surfaces empty official build rejection diagnostics", () => {
  const row = buildScheduledScanAttemptRecord({
    attempt_fingerprint: "attempt-empty-morning",
    route_received_at: "2026-06-25T13:48:00.000Z",
    scheduled_function_fired_at: "2026-06-25T13:48:00.000Z",
    trading_date: "2026-06-25",
    source: "netlify_scheduled_function",
    mode: "scheduled",
    outcome: "scanned",
    allowed: true,
    official_window: "morning",
    intraday_scan_window: "morning_momentum",
    orchestration_decision: "should_scan_now",
    message: "Official scan selected candidates but published none.",
    raw_count: 22,
    ranked_count: 22,
    selected_count: 18,
    built_count: 0,
    published_count: 0,
    recommendations_created: 0,
    scan_run_fingerprint: "run-empty-morning",
    payload_json: {
      selected_to_built_drop_off: emptyOfficialDropOff,
      reference_refresh: emptyOfficialReferenceRefresh,
    },
  });
  const attempt = scheduledScanAttemptFromRow(row);
  expect(attempt).not.toBeNull();

  const timeline = buildScheduledScanTimelineToday({
    attempts: attempt ? [attempt] : [],
    scanLogs: [],
    scanRuns: [],
    tradingDate: "2026-06-25",
  });

  expect(timeline[0]).toMatchObject({
    official_window: "morning",
    outcome: "scanned",
    reason: "empty_due_to_missing_fresh_reference",
    raw_count: 22,
    ranked_count: 22,
    selected_count: 18,
    built_count: 0,
    published_count: 0,
    scan_run_fingerprint: "run-empty-morning",
    empty_scan_reason: "empty_due_to_missing_fresh_reference",
  });
  expect(
    timeline[0]?.rejection_summary?.top_rejection_reasons,
  ).toContain("missing_fresh_reference_price:18");
  expect(
    timeline[0]?.rejection_summary?.examples_by_reason
      .missing_fresh_reference_price,
  ).toEqual(["AMD", "NVDA", "MSFT"]);
  expect(timeline[0]?.rejection_summary?.below_target_category).toBe(
    "data_quality",
  );
  expect(timeline[0]?.reference_refresh).toMatchObject({
    reference_refresh_attempted_count: 8,
    reference_refresh_success_count: 3,
    reference_refresh_failed_count: 5,
    reference_refresh_rescued_from_scanner_cache_reference_too_old_count: 3,
    reference_refresh_remaining_stale_reference_blocks: 5,
    reference_refresh_failure_reasons: {
      cache_hit_but_wrong_day: 5,
      budget_skipped: 1,
    },
    reference_refresh_failure_examples: {
      cache_hit_but_wrong_day: ["CAT@2026-06-24T17:02:00.000Z"],
      budget_skipped: ["NVDA"],
    },
    reference_refresh_accepted_source_counts: {
      twelve_data_intraday: 3,
    },
    reference_refresh_rejected_source_counts: {
      intraday_indicator_cache: 5,
      unknown: 1,
    },
  });
});

test("scan run timeline keeps selected-to-built diagnostics when final counts are sparse", () => {
  const timeline = buildScheduledScanTimelineToday({
    attempts: [],
    scanLogs: [],
    scanRuns: [
      {
        id: "scan-empty-morning",
        run_fingerprint: "run-empty-morning",
        trading_date: "2026-06-25",
        window: "morning",
        status: "empty",
        source: "scheduled",
        observed_at: "2026-06-25T13:48:00.000Z",
        raw_candidate_count: 22,
        counts: {
          visible_recommendation_count: 0,
        },
        payload_json: {
          selected_to_built_drop_off: emptyOfficialDropOff,
          selected_candidate_build_diagnostics: [],
          empty_scan_reason: "empty_due_to_missing_fresh_reference",
          active_scan_trace: {
            should_scan_now: true,
            raw_candidates: {
              raw_candidate_count: 22,
            },
            ranking: {
              ranked_count: 22,
              selected_count: 18,
            },
            final: {
              no_publish_reason: "empty",
              scan_run_fingerprint: "run-empty-morning",
              recommendations_built_count: 0,
              recommendations_published_count: 0,
              selected_to_built_drop_off: emptyOfficialDropOff,
            },
          },
        },
      } as unknown as RecommendationScanRun,
    ],
    tradingDate: "2026-06-25",
  });

  expect(timeline[0]).toMatchObject({
    source: "recommendation_scan_runs",
    official_window: "morning",
    outcome: "skipped",
    reason: "empty_due_to_missing_fresh_reference",
    raw_count: 22,
    ranked_count: 22,
    selected_count: 18,
    built_count: 0,
    published_count: 0,
    scan_run_fingerprint: "run-empty-morning",
  });
  expect(
    timeline[0]?.selected_to_built_drop_off?.rejection_counts
      .missing_fresh_reference_price,
  ).toBe(18);
});

test("scan run timeline reconciles sparse counters from visible persisted recommendations", () => {
  const timeline = buildScheduledScanTimelineToday({
    attempts: [],
    scanLogs: [],
    scanRuns: [
      {
        id: "scan-reconciled-midday",
        run_fingerprint: "rec_scan_run_vlz162",
        trading_date: "2026-06-26",
        window: "midday",
        status: "completed",
        source: "scheduled",
        observed_at: "2026-06-26T16:03:00.000Z",
        raw_candidate_count: 22,
        counts: {
          visible_recommendation_count: 6,
        },
        payload_json: {
          persisted_recommendation_rows_count: 6,
          visible_grid_cards_count: 6,
          selected_to_built_drop_off: {
            selected_count: 14,
            built_count: 6,
            rejected_count: 8,
            rejection_counts: {
              below_publish_threshold: 8,
            },
            category_counts: {
              healthy_caution: 8,
            },
            examples_by_reason: {
              below_publish_threshold: ["BAC", "JPM", "MSFT"],
            },
            output_below_target_reason_category: "healthy_caution",
            output_below_target_explanation:
              "8 selected candidates were below the publish threshold.",
          },
          active_scan_trace: {
            should_scan_now: true,
            raw_candidates: {
              raw_candidate_count: 22,
            },
            ranking: {
              ranked_count: 22,
              selected_count: 14,
            },
            final: {
              no_publish_reason: null,
              scan_run_fingerprint: "rec_scan_run_vlz162",
              batch_fingerprint: "rec_batch_1vxtb7z",
              recommendations_built_count: 0,
              recommendations_published_count: 0,
            },
          },
        },
      } as unknown as RecommendationScanRun,
    ],
    tradingDate: "2026-06-26",
  });

  expect(timeline[0]).toMatchObject({
    source: "recommendation_scan_runs",
    official_window: "midday",
    outcome: "scanned",
    raw_count: 22,
    ranked_count: 22,
    selected_count: 14,
    built_count: 6,
    published_count: 6,
    raw_scan_run_built_count: 0,
    raw_scan_run_published_count: 0,
    effective_built_count: 6,
    effective_published_count: 6,
    batch_fingerprint: "rec_batch_1vxtb7z",
    scan_run_fingerprint: "rec_scan_run_vlz162",
    counter_reconciliation: "scan_run_sparse_reconciled_from_persisted_rows",
    reconciled_from_persisted_rows: true,
  });
  expect(timeline[0]?.counter_reconciliation_note).toContain(
    "reconciled from persisted recommendation rows",
  );
  expect(
    timeline[0]?.selected_to_built_drop_off?.rejection_counts
      .below_publish_threshold,
  ).toBe(8);
});

test("closed retained readback is not shown as a fresh scanned timeline row", () => {
  const scanLog: ScanLogEntry = {
    created_at: "2026-06-25T20:13:00.000Z",
    source: "scheduled",
    scan_window: "closed",
    market_status: "closed",
    result: "recommendation_created",
    message: "Market closed; retaining latest recommendations.",
    recommendations_created: 3,
    recommendations_published_count: 3,
  };
  const timeline = buildScheduledScanTimelineToday({
    attempts: [],
    scanLogs: [scanLog],
    scanRuns: [],
    tradingDate: "2026-06-25",
  });

  expect(timeline[0]).toMatchObject({
    source: "review/readback",
    source_type: "retained_readback",
    readback_kind: "retained_review_batch",
    official_window: "closed",
    outcome: "retained_review_batch",
    reason: "market_closed_retained_batch",
    published_count: 3,
    batch_fingerprint: null,
  });
  expect(timeline[0]?.outcome).not.toBe("scanned");
});

test("official Power Hour scan run keeps its creation-time window after close", () => {
  const timeline = buildScheduledScanTimelineToday({
    attempts: [],
    scanLogs: [],
    scanRuns: [
      scanRun({
        window: "power_hour",
        observedAt: "2026-06-25T19:16:00.000Z",
        tradingDate: "2026-06-25",
        visibleCount: 3,
      }),
    ],
    tradingDate: "2026-06-25",
  });

  expect(timeline[0]).toMatchObject({
    source_type: "scan_run",
    readback_kind: "actual_scan",
    official_window: "power_hour",
    outcome: "scanned",
    published_count: 3,
  });
});

test("batch-none rows cannot show published count unless labeled retained readback", () => {
  const skippedAttempt: ScheduledScanAttempt = {
    attempt_fingerprint: "attempt-outside-retained-count",
    created_at: "2026-06-25T19:50:00.000Z",
    trading_date: "2026-06-25",
    source: "netlify_scheduled_function",
    mode: "scheduled",
    outcome: "skipped",
    allowed: false,
    route_received_at: "2026-06-25T19:50:00.000Z",
    scheduled_function_fired_at: "2026-06-25T19:50:00.000Z",
    utc_timestamp: "2026-06-25T19:50:00.000Z",
    ny_timestamp: "2026-06-25 15:50 America/New_York",
    official_window: "outside_window",
    intraday_scan_window: "outside_window",
    orchestration_decision: "outside_scan_window",
    skip_reason: "not_official_scan_window",
    message: "Outside official window.",
    http_status: 200,
    raw_count: 0,
    ranked_count: 0,
    selected_count: 0,
    built_count: 0,
    published_count: 3,
    recommendations_created: 3,
    batch_fingerprint: null,
    scan_run_fingerprint: null,
    scheduled_scan_run_id: null,
    ...emptyScheduledAttemptDiagnostics,
    payload_json: {},
  };
  const retainedLog: ScanLogEntry = {
    created_at: "2026-06-25T20:13:00.000Z",
    source: "scheduled",
    scan_window: "closed",
    market_status: "closed",
    result: "recommendation_created",
    message: "Market closed; retaining latest recommendations.",
    recommendations_created: 3,
    recommendations_published_count: 3,
  };
  const timeline = buildScheduledScanTimelineToday({
    attempts: [skippedAttempt],
    scanLogs: [retainedLog],
    scanRuns: [],
    tradingDate: "2026-06-25",
  });

  expect(timeline).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        outcome: "skipped",
        reason: "not_official_scan_window",
        batch_fingerprint: null,
        published_count: 0,
      }),
      expect.objectContaining({
        source_type: "retained_readback",
        outcome: "retained_review_batch",
        batch_fingerprint: null,
        published_count: 3,
      }),
    ]),
  );
  for (const row of timeline) {
    if (row.batch_fingerprint === null && (row.published_count ?? 0) > 0) {
      expect(row.source_type).toBe("retained_readback");
    }
  }
});

test("outside official window does not create a current official serving batch", () => {
  const orchestration = buildDayTradeScanOrchestrationSummary({
    now: "2026-06-24T15:34:00.000Z",
    marketStatus: tradingDayMarketStatus,
  });
  const servingCadence = buildRecommendationServingCadenceSummary({
    tradingDate: "2026-06-24",
    orchestration,
    visibleRecommendations: [
      {
        id: "rec_batch_4b9kf0",
        ticker: "TEST",
        created_at: "2026-06-24T15:34:00.000Z",
        status: "new",
      },
    ],
    now: "2026-06-24T15:34:00.000Z",
  });

  expect(servingCadence.serving_window).toBe("outside_window");
  expect(servingCadence.serving_decision).toBe("wait_for_next_window");
  expect(servingCadence.batch_status).toBe("not_started");
  expect(servingCadence.latest_official_batch_id).toBeNull();
});
