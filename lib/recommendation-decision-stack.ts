import type { CalibrationGuardrailResult } from "@/lib/calibration-guardrails";
import type { CooldownAdvisoryResult } from "@/lib/cooldown-advisory";
import type { PreTradeRiskContextResult } from "@/lib/pre-trade-risk-context";
import type { SessionQualityScoreResult } from "@/lib/session-quality-score";
import type { TradeEligibilityResult } from "@/lib/trade-eligibility";
import { normalizeSetupType } from "@/lib/setup-types";

export type RecommendationDecisionStackStatus =
  | "strong"
  | "acceptable"
  | "mixed"
  | "weak"
  | "blocked"
  | "unknown";

export type RecommendationDecisionStackItemType =
  | "eligibility"
  | "setup_quality"
  | "intraday_confirmation"
  | "session_risk"
  | "calibration"
  | "freshness";

export type RecommendationDecisionStackItem = {
  type: RecommendationDecisionStackItemType;
  status: RecommendationDecisionStackStatus;
  label: string;
  summary: string;
  detail?: string;
};

export type RecommendationDecisionStackResult = {
  overall_status: RecommendationDecisionStackStatus;
  title: string;
  summary: string;
  items: RecommendationDecisionStackItem[];
  primary_warning?: string;
  is_advisory_only: boolean;
  generated_at: string;
};

export type BuildRecommendationDecisionStackInput = {
  recommendation?: {
    setup_type?: unknown;
    confidence_score?: number | null;
    freshness?: string | null;
    intraday_confirmation?: string | null;
    add_trade_gate_blocked?: boolean | null;
    add_trade_gate_message?: string | null;
  } | null;
  tradeEligibility?: TradeEligibilityResult | null;
  preTradeRiskContext?: PreTradeRiskContextResult | null;
  calibrationGuardrails?: CalibrationGuardrailResult | null;
  sessionQualityScore?: SessionQualityScoreResult | null;
  cooldownAdvisory?: CooldownAdvisoryResult | null;
  generatedAt?: string;
};

function statusRank(status: RecommendationDecisionStackStatus) {
  if (status === "blocked") return 5;
  if (status === "weak") return 4;
  if (status === "mixed") return 3;
  if (status === "unknown") return 2;
  if (status === "acceptable") return 1;
  return 0;
}

function titleForStatus(status: RecommendationDecisionStackStatus) {
  if (status === "blocked") return "Existing gate blocks this setup";
  if (status === "weak") return "Decision stack is weak";
  if (status === "mixed") return "Decision stack is mixed";
  if (status === "acceptable") return "Decision stack is acceptable";
  if (status === "strong") return "Decision stack looks strong";
  return "Decision stack needs more data";
}

function summaryForStatus(status: RecommendationDecisionStackStatus) {
  if (status === "blocked") {
    return "Existing freshness or quality-gate rules indicate this trade should not proceed.";
  }

  if (status === "weak") {
    return "Decision stack is weak. Consider skipping unless conditions improve.";
  }

  if (status === "mixed") {
    return "Decision stack is mixed. Be selective and rely on validation.";
  }

  if (status === "acceptable") {
    return "Decision stack looks acceptable. Continue with normal validation.";
  }

  if (status === "strong") {
    return "Decision stack looks strong. Continue with normal ADD TRADE validation.";
  }

  return "Not enough data to evaluate the full decision stack.";
}

function strongestStatus(items: RecommendationDecisionStackItem[]) {
  if (items.length === 0) return "unknown";

  if (items.some((item) => item.status === "blocked")) {
    return "blocked";
  }

  if (items.some((item) => item.status === "weak")) {
    return "weak";
  }

  const mixedItems = items.filter((item) => item.status === "mixed").length;
  const unknownItems = items.filter((item) => item.status === "unknown").length;
  const strongItems = items.filter((item) => item.status === "strong").length;
  const acceptableOrStrong = items.filter(
    (item) => item.status === "acceptable" || item.status === "strong",
  ).length;

  if (mixedItems >= 2) {
    return "mixed";
  }

  if (mixedItems === 1) {
    return "mixed";
  }

  if (unknownItems >= 3) {
    return "unknown";
  }

  if (strongItems >= 4 && unknownItems === 0) {
    return "strong";
  }

  if (acceptableOrStrong >= 4) {
    return "acceptable";
  }

  return unknownItems > 0 ? "unknown" : "acceptable";
}

function eligibilityItem(
  result: TradeEligibilityResult | null | undefined,
): RecommendationDecisionStackItem {
  if (!result) {
    return {
      type: "eligibility",
      status: "unknown",
      label: "Eligibility",
      summary: "Eligibility has not been evaluated.",
    };
  }

  const status =
    result.status === "not_eligible"
      ? "blocked"
      : result.status === "risky"
        ? "weak"
        : result.status === "mixed"
          ? "mixed"
          : "strong";

  return {
    type: "eligibility",
    status,
    label: "Eligibility",
    summary: result.title,
    detail: result.summary,
  };
}

function setupQualityItem(
  recommendation: BuildRecommendationDecisionStackInput["recommendation"],
): RecommendationDecisionStackItem {
  const confidence =
    typeof recommendation?.confidence_score === "number" &&
    Number.isFinite(recommendation.confidence_score)
      ? recommendation.confidence_score
      : null;
  const setupType = normalizeSetupType(recommendation?.setup_type);

  if (confidence === null) {
    return {
      type: "setup_quality",
      status: "unknown",
      label: "Setup Quality",
      summary: "Confidence is unavailable.",
      detail: "Review the setup manually because scoring context is missing.",
    };
  }

  if (confidence >= 85 && setupType !== "UNKNOWN") {
    return {
      type: "setup_quality",
      status: "strong",
      label: "Setup Quality",
      summary: `${confidence}/100 confidence with a classified setup.`,
    };
  }

  if (confidence >= 70) {
    return {
      type: "setup_quality",
      status: "acceptable",
      label: "Setup Quality",
      summary: `${confidence}/100 confidence is acceptable.`,
      detail: setupType === "UNKNOWN" ? "Setup type is unknown." : undefined,
    };
  }

  if (confidence >= 60 || setupType === "UNKNOWN") {
    return {
      type: "setup_quality",
      status: "mixed",
      label: "Setup Quality",
      summary:
        setupType === "UNKNOWN"
          ? "Setup type is unknown."
          : `${confidence}/100 confidence is mixed.`,
    };
  }

  return {
    type: "setup_quality",
    status: "weak",
    label: "Setup Quality",
    summary: `${confidence}/100 confidence is low.`,
  };
}

function intradayItem(
  recommendation: BuildRecommendationDecisionStackInput["recommendation"],
): RecommendationDecisionStackItem {
  if (recommendation?.add_trade_gate_blocked) {
    return {
      type: "intraday_confirmation",
      status: "blocked",
      label: "Intraday",
      summary: "Existing ADD TRADE snapshot gate is blocked.",
      detail: recommendation.add_trade_gate_message ?? undefined,
    };
  }

  if (recommendation?.intraday_confirmation === "confirmed") {
    return {
      type: "intraday_confirmation",
      status: "strong",
      label: "Intraday",
      summary: "Intraday confirmation is clean.",
    };
  }

  if (
    recommendation?.intraday_confirmation === "mixed" ||
    recommendation?.intraday_confirmation === "unknown"
  ) {
    return {
      type: "intraday_confirmation",
      status: "mixed",
      label: "Intraday",
      summary: `Intraday confirmation is ${recommendation.intraday_confirmation}.`,
    };
  }

  if (recommendation?.intraday_confirmation === "weak") {
    return {
      type: "intraday_confirmation",
      status: "weak",
      label: "Intraday",
      summary: "Intraday confirmation is weak.",
    };
  }

  return {
    type: "intraday_confirmation",
    status: "unknown",
    label: "Intraday",
    summary: "Intraday confirmation is unavailable.",
  };
}

function sessionRiskItem({
  preTradeRiskContext,
  sessionQualityScore,
  cooldownAdvisory,
}: Pick<
  BuildRecommendationDecisionStackInput,
  "preTradeRiskContext" | "sessionQualityScore" | "cooldownAdvisory"
>): RecommendationDecisionStackItem {
  if (
    preTradeRiskContext?.level === "avoid" ||
    sessionQualityScore?.grade === "D" ||
    cooldownAdvisory?.level === "stop_for_day"
  ) {
    return {
      type: "session_risk",
      status: "weak",
      label: "Session Risk",
      summary:
        preTradeRiskContext?.summary ??
        sessionQualityScore?.summary ??
        cooldownAdvisory?.summary ??
        "Session risk is elevated.",
    };
  }

  if (
    preTradeRiskContext?.level === "caution" ||
    sessionQualityScore?.grade === "C" ||
    cooldownAdvisory?.level === "pause"
  ) {
    return {
      type: "session_risk",
      status: "mixed",
      label: "Session Risk",
      summary:
        preTradeRiskContext?.summary ??
        sessionQualityScore?.summary ??
        cooldownAdvisory?.summary ??
        "Session context needs caution.",
    };
  }

  if (
    preTradeRiskContext?.level === "watch" ||
    sessionQualityScore?.grade === "B" ||
    cooldownAdvisory?.level === "watch"
  ) {
    return {
      type: "session_risk",
      status: "acceptable",
      label: "Session Risk",
      summary:
        preTradeRiskContext?.summary ??
        "Session context is acceptable but still worth watching.",
    };
  }

  if (preTradeRiskContext?.level === "clear" || sessionQualityScore?.grade === "A") {
    return {
      type: "session_risk",
      status: "strong",
      label: "Session Risk",
      summary:
        preTradeRiskContext?.summary ??
        sessionQualityScore?.summary ??
        "Session context looks clean.",
    };
  }

  return {
    type: "session_risk",
    status: "unknown",
    label: "Session Risk",
    summary: "Session risk context is limited.",
  };
}

function calibrationItem(
  guardrails: CalibrationGuardrailResult | null | undefined,
): RecommendationDecisionStackItem {
  if (!guardrails || guardrails.guardrails.length === 0) {
    return {
      type: "calibration",
      status: "unknown",
      label: "Calibration",
      summary: "Calibration sample is limited or unavailable.",
    };
  }

  const warnings = guardrails.guardrails.filter(
    (guardrail) => guardrail.severity === "warning",
  );
  const cautions = guardrails.guardrails.filter(
    (guardrail) => guardrail.severity === "caution",
  );
  const infos = guardrails.guardrails.filter(
    (guardrail) => guardrail.severity === "info",
  );

  if (warnings.length > 0) {
    return {
      type: "calibration",
      status: "weak",
      label: "Calibration",
      summary: warnings[0]?.title ?? "Calibration warning active.",
      detail: warnings[0]?.description,
    };
  }

  if (cautions.length > 0) {
    return {
      type: "calibration",
      status: "mixed",
      label: "Calibration",
      summary: cautions[0]?.title ?? "Calibration caution active.",
      detail: cautions[0]?.description,
    };
  }

  return {
    type: "calibration",
    status: infos.length > 0 ? "acceptable" : "strong",
    label: "Calibration",
    summary: guardrails.summary,
  };
}

function freshnessItem(
  recommendation: BuildRecommendationDecisionStackInput["recommendation"],
): RecommendationDecisionStackItem {
  if (recommendation?.freshness === "expired") {
    return {
      type: "freshness",
      status: "blocked",
      label: "Freshness",
      summary: "Recommendation is expired.",
    };
  }

  if (recommendation?.freshness === "fresh") {
    return {
      type: "freshness",
      status: "strong",
      label: "Freshness",
      summary: "Recommendation is fresh.",
    };
  }

  if (recommendation?.freshness === "aging") {
    return {
      type: "freshness",
      status: "acceptable",
      label: "Freshness",
      summary: "Recommendation is aging but still usable.",
    };
  }

  if (recommendation?.freshness === "stale") {
    return {
      type: "freshness",
      status: recommendation.add_trade_gate_blocked ? "blocked" : "mixed",
      label: "Freshness",
      summary: recommendation.add_trade_gate_blocked
        ? "Stale setup is blocked by existing snapshot rules."
        : "Recommendation is stale but not automatically blocked.",
    };
  }

  return {
    type: "freshness",
    status: "unknown",
    label: "Freshness",
    summary: "Freshness is unavailable.",
  };
}

export function buildRecommendationDecisionStack({
  recommendation = null,
  tradeEligibility = null,
  preTradeRiskContext = null,
  calibrationGuardrails = null,
  sessionQualityScore = null,
  cooldownAdvisory = null,
  generatedAt = new Date().toISOString(),
}: BuildRecommendationDecisionStackInput): RecommendationDecisionStackResult {
  const items: RecommendationDecisionStackItem[] = [
    eligibilityItem(tradeEligibility),
    setupQualityItem(recommendation),
    intradayItem(recommendation),
    sessionRiskItem({
      preTradeRiskContext,
      sessionQualityScore,
      cooldownAdvisory,
    }),
    calibrationItem(calibrationGuardrails),
    freshnessItem(recommendation),
  ];
  const overallStatus = strongestStatus(items);
  const primaryWarning = items
    .slice()
    .sort((first, second) => statusRank(second.status) - statusRank(first.status))
    .find((item) => item.status === "blocked" || item.status === "weak" || item.status === "mixed")
    ?.summary;

  return {
    overall_status: overallStatus,
    title: titleForStatus(overallStatus),
    summary: summaryForStatus(overallStatus),
    items,
    primary_warning: primaryWarning,
    is_advisory_only: true,
    generated_at: generatedAt,
  };
}
