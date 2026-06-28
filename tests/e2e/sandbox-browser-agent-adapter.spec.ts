import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  normalizeSandboxBrowserAgentTarget,
  prepareSandboxBrowserAgentFill,
} from "../../lib/sandbox-browser-agent-adapter";
import {
  buildSemiAutoLivePositionSellPayload,
  buildSemiAutoRecommendationBuyPayload,
} from "../../lib/semi-auto-agent-payload-builder";
import type { SemiAutoAvanzaAgentPayload } from "../../lib/semi-auto-agent-payload-contract";

const adapterPath = join(process.cwd(), "lib/sandbox-browser-agent-adapter.ts");
const now = "2026-06-29T14:30:00.000Z";

const buyInput = {
  recommendation_id: "rec-sandbox-agent-001",
  recommendation_fingerprint: "recommendation-sandbox-agent-fp-001",
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
  broker_target_label: "Sandbox manual handoff",
} as const;

const sellInput = {
  position_id: "position-sandbox-agent-001",
  ticker: "MSFT",
  quantity: 5,
  order_type: "limit_reference",
  entry_price: 401,
  limit_price: 399,
  stop_price: 398,
  target_price: 410,
  intent: "manual_exit",
  created_at: "2026-06-29T14:25:00.000Z",
  expires_at: "2026-06-29T14:45:00.000Z",
  stale_after: "2026-06-29T14:40:00.000Z",
  broker_target_label: "Sandbox manual handoff",
} as const;

function buyPayload(): SemiAutoAvanzaAgentPayload {
  return buildSemiAutoRecommendationBuyPayload(buyInput, { now }).payload;
}

function sellPayload(): SemiAutoAvanzaAgentPayload {
  return buildSemiAutoLivePositionSellPayload(sellInput, { now }).payload;
}

test.describe("sandbox browser agent adapter", () => {
  test("accepts valid semi-auto buy payloads for the sandbox target", () => {
    const payload = buyPayload();
    const result = prepareSandboxBrowserAgentFill(payload, { now });

    expect(result).toMatchObject({
      automatic_submit_allowed: false,
      blocking_reason: null,
      errors: [],
      final_submit_attempted: false,
      human_final_confirmation_required: true,
      no_avanza_order: true,
      no_broker_action: true,
      sandbox_only: true,
      status: "ready",
      target: "/sandbox-broker",
    });
    expect(result.prepared_fields).toEqual({
      action: "buy",
      entry_price: 212.1,
      limit_price: 212.1,
      order_type: "limit",
      payload_id: payload.payload_id,
      planned_risk: 24,
      quantity: 8,
      stop: 209.1,
      target: 218.1,
      ticker: "AAPL",
    });
  });

  test("accepts valid semi-auto sell payloads for the sandbox target", () => {
    const payload = sellPayload();
    const result = prepareSandboxBrowserAgentFill(payload, {
      now,
      target: "http://localhost:3000/sandbox-broker",
    });

    expect(result.status).toBe("ready");
    expect(result.prepared_fields).toMatchObject({
      action: "sell",
      order_type: "limit_reference",
      payload_id: payload.payload_id,
      quantity: 5,
      ticker: "MSFT",
    });
    expect(result.final_submit_attempted).toBe(false);
    expect(result.automatic_submit_allowed).toBe(false);
  });

  test("rejects stale, expired, and blocked payloads without prepared fields", () => {
    const payload = buildSemiAutoRecommendationBuyPayload(
      {
        ...buyInput,
        expires_at: "2026-06-29T14:25:00.000Z",
        stale_after: "2026-06-29T14:20:00.000Z",
      },
      { now },
    ).payload;
    const result = prepareSandboxBrowserAgentFill(payload, { now });

    expect(result.status).toBe("blocked");
    expect(result.prepared_fields).toBeNull();
    expect(result.errors).toEqual(
      expect.arrayContaining(["payload_stale", "payload_expired"]),
    );
    expect(result.final_submit_attempted).toBe(false);
  });

  test("rejects automatic-submit and non-semi-auto payloads", () => {
    const automaticSubmitPayload = {
      ...buyPayload(),
      authority: {
        ...buyPayload().authority,
        automatic_submit_allowed: true,
        agent_can_submit_order: true,
      },
    } as never;
    const nonSemiAutoPayload = {
      ...buyPayload(),
      mode: "automatic",
    } as never;

    const automaticSubmit = prepareSandboxBrowserAgentFill(
      automaticSubmitPayload,
      { now },
    );
    const nonSemiAuto = prepareSandboxBrowserAgentFill(nonSemiAutoPayload, {
      now,
    });

    expect(automaticSubmit.status).toBe("blocked");
    expect(automaticSubmit.errors).toEqual(
      expect.arrayContaining([
        "automatic_submit_must_be_false",
        "agent_submit_must_be_false",
      ]),
    );
    expect(automaticSubmit.prepared_fields).toBeNull();
    expect(nonSemiAuto.status).toBe("blocked");
    expect(nonSemiAuto.errors).toContain("mode_must_be_semi_auto");
  });

  test("rejects non-sandbox and external targets", () => {
    expect(normalizeSandboxBrowserAgentTarget("/sandbox-broker")).toEqual({
      error: null,
      target: "/sandbox-broker",
    });
    expect(
      normalizeSandboxBrowserAgentTarget("http://127.0.0.1:3000/sandbox-broker"),
    ).toEqual({
      error: null,
      target: "/sandbox-broker",
    });

    for (const target of [
      "/settings",
      "https://example.com/sandbox-broker",
      "https://avanza.invalid/sandbox-broker",
      "https://broker.invalid/sandbox-broker",
      "http://localhost:3000/settings",
    ]) {
      const result = prepareSandboxBrowserAgentFill(buyPayload(), {
        now,
        target,
      });

      expect(result.status).toBe("blocked");
      expect(result.prepared_fields).toBeNull();
      expect(result.final_submit_attempted).toBe(false);
    }
  });

  test("keeps adapter source sandbox-only and free of external automation or write paths", () => {
    const source = readFileSync(adapterPath, "utf8");

    for (const forbidden of [
      "@playwright/test",
      "puppeteer",
      "chromium",
      "firefox",
      "webkit",
      ".goto(",
      ".click(",
      "fetch(",
      "createClient",
      ".from(",
      ".insert(",
      "execution-record-audit-writer",
      "audit-writer",
      "SUPABASE_SERVICE_ROLE",
      "service-role",
      "process.env",
      "run-scan",
      "/api/",
      "scanner",
      "market-loop",
      "recordTrade",
      "updateTrade",
      "trade_stats_pnl_mutated: true",
      "automatic_submit_allowed: true",
      "automatic_submit_attempted: true",
      "agent_can_submit_order: true",
    ]) {
      expect(source).not.toContain(forbidden);
    }
  });
});
