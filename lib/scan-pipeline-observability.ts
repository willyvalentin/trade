import type {
  RecommendationIntakeQualityResult,
  RecommendationIntakeQualityStatus,
} from "@/lib/recommendation-intake-quality";

export type ScanPipelineObservabilityStatus =
  | "healthy"
  | "degraded"
  | "stale"
  | "incomplete"
  | "unknown";

export type ScanPipelineMetricStatus =
  | "ok"
  | "warning"
  | "blocked"
  | "unknown";

export type ScanPipelineObservabilityMetric = {
  metric_id: string;
  label: string;
  value: number | string | null;
  display_value: string;
  status: ScanPipelineMetricStatus;
  source: "visible_recommendations" | "intake_quality" | "scan_logs" | "market_session";
  unavailable_reason?: string | null;
};

export type ScanPipelineObservabilityWarning = {
  warning_id: string;
  label: string;
  message: string;
  source: "visible_recommendations" | "intake_quality" | "scan_logs" | "market_session";
};

export type ScanPipelineObservabilitySourceStatus = {
  source_id: string;
  label: string;
  status: "available" | "partial" | "unavailable" | "unknown";
  message: string;
};

export type ScanPipelineObservabilityRunContext = {
  latest_scan_at: string | null;
  latest_scan_result: string | null;
  latest_scan_window: string | null;
  latest_scan_source: string | null;
  latest_recommendation_at: string | null;
  latest_observable_update_at: string | null;
  data_age_minutes: number | null;
  market_session_phase: string | null;
  market_session_risk: string | null;
  market_session_source: string | null;
};

export type ScanPipelineObservabilitySummary = {
  summary_id: string;
  summary_version: "1.0";
  summary_kind: "scan_pipeline_observability";
  generated_at: string;
  status: ScanPipelineObservabilityStatus;
  visible_recommendation_count: number;
  intake_counts: Record<RecommendationIntakeQualityStatus, number>;
  accepted_rate: number | null;
  elevated_candidate_count: number;
  duplicate_ticker_count: number;
  stale_candidate_count: number;
  incomplete_data_candidate_count: number;
  tickers_represented: string[];
  top_reasons: Array<{
    reason_id: string;
    label: string;
    message: string;
    count: number;
  }>;
  metrics: ScanPipelineObservabilityMetric[];
  warnings: ScanPipelineObservabilityWarning[];
  source_statuses: ScanPipelineObservabilitySourceStatus[];
  run_context: ScanPipelineObservabilityRunContext;
  unknown_metrics: string[];
  summary: string;
};

export type ScanPipelineObservabilityInput = {
  visible_recommendations: Array<{
    id?: string | null;
    ticker?: string | null;
    created_at?: string | null;
    status?: string | null;
    archived?: boolean | null;
    is_demo?: boolean | null;
  }>;
  intake_results: RecommendationIntakeQualityResult[];
  scan_logs?: Array<{
    created_at?: string | null;
    source?: string | null;
    scan_window?: string | null;
    result?: string | null;
    message?: string | null;
    recommendations_created?: number | null;
    candidates_scanned?: number | null;
    skipped_tickers?: number | null;
    pre_market_candidates?: unknown[] | null;
    indicator_source?: string | null;
    indicator_stale?: boolean | null;
  }>;
  market_session?: {
    phase?: string | null;
    risk_level?: string | null;
    source?: string | null;
  } | null;
  latest_recommendation_at?: string | null;
  now?: Date | string | null;
};

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

function minutesBetween(later: Date, earlier: Date) {
  return Math.max(0, Math.round((later.getTime() - earlier.getTime()) / 60000));
}

function formatNumber(value: number | null) {
  if (value === null || !Number.isFinite(value)) {
    return "—";
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number | null) {
  if (value === null || !Number.isFinite(value)) {
    return "—";
  }

  return `${value.toFixed(1)}%`;
}

function normalizeTicker(value: string | null | undefined) {
  const ticker = value?.trim().toUpperCase() ?? "";
  return ticker.length > 0 ? ticker : null;
}

function latestIso(values: Array<string | null | undefined>) {
  const timestamps = values
    .map((value) => toDate(value))
    .filter((value): value is Date => value !== null)
    .sort((first, second) => second.getTime() - first.getTime());

  return timestamps[0]?.toISOString() ?? null;
}

function metric(
  metric_id: string,
  label: string,
  value: number | string | null,
  display_value: string,
  status: ScanPipelineMetricStatus,
  source: ScanPipelineObservabilityMetric["source"],
  unavailable_reason: string | null = null,
): ScanPipelineObservabilityMetric {
  return {
    metric_id,
    label,
    value,
    display_value,
    status,
    source,
    unavailable_reason,
  };
}

function warning(
  warning_id: string,
  label: string,
  message: string,
  source: ScanPipelineObservabilityWarning["source"],
): ScanPipelineObservabilityWarning {
  return {
    warning_id,
    label,
    message,
    source,
  };
}

function determineStatus({
  visibleCount,
  staleCandidateCount,
  elevatedCandidateCount,
  incompleteDataCandidateCount,
  rejectedCount,
  marketRisk,
  hasScanLogs,
}: {
  visibleCount: number;
  staleCandidateCount: number;
  elevatedCandidateCount: number;
  incompleteDataCandidateCount: number;
  rejectedCount: number;
  marketRisk: string | null;
  hasScanLogs: boolean;
}): ScanPipelineObservabilityStatus {
  if (visibleCount === 0 && !hasScanLogs) {
    return "unknown";
  }

  if (staleCandidateCount > 0) {
    return "stale";
  }

  if (
    rejectedCount > 0 ||
    elevatedCandidateCount > 0 ||
    marketRisk === "high" ||
    marketRisk === "critical"
  ) {
    return "degraded";
  }

  if (incompleteDataCandidateCount > 0 || !hasScanLogs) {
    return "incomplete";
  }

  return "healthy";
}

function statusSummary(status: ScanPipelineObservabilityStatus) {
  if (status === "healthy") {
    return "Scan pipeline observability looks healthy from available data.";
  }

  if (status === "degraded") {
    return "Scan pipeline observability is degraded because one or more candidates or session signals need review.";
  }

  if (status === "stale") {
    return "Scan pipeline observability is stale. Refresh scanner data before relying on visible recommendations.";
  }

  if (status === "incomplete") {
    return "Scan pipeline observability is incomplete because some pipeline metrics are unavailable.";
  }

  return "Scan pipeline observability is unknown because no observable scan or recommendation data is available.";
}

export function buildScanPipelineObservabilitySummary(
  input: ScanPipelineObservabilityInput,
): ScanPipelineObservabilitySummary {
  const generatedAt = (toDate(input.now) ?? new Date()).toISOString();
  const generatedDate = toDate(generatedAt) ?? new Date();
  const intakeCounts: Record<RecommendationIntakeQualityStatus, number> = {
    accepted: 0,
    needs_review: 0,
    rejected: 0,
    incomplete: 0,
  };
  const reasonCounts = new Map<
    string,
    { label: string; message: string; count: number }
  >();

  for (const result of input.intake_results) {
    intakeCounts[result.status] += 1;
    for (const reason of result.top_reasons) {
      const existing = reasonCounts.get(reason.reason_id);
      reasonCounts.set(reason.reason_id, {
        label: reason.label,
        message: reason.message,
        count: (existing?.count ?? 0) + 1,
      });
    }
  }

  const visibleRecommendations = input.visible_recommendations ?? [];
  const visibleCount = visibleRecommendations.length;
  const acceptedRate =
    visibleCount > 0 ? (intakeCounts.accepted / visibleCount) * 100 : null;
  const elevatedCandidateCount =
    intakeCounts.needs_review + intakeCounts.rejected + intakeCounts.incomplete;
  const staleCandidateCount = input.intake_results.filter((result) =>
    result.blockers.some(
      (item) =>
        item.reason_id === "market_data_severely_stale" ||
        item.reason_id === "market_data_stale",
    ) ||
    result.warnings.some(
      (item) =>
        item.reason_id === "market_data_severely_stale" ||
        item.reason_id === "market_data_stale",
    ),
  ).length;
  const incompleteDataCandidateCount = input.intake_results.filter(
    (result) => result.status === "incomplete",
  ).length;
  const tickerCounts = new Map<string, number>();

  for (const recommendation of visibleRecommendations) {
    const ticker = normalizeTicker(recommendation.ticker);
    if (ticker) {
      tickerCounts.set(ticker, (tickerCounts.get(ticker) ?? 0) + 1);
    }
  }

  const tickersRepresented = Array.from(tickerCounts.keys()).sort();
  const duplicateTickerCount = Array.from(tickerCounts.values()).filter(
    (count) => count > 1,
  ).length;
  const topReasons = Array.from(reasonCounts.entries())
    .map(([reason_id, value]) => ({ reason_id, ...value }))
    .sort((first, second) => second.count - first.count)
    .slice(0, 8);
  const scanLogs = input.scan_logs ?? [];
  const latestScan = [...scanLogs]
    .filter((item) => toDate(item.created_at) !== null)
    .sort((first, second) => {
      const firstDate = toDate(first.created_at)?.getTime() ?? 0;
      const secondDate = toDate(second.created_at)?.getTime() ?? 0;
      return secondDate - firstDate;
    })[0];
  const latestRecommendationAt =
    input.latest_recommendation_at ??
    latestIso(visibleRecommendations.map((item) => item.created_at));
  const latestScanAt = latestScan?.created_at
    ? toDate(latestScan.created_at)?.toISOString() ?? null
    : null;
  const latestObservableUpdateAt = latestIso([
    latestRecommendationAt,
    latestScanAt,
  ]);
  const dataAgeMinutes =
    latestObservableUpdateAt !== null
      ? minutesBetween(generatedDate, toDate(latestObservableUpdateAt) ?? generatedDate)
      : null;
  const knownCandidatesScanned = scanLogs
    .map((item) =>
      typeof item.candidates_scanned === "number" &&
      Number.isFinite(item.candidates_scanned)
        ? item.candidates_scanned
        : null,
    )
    .filter((value): value is number => value !== null);
  const totalScannedTickers =
    knownCandidatesScanned.length > 0
      ? knownCandidatesScanned.reduce((sum, value) => sum + value, 0)
      : null;
  const preMarketCandidates = scanLogs
    .map((item) =>
      Array.isArray(item.pre_market_candidates)
        ? item.pre_market_candidates.length
        : null,
    )
    .filter((value): value is number => value !== null);
  const totalRawCandidates =
    preMarketCandidates.length > 0
      ? preMarketCandidates.reduce((sum, value) => sum + value, 0)
      : null;
  const unknownMetrics: string[] = [];

  if (totalScannedTickers === null) {
    unknownMetrics.push("total scanned ticker count");
  }

  if (totalRawCandidates === null) {
    unknownMetrics.push("total raw candidates");
  }

  unknownMetrics.push("scan duration");

  const warnings: ScanPipelineObservabilityWarning[] = [];
  if (elevatedCandidateCount > 0) {
    warnings.push(
      warning(
        "elevated_candidates",
        "Elevated candidates",
        `${elevatedCandidateCount} visible recommendation candidate${
          elevatedCandidateCount === 1 ? "" : "s"
        } need intake review.`,
        "intake_quality",
      ),
    );
  }

  if (staleCandidateCount > 0) {
    warnings.push(
      warning(
        "stale_candidates",
        "Stale candidates",
        `${staleCandidateCount} candidate${
          staleCandidateCount === 1 ? "" : "s"
        } have stale data indicators.`,
        "intake_quality",
      ),
    );
  }

  if (duplicateTickerCount > 0) {
    warnings.push(
      warning(
        "duplicate_tickers",
        "Duplicate tickers",
        `${duplicateTickerCount} ticker${
          duplicateTickerCount === 1 ? "" : "s"
        } appear more than once in visible recommendations.`,
        "visible_recommendations",
      ),
    );
  }

  if (input.market_session?.risk_level === "high" || input.market_session?.risk_level === "critical") {
    warnings.push(
      warning(
        "market_session_elevated",
        "Market session elevated",
        "Market session risk is elevated.",
        "market_session",
      ),
    );
  }

  const status = determineStatus({
    visibleCount,
    staleCandidateCount,
    elevatedCandidateCount,
    incompleteDataCandidateCount,
    rejectedCount: intakeCounts.rejected,
    marketRisk: input.market_session?.risk_level ?? null,
    hasScanLogs: scanLogs.length > 0,
  });

  const metrics: ScanPipelineObservabilityMetric[] = [
    metric(
      "visible_recommendations",
      "Visible recommendations",
      visibleCount,
      formatNumber(visibleCount),
      "ok",
      "visible_recommendations",
    ),
    metric(
      "intake_accepted",
      "Intake accepted",
      intakeCounts.accepted,
      formatNumber(intakeCounts.accepted),
      "ok",
      "intake_quality",
    ),
    metric(
      "intake_needs_review",
      "Intake needs review",
      intakeCounts.needs_review,
      formatNumber(intakeCounts.needs_review),
      intakeCounts.needs_review > 0 ? "warning" : "ok",
      "intake_quality",
    ),
    metric(
      "intake_rejected",
      "Intake rejected",
      intakeCounts.rejected,
      formatNumber(intakeCounts.rejected),
      intakeCounts.rejected > 0 ? "blocked" : "ok",
      "intake_quality",
    ),
    metric(
      "intake_incomplete",
      "Intake incomplete",
      intakeCounts.incomplete,
      formatNumber(intakeCounts.incomplete),
      intakeCounts.incomplete > 0 ? "warning" : "ok",
      "intake_quality",
    ),
    metric(
      "accepted_rate",
      "Accepted rate",
      acceptedRate,
      formatPercent(acceptedRate),
      acceptedRate === null ? "unknown" : acceptedRate < 70 ? "warning" : "ok",
      "intake_quality",
    ),
    metric(
      "tickers_represented",
      "Tickers represented",
      tickersRepresented.length,
      tickersRepresented.length === 0 ? "—" : tickersRepresented.join(", "),
      tickersRepresented.length > 0 ? "ok" : "unknown",
      "visible_recommendations",
    ),
    metric(
      "duplicate_tickers",
      "Duplicate tickers",
      duplicateTickerCount,
      formatNumber(duplicateTickerCount),
      duplicateTickerCount > 0 ? "warning" : "ok",
      "visible_recommendations",
    ),
    metric(
      "stale_candidates",
      "Stale candidates",
      staleCandidateCount,
      formatNumber(staleCandidateCount),
      staleCandidateCount > 0 ? "warning" : "ok",
      "intake_quality",
    ),
    metric(
      "total_scanned_tickers",
      "Scanned tickers",
      totalScannedTickers,
      formatNumber(totalScannedTickers),
      totalScannedTickers === null ? "unknown" : "ok",
      "scan_logs",
      totalScannedTickers === null
        ? "Not present in available scan logs."
        : null,
    ),
    metric(
      "total_raw_candidates",
      "Raw candidates",
      totalRawCandidates,
      formatNumber(totalRawCandidates),
      totalRawCandidates === null ? "unknown" : "ok",
      "scan_logs",
      totalRawCandidates === null
        ? "Raw candidate count is not present in available scan logs."
        : null,
    ),
    metric(
      "scan_duration",
      "Scan duration",
      null,
      "Unknown",
      "unknown",
      "scan_logs",
      "Scan duration is not currently recorded.",
    ),
  ];

  const sourceStatuses: ScanPipelineObservabilitySourceStatus[] = [
    {
      source_id: "visible_recommendations",
      label: "Visible recommendations",
      status: visibleCount > 0 ? "available" : "partial",
      message:
        visibleCount > 0
          ? "Visible recommendation set is observable."
          : "No visible recommendations are currently observable.",
    },
    {
      source_id: "intake_quality",
      label: "Intake quality",
      status: input.intake_results.length > 0 ? "available" : "unknown",
      message:
        input.intake_results.length > 0
          ? "Action 101 intake quality results are available."
          : "No intake quality results are available.",
    },
    {
      source_id: "scan_logs",
      label: "Scan logs",
      status: scanLogs.length > 0 ? "partial" : "unavailable",
      message:
        scanLogs.length > 0
          ? "Scan logs are available, but not every pipeline metric is recorded yet."
          : "No scan logs are available for this summary.",
    },
    {
      source_id: "market_session",
      label: "Market session",
      status: input.market_session?.phase ? "available" : "unknown",
      message: input.market_session?.phase
        ? "Market session context is available."
        : "Market session context is unavailable.",
    },
  ];

  return {
    summary_id: `scan-pipeline-observability-${latestObservableUpdateAt ?? "unknown"}`,
    summary_version: "1.0",
    summary_kind: "scan_pipeline_observability",
    generated_at: generatedAt,
    status,
    visible_recommendation_count: visibleCount,
    intake_counts: intakeCounts,
    accepted_rate: acceptedRate,
    elevated_candidate_count: elevatedCandidateCount,
    duplicate_ticker_count: duplicateTickerCount,
    stale_candidate_count: staleCandidateCount,
    incomplete_data_candidate_count: incompleteDataCandidateCount,
    tickers_represented: tickersRepresented,
    top_reasons: topReasons,
    metrics,
    warnings,
    source_statuses: sourceStatuses,
    run_context: {
      latest_scan_at: latestScanAt,
      latest_scan_result: latestScan?.result ?? null,
      latest_scan_window: latestScan?.scan_window ?? null,
      latest_scan_source: latestScan?.source ?? null,
      latest_recommendation_at: latestRecommendationAt,
      latest_observable_update_at: latestObservableUpdateAt,
      data_age_minutes: dataAgeMinutes,
      market_session_phase: input.market_session?.phase ?? null,
      market_session_risk: input.market_session?.risk_level ?? null,
      market_session_source: input.market_session?.source ?? null,
    },
    unknown_metrics: unknownMetrics,
    summary: statusSummary(status),
  };
}

export function scanPipelineObservabilitySummaryJson(
  summary: ScanPipelineObservabilitySummary,
) {
  return JSON.stringify(summary, null, 2);
}
