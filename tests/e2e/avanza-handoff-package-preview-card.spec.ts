import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  buildAvanzaHandoffPackagePreview,
} from "../../lib/avanza-handoff-package-preview";
import {
  avanzaGameStopHandoffPackagePreviewFixture,
  avanzaGameStopHandoffPreActivationGateFixture,
  avanzaGameStopHandoffPreviewSourceModeFixture,
  avanzaGameStopHandoffSafetyBoundarySummaryFixture,
  avanzaGameStopSelectedRecommendationHandoffEligibilitySummaryFixture,
  avanzaGameStopSelectedRecommendationHandoffContractFixture,
  avanzaSelectedTureRecommendationFixture,
} from "../../lib/avanza-handoff-package-preview-fixtures";
import type {
  AvanzaBridgeReadinessSummary,
} from "../../lib/avanza-bridge-readiness-checklist";

const repoRoot = process.cwd();

const readinessSummaryFixture: AvanzaBridgeReadinessSummary = {
  advisory_count: 1,
  blocked_count: 0,
  label: "Ready for read-only observation",
  ready_count: 11,
  severity: "warning",
  shortCopy:
    "Bridge checks are ready for read-only observation. Total-read remains advisory.",
  status: "ready_for_read_only_observation",
  unknown_count: 0,
};

function readRepoFile(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

test.describe("Avanza handoff package preview card", () => {
  test("card source renders a valid buy preview package model", () => {
    const source = readRepoFile(
      "components/execution/AvanzaHandoffPackagePreviewCard.tsx",
    );
    const fixtureSource = readRepoFile(
      "lib/avanza-handoff-package-preview-fixtures.ts",
    );
    const tradeSource = readRepoFile("app/trade-app.tsx");
    const preview = buildAvanzaHandoffPackagePreview({
      accountDisplayName: "Valentin Labs KF",
      instrumentDisplayName: "GameStop",
      limitPrice: "21,98",
      orderMode: "Avancerad/Limit",
      quantity: 1,
      readinessSummary: readinessSummaryFixture,
      recommendationId: "rec-gme-card",
      side: "buy",
      ticker: "GME",
    });

    expect(preview.blocked).toBe(false);
    expect(source).toContain("preview.actionLabel");
    expect(source).toContain("preview.ticker");
    expect(source).toContain("preview.instrumentDisplayName");
    expect(source).toContain("preview.quantityStrategy");
    expect(source).toContain("preview.limitPrice");
    expect(source).toContain("preview.accountDisplayLabel");
    expect(source).toContain("preview.orderMode");
    expect(source).toContain("preview.boundary");
    expect(source).toContain("preview.readinessSummaryStatus");
    expect(source).toContain("sourceMode.label");
    expect(source).toContain("sourceMode.reason");
    expect(source).toContain("preActivationGate");
    expect(source).toContain("safetyBoundarySummary");
    expect(source).toContain("Selected recommendation contract");
    expect(source).toContain("resolvedEligibilitySummary");
    expect(source).toContain("eligibilitySummary");
    expect(source).toContain("contract.items");
    expect(fixtureSource).toContain("avanzaSelectedTureRecommendationFixture");
    expect(fixtureSource).toContain("mapTureRecommendationToAvanzaHandoffInput");
    expect(fixtureSource).toContain("buildAvanzaHandoffPackagePreview");
    expect(fixtureSource).toContain("buildAvanzaSelectedRecommendationHandoffContract");
    expect(fixtureSource).toContain("GameStop");
    expect(fixtureSource).toContain("21.98");
    expect(tradeSource).toContain("AvanzaHandoffPackagePreviewCard");
    expect(tradeSource).toContain("avanzaGameStopHandoffPackagePreviewFixture");
  });

  test("static selected recommendation fixture maps through pure mapper and builder", () => {
    expect(avanzaSelectedTureRecommendationFixture.id).toBe(
      "preview-gamestop-quantity-based",
    );
    expect(avanzaSelectedTureRecommendationFixture.ticker).toBe("GME");
    expect(avanzaSelectedTureRecommendationFixture.companyName).toBe("GameStop");
    expect(avanzaSelectedTureRecommendationFixture.direction).toBe("long");
    expect(avanzaSelectedTureRecommendationFixture.positionSizeValue).toBe(1);
    expect(avanzaSelectedTureRecommendationFixture.entryPriceValue).toBe(21.98);

    expect(avanzaGameStopHandoffPackagePreviewFixture.recommendationId).toBe(
      avanzaSelectedTureRecommendationFixture.id,
    );
    expect(avanzaGameStopHandoffPackagePreviewFixture.ticker).toBe("GME");
    expect(avanzaGameStopHandoffPackagePreviewFixture.side).toBe("buy");
    expect(avanzaGameStopHandoffPackagePreviewFixture.quantityStrategy).toBe(
      "quantity_based",
    );
    expect(avanzaGameStopHandoffPackagePreviewFixture.quantity).toBe("1");
    expect(avanzaGameStopHandoffPackagePreviewFixture.limitPrice).toBe("21.98");
    expect(avanzaGameStopHandoffPackagePreviewFixture.accountDisplayLabel).toBe(
      "Valentin Labs KF",
    );
    expect(avanzaGameStopHandoffPackagePreviewFixture.orderMode).toBe(
      "Avancerad/Limit",
    );
    expect(avanzaGameStopHandoffPackagePreviewFixture.boundary).toBe(
      "before Granska köp",
    );
    expect(avanzaGameStopHandoffPackagePreviewFixture.totalReadStatus).toBe(
      "unresolved_advisory",
    );
    expect(avanzaGameStopHandoffPackagePreviewFixture.blocked).toBe(false);
    expect(avanzaGameStopSelectedRecommendationHandoffContractFixture.status).toBe(
      "preview_ready",
    );
    expect(
      avanzaGameStopSelectedRecommendationHandoffContractFixture.selectedRecommendationId,
    ).toBe(avanzaSelectedTureRecommendationFixture.id);
    expect(
      avanzaGameStopSelectedRecommendationHandoffContractFixture.totalReadStatus,
    ).toBe("unresolved_advisory");
    expect(
      avanzaGameStopSelectedRecommendationHandoffEligibilitySummaryFixture.status,
    ).toBe("preview_ready");
    expect(
      avanzaGameStopSelectedRecommendationHandoffEligibilitySummaryFixture.shortCopy,
    ).toContain("preview only");
    expect(
      avanzaGameStopSelectedRecommendationHandoffEligibilitySummaryFixture.shortCopy,
    ).toContain("not execution-ready");
    expect(
      avanzaGameStopSelectedRecommendationHandoffEligibilitySummaryFixture.shortCopy,
    ).toContain("no order placement");
    expect(avanzaGameStopHandoffPreviewSourceModeFixture.activeMode).toBe(
      "static_fixture",
    );
    expect(
      avanzaGameStopHandoffPreviewSourceModeFixture
        .realSelectedRecommendationStateAllowed,
    ).toBe(false);
    expect(avanzaGameStopHandoffPreviewSourceModeFixture.bridgeCallsAllowed).toBe(
      false,
    );
    expect(avanzaGameStopHandoffPreviewSourceModeFixture.executionAllowed).toBe(
      false,
    );
    expect(avanzaGameStopHandoffSafetyBoundarySummaryFixture.boundaries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "no_order_placement",
          status: "enforced",
        }),
        expect.objectContaining({
          id: "total_read_unresolved_advisory",
          status: "advisory",
        }),
      ]),
    );
    expect(avanzaGameStopHandoffPreActivationGateFixture.gateStatus).toBe(
      "locked",
    );
    expect(avanzaGameStopHandoffPreActivationGateFixture.reasons).toContain(
      "Static fixture source",
    );
  });

  test("static contract status renders in the preview card source", () => {
    const source = readRepoFile(
      "components/execution/AvanzaHandoffPackagePreviewCard.tsx",
    );
    const sourceModeSource = readRepoFile(
      "lib/avanza-handoff-preview-source-mode.ts",
    );
    const tradeSource = readRepoFile("app/trade-app.tsx");

    expect(source).toContain("Selected recommendation contract");
    expect(source).toContain("resolvedEligibilitySummary.label");
    expect(source).toContain("resolvedEligibilitySummary.shortCopy");
    expect(source).toContain("resolvedEligibilitySummary.status");
    expect(source).toContain("resolvedEligibilitySummary.readyCount");
    expect(source).toContain("resolvedEligibilitySummary.blockedCount");
    expect(source).toContain("resolvedEligibilitySummary.advisoryCount");
    expect(source).toContain("resolvedEligibilitySummary.unknownCount");
    expect(source).toContain("Selected recommendation wiring: disabled");
    expect(source).toContain("No real recommendation state is read");
    expect(source).toContain("safetyBoundarySummary.label");
    expect(source).toContain("safetyBoundarySummary.boundaries.map");
    expect(source).toContain("preActivationGate.label");
    expect(source).toContain("preActivationGate.gateStatus");
    expect(source).toContain("No gate result is production readiness");
    expect(sourceModeSource).toContain("Source: static fixture");
    expect(source).toContain("contract.status");
    expect(source).toContain("contract.items.map");
    expect(source).toContain("item.label");
    expect(source).toContain("item.status");
    expect(source).toContain("ready");
    expect(source).toContain("blocked");
    expect(source).toContain("advisory");
    const avanzaPreviewCallSite =
      tradeSource.match(
        /<AvanzaHandoffPackagePreviewCard[\s\S]*?\/>/,
      )?.[0] ?? "";

    expect(avanzaPreviewCallSite).toContain(
      "avanzaGameStopSelectedRecommendationHandoffContractFixture",
    );
    expect(avanzaPreviewCallSite).toContain(
      "contract={avanzaGameStopSelectedRecommendationHandoffContractFixture}",
    );
    expect(avanzaPreviewCallSite).toContain(
      "eligibilitySummary={",
    );
    expect(avanzaPreviewCallSite).toContain(
      "avanzaGameStopSelectedRecommendationHandoffEligibilitySummaryFixture",
    );
    expect(avanzaPreviewCallSite).toContain(
      "sourceMode={avanzaGameStopHandoffPreviewSourceModeFixture}",
    );
    expect(avanzaPreviewCallSite).toContain(
      "safetyBoundarySummary={",
    );
    expect(avanzaPreviewCallSite).toContain(
      "avanzaGameStopHandoffSafetyBoundarySummaryFixture",
    );
    expect(avanzaPreviewCallSite).toContain(
      "preActivationGate={avanzaGameStopHandoffPreActivationGateFixture}",
    );
    expect(avanzaPreviewCallSite).not.toContain("selectedRecommendation=");
    expect(avanzaPreviewCallSite).not.toContain("setSelectedRecommendation");
  });

  test("builder model supports blocked non-buy preview for the card", () => {
    const preview = buildAvanzaHandoffPackagePreview({
      limitPrice: "21,98",
      quantity: 1,
      readinessSummary: readinessSummaryFixture,
      recommendationId: "rec-sell-card",
      side: "sell",
      ticker: "GME",
    });

    expect(preview.blocked).toBe(true);
    expect(preview.blockedReason).toContain("buy-only");
  });

  test("advisory gaps render for missing quantity and price", () => {
    const source = readRepoFile(
      "components/execution/AvanzaHandoffPackagePreviewCard.tsx",
    );
    const preview = buildAvanzaHandoffPackagePreview({
      readinessSummary: readinessSummaryFixture,
      recommendationId: "rec-gap-card",
      side: "buy",
      ticker: "GME",
    });

    expect(preview.advisoryNotes).toContain(
      "Quantity is missing and must be resolved before handoff.",
    );
    expect(preview.advisoryNotes).toContain(
      "Limit price is missing and must be resolved before handoff.",
    );
    expect(source).toContain("Advisory gap");
    expect(source).toContain("preview.advisoryNotes");
  });

  test("card action is disabled and has no bridge, fill, refresh, or order wiring", () => {
    const source = readRepoFile(
      "components/execution/AvanzaHandoffPackagePreviewCard.tsx",
    );
    const tradeSource = readRepoFile("app/trade-app.tsx");

    expect(source).toContain("Preview only");
    expect(source).toContain("Not enabled");
    expect(source).toContain("No order placement");
    expect(source).toContain("Ture will not click Granska köp");
    expect(source).toContain("Ture will not submit an order");
    expect(source).toContain("disabled");
    expect(source).not.toMatch(/onClick|fetch\s*\(|\/live-fill-only-runner\//);
    expect(source).not.toMatch(/fillQuantityField|fillPriceField|fillAmountField/);
    expect(source).not.toMatch(/FINAL LIVE EXECUTE ATTEMPT/);
    expect(source).not.toMatch(/method:\s*["']POST["']/);
    expect(tradeSource).not.toMatch(/Refresh bridge status/);
    expect(tradeSource).not.toMatch(/\/health|\/self-check|\/preflight\/avanza-order-form/);
  });
});
