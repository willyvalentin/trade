import {
  buildAvanzaHandoffPackagePreview,
} from "@/lib/avanza-handoff-package-preview";
import {
  mapTureRecommendationToAvanzaHandoffInput,
} from "@/lib/avanza-ture-recommendation-handoff-mapper";
import {
  buildAvanzaSelectedRecommendationHandoffContract,
  summarizeAvanzaSelectedRecommendationHandoffContract,
} from "@/lib/avanza-selected-recommendation-handoff-contract";
import {
  avanzaTradeReadOnlyReadinessSummaryFixture,
} from "@/lib/avanza-read-only-readiness-fixtures";
import {
  avanzaHandoffPreviewActiveSourceMode,
} from "@/lib/avanza-handoff-preview-source-mode";
import {
  avanzaHandoffSafetyBoundarySummary,
} from "@/lib/avanza-handoff-safety-boundary-summary";
import {
  buildAvanzaHandoffPreActivationGate,
} from "@/lib/avanza-handoff-pre-activation-gate";

export const avanzaSelectedTureRecommendationFixture = {
  companyName: "GameStop",
  direction: "long",
  entryPriceValue: 21.98,
  id: "preview-gamestop-quantity-based",
  positionSizeValue: 1,
  ticker: "GME",
} as const;

export const avanzaGameStopHandoffPackagePreviewFixture =
  buildAvanzaHandoffPackagePreview(
    mapTureRecommendationToAvanzaHandoffInput(
      avanzaSelectedTureRecommendationFixture,
      {
        accountDisplayName: "Valentin Labs KF",
        orderMode: "Avancerad/Limit",
        readinessSummary: avanzaTradeReadOnlyReadinessSummaryFixture,
      },
    ),
  );

export const avanzaGameStopSelectedRecommendationHandoffContractFixture =
  buildAvanzaSelectedRecommendationHandoffContract({
    accountDisplayName: "Valentin Labs KF",
    orderMode: "Avancerad/Limit",
    readinessSummary: avanzaTradeReadOnlyReadinessSummaryFixture,
    selectedRecommendation: avanzaSelectedTureRecommendationFixture,
  });

export const avanzaGameStopSelectedRecommendationHandoffEligibilitySummaryFixture =
  summarizeAvanzaSelectedRecommendationHandoffContract(
    avanzaGameStopSelectedRecommendationHandoffContractFixture,
  );

export const avanzaGameStopHandoffPreviewSourceModeFixture =
  avanzaHandoffPreviewActiveSourceMode;

export const avanzaGameStopHandoffSafetyBoundarySummaryFixture =
  avanzaHandoffSafetyBoundarySummary;

export const avanzaGameStopHandoffPreActivationGateFixture =
  buildAvanzaHandoffPreActivationGate({
    contract: avanzaGameStopSelectedRecommendationHandoffContractFixture,
    eligibilitySummary:
      avanzaGameStopSelectedRecommendationHandoffEligibilitySummaryFixture,
    readinessSummary: avanzaTradeReadOnlyReadinessSummaryFixture,
    safetyBoundarySummary: avanzaGameStopHandoffSafetyBoundarySummaryFixture,
    sourceMode: avanzaGameStopHandoffPreviewSourceModeFixture,
  });
