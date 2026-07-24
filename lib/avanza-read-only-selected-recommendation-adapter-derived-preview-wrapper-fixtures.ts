import {
  avanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationDecisionFixtures,
} from "./avanza-read-only-selected-recommendation-adapter-derived-preview-integration-decision-fixtures";
import type {
  AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationDecision,
} from "./avanza-read-only-selected-recommendation-adapter-derived-preview-integration-decision";
import {
  buildAvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapper,
  type AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapperState,
  type AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapperStatus,
} from "./avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper";

export type AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapperFixtureId =
  | "no_input"
  | "blocked"
  | "invalid_input"
  | "adapter_rejected"
  | "adapter_normalized_static_fixture"
  | "derived_preview_failed"
  | "read_only_preview_ready";

export type AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapperFixture =
  {
    expectedState: AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapperStatus;
    id: AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapperFixtureId;
    integrationDecision: AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationDecision;
    label: string;
    selectedRecommendation?: unknown;
    wrapperResult: AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapperState;
  };

function integrationDecisionFixtureById(
  id:
    | "no_input"
    | "blocked_derivation_decision"
    | "invalid_input"
    | "adapter_review_required"
    | "integration_allowed",
) {
  const fixture =
    avanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationDecisionFixtures.find(
      (item) => item.id === id,
    );

  if (!fixture) {
    throw new Error(`Missing adapter/derived-preview integration fixture ${id}`);
  }

  return fixture;
}

const noInputIntegrationFixture = integrationDecisionFixtureById("no_input");
const blockedIntegrationFixture = integrationDecisionFixtureById(
  "blocked_derivation_decision",
);
const adapterReviewIntegrationFixture = integrationDecisionFixtureById(
  "adapter_review_required",
);
const integrationAllowedFixture = integrationDecisionFixtureById(
  "integration_allowed",
);

const validSelectedRecommendation = {
  company: "Volvo",
  entryPrice: 245.5,
  quantity: 10,
  side: "buy",
  ticker: "VOLV B",
};

const invalidSelectedRecommendation = {
  company: "Missing ticker",
  quantity: 10,
  side: "buy",
};

export const avanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapperFixtures: AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapperFixture[] =
  [
    {
      expectedState: "no_input",
      id: "no_input",
      integrationDecision: noInputIntegrationFixture.decision,
      label: "No selectedRecommendation wrapper input",
      wrapperResult:
        buildAvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapper({
          integrationDecision: noInputIntegrationFixture.decision,
          selectedRecommendation: null,
        }),
    },
    {
      expectedState: "blocked",
      id: "blocked",
      integrationDecision: blockedIntegrationFixture.decision,
      label: "Blocked integration decision",
      selectedRecommendation: validSelectedRecommendation,
      wrapperResult:
        buildAvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapper({
          integrationDecision: blockedIntegrationFixture.decision,
          selectedRecommendation: validSelectedRecommendation,
        }),
    },
    {
      expectedState: "invalid_input",
      id: "invalid_input",
      integrationDecision: integrationAllowedFixture.decision,
      label: "Invalid selectedRecommendation wrapper input",
      selectedRecommendation: invalidSelectedRecommendation,
      wrapperResult:
        buildAvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapper({
          integrationDecision: integrationAllowedFixture.decision,
          selectedRecommendation: invalidSelectedRecommendation,
        }),
    },
    {
      expectedState: "adapter_rejected",
      id: "adapter_rejected",
      integrationDecision: adapterReviewIntegrationFixture.decision,
      label: "Adapter invocation rejected by review gate",
      selectedRecommendation: validSelectedRecommendation,
      wrapperResult:
        buildAvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapper({
          integrationDecision: adapterReviewIntegrationFixture.decision,
          selectedRecommendation: validSelectedRecommendation,
          sourceLabel: "read_only_selected_recommendation_dev_preview",
        }),
    },
    {
      expectedState: "adapter_normalized_static_fixture",
      id: "adapter_normalized_static_fixture",
      integrationDecision: integrationAllowedFixture.decision,
      label: "Adapter normalized static fixture",
      selectedRecommendation: validSelectedRecommendation,
      wrapperResult:
        buildAvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapper({
          derivePreviewState: false,
          integrationDecision: integrationAllowedFixture.decision,
          selectedRecommendation: validSelectedRecommendation,
          sourceLabel: "read_only_selected_recommendation_dev_preview",
        }),
    },
    {
      expectedState: "derived_preview_failed",
      id: "derived_preview_failed",
      integrationDecision: integrationAllowedFixture.decision,
      label: "Derived preview failure remains safe",
      selectedRecommendation: validSelectedRecommendation,
      wrapperResult:
        buildAvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapper({
          integrationDecision: integrationAllowedFixture.decision,
          selectedRecommendation: validSelectedRecommendation,
          simulateDerivedPreviewFailure: true,
          sourceLabel: "read_only_selected_recommendation_dev_preview",
        }),
    },
    {
      expectedState: "read_only_preview_ready",
      id: "read_only_preview_ready",
      integrationDecision: integrationAllowedFixture.decision,
      label: "Read-only preview ready static fixture",
      selectedRecommendation: validSelectedRecommendation,
      wrapperResult:
        buildAvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapper({
          integrationDecision: integrationAllowedFixture.decision,
          selectedRecommendation: validSelectedRecommendation,
          sourceLabel: "read_only_selected_recommendation_dev_preview",
        }),
    },
  ];
