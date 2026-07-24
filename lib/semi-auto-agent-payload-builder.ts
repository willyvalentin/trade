import {
  buildSemiAutoAgentPayloadIdentity,
  SEMI_AUTO_AGENT_PAYLOAD_AUTHORITY,
  validateSemiAutoAgentPayload,
  type SemiAutoAgentPayloadIntent,
  type SemiAutoAgentPayloadOrderType,
  type SemiAutoAgentPayloadSafetyCheck,
  type SemiAutoAgentPayloadSide,
  type SemiAutoAvanzaAgentPayload,
  type SemiAutoAgentPayloadValidationResult,
} from "@/lib/semi-auto-agent-payload-contract";

export type SemiAutoAgentPayloadBuilderSource =
  | "recommendation"
  | "live_position";

export type BuildSemiAutoAgentPayloadInput = {
  source: SemiAutoAgentPayloadBuilderSource;
  recommendation_id?: string | null;
  recommendation_fingerprint?: string | null;
  position_id?: string | null;
  ticker?: string | null;
  side?: SemiAutoAgentPayloadSide | null;
  action?: SemiAutoAgentPayloadSide | null;
  quantity?: number | null;
  order_type?: SemiAutoAgentPayloadOrderType | null;
  entry_price?: number | null;
  limit_price?: number | null;
  stop_price?: number | null;
  target_price?: number | null;
  risk_per_share?: number | null;
  total_planned_risk?: number | null;
  created_at?: string | null;
  expires_at?: string | null;
  stale_after?: string | null;
  stale_after_seconds?: number | null;
  broker_target_label?: string | null;
  intent?: SemiAutoAgentPayloadIntent | null;
  safety_checks?: SemiAutoAgentPayloadSafetyCheck[];
  warnings?: string[];
};

export type SemiAutoAgentPayloadBuilderStatus = "ready" | "blocked";

export type BuildSemiAutoAgentPayloadResult = {
  status: SemiAutoAgentPayloadBuilderStatus;
  payload: SemiAutoAvanzaAgentPayload;
  validation: SemiAutoAgentPayloadValidationResult;
  errors: string[];
  warnings: string[];
};

const defaultStaleAfterSeconds = 180;
const defaultBrokerTargetLabel = "Avanza manual browser handoff";

function optionalText(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function positiveFiniteNumber(value: unknown): number | null {
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

function validTimestamp(value: unknown): string | null {
  const text = optionalText(value);

  return text && Number.isFinite(Date.parse(text)) ? text : null;
}

function timestampFrom(value: string | null, fallback: string): string {
  return validTimestamp(value) ?? fallback;
}

function addSeconds(timestamp: string, seconds: number): string {
  const base = Date.parse(timestamp);
  const safeBase = Number.isFinite(base) ? base : 0;

  return new Date(safeBase + seconds * 1000).toISOString();
}

function defaultSideForSource(
  source: SemiAutoAgentPayloadBuilderSource,
): SemiAutoAgentPayloadSide {
  return source === "live_position" ? "sell" : "buy";
}

function defaultIntentFor(
  source: SemiAutoAgentPayloadBuilderSource,
): SemiAutoAgentPayloadIntent {
  return source === "live_position" ? "manual_exit" : "entry";
}

function buildSafetyChecks(
  input: BuildSemiAutoAgentPayloadInput,
  normalized: {
    ticker: string;
    side: SemiAutoAgentPayloadSide | null;
    action: SemiAutoAgentPayloadSide | null;
    quantity: number;
    stopPrice: number;
    targetPrice: number;
    riskPerShare: number;
    totalPlannedRisk: number;
  },
): SemiAutoAgentPayloadSafetyCheck[] {
  return [
    {
      id: "ticker_present",
      status: normalized.ticker ? "passed" : "failed",
      message: normalized.ticker ? "Ticker is present." : "Ticker is missing.",
    },
    {
      id: "side_action_present",
      status:
        normalized.side && normalized.action && normalized.side === normalized.action
          ? "passed"
          : "failed",
      message:
        normalized.side && normalized.action && normalized.side === normalized.action
          ? "Side/action is present and aligned."
          : "Side/action is missing or mismatched.",
    },
    {
      id: "quantity_positive",
      status: normalized.quantity > 0 ? "passed" : "failed",
      message:
        normalized.quantity > 0
          ? "Quantity is positive."
          : "Quantity is missing or not positive.",
    },
    {
      id: "stop_present",
      status: normalized.stopPrice > 0 ? "passed" : "failed",
      message:
        normalized.stopPrice > 0
          ? "Stop is present."
          : "Stop is missing or not positive.",
    },
    {
      id: "target_present",
      status: normalized.targetPrice > 0 ? "passed" : "failed",
      message:
        normalized.targetPrice > 0
          ? "Target is present."
          : "Target is missing or not positive.",
    },
    {
      id: "risk_present",
      status:
        normalized.riskPerShare > 0 && normalized.totalPlannedRisk > 0
          ? "passed"
          : "failed",
      message:
        normalized.riskPerShare > 0 && normalized.totalPlannedRisk > 0
          ? "Risk fields are present."
          : "Risk fields are missing or not positive.",
    },
    {
      id: "manual_final_confirmation_required",
      status: "passed",
      message: "Final broker confirmation remains human-only.",
    },
    {
      id: "automatic_submit_blocked",
      status: "passed",
      message: "Automatic submit is not allowed for semi-auto payloads.",
    },
    ...(input.safety_checks ?? []),
  ];
}

function deriveRiskPerShare(input: BuildSemiAutoAgentPayloadInput): number {
  const explicit = positiveFiniteNumber(input.risk_per_share);
  const referencePrice =
    positiveFiniteNumber(input.limit_price) ??
    positiveFiniteNumber(input.entry_price);
  const stop = positiveFiniteNumber(input.stop_price);

  if (explicit !== null) {
    return explicit;
  }

  if (referencePrice !== null && stop !== null) {
    return Number(Math.abs(referencePrice - stop).toFixed(4));
  }

  return 0;
}

function deriveTotalRisk(
  input: BuildSemiAutoAgentPayloadInput,
  riskPerShare: number,
  quantity: number,
): number {
  const explicit = positiveFiniteNumber(input.total_planned_risk);

  if (explicit !== null) {
    return explicit;
  }

  return riskPerShare > 0 && quantity > 0
    ? Number((riskPerShare * quantity).toFixed(4))
    : 0;
}

export function buildSemiAutoAvanzaAgentPayload(
  input: BuildSemiAutoAgentPayloadInput,
  options: { now?: string | Date } = {},
): BuildSemiAutoAgentPayloadResult {
  const now =
    options.now instanceof Date
      ? options.now.toISOString()
      : validTimestamp(options.now) ?? new Date(0).toISOString();
  const createdAt = timestampFrom(input.created_at ?? null, now);
  const staleAfter =
    validTimestamp(input.stale_after) ??
    addSeconds(
      createdAt,
      positiveFiniteNumber(input.stale_after_seconds) ??
        defaultStaleAfterSeconds,
    );
  const expiresAt = timestampFrom(input.expires_at ?? null, staleAfter);
  const side =
    input.side === undefined
      ? defaultSideForSource(input.source)
      : input.side === "buy" || input.side === "sell"
        ? input.side
        : null;
  const action =
    input.action === undefined
      ? side
      : input.action === "buy" || input.action === "sell"
        ? input.action
        : null;
  const quantity = positiveInteger(input.quantity) ?? 0;
  const ticker = optionalText(input.ticker) ?? "";
  const orderType = input.order_type ?? "limit";
  const entryPrice = positiveFiniteNumber(input.entry_price);
  const limitPrice = positiveFiniteNumber(input.limit_price) ?? entryPrice;
  const stopPrice = positiveFiniteNumber(input.stop_price) ?? 0;
  const targetPrice = positiveFiniteNumber(input.target_price) ?? 0;
  const riskPerShare = deriveRiskPerShare(input);
  const totalPlannedRisk = deriveTotalRisk(input, riskPerShare, quantity);
  const sourceContext =
    input.source === "live_position" ? "live_position" : "recommendation";
  const intent = input.intent ?? defaultIntentFor(input.source);
  const safetyChecks = buildSafetyChecks(input, {
    ticker,
    side,
    action,
    quantity,
    stopPrice,
    targetPrice,
    riskPerShare,
    totalPlannedRisk,
  });
  const identity = buildSemiAutoAgentPayloadIdentity({
    version: "semi_auto_avanza_agent_payload_v1",
    mode: "semi_auto",
    recommendation_id: optionalText(input.recommendation_id),
    recommendation_fingerprint: optionalText(input.recommendation_fingerprint),
    position_id: optionalText(input.position_id),
    ticker,
    side: side ?? defaultSideForSource(input.source),
    quantity,
    order_type: orderType,
    entry_price: entryPrice,
    limit_price: limitPrice,
    stop_price: stopPrice,
    target_price: targetPrice,
    source_context: sourceContext,
    intent,
    expires_at: expiresAt,
  });
  const payload: SemiAutoAvanzaAgentPayload = {
    version: "semi_auto_avanza_agent_payload_v1",
    mode: "semi_auto",
    payload_id: identity.payload_id,
    created_at: createdAt,
    recommendation_id: optionalText(input.recommendation_id),
    recommendation_fingerprint: optionalText(input.recommendation_fingerprint),
    position_id: optionalText(input.position_id),
    payload_fingerprint: identity.payload_fingerprint,
    ticker,
    side: side ?? defaultSideForSource(input.source),
    action: action ?? defaultSideForSource(input.source),
    quantity,
    order_type: orderType,
    entry_price: entryPrice,
    limit_price: limitPrice,
    stop_price: stopPrice,
    target_price: targetPrice,
    risk_per_share: riskPerShare,
    total_planned_risk: totalPlannedRisk,
    expires_at: expiresAt,
    stale_after: staleAfter,
    broker_target_label:
      optionalText(input.broker_target_label) ?? defaultBrokerTargetLabel,
    source_context: sourceContext,
    intent,
    authority: SEMI_AUTO_AGENT_PAYLOAD_AUTHORITY,
    safety_check_summary: {
      all_passed: safetyChecks.every((check) => check.status !== "failed"),
      checks: safetyChecks,
    },
    warnings: [...(input.warnings ?? [])],
    errors: [],
  };
  const validation = validateSemiAutoAgentPayload(payload, { now });
  const builderErrors = [
    ...(input.side === null || input.action === null ? ["side_action_missing"] : []),
  ];
  const errors = [...builderErrors, ...validation.errors];
  const warnings = [...payload.warnings, ...validation.warnings];

  return {
    status: errors.length === 0 ? "ready" : "blocked",
    payload: {
      ...payload,
      errors,
      warnings,
    },
    validation,
    errors,
    warnings,
  };
}

export function buildSemiAutoRecommendationBuyPayload(
  input: Omit<BuildSemiAutoAgentPayloadInput, "source">,
  options: { now?: string | Date } = {},
): BuildSemiAutoAgentPayloadResult {
  return buildSemiAutoAvanzaAgentPayload(
    {
      ...input,
      source: "recommendation",
    },
    options,
  );
}

export function buildSemiAutoLivePositionSellPayload(
  input: Omit<BuildSemiAutoAgentPayloadInput, "source">,
  options: { now?: string | Date } = {},
): BuildSemiAutoAgentPayloadResult {
  return buildSemiAutoAvanzaAgentPayload(
    {
      ...input,
      source: "live_position",
    },
    options,
  );
}
