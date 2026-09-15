export const intradaySectorRelativeStrengthPolicyVersion =
  "us_equity_intraday_sector_relative_strength_v1" as const;

export type IntradaySectorRelativeStrengthStatus =
  | "usable"
  | "stale"
  | "incomplete"
  | "invalid";

export type IntradaySectorRelativeStrengthReason =
  | "regular_session_not_verified"
  | "market_date_invalid"
  | "candidate_ticker_invalid"
  | "sector_identifier_missing"
  | "sector_benchmark_invalid"
  | "market_benchmark_invalid"
  | "duplicate_symbol_identity"
  | "provider_missing"
  | "provider_mismatch"
  | "observation_timestamp_invalid"
  | "observation_timestamp_in_future"
  | "observation_stale"
  | "observation_time_skew_exceeded"
  | "market_date_mismatch"
  | "session_return_invalid";

export type IntradaySectorRelativeStrengthObservation = {
  symbol: string | null | undefined;
  provider: string | null | undefined;
  observed_at: Date | string | null | undefined;
  session_return_percent: number | null | undefined;
};

export type IntradaySectorRelativeStrengthInput = {
  market_date: string | null | undefined;
  regular_session_verified: boolean | null | undefined;
  sector_id: string | null | undefined;
  candidate:
    | IntradaySectorRelativeStrengthObservation
    | null
    | undefined;
  sector_benchmark:
    | IntradaySectorRelativeStrengthObservation
    | null
    | undefined;
  market_benchmark:
    | IntradaySectorRelativeStrengthObservation
    | null
    | undefined;
};

export type IntradaySectorRelativeStrengthObservationSummary = {
  symbol: string;
  provider: string;
  observed_at: string;
  session_return_percent: number;
};

export type IntradaySectorRelativeStrengthSummary = {
  summary_version: "1.0";
  summary_kind: "intraday_sector_relative_strength";
  policy_version: typeof intradaySectorRelativeStrengthPolicyVersion;
  market_date: string | null;
  status: IntradaySectorRelativeStrengthStatus;
  admissible_for_context: boolean;
  can_change_ranking_or_publication: false;
  sector_id: string | null;
  provider: string | null;
  observed_at: string | null;
  age_minutes: number | null;
  observation_time_skew_seconds: number | null;
  candidate: IntradaySectorRelativeStrengthObservationSummary | null;
  sector_benchmark: IntradaySectorRelativeStrengthObservationSummary | null;
  market_benchmark: IntradaySectorRelativeStrengthObservationSummary | null;
  stock_vs_sector_return_percent: number | null;
  sector_vs_market_return_percent: number | null;
  reason_codes: IntradaySectorRelativeStrengthReason[];
  gaps: string[];
};

export type IntradaySectorRelativeStrengthResult = {
  summary: IntradaySectorRelativeStrengthSummary;
};

const maxObservationAgeMinutes = 5;
const maxObservationSkewSeconds = 60;
const marketBenchmarkSymbol = "SPY";

export function buildIntradaySectorRelativeStrength(
  input: IntradaySectorRelativeStrengthInput,
  now = new Date(),
): IntradaySectorRelativeStrengthResult {
  const nowDate = validDate(now) ?? new Date(0);
  const marketDate = validMarketDate(input.market_date);
  const sectorId = text(input.sector_id);
  const candidate = normalizeObservation(input.candidate);
  const sectorBenchmark = normalizeObservation(input.sector_benchmark);
  const marketBenchmark = normalizeObservation(input.market_benchmark);
  const observations = [candidate, sectorBenchmark, marketBenchmark];
  const reasons: IntradaySectorRelativeStrengthReason[] = [];
  const gaps: string[] = [];

  if (!input.regular_session_verified) {
    reasons.push("regular_session_not_verified");
  }
  if (!marketDate) reasons.push("market_date_invalid");
  if (!sectorId) reasons.push("sector_identifier_missing");
  if (!candidate.symbol) reasons.push("candidate_ticker_invalid");
  if (!sectorBenchmark.symbol) reasons.push("sector_benchmark_invalid");
  if (marketBenchmark.symbol !== marketBenchmarkSymbol) {
    reasons.push("market_benchmark_invalid");
  }

  const symbolCounts = new Map<string, number>();
  for (const observation of observations) {
    if (observation.symbol) {
      symbolCounts.set(
        observation.symbol,
        (symbolCounts.get(observation.symbol) ?? 0) + 1,
      );
    }
    if (!observation.provider) reasons.push("provider_missing");
    if (!observation.observedAt) {
      reasons.push("observation_timestamp_invalid");
    } else if (observation.observedAt.getTime() > nowDate.getTime()) {
      reasons.push("observation_timestamp_in_future");
    }
    if (observation.sessionReturnPercent === null) {
      reasons.push("session_return_invalid");
    }
    if (
      marketDate &&
      observation.observedAt &&
      newYorkDate(observation.observedAt) !== marketDate
    ) {
      reasons.push("market_date_mismatch");
    }
  }

  if (Array.from(symbolCounts.values()).some((count) => count > 1)) {
    reasons.push("duplicate_symbol_identity");
  }

  const validObservations = observations.filter(isCompleteObservation);
  const providers = new Set(validObservations.map((observation) => observation.provider));
  if (providers.size > 1) reasons.push("provider_mismatch");

  const observationTimes = validObservations.map((observation) =>
    observation.observedAt.getTime(),
  );
  const latestObservedAt =
    observationTimes.length === observations.length
      ? Math.max(...observationTimes)
      : null;
  const earliestObservedAt =
    observationTimes.length === observations.length
      ? Math.min(...observationTimes)
      : null;
  const ageMinutes =
    earliestObservedAt === null
      ? null
      : Math.max(0, (nowDate.getTime() - earliestObservedAt) / 60_000);
  const skewSeconds =
    latestObservedAt === null || earliestObservedAt === null
      ? null
      : (latestObservedAt - earliestObservedAt) / 1_000;

  if (
    ageMinutes !== null &&
    !reasons.includes("observation_timestamp_in_future") &&
    ageMinutes > maxObservationAgeMinutes
  ) {
    reasons.push("observation_stale");
  }
  if (skewSeconds !== null && skewSeconds > maxObservationSkewSeconds) {
    reasons.push("observation_time_skew_exceeded");
  }
  if (validObservations.length !== observations.length) {
    gaps.push("complete_candidate_sector_market_snapshot_unavailable");
  }
  if (providers.size !== 1) gaps.push("single_provider_snapshot_unavailable");

  const uniqueReasons = Array.from(new Set(reasons));
  const status = statusFromReasons(uniqueReasons);
  const admissible = status === "usable";
  const relativeStrength =
    admissible &&
    isCompleteObservation(candidate) &&
    isCompleteObservation(sectorBenchmark) &&
    isCompleteObservation(marketBenchmark)
      ? {
          stockVsSectorReturnPercent: round(
            candidate.sessionReturnPercent - sectorBenchmark.sessionReturnPercent,
          ),
          sectorVsMarketReturnPercent: round(
            sectorBenchmark.sessionReturnPercent - marketBenchmark.sessionReturnPercent,
          ),
        }
      : null;

  return {
    summary: {
      summary_version: "1.0",
      summary_kind: "intraday_sector_relative_strength",
      policy_version: intradaySectorRelativeStrengthPolicyVersion,
      market_date: marketDate,
      status,
      admissible_for_context: admissible,
      can_change_ranking_or_publication: false,
      sector_id: sectorId,
      provider: providers.size === 1 ? (providers.values().next().value ?? null) : null,
      observed_at:
        latestObservedAt === null ? null : new Date(latestObservedAt).toISOString(),
      age_minutes: ageMinutes === null ? null : round(ageMinutes),
      observation_time_skew_seconds:
        skewSeconds === null ? null : round(skewSeconds),
      candidate: summaryFrom(candidate),
      sector_benchmark: summaryFrom(sectorBenchmark),
      market_benchmark: summaryFrom(marketBenchmark),
      stock_vs_sector_return_percent: relativeStrength?.stockVsSectorReturnPercent ?? null,
      sector_vs_market_return_percent: relativeStrength?.sectorVsMarketReturnPercent ?? null,
      reason_codes: uniqueReasons,
      gaps,
    },
  };
}

type NormalizedObservation = {
  symbol: string | null;
  provider: string | null;
  observedAt: Date | null;
  sessionReturnPercent: number | null;
};

function normalizeObservation(
  input: IntradaySectorRelativeStrengthObservation | null | undefined,
): NormalizedObservation {
  return {
    symbol: normalizedSymbol(input?.symbol),
    provider: text(input?.provider),
    observedAt: validDate(input?.observed_at),
    sessionReturnPercent: finiteNumber(input?.session_return_percent),
  };
}

function isCompleteObservation(
  observation: NormalizedObservation,
): observation is NormalizedObservation & {
  symbol: string;
  provider: string;
  observedAt: Date;
  sessionReturnPercent: number;
} {
  return (
    observation.symbol !== null &&
    observation.provider !== null &&
    observation.observedAt !== null &&
    observation.sessionReturnPercent !== null
  );
}

function summaryFrom(
  observation: NormalizedObservation,
): IntradaySectorRelativeStrengthObservationSummary | null {
  if (!isCompleteObservation(observation)) return null;

  return {
    symbol: observation.symbol,
    provider: observation.provider,
    observed_at: observation.observedAt.toISOString(),
    session_return_percent: observation.sessionReturnPercent,
  };
}

function statusFromReasons(
  reasons: IntradaySectorRelativeStrengthReason[],
): IntradaySectorRelativeStrengthStatus {
  if (reasons.length === 0) return "usable";
  if (
    reasons.some((reason) =>
      [
        "market_date_invalid",
        "candidate_ticker_invalid",
        "sector_identifier_missing",
        "sector_benchmark_invalid",
        "market_benchmark_invalid",
        "duplicate_symbol_identity",
        "provider_missing",
        "provider_mismatch",
        "observation_timestamp_invalid",
        "observation_timestamp_in_future",
        "market_date_mismatch",
        "session_return_invalid",
      ].includes(reason),
    )
  ) {
    return "invalid";
  }
  if (reasons.includes("observation_stale")) return "stale";
  return "incomplete";
}

function validDate(value: Date | string | null | undefined) {
  if (value instanceof Date) {
    return Number.isFinite(value.getTime()) ? value : null;
  }

  const timestamp = typeof value === "string" ? value.trim() : "";
  if (!isPointInTimeTimestamp(timestamp)) return null;

  const date = new Date(timestamp);
  return Number.isFinite(date.getTime()) ? date : null;
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

function validMarketDate(value: string | null | undefined) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value
    ? value
    : null;
}

function isPointInTimeTimestamp(value: string) {
  return /^\d{4}-\d{2}-\d{2}T.+(?:Z|[+-]\d{2}:\d{2})$/i.test(value);
}

function normalizedSymbol(value: string | null | undefined) {
  const symbol = text(value)?.toUpperCase() ?? null;
  return symbol && /^[A-Z][A-Z0-9.-]*$/.test(symbol) ? symbol : null;
}

function text(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function finiteNumber(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function round(value: number) {
  return Math.round(value * 10_000) / 10_000;
}
