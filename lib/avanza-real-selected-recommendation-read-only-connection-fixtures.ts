import type {
  AvanzaHardDisabledSourceToPreviewIntegrationResult,
  BuildAvanzaHardDisabledSourceToPreviewIntegrationInput,
} from "./avanza-hard-disabled-source-to-preview-integration";
import {
  buildAvanzaRealSelectedRecommendationReadOnlyConnection,
  type AvanzaRealSelectedRecommendationReadOnlyConnectionResult,
  type AvanzaRealSelectedRecommendationReadOnlyConnectionStatus,
  type BuildAvanzaRealSelectedRecommendationReadOnlyConnectionInput,
} from "./avanza-real-selected-recommendation-read-only-connection";

export type AvanzaRealSelectedRecommendationReadOnlyConnectionFixtureId =
  | "connection_disabled"
  | "selected_recommendation_unavailable"
  | "selected_recommendation_invalid"
  | "selected_recommendation_ready_read_only"
  | "preview_ready_read_only_blocked"
  | "preview_ready_read_only";

export type AvanzaRealSelectedRecommendationReadOnlyConnectionFixture = {
  connectionInput: BuildAvanzaRealSelectedRecommendationReadOnlyConnectionInput;
  connectionResult: AvanzaRealSelectedRecommendationReadOnlyConnectionResult;
  expectedStatus: AvanzaRealSelectedRecommendationReadOnlyConnectionStatus;
  id: AvanzaRealSelectedRecommendationReadOnlyConnectionFixtureId;
  label: string;
  selectedRecommendationCandidate?: unknown;
};

const safeCandidate = {
  action: "buy",
  direction: "buy",
  entry: 240.5,
  id: "real-connection-fixture-1",
  quantity: 12,
  rationale: "Fixture rationale already present and non-sensitive",
  stopLoss: 230,
  symbol: "VOLV B",
  target: 260,
};

const invalidCandidate = {
  companyName: "Missing ticker fixture",
  direction: "buy",
};

const blockedIntegrationBuilder = ({
  sourceExtractionResult,
  sourceKind,
  sourceName,
}: BuildAvanzaHardDisabledSourceToPreviewIntegrationInput = {}): AvanzaHardDisabledSourceToPreviewIntegrationResult => ({
  canCallBridge: false,
  canExecute: false,
  canFetchLocalhost: false,
  canPoll: false,
  canProceedToHandoff: false,
  canRenderPreview: false,
  controlsEnabled: false,
  gateLocked: true,
  label: "Real selectedRecommendation read-only preview blocked fixture",
  previewModelStatus: "disabled",
  reason:
    "The explicit fixture source is ready, but preview output is blocked for this connection fixture.",
  sourceKind: sourceKind ?? "static_fixture",
  sourceName: sourceName ?? "real_connection_blocked_fixture",
  sourceStatus: sourceExtractionResult?.status ?? "missing",
  sourceSummary: sourceExtractionResult?.normalizedSourceSummary,
  status: "source_ready_preview_blocked",
});

function buildFixture(
  id: AvanzaRealSelectedRecommendationReadOnlyConnectionFixtureId,
  label: string,
  expectedStatus: AvanzaRealSelectedRecommendationReadOnlyConnectionStatus,
  connectionInput: BuildAvanzaRealSelectedRecommendationReadOnlyConnectionInput,
): AvanzaRealSelectedRecommendationReadOnlyConnectionFixture {
  return {
    connectionInput,
    connectionResult:
      buildAvanzaRealSelectedRecommendationReadOnlyConnection(connectionInput),
    expectedStatus,
    id,
    label,
    ...(connectionInput.selectedRecommendationCandidate !== undefined
      ? {
          selectedRecommendationCandidate:
            connectionInput.selectedRecommendationCandidate,
        }
      : {}),
  };
}

export const avanzaRealSelectedRecommendationReadOnlyConnectionFixtures: AvanzaRealSelectedRecommendationReadOnlyConnectionFixture[] =
  [
    buildFixture(
      "connection_disabled",
      "Real selectedRecommendation read-only connection disabled",
      "connection_disabled",
      {
        connectionEnabled: false,
        selectedRecommendationCandidate: safeCandidate,
        sourceKind: "static_fixture",
        sourceName: "real_connection_disabled_fixture",
      },
    ),
    buildFixture(
      "selected_recommendation_unavailable",
      "Real selectedRecommendation unavailable",
      "selected_recommendation_unavailable",
      {
        connectionEnabled: true,
        sourceKind: "static_fixture",
        sourceName: "real_connection_unavailable_fixture",
      },
    ),
    buildFixture(
      "selected_recommendation_invalid",
      "Real selectedRecommendation invalid",
      "selected_recommendation_invalid",
      {
        connectionEnabled: true,
        selectedRecommendationCandidate: invalidCandidate,
        sourceKind: "static_fixture",
        sourceName: "real_connection_invalid_fixture",
      },
    ),
    buildFixture(
      "selected_recommendation_ready_read_only",
      "Real selectedRecommendation ready read-only",
      "selected_recommendation_ready_read_only",
      {
        connectionEnabled: true,
        selectedRecommendationCandidate: safeCandidate,
        sourceKind: "static_fixture",
        sourceName: "real_connection_ready_fixture",
      },
    ),
    buildFixture(
      "preview_ready_read_only_blocked",
      "Real selectedRecommendation preview blocked",
      "preview_ready_read_only_blocked",
      {
        allowPreviewModel: true,
        connectionEnabled: true,
        selectedRecommendationCandidate: safeCandidate,
        sourceKind: "static_fixture",
        sourceName: "real_connection_preview_blocked_fixture",
        sourceToPreviewIntegrationBuilder: blockedIntegrationBuilder,
      },
    ),
    buildFixture(
      "preview_ready_read_only",
      "Real selectedRecommendation preview ready read-only",
      "preview_ready_read_only",
      {
        allowPreviewModel: true,
        connectionEnabled: true,
        selectedRecommendationCandidate: safeCandidate,
        sourceKind: "static_fixture",
        sourceName: "real_connection_preview_ready_fixture",
      },
    ),
  ];
