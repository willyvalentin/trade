import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { runMockSemiAutoBrowserAgent } from "../../lib/mock-semi-auto-browser-agent-adapter";
import { prepareSandboxBrowserAgentFill } from "../../lib/sandbox-browser-agent-adapter";
import {
  buildSemiAutoLivePositionSellPayload,
  buildSemiAutoRecommendationBuyPayload,
} from "../../lib/semi-auto-agent-payload-builder";
import {
  validateSemiAutoAgentPayload,
  type SemiAutoAvanzaAgentPayload,
} from "../../lib/semi-auto-agent-payload-contract";

const repoRoot = process.cwd();
const now = "2026-06-29T14:30:00.000Z";

const sourceFiles = [
  "lib/semi-auto-agent-payload-contract.ts",
  "lib/semi-auto-agent-payload-builder.ts",
  "lib/mock-semi-auto-browser-agent-adapter.ts",
  "lib/semi-auto-agent-handoff-preview.ts",
  "lib/semi-auto-agent-result-capture-stub.ts",
  "lib/semi-auto-agent-dev-flow-state-machine.ts",
  "lib/semi-auto-agent-dev-flow-review.ts",
  "lib/semi-auto-agent-local-dev-flow-store.ts",
  "lib/sandbox-browser-agent-adapter.ts",
  "components/execution/SandboxBrokerOrderForm.tsx",
  "components/execution/SemiAutoAgentHandoffPreview.tsx",
  "components/execution/SemiAutoAgentResultCaptureStub.tsx",
  "components/execution/SemiAutoAgentDevFlowReviewPanel.tsx",
  "components/execution/SemiAutoAgentLocalDevFlowHistoryViewer.tsx",
  "app/sandbox-broker/page.tsx",
] as const;

const buyInput = {
  recommendation_id: "rec-human-confirmation-001",
  recommendation_fingerprint: "recommendation-human-confirmation-fp-001",
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
  position_id: "position-human-confirmation-001",
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

function readRepoFile(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

function allGuardedSource() {
  return sourceFiles.map((path) => readRepoFile(path)).join("\n");
}

function buyPayload(): SemiAutoAvanzaAgentPayload {
  return buildSemiAutoRecommendationBuyPayload(buyInput, { now }).payload;
}

function sellPayload(): SemiAutoAvanzaAgentPayload {
  return buildSemiAutoLivePositionSellPayload(sellInput, { now }).payload;
}

function automaticSubmitPayload(): SemiAutoAvanzaAgentPayload {
  const payload = buyPayload();

  return {
    ...payload,
    authority: {
      ...payload.authority,
      automatic_submit_allowed: true,
      agent_can_submit_order: true,
    },
  } as never;
}

test.describe("human final confirmation guard", () => {
  test("payload contract requires human final confirmation for valid buy and sell payloads", () => {
    for (const payload of [buyPayload(), sellPayload()]) {
      const validation = validateSemiAutoAgentPayload(payload, { now });

      expect(validation.valid).toBe(true);
      expect(payload.authority).toMatchObject({
        human_final_confirmation_required: true,
        automatic_submit_allowed: false,
        final_confirmation_actor: "human",
        agent_can_prepare_broker_fields: true,
        agent_can_submit_order: false,
      });
      expect(payload.safety_check_summary.checks).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: "manual_final_confirmation_required",
            status: "passed",
          }),
          expect.objectContaining({
            id: "automatic_submit_blocked",
            status: "passed",
          }),
        ]),
      );
    }
  });

  test("payload builder keeps automatic submit false for buy and sell payloads", () => {
    const buy = buildSemiAutoRecommendationBuyPayload(buyInput, { now });
    const sell = buildSemiAutoLivePositionSellPayload(sellInput, { now });

    for (const result of [buy, sell]) {
      expect(result.status).toBe("ready");
      expect(result.payload.authority.human_final_confirmation_required).toBe(
        true,
      );
      expect(result.payload.authority.automatic_submit_allowed).toBe(false);
      expect(result.payload.authority.agent_can_submit_order).toBe(false);
      expect(result.validation.valid).toBe(true);
    }
  });

  test("mock adapter never attempts submit and rejects automatic-submit payloads", () => {
    const ready = runMockSemiAutoBrowserAgent(buyPayload(), { now });
    const blocked = runMockSemiAutoBrowserAgent(automaticSubmitPayload(), {
      now,
    });

    expect(ready.status).toBe("waiting_for_manual_confirmation");
    expect(ready.manual_final_confirmation_required).toBe(true);
    expect(ready.automatic_submit_allowed).toBe(false);
    expect(ready.automatic_submit_attempted).toBe(false);

    expect(blocked.status).toBe("blocked");
    expect(blocked.automatic_submit_allowed).toBe(false);
    expect(blocked.automatic_submit_attempted).toBe(false);
    expect(blocked.errors).toEqual(
      expect.arrayContaining([
        "automatic_submit_must_be_false",
        "agent_submit_must_be_false",
      ]),
    );
    expect(blocked.prepared_order_summary).toBeNull();
  });

  test("sandbox adapter never attempts final submit and rejects automatic-submit payloads", () => {
    const ready = prepareSandboxBrowserAgentFill(sellPayload(), { now });
    const blocked = prepareSandboxBrowserAgentFill(automaticSubmitPayload(), {
      now,
    });

    expect(ready.status).toBe("ready");
    expect(ready.human_final_confirmation_required).toBe(true);
    expect(ready.automatic_submit_allowed).toBe(false);
    expect(ready.final_submit_attempted).toBe(false);
    expect(ready.no_avanza_order).toBe(true);
    expect(ready.no_broker_action).toBe(true);

    expect(blocked.status).toBe("blocked");
    expect(blocked.automatic_submit_allowed).toBe(false);
    expect(blocked.final_submit_attempted).toBe(false);
    expect(blocked.errors).toEqual(
      expect.arrayContaining([
        "automatic_submit_must_be_false",
        "agent_submit_must_be_false",
      ]),
    );
    expect(blocked.prepared_fields).toBeNull();
  });

  test("sandbox page fake final KOP/SALJ control remains disabled and has no submit form", () => {
    const component = readRepoFile(
      "components/execution/SandboxBrokerOrderForm.tsx",
    );
    const page = readRepoFile("app/sandbox-broker/page.tsx");

    expect(component).toContain("KÖP");
    expect(component).toContain("SÄLJ");
    expect(component).toContain("Fake final confirmation");
    expect(component).toContain("disabled");
    expect(component).toContain('type="button"');
    expect(component).toContain(
      "The final {finalLabel} control is disabled and non-submitting.",
    );
    expect(`${page}\n${component}`).not.toContain("<form");
    expect(`${page}\n${component}`).not.toContain("action=");
    expect(`${page}\n${component}`).not.toMatch(/onClick=\{[^}]*final/i);
  });

  test("semi-auto UI copy keeps final confirmation manual and denies broker implication", () => {
    const handoffPreview = readRepoFile(
      "components/execution/SemiAutoAgentHandoffPreview.tsx",
    );
    const resultCapture = readRepoFile(
      "components/execution/SemiAutoAgentResultCaptureStub.tsx",
    );
    const reviewPanel = readRepoFile(
      "components/execution/SemiAutoAgentDevFlowReviewPanel.tsx",
    );
    const historyViewer = readRepoFile(
      "components/execution/SemiAutoAgentLocalDevFlowHistoryViewer.tsx",
    );

    expect(handoffPreview).toContain("final broker");
    expect(handoffPreview).toContain("confirmation remains manual");
    expect(resultCapture).toContain("No Avanza");
    expect(resultCapture).toContain("no broker order was submitted by Ture");
    expect(reviewPanel).toContain("no broker submit was attempted");
    expect(historyViewer).toContain("no Avanza order");
    expect(historyViewer).toContain("no broker action");
  });

  test("static scan denies executable final broker click handlers and Avanza navigation code", () => {
    const source = allGuardedSource();

    expect(source).not.toContain("avanza.se");
    expect(source).not.toMatch(/https?:\/\/[^"']*avanza/i);
    expect(source).not.toContain(".goto(");
    expect(source).not.toContain(".click(");
    expect(source).not.toMatch(/click.*K(?:Ö|O)P/i);
    expect(source).not.toMatch(/click.*S(?:Ä|A)LJ/i);
    expect(source).not.toMatch(/onClick=\{[^}]*submit/i);
  });

  test("static scan denies automatic submit enablement and write paths", () => {
    const source = allGuardedSource();

    for (const forbidden of [
      "automatic_submit_allowed: true",
      "automatic_submit_attempted: true",
      "agent_can_submit_order: true",
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
      "provider",
      "scanner",
      "market-loop",
      "recordTrade",
      "updateTrade",
      "trade_stats_pnl_mutated: true",
    ]) {
      expect(source).not.toContain(forbidden);
    }
  });
});
