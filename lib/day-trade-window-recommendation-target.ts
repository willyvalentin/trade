import type {
  RecommendationIntakeQualityResult,
  RecommendationIntakeQualityStatus,
} from "@/lib/recommendation-intake-quality";
import type {
  PlanPriceFreshnessClassification,
  PlanPriceFreshnessDiagnostics,
} from "@/lib/plan-price-freshness";
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

export type StrongCandidateGateBlockReason =
  | "stale_plan"
  | "entry_distance_too_large"
  | "invalid_risk_geometry"
  | "missing_provider_reference"
  | "setup_quality_below_minimum";

export type StrongCandidateGateSummary = {
  candidates_considered_for_strong: number;
  candidates_blocked_from_strong: number;
  top_blocking_reasons: Array<{
    reason: StrongCandidateGateBlockReason;
    count: number;
  }>;
  blocked_by_stale_plan_count: number;
  blocked_by_entry_distance_too_large_count: number;
  blocked_by_invalid_risk_geometry_count: number;
  blocked_by_missing_provider_reference_count: number;
  blocked_by_setup_quality_below_minimum_count: number;
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
  strong_candidate_considered: boolean;
  strong_ineligible_reason: StrongCandidateGateBlockReason | null;
  plan_freshness_classification: PlanPriceFreshnessClassification | null;
  entry_distance_from_first_candle_close_pct: number | null;
  reference_price_source: string | null;
  reference_price_timestamp: string | null;
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
  strong_candidate_gate: StrongCandidateGateSummary;
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
    risk_reward?: number | string | null;
    side?: string | null;
    setup_quality?: number | null;
    plan_price_freshness?: PlanPriceFreshnessDiagnostics | null;
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

function numericValue(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function normalizeSide(value: string | null | undefined) {
  return typeof value === "string" && value.toLowerCase() === "short"
    ? "short"
    : "long";
}

function entryPrice(
  input: DayTradeWindowRecommendationTargetInput["recommendations"][number],
) {
  return (
    finiteNumber(input.entry) ??
    finiteNumber(input.entry_high) ??
    finiteNumber(input.entry_low)
  );
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
  const entry = entryPrice(input);
  const stop = finiteNumber(input.stop);
  const target = finiteNumber(input.target);

  return entry !== null && stop !== null && target !== null;
}

function hasValidRiskGeometry(
  input: DayTradeWindowRecommendationTargetInput["recommendations"][number],
) {
  const entry = entryPrice(input);
  const stop = finiteNumber(input.stop);
  const target = finiteNumber(input.target);
  const riskReward = numericValue(input.risk_reward);

  if (
    entry === null ||
    stop === null ||
    target === null ||
    riskReward === null ||
    riskReward <= 0
  ) {
    return false;
  }

  const side = normalizeSide(input.side);

  if (side === "short") {
    return stop > entry && target < entry;
  }

  return stop < entry && target > entry;
}

function strongCandidateGateBlockReason(
  recommendation: DayTradeWindowRecommendationTargetInput["recommendations"][number],
): StrongCandidateGateBlockReason | null {
  const planFreshness = recommendation.plan_price_freshness ?? null;
  const classification = planFreshness?.classification ?? null;

  if (
    planFreshness === null ||
    classification === "missing_reference_price" ||
    classification === "missing_reference_timestamp" ||
    classification === "provider_price_unavailable" ||
    planFreshness?.reference_price_used_for_plan === null ||
    planFreshness?.reference_price_used_for_plan === undefined ||
    planFreshness?.reference_price_timestamp === null ||
    planFreshness?.reference_price_timestamp === undefined ||
    planFreshness?.latest_provider_price_if_available === null ||
    planFreshness?.latest_provider_price_if_available === undefined
  ) {
    return "missing_provider_reference";
  }

  if (
    classification === "stale_plan" ||
    classification === "severely_stale_plan"
  ) {
    return "stale_plan";
  }

  const entryDistance =
    planFreshness?.entry_distance_from_first_candle_close_pct ?? null;
  if (entryDistance === null || entryDistance > 3) {
    return "entry_distance_too_large";
  }

  if (!hasValidRiskGeometry(recommendation)) {
    return "invalid_risk_geometry";
  }

  const setupQuality = finiteNumber(recommendation.setup_quality);
  if (setupQuality === null || setupQuality < 70) {
    return "setup_quality_below_minimum";
  }

  return null;
}

function strongCandidateGateReasonText(
  reason: StrongCandidateGateBlockReason,
) {
  if (reason === "stale_plan") {
    return "Strong blocked: plan price freshness is stale or severely stale.";
  }

  if (reason === "entry_distance_too_large") {
    return "Strong blocked: entry is more than 3% from first available candle close.";
  }

  if (reason === "invalid_risk_geometry") {
    return "Strong blocked: stop/target geometry or risk/reward is invalid.";
  }

  if (reason === "missing_provider_reference") {
    return "Strong blocked: provider reference price or timestamp is unavailable.";
  }

  return "Strong blocked: setup quality is below the minimum Strong gate.";
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
  strong_candidate_considered: boolean;
  strong_ineligible_reason: StrongCandidateGateBlockReason | null;
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
    return {
      tier: "incomplete",
      reasons,
      has_complete_plan: false,
      strong_candidate_considered: false,
      strong_ineligible_reason: null,
    };
  }

  if (intakeStatus === "rejected" || hasBlockers) {
    reasons.push("Intake quality rejected or contains critical blockers.");
    return {
      tier: "rejected",
      reasons,
      has_complete_plan: true,
      strong_candidate_considered: false,
      strong_ineligible_reason: null,
    };
  }

  if (intakeStatus === "incomplete") {
    reasons.push("Intake quality is incomplete.");
    return {
      tier: "incomplete",
      reasons,
      has_complete_plan: true,
      strong_candidate_considered: false,
      strong_ineligible_reason: null,
    };
  }

  if (confidence === null && intakeStatus === "unknown") {
    reasons.push("Confidence and intake quality are unavailable.");
    return {
      tier: "unknown",
      reasons,
      has_complete_plan: true,
      strong_candidate_considered: false,
      strong_ineligible_reason: null,
    };
  }

  if (hasStaleFreshness) {
    reasons.push("Market data freshness is degraded.");
  }

  const strongCandidateConsidered =
    intakeStatus === "accepted" &&
    confidence !== null &&
    confidence >= 80 &&
    !hasStaleFreshness;

  if (strongCandidateConsidered) {
    const strongGateBlockReason = strongCandidateGateBlockReason(recommendation);

    if (strongGateBlockReason !== null) {
      reasons.push(strongCandidateGateReasonText(strongGateBlockReason));
      return {
        tier: "valid",
        reasons,
        has_complete_plan: true,
        strong_candidate_considered: true,
        strong_ineligible_reason: strongGateBlockReason,
      };
    }

    reasons.push("Accepted intake, high confidence, and complete price plan.");
    return {
      tier: "strong",
      reasons,
      has_complete_plan: true,
      strong_candidate_considered: true,
      strong_ineligible_reason: null,
    };
  }

  if (
    (intakeStatus === "accepted" || intakeStatus === "needs_review") &&
    (confidence === null || confidence >= 60) &&
    !hasBlockers
  ) {
    reasons.push("Usable recommendation with medium-or-better confidence.");
    return {
      tier: "valid",
      reasons,
      has_complete_plan: true,
      strong_candidate_considered: false,
      strong_ineligible_reason: null,
    };
  }

  if (intakeStatus === "needs_review" || (confidence !== null && confidence < 60)) {
    reasons.push("Lower-confidence learning candidate.");
    return {
      tier: "experimental",
      reasons,
      has_complete_plan: true,
      strong_candidate_considered: false,
      strong_ineligible_reason: null,
    };
  }

  reasons.push("Insufficient tier classification data.");
  return {
    tier: "unknown",
    reasons,
    has_complete_plan: true,
    strong_candidate_considered: false,
    strong_ineligible_reason: null,
  };
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

function buildStrongCandidateGateSummary(
  items: DayTradeWindowRecommendationTargetItem[],
): StrongCandidateGateSummary {
  const blocked = items.filter(
    (item) =>
      item.strong_candidate_considered &&
      item.strong_ineligible_reason !== null,
  );
  const reasonCounts = new Map<StrongCandidateGateBlockReason, number>();

  for (const item of blocked) {
    if (item.strong_ineligible_reason === null) continue;
    reasonCounts.set(
      item.strong_ineligible_reason,
      (reasonCounts.get(item.strong_ineligible_reason) ?? 0) + 1,
    );
  }

  const countFor = (reason: StrongCandidateGateBlockReason) =>
    reasonCounts.get(reason) ?? 0;

  return {
    candidates_considered_for_strong: items.filter(
      (item) => item.strong_candidate_considered,
    ).length,
    candidates_blocked_from_strong: blocked.length,
    top_blocking_reasons: Array.from(reasonCounts.entries())
      .map(([reason, count]) => ({ reason, count }))
      .sort((first, second) => second.count - first.count),
    blocked_by_stale_plan_count: countFor("stale_plan"),
    blocked_by_entry_distance_too_large_count: countFor(
      "entry_distance_too_large",
    ),
    blocked_by_invalid_risk_geometry_count: countFor("invalid_risk_geometry"),
    blocked_by_missing_provider_reference_count: countFor(
      "missing_provider_reference",
    ),
    blocked_by_setup_quality_below_minimum_count: countFor(
      "setup_quality_below_minimum",
    ),
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
      strong_candidate_considered: classification.strong_candidate_considered,
      strong_ineligible_reason: classification.strong_ineligible_reason,
      plan_freshness_classification:
        recommendation.plan_price_freshness?.classification ?? null,
      entry_distance_from_first_candle_close_pct:
        recommendation.plan_price_freshness
          ?.entry_distance_from_first_candle_close_pct ?? null,
      reference_price_source:
        recommendation.plan_price_freshness?.reference_price_source ?? null,
      reference_price_timestamp:
        recommendation.plan_price_freshness?.reference_price_timestamp ?? null,
    };
  });
  const strongCandidateGate = buildStrongCandidateGateSummary(items);
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
    strong_candidate_gate: strongCandidateGate,
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
