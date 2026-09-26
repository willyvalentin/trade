import type { IntradayScanWindow } from "@/lib/intraday-scan-window";
import { getIntradayScanWindow } from "@/lib/intraday-scan-window";
import { getNyMarketTime, type MarketSessionEvaluation, type MarketSessionStatus } from "@/lib/market-session";
import type { RecommendationScanRun } from "@/lib/recommendation-scan-run";
import type { ScheduledOfficialGateDiagnostics } from "@/lib/day-trade-scan-orchestration";
import {
  buildObservationCycleAdmission,
  OBSERVATION_CYCLE_ADMISSION_POLICY_VERSION,
  OBSERVATION_CYCLE_MINIMUM_CADENCE_MINUTES,
  type ObservationCycleAdmissionPreconditionReason,
  type ObservationCycleAdmissionReceipt,
} from "@/lib/observation-cycle-admission-policy";
import type { ScheduledScanProviderCreditBudget } from "@/lib/scheduled-scan-ticker-cap";

export const CONTINUOUS_MARKET_SCAN_ADMISSION_VERSION =
  OBSERVATION_CYCLE_ADMISSION_POLICY_VERSION;
export const CONTINUOUS_MARKET_SCAN_MIN_CADENCE_MINUTES =
  OBSERVATION_CYCLE_MINIMUM_CADENCE_MINUTES;
// 09:30–16:00 ET contains 26 eligible quarter-hour ticks. This is a
// conservative full-session ceiling for diagnostic provider-cost estimates;
// early closes and failed admission reduce actual usage.
export const CONTINUOUS_MARKET_SCAN_MAX_FULL_SESSION_TICKS = 26;

export type ContinuousMarketScanAdmission = ScheduledOfficialGateDiagnostics & {
  policy_version: typeof CONTINUOUS_MARKET_SCAN_ADMISSION_VERSION;
  observation_admission: ObservationCycleAdmissionReceipt;
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
  providerBudget: ScheduledScanProviderCreditBudget | null;
}): ContinuousMarketScanAdmission {
  const nyDate = getNyMarketTime(input.now).ny_date;
  const buildAdmission = (
    preconditionReason: ObservationCycleAdmissionPreconditionReason | null,
    sessionVerifiedOpen: boolean,
  ) =>
    buildObservationCycleAdmission({
      now: input.now,
      sessionVerifiedOpen,
      preconditionReason,
      recentScanRuns: input.recentScanRuns,
      providerBudget: input.providerBudget,
    });
  const block = (
    reason: ObservationCycleAdmissionPreconditionReason,
    sessionVerifiedOpen: boolean,
  ): ContinuousMarketScanAdmission => ({
    policy_version: CONTINUOUS_MARKET_SCAN_ADMISSION_VERSION,
    official_window_detected: false,
    scheduled_gate_window: input.scanWindow,
    scheduled_gate_allowed: false,
    scheduled_gate_block_reason: reason,
    schedule_window_mismatch: reason === "scan_window_clock_mismatch",
    observation_admission: buildAdmission(reason, sessionVerifiedOpen),
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
    return block("market_session_not_provider_confirmed_open", false);
  }

  if (getIntradayScanWindow(input.now) !== input.scanWindow) {
    return block("scan_window_clock_mismatch", true);
  }

  // The closing segment retains its separately gated, existing trial policy.
  // This change must not silently enable new late-session publication.
  if (input.scanWindow === "power_hour") {
    const legacyAllowed = input.legacyPowerHourWindowGate.scheduled_gate_allowed;
    const observationAdmission = buildAdmission(
      legacyAllowed ? null : "legacy_power_hour_gate_rejected",
      true,
    );
    return {
      ...input.legacyPowerHourWindowGate,
      policy_version: CONTINUOUS_MARKET_SCAN_ADMISSION_VERSION,
      scheduled_gate_allowed:
        legacyAllowed && observationAdmission.request_current_data,
      scheduled_gate_block_reason: legacyAllowed
        ? observationAdmission.request_current_data
          ? null
          : observationAdmission.reason_codes[0] ?? "observation_not_due"
        : input.legacyPowerHourWindowGate.scheduled_gate_block_reason ??
          "legacy_power_hour_gate_rejected",
      observation_admission: observationAdmission,
    };
  }

  if (
    input.scanWindow !== "opening" &&
    input.scanWindow !== "morning_momentum" &&
    input.scanWindow !== "midday" &&
    input.scanWindow !== "afternoon"
  ) {
    return block("outside_regular_generation_segment", true);
  }

  const observationAdmission = buildAdmission(null, true);

  return {
    policy_version: CONTINUOUS_MARKET_SCAN_ADMISSION_VERSION,
    official_window_detected: false,
    scheduled_gate_window: input.scanWindow,
    scheduled_gate_allowed: observationAdmission.request_current_data,
    scheduled_gate_block_reason: observationAdmission.request_current_data
      ? null
      : observationAdmission.reason_codes[0] ?? "observation_not_due",
    schedule_window_mismatch: false,
    observation_admission: observationAdmission,
  };
}
