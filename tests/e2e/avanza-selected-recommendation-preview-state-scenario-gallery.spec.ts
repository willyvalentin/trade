import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  avanzaSelectedRecommendationAdapterScenarios,
} from "../../lib/avanza-selected-recommendation-adapter-fixtures";
import {
  avanzaSelectedRecommendationPreviewStateScenarios,
} from "../../lib/avanza-selected-recommendation-preview-state-fixtures";

const repoRoot = process.cwd();

function readRepoFile(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

test.describe("Avanza selected-recommendation preview state scenario gallery", () => {
  test("gallery source renders scenario labels, expected states, and preview panels", () => {
    const source = readRepoFile(
      "components/execution/AvanzaSelectedRecommendationPreviewStateScenarioGallery.tsx",
    );

    expect(source).toContain("Fixture-only preview scenarios");
    expect(source).toContain("Not connected to real selected recommendation state");
    expect(source).toContain("No bridge calls");
    expect(source).toContain("No execution");
    expect(source).toContain("scenarios.map");
    expect(source).toContain("scenarioGroups");
    expect(source).toContain("group.label");
    expect(source).toContain("scenario.label");
    expect(source).toContain("scenario.expectedDisplayState");
    expect(source).toContain("AvanzaSelectedRecommendationPreviewStatePanel");
  });

  test("all scenario labels and expected display states are available to the gallery", () => {
    expect(
      avanzaSelectedRecommendationPreviewStateScenarios.map(
        (scenario) => scenario.label,
      ),
    ).toEqual([
      "No selected recommendation",
      "Valid buy recommendation",
      "Non-buy sell recommendation",
      "Missing ticker",
      "Missing quantity",
      "Missing price",
      "Missing quantity and price",
    ]);

    expect(
      avanzaSelectedRecommendationPreviewStateScenarios.map((scenario) => [
        scenario.id,
        scenario.expectedDisplayState,
        scenario.previewState.displayState,
      ]),
    ).toEqual([
      ["no_selection", "no_selection", "no_selection"],
      ["valid_buy", "preview_ready_locked", "preview_ready_locked"],
      ["non_buy_sell", "blocked", "blocked"],
      ["missing_ticker", "blocked", "blocked"],
      ["missing_quantity", "advisory", "advisory"],
      ["missing_price", "advisory", "advisory"],
      ["missing_quantity_and_price", "advisory", "advisory"],
    ]);
  });

  test("adapter-based scenario labels and expected display states are available to the gallery", () => {
    expect(
      avanzaSelectedRecommendationAdapterScenarios.map((scenario) => [
        scenario.id,
        scenario.label,
        scenario.expectedDisplayState,
        scenario.previewState.displayState,
      ]),
    ).toEqual([
      [
        "valid_buy",
        "Valid buy selectedRecommendation",
        "preview_ready_locked",
        "preview_ready_locked",
      ],
      ["missing_ticker", "Missing ticker and symbol", "blocked", "blocked"],
      ["non_buy_sell", "Non-buy selectedRecommendation", "blocked", "blocked"],
      [
        "missing_price",
        "Missing entry or limit price",
        "advisory",
        "advisory",
      ],
      [
        "missing_quantity",
        "Missing suggested shares or quantity",
        "advisory",
        "advisory",
      ],
      [
        "missing_price_and_quantity",
        "Missing price and quantity",
        "advisory",
        "advisory",
      ],
    ]);
  });

  test("scenario states cover locked no-selection, blocked, advisory, and preview-ready cases", () => {
    const scenariosById = new Map(
      avanzaSelectedRecommendationPreviewStateScenarios.map((scenario) => [
        scenario.id,
        scenario,
      ]),
    );

    expect(scenariosById.get("no_selection")?.previewState.packagePreview).toBeNull();
    expect(scenariosById.get("no_selection")?.previewState.preActivationGate.gateStatus).toBe(
      "locked",
    );
    expect(scenariosById.get("valid_buy")?.previewState.displayState).toBe(
      "preview_ready_locked",
    );
    expect(scenariosById.get("non_buy_sell")?.previewState.displayState).toBe(
      "blocked",
    );
    expect(scenariosById.get("missing_ticker")?.previewState.displayState).toBe(
      "blocked",
    );
    expect(scenariosById.get("missing_quantity")?.previewState.displayState).toBe(
      "advisory",
    );
    expect(scenariosById.get("missing_price")?.previewState.displayState).toBe(
      "advisory",
    );
  });

  test("all gallery scenario gates remain locked and total-read advisory", () => {
    const allScenarios = [
      ...avanzaSelectedRecommendationPreviewStateScenarios,
      ...avanzaSelectedRecommendationAdapterScenarios,
    ];

    for (const scenario of allScenarios) {
      expect(scenario.previewState.preActivationGate.gateStatus, scenario.id).toBe(
        "locked",
      );
      expect(scenario.previewState.sourceMode.executionAllowed, scenario.id).toBe(
        false,
      );
      expect(
        scenario.previewState.selectedRecommendationContract.totalReadStatus,
        scenario.id,
      ).toBe("unresolved_advisory");
      expect(scenario.previewState.preActivationGate.advisories).toContain(
        "Total-read unresolved/advisory",
      );
    }
  });

  test("gallery is isolated from Trade UI and has no active controls", () => {
    const source = readRepoFile(
      "components/execution/AvanzaSelectedRecommendationPreviewStateScenarioGallery.tsx",
    );
    const tradeSource = readRepoFile("app/trade-app.tsx");

    expect(tradeSource).not.toContain(
      "AvanzaSelectedRecommendationPreviewStateScenarioGallery",
    );
    expect(source).not.toContain("<button");
    expect(source).not.toMatch(/onClick\s*=/);
    expect(source).not.toMatch(/href=/i);
  });

  test("gallery source has no bridge, trigger, fill, or app-state behavior", () => {
    const source = readRepoFile(
      "components/execution/AvanzaSelectedRecommendationPreviewStateScenarioGallery.tsx",
    );

    expect(source).not.toMatch(/app\/trade-app|useState|useMemo/);
    expect(source).not.toMatch(/fetch\s*\(/);
    expect(source).not.toMatch(/localhost|127\.0\.0\.1/);
    expect(source).not.toMatch(/\/live-fill-only-runner\//);
    expect(source).not.toMatch(/fillQuantityField|fillPriceField|fillAmountField/);
    expect(source).not.toMatch(/FINAL LIVE EXECUTE ATTEMPT/);
    expect(source).not.toMatch(/method:\s*["']POST["']/);
    expect(source).not.toMatch(/localStorage|sessionStorage|cookie|BankID/i);
  });
});
