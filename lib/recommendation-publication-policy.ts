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
      kind: "evaluate_recommendations";
    };

/**
 * An explicit model `no_trade` is a terminal quality decision. It must not be
 * converted into a recommendation-producing fallback merely to fill a batch.
 */
export function resolveAiRecommendationPublicationAction(input: {
  result: "trade_recommendation" | "no_trade";
  no_trade?: AiNoTradeDecision;
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

  return { kind: "evaluate_recommendations" };
}
