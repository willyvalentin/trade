import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  avanzaDevPreviewFlagDefaultConfig,
  avanzaDevPreviewFlagExplicitTestFixtureConfig,
  avanzaDevPreviewFlagProductionForbiddenConfig,
  buildAvanzaDevPreviewFlagConfig,
} from "../../lib/avanza-dev-preview-flag-config";

const repoRoot = process.cwd();

function readRepoFile(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

test.describe("Avanza dev/test-only preview flag config", () => {
  test("default config is disabled", () => {
    expect(avanzaDevPreviewFlagDefaultConfig).toEqual(
      expect.objectContaining({
        canCallBridge: false,
        canEnableSelectedRecommendationPreview: false,
        canExecute: false,
        canFetchLocalhost: false,
        environmentScope: "default",
        explicitPreviewOnlyFlag: false,
        source: "default_disabled",
      }),
    );
  });

  test("default cannot enable selectedRecommendation preview", () => {
    const config = buildAvanzaDevPreviewFlagConfig();

    expect(config.explicitPreviewOnlyFlag).toBe(false);
    expect(config.canEnableSelectedRecommendationPreview).toBe(false);
    expect(config.reason).toContain("explicitPreviewOnlyFlag false");
    expect(config.reason).toContain("selectedRecommendation preview disabled");
  });

  test("dev/test fixture can enable preview-only flag", () => {
    expect(avanzaDevPreviewFlagExplicitTestFixtureConfig).toEqual(
      expect.objectContaining({
        canEnableSelectedRecommendationPreview: true,
        environmentScope: "dev_test_only",
        explicitPreviewOnlyFlag: true,
        source: "explicit_test_fixture",
      }),
    );
  });

  test("dev/test fixture still forbids bridge, local fetch, and execution", () => {
    expect(avanzaDevPreviewFlagExplicitTestFixtureConfig.canCallBridge).toBe(
      false,
    );
    expect(avanzaDevPreviewFlagExplicitTestFixtureConfig.canFetchLocalhost).toBe(
      false,
    );
    expect(avanzaDevPreviewFlagExplicitTestFixtureConfig.canExecute).toBe(false);
  });

  test("production scope is forbidden", () => {
    expect(avanzaDevPreviewFlagProductionForbiddenConfig).toEqual(
      expect.objectContaining({
        canEnableSelectedRecommendationPreview: false,
        environmentScope: "production_forbidden",
        explicitPreviewOnlyFlag: false,
        source: "default_disabled",
      }),
    );
    expect(avanzaDevPreviewFlagProductionForbiddenConfig.reason).toMatch(
      /forbidden in production/i,
    );
  });

  test("invalid enabled input outside dev/test falls back to disabled", () => {
    const config = buildAvanzaDevPreviewFlagConfig({
      environmentScope: "default",
      explicitPreviewOnlyFlag: true,
      source: "explicit_dev_config",
    });

    expect(config.canEnableSelectedRecommendationPreview).toBe(false);
    expect(config.explicitPreviewOnlyFlag).toBe(false);
    expect(config.source).toBe("default_disabled");
  });

  test("helper is pure and contains no live endpoint strings or exact trigger phrase", () => {
    const source = readRepoFile("lib/avanza-dev-preview-flag-config.ts");

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
