import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  avanzaHandoffPreviewSourceModes,
} from "../../lib/avanza-handoff-preview-source-mode";
import {
  buildAvanzaPreviewStateFromSelectedRecommendation,
} from "../../lib/avanza-selected-recommendation-derived-preview-state";

const repoRoot = process.cwd();

function readRepoFile(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

function buildState(
  selectedRecommendation: Parameters<
    typeof buildAvanzaPreviewStateFromSelectedRecommendation
  >[0]["selectedRecommendation"],
  options: Omit<
    Parameters<typeof buildAvanzaPreviewStateFromSelectedRecommendation>[0],
    "selectedRecommendation"
  > = {},
) {
  return buildAvanzaPreviewStateFromSelectedRecommendation({
    selectedRecommendation,
    ...options,
  });
}

test.describe("Avanza selectedRecommendation derived preview-state helper", () => {
  test("null selectedRecommendation returns no_selection and blocked contract", () => {
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

  test("defaults to static fixture source mode unless explicitly overridden", () => {
    const defaultState = buildState({
      companyName: "GameStop",
      direction: "Long",
      entryPriceValue: 21.98,
      id: "derived-default-source",
      quantity: 1,
      ticker: "GME",
    });
    const explicitPreviewState = buildState(
      {
        companyName: "GameStop",
        direction: "Long",
        entryPriceValue: 21.98,
        id: "derived-preview-source",
        quantity: 1,
        ticker: "GME",
      },
      {
        sourceMode:
          avanzaHandoffPreviewSourceModes.selected_recommendation_preview_only,
      },
    );

    expect(defaultState.sourceMode.activeMode).toBe("static_fixture");
    expect(defaultState.preActivationGate.gateStatus).toBe("locked");
    expect(defaultState.preActivationGate.reasons).toContain(
      "Static fixture source",
    );
    expect(explicitPreviewState.sourceMode.activeMode).toBe(
      "selected_recommendation_preview_only",
    );
    expect(explicitPreviewState.preActivationGate.gateStatus).toBe("locked");
  });

  test("valid selectedRecommendation returns preview_ready_locked", () => {
    const state = buildState(
      {
        companyName: "GameStop",
        direction: "Long",
        entryHighValue: 22.46,
        entryLowValue: 21.5,
        id: "derived-valid-buy",
        ticker: "GME",
      },
      {
        adapterOptions: {
          positionSizing: {
            suggestedShares: 1,
          },
        },
        sourceMode:
          avanzaHandoffPreviewSourceModes.selected_recommendation_preview_only,
      },
    );

    expect(state.displayState).toBe("preview_ready_locked");
    expect(state.packagePreview?.ticker).toBe("GME");
    expect(state.packagePreview?.instrumentDisplayName).toBe("GameStop");
    expect(state.packagePreview?.quantity).toBe("1");
    expect(state.packagePreview?.limitPrice).toBe("21.98");
    expect(state.packagePreview?.blocked).toBe(false);
    expect(state.selectedRecommendationContract.status).toBe("preview_ready");
    expect(state.preActivationGate.gateStatus).toBe("locked");
  });

  test("non-buy selectedRecommendation returns blocked", () => {
    const state = buildState({
      companyName: "GameStop",
      direction: "Short",
      entryPriceValue: 21.98,
      id: "derived-short",
      quantity: 1,
      ticker: "GME",
    });

    expect(state.displayState).toBe("blocked");
    expect(state.packagePreview?.blocked).toBe(true);
    expect(state.packagePreview?.blockedReason).toContain("buy-only");
    expect(state.eligibilitySummary.status).toBe("blocked");
  });

  test("missing ticker selectedRecommendation returns blocked", () => {
    const state = buildState({
      companyName: "GameStop",
      direction: "Long",
      entryPriceValue: 21.98,
      id: "derived-missing-ticker",
      quantity: 1,
      ticker: "",
    });

    expect(state.displayState).toBe("blocked");
    expect(state.packagePreview?.blocked).toBe(true);
    expect(state.packagePreview?.blockedReason).toContain("Missing ticker");
  });

  test("missing price selectedRecommendation returns advisory", () => {
    const state = buildState({
      companyName: "GameStop",
      direction: "Long",
      id: "derived-missing-price",
      quantity: 1,
      ticker: "GME",
    });

    expect(state.displayState).toBe("advisory");
    expect(state.packagePreview?.blocked).toBe(false);
    expect(state.eligibilitySummary.status).toBe("advisory_gaps");
    expect(state.packagePreview?.advisoryNotes).toContain(
      "Limit price is missing and must be resolved before handoff.",
    );
  });

  test("missing quantity selectedRecommendation returns advisory", () => {
    const state = buildState({
      companyName: "GameStop",
      direction: "Long",
      entryPriceValue: 21.98,
      id: "derived-missing-quantity",
      ticker: "GME",
    });

    expect(state.displayState).toBe("advisory");
    expect(state.packagePreview?.blocked).toBe(false);
    expect(state.eligibilitySummary.status).toBe("advisory_gaps");
    expect(state.packagePreview?.advisoryNotes).toContain(
      "Quantity is missing and must be resolved before handoff.",
    );
  });

  test("pre-activation gate remains locked and total-read remains advisory", () => {
    const state = buildState({
      companyName: "GameStop",
      direction: "Long",
      entryPriceValue: 21.98,
      id: "derived-no-execution",
      quantity: 1,
      ticker: "GME",
    });
    const serialized = JSON.stringify(state);

    expect(state.preActivationGate.gateStatus).toBe("locked");
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
      "lib/avanza-selected-recommendation-derived-preview-state.ts",
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
