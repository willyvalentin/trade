import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();

function readRepoFile(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

function avanzaPreviewCardBlock(source: string) {
  const match = source.match(
    /<AvanzaHandoffPackagePreviewCard[\s\S]*?\/>\s*<\/div>/,
  );

  if (!match) {
    throw new Error("Missing AvanzaHandoffPackagePreviewCard block");
  }

  return match[0];
}

test.describe("Avanza Trade UI guarded selectedRecommendation preview safety", () => {
  test("Trade UI still imports and uses static Avanza fixture data for preview card", () => {
    const source = readRepoFile("app/trade-app.tsx");
    const previewBlock = avanzaPreviewCardBlock(source);

    expect(source).toContain(
      'from "@/lib/avanza-handoff-package-preview-fixtures"',
    );
    expect(source).toContain("avanzaGameStopHandoffPackagePreviewFixture");
    expect(source).toContain(
      "avanzaGameStopSelectedRecommendationHandoffContractFixture",
    );
    expect(source).toContain(
      "avanzaGameStopSelectedRecommendationHandoffEligibilitySummaryFixture",
    );
    expect(source).toContain("avanzaGameStopHandoffPreActivationGateFixture");
    expect(source).toContain("avanzaGameStopHandoffPreviewSourceModeFixture");
    expect(previewBlock).toContain(
      "preview={avanzaGameStopHandoffPackagePreviewFixture}",
    );
    expect(previewBlock).toContain(
      "contract={avanzaGameStopSelectedRecommendationHandoffContractFixture}",
    );
    expect(previewBlock).toContain(
      "sourceMode={avanzaGameStopHandoffPreviewSourceModeFixture}",
    );
  });

  test("default Trade UI config keeps selectedRecommendation preview derivation disabled", () => {
    const source = readRepoFile("app/trade-app.tsx");

    expect(source).toContain("avanzaSelectedRecommendationPreviewDevConfig");
    expect(source).toContain(
      "testOnlyAvanzaSelectedRecommendationPreviewDevConfig",
    );
    expect(source).toContain("buildAvanzaDevPreviewFlagConfig");
    expect(source).toMatch(
      /avanzaSelectedRecommendationPreviewDevConfig\s*=[\s\S]*buildAvanzaDevPreviewFlagConfig\(\{\s*environmentScope:\s*"default",\s*explicitPreviewOnlyFlag:\s*false,\s*source:\s*"default_disabled",\s*\}\)/,
    );
    expect(source).toContain("avanzaSelectedRecommendationPreviewDevConfig");
    expect(source).toContain(
      "buildAvanzaSelectedRecommendationPreviewIntegrationGuard",
    );
    expect(source).toContain("avanzaSelectedRecommendationPreviewIntegrationGuard");
    expect(source).toContain(
      "testOnlyAvanzaSelectedRecommendationPreviewDevConfig,\n    );",
    );
    expect(source).toContain(
      'avanzaSelectedRecommendationPreviewIntegrationGuard.status ===\n      "preview_only_allowed"',
    );
    expect(source).toContain("Avanza preview source: static fixture");
    expect(source).toContain("selectedRecommendation preview: disabled");
    expect(source).toContain("No bridge calls");
    expect(source).toContain("No execution");
  });

  test("test-only preview config override is explicit and defaulted to disabled config", () => {
    const source = readRepoFile("app/trade-app.tsx");

    expect(source).toContain(
      "testOnlyAvanzaSelectedRecommendationPreviewDevConfig?: AvanzaDevPreviewFlagConfig",
    );
    expect(source).toMatch(
      /testOnlyAvanzaSelectedRecommendationPreviewDevConfig\s*=\s*avanzaSelectedRecommendationPreviewDevConfig/,
    );
    expect(source).toContain("explicitPreviewOnlyFlag: false");
    expect(source).toContain('environmentScope: "default"');
    expect(source).toContain('source: "default_disabled"');
    expect(source).not.toMatch(/process\.env.*explicitPreviewOnlyFlag/i);
    expect(source).not.toMatch(/NEXT_PUBLIC_.*AVANZA.*PREVIEW/i);
    expect(source).not.toMatch(/\.env\.local/);
  });

  test("Trade UI selectedRecommendation derivation uses pure helper only behind guard", () => {
    const source = readRepoFile("app/trade-app.tsx");

    expect(source).toContain("buildAvanzaPreviewStateFromSelectedRecommendation");
    expect(source).toContain("AvanzaSelectedRecommendationPreviewStatePanel");
    expect(source).toMatch(
      /avanzaSelectedRecommendationPreviewIntegrationGuard\.status ===[\s\S]*"preview_only_allowed"[\s\S]*selectedRecommendation[\s\S]*buildAvanzaPreviewStateFromSelectedRecommendation/,
    );
    expect(source).toMatch(
      /sourceMode:\s*avanzaHandoffPreviewSourceModes\.selected_recommendation_preview_only/,
    );
    expect(source).toContain(
      "Avanza preview source: selectedRecommendation preview-only",
    );
    expect(source).toContain("Preview-only");
    expect(source).toContain("Controls disabled");
    expect(source).toContain("Gate locked");
    expect(
      source,
      "Trade UI must not bypass the derived helper by importing the adapter directly",
    ).not.toContain("adaptSelectedRecommendationToAvanzaHandoffSource");
    expect(
      source,
      "pre-wiring checklist panel remains isolated and must not be rendered in Trade UI",
    ).not.toContain("AvanzaSelectedRecommendationPreWiringChecklistPanel");
    expect(source).not.toMatch(
      /avanza-selected-recommendation-(adapter|pre-wiring-checklist)/,
    );
  });

  test("default Avanza preview card remains static fixture fallback", () => {
    const source = readRepoFile("app/trade-app.tsx");
    const previewBlock = avanzaPreviewCardBlock(source);

    expect(
      previewBlock,
      "Avanza preview card must remain sourced from static fixtures until a future explicit wiring action",
    ).toContain("preview={avanzaGameStopHandoffPackagePreviewFixture}");
    expect(previewBlock).toContain(
      "sourceMode={avanzaGameStopHandoffPreviewSourceModeFixture}",
    );
    expect(previewBlock).not.toMatch(/selectedRecommendationForDisplay/);
    expect(previewBlock).not.toMatch(/selectedRecommendationPositionSizing/);
  });

  test("Trade UI source mode switch is guarded and default fixture source remains present", () => {
    const source = readRepoFile("app/trade-app.tsx");

    expect(source).toContain("avanzaHandoffPreviewSourceModes");
    expect(source).toContain("selected_recommendation_preview_only");
    expect(source).toMatch(
      /avanzaSelectedRecommendationPreviewIntegrationGuard\.status ===[\s\S]*"preview_only_allowed"[\s\S]*avanzaHandoffPreviewSourceModes\.selected_recommendation_preview_only/,
    );
    expect(source).toContain("avanzaGameStopHandoffPreviewSourceModeFixture");
  });

  test("Trade UI Avanza preview has no local bridge, trigger, fill, or active handoff path", () => {
    const source = readRepoFile("app/trade-app.tsx");
    const previewCardSource = readRepoFile(
      "components/execution/AvanzaHandoffPackagePreviewCard.tsx",
    );

    expect(source).not.toMatch(/avanza-local-bridge-readonly-fetcher/);
    expect(source).not.toMatch(/fetchAvanzaLocalBridgeReadonlyStatus/);
    expect(source).not.toMatch(/\/health|\/self-check|\/preflight\/avanza-order-form/);
    expect(source).not.toMatch(/\/live-fill-only-runner\//);
    expect(source).not.toMatch(/run-approved-quantity-based-fill-only-trigger/);
    expect(source).not.toMatch(/fillQuantityField|fillPriceField|fillAmountField/);
    expect(source).not.toMatch(/FINAL LIVE EXECUTE ATTEMPT/);
    expect(source).not.toMatch(/supabase.*execution|execution.*supabase/i);
    expect(previewCardSource).toContain("disabled");
    expect(previewCardSource).not.toMatch(/onClick\s*=/);
    expect(previewCardSource).not.toMatch(/fetch\s*\(/);
    expect(previewCardSource).not.toMatch(/\/live-fill-only-runner\//);
    expect(previewCardSource).not.toMatch(/method:\s*["']POST["']/);
  });

  test("guarded selectedRecommendation preview panel remains passive and locked", () => {
    const panelSource = readRepoFile(
      "components/execution/AvanzaSelectedRecommendationPreviewStatePanel.tsx",
    );
    const helperSource = readRepoFile(
      "lib/avanza-selected-recommendation-derived-preview-state.ts",
    );

    expect(panelSource).toContain("Preview only");
    expect(panelSource).toContain("Not execution-ready");
    expect(panelSource).toContain("Total-read unresolved/advisory");
    expect(panelSource).not.toContain("<button");
    expect(panelSource).not.toMatch(/onClick\s*=/);
    expect(helperSource).not.toMatch(/fetch\s*\(/);
    expect(helperSource).not.toMatch(/\/live-fill-only-runner\//);
    expect(helperSource).not.toMatch(/method:\s*["']POST["']/);
  });

  test("integration status label is read-only and has no active controls", () => {
    const source = readRepoFile("app/trade-app.tsx");
    const statusBlockStart = source.indexOf(
      "avanzaSelectedRecommendationPreviewIntegrationStatus.map",
    );
    const statusBlockEnd = source.indexOf(
      "<AvanzaPrepareHandoffPreviewShell",
      statusBlockStart,
    );
    const statusBlock = source.slice(statusBlockStart, statusBlockEnd);

    expect(source).toContain(
      "avanzaSelectedRecommendationPreviewIntegrationStatus.map",
    );
    expect(source).toContain("key={label}");
    expect(statusBlock).not.toMatch(/onClick\s*=/);
    expect(statusBlock).not.toMatch(/<button/);
  });

  test("existing selectedRecommendation modal behavior is allowed outside Avanza preview wiring", () => {
    const source = readRepoFile("app/trade-app.tsx");

    expect(source).toContain("const [selectedRecommendation, setSelectedRecommendation]");
    expect(source).toContain("async function openTradeModal(recommendation");
    expect(source).toContain("setSelectedRecommendation(recommendation)");
    expect(source).toContain("selectedRecommendationForDisplay");
  });
});
