import type {
  MarketContextIntelligenceV1Output,
  MarketContextRegimeClassification,
  SectorStrengthClassification,
} from "./contract-v1";

export const MARKET_CONTEXT_SHADOW_EVALUATION_ADAPTER_VERSION =
  "market_context_shadow_evaluation_adapter_v1" as const;

export type InactiveMarketContextShadowEvaluationEnvelope = {
  adapter_version: typeof MARKET_CONTEXT_SHADOW_EVALUATION_ADAPTER_VERSION;
  binding_status: "inactive_unbound";
  intended_future_boundary: "canonical_evaluation_envelope";
  canonical_evaluation_envelope_binding: null;
  capture_enabled: false;
  persistence_enabled: false;
  database_relation: null;
  decision_timestamp: string;
  context_reference: {
    context_version: MarketContextIntelligenceV1Output["context_version"];
    threshold_version: MarketContextIntelligenceV1Output["threshold_version"];
    regime_classification: MarketContextRegimeClassification;
    sector_contexts: Array<{
      context_level: "sector" | "industry";
      sector_id: string;
      industry_id: string | null;
      classification: SectorStrengthClassification;
      rank_status: "ranked" | "not_rankable";
      rank: number | null;
    }>;
    evidence_strength: MarketContextIntelligenceV1Output["evidence_strength"];
    data_quality_state:
      MarketContextIntelligenceV1Output["dimensions"]["data_quality_state"];
    coverage: MarketContextIntelligenceV1Output["coverage"];
    reason_codes: string[];
  };
  shadow_only: true;
  live_ranking_effect: false;
};

export function toInactiveMarketContextShadowEvaluationEnvelope(
  context: MarketContextIntelligenceV1Output,
): InactiveMarketContextShadowEvaluationEnvelope {
  return {
    adapter_version: MARKET_CONTEXT_SHADOW_EVALUATION_ADAPTER_VERSION,
    binding_status: "inactive_unbound",
    intended_future_boundary: "canonical_evaluation_envelope",
    canonical_evaluation_envelope_binding: null,
    capture_enabled: false,
    persistence_enabled: false,
    database_relation: null,
    decision_timestamp: context.decision_timestamp,
    context_reference: {
      context_version: context.context_version,
      threshold_version: context.threshold_version,
      regime_classification: context.regime_classification,
      sector_contexts: context.sectors.map((sector) => ({
        context_level: sector.context_level,
        sector_id: sector.sector_id,
        industry_id: sector.industry_id,
        classification: sector.classification,
        rank_status: sector.rank_status,
        rank: sector.rank,
      })),
      evidence_strength: context.evidence_strength,
      data_quality_state: context.dimensions.data_quality_state,
      coverage: context.coverage,
      reason_codes: [...context.reason_codes],
    },
    shadow_only: true,
    live_ranking_effect: false,
  };
}
