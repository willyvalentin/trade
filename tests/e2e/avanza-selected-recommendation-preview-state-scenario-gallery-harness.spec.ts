import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  avanzaScenarioGalleryDefaultAccessDecision,
  buildAvanzaScenarioGalleryAccessDecision,
} from "../../lib/avanza-scenario-gallery-access";
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

const expectedScenarios = [
  {
    displayState: "no_selection",
    id: "no_selection",
    label: "No selected recommendation",
  },
  {
    displayState: "preview_ready_locked",
    id: "valid_buy",
    label: "Valid buy recommendation",
  },
  {
    displayState: "blocked",
    id: "non_buy_sell",
    label: "Non-buy sell recommendation",
  },
  {
    displayState: "blocked",
    id: "missing_ticker",
    label: "Missing ticker",
  },
  {
    displayState: "advisory",
    id: "missing_quantity",
    label: "Missing quantity",
  },
  {
    displayState: "advisory",
    id: "missing_price",
    label: "Missing price",
  },
  {
    displayState: "advisory",
    id: "missing_quantity_and_price",
    label: "Missing quantity and price",
  },
] as const;

const expectedAdapterScenarios = [
  {
    displayState: "preview_ready_locked",
    id: "valid_buy",
    label: "Valid buy selectedRecommendation",
  },
  {
    displayState: "blocked",
    id: "missing_ticker",
    label: "Missing ticker and symbol",
  },
  {
    displayState: "blocked",
    id: "non_buy_sell",
    label: "Non-buy selectedRecommendation",
  },
  {
    displayState: "advisory",
    id: "missing_price",
    label: "Missing entry or limit price",
  },
  {
    displayState: "advisory",
    id: "missing_quantity",
    label: "Missing suggested shares or quantity",
  },
  {
    displayState: "advisory",
    id: "missing_price_and_quantity",
    label: "Missing price and quantity",
  },
] as const;

function scenarioById(id: string) {
  const scenario = avanzaSelectedRecommendationPreviewStateScenarios.find(
    (item) => item.id === id,
  );

  if (!scenario) {
    throw new Error(`Missing scenario ${id}`);
  }

  return scenario;
}

function adapterScenarioById(id: string) {
  const scenario = avanzaSelectedRecommendationAdapterScenarios.find(
    (item) => item.id === id,
  );

  if (!scenario) {
    throw new Error(`Missing adapter scenario ${id}`);
  }

  return scenario;
}

test.describe("Avanza selected-recommendation preview state scenario gallery harness", () => {
  test("default disabled access renders disabled state only", () => {
    const source = readRepoFile(
      "components/execution/AvanzaSelectedRecommendationPreviewStateScenarioGalleryHarness.tsx",
    );
    const access = avanzaScenarioGalleryDefaultAccessDecision;

    expect(access.accessStatus).toBe("disabled");
    expect(access.canRenderGallery).toBe(false);
    expect(source).toContain("Scenario gallery access");
    expect(source).toContain("Scenario gallery is not rendered.");
    expect(source).toContain("access.accessStatus === \"dev_only_allowed\"");
    expect(source).toContain("access.canRenderGallery");
  });

  test("disabled access does not render scenario panels", () => {
    const source = readRepoFile(
      "components/execution/AvanzaSelectedRecommendationPreviewStateScenarioGalleryHarness.tsx",
    );

    expect(avanzaScenarioGalleryDefaultAccessDecision.canRenderGallery).toBe(false);
    expect(source).toContain("Scenario gallery is not rendered.");
    expect(source).toContain("Access is disabled or blocked");
    expect(source).toContain(
      "AvanzaSelectedRecommendationPreviewStateScenarioGallery",
    );
  });

  test("dev-only allowed access can render all fixture scenarios", () => {
    const access = buildAvanzaScenarioGalleryAccessDecision({
      devOnlyGalleryFlag: true,
    });
    const source = readRepoFile(
      "components/execution/AvanzaSelectedRecommendationPreviewStateScenarioGalleryHarness.tsx",
    );

    expect(access.accessStatus).toBe("dev_only_allowed");
    expect(access.canRenderGallery).toBe(true);
    expect(avanzaSelectedRecommendationPreviewStateScenarios).toHaveLength(7);
    expect(
      avanzaSelectedRecommendationPreviewStateScenarios.map((scenario) => ({
        displayState: scenario.previewState.displayState,
        id: scenario.id,
        label: scenario.label,
      })),
    ).toEqual(expectedScenarios);
    expect(source).toContain(
      "<AvanzaSelectedRecommendationPreviewStateScenarioGallery",
    );
    expect(source).toContain("scenarioGroups={scenarioGroups}");
    expect(source).toContain("Generic preview-state scenarios");
    expect(source).toContain("Adapter-based selectedRecommendation scenarios");
  });

  test("dev-only allowed fixture path covers every scenario label and expected display state", () => {
    const access = buildAvanzaScenarioGalleryAccessDecision({
      devOnlyGalleryFlag: true,
    });
    const gallerySource = readRepoFile(
      "components/execution/AvanzaSelectedRecommendationPreviewStateScenarioGallery.tsx",
    );

    expect(access.accessStatus).toBe("dev_only_allowed");
    expect(access.canRenderGallery).toBe(true);
    expect(gallerySource).toContain("scenario.label");
    expect(gallerySource).toContain("scenario.expectedDisplayState");

    for (const expected of expectedScenarios) {
      const scenario = scenarioById(expected.id);

      expect(scenario.label).toBe(expected.label);
      expect(scenario.expectedDisplayState).toBe(expected.displayState);
      expect(scenario.previewState.displayState).toBe(expected.displayState);
    }
  });

  test("dev-only allowed fixture path covers every adapter-based scenario", () => {
    const access = buildAvanzaScenarioGalleryAccessDecision({
      devOnlyGalleryFlag: true,
    });
    const harnessSource = readRepoFile(
      "components/execution/AvanzaSelectedRecommendationPreviewStateScenarioGalleryHarness.tsx",
    );
    const gallerySource = readRepoFile(
      "components/execution/AvanzaSelectedRecommendationPreviewStateScenarioGallery.tsx",
    );

    expect(access.accessStatus).toBe("dev_only_allowed");
    expect(access.canRenderGallery).toBe(true);
    expect(harnessSource).toContain("avanzaSelectedRecommendationAdapterScenarios");
    expect(harnessSource).toContain(
      "Adapter-based selectedRecommendation scenarios",
    );
    expect(gallerySource).toContain("group.scenarios.map");
    expect(
      avanzaSelectedRecommendationAdapterScenarios.map((scenario) => ({
        displayState: scenario.previewState.displayState,
        id: scenario.id,
        label: scenario.label,
      })),
    ).toEqual(expectedAdapterScenarios);
  });

  test("each scenario has the expected blocked/advisory/ready model details", () => {
    const noSelection = scenarioById("no_selection");
    const validBuy = scenarioById("valid_buy");
    const nonBuy = scenarioById("non_buy_sell");
    const missingTicker = scenarioById("missing_ticker");
    const missingQuantity = scenarioById("missing_quantity");
    const missingPrice = scenarioById("missing_price");
    const missingQuantityAndPrice = scenarioById("missing_quantity_and_price");

    expect(noSelection.previewState.displayState).toBe("no_selection");
    expect(noSelection.previewState.packagePreview).toBeNull();
    expect(noSelection.previewState.selectedRecommendationContract.status).toBe(
      "blocked",
    );

    expect(validBuy.previewState.displayState).toBe("preview_ready_locked");
    expect(validBuy.previewState.packagePreview?.blocked).toBe(false);
    expect(validBuy.previewState.eligibilitySummary.status).toBe("preview_ready");

    expect(nonBuy.previewState.displayState).toBe("blocked");
    expect(nonBuy.previewState.packagePreview?.blockedReason).toContain(
      "buy-only",
    );
    expect(missingTicker.previewState.displayState).toBe("blocked");
    expect(missingTicker.previewState.packagePreview?.blockedReason).toContain(
      "Missing ticker",
    );

    expect(missingQuantity.previewState.displayState).toBe("advisory");
    expect(missingQuantity.previewState.eligibilitySummary.status).toBe(
      "advisory_gaps",
    );
    expect(missingPrice.previewState.displayState).toBe("advisory");
    expect(missingPrice.previewState.eligibilitySummary.status).toBe(
      "advisory_gaps",
    );
    expect(missingQuantityAndPrice.previewState.displayState).toBe("advisory");
    expect(missingQuantityAndPrice.previewState.eligibilitySummary.status).toBe(
      "advisory_gaps",
    );
  });

  test("each adapter-based scenario has the expected blocked/advisory/ready model details", () => {
    const validBuy = adapterScenarioById("valid_buy");
    const nonBuy = adapterScenarioById("non_buy_sell");
    const missingTicker = adapterScenarioById("missing_ticker");
    const missingQuantity = adapterScenarioById("missing_quantity");
    const missingPrice = adapterScenarioById("missing_price");
    const missingQuantityAndPrice = adapterScenarioById(
      "missing_price_and_quantity",
    );

    expect(validBuy.previewState.displayState).toBe("preview_ready_locked");
    expect(validBuy.previewState.packagePreview?.blocked).toBe(false);
    expect(validBuy.previewState.eligibilitySummary.status).toBe(
      "preview_ready",
    );

    expect(nonBuy.previewState.displayState).toBe("blocked");
    expect(nonBuy.previewState.packagePreview?.blockedReason).toContain(
      "buy-only",
    );
    expect(missingTicker.previewState.displayState).toBe("blocked");
    expect(missingTicker.previewState.packagePreview?.blockedReason).toContain(
      "Missing ticker",
    );

    expect(missingQuantity.previewState.displayState).toBe("advisory");
    expect(missingQuantity.previewState.eligibilitySummary.status).toBe(
      "advisory_gaps",
    );
    expect(missingPrice.previewState.displayState).toBe("advisory");
    expect(missingPrice.previewState.eligibilitySummary.status).toBe(
      "advisory_gaps",
    );
    expect(missingQuantityAndPrice.previewState.displayState).toBe("advisory");
    expect(missingQuantityAndPrice.previewState.eligibilitySummary.status).toBe(
      "advisory_gaps",
    );
  });

  test("every scenario remains locked with total-read advisory and preview-only copy", () => {
    const panelSource = readRepoFile(
      "components/execution/AvanzaSelectedRecommendationPreviewStatePanel.tsx",
    );

    expect(panelSource).toContain("Not execution-ready");
    expect(panelSource).toContain("Preview only");
    expect(panelSource).toContain("Total-read unresolved/advisory");

    const allScenarios = [
      ...avanzaSelectedRecommendationPreviewStateScenarios,
      ...avanzaSelectedRecommendationAdapterScenarios,
    ];

    for (const scenario of allScenarios) {
      expect(scenario.previewState.preActivationGate.gateStatus, scenario.id).toBe(
        "locked",
      );
      expect(scenario.previewState.preActivationGate.label, scenario.id).toBe(
        "Pre-activation gate: Locked",
      );
      expect(scenario.previewState.preActivationGate.advisories).toContain(
        "Total-read unresolved/advisory",
      );
      expect(
        scenario.previewState.selectedRecommendationContract.totalReadStatus,
      ).toBe("unresolved_advisory");
      expect(scenario.previewState.sourceMode.executionAllowed).toBe(false);
    }
  });

  test("harness keeps fixture-only safety copy visible", () => {
    const source = readRepoFile(
      "components/execution/AvanzaSelectedRecommendationPreviewStateScenarioGalleryHarness.tsx",
    );

    expect(source).toContain("Fixture-only");
    expect(source).toContain("No real selected recommendation state");
    expect(source).toContain("No bridge calls");
    expect(source).toContain("No localhost fetch");
    expect(source).toContain("No execution");
  });

  test("harness is isolated from Trade UI and has no active controls", () => {
    const source = readRepoFile(
      "components/execution/AvanzaSelectedRecommendationPreviewStateScenarioGalleryHarness.tsx",
    );
    const tradeSource = readRepoFile("app/trade-app.tsx");

    expect(tradeSource).not.toContain(
      "AvanzaSelectedRecommendationPreviewStateScenarioGalleryHarness",
    );
    expect(source).not.toContain("<button");
    expect(source).not.toMatch(/onClick\s*=/);
    expect(source).not.toMatch(/href=/i);
  });

  test("harness source has no bridge, trigger, fill, or app-state behavior", () => {
    const source = readRepoFile(
      "components/execution/AvanzaSelectedRecommendationPreviewStateScenarioGalleryHarness.tsx",
    );

    expect(source).not.toMatch(/app\/trade-app|useState|useMemo/);
    expect(source).not.toMatch(/fetch\s*\(/);
    expect(source).not.toMatch(/127\.0\.0\.1/);
    expect(source).not.toMatch(/\/live-fill-only-runner\//);
    expect(source).not.toMatch(/fillQuantityField|fillPriceField|fillAmountField/);
    expect(source).not.toMatch(/FINAL LIVE EXECUTE ATTEMPT/);
    expect(source).not.toMatch(/method:\s*["']POST["']/);
    expect(source).not.toMatch(/localStorage|sessionStorage|cookie|BankID/i);
  });
});
