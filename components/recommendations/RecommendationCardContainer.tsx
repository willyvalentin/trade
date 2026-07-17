"use client";

import { useState, type ReactNode } from "react";

import type { CalibrationGuardrailResult } from "@/lib/calibration-guardrails";
import type { ConfidenceCalibrationProjectionPreviewResult } from "@/lib/confidence-calibration-recommendation-advisory-projection-preview";
import type { DataModeBadge } from "@/lib/data-mode-clarity";
import type { PreTradeRiskContextResult } from "@/lib/pre-trade-risk-context";
import type { RecommendationDecisionStackResult } from "@/lib/recommendation-decision-stack";
import type { RecommendationFreshness } from "@/lib/recommendation-freshness";
import type { TradeEligibilityResult } from "@/lib/trade-eligibility";
import { DiscardRecommendationModal } from "@/components/recommendations/DiscardRecommendationModal";
import { RecommendationCard as RecommendationCardView } from "@/components/recommendations/RecommendationCard";
import {
  RecommendationDetailsModal,
  type RecommendationDetailsModalPositionSizing,
  type RecommendationDetailsModalRecommendation,
} from "@/components/recommendations/RecommendationDetailsModal";
import {
  buildRecommendationCardDisplayProps,
  type RecommendationCardDisplayAddTradeGate,
  type RecommendationCardDisplayKeyReasons,
  type RecommendationCardDisplayRecommendation,
} from "@/components/recommendations/recommendation-card-display-mapper";

export type RecommendationCardContainerRecommendation =
  RecommendationDetailsModalRecommendation &
    RecommendationCardDisplayRecommendation & {
      companyName: string;
      createdAt: string;
      ticker: string;
    };

export type RecommendationCardContainerProps<
  TRecommendation extends RecommendationCardContainerRecommendation,
> = {
  addTradeGate: RecommendationCardDisplayAddTradeGate;
  calibrationGuardrails: CalibrationGuardrailResult | null;
  confidenceCalibrationProjectionPreview?:
    | ConfidenceCalibrationProjectionPreviewResult
    | null;
  decisionStack: RecommendationDecisionStackResult | null;
  freshness: RecommendationFreshness;
  isDemoRecommendation: boolean;
  isSaving: boolean;
  isValidating: boolean;
  keyReasons: RecommendationCardDisplayKeyReasons;
  onIgnore: (recommendation: TRecommendation) => void | Promise<void>;
  onTakeTrade: (recommendation: TRecommendation) => void | Promise<void>;
  positionSizing: RecommendationDetailsModalPositionSizing;
  preTradeRiskContext: PreTradeRiskContextResult | null;
  recommendation: TRecommendation;
  renderIdentity: (recommendation: TRecommendation) => ReactNode;
  renderSourceBadges: (badges: DataModeBadge[]) => ReactNode;
  tradeEligibility: TradeEligibilityResult | null;
};

export function RecommendationCardContainer<
  TRecommendation extends RecommendationCardContainerRecommendation,
>({
  addTradeGate,
  calibrationGuardrails,
  confidenceCalibrationProjectionPreview,
  decisionStack,
  freshness,
  isDemoRecommendation,
  isSaving,
  isValidating,
  keyReasons,
  onIgnore,
  onTakeTrade,
  positionSizing,
  preTradeRiskContext,
  recommendation,
  renderIdentity,
  renderSourceBadges,
  tradeEligibility,
}: RecommendationCardContainerProps<TRecommendation>) {
  const displayProps = buildRecommendationCardDisplayProps({
    addTradeGate,
    decisionStack,
    freshness,
    isDemoRecommendation,
    isSaving,
    isValidating,
    keyReasons,
    recommendation,
  });
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDiscardConfirmOpen, setIsDiscardConfirmOpen] = useState(false);
  const [isConfirmingDiscard, setIsConfirmingDiscard] = useState(false);

  return (
    <RecommendationCardView
      addTradeDisabled={displayProps.addTradeDisabled}
      addTradeLabel={displayProps.addTradeLabel}
      confidenceLabel={displayProps.confidenceLabel}
      confidenceTone={displayProps.confidenceTone}
      discardDisabled={displayProps.discardDisabled}
      identity={renderIdentity(recommendation)}
      metrics={displayProps.metrics}
      onAddTrade={() => onTakeTrade(recommendation)}
      onOpenDetails={() => setIsDetailsOpen(true)}
      onOpenDiscard={() => setIsDiscardConfirmOpen(true)}
      discardDialog={
        isDiscardConfirmOpen ? (
          <DiscardRecommendationModal
            ticker={recommendation.ticker}
            companyName={recommendation.companyName}
            isSaving={isSaving || isConfirmingDiscard}
            onCancel={() => setIsDiscardConfirmOpen(false)}
            onConfirm={async () => {
              setIsConfirmingDiscard(true);
              try {
                await onIgnore(recommendation);
                setIsDiscardConfirmOpen(false);
              } finally {
                setIsConfirmingDiscard(false);
              }
            }}
          />
        ) : null
      }
      detailsDialog={
        isDetailsOpen ? (
          <RecommendationDetailsModal
            recommendation={recommendation}
            calibrationGuardrails={calibrationGuardrails}
            preTradeRiskContext={preTradeRiskContext}
            tradeEligibility={tradeEligibility}
            decisionStack={decisionStack}
            positionSizing={positionSizing}
            freshness={freshness}
            addTradeGateMessage={displayProps.addTradeGateMessage}
            confirmation={displayProps.confirmation}
            confidenceBreakdownItems={displayProps.confidenceBreakdownItems}
            confidenceCalibrationProjectionPreview={
              confidenceCalibrationProjectionPreview
            }
            confidenceLabel={displayProps.confidenceLabel}
            confidenceTone={displayProps.confidenceTone}
            identity={renderIdentity(recommendation)}
            keyReasons={displayProps.keyReasons}
            onClose={() => setIsDetailsOpen(false)}
            sourceBadges={renderSourceBadges(
              displayProps.recommendationDetailsSourceBadges,
            )}
          />
        ) : null
      }
    />
  );
}
