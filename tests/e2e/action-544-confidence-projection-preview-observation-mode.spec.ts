import { readFileSync } from "fs";
import { join, resolve } from "path";

import { expect, test } from "@playwright/test";

import { ConfidenceCalibrationProjectionPreview } from "../../components/recommendations/ConfidenceCalibrationProjectionPreview";
import { RecommendationCard } from "../../components/recommendations/RecommendationCard";
import { buildConfidenceProjectionObservationPreview } from "../../lib/confidence-calibration-recommendation-advisory-projection-observation";
import { isConfidenceCalibrationProjectionPreviewEnabled } from "../../lib/confidence-calibration-recommendation-advisory-projection-preview-flag";

const root = resolve(__dirname, "../..");

function read(relativePath: string): string {
  return readFileSync(join(root, relativePath), "utf8");
}

test.describe("Action 544 confidence projection preview observation mode", () => {
  test("enables preview by default while preserving explicit opt-out", () => {
    expect(isConfidenceCalibrationProjectionPreviewEnabled({}, "production")).toBe(
      true,
    );
    expect(isConfidenceCalibrationProjectionPreviewEnabled({}, "development")).toBe(
      true,
    );
    expect(
      isConfidenceCalibrationProjectionPreviewEnabled(
        { CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED: "false" },
        "production",
      ),
    ).toBe(false);
    expect(
      isConfidenceCalibrationProjectionPreviewEnabled(
        { CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED: "true" },
        "production",
      ),
    ).toBe(true);
  });

  test("builds an observation-only projection without changing authoritative confidence", () => {
    const preview = buildConfidenceProjectionObservationPreview({
      previewEnabled: true,
      confidenceScore: 82,
      direction: "long",
      setupType: "PULLBACK_CONTINUATION",
      ticker: "AAPL",
    });

    expect(preview.status).toBe("preview_ready");
    expect(preview.original_recommendation_confidence_basis_points).toBe(8200);
    expect(preview.proposed_preview_confidence_basis_points).toBe(8700);
    expect(preview.proposed_preview_delta_basis_points).toBe(500);
    expect(preview.explanation).toContain("Historical");
    expect(preview.historical_basis).toContain("observation only");
    expect(preview.calibration_status).toContain("observation_only");
    expect(preview.recommendation_confidence_unchanged).toBe(true);
    expect(preview.not_applied).toBe(true);
    expect(preview.application_eligible).toBe(false);
    expect(preview.applied).toBe(false);
    expect(preview.ranking_affected).toBe(false);
    expect(preview.scanner_affected).toBe(false);
    expect(preview.publication_affected).toBe(false);
    expect(preview.execution_affected).toBe(false);
  });

  test("renders AI Projection while keeping original confidence visible", () => {
    const preview = buildConfidenceProjectionObservationPreview({
      previewEnabled: true,
      confidenceScore: 82,
      direction: "long",
      setupType: "PULLBACK_CONTINUATION",
      ticker: "AAPL",
    });
    const card = RecommendationCard({
      addTradeDisabled: false,
      addTradeLabel: "Add Trade",
      confidenceLabel: "Confidence 82",
      confidenceProjectionPreview: preview,
      confidenceTone: "strong",
      discardDisabled: false,
      identity: "AAPL",
      metrics: [],
      onAddTrade: () => undefined,
      onOpenDetails: () => undefined,
      onOpenDiscard: () => undefined,
    });
    const details = ConfidenceCalibrationProjectionPreview({ preview });
    const cardText = JSON.stringify(card);
    const detailsText = JSON.stringify(details);

    expect(cardText).toContain("Confidence 82");
    expect(cardText).toContain("AI Projection");
    expect(cardText).toContain("87");
    expect(cardText).toContain("▲ +5");
    expect(detailsText).toContain("Original confidence remains authoritative");
    expect(detailsText).toContain("Calibration status");
  });

  test("keeps scanner, execution, Add Trade, provider, Supabase, and persistence paths untouched", () => {
    const observationSource = read(
      "lib/confidence-calibration-recommendation-advisory-projection-observation.ts",
    );
    const tradeAppSource = read("app/trade-app.tsx");
    const cardSource = read("components/recommendations/RecommendationCard.tsx");

    for (const source of [observationSource, cardSource]) {
      for (const forbidden of [
        "from(",
        "insert(",
        "upsert(",
        "update(",
        "delete(",
        "fetch(",
        "createClient",
        "@supabase",
        "Twelve Data",
        "provider",
        "broker",
        "execute(",
        "runScan",
        "rankRecommendations",
      ]) {
        expect(source.toLowerCase()).not.toContain(forbidden.toLowerCase());
      }
    }

    for (const requiredFlag of [
      "ranking_affected: false",
      "scanner_affected: false",
      "publication_affected: false",
      "execution_affected: false",
    ]) {
      expect(observationSource).toContain(requiredFlag);
    }

    expect(tradeAppSource).toContain(
      "buildConfidenceProjectionObservationPreview",
    );
    expect(tradeAppSource).toContain("confidenceScore: recommendation.confidenceScore");
    expect(tradeAppSource).toContain("onTakeTrade={openTradeModal}");
    expect(tradeAppSource).not.toContain(
      "proposed_preview_confidence_basis_points: recommendation.confidenceScore",
    );
  });
});
