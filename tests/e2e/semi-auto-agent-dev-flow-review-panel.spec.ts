import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { buildAvanzaExecutionHandoff } from "../../lib/avanza-execution-handoff";
import {
  getExecutionAuthorityForMode,
  type ExecutionIntent,
} from "../../lib/execution";
import { buildSemiAutoAgentDevFlowReview } from "../../lib/semi-auto-agent-dev-flow-review";
import { buildSemiAutoAgentHandoffPreview } from "../../lib/semi-auto-agent-handoff-preview";
import { buildSemiAutoAgentResultCaptureStubResult } from "../../lib/semi-auto-agent-result-capture-stub";

const reviewHelperPath = join(
  process.cwd(),
  "lib/semi-auto-agent-dev-flow-review.ts",
);
const panelPath = join(
  process.cwd(),
  "components/execution/SemiAutoAgentDevFlowReviewPanel.tsx",
);
const compositionPath = join(
  process.cwd(),
  "components/execution/ExecutionHandoffModalComposition.tsx",
);
const modalPath = join(
  process.cwd(),
  "components/execution/execution-handoff-preview-modal.tsx",
);
const captureStubPath = join(
  process.cwd(),
  "components/execution/SemiAutoAgentResultCaptureStub.tsx",
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
    intent_id: "semi-auto-dev-flow-review-buy-intent",
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
      recommendation_id: "semi-auto-dev-flow-review-recommendation",
      live_position_id: null,
      ticker: "AAPL",
      market: "US",
      quantity: 8,
      order_type: "limit",
      limit_price: 212.1,
      stop_loss: 209.1,
      target_price: 218.1,
      expires_at: "2026-06-29T14:45:00.000Z",
      payload_id: "semi-auto-dev-flow-review-payload-id",
      payload_fingerprint: "semi-auto-dev-flow-review-payload-fingerprint",
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

function previewForIntent(selectedIntent: ExecutionIntent) {
  const handoff = buildAvanzaExecutionHandoff(selectedIntent, {
    createdAt: now,
  });

  return buildSemiAutoAgentHandoffPreview({ handoff, selectedIntent });
}

function readyPreview() {
  return previewForIntent(createBuyIntent());
}

function blockedPreview() {
  return previewForIntent(
    createBuyIntent({
      trading_package: {
        expires_at: "2026-06-29T14:20:00.000Z",
      },
    }),
  );
}

test.describe("semi-auto agent dev flow review panel", () => {
  test("builds review state for a valid waiting-for-manual-confirmation preview", () => {
    const preview = readyPreview();
    const review = buildSemiAutoAgentDevFlowReview(preview, null);

    expect(review.state.status).toBe("waiting_for_manual_confirmation");
    expect(review.hasActivePreview).toBe(true);
    expect(review.payloadId).toBe(preview.payloadResult?.payload.payload_id);
    expect(review.ticker).toBe("AAPL");
    expect(review.action).toBe("buy");
    expect(review.quantity).toBe(8);
    expect(review.adapterStatus).toBe("waiting_for_manual_confirmation");
    expect(review.safetyChecks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: "Manual final confirmation required",
          passed: true,
        }),
        expect.objectContaining({
          label: "Automatic submit allowed",
          passed: true,
          value: "false",
        }),
        expect.objectContaining({
          label: "Automatic submit attempted",
          passed: true,
          value: "false",
        }),
      ]),
    );
  });

  test("shows selected local result and terminal local outcome after local capture", () => {
    const preview = readyPreview();
    const captureResult = buildSemiAutoAgentResultCaptureStubResult(
      preview,
      "user_confirmed",
      { now },
    );
    const review = buildSemiAutoAgentDevFlowReview(preview, captureResult);

    expect(review.localResultStatus).toBe("user_confirmed");
    expect(review.terminalOutcome).toBe("completed_local");
    expect(review.state.terminal).toBe(true);
    expect(review.safetyChecks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: "No Avanza order placed",
          passed: true,
        }),
        expect.objectContaining({
          label: "No broker submit by Ture",
          passed: true,
        }),
        expect.objectContaining({
          label: "Local-only review",
          passed: true,
        }),
      ]),
    );
  });

  test("shows blocked stale preview reasons without advancing to waiting state", () => {
    const preview = blockedPreview();
    const review = buildSemiAutoAgentDevFlowReview(preview, null);

    expect(review.state.status).toBe("payload_blocked");
    expect(review.adapterStatus).toBe("blocked");
    expect(review.blockedReasons).toEqual(
      expect.arrayContaining(["payload_expired"]),
    );
    expect(review.terminalOutcome).toBeNull();
  });

  test("shows quiet empty state when no active preview exists", () => {
    const review = buildSemiAutoAgentDevFlowReview(
      {
        status: "unavailable",
        payloadResult: null,
        adapterResult: null,
        message: "Semi-auto preview requires a selected execution handoff.",
        source: null,
      },
      null,
    );

    expect(review.hasActivePreview).toBe(false);
    expect(review.state.status).toBe("idle");
    expect(review.payloadId).toBeNull();
  });

  test("wires the review panel into the existing handoff modal as local UI only", () => {
    const reviewHelperSource = read(reviewHelperPath);
    const panelSource = read(panelPath);
    const compositionSource = read(compositionPath);
    const modalSource = read(modalPath);
    const captureStubSource = read(captureStubPath);
    const combinedSource = [
      reviewHelperSource,
      panelSource,
      compositionSource,
      modalSource,
      captureStubSource,
    ].join("\n");

    expect(panelSource).toContain("Dev/local review only");
    expect(panelSource).toContain("Semi-auto dev flow review");
    expect(panelSource).toContain("No Avanza order was");
    expect(panelSource).toContain("no broker submit was attempted");
    expect(panelSource).toContain("final confirmation");
    expect(panelSource).toContain("Safety invariant checklist");
    expect(panelSource).toContain("Quiet empty state");
    expect(compositionSource).toContain("<SemiAutoAgentDevFlowReviewPanel");
    expect(modalSource).toContain("semiAutoAgentDevFlowReviewPanelProps");
    expect(modalSource).toContain("semiAutoAgentResultCaptureStubResult");
    expect(captureStubSource).toContain("onResultChange?.(nextResult)");

    expect(combinedSource).not.toContain("fetch(");
    expect(combinedSource).not.toContain("createClient(");
    expect(combinedSource).not.toContain("SUPABASE_SERVICE_ROLE");
    expect(combinedSource).not.toContain("service-role");
    expect(combinedSource).not.toContain("process.env");
    expect(combinedSource).not.toContain("playwright");
    expect(combinedSource).not.toContain("puppeteer");
    expect(combinedSource).not.toContain("window.open");
    expect(combinedSource).not.toContain(".insert(");
    expect(combinedSource).not.toContain(".update(");
    expect(combinedSource).not.toContain(".upsert(");
    expect(combinedSource).not.toContain(".delete(");
    expect(combinedSource).not.toContain("run-scan");
  });
});
