import {
  avanzaRealSelectedRecommendationReadOnlyDerivationFixtures,
} from "./avanza-real-selected-recommendation-read-only-derivation-fixtures";
import {
  buildAvanzaTradeUiReadOnlySelectedRecommendationPreview,
  type AvanzaTradeUiReadOnlySelectedRecommendationPreviewConfig,
  type AvanzaTradeUiReadOnlySelectedRecommendationPreviewModel,
  type AvanzaTradeUiReadOnlySelectedRecommendationPreviewStatus,
} from "./avanza-trade-ui-read-only-selected-recommendation-preview-model";

export type AvanzaTradeUiReadOnlySelectedRecommendationPreviewModelFixtureId =
  | "hidden_default"
  | "disabled_config"
  | "no_selected_recommendation"
  | "guard_blocked"
  | "invalid_input"
  | "adapter_rejected"
  | "derived_preview_failed"
  | "read_only_preview_ready";

export type AvanzaTradeUiReadOnlySelectedRecommendationPreviewModelFixture = {
  expectedStatus: AvanzaTradeUiReadOnlySelectedRecommendationPreviewStatus;
  id: AvanzaTradeUiReadOnlySelectedRecommendationPreviewModelFixtureId;
  label: string;
  modelResult: AvanzaTradeUiReadOnlySelectedRecommendationPreviewModel;
  previewConfig?: AvanzaTradeUiReadOnlySelectedRecommendationPreviewConfig;
  selectedRecommendationLikeInput?: unknown;
};

const enabledReadOnlyPreviewConfig: AvanzaTradeUiReadOnlySelectedRecommendationPreviewConfig =
  {
    environment: "dev_read_only",
    explicitPreviewEnabled: true,
    sourceLabel: "trade_ui_read_only_preview_model_fixture",
  };

const disabledReadOnlyPreviewConfig: AvanzaTradeUiReadOnlySelectedRecommendationPreviewConfig =
  {
    disabledReason:
      "Trade UI read-only selectedRecommendation preview fixture config is disabled by default.",
    environment: "default",
    explicitPreviewEnabled: false,
    sourceLabel: "trade_ui_read_only_preview_model_disabled_fixture",
  };

function realDerivationFixtureById(
  id: "guard_blocked" | "invalid_input" | "adapter_rejected" | "derived_preview_failed" | "read_only_preview_ready",
) {
  const fixture = avanzaRealSelectedRecommendationReadOnlyDerivationFixtures.find(
    (item) => item.id === id,
  );

  if (!fixture) {
    throw new Error(`Missing real selectedRecommendation derivation fixture ${id}`);
  }

  return fixture;
}

const guardBlockedDerivationFixture = realDerivationFixtureById("guard_blocked");
const invalidInputDerivationFixture = realDerivationFixtureById("invalid_input");
const adapterRejectedDerivationFixture =
  realDerivationFixtureById("adapter_rejected");
const derivedPreviewFailedDerivationFixture =
  realDerivationFixtureById("derived_preview_failed");
const readOnlyPreviewReadyDerivationFixture =
  realDerivationFixtureById("read_only_preview_ready");

export const avanzaTradeUiReadOnlySelectedRecommendationPreviewModelFixtures: AvanzaTradeUiReadOnlySelectedRecommendationPreviewModelFixture[] =
  [
    {
      expectedStatus: "hidden",
      id: "hidden_default",
      label:
        "Hidden default Trade UI read-only selectedRecommendation preview model fixture",
      modelResult: buildAvanzaTradeUiReadOnlySelectedRecommendationPreview(),
    },
    {
      expectedStatus: "disabled",
      id: "disabled_config",
      label:
        "Disabled config Trade UI read-only selectedRecommendation preview model fixture",
      modelResult: buildAvanzaTradeUiReadOnlySelectedRecommendationPreview({
        previewConfig: disabledReadOnlyPreviewConfig,
        selectedRecommendationLikeInput:
          readOnlyPreviewReadyDerivationFixture.selectedRecommendationLikeInput,
      }),
      previewConfig: disabledReadOnlyPreviewConfig,
      selectedRecommendationLikeInput:
        readOnlyPreviewReadyDerivationFixture.selectedRecommendationLikeInput,
    },
    {
      expectedStatus: "no_selected_recommendation",
      id: "no_selected_recommendation",
      label:
        "No selectedRecommendation Trade UI read-only preview model fixture",
      modelResult: buildAvanzaTradeUiReadOnlySelectedRecommendationPreview({
        previewConfig: enabledReadOnlyPreviewConfig,
      }),
      previewConfig: enabledReadOnlyPreviewConfig,
    },
    {
      expectedStatus: "guard_blocked",
      id: "guard_blocked",
      label:
        "Guard-blocked Trade UI read-only selectedRecommendation preview model fixture",
      modelResult: buildAvanzaTradeUiReadOnlySelectedRecommendationPreview({
        previewConfig: {
          ...enabledReadOnlyPreviewConfig,
          inputGuardDecision: guardBlockedDerivationFixture.guardDecision,
        },
        selectedRecommendationLikeInput:
          guardBlockedDerivationFixture.selectedRecommendationLikeInput,
      }),
      previewConfig: {
        ...enabledReadOnlyPreviewConfig,
        inputGuardDecision: guardBlockedDerivationFixture.guardDecision,
      },
      selectedRecommendationLikeInput:
        guardBlockedDerivationFixture.selectedRecommendationLikeInput,
    },
    {
      expectedStatus: "invalid_input",
      id: "invalid_input",
      label:
        "Invalid input Trade UI read-only selectedRecommendation preview model fixture",
      modelResult: buildAvanzaTradeUiReadOnlySelectedRecommendationPreview({
        previewConfig: enabledReadOnlyPreviewConfig,
        selectedRecommendationLikeInput:
          invalidInputDerivationFixture.selectedRecommendationLikeInput,
      }),
      previewConfig: enabledReadOnlyPreviewConfig,
      selectedRecommendationLikeInput:
        invalidInputDerivationFixture.selectedRecommendationLikeInput,
    },
    {
      expectedStatus: "adapter_rejected",
      id: "adapter_rejected",
      label:
        "Adapter-rejected Trade UI read-only selectedRecommendation preview model fixture",
      modelResult: buildAvanzaTradeUiReadOnlySelectedRecommendationPreview({
        previewConfig: enabledReadOnlyPreviewConfig,
        selectedRecommendationLikeInput:
          adapterRejectedDerivationFixture.selectedRecommendationLikeInput,
      }),
      previewConfig: enabledReadOnlyPreviewConfig,
      selectedRecommendationLikeInput:
        adapterRejectedDerivationFixture.selectedRecommendationLikeInput,
    },
    {
      expectedStatus: "derived_preview_failed",
      id: "derived_preview_failed",
      label:
        "Derived-preview-failed Trade UI read-only selectedRecommendation preview model fixture",
      modelResult: buildAvanzaTradeUiReadOnlySelectedRecommendationPreview({
        previewConfig: enabledReadOnlyPreviewConfig,
        selectedRecommendationLikeInput:
          derivedPreviewFailedDerivationFixture.selectedRecommendationLikeInput,
      }),
      previewConfig: enabledReadOnlyPreviewConfig,
      selectedRecommendationLikeInput:
        derivedPreviewFailedDerivationFixture.selectedRecommendationLikeInput,
    },
    {
      expectedStatus: "read_only_preview_ready",
      id: "read_only_preview_ready",
      label:
        "Read-only preview ready Trade UI selectedRecommendation preview model fixture",
      modelResult: buildAvanzaTradeUiReadOnlySelectedRecommendationPreview({
        previewConfig: enabledReadOnlyPreviewConfig,
        selectedRecommendationLikeInput:
          readOnlyPreviewReadyDerivationFixture.selectedRecommendationLikeInput,
      }),
      previewConfig: enabledReadOnlyPreviewConfig,
      selectedRecommendationLikeInput:
        readOnlyPreviewReadyDerivationFixture.selectedRecommendationLikeInput,
    },
  ];

