import { getUsEquityMarketSession } from "@/lib/us-equity-market-calendar";
import { type MarketStatus } from "@/lib/market-calendar";
import { getNyMarketTime } from "@/lib/market-session";

export const ai02StagingOneShotSource = "ai02_staging_one_shot_source";

type Ai02StagingOneShotMarketStatusInput = {
  now: Date;
  source: string | null;
  providerBudgetRequested: boolean;
};

function localTimeFromUtc(value: string | null) {
  if (!value) return null;

  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return null;

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    hourCycle: "h23",
  }).formatToParts(date);
  const byType = new Map(parts.map((part) => [part.type, part.value]));
  const hour = byType.get("hour");
  const minute = byType.get("minute");

  return hour && minute ? `${hour}:${minute}` : null;
}

function unavailableStatus(input: Ai02StagingOneShotMarketStatusInput): MarketStatus {
  const session = getUsEquityMarketSession(input.now);
  const date = session.market_date ?? getNyMarketTime(input.now).ny_date;

  if (session.session_type === "closed_holiday" || session.session_type === "closed_special") {
    return {
      isOpenDay: false,
      reason: session.closed_reason ?? "Verified US-equity market closure.",
      date,
      dayType: "holiday",
      marketOpenTime: null,
      marketCloseTime: null,
      provider: "verified_us_equity_market_calendar",
      fromCache: false,
    };
  }

  if (session.session_type === "closed_weekend") {
    return {
      isOpenDay: false,
      reason: session.closed_reason ?? "Weekend",
      date,
      dayType: "weekend",
      marketOpenTime: null,
      marketCloseTime: null,
      provider: "verified_us_equity_market_calendar",
      fromCache: false,
    };
  }

  return {
    isOpenDay: false,
    reason: "AI-02.17 verified US-equity calendar is unavailable for this one-shot request.",
    date,
    dayType: "unknown",
    marketOpenTime: null,
    marketCloseTime: null,
    provider: "verified_us_equity_market_calendar",
    fromCache: false,
  };
}

/**
 * Returns a local, verified calendar status only for the bounded AI-02.17
 * one-shot source request. It deliberately never reads the normal calendar
 * cache or contacts its market-data provider: the operation's two-request
 * provider budget is reserved for the source and outcome candles.
 */
export function getAi02StagingOneShotMarketStatus(
  input: Ai02StagingOneShotMarketStatusInput,
): MarketStatus | null {
  if (
    input.source !== ai02StagingOneShotSource ||
    input.providerBudgetRequested !== true
  ) {
    return null;
  }

  const session = getUsEquityMarketSession(input.now);
  const date = session.market_date ?? getNyMarketTime(input.now).ny_date;
  const marketOpenTime = localTimeFromUtc(session.session_open);
  const marketCloseTime = localTimeFromUtc(session.session_close);

  if (
    session.verification_status !== "verified" ||
    (session.session_type !== "regular_session" &&
      session.session_type !== "early_close_session") ||
    !marketOpenTime ||
    !marketCloseTime
  ) {
    return unavailableStatus(input);
  }

  return {
    isOpenDay: true,
    reason:
      session.session_type === "early_close_session"
        ? session.closed_reason ?? "Verified US-equity early-close session."
        : "Verified US-equity regular session.",
    date,
    dayType:
      session.session_type === "early_close_session"
        ? "early_close"
        : "trading_day",
    marketOpenTime,
    marketCloseTime,
    provider: "verified_us_equity_market_calendar",
    fromCache: false,
  };
}

export async function resolveAutomationMarketStatus(input: {
  now: Date;
  source: string | null;
  providerBudgetRequested: boolean;
  getDefaultMarketStatus: () => Promise<MarketStatus>;
}) {
  const ai02Status = getAi02StagingOneShotMarketStatus(input);
  return ai02Status ?? input.getDefaultMarketStatus();
}
