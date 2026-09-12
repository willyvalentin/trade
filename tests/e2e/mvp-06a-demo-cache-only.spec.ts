import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import path from "node:path";

const repositoryRoot = path.resolve(__dirname, "../..");

test.describe("MVP-06a cache-only demo journey", () => {
  test("supplies a labelled local quantity only for a demo recommendation", async () => {
    const tradeApp = await readFile(
      path.join(repositoryRoot, "app/trade-app.tsx"),
      "utf8",
    );

    expect(tradeApp).toContain("const demoTradeDefaultShares = 10;");
    expect(tradeApp).toContain(
      "const payloadShares = isDemoTrade\n    ? demoTradeDefaultShares\n    : positionSizing.suggestedShares ?? null;",
    );
    expect(tradeApp).toContain(
      "const demoShares = payloadShares ?? demoTradeDefaultShares;",
    );
    expect(tradeApp).toContain("Demo tools create local/test trade data only.");
    expect(tradeApp).toContain("No broker order was submitted.");
  });

  test("restores only persisted demo data when the dashboard read is unavailable", async () => {
    const tradeApp = await readFile(
      path.join(repositoryRoot, "app/trade-app.tsx"),
      "utf8",
    );

    expect(tradeApp).toContain("function mergeDemoItems<T>(");
    expect(tradeApp).toContain("function mergeDemoLatestPositionUpdates(");
    expect(tradeApp).toContain(
      "setRecommendations((current) =>\n          mergeDemoItems(\n            demoRecommendations,",
    );
    expect(tradeApp).toContain(
      "setActivePositions((current) =>\n          mergeDemoItems(demoActivePositions, current, isDemoPosition)",
    );
    expect(tradeApp).toContain(
      "setClosedPositions((current) =>\n          mergeDemoItems(demoClosedPositions, current, isDemoPosition)",
    );
    expect(tradeApp).toContain(
      "mergeDemoLatestPositionUpdates(current, demoActivePositions)",
    );
    expect(tradeApp).toContain(
      "currentItems.filter((item) => !isDemoItem(item))",
    );
  });
});
