import {
  avanzaRealSelectedRecommendationReadOnlyInputDefaultGuard,
  type AvanzaRealSelectedRecommendationReadOnlyInputGuardDecision,
} from "./avanza-real-selected-recommendation-read-only-input-guard";

export type AvanzaRealSelectedRecommendationReadOnlyInputValidationStatus =
  | "no_input"
  | "guard_blocked"
  | "invalid_input"
  | "valid_read_only_input";

export type AvanzaRealSelectedRecommendationReadOnlyInputValidationSourceMode =
  | "none"
  | "blocked"
  | "real_selected_recommendation_read_only";

export type AvanzaRealSelectedRecommendationReadOnlyInputSummary = {
  action?: string;
  confidence?: number;
  direction?: string;
  entry?: number | string;
  id?: number | string;
  quantity?: number;
  range?: string;
  shares?: number;
  stopLoss?: number;
  symbol?: string;
  target?: number;
  ticker?: string;
};

export type AvanzaRealSelectedRecommendationReadOnlyInputValidationResult = {
  canCallBridge: false;
  canExecute: false;
  canFetchLocalhost: false;
  canPoll: false;
  canProceedToAdapterNormalization: boolean;
  canProceedToReadOnlyDerivation: boolean;
  controlsEnabled: false;
  gateLocked: true;
  label: string;
  normalizedInputSummary?: AvanzaRealSelectedRecommendationReadOnlyInputSummary;
  reason: string;
  sourceMode: AvanzaRealSelectedRecommendationReadOnlyInputValidationSourceMode;
  status: AvanzaRealSelectedRecommendationReadOnlyInputValidationStatus;
};

export type BuildAvanzaRealSelectedRecommendationReadOnlyInputValidationInput = {
  guardDecision?: AvanzaRealSelectedRecommendationReadOnlyInputGuardDecision;
  input?: unknown;
};

const safeDirectionValues = new Set([
  "buy",
  "long",
  "sell",
  "short",
]);

function baseResult(
  input: Pick<
    AvanzaRealSelectedRecommendationReadOnlyInputValidationResult,
    | "canProceedToAdapterNormalization"
    | "canProceedToReadOnlyDerivation"
    | "label"
    | "normalizedInputSummary"
    | "reason"
    | "sourceMode"
    | "status"
  >,
): AvanzaRealSelectedRecommendationReadOnlyInputValidationResult {
  return {
    ...input,
    canCallBridge: false,
    canExecute: false,
    canFetchLocalhost: false,
    canPoll: false,
    controlsEnabled: false,
    gateLocked: true,
  };
}

function hasNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function optionalFiniteNumber(value: unknown): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return undefined;
  }

  return value;
}

function firstNonEmptyString(
  record: Record<string, unknown>,
  keys: readonly string[],
) {
  for (const key of keys) {
    const value = record[key];

    if (hasNonEmptyString(value)) {
      return value.trim();
    }
  }

  return undefined;
}

function firstFiniteNumber(
  record: Record<string, unknown>,
  keys: readonly string[],
) {
  for (const key of keys) {
    const value = optionalFiniteNumber(record[key]);

    if (value !== undefined) {
      return value;
    }
  }

  return undefined;
}

function hasInvalidNumericField(record: Record<string, unknown>) {
  const numericKeys = [
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

  return numericKeys.some((key) => {
    const value = record[key];

    return value !== undefined && (typeof value !== "number" || !Number.isFinite(value));
  });
}

function normalizeDirection(value: string) {
  const normalized = value.trim().toLowerCase();

  if (!safeDirectionValues.has(normalized)) {
    return undefined;
  }

  return normalized;
}

function buildSummary(
  record: Record<string, unknown>,
): AvanzaRealSelectedRecommendationReadOnlyInputSummary | null {
  const ticker = firstNonEmptyString(record, ["ticker", "symbol"]);
  const symbol = firstNonEmptyString(record, ["symbol", "ticker"]);
  const rawDirection = firstNonEmptyString(record, [
    "direction",
    "action",
    "side",
  ]);
  const direction = rawDirection ? normalizeDirection(rawDirection) : undefined;

  if (!ticker || !direction || hasInvalidNumericField(record)) {
    return null;
  }

  const summary: AvanzaRealSelectedRecommendationReadOnlyInputSummary = {
    direction,
    ticker,
  };
  const id = record.id ?? record.recommendationId;

  if (typeof id === "string" || typeof id === "number") {
    summary.id = id;
  }

  if (symbol) {
    summary.symbol = symbol;
  }

  const action = firstNonEmptyString(record, ["action", "side"]);

  if (action) {
    const normalizedAction = normalizeDirection(action);

    if (!normalizedAction) {
      return null;
    }

    summary.action = normalizedAction;
  }

  const range = firstNonEmptyString(record, ["range", "entryRange"]);

  if (range) {
    summary.range = range;
  }

  const entry = firstFiniteNumber(record, ["entry", "entryPrice", "limitPrice", "price"]);
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

export function buildAvanzaRealSelectedRecommendationReadOnlyInputValidation({
  guardDecision = avanzaRealSelectedRecommendationReadOnlyInputDefaultGuard,
  input,
}: BuildAvanzaRealSelectedRecommendationReadOnlyInputValidationInput = {}): AvanzaRealSelectedRecommendationReadOnlyInputValidationResult {
  if (input == null) {
    return baseResult({
      canProceedToAdapterNormalization: false,
      canProceedToReadOnlyDerivation: false,
      label: "No real selectedRecommendation input",
      reason:
        "No explicit selectedRecommendation-like input was provided. Validation remains read-only, controls stay disabled, and the gate stays locked.",
      sourceMode: "none",
      status: "no_input",
    });
  }

  if (guardDecision.status !== "read_only_input_allowed") {
    return baseResult({
      canProceedToAdapterNormalization: false,
      canProceedToReadOnlyDerivation: false,
      label: "Real selectedRecommendation input validation blocked",
      reason:
        "The read-only input guard does not allow explicit selectedRecommendation-like input validation.",
      sourceMode: "blocked",
      status: "guard_blocked",
    });
  }

  if (!isRecord(input)) {
    return baseResult({
      canProceedToAdapterNormalization: false,
      canProceedToReadOnlyDerivation: false,
      label: "Invalid real selectedRecommendation input",
      reason:
        "The explicit selectedRecommendation-like input must be an object with preview-safe fields.",
      sourceMode: "blocked",
      status: "invalid_input",
    });
  }

  const normalizedInputSummary = buildSummary(input);

  if (!normalizedInputSummary) {
    return baseResult({
      canProceedToAdapterNormalization: false,
      canProceedToReadOnlyDerivation: false,
      label: "Invalid real selectedRecommendation input",
      reason:
        "The explicit selectedRecommendation-like input is missing a safe ticker/symbol, safe direction/action, or has invalid numeric fields.",
      sourceMode: "blocked",
      status: "invalid_input",
    });
  }

  return baseResult({
    canProceedToAdapterNormalization: true,
    canProceedToReadOnlyDerivation: true,
    label: "Valid real selectedRecommendation read-only input",
    normalizedInputSummary,
    reason:
      "The explicit selectedRecommendation-like input contains only validation-safe summary fields. It may proceed to future read-only adapter normalization in model state only.",
    sourceMode: "real_selected_recommendation_read_only",
    status: "valid_read_only_input",
  });
}
