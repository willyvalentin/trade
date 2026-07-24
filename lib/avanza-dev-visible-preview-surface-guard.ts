import {
  avanzaDevOnlyPreviewEnablementDefaultState,
  type AvanzaDevOnlyPreviewEnablementState,
} from "@/lib/avanza-dev-only-preview-enablement-state";

export type AvanzaDevVisiblePreviewSurfaceGuardStatus =
  | "hidden"
  | "visible_dev_only_allowed"
  | "blocked";

export type AvanzaDevVisiblePreviewSurfaceGuardDecision = {
  canCallBridge: false;
  canExecute: false;
  canFetchLocalhost: false;
  canReadSelectedRecommendationForPreview: boolean;
  canRenderVisiblePreviewSurface: boolean;
  label: string;
  reason: string;
  status: AvanzaDevVisiblePreviewSurfaceGuardStatus;
};

export type BuildAvanzaDevVisiblePreviewSurfaceGuardInput = {
  enablementState?: AvanzaDevOnlyPreviewEnablementState;
  forceBlocked?: boolean;
  blockedReason?: string | null;
};

const hiddenDecision: AvanzaDevVisiblePreviewSurfaceGuardDecision = {
  canCallBridge: false,
  canExecute: false,
  canFetchLocalhost: false,
  canReadSelectedRecommendationForPreview: false,
  canRenderVisiblePreviewSurface: false,
  label: "Dev-only selectedRecommendation preview surface hidden",
  reason:
    "Default state keeps the visible selectedRecommendation preview surface hidden. The Trade UI remains on static fixture data.",
  status: "hidden",
};

export function buildAvanzaDevVisiblePreviewSurfaceGuard({
  blockedReason,
  enablementState = avanzaDevOnlyPreviewEnablementDefaultState,
  forceBlocked = false,
}: BuildAvanzaDevVisiblePreviewSurfaceGuardInput = {}): AvanzaDevVisiblePreviewSurfaceGuardDecision {
  if (forceBlocked || enablementState.overallStatus === "blocked") {
    return {
      ...hiddenDecision,
      label: "Dev-only selectedRecommendation preview surface blocked",
      reason:
        blockedReason?.trim() ||
        enablementState.reason ||
        "Visible selectedRecommendation preview surface is blocked.",
      status: "blocked",
    };
  }

  if (
    enablementState.overallStatus === "candidate_for_dev_preview" &&
    enablementState.canRenderSelectedRecommendationPreview &&
    enablementState.integrationGuard.status === "preview_only_allowed" &&
    enablementState.previewFlagConfig.environmentScope === "dev_test_only"
  ) {
    return {
      canCallBridge: false,
      canExecute: false,
      canFetchLocalhost: false,
      canReadSelectedRecommendationForPreview: true,
      canRenderVisiblePreviewSurface: true,
      label: "Dev-only selectedRecommendation preview surface allowed",
      reason:
        "Explicit dev/test preview state may render a visible passive selectedRecommendation preview surface. Bridge calls, localhost fetches, execution, enabled controls, and unlocked gates remain forbidden.",
      status: "visible_dev_only_allowed",
    };
  }

  return hiddenDecision;
}

export const avanzaDevVisiblePreviewSurfaceDefaultGuard =
  buildAvanzaDevVisiblePreviewSurfaceGuard();
