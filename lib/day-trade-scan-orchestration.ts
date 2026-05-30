import type { IntradayScanWindow } from "@/lib/intraday-scan-window";
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
  window: Exclude<DayTradeScanWindow, "closed" | "outside_window" | "unknown">;
  label: string;
  start_time: string;
  end_time: string;
  start_minutes: number;
  end_minutes: number;
};

export type DayTradeScanOrchestrationSummary = {
  summary_id: string;
  summary_version: "1.0";
  summary_kind: "day_trade_scan_orchestration";
  generated_at: string;
  timezone: "America/New_York";
  trading_date: string;
  ny_time: string;
  market_session_phase: string;
  market_is_open: boolean;
  is_trading_day: boolean;
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
  scan_reason: string;
  current_data_mode: string;
  run_type: DayTradeScanRunType;
  warnings: DayTradeScanOrchestrationWarning[];
  next_action: DayTradeScanOrchestrationNextAction;
  copy: {
    automatic_scans: string;
    closed_market: string;
    unknown_windows: string;
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

const timezone = "America/New_York" as const;
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

function latestScanPerWindow(scanRuns: RecommendationScanRun[]) {
  const latest: Partial<Record<DayTradeScanWindow, string>> = {};

  for (const scanRun of scanRuns) {
    const window = normalizeDayTradeScanWindow(scanRun.window);
    const observedAt = textOrNull(scanRun.observed_at);

    if (!observedAt || window === "unknown") {
      continue;
    }

    if (!latest[window] || observedAt > latest[window]) {
      latest[window] = observedAt;
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
      .filter((scanRun) => scanRun.trading_date === input.tradingDate)
      .map((scanRun) => normalizeDayTradeScanWindow(scanRun.window)),
  );

  return dayTradeScanWindows
    .filter((item) => item.end_minutes <= input.minutesAfterMidnight)
    .map((item) => item.window)
    .filter((window) => !windowsWithRuns.has(window));
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
}) {
  if (input.marketStatus?.dayType === "unknown") {
    return "blocked_by_provider" as const;
  }

  if (input.activeWindow === "closed") {
    return "market_closed" as const;
  }

  if (input.activeWindow === "outside_window") {
    return "outside_scan_window" as const;
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
) {
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
  const latestByWindow = latestScanPerWindow(input.scanRuns ?? []);
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
  const decision = decisionFor({
    activeWindow,
    activeWindowLatestScanAt,
    now,
    cooldownMinutes: input.lastScanCooldownMinutes ?? 45,
    marketStatus,
  });
  const warnings: DayTradeScanOrchestrationWarning[] = [];

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
    timezone,
    trading_date: nyTime.ny_date,
    ny_time: nyTime.ny_time,
    market_session_phase: marketSession?.phase ?? "unknown",
    market_is_open: marketOpen,
    is_trading_day: tradingDay,
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
    scan_reason:
      decision === "should_scan_now"
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
    next_action: actionForDecision(decision, next),
    copy: {
      automatic_scans:
        "Ture scans automatically during defined day-trade windows.",
      closed_market:
        "Closed-market periods are no-trade observation periods, not scanner failures.",
      unknown_windows:
        "Unknown windows are only used when the scan time cannot be classified.",
    },
  };
}

export function dayTradeScanOrchestrationSummaryJson(
  summary: DayTradeScanOrchestrationSummary,
) {
  return JSON.stringify(summary, null, 2);
}
