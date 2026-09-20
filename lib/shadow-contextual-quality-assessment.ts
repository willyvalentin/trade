import {
  intradayCatalystPresencePolicyVersion,
  type IntradayCatalystPresenceSummary,
} from "@/lib/intraday-catalyst-presence";
import {
  intradayMarketContextPolicyVersion,
  type IntradayMarketContextSummary,
} from "@/lib/intraday-market-context";
import {
  intradaySectorRelativeStrengthPolicyVersion,
  type IntradaySectorRelativeStrengthSummary,
} from "@/lib/intraday-sector-relative-strength";

/**
 * This policy turns three already-admitted IF-3 context summaries into one
 * inspectable research envelope. It deliberately does not produce a score or
 * confidence claim: no component has baseline evidence to justify a weight.
 */
export const shadowContextualQualityPolicyVersion =
  "us_equity_shadow_contextual_quality_v1" as const;

export type ShadowContextualQualityGap =
  | "candidate_symbol_invalid"
  | "market_date_invalid"
  | "market_context_unavailable"
  | "sector_relative_strength_unavailable"
  | "catalyst_presence_unavailable"
  | "context_market_date_mismatch"
  | "context_observed_at_invalid"
  | "context_observed_at_future"
  | "context_observation_stale"
  | "context_observation_skew_exceeded"
  | "sector_candidate_symbol_mismatch"
  | "catalyst_candidate_symbol_mismatch";

export type ShadowContextualQualityComponent = {
  component:
    | "market_regime"
    | "sector_relative_strength"
    | "catalyst_presence";
  status: "usable" | "unavailable";
  provider: string | null;
  observed_at: string | null;
  signal: string | null;
  details: Record<string, number | string | null>;
  gaps: ShadowContextualQualityGap[];
};

export type ShadowContextualQualityAssessment = {
  summary_version: "1.0";
  summary_kind: "shadow_contextual_quality_assessment";
  policy_version: typeof shadowContextualQualityPolicyVersion;
  candidate_symbol: string | null;
  market_date: string | null;
  evaluated_at: string;
  status: "research_ready" | "unavailable";
  admissible_for_shadow_evaluation: boolean;
  can_change_ranking_or_publication: false;
  components: ShadowContextualQualityComponent[];
  gaps: ShadowContextualQualityGap[];
};

export type ShadowContextualQualityInput = {
  candidate_symbol: unknown;
  market_date: unknown;
  market_context: unknown;
  sector_relative_strength: unknown;
  catalyst_presence: unknown;
};

const maxFreshnessMinutes = 5;
const maxObservationSkewSeconds = 60;

/**
 * Creates a shadow-only context assessment from caller-provided summaries.
 * Every component is independently rechecked at evaluation time, so a summary
 * that was fresh when created cannot be reused as current context later.
 */
export function assessShadowContextualQuality(
  input: ShadowContextualQualityInput,
  now = new Date(),
): ShadowContextualQualityAssessment {
  const evaluatedAt = validInstant(now)?.toISOString() ?? new Date(0).toISOString();
  const candidateSymbol = normalizedSymbol(input.candidate_symbol);
  const marketDate = validMarketDate(input.market_date);
  const market = evaluateMarketContext(input.market_context, marketDate, now);
  const sector = evaluateSectorRelativeStrength(
    input.sector_relative_strength,
    candidateSymbol,
    marketDate,
    now,
  );
  const catalyst = evaluateCatalystPresence(
    input.catalyst_presence,
    candidateSymbol,
    marketDate,
    now,
  );
  const gaps: ShadowContextualQualityGap[] = [];
  if (!candidateSymbol) gaps.push("candidate_symbol_invalid");
  if (!marketDate) gaps.push("market_date_invalid");
  gaps.push(...market.gaps, ...sector.gaps, ...catalyst.gaps);
  const uniqueAssessmentGaps = uniqueGaps(gaps);

  return {
    summary_version: "1.0",
    summary_kind: "shadow_contextual_quality_assessment",
    policy_version: shadowContextualQualityPolicyVersion,
    candidate_symbol: candidateSymbol,
    market_date: marketDate,
    evaluated_at: evaluatedAt,
    status: uniqueAssessmentGaps.length === 0 ? "research_ready" : "unavailable",
    admissible_for_shadow_evaluation: uniqueAssessmentGaps.length === 0,
    can_change_ranking_or_publication: false,
    components: [market.component, sector.component, catalyst.component],
    gaps: uniqueAssessmentGaps,
  };
}

function evaluateMarketContext(
  value: unknown,
  marketDate: string | null,
  now: Date,
): {
  component: ShadowContextualQualityComponent;
  gaps: ShadowContextualQualityGap[];
} {
  const summary = value as Partial<IntradayMarketContextSummary> | null;
  const validSummary =
    isObject(summary) &&
    summary.summary_version === "1.0" &&
    summary.summary_kind === "intraday_market_context" &&
    summary.policy_version === intradayMarketContextPolicyVersion &&
    summary.status === "usable" &&
    summary.admissible_for_context === true &&
    summary.can_change_ranking_or_publication === false &&
    (summary.regime === "risk_on" ||
      summary.regime === "risk_off" ||
      summary.regime === "mixed") &&
    validMarketBenchmarks(summary.benchmarks);
  const gaps: ShadowContextualQualityGap[] = validSummary
    ? []
    : ["market_context_unavailable"];
  const benchmarks = validSummary && Array.isArray(summary?.benchmarks)
    ? summary.benchmarks
    : [];
  const timestamps = benchmarks.map((benchmark) => validInstant(benchmark.observed_at));

  if (validSummary && summary.market_date !== marketDate) {
    gaps.push("context_market_date_mismatch");
  }
  if (validSummary) addTimestampGaps(gaps, timestamps, now);

  const observedAt = latestInstant(timestamps);
  const provider =
    validSummary && typeof summary.provider === "string" && summary.provider.trim()
      ? summary.provider
      : null;
  const regime =
    validSummary &&
    (summary?.regime === "risk_on" ||
      summary?.regime === "risk_off" ||
      summary?.regime === "mixed")
      ? summary.regime
      : null;

  return {
    component: {
      component: "market_regime",
      status: gaps.length === 0 ? "usable" : "unavailable",
      provider,
      observed_at: observedAt?.toISOString() ?? null,
      signal: gaps.length === 0 ? regime : null,
      details: {
        spy_session_return_percent: benchmarkReturn(summary, "SPY"),
        qqq_session_return_percent: benchmarkReturn(summary, "QQQ"),
        iwm_session_return_percent: benchmarkReturn(summary, "IWM"),
      },
      gaps: uniqueGaps(gaps),
    },
    gaps: uniqueGaps(gaps),
  };
}

function evaluateSectorRelativeStrength(
  value: unknown,
  candidateSymbol: string | null,
  marketDate: string | null,
  now: Date,
): {
  component: ShadowContextualQualityComponent;
  gaps: ShadowContextualQualityGap[];
} {
  const summary = value as Partial<IntradaySectorRelativeStrengthSummary> | null;
  const candidate = isObject(summary) ? summary.candidate : null;
  const sector = isObject(summary) ? summary.sector_benchmark : null;
  const market = isObject(summary) ? summary.market_benchmark : null;
  const stockVsSector = finiteNumber(summary?.stock_vs_sector_return_percent);
  const sectorVsMarket = finiteNumber(summary?.sector_vs_market_return_percent);
  const observationsValid =
    validObservation(candidate) &&
    validObservation(sector) &&
    validObservation(market);
  const observationsShareProvider =
    observationsValid &&
    candidate.provider === sector.provider &&
    candidate.provider === market.provider;
  const observationsHaveDistinctSymbols =
    observationsValid &&
    new Set([candidate.symbol, sector.symbol, market.symbol]).size === 3;
  const validSummary =
    isObject(summary) &&
    summary.summary_version === "1.0" &&
    summary.summary_kind === "intraday_sector_relative_strength" &&
    summary.policy_version === intradaySectorRelativeStrengthPolicyVersion &&
    summary.status === "usable" &&
    summary.admissible_for_context === true &&
    summary.can_change_ranking_or_publication === false &&
    observationsValid &&
    observationsShareProvider &&
    observationsHaveDistinctSymbols &&
    market?.symbol === "SPY" &&
    stockVsSector !== null &&
    sectorVsMarket !== null;
  const gaps: ShadowContextualQualityGap[] = validSummary
    ? []
    : ["sector_relative_strength_unavailable"];

  if (validSummary && summary.market_date !== marketDate) {
    gaps.push("context_market_date_mismatch");
  }
  if (validSummary && candidate?.symbol !== candidateSymbol) {
    gaps.push("sector_candidate_symbol_mismatch");
  }
  if (validSummary) {
    addTimestampGaps(
      gaps,
      [
        validInstant(candidate?.observed_at),
        validInstant(sector?.observed_at),
        validInstant(market?.observed_at),
      ],
      now,
    );
  }

  const observedAt = latestInstant(
    validSummary
      ? [
          validInstant(candidate?.observed_at),
          validInstant(sector?.observed_at),
          validInstant(market?.observed_at),
        ]
      : [],
  );
  const provider =
    validSummary && typeof summary.provider === "string" && summary.provider.trim()
      ? summary.provider
      : null;

  return {
    component: {
      component: "sector_relative_strength",
      status: gaps.length === 0 ? "usable" : "unavailable",
      provider,
      observed_at: observedAt?.toISOString() ?? null,
      signal:
        gaps.length === 0
          ? stockVsSector! > 0
            ? "outperforming_sector"
            : stockVsSector! < 0
              ? "underperforming_sector"
              : "matching_sector"
          : null,
      details: {
        stock_vs_sector_return_percent: stockVsSector,
        sector_vs_market_return_percent: sectorVsMarket,
      },
      gaps: uniqueGaps(gaps),
    },
    gaps: uniqueGaps(gaps),
  };
}

function evaluateCatalystPresence(
  value: unknown,
  candidateSymbol: string | null,
  marketDate: string | null,
  now: Date,
): {
  component: ShadowContextualQualityComponent;
  gaps: ShadowContextualQualityGap[];
} {
  const summary = value as Partial<IntradayCatalystPresenceSummary> | null;
  const coverage = isObject(summary) ? summary.coverage : null;
  const candidateTicker = normalizedSymbol(summary?.candidate_symbol);
  const catalyst = isObject(summary) && validCatalyst(summary.catalyst)
    ? summary.catalyst
    : null;
  const catalystConsistent =
    summary?.catalyst_presence === "absent"
      ? summary.catalyst === null
      : catalyst !== null &&
        validCoverage(coverage) &&
        catalyst.symbol === coverage.symbol &&
        catalyst.provider === coverage.provider &&
        validInstant(catalyst.published_at)!.getTime() <=
          validInstant(coverage.observed_at)!.getTime() &&
        validInstant(catalyst.published_at)!.getTime() >=
          validInstant(coverage.lookback_started_at)!.getTime();
  const structurallyValidSummary =
    isObject(summary) &&
    summary.summary_version === "1.0" &&
    summary.summary_kind === "intraday_catalyst_presence" &&
    summary.policy_version === intradayCatalystPresencePolicyVersion &&
    summary.status === "usable" &&
    summary.admissible_for_context === true &&
    summary.can_change_ranking_or_publication === false &&
    (summary.catalyst_presence === "present" || summary.catalyst_presence === "absent") &&
    validCoverage(coverage) &&
    catalystConsistent;
  const candidateMatchesCoverage =
    structurallyValidSummary &&
    candidateTicker !== null &&
    validCoverage(coverage) &&
    coverage.symbol === candidateTicker;
  const validSummary = structurallyValidSummary && candidateMatchesCoverage;
  const gaps: ShadowContextualQualityGap[] = structurallyValidSummary
    ? []
    : ["catalyst_presence_unavailable"];

  if (
    structurallyValidSummary &&
    (!candidateMatchesCoverage || candidateTicker !== candidateSymbol)
  ) {
    gaps.push("catalyst_candidate_symbol_mismatch");
  }

  if (validSummary && summary.market_date !== marketDate) {
    gaps.push("context_market_date_mismatch");
  }
  if (validSummary) {
    addTimestampGaps(gaps, [validInstant(coverage?.observed_at)], now);
  }

  const provider =
    validSummary && typeof coverage?.provider === "string" && coverage.provider.trim()
      ? coverage.provider
      : null;
  const observedAt = validSummary ? validInstant(coverage?.observed_at) : null;
  const catalystPresence =
    validSummary &&
    (summary?.catalyst_presence === "present" ||
      summary?.catalyst_presence === "absent")
      ? summary.catalyst_presence
      : null;

  return {
    component: {
      component: "catalyst_presence",
      status: gaps.length === 0 ? "usable" : "unavailable",
      provider,
      observed_at: observedAt?.toISOString() ?? null,
      signal: gaps.length === 0 ? catalystPresence : null,
      details: {
        catalyst_type: catalyst?.catalyst_type ?? null,
        published_at: catalyst?.published_at ?? null,
      },
      gaps: uniqueGaps(gaps),
    },
    gaps: uniqueGaps(gaps),
  };
}

function addTimestampGaps(
  gaps: ShadowContextualQualityGap[],
  timestamps: Array<Date | null>,
  now: Date,
) {
  if (timestamps.length === 0 || timestamps.some((timestamp) => !timestamp)) {
    gaps.push("context_observed_at_invalid");
    return;
  }

  const values = timestamps as Date[];
  const nowValue = validInstant(now);
  if (!nowValue) {
    gaps.push("context_observed_at_invalid");
    return;
  }
  if (values.some((timestamp) => timestamp.getTime() > nowValue.getTime())) {
    gaps.push("context_observed_at_future");
    return;
  }

  const oldest = Math.min(...values.map((timestamp) => timestamp.getTime()));
  const newest = Math.max(...values.map((timestamp) => timestamp.getTime()));
  if ((nowValue.getTime() - oldest) / 60_000 > maxFreshnessMinutes) {
    gaps.push("context_observation_stale");
  }
  if ((newest - oldest) / 1_000 > maxObservationSkewSeconds) {
    gaps.push("context_observation_skew_exceeded");
  }
}

function benchmarkReturn(
  value: Partial<IntradayMarketContextSummary> | null,
  symbol: "SPY" | "QQQ" | "IWM",
) {
  if (!isObject(value) || !Array.isArray(value.benchmarks)) return null;
  const benchmark = value.benchmarks.find((item) => item.symbol === symbol);
  return finiteNumber(benchmark?.session_return_percent);
}

function validMarketBenchmarks(value: unknown): value is Array<{
  symbol: "SPY" | "QQQ" | "IWM";
  provider: string;
  observed_at: string;
  price: number;
  session_return_percent: number;
}> {
  if (!Array.isArray(value) || value.length !== 3) return false;
  const expectedSymbols = new Set(["SPY", "QQQ", "IWM"]);
  const providers = new Set<string>();
  const symbols = new Set<string>();

  for (const benchmark of value) {
    if (
      !isObject(benchmark) ||
      typeof benchmark.symbol !== "string" ||
      !expectedSymbols.has(benchmark.symbol) ||
      typeof benchmark.provider !== "string" ||
      benchmark.provider.trim().length === 0 ||
      validInstant(benchmark.observed_at) === null ||
      typeof benchmark.price !== "number" ||
      !Number.isFinite(benchmark.price) ||
      benchmark.price <= 0 ||
      typeof benchmark.session_return_percent !== "number" ||
      !Number.isFinite(benchmark.session_return_percent)
    ) {
      return false;
    }
    providers.add(benchmark.provider);
    symbols.add(benchmark.symbol);
  }

  return providers.size === 1 && symbols.size === expectedSymbols.size;
}

function validObservation(value: unknown): value is {
  symbol: string;
  provider: string;
  observed_at: string;
  session_return_percent: number;
} {
  return (
    isObject(value) &&
    normalizedSymbol(value.symbol) !== null &&
    typeof value.provider === "string" &&
    value.provider.trim().length > 0 &&
    validInstant(value.observed_at) !== null &&
    finiteNumber(value.session_return_percent) !== null
  );
}

function validCoverage(value: unknown): value is {
  symbol: string;
  provider: string;
  observed_at: string;
  lookback_started_at: string;
  reported_catalyst_count: number;
} {
  return (
    isObject(value) &&
    normalizedSymbol(value.symbol) !== null &&
    typeof value.provider === "string" &&
    value.provider.trim().length > 0 &&
    validInstant(value.observed_at) !== null &&
    validInstant(value.lookback_started_at) !== null &&
    typeof value.reported_catalyst_count === "number" &&
    Number.isInteger(value.reported_catalyst_count) &&
    value.reported_catalyst_count >= 0
  );
}

function validCatalyst(value: unknown): value is {
  symbol: string;
  provider: string;
  source_event_id: string;
  catalyst_type: string;
  published_at: string;
} {
  return (
    isObject(value) &&
    normalizedSymbol(value.symbol) !== null &&
    typeof value.provider === "string" &&
    value.provider.trim().length > 0 &&
    typeof value.source_event_id === "string" &&
    value.source_event_id.trim().length > 0 &&
    typeof value.catalyst_type === "string" &&
    value.catalyst_type.trim().length > 0 &&
    validInstant(value.published_at) !== null
  );
}

function normalizedSymbol(value: unknown) {
  if (typeof value !== "string") return null;
  const symbol = value.trim().toUpperCase();
  return /^[A-Z][A-Z0-9.-]{0,9}$/.test(symbol) ? symbol : null;
}

function validMarketDate(value: unknown) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
    ? value
    : null;
}

function validInstant(value: unknown) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (
    typeof value !== "string" ||
    !value.includes("T") ||
    !/(?:Z|[+-]\d{2}:\d{2})$/.test(value)
  ) {
    return null;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function finiteNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function latestInstant(values: Array<Date | null>) {
  const valid = values.filter((value): value is Date => value !== null);
  return valid.length === 0
    ? null
    : new Date(Math.max(...valid.map((value) => value.getTime())));
}

function uniqueGaps(gaps: ShadowContextualQualityGap[]) {
  return Array.from(new Set(gaps));
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
