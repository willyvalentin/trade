import type { DataModeBadge } from "@/lib/data-mode-clarity";
import {
  dataModeBadgeForExecutionReality,
  dataModeBadgeForMode,
} from "@/lib/data-mode-clarity";
import {
  getRecommendationExpiresAt,
  type RecommendationFreshness,
} from "@/lib/recommendation-freshness";
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
  createdAtRaw?: string | null;
  confidenceBreakdown: RecommendationCardDisplayConfidenceBreakdown | null;
  confidenceLabel: string;
  confidenceScore: number | null;
  entryZone: string;
  expiresAtRaw?: string | null;
  planReferencePrice?: {
    reference_price_provider?: string | null;
    reference_price_source?: string | null;
    reference_price_timestamp?: string | null;
  } | null;
  riskReward: string;
  scanWindow?: string | null;
  stopLoss: string;
  target1: string;
  thesis: string;
};

export type RecommendationCardTiming = {
  expiryLabel: string;
  expiryStatus: "stored" | "derived" | "unavailable";
  sourceLabel: string;
  sourceTimestampLabel: string;
  sourceTimestampStatus: "known" | "unavailable";
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
  freshnessNotice: string | null;
  isExpired: boolean;
  keyReasons: RecommendationCardDisplayKeyReasons;
  metrics: RecommendationCardMetric[];
  recommendationDetailsSourceBadges: DataModeBadge[];
  recommendationSourceBadge: DataModeBadge;
  timing: RecommendationCardTiming;
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

function nonBlankText(value: string | null | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function timestampMs(value: string | null | undefined) {
  const parsed = value ? new Date(value).getTime() : Number.NaN;
  return Number.isFinite(parsed) ? parsed : null;
}

function formatNewYorkTimestamp(value: number | null) {
  if (value === null) return "Not available";

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
    timeZone: "America/New_York",
    timeZoneName: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function buildRecommendationCardTiming(
  recommendation: Pick<
    RecommendationCardDisplayRecommendation,
    "createdAtRaw" | "expiresAtRaw" | "planReferencePrice" | "scanWindow"
  >,
): RecommendationCardTiming {
  const explicitExpiryMs = timestampMs(recommendation.expiresAtRaw);
  const expiresAt = getRecommendationExpiresAt({
    created_at: recommendation.createdAtRaw ?? null,
    expires_at: recommendation.expiresAtRaw ?? null,
    scan_window: recommendation.scanWindow ?? null,
  });
  const sourceTimestampMs = timestampMs(
    recommendation.planReferencePrice?.reference_price_timestamp,
  );
  const sourceLabel =
    nonBlankText(recommendation.planReferencePrice?.reference_price_provider) ??
    nonBlankText(recommendation.planReferencePrice?.reference_price_source) ??
    "Not available";

  return {
    expiryLabel: formatNewYorkTimestamp(expiresAt),
    expiryStatus:
      explicitExpiryMs !== null
        ? "stored"
        : expiresAt !== null
          ? "derived"
          : "unavailable",
    sourceLabel,
    sourceTimestampLabel: formatNewYorkTimestamp(sourceTimestampMs),
    sourceTimestampStatus:
      sourceTimestampMs === null ? "unavailable" : "known",
  };
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
  const timing = buildRecommendationCardTiming(recommendation);
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
  const freshnessNotice =
    freshness === "expired"
      ? "EXPIRED — REVIEW ONLY"
      : freshness === "stale"
        ? "STALE DATA — REVALIDATE BEFORE TRADE"
        : null;
  const addTradeLabel = isValidating
    ? "Validating Setup"
    : isExpired
      ? "Setup Expired"
      : freshness === "stale"
        ? "Revalidate Setup"
        : "Make Trade";

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
    freshnessNotice,
    isExpired,
    keyReasons,
    metrics,
    recommendationDetailsSourceBadges,
    recommendationSourceBadge,
    timing,
  };
}
