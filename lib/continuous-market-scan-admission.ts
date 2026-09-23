import type { IntradayScanWindow } from "@/lib/intraday-scan-window";
import { getIntradayScanWindow } from "@/lib/intraday-scan-window";
import { getNyMarketTime, type MarketSessionEvaluation, type MarketSessionStatus } from "@/lib/market-session";
import type { RecommendationScanRun } from "@/lib/recommendation-scan-run";
import type { ScheduledOfficialGateDiagnostics } from "@/lib/day-trade-scan-orchestration";

export const CONTINUOUS_MARKET_SCAN_ADMISSION_VERSION =
  "continuous_regular_session_v1" as const;
export const CONTINUOUS_MARKET_SCAN_MIN_CADENCE_MINUTES = 15;

export type ContinuousMarketScanAdmission = ScheduledOfficialGateDiagnostics & {
  policy_version: typeof CONTINUOUS_MARKET_SCAN_ADMISSION_VERSION;
};

/**
 * The scheduler's quarter-hour event is a sampling opportunity, not a
 * publication window. Candidate publication remains subject to the separate
 * freshness, quality, budget and deterministic risk gates in the scan route.
 */
export function buildContinuousMarketScanAdmission(input: {
  now: Date;
  marketStatus: MarketSessionStatus;
  marketSession: MarketSessionEvaluation;
  scanWindow: IntradayScanWindow;
  recentScanRuns: RecommendationScanRun[];
  legacyPowerHourWindowGate: ScheduledOfficialGateDiagnostics;
}): ContinuousMarketScanAdmission {
  const nyDate = getNyMarketTime(input.now).ny_date;
  const block = (reason: string): ContinuousMarketScanAdmission => ({
    policy_version: CONTINUOUS_MARKET_SCAN_ADMISSION_VERSION,
    official_window_detected: false,
    scheduled_gate_window: input.scanWindow,
    scheduled_gate_allowed: false,
    scheduled_gate_block_reason: reason,
    schedule_window_mismatch: false,
  });

  if (
    input.marketStatus.date !== nyDate ||
    input.marketSession.ny_date !== nyDate ||
    input.marketSession.is_trading_day !== true ||
    input.marketSession.market_is_open !== true ||
    (input.marketStatus.dayType !== "trading_day" &&
      input.marketStatus.dayType !== "early_close") ||
    !input.marketStatus.provider ||
    input.marketStatus.provider === "local_fallback"
  ) {
    return block("market_session_not_provider_confirmed_open");
  }

  if (getIntradayScanWindow(input.now) !== input.scanWindow) {
    return block("scan_window_clock_mismatch");
  }

  // The closing segment retains its separately gated, existing trial policy.
  // This change must not silently enable new late-session publication.
  if (input.scanWindow === "power_hour") {
    return {
      ...input.legacyPowerHourWindowGate,
      policy_version: CONTINUOUS_MARKET_SCAN_ADMISSION_VERSION,
    };
  }

  if (
    input.scanWindow !== "opening" &&
    input.scanWindow !== "morning_momentum" &&
    input.scanWindow !== "midday" &&
    input.scanWindow !== "afternoon"
  ) {
    return block("outside_regular_generation_segment");
  }

  const cadenceMs = CONTINUOUS_MARKET_SCAN_MIN_CADENCE_MINUTES * 60_000;
  const recentCompleted = input.recentScanRuns.some((run) => {
    if (run.trading_date !== nyDate || run.status !== "completed") return false;
    const observedAt = new Date(run.observed_at ?? "").getTime();
    const elapsed = input.now.getTime() - observedAt;
    return Number.isFinite(observedAt) && elapsed >= 0 && elapsed < cadenceMs;
  });

  if (recentCompleted) return block("cadence_guard");

  return {
    policy_version: CONTINUOUS_MARKET_SCAN_ADMISSION_VERSION,
    official_window_detected: false,
    scheduled_gate_window: input.scanWindow,
    scheduled_gate_allowed: true,
    scheduled_gate_block_reason: null,
    schedule_window_mismatch: false,
  };
}
