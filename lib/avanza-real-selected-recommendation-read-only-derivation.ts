import {
  avanzaHandoffPreviewSourceModes,
} from "./avanza-handoff-preview-source-mode";
import {
  avanzaRealSelectedRecommendationReadOnlyInputDefaultGuard,
  type AvanzaRealSelectedRecommendationReadOnlyInputGuardDecision,
} from "./avanza-real-selected-recommendation-read-only-input-guard";
import {
  buildAvanzaRealSelectedRecommendationReadOnlyInputValidation,
  type AvanzaRealSelectedRecommendationReadOnlyInputSummary,
} from "./avanza-real-selected-recommendation-read-only-input-validation";
import {
  adaptSelectedRecommendationToAvanzaHandoffSource,
  type AvanzaSelectedRecommendationAdapterInput,
} from "./avanza-selected-recommendation-adapter";
import {
  buildAvanzaPreviewStateFromSelectedRecommendation,
} from "./avanza-selected-recommendation-derived-preview-state";
import type {
  AvanzaSelectedRecommendationPreviewState,
} from "./avanza-selected-recommendation-preview-state";
import type {
  TureRecommendationHandoffSource,
} from "./avanza-ture-recommendation-handoff-mapper";

export type AvanzaRealSelectedRecommendationReadOnlyDerivationStatus =
  | "no_input"
  | "guard_blocked"
  | "invalid_input"
  | "adapter_rejected"
  | "derived_preview_failed"
  | "read_only_preview_ready";

export type AvanzaRealSelectedRecommendationReadOnlyDerivationSourceMode =
  | "none"
  | "blocked"
  | "real_selected_recommendation_read_only";

export type AvanzaRealSelectedRecommendationReadOnlyDerivationSummary =
  AvanzaRealSelectedRecommendationReadOnlyInputSummary & {
    company?: string;
    hasQuantity: boolean;
    hasTicker: boolean;
    hasTradeSide: boolean;
  };

export type AvanzaRealSelectedRecommendationReadOnlyDerivationResult = {
  canCallBridge: false;
  canExecute: false;
  canFetchLocalhost: false;
  canPoll: false;
  canProceedToHandoff: false;
  canRenderReadOnlyPreview: boolean;
  controlsEnabled: false;
  gateLocked: true;
  label: string;
  normalizedInputSummary?: AvanzaRealSelectedRecommendationReadOnlyDerivationSummary;
  previewState?: AvanzaSelectedRecommendationPreviewState;
  reason: string;
  sourceLabel: string;
  sourceMode: AvanzaRealSelectedRecommendationReadOnlyDerivationSourceMode;
  status: AvanzaRealSelectedRecommendationReadOnlyDerivationStatus;
};

export type BuildAvanzaRealSelectedRecommendationReadOnlyDerivationInput = {
  guardDecision?: AvanzaRealSelectedRecommendationReadOnlyInputGuardDecision;
  selectedRecommendationLikeInput?: unknown;
  sourceLabel?: string | null;
};

function baseResult(
  input: Pick<
    AvanzaRealSelectedRecommendationReadOnlyDerivationResult,
    | "canRenderReadOnlyPreview"
    | "label"
    | "normalizedInputSummary"
    | "previewState"
    | "reason"
    | "sourceLabel"
    | "sourceMode"
    | "status"
  >,
): AvanzaRealSelectedRecommendationReadOnlyDerivationResult {
  return {
    ...input,
    canCallBridge: false,
    canExecute: false,
    canFetchLocalhost: false,
    canPoll: false,
    canProceedToHandoff: false,
    controlsEnabled: false,
    gateLocked: true,
  };
}

function readNonEmptyString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;
}

function hasValue(value: unknown) {
  return (
    (typeof value === "number" && Number.isFinite(value)) ||
    (typeof value === "string" && value.trim().length > 0)
  );
}

function buildAdapterSummary(
  validationSummary: AvanzaRealSelectedRecommendationReadOnlyInputSummary,
  adapterResult: TureRecommendationHandoffSource,
): AvanzaRealSelectedRecommendationReadOnlyDerivationSummary | null {
  const ticker = readNonEmptyString(adapterResult.ticker);
  const direction = readNonEmptyString(adapterResult.direction);

  if (!ticker || !direction) {
    return null;
  }

  const company =
    readNonEmptyString(adapterResult.companyName) ??
    readNonEmptyString(adapterResult.company_name) ??
    readNonEmptyString(adapterResult.displayName) ??
    readNonEmptyString(adapterResult.instrumentDisplayName);

  return {
    ...validationSummary,
    ...(company ? { company } : {}),
    direction,
    hasQuantity:
      hasValue(adapterResult.quantity) ||
      hasValue(adapterResult.shares) ||
      hasValue(adapterResult.positionSize) ||
      hasValue(adapterResult.positionSizeValue),
    hasTicker: true,
    hasTradeSide: true,
    ticker,
  };
}

function isBuySide(summary: AvanzaRealSelectedRecommendationReadOnlyInputSummary) {
  const direction = summary.direction?.toLowerCase();
  const action = summary.action?.toLowerCase();

  return direction === "buy" || direction === "long" || action === "buy";
}

export function buildAvanzaRealSelectedRecommendationReadOnlyDerivation({
  guardDecision = avanzaRealSelectedRecommendationReadOnlyInputDefaultGuard,
  selectedRecommendationLikeInput,
  sourceLabel,
}: BuildAvanzaRealSelectedRecommendationReadOnlyDerivationInput = {}): AvanzaRealSelectedRecommendationReadOnlyDerivationResult {
  const resolvedSourceLabel =
    sourceLabel?.trim() ||
    guardDecision.sourceLabel ||
    "real_selected_recommendation_read_only";
  const validation = buildAvanzaRealSelectedRecommendationReadOnlyInputValidation({
    guardDecision,
    input: selectedRecommendationLikeInput,
  });

  if (validation.status === "no_input") {
    return baseResult({
      canRenderReadOnlyPreview: false,
      label: "No real selectedRecommendation input",
      reason:
        "No explicit selectedRecommendation-like input was provided. The read-only derivation helper returns no preview state, keeps controls disabled, and keeps the gate locked.",
      sourceLabel: resolvedSourceLabel,
      sourceMode: "none",
      status: "no_input",
    });
  }

  if (validation.status === "guard_blocked") {
    return baseResult({
      canRenderReadOnlyPreview: false,
      label: "Read-only selectedRecommendation derivation blocked",
      reason:
        "The read-only input guard blocks real selectedRecommendation derivation. The helper does not call adapter normalization or derived preview output.",
      sourceLabel: resolvedSourceLabel,
      sourceMode: "blocked",
      status: "guard_blocked",
    });
  }

  if (
    validation.status === "invalid_input" ||
    !validation.normalizedInputSummary
  ) {
    return baseResult({
      canRenderReadOnlyPreview: false,
      label: "Invalid real selectedRecommendation input",
      reason:
        "The explicit selectedRecommendation-like input did not pass read-only validation. The helper does not call adapter normalization or derived preview output.",
      sourceLabel: resolvedSourceLabel,
      sourceMode: "blocked",
      status: "invalid_input",
    });
  }

  if (!isBuySide(validation.normalizedInputSummary)) {
    return baseResult({
      canRenderReadOnlyPreview: false,
      label: "Adapter normalization rejected",
      normalizedInputSummary: {
        ...validation.normalizedInputSummary,
        hasQuantity: Boolean(validation.normalizedInputSummary.quantity),
        hasTicker: Boolean(validation.normalizedInputSummary.ticker),
        hasTradeSide: Boolean(validation.normalizedInputSummary.direction),
      },
      reason:
        "The validated selectedRecommendation-like input is not a buy-side preview candidate. The helper rejects adapter normalization, keeps controls disabled, and keeps the gate locked.",
      sourceLabel: resolvedSourceLabel,
      sourceMode: "real_selected_recommendation_read_only",
      status: "adapter_rejected",
    });
  }

  try {
    const adapterResult = adaptSelectedRecommendationToAvanzaHandoffSource(
      selectedRecommendationLikeInput as AvanzaSelectedRecommendationAdapterInput,
    );
    const normalizedInputSummary = buildAdapterSummary(
      validation.normalizedInputSummary,
      adapterResult,
    );

    if (!normalizedInputSummary) {
      return baseResult({
        canRenderReadOnlyPreview: false,
        label: "Adapter normalization rejected",
        reason:
          "The selectedRecommendation adapter did not return preview-safe ticker and trade-side fields. The helper returns no preview state.",
        sourceLabel: resolvedSourceLabel,
        sourceMode: "real_selected_recommendation_read_only",
        status: "adapter_rejected",
      });
    }

    const previewState = buildAvanzaPreviewStateFromSelectedRecommendation({
      selectedRecommendation:
        selectedRecommendationLikeInput as AvanzaSelectedRecommendationAdapterInput,
      sourceMode:
        avanzaHandoffPreviewSourceModes.selected_recommendation_preview_only,
    });

    if (
      previewState.displayState !== "preview_ready_locked" ||
      previewState.preActivationGate.gateStatus !== "locked"
    ) {
      return baseResult({
        canRenderReadOnlyPreview: false,
        label: "Derived preview failed",
        normalizedInputSummary,
        reason:
          "The derived preview did not produce a locked ready preview state. The helper returns no preview state, keeps controls disabled, and keeps the gate locked.",
        sourceLabel: resolvedSourceLabel,
        sourceMode: "real_selected_recommendation_read_only",
        status: "derived_preview_failed",
      });
    }

    return baseResult({
      canRenderReadOnlyPreview: true,
      label: "Read-only selectedRecommendation preview ready",
      normalizedInputSummary,
      previewState,
      reason:
        "The explicit selectedRecommendation-like input passed read-only validation, adapter normalization, and derived preview output. The result is passive only: controls stay disabled, handoff remains forbidden, and the gate stays locked.",
      sourceLabel: resolvedSourceLabel,
      sourceMode: "real_selected_recommendation_read_only",
      status: "read_only_preview_ready",
    });
  } catch {
    return baseResult({
      canRenderReadOnlyPreview: false,
      label: "Derived preview failed",
      normalizedInputSummary: {
        ...validation.normalizedInputSummary,
        hasQuantity: Boolean(validation.normalizedInputSummary.quantity),
        hasTicker: Boolean(validation.normalizedInputSummary.ticker),
        hasTradeSide: Boolean(validation.normalizedInputSummary.direction),
      },
      reason:
        "The adapter or derived preview output failed for the explicit read-only input. The helper returns no preview state and keeps all safety limits enforced.",
      sourceLabel: resolvedSourceLabel,
      sourceMode: "real_selected_recommendation_read_only",
      status: "derived_preview_failed",
    });
  }
}
