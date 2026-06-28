import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { createMemoryExecutionStorage } from "../../lib/execution-local-storage-helpers";
import {
  appendSemiAutoAgentLocalDevFlowEvent,
  clearSemiAutoAgentLocalDevFlowEvents,
  readSemiAutoAgentLocalDevFlowEvents,
  SEMI_AUTO_AGENT_LOCAL_DEV_FLOW_STORAGE_KEY,
  type SemiAutoAgentLocalDevFlowEvent,
} from "../../lib/semi-auto-agent-local-dev-flow-store";

const root = process.cwd();
const viewerPath = join(
  root,
  "components/execution/SemiAutoAgentLocalDevFlowHistoryViewer.tsx",
);
const hookPath = join(
  root,
  "hooks/execution/useExecutionLocalPersistenceViewers.ts",
);
const settingsPath = join(root, "app/settings/page.tsx");
const storePath = join(root, "lib/semi-auto-agent-local-dev-flow-store.ts");

function read(path: string) {
  return readFileSync(path, "utf8");
}

function createEvent(
  overrides: Partial<SemiAutoAgentLocalDevFlowEvent> = {},
): SemiAutoAgentLocalDevFlowEvent {
  return {
    event_id: "semi_auto_history_viewer_event_1",
    created_at: "2026-06-29T14:30:00.000Z",
    payload_id: "semi-auto-history-viewer-payload",
    ticker: "AAPL",
    action: "buy",
    quantity: 8,
    dev_flow_state: "completed_local",
    selected_local_result: "user_confirmed",
    terminal_local_outcome: "completed_local",
    warnings: ["Manual final confirmation remains required."],
    blocked_reasons: ["No blocked reason in fixture."],
    source_context: "recommendation",
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
    ...overrides,
  };
}

test.describe("semi-auto agent local dev flow history viewer", () => {
  test("renders local/dev-only label and empty state", () => {
    const viewerSource = read(viewerPath);

    expect(viewerSource).toContain("Local dev history only");
    expect(viewerSource).toContain("Semi-Auto Agent Local Dev Flow History");
    expect(viewerSource).toContain(
      "No semi-auto local dev flow history is stored in this browser yet.",
    );
    expect(viewerSource).toContain("Not sent to Supabase");
    expect(viewerSource).toContain("not an audit record");
    expect(viewerSource).toContain("no broker action");
  });

  test("renders saved events with payload, local result, terminal outcome, and safety flags", () => {
    const storage = createMemoryExecutionStorage();
    const event = createEvent();

    expect(appendSemiAutoAgentLocalDevFlowEvent(event, storage)).toBe(true);

    const readResult = readSemiAutoAgentLocalDevFlowEvents(storage);
    const viewerSource = read(viewerPath);

    expect(readResult.items[0]).toMatchObject({
      payload_id: "semi-auto-history-viewer-payload",
      ticker: "AAPL",
      action: "buy",
      quantity: 8,
      selected_local_result: "user_confirmed",
      terminal_local_outcome: "completed_local",
    });
    expect(viewerSource).toContain("Payload");
    expect(viewerSource).toContain("Ticker");
    expect(viewerSource).toContain("Action");
    expect(viewerSource).toContain("Quantity");
    expect(viewerSource).toContain("Selected Result");
    expect(viewerSource).toContain("Terminal Outcome");
    expect(viewerSource).toContain("Local Only");
    expect(viewerSource).toContain("Dev Only");
    expect(viewerSource).toContain("Manual Confirmation");
    expect(viewerSource).toContain("Automatic Submit Allowed");
    expect(viewerSource).toContain("Automatic Submit Attempted");
    expect(viewerSource).toContain("No Avanza Order");
    expect(viewerSource).toContain("No Broker Submit");
    expect(viewerSource).toContain("Not Supabase");
    expect(viewerSource).toContain("Not Audit");
    expect(viewerSource).toContain("Trade/PnL Mutated");
    expect(readResult.items[0]?.warnings).toContain(
      "Manual final confirmation remains required.",
    );
  });

  test("refresh and clear behavior stays local-store only", () => {
    const storage = createMemoryExecutionStorage();

    appendSemiAutoAgentLocalDevFlowEvent(createEvent(), storage);
    expect(readSemiAutoAgentLocalDevFlowEvents(storage).items).toHaveLength(1);

    expect(clearSemiAutoAgentLocalDevFlowEvents(storage)).toBe(true);
    expect(readSemiAutoAgentLocalDevFlowEvents(storage).items).toEqual([]);

    const viewerSource = read(viewerPath);
    const hookSource = read(hookPath);
    const settingsSource = read(settingsPath);

    expect(viewerSource).toContain("Refresh");
    expect(viewerSource).toContain("Clear local dev flow history");
    expect(viewerSource).toContain("removes only that local history key");
    expect(hookSource).toContain("readSemiAutoAgentLocalDevFlowEvents");
    expect(hookSource).toContain("clearSemiAutoAgentLocalDevFlowEvents");
    expect(settingsSource).toContain("<SemiAutoAgentLocalDevFlowHistoryViewer");
    expect(settingsSource).toContain(
      "onRefresh={refreshSemiAutoAgentLocalDevFlowEvents}",
    );
    expect(settingsSource).toContain(
      "onClear={clearSemiAutoAgentLocalDevFlowHistory}",
    );
  });

  test("handles malformed and unavailable storage through the store helper", () => {
    expect(readSemiAutoAgentLocalDevFlowEvents(null)).toMatchObject({
      items: [],
      discardedCount: 0,
      storageAvailable: false,
      error: null,
    });

    const storage = createMemoryExecutionStorage();
    storage.setItem(SEMI_AUTO_AGENT_LOCAL_DEV_FLOW_STORAGE_KEY, "{");

    const malformed = readSemiAutoAgentLocalDevFlowEvents(storage);
    const viewerSource = read(viewerPath);

    expect(malformed.items).toEqual([]);
    expect(malformed.error).toBeTruthy();
    expect(viewerSource).toContain(
      "Semi-auto local dev flow history could not be parsed safely",
    );
  });

  test("keeps the viewer and wiring free of Supabase, audit writer, route, provider, broker, and automation behavior", () => {
    const viewerSource = read(viewerPath);
    const hookSource = read(hookPath);
    const settingsSource = read(settingsPath);
    const storeSource = read(storePath);
    const localHistorySource = `${viewerSource}\n${hookSource}\n${storeSource}`;

    expect(viewerSource).not.toContain("localStorage");
    expect(viewerSource).not.toContain("readSemiAutoAgentLocalDevFlowEvents");
    expect(viewerSource).not.toContain("clearSemiAutoAgentLocalDevFlowEvents");
    expect(viewerSource).not.toContain("fetch(");
    expect(viewerSource).not.toContain("createClient(");
    expect(viewerSource).not.toContain("process.env");
    expect(viewerSource).not.toContain("/api/");

    expect(settingsSource).toContain("<SemiAutoAgentLocalDevFlowHistoryViewer");
    expect(settingsSource).toContain(
      "readResult={semiAutoAgentLocalDevFlowStore}",
    );
    expect(localHistorySource).not.toContain("SUPABASE_SERVICE_ROLE");
    expect(localHistorySource).not.toContain("service-role");
    expect(localHistorySource).not.toContain(".insert(");
    expect(localHistorySource).not.toContain(".update(");
    expect(localHistorySource).not.toContain(".upsert(");
    expect(localHistorySource).not.toContain(".delete(");
    expect(localHistorySource).not.toContain("run-scan");
    expect(localHistorySource).not.toContain("window.open");
    expect(localHistorySource).not.toContain("puppeteer");
    expect(localHistorySource).not.toContain("broker_order");
    expect(localHistorySource).not.toContain("automatic_submit_allowed: true");
    expect(localHistorySource).not.toContain("automatic_submit_attempted: true");
  });
});
