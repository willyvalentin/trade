import {
  avanzaHandoffPreviewActiveSourceMode,
} from "@/lib/avanza-handoff-preview-source-mode";
import {
  avanzaTradeReadOnlyReadinessSummaryFixture,
} from "@/lib/avanza-read-only-readiness-fixtures";
import {
  adaptSelectedRecommendationToAvanzaHandoffSource,
  type AvanzaSelectedRecommendationAdapterInput,
  type AvanzaSelectedRecommendationAdapterOptions,
} from "@/lib/avanza-selected-recommendation-adapter";
import {
  buildAvanzaSelectedRecommendationPreviewState,
  type AvanzaSelectedRecommendationPreviewState,
  type BuildAvanzaSelectedRecommendationPreviewStateInput,
} from "@/lib/avanza-selected-recommendation-preview-state";

export type BuildAvanzaPreviewStateFromSelectedRecommendationInput = {
  accountDisplayName?: string | null;
  adapterOptions?: AvanzaSelectedRecommendationAdapterOptions;
  orderMode?: "Avancerad/Limit" | string | null;
  readinessSummary?: BuildAvanzaSelectedRecommendationPreviewStateInput["readinessSummary"];
  selectedRecommendation: AvanzaSelectedRecommendationAdapterInput | null;
  sourceMode?: BuildAvanzaSelectedRecommendationPreviewStateInput["sourceMode"];
};

const DEFAULT_ACCOUNT_DISPLAY_NAME = "Valentin Labs KF";
const DEFAULT_ORDER_MODE = "Avancerad/Limit";

export function buildAvanzaPreviewStateFromSelectedRecommendation({
  accountDisplayName = DEFAULT_ACCOUNT_DISPLAY_NAME,
  adapterOptions,
  orderMode = DEFAULT_ORDER_MODE,
  readinessSummary = avanzaTradeReadOnlyReadinessSummaryFixture,
  selectedRecommendation,
  sourceMode = avanzaHandoffPreviewActiveSourceMode,
}: BuildAvanzaPreviewStateFromSelectedRecommendationInput): AvanzaSelectedRecommendationPreviewState {
  return buildAvanzaSelectedRecommendationPreviewState({
    accountDisplayName,
    orderMode,
    readinessSummary,
    selectedRecommendation: selectedRecommendation
      ? adaptSelectedRecommendationToAvanzaHandoffSource(
          selectedRecommendation,
          adapterOptions,
        )
      : null,
    sourceMode,
  });
}
