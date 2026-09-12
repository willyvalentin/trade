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
});
