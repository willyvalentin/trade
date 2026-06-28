import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { buildAvanzaExecutionHandoff } from "../../lib/avanza-execution-handoff";
import {
  getExecutionAuthorityForMode,
  type ExecutionIntent,
} from "../../lib/execution";
import { buildSemiAutoAgentHandoffPreview } from "../../lib/semi-auto-agent-handoff-preview";
import {
  initialSemiAutoAgentDevFlowState,
  transitionSemiAutoAgentDevFlow,
} from "../../lib/semi-auto-agent-dev-flow-state-machine";
import {
  buildSemiAutoAgentResultCaptureStubResult,
  type SemiAutoAgentResultCaptureStubStatus,
} from "../../lib/semi-auto-agent-result-capture-stub";

const helperPath = join(
  process.cwd(),
  "lib/semi-auto-agent-dev-flow-state-machine.ts",
);
const now = "2026-06-29T14:30:00.000Z";

function read(path: string) {
  return readFileSync(path, "utf8");
}

type ExecutionIntentOverrides = Partial<Omit<ExecutionIntent, "trading_package">> & {
  trading_package?: Partial<ExecutionIntent["trading_package"]>;
};

function createBuyIntent(overrides: ExecutionIntentOverrides = {}): ExecutionIntent {
  const intent: ExecutionIntent = {
    intent_version: "1.0",
    intent_id: "semi-auto-dev-flow-buy-intent",
    created_at: now,
    mode: "semi_automatic",
    authority: getExecutionAuthorityForMode("semi_automatic"),
    action: "buy",
    trigger_type: "entry_recommendation_ready",
    trigger_priority: 6,
    broker_hint: "AVANZA",
    source: "recommendation",
    trading_package: {
      package_version: "1.0",
      recommendation_id: "semi-auto-dev-flow-recommendation",
      live_position_id: null,
      ticker: "AAPL",
      market: "US",
      quantity: 8,
      order_type: "limit",
      limit_price: 212.1,
      stop_loss: 209.1,
      target_price: 218.1,
      expires_at: "2026-06-29T14:45:00.000Z",
      payload_id: "semi-auto-dev-flow-payload-id",
      payload_fingerprint: "semi-auto-dev-flow-payload-fingerprint",
    },
    safety_warnings: [],
    broker_result: null,
  };

  return {
    ...intent,
    ...overrides,
    trading_package: {
      ...intent.trading_package,
      ...overrides.trading_package,
    },
  };
}

function readyPreview() {
  const selectedIntent = createBuyIntent();
  const handoff = buildAvanzaExecutionHandoff(selectedIntent, {
    createdAt: now,
  });

  return buildSemiAutoAgentHandoffPreview({ handoff, selectedIntent });
}

function blockedPreview() {
  const selectedIntent = createBuyIntent({
    trading_package: {
      expires_at: "2026-06-29T14:20:00.000Z",
    },
  });
  const handoff = buildAvanzaExecutionHandoff(selectedIntent, {
    createdAt: now,
  });

  return buildSemiAutoAgentHandoffPreview({ handoff, selectedIntent });
}

function automaticModePreview() {
  const selectedIntent = createBuyIntent({
    mode: "automatic",
    authority: getExecutionAuthorityForMode("automatic"),
  });
  const handoff = buildAvanzaExecutionHandoff(selectedIntent, {
    createdAt: now,
  });

  return buildSemiAutoAgentHandoffPreview({ handoff, selectedIntent });
}

function reachWaitingState() {
  const preview = readyPreview();
  const payload = transitionSemiAutoAgentDevFlow(
    initialSemiAutoAgentDevFlowState,
    {
      type: "BUILD_PAYLOAD_SUCCEEDED",
      payloadResult: preview.payloadResult,
    },
  );
  const prepared = transitionSemiAutoAgentDevFlow(payload.state, {
    type: "MOCK_PREPARE_SUCCEEDED",
    adapterResult: preview.adapterResult,
  });

  return {
    preview,
    waiting: transitionSemiAutoAgentDevFlow(prepared.state, {
      type: "MANUAL_CONFIRMATION_WAITING",
    }),
  };
}

test.describe("semi-auto agent dev flow state machine", () => {
  test("moves valid payload and mock prepare through preview to waiting for manual confirmation", () => {
    const preview = readyPreview();
    const payload = transitionSemiAutoAgentDevFlow(
      initialSemiAutoAgentDevFlowState,
      {
        type: "BUILD_PAYLOAD_SUCCEEDED",
        payloadResult: preview.payloadResult,
      },
    );
    const prepared = transitionSemiAutoAgentDevFlow(payload.state, {
      type: "MOCK_PREPARE_SUCCEEDED",
      adapterResult: preview.adapterResult,
    });
    const waiting = transitionSemiAutoAgentDevFlow(prepared.state, {
      type: "MANUAL_CONFIRMATION_WAITING",
    });

    expect(payload.accepted).toBe(true);
    expect(payload.state.status).toBe("payload_ready");
    expect(prepared.accepted).toBe(true);
    expect(prepared.state.status).toBe("preview_ready");
    expect(waiting.accepted).toBe(true);
    expect(waiting.state.status).toBe("waiting_for_manual_confirmation");
    expect(waiting.state.terminal).toBe(false);
    expect(waiting.state.blockedReasons).toEqual([]);
  });

  test("records blocked payloads and prevents blocked payloads from reaching preview", () => {
    const preview = blockedPreview();
    const payload = transitionSemiAutoAgentDevFlow(
      initialSemiAutoAgentDevFlowState,
      {
        type: "BUILD_PAYLOAD_BLOCKED",
        payloadResult: preview.payloadResult,
      },
    );
    const prepared = transitionSemiAutoAgentDevFlow(payload.state, {
      type: "MOCK_PREPARE_SUCCEEDED",
      adapterResult: preview.adapterResult,
    });

    expect(payload.accepted).toBe(true);
    expect(payload.state.status).toBe("payload_blocked");
    expect(payload.state.blockedReasons).toEqual(
      expect.arrayContaining(["payload_expired"]),
    );
    expect(prepared.accepted).toBe(false);
    expect(prepared.state.status).toBe("payload_blocked");
    expect(prepared.warning).toBe(
      "mock_prepare_not_ready_for_manual_confirmation",
    );
  });

  test("blocks automatic-mode and automatic-submit authority violations", () => {
    const automaticMode = automaticModePreview();
    const modeTransition = transitionSemiAutoAgentDevFlow(
      initialSemiAutoAgentDevFlowState,
      {
        type: "BUILD_PAYLOAD_SUCCEEDED",
        payloadResult: automaticMode.payloadResult,
      },
    );
    const validPreview = readyPreview();
    const automaticSubmitPayloadResult = {
      ...validPreview.payloadResult!,
      payload: {
        ...validPreview.payloadResult!.payload,
        authority: {
          ...validPreview.payloadResult!.payload.authority,
          automatic_submit_allowed: true,
          agent_can_submit_order: true,
        },
      },
    };
    const submitTransition = transitionSemiAutoAgentDevFlow(
      initialSemiAutoAgentDevFlowState,
      {
        type: "BUILD_PAYLOAD_SUCCEEDED",
        payloadResult: automaticSubmitPayloadResult as never,
      },
    );

    expect(modeTransition.accepted).toBe(false);
    expect(modeTransition.state.status).toBe("payload_blocked");
    expect(modeTransition.state.blockedReasons).toContain("payload_missing");
    expect(submitTransition.accepted).toBe(false);
    expect(submitTransition.state.status).toBe("payload_blocked");
    expect(submitTransition.warning).toBe(
      "payload_not_ready_for_semi_auto_dev_flow",
    );
  });

  test("maps local result capture statuses to terminal local outcomes", () => {
    const { preview, waiting } = reachWaitingState();
    const cases: Array<[SemiAutoAgentResultCaptureStubStatus, string]> = [
      ["user_confirmed", "completed_local"],
      ["user_cancelled", "cancelled_local"],
      ["broker_rejected", "broker_rejected_local"],
      ["failed", "failed_local"],
      ["timeout", "timeout_local"],
      ["unknown_needs_review", "unknown_needs_review"],
      ["capture_not_available", "unknown_needs_review"],
    ];

    for (const [status, expectedState] of cases) {
      const captureResult = buildSemiAutoAgentResultCaptureStubResult(
        preview,
        status,
        { now },
      );
      const transition = transitionSemiAutoAgentDevFlow(waiting.state, {
        type: "LOCAL_RESULT_SELECTED",
        captureResult,
      });

      expect(transition.accepted).toBe(true);
      expect(transition.state.status).toBe(expectedState);
      expect(transition.state.terminal).toBe(true);
      expect(transition.state.captureResult).toMatchObject({
        status,
        local_only: true,
        mock_only: true,
        automatic_submit_enabled: false,
        supabase_write_attempted: false,
        audit_writer_invoked: false,
        trade_stats_pnl_mutated: false,
      });
    }
  });

  test("rejects result capture before waiting-for-manual-confirmation and reset returns idle", () => {
    const preview = readyPreview();
    const captureResult = buildSemiAutoAgentResultCaptureStubResult(
      preview,
      "user_confirmed",
      { now },
    );
    const rejected = transitionSemiAutoAgentDevFlow(
      initialSemiAutoAgentDevFlowState,
      {
        type: "LOCAL_RESULT_SELECTED",
        captureResult,
      },
    );
    const reset = transitionSemiAutoAgentDevFlow(rejected.state, {
      type: "RESET",
    });

    expect(rejected.accepted).toBe(false);
    expect(rejected.state.status).toBe("idle");
    expect(rejected.warning).toBe(
      "local_result_capture_requires_waiting_for_manual_confirmation",
    );
    expect(reset.accepted).toBe(true);
    expect(reset.state).toEqual(initialSemiAutoAgentDevFlowState);
  });

  test("does not mutate previous state, payload result, adapter result, or capture result objects", () => {
    const preview = readyPreview();
    const stateBefore = JSON.stringify(initialSemiAutoAgentDevFlowState);
    const payloadBefore = JSON.stringify(preview.payloadResult);
    const adapterBefore = JSON.stringify(preview.adapterResult);
    const captureResult = buildSemiAutoAgentResultCaptureStubResult(
      preview,
      "user_confirmed",
      { now },
    );
    const captureBefore = JSON.stringify(captureResult);
    const { waiting } = reachWaitingState();

    transitionSemiAutoAgentDevFlow(initialSemiAutoAgentDevFlowState, {
      type: "BUILD_PAYLOAD_SUCCEEDED",
      payloadResult: preview.payloadResult,
    });
    transitionSemiAutoAgentDevFlow(waiting.state, {
      type: "LOCAL_RESULT_SELECTED",
      captureResult,
    });

    expect(JSON.stringify(initialSemiAutoAgentDevFlowState)).toBe(stateBefore);
    expect(JSON.stringify(preview.payloadResult)).toBe(payloadBefore);
    expect(JSON.stringify(preview.adapterResult)).toBe(adapterBefore);
    expect(JSON.stringify(captureResult)).toBe(captureBefore);
  });

  test("keeps helper pure and free from execution, persistence, route, provider, and automation calls", () => {
    const source = read(helperPath);

    expect(source).not.toContain('"use client"');
    expect(source).not.toContain("from \"react\"");
    expect(source).not.toContain("fetch(");
    expect(source).not.toContain("createClient(");
    expect(source).not.toContain("process.env");
    expect(source).not.toContain("SUPABASE_SERVICE_ROLE");
    expect(source).not.toContain(".insert(");
    expect(source).not.toContain(".update(");
    expect(source).not.toContain(".upsert(");
    expect(source).not.toContain(".delete(");
    expect(source).not.toContain("playwright");
    expect(source).not.toContain("puppeteer");
    expect(source).not.toContain("window.");
    expect(source).not.toContain("/api/");
    expect(source).not.toContain("run-scan");
  });
});
