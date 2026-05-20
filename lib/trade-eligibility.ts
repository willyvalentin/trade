import type { CalibrationGuardrailResult } from "@/lib/calibration-guardrails";
import type { CooldownAdvisoryResult } from "@/lib/cooldown-advisory";
import type { PreTradeRiskContextResult } from "@/lib/pre-trade-risk-context";
import type { SessionQualityScoreResult } from "@/lib/session-quality-score";
import { normalizeSetupType } from "@/lib/setup-types";

export type TradeEligibilityStatus =
  | "eligible"
  | "mixed"
  | "risky"
  | "not_eligible";

export type TradeEligibilitySignalImpact =
  | "positive"
  | "neutral"
  | "warning"
  | "negative"
  | "blocking";

export type TradeEligibilitySignal = {
  code: string;
  impact: TradeEligibilitySignalImpact;
  label: string;
  description: string;
};

export type TradeEligibilityResult = {
  status: TradeEligibilityStatus;
  title: string;
  summary: string;
  signals: TradeEligibilitySignal[];
  can_attempt_add_trade: boolean;
  is_advisory_only: boolean;
  generated_at: string;
};

export type BuildTradeEligibilityInput = {
  recommendation?: {
    freshness?: string | null;
    add_trade_gate_blocked?: boolean | null;
    add_trade_gate_message?: string | null;
    intraday_confirmation?: string | null;
    confidence_score?: number | null;
    setup_type?: unknown;
    has_required_fields?: boolean | null;
    has_active_position_same_ticker?: boolean | null;
  } | null;
  preTradeRiskContext?: PreTradeRiskContextResult | null;
  calibrationGuardrails?: CalibrationGuardrailResult | null;
  sessionQualityScore?: SessionQualityScoreResult | null;
  cooldownAdvisory?: CooldownAdvisoryResult | null;
  currentScanWindow?: string | null;
  marketStatus?: string | null;
  generatedAt?: string;
};

function signal(
  code: string,
  impact: TradeEligibilitySignalImpact,
  label: string,
  description: string,
): TradeEligibilitySignal {
  return { code, impact, label, description };
}

function addSignal(
  signals: Map<string, TradeEligibilitySignal>,
  item: TradeEligibilitySignal,
) {
  if (!signals.has(item.code)) {
    signals.set(item.code, item);
  }
}

function impactWeight(impact: TradeEligibilitySignalImpact) {
  if (impact === "blocking") return 0;
  if (impact === "negative") return 1;
  if (impact === "warning") return 2;
  if (impact === "neutral") return 3;
  return 4;
}

function statusWeight(status: TradeEligibilityStatus) {
  if (status === "not_eligible") return 3;
  if (status === "risky") return 2;
  if (status === "mixed") return 1;
  return 0;
}

function maxStatus(statuses: TradeEligibilityStatus[]) {
  return statuses.reduce<TradeEligibilityStatus>(
    (current, next) =>
      statusWeight(next) > statusWeight(current) ? next : current,
    "eligible",
  );
}

function titleForStatus(status: TradeEligibilityStatus) {
  if (status === "not_eligible") return "Not eligible right now";
  if (status === "risky") return "Risky trade context";
  if (status === "mixed") return "Mixed trade context";
  return "Eligible for validation";
}

function summaryForStatus(status: TradeEligibilityStatus) {
  if (status === "not_eligible") {
    return "This trade appears not eligible based on existing freshness or quality-gate rules.";
  }

  if (status === "risky") {
    return "Trade context is risky. Consider skipping unless validation is exceptionally clean.";
  }

  if (status === "mixed") {
    return "Trade context is mixed. Use normal validation and be selective.";
  }

  return "Trade context looks eligible. Continue with normal ADD TRADE validation.";
}

export function buildTradeEligibility({
  recommendation = null,
  preTradeRiskContext = null,
  calibrationGuardrails = null,
  sessionQualityScore = null,
  cooldownAdvisory = null,
  currentScanWindow = null,
  marketStatus = null,
  generatedAt = new Date().toISOString(),
}: BuildTradeEligibilityInput): TradeEligibilityResult {
  const signals = new Map<string, TradeEligibilitySignal>();
  const statuses: TradeEligibilityStatus[] = ["eligible"];
  const setupType = normalizeSetupType(recommendation?.setup_type);
  const confidenceScore =
    typeof recommendation?.confidence_score === "number" &&
    Number.isFinite(recommendation.confidence_score)
      ? recommendation.confidence_score
      : null;
  const freshness = recommendation?.freshness ?? null;
  const intradayConfirmation = recommendation?.intraday_confirmation ?? null;
  const existingGateBlocked = recommendation?.add_trade_gate_blocked === true;
  const missingRequiredFields = recommendation?.has_required_fields === false;

  if (freshness === "expired") {
    statuses.push("not_eligible");
    addSignal(
      signals,
      signal(
        "expired_setup",
        "blocking",
        "Setup expired",
        "Existing freshness rules require a fresh recommendation before ADD TRADE.",
      ),
    );
  } else if (freshness === "stale") {
    statuses.push(existingGateBlocked ? "not_eligible" : "mixed");
    addSignal(
      signals,
      signal(
        "stale_setup",
        existingGateBlocked ? "blocking" : "warning",
        "Setup is stale",
        recommendation?.add_trade_gate_message ||
          "Confirm price action carefully before attempting ADD TRADE.",
      ),
    );
  } else if (freshness === "aging") {
    statuses.push("mixed");
    addSignal(
      signals,
      signal(
        "aging_setup",
        "warning",
        "Setup is aging",
        "The recommendation is still usable, but freshness is no longer ideal.",
      ),
    );
  } else if (freshness === "fresh") {
    addSignal(
      signals,
      signal(
        "fresh_setup",
        "positive",
        "Setup is fresh",
        "Freshness supports attempting the normal ADD TRADE validation flow.",
      ),
    );
  }

  if (existingGateBlocked && freshness !== "stale" && freshness !== "expired") {
    statuses.push("not_eligible");
    addSignal(
      signals,
      signal(
        "snapshot_gate_blocked",
        "blocking",
        "Snapshot gate blocks this setup",
        recommendation?.add_trade_gate_message ||
          "Existing ADD TRADE snapshot quality rules are not clean enough.",
      ),
    );
  }

  if (missingRequiredFields) {
    statuses.push("not_eligible");
    addSignal(
      signals,
      signal(
        "missing_required_trade_fields",
        "blocking",
        "Required trade fields missing",
        "The existing trade flow needs entry, stop, and share context to continue safely.",
      ),
    );
  }

  if (intradayConfirmation === "confirmed") {
    addSignal(
      signals,
      signal(
        "intraday_confirmed",
        "positive",
        "Intraday confirmation is clean",
        "VWAP, momentum, or volume context supports normal validation.",
      ),
    );
  } else if (intradayConfirmation === "mixed") {
    statuses.push("mixed");
    addSignal(
      signals,
      signal(
        "intraday_mixed",
        "warning",
        "Intraday confirmation is mixed",
        "Review real-time price action before taking this setup.",
      ),
    );
  } else if (intradayConfirmation === "weak") {
    statuses.push("not_eligible");
    addSignal(
      signals,
      signal(
        "intraday_weak",
        "blocking",
        "Intraday confirmation is weak",
        "Existing snapshot rules treat weak confirmation as a blocker.",
      ),
    );
  } else {
    statuses.push("mixed");
    addSignal(
      signals,
      signal(
        "intraday_unknown",
        "neutral",
        "Intraday confirmation is unknown",
        "Manual review is needed because confirmation data is unavailable.",
      ),
    );
  }

  if (confidenceScore === null) {
    statuses.push("mixed");
    addSignal(
      signals,
      signal(
        "confidence_unknown",
        "neutral",
        "Confidence unavailable",
        "Confidence is missing, so use the normal validation gate carefully.",
      ),
    );
  } else if (confidenceScore >= 80) {
    addSignal(
      signals,
      signal(
        "confidence_high",
        "positive",
        "Confidence is strong",
        "Recommendation confidence supports the setup, but validation still applies.",
      ),
    );
  } else if (confidenceScore < 60) {
    statuses.push("mixed");
    addSignal(
      signals,
      signal(
        "confidence_low",
        "warning",
        "Confidence is low",
        "Low-confidence setups need stronger confirmation before taking risk.",
      ),
    );
  }

  if (setupType === "UNKNOWN") {
    statuses.push("mixed");
    addSignal(
      signals,
      signal(
        "setup_type_unknown",
        "neutral",
        "Setup type unknown",
        "The setup pattern could not be classified defensively.",
      ),
    );
  }

  if (preTradeRiskContext?.level === "avoid") {
    statuses.push("risky");
    addSignal(
      signals,
      signal(
        "pre_trade_context_avoid",
        "negative",
        "Pre-trade context says avoid",
        preTradeRiskContext.summary,
      ),
    );
  } else if (preTradeRiskContext?.level === "caution") {
    statuses.push("risky");
    addSignal(
      signals,
      signal(
        "pre_trade_context_caution",
        "negative",
        "Pre-trade context is cautious",
        preTradeRiskContext.summary,
      ),
    );
  } else if (preTradeRiskContext?.level === "watch") {
    statuses.push("mixed");
    addSignal(
      signals,
      signal(
        "pre_trade_context_watch",
        "warning",
        "Pre-trade context is watch",
        preTradeRiskContext.summary,
      ),
    );
  } else if (preTradeRiskContext?.level === "clear") {
    addSignal(
      signals,
      signal(
        "pre_trade_context_clear",
        "positive",
        "Pre-trade context is clear",
        preTradeRiskContext.summary,
      ),
    );
  }

  if (sessionQualityScore?.grade === "D") {
    statuses.push("risky");
    addSignal(
      signals,
      signal(
        "session_quality_d",
        "negative",
        "Session quality is poor",
        sessionQualityScore.summary,
      ),
    );
  } else if (sessionQualityScore?.grade === "C") {
    statuses.push("risky");
    addSignal(
      signals,
      signal(
        "session_quality_c",
        "negative",
        "Session quality is risky",
        sessionQualityScore.summary,
      ),
    );
  } else if (sessionQualityScore?.grade === "B") {
    statuses.push("mixed");
    addSignal(
      signals,
      signal(
        "session_quality_b",
        "warning",
        "Session quality is good but mixed",
        sessionQualityScore.summary,
      ),
    );
  }

  if (cooldownAdvisory?.level === "stop_for_day") {
    statuses.push("risky");
    addSignal(
      signals,
      signal(
        "cooldown_stop_for_day",
        "negative",
        "Cooldown says stop for the day",
        cooldownAdvisory.suggested_action,
      ),
    );
  } else if (cooldownAdvisory?.level === "pause") {
    statuses.push("risky");
    addSignal(
      signals,
      signal(
        "cooldown_pause",
        "negative",
        "Cooldown pause is active",
        cooldownAdvisory.suggested_action,
      ),
    );
  } else if (cooldownAdvisory?.level === "watch") {
    statuses.push("mixed");
    addSignal(
      signals,
      signal(
        "cooldown_watch",
        "warning",
        "Cooldown watch is active",
        cooldownAdvisory.suggested_action,
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

  if (warningGuardrails.length > 0) {
    statuses.push("risky");
    addSignal(
      signals,
      signal(
        "calibration_warning",
        "negative",
        "Calibration warning active",
        warningGuardrails[0]?.title ?? "Calibration warning active.",
      ),
    );
  } else if (cautionGuardrails.length > 0) {
    statuses.push("mixed");
    addSignal(
      signals,
      signal(
        "calibration_caution",
        "warning",
        "Calibration caution active",
        cautionGuardrails[0]?.title ?? "Calibration caution active.",
      ),
    );
  }

  if (recommendation?.has_active_position_same_ticker) {
    statuses.push("mixed");
    addSignal(
      signals,
      signal(
        "active_position_same_ticker",
        "warning",
        "Active position already exists",
        "Review the existing live trade before adding exposure to the same ticker.",
      ),
    );
  }

  if (
    marketStatus === "closed" ||
    marketStatus === "closed_today" ||
    currentScanWindow === "closed" ||
    currentScanWindow === "pre_market"
  ) {
    statuses.push("risky");
    addSignal(
      signals,
      signal(
        "market_not_open_for_entry",
        "negative",
        "Market window is not ideal",
        "This is advisory here; existing ADD TRADE validation still controls the actual flow.",
      ),
    );
  }

  const status = maxStatus(statuses);
  const canAttemptAddTrade = status !== "not_eligible";
  const sortedSignals = Array.from(signals.values()).sort(
    (first, second) => impactWeight(first.impact) - impactWeight(second.impact),
  );

  return {
    status,
    title: titleForStatus(status),
    summary: summaryForStatus(status),
    signals: sortedSignals,
    can_attempt_add_trade: canAttemptAddTrade,
    is_advisory_only: true,
    generated_at: generatedAt,
  };
}
