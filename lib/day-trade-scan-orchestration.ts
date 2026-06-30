import type { IntradayScanWindow } from "@/lib/intraday-scan-window";
import {
  classifyOfficialScanWindowAttempt,
  officialScanRunEvidence,
  officialScanRunServesWindow,
  type OfficialScanWindowAttemptClassification,
} from "@/lib/official-scan-window-completion";
import {
  getNyMarketTime,
  getRegularMarketOpenClose,
  type MarketSessionEvaluation,
  type MarketSessionStatus,
} from "@/lib/market-session";
import type { RecommendationScanRun } from "@/lib/recommendation-scan-run";

export type DayTradeScanWindow =
  | "morning"
  | "midday"
  | "power_hour"
  | "closed"
  | "outside_window"
  | "unknown";

export type OfficialDayTradeScanWindow = Exclude<
  DayTradeScanWindow,
  "closed" | "outside_window" | "unknown"
>;

export type DayTradeScanWindowStatus =
  | "active"
  | "waiting"
  | "completed"
  | "missed"
  | "closed"
  | "unknown";

export type DayTradeScanOrchestrationDecision =
  | "should_scan_now"
  | "should_wait_for_window"
  | "market_closed"
  | "outside_scan_window"
  | "scan_recently_completed"
  | "blocked_by_provider"
  | "unknown";

export type MarketCalendarConfidence =
  | "provider_confirmed"
  | "fallback_estimated"
  | "unknown"
  | "blocked";

export type DayTradeScanRunType =
  | "scheduled"
  | "automatic"
  | "background"
  | "diagnostic"
  | "unknown";

export type DayTradeScanOrchestrationWarning = {
  warning_id: string;
  severity: "info" | "warning" | "critical";
  message: string;
};

export type DayTradeScanOrchestrationNextAction = {
  action_id: string;
  label: string;
  message: string;
};

export type DayTradeScanWindowDefinition = {
  window: OfficialDayTradeScanWindow;
  label: string;
  start_time: string;
  end_time: string;
  start_minutes: number;
  end_minutes: number;
};

export type DayTradeOfficialWindowStatus = {
  window: OfficialDayTradeScanWindow;
  label: string;
  start_time: string;
  end_time: string;
  latest_scan_at: string | null;
  latest_attempt_at: string | null;
  latest_attempt_classification: OfficialScanWindowAttemptClassification | null;
  attempted_today: boolean;
  status: DayTradeScanWindowStatus;
  explanation: string;
};

export type DayTradeScanOrchestrationSummary = {
  summary_id: string;
  summary_version: "1.0";
  summary_kind: "day_trade_scan_orchestration";
  generated_at: string;
  current_utc_time: string;
  current_ny_time: string;
  timezone: "America/New_York";
  trading_date: string;
  ny_time: string;
  market_session_phase: string;
  market_is_open: boolean;
  is_trading_day: boolean;
  calendar_confidence: MarketCalendarConfidence;
  provider_calendar_available: boolean;
  fallback_calendar_scan_allowed: boolean;
  active_window: DayTradeScanWindow;
  active_window_status: DayTradeScanWindowStatus;
  next_window: DayTradeScanWindow;
  next_window_starts_at: string | null;
  next_window_label: string;
  decision: DayTradeScanOrchestrationDecision;
  should_scan_now: boolean;
  should_wait_for_window: boolean;
  expected_recommendation_target: {
    min: number;
    max: number;
  };
  latest_scan_window: DayTradeScanWindow;
  latest_scan_at: string | null;
  latest_scan_per_window: Partial<Record<DayTradeScanWindow, string>>;
  missed_windows: DayTradeScanWindow[];
  official_scan_windows: DayTradeScanWindowDefinition[];
  official_window_statuses: DayTradeOfficialWindowStatus[];
  scan_reason: string;
  current_data_mode: string;
  run_type: DayTradeScanRunType;
  warnings: DayTradeScanOrchestrationWarning[];
  next_action: DayTradeScanOrchestrationNextAction;
  copy: {
    automatic_scans: string;
    closed_market: string;
    unknown_windows: string;
    fallback_timing: string;
    execution_boundary: string;
  };
};

export type DayTradeScanOrchestrationInput = {
  now?: Date | string | null;
  marketSession?: MarketSessionEvaluation | null;
  marketStatus?: MarketSessionStatus | null;
  scanRuns?: RecommendationScanRun[];
  currentDataMode?: string | null;
  runType?: DayTradeScanRunType | string | null;
  lastScanCooldownMinutes?: number;
};

export type ScheduledOfficialGateDiagnostics = {
  official_window_detected: boolean;
  scheduled_gate_window: string;
  scheduled_gate_allowed: boolean;
  scheduled_gate_block_reason: string | null;
  schedule_window_mismatch: boolean;
};

const timezone = "America/New_York" as const;
export const MARKET_CALENDAR_FALLBACK_SCAN_WARNING =
  "Market calendar provider unavailable; using NY-time fallback for scan timing.";
export const MARKET_CALENDAR_FALLBACK_EXECUTION_WARNING =
  "Fallback timing is sufficient for recommendation logging, not broker execution certainty.";
export const HUMAN_CONFIRMED_EXECUTION_WARNING =
  "Execution remains human-confirmed.";
export const POLYGON_CALENDAR_ENV_GUIDANCE =
  "Add POLYGON_API_KEY for provider-confirmed market calendar.";

const dayTradeScanWindows: DayTradeScanWindowDefinition[] = [
  {
    window: "morning",
    label: "Morning",
    start_time: "09:45",
    end_time: "11:00",
    start_minutes: 9 * 60 + 45,
    end_minutes: 11 * 60,
  },
  {
    window: "midday",
    label: "Midday",
    start_time: "12:00",
    end_time: "14:00",
    start_minutes: 12 * 60,
    end_minutes: 14 * 60,
  },
  {
    window: "power_hour",
    label: "Power hour",
    start_time: "15:00",
    end_time: "15:45",
    start_minutes: 15 * 60,
    end_minutes: 15 * 60 + 45,
  },
];

function finiteDate(value: Date | string | null | undefined) {
  const date = value instanceof Date ? value : value ? new Date(value) : new Date();
  return Number.isFinite(date.getTime()) ? date : new Date();
}

function textOrNull(value: string | null | undefined) {
  const text = value?.trim() ?? "";
  return text.length > 0 ? text : null;
}

function warning(
  warning_id: string,
  severity: DayTradeScanOrchestrationWarning["severity"],
  message: string,
): DayTradeScanOrchestrationWarning {
  return { warning_id, severity, message };
}

function nextAction(
  action_id: string,
  label: string,
  message: string,
): DayTradeScanOrchestrationNextAction {
  return { action_id, label, message };
}

function normalizeRunType(value: string | null | undefined): DayTradeScanRunType {
  if (
    value === "scheduled" ||
    value === "automatic" ||
    value === "background" ||
    value === "diagnostic" ||
    value === "unknown"
  ) {
    return value;
  }

  return "unknown";
}

function isTradingDay(input: {
  marketSession?: MarketSessionEvaluation | null;
  marketStatus?: MarketSessionStatus | null;
}) {
  if (typeof input.marketSession?.is_trading_day === "boolean") {
    return input.marketSession.is_trading_day;
  }

  if (input.marketStatus) {
    if (
      input.marketStatus.dayType === "weekend" ||
      input.marketStatus.dayType === "holiday"
    ) {
      return false;
    }

    if (input.marketStatus.dayType === "unknown") {
      return input.marketStatus.isOpenDay;
    }

    return input.marketStatus.isOpenDay;
  }

  return true;
}

function hasProviderConfirmedCalendar(
  marketStatus: MarketSessionStatus | null | undefined,
) {
  return Boolean(
    marketStatus &&
      marketStatus.provider &&
      marketStatus.provider !== "local_fallback" &&
      marketStatus.dayType !== "unknown",
  );
}

function hasStandardFallbackCalendar(input: {
  now: Date;
  marketStatus: MarketSessionStatus | null;
}) {
  const nyTime = getNyMarketTime(input.now);

  return Boolean(
    input.marketStatus?.provider === "local_fallback" &&
      input.marketStatus.dayType === "unknown" &&
      input.marketStatus.isOpenDay &&
      input.marketStatus.marketOpenTime === "09:30" &&
      input.marketStatus.marketCloseTime === "16:00" &&
      nyTime.weekday !== "Sat" &&
      nyTime.weekday !== "Sun",
  );
}

function activeWindowAllowsFallbackCalendarScan(window: DayTradeScanWindow) {
  return window === "morning" || window === "midday" || window === "power_hour";
}

export function isOfficialDayTradeScanWindow(
  window: string | null | undefined,
): window is OfficialDayTradeScanWindow {
  return window === "morning" || window === "midday" || window === "power_hour";
}

export function shouldRunOfficialDayTradeScan(
  summary: Pick<DayTradeScanOrchestrationSummary, "active_window" | "should_scan_now">,
) {
  return summary.should_scan_now && isOfficialDayTradeScanWindow(summary.active_window);
}

export function scheduledGateBlockReasonForOrchestration(
  orchestration: Pick<
    DayTradeScanOrchestrationSummary,
    "decision" | "calendar_confidence"
  >,
) {
  if (orchestration.decision === "scan_recently_completed") {
    return "cadence_guard";
  }

  if (orchestration.decision === "market_closed") {
    return "market_closed";
  }

  if (orchestration.decision === "blocked_by_provider") {
    return "market_calendar_provider_unavailable";
  }

  if (orchestration.decision === "outside_scan_window") {
    return "not_official_scan_window";
  }

  if (orchestration.decision === "should_wait_for_window") {
    return "should_wait_for_window";
  }

  if (orchestration.decision === "unknown") {
    return orchestration.calendar_confidence === "unknown"
      ? "market_calendar_provider_unavailable"
      : "unknown_orchestration_decision";
  }

  return "not_official_scan_window";
}

export function buildScheduledOfficialGateDiagnostics({
  orchestration,
  scanWindow,
}: {
  orchestration: DayTradeScanOrchestrationSummary;
  scanWindow: IntradayScanWindow;
}): ScheduledOfficialGateDiagnostics {
  const officialWindowDetected = isOfficialDayTradeScanWindow(
    orchestration.active_window,
  );
  const expectedScanWindow = dayTradeScanWindowToIntradayScanWindow(
    orchestration.active_window,
  );
  const scheduleWindowMismatch =
    officialWindowDetected && expectedScanWindow !== scanWindow;
  const scheduledGateAllowed =
    shouldRunOfficialDayTradeScan(orchestration) && !scheduleWindowMismatch;

  return {
    official_window_detected: officialWindowDetected,
    scheduled_gate_window: orchestration.active_window,
    scheduled_gate_allowed: scheduledGateAllowed,
    scheduled_gate_block_reason: scheduledGateAllowed
      ? null
      : scheduleWindowMismatch
        ? "schedule_window_mismatch"
        : scheduledGateBlockReasonForOrchestration(orchestration),
    schedule_window_mismatch: scheduleWindowMismatch,
  };
}

function calendarConfidenceFor(input: {
  now: Date;
  marketStatus: MarketSessionStatus | null;
}) {
  if (
    input.marketStatus?.dayType === "holiday" ||
    input.marketStatus?.dayType === "weekend" ||
    input.marketStatus?.isOpenDay === false
  ) {
    return "blocked" as const;
  }

  if (hasProviderConfirmedCalendar(input.marketStatus)) {
    return "provider_confirmed" as const;
  }

  if (hasStandardFallbackCalendar(input)) {
    return "fallback_estimated" as const;
  }

  return "unknown" as const;
}

export function normalizeDayTradeScanWindow(
  value: string | null | undefined,
): DayTradeScanWindow {
  if (value === "morning" || value === "opening" || value === "morning_momentum") {
    return "morning";
  }

  if (value === "midday" || value === "afternoon") {
    return "midday";
  }

  if (value === "power_hour") {
    return "power_hour";
  }

  if (
    value === "closed" ||
    value === "after_hours" ||
    value === "holiday" ||
    value === "weekend"
  ) {
    return "closed";
  }

  if (value === "outside_window" || value === "pre_market") {
    return "outside_window";
  }

  return "unknown";
}

export function classifyDayTradeScanWindow(input?: {
  now?: Date | string | null;
  marketSession?: MarketSessionEvaluation | null;
  marketStatus?: MarketSessionStatus | null;
}): DayTradeScanWindow {
  const now = finiteDate(input?.now);
  const nyTime = getNyMarketTime(now);
  const window = getRegularMarketOpenClose(input?.marketStatus);
  const locallyClosedWeekend =
    !input?.marketSession &&
    !input?.marketStatus &&
    (nyTime.weekday === "Sat" || nyTime.weekday === "Sun");
  const marketOpen =
    typeof input?.marketSession?.market_is_open === "boolean"
      ? input.marketSession.market_is_open
      : window.open_minutes !== null &&
        window.close_minutes !== null &&
        nyTime.minutes_after_midnight >= window.open_minutes &&
        nyTime.minutes_after_midnight < window.close_minutes &&
        isTradingDay(input ?? {});

  if (locallyClosedWeekend || !isTradingDay(input ?? {})) {
    return "closed";
  }

  if (!marketOpen) {
    if (
      window.open_minutes !== null &&
      nyTime.minutes_after_midnight < window.open_minutes
    ) {
      return "outside_window";
    }

    return "closed";
  }

  const activeDefinition = dayTradeScanWindows.find(
    (item) =>
      nyTime.minutes_after_midnight >= item.start_minutes &&
      nyTime.minutes_after_midnight < item.end_minutes,
  );

  return activeDefinition?.window ?? "outside_window";
}

export function dayTradeScanWindowToIntradayScanWindow(
  window: DayTradeScanWindow,
): IntradayScanWindow {
  if (window === "morning") return "morning_momentum";
  if (window === "midday") return "midday";
  if (window === "power_hour") return "power_hour";
  if (window === "closed") return "closed";
  return "pre_market";
}

function nextWindow(input: {
  minutesAfterMidnight: number;
  activeWindow: DayTradeScanWindow;
  marketOpen: boolean;
  tradingDay: boolean;
}) {
  if (!input.tradingDay || input.activeWindow === "closed") {
    return {
      window: "morning" as const,
      startsAt: "09:45",
      label: "Morning",
    };
  }

  const upcoming = dayTradeScanWindows.find(
    (item) => input.minutesAfterMidnight < item.start_minutes,
  );

  if (upcoming) {
    return {
      window: upcoming.window,
      startsAt: upcoming.start_time,
      label: upcoming.label,
    };
  }

  return {
    window: "closed" as const,
    startsAt: null,
    label: "Next trading day",
  };
}

function scanRunTradingDate(scanRun: RecommendationScanRun, observedAt: string) {
  const explicitTradingDate = textOrNull(scanRun.trading_date);

  if (explicitTradingDate) {
    return explicitTradingDate;
  }

  const date = new Date(observedAt);

  if (!Number.isFinite(date.getTime())) {
    return null;
  }

  return getNyMarketTime(date).ny_date;
}

function scanRunHasObservedAttempt(scanRun: RecommendationScanRun) {
  const payload = scanRun.payload_json ?? {};
  const activeTrace = payload.active_scan_trace;
  const scanObservability = payload.scan_observability;

  return (
    scanRun.counts.visible_recommendation_count > 0 ||
    (typeof activeTrace === "object" && activeTrace !== null) ||
    (typeof scanObservability === "object" &&
      scanObservability !== null &&
      scanRun.source !== "mixed") ||
    (scanRun.scanned_ticker_count ?? 0) > 0 ||
    (scanRun.raw_candidate_count ?? 0) > 0
  );
}

function latestScanPerWindow(scanRuns: RecommendationScanRun[], tradingDate: string) {
  const latest: Partial<Record<DayTradeScanWindow, string>> = {};

  for (const scanRun of scanRuns) {
    const window = normalizeDayTradeScanWindow(scanRun.window);
    const observedAt = textOrNull(scanRun.observed_at);

    if (
      !observedAt ||
      !isOfficialDayTradeScanWindow(window) ||
      !officialScanRunServesWindow(scanRun) ||
      scanRunTradingDate(scanRun, observedAt) !== tradingDate
    ) {
      continue;
    }

    if (!latest[window] || observedAt > latest[window]) {
      latest[window] = observedAt;
    }
  }

  return latest;
}

function latestAttemptPerWindow(
  scanRuns: RecommendationScanRun[],
  tradingDate: string,
) {
  const latest: Partial<
    Record<
      DayTradeScanWindow,
      {
        observed_at: string;
        classification: OfficialScanWindowAttemptClassification;
      }
    >
  > = {};

  for (const scanRun of scanRuns) {
    const window = normalizeDayTradeScanWindow(scanRun.window);
    const observedAt = textOrNull(scanRun.observed_at);

    if (
      !observedAt ||
      !isOfficialDayTradeScanWindow(window) ||
      !scanRunHasObservedAttempt(scanRun) ||
      scanRunTradingDate(scanRun, observedAt) !== tradingDate
    ) {
      continue;
    }

    if (!latest[window] || observedAt > latest[window].observed_at) {
      latest[window] = {
        observed_at: observedAt,
        classification: classifyOfficialScanWindowAttempt(
          officialScanRunEvidence(scanRun),
        ),
      };
    }
  }

  return latest;
}

function missedWindows(input: {
  scanRuns: RecommendationScanRun[];
  tradingDate: string;
  minutesAfterMidnight: number;
  marketOpen: boolean;
}) {
  if (!input.marketOpen) {
    return [];
  }

  const windowsWithRuns = new Set(
    input.scanRuns
      .filter(
        (scanRun) =>
          scanRun.trading_date === input.tradingDate &&
          officialScanRunServesWindow(scanRun),
      )
      .map((scanRun) => normalizeDayTradeScanWindow(scanRun.window)),
  );

  return dayTradeScanWindows
    .filter((item) => item.end_minutes <= input.minutesAfterMidnight)
    .map((item) => item.window)
    .filter((window) => !windowsWithRuns.has(window));
}

function officialWindowExplanation(input: {
  definition: DayTradeScanWindowDefinition;
  latestScanAt: string | null;
  latestAttemptAt: string | null;
  latestAttemptClassification: OfficialScanWindowAttemptClassification | null;
  activeWindow: DayTradeScanWindow;
  status: DayTradeScanWindowStatus;
}) {
  if (input.latestScanAt) {
    return `${input.definition.label} completed at ${input.latestScanAt}.`;
  }

  if (
    input.latestAttemptAt &&
    input.latestAttemptClassification === "empty_initial_tick_retry_allowed"
  ) {
    if (input.status === "missed") {
      return `${input.definition.label} ended without an official batch after the latest attempt was empty.`;
    }

    return `${input.definition.label} in progress - latest attempt empty; waiting for next scheduled tick.`;
  }

  if (input.status === "active") {
    return `${input.definition.label} is active now and eligible for an official scan.`;
  }

  if (input.status === "missed") {
    return `${input.definition.label} has no completed scan run recorded today.`;
  }

  if (input.status === "closed") {
    return `${input.definition.label} is closed because the market is not in a tradable official scan session.`;
  }

  if (input.activeWindow === "outside_window") {
    return `${input.definition.label} is waiting for its ${input.definition.start_time}-${input.definition.end_time} America/New_York window.`;
  }

  return `${input.definition.label} starts at ${input.definition.start_time} America/New_York.`;
}

function officialWindowStatuses(input: {
  latestByWindow: Partial<Record<DayTradeScanWindow, string>>;
  latestAttemptByWindow: Partial<
    Record<
      DayTradeScanWindow,
      {
        observed_at: string;
        classification: OfficialScanWindowAttemptClassification;
      }
    >
  >;
  missed: DayTradeScanWindow[];
  activeWindow: DayTradeScanWindow;
  decision: DayTradeScanOrchestrationDecision;
  minutesAfterMidnight: number;
  tradingDay: boolean;
}): DayTradeOfficialWindowStatus[] {
  return dayTradeScanWindows.map((definition) => {
    const latestScanAt = input.latestByWindow[definition.window] ?? null;
    const latestAttempt = input.latestAttemptByWindow[definition.window] ?? null;
    const attemptedToday = latestScanAt !== null || latestAttempt !== null;
    let status: DayTradeScanWindowStatus = "unknown";

    if (!input.tradingDay || input.activeWindow === "closed") {
      status = "closed";
    } else if (latestScanAt) {
      status = "completed";
    } else if (
      input.activeWindow === definition.window &&
      input.decision === "should_scan_now"
    ) {
      status = "active";
    } else if (input.missed.includes(definition.window)) {
      status = "missed";
    } else if (input.minutesAfterMidnight < definition.start_minutes) {
      status = "waiting";
    } else if (
      input.minutesAfterMidnight >= definition.start_minutes &&
      input.minutesAfterMidnight < definition.end_minutes
    ) {
      status = "waiting";
    } else {
      status = "missed";
    }

    return {
      window: definition.window,
      label: definition.label,
      start_time: definition.start_time,
      end_time: definition.end_time,
      latest_scan_at: latestScanAt,
      latest_attempt_at: latestAttempt?.observed_at ?? null,
      latest_attempt_classification: latestAttempt?.classification ?? null,
      attempted_today: attemptedToday,
      status,
      explanation: officialWindowExplanation({
        definition,
        latestScanAt,
        latestAttemptAt: latestAttempt?.observed_at ?? null,
        latestAttemptClassification: latestAttempt?.classification ?? null,
        activeWindow: input.activeWindow,
        status,
      }),
    };
  });
}

function recentlyCompleted(input: {
  latestScanAt: string | null;
  now: Date;
  cooldownMinutes: number;
}) {
  if (!input.latestScanAt) {
    return false;
  }

  const parsed = new Date(input.latestScanAt);

  if (!Number.isFinite(parsed.getTime())) {
    return false;
  }

  return input.now.getTime() - parsed.getTime() < input.cooldownMinutes * 60 * 1000;
}

function decisionFor(input: {
  activeWindow: DayTradeScanWindow;
  activeWindowLatestScanAt: string | null;
  now: Date;
  cooldownMinutes: number;
  marketStatus?: MarketSessionStatus | null;
  fallbackCalendarScanAllowed: boolean;
}) {
  if (input.activeWindow === "closed") {
    return "market_closed" as const;
  }

  if (input.activeWindow === "outside_window") {
    return "outside_scan_window" as const;
  }

  if (input.marketStatus?.dayType === "unknown" && !input.fallbackCalendarScanAllowed) {
    return "blocked_by_provider" as const;
  }

  if (input.activeWindow === "unknown") {
    return "unknown" as const;
  }

  if (
    recentlyCompleted({
      latestScanAt: input.activeWindowLatestScanAt,
      now: input.now,
      cooldownMinutes: input.cooldownMinutes,
    })
  ) {
    return "scan_recently_completed" as const;
  }

  return "should_scan_now" as const;
}

function statusForDecision(
  decision: DayTradeScanOrchestrationDecision,
): DayTradeScanWindowStatus {
  if (decision === "should_scan_now") return "active";
  if (decision === "scan_recently_completed") return "completed";
  if (decision === "market_closed") return "closed";
  if (decision === "outside_scan_window" || decision === "should_wait_for_window") {
    return "waiting";
  }
  return "unknown";
}

function actionForDecision(
  decision: DayTradeScanOrchestrationDecision,
  next: { window: DayTradeScanWindow; label: string },
  activeWindowLatestAttempt:
    | {
        classification: OfficialScanWindowAttemptClassification;
      }
    | null,
) {
  if (
    decision === "should_scan_now" &&
    activeWindowLatestAttempt?.classification === "empty_initial_tick_retry_allowed"
  ) {
    return nextAction(
      "wait_for_next_official_tick",
      "Wait for next scheduled tick",
      "Latest official-window attempt was empty, so the window remains eligible for the next scheduled scan tick.",
    );
  }

  if (decision === "should_scan_now") {
    return nextAction(
      "scanner_ready",
      "Scanner ready",
      "Ture is inside a defined day-trade scan window.",
    );
  }

  if (decision === "scan_recently_completed") {
    return nextAction(
      "scan_recently_completed",
      "Scan recently completed",
      "Wait for the next background scan cycle before recording another run.",
    );
  }

  if (decision === "market_closed") {
    return nextAction(
      "market_closed",
      "Market closed",
      "Closed-market periods are no-trade observation periods, not scanner failures.",
    );
  }

  if (decision === "blocked_by_provider") {
    return nextAction(
      "provider_issue",
      "Provider issue",
      "Market calendar status is unknown; wait for provider clarity before scanning.",
    );
  }

  if (next.window === "midday") {
    return nextAction(
      "wait_for_midday_window",
      "Wait for midday window",
      "Ture scans automatically during the next defined day-trade window.",
    );
  }

  if (next.window === "power_hour") {
    return nextAction(
      "wait_for_power_hour",
      "Wait for power hour",
      "Ture will treat power hour separately from regular midday scans.",
    );
  }

  return nextAction(
    "wait_for_morning_window",
    "Wait for morning window",
    "Ture scans automatically during defined day-trade windows.",
  );
}

export function buildDayTradeScanOrchestrationSummary(
  input: DayTradeScanOrchestrationInput = {},
): DayTradeScanOrchestrationSummary {
  const now = finiteDate(input.now);
  const nyTime = getNyMarketTime(now);
  const marketSession = input.marketSession ?? null;
  const marketStatus = input.marketStatus ?? null;
  const activeWindow = classifyDayTradeScanWindow({
    now,
    marketSession,
    marketStatus,
  });
  const marketOpen =
    typeof marketSession?.market_is_open === "boolean"
      ? marketSession.market_is_open
      : activeWindow !== "closed";
  const tradingDay = isTradingDay({ marketSession, marketStatus });
  const latestByWindow = latestScanPerWindow(input.scanRuns ?? [], nyTime.ny_date);
  const latestAttemptByWindow = latestAttemptPerWindow(
    input.scanRuns ?? [],
    nyTime.ny_date,
  );
  const latestScanWindow =
    (Object.entries(latestByWindow).sort(([, first], [, second]) =>
      second.localeCompare(first),
    )[0]?.[0] as DayTradeScanWindow | undefined) ?? "unknown";
  const latestScanAt =
    latestScanWindow === "unknown" ? null : latestByWindow[latestScanWindow] ?? null;
  const next = nextWindow({
    minutesAfterMidnight: nyTime.minutes_after_midnight,
    activeWindow,
    marketOpen,
    tradingDay,
  });
  const activeWindowLatestScanAt =
    activeWindow === "unknown" ? null : latestByWindow[activeWindow] ?? null;
  const activeWindowLatestAttempt =
    activeWindow === "unknown" ? null : latestAttemptByWindow[activeWindow] ?? null;
  const calendarConfidence = calendarConfidenceFor({ now, marketStatus });
  const providerCalendarAvailable = calendarConfidence === "provider_confirmed";
  const fallbackCalendarScanAllowed =
    calendarConfidence === "fallback_estimated" &&
    activeWindowAllowsFallbackCalendarScan(activeWindow);
  const decision = decisionFor({
    activeWindow,
    activeWindowLatestScanAt,
    now,
    cooldownMinutes: input.lastScanCooldownMinutes ?? 45,
    marketStatus,
    fallbackCalendarScanAllowed,
  });
  const warnings: DayTradeScanOrchestrationWarning[] = [];

  if (fallbackCalendarScanAllowed) {
    warnings.push(
      warning(
        "market_calendar_fallback_timing",
        "warning",
        MARKET_CALENDAR_FALLBACK_SCAN_WARNING,
      ),
      warning(
        "fallback_timing_execution_boundary",
        "info",
        MARKET_CALENDAR_FALLBACK_EXECUTION_WARNING,
      ),
      warning(
        "human_confirmed_execution",
        "info",
        HUMAN_CONFIRMED_EXECUTION_WARNING,
      ),
      warning(
        "polygon_calendar_env_guidance",
        "info",
        POLYGON_CALENDAR_ENV_GUIDANCE,
      ),
    );
  }

  if (decision === "blocked_by_provider") {
    warnings.push(
      warning(
        "market_calendar_unknown",
        "warning",
        "Market calendar status is unknown, so scan orchestration is conservative.",
      ),
    );
  }

  if (activeWindow === "outside_window") {
    warnings.push(
      warning(
        "outside_defined_scan_window",
        "info",
        "The market may be open, but the current time is outside defined day-trade scan windows.",
      ),
    );
  }

  const missed = missedWindows({
    scanRuns: input.scanRuns ?? [],
    tradingDate: nyTime.ny_date,
    minutesAfterMidnight: nyTime.minutes_after_midnight,
    marketOpen,
  });
  const officialStatuses = officialWindowStatuses({
    latestByWindow,
    latestAttemptByWindow,
    missed,
    activeWindow,
    decision,
    minutesAfterMidnight: nyTime.minutes_after_midnight,
    tradingDay,
  });

  if (missed.length > 0) {
    warnings.push(
      warning(
        "missed_scan_windows",
        "warning",
        `No scan run is recorded for: ${missed.join(", ")}.`,
      ),
    );
  }

  return {
    summary_id: `day_trade_scan_orchestration:${nyTime.ny_date}:${nyTime.ny_time}`,
    summary_version: "1.0",
    summary_kind: "day_trade_scan_orchestration",
    generated_at: now.toISOString(),
    current_utc_time: now.toISOString(),
    current_ny_time: `${nyTime.ny_date} ${nyTime.ny_time} America/New_York`,
    timezone,
    trading_date: nyTime.ny_date,
    ny_time: nyTime.ny_time,
    market_session_phase: marketSession?.phase ?? "unknown",
    market_is_open: marketOpen,
    is_trading_day: tradingDay,
    calendar_confidence: calendarConfidence,
    provider_calendar_available: providerCalendarAvailable,
    fallback_calendar_scan_allowed: fallbackCalendarScanAllowed,
    active_window: activeWindow,
    active_window_status: statusForDecision(decision),
    next_window: next.window,
    next_window_starts_at: next.startsAt,
    next_window_label: next.label,
    decision,
    should_scan_now: decision === "should_scan_now",
    should_wait_for_window:
      decision === "outside_scan_window" ||
      decision === "scan_recently_completed",
    expected_recommendation_target: {
      min: 6,
      max: 10,
    },
    latest_scan_window: latestScanWindow,
    latest_scan_at: latestScanAt,
    latest_scan_per_window: latestByWindow,
    missed_windows: missed,
    official_scan_windows: dayTradeScanWindows.map((item) => ({ ...item })),
    official_window_statuses: officialStatuses,
    scan_reason:
      decision === "should_scan_now" && fallbackCalendarScanAllowed
        ? `${activeWindow} day-trade window is active using NY-time fallback.`
        : decision === "should_scan_now"
        ? `${activeWindow} day-trade window is active.`
        : decision === "market_closed"
          ? "Market is closed; no recommendation scan is expected."
          : decision === "outside_scan_window"
            ? "Current time is outside defined day-trade scan windows."
            : decision === "scan_recently_completed"
              ? `${activeWindow} scan recently completed.`
              : "Scan orchestration needs review.",
    current_data_mode: textOrNull(input.currentDataMode) ?? "unknown",
    run_type: normalizeRunType(
      typeof input.runType === "string" ? input.runType : null,
    ),
    warnings,
    next_action: actionForDecision(decision, next, activeWindowLatestAttempt),
    copy: {
      automatic_scans:
        "Ture scans automatically during defined day-trade windows.",
      closed_market:
        "Closed-market periods are no-trade observation periods, not scanner failures.",
      unknown_windows:
        "Unknown windows are only used when the scan time cannot be classified.",
      fallback_timing: MARKET_CALENDAR_FALLBACK_EXECUTION_WARNING,
      execution_boundary: HUMAN_CONFIRMED_EXECUTION_WARNING,
    },
  };
}

export function dayTradeScanOrchestrationSummaryJson(
  summary: DayTradeScanOrchestrationSummary,
) {
  return JSON.stringify(summary, null, 2);
}
