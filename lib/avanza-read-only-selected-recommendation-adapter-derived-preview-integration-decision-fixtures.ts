import {
  buildAvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationDecision,
  type AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationDecision,
  type AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationDecisionStatus,
} from "./avanza-read-only-selected-recommendation-adapter-derived-preview-integration-decision";
import {
  buildAvanzaReadOnlySelectedRecommendationDerivationDecision,
  type AvanzaReadOnlySelectedRecommendationDerivationDecision,
} from "./avanza-read-only-selected-recommendation-derivation-decision";
import {
  avanzaReadOnlySelectedRecommendationDevPreviewDefaultGuard,
  buildAvanzaReadOnlySelectedRecommendationDevPreviewGuard,
} from "./avanza-read-only-selected-recommendation-dev-preview-guard";

export type AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationDecisionFixtureId =
  | "no_input"
  | "blocked_derivation_decision"
  | "invalid_input"
  | "adapter_review_required"
  | "integration_allowed";

export type AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationDecisionFixture =
  {
    decision: AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationDecision;
    derivationDecision: AvanzaReadOnlySelectedRecommendationDerivationDecision;
    expectedState: AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationDecisionStatus;
    id: AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationDecisionFixtureId;
    label: string;
    selectedRecommendation?: unknown;
  };

const allowedGuard = buildAvanzaReadOnlySelectedRecommendationDevPreviewGuard({
  environment: "dev_only",
  explicitReadOnlyDevPreview: true,
});

const blockedGuard = buildAvanzaReadOnlySelectedRecommendationDevPreviewGuard({
  environment: "production_forbidden",
});

const validSelectedRecommendation = {
  company: "Volvo",
  quantity: 10,
  ticker: "VOLV B",
};

const invalidSelectedRecommendation = {
  company: "Missing ticker",
};

const noInputDerivationDecision =
  buildAvanzaReadOnlySelectedRecommendationDerivationDecision({
    guardDecision: avanzaReadOnlySelectedRecommendationDevPreviewDefaultGuard,
    selectedRecommendation: null,
  });

const blockedDerivationDecision =
  buildAvanzaReadOnlySelectedRecommendationDerivationDecision({
    guardDecision: blockedGuard,
    selectedRecommendation: validSelectedRecommendation,
  });

const allowedDerivationDecision =
  buildAvanzaReadOnlySelectedRecommendationDerivationDecision({
    guardDecision: allowedGuard,
    selectedRecommendation: validSelectedRecommendation,
    sourceLabel: "read_only_selected_recommendation_dev_preview",
  });

const adapterReviewRequiredDecision =
  buildAvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationDecision({
    derivationDecision: allowedDerivationDecision,
    integrationSourceLabel: "read_only_selected_recommendation_dev_preview",
    selectedRecommendation: validSelectedRecommendation,
  });

const integrationAllowedDecision: AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationDecision =
  {
    ...adapterReviewRequiredDecision,
    canCallDerivedPreviewBuilder: true,
    canNormalizeInput: true,
    canRenderReadOnlyPreview: true,
    label: "Adapter/derived-preview integration allowed model state",
    reason:
      "Future model-only state after adapter and derived-preview safety review. This fixture does not call the adapter, does not call the derived-preview builder, does not derive real preview state, and keeps controls disabled with the gate locked.",
    status: "integration_allowed",
  };

export const avanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationDecisionFixtures: AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationDecisionFixture[] =
  [
    {
      decision:
        buildAvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationDecision({
          derivationDecision: noInputDerivationDecision,
          selectedRecommendation: null,
        }),
      derivationDecision: noInputDerivationDecision,
      expectedState: "no_input",
      id: "no_input",
      label: "No selectedRecommendation integration input",
    },
    {
      decision:
        buildAvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationDecision({
          derivationDecision: blockedDerivationDecision,
          selectedRecommendation: validSelectedRecommendation,
        }),
      derivationDecision: blockedDerivationDecision,
      expectedState: "blocked",
      id: "blocked_derivation_decision",
      label: "Blocked derivation decision",
      selectedRecommendation: validSelectedRecommendation,
    },
    {
      decision:
        buildAvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationDecision({
          derivationDecision: allowedDerivationDecision,
          selectedRecommendation: invalidSelectedRecommendation,
        }),
      derivationDecision: allowedDerivationDecision,
      expectedState: "invalid_input",
      id: "invalid_input",
      label: "Invalid selectedRecommendation integration input",
      selectedRecommendation: invalidSelectedRecommendation,
    },
    {
      decision: adapterReviewRequiredDecision,
      derivationDecision: allowedDerivationDecision,
      expectedState: "adapter_review_required",
      id: "adapter_review_required",
      label: "Adapter review required model state",
      selectedRecommendation: validSelectedRecommendation,
    },
    {
      decision: integrationAllowedDecision,
      derivationDecision: allowedDerivationDecision,
      expectedState: "integration_allowed",
      id: "integration_allowed",
      label: "Integration allowed future model state",
      selectedRecommendation: validSelectedRecommendation,
    },
  ];

