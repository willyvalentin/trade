import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import type {
  AvanzaLocalBridgeStatusSummary,
  AvanzaLocalBridgeUiStatus,
} from "../../lib/avanza-local-bridge-status";

const repoRoot = process.cwd();

function readRepoFile(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

function statusFixture(
  status: AvanzaLocalBridgeUiStatus,
  overrides: Partial<AvanzaLocalBridgeStatusSummary> = {},
): AvanzaLocalBridgeStatusSummary {
  return {
    status,
    bridgeAvailable: status === "available" || status === "preflight_ready",
    selfCheckAvailable: false,
    preflightReady: status === "preflight_ready",
    manualObservationReady: status === "preflight_ready",
    checkedAt: "2026-07-03T10:00:00.000Z",
    endpoints: {
      health:
        status === "not_configured" || status === "unavailable"
          ? "unavailable"
          : "ok",
      selfCheck: status === "self_check_unavailable" ? "unavailable" : "not_checked",
      preflight:
        status === "preflight_ready"
          ? "ok"
          : status === "preflight_blocked"
            ? "blocked"
            : "not_checked",
    },
    safeMessage: `Status fixture: ${status}`,
    blockers: status === "preflight_blocked" ? ["avanza_page_not_verified"] : [],
    warnings: [],
    ...overrides,
  };
}

test.describe("Avanza bridge status panel", () => {
  test("defines read-only safety copy and ready evidence fields", () => {
    const source = readRepoFile("components/execution/AvanzaBridgeStatusPanel.tsx");

    expect(source).toContain("Avanza bridge");
    expect(source).toContain("Read-only status");
    expect(source).toContain("No order can be placed from this panel");
    expect(source).toContain("Ture will not click Granska köp");
    expect(source).toContain("Ture will not submit an order");
    expect(source).toContain("Preflight ready");
    expect(source).toContain("Bridge available");
    expect(source).toContain("Account verified");
    expect(source).toContain("Instrument verified");
    expect(source).toContain("Order form visible");
    expect(source).toContain("Total-read");
    expect(source).toContain("Unresolved/advisory");
  });

  test("defines blocked preflight state without implying readiness", () => {
    const source = readRepoFile("components/execution/AvanzaBridgeStatusPanel.tsx");
    const blockedFixture = statusFixture("preflight_blocked");

    expect(blockedFixture.preflightReady).toBe(false);
    expect(blockedFixture.manualObservationReady).toBe(false);
    expect(source).toContain("Preflight blocked");
    expect(source).toContain("Blockers");
    expect(source).toContain("No order can be placed from this panel");
  });

  test("renders all supported status labels", () => {
    const source = readRepoFile("components/execution/AvanzaBridgeStatusPanel.tsx");
    const cases: Array<[AvanzaLocalBridgeUiStatus, string]> = [
      ["not_configured", "Not configured"],
      ["unavailable", "Unavailable"],
      ["available", "Available"],
      ["self_check_unavailable", "Self-check unavailable"],
      ["preflight_ready", "Preflight ready"],
      ["preflight_blocked", "Preflight blocked"],
      ["unknown_error", "Unknown error"],
    ];

    for (const [status, label] of cases) {
      expect(statusFixture(status).status).toBe(status);
      expect(source).toContain(label);
    }
  });

  test("component is read-only and does not reference live runner paths", () => {
    const source = readRepoFile("components/execution/AvanzaBridgeStatusPanel.tsx");

    expect(source).toContain("AvanzaBridgeStatusPanel");
    expect(source).not.toMatch(/fetch\s*\(/);
    expect(source).not.toMatch(/XMLHttpRequest|http\.request|https\.request/);
    expect(source).not.toMatch(/<button\b|onClick=/);
    expect(source).not.toMatch(/run-approved-quantity-based-fill-only-trigger/);
    expect(source).not.toMatch(/fillQuantityField|fillPriceField|fillAmountField/);
    expect(source).not.toMatch(/\/live-fill-only-runner\//);
    expect(source).not.toMatch(/document\.cookie|localStorage|sessionStorage/);
    expect(source).not.toMatch(/supabase/i);
  });

  test("UI integration plan marks read-only status panel as current step", () => {
    const doc = readRepoFile(
      "docs/semi-auto-avanza-fill-only-poc-ui-integration-plan.md",
    );

    expect(doc).toContain("avanza_bridge_read_only_status_panel_added");
    expect(doc).toContain("Read-only UI status panel");
    expect(doc).toContain("components/execution/AvanzaBridgeStatusPanel.tsx");
    expect(doc).toContain("No live trigger button");
    expect(doc).toContain("No bridge POST calls");
  });
});
