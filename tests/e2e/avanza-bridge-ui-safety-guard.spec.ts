import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();

const uiFacingFiles = [
  "app/dev/avanza-visual-qa/page.tsx",
  "app/settings/page.tsx",
  "components/execution/AvanzaBridgeStatusPanel.tsx",
  "components/execution/AvanzaHandoffPackagePreviewCard.tsx",
  "components/execution/AvanzaPrepareHandoffPreviewShell.tsx",
  "components/execution/AvanzaReadOnlyReadinessBadge.tsx",
  "components/execution/AvanzaSelectedRecommendationPreWiringChecklistPanel.tsx",
  "components/execution/AvanzaSelectedRecommendationPreviewStateScenarioGalleryHarness.tsx",
  "components/execution/AvanzaSelectedRecommendationPreviewStateScenarioGallery.tsx",
  "components/execution/AvanzaSelectedRecommendationPreviewStatePanel.tsx",
  "components/execution/AvanzaSelectedRecommendationPreviewTestOnlyHarness.tsx",
  "components/execution/AvanzaDevVisibleSelectedRecommendationPreviewSurface.tsx",
  "components/execution/AvanzaDevVisibleSelectedRecommendationPreviewSurfaceGallery.tsx",
  "components/execution/AvanzaDevVisualQaRouteStatusPanel.tsx",
  "components/execution/AvanzaDevVisualQaRouteAccessHarness.tsx",
  "components/execution/AvanzaReadOnlySelectedRecommendationDerivationDecisionHarness.tsx",
  "components/execution/AvanzaReadOnlySelectedRecommendationDevPreviewGuardHarness.tsx",
  "components/execution/AvanzaRealSelectedRecommendationReadOnlyInputGuardHarness.tsx",
  "components/execution/AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapperHarness.tsx",
  "components/execution/AvanzaLocalBrowserAgentRuntimeHarness.tsx",
  "components/execution/AvanzaLocalPlaywrightBrowserAdapterHarness.tsx",
  "components/execution/AvanzaLocalPlaywrightPageActionBindingHarness.tsx",
  "components/execution/AvanzaLocalPlaywrightOrderPageActionBindingHarness.tsx",
  "components/execution/AvanzaInstrumentToOrderLocalDevExecutorHarness.tsx",
  "components/execution/AvanzaOrderChainSmokeTestRunnerHarness.tsx",
  "components/execution/AvanzaTerminalOrderSmokeScriptHarness.tsx",
  "components/execution/AvanzaLocalDevExecutionRunbookHarness.tsx",
  "components/execution/AvanzaLocalSmokeTestResultCaptureHarness.tsx",
  "components/execution/AvanzaPassiveExecutionReadinessPreview.tsx",
  "components/execution/AvanzaPassiveExecutionReadinessPreviewHarness.tsx",
  "components/execution/AvanzaSettingsPassiveExecutionReadinessPanel.tsx",
  "components/execution/AvanzaSettingsPassiveExecutionReadinessPanelHarness.tsx",
  "components/execution/AvanzaPassiveTradeExecutionReadinessHarness.tsx",
  "components/execution/AvanzaTradeCardExecutionReadinessBadge.tsx",
  "components/execution/AvanzaTradeCardExecutionReadinessAdapterHarness.tsx",
  "components/execution/AvanzaTradeCardExecutionReadinessVisualPreview.tsx",
  "components/execution/AvanzaTradeCardExecutionReadinessVisualPreviewHarness.tsx",
  "components/execution/AvanzaHeadlessExecutionDataContractHarness.tsx",
  "components/execution/AvanzaHeadlessExecutionContractSelectorHarness.tsx",
  "components/execution/AvanzaHeadlessAgentPlanBuilderHarness.tsx",
  "components/execution/AvanzaPageStateDetectorHarness.tsx",
  "components/execution/AvanzaSanitizedPageSnapshotHarness.tsx",
  "components/execution/AvanzaRealWorldLoginSignalsHarness.tsx",
  "components/execution/AvanzaRealWorldOrderFlowSignalsHarness.tsx",
  "components/execution/AvanzaSettlementNoteSignalsHarness.tsx",
  "components/execution/AvanzaSettlementNoteRouteContractHarness.tsx",
  "components/execution/AvanzaSettlementNoteActionContractHarness.tsx",
  "components/execution/AvanzaSettlementNoteExtractionSchemaHarness.tsx",
  "components/execution/AvanzaSettlementReconciliationMappingHarness.tsx",
  "components/execution/AvanzaSettlementReconciliationDryRunExecutorHarness.tsx",
  "components/execution/AvanzaSettlementReconciliationMockExecutorHarness.tsx",
  "components/execution/AvanzaExecutionArchitectureReadinessMapHarness.tsx",
  "components/execution/AvanzaRealWorldInstrumentSearchSignalsHarness.tsx",
  "components/execution/AvanzaInstrumentSearchRouteContractHarness.tsx",
  "components/execution/AvanzaInstrumentSearchActionContractHarness.tsx",
  "components/execution/AvanzaInstrumentToOrderHandoffChainHarness.tsx",
  "components/execution/AvanzaInstrumentToOrderDryRunExecutorHarness.tsx",
  "components/execution/AvanzaInstrumentToOrderMockExecutorHarness.tsx",
  "components/execution/AvanzaExecutionSettingsProfileHarness.tsx",
  "components/execution/AvanzaExecutionSettingsProfilePanel.tsx",
  "components/execution/AvanzaExecutionSettingsProfilePanelHarness.tsx",
  "components/execution/AvanzaOrderTicketFieldContractHarness.tsx",
  "components/execution/AvanzaOrderTicketActionContractHarness.tsx",
  "components/execution/AvanzaLoginRoutePlannerHarness.tsx",
  "components/execution/AvanzaLoginActionContractHarness.tsx",
  "components/execution/AvanzaLoginDryRunExecutorHarness.tsx",
  "components/execution/AvanzaLoginMockPageExecutorHarness.tsx",
  "components/execution/AvanzaLoginLocalDevExecutorHarness.tsx",
  "components/execution/AvanzaLoginAndCredentialReadinessHarness.tsx",
  "components/execution/AvanzaMacosKeychainCredentialProviderHarness.tsx",
  "components/execution/AvanzaLoginCredentialResolutionBridgeHarness.tsx",
  "components/execution/AvanzaLoginLocalDevCredentialExecutorHarness.tsx",
  "components/execution/AvanzaIsolatedLoginSmokeTestHarness.tsx",
  "components/execution/AvanzaIsolatedLoginSmokeTestRunnerHarness.tsx",
  "components/execution/AvanzaTerminalLoginSmokeScriptHarness.tsx",
  "lib/avanza-dev-visual-qa-route-access-fixtures.ts",
  "lib/avanza-dev-visual-qa-route-access.ts",
  "lib/avanza-local-browser-agent-runtime.ts",
  "lib/avanza-local-browser-agent-runtime-fixtures.ts",
  "lib/avanza-local-playwright-browser-adapter.ts",
  "lib/avanza-local-playwright-browser-adapter-fixtures.ts",
  "lib/avanza-local-playwright-page-action-binding.ts",
  "lib/avanza-local-playwright-page-action-binding-fixtures.ts",
  "lib/avanza-local-playwright-order-page-action-binding.ts",
  "lib/avanza-local-playwright-order-page-action-binding-fixtures.ts",
  "lib/avanza-instrument-to-order-local-dev-executor.ts",
  "lib/avanza-instrument-to-order-local-dev-executor-fixtures.ts",
  "lib/avanza-order-chain-smoke-test-runner.ts",
  "lib/avanza-order-chain-smoke-test-runner-fixtures.ts",
  "lib/avanza-terminal-order-smoke-script-fixtures.ts",
  "lib/avanza-local-dev-execution-runbook.ts",
  "lib/avanza-local-dev-execution-runbook-fixtures.ts",
  "lib/avanza-local-smoke-test-result-capture.ts",
  "lib/avanza-local-smoke-test-result-capture-fixtures.ts",
  "lib/avanza-passive-execution-readiness-preview.ts",
  "lib/avanza-passive-execution-readiness-preview-fixtures.ts",
  "lib/avanza-settings-passive-execution-readiness-fixtures.ts",
  "lib/avanza-passive-trade-execution-readiness.ts",
  "lib/avanza-passive-trade-execution-readiness-fixtures.ts",
  "lib/avanza-trade-card-execution-readiness-adapter.ts",
  "lib/avanza-trade-card-execution-readiness-adapter-fixtures.ts",
  "lib/avanza-page-state-detector.ts",
  "lib/avanza-page-state-detector-fixtures.ts",
  "lib/avanza-sanitized-page-snapshot.ts",
  "lib/avanza-sanitized-page-snapshot-fixtures.ts",
  "lib/avanza-real-world-login-signals.ts",
  "lib/avanza-real-world-login-signals-fixtures.ts",
  "lib/avanza-real-world-order-flow-signals.ts",
  "lib/avanza-real-world-order-flow-signals-fixtures.ts",
  "lib/avanza-real-world-settlement-note-signals.ts",
  "lib/avanza-real-world-settlement-note-signals-fixtures.ts",
  "lib/avanza-settlement-note-route-contract.ts",
  "lib/avanza-settlement-note-route-contract-fixtures.ts",
  "lib/avanza-settlement-note-action-contract.ts",
  "lib/avanza-settlement-note-action-contract-fixtures.ts",
  "lib/avanza-settlement-note-extraction-schema.ts",
  "lib/avanza-settlement-note-extraction-schema-fixtures.ts",
  "lib/avanza-settlement-reconciliation-mapping.ts",
  "lib/avanza-settlement-reconciliation-mapping-fixtures.ts",
  "lib/avanza-settlement-reconciliation-dry-run-executor.ts",
  "lib/avanza-settlement-reconciliation-dry-run-executor-fixtures.ts",
  "lib/avanza-settlement-reconciliation-mock-executor.ts",
  "lib/avanza-settlement-reconciliation-mock-executor-fixtures.ts",
  "lib/avanza-execution-architecture-readiness-map.ts",
  "lib/avanza-execution-architecture-readiness-map-fixtures.ts",
  "lib/avanza-real-world-instrument-search-signals.ts",
  "lib/avanza-real-world-instrument-search-signals-fixtures.ts",
  "lib/avanza-instrument-search-route-contract.ts",
  "lib/avanza-instrument-search-route-contract-fixtures.ts",
  "lib/avanza-instrument-search-action-contract.ts",
  "lib/avanza-instrument-search-action-contract-fixtures.ts",
  "lib/avanza-instrument-to-order-handoff-chain.ts",
  "lib/avanza-instrument-to-order-handoff-chain-fixtures.ts",
  "lib/avanza-instrument-to-order-dry-run-executor.ts",
  "lib/avanza-instrument-to-order-dry-run-executor-fixtures.ts",
  "lib/avanza-instrument-to-order-mock-executor.ts",
  "lib/avanza-instrument-to-order-mock-executor-fixtures.ts",
  "lib/avanza-execution-settings-profile.ts",
  "lib/avanza-execution-settings-profile-fixtures.ts",
  "lib/avanza-execution-settings-profile-ui-fixtures.ts",
  "lib/avanza-order-ticket-field-contract.ts",
  "lib/avanza-order-ticket-field-contract-fixtures.ts",
  "lib/avanza-order-ticket-action-contract.ts",
  "lib/avanza-order-ticket-action-contract-fixtures.ts",
  "lib/avanza-login-route-planner.ts",
  "lib/avanza-login-route-planner-fixtures.ts",
  "lib/avanza-login-action-contract.ts",
  "lib/avanza-login-action-contract-fixtures.ts",
  "lib/avanza-login-dry-run-executor.ts",
  "lib/avanza-login-dry-run-executor-fixtures.ts",
  "lib/avanza-login-mock-page-executor.ts",
  "lib/avanza-login-mock-page-executor-fixtures.ts",
  "lib/avanza-login-local-dev-executor.ts",
  "lib/avanza-login-local-dev-executor-fixtures.ts",
  "lib/avanza-login-state-detector.ts",
  "lib/avanza-login-state-detector-fixtures.ts",
  "lib/avanza-secure-credential-provider.ts",
  "lib/avanza-secure-credential-provider-fixtures.ts",
  "lib/avanza-macos-keychain-credential-provider.ts",
  "lib/avanza-macos-keychain-credential-provider-fixtures.ts",
  "lib/avanza-login-credential-resolution-bridge.ts",
  "lib/avanza-login-credential-resolution-bridge-fixtures.ts",
  "lib/avanza-login-local-dev-credential-executor.ts",
  "lib/avanza-login-local-dev-credential-executor-fixtures.ts",
  "lib/avanza-isolated-login-smoke-test.ts",
  "lib/avanza-isolated-login-smoke-test-fixtures.ts",
  "lib/avanza-isolated-login-smoke-test-runner.ts",
  "lib/avanza-isolated-login-smoke-test-runner-fixtures.ts",
  "lib/avanza-terminal-login-smoke-script-fixtures.ts",
  "scripts/avanza-order-chain-smoke-test.local.ts",
  "lib/avanza-dev-visible-preview-surface-fixtures.ts",
  "lib/avanza-read-only-selected-recommendation-derivation-decision-fixtures.ts",
  "lib/avanza-read-only-selected-recommendation-derivation-decision.ts",
  "lib/avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper.ts",
  "lib/avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-fixtures.ts",
  "lib/avanza-read-only-selected-recommendation-dev-preview-fixtures.ts",
  "lib/avanza-read-only-selected-recommendation-dev-preview-guard.ts",
  "lib/avanza-real-selected-recommendation-read-only-input-guard.ts",
  "lib/avanza-real-selected-recommendation-read-only-input-guard-fixtures.ts",
  "lib/avanza-handoff-package-preview-fixtures.ts",
  "lib/avanza-handoff-package-preview.ts",
  "lib/avanza-handoff-pre-activation-gate.ts",
  "lib/avanza-handoff-preview-source-mode.ts",
  "lib/avanza-handoff-safety-boundary-summary.ts",
  "lib/avanza-selected-recommendation-handoff-contract.ts",
  "lib/avanza-selected-recommendation-adapter.ts",
  "lib/avanza-selected-recommendation-adapter-fixtures.ts",
  "lib/avanza-selected-recommendation-derived-preview-state.ts",
  "lib/avanza-selected-recommendation-pre-wiring-checklist.ts",
  "lib/avanza-selected-recommendation-preview-integration-guard.ts",
  "lib/avanza-selected-recommendation-preview-state-fixtures.ts",
  "lib/avanza-selected-recommendation-preview-state.ts",
  "lib/avanza-ture-recommendation-handoff-mapper.ts",
  "lib/avanza-prepare-handoff-preview.ts",
  "lib/avanza-scenario-gallery-access.ts",
  "lib/avanza-bridge-readiness-checklist.ts",
  "lib/avanza-local-bridge-readonly-fetcher.ts",
  "lib/avanza-local-bridge-status.ts",
] as const;

const allowedReadOnlyEndpointPaths = [
  "/health",
  "/self-check",
  "/preflight/avanza-order-form",
] as const;

const forbiddenLiteralFragments = [
  "/live-fill-only-runner/run-approved-quantity-based-fill-only-trigger",
  "/live-fill-only-runner/fill-quantity",
  "/live-fill-only-runner/fill-price",
  "/live-fill-only-runner/fill-amount",
  "FINAL LIVE EXECUTE ATTEMPT EXPLICIT INVOCATION TRIGGER",
  "I explicitly request the final live fill-only execute attempt trigger now",
  "Bekräfta köp/sälj",
] as const;

const forbiddenExecutablePatterns = [
  /\bonClick\s*=\s*{[^}]*Granska\s+k[oö]p/i,
  /\b(click|press|tap)(Granska|Review|Bekrafta|Bekräfta|Confirm|Submit|Order)/i,
  /\b(openReviewModal|clickReview|clickConfirm|clickBekrafta|clickBekr[aä]fta)\b/i,
  /\b(submitOrder|placeOrder|confirmOrder|executeOrder|sendOrder)\b/i,
  /\bmethod\s*:\s*["']POST["']/i,
] as const;

function readRepoFile(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

test.describe("Avanza bridge UI safety guard", () => {
  test("UI-facing bridge files do not contain live runner endpoints or trigger phrase", () => {
    for (const file of uiFacingFiles) {
      const source = readRepoFile(file);

      for (const fragment of forbiddenLiteralFragments) {
        expect(source, `${file} must not contain ${fragment}`).not.toContain(
          fragment,
        );
      }
    }
  });

  test("UI-facing bridge files do not contain executable review/final/submit/order paths", () => {
    for (const file of uiFacingFiles) {
      const source = readRepoFile(file);

      for (const pattern of forbiddenExecutablePatterns) {
        expect(source, `${file} must not match ${pattern}`).not.toMatch(pattern);
      }
    }
  });

  test("read-only fetcher allowlist contains only permitted GET endpoints", () => {
    const source = readRepoFile("lib/avanza-local-bridge-readonly-fetcher.ts");

    for (const endpoint of allowedReadOnlyEndpointPaths) {
      expect(source).toContain(endpoint);
    }

    expect(source).toContain('method: "GET"');
    expect(source).toContain('credentials: "omit"');
    expect(source).not.toContain('"POST"');
    expect(source).not.toMatch(/\/live-fill-only-runner\//);
  });

  test("safety copy may mention review/submit boundaries without adding actions", () => {
    const panelSource = readRepoFile(
      "components/execution/AvanzaBridgeStatusPanel.tsx",
    );

    expect(panelSource).toContain("Ture will not click Granska köp");
    expect(panelSource).toContain("Ture will not submit an order");
    expect(panelSource).toContain("Manual review required in Avanza");
    expect(panelSource).toContain("No order can be placed from this panel");
    expect(panelSource).not.toMatch(/\/live-fill-only-runner\//);
    expect(panelSource).not.toMatch(/fetch\s*\(/);
  });

  test("Trade card execution readiness badge flag stays default-off and passive", () => {
    const tradeAppSource = readRepoFile("app/trade-app.tsx");
    const flagIndex = tradeAppSource.indexOf(
      "const ENABLE_PASSIVE_TRADE_CARD_EXECUTION_READINESS_BADGE = false;",
    );
    const helperIndex = tradeAppSource.indexOf(
      "function buildRecommendationTradeCardExecutionReadiness",
    );
    const endIndex = tradeAppSource.indexOf("export function TradeApp", helperIndex);

    expect(flagIndex).toBeGreaterThanOrEqual(0);
    expect(helperIndex).toBeGreaterThan(flagIndex);
    expect(endIndex).toBeGreaterThan(helperIndex);
    expect(tradeAppSource).toContain(
      "const ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW = false;",
    );

    const passiveBadgeWiringSource = tradeAppSource.slice(helperIndex, endIndex);

    expect(passiveBadgeWiringSource).toContain(
      "if (!ENABLE_PASSIVE_TRADE_CARD_EXECUTION_READINESS_BADGE)",
    );
    expect(passiveBadgeWiringSource).toContain("return null;");
    expect(passiveBadgeWiringSource).toContain("source: \"recommendation\"");
    expect(passiveBadgeWiringSource).toContain("source: \"live_position\"");
    expect(passiveBadgeWiringSource).not.toMatch(/\bfetch\s*\(/);
    expect(passiveBadgeWiringSource).not.toMatch(/\/api\/|app\/api\//);
    expect(passiveBadgeWiringSource).not.toMatch(/from\s+["']playwright["']/);
    expect(passiveBadgeWiringSource).not.toMatch(/chromium\.launch|page\.goto/);
    expect(passiveBadgeWiringSource).not.toMatch(/document\.cookie|cookies\(\)/i);
    expect(passiveBadgeWiringSource).not.toMatch(/localStorage|sessionStorage/);
    expect(passiveBadgeWiringSource).not.toMatch(/keychain/i);
    expect(passiveBadgeWiringSource).not.toMatch(/supabase\.(from|insert|rpc)/i);
    expect(passiveBadgeWiringSource).not.toMatch(
      /submitOrder\s*\(|placeOrder\s*\(|confirmOrder\s*\(|executeOrder\s*\(|sendOrder\s*\(/i,
    );
  });

  test("Trade card readiness badge visual preview stays fixture-only", () => {
    const previewSource = readRepoFile(
      "components/execution/AvanzaTradeCardExecutionReadinessVisualPreview.tsx",
    );
    const harnessSource = readRepoFile(
      "components/execution/AvanzaTradeCardExecutionReadinessVisualPreviewHarness.tsx",
    );
    const routeSource = readRepoFile("app/dev/avanza-visual-qa/page.tsx");
    const tradeAppSource = readRepoFile("app/trade-app.tsx");
    const combinedSource = [previewSource, harnessSource].join("\n");

    expect(routeSource).toContain(
      "AvanzaTradeCardExecutionReadinessVisualPreviewHarness",
    );
    expect(routeSource).toContain(
      "Trade card readiness badge visual preview",
    );
    expect(combinedSource).toContain("Feature flag remains default-off");
    expect(combinedSource).toContain("Fixture/model only");
    expect(combinedSource).toContain("Recommendation card badge preview");
    expect(combinedSource).toContain("Live-position card badge preview");
    expect(combinedSource).toContain("No active handoff");
    expect(combinedSource).toContain("No prepare action");
    expect(combinedSource).toContain("No buy/sell CTA");
    expect(combinedSource).toContain("No API route call");
    expect(combinedSource).toContain("No fetch/polling");
    expect(combinedSource).toContain("No smoke test from UI");
    expect(combinedSource).toContain("No credential access");
    expect(combinedSource).toContain("No cookies/session");
    expect(combinedSource).toContain("No BankID automation");
    expect(combinedSource).toContain("No order submission");
    expect(combinedSource).toContain("No final KÖP/SÄLJ click");
    expect(combinedSource).toContain("Not production ready");
    expect(tradeAppSource).toContain(
      "const ENABLE_PASSIVE_TRADE_CARD_EXECUTION_READINESS_BADGE = false;",
    );
    expect(tradeAppSource).toContain(
      "const ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW = false;",
    );
    expect(tradeAppSource).not.toContain(
      "AvanzaTradeCardExecutionReadinessVisualPreview",
    );
    expect(combinedSource).not.toMatch(/\bfetch\s*\(/);
    expect(combinedSource).not.toMatch(/\/api\/|app\/api\//);
    expect(combinedSource).not.toMatch(/from\s+["']playwright["']/);
    expect(combinedSource).not.toMatch(/chromium\.launch|page\.goto/);
    expect(combinedSource).not.toMatch(/document\.cookie|cookies\(\)/i);
    expect(combinedSource).not.toMatch(/localStorage|sessionStorage/);
    expect(combinedSource).not.toMatch(/keychain/i);
    expect(combinedSource).not.toMatch(/supabase\.(from|insert|rpc)/i);
    expect(combinedSource).not.toMatch(/<button\b|onClick\s*=/);
    expect(combinedSource).not.toMatch(
      /submitOrder\s*\(|placeOrder\s*\(|confirmOrder\s*\(|executeOrder\s*\(|sendOrder\s*\(/i,
    );
  });

  test("headless execution data contract stays UI-hidden and passive", () => {
    const modelSource = readRepoFile(
      "lib/avanza-headless-execution-data-contract.ts",
    );
    const fixtureSource = readRepoFile(
      "lib/avanza-headless-execution-data-contract-fixtures.ts",
    );
    const harnessSource = readRepoFile(
      "components/execution/AvanzaHeadlessExecutionDataContractHarness.tsx",
    );
    const routeSource = readRepoFile("app/dev/avanza-visual-qa/page.tsx");
    const tradeAppSource = readRepoFile("app/trade-app.tsx");
    const combinedSource = [modelSource, fixtureSource, harnessSource].join("\n");

    expect(routeSource).toContain("AvanzaHeadlessExecutionDataContractHarness");
    expect(routeSource).toContain("Avanza headless execution data contract");
    expect(combinedSource).toContain("Hidden under the surface");
    expect(combinedSource).toContain("Agent-readable, UI-hidden");
    expect(combinedSource).toContain("Recommendation entry BUY contract modeled");
    expect(combinedSource).toContain("Live-position exit SELL contract modeled");
    expect(combinedSource).toContain("Settlement expectation modeled");
    expect(combinedSource).toContain("Human final KÖP/SÄLJ required");
    expect(combinedSource).toContain("No visible Trade UI changes");
    expect(combinedSource).toContain("visibleInUi: false");
    expect(combinedSource).toContain("canRenderVisualBadge: false");
    expect(combinedSource).toContain("canStartHandoff: false");
    expect(combinedSource).toContain("canPrepareOrder: false");
    expect(combinedSource).toContain("canCallApiRoute: false");
    expect(combinedSource).toContain("canFetch: false");
    expect(combinedSource).toContain("canPoll: false");
    expect(combinedSource).toContain("canUseBrowserAutomation: false");
    expect(combinedSource).toContain("canAccessCredentials: false");
    expect(combinedSource).toContain("canReadCookies: false");
    expect(combinedSource).toContain("canSubmitOrder: false");
    expect(combinedSource).toContain("canClickFinalBuy: false");
    expect(combinedSource).toContain("canClickFinalSell: false");
    expect(combinedSource).toContain("canWriteSupabase: false");
    expect(combinedSource).toContain("gateLocked: true");
    expect(tradeAppSource).toContain(
      "const ENABLE_PASSIVE_TRADE_CARD_EXECUTION_READINESS_BADGE = false;",
    );
    expect(tradeAppSource).toContain(
      "const ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW = false;",
    );
    expect(tradeAppSource).not.toContain("avanza-headless-execution-data-contract");
    expect(combinedSource).not.toMatch(/\bfetch\s*\(/);
    expect(combinedSource).not.toMatch(/\/api\/|app\/api\//);
    expect(combinedSource).not.toMatch(/from\s+["']playwright["']/);
    expect(combinedSource).not.toMatch(/chromium\.launch|page\.goto/);
    expect(combinedSource).not.toMatch(/document\.cookie|cookies\(\)/i);
    expect(combinedSource).not.toMatch(/localStorage|sessionStorage/);
    expect(combinedSource).not.toMatch(/keychain/i);
    expect(combinedSource).not.toMatch(/supabase\.(from|insert|rpc)/i);
    expect(combinedSource).not.toMatch(/<button\b|onClick\s*=/);
    expect(combinedSource).not.toMatch(
      /submitOrder\s*\(|placeOrder\s*\(|confirmOrder\s*\(|executeOrder\s*\(|sendOrder\s*\(/i,
    );
  });

  test("headless execution contract selector stays UI-hidden and passive", () => {
    const selectorSource = readRepoFile(
      "lib/avanza-headless-execution-contract-selector.ts",
    );
    const fixtureSource = readRepoFile(
      "lib/avanza-headless-execution-contract-selector-fixtures.ts",
    );
    const harnessSource = readRepoFile(
      "components/execution/AvanzaHeadlessExecutionContractSelectorHarness.tsx",
    );
    const routeSource = readRepoFile("app/dev/avanza-visual-qa/page.tsx");
    const tradeAppSource = readRepoFile("app/trade-app.tsx");
    const combinedSource = [selectorSource, fixtureSource, harnessSource].join("\n");

    expect(routeSource).toContain("AvanzaHeadlessExecutionContractSelectorHarness");
    expect(routeSource).toContain("Avanza headless execution contract selector");
    expect(combinedSource).toContain("Hidden under the surface");
    expect(combinedSource).toContain("Agent-readable, UI-hidden");
    expect(combinedSource).toContain("Exits outrank entries");
    expect(combinedSource).toContain("Stop-loss outranks target");
    expect(combinedSource).toContain("Target outranks entry");
    expect(combinedSource).toContain("Recommendation entry BUY selection modeled");
    expect(combinedSource).toContain("Live-position exit SELL selection modeled");
    expect(combinedSource).toContain("No visible Trade UI changes");
    expect(combinedSource).toContain("visibleInUi: false");
    expect(combinedSource).toContain("canStartHandoff: false");
    expect(combinedSource).toContain("canPrepareOrder: false");
    expect(combinedSource).toContain("canCallApiRoute: false");
    expect(combinedSource).toContain("canFetch: false");
    expect(combinedSource).toContain("canPoll: false");
    expect(combinedSource).toContain("canUseBrowserAutomation: false");
    expect(combinedSource).toContain("canAccessCredentials: false");
    expect(combinedSource).toContain("canReadCookies: false");
    expect(combinedSource).toContain("canSubmitOrder: false");
    expect(combinedSource).toContain("canClickFinalBuy: false");
    expect(combinedSource).toContain("canClickFinalSell: false");
    expect(combinedSource).toContain("canWriteSupabase: false");
    expect(combinedSource).toContain("gateLocked: true");
    expect(tradeAppSource).toContain(
      "const ENABLE_PASSIVE_TRADE_CARD_EXECUTION_READINESS_BADGE = false;",
    );
    expect(tradeAppSource).toContain(
      "const ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW = false;",
    );
    expect(tradeAppSource).not.toContain(
      "avanza-headless-execution-contract-selector",
    );
    expect(combinedSource).not.toMatch(/\bfetch\s*\(/);
    expect(combinedSource).not.toMatch(/\/api\/|app\/api\//);
    expect(combinedSource).not.toMatch(/from\s+["']playwright["']/);
    expect(combinedSource).not.toMatch(/chromium\.launch|page\.goto/);
    expect(combinedSource).not.toMatch(/document\.cookie|cookies\(\)/i);
    expect(combinedSource).not.toMatch(/localStorage|sessionStorage/);
    expect(combinedSource).not.toMatch(/keychain/i);
    expect(combinedSource).not.toMatch(/supabase\.(from|insert|rpc)/i);
    expect(combinedSource).not.toMatch(/<button\b|onClick\s*=/);
    expect(combinedSource).not.toMatch(
      /submitOrder\s*\(|placeOrder\s*\(|confirmOrder\s*\(|executeOrder\s*\(|sendOrder\s*\(/i,
    );
  });

  test("headless agent plan builder stays UI-hidden and passive", () => {
    const builderSource = readRepoFile(
      "lib/avanza-headless-agent-plan-builder.ts",
    );
    const fixtureSource = readRepoFile(
      "lib/avanza-headless-agent-plan-builder-fixtures.ts",
    );
    const harnessSource = readRepoFile(
      "components/execution/AvanzaHeadlessAgentPlanBuilderHarness.tsx",
    );
    const routeSource = readRepoFile("app/dev/avanza-visual-qa/page.tsx");
    const tradeAppSource = readRepoFile("app/trade-app.tsx");
    const combinedSource = [builderSource, fixtureSource, harnessSource].join("\n");

    expect(routeSource).toContain("AvanzaHeadlessAgentPlanBuilderHarness");
    expect(routeSource).toContain("Avanza headless agent plan builder");
    expect(combinedSource).toContain("Hidden under the surface");
    expect(combinedSource).toContain("Agent-readable, UI-hidden");
    expect(combinedSource).toContain("Recommendation BUY plan modeled");
    expect(combinedSource).toContain("Live-position SELL plan modeled");
    expect(combinedSource).toContain("Login path planned only");
    expect(combinedSource).toContain("Instrument search planned only");
    expect(combinedSource).toContain("Limit order preparation planned only");
    expect(combinedSource).toContain("Stop before final confirmation");
    expect(combinedSource).toContain("Human final KÖP/SÄLJ required");
    expect(combinedSource).toContain("Settlement reconciliation planned");
    expect(combinedSource).toContain("No visible Trade UI changes");
    expect(combinedSource).toContain("No browser automation now");
    expect(combinedSource).toContain("visibleInUi: false");
    expect(combinedSource).toContain("canStartHandoff: false");
    expect(combinedSource).toContain("canPrepareOrderNow: false");
    expect(combinedSource).toContain("canRunSmokeTestFromUi: false");
    expect(combinedSource).toContain("canCallApiRoute: false");
    expect(combinedSource).toContain("canFetch: false");
    expect(combinedSource).toContain("canPoll: false");
    expect(combinedSource).toContain("canUseBrowserAutomationNow: false");
    expect(combinedSource).toContain("canAccessCredentials: false");
    expect(combinedSource).toContain("canReadCookies: false");
    expect(combinedSource).toContain("canSubmitOrder: false");
    expect(combinedSource).toContain("canClickFinalBuy: false");
    expect(combinedSource).toContain("canClickFinalSell: false");
    expect(combinedSource).toContain("canWriteSupabase: false");
    expect(combinedSource).toContain("canClaimProductionReady: false");
    expect(combinedSource).toContain("finalHumanClickRequired: true");
    expect(combinedSource).toContain("gateLocked: true");
    expect(tradeAppSource).toContain(
      "const ENABLE_PASSIVE_TRADE_CARD_EXECUTION_READINESS_BADGE = false;",
    );
    expect(tradeAppSource).toContain(
      "const ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW = false;",
    );
    expect(tradeAppSource).not.toContain("avanza-headless-agent-plan-builder");
    expect(combinedSource).not.toMatch(/\bfetch\s*\(/);
    expect(combinedSource).not.toMatch(/\/api\/|app\/api\//);
    expect(combinedSource).not.toMatch(/from\s+["']playwright["']/);
    expect(combinedSource).not.toMatch(/chromium\.launch|page\.goto/);
    expect(combinedSource).not.toMatch(/document\.cookie|cookies\(\)/i);
    expect(combinedSource).not.toMatch(/localStorage|sessionStorage/);
    expect(combinedSource).not.toMatch(/keychain/i);
    expect(combinedSource).not.toMatch(/supabase\.(from|insert|rpc)/i);
    expect(combinedSource).not.toMatch(/<button\b|onClick\s*=/);
    expect(combinedSource).not.toMatch(
      /submitOrder\s*\(|placeOrder\s*\(|confirmOrder\s*\(|executeOrder\s*\(|sendOrder\s*\(/i,
    );
  });

  test("guard is documented in Avanza bridge data-layer plan", () => {
    const doc = readRepoFile(
      "docs/avanza-bridge-read-only-status-data-layer-plan.md",
    );

    expect(doc).toContain("avanza_bridge_ui_static_safety_guard_added");
    expect(doc).toContain("tests/e2e/avanza-bridge-ui-safety-guard.spec.ts");
    expect(doc).toContain("forbidden live runner endpoints");
    expect(doc).toContain("exact trigger phrase");
  });
});
