export type MarketSessionPhase =
  | "pre_market"
  | "regular"
  | "power_hour"
  | "closing_soon"
  | "after_hours"
  | "closed"
  | "holiday"
  | "unknown";

export type MarketSessionRiskLevel =
  | "low"
  | "medium"
  | "high"
  | "critical"
  | "unknown";

export type MarketSessionSource =
  | "market_data_provider"
  | "local_time_approximation"
  | "unknown";

export type MarketSessionStatus = {
  isOpenDay: boolean;
  reason: string;
  date: string;
  dayType: "trading_day" | "weekend" | "holiday" | "early_close" | "unknown";
  marketOpenTime: string | null;
  marketCloseTime: string | null;
  provider?: string | null;
  fromCache?: boolean | null;
};

export type MarketSessionWindow = {
  open_time: string | null;
  close_time: string | null;
  open_minutes: number | null;
  close_minutes: number | null;
  timezone: "America/New_York";
};

export type MarketSessionWarning = {
  warning_id: string;
  message: string;
};

export type MarketSessionBlocker = {
  blocker_id: string;
  message: string;
};

export type MarketSessionEvaluation = {
  evaluation_id: string;
  evaluated_at: string;
  timezone: "America/New_York";
  ny_date: string;
  ny_time: string;
  weekday: string;
  phase: MarketSessionPhase;
  risk_level: MarketSessionRiskLevel;
  source: MarketSessionSource;
  provider: string | null;
  provider_day_type: string | null;
  market_is_open: boolean;
  is_trading_day: boolean;
  is_holiday: boolean;
  is_early_close: boolean;
  window: MarketSessionWindow;
  minutes_since_open: number | null;
  minutes_to_close: number | null;
  minutes_to_open: number | null;
  warnings: MarketSessionWarning[];
  blockers: MarketSessionBlocker[];
  next_recommended_action: string;
  approximation_note: string | null;
};

export type TradingDayRange = {
  range_id: string;
  label: string;
  start_date: string;
  end_date: string;
  start_at: string;
  end_at: string;
  timezone: "America/New_York";
  source: MarketSessionSource;
  approximation_note: string | null;
};

const timezone = "America/New_York" as const;
const defaultOpenTime = "09:30";
const defaultCloseTime = "16:00";

function finiteDate(value: Date | string | null | undefined) {
  const date = value instanceof Date ? value : value ? new Date(value) : new Date();
  return Number.isFinite(date.getTime()) ? date : new Date();
}

function nyParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    hourCycle: "h23",
  }).formatToParts(date);
  const byType = new Map(parts.map((part) => [part.type, part.value]));
  const hour = Number(byType.get("hour") ?? "0");
  const minute = Number(byType.get("minute") ?? "0");

  return {
    weekday: byType.get("weekday") ?? "unknown",
    year: Number(byType.get("year") ?? "0"),
    month: Number(byType.get("month") ?? "0"),
    day: Number(byType.get("day") ?? "0"),
    hour: Number.isFinite(hour) ? hour : 0,
    minute: Number.isFinite(minute) ? minute : 0,
    second: Number(byType.get("second") ?? "0"),
  };
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function dateKey(parts: ReturnType<typeof nyParts>) {
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}`;
}

function addDaysToDateKey(value: string, days: number) {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days, 12, 0, 0));
  const parts = nyParts(date);
  return dateKey(parts);
}

function dayOfWeekForDateKey(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0)).getUTCDay();
}

function isWeekendDateKey(value: string) {
  const day = dayOfWeekForDateKey(value);
  return day === 0 || day === 6;
}

function previousWeekdayDateKey(value: string) {
  let cursor = addDaysToDateKey(value, -1);
  while (isWeekendDateKey(cursor)) {
    cursor = addDaysToDateKey(cursor, -1);
  }
  return cursor;
}

function startOfWeekDateKey(value: string) {
  const day = dayOfWeekForDateKey(value);
  const daysSinceMonday = day === 0 ? 6 : day - 1;
  return addDaysToDateKey(value, -daysSinceMonday);
}

function endOfWeekDateKey(value: string) {
  return addDaysToDateKey(startOfWeekDateKey(value), 4);
}

function timeToMinutes(value: string | null | undefined) {
  const match = value?.match(/^(\d{1,2}):(\d{2})/);

  if (!match) {
    return null;
  }

  const hour = Number(match[1]);
  const minute = Number(match[2]);

  if (!Number.isFinite(hour) || !Number.isFinite(minute)) {
    return null;
  }

  return hour * 60 + minute;
}

function nyDateTimeToUtcMs(date: string, minutesAfterMidnight: number) {
  const [year, month, day] = date.split("-").map(Number);
  const hour = Math.floor(minutesAfterMidnight / 60);
  const minute = minutesAfterMidnight % 60;
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute, 0);
  const formatted = nyParts(new Date(utcGuess));
  const formattedAsUtc = Date.UTC(
    formatted.year,
    formatted.month - 1,
    formatted.day,
    formatted.hour,
    formatted.minute,
    0,
  );
  return utcGuess - (formattedAsUtc - utcGuess);
}

function tradingDayFromStatus(
  marketStatus: MarketSessionStatus | null | undefined,
  nyDate: string,
) {
  if (marketStatus) {
    if (marketStatus.dayType === "holiday") return false;
    if (marketStatus.dayType === "weekend") return false;
    if (marketStatus.dayType === "unknown") return marketStatus.isOpenDay;
    return marketStatus.isOpenDay;
  }

  return !isWeekendDateKey(nyDate);
}

function dataSource(marketStatus: MarketSessionStatus | null | undefined) {
  if (!marketStatus) {
    return "local_time_approximation" as const;
  }

  if (marketStatus.provider && marketStatus.provider !== "local_fallback") {
    return "market_data_provider" as const;
  }

  return "local_time_approximation" as const;
}

function warning(warning_id: string, message: string): MarketSessionWarning {
  return { warning_id, message };
}

function blocker(blocker_id: string, message: string): MarketSessionBlocker {
  return { blocker_id, message };
}

export function getNyMarketTime(now: Date | string = new Date()) {
  const date = finiteDate(now);
  const parts = nyParts(date);
  const nyDate = dateKey(parts);

  return {
    date,
    ny_date: nyDate,
    ny_time: `${pad(parts.hour)}:${pad(parts.minute)}`,
    weekday: parts.weekday,
    minutes_after_midnight: parts.hour * 60 + parts.minute,
  };
}

export function getRegularMarketOpenClose(
  marketStatus?: MarketSessionStatus | null,
): MarketSessionWindow {
  const openTime = marketStatus?.marketOpenTime ?? defaultOpenTime;
  const closeTime = marketStatus?.marketCloseTime ?? defaultCloseTime;

  return {
    open_time: openTime,
    close_time: closeTime,
    open_minutes: timeToMinutes(openTime),
    close_minutes: timeToMinutes(closeTime),
    timezone,
  };
}

export function isUsTradingDay(input?: {
  now?: Date | string;
  marketStatus?: MarketSessionStatus | null;
}) {
  const nyTime = getNyMarketTime(input?.now ?? new Date());
  return tradingDayFromStatus(input?.marketStatus, nyTime.ny_date);
}

export function getMinutesToMarketClose(input?: {
  now?: Date | string;
  marketStatus?: MarketSessionStatus | null;
}) {
  const nyTime = getNyMarketTime(input?.now ?? new Date());
  const window = getRegularMarketOpenClose(input?.marketStatus);

  if (window.close_minutes === null) {
    return null;
  }

  return window.close_minutes - nyTime.minutes_after_midnight;
}

export function getMinutesSinceMarketOpen(input?: {
  now?: Date | string;
  marketStatus?: MarketSessionStatus | null;
}) {
  const nyTime = getNyMarketTime(input?.now ?? new Date());
  const window = getRegularMarketOpenClose(input?.marketStatus);

  if (window.open_minutes === null) {
    return null;
  }

  return nyTime.minutes_after_midnight - window.open_minutes;
}

export function buildMarketSessionEvaluation(input?: {
  now?: Date | string;
  marketStatus?: MarketSessionStatus | null;
}): MarketSessionEvaluation {
  const now = finiteDate(input?.now ?? new Date());
  const marketStatus = input?.marketStatus ?? null;
  const nyTime = getNyMarketTime(now);
  const window = getRegularMarketOpenClose(marketStatus);
  const source = dataSource(marketStatus);
  const isTradingDay = tradingDayFromStatus(marketStatus, nyTime.ny_date);
  const isHoliday = marketStatus?.dayType === "holiday";
  const isEarlyClose = marketStatus?.dayType === "early_close";
  const minutesSinceOpen =
    window.open_minutes === null
      ? null
      : nyTime.minutes_after_midnight - window.open_minutes;
  const minutesToClose =
    window.close_minutes === null
      ? null
      : window.close_minutes - nyTime.minutes_after_midnight;
  const minutesToOpen =
    window.open_minutes === null
      ? null
      : window.open_minutes - nyTime.minutes_after_midnight;
  const warnings: MarketSessionWarning[] = [];
  const blockers: MarketSessionBlocker[] = [];
  let phase: MarketSessionPhase = "unknown";
  let riskLevel: MarketSessionRiskLevel = "unknown";

  if (!marketStatus && source === "local_time_approximation") {
    warnings.push(
      warning(
        "weekday_time_approximation",
        "Market session is based on New York weekday/time approximation; holidays are not verified.",
      ),
    );
  }

  if (marketStatus?.dayType === "unknown") {
    warnings.push(
      warning(
        "market_calendar_unknown",
        "Market calendar provider returned unknown day type; treat session timing conservatively.",
      ),
    );
  }

  if (!isTradingDay) {
    phase = isHoliday ? "holiday" : "closed";
    riskLevel = isHoliday ? "critical" : "high";
    blockers.push(
      blocker(
        isHoliday ? "market_holiday" : "market_closed_day",
        marketStatus?.reason || "US market is not a regular trading day.",
      ),
    );
  } else if (window.open_minutes === null || window.close_minutes === null) {
    phase = "unknown";
    riskLevel = "unknown";
    warnings.push(
      warning(
        "missing_market_window",
        "Market open/close time is unavailable; review manually.",
      ),
    );
  } else if (nyTime.minutes_after_midnight < window.open_minutes) {
    phase = "pre_market";
    riskLevel = "medium";
    warnings.push(
      warning(
        "pre_market_session",
        "Regular market is not open yet; day-trade execution requires manual review.",
      ),
    );
  } else if (nyTime.minutes_after_midnight >= window.close_minutes) {
    phase = "after_hours";
    riskLevel = "high";
    warnings.push(
      warning(
        "after_hours_session",
        "Regular market session has ended; do not open new day trades without explicit review.",
      ),
    );
  } else if (minutesToClose !== null && minutesToClose <= 30) {
    phase = "closing_soon";
    riskLevel = "critical";
    warnings.push(
      warning(
        "closing_soon",
        "Market close is within 30 minutes; prioritize managing open day trades.",
      ),
    );
  } else if (minutesToClose !== null && minutesToClose <= 60) {
    phase = "power_hour";
    riskLevel = "high";
    warnings.push(
      warning(
        "power_hour",
        "Power hour increases execution and overnight risk for day trades.",
      ),
    );
  } else {
    phase = "regular";
    riskLevel = "low";
  }

  const marketIsOpen =
    isTradingDay &&
    window.open_minutes !== null &&
    window.close_minutes !== null &&
    nyTime.minutes_after_midnight >= window.open_minutes &&
    nyTime.minutes_after_midnight < window.close_minutes;

  return {
    evaluation_id: `market_session_${nyTime.ny_date}_${nyTime.ny_time.replace(":", "")}`,
    evaluated_at: now.toISOString(),
    timezone,
    ny_date: nyTime.ny_date,
    ny_time: nyTime.ny_time,
    weekday: nyTime.weekday,
    phase,
    risk_level: riskLevel,
    source,
    provider: marketStatus?.provider ?? null,
    provider_day_type: marketStatus?.dayType ?? null,
    market_is_open: marketIsOpen,
    is_trading_day: isTradingDay,
    is_holiday: isHoliday,
    is_early_close: isEarlyClose,
    window,
    minutes_since_open:
      marketIsOpen && minutesSinceOpen !== null ? minutesSinceOpen : null,
    minutes_to_close:
      marketIsOpen && minutesToClose !== null ? Math.max(0, minutesToClose) : null,
    minutes_to_open:
      !marketIsOpen && minutesToOpen !== null && minutesToOpen > 0
        ? minutesToOpen
        : null,
    warnings,
    blockers,
    next_recommended_action:
      phase === "regular"
        ? "Normal day-trade review window. Follow existing validation and risk gates."
        : phase === "power_hour" || phase === "closing_soon"
          ? "Prioritize live trade management and avoid adding marginal new risk."
          : phase === "pre_market"
            ? "Wait for regular-hours confirmation before opening a day trade."
            : phase === "after_hours"
              ? "Do not open new day trades; review open positions manually."
              : "Review market calendar status before taking new risk.",
    approximation_note:
      source === "local_time_approximation"
        ? "Holiday accuracy is not guaranteed without provider calendar data."
        : null,
  };
}

export function getTradingDayRange(input?: {
  startDate: string;
  endDate: string;
  source?: MarketSessionSource;
  label?: string;
}): TradingDayRange {
  const source = input?.source ?? "local_time_approximation";
  const startDate = input?.startDate ?? getNyMarketTime().ny_date;
  const endDate = input?.endDate ?? startDate;
  const startMs = nyDateTimeToUtcMs(startDate, 0);
  const endMs = nyDateTimeToUtcMs(endDate, 24 * 60 - 1);

  return {
    range_id: `${startDate}_${endDate}`,
    label: input?.label ?? `${startDate} to ${endDate}`,
    start_date: startDate,
    end_date: endDate,
    start_at: new Date(startMs).toISOString(),
    end_at: new Date(endMs).toISOString(),
    timezone,
    source,
    approximation_note:
      source === "local_time_approximation"
        ? "Weekends are excluded, but US holidays are not verified without market calendar data."
        : null,
  };
}

export function getCurrentTradingWeekRange(input?: {
  now?: Date | string;
  source?: MarketSessionSource;
}) {
  const nyDate = getNyMarketTime(input?.now ?? new Date()).ny_date;
  const start = startOfWeekDateKey(nyDate);
  const end = endOfWeekDateKey(nyDate);
  return getTradingDayRange({
    startDate: start,
    endDate: end,
    source: input?.source ?? "local_time_approximation",
    label: "Current trading week",
  });
}

export function getLastTradingWeekRange(input?: {
  now?: Date | string;
  source?: MarketSessionSource;
}) {
  const nyDate = getNyMarketTime(input?.now ?? new Date()).ny_date;
  const previousTradingDay = previousWeekdayDateKey(startOfWeekDateKey(nyDate));
  const start = startOfWeekDateKey(previousTradingDay);
  const end = endOfWeekDateKey(previousTradingDay);
  return getTradingDayRange({
    startDate: start,
    endDate: end,
    source: input?.source ?? "local_time_approximation",
    label: "Last trading week",
  });
}

export function marketSessionEvaluationJson(
  evaluation: MarketSessionEvaluation,
) {
  return JSON.stringify(evaluation, null, 2);
}
