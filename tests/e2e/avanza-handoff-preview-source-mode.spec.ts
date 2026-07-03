import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  avanzaHandoffPreviewActiveSourceMode,
  avanzaHandoffPreviewSourceModes,
} from "../../lib/avanza-handoff-preview-source-mode";

const repoRoot = process.cwd();

function readRepoFile(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

test.describe("Avanza handoff preview source mode", () => {
  test("active source mode is locked to static fixture", () => {
    expect(avanzaHandoffPreviewActiveSourceMode.activeMode).toBe(
      "static_fixture",
    );
    expect(avanzaHandoffPreviewActiveSourceMode.status).toBe("active");
    expect(avanzaHandoffPreviewActiveSourceMode.label).toBe(
      "Source: static fixture",
    );
    expect(
      avanzaHandoffPreviewActiveSourceMode.realSelectedRecommendationStateAllowed,
    ).toBe(false);
    expect(avanzaHandoffPreviewActiveSourceMode.bridgeCallsAllowed).toBe(false);
    expect(avanzaHandoffPreviewActiveSourceMode.executionAllowed).toBe(false);
    expect(avanzaHandoffPreviewActiveSourceMode.tradeUiLocalhostFetchAllowed).toBe(
      false,
    );
  });

  test("selected recommendation modes are disabled or future only", () => {
    const disabled = avanzaHandoffPreviewSourceModes.selected_recommendation_disabled;
    const previewOnly =
      avanzaHandoffPreviewSourceModes.selected_recommendation_preview_only;
    const future = avanzaHandoffPreviewSourceModes.selected_recommendation_future;

    expect(disabled.status).toBe("disabled");
    expect(disabled.selectedRecommendationWiring).toBe("disabled");
    expect(disabled.realSelectedRecommendationStateAllowed).toBe(false);
    expect(disabled.bridgeCallsAllowed).toBe(false);
    expect(disabled.executionAllowed).toBe(false);
    expect(disabled.tradeUiLocalhostFetchAllowed).toBe(false);
    expect(previewOnly.activeMode).toBe("selected_recommendation_preview_only");
    expect(previewOnly.status).toBe("future");
    expect(previewOnly.selectedRecommendationWiring).toBe("future");
    expect(previewOnly.realSelectedRecommendationStateAllowed).toBe(false);
    expect(previewOnly.bridgeCallsAllowed).toBe(false);
    expect(previewOnly.executionAllowed).toBe(false);
    expect(previewOnly.tradeUiLocalhostFetchAllowed).toBe(false);
    expect(future.status).toBe("future");
    expect(future.selectedRecommendationWiring).toBe("future");
    expect(future.realSelectedRecommendationStateAllowed).toBe(false);
    expect(future.bridgeCallsAllowed).toBe(false);
    expect(future.executionAllowed).toBe(false);
    expect(future.tradeUiLocalhostFetchAllowed).toBe(false);
  });

  test("source indicator is rendered from static fixture data only", () => {
    const cardSource = readRepoFile(
      "components/execution/AvanzaHandoffPackagePreviewCard.tsx",
    );
    const tradeSource = readRepoFile("app/trade-app.tsx");
    const fixtureSource = readRepoFile(
      "lib/avanza-handoff-package-preview-fixtures.ts",
    );

    expect(cardSource).toContain("sourceMode.label");
    expect(cardSource).toContain("sourceMode.reason");
    expect(cardSource).toContain("Selected recommendation wiring: disabled");
    expect(cardSource).toContain("No real recommendation state is read");
    expect(fixtureSource).toContain("avanzaGameStopHandoffPreviewSourceModeFixture");
    expect(tradeSource).toContain(
      "sourceMode={avanzaGameStopHandoffPreviewSourceModeFixture}",
    );
  });

  test("model is pure and contains no bridge, trigger, fill, or storage behavior", () => {
    const source = readRepoFile("lib/avanza-handoff-preview-source-mode.ts");

    expect(source).not.toMatch(/fetch\s*\(/);
    expect(source).not.toMatch(/localhost|127\.0\.0\.1/);
    expect(source).not.toMatch(/\/live-fill-only-runner\//);
    expect(source).not.toMatch(/fillQuantityField|fillPriceField|fillAmountField/);
    expect(source).not.toMatch(/FINAL LIVE EXECUTE ATTEMPT/);
    expect(source).not.toMatch(/method:\s*["']POST["']/);
    expect(source).not.toMatch(/localStorage|sessionStorage|cookie|BankID/i);
  });
});
