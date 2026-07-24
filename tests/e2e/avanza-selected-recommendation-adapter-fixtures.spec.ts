import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  avanzaSelectedRecommendationAdapterScenarios,
} from "../../lib/avanza-selected-recommendation-adapter-fixtures";

const repoRoot = process.cwd();

function readRepoFile(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

test.describe("Avanza selectedRecommendation adapter scenario fixtures", () => {
  test("every scenario builds through the adapter and preview-state builder", () => {
    const source = readRepoFile(
      "lib/avanza-selected-recommendation-adapter-fixtures.ts",
    );

    expect(source).toContain("adaptSelectedRecommendationToAvanzaHandoffSource");
    expect(source).toContain("buildAvanzaSelectedRecommendationPreviewState");
    expect(avanzaSelectedRecommendationAdapterScenarios).toHaveLength(6);
    expect(
      avanzaSelectedRecommendationAdapterScenarios.map((scenario) => scenario.id),
    ).toEqual([
      "valid_buy",
      "missing_ticker",
      "non_buy_sell",
      "missing_price",
      "missing_quantity",
      "missing_price_and_quantity",
    ]);
  });

  test("adapted fields carry selectedRecommendation values when present", () => {
    const validScenario = avanzaSelectedRecommendationAdapterScenarios.find(
      (scenario) => scenario.id === "valid_buy",
    );

    expect(validScenario?.rawSelectedRecommendation.id).toBe(
      "adapter-selected-gme-valid-buy",
    );
    expect(validScenario?.adaptedPreviewInput.recommendationId).toBe(
      "adapter-selected-gme-valid-buy",
    );
    expect(validScenario?.adaptedPreviewInput.ticker).toBe("GME");
    expect(validScenario?.adaptedPreviewInput.companyName).toBe("GameStop");
    expect(validScenario?.adaptedPreviewInput.direction).toBe("long");
    expect(validScenario?.adaptedPreviewInput.entryLowValue).toBe(21.5);
    expect(validScenario?.adaptedPreviewInput.entryHighValue).toBe(22.46);
    expect(validScenario?.adaptedPreviewInput.quantity).toBe(1);
    expect(validScenario?.previewState.packagePreview?.limitPrice).toBe("21.98");
  });

  test("expected display states match generated preview states", () => {
    for (const scenario of avanzaSelectedRecommendationAdapterScenarios) {
      expect(
        scenario.previewState.displayState,
        `${scenario.id} display state`,
      ).toBe(scenario.expectedDisplayState);
    }
  });

  test("blocked and advisory scenario behavior is preserved downstream", () => {
    const scenariosById = new Map(
      avanzaSelectedRecommendationAdapterScenarios.map((scenario) => [
        scenario.id,
        scenario,
      ]),
    );

    expect(scenariosById.get("missing_ticker")?.previewState.displayState).toBe(
      "blocked",
    );
    expect(
      scenariosById.get("missing_ticker")?.previewState.packagePreview
        ?.blockedReason,
    ).toContain("Missing ticker.");
    expect(scenariosById.get("non_buy_sell")?.previewState.displayState).toBe(
      "blocked",
    );
    expect(
      scenariosById.get("non_buy_sell")?.previewState.packagePreview
        ?.blockedReason,
    ).toContain("buy-only");
    expect(scenariosById.get("missing_price")?.previewState.displayState).toBe(
      "advisory",
    );
    expect(
      scenariosById.get("missing_quantity")?.previewState.displayState,
    ).toBe("advisory");
    expect(
      scenariosById.get("missing_price_and_quantity")?.previewState
        .displayState,
    ).toBe("advisory");
  });

  test("all scenario gates remain locked and total-read stays advisory", () => {
    for (const scenario of avanzaSelectedRecommendationAdapterScenarios) {
      const state = scenario.previewState;

      expect(state.preActivationGate.gateStatus, scenario.id).toBe("locked");
      expect(state.sourceMode.activeMode, scenario.id).toBe(
        "selected_recommendation_preview_only",
      );
      expect(state.sourceMode.executionAllowed, scenario.id).toBe(false);
      expect(state.selectedRecommendationContract.totalReadStatus).toBe(
        "unresolved_advisory",
      );
      expect(state.preActivationGate.advisories).toContain(
        "Total-read unresolved/advisory",
      );
      expect(JSON.stringify(state), scenario.id).not.toContain(
        '"executionAllowed":true',
      );
      expect(JSON.stringify(state), scenario.id).not.toMatch(/production ready/i);
    }
  });

  test("fixtures are pure and contain no bridge, trigger, fill, or storage behavior", () => {
    const source = readRepoFile(
      "lib/avanza-selected-recommendation-adapter-fixtures.ts",
    );

    expect(source).not.toMatch(/app\/trade-app|useState|useMemo|from ["']react["']/);
    expect(source).not.toMatch(/fetch\s*\(/);
    expect(source).not.toMatch(/localhost|127\.0\.0\.1/);
    expect(source).not.toMatch(/\/live-fill-only-runner\//);
    expect(source).not.toMatch(/fillQuantityField|fillPriceField|fillAmountField/);
    expect(source).not.toMatch(/FINAL LIVE EXECUTE ATTEMPT/);
    expect(source).not.toMatch(/method:\s*["']POST["']/);
    expect(source).not.toMatch(/localStorage|sessionStorage|cookie|BankID/i);
  });
});
