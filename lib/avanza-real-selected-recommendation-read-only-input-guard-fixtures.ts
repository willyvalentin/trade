import {
  buildAvanzaRealSelectedRecommendationReadOnlyInputGuard,
  type AvanzaRealSelectedRecommendationReadOnlyInputGuardDecision,
  type AvanzaRealSelectedRecommendationReadOnlyInputGuardStatus,
  type BuildAvanzaRealSelectedRecommendationReadOnlyInputGuardInput,
} from "./avanza-real-selected-recommendation-read-only-input-guard";

export type AvanzaRealSelectedRecommendationReadOnlyInputGuardFixtureId =
  | "hidden_default"
  | "blocked_production_forbidden"
  | "read_only_input_allowed";

export type AvanzaRealSelectedRecommendationReadOnlyInputGuardFixture = {
  expectedState: AvanzaRealSelectedRecommendationReadOnlyInputGuardStatus;
  guardConfig: BuildAvanzaRealSelectedRecommendationReadOnlyInputGuardInput;
  guardDecision: AvanzaRealSelectedRecommendationReadOnlyInputGuardDecision;
  id: AvanzaRealSelectedRecommendationReadOnlyInputGuardFixtureId;
  label: string;
};

const hiddenDefaultGuardConfig: BuildAvanzaRealSelectedRecommendationReadOnlyInputGuardInput =
  {};

const blockedProductionForbiddenGuardConfig: BuildAvanzaRealSelectedRecommendationReadOnlyInputGuardInput =
  {
    blockedReason:
      "Real selectedRecommendation read-only input is blocked for production-forbidden scope.",
    environment: "production_forbidden",
  };

const readOnlyInputAllowedGuardConfig: BuildAvanzaRealSelectedRecommendationReadOnlyInputGuardInput =
  {
    environment: "dev_read_only",
    explicitReadOnlyInput: true,
    sourceLabel: "real selectedRecommendation read-only input fixture",
  };

export const avanzaRealSelectedRecommendationReadOnlyInputGuardFixtures: AvanzaRealSelectedRecommendationReadOnlyInputGuardFixture[] =
  [
    {
      expectedState: "hidden",
      guardConfig: hiddenDefaultGuardConfig,
      guardDecision: buildAvanzaRealSelectedRecommendationReadOnlyInputGuard(
        hiddenDefaultGuardConfig,
      ),
      id: "hidden_default",
      label: "Default hidden real selectedRecommendation read-only input",
    },
    {
      expectedState: "blocked",
      guardConfig: blockedProductionForbiddenGuardConfig,
      guardDecision: buildAvanzaRealSelectedRecommendationReadOnlyInputGuard(
        blockedProductionForbiddenGuardConfig,
      ),
      id: "blocked_production_forbidden",
      label: "Blocked production-forbidden real selectedRecommendation read-only input",
    },
    {
      expectedState: "read_only_input_allowed",
      guardConfig: readOnlyInputAllowedGuardConfig,
      guardDecision: buildAvanzaRealSelectedRecommendationReadOnlyInputGuard(
        readOnlyInputAllowedGuardConfig,
      ),
      id: "read_only_input_allowed",
      label:
        "Allowed real selectedRecommendation read-only input model-only/read-only state",
    },
  ];
