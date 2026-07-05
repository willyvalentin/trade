import type {
  AvanzaHandoffPackage,
  AvanzaHandoffPackageBuilderResult,
  AvanzaHandoffPackageOrderType,
} from "./avanza-handoff-package-builder";

export type AvanzaFillOnlyAdapterMode = "disabled" | "dry_run" | "fill_only";

export type AvanzaFillOnlyAdapterStatus =
  | "adapter_disabled"
  | "package_unavailable"
  | "package_invalid"
  | "dry_run_ready"
  | "fill_only_ready"
  | "fill_only_blocked"
  | "fill_started"
  | "fill_completed_waiting_manual_review"
  | "fill_failed"
  | "cancelled"
  | "unknown";

export type AvanzaFillOnlyAdapterSide = "BUY" | "SELL";

export type AvanzaFillOnlyAdapterSafetyFlags = {
  canClickConfirm: false;
  canClickReview: false;
  canFillForm: boolean;
  canHandleCredentials: false;
  canReadBankId: false;
  canReadCookies: false;
  canSubmitOrder: false;
  canWriteSupabaseExecution: false;
  controlsEnabled: false;
  finalHumanClickRequired: true;
  gateLocked: true;
  userMustConfirm: true;
};

export type AvanzaFillOnlyAdapterRequest = {
  accountLabel?: string;
  broker: "avanza";
  createdAt: string;
  finalHumanClickRequired: true;
  limitPrice?: number;
  mode: Exclude<AvanzaFillOnlyAdapterMode, "disabled">;
  orderType: AvanzaHandoffPackageOrderType;
  packageId: string;
  quantity: number;
  requestId: string;
  side: AvanzaFillOnlyAdapterSide;
  sourceRecommendationId?: string;
  stopLoss?: number;
  symbol: string;
  target?: number;
  ticker: string;
  timeInForce?: string;
  userMustConfirm: true;
};

export type AvanzaFillOnlyAdapterResponse = AvanzaFillOnlyAdapterSafetyFlags & {
  blockedReasons: string[];
  label: string;
  reason: string;
  request?: AvanzaFillOnlyAdapterRequest;
  safetyFlags: AvanzaFillOnlyAdapterSafetyFlags;
  status: AvanzaFillOnlyAdapterStatus;
  warnings: string[];
};

export type BuildAvanzaFillOnlyAdapterContractInput = {
  adapterEnabled: boolean;
  broker: "avanza";
  handoffPackage?: unknown;
  mode: AvanzaFillOnlyAdapterMode;
  now?: string;
  requestId?: string;
};

type NormalizedPackageResult = {
  blockedReasons: string[];
  package?: AvanzaHandoffPackage;
  warnings: string[];
};

const baseSafetyFlags: Omit<
  AvanzaFillOnlyAdapterSafetyFlags,
  "canFillForm"
> = {
  canClickConfirm: false,
  canClickReview: false,
  canHandleCredentials: false,
  canReadBankId: false,
  canReadCookies: false,
  canSubmitOrder: false,
  canWriteSupabaseExecution: false,
  controlsEnabled: false,
  finalHumanClickRequired: true,
  gateLocked: true,
  userMustConfirm: true,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nonEmptyString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;
}

function finitePositiveNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : undefined;
}

function normalizeSide(value: unknown): AvanzaFillOnlyAdapterSide | undefined {
  const side = nonEmptyString(value)?.toUpperCase();

  return side === "BUY" || side === "SELL" ? side : undefined;
}

function normalizeOrderType(
  value: unknown,
): AvanzaHandoffPackageOrderType | undefined {
  const orderType = nonEmptyString(value)?.toUpperCase();

  if (
    orderType === "LIMIT" ||
    orderType === "MARKET" ||
    orderType === "STOP_LIMIT"
  ) {
    return orderType;
  }

  return undefined;
}

function isBuilderResult(
  value: unknown,
): value is AvanzaHandoffPackageBuilderResult {
  return isRecord(value) && typeof value.status === "string";
}

function normalizeHandoffPackage(value: unknown): NormalizedPackageResult {
  if (isBuilderResult(value)) {
    return {
      blockedReasons: Array.isArray(value.blockedReasons)
        ? value.blockedReasons.filter((reason) => typeof reason === "string")
        : [],
      package: value.package,
      warnings: Array.isArray(value.warnings)
        ? value.warnings.filter((warning) => typeof warning === "string")
        : [],
    };
  }

  return {
    blockedReasons: [],
    package: value as AvanzaHandoffPackage,
    warnings: [],
  };
}

function validatePackage(
  handoffPackage: AvanzaHandoffPackage | undefined,
): string[] {
  if (!isRecord(handoffPackage)) {
    return ["package invalid"];
  }

  const blockedReasons: string[] = [];
  const ticker = nonEmptyString(handoffPackage.ticker);
  const symbol = nonEmptyString(handoffPackage.symbol);
  const side = normalizeSide(handoffPackage.side);
  const quantity = finitePositiveNumber(handoffPackage.quantity);
  const orderType = normalizeOrderType(handoffPackage.orderType);
  const packageId = nonEmptyString(handoffPackage.packageId);

  if (!packageId) {
    blockedReasons.push("missing packageId");
  }

  if (!ticker) {
    blockedReasons.push("missing ticker");
  }

  if (!symbol) {
    blockedReasons.push("missing symbol");
  }

  if (!side) {
    blockedReasons.push("missing or invalid side");
  }

  if (!quantity) {
    blockedReasons.push("invalid quantity");
  }

  if (!orderType) {
    blockedReasons.push("invalid orderType");
  }

  if (
    orderType &&
    orderType !== "MARKET" &&
    !finitePositiveNumber(handoffPackage.limitPrice)
  ) {
    blockedReasons.push("invalid or unsafe price");
  }

  if (
    Array.isArray(handoffPackage.blockedReasons) &&
    handoffPackage.blockedReasons.length > 0
  ) {
    blockedReasons.push("package has blocked reasons");
  }

  return blockedReasons;
}

function buildRequestId(inputRequestId: string | undefined, packageId: string) {
  const explicitRequestId = nonEmptyString(inputRequestId);

  if (explicitRequestId) {
    return explicitRequestId;
  }

  return `avanza-fill-only-${packageId}`;
}

function buildRequestFromPackage({
  handoffPackage,
  mode,
  now,
  requestId,
}: {
  handoffPackage: AvanzaHandoffPackage;
  mode: Exclude<AvanzaFillOnlyAdapterMode, "disabled">;
  now: string;
  requestId?: string;
}): AvanzaFillOnlyAdapterRequest {
  const sourceRecommendationId = nonEmptyString(
    handoffPackage.sourceRecommendationId,
  );
  const accountLabel = nonEmptyString(handoffPackage.accountLabel);
  const limitPrice = finitePositiveNumber(handoffPackage.limitPrice);
  const stopLoss = finitePositiveNumber(handoffPackage.stopLoss);
  const target = finitePositiveNumber(handoffPackage.target);
  const timeInForce = nonEmptyString(handoffPackage.timeInForce);

  return {
    ...(accountLabel ? { accountLabel } : {}),
    ...(limitPrice ? { limitPrice } : {}),
    ...(sourceRecommendationId ? { sourceRecommendationId } : {}),
    ...(stopLoss ? { stopLoss } : {}),
    ...(target ? { target } : {}),
    ...(timeInForce ? { timeInForce } : {}),
    broker: "avanza",
    createdAt: now,
    finalHumanClickRequired: true,
    mode,
    orderType: handoffPackage.orderType,
    packageId: handoffPackage.packageId,
    quantity: handoffPackage.quantity,
    requestId: buildRequestId(requestId, handoffPackage.packageId),
    side: handoffPackage.side,
    symbol: handoffPackage.symbol,
    ticker: handoffPackage.ticker,
    userMustConfirm: true,
  };
}

function buildResponse(
  input: Omit<
    AvanzaFillOnlyAdapterResponse,
    keyof AvanzaFillOnlyAdapterSafetyFlags | "safetyFlags"
  >,
): AvanzaFillOnlyAdapterResponse {
  const safetyFlags: AvanzaFillOnlyAdapterSafetyFlags = {
    ...baseSafetyFlags,
    canFillForm: input.status === "fill_only_ready",
  };

  return {
    ...input,
    ...safetyFlags,
    safetyFlags,
  };
}

export function buildAvanzaFillOnlyAdapterRequest(
  input: BuildAvanzaFillOnlyAdapterContractInput,
): AvanzaFillOnlyAdapterResponse {
  return buildAvanzaFillOnlyAdapterResponse(input);
}

export function buildAvanzaFillOnlyAdapterResponse({
  adapterEnabled,
  broker,
  handoffPackage,
  mode,
  now = "not_provided",
  requestId,
}: BuildAvanzaFillOnlyAdapterContractInput): AvanzaFillOnlyAdapterResponse {
  if (!adapterEnabled || mode === "disabled") {
    return buildResponse({
      blockedReasons: ["adapter disabled"],
      label: "Avanza fill-only adapter disabled",
      reason:
        "The Avanza fill-only adapter contract is disabled by explicit input. No request is created and no fill, bridge, browser, or order behavior is available.",
      status: "adapter_disabled",
      warnings: [],
    });
  }

  if (broker !== "avanza") {
    return buildResponse({
      blockedReasons: ["unsupported broker"],
      label: "Avanza fill-only adapter package invalid",
      reason: "The adapter contract only accepts explicit Avanza broker input.",
      status: "package_invalid",
      warnings: [],
    });
  }

  if (handoffPackage === undefined || handoffPackage === null) {
    return buildResponse({
      blockedReasons: ["package unavailable"],
      label: "Avanza fill-only adapter package unavailable",
      reason: "No explicit safe handoff package was provided.",
      status: "package_unavailable",
      warnings: [],
    });
  }

  const normalizedPackage = normalizeHandoffPackage(handoffPackage);
  const packageValidationBlockers = validatePackage(normalizedPackage.package);
  const blockedReasons = [
    ...normalizedPackage.blockedReasons,
    ...packageValidationBlockers,
  ];

  if (blockedReasons.length > 0) {
    return buildResponse({
      blockedReasons,
      label:
        mode === "fill_only"
          ? "Avanza fill-only adapter package blocked"
          : "Avanza fill-only adapter package invalid",
      reason:
        mode === "fill_only"
          ? "The explicit handoff package is present but blocked or unsafe for fill-only request creation."
          : "The explicit handoff package failed adapter request validation.",
      status: mode === "fill_only" ? "fill_only_blocked" : "package_invalid",
      warnings: normalizedPackage.warnings,
    });
  }

  if (!normalizedPackage.package) {
    return buildResponse({
      blockedReasons: ["package invalid"],
      label: "Avanza fill-only adapter package invalid",
      reason: "The explicit handoff package could not be normalized.",
      status: "package_invalid",
      warnings: normalizedPackage.warnings,
    });
  }

  const request = buildRequestFromPackage({
    handoffPackage: normalizedPackage.package,
    mode,
    now,
    requestId,
  });
  const status: AvanzaFillOnlyAdapterStatus =
    mode === "fill_only" ? "fill_only_ready" : "dry_run_ready";

  return buildResponse({
    blockedReasons: [],
    label:
      mode === "fill_only"
        ? "Avanza fill-only adapter request ready"
        : "Avanza fill-only adapter dry-run request ready",
    reason:
      mode === "fill_only"
        ? "A safe explicit handoff package produced a fill-only adapter request model. Final human confirmation remains mandatory and review/confirm/submit behavior remains unavailable."
        : "A safe explicit handoff package produced a dry-run adapter request model. No fill, bridge, browser, Avanza, or order behavior is available.",
    request,
    status,
    warnings: normalizedPackage.warnings,
  });
}
