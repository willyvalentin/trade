import type {
  DayTradeScanOrchestrationSummary,
} from "@/lib/day-trade-scan-orchestration";
import type { DailyRecommendationTradeTargetsSummary } from "@/lib/daily-recommendation-trade-targets";
import type { RecommendationScanRun } from "@/lib/recommendation-scan-run";
import type { RecommendationSnapshot } from "@/lib/recommendation-snapshot";
import type { ScannerCandidateRankingSummary } from "@/lib/scanner-candidate-ranking";

export type RecommendationServingCadenceStatus =
  | "ready"
  | "waiting"
  | "published"
  | "refreshing_silently"
  | "opportunistic_update_available"
  | "no_trade_valid"
  | "market_closed"
  | "blocked"
  | "unknown";

export type RecommendationBatchWindow =
  | "morning"
  | "midday"
  | "power_hour"
  | "outside_window"
  | "closed"
  | "unknown";

export type RecommendationBatchType =
  | "official"
  | "opportunistic"
  | "diagnostic"
  | "fallback"
  | "unknown";

export type RecommendationBatchStatus =
  | "not_started"
  | "ready_to_publish"
  | "published"
  | "stale"
  | "expired"
  | "replaced"
  | "no_trade_valid"
  | "blocked"
  | "unknown";

export type RecommendationServingDecision =
  | "publish_official_batch"
  | "keep_existing_batch"
  | "refresh_silently"
  | "opportunistic_update"
  | "expire_stale_recommendations"
  | "wait_for_next_window"
  | "market_closed"
  | "insufficient_quality"
  | "unknown";

export type RecommendationFreshnessStatus =
  | "fresh"
  | "aging"
  | "stale"
  | "expired"
  | "unknown";

export type RecommendationReplacementReason =
  | "higher_ranked_candidate"
  | "current_recommendation_stale"
  | "current_recommendation_invalid"
  | "market_session_changed"
  | "provider_data_changed"
  | "target_entry_no_longer_relevant"
  | "none";

export type RecommendationServingWarning = {
  warning_id: string;
  severity: "info" | "warning" | "critical";
  message: string;
};

export type RecommendationServingCadenceSummary = {
  summary_id: string;
  summary_version: "1.0";
  summary_kind: "recommendation_serving_cadence";
  generated_at: string;
  trading_date: string;
  status: RecommendationServingCadenceStatus;
  serving_window: RecommendationBatchWindow;
  batch_type: RecommendationBatchType;
  batch_status: RecommendationBatchStatus;
  serving_decision: RecommendationServingDecision;
  latest_official_batch_id: string | null;
  latest_official_batch_published_at: string | null;
  served_at: string | null;
  batch_target: {
    min: number;
    max: number;
  };
  visible_recommendation_count: number;
  ranking_selected_count: number | null;
  freshness_status: RecommendationFreshnessStatus;
  oldest_visible_recommendation_age_minutes: number | null;
  newest_visible_recommendation_age_minutes: number | null;
  replacement_reason: RecommendationReplacementReason;
  next_window: RecommendationBatchWindow;
  next_window_starts_at: string | null;
  background_scan_cadence_minutes: {
    min: number;
    max: number;
  };
  background_scan_note: string;
  no_trade_valid: boolean;
  warnings: RecommendationServingWarning[];
  copy: {
    intentional_publishing: string;
    no_trade_valid: string;
    expiry: string;
  };
};

export type RecommendationServingCadenceInput = {
  tradingDate: string;
  orchestration?: DayTradeScanOrchestrationSummary | null;
  dailyTargets?: DailyRecommendationTradeTargetsSummary | null;
  ranking?: ScannerCandidateRankingSummary | null;
  visibleRecommendations?: Array<{
    id?: string | null;
    ticker?: string | null;
    created_at?: string | Date | null;
    expires_at?: string | Date | null;
    status?: string | null;
  }>;
  scanRuns?: RecommendationScanRun[];
  snapshots?: RecommendationSnapshot[];
  scanRunFingerprint?: string | null;
  now?: Date | string | null;
};

export function buildRecommendationServingCadenceSummary(
  input: RecommendationServingCadenceInput,
): RecommendationServingCadenceSummary {
  const now = toDate(input.now) ?? new Date();
  const orchestration = input.orchestration ?? null;
  const servingWindow = normalizeBatchWindow(
    orchestration?.active_window ?? "unknown",
  );
  const visibleRecommendations = input.visibleRecommendations ?? [];
  const visibleCount = visibleRecommendations.length;
  const rankingSelectedCount = input.ranking?.selected_count ?? null;
  const batchTarget = getBatchTarget(servingWindow, input.dailyTargets);
  const latestPublishedAt = latestRecommendationCreatedAt(visibleRecommendations);
  const ageSummary = getVisibleRecommendationAgeSummary(
    visibleRecommendations,
    now,
    servingWindow,
  );
  const freshnessStatus = determineFreshnessStatus(ageSummary.oldestAgeMinutes);
  const noTradeValid =
    visibleCount === 0 &&
    servingWindowIsActive(servingWindow) &&
    (input.ranking?.target_status === "empty" ||
      input.ranking?.target_status === "below_target" ||
      (rankingSelectedCount ?? 0) === 0);
  const batchStatus = determineBatchStatus({
    servingWindow,
    visibleCount,
    freshnessStatus,
    noTradeValid,
    orchestration,
  });
  const servingDecision = determineServingDecision({
    servingWindow,
    visibleCount,
    freshnessStatus,
    noTradeValid,
    rankingSelectedCount,
    batchTarget,
    orchestration,
  });
  const replacementReason = determineReplacementReason({
    freshnessStatus,
    servingDecision,
    rankingSelectedCount,
    visibleCount,
  });
  const batchType = determineBatchType(servingDecision, visibleCount);
  const batchId =
    visibleCount > 0 && servingWindowIsActive(servingWindow)
      ? buildBatchId({
          tradingDate: input.tradingDate,
          window: servingWindow,
          batchType,
          publishedAt: latestPublishedAt,
          scanRunFingerprint: input.scanRunFingerprint,
        })
      : null;
  const warnings = buildWarnings({
    servingWindow,
    visibleCount,
    freshnessStatus,
    noTradeValid,
    rankingSelectedCount,
    batchTarget,
  });

  return {
    summary_id: `recommendation_serving_cadence:${input.tradingDate}:${servingWindow}`,
    summary_version: "1.0",
    summary_kind: "recommendation_serving_cadence",
    generated_at: now.toISOString(),
    trading_date: input.tradingDate,
    status: determineStatus(servingDecision, batchStatus),
    serving_window: servingWindow,
    batch_type: batchType,
    batch_status: batchStatus,
    serving_decision: servingDecision,
    latest_official_batch_id: batchId,
    latest_official_batch_published_at: latestPublishedAt,
    served_at: visibleCount > 0 ? latestPublishedAt : null,
    batch_target: batchTarget,
    visible_recommendation_count: visibleCount,
    ranking_selected_count: rankingSelectedCount,
    freshness_status: freshnessStatus,
    oldest_visible_recommendation_age_minutes: ageSummary.oldestAgeMinutes,
    newest_visible_recommendation_age_minutes: ageSummary.newestAgeMinutes,
    replacement_reason: replacementReason,
    next_window: normalizeBatchWindow(orchestration?.next_window ?? "unknown"),
    next_window_starts_at: orchestration?.next_window_starts_at ?? null,
    background_scan_cadence_minutes: { min: 15, max: 30 },
    background_scan_note:
      "Background scans may refresh diagnostics every 15-30 minutes during active regular-session windows, but visible recommendations are served as intentional batches.",
    no_trade_valid: noTradeValid,
    warnings,
    copy: {
      intentional_publishing:
        "Ture scans in the background but only publishes recommendations intentionally.",
      no_trade_valid:
        "A no-trade batch can be valid when quality is insufficient.",
      expiry:
        "Recommendations can expire when market context changes.",
    },
  };
}

export function recommendationServingCadenceSummaryJson(
  summary: RecommendationServingCadenceSummary,
) {
  return JSON.stringify(summary, null, 2);
}

function normalizeBatchWindow(value: string | null | undefined): RecommendationBatchWindow {
  if (value === "morning" || value === "opening" || value === "morning_momentum") {
    return "morning";
  }

  if (value === "midday" || value === "afternoon") return "midday";
  if (value === "power_hour") return "power_hour";
  if (value === "outside_window" || value === "pre_market") return "outside_window";
  if (value === "closed") return "closed";
  return "unknown";
}

function servingWindowIsActive(
  value: RecommendationBatchWindow,
): value is "morning" | "midday" | "power_hour" {
  return (
    value === "morning" || value === "midday" || value === "power_hour"
  );
}

function getBatchTarget(
  window: RecommendationBatchWindow,
  dailyTargets?: DailyRecommendationTradeTargetsSummary | null,
) {
  if (window === "midday") {
    return { min: 3, max: 8 };
  }

  if (window === "morning" || window === "power_hour") {
    return {
      min: dailyTargets?.per_window_target_min ?? 6,
      max: dailyTargets?.per_window_target_max ?? 10,
    };
  }

  return { min: 0, max: 0 };
}

function determineFreshnessStatus(
  oldestAgeMinutes: number | null,
): RecommendationFreshnessStatus {
  if (oldestAgeMinutes === null) return "unknown";
  if (oldestAgeMinutes <= 30) return "fresh";
  if (oldestAgeMinutes <= 60) return "aging";
  if (oldestAgeMinutes <= 90) return "stale";
  return "expired";
}

function determineBatchStatus(input: {
  servingWindow: RecommendationBatchWindow;
  visibleCount: number;
  freshnessStatus: RecommendationFreshnessStatus;
  noTradeValid: boolean;
  orchestration: DayTradeScanOrchestrationSummary | null;
}): RecommendationBatchStatus {
  if (input.servingWindow === "closed") return "blocked";
  if (!servingWindowIsActive(input.servingWindow)) return "not_started";
  if (input.noTradeValid) return "no_trade_valid";
  if (input.visibleCount === 0 && input.orchestration?.should_scan_now) {
    return "ready_to_publish";
  }
  if (input.visibleCount === 0) return "not_started";
  if (input.freshnessStatus === "expired") return "expired";
  if (input.freshnessStatus === "stale") return "stale";
  return "published";
}

function determineServingDecision(input: {
  servingWindow: RecommendationBatchWindow;
  visibleCount: number;
  freshnessStatus: RecommendationFreshnessStatus;
  noTradeValid: boolean;
  rankingSelectedCount: number | null;
  batchTarget: { min: number; max: number };
  orchestration: DayTradeScanOrchestrationSummary | null;
}): RecommendationServingDecision {
  if (input.servingWindow === "closed") return "market_closed";
  if (!servingWindowIsActive(input.servingWindow)) return "wait_for_next_window";
  if (input.noTradeValid) return "insufficient_quality";
  if (input.freshnessStatus === "expired") return "expire_stale_recommendations";

  if (input.visibleCount === 0) {
    if ((input.rankingSelectedCount ?? 0) >= input.batchTarget.min) {
      return "publish_official_batch";
    }

    return input.orchestration?.should_scan_now
      ? "refresh_silently"
      : "wait_for_next_window";
  }

  if (
    input.freshnessStatus === "stale" &&
    (input.rankingSelectedCount ?? 0) > input.visibleCount
  ) {
    return "opportunistic_update";
  }

  if (input.freshnessStatus === "stale" || input.freshnessStatus === "aging") {
    return "refresh_silently";
  }

  return "keep_existing_batch";
}

function determineStatus(
  decision: RecommendationServingDecision,
  batchStatus: RecommendationBatchStatus,
): RecommendationServingCadenceStatus {
  if (decision === "market_closed") return "market_closed";
  if (decision === "publish_official_batch") return "ready";
  if (decision === "refresh_silently") return "refreshing_silently";
  if (decision === "opportunistic_update") return "opportunistic_update_available";
  if (decision === "insufficient_quality" || batchStatus === "no_trade_valid") {
    return "no_trade_valid";
  }
  if (decision === "keep_existing_batch") return "published";
  if (decision === "wait_for_next_window") return "waiting";
  if (decision === "expire_stale_recommendations") return "blocked";
  return "unknown";
}

function determineBatchType(
  decision: RecommendationServingDecision,
  visibleCount: number,
): RecommendationBatchType {
  if (decision === "opportunistic_update") return "opportunistic";
  if (visibleCount > 0) return "official";
  if (decision === "insufficient_quality") return "diagnostic";
  if (decision === "refresh_silently") return "diagnostic";
  return "unknown";
}

function determineReplacementReason(input: {
  freshnessStatus: RecommendationFreshnessStatus;
  servingDecision: RecommendationServingDecision;
  rankingSelectedCount: number | null;
  visibleCount: number;
}): RecommendationReplacementReason {
  if (
    input.servingDecision === "opportunistic_update" &&
    (input.rankingSelectedCount ?? 0) > input.visibleCount
  ) {
    return "higher_ranked_candidate";
  }

  if (
    input.freshnessStatus === "stale" ||
    input.freshnessStatus === "expired"
  ) {
    return "current_recommendation_stale";
  }

  return "none";
}

function buildWarnings(input: {
  servingWindow: RecommendationBatchWindow;
  visibleCount: number;
  freshnessStatus: RecommendationFreshnessStatus;
  noTradeValid: boolean;
  rankingSelectedCount: number | null;
  batchTarget: { min: number; max: number };
}) {
  const warnings: RecommendationServingWarning[] = [];

  if (input.noTradeValid) {
    warnings.push(
      warning(
        "no_trade_valid",
        "info",
        "No official batch should be forced while ranked candidate quality is insufficient.",
      ),
    );
  }

  if (
    servingWindowIsActive(input.servingWindow) &&
    input.visibleCount > 0 &&
    input.visibleCount < input.batchTarget.min
  ) {
    warnings.push(
      warning(
        "official_batch_below_target",
        "info",
        "Visible official batch is below the target range; keep quality ahead of count.",
      ),
    );
  }

  if (
    input.freshnessStatus === "stale" ||
    input.freshnessStatus === "expired"
  ) {
    warnings.push(
      warning(
        "batch_freshness_expiring",
        "warning",
        "Visible recommendations are stale or expired for the current cadence.",
      ),
    );
  }

  if (
    servingWindowIsActive(input.servingWindow) &&
    input.visibleCount === 0 &&
    (input.rankingSelectedCount ?? 0) >= input.batchTarget.min
  ) {
    warnings.push(
      warning(
        "batch_ready_to_publish",
        "info",
        "Ranking indicates enough candidates for an official batch, subject to existing generation flow.",
      ),
    );
  }

  return warnings;
}

function warning(
  warning_id: string,
  severity: RecommendationServingWarning["severity"],
  message: string,
): RecommendationServingWarning {
  return { warning_id, severity, message };
}

function latestRecommendationCreatedAt(
  recommendations: NonNullable<
    RecommendationServingCadenceInput["visibleRecommendations"]
  >,
) {
  return recommendations
    .map((recommendation) => toIso(recommendation.created_at))
    .filter((value): value is string => value !== null)
    .sort((first, second) => second.localeCompare(first))[0] ?? null;
}

function getVisibleRecommendationAgeSummary(
  recommendations: NonNullable<
    RecommendationServingCadenceInput["visibleRecommendations"]
  >,
  now: Date,
  servingWindow: RecommendationBatchWindow,
) {
  if (recommendations.length === 0 || !servingWindowIsActive(servingWindow)) {
    return { oldestAgeMinutes: null, newestAgeMinutes: null };
  }

  const ages = recommendations
    .map((recommendation) => toIso(recommendation.created_at))
    .map((value) => {
      if (!value) return null;
      const timestamp = new Date(value).getTime();
      return Number.isFinite(timestamp)
        ? Math.max(0, Math.round((now.getTime() - timestamp) / 60000))
        : null;
    })
    .filter((value): value is number => value !== null);

  if (ages.length === 0) {
    return { oldestAgeMinutes: null, newestAgeMinutes: null };
  }

  return {
    oldestAgeMinutes: Math.max(...ages),
    newestAgeMinutes: Math.min(...ages),
  };
}

function buildBatchId(input: {
  tradingDate: string;
  window: RecommendationBatchWindow;
  batchType: RecommendationBatchType;
  publishedAt: string | null;
  scanRunFingerprint?: string | null;
}) {
  const parts = [
    input.tradingDate,
    input.window,
    input.batchType,
    input.publishedAt?.slice(0, 19) ?? "unpublished",
    input.scanRunFingerprint ?? "no-scan-run",
  ];

  return `rec_batch_${stableHash(parts.join("|"))}`;
}

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

function stableHash(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(36);
}
