import type { AvanzaExecutionHandoff } from "@/lib/avanza-execution-handoff";
import type {
  ExecutionIntent,
  ExecutionTriggerType,
} from "@/lib/execution";
import {
  runMockSemiAutoBrowserAgent,
  type MockSemiAutoBrowserAgentResult,
} from "@/lib/mock-semi-auto-browser-agent-adapter";
import {
  buildSemiAutoLivePositionSellPayload,
  buildSemiAutoRecommendationBuyPayload,
  type BuildSemiAutoAgentPayloadResult,
} from "@/lib/semi-auto-agent-payload-builder";
import type { SemiAutoAgentPayloadIntent } from "@/lib/semi-auto-agent-payload-contract";

export type SemiAutoAgentHandoffPreviewStatus =
  | "ready"
  | "blocked"
  | "unavailable";

export type SemiAutoAgentHandoffPreviewResult = {
  status: SemiAutoAgentHandoffPreviewStatus;
  payloadResult: BuildSemiAutoAgentPayloadResult | null;
  adapterResult: MockSemiAutoBrowserAgentResult | null;
  message: string;
  source: "recommendation" | "live_position" | null;
};

export type BuildSemiAutoAgentHandoffPreviewInput = {
  handoff: AvanzaExecutionHandoff | null;
  selectedIntent: ExecutionIntent | null;
};

function triggerToSemiAutoIntent(
  triggerType: ExecutionTriggerType,
  action: ExecutionIntent["action"],
): SemiAutoAgentPayloadIntent {
  if (action === "buy") {
    return triggerType === "manual_entry_requested" ? "manual_entry" : "entry";
  }

  if (triggerType === "exit_stop_loss_reached") {
    return "exit_stop_loss";
  }

  if (triggerType === "exit_target_reached") {
    return "exit_target";
  }

  return "manual_exit";
}

function selectedHandoffTimestamp(
  intent: ExecutionIntent,
  handoff: AvanzaExecutionHandoff,
): string {
  return Number.isFinite(Date.parse(handoff.createdAt))
    ? handoff.createdAt
    : intent.created_at;
}

export function buildSemiAutoAgentHandoffPreview(
  input: BuildSemiAutoAgentHandoffPreviewInput,
): SemiAutoAgentHandoffPreviewResult {
  const { handoff, selectedIntent } = input;

  if (!selectedIntent || !handoff) {
    return {
      status: "unavailable",
      payloadResult: null,
      adapterResult: null,
      message: "Semi-auto preview requires a selected execution handoff.",
      source: null,
    };
  }

  if (selectedIntent.mode !== "semi_automatic") {
    return {
      status: "blocked",
      payloadResult: null,
      adapterResult: null,
      message: "Semi-auto preview is blocked outside semi-automatic mode.",
      source: null,
    };
  }

  if (handoff.status !== "ready" || handoff.canPrepareOrder !== true) {
    return {
      status: "blocked",
      payloadResult: null,
      adapterResult: null,
      message: "Semi-auto preview is blocked until the handoff is ready.",
      source: null,
    };
  }

  const tradingPackage = selectedIntent.trading_package;
  const now = selectedHandoffTimestamp(selectedIntent, handoff);
  const source =
    tradingPackage.live_position_id || selectedIntent.action === "sell"
      ? "live_position"
      : "recommendation";
  const payloadInput = {
    recommendation_id: tradingPackage.recommendation_id,
    recommendation_fingerprint: tradingPackage.payload_fingerprint,
    position_id: tradingPackage.live_position_id,
    ticker: tradingPackage.ticker,
    side: selectedIntent.action,
    action: selectedIntent.action,
    quantity: tradingPackage.quantity,
    order_type: tradingPackage.order_type,
    entry_price: tradingPackage.limit_price,
    limit_price: tradingPackage.limit_price,
    stop_price: tradingPackage.stop_loss,
    target_price: tradingPackage.target_price,
    created_at: now,
    expires_at: tradingPackage.expires_at,
    broker_target_label: "Avanza manual browser handoff",
    intent: triggerToSemiAutoIntent(
      selectedIntent.trigger_type,
      selectedIntent.action,
    ),
    warnings: [
      "Preview only: no Avanza order has been placed.",
      "Final broker confirmation remains manual.",
    ],
  };
  const payloadResult =
    source === "live_position"
      ? buildSemiAutoLivePositionSellPayload(payloadInput, { now })
      : buildSemiAutoRecommendationBuyPayload(payloadInput, { now });
  const adapterResult = runMockSemiAutoBrowserAgent(payloadResult.payload, {
    now,
  });
  const ready =
    payloadResult.status === "ready" &&
    adapterResult.status === "waiting_for_manual_confirmation";

  return {
    status: ready ? "ready" : "blocked",
    payloadResult,
    adapterResult,
    message: ready
      ? "Mock semi-auto preview is waiting for manual confirmation."
      : adapterResult.blocking_reason ??
        payloadResult.errors[0] ??
        "Mock semi-auto preview is blocked.",
    source,
  };
}
