import type { CalibrationGuardrailSeverity } from "@/lib/calibration-guardrails";
import type { PreTradeRiskContextLevel } from "@/lib/pre-trade-risk-context";
import type { RecommendationDecisionStackStatus } from "@/lib/recommendation-decision-stack";
import type { TradeEligibilityStatus } from "@/lib/trade-eligibility";

export type RecommendationDetailsTone =
  | "positive"
  | "warning"
  | "danger"
  | "neutral";

export type RecommendationDetailsConfirmationStatus =
  | "confirmed"
  | "mixed"
  | "weak"
  | "unknown";

function recommendationDetailsText(value: unknown, fallback = "") {
  if (value === null || value === undefined) return fallback;
  const normalized = String(value).trim();

  if (
    normalized === "" ||
    normalized.toLowerCase() === "null" ||
    normalized.toLowerCase() === "undefined"
  ) {
    return fallback;
  }

  return normalized;
}

function recommendationDetailsDisplayValue(value: unknown, fallback = "—") {
  return recommendationDetailsText(value, fallback);
}

function formatRecommendationDetailsCurrency(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "Not available";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatRecommendationDetailsShares(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "Not available";
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value);
}

export function recommendationDetailsToneFromDecisionStatus(
  status: RecommendationDecisionStackStatus | null | undefined,
): RecommendationDetailsTone {
  if (status === "strong") return "positive";
  if (status === "blocked" || status === "weak") return "danger";
  if (status === "mixed") return "warning";
  return "neutral";
}

export function recommendationDetailsToneFromEligibility(
  status: TradeEligibilityStatus | null | undefined,
): RecommendationDetailsTone {
  if (status === "eligible") return "positive";
  if (status === "not_eligible" || status === "risky") return "danger";
  if (status === "mixed") return "warning";
  return "neutral";
}

export function recommendationQuickDecisionToneFromEligibility(
  status: TradeEligibilityStatus | null | undefined,
): RecommendationDetailsTone {
  if (status === "eligible") return "positive";
  if (status === "not_eligible") return "danger";
  if (status === "mixed" || status === "risky") return "warning";
  return "neutral";
}

export function recommendationDetailsToneFromRiskContext(
  level: PreTradeRiskContextLevel | null | undefined,
): RecommendationDetailsTone {
  if (level === "clear") return "positive";
  if (level === "avoid") return "danger";
  if (level === "caution") return "warning";
  return "neutral";
}

export function recommendationDetailsToneFromConfirmation(
  status: RecommendationDetailsConfirmationStatus | null | undefined,
): RecommendationDetailsTone {
  if (status === "confirmed") return "positive";
  if (status === "weak") return "danger";
  if (status === "mixed") return "warning";
  return "neutral";
}

export function recommendationDetailsToneFromCalibration(
  severity: CalibrationGuardrailSeverity | null | undefined,
): RecommendationDetailsTone {
  if (severity === "warning") return "danger";
  if (severity === "caution") return "warning";
  return "neutral";
}

export function recommendationDetailsToneFromConfidence(
  score: number | null,
): RecommendationDetailsTone {
  if (score === null) return "neutral";
  if (score >= 85) return "positive";
  if (score >= 70) return "warning";
  return "danger";
}

export function recommendationDetailsToneClassName(
  tone: RecommendationDetailsTone,
) {
  return `trade-recommendation-details-pill--${tone}`;
}

export function recommendationDetailsValue(value: unknown) {
  const normalized = recommendationDetailsDisplayValue(value);
  return normalized === "Not available" || normalized === "Not set"
    ? "—"
    : normalized;
}

export function recommendationDetailsCurrency(
  value: number | null | undefined,
) {
  return recommendationDetailsValue(formatRecommendationDetailsCurrency(value));
}

export function recommendationDetailsShares(value: number | null | undefined) {
  return recommendationDetailsValue(formatRecommendationDetailsShares(value));
}
