import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  buildSemiAutoAvanzaAgentPayload,
  buildSemiAutoLivePositionSellPayload,
  buildSemiAutoRecommendationBuyPayload,
} from "../../lib/semi-auto-agent-payload-builder";

const builderPath = join(process.cwd(), "lib/semi-auto-agent-payload-builder.ts");

const now = "2026-06-29T14:30:00.000Z";

const buyInput = {
  recommendation_id: "rec-builder-001",
  recommendation_fingerprint: "recommendation-builder-fp-001",
  ticker: "AAPL",
  quantity: 8,
  order_type: "limit",
  entry_price: 212.1,
  limit_price: 212.1,
  stop_price: 209.1,
  target_price: 218.1,
  created_at: "2026-06-29T14:25:00.000Z",
  expires_at: "2026-06-29T14:45:00.000Z",
  stale_after: "2026-06-29T14:40:00.000Z",
  broker_target_label: "Avanza manual browser handoff",
} as const;

const sellInput = {
  position_id: "position-builder-001",
  ticker: "MSFT",
  quantity: 5,
  order_type: "limit_reference",
  entry_price: 401,
  limit_price: 399,
  stop_price: 398,
  target_price: 410,
  intent: "exit_stop_loss",
  created_at: "2026-06-29T14:25:00.000Z",
  expires_at: "2026-06-29T14:45:00.000Z",
  stale_after: "2026-06-29T14:40:00.000Z",
  broker_target_label: "Avanza manual browser handoff",
} as const;

test.describe("semi-auto Avanza agent payload builder", () => {
  test("builds a valid recommendation buy payload from recommendation-like input", () => {
    const result = buildSemiAutoRecommendationBuyPayload(buyInput, { now });

    expect(result.status).toBe("ready");
    expect(result.validation.valid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.payload).toMatchObject({
      version: "semi_auto_avanza_agent_payload_v1",
      mode: "semi_auto",
      recommendation_id: "rec-builder-001",
      recommendation_fingerprint: "recommendation-builder-fp-001",
      position_id: null,
      ticker: "AAPL",
      side: "buy",
      action: "buy",
      quantity: 8,
      order_type: "limit",
      entry_price: 212.1,
      limit_price: 212.1,
      stop_price: 209.1,
      target_price: 218.1,
      risk_per_share: 3,
      total_planned_risk: 24,
      source_context: "recommendation",
      intent: "entry",
      broker_target_label: "Avanza manual browser handoff",
      authority: {
        human_final_confirmation_required: true,
        automatic_submit_allowed: false,
        final_confirmation_actor: "human",
        agent_can_prepare_broker_fields: true,
        agent_can_submit_order: false,
      },
    });
    expect(result.payload.payload_id).toContain("semi_auto_aapl_buy_");
    expect(result.payload.payload_fingerprint).toContain("semi_auto_fp_");
  });

  test("builds a valid live-position sell/exit payload with the same human-confirmation model", () => {
    const result = buildSemiAutoLivePositionSellPayload(sellInput, { now });

    expect(result.status).toBe("ready");
    expect(result.validation.valid).toBe(true);
    expect(result.payload).toMatchObject({
      recommendation_id: null,
      recommendation_fingerprint: null,
      position_id: "position-builder-001",
      ticker: "MSFT",
      side: "sell",
      action: "sell",
      source_context: "live_position",
      intent: "exit_stop_loss",
      authority: {
        human_final_confirmation_required: true,
        automatic_submit_allowed: false,
        final_confirmation_actor: "human",
        agent_can_submit_order: false,
      },
    });
    expect(result.payload.payload_id).toContain("semi_auto_msft_sell_");
  });

  test("blocks missing ticker, missing side/action, and invalid quantities without throwing", () => {
    const missingTicker = buildSemiAutoRecommendationBuyPayload(
      {
        ...buyInput,
        ticker: "",
      },
      { now },
    );
    const missingSideAction = buildSemiAutoAvanzaAgentPayload(
      {
        ...buyInput,
        source: "recommendation",
        side: null,
        action: null,
      },
      { now },
    );
    const invalidQuantity = buildSemiAutoRecommendationBuyPayload(
      {
        ...buyInput,
        quantity: -1,
      },
      { now },
    );

    expect(missingTicker.status).toBe("blocked");
    expect(missingTicker.errors).toEqual(
      expect.arrayContaining(["ticker_missing", "safety_check_failed"]),
    );
    expect(missingSideAction.status).toBe("blocked");
    expect(missingSideAction.errors).toEqual(
      expect.arrayContaining(["side_action_missing", "safety_check_failed"]),
    );
    expect(invalidQuantity.status).toBe("blocked");
    expect(invalidQuantity.errors).toEqual(
      expect.arrayContaining([
        "quantity_must_be_positive_integer",
        "safety_check_failed",
      ]),
    );
  });

  test("blocks stale and expired payloads through contract validation", () => {
    const result = buildSemiAutoRecommendationBuyPayload(
      {
        ...buyInput,
        stale_after: "2026-06-29T14:20:00.000Z",
        expires_at: "2026-06-29T14:25:00.000Z",
      },
      { now },
    );

    expect(result.status).toBe("blocked");
    expect(result.errors).toEqual(
      expect.arrayContaining(["payload_stale", "payload_expired"]),
    );
  });

  test("blocks missing stop, target, and risk fields according to contract conventions", () => {
    const result = buildSemiAutoRecommendationBuyPayload(
      {
        ...buyInput,
        entry_price: null,
        limit_price: null,
        stop_price: null,
        target_price: null,
      },
      { now },
    );

    expect(result.status).toBe("blocked");
    expect(result.errors).toEqual(
      expect.arrayContaining([
        "stop_price_required",
        "target_price_required",
        "risk_per_share_required",
        "total_planned_risk_required",
        "safety_check_failed",
      ]),
    );
  });

  test("keeps identity deterministic and changes it for action, ticker, or quantity changes", () => {
    const first = buildSemiAutoRecommendationBuyPayload(buyInput, { now });
    const second = buildSemiAutoRecommendationBuyPayload(
      {
        ...buyInput,
      },
      { now },
    );
    const tickerChanged = buildSemiAutoRecommendationBuyPayload(
      {
        ...buyInput,
        ticker: "NVDA",
      },
      { now },
    );
    const quantityChanged = buildSemiAutoRecommendationBuyPayload(
      {
        ...buyInput,
        quantity: buyInput.quantity + 1,
      },
      { now },
    );
    const actionChanged = buildSemiAutoLivePositionSellPayload(sellInput, {
      now,
    });

    expect(first.payload.payload_id).toBe(second.payload.payload_id);
    expect(first.payload.payload_fingerprint).toBe(
      second.payload.payload_fingerprint,
    );
    expect(tickerChanged.payload.payload_fingerprint).not.toBe(
      first.payload.payload_fingerprint,
    );
    expect(quantityChanged.payload.payload_fingerprint).not.toBe(
      first.payload.payload_fingerprint,
    );
    expect(actionChanged.payload.payload_fingerprint).not.toBe(
      first.payload.payload_fingerprint,
    );
  });

  test("builder source remains pure, non-executing, and no-automation", () => {
    const source = readFileSync(builderPath, "utf8");
    const forbiddenFragments = [
      "server-only",
      "playwright",
      "puppeteer",
      "window.",
      "document.",
      "localStorage",
      "sessionStorage",
      "fetch(",
      "createClient",
      "supabase",
      "SUPABASE_SERVICE_ROLE",
      "process.env",
      ".from(",
      ".insert(",
      ".update(",
      ".delete(",
      ".upsert(",
      ".select(",
      "avanza-agent",
      "localhost-bridge",
      "run-scan",
      "api/automation",
      "click(",
      "goto(",
      "KÖP",
      "SÄLJ",
    ];

    for (const fragment of forbiddenFragments) {
      expect(source).not.toContain(fragment);
    }

    expect(source).toContain("SEMI_AUTO_AGENT_PAYLOAD_AUTHORITY");
    expect(source).toContain("validateSemiAutoAgentPayload");
    expect(source).toContain("defaultBrokerTargetLabel");
  });
});
