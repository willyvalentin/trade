import type { DataModeClaritySummary } from "@/lib/data-mode-clarity";
import type { DayTradeWindowRecommendationTargetSummary } from "@/lib/day-trade-window-recommendation-target";
import type { RecommendationIntakeQualityResult } from "@/lib/recommendation-intake-quality";
import type { ScanPipelineObservabilitySummary } from "@/lib/scan-pipeline-observability";

export type RealRecommendationOutputReadinessStatus =
  | "ready_for_real_data_observation"
  | "ready_with_warnings"
  | "blocked_by_demo_data"
  | "blocked_by_missing_market_data"
  | "blocked_by_missing_required_fields"
  | "blocked_by_stale_data"
  | "blocked_by_generation_gap"
  | "needs_review"
  | "unknown";

export type RealRecommendationOutputReadinessCheck = {
  check_id: string;
  label: string;
  status: "pass" | "warning" | "blocked" | "unknown";
  message: string;
  source:
    | "data_reality"
    | "market_data"
    | "required_fields"
    | "learning_loop"
    | "window_target"
    | "provider_scanner"
    | "safety";
};

export type RealRecommendationOutputReadinessBlocker = {
  blocker_id: string;
  message: string;
  source: RealRecommendationOutputReadinessCheck["source"];
};

export type RealRecommendationOutputReadinessWarning = {
  warning_id: string;
  message: string;
  source: RealRecommendationOutputReadinessCheck["source"];
};

export type RealRecommendationOutputReadinessGap = {
  gap_id: string;
  label: string;
  severity: "critical" | "warning" | "info";
  message: string;
  source: RealRecommendationOutputReadinessCheck["source"];
};

export type RealRecommendationOutputReadinessNextAction = {
  action_id: string;
  priority: "critical" | "high" | "medium" | "low" | "watch";
  label: string;
  message: string;
};

export type RealRecommendationOutputReadinessSummary = {
  summary_id: string;
  summary_version: "1.0";
  summary_kind: "real_recommendation_output_readiness";
  generated_at: string;
  overall_status: RealRecommendationOutputReadinessStatus;
  readiness_score: number;
  current_data_mode: string;
  observation_only_real_data_logging_ready: boolean;
  summary: string;
  checks: RealRecommendationOutputReadinessCheck[];
  blockers: RealRecommendationOutputReadinessBlocker[];
  warnings: RealRecommendationOutputReadinessWarning[];
  missing_fields: Array<{
    field_id: string;
    label: string;
    missing_count: number;
    coverage_rate: number;
  }>;
  top_gaps: RealRecommendationOutputReadinessGap[];
  next_actions: RealRecommendationOutputReadinessNextAction[];
  coverage: {
    visible_recommendations: number;
    real_source_recommendations: number;
    demo_recommendations: number;
    required_field_coverage_rate: number;
    market_data_coverage_rate: number;
    learning_loop_coverage_rate: number;
    current_window_count: number;
    ideal_window_min: number;
    ideal_window_max: number;
    strong_count: number;
    valid_count: number;
    experimental_count: number;
  };
  provider_scanner_gaps: string[];
  safety_constraints: {
    broker_automation_enabled: false;
    order_submission_enabled: false;
    avanza_execution_human_only: true;
    automatic_trade_create_or_close_enabled: false;
  };
  copy: {
    purpose: string;
    execution_boundary: string;
    missing_fields: string;
    no_scoring_change: string;
  };
};

export type RealRecommendationOutputReadinessInput = {
  recommendations: Array<{
    id?: string | null;
    ticker?: string | null;
    company_name?: string | null;
    direction?: string | null;
    entry_low?: number | null;
    entry_high?: number | null;
    stop_loss?: number | null;
    target_1?: number | null;
    target_2?: number | null;
    confidence_score?: number | null;
    confidence_label?: string | null;
    thesis?: string | null;
    invalidation?: string | null;
    reason_to_avoid?: string | null;
    created_at?: string | null;
    freshness?: string | null;
    data_mode?: string | null;
    source_mode?: string | null;
    market_data_timestamp?: string | null;
    latest_price?: number | null;
    intraday_high?: number | null;
    intraday_low?: number | null;
    latest_volume?: number | null;
    average_volume?: number | null;
  }>;
  data_mode_clarity: DataModeClaritySummary;
  scan_observability: ScanPipelineObservabilitySummary;
  day_trade_window_target: DayTradeWindowRecommendationTargetSummary;
  intake_results?: RecommendationIntakeQualityResult[];
  market_session?: {
    phase?: string | null;
    risk_level?: string | null;
    source?: string | null;
    market_is_open?: boolean | null;
  } | null;
  market_status?: {
    provider?: string | null;
    dayType?: string | null;
    fromCache?: boolean | null;
  } | null;
  now?: Date | string | null;
};

const requiredFieldDefinitions = [
  { field_id: "ticker", label: "Ticker" },
  { field_id: "direction", label: "Side / direction" },
  { field_id: "entry", label: "Entry" },
  { field_id: "stop_loss", label: "Stop" },
  { field_id: "target", label: "Target" },
  { field_id: "confidence", label: "Confidence" },
  { field_id: "rationale", label: "Rationale" },
  { field_id: "created_at", label: "Recommended at" },
  { field_id: "freshness", label: "Data freshness" },
  { field_id: "market_session", label: "Market/session context" },
] as const;

const marketDataFieldDefinitions = [
  { field_id: "latest_price", label: "Quote / last price" },
  { field_id: "intraday_range", label: "Intraday high / low" },
  { field_id: "volume", label: "Volume" },
  { field_id: "market_data_timestamp", label: "Market data timestamp" },
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

function hasText(value: string | null | undefined) {
  return typeof value === "string" && value.trim().length > 0;
}

function hasNumber(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value);
}

function hasEntry(
  recommendation: RealRecommendationOutputReadinessInput["recommendations"][number],
) {
  return hasNumber(recommendation.entry_low) || hasNumber(recommendation.entry_high);
}

function hasTarget(
  recommendation: RealRecommendationOutputReadinessInput["recommendations"][number],
) {
  return hasNumber(recommendation.target_1) || hasNumber(recommendation.target_2);
}

function hasRationale(
  recommendation: RealRecommendationOutputReadinessInput["recommendations"][number],
) {
  return (
    hasText(recommendation.thesis) ||
    hasText(recommendation.invalidation) ||
    hasText(recommendation.reason_to_avoid)
  );
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

  return Math.round(values.reduce((total, value) => total + value, 0) / values.length);
}

function check(input: RealRecommendationOutputReadinessCheck) {
  return input;
}

function blocker(
  blocker_id: string,
  message: string,
  source: RealRecommendationOutputReadinessBlocker["source"],
): RealRecommendationOutputReadinessBlocker {
  return { blocker_id, message, source };
}

function warning(
  warning_id: string,
  message: string,
  source: RealRecommendationOutputReadinessWarning["source"],
): RealRecommendationOutputReadinessWarning {
  return { warning_id, message, source };
}

function gap(
  gap_id: string,
  label: string,
  severity: RealRecommendationOutputReadinessGap["severity"],
  message: string,
  source: RealRecommendationOutputReadinessGap["source"],
): RealRecommendationOutputReadinessGap {
  return { gap_id, label, severity, message, source };
}

function action(
  action_id: string,
  priority: RealRecommendationOutputReadinessNextAction["priority"],
  label: string,
  message: string,
): RealRecommendationOutputReadinessNextAction {
  return { action_id, priority, label, message };
}

function countMissingFields(
  recommendations: RealRecommendationOutputReadinessInput["recommendations"],
  input: RealRecommendationOutputReadinessInput,
) {
  return requiredFieldDefinitions.map((field) => {
    const missingCount = recommendations.filter((recommendation) => {
      if (field.field_id === "ticker") return !hasText(recommendation.ticker);
      if (field.field_id === "direction") return !hasText(recommendation.direction);
      if (field.field_id === "entry") return !hasEntry(recommendation);
      if (field.field_id === "stop_loss") return !hasNumber(recommendation.stop_loss);
      if (field.field_id === "target") return !hasTarget(recommendation);
      if (field.field_id === "confidence") {
        return (
          !hasNumber(recommendation.confidence_score) &&
          !hasText(recommendation.confidence_label)
        );
      }
      if (field.field_id === "rationale") return !hasRationale(recommendation);
      if (field.field_id === "created_at") return !hasText(recommendation.created_at);
      if (field.field_id === "freshness") {
        return !hasText(recommendation.freshness);
      }
      if (field.field_id === "market_session") {
        return !hasText(input.market_session?.phase);
      }

      return false;
    }).length;

    return {
      field_id: field.field_id,
      label: field.label,
      missing_count: missingCount,
      coverage_rate: percent(recommendations.length - missingCount, recommendations.length),
    };
  });
}

function marketDataCoverage(
  recommendations: RealRecommendationOutputReadinessInput["recommendations"],
) {
  const perField = marketDataFieldDefinitions.map((field) => {
    const presentCount = recommendations.filter((recommendation) => {
      if (field.field_id === "latest_price") {
        return hasNumber(recommendation.latest_price);
      }
      if (field.field_id === "intraday_range") {
        return (
          hasNumber(recommendation.intraday_high) &&
          hasNumber(recommendation.intraday_low)
        );
      }
      if (field.field_id === "volume") {
        return (
          hasNumber(recommendation.latest_volume) ||
          hasNumber(recommendation.average_volume)
        );
      }
      if (field.field_id === "market_data_timestamp") {
        return hasText(recommendation.market_data_timestamp);
      }

      return false;
    }).length;

    return percent(presentCount, recommendations.length);
  });

  return average(perField);
}

function buildStatus({
  blockers,
  warnings,
  visibleCount,
  requiredCoverage,
  marketCoverage,
  dataAgeMinutes,
  windowStatus,
}: {
  blockers: RealRecommendationOutputReadinessBlocker[];
  warnings: RealRecommendationOutputReadinessWarning[];
  visibleCount: number;
  requiredCoverage: number;
  marketCoverage: number;
  dataAgeMinutes: number | null;
  windowStatus: string;
}): RealRecommendationOutputReadinessStatus {
  const blockerIds = new Set(blockers.map((item) => item.blocker_id));

  if (blockerIds.has("demo_data_visible")) {
    return "blocked_by_demo_data";
  }

  if (blockerIds.has("no_visible_recommendations") || windowStatus === "below_target") {
    return "blocked_by_generation_gap";
  }

  if (blockerIds.has("missing_required_fields") || requiredCoverage < 85) {
    return "blocked_by_missing_required_fields";
  }

  if (blockerIds.has("missing_market_data") || marketCoverage < 50) {
    return "blocked_by_missing_market_data";
  }

  if (
    blockerIds.has("stale_scan_data") ||
    dataAgeMinutes !== null && dataAgeMinutes > 90
  ) {
    return "blocked_by_stale_data";
  }

  if (visibleCount === 0) {
    return "unknown";
  }

  if (warnings.length > 0) {
    return "ready_with_warnings";
  }

  return "ready_for_real_data_observation";
}

function summaryForStatus(status: RealRecommendationOutputReadinessStatus) {
  if (status === "ready_for_real_data_observation") {
    return "Ture is ready to observe and log real-data recommendations without changing scoring or execution behavior.";
  }

  if (status === "ready_with_warnings") {
    return "Ture can start observation-only real-data recommendation logging, but the listed warnings should be watched.";
  }

  if (status === "blocked_by_demo_data") {
    return "Demo or preview recommendations are still mixed into the visible recommendation flow.";
  }

  if (status === "blocked_by_missing_market_data") {
    return "Market data coverage is too thin for reliable real-data learning.";
  }

  if (status === "blocked_by_missing_required_fields") {
    return "Required recommendation fields are missing often enough to reduce learning quality.";
  }

  if (status === "blocked_by_stale_data") {
    return "Visible recommendation context is stale and should be refreshed before relying on it.";
  }

  if (status === "blocked_by_generation_gap") {
    return "The current pipeline is not yet producing enough recommendations for the 6-10 per-window learning target.";
  }

  if (status === "needs_review") {
    return "Real recommendation output readiness needs manual review because some signals disagree.";
  }

  return "Real recommendation output readiness is unknown because available diagnostics are limited.";
}

export function buildRealRecommendationOutputReadinessSummary(
  input: RealRecommendationOutputReadinessInput,
): RealRecommendationOutputReadinessSummary {
  const now = toDate(input.now) ?? new Date();
  const recommendations = input.recommendations;
  const visibleCount = recommendations.length;
  const demoCount = recommendations.filter(
    (recommendation) =>
      recommendation.data_mode === "demo" ||
      recommendation.source_mode === "demo" ||
      recommendation.id?.startsWith("demo-") === true ||
      recommendation.id?.startsWith("dev-preview") === true,
  ).length;
  const realSourceCount = Math.max(0, visibleCount - demoCount);
  const missingFields = countMissingFields(recommendations, input);
  const requiredCoverage = average(
    missingFields.map((field) => field.coverage_rate),
  );
  const marketCoverage = marketDataCoverage(recommendations);
  const learningLoopCoverage = average([
    percent(input.intake_results?.length ?? 0, visibleCount),
    input.day_trade_window_target.items.length > 0 ? 100 : 0,
    input.scan_observability.visible_recommendation_count > 0 ? 100 : 0,
  ]);
  const blockers: RealRecommendationOutputReadinessBlocker[] = [];
  const warnings: RealRecommendationOutputReadinessWarning[] = [];
  const gaps: RealRecommendationOutputReadinessGap[] = [];
  const checks: RealRecommendationOutputReadinessCheck[] = [];
  const providerScannerGaps: string[] = [];
  const currentWindow = input.day_trade_window_target.current_window_count;
  const dataAgeMinutes = input.scan_observability.run_context.data_age_minutes;

  if (visibleCount === 0) {
    blockers.push(
      blocker(
        "no_visible_recommendations",
        "No visible recommendations are available for the current window.",
        "window_target",
      ),
    );
  }

  if (demoCount > 0 || input.data_mode_clarity.has_demo_data) {
    blockers.push(
      blocker(
        "demo_data_visible",
        "Demo or dev-preview recommendations are present in the visible flow.",
        "data_reality",
      ),
    );
  }

  if (requiredCoverage < 85) {
    blockers.push(
      blocker(
        "missing_required_fields",
        `Required recommendation field coverage is ${requiredCoverage}%.`,
        "required_fields",
      ),
    );
  }

  if (marketCoverage < 50) {
    blockers.push(
      blocker(
        "missing_market_data",
        `Market data coverage is ${marketCoverage}%.`,
        "market_data",
      ),
    );
  }

  if (
    input.scan_observability.status === "stale" ||
    dataAgeMinutes !== null && dataAgeMinutes > 90
  ) {
    blockers.push(
      blocker(
        "stale_scan_data",
        "Scan or recommendation data is stale for real-data learning.",
        "market_data",
      ),
    );
  }

  if (input.day_trade_window_target.status === "below_target") {
    warnings.push(
      warning(
        "below_window_target",
        "Current output is below the 6-10 recommendation target for this day trade window.",
        "window_target",
      ),
    );
  }

  if (input.day_trade_window_target.status === "above_target") {
    warnings.push(
      warning(
        "above_window_target",
        "Current output is above the 6-10 recommendation target; avoid forcing weak trades.",
        "window_target",
      ),
    );
  }

  if (input.scan_observability.status === "degraded") {
    warnings.push(
      warning(
        "degraded_scan_observability",
        "Scan observability is degraded, so generated recommendations need review.",
        "provider_scanner",
      ),
    );
  }

  if (input.data_mode_clarity.overall_mode === "local_dev") {
    warnings.push(
      warning(
        "local_dev_mode",
        "Local development mode may mix Supabase records, local storage, and preview data.",
        "data_reality",
      ),
    );
  }

  if (!hasText(input.market_status?.provider)) {
    warnings.push(
      warning(
        "unknown_market_calendar_provider",
        "Market calendar provider/source is unknown.",
        "market_data",
      ),
    );
  }

  for (const field of missingFields.filter((item) => item.missing_count > 0)) {
    gaps.push(
      gap(
        `missing_${field.field_id}`,
        field.label,
        field.coverage_rate < 85 ? "critical" : "warning",
        `${field.missing_count} visible recommendation${field.missing_count === 1 ? "" : "s"} missing ${field.label.toLowerCase()}.`,
        "required_fields",
      ),
    );
  }

  if (marketCoverage < 100) {
    gaps.push(
      gap(
        "partial_market_data_coverage",
        "Market data coverage",
        marketCoverage < 50 ? "critical" : "warning",
        "Quote, intraday range, volume, or market-data timestamp coverage is incomplete.",
        "market_data",
      ),
    );
  }

  if (currentWindow.total < input.day_trade_window_target.ideal_min) {
    gaps.push(
      gap(
        "below_window_output_target",
        "Window output target",
        "warning",
        `Current window has ${currentWindow.total} recommendations; target is ${input.day_trade_window_target.ideal_min}-${input.day_trade_window_target.ideal_max}.`,
        "window_target",
      ),
    );
  }

  if (currentWindow.strong === 0) {
    gaps.push(
      gap(
        "no_strong_current_window_candidates",
        "Strong candidate distribution",
        "info",
        "No strong candidates are classified in the current window.",
        "window_target",
      ),
    );
  }

  if (input.scan_observability.unknown_metrics.length > 0) {
    providerScannerGaps.push(
      ...input.scan_observability.unknown_metrics.map(
        (metric) => `Unknown scan metric: ${metric}`,
      ),
    );
  }

  if (marketCoverage < 100) {
    providerScannerGaps.push("No complete quote/range/volume/timestamp coverage.");
  }

  if (input.scan_observability.run_context.latest_scan_at === null) {
    providerScannerGaps.push("No latest scheduled scan timestamp.");
  }

  if (input.scan_observability.run_context.latest_scan_source === null) {
    providerScannerGaps.push("No scanner/source label on latest scan.");
  }

  checks.push(
    check({
      check_id: "data_reality",
      label: "Data reality",
      status: demoCount > 0 ? "blocked" : "pass",
      message:
        demoCount > 0
          ? "Demo or dev-preview recommendations are visible."
          : `Visible recommendations are ${input.data_mode_clarity.overall_mode.replaceAll("_", " ")} / ${realSourceCount} non-demo records.`,
      source: "data_reality",
    }),
    check({
      check_id: "market_data_availability",
      label: "Market data availability",
      status: marketCoverage >= 80 ? "pass" : marketCoverage >= 50 ? "warning" : "blocked",
      message: `${marketCoverage}% quote/range/volume/timestamp coverage.`,
      source: "market_data",
    }),
    check({
      check_id: "required_recommendation_fields",
      label: "Required recommendation fields",
      status:
        requiredCoverage >= 90
          ? "pass"
          : requiredCoverage >= 85
            ? "warning"
            : "blocked",
      message: `${requiredCoverage}% required field coverage.`,
      source: "required_fields",
    }),
    check({
      check_id: "learning_loop_compatibility",
      label: "Learning-loop compatibility",
      status:
        learningLoopCoverage >= 80
          ? "pass"
          : learningLoopCoverage >= 50
            ? "warning"
            : "unknown",
      message: `${learningLoopCoverage}% coverage across intake, observability, and window-target metadata.`,
      source: "learning_loop",
    }),
    check({
      check_id: "window_output_target",
      label: "6-10 per window target",
      status:
        input.day_trade_window_target.status === "within_target" ||
        input.day_trade_window_target.status === "above_target"
          ? "pass"
          : input.day_trade_window_target.status === "below_target"
            ? "warning"
            : "unknown",
      message: `${currentWindow.total} recommendations in current window; ${currentWindow.strong} strong, ${currentWindow.valid} valid, ${currentWindow.experimental} experimental.`,
      source: "window_target",
    }),
    check({
      check_id: "provider_scanner_gaps",
      label: "Provider/scanner gaps",
      status:
        providerScannerGaps.length === 0
          ? "pass"
          : providerScannerGaps.length <= 2
            ? "warning"
            : "blocked",
      message:
        providerScannerGaps.length === 0
          ? "No provider/scanner gaps detected from available diagnostics."
          : providerScannerGaps.slice(0, 2).join(" "),
      source: "provider_scanner",
    }),
    check({
      check_id: "execution_safety_boundary",
      label: "Safety constraints",
      status: "pass",
      message:
        "Real market data does not mean automated execution; Avanza execution remains human-only.",
      source: "safety",
    }),
  );

  const status = buildStatus({
    blockers,
    warnings,
    visibleCount,
    requiredCoverage,
    marketCoverage,
    dataAgeMinutes,
    windowStatus: input.day_trade_window_target.status,
  });
  const score = Math.max(
    0,
    Math.min(
      100,
      average([
        requiredCoverage,
        marketCoverage,
        learningLoopCoverage,
        percent(realSourceCount, visibleCount),
        input.day_trade_window_target.status === "within_target" ? 100 : 60,
      ]) - blockers.length * 12,
    ),
  );
  const observationReady =
    status === "ready_for_real_data_observation" ||
    status === "ready_with_warnings";
  const nextActions: RealRecommendationOutputReadinessNextAction[] = [];

  if (demoCount > 0) {
    nextActions.push(
      action(
        "remove_demo_recommendations",
        "critical",
        "Separate demo data from real-output readiness",
        "Keep demo/dev-preview recommendations out of the real recommendation observation flow.",
      ),
    );
  }

  if (marketCoverage < 80) {
    nextActions.push(
      action(
        "complete_market_data_fields",
        marketCoverage < 50 ? "critical" : "high",
        "Complete market data coverage",
        "Persist quote, intraday high/low, volume, and a market-data timestamp for generated recommendations.",
      ),
    );
  }

  if (requiredCoverage < 90) {
    nextActions.push(
      action(
        "fill_required_recommendation_fields",
        requiredCoverage < 85 ? "critical" : "high",
        "Fill required recommendation fields",
        "Ensure each visible recommendation has entry, stop, target, confidence, rationale, freshness, and session context.",
      ),
    );
  }

  if (currentWindow.total < input.day_trade_window_target.ideal_min) {
    nextActions.push(
      action(
        "increase_observable_window_output",
        "medium",
        "Reach the 6-10 window target without forcing trades",
        "Improve scanner/provider coverage and candidate ranking metadata before increasing generated output.",
      ),
    );
  }

  if (nextActions.length === 0) {
    nextActions.push(
      action(
        "start_observation_only_logging",
        "watch",
        "Start observation-only real-data logging",
        "Collect recommendation snapshots, scan runs, and outcomes before changing scoring or generation.",
      ),
    );
  }

  return {
    summary_id: `real_recommendation_output_readiness:${now.toISOString()}`,
    summary_version: "1.0",
    summary_kind: "real_recommendation_output_readiness",
    generated_at: now.toISOString(),
    overall_status: status,
    readiness_score: score,
    current_data_mode: input.data_mode_clarity.overall_mode,
    observation_only_real_data_logging_ready: observationReady,
    summary: summaryForStatus(status),
    checks,
    blockers,
    warnings,
    missing_fields: missingFields.filter((field) => field.missing_count > 0),
    top_gaps: gaps.slice(0, 8),
    next_actions: nextActions.slice(0, 5),
    coverage: {
      visible_recommendations: visibleCount,
      real_source_recommendations: realSourceCount,
      demo_recommendations: demoCount,
      required_field_coverage_rate: requiredCoverage,
      market_data_coverage_rate: marketCoverage,
      learning_loop_coverage_rate: learningLoopCoverage,
      current_window_count: currentWindow.total,
      ideal_window_min: input.day_trade_window_target.ideal_min,
      ideal_window_max: input.day_trade_window_target.ideal_max,
      strong_count: currentWindow.strong,
      valid_count: currentWindow.valid,
      experimental_count: currentWindow.experimental,
    },
    provider_scanner_gaps: Array.from(new Set(providerScannerGaps)).slice(0, 8),
    safety_constraints: {
      broker_automation_enabled: false,
      order_submission_enabled: false,
      avanza_execution_human_only: true,
      automatic_trade_create_or_close_enabled: false,
    },
    copy: {
      purpose:
        "This checks whether Ture is ready to learn from real-data recommendations.",
      execution_boundary: "Real market data does not mean automated execution.",
      missing_fields: "Missing fields reduce learning quality.",
      no_scoring_change: "This does not change scoring or generation.",
    },
  };
}

export function realRecommendationOutputReadinessSummaryJson(
  summary: RealRecommendationOutputReadinessSummary,
) {
  return JSON.stringify(summary, null, 2);
}
