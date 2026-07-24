import {
  AvanzaDevPreviewFlagStatusPanel,
} from "@/components/execution/AvanzaDevPreviewFlagStatusPanel";
import {
  AvanzaSelectedRecommendationPreviewStatePanel,
} from "@/components/execution/AvanzaSelectedRecommendationPreviewStatePanel";
import {
  buildAvanzaDevOnlyPreviewEnablementState,
} from "@/lib/avanza-dev-only-preview-enablement-state";
import type {
  AvanzaDevPreviewFlagConfig,
} from "@/lib/avanza-dev-preview-flag-config";
import {
  avanzaHandoffPreviewSourceModes,
} from "@/lib/avanza-handoff-preview-source-mode";
import {
  avanzaTradeReadOnlyReadinessSummaryFixture,
} from "@/lib/avanza-read-only-readiness-fixtures";
import type {
  AvanzaSelectedRecommendationAdapterInput,
  AvanzaSelectedRecommendationAdapterOptions,
} from "@/lib/avanza-selected-recommendation-adapter";
import {
  buildAvanzaPreviewStateFromSelectedRecommendation,
} from "@/lib/avanza-selected-recommendation-derived-preview-state";

type AvanzaSelectedRecommendationPreviewTestOnlyHarnessProps = {
  adapterOptions?: AvanzaSelectedRecommendationAdapterOptions;
  previewFlagConfig: AvanzaDevPreviewFlagConfig;
  selectedRecommendation: AvanzaSelectedRecommendationAdapterInput | null;
};

export function AvanzaSelectedRecommendationPreviewTestOnlyHarness({
  adapterOptions,
  previewFlagConfig,
  selectedRecommendation,
}: AvanzaSelectedRecommendationPreviewTestOnlyHarnessProps) {
  const enablementState = buildAvanzaDevOnlyPreviewEnablementState({
    previewFlagConfig,
  });
  const previewState =
    enablementState.canRenderSelectedRecommendationPreview
      ? buildAvanzaPreviewStateFromSelectedRecommendation({
          adapterOptions,
          readinessSummary: avanzaTradeReadOnlyReadinessSummaryFixture,
          selectedRecommendation,
          sourceMode:
            avanzaHandoffPreviewSourceModes.selected_recommendation_preview_only,
        })
      : null;

  return (
    <section className="grid gap-3">
      <AvanzaDevPreviewFlagStatusPanel enablementState={enablementState} />
      {previewState ? (
        <AvanzaSelectedRecommendationPreviewStatePanel
          previewState={previewState}
        />
      ) : (
        <div className="rounded-md border border-white/10 bg-black/20 p-3 text-xs leading-5 text-zinc-400">
          <p className="font-semibold text-zinc-200">
            Test-only selectedRecommendation preview is disabled
          </p>
          <p className="mt-1">
            Default behavior remains static fixture. No bridge calls, no localhost fetch, no execution, controls disabled, and gate locked.
          </p>
        </div>
      )}
    </section>
  );
}
