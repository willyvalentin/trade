import type { MarketStatus } from "@/lib/market-calendar";

export type IntradayScanWindow =
  | "pre_market"
  | "opening"
  | "morning_momentum"
  | "midday"
  | "afternoon"
  | "power_hour"
  | "closed";

export type LegacySessionType = "morning" | "midday";

export type IntradayScanPolicy = {
  allowGeneration: boolean;
  maxRecommendations: number;
  message: string;
};

const defaultMarketTimezone = "America/New_York";

function getTimeParts(now: Date, marketTimezone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: marketTimezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    hourCycle: "h23",
  }).formatToParts(now);
  const valueByType = new Map(parts.map((part) => [part.type, part.value]));

  return {
    year: valueByType.get("year") ?? "",
    month: valueByType.get("month") ?? "",
    day: valueByType.get("day") ?? "",
    minutesAfterMidnight:
      Number(valueByType.get("hour") ?? "0") * 60 +
      Number(valueByType.get("minute") ?? "0"),
  };
}

export function getIntradayScanWindow(
  now: Date,
  marketTimezone = defaultMarketTimezone,
): IntradayScanWindow {
  const { minutesAfterMidnight } = getTimeParts(now, marketTimezone);
  const openingBell = 9 * 60 + 30;
  const openingEnd = 10 * 60;
  const morningMomentumEnd = 11 * 60 + 30;
  const middayEnd = 13 * 60 + 30;
  const afternoonEnd = 15 * 60;
  const close = 16 * 60;

  if (minutesAfterMidnight < openingBell) {
    return "pre_market";
  }

  if (minutesAfterMidnight < openingEnd) {
    return "opening";
  }

  if (minutesAfterMidnight < morningMomentumEnd) {
    return "morning_momentum";
  }

  if (minutesAfterMidnight < middayEnd) {
    return "midday";
  }

  if (minutesAfterMidnight < afternoonEnd) {
    return "afternoon";
  }

  if (minutesAfterMidnight < close) {
    return "power_hour";
  }

  return "closed";
}

export function getNewYorkDateString(now: Date) {
  const parts = getTimeParts(now, defaultMarketTimezone);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function getIntradayScanWindowLabel(window: IntradayScanWindow) {
  if (window === "pre_market") return "Pre-market";
  if (window === "opening") return "Opening";
  if (window === "morning_momentum") return "Morning momentum";
  if (window === "midday") return "Midday";
  if (window === "afternoon") return "Afternoon";
  if (window === "power_hour") return "Power hour";
  return "Closed";
}

export function getLegacySessionTypeForScanWindow(
  window: IntradayScanWindow,
): LegacySessionType {
  // TODO: Add scan_window column for intraday day trading windows.
  return window === "opening" || window === "morning_momentum"
    ? "morning"
    : "midday";
}

export function getIntradayScanPolicy(
  window: IntradayScanWindow,
): IntradayScanPolicy {
  if (window === "pre_market") {
    return {
      allowGeneration: false,
      maxRecommendations: 0,
      message: "Market is not open for active day trading yet.",
    };
  }

  if (window === "opening") {
    return {
      allowGeneration: true,
      maxRecommendations: 1,
      message: "Opening window: require confirmation and avoid chasing.",
    };
  }

  if (window === "morning_momentum") {
    return {
      allowGeneration: true,
      maxRecommendations: 2,
      message: "Morning momentum window: prioritize high-quality intraday setups.",
    };
  }

  if (window === "midday") {
    return {
      allowGeneration: true,
      maxRecommendations: 1,
      message: "Midday window: avoid chop and prefer no trade over weak setups.",
    };
  }

  if (window === "afternoon") {
    return {
      allowGeneration: true,
      maxRecommendations: 1,
      message: "Afternoon window: only clear continuation or reversal setups.",
    };
  }

  if (window === "power_hour") {
    return {
      allowGeneration: false,
      maxRecommendations: 0,
      message:
        "Power hour: new recommendations disabled. Focus on managing active positions.",
    };
  }

  return {
    allowGeneration: false,
    maxRecommendations: 0,
    message: "Market is closed for active day trading.",
  };
}

function timeToMinutes(time: string | null) {
  if (!time) {
    return null;
  }

  const [hour, minute] = time.split(":").map(Number);

  if (!Number.isFinite(hour) || !Number.isFinite(minute)) {
    return null;
  }

  return hour * 60 + minute;
}

export function isMarketOpenForIntradayTrading(
  marketStatus: MarketStatus,
  now = new Date(),
) {
  if (
    !marketStatus.isOpenDay ||
    marketStatus.dayType === "unknown" ||
    marketStatus.dayType === "weekend" ||
    marketStatus.dayType === "holiday"
  ) {
    return false;
  }

  const { minutesAfterMidnight } = getTimeParts(now, defaultMarketTimezone);
  const openMinutes = timeToMinutes(marketStatus.marketOpenTime) ?? 9 * 60 + 30;
  const closeMinutes = timeToMinutes(marketStatus.marketCloseTime) ?? 16 * 60;

  return minutesAfterMidnight >= openMinutes && minutesAfterMidnight < closeMinutes;
}
