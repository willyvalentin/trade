import type { DataModeBadge } from "@/lib/data-mode-clarity";
import {
  dataModeBadgeForExecutionReality,
  dataModeBadgeForMode,
} from "@/lib/data-mode-clarity";
import type { RecommendationFreshness } from "@/lib/recommendation-freshness";
import type { RecommendationCardMetric } from "@/components/recommendations/RecommendationCard";
import type { RecommendationDetailsModalConfirmation } from "@/components/recommendations/RecommendationDetailsModal";

export type RecommendationCardDisplayConfidenceBreakdown = {
  market_regime_alignment: number;
  momentum_confirmation: number;
  risk_reward_quality: number;
  setup_quality: number;
  timing_quality: number;
  volume_confirmation: number;
};

export type RecommendationCardDisplayRecommendation = {
  confidenceBreakdown: RecommendationCardDisplayConfidenceBreakdown | null;
  confidenceLabel: string;
  confidenceScore: number | null;
  entryZone: string;
  riskReward: string;
  stopLoss: string;
  target1: string;
  thesis: string;
};

export type RecommendationCardDisplayKeyReasons = {
  positive: string[];
  warnings: string[];
};

export type RecommendationCardDisplayDecisionStack = {
  primary_warning?: string | null;
  summary?: string | null;
};

export type RecommendationCardDisplayAddTradeGate = {
  blocked: boolean;
  confirmation: RecommendationDetailsModalConfirmation;
  message: string;
};

export type RecommendationCardDisplayProps = {
  addTradeDisabled: boolean;
  addTradeGateMessage: string;
  addTradeLabel: string;
  cardSummary: string;
  confidenceBreakdownItems: Array<[string, number]>;
  confidenceLabel: string;
  confidenceTone: RecommendationCardConfidenceTone;
  confirmation: RecommendationDetailsModalConfirmation;
  discardDisabled: boolean;
  isExpired: boolean;
  keyReasons: RecommendationCardDisplayKeyReasons;
  metrics: RecommendationCardMetric[];
  recommendationDetailsSourceBadges: DataModeBadge[];
  recommendationSourceBadge: DataModeBadge;
};

export type RecommendationCardConfidenceTone = "strong" | "medium" | "low";

export function recommendationCardConfidenceTone(
  recommendation: Pick<
    RecommendationCardDisplayRecommendation,
    "confidenceLabel" | "confidenceScore"
  >,
): RecommendationCardConfidenceTone {
  const score = recommendation.confidenceScore;

  if (score !== null) {
    if (score >= 85) return "strong";
    if (score >= 70) return "medium";
    return "low";
  }

  if (recommendation.confidenceLabel === "HIGH CONVICTION") return "strong";
  if (recommendation.confidenceLabel === "GOOD SETUP") return "medium";
  if (recommendation.confidenceLabel === "LOWER CONFIDENCE") return "low";

  return "medium";
}

export function recommendationCardConfidenceLabel(
  recommendation: Pick<
    RecommendationCardDisplayRecommendation,
    "confidenceLabel" | "confidenceScore"
  >,
) {
  const tone = recommendationCardConfidenceTone(recommendation);

  if (tone === "strong") return "HIGH CONFIDENCE";
  if (tone === "low") return "LOW CONFIDENCE";
  return "MEDIUM CONFIDENCE";
}

export function buildRecommendationCardDisplayProps({
  addTradeGate,
  decisionStack,
  freshness,
  isDemoRecommendation,
  isSaving,
  isValidating,
  keyReasons,
  recommendation,
}: {
  addTradeGate: RecommendationCardDisplayAddTradeGate;
  decisionStack: RecommendationCardDisplayDecisionStack | null;
  freshness: RecommendationFreshness;
  isDemoRecommendation: boolean;
  isSaving: boolean;
  isValidating: boolean;
  keyReasons: RecommendationCardDisplayKeyReasons;
  recommendation: RecommendationCardDisplayRecommendation;
}): RecommendationCardDisplayProps {
  const isExpired = freshness === "expired";
  const confidenceBreakdownItems: Array<[string, number]> =
    recommendation.confidenceBreakdown
      ? [
          ["Setup", recommendation.confidenceBreakdown.setup_quality],
          ["Momentum", recommendation.confidenceBreakdown.momentum_confirmation],
          ["Volume", recommendation.confidenceBreakdown.volume_confirmation],
          ["R/R", recommendation.confidenceBreakdown.risk_reward_quality],
          ["Regime", recommendation.confidenceBreakdown.market_regime_alignment],
          ["Timing", recommendation.confidenceBreakdown.timing_quality],
        ]
      : [];
  const cardSummary =
    decisionStack?.primary_warning ||
    decisionStack?.summary ||
    keyReasons.positive[0] ||
    recommendation.thesis;
  const confidenceTone = recommendationCardConfidenceTone(recommendation);
  const recommendationSourceBadge = isDemoRecommendation
    ? dataModeBadgeForMode("demo")
    : freshness === "stale" || freshness === "expired"
      ? dataModeBadgeForMode("stale_market_data")
      : dataModeBadgeForMode("supabase_record");
  const recommendationDetailsSourceBadges = [
    recommendationSourceBadge,
    dataModeBadgeForExecutionReality(
      isDemoRecommendation ? "demo_only" : "human_confirmed_required",
    ),
  ];
  const metrics: RecommendationCardMetric[] = [
    { label: "Entry", value: recommendation.entryZone },
    { label: "Stop", value: recommendation.stopLoss },
    { label: "Target", value: recommendation.target1 },
    { label: "Reward : Risk", value: recommendation.riskReward },
    {
      label: "Confidence",
      value:
        recommendation.confidenceScore === null
          ? "—"
          : `${recommendation.confidenceScore}/100`,
    },
  ];
  const addTradeLabel = isValidating
    ? "Validating Setup"
    : addTradeGate.blocked && !isExpired
      ? "Review Setup"
      : "ADD TRADE";

  return {
    addTradeDisabled: isSaving || isExpired || isValidating,
    addTradeGateMessage: addTradeGate.message,
    addTradeLabel,
    cardSummary,
    confidenceBreakdownItems,
    confidenceLabel: recommendationCardConfidenceLabel(recommendation),
    confidenceTone,
    confirmation: addTradeGate.confirmation,
    discardDisabled: isSaving,
    isExpired,
    keyReasons,
    metrics,
    recommendationDetailsSourceBadges,
    recommendationSourceBadge,
  };
}
