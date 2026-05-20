import type { CalibrationGuardrailSeverity } from "@/lib/calibration-guardrails";
import type { SessionCoachResult } from "@/lib/session-coach";
import type { TradeOutcomeClassification } from "@/lib/trade-outcome-explainer";

export type CooldownAdvisoryLevel = "none" | "watch" | "pause" | "stop_for_day";

export type CooldownAdvisoryReasonSeverity =
  | "info"
  | "caution"
  | "warning"
  | "critical";

export type CooldownAdvisoryReason = {
  code: string;
  severity: CooldownAdvisoryReasonSeverity;
  title: string;
  description: string;
};

export type CooldownAdvisoryResult = {
  level: CooldownAdvisoryLevel;
  title: string;
  summary: string;
  reasons: CooldownAdvisoryReason[];
  suggested_action: string;
  is_advisory_only: true;
  generated_at: string;
};

export type CooldownAdvisoryTrade = {
  outcome_classification?: TradeOutcomeClassification | string | null;
  r_multiple?: number | null;
  execution_quality_rating?: string | null;
  handoff_quality_rating?: string | null;
  high_priority_suggestion_count?: number | null;
};

export type CooldownAdvisoryEodStatus = {
  status?: string | null;
};

export type CooldownAdvisoryScanLog = {
  result?: string | null;
  recommendations_created?: number | null;
};

export type CooldownAdvisoryGuardrail = {
  severity?: CalibrationGuardrailSeverity | string | null;
};

export type BuildCooldownAdvisoryInput = {
  sessionCoach?: SessionCoachResult | null;
  closedTrades?: CooldownAdvisoryTrade[];
  liveTradesCount?: number;
  scanLogs?: CooldownAdvisoryScanLog[];
  guardrails?: CooldownAdvisoryGuardrail[];
  eodSafetyStatuses?: CooldownAdvisoryEodStatus[];
  marketStatus?: string | null;
  currentScanWindow?: string | null;
  generatedAt?: string;
};

function finiteNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function normalizeOutcome(value: unknown): TradeOutcomeClassification {
  return value === "strong_win" ||
    value === "small_win" ||
    value === "breakeven" ||
    value === "small_loss" ||
    value === "hard_loss"
    ? value
    : "unknown";
}

function reason(
  code: string,
  severity: CooldownAdvisoryReasonSeverity,
  title: string,
  description: string,
): CooldownAdvisoryReason {
  return { code, severity, title, description };
}

function addReason(
  reasons: CooldownAdvisoryReason[],
  item: CooldownAdvisoryReason,
) {
  if (!reasons.some((existing) => existing.code === item.code)) {
    reasons.push(item);
  }
}

function severityWeight(value: CooldownAdvisoryReasonSeverity) {
  if (value === "critical") return 0;
  if (value === "warning") return 1;
  if (value === "caution") return 2;
  return 3;
}

function levelWeight(value: CooldownAdvisoryLevel) {
  if (value === "stop_for_day") return 3;
  if (value === "pause") return 2;
  if (value === "watch") return 1;
  return 0;
}

function maxLevel(...levels: CooldownAdvisoryLevel[]) {
  return levels.reduce<CooldownAdvisoryLevel>(
    (current, next) => (levelWeight(next) > levelWeight(current) ? next : current),
    "none",
  );
}

function titleForLevel(level: CooldownAdvisoryLevel) {
  if (level === "stop_for_day") return "Consider stopping for the day";
  if (level === "pause") return "Consider a cooldown pause";
  if (level === "watch") return "Trade selectively";
  return "No cooldown needed";
}

function actionForLevel(level: CooldownAdvisoryLevel) {
  if (level === "stop_for_day") {
    return "Consider stopping for the day. Session conditions have deteriorated.";
  }

  if (level === "pause") {
    return "Consider pausing before taking another trade. Review only the next very clean setup.";
  }

  if (level === "watch") {
    return "Keep trading selectively. Do not chase weaker setups.";
  }

  return "No cooldown needed. Keep following the plan.";
}

function summaryForLevel(level: CooldownAdvisoryLevel, reasonCount: number) {
  if (level === "stop_for_day") {
    return `Based on current session data, the strongest advisory is to stop for the day. ${reasonCount} risk signal${reasonCount === 1 ? "" : "s"} found.`;
  }

  if (level === "pause") {
    return `Based on current session data, a short pause is worth considering before adding more risk. ${reasonCount} caution signal${reasonCount === 1 ? "" : "s"} found.`;
  }

  if (level === "watch") {
    return "Session conditions are not severe, but selective trading is still appropriate.";
  }

  return "No cooldown signal is active from the current structured session data.";
}

export function buildCooldownAdvisory({
  sessionCoach = null,
  closedTrades = [],
  liveTradesCount = 0,
  scanLogs = [],
  guardrails = [],
  eodSafetyStatuses = [],
  marketStatus = null,
  currentScanWindow = null,
  generatedAt = new Date().toISOString(),
}: BuildCooldownAdvisoryInput): CooldownAdvisoryResult {
  const reasons: CooldownAdvisoryReason[] = [];
  const outcomes = closedTrades.map((trade) =>
    normalizeOutcome(trade.outcome_classification),
  );
  const rValues = closedTrades
    .map((trade) => finiteNumber(trade.r_multiple))
    .filter((value): value is number => value !== null);
  const totalR =
    rValues.length === 0
      ? null
      : rValues.reduce((sum, value) => sum + value, 0);
  const hardLosses = outcomes.filter((outcome) => outcome === "hard_loss").length;
  const losses = outcomes.filter(
    (outcome) => outcome === "small_loss" || outcome === "hard_loss",
  ).length;
  const breakeven = outcomes.filter((outcome) => outcome === "breakeven").length;
  const poorExecutionCount = closedTrades.filter(
    (trade) => trade.execution_quality_rating === "poor",
  ).length;
  const poorHandoffCount = closedTrades.filter(
    (trade) => trade.handoff_quality_rating === "poor",
  ).length;
  const highPrioritySuggestions = closedTrades.reduce(
    (sum, trade) => sum + (finiteNumber(trade.high_priority_suggestion_count) ?? 0),
    0,
  );
  const warningGuardrails = guardrails.filter(
    (guardrail) => guardrail.severity === "warning",
  ).length;
  const cautionGuardrails = guardrails.filter(
    (guardrail) => guardrail.severity === "caution",
  ).length;
  const eodReviewCount = eodSafetyStatuses.filter(
    (status) =>
      status.status === "review_required" || status.status === "approaching_close",
  ).length;
  const overnightRiskCount = eodSafetyStatuses.filter(
    (status) => status.status === "overnight_risk",
  ).length;
  const marketClosedWithOpenTrade =
    (marketStatus === "closed" || marketStatus === "closed_today") &&
    liveTradesCount > 0;
  const lateDayOpenTrade =
    marketStatus === "open" &&
    liveTradesCount > 0 &&
    (currentScanWindow === "afternoon" || currentScanWindow === "power_hour");
  const noTradeScans = scanLogs.filter(
    (log) => log.result === "openai_no_trade" || log.result === "no_high_quality_setup",
  ).length;
  const createdRecommendations = scanLogs.reduce(
    (sum, log) => sum + (finiteNumber(log.recommendations_created) ?? 0),
    0,
  );
  let level: CooldownAdvisoryLevel = "none";

  if (sessionCoach?.status === "poor") {
    addReason(
      reasons,
      reason(
        "poor_session_coach",
        "critical",
        "Session coach says poor",
        "The automatic session coach sees serious deterioration in today’s session.",
      ),
    );
    level = maxLevel(level, "stop_for_day");
  } else if (sessionCoach?.status === "risky") {
    addReason(
      reasons,
      reason(
        "risky_session_coach",
        "warning",
        "Session coach says risky",
        "The automatic session coach recommends caution before adding more risk.",
      ),
    );
    level = maxLevel(level, "pause");
  } else if (sessionCoach?.status === "mixed") {
    addReason(
      reasons,
      reason(
        "mixed_session_coach",
        "info",
        "Session is mixed",
        "The day is not clearly clean or poor, so selective trading is appropriate.",
      ),
    );
    level = maxLevel(level, "watch");
  }

  if (hardLosses >= 2) {
    addReason(
      reasons,
      reason(
        "multiple_hard_losses_today",
        "critical",
        "Multiple hard losses today",
        "More than one closed trade reached a full-risk or worse outcome.",
      ),
    );
    level = maxLevel(level, "stop_for_day");
  } else if (hardLosses === 1) {
    addReason(
      reasons,
      reason(
        "hard_loss_today",
        "warning",
        "Hard loss today",
        "One closed trade reached a full-risk or worse outcome.",
      ),
    );
    level = maxLevel(level, "pause");
  }

  if (totalR !== null && totalR <= -2) {
    addReason(
      reasons,
      reason(
        "large_negative_total_r",
        "critical",
        "Large negative total R",
        `Closed trades total ${totalR.toFixed(2)}R today.`,
      ),
    );
    level = maxLevel(level, "stop_for_day");
  }

  if (losses >= 3) {
    addReason(
      reasons,
      reason(
        "multiple_losses_today",
        "warning",
        "Multiple losses today",
        "Several closed trades are losing trades.",
      ),
    );
    level = maxLevel(level, "pause");
  } else if (losses > 0 || breakeven > 0) {
    addReason(
      reasons,
      reason(
        "mixed_trade_outcomes",
        "info",
        "Mixed trade outcomes",
        "There are small losses or breakeven trades in today’s session.",
      ),
    );
    level = maxLevel(level, "watch");
  }

  if (poorExecutionCount >= 2) {
    addReason(
      reasons,
      reason(
        "repeated_poor_execution",
        "critical",
        "Repeated poor execution",
        "Multiple trades show poor execution quality.",
      ),
    );
    level = maxLevel(level, "stop_for_day");
  } else if (poorExecutionCount === 1) {
    addReason(
      reasons,
      reason(
        "poor_execution_detected",
        "warning",
        "Poor execution detected",
        "One trade shows poor execution quality.",
      ),
    );
    level = maxLevel(level, "pause");
  }

  if (highPrioritySuggestions >= 2) {
    addReason(
      reasons,
      reason(
        "high_priority_suggestions",
        "warning",
        "Several high-priority improvement suggestions",
        "Multiple closed trades generated high-priority execution improvement suggestions.",
      ),
    );
    level = maxLevel(level, "pause");
  }

  if (warningGuardrails >= 2) {
    addReason(
      reasons,
      reason(
        "repeated_guardrail_warnings",
        "warning",
        "Repeated calibration warnings",
        "Calibration guardrails are showing multiple warning signals.",
      ),
    );
    level = maxLevel(level, "pause");
  } else if (warningGuardrails > 0 || cautionGuardrails > 0) {
    addReason(
      reasons,
      reason(
        "calibration_cautions",
        "caution",
        "Calibration cautions are active",
        "Guardrails are asking for extra selectivity.",
      ),
    );
    level = maxLevel(level, "watch");
  }

  if (overnightRiskCount > 0 || marketClosedWithOpenTrade) {
    addReason(
      reasons,
      reason(
        "overnight_risk",
        "critical",
        "Overnight risk on a day trade",
        "A day trade appears to be open after the safe intraday window.",
      ),
    );
    level = maxLevel(level, "stop_for_day");
  } else if (eodReviewCount > 0 || lateDayOpenTrade) {
    addReason(
      reasons,
      reason(
        "eod_review_required",
        "warning",
        "EOD review required",
        "An open day trade may need attention before the close.",
      ),
    );
    level = maxLevel(level, "pause");
  }

  if (poorHandoffCount >= 2) {
    addReason(
      reasons,
      reason(
        "repeated_handoff_quality_issues",
        "warning",
        "Repeated handoff quality issues",
        "Multiple trades show poor handoff quality.",
      ),
    );
    level = maxLevel(level, "pause");
  }

  if (closedTrades.length >= 4 && losses + breakeven >= 3) {
    addReason(
      reasons,
      reason(
        "overtrading_risk",
        "warning",
        "Overtrading risk",
        "Several trades have been taken while outcomes are mixed or negative.",
      ),
    );
    level = maxLevel(level, "pause");
  }

  if (noTradeScans >= Math.max(2, createdRecommendations * 2) && level === "none") {
    addReason(
      reasons,
      reason(
        "scanner_selective",
        "info",
        "Scanner is selective",
        "Several scans avoided creating trades, which can be healthy in weak conditions.",
      ),
    );
    level = maxLevel(level, "watch");
  }

  const hasData =
    closedTrades.length > 0 ||
    liveTradesCount > 0 ||
    scanLogs.length > 0 ||
    guardrails.length > 0 ||
    eodSafetyStatuses.length > 0;

  if (!hasData) {
    addReason(
      reasons,
      reason(
        "not_enough_data",
        "info",
        "Not enough session data",
        "The advisory will become more useful after scans, trades, or EOD safety checks appear.",
      ),
    );
    level = "none";
  }

  const sortedReasons = reasons
    .sort(
      (first, second) =>
        severityWeight(first.severity) - severityWeight(second.severity) ||
        first.title.localeCompare(second.title),
    )
    .slice(0, 5);

  return {
    level,
    title: titleForLevel(level),
    summary: summaryForLevel(level, sortedReasons.length),
    reasons: sortedReasons,
    suggested_action: actionForLevel(level),
    is_advisory_only: true,
    generated_at: generatedAt,
  };
}
