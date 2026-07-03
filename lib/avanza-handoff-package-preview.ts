import type {
  AvanzaBridgeReadinessSummary,
} from "@/lib/avanza-bridge-readiness-checklist";

export type AvanzaHandoffPackagePreviewSide =
  | "buy"
  | "sell"
  | "short"
  | "unknown";

export type AvanzaHandoffPackageQuantityStrategy = "quantity_based";

export type BuildAvanzaHandoffPackagePreviewInput = {
  accountDisplayName?: string | null;
  companyName?: string | null;
  instrumentDisplayName?: string | null;
  limitPrice?: number | string | null;
  orderMode?: "Avancerad/Limit" | string | null;
  quantity?: number | string | null;
  quantityStrategy?: AvanzaHandoffPackageQuantityStrategy | null;
  readinessSummary: AvanzaBridgeReadinessSummary;
  recommendationId: string;
  side: AvanzaHandoffPackagePreviewSide;
  stopBoundary?: "before Granska köp" | string | null;
  ticker?: string | null;
};

export type AvanzaHandoffPackagePreview = {
  accountDisplayLabel: string;
  actionLabel: "Prepare Avanza handoff";
  advisoryNotes: string[];
  blocked: boolean;
  blockedReason: string | null;
  boundary: string;
  companyName: string | null;
  instrumentDisplayName: string;
  limitPrice: string | null;
  manualReviewRequired: true;
  orderMode: string;
  previewId: string;
  quantity: string | null;
  quantityStrategy: AvanzaHandoffPackageQuantityStrategy;
  readinessSummaryStatus: AvanzaBridgeReadinessSummary["status"];
  recommendationId: string;
  side: "buy";
  ticker: string | null;
  totalReadStatus: "unresolved_advisory";
};

const DEFAULT_ACCOUNT_DISPLAY_NAME = "Valentin Labs KF";
const DEFAULT_ORDER_MODE = "Avancerad/Limit";
const DEFAULT_STOP_BOUNDARY = "before Granska köp";

function cleanValue(value: number | string | null | undefined) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  return null;
}

function normalizeTicker(ticker: string | null | undefined) {
  const cleaned = cleanValue(ticker);
  return cleaned ? cleaned.toUpperCase() : null;
}

function buildPreviewId(recommendationId: string, ticker: string | null) {
  const safeRecommendationId = recommendationId.trim() || "unknown";
  const safeTicker = ticker ?? "missing-ticker";
  return `avanza-handoff-preview:${safeRecommendationId}:${safeTicker}`;
}

export function buildAvanzaHandoffPackagePreview({
  accountDisplayName,
  companyName,
  instrumentDisplayName,
  limitPrice,
  orderMode,
  quantity,
  quantityStrategy,
  readinessSummary,
  recommendationId,
  side,
  stopBoundary,
  ticker,
}: BuildAvanzaHandoffPackagePreviewInput): AvanzaHandoffPackagePreview {
  const normalizedTicker = normalizeTicker(ticker);
  const normalizedQuantity = cleanValue(quantity);
  const normalizedLimitPrice = cleanValue(limitPrice);
  const advisoryNotes = [
    "Total-read unresolved/advisory.",
    "Manual review required in Avanza.",
    "No order placement.",
  ];
  const blockedReasons: string[] = [];

  if (!normalizedTicker) {
    blockedReasons.push("Missing ticker.");
  }

  if (side !== "buy") {
    blockedReasons.push("Current Avanza fill-only POC is buy-only.");
  }

  if (!normalizedQuantity) {
    advisoryNotes.push("Quantity is missing and must be resolved before handoff.");
  }

  if (!normalizedLimitPrice) {
    advisoryNotes.push("Limit price is missing and must be resolved before handoff.");
  }

  return {
    accountDisplayLabel: cleanValue(accountDisplayName) ?? DEFAULT_ACCOUNT_DISPLAY_NAME,
    actionLabel: "Prepare Avanza handoff",
    advisoryNotes,
    blocked: blockedReasons.length > 0,
    blockedReason: blockedReasons.length > 0 ? blockedReasons.join(" ") : null,
    boundary: cleanValue(stopBoundary) ?? DEFAULT_STOP_BOUNDARY,
    companyName: cleanValue(companyName),
    instrumentDisplayName:
      cleanValue(instrumentDisplayName) ??
      cleanValue(companyName) ??
      normalizedTicker ??
      "Unknown instrument",
    limitPrice: normalizedLimitPrice,
    manualReviewRequired: true,
    orderMode: cleanValue(orderMode) ?? DEFAULT_ORDER_MODE,
    previewId: buildPreviewId(recommendationId, normalizedTicker),
    quantity: normalizedQuantity,
    quantityStrategy: quantityStrategy ?? "quantity_based",
    readinessSummaryStatus: readinessSummary.status,
    recommendationId,
    side: "buy",
    ticker: normalizedTicker,
    totalReadStatus: "unresolved_advisory",
  };
}
