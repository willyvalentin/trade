import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  buildSemiAutoAgentPayloadIdentity,
  SEMI_AUTO_AGENT_PAYLOAD_AUTHORITY,
  validateSemiAutoAgentPayload,
  type SemiAutoAvanzaAgentPayload,
} from "../../lib/semi-auto-agent-payload-contract";

const contractPath = join(
  process.cwd(),
  "lib/semi-auto-agent-payload-contract.ts",
);

const baseIdentityInput = {
  version: "semi_auto_avanza_agent_payload_v1",
  mode: "semi_auto",
  recommendation_id: "rec-semi-auto-001",
  recommendation_fingerprint: "recommendation-fp-001",
  position_id: null,
  ticker: "AAPL",
  side: "buy",
  quantity: 12,
  order_type: "limit",
  entry_price: 212.1,
  limit_price: 212.1,
  stop_price: 209.1,
  target_price: 218.1,
  source_context: "recommendation",
  intent: "entry",
  expires_at: "2026-06-29T15:00:00.000Z",
} satisfies Parameters<typeof buildSemiAutoAgentPayloadIdentity>[0];

function createPayload(
  overrides: Partial<SemiAutoAvanzaAgentPayload> = {},
): SemiAutoAvanzaAgentPayload {
  const side = overrides.side ?? "buy";
  const identityInput = {
    ...baseIdentityInput,
    side,
    recommendation_id:
      overrides.recommendation_id ?? baseIdentityInput.recommendation_id,
    recommendation_fingerprint:
      overrides.recommendation_fingerprint ??
      baseIdentityInput.recommendation_fingerprint,
    position_id: overrides.position_id ?? baseIdentityInput.position_id,
    ticker: overrides.ticker ?? baseIdentityInput.ticker,
    quantity: overrides.quantity ?? baseIdentityInput.quantity,
    order_type: overrides.order_type ?? baseIdentityInput.order_type,
    entry_price: overrides.entry_price ?? baseIdentityInput.entry_price,
    limit_price: overrides.limit_price ?? baseIdentityInput.limit_price,
    stop_price: overrides.stop_price ?? baseIdentityInput.stop_price,
    target_price: overrides.target_price ?? baseIdentityInput.target_price,
    source_context:
      overrides.source_context ??
      (side === "sell" ? "live_position" : "recommendation"),
    intent: overrides.intent ?? (side === "sell" ? "exit_target" : "entry"),
    expires_at: overrides.expires_at ?? baseIdentityInput.expires_at,
  } satisfies Parameters<typeof buildSemiAutoAgentPayloadIdentity>[0];
  const identity = buildSemiAutoAgentPayloadIdentity(identityInput);

  return {
    version: "semi_auto_avanza_agent_payload_v1",
    mode: "semi_auto",
    payload_id: identity.payload_id,
    created_at: "2026-06-29T14:30:00.000Z",
    recommendation_id: identityInput.recommendation_id,
    recommendation_fingerprint: identityInput.recommendation_fingerprint,
    position_id: identityInput.position_id,
    payload_fingerprint: identity.payload_fingerprint,
    ticker: identityInput.ticker,
    side,
    action: overrides.action ?? side,
    quantity: identityInput.quantity,
    order_type: identityInput.order_type,
    entry_price: identityInput.entry_price,
    limit_price: identityInput.limit_price,
    stop_price: identityInput.stop_price,
    target_price: identityInput.target_price,
    risk_per_share: overrides.risk_per_share ?? 3,
    total_planned_risk: overrides.total_planned_risk ?? 36,
    expires_at: identityInput.expires_at,
    stale_after: overrides.stale_after ?? "2026-06-29T14:45:00.000Z",
    broker_target_label:
      overrides.broker_target_label ?? "Avanza manual browser handoff",
    source_context: identityInput.source_context,
    intent: identityInput.intent,
    authority: overrides.authority ?? SEMI_AUTO_AGENT_PAYLOAD_AUTHORITY,
    safety_check_summary: overrides.safety_check_summary ?? {
      all_passed: true,
      checks: [
        {
          id: "manual_final_confirmation_required",
          status: "passed",
          message: "Final KOP/SALJ confirmation remains human-only.",
        },
        {
          id: "automatic_submit_blocked",
          status: "passed",
          message: "Automatic submit is not allowed for semi-auto payloads.",
        },
        {
          id: "quantity_positive",
          status: "passed",
          message: "Quantity is positive.",
        },
      ],
    },
    warnings: overrides.warnings ?? [],
    errors: overrides.errors ?? [],
    ...overrides,
  };
}

test.describe("semi-auto Avanza agent payload contract", () => {
  test("accepts a valid buy payload with required fields and human-only authority", () => {
    const payload = createPayload();
    const result = validateSemiAutoAgentPayload(payload, {
      now: "2026-06-29T14:35:00.000Z",
    });

    expect(result).toEqual({ valid: true, status: "ready", errors: [], warnings: [] });
    expect(payload).toMatchObject({
      version: "semi_auto_avanza_agent_payload_v1",
      mode: "semi_auto",
      recommendation_id: "rec-semi-auto-001",
      recommendation_fingerprint: "recommendation-fp-001",
      position_id: null,
      ticker: "AAPL",
      side: "buy",
      action: "buy",
      quantity: 12,
      order_type: "limit",
      entry_price: 212.1,
      limit_price: 212.1,
      stop_price: 209.1,
      target_price: 218.1,
      risk_per_share: 3,
      total_planned_risk: 36,
      broker_target_label: "Avanza manual browser handoff",
      source_context: "recommendation",
      intent: "entry",
      authority: {
        human_final_confirmation_required: true,
        automatic_submit_allowed: false,
        final_confirmation_actor: "human",
        agent_can_prepare_broker_fields: true,
        agent_can_submit_order: false,
      },
    });
    expect(payload.payload_id).toContain("semi_auto_aapl_buy_");
    expect(payload.payload_fingerprint).toContain("semi_auto_fp_");
  });

  test("accepts sell/exit payloads with the same human confirmation and no-submit model", () => {
    const payload = createPayload({
      recommendation_id: null,
      recommendation_fingerprint: null,
      position_id: "position-semi-auto-001",
      side: "sell",
      action: "sell",
      source_context: "live_position",
      intent: "exit_stop_loss",
      ticker: "MSFT",
      quantity: 5,
      entry_price: 401,
      limit_price: 399,
      stop_price: 398,
      target_price: 410,
      expires_at: "2026-06-29T15:10:00.000Z",
    });

    expect(
      validateSemiAutoAgentPayload(payload, {
        now: "2026-06-29T14:35:00.000Z",
      }),
    ).toMatchObject({ valid: true, status: "ready", errors: [] });
    expect(payload.authority.human_final_confirmation_required).toBe(true);
    expect(payload.authority.automatic_submit_allowed).toBe(false);
    expect(payload.authority.agent_can_submit_order).toBe(false);
    expect(payload.intent).toBe("exit_stop_loss");
    expect(payload.source_context).toBe("live_position");
  });

  test("blocks stale or expired payloads before browser-agent preparation", () => {
    const stale = createPayload({
      stale_after: "2026-06-29T14:31:00.000Z",
      expires_at: "2026-06-29T15:00:00.000Z",
    });
    const expired = createPayload({
      stale_after: "2026-06-29T14:31:00.000Z",
      expires_at: "2026-06-29T14:32:00.000Z",
    });

    expect(
      validateSemiAutoAgentPayload(stale, {
        now: "2026-06-29T14:35:00.000Z",
      }).errors,
    ).toContain("payload_stale");
    expect(
      validateSemiAutoAgentPayload(expired, {
        now: "2026-06-29T14:35:00.000Z",
      }).errors,
    ).toEqual(expect.arrayContaining(["payload_stale", "payload_expired"]));
  });

  test("blocks missing or invalid ticker, quantity, side, and action", () => {
    const invalidPayload = createPayload({
      ticker: "",
      quantity: 0,
      side: "buy",
      action: "sell",
    });
    const result = validateSemiAutoAgentPayload(invalidPayload, {
      now: "2026-06-29T14:35:00.000Z",
    });

    expect(result.valid).toBe(false);
    expect(result.status).toBe("blocked");
    expect(result.errors).toEqual(
      expect.arrayContaining([
        "ticker_missing",
        "quantity_must_be_positive_integer",
        "side_action_mismatch",
      ]),
    );
  });

  test("blocks automatic authority and incompatible buy/sell intent switches", () => {
    const automaticAuthority = createPayload({
      authority: {
        human_final_confirmation_required: false,
        automatic_submit_allowed: true,
        final_confirmation_actor: "agent",
        agent_can_prepare_broker_fields: true,
        agent_can_submit_order: true,
      } as never,
    });
    const switchedIntent = createPayload({
      side: "sell",
      action: "sell",
      source_context: "recommendation",
      intent: "entry",
    });

    expect(
      validateSemiAutoAgentPayload(automaticAuthority, {
        now: "2026-06-29T14:35:00.000Z",
      }).errors,
    ).toEqual(
      expect.arrayContaining([
        "human_final_confirmation_required",
        "automatic_submit_must_be_false",
        "final_confirmation_actor_must_be_human",
        "agent_submit_must_be_false",
      ]),
    );
    expect(
      validateSemiAutoAgentPayload(switchedIntent, {
        now: "2026-06-29T14:35:00.000Z",
      }).errors,
    ).toEqual(
      expect.arrayContaining([
        "sell_payload_requires_exit_intent",
        "recommendation_source_requires_buy_side",
      ]),
    );
  });

  test("keeps payload identity deterministic for duplicate and capture guards", () => {
    const first = buildSemiAutoAgentPayloadIdentity(baseIdentityInput);
    const second = buildSemiAutoAgentPayloadIdentity({
      ...baseIdentityInput,
      recommendation_fingerprint: "recommendation-fp-001",
    });
    const changed = buildSemiAutoAgentPayloadIdentity({
      ...baseIdentityInput,
      quantity: baseIdentityInput.quantity + 1,
    });

    expect(first).toEqual(second);
    expect(first.payload_id).toContain(first.payload_fingerprint);
    expect(changed.payload_fingerprint).not.toBe(first.payload_fingerprint);
  });

  test("contract source remains pure and non-executing", () => {
    const source = readFileSync(contractPath, "utf8");
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

    expect(source).toContain("automatic_submit_must_be_false");
    expect(source).toContain("human_final_confirmation_required");
    expect(source).toContain("payload_stale");
    expect(source).toContain("payload_expired");
  });
});
