import type { DayTradeScanOrchestrationSummary } from "@/lib/day-trade-scan-orchestration";
import type {
  DayTradeWindowRecommendationCount,
  DayTradeWindowRecommendationTargetSummary,
} from "@/lib/day-trade-window-recommendation-target";
import type { RecommendationScanRun } from "@/lib/recommendation-scan-run";
import type { RecommendationSnapshot } from "@/lib/recommendation-snapshot";
import type { RiskControlsSettings } from "@/lib/risk-controls";

export type DailyRecommendationTargetStatus =
  | "below_target"
  | "within_target"
  | "above_target"
  | "no_scan_yet"
  | "not_applicable"
  | "unknown";

export type DailyTradeCapacityStatus =
  | "available"
  | "approaching_cap"
  | "at_cap"
  | "exceeded"
  | "unknown";

export type DailyRecommendationWindowTarget = {
  window: "morning" | "midday" | "power_hour";
  produced_count: number;
  target_min: number;
  target_max: number;
  status: DailyRecommendationTargetStatus;
  gap_to_target_min: number;
  overflow_above_target_max: number;
  latest_scan_at: string | null;
};

export type DailyTradeCapacityCheck = {
  check_id: string;
  status: "pass" | "warning" | "blocked" | "info" | "unknown";
  message: string;
};

export type DailyRecommendationTradeTargetWarning = {
  warning_id: string;
  severity: "info" | "warning" | "critical";
  message: string;
};

export type DailyRecommendationTradeTargetNextAction = {
  action_id: string;
  priority: "high" | "medium" | "low" | "watch";
  label: string;
  message: string;
};

export type DailyRecommendationTradeTargetsSummary = {
  summary_id: string;
  summary_version: "1.0";
  summary_kind: "daily_recommendation_trade_targets";
  generated_at: string;
  trading_date: string;
  per_window_target_min: number;
  per_window_target_max: number;
  active_windows: Array<"morning" | "midday" | "power_hour">;
  full_day_recommendation_target_min: number;
  full_day_recommendation_target_max: number;
  applicable_recommendation_target_min: number;
  applicable_recommendation_target_max: number;
  total_recommendations_today: number;
  recommendation_target_status: DailyRecommendationTargetStatus;
  recommendation_progress_rate: number | null;
  window_targets: DailyRecommendationWindowTarget[];
  desired_daily_trade_capacity: number;
  actual_daily_trade_cap: number | null;
  risk_controls_cap_source:
    | "risk_controls"
    | "default_desired_capacity"
    | "unknown";
  risk_controls_capacity_note: string;
  trades_opened_today: number;
  trades_closed_today: number;
  live_trades_today: number;
  remaining_trade_capacity: number | null;
  trade_capacity_status: DailyTradeCapacityStatus;
  recommendations_per_trade_ratio: number | null;
  learning_sample_note: string;
  checks: DailyTradeCapacityCheck[];
  warnings: DailyRecommendationTradeTargetWarning[];
  next_action: DailyRecommendationTradeTargetNextAction;
  copy: {
    recommendation_target: string;
    trade_capacity: string;
    ignored_recommendations: string;
    no_trade_days: string;
  };
};

export type DailyRecommendationTradeTargetsInput = {
  tradingDate: string;
  windowTargetSummary?: DayTradeWindowRecommendationTargetSummary | null;
  scanOrchestration?: DayTradeScanOrchestrationSummary | null;
  riskControlsSettings?: RiskControlsSettings | null;
  scanRuns?: RecommendationScanRun[];
  snapshots?: RecommendationSnapshot[];
  tradesOpenedToday: number;
  tradesClosedToday: number;
  liveTradesToday: number;
  now?: Date | string | null;
};

const perWindowTargetMin = 6;
const perWindowTargetMax = 10;
const desiredDailyTradeCapacity = 10;
const activeWindows = ["morning", "midday", "power_hour"] as const;

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

function percent(part: number, total: number) {
  if (total <= 0) {
    return null;
  }

  return Math.round((part / total) * 100);
}

function windowStatus(
  count: number,
  applicable: boolean,
  hasScan: boolean,
): DailyRecommendationTargetStatus {
  if (!applicable) return "not_applicable";
  if (!hasScan && count <= 0) return "no_scan_yet";
  if (count < perWindowTargetMin) return "below_target";
  if (count > perWindowTargetMax) return "above_target";
  return "within_target";
}

function fullDayStatus(
  count: number,
  targetMin: number,
  targetMax: number,
): DailyRecommendationTargetStatus {
  if (targetMin <= 0 && targetMax <= 0) return "not_applicable";
  if (count <= 0) return "no_scan_yet";
  if (count < targetMin) return "below_target";
  if (count > targetMax) return "above_target";
  return "within_target";
}

function calculateTradeCapacityStatus(input: {
  tradesOpenedToday: number;
  actualCap: number | null;
}): DailyTradeCapacityStatus {
  if (input.actualCap === null) return "unknown";
  if (input.tradesOpenedToday > input.actualCap) return "exceeded";
  if (input.tradesOpenedToday === input.actualCap) return "at_cap";
  if (input.tradesOpenedToday >= Math.max(1, Math.floor(input.actualCap * 0.8))) {
    return "approaching_cap";
  }

  return "available";
}

function warning(
  warning_id: string,
  severity: DailyRecommendationTradeTargetWarning["severity"],
  message: string,
): DailyRecommendationTradeTargetWarning {
  return { warning_id, severity, message };
}

function check(
  check_id: string,
  status: DailyTradeCapacityCheck["status"],
  message: string,
): DailyTradeCapacityCheck {
  return { check_id, status, message };
}

function nextAction(
  action_id: string,
  priority: DailyRecommendationTradeTargetNextAction["priority"],
  label: string,
  message: string,
): DailyRecommendationTradeTargetNextAction {
  return { action_id, priority, label, message };
}

function countFromWindowTarget(
  count: DayTradeWindowRecommendationCount | undefined,
) {
  return count?.total ?? 0;
}

function latestScanAtForWindow(
  window: (typeof activeWindows)[number],
  scanRuns: RecommendationScanRun[],
  orchestration?: DayTradeScanOrchestrationSummary | null,
) {
  const orchestrationLatest = orchestration?.latest_scan_per_window[window] ?? null;
  const latestRun = scanRuns
    .filter((scanRun) => scanRun.window === window)
    .map((scanRun) => scanRun.observed_at)
    .filter(Boolean)
    .sort((first, second) => second.localeCompare(first))[0] ?? null;

  return orchestrationLatest ?? latestRun;
}

function applicableWindows(input: {
  orchestration?: DayTradeScanOrchestrationSummary | null;
  scanRuns: RecommendationScanRun[];
}) {
  const orchestration = input.orchestration ?? null;

  if (orchestration && !orchestration.is_trading_day) {
    return new Set<(typeof activeWindows)[number]>();
  }

  if (orchestration?.active_window === "closed" && orchestration.is_trading_day) {
    return new Set(activeWindows);
  }

  const windows = new Set<(typeof activeWindows)[number]>();

  for (const window of activeWindows) {
    if (orchestration?.latest_scan_per_window[window]) {
      windows.add(window);
    }

    if (orchestration?.missed_windows.includes(window)) {
      windows.add(window);
    }
  }

  if (
    orchestration?.active_window === "morning" ||
    orchestration?.active_window === "midday" ||
    orchestration?.active_window === "power_hour"
  ) {
    windows.add(orchestration.active_window);
  }

  for (const scanRun of input.scanRuns) {
    if (
      scanRun.window === "morning" ||
      scanRun.window === "midday" ||
      scanRun.window === "power_hour"
    ) {
      windows.add(scanRun.window);
    }
  }

  return windows;
}

function targetCountFromSnapshots(
  snapshots: RecommendationSnapshot[] | undefined,
  window: (typeof activeWindows)[number],
) {
  return (snapshots ?? []).filter((snapshot) => snapshot.window === window).length;
}

function buildRiskControlsCapacity(input: {
  riskControlsSettings?: RiskControlsSettings | null;
}) {
  const configuredCap = input.riskControlsSettings?.max_trades_per_day ?? null;

  if (configuredCap !== null) {
    return {
      actualCap: configuredCap,
      source: "risk_controls" as const,
      note:
        configuredCap < desiredDailyTradeCapacity
          ? "Risk Controls intentionally set a conservative cap below the default desired capacity."
          : configuredCap > desiredDailyTradeCapacity
            ? "Risk Controls allow more than the default desired capacity; review whether that is intentional."
            : "Risk Controls match the default desired daily trade capacity.",
    };
  }

  return {
    actualCap: desiredDailyTradeCapacity,
    source: "default_desired_capacity" as const,
    note: "No Risk Controls max trades/day is configured, so the default desired capacity is used for diagnostics.",
  };
}

function buildNextAction(input: {
  recommendationStatus: DailyRecommendationTargetStatus;
  capacityStatus: DailyTradeCapacityStatus;
}) {
  if (input.capacityStatus === "exceeded" || input.capacityStatus === "at_cap") {
    return nextAction(
      "respect_trade_capacity",
      "high",
      "Respect trade capacity",
      "Daily trade capacity is a risk limit, not a goal to keep trading.",
    );
  }

  if (input.capacityStatus === "approaching_cap") {
    return nextAction(
      "slow_down_near_capacity",
      "medium",
      "Slow down near capacity",
      "You are near the daily trade cap; select only the clearest remaining setups.",
    );
  }

  if (input.recommendationStatus === "below_target") {
    return nextAction(
      "collect_more_recommendation_samples",
      "medium",
      "Collect more recommendation samples",
      "Keep scanning active windows to build the 6-10 recommendation sample target.",
    );
  }

  if (input.recommendationStatus === "no_scan_yet") {
    return nextAction(
      "wait_for_active_window",
      "watch",
      "Wait for active window",
      "Future windows should not be penalized before they occur.",
    );
  }

  return nextAction(
    "maintain_targets",
    "low",
    "Maintain targets",
    "Recommendation output and trade capacity are separated clearly.",
  );
}

export function buildDailyRecommendationTradeTargetsSummary(
  input: DailyRecommendationTradeTargetsInput,
): DailyRecommendationTradeTargetsSummary {
  const now = toDate(input.now) ?? new Date();
  const scanRuns = input.scanRuns ?? [];
  const applicable = applicableWindows({
    orchestration: input.scanOrchestration,
    scanRuns,
  });
  const snapshotCountByWindow = new Map(
    activeWindows.map((window) => [
      window,
      targetCountFromSnapshots(input.snapshots, window),
    ]),
  );
  const targetCountByWindow = new Map(
    (input.windowTargetSummary?.counts_by_window ?? []).map((count) => [
      count.window,
      count,
    ]),
  );
  const windowTargets = activeWindows.map((window) => {
    const currentWindowCount = countFromWindowTarget(
      targetCountByWindow.get(window),
    );
    const scanRunCount = scanRuns
      .filter((scanRun) => scanRun.window === window)
      .reduce(
        (total, scanRun) =>
          Math.max(total, scanRun.counts.visible_recommendation_count),
        0,
      );
    const snapshotCount = snapshotCountByWindow.get(window) ?? 0;
    const producedCount = Math.max(currentWindowCount, scanRunCount, snapshotCount);
    const latestScanAt = latestScanAtForWindow(
      window,
      scanRuns,
      input.scanOrchestration,
    );
    const isApplicable = applicable.has(window);
    const status = windowStatus(
      producedCount,
      isApplicable,
      latestScanAt !== null || producedCount > 0,
    );

    return {
      window,
      produced_count: producedCount,
      target_min: perWindowTargetMin,
      target_max: perWindowTargetMax,
      status,
      gap_to_target_min:
        status === "not_applicable"
          ? 0
          : Math.max(0, perWindowTargetMin - producedCount),
      overflow_above_target_max:
        status === "not_applicable"
          ? 0
          : Math.max(0, producedCount - perWindowTargetMax),
      latest_scan_at: latestScanAt,
    } satisfies DailyRecommendationWindowTarget;
  });
  const applicableTargetMin = applicable.size * perWindowTargetMin;
  const applicableTargetMax = applicable.size * perWindowTargetMax;
  const totalRecommendationsToday = windowTargets
    .filter((item) => item.status !== "not_applicable")
    .reduce((total, item) => total + item.produced_count, 0);
  const recommendationTargetStatus = fullDayStatus(
    totalRecommendationsToday,
    applicableTargetMin,
    applicableTargetMax,
  );
  const capacity = buildRiskControlsCapacity({
    riskControlsSettings: input.riskControlsSettings,
  });
  const tradeCapacityStatus = calculateTradeCapacityStatus({
    tradesOpenedToday: input.tradesOpenedToday,
    actualCap: capacity.actualCap,
  });
  const remainingTradeCapacity =
    capacity.actualCap === null
      ? null
      : Math.max(0, capacity.actualCap - input.tradesOpenedToday);
  const recommendationsPerTradeRatio =
    input.tradesOpenedToday > 0
      ? Math.round((totalRecommendationsToday / input.tradesOpenedToday) * 100) /
        100
      : null;
  const warnings: DailyRecommendationTradeTargetWarning[] = [];

  if (recommendationTargetStatus === "below_target") {
    warnings.push(
      warning(
        "below_daily_recommendation_target",
        "warning",
        "Recommendations produced today are below the applicable 6-10 per-window sample target.",
      ),
    );
  }

  if (recommendationTargetStatus === "above_target") {
    warnings.push(
      warning(
        "above_daily_recommendation_target",
        "info",
        "Recommendations produced today are above the calm daily sample range.",
      ),
    );
  }

  if (capacity.source === "risk_controls" && capacity.actualCap < desiredDailyTradeCapacity) {
    warnings.push(
      warning(
        "conservative_risk_controls_trade_cap",
        "info",
        "Risk Controls set a trade cap below the default desired daily capacity.",
      ),
    );
  }

  if (capacity.source === "risk_controls" && capacity.actualCap > desiredDailyTradeCapacity) {
    warnings.push(
      warning(
        "risk_controls_trade_cap_above_default",
        "warning",
        "Risk Controls max trades/day exceeds the default desired capacity of 10.",
      ),
    );
  }

  if (
    input.tradesOpenedToday > totalRecommendationsToday &&
    totalRecommendationsToday > 0
  ) {
    warnings.push(
      warning(
        "trades_exceed_recommendation_count",
        "warning",
        "Trades opened today exceed the available recommendation sample count.",
      ),
    );
  }

  if (
    (tradeCapacityStatus === "approaching_cap" ||
      tradeCapacityStatus === "at_cap" ||
      tradeCapacityStatus === "exceeded") &&
    (recommendationTargetStatus === "below_target" ||
      recommendationTargetStatus === "no_scan_yet")
  ) {
    warnings.push(
      warning(
        "near_capacity_with_thin_recommendations",
        "warning",
        "Trade capacity is tight while recommendation coverage is thin.",
      ),
    );
  }

  const checks = [
    check(
      "recommendation_output_target",
      recommendationTargetStatus === "within_target" ||
        recommendationTargetStatus === "above_target"
        ? "pass"
        : recommendationTargetStatus === "not_applicable"
          ? "info"
          : "warning",
      `Recommendation output target is ${recommendationTargetStatus.replaceAll("_", " ")}.`,
    ),
    check(
      "daily_trade_capacity",
      tradeCapacityStatus === "available"
        ? "pass"
        : tradeCapacityStatus === "unknown"
          ? "unknown"
          : tradeCapacityStatus === "exceeded"
            ? "blocked"
            : "warning",
      `${input.tradesOpenedToday} trades opened today with ${
        capacity.actualCap ?? "unknown"
      } capacity.`,
    ),
    check(
      "recommendations_vs_trades",
      input.tradesOpenedToday <= totalRecommendationsToday ||
        input.tradesOpenedToday === 0
        ? "pass"
        : "warning",
      "Recommendation count should generally exceed actual trades taken.",
    ),
  ];
  const next = buildNextAction({
    recommendationStatus: recommendationTargetStatus,
    capacityStatus: tradeCapacityStatus,
  });

  return {
    summary_id: `daily_recommendation_trade_targets:${input.tradingDate}:${now.toISOString()}`,
    summary_version: "1.0",
    summary_kind: "daily_recommendation_trade_targets",
    generated_at: now.toISOString(),
    trading_date: input.tradingDate,
    per_window_target_min: perWindowTargetMin,
    per_window_target_max: perWindowTargetMax,
    active_windows: [...activeWindows],
    full_day_recommendation_target_min: activeWindows.length * perWindowTargetMin,
    full_day_recommendation_target_max: activeWindows.length * perWindowTargetMax,
    applicable_recommendation_target_min: applicableTargetMin,
    applicable_recommendation_target_max: applicableTargetMax,
    total_recommendations_today: totalRecommendationsToday,
    recommendation_target_status: recommendationTargetStatus,
    recommendation_progress_rate: percent(
      totalRecommendationsToday,
      applicableTargetMin,
    ),
    window_targets: windowTargets,
    desired_daily_trade_capacity: desiredDailyTradeCapacity,
    actual_daily_trade_cap: capacity.actualCap,
    risk_controls_cap_source: capacity.source,
    risk_controls_capacity_note: capacity.note,
    trades_opened_today: input.tradesOpenedToday,
    trades_closed_today: input.tradesClosedToday,
    live_trades_today: input.liveTradesToday,
    remaining_trade_capacity: remainingTradeCapacity,
    trade_capacity_status: tradeCapacityStatus,
    recommendations_per_trade_ratio: recommendationsPerTradeRatio,
    learning_sample_note:
      "Ignored recommendations are learning samples; recommendations do not imply every trade should be taken.",
    checks,
    warnings,
    next_action: next,
    copy: {
      recommendation_target:
        "Ture aims to serve 6-10 recommendations per active window, not force trades.",
      trade_capacity: "The daily trade capacity is a risk limit, not a goal.",
      ignored_recommendations: "Ignored recommendations still help Ture learn.",
      no_trade_days: "No-trade days can still be valid.",
    },
  };
}

export function dailyRecommendationTradeTargetsSummaryJson(
  summary: DailyRecommendationTradeTargetsSummary,
) {
  return JSON.stringify(summary, null, 2);
}
