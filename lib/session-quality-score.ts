import type { CalibrationGuardrailSeverity } from "@/lib/calibration-guardrails";
import type { CooldownAdvisoryResult } from "@/lib/cooldown-advisory";
import type { SessionCoachResult } from "@/lib/session-coach";
import type { TradeOutcomeClassification } from "@/lib/trade-outcome-explainer";

export type SessionQualityGrade = "A" | "B" | "C" | "D" | "N/A";

export type SessionQualityLabel =
  | "clean_process"
  | "good_but_mixed"
  | "risky_session"
  | "poor_session"
  | "not_enough_data";

export type SessionQualityFactorImpact =
  | "positive"
  | "neutral"
  | "warning"
  | "negative";

export type SessionQualityFactor = {
  code: string;
  label: string;
  impact: SessionQualityFactorImpact;
  description: string;
  points: number;
};

export type SessionQualityScoreResult = {
  grade: SessionQualityGrade;
  score: number | null;
  label: SessionQualityLabel;
  title: string;
  summary: string;
  factors: SessionQualityFactor[];
  generated_at: string;
};

export type SessionQualityTrade = {
  outcome_classification?: TradeOutcomeClassification | string | null;
  r_multiple?: number | null;
  pnl?: number | null;
  execution_quality_rating?: string | null;
  handoff_quality_rating?: string | null;
  high_priority_suggestion_count?: number | null;
};

export type SessionQualityEodStatus = {
  status?: string | null;
};

export type SessionQualityScanLog = {
  result?: string | null;
  recommendations_created?: number | null;
};

export type SessionQualityGuardrail = {
  severity?: CalibrationGuardrailSeverity | string | null;
};

export type CalculateSessionQualityScoreInput = {
  sessionCoach?: SessionCoachResult | null;
  cooldownAdvisory?: CooldownAdvisoryResult | null;
  closedTrades?: SessionQualityTrade[];
  liveTradesCount?: number;
  scanLogs?: SessionQualityScanLog[];
  guardrails?: SessionQualityGuardrail[];
  eodSafetyStatuses?: SessionQualityEodStatus[];
  totalR?: number | null;
  totalPnl?: number | null;
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

function factor(
  code: string,
  label: string,
  impact: SessionQualityFactorImpact,
  description: string,
  points: number,
): SessionQualityFactor {
  return { code, label, impact, description, points };
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function gradeForScore(score: number | null): SessionQualityGrade {
  if (score === null) return "N/A";
  if (score >= 85) return "A";
  if (score >= 70) return "B";
  if (score >= 50) return "C";
  return "D";
}

function labelForGrade(grade: SessionQualityGrade): SessionQualityLabel {
  if (grade === "A") return "clean_process";
  if (grade === "B") return "good_but_mixed";
  if (grade === "C") return "risky_session";
  if (grade === "D") return "poor_session";
  return "not_enough_data";
}

function titleForGrade(grade: SessionQualityGrade) {
  if (grade === "A") return "Clean process";
  if (grade === "B") return "Good but mixed";
  if (grade === "C") return "Risky session";
  if (grade === "D") return "Poor session quality";
  return "Not enough data";
}

function summaryForGrade(grade: SessionQualityGrade) {
  if (grade === "A") {
    return "Clean process today. Execution and risk signals look controlled based on available data.";
  }

  if (grade === "B") {
    return "Good but mixed session. There are some warnings, but no major breakdown in process.";
  }

  if (grade === "C") {
    return "Risky session. Several signals suggest caution before taking more trades.";
  }

  if (grade === "D") {
    return "Poor session quality. Consider stopping for the day and avoid forcing new trades.";
  }

  return "Not enough session data yet to grade the day.";
}

function factorImpact(points: number): SessionQualityFactorImpact {
  if (points > 0) return "positive";
  if (points < -12) return "negative";
  if (points < 0) return "warning";
  return "neutral";
}

export function calculateSessionQualityScore({
  sessionCoach = null,
  cooldownAdvisory = null,
  closedTrades = [],
  liveTradesCount = 0,
  scanLogs = [],
  guardrails = [],
  eodSafetyStatuses = [],
  totalR = null,
  totalPnl = null,
  generatedAt = new Date().toISOString(),
}: CalculateSessionQualityScoreInput): SessionQualityScoreResult {
  const hasMeaningfulData =
    closedTrades.length > 0 ||
    liveTradesCount > 0 ||
    scanLogs.length > 0 ||
    guardrails.length > 0 ||
    eodSafetyStatuses.length > 0 ||
    sessionCoach?.status !== "not_enough_data";

  if (!hasMeaningfulData) {
    return {
      grade: "N/A",
      score: null,
      label: "not_enough_data",
      title: titleForGrade("N/A"),
      summary: summaryForGrade("N/A"),
      factors: [
        factor(
          "not_enough_data",
          "Not enough data",
          "neutral",
          "Scans, trades, or EOD safety signals will make the grade meaningful.",
          0,
        ),
      ],
      generated_at: generatedAt,
    };
  }

  const factors: SessionQualityFactor[] = [];
  const outcomes = closedTrades.map((trade) =>
    normalizeOutcome(trade.outcome_classification),
  );
  const hardLosses = outcomes.filter((outcome) => outcome === "hard_loss").length;
  const strongWins = outcomes.filter((outcome) => outcome === "strong_win").length;
  const smallLosses = outcomes.filter((outcome) => outcome === "small_loss").length;
  const poorExecutionCount = closedTrades.filter(
    (trade) => trade.execution_quality_rating === "poor",
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
  const createdRecommendations = scanLogs.reduce(
    (sum, log) => sum + (finiteNumber(log.recommendations_created) ?? 0),
    0,
  );
  const resolvedTotalR =
    finiteNumber(totalR) ??
    (() => {
      const values = closedTrades
        .map((trade) => finiteNumber(trade.r_multiple))
        .filter((value): value is number => value !== null);
      return values.length === 0
        ? null
        : values.reduce((sum, value) => sum + value, 0);
    })();
  const resolvedTotalPnl =
    finiteNumber(totalPnl) ??
    (() => {
      const values = closedTrades
        .map((trade) => finiteNumber(trade.pnl))
        .filter((value): value is number => value !== null);
      return values.length === 0
        ? null
        : values.reduce((sum, value) => sum + value, 0);
    })();
  let score = 100;

  function addFactor(
    code: string,
    label: string,
    points: number,
    description: string,
  ) {
    score += points;
    factors.push(factor(code, label, factorImpact(points), description, points));
  }

  if (sessionCoach?.status === "clean") {
    addFactor(
      "coach_clean",
      "Clean session coach",
      0,
      "The automatic session coach sees a clean process so far.",
    );
  } else if (sessionCoach?.status === "mixed") {
    addFactor(
      "coach_mixed",
      "Mixed session coach",
      -10,
      "The automatic session coach sees mixed conditions.",
    );
  } else if (sessionCoach?.status === "risky") {
    addFactor(
      "coach_risky",
      "Risky session coach",
      -25,
      "The automatic session coach sees risk building.",
    );
  } else if (sessionCoach?.status === "poor") {
    addFactor(
      "coach_poor",
      "Poor session coach",
      -40,
      "The automatic session coach sees serious session deterioration.",
    );
  }

  if (cooldownAdvisory?.level === "none") {
    addFactor(
      "cooldown_none",
      "No cooldown active",
      0,
      "The cooldown advisory does not recommend a pause.",
    );
  } else if (cooldownAdvisory?.level === "watch") {
    addFactor(
      "cooldown_watch",
      "Cooldown watch",
      -5,
      "The cooldown advisory recommends selective trading.",
    );
  } else if (cooldownAdvisory?.level === "pause") {
    addFactor(
      "cooldown_pause",
      "Cooldown pause",
      -20,
      "The cooldown advisory suggests pausing before another trade.",
    );
  } else if (cooldownAdvisory?.level === "stop_for_day") {
    addFactor(
      "cooldown_stop",
      "Stop-for-day advisory",
      -35,
      "The cooldown advisory suggests stopping for the day.",
    );
  }

  if (resolvedTotalR !== null && resolvedTotalR > 0) {
    addFactor(
      "positive_total_r",
      "Positive total R",
      5,
      `Closed trades total ${resolvedTotalR.toFixed(2)}R.`,
    );
  } else if (resolvedTotalR !== null && resolvedTotalR < 0) {
    const penalty = resolvedTotalR <= -2 ? -30 : resolvedTotalR <= -1 ? -20 : -10;
    addFactor(
      "negative_total_r",
      "Negative total R",
      penalty,
      `Closed trades total ${resolvedTotalR.toFixed(2)}R.`,
    );
  } else if (resolvedTotalPnl !== null && resolvedTotalPnl > 0) {
    addFactor(
      "positive_total_pnl",
      "Positive total PnL",
      3,
      "Closed trades are positive on gross PnL.",
    );
  } else if (resolvedTotalPnl !== null && resolvedTotalPnl < 0) {
    addFactor(
      "negative_total_pnl",
      "Negative total PnL",
      -10,
      "Closed trades are negative on gross PnL.",
    );
  }

  if (hardLosses === 0 && closedTrades.length > 0) {
    addFactor(
      "no_hard_losses",
      "No hard losses",
      5,
      "No closed trade reached a hard-loss outcome.",
    );
  } else if (hardLosses > 0) {
    addFactor(
      "hard_losses",
      "Hard losses",
      Math.max(-55, hardLosses * -20 + (hardLosses > 1 ? -15 : 0)),
      `${hardLosses} hard loss${hardLosses === 1 ? "" : "es"} recorded today.`,
    );
  }

  if (poorExecutionCount === 0 && closedTrades.length > 0) {
    addFactor(
      "no_poor_execution",
      "No poor execution",
      5,
      "Closed trades do not show poor execution quality.",
    );
  } else if (poorExecutionCount > 0) {
    addFactor(
      "poor_execution",
      "Poor execution",
      Math.max(-35, poorExecutionCount * -15),
      `${poorExecutionCount} trade${poorExecutionCount === 1 ? "" : "s"} show poor execution quality.`,
    );
  }

  if (goodHandoffCount > 0 && goodHandoffCount >= Math.max(1, closedTrades.length - 1)) {
    addFactor(
      "good_handoff_quality",
      "Good handoff quality",
      5,
      "Most closed trades with metadata show good or excellent handoff quality.",
    );
  }

  if (overnightRiskCount > 0) {
    addFactor(
      "overnight_risk",
      "Overnight risk",
      -35,
      "A day trade appears to have overnight risk.",
    );
  } else if (eodReviewCount > 0) {
    addFactor(
      "eod_review_required",
      "EOD review required",
      -20,
      "One or more open day trades need end-of-day review.",
    );
  } else {
    addFactor(
      "no_eod_risk",
      "No EOD risk",
      5,
      "No end-of-day risk is currently detected.",
    );
  }

  if (highPrioritySuggestions > 0) {
    addFactor(
      "high_priority_suggestions",
      "High-priority suggestions",
      Math.max(-30, highPrioritySuggestions * -8),
      `${highPrioritySuggestions} high-priority improvement suggestion${highPrioritySuggestions === 1 ? "" : "s"} found.`,
    );
  }

  if (warningGuardrails > 0) {
    addFactor(
      "guardrail_warnings",
      "Calibration warnings",
      warningGuardrails >= 2 ? -10 : -5,
      `${warningGuardrails} calibration warning${warningGuardrails === 1 ? "" : "s"} active.`,
    );
  }

  if (noTradeScans >= Math.max(2, createdRecommendations * 2) && smallLosses === 0) {
    addFactor(
      "scanner_selective",
      "Scanner selective",
      3,
      "The scanner avoided several weak or no-trade situations.",
    );
  }

  if (strongWins > 0) {
    addFactor(
      "strong_wins",
      "Strong wins",
      Math.min(5, strongWins * 3),
      `${strongWins} strong win${strongWins === 1 ? "" : "s"} recorded today.`,
    );
  }

  const grade = gradeForScore(clampScore(score));
  const finalScore = clampScore(score);

  return {
    grade,
    score: finalScore,
    label: labelForGrade(grade),
    title: titleForGrade(grade),
    summary: summaryForGrade(grade),
    factors: factors
      .sort((first, second) => Math.abs(second.points) - Math.abs(first.points))
      .slice(0, 8),
    generated_at: generatedAt,
  };
}
