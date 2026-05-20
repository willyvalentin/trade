import type { CalibrationGuardrailResult } from "@/lib/calibration-guardrails";
import type { CooldownAdvisoryResult } from "@/lib/cooldown-advisory";
import type { SessionCoachResult } from "@/lib/session-coach";
import type { SessionQualityScoreResult } from "@/lib/session-quality-score";
import { getSetupTypeLabel, normalizeSetupType } from "@/lib/setup-types";

export type PreTradeRiskContextLevel = "clear" | "watch" | "caution" | "avoid";

export type PreTradeRiskContextSignalType =
  | "session_quality"
  | "cooldown"
  | "session_coach"
  | "calibration"
  | "eod"
  | "setup_type"
  | "execution_quality"
  | "market_context"
  | "data_quality";

export type PreTradeRiskContextSignal = {
  code: string;
  type: PreTradeRiskContextSignalType;
  level: PreTradeRiskContextLevel;
  title: string;
  description: string;
};

export type PreTradeRiskContextResult = {
  level: PreTradeRiskContextLevel;
  title: string;
  summary: string;
  signals: PreTradeRiskContextSignal[];
  suggested_action: string;
  is_advisory_only: true;
  generated_at: string;
};

export type BuildPreTradeRiskContextInput = {
  recommendation?: {
    setup_type?: unknown;
    confidence_score?: number | null;
    freshness?: string | null;
    add_trade_gate_blocked?: boolean | null;
  } | null;
  sessionCoach?: SessionCoachResult | null;
  cooldownAdvisory?: CooldownAdvisoryResult | null;
  sessionQualityScore?: SessionQualityScoreResult | null;
  calibrationGuardrails?: CalibrationGuardrailResult | null;
  currentScanWindow?: string | null;
  marketStatus?: string | null;
  eodSafetyStatuses?: { status?: string | null }[];
  poorExecutionTodayCount?: number;
  highPrioritySuggestionCount?: number;
  generatedAt?: string;
};

function levelWeight(level: PreTradeRiskContextLevel) {
  if (level === "avoid") return 3;
  if (level === "caution") return 2;
  if (level === "watch") return 1;
  return 0;
}

function maxLevel(levels: PreTradeRiskContextLevel[]) {
  return levels.reduce<PreTradeRiskContextLevel>(
    (current, next) => (levelWeight(next) > levelWeight(current) ? next : current),
    "clear",
  );
}

function signal(
  code: string,
  type: PreTradeRiskContextSignalType,
  level: PreTradeRiskContextLevel,
  title: string,
  description: string,
): PreTradeRiskContextSignal {
  return { code, type, level, title, description };
}

function addSignal(
  signals: Map<string, PreTradeRiskContextSignal>,
  item: PreTradeRiskContextSignal,
) {
  if (!signals.has(item.code)) {
    signals.set(item.code, item);
  }
}

function titleForLevel(level: PreTradeRiskContextLevel) {
  if (level === "avoid") return "Risk context is unfavorable";
  if (level === "caution") return "Use extra caution";
  if (level === "watch") return "Proceed selectively";
  return "Context looks clear";
}

function actionForLevel(level: PreTradeRiskContextLevel) {
  if (level === "avoid") {
    return "Consider skipping new trades for now. Session or risk context is unfavorable.";
  }

  if (level === "caution") {
    return "Be cautious. Only take this if the setup remains very clean after validation.";
  }

  if (level === "watch") {
    return "Proceed selectively. Confirm the setup is still fresh before ADD TRADE.";
  }

  return "Session context looks clean. Continue following the normal validation flow.";
}

function summaryForLevel(level: PreTradeRiskContextLevel, signalCount: number) {
  if (level === "avoid") {
    return `Current session context has ${signalCount} risk signal${signalCount === 1 ? "" : "s"}. This panel is advisory, but skipping new trades may be prudent.`;
  }

  if (level === "caution") {
    return `Current session context has ${signalCount} caution signal${signalCount === 1 ? "" : "s"}. Validate the setup carefully before taking risk.`;
  }

  if (level === "watch") {
    return signalCount === 0
      ? "Limited session data is available, so treat this as a selective trading environment."
      : `Current session context has ${signalCount} light watch signal${signalCount === 1 ? "" : "s"}.`;
  }

  return "No major pre-trade session risk signal is active from the available structured data.";
}

export function buildPreTradeRiskContext({
  recommendation = null,
  sessionCoach = null,
  cooldownAdvisory = null,
  sessionQualityScore = null,
  calibrationGuardrails = null,
  currentScanWindow = null,
  marketStatus = null,
  eodSafetyStatuses = [],
  poorExecutionTodayCount = 0,
  highPrioritySuggestionCount = 0,
  generatedAt = new Date().toISOString(),
}: BuildPreTradeRiskContextInput): PreTradeRiskContextResult {
  const signals = new Map<string, PreTradeRiskContextSignal>();
  const levels: PreTradeRiskContextLevel[] = ["clear"];
  const setupType = normalizeSetupType(recommendation?.setup_type);
  const confidenceScore =
    typeof recommendation?.confidence_score === "number" &&
    Number.isFinite(recommendation.confidence_score)
      ? recommendation.confidence_score
      : null;

  if (!sessionQualityScore || sessionQualityScore.grade === "N/A") {
    levels.push("watch");
    addSignal(
      signals,
      signal(
        "limited_session_quality_data",
        "data_quality",
        "watch",
        "Limited session quality data",
        "There is not enough session data yet to grade the day confidently.",
      ),
    );
  } else if (sessionQualityScore.grade === "D") {
    levels.push("avoid");
    addSignal(
      signals,
      signal(
        "session_quality_d",
        "session_quality",
        "avoid",
        "Session quality is poor",
        sessionQualityScore.summary,
      ),
    );
  } else if (sessionQualityScore.grade === "C") {
    levels.push("caution");
    addSignal(
      signals,
      signal(
        "session_quality_c",
        "session_quality",
        "caution",
        "Session quality is risky",
        sessionQualityScore.summary,
      ),
    );
  } else if (sessionQualityScore.grade === "B") {
    levels.push("watch");
    addSignal(
      signals,
      signal(
        "session_quality_b",
        "session_quality",
        "watch",
        "Session is good but mixed",
        sessionQualityScore.summary,
      ),
    );
  } else {
    addSignal(
      signals,
      signal(
        "clean_session_quality",
        "session_quality",
        "clear",
        "Session quality looks clean",
        sessionQualityScore.summary,
      ),
    );
  }

  if (cooldownAdvisory?.level === "stop_for_day") {
    levels.push("avoid");
    addSignal(
      signals,
      signal(
        "cooldown_stop_for_day",
        "cooldown",
        "avoid",
        "Cooldown says stop for the day",
        cooldownAdvisory.suggested_action,
      ),
    );
  } else if (cooldownAdvisory?.level === "pause") {
    levels.push("caution");
    addSignal(
      signals,
      signal(
        "cooldown_pause",
        "cooldown",
        "caution",
        "Cooldown pause is active",
        cooldownAdvisory.suggested_action,
      ),
    );
  } else if (cooldownAdvisory?.level === "watch") {
    levels.push("watch");
    addSignal(
      signals,
      signal(
        "cooldown_watch",
        "cooldown",
        "watch",
        "Cooldown watch is active",
        cooldownAdvisory.suggested_action,
      ),
    );
  }

  if (sessionCoach?.status === "poor") {
    levels.push("avoid");
    addSignal(
      signals,
      signal(
        "poor_session_coach",
        "session_coach",
        "avoid",
        "Session coach is poor",
        sessionCoach.summary,
      ),
    );
  } else if (sessionCoach?.status === "risky") {
    levels.push("caution");
    addSignal(
      signals,
      signal(
        "risky_session_coach",
        "session_coach",
        "caution",
        "Session coach is risky",
        sessionCoach.summary,
      ),
    );
  } else if (sessionCoach?.status === "mixed") {
    levels.push("watch");
    addSignal(
      signals,
      signal(
        "mixed_session_coach",
        "session_coach",
        "watch",
        "Session coach is mixed",
        sessionCoach.summary,
      ),
    );
  }

  const guardrails = calibrationGuardrails?.guardrails ?? [];
  const warningGuardrails = guardrails.filter(
    (guardrail) => guardrail.severity === "warning",
  );
  const cautionGuardrails = guardrails.filter(
    (guardrail) => guardrail.severity === "caution",
  );
  const sampleGuardrails = guardrails.filter(
    (guardrail) => guardrail.scope === "sample_size",
  );

  if (warningGuardrails.length > 0) {
    levels.push(warningGuardrails.length >= 2 ? "caution" : "caution");
    addSignal(
      signals,
      signal(
        "calibration_warnings",
        "calibration",
        "caution",
        "Calibration warning active",
        warningGuardrails[0]?.description ?? "Current calibration data has warning signals.",
      ),
    );
  } else if (cautionGuardrails.length > 0) {
    levels.push("caution");
    addSignal(
      signals,
      signal(
        "calibration_cautions",
        "calibration",
        "caution",
        "Calibration caution active",
        cautionGuardrails[0]?.description ?? "Current calibration data has caution signals.",
      ),
    );
  } else if (sampleGuardrails.length > 0) {
    levels.push("watch");
    addSignal(
      signals,
      signal(
        "limited_calibration_sample",
        "calibration",
        "watch",
        "Limited calibration sample",
        sampleGuardrails[0]?.description ?? "Calibration data is still early.",
      ),
    );
  }

  if (
    guardrails.some((guardrail) => guardrail.code.startsWith("setup_underperforming"))
  ) {
    levels.push("caution");
    addSignal(
      signals,
      signal(
        "setup_type_underperforming",
        "setup_type",
        "caution",
        `${getSetupTypeLabel(setupType)} is underperforming`,
        "Historical calibration suggests this setup type needs stronger confirmation.",
      ),
    );
  }

  if (
    guardrails.some((guardrail) =>
      guardrail.code.includes("confidence_bucket_underperforming"),
    ) ||
    guardrails.some((guardrail) => guardrail.scope === "confidence_bucket" && guardrail.severity !== "info")
  ) {
    levels.push("caution");
    addSignal(
      signals,
      signal(
        "confidence_bucket_underperforming",
        "calibration",
        "caution",
        "Confidence bucket needs review",
        "Do not rely on confidence alone; confirm intraday context and setup freshness.",
      ),
    );
  }

  const eodReviewCount = eodSafetyStatuses.filter(
    (status) =>
      status.status === "review_required" || status.status === "approaching_close",
  ).length;
  const overnightRiskCount = eodSafetyStatuses.filter(
    (status) => status.status === "overnight_risk",
  ).length;

  if (overnightRiskCount > 0) {
    levels.push("avoid");
    addSignal(
      signals,
      signal(
        "overnight_risk",
        "eod",
        "avoid",
        "Overnight risk is active",
        "A day trade appears to be open after the intended intraday window.",
      ),
    );
  } else if (eodReviewCount > 0) {
    levels.push("caution");
    addSignal(
      signals,
      signal(
        "eod_review_required",
        "eod",
        "caution",
        "End-of-day review required",
        "One or more live day trades need attention near the close.",
      ),
    );
  }

  if (poorExecutionTodayCount > 0) {
    levels.push(poorExecutionTodayCount >= 2 ? "avoid" : "caution");
    addSignal(
      signals,
      signal(
        "poor_execution_today",
        "execution_quality",
        poorExecutionTodayCount >= 2 ? "avoid" : "caution",
        "Poor execution detected today",
        "Recent trade execution quality suggests extra selectivity before taking another setup.",
      ),
    );
  }

  if (highPrioritySuggestionCount > 0) {
    levels.push(highPrioritySuggestionCount >= 2 ? "avoid" : "caution");
    addSignal(
      signals,
      signal(
        "high_priority_suggestions_today",
        "execution_quality",
        highPrioritySuggestionCount >= 2 ? "avoid" : "caution",
        "High-priority execution suggestions exist",
        "Recent trades have improvement suggestions that should be reviewed before adding more risk.",
      ),
    );
  }

  if (
    marketStatus === "closed" ||
    marketStatus === "closed_today" ||
    currentScanWindow === "after_hours"
  ) {
    levels.push("avoid");
    addSignal(
      signals,
      signal(
        "market_not_intraday_open",
        "market_context",
        "avoid",
        "Market is not in the intraday window",
        "Day-trade entries should wait for a valid intraday trading window.",
      ),
    );
  } else if (
    currentScanWindow === "power_hour" ||
    currentScanWindow === "afternoon"
  ) {
    levels.push("watch");
    addSignal(
      signals,
      signal(
        "late_session_window",
        "market_context",
        "watch",
        "Late-session timing",
        "Late-session trades need clean confirmation and enough time to manage the exit.",
      ),
    );
  }

  if (recommendation?.freshness === "expired" || recommendation?.add_trade_gate_blocked) {
    levels.push("avoid");
    addSignal(
      signals,
      signal(
        "recommendation_blocked_or_expired",
        "data_quality",
        "avoid",
        "Recommendation needs fresh validation",
        "This setup appears expired or blocked by the existing quality gate. Use the normal ADD TRADE validation flow.",
      ),
    );
  } else if (
    recommendation?.freshness === "stale" ||
    recommendation?.freshness === "aging"
  ) {
    levels.push("watch");
    addSignal(
      signals,
      signal(
        "recommendation_aging",
        "data_quality",
        "watch",
        "Recommendation is aging",
        "Confirm the setup is still fresh before taking action.",
      ),
    );
  }

  if (confidenceScore !== null && confidenceScore < 60) {
    levels.push("caution");
    addSignal(
      signals,
      signal(
        "low_recommendation_confidence",
        "data_quality",
        "caution",
        "Recommendation confidence is low",
        "Low-confidence setups need stronger real-time confirmation.",
      ),
    );
  }

  const sortedSignals = Array.from(signals.values()).sort(
    (first, second) => levelWeight(second.level) - levelWeight(first.level),
  );
  const level = maxLevel(levels);

  return {
    level,
    title: titleForLevel(level),
    summary: summaryForLevel(level, sortedSignals.length),
    signals: sortedSignals,
    suggested_action: actionForLevel(level),
    is_advisory_only: true,
    generated_at: generatedAt,
  };
}
