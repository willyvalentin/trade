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
    const badgeSource = readRepoFile(
      "components/execution/AvanzaReadOnlyReadinessBadge.tsx",
    );

    expect(source).toContain("Avanza bridge");
    expect(source).toContain("Read-only status");
    expect(source).toContain("No order can be placed from this panel");
    expect(source).toContain("Ture will not click Granska köp");
    expect(source).toContain("Ture will not submit an order");
    expect(source).toContain("Manual review required in Avanza");
    expect(source).toContain("Preflight ready");
    expect(source).toContain("Bridge available");
    expect(source).toContain("Account verified");
    expect(source).toContain("Instrument verified");
    expect(source).toContain("Order form visible");
    expect(source).toContain("Total-read");
    expect(source).toContain("Unresolved/advisory");
    expect(source).toContain("Core fill-and-stop POC proven");
    expect(source).toContain("Quantity-based flow");
    expect(source).toContain("Quantity verified");
    expect(source).toContain("Price verified");
    expect(source).toContain("Evidence captured");
    expect(source).toContain("Stopped before Granska köp");
    expect(source).toContain("No review modal");
    expect(source).toContain("No final confirmation");
    expect(source).toContain("No order placement");
    expect(source).toContain("Last read-only refresh");
    expect(source).toContain("Last refreshed at");
    expect(source).toContain("Fetch duration");
    expect(source).toContain("Source");
    expect(source).toContain("Health");
    expect(source).toContain("Self-check");
    expect(source).toContain("Read-only readiness checklist");
    expect(source).toContain("AvanzaReadOnlyReadinessBadge");
    expect(badgeSource).toContain("Read-only readiness summary");
    expect(badgeSource).toContain("Ready");
    expect(badgeSource).toContain("Blocked");
    expect(badgeSource).toContain("Advisory");
    expect(badgeSource).toContain("Unknown");
    expect(source).toContain("ready");
    expect(source).toContain("blocked");
    expect(source).toContain("advisory");
    expect(source).toContain("unknown");
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
    expect(source).toContain("Refresh bridge status");
    expect(source).toContain("canRefreshStatus && onRefreshStatus");
    expect(source).not.toMatch(/fetch\s*\(/);
    expect(source).not.toMatch(/XMLHttpRequest|http\.request|https\.request/);
    expect(source).not.toMatch(/run-approved-quantity-based-fill-only-trigger/);
    expect(source).not.toMatch(/fillQuantityField|fillPriceField|fillAmountField/);
    expect(source).not.toMatch(/\/live-fill-only-runner\//);
    expect(source).not.toMatch(/document\.cookie|localStorage|sessionStorage/);
    expect(source).not.toMatch(/supabase/i);
  });

  test("settings renders the panel with static fixture props only", () => {
    const settingsSource = readRepoFile("app/settings/page.tsx");
    const helperSource = readRepoFile("lib/avanza-bridge-readiness-checklist.ts");

    expect(settingsSource).toContain(
      'from "@/components/execution/AvanzaBridgeStatusPanel"',
    );
    expect(settingsSource).toContain(
      'from "@/lib/avanza-local-bridge-readonly-fetcher"',
    );
    expect(settingsSource).toContain("<AvanzaBridgeStatusPanel");
    expect(settingsSource).toContain("avanzaBridgeStatusPanelFixture");
    expect(settingsSource).toContain("avanzaBridgeStatusPanelStatus");
    expect(settingsSource).toContain('status: "preflight_ready"');
    expect(settingsSource).toContain("totalReadStatus: \"unresolved_advisory\"");
    expect(settingsSource).toContain("total_read_unresolved_advisory");
    expect(settingsSource).toContain("Valentin Labs KF");
    expect(settingsSource).toContain("GameStop");
    expect(settingsSource).toContain("coreFillAndStopProven: true");
    expect(settingsSource).toContain('flow: "quantity_based"');
    expect(settingsSource).toContain('quantityVerifiedVia: "input#inputVolume"');
    expect(settingsSource).toContain('priceVerifiedVia: "input#inputPrice"');
    expect(settingsSource).toContain("evidenceCaptured: true");
    expect(settingsSource).toContain("stoppedBeforeReview: true");
    expect(settingsSource).toContain("noReviewModal: true");
    expect(settingsSource).toContain("noFinalConfirmation: true");
    expect(settingsSource).toContain("noOrderPlacement: true");
    expect(settingsSource).toContain("avanzaBridgeFixtureRefreshMetadata");
    expect(settingsSource).toContain('source: "fixture_default"');
    expect(settingsSource).toContain("buildAvanzaBridgeRefreshMetadata");
    expect(settingsSource).toContain("refreshMetadata={avanzaBridgeRefreshMetadata}");
    expect(settingsSource).toContain("buildAvanzaBridgeReadinessChecklist");
    expect(settingsSource).toContain("summarizeAvanzaBridgeReadinessChecklist");
    expect(settingsSource).toContain(
      'from "@/lib/avanza-bridge-readiness-checklist"',
    );
    expect(settingsSource).toContain("evidence: avanzaBridgeStatusPanelEvidence");
    expect(settingsSource).toContain(
      "milestone: avanzaBridgeStatusPanelMilestone",
    );
    expect(settingsSource).toContain(
      "readinessChecklist={avanzaBridgeReadinessChecklist}",
    );
    expect(settingsSource).toContain(
      "readinessSummary={avanzaBridgeReadinessSummary}",
    );
    expect(helperSource).toContain("Read-only feature flag enabled");
    expect(helperSource).toContain("Local bridge reachable");
    expect(helperSource).toContain("Health endpoint available");
    expect(helperSource).toContain("Self-check endpoint available");
    expect(helperSource).toContain("Avanza page observed");
    expect(helperSource).toContain("Order form visible");
    expect(helperSource).toContain("Account verified");
    expect(helperSource).toContain("Instrument verified");
    expect(helperSource).toContain("Buy side verified");
    expect(helperSource).toContain("Advanced/Limit mode verified");
    expect(helperSource).toContain("Stop-before-review boundary documented");
    expect(helperSource).toContain("Total-read unresolved/advisory");
    expect(helperSource).toContain("Ready for read-only observation");
    expect(helperSource).toContain("Total-read remains advisory");
  });

  test("settings refresh button is feature-flagged and uses read-only fetcher only", () => {
    const settingsSource = readRepoFile("app/settings/page.tsx");

    expect(settingsSource).toContain("avanzaBridgeReadonlyStatusEnabled");
    expect(settingsSource).toContain(
      "isAvanzaLocalBridgeReadonlyStatusEnabled()",
    );
    expect(settingsSource).toContain("refreshAvanzaBridgeReadonlyStatus");
    expect(settingsSource).toContain("fetchAvanzaLocalBridgeReadonlyStatus({");
    expect(settingsSource).toContain(
      "canRefreshStatus={avanzaBridgeReadonlyStatusEnabled}",
    );
    expect(settingsSource).toContain(
      "avanzaBridgeReadonlyStatusEnabled\n                    ? () => void refreshAvanzaBridgeReadonlyStatus()",
    );
    expect(settingsSource).toContain(
      "Read-only Avanza bridge status is not configured.",
    );
    expect(settingsSource).toContain('source: "manual_readonly_refresh"');
    expect(settingsSource).toContain("lastRefreshedAt: result.completedAt");
    expect(settingsSource).toContain("fetchDurationMs: result.elapsedMs");
  });

  test("settings derives safe checklist states without fetching when disabled", () => {
    const helperSource = readRepoFile("lib/avanza-bridge-readiness-checklist.ts");

    expect(helperSource).toContain("featureEnabled: boolean");
    expect(helperSource).toContain('status: featureEnabled ? "ready" : "blocked"');
    expect(helperSource).toContain('const observedState = !featureEnabled');
    expect(helperSource).toContain('const healthState = !featureEnabled');
    expect(helperSource).toContain('const selfCheckState = !featureEnabled');
    expect(helperSource).toContain('const localBridgeState = !featureEnabled');
    expect(helperSource).toContain('status: "advisory"');
    expect(helperSource).toContain("total_read_unresolved_advisory");
  });

  test("checklist distinguishes preflight ready and blocked states safely", () => {
    const helperSource = readRepoFile("lib/avanza-bridge-readiness-checklist.ts");

    expect(helperSource).toContain('preflightReady\n      ? "ready"');
    expect(helperSource).toContain('preflightBlocked\n        ? "blocked"');
    expect(helperSource).toContain(
      'refreshMetadata.endpointSummary.preflight === "blocked"',
    );
    expect(helperSource).toContain(
      'refreshMetadata.endpointSummary.health === "available"',
    );
    expect(helperSource).toContain(
      'refreshMetadata.endpointSummary.selfCheck === "available"',
    );
  });

  test("settings metadata sanitizes timeout and network errors without stack traces", () => {
    const settingsSource = readRepoFile("app/settings/page.tsx");
    const panelSource = readRepoFile("components/execution/AvanzaBridgeStatusPanel.tsx");

    expect(settingsSource).toContain("sanitizeReadonlyBridgeError");
    expect(settingsSource).toContain("replace(/\\s+/g, \" \")");
    expect(settingsSource).toContain("slice(0, 180)");
    expect(settingsSource).toContain("errorMessage");
    expect(panelSource).toContain("refreshMetadata.errorMessage");
    expect(panelSource).not.toMatch(/\.stack\b|console\.error/);
  });

  test("settings placement adds no live trigger, fill, submit, or bridge POST path", () => {
    const settingsSource = readRepoFile("app/settings/page.tsx");
    const fixtureStart = settingsSource.indexOf(
      "avanzaBridgeStatusPanelFixture",
    );
    const fixtureEnd = settingsSource.indexOf(
      "type ScheduledScanRun",
      fixtureStart,
    );
    const panelPlacementStart = settingsSource.indexOf(
      "<AvanzaBridgeStatusPanel",
    );
    const panelPlacementEnd = settingsSource.indexOf(
      "{executionDevToolsEnabled ?",
      panelPlacementStart,
    );
    const panelPlacementSlice = [
      settingsSource.slice(fixtureStart, fixtureEnd),
      settingsSource.slice(panelPlacementStart, panelPlacementEnd),
    ].join("\n");

    expect(fixtureStart).toBeGreaterThanOrEqual(0);
    expect(fixtureEnd).toBeGreaterThan(fixtureStart);
    expect(panelPlacementStart).toBeGreaterThanOrEqual(0);
    expect(panelPlacementEnd).toBeGreaterThan(panelPlacementStart);
    expect(panelPlacementSlice).not.toMatch(/fetch\s*\(/);
    expect(panelPlacementSlice).not.toMatch(/method:\s*["']POST["']/);
    expect(panelPlacementSlice).not.toMatch(
      /run-approved-quantity-based-fill-only-trigger/,
    );
    expect(panelPlacementSlice).not.toMatch(
      /fillQuantityField|fillPriceField|fillAmountField/,
    );
    expect(panelPlacementSlice).not.toMatch(/FINAL LIVE EXECUTE ATTEMPT/);
    expect(panelPlacementSlice).not.toMatch(
      /clickGranskaKop|openReviewModal|clickBekrafta|submitOrder|placeOrder/i,
    );
    expect(panelPlacementSlice).not.toMatch(
      /document\.cookie|localStorage|sessionStorage/,
    );
    expect(panelPlacementSlice).not.toMatch(/supabase/i);
  });

  test("settings UI code does not include forbidden live runner strings", () => {
    const settingsSource = readRepoFile("app/settings/page.tsx");

    expect(settingsSource).not.toMatch(
      /run-approved-quantity-based-fill-only-trigger/,
    );
    expect(settingsSource).not.toMatch(
      /fillAmountField|fillQuantityField|fillPriceField/,
    );
    expect(settingsSource).not.toMatch(/FINAL LIVE EXECUTE ATTEMPT/);
    expect(settingsSource).not.toMatch(
      /clickGranskaKop|openReviewModal|clickBekrafta|submitOrder|placeOrder/i,
    );
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
