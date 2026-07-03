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
    const fixtureSource = readRepoFile(
      "lib/avanza-read-only-readiness-fixtures.ts",
    );

    expect(source).toContain("AvanzaReadOnlyReadinessBadge");
    expect(source).toContain("AvanzaPrepareHandoffPreviewShell");
    expect(source).toContain(
      'from "@/lib/avanza-read-only-readiness-fixtures"',
    );
    expect(source).toContain("avanzaTradeReadOnlyReadinessSummaryFixture");
    expect(source).toContain(
      "summary={avanzaTradeReadOnlyReadinessSummaryFixture}",
    );
    expect(source).toContain("activeDashboardTab &&");
    expect(source).not.toContain(
      "const avanzaTradeReadOnlyReadinessSummaryFixture",
    );
    expect(fixtureSource).toContain(
      "avanzaTradeReadOnlyReadinessSummaryFixture",
    );
    expect(fixtureSource).toContain('label: "Ready for read-only observation"');
    expect(fixtureSource).toContain('status: "ready_for_read_only_observation"');
    expect(fixtureSource).toContain("Total-read remains advisory");
    expect(fixtureSource).toContain("not execution readiness");
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
    expect(source).not.toMatch(/avanzaBridgeReadonlyStatusEnabled/);
    expect(source).not.toMatch(/fetchAvanzaLocalBridgeReadonlyStatus/);
    expect(source).not.toMatch(/Refresh bridge status/);
    expect(source).not.toMatch(/\/health|\/self-check|\/preflight\/avanza-order-form/);
    expect(source).not.toMatch(/\/live-fill-only-runner\//);
    expect(source).not.toMatch(/run-approved-quantity-based-fill-only-trigger/);
    expect(source).not.toMatch(/fillQuantityField|fillPriceField|fillAmountField/);
    expect(source).not.toMatch(/FINAL LIVE EXECUTE ATTEMPT/);
  });

  test("disabled preview-only Avanza handoff shell renders without action wiring", () => {
    const source = readRepoFile("app/trade-app.tsx");
    const shellSource = readRepoFile(
      "components/execution/AvanzaPrepareHandoffPreviewShell.tsx",
    );

    expect(source).toContain("AvanzaPrepareHandoffPreviewShell");
    expect(shellSource).toContain("Prepare Avanza handoff");
    expect(shellSource).toContain("Preview only");
    expect(shellSource).toContain("Not enabled");
    expect(shellSource).toContain("disabled");
    expect(shellSource).toContain("Ture will not click Granska köp");
    expect(shellSource).toContain("Ture will not submit an order");
    expect(shellSource).toContain("Manual review required in Avanza");
    expect(shellSource).toContain("Ture validates the trade package.");
    expect(shellSource).toContain("Ture checks read-only Avanza readiness.");
    expect(shellSource).toContain("Ture prepares the order form.");
    expect(shellSource).toContain("Ture stops before Granska köp.");
    expect(shellSource).toContain("User manually reviews in Avanza.");
    expect(shellSource).toContain("Total-read remains");
    expect(shellSource).not.toMatch(/onClick|fetch\s*\(|\/live-fill-only-runner\//);
    expect(shellSource).not.toMatch(/fillQuantityField|fillPriceField|fillAmountField/);
    expect(shellSource).not.toMatch(/FINAL LIVE EXECUTE ATTEMPT/);
    expect(shellSource).not.toMatch(/method:\s*["']POST["']/);
  });
});
