import {
  buildAvanzaRealSelectedRecommendationReadOnlyDerivation,
  type AvanzaRealSelectedRecommendationReadOnlyDerivationResult,
  type AvanzaRealSelectedRecommendationReadOnlyDerivationStatus,
} from "./avanza-real-selected-recommendation-read-only-derivation";
import {
  buildAvanzaRealSelectedRecommendationReadOnlyInputGuard,
  type AvanzaRealSelectedRecommendationReadOnlyInputGuardDecision,
} from "./avanza-real-selected-recommendation-read-only-input-guard";
import type {
  AvanzaSelectedRecommendationPreviewState,
} from "./avanza-selected-recommendation-preview-state";

export type AvanzaTradeUiReadOnlySelectedRecommendationPreviewStatus =
  | "hidden"
  | "disabled"
  | "no_selected_recommendation"
  | "guard_blocked"
  | "invalid_input"
  | "adapter_rejected"
  | "derived_preview_failed"
  | "read_only_preview_ready";

export type AvanzaTradeUiReadOnlySelectedRecommendationPreviewSourceMode =
  | "trade_ui_read_only_hidden"
  | "trade_ui_read_only_disabled"
  | "trade_ui_read_only_selected_recommendation";

export type AvanzaTradeUiReadOnlySelectedRecommendationPreviewConfig = {
  disabledReason?: string | null;
  environment?: "default" | "dev_read_only" | "production_forbidden";
  explicitPreviewEnabled?: boolean;
  inputGuardDecision?: AvanzaRealSelectedRecommendationReadOnlyInputGuardDecision;
  sourceLabel?: string | null;
};

export type AvanzaTradeUiReadOnlySelectedRecommendationPreviewModel = {
  canCallBridge: false;
  canExecute: false;
  canFetchLocalhost: false;
  canPoll: false;
  canProceedToHandoff: false;
  canRenderReadOnlyPreview: boolean;
  controlsEnabled: false;
  gateLocked: true;
  label: string;
  previewState?: AvanzaSelectedRecommendationPreviewState;
  reason: string;
  renderingBoundary: {
    brokerExecutionWordingAllowed: false;
    credentialsAccountSessionDataAllowed: false;
    handoffButtonAllowed: false;
    orderSubmissionCopyAllowed: false;
    prepareButtonAllowed: false;
    productionReadyCopyAllowed: false;
  };
  sourceLabel: string;
  sourceMode: AvanzaTradeUiReadOnlySelectedRecommendationPreviewSourceMode;
  status: AvanzaTradeUiReadOnlySelectedRecommendationPreviewStatus;
};

export type BuildAvanzaTradeUiReadOnlySelectedRecommendationPreviewInput = {
  deriveReadOnlyPreview?: (
    input: Parameters<
      typeof buildAvanzaRealSelectedRecommendationReadOnlyDerivation
    >[0],
  ) => AvanzaRealSelectedRecommendationReadOnlyDerivationResult;
  previewConfig?: AvanzaTradeUiReadOnlySelectedRecommendationPreviewConfig;
  selectedRecommendationLikeInput?: unknown;
  sourceLabel?: string | null;
};

function baseModel(
  input: Pick<
    AvanzaTradeUiReadOnlySelectedRecommendationPreviewModel,
    | "canRenderReadOnlyPreview"
    | "label"
    | "previewState"
    | "reason"
    | "sourceLabel"
    | "sourceMode"
    | "status"
  >,
): AvanzaTradeUiReadOnlySelectedRecommendationPreviewModel {
  return {
    ...input,
    canCallBridge: false,
    canExecute: false,
    canFetchLocalhost: false,
    canPoll: false,
    canProceedToHandoff: false,
    controlsEnabled: false,
    gateLocked: true,
    renderingBoundary: {
      brokerExecutionWordingAllowed: false,
      credentialsAccountSessionDataAllowed: false,
      handoffButtonAllowed: false,
      orderSubmissionCopyAllowed: false,
      prepareButtonAllowed: false,
      productionReadyCopyAllowed: false,
    },
  };
}

function hasExplicitPreviewConfig(
  previewConfig?: AvanzaTradeUiReadOnlySelectedRecommendationPreviewConfig,
): previewConfig is AvanzaTradeUiReadOnlySelectedRecommendationPreviewConfig {
  return Boolean(previewConfig);
}

function isExplicitPreviewEnabled(
  previewConfig?: AvanzaTradeUiReadOnlySelectedRecommendationPreviewConfig,
) {
  return (
    previewConfig?.explicitPreviewEnabled === true &&
    previewConfig.environment === "dev_read_only"
  );
}

function mapDerivationStatus(
  status: AvanzaRealSelectedRecommendationReadOnlyDerivationStatus,
): AvanzaTradeUiReadOnlySelectedRecommendationPreviewStatus {
  if (status === "no_input") {
    return "no_selected_recommendation";
  }

  return status;
}

export function buildAvanzaTradeUiReadOnlySelectedRecommendationPreview({
  deriveReadOnlyPreview = buildAvanzaRealSelectedRecommendationReadOnlyDerivation,
  previewConfig,
  selectedRecommendationLikeInput,
  sourceLabel,
}: BuildAvanzaTradeUiReadOnlySelectedRecommendationPreviewInput = {}): AvanzaTradeUiReadOnlySelectedRecommendationPreviewModel {
  const resolvedSourceLabel =
    sourceLabel?.trim() ||
    previewConfig?.sourceLabel?.trim() ||
    "trade_ui_read_only_selected_recommendation_preview";

  if (!hasExplicitPreviewConfig(previewConfig)) {
    return baseModel({
      canRenderReadOnlyPreview: false,
      label: "Trade UI read-only selectedRecommendation preview hidden",
      reason:
        "No explicit read-only preview configuration was provided. Trade UI selectedRecommendation preview remains hidden, controls stay disabled, and the gate stays locked.",
      sourceLabel: resolvedSourceLabel,
      sourceMode: "trade_ui_read_only_hidden",
      status: "hidden",
    });
  }

  const explicitPreviewConfig = previewConfig;

  if (!isExplicitPreviewEnabled(explicitPreviewConfig)) {
    return baseModel({
      canRenderReadOnlyPreview: false,
      label: "Trade UI read-only selectedRecommendation preview disabled",
      reason:
        explicitPreviewConfig.disabledReason?.trim() ||
        "Explicit read-only preview configuration is disabled or not dev/read-only. Trade UI selectedRecommendation preview remains disabled by default.",
      sourceLabel: resolvedSourceLabel,
      sourceMode: "trade_ui_read_only_disabled",
      status: "disabled",
    });
  }

  if (selectedRecommendationLikeInput == null) {
    return baseModel({
      canRenderReadOnlyPreview: false,
      label: "No selectedRecommendation for read-only preview",
      reason:
        "Explicit read-only preview configuration is enabled, but no selectedRecommendation-like input was provided. No preview state is rendered.",
      sourceLabel: resolvedSourceLabel,
      sourceMode: "trade_ui_read_only_selected_recommendation",
      status: "no_selected_recommendation",
    });
  }

  const guardDecision =
    explicitPreviewConfig.inputGuardDecision ??
    buildAvanzaRealSelectedRecommendationReadOnlyInputGuard({
      environment: "dev_read_only",
      explicitReadOnlyInput: true,
      sourceLabel: resolvedSourceLabel,
    });
  const derivationResult = deriveReadOnlyPreview({
    guardDecision,
    selectedRecommendationLikeInput,
    sourceLabel: resolvedSourceLabel,
  });
  const status = mapDerivationStatus(derivationResult.status);
  const canRenderReadOnlyPreview = status === "read_only_preview_ready";

  return baseModel({
    canRenderReadOnlyPreview,
    label: derivationResult.label,
    ...(canRenderReadOnlyPreview && derivationResult.previewState
      ? { previewState: derivationResult.previewState }
      : {}),
    reason:
      status === "read_only_preview_ready"
        ? "Read-only selectedRecommendation preview is ready for passive model output only. No active controls, handoff, bridge calls, polling, execution, or order behavior are allowed."
        : derivationResult.reason,
    sourceLabel: resolvedSourceLabel,
    sourceMode: "trade_ui_read_only_selected_recommendation",
    status,
  });
}

export const avanzaTradeUiReadOnlySelectedRecommendationPreviewDefaultModel =
  buildAvanzaTradeUiReadOnlySelectedRecommendationPreview();
