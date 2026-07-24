import type {
  AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationDecision,
  AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationSourceMode,
} from "./avanza-read-only-selected-recommendation-adapter-derived-preview-integration-decision";
import {
  adaptSelectedRecommendationToAvanzaHandoffSource,
  type AvanzaSelectedRecommendationAdapterInput,
} from "./avanza-selected-recommendation-adapter";
import {
  avanzaHandoffPreviewSourceModes,
} from "./avanza-handoff-preview-source-mode";
import {
  avanzaTradeReadOnlyReadinessSummaryFixture,
} from "./avanza-read-only-readiness-fixtures";
import {
  buildAvanzaSelectedRecommendationPreviewState,
  type AvanzaSelectedRecommendationPreviewState,
} from "./avanza-selected-recommendation-preview-state";
import type {
  TureRecommendationHandoffSource,
} from "./avanza-ture-recommendation-handoff-mapper";

export type AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapperStatus =
  | "no_input"
  | "blocked"
  | "invalid_input"
  | "adapter_rejected"
  | "adapter_normalized_static_fixture"
  | "derived_preview_failed"
  | "read_only_preview_ready";

export type AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapperSourceMode =
  | "fixture_only"
  | "read_only_selected_recommendation_dev_preview"
  | "blocked";

export type AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapperNormalizedInputSummary =
  {
    company?: string;
    direction?: string;
    entry?: number | string;
    hasQuantity: boolean;
    hasTicker: boolean;
    hasTradeSide: boolean;
    quantity?: number | string;
    ticker?: string;
  };

export type AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapperState =
  {
    canCallBridge: false;
    canExecute: false;
    canFetchLocalhost: false;
    canPoll: false;
    canRenderReadOnlyPreview: boolean;
    controlsEnabled: false;
    gateLocked: true;
    label: string;
    normalizedInputSummary?: AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapperNormalizedInputSummary;
    previewState: AvanzaSelectedRecommendationPreviewState | null;
    reason: string;
    sourceMode: AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapperSourceMode;
    status: AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapperStatus;
  };

export type BuildAvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapperInput =
  {
    integrationDecision: AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationDecision;
    derivePreviewState?: boolean;
    selectedRecommendation: unknown;
    simulateDerivedPreviewFailure?: boolean;
    sourceLabel?: AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationSourceMode | null;
  };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readNonEmptyString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;
}

function hasNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function hasStringOrNumber(value: unknown) {
  return (
    hasNumber(value) ||
    (typeof value === "string" && value.trim().length > 0)
  );
}

function firstSummaryValue(values: unknown[]): number | string | undefined {
  for (const value of values) {
    if (hasNumber(value)) {
      return value;
    }

    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return undefined;
}

function buildBaseState(
  input: Pick<
    AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapperState,
    | "canRenderReadOnlyPreview"
    | "label"
    | "normalizedInputSummary"
    | "reason"
    | "sourceMode"
    | "status"
  >,
): AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapperState {
  return {
    ...input,
    canCallBridge: false,
    canExecute: false,
    canFetchLocalhost: false,
    canPoll: false,
    controlsEnabled: false,
    gateLocked: true,
    previewState: null,
  };
}

function buildSafeSummary(
  selectedRecommendation: unknown,
): AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapperNormalizedInputSummary | null {
  if (!isRecord(selectedRecommendation)) {
    return null;
  }

  const ticker =
    readNonEmptyString(selectedRecommendation.ticker) ??
    readNonEmptyString(selectedRecommendation.symbol);
  const company =
    readNonEmptyString(selectedRecommendation.company) ??
    readNonEmptyString(selectedRecommendation.name);
  const direction =
    readNonEmptyString(selectedRecommendation.side) ??
    readNonEmptyString(selectedRecommendation.direction) ??
    readNonEmptyString(selectedRecommendation.action);
  const entry = firstSummaryValue([
    selectedRecommendation.entryPrice,
    selectedRecommendation.entryPriceValue,
    selectedRecommendation.limitPrice,
    selectedRecommendation.entryLowValue,
    selectedRecommendation.entryHighValue,
    selectedRecommendation.entry_low,
    selectedRecommendation.entry_high,
  ]);
  const quantity = firstSummaryValue([
    selectedRecommendation.quantity,
    selectedRecommendation.shares,
    selectedRecommendation.suggestedShares,
    selectedRecommendation.recommendedShares,
    selectedRecommendation.positionSizeValue,
    selectedRecommendation.positionSize,
  ]);

  return {
    ...(company ? { company } : {}),
    ...(direction ? { direction } : {}),
    ...(entry !== undefined ? { entry } : {}),
    hasQuantity:
      hasStringOrNumber(selectedRecommendation.quantity) ||
      hasStringOrNumber(selectedRecommendation.shares) ||
      hasStringOrNumber(selectedRecommendation.suggestedShares) ||
      hasStringOrNumber(selectedRecommendation.recommendedShares) ||
      hasStringOrNumber(selectedRecommendation.positionSizeValue) ||
      hasStringOrNumber(selectedRecommendation.positionSize),
    hasTicker: Boolean(ticker),
    hasTradeSide: Boolean(direction),
    ...(quantity !== undefined ? { quantity } : {}),
    ...(ticker ? { ticker } : {}),
  };
}

function buildAdapterSummary(
  adapterResult: TureRecommendationHandoffSource,
): AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapperNormalizedInputSummary | null {
  const ticker = readNonEmptyString(adapterResult.ticker);
  const company =
    readNonEmptyString(adapterResult.companyName) ??
    readNonEmptyString(adapterResult.company_name) ??
    readNonEmptyString(adapterResult.instrumentDisplayName) ??
    readNonEmptyString(adapterResult.displayName);
  const direction =
    readNonEmptyString(adapterResult.direction) ??
    readNonEmptyString(adapterResult.side);
  const entry = firstSummaryValue([
    adapterResult.limitPrice,
    adapterResult.entryPriceValue,
    adapterResult.entryPrice,
    adapterResult.entryLowValue,
    adapterResult.entryHighValue,
    adapterResult.entry_low,
    adapterResult.entry_high,
  ]);
  const quantity = firstSummaryValue([
    adapterResult.quantity,
    adapterResult.shares,
    adapterResult.positionSizeValue,
    adapterResult.positionSize,
  ]);

  if (!ticker) {
    return null;
  }

  return {
    ...(company ? { company } : {}),
    ...(direction ? { direction } : {}),
    ...(entry !== undefined ? { entry } : {}),
    hasQuantity: quantity !== undefined,
    hasTicker: true,
    hasTradeSide: Boolean(direction),
    ...(quantity !== undefined ? { quantity } : {}),
    ticker,
  };
}

function resolveSourceMode(
  sourceLabel: BuildAvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapperInput["sourceLabel"],
  integrationDecision: AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationDecision,
): AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapperSourceMode {
  if (
    sourceLabel === "fixture_only" ||
    sourceLabel === "read_only_selected_recommendation_dev_preview" ||
    sourceLabel === "blocked"
  ) {
    return sourceLabel;
  }

  return integrationDecision.sourceMode;
}

export function buildAvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapper({
  derivePreviewState = true,
  integrationDecision,
  selectedRecommendation,
  simulateDerivedPreviewFailure = false,
  sourceLabel,
}: BuildAvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapperInput): AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapperState {
  if (selectedRecommendation == null) {
    return buildBaseState({
      canRenderReadOnlyPreview: false,
      label: "No selectedRecommendation wrapper input",
      reason:
        "No explicit selectedRecommendation-like input was provided. The wrapper skeleton keeps fixture fallback only, does not call the adapter, does not call the derived-preview builder, keeps controls disabled, and keeps the gate locked.",
      sourceMode: "fixture_only",
      status: "no_input",
    });
  }

  if (
    integrationDecision.status === "blocked" ||
    integrationDecision.sourceMode === "blocked"
  ) {
    return buildBaseState({
      canRenderReadOnlyPreview: false,
      label: "Adapter/derived-preview wrapper blocked",
      reason:
        "The explicit integration decision blocks read-only adapter/derived-preview wrapping. The wrapper skeleton does not call the adapter or derived-preview builder.",
      sourceMode: "blocked",
      status: "blocked",
    });
  }

  const normalizedInputSummary = buildSafeSummary(selectedRecommendation);

  if (!normalizedInputSummary?.hasTicker) {
    return buildBaseState({
      canRenderReadOnlyPreview: false,
      label: "Invalid selectedRecommendation wrapper input",
      normalizedInputSummary: normalizedInputSummary ?? undefined,
      reason:
        "The explicit selectedRecommendation-like input is missing a preview-safe ticker or symbol. The wrapper does not call the adapter or derived-preview builder.",
      sourceMode: "blocked",
      status: "invalid_input",
    });
  }

  const safeInputSummary = normalizedInputSummary;

  if (
    integrationDecision.status !== "integration_allowed" ||
    !integrationDecision.canNormalizeInput
  ) {
    return buildBaseState({
      canRenderReadOnlyPreview: false,
      label: "Adapter invocation rejected",
      normalizedInputSummary: safeInputSummary,
      reason:
        "The explicit integration decision does not allow static-fixture adapter normalization. The wrapper does not call the adapter, does not call the derived-preview builder, and does not produce preview state.",
      sourceMode: resolveSourceMode(sourceLabel, integrationDecision),
      status: "adapter_rejected",
    });
  }

  try {
    const adapterResult = adaptSelectedRecommendationToAvanzaHandoffSource(
      selectedRecommendation as AvanzaSelectedRecommendationAdapterInput,
    );
    const adapterSummary = buildAdapterSummary(adapterResult);

    if (!adapterSummary?.hasTicker) {
      return buildBaseState({
        canRenderReadOnlyPreview: false,
        label: "Adapter normalization rejected",
        normalizedInputSummary,
        reason:
          "The selectedRecommendation adapter did not return a preview-safe ticker. The wrapper keeps previewState null and does not call the derived-preview builder.",
        sourceMode: resolveSourceMode(sourceLabel, integrationDecision),
        status: "adapter_rejected",
      });
    }

    if (!derivePreviewState) {
      return buildBaseState({
        canRenderReadOnlyPreview: false,
        label: "Adapter normalized static fixture",
        normalizedInputSummary: adapterSummary,
        reason:
          "The pure wrapper normalized explicit static fixture input through the selectedRecommendation adapter. Derived-preview invocation is disabled for this fixture, previewState remains null, controls remain disabled, and the gate remains locked.",
        sourceMode: resolveSourceMode(sourceLabel, integrationDecision),
        status: "adapter_normalized_static_fixture",
      });
    }

    try {
      if (simulateDerivedPreviewFailure) {
        throw new Error("Fixture-only derived-preview failure");
      }

      const previewState = buildAvanzaSelectedRecommendationPreviewState({
        accountDisplayName: "Valentin Labs KF",
        orderMode: "Avancerad/Limit",
        readinessSummary: avanzaTradeReadOnlyReadinessSummaryFixture,
        selectedRecommendation: adapterResult,
        sourceMode:
          avanzaHandoffPreviewSourceModes.selected_recommendation_preview_only,
      });

      if (previewState.preActivationGate.gateStatus !== "locked") {
        return buildBaseState({
          canRenderReadOnlyPreview: false,
          label: "Derived preview rejected",
          normalizedInputSummary: adapterSummary,
          reason:
            "The static fixture derived-preview output did not keep the pre-activation gate locked. The wrapper rejects the preview state, keeps controls disabled, and keeps execution forbidden.",
          sourceMode: resolveSourceMode(sourceLabel, integrationDecision),
          status: "derived_preview_failed",
        });
      }

      return {
        canCallBridge: false,
        canExecute: false,
        canFetchLocalhost: false,
        canPoll: false,
        canRenderReadOnlyPreview: true,
        controlsEnabled: false,
        gateLocked: true,
        label: "Read-only preview ready from static fixture",
        normalizedInputSummary: adapterSummary,
        previewState,
        reason:
          "The pure wrapper normalized explicit static fixture input through the selectedRecommendation adapter and produced a read-only previewState through the derived-preview builder. This remains static-fixture-only, keeps controls disabled, keeps the gate locked, and does not enable handoff or execution.",
        sourceMode: resolveSourceMode(sourceLabel, integrationDecision),
        status: "read_only_preview_ready",
      };
    } catch {
      return buildBaseState({
        canRenderReadOnlyPreview: false,
        label: "Derived preview failed",
        normalizedInputSummary: adapterSummary,
        reason:
          "The derived-preview builder failed for explicit static fixture input. The wrapper keeps previewState null, keeps controls disabled, keeps the gate locked, and does not enable handoff or execution.",
        sourceMode: resolveSourceMode(sourceLabel, integrationDecision),
        status: "derived_preview_failed",
      });
    }
  } catch {
    return buildBaseState({
      canRenderReadOnlyPreview: false,
      label: "Adapter normalization rejected",
      normalizedInputSummary: safeInputSummary,
      reason:
        "The selectedRecommendation adapter rejected the explicit static fixture input. The wrapper keeps previewState null and does not call the derived-preview builder.",
      sourceMode: resolveSourceMode(sourceLabel, integrationDecision),
      status: "adapter_rejected",
    });
  }
}
