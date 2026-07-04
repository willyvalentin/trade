import type {
  AvanzaSelectedRecommendationNormalizedSourceSummary,
  AvanzaSelectedRecommendationSourceExtractionResult,
  AvanzaSelectedRecommendationSourceExtractionStatus,
  AvanzaSelectedRecommendationSourceKind,
} from "./avanza-selected-recommendation-source-extraction";
import {
  buildAvanzaTradeUiReadOnlySelectedRecommendationPreview,
  type AvanzaTradeUiReadOnlySelectedRecommendationPreviewModel,
  type AvanzaTradeUiReadOnlySelectedRecommendationPreviewStatus,
} from "./avanza-trade-ui-read-only-selected-recommendation-preview-model";

export type AvanzaHardDisabledSourceToPreviewIntegrationStatus =
  | "integration_disabled"
  | "source_not_ready"
  | "source_ready_preview_blocked"
  | "preview_model_ready_read_only"
  | "integration_blocked";

export type AvanzaHardDisabledSourceToPreviewIntegrationResult = {
  canCallBridge: false;
  canExecute: false;
  canFetchLocalhost: false;
  canPoll: false;
  canProceedToHandoff: false;
  canRenderPreview: boolean;
  controlsEnabled: false;
  gateLocked: true;
  label: string;
  modelResult?: AvanzaTradeUiReadOnlySelectedRecommendationPreviewModel;
  previewModelStatus: AvanzaTradeUiReadOnlySelectedRecommendationPreviewStatus | null;
  reason: string;
  sourceKind: AvanzaSelectedRecommendationSourceKind;
  sourceName: string;
  sourceStatus: AvanzaSelectedRecommendationSourceExtractionStatus | "missing";
  sourceSummary?: AvanzaSelectedRecommendationNormalizedSourceSummary;
  status: AvanzaHardDisabledSourceToPreviewIntegrationStatus;
};

export type BuildAvanzaHardDisabledSourceToPreviewIntegrationInput = {
  integrationEnabled?: boolean;
  previewModelBuilder?: typeof buildAvanzaTradeUiReadOnlySelectedRecommendationPreview;
  selectedRecommendationCandidate?: unknown;
  sourceExtractionResult?: AvanzaSelectedRecommendationSourceExtractionResult | null;
  sourceKind?: AvanzaSelectedRecommendationSourceKind | null;
  sourceName?: string | null;
};

function normalizeSourceName(value?: string | null) {
  const trimmed = value?.trim();

  return trimmed || "selectedRecommendation source-to-preview integration";
}

function normalizeSourceKind(
  value?: AvanzaSelectedRecommendationSourceKind | null,
): AvanzaSelectedRecommendationSourceKind {
  if (typeof value !== "string") {
    return "unspecified";
  }

  const trimmed = value.trim();

  return trimmed ? trimmed : "unspecified";
}

function baseResult(
  input: Pick<
    AvanzaHardDisabledSourceToPreviewIntegrationResult,
    | "label"
    | "modelResult"
    | "previewModelStatus"
    | "reason"
    | "sourceKind"
    | "sourceName"
    | "sourceStatus"
    | "sourceSummary"
    | "status"
  >,
): AvanzaHardDisabledSourceToPreviewIntegrationResult {
  const canRenderPreview = input.status === "preview_model_ready_read_only";

  return {
    ...input,
    ...(canRenderPreview && input.modelResult
      ? { modelResult: input.modelResult }
      : {}),
    canCallBridge: false,
    canExecute: false,
    canFetchLocalhost: false,
    canPoll: false,
    canProceedToHandoff: false,
    canRenderPreview,
    controlsEnabled: false,
    gateLocked: true,
  };
}

function resolvePreviewInput(
  sourceExtractionResult: AvanzaSelectedRecommendationSourceExtractionResult,
  selectedRecommendationCandidate: unknown,
) {
  return (
    selectedRecommendationCandidate ??
    sourceExtractionResult.selectedRecommendationLikeInput ??
    sourceExtractionResult.normalizedSourceSummary
  );
}

function mapBlockedPreviewStatus(
  previewModelStatus: AvanzaTradeUiReadOnlySelectedRecommendationPreviewStatus,
): AvanzaHardDisabledSourceToPreviewIntegrationStatus {
  if (
    previewModelStatus === "hidden" ||
    previewModelStatus === "disabled" ||
    previewModelStatus === "guard_blocked"
  ) {
    return "integration_blocked";
  }

  return "source_ready_preview_blocked";
}

export function buildAvanzaHardDisabledSourceToPreviewIntegration({
  integrationEnabled = false,
  previewModelBuilder = buildAvanzaTradeUiReadOnlySelectedRecommendationPreview,
  selectedRecommendationCandidate,
  sourceExtractionResult,
  sourceKind,
  sourceName,
}: BuildAvanzaHardDisabledSourceToPreviewIntegrationInput = {}): AvanzaHardDisabledSourceToPreviewIntegrationResult {
  const resolvedSourceName = normalizeSourceName(
    sourceName ?? sourceExtractionResult?.sourceName,
  );
  const resolvedSourceKind = normalizeSourceKind(
    sourceKind ?? sourceExtractionResult?.sourceKind,
  );

  if (!integrationEnabled) {
    return baseResult({
      label: "Hard-disabled source-to-preview integration disabled",
      previewModelStatus: null,
      reason:
        "The source-to-preview integration is disabled by explicit model input. It does not build preview output, does not render preview, and cannot proceed to handoff.",
      sourceKind: resolvedSourceKind,
      sourceName: resolvedSourceName,
      sourceStatus: sourceExtractionResult?.status ?? "missing",
      status: "integration_disabled",
    });
  }

  if (!sourceExtractionResult) {
    return baseResult({
      label: "Source-to-preview integration source not ready",
      previewModelStatus: null,
      reason:
        "No explicit source extraction result was provided. The integration cannot build a preview model result.",
      sourceKind: resolvedSourceKind,
      sourceName: resolvedSourceName,
      sourceStatus: "missing",
      status: "source_not_ready",
    });
  }

  if (sourceExtractionResult.status === "source_blocked") {
    return baseResult({
      label: "Source-to-preview integration blocked",
      previewModelStatus: null,
      reason:
        sourceExtractionResult.reason ||
        "The explicit source extraction result is blocked before preview model construction.",
      sourceKind: resolvedSourceKind,
      sourceName: resolvedSourceName,
      sourceStatus: sourceExtractionResult.status,
      status: "integration_blocked",
    });
  }

  if (
    sourceExtractionResult.status !== "source_ready_read_only" ||
    !sourceExtractionResult.canProceedToPreviewModel
  ) {
    return baseResult({
      label: "Source-to-preview integration source not ready",
      previewModelStatus: null,
      reason:
        "The explicit source extraction result is not ready for a read-only preview model. No model result is produced.",
      sourceKind: resolvedSourceKind,
      sourceName: resolvedSourceName,
      sourceStatus: sourceExtractionResult.status,
      status: "source_not_ready",
    });
  }

  const previewInput = resolvePreviewInput(
    sourceExtractionResult,
    selectedRecommendationCandidate,
  );

  if (!previewInput) {
    return baseResult({
      label: "Source ready but preview input blocked",
      previewModelStatus: null,
      reason:
        "The source is marked ready, but no sanitized selectedRecommendation-like preview input was provided.",
      sourceKind: resolvedSourceKind,
      sourceName: resolvedSourceName,
      sourceStatus: sourceExtractionResult.status,
      sourceSummary: sourceExtractionResult.normalizedSourceSummary,
      status: "source_ready_preview_blocked",
    });
  }

  const modelResult = previewModelBuilder({
    previewConfig: {
      environment: "dev_read_only",
      explicitPreviewEnabled: true,
      sourceLabel: resolvedSourceName,
    },
    selectedRecommendationLikeInput: previewInput,
    sourceLabel: resolvedSourceName,
  });

  if (modelResult.status !== "read_only_preview_ready") {
    return baseResult({
      label: "Source ready but preview model blocked",
      previewModelStatus: modelResult.status,
      reason:
        modelResult.reason ||
        "The preview model did not produce a read-only ready result.",
      sourceKind: resolvedSourceKind,
      sourceName: resolvedSourceName,
      sourceStatus: sourceExtractionResult.status,
      sourceSummary: sourceExtractionResult.normalizedSourceSummary,
      status: mapBlockedPreviewStatus(modelResult.status),
    });
  }

  return baseResult({
    label: "Read-only source-to-preview model ready",
    modelResult,
    previewModelStatus: modelResult.status,
    reason:
      "The explicit source extraction result produced a passive read-only preview model result. Rendering remains model-only, controls stay disabled, and the gate stays locked.",
    sourceKind: resolvedSourceKind,
    sourceName: resolvedSourceName,
    sourceStatus: sourceExtractionResult.status,
    sourceSummary: sourceExtractionResult.normalizedSourceSummary,
    status: "preview_model_ready_read_only",
  });
}
