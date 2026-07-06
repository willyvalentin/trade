import type { Metadata } from "next";
import {
  AvanzaDevVisibleSelectedRecommendationPreviewSurfaceGallery,
} from "@/components/execution/AvanzaDevVisibleSelectedRecommendationPreviewSurfaceGallery";
import {
  AvanzaDevVisualQaRouteStatusPanel,
} from "@/components/execution/AvanzaDevVisualQaRouteStatusPanel";
import {
  AvanzaDevVisualQaRouteAccessHarness,
} from "@/components/execution/AvanzaDevVisualQaRouteAccessHarness";
import {
  AvanzaReadOnlySelectedRecommendationDevPreviewGuardHarness,
} from "@/components/execution/AvanzaReadOnlySelectedRecommendationDevPreviewGuardHarness";
import {
  AvanzaRealSelectedRecommendationReadOnlyInputGuardHarness,
} from "@/components/execution/AvanzaRealSelectedRecommendationReadOnlyInputGuardHarness";
import {
  AvanzaReadOnlySelectedRecommendationDerivationDecisionHarness,
} from "@/components/execution/AvanzaReadOnlySelectedRecommendationDerivationDecisionHarness";
import {
  AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationDecisionHarness,
} from "@/components/execution/AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationDecisionHarness";
import {
  AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapperHarness,
} from "@/components/execution/AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapperHarness";
import {
  AvanzaRealSelectedRecommendationReadOnlyDerivationHarness,
} from "@/components/execution/AvanzaRealSelectedRecommendationReadOnlyDerivationHarness";
import {
  AvanzaRealSelectedRecommendationReadOnlyConnectionHarness,
} from "@/components/execution/AvanzaRealSelectedRecommendationReadOnlyConnectionHarness";
import {
  AvanzaHandoffPackageBuilderHarness,
} from "@/components/execution/AvanzaHandoffPackageBuilderHarness";
import {
  AvanzaTradeUiHandoffPreviewHarness,
} from "@/components/execution/AvanzaTradeUiHandoffPreviewHarness";
import {
  AvanzaFillOnlyAdapterContractHarness,
} from "@/components/execution/AvanzaFillOnlyAdapterContractHarness";
import {
  AvanzaDryRunAdapterLayerHarness,
} from "@/components/execution/AvanzaDryRunAdapterLayerHarness";
import {
  AvanzaDisabledLocalBridgeContractHarness,
} from "@/components/execution/AvanzaDisabledLocalBridgeContractHarness";
import {
  AvanzaDisabledLocalhostBridgeStubHarness,
} from "@/components/execution/AvanzaDisabledLocalhostBridgeStubHarness";
import {
  AvanzaLocalOnlyApiRouteStubHarness,
} from "@/components/execution/AvanzaLocalOnlyApiRouteStubHarness";
import {
  AvanzaTradeUiPrepareIntentHarness,
} from "@/components/execution/AvanzaTradeUiPrepareIntentHarness";
import {
  AvanzaDisabledInternalPrepareButtonShellHarness,
} from "@/components/execution/AvanzaDisabledInternalPrepareButtonShellHarness";
import {
  AvanzaPassiveDisabledPrepareShellHarness,
} from "@/components/execution/AvanzaPassiveDisabledPrepareShellHarness";
import {
  AvanzaExplicitInternalVisibleDisabledPrepareShellHarness,
} from "@/components/execution/AvanzaExplicitInternalVisibleDisabledPrepareShellHarness";
import {
  AvanzaGuardedApiRouteCallIntentHarness,
} from "@/components/execution/AvanzaGuardedApiRouteCallIntentHarness";
import {
  AvanzaGuardedFetchIntentHarness,
} from "@/components/execution/AvanzaGuardedFetchIntentHarness";
import {
  AvanzaDisabledLocalOnlyManualTestPathHarness,
} from "@/components/execution/AvanzaDisabledLocalOnlyManualTestPathHarness";
import {
  AvanzaLocalBrowserAgentRuntimeHarness,
} from "@/components/execution/AvanzaLocalBrowserAgentRuntimeHarness";
import {
  AvanzaLocalPlaywrightBrowserAdapterHarness,
} from "@/components/execution/AvanzaLocalPlaywrightBrowserAdapterHarness";
import {
  AvanzaLocalPlaywrightPageActionBindingHarness,
} from "@/components/execution/AvanzaLocalPlaywrightPageActionBindingHarness";
import {
  AvanzaPageStateDetectorHarness,
} from "@/components/execution/AvanzaPageStateDetectorHarness";
import {
  AvanzaSanitizedPageSnapshotHarness,
} from "@/components/execution/AvanzaSanitizedPageSnapshotHarness";
import {
  AvanzaRealWorldLoginSignalsHarness,
} from "@/components/execution/AvanzaRealWorldLoginSignalsHarness";
import {
  AvanzaRealWorldOrderFlowSignalsHarness,
} from "@/components/execution/AvanzaRealWorldOrderFlowSignalsHarness";
import {
  AvanzaSettlementNoteSignalsHarness,
} from "@/components/execution/AvanzaSettlementNoteSignalsHarness";
import {
  AvanzaSettlementNoteRouteContractHarness,
} from "@/components/execution/AvanzaSettlementNoteRouteContractHarness";
import {
  AvanzaSettlementNoteActionContractHarness,
} from "@/components/execution/AvanzaSettlementNoteActionContractHarness";
import {
  AvanzaSettlementNoteExtractionSchemaHarness,
} from "@/components/execution/AvanzaSettlementNoteExtractionSchemaHarness";
import {
  AvanzaSettlementReconciliationMappingHarness,
} from "@/components/execution/AvanzaSettlementReconciliationMappingHarness";
import {
  AvanzaSettlementReconciliationDryRunExecutorHarness,
} from "@/components/execution/AvanzaSettlementReconciliationDryRunExecutorHarness";
import {
  AvanzaSettlementReconciliationMockExecutorHarness,
} from "@/components/execution/AvanzaSettlementReconciliationMockExecutorHarness";
import {
  AvanzaRealWorldInstrumentSearchSignalsHarness,
} from "@/components/execution/AvanzaRealWorldInstrumentSearchSignalsHarness";
import {
  AvanzaInstrumentSearchRouteContractHarness,
} from "@/components/execution/AvanzaInstrumentSearchRouteContractHarness";
import {
  AvanzaInstrumentSearchActionContractHarness,
} from "@/components/execution/AvanzaInstrumentSearchActionContractHarness";
import {
  AvanzaInstrumentToOrderHandoffChainHarness,
} from "@/components/execution/AvanzaInstrumentToOrderHandoffChainHarness";
import {
  AvanzaInstrumentToOrderDryRunExecutorHarness,
} from "@/components/execution/AvanzaInstrumentToOrderDryRunExecutorHarness";
import {
  AvanzaInstrumentToOrderMockExecutorHarness,
} from "@/components/execution/AvanzaInstrumentToOrderMockExecutorHarness";
import {
  AvanzaExecutionSettingsProfileHarness,
} from "@/components/execution/AvanzaExecutionSettingsProfileHarness";
import {
  AvanzaOrderTicketFieldContractHarness,
} from "@/components/execution/AvanzaOrderTicketFieldContractHarness";
import {
  AvanzaOrderTicketActionContractHarness,
} from "@/components/execution/AvanzaOrderTicketActionContractHarness";
import {
  AvanzaExecutionSettingsProfilePanelHarness,
} from "@/components/execution/AvanzaExecutionSettingsProfilePanelHarness";
import {
  AvanzaLoginRoutePlannerHarness,
} from "@/components/execution/AvanzaLoginRoutePlannerHarness";
import {
  AvanzaLoginActionContractHarness,
} from "@/components/execution/AvanzaLoginActionContractHarness";
import {
  AvanzaLoginDryRunExecutorHarness,
} from "@/components/execution/AvanzaLoginDryRunExecutorHarness";
import {
  AvanzaLoginMockPageExecutorHarness,
} from "@/components/execution/AvanzaLoginMockPageExecutorHarness";
import {
  AvanzaLoginLocalDevExecutorHarness,
} from "@/components/execution/AvanzaLoginLocalDevExecutorHarness";
import {
  AvanzaLoginAndCredentialReadinessHarness,
} from "@/components/execution/AvanzaLoginAndCredentialReadinessHarness";
import {
  AvanzaMacosKeychainCredentialProviderHarness,
} from "@/components/execution/AvanzaMacosKeychainCredentialProviderHarness";
import {
  AvanzaLoginCredentialResolutionBridgeHarness,
} from "@/components/execution/AvanzaLoginCredentialResolutionBridgeHarness";
import {
  AvanzaLoginLocalDevCredentialExecutorHarness,
} from "@/components/execution/AvanzaLoginLocalDevCredentialExecutorHarness";
import {
  AvanzaIsolatedLoginSmokeTestHarness,
} from "@/components/execution/AvanzaIsolatedLoginSmokeTestHarness";
import {
  AvanzaIsolatedLoginSmokeTestRunnerHarness,
} from "@/components/execution/AvanzaIsolatedLoginSmokeTestRunnerHarness";
import {
  AvanzaTerminalLoginSmokeScriptHarness,
} from "@/components/execution/AvanzaTerminalLoginSmokeScriptHarness";
import {
  AvanzaExplicitInternalDisabledActionShellHarness,
} from "@/components/execution/AvanzaExplicitInternalDisabledActionShellHarness";
import {
  AvanzaTradeUiReadOnlySelectedRecommendationPreviewModelHarness,
} from "@/components/execution/AvanzaTradeUiReadOnlySelectedRecommendationPreviewModelHarness";
import {
  AvanzaTradeUiReadOnlySelectedRecommendationPreviewHarness,
} from "@/components/execution/AvanzaTradeUiReadOnlySelectedRecommendationPreviewHarness";
import {
  AvanzaSelectedRecommendationSourceExtractionHarness,
} from "@/components/execution/AvanzaSelectedRecommendationSourceExtractionHarness";
import {
  AvanzaHardDisabledSourceToPreviewIntegrationHarness,
} from "@/components/execution/AvanzaHardDisabledSourceToPreviewIntegrationHarness";
import {
  AvanzaTestOnlyEnabledPreviewFixtureModelHarness,
} from "@/components/execution/AvanzaTestOnlyEnabledPreviewFixtureModelHarness";
import {
  avanzaRealSelectedRecommendationReadOnlyDerivationFixtures,
} from "@/lib/avanza-real-selected-recommendation-read-only-derivation-fixtures";
import {
  avanzaRealSelectedRecommendationReadOnlyConnectionFixtures,
} from "@/lib/avanza-real-selected-recommendation-read-only-connection-fixtures";
import {
  avanzaHandoffPackageBuilderFixtures,
} from "@/lib/avanza-handoff-package-builder-fixtures";
import {
  avanzaTradeUiHandoffPreviewFixtures,
} from "@/lib/avanza-trade-ui-handoff-preview-fixtures";
import {
  avanzaFillOnlyAdapterContractFixtures,
} from "@/lib/avanza-fill-only-adapter-contract-fixtures";
import {
  avanzaDryRunAdapterLayerFixtures,
} from "@/lib/avanza-dry-run-adapter-layer-fixtures";
import {
  avanzaDisabledLocalBridgeContractFixtures,
} from "@/lib/avanza-disabled-local-bridge-contract-fixtures";
import {
  avanzaDisabledLocalhostBridgeStubFixtures,
} from "@/lib/avanza-disabled-localhost-bridge-stub-fixtures";
import {
  avanzaLocalOnlyApiRouteStubFixtures,
} from "@/lib/avanza-local-only-api-route-stub-fixtures";
import {
  avanzaTradeUiPrepareIntentFixtures,
} from "@/lib/avanza-trade-ui-prepare-intent-fixtures";
import {
  avanzaDisabledInternalPrepareButtonShellFixtures,
} from "@/lib/avanza-disabled-internal-prepare-button-shell-fixtures";
import {
  avanzaPassiveDisabledPrepareShellFixtures,
} from "@/lib/avanza-passive-disabled-prepare-shell-fixtures";
import {
  avanzaExplicitInternalVisibleDisabledPrepareShellFixtures,
} from "@/lib/avanza-explicit-internal-visible-disabled-prepare-shell-fixtures";
import {
  avanzaGuardedApiRouteCallIntentFixtures,
} from "@/lib/avanza-guarded-api-route-call-intent-fixtures";
import {
  avanzaGuardedFetchIntentFixtures,
} from "@/lib/avanza-guarded-fetch-intent-fixtures";
import {
  avanzaDisabledLocalOnlyManualTestPathFixtures,
} from "@/lib/avanza-disabled-local-only-manual-test-path-fixtures";
import {
  avanzaLocalBrowserAgentRuntimeFixtures,
} from "@/lib/avanza-local-browser-agent-runtime-fixtures";
import {
  avanzaLocalPlaywrightBrowserAdapterFixtures,
} from "@/lib/avanza-local-playwright-browser-adapter-fixtures";
import {
  avanzaLocalPlaywrightPageActionBindingFixtures,
} from "@/lib/avanza-local-playwright-page-action-binding-fixtures";
import {
  avanzaPageStateDetectorFixtures,
} from "@/lib/avanza-page-state-detector-fixtures";
import {
  avanzaSanitizedPageSnapshotFixtures,
} from "@/lib/avanza-sanitized-page-snapshot-fixtures";
import {
  avanzaRealWorldLoginSignalFixtures,
} from "@/lib/avanza-real-world-login-signals-fixtures";
import {
  avanzaRealWorldOrderFlowSignalFixtures,
} from "@/lib/avanza-real-world-order-flow-signals-fixtures";
import {
  avanzaSettlementNoteSignalFixtures,
} from "@/lib/avanza-real-world-settlement-note-signals-fixtures";
import {
  avanzaSettlementNoteRouteContractFixtures,
} from "@/lib/avanza-settlement-note-route-contract-fixtures";
import {
  avanzaSettlementNoteActionContractFixtures,
} from "@/lib/avanza-settlement-note-action-contract-fixtures";
import {
  avanzaSettlementNoteExtractionSchemaFixtures,
} from "@/lib/avanza-settlement-note-extraction-schema-fixtures";
import {
  avanzaSettlementReconciliationMappingFixtures,
} from "@/lib/avanza-settlement-reconciliation-mapping-fixtures";
import {
  avanzaSettlementReconciliationDryRunExecutorFixtures,
} from "@/lib/avanza-settlement-reconciliation-dry-run-executor-fixtures";
import {
  avanzaSettlementReconciliationMockExecutorFixtures,
} from "@/lib/avanza-settlement-reconciliation-mock-executor-fixtures";
import {
  avanzaRealWorldInstrumentSearchSignalFixtures,
} from "@/lib/avanza-real-world-instrument-search-signals-fixtures";
import {
  avanzaInstrumentSearchRouteContractFixtures,
} from "@/lib/avanza-instrument-search-route-contract-fixtures";
import {
  avanzaInstrumentSearchActionContractFixtures,
} from "@/lib/avanza-instrument-search-action-contract-fixtures";
import {
  avanzaInstrumentToOrderHandoffChainFixtures,
} from "@/lib/avanza-instrument-to-order-handoff-chain-fixtures";
import {
  avanzaInstrumentToOrderDryRunExecutorFixtures,
} from "@/lib/avanza-instrument-to-order-dry-run-executor-fixtures";
import {
  avanzaInstrumentToOrderMockExecutorFixtures,
} from "@/lib/avanza-instrument-to-order-mock-executor-fixtures";
import {
  avanzaExecutionSettingsProfileFixtures,
} from "@/lib/avanza-execution-settings-profile-fixtures";
import {
  avanzaOrderTicketFieldContractFixtures,
} from "@/lib/avanza-order-ticket-field-contract-fixtures";
import {
  avanzaOrderTicketActionContractFixtures,
} from "@/lib/avanza-order-ticket-action-contract-fixtures";
import {
  avanzaExecutionSettingsProfileUiFixtures,
} from "@/lib/avanza-execution-settings-profile-ui-fixtures";
import {
  avanzaLoginRoutePlannerFixtures,
} from "@/lib/avanza-login-route-planner-fixtures";
import {
  avanzaLoginActionContractFixtures,
} from "@/lib/avanza-login-action-contract-fixtures";
import {
  avanzaLoginDryRunExecutorFixtures,
} from "@/lib/avanza-login-dry-run-executor-fixtures";
import {
  avanzaLoginMockPageExecutorFixtures,
} from "@/lib/avanza-login-mock-page-executor-fixtures";
import {
  avanzaLoginLocalDevExecutorFixtures,
} from "@/lib/avanza-login-local-dev-executor-fixtures";
import {
  avanzaLoginStateDetectorFixtures,
} from "@/lib/avanza-login-state-detector-fixtures";
import {
  avanzaSecureCredentialProviderFixtures,
} from "@/lib/avanza-secure-credential-provider-fixtures";
import {
  avanzaMacosKeychainCredentialProviderFixtures,
} from "@/lib/avanza-macos-keychain-credential-provider-fixtures";
import {
  avanzaLoginCredentialResolutionBridgeFixtures,
} from "@/lib/avanza-login-credential-resolution-bridge-fixtures";
import {
  avanzaLoginLocalDevCredentialExecutorFixtures,
} from "@/lib/avanza-login-local-dev-credential-executor-fixtures";
import {
  avanzaIsolatedLoginSmokeTestFixtures,
} from "@/lib/avanza-isolated-login-smoke-test-fixtures";
import {
  avanzaIsolatedLoginSmokeTestRunnerFixtures,
} from "@/lib/avanza-isolated-login-smoke-test-runner-fixtures";
import {
  avanzaTerminalLoginSmokeScriptFixtures,
} from "@/lib/avanza-terminal-login-smoke-script-fixtures";
import {
  avanzaExplicitInternalDisabledActionShellFixtures,
} from "@/lib/avanza-explicit-internal-disabled-action-shell-fixtures";
import {
  avanzaTradeUiReadOnlySelectedRecommendationPreviewModelFixtures,
} from "@/lib/avanza-trade-ui-read-only-selected-recommendation-preview-model-fixtures";
import {
  avanzaTradeUiReadOnlySelectedRecommendationPreviewComponentFixtures,
} from "@/lib/avanza-trade-ui-read-only-selected-recommendation-preview-component-fixtures";
import {
  avanzaSelectedRecommendationSourceExtractionFixtures,
} from "@/lib/avanza-selected-recommendation-source-extraction-fixtures";
import {
  avanzaHardDisabledSourceToPreviewIntegrationFixtures,
} from "@/lib/avanza-hard-disabled-source-to-preview-integration-fixtures";
import {
  avanzaTestOnlyEnabledPreviewFixtureModelFixtures,
} from "@/lib/avanza-test-only-enabled-preview-fixture-model-fixtures";

export const metadata: Metadata = {
  title: "Avanza Dev Visual QA",
  description:
    "Fixture-only Avanza selectedRecommendation preview visual QA surface",
};

const safetyBadges = [
  "Dev-only visual QA",
  "Fixture-only",
  "Not linked from main navigation",
  "No real selectedRecommendation state",
  "No bridge calls",
  "No localhost fetch",
  "No execution",
  "Controls disabled",
  "Gate locked",
] as const;

export default function AvanzaDevVisualQaPage() {
  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6">
        <header className="grid gap-3">
          <div className="flex flex-wrap gap-2">
            {safetyBadges.map((badge) => (
              <span
                className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs font-semibold text-zinc-300"
                key={badge}
              >
                {badge}
              </span>
            ))}
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-zinc-500">
              Isolated Avanza fixture surface
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-normal text-white">
              Dev-only visual QA
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
              Fixture-only route shell for Avanza selectedRecommendation
              preview scenarios. It does not read Trade UI state, does not use
              real selectedRecommendation state, does not fetch, does not call
              the bridge, and does not enable execution.
            </p>
          </div>
        </header>

        <AvanzaDevVisualQaRouteStatusPanel />

        <section className="grid gap-4 rounded-md border border-white/10 bg-white/[0.025] p-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              Local browser agent runtime
            </h2>
            <p className="mt-1 text-xs leading-5 text-zinc-400">
              {
                "Fixture only. Local/dev-only. First active-direction Sharp Semi Auto runtime layer. No Avanza navigation yet, No login yet, No credential handling yet, No form fill yet, No API route call, No fetch, No order submission, No final KÖP/SÄLJ click, Final human confirmation required, BankID bypass forbidden, Controls disabled, Gate locked, Not production ready, and runtime_ready_local_dev remains model-only."
              }
            </p>
          </div>
          <AvanzaLocalBrowserAgentRuntimeHarness
            fixtures={avanzaLocalBrowserAgentRuntimeFixtures}
          />
        </section>

        <section className="grid gap-4 rounded-md border border-white/10 bg-white/[0.025] p-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              Login and credential readiness
            </h2>
            <p className="mt-1 text-xs leading-5 text-zinc-400">
              {
                "Fixture only. Read-only model. Local/dev-only. Avanza login state detector. Secure credential provider interface. No actual login, No credential material returned, No Keychain access yet, No 1Password CLI call, No env read, No cookies/session handling, No BankID automation, No BankID bypass, No Avanza navigation yet, No form fill yet, No order submission, Final human confirmation required, Not production ready, username_password_possible remains model-only, and mfa_or_bankid_required remains manual-user-action only."
              }
            </p>
          </div>
          <AvanzaLoginAndCredentialReadinessHarness
            credentialProviderFixtures={avanzaSecureCredentialProviderFixtures}
            loginFixtures={avanzaLoginStateDetectorFixtures}
          />
        </section>

        <section className="grid gap-4 rounded-md border border-white/10 bg-white/[0.025] p-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              Local Playwright browser adapter
            </h2>
            <p className="mt-1 text-xs leading-5 text-zinc-400">
              {
                "Fixture only. Local/dev-only. Adapter model + callable contract. No browser launch during render, No Avanza navigation yet, No login yet, No credential handling, No cookie/session handling, No form fill yet, No click yet, No final KÖP/SÄLJ click, No order submission, Final human confirmation required, BankID bypass forbidden, Controls disabled, Gate locked, and Not production ready."
              }
            </p>
          </div>
          <AvanzaLocalPlaywrightBrowserAdapterHarness
            fixtures={avanzaLocalPlaywrightBrowserAdapterFixtures}
          />
        </section>

        <section className="grid gap-4 rounded-md border border-white/10 bg-white/[0.025] p-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              Avanza local Playwright page action binding
            </h2>
            <p className="mt-1 text-xs leading-5 text-zinc-400">
              {
                "Fixture/mock only. Injected Playwright-like page only. Local/dev-only. No Trade UI wiring. No automatic Avanza navigation. No raw credentials shown. Fill values hidden in reports. No cookies/session. No BankID automation. No order submission. No final KÖP/SÄLJ click. Not production ready."
              }
            </p>
          </div>
          <AvanzaLocalPlaywrightPageActionBindingHarness
            fixtures={avanzaLocalPlaywrightPageActionBindingFixtures}
          />
        </section>

        <section className="grid gap-4 rounded-md border border-white/10 bg-white/[0.025] p-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              Avanza page/state detector
            </h2>
            <p className="mt-1 text-xs leading-5 text-zinc-400">
              {
                "Fixture only. Snapshot model. Local/dev-only. No real Avanza navigation, No login, No credential handling, No cookie/session handling, No form fill, No click, No final KÖP/SÄLJ click, No order submission, BankID/MFA requires manual action, Final human confirmation required, Not production ready, statuses include avanza_login_page, avanza_logged_in_home, avanza_account_overview, avanza_instrument_page, avanza_order_ticket, avanza_order_review, avanza_order_confirmation, avanza_bankid_or_mfa, avanza_error_page, non_avanza_page, avanza_public_page, not_checked, blocked, and unknown."
              }
            </p>
          </div>
          <AvanzaPageStateDetectorHarness
            fixtures={avanzaPageStateDetectorFixtures}
          />
        </section>

        <section className="grid gap-4 rounded-md border border-white/10 bg-white/[0.025] p-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              Avanza sanitized page snapshot intake
            </h2>
            <p className="mt-1 text-xs leading-5 text-zinc-400">
              {
                "Fixture only. Manual/sanitized signals only. No credentials, No cookies/session, No BankID QR, No account numbers, No route path exposure, No Avanza navigation, No login, No form fill, No click, No order submission, Safe for selector/state planning only, Final human confirmation required, Not production ready, blocked password fixture visible, blocked personnummer fixture visible, blocked cookie/session fixture visible, and blocked BankID QR fixture visible."
              }
            </p>
          </div>
          <AvanzaSanitizedPageSnapshotHarness
            fixtures={avanzaSanitizedPageSnapshotFixtures}
          />
        </section>

        <section className="grid gap-4 rounded-md border border-white/10 bg-white/[0.025] p-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              Avanza real-world login signal pack
            </h2>
            <p className="mt-1 text-xs leading-5 text-zinc-400">
              {
                "Based on sanitized user-provided visual material. Fixture only. No credentials, No password values, No personnummer, No account numbers, No cookies/session, No BankID QR, Username/password flow recognized, Private login flow recognized, Company login flow recognized, BankID options detected but forbidden, No actual login, No credential handling, No form fill, No click, No Avanza navigation, No order submission, Final human confirmation required, Not production ready. Includes sanitized cues: Användarnamn och lösenord, Privatkund, Företag, Visa QR-kod, Öppna BankID på samma enhet, and Logga in på företagswebben."
              }
            </p>
          </div>
          <AvanzaRealWorldLoginSignalsHarness
            fixtures={avanzaRealWorldLoginSignalFixtures}
          />
        </section>

        <section className="grid gap-4 rounded-md border border-white/10 bg-white/[0.025] p-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              Avanza real-world order flow signals
            </h2>
            <p className="mt-1 text-xs leading-5 text-zinc-400">
              {
                "Based on sanitized user-provided buy-flow material. Fixture/model only. BUY flow recognized. SELL flow modeled from same structure. Order panel recognized. Review step recognized. Success confirmation recognized. Failed confirmation recognized. Order list/detail recognized. No real form fill. No click. No final KÖP/SÄLJ click. No order submission. No cookies/session. No BankID automation. No Trade UI wiring. No API route wiring. Final human confirmation required. Not production ready."
              }
            </p>
          </div>
          <AvanzaRealWorldOrderFlowSignalsHarness
            fixtures={avanzaRealWorldOrderFlowSignalFixtures}
          />
        </section>

        <section className="grid gap-4 rounded-md border border-white/10 bg-white/[0.025] p-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              Avanza settlement note / order information signals
            </h2>
            <p className="mt-1 text-xs leading-5 text-zinc-400">
              {
                "Based on sanitized user-provided settlement-flow material. Fixture/model only. Min ekonomi recognized. Transaktioner recognized. Transaction list recognized. Matching BUY/SELL transaction modeled. Transaction detail panel recognized. Avräkningsnota recognized. Courtage / FX / settlement labels recognized. No real Avanza navigation. No PDF/download/read. No OCR. No value extraction. No trade reconciliation write. No cookies/session. No BankID automation. No Trade UI wiring. No API route wiring. Not production ready."
              }
            </p>
          </div>
          <AvanzaSettlementNoteSignalsHarness
            fixtures={avanzaSettlementNoteSignalFixtures}
          />
        </section>

        <section className="grid gap-4 rounded-md border border-white/10 bg-white/[0.025] p-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              Avanza settlement note route contract
            </h2>
            <p className="mt-1 text-xs leading-5 text-zinc-400">
              {
                "Fixture/model only. Settlement route modeled. BUY/SELL trade reference supported. Min ekonomi route modeled. Transaktioner route modeled. Transaction matching modeled. Avräkningsnota location modeled. Planned route is not executable yet. No real Avanza navigation. No document read. No OCR. No value extraction. No reconciliation write. No cookies/session. No BankID automation. No Trade UI wiring. No API route wiring. Not production ready."
              }
            </p>
          </div>
          <AvanzaSettlementNoteRouteContractHarness
            fixtures={avanzaSettlementNoteRouteContractFixtures}
          />
        </section>

        <section className="grid gap-4 rounded-md border border-white/10 bg-white/[0.025] p-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              Avanza settlement note action contract
            </h2>
            <p className="mt-1 text-xs leading-5 text-zinc-400">
              {
                "Fixture/model only. Contract only. Settlement action plan modeled. Matching transaction action modeled. Avräkningsnota action modeled. Planned actions are not executable yet. No real Avanza navigation. No document read. No OCR. No value extraction. No reconciliation write. No cookies/session. No BankID automation. No Trade UI wiring. No API route wiring. Not production ready."
              }
            </p>
          </div>
          <AvanzaSettlementNoteActionContractHarness
            fixtures={avanzaSettlementNoteActionContractFixtures}
          />
        </section>

        <section className="grid gap-4 rounded-md border border-white/10 bg-white/[0.025] p-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              Avanza settlement note extraction schema
            </h2>
            <p className="mt-1 text-xs leading-5 text-zinc-400">
              {
                "Fixture/model only. Extraction targets only. Courtage target modeled. FX/växelkurs target modeled. Settlement amount target modeled. Trade/settlement dates modeled. No PDF/download/read. No OCR. No value extraction. No reconciliation write. No Supabase write. Manual review required. Not production ready."
              }
            </p>
          </div>
          <AvanzaSettlementNoteExtractionSchemaHarness
            fixtures={avanzaSettlementNoteExtractionSchemaFixtures}
          />
        </section>

        <section className="grid gap-4 rounded-md border border-white/10 bg-white/[0.025] p-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              Avanza settlement reconciliation mapping
            </h2>
            <p className="mt-1 text-xs leading-5 text-zinc-400">
              {
                "Fixture/model only. Reconciliation preview only. Courtage mapped. FX mapped. Settlement amount mapped. PnL adjustment modeled. Writes are forbidden. No Supabase write. Manual review required. Not production ready."
              }
            </p>
          </div>
          <AvanzaSettlementReconciliationMappingHarness
            fixtures={avanzaSettlementReconciliationMappingFixtures}
          />
        </section>

        <section className="grid gap-4 rounded-md border border-white/10 bg-white/[0.025] p-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              Avanza settlement reconciliation dry-run executor
            </h2>
            <p className="mt-1 text-xs leading-5 text-zinc-400">
              {
                "Fixture/model only. Dry-run only. Full post-trade reconciliation path simulated. Courtage extraction target simulated. FX/växelkurs extraction target simulated. Settlement amount target simulated. Reconciliation targets simulated. Manual review required. No real Avanza navigation. No PDF/download/read. No OCR. No value extraction. No reconciliation write. No Supabase write. No cookies/session. No BankID automation. No Trade UI wiring. No API route wiring. Not production ready."
              }
            </p>
          </div>
          <AvanzaSettlementReconciliationDryRunExecutorHarness
            fixtures={avanzaSettlementReconciliationDryRunExecutorFixtures}
          />
        </section>

        <section className="grid gap-4 rounded-md border border-white/10 bg-white/[0.025] p-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              Avanza settlement reconciliation mock executor
            </h2>
            <p className="mt-1 text-xs leading-5 text-zinc-400">
              {
                "Fixture/model only. Mock only. Simulated Avanza settlement state only. Full post-trade reconciliation path simulated. BUY settlement mock reaches manual review. SELL settlement mock reaches manual review. Transaction matching simulated. Avräkningsnota simulated. Courtage mocked. FX/växelkurs mocked. Settlement amount mocked. Reconciliation preview simulated. Manual review required. No real Avanza navigation. No PDF/download/read. No OCR. No real value extraction. No reconciliation write. No Supabase write. No cookies/session. No BankID automation. No Trade UI wiring. No API route wiring. Not production ready."
              }
            </p>
          </div>
          <AvanzaSettlementReconciliationMockExecutorHarness
            fixtures={avanzaSettlementReconciliationMockExecutorFixtures}
          />
        </section>

        <section className="grid gap-4 rounded-md border border-white/10 bg-white/[0.025] p-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              Avanza real-world instrument search signals
            </h2>
            <p className="mt-1 text-xs leading-5 text-zinc-400">
              {
                "Based on sanitized user-provided search screenshots. Fixture/model only. Search button recognized. Search panel recognized. Search input recognized. Search results recognized. Matching instrument recognized. Instrument detail page recognized. Instrument verification section recognized. BUY/SELL entry buttons recognized. No real search execution. No real Avanza navigation. No click. No order submission. No cookies/session. No BankID automation. No Trade UI wiring. No API route wiring. Final human confirmation required. Not production ready."
              }
            </p>
          </div>
          <AvanzaRealWorldInstrumentSearchSignalsHarness
            fixtures={avanzaRealWorldInstrumentSearchSignalFixtures}
          />
        </section>

        <section className="grid gap-4 rounded-md border border-white/10 bg-white/[0.025] p-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              Avanza instrument search route contract
            </h2>
            <p className="mt-1 text-xs leading-5 text-zinc-400">
              {
                "Fixture/model only. Contract only. BUY instrument route modeled. SELL instrument route modeled. Instrument verification modeled. Planned actions are not executable yet. No real search execution. No real Avanza navigation. No click. No BUY/SELL entry click. No order submission. No cookies/session. No BankID automation. No Trade UI wiring. No API route wiring. Final human confirmation required. Not production ready."
              }
            </p>
          </div>
          <AvanzaInstrumentSearchRouteContractHarness
            fixtures={avanzaInstrumentSearchRouteContractFixtures}
          />
        </section>

        <section className="grid gap-4 rounded-md border border-white/10 bg-white/[0.025] p-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              Avanza instrument search action contract
            </h2>
            <p className="mt-1 text-xs leading-5 text-zinc-400">
              {
                "Fixture/model only. Contract only. BUY instrument route modeled. SELL instrument route modeled. Instrument verification modeled. Planned actions are not executable yet. No real search execution. No real Avanza navigation. No click. No BUY/SELL entry click. No order submission. No cookies/session. No BankID automation. No Trade UI wiring. No API route wiring. Final human confirmation required. Not production ready."
              }
            </p>
          </div>
          <AvanzaInstrumentSearchActionContractHarness
            fixtures={avanzaInstrumentSearchActionContractFixtures}
          />
        </section>

        <section className="grid gap-4 rounded-md border border-white/10 bg-white/[0.025] p-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              Avanza instrument search to order ticket handoff chain
            </h2>
            <p className="mt-1 text-xs leading-5 text-zinc-400">
              {
                "Fixture/model only. Full pre-submit chain modeled. Execution package to instrument search modeled. Instrument verification modeled. Verified instrument to order ticket modeled. BUY handoff chain modeled. SELL handoff chain modeled. Planned steps are not executable yet. No real search execution. No real Avanza navigation. No real form fill. No click. No BUY/SELL entry click. No final KÖP/SÄLJ click. No order submission. No cookies/session. No BankID automation. No Trade UI wiring. No API route wiring. Final human confirmation required. Not production ready."
              }
            </p>
          </div>
          <AvanzaInstrumentToOrderHandoffChainHarness
            fixtures={avanzaInstrumentToOrderHandoffChainFixtures}
          />
        </section>

        <section className="grid gap-4 rounded-md border border-white/10 bg-white/[0.025] p-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              Avanza instrument-to-order dry-run executor
            </h2>
            <p className="mt-1 text-xs leading-5 text-zinc-400">
              {
                "Fixture/model only. Dry-run only. Full pre-submit flow simulated. BUY dry-run to final human action. SELL dry-run to final human action. Instrument verification checked. Order ticket readiness checked. Planned steps are not executable yet. No real search execution. No real Avanza navigation. No real form fill. No click. No BUY/SELL entry click. No final KÖP/SÄLJ click. No order submission. No cookies/session. No BankID automation. No Trade UI wiring. No API route wiring. Final human confirmation required. Not production ready."
              }
            </p>
          </div>
          <AvanzaInstrumentToOrderDryRunExecutorHarness
            fixtures={avanzaInstrumentToOrderDryRunExecutorFixtures}
          />
        </section>

        <section className="grid gap-4 rounded-md border border-white/10 bg-white/[0.025] p-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              Avanza instrument-to-order mock executor
            </h2>
            <p className="mt-1 text-xs leading-5 text-zinc-400">
              {
                "Fixture/model only. Mock only. Simulated Avanza page state only. Full pre-submit flow simulated. BUY mock reaches final human action. SELL mock reaches final human action. Search simulated. Instrument verification simulated. Order ticket preparation simulated. Review-ready state simulated. No real search execution. No real Avanza navigation. No real form fill. No click. No BUY/SELL entry click. No final KÖP/SÄLJ click. No order submission. No cookies/session. No BankID automation. No Trade UI wiring. No API route wiring. Final human confirmation required. Not production ready."
              }
            </p>
          </div>
          <AvanzaInstrumentToOrderMockExecutorHarness
            fixtures={avanzaInstrumentToOrderMockExecutorFixtures}
          />
        </section>

        <section className="grid gap-4 rounded-md border border-white/10 bg-white/[0.025] p-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              Ture Avanza execution settings profile
            </h2>
            <p className="mt-1 text-xs leading-5 text-zinc-400">
              {
                "Fixture only. User selects Privat or Företag in Ture Settings. Username/password login only. BankID forbidden. Secure credential provider modeled. No credential material shown, No password returned, No Supabase credential storage, No localStorage credential storage, No actual login, No form fill, No order submission, Final human confirmation required, Not production ready. Fixture ids include private_username_password_ready_macos_keychain, company_username_password_ready_macos_keychain, and bankid_forbidden_blocked."
              }
            </p>
          </div>
          <AvanzaExecutionSettingsProfileHarness
            fixtures={avanzaExecutionSettingsProfileFixtures}
          />
        </section>

        <section className="grid gap-4 rounded-md border border-white/10 bg-white/[0.025] p-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              Ture Settings Avanza profile panel
            </h2>
            <p className="mt-1 text-xs leading-5 text-zinc-400">
              {
                "Fixture/model only. Passive settings UI only. User can model Privat, Företag, or Not selected plus username/password reference readiness. No raw username field, No raw password field, No credential material shown, No password storage, No Supabase credential storage, No localStorage credential storage, No Keychain access from UI, No smoke test from UI, No login from UI, No browser automation, No API route call, No order submission, Final KÖP/SÄLJ human-only, and Not production ready."
              }
            </p>
          </div>
          <AvanzaExecutionSettingsProfilePanelHarness
            fixtures={avanzaExecutionSettingsProfileUiFixtures}
          />
        </section>

        <section className="grid gap-4 rounded-md border border-white/10 bg-white/[0.025] p-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              Avanza BUY/SELL order ticket field contract
            </h2>
            <p className="mt-1 text-xs leading-5 text-zinc-400">
              {
                "Fixture/model only. Limit orders only. BUY preparation modeled. SELL preparation modeled. No real form fill. No click. No final KÖP/SÄLJ click. No order submission. No cookies/session. No BankID automation. No Trade UI wiring. No API route wiring. Final human confirmation required. Not production ready."
              }
            </p>
          </div>
          <AvanzaOrderTicketFieldContractHarness
            fixtures={avanzaOrderTicketFieldContractFixtures}
          />
        </section>

        <section className="grid gap-4 rounded-md border border-white/10 bg-white/[0.025] p-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              Avanza order ticket action contract
            </h2>
            <p className="mt-1 text-xs leading-5 text-zinc-400">
              {
                "Fixture/model only. Contract only. BUY action plan modeled. SELL action plan modeled. Limit orders only. Planned actions are not executable yet. No real form fill. No click. No final KÖP/SÄLJ click. No order submission. No cookies/session. No BankID automation. No Trade UI wiring. No API route wiring. Final human confirmation required. Not production ready."
              }
            </p>
          </div>
          <AvanzaOrderTicketActionContractHarness
            fixtures={avanzaOrderTicketActionContractFixtures}
          />
        </section>

        <section className="grid gap-4 rounded-md border border-white/10 bg-white/[0.025] p-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              Avanza login route planner
            </h2>
            <p className="mt-1 text-xs leading-5 text-zinc-400">
              {
                "Fixture only. Route model only. Privat/Företag from Ture Settings. Username/password only. BankID forbidden. Planned steps are not executable yet. No actual navigation, No actual login, No credential material, No form fill, No click, No cookies/session, No order submission, Final human confirmation required, Not production ready. Fixture ids include ready_private_username_password, ready_company_username_password, requires_username_password_choice, requires_company_toggle, and bankid_or_mfa_manual_action_required."
              }
            </p>
          </div>
          <AvanzaLoginRoutePlannerHarness
            fixtures={avanzaLoginRoutePlannerFixtures}
          />
        </section>

        <section className="grid gap-4 rounded-md border border-white/10 bg-white/[0.025] p-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              Avanza login action contract
            </h2>
            <p className="mt-1 text-xs leading-5 text-zinc-400">
              {
                "Fixture only. Contract only. Planned actions are not executable yet. No actual navigation, No actual login, No credential material, No password values, No form fill, No click, No cookies/session, BankID forbidden/manual-action only, No order submission, Final human confirmation required, Not production ready. Fixture statuses include action_plan_ready, waiting_for_credentials, bankid_or_mfa_manual_action_required, click_username_password_method, click_company_toggle, fill_username, fill_password, click_login_submit, containsCredentialMaterial, executableInThisTask, and dryRunOnly."
              }
            </p>
          </div>
          <AvanzaLoginActionContractHarness
            fixtures={avanzaLoginActionContractFixtures}
          />
        </section>

        <section className="grid gap-4 rounded-md border border-white/10 bg-white/[0.025] p-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              Avanza login dry-run executor
            </h2>
            <p className="mt-1 text-xs leading-5 text-zinc-400">
              {
                "Fixture only. Dry-run only. Consumes login action contract output for model-only feasibility reporting. No actual navigation, No actual login, No credential material, No password values, No form fill, No click, No cookies/session, BankID forbidden/manual-action only, No order submission, Final human confirmation required, Not production ready. Fixture statuses include dry_run_passed, dry_run_missing_credentials, dry_run_bankid_or_mfa_stop, dry_run_blocked, dry_run_error, and unknown. Report fields include containsCredentialMaterial, executableNow, and wouldUseCredentialReference."
              }
            </p>
          </div>
          <AvanzaLoginDryRunExecutorHarness
            fixtures={avanzaLoginDryRunExecutorFixtures}
          />
        </section>

        <section className="grid gap-4 rounded-md border border-white/10 bg-white/[0.025] p-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              Avanza login mock page executor
            </h2>
            <p className="mt-1 text-xs leading-5 text-zinc-400">
              {
                "Fixture only. Mock only. Simulated page state only. Consumes login action contract and dry-run report output for model-only mock page execution. No real browser actions, No actual Avanza navigation, No actual login, No credential material, No password values, No real form fill, No real click, No cookies/session, BankID forbidden/manual-action only, No order submission, Final human confirmation required, Not production ready. Fixture statuses include mock_executed, mock_missing_credentials, mock_bankid_or_mfa_stop, mock_blocked, mock_error, and unknown. Report fields include actionReports, containsCredentialMaterial, realBrowserAction, and canExecuteMockActions."
              }
            </p>
          </div>
          <AvanzaLoginMockPageExecutorHarness
            fixtures={avanzaLoginMockPageExecutorFixtures}
          />
        </section>

        <section className="grid gap-4 rounded-md border border-white/10 bg-white/[0.025] p-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              Avanza login local-dev executor
            </h2>
            <p className="mt-1 text-xs leading-5 text-zinc-400">
              {
                "Fixture/mock only. Injected dependencies only. No Trade UI wiring, No raw credentials, Credential references only, No cookies/session, BankID forbidden/manual-action only, No order submission, No final KÖP/SÄLJ click, Local/dev-only, Not production ready. Fixture statuses include ready, executed, missing_credentials, bankid_or_mfa_stop, page_action_failed, blocked, error, and unknown. Fixture IDs include successful_private_injected_execution_report, successful_company_injected_execution_report, dry_run_true_blocks_execution, missing_credentials, bankid_or_mfa_stop, click_username_password_method_failed, fill_username_failed, fill_password_failed, and click_login_submit_failed. Report fields include actionReports, valueReference, containsCredentialMaterial, realBrowserActionAttempted, canResolveCredentialMaterial, canReadCredentialMaterial, canReturnCredentialMaterial, and canLogCredentialMaterial."
              }
            </p>
          </div>
          <AvanzaLoginLocalDevExecutorHarness
            fixtures={avanzaLoginLocalDevExecutorFixtures}
          />
        </section>

        <section className="grid gap-4 rounded-md border border-white/10 bg-white/[0.025] p-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              Avanza macOS Keychain credential provider
            </h2>
            <p className="mt-1 text-xs leading-5 text-zinc-400">
              {
                "Fixture/mock only. Injected Keychain dependency only. Local/dev-only. Credential references only. No raw password shown, No raw username shown, No credential logging, No Supabase credential storage, No localStorage credential storage, No environment fallback by default, No BankID automation, No order submission, Final human confirmation required, and Not production ready."
              }
            </p>
          </div>
          <AvanzaMacosKeychainCredentialProviderHarness
            fixtures={avanzaMacosKeychainCredentialProviderFixtures}
          />
        </section>

        <section className="grid gap-4 rounded-md border border-white/10 bg-white/[0.025] p-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              Avanza login credential resolution bridge
            </h2>
            <p className="mt-1 text-xs leading-5 text-zinc-400">
              {
                "Fixture/mock only. Injected credential dependency only. Local/dev-only. Credential references resolved internally only. No raw username shown, No raw password shown, No credential logging, No Supabase credential storage, No localStorage credential storage, No environment fallback, No BankID automation, No order submission, Final human confirmation required, and Not production ready."
              }
            </p>
          </div>
          <AvanzaLoginCredentialResolutionBridgeHarness
            fixtures={avanzaLoginCredentialResolutionBridgeFixtures}
          />
        </section>

        <section className="grid gap-4 rounded-md border border-white/10 bg-white/[0.025] p-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              Avanza local-dev login executor with credential bundle
            </h2>
            <p className="mt-1 text-xs leading-5 text-zinc-400">
              {
                "Fixture/mock only. Injected dependencies only. Local/dev-only. Runtime credential bundle used internally only. No raw username shown, No raw password shown, No credential logging, No Supabase credential storage, No localStorage credential storage, No cookies/session, BankID forbidden/manual-action only, No order submission, No final KÖP/SÄLJ click, No Trade UI wiring, and Not production ready."
              }
            </p>
          </div>
          <AvanzaLoginLocalDevCredentialExecutorHarness
            fixtures={avanzaLoginLocalDevCredentialExecutorFixtures}
          />
        </section>

        <section className="grid gap-4 rounded-md border border-white/10 bg-white/[0.025] p-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              Avanza isolated login smoke test
            </h2>
            <p className="mt-1 text-xs leading-5 text-zinc-400">
              {
                "Fixture/model only. Explicit local-dev run only. Manual terminal run required. CI blocked. No Trade UI wiring. No API route wiring. No raw username shown. No raw password shown. No credential logging. No cookies/session. BankID forbidden/manual-action only. No order submission. No final KÖP/SÄLJ click. Not production ready."
              }
            </p>
          </div>
          <AvanzaIsolatedLoginSmokeTestHarness
            fixtures={avanzaIsolatedLoginSmokeTestFixtures}
          />
        </section>

        <section className="grid gap-4 rounded-md border border-white/10 bg-white/[0.025] p-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              Avanza isolated login smoke test runner
            </h2>
            <p className="mt-1 text-xs leading-5 text-zinc-400">
              {
                "Fixture/model only. Manual local terminal only. Explicit env opt-in required. CI blocked. Injected dependencies only. No Trade UI wiring. No API route wiring. No raw username shown. No raw password shown. No credential logging. No cookies/session. BankID forbidden/manual-action only. No order submission. No final KÖP/SÄLJ click. Not production ready."
              }
            </p>
          </div>
          <AvanzaIsolatedLoginSmokeTestRunnerHarness
            fixtures={avanzaIsolatedLoginSmokeTestRunnerFixtures}
          />
        </section>

        <section className="grid gap-4 rounded-md border border-white/10 bg-white/[0.025] p-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              Avanza terminal login smoke script
            </h2>
            <p className="mt-1 text-xs leading-5 text-zinc-400">
              {
                "Fixture/model only. Terminal-only. Explicit env opt-in required. Manual local confirmation required. Real-run requires extra flag. CI blocked. No Trade UI wiring. No API route wiring. No raw username shown. No raw password shown. No credential logging. No cookies/session. BankID forbidden/manual-action only. No order submission. No final KÖP/SÄLJ click. Not production ready."
              }
            </p>
          </div>
          <AvanzaTerminalLoginSmokeScriptHarness
            fixtures={avanzaTerminalLoginSmokeScriptFixtures}
          />
        </section>

        <section className="grid gap-4 rounded-md border border-white/10 bg-white/[0.025] p-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              Route access fixtures
            </h2>
            <p className="mt-1 text-xs leading-5 text-zinc-400">
              Static route-access decisions only. The default route access
              model remains hidden; this page renders fixture states for visual
              QA and is not linked from main navigation.
            </p>
          </div>
          <AvanzaDevVisualQaRouteAccessHarness />
        </section>

        <section className="grid gap-4 rounded-md border border-white/10 bg-white/[0.025] p-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              Visible preview surface fixtures
            </h2>
            <p className="mt-1 text-xs leading-5 text-zinc-400">
              Static selectedRecommendation preview fixtures only. Controls
              remain disabled, the pre-activation gate remains locked, and
              total-read remains advisory.
            </p>
          </div>
          <AvanzaDevVisibleSelectedRecommendationPreviewSurfaceGallery />
        </section>

        <section className="grid gap-4 rounded-md border border-white/10 bg-white/[0.025] p-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              selectedRecommendation source extraction
            </h2>
            <p className="mt-1 text-xs leading-5 text-zinc-400">
              {
                "Source fixture only. Explicit candidate input only. No real selectedRecommendation state is read, No real selectedRecommendation state is rendered, No previewState is derived, No Trade UI wiring, No bridge calls, No localhost fetch, No polling, No execution, Controls disabled, Gate locked, and source_ready_read_only remains read-only/model-only."
              }
            </p>
          </div>
          <AvanzaSelectedRecommendationSourceExtractionHarness
            fixtures={avanzaSelectedRecommendationSourceExtractionFixtures}
          />
        </section>

        <section className="grid gap-4 rounded-md border border-white/10 bg-white/[0.025] p-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              hard-disabled source-to-preview integration
            </h2>
            <p className="mt-1 text-xs leading-5 text-zinc-400">
              {
                "Integration fixture only. Explicit input only. No real selectedRecommendation state is read, No real selectedRecommendation state is rendered, No previewState is derived, No Trade UI wiring, No bridge calls, No localhost fetch, No polling, No execution, Controls disabled, Gate locked, and preview_model_ready_read_only remains read-only/model-only."
              }
            </p>
          </div>
          <AvanzaHardDisabledSourceToPreviewIntegrationHarness
            fixtures={avanzaHardDisabledSourceToPreviewIntegrationFixtures}
          />
        </section>

        <section className="grid gap-4 rounded-md border border-white/10 bg-white/[0.025] p-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              test-only enabled preview fixture model
            </h2>
            <p className="mt-1 text-xs leading-5 text-zinc-400">
              {
                "Test-only fixture only. Static sanitized input only. No real selectedRecommendation state is read, No real selectedRecommendation state is rendered, No previewState is derived, No Trade UI wiring, No bridge calls, No localhost fetch, No polling, No execution, Controls disabled, Gate locked, and test_only_preview_ready_read_only remains read-only/model-only."
              }
            </p>
          </div>
          <AvanzaTestOnlyEnabledPreviewFixtureModelHarness
            fixtures={avanzaTestOnlyEnabledPreviewFixtureModelFixtures}
          />
        </section>

        <section className="grid gap-4 rounded-md border border-white/10 bg-white/[0.025] p-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              Read-only selectedRecommendation dev preview guard
            </h2>
            <p className="mt-1 text-xs leading-5 text-zinc-400">
              Fixture/model only. No real selectedRecommendation state is read,
              no real selectedRecommendation state is rendered, no bridge calls,
              no localhost fetch, no polling, no execution, controls disabled,
              and gate locked.
            </p>
          </div>
          <AvanzaReadOnlySelectedRecommendationDevPreviewGuardHarness />
        </section>

        <section className="grid gap-4 rounded-md border border-white/10 bg-white/[0.025] p-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              Real selectedRecommendation read-only input guard
            </h2>
            <p className="mt-1 text-xs leading-5 text-zinc-400">
              {
                "Guard fixture only. No real selectedRecommendation state is read, No real selectedRecommendation state is rendered, No app/route preview state is derived, No bridge calls, No localhost fetch, No polling, No execution, Controls disabled, Gate locked, and read_only_input_allowed remains model-only/read-only."
              }
            </p>
          </div>
          <AvanzaRealSelectedRecommendationReadOnlyInputGuardHarness />
        </section>

        <section className="grid gap-4 rounded-md border border-white/10 bg-white/[0.025] p-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              Read-only selectedRecommendation derivation decision
            </h2>
            <p className="mt-1 text-xs leading-5 text-zinc-400">
              {
                "Decision fixture only. No real selectedRecommendation state is read from app or route, no real selectedRecommendation state is rendered, no real preview state is derived, no real preview state is rendered, no bridge calls, no localhost fetch, no polling, no execution, controls disabled, and gate locked."
              }
            </p>
          </div>
          <AvanzaReadOnlySelectedRecommendationDerivationDecisionHarness />
        </section>

        <section className="grid gap-4 rounded-md border border-white/10 bg-white/[0.025] p-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              Adapter/derived-preview integration decision
            </h2>
            <p className="mt-1 text-xs leading-5 text-zinc-400">
              {
                "Decision fixture only. No adapter is called, no derived-preview builder is called, no real selectedRecommendation state is read from app or route, no real selectedRecommendation state is rendered, no real preview state is derived, no real preview state is rendered, no bridge calls, no localhost fetch, no polling, no execution, controls disabled, and gate locked."
              }
            </p>
          </div>
          <AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationDecisionHarness />
        </section>

        <section className="grid gap-4 rounded-md border border-white/10 bg-white/[0.025] p-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              Adapter/derived-preview wrapper
            </h2>
            <p className="mt-1 text-xs leading-5 text-zinc-400">
              {
                "Wrapper fixture only. Adapter and derived-preview invocation use static fixtures only. No real selectedRecommendation state is read from app or route, No real selectedRecommendation state is rendered, No real app or route preview state is derived, No real preview state is rendered in Trade UI, previewState appears only for read_only_preview_ready fixture output, No bridge calls, No localhost fetch, No polling, No execution, Controls disabled, and Gate locked."
              }
            </p>
          </div>
          <AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapperHarness />
        </section>

        <section className="grid gap-4 rounded-md border border-white/10 bg-white/[0.025] p-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              Real selectedRecommendation read-only derivation
            </h2>
            <p className="mt-1 text-xs leading-5 text-zinc-400">
              {
                "Derivation fixture only. Explicit input only. No real selectedRecommendation state is read, No real selectedRecommendation state is rendered, No app/route preview state is derived, No Trade UI wiring, No bridge calls, No localhost fetch, No polling, No execution, Controls disabled, and Gate locked."
              }
            </p>
          </div>
          <AvanzaRealSelectedRecommendationReadOnlyDerivationHarness
            fixtures={avanzaRealSelectedRecommendationReadOnlyDerivationFixtures}
          />
        </section>

        <section className="grid gap-4 rounded-md border border-white/10 bg-white/[0.025] p-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              real selectedRecommendation read-only connection
            </h2>
            <p className="mt-1 text-xs leading-5 text-zinc-400">
              {
                "Connection fixture only. Explicit candidate input only. No Trade UI state is read, No real selectedRecommendation state is read from app/route, No real selectedRecommendation state is rendered from app/route, No previewState is derived, No Trade UI wiring, No bridge calls, No localhost fetch, No polling, No execution, Controls disabled, Gate locked, and preview_ready_read_only remains read-only/model-only."
              }
            </p>
          </div>
          <AvanzaRealSelectedRecommendationReadOnlyConnectionHarness
            fixtures={avanzaRealSelectedRecommendationReadOnlyConnectionFixtures}
          />
        </section>

        <section className="grid gap-4 rounded-md border border-white/10 bg-white/[0.025] p-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              Avanza handoff package builder
            </h2>
            <p className="mt-1 text-xs leading-5 text-zinc-400">
              {
                "Fixture only. Explicit input only. No Trade UI wiring, No bridge calls, No localhost fetch, No polling, No Avanza/browser control, No execution, No order submission, Controls disabled, Gate locked, and handoff_ready_fill_only remains fixture/model-only and non-executable."
              }
            </p>
          </div>
          <AvanzaHandoffPackageBuilderHarness
            fixtures={avanzaHandoffPackageBuilderFixtures}
          />
        </section>

        <section className="grid gap-4 rounded-md border border-white/10 bg-white/[0.025] p-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              Trade UI handoff preview
            </h2>
            <p className="mt-1 text-xs leading-5 text-zinc-400">
              {
                "Fixture only. Explicit input only. No Trade UI wiring, No bridge calls, No localhost fetch, No polling, No Avanza/browser control, No execution, No order submission, Controls disabled, Gate locked, and package_ready_fill_only_preview remains fixture/model-only and non-executable metadata."
              }
            </p>
          </div>
          <AvanzaTradeUiHandoffPreviewHarness
            fixtures={avanzaTradeUiHandoffPreviewFixtures}
          />
        </section>

        <section className="grid gap-4 rounded-md border border-white/10 bg-white/[0.025] p-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              Avanza fill-only adapter contract
            </h2>
            <p className="mt-1 text-xs leading-5 text-zinc-400">
              {
                "Fixture only. Explicit input only. No Trade UI wiring, No bridge calls, No localhost fetch, No polling, No Avanza/browser control, No execution, No order submission, Never clicks review, Never clicks confirm, User must confirm, Final human click required, Controls disabled by default, and Gate locked by default."
              }
            </p>
          </div>
          <AvanzaFillOnlyAdapterContractHarness
            fixtures={avanzaFillOnlyAdapterContractFixtures}
          />
        </section>

        <section className="grid gap-4 rounded-md border border-white/10 bg-white/[0.025] p-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              Avanza dry-run adapter layer
            </h2>
            <p className="mt-1 text-xs leading-5 text-zinc-400">
              {
                "Fixture only. Explicit input only. No Trade UI wiring, No bridge calls, No localhost fetch, No polling, No Avanza/browser control, No execution, No real fill, No order submission, Never clicks review, Never clicks confirm, User must confirm, Final human click required, Controls disabled by default, Gate locked by default, and dry_run_completed_waiting_manual_review remains fixture/model-only and non-executable."
              }
            </p>
          </div>
          <AvanzaDryRunAdapterLayerHarness
            fixtures={avanzaDryRunAdapterLayerFixtures}
          />
        </section>

        <section className="grid gap-4 rounded-md border border-white/10 bg-white/[0.025] p-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              Disabled local bridge contract
            </h2>
            <p className="mt-1 text-xs leading-5 text-zinc-400">
              {
                "Fixture only. Explicit input only. No Trade UI wiring, No bridge calls, No localhost fetch, No polling, No Avanza/browser control, No execution, No real fill, No order submission, Never clicks review, Never clicks confirm, Never submits order, User must confirm, Final human click required, Controls disabled by default, and Gate locked by default."
              }
            </p>
          </div>
          <AvanzaDisabledLocalBridgeContractHarness
            fixtures={avanzaDisabledLocalBridgeContractFixtures}
          />
        </section>

        <section className="grid gap-4 rounded-md border border-white/10 bg-white/[0.025] p-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              Disabled localhost bridge stub
            </h2>
            <p className="mt-1 text-xs leading-5 text-zinc-400">
              {
                "Fixture only. Explicit input only. No API route, No localhost endpoint, No Trade UI wiring, No bridge calls, No localhost fetch, No polling, No Avanza/browser control, No execution, No real fill, No order submission, Never clicks review, Never clicks confirm, Never submits order, User must confirm, Final human click required, Controls disabled by default, and Gate locked by default."
              }
            </p>
          </div>
          <AvanzaDisabledLocalhostBridgeStubHarness
            fixtures={avanzaDisabledLocalhostBridgeStubFixtures}
          />
        </section>

        <section className="grid gap-4 rounded-md border border-white/10 bg-white/[0.025] p-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              Local-only API route stub
            </h2>
            <p className="mt-1 text-xs leading-5 text-zinc-400">
              {
                "Fixture only. Explicit input only. No API route, No localhost endpoint, No Trade UI wiring, No bridge calls, No localhost fetch, No polling, No Avanza/browser control, No execution, No real fill, No order submission, Never clicks review, Never clicks confirm, Never submits order, User must confirm, Final human click required, Controls disabled by default, and Gate locked by default."
              }
            </p>
          </div>
          <AvanzaLocalOnlyApiRouteStubHarness
            fixtures={avanzaLocalOnlyApiRouteStubFixtures}
          />
        </section>

        <section className="grid gap-4 rounded-md border border-white/10 bg-white/[0.025] p-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              Trade UI prepare intent
            </h2>
            <p className="mt-1 text-xs leading-5 text-zinc-400">
              {
                "Fixture only. Explicit input only. No Trade UI wiring, No active prepare button, No active handoff, No API route call, No bridge calls, No localhost fetch, No polling, No Avanza/browser control, No execution, No real fill, No order submission, Never clicks review, Never clicks confirm, Never submits order, User must confirm, Final human click required, Controls disabled by default, Gate locked by default, and prepare_ready_internal remains metadata/internal-only."
              }
            </p>
          </div>
          <AvanzaTradeUiPrepareIntentHarness
            fixtures={avanzaTradeUiPrepareIntentFixtures}
          />
        </section>

        <section className="grid gap-4 rounded-md border border-white/10 bg-white/[0.025] p-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              Disabled internal prepare button shell
            </h2>
            <p className="mt-1 text-xs leading-5 text-zinc-400">
              {
                "Fixture only. Explicit input only. No Trade UI wiring, No active prepare button, No active handoff, No API route call, No bridge calls, No localhost fetch, No polling, No Avanza/browser control, No execution, No real fill, No order submission, Never clicks review, Never clicks confirm, Never submits order, User must confirm, Final human click required, Controls disabled, Gate locked, Internal preview, Disabled, No broker action, and prepare_shell_ready_internal_disabled remains disabled/internal-only."
              }
            </p>
          </div>
          <AvanzaDisabledInternalPrepareButtonShellHarness
            fixtures={avanzaDisabledInternalPrepareButtonShellFixtures}
          />
        </section>

        <section className="grid gap-4 rounded-md border border-white/10 bg-white/[0.025] p-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              Passive disabled prepare shell
            </h2>
            <p className="mt-1 text-xs leading-5 text-zinc-400">
              {
                "Fixture only. Explicit input only. No Trade UI wiring, No active prepare button, No active handoff, No API route call, No bridge calls, No localhost fetch, No polling, No Avanza/browser control, No execution, No real fill, No order submission, Never clicks review, Never clicks confirm, Never submits order, User must confirm, Final human click required, Controls disabled, Gate locked, Internal preview, Disabled, No broker action, and shell_component_ready_internal_disabled remains disabled/internal-only."
              }
            </p>
          </div>
          <AvanzaPassiveDisabledPrepareShellHarness
            fixtures={avanzaPassiveDisabledPrepareShellFixtures}
          />
        </section>

        <section className="grid gap-4 rounded-md border border-white/10 bg-white/[0.025] p-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              Explicit internal visible disabled prepare shell
            </h2>
            <p className="mt-1 text-xs leading-5 text-zinc-400">
              {
                "Fixture only. Explicit input only. Internal/dev-only. Disabled. Manual confirmation required in Avanza. No Trade UI wiring, No active prepare button, No active handoff, No API route call, No bridge calls, No localhost fetch, No polling, No Avanza/browser control, No execution, No real fill, No order submission, Never clicks review, Never clicks confirm, Never submits order, User must confirm, Final human click required, Controls disabled, Gate locked, No broker action, and visible_shell_ready_internal_disabled remains disabled/internal-only."
              }
            </p>
          </div>
          <AvanzaExplicitInternalVisibleDisabledPrepareShellHarness
            fixtures={avanzaExplicitInternalVisibleDisabledPrepareShellFixtures}
          />
        </section>

        <section className="grid gap-4 rounded-md border border-white/10 bg-white/[0.025] p-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              Guarded API route call intent
            </h2>
            <p className="mt-1 text-xs leading-5 text-zinc-400">
              {
                "Fixture only. Explicit input only. Internal/dev-only. Disabled by default. No Trade UI wiring, No active prepare button, No active handoff, No API route call, No fetch, No bridge calls, No localhost fetch, No polling, No Avanza/browser control, No execution, No real fill, No order submission, Never clicks review, Never clicks confirm, Never submits order, User must confirm, Final human click required, Controls disabled, Gate locked, No broker action, statuses include api_call_intent_disabled, route_unavailable, route_disabled, visible_shell_unavailable, api_call_ready_internal_disabled, api_call_blocked, api_call_failed, unknown, safe BUY internal preview intent, safe SELL internal preview intent, safe BUY internal call intent disabled, safe SELL internal call intent disabled, missing visible shell, disabled route state, blocked visible shell, failed input, unsafe input, and api_call_ready_internal_disabled remains disabled/internal-only."
              }
            </p>
          </div>
          <AvanzaGuardedApiRouteCallIntentHarness
            fixtures={avanzaGuardedApiRouteCallIntentFixtures}
          />
        </section>

        <section className="grid gap-4 rounded-md border border-white/10 bg-white/[0.025] p-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              Explicit internal disabled action shell
            </h2>
            <p className="mt-1 text-xs leading-5 text-zinc-400">
              {
                "Fixture only. Explicit input only. Internal/dev-only. Disabled by default. Passive component. No Trade UI wiring, No active prepare button, No active handoff, No API route call, No fetch, No bridge calls, No localhost fetch, No polling, No Avanza/browser control, No execution, No real fill, No order submission, Never clicks review, Never clicks confirm, Never submits order, User must confirm, Final human click required, Controls disabled, Gate locked, No broker action, Not production ready, Manual confirmation required in Avanza, statuses include action_shell_hidden, action_shell_disabled, action_shell_blocked, action_shell_ready_internal_disabled, action_shell_error, unknown, disabled shell with disabled API call intent, blocked shell with blocked API call intent, ready internal disabled shell with safe BUY intent, ready internal disabled shell with safe SELL intent, error shell with failed input, hidden shell by default, disabled mode, internal_disabled mode, missing apiCallIntent, unsafe input, and action_shell_ready_internal_disabled remains disabled/internal-only."
              }
            </p>
          </div>
          <AvanzaExplicitInternalDisabledActionShellHarness
            fixtures={avanzaExplicitInternalDisabledActionShellFixtures}
          />
        </section>

        <section className="grid gap-4 rounded-md border border-white/10 bg-white/[0.025] p-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              Guarded fetch intent
            </h2>
            <p className="mt-1 text-xs leading-5 text-zinc-400">
              {
                "Fixture only. Explicit input only. Internal/dev-only. Disabled by default. No Trade UI wiring, No active prepare button, No active handoff, No API route call, No fetch, No bridge calls, No localhost fetch, No polling, No Avanza/browser control, No execution, No real fill, No order submission, Never clicks review, Never clicks confirm, Never submits order, User must confirm, Final human click required, Controls disabled, Gate locked, No broker action, Not production ready, Manual confirmation required in Avanza, statuses include fetch_intent_disabled, fetch_intent_hidden, fetch_intent_blocked, route_unavailable, route_disabled, internal_guard_missing, action_shell_unavailable, fetch_intent_ready_internal_disabled, fetch_intent_failed, unknown, safe BUY internal preview intent, safe SELL internal preview intent, safe BUY internal fetch intent disabled, safe SELL internal fetch intent disabled, missing action shell, missing route availability, disabled route availability, missing internal guard, blocked action shell, failed input, unsafe input, and fetch_intent_ready_internal_disabled remains disabled/internal-only."
              }
            </p>
          </div>
          <AvanzaGuardedFetchIntentHarness
            fixtures={avanzaGuardedFetchIntentFixtures}
          />
        </section>

        <section className="grid gap-4 rounded-md border border-white/10 bg-white/[0.025] p-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              Disabled local-only manual test path
            </h2>
            <p className="mt-1 text-xs leading-5 text-zinc-400">
              {
                "Fixture only. Explicit input only. Internal/dev-only. Local-only. Disabled by default. No Trade UI wiring, No active prepare button, No active handoff, No API route call, No fetch, No route path exposure, No bridge calls, No localhost fetch, No polling, No Avanza/browser control, No execution, No real fill, No order submission, Never clicks review, Never clicks confirm, Never submits order, User must confirm, Final human click required, Controls disabled, Gate locked, No broker action, Not production ready, Manual confirmation required in Avanza, statuses include manual_test_path_disabled, manual_test_path_hidden, manual_test_path_blocked, route_unavailable, route_disabled, fetch_intent_unavailable, internal_guard_missing, local_only_guard_missing, manual_test_path_ready_internal_disabled, manual_test_path_failed, unknown, safe BUY internal preview manual test path, safe SELL internal preview manual test path, safe BUY internal manual test path disabled, safe SELL internal manual test path disabled, missing fetch intent, missing route state, disabled route state, missing internal guard, missing local-only guard, blocked fetch intent, failed input, unsafe input, and manual_test_path_ready_internal_disabled remains disabled/internal-only."
              }
            </p>
          </div>
          <AvanzaDisabledLocalOnlyManualTestPathHarness
            fixtures={avanzaDisabledLocalOnlyManualTestPathFixtures}
          />
        </section>

        <section className="grid gap-4 rounded-md border border-white/10 bg-white/[0.025] p-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              Trade UI read-only selectedRecommendation preview model
            </h2>
            <p className="mt-1 text-xs leading-5 text-zinc-400">
              {
                "Preview model fixture only. Default-off. Explicit input/config only. No real selectedRecommendation state is read, No real selectedRecommendation state is rendered, No app/route preview state is derived, No Trade UI wiring, No bridge calls, No localhost fetch, No polling, No execution, Controls disabled, and Gate locked."
              }
            </p>
          </div>
          <AvanzaTradeUiReadOnlySelectedRecommendationPreviewModelHarness
            fixtures={avanzaTradeUiReadOnlySelectedRecommendationPreviewModelFixtures}
          />
        </section>

        <section className="grid gap-4 rounded-md border border-white/10 bg-white/[0.025] p-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              Passive Trade UI read-only selectedRecommendation preview
            </h2>
            <p className="mt-1 text-xs leading-5 text-zinc-400">
              {
                "Component fixture only. Explicit modelResult only. Default-off. No real selectedRecommendation state is read, No real selectedRecommendation state is rendered, No app/route preview state is derived, No Trade UI wiring, No bridge calls, No localhost fetch, No polling, No execution, Controls disabled, and Gate locked."
              }
            </p>
          </div>
          <AvanzaTradeUiReadOnlySelectedRecommendationPreviewHarness
            fixtures={avanzaTradeUiReadOnlySelectedRecommendationPreviewComponentFixtures}
          />
        </section>
      </div>
    </main>
  );
}
