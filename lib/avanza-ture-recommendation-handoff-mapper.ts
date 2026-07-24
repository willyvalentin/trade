import type {
  AvanzaBridgeReadinessSummary,
} from "@/lib/avanza-bridge-readiness-checklist";
import type {
  BuildAvanzaHandoffPackagePreviewInput,
  AvanzaHandoffPackagePreviewSide,
} from "@/lib/avanza-handoff-package-preview";

export type TureRecommendationHandoffSource = {
  accountDisplayName?: string | null;
  companyName?: string | null;
  company_name?: string | null;
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
  shares?: number | string | null;
  side?: string | null;
  ticker?: string | null;
};

export type MapTureRecommendationToAvanzaHandoffInputOptions = {
  accountDisplayName?: string | null;
  orderMode?: string | null;
  readinessSummary: AvanzaBridgeReadinessSummary;
};

const DEFAULT_ACCOUNT_DISPLAY_NAME = "Valentin Labs KF";
const DEFAULT_ORDER_MODE = "Avancerad/Limit";
const DEFAULT_STOP_BOUNDARY = "before Granska köp";

function cleanValue(value: number | string | null | undefined) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  return null;
}

function cleanString(value: number | string | null | undefined) {
  const cleaned = cleanValue(value);
  return cleaned === null ? null : String(cleaned);
}

function numberValue(value: number | string | null | undefined) {
  const cleaned = cleanValue(value);

  if (typeof cleaned === "number") {
    return cleaned;
  }

  if (typeof cleaned === "string") {
    const parsed = Number(cleaned.replace(",", "."));
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function firstCleanValue(
  values: Array<number | string | null | undefined>,
): number | string | null {
  for (const value of values) {
    const cleaned = cleanValue(value);

    if (cleaned !== null) {
      return cleaned;
    }
  }

  return null;
}

function inferSide(source: TureRecommendationHandoffSource): AvanzaHandoffPackagePreviewSide {
  const rawSide = `${source.side ?? source.direction ?? ""}`.trim().toLowerCase();

  if (rawSide === "buy" || rawSide === "long") {
    return "buy";
  }

  if (rawSide === "sell") {
    return "sell";
  }

  if (rawSide === "short") {
    return "short";
  }

  return "unknown";
}

function inferLimitPrice(source: TureRecommendationHandoffSource) {
  const explicitPrice = firstCleanValue([
    source.limitPrice,
    source.entryPriceValue,
    source.entryPrice,
  ]);

  if (explicitPrice !== null) {
    return explicitPrice;
  }

  const low = numberValue(source.entryLowValue ?? source.entry_low);
  const high = numberValue(source.entryHighValue ?? source.entry_high);

  if (low !== null && high !== null) {
    return (low + high) / 2;
  }

  return high ?? low;
}

export function mapTureRecommendationToAvanzaHandoffInput(
  source: TureRecommendationHandoffSource,
  options: MapTureRecommendationToAvanzaHandoffInputOptions,
): BuildAvanzaHandoffPackagePreviewInput {
  return {
    accountDisplayName:
      cleanString(source.accountDisplayName) ??
      cleanString(options.accountDisplayName) ??
      DEFAULT_ACCOUNT_DISPLAY_NAME,
    companyName: cleanString(source.companyName ?? source.company_name),
    instrumentDisplayName: cleanString(
      source.instrumentDisplayName ??
        source.displayName ??
        source.companyName ??
        source.company_name,
    ),
    limitPrice: inferLimitPrice(source),
    orderMode:
      cleanString(source.orderMode) ??
      cleanString(options.orderMode) ??
      DEFAULT_ORDER_MODE,
    quantity: firstCleanValue([
      source.quantity,
      source.shares,
      source.positionSizeValue,
      source.positionSize,
    ]),
    quantityStrategy: "quantity_based",
    readinessSummary: options.readinessSummary,
    recommendationId:
      cleanString(
        source.recommendationId ?? source.recommendation_id ?? source.id,
      ) ?? "unknown-recommendation",
    side: inferSide(source),
    stopBoundary: DEFAULT_STOP_BOUNDARY,
    ticker: cleanString(source.ticker),
  };
}
