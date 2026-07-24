import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  avanzaHandoffPreviewSourceModes,
} from "../../lib/avanza-handoff-preview-source-mode";
import {
  avanzaTradeReadOnlyReadinessSummaryFixture,
} from "../../lib/avanza-read-only-readiness-fixtures";
import {
  adaptSelectedRecommendationToAvanzaHandoffSource,
  type AvanzaSelectedRecommendationAdapterInput,
} from "../../lib/avanza-selected-recommendation-adapter";
import {
  buildAvanzaSelectedRecommendationPreviewState,
} from "../../lib/avanza-selected-recommendation-preview-state";

const repoRoot = process.cwd();

function readRepoFile(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

function buildPreviewStateFromSelectedRecommendation(
  selectedRecommendation: AvanzaSelectedRecommendationAdapterInput,
  options: Parameters<
    typeof adaptSelectedRecommendationToAvanzaHandoffSource
  >[1] = {},
) {
  return buildAvanzaSelectedRecommendationPreviewState({
    accountDisplayName: "Valentin Labs KF",
    orderMode: "Avancerad/Limit",
    readinessSummary: avanzaTradeReadOnlyReadinessSummaryFixture,
    selectedRecommendation: adaptSelectedRecommendationToAvanzaHandoffSource(
      selectedRecommendation,
      options,
    ),
    sourceMode:
      avanzaHandoffPreviewSourceModes.selected_recommendation_preview_only,
  });
}

test.describe("Avanza selectedRecommendation adapter", () => {
  test("maps the Trade UI selectedRecommendation shape into preview input", () => {
    const previewState = buildPreviewStateFromSelectedRecommendation(
      {
        companyName: "GameStop",
        confidenceLabel: "High",
        confidenceScore: 82,
        direction: "Long",
        entryHighValue: 22.46,
        entryLowValue: 21.5,
        id: "rec-gme-selected",
        setupType: "Breakout",
        ticker: "GME",
      },
      {
        positionSizing: {
          suggestedShares: 1,
        },
      },
    );

    expect(previewState.displayState).toBe("preview_ready_locked");
    expect(previewState.packagePreview?.recommendationId).toBe(
      "rec-gme-selected",
    );
    expect(previewState.packagePreview?.ticker).toBe("GME");
    expect(previewState.packagePreview?.companyName).toBe("GameStop");
    expect(previewState.packagePreview?.instrumentDisplayName).toBe("GameStop");
    expect(previewState.packagePreview?.quantity).toBe("1");
    expect(previewState.packagePreview?.limitPrice).toBe("21.98");
    expect(previewState.packagePreview?.accountDisplayLabel).toBe(
      "Valentin Labs KF",
    );
    expect(previewState.packagePreview?.orderMode).toBe("Avancerad/Limit");
    expect(previewState.packagePreview?.boundary).toBe("before Granska köp");
    expect(previewState.packagePreview?.totalReadStatus).toBe(
      "unresolved_advisory",
    );
    expect(previewState.preActivationGate.gateStatus).toBe("locked");
  });

  test("maps symbol fallback when ticker is absent", () => {
    const source = adaptSelectedRecommendationToAvanzaHandoffSource({
      companyName: "GameStop",
      direction: "Long",
      id: "rec-symbol",
      symbol: "GME",
    });

    expect(source.ticker).toBe("GME");
  });

  test("missing ticker maps safely and blocks downstream", () => {
    const previewState = buildPreviewStateFromSelectedRecommendation({
      companyName: "GameStop",
      direction: "Long",
      entryPriceValue: 21.98,
      id: "rec-missing-ticker",
      quantity: 1,
      ticker: "",
    });

    expect(previewState.displayState).toBe("blocked");
    expect(previewState.packagePreview?.blocked).toBe(true);
    expect(previewState.packagePreview?.blockedReason).toContain(
      "Missing ticker.",
    );
  });

  test("missing price remains advisory downstream", () => {
    const previewState = buildPreviewStateFromSelectedRecommendation({
      companyName: "GameStop",
      direction: "Long",
      id: "rec-missing-price",
      quantity: 1,
      ticker: "GME",
    });

    expect(previewState.displayState).toBe("advisory");
    expect(previewState.eligibilitySummary.status).toBe("advisory_gaps");
    expect(previewState.packagePreview?.advisoryNotes).toContain(
      "Limit price is missing and must be resolved before handoff.",
    );
  });

  test("missing quantity remains advisory downstream", () => {
    const previewState = buildPreviewStateFromSelectedRecommendation({
      companyName: "GameStop",
      direction: "Long",
      entryPriceValue: 21.98,
      id: "rec-missing-quantity",
      ticker: "GME",
    });

    expect(previewState.displayState).toBe("advisory");
    expect(previewState.eligibilitySummary.status).toBe("advisory_gaps");
    expect(previewState.packagePreview?.advisoryNotes).toContain(
      "Quantity is missing and must be resolved before handoff.",
    );
  });

  test("non-buy side blocks downstream when represented", () => {
    const previewState = buildPreviewStateFromSelectedRecommendation({
      companyName: "GameStop",
      direction: "Short",
      entryPriceValue: 21.98,
      id: "rec-short",
      quantity: 1,
      ticker: "GME",
    });

    expect(previewState.displayState).toBe("blocked");
    expect(previewState.packagePreview?.blocked).toBe(true);
    expect(previewState.packagePreview?.blockedReason).toContain("buy-only");
  });

  test("adapter is pure and contains no bridge, trigger, fill, storage, or app-state behavior", () => {
    const source = readRepoFile(
      "lib/avanza-selected-recommendation-adapter.ts",
    );

    expect(source).not.toMatch(/from\s+["'][^"']*app\/trade-app/);
    expect(source).not.toMatch(/React|useState|useMemo|useEffect/);
    expect(source).not.toMatch(/fetch\s*\(/);
    expect(source).not.toMatch(/localhost|127\.0\.0\.1/);
    expect(source).not.toMatch(/\/live-fill-only-runner\//);
    expect(source).not.toMatch(/fillQuantityField|fillPriceField|fillAmountField/);
    expect(source).not.toMatch(/FINAL LIVE EXECUTE ATTEMPT/);
    expect(source).not.toMatch(/method:\s*["']POST["']/);
    expect(source).not.toMatch(/localStorage|sessionStorage|cookie|BankID/i);
  });
});
