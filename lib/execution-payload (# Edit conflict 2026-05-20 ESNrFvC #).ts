import { normalizeSetupType, type SetupType } from "@/lib/setup-types";

export type TradeExecutionPayload = {
  payload_version: "1.1";
  payload_id: string;
  payload_fingerprint: string;
  created_at: string;
  expires_at: string;
  stale_after_seconds: number;
  generated_from: "add_trade_modal";
  handoff_status: "draft" | "copied" | "ready_for_agent";
  recommendation_id: string;
  ticker: string;
  market: "US";
  broker_hint: "AVANZA";
  direction: "long";
  setup_type: SetupType | "UNKNOWN";
  order_intent: "prepare_only";
  requires_manual_confirmation: true;
  human_final_confirmation_required: true;
  broker_execution_mode: "manual_final_confirmation";
  do_not_submit_order: true;
  order_type: "limit";
  time_in_force: "day";
  shares: number;
  entry_price: number;
  limit_price: number;
  stop_loss: number;
  target_price: number | null;
  latest_price: number | null;
  validation_status: "valid" | "warning" | "unavailable";
  intraday_confirmation: "confirmed" | "mixed" | "weak" | "unknown";
  risk_amount: number | null;
  position_value: number | null;
  max_loss_at_stop: number | null;
  estimated_reward: number | null;
  estimated_r_multiple: number | null;
  confidence_score: number | null;
  notes: string[];
  safety_warnings: string[];
};

export type BuildTradeExecutionPayloadInput = {
  recommendationId: string;
  ticker: string;
  direction?: string | null;
  setupType?: unknown;
  shares?: number | null;
  entryPrice?: number | null;
  limitPrice?: number | null;
  stopLoss?: number | null;
  targetPrice?: number | null;
  latestPrice?: number | null;
  validationStatus?: "valid" | "warning" | "unavailable" | string | null;
  intradayConfirmation?: "confirmed" | "mixed" | "weak" | "unknown" | string | null;
  riskAmount?: number | null;
  confidenceScore?: number | null;
  validationReasons?: string[];
  notes?: string[];
  createdAt?: string;
  now?: Date;
  handoffStatus?: TradeExecutionPayload["handoff_status"];
};

const defaultStaleAfterSeconds = 180;

function finiteNumber(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function positiveNumber(value: number | null | undefined) {
  const parsed = finiteNumber(value);

  return parsed !== null && parsed > 0 ? parsed : null;
}

function roundMoney(value: number | null) {
  return value === null ? null : Number(value.toFixed(2));
}

function roundR(value: number | null) {
  return value === null ? null : Number(value.toFixed(2));
}

function normalizeValidationStatus(
  value: BuildTradeExecutionPayloadInput["validationStatus"],
): TradeExecutionPayload["validation_status"] {
  return value === "warning" || value === "unavailable" ? value : "valid";
}

function normalizeIntradayConfirmation(
  value: BuildTradeExecutionPayloadInput["intradayConfirmation"],
): TradeExecutionPayload["intraday_confirmation"] {
  if (
    value === "confirmed" ||
    value === "mixed" ||
    value === "weak" ||
    value === "unknown"
  ) {
    return value;
  }

  return "unknown";
}

function sanitizePayloadIdPart(value: string) {
  return value.trim().replace(/[^a-zA-Z0-9_-]+/g, "_") || "unknown";
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }

  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([first], [second]) => first.localeCompare(second))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`)
      .join(",")}}`;
  }

  return JSON.stringify(value);
}

function fingerprintPayload(value: unknown) {
  try {
    const text = stableStringify(value);
    let hash = 2166136261;

    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }

    return `fp_${(hash >>> 0).toString(16).padStart(8, "0")}`;
  } catch {
    return "fp_unavailable";
  }
}

export function buildTradeExecutionPayload(
  input: BuildTradeExecutionPayloadInput,
): TradeExecutionPayload {
  const safetyWarnings: string[] = [];
  const notes = [...(input.notes ?? [])];
  const createdAt = input.createdAt ?? new Date().toISOString();
  const createdAtTime = new Date(createdAt).getTime();
  const validCreatedAtTime = Number.isFinite(createdAtTime)
    ? createdAtTime
    : Date.now();
  const expiresAt = new Date(
    validCreatedAtTime + defaultStaleAfterSeconds * 1000,
  ).toISOString();
  const nowTime = input.now?.getTime() ?? Date.now();
  const shares = Math.floor(positiveNumber(input.shares) ?? 0);
  const entryPrice = roundMoney(positiveNumber(input.entryPrice) ?? 0) ?? 0;
  const limitPrice = roundMoney(positiveNumber(input.limitPrice) ?? entryPrice) ?? 0;
  const stopLoss = roundMoney(finiteNumber(input.stopLoss) ?? 0) ?? 0;
  const targetPrice = roundMoney(positiveNumber(input.targetPrice));
  const latestPrice = roundMoney(finiteNumber(input.latestPrice));
  const validationStatus = normalizeValidationStatus(input.validationStatus);
  const intradayConfirmation = normalizeIntradayConfirmation(
    input.intradayConfirmation,
  );
  const riskAmount = roundMoney(finiteNumber(input.riskAmount));
  const confidenceScore = finiteNumber(input.confidenceScore);

  if (shares <= 0) {
    safetyWarnings.push("Share count is missing or not positive.");
  }

  if (entryPrice <= 0) {
    safetyWarnings.push("Entry price is missing or not positive.");
  }

  if (stopLoss <= 0) {
    safetyWarnings.push("Stop loss is missing or not positive.");
  }

  if (stopLoss >= entryPrice && entryPrice > 0) {
    safetyWarnings.push("Stop loss is at or above entry price for a long trade.");
  }

  if (targetPrice === null) {
    safetyWarnings.push("Target price is missing.");
  }

  if (latestPrice === null) {
    safetyWarnings.push("Latest price is unavailable.");
  }

  if (confidenceScore === null) {
    safetyWarnings.push("Confidence score is unavailable.");
  }

  if (validationStatus === "warning") {
    safetyWarnings.push("Latest ADD TRADE validation returned a warning.");
  } else if (validationStatus === "unavailable") {
    safetyWarnings.push("Latest ADD TRADE validation is unavailable.");
  }

  if (nowTime > new Date(expiresAt).getTime()) {
    safetyWarnings.push(
      "Execution payload expired. Reopen ADD TRADE to regenerate fresh order details.",
    );
  }

  for (const reason of input.validationReasons ?? []) {
    if (reason && validationStatus !== "valid") {
      safetyWarnings.push(reason);
    }
  }

  const riskPerShare = entryPrice > 0 && stopLoss > 0 ? entryPrice - stopLoss : null;
  const maxLossAtStop =
    riskPerShare !== null && riskPerShare > 0 && shares > 0
      ? roundMoney(riskPerShare * shares)
      : null;
  const positionValue =
    entryPrice > 0 && shares > 0 ? roundMoney(entryPrice * shares) : null;
  const estimatedReward =
    targetPrice !== null && entryPrice > 0 && shares > 0
      ? roundMoney((targetPrice - entryPrice) * shares)
      : null;
  const estimatedRMultiple =
    estimatedReward !== null && maxLossAtStop !== null && maxLossAtStop > 0
      ? roundR(estimatedReward / maxLossAtStop)
      : null;

  if (input.direction && input.direction.toLowerCase() !== "long") {
    safetyWarnings.push("Only long prepared orders are supported right now.");
  }

  const recommendationId = input.recommendationId || "unknown_recommendation";
  const ticker = input.ticker.trim().toUpperCase() || "UNKNOWN";
  const payloadId = `execution_${sanitizePayloadIdPart(
    recommendationId,
  )}_${sanitizePayloadIdPart(ticker)}_${sanitizePayloadIdPart(createdAt)}`;
  const payloadWithoutFingerprint: TradeExecutionPayload = {
    payload_version: "1.1" as const,
    payload_id: payloadId,
    payload_fingerprint: "",
    created_at: createdAt,
    expires_at: expiresAt,
    stale_after_seconds: defaultStaleAfterSeconds,
    generated_from: "add_trade_modal" as const,
    handoff_status: input.handoffStatus ?? "draft",
    recommendation_id: recommendationId,
    ticker,
    market: "US",
    broker_hint: "AVANZA",
    direction: "long",
    setup_type: normalizeSetupType(input.setupType),
    order_intent: "prepare_only",
    requires_manual_confirmation: true,
    human_final_confirmation_required: true,
    broker_execution_mode: "manual_final_confirmation",
    do_not_submit_order: true,
    order_type: "limit",
    time_in_force: "day",
    shares,
    entry_price: entryPrice,
    limit_price: limitPrice,
    stop_loss: stopLoss,
    target_price: targetPrice,
    latest_price: latestPrice,
    validation_status: validationStatus,
    intraday_confirmation: intradayConfirmation,
    risk_amount: riskAmount,
    position_value: positionValue,
    max_loss_at_stop: maxLossAtStop,
    estimated_reward: estimatedReward,
    estimated_r_multiple: estimatedRMultiple,
    confidence_score: confidenceScore,
    notes,
    safety_warnings: Array.from(new Set(safetyWarnings)),
  };

  return {
    ...payloadWithoutFingerprint,
    payload_fingerprint: fingerprintPayload({
      ...payloadWithoutFingerprint,
      payload_fingerprint: "",
    }),
  };
}
