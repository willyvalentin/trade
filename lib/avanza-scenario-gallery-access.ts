export type AvanzaScenarioGalleryAccessStatus =
  | "disabled"
  | "dev_only_allowed"
  | "blocked";

export type BuildAvanzaScenarioGalleryAccessInput = {
  devOnlyGalleryFlag?: boolean;
  blockedReason?: string | null;
};

export type AvanzaScenarioGalleryAccessDecision = {
  accessStatus: AvanzaScenarioGalleryAccessStatus;
  canCallBridge: false;
  canExecute: false;
  canFetchLocalhost: false;
  canRenderGallery: boolean;
  canUseRealSelectedRecommendationState: false;
  label: string;
  reason: string;
};

const disabledDecision: AvanzaScenarioGalleryAccessDecision = {
  accessStatus: "disabled",
  canCallBridge: false,
  canExecute: false,
  canFetchLocalhost: false,
  canRenderGallery: false,
  canUseRealSelectedRecommendationState: false,
  label: "Scenario gallery access disabled",
  reason:
    "The fixture-only scenario gallery is not exposed by default. No route or app render is enabled.",
};

export const avanzaScenarioGalleryDefaultAccessDecision = disabledDecision;

export function buildAvanzaScenarioGalleryAccessDecision({
  blockedReason,
  devOnlyGalleryFlag = false,
}: BuildAvanzaScenarioGalleryAccessInput = {}): AvanzaScenarioGalleryAccessDecision {
  if (blockedReason?.trim()) {
    return {
      accessStatus: "blocked",
      canCallBridge: false,
      canExecute: false,
      canFetchLocalhost: false,
      canRenderGallery: false,
      canUseRealSelectedRecommendationState: false,
      label: "Scenario gallery access blocked",
      reason: blockedReason.trim(),
    };
  }

  if (!devOnlyGalleryFlag) {
    return disabledDecision;
  }

  return {
    accessStatus: "dev_only_allowed",
    canCallBridge: false,
    canExecute: false,
    canFetchLocalhost: false,
    canRenderGallery: true,
    canUseRealSelectedRecommendationState: false,
    label: "Scenario gallery dev-only access allowed",
    reason:
      "Explicit dev-only fixture gallery access is allowed for isolated visual QA only. Static scenarios remain the only data source.",
  };
}
