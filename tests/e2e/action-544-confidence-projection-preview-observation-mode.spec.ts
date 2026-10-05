import { readFileSync } from "fs";
import { join, resolve } from "path";

import { expect, test } from "@playwright/test";
import { createRequire } from "node:module";
import { runInNewContext } from "node:vm";
import { buildSync } from "esbuild";

import { ConfidenceCalibrationProjectionPreview } from "../../components/recommendations/ConfidenceCalibrationProjectionPreview";
import { RecommendationCard } from "../../components/recommendations/RecommendationCard";
import { buildConfidenceProjectionObservationPreview } from "../../lib/confidence-calibration-recommendation-advisory-projection-observation";
import { isConfidenceCalibrationProjectionPreviewEnabled } from "../../lib/confidence-calibration-recommendation-advisory-projection-preview-flag";
import { SETUP_TYPES } from "../../lib/setup-types";

const root = resolve(__dirname, "../..");

// Playwright's component transform emits __pw_type nodes. Compile the real
// components with React's JSX runtime for an actual server-rendered DOM proof.
function renderProjection(preview: ReturnType<typeof buildConfidenceProjectionObservationPreview>) {
  const compiled = buildSync({
    absWorkingDir: root,
    bundle: true,
    platform: "node",
    format: "cjs",
    packages: "external",
    jsx: "automatic",
    write: false,
    stdin: {
      resolveDir: root,
      loader: "tsx",
      contents: `
        import { renderToStaticMarkup } from "react-dom/server";
        import { RecommendationCard } from "./components/recommendations/RecommendationCard";
        import { ConfidenceCalibrationProjectionPreview } from "./components/recommendations/ConfidenceCalibrationProjectionPreview";
        export function render(preview) {
          return {
            card: renderToStaticMarkup(<RecommendationCard
              addTradeDisabled={true} addTradeLabel="Review recommendation"
              confidenceLabel="Confidence 82" confidenceProjectionPreview={preview}
              confidenceTone="medium" discardDisabled={true}
              identity="AAPL (synthetic test fixture)"
              metrics={[{ label: "Confidence", value: "82/100" }]}
              onAddTrade={() => {}} onOpenDetails={() => {}} onOpenDiscard={() => {}}
            />),
            details: renderToStaticMarkup(<ConfidenceCalibrationProjectionPreview preview={preview} />),
          };
        }
      `,
    },
  }).outputFiles[0].text;
  const compiledModule = { exports: {} as { render: (value: typeof preview) => { card: string; details: string } } };
  runInNewContext(compiled, { module: compiledModule, exports: compiledModule.exports, require: createRequire(join(root, "package.json")) });
  return compiledModule.exports.render(preview);
}

function read(relativePath: string): string {
  return readFileSync(join(root, relativePath), "utf8");
}

test.describe("Action 544 confidence projection preview observation mode", () => {
  test("does not call a fixed setup rule historical calibration evidence", () => {
    for (const setupType of SETUP_TYPES) {
      const preview = buildConfidenceProjectionObservationPreview({
        previewEnabled: true,
        confidenceScore: 82,
        direction: "long",
        setupType,
        ticker: "AAPL",
      });
      expect(preview.calibration_status).toBe("uncalibrated_static_setup_rule_observation_only");
      expect(preview.historical_basis).toBeNull();
      expect(preview.explanation).toContain("not fitted to outcomes");
      expect(preview.original_recommendation_confidence_basis_points).toBe(8200);
      expect(preview.recommendation_confidence_unchanged).toBe(true);
    }
  });

  test("the actual card and details do not serve a static uplift as an AI projection", () => {
    const preview = buildConfidenceProjectionObservationPreview({
      previewEnabled: true,
      confidenceScore: 82,
      direction: "long",
      setupType: "PULLBACK_CONTINUATION",
      ticker: "AAPL",
    });
    const { card, details } = renderProjection(preview);
    expect(card).toContain("82/100");
    expect(card).not.toContain("AI Projection");
    expect(card).not.toContain("▲ +5");
    expect(card).toContain("not a win probability");
    expect(details).toContain("Calibration unavailable");
    expect(details).toContain("No outcome-linked calibration model");
    expect(details).not.toContain("PROJECTED CONFIDENCE");
    expect(details).not.toContain("Historical pullback");
  });

  test("retains the exact legacy numerical rule without calibration authority", () => {
    const deltas = [4, 5, 5, 5, 3, 4, 2, 2, 0];
    for (const [index, setupType] of SETUP_TYPES.entries()) {
      for (const score of [0, 63, 82, 99, 100, 82.4, -1, 101]) {
        const preview = buildConfidenceProjectionObservationPreview({
          previewEnabled: true, confidenceScore: score,
          direction: "long", setupType, ticker: "AAPL",
        });
        const original = Math.min(100, Math.max(0, Math.round(score)));
        const projected = Math.min(100, original + deltas[index]);
        expect(preview.original_recommendation_confidence_basis_points).toBe(original * 100);
        expect(preview.proposed_preview_confidence_basis_points).toBe(projected * 100);
        expect(preview.proposed_preview_delta_basis_points).toBe((projected - original) * 100);
        expect(preview.application_eligible).toBe(false);
        expect(preview.applied).toBe(false);
        expect(preview.ranking_affected).toBe(false);
        expect(preview.publication_affected).toBe(false);
      }
    }
  });

  test("hides legacy static labels without rewriting their retained evidence", () => {
    const preview = buildConfidenceProjectionObservationPreview({
      previewEnabled: true, confidenceScore: 82, direction: "long",
      setupType: "PULLBACK_CONTINUATION", ticker: "AAPL",
    });
    for (const calibration_status of [
      "calibrated_observation_only", "calibrated_with_caution_observation_only",
      "insufficient_setup_context_observation_only",
    ]) {
      const retained = { ...preview, calibration_status,
        explanation: "Historical fixture claim must not be served as evidence",
        historical_basis: "Retained legacy text (synthetic fixture)",
      };
      const before = JSON.stringify(retained);
      const { card, details } = renderProjection(retained);
      expect(card).not.toContain("AI Projection");
      expect(details).toContain("Calibration unavailable");
      expect(details).not.toContain("Historical fixture claim");
      expect(JSON.stringify(retained)).toBe(before);
    }
    // A separate advisory-adapter shape remains unaffected. This synthetic
    // rendering control proves compatibility, not actual calibration evidence.
    const advisory = renderProjection({ ...preview, calibration_status: "calibrated" });
    expect(advisory.card).toContain("AI Projection");
    expect(advisory.card).toContain("▲ +5");
    expect(advisory.details).toContain("Original confidence remains authoritative");
  });

  test("does not fabricate a preview for disabled or missing confidence", () => {
    for (const score of [null, NaN, Infinity]) {
      const preview = buildConfidenceProjectionObservationPreview({
        previewEnabled: true, confidenceScore: score, direction: "long",
        setupType: "PULLBACK_CONTINUATION", ticker: "AAPL",
      });
      expect(preview.status).toBe("preview_unavailable");
      expect(preview.proposed_preview_confidence_basis_points).toBeNull();
      expect(renderProjection(preview).card).not.toContain("AI Projection");
    }
    const disabled = buildConfidenceProjectionObservationPreview({
      previewEnabled: false, confidenceScore: 82, direction: "long",
      setupType: "PULLBACK_CONTINUATION", ticker: "AAPL",
    });
    expect(renderProjection(disabled).details).toBe("");
    expect(disabled.proposed_preview_confidence_basis_points).toBeNull();
  });

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
    expect(preview.explanation).toContain("not fitted to outcomes");
    expect(preview.historical_basis).toBeNull();
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

  test("keeps original confidence visible without promoting an uncalibrated preview", () => {
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
    expect(cardText).not.toContain("AI Projection");
    expect(cardText).not.toContain("▲ +5");
    expect(detailsText).toContain("Calibration unavailable");
    expect(detailsText).toContain("not a win probability");
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
