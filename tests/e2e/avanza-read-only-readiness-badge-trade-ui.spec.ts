import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();

function readRepoFile(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

const forbiddenTradeUiPatterns = [
  /fetch\s*\(/,
  /setInterval|setTimeout/,
  /Refresh bridge status/,
  /\/health|\/self-check|\/preflight\/avanza-order-form/,
  /\/live-fill-only-runner\//,
  /fillQuantityField|fillPriceField|fillAmountField/,
  /clickGranskaKop|openReviewModal|clickBekrafta|submitOrder|placeOrder/i,
  /document\.cookie|localStorage|sessionStorage/,
  /supabase/i,
] as const;

test.describe("Avanza read-only readiness badge in Trade UI", () => {
  test("renders the reusable badge with a neutral disconnected default", () => {
    const pageSource = readRepoFile("app/page.tsx");
    const fixtureSource = readRepoFile("lib/avanza-read-only-readiness-fixture.ts");
    const badgeSource = readRepoFile(
      "components/execution/AvanzaReadOnlyReadinessBadge.tsx",
    );

    expect(pageSource).toContain("AvanzaReadOnlyReadinessBadge");
    expect(pageSource).toContain("tradeExecutionReadOnlySummaryFixture");
    expect(pageSource).toContain("Read-only observation context");
    expect(pageSource).toContain("max-w-xl");
    expect(fixtureSource).toContain('label: "Status not connected"');
    expect(fixtureSource).toContain(
      "Live Avanza readiness data is not connected.",
    );
    expect(fixtureSource).toContain("No current system status is available.");
    expect(fixtureSource).toContain('status: "unknown"');
    expect(fixtureSource).toContain('severity: "neutral"');
    expect(fixtureSource).toContain("ready_count: 0");
    expect(fixtureSource).toContain("blocked_count: 0");
    expect(fixtureSource).toContain("unknown_count: 12");
    expect(fixtureSource).not.toContain("Ready for read-only observation");
    expect(fixtureSource).not.toContain("ready_count: 11");
    expect(fixtureSource).not.toContain(
      'status: "ready_for_read_only_observation"',
    );
    expect(badgeSource).toContain(
      "Read-only observation, not execution readiness or an order action",
    );
  });

  test("keeps Trade UI placement free of refresh and live-control behavior", () => {
    const tradeUiSource = [
      readRepoFile("app/page.tsx"),
      readRepoFile("lib/avanza-read-only-readiness-fixture.ts"),
    ].join("\n");

    for (const pattern of forbiddenTradeUiPatterns) {
      expect(tradeUiSource, `Trade UI source must not match ${pattern}`).not.toMatch(
        pattern,
      );
    }
  });

  test("records display-only Trade UI placement in the integration plan", () => {
    const docSource = readRepoFile(
      "docs/semi-auto-avanza-fill-only-poc-ui-integration-plan.md",
    );

    expect(docSource).toContain(
      "avanza_read_only_readiness_badge_trade_ui_display_added",
    );
    expect(docSource).toContain("Current Trade UI display follow-up");
    expect(docSource).toContain("fixture/default summary data only");
    expect(docSource).toContain("Settings remains the only UI surface");
  });
});
