import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { buildAvanzaExecutionHandoff } from "../../lib/avanza-execution-handoff";
import {
  getExecutionAuthorityForMode,
  type ExecutionIntent,
} from "../../lib/execution";
import { buildSemiAutoAgentHandoffPreview } from "../../lib/semi-auto-agent-handoff-preview";

const helperPath = join(process.cwd(), "lib/semi-auto-agent-handoff-preview.ts");
const componentPath = join(
  process.cwd(),
  "components/execution/SemiAutoAgentHandoffPreview.tsx",
);
const compositionPath = join(
  process.cwd(),
  "components/execution/ExecutionHandoffModalComposition.tsx",
);
const modalPath = join(
  process.cwd(),
  "components/execution/execution-handoff-preview-modal.tsx",
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
    intent_id: "semi-auto-preview-buy-intent",
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
      recommendation_id: "semi-auto-preview-recommendation",
      live_position_id: null,
      ticker: "AAPL",
      market: "US",
      quantity: 8,
      order_type: "limit",
      limit_price: 212.1,
      stop_loss: 209.1,
      target_price: 218.1,
      expires_at: "2026-06-29T14:45:00.000Z",
      payload_id: "recommendation-payload-id",
      payload_fingerprint: "recommendation-payload-fingerprint",
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

function createSellIntent(): ExecutionIntent {
  return {
    ...createBuyIntent({
      intent_id: "semi-auto-preview-sell-intent",
      action: "sell",
      trigger_type: "exit_stop_loss_reached",
      trigger_priority: 1,
      source: "live_day_trade_position",
      trading_package: {
        package_version: "1.0",
        recommendation_id: "semi-auto-preview-sell-recommendation",
        live_position_id: "semi-auto-preview-live-position",
        ticker: "MSFT",
        market: "US",
        quantity: 5,
        order_type: "limit_reference",
        limit_price: 399,
        stop_loss: 398,
        target_price: 410,
        expires_at: "2026-06-29T14:45:00.000Z",
        payload_id: "sell-payload-id",
        payload_fingerprint: "sell-payload-fingerprint",
      },
    }),
  };
}

test.describe("semi-auto agent handoff preview wiring", () => {
  test("builds waiting-for-manual-confirmation preview for valid recommendation buy handoffs", () => {
    const selectedIntent = createBuyIntent();
    const handoff = buildAvanzaExecutionHandoff(selectedIntent, {
      createdAt: now,
    });
    const preview = buildSemiAutoAgentHandoffPreview({
      handoff,
      selectedIntent,
    });

    expect(preview.status).toBe("ready");
    expect(preview.source).toBe("recommendation");
    expect(preview.payloadResult?.status).toBe("ready");
    expect(preview.adapterResult).toMatchObject({
      adapter_mode: "mock_semi_auto",
      status: "waiting_for_manual_confirmation",
      action: "buy",
      ticker: "AAPL",
      quantity: 8,
      manual_final_confirmation_required: true,
      automatic_submit_attempted: false,
      automatic_submit_allowed: false,
    });
    expect(preview.adapterResult?.prepared_order_summary).toMatchObject({
      ticker: "AAPL",
      action: "buy",
      order_type: "limit",
      limit_price: 212.1,
      stop_price: 209.1,
      target_price: 218.1,
    });
  });

  test("builds waiting-for-manual-confirmation preview for valid live-position sell handoffs", () => {
    const selectedIntent = createSellIntent();
    const handoff = buildAvanzaExecutionHandoff(selectedIntent, {
      createdAt: now,
    });
    const preview = buildSemiAutoAgentHandoffPreview({
      handoff,
      selectedIntent,
    });

    expect(preview.status).toBe("ready");
    expect(preview.source).toBe("live_position");
    expect(preview.payloadResult?.payload).toMatchObject({
      position_id: "semi-auto-preview-live-position",
      side: "sell",
      action: "sell",
      intent: "exit_stop_loss",
      authority: {
        human_final_confirmation_required: true,
        automatic_submit_allowed: false,
        final_confirmation_actor: "human",
        agent_can_submit_order: false,
      },
    });
    expect(preview.adapterResult?.status).toBe("waiting_for_manual_confirmation");
    expect(preview.adapterResult?.automatic_submit_attempted).toBe(false);
    expect(preview.adapterResult?.automatic_submit_allowed).toBe(false);
  });

  test("surfaces stale or invalid mock payloads as blocked preview states", () => {
    const selectedIntent = createBuyIntent({
      trading_package: {
        expires_at: "2026-06-29T14:20:00.000Z",
      },
    });
    const handoff = buildAvanzaExecutionHandoff(selectedIntent, {
      createdAt: now,
    });
    const preview = buildSemiAutoAgentHandoffPreview({
      handoff,
      selectedIntent,
    });

    expect(preview.status).toBe("blocked");
    expect(preview.payloadResult?.status).toBe("blocked");
    expect(preview.adapterResult?.status).toBe("blocked");
    expect(preview.adapterResult?.prepared_order_summary).toBeNull();
    expect(preview.adapterResult?.errors).toContain("payload_expired");
  });

  test("blocks automatic mode before mock adapter preview is built", () => {
    const selectedIntent = createBuyIntent({
      mode: "automatic",
      authority: getExecutionAuthorityForMode("automatic"),
    });
    const handoff = buildAvanzaExecutionHandoff(selectedIntent, {
      createdAt: now,
    });
    const preview = buildSemiAutoAgentHandoffPreview({
      handoff,
      selectedIntent,
    });

    expect(preview.status).toBe("blocked");
    expect(preview.payloadResult).toBeNull();
    expect(preview.adapterResult).toBeNull();
    expect(preview.message).toContain("blocked outside semi-automatic mode");
  });

  test("wires the preview into the existing handoff modal without execution side effects", () => {
    const helperSource = read(helperPath);
    const componentSource = read(componentPath);
    const compositionSource = read(compositionPath);
    const modalSource = read(modalPath);
    const combinedSource = [
      helperSource,
      componentSource,
      compositionSource,
      modalSource,
    ].join("\n");

    expect(componentSource).toContain("Mock semi-auto agent preview");
    expect(componentSource).toContain("This is a non-executing semi-auto preview.");
    expect(componentSource).toContain("No Avanza order has been");
    expect(componentSource).toContain("no automatic submit is enabled");
    expect(componentSource.replace(/\s+/g, " ")).toContain(
      "final broker confirmation remains manual",
    );
    expect(compositionSource).toContain("<SemiAutoAgentHandoffPreview");
    expect(modalSource).toContain("buildSemiAutoAgentHandoffPreview");

    expect(combinedSource).not.toContain("fetch(");
    expect(combinedSource).not.toContain("createClient(");
    expect(combinedSource).not.toContain("SUPABASE_SERVICE_ROLE");
    expect(combinedSource).not.toContain("service-role");
    expect(combinedSource).not.toContain("playwright");
    expect(combinedSource).not.toContain("puppeteer");
    expect(combinedSource).not.toContain("window.open");
    expect(combinedSource).not.toContain(".insert(");
    expect(combinedSource).not.toContain(".update(");
    expect(combinedSource).not.toContain(".upsert(");
    expect(combinedSource).not.toContain(".delete(");
  });
});
