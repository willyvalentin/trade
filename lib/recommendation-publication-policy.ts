export type AiNoTradeDecision = {
  reason: string;
  confidence_score: number | null;
  risk_flags: string[];
  candidate_ticker: string | null;
};

export type AiRecommendationPublicationAction =
  | {
      kind: "preserve_no_trade";
      no_trade: AiNoTradeDecision;
    }
  | {
      kind: "preserve_no_publish";
      no_publish_reason: "openai_zero_recommendations";
      message: string;
    }
  | {
      kind: "evaluate_recommendations";
    };

export type SanitizedRecommendationPublicationAction =
  | {
      kind: "preserve_no_publish";
      no_publish_reason: "openai_recommendation_validation_failed";
      message: string;
    }
  | {
      kind: "continue";
    };

/**
 * An explicit model `no_trade` is a terminal quality decision. It must not be
 * converted into a recommendation-producing fallback merely to fill a batch.
 */
export function resolveAiRecommendationPublicationAction(input: {
  result: "trade_recommendation" | "no_trade";
  no_trade?: AiNoTradeDecision;
  recommendation_count: number;
}): AiRecommendationPublicationAction {
  if (input.result === "no_trade") {
    return {
      kind: "preserve_no_trade",
      no_trade: input.no_trade ?? {
        reason: "OpenAI did not find an actionable day trade setup.",
        confidence_score: null,
        risk_flags: [],
        candidate_ticker: null,
      },
    };
  }

  if (input.recommendation_count === 0) {
    return {
      kind: "preserve_no_publish",
      no_publish_reason: "openai_zero_recommendations",
      message:
        "No trade: the model returned no actionable recommendations for this scan.",
    };
  }

  return { kind: "evaluate_recommendations" };
}

/**
 * A model output that fails every deterministic safety check cannot be
 * replaced by a new recommendation merely to fill the publishing batch.
 */
export function resolveSanitizedRecommendationPublicationAction(input: {
  model_recommendation_count: number;
  sanitized_recommendation_count: number;
  deterministic_fallback_used: boolean;
}): SanitizedRecommendationPublicationAction {
  if (
    !input.deterministic_fallback_used &&
    input.model_recommendation_count > 0 &&
    input.sanitized_recommendation_count === 0
  ) {
    return {
      kind: "preserve_no_publish",
      no_publish_reason: "openai_recommendation_validation_failed",
      message:
        "No trade: the model recommendations did not pass deterministic validation.",
    };
  }

  return { kind: "continue" };
}
