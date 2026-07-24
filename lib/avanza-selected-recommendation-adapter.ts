import type {
  TureRecommendationHandoffSource,
} from "@/lib/avanza-ture-recommendation-handoff-mapper";

type NullablePrimitive = number | string | null | undefined;

export type AvanzaSelectedRecommendationAdapterInput = {
  accountDisplayName?: string | null;
  companyName?: string | null;
  company_name?: string | null;
  confidence?: number | string | null;
  confidenceLabel?: string | null;
  confidenceScore?: number | string | null;
  direction?: string | null;
  displayName?: string | null;
  entryHighValue?: number | string | null;
  entryLowValue?: number | string | null;
  entryPrice?: number | string | null;
  entryPriceValue?: number | string | null;
  entry_high?: number | string | null;
  entry_low?: number | string | null;
  id?: string | null;
  instrumentDisplayName?: string | null;
  limitPrice?: number | string | null;
  orderMode?: string | null;
  positionSize?: number | string | null;
  positionSizeValue?: number | string | null;
  quantity?: number | string | null;
  recommendationId?: string | null;
  recommendation_id?: string | null;
  recommendedShares?: number | string | null;
  setupType?: string | null;
  shares?: number | string | null;
  side?: string | null;
  suggestedShares?: number | string | null;
  symbol?: string | null;
  ticker?: string | null;
};

export type AvanzaSelectedRecommendationAdapterOptions = {
  accountDisplayName?: string | null;
  orderMode?: string | null;
  plannedQuantity?: number | string | null;
  positionSizing?: {
    suggestedShares?: number | string | null;
  } | null;
};

function cleanValue(value: NullablePrimitive) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  return null;
}

function cleanString(value: NullablePrimitive) {
  const cleaned = cleanValue(value);
  return cleaned === null ? null : String(cleaned);
}

function firstCleanValue(values: NullablePrimitive[]) {
  for (const value of values) {
    const cleaned = cleanValue(value);

    if (cleaned !== null) {
      return cleaned;
    }
  }

  return null;
}

function normalizeSideOrDirection(
  source: AvanzaSelectedRecommendationAdapterInput,
) {
  const rawValue = cleanString(source.side ?? source.direction);

  if (!rawValue) {
    return null;
  }

  const normalized = rawValue.toLowerCase();

  if (normalized === "buy" || normalized === "long") {
    return "long";
  }

  if (normalized === "sell") {
    return "sell";
  }

  if (normalized === "short") {
    return "short";
  }

  return rawValue;
}

export function adaptSelectedRecommendationToAvanzaHandoffSource(
  source: AvanzaSelectedRecommendationAdapterInput,
  options: AvanzaSelectedRecommendationAdapterOptions = {},
): TureRecommendationHandoffSource {
  const recommendationId = cleanString(
    source.recommendationId ?? source.recommendation_id ?? source.id,
  );
  const displayName = cleanString(
    source.instrumentDisplayName ??
      source.displayName ??
      source.companyName ??
      source.company_name,
  );
  const quantity = firstCleanValue([
    options.plannedQuantity,
    options.positionSizing?.suggestedShares,
    source.quantity,
    source.shares,
    source.suggestedShares,
    source.recommendedShares,
    source.positionSizeValue,
    source.positionSize,
  ]);

  return {
    accountDisplayName: cleanString(
      options.accountDisplayName ?? source.accountDisplayName,
    ),
    companyName: cleanString(source.companyName ?? source.company_name),
    direction: normalizeSideOrDirection(source),
    displayName,
    entryHighValue: firstCleanValue([
      source.entryHighValue,
      source.entry_high,
    ]),
    entryLowValue: firstCleanValue([source.entryLowValue, source.entry_low]),
    entryPrice: firstCleanValue([source.entryPrice]),
    entryPriceValue: firstCleanValue([source.entryPriceValue]),
    id: recommendationId,
    instrumentDisplayName: displayName,
    limitPrice: firstCleanValue([source.limitPrice]),
    orderMode: cleanString(options.orderMode ?? source.orderMode),
    positionSize: quantity,
    positionSizeValue: quantity,
    quantity,
    recommendationId,
    shares: quantity,
    ticker: cleanString(source.ticker ?? source.symbol),
  };
}
