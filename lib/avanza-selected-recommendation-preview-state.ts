import type {
  AvanzaBridgeReadinessSummary,
} from "@/lib/avanza-bridge-readiness-checklist";
import {
  buildAvanzaHandoffPackagePreview,
  type AvanzaHandoffPackagePreview,
} from "@/lib/avanza-handoff-package-preview";
import {
  buildAvanzaHandoffPreActivationGate,
  type AvanzaHandoffPreActivationGate,
  type AvanzaHandoffPreActivationSourceModeInput,
} from "@/lib/avanza-handoff-pre-activation-gate";
import {
  avanzaHandoffSafetyBoundarySummary,
  type AvanzaHandoffSafetyBoundarySummary,
} from "@/lib/avanza-handoff-safety-boundary-summary";
import {
  buildAvanzaSelectedRecommendationHandoffContract,
  summarizeAvanzaSelectedRecommendationHandoffContract,
  type AvanzaSelectedRecommendationHandoffContract,
  type AvanzaSelectedRecommendationHandoffEligibilitySummary,
} from "@/lib/avanza-selected-recommendation-handoff-contract";
import {
  mapTureRecommendationToAvanzaHandoffInput,
  type TureRecommendationHandoffSource,
} from "@/lib/avanza-ture-recommendation-handoff-mapper";

export type AvanzaSelectedRecommendationPreviewDisplayState =
  | "no_selection"
  | "blocked"
  | "advisory"
  | "preview_ready_locked";

export type BuildAvanzaSelectedRecommendationPreviewStateInput = {
  accountDisplayName?: string | null;
  orderMode?: "Avancerad/Limit" | string | null;
  readinessSummary: AvanzaBridgeReadinessSummary;
  safetyBoundarySummary?: AvanzaHandoffSafetyBoundarySummary;
  selectedRecommendation: TureRecommendationHandoffSource | null;
  sourceMode: AvanzaHandoffPreActivationSourceModeInput;
};

export type AvanzaSelectedRecommendationPreviewState = {
  displayState: AvanzaSelectedRecommendationPreviewDisplayState;
  eligibilitySummary: AvanzaSelectedRecommendationHandoffEligibilitySummary;
  packagePreview: AvanzaHandoffPackagePreview | null;
  preActivationGate: AvanzaHandoffPreActivationGate;
  safetyBoundarySummary: AvanzaHandoffSafetyBoundarySummary;
  selectedRecommendationContract: AvanzaSelectedRecommendationHandoffContract;
  sourceMode: AvanzaHandoffPreActivationSourceModeInput;
};

function deriveDisplayState({
  eligibilitySummary,
  packagePreview,
  selectedRecommendation,
}: {
  eligibilitySummary: AvanzaSelectedRecommendationHandoffEligibilitySummary;
  packagePreview: AvanzaHandoffPackagePreview | null;
  selectedRecommendation: TureRecommendationHandoffSource | null;
}): AvanzaSelectedRecommendationPreviewDisplayState {
  if (!selectedRecommendation) {
    return "no_selection";
  }

  if (eligibilitySummary.status === "blocked" || packagePreview?.blocked) {
    return "blocked";
  }

  if (
    eligibilitySummary.status === "advisory_gaps" ||
    (packagePreview?.advisoryNotes.length ?? 0) > 3
  ) {
    return "advisory";
  }

  return "preview_ready_locked";
}

export function buildAvanzaSelectedRecommendationPreviewState({
  accountDisplayName,
  orderMode,
  readinessSummary,
  safetyBoundarySummary = avanzaHandoffSafetyBoundarySummary,
  selectedRecommendation,
  sourceMode,
}: BuildAvanzaSelectedRecommendationPreviewStateInput): AvanzaSelectedRecommendationPreviewState {
  const packagePreview = selectedRecommendation
    ? buildAvanzaHandoffPackagePreview(
        mapTureRecommendationToAvanzaHandoffInput(selectedRecommendation, {
          accountDisplayName,
          orderMode,
          readinessSummary,
        }),
      )
    : null;
  const selectedRecommendationContract =
    buildAvanzaSelectedRecommendationHandoffContract({
      accountDisplayName,
      orderMode,
      readinessSummary,
      selectedRecommendation,
    });
  const eligibilitySummary =
    summarizeAvanzaSelectedRecommendationHandoffContract(
      selectedRecommendationContract,
    );
  const preActivationGate = buildAvanzaHandoffPreActivationGate({
    contract: selectedRecommendationContract,
    eligibilitySummary,
    readinessSummary,
    safetyBoundarySummary,
    sourceMode,
  });

  return {
    displayState: deriveDisplayState({
      eligibilitySummary,
      packagePreview,
      selectedRecommendation,
    }),
    eligibilitySummary,
    packagePreview,
    preActivationGate,
    safetyBoundarySummary,
    selectedRecommendationContract,
    sourceMode,
  };
}
