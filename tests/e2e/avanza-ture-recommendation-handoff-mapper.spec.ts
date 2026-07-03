import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  buildAvanzaHandoffPackagePreview,
} from "../../lib/avanza-handoff-package-preview";
import {
  mapTureRecommendationToAvanzaHandoffInput,
} from "../../lib/avanza-ture-recommendation-handoff-mapper";
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

test.describe("Ture recommendation to Avanza handoff mapper", () => {
  test("maps a valid Ture recommendation to preview input", () => {
    const input = mapTureRecommendationToAvanzaHandoffInput(
      {
        companyName: "GameStop",
        direction: "Long",
        entryPriceValue: 21.98,
        id: "rec-gme-map",
        positionSizeValue: 1,
        ticker: "gme",
      },
      { readinessSummary: readinessSummaryFixture },
    );
    const preview = buildAvanzaHandoffPackagePreview(input);

    expect(input.recommendationId).toBe("rec-gme-map");
    expect(input.ticker).toBe("gme");
    expect(input.companyName).toBe("GameStop");
    expect(input.instrumentDisplayName).toBe("GameStop");
    expect(input.side).toBe("buy");
    expect(input.quantityStrategy).toBe("quantity_based");
    expect(input.quantity).toBe(1);
    expect(input.limitPrice).toBe(21.98);
    expect(input.accountDisplayName).toBe("Valentin Labs KF");
    expect(input.orderMode).toBe("Avancerad/Limit");
    expect(input.stopBoundary).toBe("before Granska köp");
    expect(preview.blocked).toBe(false);
    expect(preview.totalReadStatus).toBe("unresolved_advisory");
  });

  test("maps entry range midpoint when explicit entry price is missing", () => {
    const input = mapTureRecommendationToAvanzaHandoffInput(
      {
        company_name: "GameStop",
        direction: "long",
        entryHighValue: 22,
        entryLowValue: 20,
        id: "rec-midpoint",
        quantity: "1",
        ticker: "GME",
      },
      { readinessSummary: readinessSummaryFixture },
    );

    expect(input.limitPrice).toBe(21);
    expect(input.quantity).toBe("1");
    expect(input.companyName).toBe("GameStop");
  });

  test("missing price remains advisory through preview builder", () => {
    const input = mapTureRecommendationToAvanzaHandoffInput(
      {
        direction: "long",
        id: "rec-no-price",
        quantity: 1,
        ticker: "GME",
      },
      { readinessSummary: readinessSummaryFixture },
    );
    const preview = buildAvanzaHandoffPackagePreview(input);

    expect(input.limitPrice).toBeNull();
    expect(preview.blocked).toBe(false);
    expect(preview.advisoryNotes).toContain(
      "Limit price is missing and must be resolved before handoff.",
    );
  });

  test("missing quantity remains advisory through preview builder", () => {
    const input = mapTureRecommendationToAvanzaHandoffInput(
      {
        direction: "long",
        entryPriceValue: 21.98,
        id: "rec-no-quantity",
        ticker: "GME",
      },
      { readinessSummary: readinessSummaryFixture },
    );
    const preview = buildAvanzaHandoffPackagePreview(input);

    expect(input.quantity).toBeNull();
    expect(preview.blocked).toBe(false);
    expect(preview.advisoryNotes).toContain(
      "Quantity is missing and must be resolved before handoff.",
    );
  });

  test("non-buy side is blocked through preview builder", () => {
    const input = mapTureRecommendationToAvanzaHandoffInput(
      {
        direction: "short",
        entryPriceValue: 21.98,
        id: "rec-short",
        quantity: 1,
        ticker: "GME",
      },
      { readinessSummary: readinessSummaryFixture },
    );
    const preview = buildAvanzaHandoffPackagePreview(input);

    expect(input.side).toBe("short");
    expect(preview.blocked).toBe(true);
    expect(preview.blockedReason).toContain("buy-only");
  });

  test("mapper is pure and contains no live bridge, trigger, fill, or storage behavior", () => {
    const source = readRepoFile(
      "lib/avanza-ture-recommendation-handoff-mapper.ts",
    );

    expect(source).not.toMatch(/fetch\s*\(/);
    expect(source).not.toMatch(/localhost|127\.0\.0\.1/);
    expect(source).not.toMatch(/\/live-fill-only-runner\//);
    expect(source).not.toMatch(/fillQuantityField|fillPriceField|fillAmountField/);
    expect(source).not.toMatch(/FINAL LIVE EXECUTE ATTEMPT/);
    expect(source).not.toMatch(/method:\s*["']POST["']/);
    expect(source).not.toMatch(/localStorage|sessionStorage|cookie|BankID/i);
  });
});
