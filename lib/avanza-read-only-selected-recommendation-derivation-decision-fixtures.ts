import {
  buildAvanzaReadOnlySelectedRecommendationDerivationDecision,
  type AvanzaReadOnlySelectedRecommendationDerivationDecision,
  type AvanzaReadOnlySelectedRecommendationDerivationDecisionStatus,
} from "./avanza-read-only-selected-recommendation-derivation-decision";
import {
  avanzaReadOnlySelectedRecommendationDevPreviewDefaultGuard,
  buildAvanzaReadOnlySelectedRecommendationDevPreviewGuard,
  type AvanzaReadOnlySelectedRecommendationDevPreviewGuardDecision,
} from "./avanza-read-only-selected-recommendation-dev-preview-guard";

export type AvanzaReadOnlySelectedRecommendationDerivationDecisionFixtureId =
  | "no_input"
  | "blocked_guard"
  | "invalid_input"
  | "derivation_allowed";

export type AvanzaReadOnlySelectedRecommendationDerivationDecisionFixture = {
  decision: AvanzaReadOnlySelectedRecommendationDerivationDecision;
  expectedState: AvanzaReadOnlySelectedRecommendationDerivationDecisionStatus;
  guardDecision: AvanzaReadOnlySelectedRecommendationDevPreviewGuardDecision;
  id: AvanzaReadOnlySelectedRecommendationDerivationDecisionFixtureId;
  label: string;
  selectedRecommendation?: unknown;
};

const blockedGuard = buildAvanzaReadOnlySelectedRecommendationDevPreviewGuard({
  environment: "production_forbidden",
});

const allowedGuard = buildAvanzaReadOnlySelectedRecommendationDevPreviewGuard({
  environment: "dev_only",
  explicitReadOnlyDevPreview: true,
});

const invalidSelectedRecommendation = {
  company: "Missing ticker",
};

const validSelectedRecommendation = {
  company: "Volvo",
  quantity: 10,
  ticker: "VOLV B",
};

export const avanzaReadOnlySelectedRecommendationDerivationDecisionFixtures: AvanzaReadOnlySelectedRecommendationDerivationDecisionFixture[] =
  [
    {
      decision: buildAvanzaReadOnlySelectedRecommendationDerivationDecision({
        guardDecision: avanzaReadOnlySelectedRecommendationDevPreviewDefaultGuard,
        selectedRecommendation: null,
      }),
      expectedState: "no_input",
      guardDecision: avanzaReadOnlySelectedRecommendationDevPreviewDefaultGuard,
      id: "no_input",
      label: "No selectedRecommendation input",
    },
    {
      decision: buildAvanzaReadOnlySelectedRecommendationDerivationDecision({
        guardDecision: blockedGuard,
        selectedRecommendation: validSelectedRecommendation,
      }),
      expectedState: "blocked",
      guardDecision: blockedGuard,
      id: "blocked_guard",
      label: "Blocked read-only derivation guard",
      selectedRecommendation: validSelectedRecommendation,
    },
    {
      decision: buildAvanzaReadOnlySelectedRecommendationDerivationDecision({
        guardDecision: allowedGuard,
        selectedRecommendation: invalidSelectedRecommendation,
      }),
      expectedState: "invalid_input",
      guardDecision: allowedGuard,
      id: "invalid_input",
      label: "Invalid selectedRecommendation input",
      selectedRecommendation: invalidSelectedRecommendation,
    },
    {
      decision: buildAvanzaReadOnlySelectedRecommendationDerivationDecision({
        guardDecision: allowedGuard,
        selectedRecommendation: validSelectedRecommendation,
        sourceLabel: "read_only_selected_recommendation_dev_preview",
      }),
      expectedState: "derivation_allowed",
      guardDecision: allowedGuard,
      id: "derivation_allowed",
      label: "Read-only derivation allowed model state",
      selectedRecommendation: validSelectedRecommendation,
    },
  ];

