import {
  buildAvanzaHardDisabledSourceToPreviewIntegration,
  type AvanzaHardDisabledSourceToPreviewIntegrationResult,
  type AvanzaHardDisabledSourceToPreviewIntegrationStatus,
} from "./avanza-hard-disabled-source-to-preview-integration";
import {
  buildAvanzaSelectedRecommendationSourceExtraction,
  type AvanzaSelectedRecommendationSourceExtractionStatus,
  type AvanzaSelectedRecommendationSourceKind,
} from "./avanza-selected-recommendation-source-extraction";
import type {
  AvanzaTradeUiReadOnlySelectedRecommendationPreviewModel,
} from "./avanza-trade-ui-read-only-selected-recommendation-preview-model";

export type AvanzaTestOnlyEnabledPreviewFixtureStatus =
  | "test_only_disabled"
  | "test_only_fixture_ready"
  | "test_only_preview_ready_read_only"
  | "test_only_blocked";

export type AvanzaTestOnlyEnabledPreviewFixtureModel = {
  canCallBridge: false;
  canExecute: false;
  canFetchLocalhost: false;
  canPoll: false;
  canProceedToHandoff: false;
  canRenderPreview: boolean;
  controlsEnabled: false;
  gateLocked: true;
  integrationStatus: AvanzaHardDisabledSourceToPreviewIntegrationStatus | null;
  label: string;
  modelResult?: AvanzaTradeUiReadOnlySelectedRecommendationPreviewModel;
  reason: string;
  sourceKind: AvanzaSelectedRecommendationSourceKind;
  sourceName: string;
  sourceStatus: AvanzaSelectedRecommendationSourceExtractionStatus | "missing";
  status: AvanzaTestOnlyEnabledPreviewFixtureStatus;
};

export type BuildAvanzaTestOnlyEnabledPreviewFixtureModelInput = {
  fixtureCandidate?: unknown;
  fixtureName?: string | null;
  sourceKind?: AvanzaSelectedRecommendationSourceKind | null;
  testOnlyEnabled?: boolean;
};

function normalizeSourceName(value?: string | null) {
  const trimmed = value?.trim();

  return trimmed || "test_only_enabled_preview_fixture";
}

function normalizeSourceKind(
  value?: AvanzaSelectedRecommendationSourceKind | null,
): AvanzaSelectedRecommendationSourceKind {
  if (typeof value !== "string") {
    return "static_fixture";
  }

  const trimmed = value.trim();

  return trimmed ? trimmed : "static_fixture";
}

function baseModel(
  input: Pick<
    AvanzaTestOnlyEnabledPreviewFixtureModel,
    | "integrationStatus"
    | "label"
    | "modelResult"
    | "reason"
    | "sourceKind"
    | "sourceName"
    | "sourceStatus"
    | "status"
  >,
): AvanzaTestOnlyEnabledPreviewFixtureModel {
  const canRenderPreview =
    input.status === "test_only_preview_ready_read_only" &&
    Boolean(input.modelResult);

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

function mapReadyButNoPreview(
  integrationResult: AvanzaHardDisabledSourceToPreviewIntegrationResult,
): AvanzaTestOnlyEnabledPreviewFixtureStatus {
  if (integrationResult.status === "source_ready_preview_blocked") {
    return "test_only_fixture_ready";
  }

  return "test_only_blocked";
}

function buildSanitizedPreviewInput(
  sourceExtractionResult: ReturnType<
    typeof buildAvanzaSelectedRecommendationSourceExtraction
  >,
) {
  const summary = sourceExtractionResult.selectedRecommendationLikeInput;

  if (!summary) {
    return undefined;
  }

  return {
    ...(summary.action ? { action: summary.action } : {}),
    ...(summary.confidence !== undefined
      ? { confidence: summary.confidence }
      : {}),
    ...(summary.direction ? { direction: summary.direction } : {}),
    ...(summary.entry !== undefined ? { entryPrice: summary.entry } : {}),
    ...(summary.id !== undefined ? { id: String(summary.id) } : {}),
    ...(summary.quantity !== undefined ? { quantity: summary.quantity } : {}),
    ...(summary.shares !== undefined ? { shares: summary.shares } : {}),
    ...(summary.stopLoss !== undefined ? { stopLoss: summary.stopLoss } : {}),
    ...(summary.symbol ? { symbol: summary.symbol } : {}),
    ...(summary.target !== undefined ? { target: summary.target } : {}),
    ticker: summary.ticker,
  };
}

export function buildAvanzaTestOnlyEnabledPreviewFixtureModel({
  fixtureCandidate,
  fixtureName,
  sourceKind,
  testOnlyEnabled = false,
}: BuildAvanzaTestOnlyEnabledPreviewFixtureModelInput = {}): AvanzaTestOnlyEnabledPreviewFixtureModel {
  const resolvedSourceName = normalizeSourceName(fixtureName);
  const resolvedSourceKind = normalizeSourceKind(sourceKind);

  if (!testOnlyEnabled) {
    return baseModel({
      integrationStatus: null,
      label: "Test-only enabled preview fixture disabled",
      reason:
        "The test-only preview fixture path is disabled. It does not extract source input, does not build a model result, and cannot proceed to handoff.",
      sourceKind: resolvedSourceKind,
      sourceName: resolvedSourceName,
      sourceStatus: "missing",
      status: "test_only_disabled",
    });
  }

  const sourceExtractionResult = buildAvanzaSelectedRecommendationSourceExtraction({
    candidate: fixtureCandidate,
    sourceKind: resolvedSourceKind,
    sourceName: resolvedSourceName,
  });

  if (sourceExtractionResult.status !== "source_ready_read_only") {
    return baseModel({
      integrationStatus: null,
      label: "Test-only enabled preview fixture blocked",
      reason:
        sourceExtractionResult.reason ||
        "The explicit static fixture input is missing, invalid, or unavailable for read-only preview.",
      sourceKind: resolvedSourceKind,
      sourceName: resolvedSourceName,
      sourceStatus: sourceExtractionResult.status,
      status: "test_only_blocked",
    });
  }

  const integrationResult = buildAvanzaHardDisabledSourceToPreviewIntegration({
    integrationEnabled: true,
    selectedRecommendationCandidate:
      buildSanitizedPreviewInput(sourceExtractionResult),
    sourceExtractionResult,
    sourceKind: resolvedSourceKind,
    sourceName: resolvedSourceName,
  });

  if (integrationResult.status === "preview_model_ready_read_only") {
    return baseModel({
      integrationStatus: integrationResult.status,
      label: "Test-only read-only preview fixture ready",
      modelResult: integrationResult.modelResult,
      reason:
        "Static sanitized fixture input produced a passive read-only model result in test-only context. Controls stay disabled and the gate stays locked.",
      sourceKind: resolvedSourceKind,
      sourceName: resolvedSourceName,
      sourceStatus: sourceExtractionResult.status,
      status: "test_only_preview_ready_read_only",
    });
  }

  return baseModel({
    integrationStatus: integrationResult.status,
    label:
      integrationResult.status === "source_ready_preview_blocked"
        ? "Test-only fixture ready but preview blocked"
        : "Test-only enabled preview fixture blocked",
    reason:
      integrationResult.reason ||
      "The explicit static fixture input was extracted, but no read-only preview model result was produced.",
    sourceKind: resolvedSourceKind,
    sourceName: resolvedSourceName,
    sourceStatus: sourceExtractionResult.status,
    status: mapReadyButNoPreview(integrationResult),
  });
}

export const avanzaTestOnlyEnabledPreviewFixtureDefaultModel =
  buildAvanzaTestOnlyEnabledPreviewFixtureModel();
