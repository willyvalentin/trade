import type {
  RecommendationIntakeQualityResult,
  RecommendationIntakeQualityStatus,
} from "@/lib/recommendation-intake-quality";
import type {
  ScanPipelineObservabilityStatus,
  ScanPipelineObservabilitySummary,
} from "@/lib/scan-pipeline-observability";

export type DayTradeWindowRecommendationTargetStatus =
  | "below_target"
  | "within_target"
  | "above_target"
  | "no_recommendations"
  | "unknown";

export type DayTradeWindowRecommendationTier =
  | "strong"
  | "valid"
  | "experimental"
  | "rejected"
  | "incomplete"
  | "unknown";

export type DayTradeWindowRecommendationWindow =
  | "morning"
  | "midday"
  | "power_hour"
  | "unknown";

export type DayTradeWindowRecommendationCount = {
  window: DayTradeWindowRecommendationWindow;
  total: number;
  strong: number;
  valid: number;
  experimental: number;
  rejected: number;
  incomplete: number;
  unknown: number;
  target_status: DayTradeWindowRecommendationTargetStatus;
  gap_to_ideal_min: number;
  overflow_above_ideal_max: number;
};

export type DayTradeWindowRecommendationGap = {
  ideal_min: number;
  ideal_max: number;
  strong_min: number;
  strong_max: number;
  valid_min: number;
  valid_max: number;
  current_count: number;
  gap_to_ideal_min: number;
  overflow_above_ideal_max: number;
};

export type DayTradeWindowRecommendationWarning = {
  warning_id: string;
  severity: "info" | "warning";
  message: string;
};

export type DayTradeWindowRecommendationTargetItem = {
  recommendation_id: string | null;
  ticker: string | null;
  window: DayTradeWindowRecommendationWindow;
  tier: DayTradeWindowRecommendationTier;
  confidence: number | null;
  intake_status: RecommendationIntakeQualityStatus | "unknown";
  has_complete_plan: boolean;
  reasons: string[];
};

export type DayTradeWindowRecommendationTargetSummary = {
  summary_id: string;
  summary_version: "1.0";
  generated_at: string;
  current_window: DayTradeWindowRecommendationWindow;
  status: DayTradeWindowRecommendationTargetStatus;
  ideal_min: number;
  ideal_max: number;
  strong_target_min: number;
  strong_target_max: number;
  valid_target_min: number;
  valid_target_max: number;
  experimental_target_note: string;
  total_recommendations: number;
  current_window_count: DayTradeWindowRecommendationCount;
  counts_by_window: DayTradeWindowRecommendationCount[];
  gap: DayTradeWindowRecommendationGap;
  enough_learning_samples: boolean;
  scan_status: ScanPipelineObservabilityStatus | "unknown";
  warnings: DayTradeWindowRecommendationWarning[];
  items: DayTradeWindowRecommendationTargetItem[];
  copy: {
    purpose: string;
    experimental: string;
    disclaimer: string;
  };
};

export type DayTradeWindowRecommendationTargetInput = {
  recommendations: Array<{
    id?: string | null;
    ticker?: string | null;
    scan_window?: string | null;
    confidence_score?: number | null;
    entry?: number | null;
    entry_low?: number | null;
    entry_high?: number | null;
    stop?: number | null;
    target?: number | null;
    freshness?: string | null;
    data_mode?: string | null;
    source_mode?: string | null;
  }>;
  intake_results?: RecommendationIntakeQualityResult[];
  scan_observability?: ScanPipelineObservabilitySummary | null;
  current_window?: string | null;
  now?: Date | string | null;
};

const idealMin = 6;
const idealMax = 10;
const strongTargetMin = 1;
const strongTargetMax = 3;
const validTargetMin = 3;
const validTargetMax = 6;

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

function finiteNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function normalizeWindow(
  value: string | null | undefined,
): DayTradeWindowRecommendationWindow {
  if (value === "opening" || value === "morning_momentum" || value === "morning") {
    return "morning";
  }

  if (value === "midday" || value === "afternoon") {
    return "midday";
  }

  if (value === "power_hour") {
    return "power_hour";
  }

  return "unknown";
}

function targetStatus(count: number): DayTradeWindowRecommendationTargetStatus {
  if (count <= 0) {
    return "no_recommendations";
  }

  if (count < idealMin) {
    return "below_target";
  }

  if (count > idealMax) {
    return "above_target";
  }

  return "within_target";
}

function hasCompletePlan(input: DayTradeWindowRecommendationTargetInput["recommendations"][number]) {
  const entry =
    finiteNumber(input.entry) ??
    finiteNumber(input.entry_high) ??
    finiteNumber(input.entry_low);
  const stop = finiteNumber(input.stop);
  const target = finiteNumber(input.target);

  return entry !== null && stop !== null && target !== null;
}

function warning(
  warning_id: string,
  message: string,
  severity: DayTradeWindowRecommendationWarning["severity"] = "warning",
): DayTradeWindowRecommendationWarning {
  return {
    warning_id,
    message,
    severity,
  };
}

function classifyTier({
  recommendation,
  intake,
}: {
  recommendation: DayTradeWindowRecommendationTargetInput["recommendations"][number];
  intake: RecommendationIntakeQualityResult | null;
}): {
  tier: DayTradeWindowRecommendationTier;
  reasons: string[];
  has_complete_plan: boolean;
} {
  const confidence = finiteNumber(recommendation.confidence_score);
  const completePlan = hasCompletePlan(recommendation);
  const freshness = recommendation.freshness ?? "unknown";
  const intakeStatus = intake?.status ?? "unknown";
  const hasBlockers = (intake?.blockers.length ?? 0) > 0;
  const hasStaleFreshness = freshness === "stale" || freshness === "expired";
  const reasons: string[] = [];

  if (!completePlan) {
    reasons.push("Missing entry, stop, or target.");
    return { tier: "incomplete", reasons, has_complete_plan: false };
  }

  if (intakeStatus === "rejected" || hasBlockers) {
    reasons.push("Intake quality rejected or contains critical blockers.");
    return { tier: "rejected", reasons, has_complete_plan: true };
  }

  if (intakeStatus === "incomplete") {
    reasons.push("Intake quality is incomplete.");
    return { tier: "incomplete", reasons, has_complete_plan: true };
  }

  if (confidence === null && intakeStatus === "unknown") {
    reasons.push("Confidence and intake quality are unavailable.");
    return { tier: "unknown", reasons, has_complete_plan: true };
  }

  if (hasStaleFreshness) {
    reasons.push("Market data freshness is degraded.");
  }

  if (
    intakeStatus === "accepted" &&
    confidence !== null &&
    confidence >= 80 &&
    !hasStaleFreshness
  ) {
    reasons.push("Accepted intake, high confidence, and complete price plan.");
    return { tier: "strong", reasons, has_complete_plan: true };
  }

  if (
    (intakeStatus === "accepted" || intakeStatus === "needs_review") &&
    (confidence === null || confidence >= 60) &&
    !hasBlockers
  ) {
    reasons.push("Usable recommendation with medium-or-better confidence.");
    return { tier: "valid", reasons, has_complete_plan: true };
  }

  if (intakeStatus === "needs_review" || (confidence !== null && confidence < 60)) {
    reasons.push("Lower-confidence learning candidate.");
    return { tier: "experimental", reasons, has_complete_plan: true };
  }

  reasons.push("Insufficient tier classification data.");
  return { tier: "unknown", reasons, has_complete_plan: true };
}

function emptyCount(window: DayTradeWindowRecommendationWindow): DayTradeWindowRecommendationCount {
  return {
    window,
    total: 0,
    strong: 0,
    valid: 0,
    experimental: 0,
    rejected: 0,
    incomplete: 0,
    unknown: 0,
    target_status: "no_recommendations",
    gap_to_ideal_min: idealMin,
    overflow_above_ideal_max: 0,
  };
}

function buildCount(
  window: DayTradeWindowRecommendationWindow,
  items: DayTradeWindowRecommendationTargetItem[],
): DayTradeWindowRecommendationCount {
  const total = items.length;

  return {
    window,
    total,
    strong: items.filter((item) => item.tier === "strong").length,
    valid: items.filter((item) => item.tier === "valid").length,
    experimental: items.filter((item) => item.tier === "experimental").length,
    rejected: items.filter((item) => item.tier === "rejected").length,
    incomplete: items.filter((item) => item.tier === "incomplete").length,
    unknown: items.filter((item) => item.tier === "unknown").length,
    target_status: targetStatus(total),
    gap_to_ideal_min: Math.max(0, idealMin - total),
    overflow_above_ideal_max: Math.max(0, total - idealMax),
  };
}

export function buildDayTradeWindowRecommendationTargetSummary(
  input: DayTradeWindowRecommendationTargetInput,
): DayTradeWindowRecommendationTargetSummary {
  const now = toDate(input.now ?? null) ?? new Date();
  const currentWindow = normalizeWindow(input.current_window);
  const intakeByRecommendationId = new Map(
    (input.intake_results ?? []).map((result) => [
      result.recommendation_id,
      result,
    ]),
  );
  const items: DayTradeWindowRecommendationTargetItem[] =
    input.recommendations.map((recommendation) => {
    const intake =
      recommendation.id === null || recommendation.id === undefined
        ? null
        : intakeByRecommendationId.get(recommendation.id) ?? null;
    const classification = classifyTier({ recommendation, intake });
    const intakeStatus: RecommendationIntakeQualityStatus | "unknown" =
      intake?.status ?? "unknown";

    return {
      recommendation_id: recommendation.id ?? null,
      ticker: recommendation.ticker ?? null,
      window: normalizeWindow(recommendation.scan_window ?? input.current_window),
      tier: classification.tier,
      confidence: finiteNumber(recommendation.confidence_score),
      intake_status: intakeStatus,
      has_complete_plan: classification.has_complete_plan,
      reasons: classification.reasons,
    };
  });
  const windows: DayTradeWindowRecommendationWindow[] = [
    "morning",
    "midday",
    "power_hour",
    "unknown",
  ];
  const countsByWindow = windows.map((window) =>
    buildCount(
      window,
      items.filter((item) => item.window === window),
    ),
  );
  const currentWindowCount =
    countsByWindow.find((count) => count.window === currentWindow) ??
    emptyCount(currentWindow);
  const warnings: DayTradeWindowRecommendationWarning[] = [];
  const total = currentWindowCount.total;
  const rejectedIncomplete =
    currentWindowCount.rejected + currentWindowCount.incomplete;
  const nonRejectedCurrent = total - currentWindowCount.rejected;
  const experimentalShare =
    nonRejectedCurrent > 0
      ? currentWindowCount.experimental / nonRejectedCurrent
      : 0;

  if (currentWindowCount.target_status === "below_target") {
    warnings.push(
      warning(
        "too_few_recommendations_for_learning",
        `Current window is ${currentWindowCount.gap_to_ideal_min} recommendation${currentWindowCount.gap_to_ideal_min === 1 ? "" : "s"} below the 6-10 learning sample target.`,
      ),
    );
  }

  if (currentWindowCount.target_status === "above_target") {
    warnings.push(
      warning(
        "above_window_target",
        `Current window is ${currentWindowCount.overflow_above_ideal_max} recommendation${currentWindowCount.overflow_above_ideal_max === 1 ? "" : "s"} above the calm 6-10 target.`,
        "info",
      ),
    );
  }

  if (total > 0 && rejectedIncomplete / total >= 0.4) {
    warnings.push(
      warning(
        "many_rejected_or_incomplete",
        "Many visible recommendations are rejected or incomplete for learning-quality review.",
      ),
    );
  }

  if (total > 0 && currentWindowCount.strong === 0) {
    warnings.push(
      warning(
        "no_strong_candidates",
        "No strong candidates are classified in the current window.",
        "info",
      ),
    );
  }

  if (total >= 3 && experimentalShare >= 0.6) {
    warnings.push(
      warning(
        "mostly_experimental",
        "Most current-window recommendations are experimental learning candidates.",
        "info",
      ),
    );
  }

  if (countsByWindow.find((count) => count.window === "unknown")?.total ?? 0 > 0) {
    warnings.push(
      warning(
        "unknown_window_labels",
        "Some recommendations have unknown day-trade-window labels.",
        "info",
      ),
    );
  }

  if (
    input.scan_observability?.status === "degraded" ||
    input.scan_observability?.status === "stale" ||
    input.scan_observability?.status === "incomplete"
  ) {
    warnings.push(
      warning(
        "stale_or_degraded_scan_source",
        "Scan observability is degraded, stale, or incomplete for this window.",
      ),
    );
  }

  const enoughLearningSamples =
    currentWindowCount.target_status === "within_target" ||
    currentWindowCount.target_status === "above_target";

  return {
    summary_id: `day_trade_window_recommendation_target:${currentWindow}:${now.toISOString()}`,
    summary_version: "1.0",
    generated_at: now.toISOString(),
    current_window: currentWindow,
    status: currentWindowCount.target_status,
    ideal_min: idealMin,
    ideal_max: idealMax,
    strong_target_min: strongTargetMin,
    strong_target_max: strongTargetMax,
    valid_target_min: validTargetMin,
    valid_target_max: validTargetMax,
    experimental_target_note:
      "Experimental/watchlist recommendations fill remaining learning slots up to 10.",
    total_recommendations: items.length,
    current_window_count: currentWindowCount,
    counts_by_window: countsByWindow,
    gap: {
      ideal_min: idealMin,
      ideal_max: idealMax,
      strong_min: strongTargetMin,
      strong_max: strongTargetMax,
      valid_min: validTargetMin,
      valid_max: validTargetMax,
      current_count: currentWindowCount.total,
      gap_to_ideal_min: currentWindowCount.gap_to_ideal_min,
      overflow_above_ideal_max: currentWindowCount.overflow_above_ideal_max,
    },
    enough_learning_samples: enoughLearningSamples,
    scan_status: input.scan_observability?.status ?? "unknown",
    warnings,
    items,
    copy: {
      purpose:
        "Ture aims to build enough recommendation samples to learn, without forcing trades.",
      experimental:
        "Experimental recommendations are learning candidates, not strong trade signals.",
      disclaimer: "Recommendation tiers do not guarantee profitability.",
    },
  };
}

export function dayTradeWindowRecommendationTargetSummaryJson(
  summary: DayTradeWindowRecommendationTargetSummary,
) {
  return JSON.stringify(summary, null, 2);
}
