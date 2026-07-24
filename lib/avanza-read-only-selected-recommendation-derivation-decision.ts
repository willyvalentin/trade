import type {
  AvanzaReadOnlySelectedRecommendationDevPreviewGuardDecision,
} from "./avanza-read-only-selected-recommendation-dev-preview-guard";

export type AvanzaReadOnlySelectedRecommendationDerivationDecisionStatus =
  | "no_input"
  | "blocked"
  | "invalid_input"
  | "derivation_allowed";

export type AvanzaReadOnlySelectedRecommendationDerivationSourceMode =
  | "fixture_only"
  | "read_only_selected_recommendation_dev_preview"
  | "blocked";

export type AvanzaReadOnlySelectedRecommendationDerivationDecision = {
  canCallBridge: false;
  canDerivePreviewState: boolean;
  canExecute: false;
  canFetchLocalhost: false;
  canPoll: false;
  canReadInput: boolean;
  canRenderReadOnlyPreview: boolean;
  canUseFixtureFallback: boolean;
  controlsEnabled: false;
  gateLocked: true;
  label: string;
  reason: string;
  sourceLabel: string;
  sourceMode: AvanzaReadOnlySelectedRecommendationDerivationSourceMode;
  status: AvanzaReadOnlySelectedRecommendationDerivationDecisionStatus;
};

export type BuildAvanzaReadOnlySelectedRecommendationDerivationDecisionInput = {
  guardDecision: AvanzaReadOnlySelectedRecommendationDevPreviewGuardDecision;
  selectedRecommendation: unknown;
  sourceLabel?: string | null;
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
    AvanzaReadOnlySelectedRecommendationDerivationDecision,
    | "canDerivePreviewState"
    | "canReadInput"
    | "canRenderReadOnlyPreview"
    | "canUseFixtureFallback"
    | "label"
    | "reason"
    | "sourceLabel"
    | "sourceMode"
    | "status"
  >,
): AvanzaReadOnlySelectedRecommendationDerivationDecision {
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

export function buildAvanzaReadOnlySelectedRecommendationDerivationDecision({
  guardDecision,
  selectedRecommendation,
  sourceLabel,
}: BuildAvanzaReadOnlySelectedRecommendationDerivationDecisionInput): AvanzaReadOnlySelectedRecommendationDerivationDecision {
  const normalizedSourceLabel =
    sourceLabel?.trim() || "read_only_selected_recommendation_dev_preview";

  if (selectedRecommendation == null) {
    return baseDecision({
      canDerivePreviewState: false,
      canReadInput: false,
      canRenderReadOnlyPreview: false,
      canUseFixtureFallback: true,
      label: "No selectedRecommendation input",
      reason:
        "No explicit selectedRecommendation input was provided. Fixture-only fallback remains available, controls stay disabled, and the gate stays locked.",
      sourceLabel: "fixture_only",
      sourceMode: "fixture_only",
      status: "no_input",
    });
  }

  if (guardDecision.status !== "read_only_dev_preview_allowed") {
    return baseDecision({
      canDerivePreviewState: false,
      canReadInput: false,
      canRenderReadOnlyPreview: false,
      canUseFixtureFallback: guardDecision.canUseFixtureFallback,
      label: "Read-only selectedRecommendation derivation blocked",
      reason:
        "The read-only selectedRecommendation dev preview guard does not allow input reads or preview derivation.",
      sourceLabel: "blocked",
      sourceMode: "blocked",
      status: "blocked",
    });
  }

  if (!hasPreviewIdentity(selectedRecommendation)) {
    return baseDecision({
      canDerivePreviewState: false,
      canReadInput: guardDecision.canReadRealSelectedRecommendation,
      canRenderReadOnlyPreview: false,
      canUseFixtureFallback: guardDecision.canUseFixtureFallback,
      label: "Invalid selectedRecommendation input",
      reason:
        "The explicit selectedRecommendation input is missing a preview-safe ticker or symbol. Read-only preview derivation remains blocked.",
      sourceLabel: normalizedSourceLabel,
      sourceMode: "blocked",
      status: "invalid_input",
    });
  }

  return baseDecision({
    canDerivePreviewState: true,
    canReadInput: true,
    canRenderReadOnlyPreview: true,
    canUseFixtureFallback: guardDecision.canUseFixtureFallback,
    label: "Read-only selectedRecommendation derivation allowed",
    reason:
      "Explicit dev-only guard and preview-safe selectedRecommendation input allow read-only derivation in model state only. Controls stay disabled and the gate stays locked.",
    sourceLabel: normalizedSourceLabel,
    sourceMode: "read_only_selected_recommendation_dev_preview",
    status: "derivation_allowed",
  });
}

