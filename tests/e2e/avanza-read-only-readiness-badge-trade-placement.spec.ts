import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();

function readRepoFile(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

test.describe("Avanza read-only readiness badge Trade UI placement", () => {
  test("renders badge in Trade dashboard execution context with fixture summary", () => {
    const source = readRepoFile("app/trade-app.tsx");

    expect(source).toContain("AvanzaReadOnlyReadinessBadge");
    expect(source).toContain("avanzaTradeReadOnlyReadinessSummaryFixture");
    expect(source).toContain('label: "Ready for read-only observation"');
    expect(source).toContain('status: "ready_for_read_only_observation"');
    expect(source).toContain("Total-read remains advisory");
    expect(source).toContain(
      "summary={avanzaTradeReadOnlyReadinessSummaryFixture}",
    );
    expect(source).toContain("activeDashboardTab &&");
  });

  test("badge copy states read-only observation and not execution readiness", () => {
    const badgeSource = readRepoFile(
      "components/execution/AvanzaReadOnlyReadinessBadge.tsx",
    );

    expect(badgeSource).toContain("Read-only observation");
    expect(badgeSource).toContain("not execution readiness");
    expect(badgeSource).toContain("not execution readiness or an order action");
  });

  test("Trade UI placement adds no bridge fetch, refresh, trigger, fill, or order controls", () => {
    const source = readRepoFile("app/trade-app.tsx");

    expect(source).not.toMatch(/avanza-local-bridge-readonly-fetcher/);
    expect(source).not.toMatch(/fetchAvanzaLocalBridgeReadonlyStatus/);
    expect(source).not.toMatch(/Refresh bridge status/);
    expect(source).not.toMatch(/\/health|\/self-check|\/preflight\/avanza-order-form/);
    expect(source).not.toMatch(/\/live-fill-only-runner\//);
    expect(source).not.toMatch(/run-approved-quantity-based-fill-only-trigger/);
    expect(source).not.toMatch(/fillQuantityField|fillPriceField|fillAmountField/);
    expect(source).not.toMatch(/FINAL LIVE EXECUTE ATTEMPT/);
  });
});
