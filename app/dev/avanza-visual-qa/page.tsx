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
