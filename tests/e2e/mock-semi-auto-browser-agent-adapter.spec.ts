import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { runMockSemiAutoBrowserAgent } from "../../lib/mock-semi-auto-browser-agent-adapter";
import {
  buildSemiAutoLivePositionSellPayload,
  buildSemiAutoRecommendationBuyPayload,
} from "../../lib/semi-auto-agent-payload-builder";
import type { SemiAutoAvanzaAgentPayload } from "../../lib/semi-auto-agent-payload-contract";

const adapterPath = join(
  process.cwd(),
  "lib/mock-semi-auto-browser-agent-adapter.ts",
);
const now = "2026-06-29T14:30:00.000Z";

const buyInput = {
  recommendation_id: "rec-mock-agent-001",
  recommendation_fingerprint: "recommendation-mock-agent-fp-001",
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
  position_id: "position-mock-agent-001",
  ticker: "MSFT",
  quantity: 5,
  order_type: "limit_reference",
  entry_price: 401,
  limit_price: 399,
  stop_price: 398,
  target_price: 410,
  intent: "exit_target",
  created_at: "2026-06-29T14:25:00.000Z",
  expires_at: "2026-06-29T14:45:00.000Z",
  stale_after: "2026-06-29T14:40:00.000Z",
  broker_target_label: "Avanza manual browser handoff",
} as const;

function buyPayload(): SemiAutoAvanzaAgentPayload {
  return buildSemiAutoRecommendationBuyPayload(buyInput, { now }).payload;
}

function sellPayload(): SemiAutoAvanzaAgentPayload {
  return buildSemiAutoLivePositionSellPayload(sellInput, { now }).payload;
}

function clonePayload(payload: SemiAutoAvanzaAgentPayload) {
  return JSON.parse(JSON.stringify(payload)) as SemiAutoAvanzaAgentPayload;
}

test.describe("mock semi-auto browser agent adapter", () => {
  test("returns waiting-for-manual-confirmation for valid buy payloads", () => {
    const payload = buyPayload();
    const result = runMockSemiAutoBrowserAgent(payload, { now });

    expect(result).toMatchObject({
      adapter_name: "mock_semi_auto_browser_agent_adapter",
      adapter_mode: "mock_semi_auto",
      payload_id: payload.payload_id,
      payload_fingerprint: payload.payload_fingerprint,
      action: "buy",
      ticker: "AAPL",
      quantity: 8,
      status: "waiting_for_manual_confirmation",
      lifecycle_status: "waiting_for_manual_confirmation",
      manual_final_confirmation_required: true,
      automatic_submit_attempted: false,
      automatic_submit_allowed: false,
      requested_automatic_submit_allowed: false,
      blocking_reason: null,
      errors: [],
      generated_at: now,
    });
    expect(result.prepared_order_summary).toEqual({
      ticker: "AAPL",
      side: "buy",
      action: "buy",
      quantity: 8,
      order_type: "limit",
      entry_price: 212.1,
      limit_price: 212.1,
      stop_price: 209.1,
      target_price: 218.1,
      broker_target_label: "Avanza manual browser handoff",
    });
  });

  test("returns waiting-for-manual-confirmation for valid sell/exit payloads", () => {
    const payload = sellPayload();
    const result = runMockSemiAutoBrowserAgent(payload, { now });

    expect(result.status).toBe("waiting_for_manual_confirmation");
    expect(result.lifecycle_status).toBe("waiting_for_manual_confirmation");
    expect(result.prepared_order_summary).toMatchObject({
      ticker: "MSFT",
      side: "sell",
      action: "sell",
      quantity: 5,
      order_type: "limit_reference",
      entry_price: 401,
      limit_price: 399,
      stop_price: 398,
      target_price: 410,
    });
    expect(result.manual_final_confirmation_required).toBe(true);
    expect(result.automatic_submit_attempted).toBe(false);
    expect(result.automatic_submit_allowed).toBe(false);
  });

  test("blocks stale, expired, and invalid payloads without preparing", () => {
    const stalePayload = buildSemiAutoRecommendationBuyPayload(
      {
        ...buyInput,
        stale_after: "2026-06-29T14:20:00.000Z",
        expires_at: "2026-06-29T14:25:00.000Z",
      },
      { now },
    ).payload;
    const invalidPayload = buildSemiAutoRecommendationBuyPayload(
      {
        ...buyInput,
        ticker: "",
        quantity: 0,
      },
      { now },
    ).payload;

    const staleResult = runMockSemiAutoBrowserAgent(stalePayload, { now });
    const invalidResult = runMockSemiAutoBrowserAgent(invalidPayload, { now });

    expect(staleResult.status).toBe("blocked");
    expect(staleResult.prepared_order_summary).toBeNull();
    expect(staleResult.errors).toEqual(
      expect.arrayContaining(["payload_stale", "payload_expired"]),
    );
    expect(invalidResult.status).toBe("blocked");
    expect(invalidResult.prepared_order_summary).toBeNull();
    expect(invalidResult.errors).toEqual(
      expect.arrayContaining([
        "ticker_missing",
        "quantity_must_be_positive_integer",
      ]),
    );
  });

  test("blocks automatic-submit, non-semi-auto, and missing-manual-confirmation authority violations", () => {
    const automaticSubmitPayload = {
      ...buyPayload(),
      authority: {
        ...buyPayload().authority,
        automatic_submit_allowed: true,
        agent_can_submit_order: true,
      },
    } as never;
    const automaticModePayload = {
      ...buyPayload(),
      mode: "automatic",
    } as never;
    const missingManualConfirmationPayload = {
      ...buyPayload(),
      authority: {
        ...buyPayload().authority,
        human_final_confirmation_required: false,
        final_confirmation_actor: "agent",
      },
    } as never;

    const automaticSubmit = runMockSemiAutoBrowserAgent(automaticSubmitPayload, {
      now,
    });
    const automaticMode = runMockSemiAutoBrowserAgent(automaticModePayload, {
      now,
    });
    const missingManualConfirmation = runMockSemiAutoBrowserAgent(
      missingManualConfirmationPayload,
      { now },
    );

    expect(automaticSubmit.status).toBe("blocked");
    expect(automaticSubmit.errors).toEqual(
      expect.arrayContaining([
        "automatic_submit_must_be_false",
        "agent_submit_must_be_false",
      ]),
    );
    expect(automaticSubmit.automatic_submit_attempted).toBe(false);
    expect(automaticSubmit.automatic_submit_allowed).toBe(false);
    expect(automaticSubmit.requested_automatic_submit_allowed).toBe(true);
    expect(automaticMode.status).toBe("blocked");
    expect(automaticMode.errors).toContain("mode_must_be_semi_auto");
    expect(missingManualConfirmation.status).toBe("blocked");
    expect(missingManualConfirmation.errors).toEqual(
      expect.arrayContaining([
        "human_final_confirmation_required",
        "final_confirmation_actor_must_be_human",
      ]),
    );
  });

  test("is deterministic with an injected timestamp and does not mutate the payload", () => {
    const payload = buyPayload();
    const original = clonePayload(payload);
    const first = runMockSemiAutoBrowserAgent(payload, { now });
    const second = runMockSemiAutoBrowserAgent(payload, { now });

    expect(first).toEqual(second);
    expect(payload).toEqual(original);
  });

  test("adapter source remains pure, non-executing, and no-automation", () => {
    const source = readFileSync(adapterPath, "utf8");
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

    expect(source).toContain("validateSemiAutoAgentPayload");
    expect(source).toContain("automatic_submit_attempted: false");
    expect(source).toContain("manual_final_confirmation_required: true");
  });
});
