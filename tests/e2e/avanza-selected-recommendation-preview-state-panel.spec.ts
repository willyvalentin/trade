import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  avanzaSelectedRecommendationPreviewStateScenarios,
} from "../../lib/avanza-selected-recommendation-preview-state-fixtures";

const repoRoot = process.cwd();

function readRepoFile(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

function scenarioById(id: string) {
  const scenario = avanzaSelectedRecommendationPreviewStateScenarios.find(
    (item) => item.id === id,
  );

  if (!scenario) {
    throw new Error(`Missing scenario ${id}`);
  }

  return scenario;
}

test.describe("Avanza selected-recommendation preview state panel", () => {
  test("renders no selection fixture state", () => {
    const source = readRepoFile(
      "components/execution/AvanzaSelectedRecommendationPreviewStatePanel.tsx",
    );
    const scenario = scenarioById("no_selection");

    expect(scenario.previewState.displayState).toBe("no_selection");
    expect(scenario.previewState.packagePreview).toBeNull();
    expect(scenario.previewState.eligibilitySummary.label).toBe(
      "Handoff preview blocked",
    );
    expect(source).toContain("Display state:");
    expect(source).toContain("No package preview is available");
    expect(source).toContain("previewState.preActivationGate.label");
    expect(source).toContain("previewState.selectedRecommendationContract.items");
  });

  test("renders valid buy fixture state", () => {
    const source = readRepoFile(
      "components/execution/AvanzaSelectedRecommendationPreviewStatePanel.tsx",
    );
    const scenario = scenarioById("valid_buy");

    expect(scenario.previewState.displayState).toBe("preview_ready_locked");
    expect(scenario.previewState.packagePreview?.ticker).toBe("GME");
    expect(scenario.previewState.packagePreview?.instrumentDisplayName).toBe(
      "GameStop",
    );
    expect(scenario.previewState.packagePreview?.quantityStrategy).toBe(
      "quantity_based",
    );
    expect(scenario.previewState.packagePreview?.limitPrice).toBe("21.98");
    expect(scenario.previewState.eligibilitySummary.label).toBe(
      "Handoff preview ready",
    );
    expect(source).toContain("previewState.packagePreview.ticker");
    expect(source).toContain("previewState.packagePreview.instrumentDisplayName");
    expect(source).toContain("previewState.packagePreview.quantityStrategy");
    expect(source).toContain("previewState.packagePreview.limitPrice");
  });

  test("renders non-buy and missing ticker as blocked", () => {
    const source = readRepoFile(
      "components/execution/AvanzaSelectedRecommendationPreviewStatePanel.tsx",
    );
    const nonBuy = scenarioById("non_buy_sell");
    const missingTicker = scenarioById("missing_ticker");

    expect(nonBuy.previewState.displayState).toBe("blocked");
    expect(missingTicker.previewState.displayState).toBe("blocked");
    expect(
      nonBuy.previewState.selectedRecommendationContract.items,
    ).toContainEqual(
      expect.objectContaining({ id: "buy_side_only", status: "blocked" }),
    );
    expect(
      missingTicker.previewState.selectedRecommendationContract.items,
    ).toContainEqual(
      expect.objectContaining({ id: "ticker_present", status: "blocked" }),
    );
    expect(source).toContain("blockedItems");
    expect(source).toContain("Key blockers/advisories");
  });

  test("renders missing quantity and missing price as advisory", () => {
    const source = readRepoFile(
      "components/execution/AvanzaSelectedRecommendationPreviewStatePanel.tsx",
    );
    const missingQuantity = scenarioById("missing_quantity");
    const missingPrice = scenarioById("missing_price");

    expect(missingQuantity.previewState.displayState).toBe("advisory");
    expect(missingPrice.previewState.displayState).toBe("advisory");
    expect(
      missingQuantity.previewState.selectedRecommendationContract.items,
    ).toContainEqual(
      expect.objectContaining({
        id: "quantity_or_position_size_present",
        status: "advisory",
      }),
    );
    expect(
      missingPrice.previewState.selectedRecommendationContract.items,
    ).toContainEqual(
      expect.objectContaining({
        id: "entry_or_limit_price_present",
        status: "advisory",
      }),
    );
    expect(source).toContain("Total-read unresolved/advisory");
  });

  test("all scenario renders keep locked gate and no active controls", () => {
    const source = readRepoFile(
      "components/execution/AvanzaSelectedRecommendationPreviewStatePanel.tsx",
    );

    for (const scenario of avanzaSelectedRecommendationPreviewStateScenarios) {
      expect(scenario.previewState.preActivationGate.gateStatus).toBe("locked");
      expect(scenario.previewState.sourceMode.executionAllowed).toBe(false);
    }

    expect(source).toContain("Preview only");
    expect(source).toContain("Not execution-ready");
    expect(source).toContain("No active handoff button");
    expect(source).not.toContain("<button");
    expect(source).not.toMatch(/href=/i);
  });

  test("component source has no bridge, trigger, fill, or app-state behavior", () => {
    const source = readRepoFile(
      "components/execution/AvanzaSelectedRecommendationPreviewStatePanel.tsx",
    );

    expect(source).not.toMatch(/app\/trade-app|useState|useMemo/);
    expect(source).not.toMatch(/fetch\s*\(/);
    expect(source).not.toMatch(/localhost|127\.0\.0\.1/);
    expect(source).not.toMatch(/\/live-fill-only-runner\//);
    expect(source).not.toMatch(/fillQuantityField|fillPriceField|fillAmountField/);
    expect(source).not.toMatch(/FINAL LIVE EXECUTE ATTEMPT/);
    expect(source).not.toMatch(/method:\s*["']POST["']/);
    expect(source).not.toMatch(/localStorage|sessionStorage|cookie|BankID/i);
    expect(source).not.toMatch(/onClick\s*=/);
  });
});
