import type {
  RealScannerCandidate,
  RealScannerCandidateGenerationSummary,
  RealScannerCandidateTier,
} from "@/lib/real-scanner-candidate-generation";
import type {
  RecommendationOutputEnrichmentItem,
  RecommendationOutputEnrichmentSummary,
  RecommendationOutputSourceMode,
} from "@/lib/recommendation-output-enrichment";
import type { RealRecommendationOutputReadinessSummary } from "@/lib/real-recommendation-output-readiness";

export type ScannerOutputQaStatus =
  | "healthy"
  | "usable_with_warnings"
  | "too_thin"
  | "too_noisy"
  | "field_incomplete"
  | "fallback_active"
  | "provider_limited"
  | "blocked"
  | "unknown";

export type ScannerOutputQaCheck = {
  check_id: string;
  label: string;
  status: "pass" | "warning" | "blocked" | "unknown";
  message: string;
  source:
    | "source_reality"
    | "candidate_volume"
    | "required_fields"
    | "price_plan"
    | "market_data"
    | "tier_distribution"
    | "diversity"
    | "rationale_quality"
    | "prompt_payload"
    | "learning_loop";
};

export type ScannerOutputQaFieldCoverage = {
  scope: "scanner_candidates" | "visible_recommendations";
  field: string;
  present_count: number;
  total_count: number;
  coverage_rate: number;
};

export type ScannerOutputQaCandidateIssue = {
  issue_id: string;
  ticker: string | null;
  severity: "info" | "warning" | "blocked";
  message: string;
  source: ScannerOutputQaCheck["source"];
};

export type ScannerOutputQaWarning = {
  warning_id: string;
  message: string;
  source: ScannerOutputQaCheck["source"];
};

export type ScannerOutputQaRecommendation = {
  recommendation_id: string;
  priority: "high" | "medium" | "low" | "watch";
  label: string;
  message: string;
};

export type ScannerOutputQaSummary = {
  summary_id: string;
  summary_version: "1.0";
  summary_kind: "scanner_output_qa";
  generated_at: string;
  overall_status: ScannerOutputQaStatus;
  summary: string;
  candidate_count: number;
  visible_recommendation_count: number;
  target_status: "within_target" | "below_target" | "above_target" | "unknown";
  target_min: number;
  target_max: number;
  source_breakdown: {
    real_scanner_candidates: number;
    provider_backed_candidates: number;
    daily_only_candidates: number;
    fallback_static_candidates: number;
    demo_recommendations: number;
    local_recommendations: number;
    unknown_source_recommendations: number;
  };
  field_coverage_score: number;
  market_data_coverage_score: number;
  tier_distribution: Record<RealScannerCandidateTier | "unknown", number>;
  diversity: {
    unique_tickers: number;
    duplicate_ticker_count: number;
    sector_counts: Record<string, number>;
    concentrated_sector: string | null;
  };
  checks: ScannerOutputQaCheck[];
  field_coverage: ScannerOutputQaFieldCoverage[];
  candidate_issues: ScannerOutputQaCandidateIssue[];
  warnings: ScannerOutputQaWarning[];
  top_scanner_gaps: string[];
  recommended_next_action: ScannerOutputQaRecommendation;
  recommendations: ScannerOutputQaRecommendation[];
  prompt_payload_reality: {
    mock_language_removed: boolean;
    provider_metadata_in_payload: boolean;
    missing_data_represented_as_gaps: boolean;
  };
};

export type ScannerOutputQaInput = {
  scanner_generation?: RealScannerCandidateGenerationSummary | null;
  recommendation_output?: RecommendationOutputEnrichmentSummary | null;
  readiness?: RealRecommendationOutputReadinessSummary | null;
  prompt_payload_reality?: Partial<
    ScannerOutputQaSummary["prompt_payload_reality"]
  > | null;
  now?: Date | string | null;
};

const scannerRequiredFields = [
  "ticker",
  "entry",
  "stop",
  "target",
  "risk_reward",
  "rationale",
  "data_timestamp",
  "provider_source",
  "freshness",
  "market_session",
] as const;

const recommendationRequiredFields = [
  "ticker",
  "side",
  "entry",
  "stop",
  "target",
  "confidence",
  "rationale",
  "recommended_at",
  "data_timestamp",
  "provider_source",
  "freshness",
  "market_session",
] as const;

const marketDataFields = [
  "quote_last_price",
  "candle_context",
  "intraday_high_low",
  "volume",
  "spread",
  "freshness",
] as const;

function toDate(value: Date | string | null | undefined) {
  if (value instanceof Date && Number.isFinite(value.getTime())) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const date = new Date(value);
    return Number.isFinite(date.getTime()) ? date : null;
  }

  return null;
}

function hasNumber(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function hasText(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function percent(part: number, total: number) {
  if (total <= 0) {
    return 0;
  }

  return Math.round((part / total) * 100);
}

function average(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return Math.round(
    values.reduce((total, value) => total + value, 0) / values.length,
  );
}

function issue(
  issue_id: string,
  ticker: string | null,
  severity: ScannerOutputQaCandidateIssue["severity"],
  message: string,
  source: ScannerOutputQaCandidateIssue["source"],
): ScannerOutputQaCandidateIssue {
  return { issue_id, ticker, severity, message, source };
}

function warning(
  warning_id: string,
  message: string,
  source: ScannerOutputQaWarning["source"],
): ScannerOutputQaWarning {
  return { warning_id, message, source };
}

function recommendation(
  recommendation_id: string,
  priority: ScannerOutputQaRecommendation["priority"],
  label: string,
  message: string,
): ScannerOutputQaRecommendation {
  return { recommendation_id, priority, label, message };
}

function scannerFieldPresent(
  candidate: RealScannerCandidate,
  field: (typeof scannerRequiredFields)[number],
  marketSessionAvailable: boolean,
) {
  if (field === "ticker") return hasText(candidate.ticker);
  if (field === "entry") {
    return hasNumber(candidate.entry_low) || hasNumber(candidate.entry_high);
  }
  if (field === "stop") return hasNumber(candidate.stop_loss);
  if (field === "target") {
    return hasNumber(candidate.target_1) || hasNumber(candidate.target_2);
  }
  if (field === "risk_reward") return hasNumber(candidate.risk_reward);
  if (field === "rationale") {
    return (
      candidate.score.reasons.length > 0 ||
      candidate.signals.some((signal) => signal.value !== null)
    );
  }
  if (field === "data_timestamp") return hasText(candidate.market_data_timestamp);
  if (field === "provider_source") return hasText(candidate.provider_source);
  if (field === "freshness") return !candidate.stale;
  if (field === "market_session") return marketSessionAvailable;
  return false;
}

function recommendationFieldPresent(
  item: RecommendationOutputEnrichmentItem,
  field: (typeof recommendationRequiredFields)[number],
) {
  if (field === "ticker") return hasText(item.ticker);
  if (field === "side") return hasText(item.side);
  if (field === "entry") return hasNumber(item.entry);
  if (field === "stop") return hasNumber(item.stop);
  if (field === "target") return hasNumber(item.target);
  if (field === "confidence") return item.confidence !== null;
  if (field === "rationale") return hasText(item.rationale);
  if (field === "recommended_at") return hasText(item.recommended_at);
  if (field === "data_timestamp") return hasText(item.data_timestamp);
  if (field === "provider_source") return hasText(item.provider_source);
  if (field === "freshness") {
    return item.data_age_minutes !== null && item.data_age_minutes <= 90;
  }
  if (field === "market_session") return hasText(item.market_session_phase);
  return false;
}

function marketDataFieldPresent(
  item: RecommendationOutputEnrichmentItem,
  field: (typeof marketDataFields)[number],
) {
  if (field === "quote_last_price") return hasNumber(item.quote_last_price);
  if (field === "candle_context") return item.candle_context !== null;
  if (field === "intraday_high_low") {
    return (
      hasNumber(item.candle_context?.recent_high) &&
      hasNumber(item.candle_context?.recent_low)
    );
  }
  if (field === "volume") return hasNumber(item.volume);
  if (field === "spread") return hasNumber(item.spread);
  if (field === "freshness") {
    return item.data_age_minutes !== null && item.data_age_minutes <= 90;
  }
  return false;
}

function scannerMarketDataCoverage(candidate: RealScannerCandidate) {
  const latestPricePresent = candidate.signals.some(
    (signal) => signal.label === "latest_price" && signal.value !== null,
  );
  const volumePresent = candidate.signals.some(
    (signal) =>
      (signal.label === "volume_ratio" ||
        signal.label === "recent_volume_ratio") &&
      signal.value !== null,
  );
  const timestampPresent = hasText(candidate.market_data_timestamp);
  const providerPresent = hasText(candidate.provider_source);

  return percent(
    [
      latestPricePresent,
      volumePresent,
      timestampPresent,
      providerPresent,
      !candidate.stale,
    ].filter(Boolean).length,
    5,
  );
}

function buildFieldCoverage(
  scannerGeneration: RealScannerCandidateGenerationSummary | null,
  recommendationOutput: RecommendationOutputEnrichmentSummary | null,
) {
  const fieldCoverage: ScannerOutputQaFieldCoverage[] = [];
  const scannerCandidates = scannerGeneration?.candidates ?? [];
  const marketSessionAvailable =
    scannerGeneration !== null && scannerGeneration.scan_window !== "unknown";

  for (const field of scannerRequiredFields) {
    fieldCoverage.push({
      scope: "scanner_candidates",
      field,
      present_count: scannerCandidates.filter((candidate) =>
        scannerFieldPresent(candidate, field, marketSessionAvailable),
      ).length,
      total_count: scannerCandidates.length,
      coverage_rate: percent(
        scannerCandidates.filter((candidate) =>
          scannerFieldPresent(candidate, field, marketSessionAvailable),
        ).length,
        scannerCandidates.length,
      ),
    });
  }

  const recommendationItems = recommendationOutput?.items ?? [];

  for (const field of recommendationRequiredFields) {
    fieldCoverage.push({
      scope: "visible_recommendations",
      field,
      present_count: recommendationItems.filter((item) =>
        recommendationFieldPresent(item, field),
      ).length,
      total_count: recommendationItems.length,
      coverage_rate: percent(
        recommendationItems.filter((item) =>
          recommendationFieldPresent(item, field),
        ).length,
        recommendationItems.length,
      ),
    });
  }

  return fieldCoverage;
}

function buildCandidateIssues(
  scannerGeneration: RealScannerCandidateGenerationSummary | null,
  recommendationOutput: RecommendationOutputEnrichmentSummary | null,
) {
  const issues: ScannerOutputQaCandidateIssue[] = [];

  for (const candidate of scannerGeneration?.candidates ?? []) {
    const entry = candidate.entry_high ?? candidate.entry_low;
    const target = candidate.target_1 ?? candidate.target_2;

    if (!hasNumber(entry) || !hasNumber(candidate.stop_loss) || !hasNumber(target)) {
      issues.push(
        issue(
          "scanner_incomplete_price_plan",
          candidate.ticker,
          "warning",
          "Scanner candidate is missing entry, stop, or target.",
          "price_plan",
        ),
      );
      continue;
    }

    const risk = entry - candidate.stop_loss;
    const reward = target - entry;

    if (risk <= 0 || reward <= 0) {
      issues.push(
        issue(
          "scanner_invalid_long_price_plan",
          candidate.ticker,
          "blocked",
          "Long setup price plan must satisfy stop < entry < target.",
          "price_plan",
        ),
      );
    }

    const stopDistancePercent = Math.abs((risk / entry) * 100);
    const targetDistancePercent = Math.abs((reward / entry) * 100);

    if (stopDistancePercent > 10) {
      issues.push(
        issue(
          "scanner_extreme_stop_distance",
          candidate.ticker,
          "warning",
          `Stop distance is wide for a day trade at ${stopDistancePercent.toFixed(1)}%.`,
          "price_plan",
        ),
      );
    }

    if (targetDistancePercent > 15) {
      issues.push(
        issue(
          "scanner_extreme_target_distance",
          candidate.ticker,
          "warning",
          `Target distance is aggressive for a day trade at ${targetDistancePercent.toFixed(1)}%.`,
          "price_plan",
        ),
      );
    }

    if (
      hasNumber(candidate.risk_reward) &&
      (candidate.risk_reward < 0.5 || candidate.risk_reward > 8)
    ) {
      issues.push(
        issue(
          "scanner_unsane_risk_reward",
          candidate.ticker,
          "warning",
          `Risk/reward ${candidate.risk_reward.toFixed(2)} is outside the expected QA range.`,
          "price_plan",
        ),
      );
    }

    if (!hasText(candidate.provider_source)) {
      issues.push(
        issue(
          "scanner_provider_missing",
          candidate.ticker,
          "warning",
          "Provider/source metadata is missing for this scanner candidate.",
          "market_data",
        ),
      );
    }

    if (candidate.stale) {
      issues.push(
        issue(
          "scanner_stale_data",
          candidate.ticker,
          "warning",
          "Scanner candidate has stale market data metadata.",
          "market_data",
        ),
      );
    }

    if (
      candidate.tier === "experimental" ||
      candidate.tier === "incomplete" ||
      candidate.tier === "rejected"
    ) {
      issues.push(
        issue(
          `scanner_${candidate.tier}_tier`,
          candidate.ticker,
          candidate.tier === "experimental" ? "info" : "warning",
          `Candidate tier is ${candidate.tier}; keep it diagnostic/watchlist unless stronger fields arrive.`,
          "tier_distribution",
        ),
      );
    }
  }

  for (const item of recommendationOutput?.items ?? []) {
    if (item.missing_fields.length > 0) {
      issues.push(
        issue(
          "recommendation_missing_required_fields",
          item.ticker,
          "warning",
          `Visible recommendation is missing: ${item.missing_fields.join(", ")}.`,
          "required_fields",
        ),
      );
    }

    if (
      hasNumber(item.entry) &&
      hasNumber(item.stop) &&
      hasNumber(item.target) &&
      !(item.stop < item.entry && item.entry < item.target)
    ) {
      issues.push(
        issue(
          "recommendation_invalid_long_price_plan",
          item.ticker,
          "blocked",
          "Visible recommendation long plan does not satisfy stop < entry < target.",
          "price_plan",
        ),
      );
    }

    if (!hasText(item.rationale)) {
      issues.push(
        issue(
          "recommendation_generic_or_missing_rationale",
          item.ticker,
          "warning",
          "Visible recommendation is missing a rationale/catalyst field.",
          "rationale_quality",
        ),
      );
    } else if (/scanner filters|high-quality setup|passed the scanner/i.test(item.rationale)) {
      issues.push(
        issue(
          "recommendation_generic_rationale",
          item.ticker,
          "info",
          "Rationale looks generic; prefer references to concrete scanner signals.",
          "rationale_quality",
        ),
      );
    }
  }

  return issues;
}

function buildTierDistribution(
  scannerGeneration: RealScannerCandidateGenerationSummary | null,
) {
  return {
    strong: scannerGeneration?.tier_counts.strong ?? 0,
    valid: scannerGeneration?.tier_counts.valid ?? 0,
    experimental: scannerGeneration?.tier_counts.experimental ?? 0,
    incomplete: scannerGeneration?.tier_counts.incomplete ?? 0,
    rejected: scannerGeneration?.tier_counts.rejected ?? 0,
    unknown: scannerGeneration ? 0 : 1,
  };
}

function buildDiversity(scannerGeneration: RealScannerCandidateGenerationSummary | null) {
  const candidates = scannerGeneration?.candidates ?? [];
  const tickerCounts = new Map<string, number>();
  const sectorCounts: Record<string, number> = {};

  for (const candidate of candidates) {
    tickerCounts.set(candidate.ticker, (tickerCounts.get(candidate.ticker) ?? 0) + 1);
    const sector = hasText(candidate.sector) ? candidate.sector : "Unknown";
    sectorCounts[sector] = (sectorCounts[sector] ?? 0) + 1;
  }

  const duplicateTickerCount = Array.from(tickerCounts.values()).filter(
    (count) => count > 1,
  ).length;
  const concentratedSector =
    candidates.length > 0
      ? Object.entries(sectorCounts).find(([, count]) => count / candidates.length > 0.65)?.[0] ??
        null
      : null;

  return {
    unique_tickers: tickerCounts.size,
    duplicate_ticker_count: duplicateTickerCount,
    sector_counts: sectorCounts,
    concentrated_sector: concentratedSector,
  };
}

function buildChecks(input: {
  scannerGeneration: RealScannerCandidateGenerationSummary | null;
  recommendationOutput: RecommendationOutputEnrichmentSummary | null;
  readiness: RealRecommendationOutputReadinessSummary | null;
  candidateCount: number;
  visibleRecommendationCount: number;
  targetMin: number;
  targetMax: number;
  fieldCoverageScore: number;
  marketDataCoverageScore: number;
  tierDistribution: ScannerOutputQaSummary["tier_distribution"];
  diversity: ScannerOutputQaSummary["diversity"];
  promptPayloadReality: ScannerOutputQaSummary["prompt_payload_reality"];
}) {
  const checks: ScannerOutputQaCheck[] = [];
  const sourceCounts = input.recommendationOutput?.source_counts ?? null;
  const fallbackCount =
    (sourceCounts?.demo ?? 0) +
    (sourceCounts?.mock ?? 0) +
    (input.scannerGeneration?.status === "demo_fallback" ? 1 : 0);
  const providerBacked =
    input.scannerGeneration?.universe.provider_backed_candidates ?? 0;

  checks.push({
    check_id: "source_reality",
    label: "Source reality",
    status:
      fallbackCount > 0
        ? "warning"
        : input.scannerGeneration
          ? "pass"
          : "unknown",
    message:
      fallbackCount > 0
        ? "Fallback/demo/static output is present in the visible scanner/recommendation context."
        : input.scannerGeneration
          ? "Scanner output is coming from the real scanner generation summary."
          : "No scanner generation summary is available yet.",
    source: "source_reality",
  });

  checks.push({
    check_id: "candidate_volume",
    label: "Candidate volume",
    status:
      input.candidateCount === 0
        ? "blocked"
        : input.candidateCount < input.targetMin ||
            input.visibleRecommendationCount > input.targetMax
          ? "warning"
          : "pass",
    message:
      input.candidateCount === 0
        ? "No scanner candidates are available for QA."
        : `${input.candidateCount} scanner candidates and ${input.visibleRecommendationCount} visible recommendations against a ${input.targetMin}-${input.targetMax} target.`,
    source: "candidate_volume",
  });

  checks.push({
    check_id: "required_field_coverage",
    label: "Required field coverage",
    status:
      input.fieldCoverageScore >= 90
        ? "pass"
        : input.fieldCoverageScore >= 70
          ? "warning"
          : "blocked",
    message: `Required field coverage is ${input.fieldCoverageScore}%.`,
    source: "required_fields",
  });

  checks.push({
    check_id: "market_data_coverage",
    label: "Market data coverage",
    status:
      input.marketDataCoverageScore >= 80
        ? "pass"
        : input.marketDataCoverageScore >= 50
          ? "warning"
          : "blocked",
    message: `Market data coverage is ${input.marketDataCoverageScore}%. Provider-backed candidates: ${providerBacked}.`,
    source: "market_data",
  });

  checks.push({
    check_id: "tier_distribution",
    label: "Tier distribution",
    status:
      input.tierDistribution.strong + input.tierDistribution.valid > 0
        ? "pass"
        : input.tierDistribution.experimental > 0
          ? "warning"
          : "blocked",
    message: `${input.tierDistribution.strong} strong, ${input.tierDistribution.valid} valid, ${input.tierDistribution.experimental} experimental, ${input.tierDistribution.incomplete + input.tierDistribution.rejected + input.tierDistribution.unknown} incomplete/rejected/unknown.`,
    source: "tier_distribution",
  });

  checks.push({
    check_id: "diversity",
    label: "Diversity",
    status:
      input.diversity.duplicate_ticker_count > 0 ||
      input.diversity.concentrated_sector !== null
        ? "warning"
        : input.candidateCount > 0
          ? "pass"
          : "unknown",
    message:
      input.diversity.concentrated_sector !== null
        ? `Candidate set is concentrated in ${input.diversity.concentrated_sector}.`
        : `${input.diversity.unique_tickers} unique tickers; ${input.diversity.duplicate_ticker_count} duplicate ticker groups.`,
    source: "diversity",
  });

  checks.push({
    check_id: "prompt_payload_reality",
    label: "OpenAI prompt/payload reality",
    status:
      input.promptPayloadReality.mock_language_removed &&
      input.promptPayloadReality.provider_metadata_in_payload &&
      input.promptPayloadReality.missing_data_represented_as_gaps
        ? "pass"
        : "warning",
    message:
      "Prompt/payload QA expects real scanner language, provider/source/timestamp metadata, and explicit gaps for missing data.",
    source: "prompt_payload",
  });

  checks.push({
    check_id: "learning_compatibility",
    label: "Learning compatibility",
    status:
      input.readiness?.observation_only_real_data_logging_ready === true ||
      (input.recommendationOutput?.learning_compatible_count ?? 0) > 0
        ? "pass"
        : input.recommendationOutput
          ? "warning"
          : "unknown",
    message:
      input.readiness?.observation_only_real_data_logging_ready === true
        ? "Readiness summary says observation-only real-data logging is ready."
        : `${input.recommendationOutput?.learning_compatible_count ?? 0} visible recommendations are learning-compatible.`,
    source: "learning_loop",
  });

  return checks;
}

function determineStatus(input: {
  checks: ScannerOutputQaCheck[];
  candidateCount: number;
  visibleRecommendationCount: number;
  targetMin: number;
  targetMax: number;
  fieldCoverageScore: number;
  marketDataCoverageScore: number;
  fallbackActive: boolean;
  providerLimited: boolean;
}) {
  if (input.checks.some((check) => check.status === "blocked")) {
    if (input.candidateCount === 0) return "blocked";
    if (input.marketDataCoverageScore < 50 || input.providerLimited) {
      return "provider_limited";
    }
    if (input.fieldCoverageScore < 70) return "field_incomplete";
    return "blocked";
  }

  if (input.fallbackActive) return "fallback_active";
  if (input.candidateCount < input.targetMin) return "too_thin";
  if (input.visibleRecommendationCount > input.targetMax) return "too_noisy";
  if (input.fieldCoverageScore < 85) return "field_incomplete";
  if (input.marketDataCoverageScore < 70) return "provider_limited";
  if (input.checks.some((check) => check.status === "warning")) {
    return "usable_with_warnings";
  }

  return "healthy";
}

function buildSummaryText(status: ScannerOutputQaStatus) {
  if (status === "healthy") {
    return "Scanner output is useful, real-data-backed, and ready for ranking QA.";
  }

  if (status === "too_thin") {
    return "Scanner output is real enough to inspect, but the candidate set is thinner than the 6-10 learning target.";
  }

  if (status === "too_noisy") {
    return "Scanner output has too many visible recommendations for the current target and should be reviewed before ranking changes.";
  }

  if (status === "field_incomplete") {
    return "Scanner output is missing required fields that limit learning compatibility.";
  }

  if (status === "fallback_active") {
    return "Fallback or demo output is still present, so real scanner QA should stay cautious.";
  }

  if (status === "provider_limited") {
    return "Scanner output is limited by provider/source coverage or market data completeness.";
  }

  if (status === "blocked") {
    return "Scanner output is not yet sufficient for useful learning QA.";
  }

  return "Scanner output QA has insufficient context.";
}

function buildRecommendedActions(status: ScannerOutputQaStatus) {
  if (status === "provider_limited") {
    return [
      recommendation(
        "improve_provider_data",
        "high",
        "Improve provider data",
        "Increase fresh/cache market-data coverage before changing ranking.",
      ),
      recommendation(
        "collect_more_live_samples",
        "medium",
        "Collect more live samples",
        "Run more scans to separate provider gaps from normal market thinness.",
      ),
    ];
  }

  if (status === "field_incomplete") {
    return [
      recommendation(
        "fix_missing_fields",
        "high",
        "Fix missing fields",
        "Fill required source, timestamp, rationale, and plan fields before ranking work.",
      ),
    ];
  }

  if (status === "too_thin") {
    return [
      recommendation(
        "expand_universe",
        "medium",
        "Expand universe",
        "Broaden or warm the scanner universe only after confirming provider coverage.",
      ),
      recommendation(
        "collect_more_live_samples",
        "medium",
        "Collect more live samples",
        "Observe more windows before changing ranking thresholds.",
      ),
    ];
  }

  if (status === "too_noisy") {
    return [
      recommendation(
        "adjust_ranking",
        "medium",
        "Adjust ranking",
        "Review ranking only after confirming fields and source reality are healthy.",
      ),
    ];
  }

  if (status === "healthy" || status === "usable_with_warnings") {
    return [
      recommendation(
        "proceed_to_ranking_v1",
        "low",
        "Proceed to ranking v1",
        "Scanner output is good enough for the next ranking QA pass, while preserving current behavior.",
      ),
      recommendation(
        "collect_more_live_samples",
        "watch",
        "Collect more live samples",
        "Keep collecting scans to validate the distribution across day-trade windows.",
      ),
    ];
  }

  return [
    recommendation(
      "fix_missing_fields",
      "high",
      "Fix missing fields",
      "Resolve scanner-output blockers before modifying scoring or ranking.",
    ),
  ];
}

export function buildScannerOutputQaSummary(
  input: ScannerOutputQaInput,
): ScannerOutputQaSummary {
  const now = toDate(input.now) ?? new Date();
  const scannerGeneration = input.scanner_generation ?? null;
  const recommendationOutput = input.recommendation_output ?? null;
  const readiness = input.readiness ?? null;
  const candidateCount = scannerGeneration?.universe.candidates_generated ?? 0;
  const visibleRecommendationCount =
    recommendationOutput?.total_recommendations ??
    scannerGeneration?.visible_candidate_tickers.length ??
    0;
  const targetMin = scannerGeneration?.target_visible_candidates_min ?? 6;
  const targetMax = scannerGeneration?.target_visible_candidates_max ?? 10;
  const fieldCoverage = buildFieldCoverage(scannerGeneration, recommendationOutput);
  const fieldCoverageScore = average(
    fieldCoverage
      .filter((item) => item.total_count > 0)
      .map((item) => item.coverage_rate),
  );
  const recommendationMarketDataScores =
    recommendationOutput?.items.map((item) =>
      average(
        marketDataFields.map((field) =>
          marketDataFieldPresent(item, field) ? 100 : 0,
        ),
      ),
    ) ?? [];
  const scannerMarketDataScores =
    scannerGeneration?.candidates.map(scannerMarketDataCoverage) ?? [];
  const marketDataCoverageScore = average([
    ...scannerMarketDataScores,
    ...recommendationMarketDataScores,
  ]);
  const candidateIssues = buildCandidateIssues(
    scannerGeneration,
    recommendationOutput,
  );
  const tierDistribution = buildTierDistribution(scannerGeneration);
  const diversity = buildDiversity(scannerGeneration);
  const sourceCounts =
    recommendationOutput?.source_counts ??
    ({
      real: 0,
      demo: 0,
      mock: 0,
      local: 0,
      mixed: 0,
      unknown: 0,
    } satisfies Record<RecommendationOutputSourceMode, number>);
  const fallbackActive =
    sourceCounts.demo > 0 ||
    sourceCounts.mock > 0 ||
    scannerGeneration?.status === "demo_fallback";
  const providerLimited =
    scannerGeneration?.status === "provider_limited" ||
    (scannerGeneration !== null &&
      scannerGeneration.universe.provider_backed_candidates === 0);
  const promptPayloadReality = {
    mock_language_removed:
      input.prompt_payload_reality?.mock_language_removed ?? true,
    provider_metadata_in_payload:
      input.prompt_payload_reality?.provider_metadata_in_payload ??
      (scannerGeneration?.provider_source !== null ||
        (scannerGeneration?.universe.provider_backed_candidates ?? 0) > 0),
    missing_data_represented_as_gaps:
      input.prompt_payload_reality?.missing_data_represented_as_gaps ??
      ((scannerGeneration?.gaps.length ?? 0) > 0 ||
        (recommendationOutput?.gaps.length ?? 0) > 0 ||
        scannerGeneration !== null),
  };
  const checks = buildChecks({
    scannerGeneration,
    recommendationOutput,
    readiness,
    candidateCount,
    visibleRecommendationCount,
    targetMin,
    targetMax,
    fieldCoverageScore,
    marketDataCoverageScore,
    tierDistribution,
    diversity,
    promptPayloadReality,
  });
  const status = determineStatus({
    checks,
    candidateCount,
    visibleRecommendationCount,
    targetMin,
    targetMax,
    fieldCoverageScore,
    marketDataCoverageScore,
    fallbackActive,
    providerLimited,
  });
  const warnings = [
    ...checks
      .filter((check) => check.status === "warning" || check.status === "blocked")
      .map((check) => warning(check.check_id, check.message, check.source)),
    ...candidateIssues
      .filter((item) => item.severity !== "info")
      .slice(0, 8)
      .map((item) => warning(item.issue_id, item.message, item.source)),
  ];
  const recommendations = buildRecommendedActions(status);

  return {
    summary_id: `scanner_output_qa:${now.toISOString()}`,
    summary_version: "1.0",
    summary_kind: "scanner_output_qa",
    generated_at: now.toISOString(),
    overall_status: status,
    summary: buildSummaryText(status),
    candidate_count: candidateCount,
    visible_recommendation_count: visibleRecommendationCount,
    target_status:
      visibleRecommendationCount === 0 && candidateCount === 0
        ? "unknown"
        : visibleRecommendationCount < targetMin && candidateCount < targetMin
          ? "below_target"
          : visibleRecommendationCount > targetMax
            ? "above_target"
            : "within_target",
    target_min: targetMin,
    target_max: targetMax,
    source_breakdown: {
      real_scanner_candidates: scannerGeneration
        ? scannerGeneration.candidates.filter(
            (candidate) =>
              candidate.provider_source !== null ||
              candidate.data_source === "daily_only",
          ).length
        : 0,
      provider_backed_candidates:
        scannerGeneration?.universe.provider_backed_candidates ?? 0,
      daily_only_candidates:
        scannerGeneration?.candidates.filter(
          (candidate) => candidate.data_source === "daily_only",
        ).length ?? 0,
      fallback_static_candidates:
        scannerGeneration?.status === "demo_fallback" ? candidateCount : 0,
      demo_recommendations: sourceCounts.demo,
      local_recommendations: sourceCounts.local,
      unknown_source_recommendations: sourceCounts.unknown,
    },
    field_coverage_score: fieldCoverageScore,
    market_data_coverage_score: marketDataCoverageScore,
    tier_distribution: tierDistribution,
    diversity,
    checks,
    field_coverage: fieldCoverage,
    candidate_issues: candidateIssues.slice(0, 20),
    warnings: Array.from(
      new Map(warnings.map((item) => [item.warning_id + item.message, item])).values(),
    ).slice(0, 12),
    top_scanner_gaps: Array.from(
      new Set([
        ...(scannerGeneration?.gaps ?? []),
        ...(recommendationOutput?.gaps ?? []),
        ...(readiness?.provider_scanner_gaps ?? []),
      ]),
    ).slice(0, 12),
    recommended_next_action: recommendations[0],
    recommendations,
    prompt_payload_reality: promptPayloadReality,
  };
}

export function scannerOutputQaSummaryJson(summary: ScannerOutputQaSummary) {
  return JSON.stringify(summary, null, 2);
}
