import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  avanzaHandoffPreviewActiveSourceMode,
  avanzaHandoffPreviewSourceModes,
} from "../../lib/avanza-handoff-preview-source-mode";
import {
  buildAvanzaSelectedRecommendationPreviewState,
} from "../../lib/avanza-selected-recommendation-preview-state";
import {
  avanzaTradeReadOnlyReadinessSummaryFixture,
} from "../../lib/avanza-read-only-readiness-fixtures";

const repoRoot = process.cwd();
const accountDisplayName = "Valentin Labs KF";
const orderMode = "Avancerad/Limit";

function readRepoFile(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

function buildState(
  selectedRecommendation:
    | Parameters<typeof buildAvanzaSelectedRecommendationPreviewState>[0]["selectedRecommendation"]
    | null,
  sourceMode = avanzaHandoffPreviewSourceModes.selected_recommendation_preview_only,
) {
  return buildAvanzaSelectedRecommendationPreviewState({
    accountDisplayName,
    orderMode,
    readinessSummary: avanzaTradeReadOnlyReadinessSummaryFixture,
    selectedRecommendation,
    sourceMode,
  });
}

test.describe("Avanza selected-recommendation preview state", () => {
  test("null selected recommendation returns no selection and no package preview", () => {
    const state = buildState(null);

    expect(state.displayState).toBe("no_selection");
    expect(state.packagePreview).toBeNull();
    expect(state.selectedRecommendationContract.status).toBe("blocked");
    expect(state.eligibilitySummary.status).toBe("blocked");
    expect(state.preActivationGate.gateStatus).toBe("locked");
    expect(state.preActivationGate.blockers).toContain(
      "Selected recommendation present",
    );
  });

  test("valid buy recommendation builds preview-ready locked state", () => {
    const state = buildState({
      companyName: "GameStop",
      direction: "long",
      entryPriceValue: 21.98,
      id: "selected-gme",
      positionSizeValue: 1,
      ticker: "GME",
    });

    expect(state.displayState).toBe("preview_ready_locked");
    expect(state.packagePreview?.ticker).toBe("GME");
    expect(state.packagePreview?.instrumentDisplayName).toBe("GameStop");
    expect(state.packagePreview?.quantity).toBe("1");
    expect(state.packagePreview?.limitPrice).toBe("21.98");
    expect(state.packagePreview?.blocked).toBe(false);
    expect(state.selectedRecommendationContract.status).toBe("preview_ready");
    expect(state.eligibilitySummary.status).toBe("preview_ready");
    expect(state.preActivationGate.gateStatus).toBe("locked");
    expect(state.preActivationGate.reasons).toContain(
      "Selected recommendation wiring disabled",
    );
  });

  test("non-buy recommendation is blocked", () => {
    const state = buildState({
      companyName: "GameStop",
      direction: "short",
      entryPriceValue: 21.98,
      id: "selected-gme-short",
      positionSizeValue: 1,
      ticker: "GME",
    });

    expect(state.displayState).toBe("blocked");
    expect(state.packagePreview?.blocked).toBe(true);
    expect(state.packagePreview?.blockedReason).toContain("buy-only");
    expect(state.eligibilitySummary.status).toBe("blocked");
  });

  test("missing ticker is blocked", () => {
    const state = buildState({
      companyName: "GameStop",
      direction: "long",
      entryPriceValue: 21.98,
      id: "selected-missing-ticker",
      positionSizeValue: 1,
      ticker: "",
    });

    expect(state.displayState).toBe("blocked");
    expect(state.packagePreview?.blocked).toBe(true);
    expect(state.packagePreview?.blockedReason).toContain("Missing ticker");
    expect(state.selectedRecommendationContract.items).toContainEqual(
      expect.objectContaining({
        id: "ticker_present",
        status: "blocked",
      }),
    );
  });

  test("missing quantity or price remains advisory", () => {
    const state = buildState({
      companyName: "GameStop",
      direction: "long",
      id: "selected-advisory-gme",
      ticker: "GME",
    });

    expect(state.displayState).toBe("advisory");
    expect(state.packagePreview?.blocked).toBe(false);
    expect(state.packagePreview?.advisoryNotes).toEqual(
      expect.arrayContaining([
        "Quantity is missing and must be resolved before handoff.",
        "Limit price is missing and must be resolved before handoff.",
      ]),
    );
    expect(state.eligibilitySummary.status).toBe("advisory_gaps");
  });

  test("source mode remains whatever safe caller provided", () => {
    const staticState = buildState(
      {
        companyName: "GameStop",
        direction: "long",
        entryPriceValue: 21.98,
        id: "selected-static-gme",
        positionSizeValue: 1,
        ticker: "GME",
      },
      avanzaHandoffPreviewActiveSourceMode,
    );
    const previewOnlyState = buildState({
      companyName: "GameStop",
      direction: "long",
      entryPriceValue: 21.98,
      id: "selected-preview-only-gme",
      positionSizeValue: 1,
      ticker: "GME",
    });

    expect(staticState.sourceMode.activeMode).toBe("static_fixture");
    expect(previewOnlyState.sourceMode.activeMode).toBe(
      "selected_recommendation_preview_only",
    );
    expect(previewOnlyState.sourceMode.status).toBe("future");
    expect(previewOnlyState.sourceMode.executionAllowed).toBe(false);
  });

  test("total-read remains advisory and no state implies execution readiness", () => {
    const state = buildState({
      companyName: "GameStop",
      direction: "long",
      entryPriceValue: 21.98,
      id: "selected-gme-no-execution",
      positionSizeValue: 1,
      ticker: "GME",
    });
    const serialized = JSON.stringify(state);

    expect(state.packagePreview?.totalReadStatus).toBe("unresolved_advisory");
    expect(state.selectedRecommendationContract.totalReadStatus).toBe(
      "unresolved_advisory",
    );
    expect(state.preActivationGate.advisories).toContain(
      "Total-read unresolved/advisory",
    );
    expect(serialized).toMatch(/not execution-ready/i);
    expect(serialized).not.toMatch(/production ready/i);
    expect(serialized).not.toContain('"executionAllowed":true');
  });

  test("helper is pure and contains no app state, bridge, trigger, fill, or storage behavior", () => {
    const source = readRepoFile(
      "lib/avanza-selected-recommendation-preview-state.ts",
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
