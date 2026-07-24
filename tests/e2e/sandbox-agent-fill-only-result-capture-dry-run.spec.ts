import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { buildAvanzaExecutionHandoff } from "../../lib/avanza-execution-handoff";
import {
  getExecutionAuthorityForMode,
  type ExecutionIntent,
} from "../../lib/execution";
import { createMemoryExecutionStorage } from "../../lib/execution-local-storage-helpers";
import { prepareSandboxBrowserAgentFill } from "../../lib/sandbox-browser-agent-adapter";
import { buildSemiAutoAgentDevFlowReview } from "../../lib/semi-auto-agent-dev-flow-review";
import { buildSemiAutoAgentHandoffPreview } from "../../lib/semi-auto-agent-handoff-preview";
import {
  appendSemiAutoAgentLocalDevFlowEvent,
  buildSemiAutoAgentLocalDevFlowEvent,
  clearSemiAutoAgentLocalDevFlowEvents,
  readSemiAutoAgentLocalDevFlowEvents,
} from "../../lib/semi-auto-agent-local-dev-flow-store";
import { buildSemiAutoRecommendationBuyPayload } from "../../lib/semi-auto-agent-payload-builder";
import {
  buildSemiAutoAgentResultCaptureStubResult,
  semiAutoAgentResultCaptureStubOptions,
} from "../../lib/semi-auto-agent-result-capture-stub";

const repoRoot = process.cwd();
const now = "2026-06-29T14:30:00.000Z";
const requestedPayloadId = "sandbox-result-capture-dry-run-payload";

function readRepoFile(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

function buildSandboxPayload() {
  return buildSemiAutoRecommendationBuyPayload(
    {
      broker_target_label: "Sandbox manual handoff",
      created_at: "2026-06-29T14:25:00.000Z",
      entry_price: 212.1,
      expires_at: "2026-06-29T14:45:00.000Z",
      limit_price: 212.1,
      order_type: "limit",
      quantity: 8,
      recommendation_fingerprint: "sandbox-result-capture-dry-run-fp",
      recommendation_id: "sandbox-result-capture-dry-run-rec",
      stale_after: "2026-06-29T14:40:00.000Z",
      stop_price: 209.1,
      target_price: 218.1,
      ticker: "AAPL",
    },
    { now },
  );
}

function createPreviewIntent(): ExecutionIntent {
  return {
    action: "buy",
    authority: getExecutionAuthorityForMode("semi_automatic"),
    broker_hint: "AVANZA",
    broker_result: null,
    created_at: now,
    intent_id: "sandbox-result-capture-dry-run-intent",
    intent_version: "1.0",
    mode: "semi_automatic",
    safety_warnings: [],
    source: "recommendation",
    trading_package: {
      expires_at: "2026-06-29T14:45:00.000Z",
      limit_price: 212.1,
      live_position_id: null,
      market: "US",
      order_type: "limit",
      package_version: "1.0",
      payload_fingerprint: "sandbox-result-capture-dry-run-preview-fp",
      payload_id: requestedPayloadId,
      quantity: 8,
      recommendation_id: "sandbox-result-capture-dry-run-rec",
      stop_loss: 209.1,
      target_price: 218.1,
      ticker: "AAPL",
    },
    trigger_priority: 6,
    trigger_type: "entry_recommendation_ready",
  };
}

function buildReadyPreview() {
  const selectedIntent = createPreviewIntent();
  const handoff = buildAvanzaExecutionHandoff(selectedIntent, {
    createdAt: now,
  });

  return buildSemiAutoAgentHandoffPreview({ handoff, selectedIntent });
}

test.describe("sandbox agent fill-only result capture dry-run", () => {
  test("links sandbox fill-only state to every local result capture option", () => {
    const payloadResult = buildSandboxPayload();
    const fillResult = prepareSandboxBrowserAgentFill(payloadResult.payload, {
      now,
    });

    expect(payloadResult.status).toBe("ready");
    expect(fillResult.status).toBe("ready");
    expect(fillResult.prepared_fields).toMatchObject({
      action: "buy",
      payload_id: payloadResult.payload.payload_id,
      quantity: 8,
      ticker: "AAPL",
    });
    expect(fillResult.final_submit_attempted).toBe(false);
    expect(fillResult.automatic_submit_allowed).toBe(false);
    expect(fillResult.no_avanza_order).toBe(true);
    expect(fillResult.no_broker_action).toBe(true);

    const preview = buildReadyPreview();

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

    for (const option of semiAutoAgentResultCaptureStubOptions) {
      const capture = buildSemiAutoAgentResultCaptureStubResult(
        preview,
        option.status,
        { now },
      );

      expect(capture).toMatchObject({
        action: "buy",
        audit_writer_invoked: false,
        automatic_submit_enabled: false,
        local_only: true,
        mock_only: true,
        no_avanza_confirmation_captured: true,
        no_broker_order_submitted_by_ture: true,
        quantity: 8,
        status: option.status,
        supabase_write_attempted: false,
        ticker: "AAPL",
        trade_stats_pnl_mutated: false,
      });
      expect(capture.message).toContain("local stub only");
      expect(capture.message).toContain("No Avanza confirmation was captured");
      expect(capture.message).toContain("no broker order was submitted by Ture");
    }
  });

  test("saves a local-only dry-run event to memory-backed history", () => {
    const preview = buildReadyPreview();
    const capture = buildSemiAutoAgentResultCaptureStubResult(
      preview,
      "user_confirmed",
      { now },
    );
    const review = buildSemiAutoAgentDevFlowReview(preview, capture);
    const event = buildSemiAutoAgentLocalDevFlowEvent(review, { now });
    const storage = createMemoryExecutionStorage();

    expect(appendSemiAutoAgentLocalDevFlowEvent(event, storage)).toBe(true);

    const saved = readSemiAutoAgentLocalDevFlowEvents(storage).items[0];

    expect(saved).toMatchObject({
      action: "buy",
      automatic_submit_allowed: false,
      automatic_submit_attempted: false,
      dev_only: true,
      local_only: true,
      manual_final_confirmation_required: true,
      no_avanza_order_placed: true,
      no_broker_submit_attempted: true,
      not_audit_record: true,
      not_sent_to_supabase: true,
      payload_id: review.payloadId,
      quantity: 8,
      selected_local_result: "user_confirmed",
      terminal_local_outcome: "completed_local",
      ticker: "AAPL",
      trade_stats_pnl_mutated: false,
    });

    expect(clearSemiAutoAgentLocalDevFlowEvents(storage)).toBe(true);
    expect(readSemiAutoAgentLocalDevFlowEvents(storage).items).toEqual([]);
  });

  test("keeps result-capture dry-run source free of forbidden production behavior", () => {
    const combinedSource = [
      "lib/semi-auto-agent-result-capture-stub.ts",
      "lib/semi-auto-agent-local-dev-flow-store.ts",
      "lib/sandbox-browser-agent-adapter.ts",
      "components/execution/SandboxBrokerOrderForm.tsx",
    ]
      .map(readRepoFile)
      .join("\n");

    const forbidden = [
      ["avanza", ".se"],
      ["https://", "avanza"],
      ["http://", "avanza"],
      [".", "click", "("],
      ["fetch", "("],
      ["create", "Client"],
      [".", "from", "("],
      [".", "insert", "("],
      ["execution-record", "-audit-writer"],
      ["audit", "-writer"],
      ["SUPABASE", "_SERVICE_ROLE"],
      ["service", "-role"],
      ["process", ".env"],
      ["run", "-scan"],
      ["/", "api", "/"],
      ["pro", "vider"],
      ["scan", "ner"],
      ["market", "-loop"],
      ["record", "Trade"],
      ["update", "Trade"],
      ["trade_stats_pnl_mutated", ": true"],
      ["automatic_submit_allowed", ": true"],
      ["automatic_submit_attempted", ": true"],
      ["agent_can_submit_order", ": true"],
    ].map((parts) => parts.join(""));

    for (const item of forbidden) {
      expect(combinedSource).not.toContain(item);
    }
  });
});
