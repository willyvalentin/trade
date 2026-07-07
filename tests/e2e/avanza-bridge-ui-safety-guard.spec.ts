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
  "components/execution/AvanzaHeadlessExecutionSessionStateMachineHarness.tsx",
  "components/execution/AvanzaHeadlessExecutionOrchestrationPipelineHarness.tsx",
  "components/execution/AvanzaHeadlessExecutionArchitectureCheckpointHarness.tsx",
  "components/execution/AvanzaLocalDevBridgeContractHarness.tsx",
  "components/execution/AvanzaLocalDevBridgeActivationChecklistHarness.tsx",
  "components/execution/AvanzaDisabledLocalDevBridgeRunnerHarness.tsx",
  "components/execution/AvanzaModelOnlyLocalDevBridgeDryRunnerHarness.tsx",
  "components/execution/AvanzaLocalDevBridgeReadinessCheckpointHarness.tsx",
  "components/execution/AvanzaManualLocalDevInvocationApprovalRunbookHarness.tsx",
  "lib/avanza-manual-local-dev-invocation-approval-runbook.ts",
  "lib/avanza-manual-local-dev-invocation-approval-runbook-fixtures.ts",
  "components/execution/AvanzaDisabledLocalDevInvocationAdapterContractHarness.tsx",
  "lib/avanza-disabled-local-dev-invocation-adapter-contract.ts",
  "lib/avanza-disabled-local-dev-invocation-adapter-contract-fixtures.ts",
  "components/execution/AvanzaDisabledInvocationAdapterPayloadValidatorHarness.tsx",
  "lib/avanza-disabled-invocation-adapter-payload-validator.ts",
  "lib/avanza-disabled-invocation-adapter-payload-validator-fixtures.ts",
  "components/execution/AvanzaInvocationAdapterDesignCheckpointHarness.tsx",
  "lib/avanza-invocation-adapter-design-checkpoint.ts",
  "lib/avanza-invocation-adapter-design-checkpoint-fixtures.ts",
  "components/execution/AvanzaSharpSemiAutoExecutionPhaseCheckpointHarness.tsx",
  "lib/avanza-sharp-semi-auto-execution-phase-checkpoint.ts",
  "lib/avanza-sharp-semi-auto-execution-phase-checkpoint-fixtures.ts",
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
  "lib/avanza-headless-execution-architecture-checkpoint.ts",
  "lib/avanza-headless-execution-architecture-checkpoint-fixtures.ts",
  "lib/avanza-local-dev-bridge-contract.ts",
  "lib/avanza-local-dev-bridge-contract-fixtures.ts",
  "lib/avanza-local-dev-bridge-activation-checklist.ts",
  "lib/avanza-local-dev-bridge-activation-checklist-fixtures.ts",
  "lib/avanza-disabled-local-dev-bridge-runner.ts",
  "lib/avanza-disabled-local-dev-bridge-runner-fixtures.ts",
  "lib/avanza-model-only-local-dev-bridge-dry-runner.ts",
  "lib/avanza-model-only-local-dev-bridge-dry-runner-fixtures.ts",
  "lib/avanza-local-dev-bridge-readiness-checkpoint.ts",
  "lib/avanza-local-dev-bridge-readiness-checkpoint-fixtures.ts",
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

  test("headless execution session state machine stays UI-hidden and passive", () => {
    const stateMachineSource = readRepoFile(
      "lib/avanza-headless-execution-session-state-machine.ts",
    );
    const fixtureSource = readRepoFile(
      "lib/avanza-headless-execution-session-state-machine-fixtures.ts",
    );
    const harnessSource = readRepoFile(
      "components/execution/AvanzaHeadlessExecutionSessionStateMachineHarness.tsx",
    );
    const routeSource = readRepoFile("app/dev/avanza-visual-qa/page.tsx");
    const tradeAppSource = readRepoFile("app/trade-app.tsx");
    const combinedSource = [stateMachineSource, fixtureSource, harnessSource].join("\n");

    expect(routeSource).toContain(
      "AvanzaHeadlessExecutionSessionStateMachineHarness",
    );
    expect(routeSource).toContain(
      "Avanza headless execution session state machine",
    );
    expect(combinedSource).toContain("Hidden under the surface");
    expect(combinedSource).toContain("Agent-readable, UI-hidden");
    expect(combinedSource).toContain("Recommendation BUY session modeled");
    expect(combinedSource).toContain("Live-position SELL session modeled");
    expect(combinedSource).toContain("Plan-to-review lifecycle modeled");
    expect(combinedSource).toContain("Waiting for manual final confirmation");
    expect(combinedSource).toContain(
      "User final click observed, agent final click forbidden",
    );
    expect(combinedSource).toContain("Settlement reconciliation pending");
    expect(combinedSource).toContain("Invalid transitions rejected");
    expect(combinedSource).toContain("No visible Trade UI changes");
    expect(combinedSource).toContain("No browser automation now");
    expect(combinedSource).toContain("stateMachineOnly: true");
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
    expect(tradeAppSource).not.toContain(
      "avanza-headless-execution-session-state-machine",
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

  test("headless execution orchestration pipeline stays UI-hidden and passive", () => {
    const pipelineSource = readRepoFile(
      "lib/avanza-headless-execution-orchestration-pipeline.ts",
    );
    const fixtureSource = readRepoFile(
      "lib/avanza-headless-execution-orchestration-pipeline-fixtures.ts",
    );
    const harnessSource = readRepoFile(
      "components/execution/AvanzaHeadlessExecutionOrchestrationPipelineHarness.tsx",
    );
    const routeSource = readRepoFile("app/dev/avanza-visual-qa/page.tsx");
    const tradeAppSource = readRepoFile("app/trade-app.tsx");
    const combinedSource = [pipelineSource, fixtureSource, harnessSource].join("\n");

    expect(routeSource).toContain(
      "AvanzaHeadlessExecutionOrchestrationPipelineHarness",
    );
    expect(routeSource).toContain(
      "Avanza headless execution orchestration pipeline",
    );
    expect(combinedSource).toContain("Hidden under the surface");
    expect(combinedSource).toContain("Agent-readable, UI-hidden");
    expect(combinedSource).toContain(
      "Contract-to-selector-to-plan-to-session modeled",
    );
    expect(combinedSource).toContain("Recommendation BUY orchestration modeled");
    expect(combinedSource).toContain("Live-position SELL orchestration modeled");
    expect(combinedSource).toContain("Exit priority modeled");
    expect(combinedSource).toContain("Stop-loss priority modeled");
    expect(combinedSource).toContain("Session initialized to plan-ready");
    expect(combinedSource).toContain("Next theoretical agent step modeled");
    expect(combinedSource).toContain("Final KÖP/SÄLJ human-only");
    expect(combinedSource).toContain("No visible Trade UI changes");
    expect(combinedSource).toContain("No browser automation now");
    expect(combinedSource).toContain("orchestrationOnly: true");
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
    expect(tradeAppSource).not.toContain(
      "avanza-headless-execution-orchestration-pipeline",
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

  test("headless execution architecture checkpoint stays UI-hidden and passive", () => {
    const checkpointSource = readRepoFile(
      "lib/avanza-headless-execution-architecture-checkpoint.ts",
    );
    const fixtureSource = readRepoFile(
      "lib/avanza-headless-execution-architecture-checkpoint-fixtures.ts",
    );
    const harnessSource = readRepoFile(
      "components/execution/AvanzaHeadlessExecutionArchitectureCheckpointHarness.tsx",
    );
    const routeSource = readRepoFile("app/dev/avanza-visual-qa/page.tsx");
    const tradeAppSource = readRepoFile("app/trade-app.tsx");
    const combinedSource = [checkpointSource, fixtureSource, harnessSource].join(
      "\n",
    );

    expect(routeSource).toContain(
      "AvanzaHeadlessExecutionArchitectureCheckpointHarness",
    );
    expect(routeSource).toContain(
      "Avanza headless execution architecture checkpoint",
    );
    expect(combinedSource).toContain("Fixture/model only");
    expect(combinedSource).toContain("Hidden under the surface");
    expect(combinedSource).toContain("Agent-readable, UI-hidden");
    expect(combinedSource).toContain("Complete headless chain reviewed");
    expect(combinedSource).toContain("Contract layer ready");
    expect(combinedSource).toContain("Selector layer ready");
    expect(combinedSource).toContain("Plan builder layer ready");
    expect(combinedSource).toContain("Session state machine ready");
    expect(combinedSource).toContain("Orchestration pipeline ready");
    expect(combinedSource).toContain("Local-dev bridge gate not open");
    expect(combinedSource).toContain("Trade UI execution gate locked");
    expect(combinedSource).toContain("API route execution gate locked");
    expect(combinedSource).toContain("Browser automation gate locked");
    expect(combinedSource).toContain("Final KÖP/SÄLJ human-only");
    expect(combinedSource).toContain("Order submission forbidden");
    expect(combinedSource).toContain("BankID automation forbidden");
    expect(combinedSource).toContain("Cookies/session forbidden");
    expect(combinedSource).toContain("Supabase writes locked");
    expect(combinedSource).toContain("Production readiness blocked");
    expect(combinedSource).toContain("checkpointOnly: true");
    expect(combinedSource).toContain("headlessOnly: true");
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
    expect(combinedSource).toContain("canExecute: false");
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
    expect(tradeAppSource).not.toContain(
      "avanza-headless-execution-architecture-checkpoint",
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

  test("local-dev bridge contract stays UI-hidden and blocks runner invocation", () => {
    const contractSource = readRepoFile("lib/avanza-local-dev-bridge-contract.ts");
    const fixtureSource = readRepoFile(
      "lib/avanza-local-dev-bridge-contract-fixtures.ts",
    );
    const harnessSource = readRepoFile(
      "components/execution/AvanzaLocalDevBridgeContractHarness.tsx",
    );
    const routeSource = readRepoFile("app/dev/avanza-visual-qa/page.tsx");
    const tradeAppSource = readRepoFile("app/trade-app.tsx");
    const combinedSource = [contractSource, fixtureSource, harnessSource].join(
      "\n",
    );

    expect(routeSource).toContain("AvanzaLocalDevBridgeContractHarness");
    expect(routeSource).toContain("Avanza local-dev bridge contract");
    expect(combinedSource).toContain("Fixture/model only");
    expect(combinedSource).toContain("Hidden under the surface");
    expect(combinedSource).toContain("Agent-readable, UI-hidden");
    expect(combinedSource).toContain(
      "Orchestration-to-smoke request candidate modeled",
    );
    expect(combinedSource).toContain("Local-dev bridge gate not open");
    expect(combinedSource).toContain("Terminal-only future path");
    expect(combinedSource).toContain("Env opt-in required");
    expect(combinedSource).toContain("Manual terminal confirmation required");
    expect(combinedSource).toContain("Separate real-run flag required");
    expect(combinedSource).toContain("Smoke runner invocation blocked");
    expect(combinedSource).toContain("Browser automation gate locked");
    expect(combinedSource).toContain("Credential access gate locked");
    expect(combinedSource).toContain("Cookies/session forbidden");
    expect(combinedSource).toContain("BankID automation forbidden");
    expect(combinedSource).toContain("Order submission forbidden");
    expect(combinedSource).toContain("Final KÖP/SÄLJ human-only");
    expect(combinedSource).toContain("Supabase writes locked");
    expect(combinedSource).toContain("bridgeContractOnly: true");
    expect(combinedSource).toContain("headlessOnly: true");
    expect(combinedSource).toContain("visibleInUi: false");
    expect(combinedSource).toContain("canOpenLocalDevBridgeGate: false");
    expect(combinedSource).toContain("canInvokeSmokeRunnerNow: false");
    expect(combinedSource).toContain("canRunTerminalScriptNow: false");
    expect(combinedSource).toContain("canUseBrowserAutomationNow: false");
    expect(combinedSource).toContain("canStartHandoff: false");
    expect(combinedSource).toContain("canPrepareOrderNow: false");
    expect(combinedSource).toContain("canRunSmokeTestFromUi: false");
    expect(combinedSource).toContain("canCallApiRoute: false");
    expect(combinedSource).toContain("canFetch: false");
    expect(combinedSource).toContain("canPoll: false");
    expect(combinedSource).toContain("canAccessCredentials: false");
    expect(combinedSource).toContain("canReadCookies: false");
    expect(combinedSource).toContain("canExportSession: false");
    expect(combinedSource).toContain("canAutomateBankId: false");
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
    expect(tradeAppSource).not.toContain("avanza-local-dev-bridge-contract");
    expect(combinedSource).not.toMatch(/\bfetch\s*\(/);
    expect(combinedSource).not.toMatch(/\/api\/|app\/api\//);
    expect(combinedSource).not.toMatch(/from\s+["']playwright["']/);
    expect(combinedSource).not.toMatch(/chromium\.launch|page\.goto/);
    expect(combinedSource).not.toMatch(/document\.cookie|cookies\(\)/i);
    expect(combinedSource).not.toMatch(/localStorage|sessionStorage/);
    expect(combinedSource).not.toMatch(/keychain/i);
    expect(combinedSource).not.toMatch(/supabase\.(from|insert|rpc)/i);
    expect(combinedSource).not.toMatch(/<button\b|onClick\s*=/);
    expect(combinedSource).not.toContain("avanza-login-smoke-test.local");
    expect(combinedSource).not.toContain("avanza-order-chain-smoke-test.local");
    expect(combinedSource).not.toMatch(
      /runAvanzaOrderChainSmokeTest|runAvanzaIsolatedLoginSmokeTest/i,
    );
    expect(combinedSource).not.toMatch(
      /submitOrder\s*\(|placeOrder\s*\(|confirmOrder\s*\(|executeOrder\s*\(|sendOrder\s*\(/i,
    );
  });

  test("local-dev bridge activation checklist stays UI-hidden and blocks runtime", () => {
    const checklistSource = readRepoFile(
      "lib/avanza-local-dev-bridge-activation-checklist.ts",
    );
    const fixtureSource = readRepoFile(
      "lib/avanza-local-dev-bridge-activation-checklist-fixtures.ts",
    );
    const harnessSource = readRepoFile(
      "components/execution/AvanzaLocalDevBridgeActivationChecklistHarness.tsx",
    );
    const routeSource = readRepoFile("app/dev/avanza-visual-qa/page.tsx");
    const tradeAppSource = readRepoFile("app/trade-app.tsx");
    const combinedSource = [checklistSource, fixtureSource, harnessSource].join(
      "\n",
    );

    expect(routeSource).toContain(
      "AvanzaLocalDevBridgeActivationChecklistHarness",
    );
    expect(routeSource).toContain("Avanza local-dev bridge activation checklist");
    expect(combinedSource).toContain("Fixture/model only");
    expect(combinedSource).toContain("Hidden under the surface");
    expect(combinedSource).toContain("Agent-readable, UI-hidden");
    expect(combinedSource).toContain("Manual review required");
    expect(combinedSource).toContain("Disabled runner design approval modeled");
    expect(combinedSource).toContain("Bridge gate still locked");
    expect(combinedSource).toContain("Smoke runner invocation blocked");
    expect(combinedSource).toContain("Terminal-only future path");
    expect(combinedSource).toContain("Env opt-in required");
    expect(combinedSource).toContain("Manual terminal confirmation required");
    expect(combinedSource).toContain("Separate real-run flag required");
    expect(combinedSource).toContain("Browser automation gate locked");
    expect(combinedSource).toContain("Credential access gate locked");
    expect(combinedSource).toContain("Cookies/session forbidden");
    expect(combinedSource).toContain("BankID automation forbidden");
    expect(combinedSource).toContain("Order submission forbidden");
    expect(combinedSource).toContain("Final KÖP/SÄLJ human-only");
    expect(combinedSource).toContain("Supabase writes locked");
    expect(combinedSource).toContain("Trade UI execution locked");
    expect(combinedSource).toContain("API route execution locked");
    expect(combinedSource).toContain("UI simplicity protected");
    expect(combinedSource).toContain("Production readiness blocked");
    expect(combinedSource).toContain("checklistOnly: true");
    expect(combinedSource).toContain("headlessOnly: true");
    expect(combinedSource).toContain("visibleInUi: false");
    expect(combinedSource).toContain("canOpenLocalDevBridgeGate: false");
    expect(combinedSource).toContain("canInvokeSmokeRunnerNow: false");
    expect(combinedSource).toContain("canRunTerminalScriptNow: false");
    expect(combinedSource).toContain("canUseBrowserAutomationNow: false");
    expect(combinedSource).toContain("canStartHandoff: false");
    expect(combinedSource).toContain("canPrepareOrderNow: false");
    expect(combinedSource).toContain("canRunSmokeTestFromUi: false");
    expect(combinedSource).toContain("canCallApiRoute: false");
    expect(combinedSource).toContain("canFetch: false");
    expect(combinedSource).toContain("canPoll: false");
    expect(combinedSource).toContain("canAccessCredentials: false");
    expect(combinedSource).toContain("canReadCookies: false");
    expect(combinedSource).toContain("canExportSession: false");
    expect(combinedSource).toContain("canAutomateBankId: false");
    expect(combinedSource).toContain("canSubmitOrder: false");
    expect(combinedSource).toContain("canClickFinalBuy: false");
    expect(combinedSource).toContain("canClickFinalSell: false");
    expect(combinedSource).toContain("canWriteSupabase: false");
    expect(combinedSource).toContain("canClaimProductionReady: false");
    expect(combinedSource).toContain("finalHumanClickRequired: true");
    expect(combinedSource).toContain("gateLocked: true");
    expect(tradeAppSource).not.toContain(
      "avanza-local-dev-bridge-activation-checklist",
    );
    expect(tradeAppSource).not.toContain(
      "AvanzaLocalDevBridgeActivationChecklist",
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
    expect(combinedSource).not.toContain("avanza-login-smoke-test.local");
    expect(combinedSource).not.toContain("avanza-order-chain-smoke-test.local");
    expect(combinedSource).not.toMatch(
      /runAvanzaOrderChainSmokeTest|runAvanzaIsolatedLoginSmokeTest/i,
    );
    expect(combinedSource).not.toMatch(
      /submitOrder\s*\(|placeOrder\s*\(|confirmOrder\s*\(|executeOrder\s*\(|sendOrder\s*\(/i,
    );
  });

  test("disabled local-dev bridge runner stays report-only and blocks invocation", () => {
    const runnerSource = readRepoFile(
      "lib/avanza-disabled-local-dev-bridge-runner.ts",
    );
    const fixtureSource = readRepoFile(
      "lib/avanza-disabled-local-dev-bridge-runner-fixtures.ts",
    );
    const harnessSource = readRepoFile(
      "components/execution/AvanzaDisabledLocalDevBridgeRunnerHarness.tsx",
    );
    const routeSource = readRepoFile("app/dev/avanza-visual-qa/page.tsx");
    const tradeAppSource = readRepoFile("app/trade-app.tsx");
    const apiRouteSource = readRepoFile(
      "app/api/dev/avanza/fill-only/stub/route.ts",
    );
    const combinedSource = [runnerSource, fixtureSource, harnessSource].join(
      "\n",
    );

    expect(routeSource).toContain("AvanzaDisabledLocalDevBridgeRunnerHarness");
    expect(routeSource).toContain("Avanza disabled local-dev bridge runner");
    expect(combinedSource).toContain("Fixture/model only");
    expect(combinedSource).toContain("Disabled skeleton only");
    expect(combinedSource).toContain("Hidden under the surface");
    expect(combinedSource).toContain("Agent-readable, UI-hidden");
    expect(combinedSource).toContain(
      "Bridge contract accepted only as model input",
    );
    expect(combinedSource).toContain("Activation checklist required");
    expect(combinedSource).toContain(
      "Disabled runner design approval does not open runtime",
    );
    expect(combinedSource).toContain("Bridge gate still locked");
    expect(combinedSource).toContain("Smoke runner invocation blocked");
    expect(combinedSource).toContain("Terminal script invocation blocked");
    expect(combinedSource).toContain("Browser automation gate locked");
    expect(combinedSource).toContain("Credential access gate locked");
    expect(combinedSource).toContain("Cookies/session forbidden");
    expect(combinedSource).toContain("BankID automation forbidden");
    expect(combinedSource).toContain("Order submission forbidden");
    expect(combinedSource).toContain("Final KÖP/SÄLJ human-only");
    expect(combinedSource).toContain("Supabase writes locked");
    expect(combinedSource).toContain("No visible Trade UI changes");
    expect(combinedSource).toContain("No active handoff");
    expect(combinedSource).toContain("No prepare action");
    expect(combinedSource).toContain("No buy/sell CTA");
    expect(combinedSource).toContain("No browser automation now");
    expect(combinedSource).toContain("No API route call");
    expect(combinedSource).toContain("No fetch/polling");
    expect(combinedSource).toContain("No credential access now");
    expect(combinedSource).toContain("No order submission");
    expect(combinedSource).toContain("No final KÖP/SÄLJ click");
    expect(combinedSource).toContain("No Supabase write");
    expect(combinedSource).toContain("Not production ready");
    expect(combinedSource).toContain("runnerSkeletonOnly: true");
    expect(combinedSource).toContain("disabledOnly: true");
    expect(combinedSource).toContain("headlessOnly: true");
    expect(combinedSource).toContain("visibleInUi: false");
    expect(combinedSource).toContain("canOpenLocalDevBridgeGate: false");
    expect(combinedSource).toContain("canInvokeSmokeRunnerNow: false");
    expect(combinedSource).toContain("canRunTerminalScriptNow: false");
    expect(combinedSource).toContain("canUseBrowserAutomationNow: false");
    expect(combinedSource).toContain("canStartHandoff: false");
    expect(combinedSource).toContain("canPrepareOrderNow: false");
    expect(combinedSource).toContain("canRunSmokeTestFromUi: false");
    expect(combinedSource).toContain("canCallApiRoute: false");
    expect(combinedSource).toContain("canFetch: false");
    expect(combinedSource).toContain("canPoll: false");
    expect(combinedSource).toContain("canAccessCredentials: false");
    expect(combinedSource).toContain("canReadCookies: false");
    expect(combinedSource).toContain("canExportSession: false");
    expect(combinedSource).toContain("canAutomateBankId: false");
    expect(combinedSource).toContain("canSubmitOrder: false");
    expect(combinedSource).toContain("canClickFinalBuy: false");
    expect(combinedSource).toContain("canClickFinalSell: false");
    expect(combinedSource).toContain("canWriteSupabase: false");
    expect(combinedSource).toContain("canClaimProductionReady: false");
    expect(combinedSource).toContain("finalHumanClickRequired: true");
    expect(combinedSource).toContain("gateLocked: true");
    expect(tradeAppSource).not.toContain(
      "avanza-disabled-local-dev-bridge-runner",
    );
    expect(tradeAppSource).not.toContain("AvanzaDisabledLocalDevBridgeRunner");
    expect(apiRouteSource).not.toContain(
      "avanza-disabled-local-dev-bridge-runner",
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
    expect(combinedSource).not.toContain("avanza-login-smoke-test.local");
    expect(combinedSource).not.toContain("avanza-order-chain-smoke-test.local");
    expect(combinedSource).not.toMatch(
      /runAvanzaOrderChainSmokeTest|runAvanzaIsolatedLoginSmokeTest/i,
    );
    expect(combinedSource).not.toMatch(
      /submitOrder\s*\(|placeOrder\s*\(|confirmOrder\s*\(|executeOrder\s*\(|sendOrder\s*\(/i,
    );
  });

  test("model-only local-dev bridge dry runner stops before runtime invocation", () => {
    const dryRunnerSource = readRepoFile(
      "lib/avanza-model-only-local-dev-bridge-dry-runner.ts",
    );
    const fixtureSource = readRepoFile(
      "lib/avanza-model-only-local-dev-bridge-dry-runner-fixtures.ts",
    );
    const harnessSource = readRepoFile(
      "components/execution/AvanzaModelOnlyLocalDevBridgeDryRunnerHarness.tsx",
    );
    const routeSource = readRepoFile("app/dev/avanza-visual-qa/page.tsx");
    const tradeAppSource = readRepoFile("app/trade-app.tsx");
    const apiRouteSource = readRepoFile(
      "app/api/dev/avanza/fill-only/stub/route.ts",
    );
    const combinedSource = [dryRunnerSource, fixtureSource, harnessSource].join(
      "\n",
    );

    expect(routeSource).toContain("AvanzaModelOnlyLocalDevBridgeDryRunnerHarness");
    expect(routeSource).toContain(
      "Avanza model-only local-dev bridge dry runner",
    );
    expect(combinedSource).toContain("Fixture/model only");
    expect(combinedSource).toContain("Dry-run only");
    expect(combinedSource).toContain("Hidden under the surface");
    expect(combinedSource).toContain("Agent-readable, UI-hidden");
    expect(combinedSource).toContain(
      "Simulates bridge run to invocation boundary",
    );
    expect(combinedSource).toContain("Bridge gate still locked");
    expect(combinedSource).toContain("Smoke runner invocation blocked");
    expect(combinedSource).toContain("Terminal script invocation blocked");
    expect(combinedSource).toContain("Browser automation gate locked");
    expect(combinedSource).toContain("Credential access gate locked");
    expect(combinedSource).toContain("Cookies/session forbidden");
    expect(combinedSource).toContain("BankID automation forbidden");
    expect(combinedSource).toContain("Order submission forbidden");
    expect(combinedSource).toContain("Final KÖP/SÄLJ human-only");
    expect(combinedSource).toContain("Supabase writes locked");
    expect(combinedSource).toContain("No visible Trade UI changes");
    expect(combinedSource).toContain("No active handoff");
    expect(combinedSource).toContain("No prepare action");
    expect(combinedSource).toContain("No buy/sell CTA");
    expect(combinedSource).toContain("No browser automation now");
    expect(combinedSource).toContain("No API route call");
    expect(combinedSource).toContain("No fetch/polling");
    expect(combinedSource).toContain("No credential access now");
    expect(combinedSource).toContain("No order submission");
    expect(combinedSource).toContain("No final KÖP/SÄLJ click");
    expect(combinedSource).toContain("No Supabase write");
    expect(combinedSource).toContain("Not production ready");
    expect(combinedSource).toContain("dryRunOnly: true");
    expect(combinedSource).toContain("modelOnly: true");
    expect(combinedSource).toContain("headlessOnly: true");
    expect(combinedSource).toContain("visibleInUi: false");
    expect(combinedSource).toContain("canOpenLocalDevBridgeGate: false");
    expect(combinedSource).toContain("canInvokeSmokeRunnerNow: false");
    expect(combinedSource).toContain("canRunTerminalScriptNow: false");
    expect(combinedSource).toContain("canUseBrowserAutomationNow: false");
    expect(combinedSource).toContain("canStartHandoff: false");
    expect(combinedSource).toContain("canPrepareOrderNow: false");
    expect(combinedSource).toContain("canRunSmokeTestFromUi: false");
    expect(combinedSource).toContain("canCallApiRoute: false");
    expect(combinedSource).toContain("canFetch: false");
    expect(combinedSource).toContain("canPoll: false");
    expect(combinedSource).toContain("canAccessCredentials: false");
    expect(combinedSource).toContain("canReadCookies: false");
    expect(combinedSource).toContain("canExportSession: false");
    expect(combinedSource).toContain("canAutomateBankId: false");
    expect(combinedSource).toContain("canSubmitOrder: false");
    expect(combinedSource).toContain("canClickFinalBuy: false");
    expect(combinedSource).toContain("canClickFinalSell: false");
    expect(combinedSource).toContain("canWriteSupabase: false");
    expect(combinedSource).toContain("canClaimProductionReady: false");
    expect(combinedSource).toContain("finalHumanClickRequired: true");
    expect(combinedSource).toContain("gateLocked: true");
    expect(tradeAppSource).not.toContain(
      "avanza-model-only-local-dev-bridge-dry-runner",
    );
    expect(tradeAppSource).not.toContain(
      "AvanzaModelOnlyLocalDevBridgeDryRunner",
    );
    expect(apiRouteSource).not.toContain(
      "avanza-model-only-local-dev-bridge-dry-runner",
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
    expect(combinedSource).not.toContain("avanza-login-smoke-test.local");
    expect(combinedSource).not.toContain("avanza-order-chain-smoke-test.local");
    expect(combinedSource).not.toMatch(
      /runAvanzaOrderChainSmokeTest|runAvanzaIsolatedLoginSmokeTest/i,
    );
    expect(combinedSource).not.toMatch(
      /submitOrder\s*\(|placeOrder\s*\(|confirmOrder\s*\(|executeOrder\s*\(|sendOrder\s*\(/i,
    );
  });

  test("local-dev bridge readiness checkpoint stops at invocation boundary", () => {
    const checkpointSource = readRepoFile(
      "lib/avanza-local-dev-bridge-readiness-checkpoint.ts",
    );
    const fixtureSource = readRepoFile(
      "lib/avanza-local-dev-bridge-readiness-checkpoint-fixtures.ts",
    );
    const harnessSource = readRepoFile(
      "components/execution/AvanzaLocalDevBridgeReadinessCheckpointHarness.tsx",
    );
    const docSource = readRepoFile(
      "docs/avanza-local-dev-bridge-readiness-checkpoint.md",
    );
    const routeSource = readRepoFile("app/dev/avanza-visual-qa/page.tsx");
    const tradeAppSource = readRepoFile("app/trade-app.tsx");
    const apiRouteSource = readRepoFile(
      "app/api/dev/avanza/fill-only/stub/route.ts",
    );
    const combinedSource = [checkpointSource, fixtureSource, harnessSource].join(
      "\n",
    );

    expect(routeSource).toContain("AvanzaLocalDevBridgeReadinessCheckpointHarness");
    expect(routeSource).toContain(
      "Avanza local-dev bridge readiness checkpoint",
    );
    for (const copy of [
      "Fixture/model only",
      "Hidden under the surface",
      "Agent-readable, UI-hidden",
      "Invocation boundary reached model-only",
      "Cannot cross invocation boundary now",
      "Bridge contract ready",
      "Activation checklist ready",
      "Disabled runner skeleton ready",
      "Model-only dry-run ready",
      "Smoke runner invocation blocked",
      "Terminal script invocation blocked",
      "Browser automation locked",
      "Credential access locked",
      "Cookies/session forbidden",
      "BankID automation forbidden",
      "Order submission forbidden",
      "Final KÖP/SÄLJ human-only",
      "Supabase writes locked",
      "Trade UI execution locked",
      "API route activation locked",
      "Production readiness blocked",
      "No visible Trade UI changes",
      "No active handoff",
      "No prepare action",
      "No buy/sell CTA",
      "No browser automation now",
      "No API route call",
      "No fetch/polling",
      "No credential access now",
      "No order submission",
      "No final KÖP/SÄLJ click",
      "No Supabase write",
      "Not production ready",
      "canCrossInvocationBoundaryNow: false",
      "canInvokeSmokeRunnerNow: false",
      "canRunTerminalScriptNow: false",
      "canUseBrowserAutomationNow: false",
      "canAccessCredentials: false",
      "canSubmitOrder: false",
      "canWriteSupabase: false",
      "gateLocked: true",
    ]) {
      expect([routeSource, combinedSource, docSource].join("\n")).toContain(copy);
    }

    expect(docSource).toMatch(/checkpoint at the invocation boundary/i);
    expect(docSource).toMatch(/does not cross the invocation boundary/i);
    expect(docSource).toMatch(/next allowed design step is not runtime activation/i);
    expect(docSource).toMatch(/Real Avanza runs/i);
    expect(tradeAppSource).not.toContain(
      "avanza-local-dev-bridge-readiness-checkpoint",
    );
    expect(tradeAppSource).not.toContain(
      "AvanzaLocalDevBridgeReadinessCheckpoint",
    );
    expect(apiRouteSource).not.toContain(
      "avanza-local-dev-bridge-readiness-checkpoint",
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
    expect(combinedSource).not.toContain("avanza-login-smoke-test.local");
    expect(combinedSource).not.toContain("avanza-order-chain-smoke-test.local");
    expect(combinedSource).not.toMatch(
      /runAvanzaOrderChainSmokeTest|runAvanzaIsolatedLoginSmokeTest/i,
    );
    expect(combinedSource).not.toMatch(
      /submitOrder\s*\(|placeOrder\s*\(|confirmOrder\s*\(|executeOrder\s*\(|sendOrder\s*\(/i,
    );
  });

  test("manual local-dev invocation approval runbook remains design-only", () => {
    const modelSource = readRepoFile(
      "lib/avanza-manual-local-dev-invocation-approval-runbook.ts",
    );
    const fixtureSource = readRepoFile(
      "lib/avanza-manual-local-dev-invocation-approval-runbook-fixtures.ts",
    );
    const harnessSource = readRepoFile(
      "components/execution/AvanzaManualLocalDevInvocationApprovalRunbookHarness.tsx",
    );
    const docSource = readRepoFile(
      "docs/avanza-manual-local-dev-invocation-approval-runbook.md",
    );
    const routeSource = readRepoFile("app/dev/avanza-visual-qa/page.tsx");
    const tradeAppSource = readRepoFile("app/trade-app.tsx");
    const apiRouteSource = readRepoFile(
      "app/api/dev/avanza/fill-only/stub/route.ts",
    );
    const combinedSource = [modelSource, fixtureSource, harnessSource].join("\n");

    expect(routeSource).toContain(
      "AvanzaManualLocalDevInvocationApprovalRunbookHarness",
    );
    expect(routeSource).toContain(
      "Avanza manual local-dev invocation approval runbook",
    );
    for (const copy of [
      "Fixture/model only",
      "Hidden under the surface",
      "Agent-readable, UI-hidden",
      "Manual review required",
      "Invocation boundary stop confirmed",
      "Approval for design only modeled",
      "Runtime invocation not approved",
      "Real run forbidden",
      "Production readiness forbidden",
      "Smoke runner invocation blocked",
      "Terminal script invocation blocked",
      "Browser automation locked",
      "Credential access locked",
      "Cookies/session forbidden",
      "BankID automation forbidden",
      "Order submission forbidden",
      "Final KÖP/SÄLJ human-only",
      "Supabase writes locked",
      "Trade UI execution locked",
      "API route activation locked",
      "UI simplicity protected",
      "No visible Trade UI changes",
      "No active handoff",
      "No prepare action",
      "No buy/sell CTA",
      "No browser automation now",
      "No API route call",
      "No fetch/polling",
      "No credential access now",
      "No order submission",
      "No final KÖP/SÄLJ click",
      "No Supabase write",
      "Not production ready",
      "canOpenLocalDevBridgeGate",
      "canCrossInvocationBoundaryNow",
      "canInvokeSmokeRunnerNow",
      "canRunTerminalScriptNow",
      "canUseBrowserAutomationNow",
      "canAccessCredentials",
      "canSubmitOrder",
      "canWriteSupabase",
      "gateLocked",
    ]) {
      expect([routeSource, combinedSource, docSource].join("\n")).toContain(copy);
    }

    expect(docSource).toMatch(/manual local-dev invocation approval runbook/i);
    expect(docSource).toMatch(/design only/i);
    expect(docSource).toMatch(/does not open the bridge gate/i);
    expect(docSource).toMatch(/does not cross the invocation boundary/i);
    expect(docSource).toMatch(/sensitive evidence must be redacted or rejected/i);
    expect(docSource).toMatch(/Runtime remains locked/i);
    expect(tradeAppSource).not.toContain(
      "avanza-manual-local-dev-invocation-approval-runbook",
    );
    expect(apiRouteSource).not.toContain(
      "avanza-manual-local-dev-invocation-approval-runbook",
    );
    expect(combinedSource).not.toMatch(/\bfetch\s*\(/);
    expect(combinedSource).not.toMatch(/\/api\/|app\/api\//);
    expect(combinedSource).not.toMatch(/from\s+["']playwright["']/);
    expect(combinedSource).not.toMatch(/chromium\.launch|page\.goto/);
    expect(combinedSource).not.toMatch(/document\.cookie|cookies\(\)/i);
    expect(combinedSource).not.toMatch(/localStorage|sessionStorage/);
    expect(combinedSource).not.toMatch(/supabase\.(from|insert|rpc)/i);
    expect(combinedSource).not.toMatch(/<button\b|onClick\s*=/);
    expect(combinedSource).not.toContain("avanza-login-smoke-test.local");
    expect(combinedSource).not.toContain("avanza-order-chain-smoke-test.local");
    expect(combinedSource).not.toMatch(
      /runAvanzaOrderChainSmokeTest|runAvanzaIsolatedLoginSmokeTest/i,
    );
    expect(combinedSource).not.toMatch(
      /submitOrder\s*\(|placeOrder\s*\(|confirmOrder\s*\(|executeOrder\s*\(|sendOrder\s*\(/i,
    );
  });

  test("disabled local-dev invocation adapter contract remains disabled", () => {
    const modelSource = readRepoFile(
      "lib/avanza-disabled-local-dev-invocation-adapter-contract.ts",
    );
    const fixtureSource = readRepoFile(
      "lib/avanza-disabled-local-dev-invocation-adapter-contract-fixtures.ts",
    );
    const harnessSource = readRepoFile(
      "components/execution/AvanzaDisabledLocalDevInvocationAdapterContractHarness.tsx",
    );
    const docSource = readRepoFile(
      "docs/avanza-disabled-local-dev-invocation-adapter-contract.md",
    );
    const routeSource = readRepoFile("app/dev/avanza-visual-qa/page.tsx");
    const tradeAppSource = readRepoFile("app/trade-app.tsx");
    const apiRouteSource = readRepoFile(
      "app/api/dev/avanza/fill-only/stub/route.ts",
    );
    const combinedSource = [modelSource, fixtureSource, harnessSource].join("\n");

    expect(routeSource).toContain(
      "AvanzaDisabledLocalDevInvocationAdapterContractHarness",
    );
    expect(routeSource).toContain(
      "Avanza disabled local-dev invocation adapter contract",
    );
    for (const copy of [
      "Fixture/model only",
      "Disabled contract only",
      "Hidden under the surface",
      "Agent-readable, UI-hidden",
      "Design-only approval modeled",
      "Runtime invocation not approved",
      "Invocation boundary locked",
      "Target request shape modeled",
      "Safe payload summary modeled",
      "Sensitive payload forbidden",
      "Smoke runner invocation locked",
      "Terminal script invocation locked",
      "Browser automation locked",
      "Credential access locked",
      "Cookies/session forbidden",
      "BankID automation forbidden",
      "Order submission forbidden",
      "Final KÖP/SÄLJ human-only",
      "Supabase writes locked",
      "Trade UI execution locked",
      "API route activation locked",
      "No visible Trade UI changes",
      "No active handoff",
      "No prepare action",
      "No buy/sell CTA",
      "No browser automation now",
      "No API route call",
      "No fetch/polling",
      "No credential access now",
      "No order submission",
      "No final KÖP/SÄLJ click",
      "No Supabase write",
      "Not production ready",
      "canApproveRuntimeInvocation",
      "canCrossInvocationBoundaryNow",
      "canInvokeSmokeRunnerNow",
      "canRunTerminalScriptNow",
      "canUseBrowserAutomationNow",
      "canAccessCredentials",
      "canCarryCredentials",
      "canReadCookies",
      "canCarrySessionTokens",
      "canSubmitOrder",
      "canWriteSupabase",
      "gateLocked",
    ]) {
      expect([routeSource, combinedSource, docSource].join("\n")).toContain(copy);
    }

    expect(docSource).toMatch(/disabled local-dev invocation adapter contract/i);
    expect(docSource).toMatch(/future adapter shape/i);
    expect(docSource).toMatch(/does not cross the invocation boundary/i);
    expect(docSource).toMatch(/sensitive payload is forbidden/i);
    expect(docSource).toMatch(/Runtime remains locked/i);
    expect(tradeAppSource).not.toContain(
      "avanza-disabled-local-dev-invocation-adapter-contract",
    );
    expect(apiRouteSource).not.toContain(
      "avanza-disabled-local-dev-invocation-adapter-contract",
    );
    expect(combinedSource).not.toMatch(/\bfetch\s*\(/);
    expect(combinedSource).not.toMatch(/\/api\/|app\/api\//);
    expect(combinedSource).not.toMatch(/from\s+["']playwright["']/);
    expect(combinedSource).not.toMatch(/chromium\.launch|page\.goto/);
    expect(combinedSource).not.toMatch(/document\.cookie|cookies\(\)/i);
    expect(combinedSource).not.toMatch(/localStorage|sessionStorage/);
    expect(combinedSource).not.toMatch(/supabase\.(from|insert|rpc)/i);
    expect(combinedSource).not.toMatch(/<button\b|onClick\s*=/);
    expect(combinedSource).not.toContain("avanza-login-smoke-test.local");
    expect(combinedSource).not.toContain("avanza-order-chain-smoke-test.local");
    expect(combinedSource).not.toMatch(
      /runAvanzaOrderChainSmokeTest|runAvanzaIsolatedLoginSmokeTest/i,
    );
    expect(combinedSource).not.toMatch(
      /submitOrder\s*\(|placeOrder\s*\(|confirmOrder\s*\(|executeOrder\s*\(|sendOrder\s*\(/i,
    );
  });

  test("disabled invocation adapter payload validator remains design-review only", () => {
    const modelSource = readRepoFile(
      "lib/avanza-disabled-invocation-adapter-payload-validator.ts",
    );
    const fixtureSource = readRepoFile(
      "lib/avanza-disabled-invocation-adapter-payload-validator-fixtures.ts",
    );
    const harnessSource = readRepoFile(
      "components/execution/AvanzaDisabledInvocationAdapterPayloadValidatorHarness.tsx",
    );
    const docSource = readRepoFile(
      "docs/avanza-disabled-invocation-adapter-payload-validator.md",
    );
    const routeSource = readRepoFile("app/dev/avanza-visual-qa/page.tsx");
    const tradeAppSource = readRepoFile("app/trade-app.tsx");
    const apiRouteSource = readRepoFile(
      "app/api/dev/avanza/fill-only/stub/route.ts",
    );
    const combinedSource = [modelSource, fixtureSource, harnessSource].join("\n");

    expect(routeSource).toContain(
      "AvanzaDisabledInvocationAdapterPayloadValidatorHarness",
    );
    expect(routeSource).toContain(
      "Avanza disabled invocation adapter payload validator",
    );
    for (const copy of [
      "Fixture/model only",
      "Design review only",
      "Hidden under the surface",
      "Agent-readable, UI-hidden",
      "Safe payload validation modeled",
      "Sensitive payload forbidden",
      "Runtime capability blocked",
      "Invocation boundary locked",
      "Smoke runner invocation locked",
      "Terminal script invocation locked",
      "Browser automation locked",
      "Credential access locked",
      "Cookies/session forbidden",
      "BankID automation forbidden",
      "Order submission forbidden",
      "Final KÖP/SÄLJ human-only",
      "Supabase writes locked",
      "Trade UI execution locked",
      "API route activation locked",
      "No visible Trade UI changes",
      "No active handoff",
      "No prepare action",
      "No buy/sell CTA",
      "No browser automation now",
      "No API route call",
      "No fetch/polling",
      "No credential access now",
      "No order submission",
      "No final KÖP/SÄLJ click",
      "No Supabase write",
      "Not production ready",
      "valid_for_design_review",
      "invalid_missing_adapter_contract",
      "invalid_missing_request_shape",
      "invalid_missing_safe_payload",
      "invalid_sensitive_payload_detected",
      "invalid_runtime_capability_detected",
      "invalid_invocation_boundary_crossed",
      "canApproveRuntimeInvocation",
      "canCrossInvocationBoundaryNow",
      "canInvokeSmokeRunnerNow",
      "canRunTerminalScriptNow",
      "canUseBrowserAutomationNow",
      "canAccessCredentials",
      "canSubmitOrder",
      "canWriteSupabase",
      "gateLocked",
    ]) {
      expect([routeSource, combinedSource, docSource].join("\n")).toContain(copy);
    }

    expect(docSource).toMatch(/design-review payloads only/i);
    expect(docSource).toMatch(/sensitive payload forbidden/i);
    expect(docSource).toMatch(/runtime capability blocked/i);
    expect(docSource).toMatch(/Runtime remains locked/i);
    expect(tradeAppSource).not.toContain(
      "avanza-disabled-invocation-adapter-payload-validator",
    );
    expect(apiRouteSource).not.toContain(
      "avanza-disabled-invocation-adapter-payload-validator",
    );
    expect(combinedSource).not.toMatch(/\bfetch\s*\(/);
    expect(combinedSource).not.toMatch(/\/api\/|app\/api\//);
    expect(combinedSource).not.toMatch(/from\s+["']playwright["']/);
    expect(combinedSource).not.toMatch(/chromium\.launch|page\.goto/);
    expect(combinedSource).not.toMatch(/document\.cookie|cookies\(\)/i);
    expect(combinedSource).not.toMatch(/localStorage|sessionStorage/);
    expect(combinedSource).not.toMatch(/supabase\.(from|insert|rpc)/i);
    expect(combinedSource).not.toMatch(/<button\b|onClick\s*=/);
    expect(combinedSource).not.toContain("avanza-login-smoke-test.local");
    expect(combinedSource).not.toContain("avanza-order-chain-smoke-test.local");
    expect(combinedSource).not.toMatch(
      /runAvanzaOrderChainSmokeTest|runAvanzaIsolatedLoginSmokeTest/i,
    );
    expect(combinedSource).not.toMatch(
      /submitOrder\s*\(|placeOrder\s*\(|confirmOrder\s*\(|executeOrder\s*\(|sendOrder\s*\(/i,
    );
  });

  test("invocation adapter design checkpoint remains design-review only", () => {
    const modelSource = readRepoFile(
      "lib/avanza-invocation-adapter-design-checkpoint.ts",
    );
    const fixtureSource = readRepoFile(
      "lib/avanza-invocation-adapter-design-checkpoint-fixtures.ts",
    );
    const harnessSource = readRepoFile(
      "components/execution/AvanzaInvocationAdapterDesignCheckpointHarness.tsx",
    );
    const docSource = readRepoFile(
      "docs/avanza-invocation-adapter-design-checkpoint.md",
    );
    const routeSource = readRepoFile("app/dev/avanza-visual-qa/page.tsx");
    const tradeAppSource = readRepoFile("app/trade-app.tsx");
    const apiRouteSource = readRepoFile(
      "app/api/dev/avanza/fill-only/stub/route.ts",
    );
    const combinedSource = [modelSource, fixtureSource, harnessSource].join("\n");

    expect(routeSource).toContain(
      "AvanzaInvocationAdapterDesignCheckpointHarness",
    );
    expect(routeSource).toContain(
      "Avanza invocation adapter design checkpoint",
    );
    for (const copy of [
      "Fixture/model only",
      "Design review only",
      "Hidden under the surface",
      "Agent-readable, UI-hidden",
      "Disabled adapter contract reviewed",
      "Payload validator reviewed",
      "Safe payload shape validated",
      "Sensitive payload rejected",
      "Runtime invocation not approved",
      "Invocation boundary locked",
      "Smoke runner invocation locked",
      "Terminal script invocation locked",
      "Browser automation locked",
      "Credential access locked",
      "Cookies/session forbidden",
      "BankID automation forbidden",
      "Order submission forbidden",
      "Final KÖP/SÄLJ human-only",
      "Supabase writes locked",
      "Trade UI execution locked",
      "API route activation locked",
      "Production readiness blocked",
      "No visible Trade UI changes",
      "No active handoff",
      "No prepare action",
      "No buy/sell CTA",
      "No browser automation now",
      "No API route call",
      "No fetch/polling",
      "No credential access now",
      "No order submission",
      "No final KÖP/SÄLJ click",
      "No Supabase write",
      "Not production ready",
      "ready_for_design_review",
      "blocked_missing_adapter_contract",
      "blocked_missing_payload_validator",
      "blocked_payload_invalid",
      "blocked_runtime_requested",
      "blocked_for_real_execution",
      "blocked_for_production",
      "canApproveRuntimeInvocation",
      "canCrossInvocationBoundaryNow",
      "canInvokeSmokeRunnerNow",
      "canRunTerminalScriptNow",
      "canUseBrowserAutomationNow",
      "canAccessCredentials",
      "canSubmitOrder",
      "canWriteSupabase",
      "gateLocked",
    ]) {
      expect([routeSource, combinedSource, docSource].join("\n")).toContain(copy);
    }

    expect(docSource).toMatch(/validates design review only/i);
    expect(docSource).toMatch(/does not approve runtime/i);
    expect(docSource).toMatch(/does not cross the invocation boundary/i);
    expect(docSource).toMatch(/Runtime invocation remains forbidden/i);
    expect(tradeAppSource).not.toContain(
      "avanza-invocation-adapter-design-checkpoint",
    );
    expect(apiRouteSource).not.toContain(
      "avanza-invocation-adapter-design-checkpoint",
    );
    expect(combinedSource).not.toMatch(/\bfetch\s*\(/);
    expect(combinedSource).not.toMatch(/\/api\/|app\/api\//);
    expect(combinedSource).not.toMatch(/from\s+["']playwright["']/);
    expect(combinedSource).not.toMatch(/chromium\.launch|page\.goto/);
    expect(combinedSource).not.toMatch(/document\.cookie|cookies\(\)/i);
    expect(combinedSource).not.toMatch(/localStorage|sessionStorage/);
    expect(combinedSource).not.toMatch(/supabase\.(from|insert|rpc)/i);
    expect(combinedSource).not.toMatch(/<button\b|onClick\s*=/);
    expect(combinedSource).not.toContain("avanza-login-smoke-test.local");
    expect(combinedSource).not.toContain("avanza-order-chain-smoke-test.local");
    expect(combinedSource).not.toMatch(
      /runAvanzaOrderChainSmokeTest|runAvanzaIsolatedLoginSmokeTest/i,
    );
    expect(combinedSource).not.toMatch(
      /submitOrder\s*\(|placeOrder\s*\(|confirmOrder\s*\(|executeOrder\s*\(|sendOrder\s*\(/i,
    );
  });

  test("Sharp Semi Auto Execution phase checkpoint remains roadmap-only", () => {
    const modelSource = readRepoFile(
      "lib/avanza-sharp-semi-auto-execution-phase-checkpoint.ts",
    );
    const fixtureSource = readRepoFile(
      "lib/avanza-sharp-semi-auto-execution-phase-checkpoint-fixtures.ts",
    );
    const harnessSource = readRepoFile(
      "components/execution/AvanzaSharpSemiAutoExecutionPhaseCheckpointHarness.tsx",
    );
    const docSource = readRepoFile(
      "docs/avanza-sharp-semi-auto-execution-phase-checkpoint.md",
    );
    const routeSource = readRepoFile("app/dev/avanza-visual-qa/page.tsx");
    const tradeAppSource = readRepoFile("app/trade-app.tsx");
    const apiRouteSource = readRepoFile(
      "app/api/dev/avanza/fill-only/stub/route.ts",
    );
    const combinedSource = [modelSource, fixtureSource, harnessSource].join("\n");

    expect(routeSource).toContain(
      "AvanzaSharpSemiAutoExecutionPhaseCheckpointHarness",
    );
    expect(routeSource).toContain(
      "Avanza Sharp Semi Auto Execution phase checkpoint",
    );
    for (const copy of [
      "Fixture/model only",
      "Roadmap only",
      "Hidden under the surface",
      "Agent-readable, UI-hidden",
      "Phase complete",
      "Headless chain complete",
      "Orchestration complete",
      "Invocation adapter design checkpointed",
      "Runtime invocation not approved",
      "Invocation boundary locked",
      "Smoke runner invocation locked",
      "Terminal script invocation locked",
      "Browser automation locked",
      "Credential access locked",
      "Cookies/session forbidden",
      "BankID automation forbidden",
      "Order submission forbidden",
      "Final KÖP/SÄLJ human-only",
      "Supabase writes locked",
      "Trade UI execution locked",
      "API route activation locked",
      "Production readiness blocked",
      "UI remains visually simple",
      "No visible Trade UI changes",
      "No active handoff",
      "No prepare action",
      "No buy/sell CTA",
      "No browser automation now",
      "No API route call",
      "No fetch/polling",
      "No credential access now",
      "No order submission",
      "No final KÖP/SÄLJ click",
      "No Supabase write",
      "Not production ready",
      "phase_complete",
      "ready_for_roadmap_review",
      "blocked_for_runtime",
      "blocked_for_production",
      "runtime_invocation_forbidden",
      "visual_trade_ui_expansion_not_recommended",
      "active_handoff_not_recommended",
      "canApproveRuntimeInvocation",
      "canCrossInvocationBoundaryNow",
      "canInvokeSmokeRunnerNow",
      "canRunTerminalScriptNow",
      "canUseBrowserAutomationNow",
      "canAccessCredentials",
      "canSubmitOrder",
      "canWriteSupabase",
      "gateLocked",
    ]) {
      expect([routeSource, combinedSource, docSource].join("\n")).toContain(copy);
    }

    expect(docSource).toMatch(/current sharp semi auto execution design phase is complete/i);
    expect(docSource).toMatch(/future work must pick a separate workstream/i);
    expect(docSource).toMatch(/runtime remains locked/i);
    expect(tradeAppSource).not.toContain(
      "avanza-sharp-semi-auto-execution-phase-checkpoint",
    );
    expect(apiRouteSource).not.toContain(
      "avanza-sharp-semi-auto-execution-phase-checkpoint",
    );
    expect(combinedSource).not.toMatch(/\bfetch\s*\(/);
    expect(combinedSource).not.toMatch(/\/api\/|app\/api\//);
    expect(combinedSource).not.toMatch(/from\s+["']playwright["']/);
    expect(combinedSource).not.toMatch(/chromium\.launch|page\.goto/);
    expect(combinedSource).not.toMatch(/document\.cookie|cookies\(\)/i);
    expect(combinedSource).not.toMatch(/localStorage|sessionStorage/);
    expect(combinedSource).not.toMatch(/supabase\.(from|insert|rpc)/i);
    expect(combinedSource).not.toMatch(/<button\b|onClick\s*=/);
    expect(combinedSource).not.toContain("avanza-login-smoke-test.local");
    expect(combinedSource).not.toContain("avanza-order-chain-smoke-test.local");
    expect(combinedSource).not.toMatch(
      /runAvanzaOrderChainSmokeTest|runAvanzaIsolatedLoginSmokeTest/i,
    );
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
