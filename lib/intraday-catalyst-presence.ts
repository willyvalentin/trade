export const intradayCatalystPresencePolicyVersion =
  "us_equity_intraday_catalyst_presence_v1" as const;

export type IntradayCatalystPresenceStatus =
  | "usable"
  | "stale"
  | "incomplete"
  | "invalid";

export type IntradayCatalystPresence = "present" | "absent" | "unavailable";

export type IntradayCatalystType =
  | "earnings"
  | "guidance"
  | "regulatory"
  | "sec_filing"
  | "merger_acquisition"
  | "analyst_action"
  | "product_announcement"
  | "financing"
  | "legal"
  | "other";

export type IntradayCatalystPresenceReason =
  | "regular_session_not_verified"
  | "market_date_invalid"
  | "candidate_ticker_invalid"
  | "coverage_unavailable"
  | "coverage_symbol_mismatch"
  | "coverage_not_complete"
  | "coverage_count_invalid"
  | "coverage_count_mismatch"
  | "coverage_provider_missing"
  | "coverage_timestamp_invalid"
  | "coverage_timestamp_in_future"
  | "coverage_stale"
  | "coverage_market_date_mismatch"
  | "coverage_window_invalid"
  | "coverage_window_too_short"
  | "catalyst_symbol_mismatch"
  | "catalyst_identifier_missing"
  | "catalyst_provider_missing"
  | "catalyst_provider_mismatch"
  | "catalyst_type_invalid"
  | "catalyst_timestamp_invalid"
  | "catalyst_timestamp_in_future"
  | "catalyst_after_observation"
  | "catalyst_outside_coverage_window"
  | "catalyst_stale"
  | "multiple_catalysts_unresolved";

export type IntradayCatalystCoverage = {
  symbol: string | null | undefined;
  provider: string | null | undefined;
  observed_at: Date | string | null | undefined;
  lookback_started_at: Date | string | null | undefined;
  search_complete: boolean | null | undefined;
  reported_catalyst_count: number | null | undefined;
};

export type IntradayCatalyst = {
  symbol: string | null | undefined;
  provider: string | null | undefined;
  source_event_id: string | null | undefined;
  catalyst_type: string | null | undefined;
  published_at: Date | string | null | undefined;
};

export type IntradayCatalystPresenceInput = {
  market_date: string | null | undefined;
  regular_session_verified: boolean | null | undefined;
  candidate_symbol: string | null | undefined;
  coverage: IntradayCatalystCoverage | null | undefined;
  catalysts: IntradayCatalyst[] | null | undefined;
};

export type IntradayCatalystCoverageSummary = {
  symbol: string;
  provider: string;
  observed_at: string;
  lookback_started_at: string;
  reported_catalyst_count: number;
};

export type IntradayCatalystSummary = {
  symbol: string;
  provider: string;
  source_event_id: string;
  catalyst_type: IntradayCatalystType;
  published_at: string;
};

export type IntradayCatalystPresenceSummary = {
  summary_version: "1.0";
  summary_kind: "intraday_catalyst_presence";
  policy_version: typeof intradayCatalystPresencePolicyVersion;
  market_date: string | null;
  status: IntradayCatalystPresenceStatus;
  catalyst_presence: IntradayCatalystPresence;
  admissible_for_context: boolean;
  can_change_ranking_or_publication: false;
  candidate_symbol: string | null;
  coverage: IntradayCatalystCoverageSummary | null;
  catalyst: IntradayCatalystSummary | null;
  coverage_age_minutes: number | null;
  catalyst_age_minutes: number | null;
  reason_codes: IntradayCatalystPresenceReason[];
  gaps: string[];
};

export type IntradayCatalystPresenceResult = {
  summary: IntradayCatalystPresenceSummary;
};

const maxCoverageAgeMinutes = 5;
const maxCatalystAgeMinutes = 24 * 60;
const minCoverageLookbackMinutes = 24 * 60;
const catalystTypes = new Set<IntradayCatalystType>([
  "earnings",
  "guidance",
  "regulatory",
  "sec_filing",
  "merger_acquisition",
  "analyst_action",
  "product_announcement",
  "financing",
  "legal",
  "other",
]);

export function buildIntradayCatalystPresence(
  input: IntradayCatalystPresenceInput,
  now = new Date(),
): IntradayCatalystPresenceResult {
  const nowDate = validDate(now) ?? new Date(0);
  const marketDate = validMarketDate(input.market_date);
  const candidateSymbol = normalizedSymbol(input.candidate_symbol);
  const coverage = normalizeCoverage(input.coverage);
  const catalysts = (input.catalysts ?? []).map(normalizeCatalyst);
  const reasons: IntradayCatalystPresenceReason[] = [];
  const gaps: string[] = [];

  if (!input.regular_session_verified) reasons.push("regular_session_not_verified");
  if (!marketDate) reasons.push("market_date_invalid");
  if (!candidateSymbol) reasons.push("candidate_ticker_invalid");

  if (!coverage) {
    reasons.push("coverage_unavailable");
    gaps.push("complete_24h_candidate_catalyst_search_unavailable");
  } else {
    validateCoverage({
      coverage,
      candidateSymbol,
      marketDate,
      now: nowDate,
      reasons,
    });
  }

  if (coverage && catalysts.length !== coverage.reportedCatalystCount) {
    reasons.push("coverage_count_mismatch");
  }
  if (catalysts.length > 1) reasons.push("multiple_catalysts_unresolved");

  for (const catalyst of catalysts) {
    validateCatalyst({
      catalyst,
      candidateSymbol,
      coverage,
      now: nowDate,
      reasons,
    });
  }

  const uniqueReasons = Array.from(new Set(reasons));
  const status = statusFromReasons(uniqueReasons);
  const admitted = status === "usable";
  const catalyst = admitted && catalysts.length === 1 ? catalysts[0] : null;
  const presence: IntradayCatalystPresence = !admitted
    ? "unavailable"
    : catalyst
      ? "present"
      : "absent";
  const coverageAgeMinutes = coverage?.observedAt
    ? round(Math.max(0, (nowDate.getTime() - coverage.observedAt.getTime()) / 60_000))
    : null;
  const catalystAgeMinutes = catalyst?.publishedAt
    ? round(Math.max(0, (nowDate.getTime() - catalyst.publishedAt.getTime()) / 60_000))
    : null;

  return {
    summary: {
      summary_version: "1.0",
      summary_kind: "intraday_catalyst_presence",
      policy_version: intradayCatalystPresencePolicyVersion,
      market_date: marketDate,
      status,
      catalyst_presence: presence,
      admissible_for_context: admitted,
      can_change_ranking_or_publication: false,
      candidate_symbol: candidateSymbol,
      coverage: coverageSummary(coverage),
      catalyst: catalystSummary(catalyst),
      coverage_age_minutes: coverageAgeMinutes,
      catalyst_age_minutes: catalystAgeMinutes,
      reason_codes: uniqueReasons,
      gaps,
    },
  };
}

type NormalizedCoverage = {
  symbol: string | null;
  provider: string | null;
  observedAt: Date | null;
  lookbackStartedAt: Date | null;
  searchComplete: boolean;
  reportedCatalystCount: number | null;
};

type NormalizedCatalyst = {
  symbol: string | null;
  provider: string | null;
  sourceEventId: string | null;
  catalystType: IntradayCatalystType | null;
  publishedAt: Date | null;
};

function normalizeCoverage(
  input: IntradayCatalystCoverage | null | undefined,
): NormalizedCoverage | null {
  if (!input) return null;
  return {
    symbol: normalizedSymbol(input.symbol),
    provider: text(input.provider),
    observedAt: validDate(input.observed_at),
    lookbackStartedAt: validDate(input.lookback_started_at),
    searchComplete: input.search_complete === true,
    reportedCatalystCount: nonNegativeInteger(input.reported_catalyst_count),
  };
}

function normalizeCatalyst(input: IntradayCatalyst): NormalizedCatalyst {
  const rawType = text(input.catalyst_type)?.toLowerCase() ?? null;
  return {
    symbol: normalizedSymbol(input.symbol),
    provider: text(input.provider),
    sourceEventId: boundedText(input.source_event_id),
    catalystType: catalystTypes.has(rawType as IntradayCatalystType)
      ? (rawType as IntradayCatalystType)
      : null,
    publishedAt: validDate(input.published_at),
  };
}

function validateCoverage({
  coverage,
  candidateSymbol,
  marketDate,
  now,
  reasons,
}: {
  coverage: NormalizedCoverage;
  candidateSymbol: string | null;
  marketDate: string | null;
  now: Date;
  reasons: IntradayCatalystPresenceReason[];
}) {
  if (!coverage.symbol || coverage.symbol !== candidateSymbol) {
    reasons.push("coverage_symbol_mismatch");
  }
  if (!coverage.searchComplete) reasons.push("coverage_not_complete");
  if (coverage.reportedCatalystCount === null) reasons.push("coverage_count_invalid");
  if (!coverage.provider) reasons.push("coverage_provider_missing");
  if (!coverage.observedAt) {
    reasons.push("coverage_timestamp_invalid");
  } else if (coverage.observedAt.getTime() > now.getTime()) {
    reasons.push("coverage_timestamp_in_future");
  } else {
    const ageMinutes = (now.getTime() - coverage.observedAt.getTime()) / 60_000;
    if (ageMinutes > maxCoverageAgeMinutes) reasons.push("coverage_stale");
    if (marketDate && newYorkDate(coverage.observedAt) !== marketDate) {
      reasons.push("coverage_market_date_mismatch");
    }
  }
  if (!coverage.lookbackStartedAt || !coverage.observedAt) {
    reasons.push("coverage_window_invalid");
  } else {
    const lookbackMinutes =
      (coverage.observedAt.getTime() - coverage.lookbackStartedAt.getTime()) / 60_000;
    if (lookbackMinutes < 0) {
      reasons.push("coverage_window_invalid");
    } else if (lookbackMinutes < minCoverageLookbackMinutes) {
      reasons.push("coverage_window_too_short");
    }
  }
}

function validateCatalyst({
  catalyst,
  candidateSymbol,
  coverage,
  now,
  reasons,
}: {
  catalyst: NormalizedCatalyst;
  candidateSymbol: string | null;
  coverage: NormalizedCoverage | null;
  now: Date;
  reasons: IntradayCatalystPresenceReason[];
}) {
  if (!catalyst.symbol || catalyst.symbol !== candidateSymbol) {
    reasons.push("catalyst_symbol_mismatch");
  }
  if (!catalyst.sourceEventId) reasons.push("catalyst_identifier_missing");
  if (!catalyst.provider) reasons.push("catalyst_provider_missing");
  if (coverage?.provider && catalyst.provider && coverage.provider !== catalyst.provider) {
    reasons.push("catalyst_provider_mismatch");
  }
  if (!catalyst.catalystType) reasons.push("catalyst_type_invalid");
  if (!catalyst.publishedAt) {
    reasons.push("catalyst_timestamp_invalid");
    return;
  }
  if (catalyst.publishedAt.getTime() > now.getTime()) {
    reasons.push("catalyst_timestamp_in_future");
  }
  if (coverage?.observedAt && catalyst.publishedAt.getTime() > coverage.observedAt.getTime()) {
    reasons.push("catalyst_after_observation");
  }
  if (coverage?.lookbackStartedAt && catalyst.publishedAt.getTime() < coverage.lookbackStartedAt.getTime()) {
    reasons.push("catalyst_outside_coverage_window");
  }
  if ((now.getTime() - catalyst.publishedAt.getTime()) / 60_000 > maxCatalystAgeMinutes) {
    reasons.push("catalyst_stale");
  }
}

function statusFromReasons(
  reasons: IntradayCatalystPresenceReason[],
): IntradayCatalystPresenceStatus {
  if (reasons.length === 0) return "usable";
  if (
    reasons.some((reason) =>
      [
        "market_date_invalid",
        "candidate_ticker_invalid",
        "coverage_symbol_mismatch",
        "coverage_count_invalid",
        "coverage_count_mismatch",
        "coverage_provider_missing",
        "coverage_timestamp_invalid",
        "coverage_timestamp_in_future",
        "coverage_market_date_mismatch",
        "coverage_window_invalid",
        "catalyst_symbol_mismatch",
        "catalyst_identifier_missing",
        "catalyst_provider_missing",
        "catalyst_provider_mismatch",
        "catalyst_type_invalid",
        "catalyst_timestamp_invalid",
        "catalyst_timestamp_in_future",
        "catalyst_after_observation",
        "catalyst_outside_coverage_window",
      ].includes(reason),
    )
  ) {
    return "invalid";
  }
  if (reasons.includes("coverage_stale") || reasons.includes("catalyst_stale")) {
    return "stale";
  }
  return "incomplete";
}

function coverageSummary(
  coverage: NormalizedCoverage | null,
): IntradayCatalystCoverageSummary | null {
  if (
    !coverage?.symbol ||
    !coverage.provider ||
    !coverage.observedAt ||
    !coverage.lookbackStartedAt ||
    coverage.reportedCatalystCount === null
  ) {
    return null;
  }
  return {
    symbol: coverage.symbol,
    provider: coverage.provider,
    observed_at: coverage.observedAt.toISOString(),
    lookback_started_at: coverage.lookbackStartedAt.toISOString(),
    reported_catalyst_count: coverage.reportedCatalystCount,
  };
}

function catalystSummary(
  catalyst: NormalizedCatalyst | null,
): IntradayCatalystSummary | null {
  if (
    !catalyst?.symbol ||
    !catalyst.provider ||
    !catalyst.sourceEventId ||
    !catalyst.catalystType ||
    !catalyst.publishedAt
  ) {
    return null;
  }
  return {
    symbol: catalyst.symbol,
    provider: catalyst.provider,
    source_event_id: catalyst.sourceEventId,
    catalyst_type: catalyst.catalystType,
    published_at: catalyst.publishedAt.toISOString(),
  };
}

function validDate(value: Date | string | null | undefined) {
  if (value instanceof Date) return Number.isFinite(value.getTime()) ? value : null;
  const timestamp = typeof value === "string" ? value.trim() : "";
  if (!/^\d{4}-\d{2}-\d{2}T.+(?:Z|[+-]\d{2}:\d{2})$/i.test(timestamp)) return null;
  const date = new Date(timestamp);
  return Number.isFinite(date.getTime()) ? date : null;
}

function validMarketDate(value: string | null | undefined) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value
    ? value
    : null;
}

function newYorkDate(value: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(value);
  const byType = new Map(parts.map((part) => [part.type, part.value]));
  return `${byType.get("year")}-${byType.get("month")}-${byType.get("day")}`;
}

function normalizedSymbol(value: string | null | undefined) {
  return text(value)?.toUpperCase() ?? null;
}

function text(value: string | null | undefined) {
  const normalized = typeof value === "string" ? value.trim() : "";
  return normalized ? normalized : null;
}

function boundedText(value: string | null | undefined) {
  const normalized = text(value);
  return normalized && normalized.length <= 256 ? normalized : null;
}

function nonNegativeInteger(value: number | null | undefined) {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 ? value : null;
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}
