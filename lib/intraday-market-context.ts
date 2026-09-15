export const intradayMarketContextPolicyVersion =
  "us_equity_intraday_market_context_v1" as const;

export type IntradayMarketContextStatus =
  | "usable"
  | "stale"
  | "incomplete"
  | "invalid";

export type IntradayMarketContextRegime =
  | "risk_on"
  | "risk_off"
  | "mixed"
  | "unavailable";

export type IntradayMarketContextReason =
  | "regular_session_not_verified"
  | "market_date_invalid"
  | "missing_benchmark"
  | "unexpected_benchmark"
  | "duplicate_benchmark"
  | "provider_missing"
  | "provider_mismatch"
  | "observation_timestamp_invalid"
  | "observation_timestamp_in_future"
  | "observation_stale"
  | "observation_time_skew_exceeded"
  | "market_date_mismatch"
  | "price_invalid"
  | "session_return_invalid";

export type IntradayMarketContextObservation = {
  symbol: string | null | undefined;
  provider: string | null | undefined;
  observed_at: Date | string | null | undefined;
  price: number | null | undefined;
  session_return_percent: number | null | undefined;
};

export type IntradayMarketContextInput = {
  market_date: string | null | undefined;
  regular_session_verified: boolean | null | undefined;
  observations:
    | IntradayMarketContextObservation[]
    | null
    | undefined;
};

export type IntradayMarketContextBenchmark = {
  symbol: "SPY" | "QQQ" | "IWM";
  provider: string;
  observed_at: string;
  price: number;
  session_return_percent: number;
};

export type IntradayMarketContextSummary = {
  summary_version: "1.0";
  summary_kind: "intraday_market_context";
  policy_version: typeof intradayMarketContextPolicyVersion;
  market_date: string | null;
  status: IntradayMarketContextStatus;
  regime: IntradayMarketContextRegime;
  admissible_for_context: boolean;
  can_change_ranking_or_publication: false;
  provider: string | null;
  observed_at: string | null;
  age_minutes: number | null;
  observation_time_skew_seconds: number | null;
  benchmarks: IntradayMarketContextBenchmark[];
  reason_codes: IntradayMarketContextReason[];
  gaps: string[];
};

export type IntradayMarketContextResult = {
  summary: IntradayMarketContextSummary;
};

const expectedSymbols = ["SPY", "QQQ", "IWM"] as const;
const maxObservationAgeMinutes = 5;
const maxObservationSkewSeconds = 60;

export function buildIntradayMarketContext(
  input: IntradayMarketContextInput,
  now = new Date(),
): IntradayMarketContextResult {
  const nowDate = validDate(now) ?? new Date(0);
  const marketDate = validMarketDate(input.market_date);
  const reasons: IntradayMarketContextReason[] = [];
  const gaps: string[] = [];
  const normalized = (input.observations ?? []).map((observation) =>
    normalizeObservation(observation),
  );
  const validBenchmarks: IntradayMarketContextBenchmark[] = [];
  const symbolCounts = new Map<string, number>();

  if (!input.regular_session_verified) {
    reasons.push("regular_session_not_verified");
  }
  if (!marketDate) reasons.push("market_date_invalid");

  for (const observation of normalized) {
    if (!observation.symbol) {
      reasons.push("unexpected_benchmark");
      continue;
    }
    if (!expectedSymbols.includes(observation.symbol)) {
      reasons.push("unexpected_benchmark");
      continue;
    }

    symbolCounts.set(observation.symbol, (symbolCounts.get(observation.symbol) ?? 0) + 1);

    if (!observation.provider) reasons.push("provider_missing");
    if (!observation.observedAt) {
      reasons.push("observation_timestamp_invalid");
    } else if (observation.observedAt.getTime() > nowDate.getTime()) {
      reasons.push("observation_timestamp_in_future");
    }
    if (!observation.price) reasons.push("price_invalid");
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

    if (
      observation.symbol &&
      observation.provider &&
      observation.observedAt &&
      observation.price &&
      observation.sessionReturnPercent !== null &&
      expectedSymbols.includes(observation.symbol)
    ) {
      validBenchmarks.push({
        symbol: observation.symbol,
        provider: observation.provider,
        observed_at: observation.observedAt.toISOString(),
        price: observation.price,
        session_return_percent: observation.sessionReturnPercent,
      });
    }
  }

  for (const symbol of expectedSymbols) {
    const count = symbolCounts.get(symbol) ?? 0;
    if (count === 0) reasons.push("missing_benchmark");
    if (count > 1) reasons.push("duplicate_benchmark");
  }

  const providers = new Set(validBenchmarks.map((benchmark) => benchmark.provider));
  if (providers.size > 1) reasons.push("provider_mismatch");

  const observationTimes = validBenchmarks.map((benchmark) =>
    new Date(benchmark.observed_at).getTime(),
  );
  const latestObservedAt =
    observationTimes.length === expectedSymbols.length
      ? Math.max(...observationTimes)
      : null;
  const earliestObservedAt =
    observationTimes.length === expectedSymbols.length
      ? Math.min(...observationTimes)
      : null;
  const skewSeconds =
    latestObservedAt !== null && earliestObservedAt !== null
      ? (latestObservedAt - earliestObservedAt) / 1_000
      : null;
  const ageMinutes =
    earliestObservedAt === null
      ? null
      : Math.max(0, (nowDate.getTime() - earliestObservedAt) / 60_000);

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
  if (validBenchmarks.length !== expectedSymbols.length) {
    gaps.push("complete_spy_qqq_iwm_snapshot_unavailable");
  }
  if (providers.size !== 1) gaps.push("single_provider_snapshot_unavailable");

  const uniqueReasons = Array.from(new Set(reasons));
  const status = statusFromReasons(uniqueReasons);
  const admissible = status === "usable";
  const benchmarks = validBenchmarks
    .filter((benchmark) => (symbolCounts.get(benchmark.symbol) ?? 0) === 1)
    .sort(
      (left, right) =>
        expectedSymbols.indexOf(left.symbol) - expectedSymbols.indexOf(right.symbol),
    );

  return {
    summary: {
      summary_version: "1.0",
      summary_kind: "intraday_market_context",
      policy_version: intradayMarketContextPolicyVersion,
      market_date: marketDate,
      status,
      regime: admissible ? regimeFrom(benchmarks) : "unavailable",
      admissible_for_context: admissible,
      can_change_ranking_or_publication: false,
      provider: providers.size === 1 ? (providers.values().next().value ?? null) : null,
      observed_at:
        latestObservedAt === null ? null : new Date(latestObservedAt).toISOString(),
      age_minutes: ageMinutes === null ? null : round(ageMinutes),
      observation_time_skew_seconds:
        skewSeconds === null ? null : round(skewSeconds),
      benchmarks,
      reason_codes: uniqueReasons,
      gaps,
    },
  };
}

function normalizeObservation(input: IntradayMarketContextObservation) {
  const symbol = normalizedSymbol(input.symbol);

  return {
    symbol: symbol as (typeof expectedSymbols)[number] | null,
    provider: text(input.provider),
    observedAt: validDate(input.observed_at),
    price: positiveFiniteNumber(input.price),
    sessionReturnPercent: finiteNumber(input.session_return_percent),
  };
}

function statusFromReasons(
  reasons: IntradayMarketContextReason[],
): IntradayMarketContextStatus {
  if (reasons.length === 0) return "usable";
  if (
    reasons.some((reason) =>
      [
        "market_date_invalid",
        "unexpected_benchmark",
        "duplicate_benchmark",
        "provider_missing",
        "provider_mismatch",
        "observation_timestamp_invalid",
        "observation_timestamp_in_future",
        "market_date_mismatch",
        "price_invalid",
        "session_return_invalid",
      ].includes(reason),
    )
  ) {
    return "invalid";
  }
  if (reasons.includes("observation_stale")) return "stale";
  return "incomplete";
}

function regimeFrom(
  benchmarks: IntradayMarketContextBenchmark[],
): IntradayMarketContextRegime {
  const positives = benchmarks.filter(
    (benchmark) => benchmark.session_return_percent > 0,
  ).length;
  const negatives = benchmarks.filter(
    (benchmark) => benchmark.session_return_percent < 0,
  ).length;

  if (positives === expectedSymbols.length) return "risk_on";
  if (negatives === expectedSymbols.length) return "risk_off";
  return "mixed";
}

function validDate(value: Date | string | null | undefined) {
  if (value instanceof Date) {
    return Number.isFinite(value.getTime()) ? value : null;
  }

  const timestamp = typeof value === "string" ? value.trim() : "";
  if (!isPointInTimeTimestamp(timestamp)) return null;

  const date = new Date(timestamp);
  return date && Number.isFinite(date.getTime()) ? date : null;
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
  const normalized = text(value)?.toUpperCase() ?? null;
  return expectedSymbols.includes(normalized as (typeof expectedSymbols)[number])
    ? normalized
    : null;
}

function text(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function positiveFiniteNumber(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : null;
}

function finiteNumber(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function round(value: number) {
  return Math.round(value * 10_000) / 10_000;
}
