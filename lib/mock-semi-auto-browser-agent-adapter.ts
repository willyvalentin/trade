import {
  validateSemiAutoAgentPayload,
  type SemiAutoAvanzaAgentPayload,
  type SemiAutoAgentPayloadValidationResult,
} from "@/lib/semi-auto-agent-payload-contract";

export type MockSemiAutoBrowserAgentAdapterStatus =
  | "waiting_for_manual_confirmation"
  | "blocked";

export type MockSemiAutoBrowserAgentLifecycleStatus =
  | "prepared"
  | "waiting_for_manual_confirmation"
  | "blocked";

export type MockSemiAutoPreparedOrderSummary = {
  ticker: string;
  side: SemiAutoAvanzaAgentPayload["side"];
  action: SemiAutoAvanzaAgentPayload["action"];
  quantity: number;
  order_type: SemiAutoAvanzaAgentPayload["order_type"];
  entry_price: number | null;
  limit_price: number | null;
  stop_price: number;
  target_price: number;
  broker_target_label: string;
};

export type MockSemiAutoBrowserAgentResult = {
  adapter_name: "mock_semi_auto_browser_agent_adapter";
  adapter_mode: "mock_semi_auto";
  payload_id: string | null;
  payload_fingerprint: string | null;
  action: SemiAutoAvanzaAgentPayload["action"] | null;
  ticker: string | null;
  quantity: number | null;
  status: MockSemiAutoBrowserAgentAdapterStatus;
  lifecycle_status: MockSemiAutoBrowserAgentLifecycleStatus;
  prepared_order_summary: MockSemiAutoPreparedOrderSummary | null;
  manual_final_confirmation_required: true;
  automatic_submit_attempted: false;
  automatic_submit_allowed: false;
  requested_automatic_submit_allowed: boolean | null;
  blocking_reason: string | null;
  warnings: string[];
  errors: string[];
  validation: SemiAutoAgentPayloadValidationResult;
  generated_at: string;
};

export type RunMockSemiAutoBrowserAgentOptions = {
  now?: string | Date;
};

function normalizeNow(value: string | Date | undefined): string {
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "string" && Number.isFinite(Date.parse(value))) {
    return value;
  }

  return new Date(0).toISOString();
}

function buildPreparedOrderSummary(
  payload: SemiAutoAvanzaAgentPayload,
): MockSemiAutoPreparedOrderSummary {
  return {
    ticker: payload.ticker,
    side: payload.side,
    action: payload.action,
    quantity: payload.quantity,
    order_type: payload.order_type,
    entry_price: payload.entry_price,
    limit_price: payload.limit_price,
    stop_price: payload.stop_price,
    target_price: payload.target_price,
    broker_target_label: payload.broker_target_label,
  };
}

function firstBlockingReason(errors: readonly string[]): string | null {
  return errors[0] ?? null;
}

export function runMockSemiAutoBrowserAgent(
  payload: Partial<SemiAutoAvanzaAgentPayload> | null | undefined,
  options: RunMockSemiAutoBrowserAgentOptions = {},
): MockSemiAutoBrowserAgentResult {
  const generatedAt = normalizeNow(options.now);
  const validation = validateSemiAutoAgentPayload(payload, { now: generatedAt });
  const ready = validation.valid && payload !== null && payload !== undefined;
  const errors = [...validation.errors];
  const warnings = [...validation.warnings];
  const payloadValue = payload ?? {};
  const requestedAutomaticSubmitAllowed =
    typeof payloadValue.authority?.automatic_submit_allowed === "boolean"
      ? payloadValue.authority.automatic_submit_allowed
      : null;

  return {
    adapter_name: "mock_semi_auto_browser_agent_adapter",
    adapter_mode: "mock_semi_auto",
    payload_id: payloadValue.payload_id ?? null,
    payload_fingerprint: payloadValue.payload_fingerprint ?? null,
    action:
      payloadValue.action === "buy" || payloadValue.action === "sell"
        ? payloadValue.action
        : null,
    ticker: typeof payloadValue.ticker === "string" ? payloadValue.ticker : null,
    quantity:
      typeof payloadValue.quantity === "number" &&
      Number.isFinite(payloadValue.quantity)
        ? payloadValue.quantity
        : null,
    status: ready ? "waiting_for_manual_confirmation" : "blocked",
    lifecycle_status: ready ? "waiting_for_manual_confirmation" : "blocked",
    prepared_order_summary: ready
      ? buildPreparedOrderSummary(payloadValue as SemiAutoAvanzaAgentPayload)
      : null,
    manual_final_confirmation_required: true,
    automatic_submit_attempted: false,
    automatic_submit_allowed: false,
    requested_automatic_submit_allowed: requestedAutomaticSubmitAllowed,
    blocking_reason: ready ? null : firstBlockingReason(errors),
    warnings,
    errors,
    validation,
    generated_at: generatedAt,
  };
}
