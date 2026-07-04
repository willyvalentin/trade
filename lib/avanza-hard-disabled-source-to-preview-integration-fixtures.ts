import {
  buildAvanzaHardDisabledSourceToPreviewIntegration,
  type AvanzaHardDisabledSourceToPreviewIntegrationResult,
  type AvanzaHardDisabledSourceToPreviewIntegrationStatus,
  type BuildAvanzaHardDisabledSourceToPreviewIntegrationInput,
} from "./avanza-hard-disabled-source-to-preview-integration";
import {
  avanzaRealSelectedRecommendationReadOnlyDerivationFixtures,
} from "./avanza-real-selected-recommendation-read-only-derivation-fixtures";
import {
  avanzaSelectedRecommendationSourceExtractionFixtures,
} from "./avanza-selected-recommendation-source-extraction-fixtures";
import type {
  AvanzaSelectedRecommendationSourceExtractionResult,
} from "./avanza-selected-recommendation-source-extraction";

export type AvanzaHardDisabledSourceToPreviewIntegrationFixtureId =
  | "integration_disabled"
  | "source_not_ready"
  | "source_ready_preview_blocked"
  | "preview_model_ready_read_only"
  | "integration_blocked";

export type AvanzaHardDisabledSourceToPreviewIntegrationFixture = {
  expectedStatus: AvanzaHardDisabledSourceToPreviewIntegrationStatus;
  id: AvanzaHardDisabledSourceToPreviewIntegrationFixtureId;
  integrationInput: BuildAvanzaHardDisabledSourceToPreviewIntegrationInput;
  integrationResult: AvanzaHardDisabledSourceToPreviewIntegrationResult;
  label: string;
  sourceExtractionResult?: AvanzaSelectedRecommendationSourceExtractionResult;
};

function sourceFixtureById(
  id: (typeof avanzaSelectedRecommendationSourceExtractionFixtures)[number]["id"],
) {
  const fixture = avanzaSelectedRecommendationSourceExtractionFixtures.find(
    (item) => item.id === id,
  );

  if (!fixture) {
    throw new Error(`Missing source extraction fixture ${id}`);
  }

  return fixture;
}

function derivationFixtureById(
  id: (typeof avanzaRealSelectedRecommendationReadOnlyDerivationFixtures)[number]["id"],
) {
  const fixture =
    avanzaRealSelectedRecommendationReadOnlyDerivationFixtures.find(
      (item) => item.id === id,
    );

  if (!fixture) {
    throw new Error(`Missing real selectedRecommendation derivation fixture ${id}`);
  }

  return fixture;
}

const readySourceFixture = sourceFixtureById("source_ready_read_only");
const noSourceFixture = sourceFixtureById("no_source");
const blockedSourceFixture = sourceFixtureById("source_blocked");
const readyPreviewFixture = derivationFixtureById("read_only_preview_ready");

function buildFixture(
  id: AvanzaHardDisabledSourceToPreviewIntegrationFixtureId,
  label: string,
  expectedStatus: AvanzaHardDisabledSourceToPreviewIntegrationStatus,
  integrationInput: BuildAvanzaHardDisabledSourceToPreviewIntegrationInput,
): AvanzaHardDisabledSourceToPreviewIntegrationFixture {
  return {
    expectedStatus,
    id,
    integrationInput,
    integrationResult:
      buildAvanzaHardDisabledSourceToPreviewIntegration(integrationInput),
    label,
    ...(integrationInput.sourceExtractionResult
      ? { sourceExtractionResult: integrationInput.sourceExtractionResult }
      : {}),
  };
}

export const avanzaHardDisabledSourceToPreviewIntegrationFixtures: AvanzaHardDisabledSourceToPreviewIntegrationFixture[] =
  [
    buildFixture(
      "integration_disabled",
      "Hard-disabled integration disabled",
      "integration_disabled",
      {
        integrationEnabled: false,
        sourceExtractionResult: readySourceFixture.extractionResult,
        sourceName: "hard_disabled_integration_disabled_fixture",
      },
    ),
    buildFixture(
      "source_not_ready",
      "Source not ready for hard-disabled integration",
      "source_not_ready",
      {
        integrationEnabled: true,
        sourceExtractionResult: noSourceFixture.extractionResult,
        sourceName: "hard_disabled_source_not_ready_fixture",
      },
    ),
    buildFixture(
      "source_ready_preview_blocked",
      "Ready source with blocked preview input",
      "source_ready_preview_blocked",
      {
        integrationEnabled: true,
        selectedRecommendationCandidate: {
          companyName: "Missing ticker fixture",
        },
        sourceExtractionResult: readySourceFixture.extractionResult,
        sourceName: "hard_disabled_source_ready_preview_blocked_fixture",
      },
    ),
    buildFixture(
      "preview_model_ready_read_only",
      "Ready source with passive read-only preview model",
      "preview_model_ready_read_only",
      {
        integrationEnabled: true,
        selectedRecommendationCandidate:
          readyPreviewFixture.selectedRecommendationLikeInput,
        sourceExtractionResult: readySourceFixture.extractionResult,
        sourceName: "hard_disabled_preview_model_ready_fixture",
      },
    ),
    buildFixture(
      "integration_blocked",
      "Blocked source for hard-disabled integration",
      "integration_blocked",
      {
        integrationEnabled: true,
        sourceExtractionResult: blockedSourceFixture.extractionResult,
        sourceName: "hard_disabled_integration_blocked_fixture",
      },
    ),
  ];
