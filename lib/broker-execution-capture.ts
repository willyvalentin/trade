import {
  validateExecutionIntent,
  type BrokerExecutionResult,
  type BrokerExecutionStatus,
  type ExecutionAction,
  type ExecutionIntent,
} from "@/lib/execution";

export type BrokerExecutionCaptureStatus =
  | "captured"
  | "invalid_intent"
  | "invalid_result"
  | "intent_result_mismatch"
  | "broker_rejected"
  | "broker_cancelled"
  | "broker_unknown";

export type BrokerExecutionCaptureBrokerResult = Partial<BrokerExecutionResult> & {
  broker?: "avanza" | "AVANZA" | string | null;
  action?: ExecutionAction | string | null;
  ticker?: string | null;
  instrumentName?: string | null;
  instrument_name?: string | null;
  quantity?: number | string | null;
  requestedPrice?: number | string | null;
  requested_price?: number | string | null;
  executedPrice?: number | string | null;
  executed_price?: number | string | null;
  orderId?: string | null;
  order_id?: string | null;
  brokerTimestamp?: string | null;
  broker_timestamp?: string | null;
};

export type BrokerExecutionCaptureIntent = Partial<ExecutionIntent> & {
  instrumentName?: string | null;
  instrument_name?: string | null;
  intendedPrice?: number | string | null;
  intended_price?: number | string | null;
};

export type TureExecutionRecord = {
  recordId: string;
  createdAt: string;
  broker: "avanza";
  mode: ExecutionIntent["mode"] | null;
  action: ExecutionAction | null;
  intentId: string | null;
  recommendationId: string | null;
  positionId: string | null;
  ticker: string | null;
  instrumentName: string | null;
  quantity: number | null;
  requestedPrice: number | null;
  executedPrice: number | null;
  orderId: string | null;
  brokerTimestamp: string | null;
  brokerStatus: BrokerExecutionStatus | null;
  intent: Partial<ExecutionIntent> | null;
  brokerResult: BrokerExecutionCaptureBrokerResult | null;
  captureStatus: BrokerExecutionCaptureStatus;
  reason: string;
};

export type BrokerExecutionCaptureInput = {
  intent: BrokerExecutionCaptureIntent | null | undefined;
  result: BrokerExecutionCaptureBrokerResult | null | undefined;
  createdAt?: string | null;
  recordId?: string | null;
};

export type BuildTureExecutionRecordOptions = {
  createdAt?: string | null;
  recordId?: string | null;
};

export type BrokerExecutionCaptureResult = {
  record: TureExecutionRecord;
  captureStatus: BrokerExecutionCaptureStatus;
  intentErrors: string[];
  resultErrors: string[];
  mismatchReasons: string[];
  reason: string;
};

export type BrokerResultIntentMatchResult = {
  matches: boolean;
  reasons: string[];
};

const brokerExecutionStatuses: BrokerExecutionStatus[] = [
  "submitted",
  "filled",
  "partially_filled",
  "rejected",
  "cancelled",
  "unknown",
];

function nullableString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function finiteNumber(value: unknown) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const parsed = Number(value.trim().replace(",", "."));

  return Number.isFinite(parsed) ? parsed : null;
}

function positiveNumber(value: unknown) {
  const parsed = finiteNumber(value);

  return parsed !== null && parsed > 0 ? parsed : null;
}

function normalizeCreatedAt(value: string | null | undefined) {
  const createdAt = nullableString(value);

  return createdAt && Number.isFinite(Date.parse(createdAt))
    ? createdAt
    : new Date().toISOString();
}

function normalizeBroker(value: unknown) {
  const broker = nullableString(value);

  return broker?.toLowerCase() === "avanza" ? "avanza" : null;
}

function normalizeAction(value: unknown): ExecutionAction | null {
  return value === "buy" || value === "sell" ? value : null;
}

function normalizeStatus(value: unknown): BrokerExecutionStatus | null {
  return brokerExecutionStatuses.includes(value as BrokerExecutionStatus)
    ? (value as BrokerExecutionStatus)
    : null;
}

function normalizeTicker(value: unknown) {
  return nullableString(value)?.toUpperCase() ?? null;
}

function normalizeRecordIdPart(value: string | null | undefined) {
  return value?.trim().replace(/[^a-zA-Z0-9_-]+/g, "_") || "unknown";
}

function normalizeResult(result: BrokerExecutionCaptureBrokerResult | null | undefined) {
  const broker = normalizeBroker(result?.broker ?? result?.broker_hint);
  const action = normalizeAction(result?.action);
  const ticker = normalizeTicker(result?.ticker);
  const quantity =
    positiveNumber(result?.quantity) ?? positiveNumber(result?.filled_quantity);
  const status = normalizeStatus(result?.status);
  const instrumentName =
    nullableString(result?.instrumentName) ??
    nullableString(result?.instrument_name);
  const requestedPrice =
    finiteNumber(result?.requestedPrice) ?? finiteNumber(result?.requested_price);
  const executedPrice =
    finiteNumber(result?.executedPrice) ??
    finiteNumber(result?.executed_price) ??
    finiteNumber(result?.average_fill_price);
  const orderId =
    nullableString(result?.orderId) ??
    nullableString(result?.order_id) ??
    nullableString(result?.broker_order_id);
  const brokerTimestamp =
    nullableString(result?.brokerTimestamp) ??
    nullableString(result?.broker_timestamp) ??
    nullableString(result?.filled_at) ??
    nullableString(result?.submitted_at) ??
    nullableString(result?.captured_at);

  return {
    broker,
    action,
    ticker,
    quantity,
    status,
    instrumentName,
    requestedPrice,
    executedPrice,
    orderId,
    brokerTimestamp,
  };
}

function requestedPriceFromIntent(intent: Partial<ExecutionIntent> | null | undefined) {
  const captureIntent = intent as BrokerExecutionCaptureIntent | null | undefined;

  return (
    finiteNumber(captureIntent?.intendedPrice) ??
    finiteNumber(captureIntent?.intended_price) ??
    finiteNumber(intent?.trading_package?.limit_price) ??
    finiteNumber(intent?.trading_package?.target_price) ??
    finiteNumber(intent?.trading_package?.stop_loss)
  );
}

function instrumentNameFromIntent(
  intent: BrokerExecutionCaptureIntent | null | undefined,
) {
  return nullableString(intent?.instrumentName) ?? nullableString(intent?.instrument_name);
}

function createRecordId(
  intent: Partial<ExecutionIntent> | null | undefined,
  result: BrokerExecutionCaptureBrokerResult | null | undefined,
  createdAt: string,
) {
  const intentId = normalizeRecordIdPart(intent?.intent_id);
  const orderId = normalizeRecordIdPart(
    nullableString(result?.orderId) ??
      nullableString(result?.order_id) ??
      nullableString(result?.broker_order_id),
  );
  const timestamp = normalizeRecordIdPart(createdAt);

  return `ture_execution_${intentId}_${orderId}_${timestamp}`;
}

function statusReason(status: BrokerExecutionCaptureStatus) {
  if (status === "captured") {
    return "Broker execution result was captured.";
  }

  if (status === "broker_rejected") {
    return "Broker execution result was rejected.";
  }

  if (status === "broker_cancelled") {
    return "Broker execution result was cancelled.";
  }

  if (status === "broker_unknown") {
    return "Broker execution status is unknown.";
  }

  return "Broker execution result could not be captured.";
}

export function validateBrokerExecutionResult(
  result: BrokerExecutionCaptureBrokerResult | null | undefined,
): string[] {
  const errors: string[] = [];
  const normalized = normalizeResult(result);

  if (!result) {
    return ["Broker execution result is missing."];
  }

  if (normalized.broker !== "avanza") {
    errors.push("Broker execution result broker must be avanza.");
  }

  if (!normalized.action) {
    errors.push("Broker execution result action must be buy or sell.");
  }

  if (!normalized.ticker) {
    errors.push("Broker execution result ticker is missing.");
  }

  if (normalized.quantity === null) {
    errors.push("Broker execution result quantity is missing or not positive.");
  }

  if (!normalized.status) {
    errors.push("Broker execution result status is invalid.");
  }

  return errors;
}

export function doesBrokerResultMatchIntent(
  intent: Partial<ExecutionIntent> | null | undefined,
  result: BrokerExecutionCaptureBrokerResult | null | undefined,
): BrokerResultIntentMatchResult {
  const reasons: string[] = [];
  const normalized = normalizeResult(result);
  const intentBroker = intent?.broker_hint === "AVANZA" ? "avanza" : null;
  const intentAction = normalizeAction(intent?.action);
  const intentTicker = normalizeTicker(intent?.trading_package?.ticker);
  const intentQuantity = positiveNumber(intent?.trading_package?.quantity);

  if (intentBroker !== normalized.broker) {
    reasons.push("Broker result broker does not match intent broker.");
  }

  if (intentAction !== normalized.action) {
    reasons.push("Broker result action does not match intent action.");
  }

  if (intentTicker !== normalized.ticker) {
    reasons.push("Broker result ticker does not match intent ticker.");
  }

  if (intentQuantity !== normalized.quantity) {
    reasons.push("Broker result quantity does not match intent quantity.");
  }

  return {
    matches: reasons.length === 0,
    reasons,
  };
}

export function isSuccessfulBrokerExecutionStatus(
  status: BrokerExecutionStatus | null | undefined,
) {
  return (
    status === "submitted" ||
    status === "filled" ||
    status === "partially_filled"
  );
}

export function isTerminalBrokerExecutionStatus(
  status: BrokerExecutionStatus | null | undefined,
) {
  return (
    status === "filled" ||
    status === "rejected" ||
    status === "cancelled" ||
    status === "unknown"
  );
}

export function getBrokerExecutionCaptureStatus(
  intent: Partial<ExecutionIntent> | null | undefined,
  result: BrokerExecutionCaptureBrokerResult | null | undefined,
): BrokerExecutionCaptureStatus {
  const intentValidation = validateExecutionIntent(intent);
  const resultErrors = validateBrokerExecutionResult(result);
  const match = doesBrokerResultMatchIntent(intent, result);
  const status = normalizeResult(result).status;

  if (!intentValidation.valid) {
    return "invalid_intent";
  }

  if (resultErrors.length > 0) {
    return "invalid_result";
  }

  if (!match.matches) {
    return "intent_result_mismatch";
  }

  if (status === "rejected") {
    return "broker_rejected";
  }

  if (status === "cancelled") {
    return "broker_cancelled";
  }

  if (status === "unknown") {
    return "broker_unknown";
  }

  return "captured";
}

export function buildTureExecutionRecord(
  input: BrokerExecutionCaptureInput,
): BrokerExecutionCaptureResult;
export function buildTureExecutionRecord(
  intent: BrokerExecutionCaptureIntent | null | undefined,
  result: BrokerExecutionCaptureBrokerResult | null | undefined,
  options?: BuildTureExecutionRecordOptions,
): BrokerExecutionCaptureResult;
export function buildTureExecutionRecord(
  inputOrIntent: BrokerExecutionCaptureInput | BrokerExecutionCaptureIntent | null | undefined,
  result?: BrokerExecutionCaptureBrokerResult | null | undefined,
  options: BuildTureExecutionRecordOptions = {},
): BrokerExecutionCaptureResult {
  const input =
    result === undefined && inputOrIntent && "result" in inputOrIntent
      ? inputOrIntent
      : {
          intent: inputOrIntent as BrokerExecutionCaptureIntent | null | undefined,
          result,
          createdAt: options.createdAt,
          recordId: options.recordId,
        };
  const createdAt = normalizeCreatedAt(input.createdAt);
  const intentValidation = validateExecutionIntent(input.intent);
  const resultErrors = validateBrokerExecutionResult(input.result);
  const match = doesBrokerResultMatchIntent(input.intent, input.result);
  const captureStatus = getBrokerExecutionCaptureStatus(
    input.intent,
    input.result,
  );
  const normalizedResult = normalizeResult(input.result);
  const reason =
    captureStatus === "invalid_intent"
      ? intentValidation.errors.join(" ")
      : captureStatus === "invalid_result"
        ? resultErrors.join(" ")
        : captureStatus === "intent_result_mismatch"
          ? match.reasons.join(" ")
          : statusReason(captureStatus);
  const record: TureExecutionRecord = {
    recordId:
      nullableString(input.recordId) ??
      createRecordId(input.intent, input.result, createdAt),
    createdAt,
    broker: "avanza",
    mode: input.intent?.mode ?? null,
    action: normalizeAction(input.intent?.action) ?? normalizedResult.action,
    intentId: input.intent?.intent_id ?? null,
    recommendationId: input.intent?.trading_package?.recommendation_id ?? null,
    positionId: input.intent?.trading_package?.live_position_id ?? null,
    ticker:
      normalizeTicker(input.intent?.trading_package?.ticker) ??
      normalizedResult.ticker,
    instrumentName:
      instrumentNameFromIntent(input.intent) ?? normalizedResult.instrumentName,
    quantity:
      positiveNumber(input.intent?.trading_package?.quantity) ??
      normalizedResult.quantity,
    requestedPrice:
      normalizedResult.requestedPrice ?? requestedPriceFromIntent(input.intent),
    executedPrice: normalizedResult.executedPrice,
    orderId: normalizedResult.orderId,
    brokerTimestamp: normalizedResult.brokerTimestamp,
    brokerStatus: normalizedResult.status,
    intent: input.intent ?? null,
    brokerResult: input.result ?? null,
    captureStatus,
    reason,
  };

  return {
    record,
    captureStatus,
    intentErrors: intentValidation.errors,
    resultErrors,
    mismatchReasons: match.reasons,
    reason,
  };
}
