import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { buildAvanzaExecutionHandoff } from "../../lib/avanza-execution-handoff";
import {
  getExecutionAuthorityForMode,
  type ExecutionIntent,
} from "../../lib/execution";
import { createMemoryExecutionStorage } from "../../lib/execution-local-storage-helpers";
import { buildSemiAutoAgentDevFlowReview } from "../../lib/semi-auto-agent-dev-flow-review";
import { buildSemiAutoAgentHandoffPreview } from "../../lib/semi-auto-agent-handoff-preview";
import {
  buildSemiAutoAgentLocalDevFlowEvent,
  appendSemiAutoAgentLocalDevFlowEvent,
  clearSemiAutoAgentLocalDevFlowEvents,
  MAX_SEMI_AUTO_AGENT_LOCAL_DEV_FLOW_EVENTS,
  readSemiAutoAgentLocalDevFlowEvents,
  SEMI_AUTO_AGENT_LOCAL_DEV_FLOW_STORAGE_KEY,
} from "../../lib/semi-auto-agent-local-dev-flow-store";
import { buildSemiAutoAgentResultCaptureStubResult } from "../../lib/semi-auto-agent-result-capture-stub";

const storePath = join(
  process.cwd(),
  "lib/semi-auto-agent-local-dev-flow-store.ts",
);
const panelPath = join(
  process.cwd(),
  "components/execution/SemiAutoAgentDevFlowReviewPanel.tsx",
);
const now = "2026-06-29T14:30:00.000Z";

function read(path: string) {
  return readFileSync(path, "utf8");
}

function createBuyIntent(): ExecutionIntent {
  return {
    intent_version: "1.0",
    intent_id: "semi-auto-local-dev-flow-persistence-intent",
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
      recommendation_id: "semi-auto-local-dev-flow-persistence-rec",
      live_position_id: null,
      ticker: "AAPL",
      market: "US",
      quantity: 8,
      order_type: "limit",
      limit_price: 212.1,
      stop_loss: 209.1,
      target_price: 218.1,
      expires_at: "2026-06-29T14:45:00.000Z",
      payload_id: "semi-auto-local-dev-flow-persistence-payload-id",
      payload_fingerprint: "semi-auto-local-dev-flow-persistence-fingerprint",
    },
    safety_warnings: [],
    broker_result: null,
  };
}

function createEvent(index = 1) {
  const selectedIntent = createBuyIntent();
  const handoff = buildAvanzaExecutionHandoff(selectedIntent, {
    createdAt: now,
  });
  const preview = buildSemiAutoAgentHandoffPreview({ handoff, selectedIntent });
  const captureResult = buildSemiAutoAgentResultCaptureStubResult(
    preview,
    index % 2 === 0 ? "user_cancelled" : "user_confirmed",
    { now },
  );
  const review = buildSemiAutoAgentDevFlowReview(preview, captureResult);

  return buildSemiAutoAgentLocalDevFlowEvent(review, {
    now: `2026-06-29T14:${String(index % 60).padStart(2, "0")}:00.000Z`,
  });
}

test.describe("semi-auto agent local dev flow persistence", () => {
  test("returns empty read results when storage is unavailable, malformed, or non-array", () => {
    expect(readSemiAutoAgentLocalDevFlowEvents(null)).toMatchObject({
      items: [],
      discardedCount: 0,
      storageAvailable: false,
      error: null,
    });

    const storage = createMemoryExecutionStorage();
    storage.setItem(SEMI_AUTO_AGENT_LOCAL_DEV_FLOW_STORAGE_KEY, "{");
    const malformed = readSemiAutoAgentLocalDevFlowEvents(storage);
    expect(malformed.items).toEqual([]);
    expect(malformed.storageAvailable).toBe(true);
    expect(malformed.error).toBeTruthy();

    storage.setItem(SEMI_AUTO_AGENT_LOCAL_DEV_FLOW_STORAGE_KEY, "{}");
    expect(readSemiAutoAgentLocalDevFlowEvents(storage)).toMatchObject({
      items: [],
      discardedCount: 0,
      storageAvailable: true,
      error: null,
    });
  });

  test("appends local-only events latest-first and preserves safety flags", () => {
    const storage = createMemoryExecutionStorage();
    const first = createEvent(1);
    const second = createEvent(2);

    expect(appendSemiAutoAgentLocalDevFlowEvent(first, storage)).toBe(true);
    expect(appendSemiAutoAgentLocalDevFlowEvent(second, storage)).toBe(true);

    const result = readSemiAutoAgentLocalDevFlowEvents(storage);

    expect(result.items.map((event) => event.created_at)).toEqual([
      second.created_at,
      first.created_at,
    ]);
    expect(result.items[0]).toMatchObject({
      local_only: true,
      dev_only: true,
      manual_final_confirmation_required: true,
      automatic_submit_allowed: false,
      automatic_submit_attempted: false,
      no_avanza_order_placed: true,
      no_broker_submit_attempted: true,
      not_sent_to_supabase: true,
      not_audit_record: true,
      trade_stats_pnl_mutated: false,
      ticker: "AAPL",
      action: "buy",
      quantity: 8,
    });
  });

  test("bounds history and clears events", () => {
    const storage = createMemoryExecutionStorage();

    for (let index = 0; index < MAX_SEMI_AUTO_AGENT_LOCAL_DEV_FLOW_EVENTS + 5; index += 1) {
      appendSemiAutoAgentLocalDevFlowEvent(createEvent(index), storage);
    }

    const bounded = readSemiAutoAgentLocalDevFlowEvents(storage);
    expect(bounded.items).toHaveLength(MAX_SEMI_AUTO_AGENT_LOCAL_DEV_FLOW_EVENTS);
    expect(bounded.items[0]?.created_at).toBe("2026-06-29T14:59:00.000Z");

    expect(clearSemiAutoAgentLocalDevFlowEvents(storage)).toBe(true);
    expect(readSemiAutoAgentLocalDevFlowEvents(storage).items).toEqual([]);
  });

  test("fails soft when storage writes throw", () => {
    const throwingStorage = {
      getItem() {
        return "[]";
      },
      setItem() {
        throw new Error("quota");
      },
      removeItem() {
        throw new Error("quota");
      },
    };

    expect(
      appendSemiAutoAgentLocalDevFlowEvent(createEvent(1), throwingStorage),
    ).toBe(false);
    expect(clearSemiAutoAgentLocalDevFlowEvents(throwingStorage)).toBe(false);
  });

  test("wires manual local save copy without Supabase, audit, route, provider, or broker behavior", () => {
    const storeSource = read(storePath);
    const panelSource = read(panelPath);
    const combinedSource = `${storeSource}\n${panelSource}`;

    expect(storeSource).toContain(SEMI_AUTO_AGENT_LOCAL_DEV_FLOW_STORAGE_KEY);
    expect(storeSource).toContain("MAX_SEMI_AUTO_AGENT_LOCAL_DEV_FLOW_EVENTS");
    expect(panelSource).toContain("Save local dev flow event");
    expect(panelSource).toContain("Saved locally only");
    expect(panelSource).toContain("Not sent to Supabase");
    expect(panelSource).toContain("not an audit record");
    expect(panelSource).toContain("no broker action");
    expect(panelSource).toContain("Latest local dev flow event count");

    expect(combinedSource).not.toContain("fetch(");
    expect(combinedSource).not.toContain("createClient(");
    expect(combinedSource).not.toContain("SUPABASE_SERVICE_ROLE");
    expect(combinedSource).not.toContain("service-role");
    expect(combinedSource).not.toContain("process.env");
    expect(combinedSource).not.toContain(".insert(");
    expect(combinedSource).not.toContain(".update(");
    expect(combinedSource).not.toContain(".upsert(");
    expect(combinedSource).not.toContain(".delete(");
    expect(combinedSource).not.toContain("/api/");
    expect(combinedSource).not.toContain("run-scan");
    expect(combinedSource).not.toContain("playwright");
    expect(combinedSource).not.toContain("puppeteer");
    expect(combinedSource).not.toContain("window.open");
  });
});
