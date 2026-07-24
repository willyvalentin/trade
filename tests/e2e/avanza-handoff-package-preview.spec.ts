import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  buildAvanzaHandoffPackagePreview,
} from "../../lib/avanza-handoff-package-preview";
import type {
  AvanzaBridgeReadinessSummary,
} from "../../lib/avanza-bridge-readiness-checklist";

const repoRoot = process.cwd();

const readinessSummaryFixture: AvanzaBridgeReadinessSummary = {
  advisory_count: 1,
  blocked_count: 0,
  label: "Ready for read-only observation",
  ready_count: 11,
  severity: "warning",
  shortCopy:
    "Bridge checks are ready for read-only observation. Total-read remains advisory.",
  status: "ready_for_read_only_observation",
  unknown_count: 0,
};

function readRepoFile(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

test.describe("Avanza handoff package preview builder", () => {
  test("valid buy recommendation builds preview package", () => {
    const preview = buildAvanzaHandoffPackagePreview({
      accountDisplayName: "Valentin Labs KF",
      companyName: "GameStop Corp.",
      instrumentDisplayName: "GameStop",
      limitPrice: "21,98",
      orderMode: "Avancerad/Limit",
      quantity: 1,
      quantityStrategy: "quantity_based",
      readinessSummary: readinessSummaryFixture,
      recommendationId: "rec-gme-1",
      side: "buy",
      stopBoundary: "before Granska köp",
      ticker: "gme",
    });

    expect(preview.blocked).toBe(false);
    expect(preview.previewId).toBe("avanza-handoff-preview:rec-gme-1:GME");
    expect(preview.actionLabel).toBe("Prepare Avanza handoff");
    expect(preview.ticker).toBe("GME");
    expect(preview.side).toBe("buy");
    expect(preview.quantityStrategy).toBe("quantity_based");
    expect(preview.quantity).toBe("1");
    expect(preview.limitPrice).toBe("21,98");
    expect(preview.accountDisplayLabel).toBe("Valentin Labs KF");
    expect(preview.orderMode).toBe("Avancerad/Limit");
    expect(preview.boundary).toBe("before Granska köp");
    expect(preview.manualReviewRequired).toBe(true);
    expect(preview.totalReadStatus).toBe("unresolved_advisory");
    expect(preview.readinessSummaryStatus).toBe(
      "ready_for_read_only_observation",
    );
  });

  test("sell or short side is blocked for current buy-only POC", () => {
    for (const side of ["sell", "short", "unknown"] as const) {
      const preview = buildAvanzaHandoffPackagePreview({
        limitPrice: "21,98",
        quantity: 1,
        readinessSummary: readinessSummaryFixture,
        recommendationId: `rec-${side}`,
        side,
        ticker: "GME",
      });

      expect(preview.blocked).toBe(true);
      expect(preview.blockedReason).toContain("buy-only");
      expect(preview.side).toBe("buy");
    }
  });

  test("missing ticker blocks the package preview", () => {
    const preview = buildAvanzaHandoffPackagePreview({
      limitPrice: "21,98",
      quantity: 1,
      readinessSummary: readinessSummaryFixture,
      recommendationId: "rec-missing-ticker",
      side: "buy",
      ticker: "",
    });

    expect(preview.blocked).toBe(true);
    expect(preview.blockedReason).toContain("Missing ticker");
    expect(preview.previewId).toContain("missing-ticker");
  });

  test("missing price and quantity are advisory while total-read remains advisory", () => {
    const preview = buildAvanzaHandoffPackagePreview({
      readinessSummary: readinessSummaryFixture,
      recommendationId: "rec-advisory",
      side: "buy",
      ticker: "GME",
    });

    expect(preview.blocked).toBe(false);
    expect(preview.quantity).toBeNull();
    expect(preview.limitPrice).toBeNull();
    expect(preview.advisoryNotes).toContain(
      "Quantity is missing and must be resolved before handoff.",
    );
    expect(preview.advisoryNotes).toContain(
      "Limit price is missing and must be resolved before handoff.",
    );
    expect(preview.totalReadStatus).toBe("unresolved_advisory");
    expect(preview.advisoryNotes).toContain("Total-read unresolved/advisory.");
  });

  test("helper is pure and contains no live bridge, trigger, or fill behavior", () => {
    const source = readRepoFile("lib/avanza-handoff-package-preview.ts");

    expect(source).not.toMatch(/fetch\s*\(/);
    expect(source).not.toMatch(/localhost|127\.0\.0\.1/);
    expect(source).not.toMatch(/\/live-fill-only-runner\//);
    expect(source).not.toMatch(/fillQuantityField|fillPriceField|fillAmountField/);
    expect(source).not.toMatch(/FINAL LIVE EXECUTE ATTEMPT/);
    expect(source).not.toMatch(/method:\s*["']POST["']/);
    expect(source).not.toMatch(/Supabase|insert|update|upsert/);
  });
});
