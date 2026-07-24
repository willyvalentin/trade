export type AvanzaReadOnlySelectedRecommendationDevPreviewGuardStatus =
  | "hidden"
  | "read_only_dev_preview_allowed"
  | "blocked";

export type AvanzaReadOnlySelectedRecommendationDevPreviewGuardDecision = {
  canCallBridge: false;
  canDerivePreviewState: boolean;
  canExecute: false;
  canFetchLocalhost: false;
  canPoll: false;
  canReadRealSelectedRecommendation: boolean;
  canRenderReadOnlyPreview: boolean;
  canUseFixtureFallback: boolean;
  controlsEnabled: false;
  gateLocked: true;
  label: string;
  reason: string;
  status: AvanzaReadOnlySelectedRecommendationDevPreviewGuardStatus;
};

export type AvanzaReadOnlySelectedRecommendationDevPreviewGuardEnvironment =
  | "default"
  | "dev_only"
  | "production_forbidden";

export type BuildAvanzaReadOnlySelectedRecommendationDevPreviewGuardInput = {
  blockedReason?: string | null;
  environment?: AvanzaReadOnlySelectedRecommendationDevPreviewGuardEnvironment;
  explicitReadOnlyDevPreview?: boolean;
  forceBlocked?: boolean;
};

const hiddenDecision: AvanzaReadOnlySelectedRecommendationDevPreviewGuardDecision =
  {
    canCallBridge: false,
    canDerivePreviewState: false,
    canExecute: false,
    canFetchLocalhost: false,
    canPoll: false,
    canReadRealSelectedRecommendation: false,
    canRenderReadOnlyPreview: false,
    canUseFixtureFallback: true,
    controlsEnabled: false,
    gateLocked: true,
    label: "Read-only selectedRecommendation dev preview hidden",
    reason:
      "Default state keeps real selectedRecommendation preview hidden. Fixture-only fallback remains available, controls stay disabled, and the gate stays locked.",
    status: "hidden",
  };

export function buildAvanzaReadOnlySelectedRecommendationDevPreviewGuard({
  blockedReason,
  environment = "default",
  explicitReadOnlyDevPreview = false,
  forceBlocked = false,
}: BuildAvanzaReadOnlySelectedRecommendationDevPreviewGuardInput = {}): AvanzaReadOnlySelectedRecommendationDevPreviewGuardDecision {
  if (forceBlocked || environment === "production_forbidden") {
    return {
      ...hiddenDecision,
      label: "Read-only selectedRecommendation dev preview blocked",
      reason:
        blockedReason?.trim() ||
        "Read-only selectedRecommendation dev preview is blocked for this environment.",
      status: "blocked",
    };
  }

  if (environment === "dev_only" && explicitReadOnlyDevPreview) {
    return {
      canCallBridge: false,
      canDerivePreviewState: true,
      canExecute: false,
      canFetchLocalhost: false,
      canPoll: false,
      canReadRealSelectedRecommendation: true,
      canRenderReadOnlyPreview: true,
      canUseFixtureFallback: true,
      controlsEnabled: false,
      gateLocked: true,
      label: "Read-only selectedRecommendation dev preview allowed",
      reason:
        "Explicit dev-only guard may read real selectedRecommendation state for read-only preview derivation. Bridge calls, localhost fetches, polling, execution, enabled controls, and unlocked gates remain forbidden.",
      status: "read_only_dev_preview_allowed",
    };
  }

  return hiddenDecision;
}

export const avanzaReadOnlySelectedRecommendationDevPreviewDefaultGuard =
  buildAvanzaReadOnlySelectedRecommendationDevPreviewGuard();
