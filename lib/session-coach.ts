import type { CalibrationGuardrailSeverity } from "@/lib/calibration-guardrails";
import type {
  TradeOutcomeClassification,
  TradeOutcomePrimaryDriver,
} from "@/lib/trade-outcome-explainer";

export type SessionCoachTone = "positive" | "neutral" | "caution" | "warning";

export type SessionCoachStatus =
  | "clean"
  | "mixed"
  | "risky"
  | "poor"
  | "not_enough_data";

export type SessionCoachTheme =
  | "clean_execution"
  | "setup_follow_through"
  | "weak_follow_through"
  | "execution_deterioration"
  | "risk_discipline"
  | "overtrading_risk"
  | "eod_risk"
  | "scanner_selective"
  | "not_enough_data";

export type SessionCoachPoint = {
  code: string;
  tone: SessionCoachTone;
  title: string;
  description: string;
};

export type SessionCoachRecommendation = {
  code: string;
  tone: SessionCoachTone;
  title: string;
  description: string;
};

export type SessionCoachResult = {
  status: SessionCoachStatus;
  tone: SessionCoachTone;
  theme: SessionCoachTheme;
  title: string;
  summary: string;
  points: SessionCoachPoint[];
  recommendations: SessionCoachRecommendation[];
  should_be_cautious_taking_more_trades: boolean;
  generated_at: string;
};

export type SessionCoachTrade = {
  outcome_classification?: TradeOutcomeClassification | string | null;
  primary_driver?: TradeOutcomePrimaryDriver | string | null;
  r_multiple?: number | null;
  pnl?: number | null;
  execution_quality_rating?: string | null;
  handoff_quality_rating?: string | null;
  high_priority_suggestion_count?: number | null;
};

export type SessionCoachEodStatus = {
  status?: string | null;
};

export type SessionCoachScanLog = {
  result?: string | null;
  recommendations_created?: number | null;
};

export type SessionCoachGuardrail = {
  severity?: CalibrationGuardrailSeverity | string | null;
};

export type BuildSessionCoachInput = {
  closedTrades?: SessionCoachTrade[];
  liveTradesCount?: number;
  discardedReviewedCount?: number;
  scanLogs?: SessionCoachScanLog[];
  guardrails?: SessionCoachGuardrail[];
  eodSafetyStatuses?: SessionCoachEodStatus[];
  marketStatus?: string | null;
  currentScanWindow?: string | null;
  generatedAt?: string;
};

function finiteNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function point(
  code: string,
  tone: SessionCoachTone,
  title: string,
  description: string,
): SessionCoachPoint {
  return { code, tone, title, description };
}

function recommendation(
  code: string,
  tone: SessionCoachTone,
  title: string,
  description: string,
): SessionCoachRecommendation {
  return { code, tone, title, description };
}

function addUniqueByCode<T extends { code: string }>(items: T[], item: T) {
  if (!items.some((existing) => existing.code === item.code)) {
    items.push(item);
  }
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

function normalizePrimaryDriver(value: unknown): TradeOutcomePrimaryDriver {
  return value === "setup_quality" ||
    value === "execution_quality" ||
    value === "risk_management" ||
    value === "market_follow_through" ||
    value === "handoff_quality" ||
    value === "costs" ||
    value === "eod_discipline"
    ? value
    : "unknown";
}

function statusTone(status: SessionCoachStatus): SessionCoachTone {
  if (status === "clean") return "positive";
  if (status === "risky") return "caution";
  if (status === "poor") return "warning";
  return "neutral";
}

function themeTitle(theme: SessionCoachTheme) {
  if (theme === "clean_execution") return "Clean execution so far";
  if (theme === "setup_follow_through") return "Setups are following through";
  if (theme === "weak_follow_through") return "Follow-through is weak";
  if (theme === "execution_deterioration") return "Execution is deteriorating";
  if (theme === "risk_discipline") return "Risk discipline is the main theme";
  if (theme === "overtrading_risk") return "Overtrading risk is rising";
  if (theme === "eod_risk") return "End-of-day risk needs attention";
  if (theme === "scanner_selective") return "Scanner is selective";
  return "Not enough data yet";
}

function statusSummary(
  status: SessionCoachStatus,
  theme: SessionCoachTheme,
  cautious: boolean,
) {
  if (status === "not_enough_data") {
    return "There is not enough structured session data yet to coach the day confidently.";
  }

  const cautionCopy = cautious
    ? " Be cautious about taking more trades until the weak spots are reviewed."
    : " Keep following the same validation and risk process.";

  if (status === "clean") {
    return `The session appears clean so far. ${themeTitle(theme).toLowerCase()}.${cautionCopy}`;
  }

  if (status === "mixed") {
    return `The session is mixed. ${themeTitle(theme)} appears to be the main theme.${cautionCopy}`;
  }

  if (status === "risky") {
    return `The session is getting risky. ${themeTitle(theme)} appears to be the main issue.${cautionCopy}`;
  }

  return `The session looks poor based on available data. ${themeTitle(theme)} needs attention before adding risk.${cautionCopy}`;
}

export function buildSessionCoach({
  closedTrades = [],
  liveTradesCount = 0,
  discardedReviewedCount = 0,
  scanLogs = [],
  guardrails = [],
  eodSafetyStatuses = [],
  marketStatus = null,
  currentScanWindow = null,
  generatedAt = new Date().toISOString(),
}: BuildSessionCoachInput): SessionCoachResult {
  const points: SessionCoachPoint[] = [];
  const recommendations: SessionCoachRecommendation[] = [];
  const outcomes = closedTrades.map((trade) =>
    normalizeOutcome(trade.outcome_classification),
  );
  const primaryDrivers = closedTrades.map((trade) =>
    normalizePrimaryDriver(trade.primary_driver),
  );
  const rValues = closedTrades
    .map((trade) => finiteNumber(trade.r_multiple))
    .filter((value): value is number => value !== null);
  const hardLosses = outcomes.filter((outcome) => outcome === "hard_loss").length;
  const losses = outcomes.filter(
    (outcome) => outcome === "small_loss" || outcome === "hard_loss",
  ).length;
  const wins = outcomes.filter(
    (outcome) => outcome === "small_win" || outcome === "strong_win",
  ).length;
  const breakeven = outcomes.filter((outcome) => outcome === "breakeven").length;
  const poorExecutionCount = closedTrades.filter(
    (trade) => trade.execution_quality_rating === "poor",
  ).length;
  const goodExecutionCount = closedTrades.filter(
    (trade) =>
      trade.execution_quality_rating === "excellent" ||
      trade.execution_quality_rating === "good",
  ).length;
  const poorHandoffCount = closedTrades.filter(
    (trade) => trade.handoff_quality_rating === "poor",
  ).length;
  const goodHandoffCount = closedTrades.filter(
    (trade) =>
      trade.handoff_quality_rating === "excellent" ||
      trade.handoff_quality_rating === "good",
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
  const noTradeScans = scanLogs.filter(
    (log) => log.result === "openai_no_trade" || log.result === "no_high_quality_setup",
  ).length;
  const marketIsOpen = marketStatus === "open";
  const isLateDayWindow =
    currentScanWindow === "power_hour" || currentScanWindow === "afternoon";
  const createdRecommendations = scanLogs.reduce(
    (sum, log) => sum + (finiteNumber(log.recommendations_created) ?? 0),
    0,
  );
  const averageR =
    rValues.length === 0
      ? null
      : rValues.reduce((sum, value) => sum + value, 0) / rValues.length;
  const hasMeaningfulData =
    closedTrades.length > 0 ||
    liveTradesCount > 0 ||
    scanLogs.length > 0 ||
    discardedReviewedCount > 0 ||
    eodSafetyStatuses.length > 0;

  if (!hasMeaningfulData) {
    return {
      status: "not_enough_data",
      tone: "neutral",
      theme: "not_enough_data",
      title: "Not enough session data yet",
      summary: "There is not enough structured session data yet to coach the day confidently.",
      points: [
        point(
          "waiting_for_data",
          "neutral",
          "Waiting for more session data",
          "Scans, recommendations, live trades, or closed trades will make the coach more useful.",
        ),
      ],
      recommendations: [
        recommendation(
          "follow_process",
          "neutral",
          "Follow the normal process",
          "Use validation, risk controls, and manual broker confirmation before adding any live trade.",
        ),
      ],
      should_be_cautious_taking_more_trades: false,
      generated_at: generatedAt,
    };
  }

  const hardNegativeSignals =
    hardLosses +
    (poorExecutionCount >= 2 ? 2 : poorExecutionCount) +
    (overnightRiskCount > 0 ? 2 : 0) +
    (highPrioritySuggestions >= 2 ? 2 : highPrioritySuggestions) +
    (warningGuardrails >= 2 ? 1 : 0) +
    (poorHandoffCount >= 2 ? 1 : 0);
  const warningSignals =
    losses +
    breakeven +
    eodReviewCount +
    cautionGuardrails +
    (averageR !== null && averageR < 0 ? 1 : 0);

  let status: SessionCoachStatus = "mixed";

  if (hardLosses >= 2 || overnightRiskCount > 0 || hardNegativeSignals >= 4) {
    status = "poor";
  } else if (hardLosses === 1 || hardNegativeSignals >= 2 || warningSignals >= 4) {
    status = "risky";
  } else if (
    hardLosses === 0 &&
    poorExecutionCount === 0 &&
    highPrioritySuggestions === 0 &&
    overnightRiskCount === 0 &&
    (averageR === null || averageR >= 0) &&
    losses === 0
  ) {
    status = "clean";
  }

  let theme: SessionCoachTheme = "not_enough_data";

  if (overnightRiskCount > 0 || eodReviewCount > 0) {
    theme = "eod_risk";
  } else if (poorExecutionCount > 0) {
    theme = "execution_deterioration";
  } else if (closedTrades.length >= 4 && losses + breakeven >= 3) {
    theme = "overtrading_risk";
  } else if (wins > 0 && primaryDrivers.includes("market_follow_through")) {
    theme = "setup_follow_through";
  } else if (breakeven + losses > wins && closedTrades.length > 0) {
    theme = "weak_follow_through";
  } else if (goodExecutionCount > 0 && goodHandoffCount > 0 && poorExecutionCount === 0) {
    theme = "clean_execution";
  } else if (losses > 0 && hardLosses === 0) {
    theme = "risk_discipline";
  } else if (noTradeScans >= Math.max(2, createdRecommendations * 2)) {
    theme = "scanner_selective";
  }

  const cautious =
    status === "risky" ||
    status === "poor" ||
    hardLosses > 0 ||
    poorExecutionCount >= 2 ||
    overnightRiskCount > 0 ||
    highPrioritySuggestions >= 2 ||
    warningGuardrails >= 2 ||
    eodReviewCount > 0;

  if (goodExecutionCount > 0 && poorExecutionCount === 0) {
    addUniqueByCode(
      points,
      point(
        "execution_clean",
        "positive",
        "Execution quality looks clean so far",
        "Based on available execution metadata, fills are not showing major execution problems.",
      ),
    );
  }

  if (poorExecutionCount > 0) {
    addUniqueByCode(
      points,
      point(
        "execution_poor",
        "warning",
        "Execution quality is a weak spot",
        "One or more closed trades show poor execution quality or difficult fills.",
      ),
    );
    addUniqueByCode(
      recommendations,
      recommendation(
        "avoid_chasing",
        "caution",
        "Avoid chasing entries",
        "Be stricter about planned limit prices before confirming the broker order.",
      ),
    );
  }

  if (wins > 0 && averageR !== null && averageR > 0) {
    addUniqueByCode(
      points,
      point(
        "positive_follow_through",
        "positive",
        "Setups are producing some follow-through",
        "Closed trades are positive on average so far.",
      ),
    );
  }

  if (breakeven + losses > wins && closedTrades.length > 0) {
    addUniqueByCode(
      points,
      point(
        "weak_follow_through",
        "caution",
        "Follow-through is weak",
        "Several trades are breakeven or losing, so entries may not be getting enough continuation.",
      ),
    );
    addUniqueByCode(
      recommendations,
      recommendation(
        "be_selective",
        "caution",
        "Be selective with new trades",
        "Wait for cleaner follow-through and confirmation before adding more risk.",
      ),
    );
  }

  if (hardLosses > 0) {
    addUniqueByCode(
      points,
      point(
        "hard_loss",
        "warning",
        "A hard loss occurred",
        "At least one trade reached a full-risk or worse outcome.",
      ),
    );
    addUniqueByCode(
      recommendations,
      recommendation(
        "pause_after_hard_loss",
        "warning",
        "Consider slowing down after a hard loss",
        "Review the setup and execution before taking another trade today.",
      ),
    );
  } else if (losses > 0) {
    addUniqueByCode(
      points,
      point(
        "losses_contained",
        "neutral",
        "Losses appear contained",
        "Losses are present, but no hard loss is recorded from the available outcome data.",
      ),
    );
  }

  if (overnightRiskCount > 0 || eodReviewCount > 0 || (marketIsOpen && isLateDayWindow && liveTradesCount > 0)) {
    addUniqueByCode(
      points,
      point(
        "eod_risk",
        overnightRiskCount > 0 ? "warning" : "caution",
        "There is end-of-day risk",
        "One or more open day trades may need review before the session ends.",
      ),
    );
    addUniqueByCode(
      recommendations,
      recommendation(
        "prioritize_eod",
        overnightRiskCount > 0 ? "warning" : "caution",
        "Prioritize EOD cleanup",
        "Close or actively manage day trades before the EOD risk window.",
      ),
    );
  }

  if (noTradeScans >= Math.max(2, createdRecommendations * 2) && scanLogs.length > 0) {
    addUniqueByCode(
      points,
      point(
        "scanner_selective",
        "neutral",
        "The scanner is selective today",
        "Several scans produced no-trade decisions, which can be healthy if weak setups are being filtered out.",
      ),
    );
  }

  if (highPrioritySuggestions > 0 || warningGuardrails > 0) {
    addUniqueByCode(
      points,
      point(
        "process_warnings",
        highPrioritySuggestions > 1 || warningGuardrails > 1 ? "warning" : "caution",
        "Process warnings are showing up",
        "Improvement suggestions or calibration guardrails are asking for extra review.",
      ),
    );
  }

  if (points.length === 0) {
    addUniqueByCode(
      points,
      point(
        "session_observed",
        "neutral",
        "Session data is available",
        "The coach has some structured data, but no strong theme stands out yet.",
      ),
    );
  }

  if (recommendations.length === 0) {
    addUniqueByCode(
      recommendations,
      recommendation(
        status === "clean" ? "keep_process" : "review_before_more",
        status === "clean" ? "positive" : "neutral",
        status === "clean" ? "Keep following the same process" : "Review before adding risk",
        status === "clean"
          ? "The current session looks clean; keep using validation and planned risk controls."
          : "Use the session signals as a quick checkpoint before taking another trade.",
      ),
    );
  }

  const tone = statusTone(status);

  return {
    status,
    tone,
    theme,
    title: themeTitle(theme),
    summary: statusSummary(status, theme, cautious),
    points: points.slice(0, 6),
    recommendations: recommendations.slice(0, 4),
    should_be_cautious_taking_more_trades: cautious,
    generated_at: generatedAt,
  };
}
