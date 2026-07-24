export type AvanzaSelectedRecommendationPreviewIntegrationGuardStatus =
  | "disabled"
  | "preview_only_allowed"
  | "blocked";

export type AvanzaSelectedRecommendationPreviewIntegrationGuardInput = {
  explicitPreviewOnlyFlag?: boolean;
  forceBlocked?: boolean;
  blockedReason?: string | null;
};

export type AvanzaSelectedRecommendationPreviewIntegrationGuardDecision = {
  canCallBridge: false;
  canExecute: false;
  canFetchLocalhost: false;
  canReadSelectedRecommendation: boolean;
  canRenderPreviewOnlyState: boolean;
  canSwitchSourceModeToSelectedRecommendationPreviewOnly: boolean;
  canUseDerivedPreviewStateHelper: boolean;
  label: string;
  reason: string;
  status: AvanzaSelectedRecommendationPreviewIntegrationGuardStatus;
};

const disabledDecision: AvanzaSelectedRecommendationPreviewIntegrationGuardDecision =
  {
    canCallBridge: false,
    canExecute: false,
    canFetchLocalhost: false,
    canReadSelectedRecommendation: false,
    canRenderPreviewOnlyState: false,
    canSwitchSourceModeToSelectedRecommendationPreviewOnly: false,
    canUseDerivedPreviewStateHelper: false,
    label: "Selected recommendation preview integration disabled",
    reason:
      "Trade UI selectedRecommendation derivation is disabled. The Avanza preview remains sourced from static fixture data only.",
    status: "disabled",
  };

export function buildAvanzaSelectedRecommendationPreviewIntegrationGuard(
  input: AvanzaSelectedRecommendationPreviewIntegrationGuardInput = {},
): AvanzaSelectedRecommendationPreviewIntegrationGuardDecision {
  if (input.forceBlocked) {
    return {
      ...disabledDecision,
      label: "Selected recommendation preview integration blocked",
      reason:
        input.blockedReason?.trim() ||
        "Selected recommendation preview integration is blocked.",
      status: "blocked",
    };
  }

  if (input.explicitPreviewOnlyFlag) {
    return {
      canCallBridge: false,
      canExecute: false,
      canFetchLocalhost: false,
      canReadSelectedRecommendation: true,
      canRenderPreviewOnlyState: true,
      canSwitchSourceModeToSelectedRecommendationPreviewOnly: true,
      canUseDerivedPreviewStateHelper: true,
      label: "Selected recommendation preview-only derivation allowed",
      reason:
        "Explicit preview-only guard allows read-only selectedRecommendation derivation. Bridge calls, local fetches, execution, and active handoff remain forbidden; controls must stay disabled and the pre-activation gate must stay locked.",
      status: "preview_only_allowed",
    };
  }

  return disabledDecision;
}

export const avanzaSelectedRecommendationPreviewIntegrationDefaultGuard =
  buildAvanzaSelectedRecommendationPreviewIntegrationGuard();
