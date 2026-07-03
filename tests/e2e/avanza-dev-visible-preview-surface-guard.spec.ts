import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  avanzaDevOnlyPreviewEnablementCandidateState,
  avanzaDevOnlyPreviewEnablementDefaultState,
  avanzaDevOnlyPreviewEnablementProductionForbiddenState,
} from "../../lib/avanza-dev-only-preview-enablement-state";
import {
  avanzaDevVisiblePreviewSurfaceDefaultGuard,
  buildAvanzaDevVisiblePreviewSurfaceGuard,
} from "../../lib/avanza-dev-visible-preview-surface-guard";

const repoRoot = process.cwd();

function readRepoFile(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

test.describe("Avanza dev-only visible selectedRecommendation preview surface guard", () => {
  test("default guard is hidden", () => {
    expect(avanzaDevVisiblePreviewSurfaceDefaultGuard.status).toBe("hidden");
    expect(
      avanzaDevVisiblePreviewSurfaceDefaultGuard.canRenderVisiblePreviewSurface,
    ).toBe(false);
    expect(
      avanzaDevVisiblePreviewSurfaceDefaultGuard.canReadSelectedRecommendationForPreview,
    ).toBe(false);
  });

  test("default enablement state cannot render visible surface", () => {
    const decision = buildAvanzaDevVisiblePreviewSurfaceGuard({
      enablementState: avanzaDevOnlyPreviewEnablementDefaultState,
    });

    expect(decision.status).toBe("hidden");
    expect(decision.canRenderVisiblePreviewSurface).toBe(false);
    expect(decision.canReadSelectedRecommendationForPreview).toBe(false);
    expect(decision.canCallBridge).toBe(false);
    expect(decision.canFetchLocalhost).toBe(false);
    expect(decision.canExecute).toBe(false);
  });

  test("dev-only fixture can allow visible preview surface", () => {
    const decision = buildAvanzaDevVisiblePreviewSurfaceGuard({
      enablementState: avanzaDevOnlyPreviewEnablementCandidateState,
    });

    expect(decision.status).toBe("visible_dev_only_allowed");
    expect(decision.canRenderVisiblePreviewSurface).toBe(true);
    expect(decision.canReadSelectedRecommendationForPreview).toBe(true);
    expect(decision.canCallBridge).toBe(false);
    expect(decision.canFetchLocalhost).toBe(false);
    expect(decision.canExecute).toBe(false);
    expect(decision.reason).toContain("enabled controls");
    expect(decision.reason).toContain("unlocked gates");
  });

  test("production-forbidden state blocks visible preview surface", () => {
    const decision = buildAvanzaDevVisiblePreviewSurfaceGuard({
      enablementState: avanzaDevOnlyPreviewEnablementProductionForbiddenState,
    });

    expect(decision.status).toBe("blocked");
    expect(decision.canRenderVisiblePreviewSurface).toBe(false);
    expect(decision.canReadSelectedRecommendationForPreview).toBe(false);
  });

  test("force blocked input blocks visible preview surface", () => {
    const decision = buildAvanzaDevVisiblePreviewSurfaceGuard({
      blockedReason: "Manual dev-only surface block.",
      enablementState: avanzaDevOnlyPreviewEnablementCandidateState,
      forceBlocked: true,
    });

    expect(decision.status).toBe("blocked");
    expect(decision.reason).toBe("Manual dev-only surface block.");
    expect(decision.canRenderVisiblePreviewSurface).toBe(false);
  });

  test("no execution-ready or production-ready copy appears", () => {
    const serialized = JSON.stringify([
      avanzaDevVisiblePreviewSurfaceDefaultGuard,
      buildAvanzaDevVisiblePreviewSurfaceGuard({
        enablementState: avanzaDevOnlyPreviewEnablementCandidateState,
      }),
      buildAvanzaDevVisiblePreviewSurfaceGuard({
        enablementState: avanzaDevOnlyPreviewEnablementProductionForbiddenState,
      }),
    ]);

    expect(serialized).not.toMatch(/execution-ready/i);
    expect(serialized).not.toMatch(/production-ready/i);
  });

  test("helper is pure and contains no live endpoints, trigger phrase, or bridge behavior", () => {
    const source = readRepoFile(
      "lib/avanza-dev-visible-preview-surface-guard.ts",
    );

    expect(source).not.toMatch(/process\.env/);
    expect(source).not.toMatch(/app\/trade-app|useState|useMemo|from ["']react["']/);
    expect(source).not.toMatch(/fetch\s*\(/);
    expect(source).not.toMatch(/localhost:|127\.0\.0\.1/);
    expect(source).not.toMatch(/\/live-fill-only-runner\//);
    expect(source).not.toMatch(/fillQuantityField|fillPriceField|fillAmountField/);
    expect(source).not.toMatch(/FINAL LIVE EXECUTE ATTEMPT/);
    expect(source).not.toMatch(/method:\s*["']POST["']/);
    expect(source).not.toMatch(/localStorage|sessionStorage/);
    expect(source).not.toMatch(/document\.cookie|cookies\.set|cookies\(\)/i);
  });
});
