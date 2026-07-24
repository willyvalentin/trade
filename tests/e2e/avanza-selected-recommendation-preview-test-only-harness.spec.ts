import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  avanzaDevPreviewFlagDefaultConfig,
  avanzaDevPreviewFlagExplicitTestFixtureConfig,
} from "../../lib/avanza-dev-preview-flag-config";
import {
  buildAvanzaDevOnlyPreviewEnablementState,
} from "../../lib/avanza-dev-only-preview-enablement-state";
import {
  avanzaSelectedRecommendationAdapterScenarios,
} from "../../lib/avanza-selected-recommendation-adapter-fixtures";
import {
  buildAvanzaPreviewStateFromSelectedRecommendation,
} from "../../lib/avanza-selected-recommendation-derived-preview-state";
import {
  avanzaHandoffPreviewSourceModes,
} from "../../lib/avanza-handoff-preview-source-mode";

const repoRoot = process.cwd();

function readRepoFile(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

function scenarioById(id: string) {
  const scenario = avanzaSelectedRecommendationAdapterScenarios.find(
    (item) => item.id === id,
  );

  if (!scenario) {
    throw new Error(`Missing scenario ${id}`);
  }

  return scenario;
}

test.describe("Avanza selectedRecommendation test-only preview config harness", () => {
  test("default preview config cannot render selectedRecommendation preview", () => {
    const state = buildAvanzaDevOnlyPreviewEnablementState({
      previewFlagConfig: avanzaDevPreviewFlagDefaultConfig,
    });

    expect(state.overallStatus).toBe("disabled");
    expect(state.previewFlagConfig.explicitPreviewOnlyFlag).toBe(false);
    expect(state.canRenderSelectedRecommendationPreview).toBe(false);
    expect(state.canCallBridge).toBe(false);
    expect(state.canFetchLocalhost).toBe(false);
    expect(state.canExecute).toBe(false);
  });

  test("explicit test-only config can produce preview_only_allowed and render passive selectedRecommendation preview state", () => {
    const scenario = scenarioById("valid_buy");
    const state = buildAvanzaDevOnlyPreviewEnablementState({
      previewFlagConfig: avanzaDevPreviewFlagExplicitTestFixtureConfig,
    });
    const previewState = buildAvanzaPreviewStateFromSelectedRecommendation({
      adapterOptions: scenario.adapterOptions,
      selectedRecommendation: scenario.rawSelectedRecommendation,
      sourceMode:
        avanzaHandoffPreviewSourceModes.selected_recommendation_preview_only,
    });

    expect(state.overallStatus).toBe("candidate_for_dev_preview");
    expect(state.previewFlagConfig.explicitPreviewOnlyFlag).toBe(true);
    expect(state.previewFlagConfig.environmentScope).toBe("dev_test_only");
    expect(state.previewFlagConfig.source).toBe("explicit_test_fixture");
    expect(state.integrationGuard.status).toBe("preview_only_allowed");
    expect(state.canRenderSelectedRecommendationPreview).toBe(true);
    expect(state.canCallBridge).toBe(false);
    expect(state.canFetchLocalhost).toBe(false);
    expect(state.canExecute).toBe(false);
    expect(scenario.rawSelectedRecommendation.ticker).toBe("GME");
    expect(scenario.rawSelectedRecommendation.companyName).toBe("GameStop");
    expect(scenario.adapterOptions?.positionSizing?.suggestedShares).toBe(1);
    expect(previewState.displayState).toBe("preview_ready_locked");
    expect(previewState.packagePreview?.ticker).toBe("GME");
    expect(previewState.packagePreview?.instrumentDisplayName).toBe("GameStop");
    expect(previewState.packagePreview?.quantity).toBe("1");
    expect(previewState.packagePreview?.limitPrice).toBe("21.98");
    expect(previewState.packagePreview?.quantityStrategy).toBe("quantity_based");
    expect(previewState.sourceMode.activeMode).toBe(
      "selected_recommendation_preview_only",
    );
    expect(previewState.preActivationGate.gateStatus).toBe("locked");
    expect(previewState.sourceMode.executionAllowed).toBe(false);
    expect(previewState.sourceMode.bridgeCallsAllowed).toBe(false);
    expect(previewState.sourceMode.realSelectedRecommendationStateAllowed).toBe(
      false,
    );
  });

  test("test-only harness source renders passive panel and no active controls", () => {
    const source = readRepoFile(
      "components/execution/AvanzaSelectedRecommendationPreviewTestOnlyHarness.tsx",
    );

    expect(source).toContain("AvanzaDevPreviewFlagStatusPanel");
    expect(source).toContain("AvanzaSelectedRecommendationPreviewStatePanel");
    expect(source).toContain("buildAvanzaDevOnlyPreviewEnablementState");
    expect(source).toContain("canRenderSelectedRecommendationPreview");
    expect(source).toContain("Default behavior remains static fixture");
    expect(source).toContain("No bridge calls");
    expect(source).toContain("no localhost fetch");
    expect(source).toContain("no execution");
    expect(source).toContain("controls disabled");
    expect(source).toContain("gate locked");
    expect(source).not.toContain("<button");
    expect(source).not.toMatch(/onClick\s*=/);
    expect(source).not.toMatch(/fetch\s*\(/);
    expect(source).not.toMatch(/\/live-fill-only-runner\//);
    expect(source).not.toMatch(/fillQuantityField|fillPriceField|fillAmountField/);
    expect(source).not.toMatch(/method:\s*["']POST["']/);
    expect(source).not.toMatch(/FINAL LIVE EXECUTE ATTEMPT/);
    expect(source).not.toMatch(/process\.env|NEXT_PUBLIC_|\.env\.local/);
    expect(source).not.toMatch(/supabase|execution[_-]?record/i);
  });
});
