export type AvanzaHandoffPreviewSourceMode =
  | "static_fixture"
  | "selected_recommendation_disabled"
  | "selected_recommendation_preview_only"
  | "selected_recommendation_future";

export type AvanzaHandoffPreviewSourceModeStatus =
  | "active"
  | "disabled"
  | "future";

export type AvanzaHandoffPreviewSourceModeModel = {
  activeMode: AvanzaHandoffPreviewSourceMode;
  bridgeCallsAllowed: false;
  executionAllowed: false;
  label: string;
  realSelectedRecommendationStateAllowed: false;
  reason: string;
  selectedRecommendationWiring: "disabled" | "future";
  status: AvanzaHandoffPreviewSourceModeStatus;
  tradeUiLocalhostFetchAllowed: false;
};

export const avanzaHandoffPreviewSourceModes: Record<
  AvanzaHandoffPreviewSourceMode,
  AvanzaHandoffPreviewSourceModeModel
> = {
  selected_recommendation_disabled: {
    activeMode: "selected_recommendation_disabled",
    bridgeCallsAllowed: false,
    executionAllowed: false,
    label: "Selected recommendation disabled",
    realSelectedRecommendationStateAllowed: false,
    reason:
      "Selected recommendation wiring is disabled. The Trade UI must not read real recommendation state for this preview.",
    selectedRecommendationWiring: "disabled",
    status: "disabled",
    tradeUiLocalhostFetchAllowed: false,
  },
  selected_recommendation_preview_only: {
    activeMode: "selected_recommendation_preview_only",
    bridgeCallsAllowed: false,
    executionAllowed: false,
    label: "Selected recommendation preview-only",
    realSelectedRecommendationStateAllowed: false,
    reason:
      "Selected recommendation preview-only wiring is planned but disabled. It cannot read real recommendation state, call the bridge, fetch local URLs, or enable execution.",
    selectedRecommendationWiring: "future",
    status: "future",
    tradeUiLocalhostFetchAllowed: false,
  },
  selected_recommendation_future: {
    activeMode: "selected_recommendation_future",
    bridgeCallsAllowed: false,
    executionAllowed: false,
    label: "Selected recommendation future",
    realSelectedRecommendationStateAllowed: false,
    reason:
      "Selected recommendation wiring is a future planning mode only. It cannot call the bridge or enable execution.",
    selectedRecommendationWiring: "future",
    status: "future",
    tradeUiLocalhostFetchAllowed: false,
  },
  static_fixture: {
    activeMode: "static_fixture",
    bridgeCallsAllowed: false,
    executionAllowed: false,
    label: "Source: static fixture",
    realSelectedRecommendationStateAllowed: false,
    reason:
      "The preview uses static fixture data only. No real recommendation state is read.",
    selectedRecommendationWiring: "disabled",
    status: "active",
    tradeUiLocalhostFetchAllowed: false,
  },
};

export const avanzaHandoffPreviewActiveSourceMode =
  avanzaHandoffPreviewSourceModes.static_fixture;
