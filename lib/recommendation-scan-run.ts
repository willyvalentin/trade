import type { DayTradeWindowRecommendationTargetSummary } from "@/lib/day-trade-window-recommendation-target";
import type { DataModeClaritySummary } from "@/lib/data-mode-clarity";
import {
  classifyDayTradeScanWindow,
  normalizeDayTradeScanWindow,
} from "@/lib/day-trade-scan-orchestration";
import type { ScanPipelineObservabilitySummary } from "@/lib/scan-pipeline-observability";

export type RecommendationScanRunStatus =
  | "completed"
  | "partial"
  | "degraded"
  | "stale"
  | "empty"
  | "failed"
  | "unknown";

export type RecommendationScanRunSource =
  | "supabase"
  | "local_storage"
  | "demo"
  | "dev_preview"
  | "mixed"
  | "unknown";

export type RecommendationScanRunWindow =
  | "morning"
  | "midday"
  | "power_hour"
  | "closed"
  | "outside_window"
  | "unknown";

export type RecommendationScanRunCounts = {
  visible_recommendation_count: number;
  accepted_count: number;
  needs_review_count: number;
  rejected_count: number;
  incomplete_count: number;
  strong_count: number;
  valid_count: number;
  experimental_count: number;
  rejected_tier_count: number;
  incomplete_tier_count: number;
  unknown_tier_count: number;
};

export type RecommendationScanRunProviderStatus = {
  source_id: string;
  label: string;
  status: "available" | "partial" | "unavailable" | "unknown";
  message: string;
};

export type RecommendationScanRunWarning = {
  warning_id: string;
  severity: "info" | "warning" | "critical";
  label: string;
  message: string;
  source: string;
};

export type RecommendationScanRunInput = {
  trading_date?: string | null;
  observed_at?: string | Date | null;
  started_at?: string | Date | null;
  completed_at?: string | Date | null;
  window?: RecommendationScanRunWindow | string | null;
  market_session_phase?: string | null;
  market_session_risk?: string | null;
  market_session_source?: string | null;
  source?: RecommendationScanRunSource | string | null;
  data_mode?: string | null;
  scan_observability?: ScanPipelineObservabilitySummary | null;
  day_trade_window_target?: DayTradeWindowRecommendationTargetSummary | null;
  data_mode_clarity?: DataModeClaritySummary | null;
  visible_recommendations?: Array<{
    id?: string | null;
    ticker?: string | null;
    created_at?: string | null;
    snapshot_fingerprint?: string | null;
  }>;
  scheduled_scan_run_id?: string | number | null;
  scanned_ticker_count?: number | null;
  raw_candidate_count?: number | null;
  scan_duration_ms?: number | null;
  payload?: Record<string, unknown>;
  created_at?: string | Date | null;
  updated_at?: string | Date | null;
};

export type RecommendationScanRun = {
  id: string;
  run_fingerprint: string;
  trading_date: string | null;
  window: RecommendationScanRunWindow;
  status: RecommendationScanRunStatus;
  source: string;
  observed_at: string;
  started_at: string | null;
  completed_at: string | null;
  market_session_phase: string | null;
  market_session_risk: string | null;
  market_session_source: string | null;
  data_mode: string;
  scan_observability_status: string;
  counts: RecommendationScanRunCounts;
  window_target_status: string;
  gap_to_target: number | null;
  overflow_above_target: number | null;
  tickers_represented: string[];
  ticker_count: number;
  duplicate_ticker_count: number | null;
  stale_candidate_count: number | null;
  incomplete_data_candidate_count: number | null;
  scanned_ticker_count: number | null;
  raw_candidate_count: number | null;
  scan_duration_ms: number | null;
  top_intake_reasons: Array<{
    reason_id: string;
    label: string;
    message: string;
    count: number;
  }>;
  warnings: RecommendationScanRunWarning[];
  provider_statuses: RecommendationScanRunProviderStatus[];
  unknown_metrics: string[];
  payload_json: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type RecommendationScanRunPersistenceResult = {
  status: "saved" | "duplicate" | "updated" | "failed";
  mode: "supabase" | "localStorage" | "none";
  scan_run: RecommendationScanRun;
  error: string | null;
};

export type RecommendationScanRunDeduplicationResult = {
  is_duplicate: boolean;
  run_fingerprint: string;
  existing_run_id: string | null;
};

export const recommendationScanRunLocalStorageKey =
  "trade-recommendation-scan-runs-v1";

const maxLocalScanRuns = 300;

function textOrNull(value: string | null | undefined) {
  const text = value?.trim() ?? "";
  return text.length > 0 ? text : null;
}

function finiteNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function toIso(value: string | Date | null | undefined) {
  if (value instanceof Date && Number.isFinite(value.getTime())) {
    return value.toISOString();
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const date = new Date(value);
    return Number.isFinite(date.getTime()) ? date.toISOString() : null;
  }

  return null;
}

function normalizeWindow(
  value: RecommendationScanRunInput["window"],
  input?: Pick<
    RecommendationScanRunInput,
    "observed_at" | "market_session_phase"
  > | null,
): RecommendationScanRunWindow {
  const normalized = normalizeDayTradeScanWindow(
    typeof value === "string" ? value : null,
  );

  if (normalized !== "unknown") return normalized;

  const phaseWindow = normalizeDayTradeScanWindow(
    input?.market_session_phase ?? null,
  );

  if (phaseWindow !== "unknown") return phaseWindow;

  if (input?.observed_at) {
    return classifyDayTradeScanWindow({ now: input.observed_at });
  }

  return "unknown";
}

function normalizeStatus(value: unknown): RecommendationScanRunStatus {
  if (
    value === "completed" ||
    value === "partial" ||
    value === "degraded" ||
    value === "stale" ||
    value === "empty" ||
    value === "failed" ||
    value === "unknown"
  ) {
    return value;
  }

  return "unknown";
}

function stableHash(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(36);
}

function normalizeTicker(value: string | null | undefined) {
  const ticker = value?.trim().toUpperCase() ?? "";
  return ticker.length > 0 ? ticker : null;
}

function numberMetric(
  summary: ScanPipelineObservabilitySummary | null | undefined,
  metricId: string,
) {
  const metric = summary?.metrics.find((item) => item.metric_id === metricId);
  return finiteNumber(metric?.value);
}

function recommendationSignature(
  input: NonNullable<RecommendationScanRunInput["visible_recommendations"]>[number],
) {
  return [
    textOrNull(input.snapshot_fingerprint) ?? "no-snapshot",
    textOrNull(input.id) ?? "no-id",
    normalizeTicker(input.ticker) ?? "UNKNOWN",
    toIso(input.created_at)?.slice(0, 19) ?? "unknown-created",
  ].join(":");
}

function statusFromInput(input: RecommendationScanRunInput) {
  const observabilityStatus = input.scan_observability?.status ?? "unknown";
  const latestResult = input.scan_observability?.run_context.latest_scan_result;
  const visibleCount = input.scan_observability?.visible_recommendation_count ?? 0;
  const targetStatus = input.day_trade_window_target?.status ?? "unknown";

  if (
    latestResult === "provider_error" ||
    latestResult === "openai_error" ||
    latestResult === "provider_rate_limited"
  ) {
    return "failed" as const;
  }

  if (observabilityStatus === "stale") {
    return "stale" as const;
  }

  if (observabilityStatus === "degraded") {
    return "degraded" as const;
  }

  if (visibleCount === 0 || targetStatus === "no_recommendations") {
    return "empty" as const;
  }

  if (observabilityStatus === "incomplete") {
    return "partial" as const;
  }

  if (observabilityStatus === "healthy") {
    return "completed" as const;
  }

  return "unknown" as const;
}

function warningFromObservability(
  warning: ScanPipelineObservabilitySummary["warnings"][number],
): RecommendationScanRunWarning {
  return {
    warning_id: `scan_observability:${warning.warning_id}`,
    severity: "warning",
    label: warning.label,
    message: warning.message,
    source: warning.source,
  };
}

function warningFromTarget(
  warning: DayTradeWindowRecommendationTargetSummary["warnings"][number],
): RecommendationScanRunWarning {
  return {
    warning_id: `window_target:${warning.warning_id}`,
    severity: warning.severity,
    label: warning.warning_id.replace(/_/g, " "),
    message: warning.message,
    source: "day_trade_window_target",
  };
}

function unknownMetricWarning(metric: string): RecommendationScanRunWarning {
  return {
    warning_id: `unknown_metric:${stableHash(metric)}`,
    severity: "info",
    label: "Unknown metric",
    message: `${metric} is unavailable for this scan run.`,
    source: "scan_pipeline_observability",
  };
}

export function buildRecommendationScanRunFingerprint(
  input: RecommendationScanRunInput,
) {
  const tradingDate =
    textOrNull(input.trading_date) ??
    toIso(input.observed_at)?.slice(0, 10) ??
    "unknown-date";
  const window = normalizeWindow(input.window, input);
  const latestScanAt =
    input.scan_observability?.run_context.latest_scan_at ??
    input.scan_observability?.run_context.latest_recommendation_at ??
    null;
  const timeAnchor = toIso(latestScanAt)?.slice(0, 19) ?? tradingDate;
  const recommendationSet = (input.visible_recommendations ?? [])
    .map(recommendationSignature)
    .sort()
    .join("|");
  const parts = [
    tradingDate,
    window,
    textOrNull(String(input.scheduled_scan_run_id ?? "")) ?? "no-scheduled-id",
    timeAnchor,
    input.scan_observability?.status ?? "unknown",
    input.day_trade_window_target?.status ?? "unknown",
    recommendationSet || "no-visible-recommendations",
  ];

  return `rec_scan_run_${stableHash(parts.join("|"))}`;
}

export function buildRecommendationScanRun(
  input: RecommendationScanRunInput,
): RecommendationScanRun {
  const observedAt = toIso(input.observed_at) ?? new Date().toISOString();
  const createdAt = toIso(input.created_at) ?? observedAt;
  const updatedAt = toIso(input.updated_at) ?? observedAt;
  const scanObservability = input.scan_observability ?? null;
  const targetSummary = input.day_trade_window_target ?? null;
  const currentWindowCount = targetSummary?.current_window_count ?? null;
  const visibleRecommendationCount =
    scanObservability?.visible_recommendation_count ??
    input.visible_recommendations?.length ??
    0;
  const tickersRepresented =
    scanObservability?.tickers_represented ??
    Array.from(
      new Set(
        (input.visible_recommendations ?? [])
          .map((recommendation) => normalizeTicker(recommendation.ticker))
          .filter((ticker): ticker is string => ticker !== null),
      ),
    ).sort();
  const warnings = [
    ...(scanObservability?.warnings.map(warningFromObservability) ?? []),
    ...(targetSummary?.warnings.map(warningFromTarget) ?? []),
    ...(scanObservability?.unknown_metrics.map(unknownMetricWarning) ?? []),
    ...(scanObservability?.source_statuses
      .filter(
        (source) =>
          source.status === "partial" ||
          source.status === "unavailable" ||
          source.status === "unknown",
      )
      .map((source) => ({
        warning_id: `provider_status:${source.source_id}`,
        severity:
          source.status === "unavailable" ? ("warning" as const) : ("info" as const),
        label: source.label,
        message: source.message,
        source: "provider_status",
      })) ?? []),
  ];
  const runFingerprint = buildRecommendationScanRunFingerprint(input);

  return {
    id: runFingerprint,
    run_fingerprint: runFingerprint,
    trading_date:
      textOrNull(input.trading_date) ?? toIso(input.observed_at)?.slice(0, 10) ?? null,
    window: normalizeWindow(input.window, input),
    status: statusFromInput(input),
    source: textOrNull(String(input.source ?? "")) ?? "unknown",
    observed_at: observedAt,
    started_at:
      toIso(input.started_at) ??
      toIso(scanObservability?.run_context.latest_scan_at) ??
      null,
    completed_at:
      toIso(input.completed_at) ??
      toIso(scanObservability?.run_context.latest_observable_update_at) ??
      null,
    market_session_phase:
      textOrNull(input.market_session_phase) ??
      textOrNull(scanObservability?.run_context.market_session_phase),
    market_session_risk:
      textOrNull(input.market_session_risk) ??
      textOrNull(scanObservability?.run_context.market_session_risk),
    market_session_source:
      textOrNull(input.market_session_source) ??
      textOrNull(scanObservability?.run_context.market_session_source),
    data_mode:
      textOrNull(input.data_mode) ??
      textOrNull(input.data_mode_clarity?.overall_mode) ??
      "unknown",
    scan_observability_status: scanObservability?.status ?? "unknown",
    counts: {
      visible_recommendation_count: visibleRecommendationCount,
      accepted_count: scanObservability?.intake_counts.accepted ?? 0,
      needs_review_count: scanObservability?.intake_counts.needs_review ?? 0,
      rejected_count: scanObservability?.intake_counts.rejected ?? 0,
      incomplete_count: scanObservability?.intake_counts.incomplete ?? 0,
      strong_count: currentWindowCount?.strong ?? 0,
      valid_count: currentWindowCount?.valid ?? 0,
      experimental_count: currentWindowCount?.experimental ?? 0,
      rejected_tier_count: currentWindowCount?.rejected ?? 0,
      incomplete_tier_count: currentWindowCount?.incomplete ?? 0,
      unknown_tier_count: currentWindowCount?.unknown ?? 0,
    },
    window_target_status: targetSummary?.status ?? "unknown",
    gap_to_target: targetSummary?.gap.gap_to_ideal_min ?? null,
    overflow_above_target: targetSummary?.gap.overflow_above_ideal_max ?? null,
    tickers_represented: tickersRepresented,
    ticker_count: tickersRepresented.length,
    duplicate_ticker_count: scanObservability?.duplicate_ticker_count ?? null,
    stale_candidate_count: scanObservability?.stale_candidate_count ?? null,
    incomplete_data_candidate_count:
      scanObservability?.incomplete_data_candidate_count ?? null,
    scanned_ticker_count:
      finiteNumber(input.scanned_ticker_count) ??
      numberMetric(scanObservability, "total_scanned_tickers"),
    raw_candidate_count:
      finiteNumber(input.raw_candidate_count) ??
      numberMetric(scanObservability, "total_raw_candidates"),
    scan_duration_ms: finiteNumber(input.scan_duration_ms),
    top_intake_reasons: scanObservability?.top_reasons ?? [],
    warnings,
    provider_statuses: scanObservability?.source_statuses ?? [],
    unknown_metrics: scanObservability?.unknown_metrics ?? [],
    payload_json: {
      ...(input.payload ?? {}),
      scheduled_scan_run_id: input.scheduled_scan_run_id ?? null,
      scan_observability: scanObservability,
      day_trade_window_target: targetSummary,
      data_mode_clarity: input.data_mode_clarity ?? null,
      visible_recommendations: input.visible_recommendations ?? [],
    },
    created_at: createdAt,
    updated_at: updatedAt,
  };
}

export function recommendationScanRunJson(scanRun: RecommendationScanRun) {
  return JSON.stringify(scanRun, null, 2);
}

export function recommendationScanRunsJson(scanRuns: RecommendationScanRun[]) {
  return JSON.stringify(
    {
      scan_run_count: scanRuns.length,
      scan_runs: scanRuns,
    },
    null,
    2,
  );
}

export function readRecommendationScanRunsFromLocalStorage(
  storage: Storage | undefined =
    typeof window === "undefined" ? undefined : window.localStorage,
) {
  if (!storage) {
    return [];
  }

  try {
    const parsed = JSON.parse(
      storage.getItem(recommendationScanRunLocalStorageKey) ?? "[]",
    );
    return Array.isArray(parsed) ? (parsed as RecommendationScanRun[]) : [];
  } catch {
    return [];
  }
}

function objectOrNull(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function stringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

export function recommendationScanRunFromPersistenceRow(
  row: Record<string, unknown>,
): RecommendationScanRun | null {
  const runFingerprint = textOrNull(String(row.run_fingerprint ?? row.id ?? ""));

  if (!runFingerprint) {
    return null;
  }

  const payloadJson = objectOrNull(row.payload_json) ?? {};
  const scanObservability = objectOrNull(payloadJson.scan_observability);
  const warnings = Array.isArray(row.warnings_json)
    ? (row.warnings_json as RecommendationScanRunWarning[])
    : [];
  const providerStatuses = Array.isArray(scanObservability?.source_statuses)
    ? (scanObservability.source_statuses as RecommendationScanRunProviderStatus[])
    : [];
  const topIntakeReasons = Array.isArray(scanObservability?.top_reasons)
    ? (scanObservability.top_reasons as RecommendationScanRun["top_intake_reasons"])
    : [];

  return {
    id: textOrNull(String(row.id ?? "")) ?? runFingerprint,
    run_fingerprint: runFingerprint,
    trading_date: textOrNull(String(row.trading_date ?? "")),
    window: normalizeWindow(String(row.window ?? "unknown"), {
      observed_at:
        typeof row.observed_at === "string" ? row.observed_at : null,
      market_session_phase:
        typeof row.market_session_phase === "string"
          ? row.market_session_phase
          : null,
    }),
    status: normalizeStatus(row.status),
    source:
      textOrNull(String(payloadJson.source ?? payloadJson.scan_source ?? "")) ??
      "unknown",
    observed_at:
      toIso(String(row.observed_at ?? "")) ??
      toIso(String(row.created_at ?? "")) ??
      new Date().toISOString(),
    started_at: toIso(String(row.started_at ?? "")),
    completed_at: toIso(String(row.completed_at ?? "")),
    market_session_phase: textOrNull(String(row.market_session_phase ?? "")),
    market_session_risk:
      textOrNull(String(payloadJson.market_session_risk ?? "")) ?? null,
    market_session_source:
      textOrNull(String(payloadJson.market_session_source ?? "")) ?? null,
    data_mode: textOrNull(String(row.data_mode ?? "")) ?? "unknown",
    scan_observability_status:
      textOrNull(String(row.scan_observability_status ?? "")) ?? "unknown",
    counts: {
      visible_recommendation_count:
        finiteNumber(row.visible_recommendation_count) ?? 0,
      accepted_count: finiteNumber(row.accepted_count) ?? 0,
      needs_review_count: finiteNumber(row.needs_review_count) ?? 0,
      rejected_count: finiteNumber(row.rejected_count) ?? 0,
      incomplete_count: finiteNumber(row.incomplete_count) ?? 0,
      strong_count: finiteNumber(row.strong_count) ?? 0,
      valid_count: finiteNumber(row.valid_count) ?? 0,
      experimental_count: finiteNumber(row.experimental_count) ?? 0,
      rejected_tier_count: finiteNumber(row.rejected_tier_count) ?? 0,
      incomplete_tier_count: finiteNumber(row.incomplete_tier_count) ?? 0,
      unknown_tier_count: finiteNumber(row.unknown_tier_count) ?? 0,
    },
    window_target_status:
      textOrNull(String(row.window_target_status ?? "")) ?? "unknown",
    gap_to_target: finiteNumber(row.gap_to_target),
    overflow_above_target: finiteNumber(row.overflow_above_target),
    tickers_represented: stringArray(
      (scanObservability?.tickers_represented ??
        payloadJson.tickers_represented) as unknown,
    ),
    ticker_count: finiteNumber(row.ticker_count) ?? 0,
    duplicate_ticker_count: finiteNumber(row.duplicate_ticker_count),
    stale_candidate_count: finiteNumber(row.stale_candidate_count),
    incomplete_data_candidate_count: finiteNumber(
      row.incomplete_data_candidate_count,
    ),
    scanned_ticker_count: finiteNumber(row.scanned_ticker_count),
    raw_candidate_count: finiteNumber(row.raw_candidate_count),
    scan_duration_ms: finiteNumber(row.scan_duration_ms),
    top_intake_reasons: topIntakeReasons,
    warnings,
    provider_statuses: providerStatuses,
    unknown_metrics: stringArray(scanObservability?.unknown_metrics),
    payload_json: payloadJson,
    created_at:
      toIso(String(row.created_at ?? "")) ??
      toIso(String(row.observed_at ?? "")) ??
      new Date().toISOString(),
    updated_at:
      toIso(String(row.updated_at ?? "")) ??
      toIso(String(row.observed_at ?? "")) ??
      new Date().toISOString(),
  };
}

export function checkRecommendationScanRunDeduplication(
  scanRun: RecommendationScanRun,
  existingScanRuns: RecommendationScanRun[],
): RecommendationScanRunDeduplicationResult {
  const existingRun = existingScanRuns.find(
    (item) => item.run_fingerprint === scanRun.run_fingerprint,
  );

  return {
    is_duplicate: existingRun !== undefined,
    run_fingerprint: scanRun.run_fingerprint,
    existing_run_id: existingRun?.id ?? null,
  };
}

export function persistRecommendationScanRunToLocalStorage(
  scanRun: RecommendationScanRun,
  storage: Storage | undefined =
    typeof window === "undefined" ? undefined : window.localStorage,
): RecommendationScanRunPersistenceResult {
  if (!storage) {
    return {
      status: "failed",
      mode: "none",
      scan_run: scanRun,
      error: "localStorage is unavailable.",
    };
  }

  try {
    const existingScanRuns = readRecommendationScanRunsFromLocalStorage(storage);
    const deduplication = checkRecommendationScanRunDeduplication(
      scanRun,
      existingScanRuns,
    );

    if (deduplication.is_duplicate) {
      return {
        status: "duplicate",
        mode: "localStorage",
        scan_run: scanRun,
        error: null,
      };
    }

    storage.setItem(
      recommendationScanRunLocalStorageKey,
      JSON.stringify([scanRun, ...existingScanRuns].slice(0, maxLocalScanRuns)),
    );

    return {
      status: "saved",
      mode: "localStorage",
      scan_run: scanRun,
      error: null,
    };
  } catch (error) {
    return {
      status: "failed",
      mode: "localStorage",
      scan_run: scanRun,
      error: error instanceof Error ? error.message : "Unknown localStorage error.",
    };
  }
}
