import type {
  AvanzaRealSelectedRecommendationReadOnlyConnectionResult,
} from "./avanza-real-selected-recommendation-read-only-connection";

export type AvanzaHandoffPackageBuilderMode = "read_only" | "fill_only";

export type AvanzaHandoffPackageStatus =
  | "handoff_disabled"
  | "source_unavailable"
  | "source_invalid"
  | "risk_blocked"
  | "handoff_ready_read_only"
  | "handoff_ready_fill_only";

export type AvanzaHandoffPackageSide = "BUY" | "SELL";

export type AvanzaHandoffPackageOrderType =
  | "LIMIT"
  | "MARKET"
  | "STOP_LIMIT";

export type AvanzaHandoffPackage = {
  accountLabel?: string;
  blockedReasons: string[];
  confidence?: number;
  createdAt: string;
  limitPrice?: number;
  orderType: AvanzaHandoffPackageOrderType;
  packageId: string;
  quantity: number;
  riskSummary: string;
  side: AvanzaHandoffPackageSide;
  sourceRecommendationId?: string;
  stopLoss?: number;
  symbol: string;
  target?: number;
  ticker: string;
  timeInForce?: string;
  warnings: string[];
};

export type AvanzaHandoffPackageBuilderResult = {
  blockedReasons: string[];
  canCallBridge: false;
  canExecute: false;
  canFetchLocalhost: false;
  canPoll: false;
  canPrepareFill: boolean;
  canProceedToHandoff: false;
  controlsEnabled: false;
  gateLocked: true;
  label: string;
  package?: AvanzaHandoffPackage;
  reason: string;
  status: AvanzaHandoffPackageStatus;
  warnings: string[];
};

export type BuildAvanzaHandoffPackageInput = {
  accountLabel?: string | null;
  connectionResult?: unknown;
  handoffEnabled?: boolean;
  mode?: AvanzaHandoffPackageBuilderMode;
  now?: string;
  recommendationCandidate?: unknown;
  side?: AvanzaHandoffPackageSide;
};

type SafeCandidate = {
  accountLabel?: string;
  confidence?: number;
  createdAt?: string;
  expiresAt?: string;
  generatedAt?: string;
  id?: number | string;
  limitPrice?: number;
  orderType?: string;
  price?: number;
  quantity?: number;
  recommendedShares?: number;
  riskMode?: string;
  shares?: number;
  side?: string;
  sourceRecommendationId?: number | string;
  stopLoss?: number;
  symbol?: string;
  target?: number;
  targetPrice?: number;
  ticker?: string;
  timeInForce?: string;
};

const safeOrderTypes: readonly AvanzaHandoffPackageOrderType[] = [
  "LIMIT",
  "MARKET",
  "STOP_LIMIT",
];

const sensitiveAccountLabelPattern =
  /account\s*id|accountid|bankid|cookie|credential|secret|session|storage|token/i;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function finitePositiveNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : undefined;
}

function finiteNonNegativeNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? value
    : undefined;
}

function nonEmptyString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
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

function firstPositiveNumber(
  record: Record<string, unknown>,
  keys: readonly string[],
) {
  for (const key of keys) {
    const value = finitePositiveNumber(record[key]);

    if (value !== undefined) {
      return value;
    }
  }

  return undefined;
}

function normalizeSide(value: unknown): AvanzaHandoffPackageSide | undefined {
  const raw = nonEmptyString(value)?.toUpperCase();

  if (raw === "BUY" || raw === "LONG") {
    return "BUY";
  }

  if (raw === "SELL" || raw === "SHORT") {
    return "SELL";
  }

  return undefined;
}

function normalizeOrderType(value: unknown): AvanzaHandoffPackageOrderType {
  const raw = nonEmptyString(value)?.toUpperCase();

  return safeOrderTypes.includes(raw as AvanzaHandoffPackageOrderType)
    ? (raw as AvanzaHandoffPackageOrderType)
    : "LIMIT";
}

function sanitizeAccountLabel(value: unknown) {
  const label = nonEmptyString(value);

  if (!label) {
    return undefined;
  }

  if (sensitiveAccountLabelPattern.test(label) || /\d{5,}/.test(label)) {
    return undefined;
  }

  return label;
}

function normalizeSourceRecommendationId(value: unknown) {
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return undefined;
}

function isConnectionResult(
  value: unknown,
): value is AvanzaRealSelectedRecommendationReadOnlyConnectionResult {
  return (
    isRecord(value) &&
    typeof value.status === "string" &&
    "normalizedSelectedRecommendationSummary" in value
  );
}

function buildCandidateFromConnectionResult(
  connectionResult: unknown,
): SafeCandidate | null | undefined {
  if (connectionResult == null) {
    return undefined;
  }

  if (!isConnectionResult(connectionResult)) {
    return null;
  }

  if (
    connectionResult.status !== "selected_recommendation_ready_read_only" &&
    connectionResult.status !== "preview_ready_read_only"
  ) {
    return undefined;
  }

  const summary = connectionResult.normalizedSelectedRecommendationSummary;

  if (!summary) {
    return null;
  }

  return {
    confidence: summary.confidence,
    id: summary.id,
    limitPrice: summary.entry,
    quantity: summary.quantity ?? summary.shares,
    shares: summary.shares ?? summary.quantity,
    side: summary.direction ?? summary.action,
    sourceRecommendationId: summary.id,
    stopLoss: summary.stopLoss,
    symbol: summary.symbol ?? summary.ticker,
    target: summary.target,
    ticker: summary.ticker ?? summary.symbol,
  };
}

function buildCandidateFromExplicitInput(
  recommendationCandidate: unknown,
): SafeCandidate | null | undefined {
  if (recommendationCandidate === undefined) {
    return undefined;
  }

  if (recommendationCandidate === null || !isRecord(recommendationCandidate)) {
    return null;
  }

  return {
    accountLabel: firstNonEmptyString(recommendationCandidate, ["accountLabel"]),
    confidence: finiteNonNegativeNumber(recommendationCandidate.confidence),
    createdAt: nonEmptyString(recommendationCandidate.createdAt),
    expiresAt: nonEmptyString(recommendationCandidate.expiresAt),
    generatedAt: nonEmptyString(recommendationCandidate.generatedAt),
    id: normalizeSourceRecommendationId(
      recommendationCandidate.id ?? recommendationCandidate.recommendationId,
    ),
    limitPrice: firstPositiveNumber(recommendationCandidate, [
      "limitPrice",
      "entryPrice",
      "entry",
      "price",
    ]),
    orderType: firstNonEmptyString(recommendationCandidate, ["orderType"]),
    price: finitePositiveNumber(recommendationCandidate.price),
    quantity: firstPositiveNumber(recommendationCandidate, [
      "quantity",
      "recommendedShares",
      "shares",
    ]),
    recommendedShares: finitePositiveNumber(
      recommendationCandidate.recommendedShares,
    ),
    riskMode: nonEmptyString(recommendationCandidate.riskMode),
    shares: finitePositiveNumber(recommendationCandidate.shares),
    side: firstNonEmptyString(recommendationCandidate, [
      "side",
      "direction",
      "action",
    ]),
    sourceRecommendationId: normalizeSourceRecommendationId(
      recommendationCandidate.sourceRecommendationId ??
        recommendationCandidate.recommendationId ??
        recommendationCandidate.id,
    ),
    stopLoss: finitePositiveNumber(recommendationCandidate.stopLoss),
    symbol: firstNonEmptyString(recommendationCandidate, ["symbol", "ticker"]),
    target: firstPositiveNumber(recommendationCandidate, [
      "target",
      "targetPrice",
    ]),
    targetPrice: finitePositiveNumber(recommendationCandidate.targetPrice),
    ticker: firstNonEmptyString(recommendationCandidate, ["ticker", "symbol"]),
    timeInForce: firstNonEmptyString(recommendationCandidate, ["timeInForce"]),
  };
}

function resolveCandidate({
  connectionResult,
  recommendationCandidate,
}: Pick<
  BuildAvanzaHandoffPackageInput,
  "connectionResult" | "recommendationCandidate"
>) {
  const explicitCandidate =
    buildCandidateFromExplicitInput(recommendationCandidate);

  if (explicitCandidate !== undefined) {
    return explicitCandidate;
  }

  return buildCandidateFromConnectionResult(connectionResult);
}

function isExpired(expiry: string | undefined, now: string) {
  if (!expiry || now === "not_provided") {
    return false;
  }

  const expiryMs = Date.parse(expiry);
  const nowMs = Date.parse(now);

  return Number.isFinite(expiryMs) && Number.isFinite(nowMs) && expiryMs < nowMs;
}

function isStale(timestamp: string | undefined, now: string) {
  if (!timestamp || now === "not_provided") {
    return false;
  }

  const timestampMs = Date.parse(timestamp);
  const nowMs = Date.parse(now);
  const maxAgeMs = 1000 * 60 * 60 * 24;

  return (
    Number.isFinite(timestampMs) &&
    Number.isFinite(nowMs) &&
    nowMs - timestampMs > maxAgeMs
  );
}

function baseResult(
  input: Pick<
    AvanzaHandoffPackageBuilderResult,
    "blockedReasons" | "label" | "package" | "reason" | "status" | "warnings"
  >,
): AvanzaHandoffPackageBuilderResult {
  const canPrepareFill = input.status === "handoff_ready_fill_only";

  return {
    ...input,
    ...(input.package ? { package: input.package } : {}),
    canCallBridge: false,
    canExecute: false,
    canFetchLocalhost: false,
    canPoll: false,
    canPrepareFill,
    canProceedToHandoff: false,
    controlsEnabled: false,
    gateLocked: true,
  };
}

function buildPackageId(
  now: string,
  ticker: string,
  side: AvanzaHandoffPackageSide,
  sourceRecommendationId?: string,
) {
  const normalizedNow = now.replace(/[^a-zA-Z0-9]/g, "").slice(0, 20);
  const normalizedTicker = ticker.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  const normalizedSource = sourceRecommendationId
    ? sourceRecommendationId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 24)
    : "no-source-id";

  return [
    "avanza-handoff",
    normalizedTicker || "unknown",
    side.toLowerCase(),
    normalizedSource || "no-source-id",
    normalizedNow || "not-provided",
  ].join("-");
}

export function buildAvanzaHandoffPackage({
  accountLabel,
  connectionResult,
  handoffEnabled = false,
  mode = "read_only",
  now = "not_provided",
  recommendationCandidate,
  side,
}: BuildAvanzaHandoffPackageInput = {}): AvanzaHandoffPackageBuilderResult {
  if (!handoffEnabled) {
    return baseResult({
      blockedReasons: ["handoff disabled"],
      label: "Avanza handoff package disabled",
      reason:
        "Handoff package building is disabled by explicit input. No package is produced and no handoff, bridge, fetch, polling, browser, or order behavior is available.",
      status: "handoff_disabled",
      warnings: [],
    });
  }

  const candidate = resolveCandidate({ connectionResult, recommendationCandidate });

  if (candidate === undefined) {
    return baseResult({
      blockedReasons: ["source unavailable"],
      label: "Avanza handoff source unavailable",
      reason:
        "No explicit recommendation-like candidate or ready read-only connection output was provided.",
      status: "source_unavailable",
      warnings: [],
    });
  }

  if (candidate === null) {
    return baseResult({
      blockedReasons: ["source invalid"],
      label: "Avanza handoff source invalid",
      reason:
        "The explicit handoff source must be a recommendation-like object or a ready read-only connection output.",
      status: "source_invalid",
      warnings: [],
    });
  }

  const ticker = nonEmptyString(candidate.ticker);
  const symbol = nonEmptyString(candidate.symbol) ?? ticker;
  const resolvedSide = side ?? normalizeSide(candidate.side);
  const quantity = finitePositiveNumber(
    candidate.quantity ?? candidate.recommendedShares ?? candidate.shares,
  );
  const orderType = normalizeOrderType(candidate.orderType);
  const limitPrice = finitePositiveNumber(candidate.limitPrice ?? candidate.price);
  const stopLoss = finitePositiveNumber(candidate.stopLoss);
  const target = finitePositiveNumber(candidate.target ?? candidate.targetPrice);
  const sourceRecommendationId = normalizeSourceRecommendationId(
    candidate.sourceRecommendationId ?? candidate.id,
  );
  const confidence = finiteNonNegativeNumber(candidate.confidence);
  const resolvedAccountLabel = sanitizeAccountLabel(
    accountLabel ?? candidate.accountLabel,
  );
  const warnings: string[] = [];
  const blockedReasons: string[] = [];

  if (!ticker) {
    blockedReasons.push("missing ticker");
  }

  if (!resolvedSide) {
    blockedReasons.push("missing or invalid side");
  }

  if (!quantity) {
    blockedReasons.push("invalid quantity");
  }

  if (orderType !== "MARKET" && !limitPrice) {
    blockedReasons.push("invalid or unsafe price");
  }

  if (isExpired(candidate.expiresAt, now)) {
    blockedReasons.push("recommendation expired");
  }

  if (isStale(candidate.generatedAt ?? candidate.createdAt, now)) {
    warnings.push("recommendation appears stale");
  }

  if (!stopLoss) {
    const requiresStopLoss =
      candidate.riskMode?.toLowerCase() === "strict" || mode === "fill_only";

    if (requiresStopLoss) {
      blockedReasons.push("missing stopLoss");
    } else {
      warnings.push("missing stopLoss");
    }
  }

  if (!target) {
    warnings.push("missing target");
  }

  if (blockedReasons.length > 0) {
    return baseResult({
      blockedReasons,
      label: "Avanza handoff package risk blocked",
      reason:
        "The explicit handoff source is present, but required handoff package fields failed read-only safety validation.",
      status: "risk_blocked",
      warnings,
    });
  }

  if (!ticker || !symbol || !resolvedSide || !quantity) {
    return baseResult({
      blockedReasons: ["source invalid"],
      label: "Avanza handoff source invalid",
      reason:
        "The explicit handoff source could not be normalized to the required package fields.",
      status: "source_invalid",
      warnings,
    });
  }

  const packageOutput: AvanzaHandoffPackage = {
    ...(resolvedAccountLabel ? { accountLabel: resolvedAccountLabel } : {}),
    ...(confidence !== undefined ? { confidence } : {}),
    ...(orderType !== "MARKET" && limitPrice ? { limitPrice } : {}),
    ...(sourceRecommendationId ? { sourceRecommendationId } : {}),
    ...(stopLoss ? { stopLoss } : {}),
    ...(target ? { target } : {}),
    ...(nonEmptyString(candidate.timeInForce)
      ? { timeInForce: nonEmptyString(candidate.timeInForce) }
      : {}),
    blockedReasons: [],
    createdAt: now,
    orderType,
    packageId: buildPackageId(now, ticker, resolvedSide, sourceRecommendationId),
    quantity,
    riskSummary:
      warnings.length > 0
        ? "Package is structurally ready with read-only warnings. No execution is enabled."
        : "Package is structurally ready for read-only review. No execution is enabled.",
    side: resolvedSide,
    symbol,
    ticker,
    warnings,
  };

  const readyStatus =
    mode === "fill_only"
      ? "handoff_ready_fill_only"
      : "handoff_ready_read_only";

  return baseResult({
    blockedReasons: [],
    label:
      mode === "fill_only"
        ? "Avanza handoff package ready for fill-only contract"
        : "Avanza handoff package ready for read-only review",
    package: packageOutput,
    reason:
      mode === "fill_only"
        ? "The explicit source produced a structurally safe fill-only handoff package. This does not call bridge, browser, localhost, Avanza, or execution paths."
        : "The explicit source produced a structurally safe read-only handoff package. Controls remain disabled and the gate remains locked.",
    status: readyStatus,
    warnings,
  });
}
