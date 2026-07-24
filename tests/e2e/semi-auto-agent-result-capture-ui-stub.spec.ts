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
  buildSemiAutoAgentResultCaptureStubResult,
  canShowSemiAutoAgentResultCaptureStub,
  semiAutoAgentResultCaptureStubOptions,
} from "../../lib/semi-auto-agent-result-capture-stub";

const helperPath = join(
  process.cwd(),
  "lib/semi-auto-agent-result-capture-stub.ts",
);
const componentPath = join(
  process.cwd(),
  "components/execution/SemiAutoAgentResultCaptureStub.tsx",
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

function createBuyIntent(overrides: Partial<ExecutionIntent> = {}): ExecutionIntent {
  const intent: ExecutionIntent = {
    intent_version: "1.0",
    intent_id: "semi-auto-capture-buy-intent",
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
      recommendation_id: "semi-auto-capture-recommendation",
      live_position_id: null,
      ticker: "AAPL",
      market: "US",
      quantity: 8,
      order_type: "limit",
      limit_price: 212.1,
      stop_loss: 209.1,
      target_price: 218.1,
      expires_at: "2026-06-29T14:45:00.000Z",
      payload_id: "semi-auto-capture-payload-id",
      payload_fingerprint: "semi-auto-capture-payload-fingerprint",
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
    } as Partial<ExecutionIntent["trading_package"]> as never,
  });
  const handoff = buildAvanzaExecutionHandoff(selectedIntent, {
    createdAt: now,
  });

  return buildSemiAutoAgentHandoffPreview({ handoff, selectedIntent });
}

test.describe("semi-auto agent result capture UI stub", () => {
  test("enables local result capture stub only after a valid mock prepare preview", () => {
    const ready = readyPreview();
    const blocked = blockedPreview();

    expect(ready.status).toBe("ready");
    expect(canShowSemiAutoAgentResultCaptureStub(ready)).toBe(true);
    expect(blocked.status).toBe("blocked");
    expect(canShowSemiAutoAgentResultCaptureStub(blocked)).toBe(false);
  });

  test("builds local-only result state for every supported capture option", () => {
    const preview = readyPreview();

    for (const option of semiAutoAgentResultCaptureStubOptions) {
      const result = buildSemiAutoAgentResultCaptureStubResult(
        preview,
        option.status,
        { now },
      );

      expect(result).toMatchObject({
        status: option.status,
        label: option.label,
        ticker: "AAPL",
        action: "buy",
        quantity: 8,
        captured_at: now,
        local_only: true,
        mock_only: true,
        no_avanza_confirmation_captured: true,
        no_broker_order_submitted_by_ture: true,
        automatic_submit_enabled: false,
        supabase_write_attempted: false,
        audit_writer_invoked: false,
        trade_stats_pnl_mutated: false,
      });
      expect(result.message).toContain("local stub only");
      expect(result.message).toContain("No Avanza confirmation was captured");
      expect(result.message).toContain("no broker order was submitted by Ture");
    }
  });

  test("includes required user-confirmed, cancelled, rejected, unknown, failed, timeout, and unavailable statuses", () => {
    expect(semiAutoAgentResultCaptureStubOptions.map((option) => option.status))
      .toEqual([
        "user_confirmed",
        "user_cancelled",
        "broker_rejected",
        "unknown_needs_review",
        "failed",
        "timeout",
        "capture_not_available",
      ]);
  });

  test("wires the capture stub into the existing handoff modal as local UI only", () => {
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

    expect(componentSource).toContain('"use client"');
    expect(componentSource).toContain("useState");
    expect(componentSource).toContain("Local stub only");
    expect(componentSource).toContain("Semi-auto result capture stub");
    expect(componentSource).toContain("No Avanza");
    expect(componentSource).toContain("no broker order was submitted by Ture");
    expect(componentSource).toContain("no automatic submit is enabled");
    expect(componentSource).toContain("disabled={!canCapture}");
    expect(compositionSource).toContain("<SemiAutoAgentResultCaptureStub");
    expect(modalSource).toContain("semiAutoAgentResultCaptureStubProps");

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
