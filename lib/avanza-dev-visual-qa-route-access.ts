import {
  avanzaDevVisiblePreviewSurfaceDefaultGuard,
  type AvanzaDevVisiblePreviewSurfaceGuardDecision,
} from "@/lib/avanza-dev-visible-preview-surface-guard";

export type AvanzaDevVisualQaRouteAccessStatus =
  | "hidden"
  | "dev_route_allowed"
  | "blocked";

export type AvanzaDevVisualQaRouteAccessDecision = {
  canCallBridge: false;
  canExecute: false;
  canExposeRoute: boolean;
  canFetchLocalhost: false;
  canLinkFromMainNavigation: false;
  canRenderFixtureGallery: boolean;
  canUseRealSelectedRecommendationState: false;
  label: string;
  reason: string;
  status: AvanzaDevVisualQaRouteAccessStatus;
};

export type BuildAvanzaDevVisualQaRouteAccessInput = {
  blockedReason?: string | null;
  forceBlocked?: boolean;
  visiblePreviewSurfaceGuard?: AvanzaDevVisiblePreviewSurfaceGuardDecision;
};

const hiddenDecision: AvanzaDevVisualQaRouteAccessDecision = {
  canCallBridge: false,
  canExecute: false,
  canExposeRoute: false,
  canFetchLocalhost: false,
  canLinkFromMainNavigation: false,
  canRenderFixtureGallery: false,
  canUseRealSelectedRecommendationState: false,
  label: "Dev-only visual QA route hidden",
  reason:
    "Default state keeps the visual QA route hidden. The fixture gallery is not exposed and selectedRecommendation preview remains disabled by default.",
  status: "hidden",
};

export function buildAvanzaDevVisualQaRouteAccess({
  blockedReason,
  forceBlocked = false,
  visiblePreviewSurfaceGuard = avanzaDevVisiblePreviewSurfaceDefaultGuard,
}: BuildAvanzaDevVisualQaRouteAccessInput = {}): AvanzaDevVisualQaRouteAccessDecision {
  if (forceBlocked || visiblePreviewSurfaceGuard.status === "blocked") {
    return {
      ...hiddenDecision,
      label: "Dev-only visual QA route blocked",
      reason:
        blockedReason?.trim() ||
        visiblePreviewSurfaceGuard.reason ||
        "Dev-only visual QA route access is blocked.",
      status: "blocked",
    };
  }

  if (
    visiblePreviewSurfaceGuard.status === "visible_dev_only_allowed" &&
    visiblePreviewSurfaceGuard.canRenderVisiblePreviewSurface
  ) {
    return {
      canCallBridge: false,
      canExecute: false,
      canExposeRoute: true,
      canFetchLocalhost: false,
      canLinkFromMainNavigation: false,
      canRenderFixtureGallery: true,
      canUseRealSelectedRecommendationState: false,
      label: "Dev-only visual QA route allowed",
      reason:
        "Explicit dev-only visible preview surface guard may expose a fixture-only visual QA route. Main navigation links, real selectedRecommendation state, bridge calls, localhost fetches, and execution remain forbidden.",
      status: "dev_route_allowed",
    };
  }

  return hiddenDecision;
}

export const avanzaDevVisualQaRouteAccessDefaultDecision =
  buildAvanzaDevVisualQaRouteAccess();
