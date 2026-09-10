import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { hasRecordableManualPositionPlan } from "../../lib/manual-position-plan";

const repositoryRoot = path.resolve(__dirname, "../..");

test.describe("MVP-03 recordable manual position plan", () => {
  test("requires the exact stop and two-target plan accepted by the position writer", () => {
    expect(
      hasRecordableManualPositionPlan({
        stopLoss: "96.00",
        target1: "108.00",
        target2: 112,
      }),
    ).toBe(true);
    expect(
      hasRecordableManualPositionPlan({
        stopLoss: "96.00",
        target1: "108.00",
        target2: null,
      }),
    ).toBe(false);
    expect(
      hasRecordableManualPositionPlan({
        stopLoss: "$96.00",
        target1: "108.00",
        target2: "112.00",
      }),
    ).toBe(false);
  });

  test("blocks incomplete plans before and after latest-validation results", async () => {
    const tradeApp = await readFile(
      path.join(repositoryRoot, "app/trade-app.tsx"),
      "utf8",
    );

    expect(tradeApp).toContain("hasRecordableManualPositionPlan");
    expect(tradeApp).toContain("if (!addTradeGate.recordableManualPositionPlan)");
    expect(tradeApp).toContain("!addTradeGate.recordableManualPositionPlan ||");
  });
});
