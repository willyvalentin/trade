import {
  buildAvanzaHardDisabledSourceToPreviewIntegration,
  type AvanzaHardDisabledSourceToPreviewIntegrationResult,
  type AvanzaHardDisabledSourceToPreviewIntegrationStatus,
} from "./avanza-hard-disabled-source-to-preview-integration";
import {
  buildAvanzaSelectedRecommendationSourceExtraction,
  type AvanzaSelectedRecommendationNormalizedSourceSummary,
  type AvanzaSelectedRecommendationSourceExtractionResult,
  type AvanzaSelectedRecommendationSourceExtractionStatus,
  type AvanzaSelectedRecommendationSourceKind,
} from "./avanza-selected-recommendation-source-extraction";
import type {
  AvanzaTradeUiReadOnlySelectedRecommendationPreviewModel,
} from "./avanza-trade-ui-read-only-selected-recommendation-preview-model";

export type AvanzaRealSelectedRecommendationReadOnlyConnectionStatus =
  | "connection_disabled"
  | "selected_recommendation_unavailable"
  | "selected_recommendation_invalid"
  | "selected_recommendation_ready_read_only"
  | "preview_ready_read_only_blocked"
  | "preview_ready_read_only";

export type AvanzaRealSelectedRecommendationReadOnlyConnectionIntegrationStatus =
  | AvanzaHardDisabledSourceToPreviewIntegrationStatus
  | "not_requested";

export type AvanzaRealSelectedRecommendationReadOnlyConnectionSourceStatus =
  | AvanzaSelectedRecommendationSourceExtractionStatus
  | "not_requested";

export type AvanzaRealSelectedRecommendationReadOnlyConnectionSummary =
  AvanzaSelectedRecommendationNormalizedSourceSummary & {
    rationale?: string;
  };

export type AvanzaRealSelectedRecommendationReadOnlyConnectionResult = {
  canCallBridge: false;
  canExecute: false;
  canFetchLocalhost: false;
  canPoll: false;
  canProceedToHandoff: false;
  canRenderPreview: boolean;
  controlsEnabled: false;
  gateLocked: true;
  integrationStatus: AvanzaRealSelectedRecommendationReadOnlyConnectionIntegrationStatus;
  label: string;
  modelResult?: AvanzaTradeUiReadOnlySelectedRecommendationPreviewModel;
  normalizedSelectedRecommendationSummary?: AvanzaRealSelectedRecommendationReadOnlyConnectionSummary;
  reason: string;
  selectedRecommendationSourceStatus: AvanzaRealSelectedRecommendationReadOnlyConnectionSourceStatus;
  sourceKind: AvanzaSelectedRecommendationSourceKind;
  sourceName: string;
  status: AvanzaRealSelectedRecommendationReadOnlyConnectionStatus;
};

export type BuildAvanzaRealSelectedRecommendationReadOnlyConnectionInput = {
  allowPreviewModel?: boolean;
  connectionEnabled?: boolean;
  selectedRecommendationCandidate?: unknown;
  sourceExtractionBuilder?: typeof buildAvanzaSelectedRecommendationSourceExtraction;
  sourceKind?: AvanzaSelectedRecommendationSourceKind | null;
  sourceName?: string | null;
  sourceToPreviewIntegrationBuilder?: typeof buildAvanzaHardDisabledSourceToPreviewIntegration;
};

function normalizeSourceName(value?: string | null) {
  const trimmed = value?.trim();

  return trimmed || "real_selected_recommendation_read_only_connection";
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
    AvanzaRealSelectedRecommendationReadOnlyConnectionResult,
    | "integrationStatus"
    | "label"
    | "modelResult"
    | "normalizedSelectedRecommendationSummary"
    | "reason"
    | "selectedRecommendationSourceStatus"
    | "sourceKind"
    | "sourceName"
    | "status"
  >,
): AvanzaRealSelectedRecommendationReadOnlyConnectionResult {
  const canRenderPreview = input.status === "preview_ready_read_only";

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readSafeRationale(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;
}

function buildSafeSummary(
  extractionResult: AvanzaSelectedRecommendationSourceExtractionResult,
  candidate: unknown,
): AvanzaRealSelectedRecommendationReadOnlyConnectionSummary | undefined {
  if (!extractionResult.normalizedSourceSummary) {
    return undefined;
  }

  const rationale = isRecord(candidate)
    ? readSafeRationale(candidate.rationale)
    : undefined;

  return {
    ...extractionResult.normalizedSourceSummary,
    ...(rationale ? { rationale } : {}),
  };
}

function buildSafePreviewInput(
  summary: AvanzaRealSelectedRecommendationReadOnlyConnectionSummary,
) {
  return {
    action: summary.action,
    confidence: summary.confidence,
    direction: summary.direction ?? summary.action,
    entryPrice: summary.entry,
    id: summary.id,
    limitPrice: summary.entry,
    quantity: summary.quantity ?? summary.shares,
    rationale: summary.rationale,
    shares: summary.shares ?? summary.quantity,
    stopLoss: summary.stopLoss,
    symbol: summary.symbol ?? summary.ticker,
    target: summary.target,
    ticker: summary.ticker ?? summary.symbol,
  };
}

function mapSourceStatusToConnectionStatus(
  status: AvanzaSelectedRecommendationSourceExtractionStatus,
): AvanzaRealSelectedRecommendationReadOnlyConnectionStatus {
  if (status === "source_invalid") {
    return "selected_recommendation_invalid";
  }

  return "selected_recommendation_unavailable";
}

function mapPreviewBlockedReason(
  integrationResult: AvanzaHardDisabledSourceToPreviewIntegrationResult,
) {
  return (
    integrationResult.reason ||
    "The explicit selectedRecommendation source is ready, but the read-only preview model is blocked. No preview output is rendered."
  );
}

export function buildAvanzaRealSelectedRecommendationReadOnlyConnection({
  allowPreviewModel = false,
  connectionEnabled = false,
  selectedRecommendationCandidate,
  sourceExtractionBuilder = buildAvanzaSelectedRecommendationSourceExtraction,
  sourceKind,
  sourceName,
  sourceToPreviewIntegrationBuilder = buildAvanzaHardDisabledSourceToPreviewIntegration,
}: BuildAvanzaRealSelectedRecommendationReadOnlyConnectionInput = {}): AvanzaRealSelectedRecommendationReadOnlyConnectionResult {
  const resolvedSourceName = normalizeSourceName(sourceName);
  const resolvedSourceKind = normalizeSourceKind(sourceKind);

  if (!connectionEnabled) {
    return baseResult({
      integrationStatus: "not_requested",
      label: "Real selectedRecommendation read-only connection disabled",
      reason:
        "The real selectedRecommendation read-only connection is disabled by explicit input. It does not read app state, route state, storage, bridge, localhost, or network sources.",
      selectedRecommendationSourceStatus: "not_requested",
      sourceKind: resolvedSourceKind,
      sourceName: resolvedSourceName,
      status: "connection_disabled",
    });
  }

  if (selectedRecommendationCandidate == null) {
    return baseResult({
      integrationStatus: "not_requested",
      label: "Real selectedRecommendation unavailable",
      reason:
        "No explicit selectedRecommendation-like candidate was provided. The connection remains read-only and unavailable.",
      selectedRecommendationSourceStatus: "source_unavailable",
      sourceKind: resolvedSourceKind,
      sourceName: resolvedSourceName,
      status: "selected_recommendation_unavailable",
    });
  }

  const sourceExtractionResult = sourceExtractionBuilder({
    candidate: selectedRecommendationCandidate,
    sourceKind: resolvedSourceKind,
    sourceName: resolvedSourceName,
  });
  const normalizedSelectedRecommendationSummary = buildSafeSummary(
    sourceExtractionResult,
    selectedRecommendationCandidate,
  );

  if (sourceExtractionResult.status !== "source_ready_read_only") {
    const status = mapSourceStatusToConnectionStatus(
      sourceExtractionResult.status,
    );

    return baseResult({
      integrationStatus: "not_requested",
      label:
        status === "selected_recommendation_invalid"
          ? "Real selectedRecommendation invalid"
          : "Real selectedRecommendation unavailable",
      reason: sourceExtractionResult.reason,
      selectedRecommendationSourceStatus: sourceExtractionResult.status,
      sourceKind: resolvedSourceKind,
      sourceName: resolvedSourceName,
      status,
    });
  }

  if (!allowPreviewModel) {
    return baseResult({
      integrationStatus: "not_requested",
      label: "Real selectedRecommendation ready for read-only connection",
      normalizedSelectedRecommendationSummary,
      reason:
        "The explicit selectedRecommendation-like candidate was normalized to preview-safe read-only fields, but preview model output is not explicitly allowed.",
      selectedRecommendationSourceStatus: sourceExtractionResult.status,
      sourceKind: resolvedSourceKind,
      sourceName: resolvedSourceName,
      status: "selected_recommendation_ready_read_only",
    });
  }

  const integrationResult = sourceToPreviewIntegrationBuilder({
    integrationEnabled: true,
    selectedRecommendationCandidate: normalizedSelectedRecommendationSummary
      ? buildSafePreviewInput(normalizedSelectedRecommendationSummary)
      : undefined,
    sourceExtractionResult,
    sourceKind: resolvedSourceKind,
    sourceName: resolvedSourceName,
  });

  if (integrationResult.status !== "preview_model_ready_read_only") {
    return baseResult({
      integrationStatus: integrationResult.status,
      label: "Real selectedRecommendation read-only preview blocked",
      normalizedSelectedRecommendationSummary,
      reason: mapPreviewBlockedReason(integrationResult),
      selectedRecommendationSourceStatus: sourceExtractionResult.status,
      sourceKind: resolvedSourceKind,
      sourceName: resolvedSourceName,
      status: "preview_ready_read_only_blocked",
    });
  }

  return baseResult({
    integrationStatus: integrationResult.status,
    label: "Real selectedRecommendation read-only preview ready",
    modelResult: integrationResult.modelResult,
    normalizedSelectedRecommendationSummary,
    reason:
      "The explicit selectedRecommendation-like candidate produced a passive read-only preview model. Controls remain disabled, handoff remains forbidden, and the gate remains locked.",
    selectedRecommendationSourceStatus: sourceExtractionResult.status,
    sourceKind: resolvedSourceKind,
    sourceName: resolvedSourceName,
    status: "preview_ready_read_only",
  });
}

export const avanzaRealSelectedRecommendationReadOnlyConnectionDefaultResult =
  buildAvanzaRealSelectedRecommendationReadOnlyConnection();
