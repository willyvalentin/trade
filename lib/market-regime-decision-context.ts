import type { MarketRegime, MarketRegimeType } from "@/lib/market-regime";

export const MARKET_REGIME_DECISION_CONTEXT_VERSION =
  "market_regime_decision_context_v1" as const;
export const MARKET_REGIME_CLASSIFIER_VERSION = "market_regime_v1" as const;

export type MarketRegimeDecisionContext = {
  contract_version: typeof MARKET_REGIME_DECISION_CONTEXT_VERSION;
  classifier_version: typeof MARKET_REGIME_CLASSIFIER_VERSION;
  captured_at: string;
  regime: MarketRegimeType;
};

const supportedRegimes = new Set<MarketRegimeType>([
  "risk_on",
  "neutral",
  "risk_off",
]);

function recordOrNull(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function canonicalInstant(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return null;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : null;
}

export function buildMarketRegimeDecisionContext(input: {
  marketRegime: MarketRegime | null;
  capturedAt: Date;
}): MarketRegimeDecisionContext | null {
  if (!input.marketRegime || !Number.isFinite(input.capturedAt.getTime())) {
    return null;
  }

  return {
    contract_version: MARKET_REGIME_DECISION_CONTEXT_VERSION,
    classifier_version: MARKET_REGIME_CLASSIFIER_VERSION,
    captured_at: input.capturedAt.toISOString(),
    regime: input.marketRegime.regime,
  };
}

export function marketRegimeDecisionContextFromUnknown(
  value: unknown,
): MarketRegimeDecisionContext | null {
  const record = recordOrNull(value);
  const regime = record?.regime;
  const capturedAt = canonicalInstant(record?.captured_at);
  if (
    record?.contract_version !== MARKET_REGIME_DECISION_CONTEXT_VERSION ||
    record.classifier_version !== MARKET_REGIME_CLASSIFIER_VERSION ||
    typeof regime !== "string" ||
    !supportedRegimes.has(regime as MarketRegimeType) ||
    !capturedAt
  ) {
    return null;
  }

  return {
    contract_version: MARKET_REGIME_DECISION_CONTEXT_VERSION,
    classifier_version: MARKET_REGIME_CLASSIFIER_VERSION,
    captured_at: capturedAt,
    regime: regime as MarketRegimeType,
  };
}

export function marketRegimeDecisionContextFromPayload(payload: unknown) {
  const record = recordOrNull(payload);
  return marketRegimeDecisionContextFromUnknown(record?.market_regime_context);
}

export function marketRegimeValueFromPayload(payload: unknown) {
  const record = recordOrNull(payload);
  const value = record?.market_regime ?? record?.regime;
  const nestedValue = recordOrNull(value)?.regime;
  const regime = typeof value === "string" ? value : nestedValue;
  return typeof regime === "string" &&
    supportedRegimes.has(regime as MarketRegimeType)
    ? (regime as MarketRegimeType)
    : null;
}
