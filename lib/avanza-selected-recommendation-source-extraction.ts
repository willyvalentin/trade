export type AvanzaSelectedRecommendationSourceExtractionStatus =
  | "no_source"
  | "source_unavailable"
  | "source_blocked"
  | "source_invalid"
  | "source_ready_read_only";

export type AvanzaSelectedRecommendationSourceKind =
  | "unspecified"
  | "trade_ui_state"
  | "recommendation_card"
  | "trade_modal"
  | "static_fixture"
  | (string & {});

export type AvanzaSelectedRecommendationNormalizedSourceSummary = {
  action?: string;
  confidence?: number;
  direction?: string;
  entry?: number;
  id?: number | string;
  quantity?: number;
  range?: string;
  shares?: number;
  stopLoss?: number;
  symbol?: string;
  target?: number;
  ticker?: string;
};

export type AvanzaSelectedRecommendationSourceExtractionResult = {
  canCallBridge: false;
  canExecute: false;
  canFetchLocalhost: false;
  canPoll: false;
  canProceedToHandoff: false;
  canProceedToPreviewModel: boolean;
  controlsEnabled: false;
  gateLocked: true;
  label: string;
  normalizedSourceSummary?: AvanzaSelectedRecommendationNormalizedSourceSummary;
  reason: string;
  selectedRecommendationLikeInput?: AvanzaSelectedRecommendationNormalizedSourceSummary;
  sourceKind: AvanzaSelectedRecommendationSourceKind;
  sourceName: string;
  status: AvanzaSelectedRecommendationSourceExtractionStatus;
};

export type BuildAvanzaSelectedRecommendationSourceExtractionInput = {
  blocked?: boolean;
  blockedReason?: string | null;
  candidate?: unknown;
  sourceKind?: AvanzaSelectedRecommendationSourceKind | null;
  sourceName?: string | null;
};

const safeDirectionValues = new Set(["buy", "long", "sell", "short"]);

const numericFieldKeys = [
  "confidence",
  "entry",
  "entryPrice",
  "limitPrice",
  "price",
  "quantity",
  "recommendedShares",
  "shares",
  "stopLoss",
  "target",
  "targetPrice",
] as const;

function baseResult(
  input: Pick<
    AvanzaSelectedRecommendationSourceExtractionResult,
    | "canProceedToPreviewModel"
    | "label"
    | "normalizedSourceSummary"
    | "reason"
    | "selectedRecommendationLikeInput"
    | "sourceKind"
    | "sourceName"
    | "status"
  >,
): AvanzaSelectedRecommendationSourceExtractionResult {
  return {
    ...input,
    canCallBridge: false,
    canExecute: false,
    canFetchLocalhost: false,
    canPoll: false,
    canProceedToHandoff: false,
    controlsEnabled: false,
    gateLocked: true,
  };
}

function normalizeSourceName(value?: string | null) {
  const trimmed = value?.trim();

  return trimmed || "selected_recommendation_source";
}

function normalizeSourceKind(
  value?: AvanzaSelectedRecommendationSourceKind | null,
): AvanzaSelectedRecommendationSourceKind {
  if (typeof value !== "string") {
    return "unspecified";
  }

  const trimmed = value.trim();

  return trimmed ? trimmed : "unspecified";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nonEmptyString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;
}

function finiteNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

function firstNonEmptyString(
  record: Record<string, unknown>,
  keys: readonly string[],
) {
  for (const key of keys) {
    const value = nonEmptyString(record[key]);

    if (value) {
      return value;
    }
  }

  return undefined;
}

function firstFiniteNumber(
  record: Record<string, unknown>,
  keys: readonly string[],
) {
  for (const key of keys) {
    const value = finiteNumber(record[key]);

    if (value !== undefined) {
      return value;
    }
  }

  return undefined;
}

function hasInvalidNumericField(record: Record<string, unknown>) {
  return numericFieldKeys.some((key) => {
    const value = record[key];

    return value !== undefined && finiteNumber(value) === undefined;
  });
}

function normalizeDirection(value: string) {
  const normalized = value.trim().toLowerCase();

  return safeDirectionValues.has(normalized) ? normalized : undefined;
}

function buildSummary(
  record: Record<string, unknown>,
): AvanzaSelectedRecommendationNormalizedSourceSummary | null {
  if (hasInvalidNumericField(record)) {
    return null;
  }

  const ticker = firstNonEmptyString(record, ["ticker", "symbol"]);
  const symbol = firstNonEmptyString(record, ["symbol", "ticker"]);

  if (!ticker) {
    return null;
  }

  const rawDirection = firstNonEmptyString(record, [
    "direction",
    "action",
    "side",
  ]);
  const direction = rawDirection ? normalizeDirection(rawDirection) : undefined;

  if (rawDirection && !direction) {
    return null;
  }

  const summary: AvanzaSelectedRecommendationNormalizedSourceSummary = {
    ticker,
  };
  const id = record.id ?? record.recommendationId;

  if (typeof id === "string" || typeof id === "number") {
    summary.id = id;
  }

  if (symbol) {
    summary.symbol = symbol;
  }

  if (direction) {
    summary.direction = direction;
  }

  const rawAction = firstNonEmptyString(record, ["action", "side"]);

  if (rawAction) {
    const action = normalizeDirection(rawAction);

    if (!action) {
      return null;
    }

    summary.action = action;
  }

  const range = firstNonEmptyString(record, ["range", "entryRange"]);

  if (range) {
    summary.range = range;
  }

  const entry = firstFiniteNumber(record, [
    "entry",
    "entryPrice",
    "limitPrice",
    "price",
  ]);
  const stopLoss = firstFiniteNumber(record, ["stopLoss"]);
  const target = firstFiniteNumber(record, ["target", "targetPrice"]);
  const quantity = firstFiniteNumber(record, [
    "quantity",
    "recommendedShares",
    "shares",
  ]);
  const shares = firstFiniteNumber(record, ["shares", "recommendedShares"]);
  const confidence = firstFiniteNumber(record, ["confidence"]);

  if (entry !== undefined) {
    summary.entry = entry;
  }

  if (stopLoss !== undefined) {
    summary.stopLoss = stopLoss;
  }

  if (target !== undefined) {
    summary.target = target;
  }

  if (quantity !== undefined) {
    summary.quantity = quantity;
  }

  if (shares !== undefined) {
    summary.shares = shares;
  }

  if (confidence !== undefined) {
    summary.confidence = confidence;
  }

  return summary;
}

export function buildAvanzaSelectedRecommendationSourceExtraction({
  blocked = false,
  blockedReason,
  candidate,
  sourceKind,
  sourceName,
}: BuildAvanzaSelectedRecommendationSourceExtractionInput = {}): AvanzaSelectedRecommendationSourceExtractionResult {
  const resolvedSourceName = normalizeSourceName(sourceName);
  const resolvedSourceKind = normalizeSourceKind(sourceKind);

  if (blocked) {
    return baseResult({
      canProceedToPreviewModel: false,
      label: "SelectedRecommendation source blocked",
      reason:
        blockedReason?.trim() ||
        "The explicit selectedRecommendation source was blocked before read-only extraction.",
      sourceKind: resolvedSourceKind,
      sourceName: resolvedSourceName,
      status: "source_blocked",
    });
  }

  if (candidate === undefined) {
    return baseResult({
      canProceedToPreviewModel: false,
      label: "No selectedRecommendation source",
      reason:
        "No explicit selectedRecommendation candidate was provided. Source extraction remains read-only and does not search, fetch, poll, or read app state.",
      sourceKind: resolvedSourceKind,
      sourceName: resolvedSourceName,
      status: "no_source",
    });
  }

  if (candidate === null) {
    return baseResult({
      canProceedToPreviewModel: false,
      label: "SelectedRecommendation source unavailable",
      reason:
        "The explicit selectedRecommendation source is currently unavailable. No preview input is connected.",
      sourceKind: resolvedSourceKind,
      sourceName: resolvedSourceName,
      status: "source_unavailable",
    });
  }

  if (!isRecord(candidate)) {
    return baseResult({
      canProceedToPreviewModel: false,
      label: "Invalid selectedRecommendation source",
      reason:
        "The explicit selectedRecommendation candidate must be an object with preview-safe fields.",
      sourceKind: resolvedSourceKind,
      sourceName: resolvedSourceName,
      status: "source_invalid",
    });
  }

  const normalizedSourceSummary = buildSummary(candidate);

  if (!normalizedSourceSummary) {
    return baseResult({
      canProceedToPreviewModel: false,
      label: "Invalid selectedRecommendation source",
      reason:
        "The explicit selectedRecommendation candidate is missing a safe ticker/symbol, has an unsafe direction/action, or has invalid numeric fields.",
      sourceKind: resolvedSourceKind,
      sourceName: resolvedSourceName,
      status: "source_invalid",
    });
  }

  return baseResult({
    canProceedToPreviewModel: true,
    label: "SelectedRecommendation source ready for read-only preview model",
    normalizedSourceSummary,
    reason:
      "The explicit selectedRecommendation candidate was normalized to safe read-only source fields. It may proceed to a future passive preview model connection only.",
    selectedRecommendationLikeInput: normalizedSourceSummary,
    sourceKind: resolvedSourceKind,
    sourceName: resolvedSourceName,
    status: "source_ready_read_only",
  });
}
