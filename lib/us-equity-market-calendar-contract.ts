export const usEquityMarketCalendarContractVersion =
  "us_equity_market_calendar_v1" as const;
export const usEquityMarketCalendarDatasetContractVersion =
  "us_equity_market_calendar_dataset_v1" as const;
export const usEquityMarketCalendarTimezone = "America/New_York" as const;
export const usEquityMarketCalendarSourceCategory =
  "repository_pinned_official_exchange_calendar" as const;
export const usEquityMarketCalendarCoverage = Object.freeze({
  start: "2026-01-01",
  end: "2028-12-31",
  recommended_refresh_date: "2028-07-01",
});

export type UsEquityMarketSessionType =
  | "regular_session"
  | "early_close_session"
  | "closed_weekend"
  | "closed_holiday"
  | "closed_special"
  | "unknown";

export type UsEquityMarketCalendarVerificationStatus =
  | "verified"
  | "stale"
  | "unavailable"
  | "invalid";

export type UsEquityMarketCalendarFreshnessStatus =
  | "current"
  | "expiring_soon"
  | "expired"
  | "unverified";

export type UsEquityMarketCalendarCoverageStatus =
  | "covered"
  | "before_coverage"
  | "after_coverage"
  | "invalid_date";

export type UsEquityMarketCalendarRange = {
  status: "available" | "unavailable";
  duration_minutes: number;
  market_date: string | null;
  session_type: UsEquityMarketSessionType;
  start: string | null;
  end: string | null;
  safe_blocker:
    | null
    | "calendar_invalid"
    | "calendar_unavailable"
    | "calendar_stale"
    | "range_unavailable";
};

export type UsEquityMarketCalendarEvaluation = {
  contract_version: typeof usEquityMarketCalendarContractVersion;
  source_category: typeof usEquityMarketCalendarSourceCategory;
  verification_status: UsEquityMarketCalendarVerificationStatus;
  timezone: typeof usEquityMarketCalendarTimezone;
  market_date: string | null;
  session_type: UsEquityMarketSessionType;
  session_open: string | null;
  session_close: string | null;
  early_close: boolean;
  closed_reason: string | null;
  coverage_status: UsEquityMarketCalendarCoverageStatus;
  freshness_status: UsEquityMarketCalendarFreshnessStatus;
  provenance_available: boolean;
  holiday_awareness_available: boolean;
  early_close_awareness_available: boolean;
  regular_session_determination_available: boolean;
  latest_completed_range: UsEquityMarketCalendarRange;
};
