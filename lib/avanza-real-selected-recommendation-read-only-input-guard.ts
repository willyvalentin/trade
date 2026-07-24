export type AvanzaRealSelectedRecommendationReadOnlyInputGuardStatus =
  | "hidden"
  | "blocked"
  | "read_only_input_allowed";

export type AvanzaRealSelectedRecommendationReadOnlyInputSourceMode =
  | "fixture_only"
  | "real_selected_recommendation_read_only"
  | "blocked";

export type AvanzaRealSelectedRecommendationReadOnlyInputGuardDecision = {
  canCallBridge: false;
  canExecute: false;
  canFetchLocalhost: false;
  canPoll: false;
  canProceedToReadOnlyDerivation: boolean;
  canReadRealSelectedRecommendation: boolean;
  canUseFixtureFallback: boolean;
  canValidateInput: boolean;
  controlsEnabled: false;
  gateLocked: true;
  label: string;
  reason: string;
  sourceLabel: string;
  sourceMode: AvanzaRealSelectedRecommendationReadOnlyInputSourceMode;
  status: AvanzaRealSelectedRecommendationReadOnlyInputGuardStatus;
};

export type AvanzaRealSelectedRecommendationReadOnlyInputEnvironment =
  | "default"
  | "dev_read_only"
  | "production_forbidden";

export type BuildAvanzaRealSelectedRecommendationReadOnlyInputGuardInput = {
  blockedReason?: string | null;
  environment?: AvanzaRealSelectedRecommendationReadOnlyInputEnvironment;
  explicitReadOnlyInput?: boolean;
  forceBlocked?: boolean;
  sourceLabel?: string | null;
};

function baseDecision(
  input: Pick<
    AvanzaRealSelectedRecommendationReadOnlyInputGuardDecision,
    | "canProceedToReadOnlyDerivation"
    | "canReadRealSelectedRecommendation"
    | "canUseFixtureFallback"
    | "canValidateInput"
    | "label"
    | "reason"
    | "sourceLabel"
    | "sourceMode"
    | "status"
  >,
): AvanzaRealSelectedRecommendationReadOnlyInputGuardDecision {
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

export function buildAvanzaRealSelectedRecommendationReadOnlyInputGuard({
  blockedReason,
  environment = "default",
  explicitReadOnlyInput = false,
  forceBlocked = false,
  sourceLabel,
}: BuildAvanzaRealSelectedRecommendationReadOnlyInputGuardInput = {}): AvanzaRealSelectedRecommendationReadOnlyInputGuardDecision {
  const normalizedSourceLabel = sourceLabel?.trim() || "fixture_only";

  if (forceBlocked || environment === "production_forbidden") {
    return baseDecision({
      canProceedToReadOnlyDerivation: false,
      canReadRealSelectedRecommendation: false,
      canUseFixtureFallback: true,
      canValidateInput: false,
      label: "Real selectedRecommendation read-only input blocked",
      reason:
        blockedReason?.trim() ||
        "Real selectedRecommendation read-only input is blocked for this explicit configuration. Fixture-only fallback remains available, controls stay disabled, and the gate stays locked.",
      sourceLabel: "blocked",
      sourceMode: "blocked",
      status: "blocked",
    });
  }

  if (environment === "dev_read_only" && explicitReadOnlyInput) {
    return baseDecision({
      canProceedToReadOnlyDerivation: true,
      canReadRealSelectedRecommendation: true,
      canUseFixtureFallback: true,
      canValidateInput: true,
      label: "Real selectedRecommendation read-only input allowed",
      reason:
        "Explicit dev/read-only configuration may accept real selectedRecommendation input for validation and read-only derivation in model state only. Bridge calls, localhost fetches, polling, execution, enabled controls, and unlocked gates remain forbidden.",
      sourceLabel:
        sourceLabel?.trim() || "real_selected_recommendation_read_only",
      sourceMode: "real_selected_recommendation_read_only",
      status: "read_only_input_allowed",
    });
  }

  return baseDecision({
    canProceedToReadOnlyDerivation: false,
    canReadRealSelectedRecommendation: false,
    canUseFixtureFallback: true,
    canValidateInput: false,
    label: "Real selectedRecommendation read-only input hidden",
    reason:
      "Default state keeps real selectedRecommendation input hidden. Fixture-only fallback remains available, controls stay disabled, and the gate stays locked.",
    sourceLabel: normalizedSourceLabel,
    sourceMode: "fixture_only",
    status: "hidden",
  });
}

export const avanzaRealSelectedRecommendationReadOnlyInputDefaultGuard =
  buildAvanzaRealSelectedRecommendationReadOnlyInputGuard();
