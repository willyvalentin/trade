import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  avanzaSelectedRecommendationPreviewIntegrationDefaultGuard,
  buildAvanzaSelectedRecommendationPreviewIntegrationGuard,
} from "../../lib/avanza-selected-recommendation-preview-integration-guard";

const repoRoot = process.cwd();

function readRepoFile(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

test.describe("Avanza selectedRecommendation preview integration guard", () => {
  test("default guard is disabled and cannot read selectedRecommendation", () => {
    expect(avanzaSelectedRecommendationPreviewIntegrationDefaultGuard.status).toBe(
      "disabled",
    );
    expect(
      avanzaSelectedRecommendationPreviewIntegrationDefaultGuard
        .canReadSelectedRecommendation,
    ).toBe(false);
    expect(
      avanzaSelectedRecommendationPreviewIntegrationDefaultGuard
        .canUseDerivedPreviewStateHelper,
    ).toBe(false);
    expect(
      avanzaSelectedRecommendationPreviewIntegrationDefaultGuard
        .canSwitchSourceModeToSelectedRecommendationPreviewOnly,
    ).toBe(false);
    expect(
      avanzaSelectedRecommendationPreviewIntegrationDefaultGuard
        .canRenderPreviewOnlyState,
    ).toBe(false);
  });

  test("default guard forbids bridge, local fetch, and execution", () => {
    expect(avanzaSelectedRecommendationPreviewIntegrationDefaultGuard.canCallBridge).toBe(
      false,
    );
    expect(
      avanzaSelectedRecommendationPreviewIntegrationDefaultGuard.canFetchLocalhost,
    ).toBe(false);
    expect(avanzaSelectedRecommendationPreviewIntegrationDefaultGuard.canExecute).toBe(
      false,
    );
  });

  test("explicit preview-only flag allows derivation only", () => {
    const decision = buildAvanzaSelectedRecommendationPreviewIntegrationGuard({
      explicitPreviewOnlyFlag: true,
    });

    expect(decision.status).toBe("preview_only_allowed");
    expect(decision.canReadSelectedRecommendation).toBe(true);
    expect(decision.canUseDerivedPreviewStateHelper).toBe(true);
    expect(decision.canSwitchSourceModeToSelectedRecommendationPreviewOnly).toBe(
      true,
    );
    expect(decision.canRenderPreviewOnlyState).toBe(true);
    expect(decision.canCallBridge).toBe(false);
    expect(decision.canFetchLocalhost).toBe(false);
    expect(decision.canExecute).toBe(false);
    expect(decision.reason).toContain("controls must stay disabled");
    expect(decision.reason).toContain("pre-activation gate must stay locked");
  });

  test("explicit block overrides preview-only flag", () => {
    const decision = buildAvanzaSelectedRecommendationPreviewIntegrationGuard({
      blockedReason: "Preview integration blocked by local policy.",
      explicitPreviewOnlyFlag: true,
      forceBlocked: true,
    });

    expect(decision.status).toBe("blocked");
    expect(decision.canReadSelectedRecommendation).toBe(false);
    expect(decision.canUseDerivedPreviewStateHelper).toBe(false);
    expect(decision.reason).toBe("Preview integration blocked by local policy.");
  });

  test("guard is pure and contains no app state, bridge, trigger, fill, or storage behavior", () => {
    const source = readRepoFile(
      "lib/avanza-selected-recommendation-preview-integration-guard.ts",
    );

    expect(source).not.toMatch(/process\.env/);
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
