import type { AvanzaExecutionHandoff } from "@/lib/avanza-execution-handoff";
import {
  createAvanzaDryRunOrderInput,
  summarizeAvanzaDryRunOrderInput,
  validateAvanzaDryRunOrderInput,
  type AvanzaDryRunAccountPolicy,
  type AvanzaDryRunOrderInput,
  type AvanzaDryRunRequestValidationResult,
} from "@/lib/avanza-dry-run-request-contract";
import type { ExecutionAction, ExecutionIntent } from "@/lib/execution";

export type ExecutionIntentToAvanzaDryRunInput = {
  executionIntent: Partial<ExecutionIntent> | null | undefined;
  handoffPayload?: AvanzaExecutionHandoff | null;
  accountPolicy?: AvanzaDryRunAccountPolicy;
  expectedAccountLabel?: string;
  metadata?: Record<string, unknown>;
};

export type ExecutionIntentToAvanzaDryRunResult = {
  ok: boolean;
  request?: AvanzaDryRunOrderInput;
  validation: AvanzaDryRunRequestValidationResult;
  errors: string[];
  warnings: string[];
  sourceSummary: string;
  createdAt: string;
};

type PriceSource = "limit_price" | "target_price" | "stop_loss" | null;

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function positiveNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : null;
}

function positiveInteger(value: unknown): number | null {
  return typeof value === "number" &&
    Number.isFinite(value) &&
    Number.isInteger(value) &&
    value > 0
    ? value
    : null;
}

function supportedAction(value: unknown): value is ExecutionAction {
  return value === "buy" || value === "sell";
}

function normalizeCreatedAt(value: unknown) {
  const timestamp = optionalString(value);

  return timestamp && Number.isFinite(Date.parse(timestamp))
    ? timestamp
    : new Date().toISOString();
}

function pickIntent(input: ExecutionIntentToAvanzaDryRunInput) {
  return input.executionIntent ?? input.handoffPayload?.intent ?? null;
}

function pickPrice(intent: Partial<ExecutionIntent> | null): {
  price: number | null;
  source: PriceSource;
} {
  const tradingPackage = intent?.trading_package;
  const limitPrice = positiveNumber(tradingPackage?.limit_price);

  if (limitPrice !== null) {
    return { price: limitPrice, source: "limit_price" };
  }

  const targetPrice = positiveNumber(tradingPackage?.target_price);

  if (intent?.action === "sell" && targetPrice !== null) {
    return { price: targetPrice, source: "target_price" };
  }

  const stopLoss = positiveNumber(tradingPackage?.stop_loss);

  if (intent?.action === "sell" && stopLoss !== null) {
    return { price: stopLoss, source: "stop_loss" };
  }

  if (targetPrice !== null) {
    return { price: targetPrice, source: "target_price" };
  }

  if (stopLoss !== null) {
    return { price: stopLoss, source: "stop_loss" };
  }

  return { price: null, source: null };
}

function buildSourceSummary(
  intent: Partial<ExecutionIntent> | null,
  priceSource: PriceSource,
) {
  return [
    "execution_intent",
    optionalString(intent?.intent_id) ?? "missing_intent_id",
    supportedAction(intent?.action) ? intent.action : "unsupported_action",
    optionalString(intent?.trading_package?.ticker) ?? "missing_ticker",
    priceSource ? `price:${priceSource}` : "missing_price",
    "No broker submission",
    "Stop at confirmation modal",
  ].join(" / ");
}

function collectUnsafeMetadataErrors(
  metadata: Record<string, unknown> | undefined,
) {
  const errors: string[] = [];

  if (metadata?.allowFinalSubmit === true) {
    errors.push("Adapter metadata must not request final submit.");
  }

  if (metadata?.supportsBrokerSubmission === true) {
    errors.push("Adapter metadata must not request broker submission.");
  }

  if (metadata?.supportsFinalConfirmClick === true) {
    errors.push("Adapter metadata must not request final-confirm clicks.");
  }

  if (metadata?.automaticModeCapable === true) {
    errors.push("Adapter metadata must not request automatic mode.");
  }

  return errors;
}

export function buildAvanzaDryRunOrderInputFromExecutionIntent(
  input: ExecutionIntentToAvanzaDryRunInput,
): ExecutionIntentToAvanzaDryRunResult {
  const intent = pickIntent(input);
  const createdAt = normalizeCreatedAt(intent?.created_at);
  const errors: string[] = [];
  const warnings: string[] = [];
  const tradingPackage = intent?.trading_package;
  const action = intent?.action;
  const ticker = optionalString(tradingPackage?.ticker);
  const quantity = positiveInteger(tradingPackage?.quantity);
  const { price, source: priceSource } = pickPrice(intent);
  const sourceSummary = buildSourceSummary(intent, priceSource);

  if (!intent) {
    errors.push("Execution intent is missing.");
  }

  if (!supportedAction(action)) {
    errors.push("Execution intent action must be buy or sell.");
  }

  if (!ticker) {
    errors.push("Execution intent ticker is missing.");
  }

  if (quantity === null) {
    errors.push("Execution intent quantity is missing or not positive.");
  }

  if (price === null) {
    errors.push("Execution intent price is missing.");
  }

  if (intent?.mode === "automatic") {
    errors.push("Automatic execution mode is not allowed for Avanza dry-run.");
  }

  if (intent?.authority?.allowFinalSubmit === true) {
    errors.push("Execution authority must not allow final submit for dry-run.");
  }

  if (intent?.authority?.can_submit_broker_order === true) {
    errors.push(
      "Execution authority must not allow broker submission for dry-run.",
    );
  }

  if (input.handoffPayload?.canSubmitFinalOrder === true) {
    errors.push("Handoff must not allow final order submit for dry-run.");
  }

  errors.push(...collectUnsafeMetadataErrors(input.metadata));

  const metadata = {
    ...(input.metadata ?? {}),
    source: "execution_intent",
    executionIntentId: optionalString(intent?.intent_id),
    handoffStatus: input.handoffPayload?.status,
    handoffCanPrepareOrder: input.handoffPayload?.canPrepareOrder,
    priceSource,
    allowFinalSubmit: false,
    supportsBrokerSubmission: false,
    supportsFinalConfirmClick: false,
    automaticModeCapable: false,
  };

  const validationCandidate = {
    action: supportedAction(action) ? action : action,
    instrument: {
      ticker: ticker ?? "",
      market: optionalString(tradingPackage?.market),
    },
    quantity: quantity ?? tradingPackage?.quantity ?? 0,
    price: price ?? 0,
    orderMode: "advanced",
    accountPolicy: input.accountPolicy ?? "require_manual_review",
    expectedAccountLabel: optionalString(input.expectedAccountLabel),
    stopPolicy: "stop_at_confirmation_modal",
    sourceRecommendationId: optionalString(tradingPackage?.recommendation_id),
    executionIntentId: optionalString(intent?.intent_id),
    createdAt,
    metadata,
  };
  const validation = validateAvanzaDryRunOrderInput(validationCandidate);
  const combinedErrors = [...errors, ...validation.errors];
  const combinedWarnings = [...warnings, ...validation.warnings];

  if (combinedErrors.length > 0 || !validation.normalized) {
    return {
      ok: false,
      validation,
      errors: combinedErrors,
      warnings: combinedWarnings,
      sourceSummary,
      createdAt,
    };
  }

  const request = createAvanzaDryRunOrderInput({
    action: validation.normalized.action,
    instrument: validation.normalized.instrument,
    quantity: validation.normalized.quantity,
    price: validation.normalized.price,
    accountPolicy: validation.normalized.accountPolicy,
    expectedAccountLabel: validation.normalized.expectedAccountLabel,
    stopPolicy: "stop_at_confirmation_modal",
    sourceRecommendationId: validation.normalized.sourceRecommendationId,
    executionIntentId: validation.normalized.executionIntentId,
    createdAt: validation.normalized.createdAt,
    metadata,
  });
  const finalValidation = validateAvanzaDryRunOrderInput(request);
  const finalErrors = [...errors, ...finalValidation.errors];
  const finalWarnings = [...warnings, ...finalValidation.warnings];

  return {
    ok: finalErrors.length === 0 && finalValidation.ok,
    request: finalErrors.length === 0 && finalValidation.ok ? request : undefined,
    validation: finalValidation,
    errors: finalErrors,
    warnings: finalWarnings,
    sourceSummary,
    createdAt,
  };
}

export function summarizeExecutionIntentToAvanzaDryRunResult(
  result: ExecutionIntentToAvanzaDryRunResult,
) {
  return [
    result.ok ? "ok" : "blocked",
    result.request ? summarizeAvanzaDryRunOrderInput(result.request) : result.sourceSummary,
    `errors=${result.errors.length}`,
    `warnings=${result.warnings.length}`,
  ].join(" / ");
}
