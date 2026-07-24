import type {
  AvanzaReadOnlySelectedRecommendationDerivationDecision,
} from "./avanza-read-only-selected-recommendation-derivation-decision";

export type AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationDecisionStatus =
  | "no_input"
  | "blocked"
  | "invalid_input"
  | "adapter_review_required"
  | "integration_allowed";

export type AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationSourceMode =
  | "fixture_only"
  | "read_only_selected_recommendation_dev_preview"
  | "blocked";

export type AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationDecision =
  {
    canCallBridge: false;
    canCallDerivedPreviewBuilder: boolean;
    canExecute: false;
    canFetchLocalhost: false;
    canNormalizeInput: boolean;
    canPoll: false;
    canRenderReadOnlyPreview: boolean;
    canReviewAdapter: boolean;
    canUseFixtureFallback: boolean;
    controlsEnabled: false;
    gateLocked: true;
    label: string;
    reason: string;
    sourceLabel: string;
    sourceMode: AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationSourceMode;
    status: AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationDecisionStatus;
  };

export type BuildAvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationDecisionInput =
  {
    derivationDecision: AvanzaReadOnlySelectedRecommendationDerivationDecision;
    integrationSourceLabel?: string | null;
    selectedRecommendation: unknown;
  };

function hasNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasPreviewIdentity(value: unknown) {
  if (!isRecord(value)) {
    return false;
  }

  return hasNonEmptyString(value.ticker) || hasNonEmptyString(value.symbol);
}

function baseDecision(
  input: Pick<
    AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationDecision,
    | "canCallDerivedPreviewBuilder"
    | "canNormalizeInput"
    | "canRenderReadOnlyPreview"
    | "canReviewAdapter"
    | "canUseFixtureFallback"
    | "label"
    | "reason"
    | "sourceLabel"
    | "sourceMode"
    | "status"
  >,
): AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationDecision {
  return {
    ...input,
    canCallBridge: false,
    canExecute: false,
    canFetchLocalhost: false,
    canPoll: false,
    controlsEnabled: false,
    gateLocked: true,
  };
}

export function buildAvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationDecision({
  derivationDecision,
  integrationSourceLabel,
  selectedRecommendation,
}: BuildAvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationDecisionInput): AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationDecision {
  const normalizedSourceLabel =
    integrationSourceLabel?.trim() ||
    "read_only_selected_recommendation_dev_preview";

  if (selectedRecommendation == null) {
    return baseDecision({
      canCallDerivedPreviewBuilder: false,
      canNormalizeInput: false,
      canRenderReadOnlyPreview: false,
      canReviewAdapter: false,
      canUseFixtureFallback: true,
      label: "No selectedRecommendation integration input",
      reason:
        "No explicit selectedRecommendation-like input was provided for adapter or derived-preview integration review. Fixture-only fallback remains available, controls stay disabled, and the gate stays locked.",
      sourceLabel: "fixture_only",
      sourceMode: "fixture_only",
      status: "no_input",
    });
  }

  if (derivationDecision.status !== "derivation_allowed") {
    return baseDecision({
      canCallDerivedPreviewBuilder: false,
      canNormalizeInput: false,
      canRenderReadOnlyPreview: false,
      canReviewAdapter: false,
      canUseFixtureFallback: derivationDecision.canUseFixtureFallback,
      label: "Adapter/derived-preview integration blocked",
      reason:
        "The read-only selectedRecommendation derivation decision does not allow adapter or derived-preview integration review.",
      sourceLabel: "blocked",
      sourceMode: "blocked",
      status: "blocked",
    });
  }

  if (!hasPreviewIdentity(selectedRecommendation)) {
    return baseDecision({
      canCallDerivedPreviewBuilder: false,
      canNormalizeInput: false,
      canRenderReadOnlyPreview: false,
      canReviewAdapter: false,
      canUseFixtureFallback: derivationDecision.canUseFixtureFallback,
      label: "Invalid selectedRecommendation integration input",
      reason:
        "The explicit selectedRecommendation-like input is missing a preview-safe ticker or symbol, so adapter and derived-preview integration remain blocked.",
      sourceLabel: normalizedSourceLabel,
      sourceMode: "blocked",
      status: "invalid_input",
    });
  }

  return baseDecision({
    canCallDerivedPreviewBuilder: false,
    canNormalizeInput: false,
    canRenderReadOnlyPreview: false,
    canReviewAdapter: true,
    canUseFixtureFallback: derivationDecision.canUseFixtureFallback,
    label: "Adapter/derived-preview review required",
    reason:
      "The derivation decision and explicit selectedRecommendation-like input are sufficient for future adapter review, but this model does not normalize input, call the derived-preview builder, derive real preview state, or render real preview state.",
    sourceLabel: normalizedSourceLabel,
    sourceMode: "read_only_selected_recommendation_dev_preview",
    status: "adapter_review_required",
  });
}

