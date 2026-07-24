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

test.describe("Avanza selected-recommendation preview state fixtures", () => {
  test("every scenario is built through the preview state builder", () => {
    const source = readRepoFile(
      "lib/avanza-selected-recommendation-preview-state-fixtures.ts",
    );

    expect(source).toContain("buildAvanzaSelectedRecommendationPreviewState");
    expect(avanzaSelectedRecommendationPreviewStateScenarios).toHaveLength(7);
    expect(
      avanzaSelectedRecommendationPreviewStateScenarios.map(
        (scenario) => scenario.id,
      ),
    ).toEqual([
      "no_selection",
      "valid_buy",
      "non_buy_sell",
      "missing_ticker",
      "missing_quantity",
      "missing_price",
      "missing_quantity_and_price",
    ]);
  });

  test("scenario display states match expectations", () => {
    for (const scenario of avanzaSelectedRecommendationPreviewStateScenarios) {
      expect(
        scenario.previewState.displayState,
        `${scenario.id} display state`,
      ).toBe(scenario.expectedDisplayState);
    }
  });

  test("no selection scenario is blocked without a package preview", () => {
    const scenario = avanzaSelectedRecommendationPreviewStateScenarios.find(
      (item) => item.id === "no_selection",
    );

    expect(scenario?.previewState.displayState).toBe("no_selection");
    expect(scenario?.previewState.packagePreview).toBeNull();
    expect(scenario?.previewState.selectedRecommendationContract.status).toBe(
      "blocked",
    );
  });

  test("valid buy scenario is preview-ready locked", () => {
    const scenario = avanzaSelectedRecommendationPreviewStateScenarios.find(
      (item) => item.id === "valid_buy",
    );

    expect(scenario?.previewState.displayState).toBe("preview_ready_locked");
    expect(scenario?.previewState.packagePreview?.ticker).toBe("GME");
    expect(scenario?.previewState.packagePreview?.quantity).toBe("1");
    expect(scenario?.previewState.packagePreview?.limitPrice).toBe("21.98");
    expect(scenario?.previewState.packagePreview?.blocked).toBe(false);
  });

  test("blocked and advisory scenarios expose expected states", () => {
    const scenariosById = new Map(
      avanzaSelectedRecommendationPreviewStateScenarios.map((scenario) => [
        scenario.id,
        scenario,
      ]),
    );

    expect(scenariosById.get("non_buy_sell")?.previewState.displayState).toBe(
      "blocked",
    );
    expect(scenariosById.get("missing_ticker")?.previewState.displayState).toBe(
      "blocked",
    );
    expect(
      scenariosById.get("missing_quantity")?.previewState.displayState,
    ).toBe("advisory");
    expect(scenariosById.get("missing_price")?.previewState.displayState).toBe(
      "advisory",
    );
    expect(
      scenariosById.get("missing_quantity_and_price")?.previewState.displayState,
    ).toBe("advisory");
  });

  test("all scenario gates remain locked and total-read stays advisory", () => {
    for (const scenario of avanzaSelectedRecommendationPreviewStateScenarios) {
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
      "lib/avanza-selected-recommendation-preview-state-fixtures.ts",
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
